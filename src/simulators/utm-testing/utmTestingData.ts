import {
  hookesLawStress,
  modulusOfResilience,
  circularSectionProps,
  mmToM,
} from '../../physics';

export type TestMode = 'tensile' | 'compression';

export interface MaterialProperties {
  id: string;
  name: string;
  category: 'ferrous' | 'non-ferrous' | 'polymer';
  youngsModulusGpa: number; // E (GPa)
  yieldStrengthMpa: number; // σ_y (MPa)
  utsMpa: number; // Ultimate Tensile Strength (MPa)
  elongationPct: number; // %EL at fracture (%)
  reductionOfAreaPct: number; // %RA at fracture (%)
  poissonsRatio: number; // ν
  compressiveYieldMpa: number; // σ_yc (MPa)
  compressiveUltimateMpa?: number; // For brittle materials like Gray Cast Iron
  compressiveFractureStrainPct?: number;
  behavior: 'ductile' | 'brittle';
  color: string;
  descriptionEn: string;
  descriptionId: string;
  descriptionJa: string;
}

export const PRESET_MATERIALS: MaterialProperties[] = [
  {
    id: 'steel-a36',
    name: 'Mild Steel A36',
    category: 'ferrous',
    youngsModulusGpa: 200,
    yieldStrengthMpa: 250,
    utsMpa: 400,
    elongationPct: 25,
    reductionOfAreaPct: 55,
    poissonsRatio: 0.30,
    compressiveYieldMpa: 250,
    behavior: 'ductile',
    color: '#64748b',
    descriptionEn: 'Standard structural low-carbon steel with distinct yielding, significant strain hardening, and high ductility.',
    descriptionId: 'Baja karbon rendah struktural standar dengan fenomena luluh jelas, pengerasan regang, dan keuletan tinggi.',
    descriptionJa: '明確な降伏現象、高い加工硬化能、優れた延性を備えた標準的な構造用低炭素鋼。',
  },
  {
    id: 'al-6061-t6',
    name: 'Aluminum 6061-T6',
    category: 'non-ferrous',
    youngsModulusGpa: 69,
    yieldStrengthMpa: 276,
    utsMpa: 310,
    elongationPct: 15,
    reductionOfAreaPct: 35,
    poissonsRatio: 0.33,
    compressiveYieldMpa: 276,
    behavior: 'ductile',
    color: '#94a3b8',
    descriptionEn: 'Precipitation-hardened aerospace alloy with continuous elastic-plastic transition and moderate ductility.',
    descriptionId: 'Paduan aluminium dirgantara berpengerasan endapan dengan transisi elastis-plastis halus dan keuletan sedang.',
    descriptionJa: '析出硬化処理された航空宇宙用アルミニウム合金。連続的な降伏挙動と適度な延性を示します。',
  },
  {
    id: 'ti-6al-4v',
    name: 'Titanium Ti-6Al-4V',
    category: 'non-ferrous',
    youngsModulusGpa: 114,
    yieldStrengthMpa: 880,
    utsMpa: 950,
    elongationPct: 14,
    reductionOfAreaPct: 36,
    poissonsRatio: 0.34,
    compressiveYieldMpa: 920,
    behavior: 'ductile',
    color: '#71717a',
    descriptionEn: 'High-strength alpha-beta titanium alloy combining superior specific strength with high fracture toughness.',
    descriptionId: 'Paduan titanium alfa-beta berkekuatan tinggi dengan rasio kekuatan-terhadap-bobot unggul dan ketangguhan retak tinggi.',
    descriptionJa: '優れた比強度と高い破壊靱性を兼ね備えた高強度α-β型チタン合金。',
  },
  {
    id: 'annealed-copper',
    name: 'Annealed Copper',
    category: 'non-ferrous',
    youngsModulusGpa: 115,
    yieldStrengthMpa: 70,
    utsMpa: 220,
    elongationPct: 45,
    reductionOfAreaPct: 65,
    poissonsRatio: 0.34,
    compressiveYieldMpa: 70,
    behavior: 'ductile',
    color: '#d97706',
    descriptionEn: 'High-conductivity pure copper exhibiting low initial yield stress, massive work hardening, and extreme ductility.',
    descriptionId: 'Tembaga murni anil dengan konduktivitas tinggi, tegangan luluh rendah, pengerasan kerja masif, dan keuletan luar biasa.',
    descriptionJa: '低降伏応力、極めて高い加工硬化能、卓越した延性を示す高純度焼鈍銅。',
  },
  {
    id: 'nylon-66',
    name: 'Nylon 6.6',
    category: 'polymer',
    youngsModulusGpa: 2.8,
    yieldStrengthMpa: 55,
    utsMpa: 82,
    elongationPct: 60,
    reductionOfAreaPct: 55,
    poissonsRatio: 0.40,
    compressiveYieldMpa: 80,
    behavior: 'ductile',
    color: '#cbd5e1',
    descriptionEn: 'Semicrystalline engineering polyamide with low elastic modulus, viscoelastic response, and high elongation.',
    descriptionId: 'Poliamida rekayasa semikristalin dengan modulus elastisitas rendah, respons viskoelastik, dan perpanjangan tinggi.',
    descriptionJa: '低弾性率、粘弾性特性、大きな塑性伸びを示すエンジニアリング半結晶性ポリアミド樹脂。',
  },
  {
    id: 'cast-iron-a48',
    name: 'Gray Cast Iron ASTM A48',
    category: 'ferrous',
    youngsModulusGpa: 110,
    yieldStrengthMpa: 165,
    utsMpa: 170,
    elongationPct: 0.8,
    reductionOfAreaPct: 0.5,
    poissonsRatio: 0.26,
    compressiveYieldMpa: 580,
    compressiveUltimateMpa: 650,
    compressiveFractureStrainPct: 2.2,
    behavior: 'brittle',
    color: '#475569',
    descriptionEn: 'Flake graphite microstructure with brittle tensile cleavage failure, but nearly 4x higher strength in compression.',
    descriptionId: 'Struktur serpihan grafit dengan patahan getas pada uji tarik, namun hampir 4 kali lebih kuat menahan beban tekan.',
    descriptionJa: '片状黒鉛組織による脆性引張破壊を示す一方、圧縮下では約4倍もの高耐力を発揮するねずみ鋳鉄。',
  },
];

