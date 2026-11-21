import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, HelpCircle, Printer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import {
  getSimulatorTutorial,
  shouldAutoOpenTutorial,
} from '../data/tutorials';
import { translateCategory, translateDifficulty } from '../i18n/simulatorRegistry';
import type { SimulatorMeta, SimulatorMode } from '../types/simulator';
import { ExploreTab } from './ExploreTab';
import { PracticeTab } from './PracticeTab';
import { QuizTab } from './QuizTab';
import { SimulatorIcon } from './SimulatorIcon';
import { SimulatorTutorialModal } from './SimulatorTutorialModal';
import { SimulatorVirtualAssistant } from './SimulatorVirtualAssistant';
import { TopRibbon } from './TopRibbon';

interface SimulatorLayoutProps {
  meta: SimulatorMeta;
  simulators: SimulatorMeta[];
  onBack: () => void;
  onSelectSimulator: (id: string) => void;
  onOpenWelcome?: () => void;
  onOpenHandbook?: () => void;
  onOpenCommandPalette?: () => void;
  children: ReactNode;
}

export function SimulatorLayout({
  meta,
  simulators,
  onBack,
  onSelectSimulator,
  onOpenWelcome,
  onOpenHandbook,
  onOpenCommandPalette,
  children,
}: SimulatorLayoutProps) {
  const [mode, setMode] = useState<SimulatorMode>('simulate');
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialInitialStep, setTutorialInitialStep] = useState(0);
  const [prevSimId, setPrevSimId] = useState(meta.id);
  const { language, pick } = useLanguage();
  const { markVisited } = useProgress();
  const tutorialSteps = getSimulatorTutorial(meta.id);

  if (prevSimId !== meta.id) {
    setPrevSimId(meta.id);
    setTutorialOpen(false);
    setTutorialInitialStep(0);
  }

  useEffect(() => {
    markVisited(meta.id);
  }, [markVisited, meta.id]);

  useEffect(() => {
    if (tutorialSteps.length === 0 || !shouldAutoOpenTutorial(meta.id)) {
      return;
    }

    let openTimer: number | undefined;
    let observer: MutationObserver | undefined;

    const scheduleOpen = () => {
      openTimer = window.setTimeout(() => {
        setTutorialOpen(true);
      }, 150);
    };

    const isWelcomeOpen = () =>
      document.querySelector('[aria-labelledby="welcome-modal-title"]') !== null;

    if (!isWelcomeOpen()) {
      scheduleOpen();
    } else {
      observer = new MutationObserver(() => {
        if (!isWelcomeOpen()) {
          observer?.disconnect();
          observer = undefined;
          scheduleOpen();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (openTimer !== undefined) window.clearTimeout(openTimer);
      observer?.disconnect();
    };
  }, [meta.id, tutorialSteps.length]);

  useEffect(() => {
    const modes: SimulatorMode[] = ['simulate', 'explore', 'practice', 'quiz'];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < modes.length) {
        e.preventDefault();
        setMode(modes[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--md-surface)] text-[var(--md-on-surface)] glass-mesh-light dark:glass-mesh-dark">
      {/* Android 17 Floating System Bar */}
      <TopRibbon
        variant="simulator"
        mode={mode}
        onChangeMode={setMode}
        accentColor={meta.accentColor}
        currentSimulatorId={meta.id}
        simulators={simulators}
        onSelectSimulator={onSelectSimulator}
        onHome={onBack}
        onOpenWelcome={onOpenWelcome}
        onOpenHandbook={onOpenHandbook}
        onOpenCommandPalette={onOpenCommandPalette}
      />

      {/* Print-Only Lab Worksheet Header */}
      <div className="hidden border-b border-slate-300 px-4 pb-3 pt-2 print:block">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-bold uppercase tracking-wider text-slate-900">
            {pick(
              'Asahi-SMTS — Technician Lab Worksheet',
              'Asahi-SMTS — Lembar Kerja Lab Teknisi',
              'Asahi-SMTS — 技術者実習ワークシート'
            )}
          </span>
          <span>
            {pick('Mode', 'Mode', 'モード')}: {mode.toUpperCase()}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
          <span>
            {pick('Trainee', 'Peserta', '受講者')}: ___________________________
          </span>
          <span>
            {pick('Date', 'Tanggal', '日付')}: _______________
          </span>
        </div>
      </div>

      {/* Material 3 Expressive Lab Header Card */}
      <div className="relative mx-auto w-full max-w-none px-4 pt-6 pb-2 sm:px-6 lg:px-10 xl:px-12">
        <div className="glass-panel flex flex-col gap-4 rounded-[28px] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs">
              <SimulatorIcon iconName={meta.iconName} className="h-6 w-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                <span className="rounded-full bg-[var(--md-secondary-container)] px-2.5 py-0.5 text-[var(--md-on-secondary-container)]">
                  {translateCategory(meta.category, language)}
                </span>
                <span className="rounded-full bg-[var(--md-surface-container-highest)] px-2.5 py-0.5 text-[var(--md-on-surface-variant)]">
                  {translateDifficulty(meta.difficulty, language)}
                </span>
              </div>
              <h1 className="mt-1.5 text-base font-extrabold tracking-tight text-[var(--md-on-surface)] sm:text-lg">
                {meta.title}
              </h1>
              <p className="mt-0.5 text-xs text-[var(--md-on-surface-variant)]">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center print:hidden">
            {tutorialSteps.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTutorialInitialStep(0);
                  setTutorialOpen(true);
                }}
                title={pick(
                  'Open interactive simulator tutorial',
                  'Buka tutorial interaktif simulator',
                  'シミュレータの操作ガイドを開く'
                )}
                className="m3-btn-tonal inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-bold"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {pick('Tutorial', 'Tutorial', 'チュートリアル')}
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              title={pick(
                'Print or export this lab worksheet',
                'Cetak atau ekspor lembar kerja lab ini',
                'この実習ワークシートを印刷またはエクスポート'
              )}
              className="m3-btn-filled inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-bold"
            >
              <Printer className="h-3.5 w-3.5" />
              {pick(
                'Print / Export Lab Sheet',
                'Cetak / Ekspor Lembar Lab',
                '実習シート印刷・出力'
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="m3-btn-tonal inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {pick('Back to Labs', 'Kembali ke Lab', 'ラボ一覧へ')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="pixel-sim-workspace relative mx-auto w-full max-w-none flex-1 px-4 py-4 pb-10 sm:px-6 lg:px-10 xl:px-12">
        <div key={mode} className="animate-view-enter">
          {mode === 'simulate' && children}
          {mode === 'explore' && <ExploreTab sections={meta.explore} />}
          {mode === 'practice' && (
            <PracticeTab
              simulatorId={meta.id}
              problems={meta.practice}
              onGoToQuiz={() => setMode('quiz')}
            />
          )}
          {mode === 'quiz' && (
            <QuizTab simulatorId={meta.id} questions={meta.quiz} />
          )}
        </div>
      </main>

      {/* Material 3 Surface Footer */}
      <footer className="border-t border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-low)]">
        <div className="mx-auto grid w-full max-w-none grid-cols-1 items-center gap-2 px-4 py-5 text-center text-xs text-[var(--md-on-surface-variant)] sm:grid-cols-3 sm:px-6 lg:px-10 xl:px-12">
          <span className="sm:text-left">
            <strong className="font-bold text-[var(--md-on-surface)]">
              Asahi-SMTS
            </strong>{' '}
            — Asahimas Smart Maintenance Training System
          </span>
          <span className="text-center">
            {pick('Made by', 'Dibuat oleh', '制作')}{' '}
            <strong className="font-bold text-[var(--md-on-surface)]">
              M. Fadlan Alamsyah
            </strong>
          </span>
          <span className="hidden sm:block" aria-hidden="true" />
        </div>
      </footer>

      <SimulatorVirtualAssistant
        meta={meta}
        steps={tutorialSteps}
        isTutorialOpen={tutorialOpen}
        onJumpToTutorialStep={(idx) => {
          setTutorialInitialStep(idx);
          setTutorialOpen(true);
        }}
      />

      <SimulatorTutorialModal
        isOpen={tutorialOpen}
        meta={meta}
        steps={tutorialSteps}
        initialStepIndex={tutorialInitialStep}
        onClose={() => setTutorialOpen(false)}
      />
    </div>
  );
}
