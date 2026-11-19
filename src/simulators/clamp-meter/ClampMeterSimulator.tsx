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
            className={`glass-panel rounded-[28px] border p-4 sm:p-5 transition-colors ${
              snapshot.nemaStatus === 'critical'
                ? 'border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/30'
                : snapshot.nemaStatus === 'derate'
                  ? 'border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/20'
                  : 'border-[var(--md-outline-variant)]/60'
            }`}
          >
            <div className="flex items-start gap-3">
              {snapshot.nemaStatus === 'critical' ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              ) : (
                <Radio className="mt-0.5 h-5 w-5 shrink-0 text-[var(--md-primary)]" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick(
                    'Power & Unbalance Analysis',
                    'Analisis Daya & Ketidakseimbangan',
                    '電力・不平衡診断'
                  )}
                </div>
                <p className="text-sm leading-relaxed text-[var(--md-on-surface)]">
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
          <div className="glass-panel space-y-4 rounded-[28px] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                {pick('Clamp Jaw Target', 'Target Penjepit Clamp', 'クランプ対象導体')}
              </h3>
              <button
                type="button"
                onClick={() => setInrushEnabled((prev) => !prev)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  inrushEnabled
                    ? 'm3-btn-filled'
                    : 'glass-pill'
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
                  className={`rounded-full border px-2 py-2 text-xs font-bold transition cursor-pointer ${
                    conductor === opt.id
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-2xs'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Motor Load Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[var(--md-on-surface-variant)]">
                  {pick('Mechanical Shaft Load', 'Beban Poros Mekanis', '機械軸負荷')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
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
                className="w-full"
              />
            </div>
          </div>

          {/* 3-Phase Power & NEMA MG-1 Telemetry */}
          <div className="glass-panel space-y-3 rounded-[28px] p-5">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              <Activity className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                '3-Phase Power & NEMA MG-1',
                'Daya 3-Fasa & NEMA MG-1',
                '三相電力・NEMA MG-1'
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Active Power (P)', 'Daya Aktif (P)', '有効電力 (P)')}
                </div>
                <div className="font-mono text-base font-bold text-[var(--md-primary)]">
                  {snapshot.activePowerKw.toFixed(2)} kW
                </div>
              </div>
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Apparent Power (S)', 'Daya Semu (S)', '皮相電力 (S)')}
                </div>
                <div className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                  {snapshot.apparentPowerKva.toFixed(2)} kVA
                </div>
              </div>
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Power Factor (cos φ)', 'Faktor Daya (PF)', '力率 (cos φ)')}
                </div>
                <div className="font-mono text-base font-bold text-[var(--md-on-surface)]">
                  {snapshot.powerFactor.toFixed(2)}
                </div>
              </div>
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Current Unbalance', 'Ketidakseimbangan Arus', '電流不平衡率')}
                </div>
                <div
                  className={`font-mono text-base font-bold ${
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
          <div className="glass-panel space-y-3 rounded-[28px] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick('Feeder Fault Scenario', 'Skenario Gangguan Feeder', 'フィーダ故障シナリオ')}
            </h3>
            <div className="space-y-2">
              {CLAMP_FAULT_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setFault(sc.id)}
                  className={`w-full rounded-[20px] border px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                    fault === sc.id
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
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
