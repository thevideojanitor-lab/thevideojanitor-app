# Razorpay International (USD) — Replace Stripe on the Client Side

**Date:** 2026-06-09
**Status:** Design approved, pending spec review
**Scope:** Client-facing payments only (subscriptions + credit packs). Editor payouts are explicitly out of scope.

---

## 1. Problem & motivation

The founder operates an Indian entity. Stripe is effectively closed to most Indian
businesses, so the existing US→Stripe / IN→Razorpay split is not operable: the USD
(Stripe) half cannot go live. We replace Stripe on the client side with **Razorpay
International Payments**, so a single Razorpay account collects both INR (domestic) and
USD (international) and settles to the Indian current account in INR.

### Hard external constraint
Razorpay International Payments is **not yet activated** on the account (request pending /
not submitted). No code can make USD transact until Razorpay approves the account
(~5 working days), which requires compliance pages on the site and, ideally, proof of
international sales. Therefore:

- **INR** must remain fully functional and testable throughout.
- **USD** code is built and wired but only goes live after activation.

### Account-specific unknown (must be confirmed with Razorpay, not assumed in code)
Whether the account may create a **USD-denominated recurring plan**, or only one-time
international **Orders**. The design defaults USD to recurring (mirrors INR) and documents
a one-time fallback if recurring USD is disallowed. The currency-aware functions support
both either way.

---

## 2. Approach (chosen)

**One subscription code path, parameterized by currency.** Route every client through
Razorpay. Gateway is always `razorpay`; currency remains region-derived (`IN`→INR,
`US`→USD). Request gating, credit deduction, renewals, and the `subscriptions` table are
already currency-agnostic, so USD clients get a Razorpay subscription exactly like INR
clients — only denominated in USD.

The single real divergence — foreign cards failing auto-renew (the normal case
internationally) — is handled by adding the missing failed-renewal webhook handler, which
also hardens INR.

### Alternatives considered
- **One-time Orders for USD (no recurring).** Proven path today, but the platform model is
  subscription-gated (request submission and pack top-ups both require an `active`
  subscription). A one-time-only USD client would need an invented "manual subscription"
  record. More divergence, more code. Kept only as the documented fallback if Razorpay
  disallows recurring USD.
- **Keep Stripe as USD fallback.** Rejected — Stripe is the thing that doesn't work for an
  Indian entity; keeping it defeats the purpose and doubles maintenance.

---

## 3. Phasing

**Phase 1 — Code (shippable now; INR live, USD wired & ready):**
all of Section 4 + Section 5 + Section 6 compliance pages.

**Phase 2 — Activate USD (no/low code):**
founder submits Razorpay international activation; confirms recurring-USD support; flip USD
on. If recurring USD is disallowed, switch USD plan purchase to one-time Orders (functions
already currency-aware) and create an `active` subscription row with a manual `renews_at`.

---

## 4. Code changes

### 4.1 Region / gateway mapping — `src/lib/region.ts`
- `regionToGateway()` always returns `"razorpay"` (remove the Stripe branch).
- Currency mapping unchanged (`IN`→INR, else→USD).
- `DEFAULT` gateway becomes `"razorpay"`.

### 4.2 `supabase/functions/create-razorpay-subscription/index.ts`
- Accept the client's currency (derive from the user's `region`/`currency` in `users`,
  not from request body, to avoid tampering).
- Replace the hardcoded INR `PLAN_CONFIG` with a read from `platform_config`
  (`pricing_inr` / `pricing_usd`, both already seeded). Amount + credits come from config.
- Create the Razorpay plan in the resolved currency (`INR` or `USD`).
- Insert the `subscriptions` row with the resolved `currency` and `amount_paid`.

### 4.3 `supabase/functions/create-razorpay-order/index.ts`
- Replace hardcoded `PACK_CONFIG` with `platform_config` read
  (`credit_packs_inr` / `credit_packs_usd`) — fixes a CLAUDE.md "never hardcode prices"
  violation.
