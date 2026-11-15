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
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300',
          icon: <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />,
          label: pick(
            'FAIL / DANGER — Do Not Energize',
            'GAGAL / BAHAYA — Jangan Diberi Tegangan',
            '不合格 / 危険 — 通電厳禁'
          ),
        }
      : metrics.verdict === 'questionable'
      ? {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300',
          icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
          label: pick(
            'QUESTIONABLE — Dry / Clean & Retest',
            'MERAGUKAN — Keringkan / Bersihkan & Uji Ulang',
            '要注意 — 乾燥・清掃後に再測定'
          ),
        }
      : {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300',
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
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl p-3.5 ">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#001F6B] to-[#002D9C] text-white shadow-sm">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {pick(
                'DC Insulation Resistance & Polarization Index (IEEE 43)',
                'Tahanan Isolasi DC & Indeks Polarisasi (IEEE 43)',
                'DC絶縁抵抗・分極指数 (PI) 診断 (IEEE 43)'
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition ${
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
          <div className="overflow-hidden glass-panel rounded-2xl p-3 ">
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
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#002D9C] dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {pick(
                    'Dielectric Absorption Curve R(t) (0 – 600 s)',
                    'Kurva Absorpsi Dielektrik R(t) (0 – 600 dtk)',
                    '誘電吸収曲線 R(t) (0 – 600秒)'
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                <Clock className="ml-1.5 h-3.5 w-3.5 text-slate-500" />
                {([1, 10, 60] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setTimeAccel(spd)}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition ${
                      timeAccel === spd
                        ? 'bg-[#001F6B] text-white dark:bg-blue-600'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
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
                      stroke={isDark ? '#1E293B' : '#E2E8F0'}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={curveChart.padL - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill={isDark ? '#94A3B8' : '#64748B'}
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
                      stroke={isDark ? '#334155' : '#CBD5E1'}
                      strokeDasharray="2 2"
                    />
                    <text
                      x={m.t === 600 ? x - 4 : x}
                      y={curveChart.h - 6}
                      textAnchor={m.t === 600 ? 'end' : 'middle'}
                      fontSize="9"
                      fontWeight="600"
                      fill={isDark ? '#94A3B8' : '#64748B'}
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
                stroke="#F43F5E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Live Cursor */}
              <circle
                cx={curveChart.cursorX}
                cy={curveChart.cursorY}
                r="4.5"
                fill="#F43F5E"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Right: Controls & Diagnostic Readouts */}
        <div className="space-y-4 lg:col-span-5">
          {/* Verdict Banner */}
          <div className={`flex items-center gap-2.5 rounded-2xl border p-3.5 ${verdictBadge.bg}`}>
            {verdictBadge.icon}
            <span className="text-xs font-bold">{verdictBadge.label}</span>
          </div>

          {/* Primary Diagnostic KPI Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-[#001F6B]/15 bg-white/85 p-3 dark:border-blue-400/20 dark:bg-slate-900/75">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {pick('Live R(t)', 'R(t) Saat Ini', '現在抵抗 R(t)')}
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                {phase === 'idle' ? '---' : `${rLiveFmt.value} ${rLiveFmt.unit}`}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                t = {Math.floor(elapsedSec)} s ({lead})
              </div>
            </div>

            <div className="rounded-xl border border-[#001F6B]/15 bg-white/85 p-3 dark:border-blue-400/20 dark:bg-slate-900/75">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {pick('Corrected R_c40 (40°C)', 'Koreksi R_c40 (40°C)', '40°C補正値 R_c40')}
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-[#002D9C] dark:text-blue-400">
                {rc40Fmt.value} {rc40Fmt.unit}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                R₁ₘ={r60Fmt.value}{r60Fmt.unit} × K={metrics.kt40.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-[#001F6B]/15 bg-white/85 p-3 dark:border-blue-400/20 dark:bg-slate-900/75">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                DAR (R₆₀ₛ / R₃₀ₛ)
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                {metrics.dar.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {metrics.dar >= 1.6
                  ? pick('Good (>1.6)', 'Baik (>1,6)', '良好 (>1.6)')
                  : metrics.dar >= 1.25
                  ? pick('Acceptable (≥1.25)', 'Cukup (≥1,25)', '許容 (≥1.25)')
                  : pick('Poor (<1.25)', 'Buruk (<1,25)', '不良 (<1.25)')}
              </div>
            </div>

            <div className="rounded-xl border border-[#001F6B]/15 bg-white/85 p-3 dark:border-blue-400/20 dark:bg-slate-900/75">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                PI (R₁₀ₘ / R₁ₘ)
              </div>
              <div className="mt-0.5 font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                {metrics.pi.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {metrics.pi >= 2.0
                  ? pick('IEEE 43 Good (≥2.0)', 'IEEE 43 Baik (≥2,0)', 'IEEE 43 良好 (≥2.0)')
                  : metrics.pi >= 1.0
                  ? pick('Marginal (1.0–2.0)', 'Marjinal (1,0–2,0)', '境界域 (1.0–2.0)')
                  : pick('Danger (<1.0)', 'Bahaya (<1,0)', '危険 (<1.0)')}
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="space-y-3.5 glass-panel rounded-2xl p-4 ">
            {/* Test Voltage */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Zap className="h-3.5 w-3.5 text-rose-500" />
                {pick('DC Test Voltage', 'Tegangan Uji DC', 'DC試験電圧')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {TEST_VOLTAGES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVoltage(v)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition ${
                      voltage === v
                        ? 'bg-[#001F6B] text-white shadow-sm dark:bg-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {v} V
                  </button>
                ))}
              </div>
            </div>

            {/* Lead Connection Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
                {pick('Lead Connection', 'Koneksi Kabel Uji', '測定端子接続')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LEAD_CONNECTIONS.map((lc) => (
                  <button
                    key={lc.id}
                    type="button"
                    onClick={() => setLead(lc.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition ${
                      lead === lc.id
                        ? 'bg-[#001F6B] text-white shadow-sm dark:bg-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Winding Temperature */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                  {pick('Winding Temperature', 'Suhu Belitan', '巻線温度')}
                </span>
                <span className="font-mono text-[#002D9C] dark:text-blue-400">
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
                className="w-full cursor-pointer"
              />
            </div>

            {/* Motor Condition Presets */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                {pick('Motor Winding Condition', 'Kondisi Belitan Motor', 'モータ巻線状態')}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(MOTOR_PRESETS) as MotorConditionId[]).map((id) => {
                  const p = MOTOR_PRESETS[id];
                  const active = presetId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectPreset(id)}
                      className={`rounded-xl border px-3 py-2 text-left transition ${
                        active
                          ? 'border-[#002D9C] bg-[#001F6B]/10 dark:border-blue-400 dark:bg-blue-500/20'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {pick(p.labelEn, p.labelId, p.labelJa)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
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
