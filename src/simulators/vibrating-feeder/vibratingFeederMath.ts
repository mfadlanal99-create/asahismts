export type VibratingFeederFault =
  | 'normal'
  | 'broken-spring'
  | 'hopper-bridging'
  | 'phase-slip';

export type ThrowRegime = 'sub-threshold' | 'micro-throw' | 'aggressive-bounce';

export type FeederHealthStatus = 'optimal' | 'warning' | 'critical';

export interface VibratingFeederInputs {
  driveFrequencyHz: number; // 8 - 55 Hz
  strokeMm: number; // Peak-to-peak stroke 2A (1.5 - 14.0 mm)
  throwAngleDeg: number; // Vibration attack angle relative to trough deck (10 - 40 deg)
  troughInclinationDeg: number; // Downward declination slope alpha (0 - 15 deg)
  gateOpeningMm: number; // Hopper discharge gate opening (40 - 300 mm)
  troughWidthMm: number; // Trough width (300 - 1600 mm)
  troughLengthM: number; // Trough length (1.5 - 6.0 m)
  bulkDensityTM3: number; // Material bulk density (0.4 - 3.2 t/m3)
  moistureFrictionFactor: number; // Moisture / friction factor (0.60 - 1.30, 1.0 = nominal dry)
  springStiffnessNmm: number; // Total isolation spring stiffness k (300 - 1800 N/mm)
  faultMode: VibratingFeederFault;
}

export interface VibratingFeederMetrics {
  driveRpm: number;
  singleAmplitudeMm: number;
  omegaRadS: number;
  peakAccelMs2: number;
  peakGForce: number;
  normalGForce: number;
  throwOffThresholdG: number;
  effectiveStrokeMm: number;
  throwIndexKv: number;
  regime: ThrowRegime;
  conveyingVelocityMMin: number;
  conveyingVelocityMs: number;
  effectiveGateMm: number;
  materialBedDepthMm: number;
  volumetricFlowM3H: number;
  massFlowRateTH: number;
  totalOscillatingMassKg: number;
  naturalFrequencyHz: number;
  resonanceRatio: number;
  inResonanceZone: boolean;
  springStaticLoadKn: number;
  springDynamicLoadKn: number;
  springDeflectionMm: number;
  transmissibility: number;
  isolationEfficiencyPct: number;
  motorPowerKw: number;
  motorCurrentA: number;
  linerWearIndex: number;
  troughTiltDeg: number;
  phaseSlipDeg: number;
  healthStatus: FeederHealthStatus;
}

const GRAVITY = 9.80665;
const DAMPING_ZETA = 0.06;

