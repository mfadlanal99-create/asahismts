import { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Printer,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { translateCategory } from '../i18n/simulatorRegistry';
import type { SimulatorMeta } from '../types/simulator';

interface CompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulators: SimulatorMeta[];
}

export function CompetencyModal({
  isOpen,
  onClose,
  simulators,
}: CompetencyModalProps) {
  const [reportDate] = useState(() => new Date().toLocaleDateString());
  const { language, pick } = useLanguage();

  const {
    progress,
    setTraineeName,
    getSimulatorProgress,
    isSimulatorMastered,
    resetAllProgress,
  } = useProgress();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalLabs = simulators.length;
  const masteredCount = simulators.filter((s) => isSimulatorMastered(s)).length;
  const totalPractice = simulators.reduce(
    (sum, s) => sum + s.practice.length,
    0
  );
  const solvedPractice = simulators.reduce(
    (sum, s) => sum + getSimulatorProgress(s.id).solvedPracticeIds.length,
    0
  );

  const quizPercentages = simulators
    .map((s) => {
      const sp = getSimulatorProgress(s.id);
      if (sp.bestQuizScore === null) return null;
      const denom = sp.quizTotal > 0 ? sp.quizTotal : s.quiz.length;
      return denom > 0 ? (sp.bestQuizScore / denom) * 100 : null;
    })
    .filter((v): v is number => v !== null);

  const avgQuizPct =
    quizPercentages.length > 0
      ? Math.round(
          quizPercentages.reduce((a, b) => a + b, 0) / quizPercentages.length
        )
      : 0;

  const readinessPct =
    totalLabs > 0
      ? Math.round(
          ((masteredCount / totalLabs) * 0.6 +
            (totalPractice > 0 ? solvedPractice / totalPractice : 0) * 0.4) *
            100
        )
      : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="competency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm print:static print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="glass-panel animate-modal-enter relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-2xl print:max-h-none print:rounded-none print:border-0 print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--md-outline-variant)]/50 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-primary)]">
                {pick(
                  'Asahi-SMTS Competency Record',
                  'Catatan Kompetensi Asahi-SMTS',
                  'Asahi-SMTS 習熟記録'
                )}
              </div>
              <h2
                id="competency-modal-title"
                className="text-lg font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-xl"
              >
                {pick(
                  'Mechanical Maintenance Training Report',
                  'Laporan Pelatihan Pemeliharaan Mekanik',
                  '機械保全訓練レポート'
                )}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close competency report"
            className="glass-pill inline-flex h-9 w-9 items-center justify-center rounded-full print:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Trainee & Readiness Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card rounded-[24px] p-4">
              <label
                htmlFor="trainee-name-input"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]"
              >
                {pick(
                  'Trainee / Technician Name',
                  'Nama Peserta / Teknisi',
                  '受講者・技術者氏名'
                )}
              </label>
              <input
                id="trainee-name-input"
                type="text"
                value={progress.traineeName}
                onChange={(e) => setTraineeName(e.target.value)}
                placeholder={pick(
                  'Enter trainee full name...',
                  'Masukkan nama lengkap peserta...',
                  '氏名を入力...'
                )}
                className="w-full rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-4 py-2 text-sm font-medium text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] focus:border-[var(--md-primary)] focus:outline-none"
              />
            </div>

            <div className="glass-card grid grid-cols-3 gap-2 rounded-[24px] p-4 text-center">
              <div>
                <div className="font-mono text-lg font-extrabold text-[var(--md-primary)]">
                  {readinessPct}%
                </div>
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Readiness', 'Kesiapan', '習熟度')}
                </div>
              </div>
              <div>
                <div className="font-mono text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {masteredCount}/{totalLabs}
                </div>
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Mastered', 'Dikuasai', '習得済み')}
                </div>
              </div>
              <div>
                <div className="font-mono text-lg font-extrabold text-[var(--md-primary)]">
                  {avgQuizPct}%
                </div>
                <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                  {pick('Avg Quiz', 'Rata-rata Kuis', '平均クイズ')}
                </div>
              </div>
            </div>
          </div>

          {/* Per-Lab Completion Table */}
          <div className="glass-card overflow-hidden rounded-[24px]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  <th className="px-4 py-3">
                    {pick('Simulator Lab', 'Lab Simulator', 'シミュレータラボ')}
                  </th>
                  <th className="px-3 py-3 text-center">
                    {pick('Visited', 'Dikunjungi', '受講')}
                  </th>
                  <th className="px-3 py-3 text-center">
                    {pick('Practice', 'Latihan', '演習')}
                  </th>
                  <th className="px-3 py-3 text-center">
                    {pick('Best Quiz', 'Skor Kuis Terbaik', '最高点')}
                  </th>
                  <th className="px-4 py-3 text-right">
                    {pick('Status', 'Status', '状態')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-outline-variant)]/35">
                {simulators.map((sim) => {
                  const sp = getSimulatorProgress(sim.id);
                  const mastered = isSimulatorMastered(sim);
                  const quizTotal =
                    sp.quizTotal > 0 ? sp.quizTotal : sim.quiz.length;
                  const quizPct =
                    sp.bestQuizScore !== null && quizTotal > 0
                      ? Math.round((sp.bestQuizScore / quizTotal) * 100)
                      : null;

                  return (
                    <tr
                      key={sim.id}
                      className="bg-[var(--md-surface-container-low)] transition hover:bg-[var(--md-surface-container)]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--md-on-surface)]">
                          {sim.shortTitle}
                        </div>
                        <div className="text-[11px] text-[var(--md-on-surface-variant)]">
                          {translateCategory(sim.category, language)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {sp.visited ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <span className="text-[var(--md-on-surface-variant)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-[var(--md-on-surface)]">
                        {sp.solvedPracticeIds.length}/{sim.practice.length}
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-[var(--md-on-surface)]">
                        {quizPct !== null ? `${quizPct}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {mastered ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--md-tertiary-container)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--md-on-tertiary-container)]">
                            <Award className="h-3 w-3" />
                            {pick('Mastered', 'Dikuasai', '習得済み')}
                          </span>
                        ) : sp.visited ? (
                          <span className="inline-block rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--md-on-primary-container)]">
                            {pick('In Progress', 'Dalam Proses', '受講中')}
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-[var(--md-surface-container-highest)] px-2.5 py-0.5 text-[11px] text-[var(--md-on-surface-variant)]">
                            {pick('Not Started', 'Belum Dimulai', '未開始')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official Seal & Attribution */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-4 py-3 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-[var(--md-on-surface-variant)]">
              <UserCheck className="h-4 w-4 text-[var(--md-primary)]" />
              Asahimas Smart Maintenance Training System (Asahi-SMTS) · Made by{' '}
              <strong className="font-bold text-[var(--md-on-surface)]">
                M. Fadlan Alamsyah
              </strong>
            </span>
            <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
              {reportDate}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-6 py-4 print:hidden">
          <button
            type="button"
            onClick={resetAllProgress}
            className="glass-pill inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:border-rose-500/40 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {pick('Reset Progress', 'Reset Progres', '進捗をリセット')}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="m3-btn-filled inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
          >
            <Printer className="h-4 w-4" />
            {pick('Print Report', 'Cetak Laporan', 'レポートを印刷')}
          </button>
        </div>
      </div>
    </div>
  );
}
