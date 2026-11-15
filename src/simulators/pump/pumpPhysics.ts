import {
  ATM_PA,
  G_ACCEL,
  hydraulicPower,
  kpaToPa,
  npshAvailable,
  paToKpa,
  wToKw,
} from '../../physics';

export interface PumpParams {
  rpm: number; // Impeller speed N (RPM), 900 - 2900
  valveOpening: number; // Discharge valve opening (%), 0 - 100
  suctionHead: number; // Suction tank level / static suction head Hs (m), -4.5 to +6.0
  fluidTempC: number; // Water temperature T (°C), 10 - 95
  impellerTrimPct: number; // Impeller diameter trim (%), 85 - 100
  parallelPumps: boolean; // Single pump vs Parallel Two-Pump mode
}

export type PumpCondition =
  | 'optimal'
  | 'cavitation'
  | 'deadhead'
  | 'low-flow'
  | 'runout';

export interface PumpOperatingPoint {
  flowM3h: number;
  perPumpFlowM3h: number;
  headM: number;
  efficiencyPct: number;
  hydraulicPowerKw: number;
  shaftPowerKw: number;
  npshaM: number;
  npshrM: number;
  npshMarginM: number;
  suctionPressureKpa: number;
  dischargePressureKpa: number;
  vaporPressureKpa: number;
  densityKgM3: number;
  bepFlowM3h: number;
  bepHeadM: number;
  porMinFlowM3h: number;
  porMaxFlowM3h: number;
  inPor: boolean;
  shutoffHeadM: number;
  maxFlowM3h: number;
  radialLoadPct: number;
  sealLifePct: number;
  condition: PumpCondition;
  isCavitating: boolean;
  isDeadHead: boolean;
  sealRisk: 'normal' | 'elevated' | 'critical';
}

export interface PumpCurvePoint {
  q: number;
  pumpHead: number;
  ratedHead: number;
  systemHead: number | null;
  efficiency: number;
  npshr: number;
}

export interface PumpPreset {
  id: string;
  label: string;
  description: string;
  params: PumpParams;
}

export const RATED_RPM = 1750;
export const RATED_SHUTOFF_HEAD_M = 42.0;
export const RATED_BEP_FLOW_M3H = 90.0;
export const RATED_MAX_FLOW_M3H = 140.0;
export const MAX_EFFICIENCY_PCT = 82.0;
export const DISCHARGE_STATIC_HEAD_M = 12.0; // Discharge tank elevation above pump centerline
export const ATMOSPHERIC_PRESSURE_KPA = paToKpa(ATM_PA);
export const GRAVITY = G_ACCEL;

// Pump curve coefficient k_p0 = H_shutoff / Q_max^2 (invariant with RPM & trim)
const K_PUMP = RATED_SHUTOFF_HEAD_M / (RATED_MAX_FLOW_M3H * RATED_MAX_FLOW_M3H);
const K_SUCTION_LOSS = 0.00018;
const K_PIPE_LOSS = 0.0012;

