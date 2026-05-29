import { getSupabaseAdmin } from "../_shared/supabase-admin.ts"
import { sendEmail } from "../_shared/sendgrid.ts"
import { editReadyEmail } from "../_shared/email-templates.ts"

// Called by Supabase Database Webhook on deliverables UPDATE → status = 'ready'
Deno.serve(async (req) => {
  // Verify the request is from Supabase DB webhook
  const hookSecret = Deno.env.get("SEND_NOTIFICATION_HOOK_SECRET")
  if (hookSecret) {
    const authHeader = req.headers.get("authorization") ?? ""
    const token = authHeader.replace("Bearer ", "")
    if (token !== hookSecret) {
      return new Response("Unauthorized", { status: 401 })
    }
  }

  const payload = await req.json()
  const { type, table, record, old_record } = payload

  // Only handle deliverable → ready transitions
  if (
    table !== "deliverables" ||
    type !== "UPDATE" ||
    record?.status !== "ready" ||
    old_record?.status === "ready"
  ) {
    return new Response("ok", { status: 200 })
  }

  const supabase = getSupabaseAdmin()

  // Look up the request to find the client
  const { data: request } = await supabase
    .from("requests")
    .select("client_id, edit_type, id")
    .eq("id", record.request_id)
    .single()

  if (!request) {
    console.error("[send-notification] request not found for deliverable", record.id)
    return new Response("ok", { status: 200 })
  }

  // Get client email from auth.users
  const { data: authData } = await supabase.auth.admin.getUserById(request.client_id)
  if (!authData?.user?.email) {
    console.error("[send-notification] no email for client", request.client_id)
    return new Response("ok", { status: 200 })
  }

  const clientEmail = authData.user.email
  const clientName = clientEmail.split("@")[0]

  const { subject, html } = editReadyEmail({
    clientName,
    editType: request.edit_type,
    versionNumber: record.version_number ?? 1,
    requestId: request.id,
  })

  await sendEmail({ to: clientEmail, subject, html })

  return new Response("ok", { status: 200 })
})
