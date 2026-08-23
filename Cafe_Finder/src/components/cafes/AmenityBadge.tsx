import React from 'react';
import { Wifi, Zap, Volume2, Volume1, VolumeX, Sun, Armchair, Phone, Dog, Wind, Coffee } from 'lucide-react';
import { formatPlugDensity, formatNoiseLevel, formatWifiSpeed } from '@/lib/utils';

export function WifiBadge({ speed, reliability }: { speed: number; reliability?: string }) {
  const { label, tier } = formatWifiSpeed(speed);

  const color =
    speed >= 150
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : speed >= 75
      ? 'bg-green-500/15 text-green-400 border-green-500/30'
      : speed >= 30
      ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30'
      : speed > 0
      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
      : 'bg-[#243247] text-[#6B6B6B] border-[#3A3A3A]';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${color}`}>
      <Wifi className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}

export function PlugBadge({ density }: { density: string }) {
  const { label } = formatPlugDensity(density);
  const colors: Record<string, string> = {
    AT_EVERY_SEAT: 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30',
    PLENTIFUL: 'bg-[#0EA5E9]/10 text-[#0284C7] border-[#0EA5E9]/20',
    MODERATE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    SCARCE: 'bg-red-500/10 text-red-400 border-red-500/20',
    NONE: 'bg-[#243247] text-[#6B6B6B] border-[#3A3A3A]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${colors[density] || colors.NONE}`}>
      <Zap className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}

export function NoiseBadge({ noise }: { noise: string }) {
  const { label } = formatNoiseLevel(noise);
  const Icon = noise === 'SILENT' ? VolumeX : noise === 'QUIET' ? Volume1 : Volume2;
  const colors: Record<string, string> = {
    SILENT: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    QUIET: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    MODERATE: 'bg-[#0EA5E9]/10 text-[#0284C7] border-[#0EA5E9]/20',
    LIVELY: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    NOISY: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${colors[noise] || colors.MODERATE}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}

export function AmenityPill({
  icon: Icon,
  label,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
        highlight
          ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border-[#0EA5E9]/25'
          : 'bg-[#1E293B] text-[#A0A0A0] border-[#243247]'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-[#0EA5E9]' : 'text-[#6B6B6B]'}`} />
      <span>{label}</span>
    </span>
  );
}
