import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

const PLAN_CONFIG: Record<string, { amount: number; credits: number; name: string }> = {
  quick_sweep: { amount: 249900, credits: 350, name: "Quick Sweep" },
  deep_clean: { amount: 599900, credits: 950, name: "Deep Clean" },
  full_service: { amount: 1399900, credits: 2500, name: "Full Service" },
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

  const { plan } = await req.json()
  const planConfig = PLAN_CONFIG[plan]
  if (!planConfig) return corsError("Invalid plan")

  const supabase = getSupabaseAdmin()

  // Create Razorpay plan (monthly recurring)
  const rzPlan = await razorpayPost("/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: `TheVideoJanitors ${planConfig.name}`,
      amount: planConfig.amount,
      currency: "INR",
      description: `${planConfig.credits} credits/month`,
    },
  })

  // Create Razorpay subscription
  const rzSub = await razorpayPost("/subscriptions", {
    plan_id: rzPlan.id,
    customer_notify: 1,
    total_count: 120, // 10 years max, cancel anytime
    notes: { userId: user.id, plan },
  })

  // Insert pending subscription row
  await supabase.from("subscriptions").insert({
    client_id: user.id,
    gateway: "razorpay",
    gateway_subscription_id: rzSub.id,
    plan,
    credits_total: planConfig.credits,
    credits_remaining: 0, // set on subscription.charged webhook
    currency: "INR",
    amount_paid: planConfig.amount,
    renews_at: new Date(rzSub.current_end * 1000).toISOString(),
    status: "trialing",
  })

  return corsResponse({
    subscriptionId: rzSub.id,
    keyId: Deno.env.get("RAZORPAY_KEY_ID"),
    planName: planConfig.name,
    amount: planConfig.amount,
  })
})
