import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, ArrowRight, Clock, TrendingUp, Zap } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { supabase as sb } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
  activeRequests: number
  overdueRequests: number
  unassigned: number
  mrrUsd: number
  mrrInr: number
  creditsOutstanding: number
  payoutUsd: number
  payoutInr: number
}

interface AdminAction {
  id: string
  admin_id: string | null
  action_type: string
  target_type: string
  target_id: string | null
  notes: string | null
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
function formatInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

const ACTION_LABELS: Record<string, string> = {
  editor_swap:       "Editor swapped",
  auto_close:        "Request auto-closed",
  editor_reassign:   "Editor reassigned",
  credit_adjust:     "Credits adjusted",
  config_update:     "Config updated",
  force_approve:     "Force approved",
  refund_credits:    "Credits refunded",
  extend_deadline:   "Deadline extended",
  suspend_client:    "Client suspended",
  suspend_editor:    "Editor suspended",
  payout_sent:       "Payout sent",
  impersonate_start: "Impersonation started",
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  alert,
  link,
}: {
  label: string
  value: string
  sub?: string
  alert?: string
  link?: string
}) {
  const card = (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#FF5F15]/20 transition-colors"
    >
      <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">{label}</p>
      <p className="font-heading text-3xl font-bold text-[#FF5F15]">{value}</p>
      {sub && <p className="text-xs text-[#9CA3AF] mt-2">{sub}</p>}
      {alert && (
        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5">
          <AlertTriangle size={10} />
          {alert}
        </div>
      )}
      {link && (
        <div className="flex items-center gap-1 text-xs text-[#FF5F15] mt-3 hover:underline">
          <span>View</span>
          <ArrowRight size={11} />
        </div>
      )}
    </motion.div>
  )
  return link ? <Link to={link}>{card}</Link> : card
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminHome() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<AdminAction[]>([])

  useEffect(() => {
    loadAll()
    const ch = sb
      .channel("admin-actions-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_actions" }, () => loadActivity())
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadStats(), loadActivity()])
    setLoading(false)
  }

  async function loadStats() {
    const now = new Date().toISOString()
    const weekStart = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

    const [
      { data: active },
      { data: unassigned },
      { data: overdue },
      { data: subsUsd },
      { data: subsInr },
      { data: payoutsUsd },
      { data: payoutsInr },
    ] = await Promise.all([
      supabase.from("requests").select("id", { count: "exact" }).in("status", ["pending_match","matched","in_progress","delivered","in_revision"]),
      supabase.from("requests").select("id", { count: "exact" }).eq("status", "pending_match"),
      supabase.from("requests").select("id", { count: "exact" }).lt("due_at", now).not("status", "in", '("approved","abandoned")'),
      supabase.from("subscriptions").select("amount_paid, credits_remaining").eq("currency", "USD").eq("status", "active"),
      supabase.from("subscriptions").select("amount_paid, credits_remaining").eq("currency", "INR").eq("status", "active"),
      supabase.from("editor_payouts").select("amount").eq("currency", "USD").eq("status", "pending").gte("created_at", weekStart),
      supabase.from("editor_payouts").select("amount").eq("currency", "INR").eq("status", "pending").gte("created_at", weekStart),
    ])

    const mrrUsd = (subsUsd ?? []).reduce((s: number, r: {amount_paid: number}) => s + r.amount_paid, 0)
    const mrrInr = (subsInr ?? []).reduce((s: number, r: {amount_paid: number}) => s + r.amount_paid, 0)
    const credits = [...(subsUsd ?? []), ...(subsInr ?? [])].reduce((s: number, r: {credits_remaining: number}) => s + r.credits_remaining, 0)
    const pUsd = (payoutsUsd ?? []).reduce((s: number, r: {amount: number}) => s + r.amount, 0)
    const pInr = (payoutsInr ?? []).reduce((s: number, r: {amount: number}) => s + r.amount, 0)

    setStats({
      activeRequests: (active as {id: string}[])?.length ?? 0,
      overdueRequests: (overdue as {id: string}[])?.length ?? 0,
      unassigned: (unassigned as {id: string}[])?.length ?? 0,
      mrrUsd,
      mrrInr,
      creditsOutstanding: credits,
      payoutUsd: pUsd,
      payoutInr: pInr,
    })
  }

  async function loadActivity() {
    const { data } = await supabase
      .from("admin_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
    setActivity((data as AdminAction[]) ?? [])
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Platform Overview</h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Live stats — refreshes on data changes</p>
      </motion.div>

      {/* ── Overdue alert banner ── */}
      <AnimatePresence>
        {stats && stats.overdueRequests > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#FF5F15]/10 border border-[#FF5F15]/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-[#FF5F15] shrink-0" />
              <p className="text-sm font-semibold text-[#FF5F15]">
                {stats.overdueRequests} request{stats.overdueRequests > 1 ? "s" : ""} are overdue
              </p>
            </div>
            <Link
              to="/admin/requests"
              className="flex items-center gap-1 text-xs font-semibold text-[#FF5F15] hover:underline shrink-0"
            >
              View Overdue <ArrowRight size={12} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4 stat cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 animate-pulse space-y-3">
              <div className="h-3 w-20 bg-[#2A2A2A] rounded" />
              <div className="h-8 w-24 bg-[#2A2A2A] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Requests"
            value={String(stats?.activeRequests ?? 0)}
            alert={stats?.overdueRequests ? `${stats.overdueRequests} overdue` : undefined}
            link="/admin/requests"
          />
          <StatCard
            label="Unassigned"
            value={String(stats?.unassigned ?? 0)}
            sub={stats?.unassigned ? "Needs attention" : "Queue clear"}
            alert={stats?.unassigned ? "Assign Now" : undefined}
            link="/admin/matching"
          />
          <StatCard
            label="MRR"
            value={formatUsd(stats?.mrrUsd ?? 0)}
            sub={`INR ${formatInr(stats?.mrrInr ?? 0)}`}
          />
          <StatCard
            label="Credits Outstanding"
            value={(stats?.creditsOutstanding ?? 0).toLocaleString()}
            sub="Delivery liability (credits)"
          />
        </div>
      )}

      {/* ── Payout due this week ── */}
      <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">Payout Due This Week</p>
          <Link to="/admin/payouts" className="flex items-center gap-1 text-xs text-[#FF5F15] hover:underline">
            Manage <ArrowRight size={11} />
          </Link>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">USD</p>
            <p className="font-heading text-2xl font-bold text-[#FF5F15]">{formatUsd(stats?.payoutUsd ?? 0)}</p>
          </div>
          <div className="w-px bg-[#2A2A2A]" />
          <div>
            <p className="text-xs text-[#9CA3AF] mb-1">INR</p>
            <p className="font-heading text-2xl font-bold text-[#FF5F15]">{formatInr(stats?.payoutInr ?? 0)}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Recent activity ── */}
      <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">Recent Activity</p>
          <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
            <Zap size={10} className="text-[#FF5F15]" /> Live
          </span>
        </div>
        <div className="divide-y divide-[#2A2A2A]">
          {activity.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] text-center py-8">No admin actions yet.</p>
          ) : (
            <AnimatePresence initial={false}>
              {activity.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 px-5 py-3"
                >
                  <div className="w-6 h-6 rounded-full bg-[#FF5F15]/10 border border-[#FF5F15]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp size={10} className="text-[#FF5F15]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F9FAFB]">
                      {ACTION_LABELS[a.action_type] ?? a.action_type}
                    </p>
                    {a.notes && (
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">{a.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] shrink-0">
                    <Clock size={9} />
                    {getRelativeTime(a.created_at)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
