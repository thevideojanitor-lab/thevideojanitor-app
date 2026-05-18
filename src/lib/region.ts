import { supabase, Region, Currency, Gateway } from "./supabase"

export interface RegionConfig {
  region: Region
  currency: Currency
  gateway: Gateway
}

const STORAGE_KEY = "tvj_region"

function regionToGateway(region: Region): Gateway {
  return region === "IN" ? "razorpay" : "stripe"
}

function currencyForRegion(region: Region): Currency {
  return region === "IN" ? "INR" : "USD"
}

const DEFAULT: RegionConfig = { region: "US", currency: "USD", gateway: "stripe" }

export function getCachedRegion(): RegionConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveRegionLocally(config: RegionConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // localStorage unavailable — proceed without caching
  }
}

export async function detectRegion(): Promise<RegionConfig> {
  const cached = getCachedRegion()
  if (cached) return cached

  try {
    const res = await fetch("https://ipapi.co/json/")
    if (!res.ok) throw new Error("ipapi non-200")
    const data = await res.json()
    const region: Region = data.country_code === "IN" ? "IN" : "US"
    const config: RegionConfig = {
      region,
      currency: currencyForRegion(region),
      gateway: regionToGateway(region),
    }
    saveRegionLocally(config)
    return config
  } catch {
    saveRegionLocally(DEFAULT)
    return DEFAULT
  }
}

export async function persistRegionToUser(userId: string, config: RegionConfig) {
  await supabase
    .from("users")
    .update({ region: config.region, currency: config.currency })
    .eq("id", userId)
}
