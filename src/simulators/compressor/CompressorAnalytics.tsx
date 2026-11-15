import { useState } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export interface PressureSample {
  p: number;
  loaded: boolean;
}

interface CompressorAnalyticsProps {
  history: PressureSample[];
  loadPressureBar: number;
  unloadPressureBar: number;
  currentPressureBar: number;
  dutyCyclePct: number;
  specificPowerKwPerM3Min: number;
}

const ORIFICE_SIZES_MM = [1, 2, 3, 5] as const;

function calcOrificeLeak(diameterMm: number, gaugePressureBar: number, specificPower: number) {
  const cd = 0.65; // Sharp-edged orifice discharge coefficient
  const areaM2 = Math.PI * Math.pow((diameterMm / 1000) / 2, 2);
  const pAbsPa = (gaugePressureBar + 1.01325) * 1e5;
  // Choked air flow constant at 298 K, gamma = 1.4, R = 287 J/(kg*K)
  const chokedFactor = 0.002341;
  const massFlowKgS = cd * areaM2 * pAbsPa * chokedFactor;
  // Convert to FAD m³/min at 1.184 kg/m³
  const flowM3Min = (massFlowKgS * 60) / 1.184;
  const wastedKw = flowM3Min * specificPower;
  const annualCostUsd = wastedKw * 6000 * 0.12;
  return { flowM3Min, wastedKw, annualCostUsd };
}

