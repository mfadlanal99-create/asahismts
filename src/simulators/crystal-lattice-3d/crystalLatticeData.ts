export type CrystalSystemId =
  | 'cubic'
  | 'tetragonal'
  | 'orthorhombic'
  | 'hexagonal'
  | 'rhombohedral'
  | 'monoclinic'
  | 'triclinic'
  | 'compound';

export type LatticeStructureId =
  | 'sc'
  | 'bcc'
  | 'fcc'
  | 'st'
  | 'bct'
  | 'so'
  | 'bco'
  | 'baco'
  | 'fco'
  | 'hex-p'
  | 'hcp'
  | 'rhomb'
  | 'sm'
  | 'bacm'
  | 'triclinic'
  | 'diamond'
  | 'nacl'
  | 'cscl';

export type AtomSiteRole =
  | 'corner'
  | 'body'
  | 'face'
  | 'base'
  | 'edge'
  | 'interior'
  | 'species-b';

export type MillerPlaneId = 'none' | '100' | '110' | '111' | '0001' | '10-10';

export interface LocalizedText {
  en: string;
  id: string;
  ja: string;
}

export interface LatticeAtomSpec {
  id: string;
  /** Fractional coordinates (u, v, w) or Cartesian hex-prism coordinates when isHexPrismCartesian */
  u: number;
  v: number;
  w: number;
  role: AtomSiteRole;
  elementSymbol?: string;
  speciesIndex?: 1 | 2;
  /** True for full 17-atom HCP prism coordinates mapped directly in normalized hex space */
  isHexPrismCoord?: boolean;
  /** Contribution weight inside one unit cell / prism (e.g. 1/8, 1/2, 1/4, 1/6, 1) */
  cellWeightLabel: string;
}

export interface InterstitialSiteSpec {
  id: string;
  u: number;
  v: number;
  w: number;
  kind: 'octahedral' | 'tetrahedral';
  isHexPrismCoord?: boolean;
}

export interface CrystalLatticeSpec {
  id: LatticeStructureId;
  system: Exclude<CrystalSystemId, 'compound'>;
  categoryGroup: CrystalSystemId;
  isBravaisCanonical: boolean;
  pearsonSymbol: string;
  strutzbricht?: string;
  name: LocalizedText;
  shortName: string;
  /** Axial & angular relation text */
  cellConstraints: string;
  /** Canonical unit cell parameters */
  defaultBOverA: number;
  defaultCOverA: number;
  defaultAlphaDeg: number;
  defaultBetaDeg: number;
  defaultGammaDeg: number;
  allowBSlider: boolean;
  allowCSlider: boolean;
  allowAngleSlider: 'none' | 'beta' | 'rhombohedral' | 'triclinic';
  effectiveAtomsPerCell: string;
  atomCountBreakdown: LocalizedText;
  coordinationNumber: string;
  apfPercent: number;
  apfLabel: string;
  radiusFormula: string;
  /** Normalized touching radius in canonical model coordinates (where a = 1) for Hard-Sphere mode */
  canonicalSphereRadius: number;
  /** Relative display scale for Ball-and-Stick mode */
  canonicalBallRadius: number;
  /** Maximum nearest-neighbor bond distance threshold in rendered Cartesian (a=1) space */
  bondCutoff: number;
  secondSpeciesScale?: number;
  slipSystems: LocalizedText;
  mechanicalBehavior: LocalizedText;
  exampleMaterials: string[];
  /** Whether geometry uses full 6-sided HCP hexagonal prism wireframe */
  isFullHexPrism?: boolean;
  atoms: LatticeAtomSpec[];
  interstitials?: InterstitialSiteSpec[];
}

export const SYSTEM_LABELS: Record<
  'all' | CrystalSystemId,
  LocalizedText
> = {
  all: { en: 'All (18)', id: 'Semua (18)', ja: 'すべて (18)' },
  cubic: { en: 'Cubic (3)', id: 'Kubik (3)', ja: '立方晶 (3)' },
  tetragonal: { en: 'Tetragonal (2)', id: 'Tetragonal (2)', ja: '正方晶 (2)' },
  orthorhombic: { en: 'Orthorhombic (4)', id: 'Ortorombik (4)', ja: '斜方晶 (4)' },
  hexagonal: { en: 'Hexagonal (2)', id: 'Heksagonal (2)', ja: '六方晶 (2)' },
  rhombohedral: { en: 'Rhombohedral (1)', id: 'Rombohedral (1)', ja: '菱面体 (1)' },
  monoclinic: { en: 'Monoclinic (2)', id: 'Monoklinik (2)', ja: '単斜晶 (2)' },
  triclinic: { en: 'Triclinic (1)', id: 'Triklinik (1)', ja: '三斜晶 (1)' },
  compound: { en: 'Engineering & B1/B2 (3)', id: 'Teknik & Senyawa (3)', ja: '工学・化合物 (3)' },
};

const CUBE_CORNERS: LatticeAtomSpec[] = [
  { id: 'c000', u: 0, v: 0, w: 0, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c100', u: 1, v: 0, w: 0, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c010', u: 0, v: 1, w: 0, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c110', u: 1, v: 1, w: 0, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c001', u: 0, v: 0, w: 1, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c101', u: 1, v: 0, w: 1, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c011', u: 0, v: 1, w: 1, role: 'corner', cellWeightLabel: '1/8' },
  { id: 'c111', u: 1, v: 1, w: 1, role: 'corner', cellWeightLabel: '1/8' },
];

const BODY_CENTER: LatticeAtomSpec = {
  id: 'body-center',
  u: 0.5,
  v: 0.5,
  w: 0.5,
  role: 'body',
  cellWeightLabel: '1',
};

const BASE_C_CENTERS: LatticeAtomSpec[] = [
  { id: 'base-bot', u: 0.5, v: 0.5, w: 0, role: 'base', cellWeightLabel: '1/2' },
  { id: 'base-top', u: 0.5, v: 0.5, w: 1, role: 'base', cellWeightLabel: '1/2' },
];

const ALL_FACE_CENTERS: LatticeAtomSpec[] = [
  { id: 'f-z0', u: 0.5, v: 0.5, w: 0, role: 'face', cellWeightLabel: '1/2' },
  { id: 'f-z1', u: 0.5, v: 0.5, w: 1, role: 'face', cellWeightLabel: '1/2' },
  { id: 'f-y0', u: 0.5, v: 0, w: 0.5, role: 'face', cellWeightLabel: '1/2' },
  { id: 'f-y1', u: 0.5, v: 1, w: 0.5, role: 'face', cellWeightLabel: '1/2' },
  { id: 'f-x0', u: 0, v: 0.5, w: 0.5, role: 'face', cellWeightLabel: '1/2' },
  { id: 'f-x1', u: 1, v: 0.5, w: 0.5, role: 'face', cellWeightLabel: '1/2' },
];

function buildHcpPrismAtoms(): LatticeAtomSpec[] {
  const atoms: LatticeAtomSpec[] = [];
  // Bottom (w=0) and Top (w=1) hexagon rings at radius = 1 around center (0,0) in XY hex-prism coordinates
  for (let k = 0; k < 6; k++) {
    const theta = (k * Math.PI) / 3;
    const x = Math.cos(theta);
    const y = Math.sin(theta);
    atoms.push({
      id: `hcp-bot-${k}`,
      u: x,
      v: y,
      w: -0.5,
      role: 'corner',
      isHexPrismCoord: true,
      cellWeightLabel: '1/6',
    });
    atoms.push({
      id: `hcp-top-${k}`,
      u: x,
      v: y,
      w: 0.5,
      role: 'corner',
      isHexPrismCoord: true,
      cellWeightLabel: '1/6',
    });
  }
  // Basal centers (A-layer centers)
  atoms.push({
    id: 'hcp-basal-bot',
    u: 0,
    v: 0,
    w: -0.5,
    role: 'base',
    isHexPrismCoord: true,
    cellWeightLabel: '1/2',
  });
  atoms.push({
    id: 'hcp-basal-top',
    u: 0,
    v: 0,
    w: 0.5,
    role: 'base',
    isHexPrismCoord: true,
    cellWeightLabel: '1/2',
  });
  // Mid-plane B-layer triangle (w = 0, radius = 1 / sqrt(3))
  const rMid = 1 / Math.sqrt(3);
  for (let j = 0; j < 3; j++) {
    const theta = (j * 2 * Math.PI) / 3 + Math.PI / 6;
    atoms.push({
      id: `hcp-mid-${j}`,
      u: rMid * Math.cos(theta),
      v: rMid * Math.sin(theta),
      w: 0,
      role: 'interior',
      isHexPrismCoord: true,
      cellWeightLabel: '1',
    });
  }
  return atoms;
}

