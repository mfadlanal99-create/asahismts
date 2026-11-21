import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  CornerDownLeft,
  Moon,
  Search,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { translateCategory, translateDifficulty } from '../i18n/simulatorRegistry';
import type { SimulatorMeta } from '../types/simulator';
import { SimulatorIcon } from './SimulatorIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  simulators: SimulatorMeta[];
  onSelectSimulator: (id: string) => void;
  onOpenHandbook: () => void;
  onOpenCompetency: () => void;
}

interface PaletteItem {
  id: string;
  label: string;
  subtitle: string;
  kind: 'lab' | 'action';
  iconName?: string;
  onExecute: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  simulators,
  onSelectSimulator,
  onOpenHandbook,
  onOpenCompetency,
}: CommandPaletteProps) {
  const { language, pick } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    onClose();
  }, [onClose]);

  const items: PaletteItem[] = useMemo(() => {
    const labItems: PaletteItem[] = simulators.map((sim) => ({
      id: `lab-${sim.id}`,
      label: sim.title,
      subtitle: `${translateCategory(sim.category, language)} · ${translateDifficulty(sim.difficulty, language)}`,
      kind: 'lab',
      iconName: sim.iconName,
      onExecute: () => {
        onSelectSimulator(sim.id);
        handleClose();
      },
    }));

    const actionItems: PaletteItem[] = [
      {
        id: 'action-handbook',
        label: pick(
          'Open Maintenance Field Handbook',
          'Buka Buku Panduan Lapangan',
          '保全フィールドハンドブックを開く'
        ),
        subtitle: pick(
          'ISO Fits, Bolt Torque, Alignment & Fluid Power reference',
          'Referensi Suaian ISO, Torsi Baut, Penyelarasan Poros & Tenaga Fluida',
          'ISOはめあい・ボルトトルク・芯出し・流体動力リファレンス'
        ),
        kind: 'action',
        onExecute: () => {
          handleClose();
          onOpenHandbook();
        },
      },
      {
        id: 'action-competency',
        label: pick(
          'Open Competency Training Report',
          'Buka Laporan Kompetensi Pelatihan',
          '習熟度訓練レポートを開く'
        ),
        subtitle: pick(
          'View readiness score, lab completion & print certificate',
          'Lihat skor kesiapan, penyelesaian lab & cetak sertifikat',
          '習熟スコア・ラボ完了状況の確認とレポート印刷'
        ),
        kind: 'action',
        onExecute: () => {
          handleClose();
          onOpenCompetency();
        },
      },
      {
        id: 'action-theme',
        label:
          theme === 'dark'
            ? pick(
                'Switch to Clean White Light Mode',
                'Beralih ke Mode Terang',
                'ライトモードに切り替え'
              )
            : pick(
                'Switch to Dark Mode',
                'Beralih ke Mode Gelap',
                'ダークモードに切り替え'
              ),
        subtitle: pick(
          'Toggle application color theme',
          'Ubah tema warna aplikasi',
          'アプリのカラーテーマを切り替え'
        ),
        kind: 'action',
        onExecute: () => {
          toggleTheme();
          handleClose();
        },
      },
    ];

    const q = query.trim().toLowerCase();
    const all = [...labItems, ...actionItems];
    if (!q) return all;
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [
    handleClose,
    language,
    onOpenCompetency,
    onOpenHandbook,
    onSelectSimulator,
    pick,
    query,
    simulators,
    theme,
    toggleTheme,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) =>
          items.length === 0 ? 0 : (prev + 1) % items.length
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) =>
          items.length === 0 ? 0 : (prev - 1 + items.length) % items.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = items[activeIndex];
        if (target) target.onExecute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, handleClose, isOpen, items]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick-jump command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="glass-panel animate-modal-enter w-full max-w-xl overflow-hidden rounded-[32px] border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-low)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--md-outline-variant)]/50 px-5 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-[var(--md-primary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={pick(
              'Jump to a simulator lab, handbook, report, or theme...',
              'Buka lab simulator, panduan, laporan, atau tema...',
              'シミュレータ・ハンドブック・レポート・テーマへ移動...'
            )}
            className="w-full bg-transparent text-sm font-medium text-[var(--md-on-surface)] outline-none placeholder:text-[var(--md-on-surface-variant)]"
          />
          <kbd className="glass-pill rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold text-[var(--md-on-surface-variant)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2.5">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[var(--md-on-surface-variant)]">
              {pick(
                `No matching labs or commands for "${query}".`,
                `Tidak ada lab atau perintah yang cocok untuk "${query}".`,
                `「${query}」に一致するラボやコマンドはありません。`
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={item.onExecute}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left transition ${
                      isSelected
                        ? 'bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]'
                        : 'text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container-high)]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
                        {item.kind === 'lab' && item.iconName ? (
                          <SimulatorIcon
                            iconName={item.iconName}
                            className="h-4 w-4"
                          />
                        ) : item.id === 'action-handbook' ? (
                          <BookMarked className="h-4 w-4" />
                        ) : item.id === 'action-competency' ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : theme === 'dark' ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">
                          {item.label}
                        </div>
                        <div className="truncate text-[11px] opacity-80">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[var(--md-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
