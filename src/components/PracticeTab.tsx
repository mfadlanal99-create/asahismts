import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  HelpCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useLanguage } from '../context/LanguageContext';
import type { PracticeProblem } from '../types/simulator';

interface PracticeTabProps {
  simulatorId: string;
  problems: PracticeProblem[];
  onGoToQuiz?: () => void;
}

interface ProblemState {
  input: string;
  checked: boolean;
  isCorrect: boolean | null;
  showHint: boolean;
  showSolution: boolean;
}

export function PracticeTab({
  simulatorId,
  problems,
  onGoToQuiz,
}: PracticeTabProps) {
  const [states, setStates] = useState<Record<string, ProblemState>>({});
  const { pick } = useLanguage();
  const {
    getSimulatorProgress,
    markPracticeSolved,
    resetSimulatorPractice,
  } = useProgress();

  const simProgress = getSimulatorProgress(simulatorId);
  const solvedIds = new Set(simProgress.solvedPracticeIds);

  if (problems.length === 0) {
    return (
      <div className="glass-panel rounded-[28px] p-8 text-center text-[var(--md-on-surface-variant)]">
        Practice problems for this simulator are coming soon.
      </div>
    );
  }

  const getProblemState = (id: string): ProblemState =>
    states[id] ?? {
      input: '',
      checked: false,
      isCorrect: null,
      showHint: false,
      showSolution: false,
    };

  const updateState = (id: string, patch: Partial<ProblemState>) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...getProblemState(id), ...patch },
    }));
  };

  const handleCheck = (problem: PracticeProblem) => {
    const current = getProblemState(problem.id);
    const parsed = Number.parseFloat(current.input.trim());
    if (Number.isNaN(parsed)) {
      updateState(problem.id, { checked: true, isCorrect: false });
      return;
    }
    const isCorrect =
      Math.abs(parsed - problem.targetValue) <= problem.tolerance;
    updateState(problem.id, { checked: true, isCorrect });
    if (isCorrect) {
      markPracticeSolved(simulatorId, problem.id);
    }
  };

  const handleResetAll = () => {
    setStates({});
    resetSimulatorPractice(simulatorId);
  };

  const solvedCount = problems.filter(
    (p) => solvedIds.has(p.id) || getProblemState(p.id).isCorrect === true
  ).length;
  const allSolved = solvedCount === problems.length && problems.length > 0;

  return (
    <div className="space-y-5">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-4">
        <div className="text-sm text-[var(--md-on-surface-variant)]">
          {pick('Solved', 'Selesai', '解答済み')}{' '}
          <span className="font-mono font-bold text-[var(--md-primary)]">
            {solvedCount} / {problems.length}
          </span>{' '}
          {pick('problems', 'soal', '問')}
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {pick('Reset All', 'Reset Semua', 'すべてリセット')}
        </button>
      </div>

      {allSolved && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-tertiary-container)] px-5 py-4 text-[var(--md-on-tertiary-container)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-on-tertiary-container)]/12">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {pick(
                  'All Practice Problems Completed!',
                  'Semua Soal Latihan Selesai!',
                  'すべての演習問題を完了しました！'
                )}
              </div>
              <div className="text-xs opacity-85">
                {pick(
                  'Ready to verify your competency in the Quiz tab?',
                  'Siap menguji kompetensi Anda di tab Kuis?',
                  'クイズタブで習熟度を確認しますか？'
                )}
              </div>
            </div>
          </div>

          {onGoToQuiz && (
            <button
              type="button"
              onClick={onGoToQuiz}
              className="m3-btn-filled inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              {pick('Take Quiz', 'Ikuti Kuis', 'クイズへ進む')}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {problems.map((problem, idx) => {
        const state = getProblemState(problem.id);
        const previouslySolved = solvedIds.has(problem.id);

        return (
          <div
            key={problem.id}
            className="glass-card flex h-full flex-col rounded-[28px] p-6"
          >
            <div className="mb-4 flex flex-1 items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--md-primary-container)] font-mono text-xs font-bold text-[var(--md-on-primary-container)]">
                  P{idx + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-[var(--md-on-surface)]">
                  {problem.prompt}
                </p>
              </div>
              {previouslySolved && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--md-tertiary-container)] px-2.5 py-1 text-[11px] font-bold text-[var(--md-on-tertiary-container)]">
                  <CheckCircle2 className="h-3 w-3" />
                  {pick('Solved', 'Selesai', '解答済み')}
                </span>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center overflow-hidden rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] transition focus-within:border-[var(--md-primary)] focus-within:ring-2 focus-within:ring-[var(--md-primary)]/20">
                <input
                  type="number"
                  step="any"
                  value={state.input}
                  onChange={(e) =>
                    updateState(problem.id, {
                      input: e.target.value,
                      checked: false,
                      isCorrect: null,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCheck(problem);
                  }}
                  placeholder={pick('Enter value...', 'Masukkan nilai...', '数値を入力...')}
                  className="w-36 bg-transparent px-4 py-2 font-mono text-sm text-[var(--md-on-surface)] outline-none placeholder:text-[var(--md-on-surface-variant)]"
                />
                <span className="border-l border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] px-3 py-2 font-mono text-xs font-semibold text-[var(--md-on-surface-variant)]">
                  {problem.unit}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCheck(problem)}
                className="m3-btn-filled px-4 py-2 text-xs font-bold"
              >
                {pick('Check Answer', 'Periksa Jawaban', '答え合わせ')}
              </button>

              <button
                type="button"
                onClick={() =>
                  updateState(problem.id, { showHint: !state.showHint })
                }
                className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
              >
                <HelpCircle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                {state.showHint
                  ? pick('Hide Hint', 'Tutup Petunjuk', 'ヒントを隠す')
                  : pick('Hint', 'Petunjuk', 'ヒント')}
              </button>

              <button
                type="button"
                onClick={() =>
                  updateState(problem.id, { showSolution: !state.showSolution })
                }
                className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold"
              >
                <Eye className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                {state.showSolution
                  ? pick('Hide Solution', 'Tutup Solusi', '解法を隠す')
                  : pick('Solution', 'Solusi', '解法')}
              </button>
            </div>

            {state.checked && (
              <div
                className={`mt-3 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm ${
                  state.isCorrect
                    ? 'border border-emerald-300/60 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'border border-rose-300/60 bg-rose-50/80 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300'
                }`}
              >
                {state.isCorrect ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>
                      {pick('Correct! Target is', 'Benar! Targetnya', '正解！目標値は')}{' '}
                      {problem.targetValue} {problem.unit} (±{problem.tolerance}{' '}
                      {problem.unit}).
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>
                      {pick(
                        `Not quite within ±${problem.tolerance} ${problem.unit}. Try checking your units or open the hint.`,
                        `Belum dalam toleransi ±${problem.tolerance} ${problem.unit}. Periksa satuan atau buka petunjuk.`,
                        `±${problem.tolerance} ${problem.unit} の許容範囲外です。単位を確認するかヒントを開いてください。`
                      )}
                    </span>
                  </>
                )}
              </div>
            )}

            {state.showHint && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/20 dark:text-amber-200">
                <span className="font-semibold">
                  {pick('Hint', 'Petunjuk', 'ヒント')}:
                </span>{' '}
                {problem.hint}
              </div>
            )}

            {state.showSolution && (
              <div className="mt-3 rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] p-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Step-by-Step Solution', 'Langkah Penyelesaian', 'ステップ別解法')}{' '}
                  ({pick('Answer', 'Jawaban', '解答')}: {problem.targetValue}{' '}
                  {problem.unit})
                </div>
                <ol className="list-inside list-decimal space-y-1.5 text-sm text-[var(--md-on-surface)]">
                  {problem.solutionSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
