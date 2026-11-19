import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type {
  JointCalculation,
  LubricationSpec,
  MetricBoltSpec,
  PropertyClassSpec,
} from './boltData';

interface TorqueWrenchSvgProps {
  bolt: MetricBoltSpec;
  propClass: PropertyClassSpec;
  lubrication: LubricationSpec;
  calc: JointCalculation;
  justClicked?: boolean;
  inTargetWindow?: boolean;
}

export function TorqueWrenchSvg({
  bolt,
  propClass,
  lubrication,
  calc,
  justClicked = false,
  inTargetWindow = false,
}: TorqueWrenchSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const bg = 'var(--md-surface-container-low)';
  const plateTop = isDark ? '#1e293b' : '#e2e8f0';
  const plateBottom = isDark ? '#0f172a' : '#f1f5f9';
  const plateStroke = isDark ? '#64748b' : '#475569';
  const hatchStroke = isDark ? '#475569' : '#94a3b8';
  const textPrimary = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';
  const boltBody = isDark ? '#94a3b8' : '#64748b';
  const boltHighlight = isDark ? '#cbd5e1' : '#475569';
  const wrenchChrome = isDark ? '#cbd5e1' : '#94a3b8';
  const wrenchDark = isDark ? '#334155' : '#1e293b';

  const statusColor =
    calc.status === 'stripped'
      ? '#ef4444'
      : calc.status === 'yielded'
      ? '#f97316'
      : calc.status === 'caution'
      ? '#eab308'
      : calc.status === 'optimal'
      ? '#10b981'
      : '#64748b';

  // Visual clamping compression & elastic bolt stretch
  const clampedRatio = Math.min(calc.proofPercent / 100, 1.35);
  const gasketThickness = Math.max(2.5, 8.5 - clampedRatio * 4.5);
  const lowerPlateY = 146 + gasketThickness;
  const nutY = lowerPlateY + 34;
  const shankStretchPx = Math.min(calc.elongationMm * 16, 7);

  const boltWidth = Math.min(Math.max(16 + (bolt.dMm - 6) * 0.9, 16), 34);
  const holeHalfW = boltWidth / 2 + 2.5;
  const headWidth = boltWidth * 1.72;
  const cx = 158;

  // Hex head facet rotation synchronized with applied torque
  const hexFacetOffset =
    ((Math.sin((calc.torqueNm / Math.max(calc.recommendedTorqueNm, 1)) * 4.2) + 1) * 0.5) *
      (headWidth * 0.32) -
    headWidth * 0.16;

  // Wrench angle rotates with torque + click-wrench break-over snap at target
  const torqueFrac = Math.min(calc.torqueNm / Math.max(calc.maxSliderTorqueNm, 1), 1);
  const baseWrenchAngle = -12 + torqueFrac * 24;
  const breakOverSnap = justClicked ? 5.5 : inTargetWindow ? 2.5 : 0;
  const wrenchAngle = baseWrenchAngle + breakOverSnap;
  // Micrometer vernier collar travel along sleeve
  const vernierTravelPx = torqueFrac * 18;

  // Arc gauge parameters (center 406, 148, radius 68)
  const gx = 406;
  const gy = 148;
  const r = 68;
  const startAngle = -210;
  const sweepTotal = 240; // -210 to +30 deg
  const clampedGaugePct = Math.min(calc.proofPercent / 130, 1);
  const needleAngle = startAngle + clampedGaugePct * sweepTotal;

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleDeg: number
  ) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const describeArc = (
    centerX: number,
    centerY: number,
    radius: number,
    startDeg: number,
    endDeg: number
  ) => {
    const start = polarToCartesian(centerX, centerY, radius, endDeg);
    const end = polarToCartesian(centerX, centerY, radius, startDeg);
    const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const needleTip = polarToCartesian(gx, gy, r - 12, needleAngle);

  return (
    <svg
      viewBox="0 0 530 268"
      className="w-full max-h-[480px] rounded-[22px] border border-[var(--md-outline-variant)]/60"
      style={{ backgroundColor: bg }}
      role="img"
      aria-label="Bolted joint CAD cross-section and micrometer torque wrench"
    >
      <defs>
        {/* +45 deg ISO section hatching for upper plate */}
        <pattern
          id="isoHatchTop"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill={plateTop} />
          <line x1="0" y1="0" x2="0" y2="8" stroke={hatchStroke} strokeWidth="1.2" />
        </pattern>

        {/* -45 deg ISO section hatching for lower plate */}
        <pattern
          id="isoHatchBottom"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect width="8" height="8" fill={plateBottom} />
          <line x1="0" y1="0" x2="0" y2="8" stroke={hatchStroke} strokeWidth="1.2" />
        </pattern>

        {/* Diamond knurling pattern for micrometer wrench grip */}
        <pattern
          id="wrenchKnurl"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <rect width="6" height="6" fill="#b45309" />
          <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#78350f" strokeWidth="1" opacity="0.7" />
        </pattern>

        {/* Metallic steel gradient for bolt & chrome wrench */}
        <linearGradient id="boltSteelGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={boltHighlight} />
          <stop offset="40%" stopColor={boltBody} />
          <stop offset="100%" stopColor={wrenchDark} />
        </linearGradient>

        <linearGradient id="chromeBeamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor={wrenchChrome} />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Left Header */}
      <text
        x="16"
        y="22"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--font-sans)"
        fill={textMuted}
        letterSpacing="0.05em"
      >
        {pick('JOINT CROSS-SECTION', 'PENAMPANG SAMBUNGAN', '締結部断面図')} ({bolt.size} · {propClass.id})
      </text>

      {/* Centerline CAD axis */}
      <line
        x1={cx}
        y1="70"
        x2={cx}
        y2="236"
        stroke={textMuted}
        strokeWidth="0.9"
        strokeDasharray="8 3 2 3"
        opacity="0.55"
      />

      {/* Upper Plate (Left & Right of bolt hole for true cutaway) */}
      <rect
        x="68"
        y="112"
        width={cx - holeHalfW - 68}
        height="34"
        rx="2"
        fill="url(#isoHatchTop)"
        stroke={plateStroke}
        strokeWidth="1.5"
      />
      <rect
        x={cx + holeHalfW}
        y="112"
        width={248 - (cx + holeHalfW)}
        height="34"
        rx="2"
        fill="url(#isoHatchTop)"
        stroke={plateStroke}
        strokeWidth="1.5"
      />

      {/* Spiral-Wound Gasket (Left & Right of bolt hole) */}
      <rect
        x="68"
        y="146"
        width={cx - holeHalfW - 68}
        height={gasketThickness}
        fill={calc.status === 'optimal' ? '#10b981' : '#f59e0b'}
        opacity="0.82"
      />
      <rect
        x={cx + holeHalfW}
        y="146"
        width={248 - (cx + holeHalfW)}
        height={gasketThickness}
        fill={calc.status === 'optimal' ? '#10b981' : '#f59e0b'}
        opacity="0.82"
      />

      {/* Lower Plate (Left & Right of bolt hole) */}
      <rect
        x="68"
        y={lowerPlateY}
        width={cx - holeHalfW - 68}
        height="34"
        rx="2"
        fill="url(#isoHatchBottom)"
        stroke={plateStroke}
        strokeWidth="1.5"
      />
      <rect
        x={cx + holeHalfW}
        y={lowerPlateY}
        width={248 - (cx + holeHalfW)}
        height="34"
        rx="2"
        fill="url(#isoHatchBottom)"
        stroke={plateStroke}
        strokeWidth="1.5"
      />

      {/* Clamping Force Arrows */}
      {calc.preloadKn > 0.2 && (
        <g opacity={Math.min(0.4 + clampedRatio * 0.6, 1)}>
          <line x1="88" y1="94" x2="88" y2="110" stroke={statusColor} strokeWidth="2.5" />
          <polygon points="84,106 92,106 88,113" fill={statusColor} />
          <line
            x1="88"
            y1={nutY + 18}
            x2="88"
            y2={nutY + 2}
            stroke={statusColor}
            strokeWidth="2.5"
          />
          <polygon
            points={`84,${nutY + 6} 92,${nutY + 6} 88,${nutY - 1}`}
            fill={statusColor}
          />

          <line x1="228" y1="94" x2="228" y2="110" stroke={statusColor} strokeWidth="2.5" />
          <polygon points="224,106 232,106 228,113" fill={statusColor} />
          <line
            x1="228"
            y1={nutY + 18}
            x2="228"
            y2={nutY + 2}
            stroke={statusColor}
            strokeWidth="2.5"
          />
          <polygon
            points={`224,${nutY + 6} 232,${nutY + 6} 228,${nutY - 1}`}
            fill={statusColor}
          />
        </g>
      )}

      {/* Bolt Shank (visibly elongates by ΔL) */}
      <rect
        x={cx - boltWidth / 2}
        y="110"
        width={boltWidth}
        height={110 + shankStretchPx}
        rx="2"
        fill="url(#boltSteelGrad)"
        stroke={boltHighlight}
        strokeWidth="1.4"
      />
      {/* Thread profile lines */}
      {[178, 184, 190, 196, 202, 208, 214].map((ty) => (
        <line
          key={ty}
          x1={cx - boltWidth / 2}
          y1={ty + shankStretchPx * 0.6}
          x2={cx + boltWidth / 2}
          y2={ty + 2.5 + shankStretchPx * 0.6}
          stroke={calc.status === 'stripped' ? '#ef4444' : '#0f172a'}
          strokeWidth={calc.status === 'stripped' ? '1.8' : '1.1'}
          opacity={calc.status === 'stripped' ? 0.95 : 0.45}
        />
      ))}

      {/* Hardened Flat Washers */}
      <rect
        x={cx - headWidth / 2 - 2}
        y="109"
        width={headWidth + 4}
        height="3.5"
        rx="1"
        fill={wrenchChrome}
        stroke={plateStroke}
        strokeWidth="0.8"
      />
      <rect
        x={cx - headWidth / 2 - 2}
        y={nutY - 1}
        width={headWidth + 4}
        height="3.5"
        rx="1"
        fill={wrenchChrome}
        stroke={plateStroke}
        strokeWidth="0.8"
      />

      {/* Bolt Head with rotating hex facet lines */}
      <rect
        x={cx - headWidth / 2}
        y="90"
        width={headWidth}
        height="19"
        rx="3"
        fill="url(#boltSteelGrad)"
        stroke={textPrimary}
        strokeWidth="1.2"
      />
      <line
        x1={cx - headWidth * 0.22 + hexFacetOffset}
        y1="91"
        x2={cx - headWidth * 0.22 + hexFacetOffset}
        y2="108"
        stroke={textPrimary}
        strokeWidth="1"
        opacity="0.35"
      />
      <line
        x1={cx + headWidth * 0.22 + hexFacetOffset}
        y1="91"
        x2={cx + headWidth * 0.22 + hexFacetOffset}
        y2="108"
        stroke={textPrimary}
        strokeWidth="1"
        opacity="0.35"
      />
      {/* Property class stamping on head */}
      <text
        x={cx}
        y="103"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fontFamily="var(--font-mono)"
        fill="#ffffff"
      >
        {propClass.id}
      </text>

      {/* Hex Nut */}
      <rect
        x={cx - headWidth / 2}
        y={nutY + 2.5}
        width={headWidth}
        height="17"
        rx="2"
        fill="url(#boltSteelGrad)"
        stroke={textPrimary}
        strokeWidth="1.2"
      />

      {/* Elastic Elongation ΔL callout */}
      <rect
        x={cx + headWidth / 2 + 5}
        y={nutY + 4}
        width="94"
        height="15"
        rx="7.5"
        fill="var(--md-surface-container)"
        stroke="var(--md-outline-variant)"
        strokeWidth="0.8"
      />
      <text
        x={cx + headWidth / 2 + 11}
        y={nutY + 14.5}
        fontSize="9"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={statusColor}
      >
        ΔL = +{calc.elongationMm.toFixed(3)} mm
      </text>

      {/* Micrometer Click-Type Torque Wrench (engaged at head) */}
      <g transform={`rotate(${wrenchAngle}, ${cx}, 86)`}>
        {(justClicked || inTargetWindow) && (
          <circle
            cx={cx}
            cy="86"
            r={headWidth / 2 + 9}
            fill="none"
            stroke="#10b981"
            strokeWidth={justClicked ? '2.5' : '1.5'}
            strokeDasharray="4 2"
            opacity={justClicked ? 0.95 : 0.65}
          />
        )}
        {/* Ratchet head & directional pawl */}
        <circle
          cx={cx}
          cy="86"
          r={headWidth / 2 + 4}
          fill="none"
          stroke={wrenchDark}
          strokeWidth="6"
        />
        <rect
          x={cx - 6}
          y="78"
          width="12"
          height="5"
          rx="2"
          fill="#f59e0b"
        />
        {/* Chrome Beam */}
        <rect
          x={cx + headWidth / 2 + 2}
          y="81"
          width="66"
          height="10"
          rx="2"
          fill="url(#chromeBeamGrad)"
          stroke={wrenchDark}
          strokeWidth="0.9"
        />
        {/* Micrometer Vernier Sleeve */}
        <rect
          x={cx + headWidth / 2 + 42}
          y="79"
          width="32"
          height="14"
          rx="2"
          fill={wrenchChrome}
          stroke={wrenchDark}
          strokeWidth="0.9"
        />
        {/* Graduated scale ticks on vernier sleeve */}
        {[46, 51, 56, 61, 66, 70].map((offset) => (
          <line
            key={offset}
            x1={cx + headWidth / 2 + offset}
            y1="80"
            x2={cx + headWidth / 2 + offset}
            y2="85"
            stroke={wrenchDark}
            strokeWidth="0.9"
          />
        ))}
        {/* Rotating/sliding thimble collar */}
        <rect
          x={cx + headWidth / 2 + 54 + vernierTravelPx * 0.4}
          y="78"
          width="10"
          height="16"
          rx="2"
          fill={wrenchDark}
        />
        {/* Knurled Ergonomic Handle Grip */}
        <rect
          x={cx + headWidth / 2 + 74}
          y="78.5"
          width="42"
          height="15"
          rx="5"
          fill="url(#wrenchKnurl)"
          stroke="#78350f"
          strokeWidth="1"
        />
        {/* Applied torque arrow & pill */}
        <path
          d={`M ${cx + headWidth / 2 + 64} 70 Q ${cx + headWidth / 2 + 72} 56 ${cx + headWidth / 2 + 52} 50`}
          fill="none"
          stroke="var(--md-primary)"
          strokeWidth="2"
          strokeDasharray="3 2"
        />
        <rect
          x={cx + headWidth / 2 + 6}
          y="33"
          width="82"
          height="16"
          rx="8"
          fill="var(--md-surface-container)"
          stroke="var(--md-primary)"
          strokeWidth="0.9"
        />
        <text
          x={cx + headWidth / 2 + 47}
          y="44"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          fill="var(--md-primary)"
        >
          T = {calc.torqueNm.toFixed(0)} N·m
        </text>
      </g>

      {/* Preload & Friction Tag */}
      <text
        x={cx}
        y="248"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fontFamily="var(--font-sans)"
        fill={textPrimary}
      >
        {pick('Preload', 'Preload', '軸力')} Fi = {calc.preloadKn.toFixed(1)} kN (K = {lubrication.kFactor.toFixed(2)})
      </text>

      {/* Right: Proof Load % Gauge */}
      <text
        x={gx}
        y="22"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--font-sans)"
        fill={textMuted}
        letterSpacing="0.05em"
      >
        {pick('PROOF LOAD UTILIZATION', 'UTILISASI PROOF LOAD', '保証荷重使用率')}
      </text>

      {/* Background track */}
      <path
        d={describeArc(gx, gy, r, -210, 30)}
        fill="none"
        stroke="var(--md-surface-container-highest)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Optimal zone (55% to 88%) */}
      <path
        d={describeArc(gx, gy, r, -108.5, -47.5)}
        fill="none"
        stroke="#10b981"
        strokeWidth="12"
        opacity="0.38"
      />
      {/* Caution zone (88% to 100%) */}
      <path
        d={describeArc(gx, gy, r, -47.5, -25.4)}
        fill="none"
        stroke="#eab308"
        strokeWidth="12"
        opacity="0.42"
      />
      {/* Yield / Overload zone (>100%) */}
      <path
        d={describeArc(gx, gy, r, -25.4, 30)}
        fill="none"
        stroke="#ef4444"
        strokeWidth="12"
        opacity="0.42"
      />

      {/* Gauge Tick Marks (0, 25, 50, 75, 100, 130%) */}
      {[0, 25, 50, 75, 100, 130].map((pct) => {
        const ang = startAngle + (pct / 130) * sweepTotal;
        const p1 = polarToCartesian(gx, gy, r - 8, ang);
        const p2 = polarToCartesian(gx, gy, r + 8, ang);
        return (
          <line
            key={pct}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={textMuted}
            strokeWidth={pct === 75 || pct === 100 ? '1.8' : '1'}
            opacity="0.7"
          />
        );
      })}

      {/* Active progress arc */}
      {clampedGaugePct > 0.01 && (
        <path
          d={describeArc(gx, gy, r, -210, needleAngle)}
          fill="none"
          stroke={statusColor}
          strokeWidth="12"
          strokeLinecap="round"
        />
      )}

      {/* Needle */}
      <line
        x1={gx}
        y1={gy}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke={textPrimary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={gx} cy={gy} r="5.5" fill={statusColor} stroke={bg} strokeWidth="1.5" />

      {/* Center Readout */}
      <text
        x={gx}
        y={gy + 26}
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fontFamily="var(--font-mono)"
        fill={statusColor}
      >
        {calc.proofPercent.toFixed(0)}%
      </text>
      <text
        x={gx}
        y={gy + 42}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fontFamily="var(--font-sans)"
        fill={textMuted}
      >
        {pick('of Proof', 'dari Proof', '保証荷重')} ({propClass.proofStrengthMpa} MPa)
      </text>

      {/* Gauge Min/Max Labels */}
      <text x={gx - 78} y={gy + 38} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={textMuted}>
        0%
      </text>
      <text x={gx + 78} y={gy + 38} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="#ef4444">
        130%
      </text>
      <text x={gx} y="248" textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)" fill={textPrimary}>
        {pick('Target: 75% Proof', 'Target: 75% Proof', '目標: 75% 保証')} ({calc.recommendedTorqueNm.toFixed(1)} N·m)
      </text>
    </svg>
  );
}
