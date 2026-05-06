# CLAUDE.md — TheVideoJanitors Full Stack App
# Read this file COMPLETELY before writing a single line of code.
# This is the single source of truth for every decision in this project.
# No exceptions. No shortcuts.

---

## 0. DESIGN INTELLIGENCE SETUP (Do This First, Every Session)

This project uses **open-design** (https://github.com/nexu-io/open-design) as a
design intelligence layer on top of Claude Code. It ships 19 composable Skills
and 71 brand-grade Design Systems — exactly the kind of structured, anti-slop
design machinery this project needs.

### Step 1 — Load the UI skills MCP
```bash
claude mcp add ui-ux-pro-max https://ui-ux-pro-max-skill.nextlevelbuilder.io/
```

### Step 2 — Clone open-design and copy relevant skills into this project
Run once at project setup:
```bash
git clone https://github.com/nexu-io/open-design.git ./tmp-open-design
mkdir -p .claude/skills
cp -r ./tmp-open-design/skills/dashboard         .claude/skills/dashboard
cp -r ./tmp-open-design/skills/mobile-app        .claude/skills/mobile-app
cp -r ./tmp-open-design/skills/mobile-onboarding .claude/skills/mobile-onboarding
cp -r ./tmp-open-design/skills/pricing-page      .claude/skills/pricing-page
cp -r ./tmp-open-design/skills/saas-landing      .claude/skills/saas-landing
rm -rf ./tmp-open-design
```

### Step 3 — Create the TheVideoJanitors DESIGN.md
Create `.claude/design-systems/thevideojanitors/DESIGN.md` using the full spec
in Section 3 of this file. This file is what every open-design skill reads before
generating any output. It overrides any default design system.

### Step 4 — Which skill to read before building each screen
| Screen being built | Read this SKILL.md first |
|---|---|
| Client dashboard | `.claude/skills/dashboard/SKILL.md` |
| Admin panel (any section) | `.claude/skills/dashboard/SKILL.md` |
| Editor dashboard | `.claude/skills/dashboard/SKILL.md` |
| Onboarding (3 steps) | `.claude/skills/mobile-onboarding/SKILL.md` |
| Subscription / pricing screens | `.claude/skills/pricing-page/SKILL.md` |
| Any mobile-optimised view | `.claude/skills/mobile-app/SKILL.md` |
| Landing pages | DO NOT MODIFY — reference only for visual baseline |

### Step 5 — Anti-slop checklist (run before emitting ANY component)
This is the open-design pre-flight. Non-negotiable.

1. Did I read DESIGN.md and the active SKILL.md before writing any code?
2. Are all hex values taken exactly from Section 3? No improvisation.
3. 5-dimensional self-critique (score each 1–5, fix anything under 3):
   - Philosophy: does this look intentional or generic?
   - Hierarchy: is the most important thing most visible?
   - Execution: is the spacing, sizing, alignment precise?
   - Specificity: does this feel like TheVideoJanitors or any SaaS?
   - Restraint: have I removed every element that isn't earning its place?
4. Does every screen answer ONE question with ONE primary action?
5. No fake stats, no invented metrics. Use `—` as a placeholder.

### Also always reference the existing landing pages
`/src/components/` and `/src/pages/` — HeroSection, PricingSection,
WhyUsSection, ForCreators, ForAgencies etc. are the visual baseline.
The app is a continuation of these pages, not a separate product.
Study them before building any app screen.

---

## 1. WHAT THIS PRODUCT IS

TheVideoJanitors is a **managed short-form video editing platform**.

- Clients (creators, brands, agencies) buy monthly credit subscriptions
- They submit video editing requests with raw footage + a structured brief
- The platform auto-matches them with a vetted editor
- The editor delivers the finished edit within 48 hours
- The client reviews, requests revisions (max 3), and approves
- **Credits are deducted at SUBMISSION — not at approval, not at delivery**
- Editors receive weekly payouts after their jobs are approved

**The golden rule for every screen: one question answered, one action available.**

---

## 2. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | **motion** (`motion/react`) — formerly Framer Motion |
| State | Zustand |
| Backend / DB | Supabase (Postgres + Auth + Realtime + Storage) |
| Payments USD | Stripe Billing + Stripe Connect |
| Payments INR | Razorpay Subscriptions + Razorpay Payouts |
| Video | Mux (`@mux/mux-player-react`) |
| Routing | React Router v6 |
| Tables | tanstack/react-table (admin panel) |
| Charts | recharts (editor earnings) |
| Analytics | @vercel/analytics |
| Deployment | Vercel (frontend) + Supabase (backend) |
| Design layer | open-design skills + ui-ux-pro-max MCP |

### Critical package rules
```bash
npm install motion                    # ALWAYS import from "motion/react"
npm install @mux/mux-player-react
npm install zustand
npm install @supabase/supabase-js
npm install @tanstack/react-table
npm install recharts
```
- **NEVER import from `"framer-motion"`** — deprecated. Remove if present. Migrate all imports.
- Razorpay frontend: load script dynamically (do NOT npm install)
- Prices: NEVER hardcoded in components — always from `platform_config` table

---

## 3. THEVIDEOJANITORS DESIGN.md

Save exactly as `.claude/design-systems/thevideojanitors/DESIGN.md`.
Every open-design skill reads this before generating output.

```markdown
# TheVideoJanitors — Design System

## 1. Brand Identity
Name: TheVideoJanitors
Tagline: Clean edits. Fast delivery. No freelancer roulette.
Voice: Direct, confident, no fluff. We respect the creator's time.
Tone: Professional but energetic. Not corporate. Not hypey.
Audience: Creators, agencies, brands who need reliable short-form video editing.
Mode: Dark mode only. No toggle.

## 2. Color System

### Primary Palette (exact values — zero substitutions ever)
--color-bg:       #121212  rgb(18,18,18)     Page background, darkest layer
--color-primary:  #FF5F15  rgb(255,95,21)    CTAs, accents, active states
--color-surface:  #404040  rgb(64,64,64)     Cards, panels, sidebars
--color-fg:       #F9FAFB  rgb(249,250,251)  Primary text, icons on dark

### Derived Tokens
--color-surface-raised: #4A4A4A   Card hover, nested cards
--color-border:         #2A2A2A   All borders and dividers
--color-input:          #1A1A1A   Input backgrounds, code blocks
--color-primary-hover:  #E54E08   Button hover state
--color-primary-muted:  rgba(255,95,21,0.12)  Tags, selections, highlights
--color-text-muted:     #9CA3AF   Labels, timestamps, placeholders
--color-sidebar:        #1A1A1A   Sidebar and nav bg
--color-editor-accent:  #3B82F6   ONLY for editor-side views (blue)

### CSS Custom Properties (:root)
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

### Status Colors (exact — never improvise)
approved:    bg rgba(34,197,94,0.15)   text #4ade80  border rgba(34,197,94,0.3)
in_progress: bg rgba(255,95,21,0.15)  text #FF5F15  border rgba(255,95,21,0.3)
delivered:   bg rgba(59,130,246,0.15) text #60a5fa  border rgba(59,130,246,0.3)
in_revision: bg rgba(234,179,8,0.15)  text #facc15  border rgba(234,179,8,0.3)
overdue:     bg rgba(239,68,68,0.15)  text #f87171  border rgba(239,68,68,0.3)
pending:     bg rgba(64,64,64,0.5)    text #9CA3AF  border #2A2A2A
abandoned:   bg rgba(64,64,64,0.3)    text #9CA3AF  border #2A2A2A

### Color Anti-patterns (never do these)
- Never use #FFFFFF — use #F9FAFB
- Never use #000000 — use #121212
- Never put orange text on a light background
- Never put text below #9CA3AF contrast level on dark bg
- Never introduce a color not listed in this file
- #FF5F15 only on dark surfaces or AS the background
- Prices, stat numbers, credit balances — always text #FF5F15 (orange = premium signal)

## 3. Typography
font-heading: All headings, card titles, stat numbers, prices
font-sans:    All body text, labels, inputs, descriptions
(Defined in existing landing pages. Never add new fonts.)

H1: font-heading text-4xl md:text-5xl font-bold text-[#F9FAFB]
H2: font-heading text-2xl md:text-3xl font-bold text-[#F9FAFB]
H3: font-heading text-xl font-semibold text-[#F9FAFB]
Body: font-sans text-base text-[#F9FAFB]/90 leading-relaxed
Label: font-sans text-xs uppercase tracking-wider text-[#9CA3AF]
Muted: font-sans text-sm text-[#9CA3AF]
Price/Stat: font-heading text-3xl font-bold text-[#FF5F15]

## 4. Spacing & Layout
Mobile minimum: 375px
Container: container mx-auto px-4
Card grid gap: gap-4 mobile, gap-6 desktop
Section padding: py-6 mobile, py-10 desktop
Card padding: p-4 mobile, p-6 desktop

## 5. Component Patterns

Cards:
  bg-[#404040] border border-[#2A2A2A] rounded-xl
  hover: bg-[#4A4A4A] transition-colors duration-150
  No box shadows — flat design only

Primary button:
  bg-[#FF5F15] text-[#121212] font-semibold rounded-lg px-4 py-2
  hover: bg-[#E54E08]
  motion: whileHover={scale:1.02} whileTap={scale:0.97}

Ghost button:
  border border-[#404040] text-[#F9FAFB] bg-transparent rounded-lg
  hover: bg-[#404040]

Danger button:
  bg rgba(239,68,68,0.15) text-red-400 border border-red-500/30

Inputs:
  bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#F9FAFB]
  placeholder: text-[#9CA3AF]
  focus: border-[#FF5F15] ring-1 ring-[#FF5F15]/30

Sidebar nav item (inactive):
  text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#404040]/50 rounded-lg

Sidebar nav item (active):
  bg-[#FF5F15]/10 text-[#FF5F15] border-l-2 border-[#FF5F15] rounded-r-lg

Credit bar:
  Track: bg-[#2A2A2A] rounded-full h-2
  Fill:  bg-[#FF5F15] rounded-full (spring animated width)

Countdown timer:
  > 12h: text-[#FF5F15] font-mono font-bold
  4–12h: text-yellow-400 font-mono font-bold
  < 4h:  text-red-400 font-mono font-bold (add animate-pulse)

Status badge: rounded-full px-3 py-1 text-xs font-medium border
(use status colors from Section 2)

## 6. Animation
Library: motion — import { motion, AnimatePresence } from "motion/react"
Variants file: /src/lib/animations.ts — always import from here, never inline

Easing: ease "easeOut", duration 0.3–0.4s
Page load: staggerContainer + fadeUp (stagger 0.08s)
Page transitions: fadeUp
Modals: scaleIn + AnimatePresence
Drawers: slideInFromRight + AnimatePresence
Bottom sheets (mobile): slideInFromBottom + AnimatePresence
Wizard steps: AnimatePresence + slideInFromRight
Buttons: whileHover scale(1.02), whileTap scale(0.97)
Card hover: whileHover y(-2)
Credit bar: spring animated width
Approve: SVG pathLength 0→1 checkmark (full-screen green)
New message: AnimatePresence + slideInFromBottom
Notification bell: rotate keyframes on new item
Skeletons: opacity [0.5, 1, 0.5] pulse

Never animate: table rows, form validation errors, nav link hover

Performance:
  willChange: "transform" when animating x/y/scale
  willChange: "opacity" when animating opacity
  Use layout prop for size/position changes
  Use staggerChildren in lists, never animate inside map() alone

## 7. Layout Shells

Client Dashboard:
  Desktop: sidebar (bg-[#1A1A1A] w-64 border-r border-[#2A2A2A]) + main content
  Mobile: bottom nav (5 tabs: Home, Requests, Submit, Subscription, Help)
  Header: logo + CreditsDisplay + NotificationBell + avatar dropdown
  Content grid: 1 col mobile, 2 col tablet, 3 col desktop

Editor Dashboard:
  Same structure as client dashboard
  Active nav accent: --color-editor-accent #3B82F6 (blue, not orange)
  Header: logo + earnings this week + NotificationBell + avatar

Admin:
  Sidebar wider (240px), full nav
  Header: "Admin Panel" badge + admin name + role
  No credits display

## 8. Voice & Copy
- Button labels: verb-first ("Submit Request" "Upload Edit" "Approve" "Swap Editor")
- Status: plain English ("Your edit is ready!" not "Deliverable status: READY")  
- Errors: friendly + actionable ("Payment failed — update your card [here]")
- Empty states: motivational ("Ready for your first edit?")
- Countdowns: create urgency — always visible on active jobs
- Never show raw Supabase, Stripe, or Razorpay errors to users

## 9. Anti-patterns (never do these)
- Two primary CTAs on one screen
- Generic purple gradients or glows
- Emoji as UI icons
- Rounded card with left-border-only accent
- Invented metrics or fake stats
- Spinner longer than 3 seconds (use skeleton instead)
- Hardcoded prices in components
- Raw API error messages shown to user
- Inter as a display face (it's a body face)
- Hand-drawn SVG human illustrations
```

---

## 4. USER ROLES & ROUTING

| Role | Value | Route access |
|---|---|---|
| Client | `client` | `/dashboard/*` + `/onboarding` |
| Editor | `editor` | `/editor/*` |
| Super Admin | `super_admin` | `/admin/*` full access |
| Ops Admin | `ops_admin` | `/admin/*` no billing |
| Finance Admin | `finance_admin` | `/admin/*` read-only + payouts |

### Route Guards
```
/dashboard/*    → client only        → /auth/login if unauthed
/editor/*       → editor only        → /auth/login if unauthed
/admin/*        → admin_role ≠ null  → / if unauthorized
/onboarding     → client only, onboarding_complete = false only
/auth/*         → public             → redirect to dashboard if already authed
/ and /for-*    → fully public       → DO NOT MODIFY existing landing pages
```

---

## 5. REGION & PAYMENT GATEWAY

### Detection Logic
```typescript
// On first app load (before signup):
// 1. GET https://ipapi.co/json/
// 2. Store { region, currency } in localStorage
// 3. After signup: write to users.region + users.currency permanently
// 4. Never re-detect after signup — always read from DB
// 5. If ipapi fails → default { region: "US", currency: "USD" }

region === "IN"
  ? { gateway: "razorpay", currency: "INR" }
  : { gateway: "stripe",   currency: "USD" }
```

Gateway is invisible to users.
Indian users see "Secured by Razorpay" badge.
Others see "Secured by Stripe" badge.
Never ask user to choose.

### Stripe (USD — international)
- Subscriptions: Stripe Billing API
- Credit packs: Stripe Checkout one-time payment
- Editor payouts: Stripe Connect
- Webhooks: `payment_intent.succeeded`, `invoice.paid`,
  `customer.subscription.updated`, `customer.subscription.deleted`
- Failed payment auto-retry: 3 attempts → mark `past_due`

### Razorpay (INR — India)
Load frontend script dynamically:
```javascript
const s = document.createElement("script")
s.src = "https://checkout.razorpay.com/v1/checkout.js"
document.body.appendChild(s)
```
- Subscriptions: Razorpay Subscriptions API
- Credit packs: Razorpay Orders API
- Editor payouts: Razorpay Payouts (NEFT / IMPS / UPI)
- Webhooks: `payment.captured`, `subscription.charged`, `subscription.cancelled`
- Both webhook handlers MUST validate signatures before processing

---

## 6. PRICING

**Rule: Prices are NEVER hardcoded in frontend components.**
Always fetch from `/api/pricing?region=IN` (Supabase Edge Function → platform_config).
Cache in `pricingStore` for the session.

### Subscription Plans
| Plan | USD | INR | Credits |
|---|---|---|---|
| Quick Sweep | $99/mo | ₹2,499/mo | 350 |
| Deep Clean | $249/mo | ₹5,999/mo | 950 |
| Full Service | $599/mo | ₹13,999/mo | 2,500 |

### Credit Top-Up Packs
| Pack | USD | INR | Credits |
|---|---|---|---|
| Small | $33 | ₹825 | +100 |
| Medium | $75 | ₹1,875 | +250 (10% off) |
| Large | $140 | ₹3,499 | +500 (13% off) |

### Edit Type Credit Costs (configurable in admin settings)
| Type | Credits |
|---|---|
| Basic | 50 |
| Standard | 70 |
| Premium | 100 |
| Extra aspect ratio | +10 each |

---

## 7. CREDIT RULES

```
CREDITS DEDUCTED AT SUBMISSION. NOT AT APPROVAL. NOT AT DELIVERY.

1. Before rendering submit button:
   Check credits >= edit_cost
   If insufficient → button disabled + tooltip "Need X more credits [Buy Credits]"

2. On submit click:
   → deduct from subscriptions.credits_remaining immediately
   → insert requests row (status = "pending_match")
   → call match-editor Edge Function

3. Editor swap:
   → job transfers to new editor
   → NO new credit deduction (client already paid)

4. Editor fails to deliver:
   → admin manually refunds via admin panel
   → log to admin_actions

5. Client abandons after delivery:
   → no refund (credits already spent)
   → request auto-closes 7 days post-delivery
   → status → "abandoned"

6. Revisions:
   → max 3 per request
   → Edge Function hard-rejects requests beyond round 3
   → UI shows "Last revision. Extra revisions = +10 credits" at round 3

7. Subscription renewal:
   → credits_remaining RESETS to credits_total
   → credits do NOT roll over

8. Credits balance:
   → always visible in dashboard header
   → live via Zustand + Supabase Realtime
```

---

## 8. DATABASE SCHEMA

Write to `/supabase/migrations/001_initial_schema.sql`. Apply exactly.

### `users`
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
email      TEXT UNIQUE NOT NULL
role       TEXT NOT NULL CHECK (role IN ('client','editor','admin'))
region     TEXT NOT NULL DEFAULT 'US' CHECK (region IN ('IN','US'))
currency   TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('INR','USD'))
admin_role TEXT CHECK (admin_role IN ('super_admin','ops_admin','finance_admin'))
created_at TIMESTAMPTZ DEFAULT now()
```

### `client_profiles`
```sql
user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
brand_kit_url       TEXT
brand_colors        JSONB DEFAULT '{}'
content_niches      TEXT[] DEFAULT '{}'
posting_frequency   TEXT
style_preferences   TEXT[] DEFAULT '{}'
reference_video_url TEXT
onboarding_complete BOOLEAN DEFAULT false
created_at          TIMESTAMPTZ DEFAULT now()
updated_at          TIMESTAMPTZ DEFAULT now()
```

### `editor_profiles`
```sql
user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
display_name           TEXT
bio                    TEXT
specialties            TEXT[] DEFAULT '{}'
portfolio_links        TEXT[] DEFAULT '{}'
avg_turnaround_hours   INTEGER DEFAULT 24
rating                 NUMERIC(3,2) DEFAULT 5.0
completed_count        INTEGER DEFAULT 0
max_queue_capacity     INTEGER DEFAULT 5
current_queue_count    INTEGER DEFAULT 0
accepts_repeat_clients BOOLEAN DEFAULT true
bank_details_verified  BOOLEAN DEFAULT false
is_active              BOOLEAN DEFAULT true
unresponsive_count     INTEGER DEFAULT 0
created_at             TIMESTAMPTZ DEFAULT now()
updated_at             TIMESTAMPTZ DEFAULT now()
```

### `subscriptions`
```sql
id                      UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id               UUID REFERENCES users(id) ON DELETE CASCADE
gateway                 TEXT NOT NULL CHECK (gateway IN ('stripe','razorpay'))
gateway_subscription_id TEXT
gateway_customer_id     TEXT
plan                    TEXT NOT NULL
                        CHECK (plan IN ('quick_sweep','deep_clean','full_service'))
