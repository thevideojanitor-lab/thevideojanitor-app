import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, ArrowLeftRight, ArrowRight, Inbox, Play, PlusCircle, X } from "lucide-react"
import { staggerContainer, fadeUp } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { useRequestsStore } from "@/stores/requestsStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { usePricingStore } from "@/stores/pricingStore"
import { supabase } from "@/lib/supabase"
import StatusBadge from "@/components/StatusBadge"
import CountdownTimer from "@/components/CountdownTimer"
import SwapEditorModal from "@/components/SwapEditorModal"
import type { Request } from "@/lib/supabase"

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

const ACTIVE_STATUSES = ["pending_match", "matched", "in_progress", "in_revision", "delivered"]

interface EditorInfo {
  display_name: string | null
  rating: number | null
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <div className="bg-input border border-border rounded-xl px-5 py-4 flex items-center gap-5">
      <div className="h-5 w-20 bg-border rounded-full animate-pulse" />
      <div className="h-4 w-40 bg-border rounded animate-pulse" />
      <div className="flex-1" />
      <div className="h-8 w-16 bg-border rounded-lg animate-pulse" />
    </div>
  )
}

// ── Delivered strip: the one thing that needs the client right now ───────────

function ReadyStrip({ req, editor }: { req: Request; editor?: EditorInfo }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col sm:flex-row sm:items-center gap-4 bg-input border border-[rgba(59,130,246,0.3)] rounded-2xl p-5"
    >
      <div className="w-14 h-14 rounded-xl bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.3)] flex items-center justify-center text-info shrink-0">
        <Play size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={req.status} pulse />
          <span className="text-xs text-muted-foreground capitalize">{req.edit_type} edit</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {editor?.display_name ?? "Your editor"} delivered {req.delivered_at ? getRelativeTime(req.delivered_at) : "recently"}
          {" · "}{3 - (req.revision_round ?? 0)} revision round{3 - (req.revision_round ?? 0) === 1 ? "" : "s"} left
        </p>
      </div>
      <Link to={`/dashboard/requests/${req.id}`} className="shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-primary/90 transition-colors"
        >
          Review Edit
          <ArrowRight size={15} />
        </motion.button>
      </Link>
    </motion.div>
  )
}

// ── In-progress row ───────────────────────────────────────────────────────────

