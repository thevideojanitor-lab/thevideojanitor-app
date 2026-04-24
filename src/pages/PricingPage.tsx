// src/pages/PricingPage.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const comparisons = [
  {
    feature: "Turnaround time",
    us: "48 hours",
    agency: "1–2 weeks",
    freelancer: "Unpredictable",
  },
  {
    feature: "Editor vetting",
    us: "Fully vetted + tested",
    agency: "In-house only",
    freelancer: "You do it yourself",
  },
  {
    feature: "Revision rounds",
    us: "3 included",
    agency: "Varies / extra cost",
    freelancer: "Varies",
  },
  {
    feature: "Editor swaps",
    us: "Free (condition-based)",
    agency: "Not applicable",
    freelancer: "Start from scratch",
  },
  {
    feature: "Pricing model",
    us: "Credits — transparent",
    agency: "Retainer / project",
    freelancer: "Per hour / per video",
  },
  {
    feature: "Communication",
    us: "Monitored in-platform",
    agency: "Email / Slack",
    freelancer: "WhatsApp / DM",
  },
  {
    feature: "Cancel anytime",
    us: "Yes",
    agency: "Locked contracts",
    freelancer: "N/A",
  },
];

const PricingPage = () => {
  return (
    <>
      <SEO
        title="Pricing - TheVideoJanitors"
        description="Simple, transparent pricing. Quick Sweep at $99/mo, Deep Clean at $249/mo, Full Service at $599/mo. Buy credits, submit requests, get polished edits in 48 hours."
        keywords="video editing pricing, video editing subscription, short form editing plans, video editing credits"
        canonical="https://thevideojanitors.com/pricing"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-4 md:pt-40 md:pb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              Pricing
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              Simple plans.{" "}
              <span className="text-gradient">No surprises.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary max-w-xl mx-auto"
            >
              Buy credits. Submit requests. Get polished edits back in 48 hours.
              Scale up or down anytime — no contracts.
            </motion.p>
          </div>
        </section>

        {/* Pricing Section (reuse existing component) */}
        <PricingSection />

        {/* Comparison Table */}
        <section className="py-24 md:py-32 bg-card/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Why Us
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                How we compare.
              </h2>
            </motion.div>

            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground w-1/4">
                      Feature
                    </th>
                    <th className="py-4 px-4 text-center w-1/4">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                          TheVideoJanitors
                        </span>
                        <span className="text-[10px] text-muted-foreground">That's us</span>
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center w-1/4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Video Agency
                      </span>
                    </th>
                    <th className="py-4 px-4 text-center w-1/4">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Freelancer
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <motion.tr
                      key={row.feature}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className={`border-t border-border ${
                        i % 2 === 0 ? "bg-card/30" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {row.us}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                        {row.agency}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                        {row.freelancer}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Our Guarantees
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Built into every plan.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: "48-Hour Delivery",
                  desc: "Every standard request delivered within 48 hours. Rush options available.",
                },
                {
                  title: "3 Revision Rounds",
                  desc: "Included on every request. Leave timestamped feedback. We handle the rest.",
                },
                {
                  title: "Free Editor Swaps",
                  desc: "If your editor misses a deadline or drops the ball — swap instantly, no drama.",
                },
                {
                  title: "Credits Roll Over",
                  desc: "Unused credits carry forward each month as long as your subscription is active.",
                },
                {
                  title: "No Contracts",
                  desc: "Monthly, quarterly, or annual. Cancel before renewal and you won't be charged again.",
                },
                {
                  title: "Platform-Ready Output",
                  desc: "Every edit exported in the right format and aspect ratio for your platform.",
                },
              ].map((g, i) => (
                <motion.div
                  key={g.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{g.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-text-secondary mb-4">
                Questions about credits, revisions, or billing?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/faq">
                  <Button variant="hero-outline" size="sm">
                    Read the FAQ <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="ghost" size="sm">
                    Talk to us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
                Upload footage.{" "}
                <span className="text-gradient">We'll clean up the rest.</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
                Join 50+ creators and agencies getting polished short-form content on autopilot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="hero" size="lg" className="text-base px-8 py-6">
                    Get Started <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
                    See How It Works
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                No contracts · Credits roll over while subscribed · Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;