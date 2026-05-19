import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "motion/react"
import { CheckCircle, ExternalLink, Loader2, Shield } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"
import EditorBankSetup from "./EditorBankSetup"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export default function EditorPayoutsConnect() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  // Check current connection status (Stripe only — skipped for IN region)
  useEffect(() => {
    if (!user?.id || user.region === "IN") return
    checkConnection()

    const returned = searchParams.get("stripe_return")
    if (returned === "1") verifyAndSave()
  }, [user?.id])

  async function checkConnection() {
    setLoading(true)
    const { data } = await supabase
      .from("editor_profiles")
      .select("stripe_account_id")
      .eq("user_id", user!.id)
      .single()
    setConnected(!!data?.stripe_account_id)
    setLoading(false)
  }

  async function verifyAndSave() {
    const accountId = searchParams.get("account_id")
    if (!accountId || !user?.id) return
    const { error } = await supabase
      .from("editor_profiles")
      .update({ stripe_account_id: accountId })
      .eq("user_id", user.id)
    if (error) {
      toast({ title: "Couldn't save your bank connection", description: "Please connect again to finish setup.", variant: "destructive" })
      return
    }
    setConnected(true)
    toast({ title: "Bank account connected!", description: "You'll receive payouts every week." })
  }

  async function handleConnect() {
    if (!user?.id) return
    setConnecting(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-stripe-connect-link`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          editorId: user.id,
          returnUrl: `${window.location.origin}/editor/payouts/connect?stripe_return=1`,
          refreshUrl: `${window.location.origin}/editor/payouts/connect`,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? "Failed to create Connect link")
      }
    } catch (err) {
      toast({ title: "Connection failed", description: "Please try again.", variant: "destructive" })
      setConnecting(false)
    }
  }

  // Indian editors use Razorpay bank/UPI — Stripe Connect is for USD editors only
  if (user?.region === "IN") return <EditorBankSetup />

  if (loading) {
    return (
      <div className="max-w-md mx-auto pt-8 space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-[#404040] rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-[#404040] rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((s) => (
            <div key={s} className="h-16 bg-[#404040] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-[#404040] rounded-xl animate-pulse" />
      </div>
    )
  }

  if (connected) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto pt-12 space-y-6 text-center"
      >
        <motion.div variants={fadeUp} className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
          <CheckCircle size={32} className="text-[#4ade80]" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <h2 className="font-heading text-2xl font-bold text-[#F9FAFB] mb-2">Bank account connected</h2>
          <p className="text-sm text-[#9CA3AF]">Payouts will be sent to your connected Stripe account every week after jobs are approved.</p>
        </motion.div>
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/editor/payouts")}
          className="bg-[#FF5F15] text-[#121212] font-semibold rounded-lg px-6 py-3 text-sm hover:bg-[#E54E08] transition-colors"
        >
          View Earnings
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-md mx-auto pt-8 space-y-6"
    >
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-2xl font-bold text-[#F9FAFB] mb-2">Connect your bank account</h2>
        <p className="text-sm text-[#9CA3AF]">Link your bank via Stripe Connect to receive weekly USD payouts directly.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {[
          { icon: Shield, title: "Bank-grade security", desc: "Stripe handles all payment data — we never see your account details." },
          { icon: CheckCircle, title: "Weekly payouts", desc: "Earnings from approved jobs are transferred every Monday." },
          { icon: ExternalLink, title: "Fast setup", desc: "Takes 2 minutes. You'll be redirected to Stripe and back." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 bg-[#404040] border border-[#2A2A2A] rounded-xl p-4">
            <div className="w-8 h-8 rounded-lg bg-[#FF5F15]/10 border border-[#FF5F15]/20 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-[#FF5F15]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F9FAFB]">{title}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        variants={fadeUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleConnect}
        disabled={connecting}
        className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-xl py-3.5 text-sm hover:bg-[#E54E08] disabled:opacity-50 transition-colors"
      >
        {connecting ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
        {connecting ? "Redirecting to Stripe…" : "Connect with Stripe"}
      </motion.button>

      <motion.p variants={fadeUp} className="text-[10px] text-[#9CA3AF] text-center">
        By connecting, you agree to Stripe's Connected Account Agreement. Stripe processes all payouts.
      </motion.p>
    </motion.div>
  )
}
