import type { Language } from '../context/LanguageContext';
import type {
  ExploreSection,
  PracticeProblem,
  QuizQuestion,
  SimulatorCategory,
  SimulatorDifficulty,
  SimulatorMeta,
} from '../types/simulator';

export interface LocalizedMetaOverlay {
  title?: string;
  shortTitle?: string;
  description?: string;
  explore?: Partial<ExploreSection>[];
  practice?: Partial<PracticeProblem>[];
  quiz?: Partial<QuizQuestion>[];
}

type SimulatorTranslationMap = Partial<Record<'id' | 'ja', LocalizedMetaOverlay>>;

const registry = new Map<string, SimulatorTranslationMap>();

export function registerSimulatorTranslations(
  simulatorId: string,
  translations: SimulatorTranslationMap
): void {
  const existing = registry.get(simulatorId) ?? {};
  registry.set(simulatorId, {
    ...existing,
    ...translations,
  });
}

const CATEGORY_LABELS: Record<
  SimulatorCategory,
  { en: string; id: string; ja: string }
> = {
  'Precision Measurement': {
    en: 'Precision Measurement',
    id: 'Pengukuran Presisi',
    ja: '精密測定',
  },
  'Machine Elements': {
    en: 'Machine Elements',
    id: 'Elemen Mesin',
    ja: '機械要素',
  },
  'Rotating Equipment': {
    en: 'Rotating Equipment',
    id: 'Peralatan Rotasi',
    ja: '回転機械',
  },
  'Fluid Power': {
    en: 'Fluid Power',
    id: 'Tenaga Fluida',
    ja: '流体動力',
  },
  'Diagnostic Instruments': {
    en: 'Diagnostic Instruments',
    id: 'Instrumen Diagnostik',
    ja: '診断計測器',
  },
};

const DIFFICULTY_LABELS: Record<
  SimulatorDifficulty,
  { en: string; id: string; ja: string }
> = {
  Beginner: { en: 'Beginner', id: 'Pemula', ja: '初級' },
  Intermediate: { en: 'Intermediate', id: 'Menengah', ja: '中級' },
  Advanced: { en: 'Advanced', id: 'Lanjutan', ja: '上級' },
};

export function translateCategory(
  category: SimulatorCategory,
  language: Language
): string {
  return CATEGORY_LABELS[category]?.[language] ?? category;
}

export function translateDifficulty(
  difficulty: SimulatorDifficulty,
  language: Language
): string {
  return DIFFICULTY_LABELS[difficulty]?.[language] ?? difficulty;
}

export function getLocalizedMeta(
  meta: SimulatorMeta,
  language: Language
): SimulatorMeta {
  if (language === 'en') return meta;
  const overlay = registry.get(meta.id)?.[language];
  if (!overlay) return meta;

  const explore: ExploreSection[] = meta.explore.map((section, idx) => {
    const ov = overlay.explore?.[idx];
    if (!ov) return section;
    return {
      title: ov.title ?? section.title,
      summary: ov.summary ?? section.summary,
      equations: ov.equations
        ? section.equations.map((eq, eqIdx) => ({
            ...eq,
            ...(ov.equations?.[eqIdx] ?? {}),
          }))
        : section.equations,
      workedExample: section.workedExample
        ? ov.workedExample
          ? {
              ...section.workedExample,
              ...ov.workedExample,
            }
          : section.workedExample
        : ov.workedExample,
    };
  });

  const practice: PracticeProblem[] = meta.practice.map((prob, idx) => {
    const ov =
      overlay.practice?.find((p) => p.id && p.id === prob.id) ??
      overlay.practice?.[idx];
    if (!ov) return prob;
    return {
      ...prob,
      ...ov,
    };
  });

  const quiz: QuizQuestion[] = meta.quiz.map((q, idx) => {
    const ov =
      overlay.quiz?.find((item) => item.id && item.id === q.id) ??
      overlay.quiz?.[idx];
    if (!ov) return q;
    return {
      ...q,
      ...ov,
    };
  });

  return {
    ...meta,
    title: overlay.title ?? meta.title,
    shortTitle: overlay.shortTitle ?? meta.shortTitle,
    description: overlay.description ?? meta.description,
    explore,
    practice,
    quiz,
  };
}
