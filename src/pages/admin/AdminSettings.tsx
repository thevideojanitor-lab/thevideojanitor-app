import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Check, RefreshCw, Save } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { usePricingStore } from "@/stores/pricingStore"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanConfig { amount: number; credits: number }
interface PackConfig { amount: number; credits: number }
interface EditCosts { basic: number; standard: number; premium: number; extra_ratio: number }
interface Rules {
  max_revisions: number
  auto_close_days: number
  editor_reassign_hours: number
  max_active_requests: number
}
interface PayoutConfig { frequency_days: number; min_usd: number; min_inr: number }

interface AllConfig {
  pricing_usd: { quick_sweep: PlanConfig; deep_clean: PlanConfig; full_service: PlanConfig }
  pricing_inr: { quick_sweep: PlanConfig; deep_clean: PlanConfig; full_service: PlanConfig }
  credit_packs_usd: { small: PackConfig; medium: PackConfig; large: PackConfig }
  credit_packs_inr: { small: PackConfig; medium: PackConfig; large: PackConfig }
  edit_costs: EditCosts
  rules: Rules
  payout: PayoutConfig
}

const DEFAULT_CONFIG: AllConfig = {
  pricing_usd: {
    quick_sweep: { amount: 9900, credits: 350 },
    deep_clean: { amount: 24900, credits: 950 },
    full_service: { amount: 59900, credits: 2500 },
  },
  pricing_inr: {
    quick_sweep: { amount: 249900, credits: 350 },
    deep_clean: { amount: 599900, credits: 950 },
    full_service: { amount: 1399900, credits: 2500 },
  },
  credit_packs_usd: {
    small: { amount: 3300, credits: 100 },
    medium: { amount: 7500, credits: 250 },
    large: { amount: 14000, credits: 500 },
  },
  credit_packs_inr: {
    small: { amount: 82500, credits: 100 },
    medium: { amount: 187500, credits: 250 },
    large: { amount: 349900, credits: 500 },
  },
  edit_costs: { basic: 50, standard: 70, premium: 100, extra_ratio: 10 },
  rules: { max_revisions: 3, auto_close_days: 7, editor_reassign_hours: 12, max_active_requests: 2 },
  payout: { frequency_days: 7, min_usd: 1000, min_inr: 10000 },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDollars(cents: number) { return `$${(cents / 100).toFixed(2)}` }
function fmtRupees(paise: number) { return `₹${(paise / 100).toFixed(2)}` }

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#2A2A2A]">
        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  )
}

