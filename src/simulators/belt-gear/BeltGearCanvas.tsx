import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  BELT_SECTION_SPECS,
  type DriveMode,
  type SpurGearParams,
  type SpurGearResults,
  type VBeltParams,
  type VBeltResults,
} from './beltGearPhysics';

interface BeltGearCanvasProps {
  mode: DriveMode;
  isRunning: boolean;
  vBeltParams: VBeltParams;
  vBeltResults: VBeltResults;
  spurParams: SpurGearParams;
  spurResults: SpurGearResults;
}

function buildGearPath(
  teeth: number,
  pitchRadius: number,
  modulePx: number
): string {
  const addendum = Math.min(modulePx * 0.9, pitchRadius * 0.22);
  const dedendum = Math.min(modulePx * 1.15, pitchRadius * 0.26);
  const outerR = pitchRadius + addendum;
  const rootR = Math.max(6, pitchRadius - dedendum);
  const midFlankR = pitchRadius + addendum * 0.45;

  const step = (2 * Math.PI) / teeth;
  const pts: string[] = [];

  for (let i = 0; i < teeth; i++) {
    const base = i * step;
    // Smooth rounded involute-profile tooth centered at `base`
    const aRootL = base - step * 0.34;
    const aPitchL = base - step * 0.23;
    const aFlankL = base - step * 0.16;
    const aTipL = base - step * 0.1;
    const aTipC = base;
    const aTipR = base + step * 0.1;
    const aFlankR = base + step * 0.16;
    const aPitchR = base + step * 0.23;
    const aRootR = base + step * 0.34;

    const pt = (r: number, a: number) =>
      `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;

    if (i === 0) {
      pts.push(`M ${pt(rootR, aRootL)}`);
    } else {
      // Smooth root fillet arc from previous tooth's right root to this tooth's left root
      const prevRootMid = base - step * 0.5;
      pts.push(`Q ${pt(rootR * 0.985, prevRootMid)} ${pt(rootR, aRootL)}`);
    }

    // Left involute flank (root -> pitch -> outer tip)
    pts.push(
      `Q ${pt(rootR + dedendum * 0.35, base - step * 0.27)} ${pt(pitchRadius, aPitchL)}`,
      `Q ${pt(midFlankR, aFlankL)} ${pt(outerR, aTipL)}`,
      // Rounded tooth tip
      `Q ${pt(outerR * 1.012, aTipC)} ${pt(outerR, aTipR)}`,
      // Right involute flank (outer tip -> pitch -> root)
      `Q ${pt(midFlankR, aFlankR)} ${pt(pitchRadius, aPitchR)}`,
      `Q ${pt(rootR + dedendum * 0.35, base + step * 0.27)} ${pt(rootR, aRootR)}`
    );
  }
  const lastRootMid = (teeth - 0.5) * step;
  pts.push(
    `Q ${(rootR * 0.985 * Math.cos(lastRootMid)).toFixed(2)} ${(
      rootR *
      0.985 *
      Math.sin(lastRootMid)
    ).toFixed(2)} ${(rootR * Math.cos(-step * 0.34)).toFixed(2)} ${(
      rootR * Math.sin(-step * 0.34)
    ).toFixed(2)} Z`
  );
  return pts.join(' ');
}

export function BeltGearCanvas({
  mode,
  isRunning,
  vBeltParams,
  vBeltResults,
  spurParams,
  spurResults,
}: BeltGearCanvasProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Continuous accumulated angles & belt linear travel (zero modulo wraparound jumps)
  const [driverAngleDeg, setDriverAngleDeg] = useState(0);
  const [vBeltDrivenAngleDeg, setVBeltDrivenAngleDeg] = useState(0);
  const [beltTravelPx, setBeltTravelPx] = useState(0);

  const lastTimeRef = useRef<number | null>(null);

  const colors = useMemo(
    () => ({
      bg: 'var(--md-surface-container-lowest)',
      grid: 'var(--md-outline-variant)',
      panelBg: 'var(--md-surface-container)',
      panelBorder: 'var(--md-outline-variant)',
      textPrimary: 'var(--md-on-surface)',
      textMuted: 'var(--md-on-surface-variant)',
      pulleyFill: isDark ? '#1e293b' : '#e2e8f0',
      pulleyRim: isDark ? '#64748b' : '#475569',
      pulleySpoke: isDark ? '#475569' : '#94a3b8',
      beltStroke: isDark ? '#e2e8f0' : '#1e293b',
      beltDash: 'var(--md-primary)',
      gear1Fill: isDark ? '#1e293b' : '#e2e8f0',
      gear1Stroke: 'var(--md-primary)',
      gear2Fill: isDark ? '#1f1629' : '#ffe4e6',
      gear2Stroke: isDark ? '#fb7185' : '#e11d48',
      pitchCircle1: 'var(--md-primary)',
      pitchCircle2: isDark ? '#fb7185' : '#e11d48',
      statusOk: isDark ? '#34d399' : '#059669',
      statusWarn: isDark ? '#fbbf24' : '#d97706',
      statusDanger: isDark ? '#fb7185' : '#e11d48',
    }),
    [isDark]
  );

  const statusColor =
    (mode === 'v-belt' ? vBeltResults.status : spurResults.status) ===
    'Properly Tensioned'
      ? colors.statusOk
      : (mode === 'v-belt' ? vBeltResults.status : spurResults.status) ===
          'Loose'
        ? colors.statusWarn
        : colors.statusDanger;

  // --- V-BELT GEOMETRY ---
  const vBeltGeom = useMemo(() => {
    const cy = 205;
    const maxD = Math.max(vBeltParams.d1, vBeltParams.d2, 260);
    const rScale = Math.min(0.45, 105 / (maxD / 2));
    // Exact proportional pulley radii so r2/r1 === d2/d1
    const r1 = (vBeltParams.d1 / 2) * rScale;
    const r2 = (vBeltParams.d2 / 2) * rScale;

    const beltSectionWidthMm =
      BELT_SECTION_SPECS[vBeltParams.beltSection].widthMm;
    // Scale visual belt thickness & groove width from Z/3V (10mm) to C (22mm)
    const beltThicknessPx = 4 + (beltSectionWidthMm - 8) * 0.55;

    // Map centerDistance (250..1200) to visual span (230..365)
    const spanPx = Math.max(
      r1 + r2 + 56,
      Math.min(365, 195 + (vBeltParams.centerDistance / 1200) * 170)
    );
    const cx1 = 365 - spanPx / 2;
    const cx2 = 365 + spanPx / 2;

    const nx = Math.max(-0.92, Math.min(0.92, (r1 - r2) / spanPx));
    const ny = Math.sqrt(1 - nx * nx);

    const t1TopX = cx1 + r1 * nx;
    const t1TopY = cy - r1 * ny;
    const t2TopX = cx2 + r2 * nx;
    const t2TopY = cy - r2 * ny;

    const t1BotX = cx1 + r1 * nx;
    const t1BotY = cy + r1 * ny;
    const t2BotX = cx2 + r2 * nx;
    const t2BotY = cy + r2 * ny;

    const midTopX = (t1TopX + t2TopX) / 2;
    const midTopY = (t1TopY + t2TopY) / 2;

    // Exaggerate deflection visually (clamped to 38px) so technician sees C/64 clearly
    const visualDeflectionPx = Math.min(
      38,
      vBeltResults.actualDeflectionMm * 1.45
    );
    const ctrlY = midTopY + visualDeflectionPx * 2;

    return {
      cx1,
      cx2,
      cy,
      r1,
      r2,
      beltThicknessPx,
      t1TopX,
      t1TopY,
      t2TopX,
      t2TopY,
      t1BotX,
      t1BotY,
      t2BotX,
      t2BotY,
      midTopX,
      midTopY,
      visualDeflectionPx,
      ctrlY,
    };
  }, [
    vBeltParams.d1,
    vBeltParams.d2,
    vBeltParams.beltSection,
    vBeltParams.centerDistance,
    vBeltResults.actualDeflectionMm,
  ]);

  // --- SPUR GEAR GEOMETRY ---
  const spurGeom = useMemo(() => {
    const cy = 205;
    const d1 = spurResults.pitchDiameter1Mm;
    const d2 = spurResults.pitchDiameter2Mm;
    const totalD = d1 + d2;
    const pxPerMm = Math.min(3.2, 320 / Math.max(40, totalD));
    // Exact shared module: r1 = z1*m/2, r2 = z2*m/2
    const modulePx = spurParams.moduleMm * pxPerMm;
    const r1 = (spurParams.z1 * modulePx) / 2;
    const r2 = (spurParams.z2 * modulePx) / 2;

    // Visual center distance offset (0 when centerOffsetMm === 0, so C_px = r1 + r2)
    const offsetPx = spurParams.centerOffsetMm * 5;
    const totalSpan = r1 + r2 + offsetPx;
    const cx1 = 365 - (totalSpan * r2) / (r1 + r2);
    const cx2 = cx1 + totalSpan;
    const pitchPointX = cx1 + r1;

    const path1 = buildGearPath(spurParams.z1, r1, modulePx);
    const path2 = buildGearPath(spurParams.z2, r2, modulePx);

    // Phase alignment so tooth #0 of gear 1 meshes cleanly into a valley of gear 2 at pitch point
    const phase2Deg =
      180 + (spurParams.z2 % 2 === 0 ? 180 / spurParams.z2 : 0);

    return {
      cx1,
      cx2,
      cy,
      r1,
      r2,
      pitchPointX,
      path1,
      path2,
      phase2Deg,
    };
  }, [
    spurParams.z1,
    spurParams.z2,
    spurParams.moduleMm,
    spurParams.centerOffsetMm,
    spurResults.pitchDiameter1Mm,
    spurResults.pitchDiameter2Mm,
  ]);

  // Phase-locked continuous spur gear driven angle: θ₂ = -θ₁ * (z1/z2) + meshPhaseOffset
  const spurDrivenAngleDeg =
    spurGeom.phase2Deg - driverAngleDeg * (spurParams.z1 / spurParams.z2);

  // Smooth synchronous animation loop
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
        // Scale visual angular velocity so high RPMs remain readable at 60fps
        const baseRpm =
          mode === 'v-belt' ? vBeltParams.motorRpm : spurParams.motorRpm;
        const visualDegPerSec = Math.max(35, Math.min(240, baseRpm * 0.11));
        const dDriverDeg = visualDegPerSec * dt;
        const dDriverRad = (dDriverDeg * Math.PI) / 180;

        setDriverAngleDeg((prev) => prev + dDriverDeg);

        if (mode === 'v-belt') {
          const ratio = vBeltResults.speedRatio;
          const slipFactor = 1 - vBeltResults.slipPercent / 100;
          const dDrivenDeg = (dDriverDeg / ratio) * slipFactor;
          // Exact linear belt advance: Δs = ω₁ · r₁ · dt
          const deltaS = dDriverRad * vBeltGeom.r1;
          setVBeltDrivenAngleDeg((prev) => prev + dDrivenDeg);
          setBeltTravelPx((prev) => prev + deltaS);
        } else {
          // Advance line-of-action indicator smoothly
          setBeltTravelPx((prev) => prev + dDriverRad * spurGeom.r1);
        }
      }
      lastTimeRef.current = now;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    isRunning,
    mode,
    vBeltParams.motorRpm,
    vBeltResults.speedRatio,
    vBeltResults.slipPercent,
    vBeltGeom.r1,
    spurParams.motorRpm,
    spurGeom.r1,
  ]);

  return (
    <div className="glass-panel relative flex items-center justify-center overflow-hidden rounded-[28px] p-2">
      <svg
        viewBox="0 0 760 400"
        className="block h-auto w-full select-none"
        role="img"
        aria-label={
          mode === 'v-belt'
            ? 'V-Belt drive tension and deflection simulator'
            : 'Spur gear meshing and backlash simulator'
        }
      >
        <defs>
          <pattern
            id="bg-grid-belt-gear"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={colors.grid}
              strokeOpacity="0.35"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        <rect width="760" height="400" fill={colors.bg} rx="18" />
        <rect width="760" height="400" fill="url(#bg-grid-belt-gear)" rx="18" opacity="0.65" />

        {mode === 'v-belt' ? (
          <g>
            {/* Center-to-center dimension line */}
            <line
              x1={vBeltGeom.cx1}
              y1={372}
              x2={vBeltGeom.cx2}
              y2={372}
              stroke={colors.textMuted}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <line
              x1={vBeltGeom.cx1}
              y1={vBeltGeom.cy}
              x2={vBeltGeom.cx1}
              y2={378}
              stroke={colors.textMuted}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1={vBeltGeom.cx2}
              y1={vBeltGeom.cy}
              x2={vBeltGeom.cx2}
              y2={378}
              stroke={colors.textMuted}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <rect
              x={(vBeltGeom.cx1 + vBeltGeom.cx2) / 2 - 64}
              y={361}
              width="128"
              height="20"
              rx="10"
              fill={colors.panelBg}
              stroke={colors.panelBorder}
            />
            <text
              x={(vBeltGeom.cx1 + vBeltGeom.cx2) / 2}
              y={375}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={colors.textPrimary}
            >
              C = {vBeltParams.centerDistance} mm
            </text>

            {/* Straightedge reference line across top span */}
            <line
              x1={vBeltGeom.t1TopX}
              y1={vBeltGeom.t1TopY}
              x2={vBeltGeom.t2TopX}
              y2={vBeltGeom.t2TopY}
              stroke={colors.textMuted}
              strokeWidth="1.25"
              strokeDasharray="5 4"
            />

            {/* Belt path: top deflected span + bottom taut span (scaled by cross-section) */}
            <path
              d={`M ${vBeltGeom.t1TopX} ${vBeltGeom.t1TopY} Q ${vBeltGeom.midTopX} ${vBeltGeom.ctrlY} ${vBeltGeom.t2TopX} ${vBeltGeom.t2TopY}`}
              fill="none"
              stroke={colors.beltStroke}
              strokeWidth={vBeltGeom.beltThicknessPx}
              strokeLinecap="round"
            />
            <path
              d={`M ${vBeltGeom.t1TopX} ${vBeltGeom.t1TopY} Q ${vBeltGeom.midTopX} ${vBeltGeom.ctrlY} ${vBeltGeom.t2TopX} ${vBeltGeom.t2TopY}`}
              fill="none"
              stroke={colors.beltDash}
              strokeWidth={Math.max(2, vBeltGeom.beltThicknessPx * 0.34)}
              strokeDasharray="8 10"
              strokeDashoffset={-beltTravelPx}
            />

            <line
              x1={vBeltGeom.t1BotX}
              y1={vBeltGeom.t1BotY}
              x2={vBeltGeom.t2BotX}
              y2={vBeltGeom.t2BotY}
              stroke={colors.beltStroke}
              strokeWidth={vBeltGeom.beltThicknessPx}
              strokeLinecap="round"
            />
            <line
              x1={vBeltGeom.t1BotX}
              y1={vBeltGeom.t1BotY}
              x2={vBeltGeom.t2BotX}
              y2={vBeltGeom.t2BotY}
              stroke={colors.beltDash}
              strokeWidth={Math.max(2, vBeltGeom.beltThicknessPx * 0.34)}
              strokeDasharray="8 10"
              strokeDashoffset={beltTravelPx}
            />

            {/* Driver Pulley (Left) */}
            <g
              transform={`translate(${vBeltGeom.cx1}, ${vBeltGeom.cy}) rotate(${driverAngleDeg})`}
            >
              <circle
                r={vBeltGeom.r1}
                fill={colors.pulleyFill}
                stroke={colors.pulleyRim}
                strokeWidth="5"
              />
              <circle
                r={vBeltGeom.r1 - 8}
                fill="none"
                stroke={colors.pulleySpoke}
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              {[0, 120, 240].map((a) => (
                <line
                  key={a}
                  x1="0"
                  y1="0"
                  x2={Math.cos((a * Math.PI) / 180) * (vBeltGeom.r1 - 6)}
                  y2={Math.sin((a * Math.PI) / 180) * (vBeltGeom.r1 - 6)}
                  stroke={colors.pulleySpoke}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              ))}
              <circle r="10" fill={colors.panelBg} stroke={colors.gear1Stroke} strokeWidth="2.5" />
            </g>

            {/* Driven Pulley (Right) */}
            <g
              transform={`translate(${vBeltGeom.cx2}, ${vBeltGeom.cy}) rotate(${vBeltDrivenAngleDeg})`}
            >
              <circle
                r={vBeltGeom.r2}
                fill={colors.pulleyFill}
                stroke={colors.pulleyRim}
                strokeWidth="5"
              />
              <circle
                r={vBeltGeom.r2 - 9}
                fill="none"
                stroke={colors.pulleySpoke}
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              {[0, 90, 180, 270].map((a) => (
                <line
                  key={a}
                  x1="0"
                  y1="0"
                  x2={Math.cos((a * Math.PI) / 180) * (vBeltGeom.r2 - 7)}
                  y2={Math.sin((a * Math.PI) / 180) * (vBeltGeom.r2 - 7)}
                  stroke={colors.pulleySpoke}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              ))}
              <circle r="12" fill={colors.panelBg} stroke={colors.gear2Stroke} strokeWidth="2.5" />
            </g>

            {/* Pulley labels (2-line compact to avoid collision at min center distance) */}
            <text
              x={vBeltGeom.cx1}
              y={vBeltGeom.cy + vBeltGeom.r1 + 18}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={colors.textPrimary}
            >
              Driver D₁ = {vBeltParams.d1} mm
            </text>
            <text
              x={vBeltGeom.cx1}
              y={vBeltGeom.cy + vBeltGeom.r1 + 31}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={colors.textMuted}
            >
              {vBeltParams.motorRpm} RPM
            </text>
            <text
              x={vBeltGeom.cx2}
              y={vBeltGeom.cy + vBeltGeom.r2 + 18}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={colors.textPrimary}
            >
              Driven D₂ = {vBeltParams.d2} mm
            </text>
            <text
              x={vBeltGeom.cx2}
              y={vBeltGeom.cy + vBeltGeom.r2 + 31}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={colors.textMuted}
            >
              {vBeltResults.outputRpm.toFixed(0)} RPM
            </text>

            {/* Force-Deflection Tester Plunger at Mid-Span */}
            <g>
              {/* Deflection arrow/span */}
              <line
                x1={vBeltGeom.midTopX}
                y1={vBeltGeom.midTopY - 46}
                x2={vBeltGeom.midTopX}
                y2={vBeltGeom.midTopY + vBeltGeom.visualDeflectionPx - 4}
                stroke={statusColor}
                strokeWidth="2.5"
              />
              <polygon
                points={`${vBeltGeom.midTopX},${vBeltGeom.midTopY + vBeltGeom.visualDeflectionPx - 1} ${vBeltGeom.midTopX - 5},${vBeltGeom.midTopY + vBeltGeom.visualDeflectionPx - 10} ${vBeltGeom.midTopX + 5},${vBeltGeom.midTopY + vBeltGeom.visualDeflectionPx - 10}`}
                fill={statusColor}
              />
              {/* Gauge body */}
              <rect
                x={vBeltGeom.midTopX - 78}
                y={Math.max(12, vBeltGeom.midTopY - 94)}
                width="156"
                height="46"
                rx="12"
                fill={colors.panelBg}
                stroke={statusColor}
                strokeWidth="1.5"
              />
              <text
                x={vBeltGeom.midTopX}
                y={Math.max(30, vBeltGeom.midTopY - 76)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={colors.textPrimary}
              >
                Force: {vBeltParams.testForceN} N → δ ={' '}
                {vBeltResults.actualDeflectionMm.toFixed(1)} mm
              </text>
              <text
                x={vBeltGeom.midTopX}
                y={Math.max(46, vBeltGeom.midTopY - 60)}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={statusColor}
              >
                Target C/64 = {vBeltResults.targetDeflectionMm.toFixed(1)} mm
              </text>
            </g>

            {/* Sheave Misalignment Top-View Inset */}
            <g transform="translate(570, 14)">
              <rect
                width="176"
                height="82"
                rx="14"
                fill={colors.panelBg}
                stroke={
                  vBeltResults.misalignmentWarning
                    ? colors.statusDanger
                    : colors.panelBorder
                }
                strokeWidth="1.2"
              />
              <text
                x="10"
                y="18"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                fill={colors.textMuted}
              >
                SHEAVE ALIGNMENT (TOP)
              </text>
              {/* Straight alignment axis */}
              <line
                x1="20"
                y1="48"
                x2="156"
                y2="48"
                stroke={colors.grid}
                strokeDasharray="3 3"
              />
              {/* Driver sheave top view */}
              <rect
                x="34"
                y="34"
                width="12"
                height="28"
                rx="2"
                fill={colors.pulleyFill}
                stroke={colors.gear1Stroke}
                strokeWidth="1.5"
              />
              {/* Driven sheave top view tilted by misalignment */}
              <g
                transform={`translate(132, 48) rotate(${vBeltParams.misalignmentDeg * 6})`}
              >
                <rect
                  x="-6"
                  y="-16"
                  width="12"
                  height="32"
                  rx="2"
                  fill={colors.pulleyFill}
                  stroke={
                    vBeltResults.misalignmentWarning
                      ? colors.statusDanger
                      : colors.gear2Stroke
                  }
                  strokeWidth="1.5"
                />
              </g>
              {/* Belt top line */}
              <line
                x1="40"
                y1="48"
                x2="132"
                y2="48"
                stroke={
                  vBeltResults.misalignmentWarning
                    ? colors.statusDanger
                    : colors.beltStroke
                }
                strokeWidth="3"
              />
              <text
                x="88"
                y="74"
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={
                  vBeltResults.misalignmentWarning
                    ? colors.statusDanger
                    : colors.statusOk
                }
              >
                {vBeltParams.misalignmentDeg.toFixed(1)}°{' '}
                {vBeltResults.misalignmentWarning ? '(Misaligned!)' : '(Aligned)'}
              </text>
            </g>
          </g>
        ) : (
          <g>
            {/* Spur Gear 1 (Driver) */}
            <g
              transform={`translate(${spurGeom.cx1}, ${spurGeom.cy}) rotate(${driverAngleDeg})`}
            >
              <path
                d={spurGeom.path1}
                fill={colors.gear1Fill}
                stroke={colors.gear1Stroke}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle
                r={spurGeom.r1 * 0.45}
                fill={colors.panelBg}
                stroke={colors.gear1Stroke}
                strokeWidth="1.5"
              />
              <circle r="9" fill={colors.gear1Stroke} opacity="0.25" />
              <line
                x1="0"
                y1="0"
                x2={spurGeom.r1 * 0.45}
                y2="0"
                stroke={colors.gear1Stroke}
                strokeWidth="2"
              />
            </g>

            {/* Spur Gear 2 (Driven) — strictly phase-locked θ₂ = -θ₁ * (z1/z2) + phase2Deg */}
            <g
              transform={`translate(${spurGeom.cx2}, ${spurGeom.cy}) rotate(${spurDrivenAngleDeg})`}
            >
              <path
                d={spurGeom.path2}
                fill={colors.gear2Fill}
                stroke={colors.gear2Stroke}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle
                r={spurGeom.r2 * 0.48}
                fill={colors.panelBg}
                stroke={colors.gear2Stroke}
                strokeWidth="1.5"
              />
              <circle r="11" fill={colors.gear2Stroke} opacity="0.25" />
              <line
                x1="0"
                y1="0"
                x2={spurGeom.r2 * 0.48}
                y2="0"
                stroke={colors.gear2Stroke}
                strokeWidth="2"
              />
            </g>

            {/* Pitch Circles Overlay */}
            <circle
              cx={spurGeom.cx1}
              cy={spurGeom.cy}
              r={spurGeom.r1}
              fill="none"
              stroke={colors.pitchCircle1}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <circle
              cx={spurGeom.cx2}
              cy={spurGeom.cy}
              r={spurGeom.r2}
              fill="none"
              stroke={colors.pitchCircle2}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />

            {/* Line of Action (20° Pressure Angle) & Pitch-Point Force Vector */}
            {(() => {
              const alphaRad = (20 * Math.PI) / 180;
              const loaLen = 78;
              const dx = Math.sin(alphaRad) * loaLen;
              const dy = Math.cos(alphaRad) * loaLen;
              const fnLen = Math.min(64, Math.max(32, spurResults.normalForceN * 0.025));
              const fx = Math.sin(alphaRad) * fnLen;
              const fy = Math.cos(alphaRad) * fnLen;
              const tipX = spurGeom.pitchPointX + fx;
              const tipY = spurGeom.cy - fy;
              return (
                <g>
                  <line
                    x1={spurGeom.pitchPointX - dx}
                    y1={spurGeom.cy + dy}
                    x2={spurGeom.pitchPointX + dx}
                    y2={spurGeom.cy - dy}
                    stroke={colors.statusWarn}
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    strokeDashoffset={-beltTravelPx}
                    opacity="0.85"
                  />
                  <line
                    x1={spurGeom.pitchPointX}
                    y1={spurGeom.cy}
                    x2={tipX}
                    y2={tipY}
                    stroke={colors.statusDanger}
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <circle cx={tipX} cy={tipY} r="3.5" fill={colors.statusDanger} />
                  <line
                    x1={tipX}
                    y1={tipY}
                    x2={Math.max(spurGeom.pitchPointX + 70, tipX + 14)}
                    y2={tipY}
                    stroke={colors.statusDanger}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={Math.max(spurGeom.pitchPointX + 70, tipX + 14)}
                    y={tipY - 10}
                    width="116"
                    height="20"
                    rx="10"
                    fill={colors.panelBg}
                    stroke={colors.statusDanger}
                    strokeWidth="1.1"
                  />
                  <text
                    x={Math.max(spurGeom.pitchPointX + 70, tipX + 14) + 58}
                    y={tipY + 3.5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    fill={colors.textPrimary}
                  >
                    Fₙ = {spurResults.normalForceN.toFixed(0)} N (20°)
                  </text>
                </g>
              );
            })()}

            {/* Pitch Point & Pitch-Line Velocity Vector */}
            <circle
              cx={spurGeom.pitchPointX}
              cy={spurGeom.cy}
              r="4.5"
              fill={statusColor}
            />
            <line
              x1={spurGeom.pitchPointX}
              y1={spurGeom.cy}
              x2={spurGeom.pitchPointX}
              y2={spurGeom.cy - 68}
              stroke={statusColor}
              strokeWidth="2.2"
            />
            <polygon
              points={`${spurGeom.pitchPointX},${spurGeom.cy - 74} ${spurGeom.pitchPointX - 4.5},${spurGeom.cy - 64} ${spurGeom.pitchPointX + 4.5},${spurGeom.cy - 64}`}
              fill={statusColor}
            />
            <rect
              x={spurGeom.pitchPointX - 58}
              y={spurGeom.cy - 98}
              width="116"
              height="20"
              rx="10"
              fill={colors.panelBg}
              stroke={statusColor}
              strokeWidth="1.2"
            />
            <text
              x={spurGeom.pitchPointX}
              y={spurGeom.cy - 84}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-mono)"
              fill={colors.textPrimary}
            >
              v = {spurResults.pitchLineVelocityMs.toFixed(2)} m/s
            </text>

            {/* Center Distance Dimension */}
            <line
              x1={spurGeom.cx1}
              y1={372}
              x2={spurGeom.cx2}
              y2={372}
              stroke={colors.textMuted}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <line
              x1={spurGeom.cx1}
              y1={spurGeom.cy}
              x2={spurGeom.cx1}
              y2={378}
              stroke={colors.textMuted}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <line
              x1={spurGeom.cx2}
              y1={spurGeom.cy}
              x2={spurGeom.cx2}
              y2={378}
              stroke={colors.textMuted}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <rect
              x={(spurGeom.cx1 + spurGeom.cx2) / 2 - 74}
              y={361}
              width="148"
              height="20"
              rx="10"
              fill={colors.panelBg}
              stroke={colors.panelBorder}
            />
            <text
              x={(spurGeom.cx1 + spurGeom.cx2) / 2}
              y={375}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={colors.textPrimary}
            >
              C = {spurResults.actualCenterDistanceMm.toFixed(2)} mm
            </text>

            {/* Gear labels (2-line compact so they never touch teeth or each other) */}
            <text
              x={spurGeom.cx1}
              y={334}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={colors.textPrimary}
            >
              Pinion Z₁={spurParams.z1}
            </text>
            <text
              x={spurGeom.cx1}
              y={347}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={colors.textMuted}
            >
              d₁ = {spurResults.pitchDiameter1Mm} mm
            </text>
            <text
              x={spurGeom.cx2}
              y={334}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="700"
              fontFamily="var(--font-sans)"
              fill={colors.textPrimary}
            >
              Gear Z₂={spurParams.z2}
            </text>
            <text
              x={spurGeom.cx2}
              y={347}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={colors.textMuted}
            >
              d₂ = {spurResults.pitchDiameter2Mm} mm
            </text>

            {/* Backlash & Mesh Status Inset */}
            <g transform="translate(540, 14)">
              <rect
                width="206"
                height="82"
                rx="14"
                fill={colors.panelBg}
                stroke={statusColor}
                strokeWidth="1.2"
              />
              <text
                x="12"
                y="19"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                fill={colors.textMuted}
              >
                MESH & BACKLASH CHECK
              </text>
              <text
                x="12"
                y="39"
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={colors.textPrimary}
              >
                Module m = {spurParams.moduleMm} mm (α = 20°)
              </text>
              <text
                x="12"
                y="57"
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-mono)"
                fill={colors.textPrimary}
              >
                Backlash j = {spurResults.backlashMm.toFixed(3)} mm
              </text>
              <text
                x="12"
                y="74"
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                fill={statusColor}
              >
                ΔC = {spurParams.centerOffsetMm >= 0 ? '+' : ''}
                {spurParams.centerOffsetMm.toFixed(2)} mm ({spurResults.status})
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
