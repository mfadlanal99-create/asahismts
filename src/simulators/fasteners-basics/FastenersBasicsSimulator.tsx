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

          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {pick(
                'Selected Fastener Stack & Application Guide',
                'Ringkasan Susunan Pengencang & Aplikasi',
                '選択締結要素・適用ガイド'
              )}
            </h3>

            <div className="grid gap-3 md:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-1">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeHead.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {activeHead.standard}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeHead.features}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-200">
                    {pick('Drive:', 'Alat:', '工具:')}
                  </strong>{' '}
                  {activeHead.driveType}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-1">
                <div className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {activeNut.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {activeNut.standard}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeNut.lockingMechanism}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-200">
                    {pick('Reuse:', 'Pakai Ulang:', '再使用:')}
                  </strong>{' '}
                  {activeNut.reusability}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-1">
                <div className="font-semibold text-amber-600 dark:text-amber-400">
                  {activeWasher.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {activeWasher.standard}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {activeWasher.workingPrinciple}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-200">
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
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-emerald-500" />
              {pick(
                'Bolt, Nut, Washer & Grade Controls',
                'Kontrol Baut, Mur, Ring & Kelas Baja',
                'ボルト・ナット・座金・強度区分設定'
              )}
            </h2>

            {/* Bolt Head Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {pick('Bolt Head Style', 'Bentuk Kepala Baut', 'ボルト頭部形状')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {BOLT_HEADS.map((head) => (
                  <button
                    key={head.id}
                    type="button"
                    onClick={() => setBoltHead(head.id)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition ${
                      boltHead === head.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {head.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Nut Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {pick('Nut Locking Type', 'Tipe Mur Pengunci', 'ナット形式')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {NUT_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNut(item.id)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-medium border transition ${
                      nut === item.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Washer Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {pick('Washer Type', 'Jenis Ring', '座金（ワッシャー）')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {WASHER_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWasher(item.id)}
                    className={`px-2.5 py-2 rounded-xl text-center text-xs font-medium border transition ${
                      washer === item.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {item.name.split(' ')[0]} {item.standard.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Diameter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {pick('Metric Size & Wrench (AF)', 'Ukuran Metrik & Kunci Pas', '呼び径・工具サイズ')}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(Object.keys(METRIC_BOLT_SPECS) as MetricBoltSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`py-2 rounded-xl text-center text-xs font-semibold border transition ${
                      size === sz
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>{sz}</div>
                    <div className="text-[10px] font-normal opacity-80">
                      {METRIC_BOLT_SPECS[sz].hexSpannerMm}mm
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {pick('Property Class / Grade', 'Kelas Kekuatan (Grade)', '強度区分・材質グレード')}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(PROPERTY_CLASSES) as PropertyClass[]).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setPropertyClass(grade)}
                    className={`py-2 px-2 rounded-xl text-center text-xs font-semibold border transition ${
                      propertyClass === grade
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TELEMETRY & DECODER SUMMARY CARD */}
          <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {pick(
                'Property Class & Torque Telemetry',
                'Telemetri Kekuatan & Torsi Pengencangan',
                '強度区分・締付トルク演算'
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Nominal Tensile (Rm)', 'Tarik Nominal (Rm)', '公称引張強さ')}
                </div>
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {activeClass.nominalTensileMpa} MPa
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Yield Strength (Re)', 'Kekuatan Luluh (Re)', '降伏耐力 (Re)')}
                </div>
                <div className="text-base font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                  {activeClass.yieldStrengthMpa} MPa
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Dry Torque (K=0.20)', 'Torsi Kering (K=0.20)', 'ドライ締付トルク')}
                </div>
                <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {jointCalc.recommendedTorqueDryNm.toFixed(1)} N·m
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-slate-500 dark:text-slate-400">
                  {pick('Target Clamp (75% Fp)', 'Gaya Jepit (75% Fp)', '目標締付軸力')}
                </div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {jointCalc.targetPreloadKn.toFixed(1)} kN
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 text-xs space-y-1">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                {activeClass.material} — {activeClass.heatTreatment}
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeClass.decoderFormula}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <strong>{pick('Typical Use:', 'Aplikasi Umum:', '主な用途:')}</strong>{' '}
                {activeClass.commonApplications}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