credits_total           INTEGER NOT NULL
credits_remaining       INTEGER NOT NULL
currency                TEXT NOT NULL
amount_paid             INTEGER NOT NULL
renews_at               TIMESTAMPTZ
status                  TEXT DEFAULT 'active'
                        CHECK (status IN ('active','cancelled','past_due','trialing'))
created_at              TIMESTAMPTZ DEFAULT now()
updated_at              TIMESTAMPTZ DEFAULT now()
```

### `requests`
```sql
id             UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id      UUID REFERENCES users(id) ON DELETE CASCADE
editor_id      UUID REFERENCES users(id) ON DELETE SET NULL
status         TEXT NOT NULL DEFAULT 'pending_match'
               CHECK (status IN (
                 'pending_match','matched','in_progress',
                 'delivered','in_revision','approved','abandoned'
               ))
edit_type      TEXT NOT NULL CHECK (edit_type IN ('basic','standard','premium'))
credits_cost   INTEGER NOT NULL
brief          JSONB NOT NULL DEFAULT '{}'
footage_url    TEXT
footage_type   TEXT CHECK (footage_type IN ('drive_link','dropbox_link'))
aspect_ratios  TEXT[] DEFAULT '{9:16}'
revision_round INTEGER DEFAULT 0 CHECK (revision_round <= 3)
submitted_at   TIMESTAMPTZ DEFAULT now()
due_at         TIMESTAMPTZ
delivered_at   TIMESTAMPTZ
approved_at    TIMESTAMPTZ
close_after    TIMESTAMPTZ
created_at     TIMESTAMPTZ DEFAULT now()
updated_at     TIMESTAMPTZ DEFAULT now()

CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_editor_id ON requests(editor_id);
CREATE INDEX idx_requests_status    ON requests(status);
```

### Auto-set `close_after` trigger
```sql
CREATE OR REPLACE FUNCTION set_close_after() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.close_after  = now() + INTERVAL '7 days';
    NEW.delivered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_close_after
BEFORE UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION set_close_after();
```

### `deliverables`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
request_id      UUID REFERENCES requests(id) ON DELETE CASCADE
version_number  INTEGER NOT NULL DEFAULT 1
file_url        TEXT
mux_asset_id    TEXT
mux_playback_id TEXT
submitted_by    UUID REFERENCES users(id)
submitted_at    TIMESTAMPTZ DEFAULT now()
status          TEXT DEFAULT 'processing'
                CHECK (status IN ('processing','ready','approved'))

CREATE INDEX idx_deliverables_request_id ON deliverables(request_id);
```

### `revision_comments`
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
deliverable_id    UUID REFERENCES deliverables(id) ON DELETE CASCADE
timestamp_seconds NUMERIC(10,2)
comment           TEXT NOT NULL
created_by        UUID REFERENCES users(id)
created_at        TIMESTAMPTZ DEFAULT now()
```

### `messages`
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
request_id UUID REFERENCES requests(id) ON DELETE CASCADE
sender_id  UUID REFERENCES users(id)
body       TEXT NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
read_at    TIMESTAMPTZ

CREATE INDEX idx_messages_request_id ON messages(request_id);
```

