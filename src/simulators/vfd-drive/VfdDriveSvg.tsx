import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  generatePwmWaveforms,
  generateTorqueSpeedCurve,
  generateVfCurve,
  type DriveRunState,
  type VfdComputedState,
  type VfdParams,
} from './vfdDrivePhysics';

export type VfdChartTab = 'torque-speed' | 'vf-curve' | 'waveform';

interface VfdDriveSvgProps {
  params: VfdParams;
  computed: VfdComputedState;
  runState: DriveRunState;
  rotorAngleDeg: number;
}

export function VfdDriveSvg({
  params,
  computed,
  runState,
  rotorAngleDeg,
}: VfdDriveSvgProps) {
  const { pick } = useLanguage();
  const [chartTab, setChartTab] = useState<VfdChartTab>('torque-speed');

  const isRunning =
    runState === 'accelerating' ||
    runState === 'running' ||
    runState === 'decelerating';
  const isVfd = params.starterMode === 'vfd';
  const isPhaseLoss = params.faultMode === 'phase-loss';
  const isDcOv = computed.tripCode === 'OV' || computed.dcBusVoltageV >= 760;
  const isOc = computed.tripCode === 'OC' || computed.currentPct >= 180;
  const isEdm =
    computed.tripCode === 'EDM_WARN' || params.faultMode === 'bearing-fluting';

  // Chart Data
  const torqueCurve = generateTorqueSpeedCurve(
    params,
    computed.effectiveFreqHz,
    computed.starDeltaPhase
  );
  const vfCurve = generateVfCurve(params);
  const waveforms = generatePwmWaveforms(
    computed.effectiveFreqHz,
    computed.outputVoltageV,
    params.ratedVoltageV,
    params.carrierFreqKhz,
    params.faultMode
  );

  // SVG Chart dimensions
  const cw = 640;
  const ch = 205;
  const padL = 52;
  const padR = 24;
  const padT = 22;
  const padB = 34;
  const plotW = cw - padL - padR;
  const plotH = ch - padT - padB;

  const maxRpm = Math.max(
    1000,
    computed.syncSpeedRpm || (120 * params.targetFreqHz) / params.poles
  );

  const torquePath = torqueCurve
    .map((pt, idx) => {
      const x = padL + (pt.rpm / maxRpm) * plotW;
      const y = padT + plotH - (Math.min(260, pt.motorTorquePct) / 260) * plotH;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const loadY = padT + plotH - (Math.min(260, params.loadTorquePct) / 260) * plotH;
  const opX = padL + (Math.min(maxRpm, computed.rotorSpeedRpm) / maxRpm) * plotW;
  const opY =
    padT + plotH - (Math.min(260, computed.motorTorquePct) / 260) * plotH;

  const vfVoltagePath = vfCurve
    .map((pt, idx) => {
      const x = padL + (pt.freqHz / 80) * plotW;
      const y = padT + plotH - (pt.voltageV / (params.ratedVoltageV * 1.1)) * plotH;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const vfFluxPath = vfCurve
    .map((pt, idx) => {
      const x = padL + (pt.freqHz / 80) * plotW;
      const y = padT + plotH - (pt.fluxPct / 110) * plotH;
      return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const vfOpX = padL + (Math.min(80, computed.effectiveFreqHz) / 80) * plotW;
  const vfOpY =
    padT +
    plotH -
    (computed.outputVoltageV / (params.ratedVoltageV * 1.1)) * plotH;

  const makeWavePath = (key: 'u' | 'v' | 'w' | 'pwmU') =>
    waveforms
      .map((pt, idx) => {
        const x = padL + (pt.deg / 360) * plotW;
        const y = padT + plotH / 2 - pt[key] * (plotH * 0.42);
        return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  return (
    <div className="space-y-4">
      {/* SCHEMATIC PANEL */}
      <div
        className="glass-panel rounded-[28px] p-3 sm:p-4"
        data-tour="vfd-schematic"
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick(
              '3-Phase Power Train: Mains → Drive / Starter → Induction Motor',
              'Rangkaian Daya 3-Fasa: Jala Listrik → Penggerak / Starter → Motor Induksi',
              '三相動力系統：電源 → インバータ / 始動器 → 誘導電動機'
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span
              className={`rounded-full px-2.5 py-0.5 font-semibold ${
                computed.isTripped
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                  : isRunning
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-500/15 text-[var(--md-on-surface-variant)]'
              }`}
            >
              {computed.isTripped
                ? `TRIP: ${computed.tripCode}`
                : runState.toUpperCase()}
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 760 250"
          className="w-full h-auto rounded-2xl bg-slate-950/90 border border-slate-800/80"
          role="img"
          aria-label={pick(
            '3-Phase Motor and VFD Drive Schematic',
            'Skema Motor 3-Fasa dan Penggerak VFD',
            '三相電動機とVFDインバータの模式図'
          )}
        >
          <defs>
            <linearGradient id="vfdBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="motorBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* 1. 3-PHASE MAINS SUPPLY */}
          <g transform="translate(16, 40)">
            <rect
              x="0"
              y="0"
              width="86"
              height="165"
              rx="12"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <text
              x="43"
              y="22"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
            >
              3Φ MAINS
            </text>
            <text
              x="43"
              y="36"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontFamily="monospace"
            >
              {params.ratedVoltageV}V {params.baseFreqHz}Hz
            </text>

            {/* L1, L2, L3 */}
            {[
              { label: 'L1', y: 65, color: '#ef4444', dead: false },
              { label: 'L2', y: 100, color: '#eab308', dead: isPhaseLoss },
              { label: 'L3', y: 135, color: '#3b82f6', dead: false },
            ].map((ph) => (
              <g key={ph.label}>
                <circle
                  cx="22"
                  cy={ph.y}
                  r="8"
                  fill={ph.dead ? '#1e293b' : ph.color}
                  stroke={ph.dead ? '#ef4444' : '#cbd5e1'}
                  strokeWidth="1.5"
                  strokeDasharray={ph.dead ? '2,2' : undefined}
                />
                <text
                  x="48"
                  y={ph.y + 4}
                  fill={ph.dead ? '#f87171' : '#e2e8f0'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {ph.dead ? `${ph.label} ✕` : ph.label}
                </text>
              </g>
            ))}
          </g>

          {/* Mains to Breaker/Starter Lines */}
          {[65, 100, 135].map((yOffset, idx) => {
            const dead = idx === 1 && isPhaseLoss;
            const colors = ['#ef4444', '#eab308', '#3b82f6'];
            return (
              <line
                key={yOffset}
                x1="102"
                y1={40 + yOffset}
                x2="152"
                y2={40 + yOffset}
                stroke={dead ? '#475569' : colors[idx]}
                strokeWidth="3"
                strokeDasharray={dead ? '4,4' : undefined}
              />
            );
          })}

          {/* 2. MCCB / STARTER CONTACTOR */}
          <g transform="translate(152, 55)">
            <rect
              x="0"
              y="0"
              width="72"
              height="135"
              rx="10"
              fill="#0f172a"
              stroke={isRunning ? '#22c55e' : '#475569'}
              strokeWidth="1.5"
            />
            <text
              x="36"
              y="18"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontWeight="bold"
            >
              {params.starterMode === 'dol'
                ? 'DOL KM1'
                : params.starterMode === 'star-delta'
                  ? `Y-Δ (${computed.starDeltaPhase === 'star' ? 'STAR' : 'DELTA'})`
                  : 'MCCB'}
            </text>
            {[50, 85, 120].map((yPos, i) => (
              <g key={yPos}>
                <circle cx="14" cy={yPos - 15} r="3" fill="#94a3b8" />
                <circle cx="58" cy={yPos - 15} r="3" fill="#94a3b8" />
                <line
                  x1="14"
                  y1={yPos - 15}
                  x2="58"
                  y2={isRunning && !(i === 1 && isPhaseLoss) ? yPos - 15 : yPos - 28}
                  stroke={isRunning ? '#4ade80' : '#94a3b8'}
                  strokeWidth="2.5"
                />
              </g>
            ))}
          </g>

          {/* Lines from Breaker to VFD or Bypass */}
          {[105, 140, 175].map((yPos, idx) => (
            <line
              key={yPos}
              x1="224"
              y1={yPos}
              x2="262"
              y2={yPos}
              stroke={
                !isRunning
                  ? '#334155'
                  : idx === 1 && isPhaseLoss
                    ? '#475569'
                    : ['#ef4444', '#eab308', '#3b82f6'][idx]
              }
              strokeWidth="3"
              strokeDasharray={idx === 1 && isPhaseLoss ? '4,4' : undefined}
            />
          ))}

          {/* 3. VFD POWER STAGE (Rectifier -> DC Bus -> IGBT Inverter) */}
          <g transform="translate(262, 26)" opacity={isVfd ? 1 : 0.32}>
            <rect
              x="0"
              y="0"
              width="248"
              height="196"
              rx="14"
              fill="url(#vfdBodyGrad)"
              stroke={
                isDcOv || isOc
                  ? '#ef4444'
                  : isVfd && isRunning
                    ? '#38bdf8'
                    : '#475569'
              }
              strokeWidth="2"
            />
            <text
              x="124"
              y="20"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="11"
              fontWeight="bold"
            >
              {isVfd
                ? 'VFD INVERTER STAGE'
                : 'VFD BYPASSED (DIRECT STARTER)'}
            </text>

            {/* Rectifier Block */}
            <rect
              x="14"
              y="34"
              width="62"
              height="112"
              rx="8"
              fill="#0f172a"
              stroke="#475569"
            />
            <text
              x="45"
              y="52"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontWeight="bold"
            >
              RECTIFIER
            </text>
            <text
              x="45"
              y="66"
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
            >
              AC → DC
            </text>
            {/* Diode bridge symbol */}
            <polygon
              points="45,80 35,98 55,98"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <line
              x1="34"
              y1="80"
              x2="56"
              y2="80"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <text
              x="45"
              y="128"
              textAnchor="middle"
              fill={isPhaseLoss ? '#f87171' : '#38bdf8'}
              fontSize="9"
              fontFamily="monospace"
            >
              {isPhaseLoss ? 'RIPPLE!' : '6-PULSE'}
            </text>

            {/* DC Bus Rails */}
            <line x1="76" y1="58" x2="170" y2="58" stroke="#f59e0b" strokeWidth="2.5" />
            <line x1="76" y1="126" x2="170" y2="126" stroke="#64748b" strokeWidth="2.5" />

            {/* DC Bus Capacitor Bank */}
            <rect
              x="92"
              y="42"
              width="64"
              height="100"
              rx="8"
              fill="#0f172a"
              stroke={isDcOv ? '#ef4444' : '#f59e0b'}
              strokeWidth="1.5"
            />
            <text
              x="124"
              y="58"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="9"
              fontWeight="bold"
            >
              DC BUS
            </text>
            {/* Capacitor plates */}
            <line x1="112" y1="74" x2="136" y2="74" stroke="#fbbf24" strokeWidth="2" />
            <line x1="112" y1="82" x2="136" y2="82" stroke="#fbbf24" strokeWidth="2" />
            <text
              x="124"
              y="104"
              textAnchor="middle"
              fill={isDcOv ? '#f87171' : '#f8fafc'}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {isVfd ? `${Math.round(computed.dcBusVoltageV)}V` : '—'}
            </text>
            <text
              x="124"
              y="120"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="8"
              fontFamily="monospace"
            >
              {isVfd ? `±${Math.round(computed.dcBusRippleVpp)}Vpp` : ''}
            </text>

            {/* IGBT Inverter Block */}
            <rect
              x="170"
              y="34"
              width="64"
              height="112"
              rx="8"
              fill="#0f172a"
              stroke={isOc ? '#ef4444' : '#38bdf8'}
              strokeWidth="1.5"
            />
            <text
              x="202"
              y="52"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="bold"
            >
              IGBT PWM
            </text>
            <text
              x="202"
              y="66"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="8"
            >
              DC → AC
            </text>
            {/* PWM pulse icon */}
            <polyline
              points="182,98 186,98 186,82 192,82 192,98 197,98 197,78 205,78 205,98 211,98 211,84 217,84 217,98 222,98"
              fill="none"
              stroke={isRunning && isVfd ? '#22d3ee' : '#475569'}
              strokeWidth="1.8"
            />
            <text
              x="202"
              y="126"
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="9"
              fontFamily="monospace"
            >
              {params.carrierFreqKhz} kHz
            </text>

            {/* VFD Bottom Status Strip */}
            <rect
              x="14"
              y="156"
              width="220"
              height="28"
              rx="6"
              fill="#020617"
              stroke="#1e293b"
            />
            <text
              x="124"
              y="174"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="10.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {`${computed.effectiveFreqHz.toFixed(1)} Hz  |  ${Math.round(computed.outputVoltageV)} V  |  ${computed.outputCurrentA.toFixed(1)} A`}
            </text>
          </g>

          {/* Output U, V, W Lines to Motor */}
          {[105, 140, 175].map((yPos, idx) => (
            <line
              key={yPos}
              x1="510"
              y1={yPos}
              x2="554"
              y2={yPos}
              stroke={
                !isRunning
                  ? '#334155'
                  : isOc
                    ? '#ef4444'
                    : ['#22d3ee', '#38bdf8', '#818cf8'][idx]
              }
              strokeWidth="3"
            />
          ))}

          {/* 4. 3-PHASE INDUCTION MOTOR + LOAD */}
          <g transform="translate(554, 48)">
            {/* Motor Stator Housing */}
            <rect
              x="0"
              y="22"
              width="120"
              height="112"
              rx="16"
              fill="url(#motorBodyGrad)"
              stroke={isOc ? '#ef4444' : isRunning ? '#22d3ee' : '#475569'}
              strokeWidth="2"
            />
            {/* Cooling Fins */}
            {[36, 48, 60, 72, 84, 96, 108, 120].map((fy) => (
              <line
                key={fy}
                x1="12"
                y1={fy}
                x2="76"
                y2={fy}
                stroke="#475569"
                strokeWidth="2"
                opacity="0.6"
              />
            ))}

            {/* Animated Rotor Window */}
            <circle
              cx="92"
              cy="78"
              r="24"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="2"
            />
            <g transform={`translate(92, 78) rotate(${rotorAngleDeg})`}>
              <line
                x1="-18"
                y1="0"
                x2="18"
                y2="0"
                stroke="#38bdf8"
                strokeWidth="3.5"
              />
              <line
                x1="0"
                y1="-18"
                x2="0"
                y2="18"
                stroke="#22d3ee"
                strokeWidth="3.5"
              />
              <circle cx="0" cy="0" r="5" fill="#e2e8f0" />
            </g>

            {/* NDE Bearing EDM Spark Warning */}
            {isEdm && isRunning && (
              <g transform="translate(14, 78)">
                <circle
                  cx="0"
                  cy="0"
                  r="10"
                  fill="#ef4444"
                  opacity="0.3"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#fde047"
                  fontSize="12"
                  fontWeight="bold"
                >
                  ⚡
                </text>
              </g>
            )}

            {/* Motor Shaft & Driven Load */}
            <rect x="120" y="71" width="24" height="14" fill="#94a3b8" />
            <rect
              x="144"
              y="48"
              width="46"
              height="60"
              rx="10"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <text
              x="167"
              y="74"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="9.5"
              fontWeight="bold"
            >
              LOAD
            </text>
            <text
              x="167"
              y="90"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {params.loadTorquePct}%
            </text>

            {/* Motor Telemetry Badges */}
            <text
              x="60"
              y="12"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="10"
              fontWeight="bold"
            >
              {`${params.ratedPowerKw} kW • ${params.poles}P MOTOR`}
            </text>
            <text
              x="60"
              y="156"
              textAnchor="middle"
              fill="#22d3ee"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {`${Math.round(computed.rotorSpeedRpm)} RPM`}
            </text>
            <text
              x="60"
              y="171"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9.5"
              fontFamily="monospace"
            >
              {`Slip: ${computed.slipPct.toFixed(1)}% | T: ${computed.motorTorqueNm.toFixed(1)} N·m`}
            </text>
          </g>
        </svg>
      </div>

      {/* LIVE CURVE / WAVEFORM CHART PANEL */}
      <div
        className="glass-panel rounded-[28px] p-3 sm:p-4"
        data-tour="vfd-chart"
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Live Characteristic Curves', 'Kurva Karakteristik Langsung', 'リアルタイム特性曲線')}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                {
                  id: 'torque-speed',
                  label: pick('Torque–Speed', 'Torsi–Kecepatan', 'トルク–速度'),
                },
                {
                  id: 'vf-curve',
                  label: pick('V/f & Weakening', 'Kurva V/f', 'V/f特性'),
                },
                {
                  id: 'waveform',
                  label: pick('3Φ & PWM Wave', 'Gelombang PWM 3Φ', '三相・PWM波形'),
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChartTab(tab.id)}
                className={`rounded-full px-3 py-1 text-[11px] transition ${
                  chartTab === tab.id
                    ? 'm3-btn-filled font-bold'
                    : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <svg
          viewBox={`0 0 ${cw} ${ch}`}
          className="w-full h-auto rounded-2xl bg-slate-950/90 border border-slate-800/80"
        >
          {/* Grid Lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={padL}
              y1={padT + plotH * frac}
              x2={cw - padR}
              y2={padT + plotH * frac}
              stroke="#1e293b"
              strokeDasharray="3,3"
            />
          ))}

          {/* Axes */}
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={padT + plotH}
            stroke="#475569"
            strokeWidth="1.5"
          />
          <line
            x1={padL}
            y1={padT + plotH}
            x2={cw - padR}
            y2={padT + plotH}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {chartTab === 'torque-speed' && (
            <g>
              {/* Y-Axis Labels */}
              <text x={padL - 8} y={padT + 6} textAnchor="end" fill="#94a3b8" fontSize="9">
                260%
              </text>
              <text x={padL - 8} y={padT + plotH / 2} textAnchor="end" fill="#94a3b8" fontSize="9">
                130%
              </text>
              <text x={padL - 8} y={padT + plotH} textAnchor="end" fill="#94a3b8" fontSize="9">
                0%
              </text>
              {/* X-Axis Labels */}
              <text x={padL} y={ch - 10} textAnchor="middle" fill="#94a3b8" fontSize="9">
                0 RPM
              </text>
              <text x={padL + plotW / 2} y={ch - 10} textAnchor="middle" fill="#94a3b8" fontSize="9">
                {`${Math.round(maxRpm / 2)} RPM`}
              </text>
              <text x={cw - padR} y={ch - 10} textAnchor="end" fill="#94a3b8" fontSize="9">
                {`Ns = ${Math.round(maxRpm)} RPM`}
              </text>

              {/* Load Torque Line */}
              <line
                x1={padL}
                y1={loadY}
                x2={cw - padR}
                y2={loadY}
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="6,4"
              />
              <text x={padL + 8} y={loadY - 5} fill="#fbbf24" fontSize="9.5" fontWeight="bold">
                {`Load ${params.loadTorquePct}%`}
              </text>

              {/* Motor Torque Curve */}
              <path
                d={torquePath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
              />

              {/* Operating Point */}
              {isRunning && (
                <g>
                  <circle
                    cx={opX}
                    cy={opY}
                    r="5.5"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={Math.min(cw - 90, opX + 8)}
                    y={Math.max(padT + 14, opY - 8)}
                    fill="#34d399"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {`${Math.round(computed.rotorSpeedRpm)} RPM`}
                  </text>
                </g>
              )}
            </g>
          )}

          {chartTab === 'vf-curve' && (
            <g>
              {/* Base Hz vertical divider */}
              <line
                x1={padL + (params.baseFreqHz / 80) * plotW}
                y1={padT}
                x2={padL + (params.baseFreqHz / 80) * plotW}
                y2={padT + plotH}
                stroke="#f59e0b"
                strokeDasharray="4,4"
              />
              <text
                x={padL + (params.baseFreqHz / 80) * plotW + 6}
                y={padT + 14}
                fill="#fbbf24"
                fontSize="9"
              >
                {`Base ${params.baseFreqHz} Hz → Field Weakening`}
              </text>

              {/* Voltage & Flux Curves */}
              <path d={vfVoltagePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <path d={vfFluxPath} fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5,3" />

              {/* Operating Point */}
              {isRunning && (
                <circle
                  cx={vfOpX}
                  cy={vfOpY}
                  r="5.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}

              {/* Labels */}
              <text x={padL - 8} y={padT + 8} textAnchor="end" fill="#38bdf8" fontSize="9">
                {`${params.ratedVoltageV}V`}
              </text>
              <text x={padL} y={ch - 10} fill="#94a3b8" fontSize="9">
                0 Hz
              </text>
              <text x={cw - padR} y={ch - 10} textAnchor="end" fill="#94a3b8" fontSize="9">
                80 Hz
              </text>
              <text x={padL + 8} y={padT + 14} fill="#38bdf8" fontSize="9">
                — Voltage (V)
              </text>
              <text x={padL + 90} y={padT + 14} fill="#a78bfa" fontSize="9">
                -- Flux (%)
              </text>
            </g>
          )}

          {chartTab === 'waveform' && (
            <g>
              <line
                x1={padL}
                y1={padT + plotH / 2}
                x2={cw - padR}
                y2={padT + plotH / 2}
                stroke="#334155"
              />
              {isVfd && (
                <path
                  d={makeWavePath('pwmU')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  opacity="0.38"
                />
              )}
              <path d={makeWavePath('u')} fill="none" stroke="#ef4444" strokeWidth="2" />
              <path d={makeWavePath('v')} fill="none" stroke="#eab308" strokeWidth="2" />
              <path d={makeWavePath('w')} fill="none" stroke="#3b82f6" strokeWidth="2" />
              <text x={padL + 8} y={padT + 12} fill="#ef4444" fontSize="9">
                U
              </text>
              <text x={padL + 24} y={padT + 12} fill="#eab308" fontSize="9">
                V {isPhaseLoss ? '(FAULT)' : ''}
              </text>
              <text x={padL + 82} y={padT + 12} fill="#3b82f6" fontSize="9">
                W
              </text>
              {isVfd && (
                <text x={padL + 106} y={padT + 12} fill="#38bdf8" fontSize="9">
                  PWM ({params.carrierFreqKhz} kHz)
                </text>
              )}
              <text x={padL} y={ch - 10} fill="#94a3b8" fontSize="9">
                0°
              </text>
              <text x={cw - padR} y={ch - 10} textAnchor="end" fill="#94a3b8" fontSize="9">
                360° (1 Cycle @ {computed.effectiveFreqHz.toFixed(1)} Hz)
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
