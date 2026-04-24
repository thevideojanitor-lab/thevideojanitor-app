// src/pages/AboutPage.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Heart, Target, Shield, TrendingUp, Users, Zap, ArrowRight, Check
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const values = [
  {
    icon: Shield,
    title: "Reliability over volume",
    description:
      "We'd rather have 20 editors who consistently deliver on time than 200 who don't. Quality control is non-negotiable.",
  },
  {
    icon: Heart,
    title: "Fair to both sides",
    description:
      "Clients deserve polished work. Editors deserve fair pay and stable income. We designed the platform to protect both.",
  },
  {
    icon: Target,
    title: "Clarity, not complexity",
    description:
      "Credits. Requests. 48 hours. Three words that describe our whole model. We deliberately keep things simple.",
  },
  {
    icon: TrendingUp,
    title: "Built to scale with you",
    description:
      "Whether you're a solo creator or a 30-client agency, the system works the same. Clean, predictable, scalable.",
  },
];

const differentiators = [
  "We match you — you don't browse and gamble",
  "Every editor is vetted, tested, and monitored",
  "All communication stays on-platform",
  "Swap editors without drama or awkward conversations",
  "Credits give you flexibility without open-ended commitments",
  "Admin oversight on every job, not just complaints",
];

const milestones = [
  { number: "48h", label: "Standard turnaround" },
  { number: "50+", label: "Vetted editors" },
  { number: "3", label: "Revision rounds included" },
  { number: "100+", label: "Creators & agencies served" },
];

const AboutPage = () => {
  return (
    <>
      <SEO
        title="About Us - TheVideoJanitors"
        description="Learn why TheVideoJanitors was built, what makes us different, and our mission for both editors and clients. Managed short-form video editing without the mess."
        keywords="about thevideojanitors, video editing company, managed video editing platform"
        canonical="https://thevideojanitors.com/about"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              About Us
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              We clean up your{" "}
              <span className="text-gradient">content workflow.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl leading-relaxed"
            >
              TheVideoJanitors was built because the current way of getting short-form content edited is broken.
              Freelancer roulette. Missed deadlines. Ghost editors. Wildly inconsistent quality. We decided to fix it.
            </motion.p>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-16 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-heading text-4xl md:text-5xl font-bold text-gradient mb-2">
                    {m.number}
                  </div>
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why We Built It */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
                Why We Built This
              </p>
            </motion.div>

            <div className="space-y-6 text-text-secondary leading-relaxed">
              {[
                {
                  text: `Short-form video is the single most valuable content format right now. TikTok, Instagram Reels, YouTube Shorts — every creator, brand, and agency needs to be producing it consistently. But editing is where everything breaks down.`,
                },
                {
                  text: `The problem isn't talent. There are thousands of skilled video editors. The problem is the system. Platforms like Fiverr and Upwork put the burden on you to find, vet, negotiate with, and manage freelancers. Every time you need someone new, you start from scratch. Every time an editor ghosts you, you lose days.`,
                },
                {
                  text: `We built TheVideoJanitors to be the managed layer between you and talented editors. You subscribe, submit your footage, and we handle the matching, communication oversight, quality review, and revision flow. You get polished content. Editors get steady, structured work. We handle the messy middle.`,
                },
                {
                  text: `The name says it all. We're not the flashiest service in the room. We're the ones who show up reliably, do the job properly, and leave things cleaner than we found them. Every time.`,
                },
              ].map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-base md:text-lg"
                >
                  {para.text}
                </motion.p>
              ))}
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-24 md:py-32 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                What Makes Us Different
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold max-w-2xl mx-auto">
                Not a marketplace. A managed editing service.
              </h2>
            </motion.div>

            <div className="max-w-2xl mx-auto space-y-3">
              {differentiators.map((d, i) => (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{d}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Our Values
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                What we stand for.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-3">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission — Both Sides */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Our Mission
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Built for both sides of the equation.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Clients */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">For Clients</h3>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                  Our mission is to remove every friction point between your raw footage and a polished,
                  platform-ready video. You shouldn't need to manage people, chase deliverables, or
                  compromise on quality because you can't afford a full-time editor.
                </p>
                <p className="text-text-secondary leading-relaxed text-sm">
                  TheVideoJanitors gives you the consistency of an in-house editor at a fraction of
                  the cost, without any of the HR overhead.
                </p>
              </motion.div>

              {/* For Editors */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold">For Editors</h3>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                  Our mission is to give skilled video editors a better way to work. No bidding wars.
                  No chasing invoices. No clients who ghost. Just structured, well-briefed jobs with
                  fair pay and reliable weekly payouts.
                </p>
                <p className="text-text-secondary leading-relaxed text-sm">
                  We believe editors deserve to focus on their craft — not on business development.
                  That's why we built a tier system that rewards quality and creates a real career path.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Ready to work with us?{" "}
                <span className="text-gradient">Let's get started.</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10">
                Whether you need editing done or you want to join our editor network — we'd love to have you.
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
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;