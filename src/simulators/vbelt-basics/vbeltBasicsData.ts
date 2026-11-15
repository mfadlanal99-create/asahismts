// V-Belt & Drive Belt Basics Data, Dimensions, Wedging Physics & Belt Code Decoder

import { degToRad } from '../../physics';

// ==========================================
// MODE 2: V-BELT & DRIVE BELT SPECIFICATIONS
// ==========================================

export type BeltFamilyId =
  | 'classical_v'
  | 'narrow_wedge'
  | 'cogged_raw_edge'
  | 'timing_synchronous'
  | 'poly_v'
  | 'flat_belt';

export type BeltProfileCode =
  | 'A'
  | 'B'
  | 'C'
  | 'SPZ'
  | 'SPA'
  | 'SPB'
  | 'AX'
  | 'BX'
  | 'HTD_5M'
  | 'HTD_8M'
  | 'PJ'
  | 'PK'
  | 'Flat';

export interface BeltSpec {
  code: BeltProfileCode;
  family: BeltFamilyId;
  name: string;
  nameId: string;
  nameJa: string;
  topWidthMm: number;
  heightMm: number;
  wedgeAngleDeg: number;
  minSheaveDiameterMm: number;
  nominalPowerKwPerStrand: number;
  maxBeltSpeedMPerS: number;
  constructionDescription: string;
  constructionDescriptionId: string;
  constructionDescriptionJa: string;
  standardCodes: string[];
  keyApplications: string[];
  features: string[];
}