### `editor_payouts`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
editor_id     UUID REFERENCES users(id)
request_id    UUID REFERENCES requests(id)
amount        INTEGER NOT NULL
currency      TEXT NOT NULL
status        TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','paid','failed'))
payout_method TEXT
              CHECK (payout_method IN ('stripe_connect','razorpay_payout','manual'))
paid_at       TIMESTAMPTZ
created_at    TIMESTAMPTZ DEFAULT now()
```

### `notifications`
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id    UUID REFERENCES users(id) ON DELETE CASCADE
message    TEXT NOT NULL
type       TEXT NOT NULL
read       BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT now()
```

### `admin_actions` (audit log — never skip)
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
admin_id    UUID REFERENCES users(id)
action_type TEXT NOT NULL
target_type TEXT NOT NULL
target_id   UUID
notes       TEXT
created_at  TIMESTAMPTZ DEFAULT now()
```

### `platform_config` (all business rules here, not in code)
```sql
key        TEXT PRIMARY KEY
value      JSONB NOT NULL
updated_by UUID REFERENCES users(id)
updated_at TIMESTAMPTZ DEFAULT now()
```

### Seed `platform_config`
```sql
INSERT INTO platform_config (key, value) VALUES
('pricing_usd', '{
  "quick_sweep": {"amount":9900,"credits":350},
  "deep_clean":  {"amount":24900,"credits":950},
  "full_service":{"amount":59900,"credits":2500}
}'),
('pricing_inr', '{
  "quick_sweep": {"amount":249900,"credits":350},
  "deep_clean":  {"amount":599900,"credits":950},
  "full_service":{"amount":1399900,"credits":2500}
}'),
('credit_packs_usd', '{
  "small": {"amount":3300,"credits":100},
  "medium":{"amount":7500,"credits":250},
  "large": {"amount":14000,"credits":500}
}'),
('credit_packs_inr', '{
  "small": {"amount":82500,"credits":100},
  "medium":{"amount":187500,"credits":250},
  "large": {"amount":349900,"credits":500}
}'),
('edit_costs', '{"basic":50,"standard":70,"premium":100,"extra_ratio":10}'),
('rules', '{
  "max_revisions":3,
  "auto_close_days":7,
  "editor_reassign_hours":12,
  "max_active_requests":2
}');
```

### Row Level Security
```sql
-- Enable on all tables
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_payouts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config   ENABLE ROW LEVEL SECURITY;

