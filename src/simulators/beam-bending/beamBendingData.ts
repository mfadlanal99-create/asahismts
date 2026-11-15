import {
  rectangularSectionProps,
  circularSectionProps,
  beamBendingStress,
  mmToM,
} from '../../physics';

export type BeamType = 'simply-supported' | 'cantilever' | 'overhanging';
export type LoadType = 'point' | 'udl' | 'combined';
export type CrossSectionShape = 'i-beam' | 'rect' | 'circle';
export type MaterialId = 'steel-a36' | 'alu-6061' | 'timber' | 'custom';

export interface BeamMaterial {
  id: MaterialId;
  name: string;
  category: 'ferrous' | 'non-ferrous' | 'timber';
  youngsModulusGpa: number;
  yieldStrengthMpa: number;
  ultimateStrengthMpa: number;
  densityKgM3: number;
  color: string;
  descriptionEn: string;
  descriptionId: string;
  descriptionJa: string;
}

export interface SectionDimensions {
  rectWidthMm: number;
  rectHeightMm: number;
  circleDiaMm: number;
  iBeamHeightMm: number;
  iBeamFlangeWidthMm: number;
  iBeamFlangeThicknessMm: number;
  iBeamWebThicknessMm: number;
}

export interface SectionProperties {
  areaMm2: number;
  momentOfInertiaMm4: number; // I_x
  sectionModulusMm3: number; // S_x = I_x / c
  neutralAxisDepthMm: number; // c = d / 2
  weightPerMeterKgM: number;
}

export interface BeamInputs {
  beamType: BeamType;
  spanM: number;
  overhangM: number;
  loadType: LoadType;
  pointLoadKn: number;
  pointLoadPosM: number;
  udlKnM: number;
  udlStartM: number;
  udlEndM: number;
  sectionShape: CrossSectionShape;
  sectionDims: SectionDimensions;
  material: BeamMaterial;
}

export interface Reactions {
  rAKn: number;
  rBKn: number;
  mAKNm: number; // Reaction moment at A for cantilever (counter-clockwise)
}

export interface BeamDiagramPoint {
  x: number;
  shearKn: number;
  momentKNm: number;
  deflectionMm: number;
  bendingStressMpa: number;
}

export interface SfdPathPoint {
  x: number;
  shearKn: number;
}

export interface BeamAnalysisResult {
  inputs: BeamInputs;
  totalLengthM: number;
  reactions: Reactions;
  section: SectionProperties;
  diagramPoints: BeamDiagramPoint[];
  sfdPoints: SfdPathPoint[];
  maxShearKn: number;
  minShearKn: number;
  absMaxShearKn: number;
  maxMomentKNm: number;
  minMomentKNm: number;
  absMaxMomentKNm: number;
  maxDeflectionMm: number;
  maxDeflectionPosM: number;
  maxStressMpa: number;
  safetyFactor: number;
  status: 'SAFE' | 'MARGINAL' | 'YIELDED';
  zeroShearPositions: number[];
}

export const PRESET_MATERIALS: BeamMaterial[] = [
  {
    id: 'steel-a36',
    name: 'Structural Steel (ASTM A36)',
    category: 'ferrous',
    youngsModulusGpa: 200,
    yieldStrengthMpa: 250,
    ultimateStrengthMpa: 400,
    densityKgM3: 7850,
    color: '#3b82f6',
    descriptionEn: 'Standard low-carbon structural steel with high ductility and predictable linear elasticity.',
    descriptionId: 'Baja karbon struktural standar dengan keuletan tinggi dan elastisitas linier teruji.',
    descriptionJa: '優れた延性と予測可能な線形弾性を持つ標準構造用炭素鋼（SS400同等）。',
  },
  {
    id: 'alu-6061',
    name: 'Aluminum 6061-T6',
    category: 'non-ferrous',
    youngsModulusGpa: 69,
    yieldStrengthMpa: 276,
    ultimateStrengthMpa: 310,
    densityKgM3: 2700,
    color: '#06b6d4',
    descriptionEn: 'Precipitation-hardened aluminum alloy offering superior strength-to-weight ratio and corrosion resistance.',
    descriptionId: 'Paduan aluminium berkekuatan tinggi dengan rasio kekuatan-terhadap-bobot unggul dan tahan korosi.',
    descriptionJa: '高い比強度と耐食性を誇る熱処理型アルミニウム合金。航空機や車両構造に多用。',
  },
  {
    id: 'timber',
    name: 'Structural Timber (Douglas Fir)',
    category: 'timber',
    youngsModulusGpa: 12,
    yieldStrengthMpa: 15,
    ultimateStrengthMpa: 50,
    densityKgM3: 500,
    color: '#d97706',
    descriptionEn: 'Engineered structural timber widely utilized in residential framing, trusses, and joists.',
    descriptionId: 'Kayu struktural rekayasa yang umum digunakan untuk balok bentang, kasau, dan rangka atap.',
    descriptionJa: '建築構造用製材（ベイマツ）。梁や床組み、トラス部材として広く普及。',
  },
];

