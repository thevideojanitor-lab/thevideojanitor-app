import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Loader2, Scissors, Video } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { ensureUserProfile } from "@/lib/ensureUser"
import { useAuthStore } from "@/stores/authStore"
import AuthBackground from "@/components/AuthBackground"

export default function SelectRolePage() {
  const navigate = useNavigate()
  const setNeedsRoleSelection = useAuthStore((s) => s.setNeedsRoleSelection)
  const [selectedRole, setSelectedRole] = useState<"client" | "editor" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!selectedRole) return
    setLoading(true)
    setError(null)

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { navigate("/auth/login"); return }

    const { error: profileErr } = await ensureUserProfile(
      authUser.id,
      authUser.email ?? "",
      selectedRole
    )

    if (profileErr) {
      console.error("[SelectRolePage] profile provisioning failed:", profileErr)
      setError("Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    // The profile row now exists; clear the flag so the route guards let us
    // through to onboarding instead of bouncing back here.
    setNeedsRoleSelection(false)

    if (selectedRole === "editor") {
      navigate("/editor/onboarding")
    } else {
      navigate("/onboarding")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackground />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm space-y-6"
      >
        <motion.div variants={fadeUp} className="text-center">
          <p className="font-heading text-xl font-bold text-foreground">TheVideoJanitors</p>
          <p className="text-sm text-muted-foreground mt-2">One more step — how will you use the platform?</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex gap-3">
            {([
              { role: "client", icon: Video, label: "I'm a Creator", desc: "Submit videos, get edits back in 48h" },
              { role: "editor", icon: Scissors, label: "I'm an Editor", desc: "Fulfil requests and earn weekly" },
            ] as const).map(({ role, icon: Icon, label, desc }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-center transition-all ${
                  selectedRole === role
                    ? "bg-primary/15 border-primary/40"
                    : "bg-input border-border hover:border-muted-foreground/40"
                }`}
              >
                <Icon size={22} className={selectedRole === role ? "text-primary" : "text-muted-foreground"} />
                <p className={`text-xs font-semibold ${selectedRole === role ? "text-primary" : "text-foreground"}`}>{label}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">{desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={!selectedRole || loading}
            onClick={handleConfirm}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-3 text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "Setting up…" : "Continue"}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
