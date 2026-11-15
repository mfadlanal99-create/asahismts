import {
  shrinkFitContactPressure,
  shrinkFitTorqueCapacity,
  timoshenkoBimetalCurvature,
  bimetalTipDeflection,
} from '../../physics';

export type ThermalMaterialId =
  | 'steel-a36'
  | 'aluminum-6061'
  | 'stainless-304'
  | 'copper-c110'
  | 'brass-c360'
  | 'invar-36'
  | 'titanium-ti6al4v';

export interface ThermalMaterial {
  id: ThermalMaterialId;
  name: string;
  category: 'ferrous' | 'non-ferrous' | 'alloy' | 'special';
  /** Coefficient of linear thermal expansion α in 10^-6 / °C (µm / m·°C) */
  alpha: number;
  /** Young's Modulus E in GPa */
  youngsModulusGpa: number;
  /** Poisson's Ratio ν */
  poissonsRatio: number;
  /** Yield strength σ_y in MPa */
  yieldStrengthMpa: number;
  /** Density ρ in kg/m³ */
  densityKgM3: number;
  /** Thermal conductivity k in W/(m·K) */
  thermalConductivityWmK: number;
  color: string;
  badgeHex: string;
  descriptionEn: string;
  descriptionId: string;
  descriptionJa: string;
}

export const THERMAL_MATERIALS: ThermalMaterial[] = [
  {
    id: 'steel-a36',
    name: 'Structural Steel (ASTM A36)',
    category: 'ferrous',
    alpha: 12.0,
    youngsModulusGpa: 200.0,
    poissonsRatio: 0.3,
    yieldStrengthMpa: 250.0,
    densityKgM3: 7850,
    thermalConductivityWmK: 50.4,
    color: '#64748b',
    badgeHex: '#475569',
    descriptionEn: 'Standard structural carbon steel used in bridges, piping, and general machine frames.',
    descriptionId: 'Baja karbon struktural standar untuk jembatan, perpipaan, dan rangka mesin umum.',
    descriptionJa: '橋梁、配管、一般的な機械構造物に使用される標準的な構造用低炭素鋼。',
  },
  {
    id: 'aluminum-6061',
    name: 'Aluminum 6061-T6',
    category: 'non-ferrous',
    alpha: 23.6,
    youngsModulusGpa: 68.9,
    poissonsRatio: 0.33,
    yieldStrengthMpa: 276.0,
    densityKgM3: 2700,
    thermalConductivityWmK: 167.0,
    color: '#38bdf8',
    badgeHex: '#0284c7',
    descriptionEn: 'High strength-to-weight structural alloy; expands nearly 2x faster than carbon steel.',
    descriptionId: 'Paduan struktural berbobot ringan; memuai hampir 2 kali lebih cepat dibanding baja karbon.',
    descriptionJa: '軽量高強度な構造用合金。炭素鋼の約2倍の熱膨張係数を持ちます。',
  },
  {
    id: 'stainless-304',
    name: 'Austenitic Stainless 304',
    category: 'ferrous',
    alpha: 17.3,
    youngsModulusGpa: 193.0,
    poissonsRatio: 0.29,
    yieldStrengthMpa: 215.0,
    densityKgM3: 8000,
    thermalConductivityWmK: 16.2,
    color: '#94a3b8',
    badgeHex: '#64748b',
    descriptionEn: 'Corrosion resistant austenitic alloy with higher thermal expansion and lower conductivity.',
    descriptionId: 'Paduan austenitik tahan karat dengan ekspansi termal tinggi dan konduktivitas termal rendah.',
    descriptionJa: '優れた耐食性を持つオーステナイト系ステンレス鋼。炭素鋼より熱膨張が大きくなります。',
  },
  {
    id: 'copper-c110',
    name: 'ETP Copper C110',
    category: 'non-ferrous',
    alpha: 16.5,
    youngsModulusGpa: 117.0,
    poissonsRatio: 0.34,
    yieldStrengthMpa: 100.0,
    densityKgM3: 8940,
    thermalConductivityWmK: 388.0,
    color: '#f97316',
    badgeHex: '#ea580c',
    descriptionEn: 'High electrical and thermal conductivity metal; ductile and thermal fatigue sensitive.',
    descriptionId: 'Logam konduktivitas listrik & termal tinggi; ulet dan sensitif kelelahan termal.',
    descriptionJa: '極めて高い電気・熱伝導率を誇る純銅。高い熱膨張と優れた延性を持ちます。',
  },
  {
    id: 'brass-c360',
    name: 'Free-Cutting Brass C360',
    category: 'alloy',
    alpha: 20.5,
    youngsModulusGpa: 105.0,
    poissonsRatio: 0.35,
    yieldStrengthMpa: 310.0,
    densityKgM3: 8500,
    thermalConductivityWmK: 115.0,
    color: '#eab308',
    badgeHex: '#ca8a04',
    descriptionEn: 'Copper-zinc alloy with high machinability and high thermal expansion; ideal bimetal active strip.',
    descriptionId: 'Paduan tembaga-seng dengan kemampumesinan tinggi; elemen aktif utama strip bimetal.',
    descriptionJa: '優れた快削性を有する真鍮合金。熱膨張が大きくバイメタルの高膨張側に頻用。',
  },
  {
    id: 'invar-36',
    name: 'Invar 36 (FeNi36)',
    category: 'special',
    alpha: 1.2,
    youngsModulusGpa: 145.0,
    poissonsRatio: 0.3,
    yieldStrengthMpa: 240.0,
    densityKgM3: 8050,
    thermalConductivityWmK: 10.5,
    color: '#a855f7',
    badgeHex: '#9333ea',
    descriptionEn: 'Nickel-iron alloy engineered for near-zero thermal expansion via spontaneous magnetostriction.',
    descriptionId: 'Paduan nikel-besi dengan ekspansi termal mendekati nol melalui magnetostriksi spontan.',
    descriptionJa: '自発磁歪効果により室温付近で熱膨張がほぼゼロとなるインバー特殊ニッケル合金。',
  },
  {
    id: 'titanium-ti6al4v',
    name: 'Titanium Ti-6Al-4V (Gr 5)',
    category: 'alloy',
    alpha: 8.6,
    youngsModulusGpa: 113.8,
    poissonsRatio: 0.34,
    yieldStrengthMpa: 880.0,
    densityKgM3: 4430,
    thermalConductivityWmK: 6.7,
    color: '#6366f1',
    badgeHex: '#4f46e5',
    descriptionEn: 'Aerospace grade alloy with low thermal expansion, high yield strength, and light weight.',
    descriptionId: 'Paduan kedirgantaraan dengan ekspansi termal rendah, kekuatan luluh sangat tinggi, dan ringan.',
    descriptionJa: '低熱膨張・高降伏強度・軽量性を兼ね備えた航空宇宙用最高峰チタン合金。',
  },
];

