import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

export function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  )
}

export async function getUserFromAuth(req: Request) {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return null

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  )
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))
  return user
}
