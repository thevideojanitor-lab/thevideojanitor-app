# CLAUDE.md — TheVideoJanitors
# Read this file COMPLETELY before writing a single line of code.
# This is the single source of truth. No exceptions. No shortcuts.

---

## 0. TOOLING SETUP — DO THIS ONCE BEFORE ANYTHING ELSE

Three tools power this project. Install them in this exact order.

### Tool 1 — claude-mem (Persistent Memory)
claude-mem captures everything you do across sessions and injects it back
into future sessions. Without this, Claude Code forgets everything between
sessions. For an 8-week build this is mandatory.

```bash
npx claude-mem install
```

Restart Claude Code after installing. From now on, every session automatically
inherits compressed memory from all previous sessions. You will see a memory
summary injected at the start of each new session — that is claude-mem working.

Privacy: wrap anything sensitive with <private>...</private> tags and
claude-mem will not store it.

Web viewer (real-time memory stream): http://localhost:37777

How claude-mem search works (use this to query project history):
  Step 1: search(query="...", limit=10)           → compact index ~50 tokens/result
  Step 2: timeline(observation_id="...")           → chronological context
  Step 3: get_observations(ids=[123, 456])         → full details only for relevant IDs
This 3-step pattern saves ~10x tokens vs fetching everything.

### Tool 2 — open-design (Design Intelligence)
Run once at project setup:

```bash
git clone https://github.com/nexu-io/open-design.git ./tmp-open-design
mkdir -p .claude/skills .claude/design-systems/thevideojanitors
cp -r ./tmp-open-design/skills/dashboard         .claude/skills/dashboard
cp -r ./tmp-open-design/skills/mobile-app        .claude/skills/mobile-app
cp -r ./tmp-open-design/skills/mobile-onboarding .claude/skills/mobile-onboarding
cp -r ./tmp-open-design/skills/pricing-page      .claude/skills/pricing-page
cp -r ./tmp-open-design/skills/saas-landing      .claude/skills/saas-landing
rm -rf ./tmp-open-design
```

Then create `.claude/design-systems/thevideojanitors/DESIGN.md` using the
full spec in Section 3 of this file.

### Tool 3 — ui-ux-pro-max MCP
```bash
claude mcp add ui-ux-pro-max https://ui-ux-pro-max-skill.nextlevelbuilder.io/
```

### Which open-design skill to read before each screen
| Screen | Read first |
|---|---|
| Client dashboard | `.claude/skills/dashboard/SKILL.md` |
| Admin panel | `.claude/skills/dashboard/SKILL.md` |
| Editor dashboard | `.claude/skills/dashboard/SKILL.md` |
| Onboarding | `.claude/skills/mobile-onboarding/SKILL.md` |
| Subscription/pricing | `.claude/skills/pricing-page/SKILL.md` |
| Mobile views (375px) | `.claude/skills/mobile-app/SKILL.md` |
| Landing pages | DO NOT MODIFY — visual reference only |

### Anti-slop checklist (run before emitting ANY component)
1. Did I read DESIGN.md + active SKILL.md before writing?
2. Are all hex values taken exactly from Section 3?
3. 5-dimensional critique (score 1–5, fix anything under 3):
   - Philosophy: intentional or generic?
   - Hierarchy: most important = most visible?
   - Execution: spacing, sizing, alignment precise?
   - Specificity: TheVideoJanitors or any SaaS?
   - Restraint: every element earning its place?
4. One screen = one question + one primary action?
5. No fake stats, no invented metrics — use `—` as placeholder

---

## 1. WHAT THIS PRODUCT IS

TheVideoJanitors is a managed short-form video editing platform.

- Clients buy monthly credit subscriptions
- Submit video editing requests with raw footage + structured brief
- Platform auto-matches them with a vetted editor
- Editor delivers within 48 hours
- Client reviews, revises (max 3), approves
- **Credits deducted at SUBMISSION — not approval, not delivery**
- Editors paid weekly after jobs are approved

