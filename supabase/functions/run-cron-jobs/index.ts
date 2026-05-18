import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const now = new Date().toISOString()

    // 1. Auto-close delivered requests past their close_after window (7 days)
    const { data: toClose } = await supabase
      .from("requests")
      .select("id, editor_id")
      .eq("status", "delivered")
      .lt("close_after", now)

    if (toClose?.length) {
      await supabase
        .from("requests")
        .update({ status: "abandoned" })
        .in("id", toClose.map((r) => r.id))

      await supabase.from("admin_actions").insert(
        toClose.map((r) => ({
          admin_id: null,
          action_type: "auto_close",
          target_type: "request",
          target_id: r.id,
          notes: "Auto-closed 7 days after delivery without client approval",
        }))
      )
    }

    // 2. Reassign editors unresponsive for 12h (matched but never moved to in_progress)
    const cutoff12h = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    const { data: stale } = await supabase
      .from("requests")
      .select("id, editor_id")
      .eq("status", "matched")
      .lt("updated_at", cutoff12h)

    if (stale?.length) {
      const editorIds = [...new Set(stale.map((r) => r.editor_id).filter(Boolean))] as string[]

      for (const editorId of editorIds) {
        const { data: profile } = await supabase
          .from("editor_profiles")
          .select("unresponsive_count")
          .eq("user_id", editorId)
          .single()

        if (profile) {
          const newCount = profile.unresponsive_count + 1
          await supabase
            .from("editor_profiles")
            .update({
              unresponsive_count: newCount,
              ...(newCount >= 3 ? { is_active: false } : {}),
            })
            .eq("user_id", editorId)
        }
      }

      await supabase
        .from("requests")
        .update({ editor_id: null, status: "pending_match" })
        .in("id", stale.map((r) => r.id))

      await supabase.from("admin_actions").insert(
        stale.map((r) => ({
          admin_id: null,
          action_type: "editor_reassign",
          target_type: "request",
          target_id: r.id,
          notes: `Editor ${r.editor_id ?? "unknown"} unresponsive for 12h — returned to queue`,
        }))
      )
    }

    return corsResponse({
      closed: toClose?.length ?? 0,
      reassigned: stale?.length ?? 0,
    })
  } catch (err) {
    return corsError(err instanceof Error ? err.message : "Cron job failed", 500)
  }
})
