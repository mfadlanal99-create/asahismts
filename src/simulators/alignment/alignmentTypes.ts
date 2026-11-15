export type MotorFoot = 'FL' | 'FR' | 'RL' | 'RR';

export type MeasurementView = 'dial' | 'laser';

export interface MachineGeometry {
  /** Coupling diameter D (mm) where face indicator sweeps */
  couplingDiameterMm: number;
  /** Distance from coupling center to motor front (inboard) feet L1 (mm) */
  frontFootDistMm: number;
  /** Distance from coupling center to motor rear (outboard) feet L2 (mm) */
  rearFootDistMm: number;
  /** Indicator bracket sag TIR at 6 o'clock (mm, >= 0) */
  barSagMm: number;
  /** Whether bar sag compensation is applied to calculations */
  compensateSag: boolean;
  /** Operating speed (RPM) for ISO/ANSI tolerance lookup */
  rpm: 1000 | 1500 | 1800 | 3000 | 3600;
  /** Cold-to-hot vertical thermal growth of Pump (mm) */
  pumpThermalGrowthMm: number;
  /** Cold-to-hot vertical thermal growth of Motor (mm) */
  motorThermalGrowthMm: number;
}

export interface MisalignmentState {
  /** Initial vertical offset at front foot before user shimming (mm) */
  initFrontVerticalMm: number;
  /** Initial vertical offset at rear foot before user shimming (mm) */
  initRearVerticalMm: number;
  /** Initial horizontal offset at front foot before user jacking (mm) */
  initFrontHorizontalMm: number;
  /** Initial horizontal offset at rear foot before user jacking (mm) */
  initRearHorizontalMm: number;
  /** Soft foot gap under target motor foot (mm, >= 0) */
  softFootMm: number;
  /** Which motor foot has the injected soft-foot gap */
  softFootTarget: MotorFoot;
}

export interface UserCorrections {
  /** User shim adjustment at motor front feet (mm) */
  frontShimMm: number;
  /** User shim adjustment at motor rear feet (mm) */
  rearShimMm: number;
  /** User horizontal jacking move at motor front feet (mm) */
  frontJackMm: number;
  /** User horizontal jacking move at motor rear feet (mm) */
  rearJackMm: number;
}

export interface AlignmentPreset {
  id: string;
  name: string;
  description: string;
  state: MisalignmentState;
}

export interface CardinalReadings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface AlignmentSolution {
  /** Net cold vertical position at coupling center (mm) */
  verticalOffsetMm: number;
  /** Target cold vertical offset to achieve zero hot offset (mm) */
  coldTargetOffsetMm: number;
  /** Hot running vertical offset after thermal growth (mm) */
  hotVerticalOffsetMm: number;
  /** Net horizontal position at coupling center (mm) */
  horizontalOffsetMm: number;
  /** Vertical angularity (mm per 100 mm) */
  verticalAngularityPer100: number;
  /** Horizontal angularity (mm per 100 mm) */
  horizontalAngularityPer100: number;
  /** Net vertical foot positions (mm) */
  netFrontVerticalMm: number;
  netRearVerticalMm: number;
  /** Net horizontal foot positions (mm) */
  netFrontHorizontalMm: number;
  netRearHorizontalMm: number;
  /** Recommended corrections to reach zero */
  recFrontShimMm: number;
  recRearShimMm: number;
  recFrontJackMm: number;
  recRearJackMm: number;
  /** Live dial readings at current shaft angle (mm) */
  rimRawMm: number;
  rimCompMm: number;
  faceMm: number;
  /** Cardinal readings (T, R, B, L) */
  rimRawCardinal: CardinalReadings;
  rimCompCardinal: CardinalReadings;
  faceCardinal: CardinalReadings;
  /** Total Indicator Runout (max - min across 360 deg) */
  rimTirMm: number;
  faceTirMm: number;
  /** Validity rule check: |(T + B) - (L + R)| */
  rimValidityErrorMm: number;
  faceValidityErrorMm: number;
  /** Tolerance limits for selected RPM */
  maxOffsetLimitMm: number;
  maxAngularityLimitPer100: number;
  maxSoftFootLimitMm: number;
  /** Pass/fail flags */
  offsetInTolerance: boolean;
  angularityInTolerance: boolean;
  softFootOk: boolean;
  isAligned: boolean;
}
