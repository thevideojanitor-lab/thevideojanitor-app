# Razorpay International (USD) — Replace Client Stripe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route all client payments (subscriptions + credit packs) through Razorpay, currency-aware (INR domestic, USD international), removing client-side Stripe entirely. INR works end-to-end today; USD code is built and ready for the moment Razorpay International activation lands.

**Architecture:** One subscription code path parameterized by currency. Gateway is always `razorpay`; currency is derived server-side from the authenticated user's `users.region`/`users.currency` (never trusted from the request body). Amounts come from `platform_config` (`pricing_*`, `credit_packs_*`), never hardcoded. A new failed-renewal webhook handler (`subscription.halted`/`subscription.pending`) sets `past_due` — required for foreign cards, hardens INR too.

**Tech Stack:** React 18 + TypeScript + Vite, Supabase Edge Functions (Deno), Razorpay (Checkout + Subscriptions + Orders APIs), Tailwind, motion/react, Zustand.

**Testing note:** This codebase has no unit-test harness for Deno edge functions or React pages; existing practice verifies via `npx tsc --noEmit`, `npm run build`, and manual runs in Razorpay **Test Mode** (test keys + test cards). This plan follows that practice: each task's verification is a typecheck/build plus, where relevant, a manual Razorpay test-mode check. Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

**Branch:** `feat/razorpay-usd-international` (already created; spec committed there).

---

## File map

| File | Change | Responsibility |
|---|---|---|
| `src/lib/region.ts` | Modify | Gateway always `razorpay`; currency stays region-based |
| `supabase/functions/create-razorpay-subscription/index.ts` | Modify | Currency-aware plan creation from `platform_config` |
| `supabase/functions/create-razorpay-order/index.ts` | Modify | Currency-aware order from `platform_config` |
| `supabase/functions/razorpay-webhook/index.ts` | Modify | Currency-aware formatting + `subscription.halted`/`pending` handler |
| `src/pages/dashboard/SubscriptionPage.tsx` | Modify | Remove Stripe; single Razorpay path; drop annual toggle; re-subscribe on past_due |
| `supabase/functions/create-stripe-subscription/` | Delete | Stripe removal |
| `supabase/functions/stripe-webhook/` | Delete | Stripe removal |
| `supabase/functions/create-stripe-credit-pack/` | Delete | Stripe removal |
| `package.json` | Modify | Remove `@stripe/*` deps |
| `.env.example` | Modify | Remove `VITE_STRIPE_PUBLISHABLE_KEY` |
| `src/pages/legal/PrivacyPage.tsx` | Modify | Swap Stripe → Razorpay references |
| `src/pages/legal/ShippingPage.tsx` | Create | Digital delivery policy (Razorpay activation requirement) |
| `src/App.tsx` | Modify | Route `/legal/shipping` |
| `src/components/Footer.tsx` | Modify | Footer link to Shipping policy |
| `docs/RAZORPAY_TESTING.md` | Create | Test-mode checklist (keys, cards, failed-renewal sim) |

**Out of scope (do not touch):** `trigger-stripe-payout`, `trigger-razorpay-payout`, `EditorPayouts*`, any editor payout code. No DB migration (all columns/config already exist).

---

## Task 1: Gateway mapping always Razorpay

**Files:**
- Modify: `src/lib/region.ts:11-19`

- [ ] **Step 1: Change `regionToGateway` and `DEFAULT` to always use Razorpay**

Replace lines 11-19 (the `regionToGateway` function through the `DEFAULT` const) with:

```typescript
function regionToGateway(_region: Region): Gateway {
  // Single gateway: Razorpay handles both INR (domestic) and USD (international).
  return "razorpay"
}

function currencyForRegion(region: Region): Currency {
  return region === "IN" ? "INR" : "USD"
}

const DEFAULT: RegionConfig = { region: "US", currency: "USD", gateway: "razorpay" }
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/region.ts
git commit -m "feat(payments): route all regions through Razorpay gateway"
```

---

## Task 2: Currency-aware subscription creation

