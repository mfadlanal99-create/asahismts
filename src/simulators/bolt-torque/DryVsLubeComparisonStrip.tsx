import { AlertOctagon, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  LUBRICATION_CONDITIONS,
  calculateBoltedJoint,
  type MetricBoltSpec,
  type PropertyClassSpec,
} from './boltData';

interface DryVsLubeComparisonStripProps {
  bolt: MetricBoltSpec;
  propClass: PropertyClassSpec;
  torqueNm: number;
  activeLubeId: string;
  onApplyDrySpec: (dryTargetTorqueNm: number) => void;
}

export function DryVsLubeComparisonStrip({
  bolt,
  propClass,
  torqueNm,
  activeLubeId,
  onApplyDrySpec,
}: DryVsLubeComparisonStripProps) {
  const { pick } = useLanguage();
  const drySpec = LUBRICATION_CONDITIONS[0]; // Dry K=0.20
  const dryCalcAtZero = calculateBoltedJoint(bolt, propClass, drySpec, 0);
  const dryTargetTorque = dryCalcAtZero.recommendedTorqueNm;

  const comparisonIds: Array<'dry' | 'light-oil' | 'moly-paste'> = [
    'dry',
    'light-oil',
    'moly-paste',
  ];

  const rows = comparisonIds.map((id) => {
    const lube =
      LUBRICATION_CONDITIONS.find((l) => l.id === id) ?? LUBRICATION_CONDITIONS[0];
    const res = calculateBoltedJoint(bolt, propClass, lube, torqueNm);
    return { lube, res };
  });

  const molyRow = rows[2];
  const molyOverloaded = molyRow.res.proofPercent > 100;

  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--md-outline-variant)]/50 pb-3.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--md-on-surface)]">
              {pick(
                `Dry vs. Lubricated Over-Torque Comparison (${bolt.size} · Class ${propClass.id})`,
                `Perbandingan Over-Torque Kering vs. Berpelumas (${bolt.size} · Kelas ${propClass.id})`,
                `無潤滑 vs 潤滑 オーバートルク比較 (${bolt.size} · 強度区分 ${propClass.id})`
              )}
            </h3>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                `Live preload & stress if ${torqueNm.toFixed(1)} N·m is applied across different thread lubrication conditions.`,
                `Preload & tegangan langsung jika ${torqueNm.toFixed(1)} N·m diterapkan pada berbagai kondisi pelumasan ulir.`,
                `${torqueNm.toFixed(1)} N·m を各潤滑条件に適用した場合の軸力・応力比較。`
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onApplyDrySpec(Number(dryTargetTorque.toFixed(1)))}
          className="m3-btn-tonal inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
        >
          {pick(
            `Apply Dry 75% Spec (${dryTargetTorque.toFixed(1)} N·m)`,
            `Terapkan Spek Kering 75% (${dryTargetTorque.toFixed(1)} N·m)`,
            `無潤滑 75% 仕様を適用 (${dryTargetTorque.toFixed(1)} N·m)`
          )}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {rows.map(({ lube, res }) => {
          const isCurrent = lube.id === activeLubeId;
          const barPct = Math.min((res.proofPercent / 140) * 100, 100);
          const proofMarkerPct = (100 / 140) * 100;

          const badge =
            res.status === 'stripped'
              ? {
                  label: 'FRACTURE / STRIPPED',
                  cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300',
                  bar: 'bg-rose-500',
                }
              : res.status === 'yielded'
              ? {
                  label: 'YIELDED (>100%)',
                  cls: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300',
                  bar: 'bg-orange-500',
                }
              : res.status === 'caution'
              ? {
                  label: 'YIELD EDGE',
                  cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300',
                  bar: 'bg-amber-500',
                }
              : res.status === 'optimal'
              ? {
                  label: 'SAFE ELASTIC',
                  cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
                  bar: 'bg-emerald-500',
                }
              : {
                  label: 'LOW PRELOAD',
                  cls: 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]',
                  bar: 'bg-[var(--md-outline)]',
                };

          return (
            <div
              key={lube.id}
              className={`rounded-[22px] border p-3.5 transition ${
                isCurrent
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)]/40 ring-1 ring-[var(--md-primary)]/25'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[var(--md-on-surface)]">
                    {lube.label}
                  </span>
                  <span className="ml-1.5 font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                    K={lube.kFactor.toFixed(2)}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline justify-between font-mono text-xs">
                <span className="text-[var(--md-on-surface-variant)]">
                  Fi = <strong className="text-[var(--md-on-surface)]">{res.preloadKn.toFixed(1)} kN</strong>
                </span>
                <span className="text-[var(--md-on-surface-variant)]">
                  σt = <strong className="text-[var(--md-on-surface)]">{res.tensileStressMpa.toFixed(0)} MPa</strong>
                </span>
                <span className="font-bold text-[var(--md-on-surface)]">
                  {res.proofPercent.toFixed(0)}%
                </span>
              </div>

              {/* Proof % Bar with 100% Proof Threshold Marker */}
              <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                <div
                  className={`h-full rounded-full transition-all ${badge.bar}`}
                  style={{ width: `${barPct}%` }}
                />
                <div
                  title="100% Proof Load Limit"
                  className="absolute top-0 bottom-0 w-0.5 bg-[var(--md-on-surface)]/70"
                  style={{ left: `${proofMarkerPct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[var(--md-on-surface-variant)]">
                <span>0%</span>
                <span>100% Proof ({propClass.proofStrengthMpa} MPa)</span>
                <span>140%</span>
              </div>
            </div>
          );
        })}
      </div>

      {molyOverloaded && (
        <div className="mt-3 flex items-start gap-2 rounded-[22px] border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertOctagon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>
            <strong>Lubrication Trap Alert:</strong> At {torqueNm.toFixed(1)} N·m, a Moly-lubricated bolt (K=0.12) experiences{' '}
            <strong>{molyRow.res.proofPercent.toFixed(0)}% of Proof Load</strong> ({molyRow.res.tensileStressMpa.toFixed(0)} MPa vs. {propClass.yieldStrengthMpa} MPa Yield) —{' '}
            <strong>67% higher preload</strong> than Dry (K=0.20)! Always de-rate torque when adding anti-seize or moly paste.
          </span>
        </div>
      )}
    </div>
  );
}
