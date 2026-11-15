import {
  bearingEquivalentLoad,
  bearingLifeHours,
  bearingLifeMillionsRevs,
  degToRad,
} from '../../physics';

export type BearingId = '6206' | '6308' | 'nu208' | '30208' | '22210';

export type BearingCategory =
  | 'deep-groove-ball'
  | 'cylindrical-roller'
  | 'tapered-roller'
  | 'spherical-roller';

export type ShaftFitCode = 'g6' | 'h6' | 'k5' | 'm5';
export type HousingFitCode = 'H7' | 'J7' | 'N7';

export interface BearingSpec {
  id: BearingId;
  designation: string;
  name: string;
  category: BearingCategory;
  /** Bore diameter d (mm) */
  d: number;
  /** Outer diameter D (mm) */
  D: number;
  /** Width B (mm) */
  B: number;
  /** Basic dynamic load rating C (kN) */
  C: number;
  /** Basic static load rating C0 (kN) */
  C0: number;
  /** Life exponent p (3 for ball, 10/3 for roller) */
  p: number;
  /** Number of rolling elements in primary row */
  numElements: number;
  /** Pitch diameter Dm (mm) */
  pitchDiameterMm: number;
  /** Rolling element diameter Bd (mm) */
  elementDiameterMm: number;
  /** Nominal contact angle (degrees) */
  contactAngleDeg: number;
  /** Limiting speed (RPM) with grease/oil */
  limitingRpm: number;
  /** Calculation factor f0 (for deep groove ball) */
  f0?: number;
  /** Axial calculation threshold e (for roller bearings) */
  e?: number;
  /** Radial/axial factors */
  X?: number;
  Y?: number;
  Y1?: number;
  Y2?: number;
  supportsAxial: boolean;
  notes: string;
}

export const BEARING_CATALOG: BearingSpec[] = [
  {
    id: '6206',
    designation: '6206',
    name: 'Deep Groove Ball (6206)',
    category: 'deep-groove-ball',
    d: 30,
    D: 62,
    B: 16,
    C: 20.3,
    C0: 11.2,
    p: 3,
    numElements: 9,
    pitchDiameterMm: 46,
    elementDiameterMm: 9.525,
    contactAngleDeg: 0,
    limitingRpm: 13000,
    f0: 13.8,
    supportsAxial: true,
    notes: 'Versatile light-series ball bearing for moderate radial and bi-directional axial loads.',
  },
  {
    id: '6308',
    designation: '6308',
    name: 'Deep Groove Ball (6308)',
    category: 'deep-groove-ball',
    d: 40,
    D: 90,
    B: 23,
    C: 42.3,
    C0: 24.0,
    p: 3,
    numElements: 8,
    pitchDiameterMm: 65,
    elementDiameterMm: 15.08,
    contactAngleDeg: 0,
    limitingRpm: 9500,
    f0: 13.2,
    supportsAxial: true,
    notes: 'Medium-series ball bearing with higher radial and axial capacity for industrial motors.',
  },
  {
    id: 'nu208',
    designation: 'NU 208',
    name: 'Cylindrical Roller (NU 208)',
    category: 'cylindrical-roller',
    d: 40,
    D: 80,
    B: 18,
    C: 53.9,
    C0: 53.0,
    p: 10 / 3,
    numElements: 13,
    pitchDiameterMm: 60,
    elementDiameterMm: 11.0,
    contactAngleDeg: 0,
    limitingRpm: 10000,
    supportsAxial: false,
    notes: 'Non-locating bearing with separable inner ring; high radial capacity, zero axial load capacity.',
  },
  {
    id: '30208',
    designation: '30208',
    name: 'Tapered Roller (30208)',
    category: 'tapered-roller',
    d: 40,
    D: 80,
    B: 19.75,
    C: 61.6,
    C0: 68.0,
    p: 10 / 3,
    numElements: 17,
    pitchDiameterMm: 60,
    elementDiameterMm: 9.5,
    contactAngleDeg: 14,
    limitingRpm: 8500,
    e: 0.37,
    X: 0.4,
    Y: 1.6,
    supportsAxial: true,
    notes: 'Handles combined heavy radial and single-direction axial loads; commonly mounted in pairs.',
  },
  {
    id: '22210',
    designation: '22210',
    name: 'Spherical Roller (22210)',
    category: 'spherical-roller',
    d: 50,
    D: 90,
    B: 23,
    C: 104.0,
    C0: 108.0,
    p: 10 / 3,
    numElements: 18,
    pitchDiameterMm: 70,
    elementDiameterMm: 11.0,
    contactAngleDeg: 9,
    limitingRpm: 7500,
    e: 0.24,
    Y1: 2.8,
    Y2: 4.2,
    supportsAxial: true,
    notes: 'Double-row self-aligning roller bearing for heavy shock loads and shaft deflection.',
  },
];

