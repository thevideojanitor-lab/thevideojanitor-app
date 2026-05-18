import { create } from "zustand"
import { supabase } from "@/lib/supabase"

export interface PlanConfig {
  amount: number
  credits: number
}

export interface CreditPackConfig {
  amount: number
  credits: number
}

export interface EditCosts {
  basic: number
  standard: number
  premium: number
  extra_ratio: number
}

export interface PlatformRules {
  max_revisions: number
  auto_close_days: number
  editor_reassign_hours: number
  max_active_requests: number
}

export interface PricingConfig {
  plans: {
    quick_sweep: PlanConfig
    deep_clean: PlanConfig
    full_service: PlanConfig
  }
  creditPacks: {
    small: CreditPackConfig
    medium: CreditPackConfig
    large: CreditPackConfig
  }
  editCosts: EditCosts
  rules: PlatformRules
}

interface PricingStore {
  config: PricingConfig | null
  loading: boolean
  fetch: (region: "US" | "IN") => Promise<void>
}

export const usePricingStore = create<PricingStore>((set) => ({
  config: null,
  loading: false,

  fetch: async (region) => {
    set({ loading: true })
    const currency = region === "IN" ? "inr" : "usd"

    const { data } = await supabase
      .from("platform_config")
      .select("key, value")
      .in("key", [
        `pricing_${currency}`,
        `credit_packs_${currency}`,
        "edit_costs",
        "rules",
      ])

    if (!data) {
      set({ loading: false })
      return
    }

    const byKey = Object.fromEntries(data.map((r) => [r.key, r.value]))

    set({
      config: {
        plans: byKey[`pricing_${currency}`],
        creditPacks: byKey[`credit_packs_${currency}`],
        editCosts: byKey["edit_costs"],
        rules: byKey["rules"],
      },
      loading: false,
    })
  },
}))
