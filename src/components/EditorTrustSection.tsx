import { Award, Star, Clock, CheckCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const tiers = [
  {
    name: "Verified Editor",
    icon: CheckCircle,
    color: "text-muted-foreground",
    bg: "bg-surface-elevated",
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
    <Section tone="sand">
      <Reveal className="text-center mb-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Editor Quality</p>
        <EditorialHeading as="h2">
          Not just anyone. Only the <span className="text-primary">best get through.</span>
        </EditorialHeading>
        <p className="text-muted-foreground max-w-lg mx-auto mt-5">
          Every editor in our network is manually vetted, tested, and continuously monitored. No freelancer roulette here.
        </p>
      </Reveal>

      {/* Vetting Steps */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
        {vettingSteps.map((step, i) => (
          <Reveal key={step.step} delay={i * 0.06}>
            <BentoCard className="p-6 text-center h-full">
              <div className="text-4xl font-heading font-bold text-primary/15 mb-3">{step.step}</div>
              <h3 className="font-heading font-semibold mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </BentoCard>
          </Reveal>
        ))}
      </div>

      {/* Editor Tiers */}
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
        {tiers.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 0.06}>
            <div
              className={`p-6 rounded-card border text-center h-full ${tier.bg} ${tier.border} ${
                tier.highlighted ? "ring-1 ring-primary" : ""
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${tier.bg}`}>
                <tier.icon className={`w-6 h-6 ${tier.color}`} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${tier.color}`}>{tier.count}</span>
              <h3 className="font-heading font-semibold mt-1 mb-2 text-foreground">{tier.name}</h3>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* CTA */}
      <Reveal className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>Hand-vetted editor network</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>48h guaranteed turnaround</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-primary" />
            <span>Quality-monitored ratings</span>
          </div>
        </div>
        <Link to="/editors" className="text-sm text-primary hover:underline font-medium">
          Meet our editors →
        </Link>
      </Reveal>
    </Section>
  );
};

export default EditorTrustSection;
