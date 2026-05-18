import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

const NICHES = [
  "Talking Head", "Podcast Clips", "UGC / Product Demos",
  "Vlogs / Lifestyle", "E-commerce", "Real Estate",
  "Fitness / Health", "Education / Explainers",
]

const FREQUENCIES = [
  { value: "1-2/week", label: "1–2×/week" },
  { value: "3-5/week", label: "3–5×/week" },
  { value: "daily",    label: "Daily" },
  { value: "varies",   label: "Varies" },
]

export default function StyleStep() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [frequency, setFrequency] = useState("")
  const [saving, setSaving] = useState(false)

  const toggle = (niche: string) => {
    setSelected((prev) => prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche])
  }

  const handleSave = async () => {
    if (!user?.id || !frequency) return
    setSaving(true)

    await supabase
      .from("client_profiles")
      .update({
        content_niches: selected,
        posting_frequency: frequency,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    setSaving(false)
    navigate("/onboarding/preferences")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#F9FAFB] mb-1">What kind of content do you make?</h1>
        <p className="text-sm text-[#9CA3AF]">We use this to match you with the most relevant editor.</p>
      </div>

      {/* Niche grid */}
      <div>
        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Content Type (select all that apply)</p>
        <div className="grid grid-cols-2 gap-2.5">
          {NICHES.map((niche) => {
            const active = selected.includes(niche)
            return (
              <motion.button
                key={niche}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(niche)}
                className={`px-4 py-3 rounded-xl text-sm font-medium text-left border transition-all ${
                  active
                    ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/40"
                    : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040] hover:text-[#F9FAFB]"
                }`}
              >
                {niche}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Posting frequency */}
      <div>
        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">How often do you post?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {FREQUENCIES.map(({ value, label }) => (
            <motion.button
              key={value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFrequency(value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                frequency === value
                  ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/40"
                  : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040] hover:text-[#F9FAFB]"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={saving || !frequency}
        className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        {saving ? "Saving…" : "Continue"}
      </motion.button>
    </div>
  )
}
