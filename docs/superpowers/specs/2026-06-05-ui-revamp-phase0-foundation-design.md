# UI Revamp — Phase 0: Design Foundation

**Date:** 2026-06-05
**Status:** Approved direction, spec for review
**Owner:** thevideojanitor@gmail.com

---

## 1. Context & goal

Full UI revamp of TheVideoJanitors webapp around two existing landing-page design
directions found in `previews/`:

- **Daylight** (`previews/03-daylight.html`) → drives **light mode** (default)
- **Cutting Room** (`previews/02-cutting-room.html`) → drives **dark mode**

The app is already fully token-based (`hsl(var(--token))` via `tailwind.config.ts`),
with a dark default in `:root` and a light theme under `[data-theme="light"]` in
`src/index.css`, plus an existing `ThemeToggle` component. This means the revamp is
driven primarily from the token layer.

**This spec covers Phase 0 only** — the design foundation every later phase consumes.
It does not rebuild any screen. It re-defines tokens, typography, radii, shadows, and
status-color variants, then verifies them against a few existing screens.

### Note on CLAUDE.md
`CLAUDE.md` §3 states "Dark mode only. No light mode. No toggle." The user has since
shipped a theme toggle and explicitly wants both modes. **User instruction overrides
CLAUDE.md here.** Both light and dark are first-class. The orange `#FF5F15` primary and
the "prices/credits = orange" rule are retained.

---

## 2. Overall phase decomposition (context only)

Each phase is its own spec → plan → build. Phase 0 is the keystone.

| Phase | Scope | Reference |
|---|---|---|
| **0 — Foundation** | Tokens (both palettes), fonts, radii, shadows, status variants, motion | This doc |
| 1 — Marketing | Index + **calculator**, For*, Pricing, How, About, FAQ, Showcase, Editors, Contact, legal | Pixel-match previews |
| 2 — Auth + Onboarding | Login/Signup/Forgot/SelectRole, client + editor onboarding | Same system |
| 3 — Client dashboard | Build **DashboardHome** first → approve → propagate to Submit/Review/Subscription/Help | System (no preview) |
| 4 — Editor | Propagate approved pattern (editor accent `#3B82F6` retained) | System |
| 5 — Admin | Propagate approved pattern | System |

**App-screen rule:** marketing pixel-matches previews; app screens adopt the same
*system* (palette/type/cards/shadows/motion), not the same editorial *layouts*. One
representative dashboard screen is approved before propagation.

---

## 3. Color tokens

Source of truth = hex below. CSS variables are stored as **HSL triples** (existing
convention so `hsl(var(--x))` and `/<alpha>` opacity work).

### 3.1 Light mode = Daylight (`[data-theme="light"]`)

| Token (`--`) | Hex | HSL triple |
|---|---|---|
| `background` | `#FBF7F0` paper | `38 58% 96.3%` |
| `foreground` | `#17150F` ink | `45 21% 7.5%` |
| `card` | `#FFFFFF` | `0 0% 100%` |
| `card-foreground` | `#17150F` | `45 21% 7.5%` |
| `popover` | `#FFFFFF` | `0 0% 100%` |
| `popover-foreground` | `#17150F` | `45 21% 7.5%` |
| `primary` | `#FF5F15` | `19 100% 54.1%` |
| `primary-foreground` | `#FFFFFF` | `0 0% 100%` |
| `secondary` | `#F1EADD` sand | `39 42% 90.6%` |
| `secondary-foreground` | `#17150F` | `45 21% 7.5%` |
| `muted` | `#F1EADD` sand | `39 42% 90.6%` |
| `muted-foreground` | `#6B6657` inkMut | `45 10% 38%` |
| `accent` | `#FF5F15` | `19 100% 54.1%` |
| `accent-foreground` | `#FFFFFF` | `0 0% 100%` |
| `border` | `#E7DECF` line | `38 33% 85.9%` |
| `input` | `#FFFFFF` | `0 0% 100%` |
| `ring` | `#FF5F15` | `19 100% 54.1%` |
| `surface` | `#FFFFFF` card | `0 0% 100%` |
| `surface-elevated` | `#F1EADD` sand | `39 42% 90.6%` |
| `text-muted` | `#6B6657` | `45 10% 38%` |
| `text-secondary` | `#17150F`@~85% | `45 14% 26%` |
| `sidebar-background` | `#F1EADD`-ish | `40 34% 93%` |
| `editor-accent` | `#2563EB` | `221 83% 53%` |

