import { CheckCircle2, EyeOff, HelpCircle, Shuffle, Wrench } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  DRIVE_FAULTS,
  type DriveFaultScenario,
  type DriveMode,
  type FaultId,
  type SpurGearResults,
  type VBeltParams,
  type VBeltResults,
} from './beltGearPhysics';

interface TroubleshootingPanelProps {
  activeFaultId: FaultId | null;
  isBlindMode: boolean;
  guessedFaultId: FaultId | null;
  driveMode: DriveMode;
  vBeltParams: VBeltParams;
  vBeltResults: VBeltResults;
  spurResults: SpurGearResults;
  onSelectFault: (fault: DriveFaultScenario, blind: boolean) => void;
  onGuessFault: (faultId: FaultId) => void;
  onExitTroubleshooting: () => void;
}

export function TroubleshootingPanel({
  activeFaultId,
  isBlindMode,
  guessedFaultId,
  driveMode,
  vBeltParams,
  vBeltResults,
  spurResults,
  onSelectFault,
  onGuessFault,
  onExitTroubleshooting,
}: TroubleshootingPanelProps) {
  const { pick } = useLanguage();
  const activeFault = DRIVE_FAULTS.find((f) => f.id === activeFaultId) ?? null;

  const isResolved = activeFault
    ? activeFault.isResolved(driveMode, vBeltParams, vBeltResults, spurResults)
    : false;

  const isDiagnosisCorrect =
    activeFault && guessedFaultId === activeFault.id;

  const handleRandomBlind = () => {
    const idx = Math.floor(Math.random() * DRIVE_FAULTS.length);
    onSelectFault(DRIVE_FAULTS[idx], true);
  };

  return (
    <div className="glass-panel rounded-[28px] border border-[var(--md-primary)]/35 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--md-outline-variant)]/50 pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-[var(--md-primary)]" />
          <h3 className="text-sm font-bold text-[var(--md-on-surface)]">
            {pick(
              'Field Drive Troubleshooting Lab',
              'Lab Pemecahan Masalah Penggerak Lapangan',
              '現場駆動トラブルシューティング実習'
            )}
          </h3>
          {isBlindMode && activeFault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <EyeOff className="h-3 w-3" />
              {pick('Blind Fault Active', 'Mode Gangguan Acak', 'ブラインド故障中')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRandomBlind}
            className="m3-btn-filled inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold"
          >
            <Shuffle className="h-3.5 w-3.5" />
            {pick('Blind Fault Challenge', 'Tantangan Gangguan Acak', 'ブラインド故障診断')}
          </button>
          <button
            type="button"
            onClick={onExitTroubleshooting}
            className="glass-pill rounded-full px-3.5 py-1.5 text-xs font-semibold"
          >
            {pick('Exit Lab', 'Keluar Lab', '実習終了')}
          </button>
        </div>
      </div>

      {/* Fault Selector Pills */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DRIVE_FAULTS.map((fault) => {
          const selected = !isBlindMode && activeFaultId === fault.id;
          return (
            <button
              key={fault.id}
              type="button"
              onClick={() => onSelectFault(fault, false)}
              className={`rounded-[20px] border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                selected
                  ? 'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] ring-1 ring-[var(--md-primary)]/30'
                  : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
              }`}
            >
              {pick(fault.title, fault.titleId, fault.titleJa)}
            </button>
          );
        })}
      </div>

      {/* Active Fault Inspection & Diagnosis */}
      {activeFault && (
        <div className="mt-3 space-y-3 rounded-[22px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-[var(--md-on-surface)]">
              {isBlindMode ? (
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  {pick(
                    'Inspect Drive Diagnostics (Temp, Slip, Vibration, Noise) & identify the fault below:',
                    'Periksa Diagnostik Penggerak (Suhu, Slip, Getaran, Kebisingan) & identifikasi gangguan di bawah:',
                    '駆動診断（温度・スリップ・振動・騒音）を確認し、以下の故障原因を選択してください：'
                  )}
                </span>
              ) : (
                <span>
                  {pick('Scenario:', 'Skenario:', 'シナリオ:')}{' '}
                  {pick(activeFault.title, activeFault.titleId, activeFault.titleJa)}
                </span>
              )}
            </div>

            {isResolved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {pick('Fault Resolved!', 'Gangguan Teratasi!', '故障解消！')}
              </span>
            )}
          </div>

          {!isBlindMode && (
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                activeFault.symptomSummary,
                activeFault.symptomSummaryId,
                activeFault.symptomSummaryJa
              )}{' '}
              <span className="font-semibold text-[var(--md-on-surface)]">
                {pick('Fix:', 'Perbaikan:', '対処法:')}{' '}
                {pick(activeFault.fixHint, activeFault.fixHintId, activeFault.fixHintJa)}
              </span>
            </p>
          )}

          {isBlindMode && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {DRIVE_FAULTS.map((f) => {
                  const picked = guessedFaultId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onGuessFault(f.id)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        picked
                          ? f.id === activeFault.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          : 'border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                      }`}
                    >
                      {pick(f.title, f.titleId, f.titleJa)}
                    </button>
                  );
                })}
              </div>
              {guessedFaultId && (
                <p
                  className={`text-xs font-medium ${
                    isDiagnosisCorrect
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {isDiagnosisCorrect
                    ? pick(
                        `Correct diagnosis (${activeFault.title})! Now adjust the drive parameters to resolve it.`,
                        `Diagnosis tepat (${activeFault.titleId})! Sekarang setel parameter penggerak untuk mengatasinya.`,
                        `正解です（${activeFault.titleJa}）！次にパラメータを調整して故障を解消してください。`
                      )
                    : pick(
                        'Not quite — check the Live Drive Diagnostics strip (Belt Temp °C, Slip %, Vibration mm/s, Noise dBA) and Canvas indicators.',
                        'Belum tepat — periksa strip Diagnostik Penggerak (Suhu °C, Slip %, Getaran mm/s, Kebisingan dBA) dan indikator kanvas.',
                        '不正解です — 駆動診断（温度 °C・スリップ %・振動 mm/s・騒音 dBA）と図解インジケータを確認してください。'
                      )}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
