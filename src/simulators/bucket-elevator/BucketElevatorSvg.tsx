import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { G_ACCEL } from '../../physics';
import type {
  BucketElevatorInputs,
  BucketElevatorMetrics,
} from './bucketElevatorMath';

export type ProbeHotspotId =
  | 'head-pulley'
  | 'discharge-throat'
  | 'backstop-brake'
  | 'boot-takeup';

interface HotspotDef {
  id: ProbeHotspotId;
  x: number;
  y: number;
  labelEn: string;
  labelId: string;
  labelJa: string;
}

interface BucketElevatorSvgProps {
  inputs: BucketElevatorInputs;
  metrics: BucketElevatorMetrics;
  materialColor: string;
  phase?: number; // optional legacy prop
  isPlaying?: boolean;
}

interface SimParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  isSpill: boolean;
  onChute: boolean;
}

interface InletParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface PhysicsState {
  beltTravelPx: number;
  pulleyAngleRad: number;
  tailAngleRad: number;
  simTime: number;
  bootLevel: number;
  inletSpawnAcc: number;
  nextParticleId: number;
  dischargeParticles: SimParticle[];
  inletParticles: InletParticle[];
}

interface RenderSnapshot {
  beltPhase: number;
  pulleyRotDeg: number;
  tailRotDeg: number;
  bootSurfaceY: number;
  bootLevel: number;
  simTime: number;
  dischargeParticles: SimParticle[];
  inletParticles: InletParticle[];
}

interface LoopPoint {
  x: number;
  y: number;
  angleDeg: number;
  section: 'ascend' | 'top' | 'descend' | 'bottom';
  arcT: number;
}

function getLoopPoint(
  tNorm: number,
  cx: number,
  topY: number,
  botY: number,
  r: number
): LoopPoint {
  const t = ((tNorm % 1) + 1) % 1;
  const straightLen = botY - topY;
  const arcLen = Math.PI * r;
  const totalLen = 2 * straightLen + 2 * arcLen;
  const s = t * totalLen;

  if (s < straightLen) {
    const u = s / straightLen;
    return {
      x: cx - r,
      y: botY - u * straightLen,
      angleDeg: 0,
      section: 'ascend',
      arcT: 0,
    };
  }

  if (s < straightLen + arcLen) {
    const u = (s - straightLen) / arcLen;
    const theta = Math.PI - u * Math.PI;
    return {
      x: cx + r * Math.cos(theta),
      y: topY - r * Math.sin(theta),
      angleDeg: u * 180,
      section: 'top',
      arcT: u,
    };
  }

  if (s < 2 * straightLen + arcLen) {
    const u = (s - straightLen - arcLen) / straightLen;
    return {
      x: cx + r,
      y: topY + u * straightLen,
      angleDeg: 180,
      section: 'descend',
      arcT: 0,
    };
  }

  const u = (s - 2 * straightLen - arcLen) / arcLen;
  const theta = -u * Math.PI;
  return {
    x: cx + r * Math.cos(theta),
    y: botY - r * Math.sin(theta),
    angleDeg: 180 + u * 180,
    section: 'bottom',
    arcT: u,
  };
}

