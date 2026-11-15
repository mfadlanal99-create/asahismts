import { astmD341ViscosityAtTemp, cToK } from '../../physics';

export type EquipmentId =
  | 'helical-gearbox'
  | 'pump-bearing'
  | 'worm-gear'
  | 'hydraulic-unit';

export type IsoVgGrade =
  | 'VG 32'
  | 'VG 46'
  | 'VG 68'
  | 'VG 100'
  | 'VG 150'
  | 'VG 220'
  | 'VG 320'
  | 'VG 460';

export type WearLevel = 'normal' | 'elevated' | 'severe';

export type Beta5Value = 20 | 75 | 200 | 1000;

export const BETA_5_OPTIONS: ReadonlyArray<{
  value: Beta5Value;
  label: string;
  efficiencyPct: string;
  isoOffset: number;
}> = [
  { value: 20, label: 'β₅ = 20', efficiencyPct: '95.0%', isoOffset: 0 },
  { value: 75, label: 'β₅ = 75', efficiencyPct: '98.7%', isoOffset: -1 },
  { value: 200, label: 'β₅ = 200', efficiencyPct: '99.5%', isoOffset: -2 },
  { value: 1000, label: 'β₅ = 1000', efficiencyPct: '99.9%', isoOffset: -3 },
];

export type BearingType = 'ball' | 'cylindrical' | 'spherical';

export interface EquipmentSpec {
  id: EquipmentId;
  name: string;
  shortName: string;
  description: string;
  recommendedVg: IsoVgGrade;
  targetViscosityMin: number; // cSt at operating temp
  targetViscosityMax: number; // cSt at operating temp
  optimalTempRange: [number, number]; // °C
  maxSafeTemp: number; // °C
  targetIso4406: [number, number, number]; // [>=4um, >=6um, >=14um]
  surfaceRoughnessUm: number; // composite RMS roughness sigma (um)
  referenceNuForLambda1: number; // cSt at which film = 1 * sigma
  waterLimitPpm: number;
  defaultGreaseD: number; // mm
  defaultGreaseB: number; // mm
  defaultRpm: number;
}

export interface IsoVgSpec {
  grade: IsoVgGrade;
  nu40: number; // cSt at 40 °C
  nu100: number; // cSt at 100 °C (VI ~ 95-100 industrial mineral oil)
}

export const ISO_VG_SPECS: Record<IsoVgGrade, IsoVgSpec> = {
  'VG 32': { grade: 'VG 32', nu40: 32, nu100: 5.4 },
  'VG 46': { grade: 'VG 46', nu40: 46, nu100: 6.8 },
  'VG 68': { grade: 'VG 68', nu40: 68, nu100: 8.7 },
  'VG 100': { grade: 'VG 100', nu40: 100, nu100: 11.2 },
  'VG 150': { grade: 'VG 150', nu40: 150, nu100: 14.6 },
  'VG 220': { grade: 'VG 220', nu40: 220, nu100: 19.0 },
  'VG 320': { grade: 'VG 320', nu40: 320, nu100: 24.1 },
  'VG 460': { grade: 'VG 460', nu40: 460, nu100: 30.6 },
};

export const ISO_VG_LIST: IsoVgGrade[] = [
  'VG 32',
  'VG 46',
  'VG 68',
  'VG 100',
  'VG 150',
  'VG 220',
  'VG 320',
  'VG 460',
];

