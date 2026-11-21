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
    <div className="flex flex-col gap-5">
      {/* Compact Header Strip */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
            <Cog className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--md-on-surface)]">
              {pick(
                'V-Belt & Drive Belt Cross-Section Lab',
                'Lab Penampang V-Belt & Sabuk Penggerak',
                'Vベルト・伝動ベルト 断面着座ラボ'
              )}
            </h2>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                'Inspect proportional belt profiles, sidewall wedging physics, bottoming-out failure, and industrial belt codes.',
                'Inspeksi profil sabuk proporsional, efek baji dinding alur, kegagalan bottoming-out, dan dekoder kode sabuk.',
                '実寸比のベルト断面・側壁くさび力学・底突き故障診断・規格コード解読器を対話的に学習します。'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[var(--md-primary-container)] px-3.5 py-1 font-mono font-bold text-[var(--md-on-primary-container)]">
            {currentBeltSpec.code} ({currentBeltSpec.topWidthMm}×{currentBeltSpec.heightMm} mm)
          </span>
          <span className="rounded-full bg-[var(--md-secondary-container)] px-3 py-1 font-mono font-bold text-[var(--md-on-secondary-container)]">
            V = {beltLinearSpeedMs.toFixed(1)} m/s
          </span>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN (lg:col-span-5): Belt Controls & Code Decoder */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* 1. Belt Profile Selection */}
          <div className="glass-panel flex flex-col gap-3.5 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <span className="text-xs font-bold tracking-wide text-[var(--md-on-surface)] uppercase">
                {pick('Select Belt Profile', 'Pilih Profil Sabuk', 'ベルト断面形式の選択')}
              </span>
              <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]">
                {currentBeltSpec.wedgeAngleDeg > 0
                  ? `Groove: ${currentBeltSpec.wedgeAngleDeg}°`
                  : pick('Positive / Flat', 'Positif / Datar', '歯付 / 平ベルト')}
              </span>
            </div>

            <div data-tour="vbelt-profiles" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                    className={`flex flex-col items-center rounded-[20px] border p-2 text-center transition-all ${
                      active
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <span className="font-mono text-xs font-black">{code.replace('_', ' ')}</span>
                    <span className="text-[9px] opacity-75">
                      {b.topWidthMm}×{b.heightMm}mm
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pulley Groove Seating Condition Selector */}
            <div data-tour="vbelt-groove" className="mt-1 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[var(--md-on-surface)]">
                {pick('Groove Seating Health Condition:', 'Kondisi Kedudukan Alur Puli:', 'プーリ溝着座状態:')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPulleyCondition('proper')}
                  className={`flex flex-col items-center rounded-[20px] border p-2 text-center transition-all ${
                    pulleyCondition === 'proper'
                      ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="mt-0.5 text-[10px]">{pick('Proper Seating', 'Duduk Baik', '適正着座')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPulleyCondition('worn_sheave')}
                  className={`flex flex-col items-center rounded-[20px] border p-2 text-center transition-all ${
                    pulleyCondition === 'worn_sheave'
                      ? 'border-amber-500 bg-amber-50 font-bold text-amber-950 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="mt-0.5 text-[10px]">{pick('Worn Flanks', 'Alur Aus', '摩耗溝')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPulleyCondition('bottomed_out')}
                  className={`flex flex-col items-center rounded-[20px] border p-2 text-center transition-all ${
                    pulleyCondition === 'bottomed_out'
                      ? 'border-rose-500 bg-rose-50 font-bold text-rose-950 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                  <span className="mt-0.5 text-[10px]">{pick('Bottomed-Out', 'Bottoming Out', '底突き故障')}</span>
                </button>
              </div>
            </div>

            {/* Belt Tension & Motor Speed Sliders */}
            <div data-tour="vbelt-tension" className="mt-1 grid grid-cols-2 gap-3 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--md-on-surface)]">
                    {pick('Tension (T)', 'Tegangan (T)', 'ベルト張力 (T)')}:
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
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
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[var(--md-on-surface)]">
                    {pick('Driver RPM', 'Putaran Motor', '駆動回転数')}:
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
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
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* 2. Interactive Belt Code Decoder */}
          <div data-tour="vbelt-decoder" className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <Search className="h-4 w-4 text-[var(--md-primary)]" />
              <span className="text-xs font-bold tracking-wide text-[var(--md-on-surface)] uppercase">
                {pick('Interactive Belt Code Decoder', 'Dekoder Kode Sabuk Industri', 'ベルト規格コード解読器')}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={decoderInput}
                onChange={(e) => setDecoderInput(e.target.value)}
                placeholder="e.g. B-65, SPA-1250, HTD 8M-800"
                className="flex-1 rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 font-mono text-xs font-bold text-[var(--md-on-surface)] uppercase focus:border-[var(--md-primary)] focus:outline-none"
              />
              {decodedBelt.recognized && (
                <button
                  type="button"
                  onClick={handleApplyDecodedBelt}
                  className="m3-btn-filled px-4 py-2 text-xs font-bold"
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
                  className="glass-pill rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold"
                >
                  {sample}
                </button>
              ))}
            </div>

            <div
              className={`rounded-[20px] border p-3.5 ${
                decodedBelt.recognized
                  ? 'border-emerald-300/70 bg-emerald-50/75 dark:border-emerald-500/30 dark:bg-emerald-950/30'
                  : 'border-amber-300/70 bg-amber-50/75 dark:border-amber-500/30 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-[var(--md-on-surface)]">
                  {decodedBelt.family}
                </span>
                {decodedBelt.effectiveLengthMm > 0 && (
                  <span className="rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[var(--md-on-primary-container)]">
                    {decodedBelt.effectiveLengthMm.toFixed(0)} mm
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] font-semibold text-[var(--md-on-surface)]">
                {`${decodedBelt.widthMm} × ${decodedBelt.heightMm} mm · ${decodedBelt.lengthType}`}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--md-on-surface-variant)]">
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
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div data-tour="vbelt-canvas" className="glass-panel flex w-full items-center justify-center rounded-[28px] p-3">
            <VbeltBasicsSvg
              beltSpec={currentBeltSpec}
              pulleyCondition={pulleyCondition}
              beltTensionN={beltTensionN}
              wedgingPhysics={wedgingPhysics}
            />
          </div>

          {/* Live Belt Physics Readout Strip */}
          <div data-tour="vbelt-readouts" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Flank Force Fn', 'Gaya Samping Fn', '側壁抗力 Fn')}
              </span>
              <span className="mt-1 block font-mono text-sm font-black text-[var(--md-primary)]">
                {wedgingPhysics.normalForcePerSideN.toFixed(0)} N
              </span>
            </div>
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Apparent Grip μ′', 'Gesekan Semu μ′', '見かけ摩擦 μ′')}
              </span>
              <span
                className={`mt-1 block font-mono text-sm font-black ${
                  wedgingPhysics.bottomingOutOccurring
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {wedgingPhysics.apparentFrictionMuPrime.toFixed(2)}
              </span>
            </div>
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Min Pulley D', 'Puli Min D', '最小プーリ径')}
              </span>
              <span className="mt-1 block font-mono text-sm font-black text-[var(--md-on-surface)]">
                Ø {currentBeltSpec.minSheaveDiameterMm} mm
              </span>
            </div>
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Power / Strand', 'Daya / Jalur', '伝動容量/本')}
              </span>
              <span className="mt-1 block font-mono text-sm font-black text-[var(--md-primary)]">
                {currentBeltSpec.nominalPowerKwPerStrand} kW
              </span>
            </div>
          </div>

          {/* Shop Practice Rule of Thumb */}
          <div className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-start gap-2.5">
              {wedgingPhysics.bottomingOutOccurring ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--md-primary)]" />
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[var(--md-on-surface)]">
                  {pick('Shop Practice Rule of Thumb:', 'Kaidah Praktis Bengkel:', '現場実務の設計ルール:')}
                </span>
                <p className="text-xs leading-relaxed text-[var(--md-on-surface-variant)]">
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
