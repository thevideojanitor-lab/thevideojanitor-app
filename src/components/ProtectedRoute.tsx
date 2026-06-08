import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface Props {
  children: ReactNode
  requireRole?: "client" | "editor"
  requireAdmin?: boolean
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ children, requireRole, requireAdmin, requireOnboarding }: Props) {
  const { user, role, adminRole, onboardingComplete, needsRoleSelection, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Authenticated but no profile row yet (new OAuth user or orphaned account) —
  // finish account setup instead of bouncing to login.
  if (needsRoleSelection) return <Navigate to="/auth/select-role" replace />

  if (!user) return <Navigate to="/auth/login" replace />

  if (requireAdmin && !adminRole) return <Navigate to="/" replace />

  if (requireRole && role !== requireRole) {
    if (role === "client") return <Navigate to="/dashboard" replace />
    if (role === "editor") return <Navigate to="/editor" replace />
    return <Navigate to="/" replace />
  }

  // Already onboarded — redirect away from onboarding routes
  if (requireOnboarding && onboardingComplete) {
    if (role === "editor") return <Navigate to="/editor" replace />
    return <Navigate to="/dashboard" replace />
  }

  // Client not onboarded but hits /dashboard — send to client onboarding
  if (requireRole === "client" && !requireOnboarding && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  // Editor not onboarded but hits /editor — send to editor onboarding
  if (requireRole === "editor" && !requireOnboarding && !onboardingComplete) {
    return <Navigate to="/editor/onboarding" replace />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, role, needsRoleSelection, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Authenticated on a public-only page but still missing a profile row — send
  // them to finish setup rather than showing login/signup again.
  if (needsRoleSelection) return <Navigate to="/auth/select-role" replace />

  if (user) {
    if (role === "client") return <Navigate to="/dashboard" replace />
    if (role === "editor") return <Navigate to="/editor" replace />
    if (role === "admin") return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
