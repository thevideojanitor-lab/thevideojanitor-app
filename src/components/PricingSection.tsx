import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Quick Sweep",
    price: "$299",
    period: "/mo",
    credits: "4 credits",
    activeRequests: "1 active request",
    bestFor: "Small agencies, 1–2 clients",
    features: ["48h standard turnaround", "1 revision per edit", "Dedicated editor", "Platform optimization"],
    popular: false,
  },
  {
    name: "Deep Clean",
    price: "$599",
    period: "/mo",
    credits: "10 credits",
    activeRequests: "2 active requests",
    bestFor: "Growing agencies, 3–5 clients",
    features: ["48h standard turnaround", "2 revisions per edit", "Priority matching", "Swap editors anytime", "Custom brand templates"],
    popular: true,
  },
  {
    name: "Full Service",
    price: "$1,199",
    period: "/mo",
    credits: "25 credits",
    activeRequests: "5 active requests",
    bestFor: "Established agencies, 6+ clients",
    features: ["24h rush turnaround", "Unlimited revisions", "Dedicated team", "Account manager", "Multi-brand support", "API access"],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Pricing for Agencies</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Predictable pricing. Predictable results.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Scale your editing output without scaling your payroll. No contracts, cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border transition-colors ${
                plan.popular
                  ? "bg-card border-primary card-shadow"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="font-heading text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground mb-6">{plan.bestFor}</p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-heading text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <div className="flex gap-3 text-sm text-text-secondary mb-8">
                <span>{plan.credits}</span>
                <span className="text-border">·</span>
                <span>{plan.activeRequests}</span>
              </div>

              <Button
                variant={plan.popular ? "hero" : "hero-outline"}
                className="w-full mb-8"
              >
                Get Started
              </Button>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-text-secondary">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
