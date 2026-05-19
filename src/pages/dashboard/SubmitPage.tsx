import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Check, ChevronRight, AlertCircle, Loader2, Star, Clock } from "lucide-react"
import { slideInFromRight, scaleIn } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { usePricingStore } from "@/stores/pricingStore"
import { supabase } from "@/lib/supabase"
import { track } from "@vercel/analytics"
import type { EditType } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = "type" | "footage" | "brief" | "matching"

interface BriefData {
  description: string
  vibe: string[]
  captions: string
  instructions: string
  referenceLink: string
  aspectRatios: string[]
}

interface MatchedEditor {
  userId: string
  displayName: string
  rating: number
  specialties: string[]
  avgTurnaroundHours: number
  completedCount: number
}

// ── Step 1: Edit Type ─────────────────────────────────────────────────────────

const EDIT_TYPES: { key: EditType; label: string; features: string[] }[] = [
  { key: "basic",    label: "Basic",    features: ["Cuts + transitions", "Basic b-roll", "9:16 format", "Platform formatting"] },
  { key: "standard", label: "Standard", features: ["All Basic +", "Captions baked in", "Pacing + sound polish", "Hook optimised"] },
  { key: "premium",  label: "Premium",  features: ["All Standard +", "Motion graphics", "Brand treatment", "Full grade"] },
]

