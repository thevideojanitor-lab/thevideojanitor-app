// src/pages/ForEditors.tsx
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Calendar, Coins, TrendingUp, Clock, Award, Star,
  Crown, Check, Wifi, MessageSquare, Monitor, Scissors, ArrowUpRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { TallyModal } from "@/components/TallyModal";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const EDITOR_FORM_URL = "https://tally.so/embed/Y5o9X0";

const trustSignals = [
  { icon: ShieldCheck, label: "No Bidding Wars" },
  { icon: Coins, label: "Weekly Payouts" },
  { icon: TrendingUp, label: "Merit-Based Growth" },
];

const benefits = [
  { icon: ShieldCheck, title: "No Bidding Wars", description: "Stop wasting time pitching. We assign jobs to the best fit based on skills, style, and availability." },
  { icon: Calendar, title: "Steady Workflow", description: "Consistent volume from agencies and creators. No more feast-or-famine freelancing." },
  { icon: Coins, title: "Fair Pay", description: "Transparent credit system. Cash out weekly via PayPal or Stripe. No hidden fees, no surprises." },
  { icon: TrendingUp, title: "Growth Path", description: "Perform well, level up through tiers, unlock higher pay rates and priority assignments." },
];

const steps = [
  { step: "01", title: "Apply", description: "Submit your portfolio and editing samples. We review within 48 hours." },
  { step: "02", title: "Test Edit", description: "Complete an online interview so we can assess your style and quality." },
  { step: "03", title: "Get Assigned", description: "Once approved, get matched with jobs that fit your skills and availability." },
  { step: "04", title: "Earn & Level Up", description: "Deliver great work, earn credits, cash out weekly. Hit milestones to tier up." },
];

const tiers = [
  {
    name: "Verified", icon: Award, color: "text-muted-foreground", bgColor: "bg-surface-elevated", borderColor: "border-border",
    requirements: ["Pass online interview", "Complete onboarding", "Agree to editor terms"],
    benefits: ["Access to standard jobs", "48h turnaround assignments", "Community access", "Base rate per credit"],
  },
  {
    name: "Priority", icon: Star, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary",
    requirements: ["50+ completed edits", "4.5+ avg rating", "< 5% revision rate"],
    benefits: ["Priority job matching", "Rush turnaround jobs", "1.5x base rate", "Direct client requests"],
    highlighted: true,
  },
  {
    name: "Premier", icon: Crown, color: "text-primary", bgColor: "bg-primary/15", borderColor: "border-primary",
    requirements: ["200+ completed edits", "4.8+ avg rating", "< 2% revision rate", "Mentor contributions"],
    benefits: ["First pick on all jobs", "2x base rate", "Revenue share option", "Beta features access", "Editor advisory board"],
  },
];

const requirements = [
  { icon: Monitor, label: "Premiere Pro or DaVinci Resolve proficiency" },
  { icon: Scissors, label: "Short-form video editing expertise (Reels, TikTok, Shorts)" },
  { icon: Wifi, label: "Reliable high-speed internet connection" },
  { icon: MessageSquare, label: "Strong communication and responsiveness" },
  { icon: Clock, label: "Ability to meet 48-hour turnaround deadlines" },
];

const faqs = [
  { q: "How do payouts work?", a: "Credits are converted to cash weekly. Payouts happen every Friday via PayPal or Stripe. Minimum payout threshold is $50." },
  { q: "Can I choose which jobs I take?", a: "Jobs are assigned based on your skills, style preferences, and availability. Priority and Premier editors get first pick and can decline assignments." },
  { q: "How does the tier system work?", a: "You start as Verified after passing the test edit. As you complete more edits with high ratings and low revision rates, you automatically progress to Priority and Premier tiers with higher pay rates." },
  { q: "What are the technical requirements?", a: "You need proficiency in Premiere Pro or DaVinci Resolve, experience with short-form video editing, reliable internet, and the ability to meet 48-hour turnaround deadlines." },
  { q: "What kind of support do editors get?", a: "Every job comes with a structured brief. You have access to monitored chat with clients, admin support for disputes, and a private editor community for tips and feedback." },
];

