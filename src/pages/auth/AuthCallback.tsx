import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard")
      else navigate("/auth/login")
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#FF5F15] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
