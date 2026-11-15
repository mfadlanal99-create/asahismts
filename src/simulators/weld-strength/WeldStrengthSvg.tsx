import { useEffect, useId, useMemo, useRef, type FC } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { WeldCalculationResults, WeldSimulatorInputs } from './weldStrengthData';

interface WeldStrengthSvgProps {
  inputs: WeldSimulatorInputs;
  results: WeldCalculationResults;
}

export const WeldStrengthSvg: FC<WeldStrengthSvgProps> = ({ inputs, results }) => {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const uid = useId().replace(/:/g, '');

  const {
    mode,
    electrode,
    legSizeMm,
    plateThicknessMm,
    plateWidthMm,
    weldLengthMm,
    bracketWidthMm,
    bracketHeightMm,
    eccentricityMm,
    loadKn,
    bendingMomentKnm,
    filletArrangement,
    weldOrientation,
    bracketPattern,
    penetrationType,
    grooveType,
  } = inputs;

  const {
    throatMm,
    effectiveAreaAwMm2,
    peakCombinedStressMpa,
    allowableStressMpa,
    safetyFactor,
    status,
    stressUtilizationPct,
    primaryDirectShearMpa,
    secondaryMomentStressMpa,
    centroidXmm,
    centroidYmm,
    bendingMomentNm,
  } = results;

  // Refs for zero-rerender requestAnimationFrame animations
  const flowGroupRef = useRef<SVGGElement | null>(null);
  const hazGroupRef = useRef<SVGGElement | null>(null);
  const stressPulseRef = useRef<SVGGElement | null>(null);
  const stateRef = useRef({ loadKn, stressUtilizationPct });

  useEffect(() => {
    stateRef.current = { loadKn, stressUtilizationPct };
  }, [loadKn, stressUtilizationPct]);

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();
    let flowPhase = 0;
    let clockSec = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      clockSec += dt;

      const { loadKn: curLoad, stressUtilizationPct: curUtil } = stateRef.current;

      // 1. Load-path force flow streamline velocity scales smoothly with applied load
      const flowSpeed = 12 + Math.min(80, curLoad * 0.14);
      flowPhase = (flowPhase + dt * flowSpeed) % 24;
      if (flowGroupRef.current) {
        const paths = flowGroupRef.current.querySelectorAll('path');
        paths.forEach((p) => {
          p.setAttribute('stroke-dashoffset', (-flowPhase).toFixed(2));
        });
      }

      // 2. Subtle thermal HAZ shimmer along fusion boundary
      if (hazGroupRef.current) {
        const hazOp = 0.72 + 0.24 * Math.sin(clockSec * 2.6);
        hazGroupRef.current.setAttribute('opacity', hazOp.toFixed(3));
      }

      // 3. Elevated stress-pulse highlight along critical throat when utilization > 75%
      if (stressPulseRef.current) {
        if (curUtil > 75) {
          const pulseFreq = curUtil > 100 ? 6.5 : 3.4;
          const pulse = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(clockSec * pulseFreq));
          stressPulseRef.current.setAttribute('opacity', pulse.toFixed(3));
        } else {
          stressPulseRef.current.setAttribute('opacity', '0');
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Theme CAD Palette
  const pal = useMemo(
    () => ({
      canvasBg: isDark ? '#090f1d' : '#f8fafc',
      frameBorder: isDark ? '#1e293b' : '#cbd5e1',
      gridMinor: isDark ? '#131d33' : '#e2e8f0',
      gridMajor: isDark ? '#1e293b' : '#cbd5e1',
      cardBg: isDark ? '#0f172a' : '#ffffff',
      cardBorder: isDark ? '#334155' : '#cbd5e1',
      textPrimary: isDark ? '#f1f5f9' : '#0f172a',
      textSecondary: isDark ? '#94a3b8' : '#475569',
      plateAStart: isDark ? '#475569' : '#e2e8f0',
      plateAEnd: isDark ? '#334155' : '#cbd5e1',
      plateBStart: isDark ? '#64748b' : '#f1f5f9',
      plateBEnd: isDark ? '#334155' : '#94a3b8',
      fixtureStart: isDark ? '#334155' : '#94a3b8',
      fixtureEnd: isDark ? '#1e293b' : '#64748b',
      plateOutline: isDark ? '#94a3b8' : '#475569',
      hatchA: isDark ? '#94a3b8' : '#475569',
      hatchB: isDark ? '#cbd5e1' : '#334155',
      weldHi: '#fef3c7',
      weldMid: isDark ? '#f59e0b' : '#d97706',
      weldLo: isDark ? '#b45309' : '#92400e',
      dimStroke: isDark ? '#94a3b8' : '#475569',
      dimText: isDark ? '#e2e8f0' : '#1e293b',
      forceColor: '#ef4444',
      momentColor: '#8b5cf6',
      tauPrimeColor: '#10b981',
      tauDoubleColor: '#f59e0b',
      centroidColor: '#38bdf8',
      flowColor: isDark ? '#38bdf8' : '#0284c7',
      statusPass: '#10b981',
      statusMarginal: '#f59e0b',
      statusFail: '#f43f5e',
    }),
    [isDark]
  );

  const statusColor =
    status === 'PASS'
      ? pal.statusPass
      : status === 'MARGINAL'
      ? pal.statusMarginal
      : pal.statusFail;

  // Stress heatmap fill colors (emerald -> amber -> crimson)
  const stressColorLight =
    stressUtilizationPct > 100
      ? '#fb7185'
      : stressUtilizationPct > 75
      ? '#fbbf24'
      : '#34d399';
  const stressColorDeep =
    stressUtilizationPct > 100
      ? '#be123c'
      : stressUtilizationPct > 75
      ? '#b45309'
      : '#047857';

  // Scaled geometry helpers
  const lapPlateH = Math.round(34 + ((plateThicknessMm - 6) / 34) * 18); // 34..52 px
  const beadPx = Math.round(28 + ((legSizeMm - 3) / 22) * 26); // 28..54 px

  // Mode 2 scaled bracket geometry
  const bSpanPx = Math.round(72 + ((bracketWidthMm - 50) / 170) * 58); // 72..130 px
  const dHeightPx = Math.round(145 + ((bracketHeightMm - 80) / 220) * 95); // 145..240 px
  const eccSpanPx = Math.round(140 + ((eccentricityMm - 50) / 300) * 180); // 140..320 px

  // Mode 3 scaled butt weld geometry
  const buttPlateH = Math.round(76 + ((plateThicknessMm - 6) / 34) * 60); // 76..136 px
  const buttTopY = 216 - buttPlateH / 2;
  const buttBotY = 216 + buttPlateH / 2;
  const buttCenterX = 266;

  // HTML Header Bar info
  const headerInfo = useMemo(() => {
    const modeTitle =
      mode === 'lap-tee'
        ? pick(
            'AWS D1.1 Fillet Weld Joint Cross-Section',
            'Penampang Sambungan Las Fillet AWS D1.1',
            'AWS D1.1 すみ肉溶接継手断面図'
          )
        : mode === 'eccentric-bracket'
        ? pick(
            'Eccentric Cantilever Bracket Weld Group',
            'Kelompok Las Braket Kantilever Eksentrik',
            '偏心片持ちブラケット溶接群解析'
          )
        : pick(
            'Butt Groove Weld Cross-Section (CJP / PJP)',
            'Penampang Sambungan Kampuh Tumpul (CJP / PJP)',
            '突合せ開先溶接継手断面図 (CJP / PJP)'
          );

    return {
      title: modeTitle,
      subtitle: `${electrode.name} · F_EXX = ${electrode.tensileStrengthMpa} MPa`,
    };
  }, [mode, electrode, pick]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
      {/* Clean HTML CAD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-200">
            {headerInfo.title}
          </span>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            {headerInfo.subtitle}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs border border-slate-400 bg-slate-300 dark:border-slate-500 dark:bg-slate-600" />
            {pick('±45° ISO Hatch', 'Arsiran ISO ±45°', '±45°ハッチング')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60 ring-1 ring-amber-500" />
            HAZ
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            {pick('Throat Stress', 'Tegangan Leher', 'のど断面応力')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            {pick('Force Flow', 'Aliran Gaya', '応力流線')}
          </span>
        </div>
      </div>

      {/* Main Pure-2D Industrial CAD SVG */}
      <svg
        viewBox="0 0 960 500"
        className="mx-auto block max-h-[480px] w-full font-sans select-none"
        style={{ backgroundColor: pal.canvasBg, fontVariantNumeric: 'tabular-nums' }}
      >
        <defs>
          {/* Millimeter CAD Grid */}
          <pattern id={`gridMinor-${uid}`} width="15" height="15" patternUnits="userSpaceOnUse">
            <path
              d="M 15 0 L 0 0 0 15"
              fill="none"
              stroke={pal.gridMinor}
              strokeWidth="0.6"
              strokeOpacity="0.65"
            />
          </pattern>
          <pattern id={`gridMajor-${uid}`} width="75" height="75" patternUnits="userSpaceOnUse">
            <rect width="75" height="75" fill={`url(#gridMinor-${uid})`} />
            <path
              d="M 75 0 L 0 0 0 75"
              fill="none"
              stroke={pal.gridMajor}
              strokeWidth="1"
              strokeOpacity="0.8"
            />
          </pattern>

          {/* ISO 128-50 +45° Section Hatching (Plate A) */}
          <pattern
            id={`hatchPos45-${uid}`}
            width="10"
            height="10"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke={pal.hatchA}
              strokeWidth="1.2"
              strokeOpacity="0.34"
            />
          </pattern>

          {/* ISO 128-50 -45° Opposing Section Hatching (Plate B) */}
          <pattern
            id={`hatchNeg45-${uid}`}
            width="9"
            height="9"
            patternTransform="rotate(-45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="9"
              stroke={pal.hatchB}
              strokeWidth="1.2"
              strokeOpacity="0.30"
            />
          </pattern>

          {/* Dense Rigid Fixture / Column Hatching */}
          <pattern
            id={`hatchWall-${uid}`}
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="8"
              stroke={pal.dimStroke}
              strokeWidth="1.8"
              strokeOpacity="0.45"
            />
          </pattern>

          {/* Steel Plate & Fixture Metallic Gradients */}
          <linearGradient id={`steelA-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pal.plateAStart} />
            <stop offset="50%" stopColor={pal.plateAEnd} />
            <stop offset="100%" stopColor={pal.plateAStart} />
          </linearGradient>
          <linearGradient id={`steelB-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pal.plateBStart} />
            <stop offset="50%" stopColor={pal.plateBEnd} />
            <stop offset="100%" stopColor={pal.plateBStart} />
          </linearGradient>
          <linearGradient id={`fixtureGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={pal.fixtureEnd} />
            <stop offset="45%" stopColor={pal.fixtureStart} />
            <stop offset="100%" stopColor={pal.fixtureEnd} />
          </linearGradient>

          {/* Copper Chill / Backing Bar Metallic Gradient */}
          <linearGradient id={`copperGrad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          {/* Bronze Clevis Bushing Gradient */}
          <radialGradient id={`bronzePin-${uid}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Multi-pass Weld Bead Metallic Gradient */}
          <linearGradient id={`weldMetallic-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={pal.weldHi} />
            <stop offset="38%" stopColor={pal.weldMid} />
            <stop offset="100%" stopColor={pal.weldLo} />
          </linearGradient>

          {/* Dynamic Stress Heatmap Gradient on Throat */}
          <linearGradient id={`throatHeat-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stressColorLight} stopOpacity="0.92" />
            <stop offset="55%" stopColor={statusColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={stressColorDeep} stopOpacity="0.98" />
          </linearGradient>

          {/* HAZ Thermal Gradient */}
          <radialGradient id={`hazThermal-${uid}`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.54" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`hazBand-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>

          {/* Magnifier Viewport Clip */}
          <clipPath id={`detailClip-${uid}`}>
            <circle cx="0" cy="0" r="112" />
          </clipPath>

          {/* CAD Arrowheads */}
          <marker
            id={`arrowDim-${uid}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={pal.dimStroke} />
          </marker>
          <marker
            id={`arrowForce-${uid}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={pal.forceColor} />
          </marker>
          <marker
            id={`arrowMoment-${uid}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={pal.momentColor} />
          </marker>
          <marker
            id={`arrowTauPrime-${uid}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={pal.tauPrimeColor} />
          </marker>
          <marker
            id={`arrowTauDouble-${uid}`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill={pal.tauDoubleColor} />
          </marker>
          <marker
            id={`arrowThroat-${uid}`}
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ffffff" />
          </marker>
        </defs>

        {/* Precision CAD Background Grid & Drawing Sheet Frame */}
        <rect width="960" height="500" fill={`url(#gridMajor-${uid})`} />
        <rect
          x="10"
          y="10"
          width="940"
          height="480"
          rx="8"
          fill="none"
          stroke={pal.frameBorder}
          strokeWidth="1.2"
        />

        {/* ===================================================================== */}
        {/* MODE 1: LAP / T-JOINT FILLET WELD (RIG + FLOW + METALLURGY)           */}
        {/* ===================================================================== */}
        {mode === 'lap-tee' && (
          <g id="mode-lap-tee">
            {/* Heavy Structural Fixture / Clamping Jig on Left */}
            <rect
              x="24"
              y="120"
              width="38"
              height="245"
              fill={`url(#fixtureGrad-${uid})`}
              stroke={pal.plateOutline}
              strokeWidth="1.6"
            />
            <rect x="24" y="120" width="38" height="245" fill={`url(#hatchWall-${uid})`} />
            {/* Machined Clamp Jaw gripping Base Plate */}
            <path
              d={`M 62 224 L 96 224 L 96 245 L 62 245 Z M 62 ${245 + lapPlateH} L 104 ${
                245 + lapPlateH
              } L 104 ${245 + lapPlateH + 22} L 62 ${245 + lapPlateH + 22} Z`}
              fill={`url(#fixtureGrad-${uid})`}
              stroke={pal.plateOutline}
              strokeWidth="1.4"
            />
            {/* Clamping Hex Flange Bolts */}
            {[150, 234, 336].map((by) => (
              <g key={`bolt-m1-${by}`} transform={`translate(62, ${by})`}>
                <rect
                  x="-11"
                  y="-6"
                  width="11"
                  height="12"
                  rx="1.5"
                  fill={pal.plateBStart}
                  stroke={pal.plateOutline}
                  strokeWidth="1.2"
                />
                <line x1="-11" y1="0" x2="0" y2="0" stroke={pal.plateOutline} strokeWidth="0.9" />
                <rect
                  x="0"
                  y="-8"
                  width="3"
                  height="16"
                  fill={pal.dimStroke}
                />
              </g>
            ))}

            {/* Bottom Base Plate (Fixed) with +45° ISO Section Hatching */}
            <rect
              x="62"
              y="245"
              width="286"
              height={lapPlateH}
              fill={`url(#steelA-${uid})`}
              stroke={pal.plateOutline}
              strokeWidth="2"
            />
            <rect x="62" y="245" width="286" height={lapPlateH} fill={`url(#hatchPos45-${uid})`} />
            {/* Plate Label Pill */}
            <rect
              x="76"
              y={245 + lapPlateH / 2 - 10}
              width="104"
              height="20"
              rx="4"
              fill={pal.cardBg}
              fillOpacity="0.92"
              stroke={pal.cardBorder}
              strokeWidth="0.8"
            />
            <text
              x="128"
              y={245 + lapPlateH / 2 + 4}
              fill={pal.textPrimary}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
            >
              {pick('Base Plate', 'Pelat Dasar', '下部母材')}
            </text>

            {/* Top Lap Plate with -45° ISO Section Hatching */}
            <rect
              x="196"
              y={245 - lapPlateH}
              width="226"
              height={lapPlateH}
              fill={`url(#steelB-${uid})`}
              stroke={pal.plateOutline}
              strokeWidth="2"
            />
            <rect
              x="196"
              y={245 - lapPlateH}
              width="226"
              height={lapPlateH}
              fill={`url(#hatchNeg45-${uid})`}
            />
            {/* Machined Hydraulic Pull-Clevis Jaw on Right */}
            <g transform={`translate(416, ${245 - lapPlateH / 2})`}>
              <path
                d={`M -16 ${-lapPlateH / 2 - 6} L 24 ${-lapPlateH / 2 - 6} L 32 -12 L 32 12 L 24 ${
                  lapPlateH / 2 + 6
                } L -16 ${lapPlateH / 2 + 6} L -16 ${lapPlateH / 2} L 6 ${lapPlateH / 2} L 6 ${
                  -lapPlateH / 2
                } L -16 ${-lapPlateH / 2} Z`}
                fill={`url(#fixtureGrad-${uid})`}
                stroke={pal.plateOutline}
                strokeWidth="1.5"
              />
              <circle cx="19" cy="0" r="6" fill={`url(#bronzePin-${uid})`} stroke={pal.plateOutline} strokeWidth="1.2" />
            </g>
            <rect
              x="252"
              y={245 - lapPlateH / 2 - 10}
              width="108"
              height="20"
              rx="4"
              fill={pal.cardBg}
              fillOpacity="0.92"
              stroke={pal.cardBorder}
              strokeWidth="0.8"
            />
            <text
              x="306"
              y={245 - lapPlateH / 2 + 4}
              fill={pal.textPrimary}
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
            >
              {pick('Lap Plate', 'Pelat Tumpang', '重ね板')}
            </text>

            {/* Animated Load-Path Force Flow Streamlines (Lap Plate -> Weld Throat -> Base Plate) */}
            <g ref={flowGroupRef} fill="none" stroke={pal.flowColor} strokeWidth="1.6" opacity="0.72">
              <path
                d={`M 412 ${245 - lapPlateH * 0.65} C 290 ${245 - lapPlateH * 0.65}, 212 ${
                  245 - beadPx * 0.45
                }, ${196 - beadPx * 0.25} 245 C 165 256, 120 ${245 + lapPlateH * 0.45}, 64 ${
                  245 + lapPlateH * 0.45
                }`}
                strokeDasharray="6 6"
              />
              {filletArrangement === 'double' && (
                <path
                  d={`M 412 ${245 - lapPlateH * 0.3} C 378 ${245 - lapPlateH * 0.3}, 360 250, 348 ${
                    245 + beadPx * 0.35
                  } C 310 ${245 + lapPlateH * 0.72}, 180 ${245 + lapPlateH * 0.72}, 64 ${
                    245 + lapPlateH * 0.72
                  }`}
                  strokeDasharray="6 6"
                />
              )}
            </g>

            {/* Live HAZ Thermal Shimmer Envelope */}
            <g ref={hazGroupRef}>
              <circle
                cx={196 - beadPx * 0.35}
                cy={245 - beadPx * 0.35}
                r={beadPx * 1.15}
                fill={`url(#hazThermal-${uid})`}
              />
              {filletArrangement === 'double' && (
                <circle
                  cx={348 + beadPx * 0.35}
                  cy={245 + beadPx * 0.35}
                  r={beadPx * 1.05}
                  fill={`url(#hazThermal-${uid})`}
                />
              )}
            </g>

            {/* Front Fillet Weld at Root (196, 245) */}
            <g transform="translate(196, 245)">
              {/* Root Fusion Penetration Bulb */}
              <path
                d="M 0 0 Q 8 4 0 9 L -9 0 Q -4 -8 0 0 Z"
                fill={`url(#weldMetallic-${uid})`}
                opacity="0.72"
              />

              {/* Convex Weld Bead Profile */}
              <path
                d={`M 0 0 L 0 ${-beadPx} Q ${-beadPx * 0.32} ${-beadPx * 0.68} ${-beadPx} 0 Z`}
                fill={`url(#throatHeat-${uid})`}
                stroke={pal.weldLo}
                strokeWidth="1.8"
              />

              {/* Multi-Pass Weld Bead Ripples (Root/Fill/Cap Metallurgy) */}
              {[0.28, 0.48, 0.68, 0.86].map((rFrac, idx) => (
                <path
                  key={`ripple-f-${idx}`}
                  d={`M ${-beadPx * rFrac * 0.12} ${-beadPx * rFrac} Q ${-beadPx * rFrac * 0.42} ${
                    -beadPx * rFrac * 0.42
                  } ${-beadPx * rFrac} ${-beadPx * rFrac * 0.12}`}
                  fill="none"
                  stroke="rgba(255,255,255,0.52)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              ))}

              {/* Theoretical 45° Face */}
              <line
                x1="0"
                y1={-beadPx}
                x2={-beadPx}
                y2="0"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeDasharray="3 2"
                opacity="0.85"
              />

              {/* Theoretical Throat Line a = 0.707s */}
              <line x1="0" y1="0" x2={-beadPx * 0.5} y2={-beadPx * 0.5} stroke="#ffffff" strokeWidth="3.2" />
              <line x1="0" y1="0" x2={-beadPx * 0.5} y2={-beadPx * 0.5} stroke={statusColor} strokeWidth="2" />
              <circle cx="0" cy="0" r="3.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />

              {/* Elevated Stress Pulse Overlay along Throat */}
              <g ref={stressPulseRef} opacity="0">
                <line
                  x1="0"
                  y1="0"
                  x2={-beadPx * 0.5}
                  y2={-beadPx * 0.5}
                  stroke={statusColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </g>

              {/* HAZ Leader Callout (upper left clear space) */}
              <line
                x1={-beadPx * 0.75}
                y1={-beadPx * 0.45}
                x2={-beadPx - 28}
                y2={-beadPx - 14}
                stroke="#f59e0b"
                strokeWidth="1.2"
              />
              <rect
                x={-beadPx - 64}
                y={-beadPx - 30}
                width="38"
                height="18"
                rx="4"
                fill={pal.cardBg}
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={-beadPx - 45}
                y={-beadPx - 17}
                fill="#f59e0b"
                fontSize="9.5"
                fontWeight="800"
                textAnchor="middle"
              >
                HAZ
              </text>

              {/* Horizontal Leg Dimension s (below base plate) */}
              <line
                x1={-beadPx}
                y1="3"
                x2={-beadPx}
                y2={lapPlateH + 26}
                stroke={pal.dimStroke}
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <line
                x1="0"
                y1={lapPlateH + 3}
                x2="0"
                y2={lapPlateH + 26}
                stroke={pal.dimStroke}
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <line
                x1={-beadPx}
                y1={lapPlateH + 20}
                x2="0"
                y2={lapPlateH + 20}
                stroke={pal.dimStroke}
                strokeWidth="1.3"
                markerStart={`url(#arrowDim-${uid})`}
                markerEnd={`url(#arrowDim-${uid})`}
              />
              <rect
                x={-beadPx / 2 - 32}
                y={lapPlateH + 28}
                width="64"
                height="18"
                rx="4"
                fill={pal.cardBg}
                stroke={pal.cardBorder}
                strokeWidth="0.9"
              />
              <text
                x={-beadPx / 2}
                y={lapPlateH + 41}
                fill={pal.dimText}
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                s = {legSizeMm} mm
              </text>

              {/* Throat Callout Pill above */}
              <line
                x1="0"
                y1={-beadPx}
                x2="0"
                y2={-lapPlateH - 28}
                stroke={pal.dimStroke}
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <line
                x1={-beadPx * 0.35}
                y1={-beadPx * 0.35}
                x2="18"
                y2={-lapPlateH - 22}
                stroke={statusColor}
                strokeWidth="1.2"
              />
              <rect
                x="18"
                y={-lapPlateH - 36}
                width="102"
                height="20"
                rx="5"
                fill={pal.cardBg}
                stroke={statusColor}
                strokeWidth="1.3"
              />
              <text
                x="69"
                y={-lapPlateH - 22}
                fill={statusColor}
                fontSize="10"
                fontWeight="800"
                textAnchor="middle"
              >
                a = {throatMm.toFixed(2)} mm
              </text>
            </g>

            {/* Double Fillet Rear Weld at (348, 245) */}
            {filletArrangement === 'double' && (
              <g transform="translate(348, 245)">
                <path
                  d={`M 0 0 L 0 ${beadPx} Q ${beadPx * 0.32} ${beadPx * 0.68} ${beadPx} 0 Z`}
                  fill={`url(#throatHeat-${uid})`}
                  stroke={pal.weldLo}
                  strokeWidth="1.8"
                />
                {[0.35, 0.6, 0.85].map((rFrac, idx) => (
                  <path
                    key={`ripple-r-${idx}`}
                    d={`M ${beadPx * rFrac * 0.12} ${beadPx * rFrac} Q ${beadPx * rFrac * 0.42} ${
                      beadPx * rFrac * 0.42
                    } ${beadPx * rFrac} ${beadPx * rFrac * 0.12}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                ))}
                <line x1="0" y1="0" x2={beadPx * 0.5} y2={beadPx * 0.5} stroke={statusColor} strokeWidth="2" />
                <circle cx="0" cy="0" r="3" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
                <rect
                  x={beadPx + 8}
                  y="8"
                  width="92"
                  height="18"
                  rx="4"
                  fill={pal.cardBg}
                  stroke={pal.cardBorder}
                  strokeWidth="0.9"
                />
                <text
                  x={beadPx + 54}
                  y="20"
                  fill={pal.textSecondary}
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {pick('Rear Fillet (2x)', 'Fillet Belakang', '裏面すみ肉')}
                </text>
              </g>
            )}

            {/* Plate Thickness Dimension t (Positioned cleanly at bottom-left clear zone) */}
            <g transform="translate(76, 245)">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={lapPlateH}
                stroke={pal.dimStroke}
                strokeWidth="1.2"
                markerStart={`url(#arrowDim-${uid})`}
                markerEnd={`url(#arrowDim-${uid})`}
              />
              <line x1="0" y1={lapPlateH} x2="0" y2="112" stroke={pal.dimStroke} strokeWidth="0.9" strokeDasharray="2 2" />
              <rect
                x="-12"
                y="112"
                width="68"
                height="18"
                rx="4"
                fill={pal.cardBg}
                stroke={pal.cardBorder}
                strokeWidth="0.9"
              />
              <text x="22" y="124" fill={pal.dimText} fontSize="9.5" fontWeight="700" textAnchor="middle">
                t = {plateThicknessMm} mm
              </text>
            </g>

            {/* Applied Force Vector F */}
            <g transform={`translate(448, ${245 - lapPlateH / 2})`}>
              <line
                x1="0"
                y1="0"
                x2="78"
                y2="0"
                stroke={pal.forceColor}
                strokeWidth="4"
                markerEnd={`url(#arrowForce-${uid})`}
              />
              <rect
                x="4"
                y="-34"
                width="90"
                height="22"
                rx="5"
                fill={pal.cardBg}
                stroke={pal.forceColor}
                strokeWidth="1.4"
              />
              <text x="49" y="-19" fill={pal.forceColor} fontSize="11" fontWeight="800" textAnchor="middle">
                F = {loadKn} kN
              </text>
              <rect
                x="0"
                y="14"
                width="98"
                height="18"
                rx="4"
                fill={pal.cardBg}
                stroke={pal.cardBorder}
                strokeWidth="0.8"
              />
              <text x="49" y="26" fill={pal.textSecondary} fontSize="9.5" fontWeight="600" textAnchor="middle">
                {weldOrientation === 'transverse'
                  ? pick('Transverse (90°)', 'Transversal (90°)', '前面直角 (90°)')
                  : pick('Parallel (0°)', 'Paralel (0°)', '側面平行 (0°)')}
              </text>
            </g>

            {/* Magnifier Callout Ring & Leader to Detail A */}
            <circle
              cx={196 - beadPx * 0.4}
              cy={245 - beadPx * 0.4}
              r={beadPx * 0.85}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
            <path
              d={`M ${196 + beadPx * 0.35} ${245 - beadPx * 0.85} L 385 96 L 575 96`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Bottom Summary Pill */}
            <g transform="translate(24, 436)">
              <rect
                x="0"
                y="0"
                width="528"
                height="36"
                rx="8"
                fill={pal.cardBg}
                stroke={pal.cardBorder}
                strokeWidth="1"
              />
              <text x="14" y="22" fill={pal.textSecondary} fontSize="10" fontWeight="600">
                {pick('Effective Length', 'Panjang Efektif', '有効溶接長')}:
              </text>
              <text x="148" y="22" fill={pal.textPrimary} fontSize="10.5" fontWeight="800">
                L_eff = {results.effectiveLengthMm.toFixed(0)} mm ({filletArrangement === 'double' ? '2×' : '1×'}
                {weldLengthMm} mm)
              </text>
              <text x="514" y="22" fill={statusColor} fontSize="10.5" fontWeight="800" textAnchor="end">
                {weldOrientation === 'transverse' ? 'AWS 1.5× Transv.' : 'AWS 1.0× Parallel'}
              </text>
            </g>
          </g>
        )}

        {/* ===================================================================== */}
        {/* MODE 2: ECCENTRIC CANTILEVER BRACKET WELD GROUP                       */}
        {/* ===================================================================== */}
        {mode === 'eccentric-bracket' && (
          <g id="mode-eccentric-bracket">
            {/* Heavy Bolted Structural Column Flange on Left */}
            <rect
              x="24"
              y="44"
              width="44"
              height="364"
              fill={`url(#fixtureGrad-${uid})`}
              stroke={pal.plateOutline}
              strokeWidth="1.6"
            />
            <rect x="24" y="44" width="44" height="364" fill={`url(#hatchWall-${uid})`} />
            <line x1="68" y1="40" x2="68" y2="412" stroke={pal.plateOutline} strokeWidth="3.2" />

            {/* Column Mounting Flange & 4 Structural Anchor Hex Bolts */}
            {[64, 108, 346, 390].map((by) => (
              <g key={`col-bolt-${by}`} transform={`translate(68, ${by})`}>
                <rect
                  x="-14"
                  y="-6"
                  width="14"
                  height="12"
                  rx="1.5"
                  fill={pal.plateBStart}
                  stroke={pal.plateOutline}
                  strokeWidth="1.2"
                />
                <line x1="-14" y1="0" x2="0" y2="0" stroke={pal.plateOutline} strokeWidth="0.9" />
                <rect x="0" y="-8" width="4" height="16" fill={pal.dimStroke} />
              </g>
            ))}

            <text
              x="44"
              y="228"
              fill={pal.textPrimary}
              fontSize="9.5"
              fontWeight="800"
              transform="rotate(-90 44 228)"
              textAnchor="middle"
              letterSpacing="1"
            >
              {pick('BOLTED COLUMN FLANGE', 'FLENS KOLOM BERBAUT', 'ボルト固定支持柱')}
            </text>

            {/* Bracket Geometry Calculations in SVG Space */}
            {(() => {
              const bTopY = 228 - dHeightPx / 2;
              const bBotY = 228 + dHeightPx / 2;
              const weldStartX = 72;
              const weldEndX = weldStartX + bSpanPx;
              const gX = weldStartX + (centroidXmm / Math.max(1, bracketWidthMm)) * bSpanPx;
              const gY = bTopY + (centroidYmm / Math.max(1, bracketHeightMm)) * dHeightPx;
              const loadX = Math.min(495, Math.max(weldEndX + 46, gX + eccSpanPx * 0.7));
              const loadY = 228;

              const critX = bracketPattern === 'two-vertical' ? weldStartX + 4 : weldEndX;
              const critY = bTopY + 3;

              return (
                <>
                  {/* Cantilever Bracket Plate (+45° ISO Section Hatching) */}
                  <path
                    d={`M ${weldStartX} ${bTopY} L ${weldEndX + 24} ${bTopY} L ${loadX + 20} ${
                      loadY - 26
                    } L ${loadX + 20} ${loadY + 26} L ${weldEndX + 24} ${bBotY} L ${weldStartX} ${bBotY} Z`}
                    fill={`url(#steelA-${uid})`}
                    stroke={pal.plateOutline}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M ${weldStartX} ${bTopY} L ${weldEndX + 24} ${bTopY} L ${loadX + 20} ${
                      loadY - 26
                    } L ${loadX + 20} ${loadY + 26} L ${weldEndX + 24} ${bBotY} L ${weldStartX} ${bBotY} Z`}
                    fill={`url(#hatchPos45-${uid})`}
                  />

                  {/* Load-Path Force Flow Streamlines (Clevis Pin -> Critical Weld Corners) */}
                  <g ref={flowGroupRef} fill="none" stroke={pal.flowColor} strokeWidth="1.6" opacity="0.7">
                    <path
                      d={`M ${loadX - 10} ${loadY - 8} C ${loadX - 55} ${loadY - 18}, ${
                        weldEndX + 10
                      } ${bTopY + 22}, ${critX} ${critY + 4}`}
                      strokeDasharray="6 6"
                    />
                    <path
                      d={`M ${loadX - 10} ${loadY + 8} C ${loadX - 55} ${loadY + 18}, ${
                        weldEndX + 10
                      } ${bBotY - 22}, ${critX} ${bBotY - 6}`}
                      strokeDasharray="6 6"
                    />
                  </g>

                  {/* Calibrated Bronze-Bushed Clevis Load Pin */}
                  <circle
                    cx={loadX}
                    cy={loadY}
                    r="13"
                    fill={`url(#bronzePin-${uid})`}
                    stroke={pal.plateOutline}
                    strokeWidth="2"
                  />
                  <circle cx={loadX} cy={loadY} r="5.5" fill={pal.cardBg} stroke={pal.plateOutline} strokeWidth="1.5" />

                  {/* Live HAZ Shimmer along Weld Group */}
                  <g ref={hazGroupRef}>
                    {bracketPattern === 'two-vertical' &&
                      [weldStartX + 4, weldEndX].map((wx, wi) => (
                        <line
                          key={`haz-vw-${wi}`}
                          x1={wx}
                          y1={bTopY + 3}
                          x2={wx}
                          y2={bBotY - 3}
                          stroke="#f97316"
                          strokeWidth="14"
                          strokeOpacity="0.28"
                          strokeLinecap="round"
                        />
                      ))}
                    {bracketPattern === 'two-horizontal' &&
                      [bTopY + 3, bBotY - 3].map((wy, wi) => (
                        <line
                          key={`haz-hw-${wi}`}
                          x1={weldStartX + 3}
                          y1={wy}
                          x2={weldEndX}
                          y2={wy}
                          stroke="#f97316"
                          strokeWidth="14"
                          strokeOpacity="0.28"
                          strokeLinecap="round"
                        />
                      ))}
                    {bracketPattern === 'channel-c' && (
                      <path
                        d={`M ${weldEndX} ${bTopY + 3} L ${weldStartX + 4} ${bTopY + 3} L ${
                          weldStartX + 4
                        } ${bBotY - 3} L ${weldEndX} ${bBotY - 3}`}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="14"
                        strokeOpacity="0.28"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </g>

                  {/* Active Weld Group Pattern */}
                  {bracketPattern === 'two-vertical' && (
                    <g>
                      {[weldStartX + 4, weldEndX].map((wx, wi) => (
                        <line
                          key={`vw-${wi}`}
                          x1={wx}
                          y1={bTopY + 3}
                          x2={wx}
                          y2={bBotY - 3}
                          stroke={`url(#throatHeat-${uid})`}
                          strokeWidth="7.5"
                          strokeLinecap="round"
                        />
                      ))}
                    </g>
                  )}

                  {bracketPattern === 'two-horizontal' && (
                    <g>
                      {[bTopY + 3, bBotY - 3].map((wy, wi) => (
                        <line
                          key={`hw-${wi}`}
                          x1={weldStartX + 3}
                          y1={wy}
                          x2={weldEndX}
                          y2={wy}
                          stroke={`url(#throatHeat-${uid})`}
                          strokeWidth="7.5"
                          strokeLinecap="round"
                        />
                      ))}
                    </g>
                  )}

                  {bracketPattern === 'channel-c' && (
                    <path
                      d={`M ${weldEndX} ${bTopY + 3} L ${weldStartX + 4} ${bTopY + 3} L ${
                        weldStartX + 4
                      } ${bBotY - 3} L ${weldEndX} ${bBotY - 3}`}
                      fill="none"
                      stroke={`url(#throatHeat-${uid})`}
                      strokeWidth="7.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Centroid Marker G */}
                  <g transform={`translate(${gX}, ${gY})`}>
                    <line
                      x1="0"
                      y1={-dHeightPx / 2 - 48}
                      x2="0"
                      y2={dHeightPx / 2 + 12}
                      stroke={pal.centroidColor}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx="0" cy="0" r="8" fill={pal.cardBg} stroke={pal.centroidColor} strokeWidth="2" />
                    <line x1="-11" y1="0" x2="11" y2="0" stroke={pal.centroidColor} strokeWidth="1.5" />
                    <line x1="0" y1="-11" x2="0" y2="11" stroke={pal.centroidColor} strokeWidth="1.5" />
                    <rect
                      x="10"
                      y="8"
                      width="24"
                      height="16"
                      rx="3"
                      fill={pal.cardBg}
                      stroke={pal.centroidColor}
                      strokeWidth="1"
                    />
                    <text
                      x="22"
                      y="19"
                      fill={pal.centroidColor}
                      fontSize="9.5"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      G
                    </text>
                  </g>

                  {/* Eccentricity e Dimension Line (Top clear area) */}
                  <line
                    x1={loadX}
                    y1={loadY - 14}
                    x2={loadX}
                    y2="52"
                    stroke={pal.dimStroke}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={gX}
                    y1="62"
                    x2={loadX}
                    y2="62"
                    stroke={pal.dimStroke}
                    strokeWidth="1.4"
                    markerStart={`url(#arrowDim-${uid})`}
                    markerEnd={`url(#arrowDim-${uid})`}
                  />
                  <rect
                    x={(gX + loadX) / 2 - 44}
                    y="38"
                    width="88"
                    height="20"
                    rx="4"
                    fill={pal.cardBg}
                    stroke={pal.cardBorder}
                    strokeWidth="1"
                  />
                  <text
                    x={(gX + loadX) / 2}
                    y="52"
                    fill={pal.dimText}
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    e = {eccentricityMm} mm
                  </text>

                  {/* Width b Dimension */}
                  <line
                    x1={weldStartX + 4}
                    y1={bBotY + 18}
                    x2={weldEndX}
                    y2={bBotY + 18}
                    stroke={pal.dimStroke}
                    strokeWidth="1.2"
                    markerStart={`url(#arrowDim-${uid})`}
                    markerEnd={`url(#arrowDim-${uid})`}
                  />
                  <rect
                    x={(weldStartX + weldEndX) / 2 - 30}
                    y={bBotY + 24}
                    width="60"
                    height="17"
                    rx="4"
                    fill={pal.cardBg}
                    stroke={pal.cardBorder}
                    strokeWidth="0.9"
                  />
                  <text
                    x={(weldStartX + weldEndX) / 2}
                    y={bBotY + 36}
                    fill={pal.dimText}
                    fontSize="9.5"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    b = {bracketWidthMm}
                  </text>

                  {/* Critical Corner Stress Vectors & Stress Pulse */}
                  <g transform={`translate(${critX}, ${critY})`}>
                    <g ref={stressPulseRef} opacity="0">
                      <circle cx="0" cy="0" r="14" fill="none" stroke={statusColor} strokeWidth="3.5" />
                    </g>
                    <circle cx="0" cy="0" r="5" fill={pal.forceColor} stroke="#ffffff" strokeWidth="1.2" />
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="34"
                      stroke={pal.tauPrimeColor}
                      strokeWidth="2.5"
                      markerEnd={`url(#arrowTauPrime-${uid})`}
                    />
                    <line
                      x1="0"
                      y1="0"
                      x2="26"
                      y2="24"
                      stroke={pal.tauDoubleColor}
                      strokeWidth="2.5"
                      markerEnd={`url(#arrowTauDouble-${uid})`}
                    />
                  </g>

                  {/* Downward Force Vector F */}
                  <g transform={`translate(${loadX}, ${loadY})`}>
                    <line
                      x1="0"
                      y1="15"
                      x2="0"
                      y2="78"
                      stroke={pal.forceColor}
                      strokeWidth="4"
                      markerEnd={`url(#arrowForce-${uid})`}
                    />
                    <rect
                      x="-44"
                      y="86"
                      width="88"
                      height="22"
                      rx="5"
                      fill={pal.cardBg}
                      stroke={pal.forceColor}
                      strokeWidth="1.4"
                    />
                    <text x="0" y="101" fill={pal.forceColor} fontSize="11" fontWeight="800" textAnchor="middle">
                      F = {loadKn} kN
                    </text>
                  </g>

                  {/* Magnifier Leader to Detail A */}
                  <circle
                    cx={critX}
                    cy={critY}
                    r="16"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.3"
                    strokeDasharray="4 3"
                  />
                  <path
                    d={`M ${critX + 16} ${critY - 4} L 420 82 L 575 82`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                </>
              );
            })()}

            {/* Bottom Vector Breakdown HUD inside Mode 2 */}
            <g transform="translate(24, 420)">
              <rect
                x="0"
                y="0"
                width="528"
                height="52"
                rx="8"
                fill={pal.cardBg}
                stroke={pal.cardBorder}
                strokeWidth="1"
              />
              <text x="14" y="21" fill={pal.tauPrimeColor} fontSize="10.5" fontWeight="800">
                τ′ = {primaryDirectShearMpa.toFixed(1)} MPa
              </text>
              <text x="14" y="39" fill={pal.textSecondary} fontSize="9.5">
                {pick('Primary Direct Shear', 'Geser Langsung Primer', '一次直接せん断')}
              </text>

              <text x="160" y="21" fill={pal.tauDoubleColor} fontSize="10.5" fontWeight="800">
                τ″ = {secondaryMomentStressMpa.toFixed(1)} MPa
              </text>
              <text x="160" y="39" fill={pal.textSecondary} fontSize="9.5">
                {pick('Secondary Torsion', 'Torsi Sekunder', '二次ねじりせん断')}
              </text>

              <text x="312" y="21" fill={statusColor} fontSize="10.5" fontWeight="800">
                τ_max = {peakCombinedStressMpa.toFixed(1)} MPa
              </text>
              <text x="312" y="39" fill={pal.textSecondary} fontSize="9.5">
                M = {(bendingMomentNm / 1000).toFixed(2)} kN·m · d = {bracketHeightMm} mm
              </text>
            </g>
          </g>
        )}

        {/* ===================================================================== */}
        {/* MODE 3: BUTT GROOVE WELD (CHILL BAR, BEVELS, MULTI-PASS, CJP/PJP)     */}
        {/* ===================================================================== */}
        {mode === 'butt-joint' && (
          <g id="mode-butt-joint">
            {/* Left Hydraulic Clamping Vise Fixture */}
            <rect
              x="24"
              y={buttTopY - 26}
              width="34"
              height={buttPlateH + 52}
              fill={`url(#fixtureGrad-${uid})`}
              stroke={pal.plateOutline}
              strokeWidth="1.5"
            />
            <rect
              x="24"
              y={buttTopY - 26}
              width="34"
              height={buttPlateH + 52}
              fill={`url(#hatchWall-${uid})`}
            />
            <line
              x1="58"
              y1={buttTopY - 30}
              x2="58"
              y2={buttBotY + 30}
              stroke={pal.plateOutline}
              strokeWidth="3"
            />

            {/* Groove Geometry Parameters */}
            {(() => {
              const bevelHalfTop =
                grooveType === 'square' ? 4 : grooveType === 'double-v' ? 28 : grooveType === 'single-u' ? 24 : 34;
              const bevelHalfBot =
                grooveType === 'square' ? 4 : grooveType === 'double-v' ? 28 : 4;
              const rootFaceY = grooveType === 'double-v' ? 216 : buttBotY - 12;
              const isPjp = penetrationType === 'pjp';
              const pjpDepthY = buttTopY + buttPlateH * 0.75;

              const leftPlatePath =
                grooveType === 'single-u'
                  ? `M 58 ${buttTopY} L ${buttCenterX - bevelHalfTop} ${buttTopY} Q ${
                      buttCenterX - bevelHalfTop + 4
                    } ${rootFaceY - 6} ${buttCenterX - 4} ${rootFaceY} L ${
                      buttCenterX - 4
                    } ${buttBotY} L 58 ${buttBotY} Z`
                  : grooveType === 'double-v'
                  ? `M 58 ${buttTopY} L ${buttCenterX - bevelHalfTop} ${buttTopY} L ${
                      buttCenterX - 4
                    } 216 L ${buttCenterX - bevelHalfBot} ${buttBotY} L 58 ${buttBotY} Z`
                  : grooveType === 'single-v'
                  ? `M 58 ${buttTopY} L ${buttCenterX - bevelHalfTop} ${buttTopY} L ${
                      buttCenterX - 4
                    } ${rootFaceY} L ${buttCenterX - 4} ${buttBotY} L 58 ${buttBotY} Z`
                  : `M 58 ${buttTopY} L ${buttCenterX - 4} ${buttTopY} L ${
                      buttCenterX - 4
                    } ${buttBotY} L 58 ${buttBotY} Z`;

              const rightPlatePath =
                grooveType === 'single-u'
                  ? `M 454 ${buttTopY} L ${buttCenterX + bevelHalfTop} ${buttTopY} Q ${
                      buttCenterX + bevelHalfTop - 4
                    } ${rootFaceY - 6} ${buttCenterX + 4} ${rootFaceY} L ${
                      buttCenterX + 4
                    } ${buttBotY} L 454 ${buttBotY} Z`
                  : grooveType === 'double-v'
                  ? `M 454 ${buttTopY} L ${buttCenterX + bevelHalfTop} ${buttTopY} L ${
                      buttCenterX + 4
                    } 216 L ${buttCenterX + bevelHalfBot} ${buttBotY} L 454 ${buttBotY} Z`
                  : grooveType === 'single-v'
                  ? `M 454 ${buttTopY} L ${buttCenterX + bevelHalfTop} ${buttTopY} L ${
                      buttCenterX + 4
                    } ${rootFaceY} L ${buttCenterX + 4} ${buttBotY} L 454 ${buttBotY} Z`
                  : `M 454 ${buttTopY} L ${buttCenterX + 4} ${buttTopY} L ${
                      buttCenterX + 4
                    } ${buttBotY} L 454 ${buttBotY} Z`;

              const weldFillBottomY = isPjp ? pjpDepthY : buttBotY;
              const weldPoly =
                grooveType === 'single-v'
                  ? `${buttCenterX - bevelHalfTop},${buttTopY} ${buttCenterX + bevelHalfTop},${buttTopY} ${
                      buttCenterX + (isPjp ? 10 : 4)
                    },${weldFillBottomY} ${buttCenterX - (isPjp ? 10 : 4)},${weldFillBottomY}`
                  : grooveType === 'double-v'
                  ? `${buttCenterX - bevelHalfTop},${buttTopY} ${buttCenterX + bevelHalfTop},${buttTopY} ${
                      buttCenterX + 4
                    },216 ${buttCenterX + bevelHalfBot},${buttBotY} ${
                      buttCenterX - bevelHalfBot
                    },${buttBotY} ${buttCenterX - 4},216`
                  : `${buttCenterX - bevelHalfTop},${buttTopY} ${buttCenterX + bevelHalfTop},${buttTopY} ${
                      buttCenterX + 5
                    },${weldFillBottomY} ${buttCenterX - 5},${weldFillBottomY}`;

              return (
                <>
                  {/* Left Plate (+45° ISO Section Hatching) */}
                  <path
                    d={leftPlatePath}
                    fill={`url(#steelA-${uid})`}
                    stroke={pal.plateOutline}
                    strokeWidth="2"
                  />
                  <path d={leftPlatePath} fill={`url(#hatchPos45-${uid})`} />
                  <rect
                    x="86"
                    y="206"
                    width="92"
                    height="20"
                    rx="4"
                    fill={pal.cardBg}
                    fillOpacity="0.92"
                    stroke={pal.cardBorder}
                    strokeWidth="0.8"
                  />
                  <text x="132" y="220" fill={pal.textPrimary} fontSize="10" fontWeight="700" textAnchor="middle">
                    {pick('Plate 1', 'Pelat 1', '母材 1')} (t={plateThicknessMm})
                  </text>

                  {/* Right Plate (-45° ISO Section Hatching) */}
                  <path
                    d={rightPlatePath}
                    fill={`url(#steelB-${uid})`}
                    stroke={pal.plateOutline}
                    strokeWidth="2"
                  />
                  <path d={rightPlatePath} fill={`url(#hatchNeg45-${uid})`} />
                  <rect
                    x="342"
                    y="206"
                    width="94"
                    height="20"
                    rx="4"
                    fill={pal.cardBg}
                    fillOpacity="0.92"
                    stroke={pal.cardBorder}
                    strokeWidth="0.8"
                  />
                  <text x="389" y="220" fill={pal.textPrimary} fontSize="10" fontWeight="700" textAnchor="middle">
                    {pick('Plate 2', 'Pelat 2', '母材 2')} (w={plateWidthMm})
                  </text>

                  {/* Machined Copper Chill / Steel Backing Bar Fixture underneath Butt Root */}
                  <g transform={`translate(${buttCenterX}, ${buttBotY + 2})`}>
                    {/* Copper Chill Bar with central root backing recess */}
                    <path
                      d="M -48 0 L -10 0 Q 0 8 10 0 L 48 0 L 48 14 L -48 14 Z"
                      fill={`url(#copperGrad-${uid})`}
                      stroke={pal.weldLo}
                      strokeWidth="1.4"
                    />
                    {/* Steel Clamp Retaining Shoe */}
                    <rect
                      x="-64"
                      y="14"
                      width="128"
                      height="11"
                      rx="2"
                      fill={`url(#fixtureGrad-${uid})`}
                      stroke={pal.plateOutline}
                      strokeWidth="1.2"
                    />
                    {/* Two Backing Clamp Screws */}
                    {[-52, 52].map((bx) => (
                      <rect
                        key={`bak-bolt-${bx}`}
                        x={bx - 4}
                        y="25"
                        width="8"
                        height="8"
                        rx="1"
                        fill={pal.plateBStart}
                        stroke={pal.plateOutline}
                        strokeWidth="1"
                      />
                    ))}
                  </g>

                  {/* Backing Bar Label Pill (Left bottom clear zone) */}
                  <line
                    x1={buttCenterX - 42}
                    y1={buttBotY + 14}
                    x2="188"
                    y2={buttBotY + 42}
                    stroke="#d97706"
                    strokeWidth="1.1"
                  />
                  <rect
                    x="62"
                    y={buttBotY + 34}
                    width="136"
                    height="19"
                    rx="4"
                    fill={pal.cardBg}
                    stroke="#d97706"
                    strokeWidth="1"
                  />
                  <text x="130" y={buttBotY + 47} fill="#d97706" fontSize="9.2" fontWeight="800" textAnchor="middle">
                    {pick('Copper Chill Backing Bar', 'Batang Penahan Tembaga', '銅裏当て金治具')}
                  </text>

                  {/* Animated Load-Path Force Flow Streamlines across Butt Throat */}
                  <g ref={flowGroupRef} fill="none" stroke={pal.flowColor} strokeWidth="1.5" opacity="0.72">
                    <path
                      d={`M 450 ${buttTopY + buttPlateH * 0.22} C 355 ${buttTopY + buttPlateH * 0.22}, 290 ${
                        buttTopY + buttPlateH * 0.22
                      }, ${buttCenterX} ${buttTopY + buttPlateH * 0.22} L 60 ${buttTopY + buttPlateH * 0.22}`}
                      strokeDasharray="6 6"
                    />
                    <path
                      d={`M 450 ${buttTopY + buttPlateH * 0.78} C 360 ${buttTopY + buttPlateH * 0.78}, 315 ${
                        isPjp ? buttTopY + buttPlateH * 0.56 : buttTopY + buttPlateH * 0.78
                      }, ${buttCenterX} ${
                        isPjp ? buttTopY + buttPlateH * 0.56 : buttTopY + buttPlateH * 0.78
                      } C 215 ${isPjp ? buttTopY + buttPlateH * 0.56 : buttTopY + buttPlateH * 0.78}, 165 ${
                        buttTopY + buttPlateH * 0.78
                      }, 60 ${buttTopY + buttPlateH * 0.78}`}
                      strokeDasharray="6 6"
                    />
                  </g>

                  {/* Live HAZ Thermal Shimmer Boundary Bands */}
                  <g ref={hazGroupRef}>
                    <rect
                      x={buttCenterX - bevelHalfTop - 10}
                      y={buttTopY}
                      width={bevelHalfTop * 2 + 20}
                      height={buttPlateH}
                      fill={`url(#hazBand-${uid})`}
                    />
                  </g>

                  {/* Multi-Pass Weld Metal Deposit */}
                  <polygon
                    points={weldPoly}
                    fill={`url(#throatHeat-${uid})`}
                    stroke={pal.weldLo}
                    strokeWidth="1.6"
                  />

                  {/* Multi-Pass Weld Metallurgy: Root Pass, Fill Passes, Cover Pass Ripples */}
                  {[0.24, 0.46, 0.68].map((f, idx) => {
                    const py = buttTopY + buttPlateH * f;
                    const halfSpan = Math.max(6, bevelHalfTop * (1 - f * 0.72));
                    return (
                      <path
                        key={`pass-${idx}`}
                        d={`M ${buttCenterX - halfSpan} ${py} Q ${buttCenterX} ${py + 6} ${
                          buttCenterX + halfSpan
                        } ${py}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.2"
                      />
                    );
                  })}

                  {/* Top Crown Cap Reinforcement */}
                  <path
                    d={`M ${buttCenterX - bevelHalfTop - 3} ${buttTopY} Q ${buttCenterX} ${
                      buttTopY - 14
                    } ${buttCenterX + bevelHalfTop + 3} ${buttTopY} Z`}
                    fill={`url(#weldMetallic-${uid})`}
                    stroke={pal.weldLo}
                    strokeWidth="1.5"
                  />

                  {/* Bottom Root Pass (CJP) or Unfused Root Discontinuity (PJP) */}
                  {!isPjp ? (
                    <path
                      d={`M ${buttCenterX - 8} ${buttBotY} Q ${buttCenterX} ${buttBotY + 9} ${
                        buttCenterX + 8
                      } ${buttBotY} Z`}
                      fill={`url(#weldMetallic-${uid})`}
                      stroke={pal.weldLo}
                      strokeWidth="1.5"
                    />
                  ) : (
                    <g>
                      <rect
                        x={buttCenterX - 4}
                        y={pjpDepthY}
                        width="8"
                        height={buttBotY - pjpDepthY}
                        fill={pal.canvasBg}
                        stroke="#f43f5e"
                        strokeWidth="1.4"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1={buttCenterX + 4}
                        y1={buttBotY - 8}
                        x2={buttCenterX + 54}
                        y2={buttBotY + 42}
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                      />
                      <rect
                        x={buttCenterX + 54}
                        y={buttBotY + 34}
                        width="138"
                        height="19"
                        rx="4"
                        fill={pal.cardBg}
                        stroke="#f43f5e"
                        strokeWidth="1.1"
                      />
                      <text
                        x={buttCenterX + 123}
                        y={buttBotY + 47}
                        fill="#f43f5e"
                        fontSize="9.2"
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        {pick('Unfused Root (PJP)', 'Akar Tak Menyatu (PJP)', '未溶融ルート (PJP)')}
                      </text>
                    </g>
                  )}

                  {/* Effective Throat Axis Line & Elevated Stress Pulse */}
                  <line
                    x1={buttCenterX}
                    y1={buttTopY}
                    x2={buttCenterX}
                    y2={weldFillBottomY}
                    stroke="#ffffff"
                    strokeWidth="2.8"
                  />
                  <line
                    x1={buttCenterX}
                    y1={buttTopY}
                    x2={buttCenterX}
                    y2={weldFillBottomY}
                    stroke={statusColor}
                    strokeWidth="1.8"
                    strokeDasharray={isPjp ? '4 2' : 'none'}
                  />
                  <g ref={stressPulseRef} opacity="0">
                    <line
                      x1={buttCenterX}
                      y1={buttTopY}
                      x2={buttCenterX}
                      y2={weldFillBottomY}
                      stroke={statusColor}
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Bevel Angle / HAZ Callout at Top */}
                  <rect
                    x={buttCenterX - 118}
                    y={buttTopY - 46}
                    width="98"
                    height="20"
                    rx="4"
                    fill={pal.cardBg}
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text
                    x={buttCenterX - 69}
                    y={buttTopY - 32}
                    fill="#f59e0b"
                    fontSize="9.5"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {grooveType === 'single-v'
                      ? '60° V-Bevel + HAZ'
                      : grooveType === 'double-v'
                      ? 'Double-V + HAZ'
                      : grooveType === 'single-u'
                      ? 'J/U-Bevel + HAZ'
                      : 'Square + HAZ'}
                  </text>

                  {/* Throat Dimension Callout */}
                  <rect
                    x={buttCenterX + 16}
                    y={buttTopY - 46}
                    width="116"
                    height="20"
                    rx="4"
                    fill={pal.cardBg}
                    stroke={statusColor}
                    strokeWidth="1.2"
                  />
                  <text
                    x={buttCenterX + 74}
                    y={buttTopY - 32}
                    fill={statusColor}
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    a = {throatMm.toFixed(1)} mm ({penetrationType.toUpperCase()})
                  </text>

                  {/* Plate Thickness t Dimension */}
                  <line
                    x1="74"
                    y1={buttTopY}
                    x2="74"
                    y2={buttBotY}
                    stroke={pal.dimStroke}
                    strokeWidth="1.2"
                    markerStart={`url(#arrowDim-${uid})`}
                    markerEnd={`url(#arrowDim-${uid})`}
                  />
                  <rect
                    x="60"
                    y={buttTopY - 26}
                    width="64"
                    height="18"
                    rx="4"
                    fill={pal.cardBg}
                    stroke={pal.cardBorder}
                    strokeWidth="0.9"
                  />
                  <text x="92" y={buttTopY - 13} fill={pal.dimText} fontSize="9.5" fontWeight="700" textAnchor="middle">
                    t = {plateThicknessMm} mm
                  </text>

                  {/* Axial Pull Vector F */}
                  <g transform="translate(454, 216)">
                    <line
                      x1="0"
                      y1="0"
                      x2="86"
                      y2="0"
                      stroke={pal.forceColor}
                      strokeWidth="4"
                      markerEnd={`url(#arrowForce-${uid})`}
                    />
                    <rect
                      x="6"
                      y="-32"
                      width="84"
                      height="22"
                      rx="5"
                      fill={pal.cardBg}
                      stroke={pal.forceColor}
                      strokeWidth="1.4"
                    />
                    <text x="48" y="-17" fill={pal.forceColor} fontSize="11" fontWeight="800" textAnchor="middle">
                      F = {loadKn} kN
                    </text>
                  </g>

                  {/* Bending Moment Vector M (when M > 0) */}
                  {bendingMomentKnm > 0 && (
                    <g transform="translate(418, 108)">
                      <path
                        d="M 8 32 A 28 28 0 0 1 38 6"
                        fill="none"
                        stroke={pal.momentColor}
                        strokeWidth="3.2"
                        markerEnd={`url(#arrowMoment-${uid})`}
                      />
                      <rect
                        x="-10"
                        y="-20"
                        width="92"
                        height="20"
                        rx="5"
                        fill={pal.cardBg}
                        stroke={pal.momentColor}
                        strokeWidth="1.2"
                      />
                      <text x="36" y="-6" fill={pal.momentColor} fontSize="10" fontWeight="800" textAnchor="middle">
                        M = {bendingMomentKnm} kN·m
                      </text>
                    </g>
                  )}

                  {/* Magnifier Leader to Detail A */}
                  <circle
                    cx={buttCenterX}
                    cy={216}
                    r="24"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.3"
                    strokeDasharray="4 3"
                  />
                  <path
                    d={`M ${buttCenterX + 24} 216 L 485 135 L 575 135`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                </>
              );
            })()}

            {/* Bottom Summary Pill */}
            <g transform="translate(24, 436)">
              <rect
                x="0"
                y="0"
                width="528"
                height="36"
                rx="8"
                fill={pal.cardBg}
                stroke={pal.cardBorder}
                strokeWidth="1"
              />
              <text x="16" y="22" fill={pal.textPrimary} fontSize="10.5" fontWeight="700">
                σ_axial = {primaryDirectShearMpa.toFixed(1)} MPa
              </text>
              <text x="195" y="22" fill={pal.momentColor} fontSize="10.5" fontWeight="700">
                σ_bend = {secondaryMomentStressMpa.toFixed(1)} MPa
              </text>
              <text x="512" y="22" fill={statusColor} fontSize="10.5" fontWeight="800" textAnchor="end">
                σ_peak = {peakCombinedStressMpa.toFixed(1)} MPa
              </text>
            </g>
          </g>
        )}

        {/* ===================================================================== */}
        {/* RIGHT PANEL: 4:1 MAGNIFIED THROAT DETAIL A & TELEMETRY HUD            */}
        {/* ===================================================================== */}
        <g id="detail-a-panel" transform="translate(576, 24)">
          <rect
            x="0"
            y="0"
            width="362"
            height="452"
            rx="12"
            fill={pal.cardBg}
            stroke={pal.cardBorder}
            strokeWidth="1.5"
          />

          {/* Detail Header Bar */}
          <rect
            x="10"
            y="10"
            width="342"
            height="30"
            rx="7"
            fill={pal.canvasBg}
            stroke={pal.cardBorder}
            strokeWidth="1"
          />
          <circle cx="24" cy="25" r="4.5" fill="#38bdf8" />
          <text
            x="36"
            y="29"
            fill={pal.textPrimary}
            fontSize="10.5"
            fontWeight="800"
            letterSpacing="0.4"
          >
            {mode === 'butt-joint'
              ? pick(
                  'DETAIL A: GROOVE THROAT (SCALE 4:1)',
                  'DETAIL A: LEHER KAMPUH (SKALA 4:1)',
                  '詳細図 A：開先のど断面 (4:1拡大)'
                )
              : pick(
                  'DETAIL A: FILLET THROAT (SCALE 4:1)',
                  'DETAIL A: LEHER FILLET (SKALA 4:1)',
                  '詳細図 A：理論のど厚 a=0.707s (4:1)'
                )}
          </text>

          {/* 4:1 Circular Magnifier Viewport */}
          <g transform="translate(181, 168)">
            {/* Viewport Background */}
            <circle cx="0" cy="0" r="112" fill={pal.canvasBg} stroke={pal.cardBorder} strokeWidth="2" />

            {mode !== 'butt-joint' ? (
              /* ---- 4:1 FILLET WELD THROAT CROSS-SECTION ---- */
              <g clipPath={`url(#detailClip-${uid})`}>
                {/* Vertical Base Plate (+45° ISO Hatching) */}
                <rect x="-112" y="-112" width="112" height="224" fill={`url(#steelA-${uid})`} />
                <rect x="-112" y="-112" width="112" height="224" fill={`url(#hatchPos45-${uid})`} />

                {/* Horizontal Base Plate (-45° ISO Hatching) */}
                <rect x="-112" y="20" width="224" height="92" fill={`url(#steelB-${uid})`} />
                <rect x="-112" y="20" width="224" height="92" fill={`url(#hatchNeg45-${uid})`} />

                {/* Plate Boundary Lines intersecting at Root (0, 20) */}
                <line x1="0" y1="-112" x2="0" y2="20" stroke={pal.plateOutline} strokeWidth="2" />
                <line x1="-112" y1="20" x2="112" y2="20" stroke={pal.plateOutline} strokeWidth="2" />

                {/* HAZ Thermal Envelope around Legs */}
                <path
                  d="M 0 -58 L 0 20 L 78 20"
                  fill="none"
                  stroke="#f97316"
                  strokeOpacity="0.28"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Root Penetration Bulb into Corner (0, 20) */}
                <path
                  d="M 0 12 Q -10 22 0 30 Q 8 22 0 12 Z"
                  fill={`url(#throatHeat-${uid})`}
                  opacity="0.75"
                />

                {/* Convex Weld Bead Profile: Root (0,20), Toe1 (0,-54), Toe2 (74,20) */}
                <path
                  d="M 0 -54 Q 52 -34 74 20 L 0 20 Z"
                  fill={`url(#throatHeat-${uid})`}
                  stroke={pal.weldLo}
                  strokeWidth="2"
                />

                {/* Multi-pass Bead Ripples */}
                {[0.32, 0.56, 0.78].map((f, idx) => (
                  <path
                    key={`inset-rip-${idx}`}
                    d={`M ${4 * f} ${20 - 74 * f} Q ${50 * f} ${20 - 38 * f} ${74 * f} ${20 - 4 * f}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="1.2"
                  />
                ))}

                {/* Theoretical 45° Straight Hypotenuse */}
                <line
                  x1="0"
                  y1="-54"
                  x2="74"
                  y2="20"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  strokeDasharray="4 2"
                />

                {/* Theoretical Throat Vector a = 0.7071s: from (0,20) to (37,-17) */}
                <line x1="0" y1="20" x2="37" y2="-17" stroke="#0f172a" strokeWidth="4" opacity="0.4" />
                <line
                  x1="0"
                  y1="20"
                  x2="37"
                  y2="-17"
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  markerStart={`url(#arrowThroat-${uid})`}
                  markerEnd={`url(#arrowThroat-${uid})`}
                />

                {/* Perpendicular 90° Symbol */}
                <path d="M 32 -12 L 27 -17 L 32 -22" fill="none" stroke="#ffffff" strokeWidth="1.3" />

                {/* Root Point Marker */}
                <circle cx="0" cy="20" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
              </g>
            ) : (
              /* ---- 4:1 BUTT GROOVE WELD THROAT & ROOT CROSS-SECTION ---- */
              <g clipPath={`url(#detailClip-${uid})`}>
                {/* Left Plate (+45° ISO Hatching) */}
                <path
                  d="M -112 -46 L -38 -46 L -6 40 L -6 56 L -112 56 Z"
                  fill={`url(#steelA-${uid})`}
                  stroke={pal.plateOutline}
                  strokeWidth="1.8"
                />
                <path
                  d="M -112 -46 L -38 -46 L -6 40 L -6 56 L -112 56 Z"
                  fill={`url(#hatchPos45-${uid})`}
                />
                {/* Right Plate (-45° ISO Hatching) */}
                <path
                  d="M 112 -46 L 38 -46 L 6 40 L 6 56 L 112 56 Z"
                  fill={`url(#steelB-${uid})`}
                  stroke={pal.plateOutline}
                  strokeWidth="1.8"
                />
                <path
                  d="M 112 -46 L 38 -46 L 6 40 L 6 56 L 112 56 Z"
                  fill={`url(#hatchNeg45-${uid})`}
                />
                {/* HAZ Bands */}
                <rect x="-46" y="-46" width="92" height="102" fill={`url(#hazBand-${uid})`} opacity="0.65" />
                {/* Weld Deposit */}
                <polygon
                  points={
                    penetrationType === 'cjp'
                      ? '-38,-46 38,-46 6,56 -6,56'
                      : '-38,-46 38,-46 14,30 -14,30'
                  }
                  fill={`url(#throatHeat-${uid})`}
                  stroke={pal.weldLo}
                  strokeWidth="1.8"
                />
                {/* Reinforcement Crown (excluded from a) */}
                <path
                  d="M -42 -46 Q 0 -68 42 -46 Z"
                  fill={`url(#weldMetallic-${uid})`}
                  stroke={pal.weldLo}
                  strokeWidth="1.5"
                />
                {/* Unfused Root Slit if PJP */}
                {penetrationType === 'pjp' && (
                  <rect
                    x="-5"
                    y="30"
                    width="10"
                    height="26"
                    fill={pal.canvasBg}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Throat Dimension Vector a */}
                <line
                  x1="0"
                  y1="-46"
                  x2="0"
                  y2={penetrationType === 'cjp' ? 56 : 30}
                  stroke="#ffffff"
                  strokeWidth="2.4"
                  markerStart={`url(#arrowThroat-${uid})`}
                  markerEnd={`url(#arrowThroat-${uid})`}
                />
              </g>
            )}

            {/* Outer Magnifier Rim & Crisp Non-Overlapping Annotations */}
            <circle cx="0" cy="0" r="112" fill="none" stroke="#38bdf8" strokeWidth="2.2" />

            {mode !== 'butt-joint' ? (
              <>
                {/* Throat Pill Badge (Top-right clear quadrant) */}
                <rect
                  x="30"
                  y="-62"
                  width="104"
                  height="32"
                  rx="6"
                  fill={pal.cardBg}
                  stroke={statusColor}
                  strokeWidth="1.4"
                />
                <text x="82" y="-48" fill={statusColor} fontSize="10" fontWeight="800" textAnchor="middle">
                  a = {throatMm.toFixed(2)} mm
                </text>
                <text x="82" y="-36" fill={pal.textSecondary} fontSize="8.5" textAnchor="middle">
                  a = 0.7071 × s
                </text>
                <line x1="20" y1="-2" x2="48" y2="-30" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />

                {/* Vertical Leg s Dimension (Left outer edge) */}
                <line
                  x1="-36"
                  y1="-54"
                  x2="-36"
                  y2="20"
                  stroke={pal.dimStroke}
                  strokeWidth="1.2"
                  markerStart={`url(#arrowDim-${uid})`}
                  markerEnd={`url(#arrowDim-${uid})`}
                />
                <rect
                  x="-96"
                  y="-27"
                  width="54"
                  height="18"
                  rx="4"
                  fill={pal.cardBg}
                  stroke={pal.cardBorder}
                  strokeWidth="0.9"
                />
                <text x="-69" y="-14" fill={pal.dimText} fontSize="9.5" fontWeight="700" textAnchor="middle">
                  s = {legSizeMm}
                </text>

                {/* Horizontal Leg s Dimension (Bottom clear area) */}
                <line
                  x1="0"
                  y1="44"
                  x2="74"
                  y2="44"
                  stroke={pal.dimStroke}
                  strokeWidth="1.2"
                  markerStart={`url(#arrowDim-${uid})`}
                  markerEnd={`url(#arrowDim-${uid})`}
                />
                <rect
                  x="5"
                  y="52"
                  width="64"
                  height="18"
                  rx="4"
                  fill={pal.cardBg}
                  stroke={pal.cardBorder}
                  strokeWidth="0.9"
                />
                <text x="37" y="64" fill={pal.dimText} fontSize="9.5" fontWeight="700" textAnchor="middle">
                  s = {legSizeMm} mm
                </text>

                {/* Root Label */}
                <rect
                  x="-64"
                  y="32"
                  width="54"
                  height="17"
                  rx="4"
                  fill={pal.cardBg}
                  stroke="#38bdf8"
                  strokeWidth="0.9"
                />
                <text x="-37" y="44" fill="#38bdf8" fontSize="9" fontWeight="700" textAnchor="middle">
                  Root (R)
                </text>
              </>
            ) : (
              <>
                <rect
                  x="28"
                  y="-76"
                  width="112"
                  height="30"
                  rx="6"
                  fill={pal.cardBg}
                  stroke={statusColor}
                  strokeWidth="1.3"
                />
                <text x="84" y="-62" fill={statusColor} fontSize="10" fontWeight="800" textAnchor="middle">
                  a = {throatMm.toFixed(1)} mm
                </text>
                <text x="84" y="-51" fill={pal.textSecondary} fontSize="8.5" textAnchor="middle">
                  {penetrationType === 'cjp' ? 'CJP (Full t)' : 'PJP (0.75t)'}
                </text>
                <rect
                  x="-96"
                  y="-88"
                  width="96"
                  height="18"
                  rx="4"
                  fill={pal.cardBg}
                  stroke={pal.cardBorder}
                  strokeWidth="0.9"
                />
                <text x="-48" y="-75" fill={pal.textSecondary} fontSize="8.5" fontWeight="700" textAnchor="middle">
                  Crown (AWS Excl.)
                </text>
              </>
            )}
          </g>

          {/* Bottom Engineering Status & Telemetry HUD inside Right Panel */}
          <g transform="translate(12, 304)">
            <rect
              x="0"
              y="0"
              width="338"
              height="136"
              rx="10"
              fill={pal.canvasBg}
              stroke={pal.cardBorder}
              strokeWidth="1.2"
            />

            {/* Status Pill & Safety Factor */}
            <rect
              x="12"
              y="12"
              width="145"
              height="26"
              rx="6"
              fill={
                status === 'PASS'
                  ? 'rgba(16, 185, 129, 0.16)'
                  : status === 'MARGINAL'
                  ? 'rgba(245, 158, 11, 0.16)'
                  : 'rgba(244, 63, 94, 0.16)'
              }
              stroke={statusColor}
              strokeWidth="1.2"
            />
            <text
              x="84"
              y="29"
              fill={statusColor}
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              {status} · SF {safetyFactor >= 99 ? '∞' : safetyFactor.toFixed(2)}
            </text>

            {/* Utilization Percentage Right */}
            <text x="324" y="29" fill={pal.textPrimary} fontSize="11" fontWeight="800" textAnchor="end">
              {stressUtilizationPct.toFixed(1)}% {pick('Util.', 'Rasio', '利用率')}
            </text>

            {/* Live Utilization Progress Track */}
            <rect x="12" y="46" width="314" height="7" rx="3.5" fill={isDark ? '#1e293b' : '#e2e8f0'} />
            <rect
              x="12"
              y="46"
              width={Math.max(4, Math.min(314, (stressUtilizationPct / 100) * 314))}
              height="7"
              rx="3.5"
              fill={statusColor}
            />

            {/* 2-Column Telemetry Metrics */}
            <g transform="translate(12, 66)">
              <text x="0" y="12" fill={pal.textSecondary} fontSize="10" fontWeight="600">
                {pick('Design Throat (a)', 'Tebal Leher (a)', '理論のど厚 (a)')}:
              </text>
              <text x="150" y="12" fill={pal.textPrimary} fontSize="10.5" fontWeight="800" textAnchor="end">
                {throatMm.toFixed(2)} mm
              </text>

              <text x="168" y="12" fill={pal.textSecondary} fontSize="10" fontWeight="600">
                {pick('Area Aw', 'Luas Aw', '面積 Aw')}:
              </text>
              <text x="314" y="12" fill={pal.textPrimary} fontSize="10.5" fontWeight="800" textAnchor="end">
                {effectiveAreaAwMm2.toFixed(0)} mm²
              </text>

              <line x1="0" y1="24" x2="314" y2="24" stroke={pal.cardBorder} strokeWidth="0.8" />

              <text x="0" y="42" fill={pal.textSecondary} fontSize="10" fontWeight="600">
                {pick('Peak Throat Stress', 'Tegangan Leher Puncak', '最大合成応力')}:
              </text>
              <text x="314" y="42" fill={statusColor} fontSize="11" fontWeight="800" textAnchor="end">
                {peakCombinedStressMpa.toFixed(1)} MPa
              </text>

              <text x="0" y="60" fill={pal.textSecondary} fontSize="10" fontWeight="600">
                {pick('AWS Allowable Limit', 'Batas Izin Standar AWS', 'AWS許容応力限度')}:
              </text>
              <text x="314" y="60" fill={pal.statusPass} fontSize="11" fontWeight="800" textAnchor="end">
                {allowableStressMpa.toFixed(1)} MPa
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
