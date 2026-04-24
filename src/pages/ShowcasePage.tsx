// src/pages/ShowcasePage.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShowcaseSection from "@/components/ShowcaseSection";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    label: "Talking Head",
    desc: "Podcast clips, interview cuts, direct-to-camera content",
    count: "Most requested",
  },
  {
    label: "Product Demo",
    desc: "E-commerce, app demos, feature walkthroughs",
    count: "High converting",
  },
  {
    label: "Podcast Clips",
    desc: "Long-form to short-form repurposing",
    count: "Best for growth",
  },
  {
    label: "UGC Ads",
    desc: "User-generated content polished into ad-ready assets",
    count: "Performance focus",
  },
  {
    label: "Brand Content",
    desc: "Promotional, announcements, campaign videos",
    count: "Agency favourite",
  },
  {
    label: "Motion Graphics",
    desc: "Animated text, transitions, branded elements",
    count: "Premium tier",
  },
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
        canonical="https://thevideojanitors.com/showcase"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              Showcase
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Raw footage in.{" "}
              <span className="text-gradient">Polished reels out.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
            >
              See the difference our editors make. Toggle between before and after
              to see exactly what we deliver — across every content type.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/pricing">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Get Started <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  How It Works
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Showcase Section (reuse existing component) */}
        <ShowcaseSection />

        {/* Content Categories */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Content Types
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Every format. Every niche.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[11px] bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold mb-2">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included in Every Edit */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                What's Included
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Standard in every edit.
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-3">
              {[
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
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Specs */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Platform Optimization
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Formatted for every platform.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {platforms.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-card border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="font-heading font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Best: {p.best}</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                    {p.ratio}
                  </span>
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
                Ready for content that{" "}
                <span className="text-gradient">actually looks this good?</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10">
                Subscribe to a plan. Submit your footage. Get polished content back in 48 hours.
              </p>
              <Link to="/pricing">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  View Plans <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-4">
                No contracts · Cancel anytime · Credits roll over while subscribed
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ShowcasePage;