-- Admins bypass all
CREATE POLICY admin_bypass ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL)
);

-- Clients: own data
CREATE POLICY client_profile  ON client_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY client_subs     ON subscriptions   FOR ALL USING (client_id = auth.uid());
CREATE POLICY client_requests ON requests        FOR ALL USING (client_id = auth.uid());

-- Editors: assigned only
CREATE POLICY editor_requests ON requests        FOR SELECT USING (editor_id = auth.uid());
CREATE POLICY editor_profile  ON editor_profiles FOR ALL    USING (user_id = auth.uid());
CREATE POLICY editor_payouts  ON editor_payouts  FOR SELECT USING (editor_id = auth.uid());

-- Messages: participants only
CREATE POLICY messages_access ON messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_id
    AND (r.client_id = auth.uid() OR r.editor_id = auth.uid())
  )
);

-- Platform config: read all, write admin
CREATE POLICY config_read  ON platform_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY config_write ON platform_config FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL)
);
```

---

## 9. ZUSTAND STORES

### `/src/stores/authStore.ts`
```typescript
interface AuthStore {
  user: User | null
  role: "client" | "editor" | "admin" | null
  region: "US" | "IN"
  currency: "USD" | "INR"
  adminRole: string | null
  setUser: (user: User | null) => void
  clear: () => void
}
```

### `/src/stores/creditsStore.ts`
```typescript
interface CreditsStore {
  balance: number
  total: number
  loading: boolean
  refresh: () => Promise<void>
  deduct: (amount: number) => void  // optimistic update on submit
}
```

### `/src/stores/requestsStore.ts`
```typescript
interface RequestsStore {
  activeRequests: Request[]
  pastRequests: Request[]
  loading: boolean
  refresh: () => Promise<void>
}
```

### `/src/stores/pricingStore.ts`
```typescript
interface PricingStore {
  config: PricingConfig | null
  loading: boolean
  fetch: (region: string) => Promise<void>
}
```

---

## 10. SUPABASE REALTIME

Create `/src/lib/realtime.ts` — all subscriptions managed centrally.

```typescript
// Client request updates
supabase.channel('client-requests')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'requests',
    filter: `client_id=eq.${userId}`
  }, () => requestsStore.refresh())