export function BucketElevatorSvg({
  inputs,
  metrics,
  materialColor,
  isPlaying = true,
}: BucketElevatorSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const svgRef = useRef<SVGSVGElement | null>(null);

  const cx = 248;
  const topY = 126;
  const botY = 414;
  // Scale pulley radius with headPulleyDiaMm (250..1000 -> 42..64 px)
  const headR = 42 + ((inputs.headPulleyDiaMm - 250) / 750) * 22;
  const tailR = 40;
  const beltR = headR;

  const [renderState, setRenderState] = useState<RenderSnapshot>(() => ({
    beltPhase: 0,
    pulleyRotDeg: 0,
    tailRotDeg: 0,
    bootSurfaceY: botY + 26 - 0.35 * 44,
    bootLevel: 0.35,
    simTime: 0,
    dischargeParticles: [],
    inletParticles: [],
  }));
  const physicsRef = useRef<PhysicsState>({
    beltTravelPx: 0,
    pulleyAngleRad: 0,
    tailAngleRad: 0,
    simTime: 0,
    bootLevel: 0.35,
    inletSpawnAcc: 0,
    nextParticleId: 1,
    dischargeParticles: [],
    inletParticles: [],
  });

  const latestRef = useRef({
    inputs,
    metrics,
    isPlaying,
    headR,
    beltR,
  });

  useEffect(() => {
    latestRef.current = { inputs, metrics, isPlaying, headR, beltR };
  });

  const hotspots: HotspotDef[] = [
    {
      id: 'head-pulley',
      x: cx,
      y: topY,
      labelEn: 'Head Pulley',
      labelId: 'Puli Kepala',
      labelJa: 'ヘッドプーリ',
    },
    {
      id: 'discharge-throat',
      x: cx + beltR + 34,
      y: topY + 34,
      labelEn: 'Discharge Throat',
      labelId: 'Mulut Corong',
      labelJa: '排出スロート',
    },
    {
      id: 'backstop-brake',
      x: cx - beltR - 42,
      y: topY + 4,
      labelEn: 'Backstop Brake',
      labelId: 'Rem Backstop',
      labelJa: '逆転防止ブレーキ',
    },
    {
      id: 'boot-takeup',
      x: cx + beltR + 48,
      y: botY,
      labelEn: 'Boot Take-Up',
      labelId: 'Take-Up Boot',
      labelJa: 'ブーツ張り装置',
    },
  ];

  const [activeHotspot, setActiveHotspot] =
    useState<ProbeHotspotId>('head-pulley');
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentHotspot =
    hotspots.find((h) => h.id === activeHotspot) ?? hotspots[0];
  const probePos = dragPos ?? {
    x: currentHotspot.x + 28,
    y: currentHotspot.y + 22,
  };

  function toSvgCoords(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: probePos.x, y: probePos.y };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: probePos.x, y: probePos.y };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(ctm.inverse());
    return {
      x: Math.max(24, Math.min(616, transformed.x)),
      y: Math.max(24, Math.min(496, transformed.y)),
    };
  }

  function handleProbePointerDown(e: React.PointerEvent<SVGGElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const pt = toSvgCoords(e.clientX, e.clientY);
    setDragPos(pt);
  }

  function handleProbePointerMove(e: React.PointerEvent<SVGGElement>) {
    if (!isDragging) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    setDragPos(pt);

    // Highlight nearest hotspot if within snap radius
    let nearestId: ProbeHotspotId | null = null;
    let bestDist = 75;
    for (const h of hotspots) {
      const d = Math.hypot(pt.x - h.x, pt.y - h.y);
      if (d < bestDist) {
        bestDist = d;
        nearestId = h.id;
      }
    }
    if (nearestId) {
      setActiveHotspot(nearestId);
    }
  }

  function handleProbePointerUp(e: React.PointerEvent<SVGGElement>) {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    setDragPos(null);
  }

  const bucketCount = Math.max(
    8,
    Math.min(22, Math.round(6400 / inputs.bucketSpacingMm))
  );
  const bucketProjPx = 12 + ((inputs.bucketProjectionMm - 100) / 160) * 10;
  const bucketVolScale = 0.72 + ((inputs.bucketVolumeL - 1.5) / 16.5) * 0.45;

  const isBackspill = metrics.dischargeRegime === 'gravity-backspill';
  const isTransitional = metrics.dischargeRegime === 'transitional';
  const isChoke = inputs.fault === 'boot-choke';
  const isSlip = inputs.fault === 'belt-slip';
  const isMissing = inputs.fault === 'missing-bucket';
  const isMisaligned = inputs.fault === 'misalignment';
  const isChain = inputs.elevatorType === 'chain';

  // Chute geometry references (must match the SVG chute path below)
  const chuteThroatX = cx + beltR + bucketProjPx + 6;
  const chuteFloorY0 = topY + 68;
  const chuteOutX = 476;
  const chuteFloorY1 = topY + 148;
  const inletLeftX = 68;
  const inletRightX = cx - beltR - 32;

  const pulleyRadiusM = inputs.headPulleyDiaMm / 2000;
  const pxPerMeter = headR / Math.max(0.05, pulleyRadiusM);
  const gPx = G_ACCEL * pxPerMeter;
  const lipR = headR + bucketProjPx * 0.85;
  const frClamped = Math.max(0.15, Math.min(2.5, metrics.froudeNumber));
  const releaseDeg = isBackspill
    ? 58
    : inputs.elevatorType === 'continuous'
      ? 48
      : isTransitional
        ? 48
        : Math.max(26, Math.min(46, 44 - (frClamped - 1.0) * 10));
  const releaseRad = (releaseDeg * Math.PI) / 180;
  const arcTRelease = 0.5 + releaseDeg / 180;

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));
      const {
        inputs: curInputs,
        metrics: curMetrics,
        isPlaying: curPlaying,
        headR: curHeadR,
        beltR: curBeltR,
      } = latestRef.current;

      if (curPlaying) {
        const phys = physicsRef.current;
        phys.simTime += dt;

        const curPulleyRadiusM = curInputs.headPulleyDiaMm / 2000;
        const curPxPerM = curHeadR / Math.max(0.05, curPulleyRadiusM);
        const curGPx = G_ACCEL * curPxPerM;

        const straightLen = botY - topY;
        const arcLen = Math.PI * curBeltR;
        const totalLoopLenPx = 2 * straightLen + 2 * arcLen;

        // 1. Kinematics: head pulley omega drives belt travel s += v * dt
        const omega = curMetrics.angularVelocityRadS;
        const vMs = omega * curPulleyRadiusM;
        const vPx = vMs * curPxPerM;

        const prevPhase = (phys.beltTravelPx / totalLoopLenPx) % 1;
        phys.beltTravelPx = (phys.beltTravelPx + vPx * dt) % totalLoopLenPx;
        const currPhase = (phys.beltTravelPx / totalLoopLenPx) % 1;
        phys.pulleyAngleRad = (phys.pulleyAngleRad + omega * dt) % (2 * Math.PI);
        phys.tailAngleRad = (phys.tailAngleRad + (vPx / tailR) * dt) % (2 * Math.PI);

        // 2. Dynamic boot puddle height
        const curIsChoke = curInputs.fault === 'boot-choke';
        const targetBoot = curIsChoke
          ? 0.96
          : Math.min(0.65, 0.24 + (curInputs.fillFactorPct / 100) * 0.22);
        phys.bootLevel += (targetBoot - phys.bootLevel) * Math.min(1, dt * 2.8);
        const bootSurfaceY = botY + 26 - phys.bootLevel * 44;

        // 3. Discharge particle spawning per bucket crossing release angle
        const curBucketCount = Math.max(
          8,
          Math.min(22, Math.round(6400 / curInputs.bucketSpacingMm))
        );
        const curBucketProjPx =
          12 + ((curInputs.bucketProjectionMm - 100) / 160) * 10;
        const curIsBackspill = curMetrics.dischargeRegime === 'gravity-backspill';
        const curIsTrans = curMetrics.dischargeRegime === 'transitional';
        const curIsMissing = curInputs.fault === 'missing-bucket';
        const curFr = Math.max(0.15, Math.min(2.5, curMetrics.froudeNumber));
        const curReleaseDeg = curIsBackspill
          ? 58
          : curInputs.elevatorType === 'continuous'
            ? 48
            : curIsTrans
              ? 48
              : Math.max(26, Math.min(46, 44 - (curFr - 1.0) * 10));
        const curReleaseRad = (curReleaseDeg * Math.PI) / 180;
        const curArcTRelease = 0.5 + curReleaseDeg / 180;
        const releaseT = (straightLen + curArcTRelease * arcLen) / totalLoopLenPx;

        const particlesPerBucket = Math.max(
          2,
          Math.min(
            14,
            Math.round(
              2 +
                (curInputs.bucketVolumeL / 18) *
                  (curInputs.fillFactorPct / 100) *
                  12
            )
          )
        );

        for (let i = 0; i < curBucketCount; i++) {
          if (curIsMissing && i === 2) continue;
          const bPrevT = (prevPhase + i / curBucketCount) % 1;
          const bCurrT = (currPhase + i / curBucketCount) % 1;
          const crossed =
            bCurrT >= bPrevT
              ? bPrevT < releaseT && bCurrT >= releaseT
              : bPrevT < releaseT || bCurrT >= releaseT;

          // Also emit staggered trailing grains while bucket tips through active pour window
          const pourWindowEnd = (releaseT + 0.035) % 1;
          const inPourWindow =
            pourWindowEnd >= releaseT
              ? bCurrT >= releaseT && bCurrT <= pourWindowEnd
              : bCurrT >= releaseT || bCurrT <= pourWindowEnd;

          if ((crossed || (inPourWindow && Math.random() < dt * 26)) && phys.dischargeParticles.length < 180) {
            const burstCount = crossed ? particlesPerBucket : Math.max(1, Math.round(particlesPerBucket * 0.35));
            for (let k = 0; k < burstCount; k++) {
              const frac = (k + 0.5) / burstCount;
              const rPx = curHeadR + 4 + frac * (curBucketProjPx * 0.9);
              const rM = curPulleyRadiusM + (rPx - curHeadR) / curPxPerM;
              const pourOffset = crossed ? 0 : 0.14 * Math.random();
              const ang = curReleaseRad + pourOffset + (Math.random() - 0.5) * 0.12;
              const vMagPx =
                omega * rM * curPxPerM * (0.94 + Math.random() * 0.14);
              phys.dischargeParticles.push({
                id: phys.nextParticleId++,
                x: cx + rPx * Math.sin(ang),
                y: topY - rPx * Math.cos(ang),
                vx: vMagPx * Math.cos(ang),
                vy: vMagPx * Math.sin(ang),
                r: 2.1 + Math.random() * 1.1,
                isSpill: false,
                onChute: false,
              });
            }
          }
        }

        // 4. Integrate discharge particles with gravity + chute collision/slide
        const curChuteThroatX = cx + curBeltR + curBucketProjPx + 6;
        const dxChute = chuteOutX - curChuteThroatX;
        const dyChute = chuteFloorY1 - chuteFloorY0;
        const chuteLen = Math.hypot(dxChute, dyChute);
        const tx = dxChute / chuteLen;
        const ty = dyChute / chuteLen;
        const nx = ty;
        const ny = -tx;

        const subSteps = dt > 0.018 ? 2 : 1;
        const subDt = dt / subSteps;

        for (let s = 0; s < subSteps; s++) {
          for (const p of phys.dischargeParticles) {
            p.vy += curGPx * subDt;
            p.x += p.vx * subDt;
            p.y += p.vy * subDt;

            // Deflect off upper hood roof if high-RPM throw hits ceiling
            if (p.x >= curChuteThroatX && p.x <= 488) {
              const roofY =
                topY -
                8 +
                ((p.x - curChuteThroatX) / Math.max(1, 488 - curChuteThroatX)) *
                  72;
              if (p.y < roofY + p.r) {
                p.y = roofY + p.r;
                if (p.vy < 0) p.vy = -p.vy * 0.35;
              }
            }

            // Collide and slide along angled discharge chute floor
            if (p.x >= curChuteThroatX - 2 && p.x <= chuteOutX + 2) {
              const floorY =
                chuteFloorY0 + ((p.x - curChuteThroatX) / dxChute) * dyChute;
              if (p.y >= floorY - p.r && p.y <= floorY + 26) {
                p.y = floorY - p.r;
                const vn = p.vx * nx + p.vy * ny;
                let vt = p.vx * tx + p.vy * ty;
                if (vn < 0) {
                  vt = Math.max(35, vt * 0.86);
                }
                const aSlope = curGPx * (ty - 0.24 * tx);
                vt = Math.max(45, vt + aSlope * subDt);
                p.vx = vt * tx;
                p.vy = vt * ty;
                p.onChute = true;
                p.isSpill = false;
              }
            }

            // Back-spill: particles falling short of chute lip drop down return leg
            if (!p.onChute && p.x < curChuteThroatX - 2 && p.y > chuteFloorY0 - 4) {
              p.isSpill = true;
              const minReturnX = cx + 8;
              const maxReturnX = cx + curBeltR + 28;
              if (p.x < minReturnX) {
                p.x = minReturnX;
                p.vx = Math.abs(p.vx) * 0.3;
              } else if (p.x > maxReturnX) {
                p.x = maxReturnX;
                p.vx = -Math.abs(p.vx) * 0.3;
              }
            }
          }
        }

        phys.dischargeParticles = phys.dischargeParticles.filter(
          (p) =>
            p.y < 508 &&
            p.x < 620 &&
            !(p.isSpill && p.y >= bootSurfaceY)
        );

        // 5. Inlet chute stream & granular particles
        const curInletRightX = cx - curBeltR - 32;
        const flowFactor = Math.min(
          1,
          Math.max(
            0.15,
            (curInputs.bucketVolumeL / 18) *
              (curInputs.fillFactorPct / 95) *
              (350 / curInputs.bucketSpacingMm)
          )
        );
        const streamThick = 3.5 + flowFactor * 9.5;
        const inletSpawnRate = Math.max(
          3,
          Math.min(36, 3 + curMetrics.theoreticalCapacityM3h * 0.14)
        );
        phys.inletSpawnAcc += inletSpawnRate * dt;
        while (phys.inletSpawnAcc >= 1) {
          phys.inletSpawnAcc -= 1;
          if (phys.inletParticles.length < 45) {
            phys.inletParticles.push({
              id: phys.nextParticleId++,
              x: inletLeftX + 6,
              y: 361 - Math.random() * streamThick * 0.72,
              vx: 52 + Math.random() * 24,
              vy: 24,
              r: 2.0 + Math.random() * 0.9,
            });
          }
        }

        const inDx = Math.max(1, curInletRightX - inletLeftX);
        for (const ip of phys.inletParticles) {
          if (ip.x <= curInletRightX) {
            ip.vx = Math.min(130, ip.vx + 85 * dt);
            ip.x += ip.vx * dt;
            const floorY = 362 + ((ip.x - inletLeftX) / inDx) * 41;
            if (ip.y > floorY - ip.r) {
              ip.y = floorY - ip.r;
            } else {
              ip.vy += curGPx * 0.4 * dt;
              ip.y = Math.min(floorY - ip.r, ip.y + ip.vy * dt);
            }
          } else {
            ip.vy += curGPx * dt;
            ip.vx *= 1 - 0.8 * dt;
            ip.x += ip.vx * dt;
            ip.y += ip.vy * dt;
          }
        }
        phys.inletParticles = phys.inletParticles.filter(
          (ip) => ip.y < bootSurfaceY + 4 && ip.x < cx - 6
        );

        setRenderState({
          beltPhase: currPhase,
          pulleyRotDeg: (phys.pulleyAngleRad * 180) / Math.PI,
          tailRotDeg: (phys.tailAngleRad * 180) / Math.PI,
          bootSurfaceY,
          bootLevel: phys.bootLevel,
          simTime: phys.simTime,
          dischargeParticles: [...phys.dischargeParticles],
          inletParticles: [...phys.inletParticles],
        });
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [chuteFloorY0, chuteFloorY1]);

  const {
    beltPhase,
    pulleyRotDeg,
    tailRotDeg,
    bootSurfaceY,
    bootLevel,
    simTime,
    dischargeParticles: particles,
    inletParticles,
  } = renderState;

  const inletFlowFactor = Math.min(
    1,
    Math.max(
      0.15,
      (inputs.bucketVolumeL / 18) *
        (inputs.fillFactorPct / 95) *
        (350 / inputs.bucketSpacingMm)
    )
  );
  const inletStreamThickness = 3.5 + inletFlowFactor * 9.5;

  const bgFill = isDark ? '#080f1d' : '#f8fafc';
  const bgStroke = isDark ? '#1e293b' : '#cbd5e1';
  const gridStroke = isDark ? '#38bdf8' : '#94a3b8';
  const gridOpacity = isDark ? 0.1 : 0.22;
  const hudBg = isDark ? '#0f172a' : '#ffffff';
  const hudTextPrimary = isDark ? '#f8fafc' : '#0f172a';
  const hudTextMuted = isDark ? '#94a3b8' : '#475569';
  const hudLabelCyan = isDark ? '#38bdf8' : '#0284c7';
  const hudValueCyan = isDark ? '#22d3ee' : '#0891b2';
  const hudValueEmerald = isDark ? '#34d399' : '#059669';
  const hudValueRose = isDark ? '#fb7185' : '#e11d48';
  const dimPillBg = isDark ? '#0f172a' : '#ffffff';
  const dimPillStroke = isDark ? '#334155' : '#cbd5e1';
  const dimPillText = isDark ? '#7dd3fc' : '#0369a1';
  const casingStroke = isDark ? '#475569' : '#64748b';
  const fcColor = isDark ? '#22d3ee' : '#0284c7';
  const mgColor = isDark ? '#f59e0b' : '#d97706';

  const regimeColor =
    metrics.dischargeRegime === 'centrifugal'
      ? isDark
        ? '#10b981'
        : '#059669'
      : metrics.dischargeRegime === 'transitional'
        ? isDark
          ? '#f59e0b'
          : '#d97706'
        : isDark
          ? '#ef4444'
          : '#dc2626';

  const regimeLabel =
    metrics.dischargeRegime === 'centrifugal'
      ? inputs.elevatorType === 'continuous'
        ? pick('CONTINUOUS GRAVITY', 'GRAVITASI KONTINU', '連続重力排出')
        : pick('CENTRIFUGAL DISCHARGE', 'BUANG SENTRIFUGAL', '遠心排出（正常）')
      : metrics.dischargeRegime === 'transitional'
        ? pick('TRANSITIONAL / PARTIAL SPILL', 'TRANSISI / TUMPAH SEBAGIAN', '遷移域・一部逆流')
        : pick('GRAVITY BACK-SPILL', 'JATUH PREMATUR (BACK-SPILL)', '重力落下・逆流');

  const getChuteFloorY = (x: number) => {
    const u = Math.max(
      0,
      Math.min(1, (x - chuteThroatX) / Math.max(1, chuteOutX - chuteThroatX))
    );
    return chuteFloorY0 + u * (chuteFloorY1 - chuteFloorY0);
  };

  // Parabolic + chute-slide guide path matching real dt physics
  const startX = cx + lipR * Math.sin(releaseRad);
  const startY = topY - lipR * Math.cos(releaseRad);
  const throwSpeedPx = metrics.angularVelocityRadS * metrics.effectiveRadiusM * pxPerMeter;
  const throwVx = throwSpeedPx * Math.cos(releaseRad);
  const throwVy = throwSpeedPx * Math.sin(releaseRad);

  const guidePoints = (() => {
    const pts: string[] = [];
    let gx = startX;
    let gy = startY;
    let gvx = throwVx;
    let gvy = throwVy;
    const stepDt = 0.025;
    const dxC = chuteOutX - chuteThroatX;
    const dyC = chuteFloorY1 - chuteFloorY0;
    const lenC = Math.hypot(dxC, dyC);
    const txC = dxC / lenC;
    const tyC = dyC / lenC;

    for (let k = 0; k < 36; k++) {
      pts.push(`${k === 0 ? 'M' : 'L'} ${gx.toFixed(1)} ${gy.toFixed(1)}`);
      gvy += gPx * stepDt;
      gx += gvx * stepDt;
      gy += gvy * stepDt;
      if (gx >= chuteThroatX && gx <= chuteOutX) {
        const fy = getChuteFloorY(gx) - 3;
        if (gy >= fy) {
          gy = fy;
          const vt = Math.max(55, gvx * txC + gvy * tyC);
          gvx = vt * txC;
          gvy = vt * tyC;
        }
      }
      if (gy > botY - 12 || gx > 560) break;
    }
    return pts.join(' ');
  })();

  // Pole distance indicator (clamped to SVG bounds)
  const polePx = Math.min(
    112,
    Math.max(16, (metrics.poleDistanceM / Math.max(0.25, metrics.effectiveRadiusM)) * headR)
  );

  // Force vector lengths at ~35 deg release angle
  const vecAngleRad = (35 * Math.PI) / 180;
  const vx = cx + headR * Math.sin(vecAngleRad);
  const vy = topY - headR * Math.cos(vecAngleRad);
  const mgLen = 28;
  const fcLen = Math.min(48, Math.max(12, mgLen * metrics.froudeNumber));
  const fcEndX = vx + fcLen * Math.sin(vecAngleRad);
  const fcEndY = vy - fcLen * Math.cos(vecAngleRad);

  // Take-up screw extension based on tension
  const tensionFrac = Math.min(1, Math.max(0, (inputs.takeUpTensionKn - 2) / 23));
  const takeUpDropPx = 6 + tensionFrac * 18;
  const beltWobbleX = isMisaligned ? Math.sin(simTime * 10) * 3.5 : 0;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 640 520"
      className="h-auto w-full select-none touch-none"
      role="img"
      aria-label={pick(
        'Bucket elevator cutaway diagram',
        'Diagram potongan bucket elevator',
        'バケットエレベータ断面図'
      )}
    >
      <defs>
        <linearGradient id="be-casing" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
          <stop offset="22%" stopColor={isDark ? '#0f172a' : '#e2e8f0'} />
          <stop offset="78%" stopColor={isDark ? '#0f172a' : '#e2e8f0'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
        </linearGradient>
        <linearGradient id="be-steel-trim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#475569' : '#94a3b8'} />
          <stop offset="50%" stopColor={isDark ? '#334155' : '#cbd5e1'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#94a3b8'} />
        </linearGradient>
        <linearGradient id="be-pulley" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
          <stop offset="55%" stopColor={isDark ? '#475569' : '#94a3b8'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
        </linearGradient>
        <linearGradient id="be-chute" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#e2e8f0'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
        </linearGradient>
        <marker
          id="be-arrow-fc"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={fcColor} />
        </marker>
        <marker
          id="be-arrow-mg"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={mgColor} />
        </marker>
      </defs>

      {/* Background */}
      <rect
        x="0"
        y="0"
        width="640"
        height="520"
        rx="14"
        fill={bgFill}
        stroke={bgStroke}
        strokeWidth="1.5"
      />
      <g opacity={gridOpacity} stroke={gridStroke} strokeWidth="0.7">
        {[80, 160, 240, 320, 400, 480].map((y) => (
          <line key={`gy-${y}`} x1="16" y1={y} x2="624" y2={y} />
        ))}
        {[100, 200, 300, 400, 500].map((x) => (
          <line key={`gx-${x}`} x1={x} y1="16" x2={x} y2="504" />
        ))}
      </g>

      {/* Lift Height Dimension Line (left side) */}
      <g stroke="#64748b" strokeWidth="1.2">
        <line x1="38" y1={topY} x2="38" y2={botY} strokeDasharray="4 3" />
        <line x1="30" y1={topY} x2="46" y2={topY} />
        <line x1="30" y1={botY} x2="46" y2={botY} />
      </g>
      <rect
        x="12"
        y="246"
        width="54"
        height="24"
        rx="5"
        fill={dimPillBg}
        stroke={dimPillStroke}
      />
      <text
        x="39"
        y="262"
        textAnchor="middle"
        fill={dimPillText}
        fontSize="11"
        fontWeight="700"
      >
        H={inputs.liftHeightM}m
      </text>

      {/* Vertical Twin-Leg Casing (drawn first so head hood & open chute throat join seamlessly) */}
      <rect
        x={cx - beltR - 32}
        y={topY + 8}
        width={(beltR + 32) * 2}
        height={botY - topY}
        fill="url(#be-casing)"
      />

      {/* Head Hood & Open Discharge Chute */}
      <path
        d={`M ${cx - beltR - 34} ${topY + 12}
            A ${beltR + 34} ${beltR + 34} 0 0 1 ${cx + beltR + 34} ${topY - 10}
            L 492 ${topY + 68}
            L ${chuteOutX} ${chuteFloorY1}
            L ${chuteThroatX} ${chuteFloorY0}
            L ${cx + beltR + 32} ${chuteFloorY0}
            L ${cx - beltR - 32} ${topY + 12} Z`}
        fill="url(#be-chute)"
        stroke={casingStroke}
        strokeWidth="2"
      />
      {/* Chute Throat Deflector Plate (guides centrifugal stream cleanly into chute) */}
      <line
        x1={chuteThroatX - 8}
        y1={chuteFloorY0 - 4}
        x2={chuteThroatX + 18}
        y2={chuteFloorY0 + 10}
        stroke={isDark ? '#cbd5e1' : '#475569'}
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      <path
        d={`M ${cx - beltR - 32} ${botY + 8}
            L ${cx - beltR - 32} ${topY + 8}
            M ${cx + beltR + 32} ${chuteFloorY0}
            L ${cx + beltR + 32} ${botY + 8}`}
        fill="none"
        stroke={casingStroke}
        strokeWidth="2"
      />
      {/* Bolted Casing Flange Seams */}
      {[195, 270, 345].map((fy) => (
        <g key={`flange-${fy}`}>
          <rect
            x={cx - beltR - 37}
            y={fy}
            width={(beltR + 37) * 2}
            height="6"
            rx="1.5"
            fill="url(#be-steel-trim)"
            stroke="#64748b"
            strokeWidth="0.9"
          />
          <circle cx={cx - beltR - 33} cy={fy + 3} r="1.4" fill="#94a3b8" />
          <circle cx={cx + beltR + 33} cy={fy + 3} r="1.4" fill="#94a3b8" />
        </g>
      ))}

      {/* Inspection Doors (Upper & Lower) */}
      {[
        { y: 214, label: 'INSP' },
        { y: 292, label: 'DOOR' },
      ].map((door) => (
        <g key={`door-${door.y}`} opacity="0.72">
          <rect
            x={cx - beltR - 30}
            y={door.y}
            width="10"
            height="38"
            rx="1.5"
            fill={isDark ? '#334155' : '#94a3b8'}
            stroke={isDark ? '#64748b' : '#475569'}
            strokeWidth="1"
          />
          <rect
            x={cx - beltR - 27}
            y={door.y + 15}
            width="4"
            height="8"
            rx="1"
            fill={isDark ? '#94a3b8' : '#334155'}
          />
        </g>
      ))}

      {/* Center Partition Baffle */}
      <rect
        x={cx - 6}
        y={topY + headR + 14}
        width="12"
        height={botY - topY - headR - tailR - 22}
        rx="3"
        fill={isDark ? '#1e293b' : '#cbd5e1'}
        stroke={isDark ? '#334155' : '#94a3b8'}
        strokeWidth="1.2"
      />

      {/* Boot Section Housing */}
      <path
        d={`M ${cx - beltR - 36} ${botY - 12}
            L ${cx + beltR + 36} ${botY - 12}
            L ${cx + beltR + 36} ${botY + tailR + 28}
            A ${beltR + 36} 24 0 0 1 ${cx - beltR - 36} ${botY + tailR + 28} Z`}
        fill={isDark ? '#0f172a' : '#e2e8f0'}
        stroke={casingStroke}
        strokeWidth="2"
      />

      {/* Backstop Brake Housing (Left of Head Shaft) */}
      <g transform={`translate(${cx - beltR - 42}, ${topY + 4})`}>
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="6"
          fill={isDark ? '#1e293b' : '#e2e8f0'}
          stroke={isDark ? '#64748b' : '#475569'}
          strokeWidth="1.6"
        />
        <circle
          r="9"
          fill={isDark ? '#0f172a' : '#ffffff'}
          stroke={hudLabelCyan}
          strokeWidth="1.4"
        />
        <path d="M -4 -2 L 4 -2 L 0 5 Z" fill={hudLabelCyan} />
      </g>

      {/* Inlet Chute (Left Bottom, joined cleanly to boot wall) */}
      <polygon
        points={`${inletLeftX},342 ${inletRightX},382 ${inletRightX},424 ${inletLeftX},382`}
        fill={isDark ? '#1e293b' : '#cbd5e1'}
        stroke={casingStroke}
        strokeWidth="2"
      />
      <text
        x="108"
        y="344"
        textAnchor="middle"
        fill={hudTextMuted}
        fontSize="10"
        fontWeight="600"
      >
        {pick('INLET', 'MASUK', '供給口')}
      </text>

      {/* Inlet Material Stream (thickness scales with mass flow) */}
      <polygon
        points={`${inletLeftX + 2},${364 - inletStreamThickness} ${inletRightX},${405 - inletStreamThickness * 0.85} ${inletRightX},405 ${inletLeftX + 2},364`}
        fill={materialColor}
        opacity="0.45"
      />

      {/* Inlet Material Granules */}
      {inletParticles.map((p) => (
        <circle
          key={`in-${p.id}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={materialColor}
          opacity="0.92"
        />
      ))}

      {/* Boot Material Pool (dynamic height from dt physics) */}
      <path
        d={`M ${cx - beltR - 30} ${bootSurfaceY}
            Q ${cx - 10} ${bootSurfaceY - (isChoke ? 12 : 8)} ${cx + beltR + 30} ${bootSurfaceY + 6}
            L ${cx + beltR + 30} ${botY + tailR + 24}
            L ${cx - beltR - 30} ${botY + tailR + 24} Z`}
        fill={materialColor}
        opacity={0.46 + bootLevel * 0.42}
      />
      {/* Granular texture in boot puddle */}
      {Array.from({ length: 12 }, (_, gi) => {
        const gx = cx - beltR - 22 + gi * ((beltR * 2 + 44) / 11);
        const gy = bootSurfaceY + 6 + ((gi * 7) % 14);
        return (
          <circle
            key={`boot-g-${gi}`}
            cx={gx}
            cy={gy}
            r={2 + (gi % 2) * 0.8}
            fill={materialColor}
            opacity="0.85"
          />
        );
      })}

      {/* Belt / Chain Loop */}
      <path
        d={`M ${cx - beltR + beltWobbleX} ${botY}
            L ${cx - beltR + beltWobbleX} ${topY}
            A ${beltR} ${beltR} 0 0 1 ${cx + beltR + beltWobbleX} ${topY}
            L ${cx + beltR + beltWobbleX} ${botY}
            A ${beltR} ${beltR} 0 0 1 ${cx - beltR + beltWobbleX} ${botY}`}
        fill="none"
        stroke={isChain ? (isDark ? '#94a3b8' : '#64748b') : hudLabelCyan}
        strokeWidth={isChain ? 3.5 : 4}
        strokeDasharray={isChain ? '7 4' : undefined}
        opacity="0.9"
      />

      {/* Head Pulley */}
      <g transform={`translate(${cx}, ${topY})`}>
        <circle
          r={headR}
          fill="url(#be-pulley)"
          stroke={
            isSlip
              ? '#f59e0b'
              : isMisaligned
                ? '#fb7185'
                : isDark
                  ? '#94a3b8'
                  : '#475569'
          }
          strokeWidth="2.5"
        />
        <g transform={`rotate(${pulleyRotDeg})`}>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={`hs-${deg}`}
              x1="0"
              y1="0"
              x2={headR - 6}
              y2="0"
              transform={`rotate(${deg})`}
              stroke={isDark ? '#1e293b' : '#475569'}
              strokeWidth="3"
            />
          ))}
        </g>
        <circle
          r="10"
          fill={isDark ? '#0f172a' : '#e2e8f0'}
          stroke={isDark ? '#cbd5e1' : '#334155'}
          strokeWidth="2"
        />
      </g>

      {/* Pole Distance Vector (h_p) & Live Force Diagram (F_c vs mg) */}
      <g>
        <line
          x1={cx}
          y1={topY}
          x2={cx}
          y2={topY - polePx}
          stroke={regimeColor}
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <circle
          cx={cx}
          cy={topY - polePx}
          r="4"
          fill={regimeColor}
          stroke={isDark ? '#0f172a' : '#ffffff'}
          strokeWidth="1"
        />
        <text
          x={cx - 8}
          y={topY - Math.min(polePx, headR + 18)}
          textAnchor="end"
          fill={regimeColor}
          fontSize="10"
          fontWeight="700"
        >
          P (h_p={metrics.poleDistanceMm.toFixed(0)}mm)
        </text>

        {/* Centrifugal Force F_c vector */}
        <line
          x1={vx}
          y1={vy}
          x2={fcEndX}
          y2={fcEndY}
          stroke={fcColor}
          strokeWidth="2.2"
          markerEnd="url(#be-arrow-fc)"
        />
        <text
          x={fcEndX + 5}
          y={fcEndY - 3}
          fill={fcColor}
          fontSize="9.5"
          fontWeight="800"
        >
          F_c
        </text>

        {/* Gravity mg vector */}
        <line
          x1={vx}
          y1={vy}
          x2={vx}
          y2={vy + mgLen}
          stroke={mgColor}
          strokeWidth="2.2"
          markerEnd="url(#be-arrow-mg)"
        />
        <text
          x={vx + 6}
          y={vy + mgLen - 2}
          fill={mgColor}
          fontSize="9.5"
          fontWeight="800"
        >
          mg
        </text>
      </g>

      {/* Parabolic Discharge Trajectory Guide */}
      <path
        d={guidePoints}
        fill="none"
        stroke={regimeColor}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.65"
      />

      {/* Tail / Boot Pulley */}
      <g transform={`translate(${cx}, ${botY})`}>
        <circle
          r={tailR}
          fill="url(#be-pulley)"
          stroke={casingStroke}
          strokeWidth="2"
        />
        <g transform={`rotate(${tailRotDeg})`}>
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={`ts-${deg}`}
              x1="0"
              y1="0"
              x2={tailR - 6}
              y2="0"
              transform={`rotate(${deg})`}
              stroke={isDark ? '#1e293b' : '#475569'}
              strokeWidth="3"
            />
          ))}
        </g>
        <circle
          r="8"
          fill={isDark ? '#0f172a' : '#e2e8f0'}
          stroke={isDark ? '#94a3b8' : '#475569'}
          strokeWidth="2"
        />
      </g>

      {/* Screw Take-Up Assembly (Right of Boot) */}
      <g transform={`translate(${cx + beltR + 36}, ${botY})`}>
        <rect
          x="0"
          y="-10"
          width="28"
          height="20"
          rx="3"
          fill={isDark ? '#334155' : '#cbd5e1'}
          stroke={isDark ? '#64748b' : '#475569'}
        />
        <line
          x1="14"
          y1="10"
          x2="14"
          y2={18 + takeUpDropPx}
          stroke={isDark ? '#94a3b8' : '#64748b'}
          strokeWidth="3"
        />
        <rect
          x="5"
          y={18 + takeUpDropPx}
          width="18"
          height="7"
          rx="2"
          fill={
            inputs.takeUpTensionKn < metrics.minRequiredTensionKn
              ? '#f59e0b'
              : '#10b981'
          }
        />
        <text x="34" y="4" fill={hudTextMuted} fontSize="9.5" fontWeight="600">
          {inputs.takeUpTensionKn.toFixed(1)} kN
        </text>
      </g>

      {/* Moving Buckets */}
      {Array.from({ length: bucketCount }, (_, idx) => {
        const t = beltPhase + idx / bucketCount;
        const pt = getLoopPoint(t, cx, topY, botY, beltR);
        const isDamagedSlot = isMissing && idx === 2;

        const targetFill = Math.min(
          1,
          (inputs.fillFactorPct / 100) * (isChoke ? 1.12 : 1)
        );
        const fillFrac =
          pt.section === 'ascend'
            ? targetFill
            : pt.section === 'bottom'
              ? pt.arcT > 0.35
                ? ((pt.arcT - 0.35) / 0.65) * targetFill
                : 0
              : pt.section === 'top'
                ? pt.arcT < arcTRelease
                  ? targetFill
                  : Math.max(0, (1 - (pt.arcT - arcTRelease) / 0.14) * targetFill)
                : 0;

        const bHalfH = 8.5 * bucketVolScale;
        const bProj = bucketProjPx * (0.85 + 0.15 * bucketVolScale);

        if (isDamagedSlot) {
          return (
            <g
              key={`bkt-${idx}`}
              transform={`translate(${pt.x + beltWobbleX}, ${pt.y}) rotate(${pt.angleDeg})`}
            >
              <rect
                x={-bProj}
                y={-bHalfH}
                width={bProj}
                height={bHalfH * 2}
                rx="2"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text
                x={-bProj / 2}
                y="4"
                textAnchor="middle"
                fill="#ef4444"
                fontSize="11"
                fontWeight="800"
              >
                !
              </text>
            </g>
          );
        }

        const fillBottomY = bHalfH - 1.2;
        const fillSpan = bHalfH * 1.65;
        const fillTopY = fillBottomY - fillFrac * fillSpan;
        const moundPeakY = fillTopY - fillFrac * 2.6;
        const lipFillY = Math.min(fillBottomY, fillTopY + 1.8);

        return (
          <g
            key={`bkt-${idx}`}
            transform={`translate(${pt.x + beltWobbleX}, ${pt.y}) rotate(${pt.angleDeg})`}
          >
            <path
              d={`M 0 ${(-bHalfH).toFixed(1)} L -${bProj.toFixed(1)} ${(-bHalfH * 0.68).toFixed(1)} L -${(bProj - 3).toFixed(1)} ${(bHalfH * 0.9).toFixed(1)} L 0 ${bHalfH.toFixed(1)} Z`}
              fill={isDark ? '#334155' : '#64748b'}
              stroke={isDark ? '#94a3b8' : '#334155'}
              strokeWidth="1.3"
            />
            {fillFrac > 0.05 && (
              <>
                <path
                  d={`M -1 ${fillTopY.toFixed(1)}
                      Q ${(-bProj * 0.48).toFixed(1)} ${moundPeakY.toFixed(1)} -${(bProj - 2.5).toFixed(1)} ${lipFillY.toFixed(1)}
                      L -${(bProj - 3.5).toFixed(1)} ${fillBottomY.toFixed(1)}
                      L -1 ${(fillBottomY + 0.5).toFixed(1)} Z`}
                  fill={materialColor}
                  opacity="0.92"
                />
                {fillFrac > 0.22 && (
                  <g fill={isDark ? '#0f172a' : '#334155'} opacity="0.28">
                    <circle cx={-bProj * 0.3} cy={fillTopY + 3.0} r="1.1" />
                    <circle cx={-bProj * 0.62} cy={fillTopY + 4.0} r="1.2" />
                    {fillFrac > 0.5 && (
                      <circle cx={-bProj * 0.45} cy={moundPeakY + 3.2} r="1.0" />
                    )}
                  </g>
                )}
              </>
            )}
          </g>
        );
      })}

      {/* Live Discharge & Back-Spill Particle Trajectory */}
      {particles.map((p) => (
        <circle
          key={`pt-${p.id}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={p.isSpill ? '#ef4444' : materialColor}
          opacity="0.92"
        />
      ))}

      {/* Discharge Chute Label */}
      <text
        x="458"
        y={topY + 150}
        textAnchor="middle"
        fill={isDark ? '#cbd5e1' : '#334155'}
        fontSize="10.5"
        fontWeight="700"
      >
        {pick('DISCHARGE CHUTE', 'CORONG BUANG', '排出口シュート')}
      </text>

      {/* Clickable Inspection Hotspots */}
      {hotspots.map((h) => {
        const isSelected = activeHotspot === h.id;
        return (
          <g
            key={h.id}
            transform={`translate(${h.x}, ${h.y})`}
            onClick={() => setActiveHotspot(h.id)}
            className="cursor-pointer"
          >
            <circle
              r={isSelected ? 14 : 11}
              fill={isSelected ? '#0ea5e9' : hudLabelCyan}
              fillOpacity={isSelected ? 0.28 : 0.14}
              stroke={isSelected ? hudLabelCyan : isDark ? '#7dd3fc' : '#0284c7'}
              strokeWidth={isSelected ? 2 : 1.2}
              strokeDasharray={isSelected ? undefined : '3 2'}
            />
            <circle
              r="3.5"
              fill={isSelected ? hudLabelCyan : isDark ? '#e0f2fe' : '#0369a1'}
            />
          </g>
        );
      })}

      {/* Draggable Tachometer / Belt-Alignment Probe */}
      <g
        transform={`translate(${probePos.x}, ${probePos.y})`}
        onPointerDown={handleProbePointerDown}
        onPointerMove={handleProbePointerMove}
        onPointerUp={handleProbePointerUp}
        className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      >
        <line
          x1="-14"
          y1="-14"
          x2="0"
          y2="0"
          stroke={hudLabelCyan}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="-14" cy="-14" r="3" fill={fcColor} />
        <rect
          x="0"
          y="-10"
          width="46"
          height="24"
          rx="6"
          fill={hudBg}
          stroke={hudLabelCyan}
          strokeWidth="1.8"
        />
        <rect
          x="4"
          y="-6"
          width="38"
          height="12"
          rx="2.5"
          fill={isDark ? '#082f49' : '#e0f2fe'}
        />
        <text
          x="23"
          y="3"
          textAnchor="middle"
          fill={hudLabelCyan}
          fontSize="8.5"
          fontWeight="800"
        >
          PROBE
        </text>
      </g>

      {/* Top-Right Telemetry & Discharge Regime Card */}
      <g transform="translate(396, 16)">
        <rect
          width="228"
          height="92"
          rx="10"
          fill={hudBg}
          fillOpacity="0.94"
          stroke={regimeColor}
          strokeWidth="1.5"
        />
        <text x="12" y="21" fill={regimeColor} fontSize="10.5" fontWeight="800">
          {regimeLabel}
        </text>
        <text x="12" y="42" fill={hudTextMuted} fontSize="10.5">
          {pick('Froude No.', 'Bil. Froude', 'フルード数')}:
        </text>
        <text
          x="214"
          y="42"
          textAnchor="end"
          fill={hudTextPrimary}
          fontSize="12"
          fontWeight="700"
        >
          Fr = {metrics.froudeNumber.toFixed(2)}
        </text>
        <text x="12" y="61" fill={hudTextMuted} fontSize="10.5">
          {pick('Linear Speed', 'Kecepatan Linier', 'ベルト速度')}:
        </text>
        <text
          x="214"
          y="61"
          textAnchor="end"
          fill={hudLabelCyan}
          fontSize="12"
          fontWeight="700"
        >
          {metrics.beltSpeedMs.toFixed(2)} m/s
        </text>
        <text x="12" y="80" fill={hudTextMuted} fontSize="10.5">
          {pick('Mass Flow', 'Kapasitas Massa', '質量輸送量')}:
        </text>
        <text
          x="214"
          y="80"
          textAnchor="end"
          fill={hudValueEmerald}
          fontSize="12"
          fontWeight="700"
        >
          {metrics.massCapacityTph.toFixed(1)} t/h
        </text>
      </g>

      {/* Bottom-Right Live Probe Local Telemetry Card */}
      <g transform="translate(396, 336)">
        <rect
          width="228"
          height="92"
          rx="10"
          fill={hudBg}
          fillOpacity="0.94"
          stroke={hudLabelCyan}
          strokeWidth="1.4"
        />
        <text x="12" y="20" fill={hudLabelCyan} fontSize="10" fontWeight="800">
          {pick('PROBE:', 'PROBE:', 'プローブ:')}{' '}
          {pick(
            currentHotspot.labelEn,
            currentHotspot.labelId,
            currentHotspot.labelJa
          ).toUpperCase()}
        </text>

        {activeHotspot === 'head-pulley' && (
          <>
            <text x="12" y="40" fill={hudTextMuted} fontSize="10">
              {pick('Shaft Speed', 'Putaran Poros', '軸回転数')}:
            </text>
            <text
              x="214"
              y="40"
              textAnchor="end"
              fill={hudTextPrimary}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.effectiveRpm.toFixed(1)} RPM
            </text>
            <text x="12" y="58" fill={hudTextMuted} fontSize="10">
              {pick('Pole Dist. h_p', 'Jarak Kutub h_p', '極距離 h_p')}:
            </text>
            <text
              x="214"
              y="58"
              textAnchor="end"
              fill={hudValueCyan}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.poleDistanceMm.toFixed(0)} mm
            </text>
            <text x="12" y="76" fill={hudTextMuted} fontSize="10">
              {pick('Bearing Temp', 'Suhu Bantalan', '軸受温度')}:
            </text>
            <text
              x="214"
              y="76"
              textAnchor="end"
              fill={metrics.headBearingTempC > 75 ? hudValueRose : hudValueEmerald}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.headBearingTempC.toFixed(1)} °C
            </text>
          </>
        )}

        {activeHotspot === 'boot-takeup' && (
          <>
            <text x="12" y="40" fill={hudTextMuted} fontSize="10">
              {pick('Take-Up Tension', 'Tegangan Take-Up', '張り張力')}:
            </text>
            <text
              x="214"
              y="40"
              textAnchor="end"
              fill={hudTextPrimary}
              fontSize="11"
              fontWeight="700"
            >
              {inputs.takeUpTensionKn.toFixed(1)} kN
            </text>
            <text x="12" y="58" fill={hudTextMuted} fontSize="10">
              {pick('Belt Tracking', 'Offset Sabuk', '蛇行オフセット')}:
            </text>
            <text
              x="214"
              y="58"
              textAnchor="end"
              fill={metrics.beltTrackingOffsetMm > 8 ? hudValueRose : hudValueEmerald}
              fontSize="11"
              fontWeight="700"
            >
              ±{metrics.beltTrackingOffsetMm.toFixed(1)} mm
            </text>
            <text x="12" y="76" fill={hudTextMuted} fontSize="10">
              {pick('Boot Bearing', 'Bantalan Boot', 'ブーツ軸受')}:
            </text>
            <text
              x="214"
              y="76"
              textAnchor="end"
              fill={metrics.bootBearingTempC > 70 ? hudValueRose : hudValueEmerald}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.bootBearingTempC.toFixed(1)} °C
            </text>
          </>
        )}

        {activeHotspot === 'backstop-brake' && (
          <>
            <text x="12" y="40" fill={hudTextMuted} fontSize="10">
              {pick('Req. Holdback', 'Torsi Tahan', '必要逆転トルク')}:
            </text>
            <text
              x="214"
              y="40"
              textAnchor="end"
              fill={hudTextPrimary}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.requiredBackstopTorqueNm.toFixed(0)} N·m
            </text>
            <text x="12" y="58" fill={hudTextMuted} fontSize="10">
              {pick('Head Torque', 'Torsi Poros', '駆動軸トルク')}:
            </text>
            <text
              x="214"
              y="58"
              textAnchor="end"
              fill={hudLabelCyan}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.headShaftTorqueNm.toFixed(0)} N·m
            </text>
            <text x="12" y="76" fill={hudTextMuted} fontSize="10">
              {pick('Brake Temp', 'Suhu Rem', 'ブレーキ温度')}:
            </text>
            <text
              x="214"
              y="76"
              textAnchor="end"
              fill={hudValueEmerald}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.backstopTempC.toFixed(1)} °C
            </text>
          </>
        )}

        {activeHotspot === 'discharge-throat' && (
          <>
            <text x="12" y="40" fill={hudTextMuted} fontSize="10">
              {pick('Throw Velocity', 'Kec. Lemparan', '排出初速度')}:
            </text>
            <text
              x="214"
              y="40"
              textAnchor="end"
              fill={hudTextPrimary}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.chuteThrowVelocityMs.toFixed(2)} m/s
            </text>
            <text x="12" y="58" fill={hudTextMuted} fontSize="10">
              {pick('Back-Spill Loss', 'Tumpah Balik', '逆流損失')}:
            </text>
            <text
              x="214"
              y="58"
              textAnchor="end"
              fill={metrics.backspillPct > 0 ? hudValueRose : hudValueEmerald}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.backspillPct}%
            </text>
            <text x="12" y="76" fill={hudTextMuted} fontSize="10">
              {pick('Vol. Flow', 'Kapasitas Vol.', '体積輸送量')}:
            </text>
            <text
              x="214"
              y="76"
              textAnchor="end"
              fill={hudValueCyan}
              fontSize="11"
              fontWeight="700"
            >
              {metrics.actualCapacityM3h.toFixed(1)} m³/h
            </text>
          </>
        )}
      </g>

      {/* Active Fault Banner */}
      {inputs.fault !== 'normal' && (
        <g transform="translate(396, 438)">
          <rect
            width="228"
            height="68"
            rx="10"
            fill={isDark ? '#450a0a' : '#fef2f2'}
            fillOpacity="0.94"
            stroke={isDark ? '#ef4444' : '#dc2626'}
            strokeWidth="1.5"
          />
          <text
            x="12"
            y="21"
            fill={isDark ? '#fca5a5' : '#b91c1c'}
            fontSize="10.5"
            fontWeight="800"
          >
            {inputs.fault === 'belt-slip'
              ? pick('FAULT: BELT SLIP / LOW RPM', 'GANGGUAN: SLIP SABUK', '異常: ベルトスリップ')
              : inputs.fault === 'boot-choke'
                ? pick('FAULT: BOOT CHOKE OVERLOAD', 'GANGGUAN: BOOT TERSUMBAT', '異常: ブーツ詰まり過負荷')
                : inputs.fault === 'missing-bucket'
                  ? pick('FAULT: MISSING BUCKET', 'GANGGUAN: BUCKET HILANG', '異常: バケット欠損')
                  : pick('FAULT: BELT MISALIGNMENT', 'GANGGUAN: SABUK MIRING', '異常: ベルト蛇行')}
          </text>
          <text
            x="12"
            y="40"
            fill={isDark ? '#fecaca' : '#dc2626'}
            fontSize="10"
          >
            {inputs.fault === 'belt-slip'
              ? pick('RPM -38% -> premature back-spill', 'RPM -38% -> tumpah balik', '回転数低下 -> 逆流発生')
              : inputs.fault === 'boot-choke'
                ? pick('Motor current & drag surge', 'Lonjakan arus & beban boot', '電流・掬い抵抗急上昇')
                : inputs.fault === 'missing-bucket'
                  ? pick('Capacity -16% + shaft imbalance', 'Kapasitas -16% + getaran poros', '輸送量低下・軸振動')
                  : pick('Tracking ±18.5 mm + bearing heat', 'Pergeseran ±18.5 mm + panas', '蛇行 ±18.5 mm・軸受過熱')}
          </text>
          <text
            x="12"
            y="57"
            fill={isDark ? '#fde047' : '#b45309'}
            fontSize="10"
            fontWeight="700"
          >
            {pick('Motor', 'Motor', 'モータ')}: {metrics.motorPowerKw.toFixed(2)} kW ({metrics.motorCurrentA.toFixed(1)} A)
          </text>
        </g>
      )}
    </svg>
  );
}
