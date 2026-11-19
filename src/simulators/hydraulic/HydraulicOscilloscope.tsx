import { Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface OscilloscopeSample {
  t: number; // timestamp in seconds
  p1: number;
  p2: number;
  p3: number;
  vel: number;
}

interface HydraulicOscilloscopeProps {
  samples: OscilloscopeSample[];
  nowSec: number;
  reliefCrackBar: number;
  accumulatorEnabled: boolean;
}

const WINDOW_SEC = 15;
const MAX_BAR = 240;
const VEL_LIMIT = 150;

export function HydraulicOscilloscope({
  samples,
  nowSec,
  reliefCrackBar,
  accumulatorEnabled,
}: HydraulicOscilloscopeProps) {
  const { pick } = useLanguage();

  const bg = 'var(--md-surface-container-lowest)';
  const gridColor = 'var(--md-outline-variant)';
  const textMuted = 'var(--md-on-surface-variant)';

  const W = 680;
  const H = 190;
  const padL = 42;
  const padR = 46;
  const padT = 14;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const tStart = nowSec - WINDOW_SEC;

  const xForTime = (t: number) =>
    padL + Math.max(0, Math.min(1, (t - tStart) / WINDOW_SEC)) * plotW;

  const yForBar = (bar: number) =>
    padT + plotH - (Math.max(0, Math.min(MAX_BAR, bar)) / MAX_BAR) * plotH;

  const yForVel = (vel: number) => {
    const clamped = Math.max(-VEL_LIMIT, Math.min(VEL_LIMIT, vel));
    const norm = (clamped + VEL_LIMIT) / (2 * VEL_LIMIT);
    return padT + plotH - norm * plotH;
  };

  const buildPath = (accessor: (s: OscilloscopeSample) => number, yFn: (v: number) => number) => {
    if (samples.length === 0) return '';
    return samples
      .map((s, idx) => {
        const x = xForTime(s.t).toFixed(1);
        const y = yFn(accessor(s)).toFixed(1);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const p1Path = buildPath((s) => s.p1, yForBar);
  const p2Path = buildPath((s) => s.p2, yForBar);
  const p3Path = buildPath((s) => s.p3, yForBar);
  const velPath = buildPath((s) => s.vel, yForVel);

  const latest = samples[samples.length - 1];
  const reliefY = yForBar(reliefCrackBar);
  const velZeroY = yForVel(0);

  return (
    <div className="glass-panel overflow-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--md-primary)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            {pick(
              'Pressure & Velocity Oscilloscope (15s Strip Chart)',
              'Osiloskop Tekanan & Kecepatan (Grafik 15 dtk)',
              '圧力＆速度オシロスコープ（15秒チャート）',
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          {accumulatorEnabled && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {pick(
                'N₂ Accumulator Damping ON',
                'Peredam Akumulator N₂ AKTIF',
                'N₂ アキュムレータ減衰 ON',
              )}
            </span>
          )}
          <span className="flex items-center gap-1 text-[var(--md-on-surface-variant)]">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            P1: <strong className="font-mono text-[var(--md-on-surface)]">{latest ? latest.p1.toFixed(0) : '0'}</strong> bar
          </span>
          <span className="flex items-center gap-1 text-[var(--md-on-surface-variant)]">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            P2: <strong className="font-mono text-[var(--md-on-surface)]">{latest ? latest.p2.toFixed(0) : '0'}</strong> bar
          </span>
          <span className="flex items-center gap-1 text-[var(--md-on-surface-variant)]">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            P3: <strong className="font-mono text-[var(--md-on-surface)]">{latest ? latest.p3.toFixed(0) : '0'}</strong> bar
          </span>
          <span className="flex items-center gap-1 text-[var(--md-on-surface-variant)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            v: <strong className="font-mono text-[var(--md-on-surface)]">{latest ? latest.vel.toFixed(0) : '0'}</strong> mm/s
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" style={{ background: bg }}>
        {/* Horizontal pressure gridlines */}
        {[0, 60, 120, 180, 240].map((bar) => {
          const y = yForBar(bar);
          return (
            <g key={bar}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke={gridColor}
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={textMuted}
              >
                {bar}
              </text>
            </g>
          );
        })}

        {/* Vertical time gridlines (-15s to 0s) */}
        {[0, 3, 6, 9, 12, 15].map((sec) => {
          const x = padL + (sec / WINDOW_SEC) * plotW;
          return (
            <g key={sec}>
              <line
                x1={x}
                y1={padT}
                x2={x}
                y2={padT + plotH}
                stroke={gridColor}
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <text
                x={x}
                y={H - 7}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={textMuted}
              >
                {sec === 15 ? 'Now' : `-${15 - sec}s`}
              </text>
            </g>
          );
        })}

        {/* Right axis velocity labels */}
        {[-150, 0, 150].map((v) => (
          <text
            key={v}
            x={W - padR + 6}
            y={yForVel(v) + 3}
            textAnchor="start"
            fontSize="9"
            fontWeight="600"
            fontFamily="var(--font-mono)"
            fill="#10b981"
          >
            {v > 0 ? `+${v}` : v}
          </text>
        ))}

        {/* Velocity 0 mm/s centerline */}
        <line
          x1={padL}
          y1={velZeroY}
          x2={W - padR}
          y2={velZeroY}
          stroke="#10b981"
          strokeOpacity="0.25"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Relief cracking pressure reference line */}
        <line
          x1={padL}
          y1={reliefY}
          x2={W - padR}
          y2={reliefY}
          stroke="#ef4444"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeDasharray="5 4"
        />
        <text
          x={padL + 4}
          y={reliefY - 3}
          fontSize="8.5"
          fontWeight="700"
          fill="#ef4444"
        >
          Relief {reliefCrackBar} bar
        </text>

        {/* Waveforms */}
        {velPath && (
          <path
            d={velPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />
        )}
        {p3Path && (
          <path d={p3Path} fill="none" stroke="#0ea5e9" strokeWidth="2" />
        )}
        {p2Path && (
          <path d={p2Path} fill="none" stroke="#ef4444" strokeWidth="2" />
        )}
        {p1Path && (
          <path d={p1Path} fill="none" stroke="#f59e0b" strokeWidth="2.2" />
        )}
      </svg>
    </div>
  );
}
