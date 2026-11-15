import {
  boltTighteningTorqueK,
  mm2ToM2,
  mmToM,
  mpaToPa,
} from '../../physics';

export type BoltHeadType =
  | 'hex-din933'
  | 'socket-din912'
  | 'countersunk-din7991'
  | 'carriage-din603'
  | 'stud-din975';

export interface BoltHeadInfo {
  id: BoltHeadType;
  name: string;
  standard: string;
  driveType: string;
  features: string;
  bestFor: string;
}

export const BOLT_HEADS: BoltHeadInfo[] = [
  {
    id: 'hex-din933',
    name: 'Hex Bolt DIN 933',
    standard: 'DIN 933 / ISO 4017',
    driveType: 'External Hexagonal Spanner',
    features: 'Fully threaded metric shank with standard hexagonal drive head.',
    bestFor: 'General machinery, structural steelwork, pipe flanges, and engine framing.',
  },
  {
    id: 'socket-din912',
    name: 'Socket Cap Allen DIN 912',
    standard: 'DIN 912 / ISO 4762',
    driveType: 'Internal Hex Key (Allen Wrench)',
    features: 'Cylindrical head sitting in counterbored pocket; high torque capability without slipping.',
    bestFor: 'Precision machinery, machine tool slides, gearbox covers, tight clearances.',
  },
  {
    id: 'countersunk-din7991',
    name: 'Countersunk Flat Head',
    standard: 'DIN 7991 / ISO 10642',
    driveType: 'Internal Hex Socket',
    features: 'Flat top with 90° conical under-head chamfer flush with mating surface.',
    bestFor: 'Machine ways, sliding guide rails, aerodynamic panels, smooth conveyor beds.',
  },
  {
    id: 'carriage-din603',
    name: 'Carriage Bolt',
    standard: 'DIN 603 / ISO 8677',
    driveType: 'Self-locking Square Neck',
    features: 'Smooth domed round head with square neck underneath that bites into square hole.',
    bestFor: 'Security assemblies, wooden structures, conveyor guards where external tool access is denied.',
  },
  {
    id: 'stud-din975',
    name: 'Threaded Stud DIN 976',
    standard: 'DIN 976 / DIN 975',
    driveType: 'Double Nut / Stud Runner',
    features: 'Continuous threaded rod or double-ended studs used with nuts at both ends.',
    bestFor: 'Pressure vessels, high-pressure pipe flanges, cylinder heads, engine blocks.',
  },
];

export type NutType =
  | 'hex-din934'
  | 'nyloc-din985'
  | 'flange-din6923'
  | 'castle-din935';

export interface NutInfo {
  id: NutType;
  name: string;
  standard: string;
  lockingMechanism: string;
  reusability: string;
  bestFor: string;
}

export const NUT_TYPES: NutInfo[] = [
  {
    id: 'hex-din934',
    name: 'Standard Hex Nut',
    standard: 'DIN 934 / ISO 4032',
    lockingMechanism: 'Friction clamp only (requires separate spring or wedge washer in vibrating duty)',
    reusability: 'High (indefinite if threads remain undamaged)',
    bestFor: 'Standard non-critical static fastening, structural frames.',
  },
  {
    id: 'nyloc-din985',
    name: 'Nyloc Nylon-Insert Lock Nut',
    standard: 'DIN 985 / ISO 10511',
    lockingMechanism: 'Elastic non-metallic nylon ring deforms over threads generating prevailing friction torque',
    reusability: 'Limited (2–3 times max before nylon grip relaxes; single-use in safety equipment)',
    bestFor: 'Automotive suspensions, conveyor rollers, equipment subjected to moderate vibration.',
  },
  {
    id: 'flange-din6923',
    name: 'Serrated Flange Nut',
    standard: 'DIN 6923 / ISO 4161',
    lockingMechanism: 'Wide integrated washer flange with directional serrated teeth biting into bearing face',
    reusability: 'Moderate (may mar soft aluminum mating faces; reusable on hardened steel)',
    bestFor: 'Automotive chassis, sheet metal brackets, eliminating loose washers in high-speed assembly.',
  },
  {
    id: 'castle-din935',
    name: 'Castle Nut + Cotter Pin',
    standard: 'DIN 935 / ISO 7035',
    lockingMechanism: 'Positive mechanical interlock: split cotter pin through drilled bolt shank prevents rotation',
    reusability: 'High for nut; cotter pin must be replaced with fresh pin upon every disassembly',
    bestFor: 'Critical rotating assemblies, wheel spindle hubs, steering linkages, aircraft landing gear.',
  },
];

