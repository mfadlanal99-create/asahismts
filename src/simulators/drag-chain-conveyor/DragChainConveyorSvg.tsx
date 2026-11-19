import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  DragChainConveyorInputs,
  DragChainConveyorMetrics,
  InspectionZoneId,
} from './dragChainConveyorMath';

interface DragChainConveyorSvgProps {
  inputs: DragChainConveyorInputs;
  metrics: DragChainConveyorMetrics;
  isPlaying?: boolean;
  travelPx?: number;
  selectedZone: InspectionZoneId;
  onSelectZone: (zone: InspectionZoneId) => void;
}

type ParticlePhase = 'inlet' | 'bed' | 'discharge' | 'carryback';

interface ConveyorParticle {
  id: number;
  phase: ParticlePhase;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  shade: 0 | 1;
  opacity: number;
  bedSlot: number;
}

interface PhysicsState {
  sPx: number;
  sagTime: number;
  spawnAccum: number;
  carrybackAccum: number;
  nextId: number;
  particles: ConveyorParticle[];
}

const CONVEYOR_SPAN = 520;
const SPROCKET_RADIUS = 31;
const PX_PER_M = 110;
const G_PX = 420;
const MAX_PARTICLES = 220;

function hash01(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createInitialPhysicsState(
  inputs: DragChainConveyorInputs,
  metrics: DragChainConveyorMetrics
): PhysicsState {
  const casingHeight = 104 + ((inputs.casingHeightMm - 200) / 300) * 24;
  const botTrackY = SPROCKET_RADIUS;
  const linerTopY = botTrackY + 16;
  const bedRatio = Math.min(
    0.9,
    metrics.effectiveBedHeightMm / inputs.casingHeightMm
  );
  const bedPx = Math.max(10, bedRatio * (casingHeight * 0.46));
  const bedTopY = linerTopY - bedPx;
  const inletTopY = -casingHeight / 2;
  const chuteTopY = casingHeight / 2;
  const particles: ConveyorParticle[] = [];
  let nextId = 1;

  // Seed carrying bed particles proportional to mass flow
  const bedCount = Math.max(
    18,
    Math.min(110, Math.round(metrics.massFlowTh * 1.15))
  );
  for (let i = 0; i < bedCount; i += 1) {
    const u1 = hash01(nextId);
    const u2 = hash01(nextId + 101);
    const bedSlot = u2;
    particles.push({
      id: nextId,
      phase: 'bed',
      x: 68 + u1 * (CONVEYOR_SPAN - 56 - 68),
      y: bedTopY + 3 + bedSlot * Math.max(4, bedPx - 6),
      vx: inputs.chainSpeedMs * PX_PER_M,
      vy: 0,
      r: 1.45 + (nextId % 3) * 0.5,
      shade: nextId % 2 === 0 ? 0 : 1,
      opacity: 0.9,
      bedSlot,
    });
    nextId += 1;
  }

  // Seed inlet falling particles
  for (let i = 0; i < 8; i += 1) {
    const t = i / 8;
    const u1 = hash01(nextId);
    particles.push({
      id: nextId,
      phase: 'inlet',
      x: 74 + (u1 * 2 - 1) * 10,
      y: inletTopY + t * Math.max(16, bedTopY - inletTopY),
      vx: 0,
      vy: 40 + t * 80,
      r: 1.4 + (nextId % 3) * 0.45,
      shade: nextId % 2 === 0 ? 0 : 1,
      opacity: 0.92,
      bedSlot: hash01(nextId + 53),
    });
    nextId += 1;
  }

  // Seed discharge chute particles
  if (inputs.fault !== 'material-jam') {
    for (let i = 0; i < 8; i += 1) {
      const t = i / 8;
      const y = bedTopY + t * (chuteTopY + 54 - bedTopY);
      const tChute = Math.max(0, (y - chuteTopY) / 54);
      particles.push({
        id: nextId,
        phase: 'discharge',
        x: CONVEYOR_SPAN - 44 + tChute * 16 + (hash01(nextId) - 0.5) * 18,
        y,
        vx: inputs.chainSpeedMs * PX_PER_M * 0.7,
        vy: 60 + t * 140,
        r: 1.6 + (nextId % 3) * 0.5,
        shade: nextId % 2 === 0 ? 0 : 1,
        opacity: 0.9,
        bedSlot: 0.5,
      });
      nextId += 1;
    }
  }

  return {
    sPx: 0,
    sagTime: 0,
    spawnAccum: 0,
    carrybackAccum: 0,
    nextId,
    particles,
  };
}

function SprocketWheel({
  cx,
  cy,
  radius,
  teeth,
  angleDeg,
  accent,
  isTripped,
  isDark,
}: {
  cx: number;
  cy: number;
  radius: number;
  teeth: number;
  angleDeg: number;
  accent: string;
  isTripped?: boolean;
  isDark: boolean;
}) {
  const clampedTeeth = Math.max(8, Math.min(20, Math.round(teeth)));
  const rTip = radius + 5.2;
  const rRoot = radius - 3.6;
  const step = (Math.PI * 2) / clampedTeeth;

  // Build crisp multi-point involute-style sprocket tooth profile
  const dParts: string[] = [];
  for (let i = 0; i < clampedTeeth; i += 1) {
    const a0 = i * step;
    const aRoot1 = a0 - step * 0.24;
    const aFlank1 = a0 - step * 0.14;
    const aTip1 = a0 - step * 0.08;
    const aTip2 = a0 + step * 0.08;
    const aFlank2 = a0 + step * 0.14;
    const aRoot2 = a0 + step * 0.24;

    const p = (ang: number, r: number) =>
      `${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`;

    if (i === 0) {
      dParts.push(`M ${p(aRoot1, rRoot)}`);
    } else {
      dParts.push(`L ${p(aRoot1, rRoot)}`);
    }
    dParts.push(`L ${p(aFlank1, radius + 1.5)}`);
    dParts.push(`L ${p(aTip1, rTip)}`);
    dParts.push(`L ${p(aTip2, rTip)}`);
    dParts.push(`L ${p(aFlank2, radius + 1.5)}`);
    dParts.push(`L ${p(aRoot2, rRoot)}`);
  }
  dParts.push('Z');

  const webFill = isDark ? '#1e293b' : '#cbd5e1';
  const webStroke = isDark ? '#64748b' : '#64748b';
  const holeFill = isDark ? '#0f172a' : '#e2e8f0';
  const spokeCount = 5;

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${angleDeg.toFixed(2)})`}>
      {/* Pitch circle reference ring */}
      <circle
        r={radius}
        fill="none"
        stroke={isDark ? 'rgba(148,163,184,0.22)' : 'rgba(71,85,105,0.2)'}
        strokeWidth="0.9"
        strokeDasharray="3 2"
      />
      {/* Toothed sprocket body */}
      <path
        d={dParts.join(' ')}
        fill="url(#dcSteelGrad)"
        stroke={isTripped ? '#f43f5e' : isDark ? '#94a3b8' : '#475569'}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Machined inner web */}
      <circle
        r={radius - 6.5}
        fill={webFill}
        stroke={webStroke}
        strokeWidth="1.2"
      />
      {/* Lightening holes around web */}
      {Array.from({ length: spokeCount }, (_, i) => {
        const a = (i * Math.PI * 2) / spokeCount;
        const hr = (radius - 6.5) * 0.58;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * hr}
            cy={Math.sin(a) * hr}
            r="4.2"
            fill={holeFill}
            stroke={webStroke}
            strokeWidth="0.9"
          />
        );
      })}
      {/* Central hub */}
      <circle
        r="10"
        fill={isTripped ? '#e11d48' : accent}
        stroke={isDark ? '#e2e8f0' : '#ffffff'}
        strokeWidth="1.4"
      />
      {/* Hub mounting bolts */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle
            key={deg}
            cx={Math.cos(rad) * 7.2}
            cy={Math.sin(rad) * 7.2}
            r="1.1"
            fill={isDark ? '#e2e8f0' : '#f8fafc'}
          />
        );
      })}
      {/* Shaft bore + keyway */}
      <circle r="3.8" fill={isDark ? '#0f172a' : '#1e293b'} />
      <rect
        x="-1.2"
        y="-5.3"
        width="2.4"
        height="2.2"
        fill={isDark ? '#0f172a' : '#1e293b'}
      />
    </g>
  );
}

function HotspotMarker({
  x,
  y,
  active,
  status,
  label,
  onClick,
}: {
  x: number;
  y: number;
  active: boolean;
  status: 'normal' | 'warning' | 'critical';
  label: string;
  onClick: () => void;
}) {
  const ringColor =
    status === 'critical'
      ? '#f43f5e'
      : status === 'warning'
        ? '#f59e0b'
        : 'var(--md-primary)';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      <circle
        r={active ? 16 : 12}
        fill={ringColor}
        fillOpacity={active ? 0.24 : 0.12}
        stroke={ringColor}
        strokeWidth={active ? 2 : 1.3}
        strokeDasharray={active ? 'none' : '3 2'}
      />
      <circle r="4.5" fill={ringColor} stroke="#0f172a" strokeWidth="1.2" />
    </g>
  );
}

export function DragChainConveyorSvg({
  inputs,
  metrics,
  isPlaying = true,
  travelPx: _legacyTravelPx,
  selectedZone,
  onSelectZone,
}: DragChainConveyorSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const inputsRef = useRef(inputs);
  const metricsRef = useRef(metrics);
  useEffect(() => {
    inputsRef.current = inputs;
    metricsRef.current = metrics;
  }, [inputs, metrics]);

  const [snapshot, setSnapshot] = useState<PhysicsState>(() =>
    createInitialPhysicsState(inputs, metrics)
  );
  const physicsRef = useRef<PhysicsState | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    if (physicsRef.current === null) {
      physicsRef.current = createInitialPhysicsState(
        inputsRef.current,
        metricsRef.current
      );
    }

    let rafId = 0;

    const step = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTimeRef.current) / 1000));
      lastTimeRef.current = now;

      const curInputs = inputsRef.current;
      const curMetrics = metricsRef.current;
      const phys = physicsRef.current;
      if (!phys) return;

      const isJam = curInputs.fault === 'material-jam';
      const isBroken = curInputs.fault === 'broken-flight';

      // 1. Chain kinematics: s += v * dt
      const effectiveSpeedMs = isJam
        ? curInputs.chainSpeedMs * 0.04
        : curInputs.chainSpeedMs;
      const vPx = effectiveSpeedMs * PX_PER_M;
      phys.sPx += vPx * dt;
      phys.sagTime += dt;

      // Geometry for current frame
      const casingH = 104 + ((curInputs.casingHeightMm - 200) / 300) * 24;
      const topY = -SPROCKET_RADIUS;
      const botY = SPROCKET_RADIUS;
      const linerY = botY + 16;
      const bedRatioNow = Math.min(
        0.9,
        curMetrics.effectiveBedHeightMm / curInputs.casingHeightMm
      );
      const bedHeightPx = Math.max(10, bedRatioNow * (casingH * 0.46));
      const bedTop = linerY - bedHeightPx;
      const inletTopY = -casingH / 2;
      const chuteTopY = casingH / 2;
      const chuteBotY = casingH / 2 + 54;
      const chuteFadeY = casingH / 2 + 92;
      const dischargeX = CONVEYOR_SPAN - 56;
      const jamStartX = CONVEYOR_SPAN - 94;
      const tailXNow = -((curInputs.takeUpScrewMm - 35) / 45) * 10;
      const sagNow = Math.min(
        36,
        Math.max(2, (curMetrics.catenarySagMm / 80) * 32)
      );

      // 2. Conservation of mass spawning at inlet: spawnRate ∝ massFlowTh
      const inletHalfW = Math.max(
        4,
        Math.min(18, 5 + (curMetrics.massFlowTh / 120) * 13)
      );
      const spawnRate = isJam
        ? Math.max(0.8, curMetrics.massFlowTh * 0.15)
        : Math.max(2.5, Math.min(48, curMetrics.massFlowTh * 0.34));
      phys.spawnAccum += spawnRate * dt;

      while (phys.spawnAccum >= 1 && phys.particles.length < MAX_PARTICLES) {
        phys.spawnAccum -= 1;
        const id = phys.nextId;
        phys.nextId += 1;
        const u1 = hash01(id);
        const u2 = hash01(id + 37);
        const u3 = hash01(id + 79);
        phys.particles.push({
          id,
          phase: 'inlet',
          x: 74 + (u1 * 2 - 1) * inletHalfW,
          y: inletTopY,
          vx: (u2 - 0.5) * 10,
          vy: 24 + u3 * 18,
          r: 1.4 + (id % 3) * 0.45,
          shade: id % 2 === 0 ? 0 : 1,
          opacity: 0.92,
          bedSlot: hash01(id + 131),
        });
      }

      // Carryback particles on return strand when broken-flight or high carryback
      if (isBroken || curMetrics.carrybackPct > 8) {
        const cbRate = isBroken
          ? Math.max(2, vPx * 0.14)
          : Math.max(1, vPx * 0.06);
        phys.carrybackAccum += cbRate * dt;
        while (
          phys.carrybackAccum >= 1 &&
          phys.particles.length < MAX_PARTICLES
        ) {
          phys.carrybackAccum -= 1;
          const id = phys.nextId;
          phys.nextId += 1;
          phys.particles.push({
            id,
            phase: 'carryback',
            x: CONVEYOR_SPAN - 20,
            y: topY + 5,
            vx: -vPx,
            vy: 0,
            r: 2.0 + (id % 2) * 0.8,
            shade: 0,
            opacity: 0.9,
            bedSlot: hash01(id + 17),
          });
        }
      }

      // 3. Integrate every particle in dt loop
      const nextParticles: ConveyorParticle[] = [];
      for (let i = 0; i < phys.particles.length; i += 1) {
        const p = phys.particles[i];

        if (p.phase === 'inlet') {
          p.vy += G_PX * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const landingY = bedTop + 3 + p.bedSlot * Math.max(4, bedHeightPx - 6);
          if (p.y >= landingY) {
            p.phase = 'bed';
            p.y = landingY;
            p.vx = vPx;
            p.vy = 0;
          }
          nextParticles.push(p);
        } else if (p.phase === 'bed') {
          if (isJam && p.x >= jamStartX) {
            // Jammed & bridged at throat
            p.vx = vPx * 0.02;
            p.x = Math.min(CONVEYOR_SPAN - 14, p.x + p.vx * dt);
            const bridgedY =
              bedTop - 8 + p.bedSlot * (bedHeightPx + 6);
            p.y += (bridgedY - p.y) * Math.min(1, 8 * dt);
            nextParticles.push(p);
          } else {
            p.vx = vPx;
            p.x += p.vx * dt;
            const targetY =
              bedTop + 3 + p.bedSlot * Math.max(4, bedHeightPx - 6);
            p.y += (targetY - p.y) * Math.min(1, 10 * dt);
            if (!isJam && p.x >= dischargeX) {
              p.phase = 'discharge';
              p.vx = Math.max(18, vPx * 0.85);
              p.vy = 16;
            }
            nextParticles.push(p);
          }
        } else if (p.phase === 'discharge') {
          // Real gravity + angled chute wall collision & slide
          p.vy += G_PX * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.y >= chuteTopY && p.y <= chuteBotY) {
            const tChute = (p.y - chuteTopY) / 54;
            const leftWallX = CONVEYOR_SPAN - 58 + tChute * 16;
            const rightWallX = CONVEYOR_SPAN - 4 + tChute * 16;
            // Chute walls slope (dx=16, dy=54), unit tangent (0.284, 0.959)
            const wallFriction = 1 - curInputs.materialFriction * 0.28;

            if (p.x + p.r >= rightWallX - 2) {
              p.x = rightWallX - p.r - 2;
              const vTang = (p.vx * 0.284 + p.vy * 0.959) * wallFriction;
              p.vx = vTang * 0.284 - 10;
              p.vy = Math.max(p.vy * 0.65, vTang * 0.959);
            } else if (p.x - p.r <= leftWallX + 2) {
              p.x = leftWallX + p.r + 2;
              const vTang = (p.vx * 0.284 + p.vy * 0.959) * wallFriction;
              p.vx = vTang * 0.284 + 10;
              p.vy = Math.max(p.vy * 0.65, vTang * 0.959);
            }
          }

          if (p.y > chuteBotY) {
            p.opacity = Math.max(
              0,
              1 - (p.y - chuteBotY) / (chuteFadeY - chuteBotY)
            );
          }
          if (p.y <= chuteFadeY) {
            nextParticles.push(p);
          }
        } else if (p.phase === 'carryback') {
          p.x -= vPx * dt;
          const normX = Math.max(
            0,
            Math.min(1, (p.x - tailXNow) / (CONVEYOR_SPAN - tailXNow))
          );
          const sagAtX = sagNow * 4 * normX * (1 - normX);
          p.y = topY + sagAtX + 5 + p.bedSlot * 3;
          if (p.x >= tailXNow + 18) {
            nextParticles.push(p);
          }
        }
      }

      phys.particles = nextParticles;
      setSnapshot({
        sPx: phys.sPx,
        sagTime: phys.sagTime,
        spawnAccum: phys.spawnAccum,
        carrybackAccum: phys.carrybackAccum,
        nextId: phys.nextId,
        particles: nextParticles.map((p) => ({ ...p })),
      });
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const phys = snapshot;
  const travelPx = phys.sPx;
  void _legacyTravelPx;

  // Visual conveyor geometry in local coordinates (tail at x=0, head at x=520)
  const conveyorSpan = CONVEYOR_SPAN;
  const casingHeight = 104 + ((inputs.casingHeightMm - 200) / 300) * 24;
  const sprocketRadius = SPROCKET_RADIUS;
  const topTrackY = -sprocketRadius;
  const botTrackY = sprocketRadius;

  // Tail take-up screw shifts the tail sprocket slightly
  const takeUpShift = -((inputs.takeUpScrewMm - 35) / 45) * 10;
  const tailX = takeUpShift;
  const headX = conveyorSpan;

  // Visual tilt angle (clamped so it always fits inside 900x430)
  const visualTiltDeg = -inputs.inclinationDeg * 0.42;
  const pivotX = 184;
  const pivotY = 262;

  // Sprocket rotation angle synchronized with linear chain travel: theta = -(s / r)
  const thetaRad = -(travelPx / sprocketRadius);
  const sprocketAngle = (thetaRad * 180) / Math.PI;

  // Flight spacing in SVG pixels mapped from flightPitchMm (125..300 mm -> 44..92 px)
  const flightSpacingPx = 44 + ((inputs.flightPitchMm - 125) / 175) * 48;
  const flightHeight = 17 + ((inputs.casingWidthMm - 200) / 400) * 7;

  // Chain link pitch in SVG pixels mapped from chainPitchMm (60..160 mm -> 16..28 px)
  const linkPitchPx = 16 + ((inputs.chainPitchMm - 60) / 100) * 12;

  // Material bed height in SVG pixels relative to casingHeight
  const bedRatio = Math.min(0.9, metrics.effectiveBedHeightMm / inputs.casingHeightMm);
  const maxBedPx = casingHeight * 0.46;
  const bedPx = Math.max(10, bedRatio * maxBedPx);
  const linerTopY = botTrackY + 16;
  const bedTopY = linerTopY - bedPx;

  // Catenary sag on the upper return strand (2..36 px downward bow) + subtle slack whip
  const isJam = inputs.fault === 'material-jam';
  const isBroken = inputs.fault === 'broken-flight';
  const isSlack =
    inputs.fault === 'chain-slack' || metrics.takeUpStatus === 'slack';
  const baseSagPx = Math.min(36, Math.max(2, (metrics.catenarySagMm / 80) * 32));
  const sagWhip = isSlack ? Math.sin(phys.sagTime * 4.5) * 2.2 : 0;
  const sagPx = Math.max(2, baseSagPx + sagWhip);

  // Compute flight positions along the bottom carrying run & top return run
  const numFlights = Math.floor(conveyorSpan / flightSpacingPx);
  const phase = travelPx % flightSpacingPx;

  const bottomFlights: number[] = [];
  const topFlights: number[] = [];
  for (let i = 0; i <= numFlights; i += 1) {
    const bx = i * flightSpacingPx + phase;
    if (bx >= 16 && bx <= conveyorSpan - 16) {
      bottomFlights.push(bx);
    }
    const tx = conveyorSpan - (i * flightSpacingPx + phase);
    if (tx >= 16 && tx <= conveyorSpan - 16) {
      topFlights.push(tx);
    }
  }

  // Articulated chain links on carrying, return, and sprocket wrap arcs
  const numLinks = Math.floor((conveyorSpan - tailX) / linkPitchPx);
  const linkPhase = travelPx % linkPitchPx;
  const bottomLinks: number[] = [];
  const topLinks: { x: number; y: number; angleDeg: number }[] = [];

  for (let i = 0; i <= numLinks; i += 1) {
    const lx = tailX + i * linkPitchPx + linkPhase;
    if (lx >= tailX + 8 && lx <= headX - 8) {
      bottomLinks.push(lx);
    }
    const rx = headX - (i * linkPitchPx + linkPhase);
    if (rx >= tailX + 8 && rx <= headX - 8) {
      const t = (rx - tailX) / (headX - tailX);
      const y = topTrackY + 4 * sagPx * t * (1 - t);
      const dyDt = 4 * sagPx * (1 - 2 * t);
      const dxDt = headX - tailX;
      const angleDeg = (Math.atan2(dyDt, dxDt) * 180) / Math.PI;
      topLinks.push({ x: rx, y, angleDeg });
    }
  }

  // Wrapping chain links around head (+90° down to -90°) & tail (-90° down to -270°) sprockets
  const wrapArcLen = Math.PI * sprocketRadius;
  const wrapCount = Math.max(4, Math.floor(wrapArcLen / linkPitchPx));
  const wrapAngStep = Math.PI / wrapCount;
  const wrapPhaseRad = (travelPx % linkPitchPx) / sprocketRadius;

  const headWrapLinks: { x: number; y: number; angleDeg: number }[] = [];
  const tailWrapLinks: { x: number; y: number; angleDeg: number }[] = [];
  for (let i = 0; i <= wrapCount; i += 1) {
    // Head sprocket: bottom is +90° (PI/2), top is -90° (-PI/2); CCW travel decreases angle
    const hAng = Math.PI / 2 - (i * wrapAngStep + (wrapPhaseRad % wrapAngStep));
    if (hAng >= -Math.PI / 2 - 0.15 && hAng <= Math.PI / 2 + 0.15) {
      headWrapLinks.push({
        x: headX + Math.cos(hAng) * sprocketRadius,
        y: Math.sin(hAng) * sprocketRadius,
        angleDeg: ((hAng + Math.PI / 2) * 180) / Math.PI,
      });
    }
    // Tail sprocket: top is -90° (-PI/2), bottom is -270° (-3*PI/2); CCW travel decreases angle
    const tAng = -Math.PI / 2 - (i * wrapAngStep + (wrapPhaseRad % wrapAngStep));
    if (tAng >= -1.5 * Math.PI - 0.15 && tAng <= -Math.PI / 2 + 0.15) {
      tailWrapLinks.push({
        x: tailX + Math.cos(tAng) * sprocketRadius,
        y: Math.sin(tAng) * sprocketRadius,
        angleDeg: ((tAng + Math.PI / 2) * 180) / Math.PI,
      });
    }
  }

  // Inlet stream width scales with massFlowTh
  const inletHalfW = Math.max(
    4,
    Math.min(18, 5 + (metrics.massFlowTh / 120) * 13)
  );

  // Build live granular bed polygon between flights (reflecting bedHeightMm, flightPitchMm, broken-flight slump, & jam bulge)
  const bedEnd = conveyorSpan - 56;
  const bedPoints: string[] = [`46,${linerTopY}`, `72,${bedTopY}`];
  for (let i = 0; i < bottomFlights.length; i += 1) {
    const fx = bottomFlights[i];
    if (fx <= 74 || fx >= bedEnd - 6) continue;
    const isBrokenPocket = isBroken && i === 2;
    const isJamZone = isJam && fx >= conveyorSpan - 102;
    const localTop = isJamZone
      ? bedTopY - 8
      : isBrokenPocket
        ? linerTopY - bedPx * 0.34
        : bedTopY;
    bedPoints.push(`${(fx - 3).toFixed(1)},${(localTop - 2).toFixed(1)}`);
    bedPoints.push(`${(fx + 2).toFixed(1)},${(localTop + 1.5).toFixed(1)}`);
  }
  if (isJam) {
    bedPoints.push(`${conveyorSpan - 96},${bedTopY - 8}`);
    bedPoints.push(`${bedEnd},${bedTopY - 10}`);
  } else {
    bedPoints.push(`${bedEnd},${bedTopY}`);
  }
  bedPoints.push(`${bedEnd},${linerTopY}`);
  const bedPolygonD = `M ${bedPoints.join(' L ')} Z`;

  const inletGrains = phys.particles.filter((p) => p.phase === 'inlet');
  const grains = phys.particles.filter((p) => p.phase === 'bed');
  const dischargeGrains = phys.particles.filter((p) => p.phase === 'discharge');
  const carrybackParticles = phys.particles.filter(
    (p) => p.phase === 'carryback'
  );

  const activeZone = metrics.zones[selectedZone];
  const zoneMeta: Record<
    InspectionZoneId,
    { label: string; wearLabel: string; wearVal: string }
  > = {
    'drive-sprocket': {
      label: pick('Drive Sprocket', 'Sproket Penggerak', '駆動スプロケット'),
      wearLabel: pick('Chain Wear', 'Keausan Rantai', 'チェーン摩耗'),
      wearVal: `${activeZone.wearPct.toFixed(1)}%`,
    },
    'shear-pin': {
      label: pick('Shear-Pin Hub', 'Hub Shear Pin', 'シャーピンハブ'),
      wearLabel: pick('Pin Load', 'Beban Pin', 'ピン負荷'),
      wearVal: `${activeZone.wearPct.toFixed(0)}%`,
    },
    'return-catenary': {
      label: pick('Return Catenary', 'Katenari Balik', 'リターンカテナリ'),
      wearLabel: pick('Chain Wear', 'Keausan Rantai', 'チェーン摩耗'),
      wearVal: `${activeZone.wearPct.toFixed(1)}%`,
    },
    'tail-takeup': {
      label: pick('Tail Take-Up', 'Take-Up Ekor', 'テールテークアップ'),
      wearLabel: pick('Stroke Used', 'Langkah Baut', 'ストローク'),
      wearVal: `${activeZone.wearPct.toFixed(0)}%`,
    },
  };

  const pinBarPct = Math.min(100, metrics.shearPinLoadPct);

  return (
    <div className="space-y-3">
      {/* Interactive SVG Cutaway */}
      <div className="relative overflow-hidden rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-lowest)]">
        <svg
          viewBox="0 0 900 430"
          className="block h-auto w-full select-none"
          role="img"
          aria-label={pick(
            'En-Masse Drag Chain Conveyor Cutaway',
            'Potongan Konveyor Rantai En-Masse',
            'エンマス・ドラッグチェーンコンベヤ断面図'
          )}
        >
          <defs>
            <pattern
              id="dcGrid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke={
                  isDark
                    ? 'rgba(148, 163, 184, 0.07)'
                    : 'rgba(15, 23, 42, 0.055)'
                }
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="dcCasingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#334155' : '#cbd5e1'} />
              <stop offset="50%" stopColor={isDark ? '#1e293b' : '#94a3b8'} />
              <stop offset="100%" stopColor={isDark ? '#0f172a' : '#64748b'} />
            </linearGradient>
            <linearGradient id="dcSteelGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={isDark ? '#94a3b8' : '#e2e8f0'} />
              <stop offset="55%" stopColor={isDark ? '#475569' : '#94a3b8'} />
              <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
            </linearGradient>
            <linearGradient id="dcBedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#92400e" stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id="dcStreamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id="dcJamGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          <rect
            width="900"
            height="430"
            fill="var(--md-surface-container-lowest)"
          />
          <rect width="900" height="430" fill="url(#dcGrid)" />

          {/* Header Label */}
          <text
            x="20"
            y="26"
            fill="var(--md-on-surface-variant)"
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="1.2"
            fontFamily="var(--font-sans)"
          >
            {pick(
              'EN-MASSE / SCRAPER DRAG CHAIN CONVEYOR — INTERACTIVE CUTAWAY',
              'KONVEYOR RANTAI DRAG EN-MASSE — POTONGAN INTERAKTIF',
              'エンマス／スクレーパ・ドラッグチェーンコンベヤ（インタラクティブ断面）'
            )}
          </text>

          {/* Live Inspection Probe HUD Card (Top-Right inside SVG) */}
          <g transform="translate(626, 12)">
            <rect
              width="258"
              height="74"
              rx="12"
              fill="var(--md-surface-container-low)"
              stroke={
                activeZone.status === 'critical'
                  ? '#f43f5e'
                  : activeZone.status === 'warning'
                    ? '#f59e0b'
                    : 'var(--md-primary)'
              }
              strokeWidth="1.2"
            />
            <text
              x="12"
              y="20"
              fill="var(--md-on-surface-variant)"
              fontSize="9"
              fontWeight="700"
              fontFamily="var(--font-sans)"
            >
              {pick('INSPECTION PROBE:', 'PROBE INSPEKSI:', '点検プローブ:')}{' '}
              <tspan fill="var(--md-on-surface)">
                {zoneMeta[selectedZone].label}
              </tspan>
            </text>
            <text
              x="12"
              y="42"
              fill="var(--md-on-surface-variant)"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('TENSION', 'TEGANGAN', '張力')}
            </text>
            <text
              x="12"
              y="58"
              fill="var(--md-primary)"
              fontSize="12.5"
              fontWeight="800"
              fontFamily="var(--font-mono)"
            >
              {activeZone.tensionKn.toFixed(2)} kN
            </text>

            <text
              x="98"
              y="42"
              fill="var(--md-on-surface-variant)"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {zoneMeta[selectedZone].wearLabel}
            </text>
            <text
              x="98"
              y="58"
              fill="var(--md-primary)"
              fontSize="12.5"
              fontWeight="800"
              fontFamily="var(--font-mono)"
            >
              {zoneMeta[selectedZone].wearVal}
            </text>

            <text
              x="186"
              y="42"
              fill="var(--md-on-surface-variant)"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('TEMP', 'SUHU', '温度')}
            </text>
            <text
              x="186"
              y="58"
              fill={
                activeZone.temperatureC > 80
                  ? isDark
                    ? '#fb7185'
                    : '#e11d48'
                  : activeZone.temperatureC > 60
                    ? isDark
                      ? '#fbbf24'
                      : '#d97706'
                    : isDark
                      ? '#34d399'
                      : '#059669'
              }
              fontSize="12.5"
              fontWeight="800"
              fontFamily="var(--font-mono)"
            >
              {activeZone.temperatureC.toFixed(0)} °C
            </text>
          </g>

          {/* Horizontal datum reference line when inclined */}
          {inputs.inclinationDeg > 0 && (
            <g>
              <line
                x1={pivotX}
                y1={pivotY + 62}
                x2={pivotX + 240}
                y2={pivotY + 62}
                stroke="var(--md-outline)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={pivotX + 195}
                y={pivotY + 54}
                fill="var(--md-primary)"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                θ = {inputs.inclinationDeg}°
              </text>
            </g>
          )}

          {/* Main Tilted Conveyor Assembly */}
          <g transform={`translate(${pivotX}, ${pivotY}) rotate(${visualTiltDeg})`}>
            {/* Support Pedestals */}
            <rect
              x="28"
              y={casingHeight / 2}
              width="16"
              height="36"
              rx="2"
              fill={isDark ? '#334155' : '#64748b'}
            />
            <rect
              x={conveyorSpan - 82}
              y={casingHeight / 2}
              width="16"
              height="36"
              rx="2"
              fill={isDark ? '#334155' : '#64748b'}
            />

            {/* Inlet Feed Hopper (Tail) */}
            <polygon
              points={`34,${-casingHeight / 2 - 52} 114,${-casingHeight / 2 - 52} 96,${-casingHeight / 2} 52,${-casingHeight / 2}`}
              fill={isDark ? '#1e293b' : '#cbd5e1'}
              stroke={isDark ? '#64748b' : '#475569'}
              strokeWidth="1.8"
            />
            <polygon
              points={`42,${-casingHeight / 2 - 42} 106,${-casingHeight / 2 - 42} 93,${-casingHeight / 2} 55,${-casingHeight / 2}`}
              fill="#d97706"
              opacity="0.88"
            />
            <text
              x="74"
              y={-casingHeight / 2 - 60}
              textAnchor="middle"
              fill={isDark ? '#cbd5e1' : '#334155'}
              fontSize="9.5"
              fontWeight="700"
            >
              {pick('INLET HOPPER', 'CORONG MASUK', '投入ホッパ')}
            </text>

            {/* Discharge Chute (Head) */}
            <polygon
              points={`${conveyorSpan - 58},${casingHeight / 2} ${conveyorSpan - 4},${casingHeight / 2} ${conveyorSpan + 12},${casingHeight / 2 + 54} ${conveyorSpan - 42},${casingHeight / 2 + 54}`}
              fill={isDark ? '#1e293b' : '#e2e8f0'}
              stroke={isJam ? '#f43f5e' : isDark ? '#64748b' : '#475569'}
              strokeWidth={isJam ? '2.2' : '1.8'}
            />
            <text
              x={conveyorSpan - 15}
              y={casingHeight / 2 + 68}
              textAnchor="middle"
              fill={
                isJam
                  ? isDark
                    ? '#fb7185'
                    : '#e11d48'
                  : isDark
                    ? '#cbd5e1'
                    : '#334155'
              }
              fontSize="9.5"
              fontWeight="700"
            >
              {isJam
                ? pick('PLUGGED CHUTE!', 'CHUTE TERSUMBAT!', '排出口詰まり！')
                : pick('DISCHARGE', 'KELUARAN', '排出口')}
            </text>

            {/* Outer Enclosed Rectangular Steel Casing */}
            <rect
              x={tailX - 46}
              y={-casingHeight / 2}
              width={conveyorSpan - tailX + 94}
              height={casingHeight}
              rx="8"
              fill="url(#dcCasingGrad)"
              stroke={isDark ? '#64748b' : '#475569'}
              strokeWidth="2"
            />
            {/* Structural Casing Gusset Ribs */}
            {[90, 210, 330, 450].map((rx) => (
              <line
                key={rx}
                x1={rx}
                y1={-casingHeight / 2}
                x2={rx}
                y2={-casingHeight / 2 + 8}
                stroke={isDark ? '#94a3b8' : '#cbd5e1'}
                strokeWidth="3"
              />
            ))}

            {/* Cutaway Inspection Window */}
            <rect
              x="10"
              y={-casingHeight / 2 + 8}
              width={conveyorSpan - 20}
              height={casingHeight - 16}
              rx="4"
              fill={isDark ? '#0b1322' : '#1e293b'}
              stroke={isDark ? '#334155' : '#475569'}
              strokeWidth="1.2"
            />

            {/* Discharge Throat Opening through Casing Bottom Wall */}
            <polygon
              points={`${conveyorSpan - 56},${casingHeight / 2 - 9} ${conveyorSpan - 8},${casingHeight / 2 - 9} ${conveyorSpan - 6},${casingHeight / 2 + 2} ${conveyorSpan - 58},${casingHeight / 2 + 2}`}
              fill={isDark ? '#0b1322' : '#1e293b'}
            />

            {/* Intermediate Return Guide Rail */}
            <line
              x1="28"
              y1={topTrackY + 12}
              x2={conveyorSpan - 28}
              y2={topTrackY + 12}
              stroke="#475569"
              strokeWidth="2.5"
              strokeDasharray="10 4"
            />

            {/* Bottom UHMW / Hardox Wear Liner (terminates at discharge throat) */}
            <rect
              x="12"
              y={linerTopY}
              width={conveyorSpan - 68}
              height="4.5"
              fill="#64748b"
            />

            {/* Inlet Hopper Falling Material Stream (thickness scales with massFlowTh) */}
            <polygon
              points={`${74 - inletHalfW},${-casingHeight / 2} ${74 + inletHalfW},${-casingHeight / 2} ${74 + inletHalfW + 3},${linerTopY} ${74 - inletHalfW - 3},${linerTopY}`}
              fill="url(#dcStreamGrad)"
            />
            {inletGrains.map((g) => (
              <circle
                key={`ig-${g.id}`}
                cx={g.x}
                cy={g.y}
                r={g.r}
                fill={g.shade === 0 ? '#fbbf24' : '#fde68a'}
                opacity={g.opacity}
              />
            ))}

            {/* Flowing Bulk Material Bed on Carrying Run (dynamic flight pockets + fault profile) */}
            <path
              d={bedPolygonD}
              fill={isJam ? 'url(#dcJamGrad)' : 'url(#dcBedGrad)'}
            />

            {/* Cascading Discharge Material Stream into & out of Discharge Chute */}
            {!isJam ? (
              <path
                d={`M ${conveyorSpan - 56} ${bedTopY} Q ${conveyorSpan - 32} ${bedTopY + 2} ${conveyorSpan - 20} ${casingHeight / 2} L ${conveyorSpan - 6} ${casingHeight / 2 + 54} L ${conveyorSpan - 34} ${casingHeight / 2 + 54} L ${conveyorSpan - 48} ${casingHeight / 2} Q ${conveyorSpan - 52} ${linerTopY} ${conveyorSpan - 56} ${linerTopY} Z`}
                fill="url(#dcStreamGrad)"
                opacity={Math.min(0.95, 0.35 + (metrics.massFlowTh / 120) * 0.6)}
              />
            ) : (
              <path
                d={`M ${conveyorSpan - 56} ${bedTopY - 10} L ${conveyorSpan - 12} ${bedTopY - 12} L ${conveyorSpan - 8} ${casingHeight / 2 + 24} L ${conveyorSpan - 48} ${casingHeight / 2 + 24} L ${conveyorSpan - 56} ${linerTopY} Z`}
                fill="url(#dcJamGrad)"
              />
            )}

            {/* Animated Bulk Granules in Carrying Bed */}
            {grains.map((g) => (
              <circle
                key={`bg-${g.id}`}
                cx={g.x}
                cy={g.y}
                r={g.r}
                fill={g.shade === 0 ? '#fbbf24' : '#fde68a'}
                opacity={isJam ? 0.55 : g.opacity}
              />
            ))}

            {/* Animated Cascading Granules in & out of Discharge Chute */}
            {dischargeGrains.map((g) => (
              <circle
                key={`dg-${g.id}`}
                cx={g.x}
                cy={g.y}
                r={g.r}
                fill={g.shade === 0 ? '#fbbf24' : '#fde68a'}
                opacity={g.opacity}
              />
            ))}

            {/* Jam Plug Zone at Head End */}
            {isJam && (
              <g>
                <rect
                  x={conveyorSpan - 96}
                  y={botTrackY - 26}
                  width="82"
                  height="44"
                  rx="4"
                  fill="#e11d48"
                  fillOpacity="0.45"
                  stroke="#fb7185"
                  strokeWidth="2"
                />
                <text
                  x={conveyorSpan - 55}
                  y={botTrackY - 32}
                  textAnchor="middle"
                  fill="#fda4af"
                  fontSize="9.5"
                  fontWeight="800"
                >
                  {pick('MATERIAL JAM', 'MACET MATERIAL', '材料詰まり')}
                </text>
              </g>
            )}

            {/* Return Chain Strand (with Catenary Sag Curve) */}
            <path
              d={`M ${tailX} ${topTrackY} Q ${(tailX + headX) / 2} ${topTrackY + sagPx * 2} ${headX} ${topTrackY}`}
              fill="none"
              stroke={isSlack ? '#f59e0b' : '#64748b'}
              strokeWidth="2.2"
            />

            {/* Carrying Chain Strand (Bottom) */}
            <line
              x1={tailX}
              y1={botTrackY}
              x2={headX}
              y2={botTrackY}
              stroke={isJam ? '#fb7185' : '#94a3b8'}
              strokeWidth="2.2"
            />

            {/* Articulated Chain Links wrapping around Head & Tail Sprockets */}
            {[...headWrapLinks, ...tailWrapLinks].map((lnk, idx) => (
              <g
                key={`wl-${idx}`}
                transform={`translate(${lnk.x.toFixed(1)}, ${lnk.y.toFixed(1)}) rotate(${lnk.angleDeg.toFixed(1)})`}
              >
                <rect
                  x={-linkPitchPx * 0.38}
                  y="-2.8"
                  width={linkPitchPx * 0.76}
                  height="5.6"
                  rx="2.2"
                  fill="#cbd5e1"
                  stroke="#0f172a"
                  strokeWidth="0.8"
                />
                <circle cx="0" cy="0" r="1.4" fill="#1e293b" />
              </g>
            ))}

            {/* Articulated Chain Links along Bottom Carrying Run */}
            {bottomLinks.map((lx, idx) => (
              <g key={`bl-${idx}`} transform={`translate(${lx}, ${botTrackY})`}>
                <rect
                  x={-linkPitchPx * 0.42}
                  y="-3.2"
                  width={linkPitchPx * 0.84}
                  height="6.4"
                  rx="2.5"
                  fill={idx % 2 === 0 ? '#cbd5e1' : '#94a3b8'}
                  stroke="#0f172a"
                  strokeWidth="0.8"
                />
                <circle cx={-linkPitchPx * 0.34} cy="0" r="1.5" fill="#1e293b" />
                <circle cx={linkPitchPx * 0.34} cy="0" r="1.5" fill="#1e293b" />
              </g>
            ))}

            {/* Articulated Chain Links along Return Catenary */}
            {topLinks.map((lnk, idx) => (
              <g
                key={`tl-${idx}`}
                transform={`translate(${lnk.x}, ${lnk.y}) rotate(${lnk.angleDeg.toFixed(1)})`}
              >
                <rect
                  x={-linkPitchPx * 0.42}
                  y="-3"
                  width={linkPitchPx * 0.84}
                  height="6"
                  rx="2.5"
                  fill={
                    isSlack
                      ? '#f59e0b'
                      : idx % 2 === 0
                        ? '#94a3b8'
                        : '#64748b'
                  }
                  stroke="#0f172a"
                  strokeWidth="0.8"
                />
                <circle cx="0" cy="0" r="1.3" fill="#0f172a" />
              </g>
            ))}

            {/* Carryback Clumps on Return Strand */}
            {carrybackParticles.map((p) => (
              <circle
                key={`cb-${p.id}`}
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill="#f59e0b"
                opacity={p.opacity}
              />
            ))}

            {/* Scraper Flights — Bottom Carrying Run */}
            {bottomFlights.map((fx, idx) => {
              const brokenThis = isBroken && idx === 2;
              return (
                <g key={`bf-${idx}`} transform={`translate(${fx}, ${botTrackY})`}>
                  {brokenThis ? (
                    <g>
                      <line
                        x1="0"
                        y1="0"
                        x2="-10"
                        y2="9"
                        stroke="#f43f5e"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="0" cy="0" r="3" fill="#f43f5e" />
                      <text
                        x="0"
                        y="-10"
                        textAnchor="middle"
                        fill="#fb7185"
                        fontSize="9"
                        fontWeight="800"
                      >
                        {pick('BROKEN FLIGHT', 'FLIGHT PATAH', 'フライト破損')}
                      </text>
                    </g>
                  ) : (
                    <g>
                      <rect
                        x="-2.5"
                        y={-4}
                        width="5"
                        height={flightHeight}
                        rx="1"
                        fill="#a78bfa"
                        stroke="#ede9fe"
                        strokeWidth="0.8"
                      />
                      <circle cx="0" cy="0" r="3" fill="#e2e8f0" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Scraper Flights — Top Return Run */}
            {topFlights.map((fx, idx) => {
              const normX = fx / conveyorSpan;
              const localSag = sagPx * 4 * normX * (1 - normX);
              return (
                <g
                  key={`tf-${idx}`}
                  transform={`translate(${fx}, ${topTrackY + localSag})`}
                >
                  <rect
                    x="-2.5"
                    y={-flightHeight + 4}
                    width="5"
                    height={flightHeight}
                    rx="1"
                    fill="#7c3aed"
                    stroke="#c4b5fd"
                    strokeWidth="0.8"
                  />
                  <circle cx="0" cy="0" r="3" fill="#cbd5e1" />
                </g>
              );
            })}

            {/* Tail Take-Up Sprocket + Tensioning Screw + Live Tension Scale */}
            <g>
              {/* Threaded Screw Rod */}
              <rect
                x={tailX - 108}
                y="-4"
                width={108 - tailX}
                height="8"
                fill="#64748b"
              />
              {/* Take-up Fixed Bracket */}
              <rect
                x={tailX - 116}
                y="-15"
                width="10"
                height="30"
                rx="2"
                fill="#475569"
                stroke="#94a3b8"
                strokeWidth="1"
              />
              {/* Live Tension Scale Bar below Take-up Screw */}
              <g transform={`translate(${tailX - 110}, 20)`}>
                <rect
                  width="86"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  stroke="#475569"
                  strokeWidth="1"
                />
                {/* Optimal green zone 30-58 mm */}
                <rect
                  x={3 + (30 / 80) * 80}
                  y="3"
                  width={(28 / 80) * 80}
                  height="4"
                  fill="#10b981"
                  opacity="0.7"
                />
                {/* Current pointer */}
                <polygon
                  points={`${3 + (inputs.takeUpScrewMm / 80) * 80},2 ${3 + (inputs.takeUpScrewMm / 80) * 80 - 3},9 ${3 + (inputs.takeUpScrewMm / 80) * 80 + 3},9`}
                  fill={
                    metrics.takeUpStatus === 'optimal' ? '#34d399' : '#fbbf24'
                  }
                />
                <text
                  x="43"
                  y="14"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="7.5"
                  fontWeight="700"
                >
                  {inputs.takeUpScrewMm}mm / {metrics.t2Kn.toFixed(1)}kN
                </text>
              </g>

              {/* Sliding Bearing Block */}
              <rect
                x={tailX - 16}
                y="-12"
                width="32"
                height="24"
                rx="3"
                fill="#1e293b"
                stroke="#a78bfa"
                strokeWidth="1.4"
              />
              <SprocketWheel
                cx={tailX}
                cy={0}
                radius={sprocketRadius}
                teeth={inputs.sprocketTeeth}
                angleDeg={sprocketAngle}
                accent="#8b5cf6"
                isDark={isDark}
              />
              <text
                x={tailX - 64}
                y="-22"
                textAnchor="middle"
                fill={isDark ? '#94a3b8' : '#475569'}
                fontSize="9"
                fontWeight="700"
              >
                {pick('TAKE-UP SCREW', 'BAUT TAKE-UP', 'テークアップねじ')}
              </text>
            </g>

            {/* Head Drive Sprocket + Gearbox + Finned Motor + Shear-Pin Hub */}
            <g>
              <SprocketWheel
                cx={headX}
                cy={0}
                radius={sprocketRadius}
                teeth={inputs.sprocketTeeth}
                angleDeg={sprocketAngle}
                accent="#8b5cf6"
                isTripped={metrics.shearPinTripped}
                isDark={isDark}
              />
              {/* Helical Gearbox Housing */}
              <rect
                x={headX + 26}
                y="-24"
                width="38"
                height="48"
                rx="5"
                fill="#1e293b"
                stroke={metrics.shearPinTripped ? '#f43f5e' : '#8b5cf6'}
                strokeWidth="1.6"
              />
              {/* Finned TEFC Drive Motor */}
              <rect
                x={headX + 64}
                y="-18"
                width="42"
                height="36"
                rx="4"
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1.4"
              />
              {[-10, -4, 2, 8].map((fy) => (
                <line
                  key={fy}
                  x1={headX + 68}
                  y1={fy}
                  x2={headX + 102}
                  y2={fy}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                />
              ))}
              {/* Shear-Pin Hub Indicator */}
              <circle
                cx={headX + 38}
                cy="0"
                r="8"
                fill={metrics.shearPinTripped ? '#e11d48' : '#10b981'}
                fillOpacity="0.25"
                stroke={metrics.shearPinTripped ? '#fb7185' : '#34d399'}
                strokeWidth="1.5"
              />
              <line
                x1={headX + 34}
                y1="-4"
                x2={headX + 42}
                y2="4"
                stroke={metrics.shearPinTripped ? '#fb7185' : '#e2e8f0'}
                strokeWidth="2"
                strokeDasharray={metrics.shearPinTripped ? '2 2' : 'none'}
              />
              <text
                x={headX + 64}
                y="-31"
                textAnchor="middle"
                fill={
                  metrics.shearPinTripped
                    ? isDark
                      ? '#fb7185'
                      : '#e11d48'
                    : isDark
                      ? '#c4b5fd'
                      : '#5b21b6'
                }
                fontSize="9"
                fontWeight="700"
              >
                {metrics.shearPinTripped
                  ? pick('SHEAR PIN TRIP!', 'PIN PUTUS!', 'シャーピン破断!')
                  : pick('DRIVE + GEARBOX', 'PENGGERAK', '駆動・減速機')}
              </text>
            </g>

            {/* Catenary Sag Callout */}
            {isSlack && (
              <g>
                <line
                  x1={conveyorSpan / 2}
                  y1={topTrackY}
                  x2={conveyorSpan / 2}
                  y2={topTrackY + sagPx * 2}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <rect
                  x={conveyorSpan / 2 - 66}
                  y={topTrackY - 26}
                  width="132"
                  height="18"
                  rx="4"
                  fill={isDark ? '#451a03' : '#fef3c7'}
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <text
                  x={conveyorSpan / 2}
                  y={topTrackY - 13}
                  textAnchor="middle"
                  fill={isDark ? '#fcd34d' : '#92400e'}
                  fontSize="9.5"
                  fontWeight="700"
                >
                  {pick('SLACK SAG:', 'KELENDUTAN:', 'たるみ:')}{' '}
                  {metrics.catenarySagMm.toFixed(0)} mm
                </text>
              </g>
            )}

            {/* Clickable Inspection Hotspots */}
            <HotspotMarker
              x={headX}
              y={0}
              active={selectedZone === 'drive-sprocket'}
              status={metrics.zones['drive-sprocket'].status}
              label={zoneMeta['drive-sprocket'].label}
              onClick={() => onSelectZone('drive-sprocket')}
            />
            <HotspotMarker
              x={headX + 38}
              y={0}
              active={selectedZone === 'shear-pin'}
              status={metrics.zones['shear-pin'].status}
              label={zoneMeta['shear-pin'].label}
              onClick={() => onSelectZone('shear-pin')}
            />
            <HotspotMarker
              x={conveyorSpan / 2}
              y={topTrackY + sagPx}
              active={selectedZone === 'return-catenary'}
              status={metrics.zones['return-catenary'].status}
              label={zoneMeta['return-catenary'].label}
              onClick={() => onSelectZone('return-catenary')}
            />
            <HotspotMarker
              x={tailX - 18}
              y={0}
              active={selectedZone === 'tail-takeup'}
              status={metrics.zones['tail-takeup'].status}
              label={zoneMeta['tail-takeup'].label}
              onClick={() => onSelectZone('tail-takeup')}
            />
          </g>

          {/* Bottom Telemetry Strip inside SVG */}
          <g transform="translate(20, 380)">
            <rect
              width="860"
              height="36"
              rx="12"
              fill="var(--md-surface-container-low)"
              stroke="var(--md-outline-variant)"
            />
            <text
              x="18"
              y="22"
              fill="var(--md-on-surface-variant)"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('FLOW:', 'ALIRAN:', '流量:')}{' '}
              <tspan fill="var(--md-primary)" fontWeight="800" fontFamily="var(--font-mono)">
                {metrics.massFlowTh.toFixed(1)} t/h
              </tspan>
            </text>
            <text
              x="165"
              y="22"
              fill="var(--md-on-surface-variant)"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              T₁:{' '}
              <tspan
                fill={
                  metrics.shearPinTripped
                    ? isDark
                      ? '#fb7185'
                      : '#e11d48'
                    : 'var(--md-primary)'
                }
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                {metrics.t1Kn.toFixed(2)} kN
              </tspan>
            </text>
            <text
              x="285"
              y="22"
              fill="var(--md-on-surface-variant)"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('TORQUE:', 'TORSI:', 'トルク:')}{' '}
              <tspan fill="var(--md-primary)" fontWeight="800" fontFamily="var(--font-mono)">
                {metrics.driveTorqueNm.toFixed(0)} N·m
              </tspan>
            </text>
            <text
              x="435"
              y="22"
              fill="var(--md-on-surface-variant)"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('MOTOR:', 'MOTOR:', '動力:')}{' '}
              <tspan fill={isDark ? '#34d399' : '#059669'} fontWeight="800" fontFamily="var(--font-mono)">
                {metrics.motorPowerKw.toFixed(2)} kW ({metrics.motorCurrentA.toFixed(1)} A)
              </tspan>
            </text>
            <text
              x="675"
              y="22"
              fill="var(--md-on-surface-variant)"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('SAG:', 'SAG:', 'たるみ:')}{' '}
              <tspan
                fill={
                  metrics.takeUpStatus === 'slack'
                    ? isDark
                      ? '#fbbf24'
                      : '#d97706'
                    : 'var(--md-on-surface)'
                }
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                {metrics.catenarySagMm.toFixed(0)} mm
              </tspan>
            </text>
            <text
              x="765"
              y="22"
              fill="var(--md-on-surface-variant)"
              fontSize="10.5"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {pick('WEAR:', 'AUS:', '摩耗:')}{' '}
              <tspan
                fill={
                  inputs.chainWearPct >= 3
                    ? isDark
                      ? '#fbbf24'
                      : '#d97706'
                    : 'var(--md-on-surface)'
                }
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                {inputs.chainWearPct.toFixed(1)}%
              </tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Live Chain Tension & Shear-Pin Load Meter Bar + Hotspot Quick Selector */}
      <div className="flex flex-col gap-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[var(--md-on-surface)]">
              {pick(
                'Chain Tension & Shear-Pin Load',
                'Tegangan Rantai & Beban Shear Pin',
                'チェーン張力・シャーピン負荷'
              )}
            </span>
            <span className="font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
              T₁={metrics.t1Kn.toFixed(2)} kN · T₂={metrics.t2Kn.toFixed(2)} kN ·
              Fₑ={metrics.feKn.toFixed(2)} kN ·{' '}
              <span
                className={
                  metrics.shearPinLoadPct >= 100
                    ? 'font-bold text-rose-500'
                    : metrics.shearPinLoadPct >= 75
                      ? 'font-bold text-amber-500'
                      : 'font-bold text-emerald-500'
                }
              >
                {metrics.shearPinLoadPct.toFixed(0)}% / {metrics.shearPinLimitKn.toFixed(1)} kN
              </span>
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
            <div
              className={`h-full transition-all duration-200 ${
                metrics.shearPinLoadPct >= 100
                  ? 'bg-rose-500'
                  : metrics.shearPinLoadPct >= 75
                    ? 'bg-amber-500'
                    : 'bg-[var(--md-primary)]'
              }`}
              style={{ width: `${pinBarPct}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80"
              style={{ left: '75%' }}
              title="75% Warning"
            />
          </div>
        </div>

        {/* Clickable Hotspot Pill Selector */}
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              'drive-sprocket',
              'shear-pin',
              'return-catenary',
              'tail-takeup',
            ] as InspectionZoneId[]
          ).map((zid) => (
            <button
              key={zid}
              type="button"
              onClick={() => onSelectZone(zid)}
              className={`rounded-full px-3 py-1 text-[10.5px] font-semibold transition ${
                selectedZone === zid
                  ? 'bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)] shadow-xs'
                  : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
              }`}
            >
              {zoneMeta[zid].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
