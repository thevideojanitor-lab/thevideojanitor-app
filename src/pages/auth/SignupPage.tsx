import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, ArrowLeft, CheckCircle, ChevronRight, Eye, EyeOff, Loader2, Scissors, Video } from "lucide-react"
import { fadeUp, slideInFromRight, staggerContainer } from "@/lib/animations"
import { signUpWithEmail, signInWithGoogle } from "@/hooks/useAuth"
import AuthBackground from "@/components/AuthBackground"

type Role = "client" | "editor"
type Step = "role" | "auth"

export default function SignupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("role")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [done, setDone] = useState(false)

  const passwordStrong = password.length >= 8
  const passwordMatch = password === confirm && confirm.length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole || !email.trim() || !passwordStrong || !passwordMatch) return
    setError(null)
    setLoading(true)
    const { error, needsConfirmation } = await signUpWithEmail(email.trim(), password, selectedRole)
    if (error) {
      setError(error.includes("already") ? "An account with this email already exists. Sign in instead." : error)
      setLoading(false)
    } else if (needsConfirmation) {
      // Email confirmation required — tell them to check their inbox.
      setDone(true)
    } else {
      // Already signed in (no confirmation step) — the route guards route to the
      // right onboarding for their role.
      navigate(selectedRole === "editor" ? "/editor" : "/dashboard", { replace: true })
    }
  }

  async function handleGoogle() {
    if (!selectedRole) return
    setGoogleLoading(true)
    // Pass the chosen role so the OAuth callback can provision the right profile
    // and skip the role step entirely.
    const { error } = await signInWithGoogle(selectedRole)
    if (error) {
      setError("Google sign-in failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <AuthBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm text-center space-y-5"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">Check your inbox</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <Link to="/auth/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <AuthBackground />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-sm space-y-6"
      >
        <motion.div variants={fadeUp} className="text-center">
          <Link to="/" className="font-heading text-xl font-bold text-foreground hover:text-primary transition-colors">
            TheVideoJanitors
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "role"
              ? "First — how will you use the platform?"
              : selectedRole === "editor"
                ? "Join as an editor — start earning"
                : "Create your account — it's free to start"}
          </p>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {step === "role" ? (
            /* ── Step 1: pick a role ── */
            <motion.div
              key="role"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <div className="grid grid-cols-1 gap-3">
                {([
                  { role: "client", icon: Video, label: "I'm a Creator", desc: "Submit footage, get edits back in 48h" },
                  { role: "editor", icon: Scissors, label: "I'm an Editor", desc: "Fulfil requests and earn weekly" },
                ] as const).map(({ role, icon: Icon, label, desc }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selectedRole === role
                        ? "bg-primary/15 border-primary/40"
                        : "bg-input border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                        selectedRole === role ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${selectedRole === role ? "text-primary" : "text-foreground"}`}>{label}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                disabled={!selectedRole}
                onClick={() => { setError(null); setStep("auth") }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-2.5 text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          ) : (
            /* ── Step 2: choose auth method ── */
            <motion.div
              key="auth"
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-card border border-border rounded-2xl p-6 space-y-4"
            >
              <button
                type="button"
                onClick={() => { setError(null); setStep("role") }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={13} />
                {selectedRole === "editor" ? "Signing up as an Editor" : "Signing up as a Creator"} — change
              </button>

              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 border border-border bg-input hover:bg-muted text-foreground text-sm font-medium rounded-xl py-2.5 transition-colors disabled:opacity-50"
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
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      required
                      className="w-full bg-input border border-border rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 8 ? "bg-green-400" : "bg-border"}`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 12 ? "bg-green-400" : "bg-border"}`} />
                      <div className={`h-1 flex-1 rounded-full transition-colors ${password.length >= 16 ? "bg-green-400" : "bg-border"}`} />
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {password.length < 8 ? "Too short" : password.length < 12 ? "Good" : "Strong"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Confirm password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                    className={`w-full bg-input border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors ${
                      confirm && !passwordMatch ? "border-red-500/60" : "border-border"
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
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-2.5 text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                  {loading ? "Creating account…" : "Create Account"}
                </motion.button>
              </form>

              <p className="text-[10px] text-muted-foreground text-center">
                By signing up you agree to our{" "}
                <Link to="/legal/terms" className="text-primary hover:underline">Terms</Link>
                {" "}and{" "}
                <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
