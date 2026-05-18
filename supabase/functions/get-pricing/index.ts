import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin } from "../_shared/supabase-admin.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const url = new URL(req.url)
  const region = url.searchParams.get("region") ?? "US"
  const currency = region === "IN" ? "inr" : "usd"

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("platform_config")
    .select("key, value")
    .in("key", [`pricing_${currency}`, `credit_packs_${currency}`, "edit_costs", "rules"])

  if (error) return corsError("Failed to load pricing", 500)

  const byKey = Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]))

  const config = {
    region,
    currency: region === "IN" ? "INR" : "USD",
    plans: byKey[`pricing_${currency}`] ?? {},
    creditPacks: byKey[`credit_packs_${currency}`] ?? {},
    editCosts: byKey["edit_costs"] ?? {},
    rules: byKey["rules"] ?? {},
  }

  return new Response(JSON.stringify(config), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "max-age=300",
    },
  })
})
