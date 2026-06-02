import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { signInWithEmail, signInWithGoogle } from "@/hooks/useAuth"
import { useAuthStore } from "@/stores/authStore"
import AuthBackground from "@/components/AuthBackground"

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, role } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!user || !role) return
    if (role === "editor") navigate("/editor", { replace: true })
    else if (role === "admin") navigate("/admin", { replace: true })
    else navigate("/dashboard", { replace: true })
  }, [user, role, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError(null)
    setLoading(true)
    const { error } = await signInWithEmail(email.trim(), password)
    if (error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
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
          <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
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
            <span className="text-xs text-muted-foreground">or</span>
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
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Password</label>
                <button
                  type="button"
                  className="text-[10px] text-primary hover:underline"
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
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
              disabled={loading || googleLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-xl py-2.5 text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </motion.button>
          </form>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/auth/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
