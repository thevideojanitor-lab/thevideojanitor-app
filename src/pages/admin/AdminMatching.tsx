import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Star, Users, Zap } from "lucide-react"
import { fadeUp, scaleIn, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PendingRequest {
  id: string
  client_id: string
  edit_type: string
  credits_cost: number
  brief: Record<string, unknown>
  submitted_at: string
  status: string
  client_email?: string
  client_niches?: string[]
}

interface EditorProfile {
  user_id: string
  display_name: string
  email?: string
  specialties: string[]
  rating: number
  completed_count: number
  max_queue_capacity: number
  current_queue_count: number
  avg_turnaround_hours: number
  scores?: {
    niche: number
    availability: number
    rating: number
    style: number
    total: number
  }
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreEditor(editor: EditorProfile, clientNiches: string[]): EditorProfile["scores"] {
  const matched = editor.specialties.filter((s) => clientNiches.includes(s))
  const niche = Math.round((matched.length / Math.max(clientNiches.length, 1)) * 40)
  const load = editor.current_queue_count / Math.max(editor.max_queue_capacity, 1)
  const availability = load < 0.8 ? 20 : load < 0.9 ? 15 : 5
  const ratingScore = editor.rating >= 4.8 ? 10 : editor.rating >= 4.5 ? 5 : 0
  const style = 15
  return { niche, availability, rating: ratingScore, style, total: niche + availability + ratingScore + style }
}

async function logAction(adminId: string | null, actionType: string, targetId: string, notes: string) {
  await supabase.from("admin_actions").insert({
    admin_id: adminId,
    action_type: actionType,
    target_type: "request",
    target_id: targetId,
    notes,
  })
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-[#9CA3AF]">{label}</span>
        <span className="font-semibold" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Editor score card ─────────────────────────────────────────────────────────

function EditorScoreCard({
  editor,
  rank,
  onAssign,
  assigning,
  assigned,
}: {
  editor: EditorProfile
  rank: number
  onAssign: () => void
  assigning: boolean
  assigned: boolean
}) {
  const s = editor.scores!
  return (
    <motion.div
      variants={fadeUp}
      className={`bg-[#2A2A2A] rounded-xl p-4 border transition-colors ${
        assigned
          ? "border-green-500/40 bg-green-500/5"
          : rank === 1
          ? "border-[#FF5F15]/30"
          : "border-[#404040]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              rank === 1
                ? "bg-[#FF5F15]/20 text-[#FF5F15] border border-[#FF5F15]/30"
                : "bg-[#404040] text-[#9CA3AF]"
            }`}
          >
            {rank}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F9FAFB]">{editor.display_name || "Unnamed Editor"}</p>
            <p className="text-[10px] text-[#9CA3AF]">{editor.email ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] shrink-0">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span>{editor.rating.toFixed(1)}</span>
          <span className="text-[#404040]">·</span>
          <span>{editor.completed_count} jobs</span>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2 mb-4">
        <ScoreBar label="Niche match" value={s.niche} max={40} color="#FF5F15" />
        <ScoreBar label="Availability" value={s.availability} max={20} color="#3B82F6" />
        <ScoreBar label="Rating" value={s.rating} max={10} color="#F59E0B" />
        <ScoreBar label="Style" value={s.style} max={30} color="#8B5CF6" />
      </div>

      {/* Total + queue + assign */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Total</p>
          <p className="font-heading text-2xl font-bold text-[#FF5F15]">{s.total}<span className="text-sm text-[#9CA3AF] font-normal">/100</span></p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#9CA3AF]">Queue</p>
          <p className="text-sm font-semibold text-[#F9FAFB]">{editor.current_queue_count}/{editor.max_queue_capacity}</p>
        </div>
        {assigned ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
            <CheckCircle size={14} />
            Assigned
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAssign}
            disabled={assigning}
            className="px-4 py-2 bg-[#FF5F15] text-[#121212] text-xs font-semibold rounded-lg hover:bg-[#E54E08] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {assigning ? "Assigning…" : "Assign"}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ── Request panel ─────────────────────────────────────────────────────────────

function RequestPanel({
  req,
  editors,
  editorsLoading,
  onAssigned,
}: {
  req: PendingRequest
  editors: EditorProfile[]
  editorsLoading: boolean
  onAssigned: (requestId: string, editorId: string) => void
}) {
  const { user } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [assignedId, setAssignedId] = useState<string | null>(null)

  const niches = req.client_niches ?? []
  const scored = editors
    .map((e) => ({ ...e, scores: scoreEditor(e, niches) }))
    .sort((a, b) => b.scores!.total - a.scores!.total)

  async function handleAssign(editor: EditorProfile) {
    if (assigning) return
    setAssigning(editor.user_id)
    try {
      const due = new Date(Date.now() + 48 * 3600 * 1000).toISOString()
      const { error } = await supabase
        .from("requests")
        .update({ editor_id: editor.user_id, status: "matched", due_at: due })
        .eq("id", req.id)
      if (error) throw error

      await supabase
        .from("editor_profiles")
        .update({ current_queue_count: editor.current_queue_count + 1 })
        .eq("user_id", editor.user_id)

      await logAction(
        user?.id ?? null,
        "editor_reassign",
        req.id,
        `Admin manually assigned editor ${editor.display_name} (score ${editor.scores!.total}/100)`
      )
      setAssignedId(editor.user_id)
      onAssigned(req.id, editor.user_id)
    } catch (err) {
      console.error("Assign error:", err)
    } finally {
      setAssigning(null)
    }
  }

  const isAssigned = assignedId !== null
  const brief = req.brief as Record<string, string>

  return (
    <motion.div
      variants={fadeUp}
      className={`bg-[#404040] border rounded-xl overflow-hidden transition-colors ${
        isAssigned ? "border-green-500/30" : "border-[#2A2A2A]"
      }`}
    >
      {/* Request header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#4A4A4A] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {isAssigned ? (
            <CheckCircle size={16} className="text-green-400 shrink-0" />
          ) : (
            <AlertTriangle size={16} className="text-[#FF5F15] shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-[#F9FAFB]">
              {brief.title ?? req.edit_type} — {req.client_email ?? req.client_id.slice(0, 8)}
            </p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">
              {req.edit_type} · {req.credits_cost}cr · submitted {new Date(req.submitted_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {niches.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {niches.slice(0, 2).map((n) => (
                <span key={n} className="text-[10px] bg-[#FF5F15]/10 text-[#FF5F15] border border-[#FF5F15]/20 px-2 py-0.5 rounded-full">
                  {n}
                </span>
              ))}
            </div>
          )}
          <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
            <Users size={10} />
            {scored.length} editors
          </span>
          {expanded ? <ChevronUp size={16} className="text-[#9CA3AF]" /> : <ChevronDown size={16} className="text-[#9CA3AF]" />}
        </div>
      </button>

      {/* Editor grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#2A2A2A]">
              {editorsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#2A2A2A] rounded-xl p-4 animate-pulse space-y-3">
                      <div className="h-4 w-32 bg-[#404040] rounded" />
                      <div className="h-2 w-full bg-[#404040] rounded" />
                      <div className="h-2 w-3/4 bg-[#404040] rounded" />
                    </div>
                  ))}
                </div>
              ) : scored.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] text-center py-6">No editors available right now.</p>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4"
                >
                  {scored.map((editor, i) => (
                    <EditorScoreCard
                      key={editor.user_id}
                      editor={editor}
                      rank={i + 1}
                      onAssign={() => handleAssign(editor)}
                      assigning={assigning === editor.user_id}
                      assigned={assignedId === editor.user_id}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminMatching() {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [editors, setEditors] = useState<EditorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editorsLoading, setEditorsLoading] = useState(true)
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadRequests(), loadEditors()])
    setLoading(false)
  }

  async function loadRequests() {
    const { data } = await supabase
      .from("requests")
      .select("id, client_id, edit_type, credits_cost, brief, submitted_at, status")
      .eq("status", "pending_match")
      .order("submitted_at", { ascending: true })

    if (!data) return

    const enriched: PendingRequest[] = await Promise.all(
      data.map(async (r) => {
        const [{ data: u }, { data: cp }] = await Promise.all([
          supabase.from("users").select("email").eq("id", r.client_id).single(),
          supabase.from("client_profiles").select("content_niches").eq("user_id", r.client_id).single(),
        ])
        return {
          ...r,
          client_email: u?.email,
          client_niches: (cp as { content_niches?: string[] } | null)?.content_niches ?? [],
        }
      })
    )
    setRequests(enriched)
  }

  async function loadEditors() {
    setEditorsLoading(true)
    const { data: profiles } = await supabase
      .from("editor_profiles")
      .select("*")
      .eq("is_active", true)

    if (!profiles) { setEditorsLoading(false); return }

    const enriched: EditorProfile[] = await Promise.all(
      profiles.map(async (ep) => {
        const { data: u } = await supabase.from("users").select("email").eq("id", ep.user_id).single()
        return { ...ep, email: u?.email }
      })
    )
    setEditors(enriched)
    setEditorsLoading(false)
  }

  function handleAssigned(requestId: string) {
    setAssignedIds((prev) => new Set([...prev, requestId]))
    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
      setAssignedIds((prev) => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }, 2000)
  }

  const pending = requests.filter((r) => !assignedIds.has(r.id))

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Manual Matching</h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Assign editors to unmatched requests — scores calculated from CLAUDE.md algorithm
        </p>
      </motion.div>

      {/* Summary bar */}
      <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl px-5 py-4 flex items-center gap-6">
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Pending Match</p>
          <p className="font-heading text-3xl font-bold text-[#FF5F15]">{loading ? "—" : pending.length}</p>
        </div>
        <div className="w-px h-10 bg-[#2A2A2A]" />
        <div>
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Available Editors</p>
          <p className="font-heading text-3xl font-bold text-[#F9FAFB]">{editorsLoading ? "—" : editors.length}</p>
        </div>
        <div className="ml-auto">
          <span className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
            <Zap size={10} className="text-[#FF5F15]" /> Expand each card to see ranked editors
          </span>
        </div>
      </motion.div>

      {/* Request list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-[#2A2A2A] rounded mb-2" />
              <div className="h-3 w-32 bg-[#2A2A2A] rounded" />
            </div>
          ))}
        </div>
      ) : pending.length === 0 ? (
        <motion.div
          variants={scaleIn}
          className="bg-[#404040] border border-[#2A2A2A] rounded-xl px-5 py-12 text-center"
        >
          <CheckCircle size={36} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#F9FAFB]">Queue is clear!</p>
          <p className="text-xs text-[#9CA3AF] mt-1">All requests have been matched.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {pending.map((req) => (
            <RequestPanel
              key={req.id}
              req={req}
              editors={editors}
              editorsLoading={editorsLoading}
              onAssigned={handleAssigned}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
