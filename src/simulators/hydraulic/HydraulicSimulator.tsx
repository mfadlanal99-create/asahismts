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
      <div data-tour="hydraulic-status" className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-2.5 w-2.5 rounded-full ${
              !params.pumpOn
                ? 'bg-[var(--md-outline)]'
                : telemetry.isCavitating || telemetry.isStalled
                  ? 'animate-pulse bg-red-500'
                  : telemetry.reliefOpen
                    ? 'animate-pulse bg-amber-500'
                    : 'bg-emerald-500'
            }`}
          />
          <span className="text-sm font-semibold text-[var(--md-on-surface)]">
            {telemetry.statusText}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateParam('pumpOn', !params.pumpOn)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              params.pumpOn
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950'
                : 'glass-pill'
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
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
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
          <div data-tour="hydraulic-gauges" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          <div className="glass-panel rounded-[28px] p-4 sm:p-5">
            <h2 className="text-sm font-bold text-[var(--md-on-surface)]">
              {pick('Circuit Controls', 'Kontrol Sirkuit', '回路コントロール')}
            </h2>

            {/* 4/3 DCV Selector */}
            <div data-tour="hydraulic-dcv" className="mt-3">
              <label className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                {pick(
                  '4/3 Directional Control Valve',
                  'Katup Arah 4/3 (DCV)',
                  '4/3 方向切換弁 (DCV)',
                )}
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                {(['extend', 'neutral', 'retract'] as DcvPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateParam('dcv', pos)}
                    className={`rounded-full py-2 text-xs capitalize transition ${
                      params.dcv === pos
                        ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
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
            <div className="mt-4 flex items-center justify-between gap-3 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center gap-2.5">
                <Lock
                  className={`h-4 w-4 ${
                    params.pilotCheckValve
                      ? 'text-[var(--md-primary)]'
                      : 'text-[var(--md-on-surface-variant)]'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--md-on-surface)]">
                    {pick(
                      'Load-Holding Pilot Check',
                      'Pilot Check Penahan Beban',
                      '負荷保持パイロットチェック弁',
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--md-on-surface-variant)]">
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
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                  params.pilotCheckValve
                    ? 'border-transparent bg-[var(--md-primary)]'
                    : 'border-[var(--md-outline)]/60 bg-[var(--md-surface-container-highest)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs transition ${
                    params.pilotCheckValve
                      ? 'translate-x-4 bg-[var(--md-on-primary)]'
                      : 'translate-x-0 bg-[var(--md-outline)]'
                  }`}
                />
              </button>
            </div>

            {/* Bladder Accumulator Surge Damping Toggle */}
            <div className="mt-2.5 flex items-center justify-between gap-3 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center gap-2.5">
                <GaugeIcon
                  className={`h-4 w-4 ${
                    params.accumulatorEnabled
                      ? 'text-[var(--md-primary)]'
                      : 'text-[var(--md-on-surface-variant)]'
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--md-on-surface)]">
                    {pick(
                      'N₂ Accumulator Surge Damping',
                      'Peredam Lonjakan Akumulator N₂',
                      'N₂ アキュムレータサージ減衰',
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--md-on-surface-variant)]">
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
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
                  params.accumulatorEnabled
                    ? 'border-transparent bg-[var(--md-primary)]'
                    : 'border-[var(--md-outline)]/60 bg-[var(--md-surface-container-highest)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs transition ${
                    params.accumulatorEnabled
                      ? 'translate-x-4 bg-[var(--md-on-primary)]'
                      : 'translate-x-0 bg-[var(--md-outline)]'
                  }`}
                />
              </button>
            </div>

            {/* Relief Valve Cracking Pressure */}
            <div data-tour="hydraulic-relief" className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick(
                    'Relief Cracking Pressure',
                    'Tekanan Cracking Relief',
                    'リリーフ設定圧力',
                  )}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="mt-1.5 w-full"
              />
              <div className="flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                <span>20 bar</span>
                <span>210 bar</span>
              </div>
            </div>

            {/* External Load */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick(
                    'External Cylinder Load',
                    'Beban Eksternal Silinder',
                    'シリンダ外部負荷',
                  )}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="mt-1.5 w-full"
              />
              <div className="flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                <span>{pick('0 kN (No Load)', '0 kN (Tanpa Beban)', '0 kN (無負荷)')}</span>
                <span>80 kN</span>
              </div>
            </div>

            {/* Meter-Out Flow Control */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick(
                    'Meter-Out Needle Valve',
                    'Katup Jarum Meter-Out',
                    'メータアウト絞り弁',
                  )}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="mt-1.5 w-full"
              />
              <div className="flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                <span>{pick('10% (Throttled)', '10% (Tercekik)', '10% (絞り)')}</span>
                <span>{pick('100% (Full)', '100% (Penuh)', '100% (全開)')}</span>
              </div>
            </div>

            {/* Pump Flow */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick(
                    'Pump Displacement Flow',
                    'Debit Pompa Perpindahan',
                    'ポンプ吐出流量',
                  )}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="mt-1.5 w-full"
              />
            </div>
          </div>

          {/* Maintenance Fault Injection Panel */}
          <div data-tour="hydraulic-faults" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
                <h2 className="text-sm font-bold text-[var(--md-on-surface)]">
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
                  className="m3-btn-tonal inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold"
                >
                  <Shuffle className="h-3 w-3" />
                  {pick('Blind Test', 'Uji Buta', 'ブラインド診断')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={exitBlindChallenge}
                  className="glass-pill rounded-full px-3 py-1.5 text-[11px] font-semibold"
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
                      className={`w-full rounded-[20px] border p-3 text-left transition ${
                        active
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>{f.label}</span>
                        {active && f.id !== 'none' && (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                        )}
                      </div>
                      {active && (
                        <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                          {f.symptomSummary}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-[20px] border border-amber-300/60 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
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
                  <label className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                    Select Your Diagnosis:
                  </label>
                  {HYDRAULIC_FAULTS.filter((f) => f.id !== 'none').map((f) => (
                    <label
                      key={f.id}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2 text-xs font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]"
                    >
                      <input
                        type="radio"
                        name="blind-diagnosis"
                        checked={diagnosisGuess === f.id}
                        onChange={() => setDiagnosisGuess(f.id)}
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submitDiagnosis}
                  className="m3-btn-filled w-full py-2.5 text-xs font-bold"
                >
                  Verify Diagnosis
                </button>

                {diagnosisResult && (
                  <div
                    className={`rounded-[20px] border p-3 text-xs ${
                      diagnosisResult.correct
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {diagnosisResult.correct ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
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
          <div data-tour="hydraulic-thermal" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Thermometer
                  className={`h-4 w-4 ${
                    isOverheating ? 'text-rose-500' : 'text-[var(--md-primary)]'
                  }`}
                />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick(
                    'Thermal & Efficiency (ISO VG 46)',
                    'Termal & Efisiensi (ISO VG 46)',
                    '熱・効率テレメトリ（ISO VG 46）',
                  )}
                </h3>
              </div>
              {isOverheating && (
                <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                  <Flame className="h-3 w-3" />
                  {pick('OVERHEATING (> 65 °C)', 'PANAS BERLEBIH (> 65 °C)', '過熱警告 (> 65 °C)')}
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Relief Heat Loss', 'Rugi Panas Relief', 'リリーフ熱損失')}
                </div>
                <div
                  className={`mt-0.5 font-mono text-base font-bold ${
                    telemetry.reliefHeatLossKw > 1
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--md-on-surface)]'
                  }`}
                >
                  {telemetry.reliefHeatLossKw.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">kW</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Oil Temperature', 'Suhu Oli', '作動油温度')}
                </div>
                <div
                  className={`mt-0.5 font-mono text-base font-bold ${
                    isOverheating
                      ? 'text-rose-600 dark:text-rose-400'
                      : oilTempC > 55
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-[var(--md-on-surface)]'
                  }`}
                >
                  {oilTempC.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">°C</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Oil Viscosity', 'Viskositas Oli', '動粘度')}
                </div>
                <div className="mt-0.5 font-mono text-base font-bold text-[var(--md-on-surface)]">
                  {viscosityCst.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">cSt</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('System Efficiency', 'Efisiensi Sistem', 'システム効率')}
                </div>
                <div
                  className={`mt-0.5 font-mono text-base font-bold ${
                    telemetry.systemEfficiencyPct >= 60
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : telemetry.systemEfficiencyPct > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  {telemetry.systemEfficiencyPct.toFixed(0)}{' '}
                  <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Live Power / Flow / Force Readouts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick('Hydraulic Power', 'Daya Hidrolik', '油圧動力')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
            {telemetry.hydraulicPowerKw.toFixed(2)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">kW</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick('Actuator Flow', 'Debit Aktuator', 'アクチュエータ流量')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--md-primary)]">
            {telemetry.qActuatorLpm.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">L/min</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick('Relief Bypass', 'Bypass Relief', 'リリーフバイパス')}
          </div>
          <div
            className={`mt-1 font-mono text-lg font-bold ${
              telemetry.qReliefLpm > 0.5
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-[var(--md-on-surface)]'
            }`}
          >
            {telemetry.qReliefLpm.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">L/min</span>
          </div>
        </div>

        <div className="glass-card rounded-[24px] p-3.5">
          <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick('Cylinder Speed', 'Kecepatan Silinder', 'シリンダ速度')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
            {telemetry.velocityMmS.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">mm/s</span>
          </div>
        </div>

        <div className="glass-card col-span-2 rounded-[24px] p-3.5 sm:col-span-1">
          <div className="text-[11px] font-medium text-[var(--md-on-surface-variant)]">
            {pick('Net Force', 'Gaya Netto', '正味推力')}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-[var(--md-on-surface)]">
            {telemetry.netForceKn.toFixed(1)}{' '}
            <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">kN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
