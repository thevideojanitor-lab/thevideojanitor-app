import { create } from "zustand"
import { supabase, Request } from "@/lib/supabase"

const ACTIVE_STATUSES = ["pending_match", "matched", "in_progress", "delivered", "in_revision"]
const PAST_STATUSES = ["approved", "abandoned"]

interface RequestsStore {
  activeRequests: Request[]
  pastRequests: Request[]
  loading: boolean
  refresh: (clientId: string) => Promise<void>
}

export const useRequestsStore = create<RequestsStore>((set) => ({
  activeRequests: [],
  pastRequests: [],
  loading: false,

  refresh: async (clientId: string) => {
    set({ loading: true })

    const [activeRes, pastRes] = await Promise.all([
      supabase
        .from("requests")
        .select("*")
        .eq("client_id", clientId)
        .in("status", ACTIVE_STATUSES)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("requests")
        .select("*")
        .eq("client_id", clientId)
        .in("status", PAST_STATUSES)
        .order("submitted_at", { ascending: false })
        .limit(20),
    ])

    set({
      activeRequests: (activeRes.data as Request[]) ?? [],
      pastRequests: (pastRes.data as Request[]) ?? [],
      loading: false,
    })
  },
}))
