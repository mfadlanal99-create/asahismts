import { useId, useMemo, type FC } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  type BarExpansionInputs,
  type BarExpansionResults,
  type BimetallicStripInputs,
  type BimetallicStripResults,
  type ShrinkFitInputs,
  type ShrinkFitResults,
  type SimulatorMode,
} from './thermalExpansionData';

interface ThermalExpansionSvgProps {
  mode: SimulatorMode;
  barData?: { inputs: BarExpansionInputs; results: BarExpansionResults };
  shrinkData?: { inputs: ShrinkFitInputs; results: ShrinkFitResults };
  bimetalData?: { inputs: BimetallicStripInputs; results: BimetallicStripResults };
}

interface ThermalVisuals {
  tintHex: string;
  glowHex: string;
  glowOpacity: number;
  isCold: boolean;
  isHot: boolean;
  badgeColor: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpRgb(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Smoothly interpolate metallic surface thermal tint from cryo blue (-50°C) -> steel (20°C) -> amber (150°C) -> cherry red (500°C) */
function getThermalVisuals(tempC: number, baseHex: string): ThermalVisuals {
  if (tempC < 10) {
    const t = Math.min(1, (10 - tempC) / 60);
    return {
      tintHex: lerpRgb([148, 163, 184], [56, 189, 248], t),
      glowHex: '#38bdf8',
      glowOpacity: 0.15 + t * 0.45,
      isCold: true,
      isHot: false,
      badgeColor: '#0284c7',
    };
  }
  if (tempC <= 40) {
    return {
      tintHex: baseHex,
      glowHex: '#94a3b8',
      glowOpacity: 0,
      isCold: false,
      isHot: false,
      badgeColor: '#64748b',
    };
  }
  if (tempC <= 180) {
    const t = (tempC - 40) / 140;
    return {
      tintHex: lerpRgb([168, 162, 158], [245, 158, 11], t),
      glowHex: '#f59e0b',
      glowOpacity: 0.12 + t * 0.35,
      isCold: false,
      isHot: true,
      badgeColor: '#d97706',
    };
  }
  const t = Math.min(1, (tempC - 180) / 320);
  return {
    tintHex: lerpRgb([245, 158, 11], [239, 68, 68], t),
    glowHex: '#ef4444',
    glowOpacity: 0.45 + t * 0.45,
    isCold: false,
    isHot: true,
    badgeColor: '#dc2626',
  };
}

/** Soft-saturating displacement mapping (mm -> SVG px) so small expansions are clearly visible and extremes never clip */
function mapDispToPx(mm: number): number {
  const abs = Math.abs(mm);
  if (mm >= 0) {
    return Math.min(96, 20 * Math.log1p(abs * 2.2));
  }
  return -Math.min(34, 16 * Math.log1p(abs * 2.2));
}

export const ThermalExpansionSvg: FC<ThermalExpansionSvgProps> = ({
  mode,
  barData,
  shrinkData,
  bimetalData,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const uid = useId().replace(/:/g, '');

  // Shared CAD Theme Palette
  const bgCanvas = 'var(--md-surface-container-lowest)';
  const gridMinor = 'var(--md-surface-container)';
  const gridMajor = 'var(--md-surface-container-high)';
  const strokeMain = 'var(--md-outline)';
  const strokeMuted = 'var(--md-outline-variant)';
  const textPrimary = 'var(--md-on-surface)';
  const textSecondary = 'var(--md-on-surface-variant)';
  const panelBg = 'var(--md-surface-container)';
  const panelBorder = 'var(--md-outline-variant)';

  // ---------------------------------------------------------------------------
  // MODE 1: Precision Thermal Dilatometer & Restrained Stress Test Bed
  // ---------------------------------------------------------------------------
  const barSvg = useMemo(() => {
    if (!barData) return null;
    const { inputs, results } = barData;
    const visuals = getThermalVisuals(inputs.currentTempC, inputs.material.color);

    const xAnchor = 132;
    const barCenterY = 220;
    const barH = 26 + ((inputs.diameterMm - 10) / 90) * 28; // 26..54 px
    const barTopY = barCenterY - barH / 2;
    const barBotY = barCenterY + barH / 2;
    const baseLenPx = 360;
    const baseEndX = xAnchor + baseLenPx; // 492

    const gapPx = inputs.isConstrained ? mapDispToPx(inputs.gapMm) : 0;
    const wallX = baseEndX + gapPx; // 492..588

    let barEndX = baseEndX;
    if (inputs.isConstrained) {
      if (results.isContactingWall) {
        barEndX = wallX;
      } else {
        const freeEnd = baseEndX + mapDispToPx(results.freeExpansionMm);
        barEndX = results.freeExpansionMm > 0 ? Math.min(wallX - 1.5, freeEnd) : freeEnd;
      }
    } else {
      barEndX = baseEndX + mapDispToPx(results.freeExpansionMm);
    }

    const dialRotationDeg = results.actualExpansionMm * 144; // 2.5 mm = 1 full revolution
    const stressRatio = Math.min(1, results.thermalStressMpa / Math.max(1, inputs.material.yieldStrengthMpa));

    return {
      xAnchor,
      barCenterY,
      barH,
      barTopY,
      barBotY,
      baseLenPx,
      baseEndX,
      gapPx,
      wallX,
      barEndX,
      visuals,
      dialRotationDeg,
      stressRatio,
      inputs,
      results,
    };
  }, [barData]);

  // ---------------------------------------------------------------------------
  // MODE 2: Shrink Fit Hub-on-Shaft Cross Section & Elevation
  // ---------------------------------------------------------------------------
  const shrinkSvg = useMemo(() => {
    if (!shrinkData) return null;
    const { inputs, results } = shrinkData;
    const hubTempC = 20 + inputs.heatingDeltaTC;
    const hubVisuals = getThermalVisuals(hubTempC, inputs.hubMaterial.color);

    const cX = 225;
    const cY = 225;
    const rShaft = 54;
    const ratio = inputs.hubOuterDiameterMm / Math.max(1, inputs.shaftDiameterMm);
    const rHubOuter = Math.min(122, Math.max(76, rShaft * Math.min(2.3, ratio)));

    // Radial assembly clearance (when heated past min deltaT)
    const clearanceGapPx = results.canSlipFit
      ? 3 + Math.min(12, results.assemblyClearanceMm * 110)
      : 0;
    const rHubInner = rShaft + clearanceGapPx;

    // Right longitudinal half-section engagement length
    const elevL = Math.min(180, Math.max(76, (inputs.engagementLengthMm / 300) * 180));
    const hubLeftX = 675 - elevL / 2;
    const hubRightX = 675 + elevL / 2;

    const pressureRatio = Math.min(1, results.hubInnerVonMisesStressMpa / Math.max(1, inputs.hubMaterial.yieldStrengthMpa));

    return {
      cX,
      cY,
      rShaft,
      rHubInner,
      rHubOuter,
      clearanceGapPx,
      elevL,
      hubLeftX,
      hubRightX,
      hubTempC,
      hubVisuals,
      pressureRatio,
      inputs,
      results,
    };
  }, [shrinkData]);

  // ---------------------------------------------------------------------------
  // MODE 3: Timoshenko Bimetallic Thermostat Strip (Exact Circular Arc)
  // ---------------------------------------------------------------------------
  const bimetalSvg = useMemo(() => {
    if (!bimetalData) return null;
    const { inputs, results } = bimetalData;
    const visuals = getThermalVisuals(inputs.currentTempC, '#94a3b8');

    const startX = 126;
    const startY = 212;
    const stripLenPx = 250 + ((inputs.lengthMm - 40) / 210) * 145; // 250..395 px (always clear of switch post at x=614)
    const t1Px = 6 + inputs.layer1ThicknessMm * 4.5;
    const t2Px = 6 + inputs.layer2ThicknessMm * 4.5;

    // Visual tip deflection mapped gracefully so arc stays inside viewBox
    const pxPerMm = 9.5;
    const rawDeflPx = results.tipDeflectionMm * pxPerMm;
    const switchGapPx = Math.min(82, inputs.switchGapMm * pxPerMm);
    const contactY = Math.min(314, startY + t2Px + switchGapPx);
    // Physically stop downward deflection at the silver contact screw when closed
    const maxDownDeflPx = results.isSwitchClosed ? contactY - startY - t2Px : 102;
    const deflPx = Math.max(-100, Math.min(maxDownDeflPx, rawDeflPx));

    // Convert tip deflection into circular arc subtended angle theta:
    // For shallow/moderate arc: delta_tip = L * (1 - cos(theta)) / theta ≈ L * theta / 2 => theta ≈ 2 * defl / L
    const thetaVis = (2 * deflPx) / stripLenPx;
    const steps = 36;

    const topPts: Array<[number, number]> = [];
    const midPts: Array<[number, number]> = [];
    const botPts: Array<[number, number]> = [];

    for (let i = 0; i <= steps; i++) {
      const s = i / steps;
      let cx: number;
      let cy: number;
      let nx: number;
      let ny: number;

      if (Math.abs(thetaVis) < 0.002) {
        cx = startX + s * stripLenPx;
        cy = startY;
        nx = 0;
        ny = 1;
      } else {
        const R = stripLenPx / thetaVis;
        const phi = s * thetaVis;
        cx = startX + R * Math.sin(phi);
        cy = startY + R * (1 - Math.cos(phi));
        nx = -Math.sin(phi);
        ny = Math.cos(phi);
      }

      topPts.push([cx - nx * t1Px, cy - ny * t1Px]);
      midPts.push([cx, cy]);
      botPts.push([cx + nx * t2Px, cy + ny * t2Px]);
    }

    const toPath = (upper: Array<[number, number]>, lower: Array<[number, number]>) => {
      const fwd = upper.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
      const rev = [...lower]
        .reverse()
        .map((p) => `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
        .join(' ');
      return `${fwd} ${rev} Z`;
    };

    const layer1Path = toPath(topPts, midPts);
    const layer2Path = toPath(midPts, botPts);
    const interfacePath = midPts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');

    const tipPt = midPts[midPts.length - 1];
    const tipBotPt = botPts[botPts.length - 1];

    return {
      startX,
      startY,
      stripLenPx,
      t1Px,
      t2Px,
      layer1Path,
      layer2Path,
      interfacePath,
      tipPt,
      tipBotPt,
      deflPx,
      contactY,
      switchGapPx,
      visuals,
      inputs,
      results,
    };
  }, [bimetalData]);

  // Mode header metadata
  const headerInfo = useMemo(() => {
    if (mode === 'bar-constraint' && barSvg) {
      return {
        title: 'ISO Thermal Dilatometer & Restrained Stress Test Bed',
        subtitle: `${barSvg.inputs.material.name} · α = ${barSvg.inputs.material.alpha} × 10⁻⁶ / °C`,
        legend: [
          { color: '#38bdf8', label: 'Cryo (<10°C)' },
          { color: '#94a3b8', label: 'Ambient (20°C)' },
          { color: '#f59e0b', label: 'Heated' },
          { color: '#ef4444', label: 'Compressive Stress / Peak' },
        ],
      };
    }
    if (mode === 'shrink-fit' && shrinkSvg) {
      return {
        title: 'DIN 7190 Shrink Fit Bore Section & Shaft Assembly',
        subtitle: `Shaft: ${shrinkSvg.inputs.shaftMaterial.name.split(' ')[0]} · Hub: ${shrinkSvg.inputs.hubMaterial.name.split(' ')[0]}`,
        legend: [
          { color: '#10b981', label: 'Assembly Clearance (Slip-On)' },
          { color: '#ef4444', label: 'Lamé Contact Pressure (p_c)' },
          { color: '#f97316', label: 'Induction Hub Heat' },
        ],
      };
    }
    return {
      title: 'Timoshenko Bimetallic Thermostat Cantilever Fixture',
      subtitle: bimetalSvg
        ? `${bimetalSvg.inputs.layer1Material.name.split(' ')[0]} (α=${bimetalSvg.inputs.layer1Material.alpha}) / ${bimetalSvg.inputs.layer2Material.name.split(' ')[0]} (α=${bimetalSvg.inputs.layer2Material.alpha})`
        : '',
      legend: [
        { color: bimetalSvg?.inputs.layer1Material.color ?? '#eab308', label: 'Layer 1 (Top)' },
        { color: bimetalSvg?.inputs.layer2Material.color ?? '#a855f7', label: 'Layer 2 (Bottom)' },
        { color: '#ef4444', label: 'Circuit Tripped' },
      ],
    };
  }, [mode, barSvg, shrinkSvg, bimetalSvg]);

  return (
    <div data-tour="thermal-canvas" className="glass-panel overflow-hidden rounded-[28px]">
      {/* Clean HTML CAD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            {headerInfo.title}
          </span>
          <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-0.5 text-[11px] font-semibold text-[var(--md-on-primary-container)]">
            {headerInfo.subtitle}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          {headerInfo.legend.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-[var(--md-on-surface-variant)]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox="0 0 900 460"
        className="mx-auto block max-h-[480px] w-full select-none"
        fontFamily="var(--font-sans)"
        style={{ backgroundColor: bgCanvas }}
      >
        <defs>
          {/* Precision CAD Millimeter Grid */}
          <pattern id={`gridMinor-${uid}`} width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M 15 0 L 0 0 0 15" fill="none" stroke={gridMinor} strokeWidth="0.6" strokeOpacity="0.6" />
          </pattern>
          <pattern id={`gridMajor-${uid}`} width="75" height="75" patternUnits="userSpaceOnUse">
            <rect width="75" height="75" fill={`url(#gridMinor-${uid})`} />
            <path d="M 75 0 L 0 0 0 75" fill="none" stroke={gridMajor} strokeWidth="1" strokeOpacity="0.7" />
          </pattern>

          {/* ISO 45° Section Hatching (Left/Rigid Supports) */}
          <pattern id={`hatch45-${uid}`} width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke={strokeMuted} strokeWidth="1.4" strokeOpacity="0.45" />
          </pattern>

          {/* ISO -45° Opposing Section Hatching (Hub Cross Section) */}
          <pattern id={`hatchNeg45-${uid}`} width="9" height="9" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="9" stroke={isDark ? '#cbd5e1' : '#334155'} strokeWidth="1.3" strokeOpacity="0.32" />
          </pattern>

          {/* Cast Iron Test Bed Gradient */}
          <linearGradient id={`castIron-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#334155' : '#94a3b8'} />
            <stop offset="18%" stopColor={isDark ? '#1e293b' : '#64748b'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#475569'} />
          </linearGradient>

          {/* Machined Steel Block Gradient */}
          <linearGradient id={`steelBlock-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
          </linearGradient>

          {/* Chrome Cylinder Highlight (LVDT stem, shafts) */}
          <linearGradient id={`chromeCyl-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="28%" stopColor="#f8fafc" />
            <stop offset="55%" stopColor="#cbd5e1" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Bronze Roller / Brass Gradient */}
          <linearGradient id={`bronzeGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="45%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Radial Shaft Gradient */}
          <radialGradient id={`shaftRad-${uid}`} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor={isDark ? '#94a3b8' : '#f1f5f9'} />
            <stop offset="65%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#94a3b8'} />
          </radialGradient>

          {/* Dynamic Specimen Cylindrical Gradient (Mode 1) */}
          {barSvg && (
            <linearGradient id={`barCyl-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barSvg.visuals.tintHex} stopOpacity="0.85" />
              <stop offset="28%" stopColor="#ffffff" stopOpacity={isDark ? 0.35 : 0.65} />
              <stop offset="32%" stopColor={barSvg.visuals.tintHex} stopOpacity="0.9" />
              <stop offset="78%" stopColor={barSvg.visuals.tintHex} stopOpacity="1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.45" />
            </linearGradient>
          )}

          {/* Stress Concentration Overlay Gradient (Mode 1) */}
          {barSvg && (
            <linearGradient id={`stressWave-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18 + barSvg.stressRatio * 0.25} />
              <stop offset="70%" stopColor="#ef4444" stopOpacity={0.35 + barSvg.stressRatio * 0.35} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6 + barSvg.stressRatio * 0.3} />
            </linearGradient>
          )}

          {/* Thermal Glow Filter */}
          <filter id={`glow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle Drop Shadow */}
          <filter id={`shadow-${uid}`} x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.22" />
          </filter>

          {/* Precision Arrowhead Markers */}
          <marker id={`arrowRed-${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ef4444" />
          </marker>
          <marker id={`arrowOrange-${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f97316" />
          </marker>
          <marker id={`arrowGreen-${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
          </marker>
          <marker id={`arrowDim-${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={textSecondary} />
          </marker>
        </defs>

        {/* Background Grid */}
        <rect width="900" height="460" fill={`url(#gridMajor-${uid})`} />

        {/* ===================================================================== */}
        {/* MODE 1: PRECISION DILATOMETER & RESTRAINED THERMAL STRESS BENCH       */}
        {/* ===================================================================== */}
        {mode === 'bar-constraint' && barSvg && (
          <g id="mode-bar-constraint">
            {/* Datum Floor Shadow Line */}
            <line x1="28" y1="354" x2="872" y2="354" stroke={gridMajor} strokeWidth="2" />

            {/* Cast-Iron Test Bed Baseplate with T-Slot */}
            <g filter={`url(#shadow-${uid})`}>
              {/* Leveling Feet */}
              <rect x="64" y="344" width="44" height="10" rx="2" fill={strokeMuted} />
              <rect x="780" y="344" width="44" height="10" rx="2" fill={strokeMuted} />
              {/* Main Cast Iron Bed */}
              <rect
                x="40"
                y="304"
                width="820"
                height="40"
                rx="4"
                fill={`url(#castIron-${uid})`}
                stroke={strokeMain}
                strokeWidth="1.5"
              />
              {/* Precision Ground Top Rail */}
              <rect x="44" y="304" width="812" height="5" fill={isDark ? '#64748b' : '#cbd5e1'} />
              {/* Machined T-Slot Groove */}
              <rect x="52" y="320" width="796" height="8" rx="1.5" fill={isDark ? '#020617' : '#334155'} />
              <line x1="52" y1="321" x2="848" y2="321" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <text x="450" y="339" fill={isDark ? '#94a3b8' : '#e2e8f0'} fontSize="9.5" fontWeight="600" letterSpacing="1.5" textAnchor="middle">
                CAST-IRON OPTICAL / DILATOMETER BENCH (T-SLOT DATUM)
              </text>
            </g>

            {/* Left Fixed Rigid Abutment Block */}
            <g id="left-abutment">
              {/* Base Mounting Flange */}
              <rect
                x="48"
                y="286"
                width="84"
                height="18"
                rx="2"
                fill={`url(#steelBlock-${uid})`}
                stroke={strokeMain}
                strokeWidth="1.5"
              />
              {/* Main Vertical Block */}
              <rect
                x="56"
                y="134"
                width="76"
                height="152"
                rx="3"
                fill={`url(#steelBlock-${uid})`}
                stroke={strokeMain}
                strokeWidth="1.8"
              />
              {/* ISO 45° Section Hatch Overlay */}
              <rect x="56" y="134" width="76" height="152" rx="3" fill={`url(#hatch45-${uid})`} />
              {/* Hardened Clamp Face Plate */}
              <rect x="128" y="168" width="6" height="104" fill={isDark ? '#94a3b8' : '#475569'} />
              {/* 4 Anchor Hex Bolts */}
              {[
                [72, 152],
                [112, 152],
                [66, 295],
                [114, 295],
              ].map(([bx, by], idx) => (
                <g key={idx}>
                  <circle cx={bx} cy={by} r="5.5" fill={isDark ? '#334155' : '#94a3b8'} stroke={strokeMain} strokeWidth="1.2" />
                  <circle cx={bx} cy={by} r="2.2" fill={isDark ? '#0f172a' : '#475569'} />
                </g>
              ))}
              {/* Fixed Abutment Label Pill */}
              <rect x="46" y="102" width="96" height="22" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="94" y="117" fill={textPrimary} fontSize="10" fontWeight="700" textAnchor="middle">
                FIXED ANCHOR
              </text>
            </g>

            {/* Low-Friction Bronze V-Roller Specimen Cradles */}
            {[205, 425].map((rx, idx) => (
              <g key={idx} transform={`translate(${rx}, 0)`}>
                {/* Roller Pedestal */}
                <path
                  d={`M -16 304 L -12 ${barSvg.barBotY + 12} L 12 ${barSvg.barBotY + 12} L 16 304 Z`}
                  fill={`url(#steelBlock-${uid})`}
                  stroke={strokeMain}
                  strokeWidth="1.3"
                />
                {/* Bronze Roller Wheel touching specimen underside */}
                <circle
                  cx="0"
                  cy={barSvg.barBotY + 8}
                  r="8"
                  fill={`url(#bronzeGrad-${uid})`}
                  stroke="#78350f"
                  strokeWidth="1.3"
                />
                <circle cx="0" cy={barSvg.barBotY + 8} r="2.5" fill="#fef3c7" />
              </g>
            ))}

            {/* Thermal Aura behind bar when hot/cold */}
            {barSvg.visuals.glowOpacity > 0.05 && (
              <rect
                x="215"
                y={barSvg.barTopY - 14}
                width="195"
                height={barSvg.barH + 28}
                rx="18"
                fill={barSvg.visuals.glowHex}
                fillOpacity={barSvg.visuals.glowOpacity * 0.35}
                filter={`url(#glow-${uid})`}
              />
            )}

            {/* Induction Coil Back Loops (behind bar) */}
            <g opacity="0.85">
              {Array.from({ length: 8 }).map((_, i) => {
                const cx = 235 + i * 21;
                return (
                  <path
                    key={`coil-back-${i}`}
                    d={`M ${cx} ${barSvg.barTopY - 12} C ${cx - 5} ${barSvg.barTopY - 12}, ${cx - 5} ${barSvg.barBotY + 12}, ${cx} ${barSvg.barBotY + 12}`}
                    fill="none"
                    stroke={barSvg.visuals.isCold ? '#38bdf8' : '#9a3412'}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* The Expanding Cylindrical Specimen Bar */}
            <g id="specimen-bar">
              {/* Base Metallic Bar Fill */}
              <rect
                x={barSvg.xAnchor}
                y={barSvg.barTopY}
                width={Math.max(24, barSvg.barEndX - barSvg.xAnchor)}
                height={barSvg.barH}
                rx="2"
                fill={barSvg.inputs.material.color}
                stroke={strokeMain}
                strokeWidth="1.6"
              />
              {/* Live Thermal Gradient + Cylindrical Specular Highlight */}
              <rect
                x={barSvg.xAnchor}
                y={barSvg.barTopY}
                width={Math.max(24, barSvg.barEndX - barSvg.xAnchor)}
                height={barSvg.barH}
                rx="2"
                fill={`url(#barCyl-${uid})`}
                stroke={barSvg.results.isContactingWall ? '#ef4444' : strokeMain}
                strokeWidth={barSvg.results.isContactingWall ? '2' : '1.6'}
              />

              {/* Compressive Stress Heatmap Overlay when restrained against abutment */}
              {barSvg.results.isContactingWall && barSvg.results.thermalStressMpa > 0 && (
                <rect
                  x={barSvg.xAnchor}
                  y={barSvg.barTopY + 1}
                  width={Math.max(22, barSvg.barEndX - barSvg.xAnchor)}
                  height={barSvg.barH - 2}
                  rx="1"
                  fill={`url(#stressWave-${uid})`}
                />
              )}

              {/* Specimen Centerline (ISO dash-dot) */}
              <line
                x1={barSvg.xAnchor - 8}
                y1={barSvg.barCenterY}
                x2={barSvg.barEndX + 10}
                y2={barSvg.barCenterY}
                stroke={isDark ? 'rgba(248,250,252,0.45)' : 'rgba(15,23,42,0.35)'}
                strokeWidth="1"
                strokeDasharray="10 3 2 3"
              />

              {/* Precision Feeler Pin Collar on Top of Specimen Tip (for LVDT Quartz Probe) */}
              <rect
                x={barSvg.barEndX - 10}
                y={barSvg.barTopY - 12}
                width="8"
                height="12"
                rx="1"
                fill={`url(#chromeCyl-${uid})`}
                stroke={strokeMain}
                strokeWidth="1"
              />
            </g>

            {/* Induction Coil Front Loops (in front of bar) */}
            <g>
              {Array.from({ length: 8 }).map((_, i) => {
                const cx = 235 + i * 21;
                return (
                  <path
                    key={`coil-front-${i}`}
                    d={`M ${cx} ${barSvg.barTopY - 12} C ${cx + 7} ${barSvg.barTopY - 12}, ${cx + 7} ${barSvg.barBotY + 12}, ${cx} ${barSvg.barBotY + 12}`}
                    fill="none"
                    stroke={barSvg.visuals.isCold ? '#7dd3fc' : barSvg.visuals.isHot ? '#f97316' : '#d97706'}
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                );
              })}
              {/* Induction Coil Header Leads & Digital Temp Readout Pill */}
              <line x1="235" y1={barSvg.barTopY - 12} x2="235" y2="56" stroke={strokeMuted} strokeWidth="1.8" />
              <line x1="382" y1={barSvg.barTopY - 12} x2="382" y2="56" stroke={strokeMuted} strokeWidth="1.8" />
              <rect x="206" y="28" width="206" height="32" rx="6" fill={panelBg} stroke={barSvg.visuals.badgeColor} strokeWidth="1.5" filter={`url(#shadow-${uid})`} />
              <circle cx="222" cy="44" r="5" fill={barSvg.visuals.badgeColor} />
              <text x="234" y="48" fill={textPrimary} fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="700">
                T = {barSvg.inputs.currentTempC} °C (ΔT {barSvg.results.deltaTC >= 0 ? `+${barSvg.results.deltaTC.toFixed(0)}` : barSvg.results.deltaTC.toFixed(0)}°C)
              </text>
            </g>

            {/* Initial L0 Reference Line */}
            <line
              x1={barSvg.baseEndX}
              y1="145"
              x2={barSvg.baseEndX}
              y2="302"
              stroke={textSecondary}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <rect x={barSvg.baseEndX - 42} y="122" width="84" height="20" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
            <text x={barSvg.baseEndX} y="135" fill={textSecondary} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
              L₀ (20°C)
            </text>

            {/* Right Rigid Abutment Stop (when Constrained) */}
            {barSvg.inputs.isConstrained ? (
              <g id="right-abutment">
                {/* Sliding T-slot base */}
                <rect
                  x={barSvg.wallX}
                  y="286"
                  width="64"
                  height="18"
                  rx="2"
                  fill={`url(#steelBlock-${uid})`}
                  stroke={strokeMain}
                  strokeWidth="1.5"
                />
                {/* Vertical Rigid Stop Block (kept below quartz feeler rod at y=160 so zero collision!) */}
                <rect
                  x={barSvg.wallX}
                  y="174"
                  width="54"
                  height="112"
                  rx="3"
                  fill={`url(#steelBlock-${uid})`}
                  stroke={barSvg.results.isContactingWall ? '#ef4444' : strokeMain}
                  strokeWidth={barSvg.results.isContactingWall ? '2.2' : '1.8'}
                />
                <rect x={barSvg.wallX} y="174" width="54" height="112" rx="3" fill={`url(#hatch45-${uid})`} />
                {/* Hardened Anvil Strike Plate */}
                <rect
                  x={barSvg.wallX}
                  y="182"
                  width="6"
                  height="96"
                  fill={barSvg.results.isContactingWall ? '#ef4444' : isDark ? '#94a3b8' : '#475569'}
                />
                {/* Base Clamp Bolts */}
                <circle cx={barSvg.wallX + 16} cy="295" r="4.5" fill={isDark ? '#334155' : '#94a3b8'} stroke={strokeMain} strokeWidth="1.2" />
                <circle cx={barSvg.wallX + 46} cy="295" r="4.5" fill={isDark ? '#334155' : '#94a3b8'} stroke={strokeMain} strokeWidth="1.2" />

                {/* Abutment Badge cleanly positioned below the quartz rod & next to wall */}
                <rect x={barSvg.wallX + 60} y="242" width="106" height="36" rx="4" fill={panelBg} stroke={barSvg.results.isContactingWall ? '#ef4444' : panelBorder} strokeWidth="1" />
                <text x={barSvg.wallX + 113} y="257" fill={textPrimary} fontSize="9.5" fontWeight="700" textAnchor="middle">
                  RIGID STOP
                </text>
                <text x={barSvg.wallX + 113} y="271" fill={textSecondary} fontSize="9.5" fontFamily="var(--font-mono)" textAnchor="middle">
                  δ_gap={barSvg.inputs.gapMm.toFixed(2)}mm
                </text>

                {/* Gap Dimension Callout (when gap > 0 and not yet closed) */}
                {barSvg.gapPx >= 10 && !barSvg.results.isContactingWall && (
                  <g>
                    <line
                      x1={barSvg.barEndX}
                      y1="276"
                      x2={barSvg.wallX}
                      y2="276"
                      stroke="#10b981"
                      strokeWidth="1.8"
                      markerStart={`url(#arrowGreen-${uid})`}
                      markerEnd={`url(#arrowGreen-${uid})`}
                    />
                    <rect x={(barSvg.barEndX + barSvg.wallX) / 2 - 28} y="280" width="56" height="16" rx="3" fill={panelBg} stroke="#10b981" strokeWidth="0.9" />
                    <text x={(barSvg.barEndX + barSvg.wallX) / 2} y="291" fill="#10b981" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                      OPEN GAP
                    </text>
                  </g>
                )}

                {/* Compressive Axial Thrust & Reaction Arrows when Contacting */}
                {barSvg.results.isContactingWall && barSvg.results.thermalStressMpa > 0 && (
                  <g>
                    {/* Specimen pushing right into abutment */}
                    <line
                      x1={barSvg.wallX - 66}
                      y1={barSvg.barCenterY}
                      x2={barSvg.wallX - 6}
                      y2={barSvg.barCenterY}
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      markerEnd={`url(#arrowRed-${uid})`}
                    />
                    {/* Wall reaction pushing left */}
                    <line
                      x1={barSvg.wallX + 46}
                      y1={barSvg.barCenterY}
                      x2={barSvg.wallX + 8}
                      y2={barSvg.barCenterY}
                      stroke="#f97316"
                      strokeWidth="3"
                      markerEnd={`url(#arrowOrange-${uid})`}
                    />
                    {/* Force Callout Badge neatly stacked above RIGID STOP badge, clear of V-rollers & quartz rod */}
                    <rect x={barSvg.wallX + 60} y="204" width="106" height="26" rx="4" fill={isDark ? '#450a0a' : '#fef2f2'} stroke="#ef4444" strokeWidth="1.2" />
                    <text x={barSvg.wallX + 113} y="221" fill="#ef4444" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                      F = {barSvg.results.thrustForceKn.toFixed(2)} kN
                    </text>
                  </g>
                )}

                {/* Yield Warning Badge */}
                {barSvg.results.isYielded && (
                  <g transform="translate(460, 28)">
                    <rect x="0" y="0" width="180" height="30" rx="5" fill="#dc2626" filter={`url(#shadow-${uid})`} />
                    <text x="90" y="19" fill="#ffffff" fontSize="10.5" fontWeight="800" textAnchor="middle">
                      ⚠ YIELD EXCEEDED (σ &gt; σ_y)
                    </text>
                  </g>
                )}
              </g>
            ) : (
              <g transform={`translate(${barSvg.barEndX + 14}, ${barSvg.barCenterY - 12})`}>
                <rect x="0" y="0" width="132" height="24" rx="4" fill={panelBg} stroke="#10b981" strokeWidth="1.2" />
                <text x="66" y="16" fill="#10b981" fontSize="10" fontWeight="700" textAnchor="middle">
                  FREE EXPANSION ➔
                </text>
              </g>
            )}

            {/* Right Precision Dial Gauge / LVDT Stand mounted on Cast-Iron Bed */}
            <g id="precision-dial-stand">
              {/* Magnetic Base Block */}
              <rect x="748" y="274" width="60" height="30" rx="3" fill={isDark ? '#1e293b' : '#475569'} stroke={strokeMain} strokeWidth="1.5" />
              <circle cx="778" cy="289" r="6" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.2" />
              <text x="778" y="292" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                ON
              </text>
              {/* Vertical Chrome Stand Post */}
              <rect x="773" y="96" width="10" height="178" fill={`url(#chromeCyl-${uid})`} stroke={strokeMain} strokeWidth="1.2" />
              {/* Knurled Collar Clamp */}
              <rect x="765" y="138" width="26" height="24" rx="3" fill={isDark ? '#334155' : '#64748b'} stroke={strokeMain} strokeWidth="1.2" />

              {/* Quartz Push-Rod Feeler Arm spanning cleanly above abutment (y=154) to bar top pin */}
              <line
                x1={barSvg.barEndX - 6}
                y1={barSvg.barTopY - 8}
                x2={barSvg.barEndX - 6}
                y2="152"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <line
                x1={barSvg.barEndX - 6}
                y1="152"
                x2="740"
                y2="152"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              {/* LVDT Plunger Sleeve */}
              <rect x="716" y="146" width="28" height="12" rx="2" fill={`url(#chromeCyl-${uid})`} stroke={strokeMain} strokeWidth="1.2" />

              {/* Precision Dial Indicator Head */}
              <g transform="translate(778, 102)" filter={`url(#shadow-${uid})`}>
                <circle cx="0" cy="0" r="46" fill={isDark ? '#1e293b' : '#e2e8f0'} stroke={strokeMain} strokeWidth="2.5" />
                <circle cx="0" cy="0" r="40" fill={isDark ? '#0b1220' : '#ffffff'} stroke={strokeMuted} strokeWidth="1" />
                {/* 20 Graduated Scale Ticks */}
                {Array.from({ length: 20 }).map((_, i) => {
                  const isMajor = i % 5 === 0;
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1="-37"
                      x2="0"
                      y2={isMajor ? '-29' : '-33'}
                      stroke={textPrimary}
                      strokeWidth={isMajor ? '1.8' : '0.9'}
                      transform={`rotate(${i * 18} 0 0)`}
                    />
                  );
                })}
                <text x="0" y="-17" fill={textSecondary} fontSize="7.5" fontWeight="700" textAnchor="middle">
                  LVDT ΔL
                </text>
                {/* Digital LCD Window */}
                <rect x="-30" y="11" width="60" height="16" rx="4" fill="var(--md-surface-container-highest)" stroke={panelBorder} strokeWidth="1" />
                <text x="0" y="22.5" fill={textPrimary} fontSize="9.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                  {barSvg.results.actualExpansionMm >= 0
                    ? `+${barSvg.results.actualExpansionMm.toFixed(2)}`
                    : barSvg.results.actualExpansionMm.toFixed(2)}
                </text>
                {/* Rotating Needle */}
                <line
                  x1="0"
                  y1="7"
                  x2="0"
                  y2="-33"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  transform={`rotate(${barSvg.dialRotationDeg} 0 0)`}
                />
                <circle cx="0" cy="0" r="3.5" fill="#ef4444" />
              </g>
            </g>

            {/* Bottom Dimension Line & Engineering Readout Strip */}
            <g transform="translate(0, 376)">
              {/* L0 Dimension Line */}
              <line x1={barSvg.xAnchor} y1="10" x2={barSvg.xAnchor} y2="30" stroke={textSecondary} strokeWidth="1.2" />
              <line x1={barSvg.baseEndX} y1="10" x2={barSvg.baseEndX} y2="30" stroke={textSecondary} strokeWidth="1.2" />
              <line
                x1={barSvg.xAnchor + 3}
                y1="20"
                x2={barSvg.baseEndX - 3}
                y2="20"
                stroke={textSecondary}
                strokeWidth="1.4"
                markerStart={`url(#arrowDim-${uid})`}
                markerEnd={`url(#arrowDim-${uid})`}
              />
              <rect x={(barSvg.xAnchor + barSvg.baseEndX) / 2 - 58} y="9" width="116" height="22" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x={(barSvg.xAnchor + barSvg.baseEndX) / 2} y="24" fill={textPrimary} fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                L₀ = {barSvg.inputs.lengthMm} mm
              </text>

              {/* Bottom Telemetry Card */}
              <rect x="520" y="0" width="340" height="68" rx="10" fill={panelBg} stroke={panelBorder} strokeWidth="1.2" filter={`url(#shadow-${uid})`} />
              <text x="536" y="21" fill={textSecondary} fontSize="11">
                Free Expansion (ΔL_free):
              </text>
              <text x="844" y="21" fill={textPrimary} fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="end">
                {barSvg.results.freeExpansionMm >= 0 ? `+${barSvg.results.freeExpansionMm.toFixed(4)}` : barSvg.results.freeExpansionMm.toFixed(4)} mm
              </text>

              <text x="536" y="40" fill={textSecondary} fontSize="11">
                Restrained Strain (ε_mech):
              </text>
              <text x="844" y="40" fill="#f97316" fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="end">
                {(barSvg.results.thermalStrain * 1e6).toFixed(0)} µε ({barSvg.results.restrainedDisplacementMm.toFixed(3)} mm)
              </text>

              <text x="536" y="59" fill={textSecondary} fontSize="11">
                Compressive Stress (σ_th):
              </text>
              <text
                x="844"
                y="59"
                fill={barSvg.results.isYielded ? '#ef4444' : barSvg.results.thermalStressMpa > 0 ? '#f97316' : textPrimary}
                fontSize="11.5"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                textAnchor="end"
              >
                {barSvg.results.thermalStressMpa.toFixed(1)} MPa / {barSvg.inputs.material.yieldStrengthMpa} MPa
              </text>
            </g>
          </g>
        )}

        {/* ===================================================================== */}
        {/* MODE 2: SHRINK FIT HUB-ON-SHAFT (SECTION + LONGITUDINAL ELEVATION)    */}
        {/* ===================================================================== */}
        {mode === 'shrink-fit' && shrinkSvg && (
          <g id="mode-shrink-fit">
            {/* Panel Dividers */}
            <line x1="448" y1="20" x2="448" y2="440" stroke={gridMajor} strokeWidth="1.5" strokeDasharray="6 4" />

            {/* LEFT PANEL: Transverse Bore Cross Section */}
            <g id="shrink-transverse-section">
              <rect x="28" y="22" width="394" height="28" rx="5" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="225" y="40" fill={textPrimary} fontSize="11.5" fontWeight="700" textAnchor="middle">
                TRANSVERSE BORE SECTION (DIN 7190)
              </text>

              {/* Induction Heater Coil Ring around Hub when heated */}
              {shrinkSvg.inputs.heatingDeltaTC > 0 && (
                <g>
                  <circle
                    cx={shrinkSvg.cX}
                    cy={shrinkSvg.cY}
                    r={shrinkSvg.rHubOuter + 14}
                    fill="none"
                    stroke={shrinkSvg.hubVisuals.glowHex}
                    strokeWidth="6"
                    strokeDasharray="10 6"
                    strokeOpacity={Math.max(0.35, shrinkSvg.hubVisuals.glowOpacity)}
                    filter={shrinkSvg.inputs.heatingDeltaTC > 100 ? `url(#glow-${uid})` : undefined}
                  />
                  <rect x="135" y="64" width="180" height="22" rx="4" fill={panelBg} stroke={shrinkSvg.hubVisuals.badgeColor} strokeWidth="1.2" />
                  <text x="225" y="79" fill={shrinkSvg.hubVisuals.badgeColor} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                    INDUCTION HEAT: ΔT = +{shrinkSvg.inputs.heatingDeltaTC} °C
                  </text>
                </g>
              )}

              {/* Hub Outer Ring with Opposing -45° ISO Section Hatching */}
              <circle
                cx={shrinkSvg.cX}
                cy={shrinkSvg.cY}
                r={shrinkSvg.rHubOuter}
                fill={shrinkSvg.hubVisuals.tintHex}
                fillOpacity="0.28"
                stroke={strokeMain}
                strokeWidth="2.4"
              />
              <circle
                cx={shrinkSvg.cX}
                cy={shrinkSvg.cY}
                r={shrinkSvg.rHubOuter}
                fill={`url(#hatchNeg45-${uid})`}
                stroke="none"
              />
              {/* Inner Bore Stress Concentration Ring when assembled */}
              {!shrinkSvg.results.canSlipFit && shrinkSvg.results.contactPressureMpa > 0 && (
                <circle
                  cx={shrinkSvg.cX}
                  cy={shrinkSvg.cY}
                  r={shrinkSvg.rShaft + (shrinkSvg.rHubOuter - shrinkSvg.rShaft) * 0.25}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={(shrinkSvg.rHubOuter - shrinkSvg.rShaft) * 0.5}
                  strokeOpacity={0.12 + shrinkSvg.pressureRatio * 0.3}
                />
              )}

              {/* Radial Clearance Ring (Hot Slip-Fit State) */}
              {shrinkSvg.results.canSlipFit && (
                <circle
                  cx={shrinkSvg.cX}
                  cy={shrinkSvg.cY}
                  r={shrinkSvg.rHubInner}
                  fill={bgCanvas}
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
              )}

              {/* Solid Machined Shaft Circle */}
              <circle
                cx={shrinkSvg.cX}
                cy={shrinkSvg.cY}
                r={shrinkSvg.rShaft}
                fill={`url(#shaftRad-${uid})`}
                stroke={strokeMain}
                strokeWidth="2.2"
              />
              {/* Keyway notch detail on shaft at 12 o'clock */}
              <rect
                x={shrinkSvg.cX - 7}
                y={shrinkSvg.cY - shrinkSvg.rShaft - 1}
                width="14"
                height="8"
                fill={bgCanvas}
                stroke={strokeMain}
                strokeWidth="1.4"
              />
              {/* ISO Centerlines */}
              <line x1={shrinkSvg.cX - shrinkSvg.rHubOuter - 14} y1={shrinkSvg.cY} x2={shrinkSvg.cX + shrinkSvg.rHubOuter + 14} y2={shrinkSvg.cY} stroke={strokeMuted} strokeWidth="0.9" strokeDasharray="10 3 2 3" />
              <line x1={shrinkSvg.cX} y1={shrinkSvg.cY - shrinkSvg.rHubOuter - 10} x2={shrinkSvg.cX} y2={shrinkSvg.cY + shrinkSvg.rHubOuter + 14} stroke={strokeMuted} strokeWidth="0.9" strokeDasharray="10 3 2 3" />

              {/* 8 Radial Contact Pressure Arrows (only when interference fit is active) */}
              {!shrinkSvg.results.canSlipFit && shrinkSvg.results.contactPressureMpa > 0 && (
                <g>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = ((i * 45 + 22.5) * Math.PI) / 180;
                    const rOut = shrinkSvg.rShaft + 20;
                    const rIn = shrinkSvg.rShaft + 3;
                    return (
                      <line
                        key={i}
                        x1={shrinkSvg.cX + Math.cos(angle) * rOut}
                        y1={shrinkSvg.cY + Math.sin(angle) * rOut}
                        x2={shrinkSvg.cX + Math.cos(angle) * rIn}
                        y2={shrinkSvg.cY + Math.sin(angle) * rIn}
                        stroke="#ef4444"
                        strokeWidth="2.2"
                        markerEnd={`url(#arrowRed-${uid})`}
                      />
                    );
                  })}
                </g>
              )}

              {/* Clean Leader Callouts for Shaft d and Hub Do */}
              {/* Shaft OD Leader (Bottom-Left) */}
              <polyline
                points={`${shrinkSvg.cX - 36},${shrinkSvg.cY + 34} ${shrinkSvg.cX - 110},${shrinkSvg.cY + 108} ${shrinkSvg.cX - 180},${shrinkSvg.cY + 108}`}
                fill="none"
                stroke={textSecondary}
                strokeWidth="1.2"
              />
              <circle cx={shrinkSvg.cX - 36} cy={shrinkSvg.cY + 34} r="2.5" fill={textPrimary} />
              <rect x="30" y="320" width="96" height="22" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="78" y="335" fill={textPrimary} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                d = {shrinkSvg.inputs.shaftDiameterMm} mm
              </text>

              {/* Hub OD Leader (Bottom-Right) */}
              <polyline
                points={`${shrinkSvg.cX + shrinkSvg.rHubOuter * 0.72},${shrinkSvg.cY + shrinkSvg.rHubOuter * 0.7} ${shrinkSvg.cX + 128},${shrinkSvg.cY + 108} ${shrinkSvg.cX + 185},${shrinkSvg.cY + 108}`}
                fill="none"
                stroke={textSecondary}
                strokeWidth="1.2"
              />
              <circle cx={shrinkSvg.cX + shrinkSvg.rHubOuter * 0.72} cy={shrinkSvg.cY + shrinkSvg.rHubOuter * 0.7} r="2.5" fill={textPrimary} />
              <rect x="320" y="320" width="102" height="22" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="371" y="335" fill={textPrimary} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                D₀ = {shrinkSvg.inputs.hubOuterDiameterMm} mm
              </text>

              {/* Bottom Fit Status Pill */}
              <rect
                x="45"
                y="380"
                width="360"
                height="48"
                rx="6"
                fill={panelBg}
                stroke={shrinkSvg.results.canSlipFit ? '#10b981' : '#ef4444'}
                strokeWidth="1.4"
                filter={`url(#shadow-${uid})`}
              />
              <text
                x="225"
                y="400"
                fill={shrinkSvg.results.canSlipFit ? '#10b981' : '#ef4444'}
                fontSize="11"
                fontWeight="800"
                textAnchor="middle"
              >
                {shrinkSvg.results.canSlipFit
                  ? `✓ HOT CLEARANCE: +${shrinkSvg.results.assemblyClearanceMm.toFixed(3)} mm (FREE SLIP-ON)`
                  : `INTERFERENCE ACTIVE: δ = ${(shrinkSvg.inputs.diametralInterferenceMm * 1000).toFixed(0)} µm`}
              </text>
              <text x="225" y="418" fill={textSecondary} fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                Bore Δd = +{shrinkSvg.results.hubBoreExpansionMm.toFixed(3)} mm · Min ΔT = {shrinkSvg.results.minDeltaTZeroClearanceC.toFixed(1)} °C
              </text>
            </g>

            {/* RIGHT PANEL: Longitudinal Half-Section Elevation & Telemetry */}
            <g id="shrink-longitudinal-elevation">
              <rect x="472" y="22" width="400" height="28" rx="5" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="672" y="40" fill={textPrimary} fontSize="11.5" fontWeight="700" textAnchor="middle">
                HALF-SECTION ELEVATION &amp; TORQUE CAPACITY
              </text>

              {/* Solid Cylindrical Shaft */}
              <rect
                x="496"
                y="150"
                width="358"
                height="68"
                rx="3"
                fill={`url(#chromeCyl-${uid})`}
                stroke={strokeMain}
                strokeWidth="1.8"
              />
              {/* Chamfered Shaft Ends */}
              <line x1="504" y1="150" x2="504" y2="218" stroke={strokeMuted} strokeWidth="1" />
              <line x1="846" y1="150" x2="846" y2="218" stroke={strokeMuted} strokeWidth="1" />

              {/* Half-Sectioned Hub: Top Half Cutaway (45° hatch) + Bottom Half Elevation */}
              {/* Top Half (Cutaway Section) */}
              <rect
                x={shrinkSvg.hubLeftX}
                y="104"
                width={shrinkSvg.elevL}
                height="46"
                rx="2"
                fill={shrinkSvg.hubVisuals.tintHex}
                fillOpacity="0.28"
                stroke={strokeMain}
                strokeWidth="2"
              />
              <rect
                x={shrinkSvg.hubLeftX}
                y="104"
                width={shrinkSvg.elevL}
                height="46"
                rx="2"
                fill={`url(#hatchNeg45-${uid})`}
              />
              {/* Bottom Half (Exterior Machined Elevation) */}
              <rect
                x={shrinkSvg.hubLeftX}
                y="218"
                width={shrinkSvg.elevL}
                height="46"
                rx="2"
                fill={shrinkSvg.hubVisuals.tintHex}
                fillOpacity="0.65"
                stroke={strokeMain}
                strokeWidth="2"
              />

              {/* Bore Seam Highlight (Green when hot slip-fit, Red when interference) */}
              <line
                x1={shrinkSvg.hubLeftX}
                y1="150"
                x2={shrinkSvg.hubRightX}
                y2="150"
                stroke={shrinkSvg.results.canSlipFit ? '#10b981' : '#ef4444'}
                strokeWidth="2.5"
              />
              <line
                x1={shrinkSvg.hubLeftX}
                y1="218"
                x2={shrinkSvg.hubRightX}
                y2="218"
                stroke={shrinkSvg.results.canSlipFit ? '#10b981' : '#ef4444'}
                strokeWidth="2.5"
              />

              {/* ISO Centerline */}
              <line x1="478" y1="184" x2="870" y2="184" stroke={isDark ? 'rgba(248,250,252,0.5)' : 'rgba(15,23,42,0.4)'} strokeWidth="1" strokeDasharray="12 3 2 3" />

              {/* Torsional Torque Curved Vector Arrow on Shaft Left */}
              <path
                d="M 526 128 A 28 38 0 0 0 526 240"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                markerEnd={`url(#arrowOrange-${uid})`}
              />
              <rect x="476" y="78" width="124" height="24" rx="4" fill={panelBg} stroke="#f59e0b" strokeWidth="1.2" />
              <text x="538" y="94" fill="#d97706" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                T_cap = {shrinkSvg.results.torqueCapacityNm.toFixed(0)} N·m
              </text>

              {/* Axial Hold Force Vector on Shaft Right */}
              <line
                x1="786"
                y1="184"
                x2="836"
                y2="184"
                stroke="#ef4444"
                strokeWidth="2.8"
                markerEnd={`url(#arrowRed-${uid})`}
              />
              <rect x="752" y="78" width="122" height="24" rx="4" fill={panelBg} stroke="#ef4444" strokeWidth="1.2" />
              <text x="813" y="94" fill="#ef4444" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                F_ax = {shrinkSvg.results.axialHoldingForceKn.toFixed(1)} kN
              </text>

              {/* Engagement Length Dimension Line */}
              <line x1={shrinkSvg.hubLeftX} y1="268" x2={shrinkSvg.hubLeftX} y2="294" stroke={textSecondary} strokeWidth="1.2" />
              <line x1={shrinkSvg.hubRightX} y1="268" x2={shrinkSvg.hubRightX} y2="294" stroke={textSecondary} strokeWidth="1.2" />
              <line
                x1={shrinkSvg.hubLeftX + 3}
                y1="284"
                x2={shrinkSvg.hubRightX - 3}
                y2="284"
                stroke={textSecondary}
                strokeWidth="1.4"
                markerStart={`url(#arrowDim-${uid})`}
                markerEnd={`url(#arrowDim-${uid})`}
              />
              <rect x="631" y="274" width="88" height="20" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="675" y="288" fill={textPrimary} fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="middle">
                L = {shrinkSvg.inputs.engagementLengthMm} mm
              </text>

              {/* Bottom-Right Stress & Safety Telemetry Card */}
              <rect x="472" y="316" width="400" height="112" rx="6" fill={panelBg} stroke={panelBorder} strokeWidth="1.2" filter={`url(#shadow-${uid})`} />
              <text x="488" y="340" fill={textSecondary} fontSize="11">
                Lamé Contact Pressure (p_c):
              </text>
              <text x="856" y="340" fill={textPrimary} fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="end">
                {shrinkSvg.results.contactPressureMpa.toFixed(2)} MPa
              </text>

              <text x="488" y="362" fill={textSecondary} fontSize="11">
                Hub Inner Hoop Stress (σ_θ):
              </text>
              <text x="856" y="362" fill={textPrimary} fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="700" textAnchor="end">
                {shrinkSvg.results.hubInnerHoopStressMpa.toFixed(1)} MPa
              </text>

              <text x="488" y="384" fill={textSecondary} fontSize="11">
                Hub Von Mises / Yield SF:
              </text>
              <text
                x="856"
                y="384"
                fill={shrinkSvg.results.isHubYielded ? '#ef4444' : '#10b981'}
                fontSize="11.5"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                textAnchor="end"
              >
                {shrinkSvg.results.hubInnerVonMisesStressMpa.toFixed(1)} MPa (SF = {shrinkSvg.results.hubSafetyFactor.toFixed(2)})
              </text>

              {/* Safety Factor Utilization Bar */}
              <rect x="488" y="398" width="368" height="12" rx="6" fill="var(--md-surface-container-highest)" />
              <rect
                x="488"
                y="398"
                width={Math.max(8, 368 * shrinkSvg.pressureRatio)}
                height="12"
                rx="6"
                fill={shrinkSvg.results.isHubYielded ? '#ef4444' : shrinkSvg.pressureRatio > 0.75 ? '#f59e0b' : '#10b981'}
              />
            </g>
          </g>
        )}

        {/* ===================================================================== */}
        {/* MODE 3: TIMOSHENKO BIMETALLIC THERMOSTAT CANTILEVER FIXTURE           */}
        {/* ===================================================================== */}
        {mode === 'bimetallic' && bimetalSvg && (
          <g id="mode-bimetallic">
            {/* Ambient Thermal Chamber Backdrop */}
            <rect
              x="126"
              y="72"
              width={bimetalSvg.stripLenPx + 36}
              height="276"
              rx="10"
              fill={bimetalSvg.visuals.glowHex}
              fillOpacity={Math.max(0.03, bimetalSvg.visuals.glowOpacity * 0.14)}
              stroke={bimetalSvg.visuals.badgeColor}
              strokeOpacity="0.3"
              strokeWidth="1.2"
              strokeDasharray="6 4"
            />

            {/* Top Left Fixed Temperature Badge & Layer Legend (zero collision with strip!) */}
            <g transform="translate(140, 24)">
              <rect x="0" y="0" width="214" height="32" rx="6" fill={panelBg} stroke={bimetalSvg.visuals.badgeColor} strokeWidth="1.4" filter={`url(#shadow-${uid})`} />
              <circle cx="16" cy="16" r="5" fill={bimetalSvg.visuals.badgeColor} />
              <text x="28" y="20" fill={textPrimary} fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">
                T = {bimetalSvg.inputs.currentTempC} °C (ΔT {bimetalSvg.results.deltaTC >= 0 ? `+${bimetalSvg.results.deltaTC.toFixed(0)}` : bimetalSvg.results.deltaTC.toFixed(0)}°C)
              </text>
            </g>

            {/* Material Layer Badges cleanly positioned above Chamber */}
            <g transform="translate(368, 24)">
              <rect x="0" y="0" width="240" height="32" rx="6" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <circle cx="14" cy="16" r="5" fill={bimetalSvg.inputs.layer1Material.color} stroke={strokeMain} strokeWidth="0.8" />
              <text x="25" y="20" fill={textPrimary} fontSize="10" fontWeight="700">
                TOP: {bimetalSvg.inputs.layer1Material.name.split(' ')[0]} ({bimetalSvg.inputs.layer1ThicknessMm.toFixed(1)}mm)
              </text>
            </g>
            <g transform="translate(620, 24)">
              <rect x="0" y="0" width="244" height="32" rx="6" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <circle cx="14" cy="16" r="5" fill={bimetalSvg.inputs.layer2Material.color} stroke={strokeMain} strokeWidth="0.8" />
              <text x="25" y="20" fill={textPrimary} fontSize="10" fontWeight="700">
                BOT: {bimetalSvg.inputs.layer2Material.name.split(' ')[0]} ({bimetalSvg.inputs.layer2ThicknessMm.toFixed(1)}mm)
              </text>
            </g>

            {/* Left Terminal Clamp Block */}
            <g id="bimetal-clamp">
              {/* Ceramic Insulator Mounting Pedestal */}
              <rect x="34" y="148" width="92" height="128" rx="4" fill={`url(#steelBlock-${uid})`} stroke={strokeMain} strokeWidth="1.8" />
              <rect x="34" y="148" width="92" height="128" rx="4" fill={`url(#hatch45-${uid})`} />
              {/* Brass Terminal Clamp Jaws */}
              <rect x="108" y="176" width="20" height="72" rx="2" fill={`url(#bronzeGrad-${uid})`} stroke="#78350f" strokeWidth="1.5" />
              {/* Clamping Bolts */}
              <circle cx="76" cy="176" r="6" fill={isDark ? '#334155' : '#94a3b8'} stroke={strokeMain} strokeWidth="1.4" />
              <circle cx="76" cy="248" r="6" fill={isDark ? '#334155' : '#94a3b8'} stroke={strokeMain} strokeWidth="1.4" />
              {/* Electrical Supply Terminal Wire */}
              <path d="M 34 212 L 18 212 L 18 336 L 620 336" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray={bimetalSvg.results.isSwitchClosed ? undefined : '5 3'} />
              <rect x="44" y="290" width="76" height="20" rx="4" fill={panelBg} stroke={panelBorder} strokeWidth="1" />
              <text x="82" y="304" fill={textSecondary} fontSize="9.5" fontWeight="700" textAnchor="middle">
                TERMINAL (+)
              </text>
            </g>

            {/* Undeflected L0 Neutral Reference Axis */}
            <line
              x1={bimetalSvg.startX}
              y1={bimetalSvg.startY}
              x2={bimetalSvg.startX + bimetalSvg.stripLenPx + 18}
              y2={bimetalSvg.startY}
              stroke={strokeMuted}
              strokeWidth="1.4"
              strokeDasharray="6 4"
            />
            <text x={bimetalSvg.startX + 16} y={bimetalSvg.startY - bimetalSvg.t1Px - 10} fill={textSecondary} fontSize="9.5" fontFamily="var(--font-mono)">
              DATUM L₀ = {bimetalSvg.inputs.lengthMm} mm (20 °C)
            </text>

            {/* Exact Normal-Offset Circular Arc Bimetallic Strip */}
            <g id="bimetal-curved-strip" filter={`url(#shadow-${uid})`}>
              {/* Layer 1 (Top) */}
              <path
                d={bimetalSvg.layer1Path}
                fill={bimetalSvg.inputs.layer1Material.color}
                stroke={strokeMain}
                strokeWidth="1.4"
              />
              {/* Layer 2 (Bottom) */}
              <path
                d={bimetalSvg.layer2Path}
                fill={bimetalSvg.inputs.layer2Material.color}
                stroke={strokeMain}
                strokeWidth="1.4"
              />
              {/* Welded Metallurgical Bond Interface */}
              <path
                d={bimetalSvg.interfacePath}
                fill="none"
                stroke={isDark ? '#f8fafc' : '#0f172a'}
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
              {/* Silver Contact Pad riveted to Strip Tip */}
              <circle
                cx={bimetalSvg.tipBotPt[0]}
                cy={bimetalSvg.tipBotPt[1]}
                r="5"
                fill="#e2e8f0"
                stroke={strokeMain}
                strokeWidth="1.2"
              />
            </g>

            {/* Tip Deflection Vertical Dimension Arrow & Non-Overlapping Callout */}
            {Math.abs(bimetalSvg.deflPx) >= 4 && (
              <g>
                <line
                  x1={bimetalSvg.tipPt[0] + 12}
                  y1={bimetalSvg.startY}
                  x2={bimetalSvg.tipPt[0] + 12}
                  y2={bimetalSvg.tipPt[1]}
                  stroke="#ef4444"
                  strokeWidth="2"
                  markerEnd={`url(#arrowRed-${uid})`}
                />
                <rect
                  x={bimetalSvg.tipPt[0] - 88}
                  y={bimetalSvg.deflPx >= 0 ? bimetalSvg.startY - 30 : bimetalSvg.startY + 12}
                  width="92"
                  height="22"
                  rx="4"
                  fill={panelBg}
                  stroke="#ef4444"
                  strokeWidth="1.1"
                />
                <text
                  x={bimetalSvg.tipPt[0] - 42}
                  y={(bimetalSvg.deflPx >= 0 ? bimetalSvg.startY - 30 : bimetalSvg.startY + 12) + 15}
                  fill="#ef4444"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  δ={bimetalSvg.results.tipDeflectionMm >= 0 ? `+${bimetalSvg.results.tipDeflectionMm.toFixed(2)}` : bimetalSvg.results.tipDeflectionMm.toFixed(2)}mm
                </text>
              </g>
            )}

            {/* Right Fixed Thermostat Switch Station & Illuminated Indicator Lamp */}
            <g id="thermostat-switch-station">
              {/* Vertical Insulated Switch Post */}
              <rect x="614" y="138" width="28" height="206" rx="4" fill={`url(#steelBlock-${uid})`} stroke={strokeMain} strokeWidth="1.5" />
              {/* Adjustable Contact Screw Assembly at contactY */}
              <line
                x1={bimetalSvg.tipBotPt[0] - 8}
                y1={bimetalSvg.contactY}
                x2="628"
                y2={bimetalSvg.contactY}
                stroke="#d97706"
                strokeWidth="3.5"
              />
              {/* Silver Tip Contact Point aligned cleanly below strip tip */}
              <circle
                cx={bimetalSvg.tipBotPt[0]}
                cy={bimetalSvg.contactY}
                r="5.5"
                fill="#fbbf24"
                stroke="#92400e"
                strokeWidth="1.3"
              />
              {/* Electric Arc Spark when Contact Closes */}
              {bimetalSvg.results.isSwitchClosed && (
                <g filter={`url(#glow-${uid})`}>
                  <circle cx={bimetalSvg.tipBotPt[0]} cy={bimetalSvg.contactY} r="9" fill="#38bdf8" fillOpacity="0.75" />
                  <path
                    d={`M ${bimetalSvg.tipBotPt[0] - 8} ${bimetalSvg.contactY} L ${bimetalSvg.tipBotPt[0]} ${bimetalSvg.contactY - 8} L ${bimetalSvg.tipBotPt[0] + 8} ${bimetalSvg.contactY} L ${bimetalSvg.tipBotPt[0]} ${bimetalSvg.contactY + 8} Z`}
                    fill="#ffffff"
                  />
                </g>
              )}

              {/* Circuit Wire from Switch Post to Indicator Lamp */}
              <polyline
                points={`642,${bimetalSvg.contactY} 760,${bimetalSvg.contactY} 760,210`}
                fill="none"
                stroke={bimetalSvg.results.isSwitchClosed ? '#ef4444' : strokeMuted}
                strokeWidth="2.5"
              />
              <polyline
                points="620,336 760,336 760,242"
                fill="none"
                stroke={bimetalSvg.results.isSwitchClosed ? '#ef4444' : strokeMuted}
                strokeWidth="2.5"
              />

              {/* Fixed Switch Telemetry Box + Indicator Lamp (never overlaps bottom HUD!) */}
              <rect x="688" y="114" width="182" height="220" rx="8" fill={panelBg} stroke={panelBorder} strokeWidth="1.3" filter={`url(#shadow-${uid})`} />
              <text x="779" y="138" fill={textSecondary} fontSize="10" fontWeight="700" letterSpacing="0.8" textAnchor="middle">
                THERMOSTAT RELAY
              </text>

              {/* Indicator Lamp */}
              <circle
                cx="779"
                cy="182"
                r="24"
                fill={bimetalSvg.results.isSwitchClosed ? '#ef4444' : '#10b981'}
                stroke={strokeMain}
                strokeWidth="2.5"
                filter={bimetalSvg.results.isSwitchClosed ? `url(#glow-${uid})` : undefined}
              />
              <text x="779" y="186" fill="#ffffff" fontSize="11.5" fontWeight="800" textAnchor="middle">
                {bimetalSvg.results.isSwitchClosed ? 'TRIP' : 'OPEN'}
              </text>

              <text
                x="779"
                y="230"
                fill={bimetalSvg.results.isSwitchClosed ? '#ef4444' : '#10b981'}
                fontSize="11.5"
                fontWeight="800"
                textAnchor="middle"
              >
                {bimetalSvg.results.isSwitchClosed ? 'CONTACT CLOSED' : 'NORMAL OPEN'}
              </text>
              <line x1="704" y1="244" x2="854" y2="244" stroke={gridMajor} strokeWidth="1" />
              <text x="779" y="268" fill={textSecondary} fontSize="10.5" textAnchor="middle">
                Contact Gap: <tspan fontFamily="var(--font-mono)" fontWeight="700" fill={textPrimary}>{bimetalSvg.inputs.switchGapMm.toFixed(2)} mm</tspan>
              </text>
              <text x="779" y="292" fill={textSecondary} fontSize="10.5" textAnchor="middle">
                Trip Temp: <tspan fontFamily="var(--font-mono)" fontWeight="700" fill="#f97316">{bimetalSvg.results.tripTempC.toFixed(1)} °C</tspan>
              </text>
              <text x="779" y="316" fill={textSecondary} fontSize="10.5" textAnchor="middle">
                Tip Angle: <tspan fontFamily="var(--font-mono)" fontWeight="700" fill={textPrimary}>{bimetalSvg.results.tipAngleDeg.toFixed(2)}°</tspan>
              </text>
            </g>

            {/* Bottom Summary Telemetry Strip */}
            <g transform="translate(34, 376)">
              <rect x="0" y="0" width="836" height="58" rx="6" fill={panelBg} stroke={panelBorder} strokeWidth="1.2" filter={`url(#shadow-${uid})`} />

              <text x="24" y="23" fill={textSecondary} fontSize="10.5">
                Radius of Curvature (ρ):
              </text>
              <text x="24" y="43" fill={textPrimary} fontSize="12" fontFamily="var(--font-mono)" fontWeight="700">
                {bimetalSvg.results.radiusOfCurvatureMm === Infinity ? '∞ (Flat)' : `${bimetalSvg.results.radiusOfCurvatureMm.toFixed(1)} mm`}
              </text>

              <line x1="230" y1="10" x2="230" y2="48" stroke={gridMajor} strokeWidth="1" />
              <text x="252" y="23" fill={textSecondary} fontSize="10.5">
                Timoshenko Curvature (κ):
              </text>
              <text x="252" y="43" fill={textPrimary} fontSize="12" fontFamily="var(--font-mono)" fontWeight="700">
                {(bimetalSvg.results.curvatureMm1 * 1e3).toFixed(3)} × 10⁻³ mm⁻¹
              </text>

              <line x1="480" y1="10" x2="480" y2="48" stroke={gridMajor} strokeWidth="1" />
              <text x="502" y="23" fill={textSecondary} fontSize="10.5">
                Tip Deflection (δ_tip):
              </text>
              <text x="502" y="43" fill="#f97316" fontSize="12" fontFamily="var(--font-mono)" fontWeight="700">
                {bimetalSvg.results.tipDeflectionMm >= 0 ? `+${bimetalSvg.results.tipDeflectionMm.toFixed(3)}` : bimetalSvg.results.tipDeflectionMm.toFixed(3)} mm
              </text>

              <line x1="670" y1="10" x2="670" y2="48" stroke={gridMajor} strokeWidth="1" />
              <text x="692" y="23" fill={textSecondary} fontSize="10.5">
                Differential Δα:
              </text>
              <text x="692" y="43" fill={textPrimary} fontSize="12" fontFamily="var(--font-mono)" fontWeight="700">
                {(bimetalSvg.inputs.layer1Material.alpha - bimetalSvg.inputs.layer2Material.alpha).toFixed(1)} × 10⁻⁶/°C
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
