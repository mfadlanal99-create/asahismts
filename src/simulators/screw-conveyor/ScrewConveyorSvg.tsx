import { useEffect, useRef, useState } from 'react';
import { Crosshair, Flame, Gauge, Thermometer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  SCREW_MATERIALS,
  type ScrewConveyorInputs,
  type ScrewConveyorMetrics,
} from './screwConveyorMath';

export type ProbeTargetId = 'gearbox' | 'hanger' | 'flight' | 'seal';

interface ScrewConveyorSvgProps {
  inputs: ScrewConveyorInputs;
  metrics: ScrewConveyorMetrics;
  phase: number; // 0..1 continuous revolution phase (initial seed)
}

interface SimParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  seed: number;
}

interface ScrewRenderParticle {
  id: number;
  x: number;
  y: number;
  r: number;
}

interface ScrewRenderFrame {
  livePhase: number;
  jamLevel: number;
  inlet: ScrewRenderParticle[];
  trough: ScrewRenderParticle[];
  carryback: ScrewRenderParticle[];
  chute: ScrewRenderParticle[];
}

interface ScrewPhysicsState {
  phiRad: number;
  jamLevel: number;
  inletSpawnAcc: number;
  carrybackSpawnAcc: number;
  nextId: number;
  inlet: SimParticle[];
  trough: SimParticle[];
  carryback: SimParticle[];
  chute: SimParticle[];
}

function buildInitialTrough(
  startX: number,
  spanLen: number,
  troughInnerR: number,
  effectiveFillFrac: number,
  outerR: number
): SimParticle[] {
  const initCount = Math.max(
    14,
    Math.round(14 + effectiveFillFrac * 90 * Math.pow(outerR / 32, 1.25))
  );
  const initialTrough: SimParticle[] = [];
  for (let i = 0; i < initCount; i++) {
    const frac = (i + 0.5) / initCount;
    const x = startX + 16 + frac * (spanLen - 54);
    const bedH = Math.max(6, troughInnerR * 2 * effectiveFillFrac);
    const lane = ((i * 37) % 100) / 100;
    const y = troughInnerR - 3 - lane * Math.max(4, bedH - 6);
    initialTrough.push({
      id: i + 1,
      x,
      y,
      vx: 40,
      vy: 0,
      r: 1.7 + (i % 3) * 0.5,
      seed: (i * 53) & 255,
    });
  }
  return initialTrough;
}

