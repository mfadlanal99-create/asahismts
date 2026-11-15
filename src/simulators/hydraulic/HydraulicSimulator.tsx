import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge as GaugeIcon,
  Lock,
  Power,
  RotateCcw,
  ShieldAlert,
  Shuffle,
  Thermometer,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeOilViscosityCst,
  CYLINDER_STROKE_MM,
  solveHydraulicCircuit,
} from './hydraulicPhysics';
import {
  HYDRAULIC_FAULTS,
  type DcvPosition,
  type HydraulicFault,
  type HydraulicParams,
} from './hydraulicTypes';
import {
  HydraulicOscilloscope,
  type OscilloscopeSample,
} from './HydraulicOscilloscope';
import { HydraulicSchematic } from './HydraulicSchematic';
import { PressureGauge } from './PressureGauge';

const INITIAL_PARAMS: HydraulicParams = {
  pumpOn: true,
  pumpFlowLpm: 24,
  reliefCrackBar: 150,
  dcv: 'neutral',
  meterOutOpenPct: 100,
  loadKn: 25,
  pilotCheckValve: false,
  accumulatorEnabled: false,
  fault: 'none',
};

export function HydraulicSimulator() {
  const { pick } = useLanguage();
  const [params, setParams] = useState<HydraulicParams>(INITIAL_PARAMS);
  const [strokeNorm, setStrokeNorm] = useState<number>(0.25);
  const [filteredPressures, setFilteredPressures] = useState({ p1: 3.5, p2: 2, p3: 2 });
  const [timeSec, setTimeSec] = useState<number>(0);
  const [oilTempC, setOilTempC] = useState<number>(42);
  const [samples, setSamples] = useState<OscilloscopeSample[]>([]);

  // Maintenance Fault Diagnosis state
  const [blindMode, setBlindMode] = useState<boolean>(false);
  const [diagnosisGuess, setDiagnosisGuess] = useState<HydraulicFault>('none');
  const [diagnosisResult, setDiagnosisResult] = useState<{
    correct: boolean;
    actual: HydraulicFault;
  } | null>(null);

  const paramsRef = useRef(params);
  const strokeRef = useRef(strokeNorm);
  const tempRef = useRef(oilTempC);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    strokeRef.current = strokeNorm;
  }, [strokeNorm]);

  useEffect(() => {
    tempRef.current = oilTempC;
  }, [oilTempC]);

  const filteredRef = useRef({ p1: 3.5, p2: 2, p3: 2 });
  const prevTargetP1Ref = useRef(3.5);
  const surgeSpikeRef = useRef(0);
  const lastSampleTimeRef = useRef(0);

  useEffect(() => {
    let rafId = 0;
    let lastTs = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      const t = now / 1000;
      setTimeSec(t);

      const curParams = paramsRef.current;
      const curStroke = strokeRef.current;
      const tel = solveHydraulicCircuit(curParams, curStroke, t);

      if (Math.abs(tel.velocityMmS) > 0.01) {
        const nextStroke = Math.max(
          0,
          Math.min(1, curStroke + (tel.velocityMmS * dt) / CYLINDER_STROKE_MM),
        );
        strokeRef.current = nextStroke;
        setStrokeNorm(nextStroke);
      }

      // Accumulator surge damping vs undamped water-hammer overshoot
      const jump = tel.p1PumpBar - prevTargetP1Ref.current;
      prevTargetP1Ref.current = tel.p1PumpBar;
      if (!curParams.accumulatorEnabled && jump > 18) {
        surgeSpikeRef.current = Math.min(45, surgeSpikeRef.current + jump * 0.25);
      }
      surgeSpikeRef.current *= Math.exp(-dt * 5.5);

      const tau = curParams.accumulatorEnabled ? 0.45 : 0.04;
      const blend = 1 - Math.exp(-dt / tau);
      const targetP1 = tel.p1PumpBar + (curParams.accumulatorEnabled ? 0 : surgeSpikeRef.current);
      const targetP2 = tel.p2CapBar + (curParams.accumulatorEnabled ? 0 : surgeSpikeRef.current * 0.7);
      const targetP3 = tel.p3RodBar;

      filteredRef.current = {
        p1: filteredRef.current.p1 + (targetP1 - filteredRef.current.p1) * blend,
        p2: filteredRef.current.p2 + (targetP2 - filteredRef.current.p2) * blend,
        p3: filteredRef.current.p3 + (targetP3 - filteredRef.current.p3) * blend,
      };
      setFilteredPressures(filteredRef.current);

      // Record oscilloscope samples at ~15 Hz over a 15-second rolling window
      if (t - lastSampleTimeRef.current >= 0.065) {
        lastSampleTimeRef.current = t;
        const fp = filteredRef.current;
        setSamples((prev) => {
          const cutoff = t - 15.2;
          const next = prev.filter((s) => s.t >= cutoff);
          next.push({
            t,
            p1: fp.p1,
            p2: fp.p2,
            p3: fp.p3,
            vel: tel.velocityMmS,
          });
          return next;
        });
      }

      // Thermal balance: relief heat loss warms oil; tank cooler pulls toward 40 °C
      const heatRateCPerSec = tel.reliefHeatLossKw * 0.42;
      const coolRateCPerSec = (tempRef.current - 40) * 0.045;
      const nextTemp = Math.max(
        30,
        Math.min(88, tempRef.current + (heatRateCPerSec - coolRateCPerSec) * dt),
      );
      tempRef.current = nextTemp;
      setOilTempC(nextTemp);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const baseTelemetry = useMemo(
    () => solveHydraulicCircuit(params, strokeNorm, timeSec),
    [params, strokeNorm, timeSec],
  );

  // Sync displayed pressures 1:1 across Schematic, Gauges, and Oscilloscope
  const telemetry = useMemo(
    () => ({
      ...baseTelemetry,
      p1PumpBar: filteredPressures.p1,
      p2CapBar: filteredPressures.p2,
      p3RodBar: filteredPressures.p3,
    }),
    [baseTelemetry, filteredPressures],
  );

  const updateParam = <K extends keyof HydraulicParams>(
    key: K,
    value: HydraulicParams[K],
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const startBlindChallenge = () => {
    const faultPool: HydraulicFault[] = [
      'relief-stuck-open',
      'cylinder-seal-bypass',
      'suction-cavitation',
    ];
    const picked = faultPool[Math.floor(Math.random() * faultPool.length)];
    setBlindMode(true);
    setDiagnosisResult(null);
    setDiagnosisGuess('relief-stuck-open');
    setParams((prev) => ({ ...prev, pumpOn: true, fault: picked }));
  };

  const exitBlindChallenge = () => {
    setBlindMode(false);
    setDiagnosisResult(null);
    setParams((prev) => ({ ...prev, fault: 'none' }));
  };

  const submitDiagnosis = () => {
    setDiagnosisResult({
      correct: diagnosisGuess === params.fault,
      actual: params.fault,
    });
  };

  const resetAll = () => {
    setBlindMode(false);
    setDiagnosisResult(null);
    setParams(INITIAL_PARAMS);
    strokeRef.current = 0.25;
    setStrokeNorm(0.25);
    tempRef.current = 42;
    setOilTempC(42);
  };

  const viscosityCst = computeOilViscosityCst(oilTempC);
  const isOverheating = oilTempC > 65;
  const actualFaultInfo = HYDRAULIC_FAULTS.find((f) => f.id === params.fault)!;

  return (
    <div className="space-y-5">
      {/* Top Status & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl px-4 py-3 ">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              !params.pumpOn
                ? 'bg-slate-400'
                : telemetry.isCavitating || telemetry.isStalled
                  ? 'animate-pulse bg-red-500'
                  : telemetry.reliefOpen
                    ? 'animate-pulse bg-amber-500'
                    : 'bg-emerald-500'
            }`}
          />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {telemetry.statusText}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateParam('pumpOn', !params.pumpOn)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              params.pumpOn
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950'
                : 'border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {params.pumpOn
              ? pick('HPU Running', 'HPU Berjalan', 'HPU 運転中')
              : pick('HPU Stopped', 'HPU Berhenti', 'HPU 停止')}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset Lab', 'Reset Lab', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Grid: Schematic + Gauges + Oscilloscope (7) | Controls + Faults + Thermal (5) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left 7 cols: Schematic + Gauges + Oscilloscope */}
        <div className="space-y-4 lg:col-span-7">
          <HydraulicSchematic
            params={params}
            telemetry={telemetry}
            strokeNorm={strokeNorm}
            oilTempC={oilTempC}
            onChangeDcv={(dcv) => updateParam('dcv', dcv)}
          />

          {/* Three Live Pressure Gauges */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PressureGauge
              label={pick('P1 — Pump', 'P1 — Pompa', 'P1 — ポンプ')}
              sublabel={pick('System Supply', 'Suplai Sistem', 'システム供給')}
              pressureBar={telemetry.p1PumpBar}
              limitBar={
                params.fault === 'relief-stuck-open' ? 11 : params.reliefCrackBar
              }
              warning={telemetry.isCavitating || telemetry.reliefOpen}
            />
            <PressureGauge
              label={pick('P2 — Cap End', 'P2 — Sisi Cap', 'P2 — キャップ側')}
              sublabel={pick('Extend Chamber', 'Ruang Maju', '伸び側圧力室')}
              pressureBar={telemetry.p2CapBar}
              warning={params.fault === 'cylinder-seal-bypass' && params.pumpOn}
            />
            <PressureGauge
              label={pick('P3 — Rod End', 'P3 — Sisi Rod', 'P3 — ロッド側')}
              sublabel={pick('Annulus / Meter-Out', 'Anulus / Meter-Out', '環状側 / メータアウト')}
              pressureBar={telemetry.p3RodBar}
              warning={params.fault === 'cylinder-seal-bypass' && params.pumpOn}
            />
          </div>

          {/* 15-Second Pressure & Velocity Oscilloscope Strip Chart */}
          <HydraulicOscilloscope
            samples={samples}
            nowSec={timeSec}
            reliefCrackBar={
              params.fault === 'relief-stuck-open' ? 11 : params.reliefCrackBar
            }
            accumulatorEnabled={params.accumulatorEnabled}
          />
        </div>

        {/* Right 5 cols: Circuit Controls, Fault Injection & Thermal Telemetry */}
        <div className="space-y-4 lg:col-span-5">
          {/* DCV & Circuit Parameters */}
          <div className="glass-panel rounded-2xl p-4 ">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {pick('Circuit Controls', 'Kontrol Sirkuit', '回路コントロール')}
            </h2>

            {/* 4/3 DCV Selector */}
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {pick(
                  '4/3 Directional Control Valve',
                  'Katup Arah 4/3 (DCV)',
                  '4/3 方向切換弁 (DCV)',
                )}
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(['extend', 'neutral', 'retract'] as DcvPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateParam('dcv', pos)}
                    className={`rounded-lg py-2 text-xs font-semibold capitalize transition ${
                      params.dcv === pos
                        ? 'bg-amber-500 text-white shadow-xs dark:text-slate-950'
                        : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {pos === 'extend'
                      ? pick('Extend', 'Maju', '伸び (Extend)')
                      : pos === 'neutral'
                        ? pick('Neutral', 'Netral', '中立 (Center)')
                        : pick('Retract', 'Mundur', '戻り (Retract)')}
                  </button>
                ))}
              </div>
            </div>

            {/* Load-Holding Pilot Check Valve Toggle */}
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Lock
                  className={`h-4 w-4 ${
                    params.pilotCheckValve ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {pick(
                      'Load-Holding Pilot Check',
                      'Pilot Check Penahan Beban',
                      '負荷保持パイロットチェック弁',
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {pick(
                      'Prevents spool drift in Neutral',
                      'Mencegah silinder melorot di Netral',
                      '中立時のスプール漏れ降下を防止',
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={params.pilotCheckValve}
                onClick={() => updateParam('pilotCheckValve', !params.pilotCheckValve)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  params.pilotCheckValve
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                    params.pilotCheckValve ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Bladder Accumulator Surge Damping Toggle */}
            <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <GaugeIcon
                  className={`h-4 w-4 ${
                    params.accumulatorEnabled ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {pick(
                      'N₂ Accumulator Surge Damping',
                      'Peredam Lonjakan Akumulator N₂',
                      'N₂ アキュムレータサージ減衰',
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {pick(
                      'Smooths dead-head & DCV pressure spikes',
                      'Meredam lonjakan tekanan dead-head & DCV',
                      'デッドヘッドやDCV切換時の圧力スパイクを平滑化',
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={params.accumulatorEnabled}
                onClick={() =>
                  updateParam('accumulatorEnabled', !params.accumulatorEnabled)
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  params.accumulatorEnabled
                    ? 'bg-emerald-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition ${
                    params.accumulatorEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Relief Valve Cracking Pressure */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pick(
                    'Relief Cracking Pressure',
                    'Tekanan Cracking Relief',
                    'リリーフ設定圧力',
                  )}
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {params.reliefCrackBar} bar
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={210}
                step={5}
                value={params.reliefCrackBar}
                onChange={(e) =>
                  updateParam('reliefCrackBar', Number(e.target.value))
                }
                className="mt-1.5 w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20 bar</span>
                <span>210 bar</span>
              </div>
            </div>

            {/* External Load */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pick(
                    'External Cylinder Load',
                    'Beban Eksternal Silinder',
                    'シリンダ外部負荷',
                  )}
                </span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                  {params.loadKn} kN
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                step={2}
                value={params.loadKn}
                onChange={(e) => updateParam('loadKn', Number(e.target.value))}
                className="mt-1.5 w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{pick('0 kN (No Load)', '0 kN (Tanpa Beban)', '0 kN (無負荷)')}</span>
                <span>80 kN</span>
              </div>
            </div>

            {/* Meter-Out Flow Control */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pick(
                    'Meter-Out Needle Valve',
                    'Katup Jarum Meter-Out',
                    'メータアウト絞り弁',
                  )}
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {params.meterOutOpenPct}% {pick('open', 'buka', '開')}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={params.meterOutOpenPct}
                onChange={(e) =>
                  updateParam('meterOutOpenPct', Number(e.target.value))
                }
                className="mt-1.5 w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{pick('10% (Throttled)', '10% (Terdrossel)', '10% (絞り)')}</span>
                <span>{pick('100% (Full)', '100% (Penuh)', '100% (全開)')}</span>
              </div>
            </div>

            {/* Pump Flow */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pick(
                    'Pump Displacement Flow',
                    'Debit Pompa Perpindahan',
                    'ポンプ吐出流量',
                  )}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  {params.pumpFlowLpm} L/min
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={2}
                value={params.pumpFlowLpm}
                onChange={(e) =>
                  updateParam('pumpFlowLpm', Number(e.target.value))
                }
                className="mt-1.5 w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Maintenance Fault Injection Panel */}
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {pick(
                    'Maintenance Fault Injection',
                    'Injeksi Gangguan Perawatan',
                    '保守故障シミュレーション',
                  )}
                </h2>
              </div>
              {!blindMode ? (
                <button
                  type="button"
                  onClick={startBlindChallenge}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
                >
                  <Shuffle className="h-3 w-3" />
                  {pick('Blind Test', 'Uji Buta', 'ブラインド診断')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exitBlindChallenge}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  {pick('Exit Test', 'Keluar Uji', '診断終了')}
                </button>
              )}
            </div>

            {!blindMode ? (
              <div className="mt-3 space-y-2">
                {HYDRAULIC_FAULTS.map((f) => {
                  const active = params.fault === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateParam('fault', f.id)}
                      className={`w-full rounded-xl border p-2.5 text-left transition ${
                        active
                          ? f.id === 'none'
                            ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                            : 'border-red-300 bg-red-50/70 dark:border-red-500/40 dark:bg-red-500/10'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                        <span>{f.label}</span>
                        {active && f.id !== 'none' && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </div>
                      {active && (
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          {f.symptomSummary}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    Hidden Fault Active
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    Shift the DCV, vary the load, and observe P1, P2, P3 and
                    actuator speed to diagnose the fault.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Your Diagnosis:
                  </label>
                  {HYDRAULIC_FAULTS.filter((f) => f.id !== 'none').map((f) => (
                    <label
                      key={f.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/70"
                    >
                      <input
                        type="radio"
                        name="blind-diagnosis"
                        checked={diagnosisGuess === f.id}
                        onChange={() => setDiagnosisGuess(f.id)}
                        className="accent-amber-500"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submitDiagnosis}
                  className="w-full rounded-xl bg-amber-500 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-600 dark:text-slate-950"
                >
                  Verify Diagnosis
                </button>

                {diagnosisResult && (
                  <div
                    className={`rounded-xl border p-3 text-xs ${
                      diagnosisResult.correct
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                        : 'border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {diagnosisResult.correct ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      {diagnosisResult.correct
                        ? 'Correct Diagnosis!'
                        : `Incorrect — Actual Fault: ${actualFaultInfo.label}`}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {actualFaultInfo.rootCause}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thermal & Efficiency Telemetry (Right Column) */}
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Thermometer
                  className={`h-4 w-4 ${
                    isOverheating ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  {pick(
                    'Thermal & Efficiency (ISO VG 46)',
                    'Termal & Efisiensi (ISO VG 46)',
                    '熱・効率テレメトリ（ISO VG 46）',
                  )}
                </h3>
              </div>
              {isOverheating && (
                <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700 dark:bg-red-500/20 dark:text-red-300">
                  <Flame className="h-3 w-3" />
                  {pick('OVERHEATING (> 65 °C)', 'PANAS BERLEBIH (> 65 °C)', '過熱警告 (> 65 °C)')}
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Relief Heat Loss', 'Rugi Panas Relief', 'リリーフ熱損失')}
                </div>
                <div
                  className={`mt-0.5 font-mono text-base font-bold ${
                    telemetry.reliefHeatLossKw > 1
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {telemetry.reliefHeatLossKw.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">kW</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Oil Temperature', 'Suhu Oli', '作動油温度')}
                </div>
                <div
                  className={`mt-0.5 font-mono text-base font-bold ${
                    isOverheating
                      ? 'text-red-600 dark:text-red-400'
                      : oilTempC > 55
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {oilTempC.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-500">°C</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('Oil Viscosity', 'Viskositas Oli', '動粘度')}
                </div>
                <div className="mt-0.5 font-mono text-base font-bold text-slate-900 dark:text-white">
                  {viscosityCst.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-500">cSt</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pick('System Efficiency', 'Efisiensi Sistem', 'システム効率')}
                </div>
                <div
                  className={`mt-0.5 font-mono text-base font-bold ${
                    telemetry.systemEfficiencyPct >= 60
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : telemetry.systemEfficiencyPct > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {telemetry.systemEfficiencyPct.toFixed(0)}{' '}
                  <span className="text-xs font-normal text-slate-500">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Live Power / Flow / Force Readouts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {pick('Hydraulic Power', 'Daya Hidrolik', '油圧動力')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
            {telemetry.hydraulicPowerKw.toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-500">kW</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {pick('Actuator Flow', 'Debit Aktuator', 'アクチュエータ流量')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
            {telemetry.qActuatorLpm.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">L/min</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {pick('Relief Bypass', 'Bypass Relief', 'リリーフバイパス')}
          </div>
          <div
            className={`mt-1 font-mono text-lg font-bold ${
              telemetry.qReliefLpm > 0.5
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {telemetry.qReliefLpm.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">L/min</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {pick('Cylinder Speed', 'Kecepatan Silinder', 'シリンダ速度')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
            {telemetry.velocityMmS.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">mm/s</span>
          </div>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-3 sm:col-span-1 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {pick('Net Force', 'Gaya Netto', '正味推力')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
            {telemetry.netForceKn.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500">kN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
