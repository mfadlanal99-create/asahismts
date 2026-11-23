import { useMemo, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Lock,
  Play,
  Power,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Wrench,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  HAZARD_FAULTS,
  INITIAL_LOTO_STATE,
  LOTO_SCENARIOS,
  LOTO_WORKFLOW_STEPS,
  evaluateLotoState,
  type HazardFaultId,
  type LiveDeadLiveStage,
  type LotoScenarioId,
  type LotoStateInput,
  type TrilingualText,
} from './lotoData';
import { LotoSafetySvg, type LotoActionId } from './LotoSafetySvg';

export function LotoSafetySimulator() {
  const { language, pick } = useLanguage();
  const [state, setState] = useState<LotoStateInput>(INITIAL_LOTO_STATE);
  const [guardrailMsg, setGuardrailMsg] = useState<TrilingualText | null>(null);

  const evaluation = useMemo(() => evaluateLotoState(state), [state]);
  const { scenario } = evaluation;

  const blockWithGuardrail = (msg: TrilingualText) => {
    setGuardrailMsg(msg);
  };

  const handleAction = (action: LotoActionId) => {
    setGuardrailMsg(null);

    switch (action) {
      case 'set-selector-hand': {
        if (state.localSelectorLocked) {
          blockWithGuardrail({
            en: 'Blocked: Remove the LCS Padlock before turning the Local Selector Switch out of OFF.',
            id: 'Ditolak: Lepas Gembok LOTO pada LCS terlebih dahulu sebelum memutar Sakelar Selektor Motor dari posisi OFF.',
            ja: '操作不可：現場切替スイッチを OFF から動かす前に LCS 南京錠を取り外してください。',
          });
          return;
        }
        setState((p) => ({ ...p, selectorMode: 'hand', stopPressed: false }));
        return;
      }

      case 'set-selector-auto': {
        if (state.localSelectorLocked) {
          blockWithGuardrail({
            en: 'Blocked: Remove the LCS Padlock before turning the Local Selector Switch out of OFF.',
            id: 'Ditolak: Lepas Gembok LOTO pada LCS terlebih dahulu sebelum memutar Sakelar Selektor Motor dari posisi OFF.',
            ja: '操作不可：現場切替スイッチを OFF から動かす前に LCS 南京錠を取り外してください。',
          });
          return;
        }
        setState((p) => ({ ...p, selectorMode: 'auto', stopPressed: false }));
        return;
      }

      case 'set-selector-off': {
        setState((p) => ({ ...p, selectorMode: 'off' }));
        return;
      }

      case 'press-stop': {
        setState((p) => ({ ...p, stopPressed: true, selectorMode: 'off' }));
        return;
      }

      case 'toggle-lcs-lock': {
        if (state.selectorMode !== 'off') {
          blockWithGuardrail({
            en: 'Guardrail: Cannot apply Local Selector Lockout while Selector Switch is in HAND or AUTO! Turn it to OFF first.',
            id: 'Pelanggaran Prosedur: Tidak dapat memasang Gembok LOTO saat Sakelar Selektor Motor di posisi HAND atau AUTO! Putar ke OFF dahulu.',
            ja: '安全規定：切替スイッチが HAND または AUTO のままでは施錠できません。先に OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, localSelectorLocked: !p.localSelectorLocked }));
        return;
      }

      case 'toggle-lcs-tag': {
        if (state.selectorMode !== 'off') {
          blockWithGuardrail({
            en: 'Guardrail: Turn the Local Selector Switch to OFF before hanging a Danger Tag.',
            id: 'Pelanggaran Prosedur: Putar Sakelar Selektor Motor ke posisi OFF sebelum memasang Label Bahaya.',
            ja: '安全規定：危険タグを取り付ける前に現場切替スイッチを OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, localSelectorTagged: !p.localSelectorTagged }));
        return;
      }

      case 'toggle-mcc-disconnect': {
        if (state.mccDisconnectOpen && state.mccLocked) {
          blockWithGuardrail({
            en: 'Blocked: Main MCC Rotary Disconnect is locked out! Remove your personal LOTO Padlock before closing.',
            id: 'Ditolak: Sakelar Putar Panel MCC / VFD sedang terkunci! Lepas Gembok LOTO pribadi sebelum menutup pemutus.',
            ja: '操作不可：主 MCC 断路器は施錠中です。投入する前に個人用南京錠を外してください。',
          });
          return;
        }
        if (!state.mccDisconnectOpen && evaluation.motorRunning) {
          blockWithGuardrail({
            en: 'Guardrail: Stop the motor at the Local Control Station (Selector OFF + STOP) before opening the Main MCC Disconnect under load.',
            id: 'Pelanggaran Prosedur: Hentikan motor melalui Sakelar Selektor Motor (OFF + STOP) sebelum membuka Panel MCC / VFD berbeban.',
            ja: '安全規定：負荷運転中の遮断を防ぐため、先に現場操作盤（OFF + STOP）でモータを停止してください。',
          });
          return;
        }
        setState((p) => ({
          ...p,
          mccDisconnectOpen: !p.mccDisconnectOpen,
          capacitorDischarged: p.mccDisconnectOpen ? false : p.capacitorDischarged,
          ldlStage: 'idle',
          tryOutAttempted: false,
        }));
        return;
      }

      case 'toggle-mcc-lock': {
        if (!state.mccDisconnectOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Cannot apply a Padlock while Main MCC Disconnect is ON! Turn the rotary handle to OFF first.',
            id: 'Pelanggaran Prosedur: Tidak dapat memasang Gembok LOTO saat Panel MCC / VFD masih ON! Putar tuas ke OFF terlebih dahulu.',
            ja: '安全規定：主 MCC 断路器が ON の状態では施錠できません。先にハンドルを OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, mccLocked: !p.mccLocked }));
        return;
      }

      case 'toggle-mcc-tag': {
        if (!state.mccDisconnectOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Open the Main MCC Disconnect (OFF) before hanging a Danger Tag.',
            id: 'Pelanggaran Prosedur: Putar Panel MCC / VFD ke posisi OFF sebelum memasang Label Bahaya.',
            ja: '安全規定：危険タグを取り付ける前に主 MCC 断路器を OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, mccTagged: !p.mccTagged }));
        return;
      }

      case 'discharge-capacitor': {
        if (!state.mccDisconnectOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Cannot discharge VFD DC Bus Capacitor (540 V DC) while Main MCC Disconnect is ON!',
            id: 'Pelanggaran Prosedur: Kapasitor Bus DC VFD (540 V DC) tidak dapat dikosongkan selama Panel MCC / VFD masih ON!',
            ja: '安全規定：主 MCC が ON の間は VFD DC バスコンデンサ（540 V DC）を放電できません。',
          });
          return;
        }
        setState((p) => ({ ...p, capacitorDischarged: true }));
        return;
      }

      case 'toggle-secondary-disconnect': {
        if (state.secondaryDisconnectOpen && state.secondaryLocked) {
          blockWithGuardrail({
            en: 'Blocked: Secondary 120 V Disconnect is locked out. Remove the padlock before closing.',
            id: 'Ditolak: Pemutus Sekunder 120 V sedang dikunci. Lepas Gembok LOTO sebelum menutup.',
            ja: '操作不可：補助 120 V 断路器は施錠中です。投入前に南京錠を外してください。',
          });
          return;
        }
        setState((p) => ({
          ...p,
          secondaryDisconnectOpen: !p.secondaryDisconnectOpen,
          ldlStage: 'idle',
          tryOutAttempted: false,
        }));
        return;
      }

      case 'toggle-secondary-lock': {
        if (!state.secondaryDisconnectOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Open the Secondary 120 V Disconnect before applying a Padlock.',
            id: 'Pelanggaran Prosedur: Buka pemutus sekunder 120 V sebelum memasang Gembok LOTO.',
            ja: '安全規定：施錠する前に補助 120 V 断路器を OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, secondaryLocked: !p.secondaryLocked }));
        return;
      }

      case 'toggle-secondary-tag': {
        if (!state.secondaryDisconnectOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Open the Secondary 120 V Disconnect before hanging a Danger Tag.',
            id: 'Pelanggaran Prosedur: Buka pemutus sekunder 120 V sebelum memasang Label Bahaya.',
            ja: '安全規定：危険タグ取付前に補助 120 V 断路器を OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, secondaryTagged: !p.secondaryTagged }));
        return;
      }

      case 'toggle-motor-isolator': {
        if (state.motorIsolatorOpen && state.motorIsolatorLocked) {
          blockWithGuardrail({
            en: 'Blocked: Local Motor Isolator is locked out! Remove your LOTO Padlock before turning it ON.',
            id: 'Ditolak: Isolator Lokal Motor sedang dikunci! Lepas Gembok LOTO sebelum memutar ke ON.',
            ja: '操作不可：モータ現場断路器は施錠中です。ON に戻す前に南京錠を外してください。',
          });
          return;
        }
        setState((p) => ({
          ...p,
          motorIsolatorOpen: !p.motorIsolatorOpen,
          ldlStage: 'idle',
          tryOutAttempted: false,
        }));
        return;
      }

      case 'toggle-motor-isolator-lock': {
        if (!state.motorIsolatorOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Cannot lock Local Motor Isolator while ON! Switch it to OFF first.',
            id: 'Pelanggaran Prosedur: Tidak dapat mengunci Isolator Lokal Motor saat posisi ON! Putar ke OFF dahulu.',
            ja: '安全規定：モータ現場断路器が ON の状態では施錠できません。先に OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, motorIsolatorLocked: !p.motorIsolatorLocked }));
        return;
      }

      case 'toggle-motor-isolator-tag': {
        if (!state.motorIsolatorOpen) {
          blockWithGuardrail({
            en: 'Guardrail: Switch Local Motor Isolator to OFF before hanging a Danger Tag.',
            id: 'Pelanggaran Prosedur: Putar Isolator Lokal Motor ke OFF sebelum memasang Label Bahaya.',
            ja: '安全規定：危険タグ取付前にモータ現場断路器を OFF にしてください。',
          });
          return;
        }
        setState((p) => ({ ...p, motorIsolatorTagged: !p.motorIsolatorTagged }));
        return;
      }

      case 'toggle-process-valve': {
        if (state.processValveClosed && state.processValveLocked) {
          blockWithGuardrail({
            en: 'Blocked: Process Isolation Valve is locked out! Remove the valve lockout before opening.',
            id: 'Ditolak: Katup Isolasi Proses sedang dikunci! Lepas Gembok LOTO katup sebelum membuka.',
            ja: '操作不可：プロセス遮断弁は施錠中です。開く前に南京錠を外してください。',
          });
          return;
        }
        setState((p) => ({
          ...p,
          processValveClosed: !p.processValveClosed,
          bleedValveOpen: p.processValveClosed ? false : p.bleedValveOpen,
        }));
        return;
      }

      case 'toggle-process-valve-lock': {
        if (!state.processValveClosed) {
          blockWithGuardrail({
            en: 'Guardrail: Close the Process Isolation Valve before applying a valve lockout.',
            id: 'Pelanggaran Prosedur: Tutup Katup Isolasi Proses terlebih dahulu sebelum memasang Gembok LOTO katup.',
            ja: '安全規定：施錠する前にプロセス遮断弁を閉止してください。',
          });
          return;
        }
        setState((p) => ({ ...p, processValveLocked: !p.processValveLocked }));
        return;
      }

      case 'toggle-bleed-valve': {
        if (!state.processValveClosed) {
          blockWithGuardrail({
            en: 'Guardrail: Close the Process Isolation Valve before opening the Bleed/Drain Valve to prevent live process blowout!',
            id: 'Pelanggaran Prosedur: Tutup Katup Isolasi Proses sebelum membuka Katup Kuras/Buang agar fluida bertekanan tidak menyembur!',
            ja: '安全規定：噴出を防ぐため、ブリード弁を開く前にプロセス遮断弁を閉止してください。',
          });
          return;
        }
        setState((p) => ({ ...p, bleedValveOpen: !p.bleedValveOpen }));
        return;
      }

      case 'toggle-gravity-block': {
        setState((p) => ({ ...p, gravityBlockInstalled: !p.gravityBlockInstalled }));
        return;
      }

      case 'advance-ldl': {
        if (state.ldlStage === 'live-1' && evaluation.effectiveMotorTerminalVoltageV > 0) {
          blockWithGuardrail({
            en: `ARC-FLASH / SHOCK GUARDRAIL: Motor Terminal Box is still energized at ${evaluation.effectiveMotorTerminalVoltageV} V AC! Isolate & lock MCC + Local Motor Isolator before probing.`,
            id: `PERINGATAN SENGATAN LISTRIK: Kotak Terminal Motor masih bertegangan ${evaluation.effectiveMotorTerminalVoltageV} V AC! Isolasi & kunci Panel MCC + Isolator Lokal Motor sebelum menguji probe.`,
            ja: `感電・アーク危険：モータ端子箱に ${evaluation.effectiveMotorTerminalVoltageV} V AC が残存しています！検電前に MCC と現場断路器を遮断・施錠してください。`,
          });
          return;
        }
        setState((p) => {
          const nextMap: Record<LiveDeadLiveStage, LiveDeadLiveStage> = {
            idle: 'live-1',
            'live-1': 'dead-test',
            'dead-test': 'live-2',
            'live-2': 'verified',
            verified: 'verified',
          };
          return { ...p, ldlStage: nextMap[p.ldlStage] };
        });
        return;
      }

      case 'perform-tryout': {
        if (!evaluation.isElectricallyIsolated || !evaluation.isLockAndTagCompliant) {
          blockWithGuardrail({
            en: 'Guardrail: Complete electrical isolation and apply all LOTO Padlocks + Danger Tags before performing Start Try-Out!',
            id: 'Pelanggaran Prosedur: Selesaikan isolasi listrik serta pasang seluruh Gembok LOTO + Label Bahaya sebelum Uji Coba Start (Try-Out)!',
            ja: '安全規定：起動試行（Try-Out）の前に、すべての電気遮断・施錠・危険タグを完了してください。',
          });
          return;
        }
        setState((p) => ({ ...p, tryOutAttempted: true }));
        return;
      }
    }
  };

  const handleSelectScenario = (scenarioId: LotoScenarioId) => {
    setGuardrailMsg(null);
    setState({
      ...INITIAL_LOTO_STATE,
      scenarioId,
      faultId: state.faultId,
    });
  };

  const handleSelectFault = (faultId: HazardFaultId) => {
    setGuardrailMsg(null);
    setState((prev) => ({
      ...prev,
      faultId,
    }));
  };

  const handleReset = () => {
    setGuardrailMsg(null);
    setState({
      ...INITIAL_LOTO_STATE,
      scenarioId: state.scenarioId,
      faultId: 'none',
    });
  };

  const handleAutoCompleteSafeLoto = () => {
    setGuardrailMsg(null);
    setState({
      ...state,
      faultId: 'none',
      notifiedPersonnel: true,
      selectorMode: 'off',
      stopPressed: true,
      localSelectorLocked: true,
      localSelectorTagged: true,
      mccDisconnectOpen: true,
      mccLocked: true,
      mccTagged: true,
      capacitorDischarged: true,
      secondaryDisconnectOpen: true,
      secondaryLocked: true,
      secondaryTagged: true,
      motorIsolatorOpen: true,
      motorIsolatorLocked: true,
      motorIsolatorTagged: true,
      processValveClosed: true,
      processValveLocked: true,
      bleedValveOpen: true,
      gravityBlockInstalled: true,
      ldlStage: 'verified',
      tryOutAttempted: true,
    });
  };

  const ldlButtonLabel = () => {
    if (state.ldlStage === 'idle') {
      return pick(
        '1. Test Known LIVE Source',
        '1. Uji Sumber BERTEGANGAN (Live)',
        '1. 既知の活線電源を検電'
      );
    }
    if (state.ldlStage === 'live-1') {
      return pick(
        '2. Probe Motor Terminal Box (DEAD)',
        '2. Uji Kotak Terminal Motor (DEAD)',
        '2. モータ端子箱を検電 (DEAD)'
      );
    }
    if (state.ldlStage === 'dead-test') {
      return pick(
        '3. Re-Test Known LIVE Source',
        '3. Uji Ulang Sumber BERTEGANGAN (Live)',
        '3. 再度 既知の活線電源で検電'
      );
    }
    if (state.ldlStage === 'live-2') {
      return pick(
        'Confirm Live-Dead-Live Complete',
        'Konfirmasi Verifikasi Tegangan Nol Selesai',
        'Live-Dead-Live 検証完了を確定'
      );
    }
    return pick(
      'Live-Dead-Live Verified (0.0 V) ✓',
      'Verifikasi Tegangan Nol Lulus (0.0 V) ✓',
      'Live-Dead-Live 検証完了 (0.0 V) ✓'
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Top Safety Status Banner + Guardrail Feedback */}
      <div data-tour="loto-safety-banner" className="space-y-2.5">
        {guardrailMsg && (
          <div className="flex items-start gap-3 rounded-[22px] border border-amber-400 bg-amber-50 p-3.5 text-amber-950 shadow-sm dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs sm:text-sm font-medium">{guardrailMsg[language]}</div>
          </div>
        )}

        {evaluation.isZeroEnergyVerified ? (
          <div className="flex items-start gap-3 rounded-[24px] border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-200">
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
                  `All electrical disconnects & local selector locked/tagged, stored energy = 0, and Live-Dead-Live + Try-Out passed for ${scenario.name.en}.`,
                  `Seluruh pemutus & sakelar selektor terpasang Gembok LOTO + Label Bahaya, energi tersimpan = 0, serta Verifikasi Tegangan Nol & Uji Coba Start lulus untuk ${scenario.name.id}.`,
                  `${scenario.name.ja} の全遮断器・現場スイッチに施錠・危険タグを完了し、残留エネルギーゼロおよび検電・Try-Out 検証に合格しました。`
                )}
              </p>
            </div>
          </div>
        ) : evaluation.alarms.length === 0 ? (
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
                  `Selesai ${evaluation.completedStepCount}/6 langkah LOTO. Lengkapi pemasangan Gembok LOTO & Label Bahaya, Verifikasi Tegangan Nol (Live-Dead-Live), dan Uji Coba Start (Try-Out).`,
                  `LOTO 手順 ${evaluation.completedStepCount}/6 完了。施錠・危険タグ、Live-Dead-Live 検電、起動試行（Try-Out）を完了してください。`
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

      {/* 2. Plant Equipment Scenario Selector */}
      <div data-tour="loto-scenarios" className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
            <Zap className="h-4 w-4 text-[var(--md-primary)]" />
            {pick('Plant Equipment Scenarios', 'Skenario Peralatan Pabrik', 'プラント設備シナリオ')}
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
                  className={`mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-semibold ${
                    active ? 'text-[var(--md-on-primary-container)]' : 'text-[var(--md-primary)]'
                  }`}
                >
                  <span>{sc.nominalVoltageV} V</span>
                  {sc.hasCapacitor && (
                    <>
                      <span>•</span>
                      <span>{sc.dcBusVoltageV} V DC</span>
                    </>
                  )}
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

      {/* Main Grid: Left Station Controls (5 cols) + Right Schematic & Verification (7 cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 sim-equal-grid">
        {/* Left Column: Workflow + 3 Physical Isolation Station Cards */}
        <div className="space-y-4 lg:col-span-5">
          {/* 3. 6-Step LOTO Workflow Tracker */}
          <div data-tour="loto-workflow" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <ClipboardCheck className="h-4 w-4 text-[var(--md-primary)]" />
                {pick('6-Step OSHA LOTO Procedure', 'Prosedur 6 Langkah LOTO', '6ステップ LOTO 手順')}
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

            <button
              type="button"
              onClick={() =>
                setState((p) => ({ ...p, notifiedPersonnel: !p.notifiedPersonnel }))
              }
              className={`w-full rounded-full px-3 py-2 text-xs font-semibold transition ${
                state.notifiedPersonnel ? 'm3-btn-filled' : 'glass-pill'
              }`}
            >
              {state.notifiedPersonnel
                ? pick('1. Affected Operators Notified ✓', '1. Operator Terkait Diberitahu ✓', '1. 関係作業者へ通知済 ✓')
                : pick('1. Notify Affected Crew', '1. Beritahu Operator Terkait', '1. 関係作業者に通知')}
            </button>
          </div>

          {/* 4A. Local Control Station (LCS) at Motor */}
          <div data-tour="loto-lcs-station" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Power className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Local Control Station (LCS)',
                  'Sakelar Selektor Motor (LCS)',
                  '現場操作盤 (LCS)'
                )}
              </span>
              <span className="font-mono text-[11px] font-bold text-[var(--md-on-surface-variant)]">
                {state.selectorMode.toUpperCase()}
              </span>
            </div>

            {/* 3-Position Selector Switch */}
            <div className="grid grid-cols-3 gap-2">
              {(['hand', 'off', 'auto'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleAction(`set-selector-${mode}`)}
                  className={`rounded-full py-1.5 text-xs font-bold uppercase transition ${
                    state.selectorMode === mode ? 'm3-btn-filled' : 'glass-pill'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('press-stop')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.stopPressed ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                {state.stopPressed
                  ? pick('STOP Pressed ✓', 'Tombol STOP Ditekan ✓', 'STOP 押下済 ✓')
                  : pick('Press STOP PB', 'Tekan Tombol STOP', 'STOP ボタンを押す')}
              </button>
              <button
                type="button"
                onClick={() => handleAction('toggle-lcs-lock')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.localSelectorLocked ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Lock className="h-3 w-3" />
                {state.localSelectorLocked
                  ? pick('LCS Padlock ✓', 'Gembok LOTO LCS ✓', 'LCS 南京錠 ✓')
                  : pick('Lock Selector', 'Kunci Selektor', 'LCS 施錠')}
              </button>
              <button
                type="button"
                onClick={() => handleAction('toggle-lcs-tag')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.localSelectorTagged ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Tag className="h-3 w-3" />
                {state.localSelectorTagged
                  ? pick('LCS Tag ✓', 'Label Bahaya LCS ✓', 'LCS 危険タグ ✓')
                  : pick('Tag Selector', 'Pasang Label LCS', 'LCS タグ')}
              </button>
            </div>
          </div>

          {/* 4B. Main MCC / VFD Panel */}
          <div data-tour="loto-mcc-panel" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Zap className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  `Main MCC / VFD Panel (${scenario.nominalVoltageV} V)`,
                  `Panel MCC / VFD (${scenario.nominalVoltageV} V)`,
                  `主 MCC / VFD 盤 (${scenario.nominalVoltageV} V)`
                )}
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  state.mccDisconnectOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {state.mccDisconnectOpen ? 'OFF' : 'ON'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('toggle-mcc-disconnect')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.mccDisconnectOpen ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                {state.mccDisconnectOpen
                  ? pick('Rotary Disconnect OFF ✓', 'Pemutus MCC OFF ✓', '主断路器 OFF ✓')
                  : pick('Turn Disconnect OFF', 'Putar Pemutus ke OFF', '主断路器を OFF')}
              </button>
              <button
                type="button"
                onClick={() => handleAction('toggle-mcc-lock')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.mccLocked ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Lock className="h-3 w-3" />
                {state.mccLocked
                  ? pick('MCC Padlock ✓', 'Gembok LOTO MCC ✓', 'MCC 南京錠 ✓')
                  : pick('Apply Padlock', 'Pasang Gembok LOTO', '南京錠を施錠')}
              </button>
              <button
                type="button"
                onClick={() => handleAction('toggle-mcc-tag')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.mccTagged ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Tag className="h-3 w-3" />
                {state.mccTagged
                  ? pick('Danger Tag ✓', 'Label Bahaya ✓', '危険タグ ✓')
                  : pick('Hang Danger Tag', 'Pasang Label Bahaya', '危険タグ取付')}
              </button>
            </div>

            {scenario.hasCapacitor && (
              <button
                type="button"
                onClick={() => handleAction('discharge-capacitor')}
                className={`w-full rounded-full px-3 py-2 text-[11px] font-semibold ${
                  evaluation.effectiveCapacitorV === 0 ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                {evaluation.effectiveCapacitorV === 0
                  ? pick('VFD DC Bus Discharged (0 V DC) ✓', 'Bus DC VFD Kosong (0 V DC) ✓', 'VFD DC バス放電完了 (0 V DC) ✓')
                  : pick(
                      `Discharge VFD DC Bus (${scenario.dcBusVoltageV} V DC → 0 V)`,
                      `Kosongkan Kapasitor Bus DC VFD (${scenario.dcBusVoltageV} V DC → 0 V)`,
                      `VFD DC バスコンデンサ放電 (${scenario.dcBusVoltageV} V DC → 0 V)`
                    )}
              </button>
            )}

            {scenario.hasDualFeed && (
              <div className="rounded-[18px] border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-3 space-y-2">
                <div className="text-[11px] font-bold text-[var(--md-on-surface)]">
                  {pick(
                    'Secondary 120 V Control Backfeed',
                    'Umpan Balik Kontrol Sekunder 120 V',
                    '補助制御・逆潮流電源 (120 V)'
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction('toggle-secondary-disconnect')}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.secondaryDisconnectOpen ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.secondaryDisconnectOpen
                      ? pick('2nd Feed OFF ✓', 'Suplai Ke-2 OFF ✓', '補助電源 OFF ✓')
                      : pick('Turn 2nd Feed OFF', 'Matikan Suplai Ke-2', '補助電源 OFF')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('toggle-secondary-lock')}
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
                    onClick={() => handleAction('toggle-secondary-tag')}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.secondaryTagged ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.secondaryTagged
                      ? pick('2nd Tag ✓', 'Label Ke-2 ✓', '補助タグ ✓')
                      : pick('Tag 2nd Feed', 'Labeli Sumber Ke-2', '補助タグ')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4C. Motor-Side Field Isolator & Mechanical/Process Isolation */}
          <div data-tour="loto-field-isolator" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Motor-Side Field Isolator & Process',
                  'Isolator Lokal Motor & Proses',
                  'モータ現場断路器・プロセス遮断'
                )}
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  state.motorIsolatorOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {state.motorIsolatorOpen ? 'OFF' : 'ON'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('toggle-motor-isolator')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.motorIsolatorOpen ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                {state.motorIsolatorOpen
                  ? pick('Motor Isolator OFF ✓', 'Isolator Lokal Motor OFF ✓', '現場断路器 OFF ✓')
                  : pick('Turn Motor Isolator OFF', 'Putar Isolator Motor OFF', '現場断路器を OFF')}
              </button>
              <button
                type="button"
                onClick={() => handleAction('toggle-motor-isolator-lock')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.motorIsolatorLocked ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Lock className="h-3 w-3" />
                {state.motorIsolatorLocked
                  ? pick('Isolator Padlock ✓', 'Gembok Isolator ✓', '断路器南京錠 ✓')
                  : pick('Lock Isolator', 'Kunci Isolator', '断路器施錠')}
              </button>
              <button
                type="button"
                onClick={() => handleAction('toggle-motor-isolator-tag')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  state.motorIsolatorTagged ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Tag className="h-3 w-3" />
                {state.motorIsolatorTagged
                  ? pick('Isolator Tag ✓', 'Label Isolator ✓', '断路器タグ ✓')
                  : pick('Tag Isolator', 'Labeli Isolator', '断路器タグ')}
              </button>
            </div>

            {(scenario.hasPressureSystem || scenario.hasGravityBlock) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {scenario.hasPressureSystem && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction('toggle-process-valve')}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        state.processValveClosed ? 'm3-btn-filled' : 'glass-pill'
                      }`}
                    >
                      {state.processValveClosed
                        ? pick('Process Valve SHUT ✓', 'Katup Proses TUTUP ✓', '遮断弁 閉 ✓')
                        : pick('Shut Process Valve', 'Tutup Katup Proses', '遮断弁を閉じる')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('toggle-process-valve-lock')}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        state.processValveLocked ? 'm3-btn-filled' : 'glass-pill'
                      }`}
                    >
                      {state.processValveLocked
                        ? pick('Valve Locked ✓', 'Katup Terkunci ✓', 'バルブ施錠 ✓')
                        : pick('Lock Valve', 'Kunci Katup', 'バルブ施錠')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('toggle-bleed-valve')}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        state.bleedValveOpen ? 'm3-btn-filled' : 'glass-pill'
                      }`}
                    >
                      {state.bleedValveOpen
                        ? pick('Bleed Valve OPEN ✓', 'Katup Kuras BUKA ✓', 'ブリード弁 開 ✓')
                        : pick('Open Bleed/Drain', 'Buka Katup Kuras', 'ブリード弁を開く')}
                    </button>
                  </>
                )}
                {scenario.hasGravityBlock && (
                  <button
                    type="button"
                    onClick={() => handleAction('toggle-gravity-block')}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                      state.gravityBlockInstalled ? 'm3-btn-filled' : 'glass-pill'
                    }`}
                  >
                    {state.gravityBlockInstalled
                      ? pick('Safety Block IN ✓', 'Blok Pengaman TERPASANG ✓', '安全ブロック設置 ✓')
                      : pick('Insert Safety Block', 'Pasang Blok Pengaman', '安全ブロック挿入')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Schematic + Test-Before-Touch + Fault Audit */}
        <div className="space-y-4 lg:col-span-7">
          {/* 5. Interactive Plant Isolation Schematic */}
          <div data-tour="loto-schematic" className="glass-panel rounded-[28px] p-4 sm:p-5">
            <LotoSafetySvg state={state} evaluation={evaluation} onAction={handleAction} />
          </div>

          {/* 6. Zero-Energy Verification (Live-Dead-Live & Try-Out) */}
          <div data-tour="loto-verification" className="glass-panel rounded-[28px] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface)]">
                <Gauge className="h-4 w-4 text-[var(--md-primary)]" />
                {pick(
                  'Test Before Touch (Live-Dead-Live & Try-Out)',
                  'Verifikasi Tegangan Nol (Live-Dead-Live) & Uji Coba Start (Try-Out)',
                  '無電圧検証（Live-Dead-Live & Try-Out）'
                )}
              </span>
              <span className="font-mono text-xs text-[var(--md-on-surface-variant)]">
                {pick('Terminal Box:', 'Kotak Terminal:', '端子箱:')}{' '}
                <strong className="text-[var(--md-on-surface)]">
                  {evaluation.effectiveMotorTerminalVoltageV.toFixed(1)} V AC
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
                onClick={() => handleAction('advance-ldl')}
                className="m3-btn-filled w-full py-2.5 text-xs font-bold"
              >
                {ldlButtonLabel()}
              </button>
              <button
                type="button"
                onClick={() => handleAction('perform-tryout')}
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition ${
                  evaluation.isTryOutComplete ? 'm3-btn-filled' : 'glass-pill'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                {evaluation.isTryOutComplete
                  ? pick('Uji Coba Start (Try-Out) Passed ✓', 'Uji Coba Start (Try-Out) Lulus ✓', '起動試行（Try-Out）合格 ✓')
                  : pick('Perform Start Try-Out', 'Lakukan Uji Coba Start (Try-Out)', '起動試行（Try-Out）を実施')}
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
