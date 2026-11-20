import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  getTutorialSeenKey,
  TUTORIAL_AUTO_DISABLED_KEY,
} from '../data/tutorials';
import type { SimulatorMeta } from '../types/simulator';
import type { TutorialStep } from '../types/tutorial';
import { SimulatorIcon } from './SimulatorIcon';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface SpotlightState {
  stepKey: string;
  rect: SpotlightRect | null;
}

interface SimulatorTutorialModalProps {
  isOpen: boolean;
  meta: SimulatorMeta;
  steps: TutorialStep[];
  onClose: () => void;
}

export function SimulatorTutorialModal({
  isOpen,
  meta,
  steps,
  onClose,
}: SimulatorTutorialModalProps) {
  const { pick } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [prevOpenKey, setPrevOpenKey] = useState(`${isOpen}:${meta.id}`);
  const [spotlightState, setSpotlightState] = useState<SpotlightState | null>(
    null
  );
  const [autoDisabled, setAutoDisabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(TUTORIAL_AUTO_DISABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const openKey = `${isOpen}:${meta.id}`;
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (isOpen) {
      setStepIndex(0);
    }
  }

  const persistPreferences = useCallback(
    (disableAuto: boolean) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(getTutorialSeenKey(meta.id), 'true');
        if (disableAuto) {
          window.localStorage.setItem(TUTORIAL_AUTO_DISABLED_KEY, 'true');
        } else {
          window.localStorage.removeItem(TUTORIAL_AUTO_DISABLED_KEY);
        }
      } catch {
        // Ignore storage access errors
      }
    },
    [meta.id]
  );

  const handleClose = useCallback(() => {
    persistPreferences(autoDisabled);
    onClose();
  }, [autoDisabled, onClose, persistPreferences]);

  const safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[safeIndex];
  const isFirstStep = safeIndex === 0;
  const isLastStep = safeIndex >= steps.length - 1;
  const currentStepKey = `${meta.id}:${safeIndex}:${currentStep?.targetSelector ?? ''}`;

  const handlePrev = useCallback(() => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleClose();
    } else {
      setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
    }
  }, [handleClose, isLastStep, steps.length]);

  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key !== 'Escape') return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isLastStep) {
          setStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStepIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose, isLastStep, isOpen, steps.length]);

  useEffect(() => {
    if (!isOpen || !currentStep?.targetSelector) {
      return;
    }

    let targetEl: HTMLElement | null = null;
    try {
      const found = document.querySelector(currentStep.targetSelector);
      if (found instanceof HTMLElement) {
        const style = window.getComputedStyle(found);
        const rect = found.getBoundingClientRect();
        if (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0
        ) {
          targetEl = found;
        }
      }
    } catch {
      targetEl = null;
    }

    if (!targetEl) {
      return;
    }

    targetEl.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    const updateRect = () => {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        setSpotlightState({ stepKey: currentStepKey, rect: null });
        return;
      }
      const padding = 6;
      setSpotlightState({
        stepKey: currentStepKey,
        rect: {
          top: Math.max(4, rect.top - padding),
          left: Math.max(4, rect.left - padding),
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
      });
    };

    const initFrame = window.requestAnimationFrame(updateRect);
    const settleTimer = window.setTimeout(updateRect, 320);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.cancelAnimationFrame(initFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [currentStep?.targetSelector, currentStepKey, isOpen]);

  const spotlightRect =
    isOpen &&
    currentStep?.targetSelector &&
    spotlightState?.stepKey === currentStepKey
      ? spotlightState.rect
      : null;

  if (!isOpen || !currentStep) return null;

  return (
    <>
      {spotlightRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[55] rounded-[24px] border-2 border-[var(--md-primary)] ring-4 ring-[var(--md-primary)]/25 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] transition-all duration-300"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${
          spotlightRect ? 'bg-transparent' : 'bg-black/45 backdrop-blur-sm'
        }`}
        onClick={handleClose}
      >
        <div
          className="glass-panel animate-modal-enter relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative border-b border-[var(--md-outline-variant)]/50 px-6 pt-5 pb-4">
            <button
              type="button"
              onClick={handleClose}
              aria-label={pick(
                'Close tutorial',
                'Tutup tutorial',
                'チュートリアルを閉じる'
              )}
              className="glass-pill absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs">
                <SimulatorIcon iconName={meta.iconName} className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-secondary-container)]">
                    <Sparkles className="h-3 w-3" />
                    {pick('Interactive Tour', 'Tur Interaktif', '操作ガイド')}
                  </span>
                  <span className="rounded-full bg-[var(--md-surface-container-highest)] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                    {pick(
                      `Step ${safeIndex + 1} of ${steps.length}`,
                      `Langkah ${safeIndex + 1} dari ${steps.length}`,
                      `ステップ ${safeIndex + 1} / ${steps.length}`
                    )}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--md-on-surface-variant)]">
                  {meta.title}
                </p>
              </div>
            </div>

            {/* Step Indicator Dots */}
            <div
              className="mt-4 flex items-center gap-1.5"
              role="tablist"
              aria-label={pick(
                'Tutorial steps',
                'Langkah tutorial',
                'チュートリアルステップ'
              )}
            >
              {steps.map((step, idx) => {
                const isActive = idx === safeIndex;
                const isVisited = idx < safeIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={pick(
                      `Go to step ${idx + 1}`,
                      `Ke langkah ${idx + 1}`,
                      `ステップ ${idx + 1} へ`
                    )}
                    onClick={() => setStepIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-7 bg-[var(--md-primary)]'
                        : isVisited
                          ? 'w-2.5 bg-[var(--md-primary)]/45 hover:bg-[var(--md-primary)]/70'
                          : 'w-2 bg-[var(--md-outline-variant)] hover:bg-[var(--md-on-surface-variant)]/40'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div>
              <span className="inline-flex items-center rounded-full bg-[var(--md-primary-container)] px-3 py-1 text-[11px] font-bold tracking-wide text-[var(--md-on-primary-container)]">
                {pick(
                  currentStep.badge.en,
                  currentStep.badge.id,
                  currentStep.badge.ja
                )}
              </span>

              <h2
                id="tutorial-modal-title"
                className="mt-2.5 text-lg font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-xl"
              >
                {pick(
                  currentStep.title.en,
                  currentStep.title.id,
                  currentStep.title.ja
                )}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--md-on-surface-variant)]">
                {pick(
                  currentStep.description.en,
                  currentStep.description.id,
                  currentStep.description.ja
                )}
              </p>
            </div>

            {currentStep.tip && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-[var(--md-on-surface)]">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    {pick('Pro Tip', 'Tips Pro', 'プロのヒント')}
                  </div>
                  <p className="mt-0.5 text-[var(--md-on-surface-variant)]">
                    {pick(
                      currentStep.tip.en,
                      currentStep.tip.id,
                      currentStep.tip.ja
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[var(--md-on-surface-variant)] select-none">
              <input
                type="checkbox"
                checked={autoDisabled}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoDisabled(next);
                  persistPreferences(next);
                }}
                className="h-4 w-4 rounded"
              />
              {pick(
                "Don't auto-show tutorials",
                'Jangan tampilkan tutorial otomatis',
                'チュートリアルを自動表示しない'
              )}
            </label>

            <div className="flex items-center justify-end gap-2">
              {!isLastStep && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full px-3 py-2 text-xs font-semibold text-[var(--md-on-surface-variant)] transition-colors hover:bg-[var(--md-surface-container-highest)] hover:text-[var(--md-on-surface)]"
                >
                  {pick('Skip', 'Lewati', 'スキップ')}
                </button>
              )}

              <button
                type="button"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="m3-btn-tonal inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {pick('Previous', 'Sebelumnya', '前へ')}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="m3-btn-filled inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {pick('Finish', 'Selesai', '完了')}
                  </>
                ) : (
                  <>
                    {pick('Next', 'Berikutnya', '次へ')}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
