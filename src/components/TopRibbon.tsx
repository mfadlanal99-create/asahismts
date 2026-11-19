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
import { useTheme, type PixelSeed } from '../context/ThemeContext';
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

const PIXEL_SEEDS: { id: PixelSeed; label: string; swatch: string }[] = [
  { id: 'sapphire', label: 'Sapphire Blue', swatch: '#0B57D0' },
  { id: 'mint', label: 'Lemongrass Mint', swatch: '#146C2E' },
  { id: 'lavender', label: 'Iris Lavender', swatch: '#65558F' },
  { id: 'amber', label: 'Sunset Amber', swatch: '#E65100' },
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
  const { seed, setSeed } = useTheme();
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
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[28px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)]/90 px-3 py-2 text-[var(--md-on-surface)] shadow-[0_8px_28px_-10px_rgba(0,0,0,0.14)] backdrop-blur-2xl lg:rounded-full">
        {/* Left: Pixel Launcher App Chip + Wordmark */}
        <button
          type="button"
          onClick={props.onHome}
          className="inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-left transition hover:bg-[var(--md-surface-container-high)]"
          title={pick(
            'Back to Asahi-SMTS Library',
            'Kembali ke Perpustakaan Asahi-SMTS',
            'Asahi-SMTS ライブラリへ戻る'
          )}
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)] shadow-2xs">
            <Wrench className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--md-primary)] ring-2 ring-[var(--md-surface-container-low)]" />
          </span>
          <span className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-[var(--md-on-surface)]">
              Asahi-SMTS
            </span>
            <span className="hidden rounded-full bg-[var(--md-secondary-container)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[var(--md-on-secondary-container)] sm:inline-block">
              Pixel UI
            </span>
          </span>
        </button>

        {/* Center: Android 17 Material 3 Segmented Dock */}
        {props.variant === 'home' ? (
          <nav
            aria-label={pick('Lab categories', 'Kategori lab', 'ラボカテゴリ')}
            className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-full border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-high)] p-1 lg:order-2 lg:w-auto"
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
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition xl:px-3 ${
                    isActive
                      ? 'bg-[var(--md-secondary-container)] font-semibold text-[var(--md-on-secondary-container)] shadow-2xs'
                      : 'font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] hover:text-[var(--md-on-surface)]'
                  }`}
                >
                  <span>{tabLabel}</span>
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none ${
                        isActive
                          ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                          : 'bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]'
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
          <div className="order-3 flex w-full flex-wrap items-center justify-center gap-2 lg:order-2 lg:w-auto">
            <nav
              aria-label={pick('Simulator modes', 'Mode simulator', 'シミュレータモード')}
              className="flex items-center gap-1 rounded-full border border-[var(--md-outline-variant)]/45 bg-[var(--md-surface-container-high)] p-1"
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                      isActive
                        ? 'bg-[var(--md-primary-container)] font-semibold text-[var(--md-on-primary-container)] shadow-2xs'
                        : 'font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] hover:text-[var(--md-on-surface)]'
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
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-3.5 text-xs font-semibold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
                >
                  <span className="max-w-[115px] truncate">
                    {currentSim?.shortTitle ??
                      pick('Switch Lab', 'Ganti Lab', 'ラボ切替')}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
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
                    className="glass-panel absolute right-0 mt-2 w-72 origin-top-right p-2 shadow-xl"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--md-on-surface-variant)]">
                      {pick(
                        'Switch Maintenance Lab',
                        'Ganti Lab Pemeliharaan',
                        '保全ラボを切り替え'
                      )}
                    </div>
                    <div className="max-h-72 space-y-1 overflow-y-auto">
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
                            className={`flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-xs transition ${
                              isCurrent
                                ? 'bg-[var(--md-secondary-container)] font-semibold text-[var(--md-on-secondary-container)]'
                                : 'text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate">{sim.shortTitle}</div>
                              <div className="truncate text-[10px] text-[var(--md-on-surface-variant)]">
                                {translateCategory(sim.category, language)}
                              </div>
                            </div>
                            {isCurrent && (
                              <Check className="h-3.5 w-3.5 shrink-0 text-[var(--md-primary)]" />
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

        {/* Right: Quick Settings Utility Cluster */}
        <div className="order-2 flex items-center gap-1.5 lg:order-3">
          {/* Material You Monet Seed Switcher */}
          <div
            role="group"
            aria-label="Material You Color"
            title="Material You Color"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container-high)] px-2"
          >
            {PIXEL_SEEDS.map((opt) => {
              const active = seed === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeed(opt.id)}
                  aria-label={`Material You Color: ${opt.label}`}
                  title={`Material You Color · ${opt.label}`}
                  aria-pressed={active}
                  className={`flex h-4 w-4 items-center justify-center rounded-full transition-transform ${
                    active
                      ? 'scale-110 ring-2 ring-[var(--md-primary)] ring-offset-2 ring-offset-[var(--md-surface-container-high)]'
                      : 'opacity-75 hover:scale-105 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: opt.swatch }}
                />
              );
            })}
          </div>

          {props.onOpenCommandPalette && (
            <button
              type="button"
              onClick={props.onOpenCommandPalette}
              title={pick(
                'Quick Jump (Ctrl+K)',
                'Lompat Cepat (Ctrl+K)',
                'クイックジャンプ (Ctrl+K)'
              )}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-3 text-xs font-semibold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)]"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="hidden font-mono text-[10px] text-[var(--md-on-surface-variant)] sm:inline">
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
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-2.5 text-xs font-semibold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)] 2xl:px-3"
            >
              <BookMarked className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              <span className="hidden 2xl:inline">
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
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] px-2.5 text-xs font-semibold text-[var(--md-on-surface)] transition hover:bg-[var(--md-secondary-container)] hover:text-[var(--md-on-secondary-container)] 2xl:px-3"
            >
              <Info className="h-3.5 w-3.5 text-[var(--md-primary)]" />
              <span className="hidden 2xl:inline">
                {pick('About', 'Tentang', '概要')}
              </span>
            </button>
          )}

          <div
            role="group"
            aria-label={pick('Language', 'Bahasa', '言語')}
            className="inline-flex h-9 items-center rounded-full border border-[var(--md-outline-variant)]/60 bg-[var(--md-surface-container-high)] p-0.5"
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
                  className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-bold transition ${
                    active
                      ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)] shadow-2xs'
                      : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]'
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
