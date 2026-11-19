import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  HitchType,
  PresetId,
  RiggingCalculationResult,
  SlingWllSpec,
} from './riggingData';

interface RiggingHoistSvgProps {
  presetId: PresetId;
  hitchType: HitchType;
  wllSpec: SlingWllSpec;
  cogOffsetPct: number;
  hookPosPct: number;
  calc: RiggingCalculationResult;
  useSpreaderBeam: boolean;
}

export function RiggingHoistSvg({
  presetId,
  hitchType,
  wllSpec,
  cogOffsetPct,
  hookPosPct,
  calc,
  useSpreaderBeam,
}: RiggingHoistSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware Material You CAD engineering palette
  const palette = {
    bg: 'var(--md-surface-container-lowest)',
    grid: 'var(--md-outline-variant)',
    cardFill: 'var(--md-surface-container)',
    cardStroke: 'var(--md-outline-variant)',
    textPrimary: 'var(--md-on-surface)',
    textSecondary: 'var(--md-on-surface-variant)',
    textMuted: 'var(--md-on-surface-variant)',
    machineCasing: isDark ? '#334155' : '#cbd5e1',
    machineDark: isDark ? '#1e293b' : '#94a3b8',
    machineStroke: isDark ? '#94a3b8' : '#475569',
    skidBeamFill: isDark ? '#1e293b' : '#cbd5e1',
    skidBeamFlange: isDark ? '#475569' : '#64748b',
    floorFill: 'var(--md-surface-container)',
    floorStroke: 'var(--md-outline-variant)',
    forgedSteel: isDark ? '#94a3b8' : '#475569',
    forgedSteelDark: isDark ? '#475569' : '#334155',
  };

  // === STRICT ISOTROPIC GEOMETRIC SYNCHRONIZATION ===
  // Base coordinate system: 880 x 515
  const centerX = 440;
  const baseLugHalfSpanPx = 142;

  // True nominal angle in radians (when spreader beam is off, use nominalAngleDeg; when on, upper bridle is 60 deg)
  const displayAngleDeg = useSpreaderBeam ? 60 : calc.nominalAngleDeg;
  const tanNominal = Math.tan((displayAngleDeg * Math.PI) / 180);

  // Available vertical headroom window for the sling triangle: up to 246 px
  // For 25°..60°, skidScale = 1.0 and headroomPx grows from 66 px to 246 px (hook physically hoists higher/lower).
  // For 60°..75°, headroomPx stays at 246 px and skidScale zooms smoothly so the on-screen sling angle is 100% exact!
  const maxHeadroomPx = useSpreaderBeam ? 190 : 246;
  const rawHeadroomPx = baseLugHalfSpanPx * tanNominal;
  const skidScale = rawHeadroomPx > maxHeadroomPx ? maxHeadroomPx / rawHeadroomPx : 1;
  const lugHalfSpanPx = baseLugHalfSpanPx * skidScale;
  const headroomPx = lugHalfSpanPx * tanNominal;

  // Position the vertical triangle cleanly in the canvas (y = 96..342)
  const skidLugBaseY = Math.round(292 + (headroomPx - 140) * 0.22);
  const slingTopAttachY = skidLugBaseY - headroomPx;
  const masterLinkCenterY = slingTopAttachY - 12;

  // Skid horizontal center & Hook horizontal position (strictly proportional to lugHalfSpanPx!)
  const skidCenterX = centerX - ((hookPosPct - cogOffsetPct) / 100) * lugHalfSpanPx * 0.55;
  const hookX = skidCenterX + (hookPosPct / 50) * lugHalfSpanPx;

  // Tilt angle in degrees when hook is not aligned over CoG
  const tiltDeg = calc.loadTiltDeg;
  const tiltRad = (tiltDeg * Math.PI) / 180;

  // Rotate helper from local skid coordinates (scaled by skidScale) to world SVG coordinates
  const toWorld = (localX: number, localY: number) => {
    const sx = localX * skidScale;
    const sy = localY * skidScale;
    const rx = sx * Math.cos(tiltRad) - sy * Math.sin(tiltRad);
    const ry = sx * Math.sin(tiltRad) + sy * Math.cos(tiltRad);
    return { x: skidCenterX + rx, y: skidLugBaseY + ry };
  };

  // Exact Pad-Eye Pin Hole centers on the rotated skid (local y = -4 is the pin hole center)
  const padPin1 = toWorld(-baseLugHalfSpanPx, -4);
  const padPin2 = toWorld(baseLugHalfSpanPx, -4);

  // CoG point inside the skid (local y = 36)
  const cogLocalUnscaledX = (cogOffsetPct / 100) * (baseLugHalfSpanPx * 2);
  const cogPt = toWorld(cogLocalUnscaledX, 36);

  // Non-overlapping centers for d1 and d2 dimension pills in local unscaled skid coordinates
  const rawD1CenterX = (-baseLugHalfSpanPx + cogLocalUnscaledX) / 2;
  const rawD2CenterX = (cogLocalUnscaledX + baseLugHalfSpanPx) / 2;
  const minPillHalfSep = 44 / skidScale;
  const d1PillLocalX = Math.min(rawD1CenterX, cogLocalUnscaledX - minPillHalfSep);
  const d2PillLocalX = Math.max(rawD2CenterX, cogLocalUnscaledX + minPillHalfSep);

  // Top attachment point (bottom of hook shackle bow)
  const slingTopAttach = { x: hookX, y: slingTopAttachY };

  // Spreader beam world endpoints (suspended 105 px above the skid lugs, tilting with the skid)
  const spreaderLocalY = -105 / skidScale;
  const spreaderLeftCenter = toWorld(-baseLugHalfSpanPx, spreaderLocalY);
  const spreaderRightCenter = toWorld(baseLugHalfSpanPx, spreaderLocalY);
  const spreaderMid = toWorld(0, spreaderLocalY);

  // Effective leg 1 & leg 2 colors
  const leg1Color =
    calc.util1Pct > 100
      ? '#ef4444'
      : calc.util1Pct > 85
        ? '#f59e0b'
        : wllSpec.strokeHex;
  const leg2Color =
    calc.util2Pct > 100
      ? '#ef4444'
      : calc.util2Pct > 85
        ? '#f59e0b'
        : wllSpec.strokeHex;

  const angleBadgeColor = calc.isAngleDanger
    ? '#ef4444'
    : calc.isAngleCaution
      ? '#f59e0b'
      : '#10b981';

  const statusBadge =
    calc.overallStatus === 'danger'
      ? {
          label: pick('OVERLOAD / DANGER', 'OVERLOAD / BAHAYA', '過荷重・危険領域'),
          cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
          dot: 'bg-rose-500 animate-pulse',
        }
      : calc.overallStatus === 'caution'
        ? {
            label: pick('CAUTION / OFF-PLUMB', 'WASPADA / MIRING', '注意・要確認'),
            cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
            dot: 'bg-amber-500',
          }
        : {
            label: pick('ASME B30.9 SAFE LIFT', 'AMAN ASME B30.9', 'ASME B30.9 安全揚重'),
            cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
            dot: 'bg-emerald-500',
          };

  // Helper to draw a Crosby G-209 Alloy Bow Shackle whose red screw pin is at (pinX, pinY)
  // and whose bow points in direction (dirX, dirY) (unit vector from pin toward sling)
  const renderOrientedShackle = (
    pinX: number,
    pinY: number,
    targetX: number,
    targetY: number,
    scale = 1
  ) => {
    const dx = targetX - pinX;
    const dy = targetY - pinY;
    // Standard shackle bow points along -Y (upward) when rotDeg = 0
    const rotDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const len = Math.hypot(dx, dy) || 1;
    const crownDist = 10 * scale;
    const crownX = pinX + (dx / len) * crownDist;
    const crownY = pinY + (dy / len) * crownDist;

    return {
      crownX,
      crownY,
      element: (
        <g transform={`translate(${pinX}, ${pinY}) rotate(${rotDeg}) scale(${scale})`}>
          {/* Forged alloy bow extending from (0,0) pin line to (0,-10) crown */}
          <path
            d="M -5.5 0 C -10 -12, 10 -12, 5.5 0"
            fill="none"
            stroke={palette.forgedSteel}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Shackle ears */}
          <circle cx="-5.5" cy="0" r="2.4" fill={palette.forgedSteelDark} />
          <circle cx="5.5" cy="0" r="2.4" fill={palette.forgedSteelDark} />
          {/* Crosby Red Screw Pin + Collar passing directly through (0, 0) */}
          <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#ef4444" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="-9" cy="0" r="2.4" fill="none" stroke="#dc2626" strokeWidth="1.6" />
        </g>
      ),
    };
  };

  // Helper to draw stitched EN-1492 synthetic web / wire-rope sling leg with tension force vector overlay
  const renderSlingLeg = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    isBasket: boolean,
    isChoker: boolean,
    tensionTonnes?: number
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    // Unit vector from bottom pad-eye (x2,y2) toward top hook (x1,y1) for Tension Vector Arrow
    const uxUp = -dx / len;
    const uyUp = -dy / len;
    const vecLen = tensionTonnes
      ? Math.min(len * 0.55, Math.max(28, tensionTonnes * 11))
      : 0;
    const vecEndX = x2 + uxUp * vecLen;
    const vecEndY = y2 + uyUp * vecLen;

    return (
      <g>
        {isBasket ? (
          <>
            <line
              x1={x1 + nx * 3.8}
              y1={y1 + ny * 3.8}
              x2={x2 + nx * 4.2}
              y2={y2 + ny * 4.2}
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={x1 + nx * 3.8}
              y1={y1 + ny * 3.8}
              x2={x2 + nx * 4.2}
              y2={y2 + ny * 4.2}
              stroke={isDark ? '#0f172a' : '#ffffff'}
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.65"
            />
            <line
              x1={x1 - nx * 3.8}
              y1={y1 - ny * 3.8}
              x2={x2 - nx * 4.2}
              y2={y2 - ny * 4.2}
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={x1 - nx * 3.8}
              y1={y1 - ny * 3.8}
              x2={x2 - nx * 4.2}
              y2={y2 - ny * 4.2}
              stroke={isDark ? '#0f172a' : '#ffffff'}
              strokeWidth="1.2"
              strokeDasharray="5 4"
              opacity="0.65"
            />
          </>
        ) : (
          <>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isDark ? '#020617' : '#334155'}
              strokeWidth="8.2"
              strokeLinecap="round"
            />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isDark ? '#0f172a' : '#ffffff'}
              strokeWidth="1.3"
              strokeDasharray="6 5"
              opacity="0.75"
            />
          </>
        )}

        {/* Reinforced black eye sleeves pinned at exact shackle crowns */}
        <circle cx={x1} cy={y1} r="4" fill="#1e293b" stroke={color} strokeWidth="1.8" />
        <circle cx={x2} cy={y2} r="4" fill="#1e293b" stroke={color} strokeWidth="1.8" />

        {/* Choker bight hitch loop & stress pinch indicator */}
        {isChoker && (
          <g transform={`translate(${x2}, ${y2})`}>
            <ellipse
              cx="0"
              cy="5"
              rx="9"
              ry="6"
              fill="none"
              stroke={color}
              strokeWidth="3.2"
            />
            <circle
              cx="0"
              cy="-1"
              r="4.5"
              fill="#f59e0b"
              stroke="#78350f"
              strokeWidth="1.4"
            />
          </g>
        )}

        {/* Live Tension Force Vector Arrow along the sling leg */}
        {vecLen > 0 && (
          <line
            x1={x2 + nx * 9}
            y1={y2 + ny * 9}
            x2={vecEndX + nx * 9}
            y2={vecEndY + ny * 9}
            stroke="#38bdf8"
            strokeWidth="2.2"
            markerEnd="url(#tensionVecArrow)"
            opacity="0.9"
          />
        )}
      </g>
    );
  };

  // Pin-to-pin shackle geometry for Direct Bridle vs Spreader Beam
  const topMasterShackle = renderOrientedShackle(
    hookX,
    masterLinkCenterY + 10,
    hookX,
    slingTopAttach.y + 10,
    0.95
  );

  // Pad-eye shackles oriented toward their respective upper attachment points
  const upperTarget1 = useSpreaderBeam
    ? { x: spreaderLeftCenter.x, y: spreaderLeftCenter.y + 9 }
    : { x: topMasterShackle.crownX, y: topMasterShackle.crownY };
  const upperTarget2 = useSpreaderBeam
    ? { x: spreaderRightCenter.x, y: spreaderRightCenter.y + 9 }
    : { x: topMasterShackle.crownX, y: topMasterShackle.crownY };

  const padShackle1 = renderOrientedShackle(
    padPin1.x,
    padPin1.y,
    upperTarget1.x,
    upperTarget1.y,
    0.95 * Math.max(0.8, skidScale)
  );
  const padShackle2 = renderOrientedShackle(
    padPin2.x,
    padPin2.y,
    upperTarget2.x,
    upperTarget2.y,
    0.95 * Math.max(0.8, skidScale)
  );

  // True visual sling angles at padPin1 & padPin2 (exact match to drawn sling centerline)
  const visTheta1Rad = Math.atan2(
    padShackle1.crownY - topMasterShackle.crownY,
    topMasterShackle.crownX - padShackle1.crownX
  );
  const visTheta2Rad = Math.atan2(
    padShackle2.crownY - topMasterShackle.crownY,
    padShackle2.crownX - topMasterShackle.crownX
  );

  const pinchArrowY = Math.min(padPin1.y, padPin2.y) - 32;

  return (
    <div className="glass-panel overflow-hidden rounded-[28px]">
      {/* CAD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            {pick(
              'Overhead Bridge Crane, Sling Geometry & CoG Hoisting Rig',
              'Skema Rigging Overhead Crane, Sudut Sling & Titik Berat (CoG)',
              '天井クレーン・スリング幾何・重心（CoG）揚重 CAD スキーマ'
            )}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.cls}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>
        <div className="text-xs text-[var(--md-on-surface-variant)]">
          {pick('Multiplier:', 'Faktor Sudut:', '張力係数:')}{' '}
          <span className="font-mono font-semibold text-[var(--md-on-surface)]">
            {useSpreaderBeam ? '1.000×' : `${calc.nominalLoadFactor.toFixed(3)}×`}
          </span>
          {' · '}
          {pick('Tilt:', 'Kemiringan:', '荷の傾き:')}{' '}
          <span
            className={`font-mono font-semibold ${
              calc.isTiltWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {calc.loadTiltDeg >= 0 ? `+${calc.loadTiltDeg.toFixed(1)}°` : `${calc.loadTiltDeg.toFixed(1)}°`}
          </span>
          {' · '}
          {pick('Shackle:', 'Shackle:', 'シャックル:')}{' '}
          <span className="font-mono font-semibold text-[var(--md-primary)]">
            {calc.recommendedShackle.modelCode}
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 880 515"
        className="h-auto w-full select-none"
        role="img"
        aria-label={pick(
          '2D Overhead Crane Hoist, Slings & Machinery Rigging Canvas',
          'Kanvas 2D Hoist Crane, Sling & Rigging Mesin',
          '2D 天井クレーン巻上・スリング・機器玉掛けキャンバス'
        )}
      >
        <defs>
          <pattern id="riggingCadGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={palette.grid}
              strokeWidth="0.8"
            />
          </pattern>

          <linearGradient id="craneBridgeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="55%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          <linearGradient id="steelShellGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#64748b' : '#e2e8f0'} />
            <stop offset="50%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#334155' : '#94a3b8'} />
          </linearGradient>

          <linearGradient id="motorBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#0284c7'} />
            <stop offset="100%" stopColor={isDark ? '#0369a1' : '#0369a1'} />
          </linearGradient>

          <linearGradient id="pumpVoluteGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="gearboxCastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#94a3b8'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#475569'} />
          </linearGradient>

          <pattern
            id="hazardStripes"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="16" fill="#eab308" />
            <rect x="8" width="8" height="16" fill="#1e293b" />
          </pattern>

          <marker
            id="pinchArrowR"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
          <marker
            id="pinchArrowL"
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 10 1 L 0 5 L 10 9 z" fill="#f59e0b" />
          </marker>
          <marker
            id="tensionVecArrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* CAD Blueprint Background */}
        <rect x="0" y="0" width="880" height="515" fill={palette.bg} />
        <rect x="0" y="0" width="880" height="515" fill="url(#riggingCadGrid)" opacity="0.35" />

        {/* === OVERHEAD BRIDGE CRANE GIRDER BEAM (y = 8..40) === */}
        <g transform="translate(20, 8)">
          <rect x="0" y="0" width="840" height="5" fill="#854d0e" />
          <rect x="0" y="5" width="840" height="22" fill="url(#craneBridgeGrad)" stroke="#713f12" strokeWidth="1.2" />
          <rect x="0" y="27" width="840" height="5" fill="#854d0e" />
          <rect x="4" y="6" width="44" height="20" fill="url(#hazardStripes)" stroke="#713f12" strokeWidth="1" />
          <rect x="792" y="6" width="44" height="20" fill="url(#hazardStripes)" stroke="#713f12" strokeWidth="1" />
          <text
            x="420"
            y="20"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="800"
            fill="#0f172a"
            fontFamily="var(--font-mono)"
            className="font-mono tracking-wider"
          >
            {pick(
              'DOUBLE-GIRDER BRIDGE CRANE — SWL 10.0 t (ASME B30.2 / B30.9)',
              'OVERHEAD BRIDGE CRANE — SWL 10.0 t (STANDAR ASME B30.2 / B30.9)',
              '天井走行クレーンガーダ — 定格荷重 SWL 10.0 t (ASME B30.2 / B30.9)'
            )}
          </text>
        </g>

        {/* Vertical Plumb Line from Crane Hook */}
        <line
          x1={hookX}
          y1={42}
          x2={hookX}
          y2={478}
          stroke={calc.isTiltWarning ? '#f59e0b' : '#10b981'}
          strokeWidth="1.6"
          strokeDasharray="6 4"
          opacity="0.85"
        />

        {/* Vertical CoG Reference Line */}
        <line
          x1={cogPt.x}
          y1={140}
          x2={cogPt.x}
          y2={478}
          stroke="#ec4899"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.8"
        />

        {/* === MOTORIZED HOIST TROLLEY, WIRE-ROPE SHEAVE BLOCK, SWIVEL HOOK & MASTER LINK === */}
        <g transform={`translate(${hookX}, 36)`}>
          <rect
            x="-38"
            y="-4"
            width="76"
            height="18"
            rx="4"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <circle cx="-22" cy="-4" r="5.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.4" />
          <circle cx="-22" cy="-4" r="2" fill="#eab308" />
          <circle cx="22" cy="-4" r="5.5" fill="#334155" stroke="#cbd5e1" strokeWidth="1.4" />
          <circle cx="22" cy="-4" r="2" fill="#eab308" />
          <rect x="-20" y="1" width="40" height="9" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />

          {/* Twin 4-part wire ropes descending to bottom load block */}
          {(() => {
            const blockLocalY = Math.max(22, masterLinkCenterY - 36 - 44);
            return (
              <>
                <line x1="-10" y1="14" x2="-8" y2={blockLocalY - 6} stroke={palette.forgedSteel} strokeWidth="2.1" />
                <line x1="-3.5" y1="14" x2="-2.5" y2={blockLocalY - 6} stroke={palette.forgedSteel} strokeWidth="1.7" />
                <line x1="3.5" y1="14" x2="2.5" y2={blockLocalY - 6} stroke={palette.forgedSteel} strokeWidth="1.7" />
                <line x1="10" y1="14" x2="8" y2={blockLocalY - 6} stroke={palette.forgedSteel} strokeWidth="2.1" />

                <g transform={`translate(0, ${blockLocalY})`}>
                  <rect
                    x="-16"
                    y="-8"
                    width="32"
                    height="22"
                    rx="5"
                    fill="url(#craneBridgeGrad)"
                    stroke="#713f12"
                    strokeWidth="1.5"
                  />
                  <rect x="-12" y="-5" width="24" height="7" rx="1" fill="url(#hazardStripes)" />
                  <circle cx="0" cy="7" r="3.5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.2" />
                  <rect x="-6" y="14" width="12" height="5.5" rx="1.5" fill={palette.forgedSteelDark} stroke="#1e293b" strokeWidth="1" />

                  {/* Forged Alloy Swivel Crane Hook with Spring Safety Latch */}
                  <path
                    d="M 0 19.5 L 0 26 C 12 26, 14 42, 0 42 C -9 42, -11 34, -6 28"
                    fill="none"
                    stroke={palette.forgedSteel}
                    strokeWidth="4.8"
                    strokeLinecap="round"
                  />
                  <line x1="-1" y1="23" x2="-7" y2="30" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

                  {/* Grade 100 Alloy Oblong Master Link (center at local y = 44 => world y = masterLinkCenterY) */}
                  <ellipse
                    cx="0"
                    cy="44"
                    rx="7.5"
                    ry="11"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3.5"
                  />
                </g>
              </>
            );
          })()}
        </g>

        {/* === SLINGS, CROSBY SHACKLES & OPTIONAL SPREADER BEAM (PIN-TO-PIN ZERO GAP) === */}
        {useSpreaderBeam ? (
          (() => {
            // Top & bottom shackles pinned to spreader beam flanges
            const spTopLeftPin = toWorld(-baseLugHalfSpanPx, spreaderLocalY - 9 / skidScale);
            const spTopRightPin = toWorld(baseLugHalfSpanPx, spreaderLocalY - 9 / skidScale);
            const spBotLeftPin = toWorld(-baseLugHalfSpanPx, spreaderLocalY + 9 / skidScale);
            const spBotRightPin = toWorld(baseLugHalfSpanPx, spreaderLocalY + 9 / skidScale);

            const spTopShackle1 = renderOrientedShackle(
              spTopLeftPin.x,
              spTopLeftPin.y,
              topMasterShackle.crownX,
              topMasterShackle.crownY,
              0.88
            );
            const spTopShackle2 = renderOrientedShackle(
              spTopRightPin.x,
              spTopRightPin.y,
              topMasterShackle.crownX,
              topMasterShackle.crownY,
              0.88
            );
            const spBotShackle1 = renderOrientedShackle(
              spBotLeftPin.x,
              spBotLeftPin.y,
              padShackle1.crownX,
              padShackle1.crownY,
              0.88
            );
            const spBotShackle2 = renderOrientedShackle(
              spBotRightPin.x,
              spBotRightPin.y,
              padShackle2.crownX,
              padShackle2.crownY,
              0.88
            );

            return (
              <g>
                {topMasterShackle.element}
                {/* Upper Bridle Slings from Hook Shackle Crown to Spreader Top Shackle Crowns */}
                {renderSlingLeg(
                  topMasterShackle.crownX,
                  topMasterShackle.crownY,
                  spTopShackle1.crownX,
                  spTopShackle1.crownY,
                  '#64748b',
                  false,
                  false
                )}
                {renderSlingLeg(
                  topMasterShackle.crownX,
                  topMasterShackle.crownY,
                  spTopShackle2.crownX,
                  spTopShackle2.crownY,
                  '#64748b',
                  false,
                  false
                )}
                {spTopShackle1.element}
                {spTopShackle2.element}

                {/* Rigid Structural Steel I-Beam Spreader Bar (tilts with skid) */}
                <g transform={`translate(${spreaderMid.x}, ${spreaderMid.y}) rotate(${tiltDeg})`}>
                  <rect
                    x={-lugHalfSpanPx - 16}
                    y="-9"
                    width={lugHalfSpanPx * 2 + 32}
                    height="18"
                    rx="2"
                    fill="url(#craneBridgeGrad)"
                    stroke="#713f12"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={-lugHalfSpanPx - 16}
                    y1="-9"
                    x2={lugHalfSpanPx + 16}
                    y2="-9"
                    stroke="#854d0e"
                    strokeWidth="2.8"
                  />
                  <line
                    x1={-lugHalfSpanPx - 16}
                    y1="9"
                    x2={lugHalfSpanPx + 16}
                    y2="9"
                    stroke="#854d0e"
                    strokeWidth="2.8"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="800"
                    fill="#0f172a"
                    fontFamily="var(--font-mono)"
                    className="font-mono"
                  >
                    {pick(
                      'SPREADER BEAM (θ = 90° · F_h = 0 kN)',
                      'SPREADER BEAM (θ = 90° · F_h = 0 kN)',
                      '天秤・スプレッダービーム (θ = 90° · F_h = 0 kN)'
                    )}
                  </text>
                </g>

                {spBotShackle1.element}
                {spBotShackle2.element}

                {/* Lower Vertical Slings from Spreader Bottom Shackle Crowns to Pad-Eye Shackle Crowns */}
                {renderSlingLeg(
                  spBotShackle1.crownX,
                  spBotShackle1.crownY,
                  padShackle1.crownX,
                  padShackle1.crownY,
                  leg1Color,
                  hitchType === 'basket',
                  hitchType === 'choker',
                  calc.t1Tonnes
                )}
                {renderSlingLeg(
                  spBotShackle2.crownX,
                  spBotShackle2.crownY,
                  padShackle2.crownX,
                  padShackle2.crownY,
                  leg2Color,
                  hitchType === 'basket',
                  hitchType === 'choker',
                  calc.t2Tonnes
                )}
              </g>
            );
          })()
        ) : (
          <g>
            {topMasterShackle.element}

            {/* Left & Right Sling Legs pinned directly from Top Master Shackle Crown to Pad-Eye Shackle Crowns */}
            {renderSlingLeg(
              topMasterShackle.crownX,
              topMasterShackle.crownY,
              padShackle1.crownX,
              padShackle1.crownY,
              leg1Color,
              hitchType === 'basket',
              hitchType === 'choker',
              calc.t1Tonnes
            )}
            {renderSlingLeg(
              topMasterShackle.crownX,
              topMasterShackle.crownY,
              padShackle2.crownX,
              padShackle2.crownY,
              leg2Color,
              hitchType === 'basket',
              hitchType === 'choker',
              calc.t2Tonnes
            )}

            {/* True horizontal datum ticks at Pad-Eye Shackle Crowns */}
            <line
              x1={padShackle1.crownX}
              y1={padShackle1.crownY}
              x2={padShackle1.crownX + 48}
              y2={padShackle1.crownY}
              stroke={angleBadgeColor}
              strokeWidth="1.6"
              strokeDasharray="5 3"
            />
            <line
              x1={padShackle2.crownX - 48}
              y1={padShackle2.crownY}
              x2={padShackle2.crownX}
              y2={padShackle2.crownY}
              stroke={angleBadgeColor}
              strokeWidth="1.6"
              strokeDasharray="5 3"
            />

            {/* Left Angle Arc θ1 (exact match to visual sling angle) */}
            <path
              d={`M ${padShackle1.crownX + 34} ${padShackle1.crownY} A 34 34 0 0 0 ${
                padShackle1.crownX + 34 * Math.cos(visTheta1Rad)
              } ${padShackle1.crownY - 34 * Math.sin(visTheta1Rad)}`}
              fill="none"
              stroke={angleBadgeColor}
              strokeWidth="2.4"
            />
            <g transform={`translate(${padPin1.x - 76}, ${padPin1.y - 22})`}>
              <rect
                width="64"
                height="20"
                rx="10"
                fill={palette.cardFill}
                stroke={angleBadgeColor}
                strokeWidth="1.5"
              />
              <text
                x="32"
                y="14"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="800"
                fill={palette.textPrimary}
                fontFamily="var(--font-mono)"
                className="font-mono"
              >
                θ₁={calc.theta1Deg.toFixed(0)}°
              </text>
            </g>

            {/* Right Angle Arc θ2 (exact match to visual sling angle) */}
            <path
              d={`M ${padShackle2.crownX - 34} ${padShackle2.crownY} A 34 34 0 0 1 ${
                padShackle2.crownX - 34 * Math.cos(visTheta2Rad)
              } ${padShackle2.crownY - 34 * Math.sin(visTheta2Rad)}`}
              fill="none"
              stroke={angleBadgeColor}
              strokeWidth="2.4"
            />
            <g transform={`translate(${padPin2.x + 12}, ${padPin2.y - 22})`}>
              <rect
                width="64"
                height="20"
                rx="10"
                fill={palette.cardFill}
                stroke={angleBadgeColor}
                strokeWidth="1.5"
              />
              <text
                x="32"
                y="14"
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="800"
                fill={palette.textPrimary}
                fontFamily="var(--font-mono)"
                className="font-mono"
              >
                θ₂={calc.theta2Deg.toFixed(0)}°
              </text>
            </g>

            {/* Inward Horizontal Compressive Pinch Force Arrows */}
            {lugHalfSpanPx >= 95 && (
              <g>
                <line
                  x1={padPin1.x + 36}
                  y1={pinchArrowY}
                  x2={(padPin1.x + padPin2.x) / 2 - 58}
                  y2={pinchArrowY}
                  stroke="#f59e0b"
                  strokeWidth="2.2"
                  markerEnd="url(#pinchArrowR)"
                />
                <line
                  x1={padPin2.x - 36}
                  y1={pinchArrowY}
                  x2={(padPin1.x + padPin2.x) / 2 + 58}
                  y2={pinchArrowY}
                  stroke="#f59e0b"
                  strokeWidth="2.2"
                  markerEnd="url(#pinchArrowL)"
                />
                <g transform={`translate(${(padPin1.x + padPin2.x) / 2 - 52}, ${pinchArrowY - 10})`}>
                  <rect
                    width="104"
                    height="19"
                    rx="9.5"
                    fill={palette.cardFill}
                    stroke="#f59e0b"
                    strokeWidth="1.3"
                  />
                  <text
                    x="52"
                    y="13"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="800"
                    fill="#d97706"
                    fontFamily="var(--font-mono)"
                    className="font-mono"
                  >
                    F_h = {calc.horizPinchTonnes.toFixed(2)} t
                  </text>
                </g>
              </g>
            )}
          </g>
        )}

        {/* === ROTATED & ISOTROPICALLY SCALED INDUSTRIAL MACHINERY SKID === */}
        <g
          transform={`translate(${skidCenterX}, ${skidLugBaseY}) rotate(${tiltDeg}) scale(${skidScale})`}
        >
          {/* Left Welded Lifting Pad-Eye Lug 1 (pin hole at (-baseLugHalfSpanPx, -4)) */}
          <g transform={`translate(${-baseLugHalfSpanPx}, 0)`}>
            <path
              d="M -14 14 L -9 -7 A 9 9 0 0 1 9 -7 L 14 14 Z"
              fill={palette.forgedSteelDark}
              stroke={palette.machineStroke}
              strokeWidth="1.6"
            />
            <line x1="-15" y1="14" x2="15" y2="14" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="0" cy="-4" r="3.5" fill={palette.bg} />
          </g>

          {/* Right Welded Lifting Pad-Eye Lug 2 (pin hole at (+baseLugHalfSpanPx, -4)) */}
          <g transform={`translate(${baseLugHalfSpanPx}, 0)`}>
            <path
              d="M -14 14 L -9 -7 A 9 9 0 0 1 9 -7 L 14 14 Z"
              fill={palette.forgedSteelDark}
              stroke={palette.machineStroke}
              strokeWidth="1.6"
            />
            <line x1="-15" y1="14" x2="15" y2="14" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="0" cy="-4" r="3.5" fill={palette.bg} />
          </g>

          {/* === EQUIPMENT CAD ILLUSTRATION BY PRESET === */}
          {presetId === 'heat-exchanger' ? (
            <g>
              <path d="M -126 60 L -106 60 L -100 74 L -132 74 Z" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.5" />
              <path d="M 106 60 L 126 60 L 132 74 L 100 74 Z" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.5" />

              <rect x="-106" y="-5" width="16" height="15" fill="url(#steelShellGrad)" stroke={palette.machineStroke} strokeWidth="1.5" />
              <rect x="-111" y="-8" width="26" height="4" rx="1" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.2" />
              <rect x="90" y="-5" width="16" height="15" fill="url(#steelShellGrad)" stroke={palette.machineStroke} strokeWidth="1.5" />
              <rect x="85" y="-8" width="26" height="4" rx="1" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.2" />

              <rect
                x="-144"
                y="10"
                width="288"
                height="52"
                rx="8"
                fill="url(#steelShellGrad)"
                stroke={palette.machineStroke}
                strokeWidth="2"
              />
              <path
                d="M -144 10 C -166 10, -166 62, -144 62 Z"
                fill="url(#gearboxCastGrad)"
                stroke={palette.machineStroke}
                strokeWidth="2"
              />
              <rect x="-147" y="6" width="8" height="60" rx="1.5" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.4" />
              <path
                d="M 144 10 C 164 10, 164 62, 144 62 Z"
                fill="url(#gearboxCastGrad)"
                stroke={palette.machineStroke}
                strokeWidth="2"
              />
              <rect x="139" y="6" width="8" height="60" rx="1.5" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.4" />

              <rect
                x="-116"
                y="17"
                width="232"
                height="38"
                rx="4"
                fill={isDark ? '#0f172a' : '#1e293b'}
                stroke={palette.machineStroke}
                strokeWidth="1.2"
              />
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <line
                  key={r}
                  x1="-112"
                  y1={21 + r * 6}
                  x2="112"
                  y2={21 + r * 6}
                  stroke="#f59e0b"
                  strokeWidth="2.2"
                  opacity="0.85"
                />
              ))}
              {[-76, -38, 0, 38, 76].map((bx) => (
                <line
                  key={bx}
                  x1={bx}
                  y1="17"
                  x2={bx}
                  y2="55"
                  stroke="#cbd5e1"
                  strokeWidth="2.2"
                />
              ))}
            </g>
          ) : presetId === 'gearbox-skid' ? (
            <g>
              <rect
                x="-136"
                y="-4"
                width="126"
                height="66"
                rx="6"
                fill="url(#gearboxCastGrad)"
                stroke={palette.machineStroke}
                strokeWidth="2"
              />
              <rect x="-126" y="4" width="104" height="10" rx="2" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1" />
              {[-116, -96, -76, -56, -38, -20].map((rx) => (
                <line key={rx} x1={rx} y1="16" x2={rx} y2="56" stroke={palette.machineStroke} strokeWidth="2" opacity="0.65" />
              ))}
              <circle cx="-90" cy="36" r="18" fill={palette.cardFill} stroke={palette.machineStroke} strokeWidth="2.2" />
              <circle cx="-90" cy="36" r="8" fill="#eab308" stroke="#713f12" strokeWidth="1.5" />
              <circle cx="-34" cy="38" r="11" fill={palette.cardFill} stroke={palette.machineStroke} strokeWidth="1.8" />
              <circle cx="-34" cy="38" r="4.5" fill="#38bdf8" />
              <rect x="-60" y="26" width="8" height="22" rx="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="-59" y="35" width="6" height="12" rx="2" fill="#eab308" />

              <line x1="-10" y1="38" x2="22" y2="38" stroke={palette.forgedSteel} strokeWidth="6" />
              <rect x="-6" y="27" width="26" height="22" rx="3" fill="url(#craneBridgeGrad)" stroke="#713f12" strokeWidth="1.5" />

              <rect
                x="18"
                y="10"
                width="110"
                height="52"
                rx="7"
                fill="url(#motorBodyGrad)"
                stroke="#0284c7"
                strokeWidth="1.8"
              />
              <path d="M 114 10 L 128 14 L 128 58 L 114 62 Z" fill="#0369a1" stroke="#0284c7" strokeWidth="1.5" />
              {[18, 25, 32, 39, 46, 53].map((fy) => (
                <line key={fy} x1="26" y1={fy} x2="108" y2={fy} stroke="#bae6fd" strokeWidth="1.6" opacity="0.7" />
              ))}
              <rect x="52" y="-2" width="26" height="14" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.4" />
            </g>
          ) : (
            <g>
              <g transform="translate(-88, 34)">
                <path d="M -22 16 L 22 16 L 28 28 L -28 28 Z" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.5" />
                <rect x="4" y="-38" width="20" height="22" fill="url(#pumpVoluteGrad)" stroke="#0369a1" strokeWidth="1.6" />
                <rect x="-1" y="-42" width="30" height="5" rx="1" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.2" />
                <rect x="-46" y="-10" width="20" height="20" fill="url(#pumpVoluteGrad)" stroke="#0369a1" strokeWidth="1.6" />
                <rect x="-50" y="-15" width="5" height="30" rx="1" fill={palette.forgedSteelDark} stroke={palette.machineStroke} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="26" fill="url(#pumpVoluteGrad)" stroke="#0284c7" strokeWidth="2" />
                <circle cx="0" cy="0" r="17" fill={isDark ? '#0f172a' : '#e0f2fe'} stroke="#38bdf8" strokeWidth="1.5" />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <path
                    key={deg}
                    d="M 0 0 Q 8 -4 14 -9"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="4.5" fill="#eab308" />
                <rect x="24" y="-9" width="28" height="18" rx="2" fill={palette.machineCasing} stroke={palette.machineStroke} strokeWidth="1.5" />
              </g>

              <rect x="-36" y="24" width="28" height="20" rx="3" fill="url(#craneBridgeGrad)" stroke="#713f12" strokeWidth="1.5" />

              <rect
                x="-4"
                y="8"
                width="132"
                height="54"
                rx="8"
                fill="url(#motorBodyGrad)"
                stroke="#0284c7"
                strokeWidth="1.8"
              />
              <path d="M 112 8 L 128 13 L 128 57 L 112 62 Z" fill="#0369a1" stroke="#0284c7" strokeWidth="1.5" />
              {[16, 23, 30, 37, 44, 51].map((fy) => (
                <line key={fy} x1="6" y1={fy} x2="106" y2={fy} stroke="#bae6fd" strokeWidth="1.8" opacity="0.75" />
              ))}
              <rect x="40" y="-4" width="26" height="14" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.4" />
              <rect x="10" y="60" width="22" height="4" fill={palette.forgedSteelDark} />
              <rect x="82" y="60" width="22" height="4" fill={palette.forgedSteelDark} />
            </g>
          )}

          {/* === WELDED STRUCTURAL I-BEAM SKID BASEFRAME & VERTICAL LIFTING STANCHIONS === */}
          {/* Left & Right structural cheek plates tying Pad-Eyes at y=0 directly into the I-beam at y=62 */}
          <rect
            x={-baseLugHalfSpanPx - 8}
            y="12"
            width="16"
            height="50"
            fill={palette.forgedSteelDark}
            stroke={palette.machineStroke}
            strokeWidth="1.2"
          />
          <rect
            x={baseLugHalfSpanPx - 8}
            y="12"
            width="16"
            height="50"
            fill={palette.forgedSteelDark}
            stroke={palette.machineStroke}
            strokeWidth="1.2"
          />

          <g transform="translate(0, 62)">
            <rect x="-166" y="0" width="332" height="4" fill={palette.skidBeamFlange} />
            <rect
              x="-164"
              y="4"
              width="328"
              height="18"
              fill={palette.skidBeamFill}
              stroke={palette.machineStroke}
              strokeWidth="1.4"
            />
            <rect x="-166" y="22" width="332" height="4" fill={palette.skidBeamFlange} />
            {/* Forklift pockets */}
            <rect x="-132" y="7" width="32" height="12" rx="2" fill={palette.bg} stroke={palette.machineStroke} strokeWidth="1.2" />
            <rect x="100" y="7" width="32" height="12" rx="2" fill={palette.bg} stroke={palette.machineStroke} strokeWidth="1.2" />

            {/* Precision Spirit Bubble Level Mounted at Skid Midpoint */}
            <rect
              x="-38"
              y="6"
              width="76"
              height="14"
              rx="7"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="1.4"
            />
            <circle
              cx={Math.max(-25, Math.min(25, tiltDeg * 1.9))}
              cy="13"
              r="4.5"
              fill={calc.isTiltWarning ? '#f59e0b' : '#10b981'}
            />
            <line x1="-5" y1="6" x2="-5" y2="20" stroke="#e2e8f0" strokeWidth="1.2" />
            <line x1="5" y1="6" x2="5" y2="20" stroke="#e2e8f0" strokeWidth="1.2" />
          </g>

          {/* Center of Gravity (CoG) Target Symbol ⊕ & Crisp Non-Overlapping Pill */}
          <g transform={`translate(${cogLocalUnscaledX}, 36)`}>
            <line x1="0" y1="12" x2="0" y2="42" stroke="#ec4899" strokeWidth="2.6" />
            <polygon points="0,48 -4.5,39 4.5,39" fill="#ec4899" />
            <circle cx="0" cy="0" r="11.5" fill="#ffffff" stroke="#ec4899" strokeWidth="2.2" />
            <path d="M 0 0 L 11.5 0 A 11.5 11.5 0 0 1 0 11.5 Z" fill="#ec4899" />
            <path d="M 0 0 L -11.5 0 A 11.5 11.5 0 0 1 0 -11.5 Z" fill="#ec4899" />
            <rect
              x="-44"
              y="-30"
              width="88"
              height="16"
              rx="8"
              fill="#ec4899"
            />
            <text
              x="0"
              y="-19"
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="800"
              fill="#ffffff"
              fontFamily="var(--font-mono)"
              className="font-mono"
            >
              CoG {calc.massTonnes.toFixed(1)} t
            </text>
          </g>

          {/* Dimension Line d1 & d2 with Clamped Non-Overlapping Background Pills */}
          <g transform="translate(0, 102)">
            <line x1={-baseLugHalfSpanPx} y1="0" x2={cogLocalUnscaledX} y2="0" stroke="#0ea5e9" strokeWidth="1.8" />
            <line x1={cogLocalUnscaledX} y1="0" x2={baseLugHalfSpanPx} y2="0" stroke="#a855f7" strokeWidth="1.8" />
            <line x1={-baseLugHalfSpanPx} y1="-5" x2={-baseLugHalfSpanPx} y2="5" stroke="#0ea5e9" strokeWidth="2" />
            <line x1={cogLocalUnscaledX} y1="-6" x2={cogLocalUnscaledX} y2="6" stroke="#ec4899" strokeWidth="2.2" />
            <line x1={baseLugHalfSpanPx} y1="-5" x2={baseLugHalfSpanPx} y2="5" stroke="#a855f7" strokeWidth="2" />

            <g transform={`translate(${d1PillLocalX}, 0) scale(${1 / skidScale})`}>
              <rect
                x="-39"
                y="-9"
                width="78"
                height="18"
                rx="9"
                fill={palette.cardFill}
                stroke="#0ea5e9"
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="800"
                fill={isDark ? '#38bdf8' : '#0284c7'}
                fontFamily="var(--font-mono)"
                className="font-mono"
              >
                d₁={calc.d1M.toFixed(2)}m
              </text>
            </g>

            <g transform={`translate(${d2PillLocalX}, 0) scale(${1 / skidScale})`}>
              <rect
                x="-39"
                y="-9"
                width="78"
                height="18"
                rx="9"
                fill={palette.cardFill}
                stroke="#a855f7"
                strokeWidth="1.2"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="800"
                fill={isDark ? '#c084fc' : '#7e22ce'}
                fontFamily="var(--font-mono)"
                className="font-mono"
              >
                d₂={calc.d2M.toFixed(2)}m
              </text>
            </g>
          </g>
        </g>

        {/* Render Pad-Eye Crosby Shackles on top so red screw pins visibly lock through Pad-Eyes & Sling Eyes */}
        {padShackle1.element}
        {padShackle2.element}

        {/* === FIXED LEFT & RIGHT HUD TELEMETRY COLUMNS (100% COLLISION-FREE) === */}
        {/* Left HUD Card: Leg 1 Tension T1 (x = 20..226, y = 52..144) */}
        <g transform="translate(20, 52)">
          <rect
            width="206"
            height="92"
            rx="14"
            fill={palette.cardFill}
            stroke={leg1Color}
            strokeWidth="2"
          />
          <text
            x="12"
            y="20"
            fontSize="10"
            fontWeight="800"
            fill={palette.textMuted}
            fontFamily="var(--font-mono)"
            className="font-mono uppercase"
          >
            {pick('LEG 1 (LEFT) TENSION T₁', 'TEGANGAN KAKI 1 (KIRI) T₁', '左スリング脚1 張力 T₁')}
          </text>
          <text
            x="12"
            y="43"
            fontSize="17"
            fontWeight="800"
            fill={palette.textPrimary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {calc.t1Tonnes.toFixed(2)} t{' '}
            <tspan fontSize="12" fontWeight="600" fill={palette.textMuted}>
              ({calc.t1Kn.toFixed(1)} kN)
            </tspan>
          </text>
          <text
            x="12"
            y="60"
            fontSize="10"
            fontWeight="600"
            fill={palette.textSecondary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {pick('Vert Share', 'Beban Vert', '垂直分担')} V₁={calc.v1Tonnes.toFixed(2)}t · L₁=
            {calc.length1M.toFixed(2)}m
          </text>
          <rect
            x="12"
            y="70"
            width="140"
            height="10"
            rx="5"
            fill="var(--md-surface-container-highest)"
          />
          <rect
            x="12"
            y="70"
            width={Math.min(140, (calc.util1Pct / 100) * 140)}
            height="10"
            rx="5"
            fill={leg1Color}
          />
          <text
            x="160"
            y="79"
            fontSize="10.5"
            fontWeight="800"
            fill={palette.textPrimary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {calc.util1Pct.toFixed(0)}%
          </text>
        </g>

        {/* Left Secondary Pill: Sling Angle Multiplier (x = 20..226, y = 152..180) */}
        <g transform="translate(20, 152)">
          <rect
            width="206"
            height="28"
            rx="14"
            fill={palette.cardFill}
            stroke={angleBadgeColor}
            strokeWidth="1.6"
          />
          <text
            x="103"
            y="18"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="800"
            fill={palette.textPrimary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            1/sin({useSpreaderBeam ? '90' : calc.nominalAngleDeg}°) ={' '}
            {useSpreaderBeam ? '1.000' : calc.nominalLoadFactor.toFixed(3)}×
          </text>
        </g>

        {/* Right HUD Card: Leg 2 Tension T2 (x = 654..860, y = 52..144) */}
        <g transform="translate(654, 52)">
          <rect
            width="206"
            height="92"
            rx="14"
            fill={palette.cardFill}
            stroke={leg2Color}
            strokeWidth="2"
          />
          <text
            x="12"
            y="20"
            fontSize="10"
            fontWeight="800"
            fill={palette.textMuted}
            fontFamily="var(--font-mono)"
            className="font-mono uppercase"
          >
            {pick('LEG 2 (RIGHT) TENSION T₂', 'TEGANGAN KAKI 2 (KANAN) T₂', '右スリング脚2 張力 T₂')}
          </text>
          <text
            x="12"
            y="43"
            fontSize="17"
            fontWeight="800"
            fill={palette.textPrimary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {calc.t2Tonnes.toFixed(2)} t{' '}
            <tspan fontSize="12" fontWeight="600" fill={palette.textMuted}>
              ({calc.t2Kn.toFixed(1)} kN)
            </tspan>
          </text>
          <text
            x="12"
            y="60"
            fontSize="10"
            fontWeight="600"
            fill={palette.textSecondary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {pick('Vert Share', 'Beban Vert', '垂直分担')} V₂={calc.v2Tonnes.toFixed(2)}t · L₂=
            {calc.length2M.toFixed(2)}m
          </text>
          <rect
            x="12"
            y="70"
            width="140"
            height="10"
            rx="5"
            fill="var(--md-surface-container-highest)"
          />
          <rect
            x="12"
            y="70"
            width={Math.min(140, (calc.util2Pct / 100) * 140)}
            height="10"
            rx="5"
            fill={leg2Color}
          />
          <text
            x="160"
            y="79"
            fontSize="10.5"
            fontWeight="800"
            fill={palette.textPrimary}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {calc.util2Pct.toFixed(0)}%
          </text>
        </g>

        {/* Right Secondary Pill: Hook Plumb vs CoG Alignment (x = 654..860, y = 152..180) */}
        <g transform="translate(654, 152)">
          <rect
            width="206"
            height="28"
            rx="14"
            fill={palette.cardFill}
            stroke={calc.isTiltWarning ? '#f59e0b' : '#10b981'}
            strokeWidth="1.6"
          />
          <text
            x="103"
            y="18"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill={calc.isTiltWarning ? '#d97706' : '#059669'}
            fontFamily="var(--font-mono)"
            className="font-mono"
          >
            {Math.abs(calc.hookMisalignmentM) < 0.02
              ? pick('HOOK PLUMB OVER CoG', 'HOOK TEGAK LURUS CoG', 'フック鉛直芯出し済')
              : pick(
                  `HOOK Δx = ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m`,
                  `HOOK Δx = ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m`,
                  `フック偏心 Δx = ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m`
                )}
          </text>
        </g>

        {/* === SHOP FLOOR DATUM BAR (y = 480..506, 3 non-overlapping columns) === */}
        <g transform="translate(20, 480)">
          <rect width="840" height="26" rx="10" fill={palette.floorFill} stroke={palette.floorStroke} strokeWidth="1.2" />
          <line x1="0" y1="0" x2="840" y2="0" stroke="#10b981" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.6" />
          <text x="14" y="17" fontSize="10" fontWeight="700" fill={palette.textSecondary} fontFamily="var(--font-mono)" className="font-mono">
            {pick('EL. +0.000 m (SHOP FLOOR)', 'EL. +0.000 m (LANTAI)', '基準床面 EL. +0.000 m')}
          </text>
          <text x="420" y="17" textAnchor="middle" fontSize="10" fontWeight="700" fill={palette.textSecondary} fontFamily="var(--font-mono)" className="font-mono">
            {pick('Tilt:', 'Miring:', '傾き角:')}{' '}
            <tspan fill={calc.isTiltWarning ? '#f59e0b' : '#10b981'}>
              {calc.loadTiltDeg >= 0 ? `+${calc.loadTiltDeg.toFixed(1)}°` : `${calc.loadTiltDeg.toFixed(1)}°`}{' '}
              ({Math.abs(calc.loadTiltDeg) <= 0.5
                ? pick('LEVEL', 'RATA', '水平')
                : pick('OFF-PLUMB!', 'MIRING!', '傾斜注意！')})
            </tspan>
          </text>
          <text x="826" y="17" textAnchor="end" fontSize="10" fontWeight="700" fill={palette.textSecondary} fontFamily="var(--font-mono)" className="font-mono">
            {pick('Shackle:', 'Shackle:', 'シャックル:')}{' '}
            <tspan fill="var(--md-primary)">
              {calc.recommendedShackle.modelCode} (WLL {calc.recommendedShackle.wllTonnes} t)
            </tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}
