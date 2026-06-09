import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

const PLAN_NAMES: Record<string, string> = {
  quick_sweep: "Quick Sweep",
  deep_clean: "Deep Clean",
  full_service: "Full Service",
}

function razorpayBasicAuth() {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID")!
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!
  return "Basic " + btoa(`${keyId}:${keySecret}`)
}

async function razorpayPost(path: string, body: unknown) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "POST",
    headers: { "Authorization": razorpayBasicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Razorpay API error: ${await res.text()}`)
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { plan, action } = await req.json()

  const supabase = getSupabaseAdmin()

  // Cancel flow: cancel the user's active Razorpay subscription at cycle end so
  // access (and already-issued credits) remain until the current period closes.
  // The subscription.cancelled webhook flips the DB status when it actually ends.
  if (action === "cancel") {
    const { data: activeSub } = await supabase
      .from("subscriptions")
      .select("gateway_subscription_id")
      .eq("client_id", user.id)
      .eq("gateway", "razorpay")
      .in("status", ["active", "past_due", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!activeSub?.gateway_subscription_id) return corsError("No active subscription to cancel")

    await razorpayPost(`/subscriptions/${activeSub.gateway_subscription_id}/cancel`, {
      cancel_at_cycle_end: 1,
    })

    return corsResponse({ cancelled: true })
  }

  const planName = PLAN_NAMES[plan]
  if (!planName) return corsError("Invalid plan")

  // Currency is derived server-side from the user's persisted region — never trusted from the client.
  const { data: dbUser } = await supabase
    .from("users")
    .select("currency")
    .eq("id", user.id)
    .single()
  const currency = dbUser?.currency === "USD" ? "USD" : "INR"

  // Amounts come from platform_config, never hardcoded (CLAUDE.md §6/§11).
  const cfgKey = currency === "USD" ? "pricing_usd" : "pricing_inr"
  const { data: cfgRow } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", cfgKey)
    .single()
  const plans = (cfgRow?.value ?? {}) as Record<string, { amount: number; credits: number }>
  const planConfig = plans[plan]
  if (!planConfig) return corsError("Pricing not configured for plan")

  // Create Razorpay plan (monthly recurring) in the resolved currency.
  // NOTE: USD requires International Payments enabled on the Razorpay account.
  const rzPlan = await razorpayPost("/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: `TheVideoJanitors ${planName}`,
      amount: planConfig.amount,
      currency,
      description: `${planConfig.credits} credits/month`,
    },
  })

  const rzSub = await razorpayPost("/subscriptions", {
    plan_id: rzPlan.id,
    customer_notify: 1,
    total_count: 120, // 10 years max, cancel anytime
    notes: { userId: user.id, plan },
  })

  await supabase.from("subscriptions").insert({
    client_id: user.id,
    gateway: "razorpay",
    gateway_subscription_id: rzSub.id,
    plan,
    credits_total: planConfig.credits,
    credits_remaining: 0, // set on subscription.charged webhook
    currency,
    amount_paid: planConfig.amount,
    renews_at: new Date(rzSub.current_end * 1000).toISOString(),
    status: "trialing",
  })

  return corsResponse({
    subscriptionId: rzSub.id,
    keyId: Deno.env.get("RAZORPAY_KEY_ID"),
    planName,
    amount: planConfig.amount,
    currency,
  })
})
