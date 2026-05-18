import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { payoutId } = await req.json()
  if (!payoutId) return corsError("payoutId required")

  const supabase = getSupabaseAdmin()
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")
  if (!stripeKey) return corsError("Stripe not configured", 500)

  // Load payout + editor's connected account
  const { data: payout } = await supabase
    .from("editor_payouts")
    .select("*")
    .eq("id", payoutId)
    .single()

  if (!payout) return corsError("Payout not found", 404)
  if (payout.status !== "pending") return corsError("Payout already processed")

  const { data: editorProfile } = await supabase
    .from("editor_profiles")
    .select("stripe_account_id")
    .eq("user_id", payout.editor_id)
    .single()

  const stripeAccountId = editorProfile?.stripe_account_id
  if (!stripeAccountId) return corsError("Editor has no connected Stripe account. Ask them to complete Connect onboarding.", 400)

  try {
    // Stripe Transfer to connected account
    const res = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(payout.amount),
        currency: "usd",
        destination: stripeAccountId,
        description: `TVJ payout — request ${payout.request_id}`,
        "metadata[payout_id]": payoutId,
        "metadata[editor_id]": payout.editor_id,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message ?? "Stripe transfer failed")
    }

    const transfer = await res.json()

    await supabase
      .from("editor_payouts")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payoutId)

    return corsResponse({ success: true, transferId: transfer.id })
  } catch (err) {
    await supabase
      .from("editor_payouts")
      .update({ status: "failed" })
      .eq("id", payoutId)

    return corsError(err instanceof Error ? err.message : "Transfer failed", 500)
  }
})
