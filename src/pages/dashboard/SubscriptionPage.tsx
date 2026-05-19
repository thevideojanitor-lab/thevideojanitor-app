import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Check, Coins, AlertCircle, ExternalLink, Loader2, X } from "lucide-react"
import { staggerContainer, fadeUp, scaleIn } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { usePricingStore } from "@/stores/pricingStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { useSubscription } from "@/hooks/useSubscription"
import CreditsDisplay from "@/components/CreditsDisplay"
import { supabase } from "@/lib/supabase"
import { track } from "@vercel/analytics"

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "")

// ── Types ────────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "annual"
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

// ── Stripe Payment Form ───────────────────────────────────────────────────────

function StripePaymentForm({ clientSecret, plan, onSuccess, onClose }: {
  clientSecret: string; plan: PlanKey; onSuccess: () => void; onClose: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.")
      setProcessing(false)
    } else {
      track("subscription_started", { plan, currency: "USD", region: "US", gateway: "stripe" })
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-[#404040] text-[#F9FAFB] rounded-lg py-3 text-sm font-medium hover:bg-[#404040] transition-colors"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={processing || !stripe}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold rounded-lg py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : null}
          {processing ? "Processing…" : "Confirm Subscription"}
        </motion.button>
      </div>
      <p className="text-center text-[10px] text-[#9CA3AF]">Secured by Stripe · Cancel anytime</p>
    </form>
  )
}

// ── Stripe Subscription Modal ─────────────────────────────────────────────────

function StripeModal({ plan, billingCycle, onSuccess, onClose }: {
  plan: PlanKey; billingCycle: BillingCycle; onSuccess: () => void; onClose: () => void
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.functions.invoke("create-stripe-subscription", {
      body: { plan, billingCycle },
    }).then(({ data, error: fnErr }) => {
      if (fnErr || !data?.clientSecret) {
        setError("Unable to initialise payment. Please try again.")
      } else {
        setClientSecret(data.clientSecret)
      }
      setLoading(false)
    })
  }, [plan, billingCycle])

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-heading text-lg font-semibold text-[#F9FAFB]">
            {PLAN_META[plan].label}
          </h3>
          <p className="text-xs text-[#9CA3AF] capitalize">{billingCycle} billing</p>
        </div>
        <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#F9FAFB]">
          <X size={20} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={24} className="animate-spin text-[#FF5F15]" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "#FF5F15", colorBackground: "#1A1A1A" } } }}>
          <StripePaymentForm clientSecret={clientSecret} plan={plan} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      )}
    </motion.div>
  )
}

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

