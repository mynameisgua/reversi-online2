// src/realtime.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const envReady = !!(url && key);
export const supabase = envReady ? createClient(url, key) : null;

export function joinRoom(roomId, onEvent, onPresence) {
  if (!envReady) {
    console.warn("[realtime] missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
    return null;
  }

  const channel = supabase.channel(`reversi:${roomId}`, {
    config: {
      broadcast: { self: true },
      // 每個連線一把唯一鑰，presence 會依這把鑰計數
      presence: { key: crypto.randomUUID() },
    },
  });

  // 對手落子 / 同步快照
  channel
    .on("broadcast", { event: "move" }, (payload) =>
      onEvent?.("move", payload.payload)
    )
    .on("broadcast", { event: "sync" }, (payload) =>
      onEvent?.("sync", payload.payload)
    )
    // presence 狀態變化就回報（加入/離開都會觸發）
    .on("presence", { event: "sync" }, () => {
      onPresence?.(channel.presenceState());
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        try {
          // 宣告我已上線
          await channel.track({ t: Date.now() });
        } catch (e) {
          console.error("[realtime] track() failed:", e);
        }
        // 立刻回報一次目前人數（有些情況不會立刻觸發 presence:sync）
        onPresence?.(channel.presenceState());
      }
    });

  return {
    channel,
    sendMove: (data) =>
      channel.send({ type: "broadcast", event: "move", payload: data }),
    sendSync: (data) =>
      channel.send({ type: "broadcast", event: "sync", payload: data }),
    leave: () => channel.unsubscribe(),
  };
}
