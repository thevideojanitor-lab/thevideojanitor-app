import { useEffect, useState } from "react"
import { supabase, AppUser, UserRole, AdminRole, Region, Currency } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { detectRegion, persistRegionToUser } from "@/lib/region"

export interface AuthState {
  user: AppUser | null
  role: UserRole | null
  region: Region
  currency: Currency
  adminRole: AdminRole | null
  onboardingComplete: boolean
  loading: boolean
}

export function useAuth(): AuthState {
  const { user, role, region, currency, adminRole, onboardingComplete, setUser, setOnboardingComplete, clear } =
    useAuthStore()
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
      // No users row — happens for OAuth sign-ins or if signup row creation failed.
      // Auto-create the row so the user isn't silently signed out.
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        await supabase.auth.signOut()
        clear()
        setLoading(false)
        return
      }

      const { data: created, error: createErr } = await supabase
        .from("users")
        .insert({
          id: uid,
          email: authUser.email ?? "",
          role: "client",
          region: "US",
          currency: "USD",
        })
        .select()
        .single()

      if (createErr || !created) {
        console.error("[useAuth] failed to create users row:", createErr?.message)
        await supabase.auth.signOut()
        clear()
        setLoading(false)
        return
      }

      await supabase.from("client_profiles").upsert({ user_id: uid })
      setUser(created as AppUser)
      setOnboardingComplete(false)
      setLoading(false)
      return
    }

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

  return { user, role, region, currency, adminRole, onboardingComplete, loading }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  role: "client" | "editor" = "client"
): Promise<{ error: string | null }> {
  const regionConfig = await detectRegion()

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  if (!data.user) return { error: "Signup failed" }

  const uid = data.user.id

  const { error: userErr } = await supabase.from("users").insert({
    id: uid,
    email,
    role,
    region: regionConfig.region,
    currency: regionConfig.currency,
  })
  if (userErr) return { error: userErr.message }

  if (role === "client") {
    // Client profile row — triggers onboarding flow
    await supabase.from("client_profiles").insert({ user_id: uid })
  }
  // Editor: no profile row yet — created at end of editor onboarding (LaunchStep)

  await persistRegionToUser(uid, regionConfig)

  return { error: null }
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
