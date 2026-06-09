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
      .limit(1)
      .single()
    setSubscription(data as Subscription | null)
    setLoading(false)
  }

  useEffect(() => { load() }, [user?.id])

  return { subscription, loading, refetch: load }
}