export interface UtmTestInputs {
  mode: TestMode;
  material: MaterialProperties;
  diameterMm: number; // d0: 6 - 20 mm
  gaugeLengthMm: number; // L0: 25 - 100 mm
  crossheadSpeedMmMin: number; // 1 - 50 mm/min
}

export interface UtmDataPoint {
  timeSec: number;
  extensionMm: number;
  strainPct: number;
  forceKn: number;
  stressMpa: number;
}

export interface UtmInstantaneousState {
  timeSec: number;
  extensionMm: number;
  strain: number;
  strainPct: number;
  stressMpa: number;
  forceKn: number;
  isYielded: boolean;
  isNecking: boolean;
  isFractured: boolean;
  currentSpecimenLengthMm: number;
  currentCenterDiameterMm: number;
  currentEndDiameterMm: number;
  reductionOfAreaPct: number;
  stressHeatmapRatio: number; // 0 to 1
  fractureGapMm: number; // distance between broken faces if fractured
}

export interface CurveKeyPoints {
  yieldPoint: UtmDataPoint;
  utsPoint: UtmDataPoint;
  fracturePoint: UtmDataPoint;
  offsetYieldLine: {
    start: [number, number]; // [strainPct, stressMpa]
    end: [number, number];
  };
  maxStrainPct: number;
  maxStressMpa: number;
  maxForceKn: number;
  maxExtensionMm: number;
}

/**
 * Calculates instantaneous tensile or compressive state at a given crosshead displacement.
 */