export interface FitOption<T extends string> {
  code: T;
  label: string;
  typicalUse: string;
}

export const SHAFT_FIT_OPTIONS: FitOption<ShaftFitCode>[] = [
  {
    code: 'g6',
    label: 'g6 (Clearance)',
    typicalUse: 'Stationary inner ring load or easy axial sliding',
  },
  {
    code: 'h6',
    label: 'h6 (Close Clearance / Transition)',
    typicalUse: 'Light indeterminate load with non-rotating inner ring',
  },
  {
    code: 'k5',
    label: 'k5 (Light Interference)',
    typicalUse: 'Rotating inner ring load — standard ball/roller bearings',
  },
  {
    code: 'm5',
    label: 'm5 (Medium Interference)',
    typicalUse: 'Heavy radial/shock loads on rotating inner ring',
  },
];

export const HOUSING_FIT_OPTIONS: FitOption<HousingFitCode>[] = [
  {
    code: 'H7',
    label: 'H7 (Clearance)',
    typicalUse: 'Stationary outer ring load; allows axial float',
  },
  {
    code: 'J7',
    label: 'J7 (Transition)',
    typicalUse: 'Indeterminate outer ring load or slight axial location',
  },
  {
    code: 'N7',
    label: 'N7 (Interference)',
    typicalUse: 'Rotating outer ring load (e.g., wheel hub / pulley)',
  },
];

interface ToleranceBand {
  /** Upper deviation in µm */
  es: number;
  /** Lower deviation in µm */
  ei: number;
}

function getBearingBoreTol(d: number): ToleranceBand {
  if (d <= 30) return { es: 0, ei: -10 };
  return { es: 0, ei: -12 }; // 30 < d <= 50
}

function getBearingOdTol(D: number): ToleranceBand {
  if (D <= 80) return { es: 0, ei: -13 }; // 50 < D <= 80
  return { es: 0, ei: -15 }; // 80 < D <= 120
}

function getShaftTol(d: number, code: ShaftFitCode): ToleranceBand {
  if (d <= 30) {
    // 18 < d <= 30
    switch (code) {
      case 'g6':
        return { es: -7, ei: -20 };
      case 'h6':
        return { es: 0, ei: -13 };
      case 'k5':
        return { es: 11, ei: 2 };
      case 'm5':
        return { es: 17, ei: 8 };
    }
  }
  // 30 < d <= 50
  switch (code) {
    case 'g6':
      return { es: -9, ei: -25 };
    case 'h6':
      return { es: 0, ei: -16 };
    case 'k5':
      return { es: 13, ei: 2 };
    case 'm5':
      return { es: 20, ei: 9 };
  }
}

function getHousingTol(D: number, code: HousingFitCode): ToleranceBand {
  if (D <= 80) {
    // 50 < D <= 80
    switch (code) {
      case 'H7':
        return { es: 30, ei: 0 };
      case 'J7':
        return { es: 18, ei: -12 };
      case 'N7':
        return { es: -9, ei: -39 };
    }
  }
  // 80 < D <= 120
  switch (code) {
    case 'H7':
      return { es: 35, ei: 0 };
    case 'J7':
      return { es: 22, ei: -13 };
    case 'N7':
      return { es: -10, ei: -45 };
  }
}

export type FitClassification =
  | 'Clearance Fit'
  | 'Transition Fit'
  | 'Interference Fit';

export interface FitPairResult {
  code: string;
  /** Positive = clearance (µm), Negative = interference (µm) */
  minClearanceUm: number;
  maxClearanceUm: number;
  meanClearanceUm: number;
  classification: FitClassification;
}

export interface FitAnalysis {
  shaft: FitPairResult;
  housing: FitPairResult;
  /** Estimated internal radial clearance reduction from interference (µm) */
  clearanceReductionUm: number;
  overallLabel: string;
}

