import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Loader2, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { track } from "@vercel/analytics"

const STYLE_PREFS = [
  { value: "speed",          label: "Fast delivery above all" },
  { value: "brand_learning", label: "Editor that learns my brand" },
  { value: "creative",       label: "Creative suggestions welcome" },
  { value: "follow_brief",   label: "Stick exactly to my brief" },
  { value: "communication",  label: "Frequent check-ins" },
]

export default function PreferencesStep() {
  const { user, setOnboardingComplete } = useAuthStore()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState<string[]>([])
  const [referenceLink, setReferenceLink] = useState("")
  const [saving, setSaving] = useState(false)

  const toggle = (v: string) => {
    setPrefs((prev) =>
      prev.includes(v)
        ? prev.filter((p) => p !== v)
        : prev.length < 3 ? [...prev, v] : prev
    )
  }

  const handleComplete = async () => {
    if (!user?.id) return
    setSaving(true)

    await supabase
      .from("client_profiles")
      .update({
        style_preferences: prefs,
        reference_video_url: referenceLink || null,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    track("onboarding_completed", { region: user.region ?? "US" })
    setOnboardingComplete(true)
    setSaving(false)
    navigate("/dashboard")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#F9FAFB] mb-1">How do you like to work?</h1>
        <p className="text-sm text-[#9CA3AF]">Pick up to 3 — your editor will adjust their approach.</p>
      </div>

      {/* Style preferences */}
      <div className="space-y-2.5">
        {STYLE_PREFS.map(({ value, label }) => {
          const active = prefs.includes(value)
          const disabled = !active && prefs.length >= 3
          return (
            <motion.button
              key={value}
              whileTap={{ scale: 0.98 }}
              onClick={() => !disabled && toggle(value)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium border transition-all ${
                active
                  ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/40"
                  : disabled
                  ? "bg-[#1A1A1A] text-[#404040] border-[#2A2A2A] cursor-not-allowed"
                  : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040] hover:text-[#F9FAFB]"
              }`}
            >
              {label}
              {active && <Check size={14} className="text-[#FF5F15] shrink-0" />}
            </motion.button>
          )
        })}
      </div>

      {/* Reference link */}
      <div>
        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">
          Paste a video you love (optional)
        </p>
        <input
          type="url"
          value={referenceLink}
          onChange={(e) => setReferenceLink(e.target.value)}
          placeholder="https://..."
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleComplete}
        disabled={saving}
        className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        {saving ? "Finishing setup…" : "Complete Setup"}
      </motion.button>
    </div>
  )
}
