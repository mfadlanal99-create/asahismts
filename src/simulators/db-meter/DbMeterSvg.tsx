import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type {
  AcousticSourceId,
  FrequencyWeighting,
  TimeWeighting,
} from './dbMeterPhysics';

interface DbMeterSvgProps {
  sourceId: AcousticSourceId;
  sourceLabel: string;
  distanceM: number;
  enclosureActive: boolean;
  weighting: FrequencyWeighting;
  timeWeighting: TimeWeighting;
  liveSplDb: number;
  peakHoldDb: number;
  onChangeDistance: (distanceM: number) => void;
  onSetEnclosure: (active: boolean) => void;
  onCycleWeighting: () => void;
  onToggleTimeWeighting: () => void;
  onResetPeak: () => void;
}

const BAR_MIN_DB = 30;
const BAR_MAX_DB = 130;
const TOTAL_SEGMENTS = 25;
const MIC_MIN_X = 205;
const MIC_MAX_X = 435;

export function DbMeterSvg({
  sourceId,
  sourceLabel,
  distanceM,
  enclosureActive,
  weighting,
  timeWeighting,
  liveSplDb,
  peakHoldDb,
  onChangeDistance,
  onSetEnclosure,
  onCycleWeighting,
  onToggleTimeWeighting,
  onResetPeak,
}: DbMeterSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingMic, setDraggingMic] = useState(false);
  const [draggingHood, setDraggingHood] = useState(false);
  const [hoodDragY, setHoodDragY] = useState<number | null>(null);

  const bgPanel = 'var(--md-surface-container-low)';
  const borderCol = 'var(--md-outline-variant)';
  const textPrimary = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';
  const machineFill = isDark ? '#1E293B' : '#CBD5E1';
  const machineStroke = isDark ? '#64748B' : '#475569';
  const floorCol = 'var(--md-surface-container-high)';

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

  // Horizontal drag for dB Meter along 1m - 15m floorplan
  const handleMicPointerDown = (e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingMic(true);
  };

  const handleMicPointerMove = (e: ReactPointerEvent<SVGGElement>) => {
    if (!draggingMic) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (!pt) return;
    const clampedX = Math.max(MIC_MIN_X, Math.min(MIC_MAX_X, pt.x));
    const ratio = (clampedX - MIC_MIN_X) / (MIC_MAX_X - MIC_MIN_X);
    const rawDist = 1 + ratio * 14;
    const snappedDist = Math.round(rawDist * 2) / 2;
    onChangeDistance(Math.max(1, Math.min(15, snappedDist)));
  };

  const handleMicPointerUp = (e: ReactPointerEvent<SVGGElement>) => {
    if (!draggingMic) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDraggingMic(false);
  };

  // Vertical drag or click for Acoustic Enclosure Hood
  const handleHoodPointerDown = (e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingHood(true);
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (pt) setHoodDragY(pt.y);
  };

  const handleHoodPointerMove = (e: ReactPointerEvent<SVGGElement>) => {
    if (!draggingHood) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    if (!pt) return;
    setHoodDragY(Math.max(70, Math.min(220, pt.y)));
  };

  const handleHoodPointerUp = (e: ReactPointerEvent<SVGGElement>) => {
    if (!draggingHood) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const pt = toSvgCoords(e.clientX, e.clientY);
    setDraggingHood(false);
    setHoodDragY(null);
    if (pt) {
      // If barely moved, treat as click toggle; otherwise use drop height
      if (Math.abs(pt.y - (enclosureActive ? 172 : 84)) < 12) {
        onSetEnclosure(!enclosureActive);
      } else {
        onSetEnclosure(pt.y >= 135);
      }
    }
  };

  // Position of microphone tip along 1m..15m visual span
  const tDist = (Math.max(1, Math.min(15, distanceM)) - 1) / 14;
  const micX = MIC_MIN_X + tDist * (MIC_MAX_X - MIC_MIN_X);
  const sourceCenterX = 112;
  const sourceCenterY = 236;

  // Bargraph calculations
  const normLive = Math.max(
    0,
    Math.min(1, (liveSplDb - BAR_MIN_DB) / (BAR_MAX_DB - BAR_MIN_DB))
  );
  const activeSegments = Math.round(normLive * TOTAL_SEGMENTS);
  const normPeak = Math.max(
    0,
    Math.min(1, (peakHoldDb - BAR_MIN_DB) / (BAR_MAX_DB - BAR_MIN_DB))
  );
  const peakX = 505 + normPeak * 195;

  const splColor =
    liveSplDb >= 90
      ? '#EF4444'
      : liveSplDb >= 85
        ? '#F59E0B'
        : '#10B981';

  const hoodY =
    draggingHood && hoodDragY !== null
      ? Math.max(66, Math.min(170, hoodDragY - 30))
      : enclosureActive
        ? 170
        : 66;

  return (
    <div data-tour="db-svg" className="glass-panel rounded-[28px] p-3.5 sm:p-4">
      <svg
        ref={svgRef}
        viewBox="0 0 760 400"
        className="w-full h-auto select-none touch-none"
        role="img"
        aria-label={pick(
          'IEC 61672 Class 1 Sound Level Meter and Acoustic Source Diagram',
          'Diagram Alat Ukur Tingkat Suara IEC 61672 Kelas 1 dan Sumber Akustik',
          'IEC 61672 クラス1騒音計と音源の模式図'
        )}
      >
        <defs>
          <linearGradient id="meterBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? '#1E293B' : '#334155'} />
            <stop offset="100%" stopColor={isDark ? '#0F172A' : '#1E293B'} />
          </linearGradient>
          <linearGradient id="lcdBgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#041E1B" />
            <stop offset="100%" stopColor="#072B26" />
          </linearGradient>
          <linearGradient id="jetPlumeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Background Frame */}
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

        {/* Header Banner */}
        <rect
          x="20"
          y="18"
          width="436"
          height="34"
          rx="12"
          fill="var(--md-surface-container)"
          stroke="var(--md-outline-variant)"
          strokeWidth="1"
        />
        <text
          x="32"
          y="40"
          fontSize="11.5"
          fontWeight="700"
          fontFamily="var(--font-sans)"
          fill="var(--md-on-surface)"
        >
          {pick(
            'FREE-FIELD ACOUSTIC PROPAGATION',
            'PROPAGASI AKUSTIK MEDAN BEBAS',
            '自由音場音響伝搬モデル'
          )}
        </text>
        <text
          x="444"
          y="40"
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          textAnchor="end"
          fill={enclosureActive ? (isDark ? '#34D399' : '#059669') : 'var(--md-primary)'}
        >
          {enclosureActive ? '-12 dB ENCLOSURE' : 'OPEN FIELD'}
        </text>

        {/* Floor / Ground Plane */}
        <rect x="20" y="302" width="436" height="8" rx="4" fill={floorCol} />

        {/* Distance Ruler 1m -> 15m */}
        <line
          x1={MIC_MIN_X}
          y1="330"
          x2={MIC_MAX_X}
          y2="330"
          stroke={textMuted}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx={MIC_MIN_X} cy="330" r="3" fill={textMuted} />
        <circle cx={MIC_MAX_X} cy="330" r="3" fill={textMuted} />
        <text x={MIC_MIN_X} y="346" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fill={textMuted}>
          1 m
        </text>
        <text
          x={(MIC_MIN_X + MIC_MAX_X) / 2}
          y="346"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          fill={textMuted}
        >
          8 m
        </text>
        <text x={MIC_MAX_X} y="346" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fill={textMuted}>
          15 m
        </text>

        {/* Active Distance Bracket */}
        <line
          x1={sourceCenterX}
          y1="364"
          x2={micX}
          y2="364"
          stroke="var(--md-primary)"
          strokeWidth="2"
        />
        <line x1={sourceCenterX} y1="358" x2={sourceCenterX} y2="370" stroke="var(--md-primary)" strokeWidth="2" />
        <line x1={micX} y1="358" x2={micX} y2="370" stroke="var(--md-primary)" strokeWidth="2" />
        <rect
          x={(sourceCenterX + micX) / 2 - 38}
          y="354"
          width="76"
          height="20"
          rx="10"
          fill="var(--md-primary-container)"
          stroke="var(--md-primary)"
          strokeWidth="1"
        />
        <text
          x={(sourceCenterX + micX) / 2}
          y="368"
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          fill="var(--md-on-primary-container)"
        >
          d = {distanceM.toFixed(1)} m
        </text>

        {/* Machine Source 2D CAD Illustration */}
        <g>
          {/* Steel Base Skid */}
          <rect x="46" y="288" width="132" height="14" rx="3" fill={machineStroke} />
          <rect x="54" y="282" width="14" height="6" fill="#64748B" />
          <rect x="156" y="282" width="14" height="6" fill="#64748B" />

          {sourceId === 'centrifugal-compressor' && (
            <g>
              {/* Drive Motor + Coupling */}
              <rect x="52" y="228" width="52" height="54" rx="5" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              {[238, 248, 258, 268].map((y) => (
                <line key={y} x1="60" y1={y} x2="96" y2={y} stroke={machineStroke} strokeWidth="1.5" />
              ))}
              <rect x="104" y="246" width="12" height="16" fill="#64748B" />
              {/* Centrifugal Volute Casing */}
              <circle cx="144" cy="244" r="32" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              <circle cx="144" cy="244" r="14" fill={isDark ? '#0F172A' : '#E2E8F0'} stroke="#10B981" strokeWidth="1.5" />
              {/* Discharge + Intercooler Finned Pipe */}
              <rect x="136" y="192" width="16" height="24" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              <rect x="122" y="184" width="44" height="10" rx="3" fill="#0284C7" stroke={machineStroke} strokeWidth="1.5" />
              <line x1="128" y1="184" x2="128" y2="194" stroke="#E0F2FE" strokeWidth="1.5" />
              <line x1="138" y1="184" x2="138" y2="194" stroke="#E0F2FE" strokeWidth="1.5" />
              <line x1="148" y1="184" x2="148" y2="194" stroke="#E0F2FE" strokeWidth="1.5" />
              <line x1="158" y1="184" x2="158" y2="194" stroke="#E0F2FE" strokeWidth="1.5" />
            </g>
          )}

          {sourceId === 'cavitation-pump' && (
            <g>
              {/* Pump Pedestal & Bearing Housing */}
              <rect x="58" y="240" width="48" height="48" rx="4" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              {/* Volute Casing */}
              <circle cx="132" cy="244" r="34" fill={isDark ? '#1E3A5F' : '#BAE6FD'} stroke="#0284C7" strokeWidth="2" />
              {/* Suction Flange & Pipe */}
              <rect x="160" y="234" width="22" height="20" fill="#0284C7" stroke={machineStroke} strokeWidth="1.5" />
              {/* Discharge Flange */}
              <rect x="122" y="190" width="20" height="24" fill="#0284C7" stroke={machineStroke} strokeWidth="1.5" />
              <rect x="116" y="185" width="32" height="6" rx="2" fill={machineStroke} />
              {/* Vapor Cavitation Bubbles inside Suction Eye */}
              <circle cx="132" cy="244" r="12" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="126" cy="240" r="3" fill="#FBBF24" />
              <circle cx="137" cy="248" r="2.5" fill="#FBBF24" />
              <circle cx="134" cy="236" r="2" fill="#EF4444" />
            </g>
          )}

          {sourceId === 'compressed-air-nozzle' && (
            <g>
              {/* Air Header & Regulator */}
              <rect x="54" y="210" width="44" height="78" rx="6" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              <circle cx="76" cy="228" r="10" fill="#FFFFFF" stroke="#475569" strokeWidth="1.5" />
              <line x1="76" y1="228" x2="82" y2="222" stroke="#EF4444" strokeWidth="1.5" />
              {/* Brass Venturi Nozzle */}
              <rect x="98" y="238" width="20" height="16" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
              <polygon points="118,236 146,241 146,251 118,256" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />
              {/* Turbulent Mach Jet Plume */}
              <polygon points="146,241 206,222 206,270 146,251" fill="url(#jetPlumeGrad)" />
              <ellipse cx="162" cy="246" rx="5" ry="3" fill="#BAE6FD" fillOpacity="0.8" />
              <ellipse cx="178" cy="246" rx="4" ry="2.5" fill="#BAE6FD" fillOpacity="0.6" />
            </g>
          )}

          {sourceId === 'gear-reducer-whine' && (
            <g>
              {/* Cast-Iron Ribbed Gearbox */}
              <rect x="58" y="202" width="110" height="86" rx="8" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              {/* Cutaway Inspection Window */}
              <rect x="70" y="214" width="86" height="62" rx="6" fill={isDark ? '#0F172A' : '#E2E8F0'} stroke={machineStroke} strokeWidth="1.5" />
              {/* Bull Gear */}
              <circle cx="100" cy="248" r="22" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="6 3" />
              <circle cx="100" cy="248" r="6" fill="#64748B" />
              {/* Pinion Gear */}
              <circle cx="134" cy="236" r="13" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeDasharray="4 2" />
              <circle cx="134" cy="236" r="4" fill="#64748B" />
              {/* Output Shaft */}
              <rect x="168" y="240" width="16" height="14" fill="#94A3B8" />
            </g>
          )}

          {sourceId === 'electric-motor-fan' && (
            <g>
              {/* TEFC Motor Stator with Cooling Fins */}
              <rect x="66" y="208" width="96" height="80" rx="8" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              {[220, 232, 244, 256, 268].map((y) => (
                <line key={y} x1="78" y1={y} x2="150" y2={y} stroke={machineStroke} strokeWidth="2" />
              ))}
              {/* NDE Fan Cowl */}
              <rect x="50" y="212" width="20" height="72" rx="6" fill={isDark ? '#0F172A' : '#94A3B8'} stroke={machineStroke} strokeWidth="2" />
              {/* Terminal Box */}
              <rect x="98" y="188" width="32" height="20" rx="3" fill={machineFill} stroke={machineStroke} strokeWidth="2" />
              {/* Drive Shaft */}
              <rect x="162" y="241" width="22" height="12" fill="#94A3B8" />
            </g>
          )}

          <text
            x="112"
            y="162"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
            fill={textPrimary}
          >
            {sourceLabel}
          </text>
        </g>

        {/* Radial / Directional Acoustic Wavefronts */}
        {[1, 2, 3, 4].map((ring) => {
          const r = 36 + ring * 26;
          const opacity = enclosureActive ? 0.25 - ring * 0.04 : 0.8 - ring * 0.14;
          return (
            <path
              key={ring}
              d={`M ${sourceCenterX + r * 0.65} ${sourceCenterY - r * 0.68} A ${r} ${r} 0 0 1 ${sourceCenterX + r * 0.65} ${sourceCenterY + r * 0.68}`}
              fill="none"
              stroke={splColor}
              strokeWidth={enclosureActive ? '1.5' : '2.5'}
              strokeOpacity={Math.max(0.12, opacity)}
              strokeLinecap="round"
            />
          );
        })}

        {/* Interactive Acoustic Enclosure Hood (Click or Drag onto Machine) */}
        <g
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handleHoodPointerDown}
          onPointerMove={handleHoodPointerMove}
          onPointerUp={handleHoodPointerUp}
          role="button"
          tabIndex={0}
        >
          {enclosureActive || draggingHood ? (
            <g>
              <rect
                x="38"
                y={hoodY}
                width="148"
                height="132"
                rx="10"
                fill={isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.16)'}
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray="8 4"
              />
              <rect x="52" y={hoodY - 10} width="120" height="20" rx="10" fill="#10B981" />
              <text
                x="112"
                y={hoodY + 4}
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                textAnchor="middle"
                fill="#FFFFFF"
              >
                ENCLOSURE (-12 dB)
              </text>
            </g>
          ) : (
            <g>
              {/* Parked Hood Handle above machine */}
              <rect
                x="44"
                y={hoodY}
                width="136"
                height="28"
                rx="10"
                fill={isDark ? '#064E3B' : '#D1FAE5'}
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x="112"
                y={hoodY + 18}
                fontSize="10"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                textAnchor="middle"
                fill={isDark ? '#6EE7B7' : '#065F46'}
              >
                {pick('DRAG / CLICK HOOD (-12 dB)', 'TARIK / KLIK PENUTUP (-12 dB)', '防音フードをドラッグ/クリック')}
              </text>
            </g>
          )}
        </g>

        {/* Draggable Handheld dB Meter / Tripod along 1m - 15m Floorplan */}
        <g
          className="cursor-ew-resize"
          onPointerDown={handleMicPointerDown}
          onPointerMove={handleMicPointerMove}
          onPointerUp={handleMicPointerUp}
          role="slider"
          aria-valuemin={1}
          aria-valuemax={15}
          aria-valuenow={distanceM}
          tabIndex={0}
        >
          {/* Invisible wider hit target for easy touch/mouse drag */}
          <rect x={micX - 28} y="166" width="56" height="145" fill="transparent" />

          {/* Tripod Stand */}
          <line x1={micX} y1="242" x2={micX - 15} y2="302" stroke={machineStroke} strokeWidth="2.5" />
          <line x1={micX} y1="242" x2={micX + 15} y2="302" stroke={machineStroke} strokeWidth="2.5" />
          <line x1={micX} y1="214" x2={micX} y2="302" stroke={machineStroke} strokeWidth="2.5" />

          {/* Mini Handheld Meter on Tripod */}
          <rect
            x={micX - 12}
            y="188"
            width="24"
            height="38"
            rx="4"
            fill={isDark ? '#1E293B' : '#334155'}
            stroke={draggingMic ? '#34D399' : '#10B981'}
            strokeWidth={draggingMic ? '2.5' : '1.5'}
          />
          <rect x={micX - 8} y="194" width="16" height="12" rx="2" fill="#041E1B" />
          <text
            x={micX}
            y="203"
            fontSize="7"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
            fill={splColor}
          >
            {liveSplDb.toFixed(0)}
          </text>
          {/* Mic Preamp & Windscreen */}
          <polygon points={`${micX - 4},188 ${micX + 4},188 ${micX + 2},178 ${micX - 2},178`} fill="#64748B" />
          <circle cx={micX} cy="174" r="6" fill="#334155" stroke={splColor} strokeWidth="1.5" />

          {/* Drag Hint Pill */}
          <rect
            x={micX - 26}
            y="230"
            width="52"
            height="16"
            rx="8"
            fill={draggingMic ? 'var(--md-primary)' : 'var(--md-surface-container)'}
            stroke="var(--md-primary)"
            strokeWidth="1"
          />
          <text
            x={micX}
            y="241"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
            fill={draggingMic ? 'var(--md-on-primary)' : 'var(--md-primary)'}
          >
            ◄ DRAG ►
          </text>
        </g>

        {/* Handheld IEC 61672 Class 1 Sound Level Meter Readout (Right Side) */}
        <g>
          <polygon points="588,54 612,54 618,76 582,76" fill="#64748B" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="600" cy="44" r="14" fill="#334155" stroke="#10B981" strokeWidth="1.5" />

          <rect
            x="478"
            y="76"
            width="244"
            height="298"
            rx="20"
            fill="url(#meterBodyGrad)"
            stroke="#475569"
            strokeWidth="2"
          />

          <text
            x="600"
            y="96"
            fontSize="10"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="var(--font-sans)"
            textAnchor="middle"
            fill="#34D399"
          >
            IEC 61672-1 CLASS 1
          </text>

          <rect
            x="494"
            y="106"
            width="212"
            height="172"
            rx="10"
            fill="url(#lcdBgGrad)"
            stroke="#10B981"
            strokeWidth="1.5"
          />

          <rect x="504" y="116" width="44" height="20" rx="4" fill="#065F46" />
          <text x="526" y="130" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle" fill="#A7F3D0">
            {weighting}
          </text>

          <rect x="554" y="116" width="66" height="20" rx="4" fill="#0F3D36" />
          <text x="587" y="130" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" textAnchor="middle" fill="#6EE7B7">
            {timeWeighting === 'FAST' ? 'FAST 125ms' : 'SLOW 1s'}
          </text>

          <text x="696" y="130" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" textAnchor="end" fill="#6EE7B7">
            SPL
          </text>

          <text
            x="634"
            y="188"
            fontSize="44"
            fontWeight="800"
            fontFamily="var(--font-mono)"
            textAnchor="end"
            fill={splColor}
          >
            {liveSplDb.toFixed(1)}
          </text>
          <text x="642" y="186" fontSize="15" fontWeight="700" fontFamily="var(--font-mono)" fill="#A7F3D0">
            {weighting}
          </text>

          <text x="506" y="214" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill="#94A3B8">
            PEAK HOLD:
          </text>
          <text
            x="696"
            y="214"
            fontSize="12"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            textAnchor="end"
            fill="#FBBF24"
          >
            {peakHoldDb.toFixed(1)} {weighting}
          </text>

          {/* Segmented dB Bargraph */}
          <g>
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
              const segX = 505 + i * 7.8;
              const segDb =
                BAR_MIN_DB + ((i + 1) / TOTAL_SEGMENTS) * (BAR_MAX_DB - BAR_MIN_DB);
              const isLit = i < activeSegments;
              const segColor =
                segDb >= 90 ? '#EF4444' : segDb >= 85 ? '#F59E0B' : '#10B981';
              return (
                <rect
                  key={i}
                  x={segX}
                  y="228"
                  width="5.5"
                  height="22"
                  rx="1.5"
                  fill={isLit ? segColor : '#0B3B33'}
                />
              );
            })}

            <line x1={peakX} y1="224" x2={peakX} y2="254" stroke="#FBBF24" strokeWidth="2.5" />

            <text x="505" y="268" fontSize="9" fontFamily="var(--font-mono)" fill="#6EE7B7">30</text>
            <text x="554" y="268" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fill="#6EE7B7">60</text>
            <text x="615" y="268" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fill="#FBBF24">85</text>
            <text x="654" y="268" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fill="#F87171">105</text>
            <text x="698" y="268" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end" fill="#F87171">130</text>
          </g>

          <g className="cursor-pointer" onClick={onCycleWeighting} role="button" tabIndex={0}>
            <rect x="498" y="294" width="62" height="34" rx="12" fill="var(--md-primary)" stroke="var(--md-primary-container)" strokeWidth="1" />
            <text x="529" y="315" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" textAnchor="middle" fill="var(--md-on-primary)">
              A / C / Z
            </text>
          </g>

          <g className="cursor-pointer" onClick={onToggleTimeWeighting} role="button" tabIndex={0}>
            <rect x="569" y="294" width="62" height="34" rx="12" fill="#065F46" stroke="#34D399" strokeWidth="1" />
            <text x="600" y="315" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" textAnchor="middle" fill="#FFFFFF">
              F / S
            </text>
          </g>

          <g className="cursor-pointer" onClick={onResetPeak} role="button" tabIndex={0}>
            <rect x="640" y="294" width="62" height="34" rx="12" fill="#78350F" stroke="#FBBF24" strokeWidth="1" />
            <text x="671" y="315" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)" textAnchor="middle" fill="#FFFFFF">
              PK RST
            </text>
          </g>

          <text x="600" y="354" fontSize="9.5" fontWeight="600" fontFamily="var(--font-sans)" textAnchor="middle" fill="#94A3B8">
            {pick(
              'Drag meter on floorplan or click buttons',
              'Geser meter di lantai atau klik tombol',
              'メーターをドラッグまたはボタンをクリック'
            )}
          </text>
        </g>
      </svg>
    </div>
  );
}
