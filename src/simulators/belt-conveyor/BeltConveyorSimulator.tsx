import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
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
  evaluateConveyorTracking,
  type ConveyorTrackingInputs,
} from './beltConveyorMath';
import { BeltConveyorSvg } from './BeltConveyorSvg';

const INITIAL_INPUTS: ConveyorTrackingInputs = {
  beltSpeedMs: 1.8,
  leftTakeUpMm: 28,
  rightTakeUpMm: 20,
  trainingIdlerSkewDeg: 0.0,
  chuteOffsetMm: 0,
  headPulleyMisalignDeg: 0.0,
};

export function BeltConveyorSimulator() {
  const { pick } = useLanguage();
  const [inputs, setInputs] = useState<ConveyorTrackingInputs>(INITIAL_INPUTS);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phaseOffset, setPhaseOffset] = useState<number>(0);

  const metrics = useMemo(() => evaluateConveyorTracking(inputs), [inputs]);

  useEffect(() => {
    if (!isPlaying) return;
    const speedStep = Math.max(0.01, inputs.beltSpeedMs * 0.011);
    const timer = window.setInterval(() => {
      setPhaseOffset((prev) => (prev + speedStep) % 1);
    }, 35);
    return () => window.clearInterval(timer);
  }, [isPlaying, inputs.beltSpeedMs]);

  function applyPreset(
    preset: 'centered' | 'tail-rub-right' | 'chute-off-center' | 'head-skew'
  ) {
    if (preset === 'centered') {
      setInputs({
        beltSpeedMs: 1.8,
        leftTakeUpMm: 25,
        rightTakeUpMm: 25,
        trainingIdlerSkewDeg: 0.0,
        chuteOffsetMm: 0,
        headPulleyMisalignDeg: 0.0,
      });
    } else if (preset === 'tail-rub-right') {
      setInputs({
        beltSpeedMs: 2.2,
        leftTakeUpMm: 36,
        rightTakeUpMm: 18,
        trainingIdlerSkewDeg: 0.0,
        chuteOffsetMm: 0,
        headPulleyMisalignDeg: 0.0,
      });
    } else if (preset === 'chute-off-center') {
      setInputs({
        beltSpeedMs: 2.0,
        leftTakeUpMm: 25,
        rightTakeUpMm: 25,
        trainingIdlerSkewDeg: -0.5,
        chuteOffsetMm: 50,
        headPulleyMisalignDeg: 0.0,
      });
    } else if (preset === 'head-skew') {
      setInputs({
        beltSpeedMs: 2.4,
        leftTakeUpMm: 25,
        rightTakeUpMm: 25,
        trainingIdlerSkewDeg: 0.0,
        chuteOffsetMm: -20,
        headPulleyMisalignDeg: -1.4,
      });
    }
  }

  function handleAutoTrackConveyor() {
    // Center chute, square tail take-up screws, and set training idler to cancel residual head pulley skew
    setInputs((prev) => {
      const avgScrew = Math.round((prev.leftTakeUpMm + prev.rightTakeUpMm) / 2);
      const neededTrainerDeg = Number(
        ((-prev.headPulleyMisalignDeg * 14.0) / 5.5).toFixed(1)
      );
      return {
        ...prev,
        leftTakeUpMm: avgScrew,
        rightTakeUpMm: avgScrew,
        chuteOffsetMm: 0,
        trainingIdlerSkewDeg: Math.max(-4, Math.min(4, neededTrainerDeg)),
      };
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN: Presets, Animated CAD Schematic, Telemetry & Diagnostics */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          {/* Scenario Presets + Transport Controls */}
          <div className="sim-panel flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="sim-header mr-1">
                {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
              </span>
              <button
                type="button"
                onClick={() => applyPreset('centered')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50 dark:bg-slate-800/80 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-950/40"
              >
                {pick('Centered Reference', 'Sabuk Sentris', '中央正常トラッキング')}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tail-rub-right')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50 dark:bg-slate-800/80 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-950/40"
              >
                {pick(
                  'Unequal Take-Up (Right Rub)',
                  'Take-Up Timpang (Gesek Kanan)',
                  'テイクアップ不均等（右接触）'
                )}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('chute-off-center')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-50 dark:bg-slate-800/80 dark:text-amber-300 dark:ring-amber-500/30 dark:hover:bg-amber-950/40"
              >
                {pick(
                  'Off-Center Chute Load',
                  'Beban Chute Miring',
                  'シュート片荷による蛇行'
                )}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('head-skew')}
                className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-50 dark:bg-slate-800/80 dark:text-sky-300 dark:ring-sky-500/30 dark:hover:bg-sky-950/40"
              >
                {pick(
                  'Head Frame Misalignment',
                  'Puli Kepala Miring',
                  'ヘッドプーリ傾き異常'
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {Math.abs(metrics.lateralWanderMm) > 3 && (
                <button
                  type="button"
                  onClick={handleAutoTrackConveyor}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  {pick('Auto-Center', 'Setel Sentris', '自動調心')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-sky-500"
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

          {/* Main Animated CAD Schematic */}
          <div className="sim-panel p-3">
            <BeltConveyorSvg
              inputs={inputs}
              metrics={metrics}
              phaseOffset={phaseOffset}
            />
          </div>

          {/* 6-Card Live Tracking & Drive Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Lateral Wander', 'Penyimpangan Sabuk', 'ベルト横蛇行量')}
                </span>
                <Activity className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div
                className={`mt-1 text-lg font-extrabold ${
                  metrics.isFrameRubbing
                    ? 'text-rose-600 dark:text-rose-400'
                    : metrics.trackingStatus === 'drifting'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {metrics.lateralWanderMm > 0 ? '+' : ''}
                {metrics.lateralWanderMm.toFixed(1)} mm
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {metrics.lateralWanderMm > 1
                  ? pick('Drifting RIGHT (+)', 'Geser KANAN (+)', '右側へ寄り (+)')
                  : metrics.lateralWanderMm < -1
                    ? pick('Drifting LEFT (−)', 'Geser KIRI (−)', '左側へ寄り (−)')
                    : pick('Running centered', 'Tepat di tengah', '中央走行中')}
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Take-Up Steering', 'Efek Baut Take-Up', 'テイクアップ操舵')}
                </span>
                <Wrench className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.takeUpWanderContributionMm > 0 ? '+' : ''}
                {metrics.takeUpWanderContributionMm.toFixed(1)} mm
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Δ(L−R) = {metrics.takeUpDiffMm > 0 ? '+' : ''}
                {metrics.takeUpDiffMm} mm ({metrics.tailSkewDeg.toFixed(2)}°)
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Training Idler', 'Training Idler', '調心アイドラ操舵')}
                </span>
                <Cog className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-sky-600 dark:text-sky-400">
                {metrics.idlerWanderContributionMm > 0 ? '+' : ''}
                {metrics.idlerWanderContributionMm.toFixed(1)} mm
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Skew α = {inputs.trainingIdlerSkewDeg > 0 ? '+' : ''}
                {inputs.trainingIdlerSkewDeg.toFixed(1)}°
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Edge Tensions (L/R)', 'Tegangan Tepi', '左右ベルト張力')}
                </span>
                <Gauge className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.leftEdgeTensionKn.toFixed(1)} /{' '}
                {metrics.rightEdgeTensionKn.toFixed(1)} kN
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick(
                  `Total ${metrics.totalBeltTensionKn.toFixed(1)} kN`,
                  `Total ${metrics.totalBeltTensionKn.toFixed(1)} kN`,
                  `合計 ${metrics.totalBeltTensionKn.toFixed(1)} kN`
                )}
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Drive Power', 'Daya Penggerak', '駆動動力')}
                </span>
                <Zap className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.drivePowerKw.toFixed(2)} kW
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                F_eff = {metrics.effectivePullKn.toFixed(2)} kN
              </div>
            </div>

            <div className="sim-box p-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="sim-header">
                  {pick('Head Pulley Speed', 'Putaran Puli Kepala', 'ヘッドプーリ回転')}
                </span>
                <Cog className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {metrics.headPulleyRpm.toFixed(1)} RPM
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                v = {inputs.beltSpeedMs.toFixed(1)} m/s (Ø320 mm)
              </div>
            </div>
          </div>

          {/* Diagnostic Status Banner */}
          <div
            className={`sim-box flex items-start gap-3 p-3.5 ${
              metrics.isFrameRubbing
                ? 'border-rose-300/80 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-950/30'
                : metrics.trackingStatus === 'drifting'
                  ? 'border-amber-300/80 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/30'
                  : 'border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-950/25'
            }`}
          >
            {metrics.isFrameRubbing ? (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : metrics.trackingStatus === 'drifting' ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <div className="min-w-0 flex-1 space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {pick(
                  'Belt Tracking Diagnostic & First-Contact Rule',
                  'Diagnosis Pelacakan Sabuk & Aturan Kontak Pertama',
                  'ベルト蛇行診断＆先当たりの法則'
                )}
              </div>
              <p className="leading-relaxed">
                {metrics.isFrameRubbing
                  ? pick(
                      `CRITICAL: Belt lateral wander (${metrics.lateralWanderMm.toFixed(1)} mm) exceeds ±25 mm clearance and is rubbing the ${metrics.rubbingSide.toUpperCase()} frame rail! Edge fraying and splice damage imminent.`,
                      `KRITIS: Penyimpangan sabuk (${metrics.lateralWanderMm.toFixed(1)} mm) melampaui ruang bebas ±25 mm dan bergesekan dengan rangka ${metrics.rubbingSide === 'right' ? 'KANAN' : 'KIRI'}!`,
                      `危険: ベルト横蛇行量 (${metrics.lateralWanderMm.toFixed(1)} mm) が許容限界 (±25 mm) を超え、${metrics.rubbingSide === 'right' ? '右側' : '左側'}フレームに接触摩耗しています！`
                    )
                  : metrics.trackingStatus === 'drifting'
                    ? pick(
                        `CAUTION: Belt is drifting ${metrics.lateralWanderMm.toFixed(1)} mm off-center. Fine-tune tail take-up screws or training idler before frame contact occurs.`,
                        `PERHATIAN: Sabuk bergeser ${metrics.lateralWanderMm.toFixed(1)} mm dari garis tengah. Setel baut take-up ekor atau training idler.`,
                        `注意: ベルトが中心から ${metrics.lateralWanderMm.toFixed(1)} mm ずれています。フレーム接触前に微調整してください。`
                      )
                    : pick(
                        `OPTIMAL: Belt tracks within ±${Math.abs(metrics.lateralWanderMm).toFixed(1)} mm of conveyor centerline with safe edge clearance.`,
                        `OPTIMAL: Sabuk berjalan stabil dalam ±${Math.abs(metrics.lateralWanderMm).toFixed(1)} mm dari garis tengah konveyor.`,
                        `正常: ベルトは中心から ±${Math.abs(metrics.lateralWanderMm).toFixed(1)} mm 以内で安定走行しています。`
                      )}
              </p>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {Math.abs(inputs.chuteOffsetMm) >= 15
                  ? pick(
                      `Off-center chute load (${inputs.chuteOffsetMm > 0 ? '+' : ''}${inputs.chuteOffsetMm} mm) pushes the belt ${metrics.chuteWanderContributionMm > 0 ? 'RIGHT' : 'LEFT'} by ${Math.abs(metrics.chuteWanderContributionMm).toFixed(1)} mm on the troughing rolls. Center the chute deflector plate first.`,
                      `Beban chute tidak sentris (${inputs.chuteOffsetMm > 0 ? '+' : ''}${inputs.chuteOffsetMm} mm) mendorong sabuk ke ${metrics.chuteWanderContributionMm > 0 ? 'KANAN' : 'KIRI'} sebesar ${Math.abs(metrics.chuteWanderContributionMm).toFixed(1)} mm. Luruskan pelat pengarah chute terlebih dahulu.`,
                      `シュート片荷 (${inputs.chuteOffsetMm > 0 ? '+' : ''}${inputs.chuteOffsetMm} mm) によりトラフローラ上でベルトが${metrics.chuteWanderContributionMm > 0 ? '右' : '左'}へ ${Math.abs(metrics.chuteWanderContributionMm).toFixed(1)} mm 押されています。シュートガイド板を中央に戻してください。`
                    )
                  : pick(
                      'Chute feed is well-centered over the middle troughing roll.',
                      'Curahan material chute berada tepat di tengah rol troughing.',
                      'シュート投入位置はトラフローラ中央に正しく調整されています。'
                    )}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Take-Up, Idler, Chute & Fault Controls */}
        <div className="sim-panel flex flex-col gap-3 p-4 lg:col-span-4">
          <div className="space-y-3">
            {/* Header with Clearance Dial */}
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-sky-500" />
                <span className="sim-header">
                  {pick(
                    'Tracking & Drive Controls',
                    'Kontrol Pelacakan & Penggerak',
                    '蛇行調整＆駆動コントロール'
                  )}
                </span>
              </div>
              <div
                className="sim-dial flex h-11 w-11 flex-col items-center justify-center text-center"
                title={pick(
                  'Lateral Clearance Used (%)',
                  'Pemakaian Ruang Bebas (%)',
                  '許容クリアランス使用率 (%)'
                )}
              >
                <span
                  className={`text-[11px] font-extrabold leading-none ${
                    metrics.isFrameRubbing
                      ? 'text-rose-600 dark:text-rose-400'
                      : metrics.trackingStatus === 'drifting'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-sky-600 dark:text-sky-400'
                  }`}
                >
                  {metrics.clearanceUsedPct}%
                </span>
                <span className="text-[8px] font-bold uppercase text-slate-500">
                  CLR
                </span>
              </div>
            </div>

            {/* Tail Pulley Take-Up Screws */}
            <div className="sim-box space-y-3 p-3">
              <div className="sim-header">
                {pick(
                  'Tail Pulley Screw Take-Ups',
                  'Baut Take-Up Puli Ekor',
                  'テールプーリ・テイクアップねじ'
                )}
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Left Tail Take-Up',
                      'Take-Up Ekor Kiri',
                      '左側テイクアップ'
                    )}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {inputs.leftTakeUpMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={inputs.leftTakeUpMm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      leftTakeUpMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Right Tail Take-Up',
                      'Take-Up Ekor Kanan',
                      '右側テイクアップ'
                    )}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {inputs.rightTakeUpMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={inputs.rightTakeUpMm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      rightTakeUpMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-500"
                />
              </div>

              <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                {pick(
                  'Tip: If belt drifts RIGHT (+mm), increase RIGHT take-up screw (or reduce LEFT) to square the tail pulley.',
                  'Tips: Bila sabuk geser ke KANAN (+mm), tambah ulir baut KANAN (atau kurangi KIRI) untuk meluruskan puli ekor.',
                  'ヒント: ベルトが右 (+) へ寄る場合、右側ねじを締め込む（または左を緩める）と中央へ戻ります。'
                )}
              </p>
            </div>

            {/* Training Idler & Chute Loading */}
            <div className="sim-box space-y-3 p-3">
              <div className="sim-header">
                {pick(
                  'Idler Steering & Chute Feed',
                  'Kemudi Idler & Curahan Chute',
                  'アイドラ操舵＆シュート投入'
                )}
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Training Idler Skew (±4°)',
                      'Sudut Skew Training Idler (±4°)',
                      '調心アイドラ・スキュー角 (±4°)'
                    )}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {inputs.trainingIdlerSkewDeg > 0 ? '+' : ''}
                    {inputs.trainingIdlerSkewDeg.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-4.0}
                  max={4.0}
                  step={0.2}
                  value={inputs.trainingIdlerSkewDeg}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      trainingIdlerSkewDeg: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>−4° ({pick('Steers Left', 'Arah Kiri', '左へ操舵')})</span>
                  <span>0°</span>
                  <span>+4° ({pick('Steers Right', 'Arah Kanan', '右へ操舵')})</span>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Chute Loading Offset',
                      'Offset Pemuatan Chute',
                      'シュート偏心 (片荷)'
                    )}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {inputs.chuteOffsetMm > 0 ? '+' : ''}
                    {inputs.chuteOffsetMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  step={5}
                  value={inputs.chuteOffsetMm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      chuteOffsetMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>−60 mm ({pick('Left', 'Kiri', '左')})</span>
                  <span>0 mm</span>
                  <span>+60 mm ({pick('Right', 'Kanan', '右')})</span>
                </div>
              </div>
            </div>

            {/* Drive Speed & Fault Injection */}
            <div className="sim-box space-y-3 p-3">
              <div className="sim-header">
                {pick(
                  'Drive Speed & Frame Fault',
                  'Kecepatan & Gangguan Rangka',
                  '駆動速度＆フレーム異常'
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Belt Speed', 'Laju Sabuk', 'ベルト速度')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {inputs.beltSpeedMs.toFixed(1)} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={3.5}
                    step={0.1}
                    value={inputs.beltSpeedMs}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        beltSpeedMs: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Head Skew', 'Miring Kepala', 'ヘッド傾き')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {inputs.headPulleyMisalignDeg > 0 ? '+' : ''}
                      {inputs.headPulleyMisalignDeg.toFixed(1)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.1}
                    value={inputs.headPulleyMisalignDeg}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        headPulleyMisalignDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Wander Superposition Breakdown */}
            <div className="sim-box space-y-1.5 p-3 text-xs">
              <div className="sim-header">
                {pick(
                  'Wander Contribution Breakdown',
                  'Rincian Kontribusi Geser',
                  '蛇行要因の内訳'
                )}
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{pick('Take-Up Δ(L−R):', 'Take-Up Δ(Ki−Ka):', 'テイクアップ差:')}</span>
                <span className="font-mono font-semibold">
                  {metrics.takeUpWanderContributionMm > 0 ? '+' : ''}
                  {metrics.takeUpWanderContributionMm.toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{pick('Training Idler:', 'Training Idler:', '調心アイドラ:')}</span>
                <span className="font-mono font-semibold">
                  {metrics.idlerWanderContributionMm > 0 ? '+' : ''}
                  {metrics.idlerWanderContributionMm.toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{pick('Chute Offset:', 'Offset Chute:', 'シュート偏心:')}</span>
                <span className="font-mono font-semibold">
                  {metrics.chuteWanderContributionMm > 0 ? '+' : ''}
                  {metrics.chuteWanderContributionMm.toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{pick('Head Skew Fault:', 'Miring Puli Kepala:', 'ヘッド傾き異常:')}</span>
                <span className="font-mono font-semibold">
                  {metrics.headFaultContributionMm > 0 ? '+' : ''}
                  {metrics.headFaultContributionMm.toFixed(1)} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
