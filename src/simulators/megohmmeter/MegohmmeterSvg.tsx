import { useCallback, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  formatResistance,
  type LeadConnection,
  type MegohmmeterMetrics,
  type MotorConditionId,
  type TestPhase,
  type TestVoltage,
} from './megohmmeterPhysics';

interface MegohmmeterSvgProps {
  voltage: TestVoltage;
  lead: LeadConnection;
  presetId: MotorConditionId;
  phase: TestPhase;
  elapsedSec: number;
  metrics: MegohmmeterMetrics;
  onSelectVoltage: (v: TestVoltage) => void;
  onSelectLead: (lead: LeadConnection) => void;
  onToggleTest: () => void;
}

type TerminalKey = 'U' | 'V' | 'W' | 'GND';

const TERMINAL_COORDS: Record<TerminalKey, { x: number; y: number }> = {
  U: { x: 525, y: 155 },
  V: { x: 585, y: 155 },
  W: { x: 645, y: 155 },
  GND: { x: 675, y: 295 },
};

const LOG_MIN = Math.log10(0.01); // -2
const LOG_MAX = Math.log10(10000); // +4 (10 GΩ)

function resistanceToArcAngleDeg(mOhm: number): number {
  const clamped = Math.min(10000, Math.max(0.01, mOhm));
  const norm = (Math.log10(clamped) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  // Arc sweeps from -135 deg (left, 0.01 MΩ) to -45 deg? Let's use polar: 150° (bottom-left) to 30° (bottom-right) around top
  // In standard SVG coordinates (0° = right, 90° = down, -90° = up):
  // Leftmost = -145°, Center = -90°, Rightmost = -35°
  return -145 + norm * 110;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function MegohmmeterSvg({
  voltage,
  lead,
  presetId,
  phase,
  elapsedSec,
  metrics,
  onSelectVoltage,
  onSelectLead,
  onToggleTest,
}: MegohmmeterSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragState, setDragState] = useState<{
    clip: 'red' | 'black';
    x: number;
    y: number;
    hovered: TerminalKey | null;
  } | null>(null);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return {
        x: Math.min(750, Math.max(10, transformed.x)),
        y: Math.min(430, Math.max(10, transformed.y)),
      };
    }
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 760,
      y: ((clientY - rect.top) / rect.height) * 440,
    };
  }, []);

  const findNearestTerminal = useCallback(
    (x: number, y: number, clip: 'red' | 'black'): TerminalKey | null => {
      const validKeys: TerminalKey[] =
        clip === 'red' ? ['U', 'V', 'W'] : ['GND', 'V'];
      let best: TerminalKey | null = null;
      let bestDist = 42;
      for (const k of validKeys) {
        const t = TERMINAL_COORDS[k];
        const d = Math.hypot(x - t.x, y - t.y);
        if (d < bestDist) {
          bestDist = d;
          best = k;
        }
      }
      return best;
    },
    []
  );

  const applyClipDrop = useCallback(
    (clip: 'red' | 'black', target: TerminalKey) => {
      if (clip === 'red') {
        if (target === 'U') {
          onSelectLead(lead === 'U-V' ? 'U-V' : 'U-GND');
        } else if (target === 'V') {
          onSelectLead('V-GND');
        } else if (target === 'W') {
          onSelectLead('W-GND');
        }
      } else {
        if (target === 'V') {
          onSelectLead('U-V');
        } else if (target === 'GND') {
          if (lead === 'U-V' || lead === 'U-GND') onSelectLead('U-GND');
          else if (lead === 'V-GND') onSelectLead('V-GND');
          else onSelectLead('W-GND');
        }
      }
    },
    [lead, onSelectLead]
  );

  const isHvActive = phase === 'charging' || phase === 'testing';
  const isDischarging = phase === 'discharging';
  const formatted = formatResistance(metrics.rLive);

  // Needle angle: at idle, rests at left (-145°); when active, points to R_live
  const needleAngle = isHvActive
    ? resistanceToArcAngleDeg(metrics.rLive)
    : -145;

  const dialCx = 195;
  const dialCy = 185;
  const needleTip = polarToCartesian(dialCx, dialCy, 74, needleAngle);

  // Arc ticks for logarithmic scale
  const scaleTicks = [
    { val: 0.01, label: '0.01' },
    { val: 0.1, label: '0.1' },
    { val: 1, label: '1' },
    { val: 10, label: '10' },
    { val: 100, label: '100' },
    { val: 1000, label: '1G' },
    { val: 10000, label: '10G' },
  ];

  const redTarget =
    lead === 'U-GND' || lead === 'U-V'
      ? TERMINAL_COORDS.U
      : lead === 'V-GND'
      ? TERMINAL_COORDS.V
      : TERMINAL_COORDS.W;

  const blackTarget = lead === 'U-V' ? TERMINAL_COORDS.V : TERMINAL_COORDS.GND;

  const redPos =
    dragState?.clip === 'red' ? { x: dragState.x, y: dragState.y } : redTarget;
  const blackPos =
    dragState?.clip === 'black' ? { x: dragState.x, y: dragState.y } : blackTarget;

  const isFaultVisible =
    presetId === 'ground-fault' &&
    isHvActive &&
    (lead === 'U-GND' || lead === 'U-V');

  const statusColor =
    metrics.verdict === 'danger'
      ? '#EF4444'
      : metrics.verdict === 'questionable'
      ? '#F59E0B'
      : '#10B981';

  const bgCard = 'var(--md-surface-container-lowest)';
  const chassisFill = isDark ? '#1E293B' : '#334155';
  const chassisBorder = isDark ? '#475569' : '#1E293B';
  const lcdBg = isDark ? '#071324' : '#E2E8F0';
  const lcdText = isDark ? '#E2E8F0' : '#0F172A';
  const motorBody = isDark ? '#1E3A5F' : '#CBD5E1';
  const motorStroke = isDark ? '#60A5FA' : '#475569';

  // Rotary knob angle for 250, 500, 1000, 2500
  const knobAngles: Record<TestVoltage, number> = {
    250: -135,
    500: -105,
    1000: -75,
    2500: -45,
  };
  const knobAngle = knobAngles[voltage];
  const knobPtr = polarToCartesian(135, 342, 22, knobAngle);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 760 440"
      className="w-full h-auto select-none"
      onPointerMove={(e) => {
        if (!dragState) return;
        const pt = clientToSvg(e.clientX, e.clientY);
        if (!pt) return;
        const hovered = findNearestTerminal(pt.x, pt.y, dragState.clip);
        setDragState({ ...dragState, x: pt.x, y: pt.y, hovered });
      }}
      onPointerUp={(e) => {
        if (!dragState) return;
        const pt = clientToSvg(e.clientX, e.clientY);
        const target = pt
          ? findNearestTerminal(pt.x, pt.y, dragState.clip)
          : dragState.hovered;
        if (target) {
          applyClipDrop(dragState.clip, target);
        }
        setDragState(null);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => setDragState(null)}
      role="img"
      aria-label={pick(
        'Megohmmeter Insulation Resistance Tester and 3-Phase Motor Diagram',
        'Diagram Alat Ukur Tahanan Isolasi (Megger) dan Motor 3-Fasa',
        'メガー絶縁抵抗計および三相モータ結線図'
      )}
    >
      <defs>
        <linearGradient id="meggerChassisGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isDark ? '#1E293B' : '#475569'} />
          <stop offset="100%" stopColor={chassisFill} />
        </linearGradient>
        <linearGradient id="motorFrameGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isDark ? '#172554' : '#E2E8F0'} />
          <stop offset="100%" stopColor={motorBody} />
        </linearGradient>
        <filter id="hvGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Subtle Canvas Background */}
      <rect x="0" y="0" width="760" height="440" rx="16" fill={bgCard} />

      {/* ==================== LEFT: MEGOHMMETER INSTRUMENT ==================== */}
      {/* Rubberized Protective Boot */}
      <rect
        x="38"
        y="34"
        width="314"
        height="384"
        rx="24"
        fill="#E11D48"
        opacity={isDark ? 0.85 : 0.9}
      />
      {/* Main Instrument Chassis */}
      <rect
        x="48"
        y="44"
        width="294"
        height="364"
        rx="18"
        fill="url(#meggerChassisGrad)"
        stroke={chassisBorder}
        strokeWidth="2"
      />

      {/* Top Terminal Jacks */}
      <g>
        {/* LINE (+) Red */}
        <circle cx="105" cy="64" r="10" fill="#DC2626" stroke="#FCA5A5" strokeWidth="2" />
        <circle cx="105" cy="64" r="4" fill="#0F172A" />
        <text x="105" y="84" textAnchor="middle" fontSize="9" fontWeight="700" fill="#F8FAFC">
          LINE (+)
        </text>

        {/* GUARD Blue */}
        <circle cx="195" cy="64" r="9" fill="#2563EB" stroke="#93C5FD" strokeWidth="2" />
        <circle cx="195" cy="64" r="3.5" fill="#0F172A" />
        <text x="195" y="84" textAnchor="middle" fontSize="9" fontWeight="700" fill="#CBD5E1">
          GUARD
        </text>

        {/* EARTH (-) Black */}
        <circle cx="285" cy="64" r="10" fill="#0F172A" stroke="#94A3B8" strokeWidth="2" />
        <circle cx="285" cy="64" r="4" fill="#334155" />
        <text x="285" y="84" textAnchor="middle" fontSize="9" fontWeight="700" fill="#F8FAFC">
          EARTH (-)
        </text>
      </g>

      {/* Backlit LCD Display */}
      <rect
        x="68"
        y="94"
        width="254"
        height="170"
        rx="10"
        fill={lcdBg}
        stroke={isHvActive ? '#F43F5E' : isDark ? '#334155' : '#94A3B8'}
        strokeWidth={isHvActive ? 2.5 : 1.5}
      />

      {/* Analog Logarithmic Arc Scale */}
      <path
        d={`M ${polarToCartesian(dialCx, dialCy, 86, -145).x} ${
          polarToCartesian(dialCx, dialCy, 86, -145).y
        } A 86 86 0 0 1 ${polarToCartesian(dialCx, dialCy, 86, -35).x} ${
          polarToCartesian(dialCx, dialCy, 86, -35).y
        }`}
        fill="none"
        stroke={isDark ? '#334155' : '#94A3B8'}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Danger zone arc (0.01 - 5 MΩ) */}
      <path
        d={`M ${polarToCartesian(dialCx, dialCy, 86, -145).x} ${
          polarToCartesian(dialCx, dialCy, 86, -145).y
        } A 86 86 0 0 1 ${
          polarToCartesian(dialCx, dialCy, 86, resistanceToArcAngleDeg(5)).x
        } ${
          polarToCartesian(dialCx, dialCy, 86, resistanceToArcAngleDeg(5)).y
        }`}
        fill="none"
        stroke="#EF4444"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Scale Ticks & Labels */}
      {scaleTicks.map((tick) => {
        const ang = resistanceToArcAngleDeg(tick.val);
        const p1 = polarToCartesian(dialCx, dialCy, 80, ang);
        const p2 = polarToCartesian(dialCx, dialCy, 91, ang);
        const pLbl = polarToCartesian(dialCx, dialCy, 102, ang);
        return (
          <g key={tick.label}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={lcdText}
              strokeWidth="1.5"
            />
            <text
              x={pLbl.x}
              y={pLbl.y + 3}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="600"
              fill={isDark ? '#94A3B8' : '#475569'}
            >
              {tick.label}
            </text>
          </g>
        );
      })}

      {/* Analog Needle */}
      <line
        x1={dialCx}
        y1={dialCy}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke="#E11D48"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={dialCx} cy={dialCy} r="5" fill="#E11D48" />

      {/* Digital Readout Inside LCD */}
      <text
        x="195"
        y="222"
        textAnchor="middle"
        fontSize="28"
        fontWeight="800"
        fontFamily="var(--font-mono)"
        fill={isHvActive ? statusColor : isDark ? '#64748B' : '#64748B'}
      >
        {isHvActive
          ? `${formatted.value} ${formatted.unit}`
          : isDischarging
          ? 'DISCH...'
          : '--- MΩ'}
      </text>

      {/* Bottom LCD Status Row */}
      <text
        x="80"
        y="250"
        textAnchor="start"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={isHvActive ? '#F43F5E' : isDark ? '#94A3B8' : '#475569'}
      >
        {isHvActive ? `⚡ ${voltage}V DC` : `${voltage}V STBY`}
      </text>
      <text
        x="195"
        y="250"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={lcdText}
      >
        t={Math.floor(elapsedSec)}s
      </text>
      <text
        x="310"
        y="250"
        textAnchor="end"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={isDark ? '#38BDF8' : '#0369A1'}
      >
        {isHvActive
          ? metrics.leakageMicroAmps >= 1000
            ? `${(metrics.leakageMicroAmps / 1000).toFixed(2)} mA`
            : `${metrics.leakageMicroAmps.toFixed(1)} µA`
          : '0.0 µA'}
      </text>

      {/* Rotary Voltage Selector Dial */}
      <g>
        <text
          x="135"
          y="290"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="#E2E8F0"
        >
          {pick('TEST VOLTAGE', 'TEGANGAN UJI', '試験電圧')}
        </text>
        {(Object.keys(knobAngles) as unknown as TestVoltage[]).map((v) => {
          const val = Number(v) as TestVoltage;
          const pt = polarToCartesian(135, 342, 42, knobAngles[val]);
          const active = voltage === val;
          return (
            <g
              key={val}
              className="cursor-pointer"
              onClick={() => onSelectVoltage(val)}
            >
              <text
                x={pt.x}
                y={pt.y + 3}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight={active ? '800' : '600'}
                fill={active ? '#FDA4AF' : '#94A3B8'}
              >
                {val}V
              </text>
            </g>
          );
        })}
        <circle
          cx="135"
          cy="342"
          r="26"
          fill="#0F172A"
          stroke="#64748B"
          strokeWidth="2.5"
        />
        <line
          x1="135"
          y1="342"
          x2={knobPtr.x}
          y2={knobPtr.y}
          stroke="#FB7185"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="135" cy="342" r="7" fill="#334155" />
      </g>

      {/* TEST / DISCHARGE Button */}
      <g className="cursor-pointer" onClick={onToggleTest}>
        <rect
          x="225"
          y="308"
          width="88"
          height="64"
          rx="12"
          fill={isHvActive ? '#DC2626' : '#059669'}
          stroke={isHvActive ? '#FCA5A5' : '#6EE7B7'}
          strokeWidth="2"
          filter={isHvActive ? 'url(#hvGlow)' : undefined}
        />
        <text
          x="269"
          y="337"
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill="#FFFFFF"
        >
          {isHvActive
            ? pick('STOP', 'HENTI', '停止')
            : pick('TEST', 'UJI', '測定')}
        </text>
        <text
          x="269"
          y="354"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#F1F5F9"
        >
          {isHvActive
            ? pick('& DISCHARGE', '& BUANG', '・放電')
            : pick('INSULATION', 'ISOLASI', '絶縁開始')}
        </text>
      </g>

      {/* HV Warning LED */}
      <circle
        cx="269"
        cy="292"
        r="5"
        fill={isHvActive ? '#EF4444' : isDischarging ? '#F59E0B' : '#334155'}
        filter={isHvActive ? 'url(#hvGlow)' : undefined}
      />
      <text
        x="280"
        y="296"
        textAnchor="start"
        fontSize="9"
        fontWeight="700"
        fill={isHvActive ? '#FCA5A5' : '#94A3B8'}
      >
        {isHvActive ? 'HV ON' : isDischarging ? 'DISCH' : 'SAFE'}
      </text>

      {/* ==================== RIGHT: 3-PHASE MOTOR & TERMINAL BOX ==================== */}
      {/* Motor Stator Frame */}
      <rect
        x="435"
        y="215"
        width="285"
        height="165"
        rx="14"
        fill="url(#motorFrameGrad)"
        stroke={motorStroke}
        strokeWidth="2"
      />
      {/* Cooling Fins */}
      {[235, 255, 275, 295, 315, 335, 355].map((fy) => (
        <line
          key={fy}
          x1="448"
          y1={fy}
          x2="615"
          y2={fy}
          stroke={isDark ? '#3B82F6' : '#94A3B8'}
          strokeWidth="2"
          opacity="0.45"
        />
      ))}

      {/* Motor Mounting Feet */}
      <rect x="455" y="380" width="52" height="14" rx="3" fill={motorStroke} />
      <rect x="648" y="380" width="52" height="14" rx="3" fill={motorStroke} />

      {/* Motor Label */}
      <text
        x="535"
        y="366"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill={isDark ? '#CBD5E1' : '#334155'}
      >
        {pick('3-PHASE MOTOR STATOR', 'STATOR MOTOR 3-FASA', '三相誘導電動機ステータ')}
      </text>

      {/* Terminal Box */}
      <rect
        x="485"
        y="108"
        width="200"
        height="112"
        rx="10"
        fill={isDark ? '#0F172A' : '#F1F5F9'}
        stroke={motorStroke}
        strokeWidth="2"
      />
      <text
        x="585"
        y="126"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={isDark ? '#93C5FD' : '#1E3A8A'}
      >
        {pick('TERMINAL BOX', 'KOTAK TERMINAL', '端子箱')} ({lead})
      </text>

      {/* Winding Coils Inside Stator Hint */}
      <g stroke={isDark ? '#F59E0B' : '#D97706'} strokeWidth="2.5" fill="none" opacity="0.7">
        <path d="M 525 167 L 525 215" />
        <path d="M 585 167 L 585 215" />
        <path d="M 645 167 L 645 215" />
      </g>

      {/* Terminal Studs U1, V1, W1 */}
      {(['U', 'V', 'W'] as const).map((ph) => {
        const pt = TERMINAL_COORDS[ph];
        const isSnapValid =
          dragState?.clip === 'red' || (dragState?.clip === 'black' && ph === 'V');
        const isHovered = dragState?.hovered === ph;
        return (
          <g
            key={ph}
            className="cursor-pointer"
            onClick={() => {
              if (ph === 'U') onSelectLead('U-GND');
              else if (ph === 'V') onSelectLead('V-GND');
              else onSelectLead('W-GND');
            }}
          >
            {isSnapValid && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 22 : 18}
                fill="none"
                stroke={isHovered ? '#34D399' : '#38BDF8'}
                strokeWidth={isHovered ? 3 : 2}
                strokeDasharray={isHovered ? undefined : '4 3'}
                opacity="0.9"
              />
            )}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="13"
              fill="#D97706"
              stroke="#FDE68A"
              strokeWidth="2"
            />
            <circle cx={pt.x} cy={pt.y} r="5" fill="#78350F" />
            <text
              x={pt.x}
              y={pt.y + 28}
              textAnchor="middle"
              fontSize="11"
              fontWeight="800"
              fill={isDark ? '#F8FAFC' : '#0F172A'}
            >
              {ph}1
            </text>
          </g>
        );
      })}

      {/* Ground / PE Frame Lug */}
      <g
        className="cursor-pointer"
        onClick={() => {
          if (lead === 'U-V') onSelectLead('U-GND');
        }}
      >
        {dragState?.clip === 'black' && (
          <circle
            cx={TERMINAL_COORDS.GND.x}
            cy={TERMINAL_COORDS.GND.y}
            r={dragState.hovered === 'GND' ? 22 : 18}
            fill="none"
            stroke={dragState.hovered === 'GND' ? '#34D399' : '#38BDF8'}
            strokeWidth={dragState.hovered === 'GND' ? 3 : 2}
            strokeDasharray={dragState.hovered === 'GND' ? undefined : '4 3'}
            opacity="0.9"
          />
        )}
        <circle
          cx={TERMINAL_COORDS.GND.x}
          cy={TERMINAL_COORDS.GND.y}
          r="12"
          fill="#16A34A"
          stroke="#86EFAC"
          strokeWidth="2"
        />
        <text
          x={TERMINAL_COORDS.GND.x}
          y={TERMINAL_COORDS.GND.y + 24}
          textAnchor="middle"
          fontSize="10"
          fontWeight="800"
          fill={isDark ? '#86EFAC' : '#166534'}
        >
          PE / GND
        </text>
      </g>

      {/* Ground Fault Arc Indicator (when Phase U faulted & HV active) */}
      {isFaultVisible && (
        <g filter="url(#hvGlow)">
          <path
            d="M 525 170 L 516 190 L 530 198 L 518 220"
            fill="none"
            stroke="#EF4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text
            x="525"
            y="246"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fill="#EF4444"
          >
            ⚡ GROUND FAULT
          </text>
        </g>
      )}

      {/* ==================== TEST LEADS (DRAGGABLE ALLIGATOR CLIPS) ==================== */}
      {/* Red HV Lead from Jack (105, 64) to redPos */}
      <path
        d={`M 105 54 C 105 14, ${redPos.x} 14, ${redPos.x} ${redPos.y - 12}`}
        fill="none"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g
        className={dragState?.clip === 'red' ? 'cursor-grabbing' : 'cursor-grab'}
        onPointerDown={(e) => {
          e.stopPropagation();
          svgRef.current?.setPointerCapture(e.pointerId);
          setDragState({ clip: 'red', x: redTarget.x, y: redTarget.y, hovered: null });
        }}
      >
        <circle cx={redPos.x} cy={redPos.y} r="18" fill="transparent" />
        <rect
          x={redPos.x - 7}
          y={redPos.y - 18}
          width="14"
          height="14"
          rx="3"
          fill="#DC2626"
          stroke="#FCA5A5"
          strokeWidth="1.5"
        />
        <circle
          cx={redPos.x}
          cy={redPos.y}
          r="7"
          fill="none"
          stroke="#EF4444"
          strokeWidth="3"
        />
      </g>

      {/* Black Return Lead from Jack (285, 64) to blackPos */}
      <path
        d={
          lead === 'U-V' && dragState?.clip !== 'black'
            ? `M 285 54 C 285 26, ${blackPos.x} 26, ${blackPos.x} ${blackPos.y - 12}`
            : `M 285 54 C 350 20, 405 295, ${blackPos.x - 14} ${blackPos.y}`
        }
        fill="none"
        stroke={isDark ? '#94A3B8' : '#1E293B'}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g
        className={dragState?.clip === 'black' ? 'cursor-grabbing' : 'cursor-grab'}
        onPointerDown={(e) => {
          e.stopPropagation();
          svgRef.current?.setPointerCapture(e.pointerId);
          setDragState({ clip: 'black', x: blackTarget.x, y: blackTarget.y, hovered: null });
        }}
      >
        <circle cx={blackPos.x} cy={blackPos.y} r="18" fill="transparent" />
        <rect
          x={blackPos.x - 18}
          y={blackPos.y - 7}
          width="14"
          height="14"
          rx="3"
          fill="#0F172A"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <circle
          cx={blackPos.x}
          cy={blackPos.y}
          r="7"
          fill="none"
          stroke={isDark ? '#CBD5E1' : '#0F172A'}
          strokeWidth="3"
        />
      </g>

      {/* Drag Hint Label */}
      <text
        x="585"
        y="424"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="600"
        fill="var(--md-on-surface-variant)"
      >
        {pick(
          'Drag red/black clips onto U1, V1, W1, or PE/GND',
          'Seret klip merah/hitam ke U1, V1, W1, atau PE/GND',
          '赤・黒クリップを U1, V1, W1, PE/GND にドラッグ'
        )}
      </text>
    </svg>
  );
}
