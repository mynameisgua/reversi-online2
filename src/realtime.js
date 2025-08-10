// src/realtime.js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const envReady = !!(url && key);
export const supabase = envReady ? createClient(url, key) : null;

export function joinRoom(roomId, onEvent, onPresence) {
  if (!envReady) return null;
  const channel = supabase.channel(`reversi:${roomId}`, {
    config: { broadcast: { self: true }, presence: { key: crypto.randomUUID() } },
  });

  channel
    .on("broadcast", { event: "move" }, (payload) => onEvent?.("move", payload.payload))
    .on("broadcast", { event: "sync" }, (payload) => onEvent?.("sync", payload.payload))
    .on("presence", { event: "sync" }, () => onPresence?.(channel.presenceState()))
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") await channel.track({ t: Date.now() });
    });

  return {
    channel,
    sendMove: (data) => channel.send({ type: "broadcast", event: "move", payload: data }),
    sendSync: (data) => channel.send({ type: "broadcast", event: "sync", payload: data }),
    leave: () => channel.unsubscribe(),
  };
}
