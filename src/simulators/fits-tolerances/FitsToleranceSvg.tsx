import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  SHAFT_CLASSES,
  SHAFT_DEVIATIONS_UM,
  type IsoFitCalculationResult,
} from './fitsTolerancesData';

interface FitsToleranceSvgProps {
  calc: IsoFitCalculationResult;
  holeGoEnters?: boolean;
  holeNoGoEnters?: boolean;
  shaftGoPasses?: boolean;
  shaftNoGoPasses?: boolean;
}

export function FitsToleranceSvg({
  calc,
  holeGoEnters = true,
  holeNoGoEnters = false,
  shaftGoPasses = true,
  shaftNoGoPasses = false,
}: FitsToleranceSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware CAD engineering palette harmonized with Material You tokens
  const palette = {
    canvasBg: 'var(--md-surface-container-low)',
    panelBg: 'var(--md-surface-container)',
    panelSubBg: 'var(--md-surface-container-low)',
    panelStroke: 'var(--md-outline-variant)',
    pillBg: 'var(--md-surface-container-low)',
    gridLine: 'var(--md-outline-variant)',
    gridMajor: 'var(--md-outline-variant)',
    textPrimary: 'var(--md-on-surface)',
    textSecondary: 'var(--md-on-surface)',
    textMuted: 'var(--md-on-surface-variant)',
    zeroLine: isDark ? '#22d3ee' : '#0891b2',
    holeStroke: isDark ? '#22d3ee' : '#0891b2',
    holeFill: isDark ? 'rgba(34, 211, 238, 0.24)' : 'rgba(6, 182, 212, 0.18)',
    hatchStroke: isDark ? '#94a3b8' : '#475569',
    centerline: isDark ? '#64748b' : '#64748b',
    dimensionLine: isDark ? '#94a3b8' : '#475569',
  };

  // Coordinate mapping for the ISO 286 Tolerance Zone Chart (left panel: x = 12..434)
  // Dedicated header row at y = 44..64; plot area spans y = 76..294
  const chartTop = 76;
  const chartBottom = 294;
  const chartHeight = chartBottom - chartTop;
  const minUm = -85;
  const maxUm = 105;

  const umToY = (um: number): number => {
    const clamped = Math.max(minUm, Math.min(maxUm, um));
    const ratio = (maxUm - clamped) / (maxUm - minUm);
    return chartTop + ratio * chartHeight;
  };

  const holeTopY = umToY(calc.ES);
  const holeBottomY = umToY(calc.EI);
  const holeBarH = Math.max(5, holeBottomY - holeTopY);

  // Safe non-overlapping pill Y positions for Hole ES and EI callouts
  const holeEsPillY = Math.max(chartTop + 2, holeTopY - 17);
  const holeEiPillY = Math.min(chartBottom - 15, holeBottomY + 3);

  // Thermally shifted effective zone during assembly
  const thermalShiftUm = calc.thermalDiameterChangeUm;
  const hasThermalShift = calc.thermalMode !== 'ambient' && thermalShiftUm >= 1;
  const isHeatingHub = calc.thermalMode === 'induction-hub';
  const isChillingShaft = calc.thermalMode === 'cryo-shaft';

  const fitColor =
    calc.fitCategory === 'clearance'
      ? {
          stroke: isDark ? '#38bdf8' : '#0284c7',
          fill: isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(2, 132, 199, 0.20)',
          badgeClass:
            'bg-emerald-500/15 text-emerald-700 border-emerald-300/60 dark:text-emerald-300 dark:border-emerald-700/60',
          dotClass: 'bg-emerald-500',
          label: pick('CLEARANCE FIT', 'SUAIAN LONGGAR', 'すきまばめ'),
        }
      : calc.fitCategory === 'transition'
        ? {
            stroke: isDark ? '#fbbf24' : '#d97706',
            fill: isDark ? 'rgba(251, 191, 36, 0.28)' : 'rgba(217, 119, 6, 0.20)',
            badgeClass:
              'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-700/60',
            dotClass: 'bg-amber-500',
            label: pick('TRANSITION FIT', 'SUAIAN TRANSISI', '中間ばめ'),
          }
        : {
            stroke: isDark ? '#fb7185' : '#e11d48',
            fill: isDark ? 'rgba(251, 113, 133, 0.28)' : 'rgba(225, 29, 72, 0.20)',
            badgeClass:
              'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-700/60',
            dotClass: 'bg-rose-500',
            label: pick('INTERFERENCE FIT', 'SUAIAN SESAK', 'しまりばめ'),
          };

  const gridTicks = [-75, -50, -25, 0, 25, 50, 75, 100];

  // ================== PROPORTIONAL METROLOGY & CAD GEOMETRY SCALING ==================
  // 1. Scale shaft, bore, hub, keyway, and gauges proportionally to Nominal Diameter (25..100 mm)
  const diaRatio = (calc.nominalMm - 25) / (100 - 25); // 0.0 at Ø25 -> 1.0 at Ø100
  const cx = 660;
  const cy = 150;

  // 2. Scale engagement length L proportionally (20..120 mm -> 74..142 px)
  const engagePx = Math.round(
    74 + ((calc.engagementLengthMm - 20) / 100) * 68
  );
  const halfL = engagePx / 2;

  const shaftFitHalfH = Math.round(17 + diaRatio * 13); // 17 px (Ø25) -> 30 px (Ø100)
  const shaftShoulderHalfH = shaftFitHalfH + Math.round(7 + diaRatio * 4); // 24 -> 41 px
  const hubOuterHalfH = shaftFitHalfH + Math.round(21 + diaRatio * 9); // 38 -> 60 px
  const hubFlangeHalfH = hubOuterHalfH + 9; // 47 -> 69 px
  const keywayHalfH = Math.round(4 + diaRatio * 3); // 4 -> 7 px

  // 3. Synchronize radial assembly clearance gap OR interference overlap with netAssemblyClearanceMinUm
  const hasNetClearance = calc.netAssemblyClearanceMinUm > 0;
  const visualGapPx = hasNetClearance
    ? Math.min(7, Math.max(1.6, calc.netAssemblyClearanceMinUm / 14))
    : 0;
  const visualOverlapPx = !hasNetClearance
    ? Math.min(5, Math.max(1.4, Math.abs(calc.netAssemblyClearanceMinUm) / 14))
    : 0;

  const boreInnerHalfH = shaftFitHalfH + visualGapPx - visualOverlapPx;

  // Dynamic induction coil positions scaled across engagement length L
  const coilOffsets = [-halfL * 0.68, -halfL * 0.42, halfL * 0.42, halfL * 0.68];

  // Radial stress arrow length scaled with contact pressure (MPa)
  const stressArrowLen = Math.min(
    14,
    Math.max(7, 6 + calc.contactPressureMaxMpa / 8)
  );

  // 4. Proportional Go / No-Go Plug & Snap Gauge dimensions
  const plugGoHalfH = Math.round(5.5 + diaRatio * 3.5); // 5.5 -> 9 px
  const plugNoGoStepPx = Math.max(1.5, Math.min(3.5, calc.holeToleranceUm / 14));
  const plugNoGoHalfH = plugGoHalfH + plugNoGoStepPx;

  const snapJawHalfGap = Math.round(5.5 + diaRatio * 3.5); // 5.5 -> 9 px
  const snapWorkpieceR = snapJawHalfGap - (shaftGoPasses ? 0.6 : -1.8);
  const snapWorkpieceCx = !shaftGoPasses
    ? 746 // Blocked outside GO anvil
    : shaftNoGoPasses
      ? 690 // Slipped all the way past NO-GO anvil!
      : 718; // Passed GO anvil and stopped cleanly against NO-GO anvil

  const holeGaugePass = holeGoEnters && !holeNoGoEnters;
  const shaftGaugePass = shaftGoPasses && !shaftNoGoPasses;

  return (
    <div className="glass-panel overflow-hidden rounded-[28px]">
      {/* Top CAD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
            {pick(
              'ISO 286-2 Tolerance & Shrink-Fit CAD Cross-Section',
              'Penampang CAD Toleransi ISO 286-2 & Shrink-Fit',
              'ISO 286-2 公差域および焼きばめ CAD 断面図'
            )}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold ${fitColor.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${fitColor.dotClass}`} />
            Ø{calc.nominalMm} {calc.holeClass}/{calc.shaftClass} · {fitColor.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--md-on-surface-variant)]">
          <span>
            {pick('Temp:', 'Suhu:', '組立温度:')}{' '}
            <strong className="font-mono text-[var(--md-on-surface)]">
              {calc.processTempC > 0 ? `+${calc.processTempC}` : calc.processTempC} °C
            </strong>
          </span>
          <span>·</span>
          <span>
            Δd:{' '}
            <strong className="font-mono text-[var(--md-primary)]">
              {calc.thermalDiameterChangeUm.toFixed(1)} µm
            </strong>
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-1">
        <svg
          viewBox="0 0 880 436"
          className="h-auto w-full select-none"
        role="img"
        aria-label={pick(
          'ISO 286 tolerance zone diagram, precision machined stepped shaft and cast-steel hub cross section, and Go/No-Go limit gauges',
          'Diagram zona toleransi ISO 286, penampang poros bertingkat dan hub baja tuang, serta kaliber batas Go/No-Go',
          'ISO 286 公差域図、段付き鋼軸と鋳鋼ハブの精密断面図、および通り/止まり限界ゲージ'
        )}
      >
        <defs>
          {/* Clip path for the ISO 286 plot area so extreme thermal shifts never overflow */}
          <clipPath id="iso-plot-clip">
            <rect x="56" y={chartTop - 2} width="368" height={chartHeight + 4} />
          </clipPath>

          {/* Subtle CAD blueprint grid pattern */}
          <pattern
            id="fits-cad-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={palette.gridLine}
              strokeWidth="0.7"
            />
          </pattern>

          {/* 45° ANSI Cast-Steel Cross-Section Hatching */}
          <pattern
            id="ansi-steel-hatch"
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
              stroke={palette.hatchStroke}
              strokeWidth="1.35"
              strokeOpacity={isDark ? '0.45' : '0.4'}
            />
            <line
              x1="4"
              y1="0"
              x2="4"
              y2="8"
              stroke={palette.hatchStroke}
              strokeWidth="0.65"
              strokeOpacity={isDark ? '0.35' : '0.3'}
            />
          </pattern>

          {/* Diamond knurling pattern for Plug Gauge handle */}
          <pattern
            id="knurl-pattern"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 2.5 L2.5 0 L5 2.5 L2.5 5 Z"
              fill="none"
              stroke={isDark ? '#cbd5e1' : '#334155'}
              strokeWidth="0.6"
              strokeOpacity="0.55"
            />
          </pattern>

          {/* Cylindrical Machined Steel Shaft Gradient */}
          <linearGradient id="machined-shaft-grad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isChillingShaft ? '#0284c7' : isDark ? '#475569' : '#64748b'}
            />
            <stop
              offset="24%"
              stopColor={isChillingShaft ? '#7dd3fc' : isDark ? '#cbd5e1' : '#cbd5e1'}
            />
            <stop
              offset="46%"
              stopColor={isChillingShaft ? '#e0f2fe' : '#f8fafc'}
            />
            <stop
              offset="74%"
              stopColor={isChillingShaft ? '#38bdf8' : isDark ? '#94a3b8' : '#94a3b8'}
            />
            <stop
              offset="100%"
              stopColor={isChillingShaft ? '#0369a1' : isDark ? '#334155' : '#475569'}
            />
          </linearGradient>

          {/* Cast-Steel Hub Body Gradient */}
          <linearGradient id="cast-hub-grad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={
                isHeatingHub
                  ? isDark
                    ? '#9a3412'
                    : '#fed7aa'
                  : isDark
                    ? '#1e293b'
                    : '#e2e8f0'
              }
            />
            <stop
              offset="50%"
              stopColor={
                isHeatingHub
                  ? isDark
                    ? '#c2410c'
                    : '#fdba74'
                  : isDark
                    ? '#334155'
                    : '#cbd5e1'
              }
            />
            <stop
              offset="100%"
              stopColor={
                isHeatingHub
                  ? isDark
                    ? '#7c2d12'
                    : '#fb923c'
                  : isDark
                    ? '#0f172a'
                    : '#94a3b8'
              }
            />
          </linearGradient>

          {/* Copper Induction Coil Gradient */}
          <linearGradient id="copper-coil-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Chrome Gauge Handle Gradient */}
          <linearGradient id="chrome-handle-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#64748b'} />
            <stop offset="45%" stopColor={isDark ? '#e2e8f0' : '#f1f5f9'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#475569'} />
          </linearGradient>
        </defs>

        {/* Full SVG Canvas Background with Blueprint Grid */}
        <rect x="0" y="0" width="880" height="436" fill={palette.canvasBg} />
        <rect
          x="0"
          y="0"
          width="880"
          height="436"
          fill="url(#fits-cad-grid)"
          opacity={isDark ? '0.28' : '0.45'}
        />

        {/* ================== LEFT PANEL: ISO 286 TOLERANCE ZONE CHART ================== */}
        <rect
          x="12"
          y="10"
          width="422"
          height="416"
          rx="18"
          fill={palette.panelBg}
          stroke={palette.panelStroke}
          strokeWidth="1.2"
        />

        {/* Left Panel Title & Thermal Shift Badge */}
        <text
          x="24"
          y="30"
          fill={palette.textPrimary}
          fontSize="11"
          fontWeight="800"
          fontFamily="var(--font-sans)"
        >
          {pick(
            `ISO 286 Zones (µm) — Nominal Ø${calc.nominalMm}.000 mm`,
            `Zona ISO 286 (µm) — Nominal Ø${calc.nominalMm}.000 mm`,
            `ISO 286 公差域 (µm) — 基準 Ø${calc.nominalMm}.000 mm`
          )}
        </text>

        {hasThermalShift && (
          <g>
            <rect
              x="312"
              y="17"
              width="112"
              height="18"
              rx="9"
              fill={
                isHeatingHub
                  ? isDark
                    ? 'rgba(249, 115, 22, 0.22)'
                    : 'rgba(249, 115, 22, 0.14)'
                  : isDark
                    ? 'rgba(14, 165, 233, 0.22)'
                    : 'rgba(14, 165, 233, 0.14)'
              }
              stroke={isHeatingHub ? '#f97316' : '#0ea5e9'}
              strokeWidth="1"
            />
            <text
              x="368"
              y="29"
              textAnchor="middle"
              fill={
                isHeatingHub
                  ? isDark
                    ? '#fdba74'
                    : '#c2410c'
                  : isDark
                    ? '#7dd3fc'
                    : '#0369a1'
              }
              fontSize="8.5"
              fontWeight="800"
              fontFamily="var(--font-mono)"
            >
              {isHeatingHub
                ? `Hub +${Math.round(thermalShiftUm)}µm (${calc.processTempC}°C)`
                : `Shaft −${Math.round(thermalShiftUm)}µm (${calc.processTempC}°C)`}
            </text>
          </g>
        )}

        {/* Dedicated Column Header Strip (y = 42..62) so bar labels NEVER collide with tolerance bars */}
        <rect
          x="22"
          y="42"
          width="402"
          height="22"
          rx="6"
          fill={palette.panelSubBg}
          stroke={palette.panelStroke}
          strokeWidth="0.9"
        />
        <text
          x="40"
          y="56"
          textAnchor="middle"
          fill={palette.textMuted}
          fontSize="8.5"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          µm
        </text>
        {/* Hole Column Pill Header */}
        <rect
          x="68"
          y="45"
          width="58"
          height="16"
          rx="4"
          fill={palette.holeFill}
          stroke={palette.holeStroke}
          strokeWidth="1.2"
        />
        <text
          x="97"
          y="56"
          textAnchor="middle"
          fill={palette.textPrimary}
          fontSize="9.5"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          {calc.holeClass}
        </text>
        {/* 7 Shaft Column Pill Headers */}
        {SHAFT_CLASSES.map((sc, idx) => {
          const x = 146 + idx * 38;
          const isSelected = sc.id === calc.shaftClass;
          return (
            <g key={`hdr-${sc.id}`}>
              <rect
                x={x}
                y="45"
                width="30"
                height="16"
                rx="4"
                fill={isSelected ? fitColor.fill : 'transparent'}
                stroke={isSelected ? fitColor.stroke : 'transparent'}
                strokeWidth={isSelected ? '1.3' : '0'}
              />
              <text
                x={x + 15}
                y="56"
                textAnchor="middle"
                fill={isSelected ? palette.textPrimary : palette.textMuted}
                fontSize={isSelected ? '9.5' : '9'}
                fontWeight={isSelected ? '800' : '600'}
                fontFamily="var(--font-mono)"
              >
                {sc.id}
              </text>
            </g>
          );
        })}

        {/* Horizontal µm Grid Lines */}
        {gridTicks.map((tick) => {
          const y = umToY(tick);
          const isZero = tick === 0;
          return (
            <g key={tick}>
              <line
                x1="56"
                y1={y}
                x2="420"
                y2={y}
                stroke={isZero ? palette.zeroLine : palette.gridMajor}
                strokeWidth={isZero ? '1.8' : '0.9'}
                strokeDasharray={isZero ? undefined : '3 3'}
              />
              {isZero ? (
                <g>
                  <rect
                    x="19"
                    y={y - 7.5}
                    width="34"
                    height="15"
                    rx="4"
                    fill={palette.holeFill}
                    stroke={palette.zeroLine}
                    strokeWidth="1"
                  />
                  <text
                    x="36"
                    y={y + 3}
                    textAnchor="middle"
                    fill={palette.zeroLine}
                    fontSize="8.5"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    0 µm
                  </text>
                </g>
              ) : (
                <text
                  x="50"
                  y={y + 3}
                  textAnchor="end"
                  fill={palette.textMuted}
                  fontSize="8.5"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  {tick > 0 ? `+${tick}` : `${tick}`}
                </text>
              )}
            </g>
          );
        })}

        {/* Clipped Tolerance Bars Group */}
        <g clipPath="url(#iso-plot-clip)">
          {/* Thermally expanded hole ghost zone when induction heating is active */}
          {isHeatingHub && hasThermalShift && (
            <rect
              x="68"
              y={umToY(calc.ES + thermalShiftUm)}
              width="58"
              height={holeBarH}
              rx="3"
              fill="rgba(249, 115, 22, 0.22)"
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Active Hole Tolerance Bar (H6/H7/H8) */}
          <rect
            x="68"
            y={holeTopY}
            width="58"
            height={holeBarH}
            rx="3"
            fill={palette.holeFill}
            stroke={palette.holeStroke}
            strokeWidth="2"
          />

          {/* All 7 Shaft Classes Ladder (x = 146..406) */}
          {SHAFT_CLASSES.map((sc, idx) => {
            const dev = SHAFT_DEVIATIONS_UM[calc.nominalMm][sc.id];
            const x = 146 + idx * 38;
            const yTop = umToY(dev.upper);
            const yBot = umToY(dev.lower);
            const h = Math.max(5, yBot - yTop);
            const isSelected = sc.id === calc.shaftClass;

            return (
              <g key={sc.id} opacity={isSelected ? 1 : isDark ? 0.34 : 0.42}>
                {isSelected && isChillingShaft && hasThermalShift && (
                  <rect
                    x={x}
                    y={umToY(dev.upper - thermalShiftUm)}
                    width="30"
                    height={h}
                    rx="3"
                    fill="rgba(14, 165, 233, 0.22)"
                    stroke="#0ea5e9"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                )}
                <rect
                  x={x}
                  y={yTop}
                  width="30"
                  height={h}
                  rx="3"
                  fill={
                    isSelected
                      ? fitColor.fill
                      : isDark
                        ? 'rgba(148, 163, 184, 0.16)'
                        : 'rgba(100, 116, 139, 0.14)'
                  }
                  stroke={isSelected ? fitColor.stroke : palette.textMuted}
                  strokeWidth={isSelected ? '2.2' : '1'}
                />
              </g>
            );
          })}
        </g>

        {/* Non-Overlapping Halo Callout Pills for Active Hole (ES / EI) */}
        <g>
          {/* ES Callout Pill */}
          <rect
            x="66"
            y={holeEsPillY}
            width="62"
            height="14"
            rx="3.5"
            fill={palette.pillBg}
            stroke={palette.holeStroke}
            strokeWidth="0.9"
          />
          <text
            x="97"
            y={holeEsPillY + 10}
            textAnchor="middle"
            fill={palette.holeStroke}
            fontSize="8.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            ES +{calc.ES}µm
          </text>

          {/* EI Callout Pill */}
          <rect
            x="66"
            y={holeEiPillY}
            width="62"
            height="14"
            rx="3.5"
            fill={palette.pillBg}
            stroke={palette.holeStroke}
            strokeWidth="0.9"
          />
          <text
            x="97"
            y={holeEiPillY + 10}
            textAnchor="middle"
            fill={palette.holeStroke}
            fontSize="8.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            EI {calc.EI}µm
          </text>
        </g>

        {/* Non-Overlapping Halo Callout Pills for Active Shaft (es / ei) */}
        {SHAFT_CLASSES.map((sc, idx) => {
          if (sc.id !== calc.shaftClass) return null;
          const dev = SHAFT_DEVIATIONS_UM[calc.nominalMm][sc.id];
          const centerColX = 146 + idx * 38 + 15;
          const pillW = 60;
          const pillX = Math.max(140, Math.min(422 - pillW, centerColX - pillW / 2));
          const yTop = umToY(dev.upper);
          const yBot = umToY(dev.lower);
          const esPillY = Math.max(chartTop + 2, yTop - 17);
          const eiPillY = Math.min(chartBottom - 15, yBot + 3);

          return (
            <g key={`pill-${sc.id}`}>
              <rect
                x={pillX}
                y={esPillY}
                width={pillW}
                height="14"
                rx="3.5"
                fill={palette.pillBg}
                stroke={fitColor.stroke}
                strokeWidth="0.9"
              />
              <text
                x={pillX + pillW / 2}
                y={esPillY + 10}
                textAnchor="middle"
                fill={fitColor.stroke}
                fontSize="8.5"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                es {dev.upper >= 0 ? `+${dev.upper}` : dev.upper}µm
              </text>

              <rect
                x={pillX}
                y={eiPillY}
                width={pillW}
                height="14"
                rx="3.5"
                fill={palette.pillBg}
                stroke={fitColor.stroke}
                strokeWidth="0.9"
              />
              <text
                x={pillX + pillW / 2}
                y={eiPillY + 10}
                textAnchor="middle"
                fill={fitColor.stroke}
                fontSize="8.5"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                ei {dev.lower >= 0 ? `+${dev.lower}` : dev.lower}µm
              </text>
            </g>
          );
        })}

        {/* Bottom Summary Strip inside Left Panel (y = 310..416) */}
        <rect
          x="22"
          y="310"
          width="402"
          height="106"
          rx="8"
          fill={palette.panelSubBg}
          stroke={palette.panelStroke}
        />
        <text
          x="32"
          y="329"
          fill={palette.textSecondary}
          fontSize="9"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {pick(
            `HOLE ${calc.holeClass}: D_min = ${calc.holeMinMm.toFixed(3)} mm (Go) | D_max = ${calc.holeMaxMm.toFixed(3)} mm (No-Go)`,
            `LUBANG ${calc.holeClass}: D_min = ${calc.holeMinMm.toFixed(3)} mm (Go) | D_max = ${calc.holeMaxMm.toFixed(3)} mm (No-Go)`,
            `穴 ${calc.holeClass}: D_min = ${calc.holeMinMm.toFixed(3)} mm (通り) | D_max = ${calc.holeMaxMm.toFixed(3)} mm (止まり)`
          )}
        </text>
        <text
          x="32"
          y="348"
          fill={palette.textSecondary}
          fontSize="9"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {pick(
            `SHAFT ${calc.shaftClass}: d_max = ${calc.shaftMaxMm.toFixed(3)} mm (Go) | d_min = ${calc.shaftMinMm.toFixed(3)} mm (No-Go)`,
            `POROS ${calc.shaftClass}: d_max = ${calc.shaftMaxMm.toFixed(3)} mm (Go) | d_min = ${calc.shaftMinMm.toFixed(3)} mm (No-Go)`,
            `軸 ${calc.shaftClass}: d_max = ${calc.shaftMaxMm.toFixed(3)} mm (通り) | d_min = ${calc.shaftMinMm.toFixed(3)} mm (止まり)`
          )}
        </text>
        <line
          x1="32"
          y1="359"
          x2="412"
          y2="359"
          stroke={palette.panelStroke}
          strokeWidth="1"
        />
        <text
          x="32"
          y="378"
          fill={fitColor.stroke}
          fontSize="9.5"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          {calc.fitCategory === 'clearance'
            ? pick(
                `CLEARANCE FIT: C_min = +${calc.minClearanceUm} µm  |  C_max = +${calc.maxClearanceUm} µm`,
                `SUAIAN LONGGAR: C_min = +${calc.minClearanceUm} µm  |  C_max = +${calc.maxClearanceUm} µm`,
                `すきまばめ: C_min = +${calc.minClearanceUm} µm  |  C_max = +${calc.maxClearanceUm} µm`
              )
            : calc.fitCategory === 'transition'
              ? pick(
                  `TRANSITION FIT: C_max = +${calc.maxClearanceUm} µm  ↔  δ_max = +${calc.maxInterferenceUm} µm`,
                  `SUAIAN TRANSISI: C_max = +${calc.maxClearanceUm} µm  ↔  δ_max = +${calc.maxInterferenceUm} µm`,
                  `中間ばめ: 最大すきま +${calc.maxClearanceUm} µm ↔ 最大締め代 +${calc.maxInterferenceUm} µm`
                )
              : pick(
                  `INTERFERENCE FIT: δ_min = +${calc.minInterferenceUm} µm  |  δ_max = +${calc.maxInterferenceUm} µm`,
                  `SUAIAN SESAK: δ_min = +${calc.minInterferenceUm} µm  |  δ_max = +${calc.maxInterferenceUm} µm`,
                  `しまりばめ: δ_min = +${calc.minInterferenceUm} µm  |  δ_max = +${calc.maxInterferenceUm} µm`
                )}
        </text>
        <text
          x="32"
          y="398"
          fill={palette.textMuted}
          fontSize="8.5"
          fontWeight="600"
          fontFamily="var(--font-mono)"
        >
          {pick(
            `Hole T_H = ${calc.holeToleranceUm} µm + Shaft T_S = ${calc.shaftToleranceUm} µm → Fit Band = ${calc.holeToleranceUm + calc.shaftToleranceUm} µm`,
            `Lubang T_H = ${calc.holeToleranceUm} µm + Poros T_S = ${calc.shaftToleranceUm} µm → Rentang = ${calc.holeToleranceUm + calc.shaftToleranceUm} µm`,
            `穴公差 T_H = ${calc.holeToleranceUm} µm + 軸公差 T_S = ${calc.shaftToleranceUm} µm → 公差幅 = ${calc.holeToleranceUm + calc.shaftToleranceUm} µm`
          )}
        </text>

        {/* ================== RIGHT PANEL: MACHINED SHAFT/HUB SECTION & GAUGES ================== */}
        <rect
          x="444"
          y="10"
          width="424"
          height="416"
          rx="18"
          fill={palette.panelBg}
          stroke={palette.panelStroke}
          strokeWidth="1.2"
        />

        <text
          x="458"
          y="30"
          fill={palette.textPrimary}
          fontSize="11"
          fontWeight="800"
          fontFamily="var(--font-sans)"
        >
          {pick(
            'Machined Shaft & Hub Section + Go/No-Go Gauges',
            'Penampang Poros & Hub Mesin + Kaliber Go/No-Go',
            '段付き鋼軸・ハブ断面図および限界ゲージ'
          )}
        </text>

        {/* Dedicated Top Telemetry Bar (y = 40..62) */}
        <rect
          x="456"
          y="40"
          width="400"
          height="22"
          rx="6"
          fill={palette.panelSubBg}
          stroke={palette.panelStroke}
          strokeWidth="0.9"
        />
        <text
          x="656"
          y="54.5"
          textAnchor="middle"
          fill={
            calc.effectiveInterferenceUm > 0
              ? isDark
                ? '#fda4af'
                : '#be123c'
              : palette.textSecondary
          }
          fontSize="9"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          {calc.effectiveInterferenceUm > 0
            ? pick(
                `p_max = ${calc.contactPressureMaxMpa.toFixed(1)} MPa · Press F = ${calc.pressForceMaxKn.toFixed(1)} kN (${calc.pressForceMaxTonnes.toFixed(1)} t) · T = ${calc.transmissibleTorqueNm.toFixed(0)} N·m`,
                `p_max = ${calc.contactPressureMaxMpa.toFixed(1)} MPa · Pres F = ${calc.pressForceMaxKn.toFixed(1)} kN (${calc.pressForceMaxTonnes.toFixed(1)} t) · T = ${calc.transmissibleTorqueNm.toFixed(0)} N·m`,
                `面圧 p_max = ${calc.contactPressureMaxMpa.toFixed(1)} MPa · 圧入力 F = ${calc.pressForceMaxKn.toFixed(1)} kN (${calc.pressForceMaxTonnes.toFixed(1)} t)`
              )
            : pick(
                `Zero Interference (p = 0 MPa, Press Force = 0 kN) — Free Sliding / Running Clearance`,
                `Tanpa Kesesakan (p = 0 MPa, Gaya Pres = 0 kN) — Celah Bebas Geser / Putar`,
                `締め代なし (面圧 p = 0 MPa, 圧入力 = 0 kN) — 自由摺動・回転すきま`
              )}
        </text>

        {/* 1. Cast-Steel Flanged Hub (Scaled with nominalMm & engagementLengthMm) */}
        <g>
          {/* Upper Cast-Steel T-Flange Hub Section */}
          <path
            d={`
              M ${cx - halfL} ${cy - boreInnerHalfH - 4}
              L ${cx - halfL + 5} ${cy - boreInnerHalfH}
              L ${cx + halfL - 5} ${cy - boreInnerHalfH}
              L ${cx + halfL} ${cy - boreInnerHalfH - 4}
              L ${cx + halfL} ${cy - hubOuterHalfH}
              L ${cx + 22} ${cy - hubOuterHalfH}
              L ${cx + 22} ${cy - hubFlangeHalfH}
              L ${cx - 22} ${cy - hubFlangeHalfH}
              L ${cx - 22} ${cy - hubOuterHalfH}
              L ${cx - halfL} ${cy - hubOuterHalfH}
              Z
            `}
            fill="url(#cast-hub-grad)"
            stroke={isHeatingHub ? '#f97316' : palette.holeStroke}
            strokeWidth="1.8"
          />
          <path
            d={`
              M ${cx - halfL} ${cy - boreInnerHalfH - 4}
              L ${cx - halfL + 5} ${cy - boreInnerHalfH}
              L ${cx + halfL - 5} ${cy - boreInnerHalfH}
              L ${cx + halfL} ${cy - boreInnerHalfH - 4}
              L ${cx + halfL} ${cy - hubOuterHalfH}
              L ${cx + 22} ${cy - hubOuterHalfH}
              L ${cx + 22} ${cy - hubFlangeHalfH}
              L ${cx - 22} ${cy - hubFlangeHalfH}
              L ${cx - 22} ${cy - hubOuterHalfH}
              L ${cx - halfL} ${cy - hubOuterHalfH}
              Z
            `}
            fill="url(#ansi-steel-hatch)"
          />

          {/* Lower Cast-Steel T-Flange Hub Section */}
          <path
            d={`
              M ${cx - halfL} ${cy + boreInnerHalfH + 4}
              L ${cx - halfL + 5} ${cy + boreInnerHalfH}
              L ${cx + halfL - 5} ${cy + boreInnerHalfH}
              L ${cx + halfL} ${cy + boreInnerHalfH + 4}
              L ${cx + halfL} ${cy + hubOuterHalfH}
              L ${cx + 22} ${cy + hubOuterHalfH}
              L ${cx + 22} ${cy + hubFlangeHalfH}
              L ${cx - 22} ${cy + hubFlangeHalfH}
              L ${cx - 22} ${cy + hubOuterHalfH}
              L ${cx - halfL} ${cy + hubOuterHalfH}
              Z
            `}
            fill="url(#cast-hub-grad)"
            stroke={isHeatingHub ? '#f97316' : palette.holeStroke}
            strokeWidth="1.8"
          />
          <path
            d={`
              M ${cx - halfL} ${cy + boreInnerHalfH + 4}
              L ${cx - halfL + 5} ${cy + boreInnerHalfH}
              L ${cx + halfL - 5} ${cy + boreInnerHalfH}
              L ${cx + halfL} ${cy + boreInnerHalfH + 4}
              L ${cx + halfL} ${cy + hubOuterHalfH}
              L ${cx + 22} ${cy + hubOuterHalfH}
              L ${cx + 22} ${cy + hubFlangeHalfH}
              L ${cx - 22} ${cy + hubFlangeHalfH}
              L ${cx - 22} ${cy + hubOuterHalfH}
              L ${cx - halfL} ${cy + hubOuterHalfH}
              Z
            `}
            fill="url(#ansi-steel-hatch)"
          />

          {/* Flange Mounting Bolt Holes */}
          <rect
            x={cx - 22}
            y={cy - hubFlangeHalfH + 2.5}
            width="44"
            height="5.5"
            fill={palette.panelBg}
            stroke={palette.dimensionLine}
            strokeWidth="1"
          />
          <line
            x1={cx - 26}
            y1={cy - hubFlangeHalfH + 5.2}
            x2={cx + 26}
            y2={cy - hubFlangeHalfH + 5.2}
            stroke={palette.centerline}
            strokeWidth="0.8"
            strokeDasharray="5 2 1 2"
          />
          <rect
            x={cx - 22}
            y={cy + hubFlangeHalfH - 8}
            width="44"
            height="5.5"
            fill={palette.panelBg}
            stroke={palette.dimensionLine}
            strokeWidth="1"
          />
          <line
            x1={cx - 26}
            y1={cy + hubFlangeHalfH - 5.2}
            x2={cx + 26}
            y2={cy + hubFlangeHalfH - 5.2}
            stroke={palette.centerline}
            strokeWidth="0.8"
            strokeDasharray="5 2 1 2"
          />
        </g>

        {/* 2. Copper Induction Heater Coils around Hub when Heating (> 21 °C) */}
        {isHeatingHub && (
          <g>
            {coilOffsets.map((dx, idx) => (
              <g key={idx}>
                <rect
                  x={cx + dx - 3.5}
                  y={cy - hubOuterHalfH - 8}
                  width="7"
                  height="8"
                  rx="3"
                  fill="url(#copper-coil-grad)"
                  stroke="#9a3412"
                  strokeWidth="0.9"
                />
                <rect
                  x={cx + dx - 3.5}
                  y={cy + hubOuterHalfH}
                  width="7"
                  height="8"
                  rx="3"
                  fill="url(#copper-coil-grad)"
                  stroke="#9a3412"
                  strokeWidth="0.9"
                />
              </g>
            ))}
          </g>
        )}

        {/* 3. Radial Clearance Film OR Interference Overlap Zone between Shaft and Bore */}
        {hasNetClearance && visualGapPx > 0.5 && (
          <g>
            {/* Upper & Lower Clearance Film Bands */}
            <rect
              x={cx - halfL + 4}
              y={cy - boreInnerHalfH}
              width={engagePx - 8}
              height={visualGapPx}
              fill={isDark ? 'rgba(56, 189, 248, 0.34)' : 'rgba(14, 165, 233, 0.26)'}
            />
            <rect
              x={cx - halfL + 4}
              y={cy + shaftFitHalfH}
              width={engagePx - 8}
              height={visualGapPx}
              fill={isDark ? 'rgba(56, 189, 248, 0.34)' : 'rgba(14, 165, 233, 0.26)'}
            />
          </g>
        )}

        {/* 4. Precision Machined Stepped Steel Shaft (Scaled with nominalMm & engagementLengthMm) */}
        <g>
          <path
            d={`
              M 474 ${cy - shaftShoulderHalfH}
              L ${cx - halfL - 10} ${cy - shaftShoulderHalfH}
              Q ${cx - halfL - 4} ${cy - shaftShoulderHalfH} ${cx - halfL - 4} ${cy - shaftFitHalfH}
              L ${cx + halfL + 22} ${cy - shaftFitHalfH}
              L ${cx + halfL + 30} ${cy - shaftFitHalfH + 6}
              L ${cx + halfL + 30} ${cy + shaftFitHalfH - 6}
              L ${cx + halfL + 22} ${cy + shaftFitHalfH}
              L ${cx - halfL - 4} ${cy + shaftFitHalfH}
              Q ${cx - halfL - 4} ${cy + shaftShoulderHalfH} ${cx - halfL - 10} ${cy + shaftShoulderHalfH}
              L 474 ${cy + shaftShoulderHalfH}
              Z
            `}
            fill="url(#machined-shaft-grad)"
            stroke={isChillingShaft ? '#0284c7' : fitColor.stroke}
            strokeWidth="1.8"
          />

          {/* Glowing Elastic Interference Overlap Bands when netAssemblyClearanceMinUm <= 0 */}
          {!hasNetClearance && visualOverlapPx > 0.5 && (
            <g>
              <rect
                x={cx - halfL + 2}
                y={cy - shaftFitHalfH}
                width={engagePx - 4}
                height={visualOverlapPx}
                fill="rgba(244, 63, 94, 0.42)"
                stroke="#f43f5e"
                strokeWidth="0.9"
                strokeDasharray="3 2"
              />
              <rect
                x={cx - halfL + 2}
                y={cy + boreInnerHalfH}
                width={engagePx - 4}
                height={visualOverlapPx}
                fill="rgba(244, 63, 94, 0.42)"
                stroke="#f43f5e"
                strokeWidth="0.9"
                strokeDasharray="3 2"
              />
            </g>
          )}

          {/* Shoulder & Chamfer Bevel Crease Lines */}
          <line
            x1={cx - halfL - 4}
            y1={cy - shaftFitHalfH}
            x2={cx - halfL - 4}
            y2={cy + shaftFitHalfH}
            stroke={isDark ? '#475569' : '#64748b'}
            strokeWidth="1.1"
          />
          <line
            x1={cx + halfL + 22}
            y1={cy - shaftFitHalfH}
            x2={cx + halfL + 22}
            y2={cy + shaftFitHalfH}
            stroke={isDark ? '#475569' : '#64748b'}
            strokeWidth="1.1"
          />

          {/* Machined Parallel Feather Keyway Slot (scaled with diameter & length) */}
          <rect
            x={cx - halfL * 0.6}
            y={cy - keywayHalfH}
            width={engagePx * 0.6}
            height={keywayHalfH * 2}
            rx={keywayHalfH}
            fill={isDark ? '#334155' : '#94a3b8'}
            stroke={isDark ? '#1e293b' : '#475569'}
            strokeWidth="1"
          />

          {/* ISO Centerline (Dash-Dot) */}
          <line
            x1="462"
            y1={cy}
            x2="850"
            y2={cy}
            stroke={palette.centerline}
            strokeWidth="1"
            strokeDasharray="12 4 2 4"
          />

          {/* Cryogenic Frost Crystals when Chilling Shaft (< 19 °C) */}
          {isChillingShaft && (
            <g stroke="#38bdf8" strokeWidth="1.3">
              {[498, 520, cx + halfL + 10].map((fx, i) => (
                <g key={i} transform={`translate(${fx}, ${cy - 12})`}>
                  <line x1="-3.5" y1="0" x2="3.5" y2="0" />
                  <line x1="0" y1="-3.5" x2="0" y2="3.5" />
                  <line x1="-2.5" y1="-2.5" x2="2.5" y2="2.5" />
                  <line x1="-2.5" y1="2.5" x2="2.5" y2="-2.5" />
                </g>
              ))}
            </g>
          )}

          {/* Shaft Designation Pill Callout in Center */}
          <rect
            x={cx - 46}
            y={cy - 9}
            width="92"
            height="18"
            rx="4"
            fill={palette.pillBg}
            stroke={fitColor.stroke}
            strokeWidth="1.1"
          />
          <text
            x={cx}
            y={cy + 3.5}
            textAnchor="middle"
            fill={palette.textPrimary}
            fontSize="9.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            Ø{calc.nominalMm} {calc.shaftClass}
          </text>
        </g>

        {/* 5. Radial Contact Stress Vectors (scaled with Contact Pressure MPa) */}
        {calc.effectiveInterferenceUm > 0 && (
          <g>
            {[-halfL * 0.55, 0, halfL * 0.55].map((dx, i) => (
              <g key={i}>
                <line
                  x1={cx + dx}
                  y1={cy - shaftFitHalfH - stressArrowLen}
                  x2={cx + dx}
                  y2={cy - shaftFitHalfH - 2}
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                />
                <polygon
                  points={`${cx + dx - 2.8},${cy - shaftFitHalfH - 5.5} ${cx + dx + 2.8},${cy - shaftFitHalfH - 5.5} ${cx + dx},${cy - shaftFitHalfH - 1}`}
                  fill="#f43f5e"
                />
                <line
                  x1={cx + dx}
                  y1={cy + shaftFitHalfH + stressArrowLen}
                  x2={cx + dx}
                  y2={cy + shaftFitHalfH + 2}
                  stroke="#f43f5e"
                  strokeWidth="1.8"
                />
                <polygon
                  points={`${cx + dx - 2.8},${cy + shaftFitHalfH + 5.5} ${cx + dx + 2.8},${cy + shaftFitHalfH + 5.5} ${cx + dx},${cy + shaftFitHalfH + 1}`}
                  fill="#f43f5e"
                />
              </g>
            ))}
          </g>
        )}

        {/* 6. Engagement Length L Dimension Line (y = 233..248) */}
        <g>
          <line
            x1={cx - halfL}
            y1={cy + hubOuterHalfH + 3}
            x2={cx - halfL}
            y2="246"
            stroke={palette.dimensionLine}
            strokeWidth="1"
          />
          <line
            x1={cx + halfL}
            y1={cy + hubOuterHalfH + 3}
            x2={cx + halfL}
            y2="246"
            stroke={palette.dimensionLine}
            strokeWidth="1"
          />
          <line
            x1={cx - halfL + 3}
            y1="241"
            x2={cx + halfL - 3}
            y2="241"
            stroke={palette.dimensionLine}
            strokeWidth="1.2"
          />
          <rect
            x={cx - 35}
            y="233"
            width="70"
            height="15"
            rx="3.5"
            fill={palette.pillBg}
            stroke={palette.panelStroke}
            strokeWidth="0.8"
          />
          <text
            x={cx}
            y="243.5"
            textAnchor="middle"
            fill={palette.textSecondary}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            L = {calc.engagementLengthMm} mm
          </text>
        </g>

        {/* 7. Thermal Assembly Status Pill Banner (y = 260..302) */}
        <rect
          x="456"
          y="260"
          width="400"
          height="42"
          rx="8"
          fill={
            calc.canDropInWithoutPress
              ? isDark
                ? 'rgba(16, 185, 129, 0.16)'
                : 'rgba(16, 185, 129, 0.10)'
              : isDark
                ? 'rgba(244, 63, 94, 0.16)'
                : 'rgba(244, 63, 94, 0.10)'
          }
          stroke={calc.canDropInWithoutPress ? '#10b981' : '#f43f5e'}
          strokeWidth="1.4"
        />
        <text
          x="656"
          y="277"
          textAnchor="middle"
          fill={
            calc.canDropInWithoutPress
              ? isDark
                ? '#6ee7b7'
                : '#047857'
              : isDark
                ? '#fda4af'
                : '#be123c'
          }
          fontSize="9.5"
          fontWeight="800"
          fontFamily="var(--font-mono)"
        >
          {calc.canDropInWithoutPress
            ? pick(
                `SLIP-IN READY: Net Clearance +${calc.netAssemblyClearanceMinUm.toFixed(0)} µm (@ ${calc.processTempC} °C)`,
                `SIAP MASUK BEBAS: Celah Bersih +${calc.netAssemblyClearanceMinUm.toFixed(0)} µm (@ ${calc.processTempC} °C)`,
                `無負荷挿入可: 有効組立すきま +${calc.netAssemblyClearanceMinUm.toFixed(0)} µm (@ ${calc.processTempC} °C)`
              )
            : pick(
                `PRESS REQUIRED: ${calc.pressForceMaxKn.toFixed(1)} kN (${calc.pressForceMaxTonnes.toFixed(2)} t) or Heat Hub to ${calc.requiredTempForDropInC} °C`,
                `PERLU PRES: ${calc.pressForceMaxKn.toFixed(1)} kN (${calc.pressForceMaxTonnes.toFixed(2)} t) atau Panaskan ${calc.requiredTempForDropInC} °C`,
                `油圧プレス必要: ${calc.pressForceMaxKn.toFixed(1)} kN (${calc.pressForceMaxTonnes.toFixed(2)} t) または ${calc.requiredTempForDropInC} °C 加熱`
              )}
        </text>
        <text
          x="656"
          y="293"
          textAnchor="middle"
          fill={palette.textSecondary}
          fontSize="8.5"
          fontWeight="600"
          fontFamily="var(--font-mono)"
        >
          {pick(
            `Thermal Δd = ${calc.thermalDiameterChangeUm.toFixed(1)} µm · Safe Drop-In Margin ≥ +${calc.safeAssemblyMarginUm} µm`,
            `Muai Termal Δd = ${calc.thermalDiameterChangeUm.toFixed(1)} µm · Margin Aman ≥ +${calc.safeAssemblyMarginUm} µm`,
            `熱変形量 Δd = ${calc.thermalDiameterChangeUm.toFixed(1)} µm · 安全隙間目標 ≥ +${calc.safeAssemblyMarginUm} µm`
          )}
        </text>

        {/* ================== 8. PROPORTIONAL GO / NO-GO PLUG & SNAP GAUGES (y = 310..416) ================== */}
        <g>
          {/* Left Card: Double-Ended Cylindrical Plug Gauge (Hole Inspection) */}
          <rect
            x="456"
            y="310"
            width="195"
            height="106"
            rx="8"
            fill={palette.panelSubBg}
            stroke={holeGaugePass ? '#10b981' : '#f43f5e'}
            strokeWidth="1.3"
          />
          <text
            x="466"
            y="327"
            fill={palette.textPrimary}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-sans)"
          >
            {pick(
              `Plug Gauge (${calc.holeClass})`,
              `Kaliber Plug (${calc.holeClass})`,
              `栓ゲージ (穴 ${calc.holeClass})`
            )}
          </text>
          <rect
            x="592"
            y="315"
            width="50"
            height="16"
            rx="8"
            fill={holeGaugePass ? '#10b981' : '#f43f5e'}
          />
          <text
            x="617"
            y="326"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {holeGaugePass
              ? pick('PASS', 'LULUS', '合格')
              : pick('FAIL', 'GAGAL', '不合格')}
          </text>

          {/* Proportional Double-Ended Knurled Cylindrical Plug Gauge (centered at y = 348) */}
          <path
            d={`M468 ${348 - plugGoHalfH + 2} L471 ${348 - plugGoHalfH} H504 V${348 + plugGoHalfH} H471 L468 ${348 + plugGoHalfH - 2} Z`}
            fill="url(#machined-shaft-grad)"
            stroke={holeGoEnters ? '#10b981' : '#f43f5e'}
            strokeWidth="1.5"
          />
          <rect x="504" y="341" width="5" height="14" fill="#10b981" />
          <rect
            x="509"
            y="342"
            width="58"
            height="12"
            rx="2"
            fill="url(#chrome-handle-grad)"
            stroke={palette.dimensionLine}
            strokeWidth="1"
          />
          <rect
            x="514"
            y="343"
            width="48"
            height="10"
            fill="url(#knurl-pattern)"
          />
          <rect x="567" y="341" width="5" height="14" fill="#f43f5e" />
          <path
            d={`M572 ${348 - plugNoGoHalfH} H594 L597 ${348 - plugNoGoHalfH + 2} V${348 + plugNoGoHalfH - 2} L594 ${348 + plugNoGoHalfH} H572 Z`}
            fill="url(#machined-shaft-grad)"
            stroke={!holeNoGoEnters ? '#10b981' : '#f43f5e'}
            strokeWidth="1.5"
          />

          <text
            x="466"
            y="379"
            fill={holeGoEnters ? (isDark ? '#6ee7b7' : '#047857') : '#f43f5e'}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {holeGoEnters ? '✓' : '✗'} GO: Ø{calc.holeMinMm.toFixed(3)} mm
          </text>
          <text
            x="466"
            y="398"
            fill={!holeNoGoEnters ? (isDark ? '#6ee7b7' : '#047857') : '#f43f5e'}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {!holeNoGoEnters ? '✓' : '✗'} NO-GO: Ø{calc.holeMaxMm.toFixed(3)} mm
          </text>

          {/* Right Card: C-Frame Limit Snap Gauge (Shaft Inspection) */}
          <rect
            x="661"
            y="310"
            width="195"
            height="106"
            rx="8"
            fill={palette.panelSubBg}
            stroke={shaftGaugePass ? '#10b981' : '#f43f5e'}
            strokeWidth="1.3"
          />
          <text
            x="671"
            y="327"
            fill={palette.textPrimary}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-sans)"
          >
            {pick(
              `Snap Gauge (${calc.shaftClass})`,
              `Kaliber Snap (${calc.shaftClass})`,
              `スナップゲージ (${calc.shaftClass})`
            )}
          </text>
          <rect
            x="797"
            y="315"
            width="50"
            height="16"
            rx="8"
            fill={shaftGaugePass ? '#10b981' : '#f43f5e'}
          />
          <text
            x="822"
            y="326"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {shaftGaugePass
              ? pick('PASS', 'LULUS', '合格')
              : pick('FAIL', 'GAGAL', '不合格')}
          </text>

          {/* Proportional Forged C-Frame Snap Gauge (centered at y = 348) */}
          <path
            d={`M675 ${348 - snapJawHalfGap - 7} H736 V${348 - snapJawHalfGap} H694 V${348 + snapJawHalfGap} H736 V${348 + snapJawHalfGap + 7} H675 C669 ${348 + snapJawHalfGap + 7} 669 ${348 - snapJawHalfGap - 7} 675 ${348 - snapJawHalfGap - 7} Z`}
            fill="url(#chrome-handle-grad)"
            stroke={palette.dimensionLine}
            strokeWidth="1.2"
          />
          {/* Outer GO Anvil Pads */}
          <rect
            x="725"
            y={348 - snapJawHalfGap - 1}
            width="9"
            height="2.5"
            fill="#10b981"
          />
          <rect
            x="725"
            y={348 + snapJawHalfGap - 1.5}
            width="9"
            height="2.5"
            fill="#10b981"
          />
          {/* Inner NO-GO Anvil Pads (narrower by tolerance step) */}
          <rect
            x="704"
            y={348 - snapJawHalfGap - 0.5}
            width="9"
            height="3.2"
            fill="#f43f5e"
          />
          <rect
            x="704"
            y={348 + snapJawHalfGap - 2.7}
            width="9"
            height="3.2"
            fill="#f43f5e"
          />
          {/* Inspected Shaft Cross-Section synced to GO/NO-GO Pass State */}
          <circle
            cx={snapWorkpieceCx}
            cy="348"
            r={snapWorkpieceR}
            fill="url(#machined-shaft-grad)"
            stroke={shaftGaugePass ? '#10b981' : '#f43f5e'}
            strokeWidth="1.4"
          />

          <text
            x="671"
            y="379"
            fill={shaftGoPasses ? (isDark ? '#6ee7b7' : '#047857') : '#f43f5e'}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {shaftGoPasses ? '✓' : '✗'} GO: Ø{calc.shaftMaxMm.toFixed(3)} mm
          </text>
          <text
            x="671"
            y="398"
            fill={!shaftNoGoPasses ? (isDark ? '#6ee7b7' : '#047857') : '#f43f5e'}
            fontSize="9"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {!shaftNoGoPasses ? '✓' : '✗'} NO-GO: Ø{calc.shaftMinMm.toFixed(3)} mm
          </text>
        </g>
      </svg>
      </div>
    </div>
  );
}
