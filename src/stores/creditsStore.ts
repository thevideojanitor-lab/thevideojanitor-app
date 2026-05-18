import { create } from "zustand"
import { supabase } from "@/lib/supabase"

interface CreditsStore {
  balance: number
  total: number
  loading: boolean
  refresh: (clientId: string) => Promise<void>
  deduct: (amount: number) => void
}

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  balance: 0,
  total: 0,
  loading: false,

  refresh: async (clientId: string) => {
    set({ loading: true })
    const { data } = await supabase
      .from("subscriptions")
      .select("credits_remaining, credits_total")
      .eq("client_id", clientId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (data) {
      set({ balance: data.credits_remaining, total: data.credits_total })
    }
    set({ loading: false })
  },

  // Optimistic deduction on submission — DB is source of truth
  deduct: (amount: number) => {
    set({ balance: Math.max(0, get().balance - amount) })
  },
}))