function classifyFit(minCl: number, maxCl: number): FitClassification {
  if (minCl >= 0) return 'Clearance Fit';
  if (maxCl <= 0) return 'Interference Fit';
  return 'Transition Fit';
}

export function calculateFitMetrics(
  spec: BearingSpec,
  shaftFit: ShaftFitCode,
  housingFit: HousingFitCode
): FitAnalysis {
  const boreTol = getBearingBoreTol(spec.d);
  const shaftTol = getShaftTol(spec.d, shaftFit);
  // Clearance = D_bore - d_shaft
  const shaftMinCl = boreTol.ei - shaftTol.es;
  const shaftMaxCl = boreTol.es - shaftTol.ei;
  const shaftMeanCl = (shaftMinCl + shaftMaxCl) / 2;
  const shaftClass = classifyFit(shaftMinCl, shaftMaxCl);

  const odTol = getBearingOdTol(spec.D);
  const housingTol = getHousingTol(spec.D, housingFit);
  // Clearance = D_housing - D_od
  const housingMinCl = housingTol.ei - odTol.es;
  const housingMaxCl = housingTol.es - odTol.ei;
  const housingMeanCl = (housingMinCl + housingMaxCl) / 2;
  const housingClass = classifyFit(housingMinCl, housingMaxCl);

  const shaftInterference = Math.max(0, -shaftMeanCl);
  const housingInterference = Math.max(0, -housingMeanCl);
  const clearanceReductionUm = Math.round(
    0.8 * shaftInterference + 0.6 * housingInterference
  );

  const overallLabel = `${shaftFit} (${shaftClass.replace(' Fit', '')}) / ${housingFit} (${housingClass.replace(' Fit', '')})`;

  return {
    shaft: {
      code: shaftFit,
      minClearanceUm: shaftMinCl,
      maxClearanceUm: shaftMaxCl,
      meanClearanceUm: shaftMeanCl,
      classification: shaftClass,
    },
    housing: {
      code: housingFit,
      minClearanceUm: housingMinCl,
      maxClearanceUm: housingMaxCl,
      meanClearanceUm: housingMeanCl,
      classification: housingClass,
    },
    clearanceReductionUm,
    overallLabel,
  };
}

// Deep Groove Ball ISO 281 table for e and Y
const DGB_FACTOR_TABLE = [
  { ratio: 0.172, e: 0.19, Y: 2.3 },
  { ratio: 0.345, e: 0.22, Y: 1.99 },
  { ratio: 0.689, e: 0.26, Y: 1.71 },
  { ratio: 1.03, e: 0.28, Y: 1.55 },
  { ratio: 1.38, e: 0.3, Y: 1.45 },
  { ratio: 2.07, e: 0.34, Y: 1.31 },
  { ratio: 3.45, e: 0.38, Y: 1.15 },
  { ratio: 5.17, e: 0.42, Y: 1.04 },
  { ratio: 6.89, e: 0.44, Y: 1.0 },
];

function interpolateDgbFactors(f0FaOverC0: number): { e: number; Y: number } {
  if (f0FaOverC0 <= DGB_FACTOR_TABLE[0].ratio) {
    return { e: DGB_FACTOR_TABLE[0].e, Y: DGB_FACTOR_TABLE[0].Y };
  }
  const last = DGB_FACTOR_TABLE[DGB_FACTOR_TABLE.length - 1];
  if (f0FaOverC0 >= last.ratio) {
    return { e: last.e, Y: last.Y };
  }
  for (let i = 0; i < DGB_FACTOR_TABLE.length - 1; i++) {
    const a = DGB_FACTOR_TABLE[i];
    const b = DGB_FACTOR_TABLE[i + 1];
    if (f0FaOverC0 >= a.ratio && f0FaOverC0 <= b.ratio) {
      const t = (f0FaOverC0 - a.ratio) / (b.ratio - a.ratio);
      return {
        e: a.e + t * (b.e - a.e),
        Y: a.Y + t * (b.Y - a.Y),
      };
    }
  }
  return { e: 0.28, Y: 1.55 };
}

export type ConditionSeverity = 'healthy' | 'warning' | 'critical';

