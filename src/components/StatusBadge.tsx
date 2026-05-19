import { motion, AnimatePresence } from "motion/react"
import type { RequestStatus } from "@/lib/supabase"

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  approved:     { label: "Approved",     bg: "rgba(34,197,94,0.15)",  text: "#4ade80", border: "rgba(34,197,94,0.3)" },
  in_progress:  { label: "In Progress",  bg: "rgba(255,95,21,0.15)",  text: "#FF5F15", border: "rgba(255,95,21,0.3)" },
  delivered:    { label: "Review Ready", bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  in_revision:  { label: "In Revision",  bg: "rgba(234,179,8,0.15)",  text: "#facc15", border: "rgba(234,179,8,0.3)" },
  overdue:      { label: "Overdue",      bg: "rgba(239,68,68,0.15)",  text: "#f87171", border: "rgba(239,68,68,0.3)" },
  pending_match:{ label: "Finding Editor", bg: "rgba(64,64,64,0.5)", text: "#9CA3AF", border: "#2A2A2A" },
  matched:      { label: "Matched",      bg: "rgba(64,64,64,0.5)",    text: "#9CA3AF", border: "#2A2A2A" },
  abandoned:    { label: "Abandoned",    bg: "rgba(64,64,64,0.3)",    text: "#9CA3AF", border: "#2A2A2A" },
}

interface Props {
  status: RequestStatus | string
  pulse?: boolean
}

export default function StatusBadge({ status, pulse }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending_match"]

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        role="status"
        aria-label={`Status: ${cfg.label}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${pulse ? "animate-pulse" : ""}`}
        style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: cfg.text }}
        />
        {cfg.label}
      </motion.span>
    </AnimatePresence>
  )
}
