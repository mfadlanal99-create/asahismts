import { useState } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
  const { pick } = useLanguage();
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

  const gridStroke = 'var(--md-outline-variant)';
  const textFill = 'var(--md-on-surface-variant)';
  const selectedLeak = calcOrificeLeak(
    selectedOrificeMm,
    currentPressureBar,
    specificPowerKwPerM3Min
  );

  return (
    <div data-tour="compressor-analytics" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 1. Receiver Pressure Sawtooth & Load/Unload Duty-Cycle Chart */}
      <div className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--md-primary)]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              {pick(
                'Receiver Pressure Sawtooth & Duty Cycle',
                'Gergaji Tekanan Receiver & Duty Cycle',
                'レシーバ圧力ノコギリ波・負荷率'
              )}
            </h3>
          </div>
          <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-0.5 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)]">
            {pick('Duty', 'Beban', '負荷率')}: {dutyCyclePct.toFixed(0)}%
          </span>
        </div>

        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto w-full select-none"
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
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill={textFill}
                  fontFamily="var(--font-mono)"
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
            fill="var(--md-primary)"
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
            rx="4"
            fill="var(--md-surface-container)"
            fillOpacity="0.92"
          />
          <text
            x={w - padR - 3}
            y={unloadY - 3.5}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="#d97706"
            fontFamily="var(--font-mono)"
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
            rx="4"
            fill="var(--md-surface-container)"
            fillOpacity="0.92"
          />
          <text
            x={w - padR - 3}
            y={loadY + 10.5}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="#059669"
            fontFamily="var(--font-mono)"
          >
            Load {loadPressureBar.toFixed(1)} bar
          </text>

          {/* Sawtooth Pressure Polyline */}
          {history.length > 1 && (
            <polyline
              fill="none"
              stroke="var(--md-primary)"
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
            fill={lastSample.loaded ? 'var(--md-primary)' : 'var(--md-outline)'}
            stroke="var(--md-surface-container-low)"
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
                fill={sample.loaded ? 'var(--md-primary)' : 'var(--md-surface-container-highest)'}
              />
            );
          })}
          <text x={padL} y={h - 5} fontSize="8.5" fill={textFill} fontFamily="var(--font-sans)">
            {pick(
              'Loaded (accent) vs Unloaded (neutral) cycle history',
              'Riwayat siklus Loaded (aksen) vs Unloaded (netral)',
              'ロード（強調色）vs アンロード（中立色）サイクル履歴'
            )}
          </text>
        </svg>
      </div>

      {/* 2. Orifice Air-Leak Cost Estimator */}
      <div className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              {pick(
                'Orifice Air-Leak Cost Estimator',
                'Estimator Biaya Kebocoran Orifice',
                'オリフィス漏れコスト試算'
              )}
            </h3>
          </div>
          <span className="font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
            @ {currentPressureBar.toFixed(2)} bar(g)
          </span>
        </div>

        {/* Orifice Size Selector Buttons */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-[var(--md-on-surface-variant)]">
            {pick('Hole Ø:', 'Lubang Ø:', '穴径 Ø:')}
          </span>
          {ORIFICE_SIZES_MM.map((size) => {
            const active = selectedOrificeMm === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedOrificeMm(size)}
                className={`rounded-full px-3 py-1 font-mono text-xs transition ${
                  active
                    ? 'm3-btn-filled font-bold'
                    : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                }`}
              >
                {size} mm
              </button>
            );
          })}
        </div>

        {/* Highlighted Selected Orifice KPIs */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
            <div className="text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
              {pick('Air Wasted', 'Udara Terbuang', '漏れ空気量')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-extrabold text-[var(--md-on-surface)]">
              {selectedLeak.flowM3Min.toFixed(2)} m³/min
            </div>
          </div>
          <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
            <div className="text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
              {pick('Power Wasted', 'Daya Terbuang', '損失動力')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-extrabold text-[var(--md-primary)]">
              {selectedLeak.wastedKw.toFixed(2)} kW
            </div>
          </div>
          <div className="rounded-[20px] border border-rose-300/70 bg-rose-50/80 p-2.5 dark:border-rose-500/35 dark:bg-rose-950/30">
            <div className="text-[10px] font-semibold uppercase text-rose-700 dark:text-rose-300">
              {pick('Annual Loss', 'Rugi Tahunan', '年間損失額')}
            </div>
            <div className="mt-0.5 font-mono text-sm font-extrabold text-rose-700 dark:text-rose-300">
              ${Math.round(selectedLeak.annualCostUsd).toLocaleString()}/yr
            </div>
          </div>
        </div>

        {/* Quick Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--md-outline-variant)]/50 text-[10px] uppercase text-[var(--md-on-surface-variant)]">
                <th className="px-2 py-1.5 font-bold">{pick('Orifice', 'Orifice', '穴径')}</th>
                <th className="px-2 py-1.5 font-bold">{pick('Flow (m³/min)', 'Aliran (m³/min)', '流量 (m³/min)')}</th>
                <th className="px-2 py-1.5 font-bold">{pick('Power (kW)', 'Daya (kW)', '動力 (kW)')}</th>
                <th className="px-2 py-1.5 text-right font-bold">{pick('Cost ($/yr)', 'Biaya ($/thn)', '損失 ($/年)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-outline-variant)]/35">
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
                        ? 'bg-[var(--md-primary-container)]/70 font-semibold text-[var(--md-on-primary-container)]'
                        : 'text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <td className="px-2 py-1.5 font-mono">{size} mm</td>
                    <td className="px-2 py-1.5 font-mono">{row.flowM3Min.toFixed(2)}</td>
                    <td className="px-2 py-1.5 font-mono">{row.wastedKw.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">
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
