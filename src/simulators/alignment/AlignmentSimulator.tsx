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
      <div className="flex flex-col gap-3 glass-panel rounded-2xl p-4  lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {pick('Presets:', 'Preset:', 'プリセット:')}
          </span>
          {ALIGNMENT_PRESETS.map((preset) => {
            const active = activePresetId === preset.id;
            const presetLabel =
              preset.id === 'parallel'
                ? pick('Parallel Offset', 'Offset Paralel', '平行偏心')
                : preset.id === 'angular'
                  ? pick('Angular Misalignment', 'Ketidaklurusan Sudut', '偏角ミスアライメント')
                  : preset.id === 'combined'
                    ? pick('Combined + Soft Foot', 'Kombinasi + Soft Foot', '複合＋ソフトフット')
                    : pick('Aligned (In Tolerance)', 'Lurus (Dalam Toleransi)', '芯出し完了（許容範囲内）');
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset.id)}
                title={preset.description}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/60 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {presetLabel}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {solution.isAligned ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {pick(
                `In Tolerance (ISO/ANSI ${geometry.rpm} RPM)`,
                `Dalam Toleransi (ISO/ANSI ${geometry.rpm} RPM)`,
                `許容範囲内 (ISO/ANSI ${geometry.rpm} RPM)`
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              {pick(
                'Misaligned — Adjustment Needed',
                'Tidak Lurus — Perlu Penyetelan',
                'ミスアライメント — 調整が必要'
              )}
            </span>
          )}

          {!solution.softFootOk && (
            <button
              type="button"
              onClick={fixSoftFoot}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {pick(
                `Soft Foot (${maxResidualSoftFoot.toFixed(2)} mm) — Shim Foot`,
                `Soft Foot (${maxResidualSoftFoot.toFixed(2)} mm) — Shim Kaki`,
                `ソフトフット (${maxResidualSoftFoot.toFixed(2)} mm) — シム挿入`
              )}
            </button>
          )}

          {/* Laser vs Dial View Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMeasurementView('dial')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                measurementView === 'dial'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Gauge className="h-3.5 w-3.5" />
              {pick('Dial Gauges', 'Dial Gauge', 'ダイヤルゲージ')}
            </button>
            <button
              type="button"
              onClick={() => setMeasurementView('laser')}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                measurementView === 'laser'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              {pick('Laser View', 'Tampilan Laser', 'レーザー表示')}
            </button>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
            label: pick('Soft Foot', 'Soft Foot', 'ソフトフット'),
            done: solution.softFootOk,
          },
          {
            num: 2,
            label: pick('Rough Align', 'Lurus Kasar', '粗芯出し'),
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
          <div className="grid grid-cols-2 gap-2 glass-panel rounded-2xl p-3  sm:grid-cols-5">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  s.done
                    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
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
        <div className="space-y-4 glass-panel rounded-2xl p-4  xl:col-span-7">
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
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {CARDINAL_ANGLES.map((c) => (
                <button
                  key={c.deg}
                  type="button"
                  onClick={() => {
                    setIsRotating(false);
                    setShaftAngleDeg(c.deg);
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                    Math.round(shaftAngleDeg) === c.deg
                      ? 'border-emerald-500 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsRotating((r) => !r)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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

            <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
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
                className="w-full accent-emerald-600"
                aria-label="Shaft rotation angle"
              />
              <span className="w-12 text-right font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                {Math.round(shaftAngleDeg)}°
              </span>
            </div>
          </div>
        </div>

        {/* Dial Gauges or Laser View & Cardinal Table */}
        <div className="space-y-4 glass-panel rounded-2xl p-4  xl:col-span-5">
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
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Cardinal Readings (mm)
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                T+B = L+R (Δ {solution.rimValidityErrorMm.toFixed(3)})
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-xs">
              <div className="text-left font-sans text-[11px] font-semibold text-slate-500">
                Gauge
              </div>
              <div className="font-semibold text-slate-600 dark:text-slate-400">
                T (0°)
              </div>
              <div className="font-semibold text-slate-600 dark:text-slate-400">
                R (90°)
              </div>
              <div className="font-semibold text-slate-600 dark:text-slate-400">
                B (180°)
              </div>
              <div className="font-semibold text-slate-600 dark:text-slate-400">
                L (270°)
              </div>

              <div className="text-left font-sans text-[11px] font-medium text-slate-700 dark:text-slate-300">
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
                  className="rounded bg-white py-0.5 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  {val >= 0 ? '+' : ''}
                  {val.toFixed(2)}
                </div>
              ))}

              <div className="text-left font-sans text-[11px] font-medium text-slate-700 dark:text-slate-300">
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
                  className="rounded bg-white py-0.5 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
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
        <div className="space-y-3 glass-panel rounded-2xl p-4  lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                <AlertTriangle
                  className={`h-4 w-4 ${
                    solution.softFootOk
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                />
                Step 1: {pick('Soft-Foot Diagnostic & Shim Check', 'Diagnosis Soft-Foot & Cek Shim', 'ステップ1: ソフトフット診断とシム確認')}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick(
                  'Loosen each motor anchor bolt to measure dial lift; shim any foot > 0.05 mm before aligning.',
                  'Kendurkan tiap baut kaki motor untuk mengukur angkatan dial; beri shim kaki > 0.05 mm sebelum meluruskan.',
                  '各アンカーボルトを緩めて浮き量を測定し、0.05 mm を超える脚は芯出し前にシム補正してください。'
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
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
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MOTOR_FEET.map((f) => {
              const lift = getResidualSoftFootMm(f.id, misalignment, softFootShims);
              const isLoosened = loosenedFoot === f.id;
              const isOut = lift > solution.maxSoftFootLimitMm;
              return (
                <div
                  key={f.id}
                  className={`flex flex-col justify-between rounded-xl border p-2.5 transition ${
                    isLoosened
                      ? isOut
                        ? 'border-rose-400 bg-rose-50/70 dark:border-rose-500/50 dark:bg-rose-500/10'
                        : 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/50 dark:bg-emerald-500/10'
                      : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {f.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLoosenedFoot(isLoosened ? null : f.id)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                        isLoosened
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
                      <div className="text-[11px] text-slate-400">
                        {pick('Bolt tight', 'Baut kencang', 'ボルト締付済')}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Shim: +{softFootShims[f.id].toFixed(2)} mm
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustFootShim(f.id, -0.05)}
                      className="flex-1 rounded border border-slate-200 bg-white py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      -0.05
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustFootShim(f.id, 0.01)}
                      className="flex-1 rounded border border-slate-200 bg-white py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      +0.01
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustFootShim(f.id, 0.05)}
                      className="flex-1 rounded border border-emerald-300 bg-emerald-50 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
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
        <div className="space-y-3 glass-panel rounded-2xl p-4  lg:col-span-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {pick(
                  'Step 2: Actionable Alignment Worksheet',
                  'Langkah 2: Lembar Kerja Koreksi Pelurusan',
                  'ステップ2: 芯出し補正ワークシート'
                )}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {pick('Apply Worksheet Moves', 'Terapkan Koreksi', '補正量を適用')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">{pick('Motor Foot / Axis', 'Kaki / Sumbu Motor', 'モータ脚・軸')}</th>
                  <th className="px-3 py-2 text-right">{pick('Applied', 'Diterapkan', '適用済')}</th>
                  <th className="px-3 py-2 text-right">{pick('Remaining Move', 'Sisa Koreksi', '残移動量')}</th>
                  <th className="px-3 py-2">{pick('Action', 'Tindakan', '作業')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono dark:divide-slate-800">
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
                      className="bg-white dark:bg-slate-950/40"
                    >
                      <td className="px-3 py-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {row.label}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">
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
                          <span className="text-slate-700 dark:text-slate-300">
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
        <div className="space-y-3 glass-panel rounded-2xl p-4 ">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <Wrench className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {pick('Shim & Jacking Adjuster', 'Penyetel Shim & Jack', 'シム＆ジャッキ調整')}
            </h3>
            <button
              type="button"
              onClick={applyRecommended}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {pick('Auto-Align', 'Lurus Otomatis', '自動芯出し')}
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
            <div key={ctrl.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {ctrl.label}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Rec:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {ctrl.rec >= 0 ? '+' : ''}
                    {ctrl.rec.toFixed(2)} mm
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
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
                  className="w-full accent-emerald-600"
                />
                <span className="w-20 text-right font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {ctrl.val >= 0 ? '+' : ''}
                  {ctrl.val.toFixed(2)} mm
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Alignment Diagnostics */}
        <div className="space-y-3 glass-panel rounded-2xl p-4 ">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {pick('Coupling Alignment Diagnostics', 'Diagnostik Pelurusan Kopling', 'カップリング芯出し診断')}
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick('Hot Running V-Offset', 'Offset-V Jalan Panas', '熱間運転垂直偏心')}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {solution.hotVerticalOffsetMm >= 0 ? '+' : ''}
                {solution.hotVerticalOffsetMm.toFixed(3)} mm
              </div>
              <div className="text-[10px] text-slate-500">
                {pick('Cold', 'Dingin', '冷間')}: {solution.verticalOffsetMm >= 0 ? '+' : ''}
                {solution.verticalOffsetMm.toFixed(2)} • {pick('Target', 'Target', '目標')}:{' '}
                {solution.coldTargetOffsetMm >= 0 ? '+' : ''}
                {solution.coldTargetOffsetMm.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {pick('Horizontal Offset', 'Offset Horizontal', '水平偏心')}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {solution.horizontalOffsetMm >= 0 ? '+' : ''}
                {solution.horizontalOffsetMm.toFixed(3)} mm
              </div>
              <div className="text-[10px] text-slate-500">
                Limit ±{solution.maxOffsetLimitMm.toFixed(3)} mm
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Vertical Angularity
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {solution.verticalAngularityPer100 >= 0 ? '+' : ''}
                {solution.verticalAngularityPer100.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500">
                mm/100mm (≤ {solution.maxAngularityLimitPer100.toFixed(3)})
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Horizontal Angularity
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {solution.horizontalAngularityPer100 >= 0 ? '+' : ''}
                {solution.horizontalAngularityPer100.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500">
                mm/100mm (≤ {solution.maxAngularityLimitPer100.toFixed(3)})
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
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
                  : pick('OUT OF LIMIT', 'LEWAT BATAS', '許容外')}
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
                  : pick('OUT OF LIMIT', 'LEWAT BATAS', '許容外')}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>{pick('Soft Foot (≤ 0.05 mm):', 'Soft Foot (≤ 0.05 mm):', 'ソフトフット (≤ 0.05 mm):')}</span>
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
        <div className="space-y-3 glass-panel rounded-2xl p-4 ">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
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
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Operating RPM"
            >
              {RPM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} RPM
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Coupling Sweep Ø (D)</span>
                <span className="font-mono font-semibold">
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
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Front Foot Distance (L₁)</span>
                <span className="font-mono font-semibold">
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
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Rear Foot Distance (L₂)</span>
                <span className="font-mono font-semibold">
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
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>{pick('Indicator Bar Sag (6 o’clock)', 'Sag Batang Indicator (Pukul 6)', 'バーたわみ（6時位置）')}</span>
                <span className="font-mono font-semibold">
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
                className="w-full accent-emerald-600"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-medium text-slate-700 dark:text-slate-200">
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
                className="h-4 w-4 accent-emerald-600"
              />
            </label>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>{pick('Simulated Soft Foot', 'Simulasi Soft Foot', '模擬ソフトフット')}</span>
                <span className="font-mono font-semibold">
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
                className="w-full accent-rose-500"
              />
            </div>

            {/* Thermal Growth Compensation */}
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
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
                  className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                >
                  {pick('Hot Pump (+0.15/+0.05)', 'Pompa Panas (+0.15/+0.05)', '高温ポンプ (+0.15/+0.05)')}
                </button>
              </div>
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{pick('Pump Thermal Rise', 'Kenaikan Termal Pompa', 'ポンプ熱上昇')}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
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
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{pick('Motor Thermal Rise', 'Kenaikan Termal Motor', 'モータ熱上昇')}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
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
                  className="w-full accent-emerald-600"
                />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 text-[11px] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  {pick('Cold Target V-Offset:', 'Target Offset-V Dingin:', '冷間目標垂直偏心:')}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
