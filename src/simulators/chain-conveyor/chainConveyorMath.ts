import { chainChordalSpeedVariation, mmToM } from '../../physics';

export type AnsiChainNumber =
  | '#40'
  | '#50'
  | '#60'
  | '#80'
  | '#100'
  | '#120'
  | '#140'
  | '#160';

export type ChainLubeMethod = 'Dry' | 'Manual Drip' | 'Oil Bath';

export interface AnsiChainSpec {
  code: AnsiChainNumber;
  rsLabel: string;
  isoCode: string;
  pitchMm: number;
  pitchInchFraction: string;
  rollerDiaMm: number;
  insideWidthMm: number;
  avgTensileStrengthKn: number;
}

export const ANSI_CHAIN_SPECS: Record<AnsiChainNumber, AnsiChainSpec> = {
  '#40': {
    code: '#40',
    rsLabel: 'RS 40',
    isoCode: '08A-1',
    pitchMm: 12.7,
    pitchInchFraction: '1/2"',
    rollerDiaMm: 7.95,
    insideWidthMm: 7.85,
    avgTensileStrengthKn: 17.5,
  },
  '#50': {
    code: '#50',
    rsLabel: 'RS 50',
    isoCode: '10A-1',
    pitchMm: 15.875,
    pitchInchFraction: '5/8"',
    rollerDiaMm: 10.16,
    insideWidthMm: 9.4,
    avgTensileStrengthKn: 27.3,
  },
  '#60': {
    code: '#60',
    rsLabel: 'RS 60',
    isoCode: '12A-1',
    pitchMm: 19.05,
    pitchInchFraction: '3/4"',
    rollerDiaMm: 11.91,
    insideWidthMm: 12.57,
    avgTensileStrengthKn: 37.9,
  },
  '#80': {
    code: '#80',
    rsLabel: 'RS 80',
    isoCode: '16A-1',
    pitchMm: 25.4,
    pitchInchFraction: '1"',
    rollerDiaMm: 15.88,
    insideWidthMm: 15.75,
    avgTensileStrengthKn: 64.5,
  },
  '#100': {
    code: '#100',
    rsLabel: 'RS 100',
    isoCode: '20A-1',
    pitchMm: 31.75,
    pitchInchFraction: '1-1/4"',
    rollerDiaMm: 19.05,
    insideWidthMm: 18.9,
    avgTensileStrengthKn: 106.8,
  },
  '#120': {
    code: '#120',
    rsLabel: 'RS 120',
    isoCode: '24A-1',
    pitchMm: 38.1,
    pitchInchFraction: '1-1/2"',
    rollerDiaMm: 22.23,
    insideWidthMm: 25.22,
    avgTensileStrengthKn: 151.0,
  },
  '#140': {
    code: '#140',
    rsLabel: 'RS 140',
    isoCode: '28A-1',
    pitchMm: 44.45,
    pitchInchFraction: '1-3/4"',
    rollerDiaMm: 25.4,
    insideWidthMm: 25.22,
    avgTensileStrengthKn: 204.0,
  },
  '#160': {
    code: '#160',
    rsLabel: 'RS 160',
    isoCode: '32A-1',
    pitchMm: 50.8,
    pitchInchFraction: '2"',
    rollerDiaMm: 28.58,
    insideWidthMm: 31.55,
    avgTensileStrengthKn: 267.0,
  },
};

export interface ChainDriveInputs {
  chainCode: AnsiChainNumber;
  z1: number; // Driver sprocket teeth (11..35)
  z2: number; // Driven sprocket teeth (19..76)
  driverRpm: number; // Driver speed RPM
  centerDistanceMm: number; // Shaft center distance C (mm)
  wearElongationPct: number; // Pin-bushing wear % (0..4.0%)
  slackSagPct: number; // Slack span sag % of C (0.2..5.5%)
  lubeMethod: ChainLubeMethod;
}

export interface ChainDriveMetrics {
  spec: AnsiChainSpec;
  speedRatio: number;
  drivenRpm: number;
  pitchDia1Mm: number;
  pitchDia2Mm: number;
  linearSpeedMs: number;
  chordalSpeedVarPct: number;
  nominal10PitchMm: number;
  measured10PitchMm: number;
  limit15PctMm: number;
  limit30PctMm: number;
  wearStatus: 'good' | 'hardened-limit' | 'replace-now';
  hookWearSeverityPct: number;
  slackSagMm: number;
  targetSagMinMm: number;
  targetSagMaxMm: number;
  targetSagIdealMm: number;
  sagStatus: 'tight' | 'optimal' | 'loose';
  recommendedLube: ChainLubeMethod;
  lubeAdequate: boolean;
  overallHealth: 'optimal' | 'warning' | 'critical';
}