export const EQUIPMENT_SPECS: Record<EquipmentId, EquipmentSpec> = {
  'helical-gearbox': {
    id: 'helical-gearbox',
    name: 'Helical Gearbox',
    shortName: 'Helical Gear',
    description:
      'Industrial parallel-shaft helical reducer operating under moderate-to-high tooth contact stress.',
    recommendedVg: 'VG 220',
    targetViscosityMin: 25,
    targetViscosityMax: 90,
    optimalTempRange: [50, 75],
    maxSafeTemp: 85,
    targetIso4406: [19, 17, 14],
    surfaceRoughnessUm: 0.45,
    referenceNuForLambda1: 18,
    waterLimitPpm: 500,
    defaultGreaseD: 130,
    defaultGreaseB: 31,
    defaultRpm: 1450,
  },
  'pump-bearing': {
    id: 'pump-bearing',
    name: 'High-Speed Pump Bearing',
    shortName: 'Pump Bearing',
    description:
      'Centrifugal process pump rolling-element bearing running at 2950 RPM with tight EHL film requirements.',
    recommendedVg: 'VG 68',
    targetViscosityMin: 13,
    targetViscosityMax: 35,
    optimalTempRange: [45, 70],
    maxSafeTemp: 80,
    targetIso4406: [18, 16, 13],
    surfaceRoughnessUm: 0.24,
    referenceNuForLambda1: 9,
    waterLimitPpm: 250,
    defaultGreaseD: 110,
    defaultGreaseB: 27,
    defaultRpm: 2950,
  },
  'worm-gear': {
    id: 'worm-gear',
    name: 'Heavy-Duty Worm Gear',
    shortName: 'Worm Gear',
    description:
      'High-sliding bronze-on-steel worm reducer requiring high viscosity and EP/compounded film strength.',
    recommendedVg: 'VG 460',
    targetViscosityMin: 45,
    targetViscosityMax: 160,
    optimalTempRange: [55, 85],
    maxSafeTemp: 95,
    targetIso4406: [20, 18, 15],
    surfaceRoughnessUm: 0.55,
    referenceNuForLambda1: 32,
    waterLimitPpm: 500,
    defaultGreaseD: 150,
    defaultGreaseB: 36,
    defaultRpm: 980,
  },
  'hydraulic-unit': {
    id: 'hydraulic-unit',
    name: 'Hydraulic Power Unit',
    shortName: 'Hydraulic HPU',
    description:
      'High-pressure axial-piston pump & proportional servo-valve circuit sensitive to silt and water.',
    recommendedVg: 'VG 46',
    targetViscosityMin: 16,
    targetViscosityMax: 42,
    optimalTempRange: [40, 60],
    maxSafeTemp: 70,
    targetIso4406: [17, 15, 12],
    surfaceRoughnessUm: 0.2,
    referenceNuForLambda1: 11,
    waterLimitPpm: 200,
    defaultGreaseD: 90,
    defaultGreaseB: 23,
    defaultRpm: 1750,
  },
};

export const EQUIPMENT_LIST: EquipmentSpec[] = [
  EQUIPMENT_SPECS['helical-gearbox'],
  EQUIPMENT_SPECS['pump-bearing'],
  EQUIPMENT_SPECS['worm-gear'],
  EQUIPMENT_SPECS['hydraulic-unit'],
];

/**
 * Computes kinematic viscosity (cSt) at temperature T (°C) using the
 * ASTM D341 / Walther equation: log10(log10(nu + 0.7)) = A - B * log10(T + 273.15)
 */
export function computeViscosityAtTemp(grade: IsoVgGrade, tempC: number): number {
  const { nu40, nu100 } = ISO_VG_SPECS[grade];
  const nu = astmD341ViscosityAtTemp(cToK(Math.max(tempC, 0)), nu40, nu100);
  return Math.max(1.2, Math.min(3000, nu));
}

export type LubricationRegime = 'Full-Film EHL' | 'Mixed' | 'Marginal' | 'Boundary';

export interface EhlResult {
  viscosityCst: number;
  filmThicknessUm: number;
  lambdaRatio: number;
  regime: LubricationRegime;
  waterPenaltyFactor: number;
}

/**
 * Estimates EHL film thickness (um) and lambda ratio (h_min / sigma).
 * Film thickness scales roughly with (nu / nu_ref)^0.67 and is degraded by
 * free/emulsified water contamination.
 */
export function computeEhlFilm(
  equipment: EquipmentSpec,
  grade: IsoVgGrade,
  tempC: number,
  waterPpm: number,
): EhlResult {
  const viscosityCst = computeViscosityAtTemp(grade, tempC);
  // Water above saturation (~200 ppm) forms micro-emulsion droplets that collapse EHL film
  const excessWater = Math.max(0, waterPpm - 150);
  const waterPenaltyFactor = Math.max(0.42, 1 - (excessWater / 2000) * 0.55);

  const ratio = Math.max(0.05, viscosityCst / equipment.referenceNuForLambda1);
  const baseFilmUm = equipment.surfaceRoughnessUm * Math.pow(ratio, 0.67);
  const filmThicknessUm = baseFilmUm * waterPenaltyFactor;
  const lambdaRatio = filmThicknessUm / equipment.surfaceRoughnessUm;

  let regime: LubricationRegime = 'Full-Film EHL';
  if (lambdaRatio < 1.0) {
    regime = 'Boundary';
  } else if (lambdaRatio < 1.5) {
    regime = 'Marginal';
  } else if (lambdaRatio < 3.0) {
    regime = 'Mixed';
  }

  return {
    viscosityCst,
    filmThicknessUm,
    lambdaRatio,
    regime,
    waterPenaltyFactor,
  };
}

