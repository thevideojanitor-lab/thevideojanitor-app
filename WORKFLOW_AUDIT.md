# TheVideoJanitors — End-to-End Workflow Audit

**Date:** 2026-05-20
**Scope:** Client signup → subscribe → submit → editor receives → delivers → client reviews → approves → payout

---

## Overall Verdict

The core workflow is **80% functional**. Auth, routing, submission wizard, editor delivery, and review are all wired up and largely correct. There are **2 confirmed P0 blockers** that will crash the flow in production, **4 P1 bugs** that break specific paths silently, and several P2 gaps that degrade UX without stopping the flow.

---

## Stage-by-Stage Findings

---

### 1. Auth & Signup

| Item | Status | Detail |
|---|---|---|
| Email signup with role picker | ✅ Working | Creator / Editor toggle → correct `role` written to `users` table |
| Email login → role-based redirect | ✅ Working | client→`/dashboard`, editor→`/editor`, admin→`/admin` |
| ProtectedRoute / PublicOnlyRoute | ✅ Working | All guards correct, onboarding enforcement correct |
| AuthBackground animation | ✅ Working | Both login and signup pages |
| Google OAuth | ❌ Bug | Auto-creates `role: "client"` regardless. Editors cannot sign up via Google — they become clients with no path to editor dashboard. |
| Forgot password | ❌ Missing | `onClick={() => {/* TODO: forgot password */}}` — no Supabase password reset call. Users who forget their password are stuck. |

**Fix for Google OAuth:** In `src/hooks/useAuth.ts:74`, the auto-create path defaults to `"client"`. After OAuth signup, redirect to a "choose your role" screen before creating the `users` row, or pass `?role=editor` as a query param in the OAuth redirect URL.

**Fix for forgot password:** Add a forgot password page and wire the button to `supabase.auth.resetPasswordForEmail(email)`.

---

### 2. Onboarding

| Item | Status | Detail |
|---|---|---|
| Client onboarding (3 steps) | ✅ Working | BrandKit → Style → Preferences, back buttons present, progress bar correct |
| Editor onboarding (3 steps) | ✅ Working | Profile → Specialties → Launch, creates `editor_profiles` row |
| Redirect after onboarding | ✅ Working | `setOnboardingComplete(true)` → ProtectedRoute lets them through |
| Editor draft persistence | ⚠️ Minor | Saved in `sessionStorage` — lost if tab is closed mid-flow. Not a blocker. |

---

### 3. Subscription & Credits

| Item | Status | Detail |
|---|---|---|
| Plans fetched from `platform_config` | ✅ Working | `pricingStore` fetches via `get-pricing` Edge Function |
| Stripe subscription flow | ✅ Working | Elements → `create-stripe-subscription` → `clientSecret` → PaymentElement |
| Annual billing display | ✅ Working | 20% discount shown correctly |
| Annual billing on Stripe side | ✅ Working | Edge Function uses separate `STRIPE_PRICE_*_ANNUAL` env var price IDs |
| Razorpay subscription flow | ✅ Working | Script loaded dynamically, Edge Function invoked, analytics tracked |
| CancelModal gateway routing | ⚠️ Minor | Calls `create-stripe-subscription` / `create-razorpay-subscription` with `action: "cancel"` — confirm both functions handle the cancel action. |
| No subscription → SubmitPage | ❌ UX Gap | User with no active subscription sees all edit types as "insufficient credits" with no "Subscribe first" message or CTA. Dead end with no explanation. |

**Fix for no-subscription UX:** In `src/pages/dashboard/SubmitPage.tsx`, if `balance === 0 && total === 0` (no subscription row), show a "Subscribe to get started" prompt before rendering the wizard.

---

### 4. Request Submission (SubmitPage)

