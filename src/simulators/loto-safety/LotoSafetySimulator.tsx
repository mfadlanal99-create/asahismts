import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Lock,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HAZARD_FAULTS,
  LOTO_SCENARIOS,
  LOTO_WORKFLOW_STEPS,
  evaluateLotoState,
  type HazardFaultId,
  type LiveDeadLiveStage,
  type LotoScenarioId,
  type LotoStateInput,
} from './lotoData';
import { LotoSafetySvg } from './LotoSafetySvg';

const INITIAL_STATE: LotoStateInput = {
  scenarioId: 'centrifugal-pump-mcc',
  faultId: 'none',
  notifiedPersonnel: false,
  equipmentStopped: false,
  primaryBreakerOpen: false,
  secondaryBreakerOpen: false,
  primaryLocked: false,
  primaryTagged: false,
  secondaryLocked: false,
  secondaryTagged: false,
  processValveClosed: false,
  bleedValveOpen: false,
  gravityBlockInstalled: false,
  capacitorDischarged: false,
  ldlStage: 'idle',
  tryOutAttempted: false,
};

export function LotoSafetySimulator() {
  const { language, pick } = useLanguage();
  const [state, setState] = useState<LotoStateInput>(INITIAL_STATE);

  const evaluation = useMemo(() => evaluateLotoState(state), [state]);
  const { scenario } = evaluation;

  const handleSelectScenario = (scenarioId: LotoScenarioId) => {
    setState({
      ...INITIAL_STATE,
      scenarioId,
      faultId: state.faultId,
    });
  };

  const handleSelectFault = (faultId: HazardFaultId) => {
    setState((prev) => ({
      ...prev,
      faultId,
    }));
  };

  const handleReset = () => {
    setState({
      ...INITIAL_STATE,
      scenarioId: state.scenarioId,
      faultId: 'none',
    });
  };

  const handleAutoCompleteSafeLoto = () => {
    setState({
      ...state,
      faultId: 'none',
      notifiedPersonnel: true,
      equipmentStopped: true,
      primaryBreakerOpen: true,
      secondaryBreakerOpen: true,
      primaryLocked: true,
      primaryTagged: true,
      secondaryLocked: true,
      secondaryTagged: true,
      processValveClosed: true,
      bleedValveOpen: true,
      gravityBlockInstalled: true,
      capacitorDischarged: true,
      ldlStage: 'verified',
      tryOutAttempted: true,
    });
  };

  const handleAdvanceLdl = () => {
    setState((prev) => {
      const nextMap: Record<LiveDeadLiveStage, LiveDeadLiveStage> = {
        idle: 'live-1',
        'live-1': 'dead-test',
        'dead-test': 'live-2',
        'live-2': 'verified',
        verified: 'verified',
      };
      return {
        ...prev,
        ldlStage: nextMap[prev.ldlStage],
      };
    });
  };

  const ldlButtonLabel = () => {
    if (state.ldlStage === 'idle') {
      return pick(
        'Step 1: Test Known LIVE Source',
        'Tahap 1: Uji Sumber BERTEGANGAN (Live)',
        '段階1：既知の活線電源を検電'
      );
    }
    if (state.ldlStage === 'live-1') {
      return pick(
        'Step 2: Test Isolated Equipment (DEAD)',
        'Tahap 2: Uji Peralatan Terisolasi (Dead)',
        '段階2：遮断対象機器の無電圧確認'
      );
    }
    if (state.ldlStage === 'dead-test') {
      return pick(
        'Step 3: Re-Test Known LIVE Source',
        'Tahap 3: Uji Ulang Sumber BERTEGANGAN (Live)',
        '段階3：再度 既知の活線電源で検電器確認'
      );
    }
    if (state.ldlStage === 'live-2') {
      return pick(
        'Confirm Live-Dead-Live Complete',
        'Konfirmasi Uji Live-Dead-Live Selesai',
        'Live-Dead-Live 試験完了を確定'
      );
    }
    return pick(
      'Live-Dead-Live Verified ✓',
      'Live-Dead-Live Terverifikasi ✓',
      'Live-Dead-Live 検証完了 ✓'
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Top Safety Status Banner */}
      {evaluation.isZeroEnergyVerified ? (
        <div
          data-tour="loto-safety-banner"
          className="flex items-start gap-3 rounded-[24px] border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">
              {pick(
                'OSHA 1910.147 ZERO-ENERGY STATE VERIFIED — SAFE FOR MAINTENANCE',
                'KONDISI ENERGI NOL OSHA 1910.147 TERVERIFIKASI — AMAN UNTUK PEMELIHARAAN',
                'OSHA 1910.147 ゼロエネルギー状態検証完了 — 保守作業安全'
              )}
            </p>
            <p className="mt-0.5 text-emerald-800 dark:text-emerald-300/90">
              {pick(
                `All energy sources isolated, personal padlock & danger tag applied, stored energy = 0, and Live-Dead-Live + Try-Out passed for ${scenario.name.en}.`,
                `Seluruh sumber energi telah diisolasi, gembok pribadi & label bahaya terpasang, energi tersimpan = 0, serta uji Live-Dead-Live & Try-Out lulus untuk ${scenario.name.id}.`,
                `${scenario.name.ja} の全エネルギー源が遮断・施錠・タグ付けされ、残留エネルギーゼロおよび Live-Dead-Live・Try-Out 検証が完了しました。`
              )}
            </p>
          </div>
        </div>
      ) : (
        <div data-tour="loto-safety-banner" className="space-y-2">
          {evaluation.alarms.length === 0 ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-300 bg-amber-50/90 p-4 text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">
                  {pick(
                    'ISOLATION INCOMPLETE — DO NOT COMMENCE MAINTENANCE',
                    'ISOLASI BELUM LENGKAP — DILARANG MEMULAI PEKERJAAN PEMELIHARAAN',
                    '遮断・検証未完了 — 保守作業を開始しないでください'
                  )}
                </p>
                <p className="mt-0.5 opacity-90">
                  {pick(
                    `Completed ${evaluation.completedStepCount}/6 LOTO steps. Complete Lockout/Tagout, Live-Dead-Live verification, and Start Try-Out.`,
                    `Selesai ${evaluation.completedStepCount}/6 langkah LOTO. Lengkapi pemasangan Gembok/Label, uji Live-Dead-Live, dan Try-Out Start.`,
                    `LOTO 手順 ${evaluation.completedStepCount}/6 完了。施錠・タグ、Live-Dead-Live 試験、起動試行（Try-Out）を完了してください。`
                  )}
                </p>
              </div>
            </div>
          ) : (
            evaluation.alarms.map((al) => (
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
                  <p className="font-bold">{al.title[language]}</p>
                  <p className="mt-0.5 opacity-90">{al.detail[language]}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Plant Equipment Scenario Selector */}
      <div data-tour="loto-scenarios" className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            <Zap className="h-4 w-4 text-[var(--md-primary)]" />
            {pick('Plant Isolation Scenarios', 'Skenario Isolasi Pabrik', 'プラント遮断シナリオ')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoCompleteSafeLoto}
              className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {pick('Auto-Verify Safe LOTO', 'Simulasi LOTO Aman', '安全 LOTO 自動実行')}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="glass-pill inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {pick('Reset', 'Reset', 'リセット')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {LOTO_SCENARIOS.map((sc) => {
            const active = sc.id === state.scenarioId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc.id)}
                className={`flex flex-col justify-between rounded-[20px] border p-3 text-left transition ${
                  active
                    ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                    : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{sc.name[language]}</div>
                  <div
                    className={`mt-1 text-[11px] leading-snug ${
                      active ? 'opacity-85' : 'text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    {sc.subtitle[language]}
                  </div>
                </div>
                <div
                  className={`mt-2 flex items-center gap-2 font-mono text-[10px] font-semibold ${
                    active ? 'text-[var(--md-on-primary-container)]' : 'text-[var(--md-primary)]'
                  }`}
                >
                  <span>{sc.nominalVoltageV} V</span>
                  {sc.hasPressureSystem && (
                    <>
                      <span>•</span>
                      <span>{sc.nominalPressureBar} bar</span>
                    </>
                  )}
                  {sc.hasGravityBlock && (
                    <>
                      <span>•</span>
                      <span>{pick('Gravity', 'Gravitasi', '重力')}</span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) + Right Schematic & Verification (7 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column */}
        <div className="space-y-4 lg:col-span-5">
          {/* 3. 6-Step LOTO Workflow Tracker */}
          <div data-tour="loto-workflow" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <ClipboardCheck className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('6-Step LOTO Procedure', 'Prosedur 6 Langkah LOTO', '6ステップ LOTO 手順')}
              </span>
              <span className="font-mono text-xs font-bold text-[var(--md-primary)]">
                {evaluation.completedStepCount}/6
              </span>
            </div>

            <div className="space-y-1.5">
              {LOTO_WORKFLOW_STEPS.map((step) => {
                const done = evaluation.stepCompletion[step.id];
                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-2.5 rounded-[16px] border px-3 py-2 text-xs ${
                      done
                        ? 'border-emerald-300/80 bg-emerald-500/10 text-[var(--md-on-surface)]'
                        : 'border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                        done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)]'
                      }`}
                    >
                      {done ? '✓' : step.stepNumber}
                    </span>
                    <div>
                      <div className="font-bold text-[var(--md-on-surface)]">
                        {step.title[language]}
                      </div>
                      <div className="text-[11px] opacity-80">{step.detail[language]}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setState((p) => ({ ...p, notifiedPersonnel: !p.notifiedPersonnel }))
                }
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  state.notifiedPersonnel ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                {state.notifiedPersonnel
                  ? pick('1. Notified ✓', '1. Diberitahu ✓', '1. 通知済 ✓')
                  : pick('1. Notify Crew', '1. Beritahu Operator', '1. 作業者通知')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((p) => ({ ...p, equipmentStopped: !p.equipmentStopped }))
                }
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  state.equipmentStopped ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                {state.equipmentStopped
                  ? pick('2. Stopped ✓', '2. Dihentikan ✓', '2. 停止済 ✓')
                  : pick('2. Normal Stop', '2. Hentikan Normal', '2. 通常停止')}
              </button>
            </div>
          </div>

          {/* 4. Energy Isolation, Padlock/Tag & Stored Energy Controls */}
          <div
            data-tour="loto-isolation-controls"
            className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
              <Lock className="h-4 w-4 text-[var(--md-primary)]" />
              {pick(
                'Isolation, Padlock/Tag & Stored Energy',
                'Isolasi, Gembok/Label & Energi Tersimpan',
                '遮断・施錠・タグ・残留エネルギー'
              )}
            </span>

            {/* Primary MCC Controls */}
            <div className="rounded-[18px] border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3 space-y-2">
              <div className="text-[11px] font-bold text-[var(--md-on-surface)]">
                {pick(
                  `Primary MCC Disconnect (${scenario.nominalVoltageV} V)`,
                  `Pemutus MCC Utama (${scenario.nominalVoltageV} V)`,
                  `主 MCC 遮断器 (${scenario.nominalVoltageV} V)`
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setState((p) => ({ ...p, primaryBreakerOpen: !p.primaryBreakerOpen }))
                  }
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    state.primaryBreakerOpen ? 'm3-btn-filled' : 'glass-pill'
                  }`}
                >
                  {state.primaryBreakerOpen
                    ? pick('Breaker OPEN ✓', 'Pemutus TERBUKA ✓', '遮断器 開放 ✓')
                    : pick('Open Breaker', 'Buka Pemutus', '遮断器を開放')}
                </button>
                <button
                  type="button"
                  onClick={() => setState((p) => ({ ...p, primaryLocked: !p.primaryLocked }))}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    state.primaryLocked ? 'm3-btn-filled' : 'glass-pill'
                  }`}
                >
                  <Lock className="h-3 w-3" />
                  {state.primaryLocked
                    ? pick('Padlock ON ✓', 'Gembok Terpasang ✓', '南京錠 施錠 ✓')
                    : pick('Apply Padlock', 'Pasang Gembok', '南京錠を施錠')}
                </button>
                <button
                  type="button"
                  onClick={() => setState((p) => ({ ...p, primaryTagged: !p.primaryTagged }))}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    state.primaryTagged ? 'm3-btn-filled' : 'glass-pill'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {state.primaryTagged
                    ? pick('Danger Tag ✓', 'Label Bahaya ✓', '危険タグ ✓')
                    : pick('Hang Tag', 'Pasang Label', 'タグ取付')}
                </button>
              </div>
            </div>

            {/* Secondary Dual-Feed Controls */}
            {scenario.hasDualFeed && (
              <div className="rounded-[18px] border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3 space-y-2">
                <div className="text-[11px] font-bold text-[var(--md-on-surface)]">
                  {pick(
                    'Secondary Interlock / Backfeed (120 V)',
                    'Umpan Balik / Interlock Sekunder (120 V)',
                    '補助電源・逆潮流遮断 (120 V)'
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({ ...p, secondaryBreakerOpen: !p.secondaryBreakerOpen }))
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.secondaryBreakerOpen ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.secondaryBreakerOpen
                      ? pick('2nd Breaker OPEN ✓', 'Pemutus Ke-2 BUKA ✓', '補助遮断器 開放 ✓')
                      : pick('Open 2nd Breaker', 'Buka Pemutus Ke-2', '補助遮断器を開放')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({ ...p, secondaryLocked: !p.secondaryLocked }))
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.secondaryLocked ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.secondaryLocked
                      ? pick('2nd Padlock ✓', 'Gembok Ke-2 ✓', '補助南京錠 ✓')
                      : pick('Lock 2nd Feed', 'Kunci Sumber Ke-2', '補助施錠')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({ ...p, secondaryTagged: !p.secondaryTagged }))
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.secondaryTagged ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.secondaryTagged
                      ? pick('2nd Tag ✓', 'Label Ke-2 ✓', '補助タグ ✓')
                      : pick('Tag 2nd Feed', 'Labeli Sumber Ke-2', '補助タグ取付')}
                  </button>
                </div>
              </div>
            )}

            {/* Stored Energy Controls */}
            <div className="rounded-[18px] border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3 space-y-2">
              <div className="text-[11px] font-bold text-[var(--md-on-surface)]">
                {pick(
                  'Stored Energy Release & Restraint',
                  'Pelepasan & Penahanan Energi Tersimpan',
                  '残留エネルギー放出・機械的拘束'
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {scenario.hasPressureSystem && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setState((p) => ({ ...p, processValveClosed: !p.processValveClosed }))
                      }
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        state.processValveClosed ? 'm3-btn-filled' : 'glass-pill'
                      }`}
                    >
                      {state.processValveClosed
                        ? pick('Isol Valve SHUT ✓', 'Katup Isolasi TUTUP ✓', '遮断弁 閉 ✓')
                        : pick('Close Isol Valve', 'Tutup Katup Isolasi', '遮断弁を閉じる')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setState((p) => ({ ...p, bleedValveOpen: !p.bleedValveOpen }))
                      }
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        state.bleedValveOpen ? 'm3-btn-filled' : 'glass-pill'
                      }`}
                    >
                      {state.bleedValveOpen
                        ? pick('Bleed Valve OPEN ✓', 'Katup Buang BUKA ✓', 'ブリード弁 開 ✓')
                        : pick('Open Bleed/Dump', 'Buka Katup Buang', 'ブリード弁を開く')}
                    </button>
                  </>
                )}
                {scenario.hasGravityBlock && (
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        gravityBlockInstalled: !p.gravityBlockInstalled,
                      }))
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.gravityBlockInstalled ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.gravityBlockInstalled
                      ? pick('Gravity Block IN ✓', 'Blok Gravitasi PASANG ✓', '落下防止ブロック設置 ✓')
                      : pick('Insert Gravity Block', 'Pasang Blok Gravitasi', '落下防止ブロック挿入')}
                  </button>
                )}
                {scenario.hasCapacitor && (
                  <button
                    type="button"
                    onClick={() =>
                      setState((p) => ({ ...p, capacitorDischarged: !p.capacitorDischarged }))
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.capacitorDischarged ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.capacitorDischarged
                      ? pick('DC Bus Discharged (0V) ✓', 'Bus DC Kosong (0V) ✓', 'DC バス放電完了 (0V) ✓')
                      : pick('Discharge DC Capacitor (5τ)', 'Kosongkan Kapasitor DC (5τ)', 'DC コンデンサ放電 (5τ)')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 lg:col-span-7">
          {/* 5. Interactive Plant Isolation Schematic */}
          <div data-tour="loto-schematic" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <LotoSafetySvg state={state} evaluation={evaluation} />
          </div>

          {/* 6. Zero-Energy Verification Meters (Live-Dead-Live + Try-Out) */}
          <div data-tour="loto-verification" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Zero-Energy Verification (Live-Dead-Live & Try-Out)',
                  'Verifikasi Energi Nol (Live-Dead-Live & Try-Out)',
                  'ゼロエネルギー検証（Live-Dead-Live & Try-Out）'
                )}
              </span>
              <span className="font-mono text-xs text-[var(--md-on-surface-variant)]">
                {pick('Measured:', 'Terukur:', '測定値:')}{' '}
                <strong className="text-[var(--md-on-surface)]">
                  {Math.max(evaluation.effectiveVoltageV, evaluation.effectiveSecondaryVoltageV)} V AC
                </strong>{' '}
                |{' '}
                <strong className="text-[var(--md-on-surface)]">
                  {evaluation.effectivePressureBar.toFixed(1)} bar
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAdvanceLdl}
                className="m3-btn-filled w-full py-2.5 text-xs font-bold"
              >
                {ldlButtonLabel()}
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((p) => ({ ...p, tryOutAttempted: !p.tryOutAttempted }))
                }
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition ${
                  state.tryOutAttempted ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                {state.tryOutAttempted
                  ? pick('Try-Out Start PB Verified ✓', 'Try-Out Tombol Start Lulus ✓', '起動試行（Try-Out）確認済 ✓')
                  : pick('Perform Start PB Try-Out', 'Lakukan Uji Coba Start (Try-Out)', '起動試行（Try-Out）を実施')}
              </button>
            </div>
          </div>

          {/* 7. Hazard / Fault Audit Mode */}
          <div data-tour="loto-hazard-audit" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                {pick(
                  'Hazard / Fault Audit Mode',
                  'Mode Audit Bahaya / Gangguan LOTO',
                  '危険・故障監査モード'
                )}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {HAZARD_FAULTS.map((fault) => {
                const active = fault.id === state.faultId;
                return (
                  <button
                    key={fault.id}
                    type="button"
                    onClick={() => handleSelectFault(fault.id)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition ${
                      active ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {fault.name[language]}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {(HAZARD_FAULTS.find((f) => f.id === state.faultId) ?? HAZARD_FAULTS[0]).description[
                language
              ]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
