import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { degToRad, radToDeg } from '../../physics';
import {
  computeElementLoads,
  type BearingHealthState,
  type BearingMetrics,
  type BearingSpec,
  type FitClassification,
} from './bearingData';

interface BearingVisualProps {
  spec: BearingSpec;
  metrics: BearingMetrics;
  Fr: number;
  Fa: number;
  rpm: number;
  rotationRad: number;
  healthState?: BearingHealthState;
}

function getLoadColor(normLoad: number, isDark: boolean): string {
  if (normLoad < 0.08) {
    return isDark ? '#475569' : '#cbd5e1'; // unloaded
  }
  if (normLoad < 0.35) {
    return isDark ? '#8b5cf6' : '#7c3aed'; // light load (violet)
  }
  if (normLoad < 0.68) {
    return isDark ? '#f59e0b' : '#d97706'; // moderate load (amber)
  }
  return isDark ? '#fb7185' : '#e11d48'; // peak load (rose/red)
}

function getFitStroke(cls: FitClassification, isDark: boolean): string {
  switch (cls) {
    case 'Interference Fit':
      return isDark ? '#fb7185' : '#e11d48';
    case 'Transition Fit':
      return isDark ? '#fbbf24' : '#d97706';
    case 'Clearance Fit':
      return isDark ? '#38bdf8' : '#0284c7';
  }
}

