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
