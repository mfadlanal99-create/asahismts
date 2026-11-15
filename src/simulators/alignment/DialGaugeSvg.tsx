import { useTheme } from '../../context/ThemeContext';
import type {
  AlignmentSolution,
  MachineGeometry,
  MeasurementView,
} from './alignmentTypes';

interface AnalogDialGaugeProps {
  label: string;
  subtitle: string;
  valueMm: number;
  tirMm: number;
  accent: 'emerald' | 'sky';
}

export function AnalogDialGauge({
  label,
  subtitle,
  valueMm,
  tirMm,
  accent,
}: AnalogDialGaugeProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 1.00 mm = 1 full revolution (360 deg). Positive = clockwise, Negative = counter-clockwise.
  const mainAngleDeg = valueMm * 360;
  // Small revolution counter: 10 revolutions full circle
  const revAngleDeg = (valueMm / 10) * 360;
  // Plunger travel in SVG px (positive = plunger pushed inward, negative = extended)
  const plungerShiftPx = Math.max(-7, Math.min(7, valueMm * 14));

  const faceBg = isDark ? '#0f172a' : '#ffffff';
  const bezelStroke = isDark ? '#334155' : '#cbd5e1';
  const tickMajor = isDark ? '#cbd5e1' : '#334155';
  const tickMinor = isDark ? '#475569' : '#94a3b8';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : '#64748b';
  const needleColor =
    accent === 'emerald'
      ? isDark
        ? '#34d399'
        : '#059669'
      : isDark
        ? '#38bdf8'
        : '#0284c7';

  const ticks = Array.from({ length: 50 }, (_, i) => {
    const deg = (i / 50) * 360;
    const isMajor = i % 5 === 0;
    const rad = ((deg - 90) * Math.PI) / 180;
    const rOuter = 68;
    const rInner = isMajor ? 58 : 63;
    const x1 = 80 + rInner * Math.cos(rad);
    const y1 = 80 + rInner * Math.sin(rad);
    const x2 = 80 + rOuter * Math.cos(rad);
    const y2 = 80 + rOuter * Math.sin(rad);

    const numVal = i * 2; // 0 to 98 (0.01 mm units, 100 = 1.00 mm)
    const rText = 48;
    const tx = 80 + rText * Math.cos(rad);
    const ty = 80 + rText * Math.sin(rad);

    return { i, isMajor, x1, y1, x2, y2, numVal, tx, ty };
  });

  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-1 flex w-full items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {label}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {subtitle}
          </div>
        </div>
        <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          TIR {tirMm.toFixed(2)} mm
        </span>
      </div>

      <svg
        viewBox="0 0 160 176"
        className="h-40 w-36 select-none"
        aria-label={`${label} dial gauge`}
      >
        <defs>
          <linearGradient id={`dial-bezel-${accent}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
            <stop offset="50%" stopColor={isDark ? '#334155' : '#cbd5e1'} />
            <stop offset="100%" stopColor={isDark ? '#1e293b' : '#94a3b8'} />
          </linearGradient>
        </defs>
        {/* Live Plunger Stem (bottom) */}
        <rect
          x="76"
          y={152 - plungerShiftPx}
          width="8"
          height="18"
          rx="2"
          fill={bezelStroke}
        />
        <circle
          cx="80"
          cy={170 - plungerShiftPx}
          r="3.2"
          fill={needleColor}
        />

        {/* Outer metallic bezel */}
        <circle
          cx="80"
          cy="80"
          r="75"
          fill={faceBg}
          stroke={`url(#dial-bezel-${accent})`}
          strokeWidth="4"
        />
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke={bezelStroke}
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Ticks & numbers */}
        {ticks.map((t) => (
          <g key={t.i}>
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isMajor ? tickMajor : tickMinor}
              strokeWidth={t.isMajor ? 1.6 : 0.9}
            />
            {t.isMajor && (
              <text
                x={t.tx}
                y={t.ty}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8.5"
                fontWeight="600"
                fill={textMuted}
              >
                {t.numVal}
              </text>
            )}
          </g>
        ))}

        {/* Small revolution sub-dial */}
        <circle
          cx="80"
          cy="106"
          r="15"
          fill={isDark ? '#1e293b' : '#f1f5f9'}
          stroke={bezelStroke}
          strokeWidth="1"
        />
        <g transform={`rotate(${revAngleDeg} 80 106)`}>
          <line
            x1="80"
            y1="106"
            x2="80"
            y2="94"
            stroke={textPrimary}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="80" cy="106" r="2" fill={textPrimary} />

        {/* Unit label */}
        <text
          x="80"
          y="63"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="600"
          fill={textMuted}
        >
          0.01 mm
        </text>

        {/* Main needle */}
        <g transform={`rotate(${mainAngleDeg} 80 80)`}>
          <line
            x1="80"
            y1="94"
            x2="80"
            y2="20"
            stroke={needleColor}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="80" cy="80" r="4.5" fill={needleColor} />
        </g>
        <circle cx="80" cy="80" r="2" fill={faceBg} />
      </svg>

      <div className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1 font-mono text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        {valueMm >= 0 ? '+' : ''}
        {valueMm.toFixed(3)} mm
      </div>
    </div>
  );
}

