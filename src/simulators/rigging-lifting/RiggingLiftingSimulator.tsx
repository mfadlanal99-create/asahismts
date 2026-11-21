import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Gauge,
  Info,
  Scale,
  ShieldAlert,
  Triangle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  EQUIPMENT_PRESETS,
  HITCH_SPECS,
  SLING_WLL_SPECS,
  calculateRiggingHoist,
  type HitchType,
  type PresetId,
  type SlingWllTonnes,
} from './riggingData';
import { RiggingHoistSvg } from './RiggingHoistSvg';

export function RiggingLiftingSimulator() {
  const { language, pick } = useLanguage();

  const [presetId, setPresetId] = useState<PresetId>('pump-skid');
  const [massTonnes, setMassTonnes] = useState<number>(1.8);
  const [lugSpanM, setLugSpanM] = useState<number>(2.2);
  const [nominalAngleDeg, setNominalAngleDeg] = useState<number>(60);
  const [hitchType, setHitchType] = useState<HitchType>('bridle');
  const [ratedWll, setRatedWll] = useState<SlingWllTonnes>(2.0);
  const [cogOffsetPct, setCogOffsetPct] = useState<number>(5);
  const [hookPosPct, setHookPosPct] = useState<number>(5);
  const [useSpreaderBeam, setUseSpreaderBeam] = useState<boolean>(false);

  const handleSelectPreset = (nextId: PresetId) => {
    setPresetId(nextId);
    const found = EQUIPMENT_PRESETS.find((p) => p.id === nextId);
    if (!found) return;
    setMassTonnes(found.massTonnes);
    setLugSpanM(found.lugSpanM);
    setNominalAngleDeg(found.defaultAngleDeg);
    setHitchType(found.defaultHitch);
    setRatedWll(found.defaultWll);
    setCogOffsetPct(found.defaultCogOffsetPct);
    setHookPosPct(found.defaultCogOffsetPct);
    setUseSpreaderBeam(false);
  };

  const wllSpec = useMemo(
    () => SLING_WLL_SPECS.find((s) => s.wllTonnes === ratedWll) ?? SLING_WLL_SPECS[1],
    [ratedWll]
  );

  const hitchSpec = useMemo(
    () => HITCH_SPECS.find((h) => h.id === hitchType) ?? HITCH_SPECS[0],
    [hitchType]
  );

  const effectiveAngleForCalc = useSpreaderBeam ? 89.5 : nominalAngleDeg;

  const calc = useMemo(
    () =>
      calculateRiggingHoist({
        massTonnes,
        lugSpanM,
        cogOffsetPct,
        hookPosPct,
        nominalAngleDeg: effectiveAngleForCalc,
        hitchType,
        ratedWllTonnes: ratedWll,
      }),
    [massTonnes, lugSpanM, cogOffsetPct, hookPosPct, effectiveAngleForCalc, hitchType, ratedWll]
  );

  // Active safety alarms list
  const alarms = useMemo(() => {
    const list: {
      id: string;
      severity: 'danger' | 'caution';
      title: string;
      detail: string;
    }[] = [];

    if (!useSpreaderBeam && calc.isAngleDanger) {
      list.push({
        id: 'angle-danger',
        severity: 'danger',
        title: pick(
          'DANGER: SLING ANGLE ≤ 30° (ASME B30.9 PROHIBITED)',
          'BAHAYA: SUDUT SLING ≤ 30° (DILARANG ASME B30.9)',
          '危険：スリング水平角 ≤ 30°（ASME B30.9 使用禁止領域）'
        ),
        detail: pick(
          `Minimum horizontal leg angle is ${calc.minThetaDeg.toFixed(1)}° (Multiplier ≥ 2.00×). Extreme horizontal pinch (${calc.horizPinchKn.toFixed(1)} kN) and snap-load hazard! Use longer slings or a Spreader Beam.`,
          `Sudut kaki horizontal minimum adalah ${calc.minThetaDeg.toFixed(1)}° (Pengali ≥ 2.00×). Gaya jepit horizontal ekstrem (${calc.horizPinchKn.toFixed(1)} kN) dan risiko putus! Gunakan sling lebih panjang atau Spreader Beam.`,
          `最小対水平角が ${calc.minThetaDeg.toFixed(1)}°（張力係数 ≥ 2.00×）です。過大な水平圧縮力 (${calc.horizPinchKn.toFixed(1)} kN) と破断リスクがあります。長尺スリングまたは天秤を使用してください。`
        ),
      });
    } else if (!useSpreaderBeam && calc.isAngleCaution) {
      list.push({
        id: 'angle-caution',
        severity: 'caution',
        title: pick(
          'CAUTION: LOW SLING ANGLE (< 45°)',
          'WASPADA: SUDUT SLING RENDAH (< 45°)',
          '注意：スリング水平角が 45° 未満 (< 45°)'
        ),
        detail: pick(
          `Horizontal sling angle (${calc.minThetaDeg.toFixed(1)}°) is below 45° (Load Factor = ${calc.nominalLoadFactor.toFixed(2)}×). ASME B30.9 recommends θ ≥ 60° (LF ≤ 1.155×) for routine hoisting.`,
          `Sudut sling horizontal (${calc.minThetaDeg.toFixed(1)}°) di bawah 45° (Load Factor = ${calc.nominalLoadFactor.toFixed(2)}×). ASME B30.9 merekomendasikan θ ≥ 60° (LF ≤ 1.155×).`,
          `対水平スリング角 (${calc.minThetaDeg.toFixed(1)}°) が 45° 未満（張力係数 = ${calc.nominalLoadFactor.toFixed(2)}×）です。ASME B30.9 は通常作業で θ ≥ 60° を推奨しています。`
        ),
      });
    }

    if (calc.isWllOverload) {
      list.push({
        id: 'wll-overload',
        severity: 'danger',
        title: pick(
          `WLL OVERLOAD: LEG TENSION EXCEEDS EFFECTIVE WLL (${calc.maxUtilPct.toFixed(0)}%)`,
          `OVERLOAD WLL: TEGANGAN KAKI MELEBIHI WLL EFEKTIF (${calc.maxUtilPct.toFixed(0)}%)`,
          `WLL 過荷重警報：スリング張力が実効使用荷重を超過 (${calc.maxUtilPct.toFixed(0)}%)`
        ),
        detail: pick(
          `Max leg tension (${Math.max(calc.t1Tonnes, calc.t2Tonnes).toFixed(2)} t) exceeds effective sling WLL (${calc.effectiveWllTonnes.toFixed(2)} t = ${ratedWll.toFixed(1)} t × ${hitchSpec.efficiency}×). Upgrade sling WLL or switch to Double Basket / steeper angle!`,
          `Tegangan kaki maks (${Math.max(calc.t1Tonnes, calc.t2Tonnes).toFixed(2)} t) melebihi WLL efektif (${calc.effectiveWllTonnes.toFixed(2)} t = ${ratedWll.toFixed(1)} t × ${hitchSpec.efficiency}×). Naikkan kapasitas WLL sling atau perbesar sudut!`,
          `最大脚張力 (${Math.max(calc.t1Tonnes, calc.t2Tonnes).toFixed(2)} t) が実効 WLL (${calc.effectiveWllTonnes.toFixed(2)} t = ${ratedWll.toFixed(1)} t × ${hitchSpec.efficiency}×) を超過しています。上位 WLL スリングへ変更してください！`
        ),
      });
    }

    if (calc.isTiltWarning) {
      list.push({
        id: 'cog-tilt',
        severity: Math.abs(calc.loadTiltDeg) > 8 ? 'danger' : 'caution',
        title: pick(
          `OFF-PLUMB HOOK MISALIGNMENT: LOAD TILTS ${calc.loadTiltDeg >= 0 ? '+' : ''}${calc.loadTiltDeg.toFixed(1)}°`,
          `HOOK TIDAK SEGARIS CoG: BEBAN MIRING ${calc.loadTiltDeg >= 0 ? '+' : ''}${calc.loadTiltDeg.toFixed(1)}°`,
          `フック芯ずれ警告：地切り時に荷が ${calc.loadTiltDeg >= 0 ? '+' : ''}${calc.loadTiltDeg.toFixed(1)}° 傾斜`
        ),
        detail: pick(
          `Crane hook is offset by ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m from the Center of Gravity. On lift-off, the payload will swing laterally and tilt until the CoG settles under the hook.`,
          `Hook crane bergeser ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m dari Titik Berat (CoG). Saat diangkat, beban akan mengayun dan miring hingga CoG berada di bawah hook.`,
          `クレーンフックが重心（CoG）から ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m ずれています。巻き上げ時に荷が横振れして傾きます。`
        ),
      });
    }

    return list;
  }, [useSpreaderBeam, calc, ratedWll, hitchSpec.efficiency, pick]);

  return (
    <div className="space-y-5">
      {/* Top Safety Status Banner */}
      {alarms.length === 0 ? (
        <div data-tour="rigging-safety-banner" className="flex items-start gap-3 rounded-[24px] border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">
              {pick(
                'ASME B30.9 RIGGING CHECK PASSED — SAFE & LEVEL HOIST CONFIGURATION',
                'VERIFIKASI RIGGING ASME B30.9 LULUS — KONFIGURASI ANGKAT AMAN & RATA',
                'ASME B30.9 玉掛け安全検証クリア — 安全・水平揚重状態'
              )}
            </p>
            <p className="mt-0.5 text-emerald-800 dark:text-emerald-300/90">
              {pick(
                `Crane hook is plumb over CoG (tilt ${calc.loadTiltDeg.toFixed(1)}°), sling angle ≥ 45°, and peak leg utilization is ${calc.maxUtilPct.toFixed(0)}% of effective WLL (${calc.effectiveWllTonnes.toFixed(2)} t).`,
                `Hook crane tegak lurus di atas CoG (kemiringan ${calc.loadTiltDeg.toFixed(1)}°), sudut sling ≥ 45°, dan utilisasi puncak kaki adalah ${calc.maxUtilPct.toFixed(0)}% dari WLL efektif (${calc.effectiveWllTonnes.toFixed(2)} t).`,
                `クレーンフックは重心真上に芯出しされ（傾き ${calc.loadTiltDeg.toFixed(1)}°）、スリング角 ≥ 45°、最大脚稼働率は実効 WLL (${calc.effectiveWllTonnes.toFixed(2)} t) の ${calc.maxUtilPct.toFixed(0)}% です。`
              )}
            </p>
          </div>
        </div>
      ) : (
        <div data-tour="rigging-safety-banner" className="space-y-2">
          {alarms.map((al) => (
            <div
              key={al.id}
              className={`flex items-start gap-3 rounded-[24px] border p-4 ${
                al.severity === 'danger'
                  ? 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                  : 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
              }`}
            >
              {al.severity === 'danger' ? (
                <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <div className="text-xs sm:text-sm">
                <p className="font-bold">{al.title}</p>
                <p className="mt-0.5 opacity-90">{al.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment Presets Selector Strip */}
      <div data-tour="rigging-presets" className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            <Scale className="h-4 w-4 text-[var(--md-primary)]" />
            {pick('Equipment Hoisting Presets', 'Preset Peralatan Angkat', '機器揚重プリセット')}
          </span>
          <span className="font-mono text-xs text-[var(--md-on-surface-variant)]">
            {pick('Payload:', 'Beban:', '吊り荷質量:')}{' '}
            <strong className="text-[var(--md-on-surface)]">{massTonnes.toFixed(1)} t</strong> (
            {calc.weightKn.toFixed(1)} kN) | {pick('Lug Span:', 'Bentang Lug:', 'ラグ間隔:')}{' '}
            <strong className="text-[var(--md-on-surface)]">{lugSpanM.toFixed(1)} m</strong>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {EQUIPMENT_PRESETS.map((preset) => {
            const active = preset.id === presetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`flex flex-col justify-between rounded-[20px] border p-3 text-left transition ${
                  active
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{preset.name[language]}</div>
                  <div
                    className={`mt-1 text-[11px] leading-snug ${
                      active ? 'opacity-85' : 'text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    {preset.subtitle[language]}
                  </div>
                </div>
                <div
                  className={`mt-2 flex items-center gap-2 font-mono text-[10px] font-semibold ${
                    active ? 'text-[var(--md-on-primary-container)]' : 'text-[var(--md-primary)]'
                  }`}
                >
                  <span>{preset.massTonnes.toFixed(1)} t</span>
                  <span>•</span>
                  <span>θ={preset.defaultAngleDeg}°</span>
                  <span>•</span>
                  <span>CoG {preset.defaultCogOffsetPct >= 0 ? `+${preset.defaultCogOffsetPct}%` : `${preset.defaultCogOffsetPct}%`}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Controls + Right 2D Rigging Canvas & Readouts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: Rigging Controls (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Control Card 1: Horizontal Sling Angle & Spreader Beam */}
          <div data-tour="rigging-angle" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Triangle className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Horizontal Sling Angle θ',
                  'Sudut Sling Horizontal θ',
                  '対水平スリング角度 θ'
                )}
              </label>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                  calc.isAngleDanger
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : calc.isAngleCaution
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {nominalAngleDeg}° ({ (1 / Math.sin((nominalAngleDeg * Math.PI) / 180)).toFixed(3) }×)
              </span>
            </div>

            <input
              type="range"
              min={25}
              max={75}
              step={1}
              value={nominalAngleDeg}
              disabled={useSpreaderBeam}
              onChange={(e) => setNominalAngleDeg(Number(e.target.value))}
              className="mt-3 w-full disabled:opacity-50"
            />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--md-on-surface-variant)]">
              <span className="text-rose-500 font-semibold">25° (&lt;30° Danger)</span>
              <span className="text-rose-500">30° (2.00×)</span>
              <span className="text-amber-500">45° (1.41×)</span>
              <span className="text-emerald-500 font-semibold">60° (1.15×)</span>
              <span>75° (1.04×)</span>
            </div>

            {/* Quick Angle Buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[25, 30, 45, 60, 75].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    setUseSpreaderBeam(false);
                    setNominalAngleDeg(deg);
                  }}
                  className={`rounded-full border px-3 py-1 font-mono text-xs transition ${
                    !useSpreaderBeam && nominalAngleDeg === deg
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] font-semibold text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                  }`}
                >
                  {deg}°
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUseSpreaderBeam((v) => !v)}
                className={`ml-auto rounded-full border px-3 py-1 text-xs font-bold transition ${
                  useSpreaderBeam
                    ? 'border-[var(--md-primary)]/40 bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                    : 'glass-pill'
                }`}
              >
                {useSpreaderBeam
                  ? pick('✓ Spreader Beam ON', '✓ Spreader Beam AKTIF', '✓ 天秤ビーム ON')
                  : pick('+ Spreader Beam', '+ Spreader Beam', '+ 天秤ビーム比較')}
              </button>
            </div>
          </div>

          {/* Control Card 2: Hitch Configuration & Sling Rated WLL */}
          <div data-tour="rigging-hitch-wll" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                {pick(
                  'Hitch Configuration (Efficiency η)',
                  'Konfigurasi Ikatan Sling (Efisiensi η)',
                  '玉掛けヒッチ方式（効率係数 η）'
                )}
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {HITCH_SPECS.map((h) => {
                  const active = h.id === hitchType;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHitchType(h.id)}
                      className={`flex flex-col items-center rounded-[20px] border p-2.5 text-center transition ${
                        active
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <div className="text-xs">{h.shortLabel[language]}</div>
                      <div className="mt-0.5 font-mono text-[11px] opacity-80">
                        η = {h.efficiency.toFixed(2)}×
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--md-on-surface-variant)]">
                {hitchSpec.note[language]}
              </p>
            </div>

            <div className="border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick(
                    'Sling Rated Vertical WLL',
                    'Kapasitas WLL Vertikal Sling',
                    'スリング基本使用荷重 (WLL)'
                  )}
                </label>
                <span className="font-mono text-xs text-[var(--md-on-surface-variant)]">
                  {pick('Effective:', 'WLL Efektif:', '実効 WLL:')}{' '}
                  <strong className="text-[var(--md-primary)]">
                    {calc.effectiveWllTonnes.toFixed(2)} t
                  </strong>
                </span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {SLING_WLL_SPECS.map((spec) => {
                  const active = spec.wllTonnes === ratedWll;
                  return (
                    <button
                      key={spec.wllTonnes}
                      type="button"
                      onClick={() => setRatedWll(spec.wllTonnes)}
                      className={`flex flex-col items-center rounded-[20px] border p-2.5 transition ${
                        active
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                      }`}
                    >
                      <span
                        className="h-2.5 w-8 rounded-full"
                        style={{ backgroundColor: spec.strokeHex }}
                      />
                      <span className="mt-1 font-mono text-xs font-bold">
                        {spec.wllTonnes.toFixed(1)} t
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('Color Code:', 'Kode Warna:', '等級色:')}{' '}
                <span className="font-semibold text-[var(--md-on-surface)]">{wllSpec.colorName[language]}</span>
              </div>
            </div>
          </div>

          {/* Control Card 3: Center-of-Gravity (CoG) Offset & Crane Hook Horizontal Position */}
          <div data-tour="rigging-cog-hook" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-4">
            {/* CoG Offset Slider */}
            <div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  <Crosshair className="h-4 w-4 text-[var(--md-primary)]" />
                  {pick(
                    'Center-of-Gravity (CoG) Offset',
                    'Offset Titik Berat (CoG)',
                    '重心（CoG）水平オフセット'
                  )}
                </label>
                <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
                  {cogOffsetPct >= 0 ? `+${cogOffsetPct}%` : `${cogOffsetPct}%`} (d₁=
                  {calc.d1M.toFixed(2)}m, d₂={calc.d2M.toFixed(2)}m)
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={cogOffsetPct}
                onChange={(e) => setCogOffsetPct(Number(e.target.value))}
                className="mt-2 w-full"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--md-on-surface-variant)]">
                <span>{pick('-30% (Heavy Left Lug 1)', '-30% (Berat Kiri Lug 1)', '-30% (左ラグ1側偏心)')}</span>
                <span>0% ({pick('Centered', 'Tengah', '中央')})</span>
                <span>{pick('+30% (Heavy Right Lug 2)', '+30% (Berat Kanan Lug 2)', '+30% (右ラグ2側偏心)')}</span>
              </div>
            </div>

            {/* Crane Hook Horizontal Position Slider */}
            <div className="border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick(
                    'Crane Hook Horizontal Position',
                    'Posisi Horizontal Hook Crane',
                    'クレーンフック水平位置'
                  )}
                </label>
                <span
                  className={`font-mono text-xs font-bold ${
                    calc.isTiltWarning
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {hookPosPct >= 0 ? `+${hookPosPct}%` : `${hookPosPct}%`}{' '}
                  ({pick('Tilt', 'Miring', '傾き')} {calc.loadTiltDeg >= 0 ? `+${calc.loadTiltDeg.toFixed(1)}°` : `${calc.loadTiltDeg.toFixed(1)}°`})
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={hookPosPct}
                onChange={(e) => setHookPosPct(Number(e.target.value))}
                className="mt-2 w-full"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {Math.abs(hookPosPct - cogOffsetPct) === 0
                    ? pick(
                        '✓ Hook is plumb over CoG (0° level lift)',
                        '✓ Hook tegak lurus di atas CoG (0° rata)',
                        '✓ フックは重心の真上（傾き 0° 水平揚重）'
                      )
                    : pick(
                        `Δx = ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m off CoG`,
                        `Δx = ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m dari CoG`,
                        `重心から Δx = ${calc.hookMisalignmentM >= 0 ? '+' : ''}${calc.hookMisalignmentM.toFixed(2)} m 偏心`
                      )}
                </span>
                <button
                  type="button"
                  onClick={() => setHookPosPct(cogOffsetPct)}
                  className="m3-btn-filled px-3.5 py-1.5 text-xs font-bold"
                >
                  {pick('Align Hook Over CoG', 'Luruskan Hook ke CoG', 'フックを重心真上へ芯出し')}
                </button>
              </div>
            </div>

            {/* Payload Mass Adjustment Slider */}
            <div className="border-t border-[var(--md-outline-variant)]/50 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick('Payload Mass (W)', 'Massa Beban Angkat (W)', '吊り荷質量 (W)')}
                </label>
                <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
                  {massTonnes.toFixed(1)} t ({calc.weightKn.toFixed(1)} kN)
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.1}
                value={massTonnes}
                onChange={(e) => {
                  setPresetId('custom');
                  setMassTonnes(Number(e.target.value));
                }}
                className="mt-2 w-full"
              />
            </div>
          </div>
        </div>

        {/* Right Column: 2D SVG Rigging Canvas + Telemetry & 1/sin(θ) Curve (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <RiggingHoistSvg
            presetId={presetId}
            hitchType={hitchType}
            wllSpec={wllSpec}
            cogOffsetPct={cogOffsetPct}
            hookPosPct={hookPosPct}
            calc={calc}
            useSpreaderBeam={useSpreaderBeam}
          />

          {/* Telemetry & WLL Utilization Breakdown Cards */}
          <div data-tour="rigging-telemetry" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Card 1: Leg 1 & Leg 2 WLL Utilization Bars */}
            <div className="glass-card rounded-[24px] p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
                <span>{pick('WLL Utilization %', 'Utilisasi WLL %', '実効 WLL 稼働率 %')}</span>
                <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
              </div>

              {/* Leg 1 bar */}
              <div className="mt-2.5">
                <div className="flex justify-between font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  <span>
                    {pick('Leg 1:', 'Kaki 1:', '脚1:')} {calc.t1Tonnes.toFixed(2)} t /{' '}
                    {calc.effectiveWllTonnes.toFixed(2)} t
                  </span>
                  <span
                    className={`font-bold ${
                      calc.util1Pct > 100
                        ? 'text-rose-600 dark:text-rose-400'
                        : calc.util1Pct > 85
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {calc.util1Pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      calc.util1Pct > 100
                        ? 'bg-rose-500'
                        : calc.util1Pct > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, calc.util1Pct)}%` }}
                  />
                </div>
              </div>

              {/* Leg 2 bar */}
              <div className="mt-2.5">
                <div className="flex justify-between font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  <span>
                    {pick('Leg 2:', 'Kaki 2:', '脚2:')} {calc.t2Tonnes.toFixed(2)} t /{' '}
                    {calc.effectiveWllTonnes.toFixed(2)} t
                  </span>
                  <span
                    className={`font-bold ${
                      calc.util2Pct > 100
                        ? 'text-rose-600 dark:text-rose-400'
                        : calc.util2Pct > 85
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {calc.util2Pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[var(--md-surface-container-highest)]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      calc.util2Pct > 100
                        ? 'bg-rose-500'
                        : calc.util2Pct > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, calc.util2Pct)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Angle Multiplier & Pinch Force */}
            <div className="glass-card rounded-[24px] p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
                <span>
                  {pick('Angle Factor & Pinch', 'Faktor Sudut & Jepit', '角度倍率・水平圧縮力')}
                </span>
                <ShieldAlert className="h-4 w-4 text-[var(--md-primary)]" />
              </div>
              <div className="mt-2 font-mono text-lg font-extrabold text-[var(--md-on-surface)]">
                {useSpreaderBeam ? '1.000×' : `${calc.nominalLoadFactor.toFixed(3)}×`}{' '}
                <span className="text-xs font-normal text-[var(--md-on-surface-variant)]">
                  (1/sin {useSpreaderBeam ? '90°' : `${nominalAngleDeg}°`})
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--md-on-surface-variant)]">
                {pick('Horiz Pinch:', 'Gaya Jepit:', '水平圧縮力:')}{' '}
                <strong className="font-mono text-[var(--md-on-surface)]">
                  {useSpreaderBeam ? '0.00 t (0 kN)' : `${calc.horizPinchTonnes.toFixed(2)} t (${calc.horizPinchKn.toFixed(1)} kN)`}
                </strong>
              </div>
              <div className="mt-1 text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('Headroom H:', 'Tinggi Hook H:', '必要揚程 H:')}{' '}
                <span className="font-mono font-semibold text-[var(--md-on-surface)]">{calc.headroomM.toFixed(2)} m</span>
              </div>
            </div>

            {/* Card 3: Shackle & Rigging Hardware Spec */}
            <div className="glass-card rounded-[24px] p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
                <span>
                  {pick('Shackle Recommendation', 'Rekomendasi Shackle', '推奨シャックル選定')}
                </span>
                <Info className="h-4 w-4 text-[var(--md-primary)]" />
              </div>
              <div className="mt-2 font-mono text-base font-extrabold text-[var(--md-primary)]">
                {calc.recommendedShackle.modelCode}
              </div>
              <div className="mt-1 text-xs text-[var(--md-on-surface-variant)]">
                WLL <strong className="text-[var(--md-on-surface)]">{calc.recommendedShackle.wllTonnes.toFixed(2)} t</strong> •{' '}
                {pick('Pin Ø', 'Pin Ø', 'ピン径 Ø')}
                <strong className="text-[var(--md-on-surface)]">{calc.recommendedShackle.pinDiameterMm} mm</strong>
              </div>
              <div className="mt-1 text-[11px] text-[var(--md-on-surface-variant)]">
                {pick(
                  `Sized for peak leg load ${Math.max(calc.t1Tonnes, calc.t2Tonnes).toFixed(2)} t`,
                  `Untuk beban kaki maks ${Math.max(calc.t1Tonnes, calc.t2Tonnes).toFixed(2)} t`,
                  `最大脚張力 ${Math.max(calc.t1Tonnes, calc.t2Tonnes).toFixed(2)} t に適合`
                )}
              </div>
            </div>
          </div>

          {/* 1/sin(θ) Sling Angle Multiplier Reference Strip */}
          <div data-tour="rigging-angle-table" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-[var(--md-on-surface)]">
              <span>
                {pick(
                  'ASME B30.9 Sling Angle Load Factor Table (LF = 1 / sin θ)',
                  'Tabel Faktor Beban Sudut Sling ASME B30.9 (LF = 1 / sin θ)',
                  'ASME B30.9 スリング角度張力係数テーブル (LF = 1 / sin θ)'
                )}
              </span>
              <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('Active θ =', 'Sudut θ Aktif =', '現在の角度 θ =')} {nominalAngleDeg}°
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs sm:grid-cols-5">
              {[
                { deg: 90, lf: '1.000×', zone: 'optimal', label: pick('Vertical', 'Vertikal', '垂直 90°') },
                { deg: 60, lf: '1.155×', zone: 'optimal', label: pick('Preferred', 'Ideal ≥60°', '推奨 ≥60°') },
                { deg: 45, lf: '1.414×', zone: 'caution', label: pick('Min Std', 'Batas 45°', '下限 45°') },
                { deg: 30, lf: '2.000×', zone: 'danger', label: pick('Critical!', 'Kritis 30°', '限界 30°') },
                { deg: 25, lf: '2.366×', zone: 'danger', label: pick('Forbidden', 'Dilarang!', '禁止 <30°') },
              ].map((row) => {
                const isSelected = Math.abs(nominalAngleDeg - row.deg) <= 3;
                return (
                  <div
                    key={row.deg}
                    className={`rounded-[20px] border p-2.5 ${
                      isSelected
                        ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/40'
                        : row.zone === 'danger'
                          ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/30'
                          : row.zone === 'caution'
                            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30'
                            : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]'
                    }`}
                  >
                    <div className={`font-bold ${isSelected ? 'text-[var(--md-on-primary-container)]' : 'text-[var(--md-on-surface)]'}`}>
                      θ = {row.deg}°
                    </div>
                    <div
                      className={`text-sm font-extrabold ${
                        row.zone === 'danger'
                          ? 'text-rose-600 dark:text-rose-400'
                          : row.zone === 'caution'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {row.lf}
                    </div>
                    <div className={`text-[10px] ${isSelected ? 'opacity-85' : 'text-[var(--md-on-surface-variant)]'}`}>
                      {row.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