function RequestRow({ req, editor, onSwap }: {
  req: Request
  editor?: EditorInfo
  onSwap: (r: Request) => void
}) {
  const isPending = req.status === "pending_match" || req.status === "matched"
  const canSwap = !!req.editor_id && !["approved", "abandoned"].includes(req.status)
  const initials = editor?.display_name
    ? editor.display_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -1 }}
      className="bg-input border border-border rounded-xl px-5 py-4 hover:border-primary/25 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
        <StatusBadge status={req.status} />

        <div className="min-w-0 md:w-48">
          <p className="text-sm font-medium text-foreground capitalize truncate">
            {req.edit_type} edit · {(req.aspect_ratios ?? []).join(" + ") || "9:16"}
          </p>
          <p className="text-xs text-muted-foreground">
            Submitted {getRelativeTime(req.submitted_at)} · <span className="text-primary font-semibold">{req.credits_cost} cr</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
            req.editor_id ? "bg-card text-foreground" : "bg-input border border-dashed border-surface text-muted-foreground"
          }`}>
            {req.editor_id ? initials : "?"}
          </div>
          <div className="min-w-0">
            {isPending ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse shrink-0" />
                Finding your editor…
              </p>
            ) : (
              <>
                <p className="text-xs font-semibold text-foreground truncate">
                  {editor?.display_name ?? "Editor assigned"}
                </p>
                {editor?.rating != null && (
                  <p className="text-[10px] text-muted-foreground">★ {Number(editor.rating).toFixed(1)}</p>
                )}
              </>
            )}
          </div>
          {canSwap && (
            <button
              onClick={() => onSwap(req)}
              title="Swap editor"
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors shrink-0 ml-1"
            >
              <ArrowLeftRight size={11} />
              Swap
            </button>
          )}
        </div>

        {req.due_at && !isPending && (
          <div className="text-left md:text-right shrink-0">
            <CountdownTimer dueAt={req.due_at} />
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">until due</p>
          </div>
        )}

        <Link
          to={`/dashboard/requests/${req.id}`}
          className="shrink-0 border border-border text-foreground text-xs font-medium rounded-lg px-4 py-2 hover:bg-card transition-colors text-center"
        >
          Open
        </Link>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div variants={fadeUp} className="text-center py-16 px-6">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Inbox size={28} className="text-primary" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Ready for your first edit?</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
        Submit your footage and brief. We'll match you with a vetted editor in minutes.
      </p>
      <Link to="/dashboard/submit">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="bg-primary text-background font-semibold rounded-lg px-6 py-3 text-sm hover:bg-primary-hover transition-colors"
        >
          Submit Your First Edit
        </motion.button>
      </Link>
    </motion.div>
  )
}

// ── Subscription types ────────────────────────────────────────────────────────

interface SubState {
  status: "active" | "past_due" | "cancelled" | "trialing" | null
  renews_at: string | null
  plan: string | null
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { user } = useAuthStore()
  const { activeRequests, pastRequests, loading, refresh } = useRequestsStore()
  const { balance, total } = useCreditsStore()
  const { config } = usePricingStore()

  const [sub, setSub] = useState<SubState>({ status: null, renews_at: null, plan: null })
  const [editors, setEditors] = useState<Record<string, EditorInfo>>({})
  const [swapTarget, setSwapTarget] = useState<Request | null>(null)
  const [lowCreditsDismissed, setLowCreditsDismissed] = useState(
    () => sessionStorage.getItem("low_credits_dismissed") === "1"
  )

  const maxActive = (config?.rules as { max_active_requests?: number })?.max_active_requests ?? 2
  const activeCount = activeRequests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length
  const isPastDue = sub.status === "past_due"
  const isCancelled = sub.status === "cancelled"
  const isBlocked = isPastDue || isCancelled || balance === 0
  const isLowCredits = !isBlocked && total > 0 && balance < total * 0.2

  useEffect(() => {
    if (!user?.id) return
    refresh(user.id)
    loadSubscription(user.id)
  }, [user?.id])

  // Resolve assigned editors' names (clients can read assigned profiles per RLS)
  useEffect(() => {
    const ids = [...new Set(activeRequests.map((r) => r.editor_id).filter(Boolean))] as string[]
    const missing = ids.filter((id) => !(id in editors))
    if (missing.length === 0) return
    void (async () => {
      const { data } = await supabase
        .from("editor_profiles")
        .select("user_id, display_name, rating")
        .in("user_id", missing)
      if (data) {
        setEditors((prev) => ({
          ...prev,
          ...Object.fromEntries(data.map((e) => [e.user_id, { display_name: e.display_name, rating: e.rating }])),
        }))
      }
    })()
  }, [activeRequests])

  async function loadSubscription(clientId: string) {
    // Prefer the active row — a stale 'trialing' checkout must never shadow it.
    const { data } = await supabase
      .from("subscriptions")
      .select("status, renews_at, plan")
      .eq("client_id", clientId)
      .in("status", ["active", "past_due", "cancelled", "trialing"])
      .order("created_at", { ascending: false })
    const rows = data ?? []
    const best =
      rows.find((s) => s.status === "active") ??
      rows.find((s) => s.status === "past_due") ??
      rows[0]
    if (best) setSub({ status: best.status as SubState["status"], renews_at: best.renews_at, plan: best.plan })
  }

  function dismissLowCredits() {
    sessionStorage.setItem("low_credits_dismissed", "1")
    setLowCreditsDismissed(true)
  }

  const delivered = activeRequests.filter((r) => r.status === "delivered")
  const inProgress = activeRequests.filter((r) => r.status !== "delivered")
  const approvedCount = pastRequests.filter((r) => r.status === "approved").length

  // One banner slot: only the most urgent alert renders.
  const banner = isPastDue
    ? { tone: "danger" as const, text: "Payment failed. New submissions are paused.", cta: "Update Payment Method" }
    : isCancelled && sub.renews_at
    ? { tone: "muted" as const, text: `Your plan ends ${new Date(sub.renews_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}. Existing requests complete normally.`, cta: "Resubscribe" }
    : balance === 0 && sub.status === "active"
    ? { tone: "primary" as const, text: "You're out of credits. Add more to submit a new request.", cta: "Recharge Now" }
    : isLowCredits && !lowCreditsDismissed
    ? { tone: "warn" as const, text: `Running low on credits — ${balance} cr remaining.`, cta: "Buy Credits", dismissible: true }
    : null

  const bannerCls = {
    danger:  "bg-red-500/10 border-red-500/25 text-red-400",
    warn:    "bg-yellow-500/10 border-yellow-500/25 text-yellow-400",
    primary: "bg-primary/10 border-primary/30 text-primary",
    muted:   "bg-card border-border text-muted-foreground",
  }

  // Hero copy answers "where is my edit?" before anything else.
  const heroTitle = delivered.length > 0
    ? delivered.length === 1 ? "One edit is ready for review." : `${delivered.length} edits are ready for review.`
    : inProgress.length > 0
    ? `${inProgress.length} edit${inProgress.length === 1 ? " is" : "s are"} being cleaned up.`
    : "All clear. Ready when you are."

  const heroSub = delivered.length > 0
    ? inProgress.length > 0
      ? `${inProgress.length} more in progress. Nothing else needs you yet.`
      : "Everything else is done."
    : inProgress.length > 0
    ? "Nothing needs you yet — we'll let you know the moment one lands."
    : undefined

  const canSubmit = !isBlocked && activeCount < maxActive

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl space-y-6 pb-24 md:pb-6">

      {/* ── Single banner slot ── */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 ${bannerCls[banner.tone]}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {banner.tone === "danger" && <AlertTriangle size={15} className="shrink-0" />}
              <p className="text-sm font-medium truncate">{banner.text}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/dashboard/subscription" className="text-xs font-semibold hover:underline">
                {banner.cta}
              </Link>
              {banner.dismissible && (
                <button onClick={dismissLowCredits} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero: the answer, then the action ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-2">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {heroTitle.includes("ready") ? (
              <>
                {heroTitle.split("ready")[0]}
                <span className="text-primary">ready{heroTitle.split("ready")[1]}</span>
              </>
            ) : heroTitle}
          </h1>
          {heroSub && <p className="text-sm text-muted-foreground mt-1.5">{heroSub}</p>}
        </div>

        {/* Primary action only when reviewing isn't the priority */}
        {delivered.length === 0 && activeRequests.length > 0 && (
          <Link to={canSubmit ? "/dashboard/submit" : "/dashboard/subscription"}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={!canSubmit && !isBlocked}
              title={
                isPastDue ? "Update your payment method to submit"
                : balance === 0 ? "Recharge credits to submit"
                : activeCount >= maxActive ? "Max active requests reached — approve one first"
                : undefined
              }
              className="flex items-center gap-2 bg-primary text-background font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusCircle size={15} />
              Submit New Request
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* ── Delivered: full-width strips, one primary CTA each ── */}
      <AnimatePresence>
        {delivered.map((r) => (
          <ReadyStrip key={r.id} req={r} editor={r.editor_id ? editors[r.editor_id] : undefined} />
        ))}
      </AnimatePresence>

      {/* ── In progress ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">In Progress</span>
          <div className="flex-1 h-px bg-border" />
          {inProgress.length > 0 && (
            <span className="text-xs text-muted-foreground">{inProgress.length}</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            <RowSkeleton />
            <RowSkeleton />
          </div>
        ) : inProgress.length > 0 ? (
          <div className="space-y-2.5">
            <AnimatePresence>
              {inProgress.map((r) => (
                <RequestRow key={r.id} req={r} editor={r.editor_id ? editors[r.editor_id] : undefined} onSwap={setSwapTarget} />
              ))}
            </AnimatePresence>
          </div>
        ) : activeRequests.length === 0 ? (
          <EmptyState />
        ) : (
          <p className="text-sm text-muted-foreground py-6 text-center">Nothing in progress — everything's delivered.</p>
        )}
      </motion.div>

      {/* ── Quiet footer stats ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-7 gap-y-2 pt-4 border-t border-border text-sm text-muted-foreground">
        <span><span className="font-heading font-bold text-foreground">{activeCount}</span> of {maxActive} active slots</span>
        <span><span className="font-heading font-bold text-foreground">{approvedCount}</span> edits approved</span>
        {sub.renews_at && sub.status === "active" && (
          <span>credits reset <span className="font-heading font-bold text-foreground">
            {new Date(sub.renews_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span></span>
        )}
        <span className="flex-1" />
        {pastRequests.length > 0 && (
          <Link to="/dashboard/requests" className="text-xs font-semibold text-primary hover:underline">
            View past edits →
          </Link>
        )}
      </motion.div>

      {/* ── Swap editor modal ── */}
      <AnimatePresence>
        {swapTarget && (
          <SwapEditorModal
            request={swapTarget}
            onClose={() => setSwapTarget(null)}
            onSwapped={() => { if (user?.id) refresh(user.id) }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
