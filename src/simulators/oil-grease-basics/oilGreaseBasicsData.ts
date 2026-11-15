// Industrial Oil & Grease Types Lab - Data & Types

import {
  astmD341ViscosityAtTemp,
  cStToM2s,
  cToK,
  stokesTerminalVelocity,
} from '../../physics';

export type LabMode = 'oil' | 'grease';

export type OilFamilyId =
  | 'hydraulic-aw'
  | 'gear-ep'
  | 'turbine-ro'
  | 'engine-sae'
  | 'slideway'
  | 'pao-food';

export interface OilFamily {
  id: OilFamilyId;
  name: string;
  shortCode: string;
  baseType: 'mineral' | 'synthetic' | 'food-grade';
  primaryAdditives: string;
  keyApplications: string;
  colorHex: string;
  badgeBg: string;
  description: {
    en: string;
    id: string;
    ja: string;
  };
}

export const OIL_FAMILIES: OilFamily[] = [
  {
    id: 'hydraulic-aw',
    name: 'Hydraulic Oil AW',
    shortCode: 'AW (Anti-Wear)',
    baseType: 'mineral',
    primaryAdditives: 'Zinc dialkyldithiophosphate (ZDDP), rust/oxidation inhibitors, anti-foam agents',
    keyApplications: 'CNC hydraulic power packs, injection molding machines, hydraulic presses, forklifts',
    colorHex: '#eab308', // rich amber
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    description: {
      en: 'Formulated with anti-wear (AW) zinc additives that create a sacrificial protective boundary layer under high hydraulic pump pressures (up to 350 bar) to safeguard vanes, gears, and piston pumps.',
      id: 'Diformulasikan dengan aditif anti-aus (AW) seng yang membentuk lapisan pelindung batas saat tekanan pompa hidrolik tinggi (hingga 350 bar) untuk melindungi pompa roda gigi, vane, dan piston.',
      ja: '高圧油圧ポンプ（最大350bar）でのベーン、ピストン、ギアの摩耗を防ぐため、犠牲境界潤滑膜を形成する耐摩耗（AW）亜鉛系添加剤（ZDDP）を配合。',
    },
  },
  {
    id: 'gear-ep',
    name: 'Industrial Gear Oil EP',
    shortCode: 'EP (Extreme Pressure)',
    baseType: 'mineral',
    primaryAdditives: 'Sulfur-phosphorus extreme pressure agents, anti-micropitting compounds, demulsifiers',
    keyApplications: 'Enclosed heavy helical, bevel, planetary, and spur industrial gearboxes under shock loads',
    colorHex: '#b45309', // deep bronze amber
    badgeBg: 'bg-amber-700/10 text-amber-700 dark:text-amber-300 border-amber-700/20',
    description: {
      en: 'Heavily fortified with active sulfur-phosphorus chemistry that reacts chemically under intense gear contact pressures and flash temperatures to prevent welding, tooth scuffing, and micropitting.',
      id: 'Diperkuat aditif sulfur-fosfor tekanan ekstrem (EP) yang bereaksi secara kimiawi pada kontak roda gigi berbeban kejut untuk mencegah keausan parah (scuffing) dan mikropitting.',
      ja: '激しい歯面接触圧と瞬間高温下で化学反応する硫黄・リン系極圧（EP）剤を高濃度配合し、ギヤ歯の溶着、スコーフィング、マイクロピッチングを強力に防止。',
    },
  },
  {
    id: 'turbine-ro',
    name: 'Compressor / Turbine Oil R&O',
    shortCode: 'R&O (Rust & Oxidation)',
    baseType: 'mineral',
    primaryAdditives: 'Phenolic & aminic antioxidants, rust inhibitors, rapid water-separation demulsifiers',
    keyApplications: 'Rotary screw air compressors, steam and gas turbines, centrifugal circulating systems',
    colorHex: '#f59e0b', // warm golden
    badgeBg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    description: {
      en: 'Non-detergent, ashless formulation designed for exceptional thermal-oxidative stability and ultra-fast water separation (demulsibility) to prevent sludge, varnish, and emulsion in continuous circulation.',
      id: 'Formulasi non-deterjen bebas abu dengan stabilitas termal-oksidasi tinggi dan daya pisah air (demulsibilitas) cepat guna mencegah endapan pernis pada turbin dan kompresor.',
      ja: '優れた熱・酸化安定性と迅速な水分離性（抗乳化性）を備えた無灰・非洗剤系オイル。長期間の連続循環運転でもスラッジやワニス、エマルジョンの生成を防止。',
    },
  },
  {
    id: 'engine-sae',
    name: 'Engine Oil SAE (Heavy Duty)',
    shortCode: 'SAE HD (Detergent)',
    baseType: 'mineral',
    primaryAdditives: 'Detergents (calcium/magnesium sulfonates), dispersants, anti-wear ZDDP, TBN reserve',
    keyApplications: 'Diesel generator sets, heavy-duty industrial combustion engines, mobile equipment',
    colorHex: '#78350f', // dark amber
    badgeBg: 'bg-orange-800/10 text-orange-700 dark:text-orange-300 border-orange-800/20',
    description: {
      en: 'Contains strong alkaline detergent and dispersant packages to neutralize acidic combustion blow-by gases and keep soot and carbon particulates finely suspended until drained.',
      id: 'Mengandung paket deterjen alkalin kuat dan dispersan untuk menetralkan asam hasil pembakaran serta menjaga jelaga jelaga tetap tersuspensi tanpa menggumpal.',
      ja: '高濃度の清浄分散剤（カルシウム系等）と全アルカリ価（TBN）を含み、燃料燃焼時に生じる酸性生成物を中和し、煤やカーボン粒子を微細分散してスラッジ化を抑制。',
    },
  },
  {
    id: 'slideway',
    name: 'Slideway Oil',
    shortCode: 'Way Lube (Anti-Stick-Slip)',
    baseType: 'mineral',
    primaryAdditives: 'Polymer tackifiers, polar friction modifiers, biocide-resistant emulsification barriers',
    keyApplications: 'Machine tool slideways, CNC linear bedways, lathe carriages, milling machine columns',
    colorHex: '#c2410c', // reddish amber
    badgeBg: 'bg-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-600/20',
    description: {
      en: 'Specialized tackifiers enable the oil to cling tenaciously to vertical machine ways while polar friction modifiers eliminate stick-slip shudder, ensuring sub-micron positioning accuracy without coolant wash-off.',
      id: 'Aditif perekat (tackifier) memungkinkan oli melekat kuat pada rel vertikal, sementara friksi polar mencegah efek sentakan macet-luncur (stick-slip) untuk presisi pemesinan CNC halus.',
      ja: '垂直摺動面でも油膜が垂れ落ちない特殊粘着性ポリマーと極性摩擦調整剤を配合。微小送り時のスティックスリップ（断続的振動）を根絶し、超精密加工位置決めを実現。',
    },
  },
  {
    id: 'pao-food',
    name: 'Synthetic PAO / Food-Grade H1',
    shortCode: 'PAO Synthetic (NSF H1)',
    baseType: 'synthetic',
    primaryAdditives: 'High-purity polyalphaolefin (PAO) synthetic base, non-toxic NSF H1 registered additives',
    keyApplications: 'Food & beverage processing, pharmaceutical plants, extreme temperature drives (-40°C to +150°C)',
    colorHex: '#e2e8f0', // crystal clear
    badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    description: {
      en: 'Synthesized polyalphaolefin base oil with zero wax content and high Viscosity Index (>140), meeting strict US FDA / NSF H1 standards for incidental food contact while offering ultra-long drain intervals.',
      id: 'Oli sintetis murni Polyalphaolefin (PAO) tanpa lilin dengan Indeks Viskositas tinggi (>140), memenuhi standar higienis NSF H1 untuk kontak makanan tak sengaja dan suhu ekstrem.',
      ja: 'パラフィンワックス分ゼロの高純度PAO合成油をベースとし、高粘度指数（VI>140）を実現。食品への偶発接触が許容されるNSF H1規格に適合し、超広範な温度域に対応。',
    },
  },
];