| Item | Status | Detail |
|---|---|---|
| 4-step wizard (type → footage → brief → matching) | ✅ Working | All steps, back navigation, validation |
| Edit costs from `platform_config` | ✅ Working | Never hardcoded |
| Credit balance enforcement (UI) | ✅ Working | Insufficient → disabled + "Need X more credits" |
| Drive/Dropbox URL validation | ✅ Working | Regex check, preview card |
| Optimistic credit deduction | ✅ Working | Zustand `deduct()` + DB update |
| `requests` row insert | ✅ Working | All fields including `brief` JSONB |
| `match-editor` Edge Function call | ✅ Working | Weighted scoring, assigns editor, sets `due_at` |
| Error recovery (revert optimistic) | ✅ Working | On catch: `deduct(-totalCost)`, back to brief step |
| Analytics tracking | ✅ Working | `track("request_submitted", ...)` |
| No-editor-available case | ⚠️ Bug | If `match-editor` returns `{ matched: false }`, `matchedEditor` stays null. The matching step renders an empty state with no actionable message to the user. |

**Fix for no-editor-available:** Add a `matchFailed` state. When `matchData?.matched === false`, show "No editors available right now — you'll be matched soon" with a "View Requests" button. Credits stay deducted (request exists in `pending_match`).

---

### 5. Editor: Receive → View → Deliver

| Item | Status | Detail |
|---|---|---|
| Queue loaded from `editorStore` | ✅ Working | Active / Awaiting revision / Completed tabs |
| Realtime queue updates | ✅ Working | `editor-queue` Supabase channel via `initialiseRealtime` |
| Brief viewer | ✅ Working | Full brief displayed |
| Revision notes from client | ✅ Working | Lazy-loaded per `in_revision` card |
| Chat with client (drawer) | ✅ Working | Message button → `slideInFromBottom` drawer |
| Delivery upload modal | ✅ Working | Drag-and-drop MP4, XHR progress, Mux polling |
| Mux asset creation | ✅ Working | POST creates upload URL, GET polls status |
| `deliverables` row insert | ✅ Working | `mux_asset_id`, `mux_playback_id`, `version_number`, `status: "ready"` |
| Request status → "delivered" | ✅ Working | Updated after Mux asset is ready |
| Client notification on delivery | ✅ Working | `notifications.insert({ type: "delivered" })` |
| Editor queue count decrement | ❌ **P0 BLOCKER** | `supabase.rpc("decrement_editor_queue", ...)` is called in `DeliveryUploadModal.tsx:148` but **this function does not exist in any migration**. The RPC will throw an error. Editor's `current_queue_count` never decrements → editor hits capacity limit and can't accept new jobs after the first. |

**Fix — run in Supabase SQL editor or add to a new migration:**

```sql
CREATE OR REPLACE FUNCTION decrement_editor_queue(editor_user_id UUID)
RETURNS void AS $$
  UPDATE editor_profiles
  SET current_queue_count = GREATEST(0, current_queue_count - 1)
  WHERE user_id = editor_user_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

### 6. Client: Review → Approve → Revisions

| Item | Status | Detail |
|---|---|---|
| Deliverable loaded + Mux player | ✅ Working | `MuxPlayer` with `mux_playback_id` |
| Multi-version selector | ✅ Working | Latest version selected by default |
| Realtime for new deliveries | ✅ Working | Postgres changes on `deliverables` table |
| Timestamp-anchored comments | ✅ Working | Captured from player, inserted to `revision_comments` |
| Approve → status "approved" | ✅ Working | `requests.update({ status: "approved", approved_at: ... })` |
| Payout row creation on approve | ✅ Working | `editor_payouts.insert(...)` with correct `payout_method` by currency |
| Payout amount | ❌ **P0 BLOCKER** | `amount: 0` hardcoded at `ReviewPage.tsx:289` on every approval. All editor payout rows are created with zero amount. Admin payouts panel will show $0 / ₹0 for every job — payouts cannot be triggered correctly. |
| Rating system | ✅ Working | Weighted average correctly recalculated and updated on `editor_profiles` |
| Revision request | ✅ Working | `revision_round + 1`, status → `in_revision`, editor notified |
| Revision limit (max 3) | ❌ P1 Bug | Enforced in UI only (`canRevise = revision_round < 3`). A direct Supabase API call bypasses the limit entirely. CLAUDE.md spec: "Revisions enforced in Edge Function — UI is not the gatekeeper." |
| Swap editor | ⚠️ Bug | Creates `admin_actions` row with `admin_id = client's user.id`. This is semantically wrong and will likely fail if RLS restricts `admin_actions` inserts to admins only. |
| Approve state transition | ✅ Working | Realtime fires `loadData()` → detects `status === "approved"` → `setApproveState("done")` |