function TypeStep({ onNext, balance, editCosts }: {
  onNext: (type: EditType, cost: number) => void
  balance: number
  editCosts: Record<string, number>
}) {
  const [selected, setSelected] = useState<EditType | null>(null)

  const getCost = (key: EditType) => editCosts[key]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB] mb-1">What kind of edit do you need?</h2>
        <p className="text-sm text-[#9CA3AF]">Credits are deducted at submission, not on delivery.</p>
      </div>

      <div className="grid gap-3">
        {EDIT_TYPES.map(({ key, label, features }) => {
          const cost = getCost(key)
          const canAfford = balance >= cost
          const isSelected = selected === key

          return (
            <motion.button
              key={key}
              layout
              whileTap={{ scale: canAfford ? 0.98 : 1 }}
              onClick={() => canAfford && setSelected(key)}
              className={`w-full text-left p-5 rounded-xl border transition-all ${
                !canAfford
                  ? "border-red-500/20 bg-[#1A1A1A] opacity-60 cursor-not-allowed"
                  : isSelected
                  ? "border-[#FF5F15] bg-[#FF5F15]/5"
                  : "border-[#2A2A2A] bg-[#404040] hover:border-[#FF5F15]/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-semibold text-[#F9FAFB]">{label} Edit</span>
                  {isSelected && <Check size={14} className="text-[#FF5F15]" />}
                </div>
                <div className="flex items-center gap-2">
                  {!canAfford && <AlertCircle size={14} className="text-red-400" title={`Need ${cost - balance} more credits`} />}
                  <span className={`font-heading text-lg font-bold ${canAfford ? "text-[#FF5F15]" : "text-red-400"}`}>
                    {cost} cr
                  </span>
                </div>
              </div>
              <ul className="space-y-1">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span className="w-1 h-1 rounded-full bg-[#404040] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!canAfford && (
                <p className="text-xs text-red-400 mt-2">Need {cost - balance} more credits</p>
              )}
            </motion.button>
          )
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        disabled={!selected}
        onClick={() => selected && onNext(selected, getCost(selected))}
        className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue <ChevronRight size={16} />
      </motion.button>
    </div>
  )
}

// ── Step 2: Footage ───────────────────────────────────────────────────────────

const DRIVE_RE = /drive\.google\.com/i
const DROPBOX_RE = /dropbox\.com/i

function FootageStep({ onNext, onBack }: { onNext: (url: string, type: "drive_link" | "dropbox_link") => void; onBack: () => void }) {
  const [tab, setTab] = useState<"drive" | "dropbox">("drive")
  const [url, setUrl] = useState("")
  const [valid, setValid] = useState<boolean | null>(null)

  const validate = (val: string) => {
    if (!val) { setValid(null); return }
    const isDrive = DRIVE_RE.test(val)
    const isDropbox = DROPBOX_RE.test(val)
    setValid((tab === "drive" && isDrive) || (tab === "dropbox" && isDropbox))
  }

  const handleChange = (val: string) => { setUrl(val); validate(val) }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB] mb-1">Where is your footage?</h2>
        <p className="text-sm text-[#9CA3AF]">Share a link to your raw footage folder.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#2A2A2A] rounded-lg p-1 gap-1">
        {(["drive", "dropbox"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setUrl(""); setValid(null) }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-[#404040] text-[#F9FAFB]" : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            }`}
          >
            {t === "drive" ? "Google Drive" : "Dropbox"}
          </button>
        ))}
      </div>

      {/* URL input */}
      <div>
        <input
          type="url"
          value={url}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={tab === "drive" ? "https://drive.google.com/drive/folders/..." : "https://www.dropbox.com/sh/..."}
          className={`w-full bg-[#1A1A1A] border rounded-lg px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] outline-none transition-colors ${
            valid === true ? "border-green-500/40 focus:border-green-500"
            : valid === false ? "border-red-500/40 focus:border-red-500"
            : "border-[#2A2A2A] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30"
          }`}
        />
        {valid === false && (
          <p className="text-xs text-red-400 mt-1.5">
            {tab === "drive" ? "Needs a drive.google.com link" : "Needs a dropbox.com link"}
          </p>
        )}
      </div>

      {/* Preview card */}
      <AnimatePresence>
        {valid === true && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-[#1A1A1A] border border-[#FF5F15]/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Check size={16} className="text-[#4ade80] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#F9FAFB]">
                  {tab === "drive" ? "Google Drive folder" : "Dropbox folder"} detected
                </p>
                <p className="text-xs text-[#9CA3AF] mt-0.5 break-all">{url.slice(0, 60)}…</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-[#9CA3AF] bg-[#1A1A1A] rounded-lg p-3">
        Set folder sharing to <span className="text-[#F9FAFB] font-medium">"Anyone with the link can view"</span> before submitting.
      </p>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[#404040] text-[#F9FAFB] rounded-lg py-3 text-sm font-medium hover:bg-[#404040] transition-colors">
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={valid !== true}
          onClick={() => valid && onNext(url, tab === "drive" ? "drive_link" : "dropbox_link")}
          className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}

// ── Step 3: Brief ─────────────────────────────────────────────────────────────

const VIBES = ["Energetic", "Calm", "Funny", "Professional", "Trendy", "Raw"]
const CAPTION_OPTIONS = [
  { value: "baked", label: "Baked in" },
  { value: "srt",   label: "Separate SRT" },
  { value: "none",  label: "No captions" },
]
const RATIO_OPTIONS = [
  { value: "9:16", label: "9:16 (Vertical)", baseExtra: false },
  { value: "1:1",  label: "1:1 (Square)",    baseExtra: true },
  { value: "16:9", label: "16:9 (Landscape)", baseExtra: true },
]

function BriefStep({ editType, baseCost, onNext, onBack, extraRatioCost }: {
  editType: EditType
  baseCost: number
  extraRatioCost: number
  onNext: (brief: BriefData, totalCost: number) => void
  onBack: () => void
}) {
  const [brief, setBrief] = useState<BriefData>({
    description: "",
    vibe: [],
    captions: "",
    instructions: "",
    referenceLink: "",
    aspectRatios: ["9:16"],
  })

  const extraRatios = brief.aspectRatios.filter((r) => r !== "9:16").length
  const totalCost = baseCost + extraRatios * extraRatioCost
  const charLeft = 300 - brief.instructions.length

  const toggleVibe = (v: string) => {
    setBrief((p) => ({ ...p, vibe: p.vibe.includes(v) ? p.vibe.filter((x) => x !== v) : [...p.vibe, v] }))
  }
  const toggleRatio = (v: string) => {
    setBrief((p) => ({
      ...p,
      aspectRatios: v === "9:16"
        ? ["9:16"]
        : p.aspectRatios.includes(v) ? p.aspectRatios.filter((r) => r !== v) : [...p.aspectRatios, v],
    }))
  }

  const valid = brief.description.trim().length > 0 && brief.captions !== "" && brief.aspectRatios.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB] mb-1">Tell your editor what you need</h2>
        <p className="text-sm text-[#9CA3AF]">The more specific, the better the first cut.</p>
      </div>

      {/* Q1 Description */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">
          In one sentence, what is this video about? *
        </label>
        <input
          type="text"
          value={brief.description}
          onChange={(e) => setBrief((p) => ({ ...p, description: e.target.value }))}
          placeholder="e.g. 60s reel from my morning routine filming session"
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none"
        />
      </div>

      {/* Q2 Vibe */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">Vibe</label>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <motion.button
              key={v}
              whileTap={{ scale: 0.92 }}
              onClick={() => toggleVibe(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                brief.vibe.includes(v)
                  ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/30"
                  : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040]"
              }`}
            >
              {v}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Q3 Captions */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">Captions *</label>
        <div className="flex gap-2">
          {CAPTION_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setBrief((p) => ({ ...p, captions: value }))}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                brief.captions === value
                  ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/30"
                  : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Q4 Instructions */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">
          Any specific instructions? <span className="normal-case">(optional)</span>
        </label>
        <textarea
          value={brief.instructions}
          maxLength={300}
          onChange={(e) => setBrief((p) => ({ ...p, instructions: e.target.value }))}
          placeholder="Cut the intro, keep the B-roll at 0:30, match the beat drop..."
          rows={3}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none resize-none"
        />
        <p className={`text-xs mt-1 text-right ${charLeft < 30 ? "text-yellow-400" : "text-[#9CA3AF]"}`}>{charLeft} left</p>
      </div>

      {/* Q5 Reference link */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">Reference Video (optional)</label>
        <input
          type="url"
          value={brief.referenceLink}
          onChange={(e) => setBrief((p) => ({ ...p, referenceLink: e.target.value }))}
          placeholder="https://..."
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none"
        />
      </div>

      {/* Q6 Aspect ratios */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">
          Aspect Ratios <span className="normal-case text-[10px]">(+{extraRatioCost}cr each extra)</span>
        </label>
        <div className="flex gap-2">
          {RATIO_OPTIONS.map(({ value, label, baseExtra }) => (
            <button
              key={value}
              onClick={() => toggleRatio(value)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all relative ${
                brief.aspectRatios.includes(value)
                  ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/30"
                  : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040]"
              }`}
            >
              {label}
              {baseExtra && <span className="absolute -top-1.5 right-1 text-[9px] text-[#9CA3AF]">+{extraRatioCost}cr</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 border border-[#404040] text-[#F9FAFB] rounded-lg py-3 text-sm font-medium hover:bg-[#404040] transition-colors">
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={!valid}
          onClick={() => valid && onNext(brief, totalCost)}
          className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Review & Submit <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}

// ── Step 4: Matching ──────────────────────────────────────────────────────────

function MatchingStep({ editor, dueAt, requestId, matchFailed }: {
  editor: MatchedEditor | null
  dueAt: string | null
  requestId: string | null
  matchFailed: boolean
}) {
  const navigate = useNavigate()

  if (!editor && matchFailed) {
    return (
      <motion.div variants={scaleIn} initial="hidden" animate="visible" className="text-center py-16 space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(255,95,21,0.12)] border border-[rgba(255,95,21,0.2)] flex items-center justify-center">
          <Clock size={24} className="text-[#FF5F15]" />
        </div>
        <div>
          <p className="font-heading text-base font-semibold text-[#F9FAFB] mb-1">Request received</p>
          <p className="text-sm text-[#9CA3AF] max-w-xs mx-auto">
            No editors are available right now. We'll match you automatically as soon as one opens up — usually within a few hours.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(requestId ? `/dashboard/requests/${requestId}` : "/dashboard")}
          className="bg-[#404040] border border-[#2A2A2A] text-[#F9FAFB] font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-[#4A4A4A] transition-colors"
        >
          View My Requests
        </motion.button>
      </motion.div>
    )
  }

  if (!editor) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-[#FF5F15] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#9CA3AF] text-sm">Finding the best editor for your content…</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible" className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
          <Check size={24} className="text-[#4ade80]" />
        </div>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB] mb-1">Request submitted!</h2>
        <p className="text-sm text-[#9CA3AF]">Your editor is confirmed. Expect delivery in 48 hours.</p>
      </div>

      {/* Editor card */}
      <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5">
        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF] mb-3">Your Editor</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FF5F15]/20 border border-[#FF5F15]/30 flex items-center justify-center font-heading font-bold text-[#FF5F15]">
            {editor.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-[#F9FAFB] text-sm">{editor.displayName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-[#9CA3AF]">{editor.rating.toFixed(1)} · {editor.completedCount} edits</span>
            </div>
          </div>
        </div>
        {editor.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {editor.specialties.slice(0, 4).map((s) => (
              <span key={s} className="text-xs bg-[#FF5F15]/10 text-[#FF5F15] border border-[#FF5F15]/20 rounded-full px-2 py-0.5">{s}</span>
            ))}
          </div>
        )}
        {dueAt && (
          <p className="text-xs text-[#9CA3AF]">
            Due by <span className="text-[#F9FAFB] font-medium">{new Date(dueAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
          </p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(requestId ? `/dashboard/requests/${requestId}` : "/dashboard")}
        className="w-full bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3.5 text-sm flex items-center justify-center gap-2 hover:bg-[#E54E08] transition-colors"
      >
        Track Your Request →
      </motion.button>
    </motion.div>
  )
}

// ── Sticky Cost Bar ───────────────────────────────────────────────────────────

function CostBar({ cost, balance, onSubmit, loading }: {
  cost: number; balance: number; onSubmit: () => void; loading: boolean
}) {
  const canAfford = balance >= cost
  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-[#1A1A1A] border-t border-[#2A2A2A] px-4 py-3 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 text-sm">
          <span className="text-[#9CA3AF]">Cost</span>
          <span className="font-heading font-bold text-[#FF5F15]">{cost} cr</span>
          <span className="text-[#2A2A2A]">|</span>
          <span className="text-[#9CA3AF]">Balance</span>
          <span className={`font-semibold ${canAfford ? "text-[#F9FAFB]" : "text-red-400"}`}>{balance} cr</span>
          {canAfford
            ? <span className="text-[10px] text-[#4ade80] font-semibold flex items-center gap-1"><Check size={11} /> Good to go</span>
            : <span className="text-[10px] text-red-400 font-semibold flex items-center gap-1"><AlertCircle size={11} /> Not enough</span>
          }
        </div>
        <motion.button
          whileHover={{ scale: canAfford ? 1.02 : 1 }}
          whileTap={{ scale: canAfford ? 0.97 : 1 }}
          onClick={canAfford ? onSubmit : undefined}
          disabled={!canAfford || loading}
          className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            canAfford
              ? "bg-[#FF5F15] text-[#121212] hover:bg-[#E54E08]"
              : "bg-[#2A2A2A] text-[#9CA3AF] cursor-not-allowed"
          }`}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Submitting…" : "Submit Request"}
        </motion.button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const STEP_ORDER: Step[] = ["type", "footage", "brief", "matching"]

export default function SubmitPage() {
  const { user, region } = useAuthStore()
  const { balance, total, loading: creditsLoading, deduct, refresh: refreshCredits } = useCreditsStore()
  const { config, fetch: fetchPricing } = usePricingStore()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("type")
  const [editType, setEditType] = useState<EditType | null>(null)
  const [footageUrl, setFootageUrl] = useState("")
  const [footageType, setFootageType] = useState<"drive_link" | "dropbox_link">("drive_link")
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [totalCost, setTotalCost] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [matchedEditor, setMatchedEditor] = useState<MatchedEditor | null>(null)
  const [matchFailed, setMatchFailed] = useState(false)
  const [dueAt, setDueAt] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [matchProgress, setMatchProgress] = useState(0)

  const currentStepIndex = STEP_ORDER.indexOf(step)

  const handleSubmit = async () => {
    if (!user?.id || !editType || !brief) return
    setSubmitting(true)
    setStep("matching")

    // Fake progress bar
    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 25
      setMatchProgress(Math.min(p, 90))
    }, 400)

    try {
      // 1. Deduct credits optimistically
      deduct(totalCost)

      // 2. DB deduction
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, credits_remaining")
        .eq("client_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ credits_remaining: sub.credits_remaining - totalCost })
          .eq("id", sub.id)
      }

      // 3. Insert request
      const { data: reqData } = await supabase
        .from("requests")
        .insert({
          client_id: user.id,
          status: "pending_match",
          edit_type: editType,
          credits_cost: totalCost,
          brief: {
            description: brief.description,
            vibe: brief.vibe,
            captions: brief.captions,
            instructions: brief.instructions,
            reference_link: brief.referenceLink,
          },
          footage_url: footageUrl,
          footage_type: footageType,
          aspect_ratios: brief.aspectRatios,
        })
        .select("id")
        .single()

      track("request_submitted", { edit_type: editType, credits_cost: totalCost, region: user.region ?? "US" })

      clearInterval(interval)
      setMatchProgress(95)

      // 4. Call match-editor
      const { data: matchData } = await supabase.functions.invoke("match-editor", {
        body: { requestId: reqData?.id },
      })

      setMatchProgress(100)

      if (matchData?.matched) {
        setMatchedEditor(matchData.editor)
        setDueAt(matchData.dueAt)
      } else {
        setMatchFailed(true)
      }
      setRequestId(reqData?.id ?? null)

      if (user?.id) refreshCredits(user.id)
    } catch {
      clearInterval(interval)
      deduct(-totalCost) // revert optimistic
      setStep("brief")
    } finally {
      setSubmitting(false)
    }
  }

  // Prevent navigating to matching step directly
  useEffect(() => {
    if (step !== "matching") setMatchProgress(0)
  }, [step])

  // Edit costs come from platform_config — never hardcoded. Gate the wizard until loaded.
  useEffect(() => {
    if (!config) fetchPricing(region)
  }, [])

  if (!config) {
    return (
      <div className="pb-20 space-y-6">
        <div className="h-1 bg-[#2A2A2A] rounded-full" />
        <div className="space-y-2">
          <div className="h-7 w-2/3 bg-[#404040] rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-[#404040] rounded animate-pulse" />
        </div>
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 bg-[#404040] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // No active subscription — guide the user to subscribe first
  if (!creditsLoading && total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FF5F15]/10 border border-[#FF5F15]/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-[#FF5F15]" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F9FAFB] mb-2">No active subscription</h2>
          <p className="text-sm text-[#9CA3AF] max-w-xs">You need an active plan to submit editing requests. Subscribe to get your monthly credits.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/dashboard/subscription")}
          className="bg-[#FF5F15] text-[#121212] font-semibold rounded-lg px-6 py-3 text-sm hover:bg-[#E54E08] transition-colors"
        >
          View Plans
        </motion.button>
      </div>
    )
  }

  const editCosts = config.editCosts as Record<string, number>
  const extraRatioCost = editCosts.extra_ratio

  return (
    <div className="pb-20">
      {/* Progress header */}
      {step !== "matching" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">
              Step {currentStepIndex + 1} of {STEP_ORDER.length - 1}
            </p>
            <button onClick={() => navigate("/dashboard")} className="text-xs text-[#9CA3AF] hover:text-[#F9FAFB]">
              Cancel
            </button>
          </div>
          <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FF5F15] rounded-full"
              animate={{ width: `${((currentStepIndex) / 3) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      )}

      {/* Matching progress bar */}
      {step === "matching" && matchedEditor === null && (
        <div className="mb-6">
          <div className="h-1 bg-[#2A2A2A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FF5F15] rounded-full"
              animate={{ width: `${matchProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideInFromRight}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {step === "type" && (
            <TypeStep
              balance={balance}
              editCosts={editCosts}
              onNext={(type, cost) => { setEditType(type); setTotalCost(cost); setStep("footage") }}
            />
          )}
          {step === "footage" && (
            <FootageStep
              onNext={(url, type) => { setFootageUrl(url); setFootageType(type); setStep("brief") }}
              onBack={() => setStep("type")}
            />
          )}
          {step === "brief" && editType && (
            <BriefStep
              editType={editType}
              baseCost={editCosts[editType] ?? totalCost}
              extraRatioCost={extraRatioCost}
              onNext={(b, cost) => { setBrief(b); setTotalCost(cost) }}
              onBack={() => setStep("footage")}
            />
          )}
          {step === "matching" && (
            <MatchingStep editor={matchedEditor} dueAt={dueAt} requestId={requestId} matchFailed={matchFailed} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky cost bar visible on brief step */}
      {step === "brief" && brief !== null && (
        <CostBar cost={totalCost} balance={balance} onSubmit={handleSubmit} loading={submitting} />
      )}
    </div>
  )
}
