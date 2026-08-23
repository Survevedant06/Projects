"use client";

import { useState, useEffect } from "react";

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  color: "accent" | "pass" | "warn" | "fail";
  icon: string;
  delay?: number;
}

const colorVars: Record<string, { text: string; glow: string; bg: string; border: string }> = {
  accent: { text: "var(--accent)", glow: "var(--shadow-glow-accent)", bg: "var(--accent-dim)", border: "rgba(108,140,255,0.25)" },
  pass: { text: "var(--pass)", glow: "var(--shadow-glow-pass)", bg: "var(--pass-dim)", border: "rgba(0,229,160,0.25)" },
  warn: { text: "var(--warn)", glow: "var(--shadow-glow-warn)", bg: "var(--warn-dim)", border: "rgba(255,178,36,0.25)" },
  fail: { text: "var(--fail)", glow: "var(--shadow-glow-fail)", bg: "var(--fail-dim)", border: "rgba(255,69,115,0.25)" },
};

export default function StatCard({ label, value, sub, color, icon, delay = 0 }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplayValue(0); return; }
    const duration = 800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const c = colorVars[color] || colorVars.accent;

  return (
    <div
      className="glass hover-lift"
      style={{
        borderRadius: "var(--radius-lg)",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        animation: `slide-up 0.5s ease ${delay * 100}ms both`,
        cursor: "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.glow; e.currentTarget.style.borderColor = c.border; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: c.text, boxShadow: `0 0 12px ${c.border}` }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</div>
        <div style={{ fontSize: 16, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", background: c.bg, color: c.text }}>{icon}</div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: c.text, fontFamily: "var(--font-display)" }}>{displayValue}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{sub}</div>
    </div>
  );
}
