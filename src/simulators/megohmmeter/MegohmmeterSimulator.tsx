import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  Play,
  RotateCcw,
  ShieldAlert,
  Square,
  Thermometer,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeMegohmmeterMetrics,
  formatResistance,
  generateResistanceCurve,
  LEAD_CONNECTIONS,
  MOTOR_PRESETS,
  TEST_VOLTAGES,
  type LeadConnection,
  type MotorConditionId,
  type TestPhase,
  type TestVoltage,
} from './megohmmeterPhysics';
import { MegohmmeterSvg } from './MegohmmeterSvg';

export function MegohmmeterSimulator() {
  const { pick } = useLanguage();

  const [voltage, setVoltage] = useState<TestVoltage>(500);
  const [lead, setLead] = useState<LeadConnection>('U-GND');
  const [presetId, setPresetId] = useState<MotorConditionId>('clean-dry');
  const [tempC, setTempC] = useState<number>(25);
  const [timeAccel, setTimeAccel] = useState<1 | 10 | 60>(60);

  const [phase, setPhase] = useState<TestPhase>('testing');
  const [elapsedSec, setElapsedSec] = useState<number>(60);

  const effectivePhase: TestPhase =
    phase === 'charging' && elapsedSec >= 2 ? 'testing' : phase;

  const dischargeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dischargeTimerRef.current) clearTimeout(dischargeTimerRef.current);
    };
  }, []);

  // Time-accelerated polarization timer
  useEffect(() => {
    if (effectivePhase !== 'charging' && effectivePhase !== 'testing') return;

    const intervalMs = 100;
    const id = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + (intervalMs / 1000) * timeAccel;
        if (next >= 600) {
          return 600;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [effectivePhase, timeAccel]);

  const handleToggleTest = useCallback(() => {
    if (phase === 'charging' || phase === 'testing') {
      setPhase('discharging');
      if (dischargeTimerRef.current) clearTimeout(dischargeTimerRef.current);
      dischargeTimerRef.current = setTimeout(() => {
        setPhase('idle');
      }, 900);
    } else {
      if (dischargeTimerRef.current) clearTimeout(dischargeTimerRef.current);
      setElapsedSec(0.5);
      setPhase('charging');
    }
  }, [phase]);

  const handleReset = useCallback(() => {
    if (dischargeTimerRef.current) clearTimeout(dischargeTimerRef.current);
    setVoltage(500);
    setLead('U-GND');
    setPresetId('clean-dry');
    setTempC(25);
    setTimeAccel(60);
    setElapsedSec(60);
    setPhase('testing');
  }, []);

  const handleSelectPreset = useCallback((id: MotorConditionId) => {
    setPresetId(id);
    setElapsedSec(60);
    setPhase('testing');
  }, []);

  const metrics = useMemo(
    () => computeMegohmmeterMetrics(presetId, lead, voltage, tempC, elapsedSec),
    [presetId, lead, voltage, tempC, elapsedSec]
  );

  const curvePoints = useMemo(
    () => generateResistanceCurve(presetId, lead, voltage, tempC),
    [presetId, lead, voltage, tempC]
  );

  const rLiveFmt = formatResistance(metrics.rLive);
  const rc40Fmt = formatResistance(metrics.rc40);
  const r60Fmt = formatResistance(metrics.r60s);

  // Build SVG path for R(t) polarization curve
  const curveChart = useMemo(() => {
    const w = 440;
    const h = 150;
    const padL = 44;
    const padR = 14;
    const padT = 14;
    const padB = 24;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const maxR = Math.max(...curvePoints.map((p) => p.rMOhm), 10);
    const minR = 0;

    const toX = (t: number) => padL + (t / 600) * plotW;
    const toY = (r: number) =>
      padT + plotH - ((r - minR) / Math.max(1, maxR - minR)) * plotH;

    const d = curvePoints
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${toX(pt.tSec).toFixed(1)} ${toY(pt.rMOhm).toFixed(1)}`)
      .join(' ');

    const cursorX = toX(Math.min(600, elapsedSec));
    const cursorY = toY(metrics.rLive);

    return { w, h, padL, padR, padT, padB, plotW, plotH, maxR, toX, toY, d, cursorX, cursorY };
  }, [curvePoints, elapsedSec, metrics.rLive]);

  const verdictBadge =
    metrics.verdict === 'danger'
      ? {
          bg: 'border-rose-300/70 bg-rose-50/85 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/35 dark:text-rose-200',
          icon: <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />,
          label: pick(
            'FAIL / DANGER — Do Not Energize',
            'GAGAL / BAHAYA — Jangan Diberi Tegangan',
            '不合格 / 危険 — 通電厳禁'
          ),
        }
      : metrics.verdict === 'questionable'
      ? {
          bg: 'border-amber-300/70 bg-amber-50/85 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/35 dark:text-amber-200',
          icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
          label: pick(
            'QUESTIONABLE — Dry / Clean & Retest',
            'MERAGUKAN — Keringkan / Bersihkan & Uji Ulang',
            '要注意 — 乾燥・清掃後に再測定'
          ),
        }
      : {
          bg: 'border-emerald-300/70 bg-emerald-50/85 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/35 dark:text-emerald-200',
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
          label: pick(
            'PASS — Healthy Insulation (IEEE 43)',
            'LULUS — Isolasi Sehat (IEEE 43)',
            '合格 — 絶縁状態良好 (IEEE 43)'
          ),
        };

  return (
    <div className="space-y-4">
      {/* Top Status & Quick Action Bar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--md-on-surface)]">
              {pick(
                'DC Insulation Resistance & Polarization Index (IEEE 43)',
                'Tahanan Isolasi DC & Indeks Polarisasi (IEEE 43)',
                'DC絶縁抵抗・分極指数 (PI) 診断 (IEEE 43)'
              )}
            </h2>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                'Select test voltage, winding leads, and temperature to diagnose motor insulation.',
                'Pilih tegangan uji, kabel fasa, dan suhu belitan untuk mendiagnosis isolasi motor.',
                '試験電圧・測定端子・巻線温度を設定してモータ絶縁状態を診断します。'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleTest}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm transition ${
              phase === 'charging' || phase === 'testing'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {phase === 'charging' || phase === 'testing' ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                {pick('Stop & Discharge', 'Henti & Buang Muatan', '停止・放電')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                {pick('Start HV Test', 'Mulai Uji HV', '高圧試験開始')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* Left: Interactive Instrument SVG + Polarization Curve */}
        <div className="space-y-4 lg:col-span-7">
          <div className="glass-panel overflow-hidden rounded-[28px] p-3.5">
            <MegohmmeterSvg
              voltage={voltage}
              lead={lead}
              presetId={presetId}
              phase={effectivePhase}
              elapsedSec={elapsedSec}
              metrics={metrics}
              onSelectVoltage={setVoltage}
              onSelectLead={setLead}
              onToggleTest={handleToggleTest}
            />
          </div>

          {/* Time-Accelerated Polarization Curve R(t) */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--md-primary)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick(
                    'Dielectric Absorption Curve R(t) (0 – 600 s)',
                    'Kurva Absorpsi Dielektrik R(t) (0 – 600 dtk)',
                    '誘電吸収曲線 R(t) (0 – 600秒)'
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                <Clock className="ml-1.5 h-3.5 w-3.5 text-[var(--md-on-surface-variant)]" />
                {([1, 10, 60] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setTimeAccel(spd)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] transition ${
                      timeAccel === spd
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            <svg
              viewBox={`0 0 ${curveChart.w} ${curveChart.h}`}
              className="w-full h-auto"
              role="img"
              aria-label="Polarization resistance curve"
            >
              {/* Grid lines */}
              {[0, 0.5, 1].map((frac) => {
                const y = curveChart.padT + curveChart.plotH * (1 - frac);
                const val = curveChart.maxR * frac;
                return (
                  <g key={frac}>
                    <line
                      x1={curveChart.padL}
                      y1={y}
                      x2={curveChart.w - curveChart.padR}
                      y2={y}
                      stroke="var(--md-outline-variant)"
                      strokeOpacity="0.45"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={curveChart.padL - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      fill="var(--md-on-surface-variant)"
                    >
                      {val >= 1000 ? `${(val / 1000).toFixed(1)}G` : `${val.toFixed(0)}M`}
                    </text>
                  </g>
                );
              })}

              {/* 30s, 60s, 600s reference lines */}
              {[
                { t: 30, lbl: '30s' },
                { t: 60, lbl: '1m' },
                { t: 600, lbl: '10m' },
              ].map((m) => {
                const x = curveChart.toX(m.t);
                return (
                  <g key={m.lbl}>
                    <line
                      x1={x}
                      y1={curveChart.padT}
                      x2={x}
                      y2={curveChart.padT + curveChart.plotH}
                      stroke="var(--md-outline)"
                      strokeOpacity="0.45"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={m.t === 600 ? x - 4 : x}
                      y={curveChart.h - 6}
                      textAnchor={m.t === 600 ? 'end' : 'middle'}
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      fill="var(--md-on-surface-variant)"
                    >
                      {m.lbl}
                    </text>
                  </g>
                );
              })}

              {/* Curve path */}
              <path
                d={curveChart.d}
                fill="none"
                stroke="var(--md-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Live Cursor */}
              <circle
                cx={curveChart.cursorX}
                cy={curveChart.cursorY}
                r="4.5"
                fill="var(--md-primary)"
                stroke="var(--md-surface-container-lowest)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Right: Controls & Diagnostic Readouts */}
        <div className="space-y-4 lg:col-span-5">
          {/* Verdict Banner */}
          <div className={`flex items-center gap-2.5 rounded-[24px] border p-3.5 ${verdictBadge.bg}`}>
            {verdictBadge.icon}
            <span className="text-xs font-bold">{verdictBadge.label}</span>
          </div>

          {/* Primary Diagnostic KPI Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Live R(t)', 'R(t) Saat Ini', '現在抵抗 R(t)')}
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {phase === 'idle' ? '---' : `${rLiveFmt.value} ${rLiveFmt.unit}`}
              </div>
              <div className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                t = {Math.floor(elapsedSec)} s ({lead})
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Corrected R_c40 (40°C)', 'Koreksi R_c40 (40°C)', '40°C補正値 R_c40')}
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-[var(--md-primary)]">
                {rc40Fmt.value} {rc40Fmt.unit}
              </div>
              <div className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                R₁ₘ={r60Fmt.value}{r60Fmt.unit} × K={metrics.kt40.toFixed(2)}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                DAR (R₆₀ₛ / R₃₀ₛ)
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.dar.toFixed(2)}
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                {metrics.dar >= 1.6
                  ? pick('Good (>1.6)', 'Baik (>1,6)', '良好 (>1.6)')
                  : metrics.dar >= 1.25
                  ? pick('Acceptable (≥1.25)', 'Cukup (≥1,25)', '許容 (≥1.25)')
                  : pick('Poor (<1.25)', 'Buruk (<1,25)', '不良 (<1.25)')}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                PI (R₁₀ₘ / R₁ₘ)
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.pi.toFixed(2)}
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                {metrics.pi >= 2.0
                  ? pick('IEEE 43 Good (≥2.0)', 'IEEE 43 Baik (≥2,0)', 'IEEE 43 良好 (≥2.0)')
                  : metrics.pi >= 1.0
                  ? pick('Marginal (1.0–2.0)', 'Marjinal (1,0–2,0)', '境界域 (1.0–2.0)')
                  : pick('Danger (<1.0)', 'Bahaya (<1,0)', '危険 (<1.0)')}
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5">
            {/* Test Voltage */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                <Zap className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('DC Test Voltage', 'Tegangan Uji DC', 'DC試験電圧')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {TEST_VOLTAGES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoltage(v)}
                    className={`rounded-full border py-1.5 text-xs font-bold transition ${
                      voltage === v
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {v} V
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Connection Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--md-on-surface)]">
                {pick('Lead Connection', 'Koneksi Kabel Uji', '測定端子接続')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LEAD_CONNECTIONS.map((lc) => (
                  <button
                    key={lc.id}
                    type="button"
                    onClick={() => setLead(lc.id)}
                    className={`rounded-[20px] border px-3 py-2 text-left text-xs font-bold transition ${
                      lead === lc.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {lc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Winding Temperature */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Winding Temperature', 'Suhu Belitan', '巻線温度')}
                </span>
                <span className="font-mono text-[var(--md-primary)]">
                  {tempC} °C (K_T40 = {metrics.kt40.toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={1}
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Motor Condition Presets */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                <Flame className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Motor Winding Condition', 'Kondisi Belitan Motor', 'モータ巻線状態')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(MOTOR_PRESETS) as MotorConditionId[]).map((id) => {
                  const p = MOTOR_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectPreset(id)}
                      className={`rounded-[20px] border px-3.5 py-2.5 text-left transition ${
                        active
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {pick(p.labelEn, p.labelId, p.labelJa)}
                      </div>
                      <div className="text-[11px] opacity-80">
                        {pick(p.descEn, p.descId, p.descJa)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