function NumField({
  label,
  value,
  onChange,
  hint,
  min,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  hint?: string
  min?: number
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#9CA3AF] font-sans">{label}</label>
      <input
        type="number"
        value={value}
        min={min ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30"
      />
      {hint && <p className="text-[10px] text-[#9CA3AF]">{hint}</p>}
    </div>
  )
}

function PlanRow({
  planKey,
  label,
  config,
  currency,
  onChange,
}: {
  planKey: string
  label: string
  config: PlanConfig
  currency: "USD" | "INR"
  onChange: (updated: PlanConfig) => void
}) {
  const fmt = currency === "USD" ? fmtDollars : fmtRupees
  const unit = currency === "USD" ? "cents" : "paise"
  return (
    <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#F9FAFB]">{label}</p>
        <span className="text-xs text-[#FF5F15] font-semibold">{fmt(config.amount)}/mo</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField
          label={`Amount (${unit})`}
          value={config.amount}
          onChange={(v) => onChange({ ...config, amount: v })}
          min={0}
          hint={fmt(config.amount)}
        />
        <NumField
          label="Credits"
          value={config.credits}
          onChange={(v) => onChange({ ...config, credits: v })}
          min={1}
        />
      </div>
    </div>
  )
}

function PackRow({
  packKey,
  label,
  config,
  currency,
  onChange,
}: {
  packKey: string
  label: string
  config: PackConfig
  currency: "USD" | "INR"
  onChange: (updated: PackConfig) => void
}) {
  const fmt = currency === "USD" ? fmtDollars : fmtRupees
  const unit = currency === "USD" ? "cents" : "paise"
  return (
    <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#F9FAFB]">{label}</p>
        <span className="text-xs text-[#FF5F15] font-semibold">{fmt(config.amount)}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField
          label={`Amount (${unit})`}
          value={config.amount}
          onChange={(v) => onChange({ ...config, amount: v })}
          min={0}
          hint={fmt(config.amount)}
        />
        <NumField
          label="Credits"
          value={config.credits}
          onChange={(v) => onChange({ ...config, credits: v })}
          min={1}
        />
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const { user } = useAuthStore()
  const { fetch: refetchPricing, config: pricingConfig } = usePricingStore()
  const [cfg, setCfg] = useState<AllConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadConfig() }, [])

  async function loadConfig() {
    setLoading(true)
    const { data } = await supabase
      .from("platform_config")
      .select("key, value")
      .in("key", [
        "pricing_usd", "pricing_inr",
        "credit_packs_usd", "credit_packs_inr",
        "edit_costs", "rules", "payout",
      ])

    if (data && data.length > 0) {
      const byKey: Record<string, unknown> = Object.fromEntries(data.map((r) => [r.key, r.value]))
      setCfg({
        pricing_usd:      (byKey.pricing_usd      as AllConfig["pricing_usd"])      ?? DEFAULT_CONFIG.pricing_usd,
        pricing_inr:      (byKey.pricing_inr      as AllConfig["pricing_inr"])      ?? DEFAULT_CONFIG.pricing_inr,
        credit_packs_usd: (byKey.credit_packs_usd as AllConfig["credit_packs_usd"]) ?? DEFAULT_CONFIG.credit_packs_usd,
        credit_packs_inr: (byKey.credit_packs_inr as AllConfig["credit_packs_inr"]) ?? DEFAULT_CONFIG.credit_packs_inr,
        edit_costs:       (byKey.edit_costs       as AllConfig["edit_costs"])       ?? DEFAULT_CONFIG.edit_costs,
        rules:            (byKey.rules            as AllConfig["rules"])            ?? DEFAULT_CONFIG.rules,
        payout:           (byKey.payout           as AllConfig["payout"])           ?? DEFAULT_CONFIG.payout,
      })
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const rows = [
      { key: "pricing_usd",      value: cfg.pricing_usd },
      { key: "pricing_inr",      value: cfg.pricing_inr },
      { key: "credit_packs_usd", value: cfg.credit_packs_usd },
      { key: "credit_packs_inr", value: cfg.credit_packs_inr },
      { key: "edit_costs",       value: cfg.edit_costs },
      { key: "rules",            value: cfg.rules },
      { key: "payout",           value: cfg.payout },
    ]

    const changedKeys: string[] = []
    for (const row of rows) {
      const { error } = await supabase
        .from("platform_config")
        .upsert({ key: row.key, value: row.value, updated_by: user?.id }, { onConflict: "key" })
      if (!error) changedKeys.push(row.key)
    }

    await supabase.from("admin_actions").insert({
      admin_id: user?.id ?? null,
      action_type: "config_update",
      target_type: "platform_config",
      target_id: null,
      notes: `Updated keys: ${changedKeys.join(", ")}`,
    })

    // Invalidate pricing store cache
    await refetchPricing(user ? (user.region === "IN" ? "IN" : "US") : "US")

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function updatePricingUsd(plan: keyof AllConfig["pricing_usd"], v: PlanConfig) {
    setCfg((c) => ({ ...c, pricing_usd: { ...c.pricing_usd, [plan]: v } }))
  }
  function updatePricingInr(plan: keyof AllConfig["pricing_inr"], v: PlanConfig) {
    setCfg((c) => ({ ...c, pricing_inr: { ...c.pricing_inr, [plan]: v } }))
  }
  function updatePacksUsd(pack: keyof AllConfig["credit_packs_usd"], v: PackConfig) {
    setCfg((c) => ({ ...c, credit_packs_usd: { ...c.credit_packs_usd, [pack]: v } }))
  }
  function updatePacksInr(pack: keyof AllConfig["credit_packs_inr"], v: PackConfig) {
    setCfg((c) => ({ ...c, credit_packs_inr: { ...c.credit_packs_inr, [pack]: v } }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 animate-pulse space-y-3">
            <div className="h-3 w-24 bg-[#2A2A2A] rounded" />
            <div className="h-20 bg-[#2A2A2A] rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Platform Settings</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">All values sourced from platform_config — never hardcoded</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving || saved}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5F15] text-[#121212] text-sm font-semibold rounded-lg hover:bg-[#E54E08] disabled:opacity-70 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {saved ? <Check size={15} /> : saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
        </motion.button>
      </motion.div>

      {/* ── Credit Costs ─────────────────────────────────────────────────────── */}
      <SectionCard title="Edit Credit Costs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NumField
            label="Basic"
            value={cfg.edit_costs.basic}
            onChange={(v) => setCfg((c) => ({ ...c, edit_costs: { ...c.edit_costs, basic: v } }))}
            hint="credits per basic edit"
            min={1}
          />
          <NumField
            label="Standard"
            value={cfg.edit_costs.standard}
            onChange={(v) => setCfg((c) => ({ ...c, edit_costs: { ...c.edit_costs, standard: v } }))}
            hint="credits per standard edit"
            min={1}
          />
          <NumField
            label="Premium"
            value={cfg.edit_costs.premium}
            onChange={(v) => setCfg((c) => ({ ...c, edit_costs: { ...c.edit_costs, premium: v } }))}
            hint="credits per premium edit"
            min={1}
          />
          <NumField
            label="Extra Ratio"
            value={cfg.edit_costs.extra_ratio}
            onChange={(v) => setCfg((c) => ({ ...c, edit_costs: { ...c.edit_costs, extra_ratio: v } }))}
            hint="+cr per extra ratio"
            min={0}
          />
        </div>
      </SectionCard>

      {/* ── Pricing USD ───────────────────────────────────────────────────────── */}
      <SectionCard title="Subscription Plans — USD">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PlanRow planKey="quick_sweep" label="Quick Sweep" config={cfg.pricing_usd.quick_sweep} currency="USD" onChange={(v) => updatePricingUsd("quick_sweep", v)} />
          <PlanRow planKey="deep_clean"  label="Deep Clean"  config={cfg.pricing_usd.deep_clean}  currency="USD" onChange={(v) => updatePricingUsd("deep_clean", v)} />
          <PlanRow planKey="full_service" label="Full Service" config={cfg.pricing_usd.full_service} currency="USD" onChange={(v) => updatePricingUsd("full_service", v)} />
        </div>
      </SectionCard>

      {/* ── Pricing INR ───────────────────────────────────────────────────────── */}
      <SectionCard title="Subscription Plans — INR">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PlanRow planKey="quick_sweep" label="Quick Sweep" config={cfg.pricing_inr.quick_sweep} currency="INR" onChange={(v) => updatePricingInr("quick_sweep", v)} />
          <PlanRow planKey="deep_clean"  label="Deep Clean"  config={cfg.pricing_inr.deep_clean}  currency="INR" onChange={(v) => updatePricingInr("deep_clean", v)} />
          <PlanRow planKey="full_service" label="Full Service" config={cfg.pricing_inr.full_service} currency="INR" onChange={(v) => updatePricingInr("full_service", v)} />
        </div>
      </SectionCard>

      {/* ── Credit Packs USD ──────────────────────────────────────────────────── */}
      <SectionCard title="Credit Packs — USD">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PackRow packKey="small"  label="Small"  config={cfg.credit_packs_usd.small}  currency="USD" onChange={(v) => updatePacksUsd("small", v)} />
          <PackRow packKey="medium" label="Medium" config={cfg.credit_packs_usd.medium} currency="USD" onChange={(v) => updatePacksUsd("medium", v)} />
          <PackRow packKey="large"  label="Large"  config={cfg.credit_packs_usd.large}  currency="USD" onChange={(v) => updatePacksUsd("large", v)} />
        </div>
      </SectionCard>

      {/* ── Credit Packs INR ──────────────────────────────────────────────────── */}
      <SectionCard title="Credit Packs — INR">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PackRow packKey="small"  label="Small"  config={cfg.credit_packs_inr.small}  currency="INR" onChange={(v) => updatePacksInr("small", v)} />
          <PackRow packKey="medium" label="Medium" config={cfg.credit_packs_inr.medium} currency="INR" onChange={(v) => updatePacksInr("medium", v)} />
          <PackRow packKey="large"  label="Large"  config={cfg.credit_packs_inr.large}  currency="INR" onChange={(v) => updatePacksInr("large", v)} />
        </div>
      </SectionCard>

      {/* ── Business Rules ────────────────────────────────────────────────────── */}
      <SectionCard title="Business Rules">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NumField
            label="Max Revisions"
            value={cfg.rules.max_revisions}
            onChange={(v) => setCfg((c) => ({ ...c, rules: { ...c.rules, max_revisions: v } }))}
            hint="revisions per request"
            min={1}
          />
          <NumField
            label="Auto-close Days"
            value={cfg.rules.auto_close_days}
            onChange={(v) => setCfg((c) => ({ ...c, rules: { ...c.rules, auto_close_days: v } }))}
            hint="days after delivery"
            min={1}
          />
          <NumField
            label="Reassign After (hrs)"
            value={cfg.rules.editor_reassign_hours}
            onChange={(v) => setCfg((c) => ({ ...c, rules: { ...c.rules, editor_reassign_hours: v } }))}
            hint="hours of inactivity"
            min={1}
          />
          <NumField
            label="Max Active Requests"
            value={cfg.rules.max_active_requests}
            onChange={(v) => setCfg((c) => ({ ...c, rules: { ...c.rules, max_active_requests: v } }))}
            hint="per client at once"
            min={1}
          />
        </div>
      </SectionCard>

      {/* ── Payout Settings ───────────────────────────────────────────────────── */}
      <SectionCard title="Payout Settings">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumField
            label="Payout Frequency (days)"
            value={cfg.payout?.frequency_days ?? 7}
            onChange={(v) => setCfg((c) => ({ ...c, payout: { ...c.payout, frequency_days: v } }))}
            hint="e.g. 7 = weekly"
            min={1}
          />
          <NumField
            label="Min Payout USD (cents)"
            value={cfg.payout?.min_usd ?? 1000}
            onChange={(v) => setCfg((c) => ({ ...c, payout: { ...c.payout, min_usd: v } }))}
            hint={fmtDollars(cfg.payout?.min_usd ?? 1000)}
            min={0}
          />
          <NumField
            label="Min Payout INR (paise)"
            value={cfg.payout?.min_inr ?? 10000}
            onChange={(v) => setCfg((c) => ({ ...c, payout: { ...c.payout, min_inr: v } }))}
            hint={fmtRupees(cfg.payout?.min_inr ?? 10000)}
            min={0}
          />
        </div>
      </SectionCard>

      {/* Save reminder */}
      <motion.div variants={fadeUp} className="text-[10px] text-[#9CA3AF] text-center">
        Changes are saved to platform_config and the pricing cache is invalidated immediately.
        Clients will see new prices on next page load.
      </motion.div>
    </motion.div>
  )
}
