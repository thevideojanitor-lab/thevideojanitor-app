import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const FinalCta = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
            Post more.{" "}
            <span className="text-gradient">Edit less.</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10">
            Join 100+ creators getting polished short-form content on autopilot. 100% satisfaction guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-base px-8 py-6">
              Join Waitlist
            </Button>
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
              View Plans
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;
