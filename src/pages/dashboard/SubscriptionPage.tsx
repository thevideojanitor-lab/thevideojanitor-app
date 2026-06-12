import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Coins, AlertCircle, Loader2, X } from "lucide-react"
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { usePricingStore } from "@/stores/pricingStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { useSubscription } from "@/hooks/useSubscription"
import CreditsDisplay from "@/components/CreditsDisplay"
import { supabase } from "@/lib/supabase"
import { track } from "@vercel/analytics"

// ── Types ────────────────────────────────────────────────────────────────────

type PlanKey = "quick_sweep" | "deep_clean" | "full_service"

const PLAN_META: Record<PlanKey, { label: string; tagline: string; popular: boolean; features: string[] }> = {
  quick_sweep: {
    label: "Quick Sweep",
    tagline: "For creators with light monthly needs",
    popular: false,
    features: ["350 credits/month", "1 active request at a time", "48h turnaround", "3 revision rounds", "Dedicated editor", "Basic captions included"],
  },
  deep_clean: {
    label: "Deep Clean",
    tagline: "For growing brands and agencies",
    popular: true,
    features: ["950 credits/month", "2 active requests at a time", "48h turnaround", "3 revision rounds", "Priority editor matching", "Custom brand templates", "Swap editors anytime"],
  },
  full_service: {
    label: "Full Service",
    tagline: "For teams with ongoing volume",
    popular: false,
    features: ["2,500 credits/month", "4 active requests at a time", "Priority queue", "3 revision rounds", "Multiple editors", "Account manager", "White-label delivery"],
  },
}

// Static pack metadata only — amounts and credits come from platform_config.
const PACK_META: { key: "small" | "medium" | "large"; tag: string | null }[] = [
  { key: "small", tag: null },
  { key: "medium", tag: "10% off" },
  { key: "large", tag: "13% off" },
]

// ── Razorpay helper ───────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return }
    const s = document.createElement("script")
    s.id = "razorpay-script"
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────

