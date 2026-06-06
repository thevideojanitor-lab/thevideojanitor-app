import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Loader2, ArrowLeft } from "lucide-react"
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
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">What kind of content do you make?</h1>
        <p className="text-sm text-muted-foreground">We use this to match you with the most relevant editor.</p>
      </div>

      {/* Niche grid */}
      <div>
        <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-3">Content Type (select all that apply)</p>
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
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-input text-muted-foreground border-border hover:border-card hover:text-foreground"
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
        <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-3">How often do you post?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {FREQUENCIES.map(({ value, label }) => (
            <motion.button
              key={value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFrequency(value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                frequency === value
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-input text-muted-foreground border-border hover:border-card hover:text-foreground"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/onboarding/brand-kit")}
          className="flex items-center gap-1.5 px-4 py-3.5 border border-card text-foreground rounded-lg text-sm font-medium hover:bg-card transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || !frequency}
          className="flex-1 bg-primary text-background font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Saving…" : "Continue"}
        </motion.button>
      </div>
    </div>
  )
}
