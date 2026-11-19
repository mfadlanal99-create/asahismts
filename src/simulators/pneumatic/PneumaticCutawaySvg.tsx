import { useEffect, useId, useRef } from 'react';
import { barToPa, paToPsi } from '../../physics';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { PneumaticFaultType } from './pneumaticTypes';

export interface PneumaticCutawaySvgProps {
  compressorOn: boolean;
  supplyBar: number;
  frlInBar: number;
  frlOutBar: number;
  strokePct: number;
  boreMm: number;
  rodMm: number;
  pABar: number;
  pBBar: number;
  spoolPos: 0 | 1;
  isDoubleActing: boolean;
  fcvOpenPct: number;
  hasFcv: boolean;
  hasLimitSwitch: boolean;
  limitTripped: boolean;
  activeFault: PneumaticFaultType;
  totalNlMin: number;
  velocityPctPerSec: number;
  onShiftSpool: (targetPos: 0 | 1) => void;
}

type Pt = readonly [number, number];

function buildHelicalSpring(
  xCenter: number,
  yTop: number,
  yBottom: number,
  coils: number,
  halfW: number
): string {
  const h = yBottom - yTop;
  const pts: string[] = [`M ${xCenter} ${yTop.toFixed(1)}`];
  const segs = coils * 2;
  for (let i = 1; i < segs; i++) {
    const y = yTop + (i / segs) * h;
    const x = xCenter + (i % 2 === 1 ? -halfW : halfW);
    pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push(`L ${xCenter} ${yBottom.toFixed(1)}`);
  return pts.join(' ');
}

function buildHorizontalSpring(
  xLeft: number,
  xRight: number,
  yCenter: number,
  coils: number,
  halfH: number
): string {
  const w = Math.max(8, xRight - xLeft);
  const pts: string[] = [`M ${xLeft.toFixed(1)} ${yCenter}`];
  const segs = coils * 2;
  for (let i = 1; i < segs; i++) {
    const x = xLeft + (i / segs) * w;
    const y = yCenter + (i % 2 === 1 ? -halfH : halfH);
    pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push(`L ${xRight.toFixed(1)} ${yCenter}`);
  return pts.join(' ');
}

function samplePolyline(pts: readonly Pt[], frac: number): Pt {
  const f = ((frac % 1) + 1) % 1;
  let total = 0;
  const segLens: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segLens.push(len);
    total += len;
  }
  if (total <= 0) return pts[0];
  let target = f * total;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const local = segLens[i] > 0 ? target / segLens[i] : 0;
      return [
        pts[i][0] + (pts[i + 1][0] - pts[i][0]) * local,
        pts[i][1] + (pts[i + 1][1] - pts[i][1]) * local,
      ];
    }
    target -= segLens[i];
  }
  return pts[pts.length - 1];
}

const COMP_TO_FRL_PATH: readonly Pt[] = [
  [92, 360],
  [92, 344],
  [44, 344],
  [44, 286],
  [66, 286],
];

const FRL_TO_DCV_PATH: readonly Pt[] = [
  [234, 286],
  [254, 286],
  [254, 366],
  [385, 366],
  [385, 312],
];

const LINE_A_PATH: readonly Pt[] = [
  [348, 238],
  [348, 212],
  [277, 212],
  [277, 118],
];

const LINE_B_PATH: readonly Pt[] = [
  [422, 238],
  [422, 212],
  [493, 212],
  [493, 118],
];

