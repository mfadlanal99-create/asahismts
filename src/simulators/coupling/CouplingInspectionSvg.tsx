import { useTheme } from '../../context/ThemeContext';
import { degToRad } from '../../physics';
import type {
  CouplingInspectionInputs,
  CouplingInspectionResult,
} from './couplingTypes';

interface CouplingInspectionSvgProps {
  inputs: CouplingInspectionInputs;
  result: CouplingInspectionResult;
  parallelMisalignmentMm: number;
  angularMisalignmentDeg: number;
}

export function CouplingInspectionSvg({
  inputs,
  result,
  parallelMisalignmentMm,
  angularMisalignmentDeg,
}: CouplingInspectionSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const cardFill = isDark ? '#1e293b' : '#ffffff';
  const borderStroke = isDark ? '#334155' : '#cbd5e1';
  const textFill = isDark ? '#e2e8f0' : '#1e293b';
  const mutedFill = isDark ? '#94a3b8' : '#64748b';
  const metalFill = isDark ? '#475569' : '#cbd5e1';
  const metalDark = isDark ? '#334155' : '#94a3b8';

  const wearColor =
    inputs.elastomerWearPct >= 65
      ? '#f43f5e'
      : inputs.elastomerWearPct >= 30
        ? '#f59e0b'
        : '#8b5cf6';

  const frettingColor =
    result.frettingRisk === 'Critical'
      ? '#f43f5e'
      : result.frettingRisk === 'High'
        ? '#f97316'
        : result.frettingRisk === 'Moderate'
          ? '#f59e0b'
          : '#10b981';

  // Visual backlash rotation angle (exaggerated for clarity)
  const visualBacklashDeg = Math.min(14, result.torsionalBacklashDeg * 2.2);
  // Visual keyway gap in px
  const keyGapPx = Math.min(12, Math.max(1, inputs.keywayClearanceMm * 38));
  // Parallel offset shift (px) and angular tilt foreshortening on driven hub
  const parallelShiftPx = Math.min(12, parallelMisalignmentMm * 14);
  const angularScaleX = Math.max(0.84, 1 - angularMisalignmentDeg * 0.08);
  const angularSkewY = Math.min(8, angularMisalignmentDeg * 4.2);

  return (
    <svg
      viewBox="0 0 600 256"
      className="h-auto w-full max-h-[480px] select-none"
      aria-label="Coupling engagement and shaft keyway fit diagram"
    >
      <defs>
        <pattern
          id="coupling-cad-grid"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 16 0 L 0 0 0 16"
            fill="none"
            stroke={isDark ? '#1e293b' : '#e2e8f0'}
            strokeWidth="0.6"
          />
        </pattern>
        <pattern
          id="coupling-iso-hatch"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="7"
            stroke={isDark ? '#475569' : '#94a3b8'}
            strokeWidth="1.2"
          />
        </pattern>
        <linearGradient id="coupling-steel-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isDark ? '#64748b' : '#e2e8f0'} />
          <stop offset="50%" stopColor={isDark ? '#475569' : '#cbd5e1'} />
          <stop offset="100%" stopColor={isDark ? '#334155' : '#94a3b8'} />
        </linearGradient>
      </defs>

      <rect
        x={0}
        y={0}
        width={600}
        height={256}
        rx={14}
        fill={bgFill}
        stroke={borderStroke}
        strokeWidth={1}
      />

      {/* Left Panel: Coupling Cross-Section */}
      <rect
        x={12}
        y={12}
        width={282}
        height={232}
        rx={10}
        fill={cardFill}
        stroke={borderStroke}
        strokeWidth={1}
      />
      <rect
        x={12}
        y={12}
        width={282}
        height={232}
        rx={10}
        fill="url(#coupling-cad-grid)"
        opacity={0.55}
      />
      <text
        x={24}
        y={32}
        fontSize={11}
        fontWeight={700}
        fill={textFill}
      >
        {result.spec.shortName} — Backlash View
      </text>
      <text x={24} y={47} fontSize={10} fill={mutedFill}>
        Play: {result.torsionalBacklashDeg.toFixed(2)}° (
        {result.circumferentialPlayMm.toFixed(2)} mm)
      </text>

      <g transform="translate(153, 142)">
        {/* CAD Dash-Dot Reference Centerlines */}
        <line
          x1={-86}
          y1={0}
          x2={86}
          y2={0}
          stroke={mutedFill}
          strokeWidth={0.8}
          strokeDasharray="8 3 2 3"
          opacity={0.6}
        />
        <line
          x1={0}
          y1={-86}
          x2={0}
          y2={86}
          stroke={mutedFill}
          strokeWidth={0.8}
          strokeDasharray="8 3 2 3"
          opacity={0.6}
        />
        {/* Outer Housing / Sleeve */}
        <circle
          cx={0}
          cy={0}
          r={74}
          fill="none"
          stroke={metalDark}
          strokeWidth={6}
        />
        <circle
          cx={0}
          cy={0}
          r={78}
          fill="none"
          stroke={borderStroke}
          strokeWidth={1}
          strokeDasharray="4 3"
        />

        {inputs.couplingType === 'jaw' && (
          <g>
            {/* Contoured 6-Lobe Elastomer Spider Insert */}
            {Array.from({ length: 6 }, (_, i) => (
              <path
                key={i}
                d="M -11,-24 L -13,-58 Q 0,-66 13,-58 L 11,-24 Z"
                fill={wearColor}
                opacity={0.86}
                transform={`rotate(${i * 60})`}
              />
            ))}
            <circle cx={0} cy={0} r={29} fill={wearColor} opacity={0.92} />

            {/* 3 Driver Jaws (fixed reference) */}
            {[0, 120, 240].map((deg) => (
              <rect
                key={`drv-${deg}`}
                x={-9}
                y={-66}
                width={18}
                height={32}
                rx={3}
                fill={metalFill}
                stroke={metalDark}
                strokeWidth={1.5}
                transform={`rotate(${deg + 30})`}
              />
            ))}

            {/* 3 Driven Jaws (shifted/tilted by parallel & angular misalignment + backlash) */}
            <g
              transform={`translate(0, ${-parallelShiftPx}) scale(${angularScaleX}, 1) skewY(${angularSkewY})`}
            >
              {[60, 180, 300].map((deg) => (
                <rect
                  key={`drn-${deg}`}
                  x={-9}
                  y={-66}
                  width={18}
                  height={32}
                  rx={3}
                  fill={isDark ? '#64748b' : '#e2e8f0'}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  transform={`rotate(${deg + 30 + visualBacklashDeg})`}
                />
              ))}
            </g>
          </g>
        )}

        {inputs.couplingType === 'gear' && (
          <g>
            {/* Outer Sleeve Internal Teeth */}
            {Array.from({ length: 18 }, (_, i) => (
              <rect
                key={`slv-${i}`}
                x={-5}
                y={-70}
                width={10}
                height={14}
                rx={2}
                fill={metalDark}
                transform={`rotate(${i * 20})`}
              />
            ))}
            {/* Inner Hub Crowned Teeth (shifted/tilted by misalignment + backlash) */}
            <g
              transform={`translate(0, ${-parallelShiftPx}) scale(${angularScaleX}, 1) skewY(${angularSkewY}) rotate(${visualBacklashDeg})`}
            >
              <circle
                cx={0}
                cy={0}
                r={46}
                fill={metalFill}
                stroke={metalDark}
                strokeWidth={1.5}
              />
              {Array.from({ length: 18 }, (_, i) => (
                <path
                  key={`hub-${i}`}
                  d="M -4,-44 Q -5,-52 -3,-58 Q 0,-60 3,-58 Q 5,-52 4,-44 Z"
                  fill={wearColor}
                  transform={`rotate(${i * 20 + 10})`}
                />
              ))}
            </g>
          </g>
        )}

        {inputs.couplingType === 'grid' && (
          <g>
            {/* Slotted Hub Teeth */}
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={`gtooth-${i}`}
                x={-6}
                y={-62}
                width={12}
                height={26}
                rx={2}
                fill={metalFill}
                stroke={metalDark}
                strokeWidth={1.2}
                transform={`rotate(${i * 30})`}
              />
            ))}
            {/* Serpentine Alloy-Steel Spring Grid */}
            <g
              transform={`translate(0, ${-parallelShiftPx}) scale(${angularScaleX}, 1) skewY(${angularSkewY}) rotate(${visualBacklashDeg})`}
            >
              <path
                d={Array.from({ length: 12 }, (_, i) => {
                  const a1 = degToRad(i * 30 - 10);
                  const a2 = degToRad(i * 30 + 10);
                  const rIn = 44;
                  const rOut = 60;
                  const x1 = rIn * Math.sin(a1);
                  const y1 = -rIn * Math.cos(a1);
                  const x2 = rOut * Math.sin(a1);
                  const y2 = -rOut * Math.cos(a1);
                  const x3 = rOut * Math.sin(a2);
                  const y3 = -rOut * Math.cos(a2);
                  const x4 = rIn * Math.sin(a2);
                  const y4 = -rIn * Math.cos(a2);
                  return `${i === 0 ? 'M' : 'L'}${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} L${x4.toFixed(1)},${y4.toFixed(1)}`;
                }).join(' ') + ' Z'}
                fill="none"
                stroke={wearColor}
                strokeWidth={3.2}
                strokeLinejoin="round"
              />
            </g>
          </g>
        )}

        {/* Center Bore */}
        <circle
          cx={0}
          cy={0}
          r={22}
          fill={cardFill}
          stroke={borderStroke}
          strokeWidth={2}
        />
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={textFill}
        >
          Ø{inputs.shaftDiameterMm}
        </text>
      </g>

      {/* Right Panel: DIN 6885 Keyway Fit & Clearance Zoom */}
      <rect
        x={306}
        y={12}
        width={282}
        height={232}
        rx={10}
        fill={cardFill}
        stroke={borderStroke}
        strokeWidth={1}
      />
      <rect
        x={306}
        y={12}
        width={282}
        height={232}
        rx={10}
        fill="url(#coupling-cad-grid)"
        opacity={0.55}
      />
      <text x={318} y={32} fontSize={11} fontWeight={700} fill={textFill}>
        Keyway Fit &amp; Fretting Inspection
      </text>
      <text x={318} y={47} fontSize={10} fill={mutedFill}>
        DIN 6885 Key: {result.keyWidthMm}×{result.keyHeightMm}×
        {inputs.keyLengthMm} mm | Gap: {inputs.keywayClearanceMm.toFixed(2)} mm
      </text>

      <g transform="translate(447, 148)">
        {/* Outer Hub Bore with ISO 45° Section Hatching */}
        <path
          d="M -68 25 A 72 72 0 1 1 68 25 L 68 62 L -68 62 Z"
          fill={isDark ? '#334155' : '#e2e8f0'}
          stroke={metalDark}
          strokeWidth={1.5}
        />
        <path
          d="M -68 25 A 72 72 0 1 1 68 25 L 68 62 L -68 62 Z"
          fill="url(#coupling-iso-hatch)"
          opacity={0.6}
        />
        {/* Hub Keyway Slot */}
        <rect
          x={-24 - keyGapPx}
          y={-78}
          width={48 + keyGapPx * 2}
          height={28}
          fill={cardFill}
          stroke={metalDark}
          strokeWidth={1.5}
        />

        {/* Brushed Steel Shaft */}
        <circle
          cx={0}
          cy={0}
          r={52}
          fill="url(#coupling-steel-grad)"
          stroke={metalDark}
          strokeWidth={2}
        />

        {/* Shaft Keyseat */}
        <rect
          x={-24}
          y={-54}
          width={48}
          height={22}
          fill={cardFill}
          stroke={metalDark}
          strokeWidth={1.5}
        />

        {/* Parallel Key */}
        <rect
          x={-22}
          y={-74}
          width={44}
          height={40}
          rx={2}
          fill="#8b5cf6"
          stroke="#6d28d9"
          strokeWidth={1.5}
        />
        <text
          x={0}
          y={-51}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#ffffff"
        >
          KEY
        </text>

        {/* Clearance / Fretting Zone Highlight */}
        {inputs.keywayClearanceMm > 0.02 && (
          <g>
            <rect
              x={22}
              y={-76}
              width={keyGapPx + 2}
              height={26}
              fill={frettingColor}
              opacity={0.75}
            />
            <line
              x1={24 + keyGapPx}
              y1={-63}
              x2={48}
              y2={-79}
              stroke={frettingColor}
              strokeWidth={1.5}
            />
            <rect
              x={38}
              y={-92}
              width={92}
              height={16}
              rx={4}
              fill={cardFill}
              stroke={frettingColor}
              strokeWidth={1}
            />
            <text
              x={84}
              y={-81}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              fill={frettingColor}
            >
              {result.frettingRisk} Fretting
            </text>
          </g>
        )}

        {/* Torque Force Arrow */}
        <path
          d="M -42 15 A 45 45 0 0 0 42 15"
          fill="none"
          stroke="#0284c7"
          strokeWidth={2.2}
        />
        <polygon points="44,12 36,19 46,22" fill="#0284c7" />
        <text
          x={0}
          y={38}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#0284c7"
        >
          T = {inputs.torqueNm} Nm
        </text>
      </g>
    </svg>
  );
}
