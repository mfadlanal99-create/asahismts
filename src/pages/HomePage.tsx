import { useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Atom,
  Award,
  BookMarked,
  BookOpen,
  Box,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Cog,
  Droplets,
  Gauge,
  Info,
  Layers,
  Moon,
  Ruler,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  SunMedium,
  Wrench,
  X,
} from 'lucide-react';
import { SimulatorIcon } from '../components/SimulatorIcon';
import { TopRibbon } from '../components/TopRibbon';
import { useLanguage, type Language } from '../context/LanguageContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
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

const LANGUAGE_OPTIONS: { id: Language; label: string; title: string }[] = [
  { id: 'en', label: 'EN', title: 'English' },
  { id: 'id', label: 'ID', title: 'Bahasa Indonesia' },
  { id: 'ja', label: 'JA', title: '日本語' },
];

const DATABANK_CATEGORIES: {
  id: 'All' | SimulatorCategory;
  en: string;
  idLabel: string;
  ja: string;
  icon: typeof Activity;
  accentHex: string;
}[] = [
  {
    id: 'All',
    en: 'Command Center',
    idLabel: 'Pusat Komando',
    ja: 'コマンドセンター',
    icon: Activity,
    accentHex: '#e84d28',
  },
  {
    id: 'Precision Measurement',
    en: 'Precision Measurement',
    idLabel: 'Pengukuran Presisi',
    ja: '精密測定',
    icon: Ruler,
    accentHex: '#6366f1',
  },
  {
    id: 'Diagnostic Instruments',
    en: 'Diagnostic Instruments',
    idLabel: 'Instrumen Diagnostik',
    ja: '診断計測器',
    icon: Gauge,
    accentHex: '#e84d28',
  },
  {
    id: 'Rotating Equipment',
    en: 'Rotating Equipment',
    idLabel: 'Peralatan Putar',
    ja: '回転機械',
    icon: Cog,
    accentHex: '#10b981',
  },
  {
    id: 'Machine Elements',
    en: 'Machine Elements',
    idLabel: 'Elemen Mesin',
    ja: '機械要素',
    icon: Wrench,
    accentHex: '#f59e0b',
  },
  {
    id: 'Fluid Power',
    en: 'Fluid Power',
    idLabel: 'Tenaga Fluida',
    ja: '流体動力',
    icon: Droplets,
    accentHex: '#0ea5e9',
  },
];

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
  const [inspectedSimId, setInspectedSimId] = useState<string>(
    () => simulators[0]?.id ?? 'fanuc-m900ib'
  );
  const [todayDate] = useState(() => new Date());
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const { language, setLanguage, pick } = useLanguage();
  const { getSimulatorProgress, isSimulatorMastered } = useProgress();
  const { theme, toggleTheme, uiStyle, toggleUiStyle } = useTheme();

  const atAGlanceDate = useMemo(() => {
    const locale =
      language === 'id' ? 'id-ID' : language === 'ja' ? 'ja-JP' : 'en-US';
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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

  // =========================================================================
  // ASAHIMAS DATA BANK (PORT 5180) UI/UX — THREADS RAIL + KESTREL BENTO
  // =========================================================================
  if (uiStyle === 'databank') {
    const inspectedSim =
      filteredSimulators.find((s) => s.id === inspectedSimId) ??
      filteredSimulators[0] ??
      simulators[0];
    const inspectedProg = inspectedSim
      ? getSimulatorProgress(inspectedSim.id)
      : null;
    const inspectedMastered = inspectedSim
      ? isSimulatorMastered(inspectedSim)
      : false;
    const inspectedQuizDenom =
      inspectedSim && inspectedProg
        ? inspectedProg.quizTotal > 0
          ? inspectedProg.quizTotal
          : inspectedSim.quiz.length
        : 0;
    const inspectedQuizPct =
      inspectedProg &&
      inspectedProg.bestQuizScore !== null &&
      inspectedQuizDenom > 0
        ? Math.round((inspectedProg.bestQuizScore / inspectedQuizDenom) * 100)
        : null;

    const miniBars = [64, 72, 70, 82, 86, 91, Math.max(25, overallReadinessPct)];
    const rotCount = categoryCounts['Rotating Equipment'] ?? 0;
    const diagCount = categoryCounts['Diagnostic Instruments'] ?? 0;
    const otherCount = Math.max(0, simulators.length - rotCount - diagCount);
    const totalSimSafe = Math.max(1, simulators.length);
    const rotPct = Math.round((rotCount / totalSimSafe) * 100);
    const diagPct = Math.round((diagCount / totalSimSafe) * 100);
    const otherPct = Math.max(0, 100 - rotPct - diagPct);

    const practicePct =
      totalPractice > 0 ? Math.round((solvedPractice / totalPractice) * 100) : 0;

    return (
      <div className="th-shell">
        {/* Floating Left Icon Rail (Exact Asahimas Data Bank port 5180 layout) */}
        <aside className="th-rail" aria-label="Primary Navigation">
          <div className="th-rail-top">
            <button
              type="button"
              className="th-brand-mark"
              onClick={() => {
                handleSelectCategory('All');
                setSearchQuery('');
              }}
              title="Asahimas Smart Maintenance Data Bank"
            >
              ADB
            </button>

            <div className="th-rail-pill">
              {DATABANK_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                const label = pick(cat.en, cat.idLabel, cat.ja);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`th-rail-btn ${active ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(cat.id)}
                    aria-label={label}
                  >
                    <Icon size={17} />
                    <span className="th-rail-tooltip">
                      {label} ({categoryCounts[cat.id] ?? 0})
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                className="th-rail-btn"
                onClick={() => onSelectSimulator('machine-3d-explorer')}
                aria-label="3D CAD Machine Explorer"
              >
                <Box size={17} />
                <span className="th-rail-tooltip">3D CAD Machine Explorer</span>
              </button>

              <button
                type="button"
                className="th-rail-btn"
                onClick={() => onSelectSimulator('fanuc-m900ib')}
                aria-label="FANUC M-900iB/700 3D Robot"
              >
                <Cog size={17} />
                <span className="th-rail-tooltip">FANUC M-900iB/700 3D Robot</span>
              </button>

              <button
                type="button"
                className="th-rail-btn"
                onClick={onOpenCompetency}
                aria-label="Competency Report"
              >
                <ShieldCheck size={17} />
                <span className="th-rail-tooltip">
                  {pick('Competency Report', 'Laporan Kompetensi', '習熟度レポート')}
                </span>
              </button>

              <button
                type="button"
                className="th-rail-btn"
                onClick={onOpenHandbook}
                aria-label="Engineering Handbook"
              >
                <BookMarked size={17} />
                <span className="th-rail-tooltip">
                  {pick('Engineering Handbook', 'Buku Panduan Teknik', '技術ハンドブック')}
                </span>
              </button>
            </div>
          </div>

          <div className="th-rail-pill">
            <button
              type="button"
              className="th-rail-btn"
              onClick={onOpenCommandPalette}
              aria-label="AI Command Search (Ctrl+K)"
            >
              <Search size={17} />
              <span className="th-unread-dot" />
              <span className="th-rail-tooltip">Quick Search (Ctrl+K)</span>
            </button>

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
              title="M. Fadlan Alamsyah — Asahi-SMTS"
            >
              FA
            </button>
          </div>
        </aside>

        {/* Main Workspace Container */}
        <main className="th-main">
          {/* Top Header Bar (Exact Asahimas Data Bank port 5180 layout) */}
          <header className="th-header">
            <div>
              <div className="th-date">
                {atAGlanceDate} · Shift A · Asahimas Maintenance Data Bank
              </div>
              <h1 className="th-greeting">
                {selectedCategory === 'All'
                  ? pick(
                      'Command Center · Smart Maintenance Simulators',
                      'Pusat Komando · Simulator Pemeliharaan Cerdas',
                      'コマンドセンター · スマート保全シミュレータ'
                    )
                  : translateCategory(selectedCategory, language)}
              </h1>
            </div>

            <div className="th-header-right">
              <div className="th-plant-pill">
                <span className="th-plant-circle">AS</span>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    Asahimas Plant
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {simulators.length} Maintenance Labs
                  </div>
                </div>
              </div>

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
                        padding: '4px 10px',
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

              <button
                type="button"
                className="gm-btn gm-btn-tonal gm-btn-sm"
                onClick={toggleUiStyle}
                title="Switch back to Classic Pixel UI"
              >
                <Layers size={14} />
                <span>{pick('Pixel UI', 'Pixel UI', 'Pixel UI')}</span>
              </button>
            </div>
          </header>

          {/* Row 1: Top Kestrel KPI Strip — 4 Equal-Height White Cards */}
          <div className="ks-row-1">
            {/* KPI 1: Training Readiness / Fleet Mastery */}
            <button
              type="button"
              className="ks-card ks-kpi-card"
              onClick={onOpenCompetency}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {pick('Training Readiness', 'Kesiapan Pelatihan', '訓練習熟度')}
                </span>
                <span className="status-chip chip-ok">
                  {masteredCount}/{simulators.length} {pick('Mastered', 'Dikuasai', '習得')}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 10,
                  width: '100%',
                }}
              >
                <div className="ks-kpi-val">{overallReadinessPct}%</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 3,
                    height: 28,
                  }}
                >
                  {miniBars.map((v, i) => (
                    <span
                      key={i}
                      style={{
                        width: 5,
                        height: `${Math.max(20, v)}%`,
                        borderRadius: 3,
                        background:
                          i === miniBars.length - 1
                            ? 'linear-gradient(180deg, #FB7185 0%, var(--accent-coral) 100%)'
                            : 'var(--ink-150)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </button>

            {/* KPI 2: Active Maintenance Simulators */}
            <button
              type="button"
              className="ks-card ks-kpi-card"
              onClick={() => handleSelectCategory('All')}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {pick('Active Simulators', 'Simulator Aktif', '稼働シミュレータ')}
                </span>
                <span className="status-chip chip-warn">
                  {visitedCount} {pick('Visited', 'Dikunjungi', '受講済')}
                </span>
              </div>
              <div className="ks-kpi-val">{simulators.length}</div>
              <div
                style={{
                  display: 'flex',
                  gap: 3,
                  height: 8,
                  width: '100%',
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--bg-subtile)',
                }}
              >
                <div
                  style={{
                    width: `${rotPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: '#10B981',
                  }}
                />
                <div
                  style={{
                    width: `${diagPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: '#E84D28',
                  }}
                />
                <div
                  style={{
                    width: `${otherPct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: '#6366F1',
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  width: '100%',
                }}
              >
                <span>
                  {rotCount} Rotating · {diagCount} Diagnostics
                </span>
                <span>{otherCount} Elements/Fluids</span>
              </div>
            </button>

            {/* KPI 3: Hands-On Practice Drills */}
            <button
              type="button"
              className="ks-card ks-kpi-card"
              onClick={onOpenCompetency}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {pick('Practice Compliance', 'Penyelesaian Latihan', '演習達成率')}
                </span>
                <span className="status-chip chip-info">
                  {solvedPractice}/{totalPractice}
                </span>
              </div>
              <div className="ks-kpi-val">{practicePct}%</div>
              <div
                style={{
                  display: 'flex',
                  gap: 3,
                  height: 8,
                  width: '100%',
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--bg-subtile)',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(8, practicePct)}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: '#10B981',
                  }}
                />
                <div
                  style={{
                    width: `${Math.max(0, 100 - Math.max(8, practicePct))}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: '#0EA5E9',
                    opacity: 0.25,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  width: '100%',
                }}
              >
                <span>{solvedPractice} Solved</span>
                <span>{totalPractice - solvedPractice} Remaining</span>
              </div>
            </button>

            {/* KPI 4: Average Quiz Score & 3D Lab Access */}
            <button
              type="button"
              className="ks-card ks-kpi-card"
              onClick={() => onSelectSimulator('machine-3d-explorer')}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {pick('Avg Quiz Competency', 'Rata-rata Kuis', '平均クイズスコア')}
                </span>
                <span className="status-chip chip-ok">3D CAD Ready</span>
              </div>
              <div className="ks-kpi-val">{avgQuizPct}%</div>
              <div className="gm-progress-track">
                <div
                  className="gm-progress-fill"
                  style={{ width: `${Math.max(10, avgQuizPct)}%` }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  width: '100%',
                }}
              >
                <span>ISO 10816 · ISO 281 · ASME</span>
                <span>Launch 3D Explorer →</span>
              </div>
            </button>
          </div>

          {/* Filter & Search Toolbar (Exact Asahimas Data Bank .gm-toolbar) */}
          <div ref={gridTopRef} className="gm-toolbar">
            <div className="gm-chips">
              {DATABANK_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                const label =
                  cat.id === 'All'
                    ? pick('All Labs', 'Semua Lab', '全ラボ')
                    : pick(cat.en, cat.idLabel, cat.ja);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`gm-chip ${active ? 'active' : ''}`}
                  >
                    <span>{label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        opacity: 0.85,
                      }}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="th-search-bar" style={{ minWidth: 270 }}>
                <Search size={15} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={pick(
                    'Search simulators, tools, tags...',
                    'Cari simulator, alat, kode...',
                    'シミュレータ・機器タグを検索...'
                  )}
                  className="th-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="gm-btn gm-btn-tonal gm-btn-sm"
                title="AI Command Search (Ctrl+K)"
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  Ctrl+K
                </span>
              </button>
            </div>
          </div>

          {/* Sub-view Split Pattern (.ag-split-view): 2-Col Kestrel Cards + Sticky Right Inspector */}
          {filteredSimulators.length === 0 ? (
            <div className="ks-card" style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                No maintenance simulators match &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  handleSelectCategory('All');
                }}
                className="gm-btn gm-btn-aurora gm-btn-sm"
                style={{ marginTop: 12 }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="ag-split-view">
              {/* Left: 2-Column Kestrel Cards + Pagination */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="ks-cards-2col">
                  {paginatedSimulators.map((sim, idx) => {
                    const sp = getSimulatorProgress(sim.id);
                    const mastered = isSimulatorMastered(sim);
                    const isSelected = inspectedSim?.id === sim.id;
                    const globalNum = String(pageStartIdx + idx + 1).padStart(
                      2,
                      '0'
                    );

                    return (
                      <div
                        key={sim.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setInspectedSimId(sim.id)}
                        onDoubleClick={() => onSelectSimulator(sim.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectSimulator(sim.id);
                          }
                        }}
                        className={`ks-item-card clickable ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <span className="gm-tag">LAB-{globalNum}</span>

                          <span
                            className={`status-chip ${
                              mastered
                                ? 'chip-ok'
                                : sim.difficulty === 'Advanced'
                                ? 'chip-err'
                                : sim.difficulty === 'Intermediate'
                                ? 'chip-warn'
                                : 'chip-info'
                            }`}
                          >
                            {mastered
                              ? pick('Mastered', 'Dikuasai', '習得済')
                              : translateDifficulty(sim.difficulty, language)}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 11,
                              background: 'var(--bg-tonal)',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid var(--border-hairline)',
                            }}
                          >
                            <SimulatorIcon
                              iconName={sim.iconName}
                              className="h-4 w-4"
                            />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 14.5,
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                lineHeight: 1.25,
                              }}
                            >
                              {sim.shortTitle}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                marginTop: 2,
                              }}
                            >
                              {translateCategory(sim.category, language)}
                            </div>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: 12.5,
                            color: 'var(--text-secondary)',
                            lineHeight: 1.45,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {sim.description}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: 4,
                            borderTop: '1px solid var(--border-hairline)',
                            fontSize: 11.5,
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            {sp.solvedPracticeIds.length}/{sim.practice.length}{' '}
                            {pick('drills', 'latihan', '演習')} · {sim.quiz.length}{' '}
                            {pick('quiz', 'kuis', 'クイズ')}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSimulator(sim.id);
                            }}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              fontSize: 12,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: 0,
                            }}
                          >
                            <span>{pick('Open', 'Buka', '開く')}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div
                    className="ks-card"
                    style={{
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {pick(
                        `Showing ${pageStartIdx + 1}–${Math.min(
                          pageStartIdx + ITEMS_PER_PAGE,
                          filteredSimulators.length
                        )} of ${filteredSimulators.length} labs`,
                        `Menampilkan ${pageStartIdx + 1}–${Math.min(
                          pageStartIdx + ITEMS_PER_PAGE,
                          filteredSimulators.length
                        )} dari ${filteredSimulators.length} lab`,
                        `${filteredSimulators.length}件中 ${pageStartIdx + 1}–${Math.min(
                          pageStartIdx + ITEMS_PER_PAGE,
                          filteredSimulators.length
                        )}件を表示`
                      )}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handlePageChange(safePage - 1)}
                        disabled={safePage === 1}
                        className="gm-btn gm-btn-tonal gm-btn-sm"
                      >
                        <ChevronLeft size={14} />
                        {pick('Prev', 'Sebelumnya', '前へ')}
                      </button>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`gm-chip ${
                              pageNum === safePage ? 'active' : ''
                            }`}
                            style={{ padding: '5px 11px', fontWeight: 600 }}
                          >
                            {pageNum}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => handlePageChange(safePage + 1)}
                        disabled={safePage === totalPages}
                        className="gm-btn gm-btn-tonal gm-btn-sm"
                      >
                        {pick('Next', 'Berikutnya', '次へ')}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Sticky Asset / Simulator Inspector (.ag-inspector) */}
              {inspectedSim && (
                <aside className="ag-inspector">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span className="gm-tag">
                      {inspectedSim.id.toUpperCase()}
                    </span>
                    <span
                      className={`status-chip ${
                        inspectedMastered ? 'chip-ok' : 'chip-warn'
                      }`}
                    >
                      {inspectedMastered
                        ? pick('Verified Mastered', 'Kompeten', '習得完了')
                        : translateDifficulty(inspectedSim.difficulty, language)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 14,
                        background: 'var(--bg-tonal)',
                        color: 'var(--accent-coral)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SimulatorIcon
                        iconName={inspectedSim.iconName}
                        className="h-6 w-6"
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600 }}>
                        {inspectedSim.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          marginTop: 2,
                        }}
                      >
                        {translateCategory(inspectedSim.category, language)}
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                    }}
                  >
                    {inspectedSim.description}
                  </p>

                  {/* 3-Column Count Subtiles */}
                  <div className="ks-3col-tiles">
                    <div className="ks-count-tile">
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        Theory
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {inspectedSim.explore.length}
                      </span>
                    </div>
                    <div className="ks-count-tile">
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        Practice
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {inspectedProg?.solvedPracticeIds.length ?? 0}/
                        {inspectedSim.practice.length}
                      </span>
                    </div>
                    <div className="ks-count-tile">
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontWeight: 500,
                        }}
                      >
                        Best Quiz
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {inspectedQuizPct !== null ? `${inspectedQuizPct}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="ag-inspector-section">
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {pick(
                        'Engineering Curriculum Modules',
                        'Modul Kurikulum Teknik',
                        'エンジニアリング学習項目'
                      )}
                    </div>
                    {inspectedSim.explore.slice(0, 3).map((sec, i) => (
                      <div key={i} className="ks-subtile" style={{ padding: '9px 12px' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                          {sec.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {sec.equations.length} Equations
                          {sec.workedExample ? ' · Worked Example' : ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ag-inspector-section">
                    <div className="ag-kv-row">
                      <span className="ag-kv-label">Plant Division</span>
                      <span className="ag-kv-val">Asahimas Flat Glass · Maintenance</span>
                    </div>
                    <div className="ag-kv-row">
                      <span className="ag-kv-label">Training Mode</span>
                      <span className="ag-kv-val">Simulate · Explore · Practice · Quiz</span>
                    </div>
                    <div className="ag-kv-row">
                      <span className="ag-kv-label">Author</span>
                      <span className="ag-kv-val">M. Fadlan Alamsyah</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectSimulator(inspectedSim.id)}
                    className="gm-btn gm-btn-aurora"
                    style={{ width: '100%', padding: '11px 18px' }}
                  >
                    <span>
                      {pick(
                        'Launch Interactive Simulator',
                        'Buka Simulator Interaktif',
                        'シミュレータを起動'
                      )}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </aside>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // BACKUP: CLASSIC PIXEL LAUNCHER UI (1-Click Instant Switch Back)
  // =========================================================================
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
                  'Berlatih pengukuran presisi, instrumen diagnostik (multimeter, tang ampere, megohmmeter, takometer laser, pengukur getaran & dB), penyelarasan poros laser, diagnostik bantalan, elemen mesin, hidraulik, dan kurva pompa.',
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
                    'Buka Navigasi Cepat (Ctrl+K)',
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
                    'Tampilan Terurai Mesin 3D',
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
                    'Kisi Kristal 3D',
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

      < Info className="hidden" />
    </div>
  );
}
