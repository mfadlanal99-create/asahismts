import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  VibratingFeederInputs,
  VibratingFeederMetrics,
} from './vibratingFeederMath';

export type FeederHotspotId = 'motor' | 'springs' | 'liner' | 'throat';

interface VibratingFeederSvgProps {
  inputs: VibratingFeederInputs;
  metrics: VibratingFeederMetrics;
  isPlaying?: boolean;
  phaseRad?: number;
  flowOffset?: number;
  onGateChange?: (gateOpeningMm: number) => void;
}

interface SimParticle {
  id: number;
  zone: 'hopper' | 'trough' | 'discharge';
  x: number;
  y: number;
  vx: number;
  vy: number;
  layerFrac: number;
  r: number;
  alt: boolean;
  opacity: number;
}

interface RenderParticle {
  id: number;
  x: number;
  y: number;
  r: number;
  alt: boolean;
  opacity: number;
}

interface PhysicsSnapshot {
  phaseRad: number;
  hopperParticles: RenderParticle[];
  troughParticles: RenderParticle[];
  dischargeParticles: RenderParticle[];
}

function buildCoilSpringPath(
  x: number,
  yTop: number,
  yBottom: number,
  coils: number,
  halfWidth: number,
  broken: boolean
): string {
  const totalH = Math.max(24, yBottom - yTop);
  const step = totalH / (coils * 2);
  if (!broken) {
    let d = `M ${x} ${yTop} L ${x} ${yTop + 4}`;
    for (let i = 0; i < coils * 2; i++) {
      const y = yTop + 4 + (i + 0.5) * (step * 0.9);
      const dir = i % 2 === 0 ? -1 : 1;
      d += ` L ${x + dir * halfWidth} ${y.toFixed(1)}`;
    }
    d += ` L ${x} ${yBottom - 4} L ${x} ${yBottom}`;
    return d;
  }

  const midY = (yTop + yBottom) / 2;
  let d = `M ${x} ${yTop} L ${x} ${yTop + 4}`;
  for (let i = 0; i < coils - 1; i++) {
    const y = yTop + 4 + (i + 0.5) * step;
    const dir = i % 2 === 0 ? -1 : 1;
    d += ` L ${x + dir * halfWidth} ${y.toFixed(1)}`;
  }
  d += ` L ${x - 6} ${(midY - 7).toFixed(1)}`;
  d += ` M ${x + 7} ${(midY + 8).toFixed(1)}`;
  for (let i = coils + 1; i < coils * 2; i++) {
    const y = yTop + 4 + (i + 0.5) * step;
    const dir = i % 2 === 0 ? -1 : 1;
    d += ` L ${x + dir * halfWidth} ${y.toFixed(1)}`;
  }
  d += ` L ${x} ${yBottom}`;
  return d;
}