export const DEFAULT_SECTION_DIMS: SectionDimensions = {
  rectWidthMm: 100,
  rectHeightMm: 200,
  circleDiaMm: 120,
  iBeamHeightMm: 200,
  iBeamFlangeWidthMm: 100,
  iBeamFlangeThicknessMm: 8.5,
  iBeamWebThicknessMm: 5.6,
};

export const DEFAULT_BEAM_INPUTS: BeamInputs = {
  beamType: 'simply-supported',
  spanM: 4.0,
  overhangM: 1.0,
  loadType: 'point',
  pointLoadKn: 20.0,
  pointLoadPosM: 2.0,
  udlKnM: 8.0,
  udlStartM: 0.0,
  udlEndM: 4.0,
  sectionShape: 'i-beam',
  sectionDims: DEFAULT_SECTION_DIMS,
  material: PRESET_MATERIALS[0],
};

/**
 * Computes cross-sectional geometric properties.
 */
export function computeSectionProperties(
  shape: CrossSectionShape,
  dims: SectionDimensions,
  densityKgM3: number
): SectionProperties {
  let areaMm2 = 0;
  let momentOfInertiaMm4 = 0;
  let neutralAxisDepthMm = 0;

  switch (shape) {
    case 'rect': {
      const b_m = mmToM(Math.max(10, dims.rectWidthMm));
      const h_m = mmToM(Math.max(10, dims.rectHeightMm));
      const props = rectangularSectionProps(b_m, h_m);
      areaMm2 = props.area * 1e6;
      momentOfInertiaMm4 = props.momentOfInertia * 1e12;
      neutralAxisDepthMm = (h_m * 1000) / 2;
      break;
    }
    case 'circle': {
      const d_m = mmToM(Math.max(10, dims.circleDiaMm));
      const props = circularSectionProps(d_m);
      areaMm2 = props.area * 1e6;
      momentOfInertiaMm4 = props.momentOfInertia * 1e12;
      neutralAxisDepthMm = (d_m * 1000) / 2;
      break;
    }
    case 'i-beam': {
      const d = Math.max(40, dims.iBeamHeightMm);
      const bf = Math.max(20, dims.iBeamFlangeWidthMm);
      const tf = Math.max(2, Math.min(dims.iBeamFlangeThicknessMm, d / 3));
      const tw = Math.max(1, Math.min(dims.iBeamWebThicknessMm, bf / 2));
      const dInner = Math.max(0, d - 2 * tf);

      areaMm2 = 2 * bf * tf + dInner * tw;
      // Moment of inertia for standard symmetrical I-beam: (bf * d^3 - (bf - tw) * dInner^3) / 12
      momentOfInertiaMm4 = (bf * Math.pow(d, 3) - (bf - tw) * Math.pow(dInner, 3)) / 12;
      neutralAxisDepthMm = d / 2;
      break;
    }
  }

  const sectionModulusMm3 = momentOfInertiaMm4 / Math.max(1, neutralAxisDepthMm);
  // Weight per meter (kg/m) = Area (m^2) * density (kg/m^3)
  const weightPerMeterKgM = (areaMm2 * 1e-6) * densityKgM3;

  return {
    areaMm2,
    momentOfInertiaMm4,
    sectionModulusMm3,
    neutralAxisDepthMm,
    weightPerMeterKgM,
  };
}

/**
 * Solves equilibrium reactions for any beam type and loading configuration.
 */
