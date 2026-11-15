import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cog,
  Flame,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  BEARING_CATALOG,
  HOUSING_FIT_OPTIONS,
  SHAFT_FIT_OPTIONS,
  calculateBearingMetrics,
  computeConditionMonitoring,
  computeInductionHeaterPlan,
  type BearingHealthState,
  type BearingId,
  type HousingFitCode,
  type ShaftFitCode,
} from './bearingData';
import { BearingVisual } from './BearingVisual';
import { ConditionMonitoringPanel } from './ConditionMonitoringPanel';

function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours > 9_999_999) return '> 10M h';
  if (hours >= 1000) return `${Math.round(hours).toLocaleString()} h`;
  return `${hours.toFixed(1)} h`;
}

function formatRevs(revs: number): string {
  if (!Number.isFinite(revs) || revs > 999_999) return '> 1M Mrev';
  if (revs >= 100) return `${revs.toFixed(1)} Mrev`;
  return `${revs.toFixed(2)} Mrev`;
}

function formatClearanceRange(minUm: number, maxUm: number): string {
  const fmt = (v: number) => (v > 0 ? `+${v}` : `${v}`);
  return `${fmt(minUm)} to ${fmt(maxUm)} µm`;
}

export function BearingSimulator() {
  const { pick } = useLanguage();
  const [bearingId, setBearingId] = useState<BearingId>('6308');
  const [Fr, setFr] = useState<number>(6.0);
  const [Fa, setFa] = useState<number>(1.5);
  const [rpm, setRpm] = useState<number>(1500);
  const [aIso, setAIso] = useState<number>(1.0);
  const [shaftFit, setShaftFit] = useState<ShaftFitCode>('k5');
  const [housingFit, setHousingFit] = useState<HousingFitCode>('H7');
  const [healthState, setHealthState] = useState<BearingHealthState>('healthy');
  const [heaterTempC, setHeaterTempC] = useState<number>(110);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [rotationRad, setRotationRad] = useState<number>(0);

  const spec = useMemo(
    () =>
      BEARING_CATALOG.find((b) => b.id === bearingId) ?? BEARING_CATALOG[1],
    [bearingId]
  );

  const metrics = useMemo(
    () =>
      calculateBearingMetrics({
        spec,
        Fr,
        Fa,
        rpm,
        aIso,
        shaftFit,
        housingFit,
      }),
    [spec, Fr, Fa, rpm, aIso, shaftFit, housingFit]
  );

  const conditionData = useMemo(
    () =>
      computeConditionMonitoring({
        spec,
        rpm,
        P: metrics.P,
        aIso,
        clearanceReductionUm: metrics.fit.clearanceReductionUm,
        healthState,
      }),
    [
      spec,
      rpm,
      metrics.P,
      aIso,
      metrics.fit.clearanceReductionUm,
      healthState,
    ]
  );

  const heaterPlan = useMemo(
    () =>
      computeInductionHeaterPlan({
        spec,
        fit: metrics.fit,
        targetTempC: heaterTempC,
      }),
    [spec, metrics.fit, heaterTempC]
  );

  // Smooth scaled-RPM animation loop
  const rpmRef = useRef(rpm);
  useEffect(() => {
    rpmRef.current = rpm;
  }, [rpm]);

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Scale visual speed smoothly so 100..6000 RPM is readable without strobing; accumulate continuously (no modulo jump)
      const visualRadPerSec = 0.7 + (rpmRef.current / 1500) * 2.4;
      setRotationRad((prev) => prev + visualRadPerSec * dt);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const handleReset = () => {
    setBearingId('6308');
    setFr(6.0);
    setFa(1.5);
    setRpm(1500);
    setAIso(1.0);
    setShaftFit('k5');
    setHousingFit('H7');
    setHealthState('healthy');
    setIsPlaying(true);
  };

  const applyPreset = (preset: 'motor' | 'overload' | 'nu-fault' | 'tight-fit') => {
    if (preset === 'motor') {
      setBearingId('6308');
      setFr(5.0);
      setFa(0.8);
      setRpm(1480);
      setAIso(1.2);
      setShaftFit('k5');
      setHousingFit('H7');
    } else if (preset === 'overload') {
      setBearingId('6206');
      setFr(11.5);
      setFa(4.5);
      setRpm(2400);
      setAIso(0.7);
      setShaftFit('m5');
      setHousingFit('H7');
    } else if (preset === 'nu-fault') {
      setBearingId('nu208');
      setFr(9.0);
      setFa(2.5);
      setRpm(1800);
      setAIso(1.0);
      setShaftFit('k5');
      setHousingFit('H7');
    } else if (preset === 'tight-fit') {
      setBearingId('30208');
      setFr(10.0);
      setFa(3.5);
      setRpm(3200);
      setAIso(0.9);
      setShaftFit('m5');
      setHousingFit('N7');
    }
  };

  const aIsoLabel =
    aIso < 0.6
      ? pick(
          'Contaminated / Thin Film',
          'Terkontaminasi / Film Tipis',
          '異物混入 / 油膜不足'
        )
      : aIso <= 1.2
        ? pick('Standard Clean Oil', 'Oli Bersih Standar', '標準清浄油')
        : pick(
            'Filtered Synthetic EHL',
            'Sintetis EHL Tersaring',
            '高精度濾過合成油 EHL'
          );

  return (
    <div className="space-y-4">
      {/* Top Action & Preset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl p-3.5 ">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Cog className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
          </span>
          <button
            type="button"
            onClick={() => applyPreset('motor')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10"
          >
            {pick('Standard Motor (6308)', 'Motor Standar (6308)', '標準モータ (6308)')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('overload')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10"
          >
            {pick('Overloaded Ball (6206)', 'Beban Berlebih (6206)', '過負荷玉軸受 (6206)')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('nu-fault')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10"
          >
            {pick('NU Axial Fault', 'Gangguan Aksial NU', 'NU アキシアル異常')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tight-fit')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10"
          >
            {pick('Heavy Fit Preload', 'Preload Suaian Sesak', '過大しめしろ予圧')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" /> {pick('Pause', 'Jeda', '一時停止')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> {pick('Rotate', 'Putar', '回転')}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls (Left) + Visual & Diagnostics (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-4 glass-panel rounded-2xl p-4 ">
          <div>
            <label
              htmlFor="bearing-select"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              {pick('Bearing Type & Series', 'Tipe & Seri Bearing', '軸受形式・シリーズ')}
            </label>
            <select
              id="bearing-select"
              value={bearingId}
              onChange={(e) => setBearingId(e.target.value as BearingId)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {BEARING_CATALOG.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — C={b.C} kN
                </option>
              ))}
            </select>
            <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-50 p-2 text-center text-[11px] dark:bg-slate-800/60">
              <div>
                <div className="text-slate-400">Dynamic C</div>
                <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {spec.C} kN
                </div>
              </div>
              <div>
                <div className="text-slate-400">Static C0</div>
                <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {spec.C0} kN
                </div>
              </div>
              <div>
                <div className="text-slate-400">Exp. p</div>
                <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {spec.p === 3 ? '3' : '10/3'}
                </div>
              </div>
            </div>
          </div>

          {/* Operating Loads & Speed */}
          <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pick('Radial Load (Fr)', 'Beban Radial (Fr)', 'ラジアル荷重 (Fr)')}
                </span>
                <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">
                  {Fr.toFixed(1)} kN
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={35}
                step={0.5}
                value={Fr}
                onChange={(e) => setFr(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pick('Axial Load (Fa)', 'Beban Aksial (Fa)', 'アキシアル荷重 (Fa)')}
                </span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                  {Fa.toFixed(1)} kN
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.2}
                value={Fa}
                onChange={(e) => setFa(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pick('Shaft Speed (N)', 'Kecepatan Poros (N)', '軸回転速度 (N)')}
                </span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {rpm.toLocaleString()} RPM
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={6000}
                step={50}
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {pick('Lubrication / Temp (a_ISO)', 'Pelumasan / Suhu (a_ISO)', '潤滑・温度係数 (a_ISO)')}
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {aIso.toFixed(2)} ({aIsoLabel})
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.5}
                step={0.05}
                value={aIso}
                onChange={(e) => setAIso(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* ISO Shaft & Housing Fits */}
          <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {pick('ISO 286 Shaft & Housing Fits', 'Suaian Poros & Rumah ISO 286', 'ISO 286 軸・ハウジングはめあい')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="shaft-fit"
                  className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300"
                >
                  {pick(`Shaft Fit (d=${spec.d} mm)`, `Suaian Poros (d=${spec.d} mm)`, `軸はめあい (d=${spec.d} mm)`)}
                </label>
                <select
                  id="shaft-fit"
                  value={shaftFit}
                  onChange={(e) => setShaftFit(e.target.value as ShaftFitCode)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {SHAFT_FIT_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="housing-fit"
                  className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300"
                >
                  Housing Fit (D={spec.D} mm)
                </label>
                <select
                  id="housing-fit"
                  value={housingFit}
                  onChange={(e) =>
                    setHousingFit(e.target.value as HousingFitCode)
                  }
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {HOUSING_FIT_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Shaft ({shaftFit}):
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {formatClearanceRange(
                    metrics.fit.shaft.minClearanceUm,
                    metrics.fit.shaft.maxClearanceUm
                  )}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Housing ({housingFit}):
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
                  {formatClearanceRange(
                    metrics.fit.housing.minClearanceUm,
                    metrics.fit.housing.maxClearanceUm
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual + KPI Readouts + Condition Warnings */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-center glass-panel rounded-2xl p-4 ">
            <BearingVisual
              spec={spec}
              metrics={metrics}
              Fr={Fr}
              Fa={Fa}
              rpm={rpm}
              rotationRad={rotationRad}
              healthState={healthState}
            />
          </div>

          {/* Live Readouts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick('Equiv. Load (P)', 'Beban Ekuivalen (P)', '動等価荷重 (P)')}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                {metrics.P.toFixed(2)} kN
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                X={metrics.X.toFixed(2)}, Y={metrics.Y.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick('Basic Life (L10)', 'Umur Dasar (L10)', '基本定格寿命 (L10)')}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-violet-600 dark:text-violet-400">
                {formatRevs(metrics.L10)}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                (C/P)^{spec.p === 3 ? '3' : '10/3'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick('Operating Hours (L10h)', 'Jam Operasi (L10h)', '定格寿命時間 (L10h)')}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                {formatHours(metrics.L10h)}
              </div>
              <div className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                L10ha: {formatHours(metrics.L10ha)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick('Static Safety (s0)', 'Keamanan Statis (s0)', '静安全係数 (s0)')}
              </div>
              <div
                className={`mt-1 font-mono text-lg font-bold ${
                  metrics.s0 < 1.0
                    ? 'text-rose-600 dark:text-rose-400'
                    : metrics.s0 < 1.5
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {metrics.s0.toFixed(2)}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                C0 / P0 ({spec.C0} / {metrics.P0.toFixed(1)})
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Fit Type
              </div>
              <div className="mt-1 text-xs font-bold leading-snug text-slate-900 dark:text-white">
                {metrics.fit.shaft.classification} (Shaft)
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {metrics.fit.housing.classification} (Housing)
              </div>
            </div>
          </div>

          {/* Live Condition Monitoring & Vibration FFT Spectrum */}
          <ConditionMonitoringPanel
            data={conditionData}
            healthState={healthState}
            onHealthStateChange={setHealthState}
          />

          {/* Bearing Mounting & Induction Heater Advisor */}
          <div className="glass-panel rounded-2xl p-4  space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {pick(
                    'Bearing Mounting & Induction Heater Advisor',
                    'Penasihat Pemasangan & Pemanas Induksi Bearing',
                    '軸受組付・誘導加熱ヒーターアドバイザー'
                  )}
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  heaterPlan.overMaxTemp
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                    : heaterPlan.needsHeater
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      : 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                }`}
              >
                {heaterPlan.overMaxTemp
                  ? pick(
                      'Exceeds Max Safe 125 °C!',
                      'Melebihi Batas Aman 125 °C!',
                      '最高許容温度 125 °C 超過！'
                    )
                  : heaterPlan.needsHeater
                    ? pick(
                        'Recommended Target: 110 °C',
                        'Target Rekomendasi: 110 °C',
                        '推奨加熱目標: 110 °C'
                      )
                    : pick(
                        'Clearance Fit — Cold Mount OK',
                        'Suaian Longgar — Pasang Dingin OK',
                        'すきまばめ — 常温組付可'
                      )}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {pick('Induction Heater Temp', 'Suhu Pemanas Induksi', '誘導加熱温度')}
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      heaterPlan.overMaxTemp
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {heaterTempC} °C ({pick('Max', 'Maks', '上限')} 125 °C)
                  </span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={135}
                  step={5}
                  value={heaterTempC}
                  onChange={(e) => setHeaterTempC(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="md:col-span-7 grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
                  <div className="text-slate-400">
                    {pick('Diametral Expansion', 'Ekspansi Diameter', '内径膨張量')}
                  </div>
                  <div className="font-mono font-semibold text-violet-600 dark:text-violet-400">
                    +{heaterPlan.expansionUm.toFixed(1)} µm
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
                  <div className="text-slate-400">
                    {pick(`Max Interference (${shaftFit})`, `Interferensi Maks (${shaftFit})`, `最大しめしろ (${shaftFit})`)}
                  </div>
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {heaterPlan.maxInterferenceUm.toFixed(1)} µm
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/60">
                  <div className="text-slate-400">
                    {pick('Slip-On Clearance', 'Celah Masuk Poros', '挿入すきま')}
                  </div>
                  <div
                    className={`font-mono font-semibold ${
                      heaterPlan.slipClearanceUm > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {heaterPlan.slipClearanceUm >= 0 ? '+' : ''}
                    {heaterPlan.slipClearanceUm.toFixed(1)} µm
                  </div>
                </div>
              </div>
            </div>

            {heaterPlan.overMaxTemp && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                <strong>Max Safe Temperature Exceeded ({heaterTempC} °C &gt; 125 °C):</strong>{' '}
                Heating above 125 °C risks tempering bearing steel, permanent dimensional growth, and damaging seals or polyamide cages. Keep induction heater at 110 °C.
              </div>
            )}
          </div>

          {/* Condition & Fault Warnings */}
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {pick(
                  'Bearing Condition & Fit Diagnostics',
                  'Diagnostik Kondisi & Suaian Bearing',
                  '軸受状態・はめあい診断'
                )}
              </span>
              {metrics.severity === 'healthy' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {pick('Healthy Operation', 'Operasi Sehat', '正常運転')}
                </span>
              )}
              {metrics.severity === 'warning' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" /> {pick('Advisory Warning', 'Peringatan Awal', '注意警報')}
                </span>
              )}
              {metrics.severity === 'critical' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                  <ShieldAlert className="h-3.5 w-3.5" /> {pick('Critical Fault', 'Gangguan Kritis', '重大異常')}
                </span>
              )}
            </div>

            {metrics.warnings.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                All checks nominal: {spec.designation} operates within static
                safety ({metrics.s0.toFixed(2)}), fatigue life (
                {formatHours(metrics.L10ha)}), speed limit ({spec.limitingRpm}{' '}
                RPM), and ISO fit clearance bounds.
              </p>
            ) : (
              <div className="space-y-2">
                {metrics.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border px-3 py-2 text-xs ${
                      w.severity === 'critical'
                        ? 'border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                        : 'border-amber-200 bg-amber-50/70 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                    }`}
                  >
                    <div className="font-semibold">{w.title}</div>
                    <div className="mt-0.5 opacity-90">{w.detail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