export interface BearingWarning {
  severity: ConditionSeverity;
  title: string;
  detail: string;
}

export interface BearingMetrics {
  /** Equivalent dynamic load P (kN) */
  P: number;
  /** Equivalent static load P0 (kN) */
  P0: number;
  /** Radial factor X */
  X: number;
  /** Axial factor Y */
  Y: number;
  /** Axial/radial ratio threshold e */
  e: number;
  /** Basic rating life L10 (million revolutions) */
  L10: number;
  /** Basic rating life L10h (hours) */
  L10h: number;
  /** Modified rating life L10ha = a_ISO * L10h (hours) */
  L10ha: number;
  /** Static safety factor s0 = C0 / P0 */
  s0: number;
  /** Max rolling element load Q_max (kN) */
  qMax: number;
  /** Fit analysis */
  fit: FitAnalysis;
  /** Overall condition status */
  severity: ConditionSeverity;
  warnings: BearingWarning[];
}

export function calculateBearingMetrics(params: {
  spec: BearingSpec;
  Fr: number;
  Fa: number;
  rpm: number;
  aIso: number;
  shaftFit: ShaftFitCode;
  housingFit: HousingFitCode;
}): BearingMetrics {
  const { spec, Fr, Fa, rpm, aIso, shaftFit, housingFit } = params;
  const safeFr = Math.max(0.05, Fr);
  const safeFa = Math.max(0, Fa);
  const safeRpm = Math.max(10, rpm);

  let X = 1.0;
  let Y = 0;
  let e = 0;
  let P = safeFr;
  let P0 = safeFr;

  if (spec.category === 'deep-groove-ball') {
    const f0 = spec.f0 ?? 13.5;
    const ratio = (f0 * safeFa) / spec.C0;
    const factors = interpolateDgbFactors(ratio);
    e = factors.e;
    if (safeFa / safeFr <= e) {
      X = 1.0;
      Y = 0;
    } else {
      X = 0.56;
      Y = factors.Y;
    }
    P = bearingEquivalentLoad(safeFr * 1000, safeFa * 1000, X, Y) / 1000;
    P0 = Math.max(safeFr, 0.6 * safeFr + 0.5 * safeFa);
  } else if (spec.category === 'cylindrical-roller') {
    X = 1.0;
    Y = 0;
    e = 0;
    P = bearingEquivalentLoad(safeFr * 1000, safeFa * 1000, X, Y) / 1000;
    P0 = safeFr;
  } else if (spec.category === 'tapered-roller') {
    e = spec.e ?? 0.37;
    if (safeFa / safeFr <= e) {
      X = 1.0;
      Y = 0;
    } else {
      X = spec.X ?? 0.4;
      Y = spec.Y ?? 1.6;
    }
    P = bearingEquivalentLoad(safeFr * 1000, safeFa * 1000, X, Y) / 1000;
    P0 = Math.max(safeFr, 0.5 * safeFr + 0.9 * safeFa);
  } else if (spec.category === 'spherical-roller') {
    e = spec.e ?? 0.24;
    if (safeFa / safeFr <= e) {
      X = 1.0;
      Y = spec.Y1 ?? 2.8;
    } else {
      X = 0.67;
      Y = spec.Y2 ?? 4.2;
    }
    P = bearingEquivalentLoad(safeFr * 1000, safeFa * 1000, X, Y) / 1000;
    P0 = safeFr + (spec.Y1 ?? 2.8) * safeFa;
  }

  const L10 = bearingLifeMillionsRevs(
    spec.C * 1000,
    P * 1000,
    spec.category === 'deep-groove-ball' ? 'ball' : 'roller'
  );
  const L10h = bearingLifeHours(L10, safeRpm);
  const L10ha = aIso * L10h;
  const s0 = spec.C0 / P0;

  // Approximate Stribeck max rolling-element load Q_max = 4.37 * Fr / Z (ball) or 4.08 * Fr / Z (roller)
  const stribeckFactor = spec.category === 'deep-groove-ball' ? 4.37 : 4.08;
  const qMax = (stribeckFactor * safeFr) / spec.numElements;

  const fit = calculateFitMetrics(spec, shaftFit, housingFit);

  const warnings: BearingWarning[] = [];

  if (!spec.supportsAxial && safeFa > 0.05) {
    warnings.push({
      severity: 'critical',
      title: 'Unsupported Axial Load on NU Bearing',
      detail: `${spec.designation} has no inner-ring ribs and cannot carry axial load (Fa = ${safeFa.toFixed(1)} kN). Switch to 30208, 22210, or Deep Groove Ball.`,
    });
  }

  if (s0 < 1.0) {
    warnings.push({
      severity: 'critical',
      title: 'Static Overload (s0 < 1.0)',
      detail: `Static safety factor s0 = ${s0.toFixed(2)} is below 1.0. Risk of permanent raceway brinelling.`,
    });
  } else if (s0 < 1.5) {
    warnings.push({
      severity: 'warning',
      title: 'Low Static Safety Margin',
      detail: `s0 = ${s0.toFixed(2)} is below recommended 1.5 for normal industrial service.`,
    });
  }

  if (L10ha < 3000) {
    warnings.push({
      severity: 'critical',
      title: 'Severe Fatigue Overload',
      detail: `Modified life L10ha = ${Math.round(L10ha).toLocaleString()} h is critically short (< 3,000 h). Reduce load or upsize bearing.`,
    });
  } else if (L10ha < 10000) {
    warnings.push({
      severity: 'warning',
      title: 'Short Operating Life',
      detail: `Modified life L10ha = ${Math.round(L10ha).toLocaleString()} h is below typical 10,000–25,000 h industrial target.`,
    });
  }

  if (safeRpm > spec.limitingRpm * 0.85) {
    warnings.push({
      severity: safeRpm > spec.limitingRpm ? 'critical' : 'warning',
      title:
        safeRpm > spec.limitingRpm
          ? 'Exceeds Limiting Speed'
          : 'High Thermal Speed Zone',
      detail: `${safeRpm.toLocaleString()} RPM vs ${spec.limitingRpm.toLocaleString()} RPM limit — elevated friction temperature reduces internal clearance.`,
    });
  }

  if (fit.shaft.classification === 'Clearance Fit') {
    warnings.push({
      severity: 'warning',
      title: `Loose Shaft Fit (${shaftFit})`,
      detail: `Clearance fit (+${fit.shaft.meanClearanceUm.toFixed(1)} µm mean) on a rotating inner ring risks ring creep and fretting corrosion.`,
    });
  }

  if (fit.clearanceReductionUm >= 22) {
    warnings.push({
      severity: 'warning',
      title: 'Excessive Interference / Clearance Loss',
      detail: `Combined shaft (${shaftFit}) + housing (${housingFit}) interference reduces internal clearance by ~${fit.clearanceReductionUm} µm; risk of thermal preload.`,
    });
  }

  if (aIso < 0.6) {
    warnings.push({
      severity: 'warning',
      title: 'Poor Lubrication / Contamination',
      detail: `a_ISO = ${aIso.toFixed(2)} indicates thin oil film or particle contamination, accelerating surface fatigue.`,
    });
  }

  let severity: ConditionSeverity = 'healthy';
  if (warnings.some((w) => w.severity === 'critical')) {
    severity = 'critical';
  } else if (warnings.length > 0) {
    severity = 'warning';
  }

  return {
    P,
    P0,
    X,
    Y,
    e,
    L10,
    L10h,
    L10ha,
    s0,
    qMax,
    fit,
    severity,
    warnings,
  };
}

