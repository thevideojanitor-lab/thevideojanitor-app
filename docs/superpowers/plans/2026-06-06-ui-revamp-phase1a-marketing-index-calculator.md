# UI Revamp — Phase 1a: Marketing System + Index + Calculator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public homepage (`/`) in the Daylight/Cutting Room editorial aesthetic using reusable token-driven primitives, and add a live-pricing landing-page calculator (plan estimator + savings-vs-freelancer).

**Architecture:** One layout themed via Phase 0 tokens (Daylight structure, Cutting Room colors in dark). New `src/components/marketing/` primitives encode the look; existing section components are restyled to use them while keeping their functional wiring (TallyModal CTAs, ThemeToggle, billing logic). The calculator is split into a pure, unit-tested `src/lib/calculator.ts` and a `PlanCalculator.tsx` view that reads `pricingStore`.

**Tech Stack:** React 18 + TS + Vite, Tailwind (Phase 0 tokens), motion/react, Zustand (`pricingStore`), vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-06-06-ui-revamp-phase1a-marketing-index-calculator-design.md`
**Visual references (the pixel spec):** `previews/03-daylight.html` (light), `previews/02-cutting-room.html` (dark). Map every literal color to a token via spec §3.
**Branch:** `feat/ui-revamp`.

---

## Conventions for restyle tasks

For tasks that restyle an existing section to match a preview:
1. Open the referenced preview file + line range — it is the authoritative layout/copy.
2. Reproduce that section's structure/copy in the component, **translating every hardcoded
   color to a Phase 0 token** per spec §3 (e.g. `bg-card`/`text-paper`→`text-primary-foreground`,
   `text-inkMut`→`text-muted-foreground`, `bg-orange`→`bg-primary`, `rounded-[2rem]`→`rounded-card-lg`).
3. **Preserve existing functional wiring**: keep current imports/props for `TallyModal`,
   `Link`, `Button` variants (`hero`/`hero-outline`), `ThemeToggle`, billing state, SEO.
   Do not change routes, modal URLs, or analytics.
4. Wrap reveal animations with the `Reveal` primitive (Task 1) — never add IntersectionObserver
   or CSS `.reveal`.
5. No invented stats; keep representative-UI disclaimers.

Each restyle task verifies with `bun run build` and a manual note; the calculator/primitives have unit tests.

---

## Task 1: Marketing primitives + `.halo` utility

**Files:**
- Create: `src/components/marketing/Section.tsx`, `Reveal.tsx`, `BentoCard.tsx`, `EditorialHeading.tsx`
- Modify: `src/index.css` (append `.halo` utility)
- Test: `src/components/marketing/marketing-primitives.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/marketing/marketing-primitives.test.tsx`:
```tsx
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import Section from "./Section"
import BentoCard from "./BentoCard"
import EditorialHeading from "./EditorialHeading"
import Reveal from "./Reveal"

