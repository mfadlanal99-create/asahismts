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
      <div data-tour="bearing-presets" className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            <Cog className="h-4 w-4 text-[var(--md-primary)]" />
            {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
          </span>
          <button
            type="button"
            onClick={() => applyPreset('motor')}
            className="rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--md-on-surface)] transition hover:border-[var(--md-primary)]/40 hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)]"
          >
            {pick('Standard Motor (6308)', 'Motor Standar (6308)', '標準モータ (6308)')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('overload')}
            className="rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--md-on-surface)] transition hover:border-[var(--md-primary)]/40 hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)]"
          >
            {pick('Overloaded Ball (6206)', 'Beban Berlebih (6206)', '過負荷玉軸受 (6206)')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('nu-fault')}
            className="rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--md-on-surface)] transition hover:border-[var(--md-primary)]/40 hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)]"
          >
            {pick('NU Axial Fault', 'Gangguan Aksial NU', 'NU アキシアル異常')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('tight-fit')}
            className="rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--md-on-surface)] transition hover:border-[var(--md-primary)]/40 hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)]"
          >
            {pick('Heavy Fit Preload', 'Preload Suaian Sesak', '過大しめしろ予圧')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
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
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" /> {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls (Left) + Visual & Diagnostics (Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Controls Panel */}
        <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5 lg:col-span-4">
          <div data-tour="bearing-series">
            <label
              htmlFor="bearing-select"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]"
            >
              {pick('Bearing Type & Series', 'Tipe & Seri Bearing', '軸受形式・シリーズ')}
            </label>
            <select
              id="bearing-select"
              value={bearingId}
              onChange={(e) => setBearingId(e.target.value as BearingId)}
              className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2.5 text-sm font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            >
              {BEARING_CATALOG.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — C={b.C} kN
                </option>
              ))}
            </select>
            <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] p-2.5 text-center text-[11px]">
              <div>
                <div className="text-[var(--md-on-surface-variant)]">Dynamic C</div>
                <div className="font-mono font-bold text-[var(--md-on-surface)]">
                  {spec.C} kN
                </div>
              </div>
              <div>
                <div className="text-[var(--md-on-surface-variant)]">Static C0</div>
                <div className="font-mono font-bold text-[var(--md-on-surface)]">
                  {spec.C0} kN
                </div>
              </div>
              <div>
                <div className="text-[var(--md-on-surface-variant)]">Exp. p</div>
                <div className="font-mono font-bold text-[var(--md-primary)]">
                  {spec.p === 3 ? '3' : '10/3'}
                </div>
              </div>
            </div>
          </div>

          {/* Operating Loads & Speed */}
          <div data-tour="bearing-loads" className="space-y-3 border-t border-[var(--md-outline-variant)]/50 pt-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--md-on-surface)]">
                  {pick('Radial Load (Fr)', 'Beban Radial (Fr)', 'ラジアル荷重 (Fr)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--md-on-surface)]">
                  {pick('Axial Load (Fa)', 'Beban Aksial (Fa)', 'アキシアル荷重 (Fa)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--md-on-surface)]">
                  {pick('Shaft Speed (N)', 'Kecepatan Poros (N)', '軸回転速度 (N)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
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
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--md-on-surface)]">
                  {pick('Lubrication / Temp (a_ISO)', 'Pelumasan / Suhu (a_ISO)', '潤滑・温度係数 (a_ISO)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="w-full"
              />
            </div>
          </div>

          {/* ISO Shaft & Housing Fits */}
          <div data-tour="bearing-fits" className="space-y-3 border-t border-[var(--md-outline-variant)]/50 pt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick('ISO 286 Shaft & Housing Fits', 'Suaian Poros & Rumah ISO 286', 'ISO 286 軸・ハウジングはめあい')}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="shaft-fit"
                  className="mb-1 block text-[11px] font-medium text-[var(--md-on-surface-variant)]"
                >
                  {pick(`Shaft Fit (d=${spec.d} mm)`, `Suaian Poros (d=${spec.d} mm)`, `軸はめあい (d=${spec.d} mm)`)}
                </label>
                <select
                  id="shaft-fit"
                  value={shaftFit}
                  onChange={(e) => setShaftFit(e.target.value as ShaftFitCode)}
                  className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
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
                  className="mb-1 block text-[11px] font-medium text-[var(--md-on-surface-variant)]"
                >
                  Housing Fit (D={spec.D} mm)
                </label>
                <select
                  id="housing-fit"
                  value={housingFit}
                  onChange={(e) =>
                    setHousingFit(e.target.value as HousingFitCode)
                  }
                  className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                >
                  {HOUSING_FIT_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--md-on-surface-variant)]">
                  Shaft ({shaftFit}):
                </span>
                <span className="font-mono font-semibold text-[var(--md-on-surface)]">
                  {formatClearanceRange(
                    metrics.fit.shaft.minClearanceUm,
                    metrics.fit.shaft.maxClearanceUm
                  )}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-[var(--md-on-surface-variant)]">
                  Housing ({housingFit}):
                </span>
                <span className="font-mono font-semibold text-[var(--md-on-surface)]">
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
        <div className="space-y-4 lg:col-span-8">
          <div data-tour="bearing-visual" className="glass-panel flex items-center justify-center rounded-[28px] p-4 sm:p-5">
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
          <div data-tour="bearing-readouts" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                {pick('Equiv. Load (P)', 'Beban Ekuivalen (P)', '動等価荷重 (P)')}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                {metrics.P.toFixed(2)} kN
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--md-on-surface-variant)]">
                X={metrics.X.toFixed(2)}, Y={metrics.Y.toFixed(2)}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                {pick('Basic Life (L10)', 'Umur Dasar (L10)', '基本定格寿命 (L10)')}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-[var(--md-primary)]">
                {formatRevs(metrics.L10)}
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--md-on-surface-variant)]">
                (C/P)^{spec.p === 3 ? '3' : '10/3'}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                {pick('Operating Hours (L10h)', 'Jam Operasi (L10h)', '定格寿命時間 (L10h)')}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
                {formatHours(metrics.L10h)}
              </div>
              <div className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                L10ha: {formatHours(metrics.L10ha)}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
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
              <div className="mt-0.5 text-[10px] text-[var(--md-on-surface-variant)]">
                C0 / P0 ({spec.C0} / {metrics.P0.toFixed(1)})
              </div>
            </div>

            <div className="glass-card col-span-2 rounded-[24px] p-3.5 sm:col-span-1">
              <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
                Fit Type
              </div>
              <div className="mt-1 text-xs font-bold leading-snug text-[var(--md-on-surface)]">
                {metrics.fit.shaft.classification} (Shaft)
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--md-on-surface-variant)]">
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
          <div data-tour="bearing-heater" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--md-primary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick(
                    'Bearing Mounting & Induction Heater Advisor',
                    'Penasihat Pemasangan & Pemanas Induksi Bearing',
                    '軸受組付・誘導加熱ヒーターアドバイザー'
                  )}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                  heaterPlan.overMaxTemp
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : heaterPlan.needsHeater
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
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
              <div className="space-y-1.5 md:col-span-5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface)]">
                    {pick('Induction Heater Temp', 'Suhu Pemanas Induksi', '誘導加熱温度')}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      heaterPlan.overMaxTemp
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-[var(--md-primary)]'
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
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] md:col-span-7">
                <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2.5 py-2">
                  <div className="text-[var(--md-on-surface-variant)]">
                    {pick('Diametral Expansion', 'Ekspansi Diameter', '内径膨張量')}
                  </div>
                  <div className="font-mono font-bold text-[var(--md-primary)]">
                    +{heaterPlan.expansionUm.toFixed(1)} µm
                  </div>
                </div>
                <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2.5 py-2">
                  <div className="text-[var(--md-on-surface-variant)]">
                    {pick(`Max Interference (${shaftFit})`, `Interferensi Maks (${shaftFit})`, `最大しめしろ (${shaftFit})`)}
                  </div>
                  <div className="font-mono font-bold text-[var(--md-on-surface)]">
                    {heaterPlan.maxInterferenceUm.toFixed(1)} µm
                  </div>
                </div>
                <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-2.5 py-2">
                  <div className="text-[var(--md-on-surface-variant)]">
                    {pick('Slip-On Clearance', 'Celah Masuk Poros', '挿入すきま')}
                  </div>
                  <div
                    className={`font-mono font-bold ${
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
              <div className="rounded-[20px] border border-rose-300/60 bg-rose-50/80 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">
                <strong>Max Safe Temperature Exceeded ({heaterTempC} °C &gt; 125 °C):</strong>{' '}
                Heating above 125 °C risks tempering bearing steel, permanent dimensional growth, and damaging seals or polyamide cages. Keep induction heater at 110 °C.
              </div>
            )}
          </div>

          {/* Condition & Fault Warnings */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick(
                  'Bearing Condition & Fit Diagnostics',
                  'Diagnostik Kondisi & Suaian Bearing',
                  '軸受状態・はめあい診断'
                )}
              </span>
              {metrics.severity === 'healthy' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {pick('Healthy Operation', 'Operasi Sehat', '正常運転')}
                </span>
              )}
              {metrics.severity === 'warning' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" /> {pick('Advisory Warning', 'Peringatan Awal', '注意警報')}
                </span>
              )}
              {metrics.severity === 'critical' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <ShieldAlert className="h-3.5 w-3.5" /> {pick('Critical Fault', 'Gangguan Kritis', '重大異常')}
                </span>
              )}
            </div>

            {metrics.warnings.length === 0 ? (
              <p className="text-xs text-[var(--md-on-surface-variant)]">
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
                    className={`rounded-[20px] border px-3.5 py-2.5 text-xs ${
                      w.severity === 'critical'
                        ? 'border-rose-300/60 bg-rose-50/80 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200'
                        : 'border-amber-300/60 bg-amber-50/80 text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200'
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
