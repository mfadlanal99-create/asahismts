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
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  ANSI_CHAIN_SPECS,
  evaluateChainDrive,
  type AnsiChainNumber,
  type ChainDriveInputs,
  type ChainLubeMethod,
} from './chainConveyorMath';
import { RollerChainLabSvg } from './RollerChainLabSvg';

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
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [travelPitches, setTravelPitches] = useState<number>(0);

  const [chainInputs, setChainInputs] =
    useState<ChainDriveInputs>(INITIAL_CHAIN_INPUTS);

  const chainMetrics = useMemo(
    () => evaluateChainDrive(chainInputs),
    [chainInputs]
  );

  useEffect(() => {
    if (!isPlaying) return;
    // Advance in pitch units proportional to linear chain speed (pitches per 35ms tick)
    const pitchStep = Math.max(
      0.04,
      Math.min(0.45, chainMetrics.linearSpeedMs * 0.065)
    );
    const timer = window.setInterval(() => {
      setTravelPitches((prev) => prev + pitchStep);
    }, 35);
    return () => window.clearInterval(timer);
  }, [isPlaying, chainMetrics.linearSpeedMs]);

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

  return (
    <div className="space-y-5">
      {/* Top Bar & Animation Controls */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Cog className="h-4 w-4" />
          </span>
          {pick(
            'Roller Chain Drive & 10-Pitch Wear Inspection',
            'Penggerak Rantai Rol & Inspeksi Aus 10-Pitch',
            'ローラチェーン伝動＆10リンク摩耗検査ラボ'
          )}
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
            onClick={() => setChainInputs(INITIAL_CHAIN_INPUTS)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* =====================================================================
          ROLLER CHAIN DRIVE & PITCH WEAR ELONGATION LAB
         ===================================================================== */}
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
    </div>
  );
}
