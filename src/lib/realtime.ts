import { supabase } from "./supabase"
import { useRequestsStore } from "@/stores/requestsStore"
import { useCreditsStore } from "@/stores/creditsStore"
import { useEditorStore } from "@/stores/editorStore"

let activeChannels: ReturnType<typeof supabase.channel>[] = []

export function teardownRealtime() {
  activeChannels.forEach((ch) => supabase.removeChannel(ch))
  activeChannels = []
}

export function initialiseRealtime(userId: string) {
  teardownRealtime()

  // Client request updates → refresh requests + credits
  const clientRequests = supabase
    .channel("client-requests")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "requests", filter: `client_id=eq.${userId}` },
      () => {
        useRequestsStore.getState().refresh(userId)
        useCreditsStore.getState().refresh(userId)
      }
    )
    .subscribe()
  activeChannels.push(clientRequests)

  // Editor queue updates → refresh editor store
  const editorQueue = supabase
    .channel("editor-queue")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "requests", filter: `editor_id=eq.${userId}` },
      () => {
        useEditorStore.getState().refresh(userId)
      }
    )
    .subscribe()
  activeChannels.push(editorQueue)
}
