import Stripe from "npm:stripe@14"
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

const PACK_CONFIG: Record<string, { amount: number; credits: number }> = {
  small: { amount: 3300, credits: 100 },
  medium: { amount: 7500, credits: 250 },
  large: { amount: 14000, credits: 500 },
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { pack } = await req.json()
  const packConfig = PACK_CONFIG[pack]
  if (!packConfig) return corsError("Invalid pack")

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" })
  const supabase = getSupabaseAdmin()

  // Get existing customer ID
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("gateway_customer_id")
    .eq("client_id", user.id)
    .eq("gateway", "stripe")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  let customerId = existingSub?.gateway_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } })
    customerId = customer.id
  }

  const origin = req.headers.get("origin") ?? "https://thevideojanitors.com"

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: packConfig.amount,
        product_data: { name: `${packConfig.credits} Credits — TheVideoJanitors` },
      },
      quantity: 1,
    }],
    success_url: `${origin}/dashboard/subscription?credits_added=${packConfig.credits}`,
    cancel_url: `${origin}/dashboard/subscription`,
    metadata: { userId: user.id, credits: String(packConfig.credits) },
  })

  return corsResponse({ url: session.url })
})