const EDGE_CENTER_OCTAHEDRAL: LatticeAtomSpec[] = [
  { id: 'e-01', u: 0.5, v: 0, w: 0, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-02', u: 0.5, v: 1, w: 0, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-03', u: 0.5, v: 0, w: 1, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-04', u: 0.5, v: 1, w: 1, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-05', u: 0, v: 0.5, w: 0, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-06', u: 1, v: 0.5, w: 0, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-07', u: 0, v: 0.5, w: 1, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-08', u: 1, v: 0.5, w: 1, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-09', u: 0, v: 0, w: 0.5, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-10', u: 1, v: 0, w: 0.5, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-11', u: 0, v: 1, w: 0.5, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'e-12', u: 1, v: 1, w: 0.5, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1/4' },
  { id: 'oct-center', u: 0.5, v: 0.5, w: 0.5, role: 'species-b', speciesIndex: 2, cellWeightLabel: '1' },
];

export const CRYSTAL_LATTICES: CrystalLatticeSpec[] = [
  // ======================== 1. CUBIC (3 Bravais) ========================
  {
    id: 'sc',
    system: 'cubic',
    categoryGroup: 'cubic',
    isBravaisCanonical: true,
    pearsonSymbol: 'cP',
    name: {
      en: 'Simple Cubic (SC)',
      id: 'Kubik Sederhana (SC)',
      ja: '単純立方格子 (SC)',
    },
    shortName: 'SC · cP',
    cellConstraints: 'a = b = c  ·  α = β = γ = 90°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: '8 corners × 1/8 = 1.0 atom/cell',
      id: '8 sudut × 1/8 = 1,0 atom/sel',
      ja: '8頂点 × 1/8 = 1.0 原子/単位格子',
    },
    coordinationNumber: '6',
    apfPercent: 52.4,
    apfLabel: '52.4% (π/6)',
    radiusFormula: 'R = a / 2 = 0.500 a',
    canonicalSphereRadius: 0.5,
    canonicalBallRadius: 0.145,
    bondCutoff: 1.08,
    slipSystems: {
      en: '{100} ⟨010⟩ (low close-packing density)',
      id: '{100} ⟨010⟩ (kerapatan susunan rendah)',
      ja: '{100} ⟨010⟩（低最密充填密度）',
    },
    mechanicalBehavior: {
      en: 'Large central void causes poor packing efficiency; rare among pure metals (only α-Polonium crystallizes cleanly as SC).',
      id: 'Rongga tengah besar menghasilkan kepadatan rendah; sangat jarang pada logam murni (hanya α-Polonium).',
      ja: '中心部の空隙が大きく充填率が低いため、純金属ではα-ポロニウムのみに見られる稀な構造です。',
    },
    exampleMaterials: ['α-Polonium (α-Po)'],
    atoms: CUBE_CORNERS,
    interstitials: [
      { id: 'sc-void', u: 0.5, v: 0.5, w: 0.5, kind: 'octahedral' },
    ],
  },
  {
    id: 'bcc',
    system: 'cubic',
    categoryGroup: 'cubic',
    isBravaisCanonical: true,
    pearsonSymbol: 'cI',
    strutzbricht: 'A2',
    name: {
      en: 'Body-Centered Cubic (BCC)',
      id: 'Kubik Berpusat Badan (BCC)',
      ja: '体心立方格子 (BCC)',
    },
    shortName: 'BCC · cI',
    cellConstraints: 'a = b = c  ·  α = β = γ = 90°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '2',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 1 center = 2 atoms/cell',
      id: '8 sudut × 1/8 + 1 pusat = 2 atom/sel',
      ja: '8頂点 × 1/8 + 体心1 = 2 原子/単位格子',
    },
    coordinationNumber: '8',
    apfPercent: 68.0,
    apfLabel: '68.0% (√3·π/8)',
    radiusFormula: '4R = √3·a  ⇒  R = 0.433 a',
    canonicalSphereRadius: Math.sqrt(3) / 4,
    canonicalBallRadius: 0.135,
    bondCutoff: 0.96,
    slipSystems: {
      en: '48 systems: {110}, {112}, {123} along ⟨111⟩',
      id: '48 sistem: {110}, {112}, {123} arah ⟨111⟩',
      ja: '48すべり系: {110}, {112}, {123} ⟨111⟩方向',
    },
    mechanicalBehavior: {
      en: 'High strength and Peierls-Nabarro friction; exhibits a sharp Ductile-to-Brittle Transition Temperature (DBTT) in ferritic steels.',
      id: 'Kekuatan tinggi dengan gesekan kisi Peierls-Nabarro besar; menunjukkan suhu transisi ulet-ke-getas (DBTT) yang tajam pada baja feritik.',
      ja: '高い降伏強度とパイエルス応力を持ち、フェライト鋼では低温で明瞭な延性-脆性遷移（DBTT）を示します。',
    },
    exampleMaterials: ['α-Fe (Ferrite)', 'Cr', 'W', 'Mo', 'V', 'Nb', 'Ta'],
    atoms: [...CUBE_CORNERS, BODY_CENTER],
    interstitials: [
      { id: 'bcc-oct-1', u: 0.5, v: 0.5, w: 0, kind: 'octahedral' },
      { id: 'bcc-oct-2', u: 0.5, v: 0, w: 0.5, kind: 'octahedral' },
      { id: 'bcc-tet-1', u: 0.5, v: 0.25, w: 0, kind: 'tetrahedral' },
      { id: 'bcc-tet-2', u: 0.5, v: 0.75, w: 0, kind: 'tetrahedral' },
    ],
  },
  {
    id: 'fcc',
    system: 'cubic',
    categoryGroup: 'cubic',
    isBravaisCanonical: true,
    pearsonSymbol: 'cF',
    strutzbricht: 'A1',
    name: {
      en: 'Face-Centered Cubic (FCC)',
      id: 'Kubik Berpusat Muka (FCC)',
      ja: '面心立方格子 (FCC)',
    },
    shortName: 'FCC · cF',
    cellConstraints: 'a = b = c  ·  α = β = γ = 90°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '4',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 6 faces × 1/2 = 4 atoms/cell',
      id: '8 sudut × 1/8 + 6 sisi × 1/2 = 4 atom/sel',
      ja: '8頂点 × 1/8 + 6面心 × 1/2 = 4 原子/単位格子',
    },
    coordinationNumber: '12',
    apfPercent: 74.0,
    apfLabel: '74.0% (√2·π/6)',
    radiusFormula: '4R = √2·a  ⇒  R = 0.354 a',
    canonicalSphereRadius: Math.sqrt(2) / 4,
    canonicalBallRadius: 0.125,
    bondCutoff: 0.78,
    slipSystems: {
      en: '12 close-packed systems: {111} ⟨110⟩ (ABCABC)',
      id: '12 sistem rapat: {111} ⟨110⟩ (urutan ABCABC)',
      ja: '12個の最密すべり系: {111} ⟨110⟩（ABCABC積層）',
    },
    mechanicalBehavior: {
      en: 'Maximum packing efficiency with close-packed {111} slip planes; remains ductile and tough even at cryogenic temperatures (no DBTT).',
      id: 'Efisiensi pengemasan maksimum dengan bidang selip rapat {111}; tetap ulet hingga suhu kriogenik tanpa DBTT.',
      ja: '最大充填率74%と最密{111}面を持ち、極低温域でも脆性遷移を示さず優れた延性を維持します。',
    },
    exampleMaterials: ['γ-Fe (Austenite)', 'Al', 'Cu', 'Ni (SS304/316)', 'Au', 'Ag', 'Pt'],
    atoms: [...CUBE_CORNERS, ...ALL_FACE_CENTERS],
    interstitials: [
      { id: 'fcc-oct-c', u: 0.5, v: 0.5, w: 0.5, kind: 'octahedral' },
      { id: 'fcc-tet-1', u: 0.25, v: 0.25, w: 0.25, kind: 'tetrahedral' },
      { id: 'fcc-tet-2', u: 0.75, v: 0.75, w: 0.25, kind: 'tetrahedral' },
    ],
  },

  // ======================== 2. TETRAGONAL (2 Bravais) ========================
  {
    id: 'st',
    system: 'tetragonal',
    categoryGroup: 'tetragonal',
    isBravaisCanonical: true,
    pearsonSymbol: 'tP',
    name: {
      en: 'Simple Tetragonal (ST)',
      id: 'Tetragonal Sederhana (ST)',
      ja: '単純正方格子 (ST)',
    },
    shortName: 'ST · tP',
    cellConstraints: 'a = b ≠ c  ·  α = β = γ = 90°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.38,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: '8 corners × 1/8 = 1.0 atom/cell',
      id: '8 sudut × 1/8 = 1,0 atom/sel',
      ja: '8頂点 × 1/8 = 1.0 原子/単位格子',
    },
    coordinationNumber: '6 (4 basal + 2 axial)',
    apfPercent: 38.0,
    apfLabel: '≤ 52.4% (c/a dependent)',
    radiusFormula: 'R = a / 2 (stretched along c)',
    canonicalSphereRadius: 0.5,
    canonicalBallRadius: 0.135,
    bondCutoff: 1.48,
    slipSystems: {
      en: '{100} ⟨010⟩ basal or {110} ⟨001⟩ prismatic',
      id: '{100} ⟨010⟩ basal atau {110} ⟨001⟩ prismatik',
      ja: '{100} ⟨010⟩ 底面または {110} ⟨001⟩ 柱面',
    },
    mechanicalBehavior: {
      en: 'Elongated c-axis breaks cubic symmetry into 4-fold rotational symmetry along [001], producing anisotropic stiffness and thermal expansion.',
      id: 'Sumbu-c memanjang memecah simetri kubik menjadi simetri 4-lipat, menyebabkan kekakuan & ekspansi termal anisotropik.',
      ja: 'c軸方向の伸縮により立方対称性が破れ、4回回転対称性と弾性・熱膨張の異方性が生じます。',
    },
    exampleMaterials: ['Rutile TiO₂ sublattice', 'BaTiO₃ (Ferroelectric)', 'γ-CuZn'],
    atoms: CUBE_CORNERS,
  },
  {
    id: 'bct',
    system: 'tetragonal',
    categoryGroup: 'tetragonal',
    isBravaisCanonical: true,
    pearsonSymbol: 'tI',
    strutzbricht: 'L\'2 (Martensite)',
    name: {
      en: 'Body-Centered Tetragonal (BCT)',
      id: 'Tetragonal Berpusat Badan (BCT)',
      ja: '体心正方格子 (BCT)',
    },
    shortName: 'BCT · tI',
    cellConstraints: 'a = b ≠ c  ·  α = β = γ = 90°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.18,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '2',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 1 center = 2 Fe atoms/cell',
      id: '8 sudut × 1/8 + 1 pusat = 2 atom Fe/sel',
      ja: '8頂点 × 1/8 + 体心1 = 2 Fe原子/単位格子',
    },
    coordinationNumber: '8 (distorted)',
    apfPercent: 62.0,
    apfLabel: '~62% – 69.9% (depends on c/a)',
    radiusFormula: 'c/a = 1 + 0.045 × (%C) in Fe-C Martensite',
    canonicalSphereRadius: 0.43,
    canonicalBallRadius: 0.13,
    bondCutoff: 1.12,
    slipSystems: {
      en: 'Tetragonally distorted {110} — dislocation motion pinned',
      id: 'Terdistorsi tetragonal {110} — pergerakan dislokasi terkunci',
      ja: '正方歪みを受けた {110} — 転位移動が強くピン止め',
    },
    mechanicalBehavior: {
      en: 'Supersaturated Carbon trapped at z-octahedral interstitial sites shears FCC austenite into BCT Martensite — creating extreme hardness in tool steels and shafts.',
      id: 'Karbon lewat jenuh yang terjebak di celah oktahedral menggeser austenit menjadi Martensit BCT — menghasilkan kekerasan ekstrem pada baja perkakas.',
      ja: '過飽和炭素がオーステナイトから無拡散変態（マルテンサイト変態）を起こし、極めて高い硬度と耐摩耗性を生みます。',
    },
    exampleMaterials: ['Fe-C Martensite (Hardened Steel)', 'β-Sn (White Tin)', 'Indium (In)'],
    atoms: [...CUBE_CORNERS, BODY_CENTER],
    interstitials: [
      { id: 'bct-c-top', u: 0.5, v: 0.5, w: 0, kind: 'octahedral' },
      { id: 'bct-c-bot', u: 0.5, v: 0.5, w: 1, kind: 'octahedral' },
    ],
  },

  // ======================== 3. ORTHORHOMBIC (4 Bravais) ========================
  {
    id: 'so',
    system: 'orthorhombic',
    categoryGroup: 'orthorhombic',
    isBravaisCanonical: true,
    pearsonSymbol: 'oP',
    name: {
      en: 'Simple Orthorhombic (SO)',
      id: 'Ortorombik Sederhana (SO)',
      ja: '単純斜方格子 (SO)',
    },
    shortName: 'SO · oP',
    cellConstraints: 'a ≠ b ≠ c  ·  α = β = γ = 90°',
    defaultBOverA: 1.24,
    defaultCOverA: 1.5,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: '8 corners × 1/8 = 1.0 atom/cell',
      id: '8 sudut × 1/8 = 1,0 atom/sel',
      ja: '8頂点 × 1/8 = 1.0 原子/単位格子',
    },
    coordinationNumber: '6 (3 orthogonal pairs)',
    apfPercent: 28.0,
    apfLabel: '28% – 45% (low packing)',
    radiusFormula: 'R ≤ min(a, b, c) / 2',
    canonicalSphereRadius: 0.45,
    canonicalBallRadius: 0.13,
    bondCutoff: 1.62,
    slipSystems: {
      en: 'Anisotropic along shortest axis ⟨100⟩',
      id: 'Anisotropik sepanjang sumbu terpendek ⟨100⟩',
      ja: '最短軸 ⟨100⟩ 方向に沿った異方性すべり',
    },
    mechanicalBehavior: {
      en: 'Three mutually perpendicular axes of unequal lengths produce strongly directional modulus, cleavage, and piezoelectric or ferroelectric behavior.',
      id: 'Tiga sumbu saling tegak lurus dengan panjang berbeda menghasilkan modulus, belahan kristal, dan sifat anisotropik kuat.',
      ja: '互いに直交する3軸の長さがすべて異なるため、弾性率や劈開面に明確な方向性（異方性）が現れます。',
    },
    exampleMaterials: ['Cementite (Fe₃C framework)', 'α-Np', 'Olivine (Mg,Fe)₂SiO₄'],
    atoms: CUBE_CORNERS,
  },
  {
    id: 'bco',
    system: 'orthorhombic',
    categoryGroup: 'orthorhombic',
    isBravaisCanonical: true,
    pearsonSymbol: 'oI',
    name: {
      en: 'Body-Centered Orthorhombic (BCO)',
      id: 'Ortorombik Berpusat Badan (BCO)',
      ja: '体心斜方格子 (BCO)',
    },
    shortName: 'BCO · oI',
    cellConstraints: 'a ≠ b ≠ c  ·  α = β = γ = 90°',
    defaultBOverA: 1.24,
    defaultCOverA: 1.5,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '2',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 1 body center = 2 atoms/cell',
      id: '8 sudut × 1/8 + 1 pusat badan = 2 atom/sel',
      ja: '8頂点 × 1/8 + 体心1 = 2 原子/単位格子',
    },
    coordinationNumber: '8',
    apfPercent: 48.0,
    apfLabel: '~48% – 62%',
    radiusFormula: '4R = √(a² + b² + c²)',
    canonicalSphereRadius: 0.42,
    canonicalBallRadius: 0.13,
    bondCutoff: 1.15,
    slipSystems: {
      en: '{110} / {011} orthogonal diagonal planes',
      id: 'Bidang diagonal ortogonal {110} / {011}',
      ja: '直交対角面 {110} / {011}',
    },
    mechanicalBehavior: {
      en: 'Adding a body-centered lattice point stiffens the elongated orthorhombic prism against shear distortion.',
      id: 'Penambahan titik kisi pusat badan memperkaku prisma ortorombik memanjang terhadap distorsi geser.',
      ja: '体心位置の原子により、伸長した斜方晶プリズムのせん断剛性が向上します。',
    },
    exampleMaterials: ['Mg₂SiO₄ High-P phases', 'KNO₃-III', 'V-Cr-Ti Orthorhombic'],
    atoms: [...CUBE_CORNERS, BODY_CENTER],
  },
  {
    id: 'baco',
    system: 'orthorhombic',
    categoryGroup: 'orthorhombic',
    isBravaisCanonical: true,
    pearsonSymbol: 'oS (oC)',
    name: {
      en: 'Base-Centered Orthorhombic (C-Orth)',
      id: 'Ortorombik Berpusat Alas (Base-Centered)',
      ja: '底心斜方格子 (oS / oC)',
    },
    shortName: 'C-Orth · oS',
    cellConstraints: 'a ≠ b ≠ c  ·  α = β = γ = 90°',
    defaultBOverA: 1.24,
    defaultCOverA: 1.5,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '2',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 2 basal faces × 1/2 = 2 atoms/cell',
      id: '8 sudut × 1/8 + 2 sisi alas × 1/2 = 2 atom/sel',
      ja: '8頂点 × 1/8 + 底面2 × 1/2 = 2 原子/単位格子',
    },
    coordinationNumber: '8 (basal-centered)',
    apfPercent: 45.0,
    apfLabel: '~45% – 58%',
    radiusFormula: 'Basal diagonal: 4R = √(a² + b²)',
    canonicalSphereRadius: 0.4,
    canonicalBallRadius: 0.13,
    bondCutoff: 0.92,
    slipSystems: {
      en: '(001) basal plane layered cleavage',
      id: 'Belahan berlapis pada bidang basal (001)',
      ja: '(001) 底面層状劈開',
    },
    mechanicalBehavior: {
      en: 'Centering only the top and bottom (001) faces creates a distinctly layered crystal with preferred cleavage parallel to the ab-plane.',
      id: 'Pemusatan hanya pada muka atas dan bawah (001) menciptakan struktur berlapis dengan belahan paralel bidang ab.',
      ja: '上下の(001)底面のみに格子点を持つため、ab面に平行な層状構造・劈開特性を示します。',
    },
    exampleMaterials: ['α-Uranium (α-U)', 'Gallium (Ga)', 'Yellow Arsenic'],
    atoms: [...CUBE_CORNERS, ...BASE_C_CENTERS],
  },
  {
    id: 'fco',
    system: 'orthorhombic',
    categoryGroup: 'orthorhombic',
    isBravaisCanonical: true,
    pearsonSymbol: 'oF',
    name: {
      en: 'Face-Centered Orthorhombic (FCO)',
      id: 'Ortorombik Berpusat Muka (FCO)',
      ja: '面心斜方格子 (FCO · oF)',
    },
    shortName: 'FCO · oF',
    cellConstraints: 'a ≠ b ≠ c  ·  α = β = γ = 90°',
    defaultBOverA: 1.24,
    defaultCOverA: 1.5,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '4',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 6 faces × 1/2 = 4 atoms/cell',
      id: '8 sudut × 1/8 + 6 sisi × 1/2 = 4 atom/sel',
      ja: '8頂点 × 1/8 + 6面心 × 1/2 = 4 原子/単位格子',
    },
    coordinationNumber: '12 (anisotropic)',
    apfPercent: 56.0,
    apfLabel: '~56% – 70%',
    radiusFormula: 'R ≤ √(a² + b²) / 4',
    canonicalSphereRadius: 0.34,
    canonicalBallRadius: 0.12,
    bondCutoff: 1.05,
    slipSystems: {
      en: 'Pseudo-close-packed {111} along shortest face diagonals',
      id: '{111} semu-rapat sepanjang diagonal sisi terpendek',
      ja: '最短面対角線に沿う擬似最密 {111} 系',
    },
    mechanicalBehavior: {
      en: 'All 6 faces carry centered lattice points, preserving high coordination while breaking cubic isotropy across unequal a, b, and c.',
      id: 'Keenam muka memiliki titik pusat, mempertahankan koordinasi tinggi namun memecah isotropi kubik akibat perbedaan a, b, c.',
      ja: '6つの全面に格子点を持つため高配位数を保ちながら、a・b・c長の差による異方性を示します。',
    },
    exampleMaterials: ['α-Sulfur (S₈)', 'Ti₂AlNb (O-phase)', 'Plutonium (γ-Pu)'],
    atoms: [...CUBE_CORNERS, ...ALL_FACE_CENTERS],
  },

  // ======================== 4. HEXAGONAL (hP Bravais + Full HCP Prism) ========================
  {
    id: 'hex-p',
    system: 'hexagonal',
    categoryGroup: 'hexagonal',
    isBravaisCanonical: true,
    pearsonSymbol: 'hP',
    name: {
      en: 'Simple Hexagonal Bravais Cell (hP)',
      id: 'Kisi Bravais Heksagonal Sederhana (hP)',
      ja: '単純六方ブラベー格子 (hP)',
    },
    shortName: 'Hex (hP)',
    cellConstraints: 'a = b ≠ c  ·  α = β = 90°, γ = 120°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.45,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 120,
    allowBSlider: false,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: 'Primitive 120° rhombic prism: 4×(1/12) + 4×(1/6) = 1.0 atom/cell',
      id: 'Prisma rombik primitif 120°: total = 1,0 atom/sel',
      ja: '120°菱形プリズム基本格子 = 1.0 原子/単位格子',
    },
    coordinationNumber: '8 (6 in basal ring + 2 axial)',
    apfPercent: 60.5,
    apfLabel: '60.5% (ideal c/a = 1)',
    radiusFormula: 'R = a / 2 (basal close touch)',
    canonicalSphereRadius: 0.48,
    canonicalBallRadius: 0.135,
    bondCutoff: 1.52,
    slipSystems: {
      en: 'Basal (0001) ⟨112̄0⟩',
      id: 'Bidang basal (0001) ⟨112̄0⟩',
      ja: '底面すべり (0001) ⟨112̄0⟩',
    },
    mechanicalBehavior: {
      en: 'The true primitive hexagonal Bravais lattice is a 60°/120° rhombic prism; three primitive cells tile symmetrically to form the familiar 6-sided hexagonal prism.',
      id: 'Kisi Bravais heksagonal primitif sebenarnya berupa prisma belah ketupat 60°/120°; tiga sel primitif bergabung membentuk prisma heksagonal 6 sisi.',
      ja: '本来の六方ブラベー単純格子は60°/120°の菱形プリズムであり、これが3つ集まって正六角柱構造を形成します。',
    },
    exampleMaterials: ['Graphite C (layer framework)', 'WC (Tungsten Carbide)', 'SiC'],
    atoms: CUBE_CORNERS,
  },
  {
    id: 'hcp',
    system: 'hexagonal',
    categoryGroup: 'hexagonal',
    isBravaisCanonical: false,
    pearsonSymbol: 'hP2 (Full Prism)',
    strutzbricht: 'A3',
    name: {
      en: 'Hexagonal Close-Packed (HCP Full Prism)',
      id: 'Heksagonal Tertutup Rapat (HCP Prisma Penuh)',
      ja: '六方最密充填構造 (HCP 6角柱)',
    },
    shortName: 'HCP · A3',
    cellConstraints: 'a = b ≠ c  ·  c/a = 1.633  ·  γ = 120°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.633,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 120,
    allowBSlider: false,
    allowCSlider: true,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '6 (prism) / 2 (prim)',
    atomCountBreakdown: {
      en: '12 corners × 1/6 + 2 basal × 1/2 + 3 B-layer = 6 atoms/prism',
      id: '12 sudut × 1/6 + 2 alas × 1/2 + 3 tengah = 6 atom/prisma',
      ja: '12頂点×1/6 + 上下底心2×1/2 + 中間B層3 = 6 原子/六角柱',
    },
    coordinationNumber: '12',
    apfPercent: 74.0,
    apfLabel: '74.0% (ideal c/a = 1.633)',
    radiusFormula: 'R = a / 2 = 0.500 a  |  Ideal c/a = √(8/3)',
    canonicalSphereRadius: 0.5,
    canonicalBallRadius: 0.14,
    bondCutoff: 1.08,
    slipSystems: {
      en: '3 basal systems (0001) ⟨112̄0⟩ (ABABAB)',
      id: '3 sistem basal utama (0001) ⟨112̄0⟩ (ABABAB)',
      ja: '3つの底面すべり系 (0001) ⟨112̄0⟩（ABAB積層）',
    },
    mechanicalBehavior: {
      en: 'Shares maximum 74% density with FCC, yet only 3 primary basal slip systems exist — resulting in anisotropic work-hardening and twinning in Titanium & Magnesium.',
      id: 'Memiliki kepadatan 74% setara FCC, namun hanya punya 3 sistem selip basal utama — menyebabkan kembaran (twinning) & keuletan terbatas pada Ti dan Mg.',
      ja: 'FCCと同じ最大充填率74%ですが独立すべり系が少ないため、チタンやマグネシウムでは変形双晶や異方性加工硬化が生じます。',
    },
    exampleMaterials: ['Ti (Ti-6Al-4V)', 'Mg', 'Zn', 'Co', 'Zr', 'Cd', 'Be'],
    isFullHexPrism: true,
    atoms: buildHcpPrismAtoms(),
    interstitials: [
      { id: 'hcp-oct-1', u: 0.35, v: 0.2, w: 0.25, kind: 'octahedral', isHexPrismCoord: true },
      { id: 'hcp-oct-2', u: -0.35, v: 0.2, w: -0.25, kind: 'octahedral', isHexPrismCoord: true },
    ],
  },

  // ======================== 5. RHOMBOHEDRAL / TRIGONAL (1 Bravais) ========================
  {
    id: 'rhomb',
    system: 'rhombohedral',
    categoryGroup: 'rhombohedral',
    isBravaisCanonical: true,
    pearsonSymbol: 'hR',
    name: {
      en: 'Rhombohedral / Trigonal (hR)',
      id: 'Rombohedral / Trigonal (hR)',
      ja: '菱面体晶 / 三方晶 (hR)',
    },
    shortName: 'Rhomb · hR',
    cellConstraints: 'a = b = c  ·  α = β = γ ≠ 90°',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 74,
    defaultBetaDeg: 74,
    defaultGammaDeg: 74,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'rhombohedral',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: '8 sheared cube corners × 1/8 = 1.0 atom/cell',
      id: '8 sudut tergeser × 1/8 = 1,0 atom/sel',
      ja: '8頂点 × 1/8 = 1.0 原子/単位格子（三方対称）',
    },
    coordinationNumber: '6 (3-fold trigonal axis [111])',
    apfPercent: 56.0,
    apfLabel: '~52% – 66% (angle-dependent)',
    radiusFormula: 'Cube stretched/compressed along [111] body diagonal',
    canonicalSphereRadius: 0.45,
    canonicalBallRadius: 0.135,
    bondCutoff: 1.1,
    slipSystems: {
      en: 'Rhombohedral {101̄1} & basal {0001} at elevated T',
      id: 'Bidang rombohedral {101̄1} & basal pada suhu tinggi',
      ja: '菱面体面 {101̄1} および高温域底面すべり',
    },
    mechanicalBehavior: {
      en: 'Three equal lattice vectors tilted by an equal angle (α = β = γ ≠ 90°) yield a 3-fold rotational axis along the body diagonal; common in corundum ceramics & bismuth.',
      id: 'Tiga vektor kisi sama panjang dengan sudut α = β = γ ≠ 90° membentuk simetri 3-lipat di diagonal utama; khas pada keramik alumina & bismut.',
      ja: '3辺が等しく角α=β=γが90°でない構造で、体対角線方向に3回回転対称軸を持ちます（アルミナ、Bi等）。',
    },
    exampleMaterials: ['Bi (Bismuth)', 'Sb', 'α-Al₂O₃ (Corundum)', 'SiO₂ (Quartz)', 'Hg'],
    atoms: CUBE_CORNERS,
  },

  // ======================== 6. MONOCLINIC (2 Bravais) ========================
  {
    id: 'sm',
    system: 'monoclinic',
    categoryGroup: 'monoclinic',
    isBravaisCanonical: true,
    pearsonSymbol: 'mP',
    name: {
      en: 'Simple Monoclinic (SM)',
      id: 'Monoklinik Sederhana (SM)',
      ja: '単純単斜格子 (SM · mP)',
    },
    shortName: 'SM · mP',
    cellConstraints: 'a ≠ b ≠ c  ·  α = γ = 90°, β ≠ 90°',
    defaultBOverA: 1.18,
    defaultCOverA: 1.38,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 112,
    defaultGammaDeg: 90,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'beta',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: '8 tilted corners × 1/8 = 1.0 atom/cell',
      id: '8 sudut miring × 1/8 = 1,0 atom/sel',
      ja: '傾斜8頂点 × 1/8 = 1.0 原子/単位格子',
    },
    coordinationNumber: '6 – 7 (monoclinic distortion)',
    apfPercent: 34.0,
    apfLabel: '~34% – 48%',
    radiusFormula: 'Tilted c-axis at β = 112° relative to a-axis',
    canonicalSphereRadius: 0.42,
    canonicalBallRadius: 0.13,
    bondCutoff: 1.5,
    slipSystems: {
      en: 'Strongly restricted by inclined β angle; brittle ceramic behavior',
      id: 'Sangat terbatas oleh kemiringan sudut β; perilaku keramik getas',
      ja: '単斜角 β によりすべり系が強く制限され、脆性破壊しやすい構造',
    },
    mechanicalBehavior: {
      en: 'Zirconia (ZrO₂) undergoes a 4% volume expansion when transforming from tetragonal to monoclinic mP on cooling — exploited in transformation-toughened ceramics.',
      id: 'Zirkonia (ZrO₂) mengalami ekspansi volume 4% saat bertransformasi ke monoklinik mP — dimanfaatkan dalam keramik tahan retak.',
      ja: 'ジルコニア（ZrO₂）が正方晶から単斜晶へ相変態する際の約4%の体積膨張は、セラミックスの変態強靭化に利用されます。',
    },
    exampleMaterials: ['Monoclinic ZrO₂ (Baddeleyite)', 'β-Sulfur', 'β-Pu'],
    atoms: CUBE_CORNERS,
  },
  {
    id: 'bacm',
    system: 'monoclinic',
    categoryGroup: 'monoclinic',
    isBravaisCanonical: true,
    pearsonSymbol: 'mS (mC)',
    name: {
      en: 'Base-Centered Monoclinic (C-Mono)',
      id: 'Monoklinik Berpusat Alas (mS)',
      ja: '底心単斜格子 (mS / mC)',
    },
    shortName: 'C-Mono · mS',
    cellConstraints: 'a ≠ b ≠ c  ·  α = γ = 90°, β ≠ 90°',
    defaultBOverA: 1.18,
    defaultCOverA: 1.38,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 112,
    defaultGammaDeg: 90,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'beta',
    effectiveAtomsPerCell: '2',
    atomCountBreakdown: {
      en: '8 corners × 1/8 + 2 basal faces × 1/2 = 2 atoms/cell',
      id: '8 sudut × 1/8 + 2 sisi alas × 1/2 = 2 atom/sel',
      ja: '8頂点 × 1/8 + 底面2 × 1/2 = 2 原子/単位格子',
    },
    coordinationNumber: '8 (layered monoclinic)',
    apfPercent: 46.0,
    apfLabel: '~46% – 58%',
    radiusFormula: 'Tilted prism with centered (001) C-basal faces',
    canonicalSphereRadius: 0.39,
    canonicalBallRadius: 0.125,
    bondCutoff: 1.02,
    slipSystems: {
      en: '(001) & (010) planar cleavage with 2-fold [010] symmetry',
      id: 'Belahan bidang (001) & (010) dengan simetri 2-lipat [010]',
      ja: '2回対称軸 [010] を伴う (001)/(010) 層状劈開',
    },
    mechanicalBehavior: {
      en: 'Centering on the (001) face of an inclined monoclinic prism preserves a single 2-fold mirror symmetry plane and defines silicate minerals like orthoclase & gypsum.',
      id: 'Pemusatan pada muka (001) prisma miring mempertahankan simetri cermin tunggal; khas pada mineral gipsum & ortoklas.',
      ja: '傾斜した単斜プリズムの(001)面中心に格子点を持ち、石膏や正長石などの鉱物・高分子結晶で現れます。',
    },
    exampleMaterials: ['Gypsum (CaSO₄·2H₂O)', 'Orthoclase', 'NiTi B19′ Martensite'],
    atoms: [...CUBE_CORNERS, ...BASE_C_CENTERS],
  },

  // ======================== 7. TRICLINIC (1 Bravais) ========================
  {
    id: 'triclinic',
    system: 'triclinic',
    categoryGroup: 'triclinic',
    isBravaisCanonical: true,
    pearsonSymbol: 'aP',
    name: {
      en: 'Triclinic (aP)',
      id: 'Triklinik (aP)',
      ja: '三斜格子 (aP)',
    },
    shortName: 'Triclinic · aP',
    cellConstraints: 'a ≠ b ≠ c  ·  α ≠ β ≠ γ ≠ 90°',
    defaultBOverA: 1.16,
    defaultCOverA: 1.36,
    defaultAlphaDeg: 76,
    defaultBetaDeg: 105,
    defaultGammaDeg: 112,
    allowBSlider: true,
    allowCSlider: true,
    allowAngleSlider: 'triclinic',
    effectiveAtomsPerCell: '1',
    atomCountBreakdown: {
      en: '8 corners × 1/8 = 1.0 atom/cell (lowest symmetry)',
      id: '8 sudut × 1/8 = 1,0 atom/sel (simetri terendah)',
      ja: '8頂点 × 1/8 = 1.0 原子/単位格子（最小対称性）',
    },
    coordinationNumber: '6 (fully oblique)',
    apfPercent: 32.0,
    apfLabel: '~32% – 44% (oblique packing)',
    radiusFormula: 'All 3 lengths and 3 interaxial angles independent',
    canonicalSphereRadius: 0.4,
    canonicalBallRadius: 0.13,
    bondCutoff: 1.55,
    slipSystems: {
      en: 'No rotational symmetry axes (only inversion center or P1)',
      id: 'Tanpa sumbu rotasi simetri — ikatan sangat terarah',
      ja: '回転対称軸なし — 強い異方性と特定面への劈開',
    },
    mechanicalBehavior: {
      en: 'Most general crystal geometry where a ≠ b ≠ c and α ≠ β ≠ γ ≠ 90°; exhibits zero rotational symmetry axes and highly complex optical & elastic tensors.',
      id: 'Geometri kristal paling umum (seluruh sisi dan sudut berbeda); tanpa sumbu simetri putar dengan tensor elastis kompleks.',
      ja: 'すべての軸長と軸角が異なる最も一般的な結晶系であり、回転対称軸を持たず複雑な光学・弾性異方性を示します。',
    },
    exampleMaterials: ['CuSO₄·5H₂O', 'Microcline Feldspar', 'Boric Acid (H₃BO₃)', 'PET Polymer'],
    atoms: CUBE_CORNERS,
  },

  // ======================== 8. ENGINEERING & COMPOUND CRYSTALS (3) ========================
  {
    id: 'diamond',
    system: 'cubic',
    categoryGroup: 'compound',
    isBravaisCanonical: false,
    pearsonSymbol: 'cF8 (Diamond)',
    strutzbricht: 'A4',
    name: {
      en: 'Diamond Cubic (Covalent sp³)',
      id: 'Kubik Intan / Diamond Cubic (sp³)',
      ja: 'ダイヤモンド立方格子 (sp³ 共有結合)',
    },
    shortName: 'Diamond · cF8',
    cellConstraints: 'a = b = c  ·  α = β = γ = 90° (FCC + 4 tet)',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '8',
    atomCountBreakdown: {
      en: '4 (FCC host) + 4 (1/4,1/4,1/4 tetrahedral) = 8 atoms/cell',
      id: '4 (induk FCC) + 4 (tetrahedral dalam) = 8 atom/sel',
      ja: '4 (FCC枠) + 4 (正四面体内部) = 8 原子/単位格子',
    },
    coordinationNumber: '4 (109.5° tetrahedral sp³)',
    apfPercent: 34.0,
    apfLabel: '34.0% (π√3 / 16)',
    radiusFormula: '8R = √3·a  ⇒  R = 0.2165 a',
    canonicalSphereRadius: Math.sqrt(3) / 8,
    canonicalBallRadius: 0.1,
    bondCutoff: 0.48,
    slipSystems: {
      en: '{111} ⟨110⟩ only at high homologous T (> 0.6 Tm)',
      id: '{111} ⟨110⟩ hanya aktif pada suhu sangat tinggi',
      ja: '{111} ⟨110⟩（共有結合のため低温では極めて高い硬さ・脆性）',
    },
    mechanicalBehavior: {
      en: 'Very low 34% open APF combined with rigid directional covalent sp³ bonds gives extreme hardness (10 Mohs), massive thermal conductivity, and semiconductor bandgaps.',
      id: 'Meskipun kepadatan atom hanya 34%, ikatan kovalen sp³ terarah menghasilkan kekerasan ekstrem (intan) serta sifat semikonduktor (Si, Ge).',
      ja: '充填率は34%と疎ですが、強固な正四面体sp³共有結合により最高硬度（ダイヤモンド）や半導体特性（Si, Ge）を生み出します。',
    },
    exampleMaterials: ['Diamond (C)', 'Silicon (Si)', 'Germanium (Ge)', 'α-Sn (Gray Tin)'],
    atoms: [
      ...CUBE_CORNERS,
      ...ALL_FACE_CENTERS,
      { id: 'dia-1', u: 0.25, v: 0.25, w: 0.25, role: 'interior', cellWeightLabel: '1' },
      { id: 'dia-2', u: 0.75, v: 0.75, w: 0.25, role: 'interior', cellWeightLabel: '1' },
      { id: 'dia-3', u: 0.75, v: 0.25, w: 0.75, role: 'interior', cellWeightLabel: '1' },
      { id: 'dia-4', u: 0.25, v: 0.75, w: 0.75, role: 'interior', cellWeightLabel: '1' },
    ],
  },
  {
    id: 'nacl',
    system: 'cubic',
    categoryGroup: 'compound',
    isBravaisCanonical: false,
    pearsonSymbol: 'cF8 · B1',
    strutzbricht: 'B1 (Rock Salt)',
    name: {
      en: 'Rock Salt / Ceramic B1 (NaCl / TiN)',
      id: 'Keramik Garam Batu B1 (NaCl / TiN)',
      ja: '岩塩型 B1 セラミック構造 (NaCl / TiN)',
    },
    shortName: 'Rock Salt · B1',
    cellConstraints: 'a = b = c  ·  α = β = γ = 90° (Dual FCC)',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '4 + 4 = 8 ions',
    atomCountBreakdown: {
      en: '4 FCC cations + (12 edges×1/4 + 1 center = 4 anions)',
      id: '4 kation FCC + (12 rusuk×1/4 + 1 pusat = 4 anion)',
      ja: 'FCC陽イオン4 + (12辺×1/4 + 体心1 = 陰イオン4)',
    },
    coordinationNumber: '6 : 6 (octahedral)',
    apfPercent: 66.0,
    apfLabel: '66% – 79% (r_c / r_a = 0.414–0.732)',
    radiusFormula: 'a = 2 (r_cation + r_anion)',
    canonicalSphereRadius: 0.29,
    canonicalBallRadius: 0.115,
    secondSpeciesScale: 0.76,
    bondCutoff: 0.56,
    slipSystems: {
      en: '{110} ⟨11̄0⟩ (charge repulsion blocks {100} slip)',
      id: '{110} ⟨11̄0⟩ (tolakan muatan ion mencegah selip mudah)',
      ja: '{110} ⟨11̄0⟩（同符号イオンの静電反発により室温では脆性）',
    },
    mechanicalBehavior: {
      en: 'Two interpenetrating FCC sublattices (metal + nonmetal/halide) form refractory carbides & nitrides (TiN gold tool coating, TiC, MgO) with ultra-high melting points.',
      id: 'Dua sub-kisi FCC saling menyusup membentuk karbida & nitrida tahan aus seperti lapisan pahat TiN (emas), TiC, dan MgO.',
      ja: '2つのFCC副格子が1/2周期ずれて貫入した構造で、切削工具のTiNコーティングやTiC・MgOなどの超硬・耐火セラミックスを形成します。',
    },
    exampleMaterials: ['TiN (Tool Coating)', 'TiC', 'MgO', 'NaCl', 'FeO', 'VC'],
    atoms: [
      ...CUBE_CORNERS.map((a) => ({ ...a, speciesIndex: 1 as const })),
      ...ALL_FACE_CENTERS.map((a) => ({ ...a, speciesIndex: 1 as const })),
      ...EDGE_CENTER_OCTAHEDRAL,
    ],
  },
  {
    id: 'cscl',
    system: 'cubic',
    categoryGroup: 'compound',
    isBravaisCanonical: false,
    pearsonSymbol: 'cP2 · B2',
    strutzbricht: 'B2 (Ordered Intermetallic)',
    name: {
      en: 'CsCl / Ordered B2 Intermetallic (NiTi)',
      id: 'Intermetalik Teratur B2 (CsCl / NiTi)',
      ja: 'CsCl型 B2 規則金属間化合物 (NiTi等)',
    },
    shortName: 'B2 Intermetallic',
    cellConstraints: 'a = b = c  ·  α = β = γ = 90° (Ordered AB)',
    defaultBOverA: 1.0,
    defaultCOverA: 1.0,
    defaultAlphaDeg: 90,
    defaultBetaDeg: 90,
    defaultGammaDeg: 90,
    allowBSlider: false,
    allowCSlider: false,
    allowAngleSlider: 'none',
    effectiveAtomsPerCell: '1 + 1 = 2 (AB)',
    atomCountBreakdown: {
      en: 'Species A: 8 corners×1/8 = 1  +  Species B: 1 center = 1',
      id: 'Spesies A: 8 sudut×1/8 = 1  +  Spesies B: 1 pusat = 1',
      ja: 'A種(頂点×1/8 = 1) + B種(体心 = 1) 計2原子/単位格子',
    },
    coordinationNumber: '8 : 8 (cubic B2)',
    apfPercent: 68.4,
    apfLabel: '68.4% (for equal radii r_A ≈ r_B)',
    radiusFormula: '√3·a = 2(r_A + r_B)  ·  Ordered SC Bravais + basis',
    canonicalSphereRadius: 0.43,
    canonicalBallRadius: 0.135,
    secondSpeciesScale: 1.06,
    bondCutoff: 0.96,
    slipSystems: {
      en: '{110} ⟨001⟩ (superdislocations preserve AB chemical order)',
      id: '{110} ⟨001⟩ (dislokasi super menjaga keteraturan ikatan AB)',
      ja: '{110} ⟨001⟩（規則構造を保つ超格子転位・マルテンサイト記憶効果）',
    },
    mechanicalBehavior: {
      en: 'Chemically ordered cousin of BCC where center atom differs from corners (simple cubic Bravais with 2-atom basis); enables Nitinol shape-memory alloys and high-temp aluminides.',
      id: 'Mirip BCC namun atom pusat berbeda spesies kimia dari sudut; mendasari paduan memori bentuk Nitinol (NiTi) & aluminida suhu tinggi.',
      ja: '体心位置と頂点が異なる元素で構成される規則格子（実体は2原子基底の単純立方格子）で、NiTi形状記憶合金や耐熱金属間化合物の基本構造です。',
    },
    exampleMaterials: ['NiTi (Nitinol Austenitic)', 'β-Brass (CuZn)', 'FeAl', 'NiAl', 'CsCl'],
    atoms: [
      ...CUBE_CORNERS.map((a) => ({ ...a, speciesIndex: 1 as const })),
      {
        id: 'b2-center',
        u: 0.5,
        v: 0.5,
        w: 0.5,
        role: 'species-b',
        speciesIndex: 2,
        cellWeightLabel: '1',
      },
    ],
  },
];

