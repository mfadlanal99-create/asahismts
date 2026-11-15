import {
  degToRad,
  mToMm,
  mmToM,
  rimAndFaceAlignment,
} from '../../physics';
import type {
  AlignmentPreset,
  AlignmentSolution,
  CardinalReadings,
  MachineGeometry,
  MisalignmentState,
  MotorFoot,
  UserCorrections,
} from './alignmentTypes';

export const MOTOR_FEET: { id: MotorFoot; label: string }[] = [
  { id: 'FL', label: 'Front Left (FL)' },
  { id: 'FR', label: 'Front Right (FR)' },
  { id: 'RL', label: 'Rear Left (RL)' },
  { id: 'RR', label: 'Rear Right (RR)' },
];

export const ZERO_SOFT_FOOT_SHIMS: Record<MotorFoot, number> = {
  FL: 0,
  FR: 0,
  RL: 0,
  RR: 0,
};

export function getResidualSoftFootMm(
  foot: MotorFoot,
  misalignment: MisalignmentState,
  softFootShims: Record<MotorFoot, number>
): number {
  const rawGap =
    foot === misalignment.softFootTarget ? misalignment.softFootMm : 0;
  return Math.max(0, rawGap - softFootShims[foot]);
}

export const DEFAULT_GEOMETRY: MachineGeometry = {
  couplingDiameterMm: 150,
  frontFootDistMm: 200,
  rearFootDistMm: 550,
  barSagMm: 0.06,
  compensateSag: true,
  rpm: 1500,
  pumpThermalGrowthMm: 0,
  motorThermalGrowthMm: 0,
};

export const ZERO_CORRECTIONS: UserCorrections = {
  frontShimMm: 0,
  rearShimMm: 0,
  frontJackMm: 0,
  rearJackMm: 0,
};

export const ALIGNMENT_PRESETS: AlignmentPreset[] = [
  {
    id: 'parallel',
    name: 'Parallel Offset',
    description:
      'Motor sits 0.35 mm low and 0.20 mm right with zero angular tilt.',
    state: {
      initFrontVerticalMm: -0.35,
      initRearVerticalMm: -0.35,
      initFrontHorizontalMm: 0.2,
      initRearHorizontalMm: 0.2,
      softFootMm: 0,
      softFootTarget: 'FL',
    },
  },
  {
    id: 'angular',
    name: 'Angular Misalignment',
    description:
      'Coupling centers meet, but motor tilts upward toward the rear feet.',
    state: {
      initFrontVerticalMm: 0.2,
      initRearVerticalMm: 0.55,
      initFrontHorizontalMm: -0.1,
      initRearHorizontalMm: -0.275,
      softFootMm: 0,
      softFootTarget: 'FL',
    },
  },
  {
    id: 'combined',
    name: 'Combined + Soft Foot',
    description:
      'Realistic field case: vertical/horizontal offset, angularity, and 0.14 mm soft foot.',
    state: {
      initFrontVerticalMm: -0.25,
      initRearVerticalMm: -0.6,
      initFrontHorizontalMm: 0.15,
      initRearHorizontalMm: 0.4,
      softFootMm: 0.14,
      softFootTarget: 'FL',
    },
  },
  {
    id: 'aligned',
    name: 'Aligned (In Tolerance)',
    description: 'Precision-aligned motor-to-pump train within ISO/ANSI limits.',
    state: {
      initFrontVerticalMm: 0.01,
      initRearVerticalMm: 0.02,
      initFrontHorizontalMm: -0.01,
      initRearHorizontalMm: -0.02,
      softFootMm: 0.01,
      softFootTarget: 'FL',
    },
  },
];

/**
 * Standard industrial shaft alignment tolerances (ISO / ANSI S2.75 excellent/acceptable)
 * Returns max parallel offset (mm) and max angularity (mm per 100 mm).
 */
export function getToleranceLimits(rpm: MachineGeometry['rpm']): {
  maxOffsetMm: number;
  maxAngularityPer100: number;
  maxSoftFootMm: number;
} {
  switch (rpm) {
    case 1000:
      return { maxOffsetMm: 0.08, maxAngularityPer100: 0.08, maxSoftFootMm: 0.05 };
    case 1500:
      return { maxOffsetMm: 0.06, maxAngularityPer100: 0.06, maxSoftFootMm: 0.05 };
    case 1800:
      return { maxOffsetMm: 0.05, maxAngularityPer100: 0.05, maxSoftFootMm: 0.05 };
    case 3000:
      return { maxOffsetMm: 0.03, maxAngularityPer100: 0.03, maxSoftFootMm: 0.05 };
    case 3600:
      return { maxOffsetMm: 0.025, maxAngularityPer100: 0.025, maxSoftFootMm: 0.05 };
  }
}

