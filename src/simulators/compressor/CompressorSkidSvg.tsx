import { useTheme } from '../../context/ThemeContext';
import type {
  CompressorDynamicState,
  CompressorParams,
  CompressorSolution,
} from './compressorPhysics';

export interface SkidAnimPhases {
  maleDeg: number;
  fanDeg: number;
  flowOffset: number;
}

interface CompressorSkidSvgProps {
  params: CompressorParams;
  dyn: CompressorDynamicState;
  sol: CompressorSolution;
  phases: SkidAnimPhases;
  blindMode?: boolean;
}

function buildLobePath(
  cx: number,
  cy: number,
  rRoot: number,
  rTip: number,
  lobes: number
): string {
  const steps = lobes * 16;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wave = 0.5 + 0.5 * Math.cos(lobes * a);
    const r = rRoot + (rTip - rRoot) * Math.pow(wave, 0.75);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${pts.join(' ')} Z`;
}

export function CompressorSkidSvg({
  params,
  dyn,
  sol,
  phases,
  blindMode = false,
}: CompressorSkidSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware palette
  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const cardFill = isDark ? '#1e293b' : '#ffffff';
  const cardStroke = isDark ? '#334155' : '#cbd5e1';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const pipeBase = isDark ? '#334155' : '#cbd5e1';

  const filterClogged = params.intakeFilterDpMbar >= 50;
  const filterRatio = Math.min(1, params.intakeFilterDpMbar / 120);
  // Progressive intake filter darkening: sky -> amber -> dark soot
  const pleatColor =
    filterRatio < 0.4
      ? '#0284c7'
      : filterRatio < 0.7
        ? '#d97706'
        : '#78350f';

  const coolerHot = sol.dischargeTempC > 105;
  const coolerWarn = params.coolerFoulingPct >= 50;
  const leakHigh = params.plantLeakPct >= 20;
  const reliefVenting = dyn.receiverPressureBar >= 9.0;

  // 4:6 Twin Helical Screw Rotor exact phase-locked rotation
  const maleAngle = phases.maleDeg;
  const femaleAngle = -maleAngle * (4 / 6) + 30;
  const fanAngle = phases.fanDeg;
  const flowOffset = phases.flowOffset;

  // Pressure gauge needle angle (-135 deg at 0 bar to +135 deg at 12 bar)
  const pNorm = Math.max(0, Math.min(1, dyn.receiverPressureBar / 12));
  const needleDeg = -135 + pNorm * 270;

  // Condensate tank fill height (max 52 px inside receiver bottom)
  const condFillH = Math.max(2, (dyn.condensateLevelPct / 100) * 52);

  // Pipe color & thermal glow based on discharge temperature
  const tempNorm = Math.max(0, Math.min(1, (sol.dischargeTempC - 75) / 35));
  const hotPipeColor = coolerHot
    ? '#ef4444'
    : tempNorm > 0.55
      ? '#f59e0b'
      : '#fb923c';
  const coolPipeColor = sol.waterCarryover ? '#3b82f6' : '#0ea5e9';
  const dryPipeColor = sol.waterCarryover ? '#60a5fa' : '#0284c7';

  const maleLobePath = buildLobePath(0, 0, 10, 17.5, 4);
  const femaleLobePath = buildLobePath(0, 0, 11, 17.5, 6);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Plant Compressed-Air Skid Schematic
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              sol.highTempTrip
                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                : dyn.isLoaded
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                sol.highTempTrip
                  ? 'bg-red-500'
                  : dyn.isLoaded
                    ? 'animate-pulse bg-sky-500'
                    : 'bg-slate-400'
              }`}
            />
            {sol.highTempTrip
              ? 'TRIPPED (>105 °C)'
              : dyn.isLoaded
                ? 'LOADED'
                : 'UNLOADED'}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          FAD:{' '}
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {sol.actualFadM3Min.toFixed(1)}
          </span>{' '}
          m³/min · Demand:{' '}
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {sol.totalDemandM3Min.toFixed(1)}
          </span>{' '}
          m³/min
        </div>
      </div>

      <svg
        viewBox="0 0 880 340"
        className="w-full h-auto select-none"
        role="img"
        aria-label="Interactive Air Compressor and Dryer Skid Schematic"
      >
        <defs>
          <pattern id="skidGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={gridStroke}
              strokeWidth="0.7"
            />
          </pattern>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="880" height="340" fill={bgFill} />
        <rect x="0" y="0" width="880" height="340" fill="url(#skidGrid)" opacity="0.6" />

        {/* === PIPING CONNECTIONS === */}
        {/* 1. Intake Filter -> Compressor */}
        <line x1="115" y1="155" x2="175" y2="155" stroke={pipeBase} strokeWidth="10" strokeLinecap="round" />
        <line
          x1="115"
          y1="155"
          x2="175"
          y2="155"
          stroke={filterClogged ? '#f59e0b' : '#38bdf8'}
          strokeWidth="4"
          strokeDasharray="6 6"
          strokeDashoffset={-flowOffset}
        />

        {/* 2. Compressor -> Intercooler/Aftercooler (with live thermal glow halo) */}
        {tempNorm > 0.25 && (
          <line
            x1="295"
            y1="155"
            x2="355"
            y2="155"
            stroke={hotPipeColor}
            strokeWidth={14 + tempNorm * 4}
            strokeOpacity={0.2 + tempNorm * 0.3}
            strokeLinecap="round"
          />
        )}
        <line x1="295" y1="155" x2="355" y2="155" stroke={pipeBase} strokeWidth="10" strokeLinecap="round" />
        <line
          x1="295"
          y1="155"
          x2="355"
          y2="155"
          stroke={hotPipeColor}
          strokeWidth="4"
          strokeDasharray="6 6"
          strokeDashoffset={-flowOffset}
        />

        {/* 3. Cooler -> Air Receiver */}
        <line x1="465" y1="155" x2="520" y2="155" stroke={pipeBase} strokeWidth="10" strokeLinecap="round" />
        <line
          x1="465"
          y1="155"
          x2="520"
          y2="155"
          stroke={coolPipeColor}
          strokeWidth="4"
          strokeDasharray="6 6"
          strokeDashoffset={-flowOffset}
        />

        {/* 4. Receiver -> Refrigerated Dryer */}
        <line x1="600" y1="130" x2="652" y2="130" stroke={pipeBase} strokeWidth="10" strokeLinecap="round" />
        <line
          x1="600"
          y1="130"
          x2="652"
          y2="130"
          stroke={coolPipeColor}
          strokeWidth="4"
          strokeDasharray="6 6"
          strokeDashoffset={-flowOffset}
        />

        {/* 5. Dryer -> Plant Demand */}
        <line x1="758" y1="130" x2="845" y2="130" stroke={pipeBase} strokeWidth="10" strokeLinecap="round" />
        <line
          x1="758"
          y1="130"
          x2="845"
          y2="130"
          stroke={dryPipeColor}
          strokeWidth="4"
          strokeDasharray="6 6"
          strokeDashoffset={-flowOffset}
        />

        {/* 6. Leak Branch off Plant Header */}
        <line x1="805" y1="130" x2="805" y2="215" stroke={pipeBase} strokeWidth="6" />
        {leakHigh && (
          <g>
            <line
              x1="805"
              y1="215"
              x2="805"
              y2="245"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="4 4"
              strokeDashoffset={-flowOffset}
            />
            <text
              x="805"
              y="262"
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill="#ef4444"
            >
              LEAK!
            </text>
          </g>
        )}

        {/* === 1. INTAKE FILTER === */}
        <g transform="translate(25, 100)">
          <rect
            x="0"
            y="0"
            width="90"
            height="110"
            rx="10"
            fill={cardFill}
            stroke={filterClogged ? '#f59e0b' : cardStroke}
            strokeWidth={filterClogged ? 2.5 : 1.5}
          />
          <text x="45" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill={textPrimary}>
            INTAKE FILTER
          </text>
          {/* Pleated filter element with progressive ΔP darkening */}
          <rect
            x="16"
            y="28"
            width="58"
            height="46"
            rx="4"
            fill={isDark ? '#0f172a' : '#f1f5f9'}
            stroke={cardStroke}
          />
          <rect
            x="16"
            y="28"
            width="58"
            height="46"
            rx="4"
            fill="#451a03"
            opacity={filterRatio * 0.55}
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={i}
              x1={23 + i * 9}
              y1="32"
              x2={23 + i * 9}
              y2="70"
              stroke={pleatColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <text
            x="45"
            y="90"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={filterClogged ? '#f59e0b' : textPrimary}
          >
            ΔP: {params.intakeFilterDpMbar.toFixed(0)} mbar
          </text>
          <text x="45" y="103" textAnchor="middle" fontSize="9" fill={textMuted}>
            P₁: {sol.suctionPressureBarAbs.toFixed(3)} bar
          </text>
        </g>

        {/* === 2. TWIN HELICAL SCREW (4:6 LOBE) COMPRESSOR === */}
        <g transform="translate(175, 85)">
          <rect
            x="0"
            y="0"
            width="120"
            height="140"
            rx="12"
            fill={cardFill}
            stroke={sol.highTempTrip ? '#ef4444' : dyn.isLoaded ? '#0ea5e9' : cardStroke}
            strokeWidth={sol.highTempTrip ? 2.5 : 1.5}
          />
          <text x="60" y="19" textAnchor="middle" fontSize="10" fontWeight="700" fill={textPrimary}>
            COMPRESSOR
          </text>
          <text x="60" y="31" textAnchor="middle" fontSize="8.5" fill={textMuted}>
            4:6 Twin-Screw / 2-Stg
          </text>

          {/* Twin-screw housing */}
          <rect
            x="16"
            y="42"
            width="88"
            height="54"
            rx="26"
            fill={isDark ? '#0f172a' : '#f1f5f9'}
            stroke={sol.highTempTrip ? '#ef4444' : '#0ea5e9'}
            strokeWidth="2"
          />

          {/* Male Rotor (4 lobes) */}
          <g transform={`translate(45, 69) rotate(${maleAngle})`}>
            <path
              d={maleLobePath}
              fill={sol.highTempTrip ? '#ef4444' : '#0284c7'}
              stroke={isDark ? '#0f172a' : '#ffffff'}
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="4" fill={cardFill} />
          </g>

          {/* Female Rotor (6 lobes, exact 4:6 counter-rotation) */}
          <g transform={`translate(75, 69) rotate(${femaleAngle})`}>
            <path
              d={femaleLobePath}
              fill={sol.highTempTrip ? '#f87171' : '#38bdf8'}
              stroke={isDark ? '#0f172a' : '#ffffff'}
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="4" fill={cardFill} />
          </g>

          <text
            x="60"
            y="117"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill={sol.highTempTrip ? '#ef4444' : textPrimary}
          >
            T₂: {sol.dischargeTempC.toFixed(1)} °C
          </text>
          <text x="60" y="131" textAnchor="middle" fontSize="9" fill={textMuted}>
            {sol.averagePowerKw.toFixed(1)} kW avg
          </text>
        </g>

        {/* === 3. INTERCOOLER / AFTERCOOLER === */}
        <g transform="translate(355, 90)">
          <rect
            x="0"
            y="0"
            width="110"
            height="130"
            rx="10"
            fill={cardFill}
            stroke={coolerWarn ? '#f59e0b' : cardStroke}
            strokeWidth={coolerWarn ? 2 : 1.5}
          />
          <text x="55" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill={textPrimary}>
            COOLER SKID
          </text>

          {/* Heat exchanger fins */}
          <rect
            x="16"
            y="28"
            width="78"
            height="58"
            rx="5"
            fill={isDark ? '#0f172a' : '#f1f5f9'}
            stroke={cardStroke}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="22"
              y1={37 + i * 10}
              x2="88"
              y2={37 + i * 10}
              stroke={coolerWarn ? '#f59e0b' : '#38bdf8'}
              strokeWidth="2.5"
            />
          ))}
          {/* Fouling overlay */}
          {params.coolerFoulingPct > 15 && (
            <rect
              x="16"
              y="28"
              width="78"
              height="58"
              rx="5"
              fill="#78350f"
              opacity={Math.min(0.65, (params.coolerFoulingPct / 100) * 0.65)}
            />
          )}

          {/* Cooling Fan */}
          <g transform={`translate(55, 57) rotate(${fanAngle})`}>
            <circle cx="0" cy="0" r="14" fill="none" stroke={textMuted} strokeWidth="1" strokeDasharray="3 3" />
            <line x1="-11" y1="0" x2="11" y2="0" stroke={textPrimary} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="0" y1="-11" x2="0" y2="11" stroke={textPrimary} strokeWidth="2.5" strokeLinecap="round" />
          </g>

          <text x="55" y="103" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={coolerWarn ? '#f59e0b' : textPrimary}>
            {blindMode ? 'Fouling: ???' : `Fouling: ${params.coolerFoulingPct}%`}
          </text>
          <text x="55" y="118" textAnchor="middle" fontSize="9" fill={textMuted}>
            Out: {sol.aftercoolerOutletC.toFixed(1)} °C
          </text>
        </g>

        {/* === 4. AIR RECEIVER TANK + SAFETY RELIEF + CONDENSATE DRAIN === */}
        <g transform="translate(520, 62)">
          {/* Safety Relief Valve (PRV) on top of tank */}
          <rect
            x="33"
            y="14"
            width="14"
            height="10"
            rx="2"
            fill={reliefVenting ? '#ef4444' : '#64748b'}
          />
          {reliefVenting && (
            <text x="40" y="9" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ef4444">
              PRV VENT!
            </text>
          )}

          {/* Tank body */}
          <rect
            x="0"
            y="24"
            width="80"
            height="168"
            rx="28"
            fill={cardFill}
            stroke={sol.waterCarryover ? '#ef4444' : '#0284c7'}
            strokeWidth="2"
          />
          <text x="40" y="11" textAnchor="middle" fontSize="10" fontWeight="700" fill={textPrimary}>
            {reliefVenting ? '' : 'RECEIVER'}
          </text>

          {/* Clip condensate inside tank bottom */}
          <rect
            x="4"
            y={188 - condFillH}
            width="72"
            height={condFillH}
            rx="12"
            fill={sol.waterCarryover ? '#ef4444' : '#38bdf8'}
            opacity="0.45"
          />

          {/* Analog Pressure Gauge */}
          <circle cx="40" cy="82" r="26" fill={isDark ? '#0f172a' : '#ffffff'} stroke={cardStroke} strokeWidth="2" />
          <path
            d="M 22 100 A 25 25 0 1 1 58 100"
            fill="none"
            stroke={isDark ? '#475569' : '#94a3b8'}
            strokeWidth="2"
          />
          <g transform={`translate(40, 82) rotate(${needleDeg})`}>
            <line x1="0" y1="4" x2="0" y2="-19" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="3" fill={textPrimary} />
          </g>
          <text x="40" y="124" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={textPrimary}>
            {dyn.receiverPressureBar.toFixed(2)} bar
          </text>
          <text x="40" y="138" textAnchor="middle" fontSize="8.5" fill={textMuted}>
            Band {params.loadPressureBar.toFixed(1)}–{params.unloadPressureBar.toFixed(1)}
          </text>

          {/* Condensate level pill for high contrast over water fill */}
          <rect
            x="14"
            y="163"
            width="52"
            height="16"
            rx="4"
            fill={cardFill}
            fillOpacity="0.92"
            stroke={sol.waterCarryover ? '#ef4444' : cardStroke}
            strokeWidth="0.8"
          />
          <text
            x="40"
            y="174.5"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="700"
            fill={sol.waterCarryover ? '#ef4444' : textPrimary}
          >
            H₂O: {dyn.condensateLevelPct.toFixed(0)}%
          </text>

          {/* Auto-drain valve below tank + purging droplets */}
          <line x1="40" y1="192" x2="40" y2="215" stroke={pipeBase} strokeWidth="5" />
          <rect
            x="22"
            y="215"
            width="36"
            height="20"
            rx="4"
            fill={params.autoDrainEnabled ? '#10b981' : '#ef4444'}
          />
          <text x="40" y="228" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#ffffff">
            {params.autoDrainEnabled ? 'DRAIN OK' : 'STUCK'}
          </text>
          {params.autoDrainEnabled && dyn.condensateLevelPct > 11 && (
            <g>
              {[0, 1, 2].map((i) => {
                const dy = ((phases.flowOffset + i * 8) % 24) * 0.7;
                return (
                  <circle
                    key={i}
                    cx={36 + i * 4}
                    cy={240 + dy}
                    r="2"
                    fill="#38bdf8"
                    opacity={1 - dy / 20}
                  />
                );
              })}
            </g>
          )}
        </g>

        {/* === 5. REFRIGERATED AIR DRYER === */}
        <g transform="translate(652, 78)">
          <rect
            x="0"
            y="0"
            width="106"
            height="112"
            rx="10"
            fill={cardFill}
            stroke={sol.pressureDewPointC > 10 ? '#ef4444' : '#0ea5e9'}
            strokeWidth={sol.pressureDewPointC > 10 ? 2 : 1.5}
          />
          <text x="53" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill={textPrimary}>
            REFRIG. DRYER
          </text>
          <rect
            x="19"
            y="28"
            width="68"
            height="42"
            rx="6"
            fill={isDark ? '#0f172a' : '#f0f9ff'}
            stroke={sol.pressureDewPointC > 10 ? '#f59e0b' : '#7dd3fc'}
          />
          <text
            x="53"
            y="53"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill={sol.pressureDewPointC > 10 ? '#ef4444' : '#0284c7'}
          >
            {sol.pressureDewPointC.toFixed(1)} °C
          </text>
          <text x="53" y="86" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={textPrimary}>
            Pressure Dew Pt
          </text>
          <text
            x="53"
            y="100"
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill={sol.waterCarryover ? '#ef4444' : textMuted}
          >
            {sol.waterCarryover ? 'WATER CARRYOVER!' : 'Target ≤ 3.5 °C'}
          </text>
        </g>

        {/* === 6. PLANT DEMAND HEADER === */}
        <g transform="translate(772, 26)">
          <rect x="0" y="0" width="92" height="64" rx="8" fill={cardFill} stroke={cardStroke} />
          <text x="46" y="18" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={textPrimary}>
            PLANT HEADER
          </text>
          <text x="46" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0284c7">
            {params.plantDemandM3Min.toFixed(1)} m³/min
          </text>
          <text x="46" y="52" textAnchor="middle" fontSize="9" fill={leakHigh ? '#ef4444' : textMuted}>
            {blindMode ? 'Leaks: ???' : `Leaks: ${sol.leakFlowM3Min.toFixed(2)} m³/m`}
          </text>
        </g>
      </svg>
    </div>
  );
}