**Files:**
- Modify: `supabase/functions/create-razorpay-subscription/index.ts`

- [ ] **Step 1: Replace the whole file with currency-aware logic**

The current file hardcodes INR amounts in `PLAN_CONFIG`. Replace the entire file with this — it derives currency from the authenticated user's `users` row and pulls amounts from `platform_config`:

```typescript
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

const PLAN_NAMES: Record<string, string> = {
  quick_sweep: "Quick Sweep",
  deep_clean: "Deep Clean",
  full_service: "Full Service",
}

function razorpayBasicAuth() {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID")!
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!
  return "Basic " + btoa(`${keyId}:${keySecret}`)
}

async function razorpayPost(path: string, body: unknown) {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: "POST",
    headers: { "Authorization": razorpayBasicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Razorpay API error: ${await res.text()}`)
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { plan } = await req.json()
  const planName = PLAN_NAMES[plan]
  if (!planName) return corsError("Invalid plan")

  const supabase = getSupabaseAdmin()

  // Currency is derived server-side from the user's persisted region — never trusted from the client.
  const { data: dbUser } = await supabase
    .from("users")
    .select("currency")
    .eq("id", user.id)
    .single()
  const currency = dbUser?.currency === "USD" ? "USD" : "INR"

  // Amounts come from platform_config, never hardcoded (CLAUDE.md §6/§11).
  const cfgKey = currency === "USD" ? "pricing_usd" : "pricing_inr"
  const { data: cfgRow } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", cfgKey)
    .single()
  const plans = (cfgRow?.value ?? {}) as Record<string, { amount: number; credits: number }>
  const planConfig = plans[plan]
  if (!planConfig) return corsError("Pricing not configured for plan")

  // Create Razorpay plan (monthly recurring) in the resolved currency.
  // NOTE: USD requires International Payments enabled on the Razorpay account.
  const rzPlan = await razorpayPost("/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: `TheVideoJanitors ${planName}`,
      amount: planConfig.amount,
      currency,
      description: `${planConfig.credits} credits/month`,
    },
  })

  const rzSub = await razorpayPost("/subscriptions", {
    plan_id: rzPlan.id,
    customer_notify: 1,
    total_count: 120, // 10 years max, cancel anytime
    notes: { userId: user.id, plan },
  })

  await supabase.from("subscriptions").insert({
    client_id: user.id,
    gateway: "razorpay",
    gateway_subscription_id: rzSub.id,
    plan,
    credits_total: planConfig.credits,
    credits_remaining: 0, // set on subscription.charged webhook
    currency,
    amount_paid: planConfig.amount,
    renews_at: new Date(rzSub.current_end * 1000).toISOString(),
    status: "trialing",
  })

  return corsResponse({
    subscriptionId: rzSub.id,
    keyId: Deno.env.get("RAZORPAY_KEY_ID"),
    planName,
    amount: planConfig.amount,
    currency,
  })
})
```

- [ ] **Step 2: Deploy the function**

Run: `npx supabase functions deploy create-razorpay-subscription`
Expected: "Deployed Function create-razorpay-subscription".

- [ ] **Step 3: Manual test-mode check (INR)**

With test keys set, from the running app (Task 5 done, or via dashboard) subscribe to Quick Sweep as an IN user. Confirm in Supabase a `subscriptions` row inserts with `currency = "INR"`, `amount_paid = 249900`, `status = "trialing"`.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/create-razorpay-subscription/index.ts
git commit -m "feat(payments): currency-aware Razorpay subscription from platform_config"
```

---

## Task 3: Currency-aware credit-pack order

**Files:**
- Modify: `supabase/functions/create-razorpay-order/index.ts`

- [ ] **Step 1: Replace the whole file**

Removes the hardcoded `PACK_CONFIG` (CLAUDE.md violation) and reads from `platform_config`:

