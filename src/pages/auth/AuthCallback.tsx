import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { ensureUserProfile } from "@/lib/ensureUser"

function routeForRole(role: string | null, navigate: (to: string, opts?: { replace?: boolean }) => void) {
  if (role === "editor") navigate("/editor", { replace: true })
  else if (role === "admin") navigate("/admin", { replace: true })
  else navigate("/dashboard", { replace: true })
}

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function run() {
      // After an OAuth redirect the SDK exchanges the code for a session on
      // init; that can lag a tick behind this component, so retry briefly.
      let session = null
      for (let i = 0; i < 10 && !cancelled; i++) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          session = data.session
          break
        }
        await new Promise((r) => setTimeout(r, 300))
      }
      if (cancelled) return

      if (!session) {
        navigate("/auth/login", { replace: true })
        return
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()
      if (cancelled) return

      if (userRow) {
        routeForRole(userRow.role, navigate)
        return
      }

      // No profile row yet. The chosen role can arrive two ways: in auth
      // metadata (email signup with confirmation) or as a ?role= query param we
      // attach to the OAuth redirect (Google signup after picking a role). Use
      // whichever is present to provision now and skip the role step. If neither
      // is present this is a bare OAuth login, so send them to pick a role.
      const metaRole = session.user.user_metadata?.role
      const queryRole = new URLSearchParams(window.location.search).get("role")
      let stashedRole: string | null = null
      try {
        stashedRole = localStorage.getItem("tvj_pending_role")
      } catch {
        stashedRole = null
      }
      const candidate = [metaRole, queryRole, stashedRole].find(
        (r) => r === "client" || r === "editor"
      )
      const chosenRole = (candidate as "client" | "editor" | undefined) ?? null

      if (chosenRole) {
        const { error } = await ensureUserProfile(session.user.id, session.user.email ?? "", chosenRole)
        if (cancelled) return
        try {
          localStorage.removeItem("tvj_pending_role")
        } catch {
          // ignore
        }
        if (!error) {
          navigate(chosenRole === "editor" ? "/editor/onboarding" : "/onboarding", { replace: true })
          return
        }
      }

      navigate("/auth/select-role", { replace: true })
    }

    run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
