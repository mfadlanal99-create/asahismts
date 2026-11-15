import { useEffect, useRef, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Check,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  Info,
  Search,
  Sliders,
  Wrench,
} from 'lucide-react';
import { useLanguage, type Language } from '../context/LanguageContext';
import { translateCategory } from '../i18n/simulatorRegistry';
import type {
  SimulatorAccentColor,
  SimulatorMeta,
  SimulatorMode,
} from '../types/simulator';
import { ThemeToggle } from './ThemeToggle';

const LANGUAGE_OPTIONS: { id: Language; label: string; title: string }[] = [
  { id: 'en', label: 'EN', title: 'English' },
  { id: 'id', label: 'ID', title: 'Bahasa Indonesia' },
  { id: 'ja', label: 'JA', title: '日本語' },
];

const HOME_CATEGORY_TABS = [
  { id: 'All', en: 'All Labs', idLabel: 'Semua Lab', ja: '全ラボ' },
  {
    id: 'Precision Measurement',
    en: 'Measurement',
    idLabel: 'Pengukuran',
    ja: '精密測定',
  },
  { id: 'Machine Elements', en: 'Elements', idLabel: 'Elemen', ja: '機械要素' },
  { id: 'Rotating Equipment', en: 'Rotating', idLabel: 'Rotasi', ja: '回転機械' },
  { id: 'Fluid Power', en: 'Fluid Power', idLabel: 'Fluida', ja: '流体動力' },
  {
    id: 'Diagnostic Instruments',
    en: 'Diagnostics',
    idLabel: 'Diagnostik',
    ja: '診断計測',
  },
] as const;

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

interface TopRibbonBaseProps {
  onHome: () => void;
  onOpenWelcome?: () => void;
  onOpenHandbook?: () => void;
  onOpenCommandPalette?: () => void;
}

