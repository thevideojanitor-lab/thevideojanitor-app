import { motion, AnimatePresence } from "motion/react"
import type { RequestStatus } from "@/lib/supabase"

// status -> { label, tone }. `tone` selects the CSS-variable group
// (--status-<tone>-bg/-fg/-border) defined per-theme in src/index.css.
export const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  approved:      { label: "Approved",       tone: "approved" },
  in_progress:   { label: "In Progress",    tone: "in_progress" },
  delivered:     { label: "Review Ready",   tone: "delivered" },
  in_revision:   { label: "In Revision",    tone: "in_revision" },
  overdue:       { label: "Overdue",        tone: "overdue" },
  pending_match: { label: "Finding Editor", tone: "pending" },
  matched:       { label: "Matched",        tone: "pending" },
  abandoned:     { label: "Abandoned",      tone: "abandoned" },
}

// Resolves a status to its label + theme-aware CSS-variable colors.
// Unknown statuses fall back to the "Finding Editor" / pending tone.
export function resolveStatus(status: string) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending_match"]
  const { tone } = cfg
  return {
    label: cfg.label,
    tone,
    backgroundColor: `var(--status-${tone}-bg)`,
    color: `var(--status-${tone}-fg)`,
    borderColor: `var(--status-${tone}-border)`,
  }
}

interface Props {
  status: RequestStatus | string
  pulse?: boolean
}

export default function StatusBadge({ status, pulse }: Props) {
  const { label, backgroundColor, color, borderColor } = resolveStatus(status)

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        role="status"
        aria-label={`Status: ${label}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${pulse ? "animate-pulse" : ""}`}
        style={{ backgroundColor, color, borderColor }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {label}
      </motion.span>
    </AnimatePresence>
  )
}
