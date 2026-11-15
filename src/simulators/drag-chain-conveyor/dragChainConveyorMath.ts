export type DragChainFault =
  | 'none'
  | 'chain-slack'
  | 'broken-flight'
  | 'material-jam';

export type InspectionZoneId =
  | 'drive-sprocket'
  | 'shear-pin'
  | 'return-catenary'
  | 'tail-takeup';

export interface DragChainConveyorInputs {
  /** Enclosed casing internal width W (mm) */
  casingWidthMm: number;
  /** Enclosed casing internal height H_c (mm) */
  casingHeightMm: number;
  /** Conveyor center-to-center length L (m) */
  conveyorLengthM: number;
  /** Conveyor inclination angle θ (deg) */
  inclinationDeg: number;
  /** Material bed height H above bottom liner (mm) */
  bedHeightMm: number;
  /** Linear chain speed v (m/s) */
  chainSpeedMs: number;
  /** Scraper flight pitch p_f (mm) */
  flightPitchMm: number;
  /** Drag chain link pitch p_c (mm) */
  chainPitchMm: number;
  /** Drive & tail sprocket teeth count z */
  sprocketTeeth: number;
  /** Tail take-up tensioning screw travel (mm) */
  takeUpScrewMm: number;
  /** Chain elongation wear (%) */
  chainWearPct: number;
  /** Material bulk density ρ (t/m³) */
  bulkDensityTM3: number;
  /** Material-to-liner sliding friction coefficient μ_m */
  materialFriction: number;
  /** Chain-to-rail sliding friction coefficient μ_c */
  chainFriction: number;
  /** Nominal en-masse conveying efficiency (%) */
  efficiencyPct: number;
  /** Active fault injection */
  fault: DragChainFault;
}

