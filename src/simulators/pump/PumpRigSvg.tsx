import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { PumpOperatingPoint, PumpParams } from './pumpPhysics';

interface PumpRigSvgProps {
  params: PumpParams;
  op: PumpOperatingPoint;
}

const GAUGE_TICKS = [-130, -97.5, -65, -32.5, 0, 32.5, 65, 97.5, 130];

export function PumpRigSvg({ params, op }: PumpRigSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [impellerAngle, setImpellerAngle] = useState(0);
  const [flowPhase, setFlowPhase] = useState(0);
  const [cavPhase, setCavPhase] = useState(0);
  const lastTimeRef = useRef<number | null>(null);
  const liveKinematicsRef = useRef({
    rpm: params.rpm,
    flowM3h: op.flowM3h,
    isCavitating: op.isCavitating,
    isDeadHead: op.isDeadHead,
  });

  useEffect(() => {
    liveKinematicsRef.current = {
      rpm: params.rpm,
      flowM3h: op.flowM3h,
      isCavitating: op.isCavitating,
      isDeadHead: op.isDeadHead,
    };
  }, [params.rpm, op.flowM3h, op.isCavitating, op.isDeadHead]);

  useEffect(() => {
    let rafId = 0;
    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
        const { rpm, flowM3h, isCavitating, isDeadHead } =
          liveKinematicsRef.current;

        // Continuous impeller rotation strictly scaled to VFD RPM
        const degPerSec = (rpm / 1750) * 360;
        setImpellerAngle((prev) => prev + degPerSec * dt);

        // Flow particles strictly proportional to op.flowM3h (0 at dead-head)
        const flowSpeed = flowM3h > 0.5 ? (flowM3h / 100) * 1.15 : 0;
        if (flowSpeed > 0) {
          setFlowPhase((prev) => (prev + flowSpeed * dt) % 1);
        }

        if (isCavitating || isDeadHead) {
          setCavPhase((prev) => prev + 2.4 * dt);
        }
      }
      lastTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Theme palette
  const palette = {
    bg: 'var(--md-surface-container-low)',
    panel: 'var(--md-surface-container)',
    stroke: 'var(--md-outline-variant)',
    pipeFill: isDark ? '#1e293b' : '#e2e8f0',
    pipeStroke: isDark ? '#64748b' : '#475569',
    text: 'var(--md-on-surface)',
    muted: 'var(--md-on-surface-variant)',
    casing: isDark ? '#334155' : '#cbd5e1',
    casingStroke: isDark ? '#94a3b8' : '#334155',
    impeller: 'var(--md-primary)',
    gaugeFace: 'var(--md-surface-container-lowest)',
    gaugeRing: 'var(--md-outline)',
    hatch: isDark ? 'rgba(148,163,184,0.22)' : 'rgba(51,65,85,0.18)',
  };

  // Water color shifts warmer at high temperature
  const tempRatio = Math.max(0, Math.min(1, (params.fluidTempC - 15) / 80));
  const waterColor =
    tempRatio > 0.65
      ? isDark
        ? 'rgba(251, 146, 60, 0.45)'
        : 'rgba(251, 146, 60, 0.35)'
      : isDark
        ? 'rgba(34, 211, 238, 0.38)'
        : 'rgba(6, 182, 212, 0.32)';

  const fluidLineColor = op.isCavitating
    ? '#f59e0b'
    : op.isDeadHead
      ? '#ef4444'
      : '#06b6d4';

  // Suction tank water level y: Hs = 0.0 m aligns EXACTLY with pump centerline (y = 160)
  // Hs in [-4.5, +6.0] at 13 px/m -> +6.0 m = y 82, 0.0 m = y 160, -4.5 m = y 218.5
  const waterTopY = Math.max(60, Math.min(218, 160 - params.suctionHead * 13));

  // Subtle vibration offset when cavitating or dead-heading
  const jitterX =
    op.isCavitating || op.isDeadHead
      ? Math.sin(cavPhase * Math.PI * 16) * (op.isCavitating ? 1.8 : 1.1)
      : 0;
  const jitterY =
    op.isCavitating || op.isDeadHead
      ? Math.cos(cavPhase * Math.PI * 14) * (op.isCavitating ? 1.4 : 0.9)
      : 0;

  // Gauge needle angles (-130 deg to +130 deg)
  const psNorm = Math.max(0, Math.min(1, (op.suctionPressureKpa + 60) / 160));
  const psAngle = -130 + psNorm * 260;

  const pdNorm = Math.max(0, Math.min(1, op.dischargePressureKpa / 1000));
  const pdAngle = -130 + pdNorm * 260;

  // Valve gate visual height (0% = full closed bar, 100% = fully open) & rising stem lift
  const valveGap = (params.valveOpening / 100) * 16;
  const stemLift = (params.valveOpening / 100) * 7;

  // Seal indicator color
  const sealColor =
    op.sealRisk === 'critical'
      ? '#ef4444'
      : op.sealRisk === 'elevated'
        ? '#f59e0b'
        : '#10b981';

  // Flow particles along suction (x: 132 -> 255, y: 160) and discharge (x: 315, y: 125 -> 60 -> x: 560)
  const suctionParticles = [0, 0.25, 0.5, 0.75].map((offset) => {
    const t = (flowPhase + offset) % 1;
    return { x: 136 + t * 116, y: 160 };
  });

  const dischargeParticles = [0, 0.2, 0.4, 0.6, 0.8].map((offset) => {
    const t = (flowPhase + offset) % 1;
    if (t < 0.35) {
      const seg = t / 0.35;
      return { x: 315, y: 120 - seg * 60 };
    }
    const seg = (t - 0.35) / 0.65;
    return { x: 315 + seg * 245, y: 60 };
  });

  // Cavitation bubbles at impeller eye when cavitating
  const cavBubbles = op.isCavitating
    ? [0, 0.17, 0.33, 0.5, 0.67, 0.83].map((offset, idx) => {
        const t = (cavPhase + offset) % 1;
        const angle = idx * 1.05 + t * 2.2;
        const r = 6 + t * 22;
        return {
          cx: 285 + Math.cos(angle) * r,
          cy: 160 + Math.sin(angle) * r,
          r: 1.8 + Math.sin(t * Math.PI) * 2.4,
          opacity: 1 - t * 0.7,
        };
      })
    : [];

  return (
    <svg
      viewBox="0 0 620 290"
      className="h-auto w-full rounded-[20px] border border-[var(--md-outline-variant)]/60"
      style={{ background: palette.bg }}
      role="img"
      aria-label="Centrifugal pump test rig CAD diagram"
    >
      <defs>
        <pattern id="pump-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke={isDark ? 'rgba(148,163,184,0.06)' : 'rgba(15,23,42,0.04)'}
            strokeWidth="1"
          />
        </pattern>
        <pattern
          id="pumpAnsiHatch"
          width="6"
          height="6"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke={palette.hatch} strokeWidth="1.2" />
        </pattern>
        <linearGradient id="pumpPipeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#cbd5e1'} />
          <stop offset="45%" stopColor={isDark ? '#1e293b' : '#f1f5f9'} />
          <stop offset="100%" stopColor={isDark ? '#0f172a' : '#94a3b8'} />
        </linearGradient>
        <linearGradient id="pumpMotorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#94a3b8'} />
          <stop offset="40%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
        </linearGradient>
        <linearGradient id="pumpShaftGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      <rect width="620" height="290" fill="url(#pump-grid)" />

      {/* Structural Steel Skid Baseplate */}
      <g>
        <rect
          x="236"
          y="218"
          width="266"
          height="10"
          rx="2"
          fill={palette.casing}
          stroke={palette.casingStroke}
          strokeWidth="1.5"
        />
        <rect
          x="240"
          y="228"
          width="258"
          height="4"
          fill={palette.stroke}
          opacity="0.55"
        />
        {/* Anchor bolts */}
        {[246, 330, 405, 492].map((bx) => (
          <rect
            key={bx}
            x={bx}
            y="214"
            width="5"
            height="4"
            rx="1"
            fill={palette.casingStroke}
          />
        ))}
      </g>

      {/* Suction Tank with Sight-Glass & Vortex Baffle */}
      <g>
        {/* Top atmospheric vent */}
        <path
          d="M 76 55 L 76 47 L 88 47 L 88 55"
          fill="none"
          stroke={palette.stroke}
          strokeWidth="1.5"
        />
        <rect
          x="32"
          y="55"
          width="100"
          height="167"
          rx="6"
          fill={palette.panel}
          stroke={palette.stroke}
          strokeWidth="2"
        />
        {/* Water fill */}
        <rect
          x="34"
          y={waterTopY}
          width="96"
          height={Math.max(4, 220 - waterTopY)}
          rx="4"
          fill={waterColor}
        />
        {/* Water surface meniscus */}
        <line
          x1="34"
          y1={waterTopY}
          x2="130"
          y2={waterTopY}
          stroke={fluidLineColor}
          strokeWidth="2"
        />
        {/* External Sight-Glass Level Gauge */}
        <rect
          x="20"
          y="70"
          width="6"
          height="138"
          rx="2"
          fill={palette.panel}
          stroke={palette.stroke}
          strokeWidth="1.2"
        />
        <rect
          x="21.5"
          y={Math.max(71, waterTopY)}
          width="3"
          height={Math.max(2, 207 - Math.max(71, waterTopY))}
          fill={fluidLineColor}
          opacity="0.75"
        />
        {[82, 108, 134, 160, 186].map((ty) => (
          <line
            key={ty}
            x1="26"
            y1={ty}
            x2="32"
            y2={ty}
            stroke={palette.muted}
            strokeWidth="1"
          />
        ))}
        {/* Vortex breaker baffle near outlet */}
        <line
          x1="118"
          y1="146"
          x2="118"
          y2="174"
          stroke={palette.stroke}
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        {/* Pump centerline reference dashed line */}
        <line
          x1="32"
          y1="160"
          x2="132"
          y2="160"
          stroke={palette.muted}
          strokeDasharray="4 3"
          strokeWidth="1"
          opacity="0.65"
        />
        <text x="82" y="42" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={palette.text} fontFamily="var(--font-sans)">
          Suction Tank
        </text>
        <text x="82" y="240" textAnchor="middle" fontSize="10" fontWeight="600" fill={palette.muted} fontFamily="var(--font-mono)">
          Hs = {params.suctionHead >= 0 ? '+' : ''}
          {params.suctionHead.toFixed(1)} m · {params.fluidTempC}°C
        </text>
      </g>

      {/* Suction Pipe + Bolted Flanges */}
      <g>
        <rect
          x="132"
          y="151"
          width="112"
          height="18"
          fill="url(#pumpPipeGrad)"
          stroke={palette.pipeStroke}
          strokeWidth="1.5"
        />
        {/* Tank outlet ANSI flange */}
        <rect x="132" y="146" width="6" height="28" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        {/* Pump suction ANSI flange pair */}
        <rect x="236" y="146" width="5" height="28" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        <rect x="242" y="146" width="5" height="28" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        {op.flowM3h > 0.5 &&
          suctionParticles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={fluidLineColor} opacity="0.9" />
          ))}
      </g>

      {/* Discharge Pipe + Bolted Flanges */}
      <g>
        <path
          d="M 306 125 L 306 51 L 570 51 L 570 69 L 324 69 L 324 125 Z"
          fill="url(#pumpPipeGrad)"
          stroke={palette.pipeStroke}
          strokeWidth="1.5"
        />
        {/* Discharge nozzle flange pair */}
        <rect x="301" y="113" width="28" height="5" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        <rect x="301" y="119" width="28" height="5" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        {/* Valve flanges */}
        <rect x="415" y="46" width="5" height="28" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        <rect x="460" y="46" width="5" height="28" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />

        {op.flowM3h > 0.5 &&
          dischargeParticles.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={fluidLineColor} opacity="0.9" />
          ))}
        {/* Discharge arrow */}
        <polygon points="580,60 568,53 568,67" fill={op.flowM3h > 0.5 ? fluidLineColor : palette.muted} />
        <text x="540" y="39" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={palette.text} fontFamily="var(--font-mono)">
          Q = {op.flowM3h.toFixed(1)} m³/h
        </text>
      </g>

      {/* Rising-Stem Discharge Gate Valve at x=440, y=60 */}
      <g transform="translate(440, 60)">
        <rect x="-19" y="-14" width="38" height="28" rx="4" fill={palette.panel} stroke={palette.casingStroke} strokeWidth="1.8" />
        {/* Bolted bonnet */}
        <rect x="-10" y="-19" width="20" height="5" rx="1" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.2" />
        {/* Rising threaded valve stem & handwheel */}
        <line x1="0" y1="-19" x2="0" y2={-26 - stemLift} stroke={palette.casingStroke} strokeWidth="2.5" />
        <line x1="-13" y1={-26 - stemLift} x2="13" y2={-26 - stemLift} stroke="#ef4444" strokeWidth="3.2" strokeLinecap="round" />
        {/* Cutaway gate discs showing exact opening */}
        <rect x="-4" y={-9} width="8" height={Math.max(1, 9 - valveGap / 2)} fill="#f59e0b" />
        <rect x="-4" y={valveGap / 2} width="8" height={Math.max(1, 9 - valveGap / 2)} fill="#f59e0b" />
        <text x="0" y="29" textAnchor="middle" fontSize="10" fontWeight="600" fill={palette.text} fontFamily="var(--font-mono)">
          Valve {params.valveOpening}%
        </text>
      </g>

      {/* Pump Volute Cutaway, Seal Cartridge, Coupling & TEFC Motor */}
      <g transform={`translate(${jitterX}, ${jitterY})`}>
        {/* Pump Pedestal */}
        <path
          d="M 258 200 L 312 200 L 320 218 L 250 218 Z"
          fill={palette.casing}
          stroke={palette.casingStroke}
          strokeWidth="1.5"
        />
        {/* Discharge throat */}
        <rect x="303" y="124" width="24" height="22" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.6" />
        {/* Volute outer casing with ANSI section hatching */}
        <circle cx="285" cy="160" r="43" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="2.4" />
        <circle cx="285" cy="160" r="43" fill="url(#pumpAnsiHatch)" />
        {/* Inner volute spiral chamber + wear ring */}
        <circle
          cx="285"
          cy="160"
          r="34"
          fill={isDark ? '#0b1220' : '#f1f5f9'}
          stroke={op.isCavitating ? '#f59e0b' : op.isDeadHead ? '#ef4444' : palette.pipeStroke}
          strokeWidth={op.isCavitating || op.isDeadHead ? '2.4' : '1.6'}
        />

        {/* Rotating 6-Vane Impeller (scaled by impellerTrimPct) */}
        <g
          transform={`translate(285, 160) rotate(${impellerAngle}) scale(${params.impellerTrimPct / 100})`}
        >
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              d="M 0 0 Q 14 -7 27 -15"
              fill="none"
              stroke={palette.impeller}
              strokeWidth="4.2"
              strokeLinecap="round"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="9" fill={palette.casingStroke} stroke={palette.impeller} strokeWidth="2" />
          {/* Shaft nut & keyway detail */}
          <circle cx="0" cy="0" r="3.2" fill="#e2e8f0" />
        </g>

        {/* Cavitation vapor bubbles nucleating at impeller eye */}
        {cavBubbles.map((b, idx) => (
          <circle
            key={idx}
            cx={b.cx}
            cy={b.cy}
            r={b.r}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            opacity={b.opacity}
          />
        ))}

        {/* Mechanical Seal Cartridge & Bolted Gland Plate */}
        <rect x="328" y="146" width="24" height="28" rx="3" fill={palette.panel} stroke={sealColor} strokeWidth="2" />
        <rect x="331" y="143" width="4" height="34" rx="1" fill={palette.casingStroke} />
        <circle cx="342" cy="160" r="5" fill={sealColor} />
        {/* Chrome Shaft */}
        <rect x="352" y="155" width="46" height="10" fill="url(#pumpShaftGrad)" stroke={palette.pipeStroke} strokeWidth="0.8" />
        {/* Flexible Jaw Coupling & Guard */}
        <rect x="366" y="147" width="18" height="26" rx="2" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.4" />
        <line x1="375" y1="147" x2="375" y2="173" stroke="#f59e0b" strokeWidth="2" />

        {/* Finned TEFC Electric Drive Motor */}
        <rect x="398" y="135" width="84" height="50" rx="6" fill="url(#pumpMotorGrad)" stroke={palette.casingStroke} strokeWidth="2" />
        {/* Cooling fins */}
        {[408, 416, 424, 432, 440, 448, 456, 464].map((fx) => (
          <line
            key={fx}
            x1={fx}
            y1="137"
            x2={fx}
            y2="183"
            stroke={palette.casingStroke}
            strokeWidth="1"
            opacity="0.45"
          />
        ))}
        {/* Rear fan cowl */}
        <path
          d="M 482 137 L 494 142 L 494 178 L 482 183 Z"
          fill={palette.casing}
          stroke={palette.casingStroke}
          strokeWidth="1.5"
        />
        {/* Top terminal box */}
        <rect x="424" y="125" width="22" height="10" rx="2" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.4" />
        {/* Motor mounting feet */}
        <rect x="404" y="185" width="16" height="33" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.4" />
        <rect x="460" y="185" width="16" height="33" fill={palette.casing} stroke={palette.casingStroke} strokeWidth="1.4" />

        {/* Motor RPM & Power Badge */}
        <rect x="405" y="144" width="70" height="32" rx="8" fill={palette.panel} stroke={palette.stroke} strokeWidth="0.9" opacity="0.96" />
        <text x="440" y="158" textAnchor="middle" fontSize="10" fontWeight="700" fill={palette.text} fontFamily="var(--font-mono)">
          {params.rpm} RPM
        </text>
        <text x="440" y="171" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={palette.muted} fontFamily="var(--font-mono)">
          {op.shaftPowerKw.toFixed(1)} kW
        </text>

        {(params.parallelPumps || params.impellerTrimPct < 100) && (
          <text x="440" y="117" textAnchor="middle" fontSize="9" fontWeight="700" fill={palette.impeller} fontFamily="var(--font-mono)">
            {params.parallelPumps ? '2× PARALLEL' : ''}
            {params.parallelPumps && params.impellerTrimPct < 100 ? ' · ' : ''}
            {params.impellerTrimPct < 100 ? `Trim ${params.impellerTrimPct}%` : ''}
          </text>
        )}
        <text x="340" y="190" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={sealColor} fontFamily="var(--font-mono)">
          Seal: {op.sealRisk.toUpperCase()}
        </text>
      </g>

      {/* Suction Bourdon Pressure Gauge */}
      <g transform="translate(192, 102)">
        <line x1="0" y1="22" x2="0" y2="49" stroke={palette.gaugeRing} strokeWidth="2.2" />
        <circle cx="0" cy="0" r="23" fill={palette.gaugeFace} stroke={palette.gaugeRing} strokeWidth="2.2" />
        {GAUGE_TICKS.map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="-19"
            x2="0"
            y2="-15"
            stroke={deg >= 90 ? '#ef4444' : palette.muted}
            strokeWidth="1.3"
            transform={`rotate(${deg})`}
          />
        ))}
        <g transform={`rotate(${psAngle})`}>
          <line x1="0" y1="4" x2="0" y2="-16" stroke="var(--md-primary)" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="0" cy="0" r="3" fill={palette.text} />
        <text x="0" y="-28" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={palette.muted} fontFamily="var(--font-sans)">
          Ps (Suction)
        </text>
        <rect x="-26" y="25" width="52" height="15" rx="6" fill={palette.panel} stroke={palette.stroke} strokeWidth="1" />
        <text x="0" y="35.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={palette.text} fontFamily="var(--font-mono)">
          {op.suctionPressureKpa.toFixed(0)} kPa
        </text>
      </g>

      {/* Discharge Bourdon Pressure Gauge */}
      <g transform="translate(362, 92)">
        <line x1="-38" y1="0" x2="-23" y2="0" stroke={palette.gaugeRing} strokeWidth="2.2" />
        <circle cx="0" cy="0" r="23" fill={palette.gaugeFace} stroke={palette.gaugeRing} strokeWidth="2.2" />
        {GAUGE_TICKS.map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="-19"
            x2="0"
            y2="-15"
            stroke={deg >= 90 ? '#ef4444' : palette.muted}
            strokeWidth="1.3"
            transform={`rotate(${deg})`}
          />
        ))}
        <g transform={`rotate(${pdAngle})`}>
          <line x1="0" y1="4" x2="0" y2="-16" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </g>
        <circle cx="0" cy="0" r="3" fill={palette.text} />
        <text x="0" y="-28" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={palette.muted} fontFamily="var(--font-sans)">
          Pd (Disch)
        </text>
        <rect x="-28" y="25" width="56" height="15" rx="6" fill={palette.panel} stroke={palette.stroke} strokeWidth="1" />
        <text x="0" y="35.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={palette.text} fontFamily="var(--font-mono)">
          {op.dischargePressureKpa.toFixed(0)} kPa
        </text>
      </g>

      {/* Status Alert Pill */}
      <g transform="translate(510, 254)">
        <rect
          x="-90"
          y="-15"
          width="180"
          height="26"
          rx="13"
          fill={
            op.condition === 'optimal'
              ? isDark
                ? 'rgba(16,185,129,0.18)'
                : 'rgba(16,185,129,0.14)'
              : op.condition === 'cavitation' || op.condition === 'deadhead'
                ? isDark
                  ? 'rgba(239,68,68,0.22)'
                  : 'rgba(239,68,68,0.14)'
                : isDark
                  ? 'rgba(245,158,11,0.2)'
                  : 'rgba(245,158,11,0.14)'
          }
          stroke={
            op.condition === 'optimal'
              ? '#10b981'
              : op.condition === 'cavitation' || op.condition === 'deadhead'
                ? '#ef4444'
                : '#f59e0b'
          }
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="2"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="700"
          fontFamily="var(--font-sans)"
          fill={
            op.condition === 'optimal'
              ? isDark
                ? '#34d399'
                : '#047857'
              : op.condition === 'cavitation' || op.condition === 'deadhead'
                ? isDark
                  ? '#f87171'
                  : '#b91c1c'
                : isDark
                  ? '#fbbf24'
                  : '#b45309'
          }
        >
          {op.condition === 'optimal'
            ? 'NORMAL · NEAR BEP'
            : op.condition === 'cavitation'
              ? 'ALERT: CAVITATION!'
              : op.condition === 'deadhead'
                ? 'ALERT: DEAD-HEAD!'
                : op.condition === 'low-flow'
                  ? 'WARN: LOW FLOW'
                  : 'WARN: RUNOUT FLOW'}
        </text>
      </g>
    </svg>
  );
}
