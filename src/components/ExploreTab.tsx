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
      <div className="glass-panel relative overflow-hidden rounded-[28px] p-10 text-center text-[var(--md-on-surface-variant)]">
        <p className="relative font-medium">
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
          className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 sm:p-7"
        >
          <div className="relative flex-1">
            {/* Header: numbered badge & section title */}
            <div className="mb-3.5 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] font-mono text-xs font-bold text-[var(--md-on-primary-container)]">
                {idx + 1}
              </span>
              <h2 className="text-lg font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-xl">
                {section.title}
              </h2>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-[var(--md-on-surface-variant)]">
              {section.summary}
            </p>

            {/* Formula cards */}
            {section.equations.length > 0 && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {section.equations.map((eq) => (
                  <div
                    key={eq.label}
                    className="glass-card group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] p-4"
                  >
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                        <Calculator className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                        <span>{eq.label}</span>
                      </div>
                      <div className="font-mono text-base font-bold tracking-tight text-[var(--md-primary)]">
                        {eq.formula}
                      </div>
                    </div>
                    {eq.note && (
                      <p className="mt-1.5 text-xs leading-normal text-[var(--md-on-surface-variant)]">
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
              <div className="overflow-hidden rounded-[24px] border border-[var(--md-outline-variant)]/60 bg-[var(--md-tertiary-container)]/55 p-5">
              <div className="mb-3.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-tertiary-container)] px-3 py-1 text-xs font-bold text-[var(--md-on-tertiary-container)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  {pick('Worked Example', 'Contoh Soal', '例題')}
                </span>
                <span className="text-sm font-bold text-[var(--md-on-surface)]">
                  {section.workedExample.title}
                </span>
              </div>

              <div className="mb-3 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Given', 'Diketahui', '既知条件')}
                </div>
                <div className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-low)] p-3">
                  <ul className="list-inside list-disc space-y-1 text-xs text-[var(--md-on-surface)] sm:text-sm">
                    {section.workedExample.given.map((item) => (
                      <li key={item} className="font-mono text-xs sm:text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-3.5 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  {pick('Solution Steps', 'Langkah Penyelesaian', '解法ステップ')}
                </div>
                <div className="rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-low)] p-3">
                  <ol className="list-inside list-decimal space-y-1.5 text-xs text-[var(--md-on-surface)] sm:text-sm">
                    {section.workedExample.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-[var(--md-primary-container)] px-4 py-2.5 text-xs font-bold text-[var(--md-on-primary-container)] sm:text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
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
