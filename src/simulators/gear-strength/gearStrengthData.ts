import {
  gearTangentialForce,
  gearElasticCoefficientZE,
  degToRad,
  rpmToRadS,
  kwToW,
} from '../../physics';

export type GearType = 'spur' | 'helical';

export interface GearMaterial {
  id: string;
  name: string;
  youngsModulusGpa: number; // E (GPa)
  poissonsRatio: number; // nu
  allowableBendingMpa: number; // [sigma_b] (MPa)
  allowableContactMpa: number; // [sigma_c] (MPa)
  hardness: string;
  densityKgM3: number;
  color: string;
  descriptionEn: string;
  descriptionId: string;
  descriptionJa: string;
}

export const PRESET_GEAR_MATERIALS: GearMaterial[] = [
  {
    id: 'carburized-8620',
    name: 'Carburized 8620 Alloy Steel',
    youngsModulusGpa: 206,
    poissonsRatio: 0.30,
    allowableBendingMpa: 410,
    allowableContactMpa: 1620,
    hardness: '58–62 HRC (Case)',
    densityKgM3: 7850,
    color: '#6366f1',
    descriptionEn:
      'Case-hardened nickel-chromium-molybdenum alloy steel with extreme surface wear resistance, high compressive residual stress, and ductile fracture-resistant core.',
    descriptionId:
      'Baja paduan Ni-Cr-Mo case-hardened dengan ketahanan aus permukaan sangat tinggi, tegangan sisa tekan, dan inti ulet tahan beban impak.',
    descriptionJa:
      '高耐摩耗性の浸炭焼入れ浸炭層、圧縮残留応力、および強靭な心部を備えたNi-Cr-Mo系浸炭浸炭鋼。高負荷歯車に最適。',
  },
  {
    id: '4140-induction',
    name: '4140 Induction Hardened Steel',
    youngsModulusGpa: 210,
    poissonsRatio: 0.29,
    allowableBendingMpa: 330,
    allowableContactMpa: 1250,
    hardness: '50–54 HRC (Flank)',
    densityKgM3: 7850,
    color: '#0ea5e9',
    descriptionEn:
      'Medium carbon Cr-Mo alloy steel induction-hardened on tooth flanks. Excellent torsional fatigue strength and high dimensional stability.',
    descriptionId:
      'Baja paduan Cr-Mo karbon menengah dengan pengerasan induksi pada flank gigi. Kekuatan fatik torsi tinggi dan kestabilan dimensi presisi.',
    descriptionJa:
      '歯面高周波焼入れを施したCr-Mo中炭素合金鋼。優れたねじり疲労強度と高い寸法安定性を発揮。',
  },
  {
    id: '1045-medium-carbon',
    name: '1045 Through-Hardened Steel',
    youngsModulusGpa: 205,
    poissonsRatio: 0.29,
    allowableBendingMpa: 210,
    allowableContactMpa: 620,
    hardness: '200–225 HBW',
    densityKgM3: 7850,
    color: '#10b981',
    descriptionEn:
      'Normalized or through-hardened medium-carbon engineering steel. Widely utilized for general industrial conveyors, speed reducers, and agricultural machinery.',
    descriptionId:
      'Baja karbon menengah normalisasi / perlakuan panas tembus. Standar andalan untuk konveyor industri umum, peredam kecepatan, dan mesin pertanian.',
    descriptionJa:
      '調質・焼ならしを施した機械構造用炭素鋼（S45C相当）。一般的な産業機械、コンベヤ、減速機に広く採用。',
  },
  {
    id: 'cast-iron-gg25',
    name: 'Gray Cast Iron GG25 (Class 35)',
    youngsModulusGpa: 110,
    poissonsRatio: 0.26,
    allowableBendingMpa: 95,
    allowableContactMpa: 480,
    hardness: '190–230 HBW',
    densityKgM3: 7200,
    color: '#94a3b8',
    descriptionEn:
      'Pearlitic gray cast iron with exceptional graphite-assisted acoustic vibration damping, outstanding dry galling resistance, and low manufacturing cost.',
    descriptionId:
      'Besi cor kelabu perlitik dengan peredam getaran akustik grafit serpih yang luar biasa, ketahanan aus kering, dan biaya manufaktur ekonomis.',
    descriptionJa:
      '片状黒鉛による卓越した振動減衰能と耐焼付き性を備えたねずみ鋳鉄（FC250相当）。低振動・静粛性が求められる補機歯車に最適。',
  },
  {
    id: 'phosphor-bronze',
    name: 'Phosphor Bronze CuSn12 (C90700)',
    youngsModulusGpa: 105,
    poissonsRatio: 0.34,
    allowableBendingMpa: 85,
    allowableContactMpa: 360,
    hardness: '95–110 HBW',
    densityKgM3: 8800,
    color: '#f59e0b',
    descriptionEn:
      'High-tin tin-phosphor bronze alloy offering low friction coefficient against steel, superior anti-scuffing lubricity, and non-magnetic corrosion resistance.',
    descriptionId:
      'Paduan perunggu fosfor-timah tinggi dengan koefisien gesek rendah berpasangan dengan baja, pelumasan mandiri anti-scuffing, dan tahan korosi.',
    descriptionJa:
      '鋼との摩擦係数が極めて低く、耐焼付き潤滑性に優れた高錫リン青銅（PBC相当）。ウォームホイールや耐食性伝動歯車に使用。',
  },
];

