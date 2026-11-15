import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { ValveParams, ValveTelemetry } from './valvePhysics';

interface ValveCutawaySvgProps {
  params: ValveParams;
  telemetry: ValveTelemetry;
}

const FLOW_PARTICLE_COUNT = 26;
const SWIRL_BUBBLE_COUNT = 16;
const LEAK_PARTICLE_COUNT = 14;

/** Evaluate a smooth S-curve flow path through the valve body (t in 0..1). */
function sampleFlowPath(
  t: number,
  laneOffset: number,
  valveType: ValveParams['valveType'],
  openNorm: number,
): { x: number; y: number; speedMult: number } {
  const x = 42 + t * 676; // 42 -> 718
  // Centerline dip/rise through globe bridge vs straight-through for gate/ball/butterfly
  let yCenter = 270;
  let speedMult = 1.0;

  if (valveType === 'globe') {
    // Globe S-turn: inlet (272) -> under bridge -> up through seat (x=380, y=268) -> outlet (272)
    const distFromSeat = Math.abs(x - 380);
    if (distFromSeat < 110) {
      const u = (x - 380) / 110; // -1..1
      // Vena contracta acceleration near seat
      const throttleBoost = 1 + (1 - Math.min(0.95, openNorm)) * 1.9;
      speedMult = 1 + Math.exp(-u * u * 5.5) * throttleBoost;
      // S-curve vertical path
      yCenter = 272 - Math.sin(u * Math.PI) * 14 - Math.exp(-u * u * 4) * 8;
    }
  } else {
    const distFromSeat = Math.abs(x - 380);
    if (distFromSeat < 85) {
      const u = (x - 380) / 85;
      const throttleBoost = 1 + (1 - Math.min(0.95, openNorm)) * 1.6;
      speedMult = 1 + Math.exp(-u * u * 5) * throttleBoost;
    }
  }

  // Converge streamlines toward vena contracta near x = 380
  const constrict =
    1 - 0.58 * Math.exp(-Math.pow((x - 380) / 55, 2)) * (1 - 0.45 * openNorm);
  const y = yCenter + laneOffset * constrict;

  return { x, y, speedMult };
}

