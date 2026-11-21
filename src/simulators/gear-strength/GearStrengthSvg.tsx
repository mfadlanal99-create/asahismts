import { useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { GearCalculationResult } from './gearStrengthData';

interface GearStrengthSvgProps {
  analysis: GearCalculationResult;
  isRunning?: boolean;
  rotationSpeed?: number;
}

export function GearStrengthSvg({
  analysis,
  isRunning = true,
  rotationSpeed = 0.1,
}: GearStrengthSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Direct DOM refs for 60fps animation with zero React re-renders
  const pinionGroupRef = useRef<SVGGElement>(null);
  const gearGroupRef = useRef<SVGGElement>(null);
  const pinionAngleRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  const {
    inputs,
    transverseModuleMm,
    pitchDiameter1Mm,
    pitchDiameter2Mm,
    centerDistanceMm,
    gearRatio,
    gearRpm,
    pinionTorqueNm,
    tangentialForceN,
    radialForceN,
    axialForceN,
    normalForceN,
    lewisBendingStressMpa,
    contactStressMpa,
    bendingSafetyFactor,
    contactSafetyFactor,
    status,
  } = analysis;

  const isHelical = inputs.gearType === 'helical';
  const z1 = inputs.pinionTeeth;
  const z2 = inputs.gearTeeth;

  // Compact 800x470 viewBox renders near 1:1 pixel ratio inside max-h-[480px] for large legible text
  const svgW = 800;
  const svgH = 470;

  // Dedicated Gear Arena: Y = 64..364 (center cy = 214), X = 40..760
  const availableW = 700;
  const availableH = 276;

  const rTip1_mm = (z1 + 2) * (transverseModuleMm / 2);
  const rTip2_mm = (z2 + 2) * (transverseModuleMm / 2);
  const totalHorizontalSpanMm = rTip1_mm + centerDistanceMm + rTip2_mm;
  const totalVerticalSpanMm = 2 * Math.max(rTip1_mm, rTip2_mm);

  const scaleX = availableW / totalHorizontalSpanMm;
  const scaleY = availableH / totalVerticalSpanMm;
  const autoScale = Math.min(scaleX, scaleY);

  // Scaled pitch radii in SVG pixels
  const r1_px = (pitchDiameter1Mm / 2) * autoScale;
  const r2_px = (pitchDiameter2Mm / 2) * autoScale;
  const centerDistancePx = r1_px + r2_px;

  // Scaled tip and root radii
  const m_px = transverseModuleMm * autoScale;
  const addendum_px = 1.0 * m_px;
  const dedendum_px = 1.25 * m_px;
  const rTip1_px = r1_px + addendum_px;
  const rTip2_px = r2_px + addendum_px;
  const rRoot1_px = Math.max(6, r1_px - dedendum_px);
  const rRoot2_px = Math.max(10, r2_px - dedendum_px);

  // Center coordinates inside Gear Arena
  const totalSpanPx = rTip1_px + centerDistancePx + rTip2_px;
  const leftStartPx = (svgW - totalSpanPx) / 2;
  const cx1 = leftStartPx + rTip1_px;
  const cy1 = 214;
  const cx2 = cx1 + centerDistancePx;
  const cy2 = cy1;

  // Pitch point P
  const px = cx1 + r1_px;
  const py = cy1;

  // Gear tooth space phase alignment at 180 deg
  const pitchAngleDeg2 = 360 / z2;
  const gearPhaseOffsetDeg = 180 + pitchAngleDeg2 / 2;

  // Involute SVG paths
  const pinionPath = useMemo(() => {
    return generateExactGearPath(rRoot1_px, r1_px, rTip1_px, z1, inputs.pressureAngleDeg);
  }, [rRoot1_px, r1_px, rTip1_px, z1, inputs.pressureAngleDeg]);

  const gearPath = useMemo(() => {
    return generateExactGearPath(rRoot2_px, r2_px, rTip2_px, z2, inputs.pressureAngleDeg);
  }, [rRoot2_px, r2_px, rTip2_px, z2, inputs.pressureAngleDeg]);

  // Ref store for zero-lag animation loop
  const paramsRef = useRef({
    rpm: inputs.pinionRpm,
    speed: rotationSpeed,
    z1,
    z2,
    cx1,
    cy1,
    cx2,
    cy2,
    gearPhaseOffsetDeg,
  });

  useEffect(() => {
    paramsRef.current = {
      rpm: inputs.pinionRpm,
      speed: rotationSpeed,
      z1,
      z2,
      cx1,
      cy1,
      cx2,
      cy2,
      gearPhaseOffsetDeg,
    };
    const pAngle = pinionAngleRef.current;
    const gAngle = -(pAngle * (z1 / z2)) + gearPhaseOffsetDeg;
    if (pinionGroupRef.current) {
      pinionGroupRef.current.setAttribute(
        'transform',
        `translate(${cx1}, ${cy1}) rotate(${pAngle.toFixed(3)})`
      );
    }
    if (gearGroupRef.current) {
      gearGroupRef.current.setAttribute(
        'transform',
        `translate(${cx2}, ${cy2}) rotate(${gAngle.toFixed(3)})`
      );
    }
  });

  // 60fps requestAnimationFrame loop
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null;
      return;
    }

    let animId: number;

    const tick = (time: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (time - lastTimeRef.current) / 1000;
        const {
          rpm,
          speed,
          z1: pz1,
          z2: pz2,
          cx1: pcx1,
          cy1: pcy1,
          cx2: pcx2,
          cy2: pcy2,
          gearPhaseOffsetDeg: pPhase,
        } = paramsRef.current;

        // True RPM scaling: 1 RPM = 6 deg/s
        const degPerSec = rpm * 6 * speed;
        pinionAngleRef.current += degPerSec * deltaSec;

        if (pinionAngleRef.current > 3600000) {
          pinionAngleRef.current %= 360 * pz2;
        }

        const pAngle = pinionAngleRef.current;
        const gAngle = -(pAngle * (pz1 / pz2)) + pPhase;

        if (pinionGroupRef.current) {
          pinionGroupRef.current.setAttribute(
            'transform',
            `translate(${pcx1}, ${pcy1}) rotate(${pAngle.toFixed(3)})`
          );
        }
        if (gearGroupRef.current) {
          gearGroupRef.current.setAttribute(
            'transform',
            `translate(${pcx2}, ${pcy2}) rotate(${gAngle.toFixed(3)})`
          );
        }
      }
      lastTimeRef.current = time;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  // Transverse pressure angle measured from the vertical pitch tangent
  const cosPsi = isHelical ? Math.max(0.5, Math.cos((inputs.helixAngleDeg * Math.PI) / 180)) : 1;
  const alphaRad = Math.atan(Math.tan((inputs.pressureAngleDeg * Math.PI) / 180) / cosPsi);

  // Line of Action passing through Pitch Point P at angle alphaRad from vertical tangent
  const loaHalfLen = 85;
  const loaX1 = px - loaHalfLen * Math.sin(alphaRad);
  const loaY1 = py - loaHalfLen * Math.cos(alphaRad);
  const loaX2 = px + loaHalfLen * Math.sin(alphaRad);
  const loaY2 = py + loaHalfLen * Math.cos(alphaRad);

  // Force vector lengths forming an exact right triangle at Pitch Point P:
  // Action of Pinion onto Gear: Wt downward (+Y), Wr rightward (+X), Resultant Wn along Line of Action
  const wt_len = 66;
  const wr_len = wt_len * Math.tan(alphaRad);
  const wn_len = wt_len / Math.cos(alphaRad);

  // Theme Colors
  const cBg = 'var(--md-surface-container-lowest)';
  const cGrid = 'var(--md-surface-container-high)';
  const cTextPrimary = 'var(--md-on-surface)';
  const cTextSecondary = 'var(--md-on-surface-variant)';
  const cBorder = 'var(--md-outline-variant)';
  const cCardBg = 'var(--md-surface-container-low)';

  const statusBadge =
    status === 'SAFE'
      ? { bg: '#10b981', text: '#ffffff', label: 'SAFE' }
      : status === 'MARGINAL'
        ? { bg: '#f59e0b', text: '#000000', label: 'MARGINAL' }
        : { bg: '#ef4444', text: '#ffffff', label: 'FAIL' };

  return (
    <div data-tour="gear-svg" className="glass-panel relative flex w-full items-center justify-center overflow-hidden rounded-[28px] p-4 sm:p-5">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto max-h-[480px] select-none"
        fontFamily="var(--font-sans)"
        aria-label="Gear Strength CAD Simulation"
      >
        <defs>
          <pattern id="gearGridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={cGrid}
              strokeWidth="0.6"
              strokeOpacity="0.6"
            />
          </pattern>
          <pattern id="gearGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#gearGridSmall)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke={cGrid}
              strokeWidth="1.2"
              strokeOpacity="0.8"
            />
          </pattern>

          <radialGradient id="pinionRadialGrad" cx="38%" cy="38%" r="65%">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
            <stop offset="55%" stopColor={isDark ? '#334155' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#64748b'} />
          </radialGradient>

          <radialGradient id="gearRadialGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor={isDark ? '#3b4252' : '#f1f5f9'} />
            <stop offset="60%" stopColor={isDark ? '#272f3d' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#141a24' : '#94a3b8'} />
          </radialGradient>

          <radialGradient id="bronzeRadialGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          <marker
            id="mArrRed"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
          <marker
            id="mArrBlue"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
          </marker>
          <marker
            id="mArrPurple"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* Background Grid */}
        <rect width={svgW} height={svgH} fill={cBg} />
        <rect width={svgW} height={svgH} fill="url(#gearGridMajor)" />

        {/* ======================================================== */}
        {/* ZONE 1: TOP HEADER BAR (Y = 10..48) - ZERO OVERLAP       */}
        {/* ======================================================== */}
        <g transform="translate(14, 10)">
          <rect
            x="0"
            y="0"
            width="370"
            height="36"
            rx="12"
            fill={cCardBg}
            stroke={cBorder}
            strokeWidth="1.2"
            fillOpacity="0.95"
          />
          <text x="14" y="23" fill={cTextPrimary} fontSize="13" fontWeight="800" fontFamily="var(--font-mono)">
            {isHelical
              ? `HELICAL (ψ=${inputs.helixAngleDeg}°) • ${z1}T : ${z2}T • u=${gearRatio.toFixed(2)}:1`
              : `SPUR GEAR PAIR • ${z1}T : ${z2}T • u=${gearRatio.toFixed(2)}:1 • m=${inputs.moduleMm}mm`}
          </text>
        </g>

        <g transform="translate(410, 10)">
          <rect
            x="0"
            y="0"
            width="376"
            height="36"
            rx="12"
            fill={cCardBg}
            stroke={cBorder}
            strokeWidth="1.2"
            fillOpacity="0.95"
          />
          <rect x="8" y="6" width="76" height="24" rx="12" fill={statusBadge.bg} />
          <text
            x="46"
            y="22"
            textAnchor="middle"
            fill={statusBadge.text}
            fontSize="11"
            fontWeight="800"
            fontFamily="var(--font-sans)"
          >
            {statusBadge.label}
          </text>
          <text x="96" y="23" fill={cTextPrimary} fontSize="12.5" fontWeight="700" fontFamily="var(--font-mono)">
            σ_b {lewisBendingStressMpa.toFixed(0)} MPa (SF {bendingSafetyFactor.toFixed(2)})  •  σ_c {contactStressMpa.toFixed(0)} MPa (SH {contactSafetyFactor.toFixed(2)})
          </text>
        </g>

        {/* ======================================================== */}
        {/* ZONE 2: GEAR MESHING ARENA (Y = 64..364, cy = 214)       */}
        {/* ======================================================== */}

        {/* Center Distance Horizontal Axis */}
        <line
          x1={cx1}
          y1={cy1}
          x2={cx2}
          y2={cy2}
          stroke={cTextSecondary}
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />

        {/* Vertical Pitch Tangent Guide through P */}
        <line
          x1={px}
          y1={py - 90}
          x2={px}
          y2={py + 95}
          stroke={cTextSecondary}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.5"
        />

        {/* Pitch Circles (Dashed Gold) */}
        <circle
          cx={cx1}
          cy={cy1}
          r={r1_px}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeDasharray="6 3"
        />
        <circle
          cx={cx2}
          cy={cy2}
          r={r2_px}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeDasharray="6 3"
        />

        {/* Line of Action through Pitch Point P */}
        <line
          x1={loaX1}
          y1={loaY1}
          x2={loaX2}
          y2={loaY2}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5 3"
        />

        {/* GEAR 2: DRIVEN BULL GEAR */}
        <g
          ref={gearGroupRef}
          transform={`translate(${cx2}, ${cy2}) rotate(${gearPhaseOffsetDeg})`}
        >
          <path
            d={gearPath}
            fill={inputs.materialId === 'phosphor-bronze' ? 'url(#bronzeRadialGrad)' : 'url(#gearRadialGrad)'}
            stroke={isDark ? '#64748b' : '#334155'}
            strokeWidth="1.3"
          />

          {r2_px > 68 && (
            <>
              <circle
                cx="0"
                cy="0"
                r={r2_px * 0.78}
                fill="none"
                stroke={isDark ? '#475569' : '#94a3b8'}
                strokeWidth="1"
              />
              <circle
                cx="0"
                cy="0"
                r={r2_px * 0.38}
                fill="none"
                stroke={isDark ? '#475569' : '#94a3b8'}
                strokeWidth="1"
              />
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const holeR = r2_px * 0.58;
                const hx = holeR * Math.cos((deg * Math.PI) / 180);
                const hy = holeR * Math.sin((deg * Math.PI) / 180);
                return (
                  <circle
                    key={deg}
                    cx={hx}
                    cy={hy}
                    r={Math.max(5, r2_px * 0.11)}
                    fill={cBg}
                    stroke={cBorder}
                    strokeWidth="1.2"
                  />
                );
              })}
            </>
          )}

          <circle
            cx="0"
            cy="0"
            r={Math.max(14, r2_px * 0.22)}
            fill={isDark ? '#1e293b' : '#64748b'}
            stroke={cTextPrimary}
            strokeWidth="1.5"
          />
          <circle
            cx="0"
            cy="0"
            r={Math.max(7, r2_px * 0.11)}
            fill={cBg}
            stroke={cBorder}
            strokeWidth="1.2"
          />
          <rect
            x={-Math.max(2, r2_px * 0.03)}
            y={-Math.max(9, r2_px * 0.14)}
            width={Math.max(4, r2_px * 0.06)}
            height={Math.max(4, r2_px * 0.07)}
            fill={cBg}
            stroke={cBorder}
            strokeWidth="1"
          />
        </g>

        {/* GEAR 1: DRIVING PINION */}
        <g ref={pinionGroupRef} transform={`translate(${cx1}, ${cy1})`}>
          <path
            d={pinionPath}
            fill="url(#pinionRadialGrad)"
            stroke={isDark ? '#94a3b8' : '#334155'}
            strokeWidth="1.3"
          />

          <circle
            cx="0"
            cy="0"
            r={Math.max(11, r1_px * 0.36)}
            fill={isDark ? '#0f172a' : '#475569'}
            stroke={cTextPrimary}
            strokeWidth="1.5"
          />
          <circle
            cx="0"
            cy="0"
            r={Math.max(5, r1_px * 0.18)}
            fill={cBg}
            stroke={cBorder}
            strokeWidth="1.2"
          />
          <rect
            x={-Math.max(1.5, r1_px * 0.04)}
            y={-Math.max(7, r1_px * 0.24)}
            width={Math.max(3, r1_px * 0.08)}
            height={Math.max(3, r1_px * 0.11)}
            fill={cBg}
            stroke={cBorder}
            strokeWidth="1"
          />
        </g>

        {/* Exact Orthogonal Center Crosshairs */}
        <g stroke={cTextSecondary} strokeWidth="1" opacity="0.7">
          <line x1={cx1 - 9} y1={cy1} x2={cx1 + 9} y2={cy1} />
          <line x1={cx1} y1={cy1 - 9} x2={cx1} y2={cy1 + 9} />
          <line x1={cx2 - 9} y1={cy2} x2={cx2 + 9} y2={cy2} />
          <line x1={cx2} y1={cy2 - 9} x2={cx2} y2={cy2 + 9} />
        </g>

        {/* Clean Rotation Arcs Centered Around Hubs (Zero Collision) */}
        <path
          d={`M ${cx1 - 24} ${cy1 - 14} A 28 28 0 0 1 ${cx1 + 24} ${cy1 - 14}`}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.4"
          markerEnd="url(#mArrPurple)"
        />
        <path
          d={`M ${cx2 + 26} ${cy2 - 16} A 30 30 0 0 0 ${cx2 - 26} ${cy2 - 16}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.4"
          markerEnd="url(#mArrBlue)"
        />

        {/* ======================================================== */}
        {/* PITCH POINT & VECTOR TRIANGLE (HALO LABELS - NO OVERLAP) */}
        {/* ======================================================== */}

        {/* Vector Triangle Guidelines */}
        <line
          x1={px}
          y1={py + wt_len}
          x2={px + wr_len}
          y2={py + wt_len}
          stroke={cTextSecondary}
          strokeWidth="1"
          strokeDasharray="3 2"
          opacity="0.75"
        />

        {/* Tangential Force Wt (Red, downward along vertical pitch tangent) */}
        <line
          x1={px}
          y1={py}
          x2={px}
          y2={py + wt_len}
          stroke="#ef4444"
          strokeWidth="2.8"
          markerEnd="url(#mArrRed)"
        />

        {/* Radial Force Wr (Blue, rightward) */}
        <line
          x1={px}
          y1={py}
          x2={px + wr_len}
          y2={py}
          stroke="#0284c7"
          strokeWidth="2.5"
          markerEnd="url(#mArrBlue)"
        />

        {/* Resultant Normal Force Wn (Purple along Line of Action) */}
        <line
          x1={px}
          y1={py}
          x2={px + wn_len * Math.sin(alphaRad)}
          y2={py + wn_len * Math.cos(alphaRad)}
          stroke="#8b5cf6"
          strokeWidth="2.5"
          markerEnd="url(#mArrPurple)"
        />

        {/* Pitch Point Marker */}
        <circle cx={px} cy={py} r="5.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

        {/* Crisp Vector Symbol Labels with Solid Text Halo */}
        <g
          fontSize="13"
          fontWeight="800"
          stroke={cBg}
          strokeWidth="4"
          paintOrder="stroke"
          strokeLinejoin="round"
        >
          <text x={px - 10} y={py - 12} textAnchor="end" fill="#f59e0b">
            P
          </text>
          <text x={loaX1 - 6} y={loaY1 - 6} textAnchor="end" fill="#10b981">
            α={inputs.pressureAngleDeg}°
          </text>
          <text x={px - 8} y={py + wt_len + 4} textAnchor="end" fill="#ef4444">
            Wₜ
          </text>
          <text x={px + wr_len + 8} y={py - 6} textAnchor="start" fill="#0284c7">
            Wᵣ
          </text>
          <text
            x={px + wn_len * Math.sin(alphaRad) + 8}
            y={py + wn_len * Math.cos(alphaRad) + 12}
            textAnchor="start"
            fill="#8b5cf6"
          >
            Wₙ
          </text>
        </g>

        {/* ======================================================== */}
        {/* ZONE 3: CENTER DISTANCE DIMENSION (Y = 378)              */}
        {/* ======================================================== */}
        <g transform="translate(0, 378)">
          <line
            x1={cx1}
            y1={cy1 + 12 - 378}
            x2={cx1}
            y2={8}
            stroke={cTextSecondary}
            strokeWidth="0.9"
            strokeDasharray="3 3"
            opacity="0.45"
          />
          <line
            x1={cx2}
            y1={cy2 + 12 - 378}
            x2={cx2}
            y2={8}
            stroke={cTextSecondary}
            strokeWidth="0.9"
            strokeDasharray="3 3"
            opacity="0.45"
          />
          <line x1={cx1} y1="0" x2={cx2} y2="0" stroke={cTextSecondary} strokeWidth="1.5" />
          <line x1={cx1} y1="-7" x2={cx1} y2="7" stroke={cTextSecondary} strokeWidth="1.5" />
          <line x1={cx2} y1="-7" x2={cx2} y2="7" stroke={cTextSecondary} strokeWidth="1.5" />
          <rect
            x={(cx1 + cx2) / 2 - 74}
            y="-12"
            width="148"
            height="24"
            rx="8"
            fill={cCardBg}
            stroke={cBorder}
            strokeWidth="1.2"
          />
          <text
            x={(cx1 + cx2) / 2}
            y="5"
            textAnchor="middle"
            fill={cTextPrimary}
            fontSize="13"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            a = {centerDistanceMm.toFixed(1)} mm
          </text>
        </g>

        {/* ======================================================== */}
        {/* ZONE 4: BOTTOM SUMMARY BAR (Y = 406..458) - ZERO OVERLAP */}
        {/* ======================================================== */}
        {/* Left Card: Pinion Details */}
        <g transform="translate(14, 406)">
          <rect
            x="0"
            y="0"
            width="248"
            height="52"
            rx="12"
            fill={cCardBg}
            stroke="var(--md-primary)"
            strokeWidth="1.2"
            fillOpacity="0.95"
          />
          <text x="124" y="21" textAnchor="middle" fill="var(--md-primary)" fontSize="12" fontWeight="800" fontFamily="var(--font-mono)">
            PINION (z₁={z1}) • d₁ = {pitchDiameter1Mm.toFixed(1)} mm
          </text>
          <text x="124" y="40" textAnchor="middle" fill={cTextPrimary} fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
            {inputs.pinionRpm} RPM ↻  •  T₁ = {pinionTorqueNm.toFixed(1)} N·m
          </text>
        </g>

        {/* Center Card: Forces Breakdown */}
        <g transform="translate(276, 406)">
          <rect
            x="0"
            y="0"
            width="248"
            height="52"
            rx="12"
            fill={cCardBg}
            stroke={cBorder}
            strokeWidth="1.2"
            fillOpacity="0.95"
          />
          <text x="124" y="21" textAnchor="middle" fill={cTextPrimary} fontSize="12" fontWeight="800" fontFamily="var(--font-mono)">
            <tspan fill="#ef4444">Wₜ={tangentialForceN.toFixed(0)} N</tspan>
            {'  •  '}
            <tspan fill="#0284c7">Wᵣ={radialForceN.toFixed(0)} N</tspan>
          </text>
          <text x="124" y="40" textAnchor="middle" fill={cTextSecondary} fontSize="11.5" fontWeight="700" fontFamily="var(--font-mono)">
            {isHelical
              ? `Axial Thrust Wₐ = ${axialForceN.toFixed(0)} N`
              : `Resultant Load Wₙ = ${normalForceN.toFixed(0)} N`}
          </text>
        </g>

        {/* Right Card: Bull Gear Details */}
        <g transform="translate(538, 406)">
          <rect
            x="0"
            y="0"
            width="248"
            height="52"
            rx="12"
            fill={cCardBg}
            stroke="var(--md-secondary)"
            strokeWidth="1.2"
            fillOpacity="0.95"
          />
          <text x="124" y="21" textAnchor="middle" fill="var(--md-secondary)" fontSize="12" fontWeight="800" fontFamily="var(--font-mono)">
            GEAR (z₂={z2}) • d₂ = {pitchDiameter2Mm.toFixed(1)} mm
          </text>
          <text x="124" y="40" textAnchor="middle" fill={cTextPrimary} fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">
            {gearRpm.toFixed(1)} RPM ↺  •  T₂ = {(pinionTorqueNm * gearRatio).toFixed(1)} N·m
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * Standard Involute Function: inv(alpha) = tan(alpha) - alpha
 */
function inv(alpha: number): number {
  return Math.tan(alpha) - alpha;
}

/**
 * Generates an accurate 2D involute gear perimeter path
 * with exactly `teeth` teeth, authentic addendum crests, involute flanks,
 * and root fillets that mesh seamlessly.
 */
function generateExactGearPath(
  rRoot: number,
  rPitch: number,
  rTip: number,
  teeth: number,
  pressureAngleDeg: number
): string {
  const alphaRad = (pressureAngleDeg * Math.PI) / 180;
  const invAlpha = inv(alphaRad);
  const rBase = rPitch * Math.cos(alphaRad);

  const angleStep = (2 * Math.PI) / teeth;
  const toothHalfThickPitch = Math.PI / (2 * teeth);

  const getHalfAngle = (r: number): number => {
    if (r <= rBase) {
      return toothHalfThickPitch + invAlpha;
    }
    const cosAlphaR = Math.min(1.0, Math.max(0.1, rBase / r));
    const alphaR = Math.acos(cosAlphaR);
    const rawHalf = toothHalfThickPitch + invAlpha - inv(alphaR);
    return Math.max(0.18 * toothHalfThickPitch, rawHalf);
  };

  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < teeth; i++) {
    const centerAngle = i * angleStep;

    const halfAtRoot = getHalfAngle(rRoot) * 1.08;
    const halfAtBase = getHalfAngle(Math.max(rRoot, rBase));
    const halfAtPitch = getHalfAngle(rPitch);
    const halfAtTip = getHalfAngle(rTip);

    const aRootL = centerAngle - halfAtRoot;
    points.push({ x: rRoot * Math.cos(aRootL), y: rRoot * Math.sin(aRootL) });

    if (rBase > rRoot * 1.06) {
      const aBaseL = centerAngle - halfAtBase;
      points.push({ x: rBase * Math.cos(aBaseL), y: rBase * Math.sin(aBaseL) });
    }

    const aPitchL = centerAngle - halfAtPitch;
    points.push({ x: rPitch * Math.cos(aPitchL), y: rPitch * Math.sin(aPitchL) });

    const aTipL = centerAngle - halfAtTip;
    points.push({ x: rTip * Math.cos(aTipL), y: rTip * Math.sin(aTipL) });

    const aTipR = centerAngle + halfAtTip;
    points.push({ x: rTip * Math.cos(aTipR), y: rTip * Math.sin(aTipR) });

    const aPitchR = centerAngle + halfAtPitch;
    points.push({ x: rPitch * Math.cos(aPitchR), y: rPitch * Math.sin(aPitchR) });

    if (rBase > rRoot * 1.06) {
      const aBaseR = centerAngle + halfAtBase;
      points.push({ x: rBase * Math.cos(aBaseR), y: rBase * Math.sin(aBaseR) });
    }

    const aRootR = centerAngle + halfAtRoot;
    points.push({ x: rRoot * Math.cos(aRootR), y: rRoot * Math.sin(aRootR) });
  }

  if (points.length === 0) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  d += ' Z';
  return d;
}