export function evaluateVibratingFeeder(
  inputs: VibratingFeederInputs
): VibratingFeederMetrics {
  const {
    driveFrequencyHz,
    strokeMm,
    throwAngleDeg,
    troughInclinationDeg,
    gateOpeningMm,
    troughWidthMm,
    troughLengthM,
    bulkDensityTM3,
    moistureFrictionFactor,
    springStiffnessNmm,
    faultMode,
  } = inputs;

  const omegaRadS = 2 * Math.PI * driveFrequencyHz;
  const driveRpm = driveFrequencyHz * 60;

  // Phase slip between dual eccentric shafts reduces directed linear stroke
  const phaseSlipDeg = faultMode === 'phase-slip' ? 58 : 0;
  const phaseFactor = Math.cos(((phaseSlipDeg / 2) * Math.PI) / 180);
  const effectiveStrokeMm = strokeMm * phaseFactor;
  const singleAmplitudeMm = effectiveStrokeMm / 2;
  const amplitudeM = singleAmplitudeMm / 1000;

  const peakAccelMs2 = amplitudeM * omegaRadS * omegaRadS;
  const peakGForce = peakAccelMs2 / GRAVITY;

  const betaRad = (throwAngleDeg * Math.PI) / 180;
  const alphaRad = (troughInclinationDeg * Math.PI) / 180;

  const normalGForce = peakGForce * Math.sin(betaRad);
  const throwOffThresholdG = Math.cos(alphaRad);

  // Throw index K_v = (A * w^2 * sin(beta)) / (g * cos(alpha))
  const throwIndexKv =
    (peakAccelMs2 * Math.sin(betaRad)) / (GRAVITY * Math.cos(alphaRad));

  let regime: ThrowRegime = 'micro-throw';
  if (throwIndexKv < 1.0) {
    regime = 'sub-threshold';
  } else if (throwIndexKv > 3.3) {
    regime = 'aggressive-bounce';
  }

  // Conveying velocity model (sliding below Kv=1, micro-throwing above Kv=1)
  const inclineBoost = 1 + 0.035 * troughInclinationDeg;
  const moistureDragFactor = Math.max(
    0.55,
    Math.min(1.12, 1.25 - 0.25 * moistureFrictionFactor)
  );
  let conveyingVelocityMs = 0;

  if (throwIndexKv <= 1.0) {
    const slideFactor = Math.max(0, throwIndexKv - 0.35) * 0.16;
    conveyingVelocityMs =
      amplitudeM *
      omegaRadS *
      Math.cos(betaRad) *
      slideFactor *
      inclineBoost *
      moistureDragFactor;
  } else {
    const hopEfficiency = Math.min(
      0.92,
      0.38 +
        0.24 * Math.log(throwIndexKv) +
        0.12 * Math.min(throwIndexKv - 1.0, 2.0)
    );
    conveyingVelocityMs =
      amplitudeM *
      omegaRadS *
      Math.cos(betaRad) *
      hopEfficiency *
      inclineBoost *
      moistureDragFactor;
  }

  // Broken spring causes uneven bed & drag loss
  if (faultMode === 'broken-spring') {
    conveyingVelocityMs *= 0.78;
  }

  const conveyingVelocityMMin = conveyingVelocityMs * 60;

  // Hopper bridging chokes effective gate opening to 18%
  const effectiveGateMm =
    faultMode === 'hopper-bridging' ? gateOpeningMm * 0.18 : gateOpeningMm;

  const widthM = troughWidthMm / 1000;
  const bedFillFactor = Math.max(
    0.65,
    Math.min(0.92, 0.85 - 0.08 * (moistureFrictionFactor - 1.0))
  );
  const materialBedDepthMm = effectiveGateMm * bedFillFactor;
  const bedDepthM = materialBedDepthMm / 1000;

  const volumetricFlowM3S = widthM * bedDepthM * conveyingVelocityMs;
  const volumetricFlowM3H = volumetricFlowM3S * 3600;
  const massFlowRateTH = volumetricFlowM3H * bulkDensityTM3;

  // Isolation spring dynamics
  // Trough + exciter mass scales with width and length; bed mass scales with length
  const troughMassKg = 200 + 0.22 * troughWidthMm + 52 * troughLengthM;
  const bedMassKg = widthM * bedDepthM * troughLengthM * (bulkDensityTM3 * 1000);
  const totalOscillatingMassKg = troughMassKg + bedMassKg;

  const nominalTotalStiffnessNM = springStiffnessNmm * 1000;
  const stiffnessFactor = faultMode === 'broken-spring' ? 0.62 : 1.0;
  const effectiveStiffnessNM = nominalTotalStiffnessNM * stiffnessFactor;

  const naturalFrequencyHz =
    (1 / (2 * Math.PI)) *
    Math.sqrt(effectiveStiffnessNM / totalOscillatingMassKg);
  const resonanceRatio = driveFrequencyHz / naturalFrequencyHz;
  const inResonanceZone = resonanceRatio >= 0.75 && resonanceRatio <= 1.35;

  const springStaticLoadKn = (totalOscillatingMassKg * GRAVITY) / 1000;
  const springDeflectionMm =
    ((totalOscillatingMassKg * GRAVITY) / effectiveStiffnessNM) * 1000;

  const r2 = resonanceRatio * resonanceRatio;
  const dampingTerm = Math.pow(2 * DAMPING_ZETA * resonanceRatio, 2);
  const transmissibility =
    Math.sqrt(1 + dampingTerm) / Math.sqrt(Math.pow(1 - r2, 2) + dampingTerm);
  const isolationEfficiencyPct = Math.max(0, (1 - transmissibility) * 100);

  const springDynamicLoadKn =
    (totalOscillatingMassKg * peakAccelMs2 * transmissibility) / 1000;

  // Motor Power (kW) & Current (A) at 400V 3-phase
  const exciterForceN = totalOscillatingMassKg * peakAccelMs2;
  const materialWorkW =
    ((massFlowRateTH * 1000) / 3600) *
    GRAVITY *
    troughLengthM *
    0.35 *
    moistureFrictionFactor;
  const mechanicalLossW = 0.032 * exciterForceN * (amplitudeM * omegaRadS);
  const faultPowerFactor =
    faultMode === 'phase-slip' ? 1.28 : faultMode === 'broken-spring' ? 1.18 : 1.0;
  const motorPowerKw = Math.max(
    0.35,
    ((materialWorkW + mechanicalLossW) * faultPowerFactor) / 1000
  );
  const motorCurrentA =
    (motorPowerKw * 1000) / (Math.sqrt(3) * 400 * 0.85 * 0.9);

  // Liner Wear / Impact Index (0 - 100)
  const rawWear =
    throwIndexKv * 13.5 +
    peakGForce * 2.1 +
    bulkDensityTM3 * 6.5 +
    moistureFrictionFactor * 7.5 +
    (faultMode === 'broken-spring' ? 18 : 0);
  const linerWearIndex = Math.min(100, Math.max(5, rawWear));

  const troughTiltDeg = faultMode === 'broken-spring' ? 4.5 : 0;

  let healthStatus: FeederHealthStatus = 'optimal';
  if (faultMode !== 'normal' || inResonanceZone) {
    healthStatus = 'critical';
  } else if (throwIndexKv < 1.0 || throwIndexKv > 3.6 || linerWearIndex > 78) {
    healthStatus = 'warning';
  }

  return {
    driveRpm,
    singleAmplitudeMm,
    omegaRadS,
    peakAccelMs2,
    peakGForce,
    normalGForce,
    throwOffThresholdG,
    effectiveStrokeMm,
    throwIndexKv,
    regime,
    conveyingVelocityMMin,
    conveyingVelocityMs,
    effectiveGateMm,
    materialBedDepthMm,
    volumetricFlowM3H,
    massFlowRateTH,
    totalOscillatingMassKg,
    naturalFrequencyHz,
    resonanceRatio,
    inResonanceZone,
    springStaticLoadKn,
    springDynamicLoadKn,
    springDeflectionMm,
    transmissibility,
    isolationEfficiencyPct,
    motorPowerKw,
    motorCurrentA,
    linerWearIndex,
    troughTiltDeg,
    phaseSlipDeg,
    healthStatus,
  };
}
