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
    <div className="space-y-4">
      {/* Top Action & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl p-3.5 ">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#001F6B] to-[#002D9C] text-white shadow-sm">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {pick(
                'IR Spot Pyrometer & Thermal Imaging Camera',
                'Pirometer Spot IR & Kamera Pencitraan Termal',
                '放射温度計 (IRスポット) & サーモグラフィ'
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pick(activeScene.descEn, activeScene.descId, activeScene.descJa)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('spot')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mode === 'spot'
                  ? 'bg-[#001F6B] text-white shadow-sm dark:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              {pick('Spot Pyrometer', 'Pirometer Spot', 'スポット温度計')}
            </button>
            <button
              type="button"
              onClick={() => setMode('thermal')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mode === 'thermal'
                  ? 'bg-[#001F6B] text-white shadow-sm dark:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              {pick('Thermal Overlay', 'Overlay Termal', 'サーモ表示')}
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* Left: Interactive Viewport SVG + Target Zone Quick Aim */}
        <div className="space-y-4 lg:col-span-7">
          <div className="overflow-hidden glass-panel rounded-2xl p-3 ">
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
          <div className="glass-panel rounded-2xl p-3.5 ">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Eye className="h-3.5 w-3.5 text-orange-500" />
                {pick('Quick-Aim Inspection Zones', 'Target Inspeksi Cepat', '検査ポイント選択')}
              </span>
              <button
                type="button"
                onClick={() => setTapeApplied((prev) => !prev)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  tapeApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {tapeApplied
                  ? pick('✓ Electrical Tape Applied (ε=0.95)', '✓ Isolasi Listrik Terpasang (ε=0,95)', '✓ 絶縁テープ貼付中 (ε=0.95)')
                  : pick('+ Apply Electrical Tape Patch', '+ Tempel Isolasi Listrik', '+ 絶縁テープを貼る')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeScene.zones.map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => handleAimChange(z.cx, z.cy)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500/60 dark:hover:bg-slate-700"
                >
                  {pick(z.labelEn, z.labelId, z.labelJa)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Diagnostic Readouts & Instrument Controls */}
        <div className="space-y-4 lg:col-span-5">
          {/* Readout KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-[#001F6B]/15 bg-white/85 p-3 dark:border-blue-400/20 dark:bg-slate-900/75">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {pick('Displayed Reading', 'Pembacaan Alat', '指示温度')}
              </div>
              <div className="mt-0.5 font-mono text-xl font-extrabold text-orange-600 dark:text-orange-400">
                {measurement.displayedTempC.toFixed(1)} °C
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {pick('True Center:', 'Asli Pusat:', '中心真値:')} {measurement.trueCenterTempC.toFixed(1)} °C
              </div>
            </div>

            <div className="rounded-xl border border-[#001F6B]/15 bg-white/85 p-3 dark:border-blue-400/20 dark:bg-slate-900/75">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                D:S {measurement.spotErrorC.toFixed(1)}° | ε {measurement.emissivityErrorC.toFixed(1)}°
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="space-y-3.5 glass-panel rounded-2xl p-4 ">
            {/* Inspection Scene Selector */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                <Layers className="h-3.5 w-3.5 text-[#002D9C] dark:text-blue-400" />
                {pick('Industrial Inspection Scene', 'Skenario Inspeksi Industri', '産業設備検査シーン')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(INSPECTION_SCENES) as InspectionSceneId[]).map((id) => {
                  const sc = INSPECTION_SCENES[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectScene(id)}
                      className={`rounded-lg px-2.5 py-2 text-left text-xs font-bold transition ${
                        sceneId === id
                          ? 'bg-[#001F6B] text-white shadow-sm dark:bg-blue-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pick(sc.labelEn, sc.labelId, sc.labelJa)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distance-to-Spot (D:S) & Distance */}
            <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Ruler className="h-3.5 w-3.5 text-sky-500" />
                  {pick('Optics Ratio (D:S)', 'Rasio Optik (D:S)', '光学比 (D:S)')}
                </span>
                <div className="flex gap-1">
                  {([12, 30] as DsRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setDsRatio(r)}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                        dsRatio === r
                          ? 'bg-[#001F6B] text-white dark:bg-blue-600'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {r}:1
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>{pick('Inspection Distance (D)', 'Jarak Inspeksi (D)', '測定距離 (D)')}</span>
                  <span className="font-mono text-[#002D9C] dark:text-blue-400">
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
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            {/* Emissivity (ε) & Presets */}
            <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-orange-500" />
                  {pick('Instrument Emissivity (ε)', 'Emisivitas Alat (ε)', '放射率設定 (ε)')}
                </span>
                <span className="font-mono text-orange-600 dark:text-orange-400">
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
                className="w-full cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-1.5">
                {EMISSIVITY_PRESETS.map((ep) => (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => setInstrumentEmissivity(ep.emissivity)}
                    className={`rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold transition ${
                      Math.abs(instrumentEmissivity - ep.emissivity) < 0.015
                        ? 'bg-orange-500/20 text-orange-800 ring-1 ring-orange-500 dark:text-orange-300'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {pick(ep.labelEn, ep.labelId, ep.labelJa)}
                  </button>
                ))}
              </div>
            </div>

            {/* Reflected Ambient Temp & Thermal Palette */}
            <div className="space-y-2 border-t border-slate-200 pt-3 dark:border-slate-700">
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>{pick('Reflected Ambient Temp (T_refl)', 'Suhu Pantul Sekitar (T_refl)', '反射周囲温度 (T_refl)')}</span>
                  <span className="font-mono">{reflectedTempC} °C</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={45}
                  step={1}
                  value={reflectedTempC}
                  onChange={(e) => setReflectedTempC(Number(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Flame className="h-3.5 w-3.5 text-rose-500" />
                  {pick('Thermal Palette', 'Palet Termal', 'カラーパレット')}
                </span>
                <div className="flex gap-1">
                  {(['ironbow', 'rainbow'] as ThermalPalette[]).map((pal) => (
                    <button
                      key={pal}
                      type="button"
                      onClick={() => {
                        setPalette(pal);
                        setMode('thermal');
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize transition ${
                        palette === pal
                          ? 'bg-[#001F6B] text-white dark:bg-blue-600'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
