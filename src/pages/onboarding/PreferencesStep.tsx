import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Loader2, Check, ArrowLeft } from "lucide-react"
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
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">How do you like to work?</h1>
        <p className="text-sm text-muted-foreground">Pick up to 3 — your editor will adjust their approach.</p>
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
                  ? "bg-primary/15 text-primary border-primary/40"
                  : disabled
                  ? "bg-input text-card border-border cursor-not-allowed"
                  : "bg-input text-muted-foreground border-border hover:border-border hover:text-foreground"
              }`}
            >
              {label}
              {active && <Check size={14} className="text-primary shrink-0" />}
            </motion.button>
          )
        })}
      </div>

      {/* Reference link */}
      <div>
        <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
          Paste a video you love (optional)
        </p>
        <input
          type="url"
          value={referenceLink}
          onChange={(e) => setReferenceLink(e.target.value)}
          placeholder="https://..."
          className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/onboarding/style")}
          className="flex items-center gap-1.5 px-4 py-3.5 border border-border text-foreground rounded-lg text-sm font-medium hover:bg-card transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleComplete}
          disabled={saving}
          className="flex-1 bg-primary text-background font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? "Finishing setup…" : "Complete Setup"}
        </motion.button>
      </div>
    </div>
  )
}
