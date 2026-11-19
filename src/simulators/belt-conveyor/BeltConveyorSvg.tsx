import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type {
  ConveyorTrackingInputs,
  ConveyorTrackingMetrics,
} from './beltConveyorMath';

interface BeltConveyorSvgProps {
  inputs: ConveyorTrackingInputs;
  metrics: ConveyorTrackingMetrics;
  phaseOffset: number; // 0..1 animation phase
}

export function BeltConveyorSvg({
  inputs,
  metrics,
  phaseOffset,
}: BeltConveyorSvgProps) {
  const { pick } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-aware CAD engineering palette harmonized with Material 3 Expressive tokens
  const bgFill = 'var(--md-surface-container-lowest)';
  const gridStroke = isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.05)';
  const panelFill = 'var(--md-surface-container)';
  const panelStroke = 'var(--md-outline-variant)';
  const textPrimary = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';
  const steelFrameFill = isDark ? '#334155' : '#cbd5e1';
  const steelFrameStroke = '#64748b';

  // Top-Down Plan View coordinates (viewBox 780 x 390)
  const centerY = 120;
  const frameHalfWidthPx = 62; // C-channel inner edges at centerY ± 62 (y=58 and y=182)
  const beltHalfWidthPx = 40; // Belt width = 80 px; safe clearance = 22 px (±25 mm)

  // Scale lateralWanderMm (-42..+42 mm) to pixels
  const beltShiftPx = (metrics.lateralWanderMm / 25) * 22;
  const beltCenterY = centerY + beltShiftPx;

  // Tail pulley left/right screw visual positions
  const tailBaseX = 144;
  const leftTailX = tailBaseX - (inputs.leftTakeUpMm - 25) * 0.55;
  const rightTailX = tailBaseX - (inputs.rightTakeUpMm - 25) * 0.55;
  const tailMidX = (leftTailX + rightTailX) / 2;
  const tailTiltDeg =
    (Math.atan2(104, rightTailX - leftTailX) * 180) / Math.PI - 90;

  // Head pulley skew
  const headCenterX = 576;
  const headSkewDeg = inputs.headPulleyMisalignDeg * 3.5;

  // Chute offset visual shift
  const chuteCenterY = centerY + (inputs.chuteOffsetMm / 60) * 24;

  // Self-aligning training idler at x=370
  const trainerX = 370;
  const trainerSkewVisualDeg = inputs.trainingIdlerSkewDeg * 3.8;

  // Animated belt chevrons
  const numChevrons = 11;
  const chevrons: number[] = [];
  for (let i = 0; i < numChevrons; i++) {
    const frac = (i + phaseOffset) / numChevrons;
    chevrons.push(tailMidX + 18 + frac * (headCenterX - tailMidX - 32));
  }

  // Troughing cross-section coordinates (bottom-right inset)
  const csCenterX = 626;
  const csBaseY = 320;

  const beltBorderColor = metrics.isFrameRubbing
    ? '#f43f5e'
    : metrics.trackingStatus === 'drifting'
      ? '#f59e0b'
      : '#10b981';

  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-lowest)]">
      {/* Clean CAD Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            {pick(
              'Belt Conveyor Tracking & Take-Up Tension Schematic',
              'Skema Pelacakan Sabuk Konveyor & Tegangan Take-Up',
              'ベルトコンベヤ蛇行調整＆テイクアップ張力機構図'
            )}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--md-on-secondary-container)]">
            v = {inputs.beltSpeedMs.toFixed(1)} m/s · L/R:{' '}
            {inputs.leftTakeUpMm}/{inputs.rightTakeUpMm} mm
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 font-bold ${
              metrics.isFrameRubbing
                ? 'animate-pulse bg-rose-100 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300'
                : metrics.trackingStatus === 'drifting'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                metrics.isFrameRubbing
                  ? 'bg-rose-500'
                  : metrics.trackingStatus === 'drifting'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              }`}
            />
            {metrics.isFrameRubbing
              ? pick(
                  `ALARM: FRAME RUBBING (${metrics.rubbingSide.toUpperCase()} ${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm)`,
                  `ALARM: GESEKAN RANGKA (${metrics.rubbingSide === 'right' ? 'KANAN' : 'KIRI'} ${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm)`,
                  `警報: フレーム接触摩耗 (${metrics.rubbingSide === 'right' ? '右側' : '左側'} ${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm)`
                )
              : metrics.trackingStatus === 'drifting'
                ? pick(
                    `CAUTION: Wander ${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm`,
                    `PERHATIAN: Geser ${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm`,
                    `注意: 蛇行 ${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm`
                  )
                : pick(
                    `CENTERED (${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm)`,
                    `SENTRIS (${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm)`,
                    `中央安定 (${metrics.lateralWanderMm > 0 ? '+' : ''}${metrics.lateralWanderMm.toFixed(1)} mm)`
                  )}
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 780 390"
        className="h-auto w-full select-none"
        role="img"
        aria-label="2D Top-Down and Side Conveyor Belt Tracking CAD Canvas"
      >
        <defs>
          <pattern
            id="convCadGrid"
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

          <linearGradient id="rubberBeltGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#1e293b' : '#334155'} />
            <stop offset="50%" stopColor={isDark ? '#334155' : '#475569'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#334155'} />
          </linearGradient>

          <linearGradient id="pulleyDrumGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Theme-aware Blueprint Background */}
        <rect width="780" height="390" fill={bgFill} />
        <rect
          width="780"
          height="390"
          fill="url(#convCadGrid)"
          opacity="0.65"
        />

        {/* ==================== 1. TOP-DOWN PLAN VIEW ==================== */}
        <text x="16" y="18" fill={textMuted} fontSize="10" fontWeight="700" fontFamily="var(--font-sans)">
          {pick(
            'TOP-DOWN PLAN VIEW — Structural C-Channel Frame & Take-Up Alignment',
            'TAMPAK ATAS — Rangka Kanal-C & Penyetelan Take-Up',
            '上面図 — チャンネル鋼フレーム＆テイクアップ調整機構'
          )}
        </text>

        {/* Left & Right Rail Callout Pills — Positioned at x=256 */}
        <g>
          <rect
            x="202"
            y={centerY - frameHalfWidthPx - 24}
            width="108"
            height="16"
            rx="8"
            fill={panelFill}
            stroke={
              metrics.rubbingSide === 'left' ? '#f43f5e' : panelStroke
            }
            strokeWidth="1"
          />
          <text
            x="256"
            y={centerY - frameHalfWidthPx - 13}
            textAnchor="middle"
            fill={
              metrics.rubbingSide === 'left'
                ? isDark
                  ? '#fda4af'
                  : '#be123c'
                : textMuted
            }
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('LEFT RAIL (−mm)', 'REL KIRI (−mm)', '左レール (−mm)')}
          </text>

          <rect
            x="202"
            y={centerY + frameHalfWidthPx + 9}
            width="108"
            height="16"
            rx="8"
            fill={panelFill}
            stroke={
              metrics.rubbingSide === 'right' ? '#f43f5e' : panelStroke
            }
            strokeWidth="1"
          />
          <text
            x="256"
            y={centerY + frameHalfWidthPx + 20}
            textAnchor="middle"
            fill={
              metrics.rubbingSide === 'right'
                ? isDark
                  ? '#fda4af'
                  : '#be123c'
                : textMuted
            }
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('RIGHT RAIL (+mm)', 'REL KANAN (+mm)', '右レール (+mm)')}
          </text>
        </g>

        {/* Structural Diagonal Cross-Bracing Beneath Conveyor Frame */}
        {[155, 265, 375, 485].map((bx) => (
          <g key={`brace-${bx}`} opacity="0.45">
            <line
              x1={bx}
              y1={centerY - frameHalfWidthPx}
              x2={bx + 85}
              y2={centerY + frameHalfWidthPx}
              stroke={steelFrameStroke}
              strokeWidth="1.4"
            />
            <line
              x1={bx + 85}
              y1={centerY - frameHalfWidthPx}
              x2={bx}
              y2={centerY + frameHalfWidthPx}
              stroke={steelFrameStroke}
              strokeWidth="1.4"
            />
          </g>
        ))}

        {/* Structural Steel C-Channel Side Stringers (Left & Right) */}
        <rect
          x="90"
          y={centerY - frameHalfWidthPx - 6}
          width="528"
          height="6"
          rx="1.5"
          fill={
            metrics.rubbingSide === 'left' ? '#f43f5e' : steelFrameFill
          }
          stroke={
            metrics.rubbingSide === 'left' ? '#be123c' : steelFrameStroke
          }
          strokeWidth="1.2"
        />
        <rect
          x="90"
          y={centerY + frameHalfWidthPx}
          width="528"
          height="6"
          rx="1.5"
          fill={
            metrics.rubbingSide === 'right' ? '#f43f5e' : steelFrameFill
          }
          stroke={
            metrics.rubbingSide === 'right' ? '#be123c' : steelFrameStroke
          }
          strokeWidth="1.2"
        />

        {/* Conveyor Centerline Datum */}
        <line
          x1="82"
          y1={centerY}
          x2="632"
          y2={centerY}
          stroke={isDark ? '#475569' : '#94a3b8'}
          strokeWidth="1"
          strokeDasharray="6 4"
        />

        {/* Fixed 3-Roll Carrying Idler Stations */}
        {[242, 306, 435, 502].map((ix) => (
          <g key={`idler-${ix}`}>
            <line
              x1={ix}
              y1={centerY - frameHalfWidthPx}
              x2={ix}
              y2={centerY + frameHalfWidthPx}
              stroke={steelFrameStroke}
              strokeWidth="2.4"
            />
            <rect
              x={ix - 4}
              y={centerY - 53}
              width="8"
              height="28"
              rx="2"
              fill={isDark ? '#64748b' : '#94a3b8'}
              stroke={isDark ? '#1e293b' : '#475569'}
              strokeWidth="1"
            />
            <rect
              x={ix - 4}
              y={centerY - 20}
              width="8"
              height="40"
              rx="2"
              fill={isDark ? '#64748b' : '#94a3b8'}
              stroke={isDark ? '#1e293b' : '#475569'}
              strokeWidth="1"
            />
            <rect
              x={ix - 4}
              y={centerY + 25}
              width="8"
              height="28"
              rx="2"
              fill={isDark ? '#64748b' : '#94a3b8'}
              stroke={isDark ? '#1e293b' : '#475569'}
              strokeWidth="1"
            />
          </g>
        ))}

        {/* ==================== TAIL PULLEY & SCREW TAKE-UP ASSEMBLY ==================== */}
        <g>
          {/* Left Take-Up Screw Badge */}
          <rect
            x="22"
            y={centerY - 60}
            width="62"
            height="17"
            rx="8.5"
            fill={panelFill}
            stroke="var(--md-primary)"
            strokeWidth="1.2"
          />
          <text
            x="53"
            y={centerY - 48.5}
            textAnchor="middle"
            fill="var(--md-primary)"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            L: {inputs.leftTakeUpMm} mm
          </text>
          <line
            x1="84"
            y1={centerY - 51.5}
            x2={leftTailX}
            y2={centerY - 51.5}
            stroke="#0284c7"
            strokeWidth="3.8"
            strokeDasharray="2.5 1.5"
          />
          <rect
            x={leftTailX - 7}
            y={centerY - 58}
            width="14"
            height="13"
            rx="2.5"
            fill="#0284c7"
            stroke={isDark ? '#e0f2fe' : '#0f172a'}
            strokeWidth="1.2"
          />

          {/* Right Take-Up Screw Badge */}
          <rect
            x="22"
            y={centerY + 43}
            width="62"
            height="17"
            rx="8.5"
            fill={panelFill}
            stroke="var(--md-primary)"
            strokeWidth="1.2"
          />
          <text
            x="53"
            y={centerY + 54.5}
            textAnchor="middle"
            fill="var(--md-primary)"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            R: {inputs.rightTakeUpMm} mm
          </text>
          <line
            x1="84"
            y1={centerY + 51.5}
            x2={rightTailX}
            y2={centerY + 51.5}
            stroke="#0284c7"
            strokeWidth="3.8"
            strokeDasharray="2.5 1.5"
          />
          <rect
            x={rightTailX - 7}
            y={centerY + 45}
            width="14"
            height="13"
            rx="2.5"
            fill="#0284c7"
            stroke={isDark ? '#e0f2fe' : '#0f172a'}
            strokeWidth="1.2"
          />

          {/* Crowned Steel Tail Pulley Drum */}
          <g
            transform={`translate(${tailMidX.toFixed(1)}, ${centerY}) rotate(${tailTiltDeg.toFixed(2)})`}
          >
            {/* Tail pulley vertical shaft journals */}
            <line
              x1="0"
              y1="-54"
              x2="0"
              y2="54"
              stroke={steelFrameStroke}
              strokeWidth="4.5"
            />
            <rect
              x="-9"
              y="-46"
              width="18"
              height="92"
              rx="3"
              fill="url(#pulleyDrumGrad)"
              stroke={isDark ? '#fde68a' : '#78350f'}
              strokeWidth="1.4"
            />
          </g>

          {/* Tail Pulley Top Callout Pill */}
          <rect
            x={tailMidX - 46}
            y="32"
            width="92"
            height="17"
            rx="8.5"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
          />
          <text
            x={tailMidX}
            y="43.5"
            textAnchor="middle"
            fill={textPrimary}
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('TAIL PULLEY', 'PULI EKOR', 'テールプーリ')}
          </text>
        </g>

        {/* ==================== HEAD DRIVE PULLEY & COAXIAL SHAFT-MOUNTED GEARMOTOR ==================== */}
        <g>
          {/* Head Discharge Hood & Material Exit Stream (to the right of Head Pulley drum) */}
          <path
            d={`M ${headCenterX + 10} ${centerY - 28} L 638 ${centerY - 22} L 638 ${centerY + 22} L ${headCenterX + 10} ${centerY + 28} Z`}
            fill={isDark ? 'rgba(30,41,59,0.75)' : 'rgba(226,232,240,0.85)'}
            stroke={panelStroke}
            strokeWidth="1.3"
            strokeDasharray="3 2"
          />
          <text
            x="662"
            y={centerY + 3}
            fill={textMuted}
            fontSize="8.5"
            fontWeight="700"
          >
            {pick('DISCHARGE →', 'CURAHAN →', '排出部 →')}
          </text>

          {/* Head Pulley Drum, Pillow-Block Bearings & Coaxial Vertical Drive Shaft Assembly */}
          <g
            transform={`translate(${headCenterX}, ${centerY}) rotate(${headSkewDeg.toFixed(2)})`}
          >
            {/* Full-length alloy steel Head Pulley Shaft running vertically through both pillow-block bearings and into the external gearbox */}
            <line
              x1="0"
              y1="-58"
              x2="0"
              y2="82"
              stroke={isDark ? '#94a3b8' : '#475569'}
              strokeWidth="5.5"
              strokeLinecap="round"
            />

            {/* Top Pillow-Block Bearing (mounted on Left C-Channel Rail) */}
            <rect
              x="-8"
              y="-58"
              width="16"
              height="11"
              rx="2"
              fill={steelFrameFill}
              stroke={steelFrameStroke}
              strokeWidth="1.2"
            />
            {/* Bottom Pillow-Block Bearing (mounted on Right C-Channel Rail) */}
            <rect
              x="-8"
              y="47"
              width="16"
              height="11"
              rx="2"
              fill={steelFrameFill}
              stroke={steelFrameStroke}
              strokeWidth="1.2"
            />

            {/* Diamond-lagged Head Drive Drum */}
            <rect
              x="-11"
              y="-46"
              width="22"
              height="92"
              rx="3"
              fill="url(#pulleyDrumGrad)"
              stroke={isDark ? '#fde68a' : '#78350f'}
              strokeWidth="1.5"
            />
            {[-32, -16, 0, 16, 32].map((ly) => (
              <path
                key={ly}
                d={`M -9 ${ly - 6} L 9 ${ly + 6} M 9 ${ly - 6} L -9 ${ly + 6}`}
                stroke="#78350f"
                strokeWidth="1"
                opacity="0.65"
              />
            ))}

            {/* Torque-Arm Reaction Bracket Bolted to C-Channel Stringer Rail */}
            <line
              x1="-22"
              y1="62"
              x2="-11"
              y2="74"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <circle cx="-22" cy="62" r="2.5" fill="#f59e0b" />

            {/* Coaxial Shaft-Mounted Bevel-Helical Gearbox (Mounted on Head Pulley Shaft Extension y = +64..+88 outside the frame!) */}
            <rect
              x="-12"
              y="64"
              width="26"
              height="24"
              rx="3"
              fill={isDark ? '#334155' : '#94a3b8'}
              stroke={isDark ? '#cbd5e1' : '#334155'}
              strokeWidth="1.4"
            />
            {/* Hollow-shaft shrink-disc collar on end of Head Pulley shaft */}
            <rect
              x="-5"
              y="88"
              width="10"
              height="4"
              rx="1"
              fill="#0284c7"
            />

            {/* Right-Angle Coupled Finned TEFC Electric Drive Motor (Parallel to frame outside Right C-Channel Rail) */}
            <rect
              x="14"
              y="62"
              width="48"
              height="28"
              rx="4.5"
              fill={isDark ? '#1e293b' : '#cbd5e1'}
              stroke="#f59e0b"
              strokeWidth="1.5"
            />
            {/* Motor fan cowl on right end */}
            <path
              d="M 54 62 L 62 65 L 62 87 L 54 90 Z"
              fill={isDark ? '#334155' : '#94a3b8'}
              stroke="#f59e0b"
              strokeWidth="1"
            />
            {/* Cooling fins along TEFC motor body */}
            {[67, 72, 77, 82].map((fy) => (
              <line
                key={fy}
                x1="18"
                y1={fy}
                x2="51"
                y2={fy}
                stroke="#64748b"
                strokeWidth="1.1"
              />
            ))}
          </g>

          {/* Drive Motor Callout Pill (Positioned cleanly next to the external gearmotor at x=646..748, y=188..205) */}
          <rect
            x="646"
            y={centerY + 67}
            width="96"
            height="17"
            rx="8.5"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
          />
          <text
            x="694"
            y={centerY + 78.5}
            textAnchor="middle"
            fill={textPrimary}
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('DRIVE MOTOR', 'MOTOR PENGGERAK', '駆動ギアモータ')}
          </text>

          {/* Head Pulley Top Callout Pill */}
          <rect
            x={headCenterX - 50}
            y="32"
            width="100"
            height="17"
            rx="8.5"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="1"
          />
          <text
            x={headCenterX}
            y="43.5"
            textAnchor="middle"
            fill={textPrimary}
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('HEAD PULLEY', 'PULI KEPALA', 'ヘッドプーリ')}
          </text>
        </g>

        {/* ==================== TEXTURED CONVEYOR BELT & MATERIAL STREAM ==================== */}
        <g>
          <rect
            x={tailMidX}
            y={beltCenterY - beltHalfWidthPx}
            width={headCenterX - tailMidX}
            height={beltHalfWidthPx * 2}
            rx="4"
            fill="url(#rubberBeltGrad)"
            stroke={beltBorderColor}
            strokeWidth="2.5"
          />

          <line
            x1={tailMidX + 8}
            y1={beltCenterY}
            x2={headCenterX - 8}
            y2={beltCenterY}
            stroke={beltBorderColor}
            strokeWidth="1.3"
            strokeDasharray="5 3"
          />

          {chevrons.map((cx, idx) => (
            <path
              key={idx}
              d={`M ${cx - 10} ${beltCenterY - 26} L ${cx + 6} ${beltCenterY} L ${cx - 10} ${beltCenterY + 26}`}
              fill="none"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          <path
            d={`M 192 ${chuteCenterY} Q 350 ${(chuteCenterY + beltCenterY) / 2} ${headCenterX + 18} ${beltCenterY + (chuteCenterY - centerY) * 0.35}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray="10 6"
            strokeDashoffset={-phaseOffset * 32}
            opacity="0.78"
          />
        </g>

        {/* ==================== FEED CHUTE HOPPER & SKIRTBOARDS ==================== */}
        <g>
          <line
            x1="172"
            y1={chuteCenterY - 20}
            x2="228"
            y2={chuteCenterY - 16}
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <line
            x1="172"
            y1={chuteCenterY + 20}
            x2="228"
            y2={chuteCenterY + 16}
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <rect
            x="162"
            y={chuteCenterY - 22}
            width="46"
            height="44"
            rx="4"
            fill={panelFill}
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <rect
            x="167"
            y={chuteCenterY - 16}
            width="36"
            height="32"
            rx="2"
            fill={isDark ? '#0f172a' : '#fef3c7'}
            stroke="#d97706"
            strokeWidth="1"
          />
          <text
            x="185"
            y={chuteCenterY + 3}
            textAnchor="middle"
            fill={isDark ? '#fde68a' : '#92400e'}
            fontSize="8.5"
            fontWeight="800"
          >
            CHUTE
          </text>
        </g>

        {/* ==================== SELF-ALIGNING TRAINING IDLER ==================== */}
        <g>
          <g
            transform={`translate(${trainerX}, ${centerY}) rotate(${trainerSkewVisualDeg.toFixed(2)})`}
          >
            <rect
              x="-6"
              y="-58"
              width="12"
              height="116"
              rx="3"
              fill={isDark ? '#0369a1' : '#38bdf8'}
              stroke={isDark ? '#7dd3fc' : '#0284c7'}
              strokeWidth="1.5"
            />
            <circle
              cx="-8"
              cy="-52"
              r="4.2"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="1"
            />
            <circle
              cx="-8"
              cy="52"
              r="4.2"
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth="1"
            />
            <circle
              cx="0"
              cy="0"
              r="7"
              fill={panelFill}
              stroke="#0284c7"
              strokeWidth="2"
            />
          </g>
          {/* Training Idler Top Callout Pill */}
          <rect
            x={trainerX - 68}
            y="32"
            width="136"
            height="17"
            rx="8.5"
            fill="var(--md-primary-container)"
            stroke="var(--md-primary)"
            strokeWidth="1"
          />
          <text
            x={trainerX}
            y="43.5"
            textAnchor="middle"
            fill="var(--md-on-primary-container)"
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {pick('TRAINING IDLER', 'TRAINING IDLER', '調心アイドラ')} (
            {inputs.trainingIdlerSkewDeg > 0 ? '+' : ''}
            {inputs.trainingIdlerSkewDeg.toFixed(1)}°)
          </text>
        </g>

        {/* Frame Rubbing Alarm Glow Overlay */}
        {metrics.isFrameRubbing && (
          <g>
            <circle
              cx="458"
              cy={
                metrics.rubbingSide === 'right'
                  ? centerY + frameHalfWidthPx
                  : centerY - frameHalfWidthPx
              }
              r="12"
              fill="rgba(244, 63, 94, 0.35)"
            />
            <rect
              x="383"
              y={
                metrics.rubbingSide === 'right'
                  ? centerY + frameHalfWidthPx + 8
                  : centerY - frameHalfWidthPx - 25
              }
              width="150"
              height="18"
              rx="9"
              fill="#e11d48"
            />
            <text
              x="458"
              y={
                metrics.rubbingSide === 'right'
                  ? centerY + frameHalfWidthPx + 20
                  : centerY - frameHalfWidthPx - 13
              }
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="800"
              fontFamily="var(--font-sans)"
            >
              {pick(
                'FRAME RUBBING ALARM!',
                'GESEKAN TEPI SABUK!',
                'フレーム接触摩耗警報！'
              )}
            </text>
          </g>
        )}

        {/* ==================== 2. SIDE ELEVATION & 3-ROLL TROUGHING SECTION ==================== */}
        <line
          x1="16"
          y1="230"
          x2="764"
          y2="230"
          stroke={panelStroke}
          strokeWidth="1.5"
        />

        <text x="16" y="247" fill={textMuted} fontSize="10" fontWeight="700" fontFamily="var(--font-sans)">
          {pick(
            'SIDE ELEVATION & 3-ROLL CEMA TROUGHING CROSS-SECTION',
            'TAMPAK SAMPING & PENAMPANG ROL TROUGHING 3-BAGIAN',
            '側面図＆3ローラ式トラフアイドラ断面（偏荷重プロファイル）'
          )}
        </text>

        {/* Side View Conveyor Structure */}
        <g>
          <line
            x1="48"
            y1="372"
            x2="472"
            y2="372"
            stroke={steelFrameStroke}
            strokeWidth="2"
          />
          {[110, 275, 438].map((lx) => (
            <path
              key={lx}
              d={`M ${lx - 8} 372 L ${lx - 4} 320 L ${lx + 4} 320 L ${lx + 8} 372`}
              fill={steelFrameFill}
              stroke={steelFrameStroke}
              strokeWidth="1.2"
            />
          ))}

          {/* Side View Stringer Channel Beam */}
          <rect
            x="98"
            y="310"
            width="352"
            height="12"
            rx="2"
            fill={steelFrameFill}
            stroke={steelFrameStroke}
            strokeWidth="1.2"
          />

          {/* Tail Pulley & Take-Up Screw Frame (Left) */}
          <line
            x1="56"
            y1="316"
            x2="96"
            y2="316"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeDasharray="2.5 1.5"
          />
          <circle
            cx="104"
            cy="316"
            r="21"
            fill="url(#pulleyDrumGrad)"
            stroke={isDark ? '#fde68a' : '#78350f'}
            strokeWidth="2.2"
          />
          <circle cx="104" cy="316" r="5" fill={panelFill} />

          {/* Head Drive Pulley + Coaxial Shaft-Mounted Gearbox Outline (Right) */}
          <circle
            cx="442"
            cy="316"
            r="23"
            fill="url(#pulleyDrumGrad)"
            stroke={isDark ? '#fde68a' : '#78350f'}
            strokeWidth="2.5"
          />
          {/* Coaxial shaft-mounted gearbox & torque arm on Head Pulley shaft */}
          <rect
            x="412"
            y="307"
            width="38"
            height="18"
            rx="4"
            fill={isDark ? '#334155' : '#94a3b8'}
            stroke="#f59e0b"
            strokeWidth="1.3"
            opacity="0.9"
          />
          <circle cx="442" cy="316" r="6" fill="#0284c7" />

          {/* Top Carrying Belt Run & Bottom Return Belt Run */}
          <line
            x1="104"
            y1="295"
            x2="442"
            y2="293"
            stroke={beltBorderColor}
            strokeWidth="4"
          />
          <line
            x1="104"
            y1="337"
            x2="442"
            y2="339"
            stroke={isDark ? '#64748b' : '#475569'}
            strokeWidth="3"
            strokeDasharray="7 3"
          />

          {/* Side View Carrying Idler Rollers & Return Idlers */}
          {[178, 240, 304, 368].map((rx) => (
            <circle
              key={`c-${rx}`}
              cx={rx}
              cy="301"
              r="4.8"
              fill="#0284c7"
              stroke={panelFill}
              strokeWidth="1.2"
            />
          ))}
          {[208, 336].map((rx) => (
            <circle
              key={`r-${rx}`}
              cx={rx}
              cy="343"
              r="4.2"
              fill={steelFrameStroke}
              stroke={panelFill}
              strokeWidth="1"
            />
          ))}

          {/* Side View Feed Chute & Skirtboard */}
          <path
            d="M 134 264 L 166 264 L 160 293 L 140 293 Z"
            fill={panelFill}
            stroke="#f59e0b"
            strokeWidth="1.6"
          />
          <rect
            x="160"
            y="285"
            width="36"
            height="8"
            rx="1.5"
            fill="#f59e0b"
            opacity="0.7"
          />

          <rect
            x="232"
            y="269"
            width="116"
            height="17"
            rx="8.5"
            fill={panelFill}
            stroke={panelStroke}
            strokeWidth="0.9"
          />
          <text
            x="290"
            y="280.5"
            textAnchor="middle"
            fill={textPrimary}
            fontSize="9"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick('Carrying Run →', 'Sisi Angkut →', 'キャリア側（往路） →')}
          </text>

          <text
            x="290"
            y="362"
            textAnchor="middle"
            fill={textMuted}
            fontSize="9"
            fontWeight="600"
            fontFamily="var(--font-sans)"
          >
            ← {pick('Return Run', 'Sisi Balik', 'リターン側（復路）')}
          </text>
        </g>

        {/* ==================== 3-ROLL CEMA TROUGHING CROSS-SECTION INSET ==================== */}
        <g>
          <rect
            x="492"
            y="242"
            width="270"
            height="136"
            rx="14"
            fill="var(--md-surface-container-low)"
            stroke={panelStroke}
            strokeWidth="1.4"
          />
          <text
            x={csCenterX}
            y="259"
            textAnchor="middle"
            fill={textPrimary}
            fontSize="9.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
          >
            {pick(
              '3-ROLL TROUGHING CROSS-SECTION',
              'PENAMPANG 3-ROL TROUGHING',
              '3ローラ・トラフ断面（進行方向視）'
            )}
          </text>

          {/* Transom Base Support Frame & Stanchion Brackets */}
          <line
            x1={csCenterX - 74}
            y1={csBaseY + 14}
            x2={csCenterX + 74}
            y2={csBaseY + 14}
            stroke={steelFrameStroke}
            strokeWidth="3"
          />
          <line
            x1={csCenterX - 66}
            y1={csBaseY + 14}
            x2={csCenterX - 66}
            y2={csBaseY - 26}
            stroke={steelFrameStroke}
            strokeWidth="2.5"
          />
          <line
            x1={csCenterX + 66}
            y1={csBaseY + 14}
            x2={csCenterX + 66}
            y2={csBaseY - 26}
            stroke={steelFrameStroke}
            strokeWidth="2.5"
          />

          {/* 3-Roll Troughing Idler Set */}
          <line
            x1={csCenterX - 58}
            y1={csBaseY - 24}
            x2={csCenterX - 24}
            y2={csBaseY}
            stroke="#0284c7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1={csCenterX - 20}
            y1={csBaseY}
            x2={csCenterX + 20}
            y2={csBaseY}
            stroke="#0284c7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1={csCenterX + 24}
            y1={csBaseY}
            x2={csCenterX + 58}
            y2={csBaseY - 24}
            stroke="#0284c7"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Troughed Belt Cross-Section & Bulk Material Load Pile */}
          {(() => {
            const shiftX = (metrics.lateralWanderMm / 30) * 22;
            const bx = csCenterX + shiftX;
            const loadShiftX = (inputs.chuteOffsetMm / 60) * 20;
            return (
              <g>
                <path
                  d={`M ${bx - 52} ${csBaseY - 28} L ${bx - 21} ${csBaseY - 6} L ${bx + 21} ${csBaseY - 6} L ${bx + 52} ${csBaseY - 28}`}
                  fill="none"
                  stroke={beltBorderColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${bx + loadShiftX - 26} ${csBaseY - 8} Q ${bx + loadShiftX} ${csBaseY - 34} ${bx + loadShiftX + 26} ${csBaseY - 8} Z`}
                  fill="#f59e0b"
                  stroke="#d97706"
                  strokeWidth="1.2"
                  opacity="0.88"
                />
              </g>
            );
          })()}

          <text
            x={csCenterX}
            y="366"
            textAnchor="middle"
            fill={textMuted}
            fontSize="9"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            {pick('Wander:', 'Geser:', '蛇行量:')}{' '}
            {metrics.lateralWanderMm > 0 ? '+' : ''}
            {metrics.lateralWanderMm.toFixed(1)} mm (
            {pick('Clearance ±25 mm', 'Batas ±25 mm', '許容限界 ±25 mm')})
          </text>
        </g>
      </svg>
    </div>
  );
}
