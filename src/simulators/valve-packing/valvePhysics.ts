import {
  axialStress,
  barToPa,
  mm2ToM2,
  mpaToPa,
  paToMpa,
} from '../../physics';

export type ValveType = 'globe' | 'gate' | 'ball' | 'butterfly';
export type FluidService = 'steam' | 'water' | 'thermal-oil';
export type FaultMode =
  | 'none'
  | 'under-tightened'
  | 'over-tightened'
  | 'passing-seat';

export type MaintenanceStatus =
  | 'Optimal Seal'
  | 'Fugitive Leak'
  | 'Stem Binding Risk';

export interface ValveParams {
  valveType: ValveType;
  fluidService: FluidService;
  openingPct: number;
  linePressureBar: number;
  glandTorqueNm: number;
  packingWearCycles: number;
  fault: FaultMode;
}

export interface ValveTelemetry {
  cvMax: number;
  effectiveCv: number;
  cvPct: number;
  deltaPBar: number;
  flowM3h: number;
  massFlowKgh: number;
  glandForceN: number;
  packingStressMpa: number;
  requiredStressMpa: number;
  ringStressesMpa: [number, number, number, number];
  stemFrictionN: number;
  packingLeakRateMlMin: number;
  fugitivePpm: number;
  seatLeakRateLh: number;
  trapBlowing: boolean;
  status: MaintenanceStatus;
  statusDetail: string;
}

export interface ValvePreset {
  id: string;
  label: string;
  description: string;
  params: ValveParams;
}

export const VALVE_TYPE_INFO: Record<
  ValveType,
  { label: string; cvMax: number; stemDiaMm: number; characteristic: string }
> = {
  globe: {
    label: 'Globe Control Valve',
    cvMax: 45,
    stemDiaMm: 16,
    characteristic: 'Equal-Percentage',
  },
  gate: {
    label: 'Gate Valve',
    cvMax: 220,
    stemDiaMm: 22,
    characteristic: 'Quick-Opening / Isolation',
  },
  ball: {
    label: 'Ball Valve',
    cvMax: 180,
    stemDiaMm: 18,
    characteristic: 'Modified Equal-%',
  },
  butterfly: {
    label: 'Butterfly Valve',
    cvMax: 140,
    stemDiaMm: 20,
    characteristic: 'Sinusoidal Throttling',
  },
};

export const FLUID_SERVICE_INFO: Record<
  FluidService,
  { label: string; sg: number; tempC: number; densityKgM3: number }
> = {
  steam: {
    label: 'Steam 10 bar',
    sg: 0.0056,
    tempC: 184,
    densityKgM3: 5.6,
  },
  water: {
    label: 'Process Water',
    sg: 1.0,
    tempC: 45,
    densityKgM3: 990,
  },
  'thermal-oil': {
    label: 'Thermal Oil',
    sg: 0.86,
    tempC: 240,
    densityKgM3: 860,
  },
};

export const FAULT_MODE_INFO: Record<
  FaultMode,
  { label: string; shortLabel: string }
> = {
  none: { label: 'Healthy (Normal Operation)', shortLabel: 'Healthy' },
  'under-tightened': {
    label: 'Under-Tightened Packing Leak',
    shortLabel: 'Under-Tightened Leak',
  },
  'over-tightened': {
    label: 'Over-Tightened Stem Binding/Scoring',
    shortLabel: 'Over-Tightened Binding',
  },
  'passing-seat': {
    label: 'Passing Seat / Blowing Steam Trap',
    shortLabel: 'Passing Seat / Trap',
  },
};