export interface InspectionZoneTelemetry {
  id: InspectionZoneId;
  tensionKn: number;
  wearPct: number;
  temperatureC: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface DragChainConveyorMetrics {
  /** Effective clamped bed height (mm) */
  effectiveBedHeightMm: number;
  /** Material cross-sectional bed area (cm²) */
  bedAreaCm2: number;
  /** Material cross-sectional bed area (m²) */
  crossSectionAreaM2: number;
  /** Effective conveying efficiency after inclination, wear & fault derating (0 - 1) */
  effectiveEfficiency: number;
  /** Volumetric conveying capacity Q_v (m³/h) */
  volumetricFlowM3h: number;
  /** Mass flow rate m_dot (t/h) */
  massFlowTh: number;
  /** Linear mass of chain + scraper flights q_c (kg/m) */
  chainLinearMassKgM: number;
  /** Linear mass of conveyed bulk material q_m (kg/m) */
  materialLinearMassKgM: number;
  /** Tight-side chain pull T₁ at head sprocket (kN) */
  t1Kn: number;
  /** Slack-side chain tension T₂ at tail/return (kN) */
  t2Kn: number;
  /** Effective conveying pull F_e = T₁ - T₂ (kN) */
  feKn: number;
  /** Sprocket pitch circle diameter (mm) */
  sprocketPitchDiaMm: number;
  /** Drive sprocket speed (RPM) */
  sprocketRpm: number;
  /** Drive sprocket shaft torque (N·m) */
  driveTorqueNm: number;
  /** Rated shear-pin trip threshold F_pin (kN) */
  shearPinLimitKn: number;
  /** Percentage of shear pin capacity (%) */
  shearPinLoadPct: number;
  /** Whether the drive shear pin has tripped */
  shearPinTripped: boolean;
  /** Shaft power at head sprocket P_shaft (kW) */
  shaftPowerKw: number;
  /** Required motor input power P_motor (kW) */
  motorPowerKw: number;
  /** 3-phase 400V motor line current (A) */
  motorCurrentA: number;
  /** Return-side catenary sag S (mm) */
  catenarySagMm: number;
  /** Take-up tension status */
  takeUpStatus: 'slack' | 'optimal' | 'over-tight';
  /** Return-side carryback percentage (%) */
  carrybackPct: number;
  /** Live inspection probe telemetry for each hotspot */
  zones: Record<InspectionZoneId, InspectionZoneTelemetry>;
  /** Overall health status */
  health: 'normal' | 'warning' | 'critical';
  /** Primary diagnostic reason key */
  statusCode:
    | 'optimal'
    | 'jam-overload'
    | 'broken-flight'
    | 'chain-slack'
    | 'over-tensioned'
    | 'chain-wear'
    | 'steep-derating';
}

const GRAVITY = 9.81;
const DRIVE_EFFICIENCY = 0.88;
const LINE_VOLTAGE_V = 400;
const POWER_FACTOR = 0.85;

export function evaluateDragChainConveyor(
  inputs: DragChainConveyorInputs
): DragChainConveyorMetrics {
  const effectiveBedHeightMm = Math.min(
    inputs.bedHeightMm,
    Math.round(inputs.casingHeightMm * 0.9)
  );
  const widthM = inputs.casingWidthMm / 1000;
  const heightM = effectiveBedHeightMm / 1000;
  const crossSectionAreaM2 = widthM * heightM;
  const bedAreaCm2 = crossSectionAreaM2 * 10000;

  const thetaRad = (inputs.inclinationDeg * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);
  const sinTheta = Math.sin(thetaRad);

  // En-masse internal shear lock degrades as inclination steepens
  const inclinationDerating = Math.max(
    0.42,
    1 - 0.011 * inputs.inclinationDeg
  );

  // Flight pitch factor: excessively wide pitch slightly reduces plug cohesion
  const pitchFactor =
    inputs.flightPitchMm > 240
      ? Math.max(0.86, 1 - (inputs.flightPitchMm - 240) * 0.0012)
      : 1.0;

  // Chain elongation wear degrades flight alignment & increases slip
  const wearFlowFactor = Math.max(0.84, 1 - inputs.chainWearPct * 0.032);

  let faultFlowFactor = 1.0;
  let carrybackPct = 1.2 + inputs.chainWearPct * 1.1;

  if (inputs.fault === 'broken-flight') {
    faultFlowFactor = 0.65;
    carrybackPct = 28.0 + inputs.chainWearPct * 0.8;
  } else if (inputs.fault === 'chain-slack') {
    faultFlowFactor = 0.91;
    carrybackPct = 6.5 + inputs.chainWearPct * 1.0;
  } else if (inputs.fault === 'material-jam') {
    faultFlowFactor = 0.06;
    carrybackPct = 12.0;
  }

  const nominalEff = inputs.efficiencyPct / 100;
  const effectiveEfficiency = Math.max(
    0.02,
    Math.min(
      0.96,
      nominalEff *
        inclinationDerating *
        pitchFactor *
        wearFlowFactor *
        faultFlowFactor
    )
  );

  const effectiveSpeed =
    inputs.fault === 'material-jam'
      ? inputs.chainSpeedMs * 0.08
      : inputs.chainSpeedMs;

  const volumetricFlowM3h =
    crossSectionAreaM2 * effectiveSpeed * effectiveEfficiency * 3600;
  const massFlowTh = volumetricFlowM3h * inputs.bulkDensityTM3;

  // Chain + scraper flight linear mass scales with casing width, flight pitch & chain pitch
  const pitchMassFactor = 200 / Math.max(125, inputs.flightPitchMm);
  const chainPitchFactor = inputs.chainPitchMm / 100;
  const chainLinearMassKgM =
    9.5 +
    0.036 * inputs.casingWidthMm +
    3.0 * pitchMassFactor +
    1.8 * chainPitchFactor;

  const bulkDensityKgM3 = inputs.bulkDensityTM3 * 1000;
  const materialLinearMassKgM =
    crossSectionAreaM2 * bulkDensityKgM3 * effectiveEfficiency;

  // Carrying run friction (material on liner + chain on rail) + return run + elevation lift
  const materialCarryFrictionN =
    materialLinearMassKgM *
    inputs.conveyorLengthM *
    GRAVITY *
    inputs.materialFriction *
    cosTheta;

  const chainCarryFrictionN =
    chainLinearMassKgM *
    inputs.conveyorLengthM *
    GRAVITY *
    inputs.chainFriction *
    cosTheta;

  const returnCarrybackMass = materialLinearMassKgM * (carrybackPct / 100);
  const returnFrictionN =
    (chainLinearMassKgM + returnCarrybackMass) *
    inputs.conveyorLengthM *
    GRAVITY *
    (inputs.chainFriction * 0.85) *
    cosTheta;

  const liftForceN =
    materialLinearMassKgM * inputs.conveyorLengthM * GRAVITY * sinTheta;

  // Chain wear increases chordal friction and rail binding
  const wearDragMultiplier = 1 + inputs.chainWearPct * 0.045;

  let feKn =
    ((materialCarryFrictionN +
      chainCarryFrictionN +
      returnFrictionN +
      liftForceN) /
      1000) *
    wearDragMultiplier;

  if (inputs.fault === 'broken-flight') {
    feKn *= 1.18;
  } else if (inputs.fault === 'material-jam') {
    feKn = Math.max(feKn * 2.65, 24.5 + 0.03 * inputs.casingWidthMm);
  }

  // Over-tight take-up screw adds parasitic bearing & wear-strip drag
  const overTightDragKn =
    inputs.takeUpScrewMm > 60 ? (inputs.takeUpScrewMm - 60) * 0.11 : 0;
  feKn += overTightDragKn;

  // Slack-side tension T₂ governed by tail take-up screw travel & wear elongation
  const wearSlackLossKn = inputs.chainWearPct * 0.16;
  let t2Kn = Math.max(
    0.25,
    0.65 + (inputs.takeUpScrewMm / 80) * 3.85 - wearSlackLossKn
  );
  if (inputs.fault === 'chain-slack') {
    t2Kn = Math.max(0.18, t2Kn * 0.35);
  }

  // Tight-side tension T₁ = T₂ + F_e
  const t1Kn = t2Kn + feKn;

  const shearPinLimitKn = 12 + 0.05 * inputs.casingWidthMm;
  const shearPinLoadPct = (t1Kn / shearPinLimitKn) * 100;
  const shearPinTripped =
    inputs.fault === 'material-jam' || shearPinLoadPct >= 100;

  // Sprocket pitch circle diameter & RPM & Torque
  const sprocketPitchDiaMm =
    inputs.chainPitchMm / Math.sin(Math.PI / Math.max(6, inputs.sprocketTeeth));
  const sprocketPitchRadiusM = sprocketPitchDiaMm / 2000;
  const sprocketRpm =
    (effectiveSpeed * 60) / (Math.PI * (sprocketPitchDiaMm / 1000));
  const driveTorqueNm = feKn * 1000 * sprocketPitchRadiusM;

  // Shaft & motor power (computed at commanded chain speed to reflect drive demand)
  const shaftPowerKw = feKn * inputs.chainSpeedMs;
  const motorPowerKw = shaftPowerKw / DRIVE_EFFICIENCY;
  const motorCurrentA =
    (motorPowerKw * 1000) / (Math.sqrt(3) * LINE_VOLTAGE_V * POWER_FACTOR);

  // Return-side catenary sag calculation
  // Scales with conveyor length, chain wear elongation, and take-up screw setting
  const spanFactor = 0.75 + (inputs.conveyorLengthM / 20) * 0.35;
  let catenarySagMm =
    (12 +
      Math.max(0, 40 - inputs.takeUpScrewMm) * 1.1 +
      inputs.chainWearPct * 4.5) *
    spanFactor;
  if (inputs.fault === 'chain-slack') {
    catenarySagMm += 42;
  }
  if (inputs.takeUpScrewMm > 55) {
    catenarySagMm = Math.max(
      4,
      catenarySagMm - (inputs.takeUpScrewMm - 55) * 0.35
    );
  }

  let takeUpStatus: 'slack' | 'optimal' | 'over-tight' = 'optimal';
  if (catenarySagMm > 38 || inputs.fault === 'chain-slack') {
    takeUpStatus = 'slack';
  } else if (inputs.takeUpScrewMm > 62) {
    takeUpStatus = 'over-tight';
  }

  // Component temperatures for inspection probe
  const ambientC = 28;
  const sprocketTempC =
    ambientC +
    feKn * 2.1 +
    inputs.chainSpeedMs * 12 +
    inputs.chainWearPct * 4.8 +
    (inputs.fault === 'material-jam' ? 28 : 0);

  const shearPinTempC =
    ambientC +
    shearPinLoadPct * 0.42 +
    (shearPinTripped ? 34 : 0);

  const catenaryTempC =
    ambientC +
    inputs.chainFriction * 36 +
    inputs.chainWearPct * 3.5 +
    carrybackPct * 0.55 +
    (takeUpStatus === 'slack' ? 11 : 0);

  const takeUpTempC =
    ambientC +
    t2Kn * 4.2 +
    (takeUpStatus === 'over-tight' ? 22 : 0) +
    inputs.chainWearPct * 2.0;

  const zones: Record<InspectionZoneId, InspectionZoneTelemetry> = {
    'drive-sprocket': {
      id: 'drive-sprocket',
      tensionKn: t1Kn,
      wearPct: inputs.chainWearPct,
      temperatureC: sprocketTempC,
      status:
        inputs.fault === 'material-jam' || sprocketTempC > 85
          ? 'critical'
          : inputs.chainWearPct >= 3.0 || sprocketTempC > 65
            ? 'warning'
            : 'normal',
    },
    'shear-pin': {
      id: 'shear-pin',
      tensionKn: t1Kn,
      wearPct: shearPinLoadPct,
      temperatureC: shearPinTempC,
      status: shearPinTripped
        ? 'critical'
        : shearPinLoadPct >= 75
          ? 'warning'
          : 'normal',
    },
    'return-catenary': {
      id: 'return-catenary',
      tensionKn: t2Kn,
      wearPct: inputs.chainWearPct,
      temperatureC: catenaryTempC,
      status:
        inputs.fault === 'broken-flight' || catenarySagMm > 60
          ? 'critical'
          : takeUpStatus === 'slack' || inputs.chainWearPct >= 3.0
            ? 'warning'
            : 'normal',
    },
    'tail-takeup': {
      id: 'tail-takeup',
      tensionKn: t2Kn,
      wearPct: Math.min(100, (inputs.takeUpScrewMm / 80) * 100),
      temperatureC: takeUpTempC,
      status:
        takeUpStatus === 'slack' || takeUpStatus === 'over-tight'
          ? 'warning'
          : 'normal',
    },
  };

  let health: 'normal' | 'warning' | 'critical' = 'normal';
  let statusCode: DragChainConveyorMetrics['statusCode'] = 'optimal';

  if (shearPinTripped || inputs.fault === 'material-jam') {
    health = 'critical';
    statusCode = 'jam-overload';
  } else if (inputs.fault === 'broken-flight') {
    health = 'critical';
    statusCode = 'broken-flight';
  } else if (takeUpStatus === 'slack') {
    health = 'warning';
    statusCode = 'chain-slack';
  } else if (takeUpStatus === 'over-tight') {
    health = 'warning';
    statusCode = 'over-tensioned';
  } else if (inputs.chainWearPct >= 3.0) {
    health = 'warning';
    statusCode = 'chain-wear';
  } else if (inputs.inclinationDeg > 25) {
    health = 'warning';
    statusCode = 'steep-derating';
  }

  return {
    effectiveBedHeightMm,
    bedAreaCm2,
    crossSectionAreaM2,
    effectiveEfficiency,
    volumetricFlowM3h,
    massFlowTh,
    chainLinearMassKgM,
    materialLinearMassKgM,
    t1Kn,
    t2Kn,
    feKn,
    sprocketPitchDiaMm,
    sprocketRpm,
    driveTorqueNm,
    shearPinLimitKn,
    shearPinLoadPct,
    shearPinTripped,
    shaftPowerKw,
    motorPowerKw,
    motorCurrentA,
    catenarySagMm,
    takeUpStatus,
    carrybackPct,
    zones,
    health,
    statusCode,
  };
}
