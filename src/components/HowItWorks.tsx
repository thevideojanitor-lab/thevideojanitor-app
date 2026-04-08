import { motion } from "framer-motion";
import { CreditCard, Upload, Sparkles } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    step: "01",
    title: "Subscribe",
    description: "Pick a plan that fits your volume. No contracts, cancel anytime.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Submit",
    description: "Upload raw footage and a brief. We match you with the right editor.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Receive",
    description: "Get polished, platform-ready reels back within 48 hours.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">How It Works</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Three steps. Zero headaches.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="absolute -top-4 left-8 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                {step}
              </div>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
