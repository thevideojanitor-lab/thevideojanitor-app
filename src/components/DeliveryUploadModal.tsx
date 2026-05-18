import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { scaleIn } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import type { Request } from "@/lib/supabase"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB

interface Props {
  request: Request
  onClose: () => void
  onDelivered: () => void
}

type Step = "upload" | "processing" | "done"

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatETA(bytes: number, progress: number) {
  const remaining = bytes * (1 - progress / 100)
  const secs = Math.round(remaining / (1024 * 1024 * 2)) // assume 2 MB/s
  if (secs < 60) return `~${secs}s left`
  return `~${Math.round(secs / 60)}m left`
}

export default function DeliveryUploadModal({ request, onClose, onDelivered }: Props) {
  const { user } = useAuthStore()
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const validateFile = (f: File): string | null => {
    if (f.type !== "video/mp4") return "Only MP4 files are supported"
    if (f.size > MAX_FILE_SIZE) return "File must be under 500 MB"
    return null
  }

  const handleFile = (f: File) => {
    const err = validateFile(f)
    if (err) { setError(err); return }
    setFile(f)
    setError(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file || !user?.id) return
    setUploading(true)
    setError(null)

    try {
      // Step 1: get next version number
      const { data: existing } = await supabase
        .from("deliverables")
        .select("version_number")
        .eq("request_id", request.id)
        .order("version_number", { ascending: false })
        .limit(1)

      const versionNumber = (existing?.[0]?.version_number ?? 0) + 1

      // Step 2: get Mux upload URL
      const fnRes = await fetch(
        `${SUPABASE_URL}/functions/v1/create-mux-asset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      )
      if (!fnRes.ok) throw new Error("Failed to create upload slot")
      const { upload_url, upload_id } = await fnRes.json()

      // Step 3: upload to Mux via XHR for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error("Upload failed")))
        xhr.onerror = () => reject(new Error("Network error during upload"))
        xhr.open("PUT", upload_url)
        xhr.setRequestHeader("Content-Type", "video/mp4")
        xhr.send(file)
      })

      setStep("processing")

      // Step 4: poll Mux until asset is ready
      let playbackId: string | null = null
      let assetId: string | null = null
      const token = (await supabase.auth.getSession()).data.session?.access_token

      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000))
        const pollRes = await fetch(
          `${SUPABASE_URL}/functions/v1/create-mux-asset?upload_id=${upload_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (!pollRes.ok) continue
        const poll = await pollRes.json()
        if (poll.status === "ready" && poll.playback_id) {
          playbackId = poll.playback_id
          assetId = poll.asset_id
          break
        }
      }

      if (!playbackId) throw new Error("Video processing timed out. Please try again.")

      // Step 5: insert deliverables row
      const { error: insErr } = await supabase.from("deliverables").insert({
        request_id: request.id,
        version_number: versionNumber,
        mux_asset_id: assetId,
        mux_playback_id: playbackId,
        submitted_by: user.id,
        status: "ready",
      })
      if (insErr) throw insErr

      // Step 6: update request status + decrement editor queue
      await Promise.all([
        supabase
          .from("requests")
          .update({ status: "delivered", updated_at: new Date().toISOString() })
          .eq("id", request.id),
        supabase.rpc("decrement_editor_queue", { editor_user_id: user.id }),
      ])

      // Step 7: notify client
      await supabase.from("notifications").insert({
        user_id: request.client_id,
        message: "Your edit is ready for review!",
        type: "delivered",
      })

      setStep("done")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setUploading(false)
      setStep("upload")
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
            <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">
              {step === "upload" && "Upload Finished Edit"}
              {step === "processing" && "Processing Video"}
              {step === "done" && "Delivered!"}
            </h2>
            {step !== "processing" && (
              <button
                onClick={step === "done" ? onDelivered : onClose}
                className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="p-5">
            {/* ── Step 1: Upload ── */}
            {step === "upload" && (
              <div className="space-y-4">
                {/* Drop zone */}
                <div
                  onClick={() => !file && fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                    dragging
                      ? "border-[#3B82F6]/60 bg-[#3B82F6]/5"
                      : file
                      ? "border-[#3B82F6]/40 bg-[#3B82F6]/5"
                      : "border-[#404040] hover:border-[#3B82F6]/40"
                  }`}
                >
                  {file ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-[#3B82F6]" />
                      </div>
                      <p className="text-sm font-medium text-[#F9FAFB] mt-2">{file.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{formatBytes(file.size)}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null) }}
                        className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB] underline mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                      <Upload size={24} />
                      <p className="text-sm font-medium">Drop MP4 here or click to browse</p>
                      <p className="text-xs">MP4 only · max 500 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />

                {/* Upload progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#9CA3AF]">
                      <span>Uploading…</span>
                      <span>{uploadProgress}% · {file && formatETA(file.size, uploadProgress)}</span>
                    </div>
                    <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#3B82F6] rounded-full"
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 20 }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <AlertCircle size={13} />
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-[#3B82F6] text-white font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 hover:bg-[#2563EB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? "Uploading…" : "Upload & Deliver"}
                </motion.button>
              </div>
            )}

            {/* ── Step 2: Mux processing ── */}
            {step === "processing" && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                  <Loader2 size={28} className="text-[#3B82F6] animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F9FAFB] mb-1">Processing video…</p>
                  <p className="text-xs text-[#9CA3AF]">Transcoding for all devices. This usually takes 1–3 minutes.</p>
                </div>
                {/* Skeleton pulse rows */}
                <div className="space-y-2 text-left">
                  {[80, 60, 70].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 bg-[#2A2A2A] rounded-full animate-pulse"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 3: Done ── */}
            {step === "done" && (
              <div className="py-6 text-center space-y-4">
                <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
                  <circle cx="40" cy="40" r="37" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)" strokeWidth="1.5" />
                  <motion.path
                    d="M24 40l12 12 20-24"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-[#F9FAFB] mb-1">Delivered!</p>
                  <p className="text-xs text-[#9CA3AF]">The client has been notified and can now review your edit.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDelivered}
                  className="w-full bg-[#3B82F6] text-white font-semibold rounded-lg py-3 text-sm hover:bg-[#2563EB] transition-colors"
                >
                  Back to Queue
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
