# UI Revamp — Phase 1a: Marketing System + Index Homepage + Calculator

**Date:** 2026-06-06
**Status:** Approved direction, spec for review
**Depends on:** Phase 0 foundation (tokens, Satoshi/General Sans, shadows, status vars) — merged on `feat/ui-revamp`.

---

## 1. Context & goal

Elevate the public homepage (`/`) to the **Daylight / Cutting Room editorial aesthetic**
from `previews/03-daylight.html` (light) and `previews/02-cutting-room.html` (dark), and
add the **landing-page calculator** the user requested.

Key facts established during exploration:
- All marketing components/pages use **semantic tokens, zero hardcoded hex** — they
  already re-theme via Phase 0. Phase 1 is a **visual elevation**, not a color fix.
- A `pricingStore` (`src/stores/pricingStore.ts`) already fetches live pricing from
  `platform_config` via `get-pricing`. The calculator uses it (CLAUDE.md rule 11).
- The current marketing `PricingSection` hardcodes prices + has quarterly/annual tiers
  not present in `platform_config`. **Reconciling that is deferred to Phase 1b** (Pricing
  page); 1a only re-skins the pricing cards visually.

**Theme strategy (decided):** ONE layout themed via tokens. The Daylight editorial
*structure* is built once; dark mode renders the same DOM in Cutting Room colors. We do
NOT build two per-theme layouts.

**Motion (decided):** reuse existing `src/lib/animations.ts` `motion/react` variants via a
`Reveal` wrapper (`whileInView`). Do NOT port the previews' IntersectionObserver/CSS
`.reveal` (CLAUDE.md rule 14).

---

## 2. Phase 1 decomposition (context)

| Sub-phase | Scope |
|---|---|
| **1a (this spec)** | Marketing editorial primitives + Index homepage rebuild + Calculator |
| 1b | `For{Creators,Brands,Agencies,Editors}` + Pricing page (incl. live-pricing reconciliation) |
| 1c | How-It-Works, About, FAQ, Showcase, Editors, Contact + legal recolor |

---

## 3. Editorial design language → token mapping

Derived from the Daylight/Cutting Room previews, expressed in Phase 0 tokens (so both
themes work from one markup):

| Preview element | Implementation |
|---|---|
| Paper/espresso page bg | `bg-background` |
| White/panel cards | `bg-card` |
| Sand/panelHi nested | `bg-surface-elevated` |
| Ink/cream text | `text-foreground` |
| inkMut/creamMut | `text-muted-foreground` |
| Orange accents/prices | `text-primary` |
| Big soft shadow (light) / flat (dark) | `shadow-soft` / `shadow-lift` |
| `rounded-[2rem]` / `[1.75rem]` cards | `rounded-card-lg` / `rounded-card` |
| Hairline borders | `border border-border` |
| Editorial halo glow | new `.halo` utility (§4.5) |
| Oversized display headline | Satoshi via `font-heading`, large clamp sizes |

Eyebrow labels: `text-xs font-semibold uppercase tracking-[0.18em] text-primary`.

---

## 4. New reusable primitives (`src/components/marketing/`)

Each is small, single-purpose, token-driven, and reused across 1a/1b/1c.

### 4.1 `Section.tsx`
Vertical-rhythm wrapper. Props: `id?`, `className?`, `children`. Renders
`<section className="px-4 py-24 md:py-32 ...">` with a centered `max-w-6xl` container.
Optional `tone?: "default" | "sand"` → adds `bg-surface-elevated/60 border-y border-border`.

### 4.2 `Reveal.tsx`
Scroll-reveal wrapper using existing variants. Props: `variant?: "fadeUp" | "scaleIn"`
(default `fadeUp`), `delay?`, `className?`, `children`. Implementation: a `motion.div`
with `initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}`
and `variants` from `@/lib/animations`. `delay` applied via `transition`. Respects
`prefers-reduced-motion` (motion handles via the media query already in index.css).

### 4.3 `BentoCard.tsx`
The editorial card. Props: `variant?: "default" | "sand" | "primary" | "ink"`,
`className?`, `children`.
- default → `bg-card border border-border rounded-card-lg shadow-lift`
- sand → `bg-surface-elevated border border-border rounded-card-lg`
- primary → `bg-primary text-primary-foreground rounded-card-lg shadow-soft`
- ink → `bg-foreground text-background rounded-card-lg shadow-soft`
Hover (interactive cards): `hover:bg-surface-elevated transition-colors` (default variant).