export type SimulatorMode = 'bar-constraint' | 'shrink-fit' | 'bimetallic';

// ----------------------------------------------------
// Mode 1: Bar Expansion & Constraint
// ----------------------------------------------------
export interface BarExpansionInputs {
  material: ThermalMaterial;
  lengthMm: number; // e.g. 1000 mm
  diameterMm: number; // e.g. 30 mm
  initialTempC: number; // 20 °C
  currentTempC: number; // -50 to 500 °C
  isConstrained: boolean;
  gapMm: number; // 0 to 5 mm
}

export interface BarExpansionResults {
  deltaTC: number;
  freeExpansionMm: number;
  actualExpansionMm: number;
  restrainedDisplacementMm: number;
  crossSectionAreaMm2: number;
  thermalStrain: number;
  thermalStressMpa: number; // Compressive stress when expanding against wall
  thrustForceKn: number; // Axial force pushing against abutment
  isContactingWall: boolean;
  isYielded: boolean;
  yieldSafetyFactor: number;
}

export function computeBarExpansion(inputs: BarExpansionInputs): BarExpansionResults {
  const deltaTC = inputs.currentTempC - inputs.initialTempC;
  const alphaDecimal = inputs.material.alpha * 1e-6;
  const freeExpansionMm = alphaDecimal * inputs.lengthMm * deltaTC;
  const crossSectionAreaMm2 = (Math.PI / 4) * Math.pow(inputs.diameterMm, 2);

  if (!inputs.isConstrained) {
    return {
      deltaTC,
      freeExpansionMm,
      actualExpansionMm: freeExpansionMm,
      restrainedDisplacementMm: 0,
      crossSectionAreaMm2,
      thermalStrain: 0,
      thermalStressMpa: 0,
      thrustForceKn: 0,
      isContactingWall: false,
      isYielded: false,
      yieldSafetyFactor: Infinity,
    };
  }

  // Constrained mode with rigid abutment wall at distance gapMm
  if (freeExpansionMm <= inputs.gapMm) {
    return {
      deltaTC,
      freeExpansionMm,
      actualExpansionMm: freeExpansionMm,
      restrainedDisplacementMm: 0,
      crossSectionAreaMm2,
      thermalStrain: 0,
      thermalStressMpa: 0,
      thrustForceKn: 0,
      isContactingWall: false,
      isYielded: false,
      yieldSafetyFactor: Infinity,
    };
  }

  // Contacts wall: free expansion exceeds the gap
  const actualExpansionMm = inputs.gapMm;
  const restrainedDisplacementMm = freeExpansionMm - inputs.gapMm;
  const thermalStrain = restrainedDisplacementMm / inputs.lengthMm;
  const youngsModulusMpa = inputs.material.youngsModulusGpa * 1e3;
  const thermalStressMpa = youngsModulusMpa * thermalStrain;
  const thrustForceN = thermalStressMpa * crossSectionAreaMm2;
  const thrustForceKn = thrustForceN / 1e3;
  const isYielded = thermalStressMpa >= inputs.material.yieldStrengthMpa;
  const yieldSafetyFactor =
    thermalStressMpa > 0
      ? inputs.material.yieldStrengthMpa / thermalStressMpa
      : Infinity;

  return {
    deltaTC,
    freeExpansionMm,
    actualExpansionMm,
    restrainedDisplacementMm,
    crossSectionAreaMm2,
    thermalStrain,
    thermalStressMpa,
    thrustForceKn,
    isContactingWall: true,
    isYielded,
    yieldSafetyFactor,
  };
}

