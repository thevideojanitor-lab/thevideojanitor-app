import { useEffect, useState } from "react"
import { supabase, AppUser, UserRole, AdminRole, Region, Currency } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { detectRegion } from "@/lib/region"
import { ensureUserProfile } from "@/lib/ensureUser"

export interface AuthState {
  user: AppUser | null
  role: UserRole | null
  region: Region
  currency: Currency
  adminRole: AdminRole | null
  onboardingComplete: boolean
  needsRoleSelection: boolean
  loading: boolean
}

export function useAuth(): AuthState {
  const {
    user,
    role,
    region,
    currency,
    adminRole,
    onboardingComplete,
    needsRoleSelection,
    setUser,
    setOnboardingComplete,
    setNeedsRoleSelection,
    clear,
  } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadAppUser(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadAppUser(session.user.id)
      } else {
        clear()
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadAppUser(uid: string) {
    const { data: appUser, error: fetchErr } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .maybeSingle()

    if (fetchErr) {
      console.error("[useAuth] users fetch error:", fetchErr.message)
    }

    if (!appUser) {
      // Authenticated, but no app profile row yet. This covers new OAuth users
      // who haven't picked a role and any orphaned account (auth user with no
      // users row). The route guards send these to /auth/select-role so the
      // login can never strand them.
      setNeedsRoleSelection(true)
      setLoading(false)
      return
    }

    setNeedsRoleSelection(false)
    setUser(appUser as AppUser)

    if (appUser.role === "client") {
      const { data: profile } = await supabase
        .from("client_profiles")
        .select("onboarding_complete")
        .eq("user_id", uid)
        .single()
      setOnboardingComplete(profile?.onboarding_complete ?? false)
    }

    if (appUser.role === "editor") {
      const { data: profile } = await supabase
        .from("editor_profiles")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle()
      setOnboardingComplete(!!profile)
    }

    setLoading(false)
  }

  return { user, role, region, currency, adminRole, onboardingComplete, needsRoleSelection, loading }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  role: "client" | "editor" = "client"
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  const regionConfig = await detectRegion()

  // Stash the chosen role in auth metadata so the post-confirmation / OAuth
  // recovery path can provision the right profile even if we can't do it now.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role } },
  })
  if (error) return { error: error.message, needsConfirmation: false }
  if (!data.user) return { error: "Signup failed", needsConfirmation: false }

  // No session means email confirmation is required — we have no authenticated
  // context to write profile rows under RLS yet. Defer provisioning to the auth
  // callback (which runs once the user confirms and a session exists).
  if (!data.session) {
    return { error: null, needsConfirmation: true }
  }

  const { error: profileErr } = await ensureUserProfile(data.user.id, email, role, regionConfig)
  if (profileErr) return { error: profileErr, needsConfirmation: false }

  return { error: null, needsConfirmation: false }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error: error?.message ?? null }
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { error: error?.message ?? null }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
