import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronDown, Mail, MessageSquare } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"

// ── Types ─────────────────────────────────────────────────────────────────────

interface FaqItem { q: string; a: string | React.ReactNode }

// ── FAQ sections ──────────────────────────────────────────────────────────────

const FAQ_SECTIONS: { title: string; items: FaqItem[] }[] = [
  {
    title: "Credit System",
    items: [
      {
        q: "When are credits deducted?",
        a: "Credits are deducted the moment you submit a request — not when your editor starts, not when they deliver. This reserves your edit slot immediately.",
      },
      {
        q: "What do different edit types cost?",
        a: "Basic: 50 cr | Standard: 70 cr | Premium: 100 cr. Extra aspect ratios add 10 cr each. Exact costs are always shown before you confirm.",
      },
      {
        q: "Do unused credits roll over?",
        a: "No. Credits reset to your plan total on each renewal. Use them within the month — they don't accumulate.",
      },
      {
        q: "Can I get a refund if I'm not happy?",
        a: "Credits are non-refundable but our support team can manually adjust your balance for genuine platform errors. Reach out at support@thevideojanitors.com.",
      },
    ],
  },
  {
    title: "Editor Matching",
    items: [
      {
        q: "How does TheVideoJanitors pick my editor?",
        a: "Our algorithm scores every available editor on niche match (40 pts), availability (20 pts), performance rating (10 pts), and style alignment (30 pts). The highest scorer wins your job.",
      },
      {
        q: "What if I don't like my editor?",
        a: "Use the [Swap Editor] button on any active request card. You'll pick a reason, and we'll immediately re-run matching with a different editor. No credit change — just a fresh 24-hour deadline.",
      },
      {
        q: "How long does matching take?",
        a: "Usually under 2 minutes. If no editor is available right now, you'll be queued and matched within the hour.",
      },
    ],
  },
  {
    title: "Writing a Good Brief",
    items: [
      {
        q: "What makes a good brief?",
        a: (
          <div className="space-y-3 text-xs text-[#9CA3AF] leading-relaxed">
            <p>A great brief answers: <strong className="text-[#F9FAFB]">What's the hook? What's the vibe? What does done look like?</strong></p>
            <div className="bg-[#2A2A2A] rounded-lg p-3 space-y-1 font-mono text-[10px]">
              <p className="text-[#FF5F15] font-semibold">Example Brief Template</p>
              <p>Title: "Morning routine — get-ready-with-me"</p>
              <p>Vibe: High energy, trending audio, lots of cuts</p>
              <p>Hook: Start with the final look, jump back to morning chaos</p>
              <p>Captions: Yes, large text, centered</p>
              <p>Reference: @creator123 post from last Tuesday</p>
              <p>Special: Logo watermark bottom-right at 30% opacity</p>
            </div>
            <p>The more specific you are, the fewer revision rounds you'll need.</p>
          </div>
        ),
      },
      {
        q: "What file format should I provide?",
        a: "Share via Google Drive or Dropbox link — direct uploads are not supported in v1. Your editor delivers a final MP4 optimised for the target platform.",
      },
    ],
  },
  {
    title: "Payment & Billing",
    items: [
      {
        q: "Which payment methods are accepted?",
        a: "USD clients pay via Stripe (all major cards, Apple Pay, Google Pay). INR clients pay via Razorpay (cards, UPI, netbanking, wallets).",
      },
      {
        q: "My payment failed — what now?",
        a: "Your subscription will enter a past_due state. You have 3 automatic retry attempts over 7 days. Update your payment method in Subscription settings before retries expire.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Your plan stays active until the end of the billing period. Existing requests continue to completion. No new submissions after expiry.",
      },
      {
        q: "Do you offer refunds on subscriptions?",
        a: "We don't offer refunds on subscription fees, but we're fair — if you've had a platform issue, contact us and we'll work something out.",
      },
    ],
  },
  {
    title: "Revisions",
    items: [
      {
        q: "How many revisions do I get?",
        a: "3 revision rounds per request, enforced by the platform (not just a UI nudge). Each round resets your editor's 48-hour clock. Round 3 is your last free round.",
      },
      {
        q: "What counts as a revision?",
        a: "Any time you send the edit back with notes. Small corrections and complete overhauls both count as one round. Make your notes comprehensive.",
      },
    ],
  },
]

// ── Accordion item ─────────────────────────────────────────────────────────────

function AccordionItem({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#2A2A2A] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#4A4A4A]/40 transition-colors"
      >
        <span className="text-sm font-medium text-[#F9FAFB]">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={15} className="text-[#9CA3AF]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-sm text-[#9CA3AF] leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Help Centre</h2>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Quick answers to the most common questions</p>
      </motion.div>

      {/* FAQ Sections */}
      {FAQ_SECTIONS.map((section) => (
        <motion.div
          key={section.title}
          variants={fadeUp}
          className="bg-[#404040] border border-[#2A2A2A] rounded-xl overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-[#2A2A2A]">
            <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">{section.title}</p>
          </div>
          {section.items.map((item) => (
            <AccordionItem key={item.q} {...item} />
          ))}
        </motion.div>
      ))}

      {/* Contact card */}
      <motion.div
        variants={fadeUp}
        className="bg-[#404040] border border-[#2A2A2A] rounded-xl p-5 space-y-4"
      >
        <p className="text-xs font-sans uppercase tracking-wider text-[#9CA3AF]">Still need help?</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="mailto:support@thevideojanitors.com"
            className="flex items-center gap-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#404040] rounded-xl p-4 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF5F15]/10 border border-[#FF5F15]/20 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-[#FF5F15]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F9FAFB] group-hover:text-[#FF5F15] transition-colors">Email Support</p>
              <p className="text-[10px] text-[#9CA3AF]">support@thevideojanitors.com</p>
            </div>
          </a>
          <a
            href="mailto:support@thevideojanitors.com?subject=Chat%20Request"
            className="flex items-center gap-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#404040] rounded-xl p-4 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#FF5F15]/10 border border-[#FF5F15]/20 flex items-center justify-center shrink-0">
              <MessageSquare size={16} className="text-[#FF5F15]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F9FAFB] group-hover:text-[#FF5F15] transition-colors">Live Chat</p>
              <p className="text-[10px] text-[#9CA3AF]">Typical reply in &lt; 2 hours</p>
            </div>
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
