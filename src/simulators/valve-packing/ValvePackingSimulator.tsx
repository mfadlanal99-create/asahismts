import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Gauge,
  RotateCcw,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ValveCutawaySvg } from './ValveCutawaySvg';
import { ValveDiagnosticsPanel } from './ValveDiagnosticsPanel';
import {
  FAULT_MODE_INFO,
  FLUID_SERVICE_INFO,
  solveValveSystem,
  VALVE_PRESETS,
  VALVE_TYPE_INFO,
  type FaultMode,
  type FluidService,
  type ValveParams,
  type ValveType,
} from './valvePhysics';

const DEFAULT_PARAMS: ValveParams = VALVE_PRESETS[0].params;

export function ValvePackingSimulator() {
  const { pick } = useLanguage();
  const [params, setParams] = useState<ValveParams>(DEFAULT_PARAMS);
  const [activePresetId, setActivePresetId] = useState<string>(VALVE_PRESETS[0].id);

  const telemetry = useMemo(() => solveValveSystem(params), [params]);

  const statusLabel =
    telemetry.status === 'Stem Binding Risk'
      ? pick('Stem Binding Risk', 'Risiko Macet Batang', 'ステム固着リスク')
      : telemetry.status === 'Fugitive Leak'
        ? pick('Fugitive Leak', 'Kebocoran Buronan', 'グランド漏洩')
        : pick('Optimal Seal', 'Segel Optimal', '最適シール');

  const presetLabel = (id: string, fallback: string) => {
    switch (id) {
      case 'optimal-control':
        return pick('Optimal Seal', 'Segel Optimal', '最適シール');
      case 'under-tightened':
        return pick('Fugitive Leak', 'Kebocoran Buronan', 'グランド漏洩');
      case 'over-tightened':
        return pick('Stem Binding', 'Batang Macet', 'ステム固着');
      case 'passing-seat':
        return pick('Passing Seat / Trap', 'Dudukan / Trap Bocor', 'シート・トラップ漏れ');
      case 'worn-packing':
        return pick('Worn Packing', 'Packing Aus', 'パッキン摩耗');
      default:
        return fallback;
    }
  };

  const valveTypeLabel = (vt: ValveType) => {
    switch (vt) {
      case 'globe':
        return pick('Globe Control Valve', 'Katup Kontrol Globe', 'グローブ制御弁');
      case 'gate':
        return pick('Gate Valve', 'Katup Gate', 'ゲート弁');
      case 'ball':
        return pick('Ball Valve', 'Katup Ball', 'ボール弁');
      case 'butterfly':
        return pick('Butterfly Valve', 'Katup Butterfly', 'バタフライ弁');
    }
  };

  const fluidLabel = (fs: FluidService) => {
    switch (fs) {
      case 'steam':
        return pick('Steam 10 bar', 'Uap 10 bar', '蒸気 10 bar');
      case 'water':
        return pick('Process Water', 'Air Proses', 'プロセス水');
      case 'thermal-oil':
        return pick('Thermal Oil', 'Minyak Termal', '熱媒油');
    }
  };

  const faultLabel = (fm: FaultMode) => {
    switch (fm) {
      case 'none':
        return pick('Healthy (Normal Operation)', 'Sehat (Operasi Normal)', '正常（標準運転）');
      case 'under-tightened':
        return pick(
          'Under-Tightened Packing Leak',
          'Kebocoran Packing Kurang Kencang',
          '締付不足によるパッキン漏洩',
        );
      case 'over-tightened':
        return pick(
          'Over-Tightened Stem Binding/Scoring',
          'Batang Macet/Tergores Terlalu Kencang',
          '過締付によるステム固着・かじり',
        );
      case 'passing-seat':
        return pick(
          'Passing Seat / Blowing Steam Trap',
          'Dudukan Bocor / Steam Trap Meniup',
          'シート漏れ / トラップ吹き抜け',
        );
    }
  };

  const updateParam = <K extends keyof ValveParams>(
    key: K,
    value: ValveParams[K],
  ) => {
    setActivePresetId('');
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetId: string) => {
    const preset = VALVE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setParams({ ...preset.params });
  };

  const resetAll = () => {
    applyPreset(VALVE_PRESETS[0].id);
  };

  const isBinding = telemetry.status === 'Stem Binding Risk';
  const isLeaking = telemetry.status === 'Fugitive Leak';
  const isSeatIssue =
    params.fault === 'passing-seat' || telemetry.seatLeakRateLh > 0.5;

  return (
    <div className="space-y-4">
      {/* Preset & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 glass-panel rounded-2xl p-3 ">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {pick('Scenarios:', 'Skenario:', 'シナリオ:')}
          </span>
          {VALVE_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                title={preset.description}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {presetLabel(preset.id, preset.label)}
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

      {/* Maintenance Status Banner */}
      {isBinding ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <div className="font-semibold">
              {pick('Maintenance Status:', 'Status Pemeliharaan:', '保全ステータス:')}{' '}
              {statusLabel}
            </div>
            <div className="mt-0.5 text-xs opacity-90">
              {pick(
                telemetry.statusDetail,
                'Torsi gland berlebih menekan cincin packing, menyebabkan gesekan batang tinggi, hunting aktuator, dan goresan batang.',
                '過大なグランドトルクによりパッキンが圧壊し、ステム摩擦増大・ハンチング・かじりが発生しています。',
              )}
            </div>
          </div>
        </div>
      ) : isLeaking || isSeatIssue ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <div className="font-semibold">
              {pick('Maintenance Status:', 'Status Pemeliharaan:', '保全ステータス:')}{' '}
              {statusLabel}
              {isSeatIssue
                ? ` • ${pick('Passing Seat / Blowing Steam Trap', 'Dudukan Bocor / Steam Trap Meniup', 'シート漏れ / トラップ吹き抜け')}`
                : ''}
            </div>
            <div className="mt-0.5 text-xs opacity-90">
              {isLeaking
                ? pick(
                    telemetry.statusDetail,
                    'Tegangan packing radial tidak mencukupi sehingga fluida proses bocor melewati stuffing box (>500 ppm ambang EPA).',
                    '半径方向パッキン面圧が不足し、スタフィングボックスから流体が漏洩しています（EPA 500 ppm基準超過）。',
                  )
                : pick(
                    telemetry.statusDetail,
                    'Stuffing box tersegel, namun dudukan tergerus menyebabkan blow-by hilir dan beban berlebih pada steam trap.',
                    'スタフィングボックスは密封されていますが、シート損傷により下流吹き抜けとトラップ過負荷が発生しています。',
                  )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>
              {pick('Maintenance Status:', 'Status Pemeliharaan:', '保全ステータス:')}{' '}
              {statusLabel}
            </strong>{' '}
            —{' '}
            {pick(
              telemetry.statusDetail,
              'Kompresi gland menyeimbangkan pengendalian emisi buronan terhadap gesekan batang.',
              'グランド圧縮により漏洩抑制とステム摩擦のバランスが最適に保たれています。',
            )}
          </span>
        </div>
      )}

      {/* Main Grid: SVG + Readouts on Left, Controls on Right */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-center">
            <ValveCutawaySvg params={params} telemetry={telemetry} />
          </div>

          {/* Live Readout Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-panel rounded-2xl p-3.5 ">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{pick('Flow Rate (Q)', 'Laju Aliran (Q)', '流量 (Q)')}</span>
                <Gauge className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {telemetry.flowM3h.toFixed(1)}{' '}
                <span className="text-xs font-medium text-slate-500">m³/h</span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Cv = {telemetry.effectiveCv.toFixed(1)} • ΔP ={' '}
                {telemetry.deltaPBar.toFixed(1)} bar
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-3.5 ">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{pick('Stem Friction', 'Gesekan Batang', 'ステム摩擦力')}</span>
                <Wrench
                  className={`h-3.5 w-3.5 ${
                    isBinding
                      ? 'text-red-500'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
              </div>
              <div
                className={`mt-1 text-xl font-bold tabular-nums ${
                  isBinding
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {telemetry.stemFrictionN.toFixed(0)}{' '}
                <span className="text-xs font-medium text-slate-500">N</span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {pick('Gland Force:', 'Gaya Gland:', '押付力:')}{' '}
                {(telemetry.glandForceN / 1000).toFixed(1)} kN
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-3.5 ">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{pick('Packing Leak', 'Kebocoran Packing', 'パッキン漏洩')}</span>
                <Droplets
                  className={`h-3.5 w-3.5 ${
                    isLeaking
                      ? 'text-amber-500'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                />
              </div>
              <div
                className={`mt-1 text-xl font-bold tabular-nums ${
                  isLeaking
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {telemetry.packingLeakRateMlMin.toFixed(1)}{' '}
                <span className="text-xs font-medium text-slate-500">
                  mL/min
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                EPA M21: {telemetry.fugitivePpm} ppm
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-3.5 ">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{pick('Seat Leakage', 'Kebocoran Dudukan', 'シート漏れ')}</span>
                <AlertTriangle
                  className={`h-3.5 w-3.5 ${
                    isSeatIssue
                      ? 'text-red-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
              </div>
              <div
                className={`mt-1 text-xl font-bold tabular-nums ${
                  isSeatIssue
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {telemetry.seatLeakRateLh.toFixed(1)}{' '}
                <span className="text-xs font-medium text-slate-500">L/h</span>
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {telemetry.trapBlowing
                  ? pick('Steam Trap: Blowing!', 'Steam Trap: Meniup!', 'トラップ: 吹き抜け!')
                  : pick('Trap: Normal Cycle', 'Trap: Siklus Normal', 'トラップ: 正常作動')}
              </div>
            </div>
          </div>

          <ValveDiagnosticsPanel params={params} telemetry={telemetry} />
        </div>

        {/* Right Column: Interactive Controls */}
        <div className="space-y-4 glass-panel rounded-2xl p-4  lg:col-span-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {pick(
              'Valve & Packing Controls',
              'Kontrol Katup & Packing',
              'バルブ＆パッキン操作',
            )}
          </h3>

          {/* Valve Type */}
          <div>
            <label
              htmlFor="valve-type-select"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {pick('Valve Type', 'Jenis Katup', 'バルブ形式')}
            </label>
            <select
              id="valve-type-select"
              value={params.valveType}
              onChange={(e) =>
                updateParam('valveType', e.target.value as ValveType)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {(Object.keys(VALVE_TYPE_INFO) as ValveType[]).map((vt) => (
                <option key={vt} value={vt}>
                  {valveTypeLabel(vt)} (Cv,max {VALVE_TYPE_INFO[vt].cvMax})
                </option>
              ))}
            </select>
          </div>

          {/* Fluid Service */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              {pick('Fluid Service', 'Layanan Fluida', '対象流体')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(FLUID_SERVICE_INFO) as FluidService[]).map((fs) => {
                const active = params.fluidService === fs;
                return (
                  <button
                    key={fs}
                    type="button"
                    onClick={() => updateParam('fluidService', fs)}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      active
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fluidLabel(fs)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Valve Opening */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pick(
                  'Valve Opening (Stem Travel)',
                  'Bukaan Katup (Gerak Batang)',
                  'バルブ開度 (ステムリフト)',
                )}
              </span>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {params.openingPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={params.openingPct}
              onChange={(e) =>
                updateParam('openingPct', Number(e.target.value))
              }
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Line Pressure */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pick('Line Pressure', 'Tekanan Jalur', 'ライン圧力')}
              </span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {params.linePressureBar} bar
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={params.linePressureBar}
              onChange={(e) =>
                updateParam('linePressureBar', Number(e.target.value))
              }
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Gland Follower Nut Torque */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pick(
                  'Gland Follower Nut Torque',
                  'Torsi Mur Gland Follower',
                  'グランドナット締付トルク',
                )}
              </span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {params.glandTorqueNm} N·m
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              step={1}
              value={params.glandTorqueNm}
              onChange={(e) =>
                updateParam('glandTorqueNm', Number(e.target.value))
              }
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Packing Ring Wear / Cycles */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {pick(
                  'Packing Ring Wear / Cycles',
                  'Keausan / Siklus Cincin Packing',
                  'パッキン摩耗 / 作動回数',
                )}
              </span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {(params.packingWearCycles / 1000).toFixed(0)}k{' '}
                {pick('cycles', 'siklus', '回')}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100000}
              step={2000}
              value={params.packingWearCycles}
              onChange={(e) =>
                updateParam('packingWearCycles', Number(e.target.value))
              }
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Steam Trap / Seat Fault Injection */}
          <div>
            <label
              htmlFor="fault-injection-select"
              className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              {pick(
                'Steam Trap / Seat Fault Injection',
                'Injeksi Gangguan Steam Trap / Dudukan',
                'トラップ・シート故障注入',
              )}
            </label>
            <select
              id="fault-injection-select"
              value={params.fault}
              onChange={(e) => updateParam('fault', e.target.value as FaultMode)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {(Object.keys(FAULT_MODE_INFO) as FaultMode[]).map((fm) => (
                <option key={fm} value={fm}>
                  {faultLabel(fm)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
