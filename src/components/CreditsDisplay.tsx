import { useEffect } from "react"
import { motion } from "motion/react"
import { Link } from "react-router-dom"
import { useCreditsStore } from "@/stores/creditsStore"
import { useAuthStore } from "@/stores/authStore"

interface Props {
  compact?: boolean
}

export default function CreditsDisplay({ compact = false }: Props) {
  const { balance, total, loading, refresh } = useCreditsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.id) refresh(user.id)
  }, [user?.id])

  const pct = total > 0 ? Math.min(100, (balance / total) * 100) : 0
  const isCritical = pct < 10
  const isLow = pct < 20

  if (loading && balance === 0) {
    return (
      <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
        <div className="w-16 h-1.5 bg-border rounded-full animate-pulse" />
      </div>
    )
  }

  if (compact) {
    return (
      <Link
        to="/dashboard/subscription"
        className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/15 transition-colors"
      >
        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Credits</span>
        <span className="font-heading text-sm font-bold text-primary">
          {balance.toLocaleString()}
        </span>
        {isLow && (
          <Link
            to="/dashboard/subscription"
            className="text-[10px] font-semibold text-primary bg-primary/20 rounded px-1.5 py-0.5 ml-1"
          >
            Recharge
          </Link>
        )}
      </Link>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans uppercase tracking-wider text-muted-foreground">Credits</span>
        <span className="font-heading text-sm font-bold text-primary">
          {balance.toLocaleString()} <span className="text-muted-foreground font-normal">/ {total.toLocaleString()}</span>
        </span>
      </div>

      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isCritical ? "animate-pulse" : ""}`}
          style={{ backgroundColor: "#FF5F15" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {isLow && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {isCritical ? "Almost out of credits" : "Credits running low"}
          </p>
          <Link
            to="/dashboard/subscription"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Recharge →
          </Link>
        </div>
      )}
    </div>
  )
}