export function computeReactions(inputs: BeamInputs, totalLengthM: number): Reactions {
  const { beamType, spanM, loadType, pointLoadKn, pointLoadPosM, udlKnM, udlStartM, udlEndM } = inputs;

  let totalPointLoad = 0;
  let pointLoadMomentAbout0 = 0;

  if (loadType === 'point' || loadType === 'combined') {
    const clampedPos = Math.min(Math.max(0, pointLoadPosM), totalLengthM);
    totalPointLoad = Math.max(0, pointLoadKn);
    pointLoadMomentAbout0 = totalPointLoad * clampedPos;
  }

  let totalUdlLoad = 0;
  let udlMomentAbout0 = 0;

  if (loadType === 'udl' || loadType === 'combined') {
    const start = Math.min(Math.max(0, udlStartM), totalLengthM);
    const end = Math.min(Math.max(start, udlEndM), totalLengthM);
    const length = end - start;
    if (length > 0) {
      const w = Math.max(0, udlKnM);
      totalUdlLoad = w * length;
      const centroid = (start + end) / 2;
      udlMomentAbout0 = totalUdlLoad * centroid;
    }
  }

  const totalDownwardForce = totalPointLoad + totalUdlLoad;
  const totalMomentAbout0 = pointLoadMomentAbout0 + udlMomentAbout0;

  if (beamType === 'cantilever') {
    // Fixed wall at x = 0
    return {
      rAKn: totalDownwardForce,
      rBKn: 0,
      mAKNm: totalMomentAbout0, // Counter-clockwise clamping reaction moment
    };
  }

  // Simply-supported (supports at 0 and spanM) or Overhanging (supports at 0 and spanM)
  const L = Math.max(0.1, spanM);
  const rBKn = totalMomentAbout0 / L;
  const rAKn = totalDownwardForce - rBKn;

  return {
    rAKn,
    rBKn,
    mAKNm: 0,
  };
}

/**
 * Evaluates internal shear force V(x) and bending moment M(x) at any cross-section x.
 * Standard mechanics of materials sign convention:
 * V(x): Upward left is positive.
 * M(x): Sagging (tension on bottom) is positive.
 */
export function evaluateShearAndMoment(
  x: number,
  inputs: BeamInputs,
  reactions: Reactions
): { shearKn: number; momentKNm: number } {
  const { beamType, spanM, loadType, pointLoadKn, pointLoadPosM, udlKnM, udlStartM, udlEndM } = inputs;
  const { rAKn, rBKn, mAKNm } = reactions;

  let shearKn = 0;
  let momentKNm = 0;

  // Support A reaction at x = 0
  if (x > 1e-7) {
    shearKn += rAKn;
    momentKNm += rAKn * x;
  }

  // Clamping moment at x = 0 for cantilever
  if (beamType === 'cantilever' && x > 1e-7) {
    momentKNm -= mAKNm;
  }

  // Support B reaction at x = spanM (for simply-supported and overhanging)
  if (beamType !== 'cantilever' && x > spanM + 1e-7) {
    shearKn += rBKn;
    momentKNm += rBKn * (x - spanM);
  }

  // Point load
  if (loadType === 'point' || loadType === 'combined') {
    const pPos = pointLoadPosM;
    const pVal = Math.max(0, pointLoadKn);
    if (x > pPos + 1e-7) {
      shearKn -= pVal;
      momentKNm -= pVal * (x - pPos);
    }
  }

  // UDL load
  if (loadType === 'udl' || loadType === 'combined') {
    const w = Math.max(0, udlKnM);
    const start = Math.max(0, udlStartM);
    const end = Math.max(start, udlEndM);

    if (x > start + 1e-7) {
      const activeEnd = Math.min(x, end);
      const activeLen = Math.max(0, activeEnd - start);
      if (activeLen > 0) {
        const load = w * activeLen;
        const centroid = (start + activeEnd) / 2;
        shearKn -= load;
        momentKNm -= load * (x - centroid);
      }
    }
  }

  return {
    shearKn: Math.abs(shearKn) < 1e-6 ? 0 : shearKn,
    momentKNm: Math.abs(momentKNm) < 1e-6 ? 0 : momentKNm,
  };
}

/**
 * Runs full finite beam analysis: SFD, BMD, Deflection curve, and Factor of Safety.
 */
