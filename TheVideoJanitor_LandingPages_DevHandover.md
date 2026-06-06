# TheVideoJanitor — Landing Pages Build & Handover Spec
**For: developer (building with Claude Code)**
**Prepared: 2026-06-02** · Source of truth for the LinkedIn-campaign landing pages.
Companion docs: `TheVideoJanitor_GTM_Playbook.md` (research/strategy), `TheVideoJanitor_FreshData_Brief_2026-06-01.md`.

---

## 0. TL;DR for the developer

Build **two new standalone landing pages** on the existing site, matched to its design system, with **no main nav and a single conversion goal each**:

1. **`/lp/backlog`** — "Backlog Calculator" (interactive lead magnet). Highest priority.
2. **`/lp/agencies`** — "Agency White-Label" (book-a-call / pilot offer).

Both convert via a **gated free-edit offer**: a short qualify form (no credit card). These pages receive cold traffic from a LinkedIn connection-request campaign, so they must be fast, distraction-free, and trustworthy.

**Before driving any traffic**, fix the credibility blockers in §3 (fake testimonials, empty Showcase, inconsistent stats). These are launch blockers, not nice-to-haves — the target market is defined by distrust of editing services, so any "tell" of fakeness kills conversion.

Each page section below has: spec → copy → behavior → a paste-ready **Claude Code prompt**.

---

## 1. Context & strategy (why these pages exist)

The target buyers were researched from real Reddit threads (r/editors, r/videography, r/SocialMediaMarketing, r/NewTubers, r/Upwork). Key findings driving this build:

- **Trust is the wedge.** Verbatim: *"80% of the freelancers who bid are scammers,"* *"most just suck or have their own agenda."* → We lead with risk-reversal (free first edit, no card) and transparent process, never hype.
- **Editing kills the joy / eats the week.** *"video editing… zaps the joy out of the content creation process,"* *"10 hours a week editing."*
- **Backlog overwhelm is a distinct, acute pain.** *"2 years of travels I've yet to edit and with a new baby I've become super overwhelmed."* → This is the Backlog Calculator's exact target.
- **Agencies fear quality variance & reputation risk.** *"everyone calls themselves a video editor now… that doesn't make them good."* → White-label, per-client style specs, revision SLA.

**Campaign mechanics:** LinkedIn connection requests (≤300 chars) carry a one-line proposition + a short link to the matching LP. The note opens; **the LP closes.** Links must NOT point to the homepage or pricing page.

---

## 2. Design system (match the existing site exactly)

Pulled from the live site. Use these as design tokens so the LPs look native.

```
/* Color tokens */
--bg:            #121212;   /* page background (near-black) */
--surface:       #1A1A1A;   /* cards / raised sections */
--surface-2:     #262626;   /* borders, secondary surfaces */
--text:          #F9FAFB;   /* primary text (off-white) */
--text-muted:    #A3A3A3;   /* secondary text (gray) */
--text-dim:      #BFBFBF;   /* tertiary */
--accent:        #FF5F15;   /* brand orange — CTAs, highlights */
--accent-soft:   rgba(255,95,21,0.10);  /* orange tints / glows */
--success:       #22C55E;   /* checkmarks, positive */
```

- **Font:** `Inter, sans-serif` (already loaded site-wide). Headings heavy weight (700–800), tight leading; body 400–500.
- **Buttons:** primary = solid `--accent` with white text, rounded (~8–10px), bold; secondary = transparent with `--surface-2` border.
- **Aesthetic:** dark, high-contrast, generous spacing, subtle orange glow behind hero. Logo wordmark "The**Video**Janitors" (the word "Video" is orange).
- **CRITICAL — animations:** The current site uses scroll-reveal (elements start at `opacity:0`). On the live site this leaves large blank areas for fast scrollers/crawlers and broke a full-page render of the Showcase. **For these LPs, content must be visible by default** — if using scroll/fade-in, set a fallback so elements are visible without JS and within ~300ms; never gate critical copy/CTA behind an intersection observer that can fail.

