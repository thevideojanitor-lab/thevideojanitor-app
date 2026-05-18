import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Upload, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

const SWATCHES = ["#FF5F15", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#F9FAFB"]

function SvgCheckmark({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center bg-[#121212]/80 z-50 pointer-events-none"
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="2" />
            <motion.path
              d="M36 60l18 18 30-36"
              fill="none"
              stroke="#4ade80"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function BrandKitStep() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [referenceVideo, setReferenceVideo] = useState("")
  const [saving, setSaving] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setLogoFile(f)
    setLogoPreview(URL.createObjectURL(f))
  }

  const toggleColor = (hex: string) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : prev.length < 5 ? [...prev, hex] : prev
    )
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)

    let brandKitUrl: string | null = null

    if (logoFile) {
      const ext = logoFile.name.split(".").pop()
      const path = `${user.id}/logo.${ext}`
      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(path, logoFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from("brand-assets").getPublicUrl(path)
        brandKitUrl = data.publicUrl
      }
    }

    const brandColors: Record<string, string> = {}
    selectedColors.forEach((c, i) => { brandColors[`color_${i + 1}`] = c })

    await supabase
      .from("client_profiles")
      .update({
        brand_kit_url: brandKitUrl,
        brand_colors: brandColors,
        reference_video_url: referenceVideo || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    setSaving(false)
    setShowCheck(true)
    setTimeout(() => {
      setShowCheck(false)
      navigate("/onboarding/style")
    }, 1200)
  }

  return (
    <>
      <SvgCheckmark show={showCheck} />

      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#F9FAFB] mb-1">Tell us about your brand</h1>
          <p className="text-sm text-[#9CA3AF]">Your editor uses this to match your visual identity.</p>
        </div>

        {/* Logo upload */}
        <div>
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Brand Logo (optional)</p>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className="border-2 border-dashed border-[#404040] rounded-xl p-6 text-center cursor-pointer hover:border-[#FF5F15]/50 transition-colors"
          >
            {logoPreview ? (
              <div className="relative inline-block">
                <img src={logoPreview} alt="Logo preview" className="h-16 object-contain mx-auto rounded" />
                <button
                  onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(null) }}
                  className="absolute -top-2 -right-2 bg-[#404040] rounded-full p-0.5"
                >
                  <X size={12} className="text-[#9CA3AF]" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                <Upload size={24} />
                <p className="text-sm">Drop logo here or click to upload</p>
                <p className="text-xs">PNG, SVG, JPG · max 2MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>

        {/* Color picker */}
        <div>
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Brand Colors (pick up to 5)</p>
          <div className="flex flex-wrap gap-3">
            {SWATCHES.map((hex) => (
              <motion.button
                key={hex}
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleColor(hex)}
                className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColors.includes(hex) ? "border-[#F9FAFB] scale-110" : "border-transparent"}`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          {selectedColors.length > 0 && (
            <div className="flex gap-2 mt-3">
              {selectedColors.map((c) => (
                <span key={c} className="text-xs font-mono text-[#9CA3AF]">{c}</span>
              ))}
            </div>
          )}
        </div>

        {/* Reference video */}
        <div>
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Reference Video (optional)</p>
          <p className="text-xs text-[#9CA3AF] mb-2">Paste a YouTube, TikTok, or Instagram link of a style you love.</p>
          <input
            type="url"
            value={referenceVideo}
            onChange={(e) => setReferenceVideo(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {saving ? "Saving…" : "Continue"}
        </motion.button>
      </div>
    </>
  )
}
