export type ScrewMaterialId =
  | 'grain'
  | 'cement'
  | 'limestone'
  | 'woodchips'
  | 'sand';

export type ScrewFaultMode =
  | 'normal'
  | 'hanger-wear'
  | 'flight-abrasion'
  | 'overfill-jam';

export type TroughFillPct = 15 | 30 | 45 | 95;

export type PitchMode = 'standard' | 'half' | 'short';

export interface ScrewMaterialPreset {
  id: ScrewMaterialId;
  nameEn: string;
  nameId: string;
  nameJa: string;
  bulkDensityKgM3: number;
  materialFactorFm: number;
  recommendedFillPct: TroughFillPct;
  color: string;
  grainColor: string;
}

export const SCREW_MATERIALS: Record<ScrewMaterialId, ScrewMaterialPreset> = {
  grain: {
    id: 'grain',
    nameEn: 'Wheat / Grain',
    nameId: 'Gandum / Biji-bijian',
    nameJa: '小麦・穀物',
    bulkDensityKgM3: 750,
    materialFactorFm: 0.6,
    recommendedFillPct: 45,
    color: '#d97706',
    grainColor: '#fbbf24',
  },
  cement: {
    id: 'cement',
    nameEn: 'Portland Cement',
    nameId: 'Semen Portland',
    nameJa: 'ポルトランドセメント',
    bulkDensityKgM3: 1440,
    materialFactorFm: 1.4,
    recommendedFillPct: 30,
    color: '#64748b',
    grainColor: '#94a3b8',
  },
  limestone: {
    id: 'limestone',
    nameEn: 'Crushed Limestone',
    nameId: 'Batu Kapur Hancur',
    nameJa: '砕石（石灰石）',
    bulkDensityKgM3: 1520,
    materialFactorFm: 1.8,
    recommendedFillPct: 15,
    color: '#78716c',
    grainColor: '#a8a29e',
  },
  woodchips: {
    id: 'woodchips',
    nameEn: 'Wood Chips / Biomass',
    nameId: 'Serpihan Kayu / Biomassa',
    nameJa: '木質チップ・バイオマス',
    bulkDensityKgM3: 380,
    materialFactorFm: 0.9,
    recommendedFillPct: 45,
    color: '#92400e',
    grainColor: '#d97706',
  },
  sand: {
    id: 'sand',
    nameEn: 'Dry Silica Sand',
    nameId: 'Pasir Silika Kering',
    nameJa: '乾燥珪砂',
    bulkDensityKgM3: 1600,
    materialFactorFm: 2.0,
    recommendedFillPct: 15,
    color: '#ca8a04',
    grainColor: '#eab308',
  },
};

export const PITCH_MODE_FACTORS: Record<PitchMode, number> = {
  standard: 1.0,
  half: 0.67,
  short: 0.5,
};

export interface ScrewConveyorInputs {
  screwDiameterMm: number;
  pipeDiameterMm: number;
  pitchMm: number;
  pitchMode: PitchMode;
  troughFillPct: TroughFillPct;
  rpm: number;
  inclinationDeg: number;
  lengthM: number;
  materialId: ScrewMaterialId;
  bulkDensityKgM3: number;
  materialFactorFm: number;
  hangerBearingFactorFb: number;
  radialClearanceMm: number;
  faultMode: ScrewFaultMode;
}

export type ScrewHealthStatus = 'optimal' | 'warning' | 'critical';

export interface ScrewConveyorMetrics {
  annulusAreaM2: number;
  effectiveFillPct: number;
  axialVelocityMs: number;
  axialSpeedMMin: number;
  inclinationFactor: number;
  volumetricCapacityM3h: number;
  massCapacityTh: number;
  bulkDensityTM3: number;
  emptyPowerKw: number;
  materialPowerKw: number;
  liftPowerKw: number;
  shaftPowerKw: number;
  drivePowerKw: number;
  motorCurrentA: number;
  driveTorqueNm: number;
  axialThrustKn: number;
  shaftDeflectionMm: number;
  hangerCount: number;
  hangerBearingTempC: number;
  gearboxTempC: number;
  troughSealTempC: number;
  effectiveClearanceMm: number;
  shearJamRiskPct: number;
  carrybackPct: number;
  motorLoadPct: number;
  residenceTimeS: number;
  healthStatus: ScrewHealthStatus;
}

/**
 * CEMA 350 inclination capacity derating factor K_theta.
 * Piecewise linear interpolation across standard CEMA checkpoints.
 */
