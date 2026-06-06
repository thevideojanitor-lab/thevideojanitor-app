import { Button } from "@/components/ui/button";
import { ShoppingBag, Repeat, TrendingUp, Play, Star, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { TallyModal } from "@/components/TallyModal";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const WAITLIST_URL = "https://tally.so/embed/xX0z6G";

const useCases = [
  { icon: ShoppingBag, title: "Product Promos", desc: "Showcase your products with engaging short-form ads for TikTok, Reels, and Shorts." },
  { icon: Play, title: "UGC Editing", desc: "Turn raw user-generated content into polished, conversion-ready video ads." },
  { icon: Repeat, title: "Content Repurposing", desc: "Turn long-form content into multiple short clips. Maximize every piece of content." },
  { icon: TrendingUp, title: "Promotional Campaigns", desc: "Launch-ready video content for sales, announcements, and brand moments." },
  { icon: Star, title: "Testimonials & Reviews", desc: "Polish customer testimonials into compelling social proof videos." },
];

const platforms = ["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn Video", "Facebook Reels", "X / Twitter"];

const ForBrands = () => {
  return (
    <>
      <SEO
        title="For Brands & Businesses - Short-Form Video Editing"
        description="Promotional content editing for SMBs, e-commerce brands, and service businesses. Reels, TikToks, Shorts - polished and ready in 48 hours."
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="halo relative min-h-[85vh] flex items-center overflow-hidden px-4 pt-28 pb-16">
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                For SMBs, e-commerce &amp; service businesses
              </span>
            </Reveal>

            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                Short-form content that <span className="text-primary">actually converts.</span>
              </EditorialHeading>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-8 leading-relaxed">
                Managed short-form video editing for brands that need consistent, polished content on
                TikTok, Instagram Reels, and YouTube Shorts. Without the overhead.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access for your brand">
                  <Button variant="hero" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    View Plans <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Book a demo with our team">
                  <Button variant="hero-outline" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    Book a Demo
                  </Button>
                </TallyModal>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Use Cases */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Use cases</p>
            <EditorialHeading as="h2">Every type of brand content. Handled.</EditorialHeading>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {useCases.map((uc, i) => (
              <Reveal key={uc.title} delay={i * 0.06}>
                <BentoCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-card bg-primary/10 flex items-center justify-center mb-5">
                    <uc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2 text-foreground">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Platforms */}
        <Section>
          <Reveal className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Platforms</p>
            <EditorialHeading as="h2">Optimized for every platform.</EditorialHeading>
          </Reveal>
          <Reveal className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {platforms.map((platform) => (
              <div key={platform} className="bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium shadow-lift">
                {platform}
              </div>
            ))}
          </Reveal>
        </Section>

        {/* CTA */}
        <section className="px-4 py-20 md:py-28">
          <Reveal className="max-w-6xl mx-auto">
            <BentoCard variant="primary" className="px-6 py-20 text-center rounded-[2.5rem]">
              <EditorialHeading as="h2" className="text-4xl md:text-6xl">
                Your brand. Polished content. 48 hours.
              </EditorialHeading>
              <p className="text-primary-foreground/85 text-lg max-w-md mx-auto mt-6">
                Start with a plan that fits your volume. Scale up as your content needs grow.
              </p>
              <div className="mt-9">
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access for your brand">
                  <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                    See Pricing <ArrowUpRight className="w-5 h-5 ml-1" />
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

export default ForBrands;
