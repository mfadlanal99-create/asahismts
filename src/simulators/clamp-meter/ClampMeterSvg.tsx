import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type {
  ClampFaultScenario,
  ClampMeterSnapshot,
  ConductorId,
} from './clampMeterPhysics';

interface ClampMeterSvgProps {
  conductor: ConductorId;
  onSelectConductor: (c: ConductorId) => void;
  fault: ClampFaultScenario;
  inrushEnabled: boolean;
  snapshot: ClampMeterSnapshot;
}

const CONDUCTOR_Y: Record<ConductorId, number> = {
  L1: 105,
  L2: 175,
  L3: 245,
  PE_N: 315,
};

const CONDUCTOR_META: {
  id: ConductorId;
  label: string;
  color: string;
}[] = [
  { id: 'L1', label: 'L1 (U)', color: '#B45309' },
  { id: 'L2', label: 'L2 (V)', color: '#334155' },
  { id: 'L3', label: 'L3 (W)', color: '#0284C7' },
  { id: 'PE_N', label: 'PE / N', color: '#16A34A' },
];

export function ClampMeterSvg({
  conductor,
  onSelectConductor,
  fault,
  inrushEnabled,
  snapshot,
}: ClampMeterSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const bgCard = isDark ? '#0B1328' : '#F8FAFC';
  const panelBg = isDark ? '#111C38' : '#FFFFFF';
  const borderStroke = isDark ? '#25365C' : '#CBD5E1';
  const textMain = isDark ? '#E2E8F0' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState<number | null>(null);
  const [snapCandidate, setSnapCandidate] = useState<ConductorId | null>(null);

  const toSvgY = (clientY: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    return pt.matrixTransform(ctm.inverse()).y;
  };

  const findNearestConductor = (y: number): ConductorId => {
    let best: ConductorId = 'L1';
    let bestDist = Infinity;
    for (const c of CONDUCTOR_META) {
      const d = Math.abs(y - CONDUCTOR_Y[c.id]);
      if (d < bestDist) {
        bestDist = d;
        best = c.id;
      }
    }
    return best;
  };

  const handleClampPointerDown = (e: ReactPointerEvent<SVGGElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const sy = toSvgY(e.clientY);
    if (sy !== null) {
      const clamped = Math.max(75, Math.min(340, sy - 65));
      setDragY(clamped);
      setSnapCandidate(findNearestConductor(clamped));
    }
  };

  const handleSvgPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const sy = toSvgY(e.clientY);
    if (sy === null) return;
    const clamped = Math.max(75, Math.min(340, sy - 65));
    setDragY(clamped);
    setSnapCandidate(findNearestConductor(clamped));
  };

  const handleSvgPointerUp = () => {
    if (!dragging) return;
    if (snapCandidate) {
      onSelectConductor(snapCandidate);
    }
    setDragging(false);
    setDragY(null);
    setSnapCandidate(null);
  };

  const clampY = dragging && dragY !== null ? dragY : CONDUCTOR_Y[conductor];
  const clampOffsetY = clampY - 105; // Base jaw center at y=105

  return (
    <div className="glass-panel rounded-2xl p-4 shadow-xs">
      <svg
        ref={svgRef}
        viewBox="0 0 680 440"
        className="w-full h-auto select-none touch-none"
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerCancel={handleSvgPointerUp}
        role="img"
        aria-label={pick(
          'Clamp Meter & 3-Phase Motor Feeder Analyzer',
          'Clamp Meter & Penganalisis Daya Motor 3-Fasa',
          'クランプメータおよび三相電動機電力アナライザ'
        )}
      >
        <defs>
          <linearGradient id="cmBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="cmMotor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="680" height="440" rx="16" fill={bgCard} />

        {/* Header */}
        <text
          x="24"
          y="34"
          fill={textMain}
          fontSize="12"
          fontWeight="700"
        >
          {pick(
            '3-PHASE 400V MOTOR FEEDER — Click any conductor to clamp',
            'FEEDER MOTOR 3-FASA 400V — Klik konduktor untuk menjepit',
            '三相400V電動機フィーダ — 導体をクリックしてクランプ'
          )}
        </text>

        {/* Left: MCC Breaker Panel */}
        <rect
          x="20"
          y="64"
          width="88"
          height="292"
          rx="10"
          fill={panelBg}
          stroke={borderStroke}
          strokeWidth="1.5"
        />
        <text
          x="64"
          y="86"
          textAnchor="middle"
          fill={textMuted}
          fontSize="9.5"
          fontWeight="700"
        >
          MCC 400V
        </text>
        <rect x="34" y="100" width="60" height="220" rx="6" fill={isDark ? '#1E293B' : '#E2E8F0'} />
        <text
          x="64"
          y="214"
          textAnchor="middle"
          fill={textMain}
          fontSize="10"
          fontWeight="700"
        >
          3P BREAKER
        </text>

        {/* Right: 15 kW 3-Phase Induction Motor */}
        <rect
          x="530"
          y="88"
          width="126"
          height="244"
          rx="14"
          fill="url(#cmMotor)"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Cooling Fins */}
        {[112, 134, 156, 178, 200, 222, 244, 266, 288].map((fy) => (
          <line
            key={fy}
            x1="542"
            y1={fy}
            x2="644"
            y2={fy}
            stroke="#475569"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <rect x="550" y="160" width="86" height="62" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
        <text
          x="593"
          y="184"
          textAnchor="middle"
          fill="#38BDF8"
          fontSize="11"
          fontWeight="700"
        >
          15 kW 4P
        </text>
        <text
          x="593"
          y="200"
          textAnchor="middle"
          fill="#CBD5E1"
          fontSize="9.5"
          fontWeight="600"
        >
          400V 50Hz
        </text>
        <text
          x="593"
          y="214"
          textAnchor="middle"
          fill={fault === 'locked-rotor' ? '#EF4444' : '#34D399'}
          fontSize="8.5"
          fontWeight="700"
        >
          {fault === 'locked-rotor' ? 'LOCKED!' : 'RUNNING'}
        </text>

        {/* 4 Feeder Conductors (Clickable) */}
        {CONDUCTOR_META.map((c) => {
          const y = CONDUCTOR_Y[c.id];
          const isOpen = fault === 'single-phasing' && c.id === 'L2';
          const isSelected = conductor === c.id;
          const amps = snapshot.phaseAmps[c.id];
          return (
            <g
              key={c.id}
              onClick={() => onSelectConductor(c.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible wide hit target */}
              <rect x="108" y={y - 22} width="422" height="44" fill="transparent" />
              {snapCandidate === c.id && dragging && (
                <line
                  x1="108"
                  y1={y}
                  x2="530"
                  y2={y}
                  stroke="#FDE047"
                  strokeWidth="16"
                  strokeOpacity="0.35"
                  strokeLinecap="round"
                />
              )}
              {/* Conductor Cable */}
              <line
                x1="108"
                y1={y}
                x2="530"
                y2={y}
                stroke={isOpen ? '#EF4444' : c.color}
                strokeWidth={isSelected ? '10' : '8'}
                strokeDasharray={isOpen ? '8 6' : undefined}
                strokeLinecap="round"
              />
              {c.id === 'PE_N' && (
                <line
                  x1="108"
                  y1={y}
                  x2="530"
                  y2={y}
                  stroke="#FACC15"
                  strokeWidth="3"
                  strokeDasharray="10 10"
                />
              )}
              {/* Label Pill */}
              <rect
                x="116"
                y={y - 24}
                width="104"
                height="18"
                rx="4"
                fill={isSelected ? '#0284C7' : isDark ? '#1E293B' : '#E2E8F0'}
              />
              <text
                x="168"
                y={y - 11.5}
                textAnchor="middle"
                fill={isSelected ? '#FFFFFF' : textMain}
                fontSize="9.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                {c.label}: {amps.toFixed(1)} A
              </text>
            </g>
          );
        })}

        {/* Moving Clamp Meter (Jaw centers on selected conductor; draggable) */}
        <g
          transform={`translate(285, ${clampOffsetY})`}
          onPointerDown={handleClampPointerDown}
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          {/* Split-core Hall-effect Jaw around conductor at y=105 */}
          <path
            d="M 48 135 L 48 82 C 48 64, 92 64, 92 82 L 92 135"
            fill="none"
            stroke="#DC2626"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 48 135 L 48 82 C 48 64, 92 64, 92 82 L 92 135"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Clamp Meter Body */}
          <rect
            x="24"
            y="130"
            width="92"
            height="172"
            rx="14"
            fill="url(#cmBody)"
            stroke="#075985"
            strokeWidth="2"
          />
          <rect x="31" y="138" width="78" height="156" rx="10" fill="#0F172A" />

          {/* LCD Screen */}
          <rect
            x="36"
            y="146"
            width="68"
            height="58"
            rx="5"
            fill={inrushEnabled ? '#FEF3C7' : '#BAE6FD'}
          />
          <text
            x="40"
            y="157"
            fill="#0F172A"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="monospace"
          >
            {inrushEnabled ? 'INRUSH PK' : 'TRUE RMS'}
          </text>
          <text
            x="98"
            y="184"
            textAnchor="end"
            fill="#0F172A"
            fontSize="20"
            fontWeight="800"
            fontFamily="monospace"
          >
            {snapshot.measuredAmps.toFixed(1)}
          </text>
          <text
            x="98"
            y="198"
            textAnchor="end"
            fill="#0369A1"
            fontSize="9"
            fontWeight="700"
            fontFamily="monospace"
          >
            A AC ({conductor})
          </text>

          {/* Power Analyzer Mini Metrics */}
          <text x="40" y="222" fill="#38BDF8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
            {snapshot.activePowerKw.toFixed(1)} kW
          </text>
          <text x="40" y="236" fill="#94A3B8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
            PF {snapshot.powerFactor.toFixed(2)}
          </text>
          <text
            x="40"
            y="250"
            fill={
              snapshot.nemaStatus === 'critical'
                ? '#F87171'
                : snapshot.nemaStatus === 'derate'
                  ? '#FBBF24'
                  : '#34D399'
            }
            fontSize="8.5"
            fontWeight="700"
            fontFamily="monospace"
          >
            UNB {snapshot.currentUnbalancePct.toFixed(1)}%
          </text>

          {/* Rotary Knob */}
          <circle cx="70" cy="274" r="14" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="70" y1="262" x2="70" y2="274" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Bottom Power Summary Strip */}
        <rect
          x="20"
          y="376"
          width="636"
          height="46"
          rx="10"
          fill={panelBg}
          stroke={borderStroke}
          strokeWidth="1.5"
        />
        <text x="40" y="396" fill={textMuted} fontSize="9" fontWeight="700">
          LINE VOLTAGE
        </text>
        <text x="40" y="412" fill={textMain} fontSize="13" fontWeight="800" fontFamily="monospace">
          {snapshot.lineVoltageV.toFixed(0)} V
        </text>

        <text x="165" y="396" fill={textMuted} fontSize="9" fontWeight="700">
          ACTIVE POWER
        </text>
        <text x="165" y="412" fill="#0284C7" fontSize="13" fontWeight="800" fontFamily="monospace">
          {snapshot.activePowerKw.toFixed(2)} kW
        </text>

        <text x="295" y="396" fill={textMuted} fontSize="9" fontWeight="700">
          APPARENT POWER
        </text>
        <text x="295" y="412" fill={textMain} fontSize="13" fontWeight="800" fontFamily="monospace">
          {snapshot.apparentPowerKva.toFixed(2)} kVA
        </text>

        <text x="430" y="396" fill={textMuted} fontSize="9" fontWeight="700">
          POWER FACTOR
        </text>
        <text x="430" y="412" fill={textMain} fontSize="13" fontWeight="800" fontFamily="monospace">
          {snapshot.powerFactor.toFixed(2)}
        </text>

        <text x="545" y="396" fill={textMuted} fontSize="9" fontWeight="700">
          NEMA UNBALANCE
        </text>
        <text
          x="545"
          y="412"
          fill={
            snapshot.nemaStatus === 'critical'
              ? '#EF4444'
              : snapshot.nemaStatus === 'derate'
                ? '#F59E0B'
                : '#10B981'
          }
          fontSize="13"
          fontWeight="800"
          fontFamily="monospace"
        >
          {snapshot.currentUnbalancePct.toFixed(1)}%
        </text>
      </svg>
    </div>
  );
}
