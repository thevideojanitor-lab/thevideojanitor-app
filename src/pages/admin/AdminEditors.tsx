import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, MoreHorizontal, Star, X } from "lucide-react"
import { fadeUp, scaleIn, slideInFromRight } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import { useToast } from "@/hooks/use-toast"
import type { EditorPayout } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditorRow {
  user_id: string
  email: string
  display_name: string | null
  rating: number
  completed_count: number
  current_queue_count: number
  max_queue_capacity: number
  specialties: string[]
  is_active: boolean
  unresponsive_count: number
  bio: string | null
}

async function logAction(adminId: string, type: string, targetId: string, notes?: string) {
  await supabase.from("admin_actions").insert({ admin_id: adminId, action_type: type, target_type: "editor", target_id: targetId, notes: notes ?? null })
}

// ── Row menu ──────────────────────────────────────────────────────────────────

function RowMenu({ editor, onAction }: { editor: EditorRow; onAction: (a: string, e: EditorRow) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const actions = [
    { key: "view", label: "View Profile" },
    { key: "edit", label: "Edit Profile" },
    { key: "suspend", label: "Suspend" },
    { key: "remove", label: "Remove from Pool" },
    { key: "payouts", label: "View Payouts" },
    { key: "reset_unresponsive", label: "Reset Unresponsive" },
  ]

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="w-7 h-7 rounded-lg bg-[#2A2A2A] hover:bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors">
        <MoreHorizontal size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 4 }} transition={{ duration: 0.12 }} className="absolute right-0 top-8 w-44 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl z-30 overflow-hidden py-1">
            {actions.map((a) => (
              <button key={a.key} onClick={() => { onAction(a.key, editor); setOpen(false) }} className="w-full text-left px-4 py-2 text-xs text-[#F9FAFB] hover:bg-[#404040] transition-colors">{a.label}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminEditors() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [rows, setRows] = useState<EditorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([{ id: "completed_count", desc: true }])
  const [search, setSearch] = useState("")
  const [activeAction, setActiveAction] = useState<{ key: string; editor: EditorRow } | null>(null)
  const [payouts, setPayouts] = useState<EditorPayout[]>([])

  // Edit fields
  const [editBio, setEditBio] = useState("")
  const [editSpecialties, setEditSpecialties] = useState("")
  const [editCapacity, setEditCapacity] = useState("")
  const [editActive, setEditActive] = useState(true)

  // Reason fields
  const [reason, setReason] = useState("")
  const [working, setWorking] = useState(false)

  useEffect(() => { loadEditors() }, [])

  async function loadEditors() {
    setLoading(true)
    const { data: profiles } = await supabase.from("editor_profiles").select("user_id, display_name, rating, completed_count, current_queue_count, max_queue_capacity, specialties, is_active, unresponsive_count, bio")
    if (!profiles) { setLoading(false); return }
    const ids = (profiles as {user_id: string}[]).map((p) => p.user_id)
    const { data: users } = await supabase.from("users").select("id, email").in("id", ids)
    const emailMap: Record<string, string> = {}
    for (const u of (users ?? []) as {id: string; email: string}[]) emailMap[u.id] = u.email

    setRows((profiles as EditorRow[]).map((p) => ({ ...p, email: emailMap[p.user_id] ?? "" })))
    setLoading(false)
  }

  const filtered = useMemo(() =>
    rows.filter((r) => !search || r.email.toLowerCase().includes(search.toLowerCase()) || (r.display_name ?? "").toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  )

  const columns = useMemo<ColumnDef<EditorRow>[]>(() => [
    { id: "display_name", header: "Name", accessorKey: "display_name", cell: (i) => <span className="text-xs text-[#F9FAFB]">{(i.getValue() as string | null) ?? "—"}</span> },
    { id: "email", header: "Email", accessorKey: "email", cell: (i) => <span className="text-xs text-[#9CA3AF]">{i.getValue() as string}</span> },
    { id: "rating", header: "Rating", accessorKey: "rating", cell: (i) => <span className="text-xs font-bold text-[#FF5F15] flex items-center gap-1"><Star size={10} />{(i.getValue() as number).toFixed(2)}</span> },
    { id: "completed_count", header: "Done", accessorKey: "completed_count", cell: (i) => <span className="text-xs text-[#9CA3AF]">{i.getValue() as number}</span> },
    { id: "current_queue_count", header: "Queue", accessorKey: "current_queue_count", cell: (i) => {
      const r = i.row.original
      return <span className="text-xs text-[#9CA3AF]">{r.current_queue_count}/{r.max_queue_capacity}</span>
    }},
    { id: "is_active", header: "Status", accessorKey: "is_active", cell: (i) => {
      const v = i.getValue() as boolean
      return <span className={`text-xs font-medium ${v ? "text-[#4ade80]" : "text-red-400"}`}>{v ? "Active" : "Inactive"}</span>
    }},
    { id: "unresponsive_count", header: "Strikes", accessorKey: "unresponsive_count", cell: (i) => {
      const v = i.getValue() as number
      return <span className={`text-xs font-semibold ${v >= 2 ? "text-red-400" : v >= 1 ? "text-yellow-400" : "text-[#9CA3AF]"}`}>{v}</span>
    }},
    { id: "actions", header: "", enableSorting: false, cell: (i) => <RowMenu editor={i.row.original} onAction={handleAction} /> },
  ], [])

  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(), initialState: { pagination: { pageSize: 20 } } })

  async function handleAction(key: string, editor: EditorRow) {
    if (key === "payouts") {
      const { data } = await supabase.from("editor_payouts").select("*").eq("editor_id", editor.user_id).order("created_at", { ascending: false }).limit(20)
      setPayouts((data as EditorPayout[]) ?? [])
    }
    setActiveAction({ key, editor })
    setEditBio(editor.bio ?? "")
    setEditSpecialties(editor.specialties.join(", "))
    setEditCapacity(String(editor.max_queue_capacity))
    setEditActive(editor.is_active)
    setReason("")
  }

  async function handleEdit() {
    if (!user || !activeAction) return
    setWorking(true)
    await supabase.from("editor_profiles").update({
      bio: editBio,
      specialties: editSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
      max_queue_capacity: parseInt(editCapacity) || 5,
      is_active: editActive,
    }).eq("user_id", activeAction.editor.user_id)
    await logAction(user.id, "edit_editor", activeAction.editor.user_id, "Profile updated by admin")
    setWorking(false)
    setActiveAction(null)
    loadEditors()
  }

  async function handleSuspend() {
    if (!user || !activeAction || !reason.trim()) return
    setWorking(true)
    await supabase.from("editor_profiles").update({ is_active: false }).eq("user_id", activeAction.editor.user_id)
    await logAction(user.id, "suspend_editor", activeAction.editor.user_id, reason)
    toast({ title: "Editor suspended" })
    setWorking(false)
    setActiveAction(null)
    loadEditors()
  }

  async function handleRemove() {
    if (!user || !activeAction || !reason.trim()) return
    setWorking(true)
    await supabase.from("editor_profiles").update({ is_active: false, unresponsive_count: 99 }).eq("user_id", activeAction.editor.user_id)
    await logAction(user.id, "remove_editor", activeAction.editor.user_id, reason)
    toast({ title: "Editor removed from pool" })
    setWorking(false)
    setActiveAction(null)
    loadEditors()
  }

  async function handleResetStrikes() {
    if (!user || !activeAction || !reason.trim()) return
    setWorking(true)
    await supabase.from("editor_profiles").update({ unresponsive_count: 0, is_active: true }).eq("user_id", activeAction.editor.user_id)
    await logAction(user.id, "reset_unresponsive", activeAction.editor.user_id, reason)
    toast({ title: "Unresponsive count reset" })
    setWorking(false)
    setActiveAction(null)
    loadEditors()
  }

  const close = () => setActiveAction(null)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#F9FAFB]">Editors</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{filtered.length} total</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none w-52" />
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

      {/* ── View Profile Drawer ── */}
      <AnimatePresence>
        {activeAction?.key === "view" && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#121212]/60 z-40" onClick={close} />
            <motion.div variants={slideInFromRight} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">{activeAction.editor.display_name ?? activeAction.editor.email}</h2>
                <button onClick={close} className="w-8 h-8 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={15} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["Rating", activeAction.editor.rating.toFixed(2)],
                    ["Completed", String(activeAction.editor.completed_count)],
                    ["Queue", `${activeAction.editor.current_queue_count}/${activeAction.editor.max_queue_capacity}`],
                    ["Strikes", String(activeAction.editor.unresponsive_count)],
                    ["Active", activeAction.editor.is_active ? "Yes" : "No"],
                    ["Specialties", activeAction.editor.specialties.join(", ") || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-[#404040] rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-1">{k}</p>
                      <p className="text-[#F9FAFB] font-medium break-words">{v}</p>
                    </div>
                  ))}
                </div>
                {activeAction.editor.bio && (
                  <div className="bg-[#404040] rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-2">Bio</p>
                    <p className="text-xs text-[#F9FAFB] leading-relaxed">{activeAction.editor.bio}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Edit Profile Modal ── */}
      <AnimatePresence>
        {activeAction?.key === "edit" && (
          <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
            <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Edit Profile</h2>
                <button onClick={close} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
              </div>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Bio…" rows={3} className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none resize-none" />
              <input value={editSpecialties} onChange={(e) => setEditSpecialties(e.target.value)} placeholder="Specialties (comma separated)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <input type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} placeholder="Max queue capacity…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
              <label className="flex items-center gap-2 text-sm text-[#F9FAFB] cursor-pointer">
                <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="accent-[#FF5F15]" />
                Active in pool
              </label>
              <div className="flex gap-2 pt-1">
                <button onClick={close} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleEdit} disabled={working} className="flex-1 bg-[#FF5F15] text-[#121212] font-semibold text-sm rounded-lg py-2.5 hover:bg-[#E54E08] disabled:opacity-40 transition-colors">
                  {working ? "Saving…" : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Suspend / Remove / Reset — shared reason modal ── */}
      {["suspend","remove","reset_unresponsive"].map((actionKey) => (
        <AnimatePresence key={actionKey}>
          {activeAction?.key === actionKey && (
            <div className="fixed inset-0 bg-[#121212]/70 flex items-center justify-center z-50 p-4">
              <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="hidden" className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">
                    {actionKey === "suspend" ? "Suspend Editor" : actionKey === "remove" ? "Remove from Pool" : "Reset Unresponsive Count"}
                  </h2>
                  <button onClick={close} className="w-7 h-7 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={14} /></button>
                </div>
                {(actionKey === "suspend" || actionKey === "remove") && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    {actionKey === "remove" ? "Editor will be permanently removed from the matching pool." : "Editor will be set inactive temporarily."}
                  </p>
                )}
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)…" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] outline-none" />
                <div className="flex gap-2">
                  <button onClick={close} className="flex-1 border border-[#404040] text-[#9CA3AF] text-sm rounded-lg py-2.5 hover:text-[#F9FAFB] transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={actionKey === "suspend" ? handleSuspend : actionKey === "remove" ? handleRemove : handleResetStrikes}
                    disabled={!reason.trim() || working}
                    className={`flex-1 font-semibold text-sm rounded-lg py-2.5 disabled:opacity-40 transition-colors ${actionKey === "reset_unresponsive" ? "bg-[#FF5F15] text-[#121212] hover:bg-[#E54E08]" : "bg-red-500 text-[#F9FAFB] hover:bg-red-600"}`}
                  >
                    {working ? "Working…" : actionKey === "suspend" ? "Suspend" : actionKey === "remove" ? "Remove" : "Reset"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      ))}

      {/* ── Payouts Drawer ── */}
      <AnimatePresence>
        {activeAction?.key === "payouts" && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#121212]/60 z-40" onClick={close} />
            <motion.div variants={slideInFromRight} initial="hidden" animate="visible" exit="exit" className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#1A1A1A] border-l border-[#2A2A2A] z-50 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A]">
                <h2 className="font-heading text-base font-semibold text-[#F9FAFB]">Payout History</h2>
                <button onClick={close} className="w-8 h-8 rounded-lg bg-[#404040] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB]"><X size={15} /></button>
              </div>
              <div className="divide-y divide-[#2A2A2A]">
                {payouts.length === 0 ? (
                  <p className="text-xs text-[#9CA3AF] text-center py-8">No payouts yet.</p>
                ) : (
                  payouts.map((p) => (
                    <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#FF5F15]">
                          {p.currency === "INR" ? `₹${(p.amount / 100).toLocaleString("en-IN")}` : `$${(p.amount / 100).toLocaleString("en-US")}`}
                        </p>
                        <p className="text-[10px] text-[#9CA3AF]">{p.payout_method ?? "—"} · {new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.status === "paid" ? "text-[#4ade80] bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]" : p.status === "failed" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-[#9CA3AF] bg-[#404040]/50 border-[#2A2A2A]"}`}>
                        {p.status}
                      </span>
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