### 4.4 `EditorialHeading.tsx`
Oversized display heading. Props: `as?: "h1" | "h2"` (default h2), `className?`,
`children`. Renders Satoshi, tight leading/tracking, responsive clamp
(`text-4xl md:text-6xl` for h2; `text-5xl md:text-7xl` for h1). Accent handled by callers
wrapping spans in `text-primary`.

### 4.5 `.halo` utility (in `src/index.css`)
Theme-aware radial glow behind heroes. Light: `radial-gradient(46rem 32rem at 88% -8%,
hsl(var(--primary) / 0.12), transparent 62%)`. Dark: same but `/ 0.14` and warmer spread.
Defined once using the primary token so it flips with theme.

---

## 5. Index homepage rebuild (`src/pages/Index.tsx` + section components)

Rebuild each section's internals to the editorial language using the primitives. **Keep
file names and exports stable** so routing/imports are unchanged. Section order on Index:

1. **Navbar** (`Navbar.tsx`) — polish to floating rounded pill nav (`rounded-2xl bg-card/80
   backdrop-blur border border-border shadow-lift`), keep links + existing `ThemeToggle` +
   auth CTAs. Behavior unchanged.
2. **HeroSection** — pill eyebrow ("Built for people who post daily"), oversized Satoshi
   headline with orange accent line, subcopy, two CTAs (primary "Claim your editor" → an
   existing route, ghost "See how it works" → `#how`), 3 stat chips (48h / 3 revisions /
   100% vetted), and a floating **product card** (BentoCard) with a "Ready to review"
   status pill. Copy mirrors the preview; **no fake metrics** beyond the brand's existing
   claims; representative-UI disclaimer retained.
