import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { AlertCircle, Check, Loader2, Plus, Star, X } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"

const NICHES: { key: string; label: string }[] = [
  { key: "reels", label: "Reels" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube_shorts", label: "YouTube Shorts" },
  { key: "travel", label: "Travel" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "gaming", label: "Gaming" },
  { key: "fitness", label: "Fitness" },
  { key: "food", label: "Food" },
  { key: "fashion", label: "Fashion" },
  { key: "education", label: "Education" },
  { key: "tech", label: "Tech" },
  { key: "vlog", label: "Vlog" },
]

interface EditorProfileRow {
  display_name: string | null
  bio: string | null
  specialties: string[] | null
  portfolio_links: string[] | null
  avg_turnaround_hours: number | null
  max_queue_capacity: number | null
  accepts_repeat_clients: boolean | null
  rating: number | null
  completed_count: number | null
  current_queue_count: number | null
}

export default function EditorProfile() {
  const { user } = useAuthStore()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<{ rating: number; completed: number; queue: number } | null>(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [specialties, setSpecialties] = useState<string[]>([])
  const [links, setLinks] = useState<string[]>([""])
  const [turnaround, setTurnaround] = useState(48)
  const [capacity, setCapacity] = useState(5)
  const [acceptsRepeat, setAcceptsRepeat] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
  }, [user?.id])

  async function loadProfile() {
    setLoading(true)
    const { data } = await supabase
      .from("editor_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle()
    if (data) {
      const p = data as EditorProfileRow
      setName(p.display_name ?? "")
      setBio(p.bio ?? "")
      setSpecialties(p.specialties ?? [])
      setLinks(p.portfolio_links?.length ? p.portfolio_links : [""])
      setTurnaround(p.avg_turnaround_hours ?? 48)
      setCapacity(p.max_queue_capacity ?? 5)
      setAcceptsRepeat(p.accepts_repeat_clients ?? true)
      setStats({
        rating: p.rating ?? 5,
        completed: p.completed_count ?? 0,
        queue: p.current_queue_count ?? 0,
      })
    }
    setLoading(false)
  }

  const bioLen = bio.trim().length
  const valid = name.trim().length >= 2 && bioLen >= 50 && bioLen <= 300 && specialties.length > 0

  function toggleNiche(key: string) {
    setSpecialties((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]))
  }
  function updateLink(i: number, val: string) {
    setLinks((prev) => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }
  function addLink() {
    if (links.length < 3) setLinks((prev) => [...prev, ""])
  }
  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!user?.id || !valid) return
    setSaving(true)
    setError(null)
    const { error: updateErr } = await supabase
      .from("editor_profiles")
      .update({
        display_name: name.trim(),
        bio: bio.trim(),
        specialties,
        portfolio_links: links.map((l) => l.trim()).filter(Boolean),
        avg_turnaround_hours: turnaround,
        max_queue_capacity: capacity,
        accepts_repeat_clients: acceptsRepeat,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
    setSaving(false)
    if (updateErr) {
      setError("We couldn't save your profile. Please try again.")
      return
    }
    toast({ title: "Profile updated", description: "Your changes are live." })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-7 w-40 bg-[#404040] rounded-lg animate-pulse" />
        <div className="h-20 bg-[#404040] rounded-xl animate-pulse" />
        <div className="h-44 bg-[#404040] rounded-xl animate-pulse" />
        <div className="h-44 bg-[#404040] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6 pb-10"
    >
      <motion.div variants={fadeUp}>
        <h1 className="font-heading text-2xl font-bold text-[#F9FAFB]">Your Profile</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          This is what clients see, and what the matching algorithm uses to assign you work.
        </p>
      </motion.div>

      {/* Read-only performance stats */}
      {stats && (
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1">Rating</p>
            <p className="font-heading text-2xl font-bold text-[#FF5F15] flex items-center gap-1">
              <Star size={15} className="fill-[#FF5F15]" />
              {stats.rating.toFixed(1)}
            </p>
          </div>
          <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1">Completed</p>
            <p className="font-heading text-2xl font-bold text-[#F9FAFB]">{stats.completed}</p>
          </div>
          <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1">In Queue</p>
            <p className="font-heading text-2xl font-bold text-[#F9FAFB]">
              {stats.queue}
              <span className="text-sm text-[#9CA3AF] font-normal">/{capacity}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Editable fields */}
      <motion.div variants={fadeUp} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="ep-name" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">
            Display Name
          </label>
          <input
            id="ep-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#F9FAFB] text-sm placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="ep-bio" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">
              Bio
            </label>
            <span
              className={`text-xs ${
                bioLen === 0
                  ? "text-[#9CA3AF]"
                  : bioLen < 50
                  ? "text-yellow-400"
                  : bioLen > 300
                  ? "text-red-400"
                  : "text-[#4ade80]"
              }`}
            >
              {bioLen} / 300
            </span>
          </div>
          <textarea
            id="ep-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Describe your editing style, experience, and what you specialise in…"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#F9FAFB] text-sm placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition resize-none"
          />
          <p className="text-xs text-[#9CA3AF]">Minimum 50 characters</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">Content Niches</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map(({ key, label }) => {
              const active = specialties.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleNiche(key)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-[#FF5F15]/10 border-[#FF5F15]/50 text-[#FF5F15]"
                      : "bg-[#1A1A1A] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#404040] hover:text-[#F9FAFB]"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">Avg Turnaround</p>
            <div className="flex gap-2">
              {[24, 48].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setTurnaround(h)}
                  aria-pressed={turnaround === h}
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
          <div className="space-y-2">
            <label htmlFor="ep-capacity" className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">
              Max Queue
            </label>
            <input
              id="ep-capacity"
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F9FAFB] text-sm focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition font-mono"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-[#9CA3AF] font-sans">
            Portfolio Links <span className="normal-case text-[#9CA3AF]/70">(up to 3)</span>
          </p>
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={link}
                  onChange={(e) => updateLink(i, e.target.value)}
                  placeholder="https://vimeo.com/yourwork"
                  aria-label={`Portfolio link ${i + 1}`}
                  className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-[#F9FAFB] text-sm placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-2 focus:ring-[#FF5F15]/30 outline-none transition"
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    aria-label={`Remove portfolio link ${i + 1}`}
                    className="p-2.5 text-[#9CA3AF] hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {links.length < 3 && (
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 text-xs text-[#FF5F15] hover:text-[#E54E08] transition-colors"
              >
                <Plus size={14} /> Add another link
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAcceptsRepeat((v) => !v)}
          aria-pressed={acceptsRepeat}
          className="w-full flex items-center justify-between gap-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-left"
        >
          <span>
            <span className="block text-sm font-medium text-[#F9FAFB]">Accept repeat clients</span>
            <span className="block text-xs text-[#9CA3AF]">Let clients you've worked with request you again.</span>
          </span>
          <span
            className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
              acceptsRepeat ? "bg-[#FF5F15]" : "bg-[#404040]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#F9FAFB] transition-transform ${
                acceptsRepeat ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </span>
        </button>
      </motion.div>

      {error && (
        <motion.div
          variants={fadeUp}
          className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
        >
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      <motion.button
        variants={fadeUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={!valid || saving}
        className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-xl py-3.5 text-sm hover:bg-[#E54E08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {saving ? "Saving…" : "Save Profile"}
      </motion.button>
    </motion.div>
  )
}
