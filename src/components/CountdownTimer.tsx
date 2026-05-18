import { useState, useEffect } from "react"
import { AlertTriangle, Clock } from "lucide-react"

interface Props {
  dueAt: string | null
  className?: string
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export default function CountdownTimer({ dueAt, className = "" }: Props) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!dueAt) return

    const tick = () => {
      const ms = new Date(dueAt).getTime() - Date.now()
      setRemaining(ms)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [dueAt])

  if (!dueAt) return null
  if (remaining === null) return null

  if (remaining <= 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40 shadow-[0_0_12px_rgba(248,113,113,0.25)] ${className}`}>
        <AlertTriangle size={11} className="text-red-400 animate-pulse shrink-0" />
        <span className="font-mono text-xs font-bold text-red-400 animate-pulse">OVERDUE</span>
      </div>
    )
  }

  const totalSec = Math.floor(remaining / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60

  const colorClass =
    h > 12
      ? "text-[#FF5F15]"
      : h >= 4
      ? "text-yellow-400"
      : "text-red-400 animate-pulse"

  const bgClass =
    h > 12
      ? "bg-[#FF5F15]/5 border-[#FF5F15]/20"
      : h >= 4
      ? "bg-yellow-400/5 border-yellow-400/20"
      : "bg-red-500/10 border-red-500/30 shadow-[0_0_8px_rgba(248,113,113,0.2)]"

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${bgClass} ${className}`}>
      <Clock size={11} className={`shrink-0 ${colorClass}`} />
      <span className={`font-mono text-xs font-bold tabular-nums ${colorClass}`}>
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  )
}
