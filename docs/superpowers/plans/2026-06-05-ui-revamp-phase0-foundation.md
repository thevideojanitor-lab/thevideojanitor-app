# UI Revamp — Phase 0: Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-theme the entire token layer so the app renders in the Daylight palette (light, default) and Cutting Room palette (dark), with Satoshi/General Sans fonts, theme-aware radii/shadows, and legible status badges in both modes — without changing any screen layout.

**Architecture:** The app is token-based (`hsl(var(--token))` in `tailwind.config.ts`). We rewrite the two CSS variable blocks in `src/index.css` (`:root` = dark Cutting Room, `[data-theme="light"]` = light Daylight), add status-color + shadow variables to both, swap fonts via Fontshare, extend Tailwind with new font/shadow/radius utilities, flip the default theme to light, and make `StatusBadge` consume the new status variables.

**Tech Stack:** React 18 + TypeScript + Vite, Tailwind CSS, Zustand, vitest, motion/react. Fonts via Fontshare CDN.

**Spec:** `docs/superpowers/specs/2026-06-05-ui-revamp-phase0-foundation-design.md`

**Branch:** `feat/ui-revamp` (already created)

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `index.html` | Fontshare preconnect + stylesheet for first paint | Modify |
| `src/index.css` | All theme tokens (color, status, shadow) + font import | Modify |
| `tailwind.config.ts` | Font families, `boxShadow` soft/lift, card radii | Modify |
| `src/stores/themeStore.ts` | Default theme = light for new visitors | Modify |
| `src/stores/themeStore.test.ts` | Guards default-light behavior | Create |
| `src/components/StatusBadge.tsx` | Consume theme-aware status vars | Modify |
| `src/components/StatusBadge.test.tsx` | Guards status rendering + token usage | Create |

A note on TDD for design tokens: color/shadow values cannot be meaningfully asserted by jsdom (it does not resolve CSS variables to computed colors). So automated tests cover **behavioral** invariants (default theme, status mapping, presence of required tokens in source). **Visual correctness is verified manually** via the theme toggle on real screens (Task 7). This is called out per step.

---

## Task 1: Swap fonts to Satoshi + General Sans

**Files:**
- Modify: `index.html:1-45` (head)
- Modify: `src/index.css:1` (font import) and `:117-119` (heading font)
- Modify: `tailwind.config.ts:16-19` (fontFamily)

- [ ] **Step 1: Add Fontshare links to `index.html` head**

In `index.html`, immediately after line 5 (`<meta name="viewport" ... />`), insert:

```html
    <link rel="preconnect" href="https://api.fontshare.com" />
    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,900&f[]=general-sans@400,500,600&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Replace the Google Fonts import in `src/index.css`**

Replace line 1:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:wght@300;400;500;600;700&display=swap');
```

with:

```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,900&f[]=general-sans@400,500,600&display=swap');
```

- [ ] **Step 3: Update base font families in `src/index.css`**

Change the `:root` base font (line ~56) from:

```css
    font-family: 'Inter', sans-serif;
```

to:

```css
    font-family: 'General Sans', ui-sans-serif, system-ui, sans-serif;
```

And change the headings rule (lines ~117-119) from:

```css
  h1, h2, h3, h4, h5, h6 {
    font-family: 'DM Sans', sans-serif;
  }
```

to:

```css
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  }
```

Also update the two utility classes (lines ~122-128) from `'DM Sans'`/`'Inter'`:

```css
  .font-heading {
    font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  }
  .font-body {
    font-family: 'General Sans', ui-sans-serif, system-ui, sans-serif;
  }
```

- [ ] **Step 4: Update Tailwind `fontFamily`**

In `tailwind.config.ts`, replace lines 16-19:

```ts
      fontFamily: {
        heading: ['"DM Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
```

with:

```ts
      fontFamily: {
        heading: ['"Satoshi"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"General Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
```

- [ ] **Step 5: Verify build**

Run: `bun run build`
Expected: build succeeds, no errors.

- [ ] **Step 6: Commit**

```bash
git add index.html src/index.css tailwind.config.ts
git commit -m "feat(ui): swap fonts to Satoshi + General Sans (Fontshare)"
```

