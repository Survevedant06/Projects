import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlugDensity(density: string): { label: string; color: string; level: number } {
  switch (density) {
    case 'AT_EVERY_SEAT':
      return { label: 'At Every Seat', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', level: 4 };
    case 'PLENTIFUL':
      return { label: 'Plentiful Outlets', color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800', level: 3 };
    case 'MODERATE':
      return { label: 'Moderate Outlets', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', level: 2 };
    case 'SCARCE':
      return { label: 'Scarce Outlets', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800', level: 1 };
    default:
      return { label: 'No Outlets', color: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800', level: 0 };
  }
}

export function formatNoiseLevel(noise: string): { label: string; color: string; icon: string } {
  switch (noise) {
    case 'SILENT':
      return { label: 'Library Silent', color: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800', icon: 'VolumeX' };
    case 'QUIET':
      return { label: 'Quiet & Focused', color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800', icon: 'Volume1' };
    case 'MODERATE':
      return { label: 'Moderate Hum', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', icon: 'Volume2' };
    case 'LIVELY':
      return { label: 'Lively Ambient', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800', icon: 'Volume2' };
    default:
      return { label: 'Bustling / Noisy', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800', icon: 'Volume2' };
  }
}

export function formatWifiSpeed(speed: number): { label: string; color: string; tier: string } {
  if (speed >= 150) {
    return { label: `${speed} Mbps`, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800', tier: 'Ultra Fast' };
  }
  if (speed >= 75) {
    return { label: `${speed} Mbps`, color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800', tier: 'Fast' };
  }
  if (speed >= 30) {
    return { label: `${speed} Mbps`, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800', tier: 'Decent' };
  }
  if (speed > 0) {
    return { label: `${speed} Mbps`, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800', tier: 'Basic' };
  }
  return { label: 'No Speed Test', color: 'text-stone-500 bg-stone-100 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700', tier: 'Unknown' };
}

export function formatSeatingComfort(comfort: string): string {
  switch (comfort) {
    case 'ERGONOMIC':
      return 'Ergonomic Chairs & Desks';
    case 'COZY_COUCHES':
      return 'Couches & Armchairs';
    case 'MIXED':
      return 'Mixed Seating (Benches + Chairs)';
    default:
      return 'Standard Cafe Seating';
  }
}

export function formatLighting(lighting: string): string {
  switch (lighting) {
    case 'NATURAL_LIGHT':
      return 'Floor-to-Ceiling Natural Light';
    case 'BRIGHT':
      return 'Bright Studio Lighting';
    case 'DIM_COZY':
      return 'Warm & Dim Ambient Lighting';
    default:
      return 'Balanced Lighting';
  }
}

export function formatPrice(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(4, level)));
}