export const MILLER_PLANES: {
  id: MillerPlaneId;
  label: string;
  description: LocalizedText;
}[] = [
  {
    id: 'none',
    label: 'None',
    description: {
      en: 'Hide crystallographic plane overlay',
      id: 'Sembunyikan bidang kristalografi',
      ja: '結晶面オーバーレイを非表示',
    },
  },
  {
    id: '100',
    label: '(100)',
    description: {
      en: 'Cube face / front cleavage plane [normal along a]',
      id: 'Bidang muka kubus / belahan depan [normal sumbu a]',
      ja: '(100) 正面ファセット / 劈開面 [a軸に垂直]',
    },
  },
  {
    id: '110',
    label: '(110)',
    description: {
      en: 'Primary BCC slip plane — high atomic density diagonal plane',
      id: 'Bidang selip utama BCC — bidang diagonal rapat atom',
      ja: '(110) BCC主すべり面 — 体対角方向の最密面',
    },
  },
  {
    id: '111',
    label: '(111)',
    description: {
      en: 'Closest-packed FCC slip plane — ABC stacking plane',
      id: 'Bidang selip terpadat FCC — bidang tumpukan ABC',
      ja: '(111) FCC最密充填すべり面 — ABC積層面',
    },
  },
  {
    id: '0001',
    label: '(0001) Basal',
    description: {
      en: 'Hexagonal Basal Slip Plane (HCP Titanium / Magnesium)',
      id: 'Bidang Selip Basal Heksagonal (HCP Titanium / Magnesium)',
      ja: '(0001) 六方晶底面すべり面（Ti / Mg）',
    },
  },
  {
    id: '10-10',
    label: '(101̄0) Prism',
    description: {
      en: 'Hexagonal Prismatic Plane / Secondary Titanium slip plane',
      id: 'Bidang Prismatik Heksagonal / Bidang selip sekunder Titanium',
      ja: '(101̄0) 六方晶柱面 / チタンの二次すべり面',
    },
  },
];

