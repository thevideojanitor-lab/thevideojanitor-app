import { Star } from "lucide-react";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

// Placeholder slots until real client testimonials exist (CLAUDE.md rule 16:
// placeholder beats fake stat — no invented names, follower counts, or quotes).
const PLACEHOLDER_COUNT = 3;

const TestimonialsSection = () => {
  return (
    <Section tone="sand">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Testimonials</p>
        <EditorialHeading as="h2">Real results, coming soon.</EditorialHeading>
        <p className="text-muted-foreground max-w-lg mx-auto mt-5">
          We're onboarding our first cohort of creators and agencies. Verified
          testimonials will land here as edits ship.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <Reveal key={i} delay={i * 0.06}>
            <BentoCard className="p-8 h-full">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-muted-foreground/40" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Client testimonial coming soon.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-sm font-bold text-muted-foreground">
                  —
                </div>
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
  );
};

export default TestimonialsSection;
