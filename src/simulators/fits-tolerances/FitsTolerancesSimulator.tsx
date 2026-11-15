import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge,
  Layers,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HOLE_CLASSES,
  NOMINAL_DIAMETERS_MM,
  SHAFT_CLASSES,
  calculateIsoFitAndShrink,
  type HoleClassId,
  type NominalDiameterMm,
  type ShaftClassId,
} from './fitsTolerancesData';
import { FitsToleranceSvg } from './FitsToleranceSvg';

export function FitsTolerancesSimulator() {
  const { pick } = useLanguage();

  const [nominalMm, setNominalMm] = useState<NominalDiameterMm>(50);
  const [holeClass, setHoleClass] = useState<HoleClassId>('H7');
  const [shaftClass, setShaftClass] = useState<ShaftClassId>('p6');
  const [engagementLengthMm, setEngagementLengthMm] = useState<number>(60);
  const [processTempC, setProcessTempC] = useState<number>(20);

  // Interactive Go/No-Go Gauge Inspection test offsets (in µm from nominal)
  const [testHoleDevUm, setTestHoleDevUm] = useState<number>(12);
  const [testShaftDevUm, setTestShaftDevUm] = useState<number>(34);

  const calc = useMemo(
    () =>
      calculateIsoFitAndShrink(
        nominalMm,
        holeClass,
        shaftClass,
        engagementLengthMm,
        processTempC
      ),
    [nominalMm, holeClass, shaftClass, engagementLengthMm, processTempC]
  );

  const activeHoleSpec = useMemo(
    () => HOLE_CLASSES.find((h) => h.id === holeClass) ?? HOLE_CLASSES[1],
    [holeClass]
  );

  const activeShaftSpec = useMemo(
    () => SHAFT_CLASSES.find((s) => s.id === shaftClass) ?? SHAFT_CLASSES[5],
    [shaftClass]
  );

  // Update test part defaults to midpoint of active tolerance zones when hole/shaft changes
  const handleSelectHole = (nextHole: HoleClassId) => {
    setHoleClass(nextHole);
    const nextCalc = calculateIsoFitAndShrink(
      nominalMm,
      nextHole,
      shaftClass,
      engagementLengthMm,
      processTempC
    );
    setTestHoleDevUm(Math.round((nextCalc.ES + nextCalc.EI) / 2));
  };

  const handleSelectShaft = (nextShaft: ShaftClassId) => {
    setShaftClass(nextShaft);
    const nextCalc = calculateIsoFitAndShrink(
      nominalMm,
      holeClass,
      nextShaft,
      engagementLengthMm,
      processTempC
    );
    setTestShaftDevUm(Math.round((nextCalc.es + nextCalc.ei) / 2));
  };

  const handleSelectDiameter = (nextDia: NominalDiameterMm) => {
    setNominalMm(nextDia);
    const nextCalc = calculateIsoFitAndShrink(
      nextDia,
      holeClass,
      shaftClass,
      engagementLengthMm,
      processTempC
    );
    setTestHoleDevUm(Math.round((nextCalc.ES + nextCalc.EI) / 2));
    setTestShaftDevUm(Math.round((nextCalc.es + nextCalc.ei) / 2));
  };

  // Go/No-Go Gauge verification for the inspected sample part
  const holeGoEnters = testHoleDevUm >= calc.EI;
  const holeNoGoEnters = testHoleDevUm > calc.ES;
  const holeGaugePass = holeGoEnters && !holeNoGoEnters;

  const shaftGoPasses = testShaftDevUm <= calc.es;
  const shaftNoGoPasses = testShaftDevUm < calc.ei;
  const shaftGaugePass = shaftGoPasses && !shaftNoGoPasses;

  const actualMeasuredClearanceUm = testHoleDevUm - testShaftDevUm;

  const fitStatusBanner = useMemo(() => {
    if (calc.fitCategory === 'clearance') {
      return {
        title: pick(
          `ISO 286 CLEARANCE FIT — Ø${nominalMm} ${holeClass}/${shaftClass} (+${calc.minClearanceUm} to +${calc.maxClearanceUm} µm)`,
          `SUAIAN LONGGAR ISO 286 — Ø${nominalMm} ${holeClass}/${shaftClass} (+${calc.minClearanceUm} s/d +${calc.maxClearanceUm} µm)`,
          `ISO 286 すきまばめ — Ø${nominalMm} ${holeClass}/${shaftClass} (+${calc.minClearanceUm} 〜 +${calc.maxClearanceUm} µm)`
        ),
        desc: pick(
          activeShaftSpec.applicationEn,
          activeShaftSpec.applicationId,
          activeShaftSpec.applicationJa
        ),
        classes:
          'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200',
        icon: CheckCircle2,
        iconColor: 'text-sky-600 dark:text-sky-400',
      };
    }
    if (calc.fitCategory === 'transition') {
      return {
        title: pick(
          `ISO 286 TRANSITION FIT — Ø${nominalMm} ${holeClass}/${shaftClass} (+${calc.maxClearanceUm} µm Clearance ↔ +${calc.maxInterferenceUm} µm Interference)`,
          `SUAIAN TRANSISI ISO 286 — Ø${nominalMm} ${holeClass}/${shaftClass} (Longgar +${calc.maxClearanceUm} µm ↔ Sesak +${calc.maxInterferenceUm} µm)`,
          `ISO 286 中間ばめ — Ø${nominalMm} ${holeClass}/${shaftClass} (最大すきま +${calc.maxClearanceUm} µm ↔ 最大締め代 +${calc.maxInterferenceUm} µm)`
        ),
        desc: pick(
          activeShaftSpec.applicationEn,
          activeShaftSpec.applicationId,
          activeShaftSpec.applicationJa
        ),
        classes:
          'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
        icon: Gauge,
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    }
    return {
      title: pick(
        `ISO 286 INTERFERENCE FIT — Ø${nominalMm} ${holeClass}/${shaftClass} (+${calc.minInterferenceUm} to +${calc.maxInterferenceUm} µm Interference)`,
        `SUAIAN SESAK ISO 286 — Ø${nominalMm} ${holeClass}/${shaftClass} (Kesesakan +${calc.minInterferenceUm} s/d +${calc.maxInterferenceUm} µm)`,
        `ISO 286 しまりばめ — Ø${nominalMm} ${holeClass}/${shaftClass} (+${calc.minInterferenceUm} 〜 +${calc.maxInterferenceUm} µm 締め代)`
      ),
      desc: pick(
        activeShaftSpec.applicationEn,
        activeShaftSpec.applicationId,
        activeShaftSpec.applicationJa
      ),
      classes:
        'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
      icon: Flame,
      iconColor: 'text-rose-600 dark:text-rose-400',
    };
  }, [calc, nominalMm, holeClass, shaftClass, activeShaftSpec, pick]);

  const BannerIcon = fitStatusBanner.icon;

  return (
    <div className="space-y-5">
      {/* Top Grid: Interactive Controls + 2D SVG Diagram & Readouts */}
      <div className="grid gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Controls Panel */}
        <div className="glass-panel space-y-5 rounded-2xl p-5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {pick(
                  'ISO 286 Fit & Thermal Shrink Controls',
                  'Kontrol Suaian ISO 286 & Shrink Termal',
                  'ISO 286 はめあい・焼きばめ制御'
                )}
              </h2>
            </div>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
              Ø{nominalMm} {holeClass}/{shaftClass}
            </span>
          </div>

          {/* 1. Nominal Diameter */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {pick(
                  'Nominal Diameter d (mm)',
                  'Diameter Nominal d (mm)',
                  '基準寸法・呼び径 d (mm)'
                )}
              </label>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                Ø{nominalMm}.000 mm
              </span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {NOMINAL_DIAMETERS_MM.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => handleSelectDiameter(dia)}
                  className={`rounded-lg border py-1.5 font-mono text-xs font-semibold transition ${
                    nominalMm === dia
                      ? 'border-cyan-500 bg-cyan-600 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {dia} mm
                </button>
              ))}
            </div>
          </div>

          {/* 2. Hole Class (H6, H7, H8) */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {pick(
                  'Hole Basis Class (ISO 286 Bore)',
                  'Kelas Basis Lubang (Lubang ISO 286)',
                  '穴公差クラス (穴基準 H6/H7/H8)'
                )}
              </label>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">
                ES +{calc.ES} / EI {calc.EI} µm
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {HOLE_CLASSES.map((hc) => (
                <button
                  key={hc.id}
                  type="button"
                  onClick={() => handleSelectHole(hc.id)}
                  className={`rounded-xl border p-2.5 text-left transition ${
                    holeClass === hc.id
                      ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/40'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {hc.id}
                    </span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {hc.itGrade}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400">
                    {pick(hc.labelEn, hc.labelId, hc.labelJa)}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {pick(
                activeHoleSpec.applicationEn,
                activeHoleSpec.applicationId,
                activeHoleSpec.applicationJa
              )}
            </p>
          </div>

          {/* 3. Shaft Class (f7, g6, h6, k6, m6, p6, s6) */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {pick(
                  'Shaft Tolerance Class (f7 – s6)',
                  'Kelas Toleransi Poros (f7 – s6)',
                  '軸公差クラス (f7 〜 s6)'
                )}
              </label>
              <span className="font-mono text-slate-600 dark:text-slate-300">
                es {calc.es >= 0 ? `+${calc.es}` : calc.es} / ei{' '}
                {calc.ei >= 0 ? `+${calc.ei}` : calc.ei} µm
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {SHAFT_CLASSES.map((sc) => {
                const isSelected = shaftClass === sc.id;
                const badgeTone =
                  sc.fitFamily === 'clearance'
                    ? 'text-sky-600 dark:text-sky-400'
                    : sc.fitFamily === 'transition'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400';
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectShaft(sc.id)}
                    className={`rounded-xl border p-2 text-left transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/40'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {sc.id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${badgeTone}`}>
                        {sc.fitFamily === 'clearance'
                          ? pick('Clear', 'Longgar', 'すきま')
                          : sc.fitFamily === 'transition'
                            ? pick('Trans', 'Transisi', '中間')
                            : pick('Press', 'Sesak', 'しまり')}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                      {pick(sc.nameEn, sc.nameId, sc.nameJa).replace(`${sc.id} — `, '')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Engagement Length L (mm) */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="engagement-length-slider"
                className="font-semibold text-slate-700 dark:text-slate-300"
              >
                {pick(
                  'Hub Engagement Length L (mm)',
                  'Panjang Kontak Hub L (mm)',
                  'ハブ嵌合長さ L (mm)'
                )}
              </label>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {engagementLengthMm} mm
              </span>
            </div>
            <input
              id="engagement-length-slider"
              type="range"
              min={20}
              max={120}
              step={5}
              value={engagementLengthMm}
              onChange={(e) => setEngagementLengthMm(Number(e.target.value))}
              className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
              <span>20 mm</span>
              <span>50 mm</span>
              <span>80 mm</span>
              <span>120 mm</span>
            </div>
          </div>

          {/* 5. Induction Heater / Cryo Shaft Temperature (-80 °C to +160 °C) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="thermal-temp-slider"
                className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200"
              >
                {processTempC > 21 ? (
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                ) : processTempC < 19 ? (
                  <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                ) : (
                  <Thermometer className="h-3.5 w-3.5 text-slate-500" />
                )}
                {pick(
                  'Induction Heater / Cryo Shaft Temp',
                  'Suhu Pemanas Induksi / Kriogenik Poros',
                  '誘導加熱ハブ / 冷却軸 温度'
                )}
              </label>
              <span
                className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                  processTempC > 21
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                    : processTempC < 19
                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {processTempC > 0 ? `+${processTempC}` : processTempC} °C (ΔT ={' '}
                {calc.deltaTempC} °C)
              </span>
            </div>

            <input
              id="thermal-temp-slider"
              type="range"
              min={-80}
              max={160}
              step={2}
              value={processTempC}
              onChange={(e) => setProcessTempC(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
              <span>-80°C (Cryo Shaft)</span>
              <span>20°C (Ambient)</span>
              <span>+110°C</span>
              <span>+160°C (Hub Heat)</span>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setProcessTempC(-78)}
                className="rounded-lg border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
              >
                {pick('-78°C Dry Ice', '-78°C Es Kering', '-78°C ドライアイス')}
              </button>
              <button
                type="button"
                onClick={() => setProcessTempC(20)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {pick('20°C Ambient', '20°C Ruang', '20°C 室温')}
              </button>
              <button
                type="button"
                onClick={() => setProcessTempC(110)}
                className="rounded-lg border border-orange-300 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-800 transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
              >
                {pick('+110°C Bearing Heater', '+110°C Pemanas', '+110°C 軸受ヒーター')}
              </button>
              {calc.effectiveInterferenceUm > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setProcessTempC(
                      Math.min(160, Math.max(20, calc.requiredTempForDropInC))
                    )
                  }
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  {pick(
                    `Auto Drop-In (${Math.min(160, calc.requiredTempForDropInC)}°C)`,
                    `Otomatis Masuk (${Math.min(160, calc.requiredTempForDropInC)}°C)`,
                    `推奨加熱 (${Math.min(160, calc.requiredTempForDropInC)}°C)`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Banner + 2D SVG + Engineering Readout Cards */}
        <div className="space-y-4 lg:col-span-7">
          {/* Fit Classification Banner */}
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${fitStatusBanner.classes}`}
          >
            <BannerIcon
              className={`mt-0.5 h-5 w-5 shrink-0 ${fitStatusBanner.iconColor}`}
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold tracking-wide uppercase">
                {fitStatusBanner.title}
              </div>
              <p className="mt-0.5 text-xs opacity-90">{fitStatusBanner.desc}</p>
            </div>
          </div>

          {/* 2D SVG ISO 286 Tolerance Zone Diagram + Mating Cross-Section */}
          <FitsToleranceSvg
            calc={calc}
            holeGoEnters={holeGoEnters}
            holeNoGoEnters={holeNoGoEnters}
            shaftGoPasses={shaftGoPasses}
            shaftNoGoPasses={shaftNoGoPasses}
          />

          {/* 4 Live Engineering Readout Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Card 1: Resulting Clearance / Interference */}
            <div className="glass-panel rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {calc.fitCategory === 'interference'
                  ? pick(
                      'Interference (δ_min .. δ_max)',
                      'Kesesakan (δ_min .. δ_max)',
                      '締め代 (δ_min .. δ_max)'
                    )
                  : pick(
                      'Clearance (C_min .. C_max)',
                      'Kelonggaran (C_min .. C_max)',
                      'すきま (C_min .. C_max)'
                    )}
              </div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white">
                {calc.fitCategory === 'interference'
                  ? `+${calc.minInterferenceUm} .. +${calc.maxInterferenceUm} µm`
                  : `${calc.minClearanceUm >= 0 ? `+${calc.minClearanceUm}` : calc.minClearanceUm} .. +${calc.maxClearanceUm} µm`}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {pick(
                  `Fit band T_fit = ${calc.holeToleranceUm + calc.shaftToleranceUm} µm`,
                  `Rentang T_fit = ${calc.holeToleranceUm + calc.shaftToleranceUm} µm`,
                  `はめあい公差 = ${calc.holeToleranceUm + calc.shaftToleranceUm} µm`
                )}
              </div>
            </div>

            {/* Card 2: Lamé Interface Contact Pressure */}
            <div className="glass-panel rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick(
                  'Contact Pressure (MPa)',
                  'Tekanan Kontak (MPa)',
                  '接触面圧 (MPa)'
                )}
              </div>
              <div className="mt-1 font-mono text-base font-bold text-slate-900 dark:text-white">
                {calc.contactPressureMaxMpa.toFixed(1)} MPa
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {pick(
                  `Mean: ${calc.contactPressureMeanMpa.toFixed(1)} MPa (Do/d = 2.0)`,
                  `Rata-rata: ${calc.contactPressureMeanMpa.toFixed(1)} MPa`,
                  `平均: ${calc.contactPressureMeanMpa.toFixed(1)} MPa (Do/d=2)`
                )}
              </div>
            </div>

            {/* Card 3: Hydraulic Press Force */}
            <div className="glass-panel rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick(
                  'Hydraulic Press Force',
                  'Gaya Pres Hidrolik',
                  '油圧プレス圧入力'
                )}
              </div>
              <div className="mt-1 font-mono text-base font-bold text-rose-600 dark:text-rose-400">
                {calc.pressForceMaxKn.toFixed(1)} kN{' '}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  ({calc.pressForceMaxTonnes.toFixed(2)} t)
                </span>
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {pick(
                  `µ = 0.15 | Torque: ${calc.transmissibleTorqueNm.toFixed(0)} N·m`,
                  `µ = 0.15 | Torsi: ${calc.transmissibleTorqueNm.toFixed(0)} N·m`,
                  `µ = 0.15 | 許容トルク: ${calc.transmissibleTorqueNm.toFixed(0)} N·m`
                )}
              </div>
            </div>

            {/* Card 4: Thermal Shrink-Fit Assembly Clearance */}
            <div className="glass-panel rounded-xl p-3.5 shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {pick(
                  'Thermal Assembly Clearance',
                  'Celah Rakit Termal',
                  '熱膨張時の最小組立隙間'
                )}
              </div>
              <div
                className={`mt-1 font-mono text-base font-bold ${
                  calc.canDropInWithoutPress
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {calc.netAssemblyClearanceMinUm >= 0
                  ? `+${calc.netAssemblyClearanceMinUm.toFixed(1)} µm`
                  : `${calc.netAssemblyClearanceMinUm.toFixed(1)} µm`}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {calc.canDropInWithoutPress
                  ? pick(
                      `Drop-in ready (≥ +${calc.safeAssemblyMarginUm} µm safe)`,
                      `Siap masuk bebas (≥ +${calc.safeAssemblyMarginUm} µm)`,
                      `落とし込み可 (安全目標 +${calc.safeAssemblyMarginUm} µm)`
                    )
                  : pick(
                      `Need +${calc.safeAssemblyMarginUm} µm (${calc.requiredTempForDropInC} °C)`,
                      `Butuh +${calc.safeAssemblyMarginUm} µm (${calc.requiredTempForDropInC} °C)`,
                      `目標 +${calc.safeAssemblyMarginUm} µm (${calc.requiredTempForDropInC} °C 必要)`
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Go / No-Go Plug & Snap Gauge Quality Control Inspector */}
      <div className="glass-panel rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {pick(
                'Go / No-Go Plug & Snap Gauge QC Bench (Taylor Principle)',
                'Meja QC Kaliber Batas Plug & Snap Go / No-Go (Prinsip Taylor)',
                '通り/止まり (Go / No-Go) プラグ・スナップゲージ検査ベンチ'
              )}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {pick('Actual Mated Clearance:', 'Celah Pasangan Aktual:', '実測嵌合すきま:')}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 font-mono font-bold ${
                actualMeasuredClearanceUm >= 0
                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              {actualMeasuredClearanceUm >= 0
                ? `+${actualMeasuredClearanceUm} µm (${pick('Clearance', 'Longgar', 'すきま')})`
                : `${actualMeasuredClearanceUm} µm (${pick('Interference', 'Sesak', '締め代')})`}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {/* Left: Cylindrical Plug Gauge for Hole */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {pick(
                    `1. Cylindrical Plug Gauge — Bore Ø${nominalMm} ${holeClass}`,
                    `1. Kaliber Plug Silindris — Lubang Ø${nominalMm} ${holeClass}`,
                    `1. 円筒プラグゲージ — 穴 Ø${nominalMm} ${holeClass}`
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Go = {calc.holeMinMm.toFixed(3)} mm (EI {calc.EI} µm) · No-Go ={' '}
                  {calc.holeMaxMm.toFixed(3)} mm (ES +{calc.ES} µm)
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  holeGaugePass
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                }`}
              >
                {holeGaugePass ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {holeGaugePass
                  ? pick('BORE PASS', 'LUBANG LULUS', '穴 合格')
                  : !holeGoEnters
                    ? pick('UNDERSIZE (REWORK)', 'KEKECILAN (REWORK)', '穴径不足 (再加工)')
                    : pick('OVERSIZE (SCRAP)', 'KEBESARAN (AFKIR)', '穴拡大過多 (不良)')}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <label
                  htmlFor="test-hole-slider"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  {pick(
                    'Machined Bore Deviation:',
                    'Penyimpangan Lubang Aktual:',
                    '加工穴の実測偏差:'
                  )}
                </label>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  Ø{(nominalMm + testHoleDevUm / 1000).toFixed(3)} mm (
                  {testHoleDevUm >= 0 ? `+${testHoleDevUm}` : testHoleDevUm} µm)
                </span>
              </div>
              <input
                id="test-hole-slider"
                type="range"
                min={-15}
                max={calc.ES + 20}
                step={1}
                value={testHoleDevUm}
                onChange={(e) => setTestHoleDevUm(Number(e.target.value))}
                className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600 dark:bg-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`rounded-lg border p-2 ${
                  holeGoEnters
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <div className="font-mono text-[10px] font-bold uppercase">
                  {pick('GO PLUG END', 'UJUNG GO PLUG', '通り側 (GO)')} (Ø
                  {calc.holeMinMm.toFixed(3)})
                </div>
                <div className="mt-0.5 font-semibold">
                  {holeGoEnters
                    ? pick('✓ Enters freely (Pass)', '✓ Masuk bebas (Lulus)', '✓ 通過 (合格)')
                    : pick('✗ Blocked! Bore < D_min', '✗ Tertahan! < D_min', '✗ 不通過 (小径)')}
                </div>
              </div>
              <div
                className={`rounded-lg border p-2 ${
                  !holeNoGoEnters
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <div className="font-mono text-[10px] font-bold uppercase">
                  {pick('NO-GO PLUG END', 'UJUNG NO-GO PLUG', '止まり側 (NO-GO)')} (Ø
                  {calc.holeMaxMm.toFixed(3)})
                </div>
                <div className="mt-0.5 font-semibold">
                  {!holeNoGoEnters
                    ? pick('✓ Does not enter (Pass)', '✓ Tidak masuk (Lulus)', '✓ 止まる (合格)')
                    : pick('✗ Enters! Bore > D_max', '✗ Masuk! > D_max', '✗ 通過 (拡大不良)')}
                </div>
              </div>
            </div>
          </div>

          {/* Right: C-Frame Snap Gauge for Shaft */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {pick(
                    `2. C-Frame Snap Gauge — Shaft Ø${nominalMm} ${shaftClass}`,
                    `2. Kaliber Snap C-Frame — Poros Ø${nominalMm} ${shaftClass}`,
                    `2. スナップゲージ — 軸 Ø${nominalMm} ${shaftClass}`
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Go = {calc.shaftMaxMm.toFixed(3)} mm (es{' '}
                  {calc.es >= 0 ? `+${calc.es}` : calc.es} µm) · No-Go ={' '}
                  {calc.shaftMinMm.toFixed(3)} mm (ei{' '}
                  {calc.ei >= 0 ? `+${calc.ei}` : calc.ei} µm)
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  shaftGaugePass
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                }`}
              >
                {shaftGaugePass ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}
                {shaftGaugePass
                  ? pick('SHAFT PASS', 'POROS LULUS', '軸 合格')
                  : !shaftGoPasses
                    ? pick('OVERSIZE (REWORK)', 'KEBESARAN (REWORK)', '軸太すぎ (再研削)')
                    : pick('UNDERSIZE (SCRAP)', 'KEKECILAN (AFKIR)', '軸細すぎ (不良)')}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs">
                <label
                  htmlFor="test-shaft-slider"
                  className="font-medium text-slate-700 dark:text-slate-300"
                >
                  {pick(
                    'Machined Shaft Deviation:',
                    'Penyimpangan Poros Aktual:',
                    '加工軸の実測偏差:'
                  )}
                </label>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  Ø{(nominalMm + testShaftDevUm / 1000).toFixed(3)} mm (
                  {testShaftDevUm >= 0 ? `+${testShaftDevUm}` : testShaftDevUm} µm)
                </span>
              </div>
              <input
                id="test-shaft-slider"
                type="range"
                min={calc.ei - 15}
                max={calc.es + 15}
                step={1}
                value={testShaftDevUm}
                onChange={(e) => setTestShaftDevUm(Number(e.target.value))}
                className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600 dark:bg-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`rounded-lg border p-2 ${
                  shaftGoPasses
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <div className="font-mono text-[10px] font-bold uppercase">
                  {pick('GO SNAP JAW', 'RAHANG GO SNAP', '通り側 (GO)')} (Ø
                  {calc.shaftMaxMm.toFixed(3)})
                </div>
                <div className="mt-0.5 font-semibold">
                  {shaftGoPasses
                    ? pick('✓ Passes over shaft', '✓ Melewati poros', '✓ 通過 (合格)')
                    : pick('✗ Blocked! Shaft > d_max', '✗ Tertahan! > d_max', '✗ 不通過 (太すぎ)')}
                </div>
              </div>
              <div
                className={`rounded-lg border p-2 ${
                  !shaftNoGoPasses
                    ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-300 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <div className="font-mono text-[10px] font-bold uppercase">
                  {pick('NO-GO SNAP JAW', 'RAHANG NO-GO SNAP', '止まり側 (NO-GO)')} (Ø
                  {calc.shaftMinMm.toFixed(3)})
                </div>
                <div className="mt-0.5 font-semibold">
                  {!shaftNoGoPasses
                    ? pick('✓ Stops on shaft (Pass)', '✓ Berhenti (Lulus)', '✓ 止まる (合格)')
                    : pick('✗ Slips past! < d_min', '✗ Lolos! < d_min', '✗ 通過 (細すぎ不良)')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