export function ScrewConveyorSvg({
  inputs,
  metrics,
  phase,
}: ScrewConveyorSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeProbe, setActiveProbe] = useState<ProbeTargetId>('hanger');

  const mat = SCREW_MATERIALS[inputs.materialId];

  // Frame geometry: dynamically center vertically as inclination increases
  const angleDeg = Math.max(0, Math.min(45, inputs.inclinationDeg));
  const angleRad = (angleDeg * Math.PI) / 180;
  const pivotX = 148;
  const pivotY = 232 + (angleDeg / 45) * 112;

  // Trough dimensions in SVG space
  const troughLen = 470;
  const outerR = Math.max(22, Math.min(44, (inputs.screwDiameterMm / 300) * 32));
  const pipeR = Math.max(
    6,
    Math.min(outerR * 0.42, (inputs.pipeDiameterMm / inputs.screwDiameterMm) * outerR)
  );
  const clearancePx = Math.min(10, Math.max(2.5, metrics.effectiveClearanceMm * 0.32));
  const troughInnerR = outerR + clearancePx;

  // Visual pitch in px
  const pitchRatio = inputs.pitchMm / Math.max(150, inputs.screwDiameterMm);
  const pitchPx = Math.max(24, Math.min(68, 42 * pitchRatio));
  const startX = 24;
  const endX = troughLen - 20;
  const spanLen = endX - startX;
  const numPitches = Math.ceil(spanLen / pitchPx) + 1;

  // Fill level height inside trough (from bottom of trough upward)
  const effectiveFillFrac = Math.min(0.95, metrics.effectiveFillPct / 100);
  const fillHeight = troughInnerR * 2 * effectiveFillFrac;
  const fillTopY = troughInnerR - fillHeight;
  const isOverfillJam =
    inputs.faultMode === 'overfill-jam' || inputs.troughFillPct === 95;
  const isAbrasion = inputs.faultMode === 'flight-abrasion';

  const [renderFrame, setRenderFrame] = useState<ScrewRenderFrame>(() => ({
    livePhase: ((phase % 1) + 1) % 1,
    jamLevel: inputs.faultMode === 'overfill-jam' ? 1 : 0,
    inlet: [],
    trough: buildInitialTrough(
      startX,
      spanLen,
      troughInnerR,
      effectiveFillFrac,
      outerR
    ).map((p) => ({ id: p.id, x: p.x, y: p.y, r: p.r })),
    carryback: [],
    chute: [],
  }));

  // Keep latest inputs/metrics/geometry accessible inside rAF without restarting the loop
  const simParamsRef = useRef({
    inputs,
    metrics,
    angleRad,
    outerR,
    troughInnerR,
    pitchPx,
    startX,
    endX,
    spanLen,
    effectiveFillFrac,
    fillTopY,
    isOverfillJam,
    isAbrasion,
  });

  useEffect(() => {
    simParamsRef.current = {
      inputs,
      metrics,
      angleRad,
      outerR,
      troughInnerR,
      pitchPx,
      startX,
      endX,
      spanLen,
      effectiveFillFrac,
      fillTopY,
      isOverfillJam,
      isAbrasion,
    };
  });

  // Persistent real-time dt physics state (accessed strictly inside rAF effect)
  const physRef = useRef<ScrewPhysicsState | null>(null);
  const initialPhaseRef = useRef(phase);

  // Real-time requestAnimationFrame dt physics loop
  useEffect(() => {
    if (physRef.current === null) {
      const p0 = simParamsRef.current;
      const initialTrough = buildInitialTrough(
        p0.startX,
        p0.spanLen,
        p0.troughInnerR,
        p0.effectiveFillFrac,
        p0.outerR
      );
      physRef.current = {
        phiRad: initialPhaseRef.current * Math.PI * 2,
        jamLevel: p0.inputs.faultMode === 'overfill-jam' ? 1 : 0,
        inletSpawnAcc: 0,
        carrybackSpawnAcc: 0,
        nextId: initialTrough.length + 1,
        inlet: [],
        trough: initialTrough,
        carryback: [],
        chute: [],
      };
    }

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const p = simParamsRef.current;
      const st = physRef.current;
      if (st) {
        const rpm = Math.max(5, p.inputs.rpm);
        const omega = (rpm * 2 * Math.PI) / 60; // rad/s
        st.phiRad += omega * dt;

        // Smoothly integrate overfill-jam choke height
        const jamTarget = p.inputs.faultMode === 'overfill-jam' ? 1 : 0;
        st.jamLevel += (jamTarget - st.jamLevel) * Math.min(1, dt * 2.4);

        // World gravity projected into trough-local rotated frame
        const gPx = 420;
        const gx = -gPx * Math.sin(p.angleRad);
        const gy = gPx * Math.cos(p.angleRad);

        // True axial conveying speed in px/s (conservation of pitch * rpm * K_theta * eta)
        const pitchM = Math.max(0.05, p.inputs.pitchMm / 1000);
        const vAxPx = (p.metrics.axialVelocityMs / pitchM) * p.pitchPx;

        // Target particle count & inlet spawn rate scale with fill%, diameter, and mass flow
        const diaScale = Math.pow(p.outerR / 32, 1.3);
        const targetTroughCount = Math.max(
          14,
          Math.round(14 + p.effectiveFillFrac * 92 * diaScale)
        );
        const inletCenterX = p.startX + 34;
        const spawnRate = Math.max(
          4,
          Math.min(
            52,
            (p.metrics.massCapacityTh * 0.85 + rpm * 0.28 * p.effectiveFillFrac) *
              diaScale
          )
        );

        st.inletSpawnAcc += spawnRate * dt;
        while (st.inletSpawnAcc >= 1 && st.inlet.length < 48) {
          st.inletSpawnAcc -= 1;
          const sid = st.nextId++;
          const jitter = (((sid * 37) % 100) / 100 - 0.5) * 22;
          st.inlet.push({
            id: sid,
            x: inletCenterX + jitter,
            y: -p.troughInnerR - 32,
            vx: jitter * 0.4,
            vy: 28 + (sid % 5) * 6,
            r: 1.7 + (sid % 3) * 0.48,
            seed: (sid * 29) & 255,
          });
        }

        // 1. Inlet hopper free-fall under gravity into feed zone
        const feedBedTopY = Math.max(
          -p.troughInnerR + 4,
          p.fillTopY + 4 - st.jamLevel * (p.troughInnerR * 0.65)
        );
        const nextInlet: SimParticle[] = [];
        for (const ip of st.inlet) {
          ip.vx += gx * 0.25 * dt;
          ip.vy += gy * dt;
          ip.x += ip.vx * dt;
          ip.y += ip.vy * dt;

          if (ip.y >= feedBedTopY) {
            if (st.trough.length < targetTroughCount + 12) {
              st.trough.push({
                id: ip.id,
                x: Math.max(p.startX + 10, Math.min(p.startX + 54, ip.x)),
                y: Math.min(p.troughInnerR - ip.r, feedBedTopY + 2),
                vx: vAxPx * 0.6,
                vy: ip.vy * 0.2,
                r: ip.r,
                seed: ip.seed,
              });
            }
          } else {
            nextInlet.push(ip);
          }
        }
        st.inlet = nextInlet;

        // Top-up or trim trough particles smoothly when fill% or diameter changes
        while (st.trough.length < targetTroughCount) {
          const sid = st.nextId++;
          const frac = ((sid * 43) % 100) / 100;
          const bedH = Math.max(6, p.troughInnerR * 2 * p.effectiveFillFrac);
          st.trough.push({
            id: sid,
            x: p.startX + 18 + frac * (p.spanLen - 64),
            y: p.troughInnerR - 3 - (((sid * 19) % 100) / 100) * Math.max(4, bedH - 6),
            vx: vAxPx,
            vy: 0,
            r: 1.7 + (sid % 3) * 0.5,
            seed: (sid * 41) & 255,
          });
        }
        if (st.trough.length > targetTroughCount + 18) {
          st.trough.length = targetTroughCount + 10;
        }

        // 2. Helical advection, inclination slip & tumbling inside trough pockets
        const slipRatio =
          (1 - p.metrics.inclinationFactor) * 0.45 + Math.sin(p.angleRad) * 0.28;
        const nextTrough: SimParticle[] = [];
        for (const tp of st.trough) {
          // Local pocket height scales with fill% and inclination tilt
          const distToEnd = Math.max(0, p.endX - tp.x);
          const endTaper =
            distToEnd < p.pitchPx * 0.9
              ? Math.max(0.32, distToEnd / (p.pitchPx * 0.9))
              : 1;
          const jamBoost =
            tp.x < p.startX + 95
              ? st.jamLevel * (1 - (tp.x - p.startX) / 95) * p.troughInnerR * 0.85
              : 0;
          const localBedH = Math.min(
            p.troughInnerR * 1.9,
            p.troughInnerR * 2 * p.effectiveFillFrac * endTaper + jamBoost
          );
          const minY = p.troughInnerR - localBedH + tp.r;
          const maxY = p.troughInnerR - tp.r;

          // Axial velocity with jam choke & inclination backward slip
          const chokeSlow =
            tp.x < p.startX + 88 ? 1 - st.jamLevel * 0.58 : 1;
          const tumbleWave = Math.sin(
            st.phiRad + (tp.x / p.pitchPx) * Math.PI * 2 + tp.seed * 0.08
          );
          const targetVx =
            vAxPx * chokeSlow * (1 - slipRatio * 0.35) +
            tumbleWave * (8 + 26 * Math.sin(p.angleRad));
          tp.vx += (targetVx - tp.vx) * Math.min(1, dt * 8);

          // Gravity + helical lift/tumble in Y
          const helicalLift =
            Math.cos(
              st.phiRad + (tp.x / p.pitchPx) * Math.PI * 2 + tp.seed * 0.11
            ) *
            (18 + rpm * 0.45 + 28 * Math.sin(p.angleRad));
          tp.vy += (gy * 0.25 + helicalLift - tp.vy * 4.5) * dt;

          tp.x += tp.vx * dt;
          tp.y += tp.vy * dt;

          if (tp.y < minY) {
            tp.y = minY;
            tp.vy = Math.abs(tp.vy) * 0.3;
          } else if (tp.y > maxY) {
            tp.y = maxY;
            tp.vy = -Math.abs(tp.vy) * 0.25;
          }
          if (tp.x < p.startX + 6) {
            tp.x = p.startX + 6;
            tp.vx = Math.abs(tp.vx);
          }

          // Reached open discharge throat -> enter gravity free-fall & chute wall slide
          if (tp.x >= p.endX - 40) {
            if (st.chute.length < 44) {
              st.chute.push({
                id: tp.id,
                x: Math.min(p.endX - 12, tp.x + (tp.seed % 14)),
                y: Math.max(p.troughInnerR - 4, tp.y),
                vx: Math.max(12, tp.vx * 0.55),
                vy: Math.max(14, tp.vy),
                r: tp.r,
                seed: tp.seed,
              });
            }
            // Recycle mass at inlet if hopper is active
            if (st.trough.length <= targetTroughCount) {
              tp.x = p.startX + 14 + (tp.seed % 28);
              tp.y = Math.max(minY, feedBedTopY + 3);
              tp.vx = vAxPx * 0.5;
              tp.vy = 0;
              nextTrough.push(tp);
            }
          } else {
            nextTrough.push(tp);
          }
        }
        st.trough = nextTrough;

        // 3. Carryback particles leaking backward under worn flights on flight-abrasion
        if (p.isAbrasion || p.metrics.carrybackPct >= 18) {
          const cbRate = p.isAbrasion ? 14 : 6;
          st.carrybackSpawnAcc += cbRate * dt;
          while (st.carrybackSpawnAcc >= 1 && st.carryback.length < 24) {
            st.carrybackSpawnAcc -= 1;
            const sid = st.nextId++;
            st.carryback.push({
              id: sid,
              x: p.startX + 40 + ((sid * 59) % Math.max(40, Math.floor(p.spanLen - 80))),
              y: p.troughInnerR - 2.2 - (sid % 2) * 1.8,
              vx: -Math.max(22, vAxPx * 0.65),
              vy: 0,
              r: 1.6 + (sid % 2) * 0.45,
              seed: sid,
            });
          }
        }
        const nextCarryback: SimParticle[] = [];
        for (const cp of st.carryback) {
          cp.x += cp.vx * dt;
          if (cp.x > p.startX + 10 && (p.isAbrasion || p.metrics.carrybackPct >= 18)) {
            nextCarryback.push(cp);
          }
        }
        st.carryback = nextCarryback;

        // 4. Discharge chute gravity free-fall & angled steel wear-liner collision/slide
        const chuteOriginX = p.endX - 44;
        const chuteOriginY = p.troughInnerR + 1;
        // Liner tangent (15, 54) and left wall tangent (15, 57)
        const linerLen = Math.hypot(15, 54);
        const ltx = 15 / linerLen;
        const lty = 54 / linerLen;
        const leftLen = Math.hypot(15, 57);
        const wtx = 15 / leftLen;
        const wty = 57 / leftLen;

        const nextChute: SimParticle[] = [];
        for (const dp of st.chute) {
          dp.vx += gx * dt;
          dp.vy += gy * dt;
          dp.x += dp.vx * dt;
          dp.y += dp.vy * dt;

          const cx = dp.x - chuteOriginX;
          const cy = dp.y - chuteOriginY;

          if (cy >= 7 && cy <= 68) {
            const linerX = 32 + ((cy - 9) / 54) * 15;
            const leftX = 4 + ((cy - 7) / 57) * 15;
            if (cx >= linerX - dp.r) {
              dp.x = chuteOriginX + (linerX - dp.r);
              // Slide smoothly down angled wear liner with friction
              const vDotT = dp.vx * ltx + dp.vy * lty;
              const slideSpeed = Math.max(24, vDotT * 0.92);
              dp.vx = ltx * slideSpeed;
              dp.vy = lty * slideSpeed;
            } else if (cx <= leftX + dp.r) {
              dp.x = chuteOriginX + (leftX + dp.r);
              const vDotT = dp.vx * wtx + dp.vy * wty;
              const slideSpeed = Math.max(20, vDotT * 0.9);
              dp.vx = wtx * slideSpeed;
              dp.vy = wty * slideSpeed;
            }
          }

          if (cy <= 108) {
            nextChute.push(dp);
          }
        }
        st.chute = nextChute;

        setRenderFrame({
          livePhase: (((st.phiRad / (Math.PI * 2)) % 1) + 1) % 1,
          jamLevel: st.jamLevel,
          inlet: st.inlet.map((pt) => ({ id: pt.id, x: pt.x, y: pt.y, r: pt.r })),
          trough: st.trough.map((pt) => ({ id: pt.id, x: pt.x, y: pt.y, r: pt.r })),
          carryback: st.carryback.map((pt) => ({ id: pt.id, x: pt.x, y: pt.y, r: pt.r })),
          chute: st.chute.map((pt) => ({ id: pt.id, x: pt.x, y: pt.y, r: pt.r })),
        });
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const livePhase = renderFrame.livePhase;
  const jamLevel = renderFrame.jamLevel;

  // Hanger bearing positions along the trough
  const hangerPositions: number[] = [];
  if (metrics.hangerCount > 0) {
    const step = spanLen / (metrics.hangerCount + 1);
    for (let i = 1; i <= metrics.hangerCount; i++) {
      hangerPositions.push(startX + step * i);
    }
  }
  const primaryHangerX =
    hangerPositions.length > 0 ? hangerPositions[0] : startX + spanLen * 0.48;

  // Flange bolts along top & bottom of U-trough
  const boltCount = 14;
  const boltXs = Array.from({ length: boltCount }, (_, i) => {
    return 14 + (i / (boltCount - 1)) * (troughLen - 28);
  });

  // Generate 3D-shaded back and front helical flight paths from live dt phase
  const backFlights: string[] = [];
  const frontFlights: string[] = [];
  const flightTipR = isAbrasion ? outerR - 4.5 : outerR;

  for (let i = -1; i <= numPitches; i++) {
    const baseX = startX + (i + livePhase) * pitchPx;
    const bx0 = baseX;
    const bxMid = baseX + pitchPx * 0.25;
    const bx1 = baseX + pitchPx * 0.5;
    if (bx1 >= startX - 10 && bx0 <= endX + 10) {
      backFlights.push(
        `M ${bx0.toFixed(1)} ${(-flightTipR).toFixed(1)} Q ${bxMid.toFixed(1)} ${(
          -flightTipR * 0.48
        ).toFixed(1)} ${bx1.toFixed(1)} ${flightTipR.toFixed(1)}`
      );
    }
    const fx0 = baseX + pitchPx * 0.5;
    const fxMid = baseX + pitchPx * 0.75;
    const fx1 = baseX + pitchPx;
    if (fx1 >= startX - 10 && fx0 <= endX + 10) {
      frontFlights.push(
        `M ${fx0.toFixed(1)} ${flightTipR.toFixed(1)} Q ${fxMid.toFixed(1)} ${(
          flightTipR * 0.48
        ).toFixed(1)} ${fx1.toFixed(1)} ${(-flightTipR).toFixed(1)}`
      );
    }
  }

  // Discrete bulk material pockets between consecutive helical flights:
  // Free surface tilts toward world-horizontal as inclinationDeg increases.
  const pockets: {
    key: number;
    path: string;
  }[] = [];
  for (let i = -2; i <= numPitches + 1; i++) {
    const pLeft = startX + (i + livePhase + 0.5) * pitchPx + 2;
    const pRight = pLeft + pitchPx - 4;
    if (pRight < startX - 10 || pLeft > endX + 10) continue;

    // Discharge taper near outlet throat
    const distToEnd = Math.max(0, endX - pLeft);
    const dischargeDropFactor =
      distToEnd < pitchPx * 0.9 ? Math.max(0.32, distToEnd / (pitchPx * 0.9)) : 1;

    const basePocketH = troughInnerR * 2 * effectiveFillFrac * dischargeDropFactor;
    const pocketW = Math.max(8, pRight - pLeft);
    const gravityTiltDrop = pocketW * Math.tan(angleRad) * 0.55;
    const deltaH = Math.min(
      basePocketH * 0.85,
      basePocketH * 0.22 + gravityTiltDrop * (0.4 + 0.6 * effectiveFillFrac)
    );
    const hLeft = Math.min(troughInnerR * 1.92, basePocketH + deltaH * 0.5);
    const hRight = Math.max(2.5, basePocketH - deltaH * 0.5);

    const yBot = troughInnerR;
    const yTopL = yBot - hLeft;
    const yTopR = yBot - hRight;
    const midX = (pLeft + pRight) * 0.5;
    const midY = (yTopL + yTopR) * 0.5 - (effectiveFillFrac >= 0.85 ? 2 : 3);

    pockets.push({
      key: i,
      path: `M ${pLeft.toFixed(1)} ${yBot.toFixed(1)} L ${pLeft.toFixed(1)} ${yTopL.toFixed(
        1
      )} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${pRight.toFixed(1)} ${yTopR.toFixed(
        1
      )} L ${pRight.toFixed(1)} ${yBot.toFixed(1)} Z`,
    });
  }

  // Live dt-simulated particles for rendering
  const granules = renderFrame.trough;
  const inletGrains = renderFrame.inlet;
  const carrybackGrains = renderFrame.carryback;
  const chuteOriginY = troughInnerR + 1;
  const dischargeDrops = renderFrame.chute.map((dp) => {
    const cy = dp.y - chuteOriginY;
    const opacity = cy > 68 ? Math.max(0, 1 - (cy - 68) / 40) : 0.94;
    return {
      id: dp.id,
      dx: dp.x,
      dy: dp.y,
      r: dp.r,
      opacity,
    };
  });

  // Theme palette (strictly follows global Light / Dark theme)
  const bgTop = isDark ? '#0b1424' : '#ffffff';
  const bgBot = isDark ? '#0f172a' : '#f8fafc';
  const gridStroke = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.06)';
  const casingFill = isDark ? '#1e293b' : '#cbd5e1';
  const casingStroke = isDark ? '#64748b' : '#475569';
  const flangeFill = isDark ? '#334155' : '#94a3b8';
  const troughInterior = isDark ? '#091120' : '#f8fafc';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#475569';

  const statusColor =
    metrics.healthStatus === 'critical'
      ? '#ef4444'
      : metrics.healthStatus === 'warning'
      ? '#f59e0b'
      : '#10b981';

  const isHangerHot = metrics.hangerBearingTempC > 85;
  const totalPowerSum = Math.max(
    0.01,
    metrics.emptyPowerKw + metrics.materialPowerKw + metrics.liftPowerKw
  );

  // Inspection hotspots in local rotating frame
  const hotspots: {
    id: ProbeTargetId;
    x: number;
    y: number;
    labelEn: string;
    labelId: string;
    labelJa: string;
    tempC: number;
    clearanceMm: number;
    torqueNm: number;
    status: 'ok' | 'warn' | 'crit';
  }[] = [
    {
      id: 'gearbox',
      x: -36,
      y: 0,
      labelEn: 'Drive Gearbox',
      labelId: 'Gearbox Penggerak',
      labelJa: '駆動減速機',
      tempC: metrics.gearboxTempC,
      clearanceMm: 0.2,
      torqueNm: metrics.driveTorqueNm,
      status:
        metrics.gearboxTempC > 85 || inputs.faultMode === 'overfill-jam'
          ? 'crit'
          : metrics.gearboxTempC > 68
          ? 'warn'
          : 'ok',
    },
    {
      id: 'hanger',
      x: primaryHangerX,
      y: 0,
      labelEn:
        metrics.hangerCount > 0 ? 'Hanger Bearing #1' : 'Mid-Span Shaft',
      labelId:
        metrics.hangerCount > 0 ? 'Bantalan Gantung #1' : 'Poros Tengah',
      labelJa:
        metrics.hangerCount > 0 ? 'ハンガー軸受 #1' : '中間軸スパン',
      tempC: metrics.hangerBearingTempC,
      clearanceMm: 0.35,
      torqueNm: metrics.driveTorqueNm * 0.42,
      status:
        metrics.hangerBearingTempC > 95
          ? 'crit'
          : metrics.hangerBearingTempC > 72
          ? 'warn'
          : 'ok',
    },
    {
      id: 'flight',
      x: startX + spanLen * 0.68,
      y: flightTipR * 0.72,
      labelEn: 'Flighting Edge',
      labelId: 'Tepi Daun Ulir',
      labelJa: '羽根外周エッジ',
      tempC: metrics.troughSealTempC + 4,
      clearanceMm: metrics.effectiveClearanceMm,
      torqueNm: metrics.driveTorqueNm,
      status:
        inputs.faultMode === 'flight-abrasion' ||
        metrics.effectiveClearanceMm > 18
          ? 'warn'
          : 'ok',
    },
    {
      id: 'seal',
      x: 4,
      y: 0,
      labelEn: 'Trough End Seal',
      labelId: 'Segel Ujung Palung',
      labelJa: 'トラフ端シール',
      tempC: metrics.troughSealTempC,
      clearanceMm: 0.5,
      torqueNm: metrics.driveTorqueNm * 0.12,
      status:
        metrics.troughSealTempC > 55
          ? 'warn'
          : 'ok',
    },
  ];

  const selectedHotspot =
    hotspots.find((h) => h.id === activeProbe) ?? hotspots[1];

  return (
    <div className="sim-box overflow-hidden p-2.5 space-y-2.5">
      <svg
        viewBox="0 0 820 420"
        className="w-full h-auto select-none"
        role="img"
        aria-label={pick(
          'Screw Conveyor Cutaway Simulation',
          'Simulasi Potongan Konveyor Sekrup',
          'スクリューコンベヤ断面シミュレーション'
        )}
      >
        <defs>
          <linearGradient id="sc-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bgTop} />
            <stop offset="100%" stopColor={bgBot} />
          </linearGradient>
          <linearGradient id="sc-casing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#e2e8f0'} />
            <stop offset="50%" stopColor={casingFill} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#94a3b8'} />
          </linearGradient>
          <linearGradient id="sc-pipe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#cbd5e1' : '#e2e8f0'} />
            <stop offset="35%" stopColor={isDark ? '#64748b' : '#94a3b8'} />
            <stop offset="75%" stopColor={isDark ? '#334155' : '#475569'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#334155'} />
          </linearGradient>
          <linearGradient id="sc-motor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="45%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="sc-flight-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#6ee7b7' : '#34d399'} />
            <stop offset="45%" stopColor={isDark ? '#10b981' : '#059669'} />
            <stop offset="100%" stopColor={isDark ? '#047857' : '#065f46'} />
          </linearGradient>
          <linearGradient id="sc-flight-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#065f46' : '#047857'} />
            <stop offset="100%" stopColor={isDark ? '#022c22' : '#064e3b'} />
          </linearGradient>
          <radialGradient id="sc-thermal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <clipPath id="sc-trough-clip">
            <rect
              x={startX}
              y={-troughInnerR}
              width={spanLen}
              height={troughInnerR * 2}
              rx={4}
            />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width="820" height="420" rx="12" fill="url(#sc-bg)" />

        {/* Subtle Engineering Grid */}
        <g stroke={gridStroke} strokeWidth="1">
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * 50}
              y1="0"
              x2={(i + 1) * 50}
              y2="420"
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(i + 1) * 50}
              x2="820"
              y2={(i + 1) * 50}
            />
          ))}
        </g>

        {/* Ground Reference Datum Line */}
        <line
          x1="40"
          y1={pivotY + troughInnerR + 30}
          x2="780"
          y2={pivotY + troughInnerR + 30}
          stroke={isDark ? 'rgba(148,163,184,0.28)' : 'rgba(71,85,105,0.28)'}
          strokeDasharray="6 4"
          strokeWidth="1.2"
        />

        {/* Inclination Angle Arc Indicator */}
        {angleDeg > 0 && (
          <g>
            <path
              d={`M ${pivotX + 85} ${pivotY} A 85 85 0 0 0 ${
                pivotX + 85 * Math.cos((-angleDeg * Math.PI) / 180)
              } ${pivotY + 85 * Math.sin((-angleDeg * Math.PI) / 180)}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={pivotX + 94}
              y={pivotY - 10}
              fill="#10b981"
              fontSize="11"
              fontWeight="700"
            >
              θ = {angleDeg.toFixed(0)}° (Kθ={metrics.inclinationFactor.toFixed(2)})
            </text>
          </g>
        )}

        {/* Rotating/Inclinable Screw Conveyor Assembly */}
        <g transform={`translate(${pivotX}, ${pivotY}) rotate(${-angleDeg})`}>
          {/* Support Pedestal at Tail/Drive & Discharge End */}
          <rect
            x="-12"
            y={troughInnerR + 8}
            width="24"
            height="22"
            rx="3"
            fill={casingFill}
            stroke={casingStroke}
            strokeWidth="1.5"
          />
          <rect
            x={troughLen - 34}
            y={troughInnerR + 8}
            width="20"
            height="22"
            rx="3"
            fill={casingFill}
            stroke={casingStroke}
            strokeWidth="1.5"
          />

          {/* Drive Motor & Helical Gearbox (Left / Tail-Drive End) */}
          <g transform="translate(-108, -28)">
            {/* Motor mounting feet */}
            <rect
              x="6"
              y="46"
              width="40"
              height="6"
              rx="2"
              fill={casingStroke}
            />
            {/* Motor housing */}
            <rect
              x="0"
              y="6"
              width="52"
              height="40"
              rx="6"
              fill="url(#sc-motor)"
              stroke="#064e3b"
              strokeWidth="1.5"
            />
            {/* Terminal box on top */}
            <rect
              x="16"
              y="-2"
              width="18"
              height="8"
              rx="2"
              fill="#065f46"
              stroke="#064e3b"
              strokeWidth="1"
            />
            {/* Cooling fins */}
            {[12, 18, 24, 30, 36].map((fy) => (
              <line
                key={fy}
                x1="6"
                y1={fy}
                x2="38"
                y2={fy}
                stroke="rgba(255,255,255,0.38)"
                strokeWidth="1.5"
              />
            ))}
            {/* Gearbox reducer */}
            <rect
              x="52"
              y="1"
              width="34"
              height="50"
              rx="5"
              fill="url(#sc-casing)"
              stroke={casingStroke}
              strokeWidth="1.6"
            />
            {/* Gearbox oil sight glass */}
            <circle
              cx="69"
              cy="34"
              r="5"
              fill={isDark ? '#0f172a' : '#ffffff'}
              stroke={casingStroke}
              strokeWidth="1.2"
            />
            <circle cx="69" cy="34" r="2.5" fill="#f59e0b" />
            {/* Coupling */}
            <rect
              x="86"
              y="17"
              width="16"
              height="18"
              rx="2"
              fill={
                inputs.faultMode === 'overfill-jam'
                  ? '#ef4444'
                  : isDark
                  ? '#94a3b8'
                  : '#64748b'
              }
              stroke={casingStroke}
              strokeWidth="1.2"
            />
            <text
              x="26"
              y="-8"
              textAnchor="middle"
              fill={textMuted}
              fontSize="10"
              fontWeight="700"
            >
              {pick('DRIVE', 'PENGGERAK', '駆動部')}
            </text>
          </g>

          {/* U-Trough Outer Casing with 3D Shading */}
          <rect
            x="0"
            y={-troughInnerR - 8}
            width={troughLen}
            height={troughInnerR * 2 + 16}
            rx="6"
            fill="url(#sc-casing)"
            stroke={casingStroke}
            strokeWidth="1.8"
          />

          {/* Top Bolted Flange Rail (split at Inlet Hopper throat) */}
          <rect
            x="0"
            y={-troughInnerR - 8}
            width={startX + 14}
            height="7"
            rx="2"
            fill={flangeFill}
            stroke={casingStroke}
            strokeWidth="1"
          />
          <rect
            x={startX + 54}
            y={-troughInnerR - 8}
            width={troughLen - (startX + 54)}
            height="7"
            rx="2"
            fill={flangeFill}
            stroke={casingStroke}
            strokeWidth="1"
          />

          {/* Bottom Bolted Flange Rail (split at Discharge Chute outlet) */}
          <rect
            x="0"
            y={troughInnerR + 1}
            width={endX - 44}
            height="7"
            rx="2"
            fill={flangeFill}
            stroke={casingStroke}
            strokeWidth="1"
          />
          <rect
            x={endX - 4}
            y={troughInnerR + 1}
            width={troughLen - (endX - 4)}
            height="7"
            rx="2"
            fill={flangeFill}
            stroke={casingStroke}
            strokeWidth="1"
          />
          {boltXs.map((bx, i) => (
            <g key={`bolt-${i}`}>
              {(bx < startX + 12 || bx > startX + 56) && (
                <circle
                  cx={bx}
                  cy={-troughInnerR - 4.5}
                  r="1.8"
                  fill={isDark ? '#cbd5e1' : '#334155'}
                />
              )}
              {(bx < endX - 46 || bx > endX - 2) && (
                <circle
                  cx={bx}
                  cy={troughInnerR + 4.5}
                  r="1.8"
                  fill={isDark ? '#cbd5e1' : '#334155'}
                />
              )}
            </g>
          ))}

          {/* Cutaway Trough Interior + Open Feed & Discharge Throats */}
          <rect
            x={startX}
            y={-troughInnerR}
            width={spanLen}
            height={troughInnerR * 2}
            rx="4"
            fill={troughInterior}
            stroke={isDark ? '#334155' : '#cbd5e1'}
            strokeWidth="1"
          />
          {/* Inlet throat cutaway passage */}
          <rect
            x={startX + 14}
            y={-troughInnerR - 9}
            width="40"
            height="12"
            fill={troughInterior}
          />
          {/* Discharge throat cutaway passage */}
          <rect
            x={endX - 44}
            y={troughInnerR - 2}
            width="40"
            height="12"
            fill={troughInterior}
          />

          {/* Inlet Hopper (Feed Zone) with Continuous Granular Pouring Stream */}
          <g transform={`translate(${startX + 14}, ${-troughInnerR - 50})`}>
            {/* Hopper outer steel walls */}
            <polygon
              points="-16,0 56,0 40,42 0,42"
              fill={isDark ? 'rgba(30,41,59,0.92)' : 'rgba(226,232,240,0.95)'}
              stroke={casingStroke}
              strokeWidth="1.6"
            />
            {/* Bulk material inside hopper (backs up higher on overfill-jam) */}
            <polygon
              points={
                inputs.faultMode === 'overfill-jam'
                  ? '-13,6 53,6 39,42 1,42'
                  : '-9,16 49,16 38,42 2,42'
              }
              fill={mat.color}
              opacity={isOverfillJam ? 0.92 : 0.76}
            />
            {/* Bolted throat collar */}
            <rect
              x="-4"
              y="38"
              width="48"
              height="6"
              rx="1.5"
              fill={flangeFill}
              stroke={casingStroke}
              strokeWidth="1.1"
            />
            <text
              x="20"
              y="-7"
              textAnchor="middle"
              fill={textMuted}
              fontSize="10"
              fontWeight="700"
            >
              {pick('INLET HOPPER', 'HOPPER MASUK', '供給ホッパー')}
            </text>
          </g>

          {/* Continuous translucent pouring stream from inlet throat into feed zone */}
          <polygon
            points={`${startX + 20},${-troughInnerR - 10} ${startX + 48},${-troughInnerR - 10} ${
              startX + 53
            },${Math.min(troughInnerR - 2, fillTopY + 8)} ${startX + 15},${Math.min(
              troughInnerR - 2,
              fillTopY + 8
            )}`}
            fill={mat.color}
            opacity={isOverfillJam ? 0.78 : 0.45}
          />
          {inletGrains.map((ig) => (
            <circle
              key={`ig-${ig.id}`}
              cx={ig.x}
              cy={ig.y}
              r={ig.r}
              fill={mat.grainColor}
              opacity={0.86}
            />
          ))}

          {/* Industrial Discharge Chute (Angled Steel Spout with Bolted Flange & Wear Liner) */}
          <g transform={`translate(${endX - 44}, ${troughInnerR + 1})`}>
            {/* Top bolted mounting flange */}
            <rect
              x="-5"
              y="0"
              width="50"
              height="7"
              rx="1.5"
              fill={flangeFill}
              stroke={casingStroke}
              strokeWidth="1.2"
            />
            {[-1, 10, 20, 30, 41].map((bx) => (
              <circle
                key={`dc-tb-${bx}`}
                cx={bx}
                cy="3.5"
                r="1.4"
                fill={isDark ? '#e2e8f0' : '#334155'}
              />
            ))}
            {/* Angled steel chute outer shell */}
            <polygon
              points="0,7 40,7 56,66 14,66"
              fill="url(#sc-casing)"
              stroke={casingStroke}
              strokeWidth="1.6"
            />
            {/* Cutaway chute interior */}
            <polygon
              points="4,7 36,7 51,64 19,64"
              fill={troughInterior}
              stroke={isDark ? '#334155' : '#94a3b8'}
              strokeWidth="1"
            />
            {/* Bolted abrasion-resistant wear liner along impact wall */}
            <polygon
              points="32,9 37,9 52,63 47,63"
              fill={isDark ? '#475569' : '#64748b'}
              stroke={isDark ? '#94a3b8' : '#334155'}
              strokeWidth="0.9"
            />
            {[18, 32, 46, 57].map((ly, idx) => (
              <circle
                key={`liner-b-${idx}`}
                cx={36 + idx * 3.8}
                cy={ly}
                r="1.2"
                fill={isDark ? '#e2e8f0' : '#f8fafc'}
              />
            ))}
            {/* Continuous cascading bulk material stream inside chute */}
            <polygon
              points={`10,6 32,6 45,65 ${isOverfillJam ? 21 : 25},65`}
              fill={mat.color}
              opacity={isOverfillJam ? 0.68 : 0.44}
            />
            {/* Bottom discharge outlet flange */}
            <rect
              x="10"
              y="64"
              width="50"
              height="6"
              rx="1.5"
              fill={flangeFill}
              stroke={casingStroke}
              strokeWidth="1.2"
            />
            {[15, 25, 35, 45, 55].map((bx) => (
              <circle
                key={`dc-bb-${bx}`}
                cx={bx}
                cy="67"
                r="1.3"
                fill={isDark ? '#e2e8f0' : '#334155'}
              />
            ))}
            <text
              x="66"
              y="40"
              textAnchor="start"
              fill={textMuted}
              fontSize="10"
              fontWeight="700"
            >
              {pick('DISCHARGE CHUTE', 'CORONG KELUARAN', '排出シュート')}
            </text>
          </g>

          {/* Clipped Interior: Discrete Material Pockets + 3D Flights + Center Pipe + Granules */}
          <g clipPath="url(#sc-trough-clip)">
            {/* Discrete Bulk Material Pockets between Rotating Helical Flights */}
            {pockets.map((pk) => (
              <path
                key={`pk-${pk.key}`}
                d={pk.path}
                fill={mat.color}
                opacity={isOverfillJam ? 0.72 : 0.48}
              />
            ))}

            {/* Feed Zone Angle-of-Repose Mound (and Overfill-Jam Backup Pile-up) */}
            <path
              d={(() => {
                const normalTopY = Math.max(-troughInnerR + 10, fillTopY - 8);
                const chokeTopY = normalTopY + (-troughInnerR + 2 - normalTopY) * jamLevel;
                const chokeMidY =
                  Math.max(-troughInnerR + 14, fillTopY - 4) +
                  (-troughInnerR + 4 - Math.max(-troughInnerR + 14, fillTopY - 4)) * jamLevel;
                const xEnd = startX + 68 + 24 * jamLevel;
                return `M ${startX + 8 * (1 - jamLevel)} ${troughInnerR} L ${
                  startX + 16 * (1 - jamLevel)
                } ${chokeTopY.toFixed(1)} Q ${startX + 43} ${chokeMidY.toFixed(
                  1
                )} ${xEnd.toFixed(1)} ${(fillTopY + 4 * (1 - jamLevel)).toFixed(
                  1
                )} L ${xEnd.toFixed(1)} ${troughInnerR} Z`;
              })()}
              fill={mat.color}
              opacity={0.36 + 0.46 * jamLevel}
            />

            {/* Back-half Helical Flights (Recessed 3D shading) */}
            <g
              fill="none"
              stroke="url(#sc-flight-back)"
              strokeWidth={Math.max(4.5, outerR * 0.18)}
              strokeLinecap="round"
              opacity="0.82"
            >
              {backFlights.map((d, idx) => (
                <path key={`bf-${idx}`} d={d} />
              ))}
            </g>

            {/* Center Pipe / Shaft */}
            <rect
              x={-8}
              y={-pipeR}
              width={troughLen + 14}
              height={pipeR * 2}
              fill="url(#sc-pipe)"
              stroke={isDark ? '#334155' : '#475569'}
              strokeWidth="1"
            />

            {/* Tumbling Bulk Granules inside Pockets */}
            {granules.map((g) => (
              <circle
                key={`tg-${g.id}`}
                cx={g.x}
                cy={g.y}
                r={g.r}
                fill={mat.grainColor}
                opacity="0.92"
              />
            ))}

            {/* Carryback Granules slipping backward under worn flights */}
            {carrybackGrains.map((cg) => (
              <circle
                key={`cb-${cg.id}`}
                cx={cg.x}
                cy={cg.y}
                r={cg.r}
                fill="#f59e0b"
                opacity="0.95"
              />
            ))}

            {/* Front-half Helical Flights (3D Bevel + Highlight) */}
            <g
              fill="none"
              stroke={
                inputs.faultMode === 'flight-abrasion'
                  ? '#f59e0b'
                  : 'url(#sc-flight-front)'
              }
              strokeWidth={Math.max(5, outerR * 0.2)}
              strokeLinecap="round"
              strokeDasharray={
                inputs.faultMode === 'flight-abrasion' ? '8 3' : undefined
              }
            >
              {frontFlights.map((d, idx) => (
                <path key={`ff-${idx}`} d={d} />
              ))}
            </g>

            {/* Specular edge highlight on front flights */}
            {inputs.faultMode !== 'flight-abrasion' && (
              <g
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.2"
                strokeLinecap="round"
              >
                {frontFlights.map((d, idx) => (
                  <path key={`ffh-${idx}`} d={d} />
                ))}
              </g>
            )}

            {/* Intermediate Hanger Bearings with Live Thermal Glow */}
            {hangerPositions.map((hx, idx) => (
              <g key={`hb-${idx}`} transform={`translate(${hx}, 0)`}>
                {isHangerHot && (
                  <circle
                    cx="0"
                    cy="0"
                    r={pipeR + 18}
                    fill="url(#sc-thermal-glow)"
                  />
                )}
                {/* Hanger bracket from top */}
                <rect
                  x="-4"
                  y={-troughInnerR}
                  width="8"
                  height={troughInnerR - pipeR + 2}
                  fill={isHangerHot ? '#ef4444' : '#64748b'}
                />
                {/* Bearing sleeve */}
                <rect
                  x="-8"
                  y={-pipeR - 4}
                  width="16"
                  height={pipeR * 2 + 8}
                  rx="3"
                  fill={isHangerHot ? '#dc2626' : '#94a3b8'}
                  stroke={isHangerHot ? '#fca5a5' : '#334155'}
                  strokeWidth="1.5"
                />
                {isHangerHot && (
                  <circle
                    cx="0"
                    cy="0"
                    r={pipeR + 11}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.9"
                  />
                )}
              </g>
            ))}
          </g>

          {/* Discharge Chute Cascading Granules (unclipped so particles flow down & out) */}
          {dischargeDrops.map((d) => (
            <circle
              key={`dd-${d.id}`}
              cx={d.dx}
              cy={d.dy}
              r={d.r}
              fill={mat.grainColor}
              opacity={d.opacity}
            />
          ))}

          {/* Clickable Inspection Hotspots */}
          {hotspots.map((hs) => {
            const isSelected = hs.id === activeProbe;
            const ringColor =
              hs.status === 'crit'
                ? '#ef4444'
                : hs.status === 'warn'
                ? '#f59e0b'
                : '#10b981';
            return (
              <g
                key={hs.id}
                transform={`translate(${hs.x}, ${hs.y})`}
                onClick={() => setActiveProbe(hs.id)}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected ? 15 : 11}
                  fill={
                    isSelected
                      ? 'rgba(16,185,129,0.18)'
                      : isDark
                      ? 'rgba(15,23,42,0.32)'
                      : 'rgba(255,255,255,0.72)'
                  }
                  stroke={ringColor}
                  strokeWidth={isSelected ? 2.2 : 1.4}
                  strokeDasharray={isSelected ? undefined : '3 2'}
                />
                <circle r="4" fill={ringColor} />
              </g>
            );
          })}

          {/* Fault Callouts inside Rotating Frame */}
          {inputs.faultMode === 'hanger-wear' && hangerPositions.length > 0 && (
            <g transform={`translate(${hangerPositions[0]}, ${-troughInnerR - 28})`}>
              <rect
                x="-62"
                y="-14"
                width="124"
                height="22"
                rx="6"
                fill="#dc2626"
              />
              <text
                x="0"
                y="1"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="800"
              >
                {metrics.hangerBearingTempC.toFixed(0)}°C{' '}
                {pick('BEARING HOT', 'BANTALAN PANAS', '軸受過熱')}
              </text>
            </g>
          )}

          {inputs.faultMode === 'flight-abrasion' && (
            <g
              transform={`translate(${startX + spanLen * 0.52}, ${
                troughInnerR + 26
              })`}
            >
              <rect
                x="-76"
                y="-12"
                width="152"
                height="22"
                rx="6"
                fill="#d97706"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="800"
              >
                {pick('CARRYBACK', 'ARUS BALIK', '逆流損失')}: {metrics.carrybackPct}%
              </text>
            </g>
          )}

          {inputs.faultMode === 'overfill-jam' && (
            <g transform="translate(-20, -48)">
              <rect
                x="-58"
                y="-12"
                width="116"
                height="22"
                rx="6"
                fill="#dc2626"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="800"
              >
                {pick('TORQUE SPIKE!', 'LONJAKAN TORSI!', '過負荷トルク!')}
              </text>
            </g>
          )}
        </g>

        {/* Top-Left Live Telemetry Overlay */}
        <g transform="translate(16, 14)">
          <rect
            x="0"
            y="0"
            width="255"
            height="58"
            rx="10"
            fill={isDark ? 'rgba(15,23,42,0.84)' : 'rgba(255,255,255,0.88)'}
            stroke={isDark ? 'rgba(148,163,184,0.22)' : 'rgba(15,23,42,0.12)'}
          />
          <circle cx="16" cy="18" r="5" fill={statusColor} />
          <text x="28" y="22" fill={textPrimary} fontSize="11.5" fontWeight="800">
            {pick('CEMA 350 Screw Conveyor', 'Konveyor Sekrup CEMA 350', 'CEMA 350 スクリューコンベヤ')}
          </text>
          <text x="16" y="42" fill={textMuted} fontSize="10.5" fontWeight="600">
            Ø{inputs.screwDiameterMm} mm · P={inputs.pitchMm} mm · {inputs.rpm} RPM · {inputs.troughFillPct}%
          </text>
        </g>

        {/* Top-Right Live Output Pill */}
        <g transform="translate(556, 14)">
          <rect
            x="0"
            y="0"
            width="248"
            height="58"
            rx="10"
            fill={isDark ? 'rgba(15,23,42,0.84)' : 'rgba(255,255,255,0.88)'}
            stroke={isDark ? 'rgba(148,163,184,0.22)' : 'rgba(15,23,42,0.12)'}
          />
          <text x="14" y="21" fill={textMuted} fontSize="10" fontWeight="700">
            {pick('MASS FLOW / DRIVE TORQUE', 'KAPASITAS / TORSI', '搬送量・駆動トルク')}
          </text>
          <text x="14" y="43" fill="#10b981" fontSize="14" fontWeight="800">
            {metrics.massCapacityTh.toFixed(1)} t/h
          </text>
          <text x="116" y="43" fill={textPrimary} fontSize="13" fontWeight="800">
            · {metrics.driveTorqueNm.toFixed(0)} N·m
          </text>
        </g>
      </svg>

      {/* Bottom Visualization Strip: IR Temp & Torque Probe + Live Power Breakdown */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12">
        {/* Interactive IR Temp / Torque Inspection Probe Readout */}
        <div className="md:col-span-7 rounded-xl border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-700/70 dark:bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Crosshair className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {pick('IR & Torque Probe:', 'Probe IR & Torsi:', 'IR温度・トルクプローブ:')}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {pick(
                  selectedHotspot.labelEn,
                  selectedHotspot.labelId,
                  selectedHotspot.labelJa
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hotspots.map((hs) => (
                <button
                  key={hs.id}
                  type="button"
                  onClick={() => setActiveProbe(hs.id)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                    activeProbe === hs.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300/70 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {pick(
                    hs.labelEn.split(' ')[0],
                    hs.labelId.split(' ')[0],
                    hs.labelJa.slice(0, 4)
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2 py-1 dark:bg-slate-800/80">
              <Thermometer className="h-3.5 w-3.5 text-rose-500" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pick('IR Temp', 'Suhu IR', 'IR温度')}
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {selectedHotspot.tempC.toFixed(1)} °C
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2 py-1 dark:bg-slate-800/80">
              <Gauge className="h-3.5 w-3.5 text-sky-500" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pick('Clearance', 'Celah', '隙間')}
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {selectedHotspot.clearanceMm.toFixed(1)} mm
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2 py-1 dark:bg-slate-800/80">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pick('Local Torque', 'Torsi Lokal', '局所トルク')}
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {selectedHotspot.torqueNm.toFixed(0)} N·m
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Power Breakdown Bar inside Visualization Card */}
        <div className="md:col-span-5 rounded-xl border border-slate-200/80 bg-white/70 p-2.5 dark:border-slate-700/70 dark:bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span>{pick('Live Power Breakdown', 'Rincian Daya Langsung', 'リアルタイム動力内訳')}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {metrics.drivePowerKw.toFixed(2)} kW
            </span>
          </div>
          <div className="my-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="bg-slate-500 transition-all"
              style={{ width: `${(metrics.emptyPowerKw / totalPowerSum) * 100}%` }}
            />
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(metrics.materialPowerKw / totalPowerSum) * 100}%` }}
            />
            <div
              className="bg-sky-500 transition-all"
              style={{ width: `${(metrics.liftPowerKw / totalPowerSum) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] text-slate-600 dark:text-slate-300">
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-500" />
              {pick('Empty', 'Kosong', '空運転')}: <strong>{metrics.emptyPowerKw.toFixed(2)}</strong>
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {pick('Mat.', 'Mat.', '搬送')}: <strong>{metrics.materialPowerKw.toFixed(2)}</strong>
            </span>
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500" />
              {pick('Lift', 'Angkat', '揚程')}: <strong>{metrics.liftPowerKw.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