interface AlignmentRigSvgProps {
  geometry: MachineGeometry;
  solution: AlignmentSolution;
  shaftAngleDeg: number;
  softFootMm: number;
  measurementView?: MeasurementView;
}

export function AlignmentRigSvg({
  geometry,
  solution,
  shaftAngleDeg,
  softFootMm,
  measurementView = 'dial',
}: AlignmentRigSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const stroke = isDark ? '#334155' : '#cbd5e1';
  const machineFill = isDark ? '#1e293b' : '#e2e8f0';
  const machineStroke = isDark ? '#475569' : '#64748b';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textSub = isDark ? '#94a3b8' : '#475569';
  const centerLineColor = isDark ? '#38bdf8' : '#0284c7';
  const motorLineColor = solution.isAligned
    ? isDark
      ? '#34d399'
      : '#059669'
    : isDark
      ? '#fbbf24'
      : '#d97706';

  // Exaggerate vertical displacements for clear visual feedback (clamp to keep inside SVG)
  const scaleY = 22; // 1 mm -> 22 px
  const clampPx = (v: number) => Math.max(-24, Math.min(24, v * scaleY));

  const couplingYShift = -clampPx(solution.verticalOffsetMm);
  const frontFootYShift = -clampPx(solution.netFrontVerticalMm);
  const rearFootYShift = -clampPx(solution.netRearVerticalMm);

  // Motor tilt angle in SVG degrees (exaggerated)
  const motorAngleRad = Math.atan2(
    rearFootYShift - frontFootYShift,
    130
  );
  const motorAngleDeg = (motorAngleRad * 180) / Math.PI;

  // End-view (clock) coordinates
  const clockCx = 560;
  const clockCy = 132;
  const clockR = 54;
  const armRad = ((shaftAngleDeg - 90) * Math.PI) / 180;
  const armX = clockCx + clockR * Math.cos(armRad);
  const armY = clockCy + clockR * Math.sin(armRad);

  // Exaggerated motor shaft center dot in end-view
  const endOffsetX = Math.max(
    -14,
    Math.min(14, solution.horizontalOffsetMm * 20)
  );
  const endOffsetY = Math.max(
    -14,
    Math.min(14, -solution.verticalOffsetMm * 20)
  );

  const hasSoftFoot = softFootMm > solution.maxSoftFootLimitMm;

  // Synchronized side-view indicator position along coupling perimeter
  const shaftRad = (shaftAngleDeg * Math.PI) / 180;
  const sideDialY = 132 - 26 * Math.cos(shaftRad);
  const sidePlungerShift = Math.max(-4, Math.min(4, solution.rimCompMm * 8));

  // Brass shim stack visual heights on baseplate (proportional to foot vertical height)
  const frontShimH = Math.max(2, Math.min(16, 6 + solution.netFrontVerticalMm * 14));
  const rearShimH = Math.max(2, Math.min(16, 6 + solution.netRearVerticalMm * 14));

  // Clock cardinal highlight helper (within +-15 deg)
  const normAngle = ((shaftAngleDeg % 360) + 360) % 360;
  const isNearAngle = (target: number) => {
    const diff = Math.abs(normAngle - target);
    return Math.min(diff, 360 - diff) <= 15;
  };
  const activeCardinalColor = isDark ? '#34d399' : '#059669';

  return (
    <svg
      viewBox="0 0 660 270"
      className="w-full max-h-[480px] rounded-xl border border-slate-200 dark:border-slate-800"
      style={{ background: bg }}
      aria-label="Motor to Pump Shaft Alignment Rig"
    >
      <defs>
        <pattern
          id="rig-base-hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="8"
            stroke={isDark ? '#475569' : '#94a3b8'}
            strokeWidth="1.2"
          />
        </pattern>
        <linearGradient id="rig-steel-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#94a3b8' : '#e2e8f0'} />
          <stop offset="50%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
          <stop offset="100%" stopColor={isDark ? '#475569' : '#94a3b8'} />
        </linearGradient>
        <linearGradient id="rig-machine-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#f1f5f9'} />
          <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
        </linearGradient>
      </defs>
      {/* Side View Header */}
      <text
        x="18"
        y="22"
        fontSize="11"
        fontWeight="700"
        fill={textMain}
      >
        SIDE VIEW — VERTICAL PLANE (EXAGGERATED)
      </text>
      <text x="18" y="37" fontSize="10" fill={textSub}>
        Pump (Stationary) → Coupling → Motor (Adjustable Shims)
      </text>

      {/* Baseplate with ISO 45° Section Hatching */}
      <rect
        x="24"
        y="214"
        width="430"
        height="16"
        rx="3"
        fill={isDark ? '#334155' : '#cbd5e1'}
        stroke={stroke}
      />
      <rect
        x="24"
        y="214"
        width="430"
        height="16"
        rx="3"
        fill="url(#rig-base-hatch)"
        opacity="0.65"
      />

      {/* Pump (Stationary Left) */}
      <g>
        {/* Pump top discharge nozzle flange */}
        <rect
          x="76"
          y="74"
          width="40"
          height="22"
          rx="2"
          fill="url(#rig-machine-grad)"
          stroke={machineStroke}
          strokeWidth="1.3"
        />
        <rect
          x="70"
          y="70"
          width="52"
          height="6"
          rx="1.5"
          fill="url(#rig-steel-grad)"
          stroke={machineStroke}
          strokeWidth="1.2"
        />
        <rect
          x="44"
          y="96"
          width="104"
          height="94"
          rx="6"
          fill="url(#rig-machine-grad)"
          stroke={machineStroke}
          strokeWidth="1.5"
        />
        {/* Pump feet */}
        <rect
          x="52"
          y="190"
          width="24"
          height="24"
          fill={machineFill}
          stroke={machineStroke}
        />
        <rect
          x="116"
          y="190"
          width="24"
          height="24"
          fill={machineFill}
          stroke={machineStroke}
        />
        <text
          x="96"
          y="147"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={textMain}
        >
          PUMP
        </text>
        <text
          x="96"
          y="162"
          textAnchor="middle"
          fontSize="9"
          fill={textSub}
        >
          Stationary
        </text>
        {/* Pump shaft + left coupling hub */}
        <rect
          x="148"
          y="124"
          width="56"
          height="16"
          fill="url(#rig-steel-grad)"
          stroke={machineStroke}
        />
        <rect
          x="200"
          y="104"
          width="12"
          height="56"
          rx="2"
          fill="url(#rig-steel-grad)"
          stroke={machineStroke}
        />
      </g>

      {/* Stationary Pump Reference Centerline */}
      <line
        x1="36"
        y1="132"
        x2="446"
        y2="132"
        stroke={centerLineColor}
        strokeWidth="1.2"
        strokeDasharray="5 4"
      />

      {/* Visible Brass Shim Stacks under Motor Feet */}
      <rect
        x="284"
        y={214 - frontShimH}
        width="28"
        height={frontShimH}
        rx="1"
        fill="#f59e0b"
        opacity="0.9"
      />
      <rect
        x="392"
        y={214 - rearShimH}
        width="28"
        height={rearShimH}
        rx="1"
        fill="#f59e0b"
        opacity="0.9"
      />

      {/* Movable Motor (Right) */}
      <g
        transform={`translate(0, ${couplingYShift}) rotate(${motorAngleDeg} 224 132)`}
      >
        {/* Right coupling hub + motor shaft */}
        <rect
          x="220"
          y="104"
          width="12"
          height="56"
          rx="2"
          fill="url(#rig-steel-grad)"
          stroke={machineStroke}
        />
        <rect
          x="232"
          y="124"
          width="46"
          height="16"
          fill="url(#rig-steel-grad)"
          stroke={machineStroke}
        />
        {/* Motor terminal box */}
        <rect
          x="332"
          y="74"
          width="40"
          height="14"
          rx="2"
          fill="url(#rig-machine-grad)"
          stroke={machineStroke}
          strokeWidth="1.2"
        />
        {/* Motor body */}
        <rect
          x="278"
          y="88"
          width="148"
          height="102"
          rx="8"
          fill="url(#rig-machine-grad)"
          stroke={machineStroke}
          strokeWidth="1.5"
        />
        {/* Cooling fins */}
        {[98, 108, 118, 128, 138, 148, 158, 168].map((fy) => (
          <line
            key={fy}
            x1="292"
            y1={fy}
            x2="412"
            y2={fy}
            stroke={stroke}
            strokeWidth="1"
          />
        ))}
        <rect
          x="315"
          y="112"
          width="74"
          height="40"
          rx="4"
          fill={cardBg}
          stroke={stroke}
        />
        <text
          x="352"
          y="131"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={textMain}
        >
          MOTOR
        </text>
        <text
          x="352"
          y="145"
          textAnchor="middle"
          fontSize="9"
          fill={textSub}
        >
          {geometry.rpm} RPM
        </text>
        {/* Motor centerline */}
        <line
          x1="216"
          y1="132"
          x2="440"
          y2="132"
          stroke={motorLineColor}
          strokeWidth="1.6"
        />
        {/* Motor front & rear feet */}
        <rect
          x="286"
          y="190"
          width="24"
          height="22"
          fill={machineFill}
          stroke={hasSoftFoot ? '#f43f5e' : machineStroke}
          strokeWidth={hasSoftFoot ? 2 : 1}
        />
        <rect
          x="394"
          y="190"
          width="24"
          height="22"
          fill={machineFill}
          stroke={machineStroke}
        />
      </g>

      {/* Soft-foot warning callout */}
      {hasSoftFoot && (
        <g>
          <rect
            x="266"
            y="234"
            width="92"
            height="20"
            rx="4"
            fill={isDark ? '#4c0519' : '#ffe4e6'}
            stroke="#f43f5e"
          />
          <text
            x="312"
            y="247"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="700"
            fill={isDark ? '#fda4af' : '#be123c'}
          >
            SOFT FOOT {softFootMm.toFixed(2)}mm
          </text>
        </g>
      )}

      {/* Dial Indicator Bracket or Dual-Laser Heads on Coupling */}
      {measurementView === 'laser' ? (
        <g>
          {/* Stationary Laser Head (S) */}
          <rect
            x="176"
            y="84"
            width="16"
            height="24"
            rx="3"
            fill={isDark ? '#0284c7' : '#0369a1'}
            stroke={cardBg}
            strokeWidth="1.2"
          />
          <text
            x="184"
            y="99"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#ffffff"
          >
            S
          </text>
          {/* Movable Laser Head (M) */}
          <rect
            x="242"
            y="84"
            width="16"
            height="24"
            rx="3"
            fill={isDark ? '#059669' : '#047857'}
            stroke={cardBg}
            strokeWidth="1.2"
          />
          <text
            x="250"
            y="99"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#ffffff"
          >
            M
          </text>
          {/* Laser Beams */}
          <line
            x1="192"
            y1="93"
            x2="242"
            y2={93 + couplingYShift * 0.4}
            stroke="#f43f5e"
            strokeWidth="2"
          />
          <line
            x1="192"
            y1="99"
            x2="242"
            y2={99 + couplingYShift * 0.4}
            stroke="#fb7185"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <text
            x="217"
            y="66"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="700"
            fill="#f43f5e"
          >
            Dual-Laser PSD
          </text>
        </g>
      ) : (
        <g>
          <circle
            cx="216"
            cy="132"
            r="26"
            fill="none"
            stroke={isDark ? '#34d399' : '#059669'}
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          {/* Synchronized sweeping Rim & Face indicator head */}
          <line
            x1="216"
            y1="132"
            x2="216"
            y2={sideDialY}
            stroke={isDark ? '#34d399' : '#059669'}
            strokeWidth="2"
          />
          <circle
            cx="216"
            cy={sideDialY + sidePlungerShift * 0.4}
            r="5"
            fill={isDark ? '#34d399' : '#059669'}
          />
          <text
            x="216"
            y="72"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fill={isDark ? '#34d399' : '#059669'}
          >
            Rim &amp; Face
          </text>
        </g>
      )}

      {/* Foot Distance Dimension Labels */}
      <text x="298" y="252" textAnchor="middle" fontSize="9.5" fill={textSub}>
        {hasSoftFoot ? '' : `Front L₁ = ${geometry.frontFootDistMm} mm`}
      </text>
      <text x="406" y="252" textAnchor="middle" fontSize="9.5" fill={textSub}>
        Rear L₂ = {geometry.rearFootDistMm} mm
      </text>

      {/* Divider */}
      <line
        x1="466"
        y1="16"
        x2="466"
        y2="254"
        stroke={stroke}
        strokeWidth="1"
      />

      {/* End View (Axial Clock Sweep) */}
      <text
        x={clockCx}
        y="22"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={textMain}
      >
        END VIEW (D = {geometry.couplingDiameterMm} mm)
      </text>
      <text
        x={clockCx}
        y="37"
        textAnchor="middle"
        fontSize="10"
        fill={textSub}
      >
        Shaft Angle: {shaftAngleDeg.toFixed(0)}°
      </text>

      {/* Outer sweep circle */}
      <circle
        cx={clockCx}
        cy={clockCy}
        r={clockR}
        fill={cardBg}
        stroke={stroke}
        strokeWidth="2"
      />
      <line
        x1={clockCx - clockR - 8}
        y1={clockCy}
        x2={clockCx + clockR + 8}
        y2={clockCy}
        stroke={stroke}
        strokeDasharray="3 3"
      />
      <line
        x1={clockCx}
        y1={clockCy - clockR - 8}
        x2={clockCx}
        y2={clockCy + clockR + 8}
        stroke={stroke}
        strokeDasharray="3 3"
      />

      {/* T, R, B, L labels with active clock-position highlight */}
      <text
        x={clockCx}
        y={clockCy - clockR - 11}
        textAnchor="middle"
        fontSize={isNearAngle(0) ? '11' : '10'}
        fontWeight="700"
        fill={isNearAngle(0) ? activeCardinalColor : textMain}
      >
        T (0°)
      </text>
      <text
        x={clockCx + clockR + 14}
        y={clockCy + 3}
        textAnchor="middle"
        fontSize={isNearAngle(90) ? '11' : '10'}
        fontWeight="700"
        fill={isNearAngle(90) ? activeCardinalColor : textMain}
      >
        R
      </text>
      <text
        x={clockCx}
        y={clockCy + clockR + 18}
        textAnchor="middle"
        fontSize={isNearAngle(180) ? '11' : '10'}
        fontWeight="700"
        fill={isNearAngle(180) ? activeCardinalColor : textMain}
      >
        B (180°)
      </text>
      <text
        x={clockCx - clockR - 14}
        y={clockCy + 3}
        textAnchor="middle"
        fontSize={isNearAngle(270) ? '11' : '10'}
        fontWeight="700"
        fill={isNearAngle(270) ? activeCardinalColor : textMain}
      >
        L
      </text>

      {/* Offset Motor Center Dot */}
      <circle
        cx={clockCx + endOffsetX}
        cy={clockCy + endOffsetY}
        r="7"
        fill={motorLineColor}
        opacity="0.85"
      />
      <circle cx={clockCx} cy={clockCy} r="3" fill={centerLineColor} />

      {/* Rotating Indicator Arm */}
      <line
        x1={clockCx}
        y1={clockCy}
        x2={armX}
        y2={armY}
        stroke={isDark ? '#34d399' : '#059669'}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx={armX}
        cy={armY}
        r="5.5"
        fill={isDark ? '#34d399' : '#059669'}
        stroke={cardBg}
        strokeWidth="1.5"
      />

      {/* Legend */}
      <text
        x={clockCx + 3}
        y="246"
        textAnchor="middle"
        fontSize="9"
        fill={textSub}
      >
        Blue: Pump Center • {solution.isAligned ? 'Green' : 'Amber'}: Motor Hub
      </text>
    </svg>
  );
}

