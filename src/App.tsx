import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { CommandPalette } from './components/CommandPalette';
import { CompetencyModal } from './components/CompetencyModal';
import { ReferenceModal } from './components/ReferenceModal';
import { SimulatorLayout } from './components/SimulatorLayout';
import { WELCOME_STORAGE_KEY, WelcomeModal } from './components/WelcomeModal';
import { useLanguage } from './context/LanguageContext';
import { LanguageProvider } from './context/LanguageProvider';
import { ProgressProvider } from './context/ProgressProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SIMULATORS_META, getSimulatorById } from './data/simulators';
import { getLocalizedMeta } from './i18n/simulatorRegistry';
import { HomePage } from './pages/HomePage';

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

function getSimulatorIdFromLocation(): string | null {
  const path = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length) || '/'
    : window.location.pathname;
  const match = path.match(/^\/sim\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function shouldShowWelcomeOnStartup(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(WELCOME_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

function AppContent() {
  const { language, pick } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(() =>
    getSimulatorIdFromLocation()
  );
  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(() =>
    shouldShowWelcomeOnStartup()
  );
  const [handbookOpen, setHandbookOpen] = useState(false);
  const [competencyOpen, setCompetencyOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setActiveId(getSimulatorIdFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navigateToSimulator = useCallback((id: string) => {
    window.history.pushState(null, '', `${BASE_PATH}/sim/${encodeURIComponent(id)}`);
    setActiveId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const navigateHome = useCallback(() => {
    window.history.pushState(null, '', `${BASE_PATH}/`);
    setActiveId(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const openWelcome = useCallback(() => setWelcomeOpen(true), []);
  const closeWelcome = useCallback(() => setWelcomeOpen(false), []);
  const openHandbook = useCallback(() => setHandbookOpen(true), []);
  const closeHandbook = useCallback(() => setHandbookOpen(false), []);
  const openCompetency = useCallback(() => setCompetencyOpen(true), []);
  const closeCompetency = useCallback(() => setCompetencyOpen(false), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  const localizedSimulators = useMemo(
    () => SIMULATORS_META.map((meta) => getLocalizedMeta(meta, language)),
    [language]
  );

  const activeEntry = activeId ? getSimulatorById(activeId) : undefined;
  const localizedActiveMeta = useMemo(
    () =>
      activeEntry ? getLocalizedMeta(activeEntry.meta, language) : undefined,
    [activeEntry, language]
  );

  return (
    <>
      {activeEntry && localizedActiveMeta ? (
        <SimulatorLayout
          key={activeEntry.meta.id}
          meta={localizedActiveMeta}
          simulators={localizedSimulators}
          onBack={navigateHome}
          onSelectSimulator={navigateToSimulator}
          onOpenWelcome={openWelcome}
          onOpenHandbook={openHandbook}
          onOpenCommandPalette={openPalette}
        >
          <Suspense
            fallback={
              <div className="flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#001F6B]/15 bg-white p-8 dark:border-[#3B82F6]/20 dark:bg-[#0C1829]/80">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001F6B] border-t-transparent dark:border-[#60A5FA]" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {pick(
                    'Loading simulator workspace...',
                    'Memuat ruang kerja simulator...',
                    'シミュレータを読み込み中...'
                  )}
                </span>
              </div>
            }
          >
            <activeEntry.Component />
          </Suspense>
        </SimulatorLayout>
      ) : (
        <HomePage
          simulators={localizedSimulators}
          onSelectSimulator={navigateToSimulator}
          onOpenWelcome={openWelcome}
          onOpenHandbook={openHandbook}
          onOpenCompetency={openCompetency}
          onOpenCommandPalette={openPalette}
        />
      )}

      <WelcomeModal isOpen={welcomeOpen} onClose={closeWelcome} />
      <ReferenceModal isOpen={handbookOpen} onClose={closeHandbook} />
      <CompetencyModal
        isOpen={competencyOpen}
        onClose={closeCompetency}
        simulators={localizedSimulators}
      />
      <CommandPalette
        isOpen={paletteOpen}
        onClose={closePalette}
        simulators={localizedSimulators}
        onSelectSimulator={navigateToSimulator}
        onOpenHandbook={openHandbook}
        onOpenCompetency={openCompetency}
      />
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ProgressProvider>
            <AppContent />
          </ProgressProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
