import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Crosshair,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Wrench,
} from 'lucide-react';
import {
  ALIGNMENT_PRESETS,
  DEFAULT_GEOMETRY,
  MOTOR_FEET,
  ZERO_CORRECTIONS,
  ZERO_SOFT_FOOT_SHIMS,
  getResidualSoftFootMm,
  solveAlignment,
} from './alignmentMath';
import type {
  MachineGeometry,
  MeasurementView,
  MisalignmentState,
  MotorFoot,
  UserCorrections,
} from './alignmentTypes';
import {
  AlignmentRigSvg,
  AnalogDialGauge,
  LaserAlignmentPanel,
} from './DialGaugeSvg';

const CARDINAL_ANGLES = [
  { label: '0° (12:00)', deg: 0 },
  { label: '90° (3:00)', deg: 90 },
  { label: '180° (6:00)', deg: 180 },
  { label: '270° (9:00)', deg: 270 },
];

const RPM_OPTIONS: MachineGeometry['rpm'][] = [1000, 1500, 1800, 3000, 3600];

export function AlignmentSimulator() {
  const { pick } = useLanguage();
  const [activePresetId, setActivePresetId] = useState<string>(
    ALIGNMENT_PRESETS[2].id
  );
  const [geometry, setGeometry] = useState<MachineGeometry>(DEFAULT_GEOMETRY);
  const [misalignment, setMisalignment] = useState<MisalignmentState>(
    () => ({ ...ALIGNMENT_PRESETS[2].state })
  );
  const [corrections, setCorrections] = useState<UserCorrections>(
    ZERO_CORRECTIONS
  );
  const [shaftAngleDeg, setShaftAngleDeg] = useState<number>(180);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [measurementView, setMeasurementView] =
    useState<MeasurementView>('dial');
  const [loosenedFoot, setLoosenedFoot] = useState<MotorFoot | null>('FL');
  const [softFootShims, setSoftFootShims] = useState<Record<MotorFoot, number>>(
    () => ({ ...ZERO_SOFT_FOOT_SHIMS })
  );

  useEffect(() => {
    if (!isRotating) return;
    const id = window.setInterval(() => {
      setShaftAngleDeg((prev) => (prev + 3) % 360);
    }, 30);
    return () => window.clearInterval(id);
  }, [isRotating]);

  const solution = useMemo(
    () =>
      solveAlignment(
        geometry,
        misalignment,
        corrections,
        shaftAngleDeg,
        softFootShims
      ),
    [geometry, misalignment, corrections, shaftAngleDeg, softFootShims]
  );

  const maxResidualSoftFoot = Math.max(
    ...MOTOR_FEET.map((f) =>
      getResidualSoftFootMm(f.id, misalignment, softFootShims)
    )
  );

  const selectPreset = (presetId: string) => {
    const preset =
      ALIGNMENT_PRESETS.find((p) => p.id === presetId) ?? ALIGNMENT_PRESETS[0];
    setActivePresetId(preset.id);
    setMisalignment({ ...preset.state });
    setCorrections(ZERO_CORRECTIONS);
    setSoftFootShims({ ...ZERO_SOFT_FOOT_SHIMS });
    setLoosenedFoot(preset.state.softFootTarget);
  };

  const applyRecommended = () => {
    setCorrections((prev) => ({
      frontShimMm: Number((prev.frontShimMm + solution.recFrontShimMm).toFixed(3)),
      rearShimMm: Number((prev.rearShimMm + solution.recRearShimMm).toFixed(3)),
      frontJackMm: Number((prev.frontJackMm + solution.recFrontJackMm).toFixed(3)),
      rearJackMm: Number((prev.rearJackMm + solution.recRearJackMm).toFixed(3)),
    }));
  };

  const fixSoftFoot = () => {
    setSoftFootShims((prev) => ({
      ...prev,
      [misalignment.softFootTarget]: misalignment.softFootMm,
    }));
  };

  const adjustFootShim = (foot: MotorFoot, deltaMm: number) => {
    setSoftFootShims((prev) => ({
      ...prev,
      [foot]: Number(Math.max(0, Math.min(0.4, prev[foot] + deltaMm)).toFixed(2)),
    }));
  };

  const resetAll = () => {
    setGeometry(DEFAULT_GEOMETRY);
    selectPreset(activePresetId);
    setShaftAngleDeg(180);
    setIsRotating(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Preset & Status Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-[28px] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div data-tour="alignment-presets" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
            {pick('Presets:', 'Preset:', 'プリセット:')}
          </span>
          {ALIGNMENT_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            const presetLabel =
              preset.id === 'parallel'
                ? pick('Parallel Offset', 'Offset Paralel', '平行偏心')
                : preset.id === 'angular'
                  ? pick('Angular Misalignment', 'Ketidaksejajaran Sudut', '偏角ミスアライメント')
                  : preset.id === 'combined'
                    ? pick('Combined + Soft Foot', 'Kombinasi + Kaki Tidak Rata (Soft Foot)', '複合＋ソフトフット')
                    : pick('Aligned (In Tolerance)', 'Sejajar (Dalam Toleransi)', '芯出し完了（許容範囲内）');
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                title={preset.description}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                  active
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] font-bold text-[var(--md-on-primary-container)] shadow-2xs ring-1 ring-[var(--md-primary)]/30'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] hover:text-[var(--md-on-surface)]'
                }`}
              >
                {presetLabel}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {solution.isAligned ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {pick(
                `In Tolerance (ISO/ANSI ${geometry.rpm} RPM)`,
                `Dalam Toleransi (ISO/ANSI ${geometry.rpm} RPM)`,
                `許容範囲内 (ISO/ANSI ${geometry.rpm} RPM)`
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              {pick(
                'Misaligned — Adjustment Needed',
                'Tidak Sejajar — Perlu Penyetelan',
                'ミスアライメント — 調整が必要'
              )}
            </span>
          )}

          {!solution.softFootOk && (
            <button
              type="button"
              onClick={fixSoftFoot}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/60 bg-rose-50/80 px-3 py-1 text-xs font-semibold text-rose-800 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/50"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {pick(
                `Soft Foot (${maxResidualSoftFoot.toFixed(2)} mm) — Shim Foot`,
                `Kaki Tidak Rata (${maxResidualSoftFoot.toFixed(2)} mm) — Shim Kaki`,
                `ソフトフット (${maxResidualSoftFoot.toFixed(2)} mm) — シム挿入`
              )}
            </button>
          )}

          {/* Laser vs Dial View Toggle */}
          <div data-tour="alignment-view-toggle" className="inline-flex rounded-full border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container-high)] p-1">
            <button
              type="button"
              onClick={() => setMeasurementView('dial')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                measurementView === 'dial'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Gauge className="h-3.5 w-3.5" />
              {pick('Dial Gauges', 'Dial Gauge', 'ダイヤルゲージ')}
            </button>
            <button
              type="button"
              onClick={() => setMeasurementView('laser')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                measurementView === 'laser'
                  ? 'bg-[var(--md-secondary-container)] font-bold text-[var(--md-on-secondary-container)]'
                  : 'font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              {pick('Laser View', 'Tampilan Laser', 'レーザー表示')}
            </button>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset', 'Reset', 'リセット')}
          </button>
        </div>
      </div>

      {/* 5-Step Field Alignment Wizard Bar */}
      {(() => {
        const roughOk =
          Math.hypot(solution.hotVerticalOffsetMm, solution.horizontalOffsetMm) <= 0.25 &&
          Math.hypot(
            solution.verticalAngularityPer100,
            solution.horizontalAngularityPer100
          ) <= 0.25;
        const vertOk =
          Math.abs(solution.hotVerticalOffsetMm) <= solution.maxOffsetLimitMm &&
          Math.abs(solution.verticalAngularityPer100) <=
            solution.maxAngularityLimitPer100;
        const horizOk =
          Math.abs(solution.horizontalOffsetMm) <= solution.maxOffsetLimitMm &&
          Math.abs(solution.horizontalAngularityPer100) <=
            solution.maxAngularityLimitPer100;
        const steps = [
          {
            num: 1,
            label: pick('Soft Foot', 'Kaki Tidak Rata', 'ソフトフット'),
            done: solution.softFootOk,
          },
          {
            num: 2,
            label: pick('Rough Align', 'Penyelarasan Kasar', '粗芯出し'),
            done: roughOk,
          },
          {
            num: 3,
            label: pick('Vertical Shims', 'Shim Vertikal', '垂直シム'),
            done: vertOk,
          },
          {
            num: 4,
            label: pick('Horizontal Jack', 'Jack Horizontal', '水平ジャッキ'),
            done: horizOk,
          },
          {
            num: 5,
            label: pick('Final Verify', 'Verifikasi Akhir', '最終確認'),
            done: solution.isAligned,
          },
        ];
        return (
          <div data-tour="alignment-wizard" className="glass-panel grid grid-cols-2 gap-2.5 rounded-[28px] p-3 sm:grid-cols-5">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 rounded-[20px] border px-3 py-2 text-xs font-semibold transition ${
                  s.done
                    ? 'border-emerald-300/60 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]'
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--md-surface-container-highest)] text-[10px] font-bold text-[var(--md-on-surface)]">
                    {s.num}
                  </span>
                )}
                <span className="truncate">{s.label}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Main Rig + Dial Indicators */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 sim-equal-grid-xl">
        <div className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5 xl:col-span-7">
          <div className="flex items-center justify-center">
            <AlignmentRigSvg
              geometry={geometry}
              solution={solution}
              shaftAngleDeg={shaftAngleDeg}
              softFootMm={maxResidualSoftFoot}
              measurementView={measurementView}
            />
          </div>

          {/* Shaft Rotation Controls */}
          <div data-tour="alignment-sweep" className="flex flex-col gap-3 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {CARDINAL_ANGLES.map((c) => (
                <button
                  key={c.deg}
                  type="button"
                  onClick={() => {
                    setIsRotating(false);
                    setShaftAngleDeg(c.deg);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    Math.round(shaftAngleDeg) === c.deg
                      ? 'border-[var(--md-primary)] bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)]'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] font-medium text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsRotating((r) => !r)}
                className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              >
                {isRotating ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" /> Sweep
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-1 items-center gap-2.5 sm:max-w-xs">
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={shaftAngleDeg}
                onChange={(e) => {
                  setIsRotating(false);
                  setShaftAngleDeg(Number(e.target.value));
                }}
                className="w-full"
                aria-label="Shaft rotation angle"
              />
              <span className="w-12 text-right font-mono text-xs font-bold text-[var(--md-primary)]">
                {Math.round(shaftAngleDeg)}°
              </span>
            </div>
          </div>
        </div>

        {/* Dial Gauges or Laser View & Cardinal Table */}
        <div data-tour="alignment-gauges" className="glass-panel space-y-4 rounded-[28px] p-4 sm:p-5 xl:col-span-5">
          {measurementView === 'laser' ? (
            <LaserAlignmentPanel
              solution={solution}
              rpm={geometry.rpm}
              shaftAngleDeg={shaftAngleDeg}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AnalogDialGauge
                label="Rim Indicator"
                subtitle={
                  geometry.compensateSag
                    ? 'Sag-compensated'
                    : 'Raw (uncompensated)'
                }
                valueMm={solution.rimCompMm}
                tirMm={solution.rimTirMm}
                accent="emerald"
              />
              <AnalogDialGauge
                label="Face Indicator"
                subtitle={`Sweep Ø ${geometry.couplingDiameterMm} mm`}
                valueMm={solution.faceMm}
                tirMm={solution.faceTirMm}
                accent="sky"
              />
            </div>
          )}

          {/* Cardinal Readings Table + Validity Rule */}
          <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--md-on-surface)]">
                Cardinal Readings (mm)
              </span>
              <span className="rounded-full border border-emerald-300/60 bg-emerald-50/80 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
                T+B = L+R (Δ {solution.rimValidityErrorMm.toFixed(3)})
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-xs">
              <div className="text-left font-sans text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                Gauge
              </div>
              <div className="font-semibold text-[var(--md-on-surface-variant)]">
                T (0°)
              </div>
              <div className="font-semibold text-[var(--md-on-surface-variant)]">
                R (90°)
              </div>
              <div className="font-semibold text-[var(--md-on-surface-variant)]">
                B (180°)
              </div>
              <div className="font-semibold text-[var(--md-on-surface-variant)]">
                L (270°)
              </div>

              <div className="text-left font-sans text-[11px] font-medium text-[var(--md-on-surface)]">
                Rim {geometry.compensateSag ? '(Comp)' : '(Raw)'}
              </div>
              {[
                geometry.compensateSag
                  ? solution.rimCompCardinal.top
                  : solution.rimRawCardinal.top,
                geometry.compensateSag
                  ? solution.rimCompCardinal.right
                  : solution.rimRawCardinal.right,
                geometry.compensateSag
                  ? solution.rimCompCardinal.bottom
                  : solution.rimRawCardinal.bottom,
                geometry.compensateSag
                  ? solution.rimCompCardinal.left
                  : solution.rimRawCardinal.left,
              ].map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--md-outline-variant)]/40 bg-[var(--md-surface-container-low)] py-1 text-[var(--md-on-surface)]"
                >
                  {val >= 0 ? '+' : ''}
                  {val.toFixed(2)}
                </div>
              ))}

              <div className="text-left font-sans text-[11px] font-medium text-[var(--md-on-surface)]">
                Face
              </div>
              {[
                solution.faceCardinal.top,
                solution.faceCardinal.right,
                solution.faceCardinal.bottom,
                solution.faceCardinal.left,
              ].map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--md-outline-variant)]/40 bg-[var(--md-surface-container-low)] py-1 text-[var(--md-on-surface)]"
                >
                  {val >= 0 ? '+' : ''}
                  {val.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Soft-Foot Diagnostic & Actionable Alignment Worksheet */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 sim-equal-grid">
        {/* Soft-Foot Diagnostic & Shim Check */}
        <div data-tour="alignment-soft-foot" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--md-on-surface)]">
                <AlertTriangle
                  className={`h-4 w-4 ${
                    solution.softFootOk
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                />
                Step 1: {pick('Soft-Foot Diagnostic & Shim Check', 'Diagnosis Kaki Tidak Rata (Soft Foot) & Cek Shim', 'ステップ1: ソフトフット診断とシム確認')}
              </h3>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick(
                  'Loosen each motor anchor bolt to measure dial lift; shim any foot > 0.05 mm before aligning.',
                  'Kendurkan tiap baut jangkar motor untuk mengukur angkatan dial; beri shim kaki > 0.05 mm sebelum penyelarasan.',
                  '各アンカーボルトを緩めて浮き量を測定し、0.05 mm を超える脚は芯出し前にシム補正してください。'
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[var(--md-on-surface-variant)]">
                {pick('Fault Foot:', 'Kaki Bermasalah:', '異常脚:')}
              </span>
              <select
                value={misalignment.softFootTarget}
                onChange={(e) => {
                  const foot = e.target.value as MotorFoot;
                  setMisalignment((m) => ({
                    ...m,
                    softFootTarget: foot,
                    softFootMm: m.softFootMm > 0 ? m.softFootMm : 0.14,
                  }));
                  setSoftFootShims({ ...ZERO_SOFT_FOOT_SHIMS });
                  setLoosenedFoot(foot);
                }}
                className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-2.5 py-1 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
                aria-label="Soft foot fault location"
              >
                {MOTOR_FEET.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {MOTOR_FEET.map((f) => {
              const lift = getResidualSoftFootMm(f.id, misalignment, softFootShims);
              const isLoosened = loosenedFoot === f.id;
              const isOut = lift > solution.maxSoftFootLimitMm;
              return (
                <div
                  key={f.id}
                  className={`flex flex-col justify-between rounded-[20px] border p-2.5 transition ${
                    isLoosened
                      ? isOut
                        ? 'border-rose-400 bg-rose-50/70 dark:border-rose-500/50 dark:bg-rose-950/30'
                        : 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/50 dark:bg-emerald-950/30'
                      : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--md-on-surface)]">
                      {f.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLoosenedFoot(isLoosened ? null : f.id)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
                        isLoosened
                          ? 'bg-[var(--md-primary)] font-bold text-[var(--md-on-primary)]'
                          : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {isLoosened
                        ? pick('Torqued?', 'Kencangkan', '締付')
                        : pick('Loosen', 'Kendurkan', '緩める')}
                    </button>
                  </div>

                  <div className="my-1.5 font-mono text-xs">
                    {isLoosened ? (
                      <div
                        className={`font-bold ${
                          isOut
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {pick('Lift:', 'Angkat:', '浮き:')} {lift.toFixed(2)} mm
                      </div>
                    ) : (
                      <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                        {pick('Bolt tight', 'Baut kencang', 'ボルト締付済')}
                      </div>
                    )}
                    <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                      Shim: +{softFootShims[f.id].toFixed(2)} mm
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustFootShim(f.id, -0.05)}
                      className="flex-1 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] py-0.5 text-[10px] font-semibold text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)]"
                    >
                      -0.05
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustFootShim(f.id, 0.01)}
                      className="flex-1 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] py-0.5 text-[10px] font-semibold text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-highest)]"
                    >
                      +0.01
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustFootShim(f.id, 0.05)}
                      className="m3-btn-tonal flex-1 py-0.5 text-[10px] font-bold"
                    >
                      +0.05
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actionable Alignment Worksheet */}
        <div data-tour="alignment-worksheet" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5 lg:col-span-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--md-on-surface)]">
                <ClipboardList className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Step 2: Actionable Alignment Worksheet',
                  'Langkah 2: Lembar Kerja Koreksi Penyelarasan',
                  'ステップ2: 芯出し補正ワークシート'
                )}
              </h3>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick(
                  'Calculated shims & lateral moves vs. currently applied adjustments.',
                  'Shim & pergeseran lateral terhitung vs. penyetelan yang sudah diterapkan.',
                  '算出されたシム・水平移動量と現在適用済みの調整量の比較。'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={applyRecommended}
              className="m3-btn-filled inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {pick('Apply Worksheet Moves', 'Terapkan Koreksi', '補正量を適用')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] text-[11px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">
                <tr>
                  <th className="px-3 py-2">{pick('Motor Foot / Axis', 'Kaki / Sumbu Motor', 'モータ脚・軸')}</th>
                  <th className="px-3 py-2 text-right">{pick('Applied', 'Diterapkan', '適用済')}</th>
                  <th className="px-3 py-2 text-right">{pick('Remaining Move', 'Sisa Koreksi', '残移動量')}</th>
                  <th className="px-3 py-2">{pick('Action', 'Tindakan', '作業')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-outline-variant)]/35 font-mono">
                {[
                  {
                    label: pick('Front Foot Shim (V)', 'Shim Kaki Depan (V)', '前脚シム (V)'),
                    applied: corrections.frontShimMm,
                    rem: solution.recFrontShimMm,
                    posAction: pick('Add shims', 'Tambah shim', 'シム追加'),
                    negAction: pick('Remove shims', 'Kurangi shim', 'シム除去'),
                  },
                  {
                    label: pick('Rear Foot Shim (V)', 'Shim Kaki Belakang (V)', '後脚シム (V)'),
                    applied: corrections.rearShimMm,
                    rem: solution.recRearShimMm,
                    posAction: pick('Add shims', 'Tambah shim', 'シム追加'),
                    negAction: pick('Remove shims', 'Kurangi shim', 'シム除去'),
                  },
                  {
                    label: pick('Front Horizontal (H)', 'Horizontal Depan (H)', '前脚水平 (H)'),
                    applied: corrections.frontJackMm,
                    rem: solution.recFrontJackMm,
                    posAction: pick('Jack Right →', 'Geser Kanan →', '右へ押す →'),
                    negAction: pick('← Jack Left', '← Geser Kiri', '← 左へ押す'),
                  },
                  {
                    label: pick('Rear Horizontal (H)', 'Horizontal Belakang (H)', '後脚水平 (H)'),
                    applied: corrections.rearJackMm,
                    rem: solution.recRearJackMm,
                    posAction: pick('Jack Right →', 'Geser Kanan →', '右へ押す →'),
                    negAction: pick('← Jack Left', '← Geser Kiri', '← 左へ押す'),
                  },
                ].map((row) => {
                  const done = Math.abs(row.rem) <= 0.015;
                  return (
                    <tr
                      key={row.label}
                      className="transition hover:bg-[var(--md-surface-container-high)]"
                    >
                      <td className="px-3 py-2 font-sans font-medium text-[var(--md-on-surface)]">
                        {row.label}
                      </td>
                      <td className="px-3 py-2 text-right text-[var(--md-on-surface-variant)]">
                        {row.applied >= 0 ? '+' : ''}
                        {row.applied.toFixed(2)} mm
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-bold ${
                          done
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {row.rem >= 0 ? '+' : ''}
                        {row.rem.toFixed(2)} mm
                      </td>
                      <td className="px-3 py-2 font-sans text-[11px]">
                        {done ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {pick('In Range', 'Dalam Batas', '範囲内')}
                          </span>
                        ) : (
                          <span className="text-[var(--md-on-surface)]">
                            {row.rem > 0 ? row.posAction : row.negAction}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Shim/Jack Adjuster, Diagnostics, Geometry & Sag */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 1. Shim & Horizontal Jacking Adjuster */}
        <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-[var(--md-on-surface)]">
              <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
              {pick('Shim & Jacking Adjuster', 'Penyetel Shim & Jack', 'シム＆ジャッキ調整')}
            </h3>
            <button
              type="button"
              onClick={applyRecommended}
              className="m3-btn-filled inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {pick('Auto-Align', 'Selaraskan Otomatis', '自動芯出し')}
            </button>
          </div>

          {(
            [
              {
                key: 'frontShimMm',
                label: pick('Front Foot Shim (Vertical)', 'Shim Kaki Depan (Vertikal)', '前脚シム（垂直）'),
                val: corrections.frontShimMm,
                rec: solution.recFrontShimMm,
              },
              {
                key: 'rearShimMm',
                label: pick('Rear Foot Shim (Vertical)', 'Shim Kaki Belakang (Vertikal)', '後脚シム（垂直）'),
                val: corrections.rearShimMm,
                rec: solution.recRearShimMm,
              },
              {
                key: 'frontJackMm',
                label: pick('Front Horizontal Jack', 'Jack Horizontal Depan', '前脚水平ジャッキ'),
                val: corrections.frontJackMm,
                rec: solution.recFrontJackMm,
              },
              {
                key: 'rearJackMm',
                label: pick('Rear Horizontal Jack', 'Jack Horizontal Belakang', '後脚水平ジャッキ'),
                val: corrections.rearJackMm,
                rec: solution.recRearJackMm,
              },
            ] as const
          ).map((ctrl) => (
            <div key={ctrl.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--md-on-surface)]">
                  {ctrl.label}
                </span>
                <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                  Rec:{' '}
                  <strong className="text-[var(--md-primary)]">
                    {ctrl.rec >= 0 ? '+' : ''}
                    {ctrl.rec.toFixed(2)} mm
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min={-1.5}
                  max={1.5}
                  step={0.01}
                  value={ctrl.val}
                  onChange={(e) =>
                    setCorrections((prev) => ({
                      ...prev,
                      [ctrl.key]: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <span className="w-20 text-right font-mono text-xs font-semibold text-[var(--md-on-surface)]">
                  {ctrl.val >= 0 ? '+' : ''}
                  {ctrl.val.toFixed(2)} mm
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Alignment Diagnostics */}
        <div className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
          <h3 className="text-sm font-bold text-[var(--md-on-surface)]">
            {pick('Coupling Alignment Diagnostics', 'Diagnostik Penyelarasan Kopling', 'カップリング芯出し診断')}
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('Hot Running V-Offset', 'Offset-V Operasi Panas', '熱間運転垂直偏心')}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-[var(--md-on-surface)]">
                {solution.hotVerticalOffsetMm >= 0 ? '+' : ''}
                {solution.hotVerticalOffsetMm.toFixed(3)} mm
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                {pick('Cold', 'Dingin', '冷間')}: {solution.verticalOffsetMm >= 0 ? '+' : ''}
                {solution.verticalOffsetMm.toFixed(2)} • {pick('Target', 'Target', '目標')}:{' '}
                {solution.coldTargetOffsetMm >= 0 ? '+' : ''}
                {solution.coldTargetOffsetMm.toFixed(2)}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                {pick('Horizontal Offset', 'Offset Horizontal', '水平偏心')}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-[var(--md-on-surface)]">
                {solution.horizontalOffsetMm >= 0 ? '+' : ''}
                {solution.horizontalOffsetMm.toFixed(3)} mm
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                Limit ±{solution.maxOffsetLimitMm.toFixed(3)} mm
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                Vertical Angularity
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-[var(--md-on-surface)]">
                {solution.verticalAngularityPer100 >= 0 ? '+' : ''}
                {solution.verticalAngularityPer100.toFixed(3)}
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                mm/100mm (≤ {solution.maxAngularityLimitPer100.toFixed(3)})
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                Horizontal Angularity
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-[var(--md-on-surface)]">
                {solution.horizontalAngularityPer100 >= 0 ? '+' : ''}
                {solution.horizontalAngularityPer100.toFixed(3)}
              </div>
              <div className="text-[10px] text-[var(--md-on-surface-variant)]">
                mm/100mm (≤ {solution.maxAngularityLimitPer100.toFixed(3)})
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3.5 text-xs text-[var(--md-on-surface)]">
            <div className="flex items-center justify-between">
              <span>{pick('Parallel Offset Status:', 'Status Offset Paralel:', '平行偏心状態:')}</span>
              <span
                className={
                  solution.offsetInTolerance
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'font-semibold text-amber-600 dark:text-amber-400'
                }
              >
                {solution.offsetInTolerance
                  ? pick('PASS', 'LULUS', '合格')
                  : pick('OUT OF LIMIT', 'MELEBIHI BATAS', '許容外')}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>{pick('Angularity Status:', 'Status Angularitas:', '偏角状態:')}</span>
              <span
                className={
                  solution.angularityInTolerance
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'font-semibold text-amber-600 dark:text-amber-400'
                }
              >
                {solution.angularityInTolerance
                  ? pick('PASS', 'LULUS', '合格')
                  : pick('OUT OF LIMIT', 'MELEBIHI BATAS', '許容外')}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>{pick('Soft Foot (≤ 0.05 mm):', 'Kaki Tidak Rata / Soft Foot (≤ 0.05 mm):', 'ソフトフット (≤ 0.05 mm):')}</span>
              <span
                className={
                  solution.softFootOk
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'font-semibold text-rose-600 dark:text-rose-400'
                }
              >
                {solution.softFootOk
                  ? pick('OK', 'OK', '良好')
                  : `${pick('FAIL', 'GAGAL', '不良')} (${maxResidualSoftFoot.toFixed(2)} mm)`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Machine Geometry & Bar Sag */}
        <div data-tour="alignment-geometry" className="glass-panel space-y-3 rounded-[28px] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--md-on-surface)]">
              {pick('Machine Geometry & Bar Sag', 'Geometri Mesin & Sag Batang', '機械寸法・バーたわみ')}
            </h3>
            <select
              value={geometry.rpm}
              onChange={(e) =>
                setGeometry((g) => ({
                  ...g,
                  rpm: Number(e.target.value) as MachineGeometry['rpm'],
                }))
              }
              className="rounded-2xl border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3 py-1.5 text-xs font-semibold text-[var(--md-on-surface)] focus:border-[var(--md-primary)] focus:outline-none"
              aria-label="Operating RPM"
            >
              {RPM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} RPM
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[var(--md-on-surface)]">
                <span>Coupling Sweep Ø (D)</span>
                <span className="font-mono font-semibold text-[var(--md-primary)]">
                  {geometry.couplingDiameterMm} mm
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={250}
                step={10}
                value={geometry.couplingDiameterMm}
                onChange={(e) =>
                  setGeometry((g) => ({
                    ...g,
                    couplingDiameterMm: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--md-on-surface)]">
                <span>Front Foot Distance (L₁)</span>
                <span className="font-mono font-semibold text-[var(--md-primary)]">
                  {geometry.frontFootDistMm} mm
                </span>
              </div>
              <input
                type="range"
                min={120}
                max={320}
                step={10}
                value={geometry.frontFootDistMm}
                onChange={(e) =>
                  setGeometry((g) => ({
                    ...g,
                    frontFootDistMm: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--md-on-surface)]">
                <span>Rear Foot Distance (L₂)</span>
                <span className="font-mono font-semibold text-[var(--md-primary)]">
                  {geometry.rearFootDistMm} mm
                </span>
              </div>
              <input
                type="range"
                min={400}
                max={800}
                step={10}
                value={geometry.rearFootDistMm}
                onChange={(e) =>
                  setGeometry((g) => ({
                    ...g,
                    rearFootDistMm: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--md-on-surface)]">
                <span>{pick('Indicator Bar Sag (6 o’clock)', 'Sag Batang Indicator (Pukul 6)', 'バーたわみ（6時位置）')}</span>
                <span className="font-mono font-semibold text-[var(--md-primary)]">
                  {geometry.barSagMm.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={0.2}
                step={0.01}
                value={geometry.barSagMm}
                onChange={(e) =>
                  setGeometry((g) => ({
                    ...g,
                    barSagMm: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-[20px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] px-3 py-2">
              <span className="font-medium text-[var(--md-on-surface)]">
                {pick('Apply Bar Sag Compensation', 'Terapkan Kompensasi Sag Batang', 'バーたわみ補正を適用')}
              </span>
              <input
                type="checkbox"
                checked={geometry.compensateSag}
                onChange={(e) =>
                  setGeometry((g) => ({
                    ...g,
                    compensateSag: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
            </label>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--md-on-surface)]">
                <span>{pick('Simulated Soft Foot', 'Simulasi Kaki Tidak Rata (Soft Foot)', '模擬ソフトフット')}</span>
                <span className="font-mono font-semibold text-[var(--md-primary)]">
                  {misalignment.softFootMm.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={0.25}
                step={0.01}
                value={misalignment.softFootMm}
                onChange={(e) =>
                  setMisalignment((m) => ({
                    ...m,
                    softFootMm: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Thermal Growth Compensation */}
            <div className="space-y-2 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-[var(--md-on-surface)]">
                  {pick('Thermal Growth (Cold → Hot)', 'Pemuaian Termal (Dingin → Panas)', '熱膨張補正（冷間 → 熱間）')}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGeometry((g) => ({
                      ...g,
                      pumpThermalGrowthMm: 0.15,
                      motorThermalGrowthMm: 0.05,
                    }))
                  }
                  className="m3-btn-tonal px-2.5 py-1 text-[10px] font-bold"
                >
                  {pick('Hot Pump (+0.15/+0.05)', 'Pompa Panas (+0.15/+0.05)', '高温ポンプ (+0.15/+0.05)')}
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[var(--md-on-surface-variant)]">
                  <span>{pick('Pump Thermal Rise', 'Kenaikan Termal Pompa', 'ポンプ熱上昇')}</span>
                  <span className="font-mono font-semibold text-[var(--md-on-surface)]">
                    +{geometry.pumpThermalGrowthMm.toFixed(2)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.4}
                  step={0.01}
                  value={geometry.pumpThermalGrowthMm}
                  onChange={(e) =>
                    setGeometry((g) => ({
                      ...g,
                      pumpThermalGrowthMm: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[var(--md-on-surface-variant)]">
                  <span>{pick('Motor Thermal Rise', 'Kenaikan Termal Motor', 'モータ熱上昇')}</span>
                  <span className="font-mono font-semibold text-[var(--md-on-surface)]">
                    +{geometry.motorThermalGrowthMm.toFixed(2)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.4}
                  step={0.01}
                  value={geometry.motorThermalGrowthMm}
                  onChange={(e) =>
                    setGeometry((g) => ({
                      ...g,
                      motorThermalGrowthMm: Number(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div className="flex justify-between border-t border-[var(--md-outline-variant)]/50 pt-1.5 text-[11px]">
                <span className="text-[var(--md-on-surface-variant)]">
                  {pick('Cold Target V-Offset:', 'Target Offset-V Dingin:', '冷間目標垂直偏心:')}
                </span>
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {solution.coldTargetOffsetMm >= 0 ? '+' : ''}
                  {solution.coldTargetOffsetMm.toFixed(2)} mm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
