import { useState, useRef, useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { BeamAnalysisResult } from './beamBendingData';

interface BeamBendingSvgProps {
  analysis: BeamAnalysisResult;
  deflectionMultiplier?: number;
}

export function BeamBendingSvg({ analysis, deflectionMultiplier = 15 }: BeamBendingSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const svgRef = useRef<SVGSVGElement>(null);

  // Interactive inspection cursor
  const [hoverXRatio, setHoverXRatio] = useState<number | null>(null);

  const {
    inputs,
    totalLengthM,
    reactions,
    diagramPoints,
    sfdPoints,
    absMaxShearKn,
    absMaxMomentKNm,
    maxDeflectionMm,
    maxDeflectionPosM,
  } = analysis;
  const {
    beamType,
    spanM,
    loadType,
    pointLoadKn,
    pointLoadPosM,
    udlKnM,
    udlStartM,
    udlEndM,
    sectionShape,
    material,
  } = inputs;

  // Dimensions & Coordinate Mapping
  const svgW = 860;
  const svgH = 620;
  const xStart = 110;
  const xEnd = 770;
  const beamW = xEnd - xStart;

  // Beam position x (m) to SVG X coordinate
  const toSvgX = useCallback(
    (x: number) => {
      if (totalLengthM <= 0) return xStart;
      const clamped = Math.max(0, Math.min(x, totalLengthM));
      return xStart + (clamped / totalLengthM) * beamW;
    },
    [totalLengthM, beamW, xStart]
  );

  // Vertical layout datums
  const yBeam = 115;
  const ySfdZero = 335;
  const yBmdZero = 495;
  const sfdHalfHeight = 48;
  const bmdHalfHeight = 48;

  // Scale factors
  const shearScale = absMaxShearKn > 1e-4 ? sfdHalfHeight / absMaxShearKn : 1;
  const momentScale = absMaxMomentKNm > 1e-4 ? bmdHalfHeight / absMaxMomentKNm : 1;

  // Visual deflection scaling
  const maxDeflectionAbs = Math.max(0.001, Math.abs(maxDeflectionMm));
  const visualDeflScale = Math.min(32 / maxDeflectionAbs, deflectionMultiplier);

  // Theme palettes
  const c = useMemo(() => {
    return isDark
      ? {
          bg: '#0f172a',
          grid: '#1e293b',
          gridSubtle: '#141e33',
          beamFlange: '#475569',
          beamWeb: '#334155',
          beamStroke: '#64748b',
          axis: '#334155',
          axisText: '#94a3b8',
          textMuted: '#94a3b8',
          textMain: '#f8fafc',
          textDim: '#64748b',
          cardBg: '#1e293b',
          cardBorder: '#334155',
          sfdPosFill: 'rgba(16, 185, 129, 0.22)',
          sfdPosStroke: '#10b981',
          sfdNegFill: 'rgba(244, 63, 94, 0.22)',
          sfdNegStroke: '#f43f5e',
          bmdPosFill: 'rgba(59, 130, 246, 0.25)',
          bmdPosStroke: '#3b82f6',
          bmdNegFill: 'rgba(245, 158, 11, 0.25)',
          bmdNegStroke: '#f59e0b',
        }
      : {
          bg: '#ffffff',
          grid: '#f1f5f9',
          gridSubtle: '#f8fafc',
          beamFlange: '#cbd5e1',
          beamWeb: '#e2e8f0',
          beamStroke: '#94a3b8',
          axis: '#cbd5e1',
          axisText: '#64748b',
          textMuted: '#64748b',
          textMain: '#0f172a',
          textDim: '#94a3b8',
          cardBg: '#ffffff',
          cardBorder: '#e2e8f0',
          sfdPosFill: 'rgba(16, 185, 129, 0.18)',
          sfdPosStroke: '#059669',
          sfdNegFill: 'rgba(244, 63, 94, 0.18)',
          sfdNegStroke: '#e11d48',
          bmdPosFill: 'rgba(59, 130, 246, 0.18)',
          bmdPosStroke: '#2563eb',
          bmdNegFill: 'rgba(245, 158, 11, 0.18)',
          bmdNegStroke: '#d97706',
        };
  }, [isDark]);

  // Stress to color mapper for deflection heatmap
  const getStressColor = useCallback(
    (stressMpa: number) => {
      const ratio = stressMpa / Math.max(1, material.yieldStrengthMpa);
      if (ratio < 0.4) return '#10b981'; // Green (Safe)
      if (ratio < 0.75) return '#0ea5e9'; // Cyan/Sky (Moderate)
      if (ratio < 1.0) return '#f59e0b'; // Amber (High)
      return '#ef4444'; // Red (Yielded)
    },
    [material.yieldStrengthMpa]
  );

  // Deflected elastic curve path
  const deflectedPathData = useMemo(() => {
    if (diagramPoints.length === 0) return '';
    return diagramPoints.reduce((acc, pt, i) => {
      const px = toSvgX(pt.x);
      const py = yBeam + pt.deflectionMm * visualDeflScale;
      return i === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : `${acc} L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }, '');
  }, [diagramPoints, toSvgX, yBeam, visualDeflScale]);

  // SFD positive and negative shaded polygon paths
  const { sfdPositivePath, sfdNegativePath, sfdLinePath } = useMemo(() => {
    if (sfdPoints.length === 0) return { sfdPositivePath: '', sfdNegativePath: '', sfdLinePath: '' };

    let linePath = '';
    for (let i = 0; i < sfdPoints.length; i++) {
      const px = toSvgX(sfdPoints[i].x);
      const py = ySfdZero - sfdPoints[i].shearKn * shearScale;
      linePath += i === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }

    let posPath = `M ${toSvgX(0).toFixed(1)} ${ySfdZero}`;
    let negPath = `M ${toSvgX(0).toFixed(1)} ${ySfdZero}`;

    for (let i = 0; i < sfdPoints.length; i++) {
      const pt = sfdPoints[i];
      const px = toSvgX(pt.x);
      const py = ySfdZero - pt.shearKn * shearScale;

      if (pt.shearKn >= 0) {
        posPath += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        negPath += ` L ${px.toFixed(1)} ${ySfdZero}`;
      } else {
        posPath += ` L ${px.toFixed(1)} ${ySfdZero}`;
        negPath += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }

    const lastX = toSvgX(totalLengthM);
    posPath += ` L ${lastX.toFixed(1)} ${ySfdZero} Z`;
    negPath += ` L ${lastX.toFixed(1)} ${ySfdZero} Z`;

    return { sfdPositivePath: posPath, sfdNegativePath: negPath, sfdLinePath: linePath };
  }, [sfdPoints, toSvgX, ySfdZero, shearScale, totalLengthM]);

  // BMD positive and negative shaded polygon paths
  const { bmdPositivePath, bmdNegativePath, bmdLinePath } = useMemo(() => {
    if (diagramPoints.length === 0) return { bmdPositivePath: '', bmdNegativePath: '', bmdLinePath: '' };

    let linePath = '';
    let posPath = `M ${toSvgX(0).toFixed(1)} ${yBmdZero}`;
    let negPath = `M ${toSvgX(0).toFixed(1)} ${yBmdZero}`;

    for (let i = 0; i < diagramPoints.length; i++) {
      const pt = diagramPoints[i];
      const px = toSvgX(pt.x);
      const py = yBmdZero - pt.momentKNm * momentScale;

      linePath += i === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : ` L ${px.toFixed(1)} ${py.toFixed(1)}`;

      if (pt.momentKNm >= 0) {
        posPath += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        negPath += ` L ${px.toFixed(1)} ${yBmdZero}`;
      } else {
        posPath += ` L ${px.toFixed(1)} ${yBmdZero}`;
        negPath += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }

    const lastX = toSvgX(totalLengthM);
    posPath += ` L ${lastX.toFixed(1)} ${yBmdZero} Z`;
    negPath += ` L ${lastX.toFixed(1)} ${yBmdZero} Z`;

    return { bmdPositivePath: posPath, bmdNegativePath: negPath, bmdLinePath: linePath };
  }, [diagramPoints, toSvgX, yBmdZero, momentScale, totalLengthM]);

  // Hover inspection handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgRelX = (mouseX / rect.width) * svgW;
    if (svgRelX >= xStart && svgRelX <= xEnd) {
      setHoverXRatio((svgRelX - xStart) / beamW);
    } else {
      setHoverXRatio(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverXRatio(null);
  };

  const hoverPoint = useMemo(() => {
    if (hoverXRatio === null || diagramPoints.length === 0) return null;
    const targetX = hoverXRatio * totalLengthM;
    let closest = diagramPoints[0];
    let minDiff = Infinity;
    for (const pt of diagramPoints) {
      const diff = Math.abs(pt.x - targetX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }
    return closest;
  }, [hoverXRatio, diagramPoints, totalLengthM]);

  // Support positions
  const xSupportA = toSvgX(0);
  const xSupportB = toSvgX(spanM);

  // Peak locations & clamping to prevent clipping off screen
  const maxDeflSvgX = Math.max(xStart + 45, Math.min(xEnd - 45, toSvgX(maxDeflectionPosM)));
  const maxDeflSvgY = yBeam + maxDeflectionMm * visualDeflScale;

  // Zero-shear crossing lines that project down into BMD
  const zeroCrossingsSvg = useMemo(() => {
    return analysis.zeroShearPositions.map((zX) => ({
      xM: zX,
      svgX: toSvgX(zX),
    }));
  }, [analysis.zeroShearPositions, toSvgX]);

  // Peak moment point
  const peakMomentPoint = useMemo(() => {
    if (diagramPoints.length === 0) return null;
    let peakPt = diagramPoints[0];
    let maxVal = -Infinity;
    for (const pt of diagramPoints) {
      if (Math.abs(pt.momentKNm) > maxVal) {
        maxVal = Math.abs(pt.momentKNm);
        peakPt = pt;
      }
    }
    return peakPt;
  }, [diagramPoints]);

  return (
    <div className="relative w-full select-none overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="h-auto max-h-[480px] w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Concrete / Foundation crosshatch pattern */}
          <pattern id="concreteHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke={c.textDim} strokeWidth="1.2" />
          </pattern>

          {/* Wall embedment hatch pattern */}
          <pattern id="wallEmbedHatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke={c.textDim} strokeWidth="1.5" />
            <line x1="0" y1="5" x2="10" y2="5" stroke={c.textDim} strokeWidth="0.8" opacity={0.5} />
          </pattern>

          {/* UDL chevron/hatch pattern */}
          <pattern id="udlHatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="1.4" />
          </pattern>

          {/* Linear metallic gradient for beam flanges & bar */}
          <linearGradient id="beamSteelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#64748b' : '#94a3b8'} />
            <stop offset="50%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#64748b'} />
          </linearGradient>

          {/* Arrow markers */}
          <marker id="arrowDownRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#ef4444" />
          </marker>
          <marker id="arrowDownAmber" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M 0 0 L 5 2.5 L 0 5 Z" fill="#f59e0b" />
          </marker>
          <marker id="arrowUpGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#10b981" />
          </marker>
          <marker id="arrowDim" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill={c.textDim} />
          </marker>
        </defs>

        {/* CAD Canvas Background & Grid */}
        <rect width={svgW} height={svgH} fill={c.bg} />

        {/* Engineering vertical grid lines */}
        {[100, 200, 300, 400, 500, 600, 700, 800].map((gx) => (
          <line key={`gx-${gx}`} x1={gx} y1={20} x2={gx} y2={svgH - 25} stroke={c.gridSubtle} strokeWidth="0.8" strokeDasharray="3 4" />
        ))}
        {[yBeam, ySfdZero, yBmdZero].map((gy, idx) => (
          <line key={`gy-${idx}`} x1={50} y1={gy} x2={svgW - 50} stroke={c.grid} strokeWidth="1" />
        ))}

        {/* ========================================================================= */}
        {/* SECTION 1: BEAM MODEL, SUPPORTS & DEFLECTION VIEW (y: 20 -> 230)          */}
        {/* ========================================================================= */}

        {/* Section title & total length */}
        <text x={xStart} y={26} fill={c.textDim} fontSize="10" fontWeight="bold" letterSpacing="0.08em">
          {pick('1. BEAM LOADING & ELASTICA DEFLECTION', '1. PEMBEBANAN BALOK & DEFLEKSI ELASTIS', '1. 梁荷重・たわみ弾性曲線')}
        </text>
        <text x={xEnd} y={26} textAnchor="end" fill={c.textDim} fontSize="10" fontFamily="monospace">
          L_tot: {totalLengthM.toFixed(2)} m ({material.name.split(' ')[0]})
        </text>

        {/* Undeformed Beam Body CAD Model */}
        {sectionShape === 'i-beam' ? (
          /* Realistic Flanged I-Beam Profile */
          <g>
            {/* Top Flange */}
            <rect x={xStart} y={yBeam - 8} width={beamW} height={4} fill="url(#beamSteelGrad)" stroke={c.beamStroke} strokeWidth="0.8" rx="0.5" />
            {/* Central Web */}
            <rect x={xStart} y={yBeam - 4} width={beamW} height={8} fill={c.beamWeb} stroke={c.beamStroke} strokeWidth="0.6" />
            {/* Bottom Flange */}
            <rect x={xStart} y={yBeam + 4} width={beamW} height={4} fill="url(#beamSteelGrad)" stroke={c.beamStroke} strokeWidth="0.8" rx="0.5" />
            {/* Neutral Axis Dashed Line */}
            <line x1={xStart} y1={yBeam} x2={xEnd} y2={yBeam} stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="4 3" opacity={0.7} />
          </g>
        ) : (
          /* Solid Bar / Circular Shaft Profile */
          <g>
            <rect x={xStart} y={yBeam - 7} width={beamW} height={14} fill="url(#beamSteelGrad)" stroke={c.beamStroke} strokeWidth="1" rx="1.5" />
            <line x1={xStart} y1={yBeam} x2={xEnd} y2={yBeam} stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4 3" opacity={0.7} />
          </g>
        )}

        {/* Live Exaggerated Elastic Deflection Ribbon */}
        {deflectedPathData && (
          <g>
            {/* Glow / envelope aura */}
            <path
              d={deflectedPathData}
              fill="none"
              stroke={getStressColor(analysis.maxStressMpa)}
              strokeWidth="5"
              strokeLinecap="round"
              opacity={0.3}
            />
            {/* Main high-resolution deflection line */}
            <path
              d={deflectedPathData}
              fill="none"
              stroke={getStressColor(analysis.maxStressMpa)}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Max Deflection Dimension & Callout */}
        {Math.abs(maxDeflectionMm) > 0.05 && (
          <g transform={`translate(${maxDeflSvgX}, ${Math.max(maxDeflSvgY, yBeam + 12)})`}>
            <line x1={0} y1={-(maxDeflectionMm * visualDeflScale)} x2={0} y2={0} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx={0} cy={0} r={3} fill="#f59e0b" />
            <g transform={`translate(0, ${maxDeflectionMm >= 0 ? 17 : -17})`}>
              <rect x="-48" y="-9" width="96" height="17" rx="3.5" fill={c.cardBg} stroke="#f59e0b" strokeWidth="1" className="shadow-xs" />
              <text x="0" y="3" textAnchor="middle" fill="#f59e0b" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                δ_max: {maxDeflectionMm.toFixed(2)}mm
              </text>
            </g>
          </g>
        )}

        {/* ----------------- SUPPORT A (Pin / Fixed Wall) ----------------- */}
        {beamType === 'cantilever' ? (
          /* Machined Cantilever Wall Embedment */
          <g transform={`translate(${xStart}, ${yBeam})`}>
            {/* Reinforced concrete wall block */}
            <rect x="-36" y="-38" width="36" height="76" fill="url(#wallEmbedHatch)" stroke={c.textDim} strokeWidth="1.5" />
            {/* Structural steel mounting embedment plate */}
            <line x1="0" y1="-38" x2="0" y2="38" stroke={c.textMain} strokeWidth="3.5" />
            {/* 4 Heavy Structural Anchor Bolts with Hex Heads */}
            {[-26, -10, 10, 26].map((boltY, i) => (
              <g key={`bolt-${i}`} transform={`translate(-10, ${boltY})`}>
                <rect x="-3" y="-3" width="6" height="6" fill={c.textDim} stroke={c.textMain} strokeWidth="0.8" rx="1" />
                <circle cx="0" cy="0" r="1.5" fill={c.textMain} />
              </g>
            ))}
            {/* Top & bottom stiffener gusset brackets */}
            <polygon points="0,-8 -12,-16 0,-24" fill={c.beamFlange} stroke={c.beamStroke} strokeWidth="0.8" />
            <polygon points="0,8 -12,16 0,24" fill={c.beamFlange} stroke={c.beamStroke} strokeWidth="0.8" />
          </g>
        ) : (
          /* Machined Clevis Pin Support at x = 0 */
          <g transform={`translate(${xSupportA}, ${yBeam + 8})`}>
            {/* Bronze bushing & center pivot pin */}
            <circle cx="0" cy="0" r="4.5" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2" fill="#d97706" />
            {/* Structural steel clevis bracket with weight-reduction hole */}
            <polygon points="0,4 -14,24 14,24" fill={c.beamFlange} stroke={c.textMain} strokeWidth="1.4" />
            <circle cx="0" cy="16" r="3.2" fill={c.bg} stroke={c.textDim} strokeWidth="0.8" />
            {/* Baseplate with anchor bolts */}
            <rect x="-18" y="24" width="36" height="4" fill={c.beamFlange} stroke={c.textMain} strokeWidth="1.2" rx="0.5" />
            <circle cx="-12" cy="26" r="1.2" fill={c.textMain} />
            <circle cx="12" cy="26" r="1.2" fill={c.textMain} />
            {/* Concrete foundation hatch */}
            <rect x="-18" y="28" width="36" height="8" fill="url(#concreteHatch)" />
            {/* Support tag */}
            <text x="-22" y="16" textAnchor="end" fill={c.textDim} fontSize="9" fontWeight="bold">
              A
            </text>
          </g>
        )}

        {/* ----------------- SUPPORT B (Roller Support) ----------------- */}
        {beamType !== 'cantilever' && (
          <g transform={`translate(${xSupportB}, ${yBeam + 8})`}>
            {/* Pivot pin & bronze bushing */}
            <circle cx="0" cy="0" r="4.5" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="2" fill="#d97706" />
            {/* Clevis bracket */}
            <polygon points="0,4 -13,17 13,17" fill={c.beamFlange} stroke={c.textMain} strokeWidth="1.4" />
            {/* 3 Hardened Ground Steel Roller Bearings */}
            <circle cx="-7.5" cy="20.5" r="3.2" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.2" />
            <circle cx="0" cy="20.5" r="3.2" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.2" />
            <circle cx="7.5" cy="20.5" r="3.2" fill={c.cardBg} stroke={c.textMain} strokeWidth="1.2" />
            {/* Ground guide rail bed with stops */}
            <rect x="-18" y="24" width="36" height="4" fill={c.beamFlange} stroke={c.textMain} strokeWidth="1.2" rx="0.5" />
            <circle cx="-12" cy="26" r="1.2" fill={c.textMain} />
            <circle cx="12" cy="26" r="1.2" fill={c.textMain} />
            {/* Concrete foundation hatch */}
            <rect x="-18" y="28" width="36" height="8" fill="url(#concreteHatch)" />
            {/* Support tag */}
            <text x="22" y="16" fill={c.textDim} fontSize="9" fontWeight="bold">
              B
            </text>
          </g>
        )}

        {/* ----------------- APPLIED LOADS RENDERING ----------------- */}

        {/* UDL (Uniformly Distributed Load) */}
        {(loadType === 'udl' || loadType === 'combined') && udlKnM > 0 && (
          (() => {
            const xUdl1 = toSvgX(udlStartM);
            const xUdl2 = toSvgX(udlEndM);
            const udlWidth = Math.max(12, xUdl2 - xUdl1);
            const numArrows = Math.max(3, Math.min(18, Math.round(udlWidth / 22)));
            const step = udlWidth / (numArrows - 1);
            const loadYTop = yBeam - 36;
            const badgeCenterX = Math.max(xStart + 45, Math.min(xEnd - 45, (xUdl1 + xUdl2) / 2));

            return (
              <g>
                {/* UDL hatch fill */}
                <rect x={xUdl1} y={loadYTop} width={udlWidth} height={28} fill="url(#udlHatch)" opacity={0.85} />
                {/* Top load distributor rail */}
                <line x1={xUdl1} y1={loadYTop} x2={xUdl2} y2={loadYTop} stroke="#f59e0b" strokeWidth="2.2" />

                {/* Downward distributed arrows */}
                {Array.from({ length: numArrows }).map((_, i) => {
                  const ax = xUdl1 + i * step;
                  return (
                    <line
                      key={`udl-arr-${i}`}
                      x1={ax}
                      y1={loadYTop}
                      x2={ax}
                      y2={yBeam - 9}
                      stroke="#f59e0b"
                      strokeWidth="1.4"
                      markerEnd="url(#arrowDownAmber)"
                    />
                  );
                })}

                {/* UDL Callout Pill Badge */}
                <g transform={`translate(${badgeCenterX}, ${loadYTop - 9})`}>
                  <rect x="-42" y="-10" width="84" height="17" rx="3.5" fill={c.cardBg} stroke="#f59e0b" strokeWidth="1" className="shadow-xs" />
                  <text x="0" y="2" textAnchor="middle" fill="#f59e0b" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                    w: {udlKnM.toFixed(1)} kN/m
                  </text>
                </g>
              </g>
            );
          })()
        )}

        {/* Concentrated Point Load */}
        {(loadType === 'point' || loadType === 'combined') && pointLoadKn > 0 && (
          (() => {
            const pSvgX = toSvgX(pointLoadPosM);
            const badgeXClamped = Math.max(xStart + 40, Math.min(xEnd - 40, pSvgX));
            return (
              <g>
                {/* Vertical force arrow */}
                <line x1={pSvgX} y1={yBeam - 45} x2={pSvgX} y2={yBeam - 9} stroke="#ef4444" strokeWidth="2.6" markerEnd="url(#arrowDownRed)" />
                {/* Hydraulic actuator pad */}
                <rect x={pSvgX - 6} y={yBeam - 47} width={12} height={4} fill="#ef4444" rx="1" />
                {/* Force Callout Pill Badge */}
                <g transform={`translate(${badgeXClamped}, ${yBeam - 56})`}>
                  <rect x="-38" y="-10" width="76" height="17" rx="3.5" fill={c.cardBg} stroke="#ef4444" strokeWidth="1.2" className="shadow-xs" />
                  <text x="0" y="2" textAnchor="middle" fill="#ef4444" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                    P: {pointLoadKn.toFixed(1)} kN
                  </text>
                </g>
              </g>
            );
          })()
        )}

        {/* ----------------- REACTION FORCES CALLOUTS ----------------- */}

        {/* Reaction R_A (Support A) */}
        {(() => {
          const rxPosA = Math.max(xStart + 35, xSupportA);
          const isUpA = reactions.rAKn >= 0;
          return (
            <g transform={`translate(${rxPosA}, ${yBeam + (beamType === 'cantilever' ? 24 : 38)})`}>
              <line
                x1="0"
                y1={isUpA ? 26 : 0}
                x2="0"
                y2={isUpA ? 0 : 26}
                stroke={isUpA ? '#10b981' : '#f59e0b'}
                strokeWidth="2.2"
                markerEnd={isUpA ? 'url(#arrowUpGreen)' : 'url(#arrowDownAmber)'}
              />
              <g transform="translate(0, 36)">
                <rect
                  x="-38"
                  y="-10"
                  width="76"
                  height="18"
                  rx="4"
                  fill={c.cardBg}
                  stroke={isUpA ? '#10b981' : '#f59e0b'}
                  strokeWidth="1"
                  className="shadow-xs"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill={isUpA ? '#10b981' : '#f59e0b'}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  R_A: {reactions.rAKn.toFixed(1)} kN
                </text>
              </g>
            </g>
          );
        })()}

        {/* Cantilever Clamping Reaction Moment M_A */}
        {beamType === 'cantilever' && reactions.mAKNm > 0 && (
          <g transform={`translate(${xStart - 18}, ${yBeam - 16})`}>
            {/* Curved counter-clockwise torque moment arrow */}
            <path
              d="M 8 -14 A 18 18 0 1 0 -14 8"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.2"
              markerEnd="url(#arrowDownRed)"
            />
            <g transform="translate(-24, -20)">
              <rect x="-42" y="-10" width="84" height="18" rx="4" fill={c.cardBg} stroke="#8b5cf6" strokeWidth="1" className="shadow-xs" />
              <text x="0" y="3" textAnchor="middle" fill="#8b5cf6" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                M_A: {reactions.mAKNm.toFixed(1)} kNm
              </text>
            </g>
          </g>
        )}

        {/* Reaction R_B (Support B) */}
        {beamType !== 'cantilever' && (
          (() => {
            const rxPosB = Math.min(xEnd - 35, xSupportB);
            const isUpB = reactions.rBKn >= 0;
            return (
              <g transform={`translate(${rxPosB}, ${yBeam + 38})`}>
                <line
                  x1="0"
                  y1={isUpB ? 26 : 0}
                  x2="0"
                  y2={isUpB ? 0 : 26}
                  stroke={isUpB ? '#10b981' : '#f59e0b'}
                  strokeWidth="2.2"
                  markerEnd={isUpB ? 'url(#arrowUpGreen)' : 'url(#arrowDownAmber)'}
                />
                <g transform="translate(0, 36)">
                  <rect
                    x="-38"
                    y="-10"
                    width="76"
                    height="18"
                    rx="4"
                    fill={c.cardBg}
                    stroke={isUpB ? '#10b981' : '#f59e0b'}
                    strokeWidth="1"
                    className="shadow-xs"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isUpB ? '#10b981' : '#f59e0b'}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    R_B: {reactions.rBKn.toFixed(1)} kN
                  </text>
                </g>
              </g>
            );
          })()
        )}

        {/* Span Dimension Line (L) */}
        <g transform={`translate(0, ${yBeam + 88})`}>
          <line x1={xStart} y1="0" x2={xSupportB} y2="0" stroke={c.textDim} strokeWidth="1" markerStart="url(#arrowDim)" markerEnd="url(#arrowDim)" />
          <line x1={xStart} y1="-5" x2={xStart} y2="5" stroke={c.textDim} strokeWidth="1" />
          <line x1={xSupportB} y1="-5" x2={xSupportB} y2="5" stroke={c.textDim} strokeWidth="1" />
          <text x={(xStart + xSupportB) / 2} y="-4" textAnchor="middle" fill={c.textDim} fontSize="8.5" fontFamily="monospace">
            L = {spanM.toFixed(2)} m
          </text>
        </g>

        {/* Overhang Dimension Line (a) */}
        {beamType === 'overhanging' && (
          <g transform={`translate(0, ${yBeam + 88})`}>
            <line x1={xSupportB} y1="0" x2={xEnd} y2="0" stroke={c.textDim} strokeWidth="1" markerStart="url(#arrowDim)" markerEnd="url(#arrowDim)" />
            <line x1={xEnd} y1="-5" x2={xEnd} y2="5" stroke={c.textDim} strokeWidth="1" />
            <text x={(xSupportB + xEnd) / 2} y="-4" textAnchor="middle" fill={c.textDim} fontSize="8.5" fontFamily="monospace">
              a = {(totalLengthM - spanM).toFixed(2)} m
            </text>
          </g>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: SHEAR FORCE DIAGRAM (SFD) V(x) [kN] (y: 250 -> 400)            */}
        {/* ========================================================================= */}

        {/* Section title & Y-Axis Scale */}
        <text x={xStart} y={252} fill={c.textDim} fontSize="10" fontWeight="bold" letterSpacing="0.08em">
          {pick('2. SHEAR FORCE DIAGRAM (SFD) — V(x) [kN]', '2. DIAGRAM GAYA GESER (SFD) — V(x) [kN]', '2. せん断力図 (SFD) — V(x) [kN]')}
        </text>

        {/* Baseline (V = 0) */}
        <line x1={xStart} y1={ySfdZero} x2={xEnd} y2={ySfdZero} stroke={c.axis} strokeWidth="1.2" strokeDasharray="4 2" />
        <text x={xStart - 10} y={ySfdZero + 3} textAnchor="end" fill={c.axisText} fontSize="9" fontFamily="monospace">
          0
        </text>

        {/* Upper & Lower Bound ticks */}
        <line x1={xStart - 4} y1={ySfdZero - sfdHalfHeight} x2={xStart} y2={ySfdZero - sfdHalfHeight} stroke={c.axis} strokeWidth="1" />
        <text x={xStart - 10} y={ySfdZero - sfdHalfHeight + 3} textAnchor="end" fill="#10b981" fontSize="8.5" fontFamily="monospace">
          +{absMaxShearKn.toFixed(1)}
        </text>

        <line x1={xStart - 4} y1={ySfdZero + sfdHalfHeight} x2={xStart} y2={ySfdZero + sfdHalfHeight} stroke={c.axis} strokeWidth="1" />
        <text x={xStart - 10} y={ySfdZero + sfdHalfHeight + 3} textAnchor="end" fill="#f43f5e" fontSize="8.5" fontFamily="monospace">
          -{absMaxShearKn.toFixed(1)}
        </text>

        {/* SFD Filled Polygons */}
        <path d={sfdPositivePath} fill={c.sfdPosFill} />
        <path d={sfdNegativePath} fill={c.sfdNegFill} />

        {/* SFD Crisp Curve Line */}
        <path d={sfdLinePath} fill="none" stroke={c.textMain} strokeWidth="2" strokeLinejoin="miter" />

        {/* Peak Shear Callout Badges with zero overlap clamping */}
        {analysis.maxShearKn > 0.05 && (
          <g transform={`translate(${Math.min(xEnd - 45, xStart + 45)}, ${ySfdZero - analysis.maxShearKn * shearScale - 8})`}>
            <rect x="-32" y="-9" width="64" height="15" rx="3.5" fill={c.cardBg} stroke="#10b981" strokeWidth="1" className="shadow-xs" />
            <text x="0" y="2" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">
              +{analysis.maxShearKn.toFixed(1)} kN
            </text>
          </g>
        )}
        {analysis.minShearKn < -0.05 && (
          <g transform={`translate(${Math.max(xStart + 45, xEnd - 45)}, ${ySfdZero - analysis.minShearKn * shearScale + 12})`}>
            <rect x="-32" y="-9" width="64" height="15" rx="3.5" fill={c.cardBg} stroke="#f43f5e" strokeWidth="1" className="shadow-xs" />
            <text x="0" y="2" textAnchor="middle" fill="#f43f5e" fontSize="8" fontWeight="bold" fontFamily="monospace">
              {analysis.minShearKn.toFixed(1)} kN
            </text>
          </g>
        )}

        {/* Zero-Shear Vertical Guidelines to BMD (Highlighting Peak Moments!) */}
        {zeroCrossingsSvg.map(({ xM, svgX }, idx) => (
          <g key={`zc-${idx}`}>
            <line x1={svgX} y1={ySfdZero - 22} x2={svgX} y2={yBmdZero + 45} stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="3 3" opacity={0.7} />
            <circle cx={svgX} cy={ySfdZero} r="3" fill="#3b82f6" />
            <rect x={svgX - 24} y={ySfdZero + 4} width="48" height="13" rx="2.5" fill={c.cardBg} stroke="#3b82f6" strokeWidth="0.8" />
            <text x={svgX} y={ySfdZero + 13} textAnchor="middle" fill="#3b82f6" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
              V=0 @{xM}m
            </text>
          </g>
        ))}

        {/* ========================================================================= */}
        {/* SECTION 3: BENDING MOMENT DIAGRAM (BMD) M(x) [kN*m] (y: 420 -> 560)       */}
        {/* ========================================================================= */}

        {/* Section title & Y-Axis Scale */}
        <text x={xStart} y={426} fill={c.textDim} fontSize="10" fontWeight="bold" letterSpacing="0.08em">
          {pick('3. BENDING MOMENT DIAGRAM (BMD) — M(x) [kN·m]', '3. DIAGRAM MOMEN LENTUR (BMD) — M(x) [kN·m]', '3. 曲げモーメント図 (BMD) — M(x) [kN·m]')}
        </text>

        {/* Baseline (M = 0) */}
        <line x1={xStart} y1={yBmdZero} x2={xEnd} y2={yBmdZero} stroke={c.axis} strokeWidth="1.2" strokeDasharray="4 2" />
        <text x={xStart - 10} y={yBmdZero + 3} textAnchor="end" fill={c.axisText} fontSize="9" fontFamily="monospace">
          0
        </text>

        {/* Limits */}
        <line x1={xStart - 4} y1={yBmdZero - bmdHalfHeight} x2={xStart} y2={yBmdZero - bmdHalfHeight} stroke={c.axis} strokeWidth="1" />
        <text x={xStart - 10} y={yBmdZero - bmdHalfHeight + 3} textAnchor="end" fill="#3b82f6" fontSize="8.5" fontFamily="monospace">
          +{absMaxMomentKNm.toFixed(1)}
        </text>

        <line x1={xStart - 4} y1={yBmdZero + bmdHalfHeight} x2={xStart} y2={yBmdZero + bmdHalfHeight} stroke={c.axis} strokeWidth="1" />
        <text x={xStart - 10} y={yBmdZero + bmdHalfHeight + 3} textAnchor="end" fill="#f59e0b" fontSize="8.5" fontFamily="monospace">
          -{absMaxMomentKNm.toFixed(1)}
        </text>

        {/* BMD Filled Areas */}
        <path d={bmdPositivePath} fill={c.bmdPosFill} />
        <path d={bmdNegativePath} fill={c.bmdNegFill} />

        {/* BMD Crisp Curve Line */}
        <path d={bmdLinePath} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinejoin="round" />

        {/* Peak Moment Callout Marker with Boundary Protection */}
        {peakMomentPoint && Math.abs(peakMomentPoint.momentKNm) > 0.05 && (
          (() => {
            const pSvgX = toSvgX(peakMomentPoint.x);
            const clampedPillX = Math.max(xStart + 45, Math.min(xEnd - 45, pSvgX));
            const pSvgY = yBmdZero - peakMomentPoint.momentKNm * momentScale;
            const isSagging = peakMomentPoint.momentKNm >= 0;

            return (
              <g>
                <circle cx={pSvgX} cy={pSvgY} r="4" fill="#2563eb" stroke={c.cardBg} strokeWidth="1.5" />
                <g transform={`translate(${clampedPillX}, ${isSagging ? pSvgY - 14 : pSvgY + 14})`}>
                  <rect x="-46" y="-10" width="92" height="18" rx="4" fill={c.cardBg} stroke="#2563eb" strokeWidth="1.2" className="shadow-xs" />
                  <text x="0" y="3" textAnchor="middle" fill="#2563eb" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                    M_max: {peakMomentPoint.momentKNm.toFixed(1)} kNm
                  </text>
                </g>
              </g>
            );
          })()
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: REAL-TIME INSPECTION CROSSHAIR & HEADS-UP DISPLAY HUD          */}
        {/* ========================================================================= */}
        {hoverPoint && (
          <g>
            {/* Tracking Hairline */}
            <line
              x1={toSvgX(hoverPoint.x)}
              y1={32}
              x2={toSvgX(hoverPoint.x)}
              y2={svgH - 32}
              stroke="#8b5cf6"
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
            {/* Live Crosshair Dots on Beam, SFD, BMD */}
            <circle cx={toSvgX(hoverPoint.x)} cy={yBeam + hoverPoint.deflectionMm * visualDeflScale} r="4" fill="#f59e0b" />
            <circle cx={toSvgX(hoverPoint.x)} cy={ySfdZero - hoverPoint.shearKn * shearScale} r="4" fill="#10b981" />
            <circle cx={toSvgX(hoverPoint.x)} cy={yBmdZero - hoverPoint.momentKNm * momentScale} r="4" fill="#2563eb" />

            {/* Heads-up Display Floating Banner */}
            {(() => {
              const tipX = Math.min(Math.max(toSvgX(hoverPoint.x), xStart + 120), xEnd - 120);
              const tipY = svgH - 18;
              return (
                <g transform={`translate(${tipX}, ${tipY})`}>
                  <rect
                    x="-135"
                    y="-11"
                    width="270"
                    height="22"
                    rx="5"
                    fill={c.cardBg}
                    stroke="#8b5cf6"
                    strokeWidth="1.4"
                    className="shadow-sm"
                  />
                  <text x="0" y="3" textAnchor="middle" fill={c.textMain} fontSize="9" fontWeight="bold" fontFamily="monospace">
                    x:{hoverPoint.x.toFixed(2)}m | V:{hoverPoint.shearKn.toFixed(1)}kN | M:{hoverPoint.momentKNm.toFixed(1)}kNm | σ:{hoverPoint.bendingStressMpa.toFixed(1)}MPa
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}
