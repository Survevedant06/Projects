"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws/scans";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [discordUrl, setDiscordUrl] = useState("");
  const [slackUrl, setSlackUrl] = useState("");

  function saveWebhooks() {
    // In a production app, this would save to the backend
    addToast("Webhook settings saved (demo only)", "success");
  }

  const sections: { title: string; icon: string; content: React.ReactNode }[] = [
    {
      title: "Connection",
      icon: "◎",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SettingRow label="API Base URL" value={API_URL} />
          <SettingRow label="WebSocket URL" value={WS_URL} />
          <SettingRow label="Protocol" value="HTTP + WS (Upgrade)" />
        </div>
      ),
    },
    {
      title: "Threat Intelligence APIs",
      icon: "⊕",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SettingRow label="VirusTotal" value={process.env.NEXT_PUBLIC_VT_KEY ? "●●●●●●●● (configured)" : "Not configured"} status={!!process.env.NEXT_PUBLIC_VT_KEY} />
          <SettingRow label="Google Safe Browsing" value={process.env.NEXT_PUBLIC_GSB_KEY ? "●●●●●●●● (configured)" : "Not configured"} status={!!process.env.NEXT_PUBLIC_GSB_KEY} />
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", padding: "8px 0" }}>
            Set VIRUSTOTAL_API_KEY and GOOGLE_SAFE_BROWSING_API_KEY in your .env file
          </div>
        </div>
      ),
    },
    {
      title: "Webhook Notifications",
      icon: "◉",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Discord Webhook URL</label>
            <input value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Slack Webhook URL</label>
            <input value={slackUrl} onChange={(e) => setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." style={{ width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)", outline: "none" }} />
          </div>
          <button onClick={saveWebhooks} style={{ alignSelf: "flex-start", background: "var(--accent)", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity var(--transition-fast)" }}>
            Save Webhook Settings
          </button>
        </div>
      ),
    },
    {
      title: "Scanner Modules",
      icon: "⚙",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["SSL/TLS Certificate Checker", "Security Headers Analyzer", "Port Scanner", "Heuristic Domain Analysis", "Threat Intelligence Aggregation", "Deep Scan Module", "Risk Scoring Engine"].map((m) => (
            <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{m}</span>
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--pass)", background: "var(--pass-dim)", padding: "2px 8px", borderRadius: "var(--radius-full)" }}>ACTIVE</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "About",
      icon: "ℹ",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SettingRow label="Application" value="SentryStream v2.0.0" />
          <SettingRow label="Backend" value="FastAPI + Uvicorn" />
          <SettingRow label="Frontend" value="Next.js 16 + React 19" />
          <SettingRow label="Database" value="SQLite (SQLModel ORM)" />
          <SettingRow label="Real-time" value="WebSocket (native)" />
          <SettingRow label="Alerting" value="Discord + Slack Webhooks" />
        </div>
      ),
    },
  ];

  return (
    <>
      {sections.map((section, i) => (
        <div key={section.title} className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", animation: `slide-up 0.4s ease ${i * 60}ms both` }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--accent)", fontSize: 14 }}>{section.icon}</span>
            <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>{section.title}</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>{section.content}</div>
        </div>
      ))}
    </>
  );
}

function SettingRow({ label, value, status }: { label: string; value: string; status?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: status === false ? "var(--warn)" : "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}
