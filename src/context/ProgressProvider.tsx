import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { SimulatorMeta } from '../types/simulator';
import {
  ProgressContext,
  type ProgressState,
  type SimulatorProgress,
} from './ProgressContext';

const STORAGE_KEY = 'asahi-smts-progress';

const DEFAULT_SIM_PROGRESS: SimulatorProgress = {
  visited: false,
  solvedPracticeIds: [],
  bestQuizScore: null,
  quizTotal: 0,
};

const DEFAULT_STATE: ProgressState = {
  traineeName: '',
  simulators: {},
};

function loadInitialProgress(): ProgressState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      traineeName:
        typeof parsed.traineeName === 'string' ? parsed.traineeName : '',
      simulators:
        parsed.simulators && typeof parsed.simulators === 'object'
          ? parsed.simulators
          : {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(loadInitialProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage access errors
    }
  }, [progress]);

  const setTraineeName = useCallback((name: string) => {
    setProgress((prev) => ({ ...prev, traineeName: name }));
  }, []);

  const markVisited = useCallback((simulatorId: string) => {
    setProgress((prev) => {
      const current = prev.simulators[simulatorId] ?? DEFAULT_SIM_PROGRESS;
      return {
        ...prev,
        simulators: {
          ...prev.simulators,
          [simulatorId]: {
            ...current,
            visited: true,
            lastVisitedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const markPracticeSolved = useCallback(
    (simulatorId: string, problemId: string) => {
      setProgress((prev) => {
        const current = prev.simulators[simulatorId] ?? DEFAULT_SIM_PROGRESS;
        if (current.solvedPracticeIds.includes(problemId)) return prev;
        return {
          ...prev,
          simulators: {
            ...prev.simulators,
            [simulatorId]: {
              ...current,
              visited: true,
              solvedPracticeIds: [...current.solvedPracticeIds, problemId],
            },
          },
        };
      });
    },
    []
  );

  const recordQuizScore = useCallback(
    (simulatorId: string, score: number, total: number) => {
      setProgress((prev) => {
        const current = prev.simulators[simulatorId] ?? DEFAULT_SIM_PROGRESS;
        const nextBest =
          current.bestQuizScore === null
            ? score
            : Math.max(current.bestQuizScore, score);
        return {
          ...prev,
          simulators: {
            ...prev.simulators,
            [simulatorId]: {
              ...current,
              visited: true,
              bestQuizScore: nextBest,
              quizTotal: total,
            },
          },
        };
      });
    },
    []
  );

  const resetSimulatorPractice = useCallback((simulatorId: string) => {
    setProgress((prev) => {
      const current = prev.simulators[simulatorId];
      if (!current) return prev;
      return {
        ...prev,
        simulators: {
          ...prev.simulators,
          [simulatorId]: {
            ...current,
            solvedPracticeIds: [],
          },
        },
      };
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgress((prev) => ({
      traineeName: prev.traineeName,
      simulators: {},
    }));
  }, []);

  const getSimulatorProgress = useCallback(
    (simulatorId: string): SimulatorProgress =>
      progress.simulators[simulatorId] ?? DEFAULT_SIM_PROGRESS,
    [progress.simulators]
  );

  const isSimulatorMastered = useCallback(
    (meta: SimulatorMeta): boolean => {
      const sp = progress.simulators[meta.id];
      if (!sp || sp.bestQuizScore === null) return false;
      const total = sp.quizTotal > 0 ? sp.quizTotal : meta.quiz.length;
      if (total === 0) return false;
      return sp.bestQuizScore / total >= 0.8;
    },
    [progress.simulators]
  );

  return (
    <ProgressContext.Provider
      value={{
        progress,
        setTraineeName,
        markVisited,
        markPracticeSolved,
        recordQuizScore,
        resetSimulatorPractice,
        resetAllProgress,
        getSimulatorProgress,
        isSimulatorMastered,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
