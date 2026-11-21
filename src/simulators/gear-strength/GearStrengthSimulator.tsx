/* oxlint-disable react/only-export-components */
import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Download,
  Layers,
  OctagonAlert,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeGearStrength,
  exportGearDataToCsv,
  DEFAULT_GEAR_INPUTS,
  GEAR_PRESETS,
  PRESET_GEAR_MATERIALS,
  type GearInputs,
  type GearType,
  type GearMaterial,
  type GearCalculationResult,
} from './gearStrengthData';
import { GearStrengthSvg } from './GearStrengthSvg';

export { gearStrengthMeta } from './gearStrengthMeta';

export function GearStrengthSimulator() {
  const { pick } = useLanguage();

  // Primary configuration state
  const [gearType, setGearType] = useState<GearType>('spur');
  const [powerKw, setPowerKw] = useState<number>(15.0);
  const [pinionRpm, setPinionRpm] = useState<number>(1450);
  const [moduleMm, setModuleMm] = useState<number>(4.0);
  const [pinionTeeth, setPinionTeeth] = useState<number>(19);
  const [gearTeeth, setGearTeeth] = useState<number>(76);
  const [faceWidthMm, setFaceWidthMm] = useState<number>(45.0);
  const [pressureAngleDeg, setPressureAngleDeg] = useState<number>(20);
  const [helixAngleDeg, setHelixAngleDeg] = useState<number>(18);
  const [applicationFactor, setApplicationFactor] = useState<number>(1.25);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('carburized-8620');

  // Custom material state
  const [customMaterialProps, setCustomMaterialProps] = useState({
    youngsModulusGpa: 206,
    poissonsRatio: 0.3,
    allowableBendingMpa: 380,
    allowableContactMpa: 1400,
    densityKgM3: 7850,
  });

  // Animation rotation control
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(0.1);

  // Active inputs bundle
  const inputs: GearInputs = useMemo(() => {
    return {
      gearType,
      powerKw,
      pinionRpm,
      moduleMm,
      pinionTeeth,
      gearTeeth,
      faceWidthMm,
      pressureAngleDeg,
      helixAngleDeg: gearType === 'helical' ? helixAngleDeg : 0,
      applicationFactor,
      materialId: selectedMaterialId,
    };
  }, [
    gearType,
    powerKw,
    pinionRpm,
    moduleMm,
    pinionTeeth,
    gearTeeth,
    faceWidthMm,
    pressureAngleDeg,
    helixAngleDeg,
    applicationFactor,
    selectedMaterialId,
  ]);

  // Compute full engineering calculations
  const analysisResult: GearCalculationResult = useMemo(() => {
    return computeGearStrength(
      inputs,
      selectedMaterialId === 'custom'
        ? {
            name: pick('Custom Gear Material', 'Material Roda Gigi Kustom', 'カスタム歯車材料'),
            youngsModulusGpa: customMaterialProps.youngsModulusGpa,
            poissonsRatio: customMaterialProps.poissonsRatio,
            allowableBendingMpa: customMaterialProps.allowableBendingMpa,
            allowableContactMpa: customMaterialProps.allowableContactMpa,
            densityKgM3: customMaterialProps.densityKgM3,
            hardness: 'Custom / User Defined',
            color: '#8b5cf6',
          }
        : undefined
    );
  }, [inputs, selectedMaterialId, customMaterialProps, pick]);

  // Compute equivalent Spur baseline for clear Spur vs Helical trade-off comparison
  const spurBaseline: GearCalculationResult | null = useMemo(() => {
    if (inputs.gearType !== 'helical') return null;
    return computeGearStrength(
      { ...inputs, gearType: 'spur', helixAngleDeg: 0 },
      selectedMaterialId === 'custom' ? analysisResult.material : undefined
    );
  }, [inputs, selectedMaterialId, analysisResult.material]);

  // Reset to default
  const handleReset = useCallback(() => {
    setGearType(DEFAULT_GEAR_INPUTS.gearType);
    setPowerKw(DEFAULT_GEAR_INPUTS.powerKw);
    setPinionRpm(DEFAULT_GEAR_INPUTS.pinionRpm);
    setModuleMm(DEFAULT_GEAR_INPUTS.moduleMm);
    setPinionTeeth(DEFAULT_GEAR_INPUTS.pinionTeeth);
    setGearTeeth(DEFAULT_GEAR_INPUTS.gearTeeth);
    setFaceWidthMm(DEFAULT_GEAR_INPUTS.faceWidthMm);
    setPressureAngleDeg(DEFAULT_GEAR_INPUTS.pressureAngleDeg);
    setHelixAngleDeg(18);
    setApplicationFactor(DEFAULT_GEAR_INPUTS.applicationFactor);
    setSelectedMaterialId(DEFAULT_GEAR_INPUTS.materialId);
    setIsRunning(true);
    setRotationSpeed(0.1);
  }, []);

  // Apply benchmark preset
  const handleApplyPreset = useCallback((presetId: string) => {
    const preset = GEAR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const inp = preset.inputs;
    setGearType(inp.gearType);
    setPowerKw(inp.powerKw);
    setPinionRpm(inp.pinionRpm);
    setModuleMm(inp.moduleMm);
    setPinionTeeth(inp.pinionTeeth);
    setGearTeeth(inp.gearTeeth);
    setFaceWidthMm(inp.faceWidthMm);
    setPressureAngleDeg(inp.pressureAngleDeg);
    if (inp.gearType === 'helical') {
      setHelixAngleDeg(inp.helixAngleDeg);
    }
    setApplicationFactor(inp.applicationFactor);
    setSelectedMaterialId(inp.materialId);
  }, []);

  const activeMaterial: GearMaterial = analysisResult.material;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner: Quick Presets, Controls & Status Indicator */}
      <div className="glass-panel grid grid-cols-1 gap-4 rounded-[28px] p-4 sm:p-5 md:grid-cols-12">
        {/* Gear Mode Switcher */}
        <div data-tour="gear-mode" className="flex flex-col gap-2 md:col-span-4">
          <label className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
            {pick('Gear Configuration Mode', 'Mode Konfigurasi Roda Gigi', '歯車形式・駆動モード')}
          </label>
          <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            <button
              type="button"
              onClick={() => setGearType('spur')}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs transition ${
                gearType === 'spur'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              {pick('Spur Gears (Direct / 0°)', 'Roda Gigi Lurus (Spur / 0°)', '平歯車（スパーギヤ 0°）')}
            </button>
            <button
              type="button"
              onClick={() => setGearType('helical')}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs transition ${
                gearType === 'helical'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              {pick('Helical Gears (Smooth / ψ)', 'Roda Gigi Helikal (ψ)', 'はすば歯車（ヘリカルギヤ ψ）')}
            </button>
          </div>
        </div>

        {/* Animation & Speed Controls */}
        <div className="flex flex-col justify-between gap-2 border-[var(--md-outline-variant)]/50 md:col-span-4 md:border-l md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Rotation & Physical Speed', 'Rotasi & Kecepatan Fisik', '回転・実周速シミュレーション')}
            </span>
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${
                isRunning
                  ? 'm3-btn-tonal'
                  : 'm3-btn-filled'
              }`}
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isRunning
                ? pick('Pause', 'Jeda', '一時停止')
                : pick('Run', 'Putar', '開始')}
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            {[
              { val: 0.05, label: '0.05×' },
              { val: 0.1, label: '0.1×' },
              { val: 0.25, label: '0.25×' },
              { val: 1.0, label: pick('1× Actual', '1× Nyata', '1× 実速度') },
            ].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setRotationSpeed(val)}
                className={`flex-1 rounded-full py-1 text-[11px] transition ${
                  Math.abs(rotationSpeed - val) < 0.01
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Presets & Actions */}
        <div data-tour="gear-presets" className="flex flex-col justify-between gap-2 border-[var(--md-outline-variant)]/50 md:col-span-4 md:border-l md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Engineering Benchmarks', 'Benchmark Rekayasa', '標準ベンチマーク')}
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[var(--md-primary)]" />
          </div>

          <div className="flex items-center gap-1.5">
            <select
              onChange={(e) => handleApplyPreset(e.target.value)}
              defaultValue=""
              className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            >
              <option value="" disabled>
                {pick('Select Preset Case...', 'Pilih Kasus Preset...', 'プリセットを選択...')}
              </option>
              {GEAR_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {pick(p.nameEn, p.nameId, p.nameJa)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleReset}
              title={pick('Reset to defaults', 'Reset ke awal', '初期化')}
              className="glass-pill flex items-center justify-center rounded-full p-2"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exportGearDataToCsv(analysisResult)}
              title={pick('Export CSV Report', 'Unduh CSV', 'CSV出力')}
              className="glass-pill flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: SVG & Live Analysis (7 cols) + Right Controls (5 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: Pure-2D Industrial SVG & Live Analysis Dashboard (lg:col-span-7) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <GearStrengthSvg
            analysis={analysisResult}
            isRunning={isRunning}
            rotationSpeed={rotationSpeed}
          />

          {/* Safety Status Alert Banner */}
          <div
            data-tour="gear-safety"
            className={`flex items-start gap-3 rounded-[24px] border p-4 transition-colors ${
              analysisResult.status === 'SAFE'
                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                : analysisResult.status === 'MARGINAL'
                  ? 'border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                  : 'border-red-500/35 bg-red-500/10 text-red-900 dark:text-red-200'
            }`}
          >
            {analysisResult.status === 'SAFE' ? (
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : analysisResult.status === 'MARGINAL' ? (
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <OctagonAlert className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span>
                  {analysisResult.status === 'SAFE'
                    ? pick('Transmission Within Safe Limits (AGMA Compliance)', 'Transmisi Memenuhi Batas Aman AGMA', 'AGMA規格 安全基準適合（高信頼性）')
                    : analysisResult.status === 'MARGINAL'
                      ? pick('Marginal Safety Margin: Elevated Risk of Fatigue', 'Batas Keamanan Marjinal: Risiko Fatik Tinggi', '注意：安全率が推奨下限に近接（寿命短縮リスク）')
                      : pick('CRITICAL OVERSTRESS: Risk of Fatigue Tooth Breakage or Pitting', 'OVERSTRESS KRITIS: Risiko Patah Gigi atau Pitting Parah', '警告：許容応力超過（歯元折損・激しいピッチング破壊の危険）')}
                </span>
                <span className="text-[11px] font-extrabold uppercase">
                  {analysisResult.status}
                </span>
              </div>
              <p className="mt-1 leading-relaxed opacity-90">
                {analysisResult.status === 'SAFE'
                  ? pick(
                      `Both bending safety (SF = ${analysisResult.bendingSafetyFactor.toFixed(2)}) and contact durability (SH = ${analysisResult.contactSafetyFactor.toFixed(2)}) exceed AGMA minimum recommended design thresholds. Max transmissible power is ${analysisResult.maxTransmissiblePowerKw.toFixed(1)} kW.`,
                      `Faktor keamanan lentur (SF = ${analysisResult.bendingSafetyFactor.toFixed(2)}) dan ketahanan kontak (SH = ${analysisResult.contactSafetyFactor.toFixed(2)}) melampaui batas minimum AGMA. Kapasitas daya maksimum ${analysisResult.maxTransmissiblePowerKw.toFixed(1)} kW.`,
                      `曲げ安全率（SF = ${analysisResult.bendingSafetyFactor.toFixed(2)}）および面圧安全率（SH = ${analysisResult.contactSafetyFactor.toFixed(2)}）ともに推奨基準を満たしています。最大許容伝達容量は ${analysisResult.maxTransmissiblePowerKw.toFixed(1)} kW です。`
                    )
                  : analysisResult.status === 'MARGINAL'
                    ? pick(
                        `Safety margins are below optimal industrial standards (SF ≥ 1.40, SH ≥ 1.15). Operating under shock loads may initiate micro-pitting or root microcracks. Increase module, face width, or upgrade to carburized steel.`,
                        `Margin keamanan di bawah standar optimal industri (SF ≥ 1.40, SH ≥ 1.15). Beban kejut dapat memicu pitting awal atau retak mikro akar gigi. Perbesar modul, lebar muka, atau ganti material ke baja karburasi.`,
                        `安全裕度が産業推奨基準（SF ≥ 1.40, SH ≥ 1.15）を下回っています。モジュールの拡大、歯幅の増加、または浸炭焼入れ鋼への変更を推奨します。`
                      )
                    : pick(
                        `Calculated stresses exceed allowable material strength (${analysisResult.criticalFailureMode === 'bending_fatigue' ? 'Bending Fatigue Failure' : 'Surface Contact Pitting Failure'}). Immediate redesign required!`,
                        `Tegangan terhitung melampaui kekuatan izin material (${analysisResult.criticalFailureMode === 'bending_fatigue' ? 'Kegagalan Fatik Lentur' : 'Kegagalan Pitting Permukaan'}). Desain ulang segera diperlukan!`,
                        `計算応力が材料の許容限度を超過しています（${analysisResult.criticalFailureMode === 'bending_fatigue' ? '歯元曲げ疲労折損' : '歯面ヘルツ面圧ピッチング破壊'}）。直ちに諸元の見直しが必要です！`
                      )}
              </p>
            </div>
          </div>

          {/* Key Metric Summary Cards (Large, High-Legibility Glass Cards) */}
          <div data-tour="gear-metrics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Nominal Torque T₁', 'Torsi Nominal T₁', '入力トルク T₁')}
              </span>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {analysisResult.pinionTorqueNm.toFixed(1)}{' '}
                <span className="font-sans text-xs font-medium text-[var(--md-on-surface-variant)]">N·m</span>
              </div>
              <div className="mt-0.5 text-xs text-[var(--md-on-surface-variant)]">
                {inputs.powerKw} kW @ {inputs.pinionRpm} rpm
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Bending σ_b', 'Lentur σ_b', '曲げ応力 σ_b')}
              </span>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-primary)]">
                {analysisResult.lewisBendingStressMpa.toFixed(1)}{' '}
                <span className="font-sans text-xs font-medium text-[var(--md-on-surface-variant)]">MPa</span>
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--md-on-surface)]">
                Limit {activeMaterial.allowableBendingMpa} • SF {analysisResult.bendingSafetyFactor.toFixed(2)}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Contact σ_c', 'Kontak σ_c', '接触応力 σ_c')}
              </span>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-primary)]">
                {analysisResult.contactStressMpa.toFixed(1)}{' '}
                <span className="font-sans text-xs font-medium text-[var(--md-on-surface-variant)]">MPa</span>
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--md-on-surface)]">
                Limit {activeMaterial.allowableContactMpa} • SH {analysisResult.contactSafetyFactor.toFixed(2)}
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-3.5">
              <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Pitch Speed v', 'Kecepatan v', '周速 v')}
              </span>
              <div className="mt-1 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {analysisResult.pitchLineVelocityMps.toFixed(2)}{' '}
                <span className="font-sans text-xs font-medium text-[var(--md-on-surface-variant)]">m/s</span>
              </div>
              <div className="mt-0.5 font-mono text-xs text-[var(--md-on-surface-variant)]">
                Kv = {analysisResult.dynamicFactorKv.toFixed(2)} • J = {analysisResult.geometryFactorJ.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Helical vs Spur Engineering Assessment & 2D Top-View Tooth Angle Schematic */}
          {gearType === 'helical' && spurBaseline && (
            <div className="glass-panel rounded-[28px] border border-[var(--md-primary)]/35 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--md-on-surface)]">
                    {pick(
                      'Is This Helical Gear Good? — Engineering Assessment',
                      'Apakah Roda Gigi Helikal Ini Baik? — Evaluasi Desain',
                      'はすば歯車（ヘリカル）設計評価：平歯車との比較'
                    )}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                    analysisResult.helicalVerdict === 'optimal'
                      ? 'bg-emerald-600 text-white'
                      : analysisResult.helicalVerdict === 'partial-overlap'
                        ? 'bg-amber-500 text-amber-950'
                        : 'bg-red-600 text-white'
                  }`}
                >
                  {analysisResult.helicalVerdict === 'optimal'
                    ? pick('GOOD DESIGN (Optimal Overlap)', 'DESAIN BAIK (Overlap Optimal)', '良好設計（最適オーバーラップ）')
                    : analysisResult.helicalVerdict === 'partial-overlap'
                      ? pick('PARTIAL OVERLAP (Increase b or ψ)', 'OVERLAP KURANG (Perbesar b / ψ)', '噛合い不足（歯幅bまたはねじれ角ψ増加推奨）')
                      : pick('EXCESSIVE AXIAL THRUST (Reduce ψ)', 'GAYA AKSIAL TERLALU BESAR (Kurangi ψ)', 'スラスト過大（ψ≤25°推奨）')}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                {/* 2D Top-View Helical Tooth Angle & Axial Thrust Diagram */}
                <div className="flex flex-col items-center rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2.5 md:col-span-5">
                  <span className="mb-1 text-[11px] font-bold tracking-wide text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Top View: Helical Face Mesh', 'Tampak Atas: Sudut Gigi Heliks', '上面図：ねじれ角とスラスト力')}
                  </span>
                  <svg viewBox="0 0 240 112" className="h-auto max-h-[115px] w-full select-none" fontFamily="var(--font-sans)">
                    <defs>
                      <marker id="topArrRed" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                      </marker>
                      <marker id="topArrPrimary" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--md-primary)" />
                      </marker>
                    </defs>
                    {/* Gear face body (top-down cylinder slice of width b) */}
                    <rect x="42" y="20" width="156" height="58" rx="6" fill="var(--md-surface-container-highest)" stroke="var(--md-outline)" strokeWidth="1.5" />
                    {/* Slanted helical teeth across face width at helix angle psi */}
                    {[-45, -15, 15, 45, 75].map((xOff) => {
                      const shift = Math.tan((helixAngleDeg * Math.PI) / 180) * 58;
                      const x1 = Math.max(44, Math.min(196, 95 + xOff - shift / 2));
                      const x2 = Math.max(44, Math.min(196, 95 + xOff + shift / 2));
                      return (
                        <line
                          key={xOff}
                          x1={x1}
                          y1="22"
                          x2={x2}
                          y2="76"
                          stroke="var(--md-primary)"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {/* Centerline / Axial reference */}
                    <line x1="25" y1="49" x2="215" y2="49" stroke="var(--md-outline)" strokeWidth="1" strokeDasharray="4 3" />
                    {/* Helix Angle ψ indicator */}
                    <text x="120" y="13" textAnchor="middle" fill="var(--md-primary)" fontSize="10.5" fontWeight="800" fontFamily="var(--font-mono)">
                      Helix Angle ψ = {helixAngleDeg}° (b = {faceWidthMm} mm)
                    </text>
                    {/* Tangential Force Wt (vertical) */}
                    <line x1="120" y1="49" x2="120" y2="95" stroke="#ef4444" strokeWidth="2.2" markerEnd="url(#topArrRed)" />
                    <text x="128" y="96" fill="#ef4444" fontSize="11" fontWeight="800" fontFamily="var(--font-mono)">
                      Wₜ ({analysisResult.tangentialForceN.toFixed(0)} N)
                    </text>
                    {/* Axial Thrust Wa (horizontal along shaft!) */}
                    <line x1="120" y1="49" x2="188" y2="49" stroke="var(--md-primary)" strokeWidth="2.5" markerEnd="url(#topArrPrimary)" />
                    <rect x="148" y="29" width="84" height="16" rx="6" fill="var(--md-surface-container-low)" fillOpacity="0.92" stroke="var(--md-primary)" strokeWidth="1" />
                    <text x="190" y="41" textAnchor="middle" fill="var(--md-primary)" fontSize="10.5" fontWeight="800" fontFamily="var(--font-mono)">
                      Wₐ = {analysisResult.axialForceN.toFixed(0)} N
                    </text>
                  </svg>
                </div>

                {/* Plain-Language Pros, Cons & Exact Deltas vs Spur */}
                <div className="flex flex-col gap-2 text-xs md:col-span-7">
                  {(() => {
                    const bendPct =
                      ((analysisResult.lewisBendingStressMpa - spurBaseline.lewisBendingStressMpa) /
                        spurBaseline.lewisBendingStressMpa) *
                      100;
                    const contactPct =
                      ((analysisResult.contactStressMpa - spurBaseline.contactStressMpa) /
                        spurBaseline.contactStressMpa) *
                      100;
                    const thrustPct =
                      (analysisResult.axialForceN / Math.max(1, analysisResult.tangentialForceN)) * 100;

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] p-2.5">
                            <span className="text-[11px] text-[var(--md-on-surface-variant)]">
                              {pick('vs Equivalent Spur (0°)', 'vs Gigi Lurus Spur (0°)', '平歯車（0°）比')}
                            </span>
                            <div className="mt-0.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {bendPct.toFixed(1)}% {pick('Bending Stress', 'Tegangan Lentur', '曲げ応力')}
                            </div>
                            <div className="font-mono font-bold text-[var(--md-primary)]">
                              {contactPct.toFixed(1)}% {pick('Contact Stress', 'Tegangan Kontak', '接触面圧')}
                            </div>
                          </div>

                          <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] p-2.5">
                            <span className="text-[11px] text-[var(--md-on-surface-variant)]">
                              {pick('Helical Overlap Ratio ε_β', 'Rasio Overlap Helikal ε_β', '重なり噛合い率 ε_β')}
                            </span>
                            <div
                              className={`mt-0.5 font-mono text-sm font-extrabold ${
                                analysisResult.axialContactRatio >= 1.0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {analysisResult.axialContactRatio.toFixed(2)}{' '}
                              <span className="font-sans text-xs font-semibold">
                                ({analysisResult.axialContactRatio >= 1.0 ? '≥ 1.0 Full' : '< 1.0 Partial'})
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                              {pick('Target ≥ 1.0 for quiet mesh', 'Target ≥ 1.0 untuk mulus', '目標 ≥ 1.0（静粛連続噛合い）')}
                            </div>
                          </div>
                        </div>

                        <p className="leading-relaxed text-[var(--md-on-surface-variant)]">
                          {analysisResult.helicalVerdict === 'optimal'
                            ? pick(
                                `Yes, this helical gear is well-tuned: teeth engage progressively (ε_β = ${analysisResult.axialContactRatio.toFixed(2)} ≥ 1.0), reducing bending & pitting stresses compared to Spur while keeping axial bearing thrust moderate (${thrustPct.toFixed(0)}% of Wt). Use angular-contact or tapered roller bearings to support Wa = ${analysisResult.axialForceN.toFixed(0)} N.`,
                                `Ya, desain helikal ini optimal: gigi bertaut bertahap (ε_β = ${analysisResult.axialContactRatio.toFixed(2)} ≥ 1.0), menurunkan tegangan lentur & kontak dibanding Spur dengan gaya aksial masih wajar (${thrustPct.toFixed(0)}% dari Wt). Gunakan bantalan kontak sudut/tirus untuk menahan Wa = ${analysisResult.axialForceN.toFixed(0)} N.`,
                                `良好な設計です：連続的な斜め噛合い（ε_β = ${analysisResult.axialContactRatio.toFixed(2)} ≥ 1.0）により、平歯車より曲げ・面圧応力が低減され静粛性が向上しています。スラスト力 Wa = ${analysisResult.axialForceN.toFixed(0)} N（Wtの${thrustPct.toFixed(0)}%）を受けるため、アンギュラ玉軸受や円すいころ軸受を選定してください。`
                              )
                            : analysisResult.helicalVerdict === 'partial-overlap'
                              ? pick(
                                  `Not ideal yet: Axial overlap ratio ε_β = ${analysisResult.axialContactRatio.toFixed(2)} is below 1.0, so you lose the full quietness and load-sharing benefits of helical teeth. Increase Face Width (b) or Helix Angle (ψ) until ε_β ≥ 1.0.`,
                                  `Belum ideal: Rasio overlap aksial ε_β = ${analysisResult.axialContactRatio.toFixed(2)} masih di bawah 1.0 sehingga manfaat kehalusan helikal belum penuh. Perbesar Lebar Muka (b) atau Sudut Heliks (ψ) hingga ε_β ≥ 1.0.`,
                                  `改善推奨：重なり噛合い率 ε_β = ${analysisResult.axialContactRatio.toFixed(2)} < 1.0 のため、はすば歯車の連続静粛性が十分発揮されていません。歯幅 (b) またはねじれ角 (ψ) を増やして ε_β ≥ 1.0 にしてください。`
                                )
                              : pick(
                                  `Caution: Helix angle ψ = ${helixAngleDeg}° generates very high axial thrust Wa = ${analysisResult.axialForceN.toFixed(0)} N (${thrustPct.toFixed(0)}% of Wt), overloading shaft bearings. Reduce ψ to 15°–22° or use a double-helical (herringbone) gear.`,
                                  `Peringatan: Sudut heliks ψ = ${helixAngleDeg}° menghasilkan gaya aksial sangat besar Wa = ${analysisResult.axialForceN.toFixed(0)} N (${thrustPct.toFixed(0)}% dari Wt) yang membebani bantalan. Turunkan ψ ke 15°–22° atau pakai roda gigi double-helical.`,
                                  `注意：ねじれ角 ψ = ${helixAngleDeg}° が大きすぎるため、スラスト荷重 Wa = ${analysisResult.axialForceN.toFixed(0)} N（Wtの${thrustPct.toFixed(0)}%）が過大となり軸受寿命を縮めます。ψ を 15°〜22° に下げるか、やまば歯車（ダブルヘリカル）を検討してください。`
                                )}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Controls, Sliders & Material Selection (lg:col-span-5) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Material Selection Card */}
          <div data-tour="gear-material" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                {pick('Gear Material & Heat Treatment', 'Material Roda Gigi & Perlakuan Panas', '歯車材質・熱処理仕様')}
              </span>
              <Layers className="h-4 w-4 text-[var(--md-primary)]" />
            </div>

            <div className="mt-3 flex flex-col gap-2.5">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              >
                {PRESET_GEAR_MATERIALS.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name} ({mat.hardness})
                  </option>
                ))}
                <option value="custom">
                  {pick('Custom Material (User Defined)', 'Material Kustom (Ditentukan Pengguna)', 'カスタム材料（ユーザー設定）')}
                </option>
              </select>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3 text-xs text-[var(--md-on-surface-variant)]">
                <div className="flex justify-between font-semibold">
                  <span>
                    {pick('Allowable Bending [σ_b]:', 'Batas Izin Lentur [σ_b]:', '許容曲げ応力 [σ_b]:')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {activeMaterial.allowableBendingMpa} MPa
                  </span>
                </div>
                <div className="mt-1 flex justify-between font-semibold">
                  <span>
                    {pick('Allowable Contact [σ_c]:', 'Batas Izin Kontak [σ_c]:', '許容接触応力 [σ_c]:')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {activeMaterial.allowableContactMpa} MPa
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--md-on-surface-variant)]">
                  {pick(
                    activeMaterial.descriptionEn,
                    activeMaterial.descriptionId,
                    activeMaterial.descriptionJa
                  )}
                </p>
              </div>

              {/* Custom Material Accordion */}
              {selectedMaterialId === 'custom' && (
                <div className="grid grid-cols-2 gap-2.5 rounded-[22px] border border-[var(--md-primary)]/40 bg-[var(--md-primary-container)]/35 p-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[var(--md-on-surface)]">
                      Young's Modulus E (GPa)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={350}
                      value={customMaterialProps.youngsModulusGpa}
                      onChange={(e) =>
                        setCustomMaterialProps((p) => ({
                          ...p,
                          youngsModulusGpa: Number(e.target.value),
                        }))
                      }
                      className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[var(--md-on-surface)]">
                      Poisson's Ratio ν
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      min={0.15}
                      max={0.45}
                      value={customMaterialProps.poissonsRatio}
                      onChange={(e) =>
                        setCustomMaterialProps((p) => ({
                          ...p,
                          poissonsRatio: Number(e.target.value),
                        }))
                      }
                      className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[var(--md-on-surface)]">
                      Allowable Bending (MPa)
                    </label>
                    <input
                      type="number"
                      min={30}
                      max={1000}
                      value={customMaterialProps.allowableBendingMpa}
                      onChange={(e) =>
                        setCustomMaterialProps((p) => ({
                          ...p,
                          allowableBendingMpa: Number(e.target.value),
                        }))
                      }
                      className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[var(--md-on-surface)]">
                      Allowable Contact (MPa)
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={2500}
                      value={customMaterialProps.allowableContactMpa}
                      onChange={(e) =>
                        setCustomMaterialProps((p) => ({
                          ...p,
                          allowableContactMpa: Number(e.target.value),
                        }))
                      }
                      className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Operating Parameters Card */}
          <div data-tour="gear-kinematics" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                {pick('Power & Kinematic Inputs', 'Input Daya & Kinematika', '動力・運動諸元設定')}
              </span>
              <Zap className="h-4 w-4 text-[var(--md-primary)]" />
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {/* Power Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-[var(--md-on-surface-variant)]">
                  <span>{pick('Transmitted Power P', 'Daya Transmisi P', '伝達動力 P')}</span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {powerKw.toFixed(1)} kW
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={75.0}
                  step={0.5}
                  value={powerKw}
                  onChange={(e) => setPowerKw(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Pinion RPM Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-medium text-[var(--md-on-surface-variant)]">
                  <span>{pick('Pinion Speed n₁', 'Kecepatan Pinion n₁', 'ピニオン回転数 n₁')}</span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {pinionRpm} RPM
                  </span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={3600}
                  step={50}
                  value={pinionRpm}
                  onChange={(e) => setPinionRpm(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Module & Face Width side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium text-[var(--md-on-surface-variant)]">
                    <span>{pick('Module m', 'Modul m', 'モジュール m')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {moduleMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.5}
                    max={10.0}
                    step={0.5}
                    value={moduleMm}
                    onChange={(e) => setModuleMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium text-[var(--md-on-surface-variant)]">
                    <span>{pick('Face Width b', 'Lebar Muka b', '歯幅 b')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {faceWidthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    step={5}
                    value={faceWidthMm}
                    onChange={(e) => setFaceWidthMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Teeth Counts z1, z2 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium text-[var(--md-on-surface-variant)]">
                    <span>{pick('Pinion Teeth z₁', 'Gigi Pinion z₁', 'ピニオン歯数 z₁')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {pinionTeeth}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={36}
                    step={1}
                    value={pinionTeeth}
                    onChange={(e) => setPinionTeeth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium text-[var(--md-on-surface-variant)]">
                    <span>{pick('Gear Teeth z₂', 'Gigi Gear z₂', '大歯車歯数 z₂')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {gearTeeth}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={96}
                    step={2}
                    value={gearTeeth}
                    onChange={(e) => setGearTeeth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Pressure Angle & Application Factor */}
              <div className="grid grid-cols-2 gap-3 border-t border-[var(--md-outline-variant)]/50 pt-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Pressure Angle α', 'Sudut Tekan α', '基準圧力角 α')}
                  </label>
                  <select
                    value={pressureAngleDeg}
                    onChange={(e) => setPressureAngleDeg(Number(e.target.value))}
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    <option value={20}>20° (Standard Full-Depth)</option>
                    <option value={25}>25° (High Strength Root)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Application Factor K_o', 'Faktor Aplikasi K_o', '使用衝撃係数 K_o')}
                  </label>
                  <select
                    value={applicationFactor}
                    onChange={(e) => setApplicationFactor(Number(e.target.value))}
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    <option value={1.0}>1.00 - Uniform (Motor/Fan)</option>
                    <option value={1.25}>1.25 - Light Shock (Pump/Agitator)</option>
                    <option value={1.5}>1.50 - Moderate Shock (Crane/Mill)</option>
                    <option value={1.75}>1.75 - Heavy Shock (Crusher/Mining)</option>
                  </select>
                </div>
              </div>

              {/* Helical Angle (if helical) */}
              {gearType === 'helical' && (
                <div className="flex flex-col gap-2 rounded-[22px] border border-[var(--md-primary)]/40 bg-[var(--md-primary-container)]/40 p-3.5 text-[var(--md-on-primary-container)]">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{pick('Helix Angle ψ (Recommended: 15°–22°)', 'Sudut Heliks ψ (Saran: 15°–22°)', 'ねじれ角 ψ（推奨：15°〜22°）')}</span>
                    <span className="font-mono font-extrabold text-[var(--md-primary)]">
                      {helixAngleDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={35}
                    step={1}
                    value={helixAngleDeg}
                    onChange={(e) => setHelixAngleDeg(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between font-mono text-xs opacity-85">
                    <span>mt = {analysisResult.transverseModuleMm.toFixed(2)} mm</span>
                    <span>ε_β = {analysisResult.axialContactRatio.toFixed(2)}</span>
                    <span>Wa = {analysisResult.axialForceN.toFixed(0)} N</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