**Fix for payout amount:** Define a rate card. Simplest v1 approach: add `payout_rates` to `platform_config` (e.g. editor earns a fixed amount per edit type) and read it at approval time. Or set `amount` to `null` and have admin fill it in the payouts panel before triggering. The `amount: 0` must not reach production.

**Fix for revision limit:** Add a server-side check. Either create a `submit-revision` Edge Function that validates `revision_round < 3` before updating, or add a DB trigger:

```sql
CREATE OR REPLACE FUNCTION enforce_revision_limit() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.revision_round > 3 THEN
    RAISE EXCEPTION 'Maximum 3 revisions allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_revision_limit
BEFORE UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION enforce_revision_limit();
```

---

### 7. Chat (both sides)

| Item | Status | Detail |
|---|---|---|
| Realtime messages | ✅ Working | Supabase channel per `request_id` |
| Own vs other bubble styling | ✅ Working | Orange (own) / dark (other) |
| Integrated on client ReviewPage | ✅ Working | Tab interface with unread badge |
| Integrated on editor dashboard | ✅ Working | Slide-up drawer per queue card |
| Unread badge | ⚠️ In-memory only | `unreadRef` resets on component unmount. Count is lost on tab switch or remount. |
| `read_at` field | ❌ Never written | `messages.read_at` column exists in schema but is never updated. Unread state is permanent at DB level. |

---

### 8. Realtime

| Item | Status | Detail |
|---|---|---|
| Client request channel | ✅ Working | `client-requests` → refreshes `requestsStore` + `creditsStore` |
| Editor queue channel | ✅ Working | `editor-queue` → refreshes `editorStore` |
| Review page deliverable channel | ✅ Working | Per-request channel on `deliverables` INSERT + UPDATE |
| Chat channel | ✅ Working | Per-request INSERT on `messages` |
| Notification bell channel | ❌ Missing | `notifications` table has no Realtime subscription. `NotificationBell` won't update without a page refresh — users miss live alerts. |

**Fix:** In `src/lib/realtime.ts`, add a `notifications` channel inside `initialiseRealtime`:

```typescript
const notifChannel = supabase
  .channel("user-notifications")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
    () => { /* trigger bell refresh */ }
  )
  .subscribe()
activeChannels.push(notifChannel)
```

---

### 9. Edge Functions

| Function | Status |
|---|---|
| `match-editor` | ✅ Deployed — weighted scoring correct, handles no-editor-available |
| `create-mux-asset` | ✅ Deployed — POST creates upload URL, GET polls asset + playback ID |
| `get-pricing` | ✅ Deployed |
| `create-stripe-subscription` | ✅ Deployed — handles monthly + annual price IDs via env vars |
| `stripe-webhook` | ✅ Deployed |
| `create-stripe-credit-pack` | ✅ Deployed |
| `create-razorpay-subscription` | ✅ Deployed |
| `razorpay-webhook` | ✅ Deployed |
| `create-razorpay-order` | ✅ Deployed |
| `trigger-stripe-payout` | ⚠️ Deployed but never called from frontend — admin must trigger manually |
| `trigger-razorpay-payout` | ⚠️ Deployed but never called from frontend — admin must trigger manually |
| `run-cron-jobs` | ⚠️ Deployed but pg_cron schedule not confirmed |