describe("marketing primitives", () => {
  it("Section renders children inside a <section> with an id", () => {
    const { container, getByText } = render(<Section id="pricing">hi</Section>)
    expect(container.querySelector("section#pricing")).toBeTruthy()
    expect(getByText("hi")).toBeTruthy()
  })

  it("BentoCard applies the primary variant classes", () => {
    const { getByTestId } = render(<BentoCard variant="primary" data-testid="c">x</BentoCard>)
    expect(getByTestId("c").className).toContain("bg-primary")
    expect(getByTestId("c").className).toContain("rounded-card-lg")
  })

  it("EditorialHeading renders an h1 when as=h1", () => {
    const { container } = render(<EditorialHeading as="h1">Big</EditorialHeading>)
    expect(container.querySelector("h1")).toBeTruthy()
  })

  it("Reveal renders its children", () => {
    const { getByText } = render(<Reveal>shown</Reveal>)
    expect(getByText("shown")).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- marketing-primitives`
Expected: FAIL (modules don't exist).

- [ ] **Step 3: Create the primitives**

`src/components/marketing/Section.tsx`:
```tsx
import { ReactNode } from "react"

interface Props {
  id?: string
  tone?: "default" | "sand"
  className?: string
  children: ReactNode
}

export default function Section({ id, tone = "default", className = "", children }: Props) {
  const toneCls = tone === "sand" ? "bg-surface-elevated/60 border-y border-border" : ""
  return (
    <section id={id} className={`px-4 py-24 md:py-32 ${toneCls} ${className}`}>
      <div className="max-w-6xl mx-auto w-full">{children}</div>
    </section>
  )
}
```

`src/components/marketing/Reveal.tsx`:
```tsx
import { ReactNode } from "react"
import { motion } from "motion/react"
import { fadeUp, scaleIn } from "@/lib/animations"

interface Props {
  variant?: "fadeUp" | "scaleIn"
  delay?: number
  className?: string
  children: ReactNode
}

export default function Reveal({ variant = "fadeUp", delay = 0, className, children }: Props) {
  const variants = variant === "scaleIn" ? scaleIn : fadeUp
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
```

`src/components/marketing/BentoCard.tsx`:
```tsx
import { ReactNode } from "react"

interface Props {
  variant?: "default" | "sand" | "primary" | "ink"
  className?: string
  children: ReactNode
  [key: string]: unknown
}

const VARIANTS: Record<string, string> = {
  default: "bg-card border border-border rounded-card-lg shadow-lift",
  sand: "bg-surface-elevated border border-border rounded-card-lg",
  primary: "bg-primary text-primary-foreground rounded-card-lg shadow-soft",
  ink: "bg-foreground text-background rounded-card-lg shadow-soft",
}

export default function BentoCard({ variant = "default", className = "", children, ...rest }: Props) {
  return (
    <div className={`${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </div>
  )
}
```

`src/components/marketing/EditorialHeading.tsx`:
```tsx
import { ReactNode } from "react"

interface Props {
  as?: "h1" | "h2"
  className?: string
  children: ReactNode
}

export default function EditorialHeading({ as = "h2", className = "", children }: Props) {
  const size = as === "h1" ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl"
  const Tag = as
  return (
    <Tag className={`font-heading font-bold leading-[0.95] tracking-tight ${size} ${className}`}>
      {children}
    </Tag>
  )
}
```

- [ ] **Step 4: Append the `.halo` utility to `src/index.css`**

At the END of `src/index.css`, append:
```css

/* ── Editorial halo glow (marketing) — theme-aware via --primary ── */
.halo {
  background: radial-gradient(46rem 32rem at 88% -8%, hsl(var(--primary) / 0.12), transparent 62%);
}
[data-theme="light"] .halo {
  background: radial-gradient(46rem 32rem at 88% -8%, hsl(var(--primary) / 0.12), transparent 62%);
}
```
(Dark uses `:root`'s `.halo`; both reference the primary token so the glow flips with theme.)

- [ ] **Step 5: Run tests + build**

Run: `bun run test -- marketing-primitives` → PASS (4).
Run: `bun run build` → succeeds.

- [ ] **Step 6: Commit**
```bash
git add src/components/marketing src/index.css
git commit -m "feat(mkt): editorial primitives (Section/Reveal/BentoCard/EditorialHeading) + halo"
```

---

## Task 2: Calculator pure logic (`src/lib/calculator.ts`) — TDD

**Files:**
- Create: `src/lib/calculator.ts`, `src/lib/calculator.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/calculator.test.ts`:
```ts
import { describe, it, expect } from "vitest"
import { creditsNeeded, recommendPlan, computeSavings, FREELANCER_ASSUMPTIONS } from "./calculator"

const editCosts = { basic: 50, standard: 70, premium: 100, extra_ratio: 10 }
const plans = {
  quick_sweep: { amount: 9900, credits: 350 },
  deep_clean: { amount: 24900, credits: 950 },
  full_service: { amount: 59900, credits: 2500 },
}

describe("creditsNeeded", () => {
  it("multiplies videos by per-edit credits", () => {
    expect(creditsNeeded(8, "standard", editCosts)).toBe(560)
    expect(creditsNeeded(0, "basic", editCosts)).toBe(50) // clamps videos to >=1
  })
})

describe("recommendPlan", () => {
  it("picks the smallest plan whose credits cover the need", () => {
    expect(recommendPlan(350, plans)).toBe("quick_sweep")
    expect(recommendPlan(351, plans)).toBe("deep_clean")
    expect(recommendPlan(980, plans)).toBe("full_service")
    expect(recommendPlan(2500, plans)).toBe("full_service")
  })
  it("returns null when need exceeds the largest plan", () => {
    expect(recommendPlan(2501, plans)).toBeNull()
  })
})

describe("computeSavings", () => {
  it("US: freelancer money minus plan, hours saved, clamped at zero", () => {
    const r = computeSavings(8, 24900, "US")
    expect(r.planMoney).toBe(249)
    expect(r.freelancerMoney).toBe(8 * (55 + 25)) // 640
    expect(r.moneySaved).toBe(640 - 249)           // 391
    expect(r.hoursSaved).toBe(16)
  })
  it("never returns negative savings", () => {
    const r = computeSavings(1, 59900, "US") // tiny freelancer cost vs big plan
    expect(r.moneySaved).toBe(0)
  })
  it("uses INR assumptions for region IN", () => {
    expect(FREELANCER_ASSUMPTIONS.IN.symbol).toBe("₹")
    const r = computeSavings(4, 599900, "IN")
    expect(r.freelancerMoney).toBe(4 * (1500 + 600)) // 8400
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- calculator`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `src/lib/calculator.ts`**

```ts
import type { EditCosts, PricingConfig } from "@/stores/pricingStore"

export type Complexity = "basic" | "standard" | "premium"
export type PlanKey = "quick_sweep" | "deep_clean" | "full_service"
export type Region = "US" | "IN"

// Brand's own published claims (see previews). Major currency units.
// Candidates for future migration to platform_config.
export const FREELANCER_ASSUMPTIONS: Record<
  Region,
  { perEdit: number; perRevision: number; hoursPerVideo: number; symbol: string }
> = {
  US: { perEdit: 55, perRevision: 25, hoursPerVideo: 2, symbol: "$" },
  IN: { perEdit: 1500, perRevision: 600, hoursPerVideo: 2, symbol: "₹" },
}

const PLAN_ORDER: PlanKey[] = ["quick_sweep", "deep_clean", "full_service"]

export function creditsNeeded(videos: number, complexity: Complexity, editCosts: EditCosts): number {
  const v = Number.isFinite(videos) && videos >= 1 ? Math.floor(videos) : 1
  return v * editCosts[complexity]
}

export function recommendPlan(needed: number, plans: PricingConfig["plans"]): PlanKey | null {
  for (const key of PLAN_ORDER) {
    if (plans[key].credits >= needed) return key
  }
  return null
}

export function computeSavings(videos: number, planAmountMinor: number, region: Region) {
  const v = Number.isFinite(videos) && videos >= 1 ? Math.floor(videos) : 1
  const a = FREELANCER_ASSUMPTIONS[region]
  const freelancerMoney = v * (a.perEdit + a.perRevision)
  const planMoney = Math.round(planAmountMinor / 100)
  const moneySaved = Math.max(0, freelancerMoney - planMoney)
  const hoursSaved = v * a.hoursPerVideo
  return { freelancerMoney, planMoney, moneySaved, hoursSaved }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- calculator`
Expected: PASS (all).

- [ ] **Step 5: Commit**
```bash
git add src/lib/calculator.ts src/lib/calculator.test.ts
git commit -m "feat(mkt): pure calculator logic (credits/plan/savings) + tests"
```

---

## Task 3: `PlanCalculator.tsx` view

**Files:**
- Create: `src/components/marketing/PlanCalculator.tsx`
- Test: `src/components/marketing/PlanCalculator.test.tsx`

**Context:** Reads `usePricingStore()` (`src/stores/pricingStore.ts`: `config`, `loading`,
`fetch(region)`). `config.plans[key].amount` is **minor units**; `config.editCosts` has
basic/standard/premium. Region from `localStorage` (`region` key set per CLAUDE.md §5),
default `"US"`. Plan display names: quick_sweep→"Quick Sweep", deep_clean→"Deep Clean",
full_service→"Full Service".

- [ ] **Step 1: Write the failing test**

Create `src/components/marketing/PlanCalculator.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { usePricingStore } from "@/stores/pricingStore"
import PlanCalculator from "./PlanCalculator"

const config = {
  plans: {
    quick_sweep: { amount: 9900, credits: 350 },
    deep_clean: { amount: 24900, credits: 950 },
    full_service: { amount: 59900, credits: 2500 },
  },
  creditPacks: { small: { amount: 3300, credits: 100 }, medium: { amount: 7500, credits: 250 }, large: { amount: 14000, credits: 500 } },
  editCosts: { basic: 50, standard: 70, premium: 100, extra_ratio: 10 },
  rules: { max_revisions: 3, auto_close_days: 7, editor_reassign_hours: 12, max_active_requests: 2 },
}

describe("PlanCalculator", () => {
  beforeEach(() => {
    localStorage.clear()
    usePricingStore.setState({ config, loading: false })
  })

  it("shows a recommended plan and credits for the default inputs", () => {
    render(<PlanCalculator />)
    // default 8 videos x standard(70) = 560 -> deep_clean
    expect(screen.getByText(/Deep Clean/i)).toBeTruthy()
    expect(screen.getByText(/560/)).toBeTruthy()
  })

  it("updates the recommendation when videos change", () => {
    render(<PlanCalculator />)
    const slider = screen.getByLabelText(/videos per month/i) as HTMLInputElement
    fireEvent.change(slider, { target: { value: "40" } }) // 40x70=2800 -> exceeds 2500 -> fallback
    expect(screen.getByText(/recharge|Talk to us|Full Service/i)).toBeTruthy()
  })

  it("shows a graceful fallback when pricing is unavailable", () => {
    usePricingStore.setState({ config: null, loading: false })
    render(<PlanCalculator />)
    expect(screen.getByText(/pricing unavailable/i)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- PlanCalculator`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement `PlanCalculator.tsx`**

Requirements (build to satisfy the tests + spec §6):
- `useState`: `videos` (default 8), `complexity` (default "standard").
- On mount: read `region` from `localStorage.getItem("region")` (`"IN"` or else `"US"`);
  if `usePricingStore.getState().config` is null and not loading, call `fetch(region)`.
- If `loading` → render skeleton placeholders (pulsing `bg-muted` blocks; CLAUDE.md rule 8).
- If `config` is null (after load attempt) → render the fallback: text containing
  "Live pricing unavailable" + a link to `#pricing`.
- Else compute with Task 2 helpers: `needed = creditsNeeded(videos, complexity, config.editCosts)`,
  `plan = recommendPlan(needed, config.plans)`, and when `plan` is non-null
  `savings = computeSavings(videos, config.plans[plan].amount, region)`.
- Inputs UI: a range `<input type="range" min={1} max={60}>` with
  `aria-label="Videos per month"` bound to `videos`; a segmented control of three buttons
  Basic/Standard/Premium setting `complexity`.
- Output: a `BentoCard` showing `needed` credits (in `text-primary`), the recommended plan
  display name + monthly price (`config.plans[plan].amount/100` with `region==="IN" ? "₹" : "$"`),
  and a savings line: `Save ~{symbol}{savings.moneySaved}/mo and ~{savings.hoursSaved} hours`,
  with an assumptions caption ("Based on {symbol}{perEdit}/edit + {symbol}{perRevision}/revision, ~{hoursPerVideo} hrs/video").
  Pull the symbol/assumptions from `FREELANCER_ASSUMPTIONS[region]`.
- When `plan` is null (need > 2500): show "Full Service + credit recharges" and a CTA
  labelled "Talk to us" (Link to `/contact`) instead of a plan price/savings.
- Wrap the section in `Section id="calculator"` + `EditorialHeading` ("Estimate your plan")
  + `Reveal`. Primary CTA "Start with {plan}" → reuse the pricing CTA pattern (a `TallyModal`
  with `WAITLIST_URL` like FinalCta, or a `Link`/`Button variant="hero"` — match how
  PricingSection's CTA links; keep it a single primary action).
- All colors via tokens; no hardcoded hex.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- PlanCalculator`
Expected: PASS (3).

- [ ] **Step 5: Build + commit**
```bash
bun run build
git add src/components/marketing/PlanCalculator.tsx src/components/marketing/PlanCalculator.test.tsx
git commit -m "feat(mkt): live-pricing PlanCalculator (estimator + savings)"
```

---

## Task 4: Restyle `HeroSection.tsx` (editorial hero)

**Files:** Modify `src/components/HeroSection.tsx`
**Reference:** `previews/03-daylight.html` lines 57–117 (hero + floating product card).

- [ ] **Step 1: Read** the current `src/components/HeroSection.tsx` and the reference range.
- [ ] **Step 2: Rebuild** the hero per the reference using primitives (Task 1) and tokens (spec §3):
  pill eyebrow, `EditorialHeading as="h1"` with an orange (`text-primary`) accent line,
  subcopy in `text-muted-foreground`, a primary CTA + a secondary ghost link (`#how`),
  three stat chips (48h / 3 revisions in / 100% vetted), and a floating product
  `BentoCard` with a "Ready to review" status pill and a representative-UI disclaimer.
  Add `className="halo relative"` to the hero wrapper. Preserve any existing CTA wiring
  (TallyModal/Links/Button variants) — if the current hero uses TallyModal, keep it for the
  primary CTA. Use `Reveal` for entrance animation.
- [ ] **Step 3:** `bun run build` → succeeds. Manually confirm hero renders in both themes.
- [ ] **Step 4: Commit** `git commit -am "feat(mkt): editorial hero section"`

---

## Task 5: New `PainPoints.tsx` bento section

**Files:** Create `src/components/PainPoints.tsx`
**Reference:** `previews/03-daylight.html` lines 119–170 (pain-point bento).

- [ ] **Step 1: Build** a `Section` with an eyebrow ("The old way is exhausting"),
  `EditorialHeading` ("Everything you hate about hiring editors."), and a
  `grid md:grid-cols-6 gap-4` bento using `BentoCard`s, reproducing the reference cards:
  one large `variant="primary"` card ("~3 workdays a month managing editors" + "Our fix")
  spanning `md:col-span-3 md:row-span-2`, plus the ghosting / 48-hour-lie (`variant="sand"`)
  / style-roulette / $50-caption cards, each with an "Our fix →" line in `text-primary`.
  Copy verbatim from the reference. Tokens only. Wrap cards in `Reveal`.
- [ ] **Step 2:** `bun run build` → succeeds.
- [ ] **Step 3: Commit** `git add src/components/PainPoints.tsx && git commit -m "feat(mkt): pain-point bento section"`

---

## Task 6: Restyle `HowItWorks.tsx`

**Files:** Modify `src/components/HowItWorks.tsx`
**Reference:** `previews/03-daylight.html` lines 172–186 (4-step grid).

- [ ] **Step 1: Rebuild** as `Section tone="sand"` with centered eyebrow ("The new way") +
  `EditorialHeading` ("Four steps. Then it just shows up.") + a `grid md:grid-cols-4 gap-4`
  of step `BentoCard`s (01 Subscribe / 02 Submit a brief / 03 Get matched), the 4th step
  ("Approve & post") on `variant="ink"`. Numbers in `text-primary`. Preserve any existing
  copy/props. `Reveal` per card with staggered `delay`.
- [ ] **Step 2:** `bun run build` → succeeds.
- [ ] **Step 3: Commit** `git commit -am "feat(mkt): editorial how-it-works"`

---

## Task 7: Restyle `PricingSection.tsx` (visual only; keep logic)

**Files:** Modify `src/components/PricingSection.tsx`
**Reference:** `previews/03-daylight.html` lines 188–220 (pricing cards).

- [ ] **Step 1: Restyle** the existing section to BentoCards + `EditorialHeading` + `Reveal`,
  per the reference, **keeping ALL existing logic** (the `plans` array, billing toggle,
  `getPrice`/`getSavings`, credit explainer, recharge banner, CTA `Link`s/`Button`s). The
  "Most popular" plan uses `variant="ink"` with an orange price; others `variant="default"`.
  Do not change prices or data in 1a (live-pricing reconciliation is Phase 1b). Tokens only.
- [ ] **Step 2:** `bun run build` → succeeds; confirm billing toggle still works.
- [ ] **Step 3: Commit** `git commit -am "feat(mkt): editorial pricing cards (logic unchanged)"`

---

## Task 8: Restyle `FinalCta.tsx`, `Navbar.tsx`, `Footer.tsx`

**Files:** Modify `src/components/FinalCta.tsx`, `Navbar.tsx`, `Footer.tsx`
**References:** Daylight preview — final CTA lines 222–234, nav lines 36–55, footer lines 236–245.

- [ ] **Step 1: FinalCta** → a full-width `BentoCard variant="primary"` with an oversized
  `EditorialHeading` and a single primary CTA. **Keep** the existing `TallyModal` wiring and
  URLs (`WAITLIST_URL`); reduce to one primary action (move "Apply as Editor" to a secondary
  ghost link if retained). Disclaimer line kept.
- [ ] **Step 2: Navbar** → floating pill: `rounded-2xl bg-card/80 backdrop-blur border border-border shadow-lift`,
  keep all links, the existing `ThemeToggle`, and auth/CTA buttons + their routes.
- [ ] **Step 3: Footer** → logo lockup + tagline ("Clean edits. Fast delivery. No freelancer
  roulette.") + existing links, tokenized. No link changes.
- [ ] **Step 4:** `bun run build` → succeeds; confirm ThemeToggle still toggles.
- [ ] **Step 5: Commit** `git commit -am "feat(mkt): editorial final CTA, nav pill, footer"`

---

## Task 9: Restyle secondary sections (cohesion pass)

**Files:** Modify `src/components/{ShowcaseSection,EditorTrustSection,TestimonialsSection,FaqSection}.tsx`
(and `WhyUsSection.tsx` only if NOT folded into PainPoints — see Task 10).

- [ ] **Step 1:** For each, wrap the section in `Section`, replace the heading with
  `EditorialHeading` + an eyebrow, convert card-like elements to `BentoCard`, and wrap
  reveals with `Reveal`. **No content/data/logic changes** — purely swapping wrappers/classes
  to tokens + primitives so they read cohesively with Tasks 4–8. Keep all existing props,
  data arrays, accordions (FAQ), and links.
- [ ] **Step 2:** `bun run build` → succeeds.
- [ ] **Step 3: Commit** `git commit -am "feat(mkt): cohesion pass on secondary homepage sections"`

---

## Task 10: Wire `Index.tsx` + full verification

**Files:** Modify `src/pages/Index.tsx`

- [ ] **Step 1: Decide WhyUs:** open `src/components/WhyUsSection.tsx`. If its content
  duplicates the new `PainPoints` (pain/why-us), remove `WhyUsSection` from `Index.tsx` and
  delete the import; otherwise keep it (restyled in Task 9). Record the decision in the commit.
- [ ] **Step 2: Update `Index.tsx`** section order to:
  `Navbar, HeroSection, PainPoints, HowItWorks, PlanCalculator, PricingSection,
  ShowcaseSection, EditorTrustSection, TestimonialsSection, FaqSection, FinalCta, Footer`
  (drop WhyUs if folded). Add the imports for `PainPoints` and `PlanCalculator`.
- [ ] **Step 3: Build + full test**

Run: `bun run build` → succeeds.
Run: `bun run test` → all pass.

- [ ] **Step 4: Anti-regression**

Run: `git grep -n "framer-motion" src` → none.
Run: `git grep -nE "IntersectionObserver|classList\\.add\\(\"in\"\\)" src` → none.
Run: count hardcoded hex in changed marketing files — should remain 0:
`git grep -coE "(bg|text|border|from|to|via)-\\[#" src/components/marketing src/components/PainPoints.tsx` → 0s.

- [ ] **Step 5: Manual verification (note results)**
  - Toggle theme on `/` at 1440px and 375px — editorial layout, no broken/illegible elements.
  - Calculator: try 1 / 8 / 40 videos × Basic/Standard/Premium; confirm plan boundaries
    (Standard×5=350→Quick Sweep; Standard×8=560→Deep Clean; Standard×40=2800→fallback) and
    savings update; confirm skeleton on first load and graceful fallback if offline.

- [ ] **Step 6: Commit** `git commit -am "feat(mkt): assemble editorial Index homepage + calculator"`

---

## Self-Review

**Spec coverage:**
- §3 token mapping → applied in every restyle task (conventions block) ✓
- §4 primitives + halo → Task 1 ✓
- §5 Index sections (nav/hero/pain/how/calc/pricing/secondary/cta/footer) → Tasks 4–10 ✓
- §6 calculator (pure logic, view, region/currency, skeleton, fallback, >2500) → Tasks 2 & 3 ✓
- §7 files → all created/modified across tasks ✓
- §9 acceptance (themes, motion, live pricing, unit tests, one-CTA, build/test) → Tasks 1–3, 10 ✓

**Placeholder scan:** Restyle tasks (4–9) intentionally reference the preview line ranges +
the §3 token map rather than re-transcribing ~250 lines of JSX — the previews ARE the pixel
spec, so pointing at them is more accurate than copying. The deterministic/testable units
(primitives, calculator, PlanCalculator behavior) have full code/explicit behavior + tests.

**Type/name consistency:** `Complexity`/`PlanKey`/`Region`, `creditsNeeded`/`recommendPlan`/
`computeSavings`, `FREELANCER_ASSUMPTIONS`, and `EditCosts`/`PricingConfig` (imported from
`pricingStore`) are used identically in Tasks 2 & 3. BentoCard `variant` values
(default/sand/primary/ink) match across Tasks 1, 5, 6, 7, 8.

**Note:** Tasks 4–9 are creative restyles; the subagent-driven reviews should check token
usage (no hardcoded hex), preserved functional wiring (TallyModal/routes/billing), and
fidelity to the referenced preview section — not exact byte-for-byte markup.
