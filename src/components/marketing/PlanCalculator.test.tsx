import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { usePricingStore } from "@/stores/pricingStore"
import PlanCalculator from "./PlanCalculator"

const config = {
  plans: {
    quick_sweep: { amount: 9900, credits: 350 },
    deep_clean: { amount: 24900, credits: 950 },
    full_service: { amount: 59900, credits: 2500 },
  },
  creditPacks: { small: { amount: 3300, credits: 100 }, medium: { amount: 7500, credits: 250 }, large: { amount: 14000, credits: 500 } },
  editCosts: { basic: 50, standard: 70, premium: 100, extra_ratio: 10 },
  rules: { max_revisions: 3, auto_close_days: 7, editor_reassign_hours: 12, max_active_requests: 2 },
}

const renderCalc = () =>
  render(
    <MemoryRouter>
      <PlanCalculator />
    </MemoryRouter>
  )

describe("PlanCalculator", () => {
  beforeEach(() => {
    localStorage.clear()
    usePricingStore.setState({ config, loading: false })
  })

  it("shows a recommended plan and credits for the default inputs", () => {
    renderCalc()
    // default 8 videos x standard(70) = 560 -> deep_clean
    expect(screen.getByText(/Deep Clean/i)).toBeTruthy()
    expect(screen.getByText(/560/)).toBeTruthy()
  })

  it("updates the recommendation when videos change", () => {
    renderCalc()
    const slider = screen.getByLabelText(/videos per month/i) as HTMLInputElement
    fireEvent.change(slider, { target: { value: "40" } }) // 40x70=2800 -> exceeds 2500 -> fallback
    expect(screen.getByText(/recharge|Talk to us|Full Service/i)).toBeTruthy()
  })

  it("shows a graceful fallback when pricing is unavailable", () => {
    usePricingStore.setState({ config: null, loading: false })
    renderCalc()
    expect(screen.getByText(/pricing unavailable/i)).toBeTruthy()
  })
})