**Layout rules for ALL campaign LPs:**
- **No global navigation bar.** Top-left: logo only (links to `/`). No menu, no "Apply as Editor."
- **One primary CTA**, repeated 2–3× down the page. No competing links.
- **Minimal footer:** copyright + Privacy/Terms links only.
- Mobile-first; most LinkedIn clicks are mobile. Single column on mobile, max content width ~1100px on desktop.
- Target Lighthouse perf ≥ 90; no render-blocking media; lazy-load below-fold images only (with visible placeholders).

---

## 3. ⛔ Credibility blockers — FIX BEFORE TRAFFIC

These exist on the current site and will actively cost conversions with a distrust-driven audience. **Treat as launch blockers.**

**3.1 Fabricated / contradictory testimonials (highest severity)**
- The same three names appear on the homepage and `/for-agencies` with *different* jobs:
  - "Sarah Chen — Content Creator, 200K followers" (home) vs "Sarah Chen — Founder, Bright Agency" (agencies)
  - "Marcus Rivera — Founder, Bolt Agency" vs "Marcus Rivera — Creative Director, Acme Marketing"
  - "Priya Patel — E-commerce Manager, NovaBrand" vs "Priya Patel — Operations Lead, Neon Digital"
- Editor names (Alex Kim, Maria Santos, Jordan Davis) are reused as both "featured editors" and editor testimonials.
- **Action:** Until real testimonials exist, REMOVE attributed testimonials or replace with non-attributed, verifiable proof (sample before/after work, the guarantee block, the vetting process). One real quote (even from a free-trial user) beats three fake ones. Never reuse a name across pages.

**3.2 Empty Showcase (high severity)**
- `/showcase` renders blank below the hero — the before/after toggle and all content-type sections show no media. The homepage mid-sections show the same blank-void behavior.
- **Action:** Populate with **real** before/after sample clips (even 4–6). Verify media actually loads and is visible without scroll-reveal. The Showcase is the single most persuasive asset for a craft sale — it cannot be empty when the campaign runs.

**3.3 Inconsistent / inflated stats (medium severity)**
- Editor count is "50+" (About) and "100+" (Home/Editors). "Trusted by 50+ / 30+ / 100+" vary by page.
- **Action:** Use real numbers. Pre-launch, prefer honest framing ("now onboarding our founding editors") over inflated counts. Distrustful buyers punish round-number puffery.

**3.4 Credits obscure value (medium severity)**
- Pricing makes buyers do math (350 credits, Basic=50, Standard=70…). The promise is "simple."
- **Action:** On every plan card, add plain-language **"≈ X finished videos/month."** Keep credits as billing internals.

**3.5 Stale legal date (low severity)**
- Legal pages say "Last updated: January 2025" but footer is "© 2026."
- **Action:** Reconcile dates.

---

## 4. Shared technical requirements (both LPs)

**4.1 Routing & isolation**
- New routes `/lp/backlog` and `/lp/agencies`. Exclude from main nav/sitemap-nav. Add `<meta name="robots" content="noindex">` optional (campaign pages); confirm with owner.