```typescript
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

function razorpayBasicAuth() {
  return "Basic " + btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { pack } = await req.json()

  const supabase = getSupabaseAdmin()

  const { data: dbUser } = await supabase
    .from("users")
    .select("currency")
    .eq("id", user.id)
    .single()
  const currency = dbUser?.currency === "USD" ? "USD" : "INR"

  const cfgKey = currency === "USD" ? "credit_packs_usd" : "credit_packs_inr"
  const { data: cfgRow } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", cfgKey)
    .single()
  const packs = (cfgRow?.value ?? {}) as Record<string, { amount: number; credits: number }>
  const packConfig = packs[pack]
  if (!packConfig) return corsError("Invalid pack")

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Authorization": razorpayBasicAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: packConfig.amount,
      currency,
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
    currency,
  })
})
```

- [ ] **Step 2: Deploy**

Run: `npx supabase functions deploy create-razorpay-order`
Expected: "Deployed Function create-razorpay-order".

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/create-razorpay-order/index.ts
git commit -m "feat(payments): currency-aware credit-pack order from platform_config"
```

---

## Task 4: Webhook — currency-aware + failed-renewal handler

**Files:**
- Modify: `supabase/functions/razorpay-webhook/index.ts`

- [ ] **Step 1: Make `subscription.charged` currency-aware**

In the `subscription.charged` case, the `.select(...)` currently fetches `plan, client_id, credits_total`. Change it to also fetch `currency`:

```typescript
      const { data: dbSub } = await supabase
        .from("subscriptions")
        .select("plan, client_id, credits_total, currency")
        .eq("gateway_subscription_id", sub.id)
        .single()
```

Then replace the email block (the `if (rzpAuth?.user?.email) { ... }` body) so amount/locale follow the stored currency instead of hardcoded `₹`/`en-IN`:

```typescript
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
```

- [ ] **Step 2: Add the failed-renewal handler**

Add this import at the top, alongside the existing `paymentConfirmedEmail` import:

```typescript
import { paymentConfirmedEmail, paymentFailedEmail } from "../_shared/email-templates.ts"
```

(The current import line is `import { paymentConfirmedEmail } from "../_shared/email-templates.ts"` — replace it with the line above.)

Then add a new case to the `switch (event.event)` block, after the `subscription.cancelled` case and before `payment.captured`:

```typescript
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
```

- [ ] **Step 3: Deploy**

Run: `npx supabase functions deploy razorpay-webhook`
Expected: "Deployed Function razorpay-webhook".

- [ ] **Step 4: Manual test-mode check (failed renewal)**

In the Razorpay dashboard (Test Mode) → Webhooks, send a test `subscription.halted` event for a test subscription id, OR use a failing test card on a subscription. Confirm the `subscriptions` row flips to `status = "past_due"` and a `notifications` row is inserted.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/razorpay-webhook/index.ts
git commit -m "feat(payments): currency-aware webhook emails + failed-renewal handler"
```

---

## Task 5: SubscriptionPage — remove Stripe, single Razorpay path

**Files:**
- Modify: `src/pages/dashboard/SubscriptionPage.tsx`

- [ ] **Step 1: Remove Stripe imports and the `stripePromise` const**

Delete these lines near the top of the file:

```typescript
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
```

and delete:

```typescript
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "")
```

- [ ] **Step 2: Delete the `StripePaymentForm` and `StripeModal` components**

Delete the entire `StripePaymentForm` function (the `// ── Stripe Payment Form ──` section) and the entire `StripeModal` function (the `// ── Stripe Subscription Modal ──` section). Leave the `loadRazorpayScript` helper and `CancelModal` intact.

- [ ] **Step 3: Simplify state — remove Stripe modal and billing cycle**

In `SubscriptionPage`, change the state block. Replace:

```typescript
  const [billing, setBilling] = useState<BillingCycle>("monthly")
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)
  const [showModal, setShowModal] = useState<"stripe" | "cancel" | null>(null)
```

with:

```typescript
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)
  const [showModal, setShowModal] = useState<"cancel" | null>(null)
```

(`selectedPlan` is retained only for the cancel flow context; keep it.)

- [ ] **Step 4: Simplify `getPrice` (no annual)**

Replace the `getPrice` callback with a monthly-only version:

