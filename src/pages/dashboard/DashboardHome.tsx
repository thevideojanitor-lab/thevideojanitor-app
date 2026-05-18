import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, ArrowLeftRight, CreditCard, Eye, FileVideo, HelpCircle, Inbox, MessageSquare, PlusCircle, X } from "lucide-react"
import { staggerContainer, fadeUp } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { useRequestsStore } from "@/stores/requestsStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { usePricingStore } from "@/stores/pricingStore"
import { supabase } from "@/lib/supabase"
import CreditsDisplay from "@/components/CreditsDisplay"
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 bg-[#2A2A2A] rounded-full animate-pulse" />
        <div className="h-5 w-16 bg-[#2A2A2A] rounded-full animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#2A2A2A] animate-pulse" />
        <div className="h-4 w-32 bg-[#2A2A2A] rounded animate-pulse" />
      </div>
      <div className="h-4 w-28 bg-[#2A2A2A] rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-[#2A2A2A] rounded-lg animate-pulse" />
        <div className="flex-1 h-9 bg-[#2A2A2A] rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

// ── Request card ──────────────────────────────────────────────────────────────

function RequestCard({ req, onSwap }: { req: Request; onSwap: (r: Request) => void }) {
  const isPending = req.status === "pending_match" || req.status === "matched"
  const isDelivered = req.status === "delivered"
  const canSwap = !!req.editor_id && !["approved", "abandoned"].includes(req.status)
  const editorInitial = req.editor_id?.charAt(0).toUpperCase() ?? "?"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#FF5F15]/20 transition-colors"
    >
      {/* Status + countdown */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={req.status} pulse={isDelivered} />
          <span className="text-xs font-medium text-[#9CA3AF] capitalize">{req.edit_type} edit</span>
          <span className="text-xs text-[#9CA3AF]">·</span>
          <span className="text-xs font-semibold text-[#FF5F15]">{req.credits_cost} cr</span>
        </div>
        {req.due_at && !isPending && (
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] text-[#9CA3AF]">Due</span>
            <CountdownTimer dueAt={req.due_at} />
          </div>
        )}
      </div>

      {/* Editor info + swap */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
            req.editor_id ? "bg-[#FF5F15]/20 border border-[#FF5F15]/30 text-[#FF5F15]" : "bg-[#2A2A2A] text-[#9CA3AF]"
          }`}>
            {req.editor_id ? editorInitial : "?"}
          </div>
          <p className="text-sm text-[#9CA3AF]">
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-pulse" />
                Finding your editor…
              </span>
            ) : "Editor assigned"}
          </p>
        </div>
        {canSwap && (
          <button
            onClick={() => onSwap(req)}
            className="flex items-center gap-1 text-[10px] text-[#9CA3AF] hover:text-[#FF5F15] transition-colors shrink-0"
          >
            <ArrowLeftRight size={11} />
            Swap
          </button>
        )}
      </div>

      {/* Delivered CTA */}
      {isDelivered && (
        <div className="bg-[rgba(59,130,246,0.10)] border border-[rgba(59,130,246,0.2)] rounded-lg px-3 py-2 mb-3 text-xs font-medium text-[#60a5fa]">
          Your edit is ready! Review and approve below.
        </div>
      )}

      <p className="text-xs text-[#9CA3AF] mb-4" title={new Date(req.submitted_at).toLocaleString()}>
        Submitted {getRelativeTime(req.submitted_at)}
      </p>

      <div className="flex gap-2">
        <Link
          to={`/dashboard/requests/${req.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 border border-[#404040] text-[#F9FAFB] text-xs font-medium rounded-lg py-2 hover:bg-[#4A4A4A] transition-colors"
        >
          <Eye size={13} />
          {isDelivered ? "Review Edit" : "View Details"}
        </Link>
        <Link
          to={`/dashboard/requests/${req.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 border border-[#404040] text-[#F9FAFB] text-xs font-medium rounded-lg py-2 hover:bg-[#4A4A4A] transition-colors"
        >
          <MessageSquare size={13} />
          Chat
        </Link>
      </div>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div variants={fadeUp} className="text-center py-16 px-6">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#FF5F15]/10 border border-[#FF5F15]/20 flex items-center justify-center">
        <Inbox size={28} className="text-[#FF5F15]" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-[#F9FAFB] mb-2">Ready for your first edit?</h3>
      <p className="text-sm text-[#9CA3AF] max-w-xs mx-auto mb-6">
        Submit your footage and brief. We'll match you with a vetted editor in minutes.
      </p>
      <Link to="/dashboard/submit">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="bg-[#FF5F15] text-[#121212] font-semibold rounded-lg px-6 py-3 text-sm hover:bg-[#E54E08] transition-colors"
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

  async function loadSubscription(clientId: string) {
    const { data } = await supabase
      .from("subscriptions")
      .select("status, renews_at, plan")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    if (data) setSub({ status: data.status, renews_at: data.renews_at, plan: data.plan })
  }

  function dismissLowCredits() {
    sessionStorage.setItem("low_credits_dismissed", "1")
    setLowCreditsDismissed(true)
  }

  const delivered = activeRequests.filter((r) => r.status === "delivered")
  const inProgress = activeRequests.filter((r) => r.status !== "delivered")
  const recentApproved = pastRequests.slice(0, 10)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-5 pb-24 md:pb-6">

      {/* ── past_due banner ── */}
      <AnimatePresence>
        {isPastDue && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={15} className="text-red-400 shrink-0" />
              <p className="text-sm font-semibold text-red-400">Payment failed. New submissions are paused.</p>
            </div>
            <Link
              to="/dashboard/subscription"
              className="text-xs font-semibold text-red-400 hover:underline shrink-0"
            >
              Update Payment Method
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── cancelled banner ── */}
      <AnimatePresence>
        {isCancelled && sub.renews_at && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 bg-[#404040] border border-[#2A2A2A] rounded-xl px-4 py-3"
          >
            <p className="text-sm text-[#9CA3AF]">
              Your plan ends on <span className="text-[#F9FAFB] font-semibold">{new Date(sub.renews_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>. Existing requests will complete normally.
            </p>
            <Link
              to="/dashboard/subscription"
              className="text-xs font-semibold text-[#FF5F15] hover:underline shrink-0"
            >
              Resubscribe
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── zero credits banner ── */}
      <AnimatePresence>
        {balance === 0 && sub.status === "active" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 bg-[#FF5F15]/10 border border-[#FF5F15]/30 rounded-xl px-4 py-3"
          >
            <p className="text-sm font-semibold text-[#FF5F15]">You're out of credits. Add more to submit a new request.</p>
            <Link
              to="/dashboard/subscription"
              className="text-xs font-bold text-[#FF5F15] hover:underline shrink-0"
            >
              Recharge Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── low credits banner (dismissible per session) ── */}
      <AnimatePresence>
        {isLowCredits && !lowCreditsDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-3"
          >
            <p className="text-sm text-yellow-400">
              Running low on credits — <span className="font-bold">{balance} cr</span> remaining.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/dashboard/subscription" className="text-xs font-semibold text-yellow-400 hover:underline">
                Buy Credits
              </Link>
              <button onClick={dismissLowCredits} className="text-yellow-400/60 hover:text-yellow-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top grid ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Credits + stats */}
        <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-5">
          <div>
            <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Credits</p>
            <CreditsDisplay />
          </div>
          <div className="flex gap-4 pt-3 border-t border-[#2A2A2A]">
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Active Requests</p>
              <p className="font-heading text-xl font-bold text-[#FF5F15]">
                {activeCount}<span className="text-[#9CA3AF] text-sm font-normal"> / {maxActive}</span>
              </p>
            </div>
            <div className="w-px bg-[#2A2A2A]" />
            <div>
              <p className="text-xs text-[#9CA3AF] mb-1">Balance</p>
              <p className="font-heading text-xl font-bold text-[#FF5F15]">
                {balance.toLocaleString()}<span className="text-xs text-[#9CA3AF] font-normal ml-1">cr</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-3">
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">Quick Actions</p>
          <Link to={isBlocked ? "/dashboard/subscription" : "/dashboard/submit"}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={activeCount >= maxActive || isBlocked}
              title={
                isPastDue ? "Update your payment method to submit"
                : balance === 0 ? "Recharge credits to submit"
                : activeCount >= maxActive ? "Max active requests reached"
                : undefined
              }
              className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PlusCircle size={16} />
              Submit New Request
            </motion.button>
          </Link>
          {isPastDue && (
            <p className="text-xs text-red-400 text-center">Payment failed — update your payment method.</p>
          )}
          {!isPastDue && activeCount >= maxActive && (
            <p className="text-xs text-[#9CA3AF] text-center">Max active requests reached — approve one first.</p>
          )}
          {!isPastDue && balance === 0 && activeCount < maxActive && (
            <p className="text-xs text-[#FF5F15] text-center">
              Out of credits — <Link to="/dashboard/subscription" className="underline">recharge</Link>
            </p>
          )}
          {!isPastDue && balance > 0 && balance < 50 && activeCount < maxActive && (
            <p className="text-xs text-yellow-400 text-center">
              Need {50 - balance} more credits to submit a basic edit.
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { to: "/dashboard/requests", icon: FileVideo,   label: "Past Edits" },
              { to: "/dashboard/subscription", icon: CreditCard, label: "Subscription" },
              { to: "/dashboard/help",     icon: HelpCircle,  label: "Get Help" },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}>
                <button className="w-full border border-[#2A2A2A] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#4A4A4A] rounded-lg py-2 text-xs font-medium flex flex-col items-center gap-1 transition-colors">
                  <Icon size={15} />
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Delivered — action needed first ── */}
      <AnimatePresence>
        {delivered.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-[#F9FAFB]">Action Needed</span>
              <span className="text-xs bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)] rounded-full px-2 py-0.5 animate-pulse">
                {delivered.length} edit{delivered.length > 1 ? "s" : ""} ready
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                {delivered.map((r) => (
                  <RequestCard key={r.id} req={r} onSwap={setSwapTarget} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active requests ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#F9FAFB]">Active Requests</span>
          {inProgress.length > 0 && (
            <span className="text-xs text-[#9CA3AF]">{inProgress.length} in progress</span>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : inProgress.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {inProgress.map((r) => (
                <RequestCard key={r.id} req={r} onSwap={setSwapTarget} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}
      </motion.div>

      {/* ── Past approved ── */}
      {recentApproved.length > 0 && (
        <motion.details variants={fadeUp} className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none py-3 border-t border-[#2A2A2A]">
            <span className="text-sm font-semibold text-[#9CA3AF] group-open:text-[#F9FAFB] transition-colors">
              Past Approved Edits
            </span>
            <span className="text-xs text-[#9CA3AF]">{recentApproved.length} edits ›</span>
          </summary>
          <div className="grid md:grid-cols-2 gap-4 pt-3">
            {recentApproved.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="text-xs text-[#9CA3AF] capitalize">{r.edit_type}</span>
                </div>
                <Link to={`/dashboard/requests/${r.id}`} className="text-xs text-[#FF5F15] hover:underline shrink-0">
                  View
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.details>
      )}

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
