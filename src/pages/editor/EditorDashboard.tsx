import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckSquare, ChevronDown, Clock, Download, FileText, Inbox, Upload } from "lucide-react"
import { fadeUp, slideInFromBottom, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useEditorStore } from "@/stores/editorStore"
import { initialiseRealtime, teardownRealtime } from "@/lib/realtime"
import CountdownTimer from "@/components/CountdownTimer"
import StatusBadge from "@/components/StatusBadge"
import BriefViewer from "@/components/BriefViewer"
import DeliveryUploadModal from "@/components/DeliveryUploadModal"
import { useToast } from "@/hooks/use-toast"
import type { Request, Brief, RevisionComment } from "@/lib/supabase"

// ── Animated number counter ───────────────────────────────────────────────────

function useAnimatedNumber(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return value
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amountInSmallest: number, currency: "USD" | "INR"): string {
  const amount = amountInSmallest / 100
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
  }
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function maskClientHandle(clientId: string): string {
  return `@brand_${clientId.slice(0, 6)}`
}

function getBriefPreview(brief: Record<string, unknown>): string {
  const b = brief as Brief
  const text = b.description ?? ""
  return text.length > 120 ? `${text.slice(0, 120)}…` : text
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Revision comments (lazy-loaded for in_revision cards) ────────────────────

function RevisionNotes({ requestId }: { requestId: string }) {
  const [comments, setComments] = useState<RevisionComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from("deliverables")
      .select("id")
      .eq("request_id", requestId)
      .order("version_number", { ascending: false })
      .limit(1)
      .then(({ data: dvs }) => {
        const dvId = dvs?.[0]?.id
        if (!dvId) { setLoading(false); return }
        supabase
          .from("revision_comments")
          .select("*")
          .eq("deliverable_id", dvId)
          .order("timestamp_seconds", { ascending: true })
          .then(({ data }) => {
            setComments((data as RevisionComment[]) ?? [])
            setLoading(false)
          })
      })
  }, [requestId])

  if (loading) return <div className="h-6 w-full bg-[#2A2A2A] rounded animate-pulse" />

  if (comments.length === 0) {
    return <p className="text-xs text-[#9CA3AF] italic">No revision notes from client yet.</p>
  }

  return (
    <div className="space-y-1.5">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2 bg-[#1A1A1A] rounded-lg px-2.5 py-2">
          <span className="text-[10px] font-mono font-bold text-[#3B82F6] shrink-0 mt-0.5">
            [{Math.floor(c.timestamp_seconds / 60)}:{String(Math.floor(c.timestamp_seconds % 60)).padStart(2, "0")}]
          </span>
          <p className="text-xs text-[#F9FAFB] leading-relaxed">{c.comment}</p>
        </div>
      ))}
    </div>
  )
}

// ── Queue item card ───────────────────────────────────────────────────────────