export function evaluateChainDrive(inputs: ChainDriveInputs): ChainDriveMetrics {
  const spec = ANSI_CHAIN_SPECS[inputs.chainCode];
  const p = spec.pitchMm;

  const speedRatio = inputs.z2 / inputs.z1;
  const drivenRpm = inputs.driverRpm / speedRatio;

  const pitchDia1Mm = p / Math.sin(Math.PI / inputs.z1);
  const pitchDia2Mm = p / Math.sin(Math.PI / inputs.z2);

  const linearSpeedMs = mmToM(inputs.z1 * p) * (inputs.driverRpm / 60);
  const chordalSpeedVarPct = chainChordalSpeedVariation(inputs.z1) * 100;

  const nominal10PitchMm = 10 * p;
  const measured10PitchMm =
    nominal10PitchMm * (1 + inputs.wearElongationPct / 100);
  const limit15PctMm = nominal10PitchMm * 1.015;
  const limit30PctMm = nominal10PitchMm * 1.03;

  const effectiveLimitPct = inputs.z2 > 60 ? 1.5 : 3.0;
  let wearStatus: 'good' | 'hardened-limit' | 'replace-now' = 'good';
  if (
    inputs.wearElongationPct >= 3.0 ||
    inputs.wearElongationPct >= effectiveLimitPct
  ) {
    wearStatus = 'replace-now';
  } else if (inputs.wearElongationPct >= 1.5) {
    wearStatus = 'hardened-limit';
  }

  // Sprocket tooth hook wear accelerates once wear elongation exceeds 1.2% or lube is dry
  const lubeWearPenalty =
    inputs.lubeMethod === 'Dry'
      ? 28
      : inputs.lubeMethod === 'Manual Drip' && linearSpeedMs > 2.2
        ? 14
        : 0;
  const hookWearSeverityPct = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        Math.pow(inputs.wearElongationPct / 3.0, 1.45) * 78 + lubeWearPenalty
      )
    )
  );

  const slackSagMm = (inputs.slackSagPct / 100) * inputs.centerDistanceMm;
  const targetSagMinMm = 0.01 * inputs.centerDistanceMm;
  const targetSagMaxMm = 0.03 * inputs.centerDistanceMm;
  const targetSagIdealMm = 0.02 * inputs.centerDistanceMm;

  let sagStatus: 'tight' | 'optimal' | 'loose' = 'optimal';
  if (inputs.slackSagPct < 1.0) {
    sagStatus = 'tight';
  } else if (inputs.slackSagPct > 3.2) {
    sagStatus = 'loose';
  }

  const recommendedLube: ChainLubeMethod =
    linearSpeedMs > 2.2 ? 'Oil Bath' : 'Manual Drip';

  const lubeAdequate =
    inputs.lubeMethod === 'Oil Bath' ||
    (inputs.lubeMethod === 'Manual Drip' && linearSpeedMs <= 2.2);

  let overallHealth: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (
    wearStatus === 'replace-now' ||
    inputs.lubeMethod === 'Dry' ||
    inputs.slackSagPct > 4.2 ||
    inputs.slackSagPct < 0.5
  ) {
    overallHealth = 'critical';
  } else if (
    wearStatus === 'hardened-limit' ||
    sagStatus !== 'optimal' ||
    !lubeAdequate ||
    inputs.z1 < 15
  ) {
    overallHealth = 'warning';
  }

  return {
    spec,
    speedRatio,
    drivenRpm,
    pitchDia1Mm,
    pitchDia2Mm,
    linearSpeedMs,
    chordalSpeedVarPct,
    nominal10PitchMm,
    measured10PitchMm,
    limit15PctMm,
    limit30PctMm,
    wearStatus,
    hookWearSeverityPct,
    slackSagMm,
    targetSagMinMm,
    targetSagMaxMm,
    targetSagIdealMm,
    sagStatus,
    recommendedLube,
    lubeAdequate,
    overallHealth,
  };
}

export interface ConveyorTrackingInputs {
  beltSpeedMs: number; // 0.8..3.5 m/s
  leftTakeUpMm: number; // 0..50 mm screw extension
  rightTakeUpMm: number; // 0..50 mm screw extension
  trainingIdlerSkewDeg: number; // -4.0..+4.0 deg (+ = right end advanced forward)
  chuteOffsetMm: number; // -60..+60 mm (+ = off-center to right, - = left)
  headPulleyMisalignDeg: number; // -1.5..+1.5 deg intrinsic frame/pulley skew fault
}

