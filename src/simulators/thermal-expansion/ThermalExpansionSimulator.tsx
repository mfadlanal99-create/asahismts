/* oxlint-disable react/only-export-components */
import { useMemo, useState, type FC } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Flame,
  Gauge,
  RotateCcw,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeBarExpansion,
  computeBimetallicStrip,
  computeShrinkFit,
  exportThermalDataToCsv,
  PRESETS,
  THERMAL_MATERIALS,
  type BarExpansionInputs,
  type BimetallicStripInputs,
  type ShrinkFitInputs,
  type SimulatorMode,
  type ThermalMaterial,
  type ThermalMaterialId,
} from './thermalExpansionData';
import { ThermalExpansionSvg } from './ThermalExpansionSvg';

export { thermalExpansionMeta } from './thermalExpansionMeta';

export const ThermalExpansionSimulator: FC = () => {
  const { pick } = useLanguage();

  // Mode Selection
  const [mode, setMode] = useState<SimulatorMode>('bar-constraint');

  // Mode 1: Bar Expansion & Constraint State
  const [barMaterialId, setBarMaterialId] = useState<ThermalMaterialId>('steel-a36');
  const [barLengthMm, setBarLengthMm] = useState<number>(1000);
  const [barDiameterMm, setBarDiameterMm] = useState<number>(40);
  const [barTempC, setBarTempC] = useState<number>(120);
  const [barIsConstrained, setBarIsConstrained] = useState<boolean>(true);
  const [barGapMm, setBarGapMm] = useState<number>(0.5);

  // Mode 2: Shrink Fit Hub-on-Shaft State
  const [shaftMaterialId, setShaftMaterialId] = useState<ThermalMaterialId>('steel-a36');
  const [hubMaterialId, setHubMaterialId] = useState<ThermalMaterialId>('steel-a36');
  const [shaftDiameterMm, setShaftDiameterMm] = useState<number>(60);
  const [hubOuterDiameterMm, setHubOuterDiameterMm] = useState<number>(120);
  const [engagementLengthMm, setEngagementLengthMm] = useState<number>(80);
  const [interferenceMm, setInterferenceMm] = useState<number>(0.06);
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.18);
  const [heatingDeltaTC, setHeatingDeltaTC] = useState<number>(150);

  // Mode 3: Bimetallic Strip State
  const [layer1MaterialId, setLayer1MaterialId] = useState<ThermalMaterialId>('brass-c360');
  const [layer2MaterialId, setLayer2MaterialId] = useState<ThermalMaterialId>('invar-36');
  const [stripLengthMm, setStripLengthMm] = useState<number>(120);
  const [stripWidthMm, setStripWidthMm] = useState<number>(12);
  const [layer1ThicknessMm, setLayer1ThicknessMm] = useState<number>(1.0);
  const [layer2ThicknessMm, setLayer2ThicknessMm] = useState<number>(1.0);
  const [bimetalTempC, setBimetalTempC] = useState<number>(100);
  const [switchGapMm, setSwitchGapMm] = useState<number>(2.5);

  // Active Material Lookups
  const barMaterial: ThermalMaterial = useMemo(
    () => THERMAL_MATERIALS.find((m) => m.id === barMaterialId) ?? THERMAL_MATERIALS[0],
    [barMaterialId]
  );
  const shaftMaterial: ThermalMaterial = useMemo(
    () => THERMAL_MATERIALS.find((m) => m.id === shaftMaterialId) ?? THERMAL_MATERIALS[0],
    [shaftMaterialId]
  );
  const hubMaterial: ThermalMaterial = useMemo(
    () => THERMAL_MATERIALS.find((m) => m.id === hubMaterialId) ?? THERMAL_MATERIALS[0],
    [hubMaterialId]
  );
  const layer1Material: ThermalMaterial = useMemo(
    () => THERMAL_MATERIALS.find((m) => m.id === layer1MaterialId) ?? THERMAL_MATERIALS[4],
    [layer1MaterialId]
  );
  const layer2Material: ThermalMaterial = useMemo(
    () => THERMAL_MATERIALS.find((m) => m.id === layer2MaterialId) ?? THERMAL_MATERIALS[5],
    [layer2MaterialId]
  );

  // Computations
  const barInputs: BarExpansionInputs = useMemo(
    () => ({
      material: barMaterial,
      lengthMm: barLengthMm,
      diameterMm: barDiameterMm,
      initialTempC: 20,
      currentTempC: barTempC,
      isConstrained: barIsConstrained,
      gapMm: barGapMm,
    }),
    [barMaterial, barLengthMm, barDiameterMm, barTempC, barIsConstrained, barGapMm]
  );
  const barResults = useMemo(() => computeBarExpansion(barInputs), [barInputs]);

  const shrinkInputs: ShrinkFitInputs = useMemo(
    () => ({
      shaftMaterial,
      hubMaterial,
      shaftDiameterMm,
      hubOuterDiameterMm,
      engagementLengthMm,
      diametralInterferenceMm: interferenceMm,
      frictionCoeff,
      heatingDeltaTC,
    }),
    [
      shaftMaterial,
      hubMaterial,
      shaftDiameterMm,
      hubOuterDiameterMm,
      engagementLengthMm,
      interferenceMm,
      frictionCoeff,
      heatingDeltaTC,
    ]
  );
  const shrinkResults = useMemo(() => computeShrinkFit(shrinkInputs), [shrinkInputs]);

  const bimetalInputs: BimetallicStripInputs = useMemo(
    () => ({
      layer1Material,
      layer2Material,
      lengthMm: stripLengthMm,
      widthMm: stripWidthMm,
      layer1ThicknessMm,
      layer2ThicknessMm,
      initialTempC: 20,
      currentTempC: bimetalTempC,
      switchGapMm,
    }),
    [
      layer1Material,
      layer2Material,
      stripLengthMm,
      stripWidthMm,
      layer1ThicknessMm,
      layer2ThicknessMm,
      bimetalTempC,
      switchGapMm,
    ]
  );
  const bimetalResults = useMemo(() => computeBimetallicStrip(bimetalInputs), [bimetalInputs]);

  // Handle Preset Selection
  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setMode(preset.mode);
    if (preset.barConfig) {
      if (preset.barConfig.material) setBarMaterialId(preset.barConfig.material.id);
      if (preset.barConfig.lengthMm) setBarLengthMm(preset.barConfig.lengthMm);
      if (preset.barConfig.diameterMm) setBarDiameterMm(preset.barConfig.diameterMm);
      if (preset.barConfig.currentTempC) setBarTempC(preset.barConfig.currentTempC);
      if (preset.barConfig.isConstrained !== undefined) setBarIsConstrained(preset.barConfig.isConstrained);
      if (preset.barConfig.gapMm !== undefined) setBarGapMm(preset.barConfig.gapMm);
    }
    if (preset.shrinkConfig) {
      if (preset.shrinkConfig.shaftMaterial) setShaftMaterialId(preset.shrinkConfig.shaftMaterial.id);
      if (preset.shrinkConfig.hubMaterial) setHubMaterialId(preset.shrinkConfig.hubMaterial.id);
      if (preset.shrinkConfig.shaftDiameterMm) setShaftDiameterMm(preset.shrinkConfig.shaftDiameterMm);
      if (preset.shrinkConfig.hubOuterDiameterMm) setHubOuterDiameterMm(preset.shrinkConfig.hubOuterDiameterMm);
      if (preset.shrinkConfig.engagementLengthMm) setEngagementLengthMm(preset.shrinkConfig.engagementLengthMm);
      if (preset.shrinkConfig.diametralInterferenceMm) setInterferenceMm(preset.shrinkConfig.diametralInterferenceMm);
      if (preset.shrinkConfig.frictionCoeff) setFrictionCoeff(preset.shrinkConfig.frictionCoeff);
      if (preset.shrinkConfig.heatingDeltaTC) setHeatingDeltaTC(preset.shrinkConfig.heatingDeltaTC);
    }
    if (preset.bimetalConfig) {
      if (preset.bimetalConfig.layer1Material) setLayer1MaterialId(preset.bimetalConfig.layer1Material.id);
      if (preset.bimetalConfig.layer2Material) setLayer2MaterialId(preset.bimetalConfig.layer2Material.id);
      if (preset.bimetalConfig.lengthMm) setStripLengthMm(preset.bimetalConfig.lengthMm);
      if (preset.bimetalConfig.widthMm) setStripWidthMm(preset.bimetalConfig.widthMm);
      if (preset.bimetalConfig.layer1ThicknessMm) setLayer1ThicknessMm(preset.bimetalConfig.layer1ThicknessMm);
      if (preset.bimetalConfig.layer2ThicknessMm) setLayer2ThicknessMm(preset.bimetalConfig.layer2ThicknessMm);
      if (preset.bimetalConfig.currentTempC) setBimetalTempC(preset.bimetalConfig.currentTempC);
      if (preset.bimetalConfig.switchGapMm) setSwitchGapMm(preset.bimetalConfig.switchGapMm);
    }
  };

  const handleReset = () => {
    if (mode === 'bar-constraint') {
      setBarMaterialId('steel-a36');
      setBarLengthMm(1000);
      setBarDiameterMm(40);
      setBarTempC(120);
      setBarIsConstrained(true);
      setBarGapMm(0.5);
    } else if (mode === 'shrink-fit') {
      setShaftMaterialId('steel-a36');
      setHubMaterialId('steel-a36');
      setShaftDiameterMm(60);
      setHubOuterDiameterMm(120);
      setEngagementLengthMm(80);
      setInterferenceMm(0.06);
      setFrictionCoeff(0.18);
      setHeatingDeltaTC(150);
    } else {
      setLayer1MaterialId('brass-c360');
      setLayer2MaterialId('invar-36');
      setStripLengthMm(120);
      setStripWidthMm(12);
      setLayer1ThicknessMm(1.0);
      setLayer2ThicknessMm(1.0);
      setBimetalTempC(100);
      setSwitchGapMm(2.5);
    }
  };

  const handleExportCsv = () => {
    exportThermalDataToCsv(
      mode,
      { inputs: barInputs, results: barResults },
      { inputs: shrinkInputs, results: shrinkResults },
      { inputs: bimetalInputs, results: bimetalResults }
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Controls Ribbon */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-4 sm:p-5">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
          <button
            type="button"
            onClick={() => setMode('bar-constraint')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all ${
              mode === 'bar-constraint'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Thermometer className="h-4 w-4" />
            {pick('1. Bar & Restrained Stress', '1. Batang & Tegangan Terkekang', '1. 棒膨張・熱応力拘束')}
          </button>
          <button
            type="button"
            onClick={() => setMode('shrink-fit')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all ${
              mode === 'shrink-fit'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Gauge className="h-4 w-4" />
            {pick('2. Shrink Fit Hub-on-Shaft', '2. Suaian Susut Poros-Hub', '2. 軸・ハブ焼きばめ')}
          </button>
          <button
            type="button"
            onClick={() => setMode('bimetallic')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all ${
              mode === 'bimetallic'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Zap className="h-4 w-4" />
            {pick('3. Bimetallic Thermostat', '3. Termostat Bimetal', '3. バイメタル素子')}
          </button>
        </div>

        {/* Action Buttons: Presets, Reset, Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Presets Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="hidden text-xs font-semibold text-[var(--md-on-surface-variant)] sm:inline">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-[var(--md-primary)]" />
              {pick('Preset:', 'Preset:', 'プリセット:')}
            </span>
            <select
              onChange={(e) => applyPreset(e.target.value)}
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                {pick('-- Select Scenario --', '-- Pilih Skenario --', '-- シナリオ選択 --')}
              </option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {pick(p.name, p.nameId, p.nameJa)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleReset}
            title={pick('Reset to defaults', 'Reset ke awal', '初期設定に戻す')}
            className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{pick('Reset', 'Reset', 'リセット')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="m3-btn-filled flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Main CAD Viewport and Telemetry */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left 7 Cols: Interactive 2D SVG & Telemetry Cards */}
        <div className="space-y-4 lg:col-span-7">
          {/* Pure-2D CAD SVG */}
          <ThermalExpansionSvg
            mode={mode}
            barData={{ inputs: barInputs, results: barResults }}
            shrinkData={{ inputs: shrinkInputs, results: shrinkResults }}
            bimetalData={{ inputs: bimetalInputs, results: bimetalResults }}
          />

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {mode === 'bar-constraint' && (
              <>
                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Free Expansion', 'Ekspansi Bebas', '自由熱膨張量')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-on-surface)]">
                      {barResults.freeExpansionMm >= 0 ? `+${barResults.freeExpansionMm.toFixed(3)}` : barResults.freeExpansionMm.toFixed(3)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">mm</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    α·L₀·ΔT ({barMaterial.alpha} µm/m·°C)
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Actual Stroke', 'Langkah Aktual', '実際の伸び変位')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-on-surface)]">
                      {barResults.actualExpansionMm.toFixed(3)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">mm</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {barResults.isContactingWall ? pick('Wall Contacted', 'Menyentuh Dinding', '壁面当接中') : pick('Gap Open', 'Celah Terbuka', '隙間あり')}
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Thermal Stress', 'Tegangan Termal', '圧縮熱応力')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`font-mono text-xl font-bold ${
                        barResults.isYielded
                          ? 'text-red-600 dark:text-red-400'
                          : barResults.thermalStressMpa > 0
                          ? 'text-[var(--md-primary)]'
                          : 'text-[var(--md-on-surface)]'
                      }`}
                    >
                      {barResults.thermalStressMpa.toFixed(1)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">MPa</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {pick('Yield:', 'Luluh:', '降伏応力:')} {barMaterial.yieldStrengthMpa} MPa
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Wall Axial Thrust', 'Gaya Dorong Aksial', '支持部軸推力')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-on-surface)]">
                      {barResults.thrustForceKn.toFixed(2)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">kN</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    F = σ · A (A = {barResults.crossSectionAreaMm2.toFixed(0)} mm²)
                  </span>
                </div>
              </>
            )}

            {mode === 'shrink-fit' && (
              <>
                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Hot Clearance', 'Celah Saat Panas', '加熱時隙間')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`font-mono text-xl font-bold ${
                        shrinkResults.canSlipFit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500'
                      }`}
                    >
                      {shrinkResults.assemblyClearanceMm >= 0 ? `+${shrinkResults.assemblyClearanceMm.toFixed(3)}` : shrinkResults.assemblyClearanceMm.toFixed(3)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">mm</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {shrinkResults.canSlipFit ? pick('SLIP-ON READY', 'BISA MASUK', '挿入可能') : pick('TIGHT (NEED HEAT)', 'KURANG PANAS', '加熱不足')}
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Contact Pressure', 'Tekanan Kontak', '境界面接触面圧')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-on-surface)]">
                      {shrinkResults.contactPressureMpa.toFixed(1)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">MPa</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    Lamé Thick Cylinder p_c
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Torque Capacity', 'Kapasitas Torsi', '伝達トルク容量')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-primary)]">
                      {shrinkResults.torqueCapacityNm.toFixed(0)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">N·m</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {pick('Axial Hold:', 'Tahan Aksial:', '軸推力容量:')} {shrinkResults.axialHoldingForceKn.toFixed(1)} kN
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Hub Von Mises / SF', 'Von Mises Hub / SF', 'ハブ応力 / 安全率')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span
                      className={`font-mono text-xl font-bold ${
                        shrinkResults.isHubYielded
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-[var(--md-on-surface)]'
                      }`}
                    >
                      {shrinkResults.hubInnerVonMisesStressMpa.toFixed(0)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">MPa (SF: {shrinkResults.hubSafetyFactor.toFixed(2)})</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {shrinkResults.isHubYielded ? pick('WARNING: PLASTIC YIELD', 'PERINGATAN: LULUH', '警告: 塑性降伏') : pick('ELASTIC SAFE', 'AMAN ELASTIS', '弾性安全')}
                  </span>
                </div>
              </>
            )}

            {mode === 'bimetallic' && (
              <>
                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Tip Deflection', 'Defleksi Ujung', '先端たわみ量')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-on-surface)]">
                      {bimetalResults.tipDeflectionMm >= 0 ? `+${bimetalResults.tipDeflectionMm.toFixed(3)}` : bimetalResults.tipDeflectionMm.toFixed(3)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">mm</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    δ = κ·L₀²/2 ({bimetalResults.tipAngleDeg.toFixed(2)}°)
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Curvature κ', 'Kelengkungan κ', '曲率 κ (1/ρ)')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-on-surface)]">
                      {(bimetalResults.curvatureMm1 * 1e3).toFixed(3)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">×10⁻³ mm⁻¹</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    ρ = {bimetalResults.radiusOfCurvatureMm === Infinity ? '∞' : `${bimetalResults.radiusOfCurvatureMm.toFixed(0)} mm`}
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Switch Status', 'Status Sakelar', 'スイッチ状態')}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {bimetalResults.isSwitchClosed ? (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4" />
                        {pick('CLOSED (TRIP)', 'TERPUTUS (TRIP)', '作動・接点閉')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        {pick('OPEN (NORMAL)', 'TERBUKA (NORMAL)', '正常・開路')}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {pick('Gap Setting:', 'Celah Kontak:', '接点ギャップ:')} {switchGapMm.toFixed(2)} mm
                  </span>
                </div>

                <div className="glass-card flex flex-col rounded-[24px] p-3.5">
                  <span className="block text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                    {pick('Trip Temp T_trip', 'Suhu Pemicu T', 'トリップ設定温度')}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-mono text-xl font-bold text-[var(--md-primary)]">
                      {bimetalResults.tripTempC.toFixed(1)}
                    </span>
                    <span className="text-xs text-[var(--md-on-surface-variant)]">°C</span>
                  </div>
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    ΔT_trip = {bimetalResults.tripDeltaTC.toFixed(1)} °C
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Interactive Parameter Control Sidebar */}
        <div className="space-y-4 lg:col-span-5">
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="flex items-center gap-2 text-sm font-bold text-[var(--md-on-surface)]">
                <Flame className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('Thermal Controls', 'Kontrol Termal', 'パラメータ調整')}
              </span>
              <span className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {mode === 'bar-constraint' && pick('Free / Restrained', 'Bebas / Terkekang', '自由 / 拘束')}
                {mode === 'shrink-fit' && pick('Hub & Shaft Lamé', 'Poros & Hub Lamé', '焼きばめラメ理論')}
                {mode === 'bimetallic' && pick('Timoshenko Bimetal', 'Bimetal Timoshenko', 'ティモシェンコ模型')}
              </span>
            </div>

            {/* Mode 1 Controls */}
            {mode === 'bar-constraint' && (
              <div className="space-y-3.5 text-xs">
                {/* Material Choice */}
                <div>
                  <label className="mb-1.5 block font-bold text-[var(--md-on-surface)]">
                    {pick('Bar Material', 'Material Batang', '棒の材質')}
                  </label>
                  <select
                    value={barMaterialId}
                    onChange={(e) => setBarMaterialId(e.target.value as ThermalMaterialId)}
                    className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    {THERMAL_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (α = {m.alpha} × 10⁻⁶/°C)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-[var(--md-on-surface-variant)]">
                    {pick(barMaterial.descriptionEn, barMaterial.descriptionId, barMaterial.descriptionJa)}
                  </p>
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Current Temperature T', 'Temperatur Operasi T', '設定温度 T')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {barTempC} °C (ΔT = {barTempC - 20 >= 0 ? `+${barTempC - 20}` : barTempC - 20} °C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="500"
                    step="5"
                    value={barTempC}
                    onChange={(e) => setBarTempC(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                    <span>-50 °C</span>
                    <span>20 °C (Ambient)</span>
                    <span>500 °C</span>
                  </div>
                </div>

                {/* Length Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Initial Length L₀', 'Panjang Mula L₀', '初期長さ L₀')}</span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">{barLengthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="50"
                    value={barLengthMm}
                    onChange={(e) => setBarLengthMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Diameter Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Diameter d', 'Diameter Batang d', '棒の直径 d')}</span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">{barDiameterMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="2"
                    value={barDiameterMm}
                    onChange={(e) => setBarDiameterMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Restrained Toggle & Gap Setting */}
                <div className="space-y-2.5 border-t border-[var(--md-outline-variant)]/50 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--md-on-surface)]">
                      {pick('Rigid Abutment Constraint', 'Kekangan Dinding Kaku', '剛体壁による拘束')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBarIsConstrained(!barIsConstrained)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        barIsConstrained
                          ? 'bg-[var(--md-primary)]'
                          : 'border-[var(--md-outline)] bg-[var(--md-surface-container-highest)]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out ${
                          barIsConstrained
                            ? 'translate-x-4 bg-[var(--md-on-primary)]'
                            : 'translate-x-0 bg-[var(--md-outline)]'
                        }`}
                      />
                    </button>
                  </div>

                  {barIsConstrained && (
                    <div>
                      <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                        <span>{pick('Expansion Gap δ_gap', 'Celah Ekspansi δ_gap', '膨張隙間 δ_gap')}</span>
                        <span className="font-mono font-bold text-[var(--md-primary)]">{barGapMm.toFixed(2)} mm</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="4.0"
                        step="0.05"
                        value={barGapMm}
                        onChange={(e) => setBarGapMm(Number(e.target.value))}
                        className="w-full"
                      />
                      <span className="mt-1 block text-[10.5px] text-[var(--md-on-surface-variant)]">
                        {pick(
                          'Zero gap = immediately restrained. Gap > 0 = free expansion until contact.',
                          'Celah nol = langsung terkekang. Celah > 0 = bebas sampai menyentuh.',
                          '隙間ゼロ＝即時拘束。隙間あり＝当接するまで自由膨張。'
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode 2 Controls */}
            {mode === 'shrink-fit' && (
              <div className="space-y-3.5 text-xs">
                {/* Shaft & Hub Materials */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1.5 block font-bold text-[var(--md-on-surface)]">
                      {pick('Shaft Material', 'Material Poros', '軸材料')}
                    </label>
                    <select
                      value={shaftMaterialId}
                      onChange={(e) => setShaftMaterialId(e.target.value as ThermalMaterialId)}
                      className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    >
                      {THERMAL_MATERIALS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-bold text-[var(--md-on-surface)]">
                      {pick('Hub Material', 'Material Hub', 'ハブ材料')}
                    </label>
                    <select
                      value={hubMaterialId}
                      onChange={(e) => setHubMaterialId(e.target.value as ThermalMaterialId)}
                      className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    >
                      {THERMAL_MATERIALS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hub Heating ΔT Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Hub Heating ΔT', 'Pemanasan Hub ΔT', 'ハブ加熱温度差 ΔT')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      +{heatingDeltaTC} °C (T = {20 + heatingDeltaTC} °C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="350"
                    step="5"
                    value={heatingDeltaTC}
                    onChange={(e) => setHeatingDeltaTC(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                    <span>0 °C</span>
                    <span>Min Req: {shrinkResults.minDeltaTZeroClearanceC.toFixed(0)} °C</span>
                    <span>350 °C</span>
                  </div>
                </div>

                {/* Shaft Diameter & Interference */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Shaft OD (d)', 'Diameter Poros (d)', '軸外径 (d)')}</span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">{shaftDiameterMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="150"
                    step="5"
                    value={shaftDiameterMm}
                    onChange={(e) => {
                      const newD = Number(e.target.value);
                      setShaftDiameterMm(newD);
                      if (hubOuterDiameterMm <= newD * 1.3) {
                        setHubOuterDiameterMm(Math.round(newD * 2));
                      }
                    }}
                    className="w-full"
                  />
                </div>

                {/* Hub Outer Diameter */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Hub Outer OD (D₀)', 'Diameter Luar Hub (D₀)', 'ハブ外径 (D₀)')}</span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">{hubOuterDiameterMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(shaftDiameterMm * 1.3)}
                    max="300"
                    step="5"
                    value={hubOuterDiameterMm}
                    onChange={(e) => setHubOuterDiameterMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Interference Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Diametral Interference (δ)', 'Interferensi Diameter (δ)', '直径しまりばめ量 (δ)')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {(interferenceMm * 1000).toFixed(0)} µm ({interferenceMm.toFixed(3)} mm)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.20"
                    step="0.005"
                    value={interferenceMm}
                    onChange={(e) => setInterferenceMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Hub Length & Friction Coeff */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1.5 block font-semibold text-[var(--md-on-surface)]">
                      {pick('Length L', 'Panjang L', '嵌合長 L')}
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="300"
                      step="5"
                      value={engagementLengthMm}
                      onChange={(e) => setEngagementLengthMm(Number(e.target.value))}
                      className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-semibold text-[var(--md-on-surface)]">
                      {pick('Friction μ', 'Gesek μ', '摩擦係数 μ')}
                    </label>
                    <input
                      type="number"
                      min="0.05"
                      max="0.45"
                      step="0.01"
                      value={frictionCoeff}
                      onChange={(e) => setFrictionCoeff(Number(e.target.value))}
                      className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3 Controls */}
            {mode === 'bimetallic' && (
              <div className="space-y-3.5 text-xs">
                {/* Material Selection: Layer 1 & 2 */}
                <div>
                  <label className="mb-1.5 block font-bold text-[var(--md-on-surface)]">
                    {pick('Layer 1 (High Expansion α₁)', 'Lapisan 1 (Ekspansi Tinggi α₁)', '層1（高熱膨張 α₁）')}
                  </label>
                  <select
                    value={layer1MaterialId}
                    onChange={(e) => setLayer1MaterialId(e.target.value as ThermalMaterialId)}
                    className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    {THERMAL_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (α = {m.alpha})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-bold text-[var(--md-on-surface)]">
                    {pick('Layer 2 (Low Expansion α₂)', 'Lapisan 2 (Ekspansi Rendah α₂)', '層2（低熱膨張 α₂）')}
                  </label>
                  <select
                    value={layer2MaterialId}
                    onChange={(e) => setLayer2MaterialId(e.target.value as ThermalMaterialId)}
                    className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    {THERMAL_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (α = {m.alpha})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Temperature T', 'Temperatur T', '温度 T')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">
                      {bimetalTempC} °C (ΔT = {bimetalTempC - 20 >= 0 ? `+${bimetalTempC - 20}` : bimetalTempC - 20} °C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="250"
                    step="5"
                    value={bimetalTempC}
                    onChange={(e) => setBimetalTempC(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                    <span>-40 °C</span>
                    <span>20 °C</span>
                    <span>250 °C</span>
                  </div>
                </div>

                {/* Strip Length */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Strip Length L₀', 'Panjang Strip L₀', '帯の有効長さ L₀')}</span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">{stripLengthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={stripLengthMm}
                    onChange={(e) => setStripLengthMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Layer Thicknesses */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                      <span>t₁</span>
                      <span className="font-mono">{layer1ThicknessMm.toFixed(1)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="3.0"
                      step="0.1"
                      value={layer1ThicknessMm}
                      onChange={(e) => setLayer1ThicknessMm(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                      <span>t₂</span>
                      <span className="font-mono">{layer2ThicknessMm.toFixed(1)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="3.0"
                      step="0.1"
                      value={layer2ThicknessMm}
                      onChange={(e) => setLayer2ThicknessMm(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Switch Contact Gap Slider */}
                <div>
                  <div className="mb-1.5 flex justify-between font-semibold text-[var(--md-on-surface)]">
                    <span>{pick('Contact Trip Gap', 'Celah Pemicu Sakelar', '接点トリップ隙間')}</span>
                    <span className="font-mono font-bold text-[var(--md-primary)]">{switchGapMm.toFixed(2)} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={switchGapMm}
                    onChange={(e) => setSwitchGapMm(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="mt-1 block text-[10px] text-[var(--md-on-surface-variant)]">
                    {pick('Tip deflection reaches gap to trip circuit.', 'Defleksi mencapai celah untuk memutus kontak.', '先端変位が隙間に達すると接点動作。')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
