import Stripe from "npm:stripe@14"
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

// Stripe Price IDs — set in Supabase Edge Function env vars
const PRICE_IDS: Record<string, Record<string, string>> = {
  quick_sweep: {
    monthly: Deno.env.get("STRIPE_PRICE_QS_MONTHLY") ?? "",
    annual: Deno.env.get("STRIPE_PRICE_QS_ANNUAL") ?? "",
  },
  deep_clean: {
    monthly: Deno.env.get("STRIPE_PRICE_DC_MONTHLY") ?? "",
    annual: Deno.env.get("STRIPE_PRICE_DC_ANNUAL") ?? "",
  },
  full_service: {
    monthly: Deno.env.get("STRIPE_PRICE_FS_MONTHLY") ?? "",
    annual: Deno.env.get("STRIPE_PRICE_FS_ANNUAL") ?? "",
  },
}

const PLAN_CREDITS: Record<string, number> = {
  quick_sweep: 350,
  deep_clean: 950,
  full_service: 2500,
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { plan, billingCycle = "monthly" } = await req.json()

  if (!PLAN_CREDITS[plan]) return corsError("Invalid plan")

  const priceId = PRICE_IDS[plan]?.[billingCycle]
  if (!priceId) return corsError("Price not configured for this plan/cycle")

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" })
  const supabase = getSupabaseAdmin()

  // Get or create Stripe customer
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

  // Cancel any existing active subscription
  const activeSubs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 })
  if (activeSubs.data.length > 0) {
    await stripe.subscriptions.cancel(activeSubs.data[0].id)
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  })

  const invoice = subscription.latest_invoice as Stripe.Invoice
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

  const credits = PLAN_CREDITS[plan]
  const amountPaid = typeof invoice.amount_due === "number" ? invoice.amount_due : 0

  // Insert subscription row
  await supabase.from("subscriptions").insert({
    client_id: user.id,
    gateway: "stripe",
    gateway_subscription_id: subscription.id,
    gateway_customer_id: customerId,
    plan,
    credits_total: credits,
    credits_remaining: 0, // set to full on invoice.paid webhook
    currency: "USD",
    amount_paid: amountPaid,
    renews_at: new Date(subscription.current_period_end * 1000).toISOString(),
    status: "trialing",
  })

  return corsResponse({
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
  })
})
