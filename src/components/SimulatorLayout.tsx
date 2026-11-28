import { useEffect, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  BookMarked,
  BookOpen,
  CheckSquare,
  ClipboardCheck,
  HelpCircle,
  Layers,
  Moon,
  Printer,
  Search,
  Sliders,
  Sun,
} from 'lucide-react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
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

const LANGUAGE_OPTIONS: { id: Language; label: string; title: string }[] = [
  { id: 'en', label: 'EN', title: 'English' },
  { id: 'id', label: 'ID', title: 'Bahasa Indonesia' },
  { id: 'ja', label: 'JA', title: '日本語' },
];

const SIMULATOR_MODES: {
  id: SimulatorMode;
  en: string;
  idLabel: string;
  ja: string;
  icon: typeof Sliders;
}[] = [
  { id: 'simulate', en: 'Simulate', idLabel: 'Simulasi', ja: 'シミュレート', icon: Sliders },
  { id: 'explore', en: 'Explore', idLabel: 'Materi', ja: '理論学習', icon: BookOpen },
  { id: 'practice', en: 'Practice', idLabel: 'Latihan', ja: '演習', icon: ClipboardCheck },
  { id: 'quiz', en: 'Quiz', idLabel: 'Kuis', ja: 'クイズ', icon: CheckSquare },
];

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
  const { language, setLanguage, pick } = useLanguage();
  const { markVisited } = useProgress();
  const { theme, toggleTheme, uiStyle, toggleUiStyle } = useTheme();
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

  // =========================================================================
  // ASAHIMAS DATA BANK (PORT 5180) UI/UX — THREADS RAIL + KESTREL BENTO
  // =========================================================================
  if (uiStyle === 'databank') {
    return (
      <div className="th-shell">
        {/* Floating Left Icon Rail */}
        <aside className="th-rail print:hidden" aria-label="Simulator Navigation">
          <div className="th-rail-top">
            <button
              type="button"
              className="th-brand-mark"
              onClick={onBack}
              title="Back to Asahimas Data Bank Command Center"
            >
              ADB
            </button>

            <div className="th-rail-pill">
              <button
                type="button"
                className="th-rail-btn"
                onClick={onBack}
                aria-label="Command Center (All Labs)"
              >
                <Activity size={17} />
                <span className="th-rail-tooltip">
                  {pick('Command Center (All Labs)', 'Pusat Komando (Semua Lab)', 'コマンドセンター')}
                </span>
              </button>

              {SIMULATOR_MODES.map((m, idx) => {
                const ModeIcon = m.icon;
                const active = mode === m.id;
                const label = pick(m.en, m.idLabel, m.ja);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`th-rail-btn ${active ? 'active' : ''}`}
                    onClick={() => setMode(m.id)}
                    aria-label={label}
                  >
                    <ModeIcon size={17} />
                    <span className="th-rail-tooltip">
                      {label} (Alt+{idx + 1})
                    </span>
                  </button>
                );
              })}

              {tutorialSteps.length > 0 && (
                <button
                  type="button"
                  className="th-rail-btn"
                  onClick={() => {
                    setTutorialInitialStep(0);
                    setTutorialOpen(true);
                  }}
                  aria-label="Interactive Tutorial"
                >
                  <HelpCircle size={17} />
                  <span className="th-rail-tooltip">
                    {pick('Interactive Tutorial', 'Tutorial Interaktif', '操作チュートリアル')}
                  </span>
                </button>
              )}

              <button
                type="button"
                className="th-rail-btn"
                onClick={() => window.print()}
                aria-label="Print Lab Sheet"
              >
                <Printer size={17} />
                <span className="th-rail-tooltip">
                  {pick('Print Lab Sheet', 'Cetak Lembar Lab', '実習シート印刷')}
                </span>
              </button>

              {onOpenHandbook && (
                <button
                  type="button"
                  className="th-rail-btn"
                  onClick={onOpenHandbook}
                  aria-label="Engineering Handbook"
                >
                  <BookMarked size={17} />
                  <span className="th-rail-tooltip">
                    {pick('Engineering Handbook', 'Buku Panduan', 'ハンドブック')}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="th-rail-pill">
            {onOpenCommandPalette && (
              <button
                type="button"
                className="th-rail-btn"
                onClick={onOpenCommandPalette}
                aria-label="Quick Search (Ctrl+K)"
              >
                <Search size={17} />
                <span className="th-unread-dot" />
                <span className="th-rail-tooltip">Quick Search (Ctrl+K)</span>
              </button>
            )}

            <button
              type="button"
              className="th-rail-btn"
              onClick={toggleUiStyle}
              aria-label="Switch to Classic Pixel UI (Backup)"
            >
              <Layers size={17} />
              <span className="th-rail-tooltip">
                Switch to Classic Pixel UI (Backup)
              </span>
            </button>

            <button
              type="button"
              className="th-rail-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span className="th-rail-tooltip">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button
              type="button"
              className="th-avatar-btn"
              onClick={onOpenWelcome}
              title="M. Fadlan Alamsyah"
            >
              FA
            </button>
          </div>
        </aside>

        {/* Main Workspace Container */}
        <div className="th-main">
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
          </div>

          {/* Top Header Bar (.th-header) */}
          <header className="th-header print:hidden">
            <div>
              <div className="th-date">
                {translateCategory(meta.category, language)} ·{' '}
                {translateDifficulty(meta.difficulty, language)} · TAG:{' '}
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {meta.id.toUpperCase()}
                </span>
              </div>
              <h1 className="th-greeting">{meta.title}</h1>
            </div>

            <div className="th-header-right">
              {/* Quick Lab Switcher Select */}
              <select
                aria-label="Switch Simulator"
                value={meta.id}
                onChange={(e) => onSelectSimulator(e.target.value)}
                className="gm-select"
                style={{
                  width: 'auto',
                  maxWidth: 215,
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {simulators.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortTitle}
                  </option>
                ))}
              </select>

              {/* Language Switcher Pill */}
              <div
                role="group"
                aria-label="Language"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 3,
                  borderRadius: 999,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-card)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {LANGUAGE_OPTIONS.map((opt) => {
                  const active = language === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLanguage(opt.id)}
                      style={{
                        border: 'none',
                        borderRadius: 999,
                        padding: '4px 9px',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: active ? 'var(--ink-900)' : 'transparent',
                        color: active ? 'var(--bg-surface)' : 'var(--text-secondary)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {tutorialSteps.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setTutorialInitialStep(0);
                    setTutorialOpen(true);
                  }}
                  className="gm-btn gm-btn-tonal gm-btn-sm"
                >
                  <HelpCircle size={14} />
                  <span>{pick('Tutorial', 'Tutorial', 'ガイド')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onBack}
                className="gm-btn gm-btn-aurora gm-btn-sm"
              >
                <ArrowLeft size={14} />
                <span>{pick('Back to Labs', 'Kembali ke Lab', 'ラボ一覧へ')}</span>
              </button>
            </div>
          </header>

          {/* Kestrel Sub-Header Toolbar: 4 Mode Chips + Description Summary */}
          <div className="ks-card print:hidden" style={{ padding: '14px 18px' }}>
            <div className="gm-toolbar">
              <div data-tour="mode-tabs" className="gm-chips">
                {SIMULATOR_MODES.map((m, idx) => {
                  const ModeIcon = m.icon;
                  const active = mode === m.id;
                  const label = pick(m.en, m.idLabel, m.ja);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      title={`${label} (Alt+${idx + 1})`}
                      className={`gm-chip ${active ? 'active' : ''}`}
                    >
                      <ModeIcon size={14} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  maxWidth: 680,
                }}
              >
                {meta.description}
              </div>
            </div>
          </div>

          {/* Main Simulator Content */}
          <main className="pixel-sim-workspace relative w-full flex-1 pb-8">
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
      </div>
    );
  }

  // =========================================================================
  // BACKUP: CLASSIC PIXEL UI SIMULATOR LAYOUT (1-Click Instant Switch Back)
  // =========================================================================
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
