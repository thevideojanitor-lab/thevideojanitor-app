import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"
import type { Message } from "@/lib/supabase"

interface Props {
  requestId: string
  onUnreadChange?: (count: number) => void
}

export default function Chat({ requestId, onUnreadChange }: Props) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const unreadRef = useRef(0)

  useEffect(() => {
    loadMessages()
    const ch = supabase
      .channel(`chat-${requestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `request_id=eq.${requestId}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => [...prev, msg])
          if (msg.sender_id !== user?.id) {
            unreadRef.current += 1
            onUnreadChange?.(unreadRef.current)
          }
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [requestId])

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    setMessages((data as Message[]) ?? [])
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" as ScrollBehavior }), 50)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user?.id || sending) return
    setSending(true)
    const body = text.trim()
    setText("")
    await supabase.from("messages").insert({ request_id: requestId, sender_id: user.id, body })
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                <div className="h-9 w-48 bg-[#2A2A2A] rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] text-center py-8">
            No messages yet — start the conversation.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? "bg-[#FF5F15] text-[#121212] rounded-br-sm"
                        : "bg-[#2A2A2A] text-[#F9FAFB] rounded-bl-sm"
                    }`}
                  >
                    <p>{msg.body}</p>
                    <p className={`text-[10px] mt-1 ${isOwn ? "text-[#121212]/60" : "text-[#9CA3AF]"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 px-4 pb-4 pt-2 border-t border-[#2A2A2A]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#FF5F15] focus:ring-1 focus:ring-[#FF5F15]/30 outline-none transition-colors"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!text.trim() || sending}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#FF5F15] text-[#121212] hover:bg-[#E54E08] disabled:opacity-40 transition-colors shrink-0"
        >
          <Send size={15} />
        </motion.button>
      </form>
    </div>
  )
}
