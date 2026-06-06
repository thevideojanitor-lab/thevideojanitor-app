import type { EditCosts, PricingConfig } from "@/stores/pricingStore"

export type Complexity = "basic" | "standard" | "premium"
export type PlanKey = "quick_sweep" | "deep_clean" | "full_service"
export type Region = "US" | "IN"

// Brand's own published claims (see previews). Major currency units.
// Candidates for future migration to platform_config.
export const FREELANCER_ASSUMPTIONS: Record<
  Region,
  { perEdit: number; perRevision: number; hoursPerVideo: number; symbol: string }
> = {
  US: { perEdit: 55, perRevision: 25, hoursPerVideo: 2, symbol: "$" },
  IN: { perEdit: 1500, perRevision: 600, hoursPerVideo: 2, symbol: "₹" },
}

const PLAN_ORDER: PlanKey[] = ["quick_sweep", "deep_clean", "full_service"]

export function creditsNeeded(videos: number, complexity: Complexity, editCosts: EditCosts): number {
  const v = Number.isFinite(videos) && videos >= 1 ? Math.floor(videos) : 1
  return v * editCosts[complexity]
}

export function recommendPlan(needed: number, plans: PricingConfig["plans"]): PlanKey | null {
  for (const key of PLAN_ORDER) {
    if (plans[key].credits >= needed) return key
  }
  return null
}

export function computeSavings(videos: number, planAmountMinor: number, region: Region) {
  const v = Number.isFinite(videos) && videos >= 1 ? Math.floor(videos) : 1
  const a = FREELANCER_ASSUMPTIONS[region]
  const freelancerMoney = v * (a.perEdit + a.perRevision)
  const planMoney = Math.round(planAmountMinor / 100)
  const moneySaved = Math.max(0, freelancerMoney - planMoney)
  const hoursSaved = v * a.hoursPerVideo
  return { freelancerMoney, planMoney, moneySaved, hoursSaved }
}
