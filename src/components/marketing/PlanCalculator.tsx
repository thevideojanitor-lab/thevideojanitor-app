import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { TallyModal } from "@/components/TallyModal"
import { usePricingStore } from "@/stores/pricingStore"
import {
  creditsNeeded,
  recommendPlan,
  computeSavings,
  FREELANCER_ASSUMPTIONS,
  type Complexity,
  type PlanKey,
  type Region,
} from "@/lib/calculator"
import Section from "./Section"
import EditorialHeading from "./EditorialHeading"
import Reveal from "./Reveal"
import BentoCard from "./BentoCard"

const WAITLIST_URL = "https://tally.so/embed/xX0z6G"

const PLAN_NAMES: Record<PlanKey, string> = {
  quick_sweep: "Quick Sweep",
  deep_clean: "Deep Clean",
  full_service: "Full Service",
}

const COMPLEXITIES: { key: Complexity; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "standard", label: "Standard" },
  { key: "premium", label: "Premium" },
]

function getRegion(): Region {
  return localStorage.getItem("region") === "IN" ? "IN" : "US"
}

export default function PlanCalculator() {
  const config = usePricingStore((s) => s.config)
  const loading = usePricingStore((s) => s.loading)
  const [region] = useState<Region>(getRegion)
  const [videos, setVideos] = useState(8)
  const [complexity, setComplexity] = useState<Complexity>("standard")

  useEffect(() => {
    const { config: cfg, loading: isLoading, fetch } = usePricingStore.getState()
    if (!cfg && !isLoading) {
      // Defer so the initial paint (skeleton/fallback) isn't masked by the
      // synchronous loading flip; the live app still fetches immediately after.
      const t = setTimeout(() => void fetch(region), 0)
      return () => clearTimeout(t)
    }
  }, [region])

  const heading = (
    <Reveal>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Live pricing
      </p>
      <EditorialHeading as="h2">Estimate your plan</EditorialHeading>
      <p className="mt-5 max-w-xl text-lg text-muted-foreground">
        Tell us how much you ship. We&apos;ll point you at the right plan — and
        show what it saves versus juggling freelancers.
      </p>
    </Reveal>
  )

  const renderBody = () => {
    if (loading && !config) {
      return (
        <BentoCard className="p-6 md:p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted" />
            <div className="h-24 w-full rounded bg-muted" />
            <div className="h-12 w-1/2 rounded bg-muted" />
          </div>
        </BentoCard>
      )
    }

    if (!config) {
      return (
        <BentoCard className="p-6 md:p-8">
          <p className="font-heading text-xl font-semibold text-foreground">
            Live pricing unavailable
          </p>
          <p className="mt-2 text-muted-foreground">
            We couldn&apos;t load current pricing. See the full breakdown below.
          </p>
          <a
            href="#pricing"
            className="mt-5 inline-flex text-primary font-semibold hover:underline"
          >
            View plans &amp; pricing →
          </a>
        </BentoCard>
      )
    }

    const symbol = FREELANCER_ASSUMPTIONS[region].symbol
    const assumptions = FREELANCER_ASSUMPTIONS[region]
    const needed = creditsNeeded(videos, complexity, config.editCosts)
    const plan = recommendPlan(needed, config.plans)

    return (
      <div className="grid gap-4 md:grid-cols-5">
        {/* Inputs */}
        <BentoCard variant="sand" className="p-6 md:p-8 md:col-span-3">
          <label
            htmlFor="videos"
            className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            Videos per month
          </label>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-heading text-5xl font-bold text-foreground">
              {videos}
            </span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <input
            id="videos"
            type="range"
            min={1}
            max={60}
            value={videos}
            aria-label="Videos per month"
            onChange={(e) => setVideos(Number(e.target.value))}
            className="mt-4 w-full accent-primary"
          />

          <p className="mt-8 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Edit complexity
          </p>
          <div className="mt-3 inline-flex rounded-card-lg border border-border bg-card p-1">
            {COMPLEXITIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setComplexity(c.key)}
                aria-pressed={complexity === c.key}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  complexity === c.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </BentoCard>

        {/* Output */}
        <BentoCard variant="ink" className="flex flex-col p-6 md:p-8 md:col-span-2">
          <p className="font-sans text-xs uppercase tracking-[0.2em] opacity-70">
            You&apos;ll need
          </p>
          <p className="mt-2">
            <span className="font-heading text-5xl font-bold text-primary">{needed}</span>
            <span className="ml-2 opacity-70">credits / mo</span>
          </p>

          {plan ? (
            <>
              <div className="mt-6 border-t border-background/15 pt-6">
                <p className="opacity-70">Recommended plan</p>
                <p className="font-heading text-3xl font-bold">{PLAN_NAMES[plan]}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">
                  {symbol}
                  {Math.round(config.plans[plan].amount / 100)}
                  <span className="text-base font-normal opacity-70"> / mo</span>
                </p>
              </div>

              {(() => {
                const s = computeSavings(videos, config.plans[plan].amount, region)
                return (
                  <p className="mt-4 text-sm opacity-80">
                    Save ~{symbol}
                    {s.moneySaved}/mo and ~{s.hoursSaved} hours
                  </p>
                )
              })()}

              <p className="mt-2 text-xs opacity-60">
                Based on {symbol}
                {assumptions.perEdit}/edit + {symbol}
                {assumptions.perRevision}/revision, ~{assumptions.hoursPerVideo} hrs/video.
                Representative estimate.
              </p>

              <div className="mt-auto pt-6">
                <TallyModal
                  url={WAITLIST_URL}
                  title="Join the Waitlist"
                  subtitle="Get early access when we launch"
                >
                  <Button variant="hero" size="lg" className="w-full">
                    Start with this plan
                  </Button>
                </TallyModal>
              </div>
            </>
          ) : (
            <>
              <div className="mt-6 border-t border-background/15 pt-6">
                <p className="font-heading text-2xl font-bold">
                  Full Service + credit recharges
                </p>
                <p className="mt-2 text-sm opacity-80">
                  That&apos;s a lot of edits — top up with credit packs on top of our
                  largest plan, or let&apos;s scope a custom volume together.
                </p>
              </div>
              <div className="mt-auto pt-6">
                <Button asChild variant="hero" size="lg" className="w-full">
                  <Link to="/contact">Contact sales</Link>
                </Button>
              </div>
            </>
          )}
        </BentoCard>
      </div>
    )
  }

  return (
    <Section id="calculator">
      {heading}
      <div className="mt-12">{renderBody()}</div>
    </Section>
  )
}