3. **Problem / Pain bento** — new section `src/components/PainPoints.tsx`: bento grid with
   one large `primary` BentoCard ("~3 workdays a month managing editors") + smaller cards
   (ghosting, the 48-hour lie, style roulette, $50 caption tweak), each with an "Our fix →"
   line. Content from the previews (brand's own claims). If `WhyUsSection` duplicates this
   "why us / pain" content, fold it into `PainPoints` and drop `WhyUsSection` from Index
   (rather than show both); otherwise keep `WhyUsSection` as a lightly-restyled secondary
   section per §5.7.
4. **HowItWorks** (`HowItWorks.tsx`) — 4 numbered steps (Subscribe / Submit a brief / Get
   matched / Approve & post), last step on an `ink` BentoCard. `tone="sand"` Section.
5. **PlanCalculator** (new, §6) — placed directly **before** Pricing so the recommendation
   flows into the cards.
6. **PricingSection** (`PricingSection.tsx`) — re-skin to BentoCards + EditorialHeading +
   Reveal; **keep its current data/billing-toggle logic for 1a** (live-pricing
   reconciliation is 1b). "Most popular" plan on an `ink` card per preview.
7. **Existing secondary sections** (`ShowcaseSection`, `EditorTrustSection`,
   `TestimonialsSection`, `FaqSection`) — apply EditorialHeading + Reveal + BentoCard
   wrappers so they read cohesively. No content changes.
8. **FinalCta** (`FinalCta.tsx`) — full-width `primary` BentoCard, oversized headline,
   single CTA.
9. **Footer** (`Footer.tsx`) — minimal polish (logo lockup, tagline, links) to match.

Two-CTA rule (CLAUDE.md): each section has one primary action; hero's ghost button is
secondary, not primary.

---

## 6. The Calculator

### 6.1 Files
- `src/lib/calculator.ts` — **pure functions + assumption constants** (unit-tested, no DOM).
- `src/components/marketing/PlanCalculator.tsx` — the section UI.

### 6.2 Inputs (UI)
- **Videos per month** — slider + number, range 1–60, default 8.
- **Edit complexity** — segmented control: Basic / Standard / Premium (default Standard).
  (No add-on toggles in v1 — add-on credit values aren't in `platform_config`; YAGNI.)

### 6.3 Pure functions (`calculator.ts`)
```ts
type Complexity = "basic" | "standard" | "premium"
type PlanKey = "quick_sweep" | "deep_clean" | "full_service"

// credits needed per month
creditsNeeded(videos: number, complexity: Complexity, editCosts: EditCosts): number
// = videos * editCosts[complexity]

// smallest plan whose credits >= needed; null if it exceeds the largest plan
recommendPlan(creditsNeeded: number, plans: PricingConfig["plans"]): PlanKey | null

// savings vs freelancer (money + hours), region-aware assumptions
computeSavings(videos: number, planAmountMinor: number, region: "US" | "IN"): {
  freelancerMoney: number   // major units
  planMoney: number         // major units (planAmountMinor / 100)
  moneySaved: number        // max(0, freelancerMoney - planMoney)
  hoursSaved: number
}
```

### 6.4 Assumption constants (transparent, tunable)
```ts
// Brand's own published claims (see previews). Major currency units.
export const FREELANCER_ASSUMPTIONS = {
  US: { perEdit: 55, perRevision: 25, hoursPerVideo: 2, symbol: "$" },
  IN: { perEdit: 1500, perRevision: 600, hoursPerVideo: 2, symbol: "₹" },
}
// freelancerMoney = videos * (perEdit + perRevision)
// hoursSaved      = videos * hoursPerVideo
```
These are documented as candidates for future migration to `platform_config`. The UI shows
the assumptions inline ("Based on $55/edit + $25/revision, ~2 hrs/video") so the savings
number is defensible.

### 6.5 Data source, region, currency
- On mount, read region from `localStorage` (CLAUDE.md §5 stores `{region, currency}`),
  default `"US"`. If `usePricingStore().config` is null, call `fetch(region)`.
- Plan amounts are **minor units** → divide by 100 for display. Currency symbol from region
  (`$` / `₹`).
- While `loading`, show a **skeleton** (no spinner > 3s, CLAUDE.md rule 8).

### 6.6 Output card
A BentoCard showing: credits needed/mo (orange), **recommended plan** name + monthly price,
and a savings line ("Save ~$X/mo and ~Y hours"). A primary CTA ("Start with <plan>")
links to the same destination as the pricing CTAs. If `recommendPlan` returns null (needs
> largest plan), show "Full Service + credit recharges" and a "Talk to us" CTA.

### 6.7 Edge cases / errors
- Pricing fails to load → hide numeric outputs, show "Live pricing unavailable — see plans
  below" + link to `#pricing`. Never surface a raw Supabase error (CLAUDE.md rule 15).
- videos = 0 or NaN → clamp to 1.
- Currency: 1a supports US/IN via existing store; no new gateway logic.

---

## 7. Files created / modified

**Create:**
- `src/components/marketing/Section.tsx`
- `src/components/marketing/Reveal.tsx`
- `src/components/marketing/BentoCard.tsx`
- `src/components/marketing/EditorialHeading.tsx`
- `src/components/marketing/PlanCalculator.tsx`
- `src/lib/calculator.ts`
- `src/lib/calculator.test.ts`
- (maybe) `src/components/PainPoints.tsx` (new pain-point bento section)

**Modify:**
- `src/index.css` (add `.halo` utility)
- `src/pages/Index.tsx` (wire PlanCalculator + any new section order)
- `src/components/{Navbar,HeroSection,HowItWorks,PricingSection,FinalCta,Footer,ShowcaseSection,EditorTrustSection,TestimonialsSection,FaqSection,WhyUsSection}.tsx`
  (restyle internals to editorial language; exports unchanged)

---

## 8. Out of scope (1a)

- For* pages, Pricing page, secondary pages, legal (1b/1c).
- Live-pricing reconciliation of the PricingSection cards / quarterly-annual tiers (1b).
- Add-on credit toggles in the calculator.
- App screens (dashboard/editor/admin), auth, onboarding (later phases).
- New copy beyond the brand's existing/preview claims; no invented metrics.

---

## 9. Acceptance criteria

1. `/` renders the editorial Daylight layout in light mode and the same structure in
   Cutting Room colors in dark mode (toggle), no broken/illegible elements at 1440px & 375px.
2. Headings are oversized Satoshi; sections reveal on scroll via `motion/react` (no
   IntersectionObserver/CSS `.reveal` added).
3. The calculator: changing videos/complexity updates credits-needed, recommended plan +
   price, and savings live; values come from `pricingStore` (not hardcoded); shows a
   skeleton while loading and a graceful fallback if pricing fails.
4. `src/lib/calculator.ts` pure functions are unit-tested (creditsNeeded, recommendPlan
   boundaries incl. the >2500 null case, computeSavings incl. clamp-at-zero).
5. No two primary CTAs in a section; representative-UI disclaimers retained; no fake stats.
6. `bun run build` + `bun run test` pass; no `framer-motion`, no hardcoded hex introduced.

---

## 10. Verification plan

- Unit tests for `calculator.ts` (TDD).
- Build + full test suite green.
- Manual: toggle theme on `/` at 1440px & 375px; exercise the calculator across ranges
  (1, 8, 60 videos × each complexity) and confirm plan boundaries (e.g. Standard×14=980 →
  Full Service; Standard×5=350 → Quick Sweep) and the >2500 fallback.
- `git grep -n "framer-motion\|IntersectionObserver" src` → none.
