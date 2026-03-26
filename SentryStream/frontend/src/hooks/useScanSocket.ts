/**
 * useScanSocket — React hook that manages the WebSocket connection
 * and streams real-time scan events into component state.
 *
 * Usage:
 *   const { events, isConnected, clearEvents } = useScanSocket();
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScanEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws/scans";
const RECONNECT_DELAY_MS = 3000;
const MAX_EVENTS = 100; // Cap in-memory history

export function useScanSocket() {
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) return;
      setIsConnected(true);
      console.info("[useScanSocket] Connected");
    };

    ws.onmessage = (msg) => {
      if (!isMounted.current) return;
      try {
        const event: ScanEvent = JSON.parse(msg.data);
        setEvents((prev) => {
          const next = [event, ...prev];
          return next.slice(0, MAX_EVENTS); // Keep most recent N events
        });
      } catch {
        console.warn("[useScanSocket] Malformed message:", msg.data);
      }
    };

    ws.onclose = () => {
      if (!isMounted.current) return;
      setIsConnected(false);
      console.info(`[useScanSocket] Disconnected. Reconnecting in ${RECONNECT_DELAY_MS}ms…`);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = (err) => {
      console.error("[useScanSocket] Error:", err);
      ws.close(); // triggers onclose → reconnect
    };
  }, []);

  useEffect(() => {
    isMounted.current = true;
    connect();
    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, isConnected, clearEvents };
}
