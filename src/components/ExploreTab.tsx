import { BookOpen, Calculator, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { ExploreSection } from '../types/simulator';

interface ExploreTabProps {
  sections: ExploreSection[];
}

export function ExploreTab({ sections }: ExploreTabProps) {
  const { pick } = useLanguage();

  if (sections.length === 0) {
    return (
      <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/60 p-10 text-center text-slate-500 shadow-lg backdrop-blur-xl dark:border-white/10 dark:text-slate-400">
        <p className="relative font-medium text-slate-600 dark:text-slate-300">
          {pick(
            'Theory and equations for this simulator are coming soon.',
            'Teori dan persamaan untuk simulator ini akan segera hadir.',
            'このシミュレータの理論と方程式は近日公開予定です。'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {sections.map((section, idx) => (
        <section
          key={section.title}
          className="glass-panel relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-md transition-shadow hover:shadow-lg sm:p-7"
        >
          <div className="relative flex-1">
            {/* Header: numbered badge & section title */}
            <div className="mb-3.5 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#001F6B]/8 font-mono text-xs font-bold text-[#001F6B] dark:bg-white/5 dark:text-[#60A5FA]">
                {idx + 1}
              </span>
              <h2 className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-white sm:text-xl">
                {section.title}
              </h2>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {section.summary}
            </p>

            {/* Formula cards */}
            {section.equations.length > 0 && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {section.equations.map((eq) => (
                  <div
                    key={eq.label}
                    className="glass-card group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-4 shadow-xs"
                  >
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <Calculator className="h-3.5 w-3.5 text-[#001F6B] dark:text-[#60A5FA]" />
                        <span>{eq.label}</span>
                      </div>
                      <div className="font-mono text-base font-bold tracking-tight text-[#001F6B] dark:text-[#60A5FA]">
                        {eq.formula}
                      </div>
                    </div>
                    {eq.note && (
                      <p className="mt-1.5 text-xs leading-normal text-slate-500 dark:text-slate-400">
                        {eq.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worked Example */}
          {section.workedExample && (
            <div className="relative mt-auto pt-2">
              <div className="overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-50/80 via-emerald-50/40 to-teal-50/60 p-5 shadow-xs backdrop-blur-md dark:border-emerald-400/20 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-teal-950/30">
              <div className="mb-3.5 flex items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-white/70 px-2.5 py-1 text-xs font-semibold text-emerald-800 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {pick('Worked Example', 'Contoh Soal', '例題')}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {section.workedExample.title}
                </span>
              </div>

              <div className="mb-3 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pick('Given', 'Diketahui', '既知条件')}
                </div>
                <div className="rounded-xl border border-white/60 bg-white/60 p-3 shadow-2xs backdrop-blur-xs dark:border-white/5 dark:bg-slate-900/60">
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 dark:text-slate-300 sm:text-sm">
                    {section.workedExample.given.map((item) => (
                      <li key={item} className="font-mono text-xs sm:text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-3.5 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pick('Solution Steps', 'Langkah Penyelesaian', '解法ステップ')}
                </div>
                <div className="rounded-xl border border-white/60 bg-white/60 p-3 shadow-2xs backdrop-blur-xs dark:border-white/5 dark:bg-slate-900/60">
                  <ol className="list-inside list-decimal space-y-1.5 text-xs text-slate-700 dark:text-slate-300 sm:text-sm">
                    {section.workedExample.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="glass-pill flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-100/80 px-3.5 py-2.5 text-xs font-bold text-emerald-900 shadow-xs backdrop-blur-sm dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-200 sm:text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {pick('Answer', 'Jawaban', '解答')}:{' '}
                  <span className="font-mono">{section.workedExample.answer}</span>
                </span>
              </div>
            </div>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
