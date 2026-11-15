import { createContext, useContext } from 'react';
import type { SimulatorMeta } from '../types/simulator';

export interface SimulatorProgress {
  visited: boolean;
  solvedPracticeIds: string[];
  bestQuizScore: number | null;
  quizTotal: number;
  lastVisitedAt?: string;
}

export interface ProgressState {
  traineeName: string;
  simulators: Record<string, SimulatorProgress>;
}

export interface ProgressContextValue {
  progress: ProgressState;
  setTraineeName: (name: string) => void;
  markVisited: (simulatorId: string) => void;
  markPracticeSolved: (simulatorId: string, problemId: string) => void;
  recordQuizScore: (simulatorId: string, score: number, total: number) => void;
  resetSimulatorPractice: (simulatorId: string) => void;
  resetAllProgress: () => void;
  getSimulatorProgress: (simulatorId: string) => SimulatorProgress;
  isSimulatorMastered: (meta: SimulatorMeta) => boolean;
}

export const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined
);

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
}