export const PUMP_PRESETS: PumpPreset[] = [
  {
    id: 'bep-nominal',
    label: 'Nominal BEP',
    description: '1750 RPM, 100% trim, 100% valve open, +2.0 m flooded suction at 20 °C',
    params: {
      rpm: 1750,
      valveOpening: 100,
      suctionHead: 2.0,
      fluidTempC: 20,
      impellerTrimPct: 100,
      parallelPumps: false,
    },
  },
  {
    id: 'throttled',
    label: 'Throttled (40%)',
    description: 'Discharge valve partially closed, shifting operating point left of POR',
    params: {
      rpm: 1750,
      valveOpening: 40,
      suctionHead: 2.0,
      fluidTempC: 25,
      impellerTrimPct: 100,
      parallelPumps: false,
    },
  },
  {
    id: 'dead-head',
    label: 'Dead-Head (0%)',
    description: 'Closed discharge valve causing churning, high radial load, and seal overheating',
    params: {
      rpm: 1750,
      valveOpening: 0,
      suctionHead: 2.0,
      fluidTempC: 30,
      impellerTrimPct: 100,
      parallelPumps: false,
    },
  },
  {
    id: 'cavitation-temp',
    label: 'Hot Water Cavitation',
    description: 'High fluid temperature (82 °C) raises vapor pressure above suction head',
    params: {
      rpm: 1950,
      valveOpening: 95,
      suctionHead: -0.5,
      fluidTempC: 82,
      impellerTrimPct: 100,
      parallelPumps: false,
    },
  },
  {
    id: 'cavitation-lift',
    label: 'Suction Lift Cavitation',
    description: 'Excessive suction lift (-4.0 m) + high speed drops NPSHa below NPSHr',
    params: {
      rpm: 2300,
      valveOpening: 100,
      suctionHead: -4.0,
      fluidTempC: 35,
      impellerTrimPct: 100,
      parallelPumps: false,
    },
  },
  {
    id: 'parallel-boost',
    label: 'Parallel 2-Pump',
    description: 'Two identical pumps in parallel against system curve for higher capacity',
    params: {
      rpm: 1750,
      valveOpening: 100,
      suctionHead: 2.5,
      fluidTempC: 20,
      impellerTrimPct: 100,
      parallelPumps: true,
    },
  },
  {
    id: 'trimmed-90',
    label: '90% Trimmed Impeller',
    description: 'Diameter trimmed to 90% to match lower system demand without throttling',
    params: {
      rpm: 1750,
      valveOpening: 100,
      suctionHead: 2.0,
      fluidTempC: 20,
      impellerTrimPct: 90,
      parallelPumps: false,
    },
  },
];

/**
 * Water vapor pressure in kPa using Antoine equation (valid 1–100 °C).
 */
export function computeVaporPressureKpa(tempC: number): number {
  const clamped = Math.max(1, Math.min(100, tempC));
  const log10PmmHg = 8.07131 - 1730.63 / (233.426 + clamped);
  const pMmHg = Math.pow(10, log10PmmHg);
  return pMmHg * 0.133322;
}

/**
 * Approximate water density in kg/m³ as a function of temperature (°C).
 */
export function computeWaterDensity(tempC: number): number {
  const clamped = Math.max(0, Math.min(100, tempC));
  return 1000.0 - 0.0045 * Math.pow(clamped - 4, 2);
}

/**
 * System valve resistance coefficient k_valve(opening%).
 */
export function computeValveK(valveOpeningPct: number): number {
  if (valveOpeningPct <= 0) return Infinity;
  const ratio = 100 / Math.max(1, valveOpeningPct);
  return 0.0004 * Math.pow(ratio, 2.2);
}

export function computePumpHeadAtFlow(
  qTotalM3h: number,
  rpm: number,
  impellerTrimPct = 100,
  parallelPumps = false
): number {
  const speedRatio = rpm / RATED_RPM;
  const trimRatio = impellerTrimPct / 100;
  const shutoff = RATED_SHUTOFF_HEAD_M * Math.pow(speedRatio * trimRatio, 2);
  const qPerPump = parallelPumps ? qTotalM3h / 2 : qTotalM3h;
  return Math.max(0, shutoff - K_PUMP * qPerPump * qPerPump);
}

export function computeEfficiencyAtFlow(
  qTotalM3h: number,
  rpm: number,
  impellerTrimPct = 100,
  parallelPumps = false
): number {
  if (qTotalM3h <= 0) return 0;
  const speedRatio = rpm / RATED_RPM;
  const trimRatio = impellerTrimPct / 100;
  const qPerPump = parallelPumps ? qTotalM3h / 2 : qTotalM3h;
  const bepQSingle = RATED_BEP_FLOW_M3H * speedRatio * trimRatio;
  const peakEta = MAX_EFFICIENCY_PCT - (100 - impellerTrimPct) * 0.25;
  const rel = (qPerPump - bepQSingle) / bepQSingle;
  const eta = peakEta * (1 - rel * rel);
  return Math.max(0, Math.min(peakEta, eta));
}

export function computeNpshrAtFlow(
  qPerPumpM3h: number,
  rpm: number,
  impellerTrimPct = 100
): number {
  const speedRatio = rpm / RATED_RPM;
  const trimPenalty = 1 + (100 - impellerTrimPct) * 0.008;
  return (1.6 * speedRatio * speedRatio + 0.00028 * qPerPumpM3h * qPerPumpM3h) * trimPenalty;
}