// =====================================================================
// ACADEMIC / PROFESSOR SUITE: REAL MATERIALS, DEFECTS, DENSITY & XRD
// =====================================================================

export type CrystalDefectMode =
  | 'none'
  | 'vacancy'
  | 'substitutional'
  | 'interstitial-c'
  | 'dislocation';

export interface CrystalDefectInfo {
  id: CrystalDefectMode;
  symbol: string;
  name: LocalizedText;
  description: LocalizedText;
}

export const CRYSTAL_DEFECTS: CrystalDefectInfo[] = [
  {
    id: 'none',
    symbol: 'Perfect',
    name: {
      en: 'Ideal Defect-Free Lattice',
      id: 'Kisi Ideal Sempurna',
      ja: '理想完全結晶',
    },
    description: {
      en: 'Periodic translationally invariant crystal without point or line defects.',
      id: 'Kristal periodik sempurna tanpa cacat titik maupun garis.',
      ja: '点欠陥や線欠陥を含まない完全周期結晶格子です。',
    },
  },
  {
    id: 'vacancy',
    symbol: 'V□',
    name: {
      en: 'Vacancy Point Defect (Schottky)',
      id: 'Kekosongan Atom / Vakansi',
      ja: '原子空孔（点欠陥）',
    },
    description: {
      en: 'Missing lattice atom pulls surrounding neighbors inward, accelerating self-diffusion & high-temp creep.',
      id: 'Atom hilang menarik atom tetangga ke dalam, mempercepat difusi atom & rangkak (creep) suhu tinggi.',
      ja: '格子原子の欠落により周囲原子が内向き緩和し、拡散および高温クリープを支配します。',
    },
  },
  {
    id: 'substitutional',
    symbol: 'S+',
    name: {
      en: 'Substitutional Solute Strain (Hume-Rothery)',
      id: 'Atom Substitusi (Penguatan Larut)',
      ja: '置換型固溶原子（固溶強化）',
    },
    description: {
      en: 'Larger foreign solute atom induces compressive hydrostatic stress field that impedes dislocation glide.',
      id: 'Atom asing lebih besar menghasilkan medan tekan radial yang menghambat laju dislokasi (penguatan paduan).',
      ja: '異なる原子半径の溶質原子が局所圧縮応力場を生じ、転位運動を阻害して強度を高めます。',
    },
  },
  {
    id: 'interstitial-c',
    symbol: 'C_int',
    name: {
      en: 'Interstitial Carbon (Octahedral / Tetragonal)',
      id: 'Karbon Interstisial (Pengerasan Baja)',
      ja: '侵入型炭素原子（マルテンサイト歪み）',
    },
    description: {
      en: 'Small interstitial solute (C, N) expands the z/c-axis dipole strongly, causing rapid solid-solution strengthening.',
      id: 'Atom kecil C/N menyusup di celah oktahedral dan mendorong sumbu-c secara kuat — mekanisme pengerasan baja.',
      ja: '侵入型C原子がc軸方向に強い異方歪み（双極子歪み）を与え、鉄鋼の著しい硬化を引き起こします。',
    },
  },
  {
    id: 'dislocation',
    symbol: '⊥',
    name: {
      en: 'Edge Dislocation & Burgers Vector b',
      id: 'Dislokasi Tepi & Vektor Burgers b',
      ja: '刃状転位・バーガースベクトル b',
    },
    description: {
      en: 'Extra half-plane of atoms above slip plane produces compression above (⊥) and tension below — enabling ductile slip.',
      id: 'Setengah bidang atom ekstra menciptakan daerah tekan di atas inti (⊥) dan tarik di bawahnya saat deformasi plastis.',
      ja: 'すべり面上に余分な半原子面（⊥）が存在し、上側に圧縮・下側に引張応力場を形成して塑性変形を担います。',
    },
  },
];

