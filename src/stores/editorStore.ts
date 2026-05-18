import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Request } from "@/lib/supabase"

interface EditorStore {
  activeQueue: Request[]
  completedQueue: Request[]
  weeklyEarnings: number
  pendingPayout: number
  nextPayoutDate: string | null
  currency: "USD" | "INR"
  loading: boolean
  refresh: (editorId: string) => Promise<void>
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeQueue: [],
  completedQueue: [],
  weeklyEarnings: 0,
  pendingPayout: 0,
  nextPayoutDate: null,
  currency: "USD",
  loading: false,

  refresh: async (editorId: string) => {
    set({ loading: true })
    try {
      const [activeRes, completedRes, payoutsRes] = await Promise.all([
        supabase
          .from("requests")
          .select("*")
          .eq("editor_id", editorId)
          .in("status", ["matched", "in_progress", "delivered", "in_revision"])
          .order("due_at", { ascending: true }),
        supabase
          .from("requests")
          .select("*")
          .eq("editor_id", editorId)
          .eq("status", "approved")
          .order("approved_at", { ascending: false })
          .limit(30),
        supabase
          .from("editor_payouts")
          .select("amount, currency, status, paid_at")
          .eq("editor_id", editorId),
      ])

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const payouts = payoutsRes.data ?? []

      const weeklyEarnings = payouts
        .filter((p) => p.status === "paid" && p.paid_at && p.paid_at >= weekAgo)
        .reduce((sum, p) => sum + (p.amount as number), 0)

      const pendingPayout = payouts
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + (p.amount as number), 0)

      const currency = ((payouts[0]?.currency as "USD" | "INR") ?? "USD")

      const now = new Date()
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      const nextMonday = new Date(now)
      nextMonday.setDate(now.getDate() + daysUntilMonday)
      nextMonday.setHours(0, 0, 0, 0)

      set({
        activeQueue: activeRes.data ?? [],
        completedQueue: completedRes.data ?? [],
        weeklyEarnings,
        pendingPayout,
        nextPayoutDate: nextMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        currency,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },
}))