export function PneumaticCutawaySvg({
  compressorOn,
  supplyBar,
  frlInBar,
  frlOutBar,
  strokePct,
  boreMm,
  rodMm,
  pABar,
  pBBar,
  spoolPos,
  isDoubleActing,
  fcvOpenPct,
  hasFcv,
  hasLimitSwitch,
  limitTripped,
  activeFault,
  totalNlMin,
  velocityPctPerSec,
  onShiftSpool,
}: PneumaticCutawaySvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const uid = useId().replace(/:/g, '');

  // Zero-rerender animation refs
  const compPistonRef = useRef<SVGRectElement | null>(null);
  const lubeDropRef = useRef<SVGCircleElement | null>(null);
  const supplyParticlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const dcvSupplyParticlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const lineAParticlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const lineBParticlesRef = useRef<(SVGCircleElement | null)[]>([]);
  const exhaustLeftPuffsRef = useRef<(SVGCircleElement | null)[]>([]);
  const exhaustRightPuffsRef = useRef<(SVGCircleElement | null)[]>([]);
  const pilotLeakPuffsRef = useRef<(SVGCircleElement | null)[]>([]);

  const stateRef = useRef({
    compressorOn,
    supplyBar,
    frlOutBar,
    pABar,
    pBBar,
    spoolPos,
    isDoubleActing,
    activeFault,
    totalNlMin,
    velocityPctPerSec,
  });

  useEffect(() => {
    stateRef.current = {
      compressorOn,
      supplyBar,
      frlOutBar,
      pABar,
      pBBar,
      spoolPos,
      isDoubleActing,
      activeFault,
      totalNlMin,
      velocityPctPerSec,
    };
  }, [
    compressorOn,
    supplyBar,
    frlOutBar,
    pABar,
    pBBar,
    spoolPos,
    isDoubleActing,
    activeFault,
    totalNlMin,
    velocityPctPerSec,
  ]);

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let phaseComp = 0;
    let phaseFlow = 0;
    let phaseExhaust = 0;
    let phaseLeak = 0;

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const st = stateRef.current;

      // 1. Compressor reciprocating piston
      if (st.compressorOn) {
        phaseComp = (phaseComp + dt * 14) % (Math.PI * 2);
      }
      if (compPistonRef.current) {
        const yOff = st.compressorOn ? Math.sin(phaseComp) * 3.5 : 0;
        compPistonRef.current.setAttribute('y', (343 + yOff).toFixed(1));
      }

      // 2. Flow particle phases scaled by real flow rate & piston velocity
      const moving = Math.abs(st.velocityPctPerSec) > 0.5;
      const flowSpeed =
        st.compressorOn && st.frlOutBar > 0.2
          ? 0.15 + Math.min(1.6, st.totalNlMin / 140)
          : 0;
      phaseFlow = (phaseFlow + dt * flowSpeed) % 1;
      phaseExhaust = (phaseExhaust + dt * (moving ? 1.45 : 0.4)) % 1;
      phaseLeak = (phaseLeak + dt * 1.6) % 1;

      const showSupply = st.compressorOn && st.supplyBar > 0.2 && (moving || st.activeFault === 'leaking_pilot');
      supplyParticlesRef.current.forEach((el, idx) => {
        if (!el) return;
        if (!showSupply) {
          el.setAttribute('opacity', '0');
          return;
        }
        const [x, y] = samplePolyline(
          COMP_TO_FRL_PATH,
          phaseFlow + idx / supplyParticlesRef.current.length
        );
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.9');
      });

      dcvSupplyParticlesRef.current.forEach((el, idx) => {
        if (!el) return;
        if (!showSupply) {
          el.setAttribute('opacity', '0');
          return;
        }
        const [x, y] = samplePolyline(
          FRL_TO_DCV_PATH,
          phaseFlow + idx / dcvSupplyParticlesRef.current.length
        );
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.9');
      });

      // Lubricator oil sight-dome drop
      if (lubeDropRef.current) {
        if (st.compressorOn && moving) {
          const dropPhase = (phaseFlow * 2.5) % 1;
          lubeDropRef.current.setAttribute('cy', (243 + dropPhase * 11).toFixed(1));
          lubeDropRef.current.setAttribute('opacity', (1 - dropPhase * 0.4).toFixed(2));
        } else {
          lubeDropRef.current.setAttribute('opacity', '0');
        }
      }

      // Line A & Line B flow particles (bidirectional)
      const extending = st.velocityPctPerSec > 0.5;
      const retracting = st.velocityPctPerSec < -0.5;
      lineAParticlesRef.current.forEach((el, idx) => {
        if (!el) return;
        if (!moving) {
          el.setAttribute('opacity', '0');
          return;
        }
        const base = phaseFlow + idx / lineAParticlesRef.current.length;
        const [x, y] = samplePolyline(LINE_A_PATH, extending ? base : 1 - base);
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.95');
      });

      lineBParticlesRef.current.forEach((el, idx) => {
        if (!el) return;
        if (!moving || !st.isDoubleActing) {
          el.setAttribute('opacity', '0');
          return;
        }
        const base = phaseFlow + idx / lineBParticlesRef.current.length;
        const [x, y] = samplePolyline(LINE_B_PATH, retracting ? base : 1 - base);
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.95');
      });

      // Sintered Brass Exhaust Silencer air puffs (5(EA) on retract, 3(EB) on extend)
      exhaustLeftPuffsRef.current.forEach((el, idx) => {
        if (!el) return;
        if (!retracting) {
          el.setAttribute('opacity', '0');
          return;
        }
        const p = (phaseExhaust + idx * 0.25) % 1;
        const spread = (idx - 1.5) * 4.5 * p;
        el.setAttribute('cx', (314 + spread).toFixed(1));
        el.setAttribute('cy', (348 + p * 26).toFixed(1));
        el.setAttribute('r', (2 + p * 3.5).toFixed(1));
        el.setAttribute('opacity', (0.75 * (1 - p)).toFixed(2));
      });

      exhaustRightPuffsRef.current.forEach((el, idx) => {
        if (!el) return;
        if (!extending || !st.isDoubleActing) {
          el.setAttribute('opacity', '0');
          return;
        }
        const p = (phaseExhaust + idx * 0.25) % 1;
        const spread = (idx - 1.5) * 4.5 * p;
        el.setAttribute('cx', (456 + spread).toFixed(1));
        el.setAttribute('cy', (348 + p * 26).toFixed(1));
        el.setAttribute('r', (2 + p * 3.5).toFixed(1));
        el.setAttribute('opacity', (0.75 * (1 - p)).toFixed(2));
      });

      // Pilot leak particles when leaking_pilot fault is active
      pilotLeakPuffsRef.current.forEach((el, idx) => {
        if (!el) return;
        if (st.activeFault !== 'leaking_pilot' || !st.compressorOn) {
          el.setAttribute('opacity', '0');
          return;
        }
        const p = (phaseLeak + idx * 0.2) % 1;
        el.setAttribute('cx', (252 + (idx - 2) * 3 * p).toFixed(1));
        el.setAttribute('cy', (264 - p * 28).toFixed(1));
        el.setAttribute('r', (1.8 + p * 2.8).toFixed(1));
        el.setAttribute('opacity', (0.85 * (1 - p)).toFixed(2));
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Theme-aware CAD colors harmonized with Material 3 variables
  const bg = 'var(--md-surface-container-lowest)';
  const cardBg = 'var(--md-surface-container-low)';
  const panelBg = 'var(--md-surface-container)';
  const strokeMain = isDark ? '#94a3b8' : '#334155';
  const strokeMuted = 'var(--md-outline-variant)';
  const textMain = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';
  const fittingFill = isDark ? '#64748b' : '#94a3b8';
  const hatchLine = isDark ? '#475569' : '#94a3b8';

  const airColor = (bar: number) => {
    if (!compressorOn || bar <= 0.2) return isDark ? '#475569' : '#94a3b8';
    return isDark ? '#22d3ee' : '#0891b2';
  };

  const supplyColor = airColor(supplyBar);
  const frlColor = airColor(frlOutBar);
  const pAColor = airColor(pABar);
  const pBColor = isDoubleActing ? airColor(pBBar) : strokeMuted;

  // Cylinder geometry (barrel x: 268..502, travel: 196px)
  const clampedStroke = Math.max(0, Math.min(100, strokePct));
  const pistonX = 274 + (clampedStroke / 100) * 196;
  const rodEndX = pistonX + 24;
  const rodTipX = rodEndX + 160;
  const strokeMm = Math.round((clampedStroke / 100) * 200);

  // DCV internal 3-land spool shift (-18 for Pos 1 Extend, +18 for Pos 0 Retract)
  const spoolShiftX = spoolPos === 1 ? -18 : 18;

  // Needle valve visual opening
  const effectiveFcvPct = activeFault === 'stuck_fcv' ? 10 : fcvOpenPct;
  const needleLiftPx = ((effectiveFcvPct - 10) / 90) * 8;
  const fcvBypassOpen =
    compressorOn && Math.abs(velocityPctPerSec) > 0.5 && effectiveFcvPct > 15;

  // FRL Bourdon gauge needle (-125° at 0 bar -> +125° at 10 bar)
  const gaugeAngleDeg = -125 + Math.min(1, Math.max(0, frlOutBar / 10)) * 250;
  const frlPsi = paToPsi(barToPa(frlOutBar));
  const cloggedFrl = activeFault === 'clogged_frl' || frlInBar - frlOutBar > 1.0;

  // Force calculations
  const areaBoreMm2 = (Math.PI / 4) * boreMm * boreMm;
  const effRod = Math.min(rodMm, boreMm - 4);
  const areaAnnulusMm2 = (Math.PI / 4) * (boreMm * boreMm - effRod * effRod);
  const liveExtN = pABar * 0.1 * areaBoreMm2;
  const liveRetN = isDoubleActing ? pBBar * 0.1 * areaAnnulusMm2 : 0;

  return (
    <div className="w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            {pick(
              'Pneumatic Workcell & 2D CAD Cutaway',
              'Sel Kerja Pneumatik & Potongan CAD 2D',
              '空気圧ワークセル・2D CAD断面図'
            )}
          </span>
          <span className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick(
              'Click 5/2 DCV coils to shift',
              'Klik koil DCV 5/2 untuk menggeser',
              '5/2弁コイルをクリックして切換'
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[var(--md-on-surface-variant)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            {pick('Pressurized Air', 'Udara Bertekanan', '加圧空気')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            {pick('Pilot / Fault', 'Pilot / Gangguan', 'パイロット / 異常')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--md-outline)]" />
            {pick('Exhaust (0 bar)', 'Buang (0 bar)', '排気 (0 bar)')}
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 880 500"
        className="mx-auto block max-h-[490px] w-full select-none"
        style={{ background: bg }}
      >
        <defs>
          {/* ISO 128 ±45° Section Hatching */}
          <pattern
            id={`hatchSteel-${uid}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill={isDark ? '#1e293b' : '#e2e8f0'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke={hatchLine} strokeWidth="1.2" strokeOpacity="0.65" />
          </pattern>
          <pattern
            id={`hatchManifold-${uid}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-45)"
          >
            <rect width="8" height="8" fill={isDark ? '#162032' : '#f1f5f9'} />
            <line x1="0" y1="0" x2="0" y2="8" stroke={hatchLine} strokeWidth="1.1" strokeOpacity="0.55" />
          </pattern>
          <pattern
            id={`sinterBronze-${uid}`}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <rect width="5" height="5" fill={cloggedFrl ? '#78350f' : '#b45309'} />
            <circle cx="2" cy="2" r="1" fill={cloggedFrl ? '#451a03' : '#f59e0b'} fillOpacity="0.65" />
          </pattern>
          <pattern
            id={`gridCutaway-${uid}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="var(--md-outline-variant)"
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
          </pattern>

          <linearGradient id={`chrome-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="40%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id={`tankGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#0369a1' : '#38bdf8'} />
            <stop offset="50%" stopColor={isDark ? '#0c4a6e' : '#0284c7'} />
            <stop offset="100%" stopColor={isDark ? '#082f49' : '#0369a1'} />
          </linearGradient>
        </defs>

        <rect width="880" height="500" fill={`url(#gridCutaway-${uid})`} />

        {/* ================= 1. ISO 15552 CYLINDER CUTAWAY (TOP) ================= */}
        <g>
          {/* Cylinder Barrel Outer Wall */}
          <rect
            x="246"
            y="38"
            width="280"
            height="84"
            rx="4"
            fill={panelBg}
            stroke={strokeMain}
            strokeWidth="2"
          />
          {/* Inner Bore Cavity */}
          <rect x="268" y="46" width="234" height="68" fill={cardBg} />

          {/* Chamber A (Cap End) Pressurized Shading */}
          {pABar > 0.2 && (
            <rect
              x="268"
              y="46"
              width={Math.max(4, pistonX - 268)}
              height="68"
              fill="#06b6d4"
              fillOpacity={Math.min(0.32, 0.1 + (pABar / 10) * 0.22)}
            />
          )}
          {/* Chamber B (Rod End) Pressurized Shading or Return Spring */}
          {isDoubleActing ? (
            pBBar > 0.2 && (
              <rect
                x={pistonX + 24}
                y="46"
                width={Math.max(4, 502 - (pistonX + 24))}
                height="68"
                fill="#06b6d4"
                fillOpacity={Math.min(0.32, 0.1 + (pBBar / 10) * 0.22)}
              />
            )
          ) : (
            <path
              d={buildHorizontalSpring(pistonX + 26, 500, 80, 7, 18)}
              fill="none"
              stroke={strokeMain}
              strokeWidth="2"
            />
          )}

          {/* Rear & Front End Caps with ±45° ISO Hatching */}
          <rect
            x="246"
            y="38"
            width="22"
            height="84"
            rx="2"
            fill={`url(#hatchSteel-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.8"
          />
          <rect
            x="502"
            y="38"
            width="24"
            height="84"
            rx="2"
            fill={`url(#hatchSteel-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.8"
          />
          {/* Bronze Rod Gland & Blue Wiper Seal */}
          <rect x="502" y="66" width="24" height="28" fill="#d97706" fillOpacity="0.6" stroke={strokeMain} strokeWidth="1.2" />
          <rect x="519" y="68" width="5" height="24" fill="#06b6d4" stroke={strokeMain} strokeWidth="1" />

          {/* Tie-Rods top & bottom */}
          <line x1="240" y1="34" x2="532" y2="34" stroke={fittingFill} strokeWidth="3.5" />
          <line x1="240" y1="126" x2="532" y2="126" stroke={fittingFill} strokeWidth="3.5" />

          {/* Hatched Piston + Dual U-Cup Seals */}
          <rect
            x={pistonX}
            y="46"
            width="24"
            height="68"
            rx="2"
            fill={`url(#hatchManifold-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.8"
          />
          <rect x={pistonX + 3.5} y="45.5" width="3.5" height="69" rx="1" fill="#f59e0b" />
          <rect x={pistonX + 17} y="45.5" width="3.5" height="69" rx="1" fill="#f59e0b" />

          {/* Chrome Piston Rod */}
          <rect
            x={rodEndX}
            y="72"
            width={rodTipX - rodEndX}
            height="16"
            rx="2"
            fill={`url(#chrome-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.4"
          />

          {/* Linear Guide Rail & Guided Load Mass */}
          <rect
            x="585"
            y="108"
            width="210"
            height="7"
            rx="2"
            fill={isDark ? '#1e293b' : '#cbd5e1'}
            stroke={strokeMuted}
            strokeWidth="1"
          />
          <rect
            x={rodTipX}
            y="53"
            width="56"
            height="54"
            rx="6"
            fill={`url(#hatchSteel-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <rect
            x={rodTipX + 6}
            y="60"
            width="44"
            height="40"
            rx="4"
            fill={cardBg}
            fillOpacity="0.9"
          />
          <text x={rodTipX + 28} y="76" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textMain}>
            {isDoubleActing ? 'LOAD' : 'SPRING'}
          </text>
          <text x={rodTipX + 28} y="92" textAnchor="middle" fontSize="10" fontWeight="800" fill={frlColor}>
            {Math.round(Math.max(liveExtN, liveRetN))} N
          </text>

          {/* Optional S2 Roller Limit Switch at 100% stroke */}
          {hasLimitSwitch && (
            <g transform="translate(752, 34)">
              <rect
                x="-14"
                y="-14"
                width="28"
                height="24"
                rx="3"
                fill={panelBg}
                stroke={limitTripped ? '#22c55e' : strokeMain}
                strokeWidth="1.6"
              />
              <circle
                cx="-10"
                cy={limitTripped ? 10 : 14}
                r="5"
                fill={limitTripped ? '#22c55e' : '#f59e0b'}
                stroke={strokeMain}
                strokeWidth="1.2"
              />
              <circle cx="0" cy="-4" r="3.5" fill={limitTripped ? '#22c55e' : strokeMuted} />
              <text x="18" y="0" fontSize="9" fontWeight="700" fill={limitTripped ? '#22c55e' : textMuted}>
                S2 Limit {limitTripped ? '(TRIP)' : ''}
              </text>
            </g>
          )}

          {/* Stroke & Spec Pill */}
          <rect x="246" y="132" width="280" height="18" rx="9" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          <text x="386" y="144" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)" fill={textMuted}>
            Ø{boreMm} / Ø{effRod} mm ISO 15552 • {strokeMm} / 200 mm ({Math.round(clampedStroke)}%)
          </text>
        </g>

        {/* ================= 2. LINES A & B + METER-OUT NEEDLE VALVES ================= */}
        <path
          d="M 348 238 L 348 212 L 277 212 L 277 118"
          fill="none"
          stroke={pAColor}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M 422 238 L 422 212 L 493 212 L 493 118"
          fill="none"
          stroke={pBColor}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`pa-${i}`}
            ref={(el) => {
              lineAParticlesRef.current[i] = el;
            }}
            r="2.4"
            fill="#ffffff"
            opacity="0"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`pb-${i}`}
            ref={(el) => {
              lineBParticlesRef.current[i] = el;
            }}
            r="2.4"
            fill="#ffffff"
            opacity="0"
          />
        ))}

        {/* Meter-Out Needle Valve & Check Ball Cutaway on Port B (and indicator on A) */}
        {(hasFcv || activeFault === 'stuck_fcv') && (
          <g transform="translate(493, 186)">
            <rect
              x="-34"
              y="-20"
              width="68"
              height="40"
              rx="5"
              fill={`url(#hatchManifold-${uid})`}
              stroke={activeFault === 'stuck_fcv' ? '#ef4444' : strokeMain}
              strokeWidth="1.8"
            />
            <rect x="-25" y="-15" width="26" height="30" rx="2" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
            <polygon points="-23,2 -14,2 -14,8 -23,8" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
            <polygon points="-8,2 0,2 0,8 -8,8" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
            {/* Movable Conical Needle Stem */}
            <g transform={`translate(-11, ${-needleLiftPx.toFixed(1)})`}>
              <rect x="-3" y="-19" width="6" height="15" rx="1" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1" />
              <polygon points="-3,-4 3,-4 0,4" fill={activeFault === 'stuck_fcv' ? '#ef4444' : '#f59e0b'} stroke={strokeMain} strokeWidth="1" />
              <rect x="-6.5" y="-24" width="13" height="5" rx="1.5" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
            </g>
            {/* Bypass check ball */}
            <rect x="6" y="-15" width="22" height="30" rx="2" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
            <polyline points="10,6 17,11 24,6" fill="none" stroke={textMain} strokeWidth="1.4" />
            <circle
              cx="17"
              cy={fcvBypassOpen ? -3 : 4}
              r="4"
              fill={fcvBypassOpen ? '#10b981' : fittingFill}
              stroke={textMain}
              strokeWidth="1.3"
              style={{ transition: 'cy 150ms ease-out' }}
            />
            <text x="40" y="-2" fontSize="9" fontWeight="700" fill={textMain}>
              Meter-Out FCV
            </text>
            <text
              x="40"
              y="10"
              fontSize="9"
              fontWeight="800"
              fill={activeFault === 'stuck_fcv' ? '#ef4444' : '#0891b2'}
            >
              {activeFault === 'stuck_fcv' ? 'STUCK 10%' : `${effectiveFcvPct}% open`}
            </text>
          </g>
        )}

        {/* Pressure Taps P_A and P_B */}
        <g transform="translate(202, 166)">
          <line x1="18" y1="0" x2="75" y2="0" stroke={pAColor} strokeWidth="2" />
          <circle cx="0" cy="0" r="17" fill={cardBg} stroke={pAColor} strokeWidth="2.2" />
          <text x="0" y="-2" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textMain}>
            P_A
          </text>
          <text x="0" y="9" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={pAColor}>
            {pABar.toFixed(1)}b
          </text>
        </g>
        <g transform="translate(572, 152)">
          <line x1="-79" y1="0" x2="-18" y2="0" stroke={pBColor} strokeWidth="2" />
          <circle cx="0" cy="0" r="17" fill={cardBg} stroke={pBColor} strokeWidth="2.2" />
          <text x="0" y="-2" textAnchor="middle" fontSize="8.5" fontWeight="800" fill={textMain}>
            P_B
          </text>
          <text x="0" y="9" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={pBColor}>
            {isDoubleActing ? `${pBBar.toFixed(1)}b` : 'VENT'}
          </text>
        </g>

        {/* ================= 3. 5/2 SOLENOID/PILOT DCV CUTAWAY + MUFFLERS ================= */}
        <g transform="translate(280, 238)">
          {/* Left Solenoid / Pilot 14(Z) */}
          <g
            className="cursor-pointer"
            onClick={() => onShiftSpool(1)}
          >
            <rect
              x="-42"
              y="8"
              width="42"
              height="36"
              rx="4"
              fill={`url(#hatchSteel-${uid})`}
              stroke={spoolPos === 1 && compressorOn ? '#22d3ee' : strokeMain}
              strokeWidth="1.8"
            />
            {[-34, -27, -20, -13].map((wx) => (
              <line
                key={wx}
                x1={wx}
                y1="14"
                x2={wx}
                y2="30"
                stroke={spoolPos === 1 && compressorOn ? '#f59e0b' : '#b45309'}
                strokeWidth="1.8"
                strokeOpacity={spoolPos === 1 && compressorOn ? '1' : '0.45'}
              />
            ))}
            <circle cx="-21" cy="14" r="3.5" fill={spoolPos === 1 && compressorOn ? '#22d3ee' : strokeMuted} />
            <text x="-21" y="40" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
              SOL 14
            </text>
          </g>

          {/* Right Solenoid / Pilot 12(Y) */}
          <g
            className="cursor-pointer"
            onClick={() => onShiftSpool(0)}
          >
            <rect
              x="210"
              y="8"
              width="42"
              height="36"
              rx="4"
              fill={`url(#hatchSteel-${uid})`}
              stroke={spoolPos === 0 && compressorOn ? '#22d3ee' : strokeMain}
              strokeWidth="1.8"
            />
            {[223, 230, 237, 244].map((wx) => (
              <line
                key={wx}
                x1={wx}
                y1="14"
                x2={wx}
                y2="30"
                stroke={spoolPos === 0 && compressorOn ? '#f59e0b' : '#b45309'}
                strokeWidth="1.8"
                strokeOpacity={spoolPos === 0 && compressorOn ? '1' : '0.45'}
              />
            ))}
            <circle cx="231" cy="14" r="3.5" fill={spoolPos === 0 && compressorOn ? '#22d3ee' : strokeMuted} />
            <text x="231" y="40" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
              SOL 12
            </text>
          </g>

          {/* DCV Machined Housing */}
          <rect
            x="0"
            y="0"
            width="210"
            height="74"
            rx="5"
            fill={`url(#hatchManifold-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <rect x="8" y="20" width="194" height="32" rx="3" fill={cardBg} stroke={strokeMuted} strokeWidth="1.2" />

          {/* 5 Port Galleries: 4(A)=68, 2(B)=142 | 5(EA)=34, 1(P)=105, 3(EB)=176 */}
          <rect x="64" y="0" width="8" height="22" fill={pAColor} fillOpacity="0.65" />
          <rect x="138" y="0" width="8" height="22" fill={pBColor} fillOpacity="0.65" />
          <rect x="30" y="50" width="8" height="24" fill={strokeMuted} />
          <rect x="101" y="50" width="8" height="24" fill={frlColor} fillOpacity="0.7" />
          <rect x="172" y="50" width="8" height="24" fill={strokeMuted} />

          {/* Sliding 3-Land Spool */}
          <g
            transform={`translate(${spoolShiftX}, 0)`}
            style={{ transition: 'transform 150ms ease-out' }}
          >
            <rect
              x="22"
              y="31"
              width="166"
              height="10"
              rx="2"
              fill={`url(#chrome-${uid})`}
              stroke={strokeMain}
              strokeWidth="1.2"
            />
            {[46, 105, 164].map((lx) => (
              <rect
                key={lx}
                x={lx - 13}
                y="22"
                width="26"
                height="28"
                rx="2"
                fill={fittingFill}
                stroke={strokeMain}
                strokeWidth="1.4"
              />
            ))}
          </g>

          {/* Port labels */}
          <text x="68" y="11" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
            4(A)
          </text>
          <text x="142" y="11" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
            2(B)
          </text>
          <text x="34" y="69" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMuted}>
            5(EA)
          </text>
          <text x="105" y="69" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
            1(P)
          </text>
          <text x="176" y="69" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMuted}>
            3(EB)
          </text>

          {/* Sintered Brass Exhaust Silencers (Mufflers) at Ports 5(EA) & 3(EB) */}
          {[34, 176].map((mx) => (
            <g key={mx} transform={`translate(${mx}, 74)`}>
              <rect x="-5" y="0" width="10" height="7" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
              <path
                d="M -9 7 L 9 7 L 7 29 Q 0 33 -7 29 Z"
                fill={`url(#sinterBronze-${uid})`}
                stroke="#92400e"
                strokeWidth="1.4"
              />
            </g>
          ))}

          {/* Interactive Shift Buttons */}
          <g transform="translate(46, 86)">
            <rect
              x="0"
              y="0"
              width="54"
              height="20"
              rx="4"
              fill={spoolPos === 1 ? '#0891b2' : cardBg}
              stroke={spoolPos === 1 ? '#22d3ee' : strokeMuted}
              strokeWidth="1.4"
              className="cursor-pointer"
              onClick={() => onShiftSpool(1)}
            />
            <text
              x="27"
              y="13"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="800"
              fill={spoolPos === 1 ? '#ffffff' : textMain}
              className="pointer-events-none"
            >
              EXTEND
            </text>

            <rect
              x="64"
              y="0"
              width="54"
              height="20"
              rx="4"
              fill={spoolPos === 0 ? '#0891b2' : cardBg}
              stroke={spoolPos === 0 ? '#22d3ee' : strokeMuted}
              strokeWidth="1.4"
              className="cursor-pointer"
              onClick={() => onShiftSpool(0)}
            />
            <text
              x="91"
              y="13"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="800"
              fill={spoolPos === 0 ? '#ffffff' : textMain}
              className="pointer-events-none"
            >
              RETRACT
            </text>
          </g>
        </g>

        {/* Exhaust Puffs (rAF) */}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`exL-${i}`}
            ref={(el) => {
              exhaustLeftPuffsRef.current[i] = el;
            }}
            fill={isDark ? '#bae6fd' : '#64748b'}
            opacity="0"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`exR-${i}`}
            ref={(el) => {
              exhaustRightPuffsRef.current[i] = el;
            }}
            fill={isDark ? '#bae6fd' : '#64748b'}
            opacity="0"
          />
        ))}

        {/* ================= 4. COMPRESSOR RECEIVER + FRL CUTAWAY (LEFT) ================= */}
        {/* Supply Lines */}
        <path
          d="M 92 360 L 92 344 L 44 344 L 44 286 L 66 286"
          fill="none"
          stroke={supplyColor}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M 234 286 L 254 286 L 254 366 L 385 366 L 385 312"
          fill="none"
          stroke={frlColor}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={`sup-${i}`}
            ref={(el) => {
              supplyParticlesRef.current[i] = el;
            }}
            r="2.2"
            fill="#ffffff"
            opacity="0"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`dcvsup-${i}`}
            ref={(el) => {
              dcvSupplyParticlesRef.current[i] = el;
            }}
            r="2.2"
            fill="#ffffff"
            opacity="0"
          />
        ))}

        {/* Pilot leak particles (leaking_pilot fault) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`leak-${i}`}
            ref={(el) => {
              pilotLeakPuffsRef.current[i] = el;
            }}
            fill="#f59e0b"
            opacity="0"
          />
        ))}

        {/* Compressor & Air Receiver Tank (Bottom-Left) */}
        <g>
          {/* Receiver Tank */}
          <rect
            x="38"
            y="384"
            width="160"
            height="68"
            rx="32"
            fill={`url(#tankGrad-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <rect x="64" y="452" width="12" height="12" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          <rect x="160" y="452" width="12" height="12" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          <text x="118" y="415" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">
            AIR RECEIVER
          </text>
          <text x="118" y="432" textAnchor="middle" fontSize="11" fontWeight="800" fill="#e0f2fe">
            {compressorOn ? `${supplyBar.toFixed(1)} bar` : 'OFF (0 bar)'}
          </text>

          {/* Reciprocating Compressor Head */}
          <rect x="74" y="334" width="36" height="44" rx="4" fill={`url(#hatchSteel-${uid})`} stroke={strokeMain} strokeWidth="1.6" />
          <rect x="81" y="340" width="22" height="32" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          <rect
            ref={compPistonRef}
            x="83"
            y="343"
            width="18"
            height="12"
            rx="2"
            fill={compressorOn ? '#22d3ee' : fittingFill}
            stroke={strokeMain}
            strokeWidth="1.2"
          />
          <text x="148" y="356" fontSize="8.5" fontWeight="700" fill={textMuted}>
            COMPRESSOR
          </text>
          <text x="148" y="368" fontSize="8.5" fontWeight="800" fill={compressorOn ? '#0891b2' : textMuted}>
            {compressorOn ? 'RUNNING' : 'STOPPED'}
          </text>
        </g>

        {/* FRL Unit Cutaway (Filter, Regulator + Gauge, Lubricator) */}
        <g transform="translate(66, 214)">
          {/* Upper Manifold Block */}
          <rect x="0" y="54" width="168" height="32" rx="4" fill={`url(#hatchManifold-${uid})`} stroke={strokeMain} strokeWidth="1.8" />

          {/* 1. FILTER BOWL (left) */}
          <path
            d="M 10 86 L 46 86 L 42 134 Q 28 140 14 134 Z"
            fill={isDark ? 'rgba(56, 189, 248, 0.14)' : 'rgba(186, 230, 253, 0.45)'}
            stroke={cloggedFrl ? '#f59e0b' : strokeMain}
            strokeWidth="1.6"
          />
          {/* Sintered bronze element */}
          <rect
            x="19"
            y="90"
            width="18"
            height="30"
            rx="2"
            fill={`url(#sinterBronze-${uid})`}
            stroke={cloggedFrl ? '#ef4444' : '#92400e'}
            strokeWidth="1.2"
          />
          {/* Condensate water */}
          <path d="M 14 126 L 42 126 L 41 133 Q 28 138 15 133 Z" fill="#0ea5e9" fillOpacity="0.55" />
          <text x="28" y="150" textAnchor="middle" fontSize="8" fontWeight="700" fill={cloggedFrl ? '#f59e0b' : textMuted}>
            {cloggedFrl ? 'CLOGGED!' : '5μm Filter'}
          </text>

          {/* 2. REGULATOR + SPRING + BOURDON GAUGE (center) */}
          <rect x="64" y="20" width="40" height="34" rx="3" fill={`url(#hatchSteel-${uid})`} stroke={strokeMain} strokeWidth="1.5" />
          <rect x="70" y="24" width="28" height="24" fill={cardBg} />
          <path d={buildHelicalSpring(84, 25, 45, 4, 8)} fill="none" stroke={strokeMain} strokeWidth="1.5" />
          <rect x="74" y="12" width="20" height="8" rx="2" fill={fittingFill} stroke={strokeMain} strokeWidth="1.2" />

          {/* Crisp Bourdon Pressure Gauge */}
          <g transform="translate(84, -14)">
            <circle cx="0" cy="0" r="24" fill={cardBg} stroke={cloggedFrl ? '#f59e0b' : frlColor} strokeWidth="2.4" />
            <circle cx="0" cy="0" r="20" fill="none" stroke={strokeMuted} strokeWidth="1" />
            <g transform={`rotate(${gaugeAngleDeg.toFixed(1)})`}>
              <line x1="0" y1="3" x2="0" y2="-16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </g>
            <circle cx="0" cy="0" r="2.5" fill={textMain} />
            <text x="0" y="11" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMain}>
              {frlOutBar.toFixed(1)}b
            </text>
            <text x="0" y="18" textAnchor="middle" fontSize="6" fontWeight="600" fill={textMuted}>
              {Math.round(frlPsi)} psi
            </text>
          </g>

          {/* 3. MIST LUBRICATOR BOWL + SIGHT DOME (right) */}
          <rect x="130" y="42" width="18" height="12" rx="6" fill={isDark ? '#1e293b' : '#e0f2fe'} stroke={strokeMain} strokeWidth="1.2" />
          <circle ref={lubeDropRef} cx="139" cy="45" r="2.2" fill="#f59e0b" opacity="0" />
          <path
            d="M 121 86 L 157 86 L 153 134 Q 139 140 125 134 Z"
            fill={isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(254, 243, 199, 0.65)'}
            stroke={strokeMain}
            strokeWidth="1.6"
          />
          <path d="M 124 114 L 154 114 L 152 133 Q 139 138 126 133 Z" fill="#f59e0b" fillOpacity="0.45" />
          <line x1="139" y1="86" x2="139" y2="130" stroke={strokeMain} strokeWidth="1.5" />
          <text x="139" y="150" textAnchor="middle" fontSize="8" fontWeight="700" fill={textMuted}>
            Lubricator
          </text>
        </g>

        {/* ================= 5. LIVE CAD TELEMETRY & STATUS BLOCK (BOTTOM-RIGHT) ================= */}
        <g transform="translate(590, 326)">
          <rect
            x="0"
            y="0"
            width="266"
            height="148"
            rx="12"
            fill={panelBg}
            stroke={strokeMuted}
            strokeWidth="1.2"
          />
          <text x="14" y="22" fontSize="10" fontWeight="800" fontFamily="var(--font-sans)" fill={textMain}>
            {pick('LIVE PNEUMATIC CAD READOUT', 'DATA CAD PNEUMATIK', 'リアルタイム空圧CAD計測')}
          </text>
          <line x1="14" y1="30" x2="252" y2="30" stroke={strokeMuted} strokeWidth="0.9" />

          <text x="14" y="49" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
            FRL Pressure (In → Out):
          </text>
          <text x="252" y="49" textAnchor="end" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)" fill={cloggedFrl ? '#f59e0b' : frlColor}>
            {frlInBar.toFixed(1)} → {frlOutBar.toFixed(1)} bar
          </text>

          <text x="14" y="69" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
            Extend / Retract Force:
          </text>
          <text x="252" y="69" textAnchor="end" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)" fill={textMain}>
            {Math.round(liveExtN)} / {Math.round(liveRetN)} N
          </text>

          <text x="14" y="89" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
            Total Air Consumption:
          </text>
          <text
            x="252"
            y="89"
            textAnchor="end"
            fontSize="10"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            fill={activeFault === 'leaking_pilot' ? '#ef4444' : frlColor}
          >
            {totalNlMin.toFixed(1)} NL/min
          </text>

          <text x="14" y="109" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" fill={textMuted}>
            5/2 Spool State:
          </text>
          <text x="252" y="109" textAnchor="end" fontSize="10" fontWeight="800" fontFamily="var(--font-mono)" fill={textMain}>
            {spoolPos === 1 ? 'POS 1 (1→4A, 2B→3)' : 'POS 0 (1→2B, 4A→5)'}
          </text>

          <rect
            x="14"
            y="120"
            width="238"
            height="20"
            rx="5"
            fill={
              activeFault !== 'none'
                ? isDark
                  ? 'rgba(239, 68, 68, 0.16)'
                  : '#fef2f2'
                : isDark
                  ? 'rgba(16, 185, 129, 0.16)'
                  : '#ecfdf5'
            }
          />
          <text
            x="133"
            y="133"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="800"
            fill={activeFault !== 'none' ? '#ef4444' : '#10b981'}
          >
            {activeFault === 'clogged_frl'
              ? '⚠ FAULT: CLOGGED FRL ELEMENT'
              : activeFault === 'leaking_pilot'
                ? '⚠ FAULT: PILOT AIR LEAK'
                : activeFault === 'stuck_fcv'
                  ? '⚠ FAULT: SEIZED METER-OUT FCV'
                  : '✓ SYSTEM NOMINAL (ISO 1219)'}
          </text>
        </g>
      </svg>
    </div>
  );
}