// Editor queue
supabase.channel('editor-queue')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'requests',
    filter: `editor_id=eq.${userId}`
  }, () => { /* update editor queue */ })

// Chat messages
supabase.channel(`messages-${requestId}`)
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'messages',
    filter: `request_id=eq.${requestId}`
  }, (payload) => { /* append */ })

// Deliverable ready
supabase.channel(`deliverable-${requestId}`)
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'deliverables',
    filter: `request_id=eq.${requestId}`
  }, (payload) => {
    if (payload.new.status === 'ready') { /* notify client */ }
  })
```

---

## 11. EDGE FUNCTIONS

| Function | Purpose |
|---|---|
| `get-pricing` | Returns pricing config for region from platform_config |
| `create-stripe-subscription` | Creates Stripe customer + subscription |
| `stripe-webhook` | Handles all Stripe events (validate signature first) |
| `create-stripe-credit-pack` | One-time Stripe payment |
| `create-razorpay-subscription` | Creates Razorpay subscription |
| `razorpay-webhook` | Handles all Razorpay events (validate signature first) |
| `create-razorpay-order` | One-time Razorpay credit pack |
| `match-editor` | Weighted scoring algorithm, assigns editor |
| `create-mux-asset` | Creates Mux upload URL + returns asset_id |
| `trigger-stripe-payout` | Stripe Connect transfer to editor |
| `trigger-razorpay-payout` | Razorpay bank/UPI payout to Indian editor |
| `run-cron-jobs` | Auto-close abandoned + auto-reassign offline editors |

---

## 12. MATCHING ALGORITHM

`/supabase/functions/match-editor/index.ts`

```typescript
async function matchEditor(requestId: string, excludeEditorId?: string) {
  const request = await getRequest(requestId)
  const client  = await getClientProfile(request.client_id)

  const editors = await supabase.from('editor_profiles').select('*')
    .eq('is_active', true)
    .filter('current_queue_count', 'lt', 'max_queue_capacity')
    .neq('user_id', excludeEditorId ?? '')

  const scored = editors.map(editor => {
    let score = 0
    // Niche match — 40pts
    const matched = editor.specialties.filter(s => client.content_niches.includes(s))
    score += (matched.length / Math.max(client.content_niches.length, 1)) * 40
    // Availability — 20pts
    const load = editor.current_queue_count / editor.max_queue_capacity
    score += load < 0.8 ? 20 : load < 0.9 ? 15 : 5
    // Performance — 10pts
    score += editor.rating >= 4.8 ? 10 : editor.rating >= 4.5 ? 5 : 0
    // Style match — 30pts (default 15 for v1)
    score += 15
    return { editor, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]?.editor
  if (!best) throw new Error('No editors available')

  await supabase.from('requests').update({
    editor_id: best.user_id, status: 'matched',
    due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
  }).eq('id', requestId)

  await supabase.from('editor_profiles')
    .update({ current_queue_count: best.current_queue_count + 1 })
    .eq('user_id', best.user_id)
}
```

### Auto-reassignment (pg_cron, every hour)
```sql
UPDATE requests SET editor_id = NULL, status = 'pending_match'
WHERE status = 'matched' AND updated_at < now() - INTERVAL '12 hours';

UPDATE editor_profiles SET unresponsive_count = unresponsive_count + 1
WHERE user_id IN (SELECT editor_id FROM requests WHERE ...);

UPDATE editor_profiles SET is_active = false WHERE unresponsive_count >= 3;
```

---

## 13. ANIMATION VARIANTS FILE

Create `/src/lib/animations.ts`. Import from here everywhere. Never define inline.

```typescript
import { Variants } from "motion/react"

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
}
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
}
export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:   { opacity: 0, x: 40, transition: { duration: 0.25 } }
}
export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit:   { opacity: 0, y: 30, transition: { duration: 0.2 } }
}
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}
export const staggerFast: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } }
}
```

---

## 14. SCREEN SPECIFICATIONS

### Auth
`/auth/login` — email + password + Google OAuth. On success: read role → redirect.
`/auth/signup` — email + password. Detect region. Create users + client_profiles rows.
  → redirect to `/onboarding/brand-kit`

### Onboarding (3 steps)
Read `.claude/skills/mobile-onboarding/SKILL.md` first.

`/onboarding/brand-kit` — logo upload + color picker + reference video link
  AnimatePresence between steps (slideInFromRight), spring progress bar
`/onboarding/style` — checkbox grid for niches + posting frequency radio
`/onboarding/preferences` — top 3 priorities + reference video link
  "Complete Setup" → onboarding_complete = true → `/dashboard`

### Client Dashboard
Read `.claude/skills/dashboard/SKILL.md` first.

`/dashboard`
- Status card: credits balance (orange + progress bar) + active requests + editor
- Quick actions: [+ Submit New Request] [View Past Edits] [Manage Subscription] [Get Help]
- Requests: Active first → Delivered (action needed) → Approved (collapsed)
- Each card: status badge + editor avatar + relative time + countdown + [View] [Chat]
- Empty state: branded SVG + "Ready for your first edit?" + CTA
- Realtime: subscribe to requests channel → AnimatePresence on status change

### Request Submission
`/dashboard/submit/type` — 3 edit type cards (Basic/Standard/Premium)
  Insufficient credits: red border, unclickable
`/dashboard/submit/footage` — Drive or Dropbox link + URL validation
`/dashboard/submit/brief` — content description + vibe multiselect + captions +
  instructions + reference link + aspect ratios
  Sticky summary bar: cost + balance + Submit button
  On submit: deduct credits → insert request → match-editor → loading → matched card

### Client Review Screen
`/dashboard/review/:requestId`
- Full-width Mux player (`@mux/mux-player-react`)
- Edit details below
- Timestamped comments (Frame.io style): [+ Add Comment] captures currentTime
- [✓ APPROVE] → green pathLength checkmark → download + rating
- [↩ REQUEST REVISION] → disabled if round >= 3 → drawer → increment round
- [↔ SWAP EDITOR] → modal with reasons → reassign, no credit change

### Editor Dashboard
Read `.claude/skills/dashboard/SKILL.md` first.

`/editor/dashboard`
- Earnings card: this week + pending (motion counter on load)
- Queue tabs: [ACTIVE] [QUEUED] [COMPLETED]
- Each item: masked client + edit type + countdown + [Download Footage] [Upload Edit]
- Delivery modal: upload MP4 → Mux → notify client → decrement queue count

### Admin Panel
Read `.claude/skills/dashboard/SKILL.md` first. All actions log to admin_actions.

`/admin` — 4 stat cards + payout summary + activity feed + overdue alert
`/admin/requests` — full table, filters, row actions: reassign/extend/force-approve/refund
`/admin/clients` — table, row actions: adjust credits/change plan/suspend/impersonate
`/admin/editors` — table, row actions: edit profile/suspend/remove/view payouts
`/admin/payouts` — week selector + currency filter + Pay Now / Pay All per currency
`/admin/matching` — pending requests + ranked editor list per request
`/admin/settings` — all platform_config fields, save logs to admin_actions

### Editor Payouts
`/editor/payouts` — earnings breakdown + payout status + recharts chart + history
`/editor/payouts/bank-setup` (INR editors) — bank form + UPI → bank_details_verified = true

---

## 15. SHARED COMPONENT LIBRARY

| Component | Path | Purpose |
|---|---|---|
| `CreditsDisplay` | `/src/components/CreditsDisplay.tsx` | Balance + spring progress bar |
| `CountdownTimer` | `/src/components/CountdownTimer.tsx` | Live HH:MM:SS, color-coded |
| `StatusBadge` | `/src/components/StatusBadge.tsx` | Color pill per status |
| `RequestCard` | `/src/components/RequestCard.tsx` | Client + editor views |
| `StatusTimeline` | `/src/components/StatusTimeline.tsx` | Full journey, animated dots |
| `Chat` | `/src/components/Chat.tsx` | Realtime message thread |
| `NotificationBell` | `/src/components/NotificationBell.tsx` | Bell + history |
| `Skeleton` | `/src/components/Skeleton.tsx` | Animated loading placeholder |
| `AnimatedNumber` | `/src/components/AnimatedNumber.tsx` | Counting animation |
| `EmptyState` | `/src/components/EmptyState.tsx` | Branded empty states |
| `VideoPlayer` | `/src/components/VideoPlayer.tsx` | Mux player wrapper |
| `BriefViewer` | `/src/components/BriefViewer.tsx` | Full brief bottom drawer |

---

## 16. ENVIRONMENT VARIABLES

```bash
# .env.local — never commit real values
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=     # safe to expose (publishable key)
VITE_RAZORPAY_KEY_ID=            # safe to expose (public key)