export interface Iso4406Result {
  actual: [number, number, number];
  target: [number, number, number];
  codeString: string;
  targetString: string;
  particles4um: string;
  particles6um: string;
  particles14um: string;
  status: 'clean' | 'caution' | 'critical';
  aIsoMultiplier: number;
}

const ISO_4406_RANGE_LABELS: Record<number, string> = {
  11: '10–20',
  12: '20–40',
  13: '40–80',
  14: '80–160',
  15: '160–320',
  16: '320–640',
  17: '640–1,300',
  18: '1,300–2,500',
  19: '2,500–5,000',
  20: '5,000–10,000',
  21: '10,000–20,000',
  22: '20,000–40,000',
  23: '40,000–80,000',
  24: '80,000–160,000',
};

export function computeIso4406(
  equipment: EquipmentSpec,
  wearLevel: WearLevel,
  waterPpm: number,
  lambdaRatio: number,
  beta5: Beta5Value = 20,
): Iso4406Result {
  const [t4, t6, t14] = equipment.targetIso4406;
  let offset4 = 0;
  let offset6 = 0;
  let offset14 = 0;

  if (wearLevel === 'elevated') {
    offset4 += 2;
    offset6 += 2;
    offset14 += 2;
  } else if (wearLevel === 'severe') {
    offset4 += 4;
    offset6 += 4;
    offset14 += 4;
  }

  if (waterPpm >= 1000) {
    offset4 += 1;
    offset6 += 1;
  }
  if (lambdaRatio < 1.0) {
    offset4 += 1;
    offset14 += 1;
  }

  const betaOpt = BETA_5_OPTIONS.find((b) => b.value === beta5) ?? BETA_5_OPTIONS[0];
  const filtOffset = betaOpt.isoOffset;

  const c4 = Math.max(11, Math.min(24, t4 + offset4 + filtOffset));
  const c6 = Math.max(11, Math.min(23, t6 + offset6 + filtOffset));
  const c14 = Math.max(11, Math.min(22, t14 + offset14 + filtOffset));

  const deltaMax = Math.max(c4 - t4, c6 - t6, c14 - t14);
  let status: 'clean' | 'caution' | 'critical' = 'clean';
  if (deltaMax >= 3) {
    status = 'critical';
  } else if (deltaMax >= 1) {
    status = 'caution';
  }

  // ISO 281 style Bearing Life Multiplier (a_ISO) from cleanliness & lambda ratio
  const avgDelta = ((t4 - c4) + (t6 - c6) + (t14 - c14)) / 3;
  const cleanlinessFactor = Math.max(0.25, Math.min(2.2, Math.pow(1.26, avgDelta)));
  const lambdaFactor = Math.max(0.3, Math.min(2.1, 0.4 + 0.55 * Math.min(lambdaRatio, 3.0)));
  const aIsoMultiplier = Number(
    Math.max(0.15, Math.min(4.5, cleanlinessFactor * lambdaFactor)).toFixed(2),
  );

  return {
    actual: [c4, c6, c14],
    target: equipment.targetIso4406,
    codeString: `${c4}/${c6}/${c14}`,
    targetString: `${t4}/${t6}/${t14}`,
    particles4um: `${ISO_4406_RANGE_LABELS[c4] ?? '>160,000'} /mL`,
    particles6um: `${ISO_4406_RANGE_LABELS[c6] ?? '>160,000'} /mL`,
    particles14um: `${ISO_4406_RANGE_LABELS[c14] ?? '>160,000'} /mL`,
    status,
    aIsoMultiplier,
  };
}

export type DiagnosisSeverity = 'normal' | 'warning' | 'critical';

export interface DiagnosticFlag {
  id: 'water' | 'viscosity' | 'wear' | 'oxidation';
  title: string;
  severity: DiagnosisSeverity;
  reading: string;
  summary: string;
  action: string;
}

