const APP = "https://thevideojanitor.com"

// ─── Shell ────────────────────────────────────────────────────────────────────
function shell(accentHex: string, bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<style>
  @media(prefers-color-scheme:light){
    .bg-page{background:#f4f4f5!important}
    .bg-wrap{background:#ffffff!important}
    .bg-header{background:#fafafa!important;border-bottom-color:#e5e7eb!important}
    .bg-card{background:#f3f4f6!important;border-color:#e5e7eb!important}
    .bg-footer{background:#fafafa!important;border-top-color:#e5e7eb!important}
    .c-h{color:#111827!important}
    .c-m{color:#6b7280!important}
    .c-s{color:#9ca3af!important}
    .c-foot{color:#9ca3af!important}
    .c-foot a{color:#6b7280!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table class="bg-page" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0e0e0e">
<tr><td style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" align="center" style="max-width:600px;width:100%">
  <tr>
    <td class="bg-header" bgcolor="#0d0d0d" style="padding:24px 32px;border-radius:12px 12px 0 0;border-bottom:1px solid #1e1e1e">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td bgcolor="#FF5F15" style="border-radius:6px;width:26px;height:26px;text-align:center;vertical-align:middle">
            <span style="display:block;color:#ffffff;font-size:13px;font-weight:900;line-height:26px">V</span>
          </td>
          <td style="padding-left:9px;vertical-align:middle">
            <span class="c-h" style="color:#f9fafb;font-size:13px;font-weight:700;letter-spacing:0.02em">TheVideoJanitors</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr><td height="3" bgcolor="${accentHex}" style="font-size:0;line-height:0">&nbsp;</td></tr>
  ${bodyRows}
  <tr>
    <td class="bg-footer" bgcolor="#0d0d0d" style="padding:16px 32px;border-radius:0 0 12px 12px;border-top:1px solid #1e1e1e;text-align:center">
      <p class="c-foot" style="margin:0;font-size:11px;color:#3a3a3a;line-height:1.7">
        TheVideoJanitors &middot;
        <a class="c-foot" href="${APP}/settings" style="color:#555555;text-decoration:underline">Manage notifications</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ─── 1. Job Assigned → Editor ─────────────────────────────────────────────────
export function jobAssignedEmail({
  editorName,
  clientName,
  editType,
  aspectRatio,
  creditsCost,
  dueHours,
  requestId,
}: {
  editorName: string
  clientName: string
  editType: string
  aspectRatio: string
  creditsCost: number
  dueHours: number
  requestId: string
}): { subject: string; html: string } {
  const briefUrl = `${APP}/editor/requests/${requestId}`
  const subject = `New edit request — ${editType} · ${dueHours}h deadline`
  const html = shell("#FF5F15", `
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:36px 32px 0">
      <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#FF5F15">New Request</p>
      <h1 class="c-h" style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f9fafb;line-height:1.3">You've been assigned a new edit</h1>
      <p class="c-m" style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6">Hi ${editorName}, a client submitted a request and you've been matched. Review the brief and start working — you have ${dueHours} hours to deliver.</p>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 28px">
      <table class="bg-card" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a1a1a" style="border:1px solid #2a2a2a;border-radius:10px">
        <tr>
          <td style="padding:20px 24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p class="c-s" style="margin:0 0 3px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#555555">Client</p>
                  <p class="c-h" style="margin:0;font-size:15px;font-weight:600;color:#f9fafb">${clientName}</p>
                </td>
                <td align="right" valign="top">
                  <span style="background:rgba(255,95,21,0.12);color:#FF5F15;border:1px solid rgba(255,95,21,0.25);font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px">${editType}</span>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;padding-top:18px;border-top:1px solid #2a2a2a">
              <tr>
                <td width="33%" align="center">
                  <p class="c-s" style="margin:0 0 3px;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.06em">Aspect</p>
                  <p class="c-h" style="margin:0;font-size:14px;font-weight:600;color:#f9fafb">${aspectRatio}</p>
                </td>
                <td width="33%" align="center" style="border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a">
                  <p class="c-s" style="margin:0 0 3px;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.06em">Credits</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#FF5F15">${creditsCost} cr</p>
                </td>
                <td width="33%" align="center">
                  <p class="c-s" style="margin:0 0 3px;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:0.06em">Due in</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#facc15;font-family:monospace">${dueHours}h</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 36px;text-align:center">
      <a href="${briefUrl}" style="display:inline-block;background:#FF5F15;color:#000000;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none">View Brief →</a>
      <p class="c-s" style="margin:12px 0 0;font-size:11px;color:#3a3a3a">Missing 3 deadlines deactivates your account.</p>
    </td>
  </tr>
  `)
  return { subject, html }
}

// ─── 2. Edit Ready → Client ───────────────────────────────────────────────────
export function editReadyEmail({
  clientName,
  editType,
  versionNumber,
  requestId,
}: {
  clientName: string
  editType: string
  versionNumber: number
  requestId: string
}): { subject: string; html: string } {
  const reviewUrl = `${APP}/dashboard/requests/${requestId}`
  const subject = `Your edit is ready to review`
  const html = shell("#FF5F15", `
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:36px 32px 0">
      <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#FF5F15">Delivered</p>
      <h1 class="c-h" style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f9fafb;line-height:1.3">Your edit is ready</h1>
      <p class="c-m" style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6">Hi ${clientName}, your editor delivered on time. Review the ${editType} (v${versionNumber}), leave timestamped feedback, or approve to close the job.</p>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 28px">
      <table class="bg-card" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a1a1a" style="border:1px solid #2a2a2a;border-radius:10px">
        <tr>
          <td style="padding:20px 24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p class="c-s" style="margin:0 0 3px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#555555">Revisions included</p>
                  <p class="c-h" style="margin:0;font-size:14px;font-weight:600;color:#f9fafb">3 rounds</p>
                </td>
                <td align="right">
                  <span style="background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.25);font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px">v${versionNumber}</span>
                </td>
              </tr>
            </table>
            <p class="c-s" style="margin:14px 0 0;font-size:12px;color:#555555;border-top:1px solid #2a2a2a;padding-top:14px">Unused revision rounds don't carry over to other requests.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 36px;text-align:center">
      <a href="${reviewUrl}" style="display:inline-block;background:#FF5F15;color:#000000;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none;margin-right:8px">Review Edit →</a>
      <a href="${reviewUrl}?action=approve" style="display:inline-block;background:transparent;color:#f9fafb;font-size:14px;font-weight:600;padding:13px 22px;border-radius:8px;text-decoration:none;border:1px solid #2a2a2a">Approve</a>
    </td>
  </tr>
  `)
  return { subject, html }
}

// ─── 3. Payment Confirmed → Client ────────────────────────────────────────────
export function paymentConfirmedEmail({
  clientName,
  plan,
  credits,
  amount,
  currency,
  renewsAt,
}: {
  clientName: string
  plan: string
  credits: number
  amount: string
  currency: string
  renewsAt: string
}): { subject: string; html: string } {
  const subject = `Payment confirmed — ${credits} credits added to your account`
  const html = shell("#FF5F15", `
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:36px 32px 24px;text-align:center">
      <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#FF5F15">Payment Confirmed</p>
      <p style="margin:0 0 4px;font-size:56px;font-weight:800;color:#FF5F15;line-height:1">${credits}</p>
      <p class="c-m" style="margin:0 0 6px;font-size:16px;color:#9ca3af">credits added to your account</p>
      <p class="c-s" style="margin:0;font-size:13px;color:#555555">${plan} · ${currency} ${amount}</p>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 28px">
      <table class="bg-card" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a1a1a" style="border:1px solid #2a2a2a;border-radius:10px">
        <tr>
          <td style="padding:20px 24px">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
              <tr>
                <td><p class="c-s" style="margin:0;font-size:12px;color:#555555">Current balance</p></td>
                <td align="right"><p style="margin:0;font-size:13px;font-weight:700;color:#FF5F15">${credits} cr</p></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px">
              <tr>
                <td bgcolor="#2a2a2a" style="border-radius:4px;height:6px;font-size:0;line-height:0">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td bgcolor="#FF5F15" style="border-radius:4px;height:6px;font-size:0;line-height:0">&nbsp;</td></tr>
                  </table>
                </td>
              </tr>
            </table>
            <p class="c-s" style="margin:0;font-size:11px;color:#3a3a3a">Renews ${renewsAt} · Credits reset monthly, no rollover</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 36px;text-align:center">
      <a href="${APP}/dashboard/new-request" style="display:inline-block;background:#FF5F15;color:#000000;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none">Submit a Request →</a>
    </td>
  </tr>
  `)
  return { subject, html }
}

// ─── 4. Payment Failed → Client ───────────────────────────────────────────────
export function paymentFailedEmail({
  clientName,
  plan,
  amount,
  currency,
}: {
  clientName: string
  plan: string
  amount: string
  currency: string
}): { subject: string; html: string } {
  const subject = `Action needed — your payment failed`
  const html = shell("#f87171", `
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:36px 32px 0">
      <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#f87171">Action Required</p>
      <h1 class="c-h" style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f9fafb;line-height:1.3">Your payment failed</h1>
      <p class="c-m" style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6">Hi ${clientName}, we couldn't process your payment after 3 attempts. Your account is now paused — active requests are on hold.</p>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 28px">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.20);border-radius:10px">
        <tr>
          <td style="padding:20px 24px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td><p class="c-m" style="margin:0;font-size:13px;color:#9ca3af">Plan</p></td>
                <td align="right"><p class="c-h" style="margin:0;font-size:13px;font-weight:600;color:#f9fafb">${plan} · ${currency} ${amount}</p></td>
              </tr>
              <tr>
                <td style="padding-top:8px"><p class="c-m" style="margin:0;font-size:13px;color:#9ca3af">Attempts</p></td>
                <td align="right" style="padding-top:8px"><p style="margin:0;font-size:13px;font-weight:600;color:#f87171">3 of 3</p></td>
              </tr>
              <tr>
                <td style="padding-top:8px"><p class="c-m" style="margin:0;font-size:13px;color:#9ca3af">Account status</p></td>
                <td align="right" style="padding-top:8px"><p style="margin:0;font-size:13px;font-weight:600;color:#f87171">Paused</p></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 36px;text-align:center">
      <a href="${APP}/dashboard/billing" style="display:inline-block;background:#f87171;color:#000000;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none">Update Payment Method →</a>
      <p class="c-s" style="margin:12px 0 0;font-size:12px;color:#3a3a3a">Your data is safe. Updating your card reactivates the account immediately.</p>
    </td>
  </tr>
  `)
  return { subject, html }
}

// ─── 5. Welcome → Client ──────────────────────────────────────────────────────
export function welcomeEmail({
  name,
}: {
  name: string
}): { subject: string; html: string } {
  const subject = `Welcome — your editing team is ready`
  const html = shell("#FF5F15", `
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:40px 32px 24px;text-align:center">
      <p style="margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:0.10em;text-transform:uppercase;color:#FF5F15">Account Created</p>
      <h1 class="c-h" style="margin:0 0 12px;font-size:24px;font-weight:700;color:#f9fafb;line-height:1.3">Clean edits. Fast delivery.<br>No freelancer roulette.</h1>
      <p class="c-m" style="margin:0;font-size:15px;color:#9ca3af;line-height:1.6">Hi ${name}, you're in. Pick a plan and submit your first request — your matched editor delivers in 48 hours.</p>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 28px">
      <table class="bg-card" width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a1a1a" style="border:1px solid #2a2a2a;border-radius:10px">
        <tr>
          <td style="padding:20px 24px">
            <p class="c-s" style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#555555">How it works</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding-bottom:12px">
                <table cellpadding="0" cellspacing="0"><tr>
                  <td valign="top" style="width:24px;height:24px;border-radius:50%;background:rgba(255,95,21,0.12);border:1px solid rgba(255,95,21,0.30);text-align:center">
                    <span style="display:block;font-size:11px;font-weight:700;color:#FF5F15;line-height:24px">1</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:top">
                    <p class="c-h" style="margin:0 0 2px;font-size:13px;font-weight:600;color:#f9fafb">Subscribe &amp; get credits</p>
                    <p class="c-m" style="margin:0;font-size:12px;color:#9ca3af">Credits deduct on submit, not approval.</p>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="padding-bottom:12px;border-top:1px solid #2a2a2a;padding-top:12px">
                <table cellpadding="0" cellspacing="0"><tr>
                  <td valign="top" style="width:24px;height:24px;border-radius:50%;background:rgba(255,95,21,0.12);border:1px solid rgba(255,95,21,0.30);text-align:center">
                    <span style="display:block;font-size:11px;font-weight:700;color:#FF5F15;line-height:24px">2</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:top">
                    <p class="c-h" style="margin:0 0 2px;font-size:13px;font-weight:600;color:#f9fafb">Submit your request</p>
                    <p class="c-m" style="margin:0;font-size:12px;color:#9ca3af">Drop your footage link and brief — auto-matched editor.</p>
                  </td>
                </tr></table>
              </td></tr>
              <tr><td style="border-top:1px solid #2a2a2a;padding-top:12px">
                <table cellpadding="0" cellspacing="0"><tr>
                  <td valign="top" style="width:24px;height:24px;border-radius:50%;background:rgba(255,95,21,0.12);border:1px solid rgba(255,95,21,0.30);text-align:center">
                    <span style="display:block;font-size:11px;font-weight:700;color:#FF5F15;line-height:24px">3</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:top">
                    <p class="c-h" style="margin:0 0 2px;font-size:13px;font-weight:600;color:#f9fafb">Review &amp; approve in 48h</p>
                    <p class="c-m" style="margin:0;font-size:12px;color:#9ca3af">3 revision rounds included. Credits reset monthly.</p>
                  </td>
                </tr></table>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="bg-wrap" bgcolor="#111111" style="padding:0 32px 36px;text-align:center">
      <a href="${APP}/pricing" style="display:inline-block;background:#FF5F15;color:#000000;font-size:14px;font-weight:700;padding:13px 28px;border-radius:8px;text-decoration:none">Choose a Plan →</a>
    </td>
  </tr>
  `)
  return { subject, html }
}
