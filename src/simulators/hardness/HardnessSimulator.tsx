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
      {/* Header Banner */}
      <div className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <Target className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {pick(
                'Rockwell, Brinell & Vickers Hardness Tester',
                'Penguji Kekerasan Rockwell, Brinell & Vickers',
                'ロックウェル・ブリネル・ビッカース硬さ試験機'
              )}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {pick(
              'ASTM E18, ASTM E10 & ASTM E92 standardized indentation metrology with automated loading cycle & ASTM E140 multi-scale conversions.',
              'Metrologi uji kekerasan ASTM E18, E10 & E92 dengan siklus pembebanan terintegrasi dan tabel konversi ASTM E140.',
              'ASTM E18 / E10 / E92に準拠した圧痕硬さ試験およびASTM E140多尺度換算シミュレータ。'
            )}
          </p>
        </div>

        {/* Quick status pill */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Gauge className="h-3.5 w-3.5" />
            {activeScale.fullName}
          </span>
        </div>
      </div>

      {/* Main Simulator Grid (lg:grid-cols-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sim-equal-grid">
        {/* Left Column: Industrial Machine SVG CAD View (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel flex flex-col overflow-hidden rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-foreground uppercase">
                  {pick('C-Frame Machine & Optical Inset', 'Mesin C-Frame & Inset Optik', 'Cフレーム試験機＆光学インセット')}
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-rose-500 shrink-0" />
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
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Test Setup Controls Card */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Layers className="h-4 w-4 text-rose-500" />
                <span>{pick('Test Parameters', 'Parameter Pengujian', '試験条件設定')}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {activeScale.totalLoadKgf} kgf
              </span>
            </div>

            {/* 1. Scale Selector (HRC, HRB, HBW, HV) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {pick('Hardness Scale & Indenter Method', 'Metode & Skala Kekerasan', '硬さスケール・圧子方式')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(HARDNESS_SCALES) as HardnessScaleId[]).map((scaleId) => {
                  const s = HARDNESS_SCALES[scaleId];
                  const isSelected = selectedScaleId === scaleId;
                  return (
                    <button
                      key={scaleId}
                      type="button"
                      onClick={() => handleScaleChange(scaleId)}
                      className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/10 text-foreground font-medium ring-1 ring-rose-500/30'
                          : 'border-border/70 hover:border-border bg-background/50 text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-foreground">{s.id}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {s.totalLoadKgf} kgf
                        </span>
                      </div>
                      <span className="text-[11px] truncate w-full">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Material Specimen Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {pick('Specimen Material', 'Material Benda Uji', '試験片材質')}
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => handleMaterialChange(e.target.value as SpecimenMaterialId)}
                className="w-full rounded-lg border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 p-2 text-[11px] text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    {pick(
                      `Warning: ${activeMaterial.name} is outside the recommended ${activeScale.id} range (${activeScale.minRecommended}–${activeScale.maxRecommended} ${activeScale.unit}). Consider using ${activeMaterial.recommendedScale}.`,
                      `Peringatan: ${activeMaterial.name} berada di luar rentang ideal ${activeScale.id}. Dianjurkan memakai ${activeMaterial.recommendedScale}.`,
                      `警告: ${activeMaterial.name} は ${activeScale.id} の推奨測定範囲外です。${activeMaterial.recommendedScale} の使用を推奨します。`
                    )}
                  </span>
                </div>
              ) : isScaleRecommended ? (
                <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 p-2 text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {pick('Dwell Time', 'Waktu Dwell', '荷重保持時間')}
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-500">{dwellTimeSec}s</span>
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
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-foreground block">
                  {pick('Cycle Mode', 'Mode Siklus', '動作モード')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAutoCycle(!isAutoCycle)}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isAutoCycle
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-500'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  {isAutoCycle ? pick('Auto Full Cycle', 'Otomatis Penuh', '全自動シーケンス') : pick('Manual Stepping', 'Langkah Manual', '手動ステップ')}
                </button>
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={handleStartCycle}
                disabled={stage !== 'idle' && stage !== 'completed'}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-2 px-3 text-xs font-semibold shadow-sm transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {pick('Start Test Cycle', 'Mulai Siklus Pengujian', '試験サイクル開始')}
              </button>

              {stage === 'minor_load' && !isAutoCycle && (
                <button
                  type="button"
                  onClick={proceedToMajorLoad}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 text-xs font-semibold shadow-sm transition-all"
                >
                  {pick('Apply Major Load', 'Beban Utama', '主荷重付加')}
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground py-2 px-3 text-xs font-medium transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {pick('Reset', 'Reset', 'リセット')}
              </button>
            </div>
          </div>

          {/* ASTM E140 Conversion Card */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileSpreadsheet className="h-4 w-4 text-rose-500" />
                <span>{pick('ASTM E140 Conversion Equivalent', 'Konversi Standar ASTM E140', 'ASTM E140 硬さ換算・引張強さ')}</span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">ASTM E140 Tab. 1</span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {pick(
                'Approximate equivalent values for non-austenitic steels & structural alloys based on ASTM E140 empirical tables.',
                'Perkiraan nilai ekuivalen berdasarkan tabel empiris ASTM E140 untuk baja paduan non-austenitik.',
                'ASTM E140規格に基づく非オーステナイト系鋼・構造用金属の経験的相互換算値です。'
              )}
            </p>

            {/* Equivalence Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* HRC */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center ${
                  selectedScaleId === 'HRC'
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-border/60 bg-muted/20'
                }`}
              >
                <span className="text-[10px] font-mono text-muted-foreground">HRC</span>
                <span className="text-base font-bold text-foreground">
                  {activeConversion.HRC.value > 0 ? activeConversion.HRC.value : '—'}
                </span>
                <span className="text-[9px] text-muted-foreground text-center">
                  {activeConversion.HRC.valid ? 'Standard' : 'Out of range'}
                </span>
              </div>

              {/* HRB */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center ${
                  selectedScaleId === 'HRB'
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-border/60 bg-muted/20'
                }`}
              >
                <span className="text-[10px] font-mono text-muted-foreground">HRB</span>
                <span className="text-base font-bold text-foreground">
                  {activeConversion.HRB.value > 0 ? activeConversion.HRB.value : '—'}
                </span>
                <span className="text-[9px] text-muted-foreground text-center">
                  {activeConversion.HRB.valid ? 'Standard' : 'Out of range'}
                </span>
              </div>

              {/* HBW */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center ${
                  selectedScaleId === 'HBW'
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-border/60 bg-muted/20'
                }`}
              >
                <span className="text-[10px] font-mono text-muted-foreground">HBW</span>
                <span className="text-base font-bold text-foreground">
                  {activeConversion.HBW.value > 0 ? activeConversion.HBW.value : '—'}
                </span>
                <span className="text-[9px] text-muted-foreground text-center">10/3000 kgf</span>
              </div>

              {/* HV */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center ${
                  selectedScaleId === 'HV'
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-border/60 bg-muted/20'
                }`}
              >
                <span className="text-[10px] font-mono text-muted-foreground">HV</span>
                <span className="text-base font-bold text-foreground">
                  {activeConversion.HV.value > 0 ? activeConversion.HV.value : '—'}
                </span>
                <span className="text-[9px] text-muted-foreground text-center">HV 30</span>
              </div>
            </div>

            {/* Estimated Ultimate Tensile Strength (UTS) Banner */}
            <div className="flex items-center justify-between rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-rose-500" />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    {pick('Estimated Tensile Strength (UTS)', 'Perkiraan Kekuatan Tarik (UTS)', '推定引張強さ（UTS）')}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    UTS ≈ 3.45 × HBW (ASTM E140)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold font-mono text-rose-500">
                  {activeConversion.utsMpa.value} MPa
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {Math.round(activeConversion.utsMpa.value * 0.145038)} ksi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Log Table Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {pick('Hardness Inspection Log', 'Log Pengujian Kekerasan', '硬さ測定検査ログ')}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
              {testLogs.length} {pick('runs', 'pengujian', '回')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={testLogs.length === 0}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <Download className="h-3 w-3" />
              {pick('Export CSV', 'Ekspor CSV', 'CSV出力')}
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              disabled={testLogs.length === 0}
              className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              {pick('Clear', 'Hapus', 'クリア')}
            </button>
          </div>
        </div>

        {testLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
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
                <tr className="border-b border-border/60 text-muted-foreground">
                  <th className="py-2 px-2 font-medium">#ID</th>
                  <th className="py-2 px-2 font-medium">{pick('Time', 'Waktu', '時刻')}</th>
                  <th className="py-2 px-2 font-medium">{pick('Scale', 'Skala', '尺度')}</th>
                  <th className="py-2 px-2 font-medium">{pick('Material', 'Material', '材質')}</th>
                  <th className="py-2 px-2 font-medium text-right">{pick('Load', 'Beban', '荷重')}</th>
                  <th className="py-2 px-2 font-medium text-right">{pick('Hardness', 'Nilai', '硬さ値')}</th>
                  <th className="py-2 px-2 font-medium text-right">{pick('Depth h', 'Kedalaman', '深さh')}</th>
                  <th className="py-2 px-2 font-medium text-right">{pick('Equiv HV', 'Ekiv HV', 'HV換算')}</th>
                  <th className="py-2 px-2 font-medium text-right">{pick('Est UTS', 'Est UTS', '推定UTS')}</th>
                  <th className="py-2 px-2 font-medium">{pick('Status', 'Status', '判定')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {testLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="py-2 px-2 text-foreground font-semibold">{log.id}</td>
                    <td className="py-2 px-2 text-muted-foreground">{log.timestamp}</td>
                    <td className="py-2 px-2">
                      <span className="font-bold text-rose-500">{log.scale}</span>
                    </td>
                    <td className="py-2 px-2 font-sans text-foreground truncate max-w-[140px]">
                      {log.materialName}
                    </td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {log.appliedLoadKgf} kgf
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-foreground">
                      {log.measuredHardness} {log.scale}
                    </td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {(log.geometry.depthMm * 1000).toFixed(1)} µm
                    </td>
                    <td className="py-2 px-2 text-right text-muted-foreground">
                      {log.conversions.HV.value} HV
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-rose-500">
                      {log.conversions.utsMpa.value} MPa
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans ${
                          log.validScale
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
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