export interface IsoVgGrade {
  vg: number;
  min40: number;
  max40: number;
  nu100Typical: number;
  commonUses: string;
}

export const ISO_VG_GRADES: IsoVgGrade[] = [
  { vg: 32, min40: 28.8, max40: 35.2, nu100Typical: 5.4, commonUses: 'High-speed spindles, light hydraulics in cold shops, air compressors' },
  { vg: 46, min40: 41.4, max40: 50.6, nu100Typical: 6.8, commonUses: 'Standard industrial hydraulics, plant air compressors, machine tool bearings' },
  { vg: 68, min40: 61.2, max40: 74.8, nu100Typical: 8.7, commonUses: 'Heavy hydraulics (outdoor/tropical), horizontal slideways, circulating systems' },
  { vg: 100, min40: 90.0, max40: 110.0, nu100Typical: 11.4, commonUses: 'Reciprocating air compressors, high-speed gearboxes, vacuum pumps' },
  { vg: 150, min40: 135.0, max40: 165.0, nu100Typical: 14.8, commonUses: 'Medium industrial gearboxes, heavy blower bearings, vertical slideways' },
  { vg: 220, min40: 198.0, max40: 242.0, nu100Typical: 19.2, commonUses: 'Standard plant enclosed gearboxes (helical/bevel), heavy slideways, conveyor drives' },
  { vg: 320, min40: 288.0, max40: 352.0, nu100Typical: 24.5, commonUses: 'Heavy gear drives under shock loads, ball mill reducers, low-speed bearings' },
  { vg: 460, min40: 414.0, max40: 506.0, nu100Typical: 30.8, commonUses: 'Severe-duty worm gearboxes, kiln drives, heavy rolling mill pinions' },
];

