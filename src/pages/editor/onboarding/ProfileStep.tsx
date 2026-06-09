import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { fadeUp } from "@/lib/animations"
import { ArrowRight, Camera, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

const DRAFT_KEY = "editor_onboarding_draft"

export default function ProfileStep() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")
  const [name, setName] = useState<string>(saved.displayName ?? "")
  const [bio, setBio] = useState<string>(saved.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState<string>(saved.avatarUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bioLen = bio.trim().length
  const valid = name.trim().length >= 2 && bioLen >= 50 && bioLen <= 300 && !!avatarUrl

  const initials = name.trim()
    ? name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?"

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file
    if (!file || !user?.id) return

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.")
      return
    }

    setUploading(true)
    setError(null)
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
    // Path is scoped to the user's own folder — required by the storage RLS
    // policy (avatars_owner_insert), and timestamped so the CDN URL changes on
    // re-upload instead of serving a stale cached image.
    const path = `${user.id}/avatar-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type })

    if (upErr) {
      console.error("[ProfileStep] avatar upload failed:", upErr.message)
      setError("Upload failed. Please try again.")
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    // Persist immediately so the photo survives back/forward navigation.
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...saved, avatarUrl: data.publicUrl }))
    setUploading(false)
  }

  function handleNext() {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...saved, displayName: name.trim(), bio: bio.trim(), avatarUrl })
    )
    navigate("/editor/onboarding/specialties")
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Tell us about yourself</h1>
        <p className="text-sm text-muted-foreground mt-1">This is what clients see when you're matched with them.</p>
      </div>

      {/* Avatar uploader */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Upload profile picture"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-input flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Your profile" className="w-full h-full object-cover" />
            ) : (
              <span className="font-heading text-2xl font-bold text-muted-foreground">{initials}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center border-2 border-background">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </span>
        </button>
        <p className="text-xs text-muted-foreground">
          {avatarUrl ? "Tap to change photo" : "Profile picture *"}
        </p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Display Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Bio *</label>
            <span className={`text-xs ${
              bioLen === 0 ? "text-muted-foreground"
              : bioLen < 50 ? "text-yellow-400"
              : bioLen > 300 ? "text-red-400"
              : "text-success"
            }`}>
              {bioLen} / 300
            </span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Describe your editing style, experience, and what you specialise in…"
            className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition resize-none"
          />
          <p className="text-xs text-muted-foreground">Minimum 50 characters</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleNext}
        disabled={!valid || uploading}
        className="w-full bg-primary text-background font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  )
}
