import { useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  generatePumpCurves,
  RATED_RPM,
  type PumpOperatingPoint,
  type PumpParams,
} from './pumpPhysics';

interface PumpCurveCanvasProps {
  params: PumpParams;
  op: PumpOperatingPoint;
  onSelectTargetFlow?: (flowM3h: number) => void;
}

export function PumpCurveCanvas({ params, op, onSelectTargetFlow }: PumpCurveCanvasProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const curves = useMemo(() => generatePumpCurves(params), [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 560;
    const height = 270;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const colors = {
      bg: isDark ? '#0f172a' : '#ffffff',
      grid: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(15, 23, 42, 0.08)',
      axis: isDark ? '#64748b' : '#94a3b8',
      text: isDark ? '#cbd5e1' : '#334155',
      muted: isDark ? '#64748b' : '#64748b',
      pump: isDark ? '#22d3ee' : '#0891b2',
      ratedGhost: isDark ? 'rgba(148, 163, 184, 0.35)' : 'rgba(100, 116, 139, 0.35)',
      system: '#f59e0b',
      efficiency: isDark ? '#34d399' : '#059669',
      opPoint: op.isCavitating || op.isDeadHead ? '#ef4444' : '#06b6d4',
    };

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    const pad = { top: 24, right: 48, bottom: 38, left: 48 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const maxQ = Math.max(160, Math.ceil((op.maxFlowM3h * 1.05) / 20) * 20);
    const maxH = Math.max(60, Math.ceil((op.shutoffHeadM * 1.1) / 10) * 10);

    const xOf = (q: number) => pad.left + (q / maxQ) * plotW;
    const yHeadOf = (h: number) => pad.top + plotH - (h / maxH) * plotH;
    const yEffOf = (e: number) => pad.top + plotH - (e / 100) * plotH;

    // Preferred Operating Region (POR: 70%–120% BEP) shaded band
    const porX1 = Math.max(pad.left, xOf(op.porMinFlowM3h));
    const porX2 = Math.min(pad.left + plotW, xOf(op.porMaxFlowM3h));
    if (porX2 > porX1) {
      ctx.save();
      ctx.fillStyle = isDark
        ? 'rgba(16, 185, 129, 0.11)'
        : 'rgba(16, 185, 129, 0.09)';
      ctx.fillRect(porX1, pad.top, porX2 - porX1, plotH);

      ctx.strokeStyle = isDark
        ? 'rgba(52, 211, 153, 0.35)'
        : 'rgba(5, 150, 105, 0.3)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(porX1, pad.top);
      ctx.lineTo(porX1, pad.top + plotH);
      ctx.moveTo(porX2, pad.top);
      ctx.lineTo(porX2, pad.top + plotH);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#34d399' : '#047857';
      ctx.font = '600 9.5px "Google Sans", "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POR (70–120% BEP)', (porX1 + porX2) / 2, pad.top + 12);
      ctx.restore();
    }

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = pad.top + (plotH * i) / yTicks;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();

      const hVal = Math.round(maxH * (1 - i / yTicks));
      ctx.fillStyle = colors.text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${hVal}`, pad.left - 6, y + 3);

      const effVal = Math.round(100 * (1 - i / yTicks));
      ctx.fillStyle = colors.efficiency;
      ctx.textAlign = 'left';
      ctx.fillText(`${effVal}%`, pad.left + plotW + 6, y + 3);
    }

    const xTicks = 5;
    for (let i = 0; i <= xTicks; i++) {
      const x = pad.left + (plotW * i) / xTicks;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();

      const qVal = Math.round((maxQ * i) / xTicks);
      ctx.fillStyle = colors.text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${qVal}`, x, pad.top + plotH + 14);
    }

    // Axes
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Axis titles
    ctx.fillStyle = colors.text;
    ctx.font = '600 10.5px "Google Sans", "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Flow Rate Q (m³/h)', pad.left + plotW / 2, height - 6);

    ctx.save();
    ctx.translate(13, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Head H (m)', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = colors.efficiency;
    ctx.translate(width - 10, pad.top + plotH / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('Efficiency η (%)', 0, 0);
    ctx.restore();

    // Rated 1750 RPM / 100% trim single-pump ghost curve if modified
    const showGhost =
      Math.abs(params.rpm - RATED_RPM) > 10 ||
      params.impellerTrimPct < 100 ||
      params.parallelPumps;
    if (showGhost) {
      ctx.save();
      ctx.strokeStyle = colors.ratedGhost;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (const pt of curves) {
        if (pt.ratedHead <= 0 && started) break;
        const x = xOf(pt.q);
        const y = yHeadOf(Math.min(maxH, pt.ratedHead));
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Efficiency curve
    ctx.save();
    ctx.strokeStyle = colors.efficiency;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    let effStarted = false;
    for (const pt of curves) {
      if (pt.q > op.maxFlowM3h * 1.02) break;
      const x = xOf(pt.q);
      const y = yEffOf(pt.efficiency);
      if (!effStarted) {
        ctx.moveTo(x, y);
        effStarted = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.restore();

    // System Resistance Curve
    if (params.valveOpening > 0.5) {
      ctx.save();
      ctx.strokeStyle = colors.system;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let sysStarted = false;
      for (const pt of curves) {
        if (pt.systemHead === null || pt.systemHead > maxH * 1.05) continue;
        const x = xOf(pt.q);
        const y = yHeadOf(pt.systemHead);
        if (!sysStarted) {
          ctx.moveTo(x, y);
          sysStarted = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // Pump H-Q Curve
    ctx.save();
    ctx.strokeStyle = colors.pump;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    let pumpStarted = false;
    for (const pt of curves) {
      if (pt.q > op.maxFlowM3h && pumpStarted) break;
      const x = xOf(pt.q);
      const y = yHeadOf(pt.pumpHead);
      if (!pumpStarted) {
        ctx.moveTo(x, y);
        pumpStarted = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.restore();

    // BEP Marker on Pump Curve
    const bepX = xOf(op.bepFlowM3h);
    const bepY = yHeadOf(op.bepHeadM);
    ctx.save();
    ctx.fillStyle = colors.efficiency;
    ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bepX, bepY - 6);
    ctx.lineTo(bepX + 6, bepY);
    ctx.lineTo(bepX, bepY + 6);
    ctx.lineTo(bepX - 6, bepY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = '600 9.5px "Google Sans", "Outfit", sans-serif';
    ctx.fillText('BEP', bepX - 10, bepY + 16);
    ctx.restore();

    // Current Operating Point crosshair & dot
    const opX = xOf(op.flowM3h);
    const opY = yHeadOf(op.headM);
    ctx.save();
    ctx.strokeStyle = colors.opPoint;
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(opX, pad.top + plotH);
    ctx.lineTo(opX, opY);
    ctx.lineTo(pad.left, opY);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = colors.opPoint;
    ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(opX, opY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colors.text;
    ctx.font = '700 10px "JetBrains Mono", monospace';
    const labelX = opX > pad.left + plotW * 0.72 ? opX - 72 : opX + 9;
    const labelY = opY < pad.top + 24 ? opY + 14 : opY - 8;
    ctx.fillText(`(${op.flowM3h.toFixed(1)}, ${op.headM.toFixed(1)}m)`, labelX, labelY);
    ctx.restore();
  }, [curves, isDark, op, params.impellerTrimPct, params.parallelPumps, params.rpm, params.valveOpening]);

  // NPSHa vs NPSHr bar scaling (max 15m)
  const maxNpshScale = 15;
  const npshaPct = Math.max(0, Math.min(100, (op.npshaM / maxNpshScale) * 100));
  const npshrPct = Math.max(0, Math.min(100, (op.npshrM / maxNpshScale) * 100));

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSelectTargetFlow || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const padLeft = 48;
    const padRight = 48;
    const plotW = rect.width - padLeft - padRight;
    if (plotW <= 0) return;
    const maxQ = Math.max(160, Math.ceil((op.maxFlowM3h * 1.05) / 20) * 20);
    const frac = Math.max(0.08, Math.min(0.95, (clickX - padLeft) / plotW));
    onSelectTargetFlow(Math.round(frac * maxQ));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-bold text-[var(--md-on-surface)]">
            {pick(
              'Pump H-Q, System & Efficiency Curves',
              'Kurva H-Q Pompa, Sistem & Efisiensi',
              'ポンプ H-Q・管路抵抗・効率曲線'
            )}
          </span>
          {onSelectTargetFlow && (
            <span className="ml-2 text-[11px] font-semibold text-[var(--md-primary)]">
              {pick(
                '(Click chart to VFD Auto-Tune)',
                '(Klik grafik untuk Auto-Tune VFD)',
                '(クリックでVFD自動調整)'
              )}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--md-on-surface-variant)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3.5 bg-cyan-500" /> {pick('Pump H-Q', 'H-Q Pompa', 'ポンプH-Q')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3.5 bg-amber-500" /> {pick('System', 'Sistem', '管路抵抗')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-emerald-500" /> η (%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-500/25 border border-emerald-500/50" /> POR
          </span>
          {(Math.abs(params.rpm - RATED_RPM) > 10 ||
            params.impellerTrimPct < 100 ||
            params.parallelPumps) && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3.5 border-t-2 border-dashed border-[var(--md-outline)]" /> Rated 1×
            </span>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        title="Click anywhere on the H-Q chart to auto-tune VFD RPM to that target flow"
        className={`h-[270px] w-full rounded-[22px] border border-[var(--md-outline-variant)]/60 ${
          onSelectTargetFlow ? 'cursor-crosshair' : ''
        }`}
      />

      {/* NPSHa vs NPSHr Bar Indicator */}
      <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--md-on-surface)]">
            {pick(
              'Cavitation Margin: NPSHa vs NPSHr',
              'Margin Kavitasi: NPSHa vs NPSHr',
              'キャビテーション余裕: NPSHa 対 NPSHr'
            )}
          </span>
          <span
            className={`font-mono font-bold ${
              op.isCavitating
                ? 'text-rose-600 dark:text-rose-400'
                : op.npshMarginM < 1.0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {op.isCavitating
              ? `${pick('CAVITATING', 'KAVITASI', 'キャビテーション発生')} (${op.npshMarginM.toFixed(2)} m)`
              : `${pick('Margin', 'Margin', '余裕代')}: +${op.npshMarginM.toFixed(2)} m`}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-14 font-medium text-[var(--md-on-surface-variant)]">NPSHa</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
              <div
                className={`h-full rounded-full transition-all ${
                  op.isCavitating ? 'bg-rose-500' : 'bg-[var(--md-primary)]'
                }`}
                style={{ width: `${npshaPct}%` }}
              />
            </div>
            <span className="w-14 text-right font-mono font-semibold text-[var(--md-on-surface)]">
              {op.npshaM.toFixed(2)} m
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-14 font-medium text-[var(--md-on-surface-variant)]">NPSHr</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${npshrPct}%` }}
              />
            </div>
            <span className="w-14 text-right font-mono font-semibold text-[var(--md-on-surface)]">
              {op.npshrM.toFixed(2)} m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
