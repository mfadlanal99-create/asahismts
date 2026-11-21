import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getPrimaryValueForMode,
  type FaultScenarioId,
  type IsoZone,
  type MachineClassSpec,
  type PointReading,
  type ProbePointId,
  type VibrationMode,
} from './vibrationMeterPhysics';

interface VibrationMeterSvgProps {
  activePoint: ProbePointId;
  mode: VibrationMode;
  rpm: number;
  scenarioId: FaultScenarioId;
  machineClass: MachineClassSpec;
  reading: PointReading;
  onSelectPoint: (point: ProbePointId) => void;
  onCycleMode: () => void;
}

const POINT_COORDS: Record<ProbePointId, { x: number; y: number; short: string }> = {
  'motor-nde': { x: 86, y: 206, short: 'M-NDE' },
  'motor-de': { x: 202, y: 206, short: 'M-DE' },
  'pump-de': { x: 288, y: 214, short: 'P-DE' },
  'pump-nde': { x: 392, y: 214, short: 'P-NDE' },
};

const ZONE_COLORS: Record<IsoZone, { bg: string; text: string; label: string }> = {
  A: { bg: '#10B981', text: '#ECFDF5', label: 'ZONE A • GOOD' },
  B: { bg: '#3B82F6', text: '#EFF6FF', label: 'ZONE B • ACCEPTABLE' },
  C: { bg: '#F59E0B', text: '#FFFBEB', label: 'ZONE C • UNSATISFACTORY' },
  D: { bg: '#EF4444', text: '#FEF2F2', label: 'ZONE D • DANGER' },
};