export interface MachinePreset {
  id: string;
  name: {
    en: string;
    id: string;
    ja: string;
  };
  recommendedFamilyId: OilFamilyId;
  recommendedVg: number;
  recommendedTempC: number;
  targetViscosityBandCst: [number, number];
  rationale: {
    en: string;
    id: string;
    ja: string;
  };
}

export const MACHINE_PRESETS: MachinePreset[] = [
  {
    id: 'hydraulic-hpu',
    name: {
      en: 'CNC Hydraulic Power Unit (Vane/Piston)',
      id: 'Unit Tenaga Hidrolik CNC (Pompa Vane/Piston)',
      ja: 'CNC油圧パワーユニット（ベーン/ピストンポンプ）',
    },
    recommendedFamilyId: 'hydraulic-aw',
    recommendedVg: 46,
    recommendedTempC: 50,
    targetViscosityBandCst: [16, 36],
    rationale: {
      en: 'Vane and axial piston pumps require anti-wear (AW) protection under high pressure. ISO VG 46 maintains optimum volumetric efficiency between 16 and 36 cSt at typical 50°C reservoir temperatures.',
      id: 'Pompa vane dan piston aksial butuh perlindungan anti-aus (AW) pada tekanan tinggi. ISO VG 46 menjaga efisiensi volumetrik prima antara 16–36 cSt pada suhu tangki 50°C.',
      ja: '高圧下のベーンおよびアキシアルピストンポンプには耐摩耗（AW）性能が必須。ISO VG 46は運転温度50°Cで16〜36 cStの最適体積効率を維持します。',
    },
  },
  {
    id: 'helical-gearbox',
    name: {
      en: 'Heavy Helical Industrial Gearbox',
      id: 'Gearbox Industri Helikal Beban Berat',
      ja: '重荷重ヘリカル減速機（ギヤボックス）',
    },
    recommendedFamilyId: 'gear-ep',
    recommendedVg: 220,
    recommendedTempC: 65,
    targetViscosityBandCst: [35, 75],
    rationale: {
      en: 'Enclosed gear teeth experience high rolling and sliding contact stresses. Sulfur-phosphorus EP additives protect tooth flanks from micropitting and scuffing, with ISO VG 220 providing adequate hydrodynamic film thickness.',
      id: 'Gigi transmisi helikal mengalami tegangan geser kontak tinggi. Aditif EP sulfur-fosfor mencegah scuffing dan pitting, didukung ISO VG 220 untuk ketebalan film oli elastohidrodinamik.',
      ja: '歯面の高滑り接触応力に対応するため極圧（EP）剤が必要。ISO VG 220がサンプ温度65°Cにおいて十分な弾性流体潤滑（EHL）油膜厚さを形成します。',
    },
  },
  {
    id: 'screw-compressor',
    name: {
      en: 'Rotary Screw Air Compressor',
      id: 'Kompresor Udara Rotary Screw',
      ja: '給油式スクリューエアコンプレッサー',
    },
    recommendedFamilyId: 'turbine-ro',
    recommendedVg: 46,
    recommendedTempC: 80,
    targetViscosityBandCst: [10, 16],
    rationale: {
      en: 'Direct oil injection into hot compressed air (80°C+) demands non-foaming R&O oil with rapid water separation and resistance to thermal oxidation and varnish formation.',
      id: 'Injeksi oli langsung ke udara kompresi panas (80°C+) menuntut oli R&O anti-busa dengan pemisahan air cepat dan ketahanan tinggi terhadap oksidasi serta pembentukan pernis.',
      ja: '80°C以上の高温圧縮空気に直接接触するため、優れた抗酸化性と水分離性を持つR&O油（VG 46）がワニスやスラッジ生成を防ぎます。',
    },
  },
  {
    id: 'machine-slideway',
    name: {
      en: 'CNC Lathe & Mill Slideway (Horizontal)',
      id: 'Slideway Rel Mesin Bubut/Milling CNC',
      ja: 'CNC工作機械すべり案内面（横型スラドウェー）',
    },
    recommendedFamilyId: 'slideway',
    recommendedVg: 68,
    recommendedTempC: 30,
    targetViscosityBandCst: [50, 120],
    rationale: {
      en: 'Horizontal sliding guideways require tackifiers and friction modifiers to eliminate stick-slip judder during micro-feed motions, preventing water-soluble coolant from washing the lubricant away.',
      id: 'Rel geser horizontal membutuhkan perekat dan pengubah gesekan polar untuk menghilangkan getaran stick-slip pada pemakanan mikro serta menahan sapuan cairan pendingin (coolant).',
      ja: '微小送りでのビビリ・引っかかり（スティックスリップ）を排除し、水溶性切削液による洗い流しに耐えるため、タック性を持つ専用スラドウェー油（VG 68）が必須です。',
    },
  },
  {
    id: 'food-conveyor',
    name: {
      en: 'Food Processing Conveyor Drive (NSF H1)',
      id: 'Penggerak Konveyor Pabrik Makanan (NSF H1)',
      ja: '食品製造ライン用コンベア減速機（NSF H1）',
    },
    recommendedFamilyId: 'pao-food',
    recommendedVg: 220,
    recommendedTempC: 45,
    targetViscosityBandCst: [50, 180],
    rationale: {
      en: 'Food safety audits mandate NSF H1 registered food-grade lubricants for potential incidental contact zones. Synthetic PAO base oil ensures long life and resistance to frequent wash-downs.',
      id: 'Audit keamanan pangan mewajibkan oli food-grade NSF H1 jika ada potensi kontak makanan. Basis sintetis PAO memberikan ketahanan oksidasi tinggi dan umur pakai panjang.',
      ja: '食品製造ラインでは偶発接触が許容されるNSF H1規格が義務付けられます。PAO合成油（VG 220）は高湿度・定期洗浄環境でも長寿命を維持します。',
    },
  },
  {
    id: 'high-speed-spindle',
    name: {
      en: 'High-Speed Milling Spindle (15,000+ RPM)',
      id: 'Spindel Milling Kecepatan Tinggi (15.000+ RPM)',
      ja: '超高速マシニングセンタ主軸（15,000+ RPM）',
    },
    recommendedFamilyId: 'hydraulic-aw',
    recommendedVg: 32,
    recommendedTempC: 40,
    targetViscosityBandCst: [25, 38],
    rationale: {
      en: 'Ultra-high rotational speeds generate significant fluid shear friction. Low viscosity ISO VG 32 minimizes viscous drag and thermal heat rise in precision angular contact spindle bearings.',
      id: 'Kecepatan putar sangat tinggi menghasilkan friksi geser fluida besar. Viskositas rendah ISO VG 32 meminimalkan hambatan viskos dan kenaikan panas pada bantalan spindel presisi.',
      ja: '超高速回転ではオイルの粘性摩擦熱が問題となります。低粘度なISO VG 32を用いることで攪拌抵抗を抑制し、スピンドルの熱膨張を防ぎます。',
    },
  },
];