// ----------------------------------------------------
// Mode 2: Shrink Fit Hub-on-Shaft
// ----------------------------------------------------
export interface ShrinkFitInputs {
  shaftMaterial: ThermalMaterial;
  hubMaterial: ThermalMaterial;
  shaftDiameterMm: number; // d, nominal e.g. 60 mm
  hubOuterDiameterMm: number; // Do, e.g. 120 mm
  engagementLengthMm: number; // L, e.g. 80 mm
  diametralInterferenceMm: number; // δ, e.g. 0.06 mm (60 µm)
  frictionCoeff: number; // µ, e.g. 0.18
  heatingDeltaTC: number; // Hub heating temperature rise ΔT
}

export interface ShrinkFitResults {
  hubBoreExpansionMm: number;
  assemblyClearanceMm: number;
  canSlipFit: boolean;
  minDeltaTZeroClearanceC: number;
  recommendedDeltaTC: number; // with 0.02 mm safety clearance
  contactPressureMpa: number;
  torqueCapacityNm: number;
  axialHoldingForceKn: number;
  hubInnerHoopStressMpa: number;
  hubInnerVonMisesStressMpa: number;
  hubSafetyFactor: number;
  isHubYielded: boolean;
}

export function computeShrinkFit(inputs: ShrinkFitInputs): ShrinkFitResults {
  const d = inputs.shaftDiameterMm;
  const Do = inputs.hubOuterDiameterMm;
  const L = inputs.engagementLengthMm;
  const delta = inputs.diametralInterferenceMm;
  const mu = inputs.frictionCoeff;

  const alphaHub = inputs.hubMaterial.alpha * 1e-6;
  const hubBoreExpansionMm = alphaHub * d * inputs.heatingDeltaTC;
  const assemblyClearanceMm = hubBoreExpansionMm - delta;
  const canSlipFit = assemblyClearanceMm >= 0;

  const minDeltaTZeroClearanceC = delta / (alphaHub * d);
  const recommendedDeltaTC = (delta + 0.02) / (alphaHub * d);

  // Elastic Lamé contact pressure for solid shaft inside thick hollow hub via mechanics physics engine:
  const nus = inputs.shaftMaterial.poissonsRatio;
  const nuh = inputs.hubMaterial.poissonsRatio;

  const contactPressurePa = shrinkFitContactPressure(
    delta * 1e-3,
    (d / 2) * 1e-3, // interface radius R
    0, // solid shaft inner radius
    (Do / 2) * 1e-3, // hub outer radius Ro
    inputs.shaftMaterial.youngsModulusGpa * 1e9,
    nus,
    inputs.hubMaterial.youngsModulusGpa * 1e9,
    nuh
  );
  const contactPressureMpa = contactPressurePa / 1e6;

  // Torque capacity T = µ * p_c * π * d * L * (d / 2) via mechanics physics engine
  const torqueCapacityNm = shrinkFitTorqueCapacity(
    contactPressurePa,
    (d / 2) * 1e-3,
    L * 1e-3,
    mu
  );

  // Axial holding force F = µ * p_c * π * d * L
  // [N] => / 1000 => kN
  const axialHoldingForceKn = (mu * contactPressureMpa * Math.PI * d * L) / 1e3;

  // Maximum hoop stress at hub inner bore: σ_θ = p_c * (Do² + d²) / (Do² - d²)
  const hubRatio = (Math.pow(Do, 2) + Math.pow(d, 2)) / (Math.pow(Do, 2) - Math.pow(d, 2));
  const hubInnerHoopStressMpa = contactPressureMpa * hubRatio;

  // Radial stress at hub bore: σ_r = -p_c
  // Von Mises: σ_vm = sqrt(σ_θ² - σ_θ * σ_r + σ_r²) = sqrt(σ_θ² + σ_θ * p_c + p_c²)
  const hubInnerVonMisesStressMpa = Math.sqrt(
    Math.pow(hubInnerHoopStressMpa, 2) +
      hubInnerHoopStressMpa * contactPressureMpa +
      Math.pow(contactPressureMpa, 2)
  );

  const hubYieldStrengthMpa = inputs.hubMaterial.yieldStrengthMpa;
  const hubSafetyFactor =
    hubInnerVonMisesStressMpa > 0
      ? hubYieldStrengthMpa / hubInnerVonMisesStressMpa
      : Infinity;
  const isHubYielded = hubInnerVonMisesStressMpa >= hubYieldStrengthMpa;

  return {
    hubBoreExpansionMm,
    assemblyClearanceMm,
    canSlipFit,
    minDeltaTZeroClearanceC,
    recommendedDeltaTC,
    contactPressureMpa,
    torqueCapacityNm,
    axialHoldingForceKn,
    hubInnerHoopStressMpa,
    hubInnerVonMisesStressMpa,
    hubSafetyFactor,
    isHubYielded,
  };
}

