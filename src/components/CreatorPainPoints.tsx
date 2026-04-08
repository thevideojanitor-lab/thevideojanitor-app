import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle, Zap } from "lucide-react";

const painPoints = [
  {
    icon: ShieldCheck,
    title: "No more freelancer roulette",
    description: "Every editor is vetted for quality, reliability, and platform fluency. No more ghosting or missed deadlines.",
  },
  {
    icon: CheckCircle,
    title: "Consistent quality, every time",
    description: "Stop worrying about inconsistent edits. Get the same polished standard on every single reel you submit.",
  },
  {
    icon: Zap,
    title: "More content, less work",
    description: "Simple pricing and fast turnaround means you can post more without spending your weekends in an editor.",
  },
];

const CreatorPainPoints = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Built for Creators</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">You create. We polish.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {painPoints.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-primary" />
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

export default CreatorPainPoints;
