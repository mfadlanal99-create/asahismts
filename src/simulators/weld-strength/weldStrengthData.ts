import {
  axialStress,
  beamBendingStress,
  filletWeldThroat,
  m2ToMm2,
  mmToM,
  mToMm,
  paToMpa,
  rectangularSectionProps,
  weldEffectiveArea,
  weldVectorResultantShear,
} from '../../physics';

export type JointMode = 'lap-tee' | 'eccentric-bracket' | 'butt-joint';

export type WeldOrientation = 'transverse' | 'parallel';
export type FilletArrangement = 'single' | 'double';
export type BracketWeldPattern = 'two-horizontal' | 'two-vertical' | 'channel-c';
export type PenetrationType = 'cjp' | 'pjp';
export type GrooveType = 'square' | 'single-v' | 'double-v' | 'single-u';

export type WeldSafetyStatus = 'PASS' | 'MARGINAL' | 'FAIL';

export interface ElectrodeGrade {
  id: string;
  name: string;
  process: string;
  tensileStrengthMpa: number; // UTS (F_EXX)
  yieldStrengthMpa: number; // F_y
  allowableShearMpa: number; // 0.30 * UTS
  allowableTensileMpa: number; // 0.60 * F_y
  descriptionEn: string;
  descriptionId: string;
  descriptionJa: string;
}

export const ELECTRODE_GRADES: ElectrodeGrade[] = [
  {
    id: 'e6013',
    name: 'AWS E6010 / E6013',
    process: 'SMAW (Stick)',
    tensileStrengthMpa: 414,
    yieldStrengthMpa: 330,
    allowableShearMpa: 124.2,
    allowableTensileMpa: 198.0,
    descriptionEn: 'Cellulosic / rutile general structural carbon steel electrode (60 ksi tensile).',
    descriptionId: 'Elektroda rutil baja karbon struktural umum (kekuatan tarik 60 ksi).',
    descriptionJa: '一般的な構造用炭素鋼被覆アーク溶接棒（引張強さ60 ksi）。',
  },
  {
    id: 'e7018',
    name: 'AWS E7018 (Low-H)',
    process: 'SMAW (Stick)',
    tensileStrengthMpa: 483,
    yieldStrengthMpa: 400,
    allowableShearMpa: 144.9,
    allowableTensileMpa: 240.0,
    descriptionEn: 'Industry-standard low-hydrogen iron powder electrode for heavy structural joints (70 ksi).',
    descriptionId: 'Standar industri elektroda rendah hidrogen untuk sambungan struktural berat (70 ksi).',
    descriptionJa: '重構造用溶接の業界標準低水素系鉄粉溶接棒（引張強さ70 ksi）。',
  },
  {
    id: 'e8018',
    name: 'AWS E8018-B2',
    process: 'SMAW (Stick)',
    tensileStrengthMpa: 552,
    yieldStrengthMpa: 462,
    allowableShearMpa: 165.6,
    allowableTensileMpa: 277.2,
    descriptionEn: 'High-strength low-alloy (HSLA) & Cr-Mo pressure piping / heavy machinery grade (80 ksi).',
    descriptionId: 'Baja paduan rendah berkekuatan tinggi (HSLA) & pipa bertekanan Cr-Mo (80 ksi).',
    descriptionJa: '高張力低合金鋼およびCr-Mo圧力配管・重機械用溶接棒（引張強さ80 ksi）。',
  },
  {
    id: 'er70s6',
    name: 'AWS ER70S-6',
    process: 'GMAW / MIG',
    tensileStrengthMpa: 483,
    yieldStrengthMpa: 420,
    allowableShearMpa: 144.9,
    allowableTensileMpa: 252.0,
    descriptionEn: 'High-deoxidizer solid wire for automated GMAW/MIG fabrication of mild & alloy steels.',
    descriptionId: 'Kawat solid deoksidasi tinggi untuk pengelasan otomatis GMAW/MIG baja lunak.',
    descriptionJa: '高脱酸剤配合の軟鋼・低合金鋼用GMAW/MIGソリッドワイヤ。',
  },
  {
    id: 'er308l',
    name: 'AWS ER308L Stainless',
    process: 'GMAW / GTAW',
    tensileStrengthMpa: 550,
    yieldStrengthMpa: 380,
    allowableShearMpa: 165.0,
    allowableTensileMpa: 228.0,
    descriptionEn: 'Extra-low carbon 19Cr-9Ni austenitic stainless steel for AISI 304/304L corrosion resistance.',
    descriptionId: 'Baja tahan karat austenitik 19Cr-9Ni karbon ekstra rendah untuk AISI 304/304L.',
    descriptionJa: 'SUS304/304L溶接用の極低炭素19Cr-9Niオーステナイト系ステンレス溶接棒。',
  },
  {
    id: 'er4043',
    name: 'AWS ER4043 Aluminum',
    process: 'GMAW / GTAW',
    tensileStrengthMpa: 200,
    yieldStrengthMpa: 105,
    allowableShearMpa: 60.0,
    allowableTensileMpa: 63.0,
    descriptionEn: '5% Silicon aluminum alloy filler for 6061-T6 fabricated assemblies with low crack sensitivity.',
    descriptionId: 'Pengisi paduan aluminium silikon 5% untuk rakitan 6061-T6 tahan retak.',
    descriptionJa: '耐割れ性に優れるアルミ合金6061用Al-5%Si溶接ワイヤ。',
  },
];