export interface RealCrystalMaterialSpec {
  id: string;
  symbol: string;
  name: string;
  structureId: LatticeStructureId;
  aAngstrom: number;
  bOverA: number;
  cOverA: number;
  atomicRadiusAngstrom: number;
  /** Grams per mol of ONE formula unit or ONE atom corresponding to formulaUnitsPerCell */
  molarMassGPerMol: number;
  /** Effective atoms / formula units inside the conventional / full-prism cell */
  formulaUnitsPerCell: number;
  experimentalDensityGcm3: number;
  note: LocalizedText;
}

export const REAL_CRYSTAL_MATERIALS: RealCrystalMaterialSpec[] = [
  {
    id: 'cu',
    symbol: 'Cu',
    name: 'Copper (Cu · FCC)',
    structureId: 'fcc',
    aAngstrom: 3.615,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.278,
    molarMassGPerMol: 63.546,
    formulaUnitsPerCell: 4,
    experimentalDensityGcm3: 8.96,
    note: {
      en: 'High conductivity FCC metal with 12 {111}⟨110⟩ slip systems.',
      id: 'Logam konduktor tinggi FCC dengan 12 sistem selip rapat.',
      ja: '12個の{111}⟨110⟩最密すべり系を持つ高伝導性FCC金属です。',
    },
  },
  {
    id: 'al',
    symbol: 'Al',
    name: 'Aluminum (Al · FCC)',
    structureId: 'fcc',
    aAngstrom: 4.049,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.431,
    molarMassGPerMol: 26.982,
    formulaUnitsPerCell: 4,
    experimentalDensityGcm3: 2.7,
    note: {
      en: 'Lightweight structural aerospace FCC alloy base.',
      id: 'Basis paduan ringan struktural FCC.',
      ja: '航空・機械構造に用いられる軽量FCC金属です。',
    },
  },
  {
    id: 'alpha-fe',
    symbol: 'α-Fe',
    name: 'Ferrite (α-Fe · BCC)',
    structureId: 'bcc',
    aAngstrom: 2.866,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.241,
    molarMassGPerMol: 55.845,
    formulaUnitsPerCell: 2,
    experimentalDensityGcm3: 7.87,
    note: {
      en: 'Room-temp magnetic carbon steel ferrite; undergoes DBTT below freezing.',
      id: 'Ferit baja karbon magnetik pada suhu ruang; memiliki suhu transisi getas DBTT.',
      ja: '室温で安定な強磁性フェライト鉄（BCC）で、低温でDBTTを示します。',
    },
  },
  {
    id: 'gamma-fe',
    symbol: 'γ-Fe',
    name: 'Austenite (γ-Fe · FCC)',
    structureId: 'fcc',
    aAngstrom: 3.571,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.262,
    molarMassGPerMol: 55.845,
    formulaUnitsPerCell: 4,
    experimentalDensityGcm3: 8.15,
    note: {
      en: 'Non-magnetic high-temp steel phase & room-temp SS304/316 matrix.',
      id: 'Fase non-magnetik suhu tinggi & matriks baja tahan karat SS304/316.',
      ja: '非磁性高温鋼相およびSS304/316オーステナイト鋼の母相です。',
    },
  },
  {
    id: 'martensite',
    symbol: 'α′-Fe',
    name: 'Martensite (Fe-0.8C · BCT)',
    structureId: 'bct',
    aAngstrom: 2.852,
    bOverA: 1.0,
    cOverA: 1.045,
    atomicRadiusAngstrom: 1.241,
    molarMassGPerMol: 56.29,
    formulaUnitsPerCell: 2,
    experimentalDensityGcm3: 7.79,
    note: {
      en: 'Quenched supersaturated tool-steel phase; C atoms lock c/a elongation.',
      id: 'Fase baja quench dengan karbon terperangkap memanjangkan sumbu c.',
      ja: '焼入れで炭素を過飽和固溶した高硬度マルテンサイト（BCT）です。',
    },
  },
  {
    id: 'w',
    symbol: 'W',
    name: 'Tungsten (W · BCC)',
    structureId: 'bcc',
    aAngstrom: 3.165,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.37,
    molarMassGPerMol: 183.84,
    formulaUnitsPerCell: 2,
    experimentalDensityGcm3: 19.25,
    note: {
      en: 'Ultra-high melting refractory BCC metal (Tm = 3422 °C).',
      id: 'Logam refraktori tahan panas tertinggi (Tm = 3422 °C).',
      ja: '最高融点（3422°C）を持つ高比重耐火BCC金属です。',
    },
  },
  {
    id: 'ti',
    symbol: 'α-Ti',
    name: 'Titanium (α-Ti · HCP)',
    structureId: 'hcp',
    aAngstrom: 2.951,
    bOverA: 1.0,
    cOverA: 1.588,
    atomicRadiusAngstrom: 1.475,
    molarMassGPerMol: 47.867,
    formulaUnitsPerCell: 6,
    experimentalDensityGcm3: 4.51,
    note: {
      en: 'Sub-ideal c/a (1.588) facilitates prismatic + basal slip in aerospace Ti.',
      id: 'Rasio c/a 1,588 memudahkan selip prismatik & basal pada titanium.',
      ja: '理想比より小さいc/a=1.588により柱面すべりも活動します。',
    },
  },
  {
    id: 'si',
    symbol: 'Si',
    name: 'Silicon (Si · Diamond cF8)',
    structureId: 'diamond',
    aAngstrom: 5.431,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.176,
    molarMassGPerMol: 28.085,
    formulaUnitsPerCell: 8,
    experimentalDensityGcm3: 2.33,
    note: {
      en: 'Canonical semiconductor & XRD goniometer calibration standard (5.431 Å).',
      id: 'Standar semikonduktor & kalibrasi difraktometer XRD (a = 5,431 Å).',
      ja: '半導体およびX線回折(XRD)角度校正の標準結晶（a = 5.431 Å）です。',
    },
  },
  {
    id: 'tin',
    symbol: 'TiN',
    name: 'Titanium Nitride (TiN · B1)',
    structureId: 'nacl',
    aAngstrom: 4.242,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 2.121,
    molarMassGPerMol: 61.874,
    formulaUnitsPerCell: 4,
    experimentalDensityGcm3: 5.22,
    note: {
      en: 'Gold-colored PVD hard ceramic cutting-tool coating (B1 NaCl structure).',
      id: 'Lapisan keramik keras berwarna emas pada pahat potong PVD.',
      ja: '切削工具のPVD金色硬質皮膜として広く用いられるB1型セラミックです。',
    },
  },
  {
    id: 'niti',
    symbol: 'NiTi',
    name: 'Nitinol Austenite (NiTi · B2)',
    structureId: 'cscl',
    aAngstrom: 3.015,
    bOverA: 1.0,
    cOverA: 1.0,
    atomicRadiusAngstrom: 1.305,
    molarMassGPerMol: 106.56,
    formulaUnitsPerCell: 1,
    experimentalDensityGcm3: 6.45,
    note: {
      en: 'Ordered B2 parent phase of shape-memory & superelastic actuators.',
      id: 'Fase induk teratur B2 dari paduan memori bentuk Nitinol.',
      ja: '形状記憶・超弾性を示すNiTi合金の規則B2母相です。',
    },
  },
];