export const VALVE_PRESETS: ValvePreset[] = [
  {
    id: 'optimal-control',
    label: 'Optimal Seal',
    description: 'Globe control valve at 60% opening with balanced gland torque.',
    params: {
      valveType: 'globe',
      fluidService: 'steam',
      openingPct: 60,
      linePressureBar: 10,
      glandTorqueNm: 32,
      packingWearCycles: 8000,
      fault: 'none',
    },
  },
  {
    id: 'under-tightened',
    label: 'Fugitive Leak',
    description: 'Backed-off gland follower nuts causing steam wisps at stuffing box.',
    params: {
      valveType: 'globe',
      fluidService: 'steam',
      openingPct: 55,
      linePressureBar: 12,
      glandTorqueNm: 14,
      packingWearCycles: 28000,
      fault: 'under-tightened',
    },
  },
  {
    id: 'over-tightened',
    label: 'Stem Binding',
    description: 'Excessive gland torque crushing PTFE/graphite rings onto stem.',
    params: {
      valveType: 'gate',
      fluidService: 'thermal-oil',
      openingPct: 40,
      linePressureBar: 14,
      glandTorqueNm: 68,
      packingWearCycles: 12000,
      fault: 'over-tightened',
    },
  },
  {
    id: 'passing-seat',
    label: 'Passing Seat / Trap',
    description: 'Closed valve with wiredrawn seat & blowing downstream steam trap.',
    params: {
      valveType: 'globe',
      fluidService: 'steam',
      openingPct: 0,
      linePressureBar: 10,
      glandTorqueNm: 30,
      packingWearCycles: 35000,
      fault: 'passing-seat',
    },
  },
  {
    id: 'worn-packing',
    label: 'Worn Packing',
    description: 'High-cycle consolidated packing losing radial sealing stress.',
    params: {
      valveType: 'ball',
      fluidService: 'water',
      openingPct: 75,
      linePressureBar: 16,
      glandTorqueNm: 26,
      packingWearCycles: 85000,
      fault: 'none',
    },
  },
];

export function computeValveCurve(
  valveType: ValveType,
  openingPct: number,
): number {
  const h = Math.max(0, Math.min(1, openingPct / 100));
  if (h <= 0.001) return 0;

  switch (valveType) {
    case 'globe': {
      // Equal-percentage with rangeability R = 30, blended smoothly from 0
      const R = 30;
      return h < 0.05 ? (h / 0.05) * Math.pow(R, 0.05 - 1) : Math.pow(R, h - 1);
    }
    case 'gate':
      return Math.pow(h, 0.72);
    case 'ball':
      return Math.pow(h, 1.85);
    case 'butterfly':
      return Math.pow(Math.sin((Math.PI / 2) * h), 1.6);
  }
}