export interface GearInputs {
  gearType: GearType;
  powerKw: number; // Power (kW)
  pinionRpm: number; // Pinion rotational speed n1 (rpm)
  moduleMm: number; // Normal/standard module m (mm)
  pinionTeeth: number; // Pinion teeth z1
  gearTeeth: number; // Gear teeth z2
  faceWidthMm: number; // Face width b (mm)
  pressureAngleDeg: number; // Normal pressure angle alpha_n (20 or 25 deg)
  helixAngleDeg: number; // Helix angle psi (deg, 0 for spur)
  applicationFactor: number; // Ko (1.0 - 2.0)
  materialId: string;
}

export const DEFAULT_GEAR_INPUTS: GearInputs = {
  gearType: 'spur',
  powerKw: 15.0,
  pinionRpm: 1450,
  moduleMm: 4.0,
  pinionTeeth: 19,
  gearTeeth: 76,
  faceWidthMm: 40.0,
  pressureAngleDeg: 20,
  helixAngleDeg: 0,
  applicationFactor: 1.25,
  materialId: 'carburized-8620',
};

export interface GearCalculationResult {
  inputs: GearInputs;
  material: GearMaterial;
  // Kinematic & Geometry
  transverseModuleMm: number;
  pitchDiameter1Mm: number;
  pitchDiameter2Mm: number;
  baseDiameter1Mm: number;
  baseDiameter2Mm: number;
  tipDiameter1Mm: number;
  tipDiameter2Mm: number;
  rootDiameter1Mm: number;
  rootDiameter2Mm: number;
  centerDistanceMm: number;
  gearRatio: number;
  gearRpm: number;
  pitchLineVelocityMps: number;
  pinionTorqueNm: number;
  // Loads (N)
  tangentialForceN: number;
  radialForceN: number;
  axialForceN: number;
  normalForceN: number;
  // AGMA & Lewis Factors
  axialContactRatio: number;
  dynamicFactorKv: number;
  sizeFactorKs: number;
  loadDistFactorKm: number;
  geometryFactorJ: number;
  geometryFactorI: number;
  elasticCoefficientZe: number;
  // Stresses (MPa)
  lewisBendingStressMpa: number;
  contactStressMpa: number;
  allowableBendingStressMpa: number;
  allowableContactStressMpa: number;
  // Safety Factors
  bendingSafetyFactor: number;
  contactSafetyFactor: number;
  // Power capacity
  maxPowerBendingKw: number;
  maxPowerContactKw: number;
  maxTransmissiblePowerKw: number;
  // Status
  status: 'SAFE' | 'MARGINAL' | 'FAIL';
  criticalFailureMode: 'none' | 'bending_fatigue' | 'contact_pitting';
  helicalVerdict: 'spur' | 'optimal' | 'partial-overlap' | 'high-thrust';
}