---

## Task 2: Rewrite dark-mode tokens to Cutting Room (`:root`)

**Files:**
- Modify: `src/index.css:8-54` (the `:root` token block)

- [ ] **Step 1: Replace the `:root` color tokens**

Replace the existing variable declarations inside `:root` (lines ~9-54, from `--background:` through `--editor-accent:`, leaving the trailing `font-family` line from Task 1 in place) with:

```css
    /* ── Cutting Room — dark mode (default theme tokens) ── */
    --background: 38 24% 6.7%;
    --foreground: 37 49% 91.6%;

    --card: 38 22% 9.6%;
    --card-foreground: 37 49% 91.6%;

    --popover: 38 22% 9.6%;
    --popover-foreground: 37 49% 91.6%;

    --primary: 19 100% 54.1%;
    --primary-foreground: 38 24% 6.7%;
    --primary-hover: 19 93% 45.7%;

    --secondary: 37 20% 12.7%;
    --secondary-foreground: 37 49% 91.6%;

    --muted: 37 20% 12.7%;
    --muted-foreground: 37 16% 59.2%;

    --accent: 14 73% 66.5%;
    --accent-foreground: 38 24% 6.7%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 39 20% 17.1%;
    --input: 40 24% 8.4%;
    --ring: 19 100% 54.1%;

    --radius: 0.75rem;

    --sidebar-background: 40 24% 8.4%;
    --sidebar-foreground: 37 49% 91.6%;
    --sidebar-primary: 19 100% 54.1%;
    --sidebar-primary-foreground: 38 24% 6.7%;
    --sidebar-accent: 37 20% 12.7%;
    --sidebar-accent-foreground: 37 49% 91.6%;
    --sidebar-border: 39 20% 17.1%;
    --sidebar-ring: 19 100% 54.1%;

    --surface: 38 22% 9.6%;
    --surface-elevated: 37 20% 12.7%;
    --text-muted: 37 16% 59.2%;
    --text-secondary: 37 22% 72%;
    --gradient-primary: linear-gradient(135deg, hsl(19, 100%, 54.1%), hsl(24, 90%, 60%));
    --shadow-card: var(--shadow-lift);
    --editor-accent: 217 91% 60%;

    /* status colors — dark (CLAUDE.md §3) */
    --status-approved-bg: rgba(34,197,94,0.15);    --status-approved-fg: #4ade80;  --status-approved-border: rgba(34,197,94,0.3);
    --status-in_progress-bg: rgba(255,95,21,0.15); --status-in_progress-fg: #FF5F15; --status-in_progress-border: rgba(255,95,21,0.3);
    --status-delivered-bg: rgba(59,130,246,0.15);  --status-delivered-fg: #60a5fa;  --status-delivered-border: rgba(59,130,246,0.3);
    --status-in_revision-bg: rgba(234,179,8,0.15); --status-in_revision-fg: #facc15; --status-in_revision-border: rgba(234,179,8,0.3);
    --status-overdue-bg: rgba(239,68,68,0.15);     --status-overdue-fg: #f87171;    --status-overdue-border: rgba(239,68,68,0.3);
    --status-pending-bg: rgba(168,155,134,0.10);   --status-pending-fg: #A89B86;    --status-pending-border: rgba(168,155,134,0.22);
    --status-abandoned-bg: rgba(168,155,134,0.06); --status-abandoned-fg: #A89B86;  --status-abandoned-border: rgba(168,155,134,0.18);

    /* shadows — dark = near-flat, rely on borders */
    --shadow-soft: 0 24px 60px -30px rgba(0,0,0,0.55);
    --shadow-lift: 0 1px 0 0 rgba(255,255,255,0.03);
```

(Keep the `font-family: 'General Sans' ...` line from Task 1 as the last line inside `:root`.)

- [ ] **Step 2: Verify build**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 3: Visual smoke (manual)**

