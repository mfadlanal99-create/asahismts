import { useTheme } from '../../context/ThemeContext';
import { degToRad } from '../../physics';
import type { BalancingSolution, PolarVector } from './couplingTypes';

interface RotorDiskSvgProps {
  spinAngleDeg: number;
  isPlaying: boolean;
  rpm: number;
  activeVibrationMmS: number;
  heavySpotDeg: number;
  hasInitialRun: boolean;
  isTrialInstalled: boolean;
  trialMassG: number;
  trialAngleDeg: number;
  isCorrectionApplied: boolean;
  corrMassG: number;
  corrAngleDeg: number;
}

function polarPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = degToRad(deg - 90);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function RotorDiskSvg({
  spinAngleDeg,
  isPlaying,
  rpm,
  activeVibrationMmS,
  heavySpotDeg,
  hasInitialRun,
  isTrialInstalled,
  trialMassG,
  trialAngleDeg,
  isCorrectionApplied,
  corrMassG,
  corrAngleDeg,
}: RotorDiskSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cx = 160;
  const cy = 164;
  const diskR = 92;

  // Subtle orbit displacement when spinning and unbalanced
  const orbitAmp =
    isPlaying && hasInitialRun ? Math.min(7, activeVibrationMmS * 0.65) : 0;
  const orbitRad = degToRad(spinAngleDeg);
  const dx = orbitAmp * Math.cos(orbitRad);
  const dy = orbitAmp * Math.sin(orbitRad);

  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);

  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const ringStroke = isDark ? '#334155' : '#cbd5e1';
  const diskStroke = isDark ? '#475569' : '#94a3b8';
  const textFill = isDark ? '#cbd5e1' : '#334155';
  const mutedFill = isDark ? '#64748b' : '#94a3b8';

  const trialPos = polarPoint(0, 0, diskR - 18, trialAngleDeg);
  const corrPos = polarPoint(0, 0, diskR - 18, corrAngleDeg);
  // Heavy spot positioned at -heavySpotDeg so it passes 0° (top) when spinAngleDeg ≡ heavySpotDeg
  const heavyPos = polarPoint(0, 0, diskR - 36, -heavySpotDeg);

  // Optical TACH pulse flash when 0° REF passes top sensor (or heavy spot passes top)
  const modSpin = ((spinAngleDeg % 360) + 360) % 360;
  const tachDist = Math.min(modSpin, 360 - modSpin);
  const isTachFlash = isPlaying && tachDist < 18;
  const hsDist = Math.min(
    Math.abs(modSpin - heavySpotDeg),
    360 - Math.abs(modSpin - heavySpotDeg)
  );
  const isHeavyAtTop = hasInitialRun && isPlaying && hsDist < 18;

  return (
    <svg
      viewBox="0 0 320 320"
      className="h-auto w-full max-w-[320px] select-none"
      aria-label="Animated balancing rotor disk with 0 to 360 degree ring"
    >
      <defs>
        <radialGradient id="rotor-disk-grad" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor={isDark ? '#334155' : '#ffffff'} />
          <stop offset="65%" stopColor={isDark ? '#1e293b' : '#f1f5f9'} />
          <stop offset="100%" stopColor={isDark ? '#0f172a' : '#cbd5e1'} />
        </radialGradient>
        <linearGradient id="rotor-hub-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isDark ? '#64748b' : '#e2e8f0'} />
          <stop offset="100%" stopColor={isDark ? '#334155' : '#94a3b8'} />
        </linearGradient>
      </defs>
      <rect
        x={0}
        y={0}
        width={320}
        height={320}
        rx={16}
        fill={bgFill}
        stroke={ringStroke}
        strokeWidth={1}
      />

      {/* Stationary 0-360° Protractor Ring */}
      <circle
        cx={cx}
        cy={cy}
        r={diskR + 24}
        fill="none"
        stroke={ringStroke}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />

      {/* Optical Tachometer / Phase Sensor at Top-Right of 0° */}
      <g transform={`translate(${cx + 34}, ${cy - diskR - 46})`}>
        {isTachFlash && (
          <circle
            cx={0}
            cy={0}
            r={16}
            fill="#a855f7"
            opacity={0.35}
          />
        )}
        <rect
          x={-16}
          y={-7}
          width={32}
          height={14}
          rx={3}
          fill={isTachFlash ? '#7c3aed' : isDark ? '#312e81' : '#ede9fe'}
          stroke={isTachFlash ? '#c4b5fd' : '#7c3aed'}
          strokeWidth={isTachFlash ? 2 : 1.2}
        />
        <text
          x={0}
          y={0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={7.5}
          fontWeight={700}
          fill={isTachFlash ? '#ffffff' : '#7c3aed'}
        >
          TACH
        </text>
        <line
          x1={-8}
          y1={7}
          x2={-34}
          y2={46}
          stroke={isTachFlash ? '#c084fc' : '#7c3aed'}
          strokeWidth={isTachFlash ? 2.4 : 1.3}
          strokeDasharray={isTachFlash ? undefined : '2 2'}
          opacity={isTachFlash ? 1 : 0.75}
        />
        {isTachFlash && (
          <circle cx={-34} cy={46} r={4.5} fill="#c084fc" />
        )}
      </g>

      {ticks.map((deg) => {
        const isMajor = deg % 90 === 0;
        const isMed = deg % 45 === 0;
        const p1 = polarPoint(cx, cy, diskR + 14, deg);
        const p2 = polarPoint(
          cx,
          cy,
          diskR + (isMajor ? 24 : isMed ? 20 : 17),
          deg
        );
        const labelPt = polarPoint(cx, cy, diskR + 36, deg);

        return (
          <g key={deg}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={isMajor ? '#7c3aed' : mutedFill}
              strokeWidth={isMajor ? 2 : 1}
            />
            {isMajor && (
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill={textFill}
              >
                {deg}°
              </text>
            )}
          </g>
        );
      })}

      {/* Rotating Rotor Disk */}
      <g transform={`translate(${cx + dx}, ${cy + dy}) rotate(${spinAngleDeg})`}>
        <circle
          cx={0}
          cy={0}
          r={diskR}
          fill="url(#rotor-disk-grad)"
          stroke={diskStroke}
          strokeWidth={2.5}
        />
        {/* Machined inner recess step */}
        <circle
          cx={0}
          cy={0}
          r={diskR - 9}
          fill="none"
          stroke={ringStroke}
          strokeWidth={1}
          opacity={0.7}
        />
        {/* Weight-mounting bolt circle */}
        <circle
          cx={0}
          cy={0}
          r={diskR - 18}
          fill="none"
          stroke={ringStroke}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {/* 12 mounting holes every 30 deg */}
        {Array.from({ length: 12 }, (_, idx) => {
          const pt = polarPoint(0, 0, diskR - 18, idx * 30);
          return (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill={isDark ? '#0f172a' : '#e2e8f0'}
              stroke={mutedFill}
              strokeWidth={1}
            />
          );
        })}

        {/* 0° Reference Keyway & Reflective Tape */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-diskR}
          stroke="#7c3aed"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.75}
        />
        <rect
          x={-4}
          y={-diskR + 1}
          width={8}
          height={10}
          rx={1.5}
          fill="#8b5cf6"
        />
        <text
          x={0}
          y={-diskR + 22}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill="#7c3aed"
        >
          0° REF
        </text>

        {/* Heavy Spot Marker (passes 0° top when 1X sine hits positive peak) */}
        {hasInitialRun && activeVibrationMmS > 0.4 && (
          <g transform={`translate(${heavyPos.x}, ${heavyPos.y})`}>
            <circle
              r={isHeavyAtTop ? 10 : 7}
              fill="#f43f5e"
              opacity={isHeavyAtTop ? 0.35 : 0.2}
            />
            <circle
              r={5.5}
              fill="#f43f5e"
              stroke="#ffffff"
              strokeWidth={1.2}
            />
            <text
              y={-9}
              textAnchor="middle"
              fontSize={7.5}
              fontWeight={700}
              fill="#f43f5e"
            >
              HS
            </text>
          </g>
        )}

        {/* Trial Weight Marker */}
        {isTrialInstalled && (
          <g transform={`translate(${trialPos.x}, ${trialPos.y})`}>
            <circle
              r={10}
              fill="#0284c7"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              y={0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fontWeight={700}
              fill="#ffffff"
            >
              {trialMassG}g
            </text>
          </g>
        )}

        {/* Correction Weight Marker */}
        {isCorrectionApplied && (
          <g transform={`translate(${corrPos.x}, ${corrPos.y})`}>
            <circle
              r={11}
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth={1.8}
            />
            <text
              y={0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8}
              fontWeight={700}
              fill="#ffffff"
            >
              {corrMassG.toFixed(0)}g
            </text>
          </g>
        )}

        {/* Shaft & Keyway Center */}
        <circle
          cx={0}
          cy={0}
          r={20}
          fill="url(#rotor-hub-grad)"
          stroke={diskStroke}
          strokeWidth={2}
        />
        <rect
          x={-4}
          y={-23}
          width={8}
          height={7}
          fill={isDark ? '#94a3b8' : '#475569'}
        />
        <circle cx={0} cy={0} r={5} fill="#7c3aed" />
      </g>

      {/* Bottom RPM Pill */}
      <g transform="translate(12, 290)">
        <rect
          width={92}
          height={20}
          rx={6}
          fill={isDark ? '#1e293b' : '#ffffff'}
          stroke={ringStroke}
        />
        <text
          x={46}
          y={10.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight={600}
          fill={textFill}
        >
          {isPlaying ? `${rpm} RPM` : 'PAUSED'}
        </text>
      </g>
    </svg>
  );
}

interface PolarVectorPlotSvgProps {
  v0: PolarVector;
  solution: BalancingSolution;
  hasInitialRun: boolean;
  isTrialInstalled: boolean;
  isCorrectionApplied: boolean;
}

export function PolarVectorPlotSvg({
  v0,
  solution,
  hasInitialRun,
  isTrialInstalled,
  isCorrectionApplied,
}: PolarVectorPlotSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cx = 160;
  const cy = 160;
  const maxR = 112;

  const maxScaleMmS = Math.max(
    6,
    Math.ceil(Math.max(v0.mag, solution.v1.mag, solution.vRes.mag) * 1.18)
  );
  const scale = maxR / maxScaleMmS;

  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const gridStroke = isDark ? '#334155' : '#cbd5e1';
  const textFill = isDark ? '#cbd5e1' : '#334155';
  const mutedText = isDark ? '#94a3b8' : '#64748b';

  const zoneAR = Math.min(maxR, 1.4 * scale);
  const zoneBR = Math.min(maxR, 2.8 * scale);
  const zoneCR = Math.min(maxR, 4.5 * scale);

  const pV0 = polarPoint(cx, cy, Math.min(maxR, v0.mag * scale), v0.deg);
  const pV1 = polarPoint(
    cx,
    cy,
    Math.min(maxR, solution.v1.mag * scale),
    solution.v1.deg
  );
  const pVRes = polarPoint(
    cx,
    cy,
    Math.min(maxR, solution.vRes.mag * scale),
    solution.vRes.deg
  );

  const v0LabelX = Math.max(24, Math.min(296, pV0.x + (pV0.x >= cx ? 12 : -12)));
  const v0LabelY = Math.max(22, Math.min(286, pV0.y + (pV0.y >= cy ? 12 : -10)));
  const v1CloseToV0 = Math.hypot(pV1.x - pV0.x, pV1.y - pV0.y) < 26;
  const v1LabelX = Math.max(
    24,
    Math.min(296, pV1.x + (pV1.x >= cx ? 12 : -12) + (v1CloseToV0 ? 14 : 0))
  );
  const v1LabelY = Math.max(
    22,
    Math.min(286, pV1.y + (pV1.y >= cy ? 12 : -10) + (v1CloseToV0 ? -12 : 0))
  );

  return (
    <svg
      viewBox="0 0 320 320"
      className="h-auto w-full max-w-[320px] select-none"
      aria-label="Polar vibration vector plot with ISO 10816 zone rings"
    >
      <defs>
        <marker
          id="arrow-v0"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
        </marker>
        <marker
          id="arrow-v1"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#0284c7" />
        </marker>
        <marker
          id="arrow-vt"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#8b5cf6" />
        </marker>
        <marker
          id="arrow-vres"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
        </marker>
      </defs>

      <rect
        x={0}
        y={0}
        width={320}
        height={320}
        rx={16}
        fill={bgFill}
        stroke={gridStroke}
        strokeWidth={1}
      />

      {/* ISO Zone Rings */}
      <circle
        cx={cx}
        cy={cy}
        r={maxR}
        fill={isDark ? 'rgba(244,63,94,0.06)' : 'rgba(244,63,94,0.05)'}
        stroke={gridStroke}
        strokeWidth={1}
      />
      {zoneCR > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={zoneCR}
          fill={isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.06)'}
          stroke="#f59e0b"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
      )}
      {zoneBR > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={zoneBR}
          fill={isDark ? 'rgba(14,165,233,0.07)' : 'rgba(14,165,233,0.06)'}
          stroke="#0ea5e9"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
      )}
      {zoneAR > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={zoneAR}
          fill={isDark ? 'rgba(16,185,129,0.16)' : 'rgba(16,185,129,0.14)'}
          stroke="#10b981"
          strokeWidth={1.5}
        />
      )}

      {/* Crosshairs & Degree Labels */}
      {[0, 90, 180, 270].map((deg) => {
        const edge = polarPoint(cx, cy, maxR, deg);
        const lbl = polarPoint(cx, cy, maxR + 14, deg);
        return (
          <g key={deg}>
            <line
              x1={cx}
              y1={cy}
              x2={edge.x}
              y2={edge.y}
              stroke={gridStroke}
              strokeWidth={1}
            />
            <text
              x={lbl.x}
              y={lbl.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill={mutedText}
            >
              {deg}°
            </text>
          </g>
        );
      })}

      {/* V0 Vector */}
      {hasInitialRun && (
        <g>
          <line
            x1={cx}
            y1={cy}
            x2={pV0.x}
            y2={pV0.y}
            stroke="#f43f5e"
            strokeWidth={2.5}
            markerEnd="url(#arrow-v0)"
          />
          <rect
            x={v0LabelX - 11}
            y={v0LabelY - 8}
            width={22}
            height={14}
            rx={4}
            fill={bgFill}
            opacity={0.9}
          />
          <text
            x={v0LabelX}
            y={v0LabelY + 2}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="#f43f5e"
          >
            V0
          </text>
        </g>
      )}

      {/* V1 & Vt = V1 - V0 Vectors */}
      {hasInitialRun && isTrialInstalled && (
        <g>
          <line
            x1={cx}
            y1={cy}
            x2={pV1.x}
            y2={pV1.y}
            stroke="#0284c7"
            strokeWidth={2.5}
            markerEnd="url(#arrow-v1)"
          />
          <line
            x1={pV0.x}
            y1={pV0.y}
            x2={pV1.x}
            y2={pV1.y}
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="4 3"
            markerEnd="url(#arrow-vt)"
          />
          <rect
            x={v1LabelX - 11}
            y={v1LabelY - 8}
            width={22}
            height={14}
            rx={4}
            fill={bgFill}
            opacity={0.9}
          />
          <text
            x={v1LabelX}
            y={v1LabelY + 2}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="#0284c7"
          >
            V1
          </text>
        </g>
      )}

      {/* Vres Vector */}
      {hasInitialRun && isCorrectionApplied && (
        <g>
          <line
            x1={cx}
            y1={cy}
            x2={pVRes.x}
            y2={pVRes.y}
            stroke="#10b981"
            strokeWidth={2.8}
            markerEnd="url(#arrow-vres)"
          />
          <circle cx={pVRes.x} cy={pVRes.y} r={3.5} fill="#10b981" />
        </g>
      )}

      <circle cx={cx} cy={cy} r={3} fill={textFill} />

      {/* Scale & Legend */}
      <text
        x={12}
        y={304}
        fontSize={10}
        fontWeight={600}
        fill={mutedText}
      >
        Full scale: {maxScaleMmS} mm/s | Zone A ≤ 1.4
      </text>
    </svg>
  );
}