export interface JointPreset {
  id: string;
  nameEn: string;
  nameId: string;
  nameJa: string;
  mode: JointMode;
  electrodeId: string;
  legSizeMm: number;
  weldLengthMm: number;
  plateThicknessMm: number;
  plateWidthMm: number;
  bracketWidthMm: number;
  bracketHeightMm: number;
  eccentricityMm: number;
  loadKn: number;
  bendingMomentKnm: number;
  filletArrangement: FilletArrangement;
  weldOrientation: WeldOrientation;
  bracketPattern: BracketWeldPattern;
  penetrationType: PenetrationType;
  grooveType: GrooveType;
}

export const JOINT_PRESETS: JointPreset[] = [
  {
    id: 'preset-lap-transverse',
    nameEn: 'Double Fillet Lap Joint (Transverse)',
    nameId: 'Sambungan Tumpang Fillet Ganda (Transversal)',
    nameJa: '両面重ねすみ肉溶接（前面横方向荷重）',
    mode: 'lap-tee',
    electrodeId: 'e7018',
    legSizeMm: 8,
    weldLengthMm: 120,
    plateThicknessMm: 12,
    plateWidthMm: 120,
    bracketWidthMm: 100,
    bracketHeightMm: 150,
    eccentricityMm: 150,
    loadKn: 85,
    bendingMomentKnm: 0,
    filletArrangement: 'double',
    weldOrientation: 'transverse',
    bracketPattern: 'two-horizontal',
    penetrationType: 'cjp',
    grooveType: 'single-v',
  },
  {
    id: 'preset-cantilever-bracket',
    nameEn: 'Cantilever Crane Bracket (Eccentric Shear)',
    nameId: 'Braket Derek Kantilever (Geser Eksentrik)',
    nameJa: 'クレーン用片持ちブラケット（偏心ねじりせん断）',
    mode: 'eccentric-bracket',
    electrodeId: 'e7018',
    legSizeMm: 10,
    weldLengthMm: 150,
    plateThicknessMm: 16,
    plateWidthMm: 150,
    bracketWidthMm: 120,
    bracketHeightMm: 200,
    eccentricityMm: 180,
    loadKn: 65,
    bendingMomentKnm: 0,
    filletArrangement: 'double',
    weldOrientation: 'parallel',
    bracketPattern: 'channel-c',
    penetrationType: 'cjp',
    grooveType: 'single-v',
  },
  {
    id: 'preset-butt-v-groove',
    nameEn: 'Heavy Girder Butt Splice (CJP V-Groove)',
    nameId: 'Sambungan Tumpul Balok Girder (CJP Kampuh-V)',
    nameJa: '主桁突合せ完全溶込み継手（V形開先）',
    mode: 'butt-joint',
    electrodeId: 'e8018',
    legSizeMm: 12,
    weldLengthMm: 200,
    plateThicknessMm: 20,
    plateWidthMm: 180,
    bracketWidthMm: 120,
    bracketHeightMm: 180,
    eccentricityMm: 100,
    loadKn: 420,
    bendingMomentKnm: 15,
    filletArrangement: 'double',
    weldOrientation: 'transverse',
    bracketPattern: 'two-vertical',
    penetrationType: 'cjp',
    grooveType: 'single-v',
  },
  {
    id: 'preset-tee-stiffener',
    nameEn: 'T-Joint Web Stiffener (Parallel Shear)',
    nameId: 'Pengaku Badan Sambungan-T (Geser Paralel)',
    nameJa: 'T形継手ウェブ補強リブ（平行縦方向せん断）',
    mode: 'lap-tee',
    electrodeId: 'er70s6',
    legSizeMm: 6,
    weldLengthMm: 160,
    plateThicknessMm: 10,
    plateWidthMm: 100,
    bracketWidthMm: 100,
    bracketHeightMm: 160,
    eccentricityMm: 120,
    loadKn: 95,
    bendingMomentKnm: 0,
    filletArrangement: 'double',
    weldOrientation: 'parallel',
    bracketPattern: 'two-vertical',
    penetrationType: 'cjp',
    grooveType: 'square',
  },
  {
    id: 'preset-aluminum-tank',
    nameEn: 'Aluminum Pressure Bracket (ER4043)',
    nameId: 'Braket Tangki Aluminium (ER4043)',
    nameJa: 'アルミ製圧力タンクブラケット（ER4043）',
    mode: 'eccentric-bracket',
    electrodeId: 'er4043',
    legSizeMm: 8,
    weldLengthMm: 100,
    plateThicknessMm: 10,
    plateWidthMm: 100,
    bracketWidthMm: 80,
    bracketHeightMm: 140,
    eccentricityMm: 100,
    loadKn: 20,
    bendingMomentKnm: 0,
    filletArrangement: 'double',
    weldOrientation: 'transverse',
    bracketPattern: 'two-vertical',
    penetrationType: 'pjp',
    grooveType: 'single-v',
  },
];

