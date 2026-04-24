import { motion } from "framer-motion";
import { Award, Star, Clock, CheckCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Verified Editor",
    icon: CheckCircle,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
    count: "All approved editors",
    description: "Passed portfolio review, test edit, and onboarding",
  },
  {
    name: "Priority Editor",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    count: "Top 30%",
    description: "20+ jobs, 4.5+ rating, 90% on-time delivery",
    highlighted: true,
  },
  {
    name: "Premier Editor",
    icon: Award,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    count: "Top 10%",
    description: "50+ jobs, 4.8+ rating, 95% on-time delivery",
  },
];

const vettingSteps = [
  { step: "01", title: "Portfolio Review", desc: "We manually review every editor's past work" },
  { step: "02", title: "Test Edit", desc: "Paid test edit to verify quality and style" },
  { step: "03", title: "Skills Assessment", desc: "Premiere Pro / DaVinci proficiency check" },
  { step: "04", title: "Ongoing Monitoring", desc: "Ratings, revision rates, and turnaround tracked" },
];

const EditorTrustSection = () => {
  return (
    <section className="py-24 md:py-32 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Editor Quality</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Not just anyone. Only the{" "}
            <span className="text-gradient">best get through.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every editor in our network is manually vetted, tested, and continuously monitored. No freelancer roulette here.
          </p>
        </motion.div>

        {/* Vetting Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
          {vettingSteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 bg-card rounded-2xl border border-border text-center"
            >
              <div className="text-4xl font-heading font-bold text-primary/15 mb-3">{step.step}</div>
              <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Editor Tiers */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border text-center ${tier.bg} ${tier.border} ${
                tier.highlighted ? "ring-1 ring-primary" : ""
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${tier.bg}`}>
                <tier.icon className={`w-6 h-6 ${tier.color}`} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${tier.color}`}>{tier.count}</span>
              <h3 className="font-heading font-semibold mt-1 mb-2">{tier.name}</h3>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>100+ editors in network</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>48h guaranteed turnaround</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-primary" />
              <span>4.8/5 average rating</span>
            </div>
          </div>
          <Link to="/editors" className="text-sm text-primary hover:underline font-medium">
            Meet our editors →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default EditorTrustSection;