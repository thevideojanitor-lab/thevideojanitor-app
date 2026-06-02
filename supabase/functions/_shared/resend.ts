const FROM = "TheVideoJanitors <notifications@send.thevideojanitor.com>"
const REPLY_TO = "thevideojanitor@gmail.com"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY")
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set — skipping email send")
    return
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, reply_to: REPLY_TO, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    // Log but never throw — email failure must not crash payment/match flows
    console.error("[resend] send failed:", res.status, err)
  }
}
