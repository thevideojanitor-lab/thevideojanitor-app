import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { fadeUp } from "@/lib/animations"
import { ArrowLeft, Loader2, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

const DRAFT_KEY = "editor_onboarding_draft"

const NICHE_LABELS: Record<string, string> = {
  reels: "Reels", tiktok: "TikTok", youtube_shorts: "YouTube Shorts",
  travel: "Travel", lifestyle: "Lifestyle", gaming: "Gaming",
  fitness: "Fitness", food: "Food", fashion: "Fashion",
  education: "Education", tech: "Tech", vlog: "Vlog",
}

export default function LaunchStep() {
  const navigate = useNavigate()
  const { user, setOnboardingComplete } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")
  const { displayName, bio, specialties = [], portfolioLinks = [], avgTurnaround = 48 } = draft

  async function handleLaunch() {
    if (!user?.id) return
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.from("editor_profiles").insert({
      user_id: user.id,
      display_name: displayName,
      bio,
      specialties,
      portfolio_links: portfolioLinks,
      avg_turnaround_hours: avgTurnaround,
      is_active: true,
    })

    if (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    sessionStorage.removeItem(DRAFT_KEY)
    setOnboardingComplete(true)
    navigate("/editor")
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#F9FAFB]">Ready to launch?</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Review your profile before going live.</p>
      </div>

      {/* Summary card */}
      <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Display Name</p>
          <p className="text-[#F9FAFB] font-medium mt-0.5">{displayName || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Bio</p>
          <p className="text-[#F9FAFB]/80 text-sm mt-0.5 leading-relaxed line-clamp-3">{bio || "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Specialties</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {(specialties as string[]).map((s) => (
              <span
                key={s}
                className="bg-[#FF5F15]/10 border border-[#FF5F15]/30 text-[#FF5F15] text-xs px-2.5 py-0.5 rounded-full"
              >
                {NICHE_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Avg Turnaround</p>
            <p className="text-[#F9FAFB] font-medium mt-0.5">{avgTurnaround}h</p>
          </div>
          {(portfolioLinks as string[]).length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-[#9CA3AF]">Portfolio</p>
              <p className="text-[#F9FAFB] font-medium mt-0.5">
                {(portfolioLinks as string[]).length} link{(portfolioLinks as string[]).length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
        <Info size={16} className="text-[#FF5F15] shrink-0 mt-0.5" />
        <p className="text-sm text-[#9CA3AF]">
          Set up your payout details from the Earnings page after launch — you won't miss any payments.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/editor/onboarding/specialties")}
          className="flex items-center gap-1.5 px-4 py-3 border border-[#404040] text-[#F9FAFB] rounded-lg text-sm font-medium hover:bg-[#404040] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLaunch}
          disabled={loading || !displayName || !bio || specialties.length === 0}
          className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? "Launching…" : "Launch Profile"}
        </motion.button>
      </div>
    </motion.div>
  )
}
