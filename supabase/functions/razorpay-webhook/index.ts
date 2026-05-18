import { corsHeaders } from "../_shared/cors.ts"
import { getSupabaseAdmin } from "../_shared/supabase-admin.ts"

const PLAN_CREDITS: Record<string, number> = {
  quick_sweep: 350,
  deep_clean: 950,
  full_service: 2500,
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
        .select("plan, client_id, credits_total")
        .eq("gateway_subscription_id", sub.id)
        .single()

      if (!dbSub) break

      const credits = PLAN_CREDITS[dbSub.plan] ?? dbSub.credits_total
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

      await supabase.from("notifications").insert({
        user_id: dbSub.client_id,
        message: "Payment successful! Your credits have been refreshed.",
        type: "billing",
      })
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