interface VibrationWaveformSvgProps {
  rpm: number;
  spinAngleDeg: number;
  v0: PolarVector;
  activeVector: PolarVector;
  hasInitialRun: boolean;
  isTrialInstalled: boolean;
  isCorrectionApplied: boolean;
}

export function VibrationWaveformSvg({
  rpm,
  spinAngleDeg,
  v0,
  activeVector,
  hasInitialRun,
  isTrialInstalled,
  isCorrectionApplied,
}: VibrationWaveformSvgProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const w = 560;
  const h = 148;
  const padL = 44;
  const padR = 14;
  const padT = 18;
  const padB = 22;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const midY = padT + plotH / 2;

  const activePeak = hasInitialRun ? activeVector.mag * Math.SQRT2 : 0;
  const activePkPk = activePeak * 2;
  const v0Peak = v0.mag * Math.SQRT2;
  const maxAxisMmS = Math.max(6, Math.ceil(Math.max(v0Peak, activePeak) * 1.15));

  const cycles = 2;
  const totalDeg = cycles * 360;
  const totalMs = (cycles / Math.max(1, rpm / 60)) * 1000;
  const samples = 120;

  // Stationary 0°..720° waveform: positive peak occurs at spinDeg ≡ phaseDeg
  const buildWavePath = (peak: number, phaseDeg: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const frac = i / samples;
      const x = padL + frac * plotW;
      const deg = frac * totalDeg;
      const val = peak * Math.cos(degToRad(deg - phaseDeg));
      const y = midY - (val / maxAxisMmS) * (plotH / 2);
      pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Moving phase cursor synchronized 1:1 with RotorDiskSvg spinAngleDeg
  const cursorDeg = ((spinAngleDeg % totalDeg) + totalDeg) % totalDeg;
  const cursorFrac = cursorDeg / totalDeg;
  const cursorX = padL + cursorFrac * plotW;
  const cursorVal = hasInitialRun
    ? activePeak * Math.cos(degToRad(cursorDeg - activeVector.deg))
    : 0;
  const cursorY = midY - (cursorVal / maxAxisMmS) * (plotH / 2);
  const mod360 = cursorDeg % 360;
  const isTachCursor = Math.min(mod360, 360 - mod360) < 16;

  const waveColor = !hasInitialRun
    ? '#64748b'
    : activeVector.mag <= 1.4
      ? '#10b981'
      : activeVector.mag <= 2.8
        ? '#0ea5e9'
        : activeVector.mag <= 4.5
          ? '#f59e0b'
          : '#f43f5e';

  const bgFill = isDark ? '#0f172a' : '#f8fafc';
  const gridStroke = isDark ? '#334155' : '#cbd5e1';
  const mutedText = isDark ? '#94a3b8' : '#64748b';
  const textFill = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full select-none"
      aria-label="1X time-waveform vibration sine plot"
    >
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={12}
        fill={bgFill}
        stroke={gridStroke}
        strokeWidth={1}
      />

      {/* Horizontal Grid & Zero Line */}
      <line
        x1={padL}
        y1={padT}
        x2={padL + plotW}
        y2={padT}
        stroke={gridStroke}
        strokeDasharray="3 3"
        strokeWidth={1}
      />
      <line
        x1={padL}
        y1={midY}
        x2={padL + plotW}
        y2={midY}
        stroke={gridStroke}
        strokeWidth={1.2}
      />
      <line
        x1={padL}
        y1={padT + plotH}
        x2={padL + plotW}
        y2={padT + plotH}
        stroke={gridStroke}
        strokeDasharray="3 3"
        strokeWidth={1}
      />

      {/* Vertical Grid (0°, 180°, 360° TACH, 540°) */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padL + f * plotW}
          y1={padT}
          x2={padL + f * plotW}
          y2={padT + plotH}
          stroke={f === 0.5 ? '#7c3aed' : gridStroke}
          strokeDasharray={f === 0.5 ? '4 2' : '2 3'}
          strokeWidth={f === 0.5 ? 1.3 : 1}
          opacity={f === 0.5 ? 0.65 : 1}
        />
      ))}
      <text
        x={padL + 0.5 * plotW}
        y={padT - 5}
        textAnchor="middle"
        fontSize={8.5}
        fontWeight={700}
        fill="#7c3aed"
      >
        360° TACH
      </text>

      {/* Y-Axis Labels */}
      <text
        x={padL - 6}
        y={padT + 4}
        textAnchor="end"
        fontSize={9.5}
        fill={mutedText}
      >
        +{maxAxisMmS}
      </text>
      <text
        x={padL - 6}
        y={midY + 3}
        textAnchor="end"
        fontSize={9.5}
        fill={mutedText}
      >
        0
      </text>
      <text
        x={padL - 6}
        y={padT + plotH}
        textAnchor="end"
        fontSize={9.5}
        fill={mutedText}
      >
        -{maxAxisMmS}
      </text>

      {/* Baseline V0 Reference Sine (dashed) when Trial or Correction is active */}
      {hasInitialRun && (isTrialInstalled || isCorrectionApplied) && (
        <path
          d={buildWavePath(v0Peak, v0.deg)}
          fill="none"
          stroke="#f43f5e"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.45}
        />
      )}

      {/* Active 1X Sine Waveform */}
      {hasInitialRun ? (
        <g>
          <path
            d={buildWavePath(activePeak, activeVector.deg)}
            fill="none"
            stroke={waveColor}
            strokeWidth={2.3}
            strokeLinejoin="round"
          />
          {/* Moving Phase Cursor */}
          <line
            x1={cursorX}
            y1={padT}
            x2={cursorX}
            y2={padT + plotH}
            stroke={isTachCursor ? '#a855f7' : waveColor}
            strokeWidth={isTachCursor ? 2 : 1.4}
            strokeDasharray="2 2"
            opacity={0.85}
          />
          <circle
            cx={cursorX}
            cy={cursorY}
            r={4.5}
            fill={isTachCursor ? '#a855f7' : waveColor}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        </g>
      ) : (
        <line
          x1={padL}
          y1={midY}
          x2={padL + plotW}
          y2={midY}
          stroke="#64748b"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      )}

      {/* Footer Info */}
      <text x={padL} y={h - 6} fontSize={9.5} fontWeight={600} fill={mutedText}>
        0 ms (1X = {(rpm / 60).toFixed(1)} Hz)
      </text>
      <text
        x={w - padR}
        y={h - 6}
        textAnchor="end"
        fontSize={9.5}
        fontWeight={700}
        fill={textFill}
      >
        {hasInitialRun
          ? `Pk-Pk: ${activePkPk.toFixed(2)} mm/s | Window: ${totalMs.toFixed(0)} ms`
          : 'Run Step 1 to capture 1X waveform'}
      </text>
    </svg>
  );
}
