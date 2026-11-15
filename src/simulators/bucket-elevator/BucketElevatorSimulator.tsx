import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  MATERIAL_PRESETS,
  evaluateBucketElevator,
  type BucketElevatorFault,
  type BucketElevatorInputs,
  type BucketElevatorType,
} from './bucketElevatorMath';
import { BucketElevatorSvg } from './BucketElevatorSvg';

const INITIAL_INPUTS: BucketElevatorInputs = {
  elevatorType: 'centrifugal',
  headPulleyDiaMm: 450,
  headPulleyRpm: 68,
  liftHeightM: 15,
  bucketWidthMm: 280,
  bucketProjectionMm: 150,
  bucketVolumeL: 4.5,
  bucketSpacingMm: 300,
  fillFactorPct: 75,
  bulkDensityTM3: 0.75,
  takeUpTensionKn: 8.5,
  fault: 'normal',
};

export function BucketElevatorSimulator() {
  const { pick } = useLanguage();
  const [inputs, setInputs] = useState<BucketElevatorInputs>(INITIAL_INPUTS);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('grain');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phase, setPhase] = useState<number>(0);

  const metrics = useMemo(() => evaluateBucketElevator(inputs), [inputs]);

  const activeMaterial = useMemo(
    () =>
      MATERIAL_PRESETS.find((m) => m.id === selectedMaterialId) ??
      MATERIAL_PRESETS[0],
    [selectedMaterialId]
  );

  useEffect(() => {
    if (!isPlaying) return;
    const step = Math.max(0.002, Math.min(0.025, metrics.beltSpeedMs * 0.0055));
    const timer = window.setInterval(() => {
      setPhase((prev) => (prev + step) % 1);
    }, 35);
    return () => window.clearInterval(timer);
  }, [isPlaying, metrics.beltSpeedMs]);

  function applyMaterialPreset(presetId: string) {
    const preset = MATERIAL_PRESETS.find((m) => m.id === presetId);
    if (!preset) return;
    setSelectedMaterialId(preset.id);
    setInputs((prev) => ({
      ...prev,
      bulkDensityTM3: preset.densityTM3,
      fillFactorPct: preset.fillFactorPct,
    }));
  }

  function setFault(fault: BucketElevatorFault) {
    setInputs((prev) => ({ ...prev, fault }));
  }

  function setElevatorType(elevatorType: BucketElevatorType) {
    setInputs((prev) => ({
      ...prev,
      elevatorType,
      headPulleyRpm:
        elevatorType === 'continuous'
          ? Math.min(prev.headPulleyRpm, 42)
          : Math.max(prev.headPulleyRpm, 58),
      bucketSpacingMm:
        elevatorType === 'continuous'
          ? Math.min(prev.bucketSpacingMm, 200)
          : Math.max(prev.bucketSpacingMm, 260),
    }));
  }

  function resetAll() {
    setInputs(INITIAL_INPUTS);
    setSelectedMaterialId('grain');
    setIsPlaying(true);
  }

  const healthColorClass =
    metrics.healthStatus === 'optimal'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : metrics.healthStatus === 'warning'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300';

  return (
    <div className="space-y-4">
      {/* Top Action, Elevator Type & Fault Injection Bar */}
      <div className="sim-panel flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="sim-header mr-1">
            {pick('Fault Injection:', 'Injeksi Gangguan:', '異常注入:')}
          </span>
          {(
            [
              {
                id: 'normal',
                label: pick('Normal', 'Normal', '正常'),
                activeCls: 'bg-emerald-500 text-white',
              },
              {
                id: 'belt-slip',
                label: pick('Belt Slip', 'Slip Sabuk', 'ベルトスリップ'),
                activeCls: 'bg-amber-500 text-slate-950',
              },
              {
                id: 'boot-choke',
                label: pick('Boot Choke', 'Boot Tersumbat', 'ブーツ詰まり'),
                activeCls: 'bg-rose-500 text-white',
              },
              {
                id: 'missing-bucket',
                label: pick('Missing Bucket', 'Bucket Hilang', 'バケット欠損'),
                activeCls: 'bg-sky-500 text-white',
              },
              {
                id: 'misalignment',
                label: pick('Misalignment', 'Sabuk Miring', 'ベルト蛇行'),
                activeCls: 'bg-fuchsia-500 text-white',
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFault(f.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                inputs.fault === f.id
                  ? `${f.activeCls} shadow-sm`
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {(
              [
                {
                  id: 'centrifugal',
                  label: pick('Centrifugal', 'Sentrifugal', '遠心式'),
                },
                {
                  id: 'continuous',
                  label: pick('Continuous', 'Kontinu', '連続式'),
                },
                {
                  id: 'chain',
                  label: pick('Chain', 'Rantai', 'チェーン式'),
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setElevatorType(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  inputs.elevatorType === t.id
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                {pick('Pause', 'Jeda', '一時停止')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                {pick('Run', 'Jalankan', '運転')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Aligned 12-Column Grid */}
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        {/* Left Column: Cutaway SVG + Live KPI Cards */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="sim-panel p-3.5">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-500" />
                <span className="sim-header">
                  {pick(
                    'Vertical Cutaway, Vector Diagram & Probe',
                    'Potongan Vertikal, Diagram Vektor & Probe',
                    '垂直断面・ベクトル図＆プローブ'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-slate-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {pick(
                    'Drag Probe or Click Hotspots',
                    'Seret Probe / Klik Titik Uji',
                    'プローブをドラッグ／点をクリック'
                  )}
                </span>
                <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-300">
                  N_crit = {metrics.criticalRpm.toFixed(1)} RPM
                </span>
              </div>
            </div>

            <BucketElevatorSvg
              inputs={inputs}
              metrics={metrics}
              materialColor={activeMaterial.color}
              phase={phase}
              isPlaying={isPlaying}
            />
          </div>

          {/* Diagnostic Banner + 6 KPI Boxes */}
          <div className="sim-panel flex flex-1 flex-col justify-between gap-3 p-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="sim-box p-2.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick('Mass Capacity', 'Kapasitas Massa', '質量輸送量')}
                </div>
                <div className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.massCapacityTph.toFixed(1)}{' '}
                  <span className="text-xs font-medium">t/h</span>
                </div>
              </div>

              <div className="sim-box p-2.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick('Vol. Capacity', 'Kapasitas Vol.', '体積輸送量')}
                </div>
                <div className="mt-0.5 text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {metrics.actualCapacityM3h.toFixed(1)}{' '}
                  <span className="text-xs font-medium">m³/h</span>
                </div>
              </div>

              <div className="sim-box p-2.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick('Motor Power / Amps', 'Daya / Arus Motor', '動力・電流')}
                </div>
                <div className="mt-0.5 text-lg font-bold text-sky-600 dark:text-sky-400">
                  {metrics.motorPowerKw.toFixed(2)}{' '}
                  <span className="text-xs font-medium">
                    kW · {metrics.motorCurrentA.toFixed(1)} A
                  </span>
                </div>
              </div>

              <div className="sim-box p-2.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick('Froude No. (Fr)', 'Bil. Froude (Fr)', 'フルード数 (Fr)')}
                </div>
                <div className="mt-0.5 text-lg font-bold text-slate-800 dark:text-white">
                  {metrics.froudeNumber.toFixed(2)}
                </div>
              </div>

              <div className="sim-box p-2.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick('Back-Spill Loss', 'Rugi Tumpah Balik', '逆流損失')}
                </div>
                <div
                  className={`mt-0.5 text-lg font-bold ${
                    metrics.backspillPct > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-800 dark:text-white'
                  }`}
                >
                  {metrics.backspillPct}%
                </div>
              </div>

              <div className="sim-box p-2.5">
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick('Req. Backstop', 'Torsi Backstop', '逆転防止トルク')}
                </div>
                <div className="mt-0.5 text-lg font-bold text-amber-600 dark:text-amber-400">
                  {metrics.requiredBackstopTorqueNm.toFixed(0)}{' '}
                  <span className="text-xs font-medium">N·m</span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl border p-3 text-xs ${healthColorClass}`}>
              <div className="flex items-start gap-2">
                {metrics.healthStatus === 'optimal' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : metrics.healthStatus === 'warning' ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <div>
                  <div className="font-bold">
                    {metrics.dischargeRegime === 'centrifugal' &&
                    inputs.fault === 'normal' &&
                    inputs.takeUpTensionKn >= metrics.minRequiredTensionKn
                      ? pick(
                          'Optimal Discharge & Tension',
                          'Pembuangan & Tegangan Sabuk Optimal',
                          '排出状態・張力ともに正常'
                        )
                      : metrics.dischargeRegime === 'gravity-backspill'
                        ? pick(
                            'Premature Gravity Drop & Back-Spill Detected!',
                            'Terdeteksi Jatuh Prematur & Tumpah Balik!',
                            '早期重力落下・逆流を検出！'
                          )
                        : pick(
                            'Operating Warning / Fault Active',
                            'Peringatan Operasi / Gangguan Aktif',
                            '運転警告／異常発生中'
                          )}
                  </div>
                  <p className="mt-0.5 opacity-90">
                    {inputs.fault === 'belt-slip'
                      ? pick(
                          'Belt slip reduced effective head pulley speed by 38%, dropping Fr below critical threshold.',
                          'Slip sabuk menurunkan putaran puli kepala 38%, membuat Fr turun di bawah batas kritis.',
                          'ベルトスリップによりヘッドプーリ実回転数が38%低下し、フルード数が臨界値を下回りました。'
                        )
                      : inputs.fault === 'boot-choke'
                        ? pick(
                            'Boot section material choke increases digging drag and spikes drive motor current.',
                            'Penyumbatan material di boot meningkatkan hambatan gali dan melonjakkan arus motor.',
                            'ブーツ部での詰まりにより掬い上げ抵抗が増大し、駆動モータ電流が急増しています。'
                          )
                        : inputs.fault === 'missing-bucket'
                          ? pick(
                              'Missing/damaged bucket reduces net throughput by 16% and induces cyclic shaft imbalance.',
                              'Bucket hilang/rusak menurunkan kapasitas 16% dan memicu ketidakseimbangan poros.',
                              'バケット欠損により輸送量が16%低下し、ヘッド軸に周期的な不釣り合いが発生しています。'
                            )
                          : inputs.fault === 'misalignment'
                            ? pick(
                                'Belt misalignment (±18.5 mm tracking offset) increases edge wear and bearing temperature.',
                                'Sabuk miring (offset ±18,5 mm) mempercepat keausan tepi sabuk dan memanaskan bantalan.',
                                'ベルト蛇行（±18.5 mm）により端面摩耗と軸受温度の上昇が発生しています。'
                              )
                            : inputs.takeUpTensionKn < metrics.minRequiredTensionKn
                              ? pick(
                                  `Take-up tension (${inputs.takeUpTensionKn.toFixed(1)} kN) is below minimum (${metrics.minRequiredTensionKn.toFixed(1)} kN), causing partial head pulley slip.`,
                                  `Tegangan take-up (${inputs.takeUpTensionKn.toFixed(1)} kN) di bawah batas minimum (${metrics.minRequiredTensionKn.toFixed(1)} kN), memicu slip parsial.`,
                                  `張り張力 (${inputs.takeUpTensionKn.toFixed(1)} kN) が必要最小値 (${metrics.minRequiredTensionKn.toFixed(1)} kN) 未満のため、部分スリップが発生しています。`
                                )
                              : metrics.dischargeRegime !== 'centrifugal'
                                ? pick(
                                    `Adjust head speed near ${metrics.criticalRpm.toFixed(0)} RPM so pole distance h_p aligns with R_eff.`,
                                    `Sesuaikan putaran kepala mendekati ${metrics.criticalRpm.toFixed(0)} RPM agar jarak kutub h_p sesuai R_eff.`,
                                    `極距離 h_p と有効半径 R_eff が整合するよう回転数を ${metrics.criticalRpm.toFixed(0)} RPM 付近に調整してください。`
                                  )
                                : pick(
                                    `Pole distance (${metrics.poleDistanceMm.toFixed(0)} mm) vs Eff. Radius (${(metrics.effectiveRadiusM * 1000).toFixed(0)} mm) yields clean chute discharge.`,
                                    `Jarak kutub (${metrics.poleDistanceMm.toFixed(0)} mm) vs Radius Efektif (${(metrics.effectiveRadiusM * 1000).toFixed(0)} mm) menghasilkan pembuangan bersih.`,
                                    `極距離 (${metrics.poleDistanceMm.toFixed(0)} mm) と有効半径 (${(metrics.effectiveRadiusM * 1000).toFixed(0)} mm) の条件により、シュートへ確実に排出されています。`
                                  )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Organized Parameter Groups + Power/Kinematic Breakdown */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Operating Parameters Panel */}
          <div className="sim-panel space-y-3.5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-500" />
                <span className="sim-header">
                  {pick(
                    'Industrial Elevator Parameters',
                    'Parameter Industri Elevator',
                    '産業用エレベータ設計条件'
                  )}
                </span>
              </div>

              {/* Compact Sim-Dial RPM Readout */}
              <div className="sim-dial flex h-12 w-12 flex-col items-center justify-center text-center">
                <span className="text-[11px] font-extrabold leading-none text-sky-700 dark:text-sky-300">
                  {Math.round(metrics.effectiveRpm)}
                </span>
                <span className="text-[8px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  RPM
                </span>
              </div>
            </div>

            {/* Bulk Material Presets */}
            <div className="sim-box p-2.5">
              <div className="mb-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {pick(
                  'Bulk Material Preset:',
                  'Preset Material Curah:',
                  '搬送物プリセット:'
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MATERIAL_PRESETS.map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => applyMaterialPreset(mat.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold transition ${
                      selectedMaterialId === mat.id
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-800/80 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/15"
                      style={{ backgroundColor: mat.color }}
                    />
                    <span className="truncate">
                      {pick(mat.labelEn, mat.labelId, mat.labelJa)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 1: Drive & Head Pulley */}
            <div className="sim-box space-y-2.5 p-3 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {pick(
                  'Drive & Head Pulley',
                  'Penggerak & Puli Kepala',
                  '駆動・ヘッドプーリ'
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Pulley Dia', 'Dia. Puli', 'プーリ径')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.headPulleyDiaMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={250}
                    max={1000}
                    step={25}
                    value={inputs.headPulleyDiaMm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        headPulleyDiaMm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Head Speed', 'Putaran', '回転数')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.headPulleyRpm} RPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={1}
                    value={inputs.headPulleyRpm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        headPulleyRpm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Lift Height', 'Tinggi Angkat', '揚程 H')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.liftHeightM} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={45}
                    step={1}
                    value={inputs.liftHeightM}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        liftHeightM: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Take-Up', 'Tegangan', '張り張力')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.takeUpTensionKn.toFixed(1)} kN
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={25.0}
                    step={0.5}
                    value={inputs.takeUpTensionKn}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        takeUpTensionKn: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Bucket & Casing Geometry */}
            <div className="sim-box space-y-2.5 p-3 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {pick(
                  'Bucket & Casing Geometry',
                  'Geometri Bucket & Casing',
                  'バケット・ケーシング寸法'
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Width', 'Lebar', 'バケット幅')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.bucketWidthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={600}
                    step={10}
                    value={inputs.bucketWidthMm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        bucketWidthMm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Projection', 'Proyeksi', '突出量')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.bucketProjectionMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={260}
                    step={5}
                    value={inputs.bucketProjectionMm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        bucketProjectionMm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Bucket Vol.', 'Vol. Bucket', 'バケット容量')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.bucketVolumeL.toFixed(1)} L
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.5}
                    max={18.0}
                    step={0.5}
                    value={inputs.bucketVolumeL}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        bucketVolumeL: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Pitch', 'Jarak Pitch', '取付ピッチ')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.bucketSpacingMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={160}
                    max={600}
                    step={20}
                    value={inputs.bucketSpacingMm}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        bucketSpacingMm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Material & Tension */}
            <div className="sim-box space-y-2.5 p-3 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                {pick(
                  'Material & Loading',
                  'Material & Pengisian',
                  '搬送物・充填条件'
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Fill Factor', 'Faktor Isi', '充填率')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.fillFactorPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={95}
                    step={1}
                    value={inputs.fillFactorPct}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        fillFactorPct: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between font-medium">
                    <span>{pick('Bulk Density', 'Densitas', 'かさ密度')}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {inputs.bulkDensityTM3.toFixed(2)} t/m³
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={2.2}
                    step={0.05}
                    value={inputs.bulkDensityTM3}
                    onChange={(e) =>
                      setInputs((p) => ({
                        ...p,
                        bulkDensityTM3: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Engineering Telemetry Summary */}
          <div className="sim-panel flex flex-1 flex-col justify-between gap-2.5 p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-sky-500" />
              <span className="sim-header">
                {pick(
                  'Kinematic & Power Breakdown',
                  'Rincian Kinematika & Daya',
                  '運動学・動力内訳'
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="sim-box flex items-center justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Linear Speed', 'Kec. Linier', 'ベルト速度')}
                </span>
                <span className="font-bold">
                  {metrics.beltSpeedMs.toFixed(2)} m/s
                </span>
              </div>

              <div className="sim-box flex items-center justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Pole Dist. h_p', 'Jarak Kutub h_p', '極距離 h_p')}
                </span>
                <span className="font-bold">
                  {metrics.poleDistanceMm.toFixed(0)} mm
                </span>
              </div>

              <div className="sim-box flex items-center justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Lift Power', 'Daya Angkat', '正味揚程動力')}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.effectiveLiftPowerKw.toFixed(2)} kW
                </span>
              </div>

              <div className="sim-box flex items-center justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Friction Power', 'Daya Gesek', '摩擦・掬い動力')}
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {metrics.frictionPowerKw.toFixed(2)} kW
                </span>
              </div>

              <div className="sim-box flex items-center justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Shaft Torque', 'Torsi Poros', '駆動軸トルク')}
                </span>
                <span className="font-bold">
                  {metrics.headShaftTorqueNm.toFixed(0)} N·m
                </span>
              </div>

              <div className="sim-box flex items-center justify-between px-3 py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Total Buckets', 'Total Bucket', '総バケット数')}
                </span>
                <span className="font-bold">{metrics.totalBuckets} pcs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