interface HomeRibbonProps extends TopRibbonBaseProps {
  variant: 'home';
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

interface SimulatorRibbonProps extends TopRibbonBaseProps {
  variant: 'simulator';
  mode: SimulatorMode;
  onChangeMode: (mode: SimulatorMode) => void;
  accentColor: SimulatorAccentColor;
  currentSimulatorId: string;
  simulators: SimulatorMeta[];
  onSelectSimulator?: (id: string) => void;
}

export type TopRibbonProps = HomeRibbonProps | SimulatorRibbonProps;

export function TopRibbon(props: TopRibbonProps) {
  const { language, setLanguage, pick } = useLanguage();
  const [labMenuOpen, setLabMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!labMenuOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLabMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLabMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [labMenuOpen]);

  const currentSim =
    props.variant === 'simulator'
      ? props.simulators.find((s) => s.id === props.currentSimulatorId)
      : undefined;

  return (
    <div className="sticky top-3 z-40 mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-12 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-white/20 bg-[#001F6B]/78 px-3 py-1.5 text-white shadow-[0_12px_32px_-10px_rgba(0,31,107,0.45),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl dark:border-white/15 dark:bg-[#00164D]/75 lg:rounded-full">
        {/* Left: Compact Asahi-SMTS Brand Mark + Wordmark */}
        <button
          type="button"
          onClick={props.onHome}
          className="inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-left transition hover:bg-white/10"
          title={pick(
            'Back to Asahi-SMTS Library',
            'Kembali ke Perpustakaan Asahi-SMTS',
            'Asahi-SMTS ライブラリへ戻る'
          )}
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#001F6B] dark:bg-white/15 dark:text-white">
            <Wrench className="h-3.5 w-3.5" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#E73356] ring-2 ring-[#001F6B] dark:ring-[#00164D]" />
          </span>
          <span className="text-sm font-bold tracking-tight text-white">
            Asahi-SMTS
          </span>
        </button>

        {/* Center: Segmented Pill Tabs */}
        {props.variant === 'home' ? (
          <nav
            aria-label={pick('Lab categories', 'Kategori lab', 'ラボカテゴリ')}
            className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-full border border-white/40 bg-white/75 p-1 backdrop-blur-md dark:border-white/15 dark:bg-[#07101E]/65 lg:order-2 lg:w-auto"
          >
            {HOME_CATEGORY_TABS.map((tab) => {
              const isActive = props.selectedCategory === tab.id;
              const count = props.categoryCounts?.[tab.id];
              const tabLabel = pick(tab.en, tab.idLabel, tab.ja);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => props.onSelectCategory(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#001F6B] font-semibold text-white dark:bg-[#002D9C] dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  <span>{tabLabel}</span>
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          <div className="order-3 flex w-full flex-wrap items-center justify-center gap-1.5 lg:order-2 lg:w-auto">
            <nav
              aria-label={pick('Simulator modes', 'Mode simulator', 'シミュレータモード')}
              className="flex items-center gap-1 rounded-full border border-white/40 bg-white/75 p-1 backdrop-blur-md dark:border-white/15 dark:bg-[#07101E]/65"
            >
              {SIMULATOR_MODES.map((m, idx) => {
                const ModeIcon = m.icon;
                const isActive = props.mode === m.id;
                const modeLabel = pick(m.en, m.idLabel, m.ja);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => props.onChangeMode(m.id)}
                    title={`${modeLabel} (Alt+${idx + 1})`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#001F6B] font-semibold text-white dark:bg-[#002D9C] dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                    }`}
                  >
                    <ModeIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{modeLabel}</span>
                  </button>
                );
              })}
            </nav>

            {/* Compact Switch Lab Dropdown */}
            {props.onSelectSimulator && props.simulators.length > 0 && (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setLabMenuOpen((prev) => !prev)}
                  aria-expanded={labMenuOpen}
                  aria-haspopup="listbox"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  <span className="max-w-[105px] truncate">
                    {currentSim?.shortTitle ??
                      pick('Switch Lab', 'Ganti Lab', 'ラボ切替')}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-white/80 transition-transform ${
                      labMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {labMenuOpen && (
                  <div
                    role="listbox"
                    aria-label={pick(
                      'Switch simulator lab',
                      'Ganti lab simulator',
                      'シミュレータラボ切替'
                    )}
                    className="glass-panel absolute right-0 mt-2 w-64 origin-top-right rounded-2xl p-1.5 shadow-xl"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {pick(
                        'Switch Maintenance Lab',
                        'Ganti Lab Pemeliharaan',
                        '保全ラボを切り替え'
                      )}
                    </div>
                    <div className="max-h-72 space-y-0.5 overflow-y-auto">
                      {props.simulators.map((sim) => {
                        const isCurrent = sim.id === props.currentSimulatorId;
                        return (
                          <button
                            key={sim.id}
                            type="button"
                            role="option"
                            aria-selected={isCurrent}
                            onClick={() => {
                              setLabMenuOpen(false);
                              props.onSelectSimulator?.(sim.id);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition ${
                              isCurrent
                                ? 'bg-[#E6EDF8] font-semibold text-[#001F6B] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate">{sim.shortTitle}</div>
                              <div className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                                {translateCategory(sim.category, language)}
                              </div>
                            </div>
                            {isCurrent && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-[#001F6B] dark:text-[#60A5FA]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right: Compact Pill Utilities (Cmd+K, Handbook, About, Theme) */}
        <div className="order-2 flex items-center gap-1.5 lg:order-3">
          {props.onOpenCommandPalette && (
            <button
              type="button"
              onClick={props.onOpenCommandPalette}
              title={pick(
                'Quick Jump (Ctrl+K)',
                'Lompat Cepat (Ctrl+K)',
                'クイックジャンプ (Ctrl+K)'
              )}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="hidden font-mono text-[10px] text-white/75 sm:inline">
                ⌘K
              </kbd>
            </button>
          )}

          {props.onOpenHandbook && (
            <button
              type="button"
              onClick={props.onOpenHandbook}
              title={pick(
                'Maintenance Field Handbook',
                'Buku Panduan Lapangan',
                '保全フィールドハンドブック'
              )}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <BookMarked className="h-3.5 w-3.5 text-[#CFE0F5]" />
              <span className="hidden xl:inline">
                {pick('Handbook', 'Panduan', 'ハンドブック')}
              </span>
            </button>
          )}

          {props.onOpenWelcome && (
            <button
              type="button"
              onClick={props.onOpenWelcome}
              title={pick(
                'About Asahi-SMTS',
                'Tentang Asahi-SMTS',
                'Asahi-SMTS について'
              )}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <Info className="h-3.5 w-3.5 text-[#CFE0F5]" />
              <span className="hidden xl:inline">
                {pick('About', 'Tentang', '概要')}
              </span>
            </button>
          )}

          <div
            role="group"
            aria-label={pick('Language', 'Bahasa', '言語')}
            className="inline-flex h-8 items-center rounded-full border border-white/25 bg-white/10 p-0.5"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLanguage(opt.id)}
                  title={opt.title}
                  aria-pressed={active}
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold transition ${
                    active
                      ? 'bg-white text-[#001F6B] shadow-xs dark:bg-[#002D9C] dark:text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
