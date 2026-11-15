import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Box,
  CheckCircle2,
  Cog,
  Gauge,
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
  evaluateDragChainConveyor,
  type DragChainConveyorInputs,
  type DragChainFault,
  type InspectionZoneId,
} from './dragChainConveyorMath';
import { DragChainConveyorSvg } from './DragChainConveyorSvg';

const INITIAL_INPUTS: DragChainConveyorInputs = {
  casingWidthMm: 320,
  casingHeightMm: 280,
  conveyorLengthM: 15,
  inclinationDeg: 0,
  bedHeightMm: 160,
  chainSpeedMs: 0.45,
  flightPitchMm: 200,
  chainPitchMm: 100,
  sprocketTeeth: 12,
  takeUpScrewMm: 38,
  chainWearPct: 0.8,
  bulkDensityTM3: 0.75,
  materialFriction: 0.38,
  chainFriction: 0.22,
  efficiencyPct: 78,
  fault: 'none',
};

const FAULT_OPTIONS: {
  id: DragChainFault;
  en: string;
  idLabel: string;
  ja: string;
}[] = [
  { id: 'none', en: 'Normal', idLabel: 'Normal', ja: '正常' },
  {
    id: 'chain-slack',
    en: 'Chain Slack',
    idLabel: 'Rantai Kendur',
    ja: 'チェーン弛み',
  },
  {
    id: 'broken-flight',
    en: 'Broken Flight',
    idLabel: 'Flight Patah',
    ja: 'フライト破損',
  },
  {
    id: 'material-jam',
    en: 'Material Jam',
    idLabel: 'Macet Material',
    ja: '材料詰まり',
  },
];

