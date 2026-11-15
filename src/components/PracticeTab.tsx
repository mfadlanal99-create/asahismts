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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
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
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 shadow-sm">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {pick('Solved', 'Selesai', '解答済み')}{' '}
          <span className="font-mono font-semibold text-[#001F6B] dark:text-[#60A5FA]">
            {solvedCount} / {problems.length}
          </span>{' '}
          {pick('problems', 'soal', '問')}
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          className="glass-pill inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {pick('Reset All', 'Reset Semua', 'すべてリセット')}
        </button>
      </div>

      {allSolved && (
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-300/60 bg-emerald-50/70 px-5 py-4 text-emerald-900 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
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
            className="glass-card flex h-full flex-col rounded-2xl p-6 shadow-sm"
          >
            <div className="mb-4 flex flex-1 items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#001F6B]/8 font-mono text-xs font-bold text-[#001F6B] dark:bg-white/5 dark:text-[#60A5FA]">
                  P{idx + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                  {problem.prompt}
                </p>
              </div>
              {previouslySolved && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  {pick('Solved', 'Selesai', '解答済み')}
                </span>
              )}
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center overflow-hidden rounded-xl border border-white/60 bg-white/70 shadow-xs focus-within:border-[#002D9C] dark:border-white/10 dark:bg-slate-950/70 dark:focus-within:border-[#60A5FA]">
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
                  className="w-40 bg-transparent px-3 py-2 font-mono text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
                <span className="border-l border-white/60 bg-white/40 px-3 py-2 font-mono text-xs text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
                  {problem.unit}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCheck(problem)}
                className="rounded-xl bg-[#001F6B] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#002D9C] dark:bg-[#002D9C] dark:text-white dark:hover:bg-[#3B82F6]"
              >
                {pick('Check Answer', 'Periksa Jawaban', '答え合わせ')}
              </button>

              <button
                type="button"
                onClick={() =>
                  updateState(problem.id, { showHint: !state.showHint })
                }
                className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
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
                className="glass-pill inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Eye className="h-3.5 w-3.5 text-[#001F6B] dark:text-[#60A5FA]" />
                {state.showSolution
                  ? pick('Hide Solution', 'Tutup Solusi', '解法を隠す')
                  : pick('Solution', 'Solusi', '解法')}
              </button>
            </div>

            {state.checked && (
              <div
                className={`mt-3 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm backdrop-blur-md ${
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
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/25 dark:bg-amber-950/20 dark:text-amber-200">
                <span className="font-semibold">
                  {pick('Hint', 'Petunjuk', 'ヒント')}:
                </span>{' '}
                {problem.hint}
              </div>
            )}

            {state.showSolution && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/80">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pick('Step-by-Step Solution', 'Langkah Penyelesaian', 'ステップ別解法')}{' '}
                  ({pick('Answer', 'Jawaban', '解答')}: {problem.targetValue}{' '}
                  {problem.unit})
                </div>
                <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
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