- Set `currency` on the Razorpay order from the user's region.

### 4.4 `supabase/functions/razorpay-webhook/index.ts`
- **Add handlers for `subscription.halted` and `subscription.pending`** → set the sub
  `status = "past_due"`, insert a billing notification, send a "payment failed / update or
  re-subscribe" email. This gap currently lets failed renewals go silent; it is required
  for international cards and also hardens INR.
- Make amount/currency formatting **currency-aware**: read the stored `currency` on the
  subscription row rather than hardcoding `₹` / `en-IN`. Format USD as `$` / `en-US`.
- Leave `subscription.charged`, `subscription.cancelled`, `payment.captured` logic intact
  apart from currency formatting.

### 4.5 `src/pages/dashboard/SubscriptionPage.tsx`
- Remove all Stripe code: `loadStripe`, `stripePromise`, `Elements`, `PaymentElement`,
  `StripeModal`, `StripePaymentForm`, and the `region === "US"` branch in
  `handleSelectPlan` and `handleBuyCreditPack`.
- Both regions use the existing Razorpay checkout path (subscription + order).
- `track(...)` calls use the actual `currency`/`region` (not hardcoded `"USD"`/`"INR"`).
- Replace the Stripe "Update Card" / "Manage billing" links (no Razorpay hosted portal for
  international cards) with a **re-subscribe** action when `status === "past_due"`.
- **Remove the annual billing toggle for v1** — it currently displays 0.8× price while the
  Razorpay subscription is always `period:"monthly"`, which is misleading. Re-introduce
  only if/when yearly Razorpay plans are built.

### 4.6 Cleanup
- Delete client-side Stripe edge functions: `create-stripe-subscription`, `stripe-webhook`,
  `create-stripe-credit-pack`.
- Remove deps: `@stripe/stripe-js`, `@stripe/react-stripe-js`.
- Remove `VITE_STRIPE_PUBLISHABLE_KEY` from `.env.example` and any references.
- Do **not** touch `trigger-stripe-payout` / editor payout code (see Section 7).

---

## 5. Data / config notes
- `platform_config` already contains `pricing_usd`, `pricing_inr`, `credit_packs_usd`,
  `credit_packs_inr` — no migration needed for amounts.
- `subscriptions.currency` already exists and is used; ensure USD rows store `"USD"`.
- No schema migration is required for this feature.

---

## 6. Compliance pages (build as part of Phase 1)
Razorpay international activation requires these. Privacy + Cookie pages already exist.
Build dark-mode, on-brand pages (match existing legal pages under `src/pages/legal/`) and
route them; link from the footer:
- **Refund / Cancellation Policy** — credit-at-submission rule, no refund after spend,
  subscription cancellation at period end.
- **Shipping / Delivery Policy** — digital delivery (edited videos), 48h turnaround,
  revision rounds; clarifies "no physical shipping."
- **Terms & Conditions** — service terms, dispute resolution, governing law (India).

---

## 7. Out of scope / known follow-ups
- **Editor payouts** (Stripe Connect / `trigger-stripe-payout`) untouched. Flag: Stripe
  Connect is likely also non-viable for an Indian entity; migrate to Razorpay Payouts in a
  separate effort.
- No light mode, no additional gateways, no annual plans, no schema changes.

---

## 8. Success criteria
- INR client: subscribe, get credits on `subscription.charged`, buy a pack, see credits
  added, cancel — all working end-to-end (testable today).
- Stripe fully removed from the client bundle; build passes; no `@stripe/*` imports remain.
- USD code paths exercise correctly in a dry run (function returns Razorpay USD
  order/subscription objects) pending account activation.
- Failed-renewal webhook (`subscription.halted`) sets `past_due` and surfaces a
  re-subscribe action in the UI.
- Refund, Shipping, and T&C pages live and linked.
