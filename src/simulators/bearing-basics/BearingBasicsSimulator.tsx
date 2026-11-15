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
    <div className="flex flex-col gap-4">
      {/* Compact Header Strip */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <CircleDot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {pick(
                'Bearing Types & Selection Cutaway Lab',
                'Lab Jenis & Pemilihan Bantalan (Bearing)',
                '転がり軸受の種類・構造断面ラボ'
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pick(
                'Compare rolling elements, contact angle α, Open/2Z/2RS seals, and live radial/axial load paths.',
                'Bandingkan elemen gelinding, sudut kontak α, seal Open/2Z/2RS, dan arah beban radial/aksial.',
                '転動体・接触角α・シール（開放/2Z/2RS）・荷重負荷方向を2D断面で比較学習します。'
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 font-mono font-bold text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300">
            ISO {currentBearingSpec.isoCode} • α = {currentBearingSpec.contactAngleDeg}°
          </span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Cr = {currentBearingSpec.dynamicLoadCrKn} kN
          </span>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* LEFT COLUMN (lg:col-span-5): Controls & Application Matcher */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* 1. Bearing Type Selection & Load Sliders */}
          <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                {pick('Select Bearing Architecture', 'Pilih Tipe Bantalan', '軸受形式の選択')}
              </span>
              <span className="rounded-sm bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                ISO Bore: 25 mm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
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
                    className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all ${
                      active
                        ? 'border-sky-500 bg-sky-50 text-sky-950 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-100'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="font-mono text-xs font-black">{id}</span>
                    <span className="line-clamp-1 text-[10px] opacity-80">
                      {pick(b.category, b.categoryId, b.categoryJa)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Seal / Shield Type Selector */}
            <div className="mt-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
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
              <div className="grid grid-cols-3 gap-1.5">
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
                      className={`flex flex-col items-center rounded-lg border p-1.5 text-center transition-all ${
                        !supported
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
                          : active
                            ? 'border-sky-500 bg-sky-50 font-bold text-sky-900 dark:border-sky-500 dark:bg-sky-950/40 dark:text-sky-200'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
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
              <p className="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">
                {pick(
                  SEAL_SHIELD_SPECS[effectiveSealType].description,
                  SEAL_SHIELD_SPECS[effectiveSealType].descriptionId,
                  SEAL_SHIELD_SPECS[effectiveSealType].descriptionJa
                )}
              </p>
            </div>

            {/* Applied Load Sliders (Radial Fr & Axial Fa) */}
            <div className="mt-1 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {pick('Radial Fr', 'Radial Fr', 'ラジアル Fr')}:
                  </span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
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
                  className="h-1.5 w-full cursor-pointer accent-sky-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {pick('Axial Fa', 'Aksial Fa', 'アキシアル Fa')}:
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
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
                  className="h-1.5 w-full cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Animation Toggle & Speed Summary */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsRotating((r) => !r)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {isRotating ? <Square className="h-3 w-3 text-red-500" /> : <Play className="h-3 w-3 text-emerald-500" />}
                {isRotating ? pick('Pause Shaft', 'Jeda Poros', '回転停止') : pick('Rotate Shaft', 'Putar Poros', '軸回転')}
              </button>

              <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {pick('Seal Friction:', 'Friksi Seal:', 'シール摩擦:')} {currentSealSpec.dragTorqueFactor}
              </span>
            </div>
          </div>

          {/* 2. Interactive Application Matcher */}
          <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-sky-500" />
              <span className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">
                {pick('Interactive Application Matcher', 'Pencocok Aplikasi Bantalan', '用途別 最適軸受マッチャー')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {pick('Load & Motion Profile', 'Profil Beban & Putaran', '荷重・回転条件')}
                </label>
                <select
                  value={matcherLoad}
                  onChange={(e) => setMatcherLoad(e.target.value as MatcherLoadProfile)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {pick('Environment / Lubrication', 'Lingkungan / Pelumasan', '使用環境・潤滑')}
                </label>
                <select
                  value={matcherEnv}
                  onChange={(e) => setMatcherEnv(e.target.value as MatcherEnvironment)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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

            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-800/60 dark:bg-sky-950/30">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-sky-700 uppercase dark:text-sky-400">
                    {pick('Recommended Specification', 'Rekomendasi Spesifikasi', '推奨選定結果')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-black text-slate-900 dark:text-white">
                      {matcherResult.recommendedBearingId}-{matcherResult.recommendedSeal.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      {matcherResult.matchScorePct}% Match
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyMatch}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700"
                >
                  {pick('Apply to CAD Viewer', 'Terapkan ke Visual', '断面図へ反映')}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                {pick(matcherResult.reasonEn, matcherResult.reasonId, matcherResult.reasonJa)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-7): Pure-2D CAD SVG & Engineering Notes */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="glass-panel flex w-full items-center justify-center rounded-2xl p-2 shadow-xs">
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Dynamic Cr', 'Dinamis Cr', '動定格 Cr')}
              </span>
              <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                {currentBearingSpec.dynamicLoadCrKn} kN
              </span>
            </div>
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Static C0', 'Statis C0', '静定格 C0')}
              </span>
              <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-100">
                {currentBearingSpec.staticLoadC0Kn} kN
              </span>
            </div>
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Grease Limit', 'Batas Gemuk', 'グリース上限')}
              </span>
              <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                {(effectiveSealType === '2rs'
                  ? Math.round(currentBearingSpec.limitingSpeedGreaseRpm * 0.62)
                  : currentBearingSpec.limitingSpeedGreaseRpm
                ).toLocaleString()}{' '}
                rpm
              </span>
            </div>
            <div className="glass-panel rounded-xl p-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                {pick('Oil Limit', 'Batas Oli', '油潤滑上限')}
              </span>
              <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                {currentBearingSpec.limitingSpeedOilRpm.toLocaleString()} rpm
              </span>
            </div>
          </div>

          {/* Shop Practice Rule of Thumb */}
          <div className="glass-panel rounded-2xl p-4 shadow-xs">
            <div className="flex items-start gap-2.5">
              {currentBearingSpec.id === '51105' && radialLoadKn > 0 ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
              )}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {pick('Shop Practice Rule of Thumb:', 'Kaidah Praktis Bengkel:', '現場実務の設計ルール:')}
                </span>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
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