export function solveValveSystem(params: ValveParams): ValveTelemetry {
  const vInfo = VALVE_TYPE_INFO[params.valveType];
  const fInfo = FLUID_SERVICE_INFO[params.fluidService];

  const cvFraction = computeValveCurve(params.valveType, params.openingPct);
  const effectiveCv = vInfo.cvMax * cvFraction;

  // Differential pressure across valve: higher when throttled, lower when wide open
  const throttleFactor = 0.25 + 0.55 * (1 - params.openingPct / 100);
  const deltaPBar = Math.max(0.1, params.linePressureBar * throttleFactor);

  // Flow Q (m^3/h): Q = 0.865 * Cv * sqrt(dP_bar / SG)
  // For steam, scale by compressibility / expansion factor Y ~ 0.88 for subcritical/moderate dP
  const expansionFactor = params.fluidService === 'steam' ? 0.88 : 1.0;
  const flowM3h =
    effectiveCv > 0
      ? 0.865 * effectiveCv * expansionFactor * Math.sqrt(deltaPBar / fInfo.sg)
      : 0;
  const massFlowKgh = flowM3h * fInfo.densityKgM3;

  // Gland follower bolt mechanics: 2x M12 studs (d = 0.012 m, K = 0.20)
  const effectiveTorqueNm =
    params.fault === 'under-tightened'
      ? Math.min(params.glandTorqueNm, 15)
      : params.fault === 'over-tightened'
        ? Math.max(params.glandTorqueNm, 62)
        : params.glandTorqueNm;

  const boltForceN = effectiveTorqueNm / (0.2 * 0.012);
  const glandForceN = 2 * boltForceN;

  // Stuffing box annulus area: OD = stemDia + 16 mm (8 mm packing cross-section)
  const dStemMm = vInfo.stemDiaMm;
  const dBoxMm = dStemMm + 16;
  const annulusAreaMm2 = (Math.PI / 4) * (dBoxMm * dBoxMm - dStemMm * dStemMm);
  const axialStressMpa = paToMpa(axialStress(glandForceN, mm2ToM2(annulusAreaMm2)));

  // Wear / cycle consolidation reduces radial stress transfer
  const wearNorm = Math.max(0, Math.min(1, params.packingWearCycles / 100000));
  const radialTransferCoeff = 0.65 * (1 - 0.42 * wearNorm);
  const packingStressMpa = axialStressMpa * radialTransferCoeff;

  // Ring-by-ring axial-to-radial stress distribution (Ring #1 top ~42%, #2 ~27%, #3 ~19%, #4 bottom ~12%)
  // Normalized so average matches packingStressMpa, with Ring #1 carrying 1.68x average (~42% of total 4-ring load)
  const ringShares: [number, number, number, number] = [0.42, 0.27, 0.19, 0.12];
  const ringStressesMpa: [number, number, number, number] = [
    packingStressMpa * 4 * ringShares[0],
    packingStressMpa * 4 * ringShares[1],
    packingStressMpa * 4 * ringShares[2],
    packingStressMpa * 4 * ringShares[3],
  ];

  // Required radial sealing stress: m * P_line, m = 2.1 + minimum seating 1.2 MPa
  const linePressureMpa = paToMpa(barToPa(params.linePressureBar));
  const requiredStressMpa = 1.2 + 2.1 * linePressureMpa;

  // Stem friction force: F_f = mu * P_radial * pi * d_stem * L_pack (5 rings * 8 mm = 40 mm)
  const packHeightMm = 40;
  const contactAreaMm2 = Math.PI * dStemMm * packHeightMm;
  const mu =
    params.fault === 'over-tightened'
      ? 0.19
      : params.fluidService === 'steam'
        ? 0.12
        : 0.09;
  const stemFrictionN = mu * mpaToPa(packingStressMpa) * mm2ToM2(contactAreaMm2);

  // Packing leak rate if radial sealing stress < requiredStressMpa
  const stressDeficitMpa = Math.max(0, requiredStressMpa - packingStressMpa);
  const faultLeakBoost = params.fault === 'under-tightened' ? 1.8 : 0;
  const packingLeakRateMlMin =
    stressDeficitMpa > 0 || faultLeakBoost > 0
      ? (stressDeficitMpa * 18 + faultLeakBoost * 12) *
        (0.4 + 0.06 * params.linePressureBar) *
        (1 + 0.8 * wearNorm)
      : 0;

  const fugitivePpm = Math.round(
    packingLeakRateMlMin > 0
      ? Math.min(15000, 120 + packingLeakRateMlMin * 95)
      : Math.max(5, 18 * wearNorm),
  );

  // Seat leakage & steam trap blow-by
  const seatLeakRateLh =
    params.fault === 'passing-seat'
      ? (params.fluidService === 'steam' ? 28 : 42) *
        (0.5 + 0.05 * params.linePressureBar)
      : params.openingPct === 0 && wearNorm > 0.7
        ? (wearNorm - 0.7) * 14 * (params.linePressureBar / 10)
        : 0;

  const trapBlowing =
    params.fluidService === 'steam' &&
    (params.fault === 'passing-seat' || seatLeakRateLh > 3);

  // Determine primary Maintenance Status
  let status: MaintenanceStatus = 'Optimal Seal';
  let statusDetail =
    'Gland compression balances fugitive emission control against stem friction.';

  if (
    params.fault === 'over-tightened' ||
    packingStressMpa > requiredStressMpa * 2.25 ||
    stemFrictionN > 2800
  ) {
    status = 'Stem Binding Risk';
    statusDetail =
      'Excessive gland torque crushes packing rings, causing high stem friction, actuator hunting, and stem scoring.';
  } else if (
    params.fault === 'under-tightened' ||
    packingLeakRateMlMin > 0.5 ||
    fugitivePpm >= 500
  ) {
    status = 'Fugitive Leak';
    statusDetail =
      'Insufficient radial packing stress allows process fluid to escape past the stuffing box (>500 ppm EPA threshold).';
  } else if (params.fault === 'passing-seat') {
    statusDetail =
      'Stuffing box is sealed, but wiredrawn seat allows downstream blow-by and steam trap overload.';
  }

  return {
    cvMax: vInfo.cvMax,
    effectiveCv,
    cvPct: cvFraction * 100,
    deltaPBar,
    flowM3h,
    massFlowKgh,
    glandForceN,
    packingStressMpa,
    requiredStressMpa,
    ringStressesMpa,
    stemFrictionN,
    packingLeakRateMlMin,
    fugitivePpm,
    seatLeakRateLh,
    trapBlowing,
    status,
    statusDetail,
  };
}
