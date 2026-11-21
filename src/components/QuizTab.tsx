import { useMemo, useState } from 'react';
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  RotateCcw,
  Shuffle,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import type { QuizQuestion } from '../types/simulator';

interface QuizTabProps {
  simulatorId: string;
  questions: QuizQuestion[];
}

function shuffleOrder(count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function QuizTab({ simulatorId, questions }: QuizTabProps) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [shuffleOnRetake, setShuffleOnRetake] = useState(true);
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: questions.length }, (_, i) => i)
  );

  const { pick } = useLanguage();
  const { getSimulatorProgress, recordQuizScore } = useProgress();
  const simProgress = getSimulatorProgress(simulatorId);

  const orderedQuestions = useMemo(
    () =>
      order.length === questions.length
        ? order.map((idx) => questions[idx])
        : questions,
    [order, questions]
  );

  if (questions.length === 0) {
    return (
      <div className="glass-panel rounded-[28px] p-8 text-center text-[var(--md-on-surface-variant)]">
        Quiz questions for this simulator are coming soon.
      </div>
    );
  }

  const answeredCount = Object.keys(selected).length;
  const correctCount = questions.filter(
    (q) => selected[q.id] === q.correctIndex
  ).length;
  const currentPct = Math.round((correctCount / questions.length) * 100);
  const isMastered = submitted && currentPct >= 80;

  const bestPct =
    simProgress.bestQuizScore !== null
      ? Math.round(
          (simProgress.bestQuizScore /
            (simProgress.quizTotal || questions.length)) *
            100
        )
      : null;

  const handleSubmit = () => {
    setSubmitted(true);
    recordQuizScore(simulatorId, correctCount, questions.length);
  };

  const handleReset = () => {
    setSelected({});
    setSubmitted(false);
    if (shuffleOnRetake) {
      setOrder(shuffleOrder(questions.length));
    } else {
      setOrder(Array.from({ length: questions.length }, (_, i) => i));
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[28px] px-5 py-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--md-on-surface-variant)]">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[var(--md-primary)]" />
            {submitted ? (
              <span>
                {pick('Score', 'Skor', 'スコア')}:{' '}
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {correctCount} / {questions.length}
                </span>{' '}
                ({currentPct}%)
              </span>
            ) : (
              <span>
                {pick('Answered', 'Dijawab', '回答済み')}{' '}
                <span className="font-mono font-bold text-[var(--md-primary)]">
                  {answeredCount} / {questions.length}
                </span>
              </span>
            )}
          </div>

          {bestPct !== null && (
            <span className="glass-pill rounded-full px-3 py-1 font-mono text-[11px] font-semibold">
              {pick('Best', 'Terbaik', '最高')}: {bestPct}%
            </span>
          )}

          {(isMastered || (bestPct !== null && bestPct >= 80)) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--md-tertiary-container)] px-3 py-1 text-[11px] font-bold text-[var(--md-on-tertiary-container)]">
              <BadgeCheck className="h-3.5 w-3.5" />
              {pick('Mastered', 'Dikuasai', '習得済み')} (&ge;80%)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="glass-pill inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold select-none">
            <input
              type="checkbox"
              checked={shuffleOnRetake}
              onChange={(e) => setShuffleOnRetake(e.target.checked)}
              className="h-3.5 w-3.5 rounded"
            />
            <Shuffle className="h-3 w-3" />
            {pick('Shuffle on Retake', 'Acak Saat Mengulang', '再挑戦時にシャッフル')}
          </label>

          {!submitted ? (
            <button
              type="button"
              disabled={answeredCount === 0}
              onClick={handleSubmit}
              className="m3-btn-filled px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pick('Submit Quiz', 'Selesaikan Kuis', 'クイズを提出')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="m3-btn-tonal inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {pick('Retake Quiz', 'Ulangi Kuis', '再挑戦')}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {orderedQuestions.map((q, qIdx) => {
        const chosen = selected[q.id];

        return (
          <div
            key={q.id}
            className="glass-card flex h-full flex-col rounded-[28px] p-6"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--md-primary-container)] font-mono text-xs font-bold text-[var(--md-on-primary-container)]">
                Q{qIdx + 1}
              </span>
              <h3 className="text-sm font-semibold leading-relaxed text-[var(--md-on-surface)]">
                {q.question}
              </h3>
            </div>

            <div className="flex-1 space-y-2.5">
              {q.options.map((option, optIdx) => {
                const isSelected = chosen === optIdx;
                const isCorrect = optIdx === q.correctIndex;

                let optionStyle =
                  'border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]';

                if (!submitted && isSelected) {
                  optionStyle =
                    'border-[var(--md-primary)] bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] font-semibold';
                } else if (submitted && isCorrect) {
                  optionStyle =
                    'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 font-semibold dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-200';
                } else if (submitted && isSelected && !isCorrect) {
                  optionStyle =
                    'border-rose-400/80 bg-rose-50/80 text-rose-900 dark:border-rose-500/50 dark:bg-rose-500/20 dark:text-rose-200';
                }

                return (
                  <button
                    key={`${q.id}-${optIdx}`}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [q.id]: optIdx }))
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/25 font-mono text-xs font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {submitted && isCorrect && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {submitted && isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-auto pt-4">
                <div className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-4 py-3 text-xs leading-relaxed text-[var(--md-on-surface-variant)]">
                  <span className="font-bold text-[var(--md-primary)]">
                    {pick('Explanation', 'Penjelasan', '解説')}:{' '}
                  </span>
                  {q.explanation}
                </div>
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}