export interface LabReportResult {
  overallHealth: DiagnosisSeverity;
  estimatedOilLifePct: number;
  flags: DiagnosticFlag[];
}

export function evaluateLabReport(
  equipment: EquipmentSpec,
  grade: IsoVgGrade,
  tempC: number,
  waterPpm: number,
  wearLevel: WearLevel,
  ehl: EhlResult,
  iso4406: Iso4406Result,
): LabReportResult {
  const flags: DiagnosticFlag[] = [];

  // 1. Water Ingress / Emulsion
  let waterSeverity: DiagnosisSeverity = 'normal';
  let waterSummary = 'Moisture within dry-oil limits; dissolved water only.';
  let waterAction = 'Continue routine Karl Fischer moisture checks.';
  if (waterPpm >= 1000) {
    waterSeverity = 'critical';
    waterSummary = 'Free water & stable emulsion detected; severe corrosion and EHL film collapse.';
    waterAction = 'Inspect shaft seals/breathers, perform vacuum dehydration or full oil drain.';
  } else if (waterPpm >= equipment.waterLimitPpm) {
    waterSeverity = 'warning';
    waterSummary = 'Above equipment saturation limit; accelerated bearing fatigue risk.';
    waterAction = 'Check desiccant breather and cooler integrity; schedule kidney-loop dewatering.';
  }
  flags.push({
    id: 'water',
    title: 'Water Ingress / Emulsion',
    severity: waterSeverity,
    reading: `${waterPpm} ppm (limit ${equipment.waterLimitPpm} ppm)`,
    summary: waterSummary,
    action: waterAction,
  });

  // 2. Wrong Viscosity Grade
  const nu = ehl.viscosityCst;
  let viscSeverity: DiagnosisSeverity = 'normal';
  let viscSummary = `Operating viscosity (${nu.toFixed(1)} cSt) is inside target window (${equipment.targetViscosityMin}–${equipment.targetViscosityMax} cSt).`;
  let viscAction = `${grade} is well matched for ${equipment.name} at ${tempC} °C.`;
  if (nu < equipment.targetViscosityMin * 0.7) {
    viscSeverity = 'critical';
    viscSummary = `Severe under-viscosity (${nu.toFixed(1)} cSt < ${equipment.targetViscosityMin} cSt min): metal-to-metal scuffing risk.`;
    viscAction = `Switch to ${equipment.recommendedVg} or reduce sump temperature below ${equipment.optimalTempRange[1]} °C.`;
  } else if (nu < equipment.targetViscosityMin) {
    viscSeverity = 'warning';
    viscSummary = `Low operating viscosity (${nu.toFixed(1)} cSt): thin film & elevated wear rate.`;
    viscAction = `Verify oil grade (${equipment.recommendedVg} recommended) or check for fuel/solvent dilution.`;
  } else if (nu > equipment.targetViscosityMax * 1.5) {
    viscSeverity = 'critical';
    viscSummary = `Excessive viscosity (${nu.toFixed(1)} cSt > ${equipment.targetViscosityMax} cSt max): high churning loss & cavitation risk.`;
    viscAction = `Step down toward ${equipment.recommendedVg} or preheat sump before full load.`;
  } else if (nu > equipment.targetViscosityMax) {
    viscSeverity = 'warning';
    viscSummary = `High viscosity (${nu.toFixed(1)} cSt): increased fluid drag and sluggish circulation.`;
    viscAction = `Monitor sump warm-up; consider ${equipment.recommendedVg} for normal operating temp.`;
  }
  flags.push({
    id: 'viscosity',
    title: 'Viscosity Grade Match',
    severity: viscSeverity,
    reading: `${nu.toFixed(1)} cSt @ ${tempC} °C`,
    summary: viscSummary,
    action: viscAction,
  });

  // 3. Abrasive Wear
  let wearSeverity: DiagnosisSeverity = 'normal';
  let wearSummary = `Cleanliness (${iso4406.codeString}) meets ${equipment.name} target (${iso4406.targetString}).`;
  let wearAction = 'Maintain existing filtration beta ratio.';
  if (wearLevel === 'severe' || iso4406.status === 'critical') {
    wearSeverity = 'critical';
    wearSummary = `High ferrous/abrasive debris (ISO ${iso4406.codeString}); active three-body wear.`;
    wearAction = 'Inspect magnetic plug & filter pleats, check alignment/load, flush system.';
  } else if (wearLevel === 'elevated' || iso4406.status === 'caution') {
    wearSeverity = 'warning';
    wearSummary = `Elevated particle count (ISO ${iso4406.codeString} vs ${iso4406.targetString} target).`;
    wearAction = 'Upgrade offline kidney-loop filtration and resample in 250 hours.';
  }
  flags.push({
    id: 'wear',
    title: 'Abrasive Wear & Debris',
    severity: wearSeverity,
    reading: `ISO ${iso4406.codeString}`,
    summary: wearSummary,
    action: wearAction,
  });

  // 4. Thermal Oxidation (Arrhenius: every +10 °C above 60 °C halves oil life)
  const overBase = Math.max(0, tempC - 60);
  const thermalFactor = Math.pow(0.5, overBase / 10);
  const waterOxidationFactor = waterPpm > 500 ? 0.75 : 1.0;
  const estimatedOilLifePct = Math.max(8, Math.min(100, Math.round(thermalFactor * waterOxidationFactor * 100)));

  let oxSeverity: DiagnosisSeverity = 'normal';
  let oxSummary = `Bulk oil temp (${tempC} °C) is within safe oxidation envelope (< ${equipment.maxSafeTemp} °C).`;
  let oxAction = 'Standard drain interval applies.';
  if (tempC >= equipment.maxSafeTemp + 10) {
    oxSeverity = 'critical';
    oxSummary = `Severe thermal stress (${tempC} °C): rapid TAN spike, varnish & sludge formation.`;
    oxAction = 'Clean heat exchanger immediately; test TAN/RULER and shorten drain interval by 75%.';
  } else if (tempC >= equipment.maxSafeTemp) {
    oxSeverity = 'warning';
    oxSummary = `Elevated bulk temp (${tempC} °C): Arrhenius oxidation rate doubled vs 60 °C baseline.`;
    oxAction = 'Check cooling fan/water flow and monitor Acid Number (TAN).';
  }
  flags.push({
    id: 'oxidation',
    title: 'Thermal Oxidation',
    severity: oxSeverity,
    reading: `${tempC} °C (~${estimatedOilLifePct}% base life)`,
    summary: oxSummary,
    action: oxAction,
  });

  const hasCritical = flags.some((f) => f.severity === 'critical');
  const hasWarning = flags.some((f) => f.severity === 'warning');
  const overallHealth: DiagnosisSeverity = hasCritical
    ? 'critical'
    : hasWarning
      ? 'warning'
      : 'normal';

  return {
    overallHealth,
    estimatedOilLifePct,
    flags,
  };
}