Run: `bun run dev`, open `http://localhost:5173/`, confirm dark mode shows a warm espresso background (not the old pure-black) and cream text. Toggling to light still works (light retuned in Task 3).

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(ui): dark-mode tokens -> Cutting Room palette + status/shadow vars"
```

---

## Task 3: Rewrite light-mode tokens to Daylight (`[data-theme="light"]`)

**Files:**
- Modify: `src/index.css:60-105` (the `[data-theme="light"]` block)

- [ ] **Step 1: Replace the `[data-theme="light"]` token block**

Replace the entire body of `[data-theme="light"] { ... }` (the variable lines between the braces) with:

```css
    /* ── Daylight — light mode ── */
    --background: 38 58% 96.3%;
    --foreground: 45 21% 7.5%;

    --card: 0 0% 100%;
    --card-foreground: 45 21% 7.5%;

    --popover: 0 0% 100%;
    --popover-foreground: 45 21% 7.5%;

    --primary: 19 100% 54.1%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 19 93% 45.7%;

    --secondary: 39 42% 90.6%;
    --secondary-foreground: 45 21% 7.5%;

    --muted: 39 42% 90.6%;
    --muted-foreground: 45 10% 38%;

    --accent: 19 100% 54.1%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 86% 56%;
    --destructive-foreground: 0 0% 100%;

    --border: 38 33% 85.9%;
    --input: 0 0% 100%;
    --ring: 19 100% 54.1%;

    --sidebar-background: 40 34% 93%;
    --sidebar-foreground: 45 21% 7.5%;
    --sidebar-primary: 19 100% 54.1%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 39 42% 90.6%;
    --sidebar-accent-foreground: 45 21% 7.5%;
    --sidebar-border: 38 33% 85.9%;
    --sidebar-ring: 19 100% 54.1%;

    --surface: 0 0% 100%;
    --surface-elevated: 39 42% 90.6%;
    --text-muted: 45 10% 38%;
    --text-secondary: 45 14% 26%;
    --gradient-primary: linear-gradient(135deg, hsl(19, 100%, 54.1%), hsl(24, 100%, 60%));
    --shadow-card: var(--shadow-lift);

    --editor-accent: 221 83% 53%;

    /* status colors — light, retuned for paper bg */
    --status-approved-bg: rgba(34,197,94,0.14);    --status-approved-fg: #15803D;  --status-approved-border: rgba(34,197,94,0.35);
    --status-in_progress-bg: rgba(255,95,21,0.12); --status-in_progress-fg: #E14E08; --status-in_progress-border: rgba(255,95,21,0.35);
    --status-delivered-bg: rgba(59,130,246,0.12);  --status-delivered-fg: #1D4ED8;  --status-delivered-border: rgba(59,130,246,0.35);
    --status-in_revision-bg: rgba(234,179,8,0.16); --status-in_revision-fg: #B45309; --status-in_revision-border: rgba(234,179,8,0.4);
    --status-overdue-bg: rgba(239,68,68,0.12);     --status-overdue-fg: #B91C1C;    --status-overdue-border: rgba(239,68,68,0.35);
    --status-pending-bg: rgba(107,102,87,0.10);    --status-pending-fg: #6B6657;    --status-pending-border: rgba(107,102,87,0.3);
    --status-abandoned-bg: rgba(107,102,87,0.06);  --status-abandoned-fg: #6B6657;  --status-abandoned-border: rgba(107,102,87,0.22);

    /* shadows — light = soft + large */
    --shadow-soft: 0 30px 70px -28px rgba(23,21,15,0.22);
    --shadow-lift: 0 18px 40px -20px rgba(23,21,15,0.20);
```

- [ ] **Step 2: Verify build**

Run: `bun run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(ui): light-mode tokens -> Daylight palette + status/shadow vars"
```

---

## Task 4: Expose shadow + card-radius utilities in Tailwind

**Files:**
- Modify: `tailwind.config.ts:70-74` (borderRadius) and `:20` area (add boxShadow under `extend`)

- [ ] **Step 1: Add card radii to `borderRadius`**

In `tailwind.config.ts`, replace the `borderRadius` block (lines ~70-74):

```ts
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
```

with:

```ts
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "1.25rem",
        "card-lg": "2rem",
      },