/**
 * Calculates Kinematic Viscosity (cSt) at a given temperature using the
 * ASTM D341 Walther double-logarithmic equation:
 * log10(log10(nu + 0.7)) = A - B * log10(T + 273.15)
 */
export function calculateViscosityAtTemp(
  vg: number,
  tempC: number,
  baseType: 'mineral' | 'synthetic' | 'food-grade' = 'mineral'
): number {
  const clampedTempC = Math.max(-10, Math.min(150, tempC));
  const nu40 = vg;
  // Synthetic PAO has higher Viscosity Index (~145) than standard mineral oil (~98)
  const nu100 =
    baseType === 'synthetic'
      ? 0.225 * Math.pow(nu40, 0.84)
      : 0.175 * Math.pow(nu40, 0.835);

  const nuT = astmD341ViscosityAtTemp(cToK(clampedTempC), nu40, nu100);
  return Math.max(1.0, Math.round(nuT * 10) / 10);
}

/**
 * Computes falling ball Stokes descent time in seconds for the 180 mm viscometer gate span.
 * Physics: v_t = (2 · r² · (ρ_s - ρ_f) · g) / (9 · μ), t = L / v_t
 * Uses a 1.0 mm (r = 0.5 mm) bearing steel sphere (ρ_s = 7850 kg/m³) in industrial oil (ρ_f = 870 kg/m³).
 */
export function computeFallingBallTime(nuCst: number): {
  physicsTimeSec: number;
  animationDurationSec: number;
} {
  const fluidDensityKgM3 = 870;
  const dynamicViscosityPas = fluidDensityKgM3 * cStToM2s(Math.max(0.5, nuCst));
  const terminalVelocityMps = stokesTerminalVelocity(
    0.0005,
    7850,
    fluidDensityKgM3,
    dynamicViscosityPas
  );
  const gateDistanceM = 0.18;
  const physicsTimeSec = Math.max(
    0.05,
    Math.round((gateDistanceM / terminalVelocityMps) * 100) / 100
  );
  // Scale animation duration to visually pleasing 0.6s to 8.0s range
  // using a logarithmic compression
  const norm = Math.log10(Math.max(1, nuCst)) / Math.log10(2500); // 0 (1 cSt) to 1 (2500 cSt)
  const animationDurationSec = Math.max(0.6, Math.min(8.0, 0.6 + norm * 7.4));
  return { physicsTimeSec, animationDurationSec };
}