// ----------------------------------------------------
// Mode 3: Bimetallic Strip
// ----------------------------------------------------
export interface BimetallicStripInputs {
  layer1Material: ThermalMaterial; // Top / High-expansion
  layer2Material: ThermalMaterial; // Bottom / Low-expansion
  lengthMm: number; // e.g. 120 mm
  widthMm: number; // e.g. 12 mm
  layer1ThicknessMm: number; // t1, e.g. 1.0 mm
  layer2ThicknessMm: number; // t2, e.g. 1.0 mm
  initialTempC: number; // 20 °C
  currentTempC: number; // -50 to 300 °C
  switchGapMm: number; // e.g. 2.5 mm
}

export interface BimetallicStripResults {
  deltaTC: number;
  totalThicknessMm: number;
  thicknessRatioM: number;
  modulusRatioN: number;
  curvatureMm1: number; // κ = 1 / ρ (1/mm)
  radiusOfCurvatureMm: number; // ρ
  tipDeflectionMm: number; // δ_tip
  tipAngleDeg: number;
  isSwitchClosed: boolean;
  tripTempC: number;
  tripDeltaTC: number;
}

export function computeBimetallicStrip(
  inputs: BimetallicStripInputs
): BimetallicStripResults {
  const deltaTC = inputs.currentTempC - inputs.initialTempC;
  const t1 = inputs.layer1ThicknessMm;
  const t2 = inputs.layer2ThicknessMm;
  const h = t1 + t2;
  const m = t1 / t2;

  const E1 = inputs.layer1Material.youngsModulusGpa;
  const E2 = inputs.layer2Material.youngsModulusGpa;
  const n = E1 / E2;

  const alpha1 = inputs.layer1Material.alpha * 1e-6;
  const alpha2 = inputs.layer2Material.alpha * 1e-6;
  const deltaAlpha = alpha1 - alpha2;

  // Timoshenko formula (1925) for bimetallic strip curvature via mechanics physics engine:
  const curvatureM1 = timoshenkoBimetalCurvature(
    alpha1,
    alpha2,
    deltaTC,
    t1 * 1e-3,
    t2 * 1e-3,
    inputs.layer1Material.youngsModulusGpa * 1e9,
    inputs.layer2Material.youngsModulusGpa * 1e9
  );
  const curvatureMm1 = curvatureM1 / 1000;
  const radiusOfCurvatureMm =
    curvatureMm1 !== 0 ? 1 / Math.abs(curvatureMm1) : Infinity;

  // Cantilever tip deflection δ_tip via mechanics physics engine
  const tipDeflectionMm = bimetalTipDeflection(curvatureM1, inputs.lengthMm * 1e-3) * 1000;
  const tipAngleRad = curvatureMm1 * inputs.lengthMm;
  const tipAngleDeg = (tipAngleRad * 180) / Math.PI;

  const isSwitchClosed = tipDeflectionMm >= inputs.switchGapMm;

  // Trip temperature: deflection = switchGapMm => κ_trip = 2 * gap / L²
  const denomCoeff =
    3 * Math.pow(1 + m, 2) + (1 + m * n) * (Math.pow(m, 2) + 1 / (m * n));
  const denom = h * denomCoeff;
  const reqCurvature = (2 * inputs.switchGapMm) / Math.pow(inputs.lengthMm, 2);
  const tripDeltaTC =
    deltaAlpha !== 0
      ? (reqCurvature * denom) / (6 * deltaAlpha * Math.pow(1 + m, 2))
      : Infinity;
  const tripTempC = inputs.initialTempC + tripDeltaTC;

  return {
    deltaTC,
    totalThicknessMm: h,
    thicknessRatioM: m,
    modulusRatioN: n,
    curvatureMm1,
    radiusOfCurvatureMm,
    tipDeflectionMm,
    tipAngleDeg,
    isSwitchClosed,
    tripTempC,
    tripDeltaTC,
  };
}

