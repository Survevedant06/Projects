"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { key: "dashboard", href: "/", icon: "◈", label: "Dashboard" },
  { key: "targets", href: "/targets", icon: "⊕", label: "Targets" },
  { key: "history", href: "/history", icon: "↺", label: "History" },
  { key: "alerts", href: "/alerts", icon: "◉", label: "Alerts" },
  { key: "settings", href: "/settings", icon: "⚙", label: "Settings" },
];

const pageTitles: Record<string, { title: string; accent: string }> = {
  "/": { title: "Threat", accent: "Command" },
  "/targets": { title: "Target", accent: "Management" },
  "/history": { title: "Scan", accent: "History" },
  "/alerts": { title: "Security", accent: "Alerts" },
  "/settings": { title: "System", accent: "Settings" },
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const activeKey =
    navItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )?.key ?? "dashboard";

  const pageTitle = pageTitles[pathname] ?? pageTitles["/"];

  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ position: "relative", zIndex: 1 }}>
      {/* ═══ SIDEBAR ═══ */}
      <aside
        style={{
          width: sidebarCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          transition: "width var(--transition-slow)",
          background: "rgba(7, 10, 20, 0.85)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: sidebarCollapsed ? "24px 16px 20px" : "24px 20px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
            minHeight: 72,
          }}
        >
          <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.3" />
              <circle cx="16" cy="16" r="9" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.2" />
              <circle cx="16" cy="16" r="4" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.15" />
              <circle cx="16" cy="16" r="2" fill="var(--accent)" fillOpacity="0.8" />
              <line
                x1="16" y1="16" x2="16" y2="2"
                stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"
                style={{ transformOrigin: "16px 16px", animation: "radar-sweep 4s linear infinite" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: -2, borderRadius: "50%", background: "rgba(108,140,255,0.08)", filter: "blur(8px)" }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ animation: "fade-in 0.3s ease" }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
                SentryStream
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", marginTop: 2 }}>
                SECURITY OPS CENTER
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? "var(--accent-bright)" : "var(--text-muted)",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  border: isActive ? "1px solid rgba(108,140,255,0.15)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {isActive && (
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "0 4px 4px 0", background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)" }} />
                )}
                <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarCollapsed ? "center" : "flex-start",
              gap: 10,
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              background: "transparent",
              border: "1px solid var(--border)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              marginBottom: 12,
            }}
          >
            <span style={{ transform: sidebarCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform var(--transition-base)", display: "inline-block" }}>»</span>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>

          {!sidebarCollapsed && (
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", lineHeight: 1.8 }}>
              <div>v2.0.0 · FastAPI + Next.js</div>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {/* HEADER */}
        <header
          className="glass-strong"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
              {pageTitle.title}{" "}
              <span style={{ background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {pageTitle.accent}
              </span>
            </h1>
            <div style={{ height: 20, width: 1, background: "var(--border-bright)" }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              {currentTime}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
