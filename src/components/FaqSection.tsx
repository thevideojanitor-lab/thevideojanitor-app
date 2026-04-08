import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <section id="faq" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">FAQ</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Questions? We've got answers.</h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30">
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
      </div>
    </section>
  );
};

export default FaqSection;