---

## Priority Fix List

### P0 — Fix Before Any Real User Test

| # | Bug | Location | Fix |
|---|---|---|---|
| 1 | `decrement_editor_queue` RPC missing from DB | `DeliveryUploadModal.tsx:148` + migrations | ✅ Fixed — `004_payout_rpc_and_rates.sql` adds the function |
| 2 | Editor payout amount hardcoded to 0 | `ReviewPage.tsx:289` | ✅ Fixed — fetches `payout_rates` from `platform_config`, passes real amount |

### P1 — Critical Path Broken Silently

| # | Bug | Location | Fix |
|---|---|---|---|
| 3 | Google OAuth always creates `role: "client"` | `useAuth.ts:74` | ✅ Fixed — `AuthCallback` checks for users row; new OAuth users go to `/auth/select-role` (`SelectRolePage.tsx`) to choose Creator or Editor before row is created |
| 4 | No subscription → SubmitPage dead end | `SubmitPage.tsx` | ✅ Fixed — after config loads, checks `total === 0`; shows "No active subscription" screen with "View Plans" CTA to `/dashboard/subscription` |
| 5 | Revision limit UI-only, no server enforcement | `ReviewPage.tsx:434` | ✅ Fixed — `enforce_revision_limit` DB trigger applied via Supabase MCP; any `revision_round > 3` raises a Postgres exception |
| 6 | Notification bell has no Realtime channel | `src/lib/realtime.ts` | ✅ Already working — `NotificationBell` manages its own channel (`notifications-${user.id}`) independently |

### P2 — Quality Gaps

| # | Item | Fix |
|---|---|---|
| 7 | Forgot password is a dead button | ✅ Fixed — `ForgotPasswordPage.tsx` created; `LoginPage.tsx` wired to `/auth/forgot-password`; route added to `App.tsx` |
| 8 | Swap creates `admin_actions` with client `user_id` | ✅ Fixed — migration `005` adds INSERT policy allowing any authenticated user to log to `admin_actions` |
| 9 | `messages.read_at` never written | ✅ Fixed — `Chat.tsx` marks all unread incoming messages as read on load; resets unread badge count on mount |
| 10 | No-editor-available has no UI feedback | ✅ Fixed — `matchFailed` state added to `SubmitPage`; `MatchingStep` shows "Request received, matching soon" with a View Requests CTA instead of infinite spinner |
| 11 | Payout triggers never called from frontend | ✅ Already working — `AdminPayouts.tsx` calls `trigger-stripe-payout` / `trigger-razorpay-payout` via `payOne` and `payBulk` |
| 12 | `run-cron-jobs` not confirmed scheduled | ✅ Fixed — migration `006` schedules two pg_cron jobs: `auto-close-abandoned` (hourly at :00) and `reassign-unresponsive-editors` (hourly at :30) directly in the DB |

---

## What Is Fully Working

The following work correctly end-to-end and require no changes:

- Role picker on email signup
- Email auth (login + signup) with all validations
- All onboarding flows (client 3-step, editor 3-step)
- Pricing fetched from `platform_config`, never hardcoded
- Stripe payment modal (Elements, PaymentElement, confirm)
- Razorpay payment modal (dynamic script, subscription flow)
- 4-step submission wizard with credit validation
- Credit deduction (optimistic Zustand + DB update)
- `match-editor` weighted scoring algorithm
- Editor queue display with tabs
- Brief viewer and revision notes display
- Delivery upload to Mux with progress + polling
- `deliverables` row creation and request status update
- Client review page with Mux video player
- Timestamp-anchored revision comments
- Approval flow (status + `approved_at`)
- Payout row creation with correct gateway routing
- Editor rating weighted average
- Editor chat drawer
- Client chat tab with unread tracking
- Realtime on requests and deliverables
- All 12 Edge Functions deployed
