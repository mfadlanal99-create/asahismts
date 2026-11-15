/* oxlint-disable react/only-export-components */
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Droplet,
  Gauge,
  HelpCircle,
  Layers,
  OctagonAlert,
  RotateCcw,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  calculateViscosityAtTemp,
  checkGreaseCompatibility,
  ISO_VG_GRADES,
  MACHINE_PRESETS,
  NLGI_GRADES,
  OIL_FAMILIES,
  THICKENERS,
  type LabMode,
  type NlgiGradeId,
  type OilFamilyId,
  type ThickenerId,
} from './oilGreaseBasicsData';
import { OilGreaseBasicsSvg } from './OilGreaseBasicsSvg';

export { oilGreaseBasicsMeta } from './oilGreaseBasicsMeta';

export function OilGreaseBasicsSimulator() {
  const { pick } = useLanguage();

  // Primary Mode: Oil vs Grease
  const [mode, setMode] = useState<LabMode>('oil');

  // Mode 1: Industrial Oil States
  const [selectedFamilyId, setSelectedFamilyId] =
    useState<OilFamilyId>('hydraulic-aw');
  const [selectedIsoVg, setSelectedIsoVg] = useState<number>(46);
  const [tempC, setTempC] = useState<number>(40);
  const [selectedMachinePresetId, setSelectedMachinePresetId] = useState<
    string | null
  >('hydraulic-hpu');

  // Mode 2: Grease NLGI & Compatibility States
  const [selectedNlgi, setSelectedNlgi] = useState<NlgiGradeId>('2');
  const [thickener1Id, setThickener1Id] =
    useState<ThickenerId>('lithium-complex');
  const [thickener2Id, setThickener2Id] = useState<ThickenerId>('polyurea');

  // Resolved active objects
  const activeFamily = useMemo(
    () =>
      OIL_FAMILIES.find((f) => f.id === selectedFamilyId) ?? OIL_FAMILIES[0],
    [selectedFamilyId]
  );

  const activeIsoGrade = useMemo(
    () =>
      ISO_VG_GRADES.find((g) => g.vg === selectedIsoVg) ?? ISO_VG_GRADES[1],
    [selectedIsoVg]
  );

  const activeNlgi = useMemo(
    () => NLGI_GRADES.find((g) => g.grade === selectedNlgi) ?? NLGI_GRADES[3],
    [selectedNlgi]
  );

  const activeThickener1 = useMemo(
    () => THICKENERS.find((t) => t.id === thickener1Id) ?? THICKENERS[0],
    [thickener1Id]
  );

  const activeThickener2 = useMemo(
    () => THICKENERS.find((t) => t.id === thickener2Id) ?? THICKENERS[1],
    [thickener2Id]
  );

  // Kinematic Viscosity calculated via ASTM D341 Walther formula
  const currentViscosityCst = useMemo(() => {
    return calculateViscosityAtTemp(
      selectedIsoVg,
      tempC,
      activeFamily.baseType
    );
  }, [selectedIsoVg, tempC, activeFamily.baseType]);

  // Compatibility Result for Mode 2
  const compatResult = useMemo(() => {
    return checkGreaseCompatibility(thickener1Id, thickener2Id);
  }, [thickener1Id, thickener2Id]);

  // Handle Machine Preset Selection
  const applyMachinePreset = (presetId: string) => {
    const preset = MACHINE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedMachinePresetId(presetId);
    setSelectedFamilyId(preset.recommendedFamilyId);
    setSelectedIsoVg(preset.recommendedVg);
    setTempC(preset.recommendedTempC);
  };

  // Reset function
  const handleReset = () => {
    if (mode === 'oil') {
      setSelectedFamilyId('hydraulic-aw');
      setSelectedIsoVg(46);
      setTempC(40);
      setSelectedMachinePresetId('hydraulic-hpu');
    } else {
      setSelectedNlgi('2');
      setThickener1Id('lithium-complex');
      setThickener2Id('polyurea');
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Mode Selector Tabs */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <button
            type="button"
            onClick={() => setMode('oil')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'oil'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Droplet className="h-4 w-4 text-amber-500" />
            {pick(
              'Mode 1: Industrial Oil & Viscosity',
              'Mode 1: Jenis Oli & Viskositas',
              'モード1: 産業用潤滑油と粘度'
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode('grease')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === 'grease'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4 text-amber-500" />
            {pick(
              'Mode 2: Grease NLGI & Compatibility',
              'Mode 2: Gemuk NLGI & Kompatibilitas',
              'モード2: グリースちょう度と混和適合性'
            )}
          </button>
        </div>

        {/* Global Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {pick('Reset Lab', 'Reset Lab', 'ラボを初期化')}
        </button>
      </div>

      {/* Main 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sim-equal-grid">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CONTROLS & SELECTION (lg:col-span-5)         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {mode === 'oil' ? (
            <>
              {/* "Which Oil for This Machine?" Beginner Selector */}
              <div className="glass-panel rounded-2xl border-amber-500/25 bg-amber-500/5 dark:bg-amber-950/20 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {pick(
                        'Beginner Helper: Which Oil for This Machine?',
                        'Panduan Pemula: Oli Mana untuk Mesin Ini?',
                        '初心者ガイド: 機械別推奨オイル自動選定'
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {MACHINE_PRESETS.map((preset) => {
                    const isSelected = selectedMachinePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyMachinePreset(preset.id)}
                        className={`text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-200 font-semibold shadow-xs'
                            : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-amber-400/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span>{preset.name[pick('en', 'id', 'ja')]}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {preset.recommendedFamilyId.toUpperCase()} • ISO VG{' '}
                            {preset.recommendedVg} @ {preset.recommendedTempC}°C
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
                      </button>
                    );
                  })}
                </div>

                {/* Machine Recommendation Rationale Callout */}
                {selectedMachinePresetId && (
                  <div className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-200/90 bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="font-bold mr-1">
                      {pick('Why this choice?', 'Mengapa pilihan ini?', '選定根拠:')}
                    </span>
                    {
                      MACHINE_PRESETS.find(
                        (p) => p.id === selectedMachinePresetId
                      )?.rationale[pick('en', 'id', 'ja')]
                    }
                  </div>
                )}
              </div>

              {/* Oil Family Selection Card */}
              <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {pick(
                      'Industrial Oil Family',
                      'Keluarga Oli Industri',
                      '産業用潤滑油ファミリー'
                    )}
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeFamily.badgeBg}`}
                  >
                    {activeFamily.shortCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {OIL_FAMILIES.map((family) => {
                    const isSelected = family.id === selectedFamilyId;
                    return (
                      <button
                        key={family.id}
                        type="button"
                        onClick={() => {
                          setSelectedFamilyId(family.id);
                          setSelectedMachinePresetId(null);
                        }}
                        className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: family.colorHex }}
                          />
                          <span className="truncate">{family.name}</span>
                        </div>
                        <span className="text-[10px] font-normal text-muted-foreground line-clamp-1">
                          {family.shortCode}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Family Description Info */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-2.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                  <p className="leading-relaxed">
                    {activeFamily.description[pick('en', 'id', 'ja')]}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {pick('Additives: ', 'Aditif Utama: ', '主要添加剤: ')}
                    </span>
                    {activeFamily.primaryAdditives}
                  </div>
                </div>
              </div>

              {/* ISO VG Viscosity Grade Buttons */}
              <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {pick(
                      'ISO VG Viscosity Grade (ISO 3448)',
                      'Tingkat Viskositas ISO VG (ISO 3448)',
                      'ISO VG 粘度グレード（ISO 3448規格）'
                    )}
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    VG {selectedIsoVg} ({activeIsoGrade.min40}–
                    {activeIsoGrade.max40} cSt @ 40°C)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {ISO_VG_GRADES.map((grade) => {
                    const isSelected = grade.vg === selectedIsoVg;
                    return (
                      <button
                        key={grade.vg}
                        type="button"
                        onClick={() => {
                          setSelectedIsoVg(grade.vg);
                          setSelectedMachinePresetId(null);
                        }}
                        className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500 text-slate-900 font-extrabold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        VG {grade.vg}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-muted-foreground leading-snug">
                  <span className="font-semibold">
                    {pick('Typical Applications: ', 'Aplikasi Tipikal: ', '代表的用途: ')}
                  </span>
                  {activeIsoGrade.commonUses}
                </div>
              </div>

              {/* Operating Temperature Slider */}
              <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {pick(
                        'Operating Temperature',
                        'Suhu Operasi Fluida',
                        '運転流体温度'
                      )}
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono font-bold text-red-500">
                      {tempC} °C
                    </span>
                    {tempC === 40 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-sm font-semibold">
                        ISO 40°C REF
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={tempC}
                  onChange={(e) => {
                    setTempC(Number(e.target.value));
                    setSelectedMachinePresetId(null);
                  }}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>10 °C ({pick('Cold Start', 'Start Dingin', '低温始動')})</span>
                  <span>40 °C (ISO Ref)</span>
                  <span>90 °C ({pick('Hot Sump', 'Sump Panas', '高温稼働')})</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* MODE 2: GREASE NLGI GRADES & COMPATIBILITY CHECKER */}
              {/* NLGI Consistency Grade Selector */}
              <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {pick(
                      'NLGI Consistency Grade (ASTM D217)',
                      'Kelas Konsistensi NLGI (ASTM D217)',
                      'NLGI ちょう度グレード（ASTM D217）'
                    )}
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    NLGI {activeNlgi.grade} (
                    {activeNlgi.workedPenetrationRange[0]}–
                    {activeNlgi.workedPenetrationRange[1]} mm/10)
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {NLGI_GRADES.map((grade) => {
                    const isSelected = grade.grade === selectedNlgi;
                    return (
                      <button
                        key={grade.grade}
                        type="button"
                        onClick={() => setSelectedNlgi(grade.grade)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs font-mono transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500 text-slate-900 font-extrabold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        NLGI {grade.grade}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-950 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1">
                    <span>{activeNlgi.textureDescription}</span>
                    <span className="font-normal opacity-80">
                      • {pick('Analogy: ', 'Analogi: ', '例え: ')}{activeNlgi.foodAnalogy}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                    {activeNlgi.commonApplications}
                  </p>
                </div>
              </div>

              {/* 2-Grease Thickener Cross-Check Selectors */}
              <div className="glass-panel rounded-2xl p-4 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {pick(
                      'Interactive 2-Grease Compatibility',
                      'Uji Kompatibilitas 2-Gemuk Interaktif',
                      '2種グリース混和適合性クロスチェック'
                    )}
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${compatResult.badgeBg}`}
                  >
                    {compatResult.status}
                  </span>
                </div>

                {/* Grease 1 Thickener */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>
                      {pick(
                        'Existing Grease in Bearing (Grease 1):',
                        'Gemuk Lama di Bantalan (Gemuk 1):',
                        '軸受内既存グリース（グリース1）:'
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Drop: {activeThickener1.droppingPointC === 'Non-Melting' ? 'Non-Melting' : `${activeThickener1.droppingPointC}°C`}
                    </span>
                  </label>
                  <select
                    value={thickener1Id}
                    onChange={(e) =>
                      setThickener1Id(e.target.value as ThickenerId)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {THICKENERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grease 2 Thickener */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>
                      {pick(
                        'New Grease to Add (Grease 2):',
                        'Gemuk Baru yang Ditambahkan (Gemuk 2):',
                        '追加補給グリース（グリース2）:'
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Drop: {activeThickener2.droppingPointC === 'Non-Melting' ? 'Non-Melting' : `${activeThickener2.droppingPointC}°C`}
                    </span>
                  </label>
                  <select
                    value={thickener2Id}
                    onChange={(e) =>
                      setThickener2Id(e.target.value as ThickenerId)
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {THICKENERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compatibility Outcome Alert Box */}
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                    compatResult.status === 'Compatible'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200'
                      : compatResult.status === 'Caution'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {compatResult.status === 'Compatible' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : compatResult.status === 'Caution' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <OctagonAlert className="h-4 w-4 text-rose-500" />
                    )}
                    <span>{compatResult.status}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {compatResult.consequence[pick('en', 'id', 'ja')]}
                  </p>
                  <p className="text-[11px] font-semibold pt-1 border-t border-current/15">
                    {compatResult.recommendation[pick('en', 'id', 'ja')]}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Quick Technical Tip Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
            <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {mode === 'oil'
                  ? pick(
                      'Why 40 °C is the Global Standard:',
                      'Mengapa 40 °C Menjadi Standar Global:',
                      'なぜ40 °Cが世界標準なのか:'
                    )
                  : pick(
                      'The 90% Industrial Rule:',
                      'Aturan 90% Industri:',
                      '産業用グリースの90%ルール:'
                    )}
              </span>
              <p className="text-[11px] leading-relaxed">
                {mode === 'oil'
                  ? pick(
                      'ISO 3448 standardizes oil viscosity at 40 °C because it matches typical industrial plant machine operating sump temperatures. For hot running machinery (70°C+), calculate actual cSt to ensure film thickness doesn’t starve components.',
                      'ISO 3448 menetapkan viskositas pada 40 °C karena mendekati suhu operasi bak oli mesin industri. Untuk mesin panas (70°C+), hitung nilai cSt aktual agar ketebalan film pelumas tidak putus.',
                      'ISO 3448規格が40 °Cを採用しているのは、一般的な工場設備の定常運転油温に近いためです。70 °C以上の高温設備では実稼働粘度を計算し、油膜破断を防ぐ必要があります。'
                    )
                  : pick(
                      'Over 90% of industrial electric motors, pumps, and conveyor bearings use NLGI Grade 2 Lithium Complex or Polyurea grease. Always check thickener compatibility before refilling bearing grease to prevent catastrophic melting!',
                      'Lebih dari 90% motor listrik, pompa, dan konveyor industri menggunakan gemuk NLGI Kelas 2 Litium Kompleks atau Polyurea. Selalu periksa kompatibilitas sebelum menambah gemuk agar tidak mencair!',
                      '産業用モーターやポンプ軸受の90%以上はNLGI 2号（リチウムコンプレックスまたはウレア）を採用しています。溶流事故を防ぐため、補給前には必ず増ちょう剤の混和適合性を確認してください。'
                    )}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CAD SVG VISUALIZER & LIVE METRICS (lg:col-span-7) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Pure-2D CAD SVG Visualizer */}
          <div className="glass-panel flex items-center justify-center rounded-2xl overflow-hidden shadow-xs p-2">
            <OilGreaseBasicsSvg
              mode={mode}
              oilFamilyId={selectedFamilyId}
              isoVg={selectedIsoVg}
              tempC={tempC}
              kinematicViscosityCst={currentViscosityCst}
              nlgiGradeId={selectedNlgi}
              thickener1Id={thickener1Id}
              thickener2Id={thickener2Id}
            />
          </div>

          {/* Live Engineering Metrics Dashboard */}
          {mode === 'oil' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Metric 1: Operating Viscosity */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('Operating Viscosity', 'Viskositas Operasi', '運転時動粘度')}
                </span>
                <div className="text-xl font-mono font-black text-amber-500">
                  {currentViscosityCst.toFixed(1)}{' '}
                  <span className="text-xs font-normal">cSt</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  @ {tempC} °C ({activeFamily.baseType})
                </div>
              </div>

              {/* Metric 2: Nominal ISO VG */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('ISO VG Benchmark', 'Benchmark ISO VG', '公称 ISO VG')}
                </span>
                <div className="text-xl font-mono font-black text-slate-800 dark:text-slate-100">
                  {selectedIsoVg}{' '}
                  <span className="text-xs font-normal">cSt</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  @ 40 °C (±10% band)
                </div>
              </div>

              {/* Metric 3: Tolerance Band */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('ISO 3448 Tolerance', 'Toleransi ISO 3448', 'ISO 3448 許容公差')}
                </span>
                <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                  {activeIsoGrade.min40} – {activeIsoGrade.max40}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  cSt (at 40 °C)
                </div>
              </div>

              {/* Metric 4: Viscosity Index */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('Viscosity Index (VI)', 'Indeks Viskositas', '粘度指数（VI）')}
                </span>
                <div className="text-xl font-mono font-black text-slate-800 dark:text-slate-100">
                  {activeFamily.baseType === 'synthetic' ? '145' : '98'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {activeFamily.baseType === 'synthetic'
                    ? pick('High VI (Flat curve)', 'VI Tinggi (Stabil)', '高VI（温度依存性小）')
                    : pick('Standard Mineral', 'Mineral Standar', '標準鉱油')}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Metric 1: NLGI Grade */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('NLGI Grade', 'Kelas NLGI', 'NLGIちょう度')}
                </span>
                <div className="text-xl font-mono font-black text-amber-500">
                  Grade {activeNlgi.grade}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {activeNlgi.textureDescription}
                </div>
              </div>

              {/* Metric 2: Worked Penetration */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('Worked Penetration', 'Penetrasi Tertempa', '混和針入度')}
                </span>
                <div className="text-lg font-mono font-black text-slate-800 dark:text-slate-100">
                  {activeNlgi.workedPenetrationMid}{' '}
                  <span className="text-xs font-normal">mm/10</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  ASTM D217 (25 °C, 60 strokes)
                </div>
              </div>

              {/* Metric 3: Dropping Point */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('Dropping Point (T1)', 'Titik Tetes (T1)', '滴点（グリース1）')}
                </span>
                <div className="text-lg font-mono font-bold text-slate-700 dark:text-slate-300">
                  {activeThickener1.droppingPointC === 'Non-Melting'
                    ? 'Non-Melting'
                    : `${activeThickener1.droppingPointC} °C`}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Max: {activeThickener1.maxContinuousTempC} °C
                </div>
              </div>

              {/* Metric 4: Compatibility Status */}
              <div className="glass-panel rounded-xl p-3 space-y-1 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {pick('Mix Compatibility', 'Kompatibilitas Campuran', '混和適合性')}
                </span>
                <div
                  className="text-sm font-bold truncate"
                  style={{ color: compatResult.colorHex }}
                >
                  {compatResult.status}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  ASTM D6185 Standard
                </div>
              </div>
            </div>
          )}

          {/* Educational Comparison / Reference Strip */}
          <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {mode === 'oil'
                  ? pick(
                      'Viscosity Reference Table across Temperatures',
                      'Tabel Referensi Viskositas Berbagai Suhu',
                      '温度別動粘度早見比較表（cSt）'
                    )
                  : pick(
                      'NLGI Consistency & Thickness Comparison Spectrum',
                      'Spektrum Perbandingan Konsistensi NLGI',
                      'NLGIちょう度・硬さ比較スペクトラム'
                    )}
              </h4>
            </div>

            {mode === 'oil' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Grade</th>
                      <th className="py-2 px-3 font-semibold">@ 20 °C</th>
                      <th className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">
                        @ 40 °C (Ref)
                      </th>
                      <th className="py-2 px-3 font-semibold">@ 60 °C</th>
                      <th className="py-2 px-3 font-semibold">@ 80 °C</th>
                      <th className="py-2 pl-3 font-semibold">@ 100 °C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {[32, 46, 68, 100, 150, 220, 320, 460].map((vg) => {
                      const isCurrent = vg === selectedIsoVg;
                      return (
                        <tr
                          key={vg}
                          className={`${
                            isCurrent
                              ? 'bg-amber-500/10 font-bold text-amber-900 dark:text-amber-200'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <td className="py-1.5 pr-3">ISO VG {vg}</td>
                          <td className="py-1.5 px-3">
                            {calculateViscosityAtTemp(vg, 20).toFixed(0)}
                          </td>
                          <td className="py-1.5 px-3 text-amber-600 dark:text-amber-400">
                            {vg}
                          </td>
                          <td className="py-1.5 px-3">
                            {calculateViscosityAtTemp(vg, 60).toFixed(1)}
                          </td>
                          <td className="py-1.5 px-3">
                            {calculateViscosityAtTemp(vg, 80).toFixed(1)}
                          </td>
                          <td className="py-1.5 pl-3">
                            {calculateViscosityAtTemp(vg, 100).toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 pt-1">
                {NLGI_GRADES.map((g) => {
                  const isCurrent = g.grade === selectedNlgi;
                  return (
                    <div
                      key={g.grade}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-500/15 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="text-xs font-mono font-black text-slate-800 dark:text-slate-100">
                        NLGI {g.grade}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                        {g.workedPenetrationMid} mm/10
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-1 line-clamp-1">
                        {g.foodAnalogy}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