**4.2 Lead capture — the gated free-edit offer**
The free trial is **free but light-qualified** (no credit card). Form fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Full name | text | yes | |
| Work/email | email | yes | validate format |
| Niche / content type | select | yes | Creator/Podcast/Ecom/Agency/Other |
| Posting volume | select | yes | <1/wk, 1–2/wk, 3–5/wk, daily |
| Link to footage | url | no | Google Drive / Dropbox link (NO file upload in v1 — match the site's existing "share a Drive link" pattern; avoids upload infra) |
| (LP-2 only) Backlog hours | hidden | auto | pre-filled from calculator result |
| (LP-3 only) Agency name + # clients | text/select | yes | |
| UTM fields | hidden | auto | see 4.4 |

- **Submission:** `POST /api/leads`. Behavior: (a) persist lead (DB or Google Sheet), (b) email notification to `hello@thevideojanitor.com`, (c) return success → show thank-you state. If no backend yet, fall back to **Formspree/Basin** endpoint configurable via env var `LEADS_ENDPOINT`.
- **Thank-you state** (inline, no redirect): confirm + set expectations: *"Got it. We'll review and send your free edit within 48 hours. Check {email}."* For LP-3: link to a Calendly (env var `CALENDLY_URL`) for an optional call.
- **Spam:** honeypot field + basic rate limit. No captcha in v1 (friction).

**4.3 Analytics & events**
- Fire to existing analytics (GA4/Plausible — confirm which). Events: `lp_view`, `calculator_complete` (LP-2), `lead_submit` (with `lp` + `icp` params), `calendly_click` (LP-3).

**4.4 UTM capture**
- On load, read `utm_source, utm_medium, utm_campaign, utm_content` from query string → store in hidden form fields and a first-party cookie (30d). Campaign uses e.g.:
  `?utm_source=linkedin&utm_medium=connection&utm_campaign=backlog_jun26&utm_content=creator`

**4.5 Accessibility & quality**
- Semantic headings (one `<h1>`), labeled inputs, focus states, color-contrast AA (orange on dark passes for large text; check small text). Keyboard-operable calculator.

---

## 5. LP-2 — Backlog Calculator (`/lp/backlog`) ⭐ priority

**Goal:** Backlogged creators (ICP B) compute how much unedited footage is costing them in time/money, then convert on "first 5 clips free."

**Page sections (top → bottom):**

1. **Hero**
   - Eyebrow: `FOR CREATORS DROWNING IN FOOTAGE`
   - H1: **"You've got months of footage. And zero edited videos to show for it."**
   - Sub: *"Find out exactly how big your backlog really is — and how fast we can clear it. Your first 5 clips are on us."*
   - Primary CTA (scrolls to calculator): **"Calculate my backlog"**

2. **The Calculator** (the core interactive piece)
   - **Inputs:**
     - Slider/number: *"Hours of unedited raw footage you're sitting on"* (range 1–500, default 40)
     - Select: *"How often do you want to post?"* (1–2/wk, 3–5/wk, daily)
     - Optional select: platform (TikTok / Reels / Shorts / Mixed)
   - **Computation (constants must be editable in one config object):**
     ```js
     const ASSUMPTIONS = {
       clipsPerRawHour: 3,      // finished short-form clips per hour of raw
       diyHoursPerClip: 1.75,   // hours a creator spends editing one short
       diyHoursPerWeek: 10,     // realistic self-edit pace (from research)
       freelancerCostPerClip: 75 // $ avg per edited short on Fiverr/Upwork
     };
     const clips   = rawHours * ASSUMPTIONS.clipsPerRawHour;
     const diyHrs  = clips * ASSUMPTIONS.diyHoursPerClip;
     const diyWks  = diyHrs / ASSUMPTIONS.diyHoursPerWeek;
     const freelance$ = clips * ASSUMPTIONS.freelancerCostPerClip;
     ```
   - **Results card (updates live):**
     - "**~{clips} finished videos** are buried in that footage."
     - "Editing them yourself = **~{diyHrs} hours** — about **{diyWks} weeks** of nights and weekends."
     - "Hiring it out per-video on Fiverr/Upwork ≈ **${freelance$}** (and you still have to vet every editor)."
     - Framing line: *"We can start clearing it this week — same editor, 48h turnaround, no freelancer roulette. **Your first 5 clips are free.**"*
   - Show assumptions in small print with a tooltip ("How we calculate this") for honesty/trust.
   - On result render → fire `calculator_complete`.

3. **The offer / form** (`#claim`)
   - H2: **"Start clearing the backlog — free."**
   - The §4.2 qualify form. `Backlog hours` hidden field pre-filled from calculator.
   - Microcopy: *"No credit card. We edit your first 5 clips free so you can see the quality before you pay anything."*
   - Submit button: **"Claim my 5 free edits"**

4. **Why this isn't another freelancer** (trust block — 3 cards)
   - "Same editor every time — no ghosting." / "48-hour turnaround, in writing." / "Vetted & monitored — not a marketplace gamble." (Maps to research pains #1, #2, #6.)

5. **Real proof** (after §3 fix) — 2–3 before/after sample clips OR the guarantee block if no testimonials yet.

6. **Mini-FAQ** (3 items): *How does the free trial work? What if I don't like the edit? Do I need to send all my footage at once?* (Answer the last with the playbook's "start with 5, not 200" message.)

7. **Final CTA** → scrolls to form. Minimal footer.

**Claude Code prompt for LP-2:**
```
Build a standalone landing page at route /lp/backlog for TheVideoJanitor, matching
the site's existing dark design system (tokens: bg #121212, surface #1A1A1A,
text #F9FAFB, muted #A3A3A3, accent orange #FF5F15, font Inter).
No global nav — logo top-left only; minimal footer (© + Privacy/Terms).
Single conversion goal: the free-trial qualify form.

Sections in order: (1) hero with H1 "You've got months of footage. And zero edited
videos to show for it." and CTA that scrolls to the calculator; (2) an interactive
Backlog Calculator (inputs: raw-footage-hours slider 1–500 default 40, posting
frequency select, optional platform select) that live-computes results using this
editable config object: { clipsPerRawHour:3, diyHoursPerClip:1.75, diyHoursPerWeek:10,
freelancerCostPerClip:75 } and renders a results card showing finished-clip count,
DIY hours, DIY weeks (hrs/10), and freelancer $ — with a small 'how we calculate'
tooltip; (3) the qualify form (full name, work email, niche select, posting volume
select, optional Drive/Dropbox link, hidden backlog-hours prefilled from the
calculator, hidden UTM fields) posting to /api/leads with a Formspree fallback via
env LEADS_ENDPOINT, showing an inline thank-you state on success; (4) a 3-card trust
block (same editor / 48h in writing / vetted not a marketplace); (5) a proof slot for
before/after clips; (6) a 3-item FAQ; (7) final CTA.
Content must be visible by default (no opacity:0 scroll-reveal that can fail).
Capture utm_source/medium/campaign/content from the URL into hidden fields + a 30-day
cookie. Fire analytics events lp_view, calculator_complete, lead_submit. Add a
honeypot field. Mobile-first, single column on mobile, max width 1100px. Target
Lighthouse >= 90.
```

---

## 6. LP-3 — Agency White-Label (`/lp/agencies`)

**Goal:** Agencies/SMM operators (ICP C) book a call or claim a free pilot edit.

**Page sections:**

1. **Hero**
   - Eyebrow: `WHITE-LABEL EDITING FOR AGENCIES`
   - H1: **"Add a vetted editing team. Without hiring one."**
   - Sub: *"Stop gambling on freelancers for client work. We're the white-label editing layer behind your agency — per-client style specs, a revision SLA, and 48-hour turnaround. Your clients never know we exist."*
   - Primary CTA: **"Book a 15-min call"** (Calendly) · secondary: **"Get a free pilot edit"** (scrolls to form)

2. **The problem (named in their words)** — short block:
   - *"Everyone calls themselves a video editor now. Quality depends on whoever's free that week — and every shaky deliverable is your reputation on the line."* (research verbatim, paraphrased)

3. **The white-label solution** (3–4 cards):
   - "Per-client style specs" — documented so quality doesn't depend on who's free.
   - "Revision SLA" — no more chasing a ghosting freelancer at 11pm.
   - "White-label delivery" — your brand, not ours.
   - "Scale without hiring" — go from 5 to 50 clients, no new payroll.

4. **How it works (3 steps):** Subscribe → Submit per client w/ brief → Receive in 48h, approve & deliver. (Reuse the homepage 3-step pattern.)

5. **Pilot offer / form** (`#pilot`)
   - H2: **"Try us on one client deliverable — free."**
   - §4.2 form + agency name + # clients/volume. Submit: **"Request free pilot edit."**
   - Microcopy: *"No card, no contract. Send one real brief; we'll deliver it white-labeled in 48h."*

6. **Proof** (after §3 fix): real agency logo/quote or the comparison table from `/pricing` (TheVideoJanitor vs Agency vs Freelancer) — that table is strong and real-feeling; reuse it.

7. **FAQ** (white-label/NDA/volume/billing) + **final CTA** (book call). Minimal footer.

**Claude Code prompt for LP-3:**
```
Build a standalone landing page at route /lp/agencies for TheVideoJanitor, matching
the site's dark design system (bg #121212, surface #1A1A1A, text #F9FAFB,
muted #A3A3A3, accent #FF5F15, Inter). No global nav (logo only); minimal footer.
Two CTAs that share one goal: a Calendly booking (env CALENDLY_URL) and a free-pilot
qualify form.

Sections: (1) hero H1 "Add a vetted editing team. Without hiring one." with Book-a-call
primary CTA and 'Get a free pilot edit' secondary; (2) a short problem block using the
agency pain about freelancer quality variance / reputation risk; (3) 3–4 solution cards
(per-client style specs, revision SLA, white-label delivery, scale without hiring);
(4) a 3-step how-it-works; (5) a pilot-offer qualify form (full name, work email,
agency name, #clients/volume select, optional Drive link, hidden UTM fields) posting to
/api/leads with Formspree fallback (env LEADS_ENDPOINT), inline thank-you with a
Calendly link on success; (6) reuse the TheVideoJanitor-vs-Agency-vs-Freelancer
comparison table; (7) FAQ + final book-a-call CTA.
Content visible by default (no fragile scroll-reveal). Capture UTM params to hidden
fields + 30-day cookie. Fire events lp_view, lead_submit, calendly_click. Honeypot +
rate-limit. Mobile-first, max width 1100px, Lighthouse >= 90.
```

---

## 7. LinkedIn campaign integration

**7.1 Connection-request notes (≤300 chars, value + proposition + link).** Use a short link (the 300-char limit counts the full URL — use a branded short domain or bit.ly).

- **Backlogged creators → `/lp/backlog`:**
  *"Hi {First} — sitting on footage you never edited? Built a quick tool that shows how many hours (and $) it'd take to clear it — plus we'll edit your first 5 clips free: {link}"* (~179 chars)
- **Agencies → `/lp/agencies`:**
  *"Hi {First} — scaling {Agency} editing without hiring? We're a white-label editing layer: vetted team, per-client style specs, 48h SLA. Free pilot edit if useful: {link}"* (~172 chars)

**7.2 Link scheme (per ICP):**
```
https://thevideojanitor.com/lp/backlog?utm_source=linkedin&utm_medium=connection&utm_campaign=jun26&utm_content=creator
https://thevideojanitor.com/lp/agencies?utm_source=linkedin&utm_medium=connection&utm_campaign=jun26&utm_content=agency
```

**7.3 Post-accept follow-up** (sent after connection accepted, value-first, per playbook §5 disclosure rules) — not part of the dev build, but the LP thank-you copy should align with it.

---

## 8. Build order & acceptance criteria

**Order:** (1) Credibility blockers §3.1–3.2 → (2) LP-2 backlog → (3) LP-3 agencies → (4) wire `/api/leads` + analytics → (5) QA on mobile + UTM + form delivery → (6) hand links to campaign.

**Acceptance criteria (per LP):**
- [ ] No global nav; one conversion goal; minimal footer.
- [ ] Matches design tokens (§2); looks native to the site.
- [ ] All copy visible without JS scroll-reveal failing; renders fully in a static full-page screenshot.
- [ ] Form validates, posts to `/api/leads` (or `LEADS_ENDPOINT`), emails `hello@`, shows inline thank-you.
- [ ] UTM params captured into hidden fields + cookie; visible in submitted lead.
- [ ] Analytics events fire (`lp_view`, `lead_submit`, plus `calculator_complete`/`calendly_click`).
- [ ] LP-2 calculator math matches the config object and updates live; assumptions shown.
- [ ] Mobile-first; Lighthouse perf/accessibility ≥ 90.
- [ ] No fabricated names/testimonials anywhere on the new pages.

---

## 9. Open items for owner (Farid) to provide
- Real before/after sample clips for Showcase + LP proof slots.
- Confirm analytics platform (GA4 vs Plausible) + Calendly URL + leads destination (DB / Sheet / Formspree).
- Confirm free-trial fulfillment capacity (who edits the free pilots, expected weekly volume) — the offer must be honored; the entire wedge is trust.
- 1–2 real testimonials as soon as the first free trials complete.