export function DragChainConveyorSimulator() {
  const { pick } = useLanguage();
  const [inputs, setInputs] = useState<DragChainConveyorInputs>(INITIAL_INPUTS);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] =
    useState<InspectionZoneId>('drive-sprocket');

  const metrics = useMemo(() => evaluateDragChainConveyor(inputs), [inputs]);

  function updateField<K extends keyof DragChainConveyorInputs>(
    key: K,
    value: DragChainConveyorInputs[K]
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function applyPreset(
    preset: 'grain' | 'wood-chips' | 'coal-ash' | 'clinker'
  ) {
    if (preset === 'grain') {
      setInputs(INITIAL_INPUTS);
    } else if (preset === 'wood-chips') {
      setInputs({
        ...INITIAL_INPUTS,
        casingWidthMm: 400,
        casingHeightMm: 320,
        bedHeightMm: 210,
        chainSpeedMs: 0.55,
        flightPitchMm: 225,
        bulkDensityTM3: 0.42,
        materialFriction: 0.45,
        chainFriction: 0.24,
        efficiencyPct: 74,
        inclinationDeg: 8,
        fault: 'none',
      });
    } else if (preset === 'coal-ash') {
      setInputs({
        ...INITIAL_INPUTS,
        casingWidthMm: 360,
        casingHeightMm: 300,
        bedHeightMm: 170,
        chainSpeedMs: 0.4,
        flightPitchMm: 175,
        conveyorLengthM: 20,
        bulkDensityTM3: 0.95,
        materialFriction: 0.42,
        chainFriction: 0.25,
        efficiencyPct: 76,
        inclinationDeg: 10,
        fault: 'none',
      });
    } else if (preset === 'clinker') {
      setInputs({
        ...INITIAL_INPUTS,
        casingWidthMm: 420,
        casingHeightMm: 340,
        bedHeightMm: 180,
        chainSpeedMs: 0.5,
        flightPitchMm: 175,
        chainPitchMm: 125,
        sprocketTeeth: 14,
        conveyorLengthM: 22,
        inclinationDeg: 18,
        bulkDensityTM3: 1.45,
        materialFriction: 0.52,
        chainFriction: 0.28,
        efficiencyPct: 72,
        takeUpScrewMm: 46,
        chainWearPct: 1.2,
        fault: 'none',
      });
    }
  }

  function restoreNormal() {
    setInputs((prev) => ({
      ...prev,
      fault: 'none',
      takeUpScrewMm: Math.max(32, Math.min(54, prev.takeUpScrewMm)),
      chainWearPct: Math.min(2.2, prev.chainWearPct),
    }));
  }

  const statusText = useMemo(() => {
    switch (metrics.statusCode) {
      case 'jam-overload':
        return {
          title: pick(
            'Critical: Material Jam & Shear Pin Trip',
            'Kritis: Material Macet & Shear Pin Putus',
            '重大: 材料詰まり・シャーピン破断'
          ),
          detail: pick(
            'Bridged material at the discharge chute spiked T₁ past the shear-pin limit. Clear the discharge plug, inspect flights, and replace the shear pin.',
            'Material menumpuk di corong keluar memicu lonjakan T₁ melebihi batas shear pin. Bersihkan sumbatan, periksa flight, dan ganti shear pin.',
            '排出口での材料ブリッジにより張力T₁がシャーピン限界を超過しました。詰まりを除去し、フライト点検後にシャーピンを交換してください。'
          ),
        };
      case 'broken-flight':
        return {
          title: pick(
            'Critical: Broken Scraper Flight & Heavy Carryback',
            'Kritis: Flight Penggaruk Patah & Carryback Tinggi',
            '重大: スクレーパフライト破損・持ち帰り増加'
          ),
          detail: pick(
            'A damaged flight is failing to sweep the bottom liner, cutting throughput and dragging bulk material along the return strand.',
            'Flight yang patah gagal menyapu liner bawah, menurunkan kapasitas angkut dan menyeret material balik di jalur atas.',
            '破損したフライトが底部ライナを掻き取れず、搬送量が低下しリターン側に材料が持ち帰られています。'
          ),
        };
      case 'chain-slack':
        return {
          title: pick(
            'Warning: Excessive Return Catenary Sag',
            'Peringatan: Kelendutan Katenari Berlebih',
            '警告: リターン側カテナリたるみ過大'
          ),
          detail: pick(
            'Slack-side tension T₂ is too low, risking sprocket tooth jumping and chain whip. Advance the tail take-up screw to restore 15–30 mm sag.',
            'Tegangan sisi kendur T₂ terlalu rendah sehingga berisiko loncatan gigi. Kencangkan baut take-up ekor hingga sag 15–30 mm.',
            '緩み側張力T₂が不足しており、歯飛びやチェーン振れの恐れがあります。テークアップねじを締めてたるみ15〜30mmに調整してください。'
          ),
        };
      case 'over-tensioned':
        return {
          title: pick(
            'Warning: Over-Tensioned Tail Take-Up',
            'Peringatan: Take-Up Ekor Terlalu Kencang',
            '警告: テークアップ過張力'
          ),
          detail: pick(
            'Excessive take-up screw travel elevates T₂ and adds parasitic wear-strip and bearing drag, accelerating chain pin wear.',
            'Langkah baut take-up berlebih menaikkan T₂ serta menambah gesekan bantalan dan keausan pin rantai.',
            'テークアップの締め過ぎによりT₂が過大となり、軸受負荷とチェーンピン摩耗が加速します。'
          ),
        };
      case 'chain-wear':
        return {
          title: pick(
            'Warning: High Chain Elongation Wear (≥ 3.0%)',
            'Peringatan: Keausan Pemanjangan Rantai Tinggi (≥ 3,0%)',
            '警告: チェーン伸び摩耗大 (≥ 3.0%)'
          ),
          detail: pick(
            'Pitch elongation above 3% degrades sprocket tooth engagement and increases catenary sag. Schedule chain replacement.',
            'Pemanjangan pitch di atas 3% mengganggu kait gigi sproket dan menambah kelendutan. Jadwalkan penggantian rantai.',
            'ピッチ伸びが3%を超え、スプロケット噛み合い悪化とたるみ増加を引き起こしています。チェーン交換を計画してください。'
          ),
        };
      case 'steep-derating':
        return {
          title: pick(
            'Advisory: Steep Inclination En-Masse Derating',
            'Info: Penurunan Efisiensi akibat Kemiringan Curam',
            '注意: 急傾斜によるエンマス効率低下'
          ),
          detail: pick(
            'Above 25° inclination, internal bed slip reduces volumetric efficiency and increases gravitational lift pull Fₑ.',
            'Di atas kemiringan 25°, slip internal menurunkan efisiensi volumetrik dan menaikkan gaya angkat Fₑ.',
            '傾斜25°以上では内部滑りで体積効率が低下し、リフト張力Fₑが増加します。'
          ),
        };
      default:
        return {
          title: pick(
            'Normal: Steady En-Masse Conveying',
            'Normal: Pengangkutan En-Masse Stabil',
            '正常: 安定エンマス搬送中'
          ),
          detail: pick(
            'Chain tension, catenary sag, and shear-pin margin are within optimal industrial limits. Click any SVG hotspot to inspect live zone telemetry.',
            'Tarikan rantai, kelendutan katenari, dan margin shear pin berada dalam batas optimal. Klik hotspot SVG untuk inspeksi zona.',
            'チェーン張力・カテナリたるみ・シャーピン余裕はいずれも適正範囲内です。SVG上のホットスポットをクリックして各部を点検できます。'
          ),
        };
    }
  }, [metrics.statusCode, pick]);

  const dialPercent = Math.min(100, Math.round(metrics.shearPinLoadPct));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN: Visualization, Presets & Live Telemetry */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          {/* Material Presets + Transport Controls */}
          <div className="sim-panel flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="sim-header mr-1">
                {pick('Material:', 'Material:', '材料:')}
              </span>
              <button
                type="button"
                onClick={() => applyPreset('grain')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-violet-50 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-violet-950/40"
              >
                {pick('Dry Grain', 'Biji Kering', '乾燥穀物')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('wood-chips')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-violet-50 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-violet-950/40"
              >
                {pick('Wood Chips', 'Serpih Kayu', '木質チップ')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('coal-ash')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-violet-50 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-violet-950/40"
              >
                {pick('Coal / Ash', 'Batu Bara', '石炭・灰')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('clinker')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-violet-50 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-violet-950/40"
              >
                {pick('Inclined Clinker', 'Klinker Miring', '傾斜クリンカ')}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {metrics.health !== 'normal' && (
                <button
                  type="button"
                  onClick={restoreNormal}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  {pick('Clear Fault', 'Pulihkan', '異常解除')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-violet-500"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                {isPlaying
                  ? pick('Pause', 'Jeda', '一時停止')
                  : pick('Run', 'Jalan', '運転')}
              </button>
              <button
                type="button"
                onClick={() => setInputs(INITIAL_INPUTS)}
                title={pick('Reset', 'Reset', 'リセット')}
                className="inline-flex items-center rounded-lg bg-slate-200/80 p-1.5 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main Animated SVG + Tension/Shear-Pin Meter Bar */}
          <div className="sim-panel p-3">
            <DragChainConveyorSvg
              inputs={inputs}
              metrics={metrics}
              isPlaying={isPlaying}
              selectedZone={selectedZone}
              onSelectZone={setSelectedZone}
            />
          </div>

          {/* 6-Card Industrial Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Mass & Vol. Flow', 'Aliran Massa & Vol.', '質量・体積流量')}
                </span>
                <Activity className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.massFlowTh.toFixed(1)} t/h
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {metrics.volumetricFlowM3h.toFixed(1)} m³/h (η=
                {(metrics.effectiveEfficiency * 100).toFixed(0)}%)
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Chain Pull (T₁)', 'Tarikan Rantai (T₁)', 'チェーン張力 (T₁)')}
                </span>
                <Gauge className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div
                className={`mt-1 text-lg font-extrabold ${
                  metrics.shearPinTripped
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {metrics.t1Kn.toFixed(2)} kN
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                T₂={metrics.t2Kn.toFixed(2)} kN · Fₑ={metrics.feKn.toFixed(2)} kN
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Drive Power & Current', 'Daya & Arus Motor', '駆動動力・電流')}
                </span>
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.motorPowerKw.toFixed(2)} kW
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {metrics.motorCurrentA.toFixed(1)} A (400V) ·{' '}
                {pick('Shaft:', 'Poros:', '軸:')} {metrics.shaftPowerKw.toFixed(2)} kW
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Sprocket RPM & Torque', 'RPM & Torsi Sproket', 'スプロケット回転・トルク')}
                </span>
                <Cog className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.sprocketRpm.toFixed(1)} RPM
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {metrics.driveTorqueNm.toFixed(0)} N·m · Ø
                {metrics.sprocketPitchDiaMm.toFixed(0)} mm
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Sag & Carryback', 'Sag & Carryback', 'たるみ・持ち帰り')}
                </span>
                <Activity className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div
                className={`mt-1 text-lg font-extrabold ${
                  metrics.takeUpStatus === 'slack' || metrics.carrybackPct > 10
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {metrics.catenarySagMm.toFixed(0)} mm
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick('Carryback:', 'Carryback:', '持ち帰り:')}{' '}
                {metrics.carrybackPct.toFixed(1)}%
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Bed Cross-Section', 'Luas Penampang', '層断面積')}
                </span>
                <Box className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.bedAreaCm2.toFixed(0)} cm²
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {inputs.casingWidthMm} × {metrics.effectiveBedHeightMm} mm
              </div>
            </div>
          </div>

          {/* Diagnostic Status Banner */}
          <div
            className={`sim-box flex items-start gap-3 p-3.5 ${
              metrics.health === 'critical'
                ? 'border-rose-300/80 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-950/30'
                : metrics.health === 'warning'
                  ? 'border-amber-300/80 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/30'
                  : 'border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-950/25'
            }`}
          >
            {metrics.health === 'critical' ? (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : metrics.health === 'warning' ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {statusText.title}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {statusText.detail}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Parameter Groups & Fault Injection */}
        <div className="sim-panel flex flex-col justify-between gap-3.5 p-4 lg:col-span-4">
          <div className="space-y-3">
            {/* Header with Shear-Pin Load Dial */}
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-violet-500" />
                <span className="sim-header">
                  {pick(
                    'Conveyor Parameters',
                    'Parameter Konveyor',
                    'コンベヤ設定'
                  )}
                </span>
              </div>
              <div
                className="sim-dial flex h-11 w-11 flex-col items-center justify-center text-center"
                title={pick(
                  'Shear Pin Load %',
                  'Beban Shear Pin %',
                  'シャーピン負荷率'
                )}
              >
                <span
                  className={`text-[11px] font-extrabold leading-none ${
                    dialPercent >= 100
                      ? 'text-rose-600 dark:text-rose-400'
                      : dialPercent >= 75
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-violet-600 dark:text-violet-400'
                  }`}
                >
                  {dialPercent}%
                </span>
                <span className="text-[8px] font-bold uppercase text-slate-500">
                  PIN
                </span>
              </div>
            </div>

            {/* Fault Injection Section (Upper Control Panel) */}
            <div className="sim-box space-y-2 p-2.5">
              <div className="sim-header">
                {pick('Fault Injection', 'Injeksi Gangguan', '故障シミュレーション')}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {FAULT_OPTIONS.map((opt) => {
                  const active = inputs.fault === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('fault', opt.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                        active
                          ? opt.id === 'none'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white/80 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700'
                      }`}
                    >
                      {pick(opt.en, opt.idLabel, opt.ja)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 1: Drive & Chain */}
            <div className="sim-box space-y-2 p-2.5 text-xs">
              <div className="sim-header">
                {pick('Drive & Chain', 'Penggerak & Rantai', '駆動・チェーン')}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Speed (v)', 'Kecepatan', '速度')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.chainSpeedMs.toFixed(2)} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={1.2}
                    step={0.05}
                    value={inputs.chainSpeedMs}
                    onChange={(e) =>
                      updateField('chainSpeedMs', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Flight Pitch', 'Pitch Flight', 'フライト間隔')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.flightPitchMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={125}
                    max={300}
                    step={25}
                    value={inputs.flightPitchMm}
                    onChange={(e) =>
                      updateField('flightPitchMm', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Chain Pitch', 'Pitch Rantai', 'チェーンピッチ')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.chainPitchMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={160}
                    step={10}
                    value={inputs.chainPitchMm}
                    onChange={(e) =>
                      updateField('chainPitchMm', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Teeth (z)', 'Gigi (z)', '歯数 (z)')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.sprocketTeeth}T
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={20}
                    step={1}
                    value={inputs.sprocketTeeth}
                    onChange={(e) =>
                      updateField('sprocketTeeth', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Take-Up', 'Take-Up', 'テークアップ')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.takeUpScrewMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    step={2}
                    value={inputs.takeUpScrewMm}
                    onChange={(e) =>
                      updateField('takeUpScrewMm', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Chain Wear', 'Aus Rantai', 'チェーン摩耗')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.chainWearPct.toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4.5}
                    step={0.1}
                    value={inputs.chainWearPct}
                    onChange={(e) =>
                      updateField('chainWearPct', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>
            </div>

            {/* Group 2: Casing & Bed Geometry */}
            <div className="sim-box space-y-2 p-2.5 text-xs">
              <div className="sim-header">
                {pick(
                  'Casing & Bed Geometry',
                  'Geometri Casing & Lapisan',
                  'ケーシング・層形状'
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Width (W)', 'Lebar (W)', '幅 (W)')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.casingWidthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={600}
                    step={20}
                    value={inputs.casingWidthMm}
                    onChange={(e) =>
                      updateField('casingWidthMm', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Casing H', 'Tinggi Casing', '高さ')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.casingHeightMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={500}
                    step={20}
                    value={inputs.casingHeightMm}
                    onChange={(e) =>
                      updateField('casingHeightMm', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                  <span>
                    {pick('Material Bed Height (H)', 'Tinggi Lapisan (H)', '材料層高さ (H)')}
                  </span>
                  <span className="font-bold text-violet-600 dark:text-violet-400">
                    {inputs.bedHeightMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={360}
                  step={10}
                  value={inputs.bedHeightMm}
                  onChange={(e) =>
                    updateField('bedHeightMm', Number(e.target.value))
                  }
                  className="w-full accent-violet-600"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Length (L)', 'Panjang (L)', '機長 (L)')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.conveyorLengthM} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    step={1}
                    value={inputs.conveyorLengthM}
                    onChange={(e) =>
                      updateField('conveyorLengthM', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Incline (θ)', 'Kemiringan', '傾斜角')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.inclinationDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={35}
                    step={1}
                    value={inputs.inclinationDeg}
                    onChange={(e) =>
                      updateField('inclinationDeg', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>
            </div>

            {/* Group 3: Material & Friction */}
            <div className="sim-box space-y-2 p-2.5 text-xs">
              <div className="sim-header">
                {pick(
                  'Material & Friction',
                  'Material & Gesekan',
                  '材料・摩擦特性'
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Density (ρ)', 'Densitas', 'かさ密度')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.bulkDensityTM3.toFixed(2)} t/m³
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.35}
                    max={1.8}
                    step={0.05}
                    value={inputs.bulkDensityTM3}
                    onChange={(e) =>
                      updateField('bulkDensityTM3', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Efficiency (η)', 'Efisiensi', '搬送効率')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.efficiencyPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={45}
                    max={95}
                    step={1}
                    value={inputs.efficiencyPct}
                    onChange={(e) =>
                      updateField('efficiencyPct', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Mat. Friction μₘ', 'Gesekan μₘ', '材料摩擦 μₘ')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.materialFriction.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={0.65}
                    step={0.01}
                    value={inputs.materialFriction}
                    onChange={(e) =>
                      updateField('materialFriction', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>

                <label className="block">
                  <div className="mb-0.5 flex justify-between font-medium text-slate-700 dark:text-slate-300">
                    <span>{pick('Rail Friction μ_c', 'Gesekan μ_c', 'レール摩擦 μ_c')}</span>
                    <span className="font-bold text-violet-600 dark:text-violet-400">
                      {inputs.chainFriction.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.12}
                    max={0.45}
                    step={0.01}
                    value={inputs.chainFriction}
                    onChange={(e) =>
                      updateField('chainFriction', Number(e.target.value))
                    }
                    className="w-full accent-violet-600"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