export function computeUtmState(
  extensionMm: number,
  timeSec: number,
  inputs: UtmTestInputs
): UtmInstantaneousState {
  const { mode, material, diameterMm, gaugeLengthMm } = inputs;
  const a0 = circularSectionProps(mmToM(diameterMm)).area * 1e6; // mm²
  const E_mpa = material.youngsModulusGpa * 1000;

  if (mode === 'tensile') {
    const strain = Math.max(0, extensionMm / gaugeLengthMm);
    const strainPct = strain * 100;
    const yieldStrain = material.yieldStrengthMpa / E_mpa;
    const fractureStrain = material.elongationPct / 100;

    // Necking onset strain
    const neckingStrain =
      material.behavior === 'brittle'
        ? fractureStrain
        : Math.min(
            fractureStrain * 0.72,
            Math.max(yieldStrain * 1.5, yieldStrain + 0.08)
          );

    const isFractured = strain >= fractureStrain;
    const isNecking = strain > neckingStrain && !isFractured;
    const isYielded = strain >= yieldStrain;

    let stressMpa = 0;

    if (isFractured) {
      stressMpa = 0;
    } else if (strain <= yieldStrain) {
      // Elastic region: Hooke's Law σ = E * ε
      stressMpa = hookesLawStress(E_mpa * 1e6, strain) / 1e6;
    } else if (strain <= neckingStrain) {
      // Uniform plastic strain hardening up to UTS
      const p = (strain - yieldStrain) / Math.max(0.0001, neckingStrain - yieldStrain);
      const plasticRise = material.utsMpa - material.yieldStrengthMpa;
      stressMpa = material.yieldStrengthMpa + plasticRise * Math.sin((p * Math.PI) / 2);
    } else {
      // Post-necking softening until fracture
      const q = (strain - neckingStrain) / Math.max(0.0001, fractureStrain - neckingStrain);
      const neckDropFactor = 0.18 + (material.reductionOfAreaPct / 100) * 0.15;
      const ruptureStress = material.utsMpa * (1 - neckDropFactor);
      stressMpa = material.utsMpa - (material.utsMpa - ruptureStress) * Math.pow(q, 1.4);
    }

    const forceKn = (stressMpa * a0) / 1000;
    const currentSpecimenLengthMm = gaugeLengthMm + extensionMm;

    // Specimen geometry deformation
    let currentCenterDiameterMm = diameterMm;
    let currentEndDiameterMm = diameterMm;
    let reductionOfAreaPct = 0;

    if (!isFractured) {
      if (strain <= neckingStrain) {
        // Uniform Poisson thinning
        const uniformThinning = diameterMm * Math.sqrt(gaugeLengthMm / currentSpecimenLengthMm);
        currentCenterDiameterMm = uniformThinning;
        currentEndDiameterMm = uniformThinning;
        const currentArea = (Math.PI / 4) * currentCenterDiameterMm * currentCenterDiameterMm;
        reductionOfAreaPct = Math.max(0, ((a0 - currentArea) / a0) * 100);
      } else {
        // Necking localized at the center
        const uniformThinningAtNecking =
          diameterMm * Math.sqrt(gaugeLengthMm / (gaugeLengthMm + neckingStrain * gaugeLengthMm));
        currentEndDiameterMm = uniformThinningAtNecking;

        const maxFinalDiameter =
          diameterMm * Math.sqrt(Math.max(0.01, 1 - material.reductionOfAreaPct / 100));
        const neckProgress =
          (strain - neckingStrain) / Math.max(0.0001, fractureStrain - neckingStrain);
        currentCenterDiameterMm =
          uniformThinningAtNecking -
          (uniformThinningAtNecking - maxFinalDiameter) * Math.min(1, Math.pow(neckProgress, 0.9));

        const neckArea = (Math.PI / 4) * currentCenterDiameterMm * currentCenterDiameterMm;
        reductionOfAreaPct = Math.max(0, ((a0 - neckArea) / a0) * 100);
      }
    } else {
      // Broken
      const minDia =
        diameterMm * Math.sqrt(Math.max(0.01, 1 - material.reductionOfAreaPct / 100));
      currentCenterDiameterMm = minDia;
      reductionOfAreaPct = material.reductionOfAreaPct;
    }

    const stressHeatmapRatio = isFractured
      ? 0
      : Math.min(1, stressMpa / Math.max(1, material.utsMpa));

    const fractureGapMm = isFractured
      ? Math.max(3, (extensionMm - fractureStrain * gaugeLengthMm) * 0.9 + 4)
      : 0;

    return {
      timeSec,
      extensionMm,
      strain,
      strainPct,
      stressMpa,
      forceKn,
      isYielded,
      isNecking,
      isFractured,
      currentSpecimenLengthMm,
      currentCenterDiameterMm,
      currentEndDiameterMm,
      reductionOfAreaPct,
      stressHeatmapRatio,
      fractureGapMm,
    };
  } else {
    // Compression mode
    const compDisplacementMm = Math.max(0, extensionMm);
    const strain = compDisplacementMm / gaugeLengthMm;
    const strainPct = strain * 100;

    const isBrittle = material.behavior === 'brittle';
    const compYieldMpa = material.compressiveYieldMpa;
    const compYieldStrain = compYieldMpa / E_mpa;
    const compFractureStrain = isBrittle
      ? (material.compressiveFractureStrainPct ?? 2.2) / 100
      : 0.45; // Ductile materials can compress up to 45% strain

    const isFractured = isBrittle && strain >= compFractureStrain;
    const isYielded = strain >= compYieldStrain;

    let stressMpa = 0;
    if (isFractured) {
      stressMpa = 0;
    } else if (strain <= compYieldStrain) {
      // Elastic compression: Hooke's Law σ = E * ε
      stressMpa = hookesLawStress(E_mpa * 1e6, strain) / 1e6;
    } else {
      if (isBrittle) {
        // Cast iron in compression approaches ~650 MPa with slight softening before 45° shear
        const ucs = material.compressiveUltimateMpa ?? 650;
        const progress = (strain - compYieldStrain) / Math.max(0.0001, compFractureStrain - compYieldStrain);
        stressMpa = compYieldMpa + (ucs - compYieldMpa) * Math.sin((progress * Math.PI) / 2);
      } else {
        // Ductile compression: true area grows and friction causes stress to ramp up (barreling work-hardening)
        const plasticStrain = strain - compYieldStrain;
        const hardeningRate = material.utsMpa * 0.7;
        stressMpa =
          compYieldMpa +
          hardeningRate * Math.pow(plasticStrain, 0.45) * (1 + 1.2 * strain);
      }
    }

    const forceKn = (stressMpa * a0) / 1000;
    const currentSpecimenLengthMm = Math.max(2, gaugeLengthMm - compDisplacementMm);

    // Barreling geometry
    const endFrictionRestraint = 0.25;
    const currentEndDiameterMm = diameterMm * (1 + endFrictionRestraint * strain);
    // Center bulges out significantly
    const currentCenterDiameterMm = isFractured
      ? diameterMm * 1.05
      : diameterMm * (1 + 0.65 * strain + 1.2 * strain * strain);

    const maxStressRef = isBrittle
      ? (material.compressiveUltimateMpa ?? 650)
      : compYieldMpa * 1.8;
    const stressHeatmapRatio = isFractured ? 0 : Math.min(1, stressMpa / Math.max(1, maxStressRef));

    return {
      timeSec,
      extensionMm,
      strain,
      strainPct,
      stressMpa,
      forceKn,
      isYielded,
      isNecking: false,
      isFractured,
      currentSpecimenLengthMm,
      currentCenterDiameterMm,
      currentEndDiameterMm,
      reductionOfAreaPct: 0,
      stressHeatmapRatio,
      fractureGapMm: 0,
    };
  }
}