const AVOGADRO = 6.02214076e23;

export function computeUnitCellVolumeAng3(
  spec: CrystalLatticeSpec,
  aAngstrom: number,
  bOverA: number,
  cOverA: number,
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number
): number {
  const b = aAngstrom * bOverA;
  const c = aAngstrom * cOverA;

  if (spec.isFullHexPrism) {
    // Full 6-sided hexagonal prism of side length a = 3 primitive rhombi
    return (3 * Math.sqrt(3) * 0.5) * aAngstrom * aAngstrom * c;
  }

  const d2r = Math.PI / 180;
  const ca = Math.cos(alphaDeg * d2r);
  const cb = Math.cos(betaDeg * d2r);
  const cg = Math.cos(gammaDeg * d2r);
  const rad = Math.max(0.05, 1 - ca * ca - cb * cb - cg * cg + 2 * ca * cb * cg);
  return aAngstrom * b * c * Math.sqrt(rad);
}

export function computeTheoreticalDensity(
  spec: CrystalLatticeSpec,
  aAngstrom: number,
  bOverA: number,
  cOverA: number,
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number,
  molarMassGPerMol: number,
  formulaUnitsPerCell: number
): { volumeAng3: number; densityGcm3: number } {
  const volumeAng3 = computeUnitCellVolumeAng3(
    spec,
    aAngstrom,
    bOverA,
    cOverA,
    alphaDeg,
    betaDeg,
    gammaDeg
  );
  const volumeCm3 = volumeAng3 * 1e-24;
  const densityGcm3 = (formulaUnitsPerCell * molarMassGPerMol) / (volumeCm3 * AVOGADRO);
  return { volumeAng3, densityGcm3 };
}

