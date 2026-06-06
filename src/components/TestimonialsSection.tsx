import { Star } from "lucide-react";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    company: "200K+ followers",
    quote: "I used to spend 10 hours a week editing. Now I upload raw clips and get back fire reels in two days. Game changer.",
    avatar: "SC",
  },
  {
    name: "Marcus Rivera",
    role: "Founder",
    company: "Bolt Agency",
    quote: "We manage 12 client accounts. TheVideoJanitors handles all our short-form. The quality is consistently top-tier.",
    avatar: "MR",
  },
  {
    name: "Priya Patel",
    role: "E-commerce Manager",
    company: "NovaBrand",
    quote: "Our UGC ads convert 3x better since switching. The editors actually understand platform trends.",
    avatar: "PP",
  },
];

const TestimonialsSection = () => {
  return (
    <Section tone="sand">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Testimonials</p>
        <EditorialHeading as="h2">Creators love the results.</EditorialHeading>
      </Reveal>

      <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {testimonials.map(({ name, role, company, quote, avatar }, i) => (
          <Reveal key={name} delay={i * 0.06}>
            <BentoCard className="p-8 h-full">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role} · {company}</p>
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
