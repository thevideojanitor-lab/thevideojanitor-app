import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check, Coins, Info } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const plans = [
  {
    name: "Quick Sweep",
    tagline: "For creators with light monthly needs",
    monthlyPrice: 99,
    quarterlyPrice: 89,
    annualPrice: 79,
    credits: 350,
    activeRequests: 1,
    turnaround: "48 hours",
    revisions: "3 revision rounds",
    bestFor: "Solo creators posting 1–2x/week",
    features: [
      "350 credits/month",
      "1 active request at a time",
      "48h standard turnaround",
      "3 revision rounds per request",
      "1 dedicated editor",
      "Basic captions included",
      "Credit recharges available",
      "Platform-specific formatting",
    ],
    addons: ["+ Captions style upgrade", "+ Motion graphics", "+ Rush turnaround"],
    popular: false,
    cta: "Start with Quick Sweep",
  },
  {
    name: "Deep Clean",
    tagline: "For growing brands and agencies",
    monthlyPrice: 249,
    quarterlyPrice: 224,
    annualPrice: 199,
    credits: 950,
    activeRequests: 2,
    turnaround: "48 hours",
    revisions: "3 revision rounds",
    bestFor: "Brands posting 3–5x/week",
    features: [
      "950 credits/month",
      "2 active requests at a time",
      "48h standard turnaround",
      "3 revision rounds per request",
      "Priority editor matching",
      "Access to stronger editors",
      "Custom brand templates",
      "Swap editors anytime",
      "Rush turnaround available",
    ],
    addons: ["+ Premium captions", "+ Motion graphics pack", "+ Extra revision"],
    popular: true,
    cta: "Start with Deep Clean",
  },
  {
    name: "Full Service",
    tagline: "For teams with ongoing volume",
    monthlyPrice: 599,
    quarterlyPrice: 539,
    annualPrice: 479,
    credits: 2500,
    activeRequests: 4,
    turnaround: "48h / Rush available",
    revisions: "3 revision rounds",
    bestFor: "Agencies and high-volume brands",
    features: [
      "2,500 credits/month",
      "4 active requests at a time",
      "Priority queue",
      "3 revision rounds per request",
      "Multiple editors assigned",
      "Premium support",
      "Multi-brand management",
      "White-label delivery",
      "Account manager",
      "Rush turnaround priority",
    ],
    addons: ["+ Team seats", "+ Custom integrations"],
    popular: false,
    cta: "Start with Full Service",
  },
];

const creditExplainer = [
  { type: "Basic Edit", credits: 50, includes: "Cuts, transitions, basic b-roll, 9:16 format" },
  { type: "Standard Edit", credits: 70, includes: "All basic + captions, pacing, sound polish, hook" },
  { type: "Premium Edit", credits: 100, includes: "All standard + motion graphics, brand treatment" },
];

const addons = [
  { name: "Captions", credits: "+10 credits" },
  { name: "Premium Captions Style", credits: "+15 credits" },
  { name: "Motion Graphics", credits: "+25 credits" },
  { name: "Extra Cutdown Variant", credits: "+20 credits" },
  { name: "Rush Turnaround", credits: "+25 credits" },
  { name: "Extra Revision (after 3)", credits: "+10 credits" },
  { name: "SRT Export", credits: "+5 credits" },
];

type BillingCycle = "monthly" | "quarterly" | "annual";

