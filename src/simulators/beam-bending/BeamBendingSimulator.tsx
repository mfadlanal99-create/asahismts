/* oxlint-disable react/only-export-components */
import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Download,
  Layers,
  OctagonAlert,
  RotateCcw,
  Ruler,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  analyzeBeam,
  exportBeamDataToCsv,
  BEAM_PRESETS,
  DEFAULT_BEAM_INPUTS,
  PRESET_MATERIALS,
  DEFAULT_SECTION_DIMS,
  computeSectionProperties,
  type BeamInputs,
  type BeamType,
  type LoadType,
  type CrossSectionShape,
  type SectionDimensions,
  type BeamMaterial,
} from './beamBendingData';
import { BeamBendingSvg } from './BeamBendingSvg';

export { beamBendingMeta } from './beamBendingMeta';

export function BeamBendingSimulator() {
  const { pick } = useLanguage();

  // Primary configuration state
  const [beamType, setBeamType] = useState<BeamType>('simply-supported');
  const [spanM, setSpanM] = useState<number>(4.0);
  const [overhangM, setOverhangM] = useState<number>(1.2);

  // Loading state
  const [loadType, setLoadType] = useState<LoadType>('point');
  const [pointLoadKn, setPointLoadKn] = useState<number>(20.0);
  const [pointLoadPosM, setPointLoadPosM] = useState<number>(2.0);
  const [udlKnM, setUdlKnM] = useState<number>(8.0);
  const [udlStartM, setUdlStartM] = useState<number>(0.0);
  const [udlEndM, setUdlEndM] = useState<number>(4.0);

  // Cross-section state
  const [sectionShape, setSectionShape] = useState<CrossSectionShape>('i-beam');
  const [sectionDims, setSectionDims] = useState<SectionDimensions>(DEFAULT_SECTION_DIMS);

  // Material state
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('steel-a36');
  const [customMaterialProps, setCustomMaterialProps] = useState({
    youngsModulusGpa: 200,
    yieldStrengthMpa: 250,
    densityKgM3: 7850,
  });

  // Visualization state
  const [deflectionMultiplier, setDeflectionMultiplier] = useState<number>(15);

  // Active material resolution
  const activeMaterial: BeamMaterial = useMemo(() => {
    if (selectedMaterialId === 'custom') {
      return {
        id: 'custom',
        name: pick('Custom Material', 'Material Kustom', 'カスタム材料'),
        category: 'ferrous',
        youngsModulusGpa: customMaterialProps.youngsModulusGpa,
        yieldStrengthMpa: customMaterialProps.yieldStrengthMpa,
        ultimateStrengthMpa: customMaterialProps.yieldStrengthMpa * 1.5,
        densityKgM3: customMaterialProps.densityKgM3,
        color: '#8b5cf6',
        descriptionEn: 'User-specified custom isotropic material properties.',
        descriptionId: 'Sifat mekanis material isotropik kustom yang ditentukan pengguna.',
        descriptionJa: 'ユーザー定義の等方性材料力学特性。',
      };
    }
    return (
      PRESET_MATERIALS.find((m) => m.id === selectedMaterialId) ?? PRESET_MATERIALS[0]
    );
  }, [selectedMaterialId, customMaterialProps, pick]);

  // Total beam span
  const totalLengthM = useMemo(() => {
    return beamType === 'overhanging' ? spanM + Math.max(0.1, overhangM) : spanM;
  }, [beamType, spanM, overhangM]);

  // Combined inputs bundle
  const inputs: BeamInputs = useMemo(() => {
    return {
      beamType,
      spanM,
      overhangM,
      loadType,
      pointLoadKn,
      pointLoadPosM: Math.min(pointLoadPosM, totalLengthM),
      udlKnM,
      udlStartM: Math.min(udlStartM, totalLengthM),
      udlEndM: Math.min(udlEndM, totalLengthM),
      sectionShape,
      sectionDims,
      material: activeMaterial,
    };
  }, [
    beamType,
    spanM,
    overhangM,
    loadType,
    pointLoadKn,
    pointLoadPosM,
    totalLengthM,
    udlKnM,
    udlStartM,
    udlEndM,
    sectionShape,
    sectionDims,
    activeMaterial,
  ]);

  // Run analytical finite mechanics solver
  const analysisResult = useMemo(() => {
    return analyzeBeam(inputs);
  }, [inputs]);

  // Real-time computed cross-section properties
  const liveSection = useMemo(() => {
    return computeSectionProperties(sectionShape, sectionDims, activeMaterial.densityKgM3);
  }, [sectionShape, sectionDims, activeMaterial.densityKgM3]);

  // Action: Reset to defaults
  const handleReset = useCallback(() => {
    setBeamType(DEFAULT_BEAM_INPUTS.beamType);
    setSpanM(DEFAULT_BEAM_INPUTS.spanM);
    setOverhangM(DEFAULT_BEAM_INPUTS.overhangM);
    setLoadType(DEFAULT_BEAM_INPUTS.loadType);
    setPointLoadKn(DEFAULT_BEAM_INPUTS.pointLoadKn);
    setPointLoadPosM(DEFAULT_BEAM_INPUTS.pointLoadPosM);
    setUdlKnM(DEFAULT_BEAM_INPUTS.udlKnM);
    setUdlStartM(DEFAULT_BEAM_INPUTS.udlStartM);
    setUdlEndM(DEFAULT_BEAM_INPUTS.udlEndM);
    setSectionShape(DEFAULT_BEAM_INPUTS.sectionShape);
    setSectionDims(DEFAULT_SECTION_DIMS);
    setSelectedMaterialId('steel-a36');
  }, []);

  // Action: Apply preset
  const handleApplyPreset = (presetId: string) => {
    const preset = BEAM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.inputs.beamType) setBeamType(preset.inputs.beamType);
    if (preset.inputs.spanM !== undefined) setSpanM(preset.inputs.spanM);
    if (preset.inputs.overhangM !== undefined) setOverhangM(preset.inputs.overhangM);
    if (preset.inputs.loadType) setLoadType(preset.inputs.loadType);
    if (preset.inputs.pointLoadKn !== undefined) setPointLoadKn(preset.inputs.pointLoadKn);
    if (preset.inputs.pointLoadPosM !== undefined) setPointLoadPosM(preset.inputs.pointLoadPosM);
    if (preset.inputs.udlKnM !== undefined) setUdlKnM(preset.inputs.udlKnM);
    if (preset.inputs.udlStartM !== undefined) setUdlStartM(preset.inputs.udlStartM);
    if (preset.inputs.udlEndM !== undefined) setUdlEndM(preset.inputs.udlEndM);
  };

  // Allowable deflection benchmark (L / 360)
  const lOver360Mm = (totalLengthM * 1000) / 360;
  const isDeflectionPass = Math.abs(analysisResult.maxDeflectionMm) <= lOver360Mm;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Configuration Bar */}
      <div className="glass-panel grid grid-cols-1 gap-4 rounded-[28px] p-4 sm:p-5 md:grid-cols-12">
        {/* Beam Support & Load Mode Selector */}
        <div data-tour="beam-support-load" className="flex flex-col gap-2.5 md:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Support System', 'Sistem Tumpuan', '支持条件')}
            </span>
            {/* Beam Type toggle buttons */}
            <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <button
                type="button"
                onClick={() => {
                  setBeamType('simply-supported');
                  if (pointLoadPosM > spanM) setPointLoadPosM(spanM / 2);
                  if (udlEndM > spanM) setUdlEndM(spanM);
                }}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  beamType === 'simply-supported'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('Simply Supported', 'Sederhana', '単純支持')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBeamType('cantilever');
                  if (pointLoadPosM > spanM) setPointLoadPosM(spanM);
                  if (udlEndM > spanM) setUdlEndM(spanM);
                }}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  beamType === 'cantilever'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('Cantilever', 'Kantilever', '片持ち')}
              </button>
              <button
                type="button"
                onClick={() => setBeamType('overhanging')}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  beamType === 'overhanging'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('Overhang', 'Gantung', '張り出し')}
              </button>
            </div>
          </div>

          {/* Load Type Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Load Type', 'Jenis Beban', '荷重形態')}
            </span>
            <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <button
                type="button"
                onClick={() => setLoadType('point')}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  loadType === 'point'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('Point', 'Terpusat', '集中')}
              </button>
              <button
                type="button"
                onClick={() => setLoadType('udl')}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  loadType === 'udl'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('UDL', 'Merata', '等分布')}
              </button>
              <button
                type="button"
                onClick={() => setLoadType('combined')}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  loadType === 'combined'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('Combined', 'Kombinasi', '複合')}
              </button>
            </div>
          </div>
        </div>

        {/* Material Selection Dropdown */}
        <div data-tour="beam-material" className="flex flex-col gap-2 border-[var(--md-outline-variant)]/50 md:col-span-4 md:border-l md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Structural Material', 'Material Struktur', '構造材料')}
            </span>
            <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
              σy = {activeMaterial.yieldStrengthMpa} MPa
            </span>
          </div>

          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
          >
            {PRESET_MATERIALS.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name} (E={mat.youngsModulusGpa} GPa)
              </option>
            ))}
            <option value="custom">
              {pick('★ Custom User Material...', '★ Material Kustom...', '★ カスタム材料...')}
            </option>
          </select>

          <p className="line-clamp-1 text-[11px] text-[var(--md-on-surface-variant)]">
            {pick(activeMaterial.descriptionEn, activeMaterial.descriptionId, activeMaterial.descriptionJa)}
          </p>
        </div>

        {/* Quick Presets & Actions */}
        <div data-tour="beam-presets" className="flex flex-col justify-between gap-2 border-[var(--md-outline-variant)]/50 md:col-span-3 md:border-l md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Quick Presets', 'Preset Cepat', '標準プリセット')}
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[var(--md-primary)]" />
          </div>

          <select
            onChange={(e) => handleApplyPreset(e.target.value)}
            defaultValue=""
            className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
          >
            <option value="" disabled>
              {pick('Select Standard Benchmark...', 'Pilih Kasus Uji Standar...', 'ベンチマークを選択...')}
            </option>
            {BEAM_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {pick(p.nameEn, p.nameId, p.nameJa)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title={pick('Reset to defaults', 'Reset ke pengaturan awal', '初期設定にリセット')}
              className="glass-pill flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {pick('Reset', 'Reset', 'リセット')}
            </button>
            <button
              type="button"
              onClick={() => exportBeamDataToCsv(analysisResult)}
              title={pick('Export SFD/BMD/Deflection CSV', 'Unduh CSV Data SFD/BMD', 'CSVデータ出力')}
              className="m3-btn-tonal flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Custom Material Accordion (if selected) */}
      {selectedMaterialId === 'custom' && (
        <div className="grid grid-cols-1 gap-3 rounded-[24px] border border-[var(--md-primary)]/40 bg-[var(--md-primary-container)]/35 p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--md-on-surface)]">
              Young’s Modulus E (GPa)
            </label>
            <input
              type="number"
              min={1}
              max={600}
              value={customMaterialProps.youngsModulusGpa}
              onChange={(e) =>
                setCustomMaterialProps((p) => ({ ...p, youngsModulusGpa: Number(e.target.value) }))
              }
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--md-on-surface)]">
              Yield Strength σy (MPa)
            </label>
            <input
              type="number"
              min={5}
              max={2000}
              value={customMaterialProps.yieldStrengthMpa}
              onChange={(e) =>
                setCustomMaterialProps((p) => ({ ...p, yieldStrengthMpa: Number(e.target.value) }))
              }
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--md-on-surface)]">
              Density ρ (kg/m³)
            </label>
            <input
              type="number"
              min={100}
              max={20000}
              value={customMaterialProps.densityKgM3}
              onChange={(e) =>
                setCustomMaterialProps((p) => ({ ...p, densityKgM3: Number(e.target.value) }))
              }
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Main Interactive Grid: SVG Diagram View (7 cols) + Right Controls & Section CAD (5 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: Pure-2D Industrial SVG & Live Analysis Dashboard (lg:col-span-7) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* SVG Frame Container */}
          <div data-tour="beam-diagrams" className="glass-panel flex flex-col overflow-hidden rounded-[28px] p-4 sm:p-5">
            {/* Header bar with deflection scale slider */}
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[var(--md-primary)]" />
                <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                  {pick('Beam Deflection & Force Diagrams', 'Defleksi Balok & Diagram Gaya', '梁のたわみ・断面力図')}
                </span>
              </div>

              {/* Deflection visual exaggeration toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Deflection Scale:', 'Skala Defleksi:', 'たわみ倍率:')}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDeflectionMultiplier((m) => (m === 5 ? 15 : m === 15 ? 30 : 5))
                  }
                  className="m3-btn-tonal rounded-full px-3 py-1 text-[11px] font-bold"
                >
                  {deflectionMultiplier}x Exaggeration
                </button>
              </div>
            </div>

            {/* Pure-2D SVG Visualizer */}
            <div className="flex w-full items-center justify-center pt-3">
              <BeamBendingSvg
                analysis={analysisResult}
                deflectionMultiplier={deflectionMultiplier}
              />
            </div>
          </div>

          {/* Key Engineering Metrics Dashboard */}
          <div data-tour="beam-diagnostics" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Reactions Card */}
            <div className="glass-card flex flex-col gap-1 rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Reactions', 'Gaya Reaksi', '支点反力')}
              </span>
              <div className="flex flex-col text-xs font-mono font-bold text-[var(--md-on-surface)]">
                <span>R_A: {analysisResult.reactions.rAKn.toFixed(1)} kN</span>
                {beamType === 'cantilever' ? (
                  <span>M_A: {analysisResult.reactions.mAKNm.toFixed(1)} kNm</span>
                ) : (
                  <span>R_B: {analysisResult.reactions.rBKn.toFixed(1)} kN</span>
                )}
              </div>
            </div>

            {/* Peak Internal Forces Card */}
            <div className="glass-card flex flex-col gap-1 rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Extremes (V, M)', 'Ekstrem (V, M)', '最大断面力')}
              </span>
              <div className="flex flex-col text-xs font-mono font-bold">
                <span className="text-[var(--md-on-surface)]">
                  |V|_max: {analysisResult.absMaxShearKn.toFixed(1)} kN
                </span>
                <span className="text-[var(--md-primary)]">
                  |M|_max: {analysisResult.absMaxMomentKNm.toFixed(1)} kNm
                </span>
              </div>
            </div>

            {/* Max Deflection Card */}
            <div className="glass-card flex flex-col gap-1 rounded-[24px] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                  {pick('Max Deflection', 'Lendutan Maks', '最大たわみ')}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    isDeflectionPass
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isDeflectionPass ? '≤ L/360' : '> L/360'}
                </span>
              </div>
              <div className="flex flex-col text-xs font-mono font-bold">
                <span className="text-[var(--md-primary)]">
                  δ_max: {analysisResult.maxDeflectionMm.toFixed(2)} mm
                </span>
                <span className="text-[10px] font-normal text-[var(--md-on-surface-variant)]">
                  @ x = {analysisResult.maxDeflectionPosM.toFixed(2)} m
                </span>
              </div>
            </div>

            {/* Stress & Safety Factor Card */}
            <div
              className={`glass-card flex flex-col gap-1 rounded-[24px] border p-3.5 ${
                analysisResult.status === 'SAFE'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : analysisResult.status === 'MARGINAL'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-red-500/40 bg-red-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                  {pick('Safety Factor', 'Faktor Keamanan', '降伏安全率')}
                </span>
                {analysisResult.status === 'SAFE' ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : analysisResult.status === 'MARGINAL' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <OctagonAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-sm font-bold text-[var(--md-on-surface)]">
                  FoS: {analysisResult.safetyFactor >= 90 ? '∞' : analysisResult.safetyFactor.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    analysisResult.status === 'SAFE'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : analysisResult.status === 'MARGINAL'
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {analysisResult.status}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                σ_max: {analysisResult.maxStressMpa.toFixed(1)} MPa
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Geometry, Load Controls & Cross-Section CAD (lg:col-span-5) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Sliders & Geometry Panel */}
          <div data-tour="beam-loads" className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[var(--md-primary)]" />
                <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                  {pick('Geometry & Load Parameters', 'Parameter Geometri & Beban', '形状・荷重スライダー')}
                </span>
              </div>
            </div>

            {/* Span Length Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[var(--md-on-surface-variant)]">
                  {pick('Span Length L', 'Panjang Bentang L', '支間長 L')}:
                </span>
                <span className="font-mono font-bold text-[var(--md-on-surface)]">
                  {spanM.toFixed(2)} m
                </span>
              </div>
              <input
                type="range"
                min={1.0}
                max={10.0}
                step={0.2}
                value={spanM}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpanM(val);
                  if (pointLoadPosM > val && beamType !== 'overhanging') setPointLoadPosM(val);
                  if (udlEndM > val && beamType !== 'overhanging') setUdlEndM(val);
                }}
                className="w-full"
              />
            </div>

            {/* Overhang Length Slider (Only visible when overhanging) */}
            {beamType === 'overhanging' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface-variant)]">
                    {pick('Overhang Length a', 'Panjang Gantung a', '張り出し長 a')}:
                  </span>
                  <span className="font-mono font-bold text-[var(--md-on-surface)]">
                    {overhangM.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  value={overhangM}
                  onChange={(e) => setOverhangM(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Point Load Magnitude & Position */}
            {(loadType === 'point' || loadType === 'combined') && (
              <div className="flex flex-col gap-2 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Point Load (P)', 'Beban Terpusat (P)', '集中荷重 (P)')}</span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {pointLoadKn.toFixed(1)} kN
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={80.0}
                  step={1.0}
                  value={pointLoadKn}
                  onChange={(e) => setPointLoadKn(Number(e.target.value))}
                  className="w-full"
                />

                <div className="flex justify-between text-[11px] text-[var(--md-on-surface-variant)]">
                  <span>{pick('Position x_P', 'Posisi x_P', '作用位置 x_P')}:</span>
                  <span className="font-mono font-semibold text-[var(--md-on-surface)]">
                    {pointLoadPosM.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={totalLengthM}
                  step={0.1}
                  value={pointLoadPosM}
                  onChange={(e) => setPointLoadPosM(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* UDL Intensity & Span */}
            {(loadType === 'udl' || loadType === 'combined') && (
              <div className="flex flex-col gap-2 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--md-on-surface)]">
                  <span>{pick('Distributed Load (w)', 'Beban Merata (w)', '等分布荷重 (w)')}</span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {udlKnM.toFixed(1)} kN/m
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={30.0}
                  step={0.5}
                  value={udlKnM}
                  onChange={(e) => setUdlKnM(Number(e.target.value))}
                  className="w-full"
                />

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-[var(--md-on-surface-variant)]">
                      Start (m): {udlStartM.toFixed(2)}
                    </span>
                    <input
                      type="range"
                      min={0.0}
                      max={totalLengthM}
                      step={0.2}
                      value={udlStartM}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setUdlStartM(val);
                        if (udlEndM < val) setUdlEndM(val);
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-[var(--md-on-surface-variant)]">
                      End (m): {udlEndM.toFixed(2)}
                    </span>
                    <input
                      type="range"
                      min={0.0}
                      max={totalLengthM}
                      step={0.2}
                      value={udlEndM}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setUdlEndM(val);
                        if (udlStartM > val) setUdlStartM(val);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cross-Section Engineering & Live 2D CAD Preview */}
          <div data-tour="beam-section" className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--md-primary)]" />
                <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                  {pick('Cross-Section Design', 'Desain Penampang', '断面設計・CAD')}
                </span>
              </div>
              {/* Shape selector tabs */}
              <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                <button
                  type="button"
                  onClick={() => setSectionShape('i-beam')}
                  className={`rounded-full px-2.5 py-0.5 text-xs transition-all ${
                    sectionShape === 'i-beam'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  I-Beam
                </button>
                <button
                  type="button"
                  onClick={() => setSectionShape('rect')}
                  className={`rounded-full px-2.5 py-0.5 text-xs transition-all ${
                    sectionShape === 'rect'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  Rect
                </button>
                <button
                  type="button"
                  onClick={() => setSectionShape('circle')}
                  className={`rounded-full px-2.5 py-0.5 text-xs transition-all ${
                    sectionShape === 'circle'
                      ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                      : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  Circle
                </button>
              </div>
            </div>

            {/* Live Cross-Section 2D CAD Drawing */}
            <div className="flex h-36 w-full items-center justify-center rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-2">
              <svg viewBox="0 0 240 140" className="h-full w-auto" fontFamily="var(--font-sans)">
                {/* Center crosshair */}
                <line x1={20} y1={70} x2={220} y2={70} stroke="var(--md-outline-variant)" strokeWidth="0.9" strokeDasharray="4 3" />
                <line x1={120} y1={10} x2={120} y2={130} stroke="var(--md-outline-variant)" strokeWidth="0.9" strokeDasharray="4 3" />
                <text x={222} y={73} fill="var(--md-on-surface-variant)" fontSize="8" fontWeight="bold" fontFamily="var(--font-mono)">
                  N.A.
                </text>

                {sectionShape === 'i-beam' && (
                  <g>
                    {/* Symmetrical I-Beam CAD Profile */}
                    <path
                      d="
                        M 75 25
                        L 165 25
                        L 165 42
                        L 128 42
                        L 128 98
                        L 165 98
                        L 165 115
                        L 75 115
                        L 75 98
                        L 112 98
                        L 112 42
                        L 75 42
                        Z
                      "
                      fill="var(--md-primary-container)"
                      fillOpacity="0.65"
                      stroke="var(--md-primary)"
                      strokeWidth="1.8"
                    />
                    {/* Dimension callouts */}
                    <text x={120} y={18} textAnchor="middle" fill="var(--md-primary)" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">
                      bf: {sectionDims.iBeamFlangeWidthMm}mm
                    </text>
                    <text x={65} y={72} textAnchor="end" fill="var(--md-primary)" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">
                      d: {sectionDims.iBeamHeightMm}mm
                    </text>
                  </g>
                )}

                {sectionShape === 'rect' && (
                  <g>
                    <rect
                      x={80}
                      y={25}
                      width={80}
                      height={90}
                      rx={4}
                      fill="var(--md-primary-container)"
                      fillOpacity="0.65"
                      stroke="var(--md-primary)"
                      strokeWidth="1.8"
                    />
                    <text x={120} y={18} textAnchor="middle" fill="var(--md-primary)" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">
                      b: {sectionDims.rectWidthMm}mm
                    </text>
                    <text x={70} y={72} textAnchor="end" fill="var(--md-primary)" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">
                      h: {sectionDims.rectHeightMm}mm
                    </text>
                  </g>
                )}

                {sectionShape === 'circle' && (
                  <g>
                    <circle
                      cx={120}
                      cy={70}
                      r={45}
                      fill="var(--md-primary-container)"
                      fillOpacity="0.65"
                      stroke="var(--md-primary)"
                      strokeWidth="1.8"
                    />
                    <text x={120} y={18} textAnchor="middle" fill="var(--md-primary)" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">
                      Ø {sectionDims.circleDiaMm}mm
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Shape Dimension Inputs */}
            {sectionShape === 'i-beam' && (
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Depth d (mm)</label>
                  <input
                    type="number"
                    min={50}
                    max={500}
                    value={sectionDims.iBeamHeightMm}
                    onChange={(e) =>
                      setSectionDims((d) => ({ ...d, iBeamHeightMm: Number(e.target.value) }))
                    }
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Flange bf (mm)</label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={sectionDims.iBeamFlangeWidthMm}
                    onChange={(e) =>
                      setSectionDims((d) => ({ ...d, iBeamFlangeWidthMm: Number(e.target.value) }))
                    }
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Flange tf (mm)</label>
                  <input
                    type="number"
                    min={3}
                    max={40}
                    step={0.5}
                    value={sectionDims.iBeamFlangeThicknessMm}
                    onChange={(e) =>
                      setSectionDims((d) => ({ ...d, iBeamFlangeThicknessMm: Number(e.target.value) }))
                    }
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Web tw (mm)</label>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    step={0.5}
                    value={sectionDims.iBeamWebThicknessMm}
                    onChange={(e) =>
                      setSectionDims((d) => ({ ...d, iBeamWebThicknessMm: Number(e.target.value) }))
                    }
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {sectionShape === 'rect' && (
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Width b (mm)</label>
                  <input
                    type="number"
                    min={10}
                    max={400}
                    value={sectionDims.rectWidthMm}
                    onChange={(e) =>
                      setSectionDims((d) => ({ ...d, rectWidthMm: Number(e.target.value) }))
                    }
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Height h (mm)</label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={sectionDims.rectHeightMm}
                    onChange={(e) =>
                      setSectionDims((d) => ({ ...d, rectHeightMm: Number(e.target.value) }))
                    }
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {sectionShape === 'circle' && (
              <div className="flex flex-col gap-1 text-xs">
                <label className="text-[10px] font-semibold text-[var(--md-on-surface-variant)]">Diameter d (mm)</label>
                <input
                  type="number"
                  min={10}
                  max={400}
                  value={sectionDims.circleDiaMm}
                  onChange={(e) =>
                    setSectionDims((d) => ({ ...d, circleDiaMm: Number(e.target.value) }))
                  }
                  className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                />
              </div>
            )}

            {/* Computed Section Properties Cards */}
            <div className="grid grid-cols-2 gap-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3 text-[11px] font-mono">
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-[var(--md-on-surface-variant)]">Moment of Inertia I_x</span>
                <span className="font-bold text-[var(--md-on-surface)]">
                  {(liveSection.momentOfInertiaMm4 / 1e6).toFixed(2)} × 10⁶ mm⁴
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-[var(--md-on-surface-variant)]">Section Modulus S_x</span>
                <span className="font-bold text-[var(--md-on-surface)]">
                  {(liveSection.sectionModulusMm3 / 1e3).toFixed(1)} × 10³ mm³
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-[var(--md-on-surface-variant)]">Cross-Section Area A</span>
                <span className="font-bold text-[var(--md-on-surface)]">
                  {liveSection.areaMm2.toFixed(0)} mm²
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[10px] text-[var(--md-on-surface-variant)]">Linear Mass</span>
                <span className="font-bold text-[var(--md-on-surface)]">
                  {liveSection.weightPerMeterKgM.toFixed(1)} kg/m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
