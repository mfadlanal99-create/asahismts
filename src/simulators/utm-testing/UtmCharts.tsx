import { useCallback, useMemo, useState } from 'react';
import { Activity, BarChart2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { CurveKeyPoints, UtmDataPoint, UtmInstantaneousState } from './utmTestingData';

export type ChartType = 'stress-strain' | 'force-elongation';

interface UtmChartsProps {
  dataPoints: UtmDataPoint[];
  fullCurvePoints: UtmDataPoint[];
  keyPoints: CurveKeyPoints;
  currentState: UtmInstantaneousState;
  materialName: string;
  isMounted: boolean;
}

export function UtmCharts({
  dataPoints,
  fullCurvePoints,
  keyPoints,
  currentState,
  materialName,
  isMounted,
}: UtmChartsProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const [chartType, setChartType] = useState<ChartType>('stress-strain');

  // Chart view dimensions
  const WIDTH = 540;
  const HEIGHT = 320;
  const MARGIN_LEFT = 60;
  const MARGIN_RIGHT = 30;
  const MARGIN_TOP = 40;
  const MARGIN_BOTTOM = 45;
  const PLOT_W = WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 450 px
  const PLOT_H = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM; // 235 px

  // Domain extents
  const { xMax, yMax, xLabel, yLabel, xUnit, yUnit } = useMemo(() => {
    if (chartType === 'stress-strain') {
      const maxX = Math.max(1, keyPoints.maxStrainPct);
      const maxY = Math.max(50, keyPoints.maxStressMpa);
      return {
        xMax: maxX,
        yMax: maxY,
        xLabel: pick('Engineering Strain ε', 'Regangan Rekayasa ε', '公称ひずみ ε'),
        yLabel: pick('Engineering Stress σ', 'Tegangan Rekayasa σ', '公称応力 σ'),
        xUnit: '%',
        yUnit: 'MPa',
      };
    } else {
      const maxX = Math.max(1, keyPoints.maxExtensionMm);
      const maxY = Math.max(5, keyPoints.maxForceKn);
      return {
        xMax: maxX,
        yMax: maxY,
        xLabel: pick('Extension ΔL', 'Perpanjangan ΔL', '変位量 ΔL'),
        yLabel: pick('Tensile / Comp Load F', 'Beban Tarik / Tekan F', '荷重 F'),
        xUnit: 'mm',
        yUnit: 'kN',
      };
    }
  }, [chartType, keyPoints, pick]);

  // Coordinate transforms
  const scaleX = useCallback(
    (val: number) => MARGIN_LEFT + Math.min(1, Math.max(0, val / xMax)) * PLOT_W,
    [xMax, PLOT_W]
  );
  const scaleY = useCallback(
    (val: number) => MARGIN_TOP + PLOT_H - Math.min(1, Math.max(0, val / yMax)) * PLOT_H,
    [yMax, PLOT_H]
  );

  // Grid subdivisions (5 divisions)
  const xTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
      const val = frac * xMax;
      return {
        val,
        x: MARGIN_LEFT + frac * PLOT_W,
        label: val < 10 ? val.toFixed(1) : Math.round(val).toString(),
      };
    });
  }, [xMax, PLOT_W]);

  const yTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
      const val = frac * yMax;
      return {
        val,
        y: MARGIN_TOP + PLOT_H - frac * PLOT_H,
        label: val < 10 ? val.toFixed(1) : Math.round(val).toString(),
      };
    });
  }, [yMax, PLOT_H]);

  // Full Theoretical Curve Path (Ghost background guide)
  const fullPathD = useMemo(() => {
    if (!fullCurvePoints || fullCurvePoints.length < 2) return '';
    const coords = fullCurvePoints.map((pt) => {
      const vx = chartType === 'stress-strain' ? pt.strainPct : pt.extensionMm;
      const vy = chartType === 'stress-strain' ? pt.stressMpa : pt.forceKn;
      return `${scaleX(vx).toFixed(1)},${scaleY(vy).toFixed(1)}`;
    });
    return `M ${coords.join(' L ')}`;
  }, [fullCurvePoints, chartType, scaleX, scaleY]);

  // Live Recorded Test Points Path
  const livePathD = useMemo(() => {
    if (!isMounted || !dataPoints || dataPoints.length === 0) return '';
    const coords = dataPoints.map((pt) => {
      const vx = chartType === 'stress-strain' ? pt.strainPct : pt.extensionMm;
      const vy = chartType === 'stress-strain' ? pt.stressMpa : pt.forceKn;
      return `${scaleX(vx).toFixed(1)},${scaleY(vy).toFixed(1)}`;
    });
    return `M ${coords.join(' L ')}`;
  }, [dataPoints, chartType, isMounted, scaleX, scaleY]);

  // Current Live Operating Point
  const currentX = chartType === 'stress-strain' ? currentState.strainPct : currentState.extensionMm;
  const currentY = chartType === 'stress-strain' ? currentState.stressMpa : currentState.forceKn;
  const currentSvgX = scaleX(currentX);
  const currentSvgY = scaleY(currentY);

  // Key landmarks
  const yieldX =
    chartType === 'stress-strain'
      ? keyPoints.yieldPoint.strainPct
      : keyPoints.yieldPoint.extensionMm;
  const yieldY =
    chartType === 'stress-strain' ? keyPoints.yieldPoint.stressMpa : keyPoints.yieldPoint.forceKn;

  const utsX =
    chartType === 'stress-strain' ? keyPoints.utsPoint.strainPct : keyPoints.utsPoint.extensionMm;
  const utsY =
    chartType === 'stress-strain' ? keyPoints.utsPoint.stressMpa : keyPoints.utsPoint.forceKn;

  const fracX =
    chartType === 'stress-strain'
      ? keyPoints.fracturePoint.strainPct
      : keyPoints.fracturePoint.extensionMm;
  const fracY =
    chartType === 'stress-strain'
      ? keyPoints.fracturePoint.stressMpa
      : keyPoints.fracturePoint.forceKn;

  // 0.2% Offset Yield construction line in Stress-Strain mode
  const offsetLineCoords = useMemo(() => {
    if (chartType !== 'stress-strain') return null;
    const { start, end } = keyPoints.offsetYieldLine;
    return {
      x1: scaleX(start[0]),
      y1: scaleY(start[1]),
      x2: scaleX(end[0]),
      y2: scaleY(end[1]),
    };
  }, [chartType, keyPoints.offsetYieldLine, scaleX, scaleY]);

  // Styling colors
  const c = {
    bg: 'var(--md-surface-container-lowest)',
    border: 'var(--md-outline-variant)',
    grid: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    axis: 'var(--md-outline)',
    textMain: 'var(--md-on-surface)',
    textMuted: 'var(--md-on-surface-variant)',
    curveLive: 'var(--md-primary)',
    curveGhost: 'var(--md-primary)',
    yieldColor: '#eab308', // Amber yellow
    utsColor: '#06b6d4', // Cyan
    fractureColor: '#f43f5e', // Rose
  };

  return (
    <div className="glass-panel flex w-full flex-col gap-2.5 rounded-[28px] p-4 sm:p-5">
      {/* Chart Header & Mode Toggle Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--md-primary)]" />
          <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
            {chartType === 'stress-strain'
              ? pick('Live Stress–Strain Curve (σ–ε)', 'Kurva Tegangan-Regangan (σ–ε)', '応力-ひずみ線図 (σ–ε)')
              : pick('Live Force–Elongation Curve (F–ΔL)', 'Kurva Beban-Perpanjangan (F–ΔL)', '荷重-変位線図 (F–ΔL)')}
          </span>
          <span className="rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--md-on-primary-container)]">
            {materialName}
          </span>
        </div>

        {/* Tab switch buttons */}
        <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
          <button
            type="button"
            onClick={() => setChartType('stress-strain')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-all ${
              chartType === 'stress-strain'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Activity className="h-3 w-3" />
            σ – ε
          </button>
          <button
            type="button"
            onClick={() => setChartType('force-elongation')}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-all ${
              chartType === 'force-elongation'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <BarChart2 className="h-3 w-3" />
            F – ΔL
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full select-none"
          fontFamily="var(--font-sans)"
          style={{ overflow: 'visible' }}
        >
          {/* Background rect */}
          <rect
            x={MARGIN_LEFT}
            y={MARGIN_TOP}
            width={PLOT_W}
            height={PLOT_H}
            fill={c.bg}
            stroke={c.border}
            strokeWidth="1"
            rx="10"
          />

          {/* Grid lines horizontal */}
          {yTicks.map((tick, i) => (
            <g key={`y-grid-${i}`}>
              <line
                x1={MARGIN_LEFT}
                y1={tick.y}
                x2={MARGIN_LEFT + PLOT_W}
                y2={tick.y}
                stroke={c.grid}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={MARGIN_LEFT - 8}
                y={tick.y + 3.5}
                fill={c.textMuted}
                fontSize="8.5"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Grid lines vertical */}
          {xTicks.map((tick, i) => (
            <g key={`x-grid-${i}`}>
              <line
                x1={tick.x}
                y1={MARGIN_TOP}
                x2={tick.x}
                y2={MARGIN_TOP + PLOT_H}
                stroke={c.grid}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={tick.x}
                y={MARGIN_TOP + PLOT_H + 16}
                fill={c.textMuted}
                fontSize="8.5"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Axis Labels */}
          {/* X-axis title */}
          <text
            x={MARGIN_LEFT + PLOT_W / 2}
            y={HEIGHT - 6}
            fill={c.textMain}
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
          >
            {xLabel} [{xUnit}]
          </text>

          {/* Y-axis title */}
          <text
            x={-MARGIN_TOP - PLOT_H / 2}
            y="18"
            fill={c.textMain}
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            transform="rotate(-90)"
            fontFamily="var(--font-sans)"
          >
            {yLabel} [{yUnit}]
          </text>

          {/* Theoretical Curve (Ghost preview) */}
          {fullPathD && (
            <path
              d={fullPathD}
              fill="none"
              stroke={c.curveGhost}
              strokeOpacity="0.28"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}

          {/* 0.2% Offset Yield construction line (in Stress-Strain mode) */}
          {offsetLineCoords && (
            <g id="offset-yield-line">
              <line
                x1={offsetLineCoords.x1}
                y1={offsetLineCoords.y1}
                x2={offsetLineCoords.x2}
                y2={offsetLineCoords.y2}
                stroke={c.yieldColor}
                strokeWidth="1.4"
                strokeDasharray="3 3"
              />
              {/* Construction offset mark at strain = 0.2% */}
              <text
                x={offsetLineCoords.x1}
                y={offsetLineCoords.y1 - 6}
                fill={c.yieldColor}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                0.2%
              </text>
            </g>
          )}

          {/* Landmark Markers */}
          {/* 1. Yield Point */}
          {isMounted && (
            <g id="yield-marker">
              <circle
                cx={scaleX(yieldX)}
                cy={scaleY(yieldY)}
                r="3.5"
                fill={c.yieldColor}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <text
                x={Math.min(WIDTH - 70, scaleX(yieldX) + 8)}
                y={Math.max(MARGIN_TOP + 12, scaleY(yieldY) - 6)}
                fill={c.yieldColor}
                fontSize="8"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                Rp0.2: {yieldY.toFixed(0)} {yUnit}
              </text>
            </g>
          )}

          {/* 2. UTS Point */}
          {isMounted && (
            <g id="uts-marker">
              <polygon
                points={`${scaleX(utsX)},${scaleY(utsY) - 5} ${scaleX(utsX) + 4},${scaleY(utsY) + 3} ${scaleX(utsX) - 4},${scaleY(utsY) + 3}`}
                fill={c.utsColor}
                stroke="#ffffff"
                strokeWidth="0.8"
              />
              <text
                x={Math.min(WIDTH - 70, Math.max(MARGIN_LEFT + 20, scaleX(utsX)))}
                y={Math.max(MARGIN_TOP + 12, scaleY(utsY) - 10)}
                fill={c.utsColor}
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                UTS: {utsY.toFixed(0)} {yUnit}
              </text>
            </g>
          )}

          {/* 3. Fracture Point */}
          {isMounted && (
            <g id="fracture-marker">
              <line
                x1={scaleX(fracX) - 4}
                y1={scaleY(fracY) - 4}
                x2={scaleX(fracX) + 4}
                y2={scaleY(fracY) + 4}
                stroke={c.fractureColor}
                strokeWidth="2"
              />
              <line
                x1={scaleX(fracX) + 4}
                y1={scaleY(fracY) - 4}
                x2={scaleX(fracX) - 4}
                y2={scaleY(fracY) + 4}
                stroke={c.fractureColor}
                strokeWidth="2"
              />
              <text
                x={Math.min(WIDTH - 50, scaleX(fracX) - 6)}
                y={Math.min(MARGIN_TOP + PLOT_H - 8, scaleY(fracY) + 14)}
                fill={c.fractureColor}
                fontSize="8"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                RUPTURE
              </text>
            </g>
          )}

          {/* Live Recorded Path */}
          {livePathD && (
            <path
              d={livePathD}
              fill="none"
              stroke={c.curveLive}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Live Current Cursor Dot */}
          {isMounted && dataPoints.length > 0 && (
            <g id="live-cursor-dot" className="transition-all duration-75">
              {/* Outer pulsing ring */}
              <circle
                cx={currentSvgX}
                cy={currentSvgY}
                r="7"
                fill="none"
                stroke="var(--md-primary)"
                strokeWidth="1.5"
                opacity="0.65"
              />
              {/* Inner glowing dot */}
              <circle
                cx={currentSvgX}
                cy={currentSvgY}
                r="3.5"
                fill="var(--md-on-primary)"
                stroke="var(--md-primary)"
                strokeWidth="2"
              />
              {/* Live coordinate badge */}
              <g
                transform={`translate(${Math.min(
                  WIDTH - 110,
                  Math.max(MARGIN_LEFT + 5, currentSvgX + 10)
                )}, ${Math.max(MARGIN_TOP + 10, currentSvgY - 26)})`}
              >
                <rect
                  x="0"
                  y="0"
                  width="78"
                  height="20"
                  rx="8"
                  fill="var(--md-primary-container)"
                  stroke="var(--md-primary)"
                  strokeWidth="1"
                />
                <text
                  x="39"
                  y="13"
                  fill="var(--md-on-primary-container)"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {currentY.toFixed(1)} {yUnit}
                </text>
              </g>
            </g>
          )}

          {/* Chart Legend (Top-Right inside plot margin) */}
          <g id="chart-legend" transform={`translate(${MARGIN_LEFT + 10}, ${MARGIN_TOP + 12})`}>
            <rect
              x="-6"
              y="-10"
              width="230"
              height="18"
              rx="8"
              fill="var(--md-surface-container)"
              fillOpacity="0.92"
              stroke="var(--md-outline-variant)"
              strokeWidth="0.8"
            />
            {/* Live trace item */}
            <line x1="0" y1="-1" x2="14" y2="-1" stroke={c.curveLive} strokeWidth="2" />
            <text x="18" y="2" fill={c.textMain} fontSize="7.5" fontWeight="600" fontFamily="var(--font-sans)">
              {pick('Recorded', 'Terekam', '実測')}
            </text>

            {/* Yield marker item */}
            <circle cx="68" cy="-1" r="2.5" fill={c.yieldColor} />
            <text x="74" y="2" fill={c.textMuted} fontSize="7.5" fontFamily="var(--font-sans)">
              Rp0.2
            </text>

            {/* UTS marker item */}
            <polygon
              points="114,-4 117,1 111,1"
              fill={c.utsColor}
            />
            <text x="121" y="2" fill={c.textMuted} fontSize="7.5" fontFamily="var(--font-sans)">
              UTS
            </text>

            {/* Rupture marker item */}
            <line x1="152" y1="-4" x2="158" y2="2" stroke={c.fractureColor} strokeWidth="1.5" />
            <line x1="158" y1="-4" x2="152" y2="2" stroke={c.fractureColor} strokeWidth="1.5" />
            <text x="162" y="2" fill={c.textMuted} fontSize="7.5" fontFamily="var(--font-sans)">
              Rupture
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