**Golden rule: one question answered, one action available per screen.**

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | **motion** (`motion/react`) — NOT framer-motion |
| State | Zustand |
| Backend | Supabase (Postgres + Auth + Realtime + Storage) |
| Payments USD | Stripe Billing + Stripe Connect |
| Payments INR | Razorpay Subscriptions + Razorpay Payouts |
| Video | Mux (`@mux/mux-player-react`) |
| Routing | React Router v6 |
| Tables | @tanstack/react-table |
| Charts | recharts |
| Analytics | @vercel/analytics |
| Memory | claude-mem (session persistence) |
| Design | open-design skills + ui-ux-pro-max MCP |
| Deployment | Vercel + Supabase |

```bash
# Install all at once
npm install motion @mux/mux-player-react zustand @supabase/supabase-js \
  @tanstack/react-table recharts @vercel/analytics
```

NEVER import from "framer-motion" — deprecated, remove if present.
Razorpay: load frontend script dynamically, do NOT npm install.
Prices: NEVER hardcoded in components — always from platform_config table.

---

## 3. DESIGN.md — THEVIDEOJANITORS

Save at `.claude/design-systems/thevideojanitors/DESIGN.md`

```markdown
# TheVideoJanitors Design System

## 1. Brand
Name: TheVideoJanitors
Tagline: Clean edits. Fast delivery. No freelancer roulette.
Voice: Direct, confident, no fluff. We respect the creator's time.
Tone: Professional but energetic. Not corporate. Not hypey.
Mode: Dark mode only. No light mode. No toggle.

## 2. Colour

### Primary Palette (exact — zero substitutions)
--color-bg:       #121212  rgb(18,18,18)     Page background
--color-primary:  #FF5F15  rgb(255,95,21)    CTAs, accents, active states
--color-surface:  #404040  rgb(64,64,64)     Cards, panels
--color-fg:       #F9FAFB  rgb(249,250,251)  Primary text

### Derived Tokens
--color-surface-raised:  #4A4A4A            Card hover, nested cards
--color-border:          #2A2A2A            All borders and dividers
--color-input:           #1A1A1A            Input backgrounds
--color-primary-hover:   #E54E08            Button hover
--color-primary-muted:   rgba(255,95,21,0.12) Tags, selections
--color-muted:           #9CA3AF            Labels, timestamps, placeholders
--color-sidebar:         #1A1A1A            Sidebar bg
--color-editor-accent:   #3B82F6            Editor-side views ONLY

### CSS Variables (:root)
--background:        0 0% 7%;
--foreground:        210 17% 98%;
--card:              0 0% 25%;
--card-foreground:   210 17% 98%;
--primary:           22 100% 54%;
--primary-foreground:0 0% 7%;
--muted:             0 0% 17%;
--muted-foreground:  220 9% 61%;
--border:            0 0% 17%;
--input:             0 0% 10%;
--ring:              22 100% 54%;
--radius:            0.75rem;

### Status Colours (use exactly, never invent)
approved:    bg rgba(34,197,94,0.15)   text #4ade80  border rgba(34,197,94,0.3)
in_progress: bg rgba(255,95,21,0.15)  text #FF5F15  border rgba(255,95,21,0.3)
delivered:   bg rgba(59,130,246,0.15) text #60a5fa  border rgba(59,130,246,0.3)
in_revision: bg rgba(234,179,8,0.15)  text #facc15  border rgba(234,179,8,0.3)
overdue:     bg rgba(239,68,68,0.15)  text #f87171  border rgba(239,68,68,0.3)
pending:     bg rgba(64,64,64,0.5)    text #9CA3AF  border #2A2A2A
abandoned:   bg rgba(64,64,64,0.3)    text #9CA3AF  border #2A2A2A

### Colour Anti-patterns
- Never #FFFFFF → use #F9FAFB
- Never #000000 → use #121212
- Never orange text on light surface
- Never text below #9CA3AF contrast on dark bg
- Never new colours not listed here
- Prices, stats, credits → always text-[#FF5F15] (orange = premium signal)

## 3. Typography
font-heading: headings, card titles, stats, prices
font-sans:    body, labels, inputs, descriptions
(from existing landing pages — never add fonts)

H1: font-heading text-4xl md:text-5xl font-bold text-[#F9FAFB]
H2: font-heading text-2xl md:text-3xl font-bold text-[#F9FAFB]
H3: font-heading text-xl font-semibold text-[#F9FAFB]
Body: font-sans text-base text-[#F9FAFB]/90 leading-relaxed
Label: font-sans text-xs uppercase tracking-wider text-[#9CA3AF]
Stat: font-heading text-3xl font-bold text-[#FF5F15]

## 4. Spacing
Mobile min: 375px
Container: container mx-auto px-4
Card gap: gap-4 mobile / gap-6 desktop
Card padding: p-4 mobile / p-6 desktop

## 5. Components

Card: bg-[#404040] border border-[#2A2A2A] rounded-xl
  hover: bg-[#4A4A4A] transition-colors

Primary btn: bg-[#FF5F15] text-[#121212] font-semibold rounded-lg
  hover:bg-[#E54E08] + whileHover scale(1.02) whileTap scale(0.97)

Ghost btn: border border-[#404040] text-[#F9FAFB] hover:bg-[#404040]

Input: bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB]
  placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-[#FF5F15]/30

Sidebar: bg-[#1A1A1A] border-r border-[#2A2A2A]
Nav inactive: text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#404040]/50
Nav active: bg-[#FF5F15]/10 text-[#FF5F15] border-l-2 border-[#FF5F15]

Credit bar: track bg-[#2A2A2A], fill bg-[#FF5F15] (spring animated width)

Countdown:
  >12h: text-[#FF5F15] font-mono font-bold
  4-12h: text-yellow-400 font-mono font-bold
  <4h: text-red-400 font-mono font-bold animate-pulse

## 6. Motion
Library: motion — import from "motion/react" ONLY
Variants: /src/lib/animations.ts — always import, never define inline

Easing: ease "easeOut", duration 0.3–0.4s
Page load: staggerContainer + fadeUp (stagger 0.08s)
Status changes: AnimatePresence
Modals: scaleIn + AnimatePresence
Drawers: slideInFromRight + AnimatePresence
Bottom sheets: slideInFromBottom + AnimatePresence
Wizard steps: AnimatePresence + slideInFromRight
Buttons: whileHover scale(1.02), whileTap scale(0.97)
Card hover: whileHover y(-2)
Credit bar: spring animated width
Approve: SVG pathLength 0→1 full-screen checkmark
Messages: AnimatePresence + slideInFromBottom
Bell: rotate keyframes on new notification
Skeleton: opacity [0.5, 1, 0.5] pulse
NEVER animate: table rows, form validation, nav hover

## 7. Layouts

Client: sidebar (desktop w-64 bg-[#1A1A1A]) + bottom nav (mobile 5 tabs)
  Header: logo + CreditsDisplay + NotificationBell + avatar
  Content: 1col/2col/3col responsive

Editor: same structure, editor-accent #3B82F6 for active nav

Admin: sidebar 240px, header shows role badge

## 8. Voice
Button labels: verb-first ("Submit Request" "Approve" "Swap Editor")
Status: plain English ("Your edit is ready!" not "Status: DELIVERED")
Errors: friendly + actionable — never raw API errors shown to user
Empty states: motivational ("Ready for your first edit?")
Fake stats → use — as placeholder

## 9. Anti-patterns
- Two primary CTAs per screen
- Purple gradients or glows
- Emoji as UI icons
- Invented metrics
- Spinner > 3 seconds (use skeleton)
- Hardcoded prices
- Raw Supabase/Stripe/Razorpay errors to user
```

