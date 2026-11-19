import { useRef, useState } from 'react';
import { degToRad } from '../../physics';
import { getVernierBreakdown, snapToLeastCount } from './caliperMath';
import type { PresetPart } from './caliperTypes';

interface VernierSvgProps {
  observedMm: number;
  leastCount: 0.02 | 0.05;
  maxMm: number;
  theme: 'light' | 'dark';
  activePart: PresetPart | null;
  hideReadout: boolean;
  showLoupe: boolean;
  loupeZoom: number;
  parallaxAngleDeg?: number;
  qcSpecLabel?: string;
  onChangeObserved: (nextMm: number) => void;
}

type LoupeFocus = 'full' | 'msr' | 'coinciding';

const PX_PER_MM = 6.2;
const ZERO_X = 125;
const BEAM_Y = 122;
const BEAM_H = 44;
const SEAM_Y = BEAM_Y + BEAM_H;

export function VernierSvg({
  observedMm,
  leastCount,
  maxMm,
  theme,
  activePart,
  hideReadout,
  showLoupe,
  loupeZoom,
  parallaxAngleDeg = 0,
  qcSpecLabel,
  onChangeObserved,
}: VernierSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ startX: number; startMm: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loupeFocus, setLoupeFocus] = useState<LoupeFocus>('full');

  const isDark = theme === 'dark';
  const breakdown = getVernierBreakdown(observedMm, leastCount);
  const shiftPx = breakdown.observedMm * PX_PER_MM;
  const vsdMm = leastCount === 0.02 ? 0.98 : 1.95;

  const c = {
    metalLight: isDark ? '#334155' : '#f1f5f9',
    metalMid: isDark ? '#1e293b' : '#e2e8f0',
    metalDark: isDark ? '#0f172a' : '#cbd5e1',
    metalStroke: isDark ? '#64748b' : '#64748b',
    carriageFill: isDark ? '#1e293b' : '#f8fafc',
    carriageStroke: isDark ? '#94a3b8' : '#475569',
    tick: isDark ? '#e2e8f0' : '#0f172a',
    tickSubtle: isDark ? '#94a3b8' : '#475569',
    accent: 'var(--md-primary)',
    coincide: '#10b981',
    partFill: isDark ? '#0369a1' : '#bae6fd',
    partStroke: isDark ? '#38bdf8' : '#0284c7',
    calloutBg: 'var(--md-surface-container-low)',
    calloutBorder: 'var(--md-primary)',
    calloutText: 'var(--md-primary)',
  };

  function clientToSvgDeltaX(deltaClientX: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return (deltaClientX / rect.width) * 860;
  }

  function handlePointerDown(e: React.PointerEvent<SVGGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startMm: breakdown.observedMm };
    setIsDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<SVGGElement>) {
    if (!dragRef.current) return;
    const dxSvg = clientToSvgDeltaX(e.clientX - dragRef.current.startX);
    const rawMm = dragRef.current.startMm + dxSvg / PX_PER_MM;
    onChangeObserved(snapToLeastCount(rawMm, leastCount, maxMm));
  }

  function handlePointerUp(e: React.PointerEvent<SVGGElement>) {
    if (dragRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragRef.current = null;
      setIsDragging(false);
    }
  }

  const mainTicks: number[] = [];
  for (let i = 0; i <= 105; i++) mainTicks.push(i);

  const vernierTicks: number[] = [];
  for (let i = 0; i <= breakdown.numDivisions; i++) vernierTicks.push(i);

  // Smart Loupe Focus & centering on SEAM_Y
  const effectiveFocus: LoupeFocus =
    hideReadout && loupeFocus === 'coinciding' ? 'msr' : loupeFocus;

  const msrX = ZERO_X + shiftPx;
  const coincidingX = ZERO_X + shiftPx + breakdown.coincidingDiv * vsdMm * PX_PER_MM;
  const fullCenterX = ZERO_X + (breakdown.observedMm + breakdown.vernierSpanMm / 2) * PX_PER_MM;

  const loupeCenterX =
    effectiveFocus === 'msr'
      ? msrX
      : effectiveFocus === 'coinciding'
      ? coincidingX
      : fullCenterX;

  const loupeViewW =
    effectiveFocus === 'full'
      ? Math.max(360, breakdown.vernierSpanMm * PX_PER_MM + 48)
      : 240 / loupeZoom;
  const loupeViewH = Math.max(54, 156 / loupeZoom);
  const loupeViewX = loupeCenterX - loupeViewW / 2;
  const loupeViewY = SEAM_Y - loupeViewH * 0.48;

  return (
    <div className="space-y-3">
      <div className="relative w-full overflow-hidden rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)]">
        <svg
          ref={svgRef}
          viewBox="0 0 860 302"
          className="w-full max-h-[360px] h-auto select-none touch-none mx-auto"
          aria-label="Interactive Vernier Caliper Scale"
        >
          <defs>
            <linearGradient id="caliperBeamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.metalLight} />
              <stop offset="50%" stopColor={c.metalMid} />
              <stop offset="100%" stopColor={c.metalDark} />
            </linearGradient>
            <linearGradient id="caliperJawGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c.metalDark} />
              <stop offset="100%" stopColor={c.metalLight} />
            </linearGradient>
            <pattern
              id="vernierHatch"
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
              id="dimArrow"
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

          {/* Depth rod extending to the right */}
          <rect
            x={ZERO_X + shiftPx + 240}
            y={BEAM_Y + BEAM_H / 2 - 4}
            width={Math.max(40, 820 - (ZERO_X + shiftPx + 240))}
            height={8}
            rx={1.5}
            fill={c.metalDark}
            stroke={c.metalStroke}
            strokeWidth={1}
          />

          {/* Fixed Main Beam */}
          <g>
            {/* Upper fixed internal jaw */}
            <path
              d={`M ${ZERO_X - 24} ${BEAM_Y} L ${ZERO_X} ${BEAM_Y - 56} L ${ZERO_X} ${BEAM_Y} Z`}
              fill="url(#caliperJawGrad)"
              stroke={c.metalStroke}
              strokeWidth={1.4}
            />
            {/* Lower fixed external jaw */}
            <path
              d={`M ${ZERO_X - 38} ${SEAM_Y} L ${ZERO_X - 38} ${SEAM_Y + 62} L ${ZERO_X - 10} ${SEAM_Y + 96} L ${ZERO_X} ${SEAM_Y + 96} L ${ZERO_X} ${SEAM_Y} Z`}
              fill="url(#caliperJawGrad)"
              stroke={c.metalStroke}
              strokeWidth={1.4}
            />
            {/* Main scale bar */}
            <rect
              x={ZERO_X - 38}
              y={BEAM_Y}
              width={855}
              height={BEAM_H}
              rx={3}
              fill="url(#caliperBeamGrad)"
              stroke={c.metalStroke}
              strokeWidth={1.4}
            />

            {/* Main Scale Ticks (1:1 mm labels matching Loupe) */}
            {mainTicks.map((mm) => {
              const x = ZERO_X + mm * PX_PER_MM;
              const isTen = mm % 10 === 0;
              const isFive = mm % 5 === 0 && !isTen;
              const tickH = isTen ? 14 : isFive ? 10 : 6;
              return (
                <g key={mm}>
                  <line
                    x1={x}
                    y1={SEAM_Y}
                    x2={x}
                    y2={SEAM_Y - tickH}
                    stroke={c.tick}
                    strokeWidth={isTen ? 1.3 : 0.85}
                  />
                  {isTen && (
                    <text
                      x={x}
                      y={SEAM_Y - 18}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      fill={c.tick}
                    >
                      {mm}
                    </text>
                  )}
                </g>
              );
            })}
            <text
              x={ZERO_X + 105 * PX_PER_MM + 16}
              y={SEAM_Y - 17}
              fontSize="9"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={c.tickSubtle}
            >
              mm
            </text>
          </g>

          {/* Visual Test Part with Engineering Cross-Section & Dimension Arrows */}
          {activePart && breakdown.observedMm > 0.2 && (
            <g opacity={0.95}>
              {activePart.measurementType === 'OD' && (() => {
                const odLabel =
                  qcSpecLabel ??
                  `OD ${hideReadout ? '?.?? mm' : `${breakdown.observedMm.toFixed(2)} mm`}`;
                const cx = Math.max(165, ZERO_X + shiftPx / 2);
                const pillW = Math.max(120, odLabel.length * 6.2 + 16);
                return (
                  <g>
                    <rect
                      x={ZERO_X}
                      y={SEAM_Y + 34}
                      width={shiftPx}
                      height={38}
                      rx={3}
                      fill={c.partFill}
                      stroke={c.partStroke}
                      strokeWidth={1.5}
                    />
                    <rect
                      x={ZERO_X}
                      y={SEAM_Y + 34}
                      width={shiftPx}
                      height={38}
                      rx={3}
                      fill="url(#vernierHatch)"
                    />
                    {/* Centerline & Dimension Arrow */}
                    <line
                      x1={ZERO_X + shiftPx / 2}
                      y1={SEAM_Y + 29}
                      x2={ZERO_X + shiftPx / 2}
                      y2={SEAM_Y + 77}
                      stroke={c.partStroke}
                      strokeWidth={0.8}
                      strokeDasharray="4 2 1 2"
                    />
                    {shiftPx >= 12 && (
                      <line
                        x1={ZERO_X + 3}
                        y1={SEAM_Y + 84}
                        x2={ZERO_X + shiftPx - 3}
                        y2={SEAM_Y + 84}
                        stroke={c.partStroke}
                        strokeWidth={1.1}
                        markerStart="url(#dimArrow)"
                        markerEnd="url(#dimArrow)"
                      />
                    )}
                    {shiftPx >= 95 && (
                      <text
                        x={ZERO_X + shiftPx / 2}
                        y={SEAM_Y + 56}
                        textAnchor="middle"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="var(--font-sans)"
                        fill={c.tick}
                      >
                        {activePart.name}
                      </text>
                    )}
                    {/* Non-overlapping Pill Callout below jaw tips */}
                    <rect
                      x={cx - pillW / 2}
                      y={SEAM_Y + 102}
                      width={pillW}
                      height={18}
                      rx={9}
                      fill={c.calloutBg}
                      stroke={c.calloutBorder}
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={SEAM_Y + 114}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      fill={c.calloutText}
                    >
                      {odLabel}
                    </text>
                  </g>
                );
              })()}
              {activePart.measurementType === 'ID' && (() => {
                const label = `${activePart.name} · ${qcSpecLabel ?? 'ID Bore'}`;
                const cx = Math.max(185, ZERO_X + shiftPx / 2);
                const pillW = Math.max(130, label.length * 5.8 + 16);
                return (
                  <g>
                    <rect
                      x={ZERO_X - 18}
                      y={BEAM_Y - 48}
                      width={18}
                      height={26}
                      fill={c.partFill}
                      stroke={c.partStroke}
                      strokeWidth={1.3}
                    />
                    <rect
                      x={ZERO_X - 18}
                      y={BEAM_Y - 48}
                      width={18}
                      height={26}
                      fill="url(#vernierHatch)"
                    />
                    <rect
                      x={ZERO_X + shiftPx}
                      y={BEAM_Y - 48}
                      width={18}
                      height={26}
                      fill={c.partFill}
                      stroke={c.partStroke}
                      strokeWidth={1.3}
                    />
                    <rect
                      x={ZERO_X + shiftPx}
                      y={BEAM_Y - 48}
                      width={18}
                      height={26}
                      fill="url(#vernierHatch)"
                    />
                    {shiftPx >= 12 && (
                      <line
                        x1={ZERO_X + 3}
                        y1={BEAM_Y - 35}
                        x2={ZERO_X + shiftPx - 3}
                        y2={BEAM_Y - 35}
                        stroke={c.partStroke}
                        strokeWidth={1.1}
                        markerStart="url(#dimArrow)"
                        markerEnd="url(#dimArrow)"
                      />
                    )}
                    <rect
                      x={cx - pillW / 2}
                      y={18}
                      width={pillW}
                      height={18}
                      rx={9}
                      fill={c.calloutBg}
                      stroke={c.calloutBorder}
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={30}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-sans)"
                      fill={c.calloutText}
                    >
                      {label}
                    </text>
                  </g>
                );
              })()}
              {activePart.measurementType === 'Width' && (() => {
                const label = `${activePart.name} · ${qcSpecLabel ?? 'Slot Width'}`;
                const cx = Math.max(185, ZERO_X + shiftPx / 2);
                const pillW = Math.max(130, label.length * 5.8 + 16);
                return (
                  <g>
                    <rect
                      x={ZERO_X - 16}
                      y={BEAM_Y - 42}
                      width={shiftPx + 32}
                      height={20}
                      rx={2}
                      fill={c.partFill}
                      stroke={c.partStroke}
                      strokeWidth={1.2}
                      opacity={0.45}
                    />
                    <rect
                      x={ZERO_X}
                      y={BEAM_Y - 42}
                      width={shiftPx}
                      height={20}
                      fill="var(--md-surface-container-low)"
                      stroke={c.partStroke}
                      strokeWidth={1.4}
                    />
                    {shiftPx >= 12 && (
                      <line
                        x1={ZERO_X + 3}
                        y1={BEAM_Y - 32}
                        x2={ZERO_X + shiftPx - 3}
                        y2={BEAM_Y - 32}
                        stroke={c.partStroke}
                        strokeWidth={1.1}
                        markerStart="url(#dimArrow)"
                        markerEnd="url(#dimArrow)"
                      />
                    )}
                    <rect
                      x={cx - pillW / 2}
                      y={18}
                      width={pillW}
                      height={18}
                      rx={9}
                      fill={c.calloutBg}
                      stroke={c.calloutBorder}
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={30}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-sans)"
                      fill={c.calloutText}
                    >
                      {label}
                    </text>
                  </g>
                );
              })()}
              {activePart.measurementType === 'Depth' && (() => {
                const label = qcSpecLabel ?? 'Step Depth';
                const cx = Math.min(780, 820 - shiftPx / 2);
                const pillW = Math.max(96, label.length * 5.8 + 16);
                return (
                  <g>
                    <rect
                      x={820 - shiftPx}
                      y={BEAM_Y + BEAM_H / 2 - 14}
                      width={shiftPx}
                      height={28}
                      rx={2}
                      fill={c.partFill}
                      stroke={c.partStroke}
                      strokeWidth={1.4}
                    />
                    <rect
                      x={820 - shiftPx}
                      y={BEAM_Y + BEAM_H / 2 - 14}
                      width={shiftPx}
                      height={28}
                      rx={2}
                      fill="url(#vernierHatch)"
                    />
                    <rect
                      x={cx - pillW / 2}
                      y={BEAM_Y - 26}
                      width={pillW}
                      height={17}
                      rx={8.5}
                      fill={c.calloutBg}
                      stroke={c.calloutBorder}
                      strokeWidth={1}
                    />
                    <text
                      x={cx}
                      y={BEAM_Y - 14}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="var(--font-sans)"
                      fill={c.calloutText}
                    >
                      {label}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Sliding Vernier Carriage (Draggable) */}
          <g
            transform={`translate(${shiftPx}, 0)`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Upper sliding internal jaw */}
            <path
              d={`M ${ZERO_X} ${BEAM_Y} L ${ZERO_X} ${BEAM_Y - 56} L ${ZERO_X + 24} ${BEAM_Y} Z`}
              fill={c.carriageFill}
              stroke={c.carriageStroke}
              strokeWidth={1.4}
            />
            {/* Lower sliding external jaw */}
            <path
              d={`M ${ZERO_X} ${SEAM_Y} L ${ZERO_X} ${SEAM_Y + 96} L ${ZERO_X + 10} ${SEAM_Y + 96} L ${ZERO_X + 34} ${SEAM_Y + 62} L ${ZERO_X + 34} ${SEAM_Y} Z`}
              fill={c.carriageFill}
              stroke={c.carriageStroke}
              strokeWidth={1.4}
            />

            {/* Locking screw on top */}
            <rect
              x={ZERO_X + 55}
              y={BEAM_Y - 22}
              width={14}
              height={12}
              rx={2}
              fill={c.metalDark}
              stroke={c.carriageStroke}
              strokeWidth={1.2}
            />
            <rect
              x={ZERO_X + 59}
              y={BEAM_Y - 10}
              width={6}
              height={10}
              fill={c.metalStroke}
            />

            {/* Main carriage top rail */}
            <rect
              x={ZERO_X - 8}
              y={BEAM_Y - 8}
              width={breakdown.vernierSpanMm * PX_PER_MM + 34}
              height={12}
              rx={2}
              fill={c.carriageFill}
              stroke={c.carriageStroke}
              strokeWidth={1.3}
            />
            {/* Vernier plate (below main scale) */}
            <path
              d={`M ${ZERO_X - 8} ${SEAM_Y} L ${ZERO_X + breakdown.vernierSpanMm * PX_PER_MM + 26} ${SEAM_Y} L ${ZERO_X + breakdown.vernierSpanMm * PX_PER_MM + 26} ${SEAM_Y + 34} L ${ZERO_X - 8} ${SEAM_Y + 34} Z`}
              fill={c.carriageFill}
              stroke={c.carriageStroke}
              strokeWidth={1.4}
            />

            {/* Thumb roller */}
            <circle
              cx={ZERO_X + 46}
              cy={SEAM_Y + 42}
              r={10}
              fill={c.metalMid}
              stroke={c.carriageStroke}
              strokeWidth={1.4}
            />
            <circle cx={ZERO_X + 46} cy={SEAM_Y + 42} r={4} fill={c.accent} />

            {/* Vernier Scale Ticks */}
            {vernierTicks.map((i) => {
              const vx = ZERO_X + i * vsdMm * PX_PER_MM;
              const isMajor =
                leastCount === 0.02 ? i % 5 === 0 : i % 2 === 0;
              const tickH = isMajor ? 13 : 8;
              const isCoinciding = !hideReadout && i === breakdown.coincidingDiv;

              return (
                <g key={i}>
                  <line
                    x1={vx}
                    y1={SEAM_Y}
                    x2={vx}
                    y2={SEAM_Y + tickH}
                    stroke={isCoinciding ? c.coincide : i === 0 ? c.accent : c.tick}
                    strokeWidth={isCoinciding ? 2 : isMajor ? 1.2 : 0.8}
                  />
                  {isMajor && (
                    <text
                      x={vx}
                      y={SEAM_Y + 24}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      fill={isCoinciding ? c.coincide : i === 0 ? c.accent : c.tick}
                    >
                      {leastCount === 0.02 ? i / 5 : i / 2}
                    </text>
                  )}
                </g>
              );
            })}

            <text
              x={ZERO_X + 66}
              y={SEAM_Y + 46}
              fontSize="9"
              fontWeight="500"
              fontFamily="var(--font-sans)"
              fill={c.tickSubtle}
            >
              Drag jaw
            </text>
          </g>
        </svg>
      </div>

      {/* High-Precision Magnifier Loupe Bar */}
      {showLoupe && (
        <div className="rounded-[24px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[var(--md-primary)]">
                Magnifier Loupe ({loupeZoom}× Optical Zoom)
              </span>
              {/* 3-Pill Loupe Focus Toggle */}
              <div className="flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLoupeFocus('full')}
                  className={`rounded-full px-2.5 py-0.5 transition-colors ${
                    effectiveFocus === 'full'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  Full Scale
                </button>
                <button
                  type="button"
                  onClick={() => setLoupeFocus('msr')}
                  className={`rounded-full px-2.5 py-0.5 transition-colors ${
                    effectiveFocus === 'msr'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  MSR (0 Mark)
                </button>
                {!hideReadout && (
                  <button
                    type="button"
                    onClick={() => setLoupeFocus('coinciding')}
                    className={`rounded-full px-2.5 py-0.5 transition-colors ${
                      effectiveFocus === 'coinciding'
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    Coinciding Tick
                  </button>
                )}
              </div>
            </div>

            {/* Striped Line Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--md-on-surface-variant)]">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-5 border-t-2 border-dashed border-[var(--md-primary)]" />
                Vernier 0 (MSR)
              </span>
              {!hideReadout && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-5 border-t-2 border-dashed border-emerald-500" />
                  Coinciding Tick (#{breakdown.coincidingDiv})
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
            aria-label="Magnified Vernier Scale View"
          >
            {/* Beam background inside loupe */}
            <rect
              x={loupeViewX - 20}
              y={BEAM_Y}
              width={loupeViewW + 40}
              height={BEAM_H}
              fill={c.metalMid}
              stroke={c.metalStroke}
              strokeWidth={0.5}
            />
            {/* Vernier plate background inside loupe */}
            <rect
              x={ZERO_X + shiftPx - 8}
              y={SEAM_Y}
              width={breakdown.vernierSpanMm * PX_PER_MM + 24}
              height={40}
              fill={c.carriageFill}
              stroke={c.carriageStroke}
              strokeWidth={0.5}
            />

            {/* Main scale ticks inside loupe */}
            {mainTicks.map((mm) => {
              const x = ZERO_X + mm * PX_PER_MM;
              if (x < loupeViewX - 10 || x > loupeViewX + loupeViewW + 10) return null;
              const isTen = mm % 10 === 0;
              const isFive = mm % 5 === 0 && !isTen;
              const tickH = isTen ? 14 : isFive ? 10 : 6;
              return (
                <g key={`lm-${mm}`}>
                  <line
                    x1={x}
                    y1={SEAM_Y}
                    x2={x}
                    y2={SEAM_Y - tickH}
                    stroke={c.tick}
                    strokeWidth={isTen ? 0.85 : 0.45}
                  />
                  {isTen && (
                    <text
                      x={x}
                      y={SEAM_Y - 17}
                      textAnchor="middle"
                      fontSize="5.5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                      fill={c.tick}
                    >
                      {mm}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Striped Alignment Line for Vernier 0 (MSR) */}
            <g>
              <rect
                x={msrX - 1.5}
                y={SEAM_Y - 22}
                width={3}
                height={47}
                fill={c.accent}
                opacity={0.14}
              />
              <line
                x1={msrX}
                y1={SEAM_Y - 22}
                x2={msrX}
                y2={SEAM_Y + 25}
                stroke={c.accent}
                strokeWidth={1.1}
                strokeDasharray="2.5 1.5"
              />
            </g>

            {/* Striped Alignment Line for Coinciding Tick */}
            {!hideReadout && (
              <g>
                <rect
                  x={coincidingX - 1.5}
                  y={SEAM_Y - 22}
                  width={3}
                  height={47}
                  fill={c.coincide}
                  opacity={0.16}
                />
                <line
                  x1={coincidingX}
                  y1={SEAM_Y - 22}
                  x2={coincidingX}
                  y2={SEAM_Y + 25}
                  stroke={c.coincide}
                  strokeWidth={1.2}
                  strokeDasharray="2.5 1.5"
                />
              </g>
            )}

            {/* Parallax Apparent Shift Indicator */}
            {parallaxAngleDeg !== 0 && (() => {
              const pShiftPx =
                0.5 * Math.tan(degToRad(parallaxAngleDeg)) * PX_PER_MM;
              const px = msrX + pShiftPx;
              return (
                <g>
                  <line
                    x1={px}
                    y1={SEAM_Y - 22}
                    x2={px}
                    y2={SEAM_Y + 25}
                    stroke="#f59e0b"
                    strokeWidth={1.1}
                    strokeDasharray="2 1.5"
                  />
                </g>
              );
            })()}

            {/* Vernier ticks inside loupe */}
            {vernierTicks.map((i) => {
              const vx = ZERO_X + shiftPx + i * vsdMm * PX_PER_MM;
              if (vx < loupeViewX - 10 || vx > loupeViewX + loupeViewW + 10) return null;
              const isMajor = leastCount === 0.02 ? i % 5 === 0 : i % 2 === 0;
              const tickH = isMajor ? 12 : 7;
              const isCoinciding = !hideReadout && i === breakdown.coincidingDiv;
              return (
                <g key={`lv-${i}`}>
                  <line
                    x1={vx}
                    y1={SEAM_Y}
                    x2={vx}
                    y2={SEAM_Y + tickH}
                    stroke={isCoinciding ? c.coincide : i === 0 ? c.accent : c.tick}
                    strokeWidth={isCoinciding ? 1.15 : isMajor ? 0.7 : 0.45}
                  />
                  {isMajor && (
                    <text
                      x={vx}
                      y={SEAM_Y + 20}
                      textAnchor="middle"
                      fontSize="5"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                      fill={isCoinciding ? c.coincide : i === 0 ? c.accent : c.tick}
                    >
                      {leastCount === 0.02 ? i / 5 : i / 2}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
