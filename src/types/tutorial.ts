export interface TutorialStep {
  id: string;
  badge: { en: string; id: string; ja: string };
  title: { en: string; id: string; ja: string };
  description: { en: string; id: string; ja: string };
  tip?: { en: string; id: string; ja: string };
  targetSelector?: string;
}

export interface SimulatorTutorial {
  simulatorId: string;
  steps: TutorialStep[];
}
