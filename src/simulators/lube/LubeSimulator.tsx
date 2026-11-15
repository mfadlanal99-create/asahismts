import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Flame,
  Gauge,
  Microscope,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  BETA_5_OPTIONS,
  computeEhlFilm,
  computeGreaseRelubrication,
  computeIso4406,
  EQUIPMENT_LIST,
  EQUIPMENT_SPECS,
  evaluateLabReport,
  ISO_VG_LIST,
  type BearingType,
  type Beta5Value,
  type DiagnosisSeverity,
  type EquipmentId,
  type IsoVgGrade,
  type WearLevel,
} from './lubeData';
import { EhlFilmCanvas, StribeckCurveChart, ViscosityTempChart } from './LubeVisuals';

const SEVERITY_BADGE: Record<DiagnosisSeverity, string> = {
  normal:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  critical:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
};

const SEVERITY_LABEL: Record<DiagnosisSeverity, string> = {
  normal: 'Normal',
  warning: 'Caution',
  critical: 'Critical',
};

export function LubeSimulator() {
  const { pick } = useLanguage();
  const [equipmentId, setEquipmentId] = useState<EquipmentId>('helical-gearbox');
  const [selectedVg, setSelectedVg] = useState<IsoVgGrade>('VG 220');
  const [tempC, setTempC] = useState<number>(65);
  const [waterPpm, setWaterPpm] = useState<number>(120);
  const [wearLevel, setWearLevel] = useState<WearLevel>('normal');
  const [beta5, setBeta5] = useState<Beta5Value>(75);

  // Grease relubrication calculator state
  const [greaseD, setGreaseD] = useState<number>(130);
  const [greaseB, setGreaseB] = useState<number>(31);
  const [greaseRpm, setGreaseRpm] = useState<number>(1450);
  const [bearingType, setBearingType] = useState<BearingType>('ball');

  const equipment = EQUIPMENT_SPECS[equipmentId];

  const handleSelectEquipment = (id: EquipmentId) => {
    const spec = EQUIPMENT_SPECS[id];
    setEquipmentId(id);
    setSelectedVg(spec.recommendedVg);
    setTempC(Math.round((spec.optimalTempRange[0] + spec.optimalTempRange[1]) / 2));
    setWaterPpm(100);
    setWearLevel('normal');
    setGreaseD(spec.defaultGreaseD);
    setGreaseB(spec.defaultGreaseB);
    setGreaseRpm(spec.defaultRpm);
  };

  const applyPreset = (
    preset: 'healthy' | 'water' | 'thermal' | 'under-viscous',
  ) => {
    if (preset === 'healthy') {
      handleSelectEquipment('helical-gearbox');
    } else if (preset === 'water') {
      setEquipmentId('hydraulic-unit');
      setSelectedVg('VG 46');
      setTempC(52);
      setWaterPpm(1350);
      setWearLevel('elevated');
      setGreaseD(EQUIPMENT_SPECS['hydraulic-unit'].defaultGreaseD);
      setGreaseB(EQUIPMENT_SPECS['hydraulic-unit'].defaultGreaseB);
      setGreaseRpm(EQUIPMENT_SPECS['hydraulic-unit'].defaultRpm);
    } else if (preset === 'thermal') {
      setEquipmentId('worm-gear');
      setSelectedVg('VG 320');
      setTempC(102);
      setWaterPpm(250);
      setWearLevel('elevated');
      setGreaseD(EQUIPMENT_SPECS['worm-gear'].defaultGreaseD);
      setGreaseB(EQUIPMENT_SPECS['worm-gear'].defaultGreaseB);
      setGreaseRpm(EQUIPMENT_SPECS['worm-gear'].defaultRpm);
    } else if (preset === 'under-viscous') {
      setEquipmentId('pump-bearing');
      setSelectedVg('VG 32');
      setTempC(85);
      setWaterPpm(420);
      setWearLevel('severe');
      setGreaseD(EQUIPMENT_SPECS['pump-bearing'].defaultGreaseD);
      setGreaseB(EQUIPMENT_SPECS['pump-bearing'].defaultGreaseB);
      setGreaseRpm(EQUIPMENT_SPECS['pump-bearing'].defaultRpm);
    }
  };

  const ehl = useMemo(
    () => computeEhlFilm(equipment, selectedVg, tempC, waterPpm),
    [equipment, selectedVg, tempC, waterPpm],
  );

  const iso4406 = useMemo(
    () => computeIso4406(equipment, wearLevel, waterPpm, ehl.lambdaRatio, beta5),
    [equipment, wearLevel, waterPpm, ehl.lambdaRatio, beta5],
  );

  const labReport = useMemo(
    () =>
      evaluateLabReport(
        equipment,
        selectedVg,
        tempC,
        waterPpm,
        wearLevel,
        ehl,
        iso4406,
      ),
    [equipment, selectedVg, tempC, waterPpm, wearLevel, ehl, iso4406],
  );

  const greaseResult = useMemo(
    () =>
      computeGreaseRelubrication(
        greaseD,
        greaseB,
        greaseRpm,
        tempC,
        bearingType,
      ),
    [greaseD, greaseB, greaseRpm, tempC, bearingType],
  );

  return (
    <div className="space-y-5">
      {/* Top Scenario Presets + Equipment Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {pick(
                'Equipment & Lubricant Operating Conditions',
                'Kondisi Operasi Peralatan & Pelumas',
                '機器・潤滑油の運転条件',
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {equipment.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {pick('Fault Scenarios:', 'Skenario Gangguan:', '異常シナリオ:')}
            </span>
            <button
              type="button"
              onClick={() => applyPreset('healthy')}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10"
            >
              {pick('Healthy Gearbox', 'Gearbox Sehat', '正常減速機')}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('water')}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10"
            >
              {pick('Water Ingress', 'Masuknya Air', '水分混入')}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('thermal')}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10"
            >
              {pick('Thermal Overload', 'Beban Panas Berlebih', '過熱・熱酸化')}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('under-viscous')}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10"
            >
              {pick('Under-Viscous Bearing', 'Bantalan Kurang Kental', '低粘度軸受')}
            </button>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Equipment Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {pick('Equipment Type', 'Jenis Peralatan', '対象機器')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {EQUIPMENT_LIST.map((eq) => {
                const active = eq.id === equipmentId;
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => handleSelectEquipment(eq.id)}
                    className={`rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition ${
                      active
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs dark:border-amber-400/60 dark:bg-amber-500/15 dark:text-amber-200'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="truncate font-semibold">{eq.shortName}</div>
                    <div className="text-[10px] opacity-75">
                      Rec: {eq.recommendedVg}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ISO VG Grade Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {pick('ISO VG Viscosity Grade', 'Grade Viskositas ISO VG', 'ISO VG 粘度グレード')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ISO_VG_LIST.map((vg) => {
                const active = vg === selectedVg;
                const isRec = vg === equipment.recommendedVg;
                return (
                  <button
                    key={vg}
                    type="button"
                    onClick={() => setSelectedVg(vg)}
                    className={`relative rounded-lg border px-1.5 py-1.5 text-center text-xs font-semibold transition ${
                      active
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs dark:text-slate-950'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300'
                    }`}
                  >
                    {vg.replace('VG ', '')}
                    {isRec && (
                      <span
                        title="Recommended Grade"
                        className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                          active ? 'bg-emerald-300' : 'bg-emerald-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {pick(
                `Green dot = OEM recommended (${equipment.recommendedVg})`,
                `Titik hijau = rekomendasi OEM (${equipment.recommendedVg})`,
                `緑点 = OEM推奨 (${equipment.recommendedVg})`,
              )}
            </p>
          </div>

          {/* Temperature & Water Contamination Sliders */}
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pick('Operating Temp', 'Suhu Operasi', '運転油温')}
                </span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {tempC} °C
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={110}
                step={1}
                value={tempC}
                onChange={(e) => setTempC(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20 °C</span>
                <span>
                  Opt: {equipment.optimalTempRange[0]}–{equipment.optimalTempRange[1]} °C
                </span>
                <span>110 °C</span>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pick('Water Contamination', 'Kontaminasi Air', '水分混入量')}
                </span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                  {waterPpm} ppm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={25}
                value={waterPpm}
                onChange={(e) => setWaterPpm(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 ppm</span>
                <span>Limit: {equipment.waterLimitPpm} ppm</span>
                <span>2000 ppm</span>
              </div>
            </div>
          </div>

          {/* Wear Particle Level */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {pick('Wear Particle Level', 'Tingkat Partikel Keausan', '摩耗粉レベル')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'elevated', 'severe'] as WearLevel[]).map((lvl) => {
                const active = wearLevel === lvl;
                const lvlLabel =
                  lvl === 'normal'
                    ? pick('Normal', 'Normal', '正常')
                    : lvl === 'elevated'
                      ? pick('Elevated', 'Meningkat', '注意')
                      : pick('Severe', 'Parah', '危険');
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setWearLevel(lvl)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      active
                        ? lvl === 'normal'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : lvl === 'elevated'
                            ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                            : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300'
                    }`}
                  >
                    {lvlLabel}
                  </button>
                );
              })}
            </div>

            {/* Live Oil Oxidation & Remaining Useful Life (RUL %) Bar */}
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {pick('Oil Oxidation & RUL', 'Oksidasi Oli & Sisa Umur', '油酸化 & 残存寿命 (RUL)')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {labReport.estimatedOilLifePct}%
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_BADGE[labReport.overallHealth]}`}
                  >
                    {SEVERITY_LABEL[labReport.overallHealth]}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    labReport.estimatedOilLifePct >= 60
                      ? 'bg-emerald-500'
                      : labReport.estimatedOilLifePct >= 30
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${labReport.estimatedOilLifePct}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{pick('Arrhenius (+10°C = ½ life)', 'Arrhenius (+10°C = ½ umur)', 'アレニウス則 (+10°Cで寿命半減)')}</span>
                <span>~{Math.round(40 * labReport.estimatedOilLifePct).toLocaleString()} h {pick('drain', 'ganti', '交換目安')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Visuals Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ViscosityTempChart
          equipment={equipment}
          selectedVg={selectedVg}
          tempC={tempC}
          currentViscosity={ehl.viscosityCst}
        />
        <EhlFilmCanvas
          ehl={ehl}
          equipment={equipment}
          tempC={tempC}
          waterPpm={waterPpm}
          wearLevel={wearLevel}
          iso4406={iso4406}
          beta5={beta5}
        />
      </div>

      {/* Stribeck Curve */}
      <StribeckCurveChart lambdaRatio={ehl.lambdaRatio} regime={ehl.regime} />

      {/* Bottom Engineering Analysis Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 1. ISO 4406 Cleanliness Code */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {pick('ISO 4406 Cleanliness Code', 'Kode Kebersihan ISO 4406', 'ISO 4406 清浄度コード')}
              </h3>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                iso4406.status === 'clean'
                  ? SEVERITY_BADGE.normal
                  : iso4406.status === 'caution'
                    ? SEVERITY_BADGE.warning
                    : SEVERITY_BADGE.critical
              }`}
            >
              {iso4406.status === 'clean'
                ? pick('On Target', 'Sesuai Target', '目標達成')
                : iso4406.status === 'caution'
                  ? pick('Above Target', 'Di Atas Target', '目標超過')
                  : pick('Action Required', 'Perlu Tindakan', '要対策')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick('Actual Sample', 'Sampel Aktual', '実測サンプル')}
              </div>
              <div className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100">
                {iso4406.codeString}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick('Equipment Target', 'Target Peralatan', '機器目標')}
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {iso4406.targetString}
              </div>
            </div>
          </div>

          {/* Filtration Beta-Ratio Selector & Bearing Life Multiplier */}
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {pick('Filtration Beta-Ratio (β₅)', 'Rasio Beta Filtrasi (β₅)', 'フィルタ β₅ 値')}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${
                  iso4406.aIsoMultiplier >= 2.0
                    ? SEVERITY_BADGE.normal
                    : iso4406.aIsoMultiplier >= 1.0
                      ? SEVERITY_BADGE.warning
                      : SEVERITY_BADGE.critical
                }`}
              >
                a_ISO = {iso4406.aIsoMultiplier.toFixed(2)}× {pick('Life', 'Umur', '寿命')}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {BETA_5_OPTIONS.map((opt) => {
                const active = beta5 === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setBeta5(opt.value)}
                    className={`rounded-md border px-1.5 py-1 text-center transition ${
                      active
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs dark:text-slate-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-semibold">{opt.label}</div>
                    <div className="text-[9px] opacity-80">{opt.efficiencyPct}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/40">
              <span className="text-slate-600 dark:text-slate-300">
                ≥ 4 μm(c) (Code {iso4406.actual[0]})
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {iso4406.particles4um}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/40">
              <span className="text-slate-600 dark:text-slate-300">
                ≥ 6 μm(c) (Code {iso4406.actual[1]})
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {iso4406.particles6um}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/40">
              <span className="text-slate-600 dark:text-slate-300">
                ≥ 14 μm(c) (Code {iso4406.actual[2]})
              </span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                {iso4406.particles14um}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Used Oil Lab Report Diagnosis */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {pick('Used Oil Lab Report Diagnosis', 'Diagnosis Laporan Lab Oli Bekas', '使用油ラボ診断レポート')}
            </h3>
          </div>

          <div className="space-y-2.5">
            {labReport.flags.map((flag) => {
              const Icon =
                flag.id === 'water'
                  ? Droplets
                  : flag.id === 'viscosity'
                    ? Gauge
                    : flag.id === 'oxidation'
                      ? Flame
                      : AlertTriangle;
              return (
                <div
                  key={flag.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      {flag.title}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_BADGE[flag.severity]}`}
                    >
                      {flag.severity === 'normal' && (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      )}
                      {SEVERITY_LABEL[flag.severity]}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {flag.reading}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                    {flag.summary}
                  </p>
                  {flag.severity !== 'normal' && (
                    <p className="mt-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      Action: {flag.action}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Grease Relubrication Calculator */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {pick('Grease Relubrication Calculator', 'Kalkulator Pelumasan Ulang Gemuk', 'グリース補給量計算')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {pick('Bearing OD D (mm)', 'Diameter Luar D (mm)', '軸受外径 D (mm)')}
              </label>
              <input
                type="number"
                min={30}
                max={600}
                value={greaseD}
                onChange={(e) =>
                  setGreaseD(Math.max(30, Number(e.target.value) || 30))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {pick('Bearing Width B (mm)', 'Lebar Bantalan B (mm)', '軸受幅 B (mm)')}
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={greaseB}
                onChange={(e) =>
                  setGreaseB(Math.max(10, Number(e.target.value) || 10))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {pick('Shaft Speed (RPM)', 'Kecepatan Poros (RPM)', '軸回転数 (RPM)')}
              </label>
              <input
                type="number"
                min={100}
                max={6000}
                step={50}
                value={greaseRpm}
                onChange={(e) =>
                  setGreaseRpm(Math.max(100, Number(e.target.value) || 100))
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {pick('Bearing Type', 'Tipe Bantalan', '軸受タイプ')}
              </label>
              <select
                value={bearingType}
                onChange={(e) => setBearingType(e.target.value as BearingType)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="ball">Ball (K = 1.0)</option>
                <option value="cylindrical">Cyl. Roller (K = 0.5)</option>
                <option value="spherical">Spherical (K = 0.25)</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300">
                Grease Shot (G)
              </div>
              <div className="font-mono text-xl font-bold text-amber-700 dark:text-amber-200">
                {greaseResult.quantityGrams.toFixed(1)} g
              </div>
              <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                G = 0.005 · D · B
              </div>
            </div>
            <div>
              <div className="text-[11px] text-amber-800 dark:text-amber-300">
                Interval (t<sub>f</sub>)
              </div>
              <div className="font-mono text-xl font-bold text-amber-700 dark:text-amber-200">
                {greaseResult.intervalHours.toLocaleString()} h
              </div>
              <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80">
                Temp factor: {(greaseResult.tempFactor * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Interval halves every +15 °C above 70 °C (currently {tempC} °C). At{' '}
            {greaseResult.intervalHours.toLocaleString()} h, add{' '}
            {greaseResult.quantityGrams.toFixed(1)} g (~
            {Math.max(1, Math.round(greaseResult.quantityGrams / 1.5))} grease
            gun strokes).
          </p>
        </div>
      </div>
    </div>
  );
}