function QueueCard({
  req,
  onViewBrief,
  onUpload,
}: {
  req: Request
  onViewBrief: (r: Request) => void
  onUpload: (r: Request) => void
}) {
  const canUpload = ["matched", "in_progress", "in_revision"].includes(req.status)
  const preview = getBriefPreview(req.brief)
  const isRevision = req.status === "in_revision"
  const [notesExpanded, setNotesExpanded] = useState(isRevision)

  return (
    <motion.div
      layout
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      className={`bg-[#404040] border rounded-xl p-5 transition-colors ${
        isRevision ? "border-yellow-500/30 hover:border-yellow-500/50" : "border-[#2A2A2A] hover:border-[#3B82F6]/20"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={req.status} />
          {isRevision && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              Revision {req.revision_round} of 3
            </span>
          )}
          <span className="text-xs font-medium capitalize text-[#9CA3AF]">{req.edit_type}</span>
          <span className="text-xs font-bold text-[#3B82F6]">{req.credits_cost} cr</span>
        </div>
        <span className="text-xs font-mono text-[#9CA3AF] shrink-0">
          {maskClientHandle(req.client_id)}
        </span>
      </div>

      {/* Brief preview */}
      {preview ? (
        <p className="text-sm text-[#F9FAFB]/80 leading-relaxed mb-2 line-clamp-2">{preview}</p>
      ) : (
        <p className="text-sm text-[#9CA3AF] italic mb-2">No description provided</p>
      )}

      <button
        onClick={() => onViewBrief(req)}
        className="flex items-center gap-1.5 text-xs text-[#3B82F6] hover:underline mb-4"
      >
        <FileText size={12} />
        View Full Brief
      </button>

      {/* Inline revision notes (collapsible) */}
      {isRevision && (
        <div className="mb-4 border-t border-yellow-500/20 pt-3">
          <button
            onClick={() => setNotesExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 mb-2 w-full"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${notesExpanded ? "rotate-180" : ""}`}
            />
            Client Revision Notes
          </button>
          <AnimatePresence initial={false}>
            {notesExpanded && (
              <motion.div
                variants={slideInFromBottom}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <RevisionNotes requestId={req.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Due countdown */}
      {req.due_at && (
        <div className="flex items-center gap-1.5 mb-3">
          <Clock size={12} className="text-[#9CA3AF]" />
          <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Due</span>
          <CountdownTimer dueAt={req.due_at} />
        </div>
      )}

      <p className="text-[10px] text-[#9CA3AF] mb-4">
        Assigned {getRelativeTime(req.submitted_at)}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        {req.footage_url && (
          <a
            href={req.footage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 border border-[#2A2A2A] text-[#9CA3AF] text-xs font-medium rounded-lg py-2.5 hover:bg-[#4A4A4A] hover:text-[#F9FAFB] transition-colors"
          >
            <Download size={13} />
            Footage
          </a>
        )}
        {canUpload && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUpload(req)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#3B82F6] text-white text-xs font-semibold rounded-lg py-2.5 hover:bg-[#2563EB] transition-colors"
          >
            <Upload size={13} />
            {req.status === "in_revision" ? "Upload Revision" : "Upload Edit"}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ── Completed card ────────────────────────────────────────────────────────────

function CompletedCard({ req }: { req: Request }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <StatusBadge status={req.status} />
        <div>
          <p className="text-xs font-medium text-[#F9FAFB] capitalize">{req.edit_type} edit</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{maskClientHandle(req.client_id)}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-[#3B82F6]">{req.credits_cost} cr</p>
        {req.approved_at && (
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">{getRelativeTime(req.approved_at)}</p>
        )}
      </div>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function QueueSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-3 animate-pulse"
        >
          <div className="h-5 w-32 bg-[#2A2A2A] rounded-full" />
          <div className="h-4 w-full bg-[#2A2A2A] rounded" />
          <div className="h-4 w-2/3 bg-[#2A2A2A] rounded" />
          <div className="h-9 bg-[#2A2A2A] rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ── Empty states ──────────────────────────────────────────────────────────────

type Tab = "active" | "awaiting" | "completed"

function EmptyTab({ tab }: { tab: Tab }) {
  const config: Record<Tab, { icon: React.ElementType; title: string; sub: string }> = {
    active: {
      icon: Inbox,
      title: "No active assignments",
      sub: "New edit requests appear here once assigned to you.",
    },
    awaiting: {
      icon: Clock,
      title: "Nothing awaiting review",
      sub: "Edits you've delivered appear here while the client reviews.",
    },
    completed: {
      icon: CheckSquare,
      title: "No completed edits yet",
      sub: "Approved edits appear here once clients sign off.",
    },
  }
  const { icon: Icon, title, sub } = config[tab]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6"
    >
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
        <Icon size={24} className="text-[#3B82F6]" />
      </div>
      <p className="font-heading text-base font-semibold text-[#F9FAFB] mb-1">{title}</p>
      <p className="text-sm text-[#9CA3AF] max-w-xs mx-auto">{sub}</p>
    </motion.div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function EditorDashboard() {
  const { user, currency } = useAuthStore()
  const {
    activeQueue,
    completedQueue,
    weeklyEarnings,
    pendingPayout,
    nextPayoutDate,
    currency: payoutCurrency,
    loading,
    refresh,
  } = useEditorStore()
  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>("active")
  const [briefRequest, setBriefRequest] = useState<Request | null>(null)
  const [uploadRequest, setUploadRequest] = useState<Request | null>(null)
  const prevActiveLen = useRef(0)

  const displayCurrency = (payoutCurrency ?? currency) as "USD" | "INR"
  const animatedEarnings = useAnimatedNumber(weeklyEarnings)
  const animatedPending = useAnimatedNumber(pendingPayout)

  const activeJobs = activeQueue.filter((r) =>
    r.status === "matched" || r.status === "in_progress"
  )
  const awaitingJobs = activeQueue.filter((r) =>
    r.status === "delivered" || r.status === "in_revision"
  )

  useEffect(() => {
    if (!user?.id) return
    refresh(user.id)
    initialiseRealtime(user.id)
    return () => teardownRealtime()
  }, [user?.id])

  // Toast on new assignment arriving via realtime
  useEffect(() => {
    if (activeJobs.length > prevActiveLen.current && prevActiveLen.current !== 0) {
      toast({
        title: "New assignment!",
        description: "A new edit request has been assigned to you.",
      })
    }
    prevActiveLen.current = activeJobs.length
  }, [activeJobs.length])

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "active", label: "Active", count: activeJobs.length },
    { id: "awaiting", label: "Awaiting Client", count: awaitingJobs.length },
    { id: "completed", label: "Completed", count: completedQueue.length },
  ]

  const currentItems =
    tab === "active" ? activeJobs : tab === "awaiting" ? awaitingJobs : completedQueue

  return (
    <>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-24 md:pb-6"
      >
        {/* ── Earnings header card ── */}
        <motion.div
          variants={fadeUp}
          className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5"
        >
          <div className="grid grid-cols-2 gap-4 divide-x divide-[#2A2A2A]">
            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-1">
                This Week
              </p>
              <p className="font-heading text-3xl font-bold text-[#3B82F6]">
                {formatAmount(animatedEarnings, displayCurrency)}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">Weekly earnings</p>
            </div>
            <div className="pl-4">
              <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-1">
                Pending Payout
              </p>
              <p className="font-heading text-2xl font-bold text-[#F9FAFB]">
                {formatAmount(animatedPending, displayCurrency)}
              </p>
              {nextPayoutDate && (
                <p className="text-xs text-[#9CA3AF] mt-1">Pays out {nextPayoutDate}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Queue tabs ── */}
        <motion.div variants={fadeUp}>
          {/* Tab bar */}
          <div className="flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 mb-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === t.id
                    ? "bg-[#3B82F6] text-white shadow-sm"
                    : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                      tab === t.id
                        ? "bg-white/20 text-white"
                        : "bg-[#404040] text-[#9CA3AF]"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {loading ? (
                <QueueSkeleton />
              ) : currentItems.length === 0 ? (
                <EmptyTab tab={tab} />
              ) : tab === "completed" ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  {completedQueue.map((r) => (
                    <CompletedCard key={r.id} req={r} />
                  ))}
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {currentItems.map((r) => (
                      <QueueCard
                        key={r.id}
                        req={r}
                        onViewBrief={setBriefRequest}
                        onUpload={setUploadRequest}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ── Overlays ── */}
      <BriefViewer request={briefRequest} onClose={() => setBriefRequest(null)} />

      <AnimatePresence>
        {uploadRequest && (
          <DeliveryUploadModal
            request={uploadRequest}
            onClose={() => setUploadRequest(null)}
            onDelivered={() => {
              setUploadRequest(null)
              if (user?.id) refresh(user.id)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
