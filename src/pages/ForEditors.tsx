// src/pages/ForEditors.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Calendar, Coins, TrendingUp, Clock,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import editorHeroBg from "@/assets/editor-hero-bg.jpg";
import SEO from "@/components/SEO";
import { TallyModal } from "@/components/TallyModal";

const EDITOR_FORM_URL = "https://tally.so/embed/Y5o9X0";

const trustSignals = [
  { icon: ShieldCheck, label: "No Bidding Wars" },
  { icon: Coins, label: "Weekly Payouts" },
  { icon: TrendingUp, label: "Merit-Based Growth" },
];

const ForEditors = () => {
  return (
    <>
      <SEO
        title="For Editors - Join Our Network"
        description="Join 100+ vetted editors. Get consistent work, fair pay, and weekly payouts."
      />

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={editorHeroBg}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">

            {/* Heading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm uppercase tracking-widest text-primary mb-6"
            >
              Trusted by 100+ editors
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              Consistent short-form editing work.{" "}
              <span className="text-primary">
                Fair pay. No bidding wars.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Join a vetted network of editors. Get assigned jobs based on your
              skills and availability. Earn credits, cash out weekly.
            </motion.p>

            {/* 🔥 FIXED + PREMIUM CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-lg mx-auto mb-16"
            >
              <div className="flex flex-col sm:flex-row gap-4 w-full">

                {/* Primary */}
                <TallyModal
                  url={EDITOR_FORM_URL}
                  title="Editor Application"
                  subtitle="Apply to join our vetted editor network"
                >
                  <Button
                    variant="hero"
                    size="lg"
                    className="
                      w-full sm:flex-1 h-14 text-base font-semibold
                      flex items-center justify-center gap-2
                      transition-all duration-300
                      hover:scale-[1.02] hover:shadow-xl
                      active:scale-[0.98]
                    "
                  >
                    Apply to be an Editor
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </TallyModal>

                {/* Secondary */}
                <Button
                  variant="hero-outline"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("requirements")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="
                    w-full sm:flex-1 h-14 text-base font-semibold
                    flex items-center justify-center
                    transition-all duration-300
                    hover:scale-[1.02] hover:border-primary/60
                    active:scale-[0.98]
                  "
                >
                  View Requirements
                </Button>

              </div>
            </motion.div>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-8">
              {trustSignals.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ForEditors;