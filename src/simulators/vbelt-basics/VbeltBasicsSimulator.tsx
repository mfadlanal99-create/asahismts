/* oxlint-disable react/only-export-components */
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cog,
  Info,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mmToM, rpmToRadS } from '../../physics';
import { vbeltBasicsMeta } from './vbeltBasicsMeta';
import './vbeltBasicsI18n';
import {
  BELT_SPECS,
  computeWedgingPhysics,
  decodeBeltCode,
  type BeltProfileCode,
} from './vbeltBasicsData';
import { VbeltBasicsSvg } from './VbeltBasicsSvg';

export { vbeltBasicsMeta };

export function VbeltBasicsSimulator() {
  const { pick } = useLanguage();

  const [beltProfile, setBeltProfile] = useState<BeltProfileCode>('B');
  const [pulleyCondition, setPulleyCondition] = useState<'proper' | 'worn_sheave' | 'bottomed_out'>('proper');
  const [beltTensionN, setBeltTensionN] = useState<number>(600);
  const [motorRpm, setMotorRpm] = useState<number>(1450);

  // Belt Code Decoder input
  const [decoderInput, setDecoderInput] = useState<string>('SPA-1250');

  const currentBeltSpec = BELT_SPECS[beltProfile];

  const wedgingPhysics = useMemo(
    () =>
      computeWedgingPhysics(
        beltTensionN,
        currentBeltSpec.wedgeAngleDeg || 180,
        0.3,
        pulleyCondition === 'bottomed_out'
      ),
    [beltTensionN, currentBeltSpec.wedgeAngleDeg, pulleyCondition]
  );

  const decodedBelt = useMemo(() => decodeBeltCode(decoderInput), [decoderInput]);

  // Belt speed calculation at minimum recommended sheave diameter using canonical physics helpers
  const beltLinearSpeedMs = useMemo(() => {
    const pitchRadiusM = mmToM(currentBeltSpec.minSheaveDiameterMm) / 2;
    const omegaRadS = rpmToRadS(motorRpm);
    return pitchRadiusM * omegaRadS;
  }, [currentBeltSpec.minSheaveDiameterMm, motorRpm]);

  const handleApplyDecodedBelt = () => {
    if (decodedBelt.recognized) {
      setBeltProfile(decodedBelt.profileCode);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Compact Header Strip */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Cog className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {pick(
                'V-Belt & Drive Belt Cross-Section Lab',
                'Lab Penampang V-Belt & Sabuk Penggerak',
                'Vベルト・伝動ベルト 断面着座ラボ'
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pick(
                'Inspect proportional belt profiles, sidewall wedging physics, bottoming-out failure, and industrial belt codes.',
                'Inspeksi profil sabuk proporsional, efek baji dinding alur, kegagalan bottoming-out, dan dekoder kode sabuk.',
                '実寸比のベルト断面・側壁くさび力学・底突き故障診断・規格コード解読器を対話的に学習します。'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 font-mono font-bold text-indigo-800 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            {currentBeltSpec.code} ({currentBeltSpec.topWidthMm}×{currentBeltSpec.heightMm} mm)
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            V = {beltLinearSpeedMs.toFixed(1)} m/s
          </span>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN (lg:col-span-5): Belt Controls & Code Decoder */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* 1. Belt Profile Selection */}
          <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {pick('Select Belt Profile', 'Pilih Profil Sabuk', 'ベルト断面形式の選択')}
              </span>
              <span className="rounded-sm bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {currentBeltSpec.wedgeAngleDeg > 0
                  ? `Groove: ${currentBeltSpec.wedgeAngleDeg}°`
                  : pick('Positive / Flat', 'Positif / Datar', '歯付 / 平ベルト')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {(Object.keys(BELT_SPECS) as BeltProfileCode[]).map((code) => {
                const b = BELT_SPECS[code];
                const active = beltProfile === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setBeltProfile(code);
                      if (b.standardCodes[0]) setDecoderInput(b.standardCodes[0]);
                    }}
                    className={`flex flex-col items-center rounded-xl border p-1.5 text-center transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="font-mono text-xs font-black">{code.replace('_', ' ')}</span>
                    <span className="text-[9px] opacity-70">
                      {b.topWidthMm}×{b.heightMm}mm
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pulley Groove Seating Condition Selector */}
            <div className="mt-1 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {pick('Groove Seating Health Condition:', 'Kondisi Kedudukan Alur Puli:', 'プーリ溝着座状態:')}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPulleyCondition('proper')}
                  className={`flex flex-col items-center rounded-lg border p-1.5 text-center transition-all ${
                    pulleyCondition === 'proper'
                      ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="mt-0.5 text-[10px]">{pick('Proper Seating', 'Duduk Baik', '適正着座')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPulleyCondition('worn_sheave')}
                  className={`flex flex-col items-center rounded-lg border p-1.5 text-center transition-all ${
                    pulleyCondition === 'worn_sheave'
                      ? 'border-amber-500 bg-amber-50 font-bold text-amber-950 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="mt-0.5 text-[10px]">{pick('Worn Flanks', 'Alur Aus', '摩耗溝')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPulleyCondition('bottomed_out')}
                  className={`flex flex-col items-center rounded-lg border p-1.5 text-center transition-all ${
                    pulleyCondition === 'bottomed_out'
                      ? 'border-red-500 bg-red-50 font-bold text-red-950 dark:border-red-500 dark:bg-red-950/40 dark:text-red-200'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  <span className="mt-0.5 text-[10px]">{pick('Bottomed-Out', 'Bottoming Out', '底突き故障')}</span>
                </button>
              </div>
            </div>

            {/* Belt Tension & Motor Speed Sliders */}
            <div className="mt-1 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {pick('Tension (T)', 'Tegangan (T)', 'ベルト張力 (T)')}:
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {beltTensionN} N
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1500}
                  step={25}
                  value={beltTensionN}
                  onChange={(e) => setBeltTensionN(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {pick('Driver RPM', 'Putaran Motor', '駆動回転数')}:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {motorRpm} rpm
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={3600}
                  step={50}
                  value={motorRpm}
                  onChange={(e) => setMotorRpm(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* 2. Interactive Belt Code Decoder */}
          <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">
                {pick('Interactive Belt Code Decoder', 'Dekoder Kode Sabuk Industri', 'ベルト規格コード解読器')}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={decoderInput}
                onChange={(e) => setDecoderInput(e.target.value)}
                placeholder="e.g. B-65, SPA-1250, HTD 8M-800"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold text-slate-900 uppercase outline-hidden focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {decodedBelt.recognized && (
                <button
                  type="button"
                  onClick={handleApplyDecodedBelt}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  {pick('Load', 'Muat', '適用')}
                </button>
              )}
            </div>

            {/* Quick Sample Preset Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {['B-65', 'SPA-1250', 'HTD 8M-800', 'AX-42', '6PK-1840'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setDecoderInput(sample)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {sample}
                </button>
              ))}
            </div>

            <div
              className={`rounded-xl border p-3 ${
                decodedBelt.recognized
                  ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/30'
                  : 'border-amber-200 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {decodedBelt.family}
                </span>
                {decodedBelt.effectiveLengthMm > 0 && (
                  <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:bg-slate-900 dark:text-indigo-300">
                    {decodedBelt.effectiveLengthMm.toFixed(0)} mm
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {`${decodedBelt.widthMm} × ${decodedBelt.heightMm} mm · ${decodedBelt.lengthType}`}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {pick(
                  decodedBelt.engineeringRemarks,
                  decodedBelt.engineeringRemarksId,
                  decodedBelt.engineeringRemarksJa
                )}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-7): Pure-2D CAD SVG & Engineering Notes */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="glass-panel flex w-full items-center justify-center rounded-2xl p-2 shadow-xs">
            <VbeltBasicsSvg
              beltSpec={currentBeltSpec}
              pulleyCondition={pulleyCondition}
              beltTensionN={beltTensionN}
              wedgingPhysics={wedgingPhysics}
            />
          </div>

          {/* Live Belt Physics Readout Strip */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Flank Force Fn', 'Gaya Samping Fn', '側壁抗力 Fn')}
              </span>
              <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                {wedgingPhysics.normalForcePerSideN.toFixed(0)} N
              </span>
            </div>
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Apparent Grip μ′', 'Gesekan Semu μ′', '見かけ摩擦 μ′')}
              </span>
              <span
                className={`font-mono text-sm font-black ${
                  wedgingPhysics.bottomingOutOccurring
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {wedgingPhysics.apparentFrictionMuPrime.toFixed(2)}
              </span>
            </div>
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Min Pulley D', 'Puli Min D', '最小プーリ径')}
              </span>
              <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                Ø {currentBeltSpec.minSheaveDiameterMm} mm
              </span>
            </div>
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Power / Strand', 'Daya / Jalur', '伝動容量/本')}
              </span>
              <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                {currentBeltSpec.nominalPowerKwPerStrand} kW
              </span>
            </div>
          </div>

          {/* Shop Practice Rule of Thumb */}
          <div className="glass-panel rounded-2xl p-4 shadow-xs">
            <div className="flex items-start gap-2.5">
              {wedgingPhysics.bottomingOutOccurring ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {pick('Shop Practice Rule of Thumb:', 'Kaidah Praktis Bengkel:', '現場実務の設計ルール:')}
                </span>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {pick(
                    currentBeltSpec.constructionDescription,
                    currentBeltSpec.constructionDescriptionId,
                    currentBeltSpec.constructionDescriptionJa
                  )}{' '}
                  •{' '}
                  {pick(
                    `At ${motorRpm} RPM on min Ø${currentBeltSpec.minSheaveDiameterMm} mm sheave: linear belt speed = ${beltLinearSpeedMs.toFixed(1)} m/s (Max rated: ${currentBeltSpec.maxBeltSpeedMPerS} m/s).`,
                    `Pada ${motorRpm} RPM dengan puli min Ø${currentBeltSpec.minSheaveDiameterMm} mm: kecepatan sabuk = ${beltLinearSpeedMs.toFixed(1)} m/s (Batas maks: ${currentBeltSpec.maxBeltSpeedMPerS} m/s).`,
                    `最小プーリ Ø${currentBeltSpec.minSheaveDiameterMm} mm・${motorRpm} RPM時のベルト周速度 = ${beltLinearSpeedMs.toFixed(1)} m/s（許容上限: ${currentBeltSpec.maxBeltSpeedMPerS} m/s）。`
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
