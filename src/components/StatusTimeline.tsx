import { motion } from "motion/react"
import type { RequestStatus } from "@/lib/supabase"

const STEPS: { status: RequestStatus; label: string }[] = [
  { status: "pending_match", label: "Submitted" },
  { status: "matched",       label: "Editor Matched" },
  { status: "in_progress",   label: "In Progress" },
  { status: "delivered",     label: "Delivered" },
  { status: "approved",      label: "Approved" },
]

const STATUS_ORDER: Record<string, number> = {
  pending_match: 0,
  matched:       1,
  in_progress:   2,
  delivered:     3,
  in_revision:   3,
  approved:      4,
  abandoned:     4,
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

interface Props {
  currentStatus: RequestStatus | string
  submittedAt?: string
  deliveredAt?: string
  approvedAt?: string
  revisionRound?: number
}

function getTimestamp(stepStatus: RequestStatus, props: Props): string | null {
  if (stepStatus === "pending_match" && props.submittedAt) return formatAbsolute(props.submittedAt)
  if (stepStatus === "delivered" && props.deliveredAt) return formatAbsolute(props.deliveredAt)
  if (stepStatus === "approved" && props.approvedAt) return formatAbsolute(props.approvedAt)
  return null
}

export default function StatusTimeline({ currentStatus, submittedAt, deliveredAt, approvedAt, revisionRound }: Props) {
  const currentOrder = STATUS_ORDER[currentStatus] ?? 0
  const isRevision = currentStatus === "in_revision"

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, i) => {
        const stepOrder = STATUS_ORDER[step.status]
        const isPast    = stepOrder < currentOrder || (stepOrder === currentOrder && step.status === currentStatus)
        const isCurrent = step.status === currentStatus || (step.status === "delivered" && isRevision)
        const isFuture  = stepOrder > currentOrder && !(step.status === "delivered" && isRevision)
        const timestamp = getTimestamp(step.status, { currentStatus, submittedAt, deliveredAt, approvedAt })

        return (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                {isPast && !isCurrent ? (
                  <svg viewBox="0 0 20 20" className="w-5 h-5">
                    <circle cx="10" cy="10" r="9" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" />
                    <motion.path
                      d="M6 10l3 3 5-5"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                ) : isCurrent ? (
                  <span className="relative flex w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5F15] opacity-40" />
                    <span className="relative inline-flex rounded-full w-3 h-3 bg-[#FF5F15]" />
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2A2A2A] border border-[#404040]" />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-px flex-1 min-h-[24px] mt-1 ${isPast && !isCurrent ? "bg-[rgba(34,197,94,0.3)]" : "bg-[#2A2A2A]"}`} />
              )}
            </div>

            <div className="pb-5 min-w-0">
              <p className={`text-xs font-medium leading-5 ${
                isCurrent ? "text-[#FF5F15]" : isPast && !isCurrent ? "text-[#4ade80]" : "text-[#9CA3AF]"
              }`}>
                {step.label}
                {step.status === "delivered" && isRevision && revisionRound && (
                  <span className="ml-2 text-[#facc15] text-[10px]">
                    · Revision {revisionRound} of 3
                  </span>
                )}
                {step.status === "delivered" && isRevision && !revisionRound && (
                  <span className="ml-2 text-[#facc15] text-[10px]">· Revision requested</span>
                )}
              </p>
              {timestamp && (
                <p className="text-[10px] text-[#9CA3AF] mt-0.5" title={timestamp}>
                  {timestamp}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
