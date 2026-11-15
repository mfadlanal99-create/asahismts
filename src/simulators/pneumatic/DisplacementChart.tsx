import { Activity, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

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

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const lineColor = isDark ? '#22d3ee' : '#0891b2';
  const fillColor = isDark
    ? 'rgba(34, 211, 238, 0.14)'
    : 'rgba(8, 145, 178, 0.12)';

  const toneClasses = {
    cyan: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-300',
    amber:
      'bg-amber-50 text-amber-800 ring-1 ring-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
    slate:
      'bg-slate-100 text-slate-600 ring-1 ring-slate-300/60 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  }[flowDirectionTone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
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
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {cycleRateCpm.toFixed(1)}{' '}
            {pick('cycles/min', 'siklus/mnt', '回/分')}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
                strokeWidth={1}
                strokeDasharray={pct === 0 || pct === 100 ? undefined : '3 3'}
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={9.5}
                fill={textColor}
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {areaPoints && <polygon points={areaPoints} fill={fillColor} />}
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
          fill={textColor}
        >
          {minT.toFixed(1)}s
        </text>
        <text
          x={width - padR}
          y={height - 5}
          textAnchor="end"
          fontSize={9.5}
          fill={textColor}
        >
          {maxT.toFixed(1)}s ({pick('12s window', 'jendela 12 dtk', '12秒窓')})
        </text>
      </svg>
    </div>
  );
}
