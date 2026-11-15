export type SimulatorCategory =
  | 'Precision Measurement'
  | 'Machine Elements'
  | 'Rotating Equipment'
  | 'Fluid Power'
  | 'Diagnostic Instruments';

export type SimulatorDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type SimulatorMode = 'simulate' | 'explore' | 'practice' | 'quiz';

export type SimulatorAccentColor =
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'cyan'
  | 'orange';

export interface ExploreEquation {
  label: string;
  formula: string;
  note?: string;
}

export interface WorkedExample {
  title: string;
  given: string[];
  steps: string[];
  answer: string;
}

export interface ExploreSection {
  title: string;
  summary: string;
  equations: ExploreEquation[];
  workedExample?: WorkedExample;
}

export interface PracticeProblem {
  id: string;
  prompt: string;
  hint: string;
  targetValue: number;
  unit: string;
  tolerance: number;
  solutionSteps: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SimulatorMeta {
  id: string;
  title: string;
  shortTitle: string;
  category: SimulatorCategory;
  difficulty: SimulatorDifficulty;
  description: string;
  iconName: string;
  accentColor: SimulatorAccentColor;
  explore: ExploreSection[];
  practice: PracticeProblem[];
  quiz: QuizQuestion[];
}
