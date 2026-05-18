import Stripe from "npm:stripe@14"
import { corsHeaders } from "../_shared/cors.ts"
import { getSupabaseAdmin } from "../_shared/supabase-admin.ts"

const PLAN_CREDITS: Record<string, number> = {
  quick_sweep: 350,
  deep_clean: 950,
  full_service: 2500,
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" })
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!

  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new Response("Webhook Error", { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice & {
        parent?: { subscription_details?: { subscription?: string }; type?: string }
      }
      // API v2026-04-22+: subscription moved to parent.subscription_details.subscription
      const stripeSubId =
        (invoice.subscription as string | null) ??
        invoice.parent?.subscription_details?.subscription ??
        null
      if (!stripeSubId) break

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan, credits_total, client_id")
        .eq("gateway_subscription_id", stripeSubId)
        .single()

      if (!sub) break

      const credits = PLAN_CREDITS[sub.plan] ?? sub.credits_total

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          credits_remaining: credits,
          credits_total: credits,
          amount_paid: invoice.amount_paid,
          updated_at: new Date().toISOString(),
        })
        .eq("gateway_subscription_id", stripeSubId)

      // Notify client
      await supabase.from("notifications").insert({
        user_id: sub.client_id,
        message: "Payment successful! Your credits have been refreshed.",
        type: "billing",
      })
      break
    }

    case "customer.subscription.updated": {
      const stripeSub = event.data.object as Stripe.Subscription

      let status: string = stripeSub.status
      if (status === "active") status = "active"
      else if (status === "past_due") status = "past_due"
      else if (status === "unpaid") status = "past_due"
      else if (status === "canceled") status = "cancelled"

      await supabase
        .from("subscriptions")
        .update({
          status,
          renews_at: new Date(stripeSub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("gateway_subscription_id", stripeSub.id)
      break
    }

    case "customer.subscription.deleted": {
      const stripeSub = event.data.object as Stripe.Subscription

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("client_id")
        .eq("gateway_subscription_id", stripeSub.id)
        .single()

      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("gateway_subscription_id", stripeSub.id)

      if (sub) {
        await supabase.from("notifications").insert({
          user_id: sub.client_id,
          message: "Your subscription has been cancelled.",
          type: "billing",
        })
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const stripeSubId = invoice.subscription as string
      if (!stripeSubId) break

      const attemptCount = invoice.attempt_count ?? 0

      if (attemptCount >= 3) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("gateway_subscription_id", stripeSubId)

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("client_id")
          .eq("gateway_subscription_id", stripeSubId)
          .single()

        if (sub) {
          await supabase.from("notifications").insert({
            user_id: sub.client_id,
            message: "Payment failed 3 times. Please update your payment method to continue.",
            type: "billing_error",
          })
        }
      }
      break
    }

    // Credit pack: one-time payment succeeded
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const clientId = session.metadata?.userId
      const creditsToAdd = parseInt(session.metadata?.credits ?? "0", 10)

      if (!clientId || !creditsToAdd) break

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, credits_remaining")
        .eq("client_id", clientId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (sub) {
        await supabase
          .from("subscriptions")
          .update({ credits_remaining: sub.credits_remaining + creditsToAdd })
          .eq("id", sub.id)
      }

      await supabase.from("notifications").insert({
        user_id: clientId,
        message: `${creditsToAdd} credits added to your account!`,
        type: "credits",
      })
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  })
})
