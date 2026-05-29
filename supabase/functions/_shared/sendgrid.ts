export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const apiKey = Deno.env.get("SENDGRID_API_KEY")
  if (!apiKey) {
    console.warn("[sendgrid] SENDGRID_API_KEY not set — skipping")
    return
  }
  const from = Deno.env.get("SENDGRID_FROM") ?? "notifications@thevideojanitor.com"

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "TheVideoJanitors" },
      reply_to: { email: "thevideojanitor@gmail.com" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    // Never throw — email failure must not crash payment/match flows
    console.error("[sendgrid] send failed:", res.status, err)
  }
}