// ----------------------------------------------------
// Presets
// ----------------------------------------------------
export interface SimulatorPreset {
  id: string;
  name: string;
  nameId: string;
  nameJa: string;
  mode: SimulatorMode;
  description: string;
  descriptionId: string;
  descriptionJa: string;
  barConfig?: Partial<BarExpansionInputs>;
  shrinkConfig?: Partial<ShrinkFitInputs>;
  bimetalConfig?: Partial<BimetallicStripInputs>;
}

export const PRESETS: SimulatorPreset[] = [
  {
    id: 'steam-pipe-restrained',
    name: 'High-Pressure Steam Pipe with Expansion Gap',
    nameId: 'Pipa Uap Tekanan Tinggi dengan Celah Ekspansi',
    nameJa: '膨張隙間付き高圧蒸気配管の熱応力拘束',
    mode: 'bar-constraint',
    description: 'Long carbon steel pipe heated to 250°C. Absorbs 0.8 mm gap before exerting massive compressive axial thrust.',
    descriptionId: 'Pipa baja karbon panjang dipanaskan ke 250°C. Menyerap celah 0.8 mm sebelum menghasilkan gaya dorong aksial masif.',
    descriptionJa: '250°Cまで加熱される長尺炭素鋼配管。0.8mmの隙間を埋めた後、拘束壁に強大な圧縮熱推力を及ぼします。',
    barConfig: {
      material: THERMAL_MATERIALS[0], // Steel A36
      lengthMm: 1200,
      diameterMm: 50,
      initialTempC: 20,
      currentTempC: 250,
      isConstrained: true,
      gapMm: 0.8,
    },
  },
  {
    id: 'aluminum-rail-sunlight',
    name: 'Aluminum Solar Mounting Rail in Desert Sun',
    nameId: 'Rel Dudukan Panel Surya Aluminium di Bawah Terik Matahari',
    nameJa: '直射日光下におけるアルミ製ソーラー架台レールの自由膨張',
    mode: 'bar-constraint',
    description: 'Aluminum 6061-T6 rail expanding under outdoor solar radiation without constraints.',
    descriptionId: 'Rel aluminium 6061-T6 memuai bebas akibat radiasi panas matahari gurun tanpa kekangan.',
    descriptionJa: '日射熱で昇温するアルミ6061-T6製架台。炭素鋼の2倍のペースで生じる自由膨張を観察します。',
    barConfig: {
      material: THERMAL_MATERIALS[1], // Aluminum 6061
      lengthMm: 1500,
      diameterMm: 35,
      initialTempC: 20,
      currentTempC: 85,
      isConstrained: false,
      gapMm: 1.0,
    },
  },
  {
    id: 'heavy-gear-shrinkfit',
    name: 'Industrial Heavy Gear Induction Shrink Fit',
    nameId: 'Pemasangan Roda Gigi Industri dengan Shrink Fit Induksi',
    nameJa: '産業用大型歯車の誘導加熱焼きばめ締結',
    mode: 'shrink-fit',
    description: '60 µm interference fit on 80 mm shaft. Requires 160°C hub heating for easy slip-on assembly.',
    descriptionId: 'Interferensi 60 µm pada poros 80 mm. Memerlukan pemanasan hub 160°C untuk pemasangan presisi.',
    descriptionJa: '80mm軸に60µmのはめあい締しろ。約160°Cの誘導加熱により滑らかな焼きばめ挿入を実現します。',
    shrinkConfig: {
      shaftMaterial: THERMAL_MATERIALS[0], // Steel A36
      hubMaterial: THERMAL_MATERIALS[0], // Steel A36
      shaftDiameterMm: 80,
      hubOuterDiameterMm: 160,
      engagementLengthMm: 100,
      diametralInterferenceMm: 0.06,
      frictionCoeff: 0.18,
      heatingDeltaTC: 160,
    },
  },
  {
    id: 'bimetal-thermostat-switch',
    name: 'Snap-Action Bimetal Thermostat Element',
    nameId: 'Elemen Sakelar Termostat Bimetal Reaktif',
    nameJa: '高感度バイメタル・サーモスタット素子（接点開閉）',
    mode: 'bimetallic',
    description: 'Brass C360 and Invar 36 composite strip deflecting to trip an electrical safety contact at 85°C.',
    descriptionId: 'Strip komposit kuningan C360 dan Invar 36 melengkung untuk memicu kontak listrik pengaman pada 85°C.',
    descriptionJa: '黄銅C360（高膨張）とインバー36（超低膨張）の接合帯。昇温による曲がりで電気接点を瞬時にトリップ。',
    bimetalConfig: {
      layer1Material: THERMAL_MATERIALS[4], // Brass C360
      layer2Material: THERMAL_MATERIALS[5], // Invar 36
      lengthMm: 100,
      widthMm: 10,
      layer1ThicknessMm: 0.8,
      layer2ThicknessMm: 0.8,
      initialTempC: 20,
      currentTempC: 85,
      switchGapMm: 2.0,
    },
  },
];

