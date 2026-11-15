import { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Box,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SimulatorIcon } from '../components/SimulatorIcon';
import { TopRibbon } from '../components/TopRibbon';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { translateCategory, translateDifficulty } from '../i18n/simulatorRegistry';
import type { SimulatorMeta } from '../types/simulator';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const { language, pick } = useLanguage();
  const { getSimulatorProgress, isSimulatorMastered } = useProgress();

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
    setSelectedCategory(category);
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
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#F4F7FB] text-slate-900 glass-mesh-light dark:bg-[#07101E] dark:text-slate-100 dark:glass-mesh-dark">
      {/* Floating Pill Ribbon Top Bar */}
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

      {/* Restrained AGC Blue Corporate Hero Band */}
      <section className="relative mx-auto w-full max-w-none px-4 pt-6 pb-8 sm:px-6 sm:pt-8 lg:px-10 xl:px-12 animate-view-enter">
        <div className="agc-hero-band grid gap-8 rounded-2xl p-6 text-white shadow-[0_12px_32px_-16px_rgba(15,23,42,0.35)] sm:p-8 lg:grid-cols-12">
          {/* Left: Hero Headline & Primary Action */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="mb-3 text-xs font-medium tracking-wide text-[#CFE0F5]">
                Asahimas Smart Maintenance Training System (Asahi-SMTS)
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl">
                {pick(
                  'Train precision maintenance through hands-on simulation.',
                  'Latih pemeliharaan presisi melalui simulasi interaktif langsung.',
                  '精密保全を実践的なハンズオン・シミュレーションで習得。'
                )}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#CFE0F5] sm:text-base">
                {pick(
                  'Practice precision measurement, diagnostic instruments (multimeter, clamp meter, megohmmeter, laser tachometer, vibration & dB meters), laser shaft alignment, bearing diagnostics, machine elements, hydraulics, and pump curves.',
                  'Berlatih pengukuran presisi, instrumen diagnostik (multimeter, tang ampere, megohmmeter, takometer laser, meter getaran & dB), alignment poros laser, diagnostik bearing, elemen mesin, hidrolik, dan kurva pompa.',
                  '精密測定、診断計測器（マルチメータ、クランプメータ、絶縁抵抗計、レーザー回転計、振動計・騒音計）、レーザー芯出し、軸受診断、機械要素、油空圧、ポンプ性能曲線を実践的に習得できます。'
                )}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenCompetency}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#001F6B] transition hover:bg-[#F4F7FB] dark:bg-[#002D9C] dark:text-white dark:hover:bg-[#3B82F6]"
              >
                <ShieldCheck className="h-4 w-4" />
                {pick(
                  'Competency Report',
                  'Laporan Kompetensi',
                  '習熟度レポート'
                )}
              </button>

              <button
                type="button"
                onClick={onOpenHandbook}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
              >
                <BookMarked className="h-3.5 w-3.5" />
                {pick('Field Handbook', 'Buku Panduan', '現場ハンドブック')}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-xs text-[#CFE0F5]">
              <span className="inline-flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                {pick('Simulate', 'Simulasi', 'シミュレート')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {pick('Explore Theory', 'Pelajari Teori', '理論学習')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {pick('Practice Problems', 'Soal Latihan', '演習問題')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                {pick('Concept Quiz', 'Kuis Konsep', '理解度クイズ')}
              </span>
            </div>
          </div>

          {/* Right: Live Training Readiness & Competency Panel */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md lg:col-span-5">
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-[#CFE0F5]">
                    {pick('Training Readiness', 'Kesiapan Pelatihan', '訓練習熟度')}
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {pick(
                      'Live Competency Dashboard',
                      'Dasbor Kompetensi Langsung',
                      'ライブ習熟度ダッシュボード'
                    )}
                  </div>
                </div>
                <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-white">
                  {overallReadinessPct}% {pick('Ready', 'Siap', '完了')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#CFE0F5]">
                    <Award className="h-3.5 w-3.5" />
                    {pick('Labs Mastered', 'Lab Dikuasai', '習得ラボ')}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-white">
                    {masteredCount}
                    <span className="text-xs font-normal text-[#CFE0F5]/80">
                      {' '}
                      / {simulators.length}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#CFE0F5]">
                    <Box className="h-3.5 w-3.5" />
                    {pick('Labs Visited', 'Lab Dikunjungi', '受講ラボ')}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-white">
                    {visitedCount}
                    <span className="text-xs font-normal text-[#CFE0F5]/80">
                      {' '}
                      / {simulators.length}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#CFE0F5]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {pick('Practice Solved', 'Latihan Selesai', '演習解答')}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-white">
                    {solvedPractice}
                    <span className="text-xs font-normal text-[#CFE0F5]/80">
                      {' '}
                      / {totalPractice}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#CFE0F5]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {pick('Avg Quiz Score', 'Rata-rata Kuis', '平均クイズ点')}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold text-white">
                    {avgQuizPct}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#CFE0F5]">
                <span>
                  {pick(
                    'Overall Readiness Progress',
                    'Progres Kesiapan Keseluruhan',
                    '総合習熟進捗'
                  )}
                </span>
                <span className="font-mono font-semibold text-white">
                  {overallReadinessPct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${overallReadinessPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Count + Simulator Cards Grid */}
      <main className="mx-auto w-full max-w-none flex-1 px-4 pb-12 sm:px-6 lg:px-10 xl:px-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              {pick(
                'Interactive Training Simulators',
                'Simulator Pelatihan Interaktif',
                'インタラクティブ訓練シミュレータ'
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {filteredSimulators.length}
              </span>{' '}
              {pick(
                filteredSimulators.length === 1 ? 'simulator' : 'simulators',
                'simulator',
                '件のシミュレータ'
              )}
            </p>
          </div>

          <div ref={gridTopRef} className="relative w-full sm:max-w-md scroll-mt-24">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
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
              className="glass-panel w-full rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#002D9C] focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#60A5FA]"
            />
          </div>
        </div>

        {filteredSimulators.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No simulators match &ldquo;{searchQuery}&rdquo; in{' '}
              <span className="font-medium text-slate-900 dark:text-slate-200">
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
              className="mt-4 rounded-full bg-[#001F6B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#002D9C] dark:bg-[#002D9C] dark:hover:bg-[#3B82F6]"
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
                  className="glass-card group flex h-full flex-col rounded-2xl p-5 text-left"
                >
                  <div className="flex-1">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#001F6B]/8 text-[#001F6B] dark:bg-white/5 dark:text-[#60A5FA]">
                        <SimulatorIcon
                          iconName={sim.iconName}
                          className="h-5 w-5"
                        />
                      </div>

                      <span className="rounded-full border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
                        {translateDifficulty(sim.difficulty, language)}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {translateCategory(sim.category, language)}
                    </div>

                    <h2 className="mt-1 text-base font-bold text-[#0F172A] transition-colors group-hover:text-[#001F6B] dark:text-white dark:group-hover:text-[#60A5FA]">
                      {sim.title}
                    </h2>

                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                      {sim.description}
                    </p>
                  </div>

                  <div className="mt-auto w-full pt-5">
                    <div className="flex items-center justify-between border-t border-slate-200/70 pt-3.5 text-xs dark:border-white/10">
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {mastered ? (
                          <span className="inline-flex items-center gap-1 font-sans font-semibold text-emerald-700 dark:text-emerald-400">
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
                      <span className="inline-flex items-center gap-1 font-semibold text-[#001F6B] transition group-hover:translate-x-0.5 dark:text-[#60A5FA]">
                        {pick('Launch Lab', 'Buka Lab', 'ラボを開く')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl glass-panel px-5 py-3.5 sm:flex-row">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
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
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#001F6B]/40 hover:text-[#001F6B] disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-[#60A5FA]/40 dark:hover:text-[#60A5FA] cursor-pointer"
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
                          className={`min-w-[32px] rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? 'bg-[#001F6B] text-white shadow-sm dark:bg-[#2563EB]'
                              : 'border border-slate-200/80 bg-white/80 text-slate-700 hover:border-[#001F6B]/40 hover:text-[#001F6B] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-[#60A5FA]/40'
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
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#001F6B]/40 hover:text-[#001F6B] disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-[#60A5FA]/40 dark:hover:text-[#60A5FA] cursor-pointer"
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