export interface GearPreset {
  id: string;
  nameEn: string;
  nameId: string;
  nameJa: string;
  inputs: GearInputs;
  descriptionEn: string;
}

export const GEAR_PRESETS: GearPreset[] = [
  {
    id: 'industrial-reducer',
    nameEn: 'Industrial Speed Reducer (4:1 Spur)',
    nameId: 'Peredam Kecepatan Industri (Spur 4:1)',
    nameJa: '産業用ギヤ減速機（4:1 平歯車）',
    inputs: {
      gearType: 'spur',
      powerKw: 15.0,
      pinionRpm: 1450,
      moduleMm: 4.0,
      pinionTeeth: 19,
      gearTeeth: 76,
      faceWidthMm: 45.0,
      pressureAngleDeg: 20,
      helixAngleDeg: 0,
      applicationFactor: 1.25,
      materialId: 'carburized-8620',
    },
    descriptionEn: 'Standard 4:1 industrial gearbox driven by a 15 kW 4-pole electric motor.',
  },
  {
    id: 'turbo-helical',
    nameEn: 'High-Speed Turbomachinery (3:1 Helical)',
    nameId: 'Turbomesin Kecepatan Tinggi (Helikal 3:1)',
    nameJa: '高速ターボ機械駆動（3:1 はすば歯車）',
    inputs: {
      gearType: 'helical',
      powerKw: 45.0,
      pinionRpm: 2950,
      moduleMm: 3.5,
      pinionTeeth: 24,
      gearTeeth: 72,
      faceWidthMm: 50.0,
      pressureAngleDeg: 20,
      helixAngleDeg: 21,
      applicationFactor: 1.10,
      materialId: '4140-induction',
    },
    descriptionEn: 'High-speed smooth helical gear drive for centrifugal compressor transmission.',
  },
  {
    id: 'heavy-conveyor',
    nameEn: 'Heavy Mining Conveyor Drive',
    nameId: 'Penggerak Konveyor Tambang Berat',
    nameJa: '重鉱山コンベヤ駆動減速機',
    inputs: {
      gearType: 'spur',
      powerKw: 30.0,
      pinionRpm: 980,
      moduleMm: 6.0,
      pinionTeeth: 18,
      gearTeeth: 72,
      faceWidthMm: 70.0,
      pressureAngleDeg: 25,
      helixAngleDeg: 0,
      applicationFactor: 1.60,
      materialId: '1045-medium-carbon',
    },
    descriptionEn: 'Heavy-duty conveyor with shock loading and high tooth bending resistance.',
  },
  {
    id: 'crane-winch',
    nameEn: 'Overhead Crane Hoist Winch',
    nameId: 'Derek Kerek Derek Atas (Winch)',
    nameJa: '天井クレーン巻上ウインチ機構',
    inputs: {
      gearType: 'helical',
      powerKw: 22.0,
      pinionRpm: 720,
      moduleMm: 5.0,
      pinionTeeth: 20,
      gearTeeth: 80,
      faceWidthMm: 60.0,
      pressureAngleDeg: 20,
      helixAngleDeg: 16,
      applicationFactor: 1.40,
      materialId: 'carburized-8620',
    },
    descriptionEn: 'Reversible crane hoist gear set designed for strict safety against root failure.',
  },
  {
    id: 'machine-tool-spindle',
    nameEn: 'Machine Tool Lathe Spindle',
    nameId: 'Spindel Bubut Perkakas Mesin',
    nameJa: '工作機械旋盤主軸ギヤ列',
    inputs: {
      gearType: 'spur',
      powerKw: 5.5,
      pinionRpm: 1400,
      moduleMm: 2.5,
      pinionTeeth: 26,
      gearTeeth: 52,
      faceWidthMm: 28.0,
      pressureAngleDeg: 20,
      helixAngleDeg: 0,
      applicationFactor: 1.15,
      materialId: 'cast-iron-gg25',
    },
    descriptionEn: 'Precision lathe headstock gear designed for chatter-free smooth operation.',
  },
];

