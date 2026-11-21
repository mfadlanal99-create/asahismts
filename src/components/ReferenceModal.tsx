import { useEffect, useState } from 'react';
import { BookMarked, Crosshair, Droplets, Ruler, Wrench, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HandbookTab = 'fits' | 'torque' | 'alignment' | 'fluid';

const HANDBOOK_TABS: {
  id: HandbookTab;
  en: string;
  idLabel: string;
  ja: string;
  icon: typeof Ruler;
}[] = [
  { id: 'fits', en: 'ISO Fits', idLabel: 'Suaian ISO', ja: 'ISOはめあい', icon: Ruler },
  { id: 'torque', en: 'Bolt Torque', idLabel: 'Torsi Baut', ja: 'ボルトトルク', icon: Wrench },
  {
    id: 'alignment',
    en: 'Alignment & Vib',
    idLabel: 'Penyelarasan & Getaran',
    ja: '芯出し・振動',
    icon: Crosshair,
  },
  { id: 'fluid', en: 'Fluid & Pumps', idLabel: 'Fluida & Pompa', ja: '流体・ポンプ', icon: Droplets },
];

const ISO_FITS = [
  {
    code: 'g6 (Shaft)',
    type: 'Clearance',
    use: 'Light sliding / stationary inner ring with axial float',
    note: 'Used on non-locating bearing inner rings under light stationary load.',
  },
  {
    code: 'h6 (Shaft)',
    type: 'Clearance / Transition',
    use: 'General shaft journals, adapter sleeves, stationary inner ring',
    note: 'Upper deviation = 0 µm. Standard precision shaft tolerance.',
  },
  {
    code: 'k5 (Shaft)',
    type: 'Transition / Tight',
    use: 'Rotating inner ring load — light to normal radial loads (e.g., electric motors)',
    note: 'Prevents inner-ring fretting & creep on shaft.',
  },
  {
    code: 'm5 (Shaft)',
    type: 'Interference',
    use: 'Heavy radial/shock loads on rotating inner ring (pumps, gearboxes)',
    note: 'Requires induction heater (110 °C max) or hydraulic press mounting.',
  },
  {
    code: 'H7 (Housing)',
    type: 'Clearance',
    use: 'Standard stationary outer ring — easy axial displacement (non-locating)',
    note: 'Lower deviation = 0 µm. Most common industrial pillow-block housing fit.',
  },
  {
    code: 'J7 (Housing)',
    type: 'Transition',
    use: 'Locating bearing outer ring with indeterminate or light shock load',
    note: 'Allows axial assembly while limiting outer-ring rotation.',
  },
  {
    code: 'N7 (Housing)',
    type: 'Interference',
    use: 'Rotating outer ring load (idler pulleys, vibrating screens)',
    note: 'Prevents outer-ring creep inside rotating hubs.',
  },
];

const BOLT_TORQUES = [
  { size: 'M6 × 1.0', c88Dry: '10', c88Oil: '8', c109Dry: '14', c129Dry: '17', preload88: '8.5 kN' },
  { size: 'M8 × 1.25', c88Dry: '25', c88Oil: '19', c109Dry: '35', c129Dry: '42', preload88: '15.5 kN' },
  { size: 'M10 × 1.5', c88Dry: '49', c88Oil: '37', c109Dry: '69', c129Dry: '83', preload88: '24.5 kN' },
  { size: 'M12 × 1.75', c88Dry: '85', c88Oil: '64', c109Dry: '120', c129Dry: '144', preload88: '35.7 kN' },
  { size: 'M16 × 2.0', c88Dry: '210', c88Oil: '158', c109Dry: '295', c129Dry: '355', preload88: '66.4 kN' },
  { size: 'M20 × 2.5', c88Dry: '410', c88Oil: '308', c109Dry: '580', c129Dry: '695', preload88: '104 kN' },
  { size: 'M24 × 3.0', c88Dry: '710', c88Oil: '532', c109Dry: '1000', c129Dry: '1200', preload88: '150 kN' },
];

export function ReferenceModal({ isOpen, onClose }: ReferenceModalProps) {
  const [tab, setTab] = useState<HandbookTab>('fits');
  const { pick } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="handbook-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm animate-view-enter"
      onClick={onClose}
    >
      <div
        className="glass-panel animate-modal-enter relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-[var(--md-outline-variant)]/50 px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
                <BookMarked className="h-5 w-5" />
              </div>
              <div>
                <h2
                  id="handbook-modal-title"
                  className="text-lg font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-xl"
                >
                  {pick(
                    'Maintenance Field Handbook',
                    'Buku Panduan Lapangan Pemeliharaan',
                    '保全フィールドハンドブック'
                  )}
                </h2>
                <p className="text-xs text-[var(--md-on-surface-variant)]">
                  {pick(
                    'Asahi-SMTS pocket reference for plant technicians & millwrights',
                    'Referensi saku Asahi-SMTS untuk teknisi & millwright pabrik',
                    'プラント技術者・整備員向け Asahi-SMTS ポケットリファレンス'
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close handbook"
              className="glass-pill inline-flex h-9 w-9 items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-high)] p-1">
            {HANDBOOK_TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition ${
                    active
                      ? 'bg-[var(--md-secondary-container)] font-semibold text-[var(--md-on-secondary-container)] shadow-2xs'
                      : 'font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{pick(t.en, t.idLabel, t.ja)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="relative flex-1 overflow-y-auto px-6 py-5 text-xs">
          {tab === 'fits' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--md-on-surface)]">
                  {pick(
                    'ISO 286 shaft & housing fit guide for rolling element bearings:',
                    'Panduan suaian poros & rumah bantalan ISO 286 untuk bantalan gelinding:',
                    '転がり軸受用 ISO 286 軸およびハウジングはめあいガイド:'
                  )}
                </p>
                <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-1 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)]">
                  ISO 286-1 / DIN 7154
                </span>
              </div>
              <div className="glass-card overflow-hidden rounded-[24px]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                      <th className="px-4 py-3">ISO Class</th>
                      <th className="px-3 py-3">Fit Type</th>
                      <th className="px-4 py-3">Typical Application &amp; Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-outline-variant)]/35">
                    {ISO_FITS.map((f) => (
                      <tr
                        key={f.code}
                        className="bg-[var(--md-surface-container-low)] transition hover:bg-[var(--md-surface-container)]"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-[var(--md-primary)]">
                          <span className="inline-block rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-bold text-[var(--md-on-primary-container)]">
                            {f.code}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-[var(--md-on-surface)]">
                          {f.type}
                        </td>
                        <td className="px-4 py-3 text-[var(--md-on-surface-variant)]">
                          <div className="font-semibold text-[var(--md-on-surface)]">
                            {f.use}
                          </div>
                          <div className="mt-0.5 text-[11px] opacity-90">
                            {f.note}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'torque' && (
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--md-on-surface)]">
                  {pick(
                    'Standard coarse metric bolt tightening torque (N·m) at ~75% proof load (Dry K ≈ 0.20, Oiled K ≈ 0.15):',
                    'Torsi pengencangan baut metrik ulir kasar standar (N·m) pada beban uji ~75% (Kering K ≈ 0,20, Terlumasi K ≈ 0,15):',
                    '標準メートル並目ボルト締付トルク (N·m) 耐力比 ~75% (ドライ K ≈ 0.20、給油 K ≈ 0.15):'
                  )}
                </p>
                <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-1 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)]">
                  VDI 2230 / ISO 898-1
                </span>
              </div>
              <div className="glass-card overflow-x-auto rounded-[24px]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                      <th className="px-4 py-3">Thread</th>
                      <th className="px-3 py-3 text-right">8.8 Dry</th>
                      <th className="px-3 py-3 text-right">8.8 Oiled</th>
                      <th className="px-3 py-3 text-right">10.9 Dry</th>
                      <th className="px-3 py-3 text-right">12.9 Dry</th>
                      <th className="px-4 py-3 text-right">8.8 Preload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-outline-variant)]/35 font-mono">
                    {BOLT_TORQUES.map((row) => (
                      <tr
                        key={row.size}
                        className="bg-[var(--md-surface-container-low)] transition hover:bg-[var(--md-surface-container)]"
                      >
                        <td className="px-4 py-3 font-semibold text-[var(--md-on-surface)]">
                          <span className="inline-block rounded-full bg-[var(--md-surface-container-highest)] px-2.5 py-0.5 font-bold">
                            {row.size}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-[var(--md-on-surface)]">
                          {row.c88Dry} <span className="text-[10px] text-[var(--md-on-surface-variant)]">N·m</span>
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-[var(--md-primary)]">
                          {row.c88Oil} <span className="text-[10px] opacity-75">N·m</span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-[var(--md-on-surface)]">
                          {row.c109Dry} <span className="text-[10px] text-[var(--md-on-surface-variant)]">N·m</span>
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-[var(--md-on-surface)]">
                          {row.c129Dry} <span className="text-[10px] text-[var(--md-on-surface-variant)]">N·m</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-300">
                          {row.preload88}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'alignment' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-[24px] p-4.5">
                <h3 className="mb-3 text-sm font-bold text-[var(--md-on-surface)]">
                  Shaft Alignment Tolerances (Coupling)
                </h3>
                <ul className="space-y-2 text-[var(--md-on-surface-variant)]">
                  <li className="flex items-start gap-2">
                    <strong className="shrink-0 font-mono text-[var(--md-on-surface)]">
                      1500 RPM:
                    </strong>{' '}
                    <span>Offset &le; 0.08 mm · Angularity &le; 0.07 mm / 100 mm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="shrink-0 font-mono text-[var(--md-on-surface)]">
                      3000 RPM:
                    </strong>{' '}
                    <span>Offset &le; 0.05 mm · Angularity &le; 0.04 mm / 100 mm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="shrink-0 font-mono text-[var(--md-on-surface)]">
                      Soft Foot Limit:
                    </strong>{' '}
                    <span>&le; 0.05 mm lift when loosening any motor foot bolt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="shrink-0 font-mono text-[var(--md-on-surface)]">
                      Dial Validity Rule:
                    </strong>{' '}
                    <span>Top + Bottom = Left + Right (T + B = L + R)</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-[24px] p-4.5">
                <h3 className="mb-3 text-sm font-bold text-[var(--md-on-surface)]">
                  ISO 10816 / 20816 Vibration Zones (RMS mm/s)
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between rounded-2xl border border-emerald-300/50 bg-emerald-50/80 px-3 py-2 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-200">
                    <span className="font-bold">Zone A (Good / New Machine)</span>
                    <span className="font-mono font-bold">&le; 1.8 mm/s</span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl bg-[var(--md-primary-container)] px-3 py-2 text-[var(--md-on-primary-container)]">
                    <span className="font-bold">Zone B (Satisfactory)</span>
                    <span className="font-mono font-bold">1.8 – 4.5 mm/s</span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl border border-amber-300/50 bg-amber-50/80 px-3 py-2 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200">
                    <span className="font-bold">Zone C (Unsatisfactory)</span>
                    <span className="font-mono font-bold">4.5 – 7.1 mm/s</span>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl border border-rose-300/50 bg-rose-50/80 px-3 py-2 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200">
                    <span className="font-bold">Zone D (Unacceptable Danger)</span>
                    <span className="font-mono font-bold">&gt; 7.1 mm/s</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-[24px] p-4.5 sm:col-span-2">
                <h3 className="mb-3 text-sm font-bold text-[var(--md-on-surface)]">
                  Bore Gauge, Roller Chain &amp; Rigging Field Limits
                </h3>
                <ul className="grid gap-3 text-[var(--md-on-surface-variant)] sm:grid-cols-3">
                  <li className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3">
                    <div className="mb-1 font-mono font-bold text-[var(--md-on-surface)]">
                      Cylinder Bore Limit
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Ovality |D_A − D_B| &le; 0.05 mm · Taper &le; 0.05 mm (rock
                      gauge through null point)
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3">
                    <div className="mb-1 font-mono font-bold text-[var(--md-on-surface)]">
                      ANSI Roller Chain
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Replace at 1.5% elongation (hardened) / 3.0% (standard) ·
                      Slack sag &asymp; 2% of span C
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3">
                    <div className="mb-1 font-mono font-bold text-[var(--md-on-surface)]">
                      Rigging Sling Factor
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      L/H = 1 / sin(&theta;) (60° = 1.155&times;, 45° =
                      1.414&times;, 30° = 2.000&times;; never &lt; 30°)
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'fluid' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-[24px] p-4.5">
                <h3 className="mb-3 text-sm font-bold text-[var(--md-on-surface)]">
                  ISO 1219 Port Key &amp; Pascal&apos;s Law
                </h3>
                <ul className="space-y-2 text-[var(--md-on-surface-variant)]">
                  <li>
                    <strong className="font-mono text-[var(--md-primary)]">
                      1 (P)
                    </strong>{' '}
                    = Pressure Supply ·{' '}
                    <strong className="font-mono text-[var(--md-primary)]">
                      2, 4 (B, A)
                    </strong>{' '}
                    = Working Ports ·{' '}
                    <strong className="font-mono text-[var(--md-primary)]">
                      3, 5 (R, S)
                    </strong>{' '}
                    = Exhaust / Tank
                  </li>
                  <li className="font-mono font-semibold text-[var(--md-on-surface)]">
                    F = P &times; A (1 bar = 0.1 MPa = 10⁵ Pa)
                  </li>
                  <li className="font-mono font-semibold text-[var(--md-on-surface)]">
                    Hyd. Power (kW) = (P_bar &times; Q_L/min) / 600
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-[24px] p-4.5">
                <h3 className="mb-3 text-sm font-bold text-[var(--md-on-surface)]">
                  Pump Affinity Laws &amp; NPSH
                </h3>
                <ul className="space-y-2 font-mono text-[var(--md-on-surface)]">
                  <li>Q₂ / Q₁ = N₂ / N₁ (Flow &prop; RPM)</li>
                  <li>H₂ / H₁ = (N₂ / N₁)² (Head &prop; RPM²)</li>
                  <li>P₂ / P₁ = (N₂ / N₁)³ (Power &prop; RPM³)</li>
                  <li className="font-sans font-medium text-emerald-700 dark:text-emerald-300">
                    <strong>Cavitation Rule:</strong> Maintain NPSHa &ge; NPSHr + 0.5 m safety margin.
                  </li>
                </ul>
              </div>

              <div className="glass-card rounded-[24px] p-4.5 sm:col-span-2">
                <h3 className="mb-3 text-sm font-bold text-[var(--md-on-surface)]">
                  Hydraulic Fluid Cleanliness &amp; Viscosity
                </h3>
                <ul className="grid gap-3 text-[var(--md-on-surface-variant)] sm:grid-cols-3">
                  <li className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3">
                    <div className="mb-1 font-mono font-bold text-[var(--md-on-surface)]">
                      ISO 4406 Cleanliness
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Scale codes for particles &ge; 4 µm / &ge; 6 µm / &ge; 14 µm (e.g. 17/15/12 for proportional &amp; servo valves).
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3">
                    <div className="mb-1 font-mono font-bold text-[var(--md-on-surface)]">
                      Operating Temp Limit
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Optimal oil sump 40–55 °C · Warning &gt; 65 °C (rapid seal degradation and oxidation; viscosity drops below 10 cSt).
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3">
                    <div className="mb-1 font-mono font-bold text-[var(--md-on-surface)]">
                      Accumulator Precharge
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      P₀ &asymp; 0.9 &times; P_min (shock suppression) or 0.6–0.85 &times; P_min (energy storage). Nitrogen (N₂) only!
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-6 py-3 text-[11px] text-[var(--md-on-surface-variant)]">
          <span>
            {pick(
              'Asahi-SMTS Quick Maintenance Engineering Standard',
              'Referensi Cepat Standar Teknik Pemeliharaan Asahi-SMTS',
              'Asahi-SMTS 迅速保全エンジニアリング規格'
            )}
          </span>
          <span className="glass-pill rounded-full px-3 py-0.5 font-mono text-[10px]">
            {pick('Press Esc to close', 'Tekan Esc untuk menutup', 'Escで閉じる')}
          </span>
        </div>
      </div>
    </div>
  );
}