---

## 4. USER ROLES & ROUTING

| Role | Value | Access |
|---|---|---|
| Client | `client` | `/dashboard/*` + `/onboarding` |
| Editor | `editor` | `/editor/*` |
| Super Admin | `super_admin` | `/admin/*` full |
| Ops Admin | `ops_admin` | `/admin/*` no billing |
| Finance Admin | `finance_admin` | `/admin/*` read + payouts |

```
/dashboard/*  → client only       → /auth/login if unauthed
/editor/*     → editor only       → /auth/login if unauthed
/admin/*      → admin_role ≠ null → / if unauthorized
/onboarding   → client, onboarding_complete=false only
/auth/*       → public            → redirect to dashboard if already authed
/ and /for-*  → fully public      → DO NOT MODIFY existing landing pages
```

---

## 5. REGION & PAYMENTS

### Detection
```typescript
// On first load:
// 1. GET https://ipapi.co/json/
// 2. Store { region, currency } in localStorage
// 3. After signup → write to users table permanently
// 4. ipapi fail → default { region: "US", currency: "USD" }
// Never re-detect after signup. Never ask user to choose gateway.

region === "IN"
  ? { gateway: "razorpay", currency: "INR" }
  : { gateway: "stripe",   currency: "USD" }
```

### Stripe (USD)
- Subscriptions: Stripe Billing API
- Credit packs: Stripe Checkout (one-time)
- Editor payouts: Stripe Connect
- Webhooks: payment_intent.succeeded, invoice.paid,
  customer.subscription.updated, customer.subscription.deleted