export function analyzeBeam(inputs: BeamInputs, numSamplePoints: number = 300): BeamAnalysisResult {
  const { beamType, spanM, overhangM, sectionShape, sectionDims, material } = inputs;

  const totalLengthM = beamType === 'overhanging' ? spanM + Math.max(0, overhangM) : spanM;
  const section = computeSectionProperties(sectionShape, sectionDims, material.densityKgM3);
  const reactions = computeReactions(inputs, totalLengthM);

  const dx = totalLengthM / numSamplePoints;
  const diagramPoints: BeamDiagramPoint[] = [];

  // 1. Compute curvature kappa(x) = M(x) / (E * I)
  // E in GPa, I in mm^4, M in kN*m
  // kappa(x) [1/m] = (M [kN*m] * 1e6) / (E [GPa] * I [mm^4])
  const EI_factor = material.youngsModulusGpa * section.momentOfInertiaMm4;
  const curvatures: number[] = [];
  const xCoords: number[] = [];

  for (let i = 0; i <= numSamplePoints; i++) {
    const x = i * dx;
    xCoords.push(x);
    const { shearKn, momentKNm } = evaluateShearAndMoment(x, inputs, reactions);
    const kappa = EI_factor > 0 ? (momentKNm * 1e6) / EI_factor : 0;
    curvatures.push(kappa);

    // Bending stress: sigma = |M| * y / I (MPa) via mechanics physics engine
    const bendingStressMpa = section.momentOfInertiaMm4 > 0
      ? beamBendingStress(
          Math.abs(momentKNm) * 1000,
          section.neutralAxisDepthMm * 1e-3,
          section.momentOfInertiaMm4 * 1e-12
        ) / 1e6
      : 0;

    diagramPoints.push({
      x,
      shearKn,
      momentKNm,
      deflectionMm: 0, // Filled after double integration
      bendingStressMpa,
    });
  }

  // 2. Numerical Double Integration for Elastic Deflection delta(x)
  // v''(x) = M(x) / EI = kappa(x)
  // theta_0(x) = integral(kappa(u) du) from 0 to x
  // v_0(x) = integral(theta_0(u) du) from 0 to x
  const slopes0: number[] = [0];
  for (let i = 1; i <= numSamplePoints; i++) {
    // Trapezoidal rule
    const avgKappa = (curvatures[i - 1] + curvatures[i]) / 2;
    slopes0.push(slopes0[i - 1] + avgKappa * dx);
  }

  const deflections0: number[] = [0];
  for (let i = 1; i <= numSamplePoints; i++) {
    const avgSlope = (slopes0[i - 1] + slopes0[i]) / 2;
    deflections0.push(deflections0[i - 1] + avgSlope * dx);
  }

  // Apply boundary conditions:
  // Downward deflection delta(x) = -v(x)
  if (beamType === 'cantilever') {
    // Fixed wall at x = 0: v(0) = 0, v'(0) = 0
    for (let i = 0; i <= numSamplePoints; i++) {
      const v = deflections0[i];
      diagramPoints[i].deflectionMm = -v * 1000; // in mm, positive downwards
    }
  } else {
    // Simply-supported or Overhanging: supports at x = 0 and x = spanM
    // v(0) = 0
    // v(spanM) = 0  => v_0(spanM) + C1 * spanM = 0 => C1 = -v_0(spanM) / spanM
    const spanIndex = Math.min(
      numSamplePoints,
      Math.max(1, Math.round((spanM / totalLengthM) * numSamplePoints))
    );
    const vAtSpan = deflections0[spanIndex];
    const c1 = -vAtSpan / spanM;

    for (let i = 0; i <= numSamplePoints; i++) {
      const x = xCoords[i];
      const v = deflections0[i] + c1 * x;
      diagramPoints[i].deflectionMm = -v * 1000; // in mm, positive downwards
    }
  }

  // 3. Build high-fidelity SFD Path with exact vertical step jumps at load and support points
  const jumpLocations = new Set<number>([0, totalLengthM]);
  if (beamType !== 'cantilever') {
    jumpLocations.add(spanM);
  }
  if (inputs.loadType === 'point' || inputs.loadType === 'combined') {
    jumpLocations.add(Math.min(inputs.pointLoadPosM, totalLengthM));
  }
  if (inputs.loadType === 'udl' || inputs.loadType === 'combined') {
    jumpLocations.add(Math.min(inputs.udlStartM, totalLengthM));
    jumpLocations.add(Math.min(inputs.udlEndM, totalLengthM));
  }

  const sfdPoints: SfdPathPoint[] = [];
  const sortedJumps = Array.from(jumpLocations).sort((a, b) => a - b);

  for (let j = 0; j < sortedJumps.length; j++) {
    const x = sortedJumps[j];
    // Left limit
    const xLeft = Math.max(0, x - 1e-6);
    const leftVal = evaluateShearAndMoment(xLeft, inputs, reactions).shearKn;
    // Right limit
    const xRight = Math.min(totalLengthM, x + 1e-6);
    const rightVal = evaluateShearAndMoment(xRight, inputs, reactions).shearKn;

    if (sfdPoints.length > 0) {
      sfdPoints.push({ x, shearKn: leftVal });
    }
    sfdPoints.push({ x, shearKn: rightVal });
  }

  // Merge regular sample points into SFD path for smooth UDL sloping lines
  const combinedSfd: SfdPathPoint[] = [];
  let sfdIdx = 0;
  for (let i = 0; i <= numSamplePoints; i++) {
    const x = diagramPoints[i].x;
    while (sfdIdx < sfdPoints.length && sfdPoints[sfdIdx].x < x - 1e-5) {
      combinedSfd.push(sfdPoints[sfdIdx]);
      sfdIdx++;
    }
    // If not right on a jump, insert diagram point
    if (sfdIdx >= sfdPoints.length || Math.abs(sfdPoints[sfdIdx].x - x) > 1e-5) {
      combinedSfd.push({ x, shearKn: diagramPoints[i].shearKn });
    } else {
      // Add all jump points at this x
      while (sfdIdx < sfdPoints.length && Math.abs(sfdPoints[sfdIdx].x - x) <= 1e-5) {
        combinedSfd.push(sfdPoints[sfdIdx]);
        sfdIdx++;
      }
    }
  }

  // 4. Find Key Extremes & Metrics
  let maxShearKn = -Infinity;
  let minShearKn = Infinity;
  let maxMomentKNm = -Infinity;
  let minMomentKNm = Infinity;
  let maxDeflectionMm = 0;
  let maxDeflectionPosM = 0;
  let maxStressMpa = 0;

  for (const pt of diagramPoints) {
    if (pt.shearKn > maxShearKn) maxShearKn = pt.shearKn;
    if (pt.shearKn < minShearKn) minShearKn = pt.shearKn;
    if (pt.momentKNm > maxMomentKNm) maxMomentKNm = pt.momentKNm;
    if (pt.momentKNm < minMomentKNm) minMomentKNm = pt.momentKNm;

    if (Math.abs(pt.deflectionMm) > Math.abs(maxDeflectionMm)) {
      maxDeflectionMm = pt.deflectionMm;
      maxDeflectionPosM = pt.x;
    }
    if (pt.bendingStressMpa > maxStressMpa) {
      maxStressMpa = pt.bendingStressMpa;
    }
  }

  // Check jump points for shear extremes
  for (const pt of sfdPoints) {
    if (pt.shearKn > maxShearKn) maxShearKn = pt.shearKn;
    if (pt.shearKn < minShearKn) minShearKn = pt.shearKn;
  }

  const absMaxShearKn = Math.max(Math.abs(maxShearKn), Math.abs(minShearKn));
  const absMaxMomentKNm = Math.max(Math.abs(maxMomentKNm), Math.abs(minMomentKNm));

  // Factor of safety against yielding
  const safetyFactor = maxStressMpa > 1e-4
    ? material.yieldStrengthMpa / maxStressMpa
    : 99.9;

  let status: 'SAFE' | 'MARGINAL' | 'YIELDED' = 'SAFE';
  if (safetyFactor < 1.0) {
    status = 'YIELDED';
  } else if (safetyFactor < 1.5) {
    status = 'MARGINAL';
  }

  // Find zero shear locations (where moment reaches peaks)
  const zeroShearPositions: number[] = [];
  for (let i = 1; i < diagramPoints.length; i++) {
    const prev = diagramPoints[i - 1];
    const curr = diagramPoints[i];
    if ((prev.shearKn > 0 && curr.shearKn <= 0) || (prev.shearKn < 0 && curr.shearKn >= 0)) {
      const ratio = Math.abs(prev.shearKn) / (Math.abs(prev.shearKn) + Math.abs(curr.shearKn) + 1e-9);
      const zeroX = prev.x + ratio * (curr.x - prev.x);
      zeroShearPositions.push(Number(zeroX.toFixed(2)));
    }
  }

  return {
    inputs,
    totalLengthM,
    reactions,
    section,
    diagramPoints,
    sfdPoints: combinedSfd,
    maxShearKn: Number(maxShearKn.toFixed(2)),
    minShearKn: Number(minShearKn.toFixed(2)),
    absMaxShearKn: Number(absMaxShearKn.toFixed(2)),
    maxMomentKNm: Number(maxMomentKNm.toFixed(2)),
    minMomentKNm: Number(minMomentKNm.toFixed(2)),
    absMaxMomentKNm: Number(absMaxMomentKNm.toFixed(2)),
    maxDeflectionMm: Number(maxDeflectionMm.toFixed(2)),
    maxDeflectionPosM: Number(maxDeflectionPosM.toFixed(2)),
    maxStressMpa: Number(maxStressMpa.toFixed(1)),
    safetyFactor: Number(safetyFactor.toFixed(2)),
    status,
    zeroShearPositions,
  };
}

