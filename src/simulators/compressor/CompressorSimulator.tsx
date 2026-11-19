import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Droplets,
  EyeOff,
  Gauge,
  HelpCircle,
  Percent,
  RotateCcw,
  Thermometer,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  COMPRESSOR_PRESETS,
  FAULT_DIAGNOSIS_OPTIONS,
  solveCompressorSystem,
  type CompressorDynamicState,
  type CompressorFaultId,
  type CompressorParams,
} from './compressorPhysics';
import { CompressorAnalytics, type PressureSample } from './CompressorAnalytics';
import { CompressorSkidSvg, type SkidAnimPhases } from './CompressorSkidSvg';

const DEFAULT_PARAMS: CompressorParams = COMPRESSOR_PRESETS[0].params;

const INITIAL_DYNAMIC: CompressorDynamicState = {
  receiverPressureBar: 7.15,
  isLoaded: true,
  condensateLevelPct: 14,
  highTempTrip: false,
};

export function CompressorSimulator() {
  const { pick } = useLanguage();
  const [params, setParams] = useState<CompressorParams>(DEFAULT_PARAMS);
  const [activePresetId, setActivePresetId] = useState<string>(COMPRESSOR_PRESETS[0].id);
  const [dyn, setDyn] = useState<CompressorDynamicState>(INITIAL_DYNAMIC);
  const [animPhases, setAnimPhases] = useState<SkidAnimPhases>({
    maleDeg: 0,
    fanDeg: 0,
    flowOffset: 0,
  });
  const [pressureHistory, setPressureHistory] = useState<PressureSample[]>([
    { p: INITIAL_DYNAMIC.receiverPressureBar, loaded: INITIAL_DYNAMIC.isLoaded },
  ]);

  const animStateRef = useRef({
    isLoaded: INITIAL_DYNAMIC.isLoaded,
    highTempTrip: false,
  });

  // Blind Diagnosis Mode state
  const [blindMode, setBlindMode] = useState(false);
  const [mysteryFault, setMysteryFault] = useState<Exclude<CompressorFaultId, 'none'>>('clogged-filter');
  const [selectedGuess, setSelectedGuess] = useState<Exclude<CompressorFaultId, 'none'> | ''>('');
  const [diagnosisResult, setDiagnosisResult] = useState<'correct' | 'incorrect' | null>(null);

  const sol = useMemo(() => solveCompressorSystem(params, dyn), [params, dyn]);

  useEffect(() => {
    animStateRef.current = {
      isLoaded: dyn.isLoaded,
      highTempTrip: sol.highTempTrip,
    };
  }, [dyn.isLoaded, sol.highTempTrip]);

  // 60fps continuous phase integration for 4:6 screw rotors, fan & airflow (zero jumps)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const { isLoaded, highTempTrip } = animStateRef.current;
      const rotorSpeed = highTempTrip ? 0 : isLoaded ? 220 : 48; // deg/s
      const fanSpeed = highTempTrip ? 25 : isLoaded ? 320 : 120; // deg/s
      const flowSpeed = highTempTrip ? 0 : isLoaded ? 68 : 16; // px/s

      setAnimPhases((prev) => ({
        maleDeg: (prev.maleDeg + rotorSpeed * dt) % 1080,
        fanDeg: (prev.fanDeg + fanSpeed * dt) % 360,
        flowOffset: (prev.flowOffset + flowSpeed * dt) % 24,
      }));
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Live receiver pressure cycling & condensate accumulation loop
  useEffect(() => {
    const id = window.setInterval(() => {
      setDyn((prev) => {
        const snapshot = solveCompressorSystem(params, prev);
        let nextLoaded = prev.isLoaded;
        if (snapshot.highTempTrip) {
          nextLoaded = false;
        } else if (prev.receiverPressureBar <= params.loadPressureBar) {
          nextLoaded = true;
        } else if (prev.receiverPressureBar >= params.unloadPressureBar) {
          nextLoaded = false;
        }

        const supplyFlow = nextLoaded && !snapshot.highTempTrip ? snapshot.actualFadM3Min : 0;
        const netFlow = supplyFlow - snapshot.totalDemandM3Min;
        // Receiver volume scaling for smooth visual cycling
        let nextPressure = prev.receiverPressureBar + netFlow * 0.012;
        nextPressure = Math.max(3.5, Math.min(10.5, nextPressure));

        let nextCond = prev.condensateLevelPct;
        if (params.autoDrainEnabled) {
          nextCond = Math.max(10, prev.condensateLevelPct - 3.5);
        } else {
          nextCond = Math.min(100, prev.condensateLevelPct + (nextLoaded ? 1.8 : 0.6));
        }

        const nextState: CompressorDynamicState = {
          receiverPressureBar: nextPressure,
          isLoaded: nextLoaded,
          condensateLevelPct: nextCond,
          highTempTrip: snapshot.highTempTrip,
        };
        setPressureHistory((hist) => [
          ...hist.slice(-99),
          { p: nextPressure, loaded: nextLoaded },
        ]);
        return nextState;
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [params]);

  const updateParam = <K extends keyof CompressorParams>(
    key: K,
    value: CompressorParams[K]
  ) => {
    setActivePresetId('');
    setParams((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'loadPressureBar' && next.unloadPressureBar < next.loadPressureBar + 0.3) {
        next.unloadPressureBar = Math.min(9.5, Number((next.loadPressureBar + 0.4).toFixed(1)));
      }
      if (key === 'unloadPressureBar' && next.loadPressureBar > next.unloadPressureBar - 0.3) {
        next.loadPressureBar = Math.max(5.5, Number((next.unloadPressureBar - 0.4).toFixed(1)));
      }
      return next;
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = COMPRESSOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setBlindMode(false);
    setDiagnosisResult(null);
    setSelectedGuess('');
    setActivePresetId(preset.id);
    setParams({ ...preset.params });
    setDyn({
      receiverPressureBar: (preset.params.loadPressureBar + preset.params.unloadPressureBar) / 2,
      isLoaded: true,
      condensateLevelPct: preset.params.autoDrainEnabled ? 14 : 92,
      highTempTrip: false,
    });
  };

  const startBlindDiagnosis = () => {
    const faultPresets = COMPRESSOR_PRESETS.filter((p) => p.faultId !== 'none');
    const chosen = faultPresets[Math.floor(Math.random() * faultPresets.length)];
    setBlindMode(true);
    setActivePresetId('');
    setMysteryFault(chosen.faultId as Exclude<CompressorFaultId, 'none'>);
    setSelectedGuess('');
    setDiagnosisResult(null);
    setParams({ ...chosen.params });
    setDyn({
      receiverPressureBar: (chosen.params.loadPressureBar + chosen.params.unloadPressureBar) / 2,
      isLoaded: true,
      condensateLevelPct: chosen.params.autoDrainEnabled ? 14 : 92,
      highTempTrip: false,
    });
  };

  const submitDiagnosis = () => {
    if (!selectedGuess) return;
    setDiagnosisResult(selectedGuess === mysteryFault ? 'correct' : 'incorrect');
  };

  const resetAll = () => {
    applyPreset(COMPRESSOR_PRESETS[0].id);
  };

  return (
    <div className="space-y-4">
      {/* Top Scenario & Blind Diagnosis Bar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-[28px] p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
          </span>
          {COMPRESSOR_PRESETS.map((preset) => {
            const active = !blindMode && activePresetId === preset.id;
            const presetLabel =
              preset.id === 'optimal'
                ? pick('Optimal Baseline', 'Baseline Optimal', '正常ベースライン')
                : preset.id === 'clogged-filter'
                  ? pick('Clogged Intake Filter', 'Filter Hisap Tersumbat', '吸込フィルタ目詰まり')
                  : preset.id === 'fouled-cooler'
                    ? pick('Fouled Intercooler', 'Intercooler Kotor', 'インタークーラ汚れ')
                    : preset.id === 'failed-drain'
                      ? pick('Failed Condensate Drain', 'Auto-Drain Gagal', 'オートドレン故障')
                      : pick('Excessive Plant Leaks', 'Kebocoran Berlebih', '過大エア漏れ');
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                title={preset.description}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  active
                    ? 'm3-btn-filled font-bold'
                    : 'glass-pill font-semibold text-[var(--md-on-surface-variant)]'
                }`}
              >
                {presetLabel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startBlindDiagnosis}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
              blindMode
                ? 'm3-btn-filled font-bold'
                : 'm3-btn-tonal font-semibold'
            }`}
          >
            <EyeOff className="h-3.5 w-3.5" />
            {pick('Blind Diagnosis', 'Diagnosis Buta', 'ブラインド診断')}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Diagnostic Banner or Blind Diagnosis Challenge */}
      {blindMode ? (
        <div className="glass-panel rounded-[28px] border-[var(--md-primary)]/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--md-primary)]" />
              <div>
                <div className="text-sm font-bold text-[var(--md-on-surface)]">
                  Blind Fault Diagnosis Active
                </div>
                <p className="mt-0.5 text-xs text-[var(--md-on-surface-variant)]">
                  A fault has been injected and fault-control sliders are masked. Inspect the live
                  gauges, temperatures, Pressure Dew Point, and skid schematic to identify the root cause.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {FAULT_DIAGNOSIS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedGuess(opt.id);
                  setDiagnosisResult(null);
                }}
                className={`rounded-[20px] border p-3 text-left text-xs transition-all ${
                  selectedGuess === opt.id
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!selectedGuess}
              onClick={submitDiagnosis}
              className="m3-btn-filled px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              Submit Diagnosis
            </button>

            {diagnosisResult === 'correct' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Correct! Root cause:{' '}
                {FAULT_DIAGNOSIS_OPTIONS.find((o) => o.id === mysteryFault)?.label}.
              </span>
            )}
            {diagnosisResult === 'incorrect' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                Not quite — check intake ΔP, discharge temp, receiver H₂O level, and duty cycle.
              </span>
            )}
          </div>
        </div>
      ) : sol.activeWarnings.length > 0 ? (
        <div
          className={`flex items-start gap-3 rounded-[24px] border p-4 text-sm ${
            sol.highTempTrip || sol.waterCarryover
              ? 'border-rose-300/70 bg-rose-50/90 text-rose-900 dark:border-rose-500/35 dark:bg-rose-950/35 dark:text-rose-200'
              : 'border-amber-300/70 bg-amber-50/90 text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-200'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="space-y-1">
            <div className="font-semibold">
              {sol.highTempTrip
                ? 'Compressor High-Temperature Trip Active (> 105 °C)'
                : sol.waterCarryover
                  ? 'Water Carryover Alert — Downstream Air Moisture Contamination'
                  : 'Maintenance / Efficiency Warning'}
            </div>
            <ul className="list-disc space-y-0.5 pl-4 text-xs opacity-90">
              {sol.activeWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-[24px] border border-emerald-300/70 bg-emerald-50/90 px-4 py-3 text-xs font-medium text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            Skid operating normally — stable pressure band, low intake ΔP, clean cooler heat rejection, and dry plant air (PDP {sol.pressureDewPointC.toFixed(1)} °C).
          </span>
        </div>
      )}

      {/* Live KPI Readout Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={<Gauge className={`h-4 w-4 ${sol.pressureStarved ? 'text-rose-500' : 'text-[var(--md-primary)]'}`} />}
          label={pick('Discharge Pressure', 'Tekanan Keluaran', '吐出圧力')}
          value={`${dyn.receiverPressureBar.toFixed(2)} bar`}
          sub={`${pick('Band', 'Pita', '帯域')} ${params.loadPressureBar.toFixed(1)}–${params.unloadPressureBar.toFixed(1)}`}
          alert={sol.pressureStarved}
        />
        <KpiCard
          icon={<Thermometer className={`h-4 w-4 ${sol.highTempTrip ? 'text-rose-500' : 'text-[var(--md-primary)]'}`} />}
          label={pick('Discharge Temp', 'Suhu Keluaran', '吐出温度')}
          value={`${sol.dischargeTempC.toFixed(1)} °C`}
          sub={sol.highTempTrip ? 'TRIP > 105 °C' : `${pick('Limit', 'Batas', '上限')} 105 °C`}
          alert={sol.highTempTrip}
        />
        <KpiCard
          icon={<Droplets className={`h-4 w-4 ${sol.pressureDewPointC > 8 ? 'text-rose-500' : 'text-[var(--md-primary)]'}`} />}
          label={pick('Pressure Dew Point', 'Titik Embun Tekan', '圧力露点')}
          value={`${sol.pressureDewPointC.toFixed(1)} °C`}
          sub={
            sol.waterCarryover
              ? pick('Water Carryover!', 'Water Carryover!', '水キャリーオーバー!')
              : `${pick('Target', 'Target', '目標')} ≤ 3.5 °C`
          }
          alert={sol.pressureDewPointC > 8}
        />
        <KpiCard
          icon={<Zap className={`h-4 w-4 ${sol.specificPowerKwPerM3Min > 7.4 ? 'text-rose-500' : 'text-[var(--md-primary)]'}`} />}
          label={pick('Specific Power', 'Daya Spesifik', '比動力')}
          value={`${sol.specificPowerKwPerM3Min.toFixed(2)}`}
          sub="kW / (m³/min)"
          alert={sol.specificPowerKwPerM3Min > 7.4}
        />
        <KpiCard
          icon={<Percent className={`h-4 w-4 ${sol.dutyCyclePct >= 95 ? 'text-rose-500' : 'text-[var(--md-primary)]'}`} />}
          label={pick('Load Duty Cycle', 'Siklus Tugas Beban', '負荷率')}
          value={`${sol.dutyCyclePct.toFixed(0)} %`}
          sub={`${sol.averagePowerKw.toFixed(1)} kW ${pick('avg', 'rata²', '平均')}`}
          alert={sol.dutyCyclePct >= 95}
        />
        <KpiCard
          icon={<DollarSign className={`h-4 w-4 ${sol.annualEnergyCostUsd > 52000 ? 'text-rose-500' : 'text-[var(--md-primary)]'}`} />}
          label={pick('Energy Cost', 'Biaya Energi', '電力コスト')}
          value={`$${Math.round(sol.annualEnergyCostUsd).toLocaleString()}/yr`}
          sub="6,000 hr @ $0.12/kWh"
          alert={sol.annualEnergyCostUsd > 52000}
        />
      </div>

      {/* Main Workspace: Schematic + Controls */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-center">
            <CompressorSkidSvg
              params={params}
              dyn={dyn}
              sol={sol}
              phases={animPhases}
              blindMode={blindMode && diagnosisResult !== 'correct'}
            />
          </div>
          <CompressorAnalytics
            history={pressureHistory}
            loadPressureBar={params.loadPressureBar}
            unloadPressureBar={params.unloadPressureBar}
            currentPressureBar={dyn.receiverPressureBar}
            dutyCyclePct={sol.dutyCyclePct}
            specificPowerKwPerM3Min={sol.specificPowerKwPerM3Min}
          />
        </div>

        <div className="glass-panel space-y-3.5 rounded-[28px] p-4 sm:p-5 lg:col-span-4">
          <h3 className="border-b border-[var(--md-outline-variant)]/50 pb-2.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            {pick(
              'Operating & Maintenance Controls',
              'Kontrol Operasi & Pemeliharaan',
              '運転・保守コントロール'
            )}
          </h3>

          <SliderControl
            label={pick('Load Pressure Setpoint', 'Setpoint Tekanan Load', 'ロード圧力設定 (Cut-in)')}
            value={params.loadPressureBar}
            min={5.5}
            max={8.5}
            step={0.1}
            unit="bar"
            onChange={(v) => updateParam('loadPressureBar', v)}
          />

          <SliderControl
            label={pick('Unload Pressure Setpoint', 'Setpoint Tekanan Unload', 'アンロード圧力設定 (Cut-out)')}
            value={params.unloadPressureBar}
            min={6.5}
            max={9.5}
            step={0.1}
            unit="bar"
            onChange={(v) => updateParam('unloadPressureBar', v)}
          />

          <SliderControl
            label={pick('Plant Air Demand', 'Kebutuhan Udara Pabrik', '工場エア需要')}
            value={params.plantDemandM3Min}
            min={1.0}
            max={12.0}
            step={0.2}
            unit="m³/min"
            onChange={(v) => updateParam('plantDemandM3Min', v)}
          />

          <div className="border-t border-[var(--md-outline-variant)]/50 pt-3">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick(
                  'Fault & Maintenance Parameters',
                  'Parameter Gangguan & Perawatan',
                  '故障・保守パラメータ'
                )}
              </span>
              {blindMode && diagnosisResult !== 'correct' && (
                <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]">
                  {pick('Masked', 'Disembunyikan', '非表示')}
                </span>
              )}
            </div>

            {blindMode && diagnosisResult !== 'correct' ? (
              <div className="rounded-[22px] border border-dashed border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] p-3.5 text-xs text-[var(--md-on-surface-variant)]">
                {pick(
                  'Fault parameters are hidden during Blind Diagnosis. Use the schematic readouts and KPI cards to diagnose the issue.',
                  'Parameter gangguan disembunyikan selama Diagnosis Buta. Gunakan pembacaan skematik dan kartu KPI untuk mendiagnosis masalah.',
                  'ブラインド診断中は故障パラメータが非表示になります。系統図とKPIカードから原因を診断してください。'
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <SliderControl
                  label={pick('Intake Filter Clogging ΔP', 'ΔP Penyumbatan Filter Hisap', '吸込フィルタ目詰まり ΔP')}
                  value={params.intakeFilterDpMbar}
                  min={0}
                  max={120}
                  step={2}
                  unit="mbar"
                  onChange={(v) => updateParam('intakeFilterDpMbar', v)}
                />

                <SliderControl
                  label={pick('Cooler Fouling', 'Pengotoran Cooler', 'クーラ汚れ率')}
                  value={params.coolerFoulingPct}
                  min={0}
                  max={100}
                  step={2}
                  unit="%"
                  onChange={(v) => updateParam('coolerFoulingPct', v)}
                />

                <SliderControl
                  label={pick('Plant Leak Rate', 'Laju Kebocoran Pabrik', '工場エア漏れ率')}
                  value={params.plantLeakPct}
                  min={0}
                  max={45}
                  step={1}
                  unit="%"
                  onChange={(v) => updateParam('plantLeakPct', v)}
                />

                <div className="flex items-center justify-between rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3.5 py-2.5">
                  <div>
                    <div className="text-xs font-semibold text-[var(--md-on-surface)]">
                      {pick('Condensate Auto-Drain', 'Auto-Drain Kondensat', 'オートドレン排出')}
                    </div>
                    <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                      {params.autoDrainEnabled
                        ? pick('Purging receiver moisture', 'Membuang air receiver', 'レシーバ水分排出中')
                        : pick('Valve stuck closed', 'Katup macet tertutup', '弁閉固着')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateParam('autoDrainEnabled', !params.autoDrainEnabled)}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                      params.autoDrainEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {params.autoDrainEnabled
                      ? pick('ON', 'AKTIF', 'ON')
                      : pick('FAILED', 'GAGAL', '故障')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  alert?: boolean;
}

function KpiCard({ icon, label, value, sub, alert = false }: KpiCardProps) {
  return (
    <div
      className={
        alert
          ? 'rounded-[24px] border border-rose-300/80 bg-rose-50/80 p-3.5 dark:border-rose-500/40 dark:bg-rose-950/30'
          : 'glass-card rounded-[24px] p-3.5'
      }
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--md-on-surface-variant)]">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`mt-1 font-mono text-base font-extrabold ${
          alert ? 'text-rose-700 dark:text-rose-300' : 'text-[var(--md-on-surface)]'
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-[var(--md-on-surface-variant)]">{sub}</div>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: SliderControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--md-on-surface)]">{label}</span>
        <span className="font-mono font-bold text-[var(--md-primary)]">
          {step < 1 ? value.toFixed(1) : value.toFixed(0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
