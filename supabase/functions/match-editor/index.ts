import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getSupabaseAdmin, getUserFromAuth } from "../_shared/supabase-admin.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  const { requestId, excludeEditorId } = await req.json()
  if (!requestId) return corsError("requestId required")

  const supabase = getSupabaseAdmin()

  // Load request
  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (!request) return corsError("Request not found", 404)

  // Load client profile for niche matching
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("content_niches")
    .eq("user_id", request.client_id)
    .single()

  const clientNiches: string[] = clientProfile?.content_niches ?? []

  // Load available editors — capacity filter done in JS (column-to-column unsupported in PostgREST filter)
  let editorsQuery = supabase
    .from("editor_profiles")
    .select("*")
    .eq("is_active", true)

  if (excludeEditorId) {
    editorsQuery = editorsQuery.neq("user_id", excludeEditorId)
  }

  const { data: allEditors } = await editorsQuery
  const editors = (allEditors ?? []).filter(
    (e: Record<string, unknown>) =>
      (e.current_queue_count as number) < (e.max_queue_capacity as number)
  )

  if (editors.length === 0) {
    // No editors available — leave in pending_match for cron retry
    return corsResponse({ matched: false, message: "No editors available" })
  }

  // Weighted scoring (from CLAUDE.md Section 12)
  const scored = editors.map((e: Record<string, unknown>) => {
    let score = 0
    const specialties = (e.specialties as string[]) ?? []
    const matched = specialties.filter((x) => clientNiches.includes(x))
    score += (matched.length / Math.max(clientNiches.length, 1)) * 40   // niche: 40pts
    const load = (e.current_queue_count as number) / (e.max_queue_capacity as number)
    score += load < 0.8 ? 20 : load < 0.9 ? 15 : 5                      // availability: 20pts
    const rating = e.rating as number
    score += rating >= 4.8 ? 10 : rating >= 4.5 ? 5 : 0                 // performance: 10pts
    score += 15                                                           // style: 15pts (v1 default)
    return { editor: e, score }
  })

  scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score)
  const best = scored[0].editor as Record<string, unknown>

  const dueAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString()

  // Assign editor + set due date
  await supabase
    .from("requests")
    .update({ editor_id: best.user_id, status: "matched", due_at: dueAt })
    .eq("id", requestId)

  // Increment editor queue count
  await supabase
    .from("editor_profiles")
    .update({ current_queue_count: (best.current_queue_count as number) + 1 })
    .eq("user_id", best.user_id)

  // Notify editor
  await supabase.from("notifications").insert({
    user_id: best.user_id,
    message: "New edit request assigned to you!",
    type: "request",
  })

  return corsResponse({
    matched: true,
    editor: {
      userId: best.user_id,
      displayName: best.display_name ?? "Your Editor",
      rating: best.rating,
      specialties: best.specialties,
      avgTurnaroundHours: best.avg_turnaround_hours,
      completedCount: best.completed_count,
    },
    dueAt,
  })
})