/**
 * Computes Rim (raw & sag-compensated) and Face readings at a given shaft angle (degrees).
 * 0° = 12 o'clock (Top), 90° = 3 o'clock (Right), 180° = 6 o'clock (Bottom), 270° = 9 o'clock (Left).
 * Indicators are zeroed at 0° (Top).
 */
function evalIndicatorsAtAngle(
  angleDeg: number,
  yc: number,
  xc: number,
  thetaV: number,
  thetaH: number,
  couplingDiameterMm: number,
  barSagMm: number
): { rimRaw: number; rimComp: number; face: number } {
  const rad = degToRad(angleDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // True Rim reading (zeroed at Top): R(phi) = yc*(cos(phi) - 1) + xc*sin(phi)
  // Wait: at 180 deg, R(180) = -2*yc (Motor high -> negative Bottom reading)
  const rimComp = yc * (cos - 1) + xc * sin;

  // Bar sag pulls indicator bracket downward under gravity:
  // Zeroed at Top (0 deg), sag adds -0.5 * barSagMm * (1 - cos(phi)) to the reading
  // so at 180 deg (Bottom) it adds -barSagMm, and at 90/270 deg it adds -0.5*barSagMm.
  const sagEffect = -0.5 * barSagMm * (1 - cos);
  const rimRaw = rimComp + sagEffect;

  // Face reading at diameter D (zeroed at Top):
  // F(phi) = (D / 2) * (thetaV * (1 - cos(phi)) - thetaH * sin(phi))
  const face = (couplingDiameterMm / 2) * (thetaV * (1 - cos) - thetaH * sin);

  return { rimRaw, rimComp, face };
}

export function solveAlignment(
  geometry: MachineGeometry,
  misalignment: MisalignmentState,
  corrections: UserCorrections,
  shaftAngleDeg: number,
  softFootShims: Record<MotorFoot, number> = ZERO_SOFT_FOOT_SHIMS
): AlignmentSolution {
  const span = Math.max(50, geometry.rearFootDistMm - geometry.frontFootDistMm);
  const l1 = geometry.frontFootDistMm;
  const l2 = geometry.rearFootDistMm;

  const netFrontVerticalMm =
    misalignment.initFrontVerticalMm + corrections.frontShimMm;
  const netRearVerticalMm =
    misalignment.initRearVerticalMm + corrections.rearShimMm;
  const netFrontHorizontalMm =
    misalignment.initFrontHorizontalMm + corrections.frontJackMm;
  const netRearHorizontalMm =
    misalignment.initRearHorizontalMm + corrections.rearJackMm;

  // Slopes (rad)
  const thetaV = (netRearVerticalMm - netFrontVerticalMm) / span;
  const thetaH = (netRearHorizontalMm - netFrontHorizontalMm) / span;

  // Coupling center offsets (mm)
  const verticalOffsetMm = netFrontVerticalMm - thetaV * l1;
  const horizontalOffsetMm = netFrontHorizontalMm - thetaH * l1;

  const verticalAngularityPer100 = thetaV * 100;
  const horizontalAngularityPer100 = thetaH * 100;

  const evalAngle = (deg: number) =>
    evalIndicatorsAtAngle(
      deg,
      verticalOffsetMm,
      horizontalOffsetMm,
      thetaV,
      thetaH,
      geometry.couplingDiameterMm,
      geometry.barSagMm
    );

  const live = evalAngle(shaftAngleDeg);
  const top = evalAngle(0);
  const right = evalAngle(90);
  const bottom = evalAngle(180);
  const left = evalAngle(270);

  const rimRawCardinal: CardinalReadings = {
    top: top.rimRaw,
    right: right.rimRaw,
    bottom: bottom.rimRaw,
    left: left.rimRaw,
  };

  const rimCompCardinal: CardinalReadings = {
    top: top.rimComp,
    right: right.rimComp,
    bottom: bottom.rimComp,
    left: left.rimComp,
  };

  const faceCardinal: CardinalReadings = {
    top: top.face,
    right: right.face,
    bottom: bottom.face,
    left: left.face,
  };

  // Active rim readings (compensated if enabled, else raw)
  const activeRimCardinal = geometry.compensateSag
    ? rimCompCardinal
    : rimRawCardinal;
  const activeRimLive = geometry.compensateSag ? live.rimComp : live.rimRaw;

  // TIR over 360 degrees
  const rimTirMm = Math.hypot(
    activeRimCardinal.bottom - activeRimCardinal.top,
    activeRimCardinal.right - activeRimCardinal.left
  );
  const faceTirMm = Math.hypot(
    faceCardinal.bottom - faceCardinal.top,
    faceCardinal.right - faceCardinal.left
  );

  // Validity rule: (T + B) vs (L + R)
  const rimValidityErrorMm = Math.abs(
    activeRimCardinal.top +
      activeRimCardinal.bottom -
      (activeRimCardinal.left + activeRimCardinal.right)
  );
  const faceValidityErrorMm = Math.abs(
    faceCardinal.top +
      faceCardinal.bottom -
      (faceCardinal.left + faceCardinal.right)
  );

  // Recommended corrections derived from active (possibly uncompensated!) readings
  // via central Rim-and-Face physics geometry so students see any bar-sag error!
  const verticalAlignment = rimAndFaceAlignment(
    mmToM(faceCardinal.bottom - faceCardinal.top),
    mmToM(-(activeRimCardinal.bottom - activeRimCardinal.top)),
    mmToM(geometry.couplingDiameterMm),
    mmToM(l1),
    mmToM(l2 - l1)
  );
  const horizontalAlignment = rimAndFaceAlignment(
    mmToM(faceCardinal.left - faceCardinal.right),
    mmToM(activeRimCardinal.right - activeRimCardinal.left),
    mmToM(geometry.couplingDiameterMm),
    mmToM(l1),
    mmToM(l2 - l1)
  );

  // Thermal growth compensation (cold target vs hot running offset)
  const coldTargetOffsetMm =
    geometry.pumpThermalGrowthMm - geometry.motorThermalGrowthMm;
  const hotVerticalOffsetMm =
    verticalOffsetMm +
    (geometry.motorThermalGrowthMm - geometry.pumpThermalGrowthMm);

  const recFrontShimMm = -(
    mToMm(verticalAlignment.frontFootCorrectionM) - coldTargetOffsetMm
  );
  const recRearShimMm = -(
    mToMm(verticalAlignment.rearFootCorrectionM) - coldTargetOffsetMm
  );
  const recFrontJackMm = -mToMm(horizontalAlignment.frontFootCorrectionM);
  const recRearJackMm = -mToMm(horizontalAlignment.rearFootCorrectionM);

  const limits = getToleranceLimits(geometry.rpm);

  const totalOffset = Math.hypot(hotVerticalOffsetMm, horizontalOffsetMm);
  const totalAngularityPer100 = Math.hypot(
    verticalAngularityPer100,
    horizontalAngularityPer100
  );

  const offsetInTolerance = totalOffset <= limits.maxOffsetMm;
  const angularityInTolerance =
    totalAngularityPer100 <= limits.maxAngularityPer100;
  const maxResidualSoftFoot = Math.max(
    getResidualSoftFootMm('FL', misalignment, softFootShims),
    getResidualSoftFootMm('FR', misalignment, softFootShims),
    getResidualSoftFootMm('RL', misalignment, softFootShims),
    getResidualSoftFootMm('RR', misalignment, softFootShims)
  );
  const softFootOk = maxResidualSoftFoot <= limits.maxSoftFootMm;
  const isAligned = offsetInTolerance && angularityInTolerance && softFootOk;

  return {
    verticalOffsetMm,
    coldTargetOffsetMm,
    hotVerticalOffsetMm,
    horizontalOffsetMm,
    verticalAngularityPer100,
    horizontalAngularityPer100,
    netFrontVerticalMm,
    netRearVerticalMm,
    netFrontHorizontalMm,
    netRearHorizontalMm,
    recFrontShimMm,
    recRearShimMm,
    recFrontJackMm,
    recRearJackMm,
    rimRawMm: live.rimRaw,
    rimCompMm: activeRimLive,
    faceMm: live.face,
    rimRawCardinal,
    rimCompCardinal,
    faceCardinal,
    rimTirMm,
    faceTirMm,
    rimValidityErrorMm,
    faceValidityErrorMm,
    maxOffsetLimitMm: limits.maxOffsetMm,
    maxAngularityLimitPer100: limits.maxAngularityPer100,
    maxSoftFootLimitMm: limits.maxSoftFootMm,
    offsetInTolerance,
    angularityInTolerance,
    softFootOk,
    isAligned,
  };
}
