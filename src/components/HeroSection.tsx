import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowUpRight, Play } from "lucide-react";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";
import BentoCard from "@/components/marketing/BentoCard";

const stats = [
  { value: "48h", label: "turnaround" },
  { value: "3", label: "revisions in" },
  { value: "100%", label: "vetted editors" },
];

const HeroSection = () => {
  return (
    <section className="halo relative min-h-[100dvh] flex items-center overflow-hidden px-4 pt-28 pb-16">
      <div className="max-w-6xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
        {/* Copy */}
        <div className="md:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Built for people who post daily
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <EditorialHeading as="h1" className="text-[15vw] sm:text-7xl md:text-[6rem] leading-[0.9]">
              Edits done.
              <br />
              <span className="text-primary">Without</span>
              <br />
              the drama.
            </EditorialHeading>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              No more ghosting, no more "it's almost ready," no more $50 caption
              tweaks. Submit footage, get matched to a vetted editor, and get a
              polished short back in 48 hours — revisions included.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/pricing">
                <Button variant="hero" size="lg" className="text-base px-7 py-6">
                  Claim your editor <ArrowUpRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="hero-outline" size="lg" className="text-base px-7 py-6">
                  See how it works
                </Button>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-12 flex items-center gap-7">
              {stats.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-7">
                  {i > 0 && <span className="w-px h-9 bg-border" aria-hidden />}
                  <div>
                    <p className="font-heading font-bold text-3xl text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Floating product card */}
        <Reveal variant="scaleIn" delay={0.2} className="md:col-span-5">
          <div className="relative">
            <BentoCard
              variant="ink"
              className="absolute -top-6 -right-3 rotate-3 px-5 py-3 z-10"
            >
              <p className="text-[11px] uppercase tracking-wider opacity-60">Status</p>
              <p className="font-heading font-bold text-primary">Ready to review →</p>
            </BentoCard>

            <BentoCard className="p-7">
              <div className="flex items-center justify-between">
                <p className="font-heading font-bold text-lg text-foreground">Launch reel</p>
                <span className="text-[11px] rounded-full bg-primary/10 text-primary border border-primary/25 px-2.5 py-0.5 font-semibold">
                  9:16
                </span>
              </div>
              <div className="mt-5 aspect-video rounded-card bg-gradient-to-br from-surface-elevated to-background border border-border grid place-items-center">
                <span className="grid place-items-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lift">
                  <Play className="w-5 h-5 fill-current" />
                </span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-semibold text-foreground">in 41 hours</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted-foreground">Revisions left</span>
                  <span className="font-semibold text-primary">3 of 3</span>
                </div>
              </div>
              <button className="mt-6 w-full rounded-xl bg-foreground text-background py-3 text-sm font-bold transition-colors hover:bg-primary hover:text-primary-foreground">
                Approve &amp; post
              </button>
            </BentoCard>
            <p className="text-xs text-muted-foreground/70 text-center mt-3">
              Representative UI — not a real client job.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
