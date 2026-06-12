import { useState, useEffect } from "react"
import { supabase, Subscription } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

export function useSubscription() {
  const { user } = useAuthStore()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user?.id) { setLoading(false); return }
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("client_id", user.id)
      .in("status", ["active", "past_due", "trialing"])
      .order("created_at", { ascending: false })
    // A 'trialing' row is created when checkout opens and only becomes 'active'
    // once payment lands — never let an abandoned checkout shadow a paid plan.
    const rows = (data ?? []) as Subscription[]
    const best =
      rows.find((s) => s.status === "active") ??
      rows.find((s) => s.status === "past_due") ??
      rows[0] ??
      null
    setSubscription(best)
    setLoading(false)
  }

  useEffect(() => { load() }, [user?.id])

  return { subscription, loading, refetch: load }
}
