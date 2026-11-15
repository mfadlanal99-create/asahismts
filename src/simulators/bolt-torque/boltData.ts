import {
  boltTighteningTorqueK,
  mToMm,
  mm2ToM2,
  mmToM,
  mpaToPa,
  paToMpa,
} from '../../physics';

export interface MetricBoltSpec {
  size: string;
  dMm: number;
  pitchMm: number;
  tensileAreaMm2: number;
  headWidthMm: number;
}

export interface PropertyClassSpec {
  id: '8.8' | '10.9' | '12.9';
  label: string;
  proofStrengthMpa: number;
  yieldStrengthMpa: number;
  tensileStrengthMpa: number;
  description: string;
}

export interface LubricationSpec {
  id: 'dry' | 'light-oil' | 'moly-paste' | 'zinc-plated';
  label: string;
  kFactor: number;
  note: string;
}

export const METRIC_BOLTS: MetricBoltSpec[] = [
  { size: 'M6', dMm: 6, pitchMm: 1.0, tensileAreaMm2: 20.1, headWidthMm: 10 },
  { size: 'M8', dMm: 8, pitchMm: 1.25, tensileAreaMm2: 36.6, headWidthMm: 13 },
  { size: 'M10', dMm: 10, pitchMm: 1.5, tensileAreaMm2: 58.0, headWidthMm: 16 },
  { size: 'M12', dMm: 12, pitchMm: 1.75, tensileAreaMm2: 84.3, headWidthMm: 18 },
  { size: 'M14', dMm: 14, pitchMm: 2.0, tensileAreaMm2: 115.0, headWidthMm: 21 },
  { size: 'M16', dMm: 16, pitchMm: 2.0, tensileAreaMm2: 157.0, headWidthMm: 24 },
  { size: 'M18', dMm: 18, pitchMm: 2.5, tensileAreaMm2: 192.0, headWidthMm: 27 },
  { size: 'M20', dMm: 20, pitchMm: 2.5, tensileAreaMm2: 245.0, headWidthMm: 30 },
  { size: 'M22', dMm: 22, pitchMm: 2.5, tensileAreaMm2: 303.0, headWidthMm: 34 },
  { size: 'M24', dMm: 24, pitchMm: 3.0, tensileAreaMm2: 353.0, headWidthMm: 36 },
];

export const PROPERTY_CLASSES: PropertyClassSpec[] = [
  {
    id: '8.8',
    label: 'Class 8.8',
    proofStrengthMpa: 600,
    yieldStrengthMpa: 640,
    tensileStrengthMpa: 800,
    description: 'Medium carbon steel, quenched & tempered (general machinery)',
  },
  {
    id: '10.9',
    label: 'Class 10.9',
    proofStrengthMpa: 830,
    yieldStrengthMpa: 940,
    tensileStrengthMpa: 1040,
    description: 'Alloy steel, quenched & tempered (high-strength structural)',
  },
  {
    id: '12.9',
    label: 'Class 12.9',
    proofStrengthMpa: 970,
    yieldStrengthMpa: 1100,
    tensileStrengthMpa: 1220,
    description: 'Alloy steel, high-tensile socket/flange fasteners',
  },
];

export const LUBRICATION_CONDITIONS: LubricationSpec[] = [
  {
    id: 'dry',
    label: 'Dry (As-Received)',
    kFactor: 0.2,
    note: 'Clean unlubricated steel (~90% of torque goes to friction)',
  },
  {
    id: 'light-oil',
    label: 'Light Machine Oil',
    kFactor: 0.15,
    note: 'Oiled threads & under-head; 25% less torque for same preload',
  },
  {
    id: 'moly-paste',
    label: 'Moly Paste (MoS₂)',
    kFactor: 0.12,
    note: 'Anti-seize / molybdenum disulfide; high preload per N·m',
  },
  {
    id: 'zinc-plated',
    label: 'Zinc Plated (Dry)',
    kFactor: 0.22,
    note: 'Electroplated zinc; slightly higher thread/bearing friction',
  },
];

