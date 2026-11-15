export interface ConveyorTrackingInputs {
  beltSpeedMs: number; // 0.8..3.5 m/s
  leftTakeUpMm: number; // 5..45 mm screw extension
  rightTakeUpMm: number; // 5..45 mm screw extension
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
  clearanceUsedPct: number; // % of ±25 mm safe clearance used
  isFrameRubbing: boolean;
  rubbingSide: 'left' | 'right' | 'none';
  leftEdgeTensionKn: number;
  rightEdgeTensionKn: number;
  totalBeltTensionKn: number;
  effectivePullKn: number;
  drivePowerKw: number;
  headPulleyRpm: number;
  trackingStatus: 'centered' | 'drifting' | 'rubbing';
}

const HEAD_PULLEY_DIAMETER_M = 0.32;
const DRIVE_EFFICIENCY = 0.88;

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
  const clearanceUsedPct = Math.min(
    168,
    Math.round((absWander / maxSafeClearanceMm) * 100)
  );
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
  const totalBeltTensionKn = leftEdgeTensionKn + rightEdgeTensionKn;

  // Belt drive pull & motor shaft power (including parasitic edge-rubbing drag if rubbing)
  const rubbingDragKn = isFrameRubbing ? 1.45 : 0;
  const effectivePullKn = 3.2 + avgTakeUpMm * 0.04 + rubbingDragKn;
  const drivePowerKw =
    (effectivePullKn * inputs.beltSpeedMs) / DRIVE_EFFICIENCY;
  const headPulleyRpm =
    (inputs.beltSpeedMs * 60) / (Math.PI * HEAD_PULLEY_DIAMETER_M);

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
    clearanceUsedPct,
    isFrameRubbing,
    rubbingSide,
    leftEdgeTensionKn,
    rightEdgeTensionKn,
    totalBeltTensionKn,
    effectivePullKn,
    drivePowerKw,
    headPulleyRpm,
    trackingStatus,
  };
}
