import {
  Activity,
  Cog,
  Cpu,
  Crosshair,
  Disc,
  Droplets,
  Gauge,
  Layers,
  Ruler,
  Triangle,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { SimulatorAccentColor } from '../types/simulator';

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Cog,
  Cpu,
  Crosshair,
  Disc,
  Droplets,
  Gauge,
  Layers,
  Ruler,
  Triangle,
  Wind,
  Wrench,
};

export function getSimulatorIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Cog;
}

export interface AccentTheme {
  badge: string;
  text: string;
  border: string;
  bgSoft: string;
  tabActive: string;
  glow: string;
}

const ACCENT_THEMES: Record<SimulatorAccentColor, AccentTheme> = {
  sky: {
    badge:
      'bg-[#E6EDF8] text-[#001F6B] border-[#001F6B]/20 dark:bg-[#001F6B]/25 dark:text-[#60A5FA] dark:border-[#3B82F6]/30',
    text: 'text-[#001F6B] dark:text-[#60A5FA]',
    border:
      'border-slate-200 hover:border-[#002D9C]/50 dark:border-slate-800 dark:hover:border-[#3B82F6]/60',
    bgSoft: 'bg-[#E6EDF8] dark:bg-[#001F6B]/25',
    tabActive:
      'bg-[#001F6B] text-white font-semibold shadow-sm shadow-[#001F6B]/25 dark:bg-[#002D9C] dark:text-white dark:shadow-[#002D9C]/30',
    glow: 'from-[#001F6B]/10 via-[#002D9C]/5 to-transparent dark:from-[#3B82F6]/20 dark:via-[#3B82F6]/5',
  },
  emerald: {
    badge:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border:
      'border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-400/60',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-500/10',
    tabActive:
      'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20 dark:bg-emerald-500 dark:text-slate-950 dark:shadow-emerald-500/30',
    glow: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/5',
  },
  amber: {
    badge:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    border:
      'border-slate-200 hover:border-amber-300 dark:border-slate-800 dark:hover:border-amber-400/60',
    bgSoft: 'bg-amber-50 dark:bg-amber-500/10',
    tabActive:
      'bg-amber-500 text-white font-semibold shadow-sm shadow-amber-500/20 dark:text-slate-950 dark:shadow-amber-500/30',
    glow: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-amber-500/5',
  },
  violet: {
    badge:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
    text: 'text-violet-600 dark:text-violet-400',
    border:
      'border-slate-200 hover:border-violet-300 dark:border-slate-800 dark:hover:border-violet-400/60',
    bgSoft: 'bg-violet-50 dark:bg-violet-500/10',
    tabActive:
      'bg-violet-600 text-white font-semibold shadow-sm shadow-violet-600/20 dark:bg-violet-500 dark:text-slate-950 dark:shadow-violet-500/30',
    glow: 'from-violet-500/10 via-violet-500/5 to-transparent dark:from-violet-500/20 dark:via-violet-500/5',
  },
  rose: {
    badge:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    text: 'text-rose-600 dark:text-rose-400',
    border:
      'border-slate-200 hover:border-rose-300 dark:border-slate-800 dark:hover:border-rose-400/60',
    bgSoft: 'bg-rose-50 dark:bg-rose-500/10',
    tabActive:
      'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-600/20 dark:bg-rose-500 dark:text-slate-950 dark:shadow-rose-500/30',
    glow: 'from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-500/20 dark:via-rose-500/5',
  },
  cyan: {
    badge:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border:
      'border-slate-200 hover:border-cyan-300 dark:border-slate-800 dark:hover:border-cyan-400/60',
    bgSoft: 'bg-cyan-50 dark:bg-cyan-500/10',
    tabActive:
      'bg-cyan-600 text-white font-semibold shadow-sm shadow-cyan-600/20 dark:bg-cyan-500 dark:text-slate-950 dark:shadow-cyan-500/30',
    glow: 'from-cyan-500/10 via-cyan-500/5 to-transparent dark:from-cyan-500/20 dark:via-cyan-500/5',
  },
  orange: {
    badge:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400',
    border:
      'border-slate-200 hover:border-orange-300 dark:border-slate-800 dark:hover:border-orange-400/60',
    bgSoft: 'bg-orange-50 dark:bg-orange-500/10',
    tabActive:
      'bg-orange-600 text-white font-semibold shadow-sm shadow-orange-600/20 dark:bg-orange-500 dark:text-slate-950 dark:shadow-orange-500/30',
    glow: 'from-orange-500/10 via-orange-500/5 to-transparent dark:from-orange-500/20 dark:via-orange-500/5',
  },
};

export function getAccentTheme(color: SimulatorAccentColor): AccentTheme {
  return ACCENT_THEMES[color] ?? ACCENT_THEMES.sky;
}
