/* oxlint-disable react/only-export-components */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Gauge,
  Info,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  computeIndentationGeometry,
  convertHardness,
  HARDNESS_SCALES,
  SPECIMEN_MATERIALS,
  type HardnessConversionResult,
  type HardnessScaleId,
  type HardnessTestLog,
  type IndentationGeometry,
  type SpecimenMaterialId,
  type TestStage,
} from './hardnessData';
import { HardnessMachineSvg } from './HardnessMachineSvg';

export { hardnessMeta } from './hardnessMeta';

export function HardnessSimulator() {
  const { pick } = useLanguage();

  // Test Configurations
  const [selectedScaleId, setSelectedScaleId] = useState<HardnessScaleId>('HRC');
  const [selectedMaterialId, setSelectedMaterialId] = useState<SpecimenMaterialId>('tool-steel-d2');
  const [dwellTimeSec, setDwellTimeSec] = useState<number>(10);
  const [isAutoCycle, setIsAutoCycle] = useState<boolean>(true);

  // Operational Machine State
  const [stage, setStage] = useState<TestStage>('idle');
  const [liveLoadKgf, setLiveLoadKgf] = useState<number>(0);
  const [dwellRemaining, setDwellRemaining] = useState<number>(10);
  const [measuredValue, setMeasuredValue] = useState<number | null>(null);

  // Test History Log
  const [testLogs, setTestLogs] = useState<HardnessTestLog[]>([]);

  // Timer reference for automated test sequence
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeScale = useMemo(() => HARDNESS_SCALES[selectedScaleId], [selectedScaleId]);
  const activeMaterial = useMemo(() => SPECIMEN_MATERIALS[selectedMaterialId], [selectedMaterialId]);

  // Nominal expected hardness for active material & scale
  const nominalHardness = useMemo(() => {
    return activeMaterial.baseValues[selectedScaleId];
  }, [activeMaterial, selectedScaleId]);

  // Live geometry
  const currentGeometry: IndentationGeometry = useMemo(() => {
    const val = measuredValue !== null ? measuredValue : nominalHardness;
    return computeIndentationGeometry(selectedScaleId, val);
  }, [selectedScaleId, measuredValue, nominalHardness]);

  // Current or measured conversion result
  const activeConversion: HardnessConversionResult = useMemo(() => {
    const val = measuredValue !== null ? measuredValue : nominalHardness;
    return convertHardness(selectedScaleId, val, activeMaterial.category === 'ferrous');
  }, [selectedScaleId, measuredValue, nominalHardness, activeMaterial]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
    };
  }, []);

  // Update default dwell when scale changes
  const handleScaleChange = useCallback((newScaleId: HardnessScaleId) => {
    setSelectedScaleId(newScaleId);
    setDwellTimeSec(HARDNESS_SCALES[newScaleId].defaultDwellSec);
    setDwellRemaining(HARDNESS_SCALES[newScaleId].defaultDwellSec);
    setStage('idle');
    setLiveLoadKgf(0);
    setMeasuredValue(null);
  }, []);

  // Update material
  const handleMaterialChange = useCallback((newMaterialId: SpecimenMaterialId) => {
    setSelectedMaterialId(newMaterialId);
    setStage('idle');
    setLiveLoadKgf(0);
    setMeasuredValue(null);
  }, []);

  // Log completion
  const recordTestResult = useCallback(
    (finalValue: number) => {
      const geom = computeIndentationGeometry(selectedScaleId, finalValue);
      const conv = convertHardness(selectedScaleId, finalValue, activeMaterial.category === 'ferrous');
      const isValid =
        finalValue >= activeScale.minRecommended && finalValue <= activeScale.maxRecommended;

      let statusNote = 'Standard valid test';
      if (!isValid) {
        statusNote =
          finalValue < activeScale.minRecommended
            ? `Below recommended range (${activeScale.minRecommended} ${activeScale.unit})`
            : `Above recommended range (${activeScale.maxRecommended} ${activeScale.unit})`;
      }

      const newEntry: HardnessTestLog = {
        id: `HT-${Date.now().toString().slice(-5)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        scale: selectedScaleId,
        materialId: selectedMaterialId,
        materialName: activeMaterial.name,
        appliedLoadKgf: activeScale.totalLoadKgf,
        dwellSec: dwellTimeSec,
        measuredHardness: Number(finalValue.toFixed(1)),
        geometry: geom,
        conversions: conv,
        validScale: isValid,
        statusNote,
      };

      setTestLogs((prev) => [newEntry, ...prev.slice(0, 19)]);
    },
    [selectedScaleId, selectedMaterialId, activeMaterial, activeScale, dwellTimeSec]
  );

  // Stop & Reset
  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
    setStage('idle');
    setLiveLoadKgf(0);
    setDwellRemaining(dwellTimeSec);
    setMeasuredValue(null);
  }, [dwellTimeSec]);

  // Major load transition handler
  const proceedToMajorLoad = useCallback(() => {
    setStage('major_load');
    setLiveLoadKgf(activeScale.totalLoadKgf);

    // After loading delay, enter dwelling
    timerRef.current = setTimeout(() => {
      setStage('dwelling');
      setDwellRemaining(dwellTimeSec);

      let countdown = dwellTimeSec;
      dwellIntervalRef.current = setInterval(() => {
        countdown -= 1;
        setDwellRemaining(countdown);
        if (countdown <= 0) {
          if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);

          // Proceed to Unloading
          setStage('unloading');
          setLiveLoadKgf(activeScale.minorLoadKgf);

          timerRef.current = setTimeout(() => {
            // Measuring & reading
            setStage('measuring');

            timerRef.current = setTimeout(() => {
              // Add slight Gaussian measurement variation (+/- 0.3%)
              const jitter = (Math.random() - 0.5) * 0.4;
              const result = Math.max(0, Number((nominalHardness + jitter).toFixed(1)));
              setMeasuredValue(result);
              setStage('completed');
              recordTestResult(result);
            }, 800);
          }, 900);
        }
      }, 1000);
    }, 1200);
  }, [activeScale, dwellTimeSec, nominalHardness, recordTestResult]);

  // Start Automated Cycle
  const handleStartCycle = useCallback(() => {
    handleReset();
    setStage('elevating');
    setLiveLoadKgf(2);

    timerRef.current = setTimeout(() => {
      // Minor Load / Preload
      const minorLoad = activeScale.minorLoadKgf > 0 ? activeScale.minorLoadKgf : 10;
      setStage('minor_load');
      setLiveLoadKgf(minorLoad);

      if (isAutoCycle) {
        timerRef.current = setTimeout(() => {
          proceedToMajorLoad();
        }, 1500);
      }
    }, 1200);
  }, [activeScale, isAutoCycle, handleReset, proceedToMajorLoad]);

  // Clear log table
  const handleClearLogs = useCallback(() => {
    setTestLogs([]);
  }, []);

  // Export CSV
  const handleExportCsv = useCallback(() => {
    if (testLogs.length === 0) return;
    const headers = [
      'ID',
      'Timestamp',
      'Scale',
      'Material',
      'Load (kgf)',
      'Dwell (s)',
      'Hardness Result',
      'Depth h (um)',
      'Diameter d (mm)',
      'Equiv HRC',
      'Equiv HRB',
      'Equiv HBW',
      'Equiv HV',
      'Est UTS (MPa)',
      'Status',
    ];
    const rows = testLogs.map((log) => [
      log.id,
      log.timestamp,
      log.scale,
      `"${log.materialName}"`,
      log.appliedLoadKgf,
      log.dwellSec,
      log.measuredHardness,
      (log.geometry.depthMm * 1000).toFixed(1),
      log.geometry.diameterMm.toFixed(3),
      log.conversions.HRC.value || 'N/A',
      log.conversions.HRB.value || 'N/A',
      log.conversions.HBW.value || 'N/A',
      log.conversions.HV.value || 'N/A',
      log.conversions.utsMpa.value || 'N/A',
      `"${log.statusNote}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hardness_Test_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [testLogs]);

  // Scale validity check for active material
  const isScaleRecommended = activeMaterial.recommendedScale === selectedScaleId;
  const isScaleOutOfRange =
    nominalHardness < activeScale.minRecommended || nominalHardness > activeScale.maxRecommended;

  return (
    <div className="flex flex-col gap-5">
      {/* Compact Material 3 Status Bar (replaces duplicate h1 banner) */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-xs font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-sm">
              {pick(
                'ASTM Indentation Metrology & Cycle Control',
                'Metrologi Uji Kekerasan & Kontrol Siklus Otomatis',
                'ASTM 圧痕硬さ計測＆自動負荷シーケンス'
              )}
            </div>
            <div className="text-[11px] text-[var(--md-on-surface-variant)]">
              {activeScale.standard} · ASTM E140 Scale Equivalence
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-primary-container)] px-3.5 py-1.5 text-xs font-bold text-[var(--md-on-primary-container)]">
            <Gauge className="h-3.5 w-3.5" />
            {activeScale.fullName}
          </span>
          <span className="rounded-full bg-[var(--md-secondary-container)] px-3 py-1.5 font-mono text-xs font-bold text-[var(--md-on-secondary-container)]">
            {activeScale.totalLoadKgf} kgf
          </span>
        </div>
      </div>

      {/* Main Simulator Grid (lg:grid-cols-12) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: Industrial Machine SVG CAD View (lg:col-span-7) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div data-tour="hardness-machine" className="glass-panel flex flex-col overflow-hidden rounded-[28px] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--md-primary)] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                  {pick('C-Frame Machine & Optical Inset', 'Mesin C-Frame & Inset Optik', 'Cフレーム試験機＆光学インセット')}
                </span>
              </div>
              <span className="rounded-full bg-[var(--md-surface-container-high)] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                {activeScale.standard}
              </span>
            </div>

            {/* SVG Machine Component */}
            <div className="flex w-full items-center justify-center">
              <HardnessMachineSvg
                scaleConfig={activeScale}
                material={activeMaterial}
                stage={stage}
                liveLoadKgf={liveLoadKgf}
                dwellRemainingSec={dwellRemaining}
                totalDwellSec={dwellTimeSec}
                measuredValue={measuredValue}
                geometry={currentGeometry}
                onStartCycle={handleStartCycle}
                onApplyMajor={proceedToMajorLoad}
                onReset={handleReset}
              />
            </div>

            {/* Machine Interactive Guidance Strip */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container)] p-3 text-xs text-[var(--md-on-surface-variant)]">
              <div className="flex items-center gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
                <span>
                  {stage === 'idle'
                    ? pick(
                        'Click START on the machine panel or sidebar to initiate automatic Minor/Major loading sequence.',
                        'Klik START pada panel mesin atau bilah kontrol untuk memulai pembebanan.',
                        '試験機パネルまたはサイドバーの「START」をクリックして試験を開始します。'
                      )
                    : stage === 'minor_load' && !isAutoCycle
                    ? pick(
                        'Minor preload established (10 kgf). Click APPLY MAJOR LOAD to trigger full test force.',
                        'Beban awal tercapai (10 kgf). Klik APPLY MAJOR LOAD untuk pembebanan penuh.',
                        '初荷重10 kgfが安定。APPLY MAJORをクリックして主荷重を負荷してください。'
                      )
                    : stage === 'dwelling'
                    ? pick(
                        `Holding under major load (${dwellRemaining}s remaining). Measuring creep / plastic deformation.`,
                        `Menahan beban utama (sisa ${dwellRemaining} detik). Mengukur deformasi plastis.`,
                        `試験荷重保持中（残り${dwellRemaining}秒）。塑性変形を安定化させています。`
                      )
                    : stage === 'completed'
                    ? pick(
                        `Hardness readout verified: ${measuredValue?.toFixed(1)} ${activeScale.unit}. Recorded in test log.`,
                        `Hasil kekerasan terverifikasi: ${measuredValue?.toFixed(1)} ${activeScale.unit}. Tersimpan di log.`,
                        `硬さ指示値確認: ${measuredValue?.toFixed(1)} ${activeScale.unit}。ログに記録完了。`
                      )
                    : pick(
                        'Machine cycle in progress...',
                        'Siklus pengujian sedang berlangsung...',
                        '試験サイクル実行中...'
                      )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Controls & ASTM E140 Conversion Card (lg:col-span-5) */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          {/* Test Setup Controls Card */}
          <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--md-on-surface)]">
                <Layers className="h-4 w-4 text-[var(--md-primary)]" />
                <span>{pick('Test Parameters', 'Parameter Pengujian', '試験条件設定')}</span>
              </div>
              <span className="font-mono text-xs font-semibold text-[var(--md-primary)]">
                {activeScale.totalLoadKgf} kgf
              </span>
            </div>

            {/* 1. Scale Selector (HRC, HRB, HBW, HV) */}
            <div data-tour="hardness-scale" className="space-y-2">
              <label className="text-xs font-bold text-[var(--md-on-surface)]">
                {pick('Hardness Scale & Indenter Method', 'Metode & Skala Kekerasan', '硬さスケール・圧子方式')}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(HARDNESS_SCALES) as HardnessScaleId[]).map((scaleId) => {
                  const s = HARDNESS_SCALES[scaleId];
                  const isSelected = selectedScaleId === scaleId;
                  return (
                    <button
                      key={scaleId}
                      type="button"
                      onClick={() => handleScaleChange(scaleId)}
                      className={`flex flex-col items-start rounded-[20px] border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`text-xs font-extrabold ${
                            isSelected
                              ? 'text-[var(--md-on-primary-container)]'
                              : 'text-[var(--md-on-surface)]'
                          }`}
                        >
                          {s.id}
                        </span>
                        <span className="font-mono text-[10px] font-semibold opacity-80">
                          {s.totalLoadKgf} kgf
                        </span>
                      </div>
                      <span className="mt-0.5 w-full truncate text-[11px] opacity-90">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Material Specimen Selector */}
            <div data-tour="hardness-specimen" className="space-y-2">
              <label className="text-xs font-bold text-[var(--md-on-surface)]">
                {pick('Specimen Material', 'Material Benda Uji', '試験片材質')}
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => handleMaterialChange(e.target.value as SpecimenMaterialId)}
                className="w-full rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2.5 text-xs font-medium text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              >
                {(Object.keys(SPECIMEN_MATERIALS) as SpecimenMaterialId[]).map((matId) => {
                  const m = SPECIMEN_MATERIALS[matId];
                  return (
                    <option key={matId} value={matId}>
                      {m.name} ({m.category === 'ferrous' ? 'Ferrous' : 'Non-Ferrous'})
                    </option>
                  );
                })}
              </select>

              {/* Material Recommendation or Out-of-Range warning */}
              {isScaleOutOfRange ? (
                <div className="flex items-start gap-2 rounded-2xl border border-amber-300/60 bg-amber-50/80 p-3 text-[11px] text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {pick(
                      `Warning: ${activeMaterial.name} is outside the recommended ${activeScale.id} range (${activeScale.minRecommended}–${activeScale.maxRecommended} ${activeScale.unit}). Consider using ${activeMaterial.recommendedScale}.`,
                      `Peringatan: ${activeMaterial.name} berada di luar rentang ideal ${activeScale.id}. Dianjurkan memakai ${activeMaterial.recommendedScale}.`,
                      `警告: ${activeMaterial.name} は ${activeScale.id} の推奨測定範囲外です。${activeMaterial.recommendedScale} の使用を推奨します。`
                    )}
                  </span>
                </div>
              ) : isScaleRecommended ? (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/60 bg-emerald-50/80 p-3 text-[11px] font-medium text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {pick(
                      `Optimal scale for ${activeMaterial.name} per ASTM guidelines.`,
                      `Skala standar optimal untuk ${activeMaterial.name} sesuai ASTM.`,
                      `ASTM推奨基準に合致した最適硬さスケールです。`
                    )}
                  </span>
                </div>
              ) : null}
            </div>

            {/* 3. Dwell Time Slider & Auto-Cycle Switch */}
            <div data-tour="hardness-dwell" className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-[var(--md-on-surface)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--md-on-surface-variant)]" />
                    {pick('Dwell Time', 'Waktu Dwell', '荷重保持時間')}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[var(--md-primary)]">
                    {dwellTimeSec}s
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={dwellTimeSec}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDwellTimeSec(val);
                    if (stage === 'idle') setDwellRemaining(val);
                  }}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-[var(--md-on-surface)]">
                  {pick('Cycle Mode', 'Mode Siklus', '動作モード')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAutoCycle(!isAutoCycle)}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    isAutoCycle
                      ? 'border-[var(--md-primary)]/40 bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isAutoCycle
                    ? pick('Auto Full Cycle', 'Otomatis Penuh', '全自動シーケンス')
                    : pick('Manual Stepping', 'Langkah Manual', '手動ステップ')}
                </button>
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div data-tour="hardness-cycle" className="flex items-center gap-2 border-t border-[var(--md-outline-variant)]/50 pt-3">
              <button
                type="button"
                onClick={handleStartCycle}
                disabled={stage !== 'idle' && stage !== 'completed'}
                className="m3-btn-filled flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold disabled:opacity-45"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {pick('Start Test Cycle', 'Mulai Siklus Pengujian', '試験サイクル開始')}
              </button>

              {stage === 'minor_load' && !isAutoCycle && (
                <button
                  type="button"
                  onClick={proceedToMajorLoad}
                  className="m3-btn-tonal flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold"
                >
                  {pick('Apply Major Load', 'Beban Utama', '主荷重付加')}
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="glass-pill flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {pick('Reset', 'Reset', 'リセット')}
              </button>
            </div>
          </div>

          {/* ASTM E140 Conversion Card */}
          <div data-tour="hardness-e140" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-[var(--md-outline-variant)]/50 pb-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--md-on-surface)]">
                <FileSpreadsheet className="h-4 w-4 text-[var(--md-primary)]" />
                <span>{pick('ASTM E140 Conversion Equivalent', 'Konversi Standar ASTM E140', 'ASTM E140 硬さ換算・引張強さ')}</span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                ASTM E140 Tab. 1
              </span>
            </div>

            <p className="text-[11px] text-[var(--md-on-surface-variant)]">
              {pick(
                'Approximate equivalent values for non-austenitic steels & structural alloys based on ASTM E140 empirical tables.',
                'Perkiraan nilai ekuivalen berdasarkan tabel empiris ASTM E140 untuk baja paduan non-austenitik.',
                'ASTM E140規格に基づく非オーステナイト系鋼・構造用金属の経験的相互換算値です。'
              )}
            </p>

            {/* Equivalence Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {/* HRC */}
              <div
                className={`flex flex-col items-center rounded-[20px] border p-2.5 ${
                  selectedScaleId === 'HRC'
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                    : 'border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">HRC</span>
                <span className="text-base font-extrabold">
                  {activeConversion.HRC.value > 0 ? activeConversion.HRC.value : '—'}
                </span>
                <span className="text-center text-[9px] opacity-75">
                  {activeConversion.HRC.valid ? 'Standard' : 'Out of range'}
                </span>
              </div>

              {/* HRB */}
              <div
                className={`flex flex-col items-center rounded-[20px] border p-2.5 ${
                  selectedScaleId === 'HRB'
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                    : 'border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">HRB</span>
                <span className="text-base font-extrabold">
                  {activeConversion.HRB.value > 0 ? activeConversion.HRB.value : '—'}
                </span>
                <span className="text-center text-[9px] opacity-75">
                  {activeConversion.HRB.valid ? 'Standard' : 'Out of range'}
                </span>
              </div>

              {/* HBW */}
              <div
                className={`flex flex-col items-center rounded-[20px] border p-2.5 ${
                  selectedScaleId === 'HBW'
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                    : 'border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">HBW</span>
                <span className="text-base font-extrabold">
                  {activeConversion.HBW.value > 0 ? activeConversion.HBW.value : '—'}
                </span>
                <span className="text-center text-[9px] opacity-75">10/3000 kgf</span>
              </div>

              {/* HV */}
              <div
                className={`flex flex-col items-center rounded-[20px] border p-2.5 ${
                  selectedScaleId === 'HV'
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
                    : 'border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">HV</span>
                <span className="text-base font-extrabold">
                  {activeConversion.HV.value > 0 ? activeConversion.HV.value : '—'}
                </span>
                <span className="text-center text-[9px] opacity-75">HV 30</span>
              </div>
            </div>

            {/* Estimated Ultimate Tensile Strength (UTS) Banner */}
            <div className="flex items-center justify-between rounded-[22px] border border-[var(--md-outline-variant)]/45 bg-[var(--md-secondary-container)] p-3.5 text-[var(--md-on-secondary-container)]">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-[var(--md-primary)]" />
                <div>
                  <div className="text-xs font-bold">
                    {pick('Estimated Tensile Strength (UTS)', 'Perkiraan Kekuatan Tarik (UTS)', '推定引張強さ（UTS）')}
                  </div>
                  <div className="text-[10px] opacity-80">
                    UTS ≈ 3.45 × HBW (ASTM E140)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-extrabold text-[var(--md-primary)]">
                  {activeConversion.utsMpa.value} MPa
                </div>
                <div className="font-mono text-[10px] opacity-80">
                  {Math.round(activeConversion.utsMpa.value * 0.145038)} ksi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Log Table Card */}
      <div data-tour="hardness-log" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--md-on-surface)]">
              {pick('Hardness Inspection Log', 'Log Pengujian Kekerasan', '硬さ測定検査ログ')}
            </span>
            <span className="rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 font-mono text-xs font-bold text-[var(--md-on-primary-container)]">
              {testLogs.length} {pick('runs', 'pengujian', '回')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={testLogs.length === 0}
              className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              {pick('Export CSV', 'Ekspor CSV', 'CSV出力')}
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              disabled={testLogs.length === 0}
              className="glass-pill flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 dark:hover:border-rose-500/40 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {pick('Clear', 'Hapus', 'クリア')}
            </button>
          </div>
        </div>

        {testLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--md-on-surface-variant)]">
            {pick(
              'No tests performed yet. Select scale & material, then click Start Cycle.',
              'Belum ada riwayat pengujian. Pilih skala & benda uji, lalu tekan Mulai.',
              '測定履歴はありません。スケールと試験片を選択して試験を開始してください。'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--md-outline-variant)]/50 text-[var(--md-on-surface-variant)]">
                  <th className="px-2 py-2.5 font-bold">#ID</th>
                  <th className="px-2 py-2.5 font-bold">{pick('Time', 'Waktu', '時刻')}</th>
                  <th className="px-2 py-2.5 font-bold">{pick('Scale', 'Skala', '尺度')}</th>
                  <th className="px-2 py-2.5 font-bold">{pick('Material', 'Material', '材質')}</th>
                  <th className="px-2 py-2.5 text-right font-bold">{pick('Load', 'Beban', '荷重')}</th>
                  <th className="px-2 py-2.5 text-right font-bold">{pick('Hardness', 'Nilai', '硬さ値')}</th>
                  <th className="px-2 py-2.5 text-right font-bold">{pick('Depth h', 'Kedalaman', '深さh')}</th>
                  <th className="px-2 py-2.5 text-right font-bold">{pick('Equiv HV', 'Ekiv HV', 'HV換算')}</th>
                  <th className="px-2 py-2.5 text-right font-bold">{pick('Est UTS', 'Est UTS', '推定UTS')}</th>
                  <th className="px-2 py-2.5 font-bold">{pick('Status', 'Status', '判定')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-outline-variant)]/35 font-mono">
                {testLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-[var(--md-surface-container-high)]">
                    <td className="px-2 py-2.5 font-semibold text-[var(--md-on-surface)]">{log.id}</td>
                    <td className="px-2 py-2.5 text-[var(--md-on-surface-variant)]">{log.timestamp}</td>
                    <td className="px-2 py-2.5">
                      <span className="font-bold text-[var(--md-primary)]">{log.scale}</span>
                    </td>
                    <td className="max-w-[140px] truncate px-2 py-2.5 font-sans text-[var(--md-on-surface)]">
                      {log.materialName}
                    </td>
                    <td className="px-2 py-2.5 text-right text-[var(--md-on-surface-variant)]">
                      {log.appliedLoadKgf} kgf
                    </td>
                    <td className="px-2 py-2.5 text-right font-bold text-[var(--md-on-surface)]">
                      {log.measuredHardness} {log.scale}
                    </td>
                    <td className="px-2 py-2.5 text-right text-[var(--md-on-surface-variant)]">
                      {(log.geometry.depthMm * 1000).toFixed(1)} µm
                    </td>
                    <td className="px-2 py-2.5 text-right text-[var(--md-on-surface-variant)]">
                      {log.conversions.HV.value} HV
                    </td>
                    <td className="px-2 py-2.5 text-right font-bold text-[var(--md-primary)]">
                      {log.conversions.utsMpa.value} MPa
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] font-bold ${
                          log.validScale
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {log.validScale ? 'VALID' : 'OUT-RANGE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