export const BELT_SPECS: Record<BeltProfileCode, BeltSpec> = {
  A: {
    code: 'A',
    family: 'classical_v',
    name: 'Classical V-Belt (Section A)',
    nameId: 'V-Belt Klasik (Tipe A)',
    nameJa: 'クラシックVベルト (A形)',
    topWidthMm: 13.0,
    heightMm: 8.0,
    wedgeAngleDeg: 40,
    minSheaveDiameterMm: 71,
    nominalPowerKwPerStrand: 2.2,
    maxBeltSpeedMPerS: 25,
    constructionDescription:
      'Fabric wrapped jacket with high-tensile polyester cord embedded in synthetic cushion rubber. Standard classical trapezoidal profile with 40° groove seating.',
    constructionDescriptionId:
      'Pembungkus kain tenun pelindung dengan tali poliester kuat tarik tinggi di bantalan karet sintetis. Profil trapesium klasik standar 40°.',
    constructionDescriptionJa:
      '織布カバーで包まれたポリエステル抗張体コード内蔵の標準台形断面Vベルト。長年の実績を持つ最も汎用的な40°規格です。',
    standardCodes: ['A-42', 'A-50', 'A-68'],
    keyApplications: ['Centrifugal ventilation fans', 'Workshop drill presses', 'Small air compressors'],
    features: ['Inexpensive and widely standardized', 'Fabric jacket resists oil and minor slippage heat'],
  },
  B: {
    code: 'B',
    family: 'classical_v',
    name: 'Classical V-Belt (Section B)',
    nameId: 'V-Belt Klasik (Tipe B)',
    nameJa: 'クラシックVベルト (B形)',
    topWidthMm: 17.0,
    heightMm: 11.0,
    wedgeAngleDeg: 40,
    minSheaveDiameterMm: 112,
    nominalPowerKwPerStrand: 5.5,
    maxBeltSpeedMPerS: 25,
    constructionDescription:
      'Heavy-duty classical profile delivering robust torque capacity across industrial general-purpose prime movers and motors up to 30 kW.',
    constructionDescriptionId:
      'Profil klasik tugas menengah-berat yang memberikan torsi tangguh pada motor penggerak industri hingga 30 kW.',
    constructionDescriptionJa:
      '中〜大型産業モーター（〜30kW）で多用される高トルク伝動用標準台形断面Vベルト。',
    standardCodes: ['B-55', 'B-65', 'B-82'],
    keyApplications: ['Industrial water pumps', 'Belt conveyor drive pulleys', 'Rotary blowers'],
    features: ['High durability under fluctuating loads', 'Tolerates minor pulley alignment variations'],
  },
  C: {
    code: 'C',
    family: 'classical_v',
    name: 'Classical V-Belt (Section C)',
    nameId: 'V-Belt Klasik (Tipe C)',
    nameJa: 'クラシックVベルト (C形)',
    topWidthMm: 22.0,
    heightMm: 14.0,
    wedgeAngleDeg: 40,
    minSheaveDiameterMm: 180,
    nominalPowerKwPerStrand: 12.0,
    maxBeltSpeedMPerS: 25,
    constructionDescription:
      'Heavy industrial classical V-belt capable of transmitting massive horsepower across multi-strand grouped sheaves (e.g. 4C or 6C drives).',
    constructionDescriptionId:
      'V-belt klasik industri berat untuk meneruskan daya besar melalui susunan multi-jalur (misalnya 4C atau 6C).',
    constructionDescriptionJa:
      '大型破砕機や大型ブロワなどの高出力重負荷伝動に対応する太径クラシックVベルト。',
    standardCodes: ['C-85', 'C-105', 'C-144'],
    keyApplications: ['Rock crushers and hammermills', 'Heavy aggregate vibrating screens', 'Large ball mills'],
    features: ['Tremendous shock load damping', 'Requires large minimum pulley diameter (180mm+)'],
  },
  SPZ: {
    code: 'SPZ',
    family: 'narrow_wedge',
    name: 'Narrow Wedge V-Belt (SPZ)',
    nameId: 'V-Belt Baji Sempit (SPZ)',
    nameJa: '細幅Vベルト (SPZ形)',
    topWidthMm: 9.7,
    heightMm: 8.0,
    wedgeAngleDeg: 38,
    minSheaveDiameterMm: 63,
    nominalPowerKwPerStrand: 2.8,
    maxBeltSpeedMPerS: 35,
    constructionDescription:
      'High-performance narrow wedge profile with 38° groove angle. Deeper cross-section provides superior sidewall wedging action and transmits up to 1.5× the power of Section A in smaller sheave space.',
    constructionDescriptionId:
      'Profil baji sempit performa tinggi dengan sudut alur 38°. Penampang lebih dalam memberikan efek baji dinding samping superior, mentransmisikan hingga 1.5× daya tipe A pada ruang puli lebih ringkas.',
    constructionDescriptionJa:
      'ISO規格の細幅高張力Vベルト。38°の鋭角溝によりくさび効果を高め、従来のA形に比べ約1.5倍の動力を小型プーリで伝動可能。',
    standardCodes: ['SPZ-800', 'SPZ-1010', 'SPZ-1250'],
    keyApplications: ['Compact electric motor drives', 'Automotive auxiliary fans', 'Centrifugal blowers'],
    features: ['30% narrower pulley face width', 'Higher centrifugal stability at high belt velocity'],
  },
  SPA: {
    code: 'SPA',
    family: 'narrow_wedge',
    name: 'Narrow Wedge V-Belt (SPA)',
    nameId: 'V-Belt Baji Sempit (SPA)',
    nameJa: '細幅Vベルト (SPA形)',
    topWidthMm: 12.7,
    heightMm: 10.0,
    wedgeAngleDeg: 38,
    minSheaveDiameterMm: 90,
    nominalPowerKwPerStrand: 6.5,
    maxBeltSpeedMPerS: 35,
    constructionDescription:
      'ISO narrow wedge belt designed to replace bulky Classical B drives with lighter, more energy-efficient pulleys and lower bearing overhang loads.',
    constructionDescriptionId:
      'V-belt baji sempit ISO untuk menggantikan sistem B klasik dengan puli yang lebih ringan, hemat energi, dan beban overhung bantalan lebih rendah.',
    constructionDescriptionJa:
      '欧州ISO標準の細幅Vベルト。B形クラシックベルトの代替として、プーリ幅・重量の削減と高効率化を実現します。',
    standardCodes: ['SPA-1000', 'SPA-1250', 'SPA-1600'],
    keyApplications: ['Industrial screw compressors', 'Packaging machinery', 'Centrifugal pump skids'],
    features: ['Substantial weight and space savings', 'Reduced shaft overhang bending moments'],
  },
  SPB: {
    code: 'SPB',
    family: 'narrow_wedge',
    name: 'Narrow Wedge V-Belt (SPB)',
    nameId: 'V-Belt Baji Sempit (SPB)',
    nameJa: '細幅Vベルト (SPB形)',
    topWidthMm: 16.3,
    heightMm: 13.0,
    wedgeAngleDeg: 38,
    minSheaveDiameterMm: 140,
    nominalPowerKwPerStrand: 14.0,
    maxBeltSpeedMPerS: 35,
    constructionDescription:
      'Heavy-duty narrow wedge profile offering extraordinary horsepower rating per strand, permitting significant downsizing of motor sheave packages.',
    constructionDescriptionId:
      'Profil baji sempit tugas berat dengan kapasitas daya luar biasa per jalur, memungkinkan perampingan ukuran puli motor secara signifikan.',
    constructionDescriptionJa:
      '大動力伝動用ISO細幅Vベルト。1本あたりの伝動能力が極めて高く、多条掛け本数を半減できます。',
    standardCodes: ['SPB-1600', 'SPB-2000', 'SPB-2500'],
    keyApplications: ['Industrial chillers and ammonia compressors', 'Logging chippers', 'Asphalt pugmills'],
    features: ['Transmits up to 2× power of Classical C belt', 'Cuts total drive weight by up to 40%'],
  },
  AX: {
    code: 'AX',
    family: 'cogged_raw_edge',
    name: 'Cogged Raw-Edge V-Belt (AX)',
    nameId: 'V-Belt Bergerigi Raw-Edge (AX)',
    nameJa: 'コグ付きローエッジVベルト (AX形)',
    topWidthMm: 13.0,
    heightMm: 8.0,
    wedgeAngleDeg: 38,
    minSheaveDiameterMm: 50,
    nominalPowerKwPerStrand: 3.2,
    maxBeltSpeedMPerS: 40,
    constructionDescription:
      'Raw-edge rubber sidewalls directly grip sheave flanks for a higher friction coefficient, while molded bottom cogs provide exceptional bending flexibility around smaller pulleys without cracking.',
    constructionDescriptionId:
      'Dinding samping karet terbuka langsung mencengkeram alur puli dengan koefisien gesek tinggi, sementara gigi cetak di bagian bawah memberi kelenturan tanpa retak pada puli kecil.',
    constructionDescriptionJa:
      '側面に布を巻かないローエッジ構造で摩擦係数を向上させ、下部コグ形状により小径プーリへの屈曲疲労と発熱を大幅に抑制。',
    standardCodes: ['AX-38', 'AX-48', 'AX-62'],
    keyApplications: ['Automotive engine accessories', 'High-speed small CNC lathes', 'High-ambient HVAC air handlers'],
    features: ['Runs 15–20°C cooler than wrapped belts', 'Can wrap around 30% smaller minimum pulley diameters'],
  },
  BX: {
    code: 'BX',
    family: 'cogged_raw_edge',
    name: 'Cogged Raw-Edge V-Belt (BX)',
    nameId: 'V-Belt Bergerigi Raw-Edge (BX)',
    nameJa: 'コグ付きローエッジVベルト (BX形)',
    topWidthMm: 17.0,
    heightMm: 11.0,
    wedgeAngleDeg: 38,
    minSheaveDiameterMm: 80,
    nominalPowerKwPerStrand: 7.8,
    maxBeltSpeedMPerS: 40,
    constructionDescription:
      'Raw-edge cogged construction for B-section sheaves, combining superior raw-edge friction grip with thermal heat dissipation cogs for heavy demanding cycles.',
    constructionDescriptionId:
      'Konstruksi bergerigi raw-edge untuk puli tipe B, memadukan cengkeraman gesek tinggi dengan pelepasan panas optimal untuk beban berat.',
    constructionDescriptionJa:
      'B形用の高効率コグ付きローエッジベルト。伝動効率97%以上を維持し、高温環境や頻繁な発停に優れた耐久性を発揮します。',
    standardCodes: ['BX-52', 'BX-68', 'BX-80'],
    keyApplications: ['Heavy diesel generators', 'Industrial root blowers', 'Air filtration exhaust blowers'],
    features: ['High energy efficiency (>97%)', 'Eliminates heat cracking on high-speed reverse bends'],
  },
  HTD_5M: {
    code: 'HTD_5M',
    family: 'timing_synchronous',
    name: 'Synchronous Timing Belt (HTD 5M)',
    nameId: 'Timing Belt Sinkron (HTD 5M)',
    nameJa: 'タイミングベルト (HTD 5M)',
    topWidthMm: 15.0, // standard width option
    heightMm: 3.6,
    wedgeAngleDeg: 0, // positive teeth
    minSheaveDiameterMm: 22.28, // 14 teeth
    nominalPowerKwPerStrand: 3.5,
    maxBeltSpeedMPerS: 50,
    constructionDescription:
      'Curvilinear round tooth profile with 5.0 mm pitch. High-strength fiberglass tension members encased in polychloroprene with nylon-faced wear-resistant teeth. Zero slip positive drive.',
    constructionDescriptionId:
      'Profil gigi lengkung dengan pitch 5.0 mm. Serat kaca berkekuatan tinggi di dalam polikloroprena dengan lapisan nilon tahan aus. Transmisi positif tanpa slip.',
    constructionDescriptionJa:
      '円弧歯形（5.0mmピッチ）の高精度同期伝動ベルト。グラスファイバー芯線と耐摩耗ナイロン帆布により、完全なスリップゼロ伝動を実現。',
    standardCodes: ['HTD 5M-450-15', 'HTD 5M-600-25', 'HTD 5M-800-15'],
    keyApplications: ['3D printers and precision CNC axes', 'Medical dosing equipment', 'Robotic linear actuators'],
    features: ['Positive synchronization with exact speed ratio', 'Requires no high initial pre-tensioning friction'],
  },
  HTD_8M: {
    code: 'HTD_8M',
    family: 'timing_synchronous',
    name: 'Synchronous Timing Belt (HTD 8M)',
    nameId: 'Timing Belt Sinkron (HTD 8M)',
    nameJa: 'タイミングベルト (HTD 8M)',
    topWidthMm: 30.0,
    heightMm: 5.6,
    wedgeAngleDeg: 0,
    minSheaveDiameterMm: 56.02, // 22 teeth
    nominalPowerKwPerStrand: 18.0,
    maxBeltSpeedMPerS: 50,
    constructionDescription:
      'Curvilinear round tooth profile with 8.0 mm pitch, engineered for high-torque synchronous power transmission, replacing noisy maintenance-heavy roller chains.',
    constructionDescriptionId:
      'Profil gigi lengkung 8.0 mm pitch untuk transmisi torsi tinggi, menggantikan rantai rol yang bising dan butuh pelumasan teratur.',
    constructionDescriptionJa:
      '高トルク対応8.0mmピッチ円弧歯タイミングベルト。給油不要でクリーン、ローラチェーンの静粛な代替として最適です。',
    standardCodes: ['HTD 8M-800-30', 'HTD 8M-1200-50', 'HTD 8M-1600-30'],
    keyApplications: ['Automotive overhead camshaft drives', 'Conveyor line indexers', 'CNC milling spindles'],
    features: ['Zero lubrication required', 'Low operating noise even at high pitch line velocities'],
  },
  PJ: {
    code: 'PJ',
    family: 'poly_v',
    name: 'Multi-Ribbed Poly-V Belt (PJ)',
    nameId: 'V-Belt Multi-Rib Poly-V (PJ)',
    nameJa: 'リブドベルト / ポリVベルト (PJ形)',
    topWidthMm: 9.36, // e.g. 4 ribs * 2.34mm
    heightMm: 3.5,
    wedgeAngleDeg: 40,
    minSheaveDiameterMm: 20,
    nominalPowerKwPerStrand: 1.8,
    maxBeltSpeedMPerS: 60,
    constructionDescription:
      'Continuous flat belt backing with multiple longitudinal triangular micro-V ribs (2.34 mm pitch). Combines the high flexibility of a flat belt with the enhanced wedging grip of a V-belt.',
    constructionDescriptionId:
      'Punggung sabuk rata dengan banyak rusuk baji segitiga memanjang (jarak 2.34 mm). Memadukan kelenturan sabuk datar dengan cengkeraman baji V-belt.',
    constructionDescriptionJa:
      '平ベルトの柔軟性とVベルトのくさび効果を融合。2.34mmピッチの微小な縦リブが極小径プーリへの高速巻き掛けを可能にします。',
    standardCodes: ['4PJ-610', '6PJ-860', '8PJ-1100'],
    keyApplications: ['Treadmills and fitness bikes', 'Household washing machines', 'Compact electric hand tools'],
    features: ['Operates smoothly on tiny 20mm pulleys', 'Supports back-side idler pulleys with flat tensioners'],
  },
  PK: {
    code: 'PK',
    family: 'poly_v',
    name: 'Multi-Ribbed Poly-V Belt (PK)',
    nameId: 'V-Belt Multi-Rib Poly-V (PK)',
    nameJa: 'リブドベルト / ポリVベルト (PK形)',
    topWidthMm: 21.36, // e.g. 6 ribs * 3.56mm
    heightMm: 4.5,
    wedgeAngleDeg: 40,
    minSheaveDiameterMm: 45,
    nominalPowerKwPerStrand: 7.5,
    maxBeltSpeedMPerS: 60,
    constructionDescription:
      'Automotive industry gold standard (3.56 mm rib pitch). Drives all front-engine accessories (alternator, AC compressor, power steering pump, water pump) from a single serpentine belt routing.',
    constructionDescriptionId:
      'Standar otomotif utama (pitch 3.56 mm). Menggerakkan semua aksesori mesin dari satu jalur sabuk serpentine berliku.',
    constructionDescriptionJa:
      '自動車補機駆動（オルタネータ、エアコンコンプレッサ等）の世界的標準（3.56mmピッチ）。1本のベルトで多数の補機をサーペンタイン駆動します。',
    standardCodes: ['6PK-1180', '6PK-1820', '7PK-1950'],
    keyApplications: ['Automotive front accessory serpentine drives', 'Diesel auxiliary power generators', 'High-speed centrifuge rotors'],
    features: ['High speed capability up to 60 m/s', 'Allows multiple serpentine drives off both faces'],
  },
  Flat: {
    code: 'Flat',
    family: 'flat_belt',
    name: 'High-Efficiency Flat Belt',
    nameId: 'Sabuk Rata Efisiensi Tinggi',
    nameJa: '高効率平ベルト',
    topWidthMm: 40.0,
    heightMm: 2.5,
    wedgeAngleDeg: 0,
    minSheaveDiameterMm: 50,
    nominalPowerKwPerStrand: 6.0,
    maxBeltSpeedMPerS: 80,
    constructionDescription:
      'Multi-layer composite comprising a high-modulus polyamide or aramid traction core with rubber or chrome-leather friction surface layers. Runs on slightly crowned pulleys for natural self-centering tracking.',
    constructionDescriptionId:
      'Komposit multi-lapis dengan inti traksi poliamida atau aramid berlapis kulit krom atau karet. Berjalan pada puli berkubah sedikit (crowned) untuk penengahan mandiri.',
    constructionDescriptionJa:
      'ポリアミドまたはアラミド抗張体コアと特殊合成ゴム/クロム革摩擦層の積層構造。クラウン（中央膨らみ）プーリにより蛇行を防ぎ、98.5%以上の超高効率を発揮します。',
    standardCodes: ['Flat-40x2.5-1200', 'Flat-50x3.0-2000'],
    keyApplications: ['High-speed textile spinning frames', 'Woodworking planers and spindle moulders', 'Paper printing presses'],
    features: ['Exceptional transmission efficiency (>98%)', 'Operates at extreme velocities up to 80–100 m/s with near-zero vibration'],
  },
};

