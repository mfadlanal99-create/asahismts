/* oxlint-disable react/only-export-components */
import { useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Flame,
  Layers,
  RotateCcw,
  Sparkles,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  calculateWeldStrength,
  ELECTRODE_GRADES,
  exportWeldDataToCsv,
  JOINT_PRESETS,
  type BracketWeldPattern,
  type FilletArrangement,
  type GrooveType,
  type JointMode,
  type JointPreset,
  type PenetrationType,
  type WeldOrientation,
  type WeldSimulatorInputs,
} from './weldStrengthData';
import { WeldStrengthSvg } from './WeldStrengthSvg';

export { weldStrengthMeta } from './weldStrengthMeta';

export function WeldStrengthSimulator() {
  const { pick } = useLanguage();

  // Mode & Electrode Configuration State
  const [mode, setMode] = useState<JointMode>('lap-tee');
  const [selectedElectrodeId, setSelectedElectrodeId] = useState<string>('e7018');

  // Dimensional States
  const [legSizeMm, setLegSizeMm] = useState<number>(8);
  const [weldLengthMm, setWeldLengthMm] = useState<number>(120);
  const [plateThicknessMm, setPlateThicknessMm] = useState<number>(12);
  const [plateWidthMm, setPlateWidthMm] = useState<number>(120);

  // Eccentric Bracket States
  const [bracketWidthMm, setBracketWidthMm] = useState<number>(100);
  const [bracketHeightMm, setBracketHeightMm] = useState<number>(160);
  const [eccentricityMm, setEccentricityMm] = useState<number>(150);

  // Loading States
  const [loadKn, setLoadKn] = useState<number>(80);
  const [bendingMomentKnm, setBendingMomentKnm] = useState<number>(0);

  // Joint Geometry Details
  const [filletArrangement, setFilletArrangement] = useState<FilletArrangement>('double');
  const [weldOrientation, setWeldOrientation] = useState<WeldOrientation>('transverse');
  const [bracketPattern, setBracketPattern] = useState<BracketWeldPattern>('two-vertical');
  const [penetrationType, setPenetrationType] = useState<PenetrationType>('cjp');
  const [grooveType, setGrooveType] = useState<GrooveType>('single-v');

  // Active Electrode
  const activeElectrode = useMemo(() => {
    return (
      ELECTRODE_GRADES.find((e) => e.id === selectedElectrodeId) ??
      ELECTRODE_GRADES[1]
    );
  }, [selectedElectrodeId]);

  // Combined Inputs Object
  const inputs: WeldSimulatorInputs = useMemo(
    () => ({
      mode,
      electrode: activeElectrode,
      legSizeMm,
      weldLengthMm,
      plateThicknessMm,
      plateWidthMm,
      bracketWidthMm,
      bracketHeightMm,
      eccentricityMm,
      loadKn,
      bendingMomentKnm,
      filletArrangement,
      weldOrientation,
      bracketPattern,
      penetrationType,
      grooveType,
    }),
    [
      mode,
      activeElectrode,
      legSizeMm,
      weldLengthMm,
      plateThicknessMm,
      plateWidthMm,
      bracketWidthMm,
      bracketHeightMm,
      eccentricityMm,
      loadKn,
      bendingMomentKnm,
      filletArrangement,
      weldOrientation,
      bracketPattern,
      penetrationType,
      grooveType,
    ]
  );

  // Calculated Results
  const results = useMemo(() => calculateWeldStrength(inputs), [inputs]);

  // Preset Application
  const handleApplyPreset = useCallback((preset: JointPreset) => {
    setMode(preset.mode);
    setSelectedElectrodeId(preset.electrodeId);
    setLegSizeMm(preset.legSizeMm);
    setWeldLengthMm(preset.weldLengthMm);
    setPlateThicknessMm(preset.plateThicknessMm);
    setPlateWidthMm(preset.plateWidthMm);
    setBracketWidthMm(preset.bracketWidthMm);
    setBracketHeightMm(preset.bracketHeightMm);
    setEccentricityMm(preset.eccentricityMm);
    setLoadKn(preset.loadKn);
    setBendingMomentKnm(preset.bendingMomentKnm);
    setFilletArrangement(preset.filletArrangement);
    setWeldOrientation(preset.weldOrientation);
    setBracketPattern(preset.bracketPattern);
    setPenetrationType(preset.penetrationType);
    setGrooveType(preset.grooveType);
  }, []);

  // Reset to Defaults
  const handleReset = useCallback(() => {
    setLegSizeMm(8);
    setWeldLengthMm(120);
    setPlateThicknessMm(12);
    setPlateWidthMm(120);
    setBracketWidthMm(100);
    setBracketHeightMm(160);
    setEccentricityMm(150);
    setLoadKn(80);
    setBendingMomentKnm(0);
    setFilletArrangement('double');
    setWeldOrientation('transverse');
    setBracketPattern('two-vertical');
    setPenetrationType('cjp');
    setGrooveType('single-v');
  }, []);

  // Export CSV
  const handleExportCsv = useCallback(() => {
    exportWeldDataToCsv(inputs, results);
  }, [inputs, results]);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Controls Toolbar: Joint Mode, Presets, and Actions */}
      <div className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--md-outline-variant)]/50 pb-3">
          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
              {pick('Joint Type', 'Jenis Sambungan', '継手形式')}:
            </span>
            <div className="flex flex-wrap rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
              <button
                type="button"
                onClick={() => setMode('lap-tee')}
                className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                  mode === 'lap-tee'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('1. Lap / T-Fillet', '1. Fillet Tumpang / T', '1. 重ね／T形すみ肉')}
              </button>
              <button
                type="button"
                onClick={() => setMode('eccentric-bracket')}
                className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                  mode === 'eccentric-bracket'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('2. Eccentric Bracket', '2. Braket Eksentrik', '2. 偏心ブラケット')}
              </button>
              <button
                type="button"
                onClick={() => setMode('butt-joint')}
                className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                  mode === 'butt-joint'
                    ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                    : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {pick('3. Butt Groove Weld', '3. Kampuh Tumpul', '3. 突合せ開先溶接')}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              title={pick('Reset parameters', 'Atur ulang parameter', 'パラメータリセット')}
              className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{pick('Reset', 'Reset', '初期化')}</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="m3-btn-filled flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{pick('Export CSV', 'Unduh CSV', 'CSV出力')}</span>
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-[var(--md-primary)]" />
            {pick('Presets', 'Preset Desain', '設計プリセット')}:
          </span>
          {JOINT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-1 text-[11px] font-semibold text-[var(--md-on-surface)] transition-colors hover:border-[var(--md-primary)] hover:bg-[var(--md-primary-container)] hover:text-[var(--md-on-primary-container)]"
            >
              {pick(preset.nameEn, preset.nameId, preset.nameJa)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Workspace: 12-Column Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Side: Industrial 2D CAD SVG Visualizer (7 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <WeldStrengthSvg inputs={inputs} results={results} />

          {/* Real-Time Stress & Safety Summary Pill Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* 1. Design Throat a */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Throat (a = 0.707s)', 'Tebal Leher a', '理論のど厚 a')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-lg font-black text-[var(--md-on-surface)]">
                  {results.throatMm.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">mm</span>
              </div>
            </div>

            {/* 2. Effective Area Aw */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Effective Area Aw', 'Luas Efektif Aw', '有効のど断面積 Aw')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-lg font-black text-[var(--md-primary)]">
                  {results.effectiveAreaAwMm2.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">mm²</span>
              </div>
            </div>

            {/* 3. Resultant Stress */}
            <div className="glass-card flex flex-col rounded-[24px] p-3.5">
              <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                {pick('Peak Joint Stress', 'Tegangan Puncak', '最大合成応力')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-lg font-black text-[var(--md-primary)]">
                  {results.peakCombinedStressMpa.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">MPa</span>
              </div>
            </div>

            {/* 4. Safety Factor & Status */}
            <div
              className={`glass-card flex flex-col rounded-[24px] border p-3.5 ${
                results.status === 'PASS'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : results.status === 'MARGINAL'
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-rose-500/40 bg-rose-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[var(--md-on-surface-variant)] uppercase">
                  {pick('Safety Factor (SF)', 'Faktor Keamanan', '安全率 (SF)')}
                </span>
                {results.status === 'PASS' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : results.status === 'MARGINAL' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={`font-mono text-lg font-black ${
                    results.status === 'PASS'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : results.status === 'MARGINAL'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {results.safetyFactor >= 99 ? '∞' : results.safetyFactor.toFixed(2)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    results.status === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : results.status === 'MARGINAL'
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {results.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Sliders, Electrode Selector, Mechanics Breakdown (5 cols) */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Electrode / Filler Grade Selector Card */}
          <div className="glass-panel flex flex-col gap-2.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                <Flame className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('Electrode / Filler Alloy', 'Elektroda / Kawat Las', '溶接棒・溶加材選定')}
              </span>
              <span className="font-mono text-[11px] font-bold text-[var(--md-primary)]">
                {activeElectrode.process}
              </span>
            </div>

            <select
              value={selectedElectrodeId}
              onChange={(e) => setSelectedElectrodeId(e.target.value)}
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
            >
              {ELECTRODE_GRADES.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.name} — UTS {el.tensileStrengthMpa} MPa (Allowable Shear {el.allowableShearMpa} MPa)
                </option>
              ))}
            </select>

            <p className="text-[11px] text-[var(--md-on-surface-variant)]">
              {pick(
                activeElectrode.descriptionEn,
                activeElectrode.descriptionId,
                activeElectrode.descriptionJa
              )}
            </p>
          </div>

          {/* Parameters & Sliders Card */}
          <div className="glass-panel flex flex-col gap-3.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('Joint Dimensions & Loads', 'Dimensi Sambungan & Beban', '継手寸法・作用荷重設定')}
              </span>
            </div>

            {/* Mode 1 Specific Controls (Lap / Tee) */}
            {mode === 'lap-tee' && (
              <div className="flex flex-col gap-3">
                {/* Fillet Arrangement (Single vs Double) */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface-variant)]">
                    {pick('Fillet Passes', 'Jumlah Lasan', 'すみ肉配置')}:
                  </span>
                  <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                    <button
                      type="button"
                      onClick={() => setFilletArrangement('single')}
                      className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                        filletArrangement === 'single'
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      Single (1x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilletArrangement('double')}
                      className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                        filletArrangement === 'double'
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      Double (2x)
                    </button>
                  </div>
                </div>

                {/* Load Orientation (Transverse vs Parallel) */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface-variant)]">
                    {pick('Load Orientation', 'Arah Beban', '荷重方向')}:
                  </span>
                  <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                    <button
                      type="button"
                      onClick={() => setWeldOrientation('transverse')}
                      className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                        weldOrientation === 'transverse'
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      Transverse (1.5x)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeldOrientation('parallel')}
                      className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                        weldOrientation === 'parallel'
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      Parallel (1.0x)
                    </button>
                  </div>
                </div>

                {/* Leg Size s slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Fillet Leg Size (s)', 'Ukuran Kaki Las (s)', '脚長 (s)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {legSizeMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={25}
                    step={1}
                    value={legSizeMm}
                    onChange={(e) => setLegSizeMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Weld Length Lw slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Weld Length (Lw)', 'Panjang Las (Lw)', '有効溶接長 (Lw)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {weldLengthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={300}
                    step={5}
                    value={weldLengthMm}
                    onChange={(e) => setWeldLengthMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Mode 2 Specific Controls (Eccentric Cantilever Bracket) */}
            {mode === 'eccentric-bracket' && (
              <div className="flex flex-col gap-3">
                {/* Bracket Weld Pattern */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface-variant)]">
                    {pick('Weld Pattern', 'Pola Las', '溶接配置パターン')}:
                  </span>
                  <select
                    value={bracketPattern}
                    onChange={(e) => setBracketPattern(e.target.value as BracketWeldPattern)}
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    <option value="two-vertical">2 Vertical Lines</option>
                    <option value="two-horizontal">2 Horizontal Lines</option>
                    <option value="channel-c">C-Channel (3-sided)</option>
                  </select>
                </div>

                {/* Leg Size s */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Leg Size (s)', 'Ukuran Kaki Las (s)', '脚長 (s)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {legSizeMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={25}
                    step={1}
                    value={legSizeMm}
                    onChange={(e) => setLegSizeMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Bracket Width b */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Weld Pattern Width (b)', 'Lebar Pola Las (b)', '溶接横幅 (b)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {bracketWidthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={220}
                    step={10}
                    value={bracketWidthMm}
                    onChange={(e) => setBracketWidthMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Bracket Depth / Height d */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Bracket Depth (d)', 'Tinggi Braket (d)', 'ブラケット縦寸法 (d)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {bracketHeightMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={300}
                    step={10}
                    value={bracketHeightMm}
                    onChange={(e) => setBracketHeightMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Eccentricity e slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Eccentricity (e)', 'Eksentrisitas Beban (e)', '偏心距離 (e)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {eccentricityMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={350}
                    step={10}
                    value={eccentricityMm}
                    onChange={(e) => setEccentricityMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Mode 3 Specific Controls (Butt Weld) */}
            {mode === 'butt-joint' && (
              <div className="flex flex-col gap-3">
                {/* Groove Preparation Type */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface-variant)]">
                    {pick('Edge Preparation', 'Bentuk Kampuh', '開先形状')}:
                  </span>
                  <select
                    value={grooveType}
                    onChange={(e) => setGrooveType(e.target.value as GrooveType)}
                    className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                  >
                    <option value="single-v">Single-V (60°)</option>
                    <option value="double-v">Double-V (X-Groove)</option>
                    <option value="single-u">Single-U (J-Bevel)</option>
                    <option value="square">Square Butt</option>
                  </select>
                </div>

                {/* Penetration Type */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface-variant)]">
                    {pick('Penetration', 'Tingkat Penetrasi', '溶込み形式')}:
                  </span>
                  <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                    <button
                      type="button"
                      onClick={() => setPenetrationType('cjp')}
                      className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                        penetrationType === 'cjp'
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      CJP (Full 100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPenetrationType('pjp')}
                      className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                        penetrationType === 'pjp'
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      PJP (Partial 75%)
                    </button>
                  </div>
                </div>

                {/* Plate Thickness t */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Plate Thickness (t)', 'Tebal Pelat (t)', '母材板厚 (t)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {plateThicknessMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={40}
                    step={1}
                    value={plateThicknessMm}
                    onChange={(e) => setPlateThicknessMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Plate Width w */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Plate Width (w)', 'Lebar Pelat (w)', '母材幅 (w)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {plateWidthMm} mm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={300}
                    step={10}
                    value={plateWidthMm}
                    onChange={(e) => setPlateWidthMm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* In-Plane Bending Moment slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[var(--md-on-surface-variant)]">
                      {pick('Bending Moment (M)', 'Momen Lentur (M)', '面内曲げモーメント (M)')}:
                    </span>
                    <span className="font-mono font-bold text-[var(--md-on-surface)]">
                      {bendingMomentKnm} kN·m
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={bendingMomentKnm}
                    onChange={(e) => setBendingMomentKnm(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Applied Force F (Universal to all 3 modes) */}
            <div className="flex flex-col gap-1.5 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[var(--md-on-surface)]">
                  {pick('Applied Load (F)', 'Gaya Beban (F)', '作用外力 (F)')}:
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {loadKn} kN ({loadKn * 1000} N)
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={loadKn}
                onChange={(e) => setLoadKn(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Engineering Mechanics Deep Dive Breakdown Card */}
          <div className="glass-panel flex flex-col gap-2.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <Layers className="h-4 w-4 text-[var(--md-primary)]" />
              <span className="text-xs font-bold tracking-wider text-[var(--md-on-surface)] uppercase">
                {pick('Stress Distribution Breakdown', 'Rincian Komponen Tegangan', '応力成分解析内訳')}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between border-b border-[var(--md-outline-variant)]/40 pb-1.5">
                <span className="text-[var(--md-on-surface-variant)]">
                  {mode === 'butt-joint'
                    ? pick('Axial Stress (σ_axial)', 'Tegangan Aksial (σ_aksial)', '軸方向応力 (σ_axial)')
                    : pick('Direct Shear (τ′)', 'Geser Langsung Primer (τ′)', '一次直接せん断 (τ′)')}:
                </span>
                <span className="font-mono font-semibold text-[var(--md-on-surface)]">
                  {results.primaryDirectShearMpa.toFixed(2)} MPa
                </span>
              </div>

              {mode === 'eccentric-bracket' && (
                <div className="flex justify-between border-b border-[var(--md-outline-variant)]/40 pb-1.5">
                  <span className="text-[var(--md-on-surface-variant)]">
                    {pick('Torsional Shear (τ″)', 'Geser Torsi Sekunder (τ″)', '二次ねじりせん断 (τ″)')}:
                  </span>
                  <span className="font-mono font-semibold text-[var(--md-primary)]">
                    {results.secondaryMomentStressMpa.toFixed(2)} MPa
                  </span>
                </div>
              )}

              {mode === 'butt-joint' && (
                <div className="flex justify-between border-b border-[var(--md-outline-variant)]/40 pb-1.5">
                  <span className="text-[var(--md-on-surface-variant)]">
                    {pick('Bending Stress (σ_bending)', 'Tegangan Lentur (σ_lentur)', '曲げ応力 (σ_bending)')}:
                  </span>
                  <span className="font-mono font-semibold text-[var(--md-primary)]">
                    {results.secondaryMomentStressMpa.toFixed(2)} MPa
                  </span>
                </div>
              )}

              <div className="flex justify-between border-b border-[var(--md-outline-variant)]/40 pb-1.5">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick('Combined Peak Stress', 'Tegangan Maksimum Resultan', '最大合成応力')}:
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {results.peakCombinedStressMpa.toFixed(2)} MPa
                </span>
              </div>

              <div className="flex justify-between border-b border-[var(--md-outline-variant)]/40 pb-1.5">
                <span className="text-[var(--md-on-surface-variant)]">
                  {pick('AWS Allowable Limit', 'Batas Izin Standar AWS', 'AWS許容限度')}:
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {results.allowableStressMpa.toFixed(2)} MPa
                </span>
              </div>

              {/* Stress Utilization Meter */}
              <div className="mt-1 flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--md-on-surface-variant)]">
                    {pick('Stress Utilization', 'Rasio Utilisasi Tegangan', '応力利用率')}
                  </span>
                  <span className="font-mono font-bold text-[var(--md-on-surface)]">
                    {results.stressUtilizationPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      results.stressUtilizationPct > 100
                        ? 'bg-rose-500'
                        : results.stressUtilizationPct > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(results.stressUtilizationPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
