import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { fadeUp } from "@/lib/animations"
import { ArrowRight } from "lucide-react"

const DRAFT_KEY = "editor_onboarding_draft"

export default function ProfileStep() {
  const navigate = useNavigate()
  const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")
  const [name, setName] = useState<string>(saved.displayName ?? "")
  const [bio, setBio] = useState<string>(saved.bio ?? "")

  const bioLen = bio.trim().length
  const valid = name.trim().length >= 2 && bioLen >= 50 && bioLen <= 300

  function handleNext() {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...saved, displayName: name.trim(), bio: bio.trim() }))
    navigate("/editor/onboarding/specialties")
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#F9FAFB]">Tell us about yourself</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">This is what clients see when you're matched with them.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">Display Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#F9FAFB] text-sm placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">Bio *</label>
            <span className={`text-xs ${
              bioLen === 0 ? "text-[#9CA3AF]"
              : bioLen < 50 ? "text-yellow-400"
              : bioLen > 300 ? "text-red-400"
              : "text-[#4ade80]"
            }`}>
              {bioLen} / 300
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Describe your editing style, experience, and what you specialise in…"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#F9FAFB] text-sm placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition resize-none"
          />
          <p className="text-xs text-[#9CA3AF]">Minimum 50 characters</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleNext}
        disabled={!valid}
        className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  )
}
