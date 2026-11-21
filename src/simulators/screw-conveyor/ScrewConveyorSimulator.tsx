import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  Cog,
  Flame,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Thermometer,
  Wrench,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  PITCH_MODE_FACTORS,
  SCREW_MATERIALS,
  evaluateScrewConveyor,
  type PitchMode,
  type ScrewConveyorInputs,
  type ScrewFaultMode,
  type ScrewMaterialId,
  type TroughFillPct,
} from './screwConveyorMath';
import { ScrewConveyorSvg } from './ScrewConveyorSvg';

const INITIAL_INPUTS: ScrewConveyorInputs = {
  screwDiameterMm: 300,
  pipeDiameterMm: 73,
  pitchMm: 300,
  pitchMode: 'standard',
  troughFillPct: 30,
  rpm: 55,
  inclinationDeg: 0,
  lengthM: 8,
  materialId: 'grain',
  bulkDensityKgM3: SCREW_MATERIALS.grain.bulkDensityKgM3,
  materialFactorFm: SCREW_MATERIALS.grain.materialFactorFm,
  hangerBearingFactorFb: 1.7,
  radialClearanceMm: 10,
  faultMode: 'normal',
};

const MATERIAL_IDS: ScrewMaterialId[] = [
  'grain',
  'cement',
  'limestone',
  'woodchips',
  'sand',
];

const FILL_OPTIONS: TroughFillPct[] = [15, 30, 45, 95];

const PITCH_MODES: {
  id: PitchMode;
  ratioLabel: string;
  en: string;
  idLabel: string;
  ja: string;
}[] = [
  { id: 'standard', ratioLabel: '1.0D', en: 'Std', idLabel: 'Std', ja: '標準' },
  { id: 'half', ratioLabel: '0.67D', en: 'Half', idLabel: '2/3', ja: '半減' },
  { id: 'short', ratioLabel: '0.5D', en: 'Short', idLabel: 'Pendek', ja: '短' },
];

