import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Clock, TrendingUp, Check, ShieldCheck, CircleCheck, ArrowUpRight, Quote } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import agencyHeroBg from "@/assets/agency-hero-bg.jpg";

const trustSignals = [
  { icon: ShieldCheck, label: "Vetted Editors" },
  { icon: Clock, label: "48h Turnaround" },
  { icon: TrendingUp, label: "Scale Without Hiring" },
];

const painPoints = [
  {
    icon: Shield,
    title: "No more freelancer roulette",
    description: "Every editor is vetted for quality, consistency, and reliability. No more gambling on Fiverr or Upwork.",
  },
  {
    icon: CircleCheck,
    title: "Consistent quality across clients",
    description: "Deliver the same polished standard to every client, every time. No more chasing editors for revisions.",
  },
  {
    icon: ArrowUpRight,
    title: "Scale without hiring",
    description: "Go from 5 to 50 clients without a single new hire. Predictable pricing, predictable output.",
  },
];

const steps = [
  { step: "01", title: "Subscribe", description: "Pick a plan that fits your client volume. Upgrade or downgrade anytime." },
  { step: "02", title: "Submit", description: "Upload raw footage, add a brief, and assign to a client project. Done in 2 minutes." },
  { step: "03", title: "Receive", description: "Get polished edits back in 48 hours. Request revisions or approve and deliver to your client." },
];

const plans = [
  {
    name: "Quick Sweep",
    price: "$299",
    period: "/mo",
    credits: "4 credits",
    activeRequests: "1 active request",
    bestFor: "Agencies with 1–3 clients",
    features: ["48h standard turnaround", "1 revision per edit", "Dedicated editor", "Platform optimization"],
    popular: false,
  },
  {
    name: "Deep Clean",
    price: "$599",
    period: "/mo",
    credits: "10 credits",
    activeRequests: "2 active requests",
    bestFor: "Agencies with 4–8 clients",
    features: ["48h standard turnaround", "2 revisions per edit", "Priority matching", "Swap editors anytime", "Custom brand templates"],
    popular: true,
  },
  {
    name: "Full Service",
    price: "$1,199",
    period: "/mo",
    credits: "25 credits",
    activeRequests: "5 active requests",
    bestFor: "High-volume agencies",
    features: ["24h rush turnaround", "Unlimited revisions", "Dedicated team", "Account manager", "Multi-brand support", "API access"],
    popular: false,
  },
];

const testimonials = [
  {
    quote: "We went from 8 to 22 clients in 3 months without hiring a single editor. TheVideoJanitors made scaling effortless.",
    name: "Sarah Chen",
    role: "Founder, Bright Agency",
    avatar: "SC",
  },
  {
    quote: "The consistency is what sold us. Every client gets the same quality, every time. Our retention rate went up 40%.",
    name: "Marcus Rivera",
    role: "Creative Director, Acme Marketing",
    avatar: "MR",
  },
  {
    quote: "48-hour turnaround means we can promise fast delivery to clients and actually keep that promise. Game changer.",
    name: "Priya Patel",
    role: "Operations Lead, Neon Digital",
    avatar: "PP",
  },
];

const ForAgencies = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={agencyHeroBg} alt="" className="w-full h-full object-cover opacity-20" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-sm font-medium uppercase tracking-widest text-primary mb-6">
            Trusted by 30+ agencies
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Agency Overflow?{" "}
            <span className="text-gradient">We handle the editing.</span>
            <br />You handle the strategy.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Subscribe to a plan. Get matched with a vetted editor. Receive polished reels in 48 hours. Scale without hiring.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" className="text-base px-8 py-6">Book Demo</Button>
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">View Plans</Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-wrap justify-center gap-8 md:gap-12">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-text-secondary">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agency Pain Points */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Why Agencies Choose Us</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Stop managing editors. Start scaling.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {painPoints.map((point, i) => (
              <motion.div key={point.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <point.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-3">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">How It Works</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Three steps. Zero complexity.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-5xl font-heading font-bold text-primary/20 mb-4">{s.step}</div>
                <h3 className="font-heading text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="agency-pricing" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Agency Pricing</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Predictable pricing. Predictable output.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Scale up or down anytime. No contracts, no surprises.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative p-8 rounded-2xl border transition-colors ${plan.popular ? "bg-card border-primary card-shadow" : "bg-card border-border hover:border-primary/30"}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
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
                <Button variant={plan.popular ? "hero" : "hero-outline"} className="w-full mb-8">Get Started</Button>
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

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Testimonials</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Agencies that scaled with us</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl bg-card border border-border">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
              Scale your agency{" "}
              <span className="text-gradient">without the editing overhead.</span>
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">Stop managing freelancers. Start delivering consistent, polished content to every client.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-base px-8 py-6">Book Demo</Button>
              <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">View Plans</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">100% satisfaction guarantee · No contracts · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForAgencies;
