import { useCallback, useMemo, useState } from 'react';
import {
  Camera,
  Crosshair,
  Eye,
  Flame,
  Layers,
  RotateCcw,
  Ruler,
  Sliders,
  Thermometer,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeIrMeasurement,
  EMISSIVITY_PRESETS,
  INSPECTION_SCENES,
  type CameraMode,
  type DsRatio,
  type InspectionSceneId,
  type ThermalPalette,
} from './irThermometerPhysics';
import { IrThermometerSvg } from './IrThermometerSvg';

export function IrThermometerSimulator() {
  const { pick } = useLanguage();

  const [sceneId, setSceneId] = useState<InspectionSceneId>('mcc-breaker');
  const [mode, setMode] = useState<CameraMode>('spot');
  const [palette, setPalette] = useState<ThermalPalette>('ironbow');
  const [dsRatio, setDsRatio] = useState<DsRatio>(12);
  const [distanceCm, setDistanceCm] = useState<number>(60);
  const [instrumentEmissivity, setInstrumentEmissivity] = useState<number>(0.95);
  const [reflectedTempC, setReflectedTempC] = useState<number>(25);
  const [tapeApplied, setTapeApplied] = useState<boolean>(false);

  const [aimX, setAimX] = useState<number>(INSPECTION_SCENES['mcc-breaker'].defaultAimX);
  const [aimY, setAimY] = useState<number>(INSPECTION_SCENES['mcc-breaker'].defaultAimY);

  const activeScene = INSPECTION_SCENES[sceneId];

  const handleSelectScene = useCallback((id: InspectionSceneId) => {
    setSceneId(id);
    setAimX(INSPECTION_SCENES[id].defaultAimX);
    setAimY(INSPECTION_SCENES[id].defaultAimY);
    setTapeApplied(false);
  }, []);

  const handleAimChange = useCallback((x: number, y: number) => {
    setAimX(x);
    setAimY(y);
  }, []);

  const handleReset = useCallback(() => {
    setSceneId('mcc-breaker');
    setMode('spot');
    setPalette('ironbow');
    setDsRatio(12);
    setDistanceCm(60);
    setInstrumentEmissivity(0.95);
    setReflectedTempC(25);
    setTapeApplied(false);
    setAimX(INSPECTION_SCENES['mcc-breaker'].defaultAimX);
    setAimY(INSPECTION_SCENES['mcc-breaker'].defaultAimY);
  }, []);

  const measurement = useMemo(
    () =>
      computeIrMeasurement(
        sceneId,
        aimX,
        aimY,
        distanceCm,
        dsRatio,
        instrumentEmissivity,
        reflectedTempC,
        tapeApplied
      ),
    [
      sceneId,
      aimX,
      aimY,
      distanceCm,
      dsRatio,
      instrumentEmissivity,
      reflectedTempC,
      tapeApplied,
    ]
  );

  return (
    <div className="space-y-5">
      {/* Top Action & Mode Bar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-[var(--md-on-surface)]">
              {pick(
                'IR Spot Pyrometer & Thermal Imaging Camera',
                'Pirometer Spot IR & Kamera Pencitraan Termal',
                '放射温度計 (IRスポット) & サーモグラフィ'
              )}
            </h2>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(activeScene.descEn, activeScene.descId, activeScene.descJa)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            <button
              type="button"
              onClick={() => setMode('spot')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                mode === 'spot'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              {pick('Spot Pyrometer', 'Pirometer Spot', 'スポット温度計')}
            </button>
            <button
              type="button"
              onClick={() => setMode('thermal')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                mode === 'thermal'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              {pick('Thermal Overlay', 'Overlay Termal', 'サーモ表示')}
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left: Interactive Viewport SVG + Target Zone Quick Aim */}
        <div className="space-y-4 lg:col-span-7">
          <div className="glass-panel overflow-hidden rounded-[28px] p-4 sm:p-5">
            <IrThermometerSvg
              sceneId={sceneId}
              mode={mode}
              palette={palette}
              dsRatio={dsRatio}
              distanceCm={distanceCm}
              instrumentEmissivity={instrumentEmissivity}
              reflectedTempC={reflectedTempC}
              tapeApplied={tapeApplied}
              aimX={aimX}
              aimY={aimY}
              measurement={measurement}
              onAimChange={handleAimChange}
            />
          </div>

          {/* Quick Aim Targets in Current Scene */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                <Eye className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Quick-Aim Inspection Zones', 'Target Inspeksi Cepat', '検査ポイント選択')}
              </span>
              <button
                type="button"
                onClick={() => setTapeApplied((prev) => !prev)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                  tapeApplied
                    ? 'border-emerald-500/40 bg-emerald-600 text-white shadow-xs'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                }`}
              >
                {tapeApplied
                  ? pick('✓ Electrical Tape Applied (ε=0.95)', '✓ Isolasi Listrik Terpasang (ε=0,95)', '✓ 絶縁テープ貼付中 (ε=0.95)')
                  : pick('+ Apply Electrical Tape Patch', '+ Tempel Isolasi Listrik', '+ 絶縁テープを貼る')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeScene.zones.map((z) => {
                const isAimed = Math.abs(aimX - z.cx) <= 2 && Math.abs(aimY - z.cy) <= 2;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => handleAimChange(z.cx, z.cy)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                      isAimed
                        ? 'border-[var(--md-primary)] bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {pick(z.labelEn, z.labelId, z.labelJa)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Diagnostic Readouts & Instrument Controls */}
        <div className="space-y-4 lg:col-span-5">
          {/* Readout KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Displayed Reading', 'Pembacaan Alat', '指示温度')}
              </div>
              <div className="mt-0.5 font-mono text-xl font-extrabold text-[var(--md-primary)]">
                {measurement.displayedTempC.toFixed(1)} °C
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                {pick('True Center:', 'Asli Pusat:', '中心真値:')} {measurement.trueCenterTempC.toFixed(1)} °C
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
              <div className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Total Error (ΔT)', 'Total Galat (ΔT)', '総合誤差 (ΔT)')}
              </div>
              <div
                className={`mt-0.5 font-mono text-xl font-extrabold ${
                  Math.abs(measurement.totalErrorC) > 5
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {measurement.totalErrorC >= 0 ? '+' : ''}
                {measurement.totalErrorC.toFixed(1)} °C
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                D:S {measurement.spotErrorC.toFixed(1)}° | ε {measurement.emissivityErrorC.toFixed(1)}°
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5">
            {/* Inspection Scene Selector */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                <Layers className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {pick('Industrial Inspection Scene', 'Skenario Inspeksi Industri', '産業設備検査シーン')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(INSPECTION_SCENES) as InspectionSceneId[]).map((id) => {
                  const sc = INSPECTION_SCENES[id];
                  const isSelected = sceneId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectScene(id)}
                      className={`rounded-[20px] border px-3 py-2.5 text-left text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      {pick(sc.labelEn, sc.labelId, sc.labelJa)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance-to-Spot (D:S) & Distance */}
            <div className="space-y-2.5 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                  <Ruler className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Optics Ratio (D:S)', 'Rasio Optik (D:S)', '光学比 (D:S)')}
                </span>
                <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                  {([12, 30] as DsRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDsRatio(r)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        dsRatio === r
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      {r}:1
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold text-[var(--md-on-surface-variant)]">
                  <span>{pick('Inspection Distance (D)', 'Jarak Inspeksi (D)', '測定距離 (D)')}</span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {distanceCm} cm (Spot Ø {measurement.spotDiameterCm.toFixed(1)} cm)
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={300}
                  step={5}
                  value={distanceCm}
                  onChange={(e) => setDistanceCm(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Emissivity (ε) & Presets */}
            <div className="space-y-2.5 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Instrument Emissivity (ε)', 'Emisivitas Alat (ε)', '放射率設定 (ε)')}
                </span>
                <span className="font-mono font-extrabold text-[var(--md-primary)]">
                  ε = {instrumentEmissivity.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.01}
                value={instrumentEmissivity}
                onChange={(e) => setInstrumentEmissivity(Number(e.target.value))}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                {EMISSIVITY_PRESETS.map((ep) => {
                  const isSelected = Math.abs(instrumentEmissivity - ep.emissivity) < 0.015;
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => setInstrumentEmissivity(ep.emissivity)}
                      className={`rounded-[20px] border px-3 py-2 text-left text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      {pick(ep.labelEn, ep.labelId, ep.labelJa)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reflected Ambient Temp & Thermal Palette */}
            <div className="space-y-2.5 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold text-[var(--md-on-surface-variant)]">
                  <span>{pick('Reflected Ambient Temp (T_refl)', 'Suhu Pantul Sekitar (T_refl)', '反射周囲温度 (T_refl)')}</span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">{reflectedTempC} °C</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={45}
                  step={1}
                  value={reflectedTempC}
                  onChange={(e) => setReflectedTempC(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--md-on-surface)]">
                  <Flame className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Thermal Palette', 'Palet Termal', 'カラーパレット')}
                </span>
                <div className="flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
                  {(['ironbow', 'rainbow'] as ThermalPalette[]).map((pal) => (
                    <button
                      key={pal}
                      type="button"
                      onClick={() => {
                        setPalette(pal);
                        setMode('thermal');
                      }}
                      className={`rounded-full px-3 py-1 text-xs capitalize transition ${
                        palette === pal
                          ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                          : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      {pal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
