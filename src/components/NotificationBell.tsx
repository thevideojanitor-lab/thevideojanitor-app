import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Bell } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  message: string
  type: string
  read: boolean
  created_at: string
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [ring, setRing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user?.id) return
    loadNotifications()

    const ch = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification
          setNotifications((prev) => [n, ...prev].slice(0, 10))
          setRing(true)
          setTimeout(() => setRing(false), 800)
          toast({ title: n.message })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [user?.id])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10)
    setNotifications((data as Notification[]) ?? [])
  }

  async function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        onClick={handleToggle}
        animate={ring ? { rotate: [0, -18, 18, -12, 12, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              aria-hidden="true"
              className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#FF5F15] text-[#121212] text-[9px] font-bold rounded-full flex items-center justify-center px-1"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-8 w-80 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#2A2A2A]">
              <p className="text-xs font-semibold text-[#F9FAFB]">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] text-center py-8">All caught up!</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-[#2A2A2A] last:border-0 ${
                      !n.read ? "bg-[#FF5F15]/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF5F15] shrink-0" />
                      )}
                      <div className={!n.read ? "" : "pl-3.5"}>
                        <p className="text-xs text-[#F9FAFB] leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-1">{getRelativeTime(n.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