/**
 * Predefined loading configurations for rapid educational exploration.
 */
export interface BeamPreset {
  id: string;
  nameEn: string;
  nameId: string;
  nameJa: string;
  inputs: Partial<BeamInputs>;
}

export const BEAM_PRESETS: BeamPreset[] = [
  {
    id: 'simple-center-point',
    nameEn: 'Simply Supported — Center Point Load (4m, 25 kN)',
    nameId: 'Tumpuan Sederhana — Beban Terpusat Tengah (4m, 25 kN)',
    nameJa: '単純支持梁 — 中央集中荷重 (4m, 25 kN)',
    inputs: {
      beamType: 'simply-supported',
      spanM: 4.0,
      loadType: 'point',
      pointLoadKn: 25.0,
      pointLoadPosM: 2.0,
    },
  },
  {
    id: 'simple-full-udl',
    nameEn: 'Simply Supported — Uniformly Distributed Load (5m, 12 kN/m)',
    nameId: 'Tumpuan Sederhana — Beban Merata Penuh (5m, 12 kN/m)',
    nameJa: '単純支持梁 — 全長等分布荷重 (5m, 12 kN/m)',
    inputs: {
      beamType: 'simply-supported',
      spanM: 5.0,
      loadType: 'udl',
      udlKnM: 12.0,
      udlStartM: 0.0,
      udlEndM: 5.0,
    },
  },
  {
    id: 'cantilever-end-point',
    nameEn: 'Cantilever — Tip Point Load (3m, 15 kN)',
    nameId: 'Kantilever — Beban Terpusat Ujung (3m, 15 kN)',
    nameJa: '片持ち梁 — 先端集中荷重 (3m, 15 kN)',
    inputs: {
      beamType: 'cantilever',
      spanM: 3.0,
      loadType: 'point',
      pointLoadKn: 15.0,
      pointLoadPosM: 3.0,
    },
  },
  {
    id: 'cantilever-udl',
    nameEn: 'Cantilever — Full Distributed Load (3m, 10 kN/m)',
    nameId: 'Kantilever — Beban Merata Penuh (3m, 10 kN/m)',
    nameJa: '片持ち梁 — 全長等分布荷重 (3m, 10 kN/m)',
    inputs: {
      beamType: 'cantilever',
      spanM: 3.0,
      loadType: 'udl',
      udlKnM: 10.0,
      udlStartM: 0.0,
      udlEndM: 3.0,
    },
  },
  {
    id: 'overhanging-combined',
    nameEn: 'Overhanging Beam — Combined Load (Span 4m + 1.5m Overhang)',
    nameId: 'Balok Menggantung — Beban Kombinasi (Bentang 4m + Gantung 1.5m)',
    nameJa: '張り出し梁 — 複合荷重（スパン4m ＋ 張り出し1.5m）',
    inputs: {
      beamType: 'overhanging',
      spanM: 4.0,
      overhangM: 1.5,
      loadType: 'combined',
      pointLoadKn: 15.0,
      pointLoadPosM: 5.5,
      udlKnM: 8.0,
      udlStartM: 0.0,
      udlEndM: 4.0,
    },
  },
];

/**
 * Exports beam simulation data to CSV format.
 */
export function exportBeamDataToCsv(result: BeamAnalysisResult): void {
  const headers = ['x (m)', 'Shear Force V (kN)', 'Bending Moment M (kN*m)', 'Deflection delta (mm)', 'Bending Stress sigma (MPa)'];
  const rows = result.diagramPoints.map((pt) => [
    pt.x.toFixed(3),
    pt.shearKn.toFixed(3),
    pt.momentKNm.toFixed(3),
    pt.deflectionMm.toFixed(3),
    pt.bendingStressMpa.toFixed(2),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `beam_bending_${result.inputs.beamType}_${result.inputs.material.id}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
