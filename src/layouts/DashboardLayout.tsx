import { useState, useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { LayoutDashboard, FileVideo, PlusCircle, CreditCard, HelpCircle, Menu, X, LogOut } from "lucide-react"
import { slideInFromRight } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { usePricingStore } from "@/stores/pricingStore"
import { signOut } from "@/hooks/useAuth"
import CreditsDisplay from "@/components/CreditsDisplay"
import NotificationBell from "@/components/NotificationBell"
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
            ? "bg-[#FF5F15]/10 text-[#FF5F15] border-l-2 border-[#FF5F15] pl-[14px]"
            : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#404040]/50"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, region } = useAuthStore()
  const { refresh: refreshCredits } = useCreditsStore()
  const { fetch: fetchPricing } = usePricingStore()
  const navigate = useNavigate()

  // Impersonation banner — set by AdminClients when admin impersonates a client
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
    <div className="min-h-screen bg-[#121212] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-[#2A2A2A]">
          <span className="font-heading text-lg font-bold text-[#F9FAFB]">TheVideoJanitors</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#2A2A2A]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#404040]/50 transition-colors"
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
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              variants={slideInFromRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
                <span className="font-heading text-lg font-bold text-[#F9FAFB]">TheVideoJanitors</span>
                <button onClick={() => setSidebarOpen(false)} className="text-[#9CA3AF] hover:text-[#F9FAFB]">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {NAV.map((item) => (
                  <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
                ))}
              </nav>
              <div className="px-3 py-4 border-t border-[#2A2A2A]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#404040]/50 transition-colors"
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
        {/* Impersonation banner — visible to admin acting as a client */}
        <AnimatePresence>
          {isImpersonating && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6 py-2.5 bg-[#FF5F15] text-[#121212] text-xs font-semibold"
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
        <header className="h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <button
            className="md:hidden text-[#9CA3AF] hover:text-[#F9FAFB]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="md:hidden font-heading text-base font-bold text-[#F9FAFB]">
            TheVideoJanitors
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:block">
              <CreditsDisplay compact />
            </div>

            <NotificationBell />

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#FF5F15]/20 border border-[#FF5F15]/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#FF5F15]">
                {user?.email?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] flex z-20">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#FF5F15]" : "text-[#9CA3AF]"
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
