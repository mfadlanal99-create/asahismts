import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

type PopoverPlacement = 'bottom' | 'top' | 'right' | 'left' | 'corner';

interface PopoverLayout {
  top: number;
  left: number;
  placement: PopoverPlacement;
  arrowOffset: number;
}

const VIEWPORT_MARGIN = 12;
const POPOVER_GAP = 14;
const ARROW_EDGE_INSET = 24;

function clamp(value: number, min: number, max: number): number {
  if (max <= min) return min;
  return Math.min(Math.max(value, min), max);
}

function computePopoverLayout(
  spotlight: SpotlightRect,
  popoverSize: { width: number; height: number },
  viewport: { width: number; height: number }
): PopoverLayout {
  const vw = viewport.width;
  const vh = viewport.height;
  const popW = Math.min(popoverSize.width, vw - VIEWPORT_MARGIN * 2);
  const popH = Math.min(popoverSize.height, vh - VIEWPORT_MARGIN * 2);

  const isHugeTarget =
    spotlight.width > vw * 0.65 && spotlight.height > vh * 0.65;

  if (isHugeTarget) {
    const cornerLeft = Math.max(VIEWPORT_MARGIN, vw - popW - VIEWPORT_MARGIN);
    const cornerTop = Math.max(VIEWPORT_MARGIN, vh - popH - VIEWPORT_MARGIN);
    return {
      top: cornerTop,
      left: cornerLeft,
      placement: 'corner',
      arrowOffset: 0,
    };
  }

  const targetCenterX = spotlight.left + spotlight.width / 2;
  const targetCenterY = spotlight.top + spotlight.height / 2;

  const spaceBottom =
    vh - (spotlight.top + spotlight.height) - VIEWPORT_MARGIN - POPOVER_GAP;
  const spaceTop = spotlight.top - VIEWPORT_MARGIN - POPOVER_GAP;
  const spaceRight =
    vw - (spotlight.left + spotlight.width) - VIEWPORT_MARGIN - POPOVER_GAP;
  const spaceLeft = spotlight.left - VIEWPORT_MARGIN - POPOVER_GAP;

  let placement: Exclude<PopoverPlacement, 'corner'>;
  if (spaceBottom >= popH) {
    placement = 'bottom';
  } else if (spaceTop >= popH) {
    placement = 'top';
  } else if (spaceRight >= popW) {
    placement = 'right';
  } else if (spaceLeft >= popW) {
    placement = 'left';
  } else {
    const candidates: Array<{
      side: Exclude<PopoverPlacement, 'corner'>;
      ratio: number;
    }> = [
      { side: 'bottom', ratio: spaceBottom / Math.max(1, popH) },
      { side: 'top', ratio: spaceTop / Math.max(1, popH) },
      { side: 'right', ratio: spaceRight / Math.max(1, popW) },
      { side: 'left', ratio: spaceLeft / Math.max(1, popW) },
    ];
    candidates.sort((a, b) => b.ratio - a.ratio);
    placement = candidates[0].side;
  }

  let rawTop = VIEWPORT_MARGIN;
  let rawLeft = VIEWPORT_MARGIN;

  if (placement === 'bottom') {
    rawTop = spotlight.top + spotlight.height + POPOVER_GAP;
    rawLeft = targetCenterX - popW / 2;
  } else if (placement === 'top') {
    rawTop = spotlight.top - popH - POPOVER_GAP;
    rawLeft = targetCenterX - popW / 2;
  } else if (placement === 'right') {
    rawLeft = spotlight.left + spotlight.width + POPOVER_GAP;
    rawTop = targetCenterY - popH / 2;
  } else {
    rawLeft = spotlight.left - popW - POPOVER_GAP;
    rawTop = targetCenterY - popH / 2;
  }

  const left = clamp(rawLeft, VIEWPORT_MARGIN, vw - popW - VIEWPORT_MARGIN);
  const top = clamp(rawTop, VIEWPORT_MARGIN, vh - popH - VIEWPORT_MARGIN);

  const arrowOffset =
    placement === 'bottom' || placement === 'top'
      ? clamp(targetCenterX - left, ARROW_EDGE_INSET, popW - ARROW_EDGE_INSET)
      : clamp(targetCenterY - top, ARROW_EDGE_INSET, popH - ARROW_EDGE_INSET);

  return { top, left, placement, arrowOffset };
}

interface SimulatorTutorialModalProps {
  isOpen: boolean;
  meta: SimulatorMeta;
  steps: TutorialStep[];
  initialStepIndex?: number;
  onClose: () => void;
}

