// src/pages/HowItWorksPage.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Upload, UserCheck, RefreshCw, ArrowLeftRight,
  Clock, MessageSquare, Shield, Coins, ArrowRight, Check,
  ChevronRight, Zap, FileVideo, Link as LinkIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const mainSteps = [
  {
    step: "01",
    icon: CreditCard,
    title: "Buy a Plan",
    subtitle: "Choose credits based on your volume",
    description:
      "Pick a subscription plan — Quick Sweep, Deep Clean, or Full Service. Each plan comes with a monthly credit allocation. Credits are your editing currency. The more complex the edit, the more credits it costs.",
    details: [
      "Credits roll over while your subscription remains active",
      "Upgrade or downgrade anytime — no contracts",
      "Top up credits mid-month if you run out",
      "Monthly, quarterly, or annual billing available",
    ],
    aside: {
      label: "Credit Costs",
      items: [
        { name: "Basic Edit", value: "50 credits" },
        { name: "Standard Edit", value: "70 credits" },
        { name: "Premium Edit", value: "100 credits" },
        { name: "Captions Add-on", value: "+10 credits" },
        { name: "Motion Graphics", value: "+25 credits" },
        { name: "Rush Turnaround", value: "+25 credits" },
      ],
    },
  },
  {
    step: "02",
    icon: Upload,
    title: "Submit a Request",
    subtitle: "Tell us exactly what you need",
    description:
      "Once subscribed, head to your dashboard and submit a new edit request. Upload your raw footage directly or share a Google Drive link. Add a brief describing what you need — style, platform, hook, references. The more detail, the better the first draft.",
    details: [
      "Upload files directly or via Google Drive / Dropbox link",
      "Select request type: Basic, Standard, or Premium",
      "Add captions, motion graphics, or rush turnaround as add-ons",
      "Include reference videos or style notes for best results",
    ],
    aside: {
      label: "Accepted File Types",
      items: [
        { name: "Video", value: "MP4, MOV, AVI, MKV" },
        { name: "Drive Links", value: "Google Drive, Dropbox" },
        { name: "Output", value: "9:16, 1:1, 16:9" },
        { name: "Formats", value: "MP4 H.264" },
      ],
    },
  },
  {
    step: "03",
    icon: UserCheck,
    title: "Get Matched with an Editor",
    subtitle: "We assign the right editor for your content",
    description:
      "Our team reviews your brief and matches you with a vetted editor based on your content style, niche, and turnaround requirements. You don't pick blindly from a pool — we make the match. All communication stays inside the platform.",
    details: [
      "Matching based on style, niche, timezone, and availability",
      "All editors are vetted, tested, and background-checked",
      "You get one dedicated editor per request",
      "Communication is monitored for quality and professionalism",
    ],
    aside: {
      label: "Editor Tiers",
      items: [
        { name: "Verified", value: "Approved editors" },
        { name: "Priority", value: "4.5+ rating, 50+ edits" },
        { name: "Premier", value: "4.8+ rating, 200+ edits" },
      ],
    },
  },
  {
    step: "04",
    icon: RefreshCw,
    title: "Review and Revise",
    subtitle: "Up to 3 revision rounds included",
    description:
      "Your editor delivers the first draft within 48 hours. Review it inside the dashboard and leave timestamped feedback on exactly what to change. Up to 3 revision rounds are included per request. Revisions must stay within the original brief — major direction changes count as a new request.",
    details: [
      "48-hour standard delivery from request submission",
      "3 revision rounds included per request",
      "Leave timestamped feedback directly on the video",
      "Major scope changes require additional credits",
    ],
    aside: {
      label: "What Counts as a Revision?",
      items: [
        { name: "Included", value: "Timing, cuts, caption edits" },
        { name: "Included", value: "Music swap, pacing" },
        { name: "Extra credits", value: "New style direction" },
        { name: "Extra credits", value: "Adding motion graphics" },
      ],
    },
  },
  {
    step: "05",
    icon: ArrowLeftRight,
    title: "Request a Swap if Needed",
    subtitle: "Not working out? Swap your editor",
    description:
      "If your editor misses a deadline, goes unresponsive, or the quality isn't right after a fair attempt — you can request a swap. We reassign the job to a new editor. Swaps are free when triggered by a measurable failure. This keeps our editors accountable and your content on track.",
    details: [
      "Swaps are free when triggered by missed SLA or poor quality",
      "Admin reviews all swap requests to prevent abuse",
      "Reassignment happens within a few hours",
      "Your progress and files are transferred to the new editor",
    ],
    aside: {
      label: "Swap Triggers",
      items: [
        { name: "Valid", value: "No response 24+ hours" },
        { name: "Valid", value: "Missed deadline" },
        { name: "Valid", value: "Poor brief adherence" },
        { name: "Reviewed", value: "Style preference change" },
      ],
    },
  },
];