export interface WeldCalculationResults {
  throatMm: number; // a = 0.7071 * s (fillet) or t (butt)
  effectiveLengthMm: number;
  effectiveAreaAwMm2: number;
  primaryDirectShearMpa: number; // tau' or sigma_axial
  secondaryMomentStressMpa: number; // tau'' or sigma_bending
  peakCombinedStressMpa: number; // tau_max or sigma_vonmises
  allowableStressMpa: number;
  safetyFactor: number;
  status: WeldSafetyStatus;
  stressUtilizationPct: number; // (peak / allowable) * 100
  centroidXmm: number;
  centroidYmm: number;
  polarMomentJwMm4: number; // J = a * J_u
  bendingMomentNm: number;
}

export interface WeldSimulatorInputs {
  mode: JointMode;
  electrode: ElectrodeGrade;
  legSizeMm: number;
  weldLengthMm: number;
  plateThicknessMm: number;
  plateWidthMm: number;
  bracketWidthMm: number; // b
  bracketHeightMm: number; // d
  eccentricityMm: number; // e
  loadKn: number;
  bendingMomentKnm: number;
  filletArrangement: FilletArrangement;
  weldOrientation: WeldOrientation;
  bracketPattern: BracketWeldPattern;
  penetrationType: PenetrationType;
  grooveType: GrooveType;
}