/**
 * Compute normalized load [0..1] on each rolling element at angle thetaDeg (0 = bottom 6 o'clock, direction of Fr).
 */
export function computeElementLoads(
  numElements: number,
  rotationRad: number,
  clearanceReductionUm: number,
  loadRatio: number
): { angleRad: number; normLoad: number }[] {
  // Normal radial clearance gives load zone parameter epsilon ~ 0.5 (+/- 90 deg).
  // Heavy interference increases epsilon toward 0.75 (wider load zone / preload).
  const epsilon = Math.min(
    0.85,
    Math.max(0.42, 0.5 + (clearanceReductionUm - 10) * 0.012)
  );
  const results: { angleRad: number; normLoad: number }[] = [];
  for (let i = 0; i < numElements; i++) {
    const angleRad = rotationRad + (i * 2 * Math.PI) / numElements;
    // Bottom is +PI/2 in SVG coordinates (x=cos, y=sin -> bottom is sin=1 -> +PI/2)
    const psi = angleRad - Math.PI / 2;
    const cosPsi = Math.cos(psi);
    const term = 1 - (1 / (2 * epsilon)) * (1 - cosPsi);
    const raw = term > 0 ? Math.pow(term, 1.5) : 0;
    const normLoad = Math.min(1, raw * Math.min(1.25, 0.45 + loadRatio * 0.65));
    results.push({ angleRad, normLoad });
  }
  return results;
}

