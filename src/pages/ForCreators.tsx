// src/pages/ForCreators.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Upload, Clock, RefreshCw, Star,
  TrendingUp, Zap, ArrowRight
} from "lucide-react";
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
    description: "Drop your raw footage and a brief. We handle everything.",
  },
  {
    icon: Clock,
    title: "48-Hour Delivery",
    description: "Polished videos back within 48 hours. Every time.",
  },
  {
    icon: RefreshCw,
    title: "Easy Revisions",
    description: "3 revision rounds included. Simple feedback flow.",
  },
  {
    icon: Star,
    title: "Your Assigned Editor",
    description: "Matched editor who understands your style.",
  },
  {
    icon: TrendingUp,
    title: "Post More, Grow Faster",
    description: "Consistent posting = faster growth. We enable it.",
  },
  {
    icon: Zap,
    title: "Low-Friction Workflow",
    description: "Submit via dashboard, Drive, or upload.",
  },
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
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">

          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

          <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">

            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-sm mb-8"
            >
              For Content Creators
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              Stop editing at 2 AM.{" "}
              <span className="text-gradient">Start posting more.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Upload your raw footage. Get polished short-form videos back in 48 hours.
              No chasing. No chaos. Just reliable editing.
            </motion.p>

            {/* 🔥 PREMIUM CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-lg mx-auto mb-16"
            >
              <div className="flex flex-col sm:flex-row gap-4">

                {/* Primary */}
                <Link to="/pricing" className="w-full sm:flex-1">
                  <Button
                    variant="hero"
                    size="lg"
                    className="
                      w-full h-14 text-base font-semibold
                      flex items-center justify-center gap-2
                      transition-all duration-300
                      hover:scale-[1.02]
                      hover:shadow-[0_0_25px_rgba(255,115,0,0.4)]
                      active:scale-[0.98]
                    "
                  >
                    View Plans
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                {/* Secondary */}
                <Link to="/showcase" className="w-full sm:flex-1">
                  <Button
                    variant="hero-outline"
                    size="lg"
                    className="
                      w-full h-14 text-base font-semibold
                      flex items-center justify-center
                      transition-all duration-300
                      hover:scale-[1.02]
                      hover:border-primary/60
                      active:scale-[0.98]
                    "
                  >
                    See Example Edits
                  </Button>
                </Link>

              </div>
            </motion.div>

            {/* Pain Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-lg mx-auto bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm text-left"
            >
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Sound familiar?
              </p>
              <ul className="space-y-3">
                {painPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-16">
              Why Creators Choose Us
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <b.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 bg-card/30">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to post more{" "}
              <span className="text-gradient">without the grind?</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10">
              Join creators saving 10+ hours a week.
            </p>

            <TallyModal
              url={WAITLIST_URL}
              title="Join the Waitlist"
              subtitle="Get early access"
            >
              <Button
                variant="hero"
                size="lg"
                className="h-14 px-10 text-base font-semibold hover:scale-[1.02] transition"
              >
                Get Started
              </Button>
            </TallyModal>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ForCreators;