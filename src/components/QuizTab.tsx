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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
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
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-[#001F6B] dark:text-[#60A5FA]" />
            {submitted ? (
              <span>
                {pick('Score', 'Skor', 'スコア')}:{' '}
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {correctCount} / {questions.length}
                </span>{' '}
                ({currentPct}%)
              </span>
            ) : (
              <span>
                {pick('Answered', 'Dijawab', '回答済み')}{' '}
                <span className="font-mono font-semibold text-[#001F6B] dark:text-[#60A5FA]">
                  {answeredCount} / {questions.length}
                </span>
              </span>
            )}
          </div>

          {bestPct !== null && (
            <span className="glass-pill rounded-full px-2.5 py-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              {pick('Best', 'Terbaik', '最高')}: {bestPct}%
            </span>
          )}

          {(isMastered || (bestPct !== null && bestPct >= 80)) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <BadgeCheck className="h-3.5 w-3.5" />
              {pick('Mastered', 'Terkompetensi', '習得済み')} (&ge;80%)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="glass-pill inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 select-none dark:text-slate-300">
            <input
              type="checkbox"
              checked={shuffleOnRetake}
              onChange={(e) => setShuffleOnRetake(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-[#001F6B]"
            />
            <Shuffle className="h-3 w-3" />
            {pick('Shuffle on Retake', 'Acak Saat Ulang', '再挑戦時にシャッフル')}
          </label>

          {!submitted ? (
            <button
              type="button"
              disabled={answeredCount === 0}
              onClick={handleSubmit}
              className="rounded-lg bg-[#001F6B] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#002D9C] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#002D9C] dark:text-white dark:hover:bg-[#3B82F6]"
            >
              {pick('Submit Quiz', 'Kirim Kuis', 'クイズを提出')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="glass-pill inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
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
            className="glass-card flex h-full flex-col rounded-2xl p-6 shadow-sm"
          >
            <div className="mb-4 flex items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#001F6B]/8 font-mono text-xs font-bold text-[#001F6B] dark:bg-white/5 dark:text-[#60A5FA]">
                Q{qIdx + 1}
              </span>
              <h3 className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                {q.question}
              </h3>
            </div>

            <div className="flex-1 space-y-2.5">
              {q.options.map((option, optIdx) => {
                const isSelected = chosen === optIdx;
                const isCorrect = optIdx === q.correctIndex;

                let optionStyle =
                  'border-white/60 bg-white/40 text-slate-700 hover:border-slate-300 hover:bg-white/70 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-slate-900/60';

                if (!submitted && isSelected) {
                  optionStyle =
                    'border-[#001F6B]/40 bg-[#001F6B]/8 text-[#001F6B] font-medium dark:border-[#60A5FA]/40 dark:bg-[#3B82F6]/15 dark:text-white';
                } else if (submitted && isCorrect) {
                  optionStyle =
                    'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 font-medium backdrop-blur-sm dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-200';
                } else if (submitted && isSelected && !isCorrect) {
                  optionStyle =
                    'border-rose-400/80 bg-rose-50/80 text-rose-900 backdrop-blur-sm dark:border-rose-500/50 dark:bg-rose-500/20 dark:text-rose-200';
                }

                return (
                  <button
                    key={`${q.id}-${optIdx}`}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [q.id]: optIdx }))
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition backdrop-blur-md ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current/25 font-mono text-xs">
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
                <div className="rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-xs leading-relaxed text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
                  <span className="font-semibold text-[#001F6B] dark:text-[#60A5FA]">
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
