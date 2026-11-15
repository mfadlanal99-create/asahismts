import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, Radio, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ClampMeterSvg } from './ClampMeterSvg';
import {
  CLAMP_FAULT_SCENARIOS,
  computeClampMeterSnapshot,
  type ClampFaultScenario,
  type ConductorId,
} from './clampMeterPhysics';

const CONDUCTOR_OPTIONS: { id: ConductorId; label: string }[] = [
  { id: 'L1', label: 'L1 (U)' },
  { id: 'L2', label: 'L2 (V)' },
  { id: 'L3', label: 'L3 (W)' },
  { id: 'PE_N', label: 'PE / N' },
];

export function ClampMeterSimulator() {
  const { pick } = useLanguage();

  const [conductor, setConductor] = useState<ConductorId>('L1');
  const [fault, setFault] = useState<ClampFaultScenario>('normal-75');
  const [loadPct, setLoadPct] = useState<number>(75);
  const [inrushEnabled, setInrushEnabled] = useState<boolean>(false);

  const snapshot = useMemo(
    () => computeClampMeterSnapshot(conductor, fault, loadPct, inrushEnabled),
    [conductor, fault, loadPct, inrushEnabled]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT: Interactive Clamp Meter & Feeder SVG */}
        <div className="lg:col-span-7 space-y-4">
          <ClampMeterSvg
            conductor={conductor}
            onSelectConductor={setConductor}
            fault={fault}
            inrushEnabled={inrushEnabled}
            snapshot={snapshot}
          />

          {/* Diagnostic Readout Banner */}
          <div
            className={`glass-panel rounded-2xl p-4 border transition-colors ${
              snapshot.nemaStatus === 'critical'
                ? 'border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30'
                : snapshot.nemaStatus === 'derate'
                  ? 'border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-700/70'
            }`}
          >
            <div className="flex items-start gap-3">
              {snapshot.nemaStatus === 'critical' ? (
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <Radio className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pick(
                    'Power & Unbalance Analysis',
                    'Analisis Daya & Ketidakseimbangan',
                    '電力・不平衡診断'
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {pick(
                    snapshot.diagnosticNote.en,
                    snapshot.diagnosticNote.id,
                    snapshot.diagnosticNote.ja
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Controls & Analyzer Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          {/* Clamp Position & Inrush Toggle */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {pick('Clamp Jaw Target', 'Target Penjepit Clamp', 'クランプ対象導体')}
              </h3>
              <button
                type="button"
                onClick={() => setInrushEnabled((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  inrushEnabled
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                {pick('INRUSH', 'INRUSH', '突入電流')}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {CONDUCTOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setConductor(opt.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    conductor === opt.id
                      ? 'bg-[#001F6B] text-white border-[#002D9C] dark:bg-sky-500 dark:text-slate-950 dark:border-sky-400 shadow-sm'
                      : 'bg-white/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Motor Load Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">
                  {pick('Mechanical Shaft Load', 'Beban Poros Mekanis', '機械軸負荷')}
                </span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  {loadPct}%
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={110}
                step={5}
                value={loadPct}
                onChange={(e) => setLoadPct(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* 3-Phase Power & NEMA MG-1 Telemetry */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-500" />
              {pick(
                '3-Phase Power & NEMA MG-1',
                'Daya 3-Fasa & NEMA MG-1',
                '三相電力・NEMA MG-1'
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-3">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Active Power (P)', 'Daya Aktif (P)', '有効電力 (P)')}
                </div>
                <div className="text-base font-bold font-mono text-sky-600 dark:text-sky-400">
                  {snapshot.activePowerKw.toFixed(2)} kW
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-3">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Apparent Power (S)', 'Daya Semu (S)', '皮相電力 (S)')}
                </div>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                  {snapshot.apparentPowerKva.toFixed(2)} kVA
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-3">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Power Factor (cos φ)', 'Faktor Daya (PF)', '力率 (cos φ)')}
                </div>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                  {snapshot.powerFactor.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-3">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Current Unbalance', 'Ketidakseimbangan Arus', '電流不平衡率')}
                </div>
                <div
                  className={`text-base font-bold font-mono ${
                    snapshot.nemaStatus === 'critical'
                      ? 'text-rose-500'
                      : snapshot.nemaStatus === 'derate'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                  }`}
                >
                  {snapshot.currentUnbalancePct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Fault Scenario Selector */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {pick('Feeder Fault Scenario', 'Skenario Gangguan Feeder', 'フィーダ故障シナリオ')}
            </h3>
            <div className="space-y-2">
              {CLAMP_FAULT_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setFault(sc.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    fault === sc.id
                      ? 'bg-[#001F6B] text-white border-[#002D9C] dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/50'
                      : 'bg-white/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                  }`}
                >
                  {pick(sc.en, sc.idLabel, sc.ja)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