export function solvePumpOperatingPoint(params: PumpParams): PumpOperatingPoint {
  const { rpm, valveOpening, suctionHead, fluidTempC, impellerTrimPct, parallelPumps } = params;
  const pumpCount = parallelPumps ? 2 : 1;
  const speedRatio = rpm / RATED_RPM;
  const trimRatio = impellerTrimPct / 100;
  const combinedRatio = speedRatio * trimRatio;

  const shutoffHeadM = RATED_SHUTOFF_HEAD_M * combinedRatio * combinedRatio;
  const maxFlowM3h = RATED_MAX_FLOW_M3H * combinedRatio * pumpCount;
  const bepFlowM3h = RATED_BEP_FLOW_M3H * combinedRatio * pumpCount;
  const bepHeadM = computePumpHeadAtFlow(bepFlowM3h, rpm, impellerTrimPct, parallelPumps);
  const porMinFlowM3h = 0.7 * bepFlowM3h;
  const porMaxFlowM3h = 1.2 * bepFlowM3h;

  const staticHeadM = DISCHARGE_STATIC_HEAD_M - suctionHead;
  const densityKgM3 = computeWaterDensity(fluidTempC);
  const vaporPressureKpa = computeVaporPressureKpa(fluidTempC);

  let flowM3h = 0;
  let headM = shutoffHeadM;

  // In parallel mode, H_p(Q) = H_shutoff - (K_PUMP / 4) * Q^2
  const kPumpEffective = parallelPumps ? K_PUMP / 4 : K_PUMP;

  if (valveOpening > 0.5 && shutoffHeadM > staticHeadM) {
    const kSys = K_PIPE_LOSS + computeValveK(valveOpening);
    const qSquared = (shutoffHeadM - staticHeadM) / (kPumpEffective + kSys);
    flowM3h = qSquared > 0 ? Math.sqrt(qSquared) : 0;
    headM = computePumpHeadAtFlow(flowM3h, rpm, impellerTrimPct, parallelPumps);
  }

  const perPumpFlowM3h = flowM3h / pumpCount;
  const efficiencyPct = computeEfficiencyAtFlow(flowM3h, rpm, impellerTrimPct, parallelPumps);
  const flowM3s = flowM3h / 3600;
  const hydraulicPowerKw = wToKw(hydraulicPower(flowM3s, headM, densityKgM3));

  // At dead-head or ultra-low flow, churning losses consume ~35% of BEP shaft power per pump
  const bepHydPowerKw = wToKw(
    hydraulicPower(bepFlowM3h / 3600, bepHeadM, densityKgM3)
  );
  const minChurnPowerKw = 0.35 * (bepHydPowerKw / (MAX_EFFICIENCY_PCT / 100));

  const shaftPowerKw =
    flowM3h < 1 || efficiencyPct < 5
      ? minChurnPowerKw
      : Math.max(minChurnPowerKw * 0.7, hydraulicPowerKw / (efficiencyPct / 100));

  // NPSHa = (P_atm - P_v) / (rho * g) + H_s - h_f,suction (per pump branch)
  const suctionFrictionM = K_SUCTION_LOSS * perPumpFlowM3h * perPumpFlowM3h;
  const npshaM = npshAvailable(
    ATM_PA,
    kpaToPa(vaporPressureKpa),
    densityKgM3,
    suctionHead,
    suctionFrictionM
  );
  const npshrM = computeNpshrAtFlow(perPumpFlowM3h, rpm, impellerTrimPct);
  const npshMarginM = npshaM - npshrM;

  // Gauge pressures at pump flanges (kPa gauge)
  const suctionPressureKpa =
    ((suctionHead - suctionFrictionM) * densityKgM3 * GRAVITY) / 1000;
  const dischargePressureKpa =
    suctionPressureKpa + (headM * densityKgM3 * GRAVITY) / 1000;

  const isCavitating = npshaM < npshrM;
  const isDeadHead = valveOpening <= 2 || flowM3h < 2;
  const inPor = flowM3h >= porMinFlowM3h && flowM3h <= porMaxFlowM3h;

  // Radial shaft load & mechanical seal life index
  // Minimal at BEP (~15%), spikes to 100% at Q=0 due to volute pressure asymmetry
  const qRatio = bepFlowM3h > 0 ? flowM3h / bepFlowM3h : 0;
  const rawRadialLoad =
    qRatio <= 1
      ? 15 + 85 * Math.pow(1 - qRatio, 1.5)
      : 15 + 75 * Math.pow(qRatio - 1, 1.4);
  const radialLoadPct = Math.max(12, Math.min(100, rawRadialLoad));

  let sealLifePct = 100 - Math.max(0, radialLoadPct - 25) * 0.75;
  if (isDeadHead) sealLifePct = Math.min(sealLifePct, 12);
  if (isCavitating) sealLifePct = Math.max(8, sealLifePct - 35);
  if (fluidTempC > 75) sealLifePct = Math.max(10, sealLifePct - (fluidTempC - 75) * 0.8);
  sealLifePct = Math.max(5, Math.min(100, sealLifePct));

  let condition: PumpCondition = 'optimal';
  if (isCavitating) {
    condition = 'cavitation';
  } else if (isDeadHead) {
    condition = 'deadhead';
  } else if (flowM3h < porMinFlowM3h) {
    condition = 'low-flow';
  } else if (flowM3h > porMaxFlowM3h) {
    condition = 'runout';
  }

  let sealRisk: 'normal' | 'elevated' | 'critical' = 'normal';
  if (isDeadHead || (isCavitating && npshMarginM < -1.0) || sealLifePct < 35) {
    sealRisk = 'critical';
  } else if (isCavitating || !inPor || fluidTempC > 75 || sealLifePct < 70) {
    sealRisk = 'elevated';
  }

  return {
    flowM3h,
    perPumpFlowM3h,
    headM,
    efficiencyPct,
    hydraulicPowerKw,
    shaftPowerKw,
    npshaM,
    npshrM,
    npshMarginM,
    suctionPressureKpa,
    dischargePressureKpa,
    vaporPressureKpa,
    densityKgM3,
    bepFlowM3h,
    bepHeadM,
    porMinFlowM3h,
    porMaxFlowM3h,
    inPor,
    shutoffHeadM,
    maxFlowM3h,
    radialLoadPct,
    sealLifePct,
    condition,
    isCavitating,
    isDeadHead,
    sealRisk,
  };
}