- Auto-retry failed: 3 attempts → past_due

### Razorpay (INR)
```javascript
// Load dynamically — never npm install frontend SDK
const s = document.createElement("script")
s.src = "https://checkout.razorpay.com/v1/checkout.js"
document.body.appendChild(s)
```
- Subscriptions: Razorpay Subscriptions API
- Credit packs: Razorpay Orders API
- Editor payouts: Razorpay Payouts (NEFT/IMPS/UPI)
- Webhooks: payment.captured, subscription.charged, subscription.cancelled
- BOTH webhook handlers must validate signatures before processing anything

---

## 6. PRICING

NEVER hardcode prices. Always fetch from get-pricing Edge Function → platform_config.
Cache in pricingStore for session.

### Plans
| Plan | USD | INR | Credits |
|---|---|---|---|
| Quick Sweep | $99/mo | ₹2,499/mo | 350 |
| Deep Clean | $249/mo | ₹5,999/mo | 950 |
| Full Service | $599/mo | ₹13,999/mo | 2,500 |

### Credit Packs
| Pack | USD | INR | Credits |
|---|---|---|---|
| Small | $33 | ₹825 | +100 |
| Medium | $75 | ₹1,875 | +250 (10% off) |
| Large | $140 | ₹3,499 | +500 (13% off) |

### Edit Costs (configurable in admin)
Basic: 50cr | Standard: 70cr | Premium: 100cr | Extra ratio: +10cr each

---

## 7. CREDIT RULES

```
DEDUCTED AT SUBMISSION. NOT AT APPROVAL. NOT AT DELIVERY.

1. Check credits >= edit_cost before showing submit button
   → insufficient: button disabled + tooltip "Need X more [Buy Credits]"

2. On submit:
   → deduct subscriptions.credits_remaining immediately
   → insert requests row (status="pending_match")
   → call match-editor Edge Function

3. Editor swap → job transfers, NO new deduction

4. Editor fails to deliver → admin refunds manually via admin panel
   → log to admin_actions

5. Client abandons → no refund (already spent)
   → request auto-closes 7 days after delivery → "abandoned"

6. Revisions → max 3, enforced by Edge Function (not just UI)
   → round 3 modal: "Last revision included. Extra = +10cr"

7. Subscription renewal → credits RESET to credits_total (no rollover)

8. Credits balance always visible in dashboard header (Zustand + Realtime)
```

---

## 8. DATABASE SCHEMA

Write to `/supabase/migrations/001_initial_schema.sql`

