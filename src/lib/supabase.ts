import { createClient } from "@supabase/supabase-js"

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? ""
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Check your environment variables.")
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
)

export type UserRole = "client" | "editor" | "admin"
export type AdminRole = "super_admin" | "ops_admin" | "finance_admin"
export type Region = "US" | "IN"
export type Currency = "USD" | "INR"
export type Gateway = "stripe" | "razorpay"

export interface AppUser {
  id: string
  email: string
  role: UserRole
  region: Region
  currency: Currency
  admin_role: AdminRole | null
  created_at: string
}

export interface ClientProfile {
  user_id: string
  brand_kit_url: string | null
  brand_colors: Record<string, string>
  content_niches: string[]
  posting_frequency: string | null
  style_preferences: string[]
  reference_video_url: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface EditorProfile {
  user_id: string
  display_name: string | null
  bio: string | null
  specialties: string[]
  portfolio_links: string[]
  avg_turnaround_hours: number
  rating: number
  completed_count: number
  max_queue_capacity: number
  current_queue_count: number
  accepts_repeat_clients: boolean
  bank_details_verified: boolean
  is_active: boolean
  unresponsive_count: number
}

export type RequestStatus =
  | "pending_match"
  | "matched"
  | "in_progress"
  | "delivered"
  | "in_revision"
  | "approved"
  | "abandoned"

export type EditType = "basic" | "standard" | "premium"

export interface Request {
  id: string
  client_id: string
  editor_id: string | null
  status: RequestStatus
  edit_type: EditType
  credits_cost: number
  brief: Record<string, unknown>
  footage_url: string | null
  footage_type: "drive_link" | "dropbox_link" | null
  aspect_ratios: string[]
  revision_round: number
  submitted_at: string
  due_at: string | null
  delivered_at: string | null
  approved_at: string | null
  close_after: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  client_id: string
  gateway: Gateway
  gateway_subscription_id: string | null
  gateway_customer_id: string | null
  plan: "quick_sweep" | "deep_clean" | "full_service"
  credits_total: number
  credits_remaining: number
  currency: Currency
  amount_paid: number
  renews_at: string | null
  status: "active" | "cancelled" | "past_due" | "trialing"
  created_at: string
  updated_at: string
}

export interface Deliverable {
  id: string
  request_id: string
  version_number: number
  file_url: string | null
  mux_asset_id: string | null
  mux_playback_id: string | null
  submitted_by: string | null
  submitted_at: string
  status: "processing" | "ready" | "approved"
}

export interface RevisionComment {
  id: string
  deliverable_id: string
  timestamp_seconds: number
  comment: string
  created_by: string
  created_at: string
}

export interface EditorPayout {
  id: string
  editor_id: string
  request_id: string
  amount: number
  currency: Currency
  status: "pending" | "paid" | "failed"
  payout_method: "stripe_connect" | "razorpay_payout" | "manual" | null
  paid_at: string | null
  created_at: string
}

export interface Message {
  id: string
  request_id: string
  sender_id: string | null
  body: string
  created_at: string
  read_at: string | null
}

export interface Brief {
  description?: string
  vibe?: string[]
  captions?: string
  instructions?: string
  referenceLink?: string
}
