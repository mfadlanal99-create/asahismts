import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  computeValveCurve,
  VALVE_TYPE_INFO,
  type ValveParams,
  type ValveTelemetry,
} from './valvePhysics';

interface ValveDiagnosticsPanelProps {
  params: ValveParams;
  telemetry: ValveTelemetry;
}

const RING_SHARES = [42, 27, 19, 12] as const;

export function ValveDiagnosticsPanel({
  params,
  telemetry,
}: ValveDiagnosticsPanelProps) {
  const { theme } = useTheme();
  const { pick } = useLanguage();
  const isDark = theme === 'dark';

  const palette = {
    bg: 'var(--md-surface-container)',
    grid: 'var(--md-outline-variant)',
    axis: 'var(--md-outline)',
    text: 'var(--md-on-surface)',
    muted: 'var(--md-on-surface-variant)',
  };

  // SVG plot geometry
  const W = 380;
  const H = 200;
  const padL = 42;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const toX = (pct: number) => padL + (pct / 100) * plotW;
  const toY = (pct: number) => padT + plotH - (pct / 100) * plotH;

  const buildPath = (fn: (pct: number) => number) => {
    const pts: string[] = [];
    for (let x = 0; x <= 100; x += 2) {
      const y = Math.max(0, Math.min(100, fn(x) * 100));
      pts.push(`${x === 0 ? 'M' : 'L'} ${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const eqPctPath = buildPath((x) => computeValveCurve('globe', x));
  const linearPath = buildPath((x) => x / 100);
  const quickOpenPath = buildPath((x) => computeValveCurve('gate', x));
  const activeCustomPath =
    params.valveType === 'ball' || params.valveType === 'butterfly'
      ? buildPath((x) => computeValveCurve(params.valveType, x))
      : null;

  const opX = toX(params.openingPct);
  const opY = toY(telemetry.cvPct);

  const isBinding = telemetry.status === 'Stem Binding Risk';
  const isLeaking = telemetry.status === 'Fugitive Leak';

  // Max scale for ring stress bars
  const maxRingStress = Math.max(
    telemetry.requiredStressMpa * 1.6,
    telemetry.ringStressesMpa[0] * 1.1,
    12,
  );
  const reqPct = Math.min(
    100,
    (telemetry.requiredStressMpa / maxRingStress) * 100,
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* 1. Inherent Valve Flow Characteristic Curve */}
      <div className="glass-panel rounded-[28px] p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              {pick(
                'Inherent Flow Characteristic',
                'Karakteristik Aliran Inheren',
                '固有流量特性曲線',
              )}
            </h4>
            <p className="text-[11px] text-[var(--md-on-surface-variant)]">
              {pick(
                '% Flow (Cv / Cv,max) vs. % Stem Opening',
                '% Aliran (Cv / Cv,max) vs. % Bukaan Batang',
                '流量比 (Cv / Cv,max) vs. バルブ開度 (%)',
              )}{' '}
              —{' '}
              <span className="font-bold text-[var(--md-primary)]">
                {VALVE_TYPE_INFO[params.valveType].characteristic}
              </span>
            </p>
          </div>
          <span className="rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-[var(--md-on-primary-container)]">
            {telemetry.cvPct.toFixed(0)}% Cv
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full select-none rounded-[20px] border border-[var(--md-outline-variant)]/50"
          role="img"
          aria-label="Inherent valve flow characteristic curve comparing equal-percentage, linear, and quick-opening"
        >
          <rect x="0" y="0" width={W} height={H} rx="14" fill={palette.bg} />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={toY(v)}
                x2={W - padR}
                y2={toY(v)}
                stroke={palette.grid}
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <line
                x1={toX(v)}
                y1={padT}
                x2={toX(v)}
                y2={H - padB}
                stroke={palette.grid}
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <text
                x={padL - 6}
                y={toY(v) + 3.5}
                textAnchor="end"
                fontSize="9.5"
                fill={palette.muted}
                fontFamily="var(--font-mono)"
              >
                {v}%
              </text>
              <text
                x={toX(v)}
                y={H - padB + 13}
                textAnchor="middle"
                fontSize="9.5"
                fill={palette.muted}
                fontFamily="var(--font-mono)"
              >
                {v}%
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padL}
            y1={padT}
            x2={padL}
            y2={H - padB}
            stroke={palette.axis}
            strokeWidth="1.5"
          />
          <line
            x1={padL}
            y1={H - padB}
            x2={W - padR}
            y2={H - padB}
            stroke={palette.axis}
            strokeWidth="1.5"
          />

          {/* Reference Curves */}
          <path
            d={quickOpenPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={params.valveType === 'gate' ? 2.6 : 1.5}
            strokeDasharray={params.valveType === 'gate' ? undefined : '4 3'}
            opacity={params.valveType === 'gate' ? 1 : 0.7}
          />
          <path
            d={linearPath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.75"
          />
          <path
            d={eqPctPath}
            fill="none"
            stroke="#10b981"
            strokeWidth={params.valveType === 'globe' ? 2.6 : 1.5}
            opacity={params.valveType === 'globe' ? 1 : 0.7}
          />

          {activeCustomPath && (
            <path
              d={activeCustomPath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.6"
            />
          )}

          {/* Crosshairs to live operating point */}
          <line
            x1={opX}
            y1={H - padB}
            x2={opX}
            y2={opY}
            stroke={palette.axis}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={padL}
            y1={opY}
            x2={opX}
            y2={opY}
            stroke={palette.axis}
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Live Operating Point */}
          <circle
            cx={opX}
            cy={opY}
            r="5.5"
            fill="var(--md-primary)"
            stroke={isDark ? '#0f172a' : '#ffffff'}
            strokeWidth="2"
          />

          {/* Axis Labels */}
          <text
            x={padL + plotW / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="600"
            fill={palette.muted}
            fontFamily="var(--font-sans)"
          >
            {pick('Valve Opening (%)', 'Bukaan Katup (%)', 'バルブ開度 (%)')}
          </text>
        </svg>

        {/* Legend */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[10.5px] text-[var(--md-on-surface-variant)]">
          <span className="inline-flex items-center gap-1">
            <span className="h-0.5 w-3 bg-emerald-500" />
            {pick('Equal-% (Globe)', 'Equal-% (Globe)', 'イコール% (グローブ)')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-0.5 w-3 border-t-2 border-dashed border-sky-500" />
            {pick('Linear', 'Linear', 'リニア')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-0.5 w-3 bg-amber-500" />
            {pick('Quick-Open (Gate)', 'Quick-Open (Gate)', 'クイックオープン (ゲート)')}
          </span>
          {activeCustomPath && (
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--md-on-surface)]">
              <span className="h-0.5 w-3 bg-violet-500" />
              {pick('Active', 'Aktif', '選択中')} ({params.valveType})
            </span>
          )}
        </div>
      </div>

      {/* 2. Packing Ring-by-Ring Axial Stress Gradient */}
      <div className="glass-panel flex flex-col justify-between rounded-[28px] p-4">
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                {pick(
                  'Packing Ring Stress Gradient',
                  'Gradien Tegangan Cincin Packing',
                  'パッキンリング軸応力勾配',
                )}
              </h4>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick(
                  'Wall friction attenuates gland load down the stuffing box',
                  'Gesekan dinding melemahkan beban gland ke bawah stuffing box',
                  'ボックス壁摩擦によりグランド荷重が下段へ減衰します',
                )}
              </p>
            </div>
            <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-[var(--md-on-secondary-container)]">
              {pick('Req:', 'Min:', '必要:')}{' '}
              {telemetry.requiredStressMpa.toFixed(1)} MPa
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {telemetry.ringStressesMpa.map((stress, idx) => {
              const barPct = Math.min(100, (stress / maxRingStress) * 100);
              const barColor = isBinding
                ? 'bg-rose-500'
                : isLeaking && stress < telemetry.requiredStressMpa
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[var(--md-on-surface)]">
                      {pick('Ring', 'Cincin', 'リング')} #{idx + 1}{' '}
                      <span className="text-[var(--md-on-surface-variant)]">
                        (
                        {idx === 0
                          ? pick('Top / Gland', 'Atas / Gland', '最上段 / グランド側')
                          : idx === 3
                            ? pick('Bottom / Box', 'Bawah / Box', '最下段 / ボックス底')
                            : pick('Mid', 'Tengah', '中間')}{' '}
                        • ~{RING_SHARES[idx]}%)
                      </span>
                    </span>
                    <span className="font-mono font-bold tabular-nums text-[var(--md-on-surface)]">
                      {stress.toFixed(1)} MPa
                    </span>
                  </div>
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${barColor}`}
                      style={{ width: `${barPct}%` }}
                    />
                    {/* Required sealing stress marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[var(--md-on-surface)]/80"
                      style={{ left: `${reqPct}%` }}
                      title={`${pick('Required sealing stress', 'Tegangan penyegelan minimum', '必要シール面圧')}: ${telemetry.requiredStressMpa.toFixed(1)} MPa`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 rounded-[20px] border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-3.5 py-2.5 text-[11px] leading-relaxed text-[var(--md-on-surface-variant)]">
          <strong className="text-[var(--md-on-surface)]">
            {pick('Field Tip:', 'Tips Lapangan:', '現場のポイント:')}
          </strong>{' '}
          {pick(
            'Ring #1 absorbs ~42% of gland force while Ring #4 sees only ~12%. Tighten gland nuts 1/4-turn evenly on alternating sides—cocking the follower starves the lower rings and scores the stem.',
            'Cincin #1 menyerap ~42% gaya gland sedangkan Cincin #4 hanya ~12%. Kencangkan mur gland 1/4 putaran secara merata bergantian—kemiringan follower membuat cincin bawah kekurangan tekanan dan menggores batang.',
            '最上段リング#1はグランド荷重の約42%を受け持ち、最下段#4は約12%しか受けません。ナットは左右交互に1/4回転ずつ均等に締め、片傾きによる漏洩やステム傷を防止してください。',
          )}
        </p>
      </div>
    </div>
  );
}