export function calculateWeldStrength(inputs: WeldSimulatorInputs): WeldCalculationResults {
  const {
    mode,
    electrode,
    legSizeMm,
    weldLengthMm,
    plateThicknessMm,
    plateWidthMm,
    bracketWidthMm,
    bracketHeightMm,
    eccentricityMm,
    loadKn,
    bendingMomentKnm,
    filletArrangement,
    weldOrientation,
    bracketPattern,
    penetrationType,
  } = inputs;

  const loadN = Math.max(0, loadKn * 1000);

  if (mode === 'lap-tee') {
    // Mode 1: Lap / T-Joint Fillet Weld via unified SI physics engine
    const throatM = filletWeldThroat(mmToM(legSizeMm));
    const a = mToMm(throatM);
    const numWelds = filletArrangement === 'double' ? 2 : 1;
    const effLen = weldLengthMm * numWelds;
    const awM2 = weldEffectiveArea(throatM, mmToM(effLen));
    const aw = m2ToMm2(awM2);

    // Direct shear stress on the effective throat
    const baseShear = awM2 > 0 ? paToMpa(axialStress(loadN, awM2)) : 0;

    // In transverse loading, AWS D1.1 acknowledges the throat orientation provides 1.5x capacity,
    // or conversely nominal stress is resolved. For standard conservative design:
    const primaryShear = baseShear;
    const secondaryStress = 0;
    const peakStress = baseShear;

    // Allowable stress for fillet shear: 0.30 * UTS
    // AWS D1.1 formula: F_v = 0.30 * F_EXX * (1.0 + 0.50 * sin^1.5(theta))
    const thetaFactor = weldOrientation === 'transverse' ? 1.5 : 1.0;
    const allowable = electrode.allowableShearMpa * thetaFactor;
    const sf = peakStress > 0 ? allowable / peakStress : 99.9;

    const utilization = allowable > 0 ? (peakStress / allowable) * 100 : 0;
    const status: WeldSafetyStatus =
      sf >= 1.25 ? 'PASS' : sf >= 1.0 ? 'MARGINAL' : 'FAIL';

    return {
      throatMm: a,
      effectiveLengthMm: effLen,
      effectiveAreaAwMm2: aw,
      primaryDirectShearMpa: primaryShear,
      secondaryMomentStressMpa: secondaryStress,
      peakCombinedStressMpa: peakStress,
      allowableStressMpa: allowable,
      safetyFactor: Math.min(sf, 99.9),
      status,
      stressUtilizationPct: utilization,
      centroidXmm: 0,
      centroidYmm: 0,
      polarMomentJwMm4: 0,
      bendingMomentNm: 0,
    };
  }

  if (mode === 'eccentric-bracket') {
    // Mode 2: Eccentric Cantilever Bracket Weld Group
    // Classic Shigley / Blodgett method using unit polar moment of inertia
    const throatM = filletWeldThroat(mmToM(legSizeMm));
    const a = mToMm(throatM);
    const b = bracketWidthMm;
    const d = bracketHeightMm;
    const e = eccentricityMm;
    const momentNmm = loadN * e;

    let Au = 0; // unit area (mm)
    let Ju = 0; // unit polar moment of inertia (mm^3)
    let cx = 0; // centroid X from left edge of bracket
    let cy = 0; // centroid Y from bottom edge of bracket
    let maxRx = 0; // max horizontal distance from centroid to critical weld point
    let maxRy = 0; // max vertical distance from centroid to critical weld point

    if (bracketPattern === 'two-vertical') {
      // Two vertical welds of height d separated horizontally by width b
      Au = 2 * d;
      cx = b / 2;
      cy = d / 2;
      // Ju = 2 * [ d^3 / 12 + d * (b/2)^2 ] = d^3 / 6 + (d * b^2) / 2
      Ju = (Math.pow(d, 3) / 6) + (d * Math.pow(b, 2)) / 2;
      maxRx = b / 2;
      maxRy = d / 2;
    } else if (bracketPattern === 'two-horizontal') {
      // Two horizontal welds of length b separated vertically by height d
      Au = 2 * b;
      cx = b / 2;
      cy = d / 2;
      // Ju = 2 * [ b^3 / 12 + b * (d/2)^2 ] = b^3 / 6 + (b * d^2) / 2
      Ju = (Math.pow(b, 3) / 6) + (b * Math.pow(d, 2)) / 2;
      maxRx = b / 2;
      maxRy = d / 2;
    } else {
      // Channel C-weld: Top flange b, bottom flange b, vertical web d
      Au = 2 * b + d;
      cx = (b * b) / (2 * b + d);
      cy = d / 2;
      // Standard Shigley formula for C-shape unit polar moment
      const Iux = (Math.pow(d, 3) / 12) + 2 * b * Math.pow(d / 2, 2);
      const Iuy = (2 * Math.pow(b, 3) / 3) - Au * Math.pow(cx, 2);
      Ju = Math.max(Iux + Iuy, 100);
      maxRx = Math.max(b - cx, cx);
      maxRy = d / 2;
    }

    const awM2 = weldEffectiveArea(throatM, mmToM(Au));
    const Aw = m2ToMm2(awM2);
    const Jw = a * Ju;

    // Primary direct shear tau' (downward along load line)
    const tauPrime = awM2 > 0 ? paToMpa(axialStress(loadN, awM2)) : 0;

    // Secondary torsional shear tau'' at outermost critical fiber
    // tau''_x = (M * maxRy) / Jw (horizontal)
    // tau''_y = (M * maxRx) / Jw (downward, additive to tau')
    const tauDoubleX = Jw > 0 ? (momentNmm * maxRy) / Jw : 0;
    const tauDoubleY = Jw > 0 ? (momentNmm * maxRx) / Jw : 0;
    const tauDouble = weldVectorResultantShear(tauDoubleX, tauDoubleY);

    // Vector sum resultant maximum shear stress via mechanics physics engine:
    // tau_res = sqrt( (tau''_x)^2 + (tau' + tau''_y)^2 )
    const tauRes = weldVectorResultantShear(tauDoubleX, tauPrime + tauDoubleY);

    const allowable = electrode.allowableShearMpa;
    const sf = tauRes > 0 ? allowable / tauRes : 99.9;
    const utilization = allowable > 0 ? (tauRes / allowable) * 100 : 0;
    const status: WeldSafetyStatus =
      sf >= 1.25 ? 'PASS' : sf >= 1.0 ? 'MARGINAL' : 'FAIL';

    return {
      throatMm: a,
      effectiveLengthMm: Au,
      effectiveAreaAwMm2: Aw,
      primaryDirectShearMpa: tauPrime,
      secondaryMomentStressMpa: tauDouble,
      peakCombinedStressMpa: tauRes,
      allowableStressMpa: allowable,
      safetyFactor: Math.min(sf, 99.9),
      status,
      stressUtilizationPct: utilization,
      centroidXmm: cx,
      centroidYmm: cy,
      polarMomentJwMm4: Jw,
      bendingMomentNm: momentNmm / 1000,
    };
  }

  // Mode 3: Butt Weld (Groove Weld)
  // Complete Joint Penetration (throat a = t) or Partial Joint Penetration (throat a = 0.75 * t)
  const a = penetrationType === 'cjp' ? plateThicknessMm : plateThicknessMm * 0.75;
  const w = plateWidthMm;
  const throatM = mmToM(a);
  const widthM = mmToM(w);
  const awM2 = weldEffectiveArea(throatM, widthM);
  const Aw = m2ToMm2(awM2);

  // Direct axial stress: sigma_axial = F / A_w
  const sigmaAxial = awM2 > 0 ? paToMpa(axialStress(loadN, awM2)) : 0;

  // In-plane bending stress: sigma_bending = M * y / I_z
  const momentNm = bendingMomentKnm * 1000;
  const section = rectangularSectionProps(throatM, widthM);
  const sigmaBending =
    section.momentOfInertia > 0
      ? paToMpa(beamBendingStress(momentNm, widthM / 2, section.momentOfInertia))
      : 0;

  const peakStress = sigmaAxial + sigmaBending;

  // Allowable tensile stress for full penetration butt weld is 0.60 * F_y
  const allowable =
    penetrationType === 'cjp'
      ? electrode.allowableTensileMpa
      : electrode.allowableTensileMpa * 0.8;

  const sf = peakStress > 0 ? allowable / peakStress : 99.9;
  const utilization = allowable > 0 ? (peakStress / allowable) * 100 : 0;
  const status: WeldSafetyStatus =
    sf >= 1.25 ? 'PASS' : sf >= 1.0 ? 'MARGINAL' : 'FAIL';

  return {
    throatMm: a,
    effectiveLengthMm: w,
    effectiveAreaAwMm2: Aw,
    primaryDirectShearMpa: sigmaAxial,
    secondaryMomentStressMpa: sigmaBending,
    peakCombinedStressMpa: peakStress,
    allowableStressMpa: allowable,
    safetyFactor: Math.min(sf, 99.9),
    status,
    stressUtilizationPct: utilization,
    centroidXmm: w / 2,
    centroidYmm: plateThicknessMm / 2,
    polarMomentJwMm4: 0,
    bendingMomentNm: bendingMomentKnm * 1000,
  };
}

