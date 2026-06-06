import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const PainPoints = () => {
  return (
    <Section id="problem">
      <Reveal className="max-w-2xl mb-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          The old way is exhausting
        </p>
        <EditorialHeading as="h2">
          Everything you hate about hiring editors.
        </EditorialHeading>
        <p className="mt-5 text-muted-foreground text-base">
          Pulled from what creators and agencies actually complain about. We
          built the fix into the product.
        </p>
      </Reveal>

      <div className="grid md:grid-cols-6 gap-4">
        {/* Big feature card */}
        <Reveal className="md:col-span-3 md:row-span-2">
          <BentoCard
            variant="primary"
            className="p-8 flex flex-col justify-between min-h-[19rem] h-full"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
                The big one
              </p>
              <h3 className="mt-3 font-heading font-bold text-3xl leading-tight">
                You're spending ~3 workdays a month managing editors.
              </h3>
              <p className="mt-3 text-primary-foreground/85 text-[15px] leading-relaxed">
                Briefing, file transfers, reviews, and chasing eat 1.5–3 hours
                per video. At 8 videos a month, that's three full workdays you
                never get back.
              </p>
            </div>
            <div className="mt-6 rounded-card bg-background/15 backdrop-blur px-5 py-4">
              <p className="text-[13px] font-semibold">
                Our fix → A 90-second brief is all you touch. We run the rest.
                You approve and post.
              </p>
            </div>
          </BentoCard>
        </Reveal>

        <Reveal className="md:col-span-3">
          <BentoCard className="p-7 h-full">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Ghosting
            </p>
            <h3 className="mt-2 font-heading font-bold text-xl text-foreground">
              They vanish after payment.
            </h3>
            <p className="mt-2 text-muted-foreground text-sm">
              No reply, no file, money gone.
            </p>
            <p className="mt-4 pt-4 border-t border-border text-[13px] font-medium text-primary">
              Vetted roster + one-click editor swap.
            </p>
          </BentoCard>
        </Reveal>

        <Reveal delay={0.06} className="md:col-span-3">
          <BentoCard variant="sand" className="p-7 h-full">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              The 48-hour lie
            </p>
            <h3 className="mt-2 font-heading font-bold text-xl text-foreground">
              "Soon" becomes next week.
            </h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Vague deadlines wreck your cadence.
            </p>
            <p className="mt-4 pt-4 border-t border-border text-[13px] font-medium text-primary">
              Real 48h clock. Late auto-reassigns.
            </p>
          </BentoCard>
        </Reveal>

        <Reveal className="md:col-span-2">
          <BentoCard className="p-7 h-full">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Style roulette
            </p>
            <h3 className="mt-2 font-heading font-bold text-lg text-foreground">
              Great once, random after.
            </h3>
            <p className="mt-3 pt-3 border-t border-border text-[13px] font-medium text-primary">
              Dedicated editor + brand kit.
            </p>
          </BentoCard>
        </Reveal>

        <Reveal delay={0.06} className="md:col-span-4">
          <BentoCard className="p-7 h-full flex items-center gap-6">
            <div className="shrink-0 grid place-items-center w-16 h-16 rounded-card bg-primary/10 font-heading font-bold text-primary text-2xl">
              $50
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                A caption tweak shouldn't cost $50.
              </h3>
              <p className="mt-1 text-muted-foreground text-sm">
                1–2 revisions, then you pay per change. We include three full
                rounds in flat credits.
              </p>
            </div>
          </BentoCard>
        </Reveal>
      </div>
    </Section>
  );
};

export default PainPoints;
