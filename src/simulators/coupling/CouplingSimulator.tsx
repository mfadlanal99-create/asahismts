import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cog,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  COUPLING_SPECS,
  INITIAL_CHALLENGE,
  evaluateCouplingInspection,
  generateBalancingChallenge,
  getIsoZoneMeta,
  solveSinglePlaneBalancing,
} from './couplingMath';
import type {
  BalancingChallenge,
  CouplingInspectionInputs,
  CouplingType,
  IsoZone,
} from './couplingTypes';
import { PolarVectorPlotSvg, RotorDiskSvg, VibrationWaveformSvg } from './RotorBalancingSvg';
import { CouplingInspectionSvg } from './CouplingInspectionSvg';
import { useLanguage } from '../../context/LanguageContext';

type LabSubTab = 'balancing' | 'coupling';

const ZONE_BADGE_CLASSES: Record<IsoZone, string> = {
  A: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  B: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300',
  C: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  D: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
};

export function CouplingSimulator() {
  const { pick } = useLanguage();
  const [subTab, setSubTab] = useState<LabSubTab>('balancing');

  // --- Sub-tab 1: Single-Plane Dynamic Balancing State ---
  const [challenge, setChallenge] =
    useState<BalancingChallenge>(INITIAL_CHALLENGE);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [spinAngleDeg, setSpinAngleDeg] = useState<number>(0);

  const [hasInitialRun, setHasInitialRun] = useState<boolean>(false);
  const [isTrialInstalled, setIsTrialInstalled] = useState<boolean>(false);
  const [isCorrectionApplied, setIsCorrectionApplied] =
    useState<boolean>(false);

  const [trialMassG, setTrialMassG] = useState<number>(15);
  const [trialAngleDeg, setTrialAngleDeg] = useState<number>(0);
  const [corrMassG, setCorrMassG] = useState<number>(20);
  const [corrAngleDeg, setCorrAngleDeg] = useState<number>(180);

  useEffect(() => {
    if (!isPlaying || subTab !== 'balancing') return;
    let rafId = 0;
    let lastTime = performance.now();
    const degPerSec = Math.max(120, Math.min(360, challenge.rpm * 0.16));

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      setSpinAngleDeg((prev) => prev + degPerSec * dt);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying, subTab, challenge.rpm]);

  const balancingSolution = useMemo(
    () =>
      solveSinglePlaneBalancing(
        challenge,
        trialMassG,
        trialAngleDeg,
        corrMassG,
        corrAngleDeg,
        isCorrectionApplied,
        isTrialInstalled
      ),
    [
      challenge,
      trialMassG,
      trialAngleDeg,
      corrMassG,
      corrAngleDeg,
      isCorrectionApplied,
      isTrialInstalled,
    ]
  );

  const activeVector = !hasInitialRun
    ? { mag: 0, deg: 0 }
    : isCorrectionApplied
      ? balancingSolution.vRes
      : isTrialInstalled
        ? balancingSolution.v1
        : challenge.v0;

  const activeVibrationMmS = activeVector.mag;

  const activeZoneMeta = getIsoZoneMeta(balancingSolution.activeZone);

  function handleNewChallenge() {
    setChallenge((prev) => generateBalancingChallenge(prev.id));
    setHasInitialRun(false);
    setIsTrialInstalled(false);
    setIsCorrectionApplied(false);
  }

  function handleRunInitial() {
    setHasInitialRun(true);
    setIsTrialInstalled(false);
    setIsCorrectionApplied(false);
  }

  function handleRunTrial() {
    if (!hasInitialRun) setHasInitialRun(true);
    setIsTrialInstalled(true);
    setIsCorrectionApplied(false);
  }

  function handleFillCalculatedCorrection() {
    setCorrMassG(Number(balancingSolution.mcMag.toFixed(1)));
    setCorrAngleDeg(Math.round(balancingSolution.mcDeg) % 360);
  }

  function handleApplyCorrection() {
    if (!hasInitialRun) setHasInitialRun(true);
    setIsTrialInstalled(false);
    setIsCorrectionApplied(true);
  }

  // --- Sub-tab 2: Coupling & Keyway Inspection State ---
  const [couplingInputs, setCouplingInputs] =
    useState<CouplingInspectionInputs>({
      couplingType: 'jaw',
      torqueNm: 210,
      keywayClearanceMm: 0.04,
      elastomerWearPct: 18,
      shaftDiameterMm: 40,
      keyLengthMm: 45,
    });

  const [parallelMisalignmentMm, setParallelMisalignmentMm] =
    useState<number>(0.22);
  const [angularMisalignmentDeg, setAngularMisalignmentDeg] =
    useState<number>(0.45);

  const inspectionResult = useMemo(
    () => evaluateCouplingInspection(couplingInputs),
    [couplingInputs]
  );

  const rmsBarPct = Math.min(100, (activeVibrationMmS / 8.0) * 100);

  return (
    <div className="space-y-5">
      {/* Sub-tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl p-3 ">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSubTab('balancing')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              subTab === 'balancing'
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20 dark:bg-violet-500 dark:text-slate-950'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="h-4 w-4" />
            {pick(
              'Single-Plane Dynamic Balancing Lab',
              'Lab Penyeimbangan Dinamis 1-Bidang',
              '1面動釣合い試験ラボ'
            )}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('coupling')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              subTab === 'coupling'
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20 dark:bg-violet-500 dark:text-slate-950'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Cog className="h-4 w-4" />
            {pick(
              'Coupling & Keyway Inspection',
              'Inspeksi Kopling & Alur Pasak',
              'カップリング・キー溝点検'
            )}
          </button>
        </div>

        {subTab === 'balancing' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />{' '}
                  {pick('Pause Rotor', 'Jeda Rotor', 'ロータ停止')}
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />{' '}
                  {pick('Spin Rotor', 'Putar Rotor', 'ロータ回転')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleNewChallenge}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {pick(
                'New Unbalance Challenge',
                'Tantangan Unbalance Baru',
                '新しい不釣合い課題'
              )}
            </button>
          </div>
        )}
      </div>

      {/* ================= SUB-TAB 1: DYNAMIC BALANCING ================= */}
      {subTab === 'balancing' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
          {/* Left Column: Rotor Disk, Polar Plot & ISO 10816 Meter */}
          <div className="space-y-4 lg:col-span-7">
            {/* ISO 10816-3 RMS Meter */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {pick(
                      'ISO 10816-3 RMS Vibration Meter',
                      'Meter Getaran RMS ISO 10816-3',
                      'ISO 10816-3 実効値振動メータ'
                    )}
                  </span>
                </div>
                {hasInitialRun ? (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      ZONE_BADGE_CLASSES[balancingSolution.activeZone]
                    }`}
                  >
                    {balancingSolution.activeZone === 'A' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {activeZoneMeta.label} ({activeVibrationMmS.toFixed(2)}{' '}
                    mm/s)
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {pick(
                      'Awaiting Initial Run',
                      'Menunggu Pengukuran Awal',
                      '初期測定待ち'
                    )}
                  </span>
                )}
              </div>

              {/* Segmented ISO Zone Bar */}
              <div className="mt-3">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="flex h-full w-full opacity-35">
                    <div className="w-[17.5%] bg-emerald-500" title="Zone A <= 1.4" />
                    <div className="w-[17.5%] bg-sky-500" title="Zone B 1.4-2.8" />
                    <div className="w-[21.25%] bg-amber-500" title="Zone C 2.8-4.5" />
                    <div className="w-[43.75%] bg-rose-500" title="Zone D > 4.5" />
                  </div>
                  {hasInitialRun && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-violet-600 transition-all duration-300 dark:bg-violet-400"
                      style={{ width: `${rmsBarPct}%` }}
                    />
                  )}
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>0.0</span>
                  <span>1.4 (Zone A)</span>
                  <span>2.8 (B)</span>
                  <span>4.5 (C)</span>
                  <span>8.0+ mm/s (D)</span>
                </div>
              </div>
            </div>

            {/* Visuals: Rotor Disk + Polar Vector Plot */}
            <div className="grid grid-cols-1 gap-4 glass-panel rounded-2xl p-4 shadow-xs sm:grid-cols-2 ">
              <div className="flex flex-col items-center">
                <div className="mb-2 flex w-full items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>
                    {pick(
                      'Rotor Disk (0°–360° Ring)',
                      'Cakram Rotor (Cincin 0°–360°)',
                      'ロータ円板 (0°–360° リング)'
                    )}
                  </span>
                  <span className="text-violet-600 dark:text-violet-400">
                    {pick('Challenge', 'Tantangan', '課題')} #{challenge.id} ·{' '}
                    {challenge.rpm} RPM
                  </span>
                </div>
                <RotorDiskSvg
                  spinAngleDeg={spinAngleDeg}
                  isPlaying={isPlaying}
                  rpm={challenge.rpm}
                  activeVibrationMmS={activeVibrationMmS}
                  heavySpotDeg={activeVector.deg}
                  hasInitialRun={hasInitialRun}
                  isTrialInstalled={isTrialInstalled}
                  trialMassG={trialMassG}
                  trialAngleDeg={trialAngleDeg}
                  isCorrectionApplied={isCorrectionApplied}
                  corrMassG={corrMassG}
                  corrAngleDeg={corrAngleDeg}
                />
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-2 flex w-full items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>
                    {pick(
                      'Polar Vibration Vector Plot',
                      'Plot Vektor Getaran Polar',
                      '極座標振動ベクトル図'
                    )}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {pick('1X Phasors', 'Fasor 1X', '1X フェーザ')}
                  </span>
                </div>
                <PolarVectorPlotSvg
                  v0={challenge.v0}
                  solution={balancingSolution}
                  hasInitialRun={hasInitialRun}
                  isTrialInstalled={isTrialInstalled}
                  isCorrectionApplied={isCorrectionApplied}
                />
              </div>
            </div>

            {/* Live 1X Time-Waveform Vibration Sine Plot */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>
                  {pick(
                    '1× Time-Waveform Vibration Sine Plot (mm/s Peak-to-Peak)',
                    'Plot Gelombang Waktu 1× Getaran (mm/s Peak-to-Peak)',
                    '1× 時間波形振動サインプロット (mm/s Peak-to-Peak)'
                  )}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'Dashed red = Initial V0 baseline · Solid = Active 1× wave',
                    'Merah putus-putus = Baseline V0 awal · Padat = Gelombang 1× aktif',
                    '赤破線 = 初期V0ベースライン · 実線 = 現在の1×波形'
                  )}
                </span>
              </div>
              <VibrationWaveformSvg
                rpm={challenge.rpm}
                spinAngleDeg={spinAngleDeg}
                v0={challenge.v0}
                activeVector={activeVector}
                hasInitialRun={hasInitialRun}
                isTrialInstalled={isTrialInstalled}
                isCorrectionApplied={isCorrectionApplied}
              />
            </div>

            {/* Vector Math Solution Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                {pick(
                  'Influence Coefficient Vector Solution',
                  'Solusi Vektor Koefisien Pengaruh',
                  '影響係数ベクトル解'
                )}
              </div>
              {!hasInitialRun ? (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {pick(
                    'Run Step 1 (Initial Run) and Step 2 (Trial Weight Run) to compute the rotor influence coefficient α and exact correction weight.',
                    'Jalankan Langkah 1 (Pengukuran Awal) dan Langkah 2 (Beban Uji) untuk menghitung koefisien pengaruh α dan beban koreksi.',
                    'ステップ1（初期運転）とステップ2（試しおもり運転）を実行して影響係数 α と修正おもりを計算してください。'
                  )}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-slate-500 dark:text-slate-400">
                      {pick('Initial V0', 'V0 Awal', '初期 V0')}
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {challenge.v0.mag.toFixed(2)} mm/s ∠{' '}
                      {challenge.v0.deg.toFixed(0)}°
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-slate-500 dark:text-slate-400">
                      {pick('Trial Run V1', 'Uji V1', '試し運転 V1')}
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-sky-600 dark:text-sky-400">
                      {isTrialInstalled || isCorrectionApplied
                        ? `${balancingSolution.v1.mag.toFixed(2)} mm/s ∠ ${balancingSolution.v1.deg.toFixed(0)}°`
                        : pick('Pending', 'Menunggu', '待機中')}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-slate-500 dark:text-slate-400">
                      {pick('Trial Effect Vt', 'Efek Uji Vt', '試し効果 Vt')}
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-400">
                      {isTrialInstalled || isCorrectionApplied
                        ? `${balancingSolution.vt.mag.toFixed(2)} mm/s ∠ ${balancingSolution.vt.deg.toFixed(0)}°`
                        : pick('Pending', 'Menunggu', '待機中')}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-slate-500 dark:text-slate-400">
                      {pick(
                        'Required Correction',
                        'Koreksi Dibutuhkan',
                        '必要修正量'
                      )}
                    </div>
                    <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {isTrialInstalled || isCorrectionApplied
                        ? `${balancingSolution.mcMag.toFixed(1)} g @ ${balancingSolution.mcDeg.toFixed(0)}°`
                        : pick('Pending', 'Menunggu', '待機中')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Step-by-Step Technician Controls */}
          <div className="space-y-4 lg:col-span-5">
            {/* Step 1: Initial Run */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {pick(
                    '1. Initial Baseline Run (V0)',
                    '1. Pengukuran Awal (V0)',
                    '1. 初期ベースライン運転 (V0)'
                  )}
                </h3>
                {hasInitialRun && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {pick('Recorded', 'Tercatat', '記録済み')}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {pick(
                  'Measure baseline 1X amplitude and phase with no trial weights installed.',
                  'Ukur amplitudo dan fasa 1X awal tanpa beban uji terpasang.',
                  '試しおもりなしで初期 1X 振幅と位相を測定します。'
                )}
              </p>
              <button
                type="button"
                onClick={handleRunInitial}
                className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {hasInitialRun
                  ? pick(
                      'Re-Run Initial Baseline',
                      'Ulangi Pengukuran Awal',
                      '初期測定を再実行'
                    )
                  : pick(
                      'Run Initial Measurement (V0)',
                      'Jalankan Pengukuran Awal (V0)',
                      '初期測定を実行 (V0)'
                    )}
              </button>
            </div>

            {/* Step 2: Trial Weight */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {pick(
                    '2. Attach Trial Weight (mt @ θt)',
                    '2. Pasang Beban Uji (mt @ θt)',
                    '2. 試しおもり装着 (mt @ θt)'
                  )}
                </h3>
                {isTrialInstalled && (
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {pick('Installed', 'Terpasang', '装着中')}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick(
                        'Trial Mass (mt)',
                        'Massa Uji (mt)',
                        '試し質量 (mt)'
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {trialMassG} g
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={trialMassG}
                    onChange={(e) => setTrialMassG(Number(e.target.value))}
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick(
                        'Trial Angle (θt)',
                        'Sudut Uji (θt)',
                        '試し角度 (θt)'
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {trialAngleDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={355}
                    step={5}
                    value={trialAngleDeg}
                    onChange={(e) => setTrialAngleDeg(Number(e.target.value))}
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRunTrial}
                  className="w-full rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                >
                  {pick(
                    'Attach Trial Weight & Measure V1',
                    'Pasang Beban Uji & Ukur V1',
                    '試しおもりを付けて V1 を測定'
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: Correction Weight */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {pick(
                    '3. Install Correction Weight (mc @ θc)',
                    '3. Pasang Beban Koreksi (mc @ θc)',
                    '3. 修正おもり装着 (mc @ θc)'
                  )}
                </h3>
                {isCorrectionApplied && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {balancingSolution.reductionPct.toFixed(0)}%{' '}
                    {pick('Reduced', 'Turun', '低減')}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick(
                        'Correction Mass (mc)',
                        'Massa Koreksi (mc)',
                        '修正質量 (mc)'
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {corrMassG.toFixed(1)} g
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={80}
                    step={0.5}
                    value={corrMassG}
                    onChange={(e) => setCorrMassG(Number(e.target.value))}
                    className="mt-1 w-full accent-emerald-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick(
                        'Correction Angle (θc)',
                        'Sudut Koreksi (θc)',
                        '修正角度 (θc)'
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {corrAngleDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={359}
                    step={1}
                    value={corrAngleDeg}
                    onChange={(e) => setCorrAngleDeg(Number(e.target.value))}
                    className="mt-1 w-full accent-emerald-600"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!hasInitialRun}
                    onClick={handleFillCalculatedCorrection}
                    className="flex-1 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300"
                  >
                    {pick(
                      'Auto-Fill Solved mc, θc',
                      'Isi Otomatis mc, θc',
                      '計算値 mc, θc を入力'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCorrection}
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  >
                    {pick(
                      'Remove Trial & Balance',
                      'Lepas Uji & Seimbangkan',
                      '試し外し・釣合い実行'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: COUPLING & KEYWAY ================= */}
      {subTab === 'coupling' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
          {/* Left: Coupling Selector, Visualization & Health Banner */}
          <div className="space-y-4 lg:col-span-7">
            {/* Coupling Type Selector */}
            <div className="grid grid-cols-3 gap-2 glass-panel rounded-2xl p-2 ">
              {(['jaw', 'gear', 'grid'] as CouplingType[]).map((typeId) => {
                const spec = COUPLING_SPECS[typeId];
                const active = couplingInputs.couplingType === typeId;
                return (
                  <button
                    key={typeId}
                    type="button"
                    onClick={() =>
                      setCouplingInputs((prev) => ({
                        ...prev,
                        couplingType: typeId,
                      }))
                    }
                    className={`rounded-xl px-3 py-2 text-left transition ${
                      active
                        ? 'bg-violet-600 text-white shadow-sm dark:bg-violet-500 dark:text-slate-950'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold">{spec.shortName}</div>
                    <div
                      className={`text-[11px] ${
                        active
                          ? 'text-violet-100 dark:text-slate-900'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      Rated {spec.nominalTorqueNm} Nm
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive SVG Cross-section & Keyway Fit */}
            <div className="glass-panel rounded-2xl p-4 ">
              <CouplingInspectionSvg
                inputs={couplingInputs}
                result={inspectionResult}
                parallelMisalignmentMm={parallelMisalignmentMm}
                angularMisalignmentDeg={angularMisalignmentDeg}
              />
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                {inspectionResult.spec.summary}
              </p>
            </div>

            {/* Parallel & Angular Misalignment Tolerance Gauges */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {pick(
                    'Parallel & Angular Misalignment Tolerance Gauges',
                    'Pengukur Toleransi Misalignment Paralel & Sudut',
                    '偏心・偏角ミスアライメント許容ゲージ'
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'Jaw vs. Gear vs. Grid capacity',
                    'Kapasitas Jaw vs. Gear vs. Grid',
                    'ジョー・ギヤ・グリッド許容比較'
                  )}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick('Parallel Offset', 'Offset Paralel', '偏心量')}
                    </span>
                    <span className="font-mono font-semibold">
                      {parallelMisalignmentMm.toFixed(2)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.02}
                    value={parallelMisalignmentMm}
                    onChange={(e) =>
                      setParallelMisalignmentMm(Number(e.target.value))
                    }
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick(
                        'Angular Misalignment',
                        'Misalignment Sudut',
                        '偏角'
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {angularMisalignmentDeg.toFixed(2)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1.8}
                    step={0.05}
                    value={angularMisalignmentDeg}
                    onChange={(e) =>
                      setAngularMisalignmentDeg(Number(e.target.value))
                    }
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {(['jaw', 'gear', 'grid'] as CouplingType[]).map((typeId) => {
                  const spec = COUPLING_SPECS[typeId];
                  const isSelected = couplingInputs.couplingType === typeId;
                  const pPct = Math.min(
                    100,
                    (parallelMisalignmentMm / spec.maxParallelMisalignmentMm) *
                      100
                  );
                  const aPct = Math.min(
                    100,
                    (angularMisalignmentDeg / spec.maxAngularMisalignmentDeg) *
                      100
                  );
                  const pOver =
                    parallelMisalignmentMm > spec.maxParallelMisalignmentMm;
                  const aOver =
                    angularMisalignmentDeg > spec.maxAngularMisalignmentDeg;

                  return (
                    <div
                      key={typeId}
                      className={`rounded-xl border p-3 transition ${
                        isSelected
                          ? 'border-violet-400 bg-violet-50/70 dark:border-violet-500/60 dark:bg-violet-500/10'
                          : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                        <span>{spec.shortName}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            pOver || aOver
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          }`}
                        >
                          {pOver || aOver
                            ? pick('Exceeds', 'Melebihi', '超過')
                            : pick('Within Limit', 'Dalam Batas', '許容内')}
                        </span>
                      </div>

                      <div className="mt-2 space-y-2 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{pick('Parallel', 'Paralel', '偏心')}</span>
                            <span className="font-mono font-semibold">
                              {parallelMisalignmentMm.toFixed(2)} /{' '}
                              {spec.maxParallelMisalignmentMm.toFixed(2)} mm
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pOver
                                  ? 'bg-rose-500'
                                  : pPct > 80
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pPct}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>{pick('Angular', 'Sudut', '偏角')}</span>
                            <span className="font-mono font-semibold">
                              {angularMisalignmentDeg.toFixed(2)}° /{' '}
                              {spec.maxAngularMisalignmentDeg.toFixed(2)}°
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className={`h-full rounded-full transition-all ${
                                aOver
                                  ? 'bg-rose-500'
                                  : aPct > 80
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                              }`}
                              style={{ width: `${aPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendation Banner */}
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                inspectionResult.healthStatus === 'Healthy'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : inspectionResult.healthStatus === 'Monitor'
                    ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                    : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
              }`}
            >
              {inspectionResult.healthStatus === 'Healthy' ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
              )}
              <div>
                <div className="text-sm font-bold">
                  Inspection Status: {inspectionResult.healthStatus}
                </div>
                <p className="mt-0.5 text-xs opacity-90">
                  {inspectionResult.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Sliders & Inspection Metrics */}
          <div className="space-y-4 lg:col-span-5">
            {/* Parameter Sliders */}
            <div className="glass-panel rounded-2xl p-4 ">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Wrench className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                {pick(
                  'Operating & Fit Parameters',
                  'Parameter Operasi & Suaian',
                  '運転・嵌合パラメータ'
                )}
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick('Applied Torque', 'Torsi Kerja', '作用トルク')}
                    </span>
                    <span className="font-mono font-semibold">
                      {couplingInputs.torqueNm} Nm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={1100}
                    step={10}
                    value={couplingInputs.torqueNm}
                    onChange={(e) =>
                      setCouplingInputs((p) => ({
                        ...p,
                        torqueNm: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {pick(
                        'Keyway Clearance',
                        'Kelonggaran Alur Pasak',
                        'キー溝隙間'
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {couplingInputs.keywayClearanceMm.toFixed(2)} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.3}
                    step={0.01}
                    value={couplingInputs.keywayClearanceMm}
                    onChange={(e) =>
                      setCouplingInputs((p) => ({
                        ...p,
                        keywayClearanceMm: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>
                      {couplingInputs.couplingType === 'jaw'
                        ? pick(
                            'Elastomer Spider Wear',
                            'Keausan Spider Elastomer',
                            'エラストマスパイダ摩耗'
                          )
                        : couplingInputs.couplingType === 'gear'
                          ? pick(
                              'Gear Tooth / Lube Wear',
                              'Keausan Gigi / Pelumas',
                              '歯面・潤滑摩耗'
                            )
                          : pick(
                              'Grid / Hub Slot Wear',
                              'Keausan Grid / Slot Hub',
                              'グリッド・ハブ溝摩耗'
                            )}
                    </span>
                    <span className="font-mono font-semibold">
                      {couplingInputs.elastomerWearPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={1}
                    value={couplingInputs.elastomerWearPct}
                    onChange={(e) =>
                      setCouplingInputs((p) => ({
                        ...p,
                        elastomerWearPct: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full accent-violet-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>{pick('Shaft Ø', 'Ø Poros', '軸径 Ø')}</span>
                      <span className="font-mono font-semibold">
                        {couplingInputs.shaftDiameterMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={80}
                      step={2}
                      value={couplingInputs.shaftDiameterMm}
                      onChange={(e) =>
                        setCouplingInputs((p) => ({
                          ...p,
                          shaftDiameterMm: Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full accent-violet-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>
                        {pick('Key Length', 'Panjang Pasak', 'キー長さ')}
                      </span>
                      <span className="font-mono font-semibold">
                        {couplingInputs.keyLengthMm} mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={90}
                      step={5}
                      value={couplingInputs.keyLengthMm}
                      onChange={(e) =>
                        setCouplingInputs((p) => ({
                          ...p,
                          keyLengthMm: Number(e.target.value),
                        }))
                      }
                      className="mt-1 w-full accent-violet-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Inspection Readouts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-2xl p-3.5 ">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'Torsional Backlash',
                    'Backlash Torsi',
                    'ねじりバックラッシ'
                  )}
                </div>
                <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-slate-100">
                  {inspectionResult.torsionalBacklashDeg.toFixed(2)}°
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {inspectionResult.torsionalBacklashArcMin.toFixed(0)} arc-min ·{' '}
                  {inspectionResult.circumferentialPlayMm.toFixed(2)} mm
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-3.5 ">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'Effective Service Factor',
                    'Faktor Layanan Efektif',
                    '有効使用率 (SF)'
                  )}
                </div>
                <div
                  className={`mt-1 font-mono text-lg font-bold ${
                    inspectionResult.effectiveServiceFactor < 1.0
                      ? 'text-rose-600 dark:text-rose-400'
                      : inspectionResult.effectiveServiceFactor < 1.4
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {inspectionResult.effectiveServiceFactor.toFixed(2)} SF
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Nominal', 'Nominal', '公称')}:{' '}
                  {inspectionResult.nominalServiceFactor.toFixed(2)} SF
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-3.5 ">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'Fretting Corrosion Risk',
                    'Risiko Korosi Fretting',
                    'フレッティング摩耗リスク'
                  )}
                </div>
                <div
                  className={`mt-1 text-lg font-bold ${
                    inspectionResult.frettingRisk === 'Critical'
                      ? 'text-rose-600 dark:text-rose-400'
                      : inspectionResult.frettingRisk === 'High'
                        ? 'text-orange-600 dark:text-orange-400'
                        : inspectionResult.frettingRisk === 'Moderate'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {inspectionResult.frettingRisk}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Risk index', 'Indeks risiko', 'リスク指数')}:{' '}
                  {inspectionResult.frettingScore}/100
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-3.5 ">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'DIN 6885 Key Stress',
                    'Tegangan Pasak DIN 6885',
                    'DIN 6885 キー応力'
                  )}
                </div>
                <div className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                  τ = {inspectionResult.keyShearStressMpa.toFixed(1)} MPa
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  σc = {inspectionResult.keyCrushingStressMpa.toFixed(1)} MPa
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