// ----------------------------------------------------
// CSV Export Helper
// ----------------------------------------------------
export function exportThermalDataToCsv(
  mode: SimulatorMode,
  barData?: { inputs: BarExpansionInputs; results: BarExpansionResults },
  shrinkData?: { inputs: ShrinkFitInputs; results: ShrinkFitResults },
  bimetalData?: { inputs: BimetallicStripInputs; results: BimetallicStripResults }
): void {
  const rows: string[][] = [
    ['Thermal Expansion & Shrink Fit Simulator Data Export'],
    ['Timestamp', new Date().toISOString()],
    ['Mode', mode],
    [],
  ];

  if (mode === 'bar-constraint' && barData) {
    const { inputs, results } = barData;
    rows.push(
      ['Parameter', 'Value', 'Unit'],
      ['Material', inputs.material.name, ''],
      ['Alpha (CTE)', inputs.material.alpha.toString(), '10^-6 / °C'],
      ['Youngs Modulus', inputs.material.youngsModulusGpa.toString(), 'GPa'],
      ['Initial Length L0', inputs.lengthMm.toString(), 'mm'],
      ['Diameter d', inputs.diameterMm.toString(), 'mm'],
      ['Cross Section Area A', results.crossSectionAreaMm2.toFixed(2), 'mm²'],
      ['Initial Temp T0', inputs.initialTempC.toString(), '°C'],
      ['Current Temp T', inputs.currentTempC.toString(), '°C'],
      ['Delta T', results.deltaTC.toFixed(1), '°C'],
      ['Constraint Enabled', inputs.isConstrained ? 'YES' : 'NO', ''],
      ['Abutment Gap', inputs.gapMm.toString(), 'mm'],
      ['Free Thermal Expansion', results.freeExpansionMm.toFixed(4), 'mm'],
      ['Actual Expansion', results.actualExpansionMm.toFixed(4), 'mm'],
      ['Restrained Displacement', results.restrainedDisplacementMm.toFixed(4), 'mm'],
      ['Thermal Strain', results.thermalStrain.toFixed(6), 'mm/mm'],
      ['Thermal Stress (Compressive)', results.thermalStressMpa.toFixed(2), 'MPa'],
      ['Axial Thrust Force', results.thrustForceKn.toFixed(3), 'kN'],
      ['Contacting Wall', results.isContactingWall ? 'YES' : 'NO', ''],
      ['Yield Exceeded', results.isYielded ? 'YES' : 'NO', '']
    );
  } else if (mode === 'shrink-fit' && shrinkData) {
    const { inputs, results } = shrinkData;
    rows.push(
      ['Parameter', 'Value', 'Unit'],
      ['Shaft Material', inputs.shaftMaterial.name, ''],
      ['Hub Material', inputs.hubMaterial.name, ''],
      ['Shaft OD (d)', inputs.shaftDiameterMm.toString(), 'mm'],
      ['Hub OD (Do)', inputs.hubOuterDiameterMm.toString(), 'mm'],
      ['Engagement Length (L)', inputs.engagementLengthMm.toString(), 'mm'],
      ['Diametral Interference (δ)', inputs.diametralInterferenceMm.toString(), 'mm'],
      ['Friction Coefficient (µ)', inputs.frictionCoeff.toString(), ''],
      ['Hub Heating Delta T', inputs.heatingDeltaTC.toString(), '°C'],
      ['Hub Bore Expansion (Hot)', results.hubBoreExpansionMm.toFixed(4), 'mm'],
      ['Assembly Net Clearance', results.assemblyClearanceMm.toFixed(4), 'mm'],
      ['Can Slip Fit', results.canSlipFit ? 'YES' : 'NO', ''],
      ['Min Delta T (Zero Clearance)', results.minDeltaTZeroClearanceC.toFixed(1), '°C'],
      ['Recommended Delta T (+20µm)', results.recommendedDeltaTC.toFixed(1), '°C'],
      ['Contact Pressure (Operating)', results.contactPressureMpa.toFixed(2), 'MPa'],
      ['Transmitted Torque Capacity', results.torqueCapacityNm.toFixed(1), 'N·m'],
      ['Axial Holding Force', results.axialHoldingForceKn.toFixed(2), 'kN'],
      ['Hub Bore Hoop Stress', results.hubInnerHoopStressMpa.toFixed(2), 'MPa'],
      ['Hub Von Mises Stress', results.hubInnerVonMisesStressMpa.toFixed(2), 'MPa'],
      ['Hub Safety Factor', results.hubSafetyFactor.toFixed(2), ''],
      ['Hub Yielded', results.isHubYielded ? 'YES' : 'NO', '']
    );
  } else if (mode === 'bimetallic' && bimetalData) {
    const { inputs, results } = bimetalData;
    rows.push(
      ['Parameter', 'Value', 'Unit'],
      ['Layer 1 Material (High α)', inputs.layer1Material.name, ''],
      ['Layer 1 Alpha', inputs.layer1Material.alpha.toString(), '10^-6 / °C'],
      ['Layer 1 Thickness t1', inputs.layer1ThicknessMm.toString(), 'mm'],
      ['Layer 2 Material (Low α)', inputs.layer2Material.name, ''],
      ['Layer 2 Alpha', inputs.layer2Material.alpha.toString(), '10^-6 / °C'],
      ['Layer 2 Thickness t2', inputs.layer2ThicknessMm.toString(), 'mm'],
      ['Strip Length L0', inputs.lengthMm.toString(), 'mm'],
      ['Strip Width w', inputs.widthMm.toString(), 'mm'],
      ['Initial Temp T0', inputs.initialTempC.toString(), '°C'],
      ['Current Temp T', inputs.currentTempC.toString(), '°C'],
      ['Delta T', results.deltaTC.toFixed(1), '°C'],
      ['Curvature (κ)', results.curvatureMm1.toFixed(6), '1/mm'],
      ['Radius of Curvature (ρ)', results.radiusOfCurvatureMm.toFixed(1), 'mm'],
      ['Tip Deflection (δ_tip)', results.tipDeflectionMm.toFixed(3), 'mm'],
      ['Tip Angle', results.tipAngleDeg.toFixed(2), 'deg'],
      ['Switch Contact Gap', inputs.switchGapMm.toString(), 'mm'],
      ['Switch Status', results.isSwitchClosed ? 'CLOSED (TRIPPED)' : 'OPEN', ''],
      ['Calculated Trip Temp', results.tripTempC.toFixed(1), '°C']
    );
  }

  const csvContent = rows
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `thermal_expansion_${mode}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