const PricingSection = () => {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [showCredits, setShowCredits] = useState(false);

  const getPrice = (plan: typeof plans[0]) => {
    if (billing === "quarterly") return plan.quarterlyPrice;
    if (billing === "annual") return plan.annualPrice;
    return plan.monthlyPrice;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (billing === "quarterly") return Math.round(((plan.monthlyPrice - plan.quarterlyPrice) / plan.monthlyPrice) * 100);
    if (billing === "annual") return Math.round(((plan.monthlyPrice - plan.annualPrice) / plan.monthlyPrice) * 100);
    return 0;
  };

  return (
    <Section id="pricing">
      <Reveal className="text-center mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Pricing</p>
        <EditorialHeading as="h2">Simple plans. No surprises.</EditorialHeading>
        <p className="text-muted-foreground max-w-xl mx-auto mt-5 mb-8">
          Buy credits. Submit requests. Get polished edits back in 48 hours. Scale up or down anytime.
        </p>

        {/* Credit explainer button */}
        <button
          onClick={() => setShowCredits(!showCredits)}
          className="inline-flex items-center gap-2 text-sm text-primary border border-primary/30 rounded-full px-4 py-2 hover:bg-primary/10 transition-colors mb-8"
        >
          <Coins className="w-4 h-4" />
          What is a credit?
          <Info className="w-3.5 h-3.5" />
        </button>

        {/* Credit Explainer */}
        {showCredits && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-10 bg-card border border-primary/20 rounded-card p-6 text-left shadow-lift"
          >
            <h3 className="font-heading font-semibold mb-1">Credits = Your editing currency</h3>
            <p className="text-sm text-muted-foreground mb-5">
              1 credit ≠ 1 video. Credits reflect complexity. Here's how it works:
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {creditExplainer.map((item) => (
                <div key={item.type} className="bg-surface-elevated rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{item.type}</span>
                    <span className="text-primary font-bold text-sm">{item.credits} credits</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.includes}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Add-ons (extra credits)</p>
              <div className="flex flex-wrap gap-2">
                {addons.map((addon) => (
                  <span key={addon.name} className="text-xs bg-card border border-border rounded-full px-3 py-1.5">
                    {addon.name}: <span className="text-primary font-medium">{addon.credits}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing Toggle */}
        <div className="inline-flex bg-surface-elevated rounded-full p-1 gap-1">
          {(["monthly", "quarterly", "annual"] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBilling(cycle)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                billing === cycle ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cycle}
              {cycle !== "monthly" && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  SAVE
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-12">
        {plans.map((plan, i) => {
          const ink = plan.popular;
          const mutedText = ink ? "text-background/70" : "text-muted-foreground";
          const subtleText = ink ? "text-background/60" : "text-muted-foreground";
          const pill = ink ? "bg-background/10" : "bg-surface-elevated";
          return (
            <Reveal key={plan.name} delay={i * 0.06}>
              <BentoCard
                variant={ink ? "ink" : "default"}
                className="relative p-8 flex flex-col h-full"
              >
                {ink && (
                  <div className="absolute -top-3 left-8 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-heading text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className={`text-xs mb-4 ${subtleText}`}>{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`font-heading text-5xl font-bold ${ink ? "text-primary" : "text-foreground"}`}>
                      ${getPrice(plan)}
                    </span>
                    <span className={`text-sm ${mutedText}`}>/mo</span>
                    {billing !== "monthly" && (
                      <span className="text-xs text-primary font-medium ml-1">Save {getSavings(plan)}%</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs mb-1">
                    <span className="bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
                      {plan.credits} credits/mo
                    </span>
                    <span className={`px-2.5 py-1 rounded-full ${pill} ${mutedText}`}>
                      {plan.activeRequests} active request{plan.activeRequests > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${mutedText}`}>Best for: {plan.bestFor}</p>
                </div>

                <Link to="/contact" className="mb-6">
                  <Button variant={plan.popular ? "hero" : "hero-outline"} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className={ink ? "text-background/80" : "text-muted-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.addons.length > 0 && (
                  <div className={`mt-6 pt-6 border-t ${ink ? "border-background/15" : "border-border"}`}>
                    <p className={`text-xs font-medium mb-2 ${mutedText}`}>Available add-ons:</p>
                    <ul className="space-y-1.5">
                      {plan.addons.map((a) => (
                        <li key={a} className={`text-xs ${mutedText}`}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </BentoCard>
            </Reveal>
          );
        })}
      </div>

      {/* Credit Recharge Banner */}
      <Reveal className="max-w-3xl mx-auto">
        <BentoCard className="p-6 text-center">
          <Coins className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-heading font-semibold mb-2">Need more credits mid-month?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Top up anytime with credit recharge packs. No need to upgrade your plan.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { credits: "100 credits", price: "$30" },
              { credits: "250 credits", price: "$70" },
              { credits: "500 credits", price: "$130" },
            ].map(({ credits, price }) => (
              <div key={credits} className="bg-surface-elevated rounded-xl px-4 py-2 text-sm">
                <span className="font-semibold text-primary">{credits}</span>
                <span className="text-muted-foreground ml-2">→ {price}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Credits roll over while your subscription remains active</p>
        </BentoCard>
      </Reveal>
    </Section>
  );
};

export default PricingSection;
