// src/pages/ShowcasePage.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShowcaseSection from "@/components/ShowcaseSection";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TallyModal } from "@/components/TallyModal";

const WAITLIST_FORM_URL = "https://tally.so/embed/xX0z6G";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const categories = [
  { label: "Talking Head", desc: "Podcast clips, interview cuts, direct-to-camera content", count: "Most requested" },
  { label: "Product Demo", desc: "E-commerce, app demos, feature walkthroughs", count: "High converting" },
  { label: "Podcast Clips", desc: "Long-form to short-form repurposing", count: "Best for growth" },
  { label: "UGC Ads", desc: "User-generated content polished into ad-ready assets", count: "Performance focus" },
  { label: "Brand Content", desc: "Promotional, announcements, campaign videos", count: "Agency favourite" },
  { label: "Motion Graphics", desc: "Animated text, transitions, branded elements", count: "Premium tier" },
];

const included = [
  "Jump cuts and pacing optimization",
  "Hook emphasis and structure",
  "Captions / subtitles (standard)",
  "Color correction and grading",
  "Music and sound polish",
  "B-roll insertion",
  "Platform-specific formatting",
  "Trending effects (on request)",
  "Basic transitions",
  "Export in correct aspect ratio",
];

const platforms = [
  { name: "TikTok", ratio: "9:16", best: "15–60 sec" },
  { name: "Instagram Reels", ratio: "9:16", best: "15–90 sec" },
  { name: "YouTube Shorts", ratio: "9:16", best: "Up to 60 sec" },
  { name: "LinkedIn Video", ratio: "1:1 or 16:9", best: "30–90 sec" },
  { name: "Facebook Reels", ratio: "9:16", best: "Up to 90 sec" },
  { name: "X / Twitter", ratio: "16:9 or 1:1", best: "Under 60 sec" },
];

const ShowcasePage = () => {
  return (
    <>
      <SEO
        title="Showcase - TheVideoJanitors"
        description="See before and after examples of short-form video editing by TheVideoJanitors. Talking heads, product demos, UGC ads, podcast clips, and more."
        keywords="video editing examples, before after video editing, short form video examples, reel editing samples"
        canonical="https://thevideojanitor.com/showcase"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="halo relative px-4 pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Showcase</p>
            </Reveal>
            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                Raw footage in. <span className="text-primary">Polished reels out.</span>
              </EditorialHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
                See the difference our editors make. Toggle between before and after to see exactly what we deliver — across every content type.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <TallyModal
                  url={WAITLIST_FORM_URL}
                  title="Join the Waitlist"
                  subtitle="Get early access when we launch"
                >
                  <Button variant="hero" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    Join the Waitlist <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
                <Link to="/how-it-works">
                  <Button variant="hero-outline" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    How It Works
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Before/After (reuse existing editorial component) */}
        <ShowcaseSection />

        {/* Content Categories */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Content types</p>
            <EditorialHeading as="h2">Every format. Every niche.</EditorialHeading>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {categories.map((cat, i) => (
              <Reveal key={cat.label} delay={i * 0.06}>
                <BentoCard className="p-6 h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[11px] bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold mb-2 text-foreground">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* What's Included */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">What's included</p>
            <EditorialHeading as="h2">Standard in every edit.</EditorialHeading>
          </Reveal>
          <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-3">
            {included.map((item, i) => (
              <Reveal key={item} delay={i * 0.04}>
                <BentoCard className="flex items-center gap-3 p-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Platform Specs */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Platform optimization</p>
            <EditorialHeading as="h2">Formatted for every platform.</EditorialHeading>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {platforms.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.06}>
                <BentoCard className="p-5 flex items-center justify-between h-full">
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Best: {p.best}</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{p.ratio}</span>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <section className="px-4 py-20 md:py-28">
          <Reveal className="max-w-6xl mx-auto">
            <BentoCard variant="primary" className="px-6 py-20 text-center rounded-[2.5rem]">
              <EditorialHeading as="h2" className="text-4xl md:text-6xl">
                Ready for content that actually looks this good?
              </EditorialHeading>
              <p className="text-primary-foreground/85 text-lg max-w-md mx-auto mt-6">
                Subscribe to a plan. Submit your footage. Get polished content back in 48 hours.
              </p>
              <div className="mt-9">
                <Link to="/pricing">
                  <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                    View Plans <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-primary-foreground/70 mt-8">
                No contracts · Cancel anytime · Credits roll over while subscribed
              </p>
            </BentoCard>
          </Reveal>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ShowcasePage;