export interface XrdPeak {
  h: number;
  k: number;
  l: number;
  label: string;
  dSpacingAng: number;
  twoThetaDeg: number;
  intensityPct: number;
  multiplicity: number;
}

export interface XrdPatternResult {
  peaks: XrdPeak[];
  forbiddenExamples: string[];
  selectionRuleSummary: LocalizedText;
  wavelengthAng: number;
}

function invertMetricTensor(
  a: number,
  b: number,
  c: number,
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number
): [number, number, number, number, number, number, number, number, number] {
  const d2r = Math.PI / 180;
  const ca = Math.cos(alphaDeg * d2r);
  const cb = Math.cos(betaDeg * d2r);
  const cg = Math.cos(gammaDeg * d2r);

  const g00 = a * a;
  const g11 = b * b;
  const g22 = c * c;
  const g01 = a * b * cg;
  const g02 = a * c * cb;
  const g12 = b * c * ca;

  const c00 = g11 * g22 - g12 * g12;
  const c01 = -(g01 * g22 - g12 * g02);
  const c02 = g01 * g12 - g11 * g02;
  const c11 = g00 * g22 - g02 * g02;
  const c12 = -(g00 * g12 - g01 * g02);
  const c22 = g00 * g11 - g01 * g01;

  const det = Math.max(1e-6, g00 * c00 + g01 * c01 + g02 * c02);
  return [
    c00 / det,
    c01 / det,
    c02 / det,
    c01 / det,
    c11 / det,
    c12 / det,
    c02 / det,
    c12 / det,
    c22 / det,
  ];
}

function getConventionalBasisForXrd(
  specId: LatticeStructureId
): { u: number; v: number; w: number; f: number }[] {
  switch (specId) {
    case 'bcc':
    case 'bct':
    case 'bco':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 0.5, v: 0.5, w: 0.5, f: 1 },
      ];
    case 'fcc':
    case 'fco':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 0.5, v: 0.5, w: 0, f: 1 },
        { u: 0.5, v: 0, w: 0.5, f: 1 },
        { u: 0, v: 0.5, w: 0.5, f: 1 },
      ];
    case 'baco':
    case 'bacm':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 0.5, v: 0.5, w: 0, f: 1 },
      ];
    case 'hcp':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 1 / 3, v: 2 / 3, w: 0.5, f: 1 },
      ];
    case 'diamond':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 0.5, v: 0.5, w: 0, f: 1 },
        { u: 0.5, v: 0, w: 0.5, f: 1 },
        { u: 0, v: 0.5, w: 0.5, f: 1 },
        { u: 0.25, v: 0.25, w: 0.25, f: 1 },
        { u: 0.75, v: 0.75, w: 0.25, f: 1 },
        { u: 0.75, v: 0.25, w: 0.75, f: 1 },
        { u: 0.25, v: 0.75, w: 0.75, f: 1 },
      ];
    case 'nacl':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 0.5, v: 0.5, w: 0, f: 1 },
        { u: 0.5, v: 0, w: 0.5, f: 1 },
        { u: 0, v: 0.5, w: 0.5, f: 1 },
        { u: 0.5, v: 0, w: 0, f: 0.55 },
        { u: 0, v: 0.5, w: 0, f: 0.55 },
        { u: 0, v: 0, w: 0.5, f: 0.55 },
        { u: 0.5, v: 0.5, w: 0.5, f: 0.55 },
      ];
    case 'cscl':
      return [
        { u: 0, v: 0, w: 0, f: 1 },
        { u: 0.5, v: 0.5, w: 0.5, f: 0.62 },
      ];
    default:
      return [{ u: 0, v: 0, w: 0, f: 1 }];
  }
}

export function computeXrdPeaks(
  spec: CrystalLatticeSpec,
  aAngstrom: number,
  bOverA: number,
  cOverA: number,
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number,
  source: 'Cu-Ka' | 'Mo-Ka'
): XrdPatternResult {
  const wavelengthAng = source === 'Cu-Ka' ? 1.5406 : 0.7107;
  const b = aAngstrom * bOverA;
  const c = aAngstrom * cOverA;

  // Use conventional 120° metric for HCP / Hex-P
  const effAlpha = spec.system === 'hexagonal' ? 90 : alphaDeg;
  const effBeta = spec.system === 'hexagonal' ? 90 : betaDeg;
  const effGamma = spec.system === 'hexagonal' ? 120 : gammaDeg;

  const gInv = invertMetricTensor(aAngstrom, b, c, effAlpha, effBeta, effGamma);
  const basis = getConventionalBasisForXrd(spec.id);

  interface RawBin {
    h: number;
    k: number;
    l: number;
    d: number;
    twoTheta: number;
    rawIntensity: number;
    count: number;
  }

  const bins: RawBin[] = [];
  const forbiddenSet = new Set<string>();

  const maxIdx = 3;
  for (let h = -maxIdx; h <= maxIdx; h++) {
    for (let k = -maxIdx; k <= maxIdx; k++) {
      for (let l = -maxIdx; l <= maxIdx; l++) {
        if (h === 0 && k === 0 && l === 0) continue;

        const invD2 =
          h * h * gInv[0] +
          k * k * gInv[4] +
          l * l * gInv[8] +
          2 * h * k * gInv[1] +
          2 * h * l * gInv[2] +
          2 * k * l * gInv[5];

        if (invD2 <= 1e-6) continue;
        const d = 1 / Math.sqrt(invD2);
        const sinTheta = wavelengthAng / (2 * d);
        if (sinTheta <= 0.08 || sinTheta >= 0.96) continue;

        const thetaRad = Math.asin(sinTheta);
        const twoTheta = (2 * thetaRad * 180) / Math.PI;
        if (twoTheta < 14 || twoTheta > 125) continue;

        // Structure factor F_hkl
        let re = 0;
        let im = 0;
        for (const site of basis) {
          const phase = 2 * Math.PI * (h * site.u + k * site.v + l * site.w);
          re += site.f * Math.cos(phase);
          im += site.f * Math.sin(phase);
        }
        const f2 = re * re + im * im;

        // Record representative extinct low-index positive planes
        if (f2 < 1e-4) {
          if (h >= 0 && k >= 0 && l >= 0 && h >= k && h + k + l <= 5) {
            forbiddenSet.add(`(${h}${k}${l})`);
          }
          continue;
        }

        // Lorentz-polarization + thermal Debye-Waller attenuation
        const cosTh = Math.cos(thetaRad);
        const cos2Th = Math.cos(2 * thetaRad);
        const lp = (1 + cos2Th * cos2Th) / (sinTheta * sinTheta * cosTh);
        const dw = Math.exp(-1.15 * sinTheta * sinTheta);
        const contrib = f2 * lp * dw;

        const allNonNeg = h >= 0 && k >= 0 && l >= 0;
        const existing = bins.find((bin) => Math.abs(bin.twoTheta - twoTheta) < 0.25);
        if (existing) {
          existing.rawIntensity += contrib;
          existing.count += 1;
          const existingNonNeg = existing.h >= 0 && existing.k >= 0 && existing.l >= 0;
          if (allNonNeg && (!existingNonNeg || h >= existing.h)) {
            existing.h = h;
            existing.k = k;
            existing.l = l;
          }
        } else {
          bins.push({
            h,
            k,
            l,
            d,
            twoTheta,
            rawIntensity: contrib,
            count: 1,
          });
        }
      }
    }
  }

  bins.sort((a, b) => a.twoTheta - b.twoTheta);
  const topBins = bins.slice(0, 14);
  const maxRaw = Math.max(1e-6, ...topBins.map((p) => p.rawIntensity));

  const peaks: XrdPeak[] = topBins.map((p) => {
    const label =
      spec.system === 'hexagonal'
        ? `(${p.h}${p.k}${-(p.h + p.k)}${p.l})`
        : `(${p.h}${p.k}${p.l})`;
    return {
      h: p.h,
      k: p.k,
      l: p.l,
      label,
      dSpacingAng: p.d,
      twoThetaDeg: p.twoTheta,
      intensityPct: Math.max(4, Math.round((p.rawIntensity / maxRaw) * 100)),
      multiplicity: p.count,
    };
  });

  let selectionRuleSummary: LocalizedText = {
    en: 'Primitive (P) lattice: all (hkl) planes satisfy F_hkl ≠ 0 (no systematic absences).',
    id: 'Kisi Primitif (P): semua bidang (hkl) menghasilkan puncak XRD tanpa pemadaman.',
    ja: '単純格子(P)：すべての (hkl) 反射が許容（系統的消滅則なし）。',
  };

  if (spec.id === 'bcc' || spec.id === 'bct' || spec.id === 'bco') {
    selectionRuleSummary = {
      en: 'Body-Centered (I) Extinction Rule: Allowed only when h + k + l = even; odd sums vanish cleanly.',
      id: 'Aturan Pemadaman I (BCC/BCT): Muncul hanya jika h + k + l = genap; jumlah ganjil hilang.',
      ja: '体心(I)消滅則：h + k + l = 偶数 の反射のみ出現（奇数和は消滅）。',
    };
  } else if (spec.id === 'fcc' || spec.id === 'fco') {
    selectionRuleSummary = {
      en: 'Face-Centered (F) Extinction Rule: h, k, l must be UNMIXED (all even or all odd).',
      id: 'Aturan Pemadaman F (FCC): h, k, l harus seragam (semua genap atau semua ganjil).',
      ja: '面心(F)消滅則：h, k, l がすべて偶数またはすべて奇数のときのみ出現。',
    };
  } else if (spec.id === 'diamond') {
    selectionRuleSummary = {
      en: 'Diamond Cubic: Unmixed parity AND if all even, h + k + l = 4n (so (200) is extinct!).',
      id: 'Kubik Intan: Paritas seragam DAN jika genap, h + k + l = 4n (bidang (200) padam total).',
      ja: 'ダイヤモンド格子：同偶奇かつ全偶数なら h + k + l = 4n（(200)が完全消滅）。',
    };
  } else if (spec.id === 'hcp') {
    selectionRuleSummary = {
      en: 'HCP Extinction Rule: Forbidden when h + 2k = 3n with l odd (characteristic basal & pyramidal reflections).',
      id: 'Aturan Pemadaman HCP: Padam bila h + 2k = 3n dengan l ganjil.',
      ja: 'HCP消滅則：h + 2k = 3n かつ l が奇数の反射が消滅。',
    };
  } else if (spec.id === 'nacl') {
    selectionRuleSummary = {
      en: 'Rock Salt (B1): Unmixed (hkl); all-odd reflections weaker due to (f_A − f_B)² destructive contrast.',
      id: 'Garam Batu (B1): Paritas seragam; indeks ganjil lebih lemah karena selisih faktor hamburan (f_A − f_B)².',
      ja: '岩塩型(B1)：同偶奇のみ許容、全奇数は構造因子 (f_A − f_B)² により弱反射。',
    };
  } else if (spec.id === 'cscl') {
    selectionRuleSummary = {
      en: 'Ordered B2 (CsCl): Superlattice odd-(h+k+l) peaks visible due to (f_A − f_B)² chemical ordering!',
      id: 'Intermetalik Teratur B2: Puncak superkisi h+k+l ganjil muncul akibat keteraturan kimia AB!',
      ja: '規則B2構造：原子配列の規則性により h+k+l 奇数の超格子反射線が出現。',
    };
  }

  return {
    peaks,
    forbiddenExamples: Array.from(forbiddenSet).slice(0, 6),
    selectionRuleSummary,
    wavelengthAng,
  };
}

