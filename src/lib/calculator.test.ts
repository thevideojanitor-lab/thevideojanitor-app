import { describe, it, expect } from "vitest"
import { creditsNeeded, recommendPlan, computeSavings, FREELANCER_ASSUMPTIONS } from "./calculator"

const editCosts = { basic: 50, standard: 70, premium: 100, extra_ratio: 10 }
const plans = {
  quick_sweep: { amount: 9900, credits: 350 },
  deep_clean: { amount: 24900, credits: 950 },
  full_service: { amount: 59900, credits: 2500 },
}

describe("creditsNeeded", () => {
  it("multiplies videos by per-edit credits", () => {
    expect(creditsNeeded(8, "standard", editCosts)).toBe(560)
    expect(creditsNeeded(0, "basic", editCosts)).toBe(50) // clamps videos to >=1
  })
})

describe("recommendPlan", () => {
  it("picks the smallest plan whose credits cover the need", () => {
    expect(recommendPlan(350, plans)).toBe("quick_sweep")
    expect(recommendPlan(351, plans)).toBe("deep_clean")
    expect(recommendPlan(980, plans)).toBe("full_service")
    expect(recommendPlan(2500, plans)).toBe("full_service")
  })
  it("returns null when need exceeds the largest plan", () => {
    expect(recommendPlan(2501, plans)).toBeNull()
  })
})

describe("computeSavings", () => {
  it("US: freelancer money minus plan, hours saved, clamped at zero", () => {
    const r = computeSavings(8, 24900, "US")
    expect(r.planMoney).toBe(249)
    expect(r.freelancerMoney).toBe(8 * (55 + 25)) // 640
    expect(r.moneySaved).toBe(640 - 249)           // 391
    expect(r.hoursSaved).toBe(16)
  })
  it("never returns negative savings", () => {
    const r = computeSavings(1, 59900, "US") // tiny freelancer cost vs big plan
    expect(r.moneySaved).toBe(0)
  })
  it("uses INR assumptions for region IN", () => {
    expect(FREELANCER_ASSUMPTIONS.IN.symbol).toBe("₹")
    const r = computeSavings(4, 599900, "IN")
    expect(r.freelancerMoney).toBe(4 * (1500 + 600)) // 8400
  })
})
