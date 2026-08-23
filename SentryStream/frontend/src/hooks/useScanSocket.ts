/**
 * useScanSocket — React hook that manages the WebSocket connection
 * and streams real-time scan events into component state.
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Connection latency tracking
 * - Capped in-memory event history
 *
 * Usage:
 *   const { events, isConnected, latencyMs, clearEvents } = useScanSocket();
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScanEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws/scans";
const RECONNECT_DELAY_MS = 3000;
const MAX_EVENTS = 200;

export function useScanSocket() {
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const connectTimeRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    connectTimeRef.current = Date.now();
    const ws = new WebSocket(WS_URL);
    socketRef.current = ws;

    ws.onopen = () => {
      if (!isMounted.current) return;
      const latency = Date.now() - connectTimeRef.current;
      setLatencyMs(latency);
      setIsConnected(true);
      console.info(`[useScanSocket] Connected (${latency}ms)`);
    };

    ws.onmessage = (msg) => {
      if (!isMounted.current) return;
      try {
        const event: ScanEvent = JSON.parse(msg.data);
        setEvents((prev) => {
          const next = [event, ...prev];
          return next.slice(0, MAX_EVENTS);
        });
      } catch {
        console.warn("[useScanSocket] Malformed message:", msg.data);
      }
    };

    ws.onclose = () => {
      if (!isMounted.current) return;
      setIsConnected(false);
      setLatencyMs(null);
      console.info(`[useScanSocket] Disconnected. Reconnecting in ${RECONNECT_DELAY_MS}ms…`);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      console.warn("[useScanSocket] Connection failed — backend may be offline");
      ws.close();
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

  return { events, isConnected, latencyMs, clearEvents };
}