export function SimulatorTutorialModal({
  isOpen,
  meta,
  steps,
  initialStepIndex = 0,
  onClose,
}: SimulatorTutorialModalProps) {
  const { pick } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const [prevOpenKey, setPrevOpenKey] = useState(`${isOpen}:${meta.id}:${initialStepIndex}`);
  const [spotlightState, setSpotlightState] = useState<SpotlightState | null>(
    null
  );
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [popoverSize, setPopoverSize] = useState<{
    width: number;
    height: number;
  }>({ width: 390, height: 340 });
  const [viewport, setViewport] = useState<{ width: number; height: number }>(
    () =>
      typeof window === 'undefined'
        ? { width: 1280, height: 800 }
        : { width: window.innerWidth, height: window.innerHeight }
  );
  const [autoDisabled, setAutoDisabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(TUTORIAL_AUTO_DISABLED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const openKey = `${isOpen}:${meta.id}:${initialStepIndex}`;
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (isOpen) {
      setStepIndex(
        Math.max(0, Math.min(initialStepIndex, Math.max(0, steps.length - 1)))
      );
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

  useLayoutEffect(() => {
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

    // Measure synchronously before paint so the spotlight & popover never flicker
    updateRect();

    // Scroll smoothly only if the element is not comfortably within the viewport
    const initialRect = targetEl.getBoundingClientRect();
    const isComfortableInView =
      initialRect.top >= 72 &&
      initialRect.bottom <= window.innerHeight - 72;

    if (!isComfortableInView) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }

    // Track 60fps during smooth scroll so spotlight + popover glide in lockstep
    let rafId = 0;
    const startTime = performance.now();
    const trackScroll = (now: number) => {
      updateRect();
      if (now - startTime < 460) {
        rafId = window.requestAnimationFrame(trackScroll);
      }
    };
    if (!isComfortableInView) {
      rafId = window.requestAnimationFrame(trackScroll);
    }

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [currentStep?.targetSelector, currentStepKey, isOpen]);

  const spotlightRect =
    isOpen && currentStep?.targetSelector ? spotlightState?.rect ?? null : null;

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const initFrame = window.requestAnimationFrame(handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(initFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = popoverRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setPopoverSize((prev) =>
        Math.abs(prev.width - rect.width) < 1 &&
        Math.abs(prev.height - rect.height) < 1
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    if (typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isOpen, spotlightRect, currentStepKey]);

  if (!isOpen || !currentStep) return null;

  const popoverLayout = spotlightRect
    ? computePopoverLayout(spotlightRect, popoverSize, viewport)
    : null;

  const isFloating = Boolean(spotlightRect && popoverLayout);

  const centeredWidth = Math.min(512, viewport.width - VIEWPORT_MARGIN * 2);
  const centeredLeft = Math.max(
    VIEWPORT_MARGIN,
    (viewport.width - centeredWidth) / 2
  );
  const centeredTop = Math.max(
    VIEWPORT_MARGIN,
    (viewport.height - Math.min(popoverSize.height, viewport.height - VIEWPORT_MARGIN * 2)) / 2
  );

  const cardTop = isFloating && popoverLayout ? popoverLayout.top : centeredTop;
  const cardLeft = isFloating && popoverLayout ? popoverLayout.left : centeredLeft;

  const renderCaret = () => {
    if (!popoverLayout || popoverLayout.placement === 'corner') return null;
    const { placement, arrowOffset } = popoverLayout;

    if (placement === 'bottom') {
      return (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-[7px] z-10 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-l border-t border-[var(--md-primary)]/45 bg-[var(--md-surface-container-low)] transition-[left] duration-300 ease-out"
          style={{ left: arrowOffset }}
        />
      );
    }
    if (placement === 'top') {
      return (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[7px] z-10 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-[var(--md-primary)]/45 bg-[var(--md-surface-container)] transition-[left] duration-300 ease-out"
          style={{ left: arrowOffset }}
        />
      );
    }
    if (placement === 'right') {
      return (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-[7px] z-10 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-b border-l border-[var(--md-primary)]/45 bg-[var(--md-surface-container-low)] transition-[top] duration-300 ease-out"
          style={{ top: arrowOffset }}
        />
      );
    }
    return (
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[7px] z-10 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border-r border-t border-[var(--md-primary)]/45 bg-[var(--md-surface-container-low)] transition-[top] duration-300 ease-out"
        style={{ top: arrowOffset }}
      />
    );
  };

  return (
    <>
      {spotlightRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[55] rounded-[20px] border-2 border-[var(--md-primary)] ring-4 ring-[var(--md-primary)]/25 shadow-[0_0_0_9999px_rgba(0,0,0,0.52)] transition-[top,left,width,height,opacity] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
        className={`fixed inset-0 z-[60] transition-colors duration-300 ${
          isFloating ? 'bg-transparent' : 'bg-black/45 backdrop-blur-xs'
        }`}
        onClick={handleClose}
      >
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: cardTop,
            left: cardLeft,
          }}
          className={
            isFloating
              ? 'animate-modal-enter relative flex max-h-[calc(100vh-24px)] w-[min(390px,calc(100vw-24px))] flex-col overflow-visible rounded-[24px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-2xl transition-[top,left,width,border-radius] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]'
              : 'glass-panel animate-modal-enter relative flex max-h-[90vh] w-[min(512px,calc(100vw-24px))] flex-col overflow-hidden rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-2xl transition-[top,left,width,border-radius] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]'
          }
          onClick={(e) => e.stopPropagation()}
        >
          {isFloating && renderCaret()}

          <div
            className={
              isFloating
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px]'
                : 'flex min-h-0 flex-1 flex-col overflow-hidden'
            }
          >
            {/* Header */}
            <div
              className={`relative border-b border-[var(--md-outline-variant)]/50 ${
                isFloating ? 'px-4 pt-3.5 pb-3' : 'px-6 pt-5 pb-4'
              }`}
            >
              <button
                type="button"
                onClick={handleClose}
                aria-label={pick(
                  'Close tutorial',
                  'Tutup tutorial',
                  'チュートリアルを閉じる'
                )}
                className={`glass-pill absolute inline-flex items-center justify-center rounded-full ${
                  isFloating ? 'right-3 top-3 h-7 w-7' : 'right-4 top-4 h-9 w-9'
                }`}
              >
                <X className={isFloating ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </button>

              <div className={`flex items-center gap-3 ${isFloating ? 'pr-8' : 'pr-10'}`}>
                <div
                  className={`flex shrink-0 items-center justify-center bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs ${
                    isFloating ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-2xl'
                  }`}
                >
                  <SimulatorIcon
                    iconName={meta.iconName}
                    className={isFloating ? 'h-4 w-4' : 'h-5 w-5'}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--md-secondary-container)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-secondary-container)]">
                      <Sparkles className="h-2.5 w-2.5" />
                      {pick('Interactive Tour', 'Tur Interaktif', '操作ガイド')}
                    </span>
                    <span className="rounded-full bg-[var(--md-surface-container-highest)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--md-on-surface-variant)]">
                      {pick(
                        `Step ${safeIndex + 1} of ${steps.length}`,
                        `Langkah ${safeIndex + 1} dari ${steps.length}`,
                        `ステップ ${safeIndex + 1} / ${steps.length}`
                      )}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-semibold text-[var(--md-on-surface-variant)]">
                    {meta.title}
                  </p>
                </div>
              </div>

              {/* Step Indicator Dots */}
              <div
                className={`${isFloating ? 'mt-2.5' : 'mt-4'} flex items-center gap-1.5`}
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
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'w-6 bg-[var(--md-primary)]'
                          : isVisited
                            ? 'w-2 bg-[var(--md-primary)]/45 hover:bg-[var(--md-primary)]/70'
                            : 'w-1.5 bg-[var(--md-outline-variant)] hover:bg-[var(--md-on-surface-variant)]/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div
              key={currentStep.id}
              className={`animate-tour-step flex-1 overflow-y-auto ${
                isFloating ? 'space-y-3 px-4 py-3.5' : 'space-y-4 px-6 py-5'
              }`}
            >
              <div>
                <span className="inline-flex items-center rounded-full bg-[var(--md-primary-container)] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-[var(--md-on-primary-container)]">
                  {pick(
                    currentStep.badge.en,
                    currentStep.badge.id,
                    currentStep.badge.ja
                  )}
                </span>

                <h2
                  id="tutorial-modal-title"
                  className={`font-extrabold tracking-tight text-[var(--md-on-surface)] ${
                    isFloating ? 'mt-2 text-base' : 'mt-2.5 text-lg sm:text-xl'
                  }`}
                >
                  {pick(
                    currentStep.title.en,
                    currentStep.title.id,
                    currentStep.title.ja
                  )}
                </h2>

                <p
                  className={`leading-relaxed text-[var(--md-on-surface-variant)] ${
                    isFloating ? 'mt-1.5 text-xs' : 'mt-2 text-sm'
                  }`}
                >
                  {pick(
                    currentStep.description.en,
                    currentStep.description.id,
                    currentStep.description.ja
                  )}
                </p>
              </div>

              {currentStep.tip && (
                <div
                  className={`flex items-start gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 text-xs leading-relaxed text-[var(--md-on-surface)] ${
                    isFloating ? 'px-3 py-2.5' : 'px-4 py-3'
                  }`}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lightbulb className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      {pick('Pro Tip', 'Tips Pro', 'プロのヒント')}
                    </div>
                    <p className="mt-0.5 text-[11px] text-[var(--md-on-surface-variant)]">
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
            <div
              className={`flex flex-col gap-2.5 border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] ${
                isFloating
                  ? 'px-4 py-3'
                  : 'px-6 py-4 sm:flex-row sm:items-center sm:justify-between'
              }`}
            >
              <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] text-[var(--md-on-surface-variant)] select-none">
                <input
                  type="checkbox"
                  checked={autoDisabled}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setAutoDisabled(next);
                    persistPreferences(next);
                  }}
                  className="h-3.5 w-3.5 rounded"
                />
                {pick(
                  "Don't auto-show tutorials",
                  'Jangan tampilkan tutorial otomatis',
                  'チュートリアルを自動表示しない'
                )}
              </label>

              <div className="flex items-center justify-end gap-1.5">
                {!isLastStep && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-[var(--md-on-surface-variant)] transition-colors hover:bg-[var(--md-surface-container-highest)] hover:text-[var(--md-on-surface)]"
                  >
                    {pick('Skip', 'Lewati', 'スキップ')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className="m3-btn-tonal inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {pick('Previous', 'Sebelumnya', '前へ')}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="m3-btn-filled inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold"
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
      </div>
    </>
  );
}
