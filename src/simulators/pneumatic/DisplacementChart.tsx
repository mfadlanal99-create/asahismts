import { Activity, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface DisplacementSample {
  t: number;
  strokePct: number;
}

interface DisplacementChartProps {
  samples: DisplacementSample[];
  cycleRateCpm: number;
  flowDirectionLabel: string;
  flowDirectionTone: 'cyan' | 'amber' | 'rose' | 'slate';
  onClear: () => void;
}

export function DisplacementChart({
  samples,
  cycleRateCpm,
  flowDirectionLabel,
  flowDirectionTone,
  onClear,
}: DisplacementChartProps) {
  const { pick } = useLanguage();

  const width = 720;
  const height = 148;
  const padL = 38;
  const padR = 14;
  const padT = 14;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const latestT = samples.length > 0 ? samples[samples.length - 1].t : 12;
  const windowSec = 12;
  const minT = Math.max(0, latestT - windowSec);
  const maxT = Math.max(windowSec, latestT);

  const points = samples
    .filter((s) => s.t >= minT - 0.5)
    .map((s) => {
      const x = padL + ((s.t - minT) / (maxT - minT || 1)) * plotW;
      const y = padT + plotH - (Math.max(0, Math.min(100, s.strokePct)) / 100) * plotH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaPoints =
    samples.length > 1
      ? `${padL + ((Math.max(minT, samples[0].t) - minT) / (maxT - minT || 1)) * plotW},${padT + plotH} ${points} ${padL + ((latestT - minT) / (maxT - minT || 1)) * plotW},${padT + plotH}`
      : '';

  const gridColor = 'var(--md-outline-variant)';
  const textColor = 'var(--md-on-surface-variant)';
  const lineColor = 'var(--md-primary)';
  const fillColor = 'var(--md-primary-container)';

  const toneClasses = {
    cyan: 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]',
    amber:
      'bg-amber-50 text-amber-800 ring-1 ring-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
    slate:
      'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]',
  }[flowDirectionTone];

  return (
    <div className="glass-panel rounded-[28px] p-4 sm:p-5">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--md-primary)]" />
          <h3 className="text-xs font-bold text-[var(--md-on-surface)]">
            {pick(
              'Displacement-Step Timing Chart (Stroke % vs Time)',
              'Grafik Langkah-Perpindahan (% Langkah vs Waktu)',
              '変位-ステップ線図（ストローク% vs 時間）'
            )}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses}`}
          >
            {flowDirectionLabel}
          </span>
          <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--md-on-secondary-container)]">
            {cycleRateCpm.toFixed(1)}{' '}
            {pick('cycles/min', 'siklus/mnt', '回/分')}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="glass-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          >
            <Trash2 className="h-3 w-3" />
            {pick('Clear', 'Hapus', '消去')}
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = padT + plotH - (pct / 100) * plotH;
          return (
            <g key={pct}>
              <line
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke={gridColor}
                strokeOpacity={0.45}
                strokeWidth={1}
                strokeDasharray={pct === 0 || pct === 100 ? undefined : '3 3'}
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={9.5}
                fontFamily="var(--font-mono)"
                fill={textColor}
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {areaPoints && <polygon points={areaPoints} fill={fillColor} fillOpacity={0.38} />}
        {points && (
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
        )}

        <text
          x={padL}
          y={height - 5}
          fontSize={9.5}
          fontFamily="var(--font-mono)"
          fill={textColor}
        >
          {minT.toFixed(1)}s
        </text>
        <text
          x={width - padR}
          y={height - 5}
          textAnchor="end"
          fontSize={9.5}
          fontFamily="var(--font-mono)"
          fill={textColor}
        >
          {maxT.toFixed(1)}s ({pick('12s window', 'jendela 12 dtk', '12秒窓')})
        </text>
      </svg>
    </div>
  );
}
