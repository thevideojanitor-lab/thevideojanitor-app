import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const steps = [
  { step: "01", title: "Subscribe", description: "Pick a plan, credits land instantly." },
  { step: "02", title: "Submit a brief", description: "Footage link, ratios, notes. 90 sec." },
  { step: "03", title: "Get matched", description: "Vetted editor by niche. Clock starts." },
  { step: "04", title: "Approve & post", description: "Notes, revisions, done.", ink: true },
];

const HowItWorks = () => {
  return (
    <Section id="how" tone="sand">
      <Reveal className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          The new way
        </p>
        <EditorialHeading as="h2">Four steps. Then it just shows up.</EditorialHeading>
      </Reveal>

      <div className="grid md:grid-cols-4 gap-4">
        {steps.map(({ step, title, description, ink }, i) => (
          <Reveal key={step} delay={i * 0.06}>
            <BentoCard variant={ink ? "ink" : "default"} className="p-7 h-full">
              <p className="font-heading font-bold text-primary text-2xl">{step}</p>
              <h3 className="mt-3 font-heading font-bold text-lg">{title}</h3>
              <p
                className={`mt-2 text-[13px] ${
                  ink ? "opacity-70" : "text-muted-foreground"
                }`}
              >
                {description}
              </p>
            </BentoCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default HowItWorks;
