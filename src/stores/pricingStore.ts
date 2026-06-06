import { create } from "zustand"

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

    // Pricing is read via the public get-pricing Edge Function (service-role),
    // NOT the platform_config table directly: its RLS only allows reads for
    // authenticated users, so a direct query returns nothing on public pages
    // like the marketing homepage. (CLAUDE.md §6/§11.)
    const baseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    if (!baseUrl || !anonKey) {
      set({ loading: false })
      return
    }

    try {
      const res = await fetch(
        `${baseUrl}/functions/v1/get-pricing?region=${region}`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
      )
      if (!res.ok) {
        set({ loading: false })
        return
      }
      const data = await res.json()
      set({
        config: {
          plans: data.plans,
          creditPacks: data.creditPacks,
          editCosts: data.editCosts,
          rules: data.rules,
        },
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },
}))