// -------------------------------------------------------------
// MODE 2: GREASE TYPES, NLGI GRADES & COMPATIBILITY
// -------------------------------------------------------------

export type NlgiGradeId = '00' | '0' | '1' | '2' | '3';

export interface NlgiGrade {
  grade: NlgiGradeId;
  workedPenetrationRange: [number, number]; // mm/10
  workedPenetrationMid: number; // mm/10
  textureDescription: string;
  foodAnalogy: string;
  commonApplications: string;
  gaugePercent: number; // 0 (firm) to 100 (fluid)
}

export const NLGI_GRADES: NlgiGrade[] = [
  {
    grade: '00',
    workedPenetrationRange: [400, 430],
    workedPenetrationMid: 415,
    textureDescription: 'Semi-fluid / Pourable',
    foodAnalogy: 'Applesauce or thick soup',
    commonApplications: 'Centralized plant lubrication systems, leaky enclosed gearboxes, truck autolube',
    gaugePercent: 95,
  },
  {
    grade: '0',
    workedPenetrationRange: [355, 385],
    workedPenetrationMid: 370,
    textureDescription: 'Very Soft',
    foodAnalogy: 'Brown mustard',
    commonApplications: 'Cold climate outdoor machinery, centralized automatic dispensers with narrow tubing',
    gaugePercent: 78,
  },
  {
    grade: '1',
    workedPenetrationRange: [310, 340],
    workedPenetrationMid: 325,
    textureDescription: 'Soft',
    foodAnalogy: 'Tomato paste / Ketchup',
    commonApplications: 'Heavy duty low-temperature bearings, long-distance grease piping, mobile construction',
    gaugePercent: 60,
  },
  {
    grade: '2',
    workedPenetrationRange: [265, 295],
    workedPenetrationMid: 280,
    textureDescription: 'Normal / Buttery (Universal Standard)',
    foodAnalogy: 'Smooth peanut butter',
    commonApplications: 'Universal industrial rolling element bearings (electric motors, pumps, fans, pillow blocks - 90% of all greases)',
    gaugePercent: 40,
  },
  {
    grade: '3',
    workedPenetrationRange: [220, 250],
    workedPenetrationMid: 235,
    textureDescription: 'Firm / Solid',
    foodAnalogy: 'Vegetable shortening / Cold butter',
    commonApplications: 'Vertical shaft bearings (prevents grease slump), vibrating screens, extreme vibration machinery',
    gaugePercent: 20,
  },
];

export type ThickenerId =
  | 'lithium-complex'
  | 'polyurea'
  | 'calcium-sulfonate'
  | 'aluminum-complex'
  | 'bentone-clay';

export interface Thickener {
  id: ThickenerId;
  name: string;
  category: 'soap' | 'complex-soap' | 'non-soap-organic' | 'non-soap-inorganic';
  droppingPointC: number | 'Non-Melting';
  maxContinuousTempC: number;
  waterWashoutResistance: 'Fair' | 'Good' | 'Very Good' | 'Outstanding';
  mechanicalStability: 'Fair' | 'Good' | 'Very Good' | 'Outstanding';
  colorHex: string;
  typicalUse: string;
  description: {
    en: string;
    id: string;
    ja: string;
  };
}

