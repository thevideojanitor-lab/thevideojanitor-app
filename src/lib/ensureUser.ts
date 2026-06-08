import { supabase, UserRole } from "./supabase"
import { detectRegion, persistRegionToUser, RegionConfig } from "./region"

/**
 * Idempotently create the public.users row (and the client_profiles row for
 * clients) for an already-authenticated auth user. Safe to call more than once
 * — existing rows are left untouched.
 *
 * This is the single source of truth for "turn an auth account into an app
 * profile", shared by email signup, OAuth role selection, and the auth
 * callback recovery path. It keeps orphaned auth accounts (auth user with no
 * users row) from ever stranding a login.
 */
export async function ensureUserProfile(
  uid: string,
  email: string,
  role: UserRole,
  regionConfig?: RegionConfig
): Promise<{ error: string | null }> {
  const region = regionConfig ?? (await detectRegion())

  const { error: userErr } = await supabase
    .from("users")
    .upsert(
      { id: uid, email, role, region: region.region, currency: region.currency },
      { onConflict: "id", ignoreDuplicates: true }
    )
  if (userErr) return { error: userErr.message }

  if (role === "client") {
    // Onboarding flow keys off this row; ignore if it already exists.
    await supabase
      .from("client_profiles")
      .upsert({ user_id: uid }, { onConflict: "user_id", ignoreDuplicates: true })
  }
  // Editors: no profile row yet — created at the end of editor onboarding.

  await persistRegionToUser(uid, region)
  return { error: null }
}
