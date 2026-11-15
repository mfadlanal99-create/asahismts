import { PlusCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { degToRad } from '../../physics';
import {
  DEPTH_PLANES,
  NOMINAL_BORE_MM,
  OEM_SERVICE_LIMIT_MM,
  type BoreAxisId,
  type DepthPlaneId,
  type LinerPresetId,
  type LinerProfile,
} from './boreGaugeMath';

interface BoreGaugeSvgProps {
  presetId: LinerPresetId;
  activeProfile: LinerProfile;
  depthPlane: DepthPlaneId;
  onSelectDepthPlane: (plane: DepthPlaneId) => void;
  axis: BoreAxisId;
  onSelectAxis: (axis: BoreAxisId) => void;
  rockingAngleDeg: number;
  rocked: {
    apparentSpanMm: number;
    cosineErrorMm: number;
    dialDeviationMm: number;
    isAtNullPoint: boolean;
  };
  nullPointReading: {
    apparentSpanMm: number;
    cosineErrorMm: number;
    dialDeviationMm: number;
    isAtNullPoint: boolean;
  };
  blindSubmitted: boolean;
  onRecordCurrentPoint: () => void;
}

export function BoreGaugeSvg({
  presetId,
  activeProfile,
  depthPlane,
  onSelectDepthPlane,
  axis,
  onSelectAxis,
  rockingAngleDeg,
  rocked,
  nullPointReading,
  blindSubmitted,
  onRecordCurrentPoint,
}: BoreGaugeSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  // Theme-aware CAD engineering palette
  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const panelFill = isDark ? '#1e293b' : '#ffffff';
  const panelStroke = isDark ? '#334155' : '#cbd5e1';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textSecondary = isDark ? '#cbd5e1' : '#334155';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const blockCastFill = isDark ? '#1e293b' : '#cbd5e1';
  const blockCastStroke = isDark ? '#475569' : '#64748b';
  const hatchStroke = isDark ? '#334155' : '#94a3b8';

  const activePlaneInfo =
    DEPTH_PLANES.find((p) => p.id === depthPlane) ?? DEPTH_PLANES[0];

  const trueDiameterMm = activeProfile.planes[depthPlane][axis];

  // Exaggerate wear radial offset (nominal half-bore = 76 px)
  const getWallOffsetPx = (diameterMm: number) => {
    const dev = Math.max(0, diameterMm - NOMINAL_BORE_MM);
    return dev * 200; // e.g. +0.084 mm -> +16.8 px radial expansion
  };

  const topWallOffsetPx = getWallOffsetPx(activeProfile.planes.top[axis]);
  const midWallOffsetPx = getWallOffsetPx(activeProfile.planes.mid[axis]);
  const botWallOffsetPx = getWallOffsetPx(activeProfile.planes.bottom[axis]);
  const activeWallOffsetPx = getWallOffsetPx(trueDiameterMm);

  // Longitudinal cylinder coordinates (centerline X = 232, top deck Y = 122, bottom Y = 420)
  const boreCenterX = 232;
  const nomHalfBorePx = 76;
  const topY = 122;
  const planeTopY = 164; // Top — 15 mm
  const planeMidY = 270; // Mid — 75 mm
  const planeBotY = 376; // Bottom — 135 mm
  const botY = 420;

  const probeY =
    depthPlane === 'top'
      ? planeTopY
      : depthPlane === 'mid'
        ? planeMidY
        : planeBotY;

  const leftWallX = boreCenterX - nomHalfBorePx - activeWallOffsetPx;

  // Interpolate exact right inner liner wall X coordinate at any vertical Y
  const getRightWallXAtY = (y: number): number => {
    const baseRight = boreCenterX + nomHalfBorePx;
    if (y <= topY + 12) return baseRight;
    if (y <= planeTopY) {
      const t = (y - (topY + 12)) / (planeTopY - (topY + 12));
      return baseRight + t * topWallOffsetPx;
    }
    if (y <= planeMidY) {
      const t = (y - planeTopY) / (planeMidY - planeTopY);
      return baseRight + topWallOffsetPx + t * (midWallOffsetPx - topWallOffsetPx);
    }
    if (y <= botY) {
      const t = (y - planeMidY) / (botY - planeMidY);
      return baseRight + midWallOffsetPx + t * (botWallOffsetPx - midWallOffsetPx);
    }
    return baseRight + botWallOffsetPx;
  };

  // Exact oblique ray intersection from left anvil pivot (leftWallX, probeY) at angle rockingAngleDeg to right liner wall
  const rockRad = degToRad(rockingAngleDeg);
  const cosRock = Math.cos(rockRad);
  const sinRock = Math.sin(rockRad);
  const approxDx = getRightWallXAtY(probeY) - leftWallX;
  const rightContactY = probeY + approxDx * Math.tan(rockRad);
  const exactRightWallX = getRightWallXAtY(rightContactY);
  const obliqueSpanPx = (exactRightWallX - leftWallX) / cosRock;
  const nullSpanPx = getRightWallXAtY(probeY) - leftWallX;

  // Fixed rigid body offset of the central measuring head from the left fixed anvil ball
  const headCenterPx = nullSpanPx * 0.5;

  // Dial needle angles: 1 full turn = 1.00 mm (100 divisions * 0.01 mm)
  const dialNeedleDeg = (rocked.dialDeviationMm / 1.0) * 360;
  const nullNeedleDeg = (nullPointReading.dialDeviationMm / 1.0) * 360;
  // Sub-dial preload revolution hand: 1.00 mm base preload + comparative deviation (0-10 mm full scale)
  const preloadMm = 1.0 + rocked.dialDeviationMm;
  const subDialDeg = (preloadMm / 10) * 360;

  const planeOvalityMm = Math.abs(
    activeProfile.planes[depthPlane].axisA -
      activeProfile.planes[depthPlane].axisB
  );

  const hideExactValues = presetId === 'blind-challenge' && !blindSubmitted;

  // Place the in-bore span readout badge above the gauge head when at bottom plane so it never crosses botY
  const badgeOffsetY = depthPlane === 'bottom' ? -38 : 26;
  const dimLineOffsetY = depthPlane === 'bottom' ? -18 : 20;

  // Compute stem length so the brass chuck collar always stays at global Y ≈ 66 regardless of probeY or tilt
  const stemHeightPx = Math.max(54, (probeY - 76) / cosRock);

  return (
    <div className="glass-panel overflow-hidden rounded-2xl shadow-xs">
      {/* CAD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {pick(
              'Cylinder Block Cutaway, Cross-Section & 0.01 mm Dial Bore Gauge',
              'Penampang Blok Silinder, Lintang & Dial Bore Gauge 0.01 mm',
              'シリンダブロック断面・楕円度断面 & 0.01 mm シリンダゲージ'
            )}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              rocked.isAtNullPoint
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                rocked.isAtNullPoint
                  ? 'animate-pulse bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            />
            {rocked.isAtNullPoint
              ? pick(
                  'NULL REVERSAL POINT (0.0°)',
                  'TITIK BALIK MINIMUM (0.0°)',
                  '最小反転点 (0.0°)'
                )
              : pick(
                  `TILTED (${rockingAngleDeg > 0 ? '+' : ''}${rockingAngleDeg.toFixed(1)}°)`,
                  `MIRING (${rockingAngleDeg > 0 ? '+' : ''}${rockingAngleDeg.toFixed(1)}°)`,
                  `傾きあり (${rockingAngleDeg > 0 ? '+' : ''}${rockingAngleDeg.toFixed(1)}°)`
                )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            {pick('Depth:', 'Kedalaman:', '深さ:')}{' '}
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {activePlaneInfo.depthMm} mm
            </span>
            {' · '}
            {pick('Span:', 'Bentang:', '測定値:')}{' '}
            <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
              {hideExactValues
                ? `Δ ${rocked.dialDeviationMm >= 0 ? '+' : ''}${rocked.dialDeviationMm.toFixed(3)} mm`
                : `Ø ${rocked.apparentSpanMm.toFixed(3)} mm`}
            </span>
          </div>

          <button
            type="button"
            onClick={onRecordCurrentPoint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            {pick(
              'Record to 6-Point Map',
              'Catat ke Tabel 6-Titik',
              '6点測定表に記録'
            )}
          </button>
        </div>
      </div>

      {/* Engineering CAD SVG — Spacious 980x500 Layout with 1:1 Kinematic Sync */}
      <div className="flex w-full items-center justify-center p-2">
        <svg
          viewBox="0 0 980 500"
          className="w-full max-h-[420px] h-auto select-none"
        role="img"
        aria-label="Engine Cylinder Liner Cutaway and Self-Centering Dial Bore Gauge"
      >
        <defs>
          {/* Blueprint CAD Grid */}
          <pattern
            id="boreCadGrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={gridStroke}
              strokeWidth="0.7"
            />
          </pattern>

          {/* ANSI 45-degree Cast-Iron Section Hatching */}
          <pattern
            id="castIronHatch"
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
              stroke={hatchStroke}
              strokeWidth="1.2"
            />
          </pattern>

          {/* Cylinder Bore Cross-Hatch Honing Texture (60 deg plateau hone) */}
          <pattern
            id="honePattern"
            width="36"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 0 L 36 22 M 36 0 L 0 22"
              fill="none"
              stroke={isDark ? '#38bdf8' : '#0284c7'}
              strokeWidth="0.7"
              opacity={isDark ? '0.16' : '0.18'}
            />
          </pattern>

          {/* Diamond Knurling Pattern for Insulated Grip */}
          <pattern
            id="knurlPattern"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 0 L 6 6 M 6 0 L 0 6"
              fill="none"
              stroke="#0c4a6e"
              strokeWidth="0.9"
              opacity="0.55"
            />
          </pattern>

          {/* Honed Cylinder Bore Interior Metallic Gradient */}
          <linearGradient id="boreCylinderWallGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isDark ? '#0f172a' : '#cbd5e1'} />
            <stop offset="22%" stopColor={isDark ? '#1e293b' : '#e2e8f0'} />
            <stop offset="50%" stopColor={isDark ? '#334155' : '#f8fafc'} />
            <stop offset="78%" stopColor={isDark ? '#1e293b' : '#e2e8f0'} />
            <stop offset="100%" stopColor={isDark ? '#0f172a' : '#cbd5e1'} />
          </linearGradient>

          {/* Hardened Steel Liner Sleeve Wall Gradient */}
          <linearGradient id="steelLinerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#64748b'} />
            <stop offset="50%" stopColor={isDark ? '#64748b' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#475569'} />
          </linearGradient>

          {/* Chrome Stem Gradient */}
          <linearGradient id="chromeStemGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#f8fafc" />
            <stop offset="65%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Stainless Bezel Ring Gradient */}
          <linearGradient id="bezelRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? '#64748b' : '#e2e8f0'} />
            <stop offset="50%" stopColor={isDark ? '#334155' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
          </linearGradient>
        </defs>

        {/* Full Canvas Background & Blueprint Grid */}
        <rect x="0" y="0" width="980" height="500" fill={bgFill} />
        <rect
          x="0"
          y="0"
          width="980"
          height="500"
          fill="url(#boreCadGrid)"
          opacity="0.7"
        />

        {/* ===================================================================
            ZONE 1 (LEFT, x = 12..402): ENGINE BLOCK & LINER LONGITUDINAL CUTAWAY
           =================================================================== */}
        <g>
          {/* Section Header Pill */}
          <rect
            x="16"
            y="10"
            width="378"
            height="38"
            rx="7"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
            opacity="0.92"
          />
          <text
            x="205"
            y="25"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill={textPrimary}
          >
            {pick(
              '1. CYLINDER BLOCK & WET LINER CUTAWAY',
              '1. PENAMPANG BLOK SILINDER & LINER',
              '1. シリンダブロック＆ライナ縦断面'
            )}
          </text>
          <text
            x="205"
            y="40"
            textAnchor="middle"
            fontSize="9.5"
            fill={textMuted}
          >
            {pick(
              'Green dashed = Ø85.000 mm nominal • Pivoting bore gauge',
              'Garis hijau = Ø85.000 mm nominal • Bore gauge berporos',
              '緑破線 = 呼び径 Ø85.000 mm • 自動求心シリンダゲージ'
            )}
          </text>

          {/* Left Cast-Iron Engine Block Housing */}
          <polygon
            points={`
              72,${topY}
              142,${topY}
              142,${botY}
              72,${botY}
            `}
            fill={blockCastFill}
            stroke={blockCastStroke}
            strokeWidth="2"
          />
          <polygon
            points={`
              72,${topY}
              142,${topY}
              142,${botY}
              72,${botY}
            `}
            fill="url(#castIronHatch)"
          />

          {/* Right Cast-Iron Engine Block Housing */}
          <polygon
            points={`
              322,${topY}
              392,${topY}
              392,${botY}
              322,${botY}
            `}
            fill={blockCastFill}
            stroke={blockCastStroke}
            strokeWidth="2"
          />
          <polygon
            points={`
              322,${topY}
              392,${topY}
              392,${botY}
              322,${botY}
            `}
            fill="url(#castIronHatch)"
          />

          {/* Top Cylinder Block Deck Machined Surface & Head Bolt Bosses */}
          <rect
            x="68"
            y={topY - 10}
            width="74"
            height="10"
            rx="2"
            fill="url(#steelLinerGrad)"
            stroke={blockCastStroke}
            strokeWidth="1.5"
          />
          <rect
            x="322"
            y={topY - 10}
            width="74"
            height="10"
            rx="2"
            fill="url(#steelLinerGrad)"
            stroke={blockCastStroke}
            strokeWidth="1.5"
          />
          {/* Tapped Head Bolt Holes in Block Deck */}
          <rect
            x="82"
            y={topY - 10}
            width="11"
            height="38"
            fill={isDark ? '#0f172a' : '#e2e8f0'}
            stroke={blockCastStroke}
            strokeWidth="1.2"
          />
          <rect
            x="370"
            y={topY - 10}
            width="11"
            height="38"
            fill={isDark ? '#0f172a' : '#e2e8f0'}
            stroke={blockCastStroke}
            strokeWidth="1.2"
          />

          {/* Water-Jacket Coolant Cavities (Left & Right) */}
          {[156, 234, 312].map((cy) => (
            <g key={cy}>
              <rect
                x="102"
                y={cy}
                width="22"
                height="56"
                rx="6"
                fill={isDark ? '#0284c738' : '#bae6fd'}
                stroke="#0284c7"
                strokeWidth="1.3"
              />
              <path
                d={`M 106 ${cy + 18} Q 113 ${cy + 14} 120 ${cy + 18} M 106 ${cy + 38} Q 113 ${cy + 34} 120 ${cy + 38}`}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.2"
              />
              <rect
                x="340"
                y={cy}
                width="22"
                height="56"
                rx="6"
                fill={isDark ? '#0284c738' : '#bae6fd'}
                stroke="#0284c7"
                strokeWidth="1.3"
              />
              <path
                d={`M 344 ${cy + 18} Q 351 ${cy + 14} 358 ${cy + 18} M 344 ${cy + 38} Q 351 ${cy + 34} 358 ${cy + 38}`}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.2"
              />
            </g>
          ))}

          {/* Honed Cylinder Bore Interior Wall Surface */}
          <polygon
            points={`
              ${boreCenterX - nomHalfBorePx - topWallOffsetPx},${topY}
              ${boreCenterX + nomHalfBorePx + topWallOffsetPx},${topY}
              ${boreCenterX + nomHalfBorePx + midWallOffsetPx},${planeMidY}
              ${boreCenterX + nomHalfBorePx + botWallOffsetPx},${botY}
              ${boreCenterX - nomHalfBorePx - botWallOffsetPx},${botY}
              ${boreCenterX - nomHalfBorePx - midWallOffsetPx},${planeMidY}
            `}
            fill="url(#boreCylinderWallGrad)"
          />
          {/* Cross-Hatch Plateau Honing Overlay */}
          <polygon
            points={`
              ${boreCenterX - nomHalfBorePx - topWallOffsetPx},${topY}
              ${boreCenterX + nomHalfBorePx + topWallOffsetPx},${topY}
              ${boreCenterX + nomHalfBorePx + midWallOffsetPx},${planeMidY}
              ${boreCenterX + nomHalfBorePx + botWallOffsetPx},${botY}
              ${boreCenterX - nomHalfBorePx - botWallOffsetPx},${botY}
              ${boreCenterX - nomHalfBorePx - midWallOffsetPx},${planeMidY}
            `}
            fill="url(#honePattern)"
          />

          {/* Left Hardened Steel Cylinder Liner Sleeve Wall */}
          <polygon
            points={`
              128,${topY - 6}
              ${boreCenterX - nomHalfBorePx},${topY - 6}
              ${boreCenterX - nomHalfBorePx},${topY + 12}
              ${boreCenterX - nomHalfBorePx - topWallOffsetPx},${planeTopY}
              ${boreCenterX - nomHalfBorePx - midWallOffsetPx},${planeMidY}
              ${boreCenterX - nomHalfBorePx - botWallOffsetPx},${botY}
              138,${botY}
              138,${topY + 16}
              128,${topY + 16}
            `}
            fill="url(#steelLinerGrad)"
            stroke={isDark ? '#94a3b8' : '#334155'}
            strokeWidth="1.8"
          />

          {/* Right Hardened Steel Cylinder Liner Sleeve Wall */}
          <polygon
            points={`
              ${boreCenterX + nomHalfBorePx},${topY - 6}
              336,${topY - 6}
              336,${topY + 16}
              326,${topY + 16}
              326,${botY}
              ${boreCenterX + nomHalfBorePx + botWallOffsetPx},${botY}
              ${boreCenterX + nomHalfBorePx + midWallOffsetPx},${planeMidY}
              ${boreCenterX + nomHalfBorePx + topWallOffsetPx},${planeTopY}
              ${boreCenterX + nomHalfBorePx},${topY + 12}
            `}
            fill="url(#steelLinerGrad)"
            stroke={isDark ? '#94a3b8' : '#334155'}
            strokeWidth="1.8"
          />

          {/* Lower Liner O-Ring Viton Seals */}
          {[386, 398].map((oy) => (
            <g key={oy}>
              <circle cx="138" cy={oy} r="3.2" fill="#ef4444" />
              <circle cx="326" cy={oy} r="3.2" fill="#ef4444" />
            </g>
          ))}

          {/* Amber Wear Envelope Highlight along Inner Bore Walls */}
          {(topWallOffsetPx > 3 || midWallOffsetPx > 3) && (
            <>
              <polyline
                points={`
                  ${boreCenterX - nomHalfBorePx},${topY + 12}
                  ${boreCenterX - nomHalfBorePx - topWallOffsetPx},${planeTopY}
                  ${boreCenterX - nomHalfBorePx - midWallOffsetPx},${planeMidY}
                  ${boreCenterX - nomHalfBorePx - botWallOffsetPx},${botY}
                `}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.2"
              />
              <polyline
                points={`
                  ${boreCenterX + nomHalfBorePx},${topY + 12}
                  ${boreCenterX + nomHalfBorePx + topWallOffsetPx},${planeTopY}
                  ${boreCenterX + nomHalfBorePx + midWallOffsetPx},${planeMidY}
                  ${boreCenterX + nomHalfBorePx + botWallOffsetPx},${botY}
                `}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.2"
              />
            </>
          )}

          {/* Nominal Unworn Bore Datum Lines (Ø85.000 mm) */}
          <line
            x1={boreCenterX - nomHalfBorePx}
            y1={topY - 8}
            x2={boreCenterX - nomHalfBorePx}
            y2={botY + 8}
            stroke="#10b981"
            strokeWidth="1.3"
            strokeDasharray="5 4"
          />
          <line
            x1={boreCenterX + nomHalfBorePx}
            y1={topY - 8}
            x2={boreCenterX + nomHalfBorePx}
            y2={botY + 8}
            stroke="#10b981"
            strokeWidth="1.3"
            strokeDasharray="5 4"
          />

          {/* Bore Centerline Axis */}
          <line
            x1={boreCenterX}
            y1="56"
            x2={boreCenterX}
            y2={botY + 14}
            stroke={isDark ? '#475569' : '#94a3b8'}
            strokeWidth="1"
            strokeDasharray="8 4 2 4"
          />

          {/* Interactive Depth Plane Callout Buttons (Left Margin x = 12..64, Clear of Block at x = 72) */}
          {(
            [
              { id: 'top', y: planeTopY, tag: 'TOP 15' },
              { id: 'mid', y: planeMidY, tag: 'MID 75' },
              { id: 'bottom', y: planeBotY, tag: 'BOT 135' },
            ] as { id: DepthPlaneId; y: number; tag: string }[]
          ).map((p) => {
            const active = depthPlane === p.id;
            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onClick={() => onSelectDepthPlane(p.id)}
              >
                <line
                  x1="64"
                  y1={p.y}
                  x2="324"
                  y2={p.y}
                  stroke={active ? '#0ea5e9' : isDark ? '#334155' : '#cbd5e1'}
                  strokeWidth={active ? '1.8' : '1'}
                  strokeDasharray={active ? 'none' : '3 3'}
                />
                <rect
                  x="12"
                  y={p.y - 11}
                  width="52"
                  height="22"
                  rx="5"
                  fill={active ? '#0284c7' : panelFill}
                  stroke={active ? '#38bdf8' : panelStroke}
                  strokeWidth="1.3"
                />
                <text
                  x="38"
                  y={p.y + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={active ? '#ffffff' : textSecondary}
                >
                  {p.tag}
                </text>
              </g>
            );
          })}

          {/* ===============================================================
              SELF-CENTERING DIAL BORE GAUGE ASSEMBLY (PIVOTING AROUND ANVIL)
             =============================================================== */}
          {/* Fixed Anvil Contact Pivot Marker on Left Wall */}
          <circle
            cx={leftWallX}
            cy={probeY}
            r="6"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.4"
            strokeDasharray="2 2"
          />

          {/* Right Plunger Contact Arc Sweep Trace on Right Wall */}
          <path
            d={`M ${leftWallX + nullSpanPx * Math.cos((-8 * Math.PI) / 180)} ${
              probeY + nullSpanPx * Math.sin((-8 * Math.PI) / 180)
            } A ${nullSpanPx} ${nullSpanPx} 0 0 1 ${
              leftWallX + nullSpanPx * Math.cos((8 * Math.PI) / 180)
            } ${probeY + nullSpanPx * Math.sin((8 * Math.PI) / 180)}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.1"
            strokeDasharray="3 3"
            opacity="0.65"
          />

          {/* Entire Bore Gauge Pivots Around Left Fixed Anvil Contact Point (leftWallX, probeY) */}
          <g
            transform={`translate(${leftWallX}, ${probeY}) rotate(${rockingAngleDeg})`}
          >
            {/* Oblique Chord Span Line (0 to exact obliqueSpanPx on right wall) */}
            <line
              x1="0"
              y1={dimLineOffsetY}
              x2={obliqueSpanPx}
              y2={dimLineOffsetY}
              stroke={rocked.isAtNullPoint ? '#10b981' : '#f59e0b'}
              strokeWidth="1.6"
            />
            <line
              x1="0"
              y1={dimLineOffsetY - 6}
              x2="0"
              y2={dimLineOffsetY + 6}
              stroke={rocked.isAtNullPoint ? '#10b981' : '#f59e0b'}
              strokeWidth="1.4"
            />
            <line
              x1={obliqueSpanPx}
              y1={dimLineOffsetY - 6}
              x2={obliqueSpanPx}
              y2={dimLineOffsetY + 6}
              stroke={rocked.isAtNullPoint ? '#10b981' : '#f59e0b'}
              strokeWidth="1.4"
            />

            {/* Left Replaceable Carbide Anvil & Threaded Locknut (Fixed Rigid Length to headCenterPx) */}
            <circle
              cx="3.5"
              cy="0"
              r="3.8"
              fill="#f59e0b"
              stroke="#78350f"
              strokeWidth="1"
            />
            <rect
              x="6"
              y="-4"
              width={headCenterPx - 22}
              height="8"
              rx="1.5"
              fill="url(#chromeStemGrad)"
              stroke="#475569"
              strokeWidth="1"
            />
            {/* Knurled Anvil Retaining Nut */}
            <rect
              x={headCenterPx - 28}
              y="-6.5"
              width="10"
              height="13"
              rx="1.5"
              fill="#eab308"
              stroke="#713f12"
              strokeWidth="1"
            />

            {/* Spring-Loaded Self-Centering Guide Bridge Wings & Rollers Seating on Right Wall */}
            <path
              d={`M ${headCenterPx - 18},-9 L ${obliqueSpanPx - 12},-14 L ${obliqueSpanPx - 12},14 L ${headCenterPx - 18},9 Z`}
              fill={isDark ? '#334155' : '#94a3b8'}
              stroke={isDark ? '#64748b' : '#475569'}
              strokeWidth="1.2"
              opacity="0.82"
            />
            {/* Guide Bridge Wall Contact Rollers */}
            <circle
              cx={obliqueSpanPx - 4.5}
              cy="-13"
              r="3.2"
              fill="#38bdf8"
              stroke="#0369a1"
              strokeWidth="1"
            />
            <circle
              cx={obliqueSpanPx - 4.5}
              cy="13"
              r="3.2"
              fill="#38bdf8"
              stroke="#0369a1"
              strokeWidth="1"
            />

            {/* Right Spring-Loaded Carbide Measuring Plunger (Extends Dynamically to obliqueSpanPx) */}
            <rect
              x={headCenterPx + 16}
              y="-3.5"
              width={Math.max(10, obliqueSpanPx - headCenterPx - 21)}
              height="7"
              rx="1.5"
              fill="url(#chromeStemGrad)"
              stroke="#0284c7"
              strokeWidth="1"
            />
            <circle
              cx={obliqueSpanPx - 3.5}
              cy="0"
              r="4.2"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* Central Bell-Crank Measuring Head Housing */}
            <rect
              x={headCenterPx - 18}
              y="-13"
              width="36"
              height="26"
              rx="6"
              fill={isDark ? '#1e293b' : '#334155'}
              stroke="#38bdf8"
              strokeWidth="1.6"
            />
            {/* Internal 90-degree Bell-Crank Cam Lever Rotating with Plunger Displacement */}
            <g
              transform={`translate(${headCenterPx}, 0) rotate(${
                rocked.dialDeviationMm * 45
              })`}
            >
              <path
                d="M -6,6 L 6,6 L 6,-6 Z"
                fill="#eab308"
                stroke="#713f12"
                strokeWidth="0.9"
              />
              <circle cx="0" cy="0" r="2.5" fill="#0ea5e9" />
            </g>

            {/* Vertical Chrome Bore Gauge Stem Rising Out of Bore */}
            <rect
              x={headCenterPx - 5.5}
              y={-stemHeightPx}
              width="11"
              height={stemHeightPx - 13}
              rx="2"
              fill="url(#chromeStemGrad)"
              stroke="#475569"
              strokeWidth="1.2"
            />

            {/* Thermal-Insulated Knurled Hand Grip on Stem */}
            <rect
              x={headCenterPx - 9.5}
              y={-stemHeightPx + 10}
              width="19"
              height="38"
              rx="3.5"
              fill="#0284c7"
              stroke="#0369a1"
              strokeWidth="1.2"
            />
            <rect
              x={headCenterPx - 9.5}
              y={-stemHeightPx + 10}
              width="19"
              height="38"
              rx="3.5"
              fill="url(#knurlPattern)"
            />

            {/* Brass Dial Stem Chuck Collar at Top of Stem */}
            <rect
              x={headCenterPx - 7.5}
              y={-stemHeightPx - 6}
              width="15"
              height="8"
              rx="2"
              fill="#eab308"
              stroke="#713f12"
              strokeWidth="1"
            />

            {/* Span Readout Tag on Gauge (Stays Inside Bore at All Depths) */}
            <rect
              x={obliqueSpanPx * 0.5 - 56}
              y={badgeOffsetY}
              width="112"
              height="19"
              rx="4"
              fill={panelFill}
              stroke={rocked.isAtNullPoint ? '#10b981' : '#f59e0b'}
              strokeWidth="1.4"
            />
            <text
              x={obliqueSpanPx * 0.5}
              y={badgeOffsetY + 13}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              fill={rocked.isAtNullPoint ? '#10b981' : '#f59e0b'}
            >
              {hideExactValues
                ? `Δ ${rocked.dialDeviationMm >= 0 ? '+' : ''}${rocked.dialDeviationMm.toFixed(3)} mm`
                : `Ø ${rocked.apparentSpanMm.toFixed(3)} mm`}
            </text>
          </g>

          {/* Highlight Contact Dot on Right Wall at Exact (exactRightWallX, probeY + (exactRightWallX - leftWallX)*tan(θ)) */}
          <circle
            cx={leftWallX + obliqueSpanPx * cosRock}
            cy={probeY + obliqueSpanPx * sinRock}
            r="5.5"
            fill="none"
            stroke={rocked.isAtNullPoint ? '#10b981' : '#ef4444'}
            strokeWidth="1.4"
          />

          {/* Bottom Legend Pill */}
          <rect
            x="22"
            y="456"
            width="366"
            height="24"
            rx="6"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x="205"
            y="472"
            textAnchor="middle"
            fontSize="9.5"
            fill={textMuted}
          >
            {pick(
              'Click TOP / MID / BOT to move probe • Pivots on fixed carbide anvil',
              'Klik TOP / MID / BOT untuk pindah probe • Berporos pada anvil karbida',
              'TOP / MID / BOT クリックで深さ変更 • 超硬アンビル接点を支点に揺動'
            )}
          </text>
        </g>

        {/* Vertical Divider 1 */}
        <line
          x1="404"
          y1="12"
          x2="404"
          y2="488"
          stroke={panelStroke}
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />

        {/* ===================================================================
            ZONE 2 (CENTER, x = 410..666): TOP-DOWN RADIAL OVALITY CROSS-SECTION
           =================================================================== */}
        <g>
          {/* Section Header Pill */}
          <rect
            x="414"
            y="10"
            width="248"
            height="38"
            rx="7"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
            opacity="0.92"
          />
          <text
            x="538"
            y="25"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill={textPrimary}
          >
            {pick(
              '2. RADIAL OVALITY SECTION',
              '2. PENAMPANG LINTANG OVALITAS',
              '2. 水平断面（楕円度・求心ビュー）'
            )}
          </text>
          <text
            x="538"
            y="40"
            textAnchor="middle"
            fontSize="9.5"
            fill={textMuted}
          >
            {pick(
              `Plane: ${activePlaneInfo.id.toUpperCase()} (${activePlaneInfo.depthMm} mm) • Click Axis A / B`,
              `Bidang: ${activePlaneInfo.id.toUpperCase()} (${activePlaneInfo.depthMm} mm) • Klik Sumbu A / B`,
              `断面深さ: ${activePlaneInfo.depthMm} mm • A軸/B軸クリック切替`
            )}
          </text>

          {/* Cross-Section Graphic Centered at (538, 178) */}
          <g transform="translate(538, 178)">
            {/* Cast-Iron Cylinder Block Deck Boss Outline */}
            <rect
              x="-92"
              y="-92"
              width="184"
              height="184"
              rx="24"
              fill={blockCastFill}
              stroke={blockCastStroke}
              strokeWidth="2"
            />
            {/* 4 Corner M12 Head Bolt Holes */}
            {[
              [-71, -71],
              [71, -71],
              [-71, 71],
              [71, 71],
            ].map(([bx, by], i) => (
              <circle
                key={i}
                cx={bx}
                cy={by}
                r="7.5"
                fill={bgFill}
                stroke={blockCastStroke}
                strokeWidth="1.5"
              />
            ))}

            {/* Water Jacket Annulus Ring */}
            <circle
              cx="0"
              cy="0"
              r="80"
              fill={isDark ? '#0284c733' : '#bae6fd'}
              stroke="#0284c7"
              strokeWidth="1.3"
              strokeDasharray="8 4"
            />

            {/* Steel Cylinder Liner Outer Sleeve */}
            <circle
              cx="0"
              cy="0"
              r="70"
              fill="url(#steelLinerGrad)"
              stroke={isDark ? '#94a3b8' : '#475569'}
              strokeWidth="2"
            />

            {/* Bore Interior & Nominal Ø85.000 mm Green Reference Circle */}
            <circle
              cx="0"
              cy="0"
              r="56"
              fill={bgFill}
              stroke="#10b981"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />

            {/* Exaggerated Worn Elliptical Bore Profile */}
            {(() => {
              const rxWear =
                56 +
                (activeProfile.planes[depthPlane].axisA - NOMINAL_BORE_MM) *
                  175;
              const ryWear =
                56 +
                (activeProfile.planes[depthPlane].axisB - NOMINAL_BORE_MM) *
                  175;
              return (
                <ellipse
                  cx="0"
                  cy="0"
                  rx={rxWear}
                  ry={ryWear}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.2"
                />
              );
            })()}

            {/* Axis A (0° Horizontal Thrust Axis) Line */}
            <line
              x1="-88"
              y1="0"
              x2="88"
              y2="0"
              stroke={axis === 'axisA' ? '#0ea5e9' : textMuted}
              strokeWidth={axis === 'axisA' ? '2.4' : '1'}
              strokeDasharray={axis === 'axisA' ? 'none' : '3 3'}
            />

            {/* Axis B (90° Vertical Wrist-Pin Axis) Line */}
            <line
              x1="0"
              y1="-88"
              x2="0"
              y2="88"
              stroke={axis === 'axisB' ? '#8b5cf6' : textMuted}
              strokeWidth={axis === 'axisB' ? '2.4' : '1'}
              strokeDasharray={axis === 'axisB' ? 'none' : '3 3'}
            />

            {/* Self-Centering Bore Gauge Head Top-Down View (Rotates 0° or 90° and seats on elliptical wall) */}
            {(() => {
              const activeRadialPx =
                56 + (trueDiameterMm - NOMINAL_BORE_MM) * 175;
              return (
                <g transform={`rotate(${axis === 'axisA' ? 0 : 90})`}>
                  {/* Spring-loaded centering bridge shoes pressing against wall */}
                  <path
                    d={`M 10,-26 Q ${activeRadialPx - 3},-42 ${activeRadialPx - 5},-11 L ${activeRadialPx - 5},11 Q ${activeRadialPx - 3},42 10,26 Z`}
                    fill={isDark ? '#334155aa' : '#cbd5e1aa'}
                    stroke="#38bdf8"
                    strokeWidth="1.4"
                  />
                  <circle
                    cx={activeRadialPx - 9}
                    cy="-22"
                    r="3.2"
                    fill="#38bdf8"
                  />
                  <circle
                    cx={activeRadialPx - 9}
                    cy="22"
                    r="3.2"
                    fill="#38bdf8"
                  />

                  {/* Anvil-to-Plunger Contact Line Passing Through True Center */}
                  <line
                    x1={-activeRadialPx + 2}
                    y1="0"
                    x2={activeRadialPx - 2}
                    y2="0"
                    stroke={axis === 'axisA' ? '#0ea5e9' : '#8b5cf6'}
                    strokeWidth="4.5"
                  />
                  <circle
                    cx={-activeRadialPx + 2.5}
                    cy="0"
                    r="4"
                    fill="#f59e0b"
                  />
                  <circle
                    cx={activeRadialPx - 2.5}
                    cy="0"
                    r="4.2"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="8.5"
                    fill={panelFill}
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                  />
                </g>
              );
            })()}
          </g>

          {/* Spacious Axis A & Axis B Selector Pills Below Cross-Section (Full 244 px width) */}
          <g className="cursor-pointer" onClick={() => onSelectAxis('axisA')}>
            <rect
              x="416"
              y="286"
              width="244"
              height="28"
              rx="6"
              fill={axis === 'axisA' ? '#0284c7' : panelFill}
              stroke={axis === 'axisA' ? '#38bdf8' : panelStroke}
              strokeWidth="1.3"
            />
            <text
              x="538"
              y="304"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={axis === 'axisA' ? '#ffffff' : '#0ea5e9'}
            >
              {pick(
                '↔ Axis A: 0° Thrust Wall (Con-Rod Force)',
                '↔ Sumbu A: 0° Dinding Thrust (Gaya Samping)',
                '↔ A軸: 0° スラスト方向（ピストン側圧）'
              )}
            </text>
          </g>

          <g className="cursor-pointer" onClick={() => onSelectAxis('axisB')}>
            <rect
              x="416"
              y="322"
              width="244"
              height="28"
              rx="6"
              fill={axis === 'axisB' ? '#7c3aed' : panelFill}
              stroke={axis === 'axisB' ? '#a78bfa' : panelStroke}
              strokeWidth="1.3"
            />
            <text
              x="538"
              y="340"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={axis === 'axisB' ? '#ffffff' : '#8b5cf6'}
            >
              {pick(
                '↕ Axis B: 90° Wrist-Pin (Crank Parallel)',
                '↕ Sumbu B: 90° Pena Piston (Sejajar Engkol)',
                '↕ B軸: 90° ピストンピン方向（クランク平行）'
              )}
            </text>
          </g>

          {/* Plane Ovality Readout Card (y = 360..442) */}
          <rect
            x="416"
            y="360"
            width="244"
            height="82"
            rx="9"
            fill={panelFill}
            stroke={
              !hideExactValues && planeOvalityMm > OEM_SERVICE_LIMIT_MM + 1e-6
                ? '#ef4444'
                : panelStroke
            }
            strokeWidth="1.5"
          />
          <text
            x="538"
            y="380"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="bold"
            fill={textMuted}
          >
            {pick(
              `${activePlaneInfo.id.toUpperCase()} PLANE OVALITY |D_A - D_B|`,
              `OVALITAS BIDANG ${activePlaneInfo.id.toUpperCase()} |D_A - D_B|`,
              `${activePlaneInfo.id.toUpperCase()} 断面楕円度 |D_A - D_B|`
            )}
          </text>
          <text
            x="538"
            y="404"
            textAnchor="middle"
            fontSize="13"
            fontFamily="monospace"
            fontWeight="bold"
            fill={
              hideExactValues
                ? '#0ea5e9'
                : planeOvalityMm > OEM_SERVICE_LIMIT_MM + 1e-6
                  ? '#ef4444'
                  : '#10b981'
            }
          >
            {hideExactValues
              ? pick(
                  'Measure Axis A & B',
                  'Ukur Sumbu A & B',
                  'A軸・B軸を測定'
                )
              : `${planeOvalityMm.toFixed(3)} mm (${
                  planeOvalityMm > OEM_SERVICE_LIMIT_MM + 1e-6
                    ? 'EXCEEDS 0.050'
                    : '≤ 0.050 OK'
                })`}
          </text>
          <text
            x="538"
            y="426"
            textAnchor="middle"
            fontSize="9"
            fontFamily="monospace"
            fill={textSecondary}
          >
            {hideExactValues
              ? pick(
                  'Blind Mode: Use Dial Indicator →',
                  'Mode Buta: Gunakan Indikator Dial →',
                  '実技モード: 右のダイヤルで読取 →'
                )
              : `D_A=${activeProfile.planes[depthPlane].axisA.toFixed(3)} | D_B=${activeProfile.planes[depthPlane].axisB.toFixed(3)}`}
          </text>

          {/* Bottom Legend Pill */}
          <rect
            x="416"
            y="456"
            width="244"
            height="24"
            rx="6"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x="538"
            y="472"
            textAnchor="middle"
            fontSize="9.5"
            fill={textMuted}
          >
            {pick(
              'Red ellipse = Exaggerated bore wear',
              'Elips merah = Profil keausan diperbesar',
              '赤楕円 = 摩耗プロファイル（拡大表示）'
            )}
          </text>
        </g>

        {/* Vertical Divider 2 */}
        <line
          x1="672"
          y1="12"
          x2="672"
          y2="488"
          stroke={panelStroke}
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />

        {/* ===================================================================
            ZONE 3 (RIGHT, x = 678..968): 0.01 mm DIAL INDICATOR & REVERSAL CURVE
           =================================================================== */}
        <g>
          {/* Section Header Pill */}
          <rect
            x="684"
            y="10"
            width="282"
            height="38"
            rx="7"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
            opacity="0.92"
          />
          <text
            x="825"
            y="25"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill={textPrimary}
          >
            {pick(
              '3. 0.01 mm DIAL BORE INDICATOR',
              '3. INDIKATOR DIAL BORE 0.01 mm',
              '3. 0.01 mm 目盛ダイヤルゲージ拡大'
            )}
          </text>
          <text
            x="825"
            y="40"
            textAnchor="middle"
            fontSize="9.5"
            fill={textMuted}
          >
            {pick(
              'Zeroed at Ø85.000 mm • Green ▲ = Null reversal',
              'Nol pada Ø85.000 mm • ▲ Hijau = Titik balik',
              'Ø85.000 mm 基準 • 緑▲ = 最小反転点'
            )}
          </text>

          {/* Dial Indicator Centered at (825, 168) with r = 104 */}
          <g transform="translate(825, 168)">
            {/* Top Bezel Clamp Screw */}
            <rect
              x="74"
              y="-90"
              width="14"
              height="10"
              rx="2"
              transform="rotate(42 81 -85)"
              fill="#94a3b8"
              stroke="#475569"
            />

            {/* Outer Knurled Bezel Ring */}
            <circle
              cx="0"
              cy="0"
              r="104"
              fill="url(#bezelRingGrad)"
              stroke={isDark ? '#64748b' : '#475569'}
              strokeWidth="3"
            />

            {/* Inner High-Contrast Dial Face */}
            <circle
              cx="0"
              cy="0"
              r="93"
              fill={isDark ? '#090d16' : '#ffffff'}
              stroke={isDark ? '#334155' : '#cbd5e1'}
              strokeWidth="2"
            />

            {/* Green OEM Service Limit Arc (0.00 to +0.050 mm => 0° to +18°) */}
            <path
              d="M 0,-86 A 86,86 0 0,1 26.6,-81.8"
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              opacity="0.48"
            />

            {/* 100 Precision Tick Marks (1 rev = 1.00 mm, 1 div = 0.01 mm) */}
            {Array.from({ length: 100 }).map((_, idx) => {
              const deg = idx * 3.6;
              const rad = ((deg - 90) * Math.PI) / 180;
              const isMajor = idx % 10 === 0;
              const isMed = idx % 5 === 0 && !isMajor;
              const rOuter = 89;
              const rInner = isMajor ? 75 : isMed ? 80 : 83.5;
              const x1 = rInner * Math.cos(rad);
              const y1 = rInner * Math.sin(rad);
              const x2 = rOuter * Math.cos(rad);
              const y2 = rOuter * Math.sin(rad);
              const labelR = 63;
              const lx = labelR * Math.cos(rad);
              const ly = labelR * Math.sin(rad);
              return (
                <g key={idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      idx === 0
                        ? '#10b981'
                        : idx === 5
                          ? '#f59e0b'
                          : isDark
                            ? '#cbd5e1'
                            : '#334155'
                    }
                    strokeWidth={isMajor ? '2' : isMed ? '1.4' : '0.85'}
                  />
                  {isMajor && (
                    <text
                      x={lx}
                      y={ly + 3.5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                      fill={idx === 0 ? '#10b981' : textPrimary}
                    >
                      {idx}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Multi-Revolution Preload Sub-Dial (0–10 mm) at (-29, 0) — 1:1 Synchronized with Main Needle */}
            <g transform="translate(-29, 0)">
              <circle
                cx="0"
                cy="0"
                r="17"
                fill={isDark ? '#1e293b' : '#f1f5f9'}
                stroke={panelStroke}
                strokeWidth="1.2"
              />
              {Array.from({ length: 10 }).map((_, i) => {
                const a = ((i * 36 - 90) * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={12.5 * Math.cos(a)}
                    y1={12.5 * Math.sin(a)}
                    x2={15.5 * Math.cos(a)}
                    y2={15.5 * Math.sin(a)}
                    stroke={i === 1 ? '#10b981' : textMuted}
                    strokeWidth={i === 1 ? '1.5' : '1'}
                  />
                );
              })}
              <line
                x1="0"
                y1="2"
                x2={11 * Math.sin((subDialDeg * Math.PI) / 180)}
                y2={-11 * Math.cos((subDialDeg * Math.PI) / 180)}
                stroke="#0ea5e9"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="2" fill="#0ea5e9" />
            </g>

            {/* Dial Face Typography (Positioned with Zero Collisions) */}
            <text
              x="0"
              y="-32"
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="bold"
              fill={textSecondary}
            >
              0.01 mm
            </text>
            <rect
              x="-36"
              y="26"
              width="72"
              height="16"
              rx="4"
              fill={isDark ? '#1e293b' : '#f1f5f9'}
              stroke={panelStroke}
              strokeWidth="0.8"
            />
            <text
              x="0"
              y="37"
              textAnchor="middle"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#0ea5e9"
            >
              0 = Ø85.000
            </text>

            {/* Ghost Null-Point Reversal Marker (True Minimum Angle at θ = 0°) */}
            <g transform={`rotate(${nullNeedleDeg})`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-81"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
              <polygon points="0,-88 -4.5,-77 4.5,-77" fill="#10b981" />
            </g>

            {/* Live Main Dial Indicator Needle */}
            <g transform={`rotate(${dialNeedleDeg})`}>
              <polygon
                points="-2.4,18 2.4,18 1,-79 0,-85 -1,-79"
                fill="#ef4444"
              />
              <circle
                cx="0"
                cy="0"
                r="7.5"
                fill="#334155"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <circle cx="0" cy="0" r="2.8" fill="#f8fafc" />
            </g>
          </g>

          {/* Bottom-Right: Rocking Angle vs Apparent Bore Span Parabola Card (y = 284..480) */}
          <g transform="translate(684, 284)">
            <rect
              x="0"
              y="0"
              width="282"
              height="196"
              rx="10"
              fill={panelFill}
              stroke={panelStroke}
              strokeWidth="1.5"
            />
            <text
              x="141"
              y="19"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={textPrimary}
            >
              {pick(
                'NEEDLE REVERSAL CURVE D(θ) = D_true / cos(θ)',
                'KURVA TITIK BALIK D(θ) = D_true / cos(θ)',
                '揺動反転曲線 D(θ) = D_true / cos(θ)'
              )}
            </text>

            {/* Plot Axes */}
            <line
              x1="28"
              y1="90"
              x2="254"
              y2="90"
              stroke={panelStroke}
              strokeWidth="1.2"
            />
            <line
              x1="141"
              y1="28"
              x2="141"
              y2="95"
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Parabola Curve (Vertex at x = 141, y = 86) */}
            <path
              d="M 35,34 Q 141,138 247,34"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.4"
            />

            {/* Null Point Minimum Vertex */}
            <circle cx="141" cy="86" r="4" fill="#10b981" />

            {/* Live Rocking Angle Marker on Parabola */}
            {(() => {
              const norm = Math.max(-1, Math.min(1, rockingAngleDeg / 8));
              const cx = 141 + norm * 106;
              const cy = 86 - norm * norm * 52;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill={rocked.isAtNullPoint ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })()}

            {/* Angle Axis Labels (Cleanly Separated at y = 108) */}
            <text x="28" y="108" fontSize="9" fill={textMuted}>
              -8.0°
            </text>
            <text
              x="141"
              y="108"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="#10b981"
            >
              0.0° (MIN NULL)
            </text>
            <text
              x="254"
              y="108"
              textAnchor="end"
              fontSize="9"
              fill={textMuted}
            >
              +8.0°
            </text>

            {/* 3-Row Stacked Digital Readout (Full 254 px width per row -> Zero Collisions) */}
            <line
              x1="14"
              y1="118"
              x2="268"
              y2="118"
              stroke={panelStroke}
              strokeWidth="1"
            />

            <text x="18" y="136" fontSize="9.5" fill={textMuted}>
              {pick(
                'Comparative Dial Deviation:',
                'Simpangan Komparatif Dial:',
                '基準リングからのダイヤル偏差:'
              )}
            </text>
            <text
              x="264"
              y="136"
              textAnchor="end"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#0ea5e9"
            >
              {`${rocked.dialDeviationMm >= 0 ? '+' : ''}${rocked.dialDeviationMm.toFixed(3)} mm`}
            </text>

            <text x="18" y="158" fontSize="9.5" fill={textMuted}>
              {pick(
                'Cosine Tilt Error e_rock(θ):',
                'Kesalahan Miring Kosinus:',
                '傾きコサイン誤差 e_rock(θ):'
              )}
            </text>
            <text
              x="264"
              y="158"
              textAnchor="end"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              fill={rocked.cosineErrorMm > 0.005 ? '#f59e0b' : '#10b981'}
            >
              {`+${rocked.cosineErrorMm.toFixed(3)} mm`}
            </text>

            <text
              x="18"
              y="180"
              fontSize="9.5"
              fontWeight="bold"
              fill={textSecondary}
            >
              {pick(
                'Measured Bore Span D(θ):',
                'Bentang Diameter Terukur:',
                '現在の測定スパン D(θ):'
              )}
            </text>
            <text
              x="264"
              y="180"
              textAnchor="end"
              fontSize="10.5"
              fontFamily="monospace"
              fontWeight="bold"
              fill={textPrimary}
            >
              {hideExactValues
                ? '85.000 + ΔDial'
                : `Ø ${rocked.apparentSpanMm.toFixed(3)} mm`}
            </text>
          </g>
        </g>
      </svg>
      </div>
    </div>
  );
}
