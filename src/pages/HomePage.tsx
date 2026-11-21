import { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  Box,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  SunMedium,
  X,
} from 'lucide-react';
import { SimulatorIcon } from '../components/SimulatorIcon';
import { TopRibbon } from '../components/TopRibbon';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { translateCategory, translateDifficulty } from '../i18n/simulatorRegistry';
import type { SimulatorCategory, SimulatorMeta } from '../types/simulator';

interface HomePageProps {
  simulators: SimulatorMeta[];
  onSelectSimulator: (id: string) => void;
  onOpenWelcome: () => void;
  onOpenHandbook: () => void;
  onOpenCompetency: () => void;
  onOpenCommandPalette: () => void;
}

const ITEMS_PER_PAGE = 8;

export function HomePage({
  simulators,
  onSelectSimulator,
  onOpenWelcome,
  onOpenHandbook,
  onOpenCompetency,
  onOpenCommandPalette,
}: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | SimulatorCategory
  >('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [todayDate] = useState(() => new Date());
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const { language, pick } = useLanguage();
  const { getSimulatorProgress, isSimulatorMastered } = useProgress();

  const atAGlanceDate = useMemo(() => {
    const locale =
      language === 'id' ? 'id-ID' : language === 'ja' ? 'ja-JP' : 'en-US';
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(todayDate);
    } catch {
      return todayDate.toDateString();
    }
  }, [language, todayDate]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: simulators.length };
    for (const sim of simulators) {
      counts[sim.category] = (counts[sim.category] ?? 0) + 1;
    }
    return counts;
  }, [simulators]);

  const filteredSimulators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return simulators.filter((sim) => {
      const matchesCategory =
        selectedCategory === 'All' || sim.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        sim.title.toLowerCase().includes(q) ||
        sim.shortTitle.toLowerCase().includes(q) ||
        sim.category.toLowerCase().includes(q) ||
        sim.description.toLowerCase().includes(q)
      );
    });
  }, [simulators, searchQuery, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSimulators.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIdx = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedSimulators = useMemo(
    () =>
      filteredSimulators.slice(pageStartIdx, pageStartIdx + ITEMS_PER_PAGE),
    [filteredSimulators, pageStartIdx]
  );

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category as 'All' | SimulatorCategory);
    setCurrentPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, nextPage));
    setCurrentPage(clamped);
    gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const masteredCount = simulators.filter((s) => isSimulatorMastered(s)).length;
  const visitedCount = simulators.filter(
    (s) => getSimulatorProgress(s.id).visited
  ).length;
  const totalPractice = simulators.reduce(
    (sum, s) => sum + s.practice.length,
    0
  );
  const solvedPractice = simulators.reduce(
    (sum, s) => sum + getSimulatorProgress(s.id).solvedPracticeIds.length,
    0
  );
  const quizPcts = simulators
    .map((s) => {
      const sp = getSimulatorProgress(s.id);
      if (sp.bestQuizScore === null) return null;
      const denom = sp.quizTotal > 0 ? sp.quizTotal : s.quiz.length;
      return denom > 0 ? (sp.bestQuizScore / denom) * 100 : null;
    })
    .filter((v): v is number => v !== null);
  const avgQuizPct =
    quizPcts.length > 0
      ? Math.round(quizPcts.reduce((a, b) => a + b, 0) / quizPcts.length)
      : 0;
  const overallReadinessPct =
    simulators.length > 0
      ? Math.min(
          100,
          Math.round(
            ((masteredCount / simulators.length) * 0.5 +
              (totalPractice > 0 ? (solvedPractice / totalPractice) * 0.3 : 0) +
              (avgQuizPct / 100) * 0.2) *
              100
          )
        )
      : 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--md-surface)] text-[var(--md-on-surface)] glass-mesh-light dark:glass-mesh-dark">
      {/* Android 17 Floating System Bar */}
      <TopRibbon
        variant="home"
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        categoryCounts={categoryCounts}
        onHome={() => {
          handleSelectCategory('All');
          setSearchQuery('');
        }}
        onOpenWelcome={onOpenWelcome}
        onOpenHandbook={onOpenHandbook}
        onOpenCommandPalette={onOpenCommandPalette}
      />

      {/* Pixel Launcher "At a Glance" Hero & Android 17 Quick Settings Shade */}
      <section className="relative mx-auto w-full max-w-none px-4 pt-6 pb-8 sm:px-6 sm:pt-8 lg:px-10 xl:px-12 animate-view-enter">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column (7 cols): Pixel "At a Glance" & Launcher Search Card */}
          <div className="flex flex-col justify-between rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] p-6 shadow-sm sm:p-8 lg:col-span-7">
            <div>
              {/* Pixel "At a Glance" Header */}
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-primary-container)] px-3 py-1 text-xs font-bold text-[var(--md-on-primary-container)]">
                  <Calendar className="h-3.5 w-3.5" />
                  {atAGlanceDate}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-secondary-container)] px-3 py-1 text-xs font-semibold text-[var(--md-on-secondary-container)]">
                  Asahimas Smart Maintenance · Android 17 M3 Workspace
                </span>
              </div>

              <h1 className="text-3xl font-extrabold leading-[1.14] tracking-tight text-[var(--md-on-surface)] sm:text-4xl xl:text-[2.65rem]">
                {pick(
                  'Train precision maintenance through ',
                  'Latih pemeliharaan presisi melalui ',
                  '精密保全を実践的な '
                )}
                <span className="text-[var(--md-primary)]">
                  {pick(
                    'hands-on simulation.',
                    'simulasi interaktif langsung.',
                    'ハンズオン・シミュレーションで習得。'
                  )}
                </span>
              </h1>

              <p className="mt-3.5 max-w-2xl text-sm leading-relaxed text-[var(--md-on-surface-variant)] sm:text-base">
                {pick(
                  'Practice precision measurement, diagnostic instruments (multimeter, clamp meter, megohmmeter, laser tachometer, vibration & dB meters), laser shaft alignment, bearing diagnostics, machine elements, hydraulics, and pump curves.',
                  'Berlatih pengukuran presisi, instrumen diagnostik (multimeter, tang ampere, megohmmeter, takometer laser, meter getaran & dB), alignment poros laser, diagnostik bearing, elemen mesin, hidrolik, dan kurva pompa.',
                  '精密測定、診断計測器（マルチメータ、クランプメータ、絶縁抵抗計、レーザー回転計、振動計・騒音計）、レーザー芯出し、軸受診断、機械要素、油空圧、ポンプ性能曲線を実践的に習得できます。'
                )}
              </p>

              {/* Pixel Launcher Pill Search Bar */}
              <div className="mt-6 flex items-center gap-2.5 rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] p-1.5 shadow-2xs transition focus-within:border-[var(--md-primary)] focus-within:ring-2 focus-within:ring-[var(--md-primary)]/20">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)]">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={pick(
                    'Search simulators, tools, or topics...',
                    'Cari simulator, alat, atau topik...',
                    'シミュレータ・工具・トピックを検索...'
                  )}
                  className="w-full bg-transparent text-sm font-medium text-[var(--md-on-surface)] outline-none placeholder:text-[var(--md-on-surface-variant)]"
                />
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    aria-label="Clear search"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--md-surface-container-low)] text-[var(--md-on-surface-variant)] transition hover:text-[var(--md-on-surface)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  className="hidden shrink-0 items-center gap-1 rounded-full bg-[var(--md-surface-container-low)] px-3 py-1.5 font-mono text-[11px] font-bold text-[var(--md-on-surface-variant)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)] sm:inline-flex"
                  title={pick(
                    'Open Quick Jump (Ctrl+K)',
                    'Buka Lompat Cepat (Ctrl+K)',
                    'クイックジャンプを開く (Ctrl+K)'
                  )}
                >
                  ⌘K
                </button>
              </div>
            </div>

            <div className="mt-6">
              {/* Expressive Primary + Tonal Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectSimulator('machine-3d-explorer')}
                  className="m3-btn-filled inline-flex items-center gap-2 px-5 py-3 text-xs font-bold shadow-sm"
                >
                  <Box className="h-4 w-4" />
                  {pick(
                    '3D Exploded-View Machine',
                    'Mesin 3D Exploded-View',
                    '3D 分解ビューマシン'
                  )}
                  <span className="rounded-full bg-[var(--md-on-primary)]/18 px-2 py-0.5 font-mono text-[10px] font-extrabold">
                    360° CAD
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSimulator('crystal-lattice-3d')}
                  className="m3-btn-tonal inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold shadow-2xs"
                >
                  <Atom className="h-4 w-4 text-[var(--md-primary)]" />
                  {pick(
                    '3D Crystal Lattices',
                    'Kristal 3D & Bravais',
                    '3D 結晶格子'
                  )}
                  <span className="rounded-full bg-[var(--md-primary-container)] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[var(--md-on-primary-container)]">
                    14+4
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCompetency}
                  className="m3-btn-tonal inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {pick(
                    'Competency Report',
                    'Laporan Kompetensi',
                    '習熟度レポート'
                  )}
                </button>
              </div>

              {/* 4-Stage Learning Flow Pills */}
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--md-outline-variant)]/50 pt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] px-3 py-1 text-xs font-medium text-[var(--md-on-surface-variant)]">
                  <Sliders className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Simulate', 'Simulasi', 'シミュレート')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] px-3 py-1 text-xs font-medium text-[var(--md-on-surface-variant)]">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Explore Theory', 'Pelajari Teori', '理論学習')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] px-3 py-1 text-xs font-medium text-[var(--md-on-surface-variant)]">
                  <ClipboardCheck className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Practice Problems', 'Soal Latihan', '演習問題')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--md-surface-container)] px-3 py-1 text-xs font-medium text-[var(--md-on-surface-variant)]">
                  <CheckSquare className="h-3.5 w-3.5 text-[var(--md-primary)]" />
                  {pick('Concept Quiz', 'Kuis Konsep', '理解度クイズ')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Android 17 Quick Settings Shade */}
          <div className="flex flex-col justify-between gap-4 rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container)] p-6 shadow-sm lg:col-span-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                  Quick Settings · Training Readiness
                </div>
                <div className="text-base font-extrabold tracking-tight text-[var(--md-on-surface)]">
                  {pick(
                    'Live Competency Shade',
                    'Panel Kompetensi Langsung',
                    'ライブ習熟度シェード'
                  )}
                </div>
              </div>
              <span className="rounded-full bg-[var(--md-primary-container)] px-3 py-1 font-mono text-xs font-bold text-[var(--md-on-primary-container)]">
                {overallReadinessPct}% {pick('Ready', 'Siap', '完了')}
              </span>
            </div>

            {/* Android 17 Brightness-Style Thick Pill Progress Slider */}
            <div className="relative flex h-11 w-full items-center overflow-hidden rounded-full border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-highest)] p-1">
              <div
                className="h-full rounded-full bg-[var(--md-primary-container)] transition-all duration-300"
                style={{
                  width:
                    overallReadinessPct === 0
                      ? '36px'
                      : `${Math.max(12, overallReadinessPct)}%`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between pl-3.5 pr-4 text-xs font-bold text-[var(--md-on-primary-container)]">
                <span className="inline-flex items-center gap-2">
                  <SunMedium className="h-4 w-4 text-[var(--md-primary)]" />
                  <span className="text-[var(--md-on-surface)]">
                    {pick(
                      'Overall Readiness',
                      'Kesiapan Keseluruhan',
                      '総合習熟度'
                    )}
                  </span>
                </span>
                <span className="font-mono font-extrabold text-[var(--md-primary)]">
                  {overallReadinessPct}%
                </span>
              </div>
            </div>

            {/* 2x2 Android 17 Quick Settings Tiles */}
            <div className="grid grid-cols-2 gap-3">
              {/* Tile 1: Active Primary Tile */}
              <div className="flex flex-col justify-between rounded-[24px] bg-[var(--md-primary)] p-4 text-[var(--md-on-primary)] shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--md-on-primary)]/18">
                    <Award className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs font-bold opacity-85">
                    {simulators.length > 0
                      ? Math.round((masteredCount / simulators.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold opacity-90">
                    {pick('Labs Mastered', 'Lab Dikuasai', '習得ラボ')}
                  </div>
                  <div className="font-mono text-xl font-extrabold">
                    {masteredCount}
                    <span className="text-xs font-medium opacity-75">
                      {' '}
                      / {simulators.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tile 2: Secondary Container Tile */}
              <div className="flex flex-col justify-between rounded-[24px] bg-[var(--md-secondary-container)] p-4 text-[var(--md-on-secondary-container)] shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--md-on-secondary-container)]/12">
                    <Box className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs font-bold opacity-80">
                    {simulators.length > 0
                      ? Math.round((visitedCount / simulators.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold opacity-90">
                    {pick('Labs Visited', 'Lab Dikunjungi', '受講ラボ')}
                  </div>
                  <div className="font-mono text-xl font-extrabold">
                    {visitedCount}
                    <span className="text-xs font-medium opacity-75">
                      {' '}
                      / {simulators.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tile 3: Surface Container High Tile */}
              <div className="m3-qs-tile flex flex-col justify-between border border-[var(--md-outline-variant)]/45 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-xs font-bold text-[var(--md-on-surface-variant)]">
                    {totalPractice > 0
                      ? Math.round((solvedPractice / totalPractice) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                    {pick('Practice Solved', 'Latihan Selesai', '演習解答')}
                  </div>
                  <div className="font-mono text-xl font-extrabold text-[var(--md-on-surface)]">
                    {solvedPractice}
                    <span className="text-xs font-medium text-[var(--md-on-surface-variant)]">
                      {' '}
                      / {totalPractice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tile 4: Tertiary Container Tile */}
              <div className="flex flex-col justify-between rounded-[24px] bg-[var(--md-tertiary-container)] p-4 text-[var(--md-on-tertiary-container)] shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--md-on-tertiary-container)]/12">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[11px] font-bold opacity-80">
                    QUIZ
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold opacity-90">
                    {pick('Avg Quiz Score', 'Rata-rata Kuis', '平均クイズ点')}
                  </div>
                  <div className="font-mono text-xl font-extrabold">
                    {avgQuizPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quick-Tile Action Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectSimulator('machine-3d-explorer')}
                className="flex items-center justify-between rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-low)] px-3.5 py-2.5 text-left text-xs font-bold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <Box className="h-3.5 w-3.5 shrink-0 text-[var(--md-primary)]" />
                  <span className="truncate">3D CAD Explorer</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </button>

              <button
                type="button"
                onClick={onOpenCompetency}
                className="flex items-center justify-between rounded-2xl border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-low)] px-3.5 py-2.5 text-left text-xs font-bold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[var(--md-primary)]" />
                  <span className="truncate">Competency Sheet</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Simulators App Grid */}
      <main className="mx-auto w-full max-w-none flex-1 px-4 pb-12 sm:px-6 lg:px-10 xl:px-12">
        <div
          ref={gridTopRef}
          className="mb-6 flex flex-col gap-3 scroll-mt-24 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[var(--md-on-surface)]">
              {pick(
                'Interactive Training Simulators',
                'Simulator Pelatihan Interaktif',
                'インタラクティブ訓練シミュレータ'
              )}
            </h2>
            <p className="text-xs text-[var(--md-on-surface-variant)]">
              <span className="font-mono font-bold text-[var(--md-primary)]">
                {filteredSimulators.length}
              </span>{' '}
              {pick(
                filteredSimulators.length === 1 ? 'simulator' : 'simulators',
                'simulator',
                '件のシミュレータ'
              )}
              {selectedCategory !== 'All'
                ? ` · ${translateCategory(selectedCategory, language)}`
                : ''}
            </p>
          </div>

          {(searchQuery.trim().length > 0 || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                handleSelectCategory('All');
              }}
              className="m3-btn-tonal inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 text-xs font-semibold sm:self-auto"
            >
              <X className="h-3.5 w-3.5" />
              {pick('Clear Filters', 'Hapus Filter', 'フィルターをクリア')}
            </button>
          )}
        </div>

        {filteredSimulators.length === 0 ? (
          <div className="glass-panel rounded-[28px] p-12 text-center">
            <p className="text-sm text-[var(--md-on-surface-variant)]">
              No simulators match &ldquo;{searchQuery}&rdquo; in{' '}
              <span className="font-semibold text-[var(--md-on-surface)]">
                {selectedCategory}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                handleSelectCategory('All');
              }}
              className="m3-btn-filled mt-4 px-5 py-2.5 text-xs font-bold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedSimulators.map((sim) => {
                const sp = getSimulatorProgress(sim.id);
                const mastered = isSimulatorMastered(sim);
                const quizDenom =
                  sp.quizTotal > 0 ? sp.quizTotal : sim.quiz.length;
                const quizPct =
                  sp.bestQuizScore !== null && quizDenom > 0
                    ? Math.round((sp.bestQuizScore / quizDenom) * 100)
                    : null;

                return (
                  <button
                    key={sim.id}
                    type="button"
                    onClick={() => onSelectSimulator(sim.id)}
                    className="m3-card glass-card group flex h-full flex-col rounded-[28px] p-5 text-left"
                  >
                    <div className="flex-1">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs transition-transform group-hover:scale-105">
                          <SimulatorIcon
                            iconName={sim.iconName}
                            className="h-5 w-5"
                          />
                        </div>

                        <span className="rounded-full bg-[var(--md-surface-container-highest)] px-3 py-1 text-[11px] font-semibold text-[var(--md-on-surface-variant)]">
                          {translateDifficulty(sim.difficulty, language)}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-[var(--md-primary)]">
                        {translateCategory(sim.category, language)}
                      </div>

                      <h2 className="mt-1 text-base font-bold text-[var(--md-on-surface)] transition-colors group-hover:text-[var(--md-primary)]">
                        {sim.title}
                      </h2>

                      <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--md-on-surface-variant)] sm:text-sm">
                        {sim.description}
                      </p>
                    </div>

                    <div className="mt-auto w-full pt-5">
                      <div className="flex items-center justify-between gap-2 border-t border-[var(--md-outline-variant)]/50 pt-3.5 text-xs">
                        <span className="font-mono text-[11px] text-[var(--md-on-surface-variant)]">
                          {mastered ? (
                            <span className="inline-flex items-center gap-1 font-sans font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {pick('Mastered', 'Dikuasai', '習得済み')}
                            </span>
                          ) : (
                            <>
                              {sp.solvedPracticeIds.length}/{sim.practice.length}{' '}
                              {pick('practice', 'latihan', '演習')}
                              {quizPct !== null
                                ? ` · ${quizPct}% ${pick('quiz', 'kuis', 'クイズ')}`
                                : ''}
                            </>
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--md-secondary-container)] px-3.5 py-1.5 text-xs font-semibold text-[var(--md-on-secondary-container)] transition group-hover:bg-[var(--md-primary)] group-hover:text-[var(--md-on-primary)]">
                          {pick('Launch Lab', 'Buka Lab', 'ラボを開く')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="glass-panel mt-8 flex flex-col items-center justify-between gap-4 rounded-full px-6 py-3.5 sm:flex-row">
                <span className="text-xs font-semibold text-[var(--md-on-surface-variant)]">
                  {pick(
                    `Showing ${pageStartIdx + 1}–${Math.min(pageStartIdx + ITEMS_PER_PAGE, filteredSimulators.length)} of ${filteredSimulators.length} labs`,
                    `Menampilkan ${pageStartIdx + 1}–${Math.min(pageStartIdx + ITEMS_PER_PAGE, filteredSimulators.length)} dari ${filteredSimulators.length} lab`,
                    `${filteredSimulators.length}件中 ${pageStartIdx + 1}–${Math.min(pageStartIdx + ITEMS_PER_PAGE, filteredSimulators.length)}件を表示`
                  )}
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage === 1}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-3.5 py-1.5 text-xs font-semibold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {pick('Prev', 'Sebelumnya', '前へ')}
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pageNum) => {
                      const isActive = pageNum === safePage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`min-w-[34px] rounded-full px-3 py-1.5 text-xs font-bold transition ${
                            isActive
                              ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-2xs'
                              : 'border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)] hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    type="button"
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage === totalPages}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-3.5 py-1.5 text-xs font-semibold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    {pick('Next', 'Berikutnya', '次へ')}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
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
    </div>
  );
}
