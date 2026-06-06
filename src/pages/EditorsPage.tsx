// src/pages/EditorsPage.tsx
import { Button } from "@/components/ui/button";
import {
  Star, Award, Crown, Clock, CheckCircle2,
  Zap, ArrowUpRight, Shield, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { EditorApplicationEmbed } from "@/components/EditorApplicationEmbed";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

// Tier badge config (the program structure — not tied to any individual).
const tierConfig = {
  Verified: { icon: Award, badge: "bg-surface-elevated text-muted-foreground border border-border" },
  Priority: { icon: Star, badge: "bg-primary/10 text-primary border border-primary/20" },
  Premier: { icon: Crown, badge: "bg-primary text-primary-foreground border border-primary" },
} as const;

const trustStats = [
  { icon: Shield, label: "All editors vetted", desc: "Portfolio review, test edit, and background check" },
  { icon: CheckCircle2, label: "Quality monitored", desc: "Admin oversight on every job, not just complaints" },
  { icon: Clock, label: "48h SLA enforced", desc: "Missed deadlines trigger automatic review" },
  { icon: TrendingUp, label: "Tier-based progression", desc: "Editors earn their level through performance" },
];

const vettingSteps = [
  { step: "01", title: "Portfolio Review", desc: "We review submitted portfolios for technical quality, short-form expertise, and platform fluency." },
  { step: "02", title: "Skills Assessment", desc: "Applicants complete a checklist covering software proficiency, turnaround capability, and specialties." },
  { step: "03", title: "Online Interview", desc: "Every approved applicant completes an online interview. We assess quality, experience, and communication." },
  { step: "04", title: "Onboarding & Agreement", desc: "Accepted editors complete onboarding, agree to our editor terms, and are briefed on quality standards and SLAs." },
  { step: "05", title: "Ongoing Monitoring", desc: "Performance is tracked continuously. Ratings, revision rates, and on-time delivery determine tier progression — and continued platform access." },
];

const EditorsPage = () => {
  return (
    <>
      <SEO
        title="Meet the Editors - TheVideoJanitors"
        description="Meet the vetted video editors behind TheVideoJanitors. Verified, Priority, and Premier tier editors specializing in short-form content for creators, agencies, and brands."
        keywords="vetted video editors, short-form video editors, professional video editors, trusted editors"
        canonical="https://thevideojanitor.com/editors"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="halo relative px-4 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Our editor network</p>
            </Reveal>
            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                The editors behind <span className="text-primary">the clean content.</span>
              </EditorialHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-8 mb-10">
                Every editor on our platform has been vetted, tested, and approved. No random picks.
                No freelancer roulette. Just skilled, accountable editors who show up and deliver.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="inline-flex flex-wrap justify-center gap-3">
                {(["Verified", "Priority", "Premier"] as const).map((tier) => {
                  const cfg = tierConfig[tier];
                  return (
                    <div key={tier} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${cfg.badge}`}>
                      <cfg.icon className="w-3.5 h-3.5" />
                      {tier}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="py-12 border-y border-border bg-surface-elevated/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {trustStats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.06} className="text-center">
                  <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold mb-1 text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Roster — placeholder until real editor profiles exist (rule 16) */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Featured editors</p>
            <EditorialHeading as="h2">Our founding roster is forming.</EditorialHeading>
            <p className="text-muted-foreground max-w-lg mx-auto mt-5">
              We're onboarding and vetting our first cohort of editors right now. Verified profiles —
              specialties, software, and track record — will appear here as they join.
            </p>
          </Reveal>
          <Reveal className="max-w-2xl mx-auto">
            <BentoCard variant="sand" className="p-10 text-center">
              <div className="w-14 h-14 rounded-card bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Star className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">Editor profiles coming soon</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Editors are matched to your requests by our team based on style, niche, timezone, and
                availability. Clients don't browse or hire individual editors directly.
              </p>
            </BentoCard>
          </Reveal>
        </Section>

        {/* Vetting Process */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Our vetting process</p>
            <EditorialHeading as="h2">How we approve every editor.</EditorialHeading>
          </Reveal>
          <div className="max-w-3xl mx-auto">
            {vettingSteps.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.05}>
                <div className="flex gap-6 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{item.step}</span>
                    </div>
                    {i < vettingSteps.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-heading font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Dual CTA */}
        <Section>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <Reveal>
              <BentoCard className="p-8 text-center h-full">
                <div className="w-14 h-14 rounded-card bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 text-foreground">
                  Want vetted editors working on your content?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Subscribe to a plan and get matched with the right editor for your content and style.
                </p>
                <Link to="/pricing">
                  <Button variant="hero" className="w-full">
                    View Plans <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </BentoCard>
            </Reveal>
            <Reveal delay={0.06}>
              <BentoCard className="p-8 text-center h-full">
                <div className="w-14 h-14 rounded-card bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Crown className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 text-foreground">
                  Are you an editor? Join our network.
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Consistent jobs, fair pay, weekly payouts. No bidding wars, no chasing clients.
                </p>
                <EditorApplicationEmbed buttonVariant="hero-outline" buttonText="Apply as Editor" />
              </BentoCard>
            </Reveal>
          </div>
        </Section>

        <Footer />
      </div>
    </>
  );
};

export default EditorsPage;
