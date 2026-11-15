import { useEffect, useId, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { DcvPosition, HydraulicParams, HydraulicTelemetry } from './hydraulicTypes';
import {
  AREA_ANNULUS_CM2,
  AREA_CAP_CM2,
  CYLINDER_BORE_MM,
  CYLINDER_ROD_MM,
  CYLINDER_STROKE_MM,
  computeOilViscosityCst,
} from './hydraulicPhysics';

interface HydraulicSchematicProps {
  params: HydraulicParams;
  telemetry: HydraulicTelemetry;
  strokeNorm: number;
  oilTempC: number;
  onChangeDcv: (dcv: DcvPosition) => void;
}

type Pt = readonly [number, number];

function buildGearPath(
  teeth: number,
  rRoot: number,
  rTip: number,
  rBore: number,
): string {
  const parts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.34;
    const a3 = a0 + step * 0.66;
    const a4 = a0 + step * 0.78;
    const p0 = `${(rRoot * Math.cos(a0)).toFixed(2)},${(rRoot * Math.sin(a0)).toFixed(2)}`;
    const p1 = `${(rRoot * Math.cos(a1)).toFixed(2)},${(rRoot * Math.sin(a1)).toFixed(2)}`;
    const p2 = `${(rTip * Math.cos(a2)).toFixed(2)},${(rTip * Math.sin(a2)).toFixed(2)}`;
    const p3 = `${(rTip * Math.cos(a3)).toFixed(2)},${(rTip * Math.sin(a3)).toFixed(2)}`;
    const p4 = `${(rRoot * Math.cos(a4)).toFixed(2)},${(rRoot * Math.sin(a4)).toFixed(2)}`;
    parts.push(`${i === 0 ? 'M' : 'L'} ${p0} L ${p1} L ${p2} L ${p3} L ${p4}`);
  }
  parts.push('Z');
  parts.push(
    `M ${rBore} 0 A ${rBore} ${rBore} 0 1 0 ${-rBore} 0 A ${rBore} ${rBore} 0 1 0 ${rBore} 0 Z`,
  );
  return parts.join(' ');
}