```

- [ ] **Step 2: Add `boxShadow` utilities**

In `tailwind.config.ts`, inside `theme.extend` (e.g. immediately after the `borderRadius` block), add:

```ts
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
```

- [ ] **Step 3: Verify build + utilities generate**

Run: `bun run build`
Expected: build succeeds. (The `shadow-soft`, `shadow-lift`, `rounded-card`, `rounded-card-lg` classes are now available for later phases.)

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(ui): add shadow-soft/lift + card radius utilities"
```

---

## Task 5: Default new visitors to light mode

**Files:**
- Modify: `src/stores/themeStore.ts:18-19`
- Create: `src/stores/themeStore.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/stores/themeStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest"

describe("themeStore default", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
  })

  it("defaults a brand-new visitor (no saved pref) to light", async () => {
    // fresh import so module-init default logic re-runs
    const mod = await import("./themeStore?test-default")
    expect(mod.useThemeStore.getState().theme).toBe("light")
  })

  it("respects a saved dark preference", async () => {
    localStorage.setItem("theme", "dark")
    const mod = await import("./themeStore?test-saved")
    expect(mod.useThemeStore.getState().theme).toBe("dark")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- themeStore`
Expected: FAIL — first test gets `"dark"` (current default), expected `"light"`.

- [ ] **Step 3: Change the default**

In `src/stores/themeStore.ts`, change line 18-19 from:

```ts
const initial: Theme =
  (typeof localStorage !== "undefined" ? (localStorage.getItem("theme") as Theme) : null) ?? "dark"
```

to:

```ts
const initial: Theme =
  (typeof localStorage !== "undefined" ? (localStorage.getItem("theme") as Theme) : null) ?? "light"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- themeStore`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/stores/themeStore.ts src/stores/themeStore.test.ts
git commit -m "feat(ui): default new visitors to light (Daylight) mode"
```

---

## Task 6: Make StatusBadge theme-aware

**Files:**
- Modify: `src/components/StatusBadge.tsx`
- Create: `src/components/StatusBadge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/StatusBadge.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import StatusBadge from "./StatusBadge"

