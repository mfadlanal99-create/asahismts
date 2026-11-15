import { useMemo } from 'react';
import { Activity, Thermometer, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  BearingHealthState,
  ConditionMonitoringData,
  IsoSeverityZone,
} from './bearingData';

interface ConditionMonitoringPanelProps {
  data: ConditionMonitoringData;
  healthState: BearingHealthState;
  onHealthStateChange: (state: BearingHealthState) => void;
}

const HEALTH_STATES: { id: BearingHealthState; label: string }[] = [
  { id: 'healthy', label: 'Healthy' },
  { id: 'bpfo', label: 'Outer Race Defect (BPFO)' },
  { id: 'bpfi', label: 'Inner Race Defect (BPFI)' },
  { id: 'lube-starvation', label: 'Lubrication Starvation / Overheat' },
];

function getIsoBadgeClass(zone: IsoSeverityZone): string {
  switch (zone) {
    case 'Zone A':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
    case 'Zone B':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30';
    case 'Zone C':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
    case 'Zone D':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }
}

export function ConditionMonitoringPanel({
  data,
  healthState,
  onHealthStateChange,
}: ConditionMonitoringPanelProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const healthLabels: Record<BearingHealthState, string> = {
    healthy: pick('Healthy', 'Sehat (Normal)', '正常 (健全)'),
    bpfo: pick(
      'Outer Race Defect (BPFO)',
      'Cacat Lintasan Luar (BPFO)',
      '外輪傷 (BPFO)'
    ),
    bpfi: pick(
      'Inner Race Defect (BPFI)',
      'Cacat Lintasan Dalam (BPFI)',
      '内輪傷 (BPFI)'
    ),
    'lube-starvation': pick(
      'Lubrication Starvation / Overheat',
      'Kurang Pelumasan / Overheat',
      '潤滑不良 / 過熱'
    ),
  };

  const localizedAcoustic =
    healthState === 'healthy'
      ? pick(
          'Smooth EHL Rolling (Normal)',
          'Gelinding EHL Halus (Normal)',
          'EHL 正常転がり (良好)'
        )
      : healthState === 'bpfo'
        ? pick(
            'Periodic Outer-Race Spall Impacting',
            'Tumbukan Spalling Lintasan Luar Periodik',
            '外輪はく離による周期的衝撃'
          )
        : healthState === 'bpfi'
          ? pick(
              'Modulated Inner-Race Impacting + Sidebands',
              'Tumbukan Lintasan Dalam Termodulasi + Sideband',
              '内輪衝撃 + 回転側帯波 (サイドバンド)'
            )
          : pick(
              'High-Freq Metal-to-Metal Friction / Acoustic Floor',
              'Gesekan Logam-ke-Logam Frekuensi Tinggi',
              '高周波金属接触摩擦 / ノイズ上昇'
            );

  const svgColors = useMemo(
    () => ({
      grid: isDark ? '#1e293b' : '#e2e8f0',
      axis: isDark ? '#475569' : '#94a3b8',
      text: isDark ? '#94a3b8' : '#475569',
      line:
        healthState === 'healthy'
          ? isDark
            ? '#34d399'
            : '#059669'
          : healthState === 'lube-starvation'
            ? isDark
              ? '#fbbf24'
              : '#d97706'
            : isDark
              ? '#fb7185'
              : '#e11d48',
      fill:
        healthState === 'healthy'
          ? isDark
            ? 'rgba(52, 211, 153, 0.14)'
            : 'rgba(5, 150, 105, 0.12)'
          : healthState === 'lube-starvation'
            ? isDark
              ? 'rgba(251, 191, 36, 0.16)'
              : 'rgba(217, 119, 6, 0.12)'
            : isDark
              ? 'rgba(251, 113, 133, 0.18)'
              : 'rgba(225, 29, 72, 0.12)',
      markerBpfo: isDark ? '#fb7185' : '#e11d48',
      markerBpfi: isDark ? '#a78bfa' : '#7c3aed',
      markerShaft: isDark ? '#38bdf8' : '#0284c7',
      markerOther: isDark ? '#94a3b8' : '#64748b',
    }),
    [isDark, healthState]
  );

  // SVG chart dimensions
  const width = 620;
  const height = 195;
  const padL = 42;
  const padR = 16;
  const padT = 22;
  const padB = 28;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const maxAmp = useMemo(() => {
    const peak = Math.max(...data.spectrum.map((p) => p.ampMmS), 2.5);
    return Math.ceil(peak * 1.15);
  }, [data.spectrum]);

  const { linePath, areaPath } = useMemo(() => {
    if (data.spectrum.length === 0) return { linePath: '', areaPath: '' };
    const mapX = (freq: number) =>
      padL +
      (Math.min(data.maxFreqHz, Math.max(0, freq)) / data.maxFreqHz) * plotW;
    const mapY = (amp: number) =>
      padT + plotH - (Math.min(maxAmp, Math.max(0, amp)) / maxAmp) * plotH;

    const line = data.spectrum
      .map(
        (pt, idx) =>
          `${idx === 0 ? 'M' : 'L'} ${mapX(pt.freqHz).toFixed(1)} ${mapY(pt.ampMmS).toFixed(1)}`
      )
      .join(' ');
    const xEnd = mapX(data.maxFreqHz).toFixed(1);
    const yBase = (padT + plotH).toFixed(1);
    return {
      linePath: line,
      areaPath: `${line} L ${xEnd} ${yBase} L ${padL} ${yBase} Z`,
    };
  }, [data.spectrum, data.maxFreqHz, maxAmp, plotW, plotH]);

  const toX = (freq: number) =>
    padL + (Math.min(data.maxFreqHz, Math.max(0, freq)) / data.maxFreqHz) * plotW;
  const toY = (amp: number) =>
    padT + plotH - (Math.min(maxAmp, Math.max(0, amp)) / maxAmp) * plotH;

  // Time-Waveform / Envelope (gE) Shock-Pulse Plot calculations
  const maxGe = useMemo(() => {
    const peak = Math.max(data.peakGe, 2.0);
    return Math.ceil(peak * 1.15);
  }, [data.peakGe]);

  const waveLinePath = useMemo(() => {
    if (data.waveform.length === 0) return '';
    const mapTX = (tMs: number) =>
      padL +
      (Math.min(data.waveformDurationMs, Math.max(0, tMs)) /
        data.waveformDurationMs) *
        plotW;
    const mapTY = (gE: number) =>
      padT + plotH - (Math.min(maxGe, Math.max(0, gE)) / maxGe) * plotH;

    return data.waveform
      .map(
        (pt, idx) =>
          `${idx === 0 ? 'M' : 'L'} ${mapTX(pt.timeMs).toFixed(1)} ${mapTY(pt.gE).toFixed(1)}`
      )
      .join(' ');
  }, [data.waveform, data.waveformDurationMs, maxGe, plotW, plotH]);

  const toTX = (tMs: number) =>
    padL +
    (Math.min(data.waveformDurationMs, Math.max(0, tMs)) /
      data.waveformDurationMs) *
      plotW;
  const toTY = (gE: number) =>
    padT + plotH - (Math.min(maxGe, Math.max(0, gE)) / maxGe) * plotH;

  const yTicks = [0, maxAmp * 0.5, maxAmp];
  const xTicks = [
    0,
    Math.round(data.maxFreqHz * 0.25),
    Math.round(data.maxFreqHz * 0.5),
    Math.round(data.maxFreqHz * 0.75),
    data.maxFreqHz,
  ];

  const tempBadgeClass =
    data.housingTempC >= 80
      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
      : data.housingTempC >= 60
        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
      {/* Header + Health State Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {pick(
              'Condition Monitoring & Vibration FFT Spectrum',
              'Pemantauan Kondisi & Spektrum Getaran FFT',
              '状態監視・振動 FFT スペクトル'
            )}
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {HEALTH_STATES.map((st) => {
            const active = st.id === healthState;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onHealthStateChange(st.id)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? 'border-violet-500 bg-violet-600 text-white shadow-xs dark:bg-violet-500 dark:text-slate-950'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-500/40'
                }`}
              >
                {healthLabels[st.id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Badges: ISO 10816/20816 RMS, Housing Temp, Acoustic Status */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 ${getIsoBadgeClass(data.isoZone)}`}
        >
          <div>
            <div className="text-[10px] font-semibold uppercase opacity-80">
              {pick(
                'ISO 10816/20816 RMS',
                'RMS ISO 10816/20816',
                'ISO 10816/20816 実効値'
              )}
            </div>
            <div className="font-mono text-sm font-bold">
              {data.rmsVelocityMmS.toFixed(2)} mm/s
            </div>
          </div>
          <span className="rounded-md bg-white/60 px-2 py-0.5 text-[11px] font-bold dark:bg-slate-950/40">
            {data.isoZone}
          </span>
        </div>

        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 ${tempBadgeClass}`}
        >
          <div>
            <div className="text-[10px] font-semibold uppercase opacity-80">
              {pick(
                'Est. Housing Temp',
                'Est. Suhu Rumah Bearing',
                '推定ハウジング温度'
              )}
            </div>
            <div className="font-mono text-sm font-bold">
              {data.housingTempC} °C
            </div>
          </div>
          <Thermometer className="h-4 w-4 opacity-80" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
              {pick(
                'Acoustic / Condition',
                'Akustik / Kondisi',
                '音響 / 軸受状態'
              )}
            </div>
            <div className="truncate text-xs font-semibold">
              {localizedAcoustic}
            </div>
          </div>
          <Volume2 className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
        </div>
      </div>

      {/* Live SVG FFT Spectrum + Time-Waveform / Envelope (gE) Shock-Pulse Plot */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>
              {pick(
                'FFT Velocity Spectrum (mm/s)',
                'Spektrum Kecepatan FFT (mm/s)',
                'FFT 速度スペクトル (mm/s)'
              )}
            </span>
            <span className="font-mono">0–{data.maxFreqHz} Hz</span>
          </div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Bearing vibration FFT velocity spectrum"
          >
            {/* Horizontal grid lines */}
            {yTicks.map((val, i) => {
              const y = toY(val);
              return (
                <g key={i}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={width - padR}
                    y2={y}
                    stroke={svgColors.grid}
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill={svgColors.text}
                    fontSize="9.5"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Vertical frequency grid */}
            {xTicks.map((hz, i) => {
              const x = toX(hz);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke={svgColors.grid}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={svgColors.text}
                    fontSize="9.5"
                  >
                    {hz} Hz
                  </text>
                </g>
              );
            })}

            {/* Y-axis label */}
            <text
              x={12}
              y={padT + plotH / 2}
              textAnchor="middle"
              fill={svgColors.text}
              fontSize="9.5"
              transform={`rotate(-90 12 ${padT + plotH / 2})`}
            >
              Velocity (mm/s)
            </text>

            {/* Spectrum area & line */}
            <path d={areaPath} fill={svgColors.fill} />
            <path
              d={linePath}
              fill="none"
              stroke={svgColors.line}
              strokeWidth={2}
              strokeLinejoin="round"
            />

            {/* Kinematic defect frequency markers (de-conflicted to prevent overlap at low RPM) */}
            {(() => {
              const sorted = [...data.markers]
                .map((mk) => ({
                  mk,
                  x: toX(mk.freqHz),
                  y: toY(mk.ampMmS),
                }))
                .sort((a, b) => a.x - b.x);

              const placed: { x: number; y: number }[] = [];
              return sorted.map(({ mk, x, y }, idx) => {
                const color =
                  mk.kind === 'bpfo'
                    ? svgColors.markerBpfo
                    : mk.kind === 'bpfi'
                      ? svgColors.markerBpfi
                      : mk.kind === 'shaft'
                        ? svgColors.markerShaft
                        : svgColors.markerOther;

                const labelX = Math.min(width - padR - 14, Math.max(padL + 14, x));
                let labelY = Math.max(14, y - 8);
                // Stagger upward or downward if another label is within 28px horizontally and 12px vertically
                for (let step = 0; step < 5; step++) {
                  const collides = placed.some(
                    (p) =>
                      Math.abs(p.x - labelX) < 28 && Math.abs(p.y - labelY) < 12
                  );
                  if (!collides) break;
                  labelY = labelY > 28 ? labelY - 13 : labelY + 13;
                }
                placed.push({ x: labelX, y: labelY });

                return (
                  <g key={idx}>
                    <line
                      x1={x}
                      y1={padT}
                      x2={x}
                      y2={padT + plotH}
                      stroke={color}
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.7}
                    />
                    <circle cx={x} cy={y} r={3} fill={color} />
                    <rect
                      x={labelX - 15}
                      y={labelY - 9}
                      width={30}
                      height={11}
                      rx={3}
                      fill={isDark ? '#020617' : '#f8fafc'}
                      opacity={0.85}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fill={color}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {mk.label}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
        </div>

        {/* Time-Waveform / Envelope (gE) Shock-Pulse Plot */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>
              {pick(
                'Time-Waveform / Envelope (gE)',
                'Gelombang Waktu / Envelope (gE)',
                '時間波形 / エンベロープ (gE)'
              )}
            </span>
            <span className="font-mono">
              {data.impactPeriodMs !== null
                ? `Δt = ${data.impactPeriodMs.toFixed(1)} ms (${healthState === 'bpfo' ? '1/BPFO' : '1/BPFI'}) · Peak ${data.peakGe.toFixed(1)} gE`
                : `Peak ${data.peakGe.toFixed(2)} gE`}
            </span>
          </div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Bearing envelope gE time-waveform shock-pulse plot"
          >
            {[0, maxGe * 0.5, maxGe].map((val, i) => {
              const y = toTY(val);
              return (
                <g key={i}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={width - padR}
                    y2={y}
                    stroke={svgColors.grid}
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill={svgColors.text}
                    fontSize="9.5"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
              const tMs = frac * data.waveformDurationMs;
              const x = toTX(tMs);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padT}
                    x2={x}
                    y2={padT + plotH}
                    stroke={svgColors.grid}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={svgColors.text}
                    fontSize="9.5"
                  >
                    {tMs.toFixed(0)} ms
                  </text>
                </g>
              );
            })}

            <text
              x={12}
              y={padT + plotH / 2}
              textAnchor="middle"
              fill={svgColors.text}
              fontSize="9.5"
              transform={`rotate(-90 12 ${padT + plotH / 2})`}
            >
              Envelope (gE)
            </text>

            {/* Impact period bracket if BPFO or BPFI */}
            {data.impactPeriodMs !== null &&
              data.impactPeriodMs < data.waveformDurationMs * 0.75 && (
                <g>
                  <line
                    x1={toTX(0)}
                    y1={padT + 8}
                    x2={toTX(data.impactPeriodMs)}
                    y2={padT + 8}
                    stroke={
                      healthState === 'bpfo'
                        ? svgColors.markerBpfo
                        : svgColors.markerBpfi
                    }
                    strokeWidth={1.5}
                  />
                  <text
                    x={Math.max(
                      padL + 24,
                      (toTX(0) + toTX(data.impactPeriodMs)) / 2
                    )}
                    y={padT + 4}
                    textAnchor="middle"
                    fill={
                      healthState === 'bpfo'
                        ? svgColors.markerBpfo
                        : svgColors.markerBpfi
                    }
                    fontSize="9"
                    fontWeight="700"
                  >
                    Δt={data.impactPeriodMs.toFixed(1)}ms
                  </text>
                </g>
              )}

            <path
              d={waveLinePath}
              fill="none"
              stroke={svgColors.line}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Kinematic Defect Frequencies Readout Strip */}
      <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
          <div className="text-slate-400">
            {pick('1× Shaft', '1× Poros', '1× 軸回転')}
          </div>
          <div className="font-mono font-semibold text-sky-600 dark:text-sky-400">
            {data.shaftHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
          <div className="text-slate-400">
            {pick('FTF (Cage)', 'FTF (Sangkar)', 'FTF (保持器)')}
          </div>
          <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">
            {data.ftfHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
          <div className="text-slate-400">
            {pick('BSF (Ball)', 'BSF (Elemen)', 'BSF (転動体)')}
          </div>
          <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">
            {data.bsfHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
          <div className="text-slate-400">
            {pick('BPFO (Outer)', 'BPFO (Luar)', 'BPFO (外輪)')}
          </div>
          <div className="font-mono font-semibold text-rose-600 dark:text-rose-400">
            {data.bpfoHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
          <div className="text-slate-400">
            {pick('BPFI (Inner)', 'BPFI (Dalam)', 'BPFI (内輪)')}
          </div>
          <div className="font-mono font-semibold text-violet-600 dark:text-violet-400">
            {data.bpfiHz.toFixed(1)} Hz
          </div>
        </div>
      </div>
    </div>
  );
}