function buildHelicalSpringPath(
  xCenter: number,
  yTop: number,
  yBottom: number,
  coils: number,
  halfWidth: number,
): string {
  const h = yBottom - yTop;
  const pts: string[] = [`M ${xCenter} ${yTop.toFixed(1)}`];
  const segments = coils * 2;
  for (let i = 1; i < segments; i++) {
    const frac = i / segments;
    const y = yTop + frac * h;
    const x = xCenter + (i % 2 === 1 ? -halfWidth : halfWidth);
    pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push(`L ${xCenter} ${yBottom.toFixed(1)}`);
  return pts.join(' ');
}

function samplePolyline(pts: readonly Pt[], frac: number): Pt {
  const f = ((frac % 1) + 1) % 1;
  let total = 0;
  const segLens: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0];
    const dy = pts[i + 1][1] - pts[i][1];
    const len = Math.hypot(dx, dy);
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

const SUCTION_PATH: readonly Pt[] = [
  [155, 434],
  [155, 375],
  [248, 375],
  [248, 366],
];

const PUMP_TO_DCV_PATH: readonly Pt[] = [
  [274, 342],
  [348, 342],
  [348, 299],
];

const TANK_RETURN_PATH: readonly Pt[] = [
  [422, 299],
  [422, 449],
  [346, 449],
];

const RELIEF_BYPASS_PATH: readonly Pt[] = [
  [286, 342],
  [286, 304],
  [108, 304],
  [78, 286],
  [78, 438],
];

const CAP_LINE_PATH: readonly Pt[] = [
  [348, 228],
  [348, 210],
  [275, 210],
  [275, 118],
];

const ROD_LINE_PATH: readonly Pt[] = [
  [422, 228],
  [422, 210],
  [515, 210],
  [515, 118],
];

const DRIVE_GEAR_PATH = buildGearPath(10, 7.6, 10.6, 3.2);
const IDLER_GEAR_PATH = buildGearPath(10, 7.6, 10.6, 3.2);

export function HydraulicSchematic({
  params,
  telemetry,
  strokeNorm,
  oilTempC,
  onChangeDcv,
}: HydraulicSchematicProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const uid = useId().replace(/:/g, '');

  // Refs for zero-rerender 60 FPS requestAnimationFrame animation
  const driveGearRef = useRef<SVGGElement | null>(null);
  const idlerGearRef = useRef<SVGGElement | null>(null);
  const couplingKeyRef = useRef<SVGGElement | null>(null);
  const oilSurfaceRef = useRef<SVGPathElement | null>(null);
  const cavitationBubbleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const suctionParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pumpParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const tankParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const reliefParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineAParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineBParticleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const bypassSparkRefs = useRef<(SVGCircleElement | null)[]>([]);

  const stateRef = useRef({
    pumpOn: params.pumpOn,
    qPumpLpm: telemetry.qPumpLpm,
    qActuatorLpm: telemetry.qActuatorLpm,
    qReliefLpm: telemetry.qReliefLpm,
    reliefOpen: telemetry.reliefOpen,
    dcv: params.dcv,
    isCavitating: telemetry.isCavitating,
    isSealBypass: params.fault === 'cylinder-seal-bypass',
    pistonX: 274 + strokeNorm * 200,
  });

  useEffect(() => {
    stateRef.current = {
      pumpOn: params.pumpOn,
      qPumpLpm: telemetry.qPumpLpm,
      qActuatorLpm: telemetry.qActuatorLpm,
      qReliefLpm: telemetry.qReliefLpm,
      reliefOpen: telemetry.reliefOpen,
      dcv: params.dcv,
      isCavitating: telemetry.isCavitating,
      isSealBypass: params.fault === 'cylinder-seal-bypass',
      pistonX: 274 + strokeNorm * 200,
    };
  }, [params.pumpOn, params.dcv, params.fault, telemetry, strokeNorm]);

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let gearAngleDeg = 0;
    let phasePump = 0;
    let phaseAct = 0;
    let phaseRelief = 0;
    let phaseWave = 0;

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const st = stateRef.current;

      // 1. Twin meshing gears + coupling rotation
      if (st.pumpOn) {
        const rpmDegPerSec = 140 + st.qPumpLpm * 5.5;
        gearAngleDeg = (gearAngleDeg + rpmDegPerSec * dt) % 360;
      }
      if (driveGearRef.current) {
        driveGearRef.current.setAttribute(
          'transform',
          `translate(0, -8.8) rotate(${gearAngleDeg.toFixed(1)})`,
        );
      }
      if (idlerGearRef.current) {
        // Meshed half-tooth offset (180 / 10 = 18 deg) + opposite rotation
        idlerGearRef.current.setAttribute(
          'transform',
          `translate(0, 8.8) rotate(${(-gearAngleDeg + 18).toFixed(1)})`,
        );
      }
      if (couplingKeyRef.current) {
        const yOff = st.pumpOn
          ? Math.sin((gearAngleDeg * Math.PI) / 180) * 5.5
          : 0;
        couplingKeyRef.current.setAttribute(
          'transform',
          `translate(0, ${yOff.toFixed(2)})`,
        );
      }

      // 2. Reservoir oil surface wave & return turbulence
      phaseWave = (phaseWave + dt * (st.pumpOn ? 3.8 : 0.9)) % (Math.PI * 2);
      if (oilSurfaceRef.current) {
        const pts: string[] = [];
        const baseAmp = st.pumpOn ? (st.reliefOpen ? 2.4 : 1.3) : 0.3;
        for (let i = 0; i <= 24; i++) {
          const x = 3 + (i / 24) * 334;
          const rightTurb = i > 14 ? 1.55 : 0.7;
          const y =
            20 +
            Math.sin(phaseWave + i * 0.65) * baseAmp * rightTurb +
            Math.cos(phaseWave * 1.7 - i * 0.4) * (baseAmp * 0.4);
          pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        oilSurfaceRef.current.setAttribute('d', pts.join(' '));
      }

      // 3. Flow particle phases
      if (st.pumpOn) {
        phasePump = (phasePump + dt * (0.22 + st.qPumpLpm * 0.011)) % 1;
        if (st.qActuatorLpm > 0.2) {
          phaseAct = (phaseAct + dt * (0.18 + st.qActuatorLpm * 0.012)) % 1;
        }
        if (st.reliefOpen && st.qReliefLpm > 0.2) {
          phaseRelief = (phaseRelief + dt * (0.25 + st.qReliefLpm * 0.012)) % 1;
        }
      }

      // Suction particles
      const showSuction = st.pumpOn && st.qPumpLpm > 0.2;
      suctionParticleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!showSuction) {
          el.setAttribute('opacity', '0');
          return;
        }
        const [x, y] = samplePolyline(
          SUCTION_PATH,
          phasePump + idx / suctionParticleRefs.current.length,
        );
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.9');
      });

      // Pump -> DCV particles
      pumpParticleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!showSuction) {
          el.setAttribute('opacity', '0');
          return;
        }
        const [x, y] = samplePolyline(
          PUMP_TO_DCV_PATH,
          phasePump + idx / pumpParticleRefs.current.length,
        );
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.95');
      });

      // DCV -> Tank return particles (active in neutral tandem or when cylinder moves)
      const showTank =
        st.pumpOn && (st.dcv === 'neutral' || st.qActuatorLpm > 0.2);
      tankParticleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!showTank) {
          el.setAttribute('opacity', '0');
          return;
        }
        const ph = st.dcv === 'neutral' ? phasePump : phaseAct;
        const [x, y] = samplePolyline(
          TANK_RETURN_PATH,
          ph + idx / tankParticleRefs.current.length,
        );
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.9');
      });

      // Relief bypass jet particles
      const showRelief = st.pumpOn && st.reliefOpen && st.qReliefLpm > 0.2;
      reliefParticleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!showRelief) {
          el.setAttribute('opacity', '0');
          return;
        }
        const [x, y] = samplePolyline(
          RELIEF_BYPASS_PATH,
          phaseRelief + idx / reliefParticleRefs.current.length,
        );
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.95');
      });

      // Actuator lines A & B particles (bidirectional)
      const showAct =
        st.pumpOn && st.dcv !== 'neutral' && st.qActuatorLpm > 0.2;
      const extending = st.dcv === 'extend';
      lineAParticleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!showAct) {
          el.setAttribute('opacity', '0');
          return;
        }
        const base = phaseAct + idx / lineAParticleRefs.current.length;
        const [x, y] = samplePolyline(CAP_LINE_PATH, extending ? base : 1 - base);
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.95');
      });

      lineBParticleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!showAct) {
          el.setAttribute('opacity', '0');
          return;
        }
        const base = phaseAct + idx / lineBParticleRefs.current.length;
        const [x, y] = samplePolyline(ROD_LINE_PATH, extending ? 1 - base : base);
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', '0.95');
      });

      // Cavitation vapor micro-bubbles around suction strainer & pump inlet
      cavitationBubbleRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!st.pumpOn || !st.isCavitating) {
          el.setAttribute('opacity', '0');
          return;
        }
        const localPhase = (phaseWave * 0.5 + idx * 0.22) % 1;
        const bx = idx < 3 ? 155 + Math.sin(idx * 2.1 + phaseWave) * 7 : 244 + (idx - 4) * 5;
        const by = idx < 3 ? 444 - localPhase * 28 : 352 - localPhase * 16;
        el.setAttribute('cx', bx.toFixed(1));
        el.setAttribute('cy', by.toFixed(1));
        el.setAttribute('opacity', (0.85 * (1 - localPhase * 0.6)).toFixed(2));
      });

      // Piston internal seal bypass leakage beads across piston OD
      bypassSparkRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (!st.pumpOn || !st.isSealBypass) {
          el.setAttribute('opacity', '0');
          return;
        }
        const localPhase = (phasePump * 2.2 + idx * 0.25) % 1;
        const px = st.pistonX + (extending ? localPhase * 24 : (1 - localPhase) * 24);
        const py = idx % 2 === 0 ? 48.5 : 111.5;
        el.setAttribute('cx', px.toFixed(1));
        el.setAttribute('cy', py.toFixed(1));
        el.setAttribute('opacity', '0.9');
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Palette tuned via useTheme()
  const bg = isDark ? '#09101d' : '#f8fafc';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const panelBg = isDark ? '#0f172a' : '#f1f5f9';
  const strokeMain = isDark ? '#94a3b8' : '#334155';
  const strokeMuted = isDark ? '#334155' : '#cbd5e1';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const fittingFill = isDark ? '#64748b' : '#94a3b8';
  const hatchLine = isDark ? '#475569' : '#94a3b8';

  const pressureColor = (bar: number) => {
    if (!params.pumpOn && bar < 5) return isDark ? '#475569' : '#94a3b8';
    if (bar >= 130 || (telemetry.reliefOpen && bar >= params.reliefCrackBar * 0.9)) {
      return '#ef4444';
    }
    if (bar >= 25) return '#f59e0b';
    return '#0ea5e9';
  };

  const p1Color = pressureColor(telemetry.p1PumpBar);
  const p2Color = pressureColor(telemetry.p2CapBar);
  const p3Color = pressureColor(telemetry.p3RodBar);
  const tankColor = '#0ea5e9';
  const reliefColor =
    params.pumpOn && telemetry.reliefOpen && telemetry.qReliefLpm > 0.2
      ? '#ef4444'
      : strokeMuted;

  const reliefFlowing =
    params.pumpOn && telemetry.reliefOpen && telemetry.qReliefLpm > 0.2;

  // Cylinder piston & rod geometry (barrel x: 265..525, travel: 200px)
  const pistonX = 274 + strokeNorm * 200;
  const rodEndX = pistonX + 24;
  const rodTipX = rodEndX + 162;

  // 4/3 DCV cutaway spool displacement (-22 extend, 0 center, +22 retract)
  const spoolShiftX =
    params.dcv === 'extend' ? -22 : params.dcv === 'retract' ? 22 : 0;

  // Meter-out needle valve visual opening (0 = 10% throttled, 9 = 100% open)
  const needleLiftPx = ((params.meterOutOpenPct - 10) / 90) * 8.5;
  const meterOutCheckOpen =
    params.pumpOn && params.dcv === 'retract' && telemetry.qActuatorLpm > 0.2;

  // Relief valve poppet lift & spring compression
  const reliefLiftPx = reliefFlowing
    ? Math.max(2, Math.min(8, (telemetry.qReliefLpm / Math.max(1, telemetry.qPumpLpm)) * 8))
    : 0;
  const reliefSpringPath = buildHelicalSpringPath(
    78,
    236,
    274 - reliefLiftPx,
    5,
    10,
  );

  const viscosityCst = computeOilViscosityCst(oilTempC);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ISO Hydraulic Circuit &amp; Cutaway HPU CAD
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Click 4/3 DCV to shift spool
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            High / Relief (≥130 bar)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Working (25–129 bar)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            Tank / Return
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 880 500"
        className="mx-auto block max-h-[495px] w-full select-none"
        style={{ background: bg }}
      >
        <defs>
          {/* ISO 128 +45° & -45° Section Hatching Patterns */}
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

          <linearGradient id={`tank-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#1e293b' : '#e2e8f0'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#cbd5e1'} />
          </linearGradient>
          <linearGradient id={`oilBody-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={isDark ? '0.28' : '0.24'} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={isDark ? '0.42' : '0.36'} />
          </linearGradient>
          <linearGradient id={`chrome-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id={`motor-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id={`bronze-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={`barrel-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#1e293b' : '#e2e8f0'} />
            <stop offset="50%" stopColor={cardBg} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#cbd5e1'} />
          </linearGradient>
          <marker
            id={`arrowLoad-${uid}`}
            markerWidth="8"
            markerHeight="8"
            refX="4"
            refY="4"
            orient="auto"
          >
            <path d="M0,1 L8,4 L0,7 Z" fill="#ef4444" />
          </marker>
          {/* Subtle CAD blueprint dot grid */}
          <pattern id={`grid-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={isDark ? '#1e293b' : '#cbd5e1'} fillOpacity="0.6" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="880" height="500" fill={`url(#grid-${uid})`} />

        {/* ================= 1. TIE-ROD CYLINDER CUTAWAY (TOP) ================= */}
        <g>
          {/* Upper & lower tie-rods */}
          <rect x="242" y="38" width="304" height="4" rx="1" fill={`url(#chrome-${uid})`} />
          <rect x="242" y="118" width="304" height="4" rx="1" fill={`url(#chrome-${uid})`} />

          {/* Honed Cylinder Barrel */}
          <rect
            x="265"
            y="44"
            width="260"
            height="72"
            rx="2"
            fill={`url(#barrel-${uid})`}
            stroke={strokeMain}
            strokeWidth="2.2"
          />

          {/* Live Chamber A (Cap End) Fluid Fill */}
          <rect
            x="267"
            y="46"
            width={Math.max(2, pistonX - 267)}
            height="68"
            fill={p2Color}
            fillOpacity={params.pumpOn ? 0.3 : 0.12}
          />

          {/* Live Chamber B (Rod End) Fluid Fill */}
          <rect
            x={rodEndX}
            y="46"
            width={Math.max(2, 523 - rodEndX)}
            height="68"
            fill={p3Color}
            fillOpacity={params.pumpOn ? 0.3 : 0.12}
          />

          {/* ISO ±45° Hatched End Caps + Tie-Rod Hex Nuts */}
          <rect
            x="249"
            y="35"
            width="18"
            height="90"
            rx="2"
            fill={`url(#hatchSteel-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <rect
            x="523"
            y="35"
            width="18"
            height="90"
            rx="2"
            fill={`url(#hatchSteel-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          {[241, 541].map((nx) => (
            <g key={nx}>
              <rect x={nx} y="36" width="8" height="8" rx="1" fill={fittingFill} stroke={strokeMain} strokeWidth="1.2" />
              <rect x={nx} y="116" width="8" height="8" rx="1" fill={fittingFill} stroke={strokeMain} strokeWidth="1.2" />
            </g>
          ))}

          {/* Bronze Rod Gland Bushing + Wiper Seal */}
          <rect
            x="541"
            y="62"
            width="16"
            height="36"
            rx="2"
            fill={`url(#bronze-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.6"
          />
          <rect x="554" y="68" width="4" height="5" rx="1" fill="#0f172a" />
          <rect x="554" y="87" width="4" height="5" rx="1" fill="#0f172a" />

          {/* ISO Hatched Dual-Seal Piston Head */}
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
          {/* Dual U-Cup Piston Seals + Wear Ring */}
          <rect
            x={pistonX + 3.5}
            y="45.5"
            width="3.5"
            height="69"
            rx="1"
            fill={params.fault === 'cylinder-seal-bypass' ? '#ef4444' : '#f59e0b'}
            opacity={params.fault === 'cylinder-seal-bypass' ? 0.55 : 0.95}
          />
          <rect
            x={pistonX + 17}
            y="45.5"
            width="3.5"
            height="69"
            rx="1"
            fill={params.fault === 'cylinder-seal-bypass' ? '#ef4444' : '#f59e0b'}
            opacity={params.fault === 'cylinder-seal-bypass' ? 0.55 : 0.95}
          />

          {/* Piston Bypass Leakage Beads (rAF) */}
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={`bypass-${i}`}
              ref={(el) => {
                bypassSparkRefs.current[i] = el;
              }}
              r="2.4"
              fill="#ef4444"
              opacity="0"
            />
          ))}

          {params.fault === 'cylinder-seal-bypass' && params.pumpOn && (
            <text
              x={pistonX + 12}
              y="29"
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="800"
              fill="#ef4444"
            >
              INTERNAL SEAL BYPASS
            </text>
          )}

          {/* Chrome Piston Rod */}
          <rect
            x={rodEndX}
            y="71"
            width={rodTipX - rodEndX}
            height="18"
            rx="2"
            fill={`url(#chrome-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.4"
          />

          {/* Linear Guide Rail under Load */}
          <rect
            x="585"
            y="110"
            width="210"
            height="7"
            rx="2"
            fill={isDark ? '#1e293b' : '#cbd5e1'}
            stroke={strokeMuted}
            strokeWidth="1"
          />

          {/* Guided External Load Block & Force Vector */}
          <rect
            x={rodTipX}
            y="53"
            width="58"
            height="55"
            rx="6"
            fill={`url(#hatchSteel-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          <rect
            x={rodTipX + 6}
            y="60"
            width="46"
            height="41"
            rx="4"
            fill={cardBg}
            fillOpacity="0.88"
          />
          <text
            x={rodTipX + 29}
            y="76"
            textAnchor="middle"
            fontSize="9"
            fontWeight="800"
            fill={textMain}
          >
            LOAD
          </text>
          <text
            x={rodTipX + 29}
            y="92"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill="#ef4444"
          >
            {params.loadKn} kN
          </text>
          {params.loadKn > 0 && (
            <line
              x1={rodTipX + 84}
              y1="80"
              x2={rodTipX + 62}
              y2="80"
              stroke="#ef4444"
              strokeWidth="2.8"
              markerEnd={`url(#arrowLoad-${uid})`}
            />
          )}

          {/* Drift warning indicator in Neutral */}
          {params.dcv === 'neutral' && telemetry.velocityMmS < -0.1 && (
            <text
              x="395"
              y="18"
              textAnchor="middle"
              fontSize="10"
              fontWeight="800"
              fill="#ef4444"
            >
              ⚠ LOAD DRIFTING ({telemetry.velocityMmS.toFixed(1)} mm/s)
            </text>
          )}

          {/* Stroke readout pill */}
          <rect
            x="255"
            y="128"
            width="280"
            height="18"
            rx="9"
            fill={cardBg}
            stroke={strokeMuted}
            strokeWidth="1"
          />
          <text
            x="395"
            y="140"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="700"
            fill={textMuted}
          >
            Ø{CYLINDER_BORE_MM} / Ø{CYLINDER_ROD_MM} mm Tie-Rod Cylinder •{' '}
            {Math.round(strokeNorm * CYLINDER_STROKE_MM)} / {CYLINDER_STROKE_MM} mm (
            {Math.round(strokeNorm * 100)}%)
          </text>
        </g>

        {/* ================= 2. LINES: DCV <-> CYLINDER ================= */}
        {/* Port A (Cap end) */}
        <path
          d="M 348 228 L 348 210 L 275 210 L 275 118"
          fill="none"
          stroke={p2Color}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`lineA-${i}`}
            ref={(el) => {
              lineAParticleRefs.current[i] = el;
            }}
            r="2.4"
            fill="#ffffff"
            opacity="0"
          />
        ))}
        <rect x="269" y="118" width="12" height="7" rx="1" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />

        {/* Port B (Rod end) */}
        <path
          d="M 422 228 L 422 210 L 515 210 L 515 118"
          fill="none"
          stroke={p3Color}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`lineB-${i}`}
            ref={(el) => {
              lineBParticleRefs.current[i] = el;
            }}
            r="2.4"
            fill="#ffffff"
            opacity="0"
          />
        ))}
        <rect x="509" y="118" width="12" height="7" rx="1" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />

        {/* Pilot-Operated Check Valve Cutaway on Cap Line */}
        {params.pilotCheckValve && (() => {
          const poppetOpen =
            params.pumpOn &&
            ((params.dcv === 'extend' && telemetry.qActuatorLpm > 0.2) ||
              params.dcv === 'retract');
          const poppetCy = poppetOpen ? -4 : 2.5;
          return (
            <g>
              <line
                x1="515"
                y1="194"
                x2="292"
                y2="194"
                stroke={params.dcv === 'retract' && params.pumpOn ? p3Color : strokeMuted}
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
              <g transform="translate(275, 194)">
                <rect
                  x="-17"
                  y="-14"
                  width="34"
                  height="28"
                  rx="4"
                  fill={telemetry.pilotCheckLocked ? (isDark ? '#064e3b' : '#d1fae5') : `url(#hatchManifold-${uid})`}
                  stroke={telemetry.pilotCheckLocked ? '#10b981' : strokeMain}
                  strokeWidth="1.8"
                />
                <polyline points="-7,5 0,9 7,5" fill="none" stroke={textMain} strokeWidth="1.6" />
                <circle
                  cx="0"
                  cy={poppetCy}
                  r="4.5"
                  fill={poppetOpen ? '#f59e0b' : telemetry.pilotCheckLocked ? '#10b981' : cardBg}
                  stroke={textMain}
                  strokeWidth="1.6"
                  style={{ transition: 'cy 150ms ease-out' }}
                />
                <text
                  x="-23"
                  y="3"
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="700"
                  fill={telemetry.pilotCheckLocked ? '#10b981' : textMain}
                >
                  {telemetry.pilotCheckLocked
                    ? 'PO Check (LOCKED)'
                    : poppetOpen
                      ? 'PO Check (OPEN)'
                      : 'PO Check'}
                </text>
              </g>
            </g>
          );
        })()}

        {/* Meter-Out Needle Valve & Bypass Check Cutaway (on B line) */}
        <g transform="translate(515, 188)">
          <rect
            x="-36"
            y="-22"
            width="72"
            height="44"
            rx="5"
            fill={`url(#hatchManifold-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.8"
          />
          {/* Left main orifice passage */}
          <rect x="-26" y="-17" width="28" height="34" rx="2" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          {/* Hardened seat lands */}
          <polygon points="-24,2 -14,2 -14,8 -24,8" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          <polygon points="-8,2 0,2 0,8 -8,8" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          {/* Movable Conical Needle Stem (retracts upward as opening% increases) */}
          <g transform={`translate(-11, ${-needleLiftPx.toFixed(1)})`}>
            <rect x="-3.5" y="-21" width="7" height="17" rx="1" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1.1" />
            <polygon points="-3.5,-4 3.5,-4 0,4" fill="#f59e0b" stroke={strokeMain} strokeWidth="1.1" />
            {/* Knurled knob above housing */}
            <rect x="-7" y="-26" width="14" height="5" rx="1.5" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          </g>
          {/* Orifice glow proportional to opening */}
          <rect
            x="-13.5"
            y="2"
            width="5"
            height={Math.max(1.5, (params.meterOutOpenPct / 100) * 6)}
            fill={p3Color}
            fillOpacity="0.6"
          />

          {/* Right integral bypass check ball (lifts on retract) */}
          <rect x="6" y="-17" width="24" height="34" rx="2" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          <polyline points="11,6 18,11 25,6" fill="none" stroke={textMain} strokeWidth="1.5" />
          <circle
            cx="18"
            cy={meterOutCheckOpen ? -3 : 4}
            r="4.5"
            fill={meterOutCheckOpen ? '#10b981' : fittingFill}
            stroke={textMain}
            strokeWidth="1.4"
            style={{ transition: 'cy 150ms ease-out' }}
          />
          <text x="44" y="-3" fontSize="9.5" fontWeight="700" fill={textMain}>
            Meter-Out Cutaway
          </text>
          <text x="44" y="10" fontSize="9.5" fontWeight="800" fill="#f59e0b">
            {params.meterOutOpenPct}% open {meterOutCheckOpen ? '(Bypass)' : ''}
          </text>
        </g>

        {/* P2 Tap on Cap Line */}
        <g transform="translate(198, 152)">
          <line x1="18" y1="0" x2="77" y2="0" stroke={p2Color} strokeWidth="2" />
          <circle cx="0" cy="0" r="18" fill={cardBg} stroke={p2Color} strokeWidth="2.2" />
          <text x="0" y="-2" textAnchor="middle" fontSize="9" fontWeight="800" fill={textMain}>
            P2
          </text>
          <text x="0" y="9" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={p2Color}>
            {Math.round(telemetry.p2CapBar)}b
          </text>
        </g>

        {/* P3 Tap on Rod Line */}
        <g transform="translate(592, 146)">
          <line x1="-77" y1="0" x2="-18" y2="0" stroke={p3Color} strokeWidth="2" />
          <circle cx="0" cy="0" r="18" fill={cardBg} stroke={p3Color} strokeWidth="2.2" />
          <text x="0" y="-2" textAnchor="middle" fontSize="9" fontWeight="800" fill={textMain}>
            P3
          </text>
          <text x="0" y="9" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={p3Color}>
            {Math.round(telemetry.p3RodBar)}b
          </text>
        </g>

        {/* ================= 3. 4/3 SOLENOID DCV CUTAWAY + INTERACTIVE SPOOL ================= */}
        <g transform="translate(285, 228)">
          {/* SOL A (Left Electromagnetic Coil) */}
          <rect
            x="-42"
            y="8"
            width="42"
            height="34"
            rx="4"
            fill={`url(#hatchSteel-${uid})`}
            stroke={params.dcv === 'extend' && params.pumpOn ? '#f59e0b' : strokeMain}
            strokeWidth="1.8"
          />
          {[-34, -27, -20, -13].map((wx) => (
            <line
              key={wx}
              x1={wx}
              y1="13"
              x2={wx}
              y2="29"
              stroke={params.dcv === 'extend' && params.pumpOn ? '#f59e0b' : '#b45309'}
              strokeWidth="1.8"
              strokeOpacity={params.dcv === 'extend' && params.pumpOn ? '1' : '0.45'}
            />
          ))}
          <circle
            cx="-21"
            cy="15"
            r="3.5"
            fill={params.dcv === 'extend' && params.pumpOn ? '#f59e0b' : strokeMuted}
          />
          <text x="-21" y="38" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
            SOL A
          </text>

          {/* SOL B (Right Electromagnetic Coil) */}
          <rect
            x="200"
            y="8"
            width="42"
            height="34"
            rx="4"
            fill={`url(#hatchSteel-${uid})`}
            stroke={params.dcv === 'retract' && params.pumpOn ? '#f59e0b' : strokeMain}
            strokeWidth="1.8"
          />
          {[213, 220, 227, 234].map((wx) => (
            <line
              key={wx}
              x1={wx}
              y1="13"
              x2={wx}
              y2="29"
              stroke={params.dcv === 'retract' && params.pumpOn ? '#f59e0b' : '#b45309'}
              strokeWidth="1.8"
              strokeOpacity={params.dcv === 'retract' && params.pumpOn ? '1' : '0.45'}
            />
          ))}
          <circle
            cx="221"
            cy="15"
            r="3.5"
            fill={params.dcv === 'retract' && params.pumpOn ? '#f59e0b' : strokeMuted}
          />
          <text x="221" y="38" textAnchor="middle" fontSize="8" fontWeight="800" fill={textMain}>
            SOL B
          </text>

          {/* Valve Cutaway Body & Annular Galleries (y: 0..42) */}
          <rect
            x="0"
            y="0"
            width="200"
            height="43"
            rx="4"
            fill={`url(#hatchManifold-${uid})`}
            stroke={strokeMain}
            strokeWidth="2"
          />
          {/* Internal Bore Cavity */}
          <rect x="10" y="13" width="180" height="17" rx="2" fill={bg} stroke={strokeMuted} strokeWidth="1" />
          {/* Port Galleries: A (63), P (63 bottom), T (137 bottom), B (137) */}
          <rect x="57" y="1" width="12" height="12" fill={p2Color} fillOpacity="0.45" />
          <rect x="131" y="1" width="12" height="12" fill={p3Color} fillOpacity="0.45" />
          <rect x="57" y="30" width="12" height="12" fill={p1Color} fillOpacity="0.45" />
          <rect x="131" y="30" width="12" height="12" fill={tankColor} fillOpacity="0.45" />

          {/* Centering Springs on both ends */}
          <path d="M 12 21 L 28 21" stroke={textMuted} strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M 172 21 L 188 21" stroke={textMuted} strokeWidth="1.5" strokeDasharray="2 2" />

          {/* Sliding 3-Land Hardened Steel Spool */}
          <g
            style={{
              transform: `translateX(${spoolShiftX}px)`,
              transition: 'transform 180ms ease-out',
            }}
          >
            {/* Central Spool Rod */}
            <rect x="30" y="18.5" width="140" height="6" rx="1.5" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1" />
            {/* Left, Center, Right Spool Lands */}
            <rect x="38" y="14" width="22" height="15" rx="1.5" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1.3" />
            <rect x="89" y="14" width="22" height="15" rx="1.5" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1.3" />
            <rect x="140" y="14" width="22" height="15" rx="1.5" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1.3" />
          </g>

          {/* Port Labels inside Cutaway */}
          <text x="63" y="10" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMain}>A</text>
          <text x="137" y="10" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMain}>B</text>
          <text x="63" y="40" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMain}>P</text>
          <text x="137" y="40" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMain}>T</text>

          {/* Clickable 3-Position Selector Strip integrated cleanly under cutaway */}
          <g transform="translate(0, 46)">
            <g onClick={() => onChangeDcv('extend')} className="cursor-pointer">
              <rect
                x="0"
                y="0"
                width="64"
                height="24"
                rx="4"
                fill={params.dcv === 'extend' ? (isDark ? '#451a03' : '#fef3c7') : cardBg}
                stroke={params.dcv === 'extend' ? '#f59e0b' : strokeMain}
                strokeWidth={params.dcv === 'extend' ? '2.2' : '1.4'}
              />
              <text
                x="32"
                y="15"
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="800"
                fill={params.dcv === 'extend' ? '#f59e0b' : textMuted}
              >
                EXTEND
              </text>
            </g>

            <g onClick={() => onChangeDcv('neutral')} className="cursor-pointer">
              <rect
                x="68"
                y="0"
                width="64"
                height="24"
                rx="4"
                fill={params.dcv === 'neutral' ? (isDark ? '#0c4a6e' : '#e0f2fe') : cardBg}
                stroke={params.dcv === 'neutral' ? '#0284c7' : strokeMain}
                strokeWidth={params.dcv === 'neutral' ? '2.2' : '1.4'}
              />
              <text
                x="100"
                y="15"
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="800"
                fill={params.dcv === 'neutral' ? '#0284c7' : textMuted}
              >
                CENTER
              </text>
            </g>

            <g onClick={() => onChangeDcv('retract')} className="cursor-pointer">
              <rect
                x="136"
                y="0"
                width="64"
                height="24"
                rx="4"
                fill={params.dcv === 'retract' ? (isDark ? '#451a03' : '#fef3c7') : cardBg}
                stroke={params.dcv === 'retract' ? '#f59e0b' : strokeMain}
                strokeWidth={params.dcv === 'retract' ? '2.2' : '1.4'}
              />
              <text
                x="168"
                y="15"
                textAnchor="middle"
                fontSize="8.5"
                fontWeight="800"
                fill={params.dcv === 'retract' ? '#f59e0b' : textMuted}
              >
                RETRACT
              </text>
            </g>
          </g>

          {/* Clean non-overlapping title right of SOL B */}
          <text x="252" y="21" fontSize="9.5" fontWeight="800" fill={textMain}>
            4/3 Solenoid DCV
          </text>
          <text x="252" y="34" fontSize="8.5" fontWeight="600" fill={textMuted}>
            Tandem Center (P→T)
          </text>
        </g>

        {/* ================= 4. PUMP SUPPLY, RELIEF, ACCUMULATOR & TANK RETURN ================= */}
        {/* Pump Outlet (274, 342) -> (348, 342) -> DCV P-Port (348, 299) */}
        <path
          d="M 274 342 L 348 342 L 348 299"
          fill="none"
          stroke={p1Color}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`pumpP-${i}`}
            ref={(el) => {
              pumpParticleRefs.current[i] = el;
            }}
            r="2.4"
            fill="#ffffff"
            opacity="0"
          />
        ))}
        <rect x="342" y="297" width="12" height="6" rx="1" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />

        {/* DCV T-port (422, 299) -> (422, 449) -> Return Diffuser (346, 449) */}
        <path
          d="M 422 299 L 422 449 L 346 449"
          fill="none"
          stroke={tankColor}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`tankP-${i}`}
            ref={(el) => {
              tankParticleRefs.current[i] = el;
            }}
            r="2.3"
            fill="#ffffff"
            opacity="0"
          />
        ))}
        <rect x="416" y="297" width="12" height="6" rx="1" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />

        {/* Supply Branch Header for Relief, Accumulator & P1 */}
        <path
          d="M 286 342 L 286 304 L 108 304 L 108 286"
          fill="none"
          stroke={p1Color}
          strokeWidth="3.8"
          strokeLinejoin="round"
        />
        <circle cx="286" cy="342" r="4" fill={p1Color} />

        {/* P1 Gauge Tap at (216, 304) pointing up */}
        <g transform="translate(216, 304)">
          <line x1="0" y1="0" x2="0" y2="-20" stroke={p1Color} strokeWidth="2" />
          <circle cx="0" cy="-37" r="18" fill={cardBg} stroke={p1Color} strokeWidth="2.2" />
          <text x="0" y="-39" textAnchor="middle" fontSize="9" fontWeight="800" fill={textMain}>
            P1
          </text>
          <text x="0" y="-28" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={p1Color}>
            {Math.round(telemetry.p1PumpBar)}b
          </text>
        </g>

        {/* Gas-Charged Bladder Accumulator at (158, 304) */}
        {params.accumulatorEnabled && (() => {
          const compRatio = Math.max(0, Math.min(1, telemetry.p1PumpBar / 210));
          const bladderY = -24 - compRatio * 14;
          const oilHeight = Math.max(2, -16 - bladderY);
          return (
            <g transform="translate(158, 304)">
              <line x1="0" y1="0" x2="0" y2="-16" stroke={p1Color} strokeWidth="2.5" />
              <rect
                x="-11"
                y="-50"
                width="22"
                height="34"
                rx="11"
                fill={cardBg}
                stroke="#10b981"
                strokeWidth="2"
              />
              <rect
                x="-9"
                y={bladderY}
                width="18"
                height={oilHeight}
                rx="6"
                fill={p1Color}
                fillOpacity="0.6"
              />
              <path
                d={`M -9 ${bladderY} Q 0 ${bladderY - 5} 9 ${bladderY}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.6"
              />
              <text
                x="0"
                y={Math.max(-42, bladderY - 6)}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                fill="#10b981"
              >
                N₂
              </text>
              <text x="0" y="-56" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#10b981">
                Accum.
              </text>
            </g>
          );
        })()}

        {/* ================= 5. SPRING-LOADED RELIEF VALVE CUTAWAY ================= */}
        {/* Relief Bypass Drain Pipe into Submerged Tank */}
        <path
          d="M 78 298 L 78 438"
          fill="none"
          stroke={reliefColor}
          strokeWidth="4"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`relP-${i}`}
            ref={(el) => {
              reliefParticleRefs.current[i] = el;
            }}
            r="2.4"
            fill="#fef08a"
            opacity="0"
          />
        ))}

        {/* Relief Valve Cutaway Body (x: 44..112, y: 226..298) */}
        <g>
          {/* Knurled adjustment screw & locknut */}
          <rect x="69" y="213" width="18" height="13" rx="2" fill={fittingFill} stroke={strokeMain} strokeWidth="1.4" />
          <rect x="65" y="222" width="26" height="5" rx="1" fill={`url(#chrome-${uid})`} stroke={strokeMain} strokeWidth="1.2" />

          {/* Machined Hatched Housing */}
          <rect
            x="44"
            y="227"
            width="68"
            height="71"
            rx="5"
            fill={`url(#hatchManifold-${uid})`}
            stroke={reliefFlowing ? '#ef4444' : strokeMain}
            strokeWidth={reliefFlowing ? '2.4' : '1.8'}
          />
          {/* Cutaway Internal Chamber */}
          <rect
            x="55"
            y="234"
            width="46"
            height="57"
            rx="3"
            fill={cardBg}
            stroke={strokeMuted}
            strokeWidth="1"
          />
          {/* Hardened Valve Seat at bottom */}
          <polygon points="56,281 71,281 74,291 56,291" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          <polygon points="85,281 100,281 100,291 82,291" fill={fittingFill} stroke={strokeMain} strokeWidth="1" />
          {/* Inlet Oil Chamber Glow */}
          <rect
            x="84"
            y="279"
            width="23"
            height="10"
            fill={p1Color}
            fillOpacity="0.4"
          />

          {/* Helical Compression Spring */}
          <path
            d={reliefSpringPath}
            fill="none"
            stroke={reliefFlowing ? '#ef4444' : strokeMain}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Conical Poppet (visibly lifts off seat when bypassing!) */}
          <g
            transform={`translate(0, ${(-reliefLiftPx).toFixed(1)})`}
            style={{ transition: 'transform 120ms ease-out' }}
          >
            <polygon
              points="69,274 87,274 78,287"
              fill={reliefFlowing ? '#ef4444' : '#f59e0b'}
              stroke={strokeMain}
              strokeWidth="1.3"
            />
          </g>

          {/* Bypass oil jet flare across cracked seat */}
          {reliefFlowing && (
            <path
              d="M 74 283 L 72 298 L 84 298 L 82 283 Z"
              fill="#ef4444"
              fillOpacity="0.65"
            />
          )}

          {/* Relief Label cleanly above adjustment knob */}
          <text x="78" y="206" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={textMain}>
            Relief:{' '}
            <tspan fill={reliefFlowing ? '#ef4444' : '#f59e0b'}>
              {params.fault === 'relief-stuck-open' ? 'STUCK!' : `${params.reliefCrackBar} bar`}
            </tspan>
          </text>
        </g>

        {/* ================= 6. TEFC MOTOR + COUPLING + TWIN-GEAR PUMP CUTAWAY ================= */}
        {/* Suction Line from Strainer (155, 434) -> (155, 375) -> (248, 375) -> Pump (248, 366) */}
        <path
          d="M 155 434 L 155 375 L 248 375 L 248 366"
          fill="none"
          stroke={params.fault === 'suction-cavitation' ? '#ef4444' : tankColor}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`sucP-${i}`}
            ref={(el) => {
              suctionParticleRefs.current[i] = el;
            }}
            r="2.2"
            fill="#ffffff"
            opacity="0"
          />
        ))}

        {/* Finned TEFC Electric Motor */}
        <g transform="translate(110, 318)">
          <rect x="8" y="42" width="12" height="22" fill={fittingFill} stroke={strokeMain} strokeWidth="1.2" />
          <rect x="58" y="42" width="12" height="22" fill={fittingFill} stroke={strokeMain} strokeWidth="1.2" />
          {/* Terminal Box on top */}
          <rect x="28" y="-4" width="20" height="8" rx="1.5" fill="#1e40af" stroke={strokeMain} strokeWidth="1.2" />
          {/* Main Motor Frame */}
          <rect
            x="0"
            y="4"
            width="78"
            height="40"
            rx="5"
            fill={`url(#motor-${uid})`}
            stroke={strokeMain}
            strokeWidth="1.8"
          />
          {[14, 22, 30, 38, 46, 54, 62].map((fx) => (
            <line key={fx} x1={fx} y1="6" x2={fx} y2="42" stroke="#1e3a8a" strokeWidth="2" />
          ))}
          <text x="39" y="27" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#ffffff">
            TEFC MOTOR
          </text>
        </g>

        {/* Windowed Bell-Housing Coupling (animated shaft key via rAF) */}
        <g transform="translate(188, 331)">
          <rect x="0" y="2" width="34" height="20" rx="2" fill={fittingFill} stroke={strokeMain} strokeWidth="1.4" />
          <rect x="6" y="4" width="22" height="16" rx="1.5" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          <g ref={couplingKeyRef}>
            <line
              x1="8"
              y1="12"
              x2="26"
              y2="12"
              stroke="#f59e0b"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* External Gear Pump Cutaway (Twin Meshing Gears via rAF) */}
        <g transform="translate(248, 342)">
          {/* Outer Hatched Pump Casing */}
          <rect
            x="-26"
            y="-26"
            width="52"
            height="52"
            rx="14"
            fill={`url(#hatchSteel-${uid})`}
            stroke={
              params.fault === 'suction-cavitation' && params.pumpOn
                ? '#ef4444'
                : params.pumpOn
                  ? '#f59e0b'
                  : strokeMain
            }
            strokeWidth="2.4"
          />
          {/* Figure-8 Gear Pumping Cavity */}
          <circle cx="0" cy="-8.8" r="11.5" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          <circle cx="0" cy="8.8" r="11.5" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          {/* High-pressure crescent on right side */}
          <path
            d="M 5 -18 A 14 14 0 0 1 12 0 A 14 14 0 0 1 5 18 L 15 18 L 15 -18 Z"
            fill={p1Color}
            fillOpacity="0.28"
          />

          {/* Twin Meshing Involute Gears (Zero-rerender rAF rotation) */}
          <g ref={driveGearRef} transform="translate(0, -8.8)">
            <path d={DRIVE_GEAR_PATH} fill="#f59e0b" fillRule="evenodd" stroke={strokeMain} strokeWidth="0.9" />
            <circle cx="0" cy="0" r="2.6" fill={fittingFill} />
          </g>
          <g ref={idlerGearRef} transform="translate(0, 8.8) rotate(18)">
            <path d={IDLER_GEAR_PATH} fill="#94a3b8" fillRule="evenodd" stroke={strokeMain} strokeWidth="0.9" />
            <circle cx="0" cy="0" r="2.6" fill={fittingFill} />
          </g>

          {/* Flow rate badge cleanly under pump housing */}
          <rect x="-24" y="20" width="48" height="12" rx="4" fill={cardBg} stroke={strokeMuted} strokeWidth="1" />
          <text x="0" y="29" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={textMain}>
            {params.pumpOn ? `${telemetry.qPumpLpm.toFixed(0)} L/m` : 'OFF'}
          </text>

          {params.fault === 'suction-cavitation' && params.pumpOn && (
            <text x="34" y="22" fontSize="9" fontWeight="800" fill="#ef4444">
              CAVITATING!
            </text>
          )}
        </g>

        {/* ================= 7. INDUSTRIAL HPU RESERVOIR CUTAWAY ================= */}
        <g transform="translate(34, 382)">
          {/* Welded Steel Tank Body */}
          <rect
            x="0"
            y="0"
            width="340"
            height="100"
            rx="4"
            fill={`url(#tank-${uid})`}
            stroke={strokeMain}
            strokeWidth="2.2"
          />
          {/* Bolted Top Cover Plate */}
          <rect x="-4" y="-6" width="348" height="8" rx="2" fill={fittingFill} stroke={strokeMain} strokeWidth="1.5" />
          {/* Filler / Breather Cap (left of relief line) */}
          <rect x="14" y="-18" width="16" height="12" rx="2" fill={fittingFill} stroke={strokeMain} strokeWidth="1.4" />
          <line x1="17" y1="-13" x2="27" y2="-13" stroke={textMain} strokeWidth="1.2" />

          {/* Oil Body Fill inside Tank */}
          <rect x="2" y="20" width="336" height="78" fill={`url(#oilBody-${uid})`} />

          {/* Animated Oil Surface Wave (rAF) */}
          <path
            ref={oilSurfaceRef}
            d="M 3 20 L 337 20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />

          {/* Center Baffle Plate (separates Return compartment from calm Suction compartment) */}
          <rect
            x="198"
            y="24"
            width="6"
            height="64"
            rx="1"
            fill={fittingFill}
            stroke={strokeMain}
            strokeWidth="1.4"
          />
          <text x="192" y="86" textAnchor="end" fontSize="7" fontWeight="700" fill={textMuted}>
            Baffle
          </text>

          {/* Vertical Sight-Glass Level & Temperature Gauge */}
          <rect x="10" y="20" width="12" height="58" rx="3" fill={cardBg} stroke={strokeMain} strokeWidth="1.4" />
          <rect x="12" y="28" width="8" height="48" rx="2" fill="#f59e0b" />
          <text x="26" y="30" fontSize="7" fontWeight="800" fill={textMuted}>
            MAX
          </text>
          <text x="26" y="75" fontSize="7" fontWeight="800" fill={textMuted}>
            MIN
          </text>

          {/* Submerged Suction Strainer */}
          <g transform="translate(109, 44)">
            <polygon
              points="12,0 24,14 12,28 0,14"
              fill={params.fault === 'suction-cavitation' ? '#fee2e2' : cardBg}
              stroke={params.fault === 'suction-cavitation' ? '#ef4444' : strokeMain}
              strokeWidth="1.8"
            />
            <line
              x1="4"
              y1="14"
              x2="20"
              y2="14"
              stroke={params.fault === 'suction-cavitation' ? '#ef4444' : strokeMain}
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <text x="12" y="39" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={params.fault === 'suction-cavitation' ? '#ef4444' : textMuted}>
              {params.fault === 'suction-cavitation' ? 'Clogged!' : 'Strainer'}
            </text>
          </g>

          {/* Submerged Return Diffuser */}
          <g transform="translate(290, 50)">
            <rect
              x="0"
              y="0"
              width="24"
              height="26"
              rx="3"
              fill={cardBg}
              stroke={tankColor}
              strokeWidth="1.8"
            />
            {[6, 13, 20].map((dy) => (
              <line key={dy} x1="4" y1={dy} x2="20" y2={dy} stroke={tankColor} strokeWidth="1.2" strokeDasharray="3 2" />
            ))}
            <text x="12" y="37" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={textMuted}>
              Diffuser
            </text>
          </g>

          <text x="122" y="93" textAnchor="middle" fontSize="9.5" fontWeight="800" fill={textMain}>
            HPU RESERVOIR • ISO VG 46
          </text>
        </g>

        {/* Cavitation Vapor Micro-Bubbles (rAF) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={`cav-${i}`}
            ref={(el) => {
              cavitationBubbleRefs.current[i] = el;
            }}
            r="2.8"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            opacity="0"
          />
        ))}

        {/* ================= 8. CAD ENGINEERING TITLE & LIVE BALANCE BLOCK ================= */}
        <g transform="translate(460, 368)">
          <rect
            x="0"
            y="0"
            width="392"
            height="114"
            rx="8"
            fill={panelBg}
            stroke={strokeMuted}
            strokeWidth="1.4"
          />
          <line x1="0" y1="24" x2="392" y2="24" stroke={strokeMuted} strokeWidth="1" />
          <text x="12" y="16" fontSize="9.5" fontWeight="800" fill={textMain}>
            HYDRAULIC CIRCUIT TELEMETRY &amp; PASCAL BALANCE
          </text>
          <text x="380" y="16" textAnchor="end" fontSize="8.5" fontWeight="700" fill={oilTempC > 65 ? '#ef4444' : '#f59e0b'}>
            ISO VG 46: {oilTempC.toFixed(1)} °C ({viscosityCst.toFixed(1)} cSt)
          </text>

          {/* Row 1: Geometry & Area Ratio */}
          <text x="12" y="42" fontSize="8.5" fontWeight="700" fill={textMuted}>
            Cylinder Areas
          </text>
          <text x="12" y="55" fontSize="10" fontWeight="800" fill={textMain}>
            A_cap {AREA_CAP_CM2.toFixed(1)} cm² • A_rod {AREA_ANNULUS_CM2.toFixed(1)} cm²
          </text>

          <text x="220" y="42" fontSize="8.5" fontWeight="700" fill={textMuted}>
            Flow Continuity
          </text>
          <text x="220" y="55" fontSize="10" fontWeight="800" fill={textMain}>
            Q_p {telemetry.qPumpLpm.toFixed(1)} = {telemetry.qActuatorLpm.toFixed(1)} + {telemetry.qReliefLpm.toFixed(1)} L/m
          </text>

          <line x1="12" y1="67" x2="380" y2="67" stroke={strokeMuted} strokeWidth="0.9" />

          {/* Row 2: Live Force, Velocity, Power, Efficiency */}
          <text x="12" y="83" fontSize="8.5" fontWeight="700" fill={textMuted}>
            Actuator Velocity
          </text>
          <text x="12" y="99" fontSize="11" fontWeight="800" fill={textMain}>
            {telemetry.velocityMmS.toFixed(1)} mm/s
          </text>

          <text x="125" y="83" fontSize="8.5" fontWeight="700" fill={textMuted}>
            Net Force
          </text>
          <text x="125" y="99" fontSize="11" fontWeight="800" fill="#f59e0b">
            {telemetry.netForceKn.toFixed(1)} kN
          </text>

          <text x="220" y="83" fontSize="8.5" fontWeight="700" fill={textMuted}>
            Hyd. Power
          </text>
          <text x="220" y="99" fontSize="11" fontWeight="800" fill={textMain}>
            {telemetry.hydraulicPowerKw.toFixed(2)} kW
          </text>

          <text x="312" y="83" fontSize="8.5" fontWeight="700" fill={textMuted}>
            Efficiency
          </text>
          <text
            x="312"
            y="99"
            fontSize="11"
            fontWeight="800"
            fill={telemetry.systemEfficiencyPct >= 60 ? '#10b981' : '#f59e0b'}
          >
            {telemetry.systemEfficiencyPct.toFixed(0)}%
          </text>
        </g>
      </svg>
    </div>
  );
}
