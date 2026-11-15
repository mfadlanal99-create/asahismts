import { G_ACCEL } from '../../physics';

export type BucketElevatorType = 'centrifugal' | 'continuous' | 'chain';

export type BucketElevatorFault =
  | 'normal'
  | 'belt-slip'
  | 'boot-choke'
  | 'missing-bucket'
  | 'misalignment';

export type DischargeRegime = 'centrifugal' | 'transitional' | 'gravity-backspill';

export interface BucketElevatorInputs {
  elevatorType: BucketElevatorType;
  headPulleyDiaMm: number; // 250..1000 mm
  headPulleyRpm: number; // 15..120 RPM
  liftHeightM: number; // 5..45 m
  bucketWidthMm: number; // 150..600 mm
  bucketProjectionMm: number; // 100..260 mm
  bucketVolumeL: number; // 1.5..18.0 L
  bucketSpacingMm: number; // 160..600 mm
  fillFactorPct: number; // 30..95 %
  bulkDensityTM3: number; // 0.40..2.20 t/m³
  takeUpTensionKn: number; // 2.0..25.0 kN
  fault: BucketElevatorFault;
}

export interface BucketElevatorMetrics {
  effectiveRpm: number;
  beltSpeedMs: number;
  angularVelocityRadS: number;
  effectiveRadiusM: number;
  poleDistanceM: number;
  poleDistanceMm: number;
  froudeNumber: number;
  criticalRpm: number;
  dischargeRegime: DischargeRegime;
  backspillPct: number;
  theoreticalCapacityM3h: number;
  actualCapacityM3h: number;
  massCapacityTph: number;
  effectiveLiftPowerKw: number;
  frictionPowerKw: number;
  motorPowerKw: number;
  motorCurrentA: number;
  headShaftTorqueNm: number;
  requiredBackstopTorqueNm: number;
  bucketsPerMeter: number;
  totalBuckets: number;
  trajectoryAngleDeg: number;
  minRequiredTensionKn: number;
  beltTrackingOffsetMm: number;
  headBearingTempC: number;
  bootBearingTempC: number;
  backstopTempC: number;
  chuteThrowVelocityMs: number;
  healthStatus: 'optimal' | 'warning' | 'critical';
}

export interface MaterialPreset {
  id: string;
  labelEn: string;
  labelId: string;
  labelJa: string;
  densityTM3: number;
  fillFactorPct: number;
  color: string;
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'grain',
    labelEn: 'Wheat / Corn',
    labelId: 'Gandum / Jagung',
    labelJa: '小麦・トウモロコシ',
    densityTM3: 0.75,
    fillFactorPct: 80,
    color: '#eab308',
  },
  {
    id: 'cement',
    labelEn: 'Portland Cement',
    labelId: 'Semen Portland',
    labelJa: 'ポルトランドセメント',
    densityTM3: 1.3,
    fillFactorPct: 68,
    color: '#94a3b8',
  },
  {
    id: 'limestone',
    labelEn: 'Crushed Limestone',
    labelId: 'Batu Kapur Pecah',
    labelJa: '砕石（石灰石）',
    densityTM3: 1.55,
    fillFactorPct: 72,
    color: '#cbd5e1',
  },
  {
    id: 'sand',
    labelEn: 'Dry Silica Sand',
    labelId: 'Pasir Silika Kering',
    labelJa: '乾燥珪砂',
    densityTM3: 1.65,
    fillFactorPct: 75,
    color: '#d97706',
  },
];

