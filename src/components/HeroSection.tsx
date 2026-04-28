import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Clock, RefreshCw, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { EditorApplicationEmbed } from "@/components/EditorApplicationEmbed";
import { TallyModal } from "@/components/TallyModal";


const WAITLIST_URL = "https://tally.so/embed/xX0z6G";

const stats = [
  { value: "48h", label: "Turnaround" },
  { value: "100%", label: "Vetted Editors" },
  { value: "3", label: "Revision Rounds" },
  { value: "50+", label: "Clients Served" },
];

const trustSignals = [
  { icon: Shield, label: "Vetted Editors Only" },
  { icon: Clock, label: "48h Turnaround" },
  { icon: RefreshCw, label: "Swap Anytime" },
  { icon: Star, label: "Rated 4.8/5" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Video editing workspace"
          className="w-full h-full object-cover opacity-40 brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Trusted by 50+ creators and agencies
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
        >
          Video editing made simple.{" "}
          <span className="text-gradient">
            Buy credits, submit requests,
          </span>{" "}
          get matched with vetted editors.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload footage. We'll clean up the rest. Polished short-form videos back in 48 hours. No freelancer roulette. No chasing. No mess.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/pricing">
            <Button variant="hero" size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
              View Plans & Credits
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-card/50 border border-border rounded-xl p-4 text-center backdrop-blur-sm">
              <p className="font-heading text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 md:gap-10"
        >
          {trustSignals.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-text-secondary">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;