/**
 * Pre-computes the complete theoretical curve up to fracture or max limit.
 */
export function generateFullCurve(inputs: UtmTestInputs, numPoints = 160): {
  points: UtmDataPoint[];
  keyPoints: CurveKeyPoints;
} {
  const { mode, material, diameterMm, gaugeLengthMm } = inputs;
  const a0 = circularSectionProps(mmToM(diameterMm)).area * 1e6;
  const E_mpa = material.youngsModulusGpa * 1000;

  const points: UtmDataPoint[] = [];

  let maxExtensionMm = 0;
  let yieldStrainPct = 0;
  let fractureStrainPct = 0;

  if (mode === 'tensile') {
    fractureStrainPct = material.elongationPct;
    maxExtensionMm = (fractureStrainPct / 100) * gaugeLengthMm;
    const yieldStrain = material.yieldStrengthMpa / E_mpa;
    yieldStrainPct = yieldStrain * 100;
  } else {
    if (material.behavior === 'brittle') {
      fractureStrainPct = material.compressiveFractureStrainPct ?? 2.2;
      maxExtensionMm = (fractureStrainPct / 100) * gaugeLengthMm;
      yieldStrainPct = (material.compressiveYieldMpa / E_mpa) * 100;
    } else {
      fractureStrainPct = 40; // 40% compression limit
      maxExtensionMm = (fractureStrainPct / 100) * gaugeLengthMm;
      yieldStrainPct = (material.compressiveYieldMpa / E_mpa) * 100;
    }
  }

  // Generate smooth discrete points
  for (let i = 0; i <= numPoints; i++) {
    const frac = i / numPoints;
    const ext = frac * maxExtensionMm;
    const state = computeUtmState(ext, 0, inputs);
    points.push({
      timeSec: 0,
      extensionMm: ext,
      strainPct: state.strainPct,
      forceKn: state.forceKn,
      stressMpa: state.stressMpa,
    });
  }

  // Yield point
  const yieldState = computeUtmState((yieldStrainPct / 100) * gaugeLengthMm, 0, inputs);
  const yieldPoint: UtmDataPoint = {
    timeSec: 0,
    extensionMm: (yieldStrainPct / 100) * gaugeLengthMm,
    strainPct: yieldStrainPct,
    forceKn: yieldState.forceKn,
    stressMpa: mode === 'tensile' ? material.yieldStrengthMpa : material.compressiveYieldMpa,
  };

  // UTS point
  let maxStress = 0;
  let maxStressExt = 0;
  for (const pt of points) {
    if (pt.stressMpa > maxStress) {
      maxStress = pt.stressMpa;
      maxStressExt = pt.extensionMm;
    }
  }
  const utsState = computeUtmState(maxStressExt, 0, inputs);
  const utsPoint: UtmDataPoint = {
    timeSec: 0,
    extensionMm: maxStressExt,
    strainPct: utsState.strainPct,
    forceKn: utsState.forceKn,
    stressMpa: utsState.stressMpa,
  };

  // Fracture point
  const fractureState = computeUtmState(maxExtensionMm * 0.999, 0, inputs);
  const fracturePoint: UtmDataPoint = {
    timeSec: 0,
    extensionMm: maxExtensionMm,
    strainPct: fractureStrainPct,
    forceKn: fractureState.forceKn,
    stressMpa: fractureState.stressMpa,
  };

  // 0.2% Offset line: parallel to modulus starting from strain = 0.2%
  const offsetOriginStrainPct = 0.2;
  const targetYieldStress =
    mode === 'tensile' ? material.yieldStrengthMpa : material.compressiveYieldMpa;
  const offsetEndStrainPct = offsetOriginStrainPct + (targetYieldStress / E_mpa) * 100 * 1.15;
  const offsetEndStress = (E_mpa * (offsetEndStrainPct - offsetOriginStrainPct)) / 100;

  const offsetYieldLine = {
    start: [offsetOriginStrainPct, 0] as [number, number],
    end: [offsetEndStrainPct, offsetEndStress] as [number, number],
  };

  let maxStrainPct = fractureStrainPct * 1.08;
  let maxStressMpa = Math.max(utsPoint.stressMpa, targetYieldStress) * 1.15;
  let maxForceKn = (maxStressMpa * a0) / 1000;

  return {
    points,
    keyPoints: {
      yieldPoint,
      utsPoint,
      fracturePoint,
      offsetYieldLine,
      maxStrainPct,
      maxStressMpa,
      maxForceKn,
      maxExtensionMm: maxExtensionMm * 1.08,
    },
  };
}

