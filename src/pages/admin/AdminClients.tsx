import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, MoreHorizontal, X } from "lucide-react"
import { fadeUp, scaleIn, slideInFromRight } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientRow {
  id: string
  email: string
  region: string
  created_at: string
  plan: string | null
  credits_remaining: number
  credits_total: number
  sub_status: string | null
  active_requests: number
}

interface ClientProfile {
  brand_kit_url: string | null
  brand_colors: Record<string, string>
  content_niches: string[]
  posting_frequency: string | null
  style_preferences: string[]
  onboarding_complete: boolean
}

async function logAction(adminId: string, type: string, targetId: string, notes?: string) {
  await supabase.from("admin_actions").insert({ admin_id: adminId, action_type: type, target_type: "client", target_id: targetId, notes: notes ?? null })
}

const PLAN_OPTIONS = ["quick_sweep", "deep_clean", "full_service"]
const PLAN_LABELS: Record<string, string> = { quick_sweep: "Quick Sweep", deep_clean: "Deep Clean", full_service: "Full Service" }

// ── Row menu ──────────────────────────────────────────────────────────────────

function RowMenu({ client, onAction }: { client: ClientRow; onAction: (a: string, c: ClientRow) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="w-7 h-7 rounded-lg bg-[#2A2A2A] hover:bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
        <MoreHorizontal size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 4 }} transition={{ duration: 0.12 }} className="absolute right-0 top-8 w-40 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl z-30 overflow-hidden py-1">
            {["view","credits","plan","suspend","impersonate"].map((a) => (
              <button key={a} onClick={() => { onAction(a, client); setOpen(false) }} className="w-full text-left px-4 py-2 text-xs text-[#F9FAFB] hover:bg-[#404040] transition-colors capitalize">
                {a === "credits" ? "Adjust Credits" : a === "plan" ? "Change Plan" : a === "impersonate" ? "Impersonate" : a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminClients() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [rows, setRows] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }])
  const [search, setSearch] = useState("")
  const [activeAction, setActiveAction] = useState<{ key: string; client: ClientRow } | null>(null)
  const [profile, setProfile] = useState<ClientProfile | null>(null)

  // Adjust credits
  const [creditDelta, setCreditDelta] = useState("")
  const [creditReason, setCreditReason] = useState("")

  // Change plan
  const [newPlan, setNewPlan] = useState("")

  // Suspend / impersonate
  const [suspendReason, setSuspendReason] = useState("")
  const [working, setWorking] = useState(false)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    const { data: users } = await supabase.from("users").select("id, email, region, created_at").eq("role", "client")
    if (!users) { setLoading(false); return }

    const ids = users.map((u: {id: string}) => u.id)
    const [{ data: subs }, { data: reqs }] = await Promise.all([
      supabase.from("subscriptions").select("client_id, plan, credits_remaining, credits_total, status").in("client_id", ids).eq("status", "active"),
      supabase.from("requests").select("client_id, status").in("client_id", ids).in("status", ["pending_match","matched","in_progress","delivered","in_revision"]),
    ])

    const subMap: Record<string, {plan: string; credits_remaining: number; credits_total: number; sub_status: string}> = {}
    for (const s of (subs ?? []) as {client_id: string; plan: string; credits_remaining: number; credits_total: number; status: string}[]) {
      subMap[s.client_id] = { plan: s.plan, credits_remaining: s.credits_remaining, credits_total: s.credits_total, sub_status: s.status }
    }

    const reqCounts: Record<string, number> = {}
    for (const r of (reqs ?? []) as {client_id: string}[]) {
      reqCounts[r.client_id] = (reqCounts[r.client_id] ?? 0) + 1
    }

    setRows((users as {id: string; email: string; region: string; created_at: string}[]).map((u) => ({
      id: u.id,
      email: u.email,
      region: u.region,
      created_at: u.created_at,
      plan: subMap[u.id]?.plan ?? null,
      credits_remaining: subMap[u.id]?.credits_remaining ?? 0,
      credits_total: subMap[u.id]?.credits_total ?? 0,
      sub_status: subMap[u.id]?.sub_status ?? null,
      active_requests: reqCounts[u.id] ?? 0,
    })))
    setLoading(false)
  }

  const filtered = useMemo(() =>
    rows.filter((r) => !search || r.email.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  )

  const columns = useMemo<ColumnDef<ClientRow>[]>(() => [
    { id: "email", header: "Email", accessorKey: "email", cell: (i) => <span className="text-xs text-[#F9FAFB]">{i.getValue() as string}</span> },
    { id: "plan", header: "Plan", accessorKey: "plan", cell: (i) => <span className="text-xs text-[#9CA3AF] capitalize">{PLAN_LABELS[i.getValue() as string] ?? "—"}</span> },
    { id: "region", header: "Region", accessorKey: "region", cell: (i) => <span className="text-xs text-[#9CA3AF]">{i.getValue() as string}</span> },
    { id: "credits_remaining", header: "Credits", accessorKey: "credits_remaining", cell: (i) => <span className="text-xs font-bold text-[#FF5F15]">{(i.getValue() as number).toLocaleString()}</span> },
    { id: "active_requests", header: "Active", accessorKey: "active_requests", cell: (i) => <span className="text-xs text-[#9CA3AF]">{i.getValue() as number}</span> },
    { id: "created_at", header: "Since", accessorKey: "created_at", cell: (i) => <span className="text-xs text-[#9CA3AF]">{new Date(i.getValue() as string).toLocaleDateString()}</span> },
    { id: "sub_status", header: "Status", accessorKey: "sub_status", cell: (i) => {
      const v = i.getValue() as string | null
      return <span className={`text-xs font-medium ${v === "active" ? "text-[#4ade80]" : v === "cancelled" ? "text-red-400" : "text-[#9CA3AF]"}`}>{v ?? "—"}</span>
    }},
    { id: "actions", header: "", enableSorting: false, cell: (i) => <RowMenu client={i.row.original} onAction={handleAction} /> },
  ], [])

  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), initialState: { pagination: { pageSize: 20 } } })

  async function handleAction(key: string, client: ClientRow) {
    if (key === "view") {
      const { data } = await supabase.from("client_profiles").select("*").eq("user_id", client.id).single()
      setProfile(data as ClientProfile)
    } else {
      setProfile(null)
    }
    setActiveAction({ key, client })
    setCreditDelta("")
    setCreditReason("")
    setNewPlan(client.plan ?? "quick_sweep")
    setSuspendReason("")
  }

  async function handleCredits() {
    if (!user || !activeAction || !creditDelta || !creditReason.trim()) return
    setWorking(true)
    const delta = parseInt(creditDelta)
    if (isNaN(delta)) { setWorking(false); return }
    const { data: sub } = await supabase.from("subscriptions").select("id, credits_remaining").eq("client_id", activeAction.client.id).eq("status", "active").single()
    if (sub) {
      await supabase.from("subscriptions").update({ credits_remaining: Math.max(0, sub.credits_remaining + delta) }).eq("id", sub.id)
    }
    await logAction(user.id, "credit_adjust", activeAction.client.id, `${delta > 0 ? "+" : ""}${delta} credits — ${creditReason}`)
    toast({ title: "Credits adjusted", description: `${delta > 0 ? "+" : ""}${delta} credits applied.` })
    setWorking(false)
    setActiveAction(null)
    loadClients()
  }

  async function handleChangePlan() {
    if (!user || !activeAction || !newPlan) return
    setWorking(true)
    await supabase.from("subscriptions").update({ plan: newPlan }).eq("client_id", activeAction.client.id).eq("status", "active")
    await logAction(user.id, "change_plan", activeAction.client.id, `Plan changed to ${newPlan}`)
    setWorking(false)
    setActiveAction(null)
    loadClients()
  }

  async function handleSuspend() {
    if (!user || !activeAction || !suspendReason.trim()) return
    setWorking(true)
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("client_id", activeAction.client.id)
    await logAction(user.id, "suspend_client", activeAction.client.id, suspendReason)
    toast({ title: "Client suspended" })
    setWorking(false)
    setActiveAction(null)
    loadClients()
  }

  async function handleImpersonate() {
    if (!user || !activeAction) return
    // Store impersonation in localStorage for the impersonation banner to pick up
    localStorage.setItem("impersonate_client_id", activeAction.client.id)
    localStorage.setItem("impersonate_client_email", activeAction.client.email)
    await logAction(user.id, "impersonate_start", activeAction.client.id, `Admin impersonating ${activeAction.client.email}`)
    toast({ title: `Now impersonating ${activeAction.client.email}`, description: "Open client dashboard to see their view." })
    setActiveAction(null)
  }

  const close = () => setActiveAction(null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Clients</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{filtered.length} total</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email…" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none w-48" />
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2.5">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="h-9 bg-[#404040]/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-[#2A2A2A]">
                      {hg.headers.map((h) => (
                        <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] cursor-pointer select-none whitespace-nowrap">
                          <span className="flex items-center gap-1">{flexRender(h.column.columnDef.header, h.getContext())}{h.column.getIsSorted() === "asc" && <ChevronUp size={10} />}{h.column.getIsSorted() === "desc" && <ChevronDown size={10} />}</span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-[#2A2A2A] hover:bg-[#404040]/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A2A]">
              <span className="text-[10px] text-[#9CA3AF]">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1.5 text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronsLeft size={14} /></button>
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronLeft size={14} /></button>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronRight size={14} /></button>
                <button onClick={() => table.setPageIndex(table.getPageCount()-1)} disabled={!table.getCanNextPage()} className="p-1.5 text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronsRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ── Profile Drawer ── */}
      <AnimatePresence>
        {activeAction?.key === "view" && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#121212]/60 z-40" onClick={close} />
            <motion.div variants={slideInFromRight} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">{activeAction.client.email}</h2>
                <button onClick={close} className="w-8 h-8 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={15} /></button>
              </div>
              <div className="p-5 space-y-4">
                {profile && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        ["Niches", profile.content_niches.join(", ") || "—"],
                        ["Frequency", profile.posting_frequency ?? "—"],
                        ["Style Prefs", profile.style_preferences.join(", ") || "—"],
                        ["Onboarding", profile.onboarding_complete ? "Complete" : "Incomplete"],
                        ["Plan", PLAN_LABELS[activeAction.client.plan ?? ""] ?? "—"],
                        ["Credits", `${activeAction.client.credits_remaining} / ${activeAction.client.credits_total}`],
                        ["Region", activeAction.client.region],
                        ["Active Reqs", String(activeAction.client.active_requests)],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-[#404040] rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1">{k}</p>
                          <p className="text-[#F9FAFB] font-medium break-words">{v}</p>
                        </div>
                      ))}
                    </div>
                    {profile.brand_kit_url && (
                      <a href={profile.brand_kit_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF5F15] hover:underline">View Brand Kit</a>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Adjust Credits Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "credits" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Adjust Credits</h2>
                <button onClick={close} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <p className="text-xs text-[#9CA3AF]">Current: <span className="text-[#FF5F15] font-bold">{activeAction.client.credits_remaining} cr</span></p>
              <input type="number" value={creditDelta} onChange={(e) => setCreditDelta(e.target.value)} placeholder="+100 or -50 credits…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <input value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="Reason (required)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <div className="flex gap-2">
                <button onClick={close} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleCredits} disabled={!creditDelta || !creditReason.trim() || working} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {working ? "Saving…" : "Apply"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Change Plan Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "plan" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Change Plan</h2>
                <button onClick={close} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <div className="space-y-2">
                {PLAN_OPTIONS.map((p) => (
                  <label key={p} onClick={() => setNewPlan(p)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${newPlan === p ? "border-[#FF5F15]/40 bg-[#FF5F15]/8" : "border-[#2A2A2A] hover:bg-[#404040]"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${newPlan === p ? "border-[#FF5F15]" : "border-[#404040]"}`}>
                      {newPlan === p && <div className="w-2 h-2 rounded-full bg-[#FF5F15]" />}
                    </div>
                    <span className="text-sm text-[#F9FAFB]">{PLAN_LABELS[p]}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={close} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleChangePlan} disabled={working} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {working ? "Saving…" : "Change Plan"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Suspend Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "suspend" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Suspend Client</h2>
                <button onClick={close} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">This will cancel the subscription and block new submissions.</p>
              <input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} placeholder="Reason (required)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <div className="flex gap-2">
                <button onClick={close} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSuspend} disabled={!suspendReason.trim() || working} className="flex-1 bg-red-500 text-[#F9FAFB] font-semibold text-sm rounded-lg py-2.5 hover:bg-red-600 disabled:opacity-40 transition-colors">
                  {working ? "Suspending…" : "Suspend"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Impersonate Confirm ── */}
      <AnimatePresence>
        {activeAction?.key === "impersonate" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Impersonate Client</h2>
              <p className="text-xs text-[#9CA3AF]">You will see the client dashboard as <span className="text-[#F9FAFB] font-semibold">{activeAction.client.email}</span>. An orange banner will show at all times.</p>
              <div className="flex gap-2">
                <button onClick={close} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleImpersonate} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] transition-colors">
                  Start Impersonation
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
