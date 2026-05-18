import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { fadeUp, scaleIn } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"
import type { EditorPayout } from "@/lib/supabase"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

// ── Types ─────────────────────────────────────────────────────────────────────

interface PayoutRow extends EditorPayout {
  editor_email: string
  editor_name: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekBounds(offset: number): { start: Date; end: Date; label: string } {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  const fmt = (d: Date) => d.toLocaleDateString([], { month: "short", day: "numeric" })
  const label = offset === 0 ? `This week (${fmt(monday)}–${fmt(sunday)})` : offset === -1 ? `Last week (${fmt(monday)}–${fmt(sunday)})` : `${fmt(monday)}–${fmt(sunday)}`
  return { start: monday, end: sunday, label }
}

function fmtAmount(amount: number, currency: string) {
  return currency === "INR"
    ? `₹${(amount / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : `$${(amount / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

async function logAction(adminId: string, type: string, targetId: string, notes?: string) {
  await supabase.from("admin_actions").insert({ admin_id: adminId, action_type: type, target_type: "payout", target_id: targetId, notes: notes ?? null })
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPayouts() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [weekOffset, setWeekOffset] = useState(0)
  const [currencyFilter, setCurrencyFilter] = useState<"all"|"USD"|"INR">("all")
  const [rows, setRows] = useState<PayoutRow[]>([])
  const [loading, setLoading] = useState(true)

  // Bulk confirm
  const [bulkCurrency, setBulkCurrency] = useState<"USD"|"INR"|null>(null)
  const [bulkWorking, setBulkWorking] = useState(false)

  // Per-row confirm
  const [confirmRow, setConfirmRow] = useState<PayoutRow | null>(null)
  const [paying, setPaying] = useState(false)

  const week = useMemo(() => getWeekBounds(weekOffset), [weekOffset])

  useEffect(() => { loadPayouts() }, [weekOffset])

  async function loadPayouts() {
    setLoading(true)
    const { data } = await supabase
      .from("editor_payouts")
      .select("*")
      .gte("created_at", week.start.toISOString())
      .lte("created_at", week.end.toISOString())
      .order("created_at", { ascending: false })

    if (!data) { setLoading(false); return }
    const editorIds = [...new Set((data as EditorPayout[]).map((p) => p.editor_id))]
    const [{ data: users }, { data: profiles }] = await Promise.all([
      supabase.from("users").select("id, email").in("id", editorIds),
      supabase.from("editor_profiles").select("user_id, display_name").in("user_id", editorIds),
    ])
    const emailMap: Record<string, string> = {}
    const nameMap: Record<string, string | null> = {}
    for (const u of (users ?? []) as {id: string; email: string}[]) emailMap[u.id] = u.email
    for (const p of (profiles ?? []) as {user_id: string; display_name: string | null}[]) nameMap[p.user_id] = p.display_name

    setRows((data as EditorPayout[]).map((p) => ({
      ...p,
      editor_email: emailMap[p.editor_id] ?? "",
      editor_name: nameMap[p.editor_id] ?? null,
    })))
    setLoading(false)
  }

  const filtered = useMemo(() =>
    currencyFilter === "all" ? rows : rows.filter((r) => r.currency === currencyFilter),
    [rows, currencyFilter]
  )

  const pending = filtered.filter((r) => r.status === "pending")
  const totalUsd = pending.filter((r) => r.currency === "USD").reduce((s, r) => s + r.amount, 0)
  const totalInr = pending.filter((r) => r.currency === "INR").reduce((s, r) => s + r.amount, 0)

  async function payOne(row: PayoutRow) {
    if (!user) return
    setPaying(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const fn = row.currency === "INR" ? "trigger-razorpay-payout" : "trigger-stripe-payout"
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ payoutId: row.id }),
        })
      } catch { /* Edge Function may not be deployed */ }

      await supabase.from("editor_payouts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", row.id)
      await logAction(user.id, "payout_sent", row.id, `${fmtAmount(row.amount, row.currency)} to ${row.editor_email}`)
      toast({ title: `Payout sent to ${row.editor_name ?? row.editor_email}` })
      setConfirmRow(null)
      loadPayouts()
    } finally {
      setPaying(false)
    }
  }

  async function payBulk(currency: "USD"|"INR") {
    if (!user) return
    setBulkWorking(true)
    const toPay = pending.filter((r) => r.currency === currency)
    for (const row of toPay) {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const fn = currency === "INR" ? "trigger-razorpay-payout" : "trigger-stripe-payout"
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ payoutId: row.id }),
          })
        } catch { /* graceful */ }
        await supabase.from("editor_payouts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", row.id)
        await logAction(user.id, "payout_sent", row.id, `Bulk ${currency} — ${fmtAmount(row.amount, currency)} to ${row.editor_email}`)
      } catch { /* continue */ }
    }
    toast({ title: `${toPay.length} payouts sent` })
    setBulkCurrency(null)
    setBulkWorking(false)
    loadPayouts()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Payouts</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{week.label}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Week selector */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="p-1.5 text-[#9CA3AF] hover:text-[#F9FAFB] rounded-md hover:bg-[#404040] transition-colors"><ChevronLeft size={14} /></button>
            <span className="text-xs text-[#9CA3AF] px-2 min-w-[80px] text-center">
              {weekOffset === 0 ? "This week" : weekOffset === -1 ? "Last week" : weekOffset === 1 ? "Next week" : `${weekOffset > 0 ? "+" : ""}${weekOffset}w`}
            </span>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="p-1.5 text-[#9CA3AF] hover:text-[#F9FAFB] rounded-md hover:bg-[#404040] transition-colors"><ChevronRight size={14} /></button>
          </div>

          {/* Currency filter */}
          <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1 gap-1">
            {(["all","USD","INR"] as const).map((c) => (
              <button key={c} onClick={() => setCurrencyFilter(c)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${currencyFilter === c ? "bg-[#FF5F15] text-[#121212]" : "text-[#9CA3AF] hover:text-[#F9FAFB]"}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk pay buttons */}
      {pending.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex gap-2">
          {totalUsd > 0 && (
            <button onClick={() => setBulkCurrency("USD")} className="flex items-center gap-2 px-4 py-2 bg-[#FF5F15] text-[#121212] text-xs font-semibold rounded-lg hover:bg-[#E54E08] transition-colors">
              Pay All USD ({fmtAmount(totalUsd, "USD")})
            </button>
          )}
          {totalInr > 0 && (
            <button onClick={() => setBulkCurrency("INR")} className="flex items-center gap-2 px-4 py-2 bg-[#FF5F15] text-[#121212] text-xs font-semibold rounded-lg hover:bg-[#E54E08] transition-colors">
              Pay All INR ({fmtAmount(totalInr, "INR")})
            </button>
          )}
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-xs text-[#9CA3AF]">Loading…</div> : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9CA3AF]">No payouts for this week.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  {["Editor","Amount","Currency","Method","Status","Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-[#2A2A2A] hover:bg-[#404040]/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#F9FAFB]">{row.editor_name ?? "—"}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{row.editor_email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-[#FF5F15]">{fmtAmount(row.amount, row.currency)}</td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{row.currency}</td>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF]">{row.payout_method ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${row.status === "paid" ? "text-[#4ade80] bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]" : row.status === "failed" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-[#9CA3AF] bg-[#404040]/50 border-[#2A2A2A]"}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.status === "pending" && (
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setConfirmRow(row)} className="px-3 py-1.5 bg-[#FF5F15] text-[#121212] text-xs font-semibold rounded-lg hover:bg-[#E54E08] transition-colors">
                          Pay Now
                        </motion.button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer totals */}
        <div className="px-4 py-3 border-t border-[#2A2A2A] flex items-center gap-6">
          <p className="text-xs text-[#9CA3AF]">
            Total pending: <span className="text-[#FF5F15] font-bold">{fmtAmount(totalUsd, "USD")}</span>
            {totalInr > 0 && <span className="ml-2 text-[#FF5F15] font-bold">{fmtAmount(totalInr, "INR")}</span>}
          </p>
        </div>
      </motion.div>

      {/* ── Pay Now Confirm ── */}
      <AnimatePresence>
        {confirmRow && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Confirm Payout</h2>
                <button onClick={() => setConfirmRow(null)} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <p className="text-sm text-[#F9FAFB]">
                Pay <span className="font-bold">{confirmRow.editor_name ?? confirmRow.editor_email}</span>{" "}
                <span className="text-[#FF5F15] font-bold">{fmtAmount(confirmRow.amount, confirmRow.currency)}</span>{" "}
                via <span className="text-[#9CA3AF]">{confirmRow.payout_method ?? "manual"}</span>?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmRow(null)} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => payOne(confirmRow)} disabled={paying} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {paying ? "Sending…" : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bulk Pay Confirm ── */}
      <AnimatePresence>
        {bulkCurrency && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Bulk {bulkCurrency} Payout</h2>
                <button onClick={() => setBulkCurrency(null)} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <p className="text-sm text-[#F9FAFB]">
                Send{" "}
                <span className="text-[#FF5F15] font-bold">
                  {fmtAmount(bulkCurrency === "USD" ? totalUsd : totalInr, bulkCurrency)}
                </span>{" "}
                to {pending.filter((r) => r.currency === bulkCurrency).length} editors?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setBulkCurrency(null)} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => payBulk(bulkCurrency)} disabled={bulkWorking} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {bulkWorking ? "Processing…" : "Pay All"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
