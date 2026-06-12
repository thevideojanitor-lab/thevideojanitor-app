import { corsHeaders } from "../_shared/cors.ts"
import { getSupabaseAdmin } from "../_shared/supabase-admin.ts"
import { sendEmail } from "../_shared/sendgrid.ts"
import { paymentConfirmedEmail, paymentFailedEmail } from "../_shared/email-templates.ts"

const PLAN_NAMES: Record<string, string> = {
  quick_sweep: "Quick Sweep",
  deep_clean: "Deep Clean",
  full_service: "Full Service",
}

// Credits per plan come from platform_config (rule: business numbers never in
// code). Falls back to the row's credits_total if config is missing.
async function planCredits(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  plan: string,
  currency: string,
  fallback: number,
): Promise<number> {
  const cfgKey = currency === "USD" ? "pricing_usd" : "pricing_inr"
  const { data } = await supabase.from("platform_config").select("value").eq("key", cfgKey).single()
  const plans = (data?.value ?? {}) as Record<string, { credits?: number }>
  return plans[plan]?.credits ?? fallback
}

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(body)

  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const sigBuffer = await crypto.subtle.sign("HMAC", key, msgData)
  const sigHex = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, "0")).join("")

  return sigHex === signature
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const body = await req.text()
  const signature = req.headers.get("x-razorpay-signature") ?? ""
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!

  const valid = await verifyWebhookSignature(body, signature, webhookSecret)
  if (!valid) {
    console.error("Razorpay webhook signature invalid")
    return new Response("Invalid signature", { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = getSupabaseAdmin()

  switch (event.event) {
    case "subscription.charged": {
      const sub = event.payload.subscription.entity
      const payment = event.payload.payment?.entity

      const { data: dbSub } = await supabase
        .from("subscriptions")
        .select("plan, client_id, credits_total, currency")
        .eq("gateway_subscription_id", sub.id)
        .single()

      if (!dbSub) break

      // Plan switch: the client paid for a new subscription, so cancel any
      // other still-active Razorpay subscription they hold — otherwise both
      // keep charging monthly.
      const { data: otherSubs } = await supabase
        .from("subscriptions")
        .select("id, gateway_subscription_id")
        .eq("client_id", dbSub.client_id)
        .eq("gateway", "razorpay")
        .in("status", ["active", "past_due"])
        .neq("gateway_subscription_id", sub.id)

      for (const old of otherSubs ?? []) {
        if (old.gateway_subscription_id) {
          const keyId = Deno.env.get("RAZORPAY_KEY_ID")!
          const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!
          const res = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${old.gateway_subscription_id}/cancel`,
            {
              method: "POST",
              headers: {
                "Authorization": "Basic " + btoa(`${keyId}:${keySecret}`),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cancel_at_cycle_end: 0 }),
            },
          )
          // Already-cancelled subs 400 here — fine, the DB update below settles it.
          if (!res.ok) console.error("cancel old sub failed:", old.gateway_subscription_id, res.status, await res.text())
        }
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", old.id)
      }

      const credits = await planCredits(supabase, dbSub.plan, dbSub.currency, dbSub.credits_total)
      const renewsAt = sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          credits_remaining: credits,
          credits_total: credits,
          amount_paid: payment?.amount ?? dbSub.credits_total,
          renews_at: renewsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("gateway_subscription_id", sub.id)

      // Notify client — in-app
      await supabase.from("notifications").insert({
        user_id: dbSub.client_id,
        message: "Payment successful! Your credits have been refreshed.",
        type: "billing",
      })

      // Notify client — email
      const { data: rzpAuth } = await supabase.auth.admin.getUserById(dbSub.client_id)
      if (rzpAuth?.user?.email) {
        const cur = dbSub.currency === "USD" ? "USD" : "INR"
        const locale = cur === "USD" ? "en-US" : "en-IN"
        const symbol = cur === "USD" ? "$" : "₹"
        const renewsAtFormatted = renewsAt
          ? new Date(renewsAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
          : "your next billing date"
        const { subject, html } = paymentConfirmedEmail({
          clientName: rzpAuth.user.email.split("@")[0],
          plan: PLAN_NAMES[dbSub.plan] ?? dbSub.plan,
          credits,
          amount: `${symbol}${((payment?.amount ?? 0) / 100).toLocaleString(locale)}`,
          currency: cur,
          renewsAt: renewsAtFormatted,
        })
        await sendEmail({ to: rzpAuth.user.email, subject, html })
      }
      break
    }

    case "subscription.cancelled": {
      const sub = event.payload.subscription.entity

      const { data: dbSub } = await supabase
        .from("subscriptions")
        .select("client_id")
        .eq("gateway_subscription_id", sub.id)
        .single()

      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("gateway_subscription_id", sub.id)

      if (dbSub) {
        await supabase.from("notifications").insert({
          user_id: dbSub.client_id,
          message: "Your subscription has been cancelled.",
          type: "billing",
        })
      }
      break
    }

    case "subscription.halted":
    case "subscription.pending": {
      // A renewal charge failed (pending = retrying, halted = retries exhausted).
      // International/foreign cards commonly fail here — mark past_due so the UI
      // blocks new requests and prompts re-subscribe.
      const sub = event.payload.subscription.entity

      const { data: dbSub } = await supabase
        .from("subscriptions")
        .select("client_id, plan, amount_paid, currency")
        .eq("gateway_subscription_id", sub.id)
        .single()

      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("gateway_subscription_id", sub.id)

      if (dbSub) {
        await supabase.from("notifications").insert({
          user_id: dbSub.client_id,
          message: "Payment failed — please re-subscribe to restore access.",
          type: "billing",
        })

        const { data: failAuth } = await supabase.auth.admin.getUserById(dbSub.client_id)
        if (failAuth?.user?.email) {
          const cur = dbSub.currency === "USD" ? "USD" : "INR"
          const locale = cur === "USD" ? "en-US" : "en-IN"
          const symbol = cur === "USD" ? "$" : "₹"
          const { subject, html } = paymentFailedEmail({
            clientName: failAuth.user.email.split("@")[0],
            plan: PLAN_NAMES[dbSub.plan] ?? dbSub.plan,
            amount: `${symbol}${((dbSub.amount_paid ?? 0) / 100).toLocaleString(locale)}`,
            currency: cur,
          })
          await sendEmail({ to: failAuth.user.email, subject, html })
        }
      }
      break
    }

    case "payment.captured": {
      // Credit pack one-time payment
      const payment = event.payload.payment.entity
      const notes = payment.notes ?? {}
      const userId = notes.userId
      const creditsToAdd = parseInt(notes.credits ?? "0", 10)

      if (!userId || !creditsToAdd) break

      const { data: dbSub } = await supabase
        .from("subscriptions")
        .select("id, credits_remaining")
        .eq("client_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (dbSub) {
        await supabase
          .from("subscriptions")
          .update({ credits_remaining: dbSub.credits_remaining + creditsToAdd })
          .eq("id", dbSub.id)
      }

      await supabase.from("notifications").insert({
        user_id: userId,
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