function CancelModal({ gateway, subId, onConfirm, onClose }: {
  gateway: string; subId: string; onConfirm: () => void; onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    const fnName = gateway === "stripe" ? "create-stripe-subscription" : "create-razorpay-subscription"
    await supabase.functions.invoke(fnName, { body: { action: "cancel", subscriptionId: subId } })
    setLoading(false)
    onConfirm()
  }

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden"
      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-sm mx-auto">
      <h3 className="font-heading text-lg font-semibold text-[#F9FAFB] mb-2">Cancel subscription?</h3>
      <p className="text-sm text-[#9CA3AF] mb-6">Your access continues until the end of the current billing period. Credits already deducted will not be refunded.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 border border-[#404040] text-[#F9FAFB] rounded-lg py-2.5 text-sm font-medium hover:bg-[#404040] transition-colors">Keep Plan</button>
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

  const [billing, setBilling] = useState<BillingCycle>("monthly")
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)
  const [showModal, setShowModal] = useState<"stripe" | "cancel" | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loadingRzPlan, setLoadingRzPlan] = useState<PlanKey | null>(null)
  const [loadingPack, setLoadingPack] = useState<string | null>(null)

  useEffect(() => { fetchPricing(region) }, [region])

  const planKeys = ["quick_sweep", "deep_clean", "full_service"] as PlanKey[]

  const getPrice = useCallback((key: PlanKey) => {
    if (!config) return null
    const raw = (config.plans as Record<string, { amount: number }>)[key]?.amount ?? 0
    const monthly = raw / 100
    if (billing === "annual") return Math.round(monthly * 0.8)
    return monthly
  }, [config, billing])

  const displayPrice = (key: PlanKey) => {
    const p = getPrice(key)
    if (p === null) return "—"
    return currency === "INR" ? `₹${p.toLocaleString("en-IN")}` : `$${p}`
  }

  const handleSelectPlan = async (key: PlanKey) => {
    setSelectedPlan(key)
    if (region === "US") {
      setShowModal("stripe")
    } else {
      // Razorpay flow
      setLoadingRzPlan(key)
      const loaded = await loadRazorpayScript()
      if (!loaded) { setLoadingRzPlan(null); return }

      const { data, error } = await supabase.functions.invoke("create-razorpay-subscription", { body: { plan: key } })
      if (error || !data) { setLoadingRzPlan(null); return }

      // @ts-expect-error — Razorpay loaded dynamically
      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "TheVideoJanitors",
        description: `${data.planName} — ${billing} billing`,
        handler: () => {
          track("subscription_started", { plan: key, currency: "INR", region: "IN", gateway: "razorpay" })
          setShowSuccess(true)
          refetch()
          if (user?.id) refreshCredits(user.id)
        },
      })
      rzp.open()
      setLoadingRzPlan(null)
    }
  }

  const handleBuyCreditPack = async (packKey: string, credits: number) => {
    setLoadingPack(packKey)
    if (region === "US") {
      const { data } = await supabase.functions.invoke("create-stripe-credit-pack", { body: { pack: packKey } })
      if (data?.url) window.location.href = data.url
    } else {
      const loaded = await loadRazorpayScript()
      if (!loaded) { setLoadingPack(null); return }
      const { data } = await supabase.functions.invoke("create-razorpay-order", { body: { pack: packKey } })
      if (!data) { setLoadingPack(null); return }

      // @ts-expect-error — Razorpay loaded dynamically
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        name: "TheVideoJanitors",
        description: `${credits} Credits`,
        handler: () => {
          track("credits_recharged", { pack_size: packKey, currency: "INR", region: "IN" })
          if (user?.id) refreshCredits(user.id)
        },
      })
      rzp.open()
    }
    setLoadingPack(null)
  }

  const handleSubscribeSuccess = () => {
    setShowModal(null)
    setSelectedPlan(null)
    setShowSuccess(true)
    refetch()
    if (user?.id) refreshCredits(user.id)
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
              <p className="text-xs text-[#9CA3AF] mt-0.5">Update your payment method to restore access.</p>
            </div>
            {subscription?.gateway === "stripe" ? (
              <a href="https://billing.stripe.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5F15] border border-[#FF5F15]/30 rounded-lg px-3 py-1.5 hover:bg-[#FF5F15]/10 transition-colors">
                Update Card <ExternalLink size={12} />
              </a>
            ) : null}
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
              <Check size={18} className="text-[#4ade80] shrink-0" />
              <p className="text-sm font-medium text-[#4ade80]">Subscription activated! Your credits are ready.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="text-[#9CA3AF] hover:text-[#F9FAFB]">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credits summary card */}
      {subscription && (
        <div className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">Current Plan</p>
              <h2 className="font-heading text-xl font-semibold text-[#F9FAFB] mt-0.5">
                {PLAN_META[subscription.plan as PlanKey]?.label ?? subscription.plan}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                subscription.status === "active" ? "bg-[rgba(34,197,94,0.15)] text-[#4ade80] border border-[rgba(34,197,94,0.3)]"
                : subscription.status === "past_due" ? "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
                : "bg-[rgba(64,64,64,0.5)] text-[#9CA3AF] border border-[#2A2A2A]"
              }`}>
                {subscription.status === "past_due" ? "Past Due" : subscription.status}
              </span>
            </div>
          </div>
          <CreditsDisplay />
          {subscription.renews_at && subscription.status === "active" && (
            <p className="text-xs text-[#9CA3AF] mt-3">
              Renews {new Date(subscription.renews_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      )}

      {/* Page heading */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2 mb-8">
        <motion.p variants={fadeUp} className="text-xs font-sans uppercase tracking-widest text-[#FF5F15]">
          {subscription ? "Change Plan" : "Choose Your Plan"}
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-heading text-2xl md:text-3xl font-bold text-[#F9FAFB]">
          {subscription ? "Upgrade, downgrade, or buy more credits." : "Clean edits. Fast delivery. Pick your pace."}
        </motion.h1>
      </motion.div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 mb-8">
        <div className="inline-flex bg-[#2A2A2A] rounded-full p-1 gap-1">
          {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBilling(cycle)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                billing === cycle ? "bg-[#FF5F15] text-[#121212]" : "text-[#9CA3AF] hover:text-[#F9FAFB]"
              }`}
            >
              {cycle}
              {cycle === "annual" && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-[#121212] text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  20% OFF
                </span>
              )}
            </button>
          ))}
        </div>
        {billing === "annual" && (
          <p className="text-xs text-[#9CA3AF]">Billed once yearly</p>
        )}
      </div>

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
                  ? "bg-[#FF5F15]/5 border-[#FF5F15]/40"
                  : meta.popular
                    ? "bg-[#404040] border-[#FF5F15]/20"
                    : "bg-[#404040] border-[#2A2A2A] hover:border-[#FF5F15]/20"
              }`}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 absolute -top-3 left-4">
                {isCurrent && (
                  <span className="bg-[#FF5F15] text-[#121212] text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                )}
                {meta.popular && !isCurrent && (
                  <span className="bg-[#404040] border border-[#FF5F15]/30 text-[#FF5F15] text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>

              <div className="mb-5 mt-2">
                <h3 className="font-heading text-lg font-semibold text-[#F9FAFB] mb-0.5">{meta.label}</h3>
                <p className="text-xs text-[#9CA3AF]">{meta.tagline}</p>

                <div className="flex items-baseline gap-1 mt-4">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${key}-${billing}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="font-heading text-3xl font-bold text-[#FF5F15]"
                    >
                      {pricingLoading ? "—" : displayPrice(key)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[#9CA3AF] text-sm">/mo</span>
                  {billing === "annual" && !pricingLoading && (
                    <span className="text-xs text-green-400 font-medium ml-1">Save 20%</span>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => canSubscribe(key) && handleSelectPlan(key)}
                disabled={!canSubscribe(key) || !!loadingRzPlan}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold mb-5 flex items-center justify-center gap-2 transition-colors ${
                  isCurrent
                    ? "bg-[#2A2A2A] text-[#9CA3AF] cursor-default"
                    : "bg-[#FF5F15] text-[#121212] hover:bg-[#E54E08]"
                }`}
              >
                {loadingRzPlan === key ? <Loader2 size={14} className="animate-spin" /> : null}
                {isCurrent ? "Current Plan" : loadingRzPlan === key ? "Opening…" : `Switch to ${meta.label}`}
              </motion.button>

              <ul className="space-y-2 flex-1">
                {meta.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="text-[#FF5F15] mt-0.5 shrink-0" />
                    <span className="text-[#F9FAFB]/80">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Cancel option for current active plan */}
              {isCurrent && subscription?.status === "active" && subscription.gateway === "stripe" && (
                <div className="mt-5 pt-4 border-t border-[#2A2A2A]">
                  <a href="https://billing.stripe.com" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
                    Manage billing <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {isCurrent && subscription?.status === "active" && subscription.gateway === "razorpay" && (
                <div className="mt-5 pt-4 border-t border-[#2A2A2A]">
                  <button
                    onClick={() => setShowModal("cancel")}
                    className="text-xs text-[#9CA3AF] hover:text-red-400 transition-colors"
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
          <Coins size={20} className="text-[#FF5F15]" />
          <h2 className="font-heading text-lg font-semibold text-[#F9FAFB]">Buy More Credits</h2>
          <p className="text-sm text-[#9CA3AF]">Top up anytime. No plan upgrade needed.</p>
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
            <div key={key} className="relative bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#FF5F15]/30 transition-colors">
              {tag && (
                <span className="absolute -top-2.5 right-3 bg-green-500 text-[#121212] text-[9px] font-bold px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              )}
              <div className="mb-4">
                <p className="font-heading text-2xl font-bold text-[#FF5F15]">
                  {priceLabel}
                </p>
                <p className="text-sm text-[#9CA3AF]">{pack ? `${credits} credits` : "—"}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => !subscription ? null : handleBuyCreditPack(key, credits)}
                disabled={!subscription || !pack || loadingPack === key}
                className="w-full border border-[#FF5F15]/40 text-[#FF5F15] font-semibold rounded-lg py-2 text-sm hover:bg-[#FF5F15]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingPack === key ? <Loader2 size={14} className="animate-spin" /> : null}
                {loadingPack === key ? "Processing…" : !subscription ? "Subscribe first" : "Buy Pack"}
              </motion.button>
            </div>
            )
          })}
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3">Credits expire at subscription renewal (no rollover).</p>
      </motion.div>

      {/* Payment modal overlay */}
      <AnimatePresence>
        {(showModal === "stripe" && selectedPlan) && (
          <div className="fixed inset-0 bg-[#121212]/70 z-50 flex items-center justify-center p-4">
            <StripeModal
              plan={selectedPlan}
              billingCycle={billing}
              onSuccess={handleSubscribeSuccess}
              onClose={() => { setShowModal(null); setSelectedPlan(null) }}
            />
          </div>
        )}
        {showModal === "cancel" && subscription && (
          <div className="fixed inset-0 bg-[#121212]/70 z-50 flex items-center justify-center p-4">
            <CancelModal
              gateway={subscription.gateway}
              subId={subscription.gateway_subscription_id ?? ""}
              onConfirm={() => { setShowModal(null); refetch() }}
              onClose={() => setShowModal(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