interface LaserAlignmentPanelProps {
  solution: AlignmentSolution;
  rpm: number;
  shaftAngleDeg?: number;
}

export function LaserAlignmentPanel({
  solution,
  rpm,
  shaftAngleDeg = 0,
}: LaserAlignmentPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bg = isDark ? '#0f172a' : '#f8fafc';
  const grid = isDark ? '#334155' : '#cbd5e1';
  const textMuted = isDark ? '#94a3b8' : '#64748b';

  // Map coupling offsets to PSD target crosshair (-22..+22 px)
  const clampPx = (v: number) => Math.max(-22, Math.min(22, v * 35));
  const dotX = 56 + clampPx(solution.horizontalOffsetMm);
  const dotY = 56 - clampPx(solution.verticalOffsetMm);

  // Rotating laser sweep phase marker on outer 30px ring
  const phaseRad = ((shaftAngleDeg - 90) * Math.PI) / 180;
  const phaseX = 56 + 30 * Math.cos(phaseRad);
  const phaseY = 56 + 30 * Math.sin(phaseRad);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* PSD Laser Target */}
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-1 flex w-full items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              PSD Laser Target
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                solution.isAligned
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
              }`}
            >
              {solution.isAligned ? 'LOCKED' : 'LIVE BEAM'}
            </span>
          </div>
          <svg viewBox="0 0 112 112" className="h-32 w-32">
            <rect
              x="6"
              y="6"
              width="100"
              height="100"
              rx="10"
              fill={bg}
              stroke={grid}
              strokeWidth="1.5"
            />
            <circle
              cx="56"
              cy="56"
              r="14"
              fill="none"
              stroke={isDark ? '#34d399' : '#059669'}
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <circle
              cx="56"
              cy="56"
              r="30"
              fill="none"
              stroke={grid}
              strokeWidth="1"
            />
            <line x1="12" y1="56" x2="100" y2="56" stroke={grid} />
            <line x1="56" y1="12" x2="56" y2="100" stroke={grid} />
            <text x="56" y="18" textAnchor="middle" fontSize="8" fill={textMuted}>
              +V
            </text>
            <text x="94" y="53" textAnchor="middle" fontSize="8" fill={textMuted}>
              +H
            </text>
            {/* Synchronized Laser Sweep Phase Marker */}
            <circle
              cx={phaseX}
              cy={phaseY}
              r="3"
              fill={isDark ? '#38bdf8' : '#0284c7'}
            />
            {/* Laser beam spot */}
            <circle
              cx={dotX}
              cy={dotY}
              r="7"
              fill="#f43f5e"
              opacity="0.28"
            />
            <circle
              cx={dotX}
              cy={dotY}
              r="3.5"
              fill={solution.isAligned ? '#10b981' : '#f43f5e'}
            />
          </svg>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Target Zone: ISO {rpm} RPM
          </div>
        </div>

        {/* Live Laser Coupling Readout */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Dual-Laser Coupling Readout
          </div>
          <div className="my-2 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">V-Offset</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {solution.verticalOffsetMm >= 0 ? '+' : ''}
                {solution.verticalOffsetMm.toFixed(3)} mm
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">V-Angle</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {solution.verticalAngularityPer100 >= 0 ? '+' : ''}
                {solution.verticalAngularityPer100.toFixed(3)} /100
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">H-Offset</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {solution.horizontalOffsetMm >= 0 ? '+' : ''}
                {solution.horizontalOffsetMm.toFixed(3)} mm
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 dark:bg-slate-800">
              <span className="text-slate-500 dark:text-slate-400">H-Angle</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {solution.horizontalAngularityPer100 >= 0 ? '+' : ''}
                {solution.horizontalAngularityPer100.toFixed(3)} /100
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
