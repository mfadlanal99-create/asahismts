import { useRef, useState } from 'react';
import { degToRad } from '../../physics';
import { getMicrometerBreakdown, snapToLeastCount } from './caliperMath';
import type { PresetPart } from './caliperTypes';

interface MicrometerSvgProps {
  observedMm: number;
  theme: 'light' | 'dark';
  activePart: PresetPart | null;
  hideReadout: boolean;
  showLoupe: boolean;
  loupeZoom: number;
  parallaxAngleDeg?: number;
  qcSpecLabel?: string;
  onChangeObserved: (nextMm: number) => void;
}

const ANVIL_X = 115;
const SPINDLE_PX_PER_MM = 4.6;
const SLEEVE_ZERO_X = 365;
const SLEEVE_PX_PER_MM = 7.4;
const DATUM_Y = 128;

export function MicrometerSvg({
  observedMm,
  theme,
  activePart,
  hideReadout,
  showLoupe,
  loupeZoom,
  parallaxAngleDeg = 0,
  qcSpecLabel,
  onChangeObserved,
}: MicrometerSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startMm: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isDark = theme === 'dark';
  const breakdown = getMicrometerBreakdown(observedMm);
  const spindleFaceX = ANVIL_X + breakdown.observedMm * SPINDLE_PX_PER_MM;
  const thimbleEdgeX = SLEEVE_ZERO_X + breakdown.observedMm * SLEEVE_PX_PER_MM;

  const c = {
    frame: isDark ? '#334155' : '#cbd5e1',
    frameStroke: isDark ? '#64748b' : '#475569',
    metalLight: isDark ? '#475569' : '#f8fafc',
    metalMid: isDark ? '#1e293b' : '#e2e8f0',
    metalDark: isDark ? '#0f172a' : '#cbd5e1',
    tick: isDark ? '#f1f5f9' : '#0f172a',
    tickSubtle: isDark ? '#94a3b8' : '#475569',
    accent: 'var(--md-primary)',
    coincide: '#10b981',
    partFill: isDark ? '#0369a1' : '#bae6fd',
    partStroke: isDark ? '#38bdf8' : '#0284c7',
    calloutBg: 'var(--md-surface-container-low)',
    calloutBorder: 'var(--md-primary)',
    calloutText: 'var(--md-primary)',
  };

  function clientToSvgDelta(deltaClientX: number, deltaClientY: number) {
    const svg = svgRef.current;
    if (!svg) return { dx: 0, dy: 0 };
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return { dx: 0, dy: 0 };
    const scale = 860 / rect.width;
    return { dx: deltaClientX * scale, dy: deltaClientY * scale };
  }

  function handlePointerDown(e: React.PointerEvent<SVGGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startMm: breakdown.observedMm,
    };
    setIsDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<SVGGElement>) {
    if (!dragRef.current) return;
    const { dx, dy } = clientToSvgDelta(
      e.clientX - dragRef.current.startX,
      e.clientY - dragRef.current.startY
    );
    // Horizontal drag moves sleeve; vertical drag gives fine rotation
    const deltaMm = dx / SLEEVE_PX_PER_MM + dy * 0.004;
    onChangeObserved(snapToLeastCount(dragRef.current.startMm + deltaMm, 0.01, 25));
  }

  function handlePointerUp(e: React.PointerEvent<SVGGElement>) {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragRef.current = null;
      setIsDragging(false);
    }
  }

  // Sleeve ticks 0..25 mm
  const fullMmTicks: number[] = [];
  for (let i = 0; i <= 25; i++) fullMmTicks.push(i);

  // Visible thimble divisions around current thimbleDiv
  const visibleThimbleDivs: { div: number; offset: number }[] = [];
  for (let offset = -12; offset <= 12; offset++) {
    const div = (((breakdown.thimbleDiv + offset) % 50) + 50) % 50;
    visibleThimbleDivs.push({ div, offset });
  }

  // Loupe viewBox centered on thimble edge & datum line
  const loupeViewW = 240 / loupeZoom;
  const loupeViewH = Math.max(50, 144 / loupeZoom);
  const loupeViewX = thimbleEdgeX - loupeViewW * 0.48;
  const loupeViewY = DATUM_Y - loupeViewH / 2;

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)]">
        <svg
          ref={svgRef}
          viewBox="0 0 860 285"
          className="w-full max-h-[360px] h-auto select-none touch-none mx-auto"
          aria-label="Interactive Outside Micrometer Scale"
        >
          <defs>
            <linearGradient id="microCylinderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.metalDark} />
              <stop offset="30%" stopColor={c.metalLight} />
              <stop offset="70%" stopColor={c.metalMid} />
              <stop offset="100%" stopColor={c.metalDark} />
            </linearGradient>
            <pattern
              id="microHatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke={c.partStroke}
                strokeWidth="1.2"
                opacity="0.35"
              />
            </pattern>
            <marker
              id="microDimArrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill={c.partStroke} />
            </marker>
          </defs>

          {/* C-Frame */}
          <path
            d="M 92 106 L 92 162 C 92 242, 165 268, 225 268 C 292 268, 340 220, 340 156 L 340 100 L 308 100 L 308 156 C 308 202, 272 234, 225 234 C 178 234, 126 212, 126 156 L 126 106 Z"
            fill={c.frame}
            stroke={c.frameStroke}
            strokeWidth={1.6}
          />
          <text
            x={225}
            y={254}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={c.tickSubtle}
          >
            0–25 mm · 0.01 mm
          </text>

          {/* Fixed Anvil */}
          <rect
            x={94}
            y={114}
            width={ANVIL_X - 94}
            height={28}
            rx={2}
            fill="url(#microCylinderGrad)"
            stroke={c.frameStroke}
            strokeWidth={1.3}
          />

          {/* Visual Test Part between Anvil and Spindle */}
          {activePart && breakdown.observedMm > 0.2 && (() => {
            const gapW = Math.max(2, spindleFaceX - ANVIL_X);
            const labelX = Math.max(152, ANVIL_X + gapW / 2);
            const dimLabel =
              qcSpecLabel ?? (hideReadout ? '?.?? mm' : `${breakdown.observedMm.toFixed(2)} mm`);
            const namePillW = Math.max(90, activePart.name.length * 5.8 + 14);
            const dimPillW = Math.max(72, dimLabel.length * 5.8 + 14);
            return (
              <g opacity={0.95}>
                <rect
                  x={ANVIL_X}
                  y={104}
                  width={gapW}
                  height={48}
                  rx={3}
                  fill={c.partFill}
                  stroke={c.partStroke}
                  strokeWidth={1.5}
                />
                <rect
                  x={ANVIL_X}
                  y={104}
                  width={gapW}
                  height={48}
                  rx={3}
                  fill="url(#microHatch)"
                />
                {/* Dimension Arrow */}
                {gapW >= 10 && (
                  <line
                    x1={ANVIL_X + 3}
                    y1={164}
                    x2={spindleFaceX - 3}
                    y2={164}
                    stroke={c.partStroke}
                    strokeWidth={1.1}
                    markerStart="url(#microDimArrow)"
                    markerEnd="url(#microDimArrow)"
                  />
                )}
                {/* Top Name Pill */}
                <rect
                  x={labelX - namePillW / 2}
                  y={76}
                  width={namePillW}
                  height={17}
                  rx={8.5}
                  fill={c.calloutBg}
                  stroke={c.calloutBorder}
                  strokeWidth={1}
                />
                <text
                  x={labelX}
                  y={88}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                  fill={c.calloutText}
                >
                  {activePart.name}
                </text>
                {/* Bottom Dimension Pill */}
                <rect
                  x={labelX - dimPillW / 2}
                  y={170}
                  width={dimPillW}
                  height={17}
                  rx={8.5}
                  fill={c.calloutBg}
                  stroke={c.calloutBorder}
                  strokeWidth={1}
                />
                <text
                  x={labelX}
                  y={182}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill={c.calloutText}
                >
                  {dimLabel}
                </text>
              </g>
            );
          })()}

          {/* Moving Spindle */}
          <rect
            x={spindleFaceX}
            y={116}
            width={340 - spindleFaceX}
            height={24}
            fill="url(#microCylinderGrad)"
            stroke={c.frameStroke}
            strokeWidth={1.2}
          />

          {/* Lock Nut / Collar */}
          <rect
            x={334}
            y={102}
            width={22}
            height={52}
            rx={3}
            fill={c.metalMid}
            stroke={c.frameStroke}
            strokeWidth={1.3}
          />

          {/* Fixed Sleeve (Barrel) */}
          <rect
            x={356}
            y={104}
            width={215}
            height={48}
            rx={2}
            fill="url(#microCylinderGrad)"
            stroke={c.frameStroke}
            strokeWidth={1.3}
          />

          {/* Horizontal Datum Line on Sleeve */}
          <line
            x1={SLEEVE_ZERO_X - 4}
            y1={DATUM_Y}
            x2={565}
            y2={DATUM_Y}
            stroke={c.tick}
            strokeWidth={1.3}
          />

          {/* Sleeve Ticks (1 mm upper, 0.5 mm lower) */}
          {fullMmTicks.map((mm) => {
            const x = SLEEVE_ZERO_X + mm * SLEEVE_PX_PER_MM;
            const isFive = mm % 5 === 0;
            const halfX = x + 0.5 * SLEEVE_PX_PER_MM;
            return (
              <g key={mm}>
                {/* Upper 1 mm tick */}
                <line
                  x1={x}
                  y1={DATUM_Y}
                  x2={x}
                  y2={DATUM_Y - (isFive ? 14 : 9)}
                  stroke={c.tick}
                  strokeWidth={isFive ? 1.3 : 0.9}
                />
                {isFive && (
                  <text
                    x={x}
                    y={DATUM_Y - 17}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="var(--font-mono)"
                    fill={c.tick}
                  >
                    {mm}
                  </text>
                )}
                {/* Lower 0.5 mm tick */}
                {mm < 25 && (
                  <line
                    x1={halfX}
                    y1={DATUM_Y}
                    x2={halfX}
                    y2={DATUM_Y + 9}
                    stroke={c.tick}
                    strokeWidth={0.9}
                  />
                )}
              </g>
            );
          })}

          {/* Rotating Thimble + Ratchet Stop (Draggable) */}
          <g
            transform={`translate(${thimbleEdgeX}, 0)`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Beveled Thimble Nose */}
            <polygon
              points="0,104 28,92 28,164 0,152"
              fill="url(#microCylinderGrad)"
              stroke={c.frameStroke}
              strokeWidth={1.4}
            />
            {/* Main Thimble Body */}
            <rect
              x={28}
              y={92}
              width={135}
              height={72}
              rx={2}
              fill="url(#microCylinderGrad)"
              stroke={c.frameStroke}
              strokeWidth={1.4}
            />
            {/* Knurled Grip */}
            <rect
              x={92}
              y={94}
              width={66}
              height={68}
              fill={c.metalDark}
              opacity={0.45}
            />
            {/* Ratchet Stop with Rotating Knurl Ridges */}
            <rect
              x={163}
              y={108}
              width={36}
              height={40}
              rx={3}
              fill={c.metalMid}
              stroke={c.frameStroke}
              strokeWidth={1.3}
            />
            <rect
              x={199}
              y={114}
              width={16}
              height={28}
              rx={2}
              fill={c.accent}
              opacity={0.85}
            />
            {[-2, -1, 0, 1, 2].map((rIdx) => {
              const phase = ((breakdown.thimbleDiv % 10) / 10) * 6;
              const ry = 128 + rIdx * 6 + (phase - 3);
              if (ry < 112 || ry > 144) return null;
              return (
                <line
                  key={rIdx}
                  x1={168}
                  y1={ry}
                  x2={194}
                  y2={ry}
                  stroke={c.frameStroke}
                  strokeWidth={1}
                  opacity={0.65}
                />
              );
            })}

            {/* Thimble Circular Scale Divisions */}
            {visibleThimbleDivs.map(({ div, offset }) => {
              const y = DATUM_Y - offset * 3.8;
              if (y < 95 || y > 161) return null;
              const isFive = div % 5 === 0;
              const isAligned = !hideReadout && offset === 0;
              const tickLen = isFive ? 16 : 10;
              const opacity = Math.max(0.25, 1 - Math.abs(offset) / 14);
              return (
                <g key={`${div}-${offset}`} opacity={opacity}>
                  <line
                    x1={0}
                    y1={y}
                    x2={tickLen}
                    y2={y}
                    stroke={isAligned ? c.coincide : c.tick}
                    strokeWidth={isAligned ? 2 : isFive ? 1.2 : 0.8}
                  />
                  {isFive && (
                    <text
                      x={20}
                      y={y + 3}
                      fontSize="8.5"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      fill={isAligned ? c.coincide : c.tick}
                    >
                      {div}
                    </text>
                  )}
                </g>
              );
            })}

            <text
              x={96}
              y={180}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="500"
              fontFamily="var(--font-sans)"
              fill={c.tickSubtle}
            >
              Drag thimble horizontally or vertically
            </text>
          </g>
        </svg>
      </div>

      {/* Magnifier Loupe for Micrometer Sleeve + Thimble */}
      {showLoupe && (
        <div className="rounded-[24px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="text-xs font-bold text-[var(--md-primary)]">
              Magnifier Loupe ({loupeZoom}× Optical Zoom — Sleeve & Thimble Datum)
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--md-on-surface-variant)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-5 border-t-2 border-dashed border-[var(--md-primary)]" />
                Thimble Edge (Sleeve)
              </span>
              {!hideReadout && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-5 border-t-2 border-dashed border-emerald-500" />
                  Datum Align (#{breakdown.thimbleDiv})
                </span>
              )}
              {parallaxAngleDeg !== 0 && (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="inline-block w-5 border-t-2 border-dashed border-amber-500" />
                  Parallax ({parallaxAngleDeg > 0 ? '+' : ''}
                  {parallaxAngleDeg}°):{' '}
                  {parallaxAngleDeg > 0 ? '+' : ''}
                  {(0.5 * Math.tan(degToRad(parallaxAngleDeg))).toFixed(2)} mm shift
                </span>
              )}
            </div>
          </div>

          <svg
            viewBox={`${loupeViewX} ${loupeViewY} ${loupeViewW} ${loupeViewH}`}
            className="w-full max-h-[160px] h-32 rounded-2xl border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-lowest)]"
            aria-label="Magnified Micrometer Scale View"
          >
            {/* Sleeve */}
            <rect
              x={SLEEVE_ZERO_X - 10}
              y={104}
              width={220}
              height={48}
              fill={c.metalMid}
              stroke={c.frameStroke}
              strokeWidth={0.5}
            />
            <line
              x1={SLEEVE_ZERO_X - 4}
              y1={DATUM_Y}
              x2={thimbleEdgeX}
              y2={DATUM_Y}
              stroke={c.tick}
              strokeWidth={0.7}
            />
            {fullMmTicks.map((mm) => {
              const x = SLEEVE_ZERO_X + mm * SLEEVE_PX_PER_MM;
              const isFive = mm % 5 === 0;
              const halfX = x + 0.5 * SLEEVE_PX_PER_MM;
              return (
                <g key={`lm-${mm}`}>
                  <line
                    x1={x}
                    y1={DATUM_Y}
                    x2={x}
                    y2={DATUM_Y - (isFive ? 14 : 9)}
                    stroke={c.tick}
                    strokeWidth={isFive ? 0.75 : 0.45}
                  />
                  {isFive && (
                    <text
                      x={x}
                      y={DATUM_Y - 16}
                      textAnchor="middle"
                      fontSize="5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                      fill={c.tick}
                    >
                      {mm}
                    </text>
                  )}
                  {mm < 25 && (
                    <line
                      x1={halfX}
                      y1={DATUM_Y}
                      x2={halfX}
                      y2={DATUM_Y + 9}
                      stroke={c.tick}
                      strokeWidth={0.45}
                    />
                  )}
                </g>
              );
            })}

            {/* Thimble */}
            <g transform={`translate(${thimbleEdgeX}, 0)`}>
              <polygon
                points="0,104 28,92 28,164 0,152"
                fill={c.metalLight}
                stroke={c.frameStroke}
                strokeWidth={0.7}
              />
              <rect
                x={28}
                y={92}
                width={100}
                height={72}
                fill={c.metalMid}
                stroke={c.frameStroke}
                strokeWidth={0.7}
              />
              {visibleThimbleDivs.map(({ div, offset }) => {
                const y = DATUM_Y - offset * 3.8;
                if (y < 95 || y > 161) return null;
                const isFive = div % 5 === 0;
                const isAligned = !hideReadout && offset === 0;
                return (
                  <g key={`lt-${div}-${offset}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={isFive ? 15 : 9}
                      y2={y}
                      stroke={isAligned ? c.coincide : c.tick}
                      strokeWidth={isAligned ? 1.0 : isFive ? 0.65 : 0.4}
                    />
                    {isFive && (
                      <text
                        x={18}
                        y={y + 1.8}
                        fontSize="4.8"
                        fontWeight="700"
                        fontFamily="var(--font-mono)"
                        fill={isAligned ? c.coincide : c.tick}
                      >
                        {div}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
            {/* Vertical Striped Index Line at Thimble Beveled Edge */}
            <g>
              <rect
                x={thimbleEdgeX - 1.2}
                y={DATUM_Y - 24}
                width={2.4}
                height={48}
                fill={c.accent}
                opacity={0.14}
              />
              <line
                x1={thimbleEdgeX}
                y1={DATUM_Y - 24}
                x2={thimbleEdgeX}
                y2={DATUM_Y + 24}
                stroke={c.accent}
                strokeWidth={0.95}
                strokeDasharray="2.5 1.5"
              />
            </g>

            {/* Horizontal Striped Alignment Line along Datum & Aligned Thimble Div */}
            {!hideReadout && (
              <g>
                <rect
                  x={thimbleEdgeX - 24}
                  y={DATUM_Y - 1.2}
                  width={50}
                  height={2.4}
                  fill={c.coincide}
                  opacity={0.16}
                />
                <line
                  x1={thimbleEdgeX - 24}
                  y1={DATUM_Y}
                  x2={thimbleEdgeX + 26}
                  y2={DATUM_Y}
                  stroke={c.coincide}
                  strokeWidth={1.0}
                  strokeDasharray="2.5 1.5"
                />
              </g>
            )}

            {/* Parallax Apparent Shift Line */}
            {parallaxAngleDeg !== 0 && (() => {
              const pShiftPx =
                0.5 * Math.tan(degToRad(parallaxAngleDeg)) * SLEEVE_PX_PER_MM;
              return (
                <line
                  x1={thimbleEdgeX + pShiftPx}
                  y1={DATUM_Y - 24}
                  x2={thimbleEdgeX + pShiftPx}
                  y2={DATUM_Y + 24}
                  stroke="#f59e0b"
                  strokeWidth={0.95}
                  strokeDasharray="2 1.5"
                />
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
}