```typescript
  const getPrice = useCallback((key: PlanKey) => {
    if (!config) return null
    const raw = (config.plans as Record<string, { amount: number }>)[key]?.amount ?? 0
    return raw / 100
  }, [config])
```

Remove `BillingCycle` from the `getPrice` dependency usage (the `billing` variable no longer exists).

- [ ] **Step 5: Rewrite `handleSelectPlan` to Razorpay-only**

Replace the entire `handleSelectPlan` function with:

```typescript
  const handleSelectPlan = async (key: PlanKey) => {
    setSelectedPlan(key)
    setLoadingRzPlan(key)
    const loaded = await loadRazorpayScript()
    if (!loaded) { setLoadingRzPlan(null); return }

    const { data, error } = await supabase.functions.invoke("create-razorpay-subscription", { body: { plan: key } })
    if (error || !data) { setLoadingRzPlan(null); return }

    // @ts-expect-error — Razorpay loaded dynamically
    const rzp = new window.Razorpay({
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "TheVideoJanitors",
      description: `${data.planName} — monthly billing`,
      handler: () => {
        track("subscription_started", { plan: key, currency, region, gateway: "razorpay" })
        setShowSuccess(true)
        refetch()
        if (user?.id) refreshCredits(user.id)
      },
    })
    rzp.open()
    setLoadingRzPlan(null)
  }
```

- [ ] **Step 6: Rewrite `handleBuyCreditPack` to Razorpay-only**

Replace the entire `handleBuyCreditPack` function with:

```typescript
  const handleBuyCreditPack = async (packKey: string, credits: number) => {
    setLoadingPack(packKey)
    const loaded = await loadRazorpayScript()
    if (!loaded) { setLoadingPack(null); return }
    const { data } = await supabase.functions.invoke("create-razorpay-order", { body: { pack: packKey } })
    if (!data) { setLoadingPack(null); return }

    // @ts-expect-error — Razorpay loaded dynamically
    const rzp = new window.Razorpay({
      key: data.keyId,
      order_id: data.orderId,
      name: "TheVideoJanitors",
      description: `${credits} Credits`,
      handler: () => {
        track("credits_recharged", { pack_size: packKey, currency, region })
        if (user?.id) refreshCredits(user.id)
      },
    })
    rzp.open()
    setLoadingPack(null)
  }
```

- [ ] **Step 7: Remove the annual billing toggle UI**

Delete the entire "Billing toggle" block — the `<div className="flex items-center gap-3 mb-8">` containing the monthly/annual buttons (the `{(["monthly", "annual"] as BillingCycle[]).map(...)}` block) through its closing `</div>`. Also remove the `BillingCycle` type alias at the top if it is now unused.

In the plan-card price area, remove the annual-only badge — delete:

```typescript
                  {billing === "annual" && !pricingLoading && (
                    <span className="text-xs text-green-400 font-medium ml-1">Save 20%</span>
                  )}
```

And the `<AnimatePresence mode="wait">` price uses `key={`${key}-${billing}`}` — change that key to `key={key}`.

- [ ] **Step 8: Replace past-due "Update Card" with re-subscribe; remove Stripe billing links**

In the past-due banner, replace the Stripe conditional block:

```typescript
            {subscription?.gateway === "stripe" ? (
              <a href="https://billing.stripe.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors">
                Update Card <ExternalLink size={12} />
              </a>
            ) : null}
```

with a re-subscribe button (re-subscribing to the current plan creates a fresh Razorpay subscription):

```typescript
            {subscription?.plan ? (
              <button
                onClick={() => handleSelectPlan(subscription.plan as PlanKey)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors">
                Re-subscribe
              </button>
            ) : null}
```

In the plan card footer, delete the Stripe "Manage billing" block entirely:

```typescript
              {isCurrent && subscription?.status === "active" && subscription.gateway === "stripe" && (
                <div className="mt-5 pt-4 border-t border-border">
                  <a href="https://billing.stripe.com" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Manage billing <ExternalLink size={11} />
                  </a>
                </div>
              )}
```