export function generatePumpCurves(params: PumpParams): PumpCurvePoint[] {
  const { rpm, valveOpening, suctionHead, impellerTrimPct, parallelPumps } = params;
  const staticHeadM = DISCHARGE_STATIC_HEAD_M - suctionHead;
  const kSys =
    valveOpening > 0.5 ? K_PIPE_LOSS + computeValveK(valveOpening) : null;

  const pumpCount = parallelPumps ? 2 : 1;
  const maxQ =
    Math.max(
      RATED_MAX_FLOW_M3H,
      RATED_MAX_FLOW_M3H * (rpm / RATED_RPM) * (impellerTrimPct / 100) * pumpCount
    ) * 1.05;
  const steps = 64;
  const points: PumpCurvePoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const q = (maxQ * i) / steps;
    const pumpHead = computePumpHeadAtFlow(q, rpm, impellerTrimPct, parallelPumps);
    const ratedHead = computePumpHeadAtFlow(q, RATED_RPM, 100, false);
    const systemHead = kSys !== null ? staticHeadM + kSys * q * q : null;
    const efficiency = computeEfficiencyAtFlow(q, rpm, impellerTrimPct, parallelPumps);
    const npshr = computeNpshrAtFlow(parallelPumps ? q / 2 : q, rpm, impellerTrimPct);

    points.push({
      q,
      pumpHead,
      ratedHead,
      systemHead,
      efficiency,
      npshr,
    });
  }

  return points;
}

export interface VfdAutoTuneResult {
  targetFlowM3h: number;
  optimalRpm: number;
  vfdPowerKw: number;
  throttledPowerKw: number;
  savingsKw: number;
  savingsPct: number;
  inPor: boolean;
}

/**
 * Computes optimal VFD RPM (with valve 100% open) to hit targetFlowM3h
 * and compares shaft power against throttling at rated 1750 RPM.
 */
