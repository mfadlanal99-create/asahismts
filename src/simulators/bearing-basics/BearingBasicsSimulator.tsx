/* oxlint-disable react/only-export-components */
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CircleDot,
  Compass,
  Info,
  Play,
  Square,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { bearingBasicsMeta } from './bearingBasicsMeta';
import './bearingBasicsI18n';
import {
  BEARING_SPECS,
  SEAL_SHIELD_SPECS,
  evaluateApplicationMatch,
  type BearingTypeId,
  type MatcherEnvironment,
  type MatcherLoadProfile,
  type SealShieldType,
} from './bearingBasicsData';
import { BearingBasicsSvg } from './BearingBasicsSvg';

export { bearingBasicsMeta };

export function BearingBasicsSimulator() {
  const { pick } = useLanguage();

  const [bearingId, setBearingId] = useState<BearingTypeId>('6205');
  const [sealType, setSealType] = useState<SealShieldType>('2rs');
  const [radialLoadKn, setRadialLoadKn] = useState<number>(6.0);
  const [axialLoadKn, setAxialLoadKn] = useState<number>(1.5);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationAngleDeg, setRotationAngleDeg] = useState<number>(0);

  // Application Matcher state
  const [matcherLoad, setMatcherLoad] = useState<MatcherLoadProfile>('high_speed_light_radial');
  const [matcherEnv, setMatcherEnv] = useState<MatcherEnvironment>('wet_washdown');

  // Smooth rotation loop for bearing inspection
  useEffect(() => {
    if (!isRotating) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setRotationAngleDeg((prev) => (prev + dt * 140) % 360);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRotating]);

  const currentBearingSpec = BEARING_SPECS[bearingId];
  const currentSealSpec = SEAL_SHIELD_SPECS[sealType];

  const effectiveSealType: SealShieldType = currentBearingSpec.supportedSeals.includes(sealType)
    ? sealType
    : currentBearingSpec.supportedSeals[0];

  const matcherResult = useMemo(
    () => evaluateApplicationMatch(matcherLoad, matcherEnv),
    [matcherLoad, matcherEnv]
  );

  const handleApplyMatch = () => {
    setBearingId(matcherResult.recommendedBearingId);
    setSealType(matcherResult.recommendedSeal);
    if (matcherResult.recommendedBearingId === '51105') {
      setRadialLoadKn(0);
      setAxialLoadKn(8);
    } else if (matcherResult.recommendedBearingId === 'NU205') {
      setRadialLoadKn(14);
      setAxialLoadKn(0);
    } else {
      setRadialLoadKn(8);
      setAxialLoadKn(3);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Compact Header Strip */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
            <CircleDot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-[var(--md-on-surface)]">
              {pick(
                'Bearing Types & Selection Cutaway Lab',
                'Lab Jenis & Pemilihan Bantalan (Bearing)',
                '転がり軸受の種類・構造断面ラボ'
              )}
            </h2>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                'Compare rolling elements, contact angle α, Open/2Z/2RS seals, and live radial/axial load paths.',
                'Bandingkan elemen gelinding, sudut kontak α, seal Open/2Z/2RS, dan arah beban radial/aksial.',
                '転動体・接触角α・シール（開放/2Z/2RS）・荷重負荷方向を2D断面で比較学習します。'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-[var(--md-primary-container)] px-3.5 py-1.5 font-mono font-bold text-[var(--md-on-primary-container)]">
            ISO {currentBearingSpec.isoCode} • α = {currentBearingSpec.contactAngleDeg}°
          </span>
          <span className="rounded-full bg-[var(--md-secondary-container)] px-3 py-1.5 font-mono font-bold text-[var(--md-on-secondary-container)]">
            Cr = {currentBearingSpec.dynamicLoadCrKn} kN
          </span>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN (lg:col-span-5): Controls & Application Matcher */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* 1. Bearing Type Selection & Load Sliders */}
          <div className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-[var(--md-on-surface-variant)] uppercase">
                {pick('Select Bearing Architecture', 'Pilih Tipe Bantalan', '軸受形式の選択')}
              </span>
              <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]">
                ISO Bore: 25 mm
              </span>
            </div>

            <div data-tour="bearing-basics-types" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.keys(BEARING_SPECS) as BearingTypeId[]).map((id) => {
                const b = BEARING_SPECS[id];
                const active = bearingId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setBearingId(id);
                      if (id === '51105') setRadialLoadKn(0);
                      if (id === 'NU205') setAxialLoadKn(0);
                    }}
                    className={`flex flex-col items-start rounded-[20px] border p-2.5 text-left transition-all ${
                      active
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                        : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <span className="font-mono text-xs font-black">{id}</span>
                    <span className="line-clamp-1 text-[10px] opacity-85">
                      {pick(b.category, b.categoryId, b.categoryJa)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Seal / Shield Type Selector */}
            <div data-tour="bearing-basics-seals" className="mt-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--md-on-surface)]">
                  {pick('Protection Enclosure / Seal:', 'Pelindung / Seal:', '防じん・シール構造:')}
                </span>
                {effectiveSealType !== sealType && (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    {pick(
                      `Auto-set to ${effectiveSealType.toUpperCase()} for ${bearingId}`,
                      `Otomatis ${effectiveSealType.toUpperCase()} untuk ${bearingId}`,
                      `${bearingId}は${effectiveSealType.toUpperCase()}仕様`
                    )}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['open', '2z', '2rs'] as SealShieldType[]).map((st) => {
                  const spec = SEAL_SHIELD_SPECS[st];
                  const supported = currentBearingSpec.supportedSeals.includes(st);
                  const active = effectiveSealType === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={!supported}
                      onClick={() => setSealType(st)}
                      title={pick(spec.name, spec.nameId, spec.nameJa)}
                      className={`flex flex-col items-center rounded-[20px] border p-2 text-center transition-all ${
                        !supported
                          ? 'cursor-not-allowed border-[var(--md-outline-variant)]/40 bg-[var(--md-surface-container-low)] text-[var(--md-on-surface-variant)] opacity-45'
                          : active
                            ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                            : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <span className="text-xs uppercase">{st}</span>
                      <span className="text-[9px] opacity-80">
                        {st === 'open' ? 'Open' : st === '2z' ? 'Steel Shield' : 'Rubber NBR'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] leading-snug text-[var(--md-on-surface-variant)]">
                {pick(
                  SEAL_SHIELD_SPECS[effectiveSealType].description,
                  SEAL_SHIELD_SPECS[effectiveSealType].descriptionId,
                  SEAL_SHIELD_SPECS[effectiveSealType].descriptionJa
                )}
              </p>
            </div>

            {/* Applied Load Sliders (Radial Fr & Axial Fa) */}
            <div data-tour="bearing-basics-loads" className="mt-1 grid grid-cols-2 gap-3 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface)]">
                    {pick('Radial Fr', 'Radial Fr', 'ラジアル Fr')}:
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {radialLoadKn.toFixed(1)} kN
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={radialLoadKn}
                  onChange={(e) => setRadialLoadKn(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[var(--md-on-surface)]">
                    {pick('Axial Fa', 'Aksial Fa', 'アキシアル Fa')}:
                  </span>
                  <span className="font-mono font-bold text-[var(--md-primary)]">
                    {axialLoadKn.toFixed(1)} kN
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={axialLoadKn}
                  onChange={(e) => setAxialLoadKn(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Animation Toggle & Speed Summary */}
            <div className="flex items-center justify-between border-t border-[var(--md-outline-variant)]/50 pt-2.5">
              <button
                type="button"
                onClick={() => setIsRotating((r) => !r)}
                className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
              >
                {isRotating ? <Square className="h-3 w-3 text-rose-500" /> : <Play className="h-3 w-3 text-emerald-500" />}
                {isRotating ? pick('Pause Shaft', 'Jeda Poros', '回転停止') : pick('Rotate Shaft', 'Putar Poros', '軸回転')}
              </button>

              <span className="font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {pick('Seal Friction:', 'Friksi Seal:', 'シール摩擦:')} {currentSealSpec.dragTorqueFactor}
              </span>
            </div>
          </div>

          {/* 2. Interactive Application Matcher */}
          <div data-tour="bearing-basics-matcher" className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[var(--md-primary)]" />
              <span className="text-xs font-bold tracking-wide text-[var(--md-on-surface)] uppercase">
                {pick('Interactive Application Matcher', 'Pencocok Aplikasi Bantalan', '用途別 最適軸受マッチャー')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                  {pick('Load & Motion Profile', 'Profil Beban & Putaran', '荷重・回転条件')}
                </label>
                <select
                  value={matcherLoad}
                  onChange={(e) => setMatcherLoad(e.target.value as MatcherLoadProfile)}
                  className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                >
                  <option value="high_speed_light_radial">
                    {pick('High Speed + Light Radial (Motor)', 'Putaran Tinggi + Radial Ringan', '高速回転＋軽ラジアル（電動機）')}
                  </option>
                  <option value="combined_radial_axial">
                    {pick('Combined Radial + Heavy Thrust (Pump/Gear)', 'Kombinasi Radial + Aksial Berat', 'ラジアル＋高アキシアル複合（ポンプ）')}
                  </option>
                  <option value="heavy_radial_thermal_float">
                    {pick('Heavy Radial + Thermal Shaft Float', 'Radial Berat + Pemuaian Termal', '重ラジアル＋熱膨張自由端')}
                  </option>
                  <option value="heavy_shock_misalignment">
                    {pick('Heavy Shock + Frame Misalignment', 'Beban Kejut + Tidak Sejajar', '重衝撃荷重＋ミスアライメント')}
                  </option>
                  <option value="pure_axial_vertical">
                    {pick('Pure Axial Thrust (Crane/Screw Jack)', 'Aksial Murni (Dongkrak/Kran)', '純アキシアルスラスト（クレーン/ジャッキ）')}
                  </option>
                  <option value="easy_conveyor_mounting">
                    {pick('Quick Frame Bolt-Down (Conveyor)', 'Pemasangan Baut Cepat (Konveyor)', '架台ボルト固定（コンベヤ）')}
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                  {pick('Environment / Lubrication', 'Lingkungan / Pelumasan', '使用環境・潤滑')}
                </label>
                <select
                  value={matcherEnv}
                  onChange={(e) => setMatcherEnv(e.target.value as MatcherEnvironment)}
                  className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-2 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                >
                  <option value="clean_dry">
                    {pick('Clean Internal Oil Bath (Gearbox)', 'Bak Oli Bersih (Gearbox)', '清浄油浴潤滑（ギアボックス内）')}
                  </option>
                  <option value="dusty_factory">
                    {pick('Light Shop Dust + High RPM', 'Debu Ringan + Putaran Tinggi', '軽微粉じん＋高速回転')}
                  </option>
                  <option value="wet_washdown">
                    {pick('Mud, Grit & Water Washdown', 'Berdebu, Lumpur & Cipratan Air', '泥水・粉じん・水洗浄環境')}
                  </option>
                </select>
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-primary)]/40 bg-[var(--md-primary-container)]/55 p-3.5 text-[var(--md-on-surface)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[var(--md-primary)] uppercase">
                    {pick('Recommended Specification', 'Rekomendasi Spesifikasi', '推奨選定結果')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-black text-[var(--md-on-surface)]">
                      {matcherResult.recommendedBearingId}-{matcherResult.recommendedSeal.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      {matcherResult.matchScorePct}% Match
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyMatch}
                  className="m3-btn-filled px-3.5 py-2 text-xs font-bold"
                >
                  {pick('Apply to CAD Viewer', 'Terapkan ke Visual', '断面図へ反映')}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--md-on-surface-variant)]">
                {pick(matcherResult.reasonEn, matcherResult.reasonId, matcherResult.reasonJa)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-7): Pure-2D CAD SVG & Engineering Notes */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <div data-tour="bearing-basics-cutaway" className="glass-panel flex w-full items-center justify-center rounded-[28px] p-3 sm:p-4">
            <BearingBasicsSvg
              bearingSpec={currentBearingSpec}
              sealType={effectiveSealType}
              radialLoadKn={radialLoadKn}
              axialLoadKn={axialLoadKn}
              isRotating={isRotating}
              rotationAngleDeg={rotationAngleDeg}
            />
          </div>

          {/* Bearing Engineering Readout Strip */}
          <div data-tour="bearing-basics-readouts" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Dynamic Cr', 'Dinamis Cr', '動定格 Cr')}
              </span>
              <span className="font-mono text-sm font-black text-[var(--md-primary)]">
                {currentBearingSpec.dynamicLoadCrKn} kN
              </span>
            </div>
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Static C0', 'Statis C0', '静定格 C0')}
              </span>
              <span className="font-mono text-sm font-black text-[var(--md-on-surface)]">
                {currentBearingSpec.staticLoadC0Kn} kN
              </span>
            </div>
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Grease Limit', 'Batas Gemuk', 'グリース上限')}
              </span>
              <span className="font-mono text-sm font-black text-[var(--md-primary)]">
                {(effectiveSealType === '2rs'
                  ? Math.round(currentBearingSpec.limitingSpeedGreaseRpm * 0.62)
                  : currentBearingSpec.limitingSpeedGreaseRpm
                ).toLocaleString()}{' '}
                rpm
              </span>
            </div>
            <div className="glass-card rounded-[24px] p-3.5">
              <span className="block text-[10px] font-bold text-[var(--md-on-surface-variant)] uppercase">
                {pick('Oil Limit', 'Batas Oli', '油潤滑上限')}
              </span>
              <span className="font-mono text-sm font-black text-[var(--md-on-surface)]">
                {currentBearingSpec.limitingSpeedOilRpm.toLocaleString()} rpm
              </span>
            </div>
          </div>

          {/* Shop Practice Rule of Thumb */}
          <div data-tour="bearing-basics-diagnostics" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-start gap-2.5">
              {currentBearingSpec.id === '51105' && radialLoadKn > 0 ? (
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
                    currentBearingSpec.description,
                    currentBearingSpec.descriptionId,
                    currentBearingSpec.descriptionJa
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