Then simplify the remaining razorpay cancel block condition from `subscription.gateway === "razorpay"` to just the active check (gateway is always razorpay now):

```typescript
              {isCurrent && subscription?.status === "active" && (
                <div className="mt-5 pt-4 border-t border-border">
                  <button
                    onClick={() => setShowModal("cancel")}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    Cancel subscription
                  </button>
                </div>
              )}
```

- [ ] **Step 9: Remove the Stripe modal from the overlay**

In the `{/* Payment modal overlay */}` `AnimatePresence`, delete the `{(showModal === "stripe" && selectedPlan) && (...)}` block (the one rendering `<StripeModal .../>`). Keep the `{showModal === "cancel" && ...}` block. In `CancelModal`'s `handleCancel`, the `fnName` ternary referencing stripe can be simplified to always `"create-razorpay-subscription"`:

```typescript
    const fnName = "create-razorpay-subscription"
```

(Remove the now-unused `gateway` prop usage if it triggers a lint error; leaving the prop is harmless but unused — delete the `gateway` prop from `CancelModal`'s signature and its call site if tsc complains.)

- [ ] **Step 10: Remove the now-unused `ExternalLink` import if unused**

If `ExternalLink` is no longer referenced after Step 8, remove it from the `lucide-react` import. Verify with the typecheck in Step 11.

- [ ] **Step 11: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS, no `@stripe/*` resolution and no unused-variable errors.

- [ ] **Step 12: Commit**

```bash
git add src/pages/dashboard/SubscriptionPage.tsx
git commit -m "feat(payments): single Razorpay checkout path, drop Stripe + annual toggle"
```

---

## Task 6: Delete Stripe functions, deps, env

**Files:**
- Delete: `supabase/functions/create-stripe-subscription/`, `supabase/functions/stripe-webhook/`, `supabase/functions/create-stripe-credit-pack/`
- Modify: `package.json`, `.env.example`

- [ ] **Step 1: Delete the client-side Stripe edge functions**

```bash
rm -rf supabase/functions/create-stripe-subscription supabase/functions/stripe-webhook supabase/functions/create-stripe-credit-pack
```

(PowerShell: `Remove-Item -Recurse -Force supabase/functions/create-stripe-subscription, supabase/functions/stripe-webhook, supabase/functions/create-stripe-credit-pack`)

- [ ] **Step 2: Remove Stripe npm deps**

Run: `npm uninstall @stripe/stripe-js @stripe/react-stripe-js`
Expected: packages removed from `package.json` + lockfile.

- [ ] **Step 3: Remove the Stripe publishable key from `.env.example`**

Delete the `VITE_STRIPE_PUBLISHABLE_KEY=...` line from `.env.example`.

- [ ] **Step 4: Verify no dangling Stripe references in client code**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. Then grep to confirm nothing client-side imports Stripe:
Run: `git grep -n "@stripe\|VITE_STRIPE_PUBLISHABLE_KEY\|create-stripe" -- src` 
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(payments): remove client-side Stripe functions, deps, and env"
```

---

## Task 7: Update Privacy page Stripe → Razorpay

**Files:**
- Modify: `src/pages/legal/PrivacyPage.tsx`

- [ ] **Step 1: Replace the three Stripe mentions**

- Line ~18: change `"Payment information (processed securely via Stripe — we do not store card data)"` to `"Payment information (processed securely via Razorpay — we do not store card data)"`.
- Line ~54 (Data Sharing list): change `"Payment processors (Stripe) for billing"` to `"Payment processors (Razorpay) for billing"`.
- Line ~92 (Security): change `secure payment processing via Stripe` to `secure payment processing via Razorpay`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/pages/legal/PrivacyPage.tsx
git commit -m "docs(legal): reference Razorpay instead of Stripe in privacy policy"
```

---

## Task 8: Add Shipping / Delivery policy page

**Files:**
- Create: `src/pages/legal/ShippingPage.tsx`
- Modify: `src/App.tsx`, `src/components/Footer.tsx`

- [ ] **Step 1: Create the Shipping page (mirrors RefundPage structure)**

Create `src/pages/legal/ShippingPage.tsx`:

```tsx
// src/pages/legal/ShippingPage.tsx
import SEO from "@/components/SEO";
import LegalLayout, { LegalSection, LegalList } from "@/components/LegalLayout";

const ShippingPage = () => (
  <>
    <SEO
      title="Delivery Policy - TheVideoJanitors"
      description="Delivery Policy for TheVideoJanitors. How and when edited videos are delivered."
    />
    <LegalLayout title="Delivery Policy" lastUpdated="June 2026">
      <LegalSection title="Digital Service — No Physical Shipping">
        <p>
          TheVideoJanitors is a fully digital video-editing service. We do not ship
          any physical goods. All deliverables are provided electronically through
          your account dashboard.
        </p>
      </LegalSection>

      <LegalSection title="1. How Edits Are Delivered">
        <LegalList
          items={[
            "Completed edits are delivered digitally via your dashboard under the relevant request",
            "You receive an in-app notification and email when an edit is ready to review",
            "Final approved files can be streamed and downloaded from the request page",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Delivery Timeline">
        <LegalList
          items={[
            "Standard turnaround is 48 hours from the time an editor is matched to your request",
            "Each request includes up to 3 revision rounds; revisions extend the timeline accordingly",
            "Turnaround may vary with footage length, edit complexity, and queue load",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Access & Availability">
        <LegalList
          items={[
            "Delivered files remain accessible while your subscription is active",
            "Project files are retained for 90 days after request completion, then deleted",
            "Download your final files before the retention window ends",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Delivery Issues">
        <p>
          If a delivery is delayed beyond the agreed timeline or a file is inaccessible,
          contact{" "}
          <a
            href="mailto:support@thevideojanitor.com"
            className="text-primary hover:underline"
          >
            support@thevideojanitor.com
          </a>
          . Where a delivery fails due to a platform error, credits are returned per our{" "}
          <a href="/legal/refunds" className="text-primary hover:underline">
            Refund Policy
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  </>
);

export default ShippingPage;
```

- [ ] **Step 2: Route it in `src/App.tsx`**

Add the import alongside the other legal imports (near line 23-26):

```tsx
import ShippingPage from "@/pages/legal/ShippingPage";
```

Add the route alongside the other legal routes (near line 114-117):

```tsx
          <Route path="/legal/shipping" element={<ShippingPage />} />
```

- [ ] **Step 3: Add the footer link in `src/components/Footer.tsx`**

After the `/legal/refunds` `<Link>...</Link>` block (ends ~line 179), add:

```tsx
              <Link
                to="/legal/shipping"
                className="hover:text-foreground transition-colors"
              >
                Delivery
              </Link>
```

- [ ] **Step 4: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/legal/ShippingPage.tsx src/App.tsx src/components/Footer.tsx
git commit -m "feat(legal): add delivery policy page for Razorpay activation"
```

---

## Task 9: Razorpay test-mode checklist doc + final verification

**Files:**
- Create: `docs/RAZORPAY_TESTING.md`

- [ ] **Step 1: Write the testing checklist**

Create `docs/RAZORPAY_TESTING.md`:

```markdown
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
```

- [ ] **Step 2: Final full build verification**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS, clean build.

- [ ] **Step 3: Commit**

```bash
git add docs/RAZORPAY_TESTING.md
git commit -m "docs: Razorpay test-mode checklist and activation prerequisites"
```

---

## Self-review notes (for the implementer)
- **Spec coverage:** region mapping (T1), currency-aware subscription (T2), currency-aware order (T3), failed-renewal handler + currency emails (T4), Stripe removal frontend (T5) + functions/deps/env (T6), compliance pages (T7 privacy, T8 shipping; Refund/Terms already exist and remain valid), test checklist (T9). Editor payouts intentionally untouched.
- **No schema migration** — `subscriptions.currency` and all `platform_config` keys already exist.
- **USD goes live only after Razorpay activation** — every task is testable on INR today; USD paths are code-complete and dry-run-verifiable.
```