/**
 * Downloads recorded CSV data for laboratory reporting.
 */
export function exportUtmDataToCsv(
  data: UtmDataPoint[],
  materialName: string,
  mode: TestMode
): void {
  const header = 'Time (s),Extension (mm),Strain (%),Force (kN),Stress (MPa)\n';
  const rows = data.map(
    (pt) =>
      `${pt.timeSec.toFixed(2)},${pt.extensionMm.toFixed(4)},${pt.strainPct.toFixed(3)},${pt.forceKn.toFixed(3)},${pt.stressMpa.toFixed(1)}`
  );
  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  const cleanName = materialName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.setAttribute('download', `utm-${mode}-${cleanName}-data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Computes the Modulus of Resilience Ur = (σ_y)² / (2E) in MJ/m³.
 */
export function computeResilience(material: MaterialProperties, mode: TestMode): number {
  const yieldMpa = mode === 'tensile' ? material.yieldStrengthMpa : material.compressiveYieldMpa;
  const yieldPa = yieldMpa * 1e6;
  const ePa = material.youngsModulusGpa * 1e9;
  const urJm3 = modulusOfResilience(yieldPa, ePa);
  return urJm3 / 1e6; // MJ/m³
}

/**
 * Computes the Modulus of Toughness UT via trapezoidal numerical integration of σ-ε in MJ/m³.
 */
export function computeToughness(curvePoints: UtmDataPoint[]): number {
  if (!curvePoints || curvePoints.length < 2) return 0;
  let totalEnergy = 0;
  for (let i = 0; i < curvePoints.length - 1; i++) {
    const p1 = curvePoints[i];
    const p2 = curvePoints[i + 1];
    const dStrain = Math.max(0, (p2.strainPct - p1.strainPct) / 100);
    const avgStress = (p1.stressMpa + p2.stressMpa) / 2;
    totalEnergy += avgStress * dStrain;
  }
  return totalEnergy;
}