export type BearingHealthState =
  | 'healthy'
  | 'bpfo'
  | 'bpfi'
  | 'lube-starvation';

export type IsoSeverityZone = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D';

export interface FftPoint {
  freqHz: number;
  ampMmS: number;
}

export interface FftMarker {
  label: string;
  freqHz: number;
  ampMmS: number;
  kind: 'shaft' | 'bpfo' | 'bpfi' | 'bsf' | 'ftf';
}

export interface WaveformPoint {
  timeMs: number;
  gE: number;
}

export interface ConditionMonitoringData {
  healthState: BearingHealthState;
  shaftHz: number;
  ftfHz: number;
  bpfoHz: number;
  bpfiHz: number;
  bsfHz: number;
  rmsVelocityMmS: number;
  isoZone: IsoSeverityZone;
  isoLabel: string;
  housingTempC: number;
  acousticStatus: string;
  maxFreqHz: number;
  spectrum: FftPoint[];
  markers: FftMarker[];
  waveformDurationMs: number;
  waveform: WaveformPoint[];
  impactPeriodMs: number | null;
  peakGe: number;
}

export function computeConditionMonitoring(params: {
  spec: BearingSpec;
  rpm: number;
  P: number;
  aIso: number;
  clearanceReductionUm: number;
  healthState: BearingHealthState;
}): ConditionMonitoringData {
  const { spec, rpm, P, aIso, clearanceReductionUm, healthState } = params;
  const shaftHz = Math.max(1, rpm) / 60;
  const cosAlpha = Math.cos(degToRad(spec.contactAngleDeg));
  const lambda = (spec.elementDiameterMm / spec.pitchDiameterMm) * cosAlpha;

  const ftfHz = 0.5 * shaftHz * (1 - lambda);
  const bpfoHz = 0.5 * spec.numElements * shaftHz * (1 - lambda);
  const bpfiHz = 0.5 * spec.numElements * shaftHz * (1 + lambda);
  const bsfHz =
    (spec.pitchDiameterMm / (2 * spec.elementDiameterMm)) *
    shaftHz *
    (1 - lambda * lambda);

  const loadFactor = Math.min(1.8, Math.max(0.4, P / (spec.C * 0.22)));
  const speedFactor = Math.min(1.6, Math.max(0.5, rpm / 1500));

  let rmsVelocityMmS = 1.05 * loadFactor * Math.sqrt(speedFactor);
  let acousticStatus = 'Smooth EHL Rolling (Normal)';
  let faultTempRise = 0;

  if (healthState === 'bpfo') {
    rmsVelocityMmS = 5.4 * loadFactor * (0.75 + 0.25 * speedFactor);
    acousticStatus = 'Periodic Outer-Race Spall Impacting';
    faultTempRise = 17;
  } else if (healthState === 'bpfi') {
    rmsVelocityMmS = 6.9 * loadFactor * (0.75 + 0.25 * speedFactor);
    acousticStatus = 'Modulated Inner-Race Impacting + Sidebands';
    faultTempRise = 21;
  } else if (healthState === 'lube-starvation') {
    rmsVelocityMmS = 3.9 * loadFactor * (0.7 + 0.3 * speedFactor);
    acousticStatus = 'High-Freq Metal-to-Metal Friction / Acoustic Floor';
    faultTempRise = 35;
  }

  // Clamp realistic range
  rmsVelocityMmS = Math.min(14.5, Math.max(0.45, rmsVelocityMmS));

  let isoZone: IsoSeverityZone = 'Zone A';
  let isoLabel = 'Good (New / Healthy)';
  if (rmsVelocityMmS > 7.1) {
    isoZone = 'Zone D';
    isoLabel = 'Unacceptable (Immediate Action)';
  } else if (rmsVelocityMmS > 4.5) {
    isoZone = 'Zone C';
    isoLabel = 'Unsatisfactory (Schedule Repair)';
  } else if (rmsVelocityMmS > 1.8) {
    isoZone = 'Zone B';
    isoLabel = 'Satisfactory (Monitor Closely)';
  }

  const baseAmbient = 28;
  const speedHeat = (rpm / 1500) * 11;
  const loadHeat = Math.min(20, (P / spec.C) * 32);
  const fitHeat = Math.max(0, (clearanceReductionUm - 12) * 0.45);
  const lubeHeat = aIso < 0.7 ? (0.7 - aIso) * 22 : 0;
  const housingTempC = Math.round(
    baseAmbient + speedHeat + loadHeat + fitHeat + lubeHeat + faultTempRise
  );

  const maxFreqHz = Math.max(400, Math.ceil((bpfiHz * 2.35) / 50) * 50);
  const numBins = 160;
  const binWidth = maxFreqHz / numBins;

  const peaks: { freq: number; amp: number; sigma: number }[] = [
    { freq: shaftHz, amp: 0.75 * speedFactor, sigma: maxFreqHz * 0.012 },
    { freq: shaftHz * 2, amp: 0.25 * speedFactor, sigma: maxFreqHz * 0.012 },
    { freq: ftfHz, amp: 0.12, sigma: maxFreqHz * 0.012 },
    { freq: bsfHz, amp: 0.16, sigma: maxFreqHz * 0.014 },
    { freq: bpfoHz, amp: 0.22, sigma: maxFreqHz * 0.014 },
    { freq: bpfiHz, amp: 0.2, sigma: maxFreqHz * 0.014 },
  ];

  if (healthState === 'bpfo') {
    peaks.push(
      { freq: bpfoHz, amp: 4.8 * loadFactor, sigma: maxFreqHz * 0.013 },
      { freq: bpfoHz * 2, amp: 2.6 * loadFactor, sigma: maxFreqHz * 0.015 },
      { freq: bpfoHz * 3, amp: 1.1 * loadFactor, sigma: maxFreqHz * 0.017 }
    );
  } else if (healthState === 'bpfi') {
    peaks.push(
      { freq: bpfiHz, amp: 5.6 * loadFactor, sigma: maxFreqHz * 0.013 },
      {
        freq: Math.max(5, bpfiHz - shaftHz),
        amp: 2.1 * loadFactor,
        sigma: maxFreqHz * 0.012,
      },
      { freq: bpfiHz + shaftHz, amp: 2.0 * loadFactor, sigma: maxFreqHz * 0.012 },
      { freq: bpfiHz * 2, amp: 2.4 * loadFactor, sigma: maxFreqHz * 0.016 }
    );
  } else if (healthState === 'lube-starvation') {
    peaks.push(
      { freq: bsfHz, amp: 1.4 * loadFactor, sigma: maxFreqHz * 0.025 },
      { freq: bpfoHz, amp: 1.1 * loadFactor, sigma: maxFreqHz * 0.025 },
      { freq: bpfiHz, amp: 1.2 * loadFactor, sigma: maxFreqHz * 0.025 }
    );
  }

  const spectrum: FftPoint[] = [];
  for (let i = 0; i <= numBins; i++) {
    const f = i * binWidth;
    // Broadband floor: elevated high-frequency carpet for lube-starvation
    let amp =
      healthState === 'lube-starvation'
        ? 0.45 + 1.35 * Math.pow(f / maxFreqHz, 1.15)
        : 0.08 + 0.06 * Math.sin(i * 1.7) * Math.sin(i * 0.4);
    amp = Math.max(0.05, amp);

    for (const pk of peaks) {
      const d = (f - pk.freq) / pk.sigma;
      amp += pk.amp * Math.exp(-0.5 * d * d);
    }
    spectrum.push({ freqHz: f, ampMmS: amp });
  }

  const sampleAt = (freq: number) => {
    const idx = Math.min(
      spectrum.length - 1,
      Math.max(0, Math.round(freq / binWidth))
    );
    return spectrum[idx]?.ampMmS ?? 0.2;
  };

  const markers: FftMarker[] = [
    { label: '1×', freqHz: shaftHz, ampMmS: sampleAt(shaftHz), kind: 'shaft' },
    { label: 'FTF', freqHz: ftfHz, ampMmS: sampleAt(ftfHz), kind: 'ftf' },
    { label: 'BSF', freqHz: bsfHz, ampMmS: sampleAt(bsfHz), kind: 'bsf' },
    { label: 'BPFO', freqHz: bpfoHz, ampMmS: sampleAt(bpfoHz), kind: 'bpfo' },
    { label: 'BPFI', freqHz: bpfiHz, ampMmS: sampleAt(bpfiHz), kind: 'bpfi' },
  ];

  // Time-Waveform / Envelope (gE) Shock-Pulse synthesis
  const shaftPeriodMs = 1000 / shaftHz;
  const waveformDurationMs = Math.min(180, Math.max(45, shaftPeriodMs * 1.6));
  const numTimePts = 180;
  const impactPeriodMs =
    healthState === 'bpfo'
      ? 1000 / bpfoHz
      : healthState === 'bpfi'
        ? 1000 / bpfiHz
        : null;

  const waveform: WaveformPoint[] = [];
  let peakGe = 0;

  for (let i = 0; i <= numTimePts; i++) {
    const tMs = (i / numTimePts) * waveformDurationMs;
    let gE =
      0.16 +
      0.07 * Math.abs(Math.sin(i * 1.9 + 0.4) * Math.cos(i * 0.7));

    if (healthState === 'lube-starvation') {
      gE =
        1.25 +
        0.95 * Math.abs(Math.sin(i * 2.7)) +
        0.55 * Math.abs(Math.cos(i * 4.3));
    } else if (impactPeriodMs !== null) {
      const phase = (tMs % impactPeriodMs) / impactPeriodMs;
      // Sharp shock impulse with exponential ring-down
      const impulse = Math.exp(-phase * 9.5) * (phase < 0.65 ? 1 : 0.25);
      const baseSpike = (healthState === 'bpfi' ? 7.2 : 5.8) * loadFactor;
      // BPFI modulates in and out of the bottom load zone at 1x shaft frequency
      const modulation =
        healthState === 'bpfi'
          ? 0.32 + 0.68 * Math.pow(0.5 + 0.5 * Math.sin((2 * Math.PI * tMs) / shaftPeriodMs), 1.5)
          : 0.92 + 0.08 * Math.sin(i * 0.9);
      gE += baseSpike * impulse * modulation;
    }

    if (gE > peakGe) peakGe = gE;
    waveform.push({ timeMs: tMs, gE });
  }

  return {
    healthState,
    shaftHz,
    ftfHz,
    bpfoHz,
    bpfiHz,
    bsfHz,
    rmsVelocityMmS,
    isoZone,
    isoLabel,
    housingTempC,
    acousticStatus,
    maxFreqHz,
    spectrum,
    markers,
    waveformDurationMs,
    waveform,
    impactPeriodMs,
    peakGe,
  };
}

