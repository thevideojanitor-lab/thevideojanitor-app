import { create } from "zustand"
import { AppUser, UserRole, AdminRole, Region, Currency } from "@/lib/supabase"

interface AuthStore {
  user: AppUser | null
  role: UserRole | null
  region: Region
  currency: Currency
  adminRole: AdminRole | null
  onboardingComplete: boolean
  needsRoleSelection: boolean
  setUser: (u: AppUser | null) => void
  setOnboardingComplete: (v: boolean) => void
  setNeedsRoleSelection: (v: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  region: "US",
  currency: "USD",
  adminRole: null,
  onboardingComplete: true,
  needsRoleSelection: false,

  setUser: (u) =>
    set({
      user: u,
      role: u?.role ?? null,
      region: u?.region ?? "US",
      currency: u?.currency ?? "USD",
      adminRole: u?.admin_role ?? null,
      // Having a real user row means role selection is resolved.
      ...(u ? { needsRoleSelection: false } : {}),
    }),

  setOnboardingComplete: (v) => set({ onboardingComplete: v }),

  setNeedsRoleSelection: (v) => set({ needsRoleSelection: v }),

  clear: () =>
    set({
      user: null,
      role: null,
      region: "US",
      currency: "USD",
      adminRole: null,
      onboardingComplete: true,
      needsRoleSelection: false,
    }),
}))
