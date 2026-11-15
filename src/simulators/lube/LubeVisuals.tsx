import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  computeViscosityAtTemp,
  type Beta5Value,
  type EhlResult,
  type EquipmentSpec,
  type Iso4406Result,
  type IsoVgGrade,
  type WearLevel,
} from './lubeData';

interface ViscosityTempChartProps {
  equipment: EquipmentSpec;
  selectedVg: IsoVgGrade;
  tempC: number;
  currentViscosity: number;
}

const CHART_W = 540;
const CHART_H = 296;
const PAD = { top: 20, right: 22, bottom: 42, left: 58 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

const MIN_TEMP = 20;
const MAX_TEMP = 110;
const MIN_CST = 2;
const MAX_CST = 1000;
const LOG_MIN = Math.log10(MIN_CST);
const LOG_MAX = Math.log10(MAX_CST);

function xForTemp(t: number): number {
  return PAD.left + ((t - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * PLOT_W;
}

function yForCst(nu: number): number {
  const clamped = Math.max(MIN_CST, Math.min(MAX_CST, nu));
  const norm = (Math.log10(clamped) - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return PAD.top + PLOT_H - norm * PLOT_H;
}

function buildCurvePath(grade: IsoVgGrade): string {
  const pts: string[] = [];
  for (let t = MIN_TEMP; t <= MAX_TEMP; t += 2) {
    const nu = computeViscosityAtTemp(grade, t);
    const x = xForTemp(t).toFixed(1);
    const y = yForCst(nu).toFixed(1);
    pts.push(`${t === MIN_TEMP ? 'M' : 'L'}${x},${y}`);
  }
  return pts.join(' ');
}

export function ViscosityTempChart({
  equipment,
  selectedVg,
  tempC,
  currentViscosity,
}: ViscosityTempChartProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const activePath = useMemo(() => buildCurvePath(selectedVg), [selectedVg]);
  const recommendedPath = useMemo(
    () =>
      selectedVg !== equipment.recommendedVg
        ? buildCurvePath(equipment.recommendedVg)
        : null,
    [selectedVg, equipment.recommendedVg],
  );

  const winTop = yForCst(equipment.targetViscosityMax);
  const winBottom = yForCst(equipment.targetViscosityMin);
  const winHeight = Math.max(4, winBottom - winTop);

  const opX = xForTemp(tempC);
  const opY = yForCst(currentViscosity);

  const inWindow =
    currentViscosity >= equipment.targetViscosityMin &&
    currentViscosity <= equipment.targetViscosityMax;

  const dotColor = inWindow
    ? isDark
      ? '#34d399'
      : '#059669'
    : currentViscosity < equipment.targetViscosityMin
      ? isDark
        ? '#fb7185'
        : '#e11d48'
      : isDark
        ? '#fbbf24'
        : '#d97706';

  const gridStroke = isDark ? '#334155' : '#e2e8f0';
  const axisText = isDark ? '#94a3b8' : '#64748b';
  const curveStroke = isDark ? '#f59e0b' : '#d97706';
  const recStroke = isDark ? '#38bdf8' : '#0284c7';

  const yTicks = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
  const xTicks = [20, 35, 50, 65, 80, 95, 110];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {pick(
              'Viscosity–Temperature Curve (ASTM D341)',
              'Kurva Viskositas–Suhu (ASTM D341)',
              '粘度–温度曲線 (ASTM D341)',
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pick('Target window:', 'Jendela target:', '目標範囲:')} {equipment.targetViscosityMin}–{equipment.targetViscosityMax} cSt
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            {selectedVg}
          </span>
          {recommendedPath && (
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-0.5 w-3.5 border-t-2 border-dashed border-sky-500" />
              Rec: {equipment.recommendedVg}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500/25 ring-1 ring-emerald-500/60" />
            Target
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label="Viscosity versus temperature curve"
      >
        {/* Target Operating Viscosity Window */}
        <rect
          x={PAD.left}
          y={winTop}
          width={PLOT_W}
          height={winHeight}
          fill={isDark ? 'rgba(16, 185, 129, 0.14)' : 'rgba(16, 185, 129, 0.12)'}
          stroke={isDark ? 'rgba(52, 211, 153, 0.35)' : 'rgba(5, 150, 105, 0.3)'}
          strokeDasharray="4 3"
        />

        {/* Horizontal log-scale grid lines */}
        {yTicks.map((tick) => {
          const y = yForCst(tick);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={CHART_W - PAD.right}
                y2={y}
                stroke={gridStroke}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 3.5}
                textAnchor="end"
                fontSize={10}
                fill={axisText}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Vertical temperature grid lines */}
        {xTicks.map((t) => {
          const x = xForTemp(t);
          return (
            <g key={t}>
              <line
                x1={x}
                y1={PAD.top}
                x2={x}
                y2={CHART_H - PAD.bottom}
                stroke={gridStroke}
                strokeWidth={1}
              />
              <text
                x={x}
                y={CHART_H - PAD.bottom + 15}
                textAnchor="middle"
                fontSize={10}
                fill={axisText}
              >
                {t}°C
              </text>
            </g>
          );
        })}

        {/* Axes border */}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={PLOT_W}
          height={PLOT_H}
          fill="none"
          stroke={isDark ? '#475569' : '#cbd5e1'}
          strokeWidth={1}
        />

        {/* Y-axis label */}
        <text
          x={14}
          y={PAD.top + PLOT_H / 2}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight={600}
          fill={axisText}
          transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}
        >
          {pick('Viscosity (cSt, log)', 'Viskositas (cSt, log)', '動粘度 (cSt, 対数)')}
        </text>

        {/* X-axis label */}
        <text
          x={PAD.left + PLOT_W / 2}
          y={CHART_H - 6}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight={600}
          fill={axisText}
        >
          {pick('Operating Sump Temperature (°C)', 'Suhu Oli Sump (°C)', '運転油温 (°C)')}
        </text>

        {/* Recommended VG dashed curve */}
        {recommendedPath && (
          <path
            d={recommendedPath}
            fill="none"
            stroke={recStroke}
            strokeWidth={2}
            strokeDasharray="6 4"
            opacity={0.85}
          />
        )}

        {/* Active VG curve */}
        <path
          d={activePath}
          fill="none"
          stroke={curveStroke}
          strokeWidth={2.75}
          strokeLinecap="round"
        />

        {/* Crosshair lines */}
        <line
          x1={opX}
          y1={PAD.top}
          x2={opX}
          y2={CHART_H - PAD.bottom}
          stroke={dotColor}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.75}
        />
        <line
          x1={PAD.left}
          y1={opY}
          x2={CHART_W - PAD.right}
          y2={opY}
          stroke={dotColor}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.75}
        />

        {/* Operating point marker */}
        <circle cx={opX} cy={opY} r={8} fill={dotColor} opacity={0.22} />
        <circle
          cx={opX}
          cy={opY}
          r={4.5}
          fill={dotColor}
          stroke={isDark ? '#0f172a' : '#ffffff'}
          strokeWidth={1.5}
        />

        {/* Callout label */}
        <g
          transform={`translate(${Math.min(
            CHART_W - PAD.right - 120,
            Math.max(PAD.left + 6, opX + 10),
          )}, ${Math.max(PAD.top + 6, opY - 26)})`}
        >
          <rect
            width={114}
            height={22}
            rx={6}
            fill={isDark ? '#1e293b' : '#ffffff'}
            stroke={dotColor}
            strokeWidth={1.2}
          />
          <text
            x={57}
            y={14.5}
            textAnchor="middle"
            fontSize={10}
            fontWeight={600}
            fill={isDark ? '#f8fafc' : '#0f172a'}
          >
            {currentViscosity.toFixed(1)} cSt @ {tempC}°C
          </text>
        </g>
      </svg>
    </div>
  );
}

interface EhlFilmCanvasProps {
  ehl: EhlResult;
  equipment: EquipmentSpec;
  tempC: number;
  waterPpm: number;
  wearLevel: WearLevel;
  iso4406: Iso4406Result;
  beta5: Beta5Value;
}

export function EhlFilmCanvas({
  ehl,
  equipment,
  tempC,
  waterPpm,
  wearLevel,
  iso4406,
  beta5,
}: EhlFilmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const { pick } = useLanguage();

  const stateRef = useRef({
    ehl,
    equipment,
    tempC,
    waterPpm,
    wearLevel,
    iso4406,
    beta5,
    theme,
  });

  useEffect(() => {
    stateRef.current = {
      ehl,
      equipment,
      tempC,
      waterPpm,
      wearLevel,
      iso4406,
      beta5,
      theme,
    };
  }, [ehl, equipment, tempC, waterPpm, wearLevel, iso4406, beta5, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let offset = 0;

    // Deterministic particle seeds
    const particles = Array.from({ length: 34 }, (_, i) => ({
      xNorm: (i * 0.137) % 1,
      yNorm: ((i * 0.293) % 0.72) + 0.14,
      speed: 0.7 + ((i * 0.19) % 0.6),
      size: 1.5 + (i % 3) * 0.7,
    }));

    const render = () => {
      const {
        ehl: curEhl,
        equipment: curEq,
        tempC: curTemp,
        waterPpm: wPpm,
        iso4406: curIso,
        theme: curTheme,
      } = stateRef.current;
      const isDark = curTheme === 'dark';

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = 220;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Subtle CAD blueprint grid
      ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(203, 213, 225, 0.55)';
      ctx.lineWidth = 0.75;
      for (let gx = 0; gx < width; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // Exact 1:1 physical gap: asperityAmp = 14 px, so peaks touch at gap = 2 * 14 = 28 px (lambda = 1.0)
      const asperityAmp = 14;
      const gapPx = Math.max(8, Math.min(96, curEhl.lambdaRatio * (2 * asperityAmp)));
      const centerY = height / 2;
      const upperMeanY = centerY - gapPx / 2;
      const lowerMeanY = centerY + gapPx / 2;

      // Flow speed scales inversely with viscosity (hot thin oil flows faster)
      const flowSpeed = Math.max(0.65, Math.min(2.6, 2.2 - Math.log10(curEhl.viscosityCst) * 0.55));
      offset = (offset + flowSpeed) % 48;

      // Dynamic oil clarity & color: healthy amber -> dark oxidized brown -> milky water emulsion
      const oxMix = Math.max(0, Math.min(1, (curTemp - curEq.maxSafeTemp + 5) / 25));
      const waterMix = Math.max(0, Math.min(1, (wPpm - 250) / 1200));

      let r = 245 * (1 - oxMix) + 92 * oxMix;
      let g = 158 * (1 - oxMix) + 45 * oxMix;
      let b = 11 * (1 - oxMix) + 12 * oxMix;
      r = r * (1 - waterMix * 0.65) + 226 * (waterMix * 0.65);
      g = g * (1 - waterMix * 0.65) + 232 * (waterMix * 0.65);
      b = b * (1 - waterMix * 0.65) + 240 * (waterMix * 0.65);

      const baseAlpha = 0.34 + waterMix * 0.32 + oxMix * 0.18;
      const filmGrad = ctx.createLinearGradient(0, upperMeanY, 0, lowerMeanY);
      filmGrad.addColorStop(0, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${(baseAlpha * 0.72).toFixed(2)})`);
      filmGrad.addColorStop(0.5, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${baseAlpha.toFixed(2)})`);
      filmGrad.addColorStop(1, `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${(baseAlpha * 0.72).toFixed(2)})`);
      ctx.fillStyle = filmGrad;
      ctx.fillRect(0, upperMeanY - 6, width, gapPx + 12);

      // Helper to generate micro-asperity profile y
      const asperityY = (x: number, phase: number, dir: 1 | -1) => {
        const wave =
          Math.sin((x + phase) * 0.13) * 0.55 +
          Math.sin((x + phase) * 0.31 + 1.2) * 0.3 +
          Math.cos((x + phase) * 0.57) * 0.15;
        return wave * asperityAmp * dir;
      };

      // Draw Upper Moving Surface (steel race / gear tooth) with ISO 45° section hatching
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      for (let x = width; x >= 0; x -= 4) {
        const y = upperMeanY + asperityY(x, -offset * 2.5, 1);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      const upperGrad = ctx.createLinearGradient(0, 0, 0, upperMeanY + asperityAmp);
      upperGrad.addColorStop(0, isDark ? '#1e293b' : '#e2e8f0');
      upperGrad.addColorStop(1, isDark ? '#475569' : '#94a3b8');
      ctx.fillStyle = upperGrad;
      ctx.fill();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(51, 65, 85, 0.18)';
      ctx.lineWidth = 1;
      for (let hx = -height; hx < width + height; hx += 12) {
        ctx.beginPath();
        ctx.moveTo(hx, 0);
        ctx.lineTo(hx + upperMeanY + 20, upperMeanY + 20);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = isDark ? '#94a3b8' : '#475569';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Draw Lower Stationary Surface with opposing -45° ISO section hatching
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      for (let x = width; x >= 0; x -= 4) {
        const y = lowerMeanY + asperityY(x, 12, -1);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      const lowerGrad = ctx.createLinearGradient(0, lowerMeanY - asperityAmp, 0, height);
      lowerGrad.addColorStop(0, isDark ? '#334155' : '#94a3b8');
      lowerGrad.addColorStop(1, isDark ? '#0f172a' : '#cbd5e1');
      ctx.fillStyle = lowerGrad;
      ctx.fill();

      ctx.save();
      ctx.clip();
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(51, 65, 85, 0.18)';
      ctx.lineWidth = 1;
      for (let hx = -height; hx < width + height; hx += 12) {
        ctx.beginPath();
        ctx.moveTo(hx, height);
        ctx.lineTo(hx + (height - lowerMeanY + 20), lowerMeanY - 20);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = isDark ? '#64748b' : '#334155';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Draw animated oil streamlines & contaminant particles inside the film
      // Particle count responds directly to ISO 4406 (>= 4 um code, including beta5 filtration)
      const waterRatio = Math.min(1, wPpm / 2000);
      const isoExcess = Math.max(0, curIso.actual[0] - 14);
      const wearCount = Math.min(18, Math.max(1, Math.round(isoExcess * 1.8)));
      const waterCount = Math.round(waterRatio * 12);

      particles.forEach((p, idx) => {
        const px = ((p.xNorm * width + offset * 4 * p.speed) % (width + 20)) - 10;
        const py = upperMeanY + p.yNorm * gapPx;

        if (idx < waterCount) {
          // Water emulsion droplet (cyan/blue)
          ctx.beginPath();
          ctx.arc(px, py, p.size + 1.2, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.85)' : 'rgba(2, 132, 199, 0.8)';
          ctx.fill();
        } else if (idx >= waterCount && idx < waterCount + wearCount) {
          // Metallic wear particle (dark/crimson)
          ctx.fillStyle = isDark ? '#fb7185' : '#be123c';
          ctx.fillRect(px - p.size, py - p.size, p.size * 2, p.size * 2);
        } else {
          // Clean oil flow streak
          ctx.beginPath();
          ctx.moveTo(px - 8, py);
          ctx.lineTo(px + 6, py);
          ctx.strokeStyle = isDark
            ? 'rgba(251, 191, 36, 0.55)'
            : 'rgba(217, 119, 6, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Asperity collision sparks/flashes appear right when lambda < 1.0 (boundary contact)
      if (curEhl.lambdaRatio < 1.0) {
        for (let x = 16; x < width - 16; x += 10) {
          const yTop = upperMeanY + asperityY(x, -offset * 2.5, 1);
          const yBot = lowerMeanY + asperityY(x, 12, -1);
          if (yTop >= yBot - 1) {
            const flashR = 3.8 + 1.4 * Math.sin(offset * 0.6 + x);
            ctx.beginPath();
            ctx.arc(x, (yTop + yBot) / 2, flashR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, (yTop + yBot) / 2, flashR * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(254, 240, 138, 0.95)';
            ctx.fill();
          }
        }
      }

      // CAD Mean-Line & Film Thickness Dimension Callout on right
      const dimX = width - 86;
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(251, 191, 36, 0.7)' : 'rgba(180, 83, 9, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(dimX - 18, upperMeanY);
      ctx.lineTo(dimX + 6, upperMeanY);
      ctx.moveTo(dimX - 18, lowerMeanY);
      ctx.lineTo(dimX + 6, lowerMeanY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(dimX, upperMeanY);
      ctx.lineTo(dimX, lowerMeanY);
      ctx.stroke();

      // Callout pill for h_min
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(dimX + 8, centerY - 11, 70, 22, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
      ctx.font = '700 10.5px ui-monospace, monospace';
      ctx.fillText(`h=${curEhl.filmThicknessUm.toFixed(2)}μm`, dimX + 13, centerY + 3.5);
      ctx.restore();

      // Direction arrow on upper moving surface (with crisp pill backing)
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect(8, 6, 178, 19, 4);
      ctx.fill();
      ctx.fillStyle = isDark ? '#e2e8f0' : '#0f172a';
      ctx.font = '600 11px system-ui, sans-serif';
      ctx.fillText('Moving Race / Gear Tooth  →', 14, 19);

      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect(8, height - 25, 206, 19, 4);
      ctx.fill();
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.fillText('Stationary Housing / Mating Surface', 14, height - 12);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const regimeBadge =
    ehl.regime === 'Full-Film EHL'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
      : ehl.regime === 'Mixed'
        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {pick(
              'EHL Oil Film Thickness (λ-Ratio) & Asperity Contact',
              'Ketebalan Film Oli EHL (Rasio-λ) & Kontak Asperitas',
              'EHL油膜厚さ (λ比) & 突起接触断面',
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            h<sub>min</sub> = {ehl.filmThicknessUm.toFixed(2)} μm · σ ={' '}
            {equipment.surfaceRoughnessUm.toFixed(2)} μm · ISO {iso4406.codeString} (β₅={beta5})
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${regimeBadge}`}
        >
          λ = {ehl.lambdaRatio.toFixed(2)} · {ehl.regime}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        className="h-[220px] w-full rounded-lg border border-slate-200 dark:border-slate-800"
      />

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-3 rounded-xs bg-amber-500/70" /> Oil Film
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Water Droplets ({waterPpm} ppm)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 bg-rose-600" /> Wear Debris ({wearLevel})
          </span>
        </div>
        <span>
          {ehl.lambdaRatio < 1.0
            ? pick('Boundary asperity contact active!', 'Kontak asperitas batas aktif!', '境界突起接触が発生中！')
            : ehl.lambdaRatio < 1.5
              ? pick('Marginal film — near asperity contact', 'Film tipis — mendekati kontak', '限界油膜 — 接触寸前')
              : pick('Surfaces separated by EHL film', 'Permukaan terpisah oleh film EHL', 'EHL油膜により接触面を分離')}
        </span>
      </div>
    </div>
  );
}

interface StribeckCurveChartProps {
  lambdaRatio: number;
  regime: EhlResult['regime'];
}

function stribeckFriction(lambda: number): number {
  // Smooth Stribeck friction curve: boundary plateau (~0.11) -> mixed drop -> min ~0.012 at lambda~3 -> gentle viscous rise
  const boundaryDrop = 0.098 / (1 + Math.pow(lambda / 1.15, 3.2));
  const viscousDrag = 0.008 + 0.0045 * Math.max(0, lambda - 1.2);
  return Math.min(0.13, Math.max(0.01, boundaryDrop + viscousDrag));
}

const STRIBECK_W = 760;
const STRIBECK_H = 190;
const STRIBECK_PAD = { top: 24, right: 24, bottom: 36, left: 54 };
const STRIBECK_PW = STRIBECK_W - STRIBECK_PAD.left - STRIBECK_PAD.right;
const STRIBECK_PH = STRIBECK_H - STRIBECK_PAD.top - STRIBECK_PAD.bottom;
const STRIBECK_MIN_L = 0.2;
const STRIBECK_MAX_L = 5.0;
const STRIBECK_MAX_MU = 0.13;

function stribeckXOf(l: number): number {
  return (
    STRIBECK_PAD.left +
    ((Math.max(STRIBECK_MIN_L, Math.min(STRIBECK_MAX_L, l)) - STRIBECK_MIN_L) /
      (STRIBECK_MAX_L - STRIBECK_MIN_L)) *
      STRIBECK_PW
  );
}

function stribeckYOf(mu: number): number {
  return (
    STRIBECK_PAD.top +
    STRIBECK_PH -
    (Math.max(0, Math.min(STRIBECK_MAX_MU, mu)) / STRIBECK_MAX_MU) * STRIBECK_PH
  );
}

export function StribeckCurveChart({ lambdaRatio, regime }: StribeckCurveChartProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const W = STRIBECK_W;
  const H = STRIBECK_H;
  const P = STRIBECK_PAD;
  const PW = STRIBECK_PW;
  const PH = STRIBECK_PH;
  const minL = STRIBECK_MIN_L;
  const maxL = STRIBECK_MAX_L;
  const xOf = stribeckXOf;
  const yOf = stribeckYOf;

  const curvePath = useMemo(() => {
    const pts: string[] = [];
    for (let l = STRIBECK_MIN_L; l <= STRIBECK_MAX_L + 0.01; l += 0.1) {
      const x = stribeckXOf(l).toFixed(1);
      const y = stribeckYOf(stribeckFriction(l)).toFixed(1);
      pts.push(`${l === STRIBECK_MIN_L ? 'M' : 'L'}${x},${y}`);
    }
    return pts.join(' ');
  }, []);

  const clampedL = Math.max(minL, Math.min(maxL, lambdaRatio));
  const curMu = stribeckFriction(clampedL);
  const dotX = xOf(clampedL);
  const dotY = yOf(curMu);

  const dotColor =
    lambdaRatio < 1.0
      ? isDark
        ? '#fb7185'
        : '#e11d48'
      : lambdaRatio < 3.0
        ? isDark
          ? '#fbbf24'
          : '#d97706'
        : isDark
          ? '#34d399'
          : '#059669';

  const x1 = xOf(1.0);
  const x3 = xOf(3.0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {pick(
              'Stribeck Friction Curve (μ vs λ-Ratio)',
              'Kurva Gesekan Stribeck (μ vs Rasio-λ)',
              'ストライベック摩擦曲線 (μ vs λ比)',
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {pick(
              'Boundary (λ < 1) · Mixed (1 ≤ λ < 3) · Full-Film EHL (λ ≥ 3)',
              'Batas (λ < 1) · Campuran (1 ≤ λ < 3) · Full-Film EHL (λ ≥ 3)',
              '境界潤滑 (λ < 1) · 混合潤滑 (1 ≤ λ < 3) · 完全EHL (λ ≥ 3)',
            )}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          μ ≈ {curMu.toFixed(3)} · {regime}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-h-[200px] select-none"
        role="img"
        aria-label="Stribeck curve showing friction coefficient versus lambda film ratio"
      >
        {/* Regime Zones */}
        <rect
          x={P.left}
          y={P.top}
          width={x1 - P.left}
          height={PH}
          fill={isDark ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.08)'}
        />
        <rect
          x={x1}
          y={P.top}
          width={x3 - x1}
          height={PH}
          fill={isDark ? 'rgba(245, 158, 11, 0.10)' : 'rgba(245, 158, 11, 0.08)'}
        />
        <rect
          x={x3}
          y={P.top}
          width={W - P.right - x3}
          height={PH}
          fill={isDark ? 'rgba(16, 185, 129, 0.10)' : 'rgba(16, 185, 129, 0.08)'}
        />

        {/* Zone Header Labels */}
        <text x={(P.left + x1) / 2} y={P.top + 14} textAnchor="middle" fontSize={10} fontWeight={600} fill={isDark ? '#fda4af' : '#be123c'}>
          {pick('Boundary', 'Batas', '境界潤滑')}
        </text>
        <text x={(x1 + x3) / 2} y={P.top + 14} textAnchor="middle" fontSize={10} fontWeight={600} fill={isDark ? '#fcd34d' : '#b45309'}>
          {pick('Mixed', 'Campuran', '混合潤滑')}
        </text>
        <text x={(x3 + W - P.right) / 2} y={P.top + 14} textAnchor="middle" fontSize={10} fontWeight={600} fill={isDark ? '#6ee7b7' : '#047857'}>
          {pick('Full-Film EHL', 'Full-Film EHL', '完全EHL')}
        </text>

        {/* Grid lines */}
        {[0.03, 0.06, 0.09, 0.12].map((mu) => (
          <g key={mu}>
            <line x1={P.left} y1={yOf(mu)} x2={W - P.right} y2={yOf(mu)} stroke={isDark ? '#334155' : '#e2e8f0'} strokeWidth={1} />
            <text x={P.left - 8} y={yOf(mu) + 3.5} textAnchor="end" fontSize={10} fill={isDark ? '#94a3b8' : '#64748b'}>
              {mu.toFixed(2)}
            </text>
          </g>
        ))}

        {[0.5, 1, 2, 3, 4, 5].map((l) => (
          <g key={l}>
            <line
              x1={xOf(l)}
              y1={P.top}
              x2={xOf(l)}
              y2={H - P.bottom}
              stroke={l === 1 || l === 3 ? (isDark ? '#64748b' : '#94a3b8') : isDark ? '#334155' : '#e2e8f0'}
              strokeDasharray={l === 1 || l === 3 ? '4 3' : undefined}
              strokeWidth={1}
            />
            <text x={xOf(l)} y={H - P.bottom + 14} textAnchor="middle" fontSize={10} fill={isDark ? '#94a3b8' : '#64748b'}>
              {l.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Border */}
        <rect x={P.left} y={P.top} width={PW} height={PH} fill="none" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth={1} />

        {/* Axis Titles */}
        <text x={14} y={P.top + PH / 2} textAnchor="middle" fontSize={10} fontWeight={600} fill={isDark ? '#94a3b8' : '#64748b'} transform={`rotate(-90 14 ${P.top + PH / 2})`}>
          {pick('Friction μ', 'Gesekan μ', '摩擦係数 μ')}
        </text>
        <text x={P.left + PW / 2} y={H - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill={isDark ? '#94a3b8' : '#64748b'}>
          {pick('Film Thickness Ratio λ = h_min / σ', 'Rasio Ketebalan Film λ = h_min / σ', '油膜厚さ比 λ = h_min / σ')}
        </text>

        {/* Stribeck Curve */}
        <path d={curvePath} fill="none" stroke={isDark ? '#f59e0b' : '#d97706'} strokeWidth={2.75} strokeLinecap="round" />

        {/* Operating point */}
        <circle cx={dotX} cy={dotY} r={8} fill={dotColor} opacity={0.25} />
        <circle cx={dotX} cy={dotY} r={4.5} fill={dotColor} stroke={isDark ? '#0f172a' : '#ffffff'} strokeWidth={1.5} />

        {/* Callout Pill */}
        <g transform={`translate(${Math.min(W - P.right - 122, Math.max(P.left + 6, dotX + 10))}, ${Math.max(P.top + 18, dotY - 24)})`}>
          <rect width={116} height={20} rx={5} fill={isDark ? '#1e293b' : '#ffffff'} stroke={dotColor} strokeWidth={1.2} />
          <text x={58} y={13.5} textAnchor="middle" fontSize={10} fontWeight={600} fill={isDark ? '#f8fafc' : '#0f172a'}>
            λ={lambdaRatio.toFixed(2)} · μ={curMu.toFixed(3)}
          </text>
        </g>
      </svg>
    </div>
  );
}