export function getInclinationFactor(angleDeg: number): number {
  const clamped = Math.max(0, Math.min(45, angleDeg));
  const points: [number, number][] = [
    [0, 1.0],
    [10, 0.85],
    [15, 0.75],
    [20, 0.65],
    [25, 0.55],
    [30, 0.45],
    [45, 0.25],
  ];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (clamped >= x0 && clamped <= x1) {
      const t = (clamped - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return 0.25;
}

export function evaluateScrewConveyor(
  inputs: ScrewConveyorInputs
): ScrewConveyorMetrics {
  const dsM = Math.max(0.1, inputs.screwDiameterMm / 1000);
  const dpM = Math.min(dsM * 0.6, Math.max(0.03, inputs.pipeDiameterMm / 1000));
  const pitchM = Math.max(0.05, inputs.pitchMm / 1000);
  const rpm = Math.max(5, inputs.rpm);
  const lengthM = Math.max(1, inputs.lengthM);
  const angleRad =
    (Math.max(0, Math.min(45, inputs.inclinationDeg)) * Math.PI) / 180;
  const bulkDensityTM3 = inputs.bulkDensityKgM3 / 1000;

  // Cross-sectional area of helical flight annulus (m^2)
  const annulusAreaM2 = (Math.PI / 4) * (dsM * dsM - dpM * dpM);

  // Inclination derating
  const inclinationFactor = getInclinationFactor(inputs.inclinationDeg);

  // Clearance slip loss: nominal CEMA clearance is ~10-13 mm; excess clearance increases carryback
  const nominalClearanceMm = Math.max(4, inputs.radialClearanceMm);
  let effectiveClearanceMm = nominalClearanceMm;
  const clearancePenalty = Math.max(0, (nominalClearanceMm - 12) * 0.014);

  // Fault modifiers
  let faultEfficiency = Math.max(0.45, 1.0 - clearancePenalty);
  let bearingFactorFb = Math.max(0.8, inputs.hangerBearingFactorFb);
  let jamTorqueMult = 1.0;
  let effectiveFillPct: number = inputs.troughFillPct;
  let carrybackPct = Math.round(Math.max(0, (nominalClearanceMm - 12) * 1.6));

  if (inputs.troughFillPct === 95) {
    // 95% flooded/tubular loading induces churning resistance unless low speed
    faultEfficiency *= 0.84;
    jamTorqueMult *= 1.38;
  }

  if (inputs.faultMode === 'hanger-wear') {
    faultEfficiency *= 0.94;
    bearingFactorFb = Math.max(4.8, bearingFactorFb * 2.6);
    carrybackPct = Math.max(carrybackPct, 4);
  } else if (inputs.faultMode === 'flight-abrasion') {
    faultEfficiency *= 0.72;
    bearingFactorFb *= 1.12;
    effectiveClearanceMm = nominalClearanceMm + 14;
    carrybackPct = Math.min(55, carrybackPct + 28);
  } else if (inputs.faultMode === 'overfill-jam') {
    faultEfficiency *= 0.58;
    bearingFactorFb *= 1.55;
    jamTorqueMult = 2.65;
    effectiveFillPct = 95;
    carrybackPct = Math.min(60, carrybackPct + 35);
  }

  // Axial advance velocity of material plug (m/s and m/min)
  const axialVelocityMs =
    ((pitchM * rpm) / 60) * inclinationFactor * faultEfficiency;
  const axialSpeedMMin = axialVelocityMs * 60;

  // Volumetric capacity Q_v (m^3/h)
  const nominalFillFrac = inputs.troughFillPct / 100;
  const volumetricCapacityM3h =
    60 *
    annulusAreaM2 *
    pitchM *
    rpm *
    nominalFillFrac *
    inclinationFactor *
    faultEfficiency;

  // Mass capacity Q_m (metric tonnes/h)
  const massCapacityTh = volumetricCapacityM3h * bulkDensityTM3;

  // CEMA-style power breakdown (kW)
  const emptyPowerKw =
    0.00014 * lengthM * rpm * Math.pow(dsM / 0.3, 1.5) * bearingFactorFb;

  const materialPowerKw =
    ((massCapacityTh * lengthM * inputs.materialFactorFm * 9.81) / 3600) *
    (inputs.faultMode === 'overfill-jam' || inputs.troughFillPct === 95
      ? 1.85
      : 1.0);

  const verticalLiftM = lengthM * Math.sin(angleRad);
  const liftPowerKw = (massCapacityTh * verticalLiftM * 9.81) / 3600;

  const shaftPowerKw =
    (emptyPowerKw + materialPowerKw + liftPowerKw) * jamTorqueMult;

  const driveEfficiency = 0.88;
  const drivePowerKw = shaftPowerKw / driveEfficiency;

  // 3-phase 400V industrial motor current (A), eta_motor = 0.90, PF = 0.85
  const motorCurrentA =
    (drivePowerKw * 1000) / (Math.sqrt(3) * 400 * 0.85 * 0.9);

  // Drive torque on screw shaft: T = 9549.3 * P_kW / N_rpm
  const driveTorqueNm = (shaftPowerKw * 9549.3) / rpm;

  // Axial thrust load on thrust bearing (kN)
  const massFlowKgS = (massCapacityTh * 1000) / 3600;
  const axialFrictionKn =
    ((shaftPowerKw * 1000) / Math.max(0.08, axialVelocityMs)) * 0.00022;
  const liftThrustKn =
    (massFlowKgS * Math.max(1, lengthM) * 9.81 * Math.sin(angleRad)) / 1000;
  const axialThrustKn = Math.max(0.15, axialFrictionKn + liftThrustKn);

  // Intermediate hanger bearings (typical CEMA 3.2 m spacing)
  const hangerCount = Math.max(0, Math.floor((lengthM - 1.5) / 3.2));

  // Shaft deflection between supports (mm)
  // Schedule 40/80 steel pipe approximation: inner dia ~ 0.82 * dpM
  const spanM = lengthM / (hangerCount + 1);
  const innerPipeM = dpM * 0.82;
  const momentOfInertiaM4 =
    (Math.PI / 64) * (Math.pow(dpM, 4) - Math.pow(innerPipeM, 4));
  const steelModulusPa = 200e9;
  const pipeWeightPerM =
    7850 * (Math.PI / 4) * (dpM * dpM - innerPipeM * innerPipeM) * 9.81;
  const materialWeightPerM =
    annulusAreaM2 * (effectiveFillPct / 100) * inputs.bulkDensityKgM3 * 9.81 * 0.35;
  const distributedLoadNPerM = pipeWeightPerM + materialWeightPerM + 45;
  const shaftDeflectionM =
    (5 * distributedLoadNPerM * Math.pow(spanM, 4)) /
    (384 * steelModulusPa * Math.max(1e-9, momentOfInertiaM4));
  const shaftDeflectionMm = Math.min(25, shaftDeflectionM * 1000);

  // Thermal model for hanger bearings, gearbox, and trough seal (°C)
  let hangerBearingTempC =
    34 +
    0.14 * rpm +
    0.35 * inputs.inclinationDeg +
    (bearingFactorFb - 1.7) * 8;
  let gearboxTempC = 42 + drivePowerKw * 2.4 + (rpm / 120) * 6;
  let troughSealTempC =
    30 + inputs.materialFactorFm * 4.5 + (effectiveFillPct / 45) * 6;

  if (inputs.faultMode === 'hanger-wear') {
    hangerBearingTempC = 114 + 0.28 * rpm;
    gearboxTempC += 9;
  } else if (inputs.faultMode === 'overfill-jam') {
    hangerBearingTempC = 68 + 0.22 * rpm;
    gearboxTempC += 28;
    troughSealTempC += 18;
  } else if (inputs.faultMode === 'flight-abrasion') {
    hangerBearingTempC = 46 + 0.16 * rpm;
    troughSealTempC += 14;
  }

  // Motor load % against nominal geared motor sizing reference (scaled by diameter)
  const ratedMotorKw = Math.max(2.2, 11 * Math.pow(dsM / 0.3, 1.6));
  const motorLoadPct = (drivePowerKw / ratedMotorKw) * 100;

  // Shear / Jam Risk %
  let shearJamRiskPct =
    (effectiveFillPct / 95) * 32 +
    Math.min(45, motorLoadPct * 0.35) +
    (inputs.inclinationDeg / 45) * 12 +
    (inputs.materialFactorFm / 2.5) * 10;
  if (inputs.faultMode === 'overfill-jam') {
    shearJamRiskPct = Math.max(88, shearJamRiskPct + 35);
  } else if (inputs.faultMode === 'hanger-wear') {
    shearJamRiskPct += 18;
  } else if (inputs.faultMode === 'flight-abrasion') {
    shearJamRiskPct += 10;
  }
  shearJamRiskPct = Math.max(2, Math.min(99, shearJamRiskPct));

  // Residence time (s)
  const residenceTimeS = axialVelocityMs > 0.001 ? lengthM / axialVelocityMs : 999;

  // Overall health status
  let healthStatus: ScrewHealthStatus = 'optimal';
  if (
    inputs.faultMode === 'overfill-jam' ||
    inputs.faultMode === 'hanger-wear' ||
    motorLoadPct > 105 ||
    hangerBearingTempC > 95 ||
    shearJamRiskPct > 78
  ) {
    healthStatus = 'critical';
  } else if (
    inputs.faultMode === 'flight-abrasion' ||
    inputs.inclinationDeg > 25 ||
    inputs.troughFillPct === 95 ||
    motorLoadPct > 85 ||
    shaftDeflectionMm > 4.5 ||
    (inputs.troughFillPct === 45 && inputs.materialFactorFm >= 1.5)
  ) {
    healthStatus = 'warning';
  }

  return {
    annulusAreaM2,
    effectiveFillPct,
    axialVelocityMs,
    axialSpeedMMin,
    inclinationFactor,
    volumetricCapacityM3h,
    massCapacityTh,
    bulkDensityTM3,
    emptyPowerKw,
    materialPowerKw,
    liftPowerKw,
    shaftPowerKw,
    drivePowerKw,
    motorCurrentA,
    driveTorqueNm,
    axialThrustKn,
    shaftDeflectionMm,
    hangerCount,
    hangerBearingTempC,
    gearboxTempC,
    troughSealTempC,
    effectiveClearanceMm,
    shearJamRiskPct,
    carrybackPct,
    motorLoadPct,
    residenceTimeS,
    healthStatus,
  };
}
