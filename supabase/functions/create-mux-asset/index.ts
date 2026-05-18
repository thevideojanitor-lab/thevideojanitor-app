import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts"
import { getUserFromAuth } from "../_shared/supabase-admin.ts"

const MUX_TOKEN_ID = Deno.env.get("MUX_TOKEN_ID") ?? ""
const MUX_TOKEN_SECRET = Deno.env.get("MUX_TOKEN_SECRET") ?? ""
const MUX_AUTH = `Basic ${btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`)}`
const MUX_BASE = "https://api.mux.com/video/v1"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const user = await getUserFromAuth(req)
  if (!user) return corsError("Unauthorized", 401)

  // GET ?upload_id=xxx → poll asset status
  if (req.method === "GET") {
    const url = new URL(req.url)
    const uploadId = url.searchParams.get("upload_id")
    if (!uploadId) return corsError("upload_id required")

    // Fetch upload to get asset_id
    const uploadRes = await fetch(`${MUX_BASE}/uploads/${uploadId}`, {
      headers: { Authorization: MUX_AUTH },
    })
    if (!uploadRes.ok) return corsError("Failed to fetch upload status", 502)
    const uploadData = await uploadRes.json()
    const assetId = uploadData.data?.asset_id

    if (!assetId) return corsResponse({ status: "waiting" })

    // Fetch asset to get playback_id and status
    const assetRes = await fetch(`${MUX_BASE}/assets/${assetId}`, {
      headers: { Authorization: MUX_AUTH },
    })
    if (!assetRes.ok) return corsError("Failed to fetch asset", 502)
    const assetData = await assetRes.json()
    const asset = assetData.data
    const playbackId = asset?.playback_ids?.[0]?.id ?? null

    return corsResponse({
      status: asset?.status ?? "preparing",
      asset_id: assetId,
      playback_id: playbackId,
    })
  }

  // POST → create Mux direct upload
  if (req.method === "POST") {
    const muxRes = await fetch(`${MUX_BASE}/uploads`, {
      method: "POST",
      headers: {
        Authorization: MUX_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_asset_settings: { playback_policy: ["public"] },
        cors_origin: "*",
      }),
    })

    if (!muxRes.ok) {
      const err = await muxRes.text()
      console.error("Mux error:", err)
      return corsError("Failed to create Mux upload", 502)
    }

    const data = await muxRes.json()
    return corsResponse({
      upload_url: data.data.url,
      upload_id: data.data.id,
    })
  }

  return corsError("Method not allowed", 405)
})
