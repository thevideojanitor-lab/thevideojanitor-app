import { useState } from "react";
import Section from "@/components/marketing/Section";
import Reveal from "@/components/marketing/Reveal";
import EditorialHeading from "@/components/marketing/EditorialHeading";

import beforeImg1 from "@/assets/showcase-before-1.jpg";
import afterImg1 from "@/assets/showcase-after-1.jpg";
import beforeImg2 from "@/assets/showcase-before-2.jpg";
import afterImg2 from "@/assets/showcase-after-2.jpg";
import beforeImg3 from "@/assets/showcase-before-3.jpg";
import afterImg3 from "@/assets/showcase-after-3.jpg";
import beforeImg4 from "@/assets/showcase-before-4.jpg";
import afterImg4 from "@/assets/showcase-after-4.jpg";

const showcaseItems = [
  { label: "Talking Head", before: beforeImg1, after: afterImg1 },
  { label: "Product Demo", before: beforeImg2, after: afterImg2 },
  { label: "Podcast Clip", before: beforeImg3, after: afterImg3 },
  { label: "UGC", before: beforeImg4, after: afterImg4 },
];

const ShowcaseSection = () => {
  const [showAfter, setShowAfter] = useState(true);

  return (
    <Section id="showcase" tone="sand">
      <Reveal className="text-center mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">Showcase</p>
        <EditorialHeading as="h2">Raw footage in. Polished reels out.</EditorialHeading>

        <div className="inline-flex bg-card border border-border rounded-full p-1 gap-1 mt-8">
          <button
            onClick={() => setShowAfter(false)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !showAfter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              showAfter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            After
          </button>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
        {showcaseItems.map(({ label, before, after }, i) => (
          <Reveal key={label} delay={i * 0.06}>
            <div className="relative aspect-[9/16] rounded-card overflow-hidden border border-border group">
              <img
                src={showAfter ? after : before}
                alt={`${label} ${showAfter ? "after" : "before"} editing`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                <span className="text-xs font-medium uppercase tracking-wider text-foreground">{label}</span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                  showAfter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {showAfter ? "After" : "Before"}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default ShowcaseSection;