# Supabase Edge Functions ONLY — never in frontend
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
```

---

## 17. NON-NEGOTIABLE RULES

1. Read DESIGN.md + active SKILL.md before building any screen
2. Run 5-dimensional open-design critique before emitting (philosophy/hierarchy/execution/specificity/restraint)
3. One action per screen — never two primary CTAs
4. Always show job status — client never wonders where their edit is
5. Countdown timers on every active request card
6. Credits balance always visible in dashboard header
7. No loading spinner longer than 3 seconds — use skeleton screens
8. Mobile-first — every layout works at 375px minimum
9. shadcn/ui primitives — never raw `<input>` `<select>` `<button>` tags
10. Prices never hardcoded — always fetch from platform_config
11. Every admin action logs to admin_actions — zero exceptions
12. Revisions enforced in Edge Function — UI is not the gatekeeper
13. motion/react for all animations — never framer-motion, never CSS keyframes
14. Never show raw Supabase/Stripe/Razorpay errors to users
15. Honest placeholders over fake stats — write `—`, not invented numbers

---

## 18. OUT OF SCOPE — DO NOT BUILD IN V1

- Direct file upload in browser (Drive/Dropbox links only)
- Instagram or TikTok post integration
- Mobile native app
- AI-based style matching (weighted scoring only)
- Browse all editors gallery
- Light mode
- Multi-language / i18n

---

## 19. ANALYTICS EVENTS

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

## 20. LAUNCH CHECKLIST

```
Infrastructure
[ ] Supabase production project (separate from dev)
[ ] All migrations applied
[ ] RLS policies verified (test each role manually)
[ ] Edge Functions deployed
[ ] pg_cron scheduled (auto-close + auto-reassign)

Payments
[ ] Stripe live keys in Edge Function env
[ ] Stripe webhooks → production URL, signatures validated
[ ] Razorpay live keys configured
[ ] Razorpay webhooks → production URL, signatures validated
[ ] Real ₹1 INR transaction tested end-to-end
[ ] Real $1 USD transaction tested end-to-end

Content
[ ] platform_config seeded with production pricing
[ ] At least 3 editors onboarded, is_active = true
[ ] super_admin account created and tested
[ ] Help page content written

Deployment
[ ] Vercel deployment with SPA fallback
[ ] Custom domain + SSL
[ ] robots.txt: disallow /dashboard /editor /admin
[ ] vercel.json SPA fallback configured
[ ] Analytics verified
[ ] Error monitoring active
[ ] Full E2E: signup → subscribe → submit → match → deliver → revise → approve
```