export function exportWeldDataToCsv(
  inputs: WeldSimulatorInputs,
  results: WeldCalculationResults
): void {
  const rows = [
    ['Parameter', 'Value', 'Unit'],
    ['Joint Mode', inputs.mode, ''],
    ['Electrode Grade', inputs.electrode.name, ''],
    ['Electrode UTS', inputs.electrode.tensileStrengthMpa.toString(), 'MPa'],
    ['Electrode Yield', inputs.electrode.yieldStrengthMpa.toString(), 'MPa'],
    ['Allowable Shear Limit', inputs.electrode.allowableShearMpa.toString(), 'MPa'],
    ['Leg Size (s)', inputs.legSizeMm.toString(), 'mm'],
    ['Design Throat (a)', results.throatMm.toFixed(2), 'mm'],
    ['Effective Weld Length', results.effectiveLengthMm.toFixed(1), 'mm'],
    ['Effective Weld Area (Aw)', results.effectiveAreaAwMm2.toFixed(1), 'mm²'],
    ['Applied Load (F)', inputs.loadKn.toFixed(1), 'kN'],
    ['Primary Direct Stress', results.primaryDirectShearMpa.toFixed(2), 'MPa'],
    ['Secondary / Bending Stress', results.secondaryMomentStressMpa.toFixed(2), 'MPa'],
    ['Peak Resultant Stress', results.peakCombinedStressMpa.toFixed(2), 'MPa'],
    ['Allowable Joint Stress', results.allowableStressMpa.toFixed(2), 'MPa'],
    ['Safety Factor (SF)', results.safetyFactor.toFixed(2), ''],
    ['Utilization Ratio', `${results.stressUtilizationPct.toFixed(1)}%`, ''],
    ['Evaluation Status', results.status, ''],
  ];

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `weld_stress_analysis_${inputs.mode}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