export function computeGearStrength(
  inputs: GearInputs,
  customMat?: Partial<GearMaterial>
): GearCalculationResult {
  const isHelical = inputs.gearType === 'helical';
  const helixRad = isHelical ? degToRad(inputs.helixAngleDeg) : 0;
  const cosPsi = Math.max(0.5, Math.cos(helixRad));
  const normalAngleRad = degToRad(inputs.pressureAngleDeg);

  // Transverse Module and Transverse Pressure Angle
  const transverseModuleMm = inputs.moduleMm / cosPsi;
  const tanAlphaT = Math.tan(normalAngleRad) / cosPsi;
  const transverseAngleRad = Math.atan(tanAlphaT);

  // Pitch Diameters
  const d1 = inputs.pinionTeeth * transverseModuleMm;
  const d2 = inputs.gearTeeth * transverseModuleMm;
  const centerDistanceMm = (d1 + d2) / 2;
  const gearRatio = inputs.gearTeeth / inputs.pinionTeeth;
  const gearRpm = inputs.pinionRpm / gearRatio;

  // Tooth Geometry Circles
  const baseDiameter1Mm = d1 * Math.cos(transverseAngleRad);
  const baseDiameter2Mm = d2 * Math.cos(transverseAngleRad);
  const addendum = 1.0 * inputs.moduleMm;
  const dedendum = 1.25 * inputs.moduleMm;
  const tipDiameter1Mm = d1 + 2 * addendum;
  const tipDiameter2Mm = d2 + 2 * addendum;
  const rootDiameter1Mm = d1 - 2 * dedendum;
  const rootDiameter2Mm = d2 - 2 * dedendum;

  // Pitch Line Velocity (m/s)
  const pitchLineVelocityMps = (Math.PI * d1 * inputs.pinionRpm) / 60000;

  // Pinion Angular Speed & Torque (N·m) via SI physics: T = P / omega
  const omegaRadS = rpmToRadS(Math.max(1, inputs.pinionRpm));
  const powerW = kwToW(Math.max(0.1, inputs.powerKw));
  const pinionTorqueNm = powerW / omegaRadS;

  // Force Decomposition (N) via mechanics physics engine
  const pitchRadius1M = (d1 / 2) * 1e-3;
  const tangentialForceN = gearTangentialForce(powerW, omegaRadS, pitchRadius1M);
  const radialForceN = tangentialForceN * tanAlphaT;
  const axialForceN = isHelical ? tangentialForceN * Math.tan(helixRad) : 0;
  const normalForceN = Math.sqrt(
    tangentialForceN * tangentialForceN +
      radialForceN * radialForceN +
      axialForceN * axialForceN
  );

  // Resolve Material
  let material: GearMaterial =
    PRESET_GEAR_MATERIALS.find((m) => m.id === inputs.materialId) ?? PRESET_GEAR_MATERIALS[0];
  if (inputs.materialId === 'custom' && customMat) {
    material = {
      ...material,
      ...customMat,
      id: 'custom',
    };
  }

  // Axial Overlap Contact Ratio for Helical Gears (epsilon_beta = b * sin(psi) / (pi * mn))
  const axialContactRatio = isHelical
    ? (inputs.faceWidthMm * Math.sin(helixRad)) / (Math.PI * inputs.moduleMm)
    : 0;

  // AGMA Dynamic Factor Kv (AGMA 2001 Standard; helical gears run smoother with full overlap)
  const vFpm = pitchLineVelocityMps * 196.85; // m/s to ft/min
  const Qv = isHelical && axialContactRatio >= 1.0 ? 8 : 7;
  const B = 0.25 * Math.pow(12 - Qv, 0.667);
  const A = 50 + 56 * (1 - B);
  const rawKv = Math.pow((A + Math.sqrt(Math.max(0, vFpm))) / A, B);
  const dynamicFactorKv = Math.min(1.85, Math.max(1.03, rawKv));

  // Size Factor Ks
  const sizeFactorKs = inputs.moduleMm <= 5.0 ? 1.0 : 1.0 + 0.012 * (inputs.moduleMm - 5.0);

  // Load Distribution Factor Km (accounts for face-width to diameter ratio)
  const bOverD = inputs.faceWidthMm / Math.max(10, d1);
  const loadDistFactorKm = Math.min(1.65, Math.max(1.15, 1.15 + 0.12 * bOverD));

  // Virtual tooth count for helical gear geometry factor
  const virtualTeeth1 = inputs.pinionTeeth / Math.pow(cosPsi, 3);

  // AGMA Tooth Bending Geometry Factor J (incorporates helical overlap load-sharing)
  const is25Deg = inputs.pressureAngleDeg >= 24;
  const baseJ = is25Deg ? 0.30 : 0.24;
  const slopeJ = is25Deg ? 0.13 : 0.11;
  const rawJ = Math.min(
    0.55,
    Math.max(0.28, baseJ + slopeJ * Math.log10(Math.max(12, virtualTeeth1)))
  );
  const helicalBendBonus = isHelical ? 1 + 0.16 * Math.min(1.4, axialContactRatio) : 1.0;
  const geometryFactorJ = Math.min(0.62, rawJ * helicalBendBonus);

  // AGMA Bending Stress sigma_b (MPa)
  // sigma_b = (Wt * Ko * Kv * Ks * Km) / (b * mt * J)
  const totalBendingLoadFactor =
    inputs.applicationFactor * dynamicFactorKv * sizeFactorKs * loadDistFactorKm;
  const lewisBendingStressMpa =
    (tangentialForceN * totalBendingLoadFactor) /
    (Math.max(1, inputs.faceWidthMm) * transverseModuleMm * geometryFactorJ);

  // Elastic Coefficient Ze (sqrt(MPa)) via mechanics physics engine
  const nu = material.poissonsRatio;
  const ePa = material.youngsModulusGpa * 1e9;
  const zePa = gearElasticCoefficientZE(ePa, nu, ePa, nu);
  const elasticCoefficientZe = zePa / 1000; // Pa^0.5 -> MPa^0.5

  // Surface Geometry Factor I (includes helical load-sharing benefit)
  const baseI =
    ((Math.sin(transverseAngleRad) * Math.cos(transverseAngleRad)) / 2) *
    (gearRatio / (gearRatio + 1));
  const helicalContactBonus = isHelical ? 1 + 0.22 * Math.min(1.4, axialContactRatio) : 1.0;
  const geometryFactorI = baseI * helicalContactBonus;

  // Helical design assessment verdict
  let helicalVerdict: 'spur' | 'optimal' | 'partial-overlap' | 'high-thrust' = 'spur';
  if (isHelical) {
    if (inputs.helixAngleDeg > 25) {
      helicalVerdict = 'high-thrust';
    } else if (axialContactRatio < 1.0) {
      helicalVerdict = 'partial-overlap';
    } else {
      helicalVerdict = 'optimal';
    }
  }

  // AGMA Contact Stress (Hertzian Pitting) sigma_c (MPa)
  // sigma_c = Ze * sqrt( (Wt * Ko * Kv * Ks * Km) / (d1 * b * I) )
  const contactRadicand =
    (tangentialForceN * totalBendingLoadFactor) /
    (Math.max(1, d1) * Math.max(1, inputs.faceWidthMm) * Math.max(0.01, geometryFactorI));
  const contactStressMpa = elasticCoefficientZe * Math.sqrt(Math.max(0, contactRadicand));

  // Allowable Stresses
  const allowableBendingStressMpa = material.allowableBendingMpa;
  const allowableContactStressMpa = material.allowableContactMpa;

  // Safety Factors
  const bendingSafetyFactor = allowableBendingStressMpa / Math.max(0.01, lewisBendingStressMpa);
  const contactSafetyFactor = allowableContactStressMpa / Math.max(0.01, contactStressMpa);

  // Power Capacity Calculations
  // Bending power limit is directly proportional to SF: Pb = P * (SF_b / 1.4)
  const maxPowerBendingKw = inputs.powerKw * (bendingSafetyFactor / 1.4);
  // Contact power limit is proportional to SH^2 since sigma_c ~ sqrt(P): Pc = P * (SH / 1.15)^2
  const maxPowerContactKw = inputs.powerKw * Math.pow(contactSafetyFactor / 1.15, 2);
  const maxTransmissiblePowerKw = Math.max(
    0.1,
    Math.min(maxPowerBendingKw, maxPowerContactKw)
  );

  // Safety Classification
  let status: 'SAFE' | 'MARGINAL' | 'FAIL' = 'SAFE';
  let criticalFailureMode: 'none' | 'bending_fatigue' | 'contact_pitting' = 'none';

  if (bendingSafetyFactor < 1.0 || contactSafetyFactor < 1.0) {
    status = 'FAIL';
    criticalFailureMode =
      bendingSafetyFactor < contactSafetyFactor ? 'bending_fatigue' : 'contact_pitting';
  } else if (bendingSafetyFactor < 1.4 || contactSafetyFactor < 1.15) {
    status = 'MARGINAL';
    criticalFailureMode =
      bendingSafetyFactor / 1.4 < contactSafetyFactor / 1.15
        ? 'bending_fatigue'
        : 'contact_pitting';
  }

  return {
    inputs,
    material,
    transverseModuleMm,
    pitchDiameter1Mm: d1,
    pitchDiameter2Mm: d2,
    baseDiameter1Mm,
    baseDiameter2Mm,
    tipDiameter1Mm,
    tipDiameter2Mm,
    rootDiameter1Mm,
    rootDiameter2Mm,
    centerDistanceMm,
    gearRatio,
    gearRpm,
    pitchLineVelocityMps,
    pinionTorqueNm,
    tangentialForceN,
    radialForceN,
    axialForceN,
    normalForceN,
    axialContactRatio,
    dynamicFactorKv,
    sizeFactorKs,
    loadDistFactorKm,
    geometryFactorJ,
    geometryFactorI,
    elasticCoefficientZe,
    lewisBendingStressMpa,
    contactStressMpa,
    allowableBendingStressMpa,
    allowableContactStressMpa,
    bendingSafetyFactor,
    contactSafetyFactor,
    maxPowerBendingKw,
    maxPowerContactKw,
    maxTransmissiblePowerKw,
    status,
    criticalFailureMode,
    helicalVerdict,
  };
}

