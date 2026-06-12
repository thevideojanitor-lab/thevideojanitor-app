import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { Check, Download, ExternalLink, Loader2, Pencil, Play, X } from "lucide-react"
import { staggerContainer, fadeUp } from "@/lib/animations"
import { supabase, ClientProfile } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useSubscription } from "@/hooks/useSubscription"

// Same option lists as onboarding — profile edits the same fields.
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

const STYLE_PREFS = [
  { value: "speed",          label: "Fast delivery above all" },
  { value: "brand_learning", label: "Editor that learns my brand" },
  { value: "creative",       label: "Creative suggestions welcome" },
  { value: "follow_brief",   label: "Stick exactly to my brief" },
  { value: "communication",  label: "Frequent check-ins" },
]

const PLAN_LABELS: Record<string, string> = {
  quick_sweep: "Quick Sweep",
  deep_clean: "Deep Clean",
  full_service: "Full Service",
}

function Pane({ title, editing, onEdit, onSave, onCancel, saving, children }: {
  title: string
  editing?: boolean
  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  saving?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
        {onEdit && !editing && (
          <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <Pencil size={12} /> Edit
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Save
            </button>
          </div>
        )}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2">{children}</p>
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const cls = active
    ? "bg-primary/10 border-primary/30 text-primary"
    : "bg-input border-border text-muted-foreground"
  return onClick ? (
    <button onClick={onClick} className={`border rounded-full px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40 ${cls}`}>
      {children}
    </button>
  ) : (
    <span className={`border rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{children}</span>
  )
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { subscription } = useSubscription()

  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ approved: number } | null>(null)

  // Content & Style edit state
  const [editingStyle, setEditingStyle] = useState(false)
  const [draftNiches, setDraftNiches] = useState<string[]>([])
  const [draftPrefs, setDraftPrefs] = useState<string[]>([])
  const [draftFreq, setDraftFreq] = useState("")
  const [savingStyle, setSavingStyle] = useState(false)

  // Brand kit edit state
  const [editingKit, setEditingKit] = useState(false)
  const [draftKitUrl, setDraftKitUrl] = useState("")
  const [draftRefVideo, setDraftRefVideo] = useState("")
  const [savingKit, setSavingKit] = useState(false)

  // Password change state
  const [changingPw, setChangingPw] = useState(false)
  const [newPw, setNewPw] = useState("")
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "done" | "error">("idle")

  useEffect(() => {
    if (!user?.id) return
    void (async () => {
      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("client_profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("requests").select("id", { count: "exact", head: true })
          .eq("client_id", user.id).eq("status", "approved"),
      ])
      if (p) setProfile(p as ClientProfile)
      setStats({ approved: count ?? 0 })
      setLoading(false)
    })()
  }, [user?.id])

  const startStyleEdit = () => {
    setDraftNiches(profile?.content_niches ?? [])
    setDraftPrefs(profile?.style_preferences ?? [])
    setDraftFreq(profile?.posting_frequency ?? "")
    setEditingStyle(true)
  }

  const saveStyle = async () => {
    if (!user?.id) return
    setSavingStyle(true)
    const { error } = await supabase.from("client_profiles").update({
      content_niches: draftNiches,
      style_preferences: draftPrefs,
      posting_frequency: draftFreq || null,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id)
    setSavingStyle(false)
    if (!error) {
      setProfile((p) => p && { ...p, content_niches: draftNiches, style_preferences: draftPrefs, posting_frequency: draftFreq })
      setEditingStyle(false)
    }
  }

  const startKitEdit = () => {
    setDraftKitUrl(profile?.brand_kit_url ?? "")
    setDraftRefVideo(profile?.reference_video_url ?? "")
    setEditingKit(true)
  }

  const saveKit = async () => {
    if (!user?.id) return
    setSavingKit(true)
    const { error } = await supabase.from("client_profiles").update({
      brand_kit_url: draftKitUrl || null,
      reference_video_url: draftRefVideo || null,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id)
    setSavingKit(false)
    if (!error) {
      setProfile((p) => p && { ...p, brand_kit_url: draftKitUrl || null, reference_video_url: draftRefVideo || null })
      setEditingKit(false)
    }
  }

  const savePassword = async () => {
    if (newPw.length < 8) return
    setPwStatus("saving")
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) { setPwStatus("error"); return }
    setPwStatus("done")
    setNewPw("")
    setTimeout(() => { setChangingPw(false); setPwStatus("idle") }, 1500)
  }

  const brandColors = Object.values(profile?.brand_colors ?? {})
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—"

  if (loading) {
    return (
      <div className="max-w-5xl space-y-5 pb-24 md:pb-6">
        <div className="h-20 bg-card border border-border rounded-2xl animate-pulse" />
        <div className="grid md:grid-cols-2 gap-5">
          <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
          <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl space-y-6 pb-24 md:pb-6">

      {/* ── Identity header ── */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="font-heading text-2xl font-bold text-primary">
              {user?.email?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground">
              {user?.email?.split("@")[0] ?? "Your profile"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {subscription && (
              <span className="inline-flex items-center gap-1.5 mt-1.5 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] text-success text-[11px] font-semibold rounded-full px-2.5 py-0.5">
                <Check size={10} />
                {PLAN_LABELS[subscription.plan] ?? subscription.plan}
                {subscription.renews_at && subscription.status === "active" &&
                  ` · renews ${new Date(subscription.renews_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </span>
            )}
          </div>
        </div>
        <Link
          to="/dashboard/subscription"
          className="border border-border text-foreground text-xs font-medium rounded-lg px-4 py-2 hover:bg-card transition-colors"
        >
          Manage Plan
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-start">
        {/* ── Left: the brand brief editors see ── */}
        <div className="space-y-6">
          <Pane
            title="Brand Kit"
            editing={editingKit}
            onEdit={startKitEdit}
            onSave={saveKit}
            onCancel={() => setEditingKit(false)}
            saving={savingKit}
          >
            <div className="space-y-5">
              <div>
                <FieldLabel>Kit file / folder</FieldLabel>
                {editingKit ? (
                  <input
                    value={draftKitUrl}
                    onChange={(e) => setDraftKitUrl(e.target.value)}
                    placeholder="Drive or Dropbox link to your brand assets"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                ) : profile?.brand_kit_url ? (
                  <a href={profile.brand_kit_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 bg-input border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Download size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">Brand assets</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.brand_kit_url}</p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground group-hover:text-primary shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No brand kit yet — add one so editors match your look.</p>
                )}
              </div>

              {brandColors.length > 0 && (
                <div>
                  <FieldLabel>Brand colors</FieldLabel>
                  <div className="flex gap-3">
                    {brandColors.map((c) => (
                      <div key={c} className="text-center">
                        <div className="w-9 h-9 rounded-lg border border-border" style={{ backgroundColor: c }} />
                        <p className="text-[9px] font-mono text-muted-foreground mt-1">{c}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <FieldLabel>Reference video</FieldLabel>
                {editingKit ? (
                  <input
                    value={draftRefVideo}
                    onChange={(e) => setDraftRefVideo(e.target.value)}
                    placeholder="Link to a video with the vibe you want"
                    className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                ) : profile?.reference_video_url ? (
                  <a href={profile.reference_video_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 bg-input border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Play size={15} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex-1">{profile.reference_video_url}</p>
                    <ExternalLink size={13} className="text-muted-foreground group-hover:text-primary shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">None yet.</p>
                )}
              </div>
            </div>
          </Pane>

          <Pane
            title="Content & Style"
            editing={editingStyle}
            onEdit={startStyleEdit}
            onSave={saveStyle}
            onCancel={() => setEditingStyle(false)}
            saving={savingStyle}
          >
            <div className="space-y-5">
              <div>
                <FieldLabel>Content niches</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {editingStyle
                    ? NICHES.map((n) => (
                        <Chip key={n} active={draftNiches.includes(n)}
                          onClick={() => setDraftNiches((d) => d.includes(n) ? d.filter((x) => x !== n) : [...d, n])}>
                          {n}
                        </Chip>
                      ))
                    : (profile?.content_niches?.length
                        ? profile.content_niches.map((n) => <Chip key={n} active>{n}</Chip>)
                        : <p className="text-sm text-muted-foreground">Not set.</p>)}
                </div>
              </div>

              <div>
                <FieldLabel>Style preferences</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {editingStyle
                    ? STYLE_PREFS.map((s) => (
                        <Chip key={s.value} active={draftPrefs.includes(s.value)}
                          onClick={() => setDraftPrefs((d) => d.includes(s.value) ? d.filter((x) => x !== s.value) : [...d, s.value])}>
                          {s.label}
                        </Chip>
                      ))
                    : (profile?.style_preferences?.length
                        ? profile.style_preferences.map((v) => (
                            <Chip key={v} active>{STYLE_PREFS.find((s) => s.value === v)?.label ?? v}</Chip>
                          ))
                        : <p className="text-sm text-muted-foreground">Not set.</p>)}
                </div>
              </div>

              <div>
                <FieldLabel>Posting frequency</FieldLabel>
                {editingStyle ? (
                  <div className="flex flex-wrap gap-2">
                    {FREQUENCIES.map((f) => (
                      <Chip key={f.value} active={draftFreq === f.value} onClick={() => setDraftFreq(f.value)}>
                        {f.label}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground">
                    {FREQUENCIES.find((f) => f.value === profile?.posting_frequency)?.label ?? "Not set"}
                  </p>
                )}
              </div>
            </div>
          </Pane>
        </div>

        {/* ── Right: account ── */}
        <div className="space-y-6">
          <Pane title="Account">
            <div className="divide-y divide-border -my-2">
              <div className="flex items-center justify-between py-3 gap-4">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-sm text-foreground truncate">{user?.email}</span>
              </div>
              <div className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">Password</span>
                  {!changingPw ? (
                    <button onClick={() => setChangingPw(true)} className="text-xs font-semibold text-primary hover:underline">
                      Change
                    </button>
                  ) : (
                    <button onClick={() => { setChangingPw(false); setNewPw(""); setPwStatus("idle") }}
                      className="text-muted-foreground hover:text-foreground">
                      <X size={13} />
                    </button>
                  )}
                </div>
                {changingPw && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="New password (8+ characters)"
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      onClick={savePassword}
                      disabled={newPw.length < 8 || pwStatus === "saving"}
                      className="w-full bg-primary text-primary-foreground text-xs font-semibold rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      {pwStatus === "saving" && <Loader2 size={12} className="animate-spin" />}
                      {pwStatus === "done" ? "Password updated ✓" : "Update Password"}
                    </button>
                    {pwStatus === "error" && (
                      <p className="text-xs text-danger">Couldn't update the password. Try again.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between py-3 gap-4">
                <span className="text-xs text-muted-foreground">Region</span>
                <span className="text-sm text-foreground">{user?.region === "IN" ? "India" : "International"}</span>
              </div>
              <div className="flex items-center justify-between py-3 gap-4">
                <span className="text-xs text-muted-foreground">Currency</span>
                <span className="text-sm font-mono text-foreground">{user?.currency}</span>
              </div>
              <div className="flex items-center justify-between py-3 gap-4">
                <span className="text-xs text-muted-foreground">Member since</span>
                <span className="text-sm text-foreground">{memberSince}</span>
              </div>
            </div>
          </Pane>

          <Pane title="Usage">
            <div className="divide-y divide-border -my-2">
              {subscription && (
                <div className="flex items-center justify-between py-3 gap-4">
                  <span className="text-xs text-muted-foreground">Credits this cycle</span>
                  <span className="text-sm">
                    <span className="font-heading font-bold text-primary">{subscription.credits_remaining}</span>
                    <span className="text-muted-foreground"> / {subscription.credits_total}</span>
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 gap-4">
                <span className="text-xs text-muted-foreground">Edits approved</span>
                <span className="text-sm text-foreground">{stats?.approved ?? "—"}</span>
              </div>
            </div>
          </Pane>
        </div>
      </div>
    </motion.div>
  )
}
