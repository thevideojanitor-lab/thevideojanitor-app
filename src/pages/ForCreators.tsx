import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Upload, Clock, RefreshCw, Star, TrendingUp, Zap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { TallyModal } from "@/components/TallyModal";
const WAITLIST_URL = "https://tally.so/embed/xX0z6G";

const painPoints = [
  "Spending 10+ hours a week editing instead of creating",
  "Posting inconsistently because editing takes too long",
  "Unreliable freelancers who ghost or miss deadlines",
  "Quality varies wildly from video to video",
  "Losing momentum while waiting for edits",
];

const benefits = [
  {
    icon: Upload,
    title: "Upload & Forget",
    description: "Drop your raw footage and a brief. That's it. We handle everything from cuts to captions to platform formatting.",
  },
  {
    icon: Clock,
    title: "48-Hour Delivery",
    description: "Get polished, platform-ready videos back within 48 hours. Every time. No chasing, no delays.",
  },
  {
    icon: RefreshCw,
    title: "Easy Revisions",
    description: "3 revision rounds included per request. Request changes in plain English through the dashboard.",
  },
  {
    icon: Star,
    title: "Your Assigned Editor",
    description: "We match you with an editor who gets your style. Not a random from a pool. Swap anytime if it's not right.",
  },
  {
    icon: TrendingUp,
    title: "Post More, Grow Faster",
    description: "Creators who post consistently 3–5x/week grow 3x faster. We make that possible without the burnout.",
  },
  {
    icon: Zap,
    title: "Low-Friction Workflow",
    description: "Submit via dashboard, Google Drive link, or direct upload. We work with your existing workflow.",
  },
];

const whatIsIncluded = [
  "Jump cuts and pacing optimization",
  "Hook emphasis and structure",
  "Captions / subtitles",
  "Color correction",
  "Music and sound polish",
  "B-roll insertion",
  "Platform-specific formatting (9:16, 1:1, 16:9)",
  "Trending effects (on request)",
];

const ForCreators = () => {
  return (
    <>
      <SEO
        title="For Creators - Short-Form Editing Without the Mess"
        description="Stop editing your own reels. Upload raw footage, get polished short-form videos back in 48 hours. Vetted editors, 3 revision rounds, swap anytime."
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8"
            >
              For Content Creators
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Stop editing at 2 AM.{" "}
              <span className="text-gradient">Start posting more.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Upload your raw footage. Get polished short-form videos back in 48 hours. No freelancer roulette. No chasing. Just clean, fast, reliable editing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link to="/pricing">
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  View Plans <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/showcase">
                <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                  See Example Edits
                </Button>
              </Link>
            </motion.div>

            {/* Pain Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-lg mx-auto bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm text-left"
            >
              <p className="text-sm font-medium text-muted-foreground mb-4 text-center">Sound familiar?</p>
              <ul className="space-y-2.5">
                {painPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Why Creators Choose Us</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Your editing partner. Not a freelancer gamble.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">What You Get</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Everything in every edit.</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">No nickel-and-diming. Here's what's included in every standard request.</p>
            </motion.div>

            <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-3">
              {whatIsIncluded.map((item, i) => (
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

        {/* How It Works */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">How It Works</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">Four steps. Zero headaches.</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                { step: "01", title: "Buy a Plan", desc: "Choose credits based on how much you post. Scale up or down anytime." },
                { step: "02", title: "Submit a Request", desc: "Upload raw footage + brief. Tell us your style, platform, and what you need." },
                { step: "03", title: "Get Matched", desc: "We assign an editor who fits your content style and niche. No random picks." },
                { step: "04", title: "Review & Download", desc: "48 hours later, your edit is ready. Request revisions or download and post." },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-heading font-bold text-primary/20 mb-4">{s.step}</div>
                  <h3 className="font-heading text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Ready to post more{" "}
                <span className="text-gradient">without the editing grind?</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10">
                Join creators who've reclaimed 10+ hours a week. Upload footage, get polished content back. Simple as that.
              </p>
              <TallyModal
                url={WAITLIST_URL}
                title="Join the Waitlist"
                subtitle="Get early access when we launch"
              >
                <Button variant="hero" size="lg" className="text-base px-8 py-6">
                  Get Started Today <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </TallyModal>
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

export default ForCreators;