export function ScrewConveyorSimulator() {
  const { pick } = useLanguage();
  const [inputs, setInputs] = useState<ScrewConveyorInputs>(INITIAL_INPUTS);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phase, setPhase] = useState<number>(0);

  const metrics = useMemo(() => evaluateScrewConveyor(inputs), [inputs]);

  useEffect(() => {
    if (!isPlaying) return;
    const revPerTick = (inputs.rpm / 60) * 0.035;
    const timer = window.setInterval(() => {
      setPhase((prev) => (prev + revPerTick) % 1);
    }, 35);
    return () => window.clearInterval(timer);
  }, [isPlaying, inputs.rpm]);

  function selectMaterial(id: ScrewMaterialId) {
    const preset = SCREW_MATERIALS[id];
    setInputs((prev) => ({
      ...prev,
      materialId: id,
      bulkDensityKgM3: preset.bulkDensityKgM3,
      materialFactorFm: preset.materialFactorFm,
      troughFillPct: preset.recommendedFillPct,
    }));
  }

  function setFault(faultMode: ScrewFaultMode) {
    setInputs((prev) => ({ ...prev, faultMode }));
  }

  function selectPitchMode(mode: PitchMode) {
    setInputs((prev) => ({
      ...prev,
      pitchMode: mode,
      pitchMm: Math.round(prev.screwDiameterMm * PITCH_MODE_FACTORS[mode]),
    }));
  }

  function handleScrewDiameterChange(newDia: number) {
    setInputs((prev) => ({
      ...prev,
      screwDiameterMm: newDia,
      pipeDiameterMm: Math.min(prev.pipeDiameterMm, Math.round(newDia * 0.45)),
      pitchMm: Math.round(newDia * PITCH_MODE_FACTORS[prev.pitchMode]),
    }));
  }

  return (
    <div className="space-y-4">
      {/* Top Action & Fault Injection Bar */}
      <div data-tour="screw-faults" className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            <ShieldAlert className="h-3.5 w-3.5 text-[var(--md-primary)]" />
            {pick('Fault Mode:', 'Mode Gangguan:', '故障モード:')}
          </span>
          {(
            [
              {
                id: 'normal',
                en: 'Normal Run',
                idLabel: 'Operasi Normal',
                ja: '正常運転',
                activeClass:
                  'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-500',
              },
              {
                id: 'hanger-wear',
                en: 'Hanger Bearing Overheat',
                idLabel: 'Bantalan Gantung Panas',
                ja: 'ハンガー軸受過熱',
                activeClass:
                  'bg-rose-600 text-white shadow-xs ring-1 ring-rose-500',
              },
              {
                id: 'flight-abrasion',
                en: 'Flight Abrasion / Carryback',
                idLabel: 'Keausan Daun / Arus Balik',
                ja: '羽根摩耗・逆流',
                activeClass:
                  'bg-amber-600 text-white shadow-xs ring-1 ring-amber-500',
              },
              {
                id: 'overfill-jam',
                en: 'Overfill / Torque Jam',
                idLabel: 'Penuh Berlebih / Macet',
                ja: '過充填・トルク急増',
                activeClass:
                  'bg-red-600 text-white shadow-xs ring-1 ring-red-500',
              },
            ] as const
          ).map((f) => {
            const active = inputs.faultMode === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFault(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? f.activeClass
                    : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)]'
                }`}
              >
                {pick(f.en, f.idLabel, f.ja)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {inputs.faultMode !== 'normal' && (
            <button
              type="button"
              onClick={() => setFault('normal')}
              className="m3-btn-tonal inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
            >
              <Wrench className="h-3.5 w-3.5" />
              {pick('Clear Fault', 'Pulihkan', '故障解除')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="m3-btn-filled inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                {pick('Pause', 'Jeda', '一時停止')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                {pick('Run', 'Jalankan', '運転')}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setInputs(INITIAL_INPUTS)}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main 12-Column Aligned Grid */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        {/* Left Column: Animated SVG + Live Telemetry KPIs + Diagnostic Summary */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div className="glass-panel space-y-3.5 rounded-[28px] p-4">
            {/* Material Selector Strip */}
            <div data-tour="screw-material" className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Bulk Material:', 'Material Curah:', '搬送物:')}
                </span>
                {MATERIAL_IDS.map((mId) => {
                  const m = SCREW_MATERIALS[mId];
                  const active = inputs.materialId === mId;
                  return (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => selectMaterial(mId)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? 'bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)] shadow-xs'
                          : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {pick(m.nameEn, m.nameId, m.nameJa)}
                    </button>
                  );
                })}
              </div>
              <span className="font-mono text-xs font-medium text-[var(--md-on-surface-variant)]">
                ρ = {metrics.bulkDensityTM3.toFixed(2)} t/m³ · Fₘ ={' '}
                {inputs.materialFactorFm.toFixed(1)} · Fᵦ ={' '}
                {inputs.hangerBearingFactorFb.toFixed(1)}
              </span>
            </div>

            <ScrewConveyorSvg inputs={inputs} metrics={metrics} phase={phase} />

            {/* 6 Live Telemetry KPIs */}
            <div data-tour="screw-telemetry" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                  <span>{pick('Mass / Vol Flow', 'Kapasitas Aliran', '質量・体積流量')}</span>
                  <Cog className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                  {metrics.massCapacityTh.toFixed(2)}{' '}
                  <span className="text-xs font-semibold">t/h</span>
                </div>
                <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  {metrics.volumetricCapacityM3h.toFixed(1)} m³/h · Kθ=
                  {metrics.inclinationFactor.toFixed(2)}
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                  <span>{pick('Torque / Axial Speed', 'Torsi / Laju Aksial', 'トルク・軸方向速度')}</span>
                  <Gauge className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <div
                  className={`mt-1 font-mono text-lg font-extrabold ${
                    inputs.faultMode === 'overfill-jam'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--md-on-surface)]'
                  }`}
                >
                  {metrics.driveTorqueNm.toFixed(0)}{' '}
                  <span className="text-xs font-semibold">N·m</span>
                </div>
                <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  v = {metrics.axialSpeedMMin.toFixed(1)} m/min (
                  {metrics.axialVelocityMs.toFixed(2)} m/s)
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                  <span>{pick('Drive Power / Current', 'Daya / Arus Motor', '所要動力・電流')}</span>
                  <Zap className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                  {metrics.drivePowerKw.toFixed(2)}{' '}
                  <span className="text-xs font-semibold">kW</span>
                </div>
                <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  {metrics.motorCurrentA.toFixed(1)} A (400V) ·{' '}
                  {metrics.motorLoadPct.toFixed(0)}%
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                  <span>{pick('Axial Thrust / Deflect', 'Gaya Aksial / Lendutan', 'スラスト荷重・たわみ')}</span>
                  <ArrowDownUp className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                  {metrics.axialThrustKn.toFixed(2)}{' '}
                  <span className="text-xs font-semibold">kN</span>
                </div>
                <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  δ = {metrics.shaftDeflectionMm.toFixed(2)} mm ·{' '}
                  {pick('Res:', 'Tinggal:', '滞留:')} {metrics.residenceTimeS.toFixed(1)}s
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                  <span>{pick('Hanger Bearings', 'Bantalan Gantung', 'ハンガー軸受')}</span>
                  <Thermometer className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <div
                  className={`mt-1 font-mono text-lg font-extrabold ${
                    metrics.hangerBearingTempC > 95
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--md-on-surface)]'
                  }`}
                >
                  {metrics.hangerBearingTempC.toFixed(0)}{' '}
                  <span className="text-xs font-semibold">°C</span>
                </div>
                <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  {metrics.hangerCount} {pick('hangers', 'bantalan', '個')} ·{' '}
                  {pick('Gap', 'Celah', '隙間')} {metrics.effectiveClearanceMm.toFixed(0)}mm
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                  <span>{pick('Shear / Jam Risk', 'Risiko Macet / Geser', 'せん断・閉塞リスク')}</span>
                  <Flame className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <div
                  className={`mt-1 font-mono text-lg font-extrabold ${
                    metrics.shearJamRiskPct > 75
                      ? 'text-rose-600 dark:text-rose-400'
                      : metrics.shearJamRiskPct > 45
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {metrics.shearJamRiskPct.toFixed(0)}{' '}
                  <span className="text-xs font-semibold">%</span>
                </div>
                <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Carryback:', 'Arus balik:', '逆流率:')} {metrics.carrybackPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Summary */}
          <div data-tour="screw-diagnostic" className="glass-panel flex-1 space-y-2.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                <Flame className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick(
                  'CEMA 350 Engineering Diagnostic',
                  'Diagnostik Rekayasa CEMA 350',
                  'CEMA 350 工学診断ステータス'
                )}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  metrics.healthStatus === 'critical'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : metrics.healthStatus === 'warning'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {metrics.healthStatus === 'optimal' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {metrics.healthStatus === 'critical'
                  ? pick('CRITICAL FAULT', 'GANGGUAN KRITIS', '重大異常')
                  : metrics.healthStatus === 'warning'
                  ? pick('WARNING', 'PERINGATAN', '注意')
                  : pick('OPTIMAL', 'OPTIMAL', '正常')}
              </span>
            </div>

            <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] p-3.5 text-xs leading-relaxed text-[var(--md-on-surface)]">
              {inputs.faultMode === 'normal' &&
                pick(
                  'Auger flights, intermediate hanger bearings, and trough fill are operating within CEMA 350 mechanical & thermal limits.',
                  'Daun ulir, bantalan gantung tengah, dan pengisian palung beroperasi dalam batas mekanik & termal standar CEMA 350.',
                  'スクリュー羽根・中間ハンガー軸受・トラフ充填率はCEMA 350の機械的・熱的基準内で正常運転中です。'
                )}
              {inputs.faultMode === 'hanger-wear' &&
                pick(
                  'Hanger bearing seizure/wear detected: effective bearing factor Fb surged, causing 115°C+ thermal spike and elevated empty friction power.',
                  'Keausan/kemacetan bantalan gantung terdeteksi: faktor bantalan Fb melonjak memicu panas >115°C dan kenaikan daya gesek kosong.',
                  'ハンガー軸受の摩耗・焼付きを検知：軸受係数Fbが急増し115℃以上の過熱と空運転摩擦動力の増加が発生しています。'
                )}
              {inputs.faultMode === 'flight-abrasion' &&
                pick(
                  'Outer flight edge abrasion widens radial trough clearance (+14 mm), inducing material carryback and dropping net mass throughput.',
                  'Keausan tepi daun ulir memperbesar celah palung (+14 mm), memicu arus balik material dan menurunkan kapasitas bersih.',
                  '羽根外周の摩耗によりトラフ隙間が拡大（+14 mm）し、逆流（キャリーバック）で正味搬送量が低下しています。'
                )}
              {inputs.faultMode === 'overfill-jam' &&
                pick(
                  'Trough flooded above center pipe (95% effective fill): material bridging causes 2.65× drive torque spike, high shear/jam risk, and motor overload.',
                  'Palung terisi melampaui poros pipa (95% penuh): penyumbatan memicu lonjakan torsi 2,65×, risiko macet tinggi, dan beban berlebih motor.',
                  'トラフ過充填（実効充填率95%）：軸パイプ上部の閉塞により駆動トルクが2.65倍に急増し過負荷状態です。'
                )}
            </div>
          </div>
        </div>

        {/* Right Column: Organized Parameter Groups */}
        <div className="glass-panel flex flex-col justify-between gap-3.5 rounded-[28px] p-4 sm:p-5 lg:col-span-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Sliders className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('CEMA 350 Parameters', 'Parameter CEMA 350', 'CEMA 350 諸元設定')}
              </span>
              <div className="sim-dial flex h-11 w-11 flex-col items-center justify-center text-center">
                <span className="font-mono text-[11px] font-extrabold leading-none text-[var(--md-primary)]">
                  {inputs.rpm}
                </span>
                <span className="text-[8px] font-bold uppercase text-[var(--md-on-surface-variant)]">RPM</span>
              </div>
            </div>

            {/* Group 1: Auger Geometry */}
            <div data-tour="screw-geometry" className="space-y-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-primary)]">
                {pick('1. Auger Geometry', '1. Geometri Auger', '1. オーガ幾何諸元')}
              </div>

              <label className="block space-y-1">
                <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Screw Diameter (D)', 'Diameter Ulir (D)', 'スクリュー外径 (D)')}</span>
                  <span className="font-mono text-[var(--md-primary)]">
                    {inputs.screwDiameterMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={600}
                  step={25}
                  value={inputs.screwDiameterMm}
                  onChange={(e) => handleScrewDiameterChange(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <label className="block space-y-1">
                <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Center Pipe (dₚ)', 'Pipa Pusat (dₚ)', '中心軸パイプ径 (dₚ)')}</span>
                  <span className="font-mono text-[var(--md-primary)]">
                    {inputs.pipeDiameterMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={42}
                  max={Math.round(inputs.screwDiameterMm * 0.45)}
                  step={2}
                  value={inputs.pipeDiameterMm}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, pipeDiameterMm: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </label>

              {/* Pitch Mode + Flight Pitch P */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Pitch Mode & P', 'Mode Pitch & P', 'ピッチモード・P')}</span>
                  <span className="font-mono text-[var(--md-primary)]">
                    {inputs.pitchMm} mm
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PITCH_MODES.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => selectPitchMode(pm.id)}
                      className={`rounded-full py-1.5 text-[10.5px] font-bold transition ${
                        inputs.pitchMode === pm.id
                          ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-xs'
                          : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {pick(pm.en, pm.idLabel, pm.ja)} ({pm.ratioLabel})
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={Math.round(inputs.screwDiameterMm * 0.45)}
                  max={Math.round(inputs.screwDiameterMm * 1.5)}
                  step={5}
                  value={inputs.pitchMm}
                  onChange={(e) =>
                    setInputs((p) => ({ ...p, pitchMm: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Length (L)', 'Panjang (L)', '全長 (L)')}</span>
                    <span className="font-mono text-[var(--md-primary)]">
                      {inputs.lengthM}m
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={25}
                    step={0.5}
                    value={inputs.lengthM}
                    onChange={(e) =>
                      setInputs((p) => ({ ...p, lengthM: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </label>

                <label className="block space-y-1">
                  <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Clearance', 'Celah', '隙間')}</span>
                    <span className="font-mono text-[var(--md-primary)]">
                      {inputs.radialClearanceMm}mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={25}
                    step={1}
                    value={inputs.radialClearanceMm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        radialClearanceMm: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </label>
              </div>
            </div>

            {/* Group 2: Operating & Trough Fill */}
            <div data-tour="screw-operating" className="space-y-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-primary)]">
                {pick(
                  '2. Operating & Trough Fill',
                  '2. Operasi & Pengisian Palung',
                  '2. 運転条件・トラフ充填'
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Trough Loading Fill %', 'Pengisian Palung %', 'トラフ充填率 %')}</span>
                  <span className="font-mono text-[var(--md-primary)]">
                    {inputs.troughFillPct}%
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {FILL_OPTIONS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setInputs((p) => ({ ...p, troughFillPct: pct }))}
                      className={`rounded-full py-1.5 font-mono text-xs font-bold transition ${
                        inputs.troughFillPct === pct
                          ? pct === 95
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-xs'
                          : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Speed', 'Putaran', '回転数')}</span>
                    <span className="font-mono text-[var(--md-primary)]">
                      {inputs.rpm} RPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={inputs.rpm}
                    onChange={(e) =>
                      setInputs((p) => ({ ...p, rpm: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </label>

                <label className="block space-y-1">
                  <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Incline (θ)', 'Sudut (θ)', '傾斜 (θ)')}</span>
                    <span className="font-mono text-[var(--md-primary)]">
                      {inputs.inclinationDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    step={1}
                    value={inputs.inclinationDeg}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        inclinationDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </label>
              </div>
            </div>

            {/* Group 3: Material & CEMA Factors */}
            <div data-tour="screw-factors" className="space-y-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-primary)]">
                {pick(
                  '3. Material & CEMA Factors',
                  '3. Material & Faktor CEMA',
                  '3. 搬送物・CEMA係数'
                )}
              </div>

              <label className="block space-y-1">
                <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Bulk Density (ρ)', 'Densitas Curah (ρ)', 'かさ密度 (ρ)')}</span>
                  <span className="font-mono text-[var(--md-primary)]">
                    {(inputs.bulkDensityKgM3 / 1000).toFixed(2)} t/m³
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={2000}
                  step={20}
                  value={inputs.bulkDensityKgM3}
                  onChange={(e) =>
                    setInputs((p) => ({
                      ...p,
                      bulkDensityKgM3: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="block space-y-1">
                  <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Mat. Factor Fₘ', 'Faktor Fₘ', '材料係数 Fₘ')}</span>
                    <span className="font-mono text-[var(--md-primary)]">
                      {inputs.materialFactorFm.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={2.5}
                    step={0.1}
                    value={inputs.materialFactorFm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        materialFactorFm: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </label>

                <label className="block space-y-1">
                  <div className="flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Bearing Fᵦ', 'Bantalan Fᵦ', '軸受係数 Fᵦ')}</span>
                    <span className="font-mono text-[var(--md-primary)]">
                      {inputs.hangerBearingFactorFb.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={4.4}
                    step={0.1}
                    value={inputs.hangerBearingFactorFb}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        hangerBearingFactorFb: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-[11px] text-[var(--md-on-surface-variant)]">
            <strong className="text-[var(--md-on-surface)]">{pick('CEMA Tip:', 'Tips CEMA:', 'CEMA ヒント:')}</strong>{' '}
            {pick(
              'Use 15% fill for abrasive sand/limestone; 95% tubular/flooded fill spikes torque & jam risk.',
              'Gunakan isi 15% untuk pasir/batu kapur abrasif; isi 95% memicu lonjakan torsi & risiko macet.',
              '摩耗性材料は15%充填を推奨。95%過充填はトルク急増と閉塞リスクを高めます。'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
