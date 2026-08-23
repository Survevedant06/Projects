"use client";

interface TrustScoreRingProps {
  score: number;
  size?: number;
}

export default function TrustScoreRing({ score, size = 52 }: TrustScoreRingProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = "var(--pass)";
  let glow = "var(--pass-glow)";
  if (score < 50) { color = "var(--fail)"; glow = "var(--fail-glow)"; }
  else if (score < 75) { color = "var(--warn)"; glow = "var(--warn-glow)"; }

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 4px ${glow})` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>
        {score}
      </div>
    </div>
  );
}