const guarantees = [
  {
    icon: Clock,
    title: "48-Hour Turnaround",
    description:
      "Every standard request is delivered within 48 hours of submission. Rush options are available on higher plans for time-sensitive content.",
  },
  {
    icon: MessageSquare,
    title: "In-App Chat",
    description:
      "All communication between you and your editor happens inside the platform. No personal emails, no WhatsApp groups — one clean thread per request.",
  },
  {
    icon: Shield,
    title: "Monitored Communication",
    description:
      "Our admin team monitors all client-editor communication. This protects both sides and ensures professional, on-brief interactions at all times.",
  },
  {
    icon: Coins,
    title: "Credit-Based Flexibility",
    description:
      "Credits give you flexible control. Mix basic and premium edits in the same month. Top up anytime. Credits roll over while subscribed.",
  },
];

const faqs = [
  {
    q: "What happens if my editor misses the 48-hour deadline?",
    a: "We treat missed deadlines seriously. If your editor misses the SLA, you can request a free swap and we'll reassign immediately. Chronic deadline misses result in editor suspension.",
  },
  {
    q: "Can I submit multiple requests at the same time?",
    a: "Depends on your plan. Quick Sweep allows 1 active request, Deep Clean allows 2, and Full Service allows 4 active requests simultaneously.",
  },
  {
    q: "What if I don't like the style of my editor?",
    a: "After the first delivered edit, if the style isn't right, you can request a swap. Include as much reference material as possible in your brief to help your editor nail your style from the start.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Yes — credits roll over as long as your subscription remains active. If you cancel, remaining credits are usable until the end of your billing period.",
  },
];

const HowItWorksPage = () => {
  return (
    <>
      <SEO
        title="How It Works - TheVideoJanitors"
        description="Learn how TheVideoJanitors works. Buy credits, submit requests, get matched with vetted editors, review edits, and request swaps. 48-hour turnaround guaranteed."
        keywords="how video editing subscription works, video editing service process, managed video editing"
        canonical="https://thevideojanitors.com/how-it-works"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              How It Works
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Simple process.{" "}
              <span className="text-gradient">Predictable results.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
            >
              No freelancer roulette. No missed deadlines. No chasing people. Here's exactly how
              TheVideoJanitors works — from your first credit to your finished reel.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/pricing">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  View Plans <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  Talk to Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Step-by-step process */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="space-y-24">
              {mainSteps.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`grid md:grid-cols-2 gap-12 items-center ${
                    i % 2 === 1 ? "md:grid-flow-dense" : ""
                  }`}
                >
                  {/* Content */}
                  <div className={i % 2 === 1 ? "md:col-start-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <step.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                          Step {step.step}
                        </span>
                        <h2 className="font-heading text-2xl md:text-3xl font-bold leading-tight">
                          {step.title}
                        </h2>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-primary mb-4">{step.subtitle}</p>
                    <p className="text-text-secondary leading-relaxed mb-6">{step.description}</p>
                    <ul className="space-y-3">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3 text-sm">
                          <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-text-secondary">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Aside Card */}
                  <div className={i % 2 === 1 ? "md:col-start-1 md:row-start-1" : ""}>
                    <div className="p-8 rounded-2xl bg-card border border-border">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary mb-5">
                        {step.aside.label}
                      </p>
                      <div className="space-y-3">
                        {step.aside.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between py-3 border-b border-border last:border-0"
                          >
                            <span className="text-sm text-text-secondary">{item.name}</span>
                            <span className="text-sm font-semibold text-primary">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Guarantees */}
        <section className="py-24 md:py-32 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Platform Standards
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Built-in protections. Every request.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {guarantees.map((g, i) => (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <g.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-3">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">FAQ</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Common process questions
              </h2>
            </motion.div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <h3 className="font-heading font-semibold mb-3 text-sm">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Ready to clean up{" "}
                <span className="text-gradient">your content workflow?</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
                Subscribe to a plan. Submit your first request. Get polished content back in 48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button variant="hero" size="lg" className="text-base px-8 py-6">
                    View Plans <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/for-editors">
                  <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                    Join as Editor
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                No contracts · Credits roll over while subscribed · Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HowItWorksPage;