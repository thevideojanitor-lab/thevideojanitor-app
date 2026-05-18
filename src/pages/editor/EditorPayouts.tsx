import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowRight, CheckCircle, ExternalLink, TrendingUp, Wallet } from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useEditorStore } from "@/stores/editorStore"
import type { EditorPayout } from "@/lib/supabase"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(amount: number, currency: "USD" | "INR") {
  return currency === "INR"
    ? `₹${(amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : `$${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short" })
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-[#404040] rounded-lg animate-pulse ${className}`} />
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: {
  active?: boolean; payload?: { value: number }[]; label?: string; currency: "USD" | "INR"
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2">
      <p className="text-[10px] text-[#9CA3AF] mb-0.5">{label}</p>
      <p className="text-sm font-bold text-[#FF5F15]">{fmtAmount((payload[0].value ?? 0) * 100, currency)}</p>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function EditorPayouts() {
  const { user, region, currency } = useAuthStore()
  const { pendingPayout, nextPayoutDate, weeklyEarnings } = useEditorStore()
  const payoutCurrency = currency as "USD" | "INR"

  const [payouts, setPayouts] = useState<EditorPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [stripeConnected, setStripeConnected] = useState(false)
  const [bankVerified, setBankVerified] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    loadAll()
  }, [user?.id])

  async function loadAll() {
    setLoading(true)
    const [{ data: payoutData }, { data: profile }] = await Promise.all([
      supabase
        .from("editor_payouts")
        .select("*")
        .eq("editor_id", user!.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("editor_profiles")
        .select("stripe_account_id, bank_details_verified")
        .eq("user_id", user!.id)
        .single(),
    ])
    setPayouts((payoutData as EditorPayout[]) ?? [])
    setStripeConnected(!!profile?.stripe_account_id)
    setBankVerified(!!profile?.bank_details_verified)
    setLoading(false)
  }

  // Build 12-month chart data
  const chartData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const label = MONTHS[d.getMonth()]
      const earned = payouts
        .filter((p) => {
          if (p.status !== "paid" || !p.paid_at) return false
          const pd = new Date(p.paid_at)
          return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()
        })
        .reduce((sum, p) => sum + p.amount / 100, 0)
      return { label, earned }
    })
  }, [payouts])

  const totalEarned = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0)
  const isINR = region === "IN"
  const connectPath = isINR ? "/editor/payouts/bank-setup" : "/editor/payouts/connect"
  const isSetup = isINR ? bankVerified : stripeConnected

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-24 md:pb-6">
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Earnings & Payouts</h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Payouts sent {isINR ? "via NEFT/UPI" : "via Stripe"} weekly on Monday</p>
      </motion.div>

      {/* Payment method card */}
      <motion.div variants={fadeUp} className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${
        isSetup ? "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.25)]" : "bg-[#404040] border-[#2A2A2A]"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isSetup ? "bg-[rgba(34,197,94,0.15)]" : "bg-[#FF5F15]/10"
          }`}>
            {isSetup
              ? <CheckCircle size={18} className="text-[#4ade80]" />
              : <Wallet size={18} className="text-[#FF5F15]" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F9FAFB]">
              {isSetup ? (isINR ? "Bank account connected" : "Stripe account connected") : "No payout method"}
            </p>
            <p className="text-[10px] text-[#9CA3AF]">
              {isSetup ? `Receives ${isINR ? "INR" : "USD"} payouts every Monday` : "Set up to start receiving payouts"}
            </p>
          </div>
        </div>
        <Link to={connectPath}>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-[#FF5F15] hover:underline shrink-0">
            {isSetup ? "Change" : "Setup"} <ExternalLink size={11} />
          </button>
        </Link>
      </motion.div>

      {/* Stats row */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending Payout", value: fmtAmount(pendingPayout, payoutCurrency), sub: nextPayoutDate ? `Next: ${nextPayoutDate}` : "—" },
            { label: "This Week", value: fmtAmount(weeklyEarnings, payoutCurrency), sub: "Paid jobs" },
            { label: "All Time", value: fmtAmount(totalEarned, payoutCurrency), sub: `${payouts.filter(p => p.status === "paid").length} payouts` },
          ].map(({ label, value, sub }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5"
            >
              <p className="text-[10px] font-sans uppercase tracking-wider text-[#9CA3AF] mb-2">{label}</p>
              <p className="font-heading text-2xl font-bold text-[#FF5F15]">{value}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Earnings chart */}
      <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-[#FF5F15]" />
            <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">12-Month Earnings</p>
          </div>
        </div>
        <div className="p-4 h-52">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="#2A2A2A" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip currency={payoutCurrency} />} />
                <Line
                  type="monotone"
                  dataKey="earned"
                  stroke="#FF5F15"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#FF5F15", stroke: "#121212", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Payout history table */}
      <motion.div variants={fadeUp} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2A2A2A]">
          <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">Payout History</p>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ArrowRight size={24} className="text-[#9CA3AF] mx-auto mb-3 rotate-45 opacity-40" />
            <p className="text-sm font-semibold text-[#F9FAFB]">No payouts yet</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Approved jobs will appear here after processing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {["Date", "Amount", "Currency", "Method", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-[#2A2A2A] hover:bg-[#404040]/30 transition-colors">
                    <td className="px-5 py-3 text-xs text-[#9CA3AF]">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-xs font-bold text-[#FF5F15]">{fmtAmount(p.amount, p.currency as "USD" | "INR")}</td>
                    <td className="px-5 py-3 text-xs text-[#9CA3AF]">{p.currency}</td>
                    <td className="px-5 py-3 text-xs text-[#9CA3AF]">{p.payout_method ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.status === "paid"
                          ? "text-[#4ade80] bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]"
                          : p.status === "failed"
                          ? "text-red-400 bg-red-500/10 border-red-500/20"
                          : "text-[#9CA3AF] bg-[#404040]/50 border-[#2A2A2A]"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