### users
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
email TEXT UNIQUE NOT NULL
role TEXT NOT NULL CHECK (role IN ('client','editor','admin'))
region TEXT NOT NULL DEFAULT 'US' CHECK (region IN ('IN','US'))
currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('INR','USD'))
admin_role TEXT CHECK (admin_role IN ('super_admin','ops_admin','finance_admin'))
created_at TIMESTAMPTZ DEFAULT now()
```

### client_profiles
```sql
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
brand_kit_url TEXT
brand_colors JSONB DEFAULT '{}'
content_niches TEXT[] DEFAULT '{}'
posting_frequency TEXT
style_preferences TEXT[] DEFAULT '{}'
reference_video_url TEXT
onboarding_complete BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

### editor_profiles
```sql
user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
display_name TEXT
bio TEXT
specialties TEXT[] DEFAULT '{}'
portfolio_links TEXT[] DEFAULT '{}'
avg_turnaround_hours INTEGER DEFAULT 24
rating NUMERIC(3,2) DEFAULT 5.0
completed_count INTEGER DEFAULT 0
max_queue_capacity INTEGER DEFAULT 5
current_queue_count INTEGER DEFAULT 0
accepts_repeat_clients BOOLEAN DEFAULT true
bank_details_verified BOOLEAN DEFAULT false
is_active BOOLEAN DEFAULT true
unresponsive_count INTEGER DEFAULT 0
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

### subscriptions
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id UUID REFERENCES users(id) ON DELETE CASCADE
gateway TEXT NOT NULL CHECK (gateway IN ('stripe','razorpay'))
gateway_subscription_id TEXT
gateway_customer_id TEXT
plan TEXT NOT NULL CHECK (plan IN ('quick_sweep','deep_clean','full_service'))
credits_total INTEGER NOT NULL
credits_remaining INTEGER NOT NULL
currency TEXT NOT NULL
amount_paid INTEGER NOT NULL
renews_at TIMESTAMPTZ
status TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due','trialing'))
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

### requests
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id UUID REFERENCES users(id) ON DELETE CASCADE
editor_id UUID REFERENCES users(id) ON DELETE SET NULL
status TEXT NOT NULL DEFAULT 'pending_match' CHECK (status IN (
  'pending_match','matched','in_progress','delivered',
  'in_revision','approved','abandoned'
))
edit_type TEXT NOT NULL CHECK (edit_type IN ('basic','standard','premium'))
credits_cost INTEGER NOT NULL
brief JSONB NOT NULL DEFAULT '{}'
footage_url TEXT
footage_type TEXT CHECK (footage_type IN ('drive_link','dropbox_link'))
aspect_ratios TEXT[] DEFAULT '{9:16}'
revision_round INTEGER DEFAULT 0 CHECK (revision_round <= 3)
submitted_at TIMESTAMPTZ DEFAULT now()
due_at TIMESTAMPTZ
delivered_at TIMESTAMPTZ
approved_at TIMESTAMPTZ
close_after TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()

CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_editor_id ON requests(editor_id);
CREATE INDEX idx_requests_status ON requests(status);
```

### Auto-set close_after trigger
```sql
CREATE OR REPLACE FUNCTION set_close_after() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.close_after = now() + INTERVAL '7 days';
    NEW.delivered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_close_after
BEFORE UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION set_close_after();
```

### deliverables
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
request_id UUID REFERENCES requests(id) ON DELETE CASCADE
version_number INTEGER NOT NULL DEFAULT 1
file_url TEXT
mux_asset_id TEXT
mux_playback_id TEXT
submitted_by UUID REFERENCES users(id)
submitted_at TIMESTAMPTZ DEFAULT now()
status TEXT DEFAULT 'processing' CHECK (status IN ('processing','ready','approved'))
CREATE INDEX idx_deliverables_request_id ON deliverables(request_id);
```

### revision_comments
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE
timestamp_seconds NUMERIC(10,2)
comment TEXT NOT NULL
created_by UUID REFERENCES users(id)
created_at TIMESTAMPTZ DEFAULT now()
```