Derived/utility:
- `--primary-hover` → `#E14E08` orangeDk (`19 93% 45.7%`)
- `--gradient-primary` → keep orange gradient (orange → `#FF7A38`)
- `--shadow-card` → **soft + large** (see §5)

### 3.2 Dark mode = Cutting Room (`:root`)

| Token (`--`) | Hex | HSL triple |
|---|---|---|
| `background` | `#15120D` espresso | `38 24% 6.7%` |
| `foreground` | `#F4ECDF` cream | `37 49% 91.6%` |
| `card` | `#1E1A13` panel | `38 22% 9.6%` |
| `card-foreground` | `#F4ECDF` | `37 49% 91.6%` |
| `popover` | `#1E1A13` | `38 22% 9.6%` |
| `popover-foreground` | `#F4ECDF` | `37 49% 91.6%` |
| `primary` | `#FF5F15` | `19 100% 54.1%` |
| `primary-foreground` | `#15120D` | `38 24% 6.7%` |
| `secondary` | `#27221A` panelHi | `37 20% 12.7%` |
| `secondary-foreground` | `#F4ECDF` | `37 49% 91.6%` |
| `muted` | `#27221A` panelHi | `37 20% 12.7%` |
| `muted-foreground` | `#A89B86` creamMut | `37 16% 59.2%` |
| `accent` | `#E8896B` clay | `14 73% 66.5%` |
| `accent-foreground` | `#15120D` | `38 24% 6.7%` |
| `border` | `#342E23` line | `39 20% 17.1%` |
| `input` | `#1A160F` | `40 24% 8.4%` |
| `ring` | `#FF5F15` | `19 100% 54.1%` |
| `surface` | `#1E1A13` panel | `38 22% 9.6%` |
| `surface-elevated` | `#27221A` panelHi | `37 20% 12.7%` |
| `text-muted` | `#A89B86` | `37 16% 59.2%` |
| `text-secondary` | `#A89B86`-light | `37 22% 72%` |
| `sidebar-background` | `#1A160F` | `40 24% 8.4%` |
| `editor-accent` | `#3B82F6` | `217 91% 60%` |

Derived/utility:
- `--primary-hover` → `#E8896B` clay (Cutting Room hovers warm to clay)
- `--shadow-card` → **near-flat** (see §5)

### 3.3 Accent note
Cutting Room's hover/accent is warm **clay** `#E8896B`, not darker orange. To keep one
mental model, `--accent` carries clay in dark and orange in light; primary buttons use
`hover:bg-[hsl(var(--primary-hover))]` which resolves correctly per theme.

---

## 4. Typography

User chose Daylight's font family for both modes. Cutting Room's Zodiak serif is **not**
adopted (keeps headings consistent across theme toggle).

- **Headings:** **Satoshi** (700/900) — Fontshare
- **Body / UI:** **General Sans** (400/500/600) — Fontshare

Changes:
- `src/index.css` `@import` → Fontshare CSS (replaces Google DM Sans/Inter import).
  Keep a system fallback stack.
- `index.html` → add `<link rel="preconnect" href="https://api.fontshare.com">` and the
  Fontshare stylesheet `<link>` for first-paint performance.
- `tailwind.config.ts` `fontFamily` → `heading: ["Satoshi", ...]`, `body: ["General Sans", ...]`.
- `src/index.css` base `font-family` and `h1..h6` → new families.
- Existing `font-heading` / `font-body` utility classes keep working (just remapped).

**Decision:** Self-hosting fonts is out of scope for Phase 0 (Fontshare CDN matches the
previews exactly). Revisit only if a measured performance issue appears.

---

## 5. Radii & shadows (part of the look, not just color)

Previews: light uses big soft shadows + `rounded-[2rem]/[1.75rem]`; dark is near-flat
with hairline borders. App currently `--radius: 0.75rem`.

### Radius tokens
Keep `--radius: 0.75rem` as the shadcn primitive base (buttons/inputs stay usable), and
add **larger card radii** as utilities rather than changing the global primitive:

- `rounded-card` → `1.25rem` (default card)
- `rounded-card-lg` → `2rem` (hero/marketing cards)

Add to `tailwind.config.ts` `borderRadius`. App cards migrate to `rounded-card` as their
screens are rebuilt (later phases); Phase 0 only defines them.

### Shadow tokens (theme-aware via CSS var)
Define in `src/index.css`; values differ per theme:

- Light: `--shadow-soft: 0 30px 70px -28px rgba(23,21,15,0.22)` ·
  `--shadow-lift: 0 18px 40px -20px rgba(23,21,15,0.20)`
