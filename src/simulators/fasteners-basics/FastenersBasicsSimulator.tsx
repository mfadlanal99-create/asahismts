/* oxlint-disable react/only-export-components */
import { useMemo, useState } from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FastenersBasicsSvg } from './FastenersBasicsSvg';
import {
  BOLT_HEADS,
  METRIC_BOLT_SPECS,
  NUT_TYPES,
  PROPERTY_CLASSES,
  WASHER_TYPES,
  calculateFastenerBasics,
  type BoltHeadType,
  type MetricBoltSize,
  type NutType,
  type PropertyClass,
  type WasherType,
} from './fastenersBasicsData';

export { fastenersBasicsMeta } from './fastenersBasicsMeta';

export function FastenersBasicsSimulator() {
  const { pick } = useLanguage();

  const [boltHead, setBoltHead] = useState<BoltHeadType>('hex-din933');
  const [nut, setNut] = useState<NutType>('nyloc-din985');
  const [washer, setWasher] = useState<WasherType>('flat-din125');
  const [size, setSize] = useState<MetricBoltSize>('M10');
  const [propertyClass, setPropertyClass] = useState<PropertyClass>('8.8');

  const activeHead = useMemo(
    () => BOLT_HEADS.find((h) => h.id === boltHead) ?? BOLT_HEADS[0],
    [boltHead]
  );
  const activeNut = useMemo(
    () => NUT_TYPES.find((n) => n.id === nut) ?? NUT_TYPES[0],
    [nut]
  );
  const activeWasher = useMemo(
    () => WASHER_TYPES.find((w) => w.id === washer) ?? WASHER_TYPES[0],
    [washer]
  );
  const activeSpec = METRIC_BOLT_SPECS[size];
  const activeClass = PROPERTY_CLASSES[propertyClass];
  const jointCalc = useMemo(
    () => calculateFastenerBasics(activeSpec, activeClass),
    [activeSpec, activeClass]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN: 2D CAD VISUALIZATION & HARDWARE BREAKDOWN (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <FastenersBasicsSvg
            boltHead={boltHead}
            nut={nut}
            washer={washer}
            size={size}
            propertyClass={propertyClass}
          />

          <div data-tour="fasteners-stack" className="glass-panel rounded-[28px] p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Selected Fastener Stack & Application Guide',
                'Ringkasan Susunan Pengencang & Aplikasi',
                '選択締結要素・適用ガイド'
              )}
            </h3>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-1">
                <div className="font-bold text-[var(--md-primary)]">
                  {activeHead.name}
                </div>
                <div className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                  {activeHead.standard}
                </div>
                <p className="text-[var(--md-on-surface)] leading-relaxed pt-1">
                  {activeHead.features}
                </p>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] pt-1">
                  <strong className="text-[var(--md-on-surface)]">
                    {pick('Drive:', 'Alat:', '工具:')}
                  </strong>{' '}
                  {activeHead.driveType}
                </p>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-1">
                <div className="font-bold text-[var(--md-primary)]">
                  {activeNut.name}
                </div>
                <div className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                  {activeNut.standard}
                </div>
                <p className="text-[var(--md-on-surface)] leading-relaxed pt-1">
                  {activeNut.lockingMechanism}
                </p>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] pt-1">
                  <strong className="text-[var(--md-on-surface)]">
                    {pick('Reuse:', 'Pakai Ulang:', '再使用:')}
                  </strong>{' '}
                  {activeNut.reusability}
                </p>
              </div>

              <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 space-y-1">
                <div className="font-bold text-[var(--md-primary)]">
                  {activeWasher.name}
                </div>
                <div className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">
                  {activeWasher.standard}
                </div>
                <p className="text-[var(--md-on-surface)] leading-relaxed pt-1">
                  {activeWasher.workingPrinciple}
                </p>
                <p className="text-[11px] text-[var(--md-on-surface-variant)] pt-1">
                  <strong className="text-[var(--md-on-surface)]">
                    {pick('Vibration:', 'Getaran:', '耐振性:')}
                  </strong>{' '}
                  {activeWasher.effectiveness}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & LIVE ENGINEERING READOUT (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel rounded-[28px] p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--md-on-surface)] flex items-center gap-2">
              <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Bolt, Nut, Washer & Grade Controls',
                'Kontrol Baut, Mur, Ring & Kelas Baja',
                'ボルト・ナット・座金・強度区分設定'
              )}
            </h2>

            {/* Bolt Head Type */}
            <div data-tour="fasteners-head" className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--md-on-surface)]">
                {pick('Bolt Head Style', 'Bentuk Kepala Baut', 'ボルト頭部形状')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {BOLT_HEADS.map((head) => (
                  <button
                    key={head.id}
                    type="button"
                    onClick={() => setBoltHead(head.id)}
                    className={`px-3 py-2 rounded-[20px] text-left text-xs border transition ${
                      boltHead === head.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {head.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Nut Type */}
            <div data-tour="fasteners-nut" className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--md-on-surface)]">
                {pick('Nut Locking Type', 'Tipe Mur Pengunci', 'ナット形式')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {NUT_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNut(item.id)}
                    className={`px-3 py-2 rounded-[20px] text-left text-xs border transition ${
                      nut === item.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Washer Type */}
            <div data-tour="fasteners-washer" className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--md-on-surface)]">
                {pick('Washer Type', 'Jenis Ring', '座金（ワッシャー）')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {WASHER_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWasher(item.id)}
                    className={`px-2.5 py-2 rounded-full text-center text-xs border transition ${
                      washer === item.id
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {item.name.split(' ')[0]} {item.standard.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Diameter */}
            <div data-tour="fasteners-size" className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--md-on-surface)]">
                {pick('Metric Size & Wrench (AF)', 'Ukuran Metrik & Kunci Pas', '呼び径・工具サイズ')}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(Object.keys(METRIC_BOLT_SPECS) as MetricBoltSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`flex flex-col items-center py-2 rounded-[20px] text-center text-xs border transition ${
                      size === sz
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <div>{sz}</div>
                    <div className="text-[10px] font-mono font-normal opacity-80">
                      {METRIC_BOLT_SPECS[sz].hexSpannerMm}mm
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Class */}
            <div data-tour="fasteners-grade" className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--md-on-surface)]">
                {pick('Property Class / Grade', 'Kelas Kekuatan (Grade)', '強度区分・材質グレード')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(PROPERTY_CLASSES) as PropertyClass[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setPropertyClass(grade)}
                    className={`py-2 px-2 rounded-full text-center text-xs border transition ${
                      propertyClass === grade
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-semibold text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TELEMETRY & DECODER SUMMARY CARD */}
          <div data-tour="fasteners-telemetry" className="glass-panel rounded-[28px] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
              {pick(
                'Property Class & Torque Telemetry',
                'Telemetri Kekuatan & Torsi Pengencangan',
                '強度区分・締付トルク演算'
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-[22px] bg-[var(--md-surface-container)] p-3 border border-[var(--md-outline-variant)]/60">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Nominal Tensile (Rm)', 'Tarik Nominal (Rm)', '公称引張強さ')}
                </div>
                <div className="text-base font-mono font-bold text-[var(--md-primary)] mt-0.5">
                  {activeClass.nominalTensileMpa} MPa
                </div>
              </div>
              <div className="rounded-[22px] bg-[var(--md-surface-container)] p-3 border border-[var(--md-outline-variant)]/60">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Yield Strength (Re)', 'Kekuatan Luluh (Re)', '降伏耐力 (Re)')}
                </div>
                <div className="text-base font-mono font-bold text-[var(--md-on-surface)] mt-0.5">
                  {activeClass.yieldStrengthMpa} MPa
                </div>
              </div>
              <div className="rounded-[22px] bg-[var(--md-surface-container)] p-3 border border-[var(--md-outline-variant)]/60">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Dry Torque (K=0.20)', 'Torsi Kering (K=0.20)', 'ドライ締付トルク')}
                </div>
                <div className="text-base font-mono font-bold text-[var(--md-primary)] mt-0.5">
                  {jointCalc.recommendedTorqueDryNm.toFixed(1)} N·m
                </div>
              </div>
              <div className="rounded-[22px] bg-[var(--md-surface-container)] p-3 border border-[var(--md-outline-variant)]/60">
                <div className="text-[var(--md-on-surface-variant)]">
                  {pick('Target Clamp (75% Fp)', 'Gaya Jepit (75% Fp)', '目標締付軸力')}
                </div>
                <div className="text-base font-mono font-bold text-[var(--md-on-surface)] mt-0.5">
                  {jointCalc.targetPreloadKn.toFixed(1)} kN
                </div>
              </div>
            </div>

            <div className="rounded-[22px] bg-[var(--md-primary-container)]/50 border border-[var(--md-primary)]/35 p-3.5 text-xs space-y-1">
              <div className="font-bold text-[var(--md-primary)]">
                {activeClass.material} — {activeClass.heatTreatment}
              </div>
              <p className="text-[var(--md-on-surface)] leading-relaxed">
                {activeClass.decoderFormula}
              </p>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                <strong className="text-[var(--md-on-surface)]">
                  {pick('Typical Use:', 'Aplikasi Umum:', '主な用途:')}
                </strong>{' '}
                {activeClass.commonApplications}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
