import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getScenarioNodes,
  type AnalogRange,
  type AnalogReadout,
  type CircuitState,
  type DigitalDialMode,
  type DigitalReadout,
  type MeterStyle,
  type OhmSubMode,
  type RedJackId,
  type TestNode,
} from './multimeterPhysics';

interface MultimeterSvgProps {
  meterStyle: MeterStyle;
  digitalDial: DigitalDialMode;
  onSelectDigitalDial: (m: DigitalDialMode) => void;
  subMode: OhmSubMode;
  onCycleSubMode: () => void;
  holdActive: boolean;
  onToggleHold: () => void;
  minMaxMode: 'off' | 'min' | 'max' | 'avg';
  onCycleMinMax: () => void;
  onCycleRange: () => void;
  backlightOn: boolean;
  onToggleBacklight: () => void;
  analogRange: AnalogRange;
  redJack: RedJackId;
  onSelectRedJack: (j: RedJackId) => void;
  digitalReadout: DigitalReadout;
  analogReadout: AnalogReadout;
  circuit: CircuitState;
  redNode: string | null;
  blackNode: string | null;
  activeProbe: 'red' | 'black';
  onPlaceProbe: (nodeId: string, which?: 'red' | 'black') => void;
  onLiftProbe: (which: 'red' | 'black') => void;
  onToggleLedSwitch: () => void;
}

const DIGITAL_DIAL_POINTS: {
  mode: DigitalDialMode;
  label: string;
  angle: number;
}[] = [
  { mode: 'OFF', label: 'OFF', angle: -108 },
  { mode: 'V_AC', label: 'V~', angle: -72 },
  { mode: 'V_DC', label: 'V⎓', angle: -36 },
  { mode: 'mV_DC', label: 'mV', angle: 0 },
  { mode: 'OHM_CONT_DIODE', label: 'Ω🔊', angle: 36 },
  { mode: 'HZ', label: 'Hz', angle: 72 },
  { mode: 'MA_A', label: 'mA/A', angle: 108 },
];

const BENCH_OFFSET_X = 250;
const BENCH_OFFSET_Y = 26;
const SNAP_RADIUS = 42;

