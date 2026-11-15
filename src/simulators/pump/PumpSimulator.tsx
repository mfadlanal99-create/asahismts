import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PumpCurveCanvas } from './PumpCurveCanvas';
import {
  computeVfdAutoTune,
  evaluateApiSealPlan,
  PUMP_PRESETS,
  solvePumpOperatingPoint,
  type PumpParams,
  type VfdAutoTuneResult,
} from './pumpPhysics';
import { PumpRigSvg } from './PumpRigSvg';

const DEFAULT_PARAMS: PumpParams = PUMP_PRESETS[0].params;

export function PumpSimulator() {
  const { pick } = useLanguage();
  const [params, setParams] = useState<PumpParams>(DEFAULT_PARAMS);
  const [activePresetId, setActivePresetId] = useState<string>(PUMP_PRESETS[0].id);
  const [targetFlowInput, setTargetFlowInput] = useState<number>(75);
  const [vfdTuneResult, setVfdTuneResult] = useState<VfdAutoTuneResult | null>(null);

  const op = useMemo(() => solvePumpOperatingPoint(params), [params]);
  const apiSealPlan = useMemo(() => evaluateApiSealPlan(params, op), [params, op]);

  const updateParam = <K extends keyof PumpParams>(key: K, value: PumpParams[K]) => {
    setActivePresetId('');
    setVfdTuneResult(null);
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetId: string) => {
    const preset = PUMP_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setVfdTuneResult(null);
    setParams({ ...preset.params });
  };

  const handleVfdAutoTune = (desiredFlow: number) => {
    const result = computeVfdAutoTune(desiredFlow, params);
    setActivePresetId('');
    setTargetFlowInput(result.targetFlowM3h);
    setVfdTuneResult(result);
    setParams((prev) => ({
      ...prev,
      rpm: result.optimalRpm,
      valveOpening: 100,
    }));
  };

  const resetAll = () => {
    applyPreset(PUMP_PRESETS[0].id);
  };

  return (
    <div className="space-y-4">
      {/* Preset & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 glass-panel rounded-2xl p-3 ">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
          </span>
          {PUMP_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                title={preset.description}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-cyan-600 text-white shadow-xs dark:bg-cyan-500 dark:text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {pick('Reset', 'Reset', 'リセット')}
        </button>
      </div>

      {/* Diagnostic Alert Banner */}
      {op.condition !== 'optimal' ? (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-3.5 text-sm ${
            op.condition === 'cavitation' || op.condition === 'deadhead'
              ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
              : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-semibold">
              {op.condition === 'cavitation' &&
                pick(
                  'Cavitation Detected (NPSHa < NPSHr) — Impeller & Seal Damage Risk',
                  'Kavitasi Terdeteksi (NPSHa < NPSHr) — Risiko Kerusakan Impeler & Seal',
                  'キャビテーション検出 (NPSHa < NPSHr) — インペラ・シール損傷リスク'
                )}
              {op.condition === 'deadhead' &&
                pick(
                  'Dead-Head Operation (Valve Closed) — Severe Mechanical Seal Overheating',
                  'Operasi Dead-Head (Katup Tertutup) — Panas Berlebih Mechanical Seal',
                  '締切運転 (吐出弁閉) — メカニカルシール過熱警告'
                )}
              {op.condition === 'low-flow' &&
                pick(
                  'Low-Flow Recirculation (< 70% BEP) — Elevated Seal & Bearing Load',
                  'Resirkulasi Aliran Rendah (< 70% BEP) — Beban Seal & Bantalan Meningkat',
                  '低流量再循環 (< 70% BEP) — シール・軸受荷重増大'
                )}
              {op.condition === 'runout' &&
                pick(
                  'Runout Operation (> 120% BEP) — High NPSHr & Motor Overload Risk',
                  'Operasi Runout (> 120% BEP) — Risiko NPSHr Tinggi & Beban Lebih Motor',
                  '過大流量運転 (> 120% BEP) — 高NPSHr・モータ過負荷リスク'
                )}
            </div>
            <div className="mt-0.5 text-xs opacity-90">
              {op.condition === 'cavitation' &&
                `NPSHa (${op.npshaM.toFixed(2)} m) < NPSHr (${op.npshrM.toFixed(2)} m). Pv = ${op.vaporPressureKpa.toFixed(1)} kPa.`}
              {op.condition === 'deadhead' &&
                `Q ≈ 0 m³/h · ${op.shaftPowerKw.toFixed(2)} kW churning heat.`}
              {op.condition === 'low-flow' &&
                `Q = ${op.flowM3h.toFixed(1)} m³/h (BEP = ${op.bepFlowM3h.toFixed(1)} m³/h).`}
              {op.condition === 'runout' &&
                `Q = ${op.flowM3h.toFixed(1)} m³/h (> 120% BEP).`}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            {pick(
              `Healthy Operation: Near BEP (${op.bepFlowM3h.toFixed(1)} m³/h) with +${op.npshMarginM.toFixed(2)} m NPSH margin and normal mechanical seal lubrication.`,
              `Operasi Sehat: Dekat BEP (${op.bepFlowM3h.toFixed(1)} m³/h) dengan margin NPSH +${op.npshMarginM.toFixed(2)} m dan pelumasan seal normal.`,
              `正常運転: BEP付近 (${op.bepFlowM3h.toFixed(1)} m³/h)、NPSH余裕 +${op.npshMarginM.toFixed(2)} m、シール潤滑正常。`
            )}
          </span>
        </div>
      )}

      {/* Live KPI Readouts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={<Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
          label={pick('Flow Rate (Q)', 'Laju Aliran (Q)', '流量 (Q)')}
          value={`${op.flowM3h.toFixed(1)} m³/h`}
          sub={`BEP: ${op.bepFlowM3h.toFixed(1)} m³/h`}
        />
        <KpiCard
          icon={<Gauge className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          label={pick('Total Head (H)', 'Total Head (H)', '全揚程 (H)')}
          value={`${op.headM.toFixed(1)} m`}
          sub={`Shutoff: ${op.shutoffHeadM.toFixed(1)} m`}
        />
        <KpiCard
          icon={<Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />}
          label={pick('Shaft Power', 'Daya Poros', '軸動力')}
          value={`${op.shaftPowerKw.toFixed(2)} kW`}
          sub={`Hyd: ${op.hydraulicPowerKw.toFixed(2)} kW`}
        />
        <KpiCard
          icon={<Wind className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          label={pick('Efficiency (η)', 'Efisiensi (η)', '効率 (η)')}
          value={`${op.efficiencyPct.toFixed(1)} %`}
          sub="Max: 82.0 %"
        />
        <KpiCard
          icon={<Thermometer className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          label="NPSHa / NPSHr"
          value={`${op.npshaM.toFixed(2)} / ${op.npshrM.toFixed(2)} m`}
          sub={`Margin: ${op.npshMarginM >= 0 ? '+' : ''}${op.npshMarginM.toFixed(2)} m`}
          alert={op.isCavitating}
        />
        <KpiCard
          icon={<AlertTriangle className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
          label={pick('Seal & Flanges', 'Seal & Flensa', 'シール・圧力')}
          value={op.sealRisk.toUpperCase()}
          sub={`Ps ${op.suctionPressureKpa.toFixed(0)} / Pd ${op.dischargePressureKpa.toFixed(0)} kPa`}
          alert={op.sealRisk === 'critical'}
        />
      </div>

      {/* Main Workspace: 2D Test Rig + Curves */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left: Test Rig + Controls */}
        <div className="space-y-4 lg:col-span-6">
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {pick(
                  'Interactive Pump Test Rig',
                  'Rig Uji Pompa Interaktif',
                  'インタラクティブ・ポンプ試験装置'
                )}
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pv = {op.vaporPressureKpa.toFixed(2)} kPa · ρ = {op.densityKgM3.toFixed(0)} kg/m³
              </span>
            </div>
            <div className="flex items-center justify-center">
              <PumpRigSvg params={params} op={op} />
            </div>
          </div>

          {/* Sliders & Pump Configuration */}
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {pick('Rig Controls', 'Kontrol Rig', '運転パラメータ')}
              </h3>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => updateParam('parallelPumps', false)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    !params.parallelPumps
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {pick('Single Pump (1×)', 'Pompa Tunggal (1×)', '単独運転 (1台)')}
                </button>
                <button
                  type="button"
                  onClick={() => updateParam('parallelPumps', true)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    params.parallelPumps
                      ? 'bg-cyan-600 text-white shadow-xs dark:bg-cyan-500 dark:text-slate-950'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {pick('Parallel (2×)', 'Paralel (2×)', '並列運転 (2台)')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ControlSlider
                label={pick('Impeller Speed (N)', 'Kecepatan Impeler (N)', 'インペラ回転数 (N)')}
                valueLabel={`${params.rpm} RPM`}
                min={900}
                max={2900}
                step={50}
                value={params.rpm}
                onChange={(v) => updateParam('rpm', v)}
              />
              <ControlSlider
                label={pick('Discharge Valve Opening', 'Bukaan Katup Buang', '吐出弁開度')}
                valueLabel={`${params.valveOpening} %`}
                min={0}
                max={100}
                step={1}
                value={params.valveOpening}
                onChange={(v) => updateParam('valveOpening', v)}
              />
              <ControlSlider
                label={pick('Impeller Trim Diameter', 'Diameter Trim Impeler', 'インペラ外径トリム')}
                valueLabel={`${params.impellerTrimPct} %`}
                min={85}
                max={100}
                step={1}
                value={params.impellerTrimPct}
                onChange={(v) => updateParam('impellerTrimPct', v)}
              />
              <ControlSlider
                label={pick('Suction Tank Head (Hs)', 'Head Tangki Hisap (Hs)', '吸込タンク液位 (Hs)')}
                valueLabel={`${params.suctionHead >= 0 ? '+' : ''}${params.suctionHead.toFixed(1)} m`}
                min={-4.5}
                max={6.0}
                step={0.1}
                value={params.suctionHead}
                onChange={(v) => updateParam('suctionHead', v)}
              />
              <ControlSlider
                label={pick('Fluid Temperature (T)', 'Suhu Fluida (T)', '流体温度 (T)')}
                valueLabel={`${params.fluidTempC} °C`}
                min={10}
                max={95}
                step={1}
                value={params.fluidTempC}
                onChange={(v) => updateParam('fluidTempC', v)}
              />
            </div>
          </div>
        </div>

        {/* Right: H-Q / Efficiency Curve + NPSH + Seal & Shaft Deflection */}
        <div className="space-y-4 lg:col-span-6">
          <div className="glass-panel rounded-2xl p-4 ">
            <PumpCurveCanvas
              params={params}
              op={op}
              onSelectTargetFlow={handleVfdAutoTune}
            />

            {/* Target Flow VFD Auto-Tune Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-200/80 bg-cyan-50/70 p-2.5 dark:border-cyan-500/30 dark:bg-cyan-500/10">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {pick('Target Flow:', 'Target Aliran:', '目標流量:')}
                </span>
                <input
                  type="number"
                  min={15}
                  max={160}
                  step={5}
                  value={targetFlowInput}
                  onChange={(e) => setTargetFlowInput(Number(e.target.value))}
                  className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center font-mono text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">m³/h</span>
              </div>

              <button
                type="button"
                onClick={() => handleVfdAutoTune(targetFlowInput)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {pick('VFD Auto-Tune (POR)', 'Auto-Tune VFD (POR)', 'VFD自動調整 (POR)')}
              </button>
            </div>

            {vfdTuneResult && (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <span>
                  {pick(
                    `VFD tuned to ${vfdTuneResult.optimalRpm} RPM (100% open): ${vfdTuneResult.vfdPowerKw.toFixed(2)} kW vs ${vfdTuneResult.throttledPowerKw.toFixed(2)} kW throttled`,
                    `VFD disetel ke ${vfdTuneResult.optimalRpm} RPM (katup 100%): ${vfdTuneResult.vfdPowerKw.toFixed(2)} kW vs ${vfdTuneResult.throttledPowerKw.toFixed(2)} kW throttled`,
                    `VFDを ${vfdTuneResult.optimalRpm} RPM (全開) に最適化: ${vfdTuneResult.vfdPowerKw.toFixed(2)} kW (弁絞り時 ${vfdTuneResult.throttledPowerKw.toFixed(2)} kW)`
                  )}
                </span>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-mono font-bold text-white dark:bg-emerald-500 dark:text-slate-950">
                  {pick('Saves', 'Hemat', '省エネ')} {vfdTuneResult.savingsKw.toFixed(2)} kW ({vfdTuneResult.savingsPct.toFixed(0)}%)
                </span>
              </div>
            )}
          </div>

          {/* Mechanical Seal & Shaft Deflection Life Indicator */}
          <div className="glass-panel rounded-2xl p-4 ">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {pick(
                  'Mechanical Seal & Shaft Deflection Life',
                  'Umur Mechanical Seal & Defleksi Poros',
                  'メカニカルシール・軸たわみ寿命'
                )}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  op.inPor
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                }`}
              >
                {op.inPor
                  ? `${pick('In POR', 'Dalam POR', 'POR範囲内')} (${op.porMinFlowM3h.toFixed(0)}–${op.porMaxFlowM3h.toFixed(0)} m³/h)`
                  : `${pick('Outside POR', 'Di Luar POR', 'POR範囲外')} (${((op.flowM3h / Math.max(1, op.bepFlowM3h)) * 100).toFixed(0)}% BEP)`}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {pick(
                      'Radial Shaft Load (Volute Unbalance)',
                      'Beban Radial Poros (Ketidakseimbangan Volute)',
                      'ラジアル軸荷重（ボリュート不釣合）'
                    )}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {op.radialLoadPct.toFixed(0)} %
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      op.radialLoadPct > 65
                        ? 'bg-red-500'
                        : op.radialLoadPct > 35
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${op.radialLoadPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {pick(
                      'Estimated Seal & Bearing Life Index',
                      'Indeks Estimasi Umur Seal & Bantalan',
                      '推定シール・軸受寿命指数'
                    )}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {op.sealLifePct.toFixed(0)} %
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      op.sealLifePct < 40
                        ? 'bg-red-500'
                        : op.sealLifePct < 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${op.sealLifePct}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {op.isDeadHead
                  ? 'Dead-head operation causes maximum radial shaft deflection and rapid seal-face flashing.'
                  : op.isCavitating
                    ? 'Cavitation implosions destabilize the seal film and pit impeller vanes.'
                    : op.inPor
                      ? 'Balanced radial hydraulic forces minimize shaft deflection and maximize mechanical seal life.'
                      : 'Throttling far left of BEP increases volute radial pressure unbalance, accelerating seal wear.'}
              </p>

              {/* API 682 Mechanical Seal Flush Plan Status */}
              <div
                className={`mt-2 rounded-xl border p-2.5 text-[11px] ${
                  apiSealPlan.severity === 'critical'
                    ? 'border-red-200 bg-red-50/80 text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
                    : apiSealPlan.severity === 'caution'
                      ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                      : 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {apiSealPlan.plan === 'Plan 53'
                      ? pick(
                          'API Plan 53 (Pressurized Barrier Fluid)',
                          'API Plan 53 (Fluida Penghalang Bertekanan)',
                          'API Plan 53 (加圧バリア液システム)'
                        )
                      : apiSealPlan.plan === 'Plan 21'
                        ? pick(
                            'API Plan 21 (Cooled Discharge Bypass)',
                            'API Plan 21 (Bypass Buang Berpendingin)',
                            'API Plan 21 (冷却器付吐出バイパス)'
                          )
                        : pick(
                            'API Plan 11 (Discharge Bypass to Seal)',
                            'API Plan 11 (Bypass Buang ke Seal)',
                            'API Plan 11 (吐出バイパス・フラッシュ)'
                          )}
                  </span>
                  <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase dark:bg-slate-900/60">
                    {apiSealPlan.plan}
                  </span>
                </div>
                <p className="mt-1 opacity-90">
                  {apiSealPlan.plan === 'Plan 53'
                    ? pick(
                        apiSealPlan.reason,
                        'Risiko kavitasi/dead-head tinggi memerlukan fluida penghalang eksternal bertekanan Plan 53 untuk melindungi muka seal.',
                        'キャビテーションや締切運転による液膜蒸発を防ぐため、外部加圧バリア液（Plan 53）が必要です。'
                      )
                    : apiSealPlan.plan === 'Plan 21'
                      ? pick(
                          apiSealPlan.reason,
                          `Suhu tinggi (${params.fluidTempC}°C) atau operasi di luar POR memerlukan pendingin Plan 21 sebelum masuk ruang seal.`,
                          `高温流体 (${params.fluidTempC}°C) またはPOR外運転のため、Plan 21 冷却器でフラッシュ液を冷却する必要があります。`
                        )
                      : pick(
                          apiSealPlan.reason,
                          `Fluida bersih & sejuk (${params.fluidTempC}°C) di dalam POR — bypass orifis standar mendinginkan ruang seal.`,
                          `POR内の清浄・低温流体 (${params.fluidTempC}°C) — 標準オリフィスバイパスでシール室を冷却・排気します。`
                        )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  alert = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 shadow-xs ${
        alert
          ? 'border-red-300 bg-red-50/70 dark:border-red-500/40 dark:bg-red-500/10'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70'
      }`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
        {value}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
        {sub}
      </div>
    </div>
  );
}

function ControlSlider({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-600 dark:accent-cyan-400"
      />
    </label>
  );
}