### messages
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
request_id UUID REFERENCES requests(id) ON DELETE CASCADE
sender_id UUID REFERENCES users(id)
body TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
read_at TIMESTAMPTZ
CREATE INDEX idx_messages_request_id ON messages(request_id);
```

### editor_payouts
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
editor_id UUID REFERENCES users(id)
request_id UUID REFERENCES requests(id)
amount INTEGER NOT NULL
currency TEXT NOT NULL
status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed'))
payout_method TEXT CHECK (payout_method IN ('stripe_connect','razorpay_payout','manual'))
paid_at TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT now()
```

### notifications
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES users(id) ON DELETE CASCADE
message TEXT NOT NULL
type TEXT NOT NULL
read BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT now()
```

### admin_actions (audit log — NEVER skip an entry)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
admin_id UUID REFERENCES users(id)
action_type TEXT NOT NULL
target_type TEXT NOT NULL
target_id UUID
notes TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

### platform_config (all business rules — never in code)
```sql
key TEXT PRIMARY KEY
value JSONB NOT NULL
updated_by UUID REFERENCES users(id)
updated_at TIMESTAMPTZ DEFAULT now()
```

### Seed platform_config
```sql
INSERT INTO platform_config (key, value) VALUES
('pricing_usd','{"quick_sweep":{"amount":9900,"credits":350},"deep_clean":{"amount":24900,"credits":950},"full_service":{"amount":59900,"credits":2500}}'),
('pricing_inr','{"quick_sweep":{"amount":249900,"credits":350},"deep_clean":{"amount":599900,"credits":950},"full_service":{"amount":1399900,"credits":2500}}'),
('credit_packs_usd','{"small":{"amount":3300,"credits":100},"medium":{"amount":7500,"credits":250},"large":{"amount":14000,"credits":500}}'),
('credit_packs_inr','{"small":{"amount":82500,"credits":100},"medium":{"amount":187500,"credits":250},"large":{"amount":349900,"credits":500}}'),
('edit_costs','{"basic":50,"standard":70,"premium":100,"extra_ratio":10}'),
('rules','{"max_revisions":3,"auto_close_days":7,"editor_reassign_hours":12,"max_active_requests":2}');
```

### Row Level Security
```sql
-- Enable on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- Admins bypass all
CREATE POLICY admin_bypass ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL)
);

-- Clients: own data only
CREATE POLICY client_profile  ON client_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY client_subs     ON subscriptions   FOR ALL USING (client_id = auth.uid());
CREATE POLICY client_requests ON requests        FOR ALL USING (client_id = auth.uid());

-- Editors: assigned requests only
CREATE POLICY editor_requests ON requests        FOR SELECT USING (editor_id = auth.uid());
CREATE POLICY editor_profile  ON editor_profiles FOR ALL    USING (user_id = auth.uid());
CREATE POLICY editor_payouts  ON editor_payouts  FOR SELECT USING (editor_id = auth.uid());

-- Messages: participants only
CREATE POLICY msg_access ON messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_id
    AND (r.client_id = auth.uid() OR r.editor_id = auth.uid())
  )
);

-- Platform config: read all auth, write admin only
CREATE POLICY cfg_read  ON platform_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY cfg_write ON platform_config FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL)
);
```

---

## 9. ZUSTAND STORES

### authStore.ts
```typescript
interface AuthStore {
  user: User | null; role: "client"|"editor"|"admin"|null
  region: "US"|"IN"; currency: "USD"|"INR"; adminRole: string|null
  setUser: (u: User|null) => void; clear: () => void
}
```

### creditsStore.ts
```typescript
interface CreditsStore {
  balance: number; total: number; loading: boolean
  refresh: () => Promise<void>
  deduct: (amount: number) => void  // optimistic on submit
}
```

### requestsStore.ts
```typescript
interface RequestsStore {
  activeRequests: Request[]; pastRequests: Request[]
  loading: boolean; refresh: () => Promise<void>
}
```

### pricingStore.ts
```typescript
interface PricingStore {
  config: PricingConfig|null; loading: boolean
  fetch: (region: string) => Promise<void>
}
```

---

## 10. REALTIME CHANNELS — /src/lib/realtime.ts

```typescript
// Client request updates
supabase.channel('client-requests').on('postgres_changes',
  { event:'*', schema:'public', table:'requests', filter:`client_id=eq.${uid}` },
  () => requestsStore.refresh()
).subscribe()