export const THICKENERS: Thickener[] = [
  {
    id: 'lithium-complex',
    name: 'Lithium Complex',
    category: 'complex-soap',
    droppingPointC: 260,
    maxContinuousTempC: 150,
    waterWashoutResistance: 'Good',
    mechanicalStability: 'Very Good',
    colorHex: '#f59e0b', // warm amber
    typicalUse: 'Multi-purpose industrial plant grease, rolling element bearings, automotive chassis',
    description: {
      en: 'The global industrial workhorse. Complexed with a dibasic organic acid to elevate the dropping point to 260°C while maintaining excellent shear stability and multi-purpose adaptability.',
      id: 'Standar grease industri global serbaguna. Dikomplekskan dengan asam organik dibasa untuk menaikkan titik leleh hingga 260°C dengan stabilitas geser mekanis yang prima.',
      ja: '世界的な万能産業用グリースの標準。二塩基酸との複合石けん化により滴点を260°Cまで高め、優れた機械的せん断安定性と多目的適応性を実現。',
    },
  },
  {
    id: 'polyurea',
    name: 'Polyurea (Non-Soap)',
    category: 'non-soap-organic',
    droppingPointC: 260,
    maxContinuousTempC: 175,
    waterWashoutResistance: 'Very Good',
    mechanicalStability: 'Outstanding',
    colorHex: '#3b82f6', // bright blue
    typicalUse: 'Sealed-for-life electric motor bearings, high-temperature fans, continuous steel casters',
    description: {
      en: 'Ashless synthetic organic thickener containing urea linkages. Exceptional oxidative longevity at elevated temperatures makes it the OEM choice for factory-sealed electric motor bearings.',
      id: 'Pengental organik sintetis bebas abu dengan gugus urea. Umur oksidasi sangat panjang pada suhu tinggi menjadikannya pilihan standar pabrikan untuk motor listrik sealed-for-life.',
      ja: '尿素結合（ウレア基）を持つ有機無灰系増ちょう剤。高温下での卓越した酸化寿命を誇り、密閉型電動機（モーター）軸受の純正充填グリースとして業界標準。',
    },
  },
  {
    id: 'calcium-sulfonate',
    name: 'Calcium Sulfonate Complex',
    category: 'complex-soap',
    droppingPointC: 300,
    maxContinuousTempC: 180,
    waterWashoutResistance: 'Outstanding',
    mechanicalStability: 'Outstanding',
    colorHex: '#991b1b', // rich dark crimson
    typicalUse: 'Steel mills, paper machines, mining shovels, offshore marine applications under heavy water & shock loads',
    description: {
      en: 'Inherently extreme-pressure thickener structure with calcite crystal platelets. Delivers unmatched load-carrying capacity (4-Ball EP weld load > 600 kg) and rust prevention even in salt water.',
      id: 'Struktur kristal kalsit alami yang memiliki kemampuan menahan beban ekstrem (EP) bawaan dan anti-karat luar biasa bahkan pada paparan air laut dan pabrik baja basah.',
      ja: 'カルサイト微小結晶構造により、添加剤なしでも極圧性（4球EP融着荷重600kg以上）と防錆性を発揮。製鉄所や製紙工場の多湿・高荷重設備に最適。',
    },
  },
  {
    id: 'aluminum-complex',
    name: 'Aluminum Complex',
    category: 'complex-soap',
    droppingPointC: 245,
    maxContinuousTempC: 140,
    waterWashoutResistance: 'Outstanding',
    mechanicalStability: 'Good',
    colorHex: '#10b981', // translucent emerald
    typicalUse: 'Food processing plants (NSF H1), marine winches, canning machines, textile equipment',
    description: {
      en: 'Renowned for supreme water washout resistance and smooth, buttery consistency. Widely formulated with pharmaceutical white oils for NSF H1 certified food-grade lubricating greases.',
      id: 'Terkenal akan ketahanan superior terhadap semprotan air dan tekstur lembut. Paling banyak digunakan bersama oli putih untuk grease food-grade bersertifikat NSF H1.',
      ja: '卓越した耐水洗水性と滑らかなペースト状組織が特長。高純度流動パラフィンと組み合わされ、食品工場向けNSF H1規格グリースとして広く採用。',
    },
  },
  {
    id: 'bentone-clay',
    name: 'Bentone Clay (Non-Melting)',
    category: 'non-soap-inorganic',
    droppingPointC: 'Non-Melting',
    maxContinuousTempC: 200,
    waterWashoutResistance: 'Fair',
    mechanicalStability: 'Fair',
    colorHex: '#451a03', // dark clay brown
    typicalUse: 'Kiln cars, asphalt paving machines, glass annealing furnaces, steel mill furnace roll bearings',
    description: {
      en: 'Inorganic organophilic bentonite clay thickener with no chemical melting point. It does not soften or liquify at extreme temperatures where soap-based greases melt, but lacks high shear stability.',
      id: 'Pengental tanah liat bentonit anorganik tanpa titik leleh (non-melting). Tidak akan mencair pada suhu oven/tungku di mana grease sabun biasa sudah meleleh habis.',
      ja: '無機ベントナイト粘土を用いた非溶融型（ドロップポイントなし）グリース。石けん基グリースが溶流する超高温キルン車軸受や加熱炉設備で威力を発揮。',
    },
  },
];

export type CompatibilityStatus = 'Compatible' | 'Caution' | 'Incompatible — Do Not Mix!';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  colorHex: string;
  badgeBg: string;
  consequence: {
    en: string;
    id: string;
    ja: string;
  };
  recommendation: {
    en: string;
    id: string;
    ja: string;
  };
}

/**
 * Technical Grease Compatibility Matrix based on ASTM D6185 / NLGI standards.
 */