export function VibrationMeterSvg({
  activePoint,
  mode,
  rpm,
  scenarioId,
  machineClass,
  reading,
  onSelectPoint,
  onCycleMode,
}: VibrationMeterSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverSnapPoint, setHoverSnapPoint] = useState<ProbePointId | null>(null);

  const bgPanel = 'var(--md-surface-container-low)';
  const borderCol = 'var(--md-outline-variant)';
  const textPrimary = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';
  const metalFill = isDark ? '#1E293B' : '#CBD5E1';
  const metalStroke = isDark ? '#475569' : '#64748B';

  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(ctm.inverse());
  };

  const findNearestPoint = (x: number, y: number): ProbePointId | null => {
    let bestId: ProbePointId | null = null;
    let bestDist = 56;
    for (const pid of Object.keys(POINT_COORDS) as ProbePointId[]) {
      const c = POINT_COORDS[pid];
      const d = Math.hypot(x - c.x, y - c.y);
      if (d < bestDist) {
        bestDist = d;
        bestId = pid;
      }
    }
    return bestId;
  };

  const handleProbePointerDown = (e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (pt) {
      setDragPos({
        x: Math.max(40, Math.min(440, pt.x)),
        y: Math.max(90, Math.min(280, pt.y)),
      });
      setHoverSnapPoint(findNearestPoint(pt.x, pt.y));
    }
  };

  const handleProbePointerMove = (e: ReactPointerEvent<SVGGElement>) => {
    if (!dragPos) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (!pt) return;
    const clampedX = Math.max(40, Math.min(440, pt.x));
    const clampedY = Math.max(90, Math.min(280, pt.y));
    setDragPos({ x: clampedX, y: clampedY });
    setHoverSnapPoint(findNearestPoint(clampedX, clampedY));
  };

  const handleProbePointerUp = (e: ReactPointerEvent<SVGGElement>) => {
    if (!dragPos) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const snap = findNearestPoint(dragPos.x, dragPos.y);
    if (snap) {
      onSelectPoint(snap);
    }
    setDragPos(null);
    setHoverSnapPoint(null);
  };

  const snappedCoord = POINT_COORDS[activePoint];
  const probePos = dragPos ?? { x: snappedCoord.x, y: snappedCoord.y };
  const primary = getPrimaryValueForMode(reading, mode);
  const zoneInfo = ZONE_COLORS[reading.isoZone];

  const modeTitle =
    mode === 'velocity'
      ? 'VEL (RMS)'
      : mode === 'acceleration'
        ? 'ACCEL (PK)'
        : mode === 'displacement'
          ? 'DISP (P-P)'
          : 'BEARING (BDU)';

  const bduColor =
    reading.bduStatus === 'critical'
      ? '#EF4444'
      : reading.bduStatus === 'caution'
        ? '#F59E0B'
        : '#10B981';

  return (
    <div data-tour="vmeter-canvas" className="glass-panel rounded-[28px] p-3.5 sm:p-4">
      <svg
        ref={svgRef}
        viewBox="0 0 760 400"
        className="w-full h-auto select-none touch-none"
        role="img"
        aria-label={pick(
          'Handheld Vibration Meter and 4-Point Motor-Pump Probe Diagram',
          'Diagram Alat Ukur Getaran Genggam dan Titik Probe Motor-Pompa',
          '携帯型振動計とモータ・ポンプ4点プローブ計測図'
        )}
      >
        <defs>
          <linearGradient id="vibMeterBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#1E293B' : '#334155'} />
            <stop offset="100%" stopColor={isDark ? '#0F172A' : '#1E293B'} />
          </linearGradient>
          <linearGradient id="vibLcd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F1029" />
            <stop offset="100%" stopColor="#1A1B3D" />
          </linearGradient>
        </defs>

        {/* Outer Frame */}
        <rect
          x="6"
          y="6"
          width="748"
          height="388"
          rx="18"
          fill={bgPanel}
          stroke={borderCol}
          strokeWidth="1.5"
        />

        {/* Top Header */}
        <rect
          x="20"
          y="18"
          width="442"
          height="34"
          rx="12"
          fill="var(--md-surface-container)"
          stroke="var(--md-outline-variant)"
          strokeWidth="1"
        />
        <text
          x="34"
          y="40"
          fontSize="12"
          fontWeight="700"
          fontFamily="var(--font-sans)"
          fill="var(--md-on-surface)"
        >
          {pick(
            '4-POINT MAGNETIC PROBE ROUTE',
            'RUTE PROBE MAGNETIK 4 TITIK',
            '4点マグネットプローブ計測ルート'
          )}
        </text>
        <text
          x="448"
          y="40"
          fontSize="11"
          fontWeight="700"
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fill="var(--md-primary)"
        >
          {rpm} RPM • {machineClass.foundation.toUpperCase()}
        </text>

        {/* Baseplate & Foundation */}
        <rect
          x="36"
          y="300"
          width="410"
          height="18"
          rx="4"
          fill={isDark ? '#334155' : '#94A3B8'}
          stroke={metalStroke}
          strokeWidth="1.5"
        />
        {[52, 212, 272, 424].map((bx) => (
          <rect
            key={bx}
            x={bx - 5}
            y="293"
            width="10"
            height="9"
            rx="1.5"
            fill={scenarioId === 'loose-foundation' ? '#F59E0B' : '#64748B'}
          />
        ))}
        <text
          x="241"
          y="340"
          fontSize="10"
          fontWeight="600"
          fontFamily="var(--font-sans)"
          textAnchor="middle"
          fill={textMuted}
        >
          {pick(
            'Drag magnetic probe or click M-NDE / M-DE / P-DE / P-NDE',
            'Geser probe magnetik atau klik M-NDE / M-DE / P-DE / P-NDE',
            'マグネットプローブをドラッグまたは各軸受点をクリック'
          )}
        </text>

        {/* Electric Motor */}
        <g>
          <rect x="66" y="280" width="24" height="20" fill={metalStroke} />
          <rect x="190" y="280" width="24" height="20" fill={metalStroke} />
          <rect
            x="64"
            y="196"
            width="156"
            height="86"
            rx="10"
            fill={metalFill}
            stroke={metalStroke}
            strokeWidth="2"
          />
          {[212, 224, 236, 248, 260].map((fy) => (
            <line
              key={fy}
              x1="82"
              y1={fy}
              x2="192"
              y2={fy}
              stroke={metalStroke}
              strokeWidth="2"
            />
          ))}
          <rect
            x="52"
            y="204"
            width="18"
            height="70"
            rx="6"
            fill={isDark ? '#0F172A' : '#94A3B8'}
            stroke={metalStroke}
            strokeWidth="1.5"
          />
          <text
            x="142"
            y="184"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
            fill={textPrimary}
          >
            {pick('ELECTRIC MOTOR', 'MOTOR LISTRIK', '電動モータ')}
          </text>
        </g>

        {/* Shaft & Coupling */}
        <g>
          <rect x="220" y="233" width="60" height="12" fill="#94A3B8" />
          <rect
            x="236"
            y="222"
            width="28"
            height="34"
            rx="4"
            fill={scenarioId === 'misalignment' ? '#F59E0B' : '#475569'}
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          <text x="250" y="272" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)" textAnchor="middle" fill={textMuted}>
            CPLG
          </text>
        </g>

        {/* Centrifugal Pump */}
        <g>
          <rect x="284" y="276" width="124" height="24" fill={metalStroke} />
          <rect
            x="278"
            y="214"
            width="126"
            height="62"
            rx="8"
            fill={metalFill}
            stroke={metalStroke}
            strokeWidth="2"
          />
          <circle
            cx="372"
            cy="238"
            r="34"
            fill={isDark ? '#1E3A5F' : '#93C5FD'}
            stroke={isDark ? '#60A5FA' : '#1D4ED8'}
            strokeWidth="2"
          />
          <rect
            x="360"
            y="186"
            width="24"
            height="26"
            rx="2"
            fill={isDark ? '#1E3A5F' : '#93C5FD'}
            stroke={isDark ? '#60A5FA' : '#1D4ED8'}
            strokeWidth="2"
          />
          <text
            x="342"
            y="174"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
            fill={textPrimary}
          >
            {pick('CENTRIFUGAL PUMP', 'POMPA SENTRIFUGAL', '遠心ポンプ')}
          </text>
        </g>

        {/* Bearing Spall Highlight */}
        {scenarioId === 'bearing-spall' && (
          <circle
            cx="288"
            cy="238"
            r="14"
            fill="rgba(239, 68, 68, 0.25)"
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="3 2"
          />
        )}

        {/* 4 Interactive Magnetic Probe Target Points */}
        {(Object.keys(POINT_COORDS) as ProbePointId[]).map((pid) => {
          const pt = POINT_COORDS[pid];
          const isSelected = pid === activePoint && !dragPos;
          const isSnapTarget = dragPos !== null && hoverSnapPoint === pid;
          return (
            <g
              key={pid}
              className="cursor-pointer"
              onClick={() => onSelectPoint(pid)}
              role="button"
              tabIndex={0}
            >
              {/* Glowing snap ring when dragging */}
              {dragPos && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSnapTarget ? 20 : 15}
                  fill="var(--md-primary)"
                  fillOpacity={isSnapTarget ? 0.24 : 0.1}
                  stroke="var(--md-primary)"
                  strokeWidth={isSnapTarget ? '2.5' : '1.5'}
                  strokeDasharray={isSnapTarget ? undefined : '4 2'}
                />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected || isSnapTarget ? 12 : 9}
                fill={
                  isSelected || isSnapTarget
                    ? 'var(--md-primary)'
                    : 'var(--md-surface-container-high)'
                }
                stroke={isSelected || isSnapTarget ? 'var(--md-primary-container)' : 'var(--md-primary)'}
                strokeWidth="2"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill={isSelected || isSnapTarget ? 'var(--md-on-primary)' : 'var(--md-primary)'}
              />
              <rect
                x={pt.x - 22}
                y={pt.y + 15}
                width="44"
                height="16"
                rx="6"
                fill={
                  isSelected || isSnapTarget
                    ? 'var(--md-primary-container)'
                    : 'var(--md-surface-container)'
                }
                stroke={isSelected || isSnapTarget ? 'var(--md-primary)' : borderCol}
                strokeWidth="1"
              />
              <text
                x={pt.x}
                y={pt.y + 26}
                fontSize="9"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
                fill={isSelected || isSnapTarget ? 'var(--md-on-primary-container)' : textPrimary}
              >
                {pt.short}
              </text>
            </g>
          );
        })}

        {/* Draggable Magnetic Accelerometer Probe + Coiled Cable */}
        <g
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handleProbePointerDown}
          onPointerMove={handleProbePointerMove}
          onPointerUp={handleProbePointerUp}
          role="slider"
          aria-label={pick('Draggable Magnetic Probe', 'Probe Magnetik yang Dapat Digeser', 'ドラッグ可能なマグネットプローブ')}
          tabIndex={0}
        >
          {/* Coiled Cable to Meter */}
          <path
            d={`M ${probePos.x} ${probePos.y - 32} C ${probePos.x} 90, 455 75, 598 76`}
            fill="none"
            stroke="var(--md-primary)"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />
          {/* Generous invisible hit area for dragging */}
          <rect
            x={probePos.x - 20}
            y={probePos.y - 42}
            width="40"
            height="46"
            fill="transparent"
          />
          {/* Probe Body */}
          <rect
            x={probePos.x - 8}
            y={probePos.y - 34}
            width="16"
            height="24"
            rx="3.5"
            fill="var(--md-primary)"
            stroke="var(--md-primary-container)"
            strokeWidth={dragPos ? '2' : '1.5'}
          />
          <rect
            x={probePos.x - 10}
            y={probePos.y - 12}
            width="20"
            height="6"
            rx="1.5"
            fill="#1E293B"
          />
        </g>

        {/* Handheld Vibration Meter Instrument (Right Side) */}
        <g>
          <rect x="588" y="60" width="20" height="18" rx="3" fill="#64748B" />

          <rect
            x="484"
            y="76"
            width="238"
            height="298"
            rx="20"
            fill="url(#vibMeterBody)"
            stroke="#475569"
            strokeWidth="2"
          />
          <text
            x="603"
            y="96"
            fontSize="10"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
            fill="#CBD5E1"
          >
            ISO 10816-3 VIBRATION METER
          </text>

          <rect
            x="500"
            y="106"
            width="206"
            height="196"
            rx="10"
            fill="url(#vibLcd)"
            stroke="#475569"
            strokeWidth="1.5"
          />

          <rect x="510" y="116" width="62" height="20" rx="6" fill="#312E81" />
          <text x="541" y="130" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle" fill="#E0E7FF">
            {POINT_COORDS[hoverSnapPoint ?? activePoint].short}
          </text>

          <text x="696" y="130" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="end" fill="#A5B4FC">
            {modeTitle}
          </text>

          <text
            x="630"
            y="186"
            fontSize="40"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            textAnchor="end"
            fill="#FFFFFF"
          >
            {primary.value.toFixed(primary.decimals)}
          </text>
          <text x="636" y="184" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill="#C7D2FE">
            {primary.unit}
          </text>

          <rect x="512" y="202" width="182" height="24" rx="6" fill={zoneInfo.bg} />
          <text x="603" y="218" fontSize="11" fontWeight="800" fontFamily="var(--font-sans)" textAnchor="middle" fill={zoneInfo.text}>
            {zoneInfo.label}
          </text>

          <g>
            {(['A', 'B', 'C', 'D'] as IsoZone[]).map((z, idx) => {
              const bx = 512 + idx * 46;
              const isZ = reading.isoZone === z;
              return (
                <g key={z}>
                  <rect
                    x={bx}
                    y="234"
                    width="42"
                    height="10"
                    rx="3"
                    fill={ZONE_COLORS[z].bg}
                    fillOpacity={isZ ? 1 : 0.25}
                    stroke={isZ ? '#FFFFFF' : 'none'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={bx + 21}
                    y="256"
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    textAnchor="middle"
                    fill={isZ ? '#FFFFFF' : '#94A3B8'}
                  >
                    {z}
                  </text>
                </g>
              );
            })}
          </g>

          <line x1="512" y1="264" x2="694" y2="264" stroke="#312E81" strokeWidth="1" />
          <text x="514" y="280" fontSize="10" fontFamily="var(--font-mono)" fill="#CBD5E1">
            VEL: {reading.velocityRmsMmS.toFixed(2)} mm/s
          </text>
          <text x="694" y="280" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end" fill={bduColor}>
            BDU: {reading.bearingBdu.toFixed(0)}
          </text>
          <text x="514" y="294" fontSize="10" fontFamily="var(--font-mono)" fill="#CBD5E1">
            ACC: {reading.accelPeakG.toFixed(2)} g
          </text>
          <text x="694" y="294" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end" fill="#CBD5E1">
            DISP: {reading.displacementPpUm.toFixed(0)} μm
          </text>

          <g className="cursor-pointer" onClick={onCycleMode} role="button" tabIndex={0}>
            <rect
              x="534"
              y="314"
              width="138"
              height="36"
              rx="18"
              fill="var(--md-primary)"
              stroke="var(--md-primary-container)"
              strokeWidth="1.5"
            />
            <text x="603" y="336" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" textAnchor="middle" fill="var(--md-on-primary)">
              {pick('CYCLE MODE', 'GANTI MODE', 'モード切替')}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
