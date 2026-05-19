import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import AuthBackground from "@/components/AuthBackground"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (err) {
      setError("Couldn't send reset email. Check the address and try again.")
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackground />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm space-y-6"
      >
        <motion.div variants={fadeUp} className="text-center">
          <Link to="/" className="font-heading text-xl font-bold text-[#F9FAFB] hover:text-[#FF5F15] transition-colors">
            TheVideoJanitors
          </Link>
          <p className="text-sm text-[#9CA3AF] mt-2">Reset your password</p>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-[#404040] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
          {done ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
                <CheckCircle size={24} className="text-[#4ade80]" />
              </div>
              <p className="text-sm font-semibold text-[#F9FAFB]">Check your inbox</p>
              <p className="text-xs text-[#9CA3AF]">
                We sent a reset link to <span className="text-[#F9FAFB]">{email}</span>. It expires in 1 hour.
              </p>
              <Link to="/auth/login" className="block text-xs text-[#FF5F15] hover:underline mt-2">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#9CA3AF]">Enter your account email and we'll send you a reset link.</p>
              <div className="space-y-1.5">
                <label className="text-xs text-[#9CA3AF]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle size={13} className="shrink-0" />
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-xl py-2.5 text-sm hover:bg-[#E54E08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? "Sending…" : "Send Reset Link"}
              </motion.button>
            </form>
          )}
        </motion.div>

        {!done && (
          <motion.p variants={fadeUp} className="text-center text-sm text-[#9CA3AF]">
            Remembered it?{" "}
            <Link to="/auth/login" className="text-[#FF5F15] font-semibold hover:underline">Sign in</Link>
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}