export function evaluateBucketElevator(
  inputs: BucketElevatorInputs
): BucketElevatorMetrics {
  const pulleyDiaM = inputs.headPulleyDiaMm / 1000;
  const pulleyRadiusM = pulleyDiaM / 2;

  // Bucket centroid lies at ~48% of bucket projection outside the pulley/belt surface
  const bucketProjectionM = (inputs.bucketProjectionMm / 1000) * 0.48;
  const effectiveRadiusM = pulleyRadiusM + bucketProjectionM;

  // Minimum take-up tension required to prevent drive slip scales with lift height and load
  const minRequiredTensionKn = Math.max(
    3.0,
    2.2 + inputs.liftHeightM * 0.16 + inputs.bulkDensityTM3 * 1.4
  );
  const lowTensionSlipFactor =
    inputs.takeUpTensionKn < minRequiredTensionKn
      ? Math.max(0.72, 1 - (minRequiredTensionKn - inputs.takeUpTensionKn) * 0.045)
      : 1.0;

  // Apply fault effects to effective operating parameters
  const faultRpmMultiplier = inputs.fault === 'belt-slip' ? 0.62 : 1.0;
  const effectiveRpm = inputs.headPulleyRpm * faultRpmMultiplier * lowTensionSlipFactor;

  const angularVelocityRadS = (2 * Math.PI * effectiveRpm) / 60;
  const beltSpeedMs = Math.PI * pulleyDiaM * (effectiveRpm / 60);

  // Pole distance h_p = g / omega^2 [m] and [mm]
  const poleDistanceM =
    angularVelocityRadS > 0.01
      ? G_ACCEL / (angularVelocityRadS * angularVelocityRadS)
      : 99.9;
  const poleDistanceMm = poleDistanceM * 1000;

  // Froude number Fr = omega^2 * R_eff / g = R_eff / h_p
  const froudeNumber =
    (angularVelocityRadS * angularVelocityRadS * effectiveRadiusM) / G_ACCEL;

  // Critical RPM where Fr = 1.0 (pole distance == effective radius)
  const criticalOmega = Math.sqrt(G_ACCEL / effectiveRadiusM);
  const criticalRpm = (criticalOmega * 60) / (2 * Math.PI);

  // Discharge regime classification
  let dischargeRegime: DischargeRegime = 'centrifugal';
  let backspillPct = 0;

  if (inputs.elevatorType === 'continuous') {
    // Continuous gravity discharge works best at moderate Fr (0.35..0.95)
    if (froudeNumber >= 0.42 && froudeNumber <= 1.05) {
      dischargeRegime = 'centrifugal';
      backspillPct = 0;
    } else if (froudeNumber > 1.05) {
      dischargeRegime = 'transitional';
      backspillPct = Math.min(28, Math.round((froudeNumber - 1.05) * 18));
    } else if (froudeNumber >= 0.28) {
      dischargeRegime = 'transitional';
      backspillPct = Math.round(((0.42 - froudeNumber) / 0.14) * 24);
    } else {
      dischargeRegime = 'gravity-backspill';
      backspillPct = Math.min(68, Math.round(24 + ((0.28 - froudeNumber) / 0.28) * 44));
    }
  } else {
    if (froudeNumber >= 1.0) {
      dischargeRegime = 'centrifugal';
      backspillPct = 0;
    } else if (froudeNumber >= 0.72) {
      dischargeRegime = 'transitional';
      backspillPct = Math.round(((1.0 - froudeNumber) / 0.28) * 32);
    } else {
      dischargeRegime = 'gravity-backspill';
      backspillPct = Math.min(
        78,
        Math.round(32 + ((0.72 - froudeNumber) / 0.72) * 46)
      );
    }
  }

  // Discharge release angle from top dead center (degrees)
  const trajectoryAngleDeg =
    froudeNumber >= 1.0
      ? Math.min(48, 12 + (froudeNumber - 1.0) * 18)
      : -Math.min(55, (1.0 - froudeNumber) * 65);

  // Volumetric and mass capacities
  const bucketsPerMeter = 1000 / inputs.bucketSpacingMm;
  const totalBuckets = Math.round(
    (2 * inputs.liftHeightM + Math.PI * pulleyDiaM) * bucketsPerMeter
  );

  const effectiveFillRatio =
    inputs.fault === 'boot-choke'
      ? Math.min(1.05, (inputs.fillFactorPct / 100) * 1.28)
      : inputs.fillFactorPct / 100;

  const missingBucketFactor = inputs.fault === 'missing-bucket' ? 0.84 : 1.0;

  // Q_v [m^3/h] = 3600 * (V_L / S_mm) * fill * v
  const theoreticalCapacityM3h =
    3600 *
    (inputs.bucketVolumeL / inputs.bucketSpacingMm) *
    effectiveFillRatio *
    beltSpeedMs;

  const actualCapacityM3h =
    theoreticalCapacityM3h * (1 - backspillPct / 100) * missingBucketFactor;

  const massCapacityTph = actualCapacityM3h * inputs.bulkDensityTM3;

  // Effective lift power P_lift = (Q_m * g * H) / 3600 [kW]
  const effectiveLiftPowerKw =
    (massCapacityTph * G_ACCEL * inputs.liftHeightM) / 3600;

  // Friction, boot digging resistance & drive efficiency
  const driveEfficiency =
    inputs.elevatorType === 'centrifugal'
      ? 0.9
      : inputs.elevatorType === 'continuous'
        ? 0.88
        : 0.84;

  const chainFrictionAdd = inputs.elevatorType === 'chain' ? 0.14 : 0;
  const idleLossKw =
    0.28 + (0.018 + chainFrictionAdd * 0.02) * inputs.liftHeightM;
  const diggingFactor = inputs.fault === 'boot-choke' ? 2.15 : 1.18 + chainFrictionAdd;
  const chokeDragKw =
    inputs.fault === 'boot-choke' ? 2.8 + 0.08 * inputs.liftHeightM : 0;
  const misalignmentDragKw =
    inputs.fault === 'misalignment' ? 0.65 + 0.03 * inputs.liftHeightM : 0;

  const shaftPowerKw =
    effectiveLiftPowerKw * diggingFactor +
    idleLossKw +
    chokeDragKw +
    misalignmentDragKw;

  const frictionPowerKw = Math.max(0, shaftPowerKw - effectiveLiftPowerKw);
  const motorPowerKw = shaftPowerKw / driveEfficiency;

  // 3-phase 400V industrial motor current (eta_motor = 0.92, cos(phi) = 0.85)
  const motorCurrentA =
    (motorPowerKw * 1000) / (Math.sqrt(3) * 400 * 0.85 * 0.92);

  const headShaftTorqueNm =
    angularVelocityRadS > 0.05 ? (shaftPowerKw * 1000) / angularVelocityRadS : 0;

  // Required Backstop Torque to hold loaded ascending leg on power loss (1.25x safety factor)
  const ascendingLoadKg =
    beltSpeedMs > 0.05
      ? ((massCapacityTph * 1000) / 3600) * (inputs.liftHeightM / beltSpeedMs)
      : 0;
  const requiredBackstopTorqueNm =
    ascendingLoadKg * G_ACCEL * pulleyRadiusM * 1.25;

  // Local probe telemetry
  const beltTrackingOffsetMm =
    inputs.fault === 'misalignment'
      ? 18.5
      : inputs.takeUpTensionKn < minRequiredTensionKn
        ? 6.8 + (minRequiredTensionKn - inputs.takeUpTensionKn) * 1.4
        : 1.2;

  const headBearingTempC =
    42 +
    motorPowerKw * 1.4 +
    (inputs.fault === 'misalignment' ? 16 : 0) +
    (inputs.fault === 'belt-slip' ? 9 : 0);

  const bootBearingTempC =
    38 +
    inputs.takeUpTensionKn * 0.65 +
    (inputs.fault === 'boot-choke' ? 24 : 0) +
    (inputs.fault === 'misalignment' ? 11 : 0);

  const backstopTempC =
    36 +
    (requiredBackstopTorqueNm / 1000) * 3.2 +
    (inputs.fault === 'boot-choke' ? 8 : 0);

  const chuteThrowVelocityMs = Math.sqrt(
    beltSpeedMs * beltSpeedMs + 2 * G_ACCEL * Math.max(0, effectiveRadiusM - poleDistanceM * 0.25)
  );

  let healthStatus: 'optimal' | 'warning' | 'critical' = 'optimal';
  if (
    inputs.fault === 'boot-choke' ||
    dischargeRegime === 'gravity-backspill' ||
    inputs.fault === 'belt-slip'
  ) {
    healthStatus = 'critical';
  } else if (
    inputs.fault === 'missing-bucket' ||
    inputs.fault === 'misalignment' ||
    dischargeRegime === 'transitional' ||
    inputs.takeUpTensionKn < minRequiredTensionKn ||
    froudeNumber > 2.6
  ) {
    healthStatus = 'warning';
  }

  return {
    effectiveRpm,
    beltSpeedMs,
    angularVelocityRadS,
    effectiveRadiusM,
    poleDistanceM,
    poleDistanceMm,
    froudeNumber,
    criticalRpm,
    dischargeRegime,
    backspillPct,
    theoreticalCapacityM3h,
    actualCapacityM3h,
    massCapacityTph,
    effectiveLiftPowerKw,
    frictionPowerKw,
    motorPowerKw,
    motorCurrentA,
    headShaftTorqueNm,
    requiredBackstopTorqueNm,
    bucketsPerMeter,
    totalBuckets,
    trajectoryAngleDeg,
    minRequiredTensionKn,
    beltTrackingOffsetMm,
    headBearingTempC,
    bootBearingTempC,
    backstopTempC,
    chuteThrowVelocityMs,
    healthStatus,
  };
}