// Editor queue
supabase.channel('editor-queue').on('postgres_changes',
  { event:'*', schema:'public', table:'requests', filter:`editor_id=eq.${uid}` },
  () => { /* update queue */ }
).subscribe()

// Chat
supabase.channel(`messages-${requestId}`).on('postgres_changes',
  { event:'INSERT', schema:'public', table:'messages', filter:`request_id=eq.${requestId}` },
  (payload) => { /* append message */ }
).subscribe()

// Deliverable
supabase.channel(`deliverable-${requestId}`).on('postgres_changes',
  { event:'UPDATE', schema:'public', table:'deliverables', filter:`request_id=eq.${requestId}` },
  (payload) => { if(payload.new.status==='ready') { /* notify */ } }
).subscribe()
```

---

## 11. EDGE FUNCTIONS

| Function | Purpose |
|---|---|
| get-pricing | Pricing config for region from platform_config |
| create-stripe-subscription | Stripe customer + subscription |
| stripe-webhook | All Stripe events (validate sig first) |
| create-stripe-credit-pack | One-time Stripe payment |
| create-razorpay-subscription | Razorpay subscription |
| razorpay-webhook | All Razorpay events (validate sig first) |
| create-razorpay-order | One-time Razorpay credit pack |
| match-editor | Weighted scoring, assigns editor |
| create-mux-asset | Mux upload URL + asset_id |
| trigger-stripe-payout | Stripe Connect editor payout |
| trigger-razorpay-payout | Razorpay bank/UPI editor payout |
| run-cron-jobs | Auto-close abandoned + reassign offline editors |

---

## 12. MATCHING ALGORITHM

```typescript
// /supabase/functions/match-editor/index.ts
async function matchEditor(requestId: string, excludeEditorId?: string) {
  const request = await getRequest(requestId)
  const client = await getClientProfile(request.client_id)
  const editors = await supabase.from('editor_profiles').select('*')
    .eq('is_active', true).filter('current_queue_count','lt','max_queue_capacity')
    .neq('user_id', excludeEditorId ?? '')

  const scored = editors.map(e => {
    let s = 0
    const matched = e.specialties.filter(x => client.content_niches.includes(x))
    s += (matched.length / Math.max(client.content_niches.length, 1)) * 40 // niche 40pts
    const load = e.current_queue_count / e.max_queue_capacity
    s += load < 0.8 ? 20 : load < 0.9 ? 15 : 5                             // availability 20pts
    s += e.rating >= 4.8 ? 10 : e.rating >= 4.5 ? 5 : 0                    // performance 10pts
    s += 15                                                                  // style 30pts (15 default v1)
    return { editor: e, score: s }
  })
  scored.sort((a,b) => b.score - a.score)
  const best = scored[0]?.editor
  if (!best) throw new Error('No editors available')

  await supabase.from('requests').update({
    editor_id: best.user_id, status: 'matched',
    due_at: new Date(Date.now() + 48*3600*1000).toISOString()
  }).eq('id', requestId)
  await supabase.from('editor_profiles')
    .update({ current_queue_count: best.current_queue_count + 1 })
    .eq('user_id', best.user_id)
}
```

Auto-reassign (pg_cron, hourly):
```sql
UPDATE requests SET editor_id=NULL, status='pending_match'
WHERE status='matched' AND updated_at < now() - INTERVAL '12 hours';
UPDATE editor_profiles SET unresponsive_count = unresponsive_count + 1 WHERE ...;
UPDATE editor_profiles SET is_active=false WHERE unresponsive_count >= 3;
```

---

## 13. ANIMATION VARIANTS — /src/lib/animations.ts

```typescript
import { Variants } from "motion/react"

