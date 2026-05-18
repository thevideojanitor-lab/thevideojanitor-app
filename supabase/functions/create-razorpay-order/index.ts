import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getUserFromAuth } from "../_shared/supabase-admin.ts"

const PACK_CONFIG: Record<string, { amount: number; credits: number }> = {
  small: { amount: 82500, credits: 100 },
  medium: { amount: 187500, credits: 250 },
  large: { amount: 349900, credits: 500 },
}

function razorpayBasicAuth() {
  return "Basic " + btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { pack } = await req.json()
  const packConfig = PACK_CONFIG[pack]
  if (!packConfig) return corsError("Invalid pack")

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Authorization": razorpayBasicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: packConfig.amount,
      currency: "INR",
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
  })
})
