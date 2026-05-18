import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { payoutId } = await req.json()
  if (!payoutId) return corsError("payoutId required")

  const supabase = getSupabaseAdmin()
  const rzpKey = Deno.env.get("RAZORPAY_KEY_ID")
  const rzpSecret = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!rzpKey || !rzpSecret) return corsError("Razorpay not configured", 500)

  const { data: payout } = await supabase
    .from("editor_payouts")
    .select("*")
    .eq("id", payoutId)
    .single()

  if (!payout) return corsError("Payout not found", 404)
  if (payout.status !== "pending") return corsError("Payout already processed")

  const { data: editorProfile } = await supabase
    .from("editor_profiles")
    .select("bank_account_number, bank_ifsc, bank_account_name, upi_id, bank_details_verified")
    .eq("user_id", payout.editor_id)
    .single()

  if (!editorProfile?.bank_details_verified) {
    return corsError("Editor bank details not verified", 400)
  }

  try {
    const auth = btoa(`${rzpKey}:${rzpSecret}`)

    // Determine payout mode — prefer UPI if available
    const mode = editorProfile.upi_id ? "UPI" : "NEFT"
    const fund_account = editorProfile.upi_id
      ? { account_type: "vpa", vpa: { address: editorProfile.upi_id } }
      : {
          account_type: "bank_account",
          bank_account: {
            name: editorProfile.bank_account_name,
            ifsc: editorProfile.bank_ifsc,
            account_number: editorProfile.bank_account_number,
          },
        }

    // Create fund account
    const faRes = await fetch("https://api.razorpay.com/v1/fund_accounts", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contact_id: payout.editor_id,
        ...fund_account,
      }),
    })

    if (!faRes.ok) {
      const err = await faRes.json()
      throw new Error(err.error?.description ?? "Fund account creation failed")
    }

    const fa = await faRes.json()

    // Create payout
    const payoutRes = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "X-Payout-Idempotency": payoutId,
      },
      body: JSON.stringify({
        account_number: Deno.env.get("RAZORPAY_ACCOUNT_NUMBER"),
        fund_account_id: fa.id,
        amount: payout.amount,
        currency: "INR",
        mode,
        purpose: "payout",
        narration: `TVJ payout ${payout.request_id?.slice(0, 8) ?? ""}`,
        notes: { payout_id: payoutId, editor_id: payout.editor_id },
      }),
    })

    if (!payoutRes.ok) {
      const err = await payoutRes.json()
      throw new Error(err.error?.description ?? "Razorpay payout failed")
    }

    const rzpPayout = await payoutRes.json()

    await supabase
      .from("editor_payouts")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payoutId)

    return corsResponse({ success: true, payoutId: rzpPayout.id, mode })
  } catch (err) {
    await supabase
      .from("editor_payouts")
      .update({ status: "failed" })
      .eq("id", payoutId)

    return corsError(err instanceof Error ? err.message : "Payout failed", 500)
  }
})