export function exportGearDataToCsv(result: GearCalculationResult): void {
  const lines: string[] = [
    'Gear Strength Analysis Report (AGMA / Lewis Formulation)',
    `Generated at,${new Date().toISOString()}`,
    '',
    'PARAMETER,VALUE,UNIT',
    `Gear Type,${result.inputs.gearType.toUpperCase()},`,
    `Material,${result.material.name},`,
    `Power P,${result.inputs.powerKw.toFixed(2)},kW`,
    `Pinion Speed n1,${result.inputs.pinionRpm.toFixed(0)},RPM`,
    `Gear Speed n2,${result.gearRpm.toFixed(1)},RPM`,
    `Normal Module mn,${result.inputs.moduleMm.toFixed(2)},mm`,
    `Transverse Module mt,${result.transverseModuleMm.toFixed(3)},mm`,
    `Pinion Teeth z1,${result.inputs.pinionTeeth},`,
    `Gear Teeth z2,${result.inputs.gearTeeth},`,
    `Gear Ratio u,${result.gearRatio.toFixed(3)},:1`,
    `Face Width b,${result.inputs.faceWidthMm.toFixed(1)},mm`,
    `Pressure Angle alpha,${result.inputs.pressureAngleDeg.toFixed(1)},deg`,
    `Helix Angle psi,${result.inputs.helixAngleDeg.toFixed(1)},deg`,
    `Application Factor Ko,${result.inputs.applicationFactor.toFixed(2)},`,
    '',
    'GEOMETRIC SPECIFICATIONS,VALUE,UNIT',
    `Pinion Pitch Diameter d1,${result.pitchDiameter1Mm.toFixed(2)},mm`,
    `Gear Pitch Diameter d2,${result.pitchDiameter2Mm.toFixed(2)},mm`,
    `Center Distance a,${result.centerDistanceMm.toFixed(2)},mm`,
    `Pinion Tip Diameter da1,${result.tipDiameter1Mm.toFixed(2)},mm`,
    `Gear Tip Diameter da2,${result.tipDiameter2Mm.toFixed(2)},mm`,
    `Pinion Root Diameter df1,${result.rootDiameter1Mm.toFixed(2)},mm`,
    `Gear Root Diameter df2,${result.rootDiameter2Mm.toFixed(2)},mm`,
    `Pitch Line Velocity v,${result.pitchLineVelocityMps.toFixed(2)},m/s`,
    '',
    'LOADING & DYNAMIC FACTORS,VALUE,UNIT',
    `Pinion Torque T1,${result.pinionTorqueNm.toFixed(2)},N.m`,
    `Tangential Force Wt,${result.tangentialForceN.toFixed(1)},N`,
    `Radial Force Wr,${result.radialForceN.toFixed(1)},N`,
    `Axial Force Wa,${result.axialForceN.toFixed(1)},N`,
    `Resultant Normal Force Wn,${result.normalForceN.toFixed(1)},N`,
    `AGMA Dynamic Factor Kv,${result.dynamicFactorKv.toFixed(3)},`,
    `AGMA Size Factor Ks,${result.sizeFactorKs.toFixed(3)},`,
    `Load Distribution Factor Km,${result.loadDistFactorKm.toFixed(3)},`,
    `Bending Geometry Factor J,${result.geometryFactorJ.toFixed(3)},`,
    `Contact Geometry Factor I,${result.geometryFactorI.toFixed(4)},`,
    `Elastic Coefficient Ze,${result.elasticCoefficientZe.toFixed(1)},sqrt(MPa)`,
    '',
    'STRESSES & SAFETY ASSESSMENT,VALUE,UNIT',
    `Lewis/AGMA Bending Stress sigma_b,${result.lewisBendingStressMpa.toFixed(2)},MPa`,
    `Allowable Bending Stress [sigma_b],${result.allowableBendingStressMpa.toFixed(1)},MPa`,
    `Bending Safety Factor SF,${result.bendingSafetyFactor.toFixed(2)},`,
    `AGMA Contact Stress sigma_c,${result.contactStressMpa.toFixed(2)},MPa`,
    `Allowable Contact Stress [sigma_c],${result.allowableContactStressMpa.toFixed(1)},MPa`,
    `Contact Safety Factor SH,${result.contactSafetyFactor.toFixed(2)},`,
    `Max Transmissible Power,${result.maxTransmissiblePowerKw.toFixed(2)},kW`,
    `Status,${result.status},`,
    `Critical Mode,${result.criticalFailureMode},`,
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gear-strength-analysis-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
