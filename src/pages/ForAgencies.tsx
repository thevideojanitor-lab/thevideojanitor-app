// src/pages/ForAgencies.tsx
import { Button } from "@/components/ui/button";
import { Shield, Clock, TrendingUp, Check, ShieldCheck, CircleCheck, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { TallyModal } from "@/components/TallyModal";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const WAITLIST_URL = "https://tally.so/embed/xX0z6G";

const trustSignals = [
  { icon: ShieldCheck, label: "Vetted Editors" },
  { icon: Clock, label: "48h Turnaround" },
  { icon: TrendingUp, label: "Scale Without Hiring" },
];

const painPoints = [
  { icon: Shield, title: "No more freelancer roulette", description: "Every editor is vetted for quality, consistency, and reliability. No more gambling on Fiverr or Upwork." },
  { icon: CircleCheck, title: "Consistent quality across clients", description: "Deliver the same polished standard to every client, every time. No more chasing editors for revisions." },
  { icon: ArrowUpRight, title: "Scale without hiring", description: "Go from 5 to 50 clients without a single new hire. Predictable pricing, predictable output." },
];

const steps = [
  { step: "01", title: "Subscribe", description: "Pick a plan that fits your client volume. Upgrade or downgrade anytime." },
  { step: "02", title: "Submit", description: "Upload raw footage, add a brief, and assign to a client project. Done in 2 minutes." },
  { step: "03", title: "Receive", description: "Get polished edits back in 48 hours. Request revisions or approve and deliver to your client." },
];

// Standard site pricing — kept verbatim (live-pricing reconciliation is a separate task).
const plans = [
  {
    name: "Quick Sweep", price: "$99", period: "/mo", credits: "350 credits", activeRequests: "1 active request",
    bestFor: "Solo creators & light agency needs",
    features: ["350 credits/month", "1 active request at a time", "48h standard turnaround", "3 revision rounds per request", "1 dedicated editor", "Basic captions included", "Credit recharges available", "Platform-specific formatting"],
    addons: ["+ Captions style upgrade", "+ Motion graphics", "+ Rush turnaround"], popular: false, cta: "Start with Quick Sweep",
  },
  {
    name: "Deep Clean", price: "$249", period: "/mo", credits: "950 credits", activeRequests: "2 active requests",
    bestFor: "Growing brands and small agencies",
    features: ["950 credits/month", "2 active requests at a time", "48h standard turnaround", "3 revision rounds per request", "Priority editor matching", "Access to stronger editors", "Custom brand templates", "Swap editors anytime", "Rush turnaround available"],
    addons: ["+ Premium captions", "+ Motion graphics pack", "+ Extra revision"], popular: true, cta: "Start with Deep Clean",
  },
  {
    name: "Full Service", price: "$599", period: "/mo", credits: "2,500 credits", activeRequests: "4 active requests",
    bestFor: "Agencies and high-volume brands",
    features: ["2,500 credits/month", "4 active requests at a time", "Priority queue", "3 revision rounds per request", "Multiple editors assigned", "Premium support", "Multi-brand management", "White-label delivery", "Account manager", "Rush turnaround priority"],
    addons: ["+ Team seats", "+ Custom integrations"], popular: false, cta: "Start with Full Service",
  },
];

const ForAgencies = () => {
  return (
    <>
      <SEO
        title="For Agencies - Scale Without Hiring"
        description="Professional video editing for agencies. Vetted editors, 48h turnaround, consistent quality. Scale from 5 to 50 clients effortlessly."
        keywords="agency video editing, white label video editing, video production agency, content agency"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="halo relative min-h-screen flex items-center overflow-hidden px-4 pt-28 pb-16">
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Built for agencies
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <EditorialHeading as="h1">
                Agency overflow? <span className="text-primary">We handle the editing.</span>
                <br />You handle the strategy.
              </EditorialHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-8 leading-relaxed">
                Subscribe to a plan. Get matched with a vetted editor. Receive polished reels in 48 hours. Scale without hiring.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center mb-14">
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access for your agency">
                  <Button variant="hero" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    Book Demo <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access for your agency">
                  <Button variant="hero-outline" size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                    View Plans
                  </Button>
                </TallyModal>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {trustSignals.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-card bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pain Points */}
        <Section>
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Why agencies choose us</p>
            <EditorialHeading as="h2">Stop managing editors. Start scaling.</EditorialHeading>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {painPoints.map((point, i) => (
              <Reveal key={point.title} delay={i * 0.06}>
                <BentoCard className="p-8 h-full text-center">
                  <div className="w-14 h-14 rounded-card bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <point.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-3 text-foreground">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* How It Works */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">How it works</p>
            <EditorialHeading as="h2">Three steps. Zero complexity.</EditorialHeading>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.06}>
                <BentoCard className="p-7 h-full">
                  <p className="font-heading font-bold text-primary text-3xl">{s.step}</p>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Pricing */}
        <Section id="agency-pricing">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Agency pricing</p>
            <EditorialHeading as="h2">Predictable pricing. Predictable output.</EditorialHeading>
            <p className="text-muted-foreground max-w-lg mx-auto mt-5">Scale up or down anytime. No contracts, no surprises.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {plans.map((plan, i) => {
              const ink = plan.popular;
              const mutedText = ink ? "opacity-70" : "text-muted-foreground";
              const pill = ink ? "chip-ink" : "bg-surface-elevated";
              return (
                <Reveal key={plan.name} delay={i * 0.06}>
                  <BentoCard variant={ink ? "ink" : "default"} className="relative p-8 flex flex-col h-full">
                    {ink && (
                      <div className="absolute -top-3 left-8 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Most popular
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="font-heading text-xl font-semibold mb-1">{plan.name}</h3>
                      <p className={`text-xs mb-4 ${mutedText}`}>{plan.bestFor}</p>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className={`font-heading text-5xl font-bold ${ink ? "text-primary" : "text-foreground"}`}>{plan.price}</span>
                        <span className={`text-sm ${mutedText}`}>{plan.period}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mb-1">
                        <span className="bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">{plan.credits}</span>
                        <span className={`px-2.5 py-1 rounded-full ${pill} ${mutedText}`}>{plan.activeRequests}</span>
                      </div>
                    </div>
                    <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Reserve your agency plan">
                      <Button variant={plan.popular ? "hero" : "hero-outline"} className="w-full mb-6">{plan.cta}</Button>
                    </TallyModal>
                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className={ink ? "opacity-80" : "text-muted-foreground"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.addons.length > 0 && (
                      <div className={`mt-6 pt-6 border-t ${ink ? "divider-ink" : "border-border"}`}>
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
        </Section>

        {/* Testimonials — placeholder until real agency proof exists (rule 16) */}
        <Section tone="sand">
          <Reveal className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Testimonials</p>
            <EditorialHeading as="h2">Agency results, coming soon.</EditorialHeading>
            <p className="text-muted-foreground max-w-lg mx-auto mt-5">
              We're onboarding our first agency partners. Verified results will land here as they scale.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <BentoCard className="p-8 h-full">
                  <p className="text-muted-foreground leading-relaxed mb-6">Agency testimonial coming soon.</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-sm font-bold text-muted-foreground">—</div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">—</p>
                      <p className="text-xs text-muted-foreground">—</p>
                    </div>
                  </div>
                </BentoCard>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Final CTA */}
        <section className="px-4 py-20 md:py-28">
          <Reveal className="max-w-6xl mx-auto">
            <BentoCard variant="primary" className="px-6 py-20 text-center rounded-[2.5rem]">
              <EditorialHeading as="h2" className="text-4xl md:text-6xl">
                Scale your agency without the editing overhead.
              </EditorialHeading>
              <p className="text-primary-foreground/85 text-lg max-w-xl mx-auto mt-6">
                Stop managing freelancers. Start delivering consistent, polished content to every client.
              </p>
              <div className="mt-9 flex flex-col items-center gap-4">
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Reserve your agency plan">
                  <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                    Book Demo <ArrowUpRight className="w-5 h-5 ml-1" />
                  </Button>
                </TallyModal>
                <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Reserve your agency plan">
                  <button className="text-sm font-medium text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline transition-colors">
                    Or view plans →
                  </button>
                </TallyModal>
              </div>
              <p className="text-xs text-primary-foreground/70 mt-8">No contracts · Cancel anytime</p>
            </BentoCard>
          </Reveal>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ForAgencies;
