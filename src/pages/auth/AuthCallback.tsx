import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { navigate("/auth/login"); return }

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()

      if (!userRow) {
        // New OAuth user — no users row yet, let them pick their role
        navigate("/auth/select-role")
      } else if (userRow.role === "editor") {
        navigate("/editor")
      } else if (userRow.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FF5F15] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
