import { useState } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FLANGE_PASSES, FLANGE_SEQUENCES } from './boltData';

interface FlangeStarMiniLabProps {
  targetTorqueNm: number;
}

interface BoltAuditEntry {
  p1: number | null;
  p2: number | null;
  p3: number | null;
}

function createEmptyAuditLog(count: number): BoltAuditEntry[] {
  return Array.from({ length: count }, () => ({ p1: null, p2: null, p3: null }));
}

export function FlangeStarMiniLab({ targetTorqueNm }: FlangeStarMiniLabProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const [boltCount, setBoltCount] = useState<6 | 8>(6);
  const [passIndex, setPassIndex] = useState<number>(0); // 0, 1, 2; 3 = complete
  const [stepIndex, setStepIndex] = useState<number>(0); // 0 .. boltCount - 1
  const [boltTorquesPct, setBoltTorquesPct] = useState<number[]>(() => Array(6).fill(0));
  const [auditLog, setAuditLog] = useState<BoltAuditEntry[]>(() => createEmptyAuditLog(6));
  const [showHint, setShowHint] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<number>(0);

  const sequence = FLANGE_SEQUENCES[boltCount];
  const isComplete = passIndex >= FLANGE_PASSES.length;
  const currentPass = isComplete ? FLANGE_PASSES[2] : FLANGE_PASSES[passIndex];
  const expectedBolt = isComplete ? null : sequence[stepIndex];

  const resetLab = (count: 6 | 8 = boltCount) => {
    setBoltCount(count);
    setPassIndex(0);
    setStepIndex(0);
    setBoltTorquesPct(Array(count).fill(0));
    setAuditLog(createEmptyAuditLog(count));
    setErrorMsg(null);
    setMistakes(0);
  };

  const handleBoltClick = (boltNumber: number) => {
    if (isComplete || expectedBolt === null) return;

    if (boltNumber !== expectedBolt) {
      setMistakes((m) => m + 1);
      setErrorMsg(
        `Out of star sequence! Clicking Bolt #${boltNumber} instead of #${expectedBolt} causes uneven gasket crush and flange cocking.`
      );
      return;
    }

    setErrorMsg(null);
    const nextTorques = [...boltTorquesPct];
    nextTorques[boltNumber - 1] = currentPass.torquePercent;
    setBoltTorquesPct(nextTorques);

    const recordedNm = Number(((targetTorqueNm * currentPass.torquePercent) / 100).toFixed(1));
    setAuditLog((prev) =>
      prev.map((entry, idx) => {
        if (idx !== boltNumber - 1) return entry;
        if (currentPass.pass === 1) return { ...entry, p1: recordedNm };
        if (currentPass.pass === 2) return { ...entry, p2: recordedNm };
        return { ...entry, p3: recordedNm };
      })
    );

    if (stepIndex + 1 < boltCount) {
      setStepIndex(stepIndex + 1);
    } else {
      setStepIndex(0);
      setPassIndex(passIndex + 1);
    }
  };

  // Gasket compression metrics
  const avgCompression =
    boltTorquesPct.reduce((sum, val) => sum + val, 0) / boltCount;
  const minPct = Math.min(...boltTorquesPct);
  const maxPct = Math.max(...boltTorquesPct);
  const spread = maxPct - minPct;
  const uniformity = avgCompression === 0 ? 100 : Math.max(0, 100 - spread);

  // SVG geometry
  const cx = 150;
  const cy = 145;
  const flangeOuterR = 112;
  const boltCircleR = 86;
  const gasketOuterR = 66;
  const boreR = 42;

  const flangeFill = isDark ? '#1e293b' : '#f1f5f9';
  const flangeStroke = isDark ? '#475569' : '#94a3b8';
  const textPrimary = 'var(--md-on-surface)';
  const textMuted = 'var(--md-on-surface-variant)';

  const getBoltCoords = (boltIdxZeroBased: number) => {
    const angle = -Math.PI / 2 + (boltIdxZeroBased * 2 * Math.PI) / boltCount;
    return {
      x: cx + boltCircleR * Math.cos(angle),
      y: cy + boltCircleR * Math.sin(angle),
      angle,
    };
  };

  return (
    <div data-tour="bolt-flange-star" className="glass-panel rounded-[28px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--md-outline-variant)]/50 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--md-on-surface)]">
            {pick(
              'Flange Star-Pattern Tightening Mini-Lab',
              'Mini-Lab Pengencangan Flens Pola Bintang',
              'フランジ星型締付ミニラボ'
            )}
          </h3>
          <p className="text-xs text-[var(--md-on-surface-variant)]">
            {pick(
              `Click bolts in cross/star order across 3 passes (30% → 70% → 100% of ${targetTorqueNm.toFixed(0)} N·m).`,
              `Klik baut secara menyilang/pola bintang dalam 3 pass (30% → 70% → 100% dari ${targetTorqueNm.toFixed(0)} N·m).`,
              `3パス（目標 ${targetTorqueNm.toFixed(0)} N·m の 30% → 70% → 100%）で対角星型順にボルトをクリックしてください。`
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            {([6, 8] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => resetLab(count)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  boltCount === count
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {count}-Bolt
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            {showHint ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Hint
          </button>

          <button
            type="button"
            onClick={() => resetLab(boltCount)}
            className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[310px_1fr] lg:items-center">
        {/* Interactive Flange SVG */}
        <svg
          viewBox="0 0 300 290"
          className="mx-auto w-full max-w-[300px] rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)]"
          role="img"
          aria-label={`${boltCount}-bolt flange star pattern CAD diagram`}
        >
          <defs>
            <radialGradient id="flangeMetalGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={isDark ? '#334155' : '#ffffff'} />
              <stop offset="70%" stopColor={flangeFill} />
              <stop offset="100%" stopColor={isDark ? '#0f172a' : '#cbd5e1'} />
            </radialGradient>
          </defs>

          {/* Flange outer body */}
          <circle
            cx={cx}
            cy={cy}
            r={flangeOuterR}
            fill="url(#flangeMetalGrad)"
            stroke={flangeStroke}
            strokeWidth="2.2"
          />

          {/* Raised-face machining ring */}
          <circle
            cx={cx}
            cy={cy}
            r={gasketOuterR + 4}
            fill="none"
            stroke={flangeStroke}
            strokeWidth="1"
            opacity="0.7"
          />

          {/* Bolt circle CAD centerline */}
          <circle
            cx={cx}
            cy={cy}
            r={boltCircleR}
            fill="none"
            stroke={flangeStroke}
            strokeWidth="1"
            strokeDasharray="8 3 2 3"
            opacity="0.65"
          />

          {/* Gasket ring sectors showing local compression */}
          {Array.from({ length: boltCount }, (_, i) => {
            const pct = boltTorquesPct[i];
            const sectorAngle = (2 * Math.PI) / boltCount;
            const centerAngle = -Math.PI / 2 + i * sectorAngle;
            const a1 = centerAngle - sectorAngle / 2;
            const a2 = centerAngle + sectorAngle / 2;
            const rMid = (gasketOuterR + boreR) / 2;
            const x1 = cx + rMid * Math.cos(a1);
            const y1 = cy + rMid * Math.sin(a1);
            const x2 = cx + rMid * Math.cos(a2);
            const y2 = cy + rMid * Math.sin(a2);
            const strokeColor =
              pct >= 100
                ? '#10b981'
                : pct >= 70
                ? '#f59e0b'
                : pct >= 30
                ? '#fbbf24'
                : isDark
                ? '#334155'
                : '#cbd5e1';

            return (
              <path
                key={`gasket-${i}`}
                d={`M ${x1} ${y1} A ${rMid} ${rMid} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="18"
                opacity={pct > 0 ? 0.85 : 0.45}
              />
            );
          })}

          {/* Inner bore */}
          <circle
            cx={cx}
            cy={cy}
            r={boreR}
            fill="var(--md-surface-container-lowest)"
            stroke={flangeStroke}
            strokeWidth="1.5"
          />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fontFamily="var(--font-mono)"
            fill={textPrimary}
          >
            {isComplete ? 'SEALED' : `${currentPass.torquePercent}%`}
          </text>
          <text
            x={cx}
            y={cy + 11}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-sans)"
            fill={textMuted}
          >
            {isComplete ? '100% Pass' : `Pass ${currentPass.pass}/3`}
          </text>

          {/* Star path lines for completed steps in current pass */}
          {!isComplete &&
            stepIndex > 0 &&
            sequence.slice(0, stepIndex).map((bNum, idx) => {
              if (idx === 0) return null;
              const prev = getBoltCoords(sequence[idx - 1] - 1);
              const curr = getBoltCoords(bNum - 1);
              return (
                <line
                  key={`line-${idx}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={curr.x}
                  y2={curr.y}
                  stroke="var(--md-primary)"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                  opacity="0.75"
                />
              );
            })}

          {/* Clickable Bolts */}
          {Array.from({ length: boltCount }, (_, i) => {
            const boltNum = i + 1;
            const { x, y } = getBoltCoords(i);
            const pct = boltTorquesPct[i];
            const isNext = showHint && !isComplete && expectedBolt === boltNum;
            const isCurrentPassDone =
              !isComplete && pct >= currentPass.torquePercent;

            const fill =
              pct >= 100
                ? '#10b981'
                : isCurrentPassDone
                ? 'var(--md-primary)'
                : isDark
                ? '#334155'
                : '#ffffff';

            const stroke = isNext
              ? 'var(--md-primary)'
              : pct >= 100
              ? '#047857'
              : isCurrentPassDone
              ? 'var(--md-primary)'
              : flangeStroke;

            return (
              <g
                key={boltNum}
                onClick={() => handleBoltClick(boltNum)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Bolt ${boltNum}, currently at ${pct}% torque`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBoltClick(boltNum);
                  }
                }}
              >
                {isNext && (
                  <circle
                    cx={x}
                    cy={y}
                    r="21"
                    fill="none"
                    stroke="var(--md-primary)"
                    strokeWidth="2"
                    strokeDasharray="3 2"
                  />
                )}
                {/* Hardened Washer */}
                <circle
                  cx={x}
                  cy={y}
                  r="17"
                  fill={isDark ? '#1e293b' : '#e2e8f0'}
                  stroke={flangeStroke}
                  strokeWidth="1"
                />
                {/* 6-Sided Hex Bolt Head */}
                <polygon
                  points={Array.from({ length: 6 }, (_, k) => {
                    const a = (k * Math.PI) / 3 + Math.PI / 6;
                    return `${(x + 15.5 * Math.cos(a)).toFixed(1)},${(y + 15.5 * Math.sin(a)).toFixed(1)}`;
                  }).join(' ')}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isNext ? '2.2' : '1.6'}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  fill={
                    pct >= 100
                      ? '#ffffff'
                      : isCurrentPassDone
                      ? 'var(--md-on-primary)'
                      : textPrimary
                  }
                >
                  {boltNum}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Right: Pass Progress, Sequence & Gasket Compression */}
        <div className="space-y-4">
          {/* Pass Indicators */}
          <div className="grid grid-cols-3 gap-2">
            {FLANGE_PASSES.map((p, idx) => {
              const done = passIndex > idx;
              const active = passIndex === idx;
              const passNm = (targetTorqueNm * p.torquePercent) / 100;
              return (
                <div
                  key={p.pass}
                  className={`rounded-[20px] border p-2.5 text-xs transition ${
                    done
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : active
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  <div className="font-bold">
                    Pass {p.pass} ({p.torquePercent}%)
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] opacity-85">
                    {passNm.toFixed(1)} N·m
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sequence Guide */}
          <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--md-on-surface)]">
                {boltCount}-Bolt Star Sequence
              </span>
              <span className="font-mono text-[var(--md-on-surface-variant)]">
                Mistakes: {mistakes}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {sequence.map((bNum, idx) => {
                const isDoneStep = isComplete || idx < stepIndex;
                const isCurrentStep = !isComplete && idx === stepIndex;
                return (
                  <span
                    key={`${bNum}-${idx}`}
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold font-mono ${
                      isDoneStep
                        ? 'bg-emerald-500 text-white'
                        : isCurrentStep && showHint
                        ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] ring-2 ring-[var(--md-primary)]/35'
                        : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    {bNum}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Gasket Compression & Uniformity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--md-on-surface-variant)]">Gasket Compression</span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {avgCompression.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                <div
                  className="h-full rounded-full bg-[var(--md-primary)] transition-all"
                  style={{ width: `${avgCompression}%` }}
                />
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--md-on-surface-variant)]">Seat Uniformity</span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {uniformity.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                <div
                  className={`h-full rounded-full transition-all ${
                    uniformity >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${uniformity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-[22px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isComplete && (
            <div className="flex items-start gap-2 rounded-[22px] border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Flange tightening complete! All {boltCount} studs reached 100% (
                {targetTorqueNm.toFixed(0)} N·m) with {mistakes} sequence error
                {mistakes === 1 ? '' : 's'}. Perform one final clockwise check pass.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Pass Torque Audit Log Table */}
      <div className="mt-5 overflow-hidden rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] px-4 py-2.5">
          <span className="text-xs font-bold text-[var(--md-on-surface)]">
            {pick(
              'Multi-Pass Torque Audit Log (ASME PCC-1 Record)',
              'Log Audit Torsi Multi-Pass (Catatan ASME PCC-1)',
              '多パス締付トルク記録表 (ASME PCC-1)'
            )}
          </span>
          <span className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick('Gasket Compression:', 'Kompresi Gasket:', 'ガスケット圧縮率:')}{' '}
            <strong className="text-[var(--md-on-surface)]">
              {avgCompression.toFixed(0)}%
            </strong>{' '}
            · {pick('Uniformity:', 'Keseragaman:', '均一性:')}{' '}
            <strong
              className={
                uniformity >= 70
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }
            >
              {uniformity.toFixed(0)}%
            </strong>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
              <tr>
                <th className="px-3.5 py-2">{pick('Stud #', 'Baut #', 'ボルト #')}</th>
                <th className="px-3.5 py-2">Pass 1 (30%)</th>
                <th className="px-3.5 py-2">Pass 2 (70%)</th>
                <th className="px-3.5 py-2">Pass 3 (100%)</th>
                <th className="px-3.5 py-2 text-right">{pick('State', 'Status', '状態')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-outline-variant)]/40 bg-[var(--md-surface-container-low)]">
              {auditLog.map((entry, idx) => {
                const studNum = idx + 1;
                const pct = boltTorquesPct[idx] ?? 0;
                const isNextStud = !isComplete && expectedBolt === studNum;
                return (
                  <tr
                    key={studNum}
                    className={
                      isNextStud
                        ? 'bg-[var(--md-primary-container)]/35'
                        : undefined
                    }
                  >
                    <td className="px-3.5 py-2 font-mono font-bold text-[var(--md-on-surface)]">
                      Bolt #{studNum}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[var(--md-on-surface-variant)]">
                      {entry.p1 !== null ? `${entry.p1.toFixed(1)} N·m` : '—'}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[var(--md-on-surface-variant)]">
                      {entry.p2 !== null ? `${entry.p2.toFixed(1)} N·m` : '—'}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[var(--md-on-surface-variant)]">
                      {entry.p3 !== null ? `${entry.p3.toFixed(1)} N·m` : '—'}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          pct >= 100
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : pct > 0
                            ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                            : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                        }`}
                      >
                        {pct >= 100 ? 'FINAL 100%' : pct > 0 ? `${pct}%` : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
