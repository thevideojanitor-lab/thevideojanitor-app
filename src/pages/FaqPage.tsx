// src/pages/FaqPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Coins, RefreshCw, ArrowLeftRight, Clock, FileVideo,
  ThumbsDown, CreditCard, XCircle, ArrowRight, Search
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const categories = [
  {
    id: "credits",
    icon: Coins,
    label: "Credits",
    faqs: [
      {
        q: "What are credits?",
        a: "Credits are the internal currency of TheVideoJanitors. Instead of paying per video, you buy a plan that comes with a set number of credits. Each edit request costs a certain number of credits depending on its complexity — Basic (50 credits), Standard (70 credits), or Premium (100 credits). Add-ons like captions or motion graphics cost extra credits.",
      },
      {
        q: "Do credits roll over?",
        a: "Yes — unused credits roll over to the next month as long as your subscription remains active. If you cancel, your credits remain usable until the end of your current billing period, then they expire.",
      },
      {
        q: "Can I buy extra credits without upgrading my plan?",
        a: "Yes. You can purchase credit recharge packs at any time: 100 credits for $30, 250 credits for $70, or 500 credits for $130. These are one-time top-ups and don't affect your subscription.",
      },
      {
        q: "What's the difference between Basic, Standard, and Premium edits?",
        a: "Basic (50 credits) includes raw cuts, jump cuts, basic b-roll, transitions, and one output format. Standard (70 credits) adds baked captions, pacing optimization, sound polish, and hook emphasis. Premium (100 credits) adds motion graphics, advanced text animations, stronger sound design, and branded visual treatment.",
      },
      {
        q: "Can I use credits across multiple types of requests?",
        a: "Yes. Within the same month, you can mix Basic, Standard, and Premium requests as long as you have enough credits. For example, on the Quick Sweep plan (350 credits), you could do 3 Basic edits (150 credits) and 2 Standard edits (140 credits) and still have 60 credits left for add-ons.",
      },
    ],
  },
  {
    id: "revisions",
    icon: RefreshCw,
    label: "Revisions",
    faqs: [
      {
        q: "How do revisions work?",
        a: "Every request includes up to 3 revision rounds. After your editor delivers the first draft, you review it inside the dashboard and leave feedback. Your editor then revises accordingly. This repeats up to 3 times per request.",
      },
      {
        q: "What counts as a revision vs. a new request?",
        a: "A revision is any change that stays within the scope of the original brief — timing adjustments, caption edits, music swaps, pacing tweaks. A new request (which costs credits) is a major direction change: entirely new style, replacing half the footage, adding captions or motion graphics that weren't in the original brief, or a structural overhaul.",
      },
      {
        q: "What if my editor made an obvious mistake?",
        a: "If your editor missed something that was clearly in your brief — wrong text, missed instruction, formatting error — that fix doesn't count as a revision round. It's corrected at no cost and without using one of your 3 rounds.",
      },
      {
        q: "What happens after 3 revisions and I'm still not happy?",
        a: "If you've used all 3 revision rounds and feel the output still doesn't meet the brief, contact support. We'll review the chat thread and brief. If the issue is on our side, we'll resolve it. If the brief changed significantly, additional revisions cost 10 credits each.",
      },
      {
        q: "Can I leave timestamped feedback?",
        a: "Yes. Inside each request's detail page, you can leave timestamped comments directly on the video. This makes revision instructions precise and reduces back-and-forth.",
      },
    ],
  },
  {
    id: "swaps",
    icon: ArrowLeftRight,
    label: "Editor Swaps",
    faqs: [
      {
        q: "How do editor swaps work?",
        a: "If your assigned editor is unresponsive for over 24 hours, misses their deadline, or delivers work that clearly doesn't match your brief, you can request a swap. We reassign your request to a new editor, transfer all files and context, and the new editor picks up where things left off.",
      },
      {
        q: "Are swaps free?",
        a: "Swaps are free when triggered by a measurable failure — missed SLA, no response, or clear brief non-adherence. If you simply want a different editor without a performance reason, that's reviewed on a case-by-case basis. We allow one style-preference swap per billing cycle.",
      },
      {
        q: "Will I lose my progress if I swap?",
        a: "No. All files, your brief, previous drafts, and the full chat thread are transferred to the new editor. You don't have to restart from scratch.",
      },
      {
        q: "What if I keep having issues with editors?",
        a: "If you're experiencing repeated issues, contact our support team. We'll investigate, adjust the matching criteria for your account, and escalate to a Priority or Premier-tier editor if needed.",
      },
    ],
  },
  {
    id: "turnaround",
    icon: Clock,
    label: "Turnaround",
    faqs: [
      {
        q: "What does '48-hour turnaround' mean?",
        a: "It means your editor will deliver the first draft of your edited video within 48 hours of your request being assigned. Assignment typically happens within a few hours of submission. So from the moment you submit, expect your first draft in 48–72 hours.",
      },
      {
        q: "Does the 48-hour clock include weekends?",
        a: "Yes — our editors are active 7 days a week. The 48-hour SLA applies to all days including weekends. If your editor misses this, you're eligible for a free swap.",
      },
      {
        q: "What is rush turnaround?",
        a: "Rush turnaround is an add-on that costs +25 credits and prioritizes your request for delivery within 24 hours instead of 48. It's available on all plans but subject to editor availability.",
      },
      {
        q: "What if my request is complex — does it still take 48 hours?",
        a: "For Premium edits (motion graphics, heavy animations), the turnaround is still 48 hours. If a job is unusually complex, your editor will flag it and your admin team will keep you updated. We communicate proactively — we don't leave you guessing.",
      },
    ],
  },
  {
    id: "files",
    icon: FileVideo,
    label: "File Types",
    faqs: [
      {
        q: "What file types do you accept?",
        a: "We accept MP4, MOV, AVI, and MKV for raw footage. You can upload files directly through the dashboard or share a Google Drive or Dropbox link. Maximum direct upload size is 10GB.",
      },
      {
        q: "What formats will I receive my edited video in?",
        a: "All deliverables are exported as MP4 (H.264) by default. You can specify aspect ratio — 9:16 for Reels/TikTok/Shorts, 1:1 for square, or 16:9 for YouTube. Multiple format exports cost additional credits.",
      },
      {
        q: "Can I get the project file?",
        a: "Yes, source/project files (.prproj or .drp) are available as an add-on for +20 credits. You'll receive the full editable project file along with your exported video.",
      },
      {
        q: "What about SRT subtitle files?",
        a: "SRT exports are available as an add-on for +5 credits. These are separate from baked-in captions and can be used for platforms that support external subtitle files.",
      },
    ],
  },
  {
    id: "unhappy",
    icon: ThumbsDown,
    label: "If You're Unhappy",
    faqs: [
      {
        q: "What happens if I'm not happy with the final result?",
        a: "First, use your revision rounds to get the output where it needs to be. If after 3 revisions you're still not satisfied, contact support. We'll review the original brief vs. the delivered output. If the issue is clearly on our side, we'll either redo the job at no credit cost or issue a credit refund.",
      },
      {
        q: "Can I get a cash refund?",
        a: "Subscription payments are non-refundable once credits have been issued, as this is standard for credit-based subscription products. However, if a request fails due to a platform or editor failure, we'll return the credits used for that request.",
      },
      {
        q: "What if the editor was rude or unprofessional?",
        a: "All communication is monitored by our admin team. Report any unprofessional behavior immediately and we'll investigate. Editors who behave inappropriately are removed from the platform.",
      },
    ],
  },
  {
    id: "billing",
    icon: CreditCard,
    label: "Billing",
    faqs: [
      {
        q: "How does editor payment work?",
        a: "Editors are paid separately from the client credit system. We pay editors a fixed cash rate per job type (not the credit value clients use). This internal rate maintains our margin and lets us provide quality oversight, support, and platform infrastructure.",
      },
      {
        q: "When are editors paid?",
        a: "Editors are paid weekly every Friday via PayPal or Stripe. Minimum payout threshold is $50. Earnings accumulate across the week and are released in a single transfer.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. You can cancel your subscription at any time before your next renewal date. You'll keep access to the service and your remaining credits until the end of your current billing period. No auto-renew after cancellation.",
      },
      {
        q: "What's not included in any plan?",
        a: "Plans don't include: custom animation production from scratch, full video production (filming), voice-over recording, licensed music (we use royalty-free music), or social media posting/scheduling. These are outside our editing scope.",
      },
    ],
  },
  {
    id: "cancellation",
    icon: XCircle,
    label: "Cancellation",
    faqs: [
      {
        q: "What happens to my credits if I cancel?",
        a: "If you cancel, your credits remain usable until the end of your current billing period. After that, unused credits expire. Credits do not convert to cash.",
      },
      {
        q: "Can I pause my subscription instead of cancelling?",
        a: "Pause functionality is not currently available. You can cancel and re-subscribe when ready. If you re-subscribe within the same billing month, contact support and we'll do our best to accommodate your credit balance.",
      },
      {
        q: "Can I downgrade instead of cancelling?",
        a: "Yes. You can downgrade to a lower plan at any time. The change takes effect at your next billing cycle. Your current plan and credits remain active until then.",
      },
    ],
  },
];

