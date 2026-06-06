// src/components/FinalCta.tsx
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { TallyModal } from "@/components/TallyModal";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const WAITLIST_URL = "https://tally.so/embed/xX0z6G";
const EDITOR_URL = "https://tally.so/embed/Y5o9X0";

const FinalCta = () => {
  return (
    <section className="px-4 py-20 md:py-28">
      <Reveal className="max-w-6xl mx-auto">
        <BentoCard variant="primary" className="px-6 py-20 text-center relative overflow-hidden rounded-[2.5rem]">
          <EditorialHeading as="h2" className="text-5xl md:text-7xl">
            Your next reel
            <br />
            is already late.
          </EditorialHeading>
          <p className="mt-6 text-primary-foreground/85 text-lg max-w-md mx-auto">
            Submit your first brief today. Polished short back in 48 hours.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4">
            <TallyModal url={WAITLIST_URL} title="Join the Waitlist" subtitle="Get early access when we launch">
              <Button size="lg" className="bg-background text-foreground hover:bg-foreground hover:text-background text-base px-8 py-6">
                Get started <ArrowUpRight className="w-5 h-5 ml-1" />
              </Button>
            </TallyModal>
            <TallyModal url={EDITOR_URL} title="Editor Application" subtitle="Apply to join our vetted editor network">
              <button className="text-sm font-medium text-primary-foreground/80 underline-offset-4 hover:text-primary-foreground hover:underline transition-colors">
                Or apply as an editor →
              </button>
            </TallyModal>
          </div>
          <p className="text-xs text-primary-foreground/70 mt-8">
            No contracts · Credits roll over while subscribed · Cancel anytime
          </p>
        </BentoCard>
      </Reveal>
    </section>
  );
};

export default FinalCta;