export function computeVfdAutoTune(
  targetFlowM3h: number,
  params: PumpParams
): VfdAutoTuneResult {
  const q = Math.max(15, Math.min(160, targetFlowM3h));
  const pumpCount = params.parallelPumps ? 2 : 1;
  const trimRatio = params.impellerTrimPct / 100;
  const staticHeadM = DISCHARGE_STATIC_HEAD_M - params.suctionHead;
  const kSysOpen = K_PIPE_LOSS + computeValveK(100);
  const hRequired = Math.max(1, staticHeadM + kSysOpen * q * q);

  const kPumpEffective = params.parallelPumps ? K_PUMP / 4 : K_PUMP;
  const requiredShutoff = hRequired + kPumpEffective * q * q;
  const rawRatio =
    Math.sqrt(Math.max(0.05, requiredShutoff / RATED_SHUTOFF_HEAD_M)) / trimRatio;
  const optimalRpm = Math.max(
    900,
    Math.min(2900, Math.round((rawRatio * RATED_RPM) / 10) * 10)
  );

  const vfdOp = solvePumpOperatingPoint({
    ...params,
    rpm: optimalRpm,
    valveOpening: 100,
  });

  // Compare against throttling at rated 1750 RPM to deliver the same flow
  const ratedHeadAtQ = computePumpHeadAtFlow(
    vfdOp.flowM3h,
    RATED_RPM,
    params.impellerTrimPct,
    params.parallelPumps
  );
  const ratedEffAtQ = computeEfficiencyAtFlow(
    vfdOp.flowM3h,
    RATED_RPM,
    params.impellerTrimPct,
    params.parallelPumps
  );
  const hydRatedKw =
    (vfdOp.densityKgM3 * GRAVITY * (vfdOp.flowM3h / 3600) * ratedHeadAtQ) / 1000;
  const throttledPowerKw =
    ratedEffAtQ > 5
      ? Math.max(vfdOp.shaftPowerKw, hydRatedKw / (ratedEffAtQ / 100))
      : vfdOp.shaftPowerKw * 1.4;

  const savingsKw = Math.max(0, throttledPowerKw - vfdOp.shaftPowerKw);
  const savingsPct =
    throttledPowerKw > 0 ? (savingsKw / throttledPowerKw) * 100 : 0;

  return {
    targetFlowM3h: q,
    optimalRpm,
    vfdPowerKw: vfdOp.shaftPowerKw,
    throttledPowerKw,
    savingsKw,
    savingsPct,
    inPor: vfdOp.inPor && q <= RATED_MAX_FLOW_M3H * pumpCount,
  };
}

export type ApiSealPlanId = 'Plan 11' | 'Plan 21' | 'Plan 53';

export interface ApiSealPlanStatus {
  plan: ApiSealPlanId;
  title: string;
  reason: string;
  severity: 'normal' | 'caution' | 'critical';
}

export function evaluateApiSealPlan(
  params: PumpParams,
  op: PumpOperatingPoint
): ApiSealPlanStatus {
  if (op.isDeadHead || op.isCavitating || op.sealRisk === 'critical') {
    return {
      plan: 'Plan 53',
      title: 'API Plan 53 (Pressurized Barrier Fluid)',
      reason: op.isDeadHead
        ? 'Dead-head flashing risk requires pressurized external barrier fluid to prevent dry-running.'
        : op.isCavitating
          ? 'Cavitation vaporizes process flush; external pressurized Plan 53 barrier protects seal faces.'
          : 'Critical radial shaft deflection requires dual seal with Plan 53 barrier.',
      severity: 'critical',
    };
  }
  if (params.fluidTempC > 60 || op.sealRisk === 'elevated') {
    return {
      plan: 'Plan 21',
      title: 'API Plan 21 (Cooled Discharge Bypass)',
      reason:
        params.fluidTempC > 60
          ? `Fluid at ${params.fluidTempC}°C (Pv = ${op.vaporPressureKpa.toFixed(1)} kPa) needs cooler before entering seal chamber.`
          : 'Operating outside POR elevates seal heat; Plan 21 heat exchanger maintains vapor margin.',
      severity: 'caution',
    };
  }
  return {
    plan: 'Plan 11',
    title: 'API Plan 11 (Discharge Bypass to Seal)',
    reason: `Clean, cool fluid (${params.fluidTempC}°C) inside POR — standard orifice bypass cools and vents seal chamber.`,
    severity: 'normal',
  };
}
