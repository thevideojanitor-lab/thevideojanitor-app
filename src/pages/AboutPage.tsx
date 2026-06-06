// src/pages/AboutPage.tsx
import { Button } from "@/components/ui/button";
import { Heart, Target, Shield, TrendingUp, Users, Zap, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const values = [
  { icon: Shield, title: "Reliability over volume", description: "We'd rather have 20 editors who consistently deliver on time than 200 who don't. Quality control is non-negotiable." },
  { icon: Heart, title: "Fair to both sides", description: "Clients deserve polished work. Editors deserve fair pay and stable income. We designed the platform to protect both." },
  { icon: Target, title: "Clarity, not complexity", description: "Credits. Requests. 48 hours. Three words that describe our whole model. We deliberately keep things simple." },
  { icon: TrendingUp, title: "Built to scale with you", description: "Whether you're a solo creator or a 30-client agency, the system works the same. Clean, predictable, scalable." },
];

const differentiators = [
  "We match you — you don't browse and gamble",
  "Every editor is vetted, tested, and monitored",
  "All communication stays on-platform",
  "Swap editors without drama or awkward conversations",
  "Credits give you flexibility without open-ended commitments",
  "Admin oversight on every job, not just complaints",
];

// Real product facts kept; unsubstantiated counts use — placeholders (rule 16).
const milestones = [
  { number: "48h", label: "Standard turnaround" },
  { number: "—", label: "Vetted editors" },
  { number: "3", label: "Revision rounds included" },
  { number: "—", label: "Creators & agencies served" },
];

const story = [
  "Short-form video is the single most valuable content format right now. TikTok, Instagram Reels, YouTube Shorts — every creator, brand, and agency needs to be producing it consistently. But editing is where everything breaks down.",
  "The problem isn't talent. There are thousands of skilled video editors. The problem is the system. Platforms like Fiverr and Upwork put the burden on you to find, vet, negotiate with, and manage freelancers. Every time you need someone new, you start from scratch. Every time an editor ghosts you, you lose days.",
  "We built TheVideoJanitors to be the managed layer between you and talented editors. You subscribe, submit your footage, and we handle the matching, communication oversight, quality review, and revision flow. You get polished content. Editors get steady, structured work. We handle the messy middle.",
  "The name says it all. We're not the flashiest service in the room. We're the ones who show up reliably, do the job properly, and leave things cleaner than we found them. Every time.",
];

const AboutPage = () => {
  return (
    <>
      <SEO
        title="About Us - TheVideoJanitors"
        description="Learn why TheVideoJanitors was built, what makes us different, and our mission for both editors and clients. Managed short-form video editing without the mess."
        keywords="about thevideojanitors, video editing company, managed video editing platform"
        canonical="https://thevideojanitor.com/about"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="halo relative px-4 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto w-full">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">About us</p>
            </Reveal>
            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                We clean up your <span className="text-primary">content workflow.</span>
              </EditorialHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mt-6">
                TheVideoJanitors was built because the current way of getting short-form content edited is broken.
                Freelancer roulette. Missed deadlines. Ghost editors. Wildly inconsistent quality. We decided to fix it.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-16 border-y border-border bg-surface-elevated/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {milestones.map((m, i) => (
                <Reveal key={m.label} delay={i * 0.06} className="text-center">
                  <div className="font-heading text-4xl md:text-5xl font-bold text-primary mb-2">{m.number}</div>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Built It */}
        <Section>
          <div className="max-w-4xl mx-auto">
            <Reveal className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Why we built this</p>
              <EditorialHeading as="h2">The system was broken. So we fixed it.</EditorialHeading>
            </Reveal>
            <div className="space-y-6 text-muted-foreground leading-relaxed mt-8">
              {story.map((para, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <p className="text-base md:text-lg">{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* What Makes Us Different */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">What makes us different</p>
            <EditorialHeading as="h2">Not a marketplace. A managed editing service.</EditorialHeading>
          </Reveal>
          <div className="max-w-2xl mx-auto space-y-3">
            {differentiators.map((d, i) => (
              <Reveal key={d} delay={i * 0.05}>
                <BentoCard className="flex items-center gap-4 p-5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{d}</span>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Our Values */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Our values</p>
            <EditorialHeading as="h2">What we stand for.</EditorialHeading>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <BentoCard className="p-8 h-full">
                  <div className="w-12 h-12 rounded-card bg-primary/10 flex items-center justify-center mb-5">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-3 text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Mission — Both Sides */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Our mission</p>
            <EditorialHeading as="h2">Built for both sides of the equation.</EditorialHeading>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            <Reveal>
              <BentoCard className="p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">For Clients</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                  Our mission is to remove every friction point between your raw footage and a polished,
                  platform-ready video. You shouldn't need to manage people, chase deliverables, or
                  compromise on quality because you can't afford a full-time editor.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  TheVideoJanitors gives you the consistency of an in-house editor at a fraction of
                  the cost, without any of the HR overhead.
                </p>
              </BentoCard>
            </Reveal>
            <Reveal delay={0.06}>
              <BentoCard className="p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground">For Editors</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                  Our mission is to give skilled video editors a better way to work. No bidding wars.
                  No chasing invoices. No clients who ghost. Just structured, well-briefed jobs with
                  fair pay and reliable weekly payouts.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We believe editors deserve to focus on their craft — not on business development.
                  That's why we built a tier system that rewards quality and creates a real career path.
                </p>
              </BentoCard>
            </Reveal>
          </div>
        </Section>

        {/* CTA */}
        <section className="px-4 py-20 md:py-28">
          <Reveal className="max-w-6xl mx-auto">
            <BentoCard variant="primary" className="px-6 py-20 text-center rounded-[2.5rem]">
              <EditorialHeading as="h2" className="text-4xl md:text-6xl">Ready to work with us?</EditorialHeading>
              <p className="text-primary-foreground/85 text-lg max-w-md mx-auto mt-6">
                Whether you need editing done or you want to join our editor network — we'd love to have you.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/pricing">
                  <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                    View Plans <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/for-editors">
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary text-base px-8 py-6">
                    Join as Editor
                  </Button>
                </Link>
              </div>
            </BentoCard>
          </Reveal>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
