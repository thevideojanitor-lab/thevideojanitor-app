// src/components/FinalCta.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TallyModal } from "@/components/TallyModal";

const WAITLIST_URL = "https://tally.so/embed/xX0z6G";
const EDITOR_URL = "https://tally.so/embed/Y5o9X0";

const FinalCta = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
            Upload footage.{" "}
            <span className="text-gradient">We'll clean up the rest.</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            Join 50+ creators and agencies getting polished short-form content on autopilot. Vetted editors. 48h turnaround. Zero freelancer mess.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access when we launch">
              <Button variant="hero" size="lg" className="text-base px-8 py-6">
                View Plans <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </TallyModal>
            <TallyModal url={EDITOR_URL} title="Editor Application" subtitle="Apply to join our vetted editor network">
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                Apply as Editor
              </Button>
            </TallyModal>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            No contracts · Credits roll over while subscribed · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;