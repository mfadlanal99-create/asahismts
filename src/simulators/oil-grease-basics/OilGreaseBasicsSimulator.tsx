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
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] p-3.5">
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
          <button
            type="button"
            onClick={() => setMode('oil')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
              mode === 'oil'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Droplet className="h-4 w-4 text-[var(--md-primary)]" />
            {pick(
              'Mode 1: Industrial Oil & Viscosity',
              'Mode 1: Jenis Oli & Viskositas',
              'モード1: 産業用潤滑油と粘度'
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode('grease')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
              mode === 'grease'
                ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                : 'font-semibold text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
            }`}
          >
            <Layers className="h-4 w-4 text-[var(--md-primary)]" />
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
          className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {pick('Reset Lab', 'Reset Lab', 'ラボを初期化')}
        </button>
      </div>

      {/* Main 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CONTROLS & SELECTION (lg:col-span-5)         */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {mode === 'oil' ? (
            <>
              {/* "Which Oil for This Machine?" Beginner Selector */}
              <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--md-primary)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-primary)]">
                      {pick(
                        'Beginner Helper: Which Oil for This Machine?',
                        'Panduan Pemula: Oli Mana untuk Mesin Ini?',
                        '初心者ガイド: 機械別推奨オイル自動選定'
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {MACHINE_PRESETS.map((preset) => {
                    const isSelected = selectedMachinePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyMachinePreset(preset.id)}
                        className={`flex items-center justify-between rounded-[20px] border p-2.5 text-left text-xs transition-all ${
                          isSelected
                            ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-semibold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30 shadow-2xs'
                            : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span>{preset.name[pick('en', 'id', 'ja')]}</span>
                          <span
                            className={`font-mono text-[10px] ${
                              isSelected
                                ? 'text-[var(--md-on-primary-container)]/80'
                                : 'text-[var(--md-on-surface-variant)]'
                            }`}
                          >
                            {preset.recommendedFamilyId.toUpperCase()} • ISO VG{' '}
                            {preset.recommendedVg} @ {preset.recommendedTempC}°C
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      </button>
                    );
                  })}
                </div>

                {/* Machine Recommendation Rationale Callout */}
                {selectedMachinePresetId && (
                  <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] p-3 text-[11px] leading-relaxed text-[var(--md-on-surface-variant)]">
                    <span className="mr-1 font-bold text-[var(--md-primary)]">
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
              <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    {pick(
                      'Industrial Oil Family',
                      'Keluarga Oli Industri',
                      '産業用潤滑油ファミリー'
                    )}
                  </label>
                  <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]">
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
                        className={`flex flex-col gap-1 rounded-[20px] border p-2.5 text-left text-xs transition-all ${
                          isSelected
                            ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30 shadow-2xs'
                            : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: family.colorHex }}
                          />
                          <span className="truncate">{family.name}</span>
                        </div>
                        <span
                          className={`line-clamp-1 text-[10px] font-normal ${
                            isSelected
                              ? 'text-[var(--md-on-primary-container)]/80'
                              : 'text-[var(--md-on-surface-variant)]'
                          }`}
                        >
                          {family.shortCode}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Family Description Info */}
                <div className="rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] p-3 text-xs text-[var(--md-on-surface-variant)]">
                  <p className="leading-relaxed">
                    {activeFamily.description[pick('en', 'id', 'ja')]}
                  </p>
                  <div className="mt-2 border-t border-[var(--md-outline-variant)]/50 pt-2 text-[11px] text-[var(--md-on-surface-variant)]">
                    <span className="font-semibold text-[var(--md-on-surface)]">
                      {pick('Additives: ', 'Aditif Utama: ', '主要添加剤: ')}
                    </span>
                    {activeFamily.primaryAdditives}
                  </div>
                </div>
              </div>

              {/* ISO VG Viscosity Grade Buttons */}
              <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    {pick(
                      'ISO VG Viscosity Grade (ISO 3448)',
                      'Tingkat Viskositas ISO VG (ISO 3448)',
                      'ISO VG 粘度グレード（ISO 3448規格）'
                    )}
                  </label>
                  <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
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
                        className={`rounded-full border px-2 py-2 text-center font-mono text-xs transition-all ${
                          isSelected
                            ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-extrabold text-[var(--md-on-primary)] shadow-xs'
                            : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                        }`}
                      >
                        VG {grade.vg}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] leading-snug text-[var(--md-on-surface-variant)]">
                  <span className="font-semibold text-[var(--md-on-surface)]">
                    {pick('Typical Applications: ', 'Aplikasi Tipikal: ', '代表的用途: ')}
                  </span>
                  {activeIsoGrade.commonUses}
                </div>
              </div>

              {/* Operating Temperature Slider */}
              <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="h-4 w-4 text-[var(--md-primary)]" />
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                      {pick(
                        'Operating Temperature',
                        'Suhu Operasi Fluida',
                        '運転流体温度'
                      )}
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-[var(--md-primary)]">
                      {tempC} °C
                    </span>
                    {tempC === 40 && (
                      <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-on-secondary-container)]">
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
                  className="w-full"
                />

                <div className="flex justify-between font-mono text-[10px] text-[var(--md-on-surface-variant)]">
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
              <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    {pick(
                      'NLGI Consistency Grade (ASTM D217)',
                      'Kelas Konsistensi NLGI (ASTM D217)',
                      'NLGI ちょう度グレード（ASTM D217）'
                    )}
                  </label>
                  <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
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
                        className={`rounded-full border px-1.5 py-2 text-center font-mono text-xs transition-all ${
                          isSelected
                            ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-extrabold text-[var(--md-on-primary)] shadow-xs'
                            : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                        }`}
                      >
                        NLGI {grade.grade}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-[20px] border border-[var(--md-primary)]/25 bg-[var(--md-primary-container)]/75 p-3 text-xs text-[var(--md-on-primary-container)]">
                  <div className="flex items-center gap-1 font-bold">
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
              <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                    {pick(
                      'Interactive 2-Grease Compatibility',
                      'Uji Kompatibilitas 2-Gemuk Interaktif',
                      '2種グリース混和適合性クロスチェック'
                    )}
                  </label>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${compatResult.badgeBg}`}
                  >
                    {compatResult.status}
                  </span>
                </div>

                {/* Grease 1 Thickener */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-semibold text-[var(--md-on-surface)]">
                    <span>
                      {pick(
                        'Existing Grease in Bearing (Grease 1):',
                        'Gemuk Lama di Bantalan (Gemuk 1):',
                        '軸受内既存グリース（グリース1）:'
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                      Drop: {activeThickener1.droppingPointC === 'Non-Melting' ? 'Non-Melting' : `${activeThickener1.droppingPointC}°C`}
                    </span>
                  </label>
                  <select
                    value={thickener1Id}
                    onChange={(e) =>
                      setThickener1Id(e.target.value as ThickenerId)
                    }
                    className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2.5 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
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
                  <label className="flex items-center justify-between text-xs font-semibold text-[var(--md-on-surface)]">
                    <span>
                      {pick(
                        'New Grease to Add (Grease 2):',
                        'Gemuk Baru yang Ditambahkan (Gemuk 2):',
                        '追加補給グリース（グリース2）:'
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                      Drop: {activeThickener2.droppingPointC === 'Non-Melting' ? 'Non-Melting' : `${activeThickener2.droppingPointC}°C`}
                    </span>
                  </label>
                  <select
                    value={thickener2Id}
                    onChange={(e) =>
                      setThickener2Id(e.target.value as ThickenerId)
                    }
                    className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2.5 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
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
                  className={`space-y-1.5 rounded-[20px] border p-3.5 text-xs ${
                    compatResult.status === 'Compatible'
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                      : compatResult.status === 'Caution'
                      ? 'border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                      : 'border-rose-500/25 bg-rose-500/10 text-rose-950 dark:text-rose-200'
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
                  <p className="border-t border-current/15 pt-1 text-[11px] font-semibold">
                    {compatResult.recommendation[pick('en', 'id', 'ja')]}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Quick Technical Tip Card */}
          <div className="flex items-start gap-2.5 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-xs text-[var(--md-on-surface-variant)]">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--md-primary)]" />
            <div className="space-y-1">
              <span className="font-bold text-[var(--md-on-surface)]">
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
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Pure-2D CAD SVG Visualizer */}
          <div className="glass-panel flex items-center justify-center overflow-hidden rounded-[28px] p-2.5">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Metric 1: Operating Viscosity */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Operating Viscosity', 'Viskositas Operasi', '運転時動粘度')}
                </span>
                <div className="font-mono text-xl font-black text-[var(--md-primary)]">
                  {currentViscosityCst.toFixed(1)}{' '}
                  <span className="text-xs font-normal">cSt</span>
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  @ {tempC} °C ({activeFamily.baseType})
                </div>
              </div>

              {/* Metric 2: Nominal ISO VG */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('ISO VG Benchmark', 'Benchmark ISO VG', '公称 ISO VG')}
                </span>
                <div className="font-mono text-xl font-black text-[var(--md-on-surface)]">
                  {selectedIsoVg}{' '}
                  <span className="text-xs font-normal">cSt</span>
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  @ 40 °C (±10% band)
                </div>
              </div>

              {/* Metric 3: Tolerance Band */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('ISO 3448 Tolerance', 'Toleransi ISO 3448', 'ISO 3448 許容公差')}
                </span>
                <div className="font-mono text-sm font-bold text-[var(--md-on-surface)]">
                  {activeIsoGrade.min40} – {activeIsoGrade.max40}
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  cSt (at 40 °C)
                </div>
              </div>

              {/* Metric 4: Viscosity Index */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Viscosity Index (VI)', 'Indeks Viskositas', '粘度指数（VI）')}
                </span>
                <div className="font-mono text-xl font-black text-[var(--md-on-surface)]">
                  {activeFamily.baseType === 'synthetic' ? '145' : '98'}
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {activeFamily.baseType === 'synthetic'
                    ? pick('High VI (Flat curve)', 'VI Tinggi (Stabil)', '高VI（温度依存性小）')
                    : pick('Standard Mineral', 'Mineral Standar', '標準鉱油')}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Metric 1: NLGI Grade */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('NLGI Grade', 'Kelas NLGI', 'NLGIちょう度')}
                </span>
                <div className="font-mono text-xl font-black text-[var(--md-primary)]">
                  Grade {activeNlgi.grade}
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  {activeNlgi.textureDescription}
                </div>
              </div>

              {/* Metric 2: Worked Penetration */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Worked Penetration', 'Penetrasi Tertempa', '混和針入度')}
                </span>
                <div className="font-mono text-lg font-black text-[var(--md-on-surface)]">
                  {activeNlgi.workedPenetrationMid}{' '}
                  <span className="text-xs font-normal">mm/10</span>
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  ASTM D217 (25 °C, 60 strokes)
                </div>
              </div>

              {/* Metric 3: Dropping Point */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Dropping Point (T1)', 'Titik Tetes (T1)', '滴点（グリース1）')}
                </span>
                <div className="font-mono text-lg font-bold text-[var(--md-on-surface)]">
                  {activeThickener1.droppingPointC === 'Non-Melting'
                    ? 'Non-Melting'
                    : `${activeThickener1.droppingPointC} °C`}
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  Max: {activeThickener1.maxContinuousTempC} °C
                </div>
              </div>

              {/* Metric 4: Compatibility Status */}
              <div className="glass-card space-y-1 rounded-[24px] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Mix Compatibility', 'Kompatibilitas Campuran', '混和適合性')}
                </span>
                <div
                  className="truncate text-sm font-bold"
                  style={{ color: compatResult.colorHex }}
                >
                  {compatResult.status}
                </div>
                <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                  ASTM D6185 Standard
                </div>
              </div>
            </div>
          )}

          {/* Educational Comparison / Reference Strip */}
          <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
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
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--md-outline-variant)]/50 text-[11px] text-[var(--md-on-surface-variant)]">
                      <th className="py-2 pr-3 font-semibold">Grade</th>
                      <th className="px-3 py-2 font-semibold">@ 20 °C</th>
                      <th className="px-3 py-2 font-semibold text-[var(--md-primary)]">
                        @ 40 °C (Ref)
                      </th>
                      <th className="px-3 py-2 font-semibold">@ 60 °C</th>
                      <th className="px-3 py-2 font-semibold">@ 80 °C</th>
                      <th className="py-2 pl-3 font-semibold">@ 100 °C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-outline-variant)]/35 font-mono">
                    {[32, 46, 68, 100, 150, 220, 320, 460].map((vg) => {
                      const isCurrent = vg === selectedIsoVg;
                      return (
                        <tr
                          key={vg}
                          className={
                            isCurrent
                              ? 'bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)]'
                              : 'text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-surface-container-high)]'
                          }
                        >
                          <td className="py-1.5 pr-3">ISO VG {vg}</td>
                          <td className="px-3 py-1.5">
                            {calculateViscosityAtTemp(vg, 20).toFixed(0)}
                          </td>
                          <td
                            className={`px-3 py-1.5 font-bold ${
                              isCurrent
                                ? 'text-[var(--md-on-primary-container)]'
                                : 'text-[var(--md-primary)]'
                            }`}
                          >
                            {vg}
                          </td>
                          <td className="px-3 py-1.5">
                            {calculateViscosityAtTemp(vg, 60).toFixed(1)}
                          </td>
                          <td className="px-3 py-1.5">
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
                      className={`rounded-[20px] border p-2.5 text-center transition-all ${
                        isCurrent
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30 shadow-2xs'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'
                      }`}
                    >
                      <div className="font-mono text-xs font-black">
                        NLGI {g.grade}
                      </div>
                      <div
                        className={`truncate text-[10px] font-semibold ${
                          isCurrent
                            ? 'text-[var(--md-on-primary-container)]'
                            : 'text-[var(--md-primary)]'
                        }`}
                      >
                        {g.workedPenetrationMid} mm/10
                      </div>
                      <div
                        className={`mt-1 line-clamp-1 text-[9px] ${
                          isCurrent
                            ? 'text-[var(--md-on-primary-container)]/80'
                            : 'text-[var(--md-on-surface-variant)]'
                        }`}
                      >
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