export type WasherType =
  | 'flat-din125'
  | 'spring-din127'
  | 'nordlock-din25201';

export interface WasherInfo {
  id: WasherType;
  name: string;
  standard: string;
  workingPrinciple: string;
  effectiveness: string;
  bestFor: string;
}

export const WASHER_TYPES: WasherInfo[] = [
  {
    id: 'flat-din125',
    name: 'Flat Plain Washer',
    standard: 'DIN 125 / ISO 7089',
    workingPrinciple: 'Distributes axial clamping load over larger surface area; prevents galling and spans oversized clearance holes.',
    effectiveness: 'Zero anti-loosening resistance against cyclic transverse vibration.',
    bestFor: 'Spreading load on soft metals (aluminum, plastics), sheet metal joints, standard static joints.',
  },
  {
    id: 'spring-din127',
    name: 'Split Spring Lock Washer',
    standard: 'DIN 127',
    workingPrinciple: 'Split helical ring acts as spring under initial preload, maintaining residual tension when compressed.',
    effectiveness: 'Low to Poor: Under severe transverse vibration (Junker test), split washers often flatten and cause accelerated loosening.',
    bestFor: 'Light duty non-critical electronics, low-vibration enclosures, general household hardware.',
  },
  {
    id: 'nordlock-din25201',
    name: 'Nord-Lock Wedge Washer',
    standard: 'DIN 25201',
    workingPrinciple: 'Pair of hardened washers with internal cams (cam angle α > thread lead angle β). Uses tension instead of friction!',
    effectiveness: 'Outstanding: Junker vibration test certified. Dynamic vibration actually wedges the cams tighter!',
    bestFor: 'Mining crushers, vibratory screens, railway rolling stock, wind turbines, heavy presses.',
  },
];

export type PropertyClass = '4.8' | '8.8' | '10.9' | '12.9' | 'A2-70' | 'A4-80';

export interface PropertyClassInfo {
  grade: PropertyClass;
  material: string;
  nominalTensileMpa: number;
  yieldStrengthMpa: number;
  proofStrengthMpa: number;
  heatTreatment: string;
  decoderFormula: string;
  commonApplications: string;
}

export const PROPERTY_CLASSES: Record<PropertyClass, PropertyClassInfo> = {
  '4.8': {
    grade: '4.8',
    material: 'Low carbon steel',
    nominalTensileMpa: 400,
    yieldStrengthMpa: 320,
    proofStrengthMpa: 310,
    heatTreatment: 'Cold drawn / unquenched',
    decoderFormula: 'First digit 4 × 100 = 400 MPa UTS. Second digit .8 × 400 = 320 MPa Yield.',
    commonApplications: 'Light consumer appliances, electrical enclosures, non-structural covers.',
  },
  '8.8': {
    grade: '8.8',
    material: 'Medium carbon steel (alloyed)',
    nominalTensileMpa: 800,
    yieldStrengthMpa: 640,
    proofStrengthMpa: 580,
    heatTreatment: 'Quenched and Tempered (Q&T)',
    decoderFormula: 'First digit 8 × 100 = 800 MPa UTS. Second digit .8 × 800 = 640 MPa Yield.',
    commonApplications: 'Universal industrial standard for machinery, automotive chassis, pipe flanges.',
  },
  '10.9': {
    grade: '10.9',
    material: 'Low alloy steel (Cr-Mo or Boron)',
    nominalTensileMpa: 1000,
    yieldStrengthMpa: 900,
    proofStrengthMpa: 830,
    heatTreatment: 'Quenched and Tempered (Q&T)',
    decoderFormula: 'First digit 10 × 100 = 1000 MPa UTS. Second digit .9 × 1000 = 900 MPa Yield.',
    commonApplications: 'Automotive cylinder heads, suspension wishbones, crane booms, structural steel.',
  },
  '12.9': {
    grade: '12.9',
    material: 'High-strength alloy steel (Cr-Mo-V)',
    nominalTensileMpa: 1200,
    yieldStrengthMpa: 1080,
    proofStrengthMpa: 970,
    heatTreatment: 'Quenched and Tempered (HRC 39–44)',
    decoderFormula: 'First digit 12 × 100 = 1200 MPa UTS. Second digit .9 × 1200 = 1080 MPa Yield.',
    commonApplications: 'High-strength socket head cap screws (DIN 912), injection molds, stamping dies.',
  },
  'A2-70': {
    grade: 'A2-70',
    material: 'Austenitic Stainless Steel (AISI 304)',
    nominalTensileMpa: 700,
    yieldStrengthMpa: 450,
    proofStrengthMpa: 450,
    heatTreatment: 'Cold worked (strain hardened)',
    decoderFormula: 'A2 = Austenitic 304. "-70" = Minimum tensile strength 700 MPa.',
    commonApplications: 'Food processing, pharmaceutical equipment, outdoor architectural fittings.',
  },
  'A4-80': {
    grade: 'A4-80',
    material: 'Marine Grade Stainless (AISI 316)',
    nominalTensileMpa: 800,
    yieldStrengthMpa: 600,
    proofStrengthMpa: 600,
    heatTreatment: 'High cold work (strain hardened)',
    decoderFormula: 'A4 = Molybdenum-bearing 316. "-80" = Minimum tensile strength 800 MPa.',
    commonApplications: 'Offshore oil platforms, chemical reactor flanges, marine propulsion hardware.',
  },
};