export function ValveCutawaySvg({ params, telemetry }: ValveCutawaySvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const stateRef = useRef({ params, telemetry });
  useEffect(() => {
    stateRef.current = { params, telemetry };
  }, [params, telemetry]);

  // Direct DOM refs for zero-rerender 60fps animation
  const streamline1Ref = useRef<SVGPathElement | null>(null);
  const streamline2Ref = useRef<SVGPathElement | null>(null);
  const streamline3Ref = useRef<SVGPathElement | null>(null);
  const seatJetRef = useRef<SVGPathElement | null>(null);
  const particleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const swirlRefs = useRef<(SVGCircleElement | null)[]>([]);
  const leakRefs = useRef<(SVGCircleElement | null)[]>([]);
  const leakWispRefs = useRef<(SVGPathElement | null)[]>([]);

  const animRef = useRef({
    streamDash: 0,
    leakDash: 0,
    particleT: Array.from(
      { length: FLOW_PARTICLE_COUNT },
      (_, i) => i / FLOW_PARTICLE_COUNT,
    ),
    swirlT: Array.from(
      { length: SWIRL_BUBBLE_COUNT },
      (_, i) => i / SWIRL_BUBBLE_COUNT,
    ),
    leakT: Array.from(
      { length: LEAK_PARTICLE_COUNT },
      (_, i) => i / LEAK_PARTICLE_COUNT,
    ),
  });

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const { params: p, telemetry: t } = stateRef.current;
      const openNorm = p.openingPct / 100;
      const isClosed = p.openingPct <= 0;
      const isPassingSeat = p.fault === 'passing-seat' || t.seatLeakRateLh > 0.5;
      const isLeaking =
        t.status === 'Fugitive Leak' ||
        t.packingStressMpa < t.requiredStressMpa ||
        t.packingLeakRateMlMin > 0.1;

      const anim = animRef.current;
      const activeMainFlow = !isClosed && t.flowM3h > 0.15;
      const baseSpeed = activeMainFlow
        ? Math.min(0.75, 0.14 + (t.flowM3h / 140) * 0.45)
        : 0;

      // 1. Streamline dash offset
      if (activeMainFlow) {
        anim.streamDash = (anim.streamDash - dt * (40 + baseSpeed * 120)) % 36;
      }
      [streamline1Ref.current, streamline2Ref.current, streamline3Ref.current].forEach(
        (el) => {
          if (!el) return;
          el.style.display = activeMainFlow ? 'inline' : 'none';
          if (activeMainFlow) {
            el.setAttribute('stroke-dashoffset', anim.streamDash.toFixed(2));
          }
        },
      );

      // Passing seat jet
      if (seatJetRef.current) {
        seatJetRef.current.style.display = isPassingSeat ? 'inline' : 'none';
        if (isPassingSeat) {
          anim.leakDash = (anim.leakDash - dt * 52) % 24;
          seatJetRef.current.setAttribute(
            'stroke-dashoffset',
            anim.leakDash.toFixed(2),
          );
        }
      }

      // 2. Velocity-scaled flow particles accelerating through vena contracta
      const laneOffsets = [-14, -5, 4, 13];
      for (let i = 0; i < FLOW_PARTICLE_COUNT; i++) {
        const el = particleRefs.current[i];
        if (!el) continue;
        if (!activeMainFlow) {
          el.style.display = 'none';
          continue;
        }
        el.style.display = 'inline';
        const lane = laneOffsets[i % laneOffsets.length];
        const curT = anim.particleT[i];
        const sample = sampleFlowPath(curT, lane, p.valveType, openNorm);
        const nextT = (curT + dt * baseSpeed * sample.speedMult) % 1;
        anim.particleT[i] = nextT;
        const pos = sampleFlowPath(nextT, lane, p.valveType, openNorm);
        el.setAttribute('cx', pos.x.toFixed(1));
        el.setAttribute('cy', pos.y.toFixed(1));
        const r = pos.speedMult > 1.35 ? 3.2 : 2.5;
        el.setAttribute('r', r.toFixed(1));
        el.setAttribute(
          'opacity',
          pos.speedMult > 1.35 ? '0.95' : '0.72',
        );
      }

      // 3. Downstream turbulent swirl / cavitation micro-bubbles when throttled at high ΔP
      const showSwirl =
        activeMainFlow && p.openingPct > 0 && p.openingPct < 65 && t.deltaPBar > 2.5;
      const swirlIntensity = showSwirl
        ? Math.min(1, ((65 - p.openingPct) / 65) * (t.deltaPBar / 10))
        : 0;
      for (let i = 0; i < SWIRL_BUBBLE_COUNT; i++) {
        const el = swirlRefs.current[i];
        if (!el) continue;
        if (!showSwirl || swirlIntensity < 0.12) {
          el.style.display = 'none';
          continue;
        }
        el.style.display = 'inline';
        const curT = (anim.swirlT[i] + dt * (0.45 + swirlIntensity * 0.65)) % 1;
        anim.swirlT[i] = curT;
        const x = 408 + curT * 145;
        const eddyAngle = curT * Math.PI * 5 + i * 1.4;
        const amp = (6 + curT * 16) * swirlIntensity;
        const y = 270 + Math.sin(eddyAngle) * amp;
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('r', (1.4 + (1 - curT) * 2.0).toFixed(1));
        el.setAttribute('opacity', ((1 - curT) * 0.78 * swirlIntensity).toFixed(2));
      }

      // 4. Stem-packing fugitive leak wisps & rising vapor/drip particles
      if (!isPassingSeat) {
        anim.leakDash = (anim.leakDash - dt * 36) % 24;
      }
      leakWispRefs.current.forEach((el) => {
        if (!el) return;
        el.style.display = isLeaking ? 'inline' : 'none';
        if (isLeaking) {
          el.setAttribute('stroke-dashoffset', anim.leakDash.toFixed(2));
        }
      });

      for (let i = 0; i < LEAK_PARTICLE_COUNT; i++) {
        const el = leakRefs.current[i];
        if (!el) continue;
        if (!isLeaking) {
          el.style.display = 'none';
          continue;
        }
        el.style.display = 'inline';
        const curT = (anim.leakT[i] + dt * 0.75) % 1;
        anim.leakT[i] = curT;
        const side = i % 2 === 0 ? -1 : 1;
        const x = 380 + side * (14 + curT * 28 + Math.sin(curT * 6 + i) * 5);
        const y = 104 - curT * 68;
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('r', (2.0 + curT * 2.4).toFixed(1));
        el.setAttribute('opacity', ((1 - curT) * 0.82).toFixed(2));
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const palette = {
    bg: isDark ? '#0f172a' : '#f8fafc',
    grid: isDark ? '#1e293b' : '#e2e8f0',
    castBody: isDark ? '#1e293b' : '#cbd5e1',
    castBonnet: isDark ? '#283548' : '#dbe3ec',
    castStroke: isDark ? '#64748b' : '#475569',
    cavity: isDark ? '#090f1d' : '#ffffff',
    flange: isDark ? '#334155' : '#cbd5e1',
    gland: isDark ? '#475569' : '#94a3b8',
    stemDark: isDark ? '#64748b' : '#64748b',
    stemMid: isDark ? '#cbd5e1' : '#e2e8f0',
    hatchBody: isDark ? '#475569' : '#94a3b8',
    hatchBonnet: isDark ? '#64748b' : '#64748b',
    text: isDark ? '#e2e8f0' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#475569',
    panel: isDark ? '#1e293b' : '#ffffff',
    panelBorder: isDark ? '#334155' : '#cbd5e1',
  };

  const fluidColor =
    params.fluidService === 'steam'
      ? isDark
        ? '#bae6fd'
        : '#0284c7'
      : params.fluidService === 'water'
        ? isDark
          ? '#38bdf8'
          : '#0284c7'
        : isDark
          ? '#fbbf24'
          : '#d97706';

  const fluidSoft =
    params.fluidService === 'steam'
      ? isDark
        ? 'rgba(186, 230, 253, 0.14)'
        : 'rgba(14, 165, 233, 0.12)'
      : params.fluidService === 'water'
        ? isDark
          ? 'rgba(56, 189, 248, 0.16)'
          : 'rgba(2, 132, 199, 0.12)'
        : isDark
          ? 'rgba(251, 191, 36, 0.16)'
          : 'rgba(217, 119, 6, 0.12)';

  const openNorm = params.openingPct / 100;
  const stemLiftPx =
    params.valveType === 'globe' || params.valveType === 'gate'
      ? openNorm * 34
      : 0;

  // Gland follower compression
  const effectiveTorque =
    params.fault === 'under-tightened'
      ? 10
      : params.fault === 'over-tightened'
        ? 72
        : params.glandTorqueNm;
  const glandCompNorm = Math.max(0, Math.min(1, (effectiveTorque - 5) / 75));
  const glandDropPx = glandCompNorm * 11;

  const wearNorm = params.packingWearCycles / 100000;
  const ringHeight = 8.2 - glandCompNorm * 2.0 - wearNorm * 1.0;
  const ringBaseY = 186;

  const isLeaking =
    telemetry.status === 'Fugitive Leak' ||
    telemetry.packingStressMpa < telemetry.requiredStressMpa ||
    telemetry.packingLeakRateMlMin > 0.1;
  const leakSeverity = Math.max(
    0.2,
    Math.min(1, telemetry.packingLeakRateMlMin / 25),
  );
  const isBinding = telemetry.status === 'Stem Binding Risk';
  const isPassingSeat =
    params.fault === 'passing-seat' || telemetry.seatLeakRateLh > 0.5;

  const wheelAngleRad = openNorm * Math.PI * 6;
  const wheelMarkerX = 380 + Math.sin(wheelAngleRad) * 42;

  const packingColor = isBinding
    ? isDark
      ? '#ef4444'
      : '#dc2626'
    : wearNorm > 0.65
      ? '#57534e'
      : isDark
        ? '#a8a29e'
        : '#78716c';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ISO 128 Valve &amp; Stuffing Box Cutaway
          </span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {params.valveType.toUpperCase()} • {params.openingPct}% OPEN
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: fluidColor }}
            />
            {params.fluidService === 'steam'
              ? 'Steam'
              : params.fluidService === 'water'
                ? 'Water'
                : 'Thermal Oil'}
          </span>
          {isLeaking && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              Fugitive Leak
            </span>
          )}
          {isBinding && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800 dark:bg-red-500/20 dark:text-red-300">
              Stem Binding
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox="0 0 760 410"
        className="h-auto max-h-[480px] w-full select-none"
        role="img"
        aria-label="Industrial cast-steel valve cutaway showing ANSI flanges, bonnet, Acme stem, packing rings, and live fluid flow"
      >
        <defs>
          {/* ISO 128 ±45° Section Hatching Patterns */}
          <pattern
            id="vpHatchBody"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={palette.hatchBody}
              strokeWidth="1.2"
              opacity="0.45"
            />
          </pattern>
          <pattern
            id="vpHatchBonnet"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={palette.hatchBonnet}
              strokeWidth="1.2"
              opacity="0.45"
            />
          </pattern>
          <linearGradient id="vpStemGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.stemDark} />
            <stop offset="45%" stopColor={palette.stemMid} />
            <stop offset="100%" stopColor={palette.stemDark} />
          </linearGradient>
          <clipPath id="vpUpperStemClip">
            <rect x="371" y="48" width="18" height="44" />
          </clipPath>
          <marker
            id="vpFlowArrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={fluidColor} />
          </marker>
        </defs>

        {/* Background & Blueprint Grid */}
        <rect x="0" y="0" width="760" height="410" fill={palette.bg} />
        <g opacity={isDark ? 0.28 : 0.45} stroke={palette.grid} strokeWidth="0.7">
          {[80, 160, 240, 320].map((y) => (
            <line key={y} x1="0" y1={y} x2="760" y2={y} />
          ))}
          {[150, 300, 450, 600].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="410" />
          ))}
        </g>

        {/* Left & Right Process Pipe Spools */}
        <rect
          x="26"
          y="236"
          width="162"
          height="72"
          fill={palette.cavity}
          stroke={palette.castStroke}
          strokeWidth="2.5"
        />
        <rect
          x="572"
          y="236"
          width="162"
          height="72"
          fill={palette.cavity}
          stroke={palette.castStroke}
          strokeWidth="2.5"
        />

        {/* Cast-Steel Valve Body Wall with ISO 128 +45° Hatching */}
        <path
          d="M 196 226 H 254 L 284 196 H 476 L 506 226 H 564 V 318 H 506 L 474 348 H 286 L 254 318 H 196 Z"
          fill={palette.castBody}
          stroke={palette.castStroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 196 226 H 254 L 284 196 H 476 L 506 226 H 564 V 318 H 506 L 474 348 H 286 L 254 318 H 196 Z"
          fill="url(#vpHatchBody)"
        />

        {/* Internal Flow Cavity Cutout */}
        <path
          d="M 28 242 H 264 L 294 214 H 466 L 496 242 H 732 V 302 H 496 L 466 330 H 294 L 264 302 H 28 Z"
          fill={palette.cavity}
        />
        {/* Fluid Background Tint inside Pipe & Cavity */}
        <path
          d="M 28 242 H 264 L 294 214 H 466 L 496 242 H 732 V 302 H 496 L 466 330 H 294 L 264 302 H 28 Z"
          fill={fluidSoft}
        />

        {/* Globe Valve Internal Bridge Diaphragm */}
        {params.valveType === 'globe' && (
          <g>
            <path
              d="M 284 242 H 344 V 280 H 284 Z"
              fill={palette.castBody}
              stroke={palette.castStroke}
              strokeWidth="1.5"
            />
            <path
              d="M 416 266 H 476 V 302 H 416 Z"
              fill={palette.castBody}
              stroke={palette.castStroke}
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Bolted ANSI Raised-Face Inlet & Outlet Flanges */}
        {[184, 560].map((fx, idx) => (
          <g key={idx}>
            {/* Flange body */}
            <rect
              x={fx}
              y="206"
              width="16"
              height="132"
              rx="2"
              fill={palette.flange}
              stroke={palette.castStroke}
              strokeWidth="2"
            />
            {/* Raised-face & spiral-wound gasket */}
            <rect
              x={idx === 0 ? fx - 4 : fx + 16}
              y="230"
              width="4"
              height="84"
              fill="#eab308"
              stroke={palette.castStroke}
              strokeWidth="1"
            />
            {/* Top & Bottom Flange Stud Bolts + Hex Nuts */}
            {[215, 323].map((by) => (
              <g key={by}>
                <rect
                  x={fx - 8}
                  y={by}
                  width="32"
                  height="6"
                  rx="1"
                  fill={palette.stemDark}
                />
                <rect
                  x={fx - 6}
                  y={by - 2}
                  width="7"
                  height="10"
                  rx="1"
                  fill={palette.gland}
                  stroke={palette.castStroke}
                  strokeWidth="1"
                />
                <rect
                  x={fx + 15}
                  y={by - 2}
                  width="7"
                  height="10"
                  rx="1"
                  fill={palette.gland}
                  stroke={palette.castStroke}
                  strokeWidth="1"
                />
              </g>
            ))}
          </g>
        ))}

        {/* Bolted Bonnet Flange + Gasket + Studs */}
        <rect
          x="294"
          y="188"
          width="172"
          height="12"
          rx="2"
          fill={palette.flange}
          stroke={palette.castStroke}
          strokeWidth="2"
        />
        <rect x="304" y="198" width="152" height="3" fill="#eab308" />
        {[304, 448].map((bx) => (
          <g key={bx}>
            <rect x={bx} y="180" width="8" height="24" fill={palette.stemDark} />
            <rect
              x={bx - 2}
              y="182"
              width="12"
              height="6"
              rx="1"
              fill={palette.gland}
              stroke={palette.castStroke}
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Bonnet & Stuffing Box Housing with ISO 128 -45° Hatching */}
        <rect
          x="328"
          y="108"
          width="104"
          height="80"
          rx="3"
          fill={palette.castBonnet}
          stroke={palette.castStroke}
          strokeWidth="2"
        />
        <rect
          x="328"
          y="108"
          width="104"
          height="80"
          rx="3"
          fill="url(#vpHatchBonnet)"
        />

        {/* Machined Stuffing Box Bore */}
        <rect
          x="347"
          y="112"
          width="66"
          height="76"
          fill={palette.cavity}
          stroke={palette.castStroke}
          strokeWidth="1.5"
        />

        {/* Yoke Arms & Upper Yoke Bushing */}
        <path
          d="M 332 108 L 346 42 H 414 L 428 108"
          fill="none"
          stroke={palette.castStroke}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <rect
          x="356"
          y="36"
          width="48"
          height="14"
          rx="3"
          fill={palette.flange}
          stroke={palette.castStroke}
          strokeWidth="1.8"
        />

        {/* Stacked Packing Rings (4 braided PTFE/graphite + 1 central brass lantern ring) */}
        {[0, 1, 2, 3, 4].map((idx) => {
          const isLantern = idx === 2;
          const yPos = ringBaseY - (idx + 1) * (ringHeight + 1.4);
          const bulge = isLantern ? 0 : glandCompNorm * 2.5;
          const ringRx = isLantern ? 1 : 1.5 + glandCompNorm * 2.2;
          return (
            <g key={idx}>
              <rect
                x={349 - bulge * 0.35}
                y={yPos}
                width={21 + bulge}
                height={ringHeight}
                rx={ringRx}
                fill={isLantern ? '#eab308' : packingColor}
                stroke={isDark ? '#1e293b' : '#44403c'}
                strokeWidth="1"
              />
              <rect
                x={390 - bulge * 0.65}
                y={yPos}
                width={21 + bulge}
                height={ringHeight}
                rx={ringRx}
                fill={isLantern ? '#eab308' : packingColor}
                stroke={isDark ? '#1e293b' : '#44403c'}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Fixed Gland Studs anchored to Bonnet */}
        <rect x="318" y="74" width="7" height="36" fill={palette.stemDark} />
        <rect x="435" y="74" width="7" height="36" fill={palette.stemDark} />

        {/* Bolted Gland Follower + Hex Nuts (slides down as torque increases) */}
        <g transform={`translate(0, ${glandDropPx})`}>
          <rect
            x="350"
            y="98"
            width="60"
            height="32"
            rx="2"
            fill={palette.gland}
            stroke={palette.castStroke}
            strokeWidth="1.5"
          />
          <rect
            x="308"
            y="90"
            width="144"
            height="12"
            rx="2.5"
            fill={palette.flange}
            stroke={palette.castStroke}
            strokeWidth="1.8"
          />
          <rect
            x="314"
            y="80"
            width="15"
            height="10"
            rx="1.5"
            fill={isBinding ? '#ef4444' : isLeaking ? '#f59e0b' : '#10b981'}
            stroke={palette.castStroke}
            strokeWidth="1.2"
          />
          <rect
            x="431"
            y="80"
            width="15"
            height="10"
            rx="1.5"
            fill={isBinding ? '#ef4444' : isLeaking ? '#f59e0b' : '#10b981'}
            stroke={palette.castStroke}
            strokeWidth="1.2"
          />
        </g>

        {/* Valve Stem + Acme Threads + Handwheel + Trim */}
        <g transform={`translate(0, ${-stemLiftPx})`}>
          {/* Polished Lower Stem & Upper Acme Stem */}
          <rect
            x="371"
            y="48"
            width="18"
            height="210"
            fill="url(#vpStemGrad)"
            stroke={palette.castStroke}
            strokeWidth="1.4"
          />
          {/* Acme thread lines on upper stem */}
          <g clipPath="url(#vpUpperStemClip)" stroke={palette.castStroke} strokeWidth="1">
            {[52, 58, 64, 70, 76, 82, 88].map((ty) => (
              <line key={ty} x1="370" y1={ty} x2="390" y2={ty + 3} />
            ))}
          </g>

          {/* Synchronized Rotating Handwheel */}
          <g>
            <rect
              x="356"
              y="38"
              width="48"
              height="10"
              rx="3"
              fill={palette.flange}
              stroke={palette.castStroke}
              strokeWidth="1.8"
            />
            <line
              x1="330"
              y1="43"
              x2="430"
              y2="43"
              stroke={palette.castStroke}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle
              cx={wheelMarkerX}
              cy="43"
              r="4.2"
              fill="#10b981"
              stroke={palette.cavity}
              strokeWidth="1.4"
            />
          </g>

          {/* Precision Trim by Valve Type */}
          {params.valveType === 'globe' && (
            <g>
              <path
                d="M 352 256 H 408 L 402 268 Q 388 276 380 284 Q 372 276 358 268 Z"
                fill={palette.flange}
                stroke={palette.castStroke}
                strokeWidth="2"
              />
              <line
                x1="366"
                y1="260"
                x2="372"
                y2="273"
                stroke={palette.castStroke}
                strokeWidth="1.2"
              />
              <line
                x1="394"
                y1="260"
                x2="388"
                y2="273"
                stroke={palette.castStroke}
                strokeWidth="1.2"
              />
            </g>
          )}

          {params.valveType === 'gate' && (
            <path
              d="M 356 246 H 404 L 398 298 H 362 Z"
              fill={palette.flange}
              stroke={palette.castStroke}
              strokeWidth="2"
            />
          )}

          {params.valveType === 'ball' && (
            <g transform="translate(380, 272)">
              <circle
                cx="0"
                cy="0"
                r="26"
                fill={palette.flange}
                stroke={palette.castStroke}
                strokeWidth="2"
              />
              <rect
                x="-26"
                y={-11 * openNorm - 2}
                width="52"
                height={Math.max(4, 22 * openNorm)}
                rx="3"
                fill={fluidSoft}
                stroke={palette.castStroke}
                strokeWidth="1"
              />
            </g>
          )}

          {params.valveType === 'butterfly' && (
            <g transform={`translate(380, 272) rotate(${90 - openNorm * 85})`}>
              <ellipse
                cx="0"
                cy="0"
                rx="6.5"
                ry="28"
                fill={palette.flange}
                stroke={palette.castStroke}
                strokeWidth="2"
              />
            </g>
          )}
        </g>

        {/* Hardened Seat Ring */}
        <rect
          x="344"
          y="278"
          width="14"
          height="10"
          fill={isPassingSeat ? '#ef4444' : '#64748b'}
          stroke={palette.castStroke}
          strokeWidth="1"
        />
        <rect
          x="402"
          y="278"
          width="14"
          height="10"
          fill={isPassingSeat ? '#ef4444' : '#64748b'}
          stroke={palette.castStroke}
          strokeWidth="1"
        />

        {/* Animated Fluid Streamlines (updated via rAF refs) */}
        <path
          ref={streamline1Ref}
          d="M 42 258 H 265 Q 325 258 345 245 Q 380 226 415 245 Q 435 258 495 258 H 715"
          fill="none"
          stroke={fluidColor}
          strokeWidth="2"
          strokeDasharray="10 8"
          markerEnd="url(#vpFlowArrow)"
          opacity="0.78"
        />
        <path
          ref={streamline2Ref}
          d="M 42 272 H 265 Q 325 272 348 260 Q 380 245 412 260 Q 435 272 495 272 H 715"
          fill="none"
          stroke={fluidColor}
          strokeWidth="2.4"
          strokeDasharray="12 8"
          opacity="0.88"
        />
        <path
          ref={streamline3Ref}
          d="M 42 286 H 265 Q 325 286 350 275 Q 380 264 410 275 Q 435 286 495 286 H 715"
          fill="none"
          stroke={fluidColor}
          strokeWidth="1.8"
          strokeDasharray="8 10"
          opacity="0.65"
        />

        {/* Velocity-Scaled Flow Particles */}
        {Array.from({ length: FLOW_PARTICLE_COUNT }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              particleRefs.current[i] = el;
            }}
            cx="42"
            cy="272"
            r="2.5"
            fill={fluidColor}
            style={{ display: 'none' }}
          />
        ))}

        {/* Downstream Turbulent Swirl / Cavitation Micro-Bubbles */}
        {Array.from({ length: SWIRL_BUBBLE_COUNT }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              swirlRefs.current[i] = el;
            }}
            cx="420"
            cy="272"
            r="1.8"
            fill="none"
            stroke={fluidColor}
            strokeWidth="1.2"
            style={{ display: 'none' }}
          />
        ))}

        {/* Passing Seat / Blowing Steam Trap Jet & Box */}
        <path
          ref={seatJetRef}
          d="M 358 278 Q 380 288 402 278 L 445 286 H 680"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.2"
          strokeDasharray="6 6"
          style={{ display: 'none' }}
        />
        {isPassingSeat && (
          <g>
            <rect
              x="582"
              y="322"
              width="108"
              height="42"
              rx="6"
              fill={palette.panel}
              stroke="#ef4444"
              strokeWidth="1.8"
            />
            <text
              x="636"
              y="340"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="10"
              fontWeight="700"
            >
              {params.fluidService === 'steam'
                ? 'TRAP BLOWING!'
                : 'SEAT PASSING!'}
            </text>
            <text
              x="636"
              y="355"
              textAnchor="middle"
              fill={palette.muted}
              fontSize="9.5"
            >
              {telemetry.seatLeakRateLh.toFixed(1)} L/h bypass
            </text>
          </g>
        )}

        {/* Stem Binding / Friction Red Highlight */}
        {isBinding && (
          <g>
            <rect
              x="367"
              y="124"
              width="26"
              height="60"
              rx="4"
              fill="rgba(239, 68, 68, 0.28)"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <line
              x1="460"
              y1="146"
              x2="395"
              y2="150"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <rect
              x="460"
              y="134"
              width="176"
              height="22"
              rx="4"
              fill={palette.panel}
              stroke="#ef4444"
              strokeWidth="1.2"
            />
            <text
              x="548"
              y="149"
              textAnchor="middle"
              fill="#ef4444"
              fontSize="10.5"
              fontWeight="700"
            >
              STEM BINDING / SCORING
            </text>
          </g>
        )}

        {/* Fugitive Steam / Fluid Leak Wisps & Vapor Particles */}
        {[-1, 1].map((side, idx) => (
          <path
            key={side}
            ref={(el) => {
              leakWispRefs.current[idx] = el;
            }}
            d={`M ${380 + side * 20} 112 Q ${380 + side * 38} 88 ${380 + side * 30} 66 T ${380 + side * 46} 34`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={1.6 + leakSeverity * 1.6}
            strokeDasharray="6 6"
            strokeLinecap="round"
            opacity={0.45 + leakSeverity * 0.5}
            style={{ display: 'none' }}
          />
        ))}
        {Array.from({ length: LEAK_PARTICLE_COUNT }).map((_, i) => (
          <circle
            key={i}
            ref={(el) => {
              leakRefs.current[i] = el;
            }}
            cx="380"
            cy="104"
            r="2.2"
            fill="#f59e0b"
            style={{ display: 'none' }}
          />
        ))}
        {isLeaking && (
          <g>
            <rect
              x="460"
              y="92"
              width="186"
              height="22"
              rx="4"
              fill={palette.panel}
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            <text
              x="553"
              y="107"
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="10.5"
              fontWeight="700"
            >
              FUGITIVE LEAK ({telemetry.fugitivePpm} ppm)
            </text>
          </g>
        )}

        {/* CAD Callout Labels */}
        <g fontSize="10.5" fill={palette.muted} fontWeight="500">
          <text x="295" y="138" textAnchor="end">
            Gland Follower
          </text>
          <line
            x1="300"
            y1="135"
            x2="349"
            y2="118"
            stroke={palette.castStroke}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text x="295" y="168" textAnchor="end">
            PTFE / Graphite Rings
          </text>
          <line
            x1="300"
            y1="164"
            x2="348"
            y2="162"
            stroke={palette.castStroke}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <text x="64" y="224" fill={palette.text} fontWeight="600">
            INLET ({params.linePressureBar} bar)
          </text>
          <text x="614" y="224" fill={palette.text} fontWeight="600">
            OUTLET ({(params.linePressureBar - telemetry.deltaPBar).toFixed(1)} bar)
          </text>
        </g>

        {/* Bottom Telemetry Strip inside SVG */}
        <rect
          x="24"
          y="362"
          width="542"
          height="34"
          rx="8"
          fill={palette.panel}
          stroke={palette.panelBorder}
          strokeWidth="1.2"
        />
        <text x="38" y="383" fontSize="11" fontWeight="600" fill={palette.text}>
          Cv: {telemetry.effectiveCv.toFixed(1)} / {telemetry.cvMax}
        </text>
        <text x="168" y="383" fontSize="11" fontWeight="600" fill={palette.text}>
          Stress: {telemetry.packingStressMpa.toFixed(1)} MPa (Req:{' '}
          {telemetry.requiredStressMpa.toFixed(1)})
        </text>
        <text x="428" y="383" fontSize="11" fontWeight="600" fill={palette.text}>
          Friction: {telemetry.stemFrictionN.toFixed(0)} N
        </text>
      </svg>
    </div>
  );
}
