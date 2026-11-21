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
      grid: 'var(--md-outline-variant)',
      axis: 'var(--md-outline-variant)',
      text: 'var(--md-on-surface-variant)',
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
      markerBpfi: 'var(--md-primary)',
      markerShaft: isDark ? '#38bdf8' : '#0284c7',
      markerOther: 'var(--md-on-surface-variant)',
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
      ? 'bg-rose-500/15 text-rose-700 border-rose-300/60 dark:text-rose-300 dark:border-rose-500/30'
      : data.housingTempC >= 60
        ? 'bg-amber-500/15 text-amber-700 border-amber-300/60 dark:text-amber-300 dark:border-amber-500/30'
        : 'bg-[var(--md-surface-container)] text-[var(--md-on-surface)] border-[var(--md-outline-variant)]/60';

  return (
    <div data-tour="bearing-diagnostics" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
      {/* Header + Health State Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--md-primary)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
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
                className={`rounded-full border px-3 py-1 text-[11px] transition ${
                  active
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)]'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {healthLabels[st.id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Badges: ISO 10816/20816 RMS, Housing Temp, Acoustic Status */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div
          className={`flex items-center justify-between rounded-[20px] border px-3.5 py-2.5 ${getIsoBadgeClass(data.isoZone)}`}
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
          <span className="rounded-full bg-[var(--md-surface-container-low)]/85 px-2.5 py-0.5 text-[11px] font-bold">
            {data.isoZone}
          </span>
        </div>

        <div
          className={`flex items-center justify-between rounded-[20px] border px-3.5 py-2.5 ${tempBadgeClass}`}
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

        <div className="flex items-center justify-between rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3.5 py-2.5 text-[var(--md-on-surface)]">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] font-semibold uppercase text-[var(--md-on-surface-variant)]">
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
          <Volume2 className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
        </div>
      </div>

      {/* Live SVG FFT Spectrum + Time-Waveform / Envelope (gE) Shock-Pulse Plot */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
          <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
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
                    strokeOpacity={0.55}
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill={svgColors.text}
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
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
                    strokeOpacity={0.55}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={svgColors.text}
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
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
              fontFamily="var(--font-sans)"
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
                      fill="var(--md-surface-container-low)"
                      opacity={0.9}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fill={color}
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
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
        <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
          <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
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
                    strokeOpacity={0.55}
                    strokeWidth={1}
                  />
                  <text
                    x={padL - 6}
                    y={y + 3}
                    textAnchor="end"
                    fill={svgColors.text}
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
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
                    strokeOpacity={0.55}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                  <text
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={svgColors.text}
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
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
              fontFamily="var(--font-sans)"
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
                    fontFamily="var(--font-mono)"
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
      <div className="grid grid-cols-2 gap-2 text-center text-[11px] sm:grid-cols-5">
        <div className="rounded-[18px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2 py-2">
          <div className="text-[var(--md-on-surface-variant)]">
            {pick('1× Shaft', '1× Poros', '1× 軸回転')}
          </div>
          <div className="font-mono font-bold text-[var(--md-primary)]">
            {data.shaftHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-[18px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2 py-2">
          <div className="text-[var(--md-on-surface-variant)]">
            {pick('FTF (Cage)', 'FTF (Sangkar)', 'FTF (保持器)')}
          </div>
          <div className="font-mono font-bold text-[var(--md-on-surface)]">
            {data.ftfHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-[18px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2 py-2">
          <div className="text-[var(--md-on-surface-variant)]">
            {pick('BSF (Ball)', 'BSF (Elemen)', 'BSF (転動体)')}
          </div>
          <div className="font-mono font-bold text-[var(--md-on-surface)]">
            {data.bsfHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="rounded-[18px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2 py-2">
          <div className="text-[var(--md-on-surface-variant)]">
            {pick('BPFO (Outer)', 'BPFO (Luar)', 'BPFO (外輪)')}
          </div>
          <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
            {data.bpfoHz.toFixed(1)} Hz
          </div>
        </div>
        <div className="col-span-2 rounded-[18px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2 py-2 sm:col-span-1">
          <div className="text-[var(--md-on-surface-variant)]">
            {pick('BPFI (Inner)', 'BPFI (Dalam)', 'BPFI (内輪)')}
          </div>
          <div className="font-mono font-bold text-[var(--md-primary)]">
            {data.bpfiHz.toFixed(1)} Hz
          </div>
        </div>
      </div>
    </div>
  );
}
