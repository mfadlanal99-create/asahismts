import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  CheckSquare,
  ClipboardCheck,
  Sliders,
  Sparkles,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WELCOME_STORAGE_KEY = 'asahi-smts-hide-welcome';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEARNING_MODES = [
  {
    enTitle: 'Simulate',
    idTitle: 'Simulasi',
    jaTitle: 'シミュレート',
    enDesc: 'Live interactive rigs, gauges & fault injection',
    idDesc: 'Rig interaktif langsung, alat ukur & simulasi kerusakan',
    jaDesc: 'リアルタイム操作リグ・計器・異常再現',
    icon: Sliders,
    color: 'text-[#001F6B] dark:text-[#60A5FA]',
    bg: 'bg-[#E6EDF8] dark:bg-[#001F6B]/25',
  },
  {
    enTitle: 'Explore',
    idTitle: 'Materi',
    jaTitle: '理論学習',
    enDesc: 'Maintenance theory, standards & worked examples',
    idDesc: 'Teori pemeliharaan, standar & contoh soal terbahas',
    jaDesc: '保全理論・規格・例題解説',
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    enTitle: 'Practice',
    idTitle: 'Latihan',
    jaTitle: '演習',
    enDesc: 'Hands-on numerical drills with step-by-step checks',
    idDesc: 'Latihan perhitungan dengan pemeriksaan langkah demi langkah',
    jaDesc: '段階的チェック付き数値演習ドリル',
    icon: ClipboardCheck,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    enTitle: 'Quiz',
    idTitle: 'Kuis',
    jaTitle: 'クイズ',
    enDesc: 'Competency assessments with instant explanations',
    idDesc: 'Evaluasi kompetensi dengan penjelasan instan',
    jaDesc: '即時解説付き習熟度テスト',
    icon: CheckSquare,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
  },
];

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { pick } = useLanguage();
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(WELCOME_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const persistPreference = useCallback((hide: boolean) => {
    try {
      if (hide) {
        window.localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(WELCOME_STORAGE_KEY);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleClose = useCallback(() => {
    persistPreference(dontShowAgain);
    onClose();
  }, [dontShowAgain, onClose, persistPreference]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm dark:bg-slate-950/60"
      onClick={handleClose}
    >
      <div
        className="glass-panel relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-slate-200/80 px-6 pt-6 pb-5 dark:border-white/10">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close welcome dialog"
            className="glass-pill absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#001F6B]/8 text-[#001F6B] dark:bg-white/5 dark:text-[#60A5FA] sm:flex">
              <Wrench className="h-5 w-5" />
            </div>

            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#001F6B] dark:text-[#60A5FA]">
                <Sparkles className="h-3 w-3" />
                Asahi-SMTS
              </div>
              <h2
                id="welcome-modal-title"
                className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white sm:text-2xl"
              >
                Asahimas Smart Maintenance Training System
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                {pick(
                  'Interactive plant reliability & mechanical maintenance suite with 40 hands-on simulators across precision measurement, diagnostic instruments, rotating equipment, machine elements, and fluid power.',
                  'Paket keandalan pabrik & pemeliharaan mekanik interaktif dengan 40 simulator praktis di bidang pengukuran presisi, instrumen diagnostik, peralatan rotasi, elemen mesin, dan tenaga fluida.',
                  '精密測定・診断計測器・回転機械・機械要素・流体動力の5分野40種類の実践シミュレータを備えたインタラクティブ保全訓練システム。'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Body: 4 Learning Mode Cards */}
        <div className="px-6 py-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {pick(
              '4-Mode Training Workflow',
              'Alur Pelatihan 4 Mode',
              '4モード訓練ワークフロー'
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {LEARNING_MODES.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.enTitle}
                  className="glass-card flex items-start gap-3 rounded-2xl p-3.5"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/60 shadow-xs backdrop-blur-md dark:border-white/10 ${m.bg} ${m.color}`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {pick(m.enTitle, m.idTitle, m.jaTitle)}
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-slate-600 dark:text-slate-400">
                      {pick(m.enDesc, m.idDesc, m.jaDesc)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Creator badge */}
          <div className="glass-pill mt-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <UserCheck className="h-4 w-4 text-[#001F6B] dark:text-[#60A5FA]" />
              {pick('Made by', 'Dibuat oleh', '制作')}{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                M. Fadlan Alamsyah
              </strong>
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Asahi-SMTS v1.0
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-white/60 bg-white/40 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/40 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600 select-none dark:text-slate-400">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => {
                setDontShowAgain(e.target.checked);
                persistPreference(e.target.checked);
              }}
              className="h-4 w-4 rounded border-slate-300 text-[#001F6B] focus:ring-[#002D9C] dark:border-slate-700 dark:bg-slate-900"
            />
            {pick(
              "Don't show again on startup",
              'Jangan tampilkan lagi saat mulai',
              '起動時に次回から表示しない'
            )}
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl bg-[#001F6B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#001F6B]/20 transition hover:bg-[#002D9C] dark:bg-[#002D9C] dark:text-white dark:hover:bg-[#3B82F6] sm:w-auto"
          >
            {pick(
              'Enter Training System',
              'Masuk ke Sistem Pelatihan',
              '訓練システムへ入る'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
