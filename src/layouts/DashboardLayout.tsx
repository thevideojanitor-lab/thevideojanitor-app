import { useState, useEffect, useRef } from "react"
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { LayoutDashboard, FileVideo, PlusCircle, CreditCard, HelpCircle, Menu, X, LogOut, User } from "lucide-react"
import { slideInFromRight } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { usePricingStore } from "@/stores/pricingStore"
import { signOut } from "@/hooks/useAuth"
import CreditsDisplay from "@/components/CreditsDisplay"
import NotificationBell from "@/components/NotificationBell"
import { ThemeToggle } from "@/components/ThemeToggle"
import { initialiseRealtime, teardownRealtime } from "@/lib/realtime"

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/dashboard/requests", icon: FileVideo, label: "My Requests" },
  { to: "/dashboard/submit", icon: PlusCircle, label: "Submit Edit" },
  { to: "/dashboard/subscription", icon: CreditCard, label: "Subscription" },
  { to: "/dashboard/help", icon: HelpCircle, label: "Help" },
]

function NavItem({ to, icon: Icon, label, end, onClick }: typeof NAV[0] & { onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-primary/10 text-primary border-l-2 border-primary pl-[14px]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

function AvatarMenu({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="text-xs font-semibold text-primary">{email.charAt(0).toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-11 w-56 bg-input border border-border rounded-xl p-1.5 shadow-xl z-50"
          >
            <div className="px-3 py-2.5 border-b border-border mb-1.5">
              <p className="text-xs font-semibold text-foreground truncate">{email.split("@")[0]}</p>
              <p className="text-[11px] text-muted-foreground truncate">{email}</p>
            </div>
            <Link to="/dashboard/profile" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
              <User size={15} /> View Profile
            </Link>
            <Link to="/dashboard/subscription" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
              <CreditCard size={15} /> Billing & Plan
            </Link>
            <button onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
              <LogOut size={15} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, region } = useAuthStore()
  const { refresh: refreshCredits } = useCreditsStore()
  const { fetch: fetchPricing } = usePricingStore()
  const navigate = useNavigate()

  const impersonateEmail = localStorage.getItem("impersonate_client_email")
  const isImpersonating = !!localStorage.getItem("impersonate_client_id")

  function exitImpersonation() {
    localStorage.removeItem("impersonate_client_id")
    localStorage.removeItem("impersonate_client_email")
    navigate("/admin/clients")
  }

  useEffect(() => {
    if (!user?.id) return
    refreshCredits(user.id)
    fetchPricing(region)
    initialiseRealtime(user.id)
    return () => teardownRealtime()
  }, [user?.id])

  const handleSignOut = async () => {
    teardownRealtime()
    await signOut()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-border fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-border">
          <span className="font-heading text-lg font-bold text-foreground">TheVideoJanitors</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 w-72 bg-sidebar border-l border-border z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <span className="font-heading text-lg font-bold text-foreground">TheVideoJanitors</span>
                <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map((item) => (
                  <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Impersonation banner */}
        <AnimatePresence>
          {isImpersonating && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6 py-2.5 bg-primary text-primary-foreground text-xs font-semibold"
            >
              <span>Admin view: logged in as {impersonateEmail}</span>
              <button
                onClick={exitImpersonation}
                className="flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0"
              >
                <X size={13} /> Exit Impersonation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="h-16 bg-sidebar border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="md:hidden font-heading text-base font-bold text-foreground">
            TheVideoJanitors
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <CreditsDisplay compact />
            <NotificationBell />
            <ThemeToggle />
            <AvatarMenu email={user?.email ?? "?"} onSignOut={handleSignOut} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-border flex z-20">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <Icon size={20} />
              <span className="hidden xs:block">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