export function checkGreaseCompatibility(
  t1: ThickenerId,
  t2: ThickenerId
): CompatibilityResult {
  if (t1 === t2) {
    return {
      status: 'Compatible',
      colorHex: '#16a34a',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      consequence: {
        en: 'Identical thickener chemistry. Full mechanical stability, dropping point, and oil-bleeding characteristics are completely preserved.',
        id: 'Kimia pengental identik. Stabilitas mekanis penuh, titik leleh, dan karakteristik pelepasan oli tetap terjaga sempurna.',
        ja: '同一の増ちょう剤組成です。完全な機械的せん断安定性、滴点、離油度が完全に維持されます。',
      },
      recommendation: {
        en: 'Safe to mix directly. Maintain standard relubrication intervals.',
        id: 'Aman untuk dicampur langsung. Lanjutkan jadwal pelumasan berkala standar.',
        ja: '直接混合しても安全です。標準の補給間隔を維持してください。',
      },
    };
  }

  // Set lookup
  const pair = [t1, t2].sort().join('+');

  // Lithium Complex + Polyurea
  if (pair === 'lithium-complex+polyurea') {
    return {
      status: 'Incompatible — Do Not Mix!',
      colorHex: '#dc2626',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      consequence: {
        en: 'Severe thickener collapse. The urea matrix ruptures the lithium soap fiber crystalline lattice, causing extreme softening, heavy base-oil bleeding, and rapid grease leakage out of the bearing cavity.',
        id: 'Kerusakan matriks pengental parah. Gugus urea merusak struktur serat sabun litium, menyebabkan pelunakan ekstrem, oli bocor keluar dari bantalan, dan risiko kegagalan bearing.',
        ja: '深刻な増ちょう剤構造破壊。ウレア基がリチウム石けんの繊維網を破壊し、著しい軟化と過剰な油分離（離油）を引き起こし、軸受外へグリースが流出します。',
      },
      recommendation: {
        en: 'DO NOT MIX! Completely disassemble and thoroughly degrease the bearing housing with solvent before introducing Polyurea grease.',
        id: 'JANGAN DICAMPUR! Bongkar total dan bersihkan rumah bantalan dengan pelarut sebelum mengisi grease Polyurea.',
        ja: '絶対に混合しないでください！軸受を完全に分解・脱脂洗浄した上で新しいグリースを充填してください。',
      },
    };
  }

  // Lithium Complex + Calcium Sulfonate
  if (pair === 'calcium-sulfonate+lithium-complex') {
    return {
      status: 'Caution',
      colorHex: '#d97706',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      consequence: {
        en: 'Marginally compatible at ambient temperatures, but dropping point may decrease by 20°C–40°C and oil bleed rates increase under high mechanical shear.',
        id: 'Dapat bercampur sebagian pada suhu ruangan, namun titik leleh turun 20°C–40°C dan pelepasan oli meningkat pada putaran tinggi.',
        ja: '常温では混合可能ですが、高温下で滴点が20°C〜40°C低下し、高せん断時に離油度が増加するリスクがあります。',
      },
      recommendation: {
        en: 'Perform thorough grease purging: pump new grease until clean fresh color discharges from purge port, and shorten initial relubrication intervals.',
        id: 'Lakukan pembersihan (purging) menyeluruh: pompa grease baru hingga warna segar keluar dari lubang buang, lalu perpendek jadwal awal.',
        ja: '十分なパージ（古いグリースが排出口から完全に押し出されるまで補給）を行い、初期の補給間隔を短縮してください。',
      },
    };
  }

  // Lithium Complex + Aluminum Complex
  if (pair === 'aluminum-complex+lithium-complex') {
    return {
      status: 'Incompatible — Do Not Mix!',
      colorHex: '#dc2626',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      consequence: {
        en: 'Chemical antagonism between aluminum and lithium cations disrupts soap micelle aggregation, causing drastic dropping point drop (<140°C) and fluid shear thinning.',
        id: 'Pertentangan kation aluminium dan litium merusak kisi misel sabun, menurunkan titik leleh secara drastis (<140°C) dan mengencerkan grease.',
        ja: 'アルミニウムとリチウムのカチオン反発によりミセル結合が崩壊。滴点が140°C未満まで急減し、運転熱で液状化します。',
      },
      recommendation: {
        en: 'Incompatible. Thorough flush and clean required before converting machine grease.',
        id: 'Tidak kompatibel. Wajib kuras dan bersihkan sebelum mengganti jenis grease mesin.',
        ja: '非互換です。グリース変更前にハウジングの完全フラッシングと清掃が必要です。',
      },
    };
  }

  // Bentone Clay + ANY soap or complex
  if (t1 === 'bentone-clay' || t2 === 'bentone-clay') {
    return {
      status: 'Incompatible — Do Not Mix!',
      colorHex: '#dc2626',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      consequence: {
        en: 'Inorganic clay platelets rely on electrostatic surface gelation. Organic soaps and polar additives destabilize clay dispersion, causing the clay to precipitate and form rock-hard abrasive caking!',
        id: 'Tanah liat bentonit mengandalkan gelasi elektrostatik. Sabun organik merusak dispersi tanah liat, menyebabkan lempung mengendap dan mengeras menjadi kerak keras abrasif!',
        ja: 'ベントナイト粘土の静電ゲル構造が有機金属石けんによって凝集沈殿。基油が完全に抜け、固い砥粒状の固着カスに変質して軸受を焼付き破損させます。',
      },
      recommendation: {
        en: 'NEVER MIX bentone clay with soap-based greases! Requires complete mechanical teardown and ultrasonic solvent washing.',
        id: 'JANGAN PERNAH MENCAMPUR grease clay dengan grease sabun! Perlu pembersihan mekanis tuntas dengan pelarut.',
        ja: '粘土系（ベントン）と石けん系は絶対に混合厳禁！完全な分解洗浄が不可欠です。',
      },
    };
  }

  // Calcium Sulfonate + Polyurea
  if (pair === 'calcium-sulfonate+polyurea') {
    return {
      status: 'Caution',
      colorHex: '#d97706',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      consequence: {
        en: 'Formulation-dependent compatibility. Some polyurea derivatives cause significant grease hardening (consistency climbs from NLGI 2 to NLGI 3+), restricting lubricant flow into the raceways.',
        id: 'Kompatibilitas bergantung formula spesifik. Sebagian turunan polyurea menyebabkan pengerasan grease (dari NLGI 2 menjadi NLGI 3+) sehingga menghambat aliran pelumas.',
        ja: '配合により適合性が分かれます。一部のウレアグリースは著しい硬化（ちょう度がNLGI 2から3以上へ上昇）を引き起こし、軌道面への給脂不良を招きます。',
      },
      recommendation: {
        en: 'Consult grease supplier lab compatibility test (ASTM D6185). If unknown, perform a comprehensive grease purge under monitoring.',
        id: 'Konsultasikan uji laboratorium ASTM D6185. Jika belum pasti, lakukan purge grease penuh dengan pemantauan getaran.',
        ja: 'メーカーの適合性試験データ（ASTM D6185）を確認してください。不明な場合は全量パージを実施してください。',
      },
    };
  }

  // Aluminum Complex + Polyurea
  if (pair === 'aluminum-complex+polyurea') {
    return {
      status: 'Incompatible — Do Not Mix!',
      colorHex: '#dc2626',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      consequence: {
        en: 'Rapid structural destabilization. Mixture undergoes progressive softening and loses cohesive yield strength under bearing rotation.',
        id: 'Destabilisasi struktur cepat. Campuran melunak drastis dan kehilangan kekuatan luluh kohesif saat bantalan berputar.',
        ja: '急速な構造崩壊。混合物は著しく軟化し、軸受回転時のせん断に耐えられず飛散します。',
      },
      recommendation: {
        en: 'Incompatible. Thorough purge and flush mandatory before conversion.',
        id: 'Tidak kompatibel. Wajib kuras total sebelum pergantian jenis pelumas.',
        ja: '非互換です。グリース切り替え前の徹底的なパージ・洗浄が必須です。',
      },
    };
  }

  // Aluminum Complex + Calcium Sulfonate
  if (pair === 'aluminum-complex+calcium-sulfonate') {
    return {
      status: 'Incompatible — Do Not Mix!',
      colorHex: '#dc2626',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      consequence: {
        en: 'Thickener cross-reaction impairs calcium carbonate platelet dispersion, degrading extreme-pressure capability and inducing rapid oil separation.',
        id: 'Reaksi silang pengental merusak dispersi kristal kalsium karbonat, menurunkan kemampuan beban EP dan memicu pelepasan oli berlebih.',
        ja: '増ちょう剤間の化学干渉により炭酸カルシウム結晶の分散が破壊され、極圧性能が失われ激しい離油が発生します。',
      },
      recommendation: {
        en: 'Incompatible. Clean bearing housing completely prior to switching thickeners.',
        id: 'Tidak kompatibel. Bersihkan rumah bantalan tuntas sebelum ganti grease.',
        ja: '非互換です。充填前にハウジング内を完全清掃してください。',
      },
    };
  }

  return {
    status: 'Incompatible — Do Not Mix!',
    colorHex: '#dc2626',
    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    consequence: {
      en: 'Incompatible thickener combinations degrade lubricating film thickness and thermal resistance.',
      id: 'Kombinasi pengental tidak kompatibel merusak ketebalan film pelumas dan stabilitas termal.',
      ja: '非互換な増ちょう剤の混合は油膜形成能力と耐熱性を著しく損ないます。',
    },
    recommendation: {
      en: 'Do not mix. Purge existing grease completely.',
      id: 'Jangan campur. Bersihkan grease lama hingga habis.',
      ja: '混合を避け、既存グリースを全量パージしてください。',
    },
  };
}
