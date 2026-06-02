import { NavLink, Outlet, useNavigate, useLocation, Navigate } from "react-router-dom"
import { LayoutDashboard, FileVideo, Users, Briefcase, DollarSign, GitMerge, Settings, Shield, LogOut } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"
import { signOut } from "@/hooks/useAuth"
import NotificationBell from "@/components/NotificationBell"
import { ThemeToggle } from "@/components/ThemeToggle"

const NAV = [
  { to: "/admin",          icon: LayoutDashboard, label: "Dashboard",  end: true },
  { to: "/admin/requests", icon: FileVideo,        label: "Requests"               },
  { to: "/admin/clients",  icon: Users,            label: "Clients"                },
  { to: "/admin/editors",  icon: Briefcase,        label: "Editors"                },
  { to: "/admin/payouts",  icon: DollarSign,       label: "Payouts"                },
  { to: "/admin/matching", icon: GitMerge,         label: "Matching"               },
  { to: "/admin/settings", icon: Settings,         label: "Settings"               },
]

const ROLE_LABELS: Record<string, string> = {
  super_admin:   "Super Admin",
  ops_admin:     "Ops Admin",
  finance_admin: "Finance Admin",
}

const ROUTE_ACCESS: Record<string, string[]> = {
  "/admin/payouts":  ["super_admin", "finance_admin"],
  "/admin/settings": ["super_admin"],
}

function NavItem({ to, icon: Icon, label, end }: typeof NAV[0]) {
  return (
    <NavLink
      to={to}
      end={end}
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

export default function AdminLayout() {
  const { user, adminRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const visibleNav = NAV.filter((item) => {
    const allowed = ROUTE_ACCESS[item.to]
    return !allowed || (!!adminRole && allowed.includes(adminRole))
  })

  const restriction = ROUTE_ACCESS[location.pathname]
  const accessDenied = !!restriction && !(!!adminRole && restriction.includes(adminRole))

  const handleSignOut = async () => {
    await signOut()
    navigate("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — fixed 240px */}
      <aside className="flex flex-col w-60 bg-sidebar border-r border-border fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-5 border-b border-border">
          <span className="font-heading text-base font-bold text-foreground">TheVideoJanitors</span>
          <div className="mt-2 flex items-center gap-2">
            <Shield size={12} className="text-primary" />
            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">
              {adminRole ? ROLE_LABELS[adminRole] : "Admin"}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground truncate mb-2">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="h-16 bg-sidebar border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <h1 className="font-heading text-lg font-semibold text-foreground">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
            <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-md px-2.5 py-1">
              {adminRole ? ROLE_LABELS[adminRole] : "Admin"}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {user?.email?.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {accessDenied ? <Navigate to="/admin" replace /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}