const ForEditors = () => {
  return (
    <>
      <SEO
        title="For Editors - Join Our Network"
        description="Join a vetted network of editors. Get consistent work, fair pay, and weekly payouts. No bidding wars, no chasing clients."
        keywords="video editor jobs, freelance editing, remote video editing, video editing work"
      />

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="halo relative min-h-screen flex items-center overflow-hidden px-4 pt-28 pb-16">
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Join the editor network
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                Consistent short-form work. <span className="text-primary">Fair pay. No bidding wars.</span>
              </EditorialHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-8 leading-relaxed">
                Join a vetted network of editors. Get assigned jobs based on your skills and availability. Earn credits, cash out reliably. Level up to earn more.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center mb-14">
                <TallyModal url={EDITOR_FORM_URL} title="Editor Application" subtitle="Apply to join our vetted editor network">
                  <Button variant="hero" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    Apply to be an Editor <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
                <Button
                  variant="hero-outline"
                  size="lg"
                  className="text-base px-7 py-6 w-full sm:w-auto"
                  onClick={() => document.getElementById("requirements")?.scrollIntoView({ behavior: "smooth" })}
                >
                  View Requirements
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {trustSignals.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Why Join */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Why join</p>
            <EditorialHeading as="h2">Built for editors who value their craft.</EditorialHeading>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <BentoCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-card bg-primary/10 flex items-center justify-center mb-5">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2 text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* How It Works */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">How it works</p>
            <EditorialHeading as="h2">From application to earning in 4 steps.</EditorialHeading>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.06}>
                <BentoCard className="p-7 h-full">
                  <p className="font-heading font-bold text-primary text-3xl">{s.step}</p>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Editor Tiers */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Editor tiers</p>
            <EditorialHeading as="h2">Grow your career. Unlock higher pay.</EditorialHeading>
            <p className="text-muted-foreground max-w-lg mx-auto mt-5">Every edit you deliver builds your reputation. Hit milestones to level up automatically.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.06}>
                <div className={`relative p-8 rounded-card border h-full ${tier.bgColor} ${tier.borderColor} ${tier.highlighted ? "ring-1 ring-primary" : ""}`}>
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-4 py-1 rounded-full">Most Common</div>
                  )}
                  <div className={`w-14 h-14 rounded-card ${tier.bgColor} flex items-center justify-center mb-5`}>
                    <tier.icon className={`w-7 h-7 ${tier.color}`} />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-6 text-foreground">{tier.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Requirements</p>
                  <ul className="space-y-2 mb-6">
                    {tier.requirements.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Benefits</p>
                  <ul className="space-y-2">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Requirements */}
        <Section id="requirements" tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Requirements</p>
            <EditorialHeading as="h2">What we look for.</EditorialHeading>
          </Reveal>
          <div className="max-w-2xl mx-auto space-y-3">
            {requirements.map((req, i) => (
              <Reveal key={req.label} delay={i * 0.05}>
                <BentoCard className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center shrink-0">
                    <req.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{req.label}</span>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Testimonials — placeholder until real editor proof exists (rule 16) */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">From our editors</p>
            <EditorialHeading as="h2">Editor voices, coming soon.</EditorialHeading>
            <p className="text-muted-foreground max-w-lg mx-auto mt-5">
              We're onboarding our founding editors. Their stories will land here as the network grows.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <BentoCard className="p-8 h-full">
                  <p className="text-muted-foreground leading-relaxed mb-6">Editor testimonial coming soon.</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-sm font-bold text-muted-foreground">—</div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">—</p>
                      <p className="text-xs text-muted-foreground">—</p>
                    </div>
                  </div>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">FAQ</p>
            <EditorialHeading as="h2">Common questions</EditorialHeading>
          </Reveal>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-card px-6 shadow-lift data-[state=open]:border-primary/30">
                  <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* Final CTA */}
        <section className="px-4 py-20 md:py-28">
          <Reveal className="max-w-6xl mx-auto">
            <BentoCard variant="primary" className="px-6 py-20 text-center rounded-[2.5rem]">
              <EditorialHeading as="h2" className="text-4xl md:text-6xl">
                Turn your skills into steady income.
              </EditorialHeading>
              <p className="text-primary-foreground/85 text-lg max-w-xl mx-auto mt-6">
                No bidding. No chasing clients. Just great work and fair pay.
              </p>
              <div className="mt-9">
                <TallyModal url={EDITOR_FORM_URL} title="Editor Application" subtitle="Apply to join our vetted editor network">
                  <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                    Apply Now <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
              </div>
              <p className="text-xs text-primary-foreground/70 mt-8">Weekly payouts via PayPal/Stripe · No upfront fees · Cancel anytime</p>
            </BentoCard>
          </Reveal>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ForEditors;
