import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import MuxPlayer from "@mux/mux-player-react"
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Download,
  MessageSquare,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react"
import { fadeUp, scaleIn, slideInFromRight, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"
import StatusBadge from "@/components/StatusBadge"
import CountdownTimer from "@/components/CountdownTimer"
import StatusTimeline from "@/components/StatusTimeline"
import Chat from "@/components/Chat"
import type { Deliverable, Request, RevisionComment } from "@/lib/supabase"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
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

// ── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hover || value) ? "fill-[#FF5F15] text-[#FF5F15]" : "text-[#404040]"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ── Swap reasons ──────────────────────────────────────────────────────────────

const SWAP_REASONS = [
  "Quality not as expected",
  "Style doesn't match brief",
  "Communication issues",
  "Other",
]

// ── Approve state machine ─────────────────────────────────────────────────────

type ApproveState = "idle" | "approving" | "celebrating" | "done"
type PageTab = "review" | "chat"

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [request, setRequest] = useState<Request | null>(null)
  const [allDeliverables, setAllDeliverables] = useState<Deliverable[]>([])
  const [selectedVersion, setSelectedVersion] = useState<number>(0)
  const [comments, setComments] = useState<RevisionComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tab
  const [tab, setTab] = useState<PageTab>("review")
  const [chatUnread, setChatUnread] = useState(0)

  // Comment input
  const [newComment, setNewComment] = useState("")
  const [capturedTime, setCapturedTime] = useState(0)
  const [addingComment, setAddingComment] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

  // Approve flow
  const [approveState, setApproveState] = useState<ApproveState>("idle")
  const [rating, setRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  // Revision drawer
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [sendingRevision, setSendingRevision] = useState(false)

  // Swap modal
  const [swapOpen, setSwapOpen] = useState(false)
  const [swapReason, setSwapReason] = useState("")
  const [swapOtherText, setSwapOtherText] = useState("")
  const [swapping, setSwapping] = useState(false)
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null)

  // Mux player ref
  const playerWrapRef = useRef<HTMLDivElement>(null)

  const deliverable = allDeliverables[selectedVersion] ?? null

  const getCurrentTime = (): number => {
    const el = playerWrapRef.current?.querySelector("mux-player") as HTMLVideoElement | null
    return el?.currentTime ?? 0
  }

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!requestId) return
    loadData()
  }, [requestId])

  async function loadData(showToastOnNewDelivery = false) {
    const prevVersionCount = allDeliverables.length
    setLoading(true)
    setError(null)
    try {
      const [{ data: req, error: reqErr }, { data: deliverables }] = await Promise.all([
        supabase.from("requests").select("*").eq("id", requestId).single(),
        supabase
          .from("deliverables")
          .select("*")
          .eq("request_id", requestId)
          .in("status", ["ready", "approved"])
          .order("version_number", { ascending: false }),
      ])

      if (reqErr) throw reqErr
      const r = req as Request
      setRequest(r)

      const dvs = (deliverables as Deliverable[]) ?? []
      setAllDeliverables(dvs)

      // Auto-select latest version; toast if a new delivery arrived
      if (dvs.length > prevVersionCount && prevVersionCount > 0 && showToastOnNewDelivery) {
        toast({ title: "New version delivered!", description: "Your editor submitted a revision." })
        setSelectedVersion(0)
      } else if (selectedVersion >= dvs.length) {
        setSelectedVersion(0)
      }

      const d = dvs[selectedVersion] ?? dvs[0] ?? null
      if (d?.id) {
        const { data: revComments } = await supabase
          .from("revision_comments")
          .select("*")
          .eq("deliverable_id", d.id)
          .order("timestamp_seconds", { ascending: true })
        setComments((revComments as RevisionComment[]) ?? [])
      } else {
        setComments([])
      }

      if (r.status === "approved") setApproveState("done")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load request")
    } finally {
      setLoading(false)
    }
  }

  // Reload comments when selected version changes
  useEffect(() => {
    const d = allDeliverables[selectedVersion]
    if (!d?.id) { setComments([]); return }
    supabase
      .from("revision_comments")
      .select("*")
      .eq("deliverable_id", d.id)
      .order("timestamp_seconds", { ascending: true })
      .then(({ data }) => setComments((data as RevisionComment[]) ?? []))
  }, [selectedVersion])

  // ── Realtime: watch for new/updated deliverables ─────────────────────────────

  useEffect(() => {
    if (!requestId) return
    const ch = supabase
      .channel(`review-deliverable-${requestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deliverables", filter: `request_id=eq.${requestId}` },
        () => loadData(true)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deliverables", filter: `request_id=eq.${requestId}` },
        () => loadData(false)
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [requestId])

  // ── Capture timestamp from player ───────────────────────────────────────────

  function handleCaptureTime() {
    const time = getCurrentTime()
    setCapturedTime(time)
    setNewComment(`[${formatTime(time)}] `)
    setTimeout(() => commentInputRef.current?.focus(), 50)
  }

  // ── Add comment ─────────────────────────────────────────────────────────────

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!deliverable || !user?.id || !newComment.trim()) return
    setAddingComment(true)

    const text = newComment.trim()
    const match = text.match(/^\[(\d+):(\d+)\]\s*(.+)$/)
    const seconds = match ? parseInt(match[1]) * 60 + parseInt(match[2]) : capturedTime
    const commentText = match ? match[3] : text

    const { data } = await supabase
      .from("revision_comments")
      .insert({ deliverable_id: deliverable.id, timestamp_seconds: seconds, comment: commentText, created_by: user.id })
      .select()
      .single()

    if (data) {
      setComments((prev) =>
        [...prev, data as RevisionComment].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds)
      )
    }
    setNewComment("")
    setCapturedTime(0)
    setAddingComment(false)
  }

  // ── Delete comment ──────────────────────────────────────────────────────────

  async function handleDeleteComment(commentId: string) {
    await supabase.from("revision_comments").delete().eq("id", commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  // ── Approve ─────────────────────────────────────────────────────────────────

  async function handleApprove() {
    if (!request || !user?.id || approveState !== "idle") return
    setApproveState("approving")
    try {
      // Fetch editor payout rate from platform_config
      const { data: rateRow } = await supabase
        .from("platform_config")
        .select("value")
        .eq("key", "payout_rates")
        .single()
      const rates = rateRow?.value as Record<string, Record<string, number>> | null
      const payoutAmount = rates?.[user.currency]?.[request.edit_type] ?? 0

      await Promise.all([
        supabase
          .from("requests")
          .update({ status: "approved", approved_at: new Date().toISOString() })
          .eq("id", request.id),
        ...(request.editor_id
          ? [
              supabase.from("editor_payouts").insert({
                editor_id: request.editor_id,
                request_id: request.id,
                amount: payoutAmount,
                currency: user.currency,
                status: "pending",
                payout_method: user.currency === "INR" ? "razorpay_payout" : "stripe_connect",
              }),
            ]
          : []),
      ])
      setApproveState("celebrating")
    } catch {
      setApproveState("idle")
      setError("Approval failed — please try again.")
    }
  }

  // ── Submit rating ────────────────────────────────────────────────────────────

  async function handleSubmitRating() {
    if (!request?.editor_id || rating === 0 || ratingSubmitted) return
    const { data: profile } = await supabase
      .from("editor_profiles")
      .select("rating, completed_count")
      .eq("user_id", request.editor_id)
      .single()

    if (profile) {
      const weighted = (profile.rating * profile.completed_count + rating) / (profile.completed_count + 1)
      await supabase
        .from("editor_profiles")
        .update({ rating: Math.min(5, Math.round(weighted * 100) / 100), completed_count: profile.completed_count + 1 })
        .eq("user_id", request.editor_id)
    }
    setRatingSubmitted(true)
  }

  // ── Send revision ────────────────────────────────────────────────────────────

  async function handleSendRevision() {
    if (!request || !user?.id || sendingRevision) return
    setSendingRevision(true)
    try {
      const newRound = request.revision_round + 1
      await supabase
        .from("requests")
        .update({ status: "in_revision", revision_round: newRound })
        .eq("id", request.id)

      if (request.editor_id) {
        await supabase.from("notifications").insert({
          user_id: request.editor_id,
          message: `Revision ${newRound} requested — review notes and resubmit.`,
          type: "revision_requested",
        })
      }

      setRequest((r) => r ? { ...r, status: "in_revision", revision_round: newRound } : r)
      setRevisionOpen(false)
    } finally {
      setSendingRevision(false)
    }
  }

  // ── Swap editor ──────────────────────────────────────────────────────────────

  async function handleSwap() {
    if (!request || !user?.id || swapping || !swapReason) return
    setSwapping(true)
    try {
      const reason = swapReason === "Other" ? swapOtherText : swapReason

      await supabase
        .from("requests")
        .update({ editor_id: null, status: "pending_match" })
        .eq("id", request.id)

      await supabase.from("admin_actions").insert({
        admin_id: user.id,
        action_type: "editor_swap",
        target_type: "request",
        target_id: request.id,
        notes: reason,
      })

      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        await fetch(`${SUPABASE_URL}/functions/v1/match-editor`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: request.id }),
        })
      } catch {
        // Edge Function may not be deployed yet — admin will pick up pending_match
      }

      const { data } = await supabase.from("requests").select("*").eq("id", request.id).single()
      if (data) {
        setRequest(data as Request)
        setSwapSuccess(
          (data as Request).editor_id
            ? `Reassigned! New editor will deliver by ${new Date((data as Request).due_at ?? "").toLocaleDateString()}.`
            : "Back in queue — a new editor will be assigned shortly."
        )
      }
      setSwapOpen(false)
    } finally {
      setSwapping(false)
    }
  }

  // ── Copy share link ──────────────────────────────────────────────────────────

  function handleCopyLink() {
    if (!deliverable?.mux_playback_id) return
    navigator.clipboard.writeText(`https://stream.mux.com/${deliverable.mux_playback_id}/high.mp4`)
  }

  // ── Loading / error ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 pb-8">
        <div className="h-6 w-24 bg-[#404040] rounded animate-pulse" />
        <div className="aspect-video bg-[#404040] rounded-xl animate-pulse" />
        <div className="h-24 bg-[#404040] rounded-xl animate-pulse" />
        <div className="h-40 bg-[#404040] rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error && !request) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm font-semibold text-[#F9FAFB]">Something went wrong</p>
        <p className="text-xs text-[#9CA3AF]">{error}</p>
        <button onClick={() => navigate(-1)} className="text-sm text-[#FF5F15] hover:underline">Go back</button>
      </div>
    )
  }

  if (!request) return null

  const isDelivered = request.status === "delivered"
  const canRevise = request.revision_round < 3
  const revisionPill =
    request.revision_round > 0 ? `Revision ${request.revision_round} of 3` : null
  const isLastRevision = request.revision_round === 2

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-3xl mx-auto pb-24 md:pb-10 space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* ── Post-approval view ── */}
        {approveState === "done" ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5">
              <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-4">Your Approved Edit</p>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={deliverable?.mux_playback_id ? `https://stream.mux.com/${deliverable.mux_playback_id}/capped-1080p.mp4` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 border border-[#2A2A2A] rounded-xl py-4 text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#4A4A4A] transition-colors"
                >
                  <Download size={18} />
                  Download MP4
                </a>
                <button
                  disabled
                  className="flex flex-col items-center gap-2 border border-[#2A2A2A] rounded-xl py-4 text-xs font-medium text-[#9CA3AF] opacity-40 cursor-not-allowed"
                  title="Captions coming soon"
                >
                  <MessageSquare size={18} />
                  Download SRT
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 border border-[#2A2A2A] rounded-xl py-4 text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#4A4A4A] transition-colors"
                >
                  <Copy size={18} />
                  Copy Link
                </button>
              </div>
            </motion.div>

            {!ratingSubmitted ? (
              <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5">
                <p className="font-heading text-base font-semibold text-[#F9FAFB] mb-1">How was your editor?</p>
                <p className="text-xs text-[#9CA3AF] mb-4">Your rating helps us surface the best editors.</p>
                <StarRating value={rating} onChange={setRating} />
                <AnimatePresence>
                  {rating > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmitRating}
                      className="mt-4 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-[#E54E08] transition-colors"
                    >
                      Submit Rating
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-xl p-4 text-center"
              >
                <p className="text-sm font-medium text-[#4ade80]">Rating submitted — thanks!</p>
              </motion.div>
            )}

            {/* StatusTimeline in done state */}
            <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5">
              <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-4">Timeline</p>
              <StatusTimeline
                currentStatus={request.status}
                submittedAt={request.submitted_at}
                deliveredAt={request.delivered_at ?? undefined}
                approvedAt={request.approved_at ?? undefined}
                revisionRound={request.revision_round || undefined}
              />
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* ── Page tab bar ── */}
            <div className="flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
              {(["review", "chat"] as PageTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); if (t === "chat") setChatUnread(0) }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                    tab === t
                      ? "bg-[#FF5F15] text-[#121212] shadow-sm"
                      : "text-[#9CA3AF] hover:text-[#F9FAFB]"
                  }`}
                >
                  {t === "chat" ? "Chat" : "Review"}
                  {t === "chat" && chatUnread > 0 && (
                    <span className="bg-[#121212]/20 text-[#121212] text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {chatUnread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "chat" ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#404040] border border-[#2A2A2A] rounded-xl overflow-hidden"
                >
                  <Chat requestId={request.id} onUnreadChange={setChatUnread} />
                </motion.div>
              ) : (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Version selector (only when multiple deliverables exist) */}
                  {allDeliverables.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#9CA3AF] font-sans uppercase tracking-wider">Version</span>
                      <div className="flex gap-1">
                        {allDeliverables.map((d, idx) => (
                          <button
                            key={d.id}
                            onClick={() => setSelectedVersion(idx)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              selectedVersion === idx
                                ? "bg-[#FF5F15] text-[#121212]"
                                : "bg-[#2A2A2A] text-[#9CA3AF] hover:text-[#F9FAFB]"
                            }`}
                          >
                            V{d.version_number}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Mux player ── */}
                  {deliverable?.mux_playback_id ? (
                    <div ref={playerWrapRef} className="rounded-xl overflow-hidden bg-[#121212] aspect-video">
                      <MuxPlayer
                        playbackId={deliverable.mux_playback_id}
                        streamType="on-demand"
                        accentColor="#FF5F15"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] aspect-video flex items-center justify-center">
                      <div className="text-center px-6">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
                          <Clock size={20} className="text-[#9CA3AF]" />
                        </div>
                        <p className="text-sm font-medium text-[#F9FAFB]">
                          {["matched", "in_progress"].includes(request.status)
                            ? "Edit in progress…"
                            : "Awaiting delivery"}
                        </p>
                        {request.due_at && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-xs text-[#9CA3AF]">Due</span>
                            <CountdownTimer dueAt={request.due_at} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Edit metadata + timeline ── */}
                  <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={request.status} pulse={isDelivered} />
                        <span className="text-xs text-[#9CA3AF] capitalize">{request.edit_type} edit</span>
                        <span className="text-xs font-semibold text-[#FF5F15]">{request.credits_cost} cr</span>
                      </div>
                      {revisionPill && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          request.status === "in_revision"
                            ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                            : "bg-[rgba(64,64,64,0.5)] text-[#9CA3AF] border-[#2A2A2A]"
                        }`}>
                          {revisionPill}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="text-xs text-[#9CA3AF]">
                        Submitted {getRelativeTime(request.submitted_at)}
                      </p>
                      {request.due_at && !isDelivered && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#9CA3AF]">Due</span>
                          <CountdownTimer dueAt={request.due_at} />
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-[#2A2A2A]">
                      <StatusTimeline
                        currentStatus={request.status}
                        submittedAt={request.submitted_at}
                        deliveredAt={request.delivered_at ?? undefined}
                        approvedAt={request.approved_at ?? undefined}
                        revisionRound={request.revision_round || undefined}
                      />
                    </div>
                  </div>

                  {/* ── Timestamped comments (only when deliverable exists) ── */}
                  {deliverable && (
                    <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">
                          Revision Notes
                        </p>
                        <button
                          onClick={handleCaptureTime}
                          className="flex items-center gap-1.5 text-xs text-[#3B82F6] hover:underline"
                        >
                          <Plus size={12} />
                          Note at {formatTime(getCurrentTime())}
                        </button>
                      </div>

                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          ref={commentInputRef}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="[0:00] Add a note…"
                          className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none transition-colors"
                        />
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={!newComment.trim() || addingComment}
                          className="px-4 py-2.5 bg-[#2A2A2A] text-[#F9FAFB] text-xs font-medium rounded-lg hover:bg-[#404040] disabled:opacity-40 transition-colors"
                        >
                          Add
                        </motion.button>
                      </form>

                      {comments.length === 0 ? (
                        <p className="text-xs text-[#9CA3AF] text-center py-3">
                          No notes yet — click a moment in the player then "Note at X:XX".
                        </p>
                      ) : (
                        <AnimatePresence>
                          <div className="space-y-2">
                            {comments.map((c) => (
                              <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex items-start gap-3 bg-[#1A1A1A] rounded-lg px-3 py-2.5"
                              >
                                <span className="text-xs font-mono font-bold text-[#3B82F6] shrink-0 mt-0.5">
                                  [{formatTime(c.timestamp_seconds)}]
                                </span>
                                <p className="flex-1 text-sm text-[#F9FAFB] leading-relaxed">{c.comment}</p>
                                {c.created_by === user?.id && request.status !== "in_revision" && (
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="shrink-0 text-[#9CA3AF] hover:text-red-400 transition-colors mt-0.5"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </AnimatePresence>
                      )}
                    </div>
                  )}

                  {/* ── Error banner ── */}
                  {error && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle size={13} />
                      {error}
                    </div>
                  )}

                  {/* ── Swap success banner ── */}
                  {swapSuccess && (
                    <div className="text-xs text-[#4ade80] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] rounded-lg px-3 py-2.5">
                      {swapSuccess}
                    </div>
                  )}

                  {/* ── Action buttons (delivered only) ── */}
                  {isDelivered && (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2.5"
                    >
                      <motion.button
                        variants={fadeUp}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleApprove}
                        disabled={approveState !== "idle"}
                        className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3.5 text-sm hover:bg-[#E54E08] transition-colors disabled:opacity-60"
                      >
                        <Check size={16} />
                        Approve Edit
                      </motion.button>
                      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => canRevise && setRevisionOpen(true)}
                          disabled={!canRevise}
                          title={!canRevise ? "Max revisions reached" : undefined}
                          className="flex items-center justify-center gap-1.5 border border-[#2A2A2A] text-yellow-400 font-medium rounded-lg py-2.5 text-xs hover:bg-yellow-500/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <RotateCcw size={13} />
                          Request a revision
                        </button>
                        <button
                          onClick={() => setSwapOpen(true)}
                          className="flex items-center justify-center gap-1.5 border border-[#2A2A2A] text-[#9CA3AF] font-medium rounded-lg py-2.5 text-xs hover:bg-[#404040] hover:text-[#F9FAFB] transition-colors"
                        >
                          <ArrowLeftRight size={13} />
                          Swap editor
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ── Full-screen celebration overlay ── */}
      <AnimatePresence>
        {approveState === "celebrating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#121212]/95 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="56" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" strokeWidth="2" />
                <motion.path
                  d="M36 60l18 18 30-36"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  onAnimationComplete={() => setTimeout(() => setApproveState("done"), 700)}
                />
              </svg>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="font-heading text-2xl font-bold text-[#F9FAFB] mt-6"
              >
                Edit Approved!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-sm text-[#9CA3AF] mt-2"
              >
                Your editor has been notified.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Revision drawer ── */}
      <AnimatePresence>
        {revisionOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#121212]/60 z-40"
              onClick={() => setRevisionOpen(false)}
            />
            <motion.div
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] shrink-0">
                <div>
                  <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Request Revision</h2>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Round {request.revision_round + 1} of 3</p>
                </div>
                <button
                  onClick={() => setRevisionOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Notes to send</p>
                {comments.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-6">
                    No timestamped notes yet. Add them in the player above first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-3 bg-[#404040] rounded-lg px-3 py-2.5">
                        <span className="text-xs font-mono font-bold text-[#3B82F6] shrink-0 mt-0.5">
                          [{formatTime(c.timestamp_seconds)}]
                        </span>
                        <p className="text-sm text-[#F9FAFB] leading-relaxed">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Last revision warning */}
                {isLastRevision && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-3"
                  >
                    <p className="text-xs text-yellow-400 font-semibold mb-1">Last free revision</p>
                    <p className="text-xs text-yellow-400/80">
                      This is your final included revision. Any further changes will cost +10 credits.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-[#2A2A2A] shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSendRevision}
                  disabled={sendingRevision}
                  className="w-full flex items-center justify-center gap-2 border border-yellow-500/30 text-yellow-400 font-semibold rounded-lg py-3 text-sm hover:bg-yellow-500/5 transition-colors disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                  {sendingRevision ? "Sending…" : "Send to Editor"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Swap editor modal ── */}
      <AnimatePresence>
        {swapOpen && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Why swap editors?</h2>
                <button
                  onClick={() => setSwapOpen(false)}
                  className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-2">
                {SWAP_REASONS.map((reason) => (
                  <label
                    key={reason}
                    onClick={() => setSwapReason(reason)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      swapReason === reason
                        ? "border-[#FF5F15]/40 bg-[#FF5F15]/8"
                        : "border-[#2A2A2A] hover:bg-[#404040]"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      swapReason === reason ? "border-[#FF5F15]" : "border-[#404040]"
                    }`}>
                      {swapReason === reason && <div className="w-2 h-2 rounded-full bg-[#FF5F15]" />}
                    </div>
                    <span className="text-sm text-[#F9FAFB]">{reason}</span>
                  </label>
                ))}

                {swapReason === "Other" && (
                  <input
                    value={swapOtherText}
                    onChange={(e) => setSwapOtherText(e.target.value)}
                    placeholder="Tell us more…"
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none mt-1"
                  />
                )}

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => setSwapOpen(false)}
                    className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm font-medium rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSwap}
                    disabled={!swapReason || (swapReason === "Other" && !swapOtherText.trim()) || swapping}
                    className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] transition-colors disabled:opacity-40"
                  >
                    {swapping ? "Reassigning…" : "Confirm Swap"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
