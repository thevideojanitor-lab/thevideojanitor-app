import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";

const faqs = [
  {
    q: "How does the credit system work?",
    a: "Each credit equals one short-form video edit (up to 90 seconds). Submit your raw footage with a brief, and one credit is used per edit. Unused credits roll over for one month.",
  },
  {
    q: "What if I don't like my editor?",
    a: "Swap anytime with zero friction. Just hit 'Swap Editor' in your dashboard and we'll match you with someone new within 24 hours. No awkward conversations needed.",
  },
  {
    q: "What's included in each edit?",
    a: "Color correction, cuts, transitions, captions/subtitles, music/SFX, platform-specific formatting, and trending effects. Custom brand templates are available on Deep Clean and above.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Cancel before your next billing cycle and you won't be charged again. Any remaining credits stay active until the end of your current period.",
  },
  {
    q: "What platforms do you optimize for?",
    a: "TikTok, Instagram Reels, YouTube Shorts, LinkedIn, and X (Twitter). Each edit is formatted and optimized for the platform you specify.",
  },
];

const FaqSection = () => {
  return (
    <Section id="faq">
      <Reveal className="text-center mb-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">FAQ</p>
        <EditorialHeading as="h2">Questions? We've got answers.</EditorialHeading>
      </Reveal>

      <div className="max-w-2xl mx-auto">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-card px-6 shadow-lift data-[state=open]:border-primary/30">
              <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline py-5">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};

export default FaqSection;
