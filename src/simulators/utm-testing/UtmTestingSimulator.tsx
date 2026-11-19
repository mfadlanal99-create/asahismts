/* oxlint-disable react/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  Download,
  Gauge,
  Layers,
  OctagonAlert,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeResilience,
  computeToughness,
  computeUtmState,
  exportUtmDataToCsv,
  generateFullCurve,
  PRESET_MATERIALS,
  type MaterialProperties,
  type TestMode,
  type UtmDataPoint,
  type UtmTestInputs,
} from './utmTestingData';
import { UtmCharts } from './UtmCharts';
import { UtmMachineSvg } from './UtmMachineSvg';

export { utmTestingMeta } from './utmTestingMeta';

export function UtmTestingSimulator() {
  const { pick } = useLanguage();

  // Test Configuration States
  const [mode, setMode] = useState<TestMode>('tensile');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('steel-a36');
  const [diameterMm, setDiameterMm] = useState<number>(12.8);
  const [gaugeLengthMm, setGaugeLengthMm] = useState<number>(50.0);
  const [crossheadSpeedMmMin, setCrossheadSpeedMmMin] = useState<number>(5.0);
  const [paceMultiplier, setPaceMultiplier] = useState<number>(4); // Animation time scale

  // Safety & E-Stop Interlock States
  const [isEStopped, setIsEStopped] = useState<boolean>(false);
  const [safetyDoorClosed, setSafetyDoorClosed] = useState<boolean>(true);

  // Custom material properties
  const [customProps, setCustomProps] = useState({
    youngsModulusGpa: 200,
    yieldStrengthMpa: 300,
    utsMpa: 450,
    elongationPct: 22,
    reductionOfAreaPct: 45,
  });

  // Simulator operational states
  const [isMounted, setIsMounted] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [extensionMm, setExtensionMm] = useState<number>(0);
  const [testTimeSec, setTestTimeSec] = useState<number>(0);
  const [recordedPoints, setRecordedPoints] = useState<UtmDataPoint[]>([]);

  const startTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);

  // Active Material Resolution
  const activeMaterial: MaterialProperties = useMemo(() => {
    if (selectedMaterialId === 'custom') {
      const isBrittle = customProps.elongationPct < 2;
      return {
        id: 'custom',
        name: pick('Custom Material', 'Material Kustom', 'カスタム材料'),
        category: 'ferrous',
        youngsModulusGpa: customProps.youngsModulusGpa,
        yieldStrengthMpa: customProps.yieldStrengthMpa,
        utsMpa: Math.max(customProps.yieldStrengthMpa, customProps.utsMpa),
        elongationPct: customProps.elongationPct,
        reductionOfAreaPct: customProps.reductionOfAreaPct,
        poissonsRatio: 0.3,
        compressiveYieldMpa: customProps.yieldStrengthMpa,
        behavior: isBrittle ? 'brittle' : 'ductile',
        color: '#8b5cf6',
        descriptionEn: 'User-specified custom mechanical properties.',
        descriptionId: 'Sifat mekanis yang ditentukan oleh pengguna.',
        descriptionJa: 'ユーザー定義の材料力学特性。',
      };
    }
    return (
      PRESET_MATERIALS.find((m) => m.id === selectedMaterialId) ?? PRESET_MATERIALS[0]
    );
  }, [selectedMaterialId, customProps, pick]);

  // Combined inputs bundle
  const inputs: UtmTestInputs = useMemo(
    () => ({
      mode,
      material: activeMaterial,
      diameterMm,
      gaugeLengthMm,
      crossheadSpeedMmMin,
    }),
    [mode, activeMaterial, diameterMm, gaugeLengthMm, crossheadSpeedMmMin]
  );

  // Theoretical full curve and key landmarks
  const { points: fullCurvePoints, keyPoints } = useMemo(
    () => generateFullCurve(inputs),
    [inputs]
  );

  // Instantaneous physical state
  const currentState = useMemo(
    () => computeUtmState(extensionMm, testTimeSec, inputs),
    [extensionMm, testTimeSec, inputs]
  );

  // Peak load recorded
  const peakForceKn = useMemo(() => {
    if (recordedPoints.length === 0) return currentState.forceKn;
    return Math.max(currentState.forceKn, ...recordedPoints.map((p) => p.forceKn));
  }, [recordedPoints, currentState.forceKn]);

  // Max test displacement limit
  const maxDisplacementLimit = useMemo(() => {
    if (mode === 'tensile') {
      return (activeMaterial.elongationPct / 100) * gaugeLengthMm;
    } else {
      if (activeMaterial.behavior === 'brittle') {
        return ((activeMaterial.compressiveFractureStrainPct ?? 2.2) / 100) * gaugeLengthMm;
      }
      return 0.4 * gaugeLengthMm; // 40% compression limit
    }
  }, [mode, activeMaterial, gaugeLengthMm]);

  // Animation frame runner and data recording
  useEffect(() => {
    if (!isRunning || !isMounted || isEStopped) return;

    lastTickTimeRef.current = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const dtSec = Math.min(0.08, (now - lastTickTimeRef.current) / 1000);
      lastTickTimeRef.current = now;

      const speedMmSec = (inputs.crossheadSpeedMmMin / 60) * paceMultiplier;
      const stepMm = speedMmSec * dtSec;

      setTestTimeSec((prevTime) => {
        const nextTime = prevTime + dtSec * paceMultiplier;

        setExtensionMm((prevExt) => {
          const nextExt = Math.min(maxDisplacementLimit, prevExt + stepMm);
          const nextState = computeUtmState(nextExt, nextTime, inputs);

          setRecordedPoints((prevPts) => {
            const lastPt = prevPts[prevPts.length - 1];
            if (
              !lastPt ||
              Math.abs(nextState.extensionMm - lastPt.extensionMm) >= 0.015 ||
              nextState.isFractured
            ) {
              return [
                ...prevPts,
                {
                  timeSec: nextState.timeSec,
                  extensionMm: nextState.extensionMm,
                  strainPct: nextState.strainPct,
                  forceKn: nextState.forceKn,
                  stressMpa: nextState.stressMpa,
                },
              ];
            }
            return prevPts;
          });

          if (nextExt >= maxDisplacementLimit || nextState.isFractured) {
            setIsRunning(false);
          }
          return nextExt;
        });

        return nextTime;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, isMounted, isEStopped, inputs, paceMultiplier, maxDisplacementLimit]);

  // Action: Mount / Replace Specimen
  const handleMountSpecimen = useCallback(() => {
    setIsRunning(false);
    setIsEStopped(false);
    setExtensionMm(0);
    setTestTimeSec(0);
    setRecordedPoints([]);
    setIsMounted(true);
    startTimeRef.current = performance.now();
  }, []);

  // Action: Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    if (isEStopped) return;
    if (!isMounted) {
      handleMountSpecimen();
      setIsRunning(true);
      return;
    }
    if (currentState.isFractured || extensionMm >= maxDisplacementLimit) {
      handleMountSpecimen();
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  }, [isEStopped, isMounted, currentState.isFractured, extensionMm, maxDisplacementLimit, handleMountSpecimen]);

  // Action: Emergency Stop
  const handleEmergencyStop = useCallback(() => {
    setIsRunning(false);
    setIsEStopped(true);
  }, []);

  // Action: Reset
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsEStopped(false);
    setExtensionMm(0);
    setTestTimeSec(0);
    setRecordedPoints([]);
  }, []);

  // Action: Export CSV
  const handleExportCsv = useCallback(() => {
    if (recordedPoints.length === 0) return;
    exportUtmDataToCsv(recordedPoints, activeMaterial.name, mode);
  }, [recordedPoints, activeMaterial.name, mode]);

  // Derived Extracted Properties
  const extractedProps = useMemo(() => {
    const yieldStress =
      mode === 'tensile'
        ? activeMaterial.yieldStrengthMpa
        : activeMaterial.compressiveYieldMpa;

    const utsStress =
      mode === 'tensile'
        ? activeMaterial.utsMpa
        : activeMaterial.compressiveUltimateMpa ?? activeMaterial.compressiveYieldMpa * 1.5;

    const elongationVal = activeMaterial.elongationPct;
    const raVal = mode === 'tensile' ? activeMaterial.reductionOfAreaPct : 0;
    const resilienceVal = computeResilience(activeMaterial, mode);
    const toughnessVal = computeToughness(fullCurvePoints);

    return {
      modulus: activeMaterial.youngsModulusGpa.toFixed(1),
      yieldStrength: yieldStress.toFixed(0),
      uts: utsStress.toFixed(0),
      elongation: elongationVal.toFixed(1),
      reductionOfArea: raVal.toFixed(1),
      resilience: resilienceVal.toFixed(2),
      toughness: toughnessVal.toFixed(1),
    };
  }, [activeMaterial, mode, fullCurvePoints]);

  return (
    <div className="flex flex-col gap-5">
      {/* E-STOP Active Interlock Banner */}
      {isEStopped && (
        <div className="flex items-center justify-between gap-3 rounded-[24px] border border-red-500/50 bg-red-500/10 p-4 text-red-600 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-400">
          <div className="flex items-center gap-2.5">
            <OctagonAlert className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">
                {pick(
                  'Emergency Stop Activated (Interlock Engaged)',
                  'Berhenti Darurat Aktif (Interlock Terkunci)',
                  '非常停止インターロック作動中'
                )}
              </p>
              <p className="text-[11px] opacity-90">
                {pick(
                  'Crosshead drive power cut. Press Reset or click Release to clear the safety latch.',
                  'Daya motor penggerak diputus. Tekan Reset untuk melepas interlock.',
                  'クロスヘッド駆動電源遮断。リセットまたは解除ボタンでインターロックを解除してください。'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEStopped(false)}
            className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:opacity-90"
          >
            {pick('Release E-Stop', 'Lepas E-Stop', '非常停止解除')}
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="glass-panel grid grid-cols-1 gap-4 rounded-[28px] p-4 sm:p-5 md:grid-cols-12">
        {/* Mode & Material Selectors */}
        <div className="flex flex-col gap-2.5 md:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Test Mode & Specimen', 'Mode Uji & Spesimen', '試験モード・試験片')}
            </span>
            {/* Tensile vs Compression toggle */}
            <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('tensile');
                  handleReset();
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
                  mode === 'tensile'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                <ArrowDownUp className="h-3.5 w-3.5 rotate-90" />
                {pick('Tensile (ASTM E8)', 'Tarik (ASTM E8)', '引張 (ASTM E8)')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('compression');
                  handleReset();
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
                  mode === 'compression'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                <ArrowDownUp className="h-3.5 w-3.5" />
                {pick('Compression (ASTM E9)', 'Tekan (ASTM E9)', '圧縮 (ASTM E9)')}
              </button>
            </div>
          </div>

          {/* Material Select Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--md-on-surface)]">
              {pick('Specimen Material', 'Material Spesimen', '試験片材料')}
            </label>
            <select
              value={selectedMaterialId}
              onChange={(e) => {
                setSelectedMaterialId(e.target.value);
                handleReset();
              }}
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs font-medium text-[var(--md-on-surface)] transition-colors focus:border-[var(--md-primary)] focus:outline-none"
            >
              {PRESET_MATERIALS.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.name} ({mat.youngsModulusGpa} GPa, σy: {mat.yieldStrengthMpa} MPa, UTS: {mat.utsMpa} MPa)
                </option>
              ))}
              <option value="custom">
                {pick('★ Custom Material Mode...', '★ Mode Material Kustom...', '★ カスタム材料モード...')}
              </option>
            </select>
          </div>

          {/* Description snippet */}
          <p className="text-[11px] text-[var(--md-on-surface-variant)]">
            {pick(
              activeMaterial.descriptionEn,
              activeMaterial.descriptionId,
              activeMaterial.descriptionJa
            )}
          </p>
        </div>

        {/* Specimen Geometry Sliders */}
        <div className="flex flex-col justify-between gap-2.5 border-[var(--md-outline-variant)]/50 md:col-span-4 md:border-l md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Specimen Dimensions', 'Dimensi Spesimen', '試験片寸法')}
            </span>
            <span className="rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[var(--md-on-primary-container)]">
              A₀ = {((Math.PI / 4) * diameterMm * diameterMm).toFixed(1)} mm²
            </span>
          </div>

          {/* Diameter Ø slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[var(--md-on-surface-variant)]">
                {pick('Diameter Ø', 'Diameter Ø', '直径 Ø')}:
              </span>
              <span className="font-mono font-bold text-[var(--md-on-surface)]">
                {diameterMm.toFixed(1)} mm
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={20}
              step={0.2}
              value={diameterMm}
              onChange={(e) => {
                setDiameterMm(Number(e.target.value));
                handleReset();
              }}
              className="w-full"
            />
          </div>

          {/* Gauge Length L0 slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[var(--md-on-surface-variant)]">
                {pick('Gauge Length L₀', 'Panjang Ukur L₀', '標点間距離 L₀')}:
              </span>
              <span className="font-mono font-bold text-[var(--md-on-surface)]">
                {gaugeLengthMm.toFixed(0)} mm
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={100}
              step={5}
              value={gaugeLengthMm}
              onChange={(e) => {
                setGaugeLengthMm(Number(e.target.value));
                handleReset();
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Crosshead Speed & Action Controls */}
        <div className="flex flex-col justify-between gap-2.5 border-[var(--md-outline-variant)]/50 md:col-span-3 md:border-l md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Speed & Run', 'Kecepatan & Kontrol', '速度・制御')}
            </span>
            <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
              {crossheadSpeedMmMin} mm/min
            </span>
          </div>

          {/* Speed slider */}
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={crossheadSpeedMmMin}
            onChange={(e) => setCrossheadSpeedMmMin(Number(e.target.value))}
            className="w-full"
          />

          {/* Action buttons row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              disabled={isEStopped}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-40 ${
                isRunning
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'm3-btn-filled'
              }`}
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isRunning
                ? pick('Pause', 'Jeda', '一時停止')
                : currentState.isFractured
                ? pick('Restart', 'Ulangi', '再開')
                : pick('Start Test', 'Mulai Uji', '試験開始')}
            </button>

            {/* Emergency Stop Button in bar */}
            <button
              type="button"
              onClick={handleEmergencyStop}
              title={pick('Emergency Stop', 'Berhenti Darurat', '非常停止')}
              className={`flex items-center justify-center rounded-full border p-2 text-white shadow-xs transition-colors ${
                isEStopped
                  ? 'border-red-600 bg-red-600'
                  : 'border-red-500 bg-red-500 hover:bg-red-600'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleMountSpecimen}
              title={pick('Mount clean specimen', 'Pasang spesimen baru', '新品試験片を装填')}
              className="glass-pill flex items-center justify-center rounded-full p-2"
            >
              <Wrench className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              title={pick('Reset to zero', 'Reset posisi nol', 'ゼロ位置リセット')}
              className="glass-pill flex items-center justify-center rounded-full p-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={recordedPoints.length === 0}
              title={pick('Export CSV test data', 'Unduh data CSV uji', 'CSVデータ出力')}
              className="glass-pill flex items-center justify-center rounded-full p-2 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Material Accordion */}
      {selectedMaterialId === 'custom' && (
        <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--md-primary)]/40 bg-[var(--md-primary-container)]/35 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--md-primary)]" />
            <span className="text-xs font-bold uppercase text-[var(--md-on-surface)]">
              {pick(
                'Custom Material Parameters',
                'Parameter Material Kustom',
                'カスタム材料パラメータ設定'
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                Young’s E (GPa)
              </label>
              <input
                type="number"
                min={1}
                max={400}
                value={customProps.youngsModulusGpa}
                onChange={(e) =>
                  setCustomProps((prev) => ({
                    ...prev,
                    youngsModulusGpa: Number(e.target.value),
                  }))
                }
                className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                Yield σy (MPa)
              </label>
              <input
                type="number"
                min={10}
                max={1500}
                value={customProps.yieldStrengthMpa}
                onChange={(e) =>
                  setCustomProps((prev) => ({
                    ...prev,
                    yieldStrengthMpa: Number(e.target.value),
                  }))
                }
                className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                UTS (MPa)
              </label>
              <input
                type="number"
                min={customProps.yieldStrengthMpa}
                max={2000}
                value={customProps.utsMpa}
                onChange={(e) =>
                  setCustomProps((prev) => ({
                    ...prev,
                    utsMpa: Number(e.target.value),
                  }))
                }
                className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                Elongation %EL (%)
              </label>
              <input
                type="number"
                min={0.5}
                max={100}
                step={0.5}
                value={customProps.elongationPct}
                onChange={(e) =>
                  setCustomProps((prev) => ({
                    ...prev,
                    elongationPct: Number(e.target.value),
                  }))
                }
                className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Workspace Grid (SVG 6 cols + Charts & Readouts 6 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left: UTM Load Frame CAD SVG View (lg:col-span-6) */}
        <div className="glass-panel flex flex-col overflow-hidden rounded-[28px] p-4 sm:p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
              <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                {pick('UTM Mechanical Load Frame', 'Rangka Beban UTM', '万能試験機 負荷フレーム')}
              </span>
            </div>
            {/* Speed pace factor button */}
            <button
              type="button"
              onClick={() => setPaceMultiplier((p) => (p === 2 ? 4 : p === 4 ? 8 : 2))}
              className="m3-btn-tonal rounded-full px-3 py-1 text-[11px] font-bold"
            >
              {paceMultiplier}x Sim Speed
            </button>
          </div>

          {/* SVG Machine Rendering with Interactive On-Machine Console */}
          <div className="flex w-full items-center justify-center pt-3">
            <UtmMachineSvg
              inputs={inputs}
              state={currentState}
              isMounted={isMounted}
              isRunning={isRunning}
              isEStopped={isEStopped}
              peakForceKn={peakForceKn}
              safetyDoorClosed={safetyDoorClosed}
              onStartPause={handleTogglePlay}
              onEmergencyStop={handleEmergencyStop}
              onReset={handleReset}
              onToggleSafetyDoor={() => setSafetyDoorClosed((prev) => !prev)}
            />
          </div>
        </div>

        {/* Right: Charts, Digital Readouts & Extracted Properties (lg:col-span-6) */}
        <div className="flex flex-col gap-4 lg:col-span-6">
          {/* Digital Telemetry Readouts (4 cards) */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {/* 1. Force kN */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Load / Force F', 'Gaya Beban F', '荷重 F')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-[var(--md-primary)]">
                  {currentState.forceKn.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">kN</span>
              </div>
            </div>

            {/* 2. Extension mm */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Displacement ΔL', 'Perpanjangan ΔL', '変位 ΔL')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-[var(--md-on-surface)]">
                  {currentState.extensionMm.toFixed(3)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">mm</span>
              </div>
            </div>

            {/* 3. Stress MPa */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Eng. Stress σ', 'Tegangan σ', '公称応力 σ')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-[var(--md-primary)]">
                  {currentState.stressMpa.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">MPa</span>
              </div>
            </div>

            {/* 4. Strain % */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Eng. Strain ε', 'Regangan ε', '公称ひずみ ε')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-xl font-black text-[var(--md-on-surface)]">
                  {currentState.strainPct.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">%</span>
              </div>
            </div>
          </div>

          {/* Live Dynamic Chart (Stress-Strain / Force-Elongation) */}
          <UtmCharts
            dataPoints={recordedPoints}
            fullCurvePoints={fullCurvePoints}
            keyPoints={keyPoints}
            currentState={currentState}
            materialName={activeMaterial.name}
            isMounted={isMounted}
          />

          {/* Extracted Mechanical Properties Matrix (ASTM E8 / E9) */}
          <div className="glass-panel flex flex-col gap-2.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--md-primary)]" />
                <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                  {pick(
                    'Extracted Material Properties (ASTM E8 / E9)',
                    'Sifat Mekanis Teruji (ASTM E8 / E9)',
                    '同定材料定数 (ASTM E8 / E9)'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--md-on-surface-variant)]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  {mode === 'tensile'
                    ? pick('Tension Mode', 'Mode Tarik', '引張モード')
                    : pick('Compression Mode', 'Mode Tekan', '圧縮モード')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
              {/* Young's Modulus */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Modulus E', 'Modulus E', 'ヤング率 E')}
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {extractedProps.modulus} GPa
                </span>
              </div>

              {/* 0.2% Offset Yield */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Yield Rp0.2', 'Kekuatan Luluh', '0.2%耐力')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {extractedProps.yieldStrength} MPa
                </span>
              </div>

              {/* Peak Strength UTS / UCS */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {mode === 'tensile' ? 'UTS (Peak)' : 'UCS (Peak)'}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {extractedProps.uts} MPa
                </span>
              </div>

              {/* Peak Force Recorded */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Peak Force Fmax', 'Gaya Maksimal', '最大荷重 Fmax')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {peakForceKn.toFixed(2)} kN
                </span>
              </div>

              {/* Elongation at break */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Elongation %EL', 'Perpanjangan %EL', '破断伸び %EL')}
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {extractedProps.elongation}%
                </span>
              </div>

              {/* Reduction of Area */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Red. Area %RA', 'Reduksi Luas %RA', '絞り率 %RA')}
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {mode === 'tensile' ? `${extractedProps.reductionOfArea}%` : 'N/A (Comp)'}
                </span>
              </div>

              {/* Modulus of Resilience Ur */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Resilience (Ur)', 'Kelentingan (Ur)', 'レジリエンス (Ur)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {extractedProps.resilience} MJ/m³
                </span>
              </div>

              {/* Modulus of Toughness UT */}
              <div className="flex flex-col rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5">
                <span className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {pick('Toughness (UT)', 'Ketangguhan (UT)', '破壊じん性 (UT)')}
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {extractedProps.toughness} MJ/m³
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
