import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { fadeUp } from "@/lib/animations"
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react"

const DRAFT_KEY = "editor_onboarding_draft"

const NICHES: { key: string; label: string }[] = [
  { key: "reels",          label: "Reels" },
  { key: "tiktok",         label: "TikTok" },
  { key: "youtube_shorts", label: "YouTube Shorts" },
  { key: "travel",         label: "Travel" },
  { key: "lifestyle",      label: "Lifestyle" },
  { key: "gaming",         label: "Gaming" },
  { key: "fitness",        label: "Fitness" },
  { key: "food",           label: "Food" },
  { key: "fashion",        label: "Fashion" },
  { key: "education",      label: "Education" },
  { key: "tech",           label: "Tech" },
  { key: "vlog",           label: "Vlog" },
]

export default function SpecialtiesStep() {
  const navigate = useNavigate()
  const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")
  const [selected, setSelected] = useState<string[]>(saved.specialties ?? [])
  const [links, setLinks] = useState<string[]>(saved.portfolioLinks?.length ? saved.portfolioLinks : [""])
  const [turnaround, setTurnaround] = useState<number>(saved.avgTurnaround ?? 48)

  function toggleNiche(key: string) {
    setSelected((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key])
  }

  function updateLink(i: number, val: string) {
    setLinks((prev) => { const next = [...prev]; next[i] = val; return next })
  }

  function addLink() {
    if (links.length < 3) setLinks((prev) => [...prev, ""])
  }

  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleNext() {
    const cleanLinks = links.map((l) => l.trim()).filter(Boolean)
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...saved, specialties: selected, portfolioLinks: cleanLinks, avgTurnaround: turnaround })
    )
    navigate("/editor/onboarding/launch")
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#F9FAFB]">Your specialties</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">We use this to match you with the right clients.</p>
      </div>

      {/* Niche chips */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">
          Content Niches * <span className="normal-case">(pick at least one)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {NICHES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleNiche(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selected.includes(key)
                  ? "bg-[#FF5F15]/10 border-[#FF5F15]/50 text-[#FF5F15]"
                  : "bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#404040] hover:text-[#F9FAFB]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Avg turnaround */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">Avg Turnaround</label>
        <div className="flex gap-2">
          {[24, 48].map((h) => (
            <button
              key={h}
              onClick={() => setTurnaround(h)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                turnaround === h
                  ? "bg-[#FF5F15]/10 border-[#FF5F15]/50 text-[#FF5F15]"
                  : "bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#404040]"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio links */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">
          Portfolio Links <span className="normal-case">(optional, up to 3)</span>
        </label>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={link}
                onChange={(e) => updateLink(i, e.target.value)}
                placeholder="https://vimeo.com/yourwork"
                className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F9FAFB] text-sm placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition"
              />
              {links.length > 1 && (
                <button
                  onClick={() => removeLink(i)}
                  className="p-2.5 text-[#9CA3AF] hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {links.length < 3 && (
            <button
              onClick={addLink}
              className="flex items-center gap-1.5 text-xs text-[#FF5F15] hover:text-[#E54E08] transition-colors"
            >
              <Plus size={14} /> Add another link
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/editor/onboarding/profile")}
          className="flex items-center gap-1.5 px-4 py-3 border border-[#404040] text-[#F9FAFB] rounded-lg text-sm font-medium hover:bg-[#404040] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={selected.length === 0}
          className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  )
}