export function CompressorAnalytics({
  history,
  loadPressureBar,
  unloadPressureBar,
  currentPressureBar,
  dutyCyclePct,
  specificPowerKwPerM3Min,
}: CompressorAnalyticsProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const [selectedOrificeMm, setSelectedOrificeMm] = useState<number>(3);

  // Sawtooth chart dimensions
  const w = 460;
  const h = 164;
  const padL = 38;
  const padR = 14;
  const padT = 16;
  const padB = 32;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const yMin = 4.0;
  const yMax = 10.0;
  const toY = (p: number) =>
    padT + plotH - ((Math.max(yMin, Math.min(yMax, p)) - yMin) / (yMax - yMin)) * plotH;

  const points = history
    .map((sample, idx) => {
      const x =
        padL + (history.length > 1 ? (idx / (history.length - 1)) * plotW : plotW);
      const y = toY(sample.p);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastSample = history[history.length - 1] ?? { p: currentPressureBar, loaded: true };
  const lastY = toY(lastSample.p);

  const loadY = toY(loadPressureBar);
  const unloadY = toY(unloadPressureBar);

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const textFill = isDark ? '#94a3b8' : '#64748b';
  const selectedLeak = calcOrificeLeak(
    selectedOrificeMm,
    currentPressureBar,
    specificPowerKwPerM3Min
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 1. Receiver Pressure Sawtooth & Load/Unload Duty-Cycle Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {pick(
                'Receiver Pressure Sawtooth & Duty Cycle',
                'Gergaji Tekanan Receiver & Duty Cycle',
                'レシーバ圧力ノコギリ波・負荷率'
              )}
            </h3>
          </div>
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-300">
            {pick('Duty', 'Beban', '負荷率')}: {dutyCyclePct.toFixed(0)}%
          </span>
        </div>

        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Receiver Pressure Sawtooth Chart"
        >
          {/* Y-axis gridlines */}
          {[4, 6, 8, 10].map((barVal) => {
            const y = toY(barVal);
            return (
              <g key={barVal}>
                <line
                  x1={padL}
                  y1={y}
                  x2={w - padR}
                  y2={y}
                  stroke={gridStroke}
                  strokeWidth="1"
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill={textFill}
                >
                  {barVal}b
                </text>
              </g>
            );
          })}

          {/* Shaded Load/Unload Deadband */}
          <rect
            x={padL}
            y={unloadY}
            width={plotW}
            height={Math.max(1, loadY - unloadY)}
            fill={isDark ? '#0ea5e9' : '#38bdf8'}
            opacity="0.1"
          />

          {/* Unload (Cut-Out) Threshold */}
          <line
            x1={padL}
            y1={unloadY}
            x2={w - padR}
            y2={unloadY}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <rect
            x={w - padR - 78}
            y={unloadY - 12}
            width="76"
            height="11"
            rx="3"
            fill={isDark ? '#0f172a' : '#ffffff'}
            fillOpacity="0.88"
          />
          <text
            x={w - padR - 3}
            y={unloadY - 3.5}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="#d97706"
          >
            Unload {unloadPressureBar.toFixed(1)} bar
          </text>

          {/* Load (Cut-In) Threshold */}
          <line
            x1={padL}
            y1={loadY}
            x2={w - padR}
            y2={loadY}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <rect
            x={w - padR - 68}
            y={loadY + 2}
            width="66"
            height="11"
            rx="3"
            fill={isDark ? '#0f172a' : '#ffffff'}
            fillOpacity="0.88"
          />
          <text
            x={w - padR - 3}
            y={loadY + 10.5}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="#059669"
          >
            Load {loadPressureBar.toFixed(1)} bar
          </text>

          {/* Sawtooth Pressure Polyline */}
          {history.length > 1 && (
            <polyline
              fill="none"
              stroke={isDark ? '#38bdf8' : '#0284c7'}
              strokeWidth="2.2"
              strokeLinejoin="round"
              points={points}
            />
          )}

          {/* Live Leading Dot */}
          <circle
            cx={w - padR}
            cy={lastY}
            r="3.5"
            fill={lastSample.loaded ? '#0ea5e9' : '#94a3b8'}
            stroke={isDark ? '#0f172a' : '#ffffff'}
            strokeWidth="1.5"
          />

          {/* Bottom Load/Unload State Bar */}
          {history.map((sample, idx) => {
            const segW = plotW / Math.max(1, history.length);
            const x = padL + idx * segW;
            return (
              <rect
                key={idx}
                x={x}
                y={h - 21}
                width={Math.max(1, segW + 0.4)}
                height="6"
                fill={sample.loaded ? '#0ea5e9' : isDark ? '#334155' : '#cbd5e1'}
              />
            );
          })}
          <text x={padL} y={h - 5} fontSize="8.5" fill={textFill}>
            {pick(
              'Loaded (blue) vs Unloaded (gray) cycle history',
              'Riwayat siklus Loaded (biru) vs Unloaded (abu)',
              'ロード（青）vs アンロード（灰）サイクル履歴'
            )}
          </text>
        </svg>
      </div>

      {/* 2. Orifice Air-Leak Cost Estimator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {pick(
                'Orifice Air-Leak Cost Estimator',
                'Estimator Biaya Kebocoran Orifice',
                'オリフィス漏れコスト試算'
              )}
            </h3>
          </div>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            @ {currentPressureBar.toFixed(2)} bar(g)
          </span>
        </div>

        {/* Orifice Size Selector Buttons */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-slate-500 dark:text-slate-400">
            {pick('Hole Ø:', 'Lubang Ø:', '穴径 Ø:')}
          </span>
          {ORIFICE_SIZES_MM.map((size) => {
            const active = selectedOrificeMm === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedOrificeMm(size)}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-rose-600 text-white shadow-xs dark:bg-rose-500 dark:text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {size} mm
              </button>
            );
          })}
        </div>

        {/* Highlighted Selected Orifice KPIs */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
              {pick('Air Wasted', 'Udara Terbuang', '漏れ空気量')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {selectedLeak.flowM3Min.toFixed(2)} m³/min
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="text-[10px] font-medium uppercase text-slate-500 dark:text-slate-400">
              {pick('Power Wasted', 'Daya Terbuang', '損失動力')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-bold text-amber-700 dark:text-amber-300">
              {selectedLeak.wastedKw.toFixed(2)} kW
            </div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <div className="text-[10px] font-medium uppercase text-rose-700 dark:text-rose-300">
              {pick('Annual Loss', 'Rugi Tahunan', '年間損失額')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-bold text-rose-700 dark:text-rose-300">
              ${Math.round(selectedLeak.annualCostUsd).toLocaleString()}/yr
            </div>
          </div>
        </div>

        {/* Quick Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-1 font-semibold">{pick('Orifice', 'Orifice', '穴径')}</th>
                <th className="py-1 font-semibold">{pick('Flow (m³/min)', 'Aliran (m³/min)', '流量 (m³/min)')}</th>
                <th className="py-1 font-semibold">{pick('Power (kW)', 'Daya (kW)', '動力 (kW)')}</th>
                <th className="py-1 text-right font-semibold">{pick('Cost ($/yr)', 'Biaya ($/thn)', '損失 ($/年)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {ORIFICE_SIZES_MM.map((size) => {
                const row = calcOrificeLeak(
                  size,
                  currentPressureBar,
                  specificPowerKwPerM3Min
                );
                const isSel = size === selectedOrificeMm;
                return (
                  <tr
                    key={size}
                    onClick={() => setSelectedOrificeMm(size)}
                    className={`cursor-pointer transition-colors ${
                      isSel
                        ? 'bg-rose-50/70 font-semibold text-rose-900 dark:bg-rose-500/10 dark:text-rose-200'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-1 font-mono">{size} mm</td>
                    <td className="py-1 font-mono">{row.flowM3Min.toFixed(2)}</td>
                    <td className="py-1 font-mono">{row.wastedKw.toFixed(2)}</td>
                    <td className="py-1 text-right font-mono">
                      ${Math.round(row.annualCostUsd).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
