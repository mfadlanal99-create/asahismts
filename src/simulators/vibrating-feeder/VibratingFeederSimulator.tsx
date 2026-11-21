import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Wrench,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  evaluateVibratingFeeder,
  type VibratingFeederFault,
  type VibratingFeederInputs,
} from './vibratingFeederMath';
import { VibratingFeederSvg } from './VibratingFeederSvg';

const INITIAL_INPUTS: VibratingFeederInputs = {
  driveFrequencyHz: 24,
  strokeMm: 6.0,
  throwAngleDeg: 22,
  troughInclinationDeg: 5,
  gateOpeningMm: 120,
  troughWidthMm: 600,
  troughLengthM: 3.0,
  bulkDensityTM3: 1.6,
  moistureFrictionFactor: 1.0,
  springStiffnessNmm: 850,
  faultMode: 'normal',
};

type MaterialPreset = 'limestone' | 'coal' | 'iron-ore' | 'wood-chips' | 'wet-sand';

export function VibratingFeederSimulator() {
  const { pick } = useLanguage();
  const [inputs, setInputs] = useState<VibratingFeederInputs>(INITIAL_INPUTS);
  const [activePreset, setActivePreset] = useState<MaterialPreset | null>('limestone');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const metrics = useMemo(() => evaluateVibratingFeeder(inputs), [inputs]);

  function applyMaterialPreset(preset: MaterialPreset) {
    setActivePreset(preset);
    if (preset === 'limestone') {
      setInputs((prev) => ({
        ...prev,
        bulkDensityTM3: 1.6,
        moistureFrictionFactor: 1.0,
        throwAngleDeg: 22,
        troughInclinationDeg: 5,
      }));
    } else if (preset === 'coal') {
      setInputs((prev) => ({
        ...prev,
        bulkDensityTM3: 0.85,
        moistureFrictionFactor: 0.9,
        throwAngleDeg: 20,
        troughInclinationDeg: 6,
      }));
    } else if (preset === 'iron-ore') {
      setInputs((prev) => ({
        ...prev,
        bulkDensityTM3: 2.45,
        moistureFrictionFactor: 1.05,
        throwAngleDeg: 25,
        troughInclinationDeg: 4,
      }));
    } else if (preset === 'wet-sand') {
      setInputs((prev) => ({
        ...prev,
        bulkDensityTM3: 1.85,
        moistureFrictionFactor: 1.25,
        throwAngleDeg: 26,
        troughInclinationDeg: 7,
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        bulkDensityTM3: 0.55,
        moistureFrictionFactor: 0.85,
        throwAngleDeg: 28,
        troughInclinationDeg: 8,
      }));
    }
  }

  function clearFault() {
    setInputs((prev) => ({
      ...prev,
      faultMode: 'normal',
      driveFrequencyHz:
        metrics.inResonanceZone ? 24 : prev.driveFrequencyHz,
    }));
  }

  const regimeLabel =
    metrics.regime === 'sub-threshold'
      ? pick('Sub-Throw Sliding', 'Geser (Kv < 1)', '滑走輸送 (Kv < 1)')
      : metrics.regime === 'micro-throw'
        ? pick('Optimal Micro-Throw', 'Micro-Throw Optimal', '最適マイクロ投擲')
        : pick('Aggressive Bounce', 'Pantulan Agresif', '過大跳躍 (摩耗増)');

  const faultButtons: Array<{
    id: VibratingFeederFault;
    label: string;
  }> = [
    {
      id: 'normal',
      label: pick('Normal Operation', 'Operasi Normal', '正常運転'),
    },
    {
      id: 'broken-spring',
      label: pick('Broken Coil Spring', 'Pegas Koil Patah', 'コイルばね破損'),
    },
    {
      id: 'hopper-bridging',
      label: pick('Hopper Bridging', 'Penyumbatan Corong', 'ホッパーブリッジ'),
    },
    {
      id: 'phase-slip',
      label: pick('Eccentric Phase Slip', 'Slip Fasa Eksentrik', '偏心位相ずれ'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Material Presets & Simulation Controls */}
      <div data-tour="feeder-presets" className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Material:', 'Material:', '搬送物:')}
          </span>
          {(
            [
              ['limestone', pick('Limestone (1.60)', 'Batu Kapur (1.60)', '石灰石 (1.60)')],
              ['coal', pick('Coal (0.85)', 'Batu Bara (0.85)', '石炭 (0.85)')],
              ['iron-ore', pick('Iron Ore (2.45)', 'Bijih Besi (2.45)', '鉄鉱石 (2.45)')],
              ['wet-sand', pick('Wet Sand (1.85)', 'Pasir Basah (1.85)', '湿砂 (1.85)')],
              ['wood-chips', pick('Wood Chips (0.55)', 'Serpihan Kayu (0.55)', '木質チップ (0.55)')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyMaterialPreset(id)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                activePreset === id
                  ? 'm3-btn-filled font-bold'
                  : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Pause', 'Jeda', '一時停止')}
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Run Feeder', 'Jalankan', '運転再開')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setInputs(INITIAL_INPUTS);
              setActivePreset('limestone');
            }}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Aligned Grid */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        {/* Left Column: Live Cutaway SVG + Telemetry Cards + Diagnostic Banner */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          <div data-tour="feeder-canvas" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="sim-dial flex h-7 w-7 items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick(
                    'Live Side-Cutaway, Drag Gate & Vibration Scope',
                    'Potongan Samping, Geser Gerbang & Osiloskop',
                    '振動フィーダ断面・ゲート操作＆振動波形'
                  )}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                  metrics.regime === 'aggressive-bounce'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    : metrics.regime === 'sub-threshold'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                }`}
              >
                {regimeLabel}
              </span>
            </div>

            <VibratingFeederSvg
              inputs={inputs}
              metrics={metrics}
              isPlaying={isPlaying}
              onGateChange={(gateOpeningMm) =>
                setInputs((prev) => ({ ...prev, gateOpeningMm }))
              }
            />
          </div>

          {/* 6 Engineering KPI Readout Cards */}
          <div data-tour="feeder-telemetry" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="glass-card rounded-[24px] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                <span>{pick('Throw Index Kᵥ', 'Indeks Lempar Kᵥ', '投擲指数 Kᵥ')}</span>
                <Activity className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.throwIndexKv.toFixed(2)}
              </div>
              <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                {metrics.peakGForce.toFixed(2)} g ({metrics.peakAccelMs2.toFixed(1)} m/s²)
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                <span>{pick('Conveying & Bed', 'Kecepatan & Lapisan', '輸送速度・層厚')}</span>
                <Gauge className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.conveyingVelocityMMin.toFixed(1)} m/min
              </div>
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('Bed', 'Lapisan', '層厚')}: {metrics.materialBedDepthMm.toFixed(0)} mm
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                <span>{pick('Mass Flow Rate', 'Laju Aliran Massa', '質量流量')}</span>
                <Layers className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-primary)]">
                {metrics.massFlowRateTH.toFixed(1)} t/h
              </div>
              <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                {metrics.volumetricFlowM3H.toFixed(1)} m³/h
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                <span>{pick('Springs & f/fₙ', 'Pegas & f/fₙ', 'ばね荷重・f/fₙ')}</span>
                <Sliders className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.resonanceRatio.toFixed(2)}{' '}
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                  (η {metrics.isolationEfficiencyPct.toFixed(0)}%)
                </span>
              </div>
              <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                {metrics.springStaticLoadKn.toFixed(2)} kN stat · {metrics.springDynamicLoadKn.toFixed(2)} kN dyn
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                <span>{pick('Motor Power & Current', 'Daya & Arus Motor', 'モータ出力・電流')}</span>
                <Zap className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.motorPowerKw.toFixed(2)} kW
              </div>
              <div className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                {metrics.motorCurrentA.toFixed(1)} A · {metrics.driveRpm} RPM
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--md-on-surface-variant)]">
                <span>{pick('Liner Wear Index', 'Indeks Keausan Liner', 'ライナー摩耗指数')}</span>
                <Flame className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              </div>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {metrics.linerWearIndex.toFixed(0)} / 100
              </div>
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                {metrics.linerWearIndex > 75
                  ? pick('High Impact Wear', 'Keausan Tinggi', '高衝撃摩耗')
                  : metrics.linerWearIndex > 45
                    ? pick('Moderate Wear', 'Keausan Sedang', '中程度摩耗')
                    : pick('Low Liner Wear', 'Keausan Rendah', '低摩耗')}
              </div>
            </div>
          </div>

          {/* Diagnostic & Fault Status Banner */}
          <div
            data-tour="feeder-diagnostic"
            className={`flex flex-wrap items-center justify-between gap-3 rounded-[24px] border p-4 ${
              metrics.healthStatus === 'critical'
                ? 'border-rose-400/50 bg-rose-500/10 text-rose-900 dark:text-rose-100'
                : metrics.healthStatus === 'warning'
                  ? 'border-amber-400/50 bg-amber-500/10 text-amber-900 dark:text-amber-100'
                  : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {metrics.healthStatus === 'critical' ? (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              ) : metrics.healthStatus === 'warning' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              )}
              <div className="text-xs leading-relaxed">
                {inputs.faultMode === 'broken-spring' ? (
                  <>
                    <strong>
                      {pick('Broken Coil Spring Fault:', 'Gangguan Pegas Patah:', 'コイルばね破損異常:')}
                    </strong>{' '}
                    {pick(
                      'Effective spring stiffness dropped by 38%, increasing static deflection and tilting the trough by 4.5°. Uneven bed depth reduces throughput and risks structural fatigue.',
                      'Kekakuan pegas turun 38%, memperbesar defleksi statis dan memiringkan bak 4,5°. Ketebalan material tidak merata menurunkan kapasitas dan memicu kelelahan rangka.',
                      'ばね剛性が38%低下し、静的たわみ増大とトラフ傾斜(4.5°)が発生。層厚不均一による能力低下とフレーム疲労の危険があります。'
                    )}
                  </>
                ) : inputs.faultMode === 'hopper-bridging' ? (
                  <>
                    <strong>
                      {pick('Hopper Bridging / Arching:', 'Penyumbatan / Arching Corong:', 'ホッパーブリッジ / 棚吊り:')}
                    </strong>{' '}
                    {pick(
                      'Cohesive material has formed a stable arch above the throat, choking effective gate opening to 18% and starving the trough.',
                      'Material kohesif membentuk lengkungan stabil di atas leher corong, mencekik bukaan efektif menjadi 18% dan membuat bak kekurangan umpan.',
                      '付着性粉体がホッパー喉部でアーチを形成し、有効ゲート開度が18%まで閉塞してトラフへの供給が途絶えています。'
                    )}
                  </>
                ) : inputs.faultMode === 'phase-slip' ? (
                  <>
                    <strong>
                      {pick('Dual Eccentric Phase Slip (Δφ = 58°):', 'Slip Fasa Eksentrik Ganda (Δφ = 58°):', '二軸偏心位相ずれ (Δφ = 58°):')}
                    </strong>{' '}
                    {pick(
                      'Synchronization slip between counter-rotating shafts reduces effective linear throw stroke and causes rocking vibration.',
                      'Selip sinkronisasi antar poros berlawanan arah menurunkan langkah lempar linier efektif dan memicu getaran oleng.',
                      '逆回転する二軸間の位相差により有効直線ストロークが低下し、ローリング振動が発生しています。'
                    )}
                  </>
                ) : metrics.inResonanceZone ? (
                  <>
                    <strong>
                      {pick('Resonance Danger Zone:', 'Zona Bahaya Resonansi:', '共振危険領域:')}
                    </strong>{' '}
                    {pick(
                      `Drive frequency (${inputs.driveFrequencyHz} Hz) is too close to natural frequency (${metrics.naturalFrequencyHz.toFixed(1)} Hz). Operate super-resonantly (f/fₙ > 2.0) for proper isolation.`,
                      `Frekuensi penggerak (${inputs.driveFrequencyHz} Hz) terlalu dekat dengan frekuensi alami (${metrics.naturalFrequencyHz.toFixed(1)} Hz). Operasikan di zona super-resonan (f/fₙ > 2,0).`,
                      `駆動周波数(${inputs.driveFrequencyHz} Hz)が固有振動数(${metrics.naturalFrequencyHz.toFixed(1)} Hz)に近すぎます。f/fₙ > 2.0 の超共振域で運転してください。`
                    )}
                  </>
                ) : (
                  <>
                    <strong>
                      {pick('Feeder Operating Normally:', 'Feeder Beroperasi Normal:', 'フィーダ正常運転中:')}
                    </strong>{' '}
                    {pick(
                      `Micro-throwing regime active (Kᵥ = ${metrics.throwIndexKv.toFixed(2)}) with ${metrics.isolationEfficiencyPct.toFixed(0)}% spring isolation efficiency (fₙ = ${metrics.naturalFrequencyHz.toFixed(1)} Hz).`,
                      `Rezim micro-throw aktif (Kᵥ = ${metrics.throwIndexKv.toFixed(2)}) dengan efisiensi isolasi pegas ${metrics.isolationEfficiencyPct.toFixed(0)}% (fₙ = ${metrics.naturalFrequencyHz.toFixed(1)} Hz).`,
                      `マイクロ投擲モードで安定稼働中 (Kᵥ = ${metrics.throwIndexKv.toFixed(2)})。防振効率 ${metrics.isolationEfficiencyPct.toFixed(0)}% (fₙ = ${metrics.naturalFrequencyHz.toFixed(1)} Hz)。`
                    )}
                  </>
                )}
              </div>
            </div>

            {(inputs.faultMode !== 'normal' || metrics.inResonanceZone) && (
              <button
                type="button"
                onClick={clearFault}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
              >
                <Wrench className="h-3.5 w-3.5" />
                {pick('Repair / Clear Fault', 'Perbaiki Gangguan', '異常を修復')}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Organized Parameter Groups & Fault Injection */}
        <div className="flex flex-col gap-3.5 lg:col-span-4">
          {/* Group 1: Drive & Vibration */}
          <div data-tour="feeder-drive" className="glass-panel space-y-2.5 rounded-[28px] p-4">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                {pick('1. Drive & Vibration', '1. Penggerak & Getaran', '1. 加振・駆動パラメータ')}
              </span>
              <span className="font-mono text-[11px] font-bold text-[var(--md-primary)]">
                {metrics.driveRpm} RPM
              </span>
            </div>

            <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--md-on-surface)]">
                  {pick('Drive Frequency (f)', 'Frekuensi (f)', '駆動周波数 (f)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {inputs.driveFrequencyHz} Hz
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={55}
                step={1}
                value={inputs.driveFrequencyHz}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    driveFrequencyHz: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Stroke (2A)', 'Stroke (2A)', '振幅 (2A)')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.strokeMm.toFixed(1)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={14.0}
                  step={0.5}
                  value={inputs.strokeMm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      strokeMm: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Throw β', 'Sudut β', '投擲角 β')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.throwAngleDeg}°
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  step={1}
                  value={inputs.throwAngleDeg}
                  onChange={(e) => {
                    setActivePreset(null);
                    setInputs((prev) => ({
                      ...prev,
                      throwAngleDeg: Number(e.target.value),
                    }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Trough & Gate Geometry */}
          <div data-tour="feeder-trough" className="glass-panel space-y-2.5 rounded-[28px] p-4">
            <div className="border-b border-[var(--md-outline-variant)]/50 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                {pick('2. Trough & Gate Geometry', '2. Geometri Bak & Gerbang', '2. トラフ・ゲート形状')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Width (W)', 'Lebar (W)', 'トラフ幅 (W)')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.troughWidthMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1600}
                  step={50}
                  value={inputs.troughWidthMm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      troughWidthMm: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Length (L)', 'Panjang (L)', 'トラフ長 (L)')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.troughLengthM.toFixed(1)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={6.0}
                  step={0.5}
                  value={inputs.troughLengthM}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      troughLengthM: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Gate (H)', 'Bukaan (H)', 'ゲート開度 (H)')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.gateOpeningMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={300}
                  step={5}
                  value={inputs.gateOpeningMm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      gateOpeningMm: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Slope α', 'Kemiringan α', '勾配 α')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.troughInclinationDeg}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={inputs.troughInclinationDeg}
                  onChange={(e) => {
                    setActivePreset(null);
                    setInputs((prev) => ({
                      ...prev,
                      troughInclinationDeg: Number(e.target.value),
                    }));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Material & Isolation Springs */}
          <div data-tour="feeder-springs" className="glass-panel space-y-2.5 rounded-[28px] p-4">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                {pick('3. Material & Springs', '3. Material & Pegas', '3. 搬送物・防振ばね')}
              </span>
              <span className="font-mono text-[11px] font-bold text-[var(--md-primary)]">
                fₙ = {metrics.naturalFrequencyHz.toFixed(1)} Hz
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Density (ρ)', 'Densitas (ρ)', 'かさ密度 (ρ)')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.bulkDensityTM3.toFixed(2)} t/m³
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={3.2}
                  step={0.05}
                  value={inputs.bulkDensityTM3}
                  onChange={(e) => {
                    setActivePreset(null);
                    setInputs((prev) => ({
                      ...prev,
                      bulkDensityTM3: Number(e.target.value),
                    }));
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[var(--md-on-surface)]">
                    {pick('Moisture/μ', 'Lembap/Gesek', '水分・摩擦係数')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {inputs.moistureFrictionFactor.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.3}
                  step={0.05}
                  value={inputs.moistureFrictionFactor}
                  onChange={(e) => {
                    setActivePreset(null);
                    setInputs((prev) => ({
                      ...prev,
                      moistureFrictionFactor: Number(e.target.value),
                    }));
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5 rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--md-on-surface)]">
                  {pick('Spring Stiffness (k)', 'Kekakuan Pegas (k)', 'ばね定数 (k)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {inputs.springStiffnessNmm} N/mm
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={1800}
                step={25}
                value={inputs.springStiffnessNmm}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    springStiffnessNmm: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Fault Injection Panel */}
          <div data-tour="feeder-faults" className="glass-panel space-y-2.5 rounded-[28px] p-4">
            <div className="border-b border-[var(--md-outline-variant)]/50 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                {pick('Fault Injection Lab', 'Simulasi Gangguan', '異常・故障注入ラボ')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {faultButtons.map((btn) => {
                const active = inputs.faultMode === btn.id;
                const isFault = btn.id !== 'normal';
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({ ...prev, faultMode: btn.id }))
                    }
                    className={`rounded-[20px] border px-3 py-2.5 text-start text-xs font-semibold transition ${
                      active
                        ? isFault
                          ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                          : 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
