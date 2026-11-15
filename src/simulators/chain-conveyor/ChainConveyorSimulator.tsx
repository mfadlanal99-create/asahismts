import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cog,
  Droplets,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Ruler,
  ShieldAlert,
  Sliders,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ANSI_CHAIN_SPECS,
  evaluateChainDrive,
  evaluateConveyorTracking,
  type AnsiChainNumber,
  type ChainDriveInputs,
  type ChainLubeMethod,
  type ConveyorTrackingInputs,
} from './chainConveyorMath';
import { RollerChainLabSvg } from './RollerChainLabSvg';
import { ConveyorTrackingLabSvg } from './ConveyorTrackingLabSvg';

type SubLabId = 'roller-chain' | 'conveyor-tracking';

const INITIAL_CHAIN_INPUTS: ChainDriveInputs = {
  chainCode: '#60',
  z1: 19,
  z2: 38,
  driverRpm: 550,
  centerDistanceMm: 750,
  wearElongationPct: 0.8,
  slackSagPct: 2.0,
  lubeMethod: 'Oil Bath',
};

const INITIAL_CONVEYOR_INPUTS: ConveyorTrackingInputs = {
  beltSpeedMs: 1.8,
  leftTakeUpMm: 28,
  rightTakeUpMm: 20,
  trainingIdlerSkewDeg: 0.0,
  chuteOffsetMm: 0,
  headPulleyMisalignDeg: 0.0,
};

const CHAIN_CODES: AnsiChainNumber[] = [
  '#40',
  '#50',
  '#60',
  '#80',
  '#100',
  '#120',
  '#140',
  '#160',
];
const LUBE_METHODS: ChainLubeMethod[] = ['Dry', 'Manual Drip', 'Oil Bath'];

