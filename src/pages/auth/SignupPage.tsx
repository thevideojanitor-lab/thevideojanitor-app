import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Scissors, Video } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { signUpWithEmail, signInWithGoogle } from "@/hooks/useAuth"
import AuthBackground from "@/components/AuthBackground"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"client" | "editor">("client")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done, setDone] = useState(false)

  const passwordStrong = password.length >= 8
  const passwordMatch = password === confirm && confirm.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !passwordStrong || !passwordMatch) return
    setError(null)
    setLoading(true)
    const { error } = await signUpWithEmail(email.trim(), password, selectedRole)
    if (error) {
      setError(error.includes("already") ? "An account with this email already exists. Sign in instead." : error)
      setLoading(false)
    } else {
      setDone(true)
      // useAuth onAuthStateChange fires → PublicOnlyRoute → /onboarding
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError("Google sign-in failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 relative overflow-hidden">
        <AuthBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm text-center space-y-5"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] flex items-center justify-center">
            <CheckCircle size={32} className="text-[#4ade80]" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-[#F9FAFB] mb-2">Check your inbox</h2>
            <p className="text-sm text-[#9CA3AF]">
              We sent a confirmation link to <span className="text-[#F9FAFB] font-medium">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <Link to="/auth/login" className="text-sm text-[#FF5F15] hover:underline">
            Back to login
          </Link>
        </motion.div>
      </div>
    )
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
        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center">
          <Link to="/" className="font-heading text-xl font-bold text-[#F9FAFB] hover:text-[#FF5F15] transition-colors">
            TheVideoJanitors
          </Link>
          <p className="text-sm text-[#9CA3AF] mt-2">
            {selectedRole === "editor" ? "Join as an editor — start earning" : "Create your account — it's free to start"}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp}
          className="bg-[#404040] border border-[#2A2A2A] rounded-2xl p-6 space-y-4"
        >
          {/* Role picker */}
          <div className="flex gap-2">
            {([
              { role: "client", icon: Video, label: "I'm a Creator" },
              { role: "editor", icon: Scissors, label: "I'm an Editor" },
            ] as const).map(({ role, icon: Icon, label }) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedRole === role
                    ? "bg-[#FF5F15]/15 text-[#FF5F15] border-[#FF5F15]/40"
                    : "bg-[#1A1A1A] text-[#9CA3AF] border-[#2A2A2A] hover:border-[#404040] hover:text-[#F9FAFB]"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-xs text-[#9CA3AF]">then sign up with</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#F9FAFB] text-sm font-medium rounded-xl py-2.5 transition-colors disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-xs text-[#9CA3AF]">or</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-[#9CA3AF]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#9CA3AF]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password strength */}
              {password.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 8 ? "bg-[#4ade80]" : "bg-[#2A2A2A]"}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 12 ? "bg-[#4ade80]" : "bg-[#2A2A2A]"}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 16 ? "bg-[#4ade80]" : "bg-[#2A2A2A]"}`} />
                  <span className="text-[10px] text-[#9CA3AF] ml-1">
                    {password.length < 8 ? "Too short" : password.length < 12 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#9CA3AF]">Confirm password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                className={`w-full bg-[#1A1A1A] border rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 transition-colors ${
                  confirm && !passwordMatch ? "border-red-500/60" : "border-[#2A2A2A]"
                }`}
              />
              {confirm && !passwordMatch && (
                <p className="text-[10px] text-red-400">Passwords don't match</p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5"
              >
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || googleLoading || !email || !passwordStrong || !passwordMatch}
              className="w-full flex items-center justify-center gap-2 bg-[#FF5F15] text-[#121212] font-semibold rounded-xl py-2.5 text-sm hover:bg-[#E54E08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? "Creating account…" : "Create Account"}
            </motion.button>
          </form>

          <p className="text-[10px] text-[#9CA3AF] text-center">
            By signing up you agree to our{" "}
            <Link to="/legal/terms" className="text-[#FF5F15] hover:underline">Terms</Link>
            {" "}and{" "}
            <Link to="/legal/privacy" className="text-[#FF5F15] hover:underline">Privacy Policy</Link>.
          </p>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-[#9CA3AF]">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-[#FF5F15] font-semibold hover:underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
