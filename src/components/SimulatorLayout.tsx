import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { translateCategory, translateDifficulty } from '../i18n/simulatorRegistry';
import type { SimulatorMeta, SimulatorMode } from '../types/simulator';
import { ExploreTab } from './ExploreTab';
import { PracticeTab } from './PracticeTab';
import { QuizTab } from './QuizTab';
import { SimulatorIcon } from './SimulatorIcon';
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
  const { language, pick } = useLanguage();
  const { markVisited } = useProgress();

  useEffect(() => {
    markVisited(meta.id);
  }, [markVisited, meta.id]);

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
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#F4F7FB] text-slate-900 glass-mesh-light dark:bg-[#07101E] dark:text-slate-100 dark:glass-mesh-dark">
      {/* Floating Pill Ribbon Top Bar */}
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

      {/* Compact Glass Lab Title Strip */}
      <div className="relative mx-auto w-full max-w-none px-4 pt-6 pb-2 sm:px-6 lg:px-10 xl:px-12">
        <div className="glass-panel flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#001F6B]/8 text-[#001F6B] dark:bg-white/5 dark:text-[#60A5FA]">
              <SimulatorIcon iconName={meta.iconName} className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{translateCategory(meta.category, language)}</span>
                <span>·</span>
                <span>{translateDifficulty(meta.difficulty, language)}</span>
              </div>
              <h1 className="mt-0.5 text-base font-bold tracking-tight text-[#0F172A] dark:text-white sm:text-lg">
                {meta.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              title={pick(
                'Print or export this lab worksheet',
                'Cetak atau ekspor lembar kerja lab ini',
                'この実習ワークシートを印刷またはエクスポート'
              )}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#001F6B] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#002D9C] dark:bg-[#002D9C] dark:hover:bg-[#3B82F6]"
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
              className="glass-pill inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {pick('Back to Labs', 'Kembali ke Lab', 'ラボ一覧へ')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="relative mx-auto w-full max-w-none flex-1 px-4 py-4 pb-10 sm:px-6 lg:px-10 xl:px-12">
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

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-200/80 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-none flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:px-6 lg:px-10 xl:px-12">
          <span>
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              Asahi-SMTS
            </strong>{' '}
            — Asahimas Smart Maintenance Training System
          </span>
          <span>
            {pick('Made by', 'Dibuat oleh', '制作')}{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">
              M. Fadlan Alamsyah
            </strong>
          </span>
        </div>
      </footer>
    </div>
  );
}