export function ChainConveyorSimulator() {
  const { pick } = useLanguage();
  const [subLab, setSubLab] = useState<SubLabId>('roller-chain');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phaseOffset, setPhaseOffset] = useState<number>(0);
  const [travelPitches, setTravelPitches] = useState<number>(0);

  const [chainInputs, setChainInputs] =
    useState<ChainDriveInputs>(INITIAL_CHAIN_INPUTS);
  const [conveyorInputs, setConveyorInputs] = useState<ConveyorTrackingInputs>(
    INITIAL_CONVEYOR_INPUTS
  );

  const chainMetrics = useMemo(
    () => evaluateChainDrive(chainInputs),
    [chainInputs]
  );

  const conveyorMetrics = useMemo(
    () => evaluateConveyorTracking(conveyorInputs),
    [conveyorInputs]
  );

  useEffect(() => {
    if (!isPlaying) return;
    if (subLab === 'roller-chain') {
      // Advance in pitch units proportional to linear chain speed (pitches per 35ms tick)
      const pitchStep = Math.max(
        0.04,
        Math.min(0.45, chainMetrics.linearSpeedMs * 0.065)
      );
      const timer = window.setInterval(() => {
        setTravelPitches((prev) => prev + pitchStep);
      }, 35);
      return () => window.clearInterval(timer);
    }
    const speedStep = Math.max(0.01, conveyorInputs.beltSpeedMs * 0.011);
    const timer = window.setInterval(() => {
      setPhaseOffset((prev) => (prev + speedStep) % 1);
    }, 35);
    return () => window.clearInterval(timer);
  }, [
    isPlaying,
    subLab,
    chainMetrics.linearSpeedMs,
    conveyorInputs.beltSpeedMs,
  ]);

  function applyChainPreset(
    preset: 'optimal' | 'worn-3pct' | 'starved-tight' | 'chordal-12t'
  ) {
    if (preset === 'optimal') {
      setChainInputs(INITIAL_CHAIN_INPUTS);
    } else if (preset === 'worn-3pct') {
      setChainInputs({
        chainCode: '#80',
        z1: 17,
        z2: 42,
        driverRpm: 450,
        centerDistanceMm: 850,
        wearElongationPct: 3.25,
        slackSagPct: 3.8,
        lubeMethod: 'Manual Drip',
      });
    } else if (preset === 'starved-tight') {
      setChainInputs({
        chainCode: '#60',
        z1: 21,
        z2: 45,
        driverRpm: 720,
        centerDistanceMm: 700,
        wearElongationPct: 1.85,
        slackSagPct: 0.5,
        lubeMethod: 'Dry',
      });
    } else if (preset === 'chordal-12t') {
      setChainInputs({
        chainCode: '#100',
        z1: 12,
        z2: 64,
        driverRpm: 400,
        centerDistanceMm: 900,
        wearElongationPct: 1.65,
        slackSagPct: 2.2,
        lubeMethod: 'Oil Bath',
      });
    }
  }

  function applyRecommendedChainFix() {
    setChainInputs((prev) => ({
      ...prev,
      z1: Math.max(17, prev.z1),
      wearElongationPct: 0.4,
      slackSagPct: 2.0,
      lubeMethod: chainMetrics.recommendedLube,
    }));
  }

  function applyConveyorPreset(
    preset: 'centered' | 'tail-rub-right' | 'chute-off-center' | 'head-skew'
  ) {
    if (preset === 'centered') {
      setConveyorInputs({
        beltSpeedMs: 1.8,
        leftTakeUpMm: 25,
        rightTakeUpMm: 25,
        trainingIdlerSkewDeg: 0.0,
        chuteOffsetMm: 0,
        headPulleyMisalignDeg: 0.0,
      });
    } else if (preset === 'tail-rub-right') {
      setConveyorInputs({
        beltSpeedMs: 2.2,
        leftTakeUpMm: 36,
        rightTakeUpMm: 18,
        trainingIdlerSkewDeg: 0.0,
        chuteOffsetMm: 0,
        headPulleyMisalignDeg: 0.0,
      });
    } else if (preset === 'chute-off-center') {
      setConveyorInputs({
        beltSpeedMs: 2.0,
        leftTakeUpMm: 25,
        rightTakeUpMm: 25,
        trainingIdlerSkewDeg: -0.5,
        chuteOffsetMm: 50,
        headPulleyMisalignDeg: 0.0,
      });
    } else if (preset === 'head-skew') {
      setConveyorInputs({
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
    // Center chute, square tail take-up screws, and set training idler to cancel any residual head pulley skew
    setConveyorInputs((prev) => {
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
    <div className="space-y-5">
      {/* Top Sub-Lab Switcher & Animation Controls */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubLab('roller-chain')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              subLab === 'roller-chain'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Cog className="h-4 w-4" />
            {pick(
              '1. Roller Chain & 10-Pitch Wear Lab',
              '1. Lab Rantai Rol & Aus 10-Pitch',
              '1. ローラチェーン伝動＆10リンク摩耗ラボ'
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubLab('conveyor-tracking')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              subLab === 'conveyor-tracking'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="h-4 w-4" />
            {pick(
              '2. Conveyor Belt Tracking & Take-Up Lab',
              '2. Lab Pelacakan Sabuk Konveyor & Take-Up',
              '2. コンベヤベルト蛇行＆テイクアップ調整ラボ'
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
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
                {pick('Run Drive', 'Jalankan', '運転再開')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              subLab === 'roller-chain'
                ? setChainInputs(INITIAL_CHAIN_INPUTS)
                : setConveyorInputs(INITIAL_CONVEYOR_INPUTS)
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* =====================================================================
          SUB-LAB 1: ROLLER CHAIN DRIVE & PITCH WEAR ELONGATION LAB
         ===================================================================== */}
      {subLab === 'roller-chain' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
          {/* Left Column: 2D Canvas + 10-Pitch Vernier Gauge + Readouts */}
          <div className="space-y-4 lg:col-span-8">
            {/* Field Scenarios Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {pick('Presets:', 'Preset:', 'プリセット:')}
                </span>
                <button
                  type="button"
                  onClick={() => applyChainPreset('optimal')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
                >
                  {pick('Optimal #60 Drive', 'Penggerak #60 Optimal', '正常 #60 駆動')}
                </button>
                <button
                  type="button"
                  onClick={() => applyChainPreset('worn-3pct')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-300 dark:ring-rose-500/30"
                >
                  {pick('Worn Chain (3.25% Hooked)', 'Rantai Aus (3,25% Kait)', '摩耗限界超過 (3.25%)')}
                </button>
                <button
                  type="button"
                  onClick={() => applyChainPreset('starved-tight')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-amber-700 shadow-sm ring-1 ring-amber-200 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:ring-amber-500/30"
                >
                  {pick('Dry & Over-Tight Span', 'Kering & Terlalu Kencang', '無給油・張り過ぎ')}
                </button>
                <button
                  type="button"
                  onClick={() => applyChainPreset('chordal-12t')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-sky-700 shadow-sm ring-1 ring-sky-200 hover:bg-sky-50 dark:bg-slate-800 dark:text-sky-300 dark:ring-sky-500/30"
                >
                  {pick('12T Polygonal Vibration', 'Getaran Poligonal 12T', '12歯・多角形振動')}
                </button>
              </div>

              {chainMetrics.overallHealth !== 'optimal' && (
                <button
                  type="button"
                  onClick={applyRecommendedChainFix}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  {pick('Restore Spec', 'Perbaiki ke Standar', '推奨状態に修復')}
                </button>
              )}
            </div>

            <RollerChainLabSvg
              inputs={chainInputs}
              metrics={chainMetrics}
              travelPitches={travelPitches}
            />

            {/* Key Engineering Readout Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {pick('10-Pitch Gauge', 'Ukur 10-Pitch', '10リンク実測長')}
                  </span>
                  <Ruler className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {chainMetrics.measured10PitchMm.toFixed(1)} mm
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Nominal:', 'Nominal:', '基準:')} {chainMetrics.nominal10PitchMm.toFixed(1)} mm (
                  {chainInputs.wearElongationPct.toFixed(2)}%)
                </div>
              </div>

              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {pick('Chordal Action', 'Variasi Kordal', '多角形速度変動')}
                  </span>
                  <Activity className="h-3.5 w-3.5 text-sky-500" />
                </div>
                <div
                  className={`mt-1 text-base font-extrabold ${
                    chainMetrics.chordalSpeedVarPct > 2.0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {chainMetrics.chordalSpeedVarPct.toFixed(2)}%
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {chainInputs.z1 < 17
                    ? pick('High vibration (z₁ < 17)', 'Getaran tinggi (z₁ < 17)', '振動大 (z₁ < 17歯)')
                    : pick('Smooth engagement', 'Pertautan halus', '円滑噛み合い (z₁ ≥ 17)')}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {pick('Slack Span Sag S', 'Kelendutan S', '緩み側たるみ量 S')}
                  </span>
                  <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <div
                  className={`mt-1 text-base font-extrabold ${
                    chainMetrics.sagStatus === 'optimal'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {chainMetrics.slackSagMm.toFixed(1)} mm
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Target 2% C:', 'Target 2% C:', '目標 2% C:')}{' '}
                  {chainMetrics.targetSagIdealMm.toFixed(1)} mm
                </div>
              </div>

              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {pick('Pitch-Line Speed', 'Kecepatan Rantai', 'チェーン周速度')}
                  </span>
                  <Droplets className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {chainMetrics.linearSpeedMs.toFixed(2)} m/s
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Rec:', 'Rek:', '推奨:')}{' '}
                  {chainMetrics.recommendedLube === 'Oil Bath'
                    ? pick('Oil Bath', 'Rendaman Oli', '油浴潤滑')
                    : pick('Manual Drip', 'Tetes Manual', '滴下給油')}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Controls & Maintenance Diagnostics */}
          <div className="space-y-4 lg:col-span-4">
            <div className="glass-panel rounded-2xl p-4 shadow-xs">
              <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                {pick(
                  'Chain Drive & Wear Parameters',
                  'Parameter Penggerak & Keausan Rantai',
                  'チェーン駆動＆摩耗パラメータ設定'
                )}
              </h3>

              {/* ANSI / RS Chain Size Selector (RS 40 to RS 160) */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {pick(
                    'ANSI / RS Roller Chain Size',
                    'Ukuran Rantai Rol ANSI / RS',
                    'ANSI / RS ローラチェーン番手'
                  )}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CHAIN_CODES.map((code) => {
                    const spec = ANSI_CHAIN_SPECS[code];
                    const active = chainInputs.chainCode === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() =>
                          setChainInputs((prev) => ({
                            ...prev,
                            chainCode: code,
                          }))
                        }
                        className={`rounded-lg border px-1.5 py-1.5 text-center transition ${
                          active
                            ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{spec.rsLabel}</div>
                        <div className="text-[10px] opacity-80">
                          {spec.pitchMm} mm
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sprocket Teeth z1 & z2 */}
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Driver z₁', 'Penggerak z₁', '駆動歯数 z₁')}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {chainInputs.z1} T
                    </span>
                  </div>
                  <input
                    type="range"
                    min={11}
                    max={30}
                    step={1}
                    value={chainInputs.z1}
                    onChange={(e) =>
                      setChainInputs((prev) => ({
                        ...prev,
                        z1: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Driven z₂', 'Digerakkan z₂', '従動歯数 z₂')}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {chainInputs.z2} T
                    </span>
                  </div>
                  <input
                    type="range"
                    min={21}
                    max={72}
                    step={1}
                    value={chainInputs.z2}
                    onChange={(e) =>
                      setChainInputs((prev) => ({
                        ...prev,
                        z2: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Driver RPM & Center Distance */}
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Driver RPM', 'RPM Penggerak', '駆動回転数')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {chainInputs.driverRpm}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={1200}
                    step={25}
                    value={chainInputs.driverRpm}
                    onChange={(e) =>
                      setChainInputs((prev) => ({
                        ...prev,
                        driverRpm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Center C', 'Jarak Pusat C', '軸間距離 C')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {chainInputs.centerDistanceMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={1200}
                    step={25}
                    value={chainInputs.centerDistanceMm}
                    onChange={(e) =>
                      setChainInputs((prev) => ({
                        ...prev,
                        centerDistanceMm: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              {/* Pin-Bushing Wear Elongation % */}
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Pin-Bushing Wear Elongation (%)',
                      'Perpanjangan Aus Pin-Bushing (%)',
                      'ピン・ブシュ摩耗伸び率 (%)'
                    )}
                  </span>
                  <span
                    className={`font-extrabold ${
                      chainMetrics.wearStatus === 'replace-now'
                        ? 'text-rose-600 dark:text-rose-400'
                        : chainMetrics.wearStatus === 'hardened-limit'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {chainInputs.wearElongationPct.toFixed(2)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3.8}
                  step={0.05}
                  value={chainInputs.wearElongationPct}
                  onChange={(e) =>
                    setChainInputs((prev) => ({
                      ...prev,
                      wearElongationPct: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>0% (New)</span>
                  <span>1.5% (Hardened)</span>
                  <span>3.0% (Max Limit)</span>
                </div>
              </div>

              {/* Slack Span Sag % */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Slack Span Catenary Sag (% of C)',
                      'Kelendutan Sisi Kendur (% dari C)',
                      '緩み側スパンたるみ率 (% of C)'
                    )}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {chainInputs.slackSagPct.toFixed(1)}% (
                    {chainMetrics.slackSagMm.toFixed(1)} mm)
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={5.0}
                  step={0.1}
                  value={chainInputs.slackSagPct}
                  onChange={(e) =>
                    setChainInputs((prev) => ({
                      ...prev,
                      slackSagPct: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>0.4% (Over-tight)</span>
                  <span>2.0% (Ideal)</span>
                  <span>5.0% (Whip)</span>
                </div>
              </div>

              {/* Lubrication Method Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {pick(
                    'Lubrication Regime',
                    'Metode Pelumasan',
                    '潤滑方式（給油方法）'
                  )}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {LUBE_METHODS.map((method) => {
                    const active = chainInputs.lubeMethod === method;
                    const label =
                      method === 'Dry'
                        ? pick('Dry (None)', 'Kering', '無給油')
                        : method === 'Manual Drip'
                          ? pick('Manual Drip', 'Tetes Manual', '滴下給油')
                          : pick('Oil Bath', 'Rendaman Oli', '油浴潤滑');
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() =>
                          setChainInputs((prev) => ({
                            ...prev,
                            lubeMethod: method,
                          }))
                        }
                        className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                          active
                            ? method === 'Dry'
                              ? 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300'
                              : 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Diagnostic Summary Box */}
            <div
              className={`rounded-xl border p-4 ${
                chainMetrics.overallHealth === 'critical'
                  ? 'border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-950/30'
                  : chainMetrics.overallHealth === 'warning'
                    ? 'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/30'
                    : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-950/30'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {chainMetrics.overallHealth === 'critical' ? (
                  <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                ) : chainMetrics.overallHealth === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                  {pick(
                    'Chain Drive Diagnostic Findings',
                    'Diagnosis Penggerak Rantai',
                    'チェーン伝動 診断結果'
                  )}
                </h4>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li>
                  •{' '}
                  {chainMetrics.wearStatus === 'replace-now'
                    ? pick(
                        `Wear elongation (${chainInputs.wearElongationPct.toFixed(2)}%) exceeds replacement limit! Rollers are riding up sprocket teeth causing ${chainMetrics.hookWearSeverityPct}% tooth hook wear.`,
                        `Perpanjangan aus (${chainInputs.wearElongationPct.toFixed(2)}%) melewati batas penggantian! Rol menaiki gigi sproket dan memicu ${chainMetrics.hookWearSeverityPct}% keausan kait.`,
                        `摩耗伸び (${chainInputs.wearElongationPct.toFixed(2)}%) が交換限界を超過！ローラが歯先に乗り上げ、フック摩耗 (${chainMetrics.hookWearSeverityPct}%) が進行しています。`
                      )
                    : chainMetrics.wearStatus === 'hardened-limit'
                      ? pick(
                          `Wear (${chainInputs.wearElongationPct.toFixed(2)}%) exceeds the 1.5% hardened/precision limit. Plan replacement before reaching 3.0%.`,
                          `Keausan (${chainInputs.wearElongationPct.toFixed(2)}%) melewati batas 1,5% sproket diperkeras. Jadwalkan penggantian sebelum 3,0%.`,
                          `摩耗伸び (${chainInputs.wearElongationPct.toFixed(2)}%) が硬化歯限界 (1.5%) を超えています。3.0% 到達前に交換を計画してください。`
                        )
                      : pick(
                          `10-Pitch length (${chainMetrics.measured10PitchMm.toFixed(1)} mm) is within safe <1.5% tolerance.`,
                          `Panjang ukur 10-pitch (${chainMetrics.measured10PitchMm.toFixed(1)} mm) berada dalam batas aman <1,5%.`,
                          `10リンク実測長 (${chainMetrics.measured10PitchMm.toFixed(1)} mm) は許容範囲 (<1.5%) 内です。`
                        )}
                </li>
                <li>
                  •{' '}
                  {chainMetrics.sagStatus === 'tight'
                    ? pick(
                        `Slack sag (${chainInputs.slackSagPct.toFixed(1)}% C) is too tight (<1% C), imposing high radial load on shaft bearings.`,
                        `Kelendutan (${chainInputs.slackSagPct.toFixed(1)}% C) terlalu kencang (<1% C), membebani bantalan poros.`,
                        `緩み側たるみ (${chainInputs.slackSagPct.toFixed(1)}% C) が小さすぎます (<1% C)。軸受に過大荷重がかかります。`
                      )
                    : chainMetrics.sagStatus === 'loose'
                      ? pick(
                          `Slack sag (${chainInputs.slackSagPct.toFixed(1)}% C) is excessive (>3.2% C), risking chain whip and tooth jumping.`,
                          `Kelendutan (${chainInputs.slackSagPct.toFixed(1)}% C) terlalu kendur (>3,2% C), berisiko cambukan rantai dan loncatan gigi.`,
                          `緩み側たるみ (${chainInputs.slackSagPct.toFixed(1)}% C) が過大です (>3.2% C)。波打ちや歯飛びの危険があります。`
                        )
                      : pick(
                          `Slack sag S = ${chainMetrics.slackSagMm.toFixed(1)} mm (${chainInputs.slackSagPct.toFixed(1)}% C) matches the 2% rule.`,
                          `Kelendutan S = ${chainMetrics.slackSagMm.toFixed(1)} mm (${chainInputs.slackSagPct.toFixed(1)}% C) sesuai aturan 2%.`,
                          `緩み側たるみ S = ${chainMetrics.slackSagMm.toFixed(1)} mm (${chainInputs.slackSagPct.toFixed(1)}% C) は適正範囲です。`
                        )}
                </li>
                <li>
                  •{' '}
                  {!chainMetrics.lubeAdequate
                    ? pick(
                        `At v = ${chainMetrics.linearSpeedMs.toFixed(2)} m/s, ${chainInputs.lubeMethod} lubrication causes pin-bushing galling. Upgrade to ${chainMetrics.recommendedLube}.`,
                        `Pada v = ${chainMetrics.linearSpeedMs.toFixed(2)} m/s, pelumasan ${chainInputs.lubeMethod} memicu keausan cepat pin-bushing. Gunakan ${chainMetrics.recommendedLube}.`,
                        `周速度 v = ${chainMetrics.linearSpeedMs.toFixed(2)} m/s では現在の給油方式は不十分です。${chainMetrics.recommendedLube === 'Oil Bath' ? '油浴潤滑' : '滴下給油'}へ変更してください。`
                      )
                    : pick(
                        `Lubrication regime (${chainInputs.lubeMethod}) is adequate for v = ${chainMetrics.linearSpeedMs.toFixed(2)} m/s.`,
                        `Metode pelumasan (${chainInputs.lubeMethod}) memadai untuk kecepatan v = ${chainMetrics.linearSpeedMs.toFixed(2)} m/s.`,
                        `周速度 v = ${chainMetrics.linearSpeedMs.toFixed(2)} m/s に対して適切な潤滑方式が選択されています。`
                      )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-LAB 2: CONVEYOR BELT MISTRACKING & TAKE-UP TENSION LAB
         ===================================================================== */}
      {subLab === 'conveyor-tracking' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
          {/* Left Column: 2D Top-Down & Side Conveyor Canvas + Readouts */}
          <div className="space-y-4 lg:col-span-8">
            {/* Conveyor Fault Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
                </span>
                <button
                  type="button"
                  onClick={() => applyConveyorPreset('centered')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300 dark:ring-emerald-500/30"
                >
                  {pick('Centered Reference', 'Sabuk Sentris', '中央正常トラッキング')}
                </button>
                <button
                  type="button"
                  onClick={() => applyConveyorPreset('tail-rub-right')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-50 dark:bg-slate-800 dark:text-rose-300 dark:ring-rose-500/30"
                >
                  {pick(
                    'Unequal Take-Up (Right Rub)',
                    'Take-Up Timpang (Gesek Kanan)',
                    'テイクアップ不均等（右接触）'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => applyConveyorPreset('chute-off-center')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-amber-700 shadow-sm ring-1 ring-amber-200 hover:bg-amber-50 dark:bg-slate-800 dark:text-amber-300 dark:ring-amber-500/30"
                >
                  {pick(
                    'Off-Center Chute Load',
                    'Beban Chute Miring',
                    'シュート片荷による蛇行'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => applyConveyorPreset('head-skew')}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-sky-700 shadow-sm ring-1 ring-sky-200 hover:bg-sky-50 dark:bg-slate-800 dark:text-sky-300 dark:ring-sky-500/30"
                >
                  {pick(
                    'Head Frame Misalignment',
                    'Puli Kepala Miring',
                    'ヘッドプーリ傾き異常'
                  )}
                </button>
              </div>

              {Math.abs(conveyorMetrics.lateralWanderMm) > 3 && (
                <button
                  type="button"
                  onClick={handleAutoTrackConveyor}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  {pick('Auto-Center Belt', 'Setel Otomatis ke Tengah', 'ベルト自動センタリング')}
                </button>
              )}
            </div>

            <ConveyorTrackingLabSvg
              inputs={conveyorInputs}
              metrics={conveyorMetrics}
              phaseOffset={phaseOffset}
            />

            {/* Belt Tracking Readout Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {pick('Lateral Belt Wander', 'Penyimpangan Sabuk', 'ベルト横蛇行量')}
                </div>
                <div
                  className={`mt-1 text-base font-extrabold ${
                    conveyorMetrics.isFrameRubbing
                      ? 'text-rose-600 dark:text-rose-400'
                      : conveyorMetrics.trackingStatus === 'drifting'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {conveyorMetrics.lateralWanderMm > 0 ? '+' : ''}
                  {conveyorMetrics.lateralWanderMm.toFixed(1)} mm
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {conveyorMetrics.lateralWanderMm > 1
                    ? pick('Drifting RIGHT (+)', 'Geser KANAN (+)', '右側へ寄り (+)')
                    : conveyorMetrics.lateralWanderMm < -1
                      ? pick('Drifting LEFT (−)', 'Geser KIRI (−)', '左側へ寄り (−)')
                      : pick('Running centered', 'Tepat di tengah', '中央走行中')}
                </div>
              </div>

              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {pick('Take-Up Steering', 'Efek Baut Take-Up', 'テイクアップ操舵分')}
                </div>
                <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {conveyorMetrics.takeUpWanderContributionMm > 0 ? '+' : ''}
                  {conveyorMetrics.takeUpWanderContributionMm.toFixed(1)} mm
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Δ(L−R) = {conveyorMetrics.takeUpDiffMm > 0 ? '+' : ''}
                  {conveyorMetrics.takeUpDiffMm} mm
                </div>
              </div>

              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {pick('Training Idler Steering', 'Efek Training Idler', '調心アイドラ操舵分')}
                </div>
                <div className="mt-1 text-base font-extrabold text-sky-600 dark:text-sky-400">
                  {conveyorMetrics.idlerWanderContributionMm > 0 ? '+' : ''}
                  {conveyorMetrics.idlerWanderContributionMm.toFixed(1)} mm
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Skew α = {conveyorInputs.trainingIdlerSkewDeg > 0 ? '+' : ''}
                  {conveyorInputs.trainingIdlerSkewDeg.toFixed(1)}°
                </div>
              </div>

              <div className="glass-panel rounded-xl p-3 shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {pick('Edge Tensions (L / R)', 'Tegangan Tepi (Ki/Ka)', '左右ベルト張力 (L/R)')}
                </div>
                <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {conveyorMetrics.leftEdgeTensionKn.toFixed(1)} /{' '}
                  {conveyorMetrics.rightEdgeTensionKn.toFixed(1)} kN
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick(
                    'Belt tracks to lower tension',
                    'Sabuk ke sisi tegangan rendah',
                    '低張力側・先当たり側へ移動'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conveyor Take-Up & Idler Controls */}
          <div className="space-y-4 lg:col-span-4">
            <div className="glass-panel rounded-2xl p-4 shadow-xs">
              <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                {pick(
                  'Tail Pulley Take-Up & Tracking Controls',
                  'Kontrol Take-Up Puli Ekor & Pelacakan',
                  'テールテイクアップ＆蛇行調整コントロール'
                )}
              </h3>

              {/* Left Tail Take-Up Screw (mm) */}
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Left Tail Take-Up Screw (mm)',
                      'Baut Take-Up Ekor Kiri (mm)',
                      '左側テール・テイクアップねじ (mm)'
                    )}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {conveyorInputs.leftTakeUpMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={conveyorInputs.leftTakeUpMm}
                  onChange={(e) =>
                    setConveyorInputs((prev) => ({
                      ...prev,
                      leftTakeUpMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-500"
                />
              </div>

              {/* Right Tail Take-Up Screw (mm) */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Right Tail Take-Up Screw (mm)',
                      'Baut Take-Up Ekor Kanan (mm)',
                      '右側テール・テイクアップねじ (mm)'
                    )}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    {conveyorInputs.rightTakeUpMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={conveyorInputs.rightTakeUpMm}
                  onChange={(e) =>
                    setConveyorInputs((prev) => ({
                      ...prev,
                      rightTakeUpMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-sky-500"
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {pick(
                    'Tip: If belt drifts RIGHT (+mm), increase RIGHT take-up screw (or reduce LEFT) to square the tail pulley.',
                    'Tips: Bila sabuk geser ke KANAN (+mm), tambah ulir baut KANAN (atau kurangi KIRI) untuk meluruskan puli ekor.',
                    'ヒント: ベルトが右 (+) へ寄る場合、右側ねじを締め込む（または左を緩める）と中央へ戻ります。'
                  )}
                </p>
              </div>

              {/* Training Idler Skew Angle (±4°) */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Training Idler Skew Angle (±4°)',
                      'Sudut Skew Training Idler (±4°)',
                      '調心アイドラ・スキュー角 (±4°)'
                    )}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {conveyorInputs.trainingIdlerSkewDeg > 0 ? '+' : ''}
                    {conveyorInputs.trainingIdlerSkewDeg.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-4.0}
                  max={4.0}
                  step={0.2}
                  value={conveyorInputs.trainingIdlerSkewDeg}
                  onChange={(e) =>
                    setConveyorInputs((prev) => ({
                      ...prev,
                      trainingIdlerSkewDeg: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>−4° ({pick('Steers Left', 'Arah Kiri', '左へ操舵')})</span>
                  <span>0° (Square)</span>
                  <span>+4° ({pick('Steers Right', 'Arah Kanan', '右へ操舵')})</span>
                </div>
              </div>

              {/* Off-Center Chute Loading Offset (mm) */}
              <div className="mb-4">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {pick(
                      'Off-Center Chute Loading Offset',
                      'Offset Pemuatan Chute Tidak Sentris',
                      'シュート投入位置の偏心（片荷）'
                    )}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {conveyorInputs.chuteOffsetMm > 0 ? '+' : ''}
                    {conveyorInputs.chuteOffsetMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={60}
                  step={5}
                  value={conveyorInputs.chuteOffsetMm}
                  onChange={(e) =>
                    setConveyorInputs((prev) => ({
                      ...prev,
                      chuteOffsetMm: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500"
                />
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>−60 mm (Left Load)</span>
                  <span>0 mm (Centered)</span>
                  <span>+60 mm (Right Load)</span>
                </div>
              </div>

              {/* Belt Speed & Head Frame Misalignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Belt Speed', 'Laju Sabuk', 'ベルト速度')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {conveyorInputs.beltSpeedMs.toFixed(1)} m/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.8}
                    max={3.5}
                    step={0.1}
                    value={conveyorInputs.beltSpeedMs}
                    onChange={(e) =>
                      setConveyorInputs((prev) => ({
                        ...prev,
                        beltSpeedMs: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {pick('Head Skew', 'Kemiringan Kepala', 'ヘッド傾き')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {conveyorInputs.headPulleyMisalignDeg > 0 ? '+' : ''}
                      {conveyorInputs.headPulleyMisalignDeg.toFixed(1)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-1.5}
                    max={1.5}
                    step={0.1}
                    value={conveyorInputs.headPulleyMisalignDeg}
                    onChange={(e) =>
                      setConveyorInputs((prev) => ({
                        ...prev,
                        headPulleyMisalignDeg: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Frame Rubbing & Tracking Rule Diagnostic Box */}
            <div
              className={`rounded-xl border p-4 ${
                conveyorMetrics.isFrameRubbing
                  ? 'border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-950/30'
                  : conveyorMetrics.trackingStatus === 'drifting'
                    ? 'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-950/30'
                    : 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-950/30'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {conveyorMetrics.isFrameRubbing ? (
                  <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                ) : conveyorMetrics.trackingStatus === 'drifting' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                  {pick(
                    'Belt Tracking Diagnostic & First-Contact Rule',
                    'Diagnosis Pelacakan Sabuk & Aturan Kontak Pertama',
                    'ベルト蛇行診断＆先当たりの法則'
                  )}
                </h4>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <li>
                  •{' '}
                  {conveyorMetrics.isFrameRubbing
                    ? pick(
                        `CRITICAL: Belt lateral wander (${conveyorMetrics.lateralWanderMm.toFixed(1)} mm) exceeds ±25 mm clearance and is rubbing the ${conveyorMetrics.rubbingSide.toUpperCase()} frame rail! Edge fraying and belt splice damage imminent.`,
                        `KRITIS: Penyimpangan sabuk (${conveyorMetrics.lateralWanderMm.toFixed(1)} mm) melampaui ruang bebas ±25 mm dan bergesekan dengan rangka ${conveyorMetrics.rubbingSide === 'right' ? 'KANAN' : 'KIRI'}!`,
                        `危険: ベルト横蛇行量 (${conveyorMetrics.lateralWanderMm.toFixed(1)} mm) が許容限界 (±25 mm) を超え、${conveyorMetrics.rubbingSide === 'right' ? '右側' : '左側'}フレームに接触摩耗しています！`
                      )
                    : conveyorMetrics.trackingStatus === 'drifting'
                      ? pick(
                          `CAUTION: Belt is drifting ${conveyorMetrics.lateralWanderMm.toFixed(1)} mm off-center. Fine-tune tail take-up screws or training idler before frame contact occurs.`,
                          `PERHATIAN: Sabuk bergeser ${conveyorMetrics.lateralWanderMm.toFixed(1)} mm dari garis tengah. Setel baut take-up ekor atau training idler.`,
                          `注意: ベルトが中心から ${conveyorMetrics.lateralWanderMm.toFixed(1)} mm ずれています。フレーム接触前に微調整してください。`
                        )
                      : pick(
                          `OPTIMAL: Belt tracks within ±${Math.abs(conveyorMetrics.lateralWanderMm).toFixed(1)} mm of conveyor centerline with safe edge clearance.`,
                          `OPTIMAL: Sabuk berjalan stabil dalam ±${Math.abs(conveyorMetrics.lateralWanderMm).toFixed(1)} mm dari garis tengah konveyor.`,
                          `正常: ベルトは中心から ±${Math.abs(conveyorMetrics.lateralWanderMm).toFixed(1)} mm 以内で安定走行しています。`
                        )}
                </li>
                <li>
                  •{' '}
                  {Math.abs(conveyorInputs.chuteOffsetMm) >= 15
                    ? pick(
                        `Off-center chute load (${conveyorInputs.chuteOffsetMm > 0 ? '+' : ''}${conveyorInputs.chuteOffsetMm} mm) pushes the belt ${conveyorMetrics.chuteWanderContributionMm > 0 ? 'RIGHT' : 'LEFT'} by ${Math.abs(conveyorMetrics.chuteWanderContributionMm).toFixed(1)} mm on the troughing rolls. Center the chute deflector plate first!`,
                        `Beban chute tidak sentris (${conveyorInputs.chuteOffsetMm > 0 ? '+' : ''}${conveyorInputs.chuteOffsetMm} mm) mendorong sabuk ke ${conveyorMetrics.chuteWanderContributionMm > 0 ? 'KANAN' : 'KIRI'} sebesar ${Math.abs(conveyorMetrics.chuteWanderContributionMm).toFixed(1)} mm. Luruskan pelat pengarah chute terlebih dahulu!`,
                        `シュート片荷 (${conveyorInputs.chuteOffsetMm > 0 ? '+' : ''}${conveyorInputs.chuteOffsetMm} mm) によりトラフローラ上でベルトが${conveyorMetrics.chuteWanderContributionMm > 0 ? '右' : '左'}へ ${Math.abs(conveyorMetrics.chuteWanderContributionMm).toFixed(1)} mm 押されています。シュートガイド板を中央に戻してください。`
                      )
                    : pick(
                        'Chute feed is well-centered over the middle troughing roll.',
                        'Curahan material chute berada tepat di tengah rol troughing.',
                        'シュート投入位置はトラフローラ中央に正しく調整されています。'
                      )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