- Dark: `--shadow-soft: 0 24px 60px -30px rgba(0,0,0,0.55)` ·
  `--shadow-lift: 0 1px 0 0 rgba(255,255,255,0.03)` (near-flat; rely on borders)
- `--shadow-card` remaps to `--shadow-lift` per theme.

Expose as Tailwind `boxShadow: { soft, lift }` utilities.

---

## 6. Status colors — light-mode variants (critical)

`CLAUDE.md` §3 status colors are rgba overlays tuned for `#121212`; on `#FBF7F0` paper
they wash out. `StatusBadge` (`src/components/StatusBadge.tsx`) is used on every
dashboard, so it needs per-theme variants.

Approach: drive status styling from CSS variables that flip with theme, OR define a
`light:` variant set in the component. Preferred: **CSS variables** so other surfaces
(timelines, cards) can reuse them.

Define both sets (bg/text/border) for: `approved`, `in_progress`, `delivered`,
`in_revision`, `overdue`, `pending`, `abandoned`.

- **Dark** = existing CLAUDE.md §3 values (unchanged).
- **Light** = same hues, re-tuned for paper: stronger text (e.g. green `#15803D`,
  amber `#B45309`, blue `#1D4ED8`, red `#B91C1C`), ~12–18% tint backgrounds, ~30–40%
  borders. Exact values finalized during implementation against the paper bg and
  checked for AA contrast.

The orange `in_progress` continues to use brand `#FF5F15` family in both modes.

---

## 7. Motion

Reuse existing `src/lib/animations.ts` (`motion/react` variants: `fadeUp`, `scaleIn`,
`slideInFromRight/Bottom`, `staggerContainer`). **Do not** port the previews'
IntersectionObserver/CSS `.reveal` (CLAUDE.md rule 14: `motion/react` only). Phase 1 maps
preview reveal effects onto these existing variants. Phase 0 adds no new motion code;
it just confirms the variants still read well on both new backgrounds.

---

## 8. Files touched in Phase 0

| File | Change |
|---|---|
| `src/index.css` | Rewrite `:root` (Cutting Room) + `[data-theme="light"]` (Daylight) token blocks; new font `@import`; shadow vars; status-color vars |
| `index.html` | Fontshare preconnect + stylesheet links |
| `tailwind.config.ts` | `fontFamily` (Satoshi/General Sans); `borderRadius` card sizes; `boxShadow` soft/lift |
| `src/components/StatusBadge.tsx` | Consume theme-aware status vars (light variants) |
| `src/components/ThemeToggle.tsx` | Verify default = light for new visitors; confirm persistence |

No screen layouts change in Phase 0.

---

## 9. Out of scope (Phase 0)

- Any page/screen layout rebuild (Phases 1–5).
- The landing-page calculator (Phase 1).
- Self-hosting fonts.
- Removing/altering the bokeh auth background (revisited in Phase 2).
- Changing business logic, routes, data, or copy.

---

## 10. Acceptance criteria

1. Toggling theme flips the entire app between Daylight (light) and Cutting Room (dark)
   palettes with no hardcoded-color regressions on spot-checked screens.
2. ~~New visitors default to **light** mode~~ **REVISED:** new visitors default to
   **dark** (Cutting Room) and light is opt-in via the toggle/saved preference; choice
   persists across reloads. Rationale: ~36 app screens contain ~1,700 hardcoded dark hex
   utilities that ignore the token swap and render broken on the light paper background.
   Shipping light-as-default before those screens are rebuilt (Phases 1–5) would ship a
   broken default. The default flips back to light as a final step once screens are
   light-ready. (Foundation tokens/fonts/status all built and intact.)
3. Headings render in **Satoshi**, body in **General Sans**, both modes; no FOUT on a
   normal load (preconnect in place).
4. Cards/buttons/inputs show correct radii; light surfaces show soft shadows, dark
   surfaces read near-flat with hairline borders.
5. `StatusBadge` is legible (AA contrast) on **both** `#FBF7F0` and `#15120D`.
6. `npm run build` (or `bun run build`) passes; no TypeScript/Tailwind errors.
7. Verified by toggling theme on at least 3 existing screens (a marketing page, an auth
   page, a dashboard screen) — captured as before/after observation.

---

## 11. Verification plan

- Build passes.
- Manual toggle check on Index, LoginPage, DashboardHome at 1440px and 375px.
- Contrast check on StatusBadge variants in both themes.
- No `framer-motion` imports introduced; no CSS keyframe reveal added.