// Belt Code Decoder Logic
export interface DecodedBeltCode {
  originalInput: string;
  recognized: boolean;
  family: string;
  profileCode: BeltProfileCode;
  lengthValue: number;
  lengthUnit: 'mm' | 'inches';
  lengthType: 'Pitch / Datum (Lp)' | 'Inside (Li)' | 'Outside (La)' | 'Effective';
  effectiveLengthMm: number;
  widthMm: number;
  heightMm: number;
  wedgeAngleDeg: number;
  minSheaveDiaMm: number;
  engineeringRemarks: string;
  engineeringRemarksId: string;
  engineeringRemarksJa: string;
}

export function decodeBeltCode(rawInput: string): DecodedBeltCode {
  const clean = rawInput.trim().toUpperCase().replace(/\s+/g, ' ');

  // 1. Classical V-Belt check e.g. "B-65", "A-42", "C-105", "B65", "A42"
  const classicalMatch = clean.match(/^([ABC])[- ]?(\d+(\.\d+)?)$/);
  if (classicalMatch) {
    const section = classicalMatch[1] as 'A' | 'B' | 'C';
    const inches = parseFloat(classicalMatch[2]);
    const spec = BELT_SPECS[section];
    // Classical: number denotes inside length Li in inches.
    // Approximate pitch length Lp = Li + offset (A: ~33mm, B: ~43mm, C: ~56mm)
    const liMm = inches * 25.4;
    const lpOffset = section === 'A' ? 33 : section === 'B' ? 43 : 56;
    const lpMm = liMm + lpOffset;

    return {
      originalInput: rawInput,
      recognized: true,
      family: 'Classical V-Belt (DIN 2215 / ISO 4184)',
      profileCode: section,
      lengthValue: inches,
      lengthUnit: 'inches',
      lengthType: 'Inside (Li)',
      effectiveLengthMm: Math.round(lpMm),
      widthMm: spec.topWidthMm,
      heightMm: spec.heightMm,
      wedgeAngleDeg: spec.wedgeAngleDeg,
      minSheaveDiaMm: spec.minSheaveDiameterMm,
      engineeringRemarks: `Section ${section} Classical V-Belt with inside length Li = ${inches}" (~${Math.round(liMm)} mm). Datum pitch length Lp ≈ ${Math.round(lpMm)} mm. Standard 40° groove wedging action.`,
      engineeringRemarksId: `V-Belt Klasik tipe ${section} dengan panjang dalam Li = ${inches}" (~${Math.round(liMm)} mm). Panjang pitch Lp ≈ ${Math.round(lpMm)} mm. Baji 40° standar.`,
      engineeringRemarksJa: `クラシックVベルト ${section}形。内周長 Li = ${inches}インチ（約${Math.round(liMm)}mm）、有効ピッチ長 Lp ≈ ${Math.round(lpMm)}mm。標準40°プーリ溝。`,
    };
  }

  // 2. Narrow Wedge e.g. "SPA-1250", "SPZ 800", "SPB-2000"
  const narrowMatch = clean.match(/^(SPZ|SPA|SPB)[- ]?(\d+)$/);
  if (narrowMatch) {
    const section = narrowMatch[1] as 'SPZ' | 'SPA' | 'SPB';
    const datumMm = parseInt(narrowMatch[2], 10);
    const spec = BELT_SPECS[section];

    return {
      originalInput: rawInput,
      recognized: true,
      family: 'Narrow Wedge V-Belt (DIN 7753 / ISO 4184)',
      profileCode: section,
      lengthValue: datumMm,
      lengthUnit: 'mm',
      lengthType: 'Pitch / Datum (Lp)',
      effectiveLengthMm: datumMm,
      widthMm: spec.topWidthMm,
      heightMm: spec.heightMm,
      wedgeAngleDeg: spec.wedgeAngleDeg,
      minSheaveDiaMm: spec.minSheaveDiameterMm,
      engineeringRemarks: `ISO Narrow Wedge ${section} with datum pitch length Lp = ${datumMm} mm. Features 38° deep groove wedging for up to 1.8× power density compared to classical belts.`,
      engineeringRemarksId: `V-Belt Baji Sempit ISO ${section} dengan panjang datum pitch Lp = ${datumMm} mm. Memiliki baji dalam 38° untuk daya hingga 1.8× dibanding tipe klasik.`,
      engineeringRemarksJa: `ISO細幅Vベルト ${section}形。有効ピッチ長 Lp = ${datumMm}mm。38°深溝くさび効果により従来比最大1.8倍の高トルク伝動を実現。`,
    };
  }

  // 3. Timing / Synchronous HTD e.g. "HTD 8M-800", "HTD 8M-800-30", "8M-800-30", "5M-600-15"
  const htdMatch = clean.match(/^(HTD )?(5M|8M)[- ](\d+)([- ](\d+))?$/);
  if (htdMatch) {
    const pitchCode = (htdMatch[2] === '5M' ? 'HTD_5M' : 'HTD_8M') as BeltProfileCode;
    const lengthMm = parseInt(htdMatch[3], 10);
    const widthParam = htdMatch[5] ? parseInt(htdMatch[5], 10) : pitchCode === 'HTD_5M' ? 15 : 30;
    const spec = BELT_SPECS[pitchCode];
    const pitchMm = pitchCode === 'HTD_5M' ? 5.0 : 8.0;
    const toothCount = Math.round(lengthMm / pitchMm);

    return {
      originalInput: rawInput,
      recognized: true,
      family: 'Curvilinear Synchronous Timing Belt (ISO 13050)',
      profileCode: pitchCode,
      lengthValue: lengthMm,
      lengthUnit: 'mm',
      lengthType: 'Pitch / Datum (Lp)',
      effectiveLengthMm: lengthMm,
      widthMm: widthParam,
      heightMm: spec.heightMm,
      wedgeAngleDeg: 0,
      minSheaveDiaMm: spec.minSheaveDiameterMm,
      engineeringRemarks: `Synchronous curvilinear tooth belt with ${pitchMm} mm pitch, total pitch length ${lengthMm} mm (${toothCount} teeth), and width ${widthParam} mm. Exact positive drive with zero slip.`,
      engineeringRemarksId: `Timing belt sinkron profil lengkung dengan pitch ${pitchMm} mm, panjang pitch total ${lengthMm} mm (${toothCount} gigi), dan lebar ${widthParam} mm. Transmisi positif presisi tanpa selip.`,
      engineeringRemarksJa: `円弧歯形同期タイミングベルト。ピッチ${pitchMm}mm、ピッチ長${lengthMm}mm（歯数 ${toothCount}）、ベルト幅${widthParam}mm。スリップゼロの同期伝動。`,
    };
  }

  // 4. Automotive Poly-V e.g. "6PK-1180", "6PK 1180", "4PJ-610"
  const polyvMatch = clean.match(/^(\d+)(PJ|PK)[- ]?(\d+)$/);
  if (polyvMatch) {
    const ribs = parseInt(polyvMatch[1], 10);
    const profile = polyvMatch[2] as 'PJ' | 'PK';
    const lengthMm = parseInt(polyvMatch[3], 10);
    const spec = BELT_SPECS[profile];
    const ribPitch = profile === 'PJ' ? 2.34 : 3.56;
    const totalWidth = +(ribs * ribPitch).toFixed(2);

    return {
      originalInput: rawInput,
      recognized: true,
      family: 'Multi-Ribbed Serpentine Poly-V Belt (DIN 7867 / ISO 9982)',
      profileCode: profile,
      lengthValue: lengthMm,
      lengthUnit: 'mm',
      lengthType: 'Effective',
      effectiveLengthMm: lengthMm,
      widthMm: totalWidth,
      heightMm: spec.heightMm,
      wedgeAngleDeg: spec.wedgeAngleDeg,
      minSheaveDiaMm: spec.minSheaveDiameterMm,
      engineeringRemarks: `${ribs}-ribbed Poly-V belt (${profile} profile) with effective length ${lengthMm} mm and total width ${totalWidth} mm. Designed for compact multi-pulley serpentine drives.`,
      engineeringRemarksId: `V-belt Poly-V ${ribs} rusuk (profil ${profile}) dengan panjang efektif ${lengthMm} mm dan lebar total ${totalWidth} mm. Dirancang untuk penggerak serpentine multi-puli.`,
      engineeringRemarksJa: `多リブ式ポリVベルト（${profile}形、${ribs}リブ）。有効長${lengthMm}mm、ベルト総幅${totalWidth}mm。補機サーペンタイン駆動用。`,
    };
  }

  // 5. Cogged Raw Edge e.g. "AX-42", "BX-65"
  const coggedMatch = clean.match(/^(AX|BX)[- ]?(\d+(\.\d+)?)$/);
  if (coggedMatch) {
    const section = coggedMatch[1] as 'AX' | 'BX';
    const inches = parseFloat(coggedMatch[2]);
    const spec = BELT_SPECS[section];
    const liMm = inches * 25.4;
    const lpOffset = section === 'AX' ? 30 : 40;
    const lpMm = liMm + lpOffset;

    return {
      originalInput: rawInput,
      recognized: true,
      family: 'Molded Cogged Raw-Edge V-Belt (RMA / ISO)',
      profileCode: section,
      lengthValue: inches,
      lengthUnit: 'inches',
      lengthType: 'Inside (Li)',
      effectiveLengthMm: Math.round(lpMm),
      widthMm: spec.topWidthMm,
      heightMm: spec.heightMm,
      wedgeAngleDeg: spec.wedgeAngleDeg,
      minSheaveDiaMm: spec.minSheaveDiameterMm,
      engineeringRemarks: `Molded notch cogged raw-edge ${section} with inside length Li = ${inches}" (~${Math.round(liMm)} mm). Cogged design flexes freely around small pulleys and runs substantially cooler.`,
      engineeringRemarksId: `V-belt bergerigi raw-edge ${section} dengan panjang dalam Li = ${inches}" (~${Math.round(liMm)} mm). Gerigi memberi kelenturan tinggi di puli kecil dan melepas panas lebih cepat.`,
      engineeringRemarksJa: `コグ付きローエッジVベルト ${section}形。内周長 Li = ${inches}インチ（約${Math.round(liMm)}mm）。コグ構造により小径プーリ対応と放熱性に優れます。`,
    };
  }

  // Fallback default
  const defaultSpec = BELT_SPECS['B'];
  return {
    originalInput: rawInput,
    recognized: false,
    family: 'Custom / Unrecognized Belt Code',
    profileCode: 'B',
    lengthValue: 65,
    lengthUnit: 'inches',
    lengthType: 'Inside (Li)',
    effectiveLengthMm: 1694,
    widthMm: defaultSpec.topWidthMm,
    heightMm: defaultSpec.heightMm,
    wedgeAngleDeg: defaultSpec.wedgeAngleDeg,
    minSheaveDiaMm: defaultSpec.minSheaveDiameterMm,
    engineeringRemarks: `Format '${rawInput}' not directly recognized. Displaying standard Classical B-65 reference. Try 'SPA-1250', 'HTD 8M-800-30', '6PK-1180', or 'AX-42'.`,
    engineeringRemarksId: `Format '${rawInput}' tidak dikenali. Menampilkan referensi standar Klasik B-65. Coba 'SPA-1250', 'HTD 8M-800-30', '6PK-1180', atau 'AX-42'.`,
    engineeringRemarksJa: `入力形式 '${rawInput}' を認識できませんでした。標準B-65の参考値を表示しています。「SPA-1250」「HTD 8M-800-30」「6PK-1180」「AX-42」などをお試しください。`,
  };
}