function shortestAngleDiff(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

export function BearingVisual({
  spec,
  metrics,
  Fr,
  Fa,
  rpm,
  rotationRad,
  healthState = 'healthy',
}: BearingVisualProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = useMemo(
    () => ({
      bg: isDark ? '#0f172a' : '#f8fafc',
      cardStroke: isDark ? '#1e293b' : '#e2e8f0',
      housing: isDark ? '#1e293b' : '#e2e8f0',
      housingStroke: isDark ? '#475569' : '#94a3b8',
      ring: isDark ? '#334155' : '#cbd5e1',
      ringStroke: isDark ? '#64748b' : '#64748b',
      raceway: isDark ? '#1e293b' : '#f1f5f9',
      shaft: isDark ? '#475569' : '#94a3b8',
      shaftInner: isDark ? '#334155' : '#cbd5e1',
      cage: isDark ? '#d97706' : '#b45309',
      text: isDark ? '#e2e8f0' : '#0f172a',
      muted: isDark ? '#94a3b8' : '#475569',
      forceFr: isDark ? '#fb7185' : '#e11d48',
      forceFa: isDark ? '#38bdf8' : '#0284c7',
      loadZone: isDark ? 'rgba(251, 113, 133, 0.14)' : 'rgba(225, 29, 72, 0.09)',
      lubeGlow: isDark ? 'rgba(249, 115, 22, 0.25)' : 'rgba(234, 88, 12, 0.2)',
    }),
    [isDark]
  );

  // Front view geometry
  const cx = 175;
  const cy = 165;
  const rHousing = 124;
  const rOuter = 108;
  const rOuterRace = 90;
  const rPitch = 71;
  const rInnerRace = 52;
  const rShaft = 36;

  // Exact kinematic ratios from bearing geometry
  const cosAlpha = Math.cos(degToRad(spec.contactAngleDeg));
  const lambda = (spec.elementDiameterMm / spec.pitchDiameterMm) * cosAlpha;
  const ftfRatio = 0.5 * (1 - lambda);
  const bsfRatio =
    (spec.pitchDiameterMm / (2 * spec.elementDiameterMm)) *
    (1 - lambda * lambda);

  const cageRad = rotationRad * ftfRatio;
  const spinDeg = radToDeg(rotationRad * bsfRatio);
  const loadRatio = Math.min(1.5, metrics.P / (spec.C * 0.35));

  const elements = useMemo(
    () =>
      computeElementLoads(
        spec.numElements,
        cageRad,
        metrics.fit.clearanceReductionUm,
        loadRatio
      ),
    [spec.numElements, cageRad, metrics.fit.clearanceReductionUm, loadRatio]
  );

  const elementRadius =
    spec.category === 'deep-groove-ball'
      ? 15.5
      : spec.category === 'cylindrical-roller'
        ? 12.5
        : 10.5;

  const shaftFitStroke = getFitStroke(metrics.fit.shaft.classification, isDark);
  const housingFitStroke = getFitStroke(
    metrics.fit.housing.classification,
    isDark
  );

  const shaftDeg = radToDeg(rotationRad);

  // Synchronized defect contact detection
  const bpfoDefectAngle = Math.PI / 2; // 6 o'clock on stationary outer race
  const bpfiDefectAngle = rotationRad; // rotates with inner race
  const bpfoHitIntensity =
    healthState === 'bpfo'
      ? elements.reduce((best, el) => {
          const diff = shortestAngleDiff(el.angleRad, bpfoDefectAngle);
          return diff < 0.16 ? Math.max(best, 1 - diff / 0.16) : best;
        }, 0)
      : 0;

  const bpfiHitIntensity =
    healthState === 'bpfi'
      ? elements.reduce((best, el) => {
          const diff = shortestAngleDiff(el.angleRad, bpfiDefectAngle);
          return diff < 0.16 ? Math.max(best, 1 - diff / 0.16) : best;
        }, 0)
      : 0;

  const bpfiDx = cx + rInnerRace * Math.cos(bpfiDefectAngle);
  const bpfiDy = cy + rInnerRace * Math.sin(bpfiDefectAngle);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      {/* Front View: Rotating Bearing & Load Zone */}
      <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Front View — Load Zone &amp; FTF/BSF Kinematics
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {spec.designation} · {rpm.toLocaleString()} RPM
          </span>
        </div>

        <svg
          viewBox="0 0 350 335"
          className="h-auto w-full max-h-[340px]"
          role="img"
          aria-label={`Animated ${spec.name} front view showing rolling element load zone`}
        >
          <defs>
            <radialGradient id="ballUnloaded" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="55%" stopColor={isDark ? '#64748b' : '#cbd5e1'} />
              <stop offset="100%" stopColor={isDark ? '#334155' : '#94a3b8'} />
            </radialGradient>
            <radialGradient id="ballLight" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ede9fe" />
              <stop offset="55%" stopColor={isDark ? '#8b5cf6' : '#7c3aed'} />
              <stop offset="100%" stopColor="#4c1d95" />
            </radialGradient>
            <radialGradient id="ballMod" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="55%" stopColor={isDark ? '#f59e0b' : '#d97706'} />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
            <radialGradient id="ballPeak" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="55%" stopColor={isDark ? '#fb7185' : '#e11d48'} />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>
            <radialGradient id="ringSteelGrad" cx="45%" cy="40%" r="65%">
              <stop offset="0%" stopColor={isDark ? '#475569' : '#e2e8f0'} />
              <stop offset="100%" stopColor={isDark ? '#1e293b' : '#cbd5e1'} />
            </radialGradient>
          </defs>

          {/* ISO Centerlines */}
          <line x1={cx - rHousing - 12} y1={cy} x2={cx + rHousing + 12} y2={cy} stroke={colors.muted} strokeWidth={0.8} strokeDasharray="10 3 2 3" opacity={0.45} />
          <line x1={cx} y1={cy - rHousing - 8} x2={cx} y2={cy + rHousing + 8} stroke={colors.muted} strokeWidth={0.8} strokeDasharray="10 3 2 3" opacity={0.45} />

          {/* Load zone highlight wedge at bottom */}
          <path
            d={`M ${cx} ${cy} L ${cx - 88} ${cy + 58} A 106 106 0 0 0 ${cx + 88} ${cy + 58} Z`}
            fill={colors.loadZone}
          />

          {/* Housing */}
          <circle
            cx={cx}
            cy={cy}
            r={rHousing}
            fill={colors.housing}
            stroke={colors.housingStroke}
            strokeWidth={2}
          />

          {/* Outer Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill="url(#ringSteelGrad)"
            stroke={housingFitStroke}
            strokeWidth={2.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={rOuterRace}
            fill={colors.raceway}
            stroke={
              healthState === 'lube-starvation' ? '#f97316' : colors.ringStroke
            }
            strokeWidth={healthState === 'lube-starvation' ? 2.5 : 1.5}
          />

          {/* Thermal lubrication starvation glow ring */}
          {healthState === 'lube-starvation' && (
            <circle
              cx={cx}
              cy={cy}
              r={rPitch}
              fill="none"
              stroke={colors.lubeGlow}
              strokeWidth={26}
            />
          )}

          {/* Cage Pitch Circle (rotates at FTF) */}
          <g transform={`rotate(${radToDeg(cageRad)}, ${cx}, ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={rPitch}
              fill="none"
              stroke={colors.cage}
              strokeWidth={1.6}
              strokeDasharray="6 4"
            />
          </g>

          {/* Rolling Elements (orbit at FTF, spin on own axis at BSF) */}
          {elements.map((el, idx) => {
            const ex = cx + rPitch * Math.cos(el.angleRad);
            const ey = cy + rPitch * Math.sin(el.angleRad);
            const fill =
              el.normLoad < 0.08
                ? 'url(#ballUnloaded)'
                : el.normLoad < 0.35
                  ? 'url(#ballLight)'
                  : el.normLoad < 0.68
                    ? 'url(#ballMod)'
                    : 'url(#ballPeak)';
            const orbitalDeg = radToDeg(el.angleRad) + 90;

            if (spec.category === 'deep-groove-ball') {
              return (
                <g key={idx} transform={`translate(${ex}, ${ey})`}>
                  <circle
                    cx={0}
                    cy={0}
                    r={elementRadius}
                    fill={fill}
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    strokeWidth={1.5}
                  />
                  {/* BSF spin marker */}
                  <g transform={`rotate(${spinDeg + idx * 35})`}>
                    <line
                      x1={-elementRadius * 0.55}
                      y1={0}
                      x2={elementRadius * 0.55}
                      y2={0}
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                    />
                  </g>
                  <circle
                    cx={-4}
                    cy={-4}
                    r={3.2}
                    fill="rgba(255,255,255,0.35)"
                  />
                </g>
              );
            }

            // Roller end-profile (cylindrical / tapered / spherical)
            return (
              <g
                key={idx}
                transform={`translate(${ex}, ${ey}) rotate(${orbitalDeg})`}
              >
                {spec.category === 'tapered-roller' ? (
                  <polygon
                    points={`${-elementRadius * 0.72},${-elementRadius * 1.1} ${elementRadius * 0.72},${-elementRadius * 1.1} ${elementRadius * 0.95},${elementRadius * 1.1} ${-elementRadius * 0.95},${elementRadius * 1.1}`}
                    fill={fill}
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    strokeWidth={1.4}
                  />
                ) : (
                  <rect
                    x={-elementRadius * 0.85}
                    y={-elementRadius * 1.1}
                    width={elementRadius * 1.7}
                    height={elementRadius * 2.2}
                    rx={spec.category === 'spherical-roller' ? 6 : 2.5}
                    fill={fill}
                    stroke={isDark ? '#0f172a' : '#ffffff'}
                    strokeWidth={1.4}
                  />
                )}
                {/* BSF spin mark */}
                <g transform={`rotate(${spinDeg + idx * 27})`}>
                  <circle cx={0} cy={-elementRadius * 0.35} r={1.8} fill="rgba(255,255,255,0.55)" />
                </g>
              </g>
            );
          })}

          {/* Inner Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={rInnerRace}
            fill={colors.ring}
            stroke={
              healthState === 'lube-starvation' ? '#f97316' : colors.ringStroke
            }
            strokeWidth={healthState === 'lube-starvation' ? 2.2 : 1.5}
          />

          {/* Shaft (rotates at shaftDeg) */}
          <g transform={`rotate(${shaftDeg}, ${cx}, ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={rShaft}
              fill={colors.shaft}
              stroke={shaftFitStroke}
              strokeWidth={2.5}
            />
            <circle
              cx={cx}
              cy={cy}
              r={rShaft - 10}
              fill={colors.shaftInner}
              stroke="none"
            />
            {/* Keyway / rotation marker */}
            <rect
              x={cx - 4}
              y={cy - rShaft + 1}
              width={8}
              height={9}
              rx={1.5}
              fill={isDark ? '#a78bfa' : '#7c3aed'}
            />
            <line
              x1={cx - 12}
              y1={cy}
              x2={cx + 12}
              y2={cy}
              stroke={colors.muted}
              strokeWidth={1.2}
            />
            <line
              x1={cx}
              y1={cy - 12}
              x2={cx}
              y2={cy + 12}
              stroke={colors.muted}
              strokeWidth={1.2}
            />
          </g>

          {/* Outer Race Defect (BPFO) Marker & Synchronized Shock-Pulse Flash at 6 o'clock */}
          {healthState === 'bpfo' && (
            <g>
              <circle
                cx={cx}
                cy={cy + rOuterRace}
                r={5.5}
                fill="#e11d48"
                stroke="#ffffff"
                strokeWidth={1.2}
              />
              {bpfoHitIntensity > 0.05 && (
                <circle
                  cx={cx}
                  cy={cy + rOuterRace}
                  r={8 + bpfoHitIntensity * 14}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth={2.5}
                  opacity={bpfoHitIntensity}
                />
              )}
            </g>
          )}

          {/* Inner Race Defect (BPFI) Marker & Synchronized Shock-Pulse Flash (orbits with shaft) */}
          {healthState === 'bpfi' && (
            <g>
              <circle
                cx={bpfiDx}
                cy={bpfiDy}
                r={5.5}
                fill="#7c3aed"
                stroke="#ffffff"
                strokeWidth={1.2}
              />
              {bpfiHitIntensity > 0.05 && (
                <circle
                  cx={bpfiDx}
                  cy={bpfiDy}
                  r={8 + bpfiHitIntensity * 14}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  opacity={bpfiHitIntensity}
                />
              )}
            </g>
          )}

          {/* Radial Load Fr Vector (at top pushing shaft down into bottom load zone) */}
          <line
            x1={cx}
            y1={12}
            x2={cx}
            y2={48}
            stroke={colors.forceFr}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <polygon
            points={`${cx},54 ${cx - 6},43 ${cx + 6},43`}
            fill={colors.forceFr}
          />
          <text
            x={cx + 10}
            y={26}
            fill={colors.forceFr}
            fontSize="12"
            fontWeight="700"
          >
            Fr = {Fr.toFixed(1)} kN
          </text>

          {/* Load zone label at bottom */}
          <text
            x={cx}
            y={316}
            textAnchor="middle"
            fill={colors.muted}
            fontSize="11"
            fontWeight="600"
          >
            Peak Load Zone (Qmax ≈ {metrics.qMax.toFixed(2)} kN/element)
          </text>

          {/* Legend */}
          <g transform="translate(12, 12)">
            <circle cx={6} cy={6} r={5} fill={getLoadColor(0.02, isDark)} />
            <text x={15} y={10} fill={colors.muted} fontSize="10">
              Unloaded
            </text>
            <circle cx={6} cy={22} r={5} fill={getLoadColor(0.5, isDark)} />
            <text x={15} y={26} fill={colors.muted} fontSize="10">
              Loaded
            </text>
            <circle cx={6} cy={38} r={5} fill={getLoadColor(0.9, isDark)} />
            <text x={15} y={42} fill={colors.muted} fontSize="10">
              Peak Qmax
            </text>
          </g>
        </svg>
      </div>

      {/* Axial Cross-Section & Fit Interface */}
      <div className="xl:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Cross-Section &amp; ISO Fit Zones
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            d={spec.d} · D={spec.D} · B={spec.B} mm
          </span>
        </div>

        <svg
          viewBox="0 0 280 235"
          className="h-auto w-full"
          role="img"
          aria-label="Axial cross-section showing shaft fit and housing fit"
        >
          <defs>
            <pattern id="isoHatch45" width="7" height="7" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="7" stroke={isDark ? '#64748b' : '#64748b'} strokeWidth="1.2" opacity="0.45" />
            </pattern>
            <pattern id="isoHatchNeg45" width="7" height="7" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="7" stroke={isDark ? '#94a3b8' : '#475569'} strokeWidth="1.2" opacity="0.38" />
            </pattern>
          </defs>

          {/* Housing block with ISO -45° section hatching */}
          <rect
            x={55}
            y={18}
            width={170}
            height={28}
            rx={3}
            fill={colors.housing}
            stroke={colors.housingStroke}
            strokeWidth={1.5}
          />
          <rect
            x={55}
            y={18}
            width={170}
            height={28}
            rx={3}
            fill="url(#isoHatchNeg45)"
          />
          <rect
            x={78}
            y={22}
            width={124}
            height={19}
            rx={4}
            fill={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
          />
          <text
            x={140}
            y={35}
            textAnchor="middle"
            fill={colors.text}
            fontSize="11"
            fontWeight="600"
          >
            Housing ({metrics.fit.housing.code})
          </text>

          {/* Housing Fit Interface Line */}
          <line
            x1={65}
            y1={46}
            x2={215}
            y2={46}
            stroke={housingFitStroke}
            strokeWidth={3.5}
          />

          {/* Distinct Cross-Section Raceway & Rolling Element Geometry with ISO 45° Hatching */}
          {spec.category === 'deep-groove-ball' && (
            <g>
              {/* Outer ring with deep groove shoulders */}
              <path
                d="M 75,48 L 205,48 L 205,74 L 166,74 Q 140,62 114,74 L 75,74 Z"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <path
                d="M 75,48 L 205,48 L 205,74 L 166,74 Q 140,62 114,74 L 75,74 Z"
                fill="url(#isoHatch45)"
              />
              {/* Ball */}
              <circle
                cx={140}
                cy={92}
                r={21}
                fill="url(#ballPeak)"
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={1.5}
              />
              {/* Inner ring with deep groove shoulders */}
              <path
                d="M 75,110 L 114,110 Q 140,122 166,110 L 205,110 L 205,136 L 75,136 Z"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <path
                d="M 75,110 L 114,110 Q 140,122 166,110 L 205,110 L 205,136 L 75,136 Z"
                fill="url(#isoHatch45)"
              />
            </g>
          )}

          {spec.category === 'cylindrical-roller' && (
            <g>
              {/* Outer ring with integral outer ribs (NU design) */}
              <path
                d="M 75,48 L 205,48 L 205,82 L 176,82 L 176,70 L 104,70 L 104,82 L 75,82 Z"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <path
                d="M 75,48 L 205,48 L 205,82 L 176,82 L 176,70 L 104,70 L 104,82 L 75,82 Z"
                fill="url(#isoHatch45)"
              />
              {/* Cylindrical roller */}
              <rect
                x={108}
                y={72}
                width={64}
                height={40}
                rx={4}
                fill="url(#ballPeak)"
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={1.5}
              />
              {/* Rib-less inner ring (allows free axial float) */}
              <rect
                x={75}
                y={114}
                width={130}
                height={22}
                rx={2}
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <rect
                x={75}
                y={114}
                width={130}
                height={22}
                rx={2}
                fill="url(#isoHatch45)"
              />
            </g>
          )}

          {spec.category === 'tapered-roller' && (
            <g>
              {/* Tapered cup (outer ring) */}
              <polygon
                points="75,48 205,48 205,66 75,74"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <polygon
                points="75,48 205,48 205,66 75,74"
                fill="url(#isoHatch45)"
              />
              {/* Tapered roller */}
              <polygon
                points="105,76 175,69 175,114 105,107"
                fill="url(#ballPeak)"
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={1.5}
              />
              {/* Tapered cone (inner ring) with large-end thrust rib */}
              <polygon
                points="75,110 103,110 176,117 176,102 205,102 205,136 75,136"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <polygon
                points="75,110 103,110 176,117 176,102 205,102 205,136 75,136"
                fill="url(#isoHatch45)"
              />
            </g>
          )}

          {spec.category === 'spherical-roller' && (
            <g>
              {/* Spherical outer raceway */}
              <path
                d="M 75,48 L 205,48 L 205,76 Q 140,60 75,76 Z"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <path
                d="M 75,48 L 205,48 L 205,76 Q 140,60 75,76 Z"
                fill="url(#isoHatch45)"
              />
              {/* Double-row barrel rollers */}
              <ellipse
                cx={118}
                cy={92}
                rx={18}
                ry={19}
                transform="rotate(-12 118 92)"
                fill="url(#ballPeak)"
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={1.5}
              />
              <ellipse
                cx={162}
                cy={92}
                rx={18}
                ry={19}
                transform="rotate(12 162 92)"
                fill="url(#ballPeak)"
                stroke={isDark ? '#0f172a' : '#ffffff'}
                strokeWidth={1.5}
              />
              {/* Inner ring with center guide rib */}
              <path
                d="M 75,112 L 135,112 L 135,102 L 145,102 L 145,112 L 205,112 L 205,136 L 75,136 Z"
                fill={colors.ring}
                stroke={colors.ringStroke}
                strokeWidth={1.5}
              />
              <path
                d="M 75,112 L 135,112 L 135,102 L 145,102 L 145,112 L 205,112 L 205,136 L 75,136 Z"
                fill="url(#isoHatch45)"
              />
            </g>
          )}

          {/* Shaft Fit Interface Line */}
          <line
            x1={65}
            y1={137}
            x2={215}
            y2={137}
            stroke={shaftFitStroke}
            strokeWidth={3.5}
          />

          {/* Shaft */}
          <rect
            x={25}
            y={139}
            width={230}
            height={36}
            rx={3}
            fill={colors.shaft}
            stroke={colors.ringStroke}
            strokeWidth={1.5}
          />
          {/* Shaft centerline */}
          <line
            x1={15}
            y1={164}
            x2={265}
            y2={164}
            stroke={colors.muted}
            strokeWidth={1.2}
            strokeDasharray="8 4 2 4"
          />
          <text
            x={140}
            y={155}
            textAnchor="middle"
            fill={isDark ? '#f8fafc' : '#0f172a'}
            fontSize="11"
            fontWeight="600"
          >
            Shaft ({metrics.fit.shaft.code})
          </text>

          {/* Axial Load Fa Arrow */}
          {Fa > 0.05 && (
            <g>
              <line
                x1={22}
                y1={125}
                x2={64}
                y2={125}
                stroke={colors.forceFa}
                strokeWidth={2.5}
              />
              <polygon
                points="70,125 60,120 60,130"
                fill={colors.forceFa}
              />
              <text
                x={20}
                y={115}
                fill={colors.forceFa}
                fontSize="10.5"
                fontWeight="700"
              >
                Fa = {Fa.toFixed(1)} kN
              </text>
            </g>
          )}

          {/* Fit Callouts */}
          <text
            x={140}
            y={198}
            textAnchor="middle"
            fill={shaftFitStroke}
            fontSize="10"
            fontWeight="600"
          >
            Shaft {metrics.fit.shaft.code}: {metrics.fit.shaft.minClearanceUm} to{' '}
            {metrics.fit.shaft.maxClearanceUm > 0
              ? `+${metrics.fit.shaft.maxClearanceUm}`
              : metrics.fit.shaft.maxClearanceUm}{' '}
            µm · {metrics.fit.shaft.classification}
          </text>
          <text
            x={140}
            y={216}
            textAnchor="middle"
            fill={housingFitStroke}
            fontSize="10"
            fontWeight="600"
          >
            Housing {metrics.fit.housing.code}:{' '}
            {metrics.fit.housing.minClearanceUm > 0
              ? `+${metrics.fit.housing.minClearanceUm}`
              : metrics.fit.housing.minClearanceUm}{' '}
            to{' '}
            {metrics.fit.housing.maxClearanceUm > 0
              ? `+${metrics.fit.housing.maxClearanceUm}`
              : metrics.fit.housing.maxClearanceUm}{' '}
            µm · {metrics.fit.housing.classification}
          </text>
        </svg>

        <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
          <div className="flex items-center justify-between font-medium">
            <span>Est. Radial Clearance Loss:</span>
            <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">
              {metrics.fit.clearanceReductionUm} µm
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {spec.notes}
          </p>
        </div>
      </div>
    </div>
  );
}