export interface CrystallographicMetricsResult {
  iIndex: number;
  dSpacingAng: number;
  isDirectionInPlane: boolean;
  schmidFactor: number;
  planarAtomsCount: number;
  planarAreaNm2: number;
  planarDensityNm2: number;
  projected2DAtoms: { x: number; y: number; role: AtomSiteRole }[];
}

export function computeCrystallographicMetrics(
  spec: CrystalLatticeSpec,
  h: number,
  k: number,
  l: number,
  u: number,
  v: number,
  w: number,
  aAngstrom: number,
  bOverA: number,
  cOverA: number,
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number
): CrystallographicMetricsResult {
  const iIndex = -(h + k);
  const b = aAngstrom * bOverA;
  const c = aAngstrom * cOverA;

  const effAlpha = spec.system === 'hexagonal' ? 90 : alphaDeg;
  const effBeta = spec.system === 'hexagonal' ? 90 : betaDeg;
  const effGamma = spec.system === 'hexagonal' ? 120 : gammaDeg;

  // Build exact 3D direct lattice basis vectors (va, vb, vc) in Angstroms
  const d2r = Math.PI / 180;
  const ca = Math.cos(effAlpha * d2r);
  const cb = Math.cos(effBeta * d2r);
  const cg = Math.cos(effGamma * d2r);
  const sg = Math.max(0.15, Math.sin(effGamma * d2r));

  const va: [number, number, number] = [aAngstrom, 0, 0];
  const vb: [number, number, number] = [b * cg, b * sg, 0];
  const cx = c * cb;
  const cy = (c * (ca - cb * cg)) / sg;
  const cz = Math.sqrt(Math.max(0.05, c * c - cx * cx - cy * cy));
  const vc: [number, number, number] = [cx, cy, cz];

  const cross = (
    p: [number, number, number],
    q: [number, number, number]
  ): [number, number, number] => [
    p[1] * q[2] - p[2] * q[1],
    p[2] * q[0] - p[0] * q[2],
    p[0] * q[1] - p[1] * q[0],
  ];

  // Exact primitive/conventional cell volume V = va · (vb x vc)
  const vbXvc = cross(vb, vc);
  const volConv = Math.max(
    1e-6,
    va[0] * vbXvc[0] + va[1] * vbXvc[1] + va[2] * vbXvc[2]
  );

  // Reciprocal basis vectors b1, b2, b3 (without 2pi) so n_hkl = h*b1 + k*b2 + l*b3 is exact in ALL 7 crystal systems
  const vcXva = cross(vc, va);
  const vaXvb = cross(va, vb);
  const b1: [number, number, number] = [vbXvc[0] / volConv, vbXvc[1] / volConv, vbXvc[2] / volConv];
  const b2: [number, number, number] = [vcXva[0] / volConv, vcXva[1] / volConv, vcXva[2] / volConv];
  const b3: [number, number, number] = [vaXvb[0] / volConv, vaXvb[1] / volConv, vaXvb[2] / volConv];

  const nx = h * b1[0] + k * b2[0] + l * b3[0];
  const ny = h * b1[1] + k * b2[1] + l * b3[1];
  const nz = h * b1[2] + k * b2[2] + l * b3[2];
  const nMag = Math.hypot(nx, ny, nz);

  // Exact d_hkl = 1 / |h*b1 + k*b2 + l*b3|
  const dSpacingAng = nMag > 1e-8 ? 1 / nMag : 0;
  const isDirectionInPlane = h * u + k * v + l * w === 0;

  // Exact 3D slip direction d_uvw = u*va + v*vb + w*vc
  const dx = u * va[0] + v * vb[0] + w * vc[0];
  const dy = u * va[1] + v * vb[1] + w * vc[1];
  const dz = u * va[2] + v * vb[2] + w * vc[2];
  const dMag = Math.hypot(dx, dy, dz) || 1;

  // Reference single-slip tensile axis T = 1*va + 2*vb + 3*vc
  const tx = va[0] + 2 * vb[0] + 3 * vc[0];
  const ty = va[1] + 2 * vb[1] + 3 * vc[1];
  const tz = va[2] + 2 * vb[2] + 3 * vc[2];
  const tMag = Math.hypot(tx, ty, tz) || 1;

  const cosPhi = nMag > 1e-8 ? Math.abs((nx * tx + ny * ty + nz * tz) / (nMag * tMag)) : 0;
  const cosLambda = Math.abs((dx * tx + dy * ty + dz * tz) / (dMag * tMag));
  const schmidFactor =
    (h !== 0 || k !== 0 || l !== 0) && (u !== 0 || v !== 0 || w !== 0)
      ? Math.min(0.5, cosPhi * cosLambda)
      : 0;

  // Exact Planar Atomic Density (atoms / nm^2) via distinct (h*u + k*v + l*w) mod 1 layer count
  const basis = getConventionalBasisForXrd(spec.id);
  const gcd2 = (x: number, y: number): number => (y === 0 ? x : gcd2(y, x % y));
  const gcdHkl = Math.max(1, gcd2(gcd2(Math.abs(h), Math.abs(k)), Math.abs(l)));
  const rh = h / gcdHkl;
  const rk = k / gcdHkl;
  const rl = l / gcdHkl;

  const layerPhases: number[] = [];
  for (const site of basis) {
    const rawPhase = (((rh * site.u + rk * site.v + rl * site.w) % 1) + 1) % 1;
    const wrapped = Math.abs(rawPhase - 1) < 1e-3 ? 0 : rawPhase;
    if (!layerPhases.some((p) => Math.abs(p - wrapped) < 1e-3)) {
      layerPhases.push(wrapped);
    }
  }
  const mLayers = Math.max(1, layerPhases.length);
  const dPrimitivePlane = dSpacingAng * gcdHkl;
  const planarAreaAng2 = dPrimitivePlane > 0.05 ? volConv / dPrimitivePlane : aAngstrom * b;
  const planarAreaNm2 = Math.max(0.01, planarAreaAng2 / 100);
  const nBasisConv = basis.length;
  // Exact textbook PD = (n_conv * d_{hkl,prim}) / (m_layers * V_conv) in atoms/nm^2
  const planarDensityNm2 =
    dPrimitivePlane > 0.05
      ? ((nBasisConv * dPrimitivePlane) / (mLayers * volConv)) * 100
      : nBasisConv / planarAreaNm2;

  // Sample atoms sitting on the active plane inside [0,1]^3 for 2D Atom Slice Inset
  const sampleAtoms: { u: number; v: number; w: number; role: AtomSiteRole }[] = [];
  if (spec.isFullHexPrism) {
    for (const a of spec.atoms) {
      sampleAtoms.push({ u: a.u * 0.5 + 0.5, v: a.v * 0.5 + 0.5, w: a.w + 0.5, role: a.role });
    }
  } else {
    for (const a of spec.atoms) {
      sampleAtoms.push({ u: a.u, v: a.v, w: a.w, role: a.role });
    }
  }

  let d0 = h + k + l > 0 ? 1 : h + k + l < 0 ? -1 : 0;
  if (spec.isFullHexPrism && l !== 0 && h === 0 && k === 0) {
    d0 = 0;
  } else if (Math.abs(h) + Math.abs(k) + Math.abs(l) > 0) {
    const cands = [0, 1, Math.max(0, h) + Math.max(0, k) + Math.max(0, l), 0.5];
    let bestCount = -1;
    for (const cand of cands) {
      let cnt = 0;
      for (const a of sampleAtoms) {
        if (Math.abs(h * a.u + k * a.v + l * a.w - cand) < 0.06) cnt++;
      }
      if (cnt > bestCount) {
        bestCount = cnt;
        d0 = cand;
      }
    }
  }

  // Build local orthonormal 2D basis (e1, e2) in the exact Cartesian plane normal to n_hkl
  const nSafe = nMag > 1e-8 ? nMag : 1;
  const nn: [number, number, number] = [nx / nSafe, ny / nSafe, nz / nSafe];
  const ref: [number, number, number] = Math.abs(nn[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1Raw = cross(ref, nn);
  const e1Len = Math.hypot(e1Raw[0], e1Raw[1], e1Raw[2]) || 1;
  const e1: [number, number, number] = [e1Raw[0] / e1Len, e1Raw[1] / e1Len, e1Raw[2] / e1Len];
  const e2 = cross(nn, e1);

  const projected2DAtoms: { x: number; y: number; role: AtomSiteRole }[] = [];
  for (const a of sampleAtoms) {
    if (Math.abs(h * a.u + k * a.v + l * a.w - d0) < 0.06) {
      const rx = (a.u - 0.5) * va[0] + (a.v - 0.5) * vb[0] + (a.w - 0.5) * vc[0];
      const ry = (a.u - 0.5) * va[1] + (a.v - 0.5) * vb[1] + (a.w - 0.5) * vc[1];
      const rz = (a.u - 0.5) * va[2] + (a.v - 0.5) * vb[2] + (a.w - 0.5) * vc[2];
      projected2DAtoms.push({
        x: (rx * e1[0] + ry * e1[1] + rz * e1[2]) / aAngstrom,
        y: (rx * e2[0] + ry * e2[1] + rz * e2[2]) / aAngstrom,
        role: a.role,
      });
    }
  }

  const planarAtomsCount = Math.max(1, projected2DAtoms.length);

  return {
    iIndex,
    dSpacingAng,
    isDirectionInPlane,
    schmidFactor,
    planarAtomsCount,
    planarAreaNm2,
    planarDensityNm2,
    projected2DAtoms,
  };
}

