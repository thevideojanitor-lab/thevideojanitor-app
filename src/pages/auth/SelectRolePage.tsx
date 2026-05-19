import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Loader2, Scissors, Video } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { detectRegion, persistRegionToUser } from "@/lib/region"
import AuthBackground from "@/components/AuthBackground"

export default function SelectRolePage() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<"client" | "editor" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!selectedRole) return
    setLoading(true)
    setError(null)

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { navigate("/auth/login"); return }

    const regionConfig = await detectRegion()

    const { error: insertErr } = await supabase.from("users").insert({
      id: authUser.id,
      email: authUser.email ?? "",
      role: selectedRole,
      region: regionConfig.region,
      currency: regionConfig.currency,
    })

    if (insertErr) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    if (selectedRole === "client") {
      await supabase.from("client_profiles").insert({ user_id: authUser.id })
    }

    await persistRegionToUser(authUser.id, regionConfig)

    if (selectedRole === "editor") {
      navigate("/editor/onboarding")
    } else {
      navigate("/onboarding")
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackground />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm space-y-6"
      >
        <motion.div variants={fadeUp} className="text-center">
          <p className="font-heading text-xl font-bold text-[#F9FAFB]">TheVideoJanitors</p>
          <p className="text-sm text-[#9CA3AF] mt-2">One more step — how will you use the platform?</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
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
                    ? "bg-[#FF5F15]/15 border-[#FF5F15]/40"
                    : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#404040]"
                }`}
              >
                <Icon size={22} className={selectedRole === role ? "text-[#FF5F15]" : "text-[#9CA3AF]"} />
                <p className={`text-xs font-semibold ${selectedRole === role ? "text-[#FF5F15]" : "text-[#F9FAFB]"}`}>{label}</p>
                <p className="text-[10px] text-[#9CA3AF] leading-snug">{desc}</p>
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
            className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-xl py-3 text-sm hover:bg-[#E54E08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {loading ? "Setting up…" : "Continue"}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