export type JointStatus = 'low' | 'optimal' | 'caution' | 'yielded' | 'stripped';

export interface JointCalculation {
  torqueNm: number;
  preloadKn: number;
  proofLoadKn: number;
  tensileAreaMm2: number;
  tensileStressMpa: number;
  elongationMm: number;
  gripLengthMm: number;
  proofPercent: number;
  yieldPercent: number;
  recommendedTorqueNm: number;
  proofTorqueNm: number;
  maxSliderTorqueNm: number;
  status: JointStatus;
}

const STEEL_YOUNGS_MODULUS_PA = mpaToPa(210_000);

/**
 * Calculates bolted joint preload, stress, elastic elongation, and failure state using T = K * d * Fi.
 */
export function calculateBoltedJoint(
  bolt: MetricBoltSpec,
  propClass: PropertyClassSpec,
  lubrication: LubricationSpec,
  torqueNm: number,
  gripLengthMm = 50
): JointCalculation {
  const diameterM = mmToM(bolt.dMm);
  const tensileAreaM2 = mm2ToM2(bolt.tensileAreaMm2);
  const proofLoadN = mpaToPa(propClass.proofStrengthMpa) * tensileAreaM2;
  const proofLoadKn = proofLoadN / 1000;
  const preloadN = torqueNm / (lubrication.kFactor * diameterM);
  const preloadKn = preloadN / 1000;
  const tensileStressMpa = paToMpa(preloadN / tensileAreaM2);
  const elongationMm = mToMm(
    (mpaToPa(tensileStressMpa) * mmToM(gripLengthMm)) / STEEL_YOUNGS_MODULUS_PA
  );
  const proofPercent = (tensileStressMpa / propClass.proofStrengthMpa) * 100;
  const yieldPercent = (tensileStressMpa / propClass.yieldStrengthMpa) * 100;

  // Target reusable joint preload is typically 75% of proof load
  const recommendedTorqueNm = boltTighteningTorqueK(
    diameterM,
    0.75 * proofLoadN,
    lubrication.kFactor
  );
  const proofTorqueNm = boltTighteningTorqueK(
    diameterM,
    proofLoadN,
    lubrication.kFactor
  );
  const maxSliderTorqueNm = Math.ceil((proofTorqueNm * 1.35) / 5) * 5;

  let status: JointStatus = 'low';
  if (tensileStressMpa >= propClass.tensileStrengthMpa) {
    status = 'stripped';
  } else if (proofPercent > 100) {
    status = 'yielded';
  } else if (proofPercent >= 88) {
    status = 'caution';
  } else if (proofPercent >= 55) {
    status = 'optimal';
  }

  return {
    torqueNm,
    preloadKn,
    proofLoadKn,
    tensileAreaMm2: bolt.tensileAreaMm2,
    tensileStressMpa,
    elongationMm,
    gripLengthMm,
    proofPercent,
    yieldPercent,
    recommendedTorqueNm,
    proofTorqueNm,
    maxSliderTorqueNm,
    status,
  };
}

// Standard ASME PCC-1 / cross-star tightening orders (1-indexed bolt numbers clockwise from 12 o'clock)
export const FLANGE_SEQUENCES: Record<6 | 8, number[]> = {
  6: [1, 4, 2, 5, 3, 6],
  8: [1, 5, 3, 7, 2, 6, 4, 8],
};

export interface FlangePass {
  pass: 1 | 2 | 3;
  label: string;
  torquePercent: number;
  description: string;
}

export const FLANGE_PASSES: FlangePass[] = [
  {
    pass: 1,
    label: 'Pass 1 — Snug (30%)',
    torquePercent: 30,
    description: 'Seat the gasket evenly without cocking the flange.',
  },
  {
    pass: 2,
    label: 'Pass 2 — Intermediate (70%)',
    torquePercent: 70,
    description: 'Compress gasket uniformly across opposite quadrants.',
  },
  {
    pass: 3,
    label: 'Pass 3 — Final (100%)',
    torquePercent: 100,
    description: 'Bring all studs to full target preload.',
  },
];
