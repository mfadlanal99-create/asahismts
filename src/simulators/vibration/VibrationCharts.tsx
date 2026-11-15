import { useState, useId } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart3, TrendingUp } from 'lucide-react';
import type {
  BodePoint,
  RotorDynamicState,
} from './vibrationData';

interface VibrationChartsProps {
  state: RotorDynamicState;
  bodePoints: BodePoint[];
}

export function VibrationCharts({ state, bodePoints }: VibrationChartsProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const filterId = useId();

  const [activeTab, setActiveTab] = useState<'fft' | 'bode'>('fft');

  const colors = {
    bg: isDark ? '#0f172a' : '#ffffff',
    border: isDark ? '#1e293b' : '#e2e8f0',
    grid: isDark ? '#1e293b' : '#f1f5f9',
    axis: isDark ? '#475569' : '#cbd5e1',
    textMain: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    textDim: isDark ? '#64748b' : '#94a3b8',
    primary: isDark ? '#38bdf8' : '#0284c7', // Cyan / Sky
    secondary: isDark ? '#f59e0b' : '#d97706', // Amber for phase
    criticalSpeedLine: isDark ? '#f43f5e' : '#e11d48',
  };

  // ---------------- FFT SPECTRUM RENDER ----------------
  const renderFftSpectrum = () => {
    const chartW = 560;
    const chartH = 230;
    const padL = 50;
    const padR = 25;
    const padT = 32;
    const padB = 42;
    const plotW = chartW - padL - padR;
    const plotH = chartH - padT - padB;

    const maxHz = 150;
    const maxAmp = Math.max(
      4.0,
      Math.ceil(state.velocityTotalRmsMmS * 1.35)
    );

    const getX = (hz: number) => padL + (hz / maxHz) * plotW;
    const getY = (amp: number) => padT + plotH - (amp / maxAmp) * plotH;

    // Build SVG path for spectrum curve
    const pathD = state.fftBins.reduce((acc, pt, idx) => {
      const x = getX(pt.freqHz);
      const y = getY(pt.amplitudeMmS);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');

    // Area fill under spectrum
    const areaD = `${pathD} L ${getX(maxHz)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {pick('Vibration Velocity Spectrum (0 – 150 Hz)', 'Spektrum Kecepatan Getaran (0 – 150 Hz)', '振動速度スペクトル (0 – 150 Hz)')}
          </span>
          <span className="font-mono text-cyan-600 dark:text-cyan-400">
            {pick('Tracking: Orders 1X, 2X, 3X', 'Pelacakan: Orde 1X, 2X, 3X', '追従: 1X, 2X, 3X 次数比')}
          </span>
        </div>

        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto select-none">
          <defs>
            <linearGradient id={`fftAreaGrad-${filterId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.45" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal velocity) */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const y = padT + plotH * (1 - ratio);
            const val = (ratio * maxAmp).toFixed(1);
            return (
              <g key={ratio}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + plotW}
                  y2={y}
                  stroke={colors.grid}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <text
                  x={padL - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill={colors.textDim}
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Grid lines (vertical frequency steps) */}
          {[0, 30, 60, 90, 120, 150].map((hz) => {
            const x = getX(hz);
            return (
              <g key={hz}>
                <line
                  x1={x}
                  y1={padT}
                  x2={x}
                  y2={padT + plotH}
                  stroke={colors.grid}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <text
                  x={x}
                  y={padT + plotH + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={colors.textDim}
                >
                  {hz} Hz
                </text>
              </g>
            );
          })}

          {/* Spectrum Shaded Area & Line */}
          <path d={areaD} fill={`url(#fftAreaGrad-${filterId})`} />
          <path d={pathD} fill="none" stroke={colors.primary} strokeWidth="2" />

          {/* Peak Callout Badges (1X, 2X, 3X) with Collision Prevention */}
          {state.harmonics.map((h) => {
            const px = getX(h.freqHz);
            const py = getY(h.velocityRms);
            if (h.freqHz > maxHz || h.freqHz <= 0) return null;

            // Clamped badge Y to guarantee zero clipping at the top
            const badgeY = Math.max(10, py - 26);

            return (
              <g key={h.order}>
                {/* Vertical drop dashed pin */}
                <line
                  x1={px}
                  y1={py}
                  x2={px}
                  y2={padT + plotH}
                  stroke={h.order === 1 ? colors.primary : colors.textDim}
                  strokeWidth="1.4"
                  strokeDasharray="3 2"
                />
                <circle
                  cx={px}
                  cy={py}
                  r="4.5"
                  fill={h.order === 1 ? '#06b6d4' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth="1.4"
                />
                {/* Pill Tag */}
                <rect
                  x={px - 28}
                  y={badgeY}
                  width="56"
                  height="19"
                  rx="4"
                  fill={h.order === 1 ? (isDark ? '#083344' : '#ecfeff') : isDark ? '#1e293b' : '#f1f5f9'}
                  stroke={h.order === 1 ? '#06b6d4' : colors.axis}
                  strokeWidth="1.2"
                />
                <text
                  x={px}
                  y={badgeY + 13.5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="800"
                  fill={h.order === 1 ? (isDark ? '#38bdf8' : '#0891b2') : colors.textMain}
                >
                  {h.order}X: {h.velocityRms.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={padL + plotW / 2}
            y={chartH - 6}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill={colors.textMain}
          >
            {pick('Frequency (Hz) / Running Speed Orders', 'Frekuensi (Hz) / Orde Kecepatan Putar', '周波数 (Hz) / 回転次数比')}
          </text>
          <text
            transform={`rotate(-90) translate(-${padT + plotH / 2}, 16)`}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill={colors.textMain}
          >
            {pick('Velocity RMS (mm/s)', 'Kecepatan RMS (mm/s)', '振動速度実効値 (mm/s RMS)')}
          </text>
        </svg>

        {/* Harmonics Breakdown Telemetry Cards */}
        <div className="grid grid-cols-3 gap-2">
          {state.harmonics.map((h) => (
            <div
              key={h.order}
              className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={h.order === 1 ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500'}>
                  {h.label}
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {h.freqHz.toFixed(1)} Hz
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-100">
                  {h.velocityRms.toFixed(2)} mm/s
                </span>
                <span className="text-[10px] text-slate-500">
                  ({h.displacementUm.toFixed(1)} μm)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------------- BODE SWEEP PLOT RENDER ----------------
  const renderBodePlot = () => {
    const chartW = 560;
    const chartH = 245;
    const padL = 50;
    const padR = 25;
    const padT = 20;
    const plotW = chartW - padL - padR;

    // Amplitude plot (upper) and Phase plot (lower)
    const ampPlotH = 100;
    const phasePadT = padT + ampPlotH + 28;
    const phasePlotH = 50;

    const minRpm = 300;
    const maxRpm = 4500;
    const maxAmp = Math.max(
      30,
      Math.ceil(Math.max(...bodePoints.map((p) => p.amplitudeUm)) * 1.25)
    );

    const getX = (rpm: number) => padL + ((rpm - minRpm) / (maxRpm - minRpm)) * plotW;
    const getAmpY = (amp: number) => padT + ampPlotH - (amp / maxAmp) * ampPlotH;
    const getPhaseY = (deg: number) => phasePadT + phasePlotH - (deg / 180) * phasePlotH;

    // Amplitude curve path
    const ampPathD = bodePoints.reduce((acc, pt, idx) => {
      const x = getX(pt.rpm);
      const y = getAmpY(pt.amplitudeUm);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');

    // Phase curve path
    const phasePathD = bodePoints.reduce((acc, pt, idx) => {
      const x = getX(pt.rpm);
      const y = getPhaseY(pt.phaseLagDeg);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');

    // Current RPM position
    const curX = getX(state.rpm);
    const curAmpY = getAmpY(state.displacement1xPeakUm);
    const curPhaseY = getPhaseY(state.phaseLagDeg);

    // Critical speed resonance line
    const critX = getX(state.criticalRpm);

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {pick('Bode Diagram: Synchronous Amplitude & Phase vs RPM', 'Diagram Bode: Amplitudo & Sudut Fasa Sinkron vs RPM', 'ボード線図: 同期振幅および位相遅れ vs RPM')}
          </span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {pick(`Critical Speed: ${state.criticalRpm} RPM`, `Kecepatan Kritis: ${state.criticalRpm} RPM`, `危険速度: ${state.criticalRpm} RPM`)}
          </span>
        </div>

        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto select-none">
          {/* Critical Resonance Speed Vertical Indicator Band */}
          <line
            x1={critX}
            y1={padT}
            x2={critX}
            y2={phasePadT + phasePlotH}
            stroke={colors.criticalSpeedLine}
            strokeWidth="1.6"
            strokeDasharray="4 2"
          />
          <text
            x={critX + 4}
            y={padT + 12}
            fontSize="10"
            fontWeight="800"
            fill={colors.criticalSpeedLine}
          >
            Nc = {state.criticalRpm} RPM
          </text>

          {/* ===== UPPER PLOT: AMPLITUDE ===== */}
          {[0, 0.5, 1.0].map((ratio) => {
            const y = padT + ampPlotH * (1 - ratio);
            const val = (ratio * maxAmp).toFixed(0);
            return (
              <g key={ratio}>
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke={colors.grid} strokeWidth="1" strokeDasharray="3 3" />
                <text x={padL - 8} y={y + 3.5} textAnchor="end" fontSize="9.5" fontWeight="600" fill={colors.textDim}>
                  {val}
                </text>
              </g>
            );
          })}
          <text
            transform={`rotate(-90) translate(-${padT + ampPlotH / 2}, 16)`}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill={colors.primary}
          >
            Amp (μm)
          </text>

          {/* Amplitude Line */}
          <path d={ampPathD} fill="none" stroke={colors.primary} strokeWidth="2.2" />
          <circle cx={curX} cy={curAmpY} r="4.5" fill={colors.primary} stroke="#ffffff" strokeWidth="1.5" />

          {/* ===== LOWER PLOT: PHASE LAG (0 to 180 deg) ===== */}
          {[0, 90, 180].map((deg) => {
            const y = getPhaseY(deg);
            return (
              <g key={deg}>
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke={colors.grid} strokeWidth="1" strokeDasharray="3 3" />
                <text x={padL - 8} y={y + 3.5} textAnchor="end" fontSize="9.5" fontWeight="600" fill={colors.textDim}>
                  {deg}°
                </text>
              </g>
            );
          })}
          <text
            transform={`rotate(-90) translate(-${phasePadT + phasePlotH / 2}, 16)`}
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill={colors.secondary}
          >
            Phase (°)
          </text>

          {/* Phase Line */}
          <path d={phasePathD} fill="none" stroke={colors.secondary} strokeWidth="2.2" />
          <circle cx={curX} cy={curPhaseY} r="4.5" fill={colors.secondary} stroke="#ffffff" strokeWidth="1.5" />

          {/* Current RPM Vertical Cursor */}
          <line
            x1={curX}
            y1={padT}
            x2={curX}
            y2={phasePadT + phasePlotH}
            stroke={colors.textMain}
            strokeWidth="1.4"
            strokeDasharray="2 2"
          />

          {/* RPM X-axis Ticks */}
          {[500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500].map((rpm) => {
            const x = getX(rpm);
            return (
              <g key={rpm}>
                <line x1={x} y1={phasePadT + phasePlotH} x2={x} y2={phasePadT + phasePlotH + 4} stroke={colors.axis} strokeWidth="1" />
                <text
                  x={x}
                  y={phasePadT + phasePlotH + 15}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill={colors.textDim}
                >
                  {rpm}
                </text>
              </g>
            );
          })}
          <text
            x={padL + plotW / 2}
            y={chartH - 4}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            fill={colors.textMain}
          >
            Rotor Operating Speed (RPM)
          </text>
        </svg>

        {/* Operating Point Diagnostic Banner */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {pick('Current Operating State:', 'Kondisi Operasi Saat Ini:', '現在の運転状態:')}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-cyan-600 dark:text-cyan-400">
              {state.rpm} RPM (r = {state.frequencyRatio.toFixed(2)})
            </span>
            <span className="font-mono text-cyan-700 dark:text-cyan-300">
              {state.displacement1xPeakUm.toFixed(1)} μm
            </span>
            <span className="font-mono text-amber-600 dark:text-amber-400">
              φ = {state.phaseLagDeg.toFixed(1)}°
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 shadow-xs">
      {/* Chart Switcher Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-800/60">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          {pick('Diagnostic Spectra & Rotor Dynamic Response', 'Spektra Diagnostik & Respons Dinamika Rotor', '診断スペクトル・ロータ動特性応答')}
        </span>
        <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('fft')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              activeTab === 'fft'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {pick('FFT Spectrum', 'Spektrum FFT', 'FFTスペクトル')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bode')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              activeTab === 'bode'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {pick('Bode Plot (Sweep)', 'Plot Bode (Sapuan)', 'ボード線図 (スイープ)')}
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'fft' ? renderFftSpectrum() : renderBodePlot()}
    </div>
  );
}
