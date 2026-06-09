import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

function razorpayBasicAuth() {
  return "Basic " + btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { pack } = await req.json()

  const supabase = getSupabaseAdmin()

  const { data: dbUser } = await supabase
    .from("users")
    .select("currency")
    .eq("id", user.id)
    .single()
  const currency = dbUser?.currency === "USD" ? "USD" : "INR"

  const cfgKey = currency === "USD" ? "credit_packs_usd" : "credit_packs_inr"
  const { data: cfgRow } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", cfgKey)
    .single()
  const packs = (cfgRow?.value ?? {}) as Record<string, { amount: number; credits: number }>
  const packConfig = packs[pack]
  if (!packConfig) return corsError("Invalid pack")

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Authorization": razorpayBasicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: packConfig.amount,
      currency,
      notes: { userId: user.id, credits: String(packConfig.credits) },
    }),
  })

  if (!res.ok) return corsError("Failed to create Razorpay order", 500)

  const order = await res.json()

  return corsResponse({
    orderId: order.id,
    keyId: Deno.env.get("RAZORPAY_KEY_ID"),
    amount: packConfig.amount,
    credits: packConfig.credits,
    currency,
  })
})
