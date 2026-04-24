import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Repeat, TrendingUp, Play, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const useCases = [
  { icon: ShoppingBag, title: "Product Promos", desc: "Showcase your products with engaging short-form ads for TikTok, Reels, and Shorts." },
  { icon: Play, title: "UGC Editing", desc: "Turn raw user-generated content into polished, conversion-ready video ads." },
  { icon: Repeat, title: "Content Repurposing", desc: "Turn long-form content into multiple short clips. Maximize every piece of content." },
  { icon: TrendingUp, title: "Promotional Campaigns", desc: "Launch-ready video content for sales, announcements, and brand moments." },
  { icon: Star, title: "Testimonials & Reviews", desc: "Polish customer testimonials into compelling social proof videos." },
];

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
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8"
            >
              For SMBs, E-commerce & Service Businesses
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Short-form content that{" "}
              <span className="text-gradient">actually converts.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Managed short-form video editing for brands that need consistent, polished content on TikTok, Instagram Reels, and YouTube Shorts. Without the overhead.
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
                  Book a Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Use Cases</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Every type of brand content. Handled.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {useCases.map((uc, i) => (
                <motion.div
                  key={uc.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <uc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Platforms</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Optimized for every platform.
              </h2>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              {["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn Video", "Facebook Reels", "X / Twitter"].map((platform) => (
                <div key={platform} className="bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium">
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Your brand. Polished content.{" "}
                <span className="text-gradient">48 hours.</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10">
                Start with a plan that fits your volume. Scale up as your content needs grow.
              </p>
              <Link to="/pricing">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  See Pricing <ArrowRight className="w-5 h-5 ml-1" />
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

export default ForBrands;