import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { LayoutDashboard, Inbox, CheckSquare, DollarSign, HelpCircle, Menu, X, LogOut } from "lucide-react"
import { slideInFromRight } from "@/lib/animations"
import { useAuthStore } from "@/stores/authStore"
import { useEditorStore } from "@/stores/editorStore"
import { signOut } from "@/hooks/useAuth"
import NotificationBell from "@/components/NotificationBell"

const NAV = [
  { to: "/editor", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/editor/queue", icon: Inbox, label: "My Queue" },
  { to: "/editor/completed", icon: CheckSquare, label: "Completed" },
  { to: "/editor/payouts",  icon: DollarSign, label: "Payouts" },
  { to: "/editor/help", icon: HelpCircle, label: "Help" },
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
            ? "bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6] pl-[14px]"
            : "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#404040]/50"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function EditorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthStore()
  const { weeklyEarnings, currency: payoutCurrency } = useEditorStore()
  const navigate = useNavigate()

  const formattedEarnings = (() => {
    if (weeklyEarnings === 0) return "—"
    const amount = weeklyEarnings / 100
    return payoutCurrency === "INR"
      ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
      : `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  })()

  const handleSignOut = async () => {
    await signOut()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#121212] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1A1A1A] border-r border-[#2A2A2A] fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-[#2A2A2A]">
          <span className="font-heading text-lg font-bold text-[#F9FAFB]">TheVideoJanitors</span>
          <div className="mt-1">
            <span className="text-[10px] font-medium text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded px-2 py-0.5 uppercase tracking-wider">
              Editor
            </span>
          </div>
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
                <div>
                  <span className="font-heading text-lg font-bold text-[#F9FAFB]">TheVideoJanitors</span>
                  <div className="mt-1">
                    <span className="text-[10px] font-medium text-[#3B82F6] bg-[#3B82F6]/10 rounded px-2 py-0.5 uppercase tracking-wider">
                      Editor
                    </span>
                  </div>
                </div>
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
            {/* This week's earnings — live from editorStore */}
            <div className="hidden sm:flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-lg px-3 py-1.5">
              <span className="text-xs text-[#9CA3AF] font-sans uppercase tracking-wider">This Week</span>
              <span className="font-heading text-sm font-bold text-[#3B82F6]">{formattedEarnings}</span>
            </div>

            <NotificationBell />

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#3B82F6]">
                {user?.email?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          </div>
        </header>

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
                  isActive ? "text-[#3B82F6]" : "text-[#9CA3AF]"
                }`
              }
            >
              <Icon size={20} />
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