// ==========================================
// V-BELT WEDGING PHYSICS & PULLEY SEATING
// ==========================================

export interface WedgingPhysicsResult {
  apparentFrictionMuPrime: number;
  wedgingMultiplier: number;
  baseFrictionMu: number;
  wedgeAngleDeg: number;
  normalForcePerSideN: number;
  transmittedTractionPerSideN: number;
  totalTransmittedTractionN: number;
  bottomingOutOccurring: boolean;
  statusTextEn: string;
  statusTextId: string;
  statusTextJa: string;
}

export function computeWedgingPhysics(
  beltTensionN: number,
  wedgeAngleDeg: number,
  baseMu: number = 0.3,
  isBottomedOut: boolean = false
): WedgingPhysicsResult {
  if (isBottomedOut) {
    // When bottomed out, the wedging effect is destroyed!
    // The belt rests on the root surface like a flat belt on narrow steel.
    // Apparent friction drops to baseMu (0.3), normal force is simply the radial belt tension.
    const normalForce = beltTensionN;
    const traction = normalForce * baseMu;
    return {
      apparentFrictionMuPrime: baseMu,
      wedgingMultiplier: 1.0,
      baseFrictionMu: baseMu,
      wedgeAngleDeg,
      normalForcePerSideN: +(normalForce / 2).toFixed(1),
      transmittedTractionPerSideN: +(traction / 2).toFixed(1),
      totalTransmittedTractionN: +traction.toFixed(1),
      bottomingOutOccurring: true,
      statusTextEn:
        'CRITICAL FAILURE: Belt is bottoming out on groove root! Sidewall wedging is completely lost (μ′ dropped from ~0.9 to 0.3). Catastrophic slipping, screeching, and glazed pulley walls!',
      statusTextId:
        'KEGAGALAN KRITIS: Sabuk menyentuh dasar alur puli (bottoming out)! Efek baji dinding samping hilang total (μ′ anjlok dari ~0.9 ke 0.3). Selip parah, suara memekik, dan dinding puli terbakar!',
      statusTextJa:
        '重大故障：ベルトがプーリ溝底に底突き（ボトミング）しています！側面くさび効果が完全に喪失（見かけ摩擦係数μ′が約0.9から0.3へ急減）。スリップ、異音、プーリ焼損が発生します！',
    };
  }

  // Normal wedging action:
  // Each side sees a half-angle beta/2
  const halfAngleRad = degToRad(wedgeAngleDeg / 2);
  const sinHalf = Math.sin(halfAngleRad);
  const wedgingMultiplier = +(1 / sinHalf).toFixed(2);
  const muPrime = +(baseMu / sinHalf).toFixed(2);

  // Normal force on each sidewall: F_N = (Tension / 2) / sin(beta/2)
  const normalPerSide = +((beltTensionN / 2) / sinHalf).toFixed(1);
  const tractionPerSide = +(normalPerSide * baseMu).toFixed(1);
  const totalTraction = +(tractionPerSide * 2).toFixed(1);

  return {
    apparentFrictionMuPrime: muPrime,
    wedgingMultiplier,
    baseFrictionMu: baseMu,
    wedgeAngleDeg,
    normalForcePerSideN: normalPerSide,
    transmittedTractionPerSideN: tractionPerSide,
    totalTransmittedTractionN: totalTraction,
    bottomingOutOccurring: false,
    statusTextEn:
      'OPTIMAL SEATING: Belt sidewalls wedged firmly against groove flanks with ample root clearance. Wedging action amplifies traction by ~3× without slipping.',
    statusTextId:
      'DUDUK OPTIMAL: Dinding samping sabuk terjepit kokoh pada sayap alur dengan celah dasar yang cukup. Efek baji melipatgandakan gaya traksi sebesar ~3× tanpa selip.',
    statusTextJa:
      '正常な着座状態：ベルト側面がプーリ溝側面にしっかり密着し、底すきまが確保されています。くさび効果により摩擦力が約3倍に増幅されスリップを防ぎます。',
  };
}