export function VibratingFeederSvg({
  inputs,
  metrics,
  isPlaying = true,
  onGateChange,
}: VibratingFeederSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { pick } = useLanguage();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingGate, setIsDraggingGate] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<FeederHotspotId | null>('motor');

  const [snapshot, setSnapshot] = useState<PhysicsSnapshot>({
    phaseRad: 0,
    hopperParticles: [],
    troughParticles: [],
    dischargeParticles: [],
  });

  const phaseRad = snapshot.phaseRad;

  const palette = useMemo(
    () => ({
      bgTop: 'var(--md-surface-container-low)',
      bgBottom: 'var(--md-surface-container)',
      grid: 'color-mix(in srgb, var(--md-outline-variant) 35%, transparent)',
      steel: isDark ? '#334155' : '#64748b',
      steelLight: isDark ? '#64748b' : '#94a3b8',
      steelDark: isDark ? '#1e293b' : '#475569',
      liner: isDark ? '#d97706' : '#b45309',
      textMain: 'var(--md-on-surface)',
      textMuted: 'var(--md-on-surface-variant)',
      particle: isDark ? '#fbbf24' : '#d97706',
      particleAlt: isDark ? '#f59e0b' : '#b45309',
      spring: 'var(--md-primary)',
      danger: '#ef4444',
      emerald: '#10b981',
      amber: '#f59e0b',
      cyan: 'var(--md-primary)',
    }),
    [isDark]
  );

  const isBrokenSpring = inputs.faultMode === 'broken-spring';
  const isBridging = inputs.faultMode === 'hopper-bridging';
  const isPhaseSlip = inputs.faultMode === 'phase-slip';

  // Vibration displacement along throw angle
  const totalTiltDeg = inputs.troughInclinationDeg + metrics.troughTiltDeg;
  const throwWorldRad = ((inputs.throwAngleDeg - totalTiltDeg) * Math.PI) / 180;
  const oscAmplitudePx = Math.min(8.0, Math.max(1.2, metrics.effectiveStrokeMm * 0.62));
  const oscShift = Math.sin(phaseRad) * oscAmplitudePx;
  const oscX = oscShift * Math.cos(throwWorldRad);
  const oscY = -oscShift * Math.sin(throwWorldRad);

  // Trough pivot and geometry
  const pivotX = 270;
  const pivotY = 270;
  const troughTopAtGateY = 261;

  // Gate height mapping (40..300 mm -> 14..74 px opening above trough liner)
  const gateOpenPx = 14 + ((inputs.gateOpeningMm - 40) / 260) * 60;
  const gateBottomY = troughTopAtGateY - gateOpenPx;

  // Live material bed height & width scaling (conservation of mass)
  const bedFillRatio = isBridging
    ? 0.22
    : Math.max(0.62, Math.min(0.92, metrics.materialBedDepthMm / Math.max(1, inputs.gateOpeningMm)));
  const bedHeightPx = Math.max(5, gateOpenPx * bedFillRatio);
  const widthFactor = 0.65 + ((inputs.troughWidthMm - 300) / 1300) * 0.7;

  // Spring end positions (include static sag offset)
  const rearSpringX = 270;
  const frontSpringX = 595;
  const baseTopY = 374;
  const staticSagPx = Math.min(10, metrics.springDeflectionMm * 0.45);
  const tiltRad = (totalTiltDeg * Math.PI) / 180;
  const rearTroughBottomY = pivotY + 18 + staticSagPx * 0.4 + oscY;
  const frontTroughBottomY =
    pivotY +
    18 +
    staticSagPx * (isBrokenSpring ? 1.1 : 0.4) +
    (frontSpringX - pivotX) * Math.sin(tiltRad) +
    oscY;

  // World coordinates of the trough discharge lip (local x=698, y=261)
  const lipDx = 698 - pivotX;
  const lipDy = 261 - pivotY;
  const lipBaseX = pivotX + lipDx * Math.cos(tiltRad) - lipDy * Math.sin(tiltRad);
  const lipBaseY = pivotY + lipDx * Math.sin(tiltRad) + lipDy * Math.cos(tiltRad);

  // Discharge chute world geometry (adapts cleanly to trough lip height)
  const chuteRearTopX = Math.min(682, lipBaseX - 16);
  const chuteRearTopY = Math.min(358, Math.max(274, lipBaseY + 16));
  const chuteOutletLeftX = 734;
  const chuteOutletRightX = 790;
  const chuteOutletY = 392;
  const chuteFrontTopY = Math.min(228, lipBaseY - 42);

  // Keep latest props & derived geometry accessible in RAF without restarting the loop
  const paramsRef = useRef({
    inputs,
    metrics,
    isPlaying,
    isBridging,
    gateOpenPx,
    bedHeightPx,
    widthFactor,
    oscAmplitudePx,
    throwWorldRad,
    tiltRad,
    chuteRearTopX,
    chuteRearTopY,
    chuteOutletLeftX,
    chuteOutletRightX,
    chuteOutletY,
  });
  useEffect(() => {
    paramsRef.current = {
      inputs,
      metrics,
      isPlaying,
      isBridging,
      gateOpenPx,
      bedHeightPx,
      widthFactor,
      oscAmplitudePx,
      throwWorldRad,
      tiltRad,
      chuteRearTopX,
      chuteRearTopY,
      chuteOutletLeftX,
      chuteOutletRightX,
      chuteOutletY,
    };
  });

  const simRef = useRef<{
    phaseRad: number;
    particles: SimParticle[];
    nextId: number;
    spawnAccum: number;
    lastTimeMs: number | null;
    initialized: boolean;
  }>({
    phaseRad: 0,
    particles: [],
    nextId: 1,
    spawnAccum: 0,
    lastTimeMs: null,
    initialized: false,
  });

  // Real-time dt physics engine (requestAnimationFrame + useRef)
  useEffect(() => {
    let rafId = 0;

    function createInitialParticles() {
      const p = paramsRef.current;
      const sim = simRef.current;
      const gateFactor = p.metrics.effectiveGateMm / 120;
      const initialTroughCount = Math.round(
        Math.min(95, Math.max(14, 34 * gateFactor * p.widthFactor))
      );
      const initialHopperCount = Math.round(
        Math.min(28, Math.max(6, 12 * gateFactor * p.widthFactor))
      );

      for (let i = 0; i < initialHopperCount; i++) {
        const frac = (i + 0.5) / initialHopperCount;
        const py = 96 + frac * (p.isBridging ? 78 : 148);
        const leftBound = py < 180 ? 158 + ((py - 96) / 84) * 32 : 190;
        const lane = ((i * 37) % 100) / 100;
        sim.particles.push({
          id: sim.nextId++,
          zone: 'hopper',
          x: leftBound + 4 + lane * Math.max(8, 242 - leftBound - 4),
          y: py,
          vx: 0,
          vy: 75,
          layerFrac: ((i * 29) % 100) / 100,
          r: 2.2 + (i % 3) * 0.5,
          alt: i % 2 === 1,
          opacity: p.isBridging ? 0.55 : 0.9,
        });
      }

      for (let i = 0; i < initialTroughCount; i++) {
        const u = (i + 0.5) / initialTroughCount;
        const layerFrac = ((i * 43) % 100) / 100;
        const r = 2.3 + (i % 3) * 0.55;
        const seatY = 261 - r - Math.max(0, p.bedHeightPx - r * 2) * layerFrac;
        sim.particles.push({
          id: sim.nextId++,
          zone: 'trough',
          x: 192 + u * (695 - 192),
          y: seatY,
          vx: Math.max(12, p.metrics.conveyingVelocityMs * 235),
          vy: 0,
          layerFrac,
          r,
          alt: i % 2 === 1,
          opacity: 0.95,
        });
      }
      sim.initialized = true;
    }

    function step(nowMs: number) {
      const p = paramsRef.current;
      const sim = simRef.current;

      if (!sim.initialized) {
        createInitialParticles();
      }

      if (sim.lastTimeMs === null) {
        sim.lastTimeMs = nowMs;
      }
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - sim.lastTimeMs) / 1000));
      sim.lastTimeMs = nowMs;

      if (p.isPlaying) {
        // Visual angular frequency scaled so 60fps renders smooth eccentric rotation
        const visualOmega = Math.min(26, Math.max(4, p.inputs.driveFrequencyHz * 0.6));
        sim.phaseRad = (sim.phaseRad + visualOmega * dt) % (Math.PI * 2);

        const curOscShift = Math.sin(sim.phaseRad) * p.oscAmplitudePx;
        const curOscX = curOscShift * Math.cos(p.throwWorldRad);
        const curOscY = -curOscShift * Math.sin(p.throwWorldRad);

        // Conservation of mass: spawn rate proportional to gate opening * trough width * velocity
        const gateFactor = p.metrics.effectiveGateMm / 120;
        const velFactor = Math.max(0.14, p.metrics.conveyingVelocityMs / 0.22);
        const spawnRate = Math.min(95, Math.max(5, 22 * gateFactor * p.widthFactor * velFactor));
        sim.spawnAccum += spawnRate * dt;

        const maxParticles = 220;
        while (sim.spawnAccum >= 1 && sim.particles.length < maxParticles) {
          sim.spawnAccum -= 1;
          const randLane = Math.random();
          const randLayer = Math.random();
          const throatLeft = 160 + randLane * 82;
          sim.particles.push({
            id: sim.nextId++,
            zone: 'hopper',
            x: throatLeft,
            y: 86 + Math.random() * 14,
            vx: 0,
            vy: 30 + Math.random() * 20,
            layerFrac: randLayer,
            r: 2.1 + Math.random() * 1.3,
            alt: Math.random() < 0.45,
            opacity: p.isBridging ? 0.55 : 0.9,
          });
        }
        if (sim.particles.length >= maxParticles) {
          sim.spawnAccum = Math.min(sim.spawnAccum, 1);
        }

        const instNormalG = p.metrics.normalGForce * Math.sin(sim.phaseRad);
        const canThrowNow =
          p.metrics.throwIndexKv > 1.0 && instNormalG > p.metrics.throwOffThresholdG;
        const excessKv = Math.min(3.5, Math.max(0, p.metrics.throwIndexKv - 1.0));
        const baseVxTrough = Math.max(10, p.metrics.conveyingVelocityMs * 235);

        const rearWallDx = p.chuteOutletLeftX - p.chuteRearTopX;
        const rearWallDy = Math.max(12, p.chuteOutletY - p.chuteRearTopY);
        const rearWallLen = Math.hypot(rearWallDx, rearWallDy);
        const rearTx = rearWallDx / rearWallLen;
        const rearTy = rearWallDy / rearWallLen;

        const frontWallDx = p.chuteOutletRightX - 5 - 800;
        const frontWallDy = Math.max(12, p.chuteOutletY - 326);
        const frontWallLen = Math.hypot(frontWallDx, frontWallDy);
        const frontTx = frontWallDx / frontWallLen;
        const frontTy = frontWallDy / frontWallLen;

        const surviving: SimParticle[] = [];
        for (let i = 0; i < sim.particles.length; i++) {
          const pt = sim.particles[i];

          if (pt.zone === 'hopper') {
            pt.vy = Math.min(145, pt.vy + 260 * dt);
            pt.y += pt.vy * dt;

            // Funnel inward toward the gate throat (x=190..244)
            const leftWallX = pt.y < 180 ? 158 + ((pt.y - 96) / 84) * 32 : 190;
            if (pt.x < leftWallX + pt.r) pt.x = leftWallX + pt.r;
            if (pt.x > 243 - pt.r) pt.x = 243 - pt.r;

            // Hopper bridging stalls most material at the arch
            if (p.isBridging && pt.y >= 176 && pt.y <= 188 && pt.id % 5 !== 0) {
              pt.y = 176;
              pt.vy = 0;
              pt.opacity = 0.5;
              surviving.push(pt);
              continue;
            }

            const targetBedY =
              261 - pt.r - Math.max(0, p.bedHeightPx - pt.r * 2) * pt.layerFrac;
            if (pt.y >= targetBedY) {
              pt.zone = 'trough';
              pt.x = Math.max(190, Math.min(244, pt.x));
              pt.y = targetBedY;
              pt.vy = 0;
              pt.vx = baseVxTrough;
              pt.opacity = 0.95;
            }
            surviving.push(pt);
          } else if (pt.zone === 'trough') {
            const seatY =
              261 - pt.r - Math.max(0, p.bedHeightPx - pt.r * 2) * pt.layerFrac;

            if (p.metrics.throwIndexKv <= 1.0) {
              // Sub-threshold: seated / creeping slowly along liner
              pt.y += (seatY - pt.y) * Math.min(1, 14 * dt);
              pt.vy = 0;
            } else {
              // Micro-throw & parabolic hop
              if (canThrowNow && pt.y >= seatY - 1.2) {
                pt.vy =
                  -(24 + excessKv * 28 + p.metrics.singleAmplitudeMm * 3.2) *
                  (0.55 + 0.45 * pt.layerFrac);
              }
              if (pt.y < seatY || pt.vy < 0) {
                pt.vy += 420 * dt;
                pt.y += pt.vy * dt;
                if (pt.y >= seatY) {
                  pt.y = seatY;
                  pt.vy =
                    p.metrics.throwIndexKv > 3.3 ? -Math.abs(pt.vy) * 0.16 : 0;
                }
              } else {
                pt.y = seatY;
                pt.vy = 0;
              }
            }

            // Advance horizontally along trough
            pt.vx = baseVxTrough * (0.88 + 0.24 * pt.layerFrac);
            pt.x += pt.vx * dt;

            if (pt.x >= 698) {
              // Transform trough-local position to world space at discharge lip
              const dx = pt.x - pivotX;
              const dy = pt.y - pivotY;
              const cosT = Math.cos(p.tiltRad);
              const sinT = Math.sin(p.tiltRad);
              pt.x = pivotX + dx * cosT - dy * sinT + curOscX;
              pt.y = pivotY + dx * sinT + dy * cosT + curOscY;

              const launchSpeed = Math.max(
                28,
                p.metrics.conveyingVelocityMs * 210 + p.metrics.throwIndexKv * 14
              );
              pt.vx = launchSpeed * cosT;
              pt.vy =
                launchSpeed * sinT -
                (p.metrics.throwIndexKv > 1.0 ? Math.min(26, excessKv * 9) : 0);
              pt.zone = 'discharge';
            }
            surviving.push(pt);
          } else {
            // Free-fall projectile motion in discharge chute
            pt.vy += 380 * dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;

            // Collide & slide down angled rear chute wall
            if (pt.y >= p.chuteRearTopY) {
              const rearFrac = Math.max(
                0,
                Math.min(1, (pt.y - p.chuteRearTopY) / rearWallDy)
              );
              const rearX = p.chuteRearTopX + rearFrac * rearWallDx;
              if (pt.x < rearX + pt.r) {
                pt.x = rearX + pt.r;
                const proj = Math.max(40, pt.vx * rearTx + pt.vy * rearTy) * 0.92;
                pt.vx = proj * rearTx;
                pt.vy = proj * rearTy;
              }
            }

            // Collide & slide down front chute wear liner
            const frontX =
              pt.y <= 326
                ? 800
                : 800 +
                  ((pt.y - 326) / frontWallDy) * frontWallDx;
            if (pt.x > frontX - pt.r) {
              pt.x = frontX - pt.r;
              if (pt.y <= 326) {
                pt.vx = -Math.abs(pt.vx) * 0.2;
              } else {
                const proj = Math.max(40, pt.vx * frontTx + pt.vy * frontTy) * 0.92;
                pt.vx = proj * frontTx;
                pt.vy = proj * frontTy;
              }
            }

            pt.opacity =
              pt.y > p.chuteOutletY - 12
                ? Math.max(0.1, 1 - (pt.y - (p.chuteOutletY - 12)) / 18)
                : 0.92;

            if (pt.y <= p.chuteOutletY + 10) {
              surviving.push(pt);
            }
          }
        }
        sim.particles = surviving;
      }

      const hopperParticles: RenderParticle[] = [];
      const troughParticles: RenderParticle[] = [];
      const dischargeParticles: RenderParticle[] = [];
      for (let i = 0; i < sim.particles.length; i++) {
        const pt = sim.particles[i];
        const rp: RenderParticle = {
          id: pt.id,
          x: pt.x,
          y: pt.y,
          r: pt.r,
          alt: pt.alt,
          opacity: pt.opacity,
        };
        if (pt.zone === 'hopper') hopperParticles.push(rp);
        else if (pt.zone === 'trough') troughParticles.push(rp);
        else dischargeParticles.push(rp);
      }

      setSnapshot({
        phaseRad: sim.phaseRad,
        hopperParticles,
        troughParticles,
        dischargeParticles,
      });

      rafId = window.requestAnimationFrame(step);
    }

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Interactive Gate Dragging
  function updateGateFromClientY(clientY: number) {
    if (!svgRef.current || !onGateChange) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.height <= 0) return;
    const svgY = ((clientY - rect.top) / rect.height) * 520;
    const openPx = Math.max(14, Math.min(74, troughTopAtGateY - svgY));
    const rawMm = 40 + ((openPx - 14) / 60) * 260;
    const snappedMm = Math.round(rawMm / 5) * 5;
    onGateChange(Math.max(40, Math.min(300, snappedMm)));
  }

  function handleGatePointerDown(e: ReactPointerEvent<SVGGElement>) {
    if (!onGateChange) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingGate(true);
    updateGateFromClientY(e.clientY);
  }

  function handleGatePointerMove(e: ReactPointerEvent<SVGGElement>) {
    if (!isDraggingGate) return;
    updateGateFromClientY(e.clientY);
  }

  function handleGatePointerUp(e: ReactPointerEvent<SVGGElement>) {
    if (!isDraggingGate) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDraggingGate(false);
  }

  // Live Material Bed Polygon & Surface Line (trough-local coordinates, on liner y=261)
  const { bedPolygonPath, bedTopLinePath } = useMemo(() => {
    const linerY = 261;
    const gateX = 250;
    const rearX = 186;
    const lipStartX = 682;
    const lipEndX = 698;
    const throatTopY = linerY - Math.min(68, bedHeightPx * 1.15);
    const bedTopY = linerY - bedHeightPx;
    const lipTipY = linerY - Math.max(3, bedHeightPx * 0.42);

    const pts: Array<[number, number]> = [
      [rearX, throatTopY],
      [gateX, bedTopY],
    ];
    const segments = 14;
    const rippleAmp = metrics.throwIndexKv > 1.0 ? Math.min(2.2, (metrics.throwIndexKv - 1) * 0.7) : 0.4;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const sx = gateX + t * (lipStartX - gateX);
      const ripple = Math.sin(t * Math.PI * 6 - phaseRad) * rippleAmp;
      pts.push([sx, Math.min(linerY - 3, bedTopY + ripple)]);
    }
    pts.push([lipEndX, lipTipY]);

    const topLine = pts
      .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(' ');
    const polygon = `${topLine} L ${lipEndX} ${linerY} L ${rearX} ${linerY} Z`;
    return { bedPolygonPath: polygon, bedTopLinePath: topLine };
  }, [bedHeightPx, metrics.throwIndexKv, phaseRad]);

  const { hopperParticles, troughParticles, dischargeParticles } = snapshot;

  // Oscilloscope waveform paths (x = 24..620 inside oscilloscope strip)
  const scopePaths = useMemo(() => {
    const w = 560;
    const midY = 472;
    const maxG = Math.max(3.5, metrics.normalGForce * 1.25, metrics.throwOffThresholdG * 1.4);
    const scaleG = 28 / maxG;
    const scaleDisp = 24 / Math.max(4, inputs.strokeMm * 0.6);

    let accelPath = '';
    let dispPath = '';
    const samples = 96;
    for (let i = 0; i <= samples; i++) {
      const tNorm = i / samples;
      const theta = phaseRad - (1 - tNorm) * Math.PI * 4; // 2 cycles
      const x = 28 + tNorm * w;
      const yAccel = midY - Math.sin(theta) * metrics.normalGForce * scaleG;
      const yDisp = midY - (-Math.sin(theta)) * metrics.singleAmplitudeMm * scaleDisp;
      accelPath += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yAccel.toFixed(1)} `;
      dispPath += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yDisp.toFixed(1)} `;
    }
    const thresholdY = midY - metrics.throwOffThresholdG * scaleG;
    return { accelPath, dispPath, thresholdY, midY };
  }, [
    inputs.strokeMm,
    metrics.normalGForce,
    metrics.singleAmplitudeMm,
    metrics.throwOffThresholdG,
    phaseRad,
  ]);

  // Dual eccentric shaft angles
  const eccAngle1Deg = (phaseRad * 180) / Math.PI;
  const eccAngle2Deg = -eccAngle1Deg + metrics.phaseSlipDeg;

  const kvColor =
    metrics.throwIndexKv < 1.0
      ? palette.amber
      : metrics.throwIndexKv > 3.5
        ? palette.danger
        : palette.emerald;

  // Hotspot telemetry readout data
  const phaseDegDisplay = Math.round(((phaseRad * 180) / Math.PI) % 360);
  const hotspotData = useMemo(() => {
    const motorTemp = Math.round(
      48 + metrics.motorPowerKw * 4.5 + (isPhaseSlip ? 24 : 0) + (metrics.inResonanceZone ? 16 : 0)
    );
    const springTemp = Math.round(28 + (metrics.inResonanceZone ? 18 : 2) + (isBrokenSpring ? 12 : 0));
    const linerTemp = Math.round(32 + metrics.linerWearIndex * 0.42);
    const throatTemp = Math.round(27 + (isBridging ? 6 : 1));

    const map: Record<
      FeederHotspotId,
      { title: string; gForce: string; phase: string; temp: string; detail: string; status: 'ok' | 'warn' | 'crit' }
    > = {
      motor: {
        title: pick('Drive Motor & Exciter', 'Motor & Eksentrik', '加振機・駆動モータ'),
        gForce: `${metrics.peakGForce.toFixed(2)} g`,
        phase: `${phaseDegDisplay}° (Δφ=${metrics.phaseSlipDeg}°)`,
        temp: `${motorTemp} °C`,
        detail: `${metrics.motorPowerKw.toFixed(2)} kW · ${metrics.motorCurrentA.toFixed(1)} A · ${metrics.driveRpm} RPM`,
        status: isPhaseSlip ? 'crit' : metrics.inResonanceZone ? 'warn' : 'ok',
      },
      springs: {
        title: pick('Isolation Coil Springs', 'Pegas Koil Isolasi', '防振コイルばね'),
        gForce: `${(metrics.peakGForce * metrics.transmissibility).toFixed(2)} g`,
        phase: `${(phaseDegDisplay + 180) % 360}°`,
        temp: `${springTemp} °C`,
        detail: `${metrics.springStaticLoadKn.toFixed(2)} kN stat · ${metrics.springDynamicLoadKn.toFixed(2)} kN dyn · η=${metrics.isolationEfficiencyPct.toFixed(0)}%`,
        status: isBrokenSpring || metrics.inResonanceZone ? 'crit' : 'ok',
      },
      liner: {
        title: pick('Wear Liner Plate', 'Pelat Liner Aus', '耐摩耗ライナー板'),
        gForce: `${metrics.normalGForce.toFixed(2)} g (n)`,
        phase: `${phaseDegDisplay}°`,
        temp: `${linerTemp} °C`,
        detail: `${pick('Wear Index', 'Indeks Aus', '摩耗指数')}: ${metrics.linerWearIndex.toFixed(0)}/100 · Kᵥ=${metrics.throwIndexKv.toFixed(2)}`,
        status: metrics.linerWearIndex > 78 ? 'warn' : 'ok',
      },
      throat: {
        title: pick('Hopper Throat & Gate', 'Leher Corong & Gerbang', 'ホッパー喉部・ゲート'),
        gForce: `${(metrics.peakGForce * 0.35).toFixed(2)} g`,
        phase: `${phaseDegDisplay}°`,
        temp: `${throatTemp} °C`,
        detail: `H=${inputs.gateOpeningMm} mm · ${pick('Bed', 'Lapisan', '層厚')}=${metrics.materialBedDepthMm.toFixed(0)} mm`,
        status: isBridging ? 'crit' : 'ok',
      },
    };
    return map;
  }, [
    inputs.gateOpeningMm,
    isBridging,
    isBrokenSpring,
    isPhaseSlip,
    metrics,
    phaseDegDisplay,
    pick,
  ]);

  const activeInfo = activeHotspot ? hotspotData[activeHotspot] : null;

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2">
      <svg
        ref={svgRef}
        viewBox="0 0 860 520"
        className="h-auto w-full select-none"
        role="img"
        aria-label={pick(
          'Vibrating Feeder Side Cutaway Diagram',
          'Diagram Potongan Samping Vibrating Feeder',
          '振動フィーダ断面図'
        )}
      >
        <defs>
          <linearGradient id="vf-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.bgTop} />
            <stop offset="100%" stopColor={palette.bgBottom} />
          </linearGradient>
          <linearGradient id="vf-steel-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#64748b' : '#94a3b8'} />
            <stop offset="50%" stopColor={isDark ? '#334155' : '#64748b'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
          </linearGradient>
          <linearGradient id="vf-liner-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="vf-exciter-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#64748b'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#334155'} />
          </linearGradient>
          <pattern
            id="vf-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={palette.grid}
              strokeWidth="1"
            />
          </pattern>
          <marker
            id="vf-arrow-amber"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={palette.amber} />
          </marker>
        </defs>

        {/* Background & Blueprint Grid */}
        <rect width="860" height="520" rx="16" fill="url(#vf-bg)" />
        <rect width="860" height="520" rx="16" fill="url(#vf-grid)" />

        {/* Floor / Concrete Foundation */}
        <rect
          x="35"
          y="394"
          width="790"
          height="16"
          rx="3"
          fill={palette.steelDark}
          opacity="0.85"
        />
        <line
          x1="35"
          y1="394"
          x2="825"
          y2="394"
          stroke={palette.steelLight}
          strokeWidth="1.5"
        />

        {/* Structural Spring Pedestals */}
        <g>
          <rect
            x={rearSpringX - 26}
            y="374"
            width="52"
            height="20"
            rx="2"
            fill="url(#vf-steel-grad)"
          />
          <rect
            x={frontSpringX - 26}
            y="374"
            width="52"
            height="20"
            rx="2"
            fill="url(#vf-steel-grad)"
          />
          <circle cx={rearSpringX - 16} cy="390" r="2.5" fill={palette.textMuted} />
          <circle cx={rearSpringX + 16} cy="390" r="2.5" fill={palette.textMuted} />
          <circle cx={frontSpringX - 16} cy="390" r="2.5" fill={palette.textMuted} />
          <circle cx={frontSpringX + 16} cy="390" r="2.5" fill={palette.textMuted} />
        </g>

        {/* Isolation Coil Springs */}
        <g>
          <path
            d={buildCoilSpringPath(
              rearSpringX,
              rearTroughBottomY,
              baseTopY,
              6,
              14,
              false
            )}
            fill="none"
            stroke={palette.spring}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={buildCoilSpringPath(
              frontSpringX,
              frontTroughBottomY,
              baseTopY,
              6,
              14,
              isBrokenSpring
            )}
            fill="none"
            stroke={isBrokenSpring ? palette.danger : palette.spring}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isBrokenSpring && (
            <g>
              <circle
                cx={frontSpringX}
                cy={(frontTroughBottomY + baseTopY) / 2}
                r="16"
                fill="rgba(239,68,68,0.18)"
                stroke={palette.danger}
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text
                x={frontSpringX + 26}
                y={(frontTroughBottomY + baseTopY) / 2 + 4}
                fill={palette.danger}
                fontSize="11"
                fontWeight="700"
              >
                {pick('BROKEN SPRING', 'PEGAS PATAH', 'ばね破損')}
              </text>
            </g>
          )}
        </g>

        {/* Vibrating Trough Assembly + Material Particles */}
        <g
          transform={`translate(${oscX.toFixed(2)}, ${oscY.toFixed(2)}) rotate(${totalTiltDeg.toFixed(2)}, ${pivotX}, ${pivotY})`}
        >
          {/* Trough Side Wall */}
          <path
            d="M 158 210 L 178 270 L 705 270 L 716 250 L 698 250 L 695 264 L 184 264 L 168 210 Z"
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1.5"
          />
          {/* Wear Liner Plate */}
          <rect
            x="182"
            y="261"
            width="514"
            height="5.5"
            rx="1"
            fill="url(#vf-liner-grad)"
          />
          {/* Side Skirt Outline + Bolts */}
          <path
            d="M 178 214 L 700 238 L 705 270 L 178 270 Z"
            fill={isDark ? 'rgba(51,65,85,0.28)' : 'rgba(148,163,184,0.22)'}
            stroke={palette.steelLight}
            strokeWidth="1.2"
          />
          {[210, 290, 370, 450, 530, 610, 680].map((bx) => (
            <circle
              key={bx}
              cx={bx}
              cy="265.5"
              r="1.8"
              fill={palette.textMain}
              opacity="0.55"
            />
          ))}

          {/* Trough Length Dimension Tag */}
          <text
            x="665"
            y="233"
            textAnchor="end"
            fill={palette.textMuted}
            fontSize="9.5"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            L = {inputs.troughLengthM.toFixed(1)} m · W = {inputs.troughWidthMm} mm
          </text>

          {/* Spring Top Brackets */}
          <rect
            x={rearSpringX - 18}
            y="270"
            width="36"
            height="14"
            rx="2"
            fill={palette.steelDark}
            stroke={palette.steelLight}
            strokeWidth="1"
          />
          <rect
            x={frontSpringX - 18}
            y="270"
            width="36"
            height="14"
            rx="2"
            fill={palette.steelDark}
            stroke={palette.steelLight}
            strokeWidth="1"
          />

          {/* Dual Eccentric Vibrator Drive Housing */}
          <g transform="translate(430, 304)">
            <rect
              x="-54"
              y="-34"
              width="108"
              height="48"
              rx="8"
              fill="url(#vf-exciter-grad)"
              stroke={isPhaseSlip ? palette.danger : palette.steelLight}
              strokeWidth={isPhaseSlip ? '2' : '1.5'}
            />
            {/* Shaft 1 */}
            <g transform={`translate(-24, -10) rotate(${eccAngle1Deg.toFixed(1)})`}>
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="none"
                stroke={palette.steelLight}
                strokeWidth="1.5"
              />
              <path d="M -13 0 A 13 13 0 0 1 13 0 Z" fill={palette.amber} />
              <circle cx="0" cy="0" r="3.5" fill={palette.textMain} />
            </g>
            {/* Shaft 2 */}
            <g transform={`translate(24, -10) rotate(${eccAngle2Deg.toFixed(1)})`}>
              <circle
                cx="0"
                cy="0"
                r="14"
                fill="none"
                stroke={palette.steelLight}
                strokeWidth="1.5"
              />
              <path
                d="M -13 0 A 13 13 0 0 1 13 0 Z"
                fill={isPhaseSlip ? palette.danger : palette.amber}
              />
              <circle cx="0" cy="0" r="3.5" fill={palette.textMain} />
            </g>
            <text
              x="0"
              y="27"
              textAnchor="middle"
              fill={isPhaseSlip ? palette.danger : palette.textMuted}
              fontSize="9.5"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {isPhaseSlip
                ? pick('PHASE SLIP (Δφ=58°)', 'SLIP FASA (Δφ=58°)', '位相ずれ (Δφ=58°)')
                : `${metrics.motorPowerKw.toFixed(1)} kW · ${metrics.driveRpm} RPM`}
            </text>
          </g>

          {/* Live Granular Material Bed Polygon (scales with gateOpeningMm & troughWidthMm) */}
          <path
            d={bedPolygonPath}
            fill={palette.particle}
            opacity={Math.min(0.46, 0.24 + widthFactor * 0.14)}
          />
          <path
            d={bedTopLinePath}
            fill="none"
            stroke={palette.particleAlt}
            strokeWidth="1.6"
            opacity="0.8"
          />

          {/* Animated Granular Material Particles on Trough */}
          <g>
            {troughParticles.map((p) => (
              <circle
                key={p.id}
                cx={p.x.toFixed(1)}
                cy={p.y.toFixed(1)}
                r={p.r}
                fill={p.alt ? palette.particleAlt : palette.particle}
                opacity={p.opacity}
              />
            ))}
          </g>

          {/* Throw Angle Vector Arrow */}
          <g transform="translate(335, 238)">
            <line
              x1="0"
              y1="0"
              x2="48"
              y2="0"
              stroke={palette.textMuted}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1="0"
              y1="0"
              x2={Math.cos((inputs.throwAngleDeg * Math.PI) / 180) * 52}
              y2={-Math.sin((inputs.throwAngleDeg * Math.PI) / 180) * 52}
              stroke={palette.amber}
              strokeWidth="2.2"
              markerEnd="url(#vf-arrow-amber)"
            />
            <text
              x="36"
              y="-24"
              fill={palette.amber}
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              β = {inputs.throwAngleDeg}°
            </text>
          </g>
        </g>

        {/* Fixed Feed Hopper, Charging Chute, Skirtboards & Interactive Gate */}
        <g>
          {/* Bulk Material Column inside Hopper & Chute Throat */}
          <path
            d={`M 146 72 Q 196 54 246 72 L 246 257 L 186 257 L 186 178 L 146 88 Z`}
            fill={palette.particle}
            opacity={Math.min(0.38, 0.18 + (bedHeightPx / 74) * 0.16)}
          />
          <path
            d="M 146 72 Q 196 54 246 72"
            fill="none"
            stroke={palette.particle}
            strokeWidth="2"
          />
          {/* Descending Material Column Particles */}
          {hopperParticles.map((p) => (
            <circle
              key={`hp-${p.id}`}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={p.r}
              fill={p.alt ? palette.particleAlt : palette.particle}
              opacity={p.opacity}
            />
          ))}

          {/* Hopper Top Structural Flange */}
          <rect
            x="130"
            y="39"
            width="128"
            height="6"
            rx="1.5"
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1"
          />
          {/* Left Sloped Hopper Wall -> Vertical Chute Throat */}
          <path
            d="M 134 45 L 178 180 L 178 250 L 186 250 L 186 178 L 143 45 Z"
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1.2"
          />
          {/* Right Hopper Wall (aligned to chute throat & gate) */}
          <path
            d="M 246 45 L 254 45 L 254 184 L 246 184 Z"
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1.2"
          />

          {/* Stationary Feed Skirtboards & Rubber Seal Strip */}
          <g>
            <path
              d="M 186 220 L 308 232 L 308 251 L 186 251 Z"
              fill={isDark ? 'rgba(51, 65, 85, 0.55)' : 'rgba(100, 116, 139, 0.35)'}
              stroke={palette.steelLight}
              strokeWidth="1.2"
            />
            {/* Rubber Skirt Seal along bottom edge (clears oscillating trough liner) */}
            <rect
              x="179"
              y="250"
              width="130"
              height="5"
              rx="1"
              fill={isDark ? '#0f172a' : '#334155'}
              stroke={palette.steelDark}
              strokeWidth="0.8"
            />
            {[200, 232, 266, 296].map((sbx) => (
              <circle
                key={`sb-${sbx}`}
                cx={sbx}
                cy="242"
                r="1.8"
                fill={palette.textMain}
                opacity="0.6"
              />
            ))}
          </g>

          {isBridging && (
            <g>
              <path
                d="M 186 196 Q 216 168 246 196 L 246 212 Q 216 186 186 212 Z"
                fill="rgba(239, 68, 68, 0.35)"
                stroke={palette.danger}
                strokeWidth="2"
              />
              <text
                x="216"
                y="168"
                textAnchor="middle"
                fill={palette.danger}
                fontSize="10.5"
                fontWeight="700"
              >
                {pick('HOPPER BRIDGING', 'PENYUMBATAN CORONG', 'ホッパーブリッジ')}
              </text>
            </g>
          )}

          {/* Interactive Draggable Sliding Gate (aligned to chute throat x=246..256) */}
          <g
            onPointerDown={handleGatePointerDown}
            onPointerMove={handleGatePointerMove}
            onPointerUp={handleGatePointerUp}
            style={{ cursor: onGateChange ? 'ns-resize' : 'default' }}
          >
            {/* Invisible wider hit target for easy dragging */}
            <rect
              x="234"
              y={gateBottomY - 96}
              width="34"
              height="104"
              fill="transparent"
            />
            <rect
              x="246"
              y={gateBottomY - 90}
              width="10"
              height="90"
              rx="2"
              fill={isDraggingGate ? '#fbbf24' : palette.amber}
              stroke={isDraggingGate ? '#ffffff' : palette.textMain}
              strokeWidth={isDraggingGate ? '1.8' : '1'}
            />
            {/* Drag grip handle */}
            <circle
              cx="251"
              cy={gateBottomY - 10}
              r="5.5"
              fill={palette.steelDark}
              stroke={palette.amber}
              strokeWidth="1.8"
            />
            <line
              x1="251"
              y1={gateBottomY - 90}
              x2="251"
              y2="34"
              stroke={palette.steelLight}
              strokeWidth="2.5"
            />
            <rect
              x="237"
              y="30"
              width="28"
              height="6"
              rx="3"
              fill={palette.steelLight}
            />
          </g>

          {/* Gate Opening Dimension Callout */}
          <line
            x1="270"
            y1={gateBottomY}
            x2="270"
            y2={troughTopAtGateY}
            stroke={palette.amber}
            strokeWidth="1.5"
          />
          <line
            x1="265"
            y1={gateBottomY}
            x2="275"
            y2={gateBottomY}
            stroke={palette.amber}
            strokeWidth="1.5"
          />
          <line
            x1="265"
            y1={troughTopAtGateY}
            x2="275"
            y2={troughTopAtGateY}
            stroke={palette.amber}
            strokeWidth="1.5"
          />
          <text
            x="280"
            y={(gateBottomY + troughTopAtGateY) / 2 + 4}
            fill={palette.textMain}
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            H = {inputs.gateOpeningMm} mm
          </text>
          {onGateChange && (
            <text
              x="280"
              y={(gateBottomY + troughTopAtGateY) / 2 + 16}
              fill={palette.amber}
              fontSize="9"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('↕ Drag gate', '↕ Geser gerbang', '↕ ドラッグ調整')}
            </text>
          )}
        </g>

        {/* Industrial Discharge Chute & Parabolic Material Stream */}
        <g>
          {/* Cutaway Chute Interior */}
          <path
            d={`M ${chuteRearTopX} ${chuteRearTopY} L ${chuteOutletLeftX} ${chuteOutletY} L ${chuteOutletRightX} ${chuteOutletY} L 806 326 L 806 249 L 704 ${chuteFrontTopY + 7} L 704 ${lipBaseY - 12} Z`}
            fill={isDark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(100, 116, 139, 0.14)'}
          />

          {/* Parabolic Discharge Material Particles */}
          {dischargeParticles.map((p) => (
            <circle
              key={`dp-${p.id}`}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={p.r}
              fill={p.alt ? palette.particleAlt : palette.particle}
              opacity={p.opacity}
            />
          ))}

          {/* Rear Angled Chute Wall (aligned underneath trough discharge lip) */}
          <path
            d={`M ${chuteRearTopX - 7} ${chuteRearTopY} L ${chuteOutletLeftX - 7} ${chuteOutletY} L ${chuteOutletLeftX} ${chuteOutletY} L ${chuteRearTopX} ${chuteRearTopY} Z`}
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1.2"
          />

          {/* Front Hood & Angled Impact Wall */}
          <path
            d={`M 704 ${chuteFrontTopY} L 814 244 L 814 328 L ${chuteOutletRightX + 7} ${chuteOutletY} L ${chuteOutletRightX} ${chuteOutletY} L 806 326 L 806 249 L 704 ${chuteFrontTopY + 7} Z`}
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1.2"
          />

          {/* Bolt-On Impact Wear Liner inside Front Chute Wall */}
          <path
            d={`M 800 252 L 806 252 L 806 326 L ${chuteOutletRightX} ${chuteOutletY - 4} L ${chuteOutletRightX - 5} ${chuteOutletY - 4} L 800 325 Z`}
            fill="url(#vf-liner-grad)"
          />
          {[268, 296, 322, 355, 380].map((ly) => {
            const lx = ly <= 325 ? 803 : 803 - ((ly - 325) / 67) * 14;
            return (
              <circle
                key={`clb-${ly}`}
                cx={lx.toFixed(1)}
                cy={ly}
                r="1.7"
                fill={palette.textMain}
                opacity="0.65"
              />
            );
          })}

          {/* Discharge Outlet Flange at Foundation */}
          <rect
            x={chuteOutletLeftX - 12}
            y={chuteOutletY - 2}
            width={chuteOutletRightX - chuteOutletLeftX + 24}
            height="6"
            rx="1.5"
            fill="url(#vf-steel-grad)"
            stroke={palette.steelLight}
            strokeWidth="1"
          />

          {/* Discharge Chute Label */}
          <text
            x="764"
            y={chuteFrontTopY - 6}
            textAnchor="middle"
            fill={palette.textMuted}
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('DISCHARGE CHUTE', 'CORONG KELUARAN', '排出シュート')}
          </text>
        </g>

        {/* Clickable Inspection Hotspots */}
        {(
          [
            { id: 'motor' as const, x: 430, y: 294 },
            { id: 'springs' as const, x: 595, y: 335 },
            { id: 'liner' as const, x: 505, y: 264 },
            { id: 'throat' as const, x: 217, y: 215 },
          ]
        ).map((hs) => {
          const isSelected = activeHotspot === hs.id;
          const status = hotspotData[hs.id].status;
          const ringColor =
            status === 'crit'
              ? palette.danger
              : status === 'warn'
                ? palette.amber
                : palette.cyan;
          return (
            <g
              key={hs.id}
              transform={`translate(${hs.x}, ${hs.y})`}
              onClick={() => setActiveHotspot((prev) => (prev === hs.id ? null : hs.id))}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r={isSelected ? 12 : 9}
                fill={ringColor}
                opacity={isSelected ? 0.32 : 0.18}
              />
              <circle
                r="5.5"
                fill={isSelected ? ringColor : palette.steelDark}
                stroke={ringColor}
                strokeWidth="2"
              />
              <circle r="2" fill="#ffffff" />
            </g>
          );
        })}

        {/* Active Hotspot Inspection HUD Card */}
        {activeInfo && (
          <g transform="translate(260, 18)">
            <rect
              x="0"
              y="0"
              width="292"
              height="68"
              rx="14"
              fill="var(--md-surface-container)"
              fillOpacity="0.96"
              stroke={
                activeInfo.status === 'crit'
                  ? palette.danger
                  : activeInfo.status === 'warn'
                    ? palette.amber
                    : 'var(--md-primary)'
              }
              strokeWidth="1.4"
            />
            <text
              x="12"
              y="18"
              fill={palette.textMain}
              fontSize="10.5"
              fontWeight="800"
              fontFamily="var(--font-sans)"
            >
              {activeInfo.title}
            </text>
            <text
              x="12"
              y="35"
              fill="var(--md-primary)"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {activeInfo.gForce} · φ={activeInfo.phase} · {activeInfo.temp}
            </text>
            <text
              x="12"
              y="52"
              fill={palette.textMuted}
              fontSize="9.5"
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              {activeInfo.detail}
            </text>
          </g>
        )}

        {/* Top-Right Live Telemetry Badge */}
        <g transform="translate(568, 18)">
          <rect
            x="0"
            y="0"
            width="274"
            height="68"
            rx="14"
            fill="var(--md-surface-container)"
            fillOpacity="0.96"
            stroke="var(--md-outline-variant)"
            strokeWidth="1.2"
          />
          <text
            x="14"
            y="20"
            fill={palette.textMuted}
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('THROW INDEX', 'INDEKS LEMPAR', '投擲指数')} (Kᵥ)
          </text>
          <text
            x="14"
            y="42"
            fill={kvColor}
            fontSize="20"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {metrics.throwIndexKv.toFixed(2)}
          </text>
          <text
            x="14"
            y="58"
            fill={palette.textMuted}
            fontSize="9.5"
            fontFamily="var(--font-mono)"
          >
            {metrics.peakGForce.toFixed(2)} g · {inputs.driveFrequencyHz} Hz
          </text>

          <line
            x1="138"
            y1="10"
            x2="138"
            y2="58"
            stroke="var(--md-outline-variant)"
            strokeOpacity="0.6"
          />

          <text
            x="152"
            y="20"
            fill={palette.textMuted}
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('MASS FLOW', 'LAJU MASSA', '質量流量')}
          </text>
          <text
            x="152"
            y="42"
            fill={palette.textMain}
            fontSize="20"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {metrics.massFlowRateTH.toFixed(1)} t/h
          </text>
          <text
            x="152"
            y="58"
            fill={metrics.inResonanceZone ? palette.danger : palette.textMuted}
            fontSize="9.5"
            fontWeight={metrics.inResonanceZone ? '700' : '500'}
            fontFamily="var(--font-mono)"
          >
            f/fₙ = {metrics.resonanceRatio.toFixed(2)}
            {metrics.inResonanceZone ? ' (!)' : ''}
          </text>
        </g>

        {/* Resonance Danger Banner */}
        {metrics.inResonanceZone && (
          <g transform="translate(260, 92)">
            <rect
              x="0"
              y="0"
              width="292"
              height="26"
              rx="10"
              fill="rgba(239, 68, 68, 0.18)"
              stroke={palette.danger}
              strokeWidth="1.3"
            />
            <text
              x="146"
              y="17"
              textAnchor="middle"
              fill={palette.danger}
              fontSize="10.5"
              fontWeight="800"
              fontFamily="var(--font-sans)"
            >
              {pick(
                'RESONANCE ZONE (0.75 ≤ f/fₙ ≤ 1.35)',
                'ZONA RESONANSI (0.75 ≤ f/fₙ ≤ 1.35)',
                '共振危険領域 (0.75 ≤ f/fₙ ≤ 1.35)'
              )}
            </text>
          </g>
        )}

        {/* Live Mini Waveform / Oscilloscope Strip */}
        <g>
          <rect
            x="20"
            y="424"
            width="820"
            height="86"
            rx="14"
            fill="var(--md-surface-container-low)"
            stroke="var(--md-outline-variant)"
            strokeWidth="1.2"
          />
          {/* Zero centerline */}
          <line
            x1="28"
            y1={scopePaths.midY}
            x2="588"
            y2={scopePaths.midY}
            stroke="var(--md-outline-variant)"
            strokeOpacity="0.65"
            strokeWidth="1"
          />
          {/* Throw-Off Threshold Line (Kv = 1.0) */}
          <line
            x1="28"
            y1={scopePaths.thresholdY}
            x2="588"
            y2={scopePaths.thresholdY}
            stroke={palette.danger}
            strokeWidth="1.2"
            strokeDasharray="5 3"
          />
          <text
            x="34"
            y={Math.max(436, scopePaths.thresholdY - 4)}
            fill={palette.danger}
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('THROW-OFF THRESHOLD (Kᵥ=1.0)', 'AMBANG LEMPAR (Kᵥ=1.0)', '投擲しきい値 (Kᵥ=1.0)')}
          </text>

          {/* Displacement Trace */}
          <path
            d={scopePaths.dispPath}
            fill="none"
            stroke={palette.emerald}
            strokeWidth="1.6"
            opacity="0.85"
          />
          {/* Normal Acceleration Trace */}
          <path
            d={scopePaths.accelPath}
            fill="none"
            stroke={palette.amber}
            strokeWidth="2.2"
          />

          {/* Scope Legend & Live Values */}
          <line
            x1="604"
            y1="434"
            x2="604"
            y2="500"
            stroke="var(--md-outline-variant)"
            strokeOpacity="0.6"
          />
          <text x="618" y="444" fill={palette.textMuted} fontSize="9.5" fontWeight="700" fontFamily="var(--font-sans)">
            {pick('LIVE VIBRATION SCOPE', 'OSILOSKOP GETARAN', '振動波形モニタ')}
          </text>
          <circle cx="623" cy="460" r="3.5" fill={palette.amber} />
          <text x="633" y="463" fill={palette.textMain} fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
            aₙ = ±{metrics.normalGForce.toFixed(2)} g
          </text>
          <circle cx="623" cy="477" r="3.5" fill={palette.emerald} />
          <text x="633" y="480" fill={palette.textMain} fontSize="10" fontWeight="600" fontFamily="var(--font-mono)">
            A = ±{metrics.singleAmplitudeMm.toFixed(1)} mm
          </text>
          <text x="618" y="497" fill={palette.textMuted} fontSize="9.5" fontWeight="600" fontFamily="var(--font-mono)">
            {pick('Threshold', 'Ambang', 'しきい値')}: {metrics.throwOffThresholdG.toFixed(2)} g
          </text>
        </g>
      </svg>
    </div>
  );
}