export const fadeUp: Variants = {
  hidden: { opacity:0, y:20 },
  visible: { opacity:1, y:0, transition:{ duration:0.4, ease:"easeOut" } }
}
export const scaleIn: Variants = {
  hidden: { opacity:0, scale:0.95 },
  visible: { opacity:1, scale:1, transition:{ duration:0.3, ease:"easeOut" } }
}
export const slideInFromRight: Variants = {
  hidden: { opacity:0, x:40 },
  visible: { opacity:1, x:0, transition:{ duration:0.35, ease:"easeOut" } },
  exit:   { opacity:0, x:40, transition:{ duration:0.25 } }
}
export const slideInFromBottom: Variants = {
  hidden: { opacity:0, y:30 },
  visible: { opacity:1, y:0, transition:{ duration:0.35, ease:"easeOut" } },
  exit:   { opacity:0, y:30, transition:{ duration:0.2 } }
}
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition:{ staggerChildren:0.08 } }
}
export const staggerFast: Variants = {
  hidden: {},
  visible: { transition:{ staggerChildren:0.04 } }
}
```

---

## 14. NON-NEGOTIABLE RULES

1. claude-mem is running — session memory is always active
2. Read DESIGN.md + active SKILL.md before building any screen
3. Run 5-dim critique before emitting (philosophy/hierarchy/execution/specificity/restraint)
4. One action per screen. Never two primary CTAs.
5. Always show job status — client never wonders where their edit is
6. Countdown timers on every active request card
7. Credits balance always visible in dashboard header
8. No spinner > 3 seconds — skeleton screens instead
9. Mobile-first — every layout works at 375px min
10. shadcn/ui primitives — never raw input/select/button tags
11. Prices never hardcoded — always from platform_config
12. Every admin action logs to admin_actions — zero exceptions
13. Revisions enforced in Edge Function — UI is not the gatekeeper
14. motion/react only — never framer-motion, never CSS keyframes
15. Never show raw Supabase/Stripe/Razorpay errors to users
16. Placeholder beats fake stat — use `—` not invented numbers
17. Wrap sensitive content in <private>...</private> for claude-mem

---

## 15. OUT OF SCOPE — V1

Do not build. Do not leave TODOs.
- Direct file upload (Drive/Dropbox links only)
- Instagram/TikTok post integration
- Mobile native app
- AI style matching (weighted scoring only)
- Browse all editors gallery
- Light mode
- i18n

---

## 16. ANALYTICS EVENTS

```typescript
import { track } from "@vercel/analytics"
track("subscription_started",   { plan, currency, region, gateway })
track("request_submitted",      { edit_type, credits_cost, region })
track("revision_requested",     { revision_round })
track("edit_approved",          { revision_rounds, credits_cost })
track("editor_swapped",         { reason })
track("credits_recharged",      { pack_size, currency, region })
track("onboarding_completed",   { region })
track("subscription_cancelled", { plan, currency, region })
```

---

## 17. LAUNCH CHECKLIST

```
Infrastructure
[ ] Supabase production project (separate from dev)
[ ] All migrations applied to production
[ ] RLS policies verified (test each role manually)
[ ] Edge Functions deployed
[ ] pg_cron scheduled

Payments
[ ] Stripe live keys + webhooks → production URL, sigs validated
[ ] Razorpay live keys + webhooks → production URL, sigs validated
[ ] Real ₹1 INR transaction tested
[ ] Real $1 USD transaction tested

Content
[ ] platform_config seeded with production pricing
[ ] 3+ editors onboarded, is_active=true
[ ] super_admin account created + tested

Deployment
[ ] Vercel SPA fallback configured
[ ] Custom domain + SSL
[ ] robots.txt: disallow /dashboard /editor /admin
[ ] Analytics verified
[ ] Full E2E: signup → subscribe → submit → match → deliver → revise → approve
```
