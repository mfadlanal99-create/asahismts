/* oxlint-disable react/only-export-components */
import { useCallback, useMemo, useState } from 'react';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Download,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeBodeCurve,
  computeIdealCounterWeight,
  computeRotorDynamics,
  exportVibrationDataToCsv,
  MACHINE_PRESETS,
  type FoundationSupport,
  type RotorDynamicInputs,
} from './vibrationData';
import { VibrationMachineSvg } from './VibrationMachineSvg';
import { VibrationCharts } from './VibrationCharts';

export { vibrationMeta } from './vibrationMeta';

export function VibrationSimulator() {
  const { pick } = useLanguage();

  // Operating Machine Configuration
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [rpm, setRpm] = useState<number>(1800);
  const [criticalRpm, setCriticalRpm] = useState<number>(2100);
  const [dampingRatio, setDampingRatio] = useState<number>(0.08);
  const [support, setSupport] = useState<FoundationSupport>('rigid');
  const [selectedPreset, setSelectedPreset] = useState<string>('moderate-unbalance');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Rotor Mechanical Parameters
  const rotorMassKg = 4.0; // 4.0 kg Jeffcott rotor assembly
  const boltRadiusMm = 60.0; // 60 mm radius balancing hole circle

  // Unbalance Configuration
  const [initialUnbalanceGmm, setInitialUnbalanceGmm] = useState<number>(150);
  const [initialPhaseDeg, setInitialPhaseDeg] = useState<number>(60);

  // Correction Weights
  const [correctionMassG, setCorrectionMassG] = useState<number>(0);
  const [correctionPhaseDeg, setCorrectionPhaseDeg] = useState<number>(0);

  // Active inputs bundle
  const inputs: RotorDynamicInputs = useMemo(
    () => ({
      rpm: isRunning ? rpm : 0,
      criticalRpm,
      dampingRatio,
      rotorMassKg,
      boltRadiusMm,
      initialUnbalanceGmm,
      initialPhaseDeg,
      correctionMassG,
      correctionPhaseDeg,
      support,
    }),
    [
      isRunning,
      rpm,
      criticalRpm,
      dampingRatio,
      rotorMassKg,
      boltRadiusMm,
      initialUnbalanceGmm,
      initialPhaseDeg,
      correctionMassG,
      correctionPhaseDeg,
      support,
    ]
  );

  // Compute live state
  const state = useMemo(() => computeRotorDynamics(inputs), [inputs]);

  // Compute Bode sweep curve
  const bodePoints = useMemo(
    () => computeBodeCurve(criticalRpm, dampingRatio, state.netUnbalanceGmm, rotorMassKg),
    [criticalRpm, dampingRatio, state.netUnbalanceGmm, rotorMassKg]
  );

  // Handlers
  const handleToggleMotor = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPreset(presetId);
    const found = MACHINE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setInitialUnbalanceGmm(found.initialUnbalanceGmm);
      setInitialPhaseDeg(found.initialPhaseDeg);
      setRpm(found.targetRpm);
      setCorrectionMassG(0);
      setCorrectionPhaseDeg(0);
    }
  }, []);

  const handleApplyIdealCounterWeight = useCallback(() => {
    const ideal = computeIdealCounterWeight(initialUnbalanceGmm, initialPhaseDeg, boltRadiusMm);
    setCorrectionMassG(ideal.correctionMassG);
    setCorrectionPhaseDeg(ideal.correctionPhaseDeg);
  }, [initialUnbalanceGmm, initialPhaseDeg, boltRadiusMm]);

  const handleClearWeights = useCallback(() => {
    setCorrectionMassG(0);
    setCorrectionPhaseDeg(0);
  }, []);

  const handleExportCsv = useCallback(() => {
    exportVibrationDataToCsv(state, bodePoints);
  }, [state, bodePoints]);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Configuration & Speed Control Bar */}
      <div className="glass-panel grid grid-cols-1 gap-4 rounded-2xl p-4 sm:p-5 md:grid-cols-12">
        {/* Machine Preset & Support Mode (col-span-5) */}
        <div className="flex flex-col gap-2 md:col-span-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {pick('Machine Scenario & Foundation Support', 'Skenario Mesin & Tipe Fondasi', '機械シナリオ・基礎支持形式')}
            </span>
            {/* Foundation Support Selector */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setSupport('rigid')}
                className={`rounded-md px-2.5 py-0.5 text-xs font-semibold transition-all ${
                  support === 'rigid'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {pick('Rigid (Class II)', 'Kaku (Kelas II)', '剛性基礎 (Class II)')}
              </button>
              <button
                type="button"
                onClick={() => setSupport('flexible')}
                className={`rounded-md px-2.5 py-0.5 text-xs font-semibold transition-all ${
                  support === 'flexible'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {pick('Flexible (Class II)', 'Fleksibel (Kelas II)', '弾性基礎 (Class II)')}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {pick('Rotor Unbalance Preset', 'Preset Ketidakseimbangan Rotor', 'ロータ不釣合プリセット')}
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 transition-colors focus:border-cyan-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {MACHINE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
              <option value="custom">{pick('Custom Condition', 'Kondisi Kustom', 'カスタム設定')}</option>
            </select>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {MACHINE_PRESETS.find((p) => p.id === selectedPreset)?.description ??
              pick('User customized unbalance and rotor dynamic parameters.', 'Parameter dinamika rotor dan ketidakseimbangan kustom.', 'ユーザー定義の不釣合・ロータ力学パラメータ。')}
          </p>
        </div>

        {/* Operating Speed (RPM) Slider & Resonance (col-span-4) */}
        <div className="flex flex-col justify-between gap-2 border-slate-100 md:col-span-4 md:border-l md:pl-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {pick('Operating Speed', 'Kecepatan Operasi', '運転回転速度')}
            </span>
            <span className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400">
              {rpm} RPM ({(rpm / 60).toFixed(1)} Hz)
            </span>
          </div>

          <input
            type="range"
            min={300}
            max={4500}
            step={25}
            value={rpm}
            onChange={(e) => {
              setRpm(Number(e.target.value));
              setSelectedPreset('custom');
            }}
            className="h-1.5 w-full cursor-pointer accent-cyan-600"
          />

          {/* Quick Speed Jump Buttons */}
          <div className="flex items-center justify-between gap-1 text-[10px]">
            {[900, 1800, 2100, 3000, 3600].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  setRpm(speed);
                  setSelectedPreset('custom');
                }}
                className={`rounded px-1.5 py-0.5 font-mono font-semibold transition-all ${
                  rpm === speed
                    ? 'bg-cyan-600 text-white'
                    : speed === criticalRpm
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {speed === criticalRpm ? `${speed} (Nc)` : speed}
              </button>
            ))}
          </div>
        </div>

        {/* Run / Stop & Export Actions (col-span-3) */}
        <div className="flex flex-col justify-between gap-2 border-slate-100 md:col-span-3 md:border-l md:pl-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              {pick('Machine State', 'Status Mesin', '機械制御')}
            </span>
            <span
              className={`rounded-sm px-1.5 py-0.2 text-[10px] font-bold ${
                isRunning
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleToggleMotor}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white shadow-xs transition-all ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isRunning ? pick('Stop', 'Stop', '停止') : pick('Start', 'Start', '起動')}
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              {pick('Export', 'Ekspor', '出力')}
            </button>
          </div>
        </div>
      </div>

      {/* Balancing Controls Card (Initial Unbalance & Correction Mass) */}
      <div className="glass-panel grid grid-cols-1 gap-4 rounded-2xl p-4 sm:p-5 md:grid-cols-12">
        {/* Initial Heavy Spot Controls (col-span-5) */}
        <div className="flex flex-col gap-2 md:col-span-5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              U₀
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase dark:text-slate-200">
              {pick('Initial Unbalance (Heavy Spot)', 'Ketidakseimbangan Awal (Titik Berat)', '初期不釣合 (ヘビースポット)')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span>{pick('Magnitude U₀', 'Besaran U₀', '不釣合量 U₀')}:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {initialUnbalanceGmm} g·mm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={5}
                value={initialUnbalanceGmm}
                onChange={(e) => {
                  setInitialUnbalanceGmm(Number(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="h-1.5 w-full cursor-pointer accent-rose-600"
              />
              <span className="text-[10px] text-slate-500">
                {(initialUnbalanceGmm / boltRadiusMm).toFixed(2)} g @ {boltRadiusMm} mm radius
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span>{pick('Angle θ₀', 'Sudut θ₀', '位相角 θ₀')}:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {initialPhaseDeg}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={355}
                step={5}
                value={initialPhaseDeg}
                onChange={(e) => {
                  setInitialPhaseDeg(Number(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="h-1.5 w-full cursor-pointer accent-rose-600"
              />
              <span className="text-[10px] text-slate-500">
                {pick('Direction from keyphasor', 'Arah dari keyphasor', '基準位置からの位相')}
              </span>
            </div>
          </div>
        </div>

        {/* Balancing Correction Weights (col-span-5) */}
        <div className="flex flex-col gap-2 border-cyan-100 md:col-span-5 md:border-l md:pl-4 dark:border-cyan-900/40">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white">
              Wc
            </span>
            <span className="text-xs font-bold text-slate-800 uppercase dark:text-slate-200">
              {pick('Correction Weight (Single Plane)', 'Massa Koreksi Balans (Satu Bidang)', '釣合修正質量 (単一修正面)')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span>{pick('Added Mass Wc', 'Massa Tambahan Wc', '付加質量 Wc')}:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {correctionMassG.toFixed(2)} g
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={0.1}
                value={correctionMassG}
                onChange={(e) => setCorrectionMassG(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-cyan-600"
              />
              <span className="text-[10px] text-slate-500">
                {(correctionMassG * boltRadiusMm).toFixed(1)} g·mm correction
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span>{pick('Correction Angle θc', 'Sudut Koreksi θc', '修正位相角 θc')}:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {correctionPhaseDeg}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={355}
                step={5}
                value={correctionPhaseDeg}
                onChange={(e) => setCorrectionPhaseDeg(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-cyan-600"
              />
              <span className="text-[10px] text-slate-500">
                {pick('Mount on disk PCD bolt hole', 'Pasang di lubang PCD disk', 'PCDボルト穴へ装着')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Ideal Balance & Reset (col-span-2) */}
        <div className="flex flex-col justify-end gap-2 border-cyan-100 md:col-span-2 md:border-l md:pl-4 dark:border-cyan-900/40">
          <button
            type="button"
            onClick={handleApplyIdealCounterWeight}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-2 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-cyan-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {pick('Auto-Balance', 'Balans Ideal', '自動釣合修正')}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearWeights}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {pick('Clear', 'Hapus', 'クリア')}
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              title={pick('Advanced rotordynamics parameters', 'Parameter lanjutan dinamika rotor', 'ロータ力学詳細設定')}
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Sliders className="h-3.5 w-3.5" />
              {showAdvanced ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Rotordynamic Parameters Accordion */}
      {showAdvanced && (
        <div className="glass-panel grid grid-cols-1 gap-4 rounded-2xl p-4 sm:p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>{pick('Shaft Critical Speed Nc', 'Kecepatan Kritis Poros Nc', '第1危険速度 Nc')}:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {criticalRpm} RPM
              </span>
            </div>
            <input
              type="range"
              min={1500}
              max={3000}
              step={50}
              value={criticalRpm}
              onChange={(e) => setCriticalRpm(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-rose-600"
            />
            <span className="text-[10px] text-slate-500">
              ω_n = {((criticalRpm * 2 * Math.PI) / 60).toFixed(1)} rad/s ({(criticalRpm / 60).toFixed(1)} Hz)
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>{pick('System Damping Ratio ζ', 'Rasio Redaman Sistem ζ', '粘性減衰比 ζ')}:</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {dampingRatio.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.20}
              step={0.01}
              value={dampingRatio}
              onChange={(e) => setDampingRatio(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-cyan-600"
            />
            <span className="text-[10px] text-slate-500">
              {pick('Resonant Amplification Factor M = ', 'Faktor Amplifikasi Resonansi M = ', '共振倍率 M = ')}
              {(1 / (2 * dampingRatio)).toFixed(1)}x
            </span>
          </div>
        </div>
      )}

      {/* Main Interactive Workspace Grid (SVG 6 cols + Telemetry & Charts 6 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left: Interactive CAD Machine Rig SVG (lg:col-span-6) */}
        <div className="glass-panel flex flex-col overflow-hidden rounded-2xl p-4 sm:p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-500" />
              <span className="text-xs font-semibold tracking-wide text-slate-800 uppercase dark:text-slate-200">
                {pick('Single-Plane Rotor Dynamic Rig & Face View', 'Rig Dinamika Rotor & Tampilan Muka Balans', '単一修正面ロータ動釣合試験ベンチ')}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
              {state.rpm} RPM
            </span>
          </div>

          <div className="flex w-full items-center justify-center p-2 pt-3">
            <VibrationMachineSvg
              inputs={inputs}
              state={state}
              isRunning={isRunning}
              onToggleMotor={handleToggleMotor}
              onSetCorrectionAngle={(ang) => setCorrectionPhaseDeg(ang)}
            />
          </div>
        </div>

        {/* Right: Digital Telemetry, ISO Severity Banner & Charts (lg:col-span-6) */}
        <div className="flex flex-col gap-4 lg:col-span-6">
          {/* 4 Telemetry Metrics Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {/* 1. Overall RMS Velocity */}
            <div className="glass-card flex flex-col rounded-xl p-3 shadow-xs">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {pick('Vibration RMS v_rms', 'Kecepatan Getar RMS', '総振動速度 RMS')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-cyan-600 dark:text-cyan-400">
                  {state.velocityTotalRmsMmS.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-slate-500">mm/s</span>
              </div>
            </div>

            {/* 2. Peak-to-Peak Displacement */}
            <div className="glass-card flex flex-col rounded-xl p-3 shadow-xs">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {pick('1X Orbit Pk-Pk', 'Perpindahan 1X Pk-Pk', '1X 振幅ピーク間')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-sky-600 dark:text-sky-400">
                  {state.displacement1xPkPkUm.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-500">μm p-p</span>
              </div>
            </div>

            {/* 3. Net Unbalance Residual */}
            <div className="glass-card flex flex-col rounded-xl p-3 shadow-xs">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {pick('Net Unbalance U_net', 'Sisa Unbalance U_net', '残留不釣合 U_net')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                  {state.netUnbalanceGmm.toFixed(0)}
                </span>
                <span className="text-xs font-semibold text-slate-500">g·mm</span>
              </div>
            </div>

            {/* 4. Phase Lag Angle */}
            <div className="glass-card flex flex-col rounded-xl p-3 shadow-xs">
              <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {pick('Phase Lag φ', 'Sudut Fasa φ', '位相遅れ角 φ')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-violet-600 dark:text-violet-400">
                  {state.phaseLagDeg.toFixed(1)}°
                </span>
              </div>
            </div>
          </div>

          {/* ISO 10816 / ISO 20816 Severity Classification Status Card */}
          <div
            className={`glass-card flex flex-col gap-2 rounded-2xl p-4 border transition-all ${
              state.isoZone === 'A'
                ? 'border-emerald-500/40 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-950/20'
                : state.isoZone === 'B'
                ? 'border-cyan-500/40 bg-cyan-50/40 dark:border-cyan-500/30 dark:bg-cyan-950/20'
                : state.isoZone === 'C'
                ? 'border-amber-500/40 bg-amber-50/40 dark:border-amber-500/30 dark:bg-amber-950/20'
                : 'border-red-500/40 bg-red-50/40 dark:border-red-500/30 dark:bg-red-950/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full animate-pulse"
                  style={{ backgroundColor: state.isoInfo.color }}
                />
                <span className="text-xs font-bold uppercase" style={{ color: state.isoInfo.color }}>
                  {state.isoInfo.label} — {state.isoInfo.condition}
                </span>
              </div>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-xs dark:bg-slate-800 dark:text-slate-200">
                ISO 10816-3 / 20816-3 ({support === 'rigid' ? 'Rigid' : 'Flexible'})
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              {state.isoInfo.recommendation}
            </p>

            {/* Severity Threshold Bar */}
            <div className="mt-1 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                <span>0 mm/s (Zone A)</span>
                <span>{support === 'rigid' ? '1.12' : '1.80'} mm/s (Zone B)</span>
                <span>{support === 'rigid' ? '2.80' : '4.50'} mm/s (Zone C)</span>
                <span>{support === 'rigid' ? '4.50+' : '7.10+'} mm/s (Zone D Trip)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(100, (state.velocityTotalRmsMmS / (support === 'rigid' ? 6.0 : 9.0)) * 100)}%`,
                    backgroundColor: state.isoInfo.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Diagnostic Charts (FFT Spectrum & Bode Curve) */}
          <VibrationCharts state={state} bodePoints={bodePoints} />
        </div>
      </div>
    </div>
  );
}