export type MetricBoltSize = 'M6' | 'M8' | 'M10' | 'M12' | 'M16';

export interface MetricBoltSpec {
  size: MetricBoltSize;
  diameterMm: number;
  pitchMm: number;
  hexSpannerMm: number; // Across Flats (s)
  allenKeyMm: number;
  stressAreaMm2: number; // As (tensile stress area)
}

export const METRIC_BOLT_SPECS: Record<MetricBoltSize, MetricBoltSpec> = {
  M6: {
    size: 'M6',
    diameterMm: 6,
    pitchMm: 1.0,
    hexSpannerMm: 10,
    allenKeyMm: 5,
    stressAreaMm2: 20.1,
  },
  M8: {
    size: 'M8',
    diameterMm: 8,
    pitchMm: 1.25,
    hexSpannerMm: 13,
    allenKeyMm: 6,
    stressAreaMm2: 36.6,
  },
  M10: {
    size: 'M10',
    diameterMm: 10,
    pitchMm: 1.5,
    hexSpannerMm: 17,
    allenKeyMm: 8,
    stressAreaMm2: 58.0,
  },
  M12: {
    size: 'M12',
    diameterMm: 12,
    pitchMm: 1.75,
    hexSpannerMm: 19,
    allenKeyMm: 10,
    stressAreaMm2: 84.3,
  },
  M16: {
    size: 'M16',
    diameterMm: 16,
    pitchMm: 2.0,
    hexSpannerMm: 24,
    allenKeyMm: 14,
    stressAreaMm2: 157.0,
  },
};

export interface FastenerJointCalc {
  proofLoadKn: number;
  targetPreloadKn: number;
  recommendedTorqueDryNm: number;
  recommendedTorqueLubeNm: number;
}

/**
 * Computes proof load, 75% target clamping preload, and dry/lubricated tightening torque
 * using central MechLab physics engine (`boltTighteningTorqueK` and SI unit converters).
 */
export function calculateFastenerBasics(
  boltSpec: MetricBoltSpec,
  propClass: PropertyClassInfo
): FastenerJointCalc {
  const diameterM = mmToM(boltSpec.diameterMm);
  const stressAreaM2 = mm2ToM2(boltSpec.stressAreaMm2);
  const proofLoadN = mpaToPa(propClass.proofStrengthMpa) * stressAreaM2;
  const targetPreloadN = 0.75 * proofLoadN;

  const recommendedTorqueDryNm = boltTighteningTorqueK(diameterM, targetPreloadN, 0.2);
  const recommendedTorqueLubeNm = boltTighteningTorqueK(diameterM, targetPreloadN, 0.15);

  return {
    proofLoadKn: proofLoadN / 1000,
    targetPreloadKn: targetPreloadN / 1000,
    recommendedTorqueDryNm,
    recommendedTorqueLubeNm,
  };
}
