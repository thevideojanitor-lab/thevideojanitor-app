# Razorpay Test-Mode Checklist

## Setup
1. Razorpay Dashboard → toggle **Test Mode** (top bar).
2. Settings → API Keys → generate **Test** key pair (`rzp_test_...`).
3. Set Supabase edge-function secrets to the test values:
   - `RAZORPAY_KEY_ID=rzp_test_xxx`
   - `RAZORPAY_KEY_SECRET=xxx`
   - `RAZORPAY_WEBHOOK_SECRET=xxx` (from Dashboard → Webhooks → add endpoint
     pointing to the deployed `razorpay-webhook` function URL)
   Run: `npx supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=...`
4. Frontend uses the `keyId` returned by the edge functions — no separate frontend key needed.

## Test cards (Test Mode)
- Success: `4111 1111 1111 1111`, any future expiry, any CVV, any name.
- UPI success: `success@razorpay`.
- Failure simulation: use Razorpay's documented failing test card, or trigger a
  test webhook event (below).

## INR flows to verify (work today)
- [ ] Subscribe to each plan → `subscriptions` row with `currency="INR"`, then
      `subscription.charged` webhook flips `status="active"` and sets credits.
- [ ] Buy each credit pack → `payment.captured` adds credits to the active sub.
- [ ] Cancel subscription → `status="cancelled"`.
- [ ] Failed renewal: Dashboard → Webhooks → send test `subscription.halted` for the
      sub id → `status="past_due"`, notification inserted, re-subscribe button shows.

## USD flows (blocked until activation)
- USD orders/subscriptions are created in code but Razorpay rejects live USD charges
  until **International Payments** is activated on the account.
- After activation, repeat the INR checklist as a US-region user; confirm rows store
  `currency="USD"` and amounts come from `pricing_usd` / `credit_packs_usd`.

## Activation prerequisites (founder action)
- [ ] International Payments request submitted in Razorpay Dashboard.
- [ ] Compliance pages live: Terms, Privacy, Refund, **Delivery**, Cookie.
- [ ] Confirm with Razorpay support whether the account may create **USD recurring
      plans**, or only one-time USD Orders. If recurring USD is disallowed, switch the
      USD plan purchase to one-time Orders (functions are already currency-aware) and
      create an `active` subscription row with a manual `renews_at`.

## Deploy steps (run when ready — these push to live Supabase)
- `npx supabase functions deploy create-razorpay-subscription`
- `npx supabase functions deploy create-razorpay-order`
- `npx supabase functions deploy razorpay-webhook`
- Ensure the deleted Stripe functions are also removed remotely if previously deployed:
  `create-stripe-subscription`, `stripe-webhook`, `create-stripe-credit-pack`.
