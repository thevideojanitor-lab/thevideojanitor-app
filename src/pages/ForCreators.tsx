// src/pages/ForCreators.tsx
import { Button } from "@/components/ui/button";
import {
  Upload, Clock, RefreshCw, Star,
  TrendingUp, Zap, ArrowUpRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { TallyModal } from "@/components/TallyModal";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const WAITLIST_URL = "https://tally.so/embed/xX0z6G";

const painPoints = [
  "Spending 10+ hours a week editing instead of creating",
  "Posting inconsistently because editing takes too long",
  "Unreliable freelancers who ghost or miss deadlines",
  "Quality varies wildly from video to video",
  "Losing momentum while waiting for edits",
];

const benefits = [
  { icon: Upload, title: "Upload & Forget", description: "Drop your raw footage and a brief. We handle everything." },
  { icon: Clock, title: "48-Hour Delivery", description: "Polished videos back within 48 hours. Every time." },
  { icon: RefreshCw, title: "Easy Revisions", description: "3 revision rounds included. Simple feedback flow." },
  { icon: Star, title: "Your Assigned Editor", description: "Matched editor who understands your style." },
  { icon: TrendingUp, title: "Post More, Grow Faster", description: "Consistent posting = faster growth. We enable it." },
  { icon: Zap, title: "Low-Friction Workflow", description: "Submit via dashboard, Drive, or upload." },
];

const ForCreators = () => {
  return (
    <>
      <SEO
        title="For Creators - Short-Form Editing Without the Mess"
        description="Upload raw footage, get polished short-form videos back in 48 hours."
      />

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* HERO */}
        <section className="halo relative min-h-[90vh] flex items-center overflow-hidden px-4 pt-28 pb-16">
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                For content creators
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                Stop editing at 2 AM. <span className="text-primary">Start posting more.</span>
              </EditorialHeading>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-8">
                Upload your raw footage. Get polished short-form videos back in 48 hours.
                No chasing. No chaos. Just reliable editing.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/pricing">
                  <Button variant="hero" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    View Plans <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/showcase">
                  <Button variant="hero-outline" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    See Example Edits
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <BentoCard variant="sand" className="max-w-lg mx-auto mt-16 p-6 text-left">
                <p className="text-sm text-muted-foreground mb-4 text-center">Sound familiar?</p>
                <ul className="space-y-3">
                  {painPoints.map((point) => (
                    <li key={point} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </BentoCard>
            </Reveal>
          </div>
        </section>

        {/* BENEFITS */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Why creators choose us</p>
            <EditorialHeading as="h2">Made for people who post daily.</EditorialHeading>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <BentoCard className="p-6 h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-card flex items-center justify-center mb-4">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2 text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* FINAL CTA */}
        <section className="px-4 py-20 md:py-28">
          <Reveal className="max-w-6xl mx-auto">
            <BentoCard variant="primary" className="px-6 py-20 text-center rounded-[2.5rem]">
              <EditorialHeading as="h2" className="text-4xl md:text-6xl">
                Ready to post more without the grind?
              </EditorialHeading>
              <p className="text-primary-foreground/85 text-lg max-w-md mx-auto mt-6">
                Save 10+ hours a week and keep your cadence on autopilot.
              </p>
              <div className="mt-9">
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access">
                  <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                    Get started <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
              </div>
            </BentoCard>
          </Reveal>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ForCreators;