export interface ConveyorTrackingMetrics {
  takeUpDiffMm: number; // leftTakeUpMm - rightTakeUpMm
  avgTakeUpMm: number;
  tailSkewDeg: number;
  takeUpWanderContributionMm: number;
  idlerWanderContributionMm: number;
  chuteWanderContributionMm: number;
  headFaultContributionMm: number;
  lateralWanderMm: number; // + = right side of frame, - = left side of frame
  maxSafeClearanceMm: number; // ±25 mm
  cautionThresholdMm: number; // ±12 mm
  isFrameRubbing: boolean;
  rubbingSide: 'left' | 'right' | 'none';
  leftEdgeTensionKn: number;
  rightEdgeTensionKn: number;
  trackingStatus: 'centered' | 'drifting' | 'rubbing';
}

export function evaluateConveyorTracking(
  inputs: ConveyorTrackingInputs
): ConveyorTrackingMetrics {
  const maxSafeClearanceMm = 25;
  const cautionThresholdMm = 12;

  // Positive lateralWanderMm = belt drifts toward RIGHT side (+Y in top view, when belt travels Left -> Right)
  // 1. Tail Take-Up Screw Differential:
  // Extending Left take-up more than Right (leftTakeUpMm > rightTakeUpMm) pushes left tail bearing further back,
  // tilting the tail pulley so the belt tracks toward the RIGHT (lower-tension / first-contact) side.
  // Specifically: +1 mm of (left - right) screw differential causes +1.8 mm of rightward belt wander.
  const takeUpDiffMm = inputs.leftTakeUpMm - inputs.rightTakeUpMm;
  const avgTakeUpMm = (inputs.leftTakeUpMm + inputs.rightTakeUpMm) / 2;
  const tailSkewDeg = takeUpDiffMm * 0.12;
  const takeUpWanderContributionMm = takeUpDiffMm * 1.8;

  // 2. Training Idler Skew Angle ("First Contact Rule"):
  // Positive trainingIdlerSkewDeg (+deg) advances the LEFT end forward / tilts idler to steer belt RIGHT (+5.5 mm per deg)
  const idlerWanderContributionMm = inputs.trainingIdlerSkewDeg * 5.5;

  // 3. Off-Center Chute Loading Reaction:
  // Material dropped off-center to the RIGHT (+chuteOffsetMm) loads the right inclined troughing roll heavily,
  // pushing the belt toward the opposite LEFT side (-0.45 mm belt shift per +1 mm chute offset).
  const chuteWanderContributionMm = -inputs.chuteOffsetMm * 0.45;

  // 4. Intrinsic Head/Frame Misalignment Fault:
  const headFaultContributionMm = inputs.headPulleyMisalignDeg * 14.0;

  const rawWander =
    takeUpWanderContributionMm +
    idlerWanderContributionMm +
    chuteWanderContributionMm +
    headFaultContributionMm;

  const lateralWanderMm = Math.max(-42, Math.min(42, rawWander));

  const absWander = Math.abs(lateralWanderMm);
  const isFrameRubbing = absWander >= maxSafeClearanceMm;
  const rubbingSide: 'left' | 'right' | 'none' = !isFrameRubbing
    ? 'none'
    : lateralWanderMm > 0
      ? 'right'
      : 'left';

  const baseTensionKn = 6.0 + avgTakeUpMm * 0.22;
  const leftEdgeTensionKn = Math.max(
    1.2,
    baseTensionKn + takeUpDiffMm * 0.18
  );
  const rightEdgeTensionKn = Math.max(
    1.2,
    baseTensionKn - takeUpDiffMm * 0.18
  );

  const trackingStatus: 'centered' | 'drifting' | 'rubbing' = isFrameRubbing
    ? 'rubbing'
    : absWander >= cautionThresholdMm
      ? 'drifting'
      : 'centered';

  return {
    takeUpDiffMm,
    avgTakeUpMm,
    tailSkewDeg,
    takeUpWanderContributionMm,
    idlerWanderContributionMm,
    chuteWanderContributionMm,
    headFaultContributionMm,
    lateralWanderMm,
    maxSafeClearanceMm,
    cautionThresholdMm,
    isFrameRubbing,
    rubbingSide,
    leftEdgeTensionKn,
    rightEdgeTensionKn,
    trackingStatus,
  };
}