describe("StatusBadge", () => {
  it("renders the human label for a status", () => {
    const { getByRole } = render(<StatusBadge status="approved" />)
    expect(getByRole("status").textContent).toContain("Approved")
  })

  it("uses CSS-variable tokens (theme-aware) rather than hardcoded hex", () => {
    const { getByRole } = render(<StatusBadge status="delivered" />)
    const el = getByRole("status") as HTMLElement
    expect(el.style.backgroundColor).toContain("var(--status-delivered-bg)")
    expect(el.style.color).toContain("var(--status-delivered-fg)")
    expect(el.style.borderColor).toContain("var(--status-delivered-border)")
  })

  it("maps unknown status to the pending tone", () => {
    const { getByRole } = render(<StatusBadge status="weird_value" />)
    const el = getByRole("status") as HTMLElement
    expect(el.style.backgroundColor).toContain("var(--status-pending-bg)")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- StatusBadge`
Expected: FAIL — current component uses hardcoded hex/rgba, not `var(--status-*)`.

- [ ] **Step 3: Rewrite `StatusBadge.tsx` to use tokens**

Replace the full contents of `src/components/StatusBadge.tsx` with:

```tsx
import { motion, AnimatePresence } from "motion/react"
import type { RequestStatus } from "@/lib/supabase"

// status -> { label, tone }. `tone` selects the CSS-variable group
// (--status-<tone>-bg/-fg/-border) defined per-theme in src/index.css.
const STATUS_CONFIG: Record<string, { label: string; tone: string }> = {
  approved:      { label: "Approved",       tone: "approved" },
  in_progress:   { label: "In Progress",    tone: "in_progress" },
  delivered:     { label: "Review Ready",   tone: "delivered" },
  in_revision:   { label: "In Revision",    tone: "in_revision" },
  overdue:       { label: "Overdue",        tone: "overdue" },
  pending_match: { label: "Finding Editor", tone: "pending" },
  matched:       { label: "Matched",        tone: "pending" },
  abandoned:     { label: "Abandoned",      tone: "abandoned" },
}

interface Props {
  status: RequestStatus | string
  pulse?: boolean
}

export default function StatusBadge({ status, pulse }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending_match"]
  const { tone } = cfg

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        role="status"
        aria-label={`Status: ${cfg.label}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${pulse ? "animate-pulse" : ""}`}
        style={{
          backgroundColor: `var(--status-${tone}-bg)`,
          color: `var(--status-${tone}-fg)`,
          borderColor: `var(--status-${tone}-border)`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: `var(--status-${tone}-fg)` }}
        />
        {cfg.label}
      </motion.span>
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- StatusBadge`
Expected: PASS (all three tests).

- [ ] **Step 5: Verify build + full test run**

Run: `bun run build && bun run test`
Expected: build succeeds, all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/StatusBadge.tsx src/components/StatusBadge.test.tsx
git commit -m "feat(ui): StatusBadge consumes theme-aware status tokens (light+dark)"
```

---

## Task 7: Verification pass (manual visual + acceptance)

**Files:** none (verification only; may produce a follow-up fix commit if a regression is found)

- [ ] **Step 1: Build + tests green**

Run: `bun run build && bun run test`
Expected: both succeed.

- [ ] **Step 2: Manual toggle check on three screens**

Run: `bun run dev`. In the browser, visit each and toggle theme (header `ThemeToggle`), at 1440px and 375px widths:
1. `/` (Index — marketing)
2. `/auth/login` (LoginPage — auth)
3. `/dashboard` (DashboardHome — requires a logged-in client; if no test account, substitute any one dashboard route reachable in dev)

Confirm for each:
- Light = warm paper bg `#FBF7F0`, ink text; Dark = espresso `#15120D`, cream text.
- Headings render in Satoshi, body in General Sans (no fallback serif/Times).
- No element is invisible (e.g. white-on-white or orange-on-paper low contrast).

- [ ] **Step 3: StatusBadge contrast check**

On a screen that shows a `StatusBadge` (or temporarily render all 7 tones), confirm each tone is legible (text clearly readable) on **both** paper and espresso backgrounds. Spot-check approved/in_progress/delivered/in_revision/overdue/pending/abandoned.

- [ ] **Step 4: Anti-regression checks**

Run: `git grep -n "framer-motion" src` → Expected: no output (no framer-motion introduced).
Confirm no CSS `.reveal`/IntersectionObserver code was added to the app (previews' technique stays out per CLAUDE.md rule 14).

- [ ] **Step 5: Record verification observation**

Note in the PR/commit description: screens checked, both widths, both themes, result. If a regression was found and fixed, commit it:

```bash
git add -A
git commit -m "fix(ui): <regression> found during Phase 0 verification"
```

---

## Self-Review

**Spec coverage:**
- §3 color tokens → Tasks 2 (dark) + 3 (light) ✓
- §4 typography → Task 1 ✓
- §5 radii + shadows → Task 4 (utilities) + shadow vars in Tasks 2/3 ✓
- §6 status light variants → Tasks 2/3 (vars) + 6 (component) ✓
- §7 motion (reuse, no new code) → Task 7 Step 4 anti-regression ✓
- §8 files touched → all covered (index.css, index.html, tailwind.config.ts, StatusBadge, themeStore) ✓
- Spec §8 listed `ThemeToggle.tsx` for "verify default=light"; the default actually lives in `themeStore.ts` → handled in Task 5 (correct location). No ThemeToggle change needed.
- §10 acceptance criteria → Task 7 ✓

**Placeholder scan:** No TBD/TODO; all code blocks complete; status values concrete.

**Type/name consistency:** `tone` keys (`approved`, `in_progress`, `delivered`, `in_revision`, `overdue`, `pending`, `abandoned`) match the `--status-<tone>-*` variables defined in both `:root` and `[data-theme="light"]`. `pending_match` and `matched` both map to tone `pending`; `--status-pending-*` exists in both blocks. ✓

**Note on test imports:** Task 5 uses query-suffixed dynamic imports (`./themeStore?test-default`) to force Vite/vitest to re-run module-init default logic per case. If the vitest resolver rejects the query suffix, fall back to `vi.resetModules()` + `await import("./themeStore")` in each case.