const FaqPage = () => {
  const [activeCategory, setActiveCategory] = useState("credits");
  const [searchQuery, setSearchQuery] = useState("");

  const currentCategory = categories.find((c) => c.id === activeCategory);

  const filteredFaqs = searchQuery.trim()
    ? categories.flatMap((c) =>
        c.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((faq) => ({ ...faq, category: c.label }))
      )
    : [];

  return (
    <>
      <SEO
        title="FAQ - TheVideoJanitors"
        description="Answers to all common questions about credits, revisions, editor swaps, turnaround time, file types, billing, and what's included."
        keywords="video editing faq, video janitors help, video editing credits, revision policy"
        canonical="https://thevideojanitors.com/faq"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              FAQ
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Questions?{" "}
              <span className="text-gradient">We've got answers.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary mb-8"
            >
              Everything you need to know about credits, revisions, turnaround, billing, and more.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative max-w-md mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </motion.div>
          </div>
        </section>

        {/* Search Results */}
        {searchQuery.trim() && (
          <section className="pb-16">
            <div className="container mx-auto px-4 max-w-3xl">
              {filteredFaqs.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for "
                    {searchQuery}"
                  </p>
                  <Accordion type="single" collapsible className="space-y-3">
                    {filteredFaqs.map((faq, i) => (
                      <AccordionItem
                        key={i}
                        value={`search-${i}`}
                        className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
                      >
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-5 text-left">
                          <span>{faq.q}</span>
                          <span className="ml-auto mr-4 text-xs text-primary shrink-0">
                            {faq.category}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  No results for "{searchQuery}".{" "}
                  <Link to="/contact" className="text-primary underline">
                    Ask us directly.
                  </Link>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Category FAQs */}
        {!searchQuery.trim() && (
          <section className="pb-24 md:pb-32">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-64 shrink-0">
                  <div className="lg:sticky lg:top-24 space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                          activeCategory === cat.id
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-card hover:text-foreground border border-transparent"
                        }`}
                      >
                        <cat.icon className="w-4 h-4 shrink-0" />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </aside>

                {/* FAQs */}
                <div className="flex-1 min-w-0">
                  {currentCategory && (
                    <motion.div
                      key={currentCategory.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <currentCategory.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-heading text-2xl font-bold">
                          {currentCategory.label}
                        </h2>
                      </div>

                      <Accordion type="single" collapsible className="space-y-3">
                        {currentCategory.faqs.map((faq, i) => (
                          <AccordionItem
                            key={i}
                            value={`faq-${i}`}
                            className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
                          >
                            <AccordionTrigger className="text-sm font-medium hover:no-underline py-5 text-left">
                              {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                              {faq.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Still have questions */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Still have questions?
              </h2>
              <p className="text-text-secondary mb-8">
                Can't find what you're looking for? Our team responds within 24 hours.
              </p>
              <Link to="/contact">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Contact Support <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default FaqPage;