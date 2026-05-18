import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowLeftRight, Loader2, X } from "lucide-react"
import { scaleIn } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"
import type { Request } from "@/lib/supabase"
import { track } from "@vercel/analytics"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

const SWAP_REASONS = [
  { key: "quality", label: "Quality issues with delivery" },
  { key: "style", label: "Style doesn't match my brand" },
  { key: "communication", label: "Communication issues" },
  { key: "other", label: "Other" },
]

interface Props {
  request: Request
  onClose: () => void
  onSwapped: () => void
}

export default function SwapEditorModal({ request, onClose, onSwapped }: Props) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [reason, setReason] = useState<string | null>(null)
  const [otherText, setOtherText] = useState("")
  const [working, setWorking] = useState(false)

  const canConfirm = reason && (reason !== "other" || otherText.trim().length > 0)
  const fullReason = reason === "other" ? otherText.trim() : SWAP_REASONS.find((r) => r.key === reason)?.label ?? reason

  async function handleSwap() {
    if (!user || !canConfirm || !request.editor_id) return
    setWorking(true)

    try {
      const previousEditorId = request.editor_id

      // 1. Clear editor, set pending_match, new 24h deadline
      const newDue = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      await supabase
        .from("requests")
        .update({ editor_id: null, status: "pending_match", due_at: newDue })
        .eq("id", request.id)

      // 2. Decrement previous editor queue count
      const { data: prevProfile } = await supabase
        .from("editor_profiles")
        .select("current_queue_count")
        .eq("user_id", previousEditorId)
        .single()
      if (prevProfile) {
        await supabase
          .from("editor_profiles")
          .update({ current_queue_count: Math.max(0, prevProfile.current_queue_count - 1) })
          .eq("user_id", previousEditorId)
      }

      // 3. Log to admin_actions
      await supabase.from("admin_actions").insert({
        admin_id: null,
        action_type: "editor_swap",
        target_type: "request",
        target_id: request.id,
        notes: `Client swap — ${fullReason}`,
      })

      // 4. Call match-editor, excluding previous editor
      const token = (await supabase.auth.getSession()).data.session?.access_token
      let newEditorName: string | null = null
      let newDueAt = newDue
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/match-editor`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: request.id, excludeEditorId: previousEditorId }),
        })
        const data = await res.json()
        if (data.matched) {
          newEditorName = data.editor?.displayName ?? null
          newDueAt = data.dueAt ?? newDue
        }
      } catch {
        // Match will be retried by cron — that's fine
      }

      track("editor_swapped", { reason: reason! })

      toast({
        title: newEditorName ? `Swapped! ${newEditorName} will deliver by ${new Date(newDueAt).toLocaleDateString()}` : "Swap requested — matching a new editor",
        description: "No credits charged. Your request is back in the queue.",
      })
      onSwapped()
      onClose()
    } catch {
      toast({ title: "Swap failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <AnimatePresence>
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={16} className="text-[#FF5F15]" />
              <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Swap Editor</h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs text-[#9CA3AF]">
            We'll immediately find a different editor. No credits charged — your new editor gets a fresh 24-hour deadline.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Why are you swapping?</p>
            {SWAP_REASONS.map(({ key, label }) => (
              <label
                key={key}
                onClick={() => setReason(key)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  reason === key
                    ? "border-[#FF5F15]/40 bg-[#FF5F15]/8"
                    : "border-[#2A2A2A] hover:bg-[#404040]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  reason === key ? "border-[#FF5F15]" : "border-[#404040]"
                }`}>
                  {reason === key && <div className="w-2 h-2 rounded-full bg-[#FF5F15]" />}
                </div>
                <span className="text-sm text-[#F9FAFB]">{label}</span>
              </label>
            ))}
          </div>

          <AnimatePresence>
            {reason === "other" && (
              <motion.textarea
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Please describe the issue…"
                rows={3}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 resize-none transition-colors"
              />
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-xl py-2.5 hover:text-[#F9FAFB] transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSwap}
              disabled={!canConfirm || working}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-xl py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors"
            >
              {working ? <Loader2 size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}
              {working ? "Swapping…" : "Swap Editor"}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