function CancelModal({ onConfirm, onClose }: {
  onConfirm: () => void; onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    await supabase.functions.invoke("create-razorpay-subscription", { body: { action: "cancel" } })
    setLoading(false)
    onConfirm()
  }

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
      className="bg-input border border-border rounded-2xl p-6 w-full max-w-sm mx-auto">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Cancel subscription?</h3>
      <p className="text-sm text-muted-foreground mb-6">Your access continues until the end of the current billing period. Credits already deducted will not be refunded.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-border text-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-card transition-colors">Keep Plan</button>
        <button onClick={handleCancel} disabled={loading} className="flex-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg py-2.5 text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Cancelling…" : "Yes, Cancel"}
        </button>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const { region, currency, user } = useAuthStore()
  const { config, loading: pricingLoading, fetch: fetchPricing } = usePricingStore()
  const { subscription, loading: subLoading, refetch } = useSubscription()
  const { balance, total, refresh: refreshCredits } = useCreditsStore()

  const [showModal, setShowModal] = useState<"cancel" | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [loadingRzPlan, setLoadingRzPlan] = useState<PlanKey | null>(null)
  const [loadingPack, setLoadingPack] = useState<string | null>(null)

  useEffect(() => { fetchPricing(region) }, [region])

  const planKeys = ["quick_sweep", "deep_clean", "full_service"] as PlanKey[]

  const getPrice = useCallback((key: PlanKey) => {
    if (!config) return null
    const raw = (config.plans as Record<string, { amount: number }>)[key]?.amount ?? 0
    return raw / 100
  }, [config])

  const displayPrice = (key: PlanKey) => {
    const p = getPrice(key)
    if (p === null) return "—"
    return currency === "INR" ? `₹${p.toLocaleString("en-IN")}` : `$${p}`
  }

  const handleSelectPlan = async (key: PlanKey) => {
    setCheckoutError(null)
    setLoadingRzPlan(key)
    const loaded = await loadRazorpayScript()
    if (!loaded) { setLoadingRzPlan(null); setCheckoutError("Couldn't load the payment window. Check your connection and try again."); return }

    const { data, error } = await supabase.functions.invoke("create-razorpay-subscription", { body: { plan: key } })
    if (error || !data?.subscriptionId) {
      setLoadingRzPlan(null)
      setCheckoutError("We couldn't start checkout right now. Please try again in a moment.")
      return
    }

    // @ts-expect-error — Razorpay loaded dynamically
    const rzp = new window.Razorpay({
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "TheVideoJanitors",
      description: `${data.planName} — monthly billing`,
      handler: () => {
        track("subscription_started", { plan: key, currency, region, gateway: "razorpay" })
        setShowSuccess(true)
        refetch()
        if (user?.id) refreshCredits(user.id)
      },
    })
    rzp.open()
    setLoadingRzPlan(null)
  }

  const handleBuyCreditPack = async (packKey: string, credits: number) => {
    setCheckoutError(null)
    setLoadingPack(packKey)
    const loaded = await loadRazorpayScript()
    if (!loaded) { setLoadingPack(null); setCheckoutError("Couldn't load the payment window. Check your connection and try again."); return }
    const { data, error } = await supabase.functions.invoke("create-razorpay-order", { body: { pack: packKey } })
    if (error || !data?.orderId) {
      setLoadingPack(null)
      setCheckoutError("We couldn't start checkout right now. Please try again in a moment.")
      return
    }

    // @ts-expect-error — Razorpay loaded dynamically
    const rzp = new window.Razorpay({
      key: data.keyId,
      order_id: data.orderId,
      name: "TheVideoJanitors",
      description: `${credits} Credits`,
      handler: () => {
        track("credits_recharged", { pack_size: packKey, currency, region })
        if (user?.id) refreshCredits(user.id)
      },
    })
    rzp.open()
    setLoadingPack(null)
  }

  const isCurrentPlan = (key: PlanKey) => subscription?.plan === key
  const isPastDue = subscription?.status === "past_due"
  const isCancelled = subscription?.status === "cancelled"

  const canSubscribe = (key: PlanKey) => !isCurrentPlan(key) || isCancelled

  return (
    <div className="pb-24 md:pb-6">
      {/* Past-due banner */}
      <AnimatePresence>
        {isPastDue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Payment failed — new request submissions are blocked.</p>
              <p className="text-xs text-muted-foreground mt-0.5">Re-subscribe to restore access.</p>
            </div>
            {subscription?.plan ? (
              <button
                onClick={() => handleSelectPlan(subscription.plan as PlanKey)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors">
                Re-subscribe
              </button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout error banner */}
      <AnimatePresence>
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-sm font-medium text-red-400">{checkoutError}</p>
            </div>
            <button onClick={() => setCheckoutError(null)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center justify-between gap-3 bg-[rgba(34,197,94,0.10)] border border-[rgba(34,197,94,0.3)] rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Check size={18} className="text-success shrink-0" />
              <p className="text-sm font-medium text-success">Payment received! Your credits will appear in a moment.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits summary card */}
      {subscription && (
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground">Current Plan</p>
              <h2 className="font-heading text-xl font-semibold text-foreground mt-0.5">
                {PLAN_META[subscription.plan as PlanKey]?.label ?? subscription.plan}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                subscription.status === "active" ? "bg-[rgba(34,197,94,0.15)] text-success border border-[rgba(34,197,94,0.3)]"
                : subscription.status === "past_due" ? "bg-[rgba(239,68,68,0.15)] text-danger border border-[rgba(239,68,68,0.3)]"
                : "bg-[rgba(64,64,64,0.5)] text-muted-foreground border border-border"
              }`}>
                {subscription.status === "past_due" ? "Past Due" : subscription.status}
              </span>
            </div>
          </div>
          <CreditsDisplay />
          {subscription.renews_at && subscription.status === "active" && (
            <p className="text-xs text-muted-foreground mt-3">
              Renews {new Date(subscription.renews_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* Page heading */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2 mb-8">
        <motion.p variants={fadeUp} className="text-xs font-sans uppercase tracking-widest text-primary">
          {subscription ? "Change Plan" : "Choose Your Plan"}
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          {subscription ? "Upgrade, downgrade, or buy more credits." : "Clean edits. Fast delivery. Pick your pace."}
        </motion.h1>
      </motion.div>

      {/* Plan cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid md:grid-cols-3 gap-5 mb-12">
        {planKeys.map((key) => {
          const meta = PLAN_META[key]
          const isCurrent = isCurrentPlan(key)

          return (
            <motion.div
              key={key}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className={`relative p-6 rounded-2xl border flex flex-col transition-colors ${
                isCurrent
                  ? "bg-primary/5 border-primary/40"
                  : meta.popular
                    ? "bg-card border-primary/20"
                    : "bg-card border-border hover:border-primary/20"
              }`}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 absolute -top-3 left-4">
                {isCurrent && (
                  <span className="bg-primary text-background text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                )}
                {meta.popular && !isCurrent && (
                  <span className="bg-card border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mb-5 mt-2">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-0.5">{meta.label}</h3>
                <p className="text-xs text-muted-foreground">{meta.tagline}</p>

                <div className="flex items-baseline gap-1 mt-4">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={key}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="font-heading text-3xl font-bold text-primary"
                    >
                      {pricingLoading ? "—" : displayPrice(key)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => canSubscribe(key) && handleSelectPlan(key)}
                disabled={!canSubscribe(key) || !!loadingRzPlan}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold mb-5 flex items-center justify-center gap-2 transition-colors ${
                  isCurrent
                    ? "bg-border text-muted-foreground cursor-default"
                    : "bg-primary text-background hover:bg-primary-hover"
                }`}
              >
                {loadingRzPlan === key ? <Loader2 size={14} className="animate-spin" /> : null}
                {isCurrent ? "Current Plan" : loadingRzPlan === key ? "Opening…" : `Switch to ${meta.label}`}
              </motion.button>

              <ul className="space-y-2 flex-1">
                {meta.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Cancel option for current active plan */}
              {isCurrent && subscription?.status === "active" && (
                <div className="mt-5 pt-4 border-t border-border">
                  <button
                    onClick={() => setShowModal("cancel")}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    Cancel subscription
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Credit packs */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <Coins size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Buy More Credits</h2>
          <p className="text-sm text-muted-foreground">Top up anytime. No plan upgrade needed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PACK_META.map(({ key, tag }) => {
            const pack = config?.creditPacks?.[key]
            const credits = pack?.credits ?? 0
            const priceLabel = pack
              ? currency === "INR"
                ? `₹${(pack.amount / 100).toLocaleString("en-IN")}`
                : `$${pack.amount / 100}`
              : "—"
            return (
            <div key={key} className="relative bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              {tag && (
                <span className="absolute -top-2.5 right-3 bg-green-500 text-background text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              )}
              <div className="mb-4">
                <p className="font-heading text-2xl font-bold text-primary">
                  {priceLabel}
                </p>
                <p className="text-sm text-muted-foreground">{pack ? `${credits} credits` : "—"}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => !subscription ? null : handleBuyCreditPack(key, credits)}
                disabled={!subscription || !pack || loadingPack === key}
                className="w-full border border-primary/40 text-primary font-semibold rounded-lg py-2 text-sm hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingPack === key ? <Loader2 size={14} className="animate-spin" /> : null}
                {loadingPack === key ? "Processing…" : !subscription ? "Subscribe first" : "Buy Pack"}
              </motion.button>
            </div>
            )
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Credits expire at subscription renewal (no rollover).</p>
      </motion.div>

      {/* Payment modal overlay */}
      <AnimatePresence>
        {showModal === "cancel" && subscription && (
          <div className="fixed inset-0 bg-background/70 z-50 flex items-center justify-center p-4">
            <CancelModal
              onConfirm={() => { setShowModal(null); refetch() }}
              onClose={() => setShowModal(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