export interface GreaseCalcResult {
  quantityGrams: number;
  intervalHours: number;
  bearingFactorK: number;
  tempFactor: number;
}

/**
 * Calculates grease relubrication quantity G = 0.005 * D * B (grams)
 * and interval t_f (hours) using speed-diameter factor n * d_m with
 * bearing type factor (K) and temperature derating (halves every 15 °C above 70 °C).
 */
export function computeGreaseRelubrication(
  outerDiameterMm: number,
  widthMm: number,
  rpm: number,
  tempC: number,
  bearingType: BearingType,
): GreaseCalcResult {
  const quantityGrams = 0.005 * outerDiameterMm * widthMm;

  const bearingFactorK =
    bearingType === 'ball' ? 1.0 : bearingType === 'cylindrical' ? 0.5 : 0.25;

  // Approximate pitch diameter d_m ~ 0.72 * D
  const dm = 0.72 * outerDiameterMm;
  const ndm = Math.max(10000, rpm * dm);

  // Empirical SKF-style base interval curve (hours) for ball bearings at 70 °C
  const baseBallHours = Math.max(400, Math.min(25000, (14e6 / Math.pow(ndm, 0.92)) * 0.45));

  // Temperature derating: halves every 15 °C above 70 °C
  const tempOver70 = Math.max(0, tempC - 70);
  const tempFactor = Math.pow(0.5, tempOver70 / 15);

  const intervalHours = Math.max(100, Math.round(baseBallHours * bearingFactorK * tempFactor));

  return {
    quantityGrams,
    intervalHours,
    bearingFactorK,
    tempFactor,
  };
}
