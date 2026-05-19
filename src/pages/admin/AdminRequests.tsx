import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table"
import {
  AlertTriangle, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, ChevronsLeft, ChevronsRight, Eye, MoreHorizontal, Star, X,
} from "lucide-react"
import { fadeUp, scaleIn, slideInFromRight } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"
import StatusBadge from "@/components/StatusBadge"
import type { Request } from "@/lib/supabase"

// ── Helpers ───────────────────────────────────────────────────────────────────

async function logAction(adminId: string, actionType: string, targetType: string, targetId?: string, notes?: string) {
  await supabase.from("admin_actions").insert({ admin_id: adminId, action_type: actionType, target_type: targetType, target_id: targetId ?? null, notes: notes ?? null })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" })
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
function shortId(id: string) { return id.slice(0, 8) }

const STATUS_OPTIONS = ["all","pending_match","matched","in_progress","delivered","in_revision","approved","abandoned"]

// ── Row action menu ───────────────────────────────────────────────────────────

function RowMenu({ req, onAction }: { req: Request; onAction: (action: string, req: Request) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const actions = [
    { key: "view",    label: "View Details" },
    { key: "reassign",label: "Reassign Editor" },
    { key: "extend",  label: "Extend Deadline" },
    { key: "approve", label: "Force Approve" },
    { key: "refund",  label: "Refund Credits" },
    { key: "chat",    label: "View Chat" },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-lg bg-[#2A2A2A] hover:bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
      >
        <MoreHorizontal size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 w-44 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl z-30 overflow-hidden py-1"
          >
            {actions.map((a) => (
              <button
                key={a.key}
                onClick={() => { onAction(a.key, req); setOpen(false) }}
                className="w-full text-left px-4 py-2 text-xs text-[#F9FAFB] hover:bg-[#404040] transition-colors"
              >
                {a.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminRequests() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [rows, setRows] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([{ id: "submitted_at", desc: true }])
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [search, setSearch] = useState("")

  // Action modals/drawers
  const [activeAction, setActiveAction] = useState<{ key: string; req: Request } | null>(null)
  const [drawerReq, setDrawerReq] = useState<Request | null>(null)
  const [chatMessages, setChatMessages] = useState<{ id: string; sender_id: string | null; body: string; created_at: string }[]>([])

  // Reassign modal state
  const [editors, setEditors] = useState<{ user_id: string; display_name: string | null; rating: number; current_queue_count: number; max_queue_capacity: number; specialties: string[] }[]>([])
  const [reassigning, setReassigning] = useState<string | null>(null)

  // Extend deadline
  const [extendDate, setExtendDate] = useState("")
  const [extendReason, setExtendReason] = useState("")

  // Force approve / refund
  const [actionReason, setActionReason] = useState("")
  const [refundAmount, setRefundAmount] = useState("")
  const [working, setWorking] = useState(false)

  useEffect(() => { loadRequests() }, [])

  async function loadRequests() {
    setLoading(true)
    const { data } = await supabase
      .from("requests")
      .select("*")
      .order("submitted_at", { ascending: false })
    setRows((data as Request[]) ?? [])
    setLoading(false)
  }

  // Filter data
  const now = new Date()
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (overdueOnly && !(r.due_at && new Date(r.due_at) < now && !["approved","abandoned"].includes(r.status))) return false
      if (search) {
        const q = search.toLowerCase()
        if (!r.id.includes(q) && !r.edit_type.includes(q)) return false
      }
      return true
    })
  }, [rows, statusFilter, overdueOnly, search])

  const columns = useMemo<ColumnDef<Request>[]>(() => [
    { id: "id", header: "ID", accessorFn: (r) => shortId(r.id), cell: (i) => <span className="font-mono text-[#9CA3AF] text-[10px]">{i.getValue() as string}</span> },
    { id: "status", header: "Status", accessorKey: "status", cell: (i) => <StatusBadge status={i.getValue() as string} /> },
    { id: "edit_type", header: "Type", accessorKey: "edit_type", cell: (i) => <span className="capitalize text-xs">{i.getValue() as string}</span> },
    { id: "credits_cost", header: "Credits", accessorKey: "credits_cost", cell: (i) => <span className="text-xs font-bold text-[#FF5F15]">{i.getValue() as number}</span> },
    { id: "submitted_at", header: "Submitted", accessorKey: "submitted_at", cell: (i) => <span className="text-xs text-[#9CA3AF]">{fmtDate(i.getValue() as string)}</span> },
    {
      id: "due_at", header: "Due", accessorKey: "due_at",
      cell: (i) => {
        const v = i.getValue() as string | null
        if (!v) return <span className="text-xs text-[#9CA3AF]">—</span>
        const overdue = new Date(v) < now && !["approved","abandoned"].includes(i.row.original.status)
        return (
          <span className={`text-xs ${overdue ? "text-red-400 font-semibold" : "text-[#9CA3AF]"}`}>
            {overdue && <AlertTriangle size={10} className="inline mr-1" />}
            {fmtDate(v)}
          </span>
        )
      },
    },
    {
      id: "actions", header: "", enableSorting: false,
      cell: (i) => <RowMenu req={i.row.original} onAction={(k, r) => handleAction(k, r)} />,
    },
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  async function handleAction(key: string, req: Request) {
    if (key === "view") { setDrawerReq(req); setActiveAction(null); return }
    if (key === "chat") {
      const { data } = await supabase.from("messages").select("*").eq("request_id", req.id).order("created_at", { ascending: true })
      setChatMessages(data ?? [])
      setActiveAction({ key: "chat", req })
      return
    }
    if (key === "reassign") {
      const { data } = await supabase.from("editor_profiles").select("user_id, display_name, rating, current_queue_count, max_queue_capacity, specialties").eq("is_active", true)
      setEditors((data as typeof editors) ?? [])
    }
    setActiveAction({ key, req })
    setActionReason("")
    setRefundAmount("")
    setExtendDate(req.due_at ? req.due_at.slice(0,16) : "")
    setExtendReason("")
  }

  async function handleReassign(editorId: string) {
    if (!user || !activeAction) return
    setReassigning(editorId)
    const { error } = await supabase.from("requests").update({ editor_id: editorId, status: "matched" }).eq("id", activeAction.req.id)
    setReassigning(null)
    if (error) {
      toast({ title: "Couldn't reassign editor", description: "Please try again.", variant: "destructive" })
      return
    }
    await logAction(user.id, "editor_reassign", "request", activeAction.req.id, `Reassigned to ${editorId}`)
    setActiveAction(null)
    toast({ title: "Editor reassigned", description: "The request has been moved to the new editor." })
    loadRequests()
  }

  async function handleExtend() {
    if (!user || !activeAction || !extendDate || !extendReason.trim()) return
    setWorking(true)
    const { error } = await supabase.from("requests").update({ due_at: new Date(extendDate).toISOString() }).eq("id", activeAction.req.id)
    if (error) {
      setWorking(false)
      toast({ title: "Couldn't extend the deadline", description: "Please try again.", variant: "destructive" })
      return
    }
    await logAction(user.id, "extend_deadline", "request", activeAction.req.id, extendReason)
    setWorking(false)
    setActiveAction(null)
    toast({ title: "Deadline extended", description: "The new due date has been saved." })
    loadRequests()
  }

  async function handleForceApprove() {
    if (!user || !activeAction || !actionReason.trim()) return
    setWorking(true)
    const { error } = await supabase.from("requests").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", activeAction.req.id)
    if (error) {
      setWorking(false)
      toast({ title: "Couldn't approve the request", description: "Please try again.", variant: "destructive" })
      return
    }
    await logAction(user.id, "force_approve", "request", activeAction.req.id, actionReason)
    setWorking(false)
    setActiveAction(null)
    toast({ title: "Request approved", description: "The request was force-approved and logged." })
    loadRequests()
  }

  async function handleRefund() {
    if (!user || !activeAction || !actionReason.trim() || !refundAmount) return
    const amount = parseInt(refundAmount)
    if (isNaN(amount) || amount <= 0) return
    setWorking(true)
    // Increment client's credits_remaining
    const { data: sub, error: subErr } = await supabase.from("subscriptions").select("id, credits_remaining").eq("client_id", activeAction.req.client_id).eq("status", "active").single()
    if (subErr || !sub) {
      setWorking(false)
      toast({ title: "Couldn't refund credits", description: "No active subscription found for this client.", variant: "destructive" })
      return
    }
    const { error: updateErr } = await supabase.from("subscriptions").update({ credits_remaining: sub.credits_remaining + amount }).eq("id", sub.id)
    if (updateErr) {
      setWorking(false)
      toast({ title: "Couldn't refund credits", description: "Please try again.", variant: "destructive" })
      return
    }
    await logAction(user.id, "refund_credits", "request", activeAction.req.id, `${amount} credits — ${actionReason}`)
    setWorking(false)
    setActiveAction(null)
    toast({ title: `${amount} credits refunded`, description: "The client's balance has been updated." })
    loadRequests()
  }

  const closeActive = () => setActiveAction(null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Requests</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{filtered.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#F9FAFB] focus:border-[#FF5F15] outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s.replace("_"," ")}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-[#9CA3AF] cursor-pointer">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="accent-[#FF5F15]"
          />
          Overdue only
        </label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID or type…"
          className="ml-auto bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none w-48"
        />
      </motion.div>

      {/* Table */}
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
                        <th
                          key={h.id}
                          onClick={h.column.getToggleSortingHandler()}
                          className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] cursor-pointer select-none whitespace-nowrap"
                        >
                          <span className="flex items-center gap-1">
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getIsSorted() === "asc" && <ChevronUp size={10} />}
                            {h.column.getIsSorted() === "desc" && <ChevronDown size={10} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-[#2A2A2A] hover:bg-[#404040]/30 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A2A]">
              <span className="text-[10px] text-[#9CA3AF]">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronsLeft size={14} /></button>
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronLeft size={14} /></button>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 rounded text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronRight size={14} /></button>
                <button onClick={() => table.setPageIndex(table.getPageCount()-1)} disabled={!table.getCanNextPage()} className="p-1.5 rounded text-[#9CA3AF] disabled:opacity-30 hover:text-[#F9FAFB]"><ChevronsRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ── View Details Drawer ── */}
      <AnimatePresence>
        {drawerReq && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#121212]/60 z-40" onClick={() => setDrawerReq(null)} />
            <motion.div variants={slideInFromRight} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Request Details</h2>
                <button onClick={() => setDrawerReq(null)} className="w-8 h-8 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={15} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["ID", drawerReq.id],
                    ["Status", drawerReq.status],
                    ["Type", drawerReq.edit_type],
                    ["Credits", String(drawerReq.credits_cost)],
                    ["Submitted", fmtDateTime(drawerReq.submitted_at)],
                    ["Due", drawerReq.due_at ? fmtDateTime(drawerReq.due_at) : "—"],
                    ["Delivered", drawerReq.delivered_at ? fmtDateTime(drawerReq.delivered_at) : "—"],
                    ["Approved", drawerReq.approved_at ? fmtDateTime(drawerReq.approved_at) : "—"],
                    ["Revision Round", String(drawerReq.revision_round)],
                    ["Aspect Ratios", drawerReq.aspect_ratios.join(", ")],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#404040] rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1">{k}</p>
                      <p className="text-[#F9FAFB] font-medium break-all">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#404040] rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-3">Brief</p>
                  {drawerReq.brief && Object.keys(drawerReq.brief).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(drawerReq.brief as Record<string, unknown>).map(([k, v]) => {
                        const value = Array.isArray(v) ? v.join(", ") : String(v ?? "")
                        if (!value.trim()) return null
                        return (
                          <div key={k}>
                            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-0.5 capitalize">
                              {k.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-[#F9FAFB] leading-relaxed whitespace-pre-wrap break-words">
                              {value}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#9CA3AF]">No brief details provided.</p>
                  )}
                </div>
                {drawerReq.footage_url && (
                  <a href={drawerReq.footage_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#FF5F15] hover:underline">
                    <Eye size={13} /> View Footage Link
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Reassign Editor Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "reassign" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Reassign Editor</h2>
                <button onClick={closeActive} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {editors.map((e) => {
                  const load = e.current_queue_count / e.max_queue_capacity
                  const avail = load < 0.8 ? 20 : load < 0.9 ? 15 : 5
                  const rating = e.rating >= 4.8 ? 10 : e.rating >= 4.5 ? 5 : 0
                  const total = avail + rating + 15
                  return (
                    <div key={e.user_id} className="flex items-center gap-3 bg-[#404040] rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F9FAFB] truncate">{e.display_name ?? "Editor"}</p>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                          Avail: {avail}/20 · Rating: {rating}/10 · Style: 15/30 ·
                          <span className="text-[#FF5F15] font-bold ml-1">Total: {total}/100</span>
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">Queue: {e.current_queue_count}/{e.max_queue_capacity} · <Star size={9} className="inline-block -mt-0.5 fill-yellow-400 text-yellow-400" /> {e.rating.toFixed(2)}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleReassign(e.user_id)}
                        disabled={!!reassigning}
                        className="px-3 py-1.5 bg-[#FF5F15] text-[#121212] text-xs font-semibold rounded-lg hover:bg-[#E54E08] disabled:opacity-40 transition-colors"
                      >
                        {reassigning === e.user_id ? "Assigning…" : "Assign"}
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Extend Deadline Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "extend" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Extend Deadline</h2>
                <button onClick={closeActive} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <input type="datetime-local" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] focus:border-[#FF5F15] outline-none" />
              <input value={extendReason} onChange={(e) => setExtendReason(e.target.value)} placeholder="Reason (required)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <div className="flex gap-2">
                <button onClick={closeActive} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleExtend} disabled={!extendDate || !extendReason.trim() || working} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {working ? "Saving…" : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Force Approve Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "approve" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Force Approve</h2>
                <button onClick={closeActive} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <p className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2.5">
                This will approve the request without client action and trigger an editor payout.
              </p>
              <input value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Reason (required)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <div className="flex gap-2">
                <button onClick={closeActive} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleForceApprove} disabled={!actionReason.trim() || working} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {working ? "Approving…" : "Force Approve"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Refund Credits Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "refund" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Refund Credits</h2>
                <button onClick={closeActive} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <input type="number" min="1" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Amount (credits)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <input value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Reason (required)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <div className="flex gap-2">
                <button onClick={closeActive} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleRefund} disabled={!refundAmount || !actionReason.trim() || working} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {working ? "Refunding…" : "Refund"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Chat Drawer ── */}
      <AnimatePresence>
        {activeAction?.key === "chat" && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#121212]/60 z-40" onClick={closeActive} />
            <motion.div variants={slideInFromRight} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Chat — Read Only</h2>
                <button onClick={closeActive} className="w-8 h-8 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={15} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] text-center py-8">No messages yet.</p>
                ) : (
                  chatMessages.map((m) => (
                    <div key={m.id} className="bg-[#404040] rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-[#9CA3AF] mb-1">{m.sender_id?.slice(0,8) ?? "system"} · {fmtDateTime(m.created_at)}</p>
                      <p className="text-sm text-[#F9FAFB]">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