export function MultimeterSvg({
  meterStyle,
  digitalDial,
  onSelectDigitalDial,
  subMode,
  onCycleSubMode,
  holdActive,
  onToggleHold,
  minMaxMode,
  onCycleMinMax,
  onCycleRange,
  backlightOn,
  onToggleBacklight,
  analogRange,
  redJack,
  onSelectRedJack,
  digitalReadout,
  analogReadout,
  circuit,
  redNode,
  blackNode,
  activeProbe,
  onPlaceProbe,
  onLiftProbe,
  onToggleLedSwitch,
}: MultimeterSvgProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingProbe, setDraggingProbe] = useState<'red' | 'black' | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [snapCandidateId, setSnapCandidateId] = useState<string | null>(null);

  const nodes = getScenarioNodes(circuit.scenario);

  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const findNearestNode = (svgX: number, svgY: number): TestNode | null => {
    let best: TestNode | null = null;
    let bestDist = SNAP_RADIUS;
    for (const n of nodes) {
      const nx = n.x + BENCH_OFFSET_X;
      const ny = n.y + BENCH_OFFSET_Y;
      const dist = Math.hypot(svgX - nx, svgY - ny);
      if (dist <= bestDist) {
        bestDist = dist;
        best = n;
      }
    }
    return best;
  };

  const handleProbePointerDown = (
    which: 'red' | 'black',
    e: ReactPointerEvent<SVGGElement>
  ) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = toSvgCoords(e.clientX, e.clientY);
    setDraggingProbe(which);
    if (pos) {
      setDragPos(pos);
      const near = findNearestNode(pos.x, pos.y);
      setSnapCandidateId(near?.id ?? null);
    }
  };

  const handleSvgPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingProbe) return;
    const pos = toSvgCoords(e.clientX, e.clientY);
    if (!pos) return;
    const clampedX = Math.max(20, Math.min(860, pos.x));
    const clampedY = Math.max(20, Math.min(440, pos.y));
    setDragPos({ x: clampedX, y: clampedY });
    const near = findNearestNode(clampedX, clampedY);
    setSnapCandidateId(near?.id ?? null);
  };

  const handleSvgPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!draggingProbe) return;
    const pos = toSvgCoords(e.clientX, e.clientY);
    if (pos) {
      const near = findNearestNode(pos.x, pos.y);
      if (near) {
        onPlaceProbe(near.id, draggingProbe);
      } else {
        onLiftProbe(draggingProbe);
      }
    }
    setDraggingProbe(null);
    setDragPos(null);
    setSnapCandidateId(null);
  };

  const redPt = nodes.find((n) => n.id === redNode);
  const blackPt = nodes.find((n) => n.id === blackNode);

  // Parked probe positions on the bottom edge of the ESD mat when lifted
  const redTarget =
    draggingProbe === 'red' && dragPos
      ? dragPos
      : redPt
        ? { x: redPt.x + BENCH_OFFSET_X, y: redPt.y + BENCH_OFFSET_Y }
        : { x: 340, y: 424 };

  const blackTarget =
    draggingProbe === 'black' && dragPos
      ? dragPos
      : blackPt
        ? { x: blackPt.x + BENCH_OFFSET_X, y: blackPt.y + BENCH_OFFSET_Y }
        : { x: 300, y: 424 };

  // Meter jack coordinates (left column inside SVG)
  const redJackX =
    redJack === '10A' ? 66 : redJack === 'MA_UA' ? 116 : 216;
  const redJackY = 396;
  const blackJackX = 166;
  const blackJackY = 396;

  const matFill = isDark ? '#0B2239' : '#133A5E';
  const matBorder = isDark ? '#1E4976' : '#0F2D4A';
  const cardFill = isDark ? '#102A43' : '#1E3A5F';
  const canvasBg = 'var(--md-surface-container-low)';

  const activeDial =
    DIGITAL_DIAL_POINTS.find((d) => d.mode === digitalDial) ??
    DIGITAL_DIAL_POINTS[0];

  const lcdFill =
    digitalDial === 'OFF'
      ? '#334155'
      : digitalReadout.isLeadError
        ? '#7F1D1D'
        : backlightOn
          ? '#FEF08A'
          : '#C5D8B6';
  const lcdText =
    digitalDial === 'OFF'
      ? '#64748B'
      : digitalReadout.isLeadError
        ? '#FEE2E2'
        : '#0F291E';

  return (
    <div className="glass-panel rounded-[28px] p-3.5">
      <svg
        ref={svgRef}
        viewBox="0 0 880 460"
        className="w-full h-auto select-none touch-none"
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerCancel={handleSvgPointerUp}
        role="img"
        aria-label={pick(
          'Interactive Multimeter & ESD Workbench',
          'Multimeter Interaktif & Meja Kerja ESD',
          'インタラクティブマルチメータおよびESD作業台'
        )}
      >
        <defs>
          <pattern
            id="esdGrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(148, 163, 184, 0.12)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Outer Canvas */}
        <rect x="0" y="0" width="880" height="460" rx="16" fill={canvasBg} />

        {/* ==================== LEFT: MULTIMETER BODY INSIDE SVG ==================== */}
        {meterStyle === 'digital' ? (
          <g>
            {/* Yellow Holster & Dark Bezel */}
            <rect
              x="16"
              y="18"
              width="250"
              height="424"
              rx="26"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2.5"
            />
            <rect x="28" y="30" width="226" height="400" rx="18" fill="#0F172A" />

            <text x="42" y="49" fill="#FBBF24" fontSize="10" fontWeight="800">
              DMM-87V
            </text>
            <text
              x="240"
              y="49"
              textAnchor="end"
              fill="#94A3B8"
              fontSize="8.5"
              fontWeight="700"
            >
              TRUE RMS
            </text>

            {/* LCD Screen */}
            <rect
              x="38"
              y="57"
              width="206"
              height="92"
              rx="8"
              fill="#020617"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <rect x="43" y="62" width="196" height="82" rx="5" fill={lcdFill} />

            {digitalDial !== 'OFF' && (
              <>
                <text
                  x="49"
                  y="74"
                  fill={lcdText}
                  fontSize="8"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {digitalReadout.rangeLabel} {digitalReadout.polarity}
                </text>
                {holdActive && (
                  <text
                    x="130"
                    y="74"
                    fill={lcdText}
                    fontSize="8"
                    fontWeight="900"
                    fontFamily="var(--font-mono)"
                  >
                    HOLD
                  </text>
                )}
                {minMaxMode !== 'off' && (
                  <text
                    x="164"
                    y="74"
                    fill={lcdText}
                    fontSize="8"
                    fontWeight="900"
                    fontFamily="var(--font-mono)"
                  >
                    {minMaxMode.toUpperCase()}
                  </text>
                )}
                {digitalReadout.isBeep && (
                  <text
                    x="233"
                    y="74"
                    textAnchor="end"
                    fill={lcdText}
                    fontSize="9"
                    fontWeight="800"
                  >
                    )))
                  </text>
                )}

                <text
                  x="184"
                  y="115"
                  textAnchor="end"
                  fill={lcdText}
                  fontSize="31"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {digitalReadout.display}
                </text>
                <text
                  x="234"
                  y="115"
                  textAnchor="end"
                  fill={lcdText}
                  fontSize="10.5"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {digitalReadout.unit}
                </text>

                {Array.from({ length: 60 }).map((_, idx) => (
                  <rect
                    key={idx}
                    x={47 + idx * 3.1}
                    y={128}
                    width={2.1}
                    height={7.5}
                    rx={0.5}
                    fill={
                      idx < digitalReadout.barSegments
                        ? lcdText
                        : 'rgba(15,41,30,0.16)'
                    }
                  />
                ))}
              </>
            )}

            {/* Function Pushbuttons */}
            {[
              { label: 'HOLD', x: 38, onClick: onToggleHold, active: holdActive },
              { label: 'RNG', x: 79, onClick: onCycleRange, active: false },
              {
                label: 'M/M',
                x: 120,
                onClick: onCycleMinMax,
                active: minMaxMode !== 'off',
              },
              {
                label: subMode,
                x: 161,
                onClick: onCycleSubMode,
                active: digitalDial === 'OHM_CONT_DIODE',
              },
              {
                label: 'LIT',
                x: 202,
                onClick: onToggleBacklight,
                active: backlightOn,
              },
            ].map((btn) => (
              <g
                key={btn.label}
                onClick={btn.onClick}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={btn.x}
                  y="156"
                  width="38"
                  height="19"
                  rx="4"
                  fill={btn.active ? '#F59E0B' : '#1E293B'}
                  stroke="#475569"
                />
                <text
                  x={btn.x + 19}
                  y="168.5"
                  textAnchor="middle"
                  fill={btn.active ? '#0F172A' : '#E2E8F0'}
                  fontSize="7"
                  fontWeight="800"
                >
                  {btn.label}
                </text>
              </g>
            ))}

            {/* Rotary Dial */}
            <circle
              cx="141"
              cy="265"
              r="46"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="2"
            />
            {DIGITAL_DIAL_POINTS.map((pt) => {
              const rad = ((pt.angle - 90) * Math.PI) / 180;
              const lx = 141 + Math.cos(rad) * 60;
              const ly = 265 + Math.sin(rad) * 60;
              const isSel = pt.mode === digitalDial;
              return (
                <g
                  key={pt.mode}
                  onClick={() => onSelectDigitalDial(pt.mode)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={lx}
                    cy={ly}
                    r="12.5"
                    fill={isSel ? '#F59E0B' : '#0F172A'}
                    stroke={isSel ? '#FEF3C7' : '#475569'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={lx}
                    y={ly + 3.5}
                    textAnchor="middle"
                    fill={isSel ? '#0F172A' : '#E2E8F0'}
                    fontSize="8"
                    fontWeight="800"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
            <g transform={`rotate(${activeDial.angle} 141 265)`}>
              <circle
                cx="141"
                cy="265"
                r="31"
                fill="#334155"
                stroke="#64748B"
                strokeWidth="2"
              />
              <rect
                x="136"
                y="236"
                width="10"
                height="58"
                rx="4"
                fill="#0F172A"
                stroke="#94A3B8"
              />
              <polygon points="141,238 136,247 146,247" fill="#F59E0B" />
            </g>
          </g>
        ) : (
          <g>
            {/* Analog VOM-20K Body */}
            <rect
              x="16"
              y="18"
              width="250"
              height="424"
              rx="20"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="2.5"
            />
            <rect
              x="28"
              y="32"
              width="226"
              height="160"
              rx="10"
              fill="#F8FAFC"
              stroke="#334155"
              strokeWidth="2"
            />
            <path
              d="M 48 156 A 104 104 0 0 1 234 156"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
            />
            <path
              d="M 60 162 A 92 92 0 0 1 222 162"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="5"
              opacity="0.45"
            />
            <path
              d="M 72 168 A 80 80 0 0 1 210 168"
              fill="none"
              stroke="#0F172A"
              strokeWidth="2"
            />
            <text x="44" y="142" fill="#16A34A" fontSize="9" fontWeight="800">
              ∞ Ω
            </text>
            <text
              x="238"
              y="142"
              textAnchor="end"
              fill="#16A34A"
              fontSize="9"
              fontWeight="800"
            >
              0 Ω
            </text>
            <text
              x="141"
              y="56"
              textAnchor="middle"
              fill="#0F172A"
              fontSize="9"
              fontWeight="700"
            >
              VOM-20K MIRRORED SCALE
            </text>
            <text
              x="141"
              y="182"
              textAnchor="middle"
              fill="#0369A1"
              fontSize="9.5"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {analogReadout.scaleText}
            </text>
            <g
              transform={`rotate(${analogReadout.needleDeg} 141 170)`}
              style={{
                transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              <line
                x1="141"
                y1="170"
                x2="141"
                y2="56"
                stroke="#DC2626"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>
            <circle
              cx="141"
              cy="170"
              r="7.5"
              fill="#0F172A"
              stroke="#94A3B8"
              strokeWidth="2"
            />

            <rect
              x="38"
              y="222"
              width="206"
              height="60"
              rx="10"
              fill="#0F172A"
              stroke="#334155"
            />
            <text
              x="141"
              y="245"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontWeight="700"
            >
              ANALOG RANGE
            </text>
            <text
              x="141"
              y="266"
              textAnchor="middle"
              fill="#38BDF8"
              fontSize="14"
              fontWeight="800"
              fontFamily="var(--font-mono)"
            >
              {analogRange.replace('_', ' ')}
            </text>
          </g>
        )}

        {/* Shared Interactive Input Jacks (Inside Meter Body) */}
        <g onClick={() => onSelectRedJack('10A')} style={{ cursor: 'pointer' }}>
          <circle
            cx="66"
            cy="396"
            r="14"
            fill="#7F1D1D"
            stroke={redJack === '10A' ? '#FDE047' : '#EF4444'}
            strokeWidth="2.5"
          />
          <circle cx="66" cy="396" r="6" fill="#020617" />
          <text
            x="66"
            y="420"
            textAnchor="middle"
            fill="#FCA5A5"
            fontSize="8"
            fontWeight="700"
          >
            10A
          </text>
        </g>
        <g
          onClick={() => onSelectRedJack('MA_UA')}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx="116"
            cy="396"
            r="14"
            fill="#7F1D1D"
            stroke={redJack === 'MA_UA' ? '#FDE047' : '#EF4444'}
            strokeWidth="2.5"
          />
          <circle cx="116" cy="396" r="6" fill="#020617" />
          <text
            x="116"
            y="420"
            textAnchor="middle"
            fill="#FCA5A5"
            fontSize="8"
            fontWeight="700"
          >
            mA/µA
          </text>
        </g>
        <g>
          <circle
            cx="166"
            cy="396"
            r="14"
            fill="#0F172A"
            stroke="#CBD5E1"
            strokeWidth="2.5"
          />
          <circle cx="166" cy="396" r="6" fill="#020617" />
          <text
            x="166"
            y="420"
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize="8"
            fontWeight="700"
          >
            COM
          </text>
        </g>
        <g
          onClick={() => onSelectRedJack('V_OHM_HZ')}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx="216"
            cy="396"
            r="14"
            fill="#7F1D1D"
            stroke={redJack === 'V_OHM_HZ' ? '#FDE047' : '#EF4444'}
            strokeWidth="2.5"
          />
          <circle cx="216" cy="396" r="6" fill="#020617" />
          <text
            x="216"
            y="420"
            textAnchor="middle"
            fill="#FCA5A5"
            fontSize="8"
            fontWeight="700"
          >
            V-Ω-Hz
          </text>
        </g>

        {/* ==================== RIGHT: 6-SCENARIO ESD WORKBENCH ==================== */}
        <rect
          x="278"
          y="18"
          width="586"
          height="424"
          rx="16"
          fill={matFill}
          stroke={matBorder}
          strokeWidth="2"
        />
        <rect
          x="278"
          y="18"
          width="586"
          height="424"
          rx="16"
          fill="url(#esdGrid)"
        />
        <circle
          cx="298"
          cy="38"
          r="6"
          fill="#94A3B8"
          stroke="#475569"
          strokeWidth="2"
        />
        <text
          x="312"
          y="42"
          fill="#BAE6FD"
          fontSize="10.5"
          fontWeight="700"
          letterSpacing="0.5"
        >
          ESD WORKBENCH —{' '}
          {pick(
            'Drag Red/Black probes or click terminal',
            'Seret probe Merah/Hitam atau klik terminal',
            '赤・黒プローブをドラッグまたは端子をクリック'
          )}{' '}
          [{activeProbe === 'red' ? 'RED +' : 'COM'}]
        </text>

        <g transform={`translate(${BENCH_OFFSET_X}, ${BENCH_OFFSET_Y})`}>
          {circuit.scenario === 'batteries' && (
            <g>
              <rect
                x="85"
                y="95"
                width="135"
                height="195"
                rx="12"
                fill="#1E293B"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <rect x="85" y="150" width="135" height="90" fill="#D97706" />
              <text
                x="152"
                y="198"
                textAnchor="middle"
                fill="#0F172A"
                fontSize="22"
                fontWeight="900"
              >
                9V
              </text>
              <text
                x="152"
                y="220"
                textAnchor="middle"
                fill="#FEF3C7"
                fontSize="10"
                fontWeight="700"
              >
                ALKALINE (9.24V)
              </text>

              <rect
                x="310"
                y="110"
                width="60"
                height="125"
                rx="10"
                fill="#0284C7"
                stroke="#7DD3FC"
                strokeWidth="1.5"
              />
              <rect x="310" y="155" width="60" height="45" fill="#0F172A" />
              <text
                x="340"
                y="182"
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="14"
                fontWeight="800"
              >
                1.5V
              </text>
              <text
                x="340"
                y="256"
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="10"
                fontWeight="700"
              >
                AA CELL (1.56V)
              </text>

              <rect
                x="440"
                y="115"
                width="160"
                height="165"
                rx="10"
                fill="#334155"
                stroke="#94A3B8"
                strokeWidth="2"
              />
              <rect
                x="454"
                y="170"
                width="132"
                height="60"
                rx="6"
                fill="#0F172A"
              />
              <text
                x="520"
                y="198"
                textAnchor="middle"
                fill="#34D399"
                fontSize="16"
                fontWeight="800"
              >
                12V AGM
              </text>
              <text
                x="520"
                y="216"
                textAnchor="middle"
                fill="#CBD5E1"
                fontSize="10"
                fontWeight="600"
              >
                12.68 V DC
              </text>
            </g>
          )}

          {circuit.scenario === 'dividers' && (
            <g>
              <rect
                x="90"
                y="75"
                width="460"
                height="260"
                rx="14"
                fill={cardFill}
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <text
                x="320"
                y="102"
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="12"
                fontWeight="700"
              >
                RESISTIVE VOLTAGE DIVIDER (Vin = 12.00 V DC)
              </text>
              <polyline
                points="140,115 260,115 260,205 340,205"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <polyline
                points="260,205 260,295 140,295"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="3"
              />
              <rect
                x="234"
                y="135"
                width="52"
                height="36"
                rx="6"
                fill="#0F172A"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              <text
                x="260"
                y="157"
                textAnchor="middle"
                fill="#FBBF24"
                fontSize="11"
                fontWeight="700"
              >
                R1
              </text>
              <rect
                x="234"
                y="232"
                width="52"
                height="38"
                rx="6"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="2"
              />
              <text
                x="260"
                y="255"
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="10"
                fontWeight="700"
              >
                POT {Math.round(circuit.potRatio * 100)}%
              </text>
              <text
                x="455"
                y="209"
                fill="#34D399"
                fontSize="13"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                Vout = {(12 * circuit.potRatio).toFixed(2)} V
              </text>
            </g>
          )}

          {circuit.scenario === 'led' && (
            <g>
              <rect
                x="75"
                y="80"
                width="490"
                height="250"
                rx="14"
                fill={cardFill}
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <text
                x="320"
                y="104"
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="12"
                fontWeight="700"
              >
                9V LED CIRCUIT — Click Switch ({circuit.ledSwitchOn ? 'ON' : 'OFF'})
              </text>
              <line
                x1="120"
                y1="130"
                x2="170"
                y2="130"
                stroke="#EF4444"
                strokeWidth="3.5"
              />
              <line
                x1="220"
                y1="130"
                x2="425"
                y2="130"
                stroke="#F59E0B"
                strokeWidth="3.5"
              />
              <line
                x1="425"
                y1="130"
                x2="425"
                y2="280"
                stroke="#F59E0B"
                strokeWidth="3.5"
              />
              <polyline
                points="425,280 120,280 120,130"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="3.5"
              />
              <g onClick={onToggleLedSwitch} style={{ cursor: 'pointer' }}>
                <rect
                  x="165"
                  y="110"
                  width="60"
                  height="40"
                  rx="8"
                  fill="#0F172A"
                  stroke="#38BDF8"
                  strokeWidth="2"
                />
                <line
                  x1="175"
                  y1="130"
                  x2="215"
                  y2={circuit.ledSwitchOn ? '130' : '116'}
                  stroke={circuit.ledSwitchOn ? '#34D399' : '#F87171'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text
                  x="195"
                  y="164"
                  textAnchor="middle"
                  fill="#BAE6FD"
                  fontSize="9.5"
                  fontWeight="700"
                >
                  SW1 ({circuit.ledSwitchOn ? 'CLOSED' : 'OPEN'})
                </text>
              </g>
              <rect
                x="310"
                y="116"
                width="68"
                height="28"
                rx="6"
                fill="#B45309"
                stroke="#FDE68A"
                strokeWidth="1.5"
              />
              <text
                x="344"
                y="134"
                textAnchor="middle"
                fill="#FEF3C7"
                fontSize="10.5"
                fontWeight="800"
              >
                330 Ω
              </text>
              <circle
                cx="425"
                cy="205"
                r={circuit.ledSwitchOn ? '24' : '16'}
                fill={
                  circuit.ledSwitchOn
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'transparent'
                }
              />
              <circle
                cx="425"
                cy="205"
                r="14"
                fill={circuit.ledSwitchOn ? '#EF4444' : '#7F1D1D'}
                stroke="#FCA5A5"
                strokeWidth="2"
              />
              <text
                x="458"
                y="209"
                fill="#FCA5A5"
                fontSize="10.5"
                fontWeight="700"
              >
                {circuit.ledSwitchOn ? 'LED ON (1.92V)' : 'LED OFF'}
              </text>
            </g>
          )}

          {circuit.scenario === 'ac-outlet' && (
            <g>
              <rect
                x="175"
                y="78"
                width="310"
                height="255"
                rx="18"
                fill="#E2E8F0"
                stroke="#94A3B8"
                strokeWidth="3"
              />
              <circle
                cx="330"
                cy="205"
                r="88"
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeWidth="3"
              />
              <text
                x="330"
                y="106"
                textAnchor="middle"
                fill="#0F172A"
                fontSize="12"
                fontWeight="800"
              >
                230V AC 50Hz RECEPTACLE
              </text>
              <text
                x="330"
                y="314"
                textAnchor="middle"
                fill={circuit.acFault === 'normal' ? '#059669' : '#DC2626'}
                fontSize="11"
                fontWeight="800"
              >
                STATUS: {circuit.acFault.toUpperCase()}
              </text>
            </g>
          )}

          {circuit.scenario === 'components' && (
            <g>
              <rect
                x="65"
                y="75"
                width="450"
                height="285"
                rx="14"
                fill={cardFill}
                stroke="#38BDF8"
                strokeWidth="1.5"
              />
              <text
                x="290"
                y="96"
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="11"
                fontWeight="700"
              >
                ISOLATED COMPONENT TRAY (Test Ω, Continuity, Diode)
              </text>
              <line
                x1="115"
                y1="115"
                x2="215"
                y2="115"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <rect x="145" y="105" width="40" height="20" rx="4" fill="#92400E" />
              <line
                x1="365"
                y1="115"
                x2="465"
                y2="115"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <rect x="395" y="105" width="40" height="20" rx="4" fill="#1E40AF" />
              <line
                x1="115"
                y1="220"
                x2="215"
                y2="220"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              <polygon points="155,210 155,230 175,220" fill="#38BDF8" />
              <line
                x1="365"
                y1="220"
                x2="465"
                y2="220"
                stroke="#22C55E"
                strokeWidth="4"
              />
              <line
                x1="115"
                y1="315"
                x2="215"
                y2="315"
                stroke="#EF4444"
                strokeWidth="3"
                strokeDasharray="5 4"
              />
              <path
                d="M 365 315 Q 385 295 400 315 Q 415 295 430 315 Q 445 295 465 315"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3"
              />
            </g>
          )}

          {circuit.scenario === 'fault' && (
            <g>
              <rect
                x="70"
                y="82"
                width="450"
                height="250"
                rx="14"
                fill={cardFill}
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
              <text
                x="295"
                y="106"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="12"
                fontWeight="700"
              >
                24V DC CONTROL TROUBLESHOOTING CHALLENGE
              </text>
              <line
                x1="115"
                y1="145"
                x2="255"
                y2="145"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <rect
                x="165"
                y="135"
                width="40"
                height="20"
                rx="4"
                fill="#0F172A"
                stroke="#F59E0B"
              />
              <text
                x="185"
                y="149"
                textAnchor="middle"
                fill="#FDE68A"
                fontSize="9.5"
                fontWeight="700"
              >
                F1 2A
              </text>
              <line
                x1="255"
                y1="145"
                x2="405"
                y2="145"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              <text
                x="330"
                y="136"
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="9.5"
                fontWeight="700"
              >
                WIRE W2
              </text>
              <line
                x1="405"
                y1="145"
                x2="405"
                y2="280"
                stroke="#94A3B8"
                strokeWidth="3"
              />
              <rect
                x="378"
                y="192"
                width="54"
                height="44"
                rx="6"
                fill="#0F172A"
                stroke="#38BDF8"
              />
              <text
                x="405"
                y="218"
                textAnchor="middle"
                fill="#38BDF8"
                fontSize="9.5"
                fontWeight="700"
              >
                COIL/D1
              </text>
            </g>
          )}

          {/* Clickable / Snap Target Terminal Nodes */}
          {nodes.map((node) => {
            const isRed = redNode === node.id;
            const isBlack = blackNode === node.id;
            const isSnapTarget = snapCandidateId === node.id;
            return (
              <g
                key={node.id}
                onClick={() => onPlaceProbe(node.id)}
                style={{ cursor: 'pointer' }}
              >
                {isSnapTarget && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="21"
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="14"
                  fill={
                    isRed && isBlack
                      ? '#A855F7'
                      : isRed
                        ? '#EF4444'
                        : isBlack
                          ? '#1E293B'
                          : '#0F172A'
                  }
                  stroke={
                    isSnapTarget
                      ? '#FDE047'
                      : isRed
                        ? '#FCA5A5'
                        : isBlack
                          ? '#E2E8F0'
                          : '#38BDF8'
                  }
                  strokeWidth="2.5"
                />
                <circle cx={node.x} cy={node.y} r="4.5" fill="#E2E8F0" />
                <text
                  x={node.x}
                  y={node.y + 26}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="10"
                  fontWeight="700"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* ==================== FLEXIBLE SILICONE LEADS + DRAGGABLE PROBES ==================== */}
        {/* Black Cable & Draggable Probe */}
        <path
          d={`M ${blackJackX} ${blackJackY} C ${blackJackX} 452, ${blackTarget.x - 45} 452, ${blackTarget.x} ${blackTarget.y + 6}`}
          fill="none"
          stroke="#0F172A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d={`M ${blackJackX} ${blackJackY} C ${blackJackX} 452, ${blackTarget.x - 45} 452, ${blackTarget.x} ${blackTarget.y + 6}`}
          fill="none"
          stroke="#64748B"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <g
          onPointerDown={(e) => handleProbePointerDown('black', e)}
          style={{ cursor: draggingProbe === 'black' ? 'grabbing' : 'grab' }}
        >
          <circle
            cx={blackTarget.x}
            cy={blackTarget.y}
            r="14"
            fill="transparent"
          />
          <circle
            cx={blackTarget.x}
            cy={blackTarget.y}
            r="7"
            fill="#0F172A"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
          <text
            x={blackTarget.x}
            y={blackTarget.y - 12}
            textAnchor="middle"
            fill="#E2E8F0"
            fontSize="8.5"
            fontWeight="800"
          >
            COM
          </text>
        </g>

        {/* Red Cable & Draggable Probe */}
        <path
          d={`M ${redJackX} ${redJackY} C ${redJackX + 20} 446, ${redTarget.x - 35} 438, ${redTarget.x} ${redTarget.y - 6}`}
          fill="none"
          stroke="#DC2626"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <g
          onPointerDown={(e) => handleProbePointerDown('red', e)}
          style={{ cursor: draggingProbe === 'red' ? 'grabbing' : 'grab' }}
        >
          <circle cx={redTarget.x} cy={redTarget.y} r="14" fill="transparent" />
          <circle
            cx={redTarget.x}
            cy={redTarget.y}
            r="7"
            fill="#EF4444"
            stroke="#FEE2E2"
            strokeWidth="2"
          />
          <text
            x={redTarget.x}
            y={redTarget.y - 12}
            textAnchor="middle"
            fill="#FCA5A5"
            fontSize="8.5"
            fontWeight="800"
          >
            RED+
          </text>
        </g>
      </svg>
    </div>
  );
}