export interface InductionHeaterPlan {
  recommendedTempC: number;
  maxSafeTempC: number;
  targetTempC: number;
  ambientTempC: number;
  /** Diametral bore expansion (µm) at targetTempC */
  expansionUm: number;
  /** Max shaft interference (µm) to overcome */
  maxInterferenceUm: number;
  /** Net slip-on clearance (µm) = expansionUm - maxInterferenceUm */
  slipClearanceUm: number;
  overMaxTemp: boolean;
  needsHeater: boolean;
}

export function computeInductionHeaterPlan(params: {
  spec: BearingSpec;
  fit: FitAnalysis;
  targetTempC: number;
  ambientTempC?: number;
}): InductionHeaterPlan {
  const { spec, fit, targetTempC, ambientTempC = 22 } = params;
  const recommendedTempC = 110;
  const maxSafeTempC = 125;
  const steelAlpha = 11.5e-6; // 1/K
  const deltaT = Math.max(0, targetTempC - ambientTempC);
  const expansionUm = steelAlpha * spec.d * deltaT * 1000;
  const maxInterferenceUm = Math.max(0, -fit.shaft.minClearanceUm);
  const slipClearanceUm = expansionUm - maxInterferenceUm;

  return {
    recommendedTempC,
    maxSafeTempC,
    targetTempC,
    ambientTempC,
    expansionUm,
    maxInterferenceUm,
    slipClearanceUm,
    overMaxTemp: targetTempC > maxSafeTempC,
    needsHeater: maxInterferenceUm > 0,
  };
}
