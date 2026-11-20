import type { TutorialStep } from '../../types/tutorial';
import { TUTORIALS_PART_1 } from './tutorialsPart1';
import { TUTORIALS_PART_2 } from './tutorialsPart2';
import { TUTORIALS_PART_3 } from './tutorialsPart3';
import { TUTORIALS_PART_4 } from './tutorialsPart4';

export const TUTORIAL_AUTO_DISABLED_KEY = 'smts-tutorial-auto-disabled';

export function getTutorialSeenKey(simulatorId: string): string {
  return `smts-tutorial-seen-${simulatorId}`;
}

export function shouldAutoOpenTutorial(simulatorId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem(TUTORIAL_AUTO_DISABLED_KEY) === 'true') {
      return false;
    }
    return window.localStorage.getItem(getTutorialSeenKey(simulatorId)) === null;
  } catch {
    return false;
  }
}

export const SIMULATOR_TUTORIALS: Record<string, TutorialStep[]> = {
  ...TUTORIALS_PART_1,
  ...TUTORIALS_PART_2,
  ...TUTORIALS_PART_3,
  ...TUTORIALS_PART_4,
};

export function getSimulatorTutorial(simulatorId: string): TutorialStep[] {
  return SIMULATOR_TUTORIALS[simulatorId] ?? [];
}
