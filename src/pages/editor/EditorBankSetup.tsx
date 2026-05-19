import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { CheckCircle, Loader2, Building2, Smartphone } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"

type Mode = "bank" | "upi"

export default function EditorBankSetup() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>("bank")
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Bank fields
  const [accountNumber, setAccountNumber] = useState("")
  const [confirmAccount, setConfirmAccount] = useState("")
  const [ifsc, setIfsc] = useState("")
  const [accountName, setAccountName] = useState("")

  // UPI field
  const [upiId, setUpiId] = useState("")

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
  }, [user?.id])

  async function loadProfile() {
    setLoading(true)
    const { data } = await supabase
      .from("editor_profiles")
      .select("bank_account_number, bank_ifsc, bank_account_name, upi_id, bank_details_verified")
      .eq("user_id", user!.id)
      .single()
    if (data) {
      setVerified(!!data.bank_details_verified)
      setAccountNumber(data.bank_account_number ?? "")
      setIfsc(data.bank_ifsc ?? "")
      setAccountName(data.bank_account_name ?? "")
      setUpiId(data.upi_id ?? "")
      if (data.upi_id) setMode("upi")
    }
    setLoading(false)
  }

  const bankValid = mode === "bank"
    ? accountNumber.length >= 9 && accountNumber === confirmAccount && ifsc.length === 11 && accountName.trim().length > 0
    : false

  const upiValid = mode === "upi" && /^[\w.\-+]+@[\w]+$/.test(upiId.trim())

  const canSave = bankValid || upiValid

  async function handleSave() {
    if (!user?.id || !canSave) return
    setSaving(true)
    const update =
      mode === "bank"
        ? { bank_account_number: accountNumber, bank_ifsc: ifsc.toUpperCase(), bank_account_name: accountName.trim(), upi_id: null, bank_details_verified: true }
        : { upi_id: upiId.trim(), bank_account_number: null, bank_ifsc: null, bank_account_name: null, bank_details_verified: true }

    const { error } = await supabase
      .from("editor_profiles")
      .update(update)
      .eq("user_id", user.id)

    if (error) {
      toast({ title: "Save failed", description: "Please try again.", variant: "destructive" })
    } else {
      setVerified(true)
      toast({ title: "Bank details saved", description: "You're ready to receive INR payouts." })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto pt-4 space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-[#404040] rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-[#404040] rounded animate-pulse" />
        </div>
        <div className="h-11 bg-[#404040] rounded-xl animate-pulse" />
        <div className="space-y-3">
          {[0, 1, 2].map((s) => (
            <div key={s} className="h-16 bg-[#404040] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-[#404040] rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-md mx-auto pt-4 space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-2xl font-bold text-[#F9FAFB] mb-1">INR Payout Setup</h2>
        <p className="text-sm text-[#9CA3AF]">Add your Indian bank account or UPI ID to receive weekly INR payouts.</p>
      </motion.div>

      {/* Verified badge */}
      {verified && (
        <motion.div variants={fadeUp} className="flex items-center gap-2.5 bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-[#4ade80] shrink-0" />
          <p className="text-sm font-semibold text-[#4ade80]">Bank details verified</p>
        </motion.div>
      )}

      {/* Mode toggle */}
      <motion.div variants={fadeUp} className="flex bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 gap-1">
        {([["bank", Building2, "Bank Account"], ["upi", Smartphone, "UPI ID"]] as const).map(([m, Icon, label]) => (
          <button
            key={m}
            onClick={() => setMode(m as Mode)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
              mode === m ? "bg-[#FF5F15] text-[#121212]" : "text-[#9CA3AF] hover:text-[#F9FAFB]"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </motion.div>

      {mode === "bank" ? (
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3AF]">Account Holder Name</label>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="As per bank records"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3AF]">Account Number</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter account number"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3AF]">Confirm Account Number</label>
            <input
              value={confirmAccount}
              onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ""))}
              placeholder="Re-enter account number"
              className={`w-full bg-[#1A1A1A] border rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors font-mono ${
                confirmAccount && confirmAccount !== accountNumber ? "border-red-500/60" : "border-[#2A2A2A]"
              }`}
            />
            {confirmAccount && confirmAccount !== accountNumber && (
              <p className="text-[10px] text-red-400">Account numbers don't match</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-[#9CA3AF]">IFSC Code</label>
            <input
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
              placeholder="e.g. HDFC0001234"
              maxLength={11}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors font-mono uppercase"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="space-y-1.5">
          <label className="text-xs text-[#9CA3AF]">UPI ID</label>
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourname@paytm / yourname@upi"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors"
          />
          <p className="text-[10px] text-[#9CA3AF]">Supports any UPI handle — PhonePe, GPay, Paytm, etc.</p>
        </motion.div>
      )}

      <motion.button
        variants={fadeUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={!canSave || saving}
        className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-xl py-3.5 text-sm hover:bg-[#E54E08] disabled:opacity-40 transition-colors"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
        {saving ? "Saving…" : verified ? "Update Details" : "Save Details"}
      </motion.button>
    </motion.div>
  )
}
