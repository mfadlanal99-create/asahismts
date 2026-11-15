// Bearing Basics Data, Dimensions, Specifications & Application Matcher

export type BearingTypeId =
  | '6205'
  | '7205'
  | 'NU205'
  | '30205'
  | '22205'
  | '51105'
  | 'UCP205';

export type SealShieldType = 'open' | '2z' | '2rs';

export interface BearingSpec {
  id: BearingTypeId;
  name: string;
  nameId: string;
  nameJa: string;
  isoCode: string;
  category: string;
  categoryId: string;
  categoryJa: string;
  rollingElement:
    | 'deep_groove_ball'
    | 'angular_ball'
    | 'cylindrical_roller'
    | 'tapered_roller'
    | 'spherical_roller'
    | 'thrust_ball'
    | 'pillow_block_ball';
  boreMm: number;
  outerDiameterMm: number;
  widthMm: number;
  contactAngleDeg: number;
  dynamicLoadCrKn: number;
  staticLoadC0Kn: number;
  limitingSpeedGreaseRpm: number;
  limitingSpeedOilRpm: number;
  radialCapacity: 'Excellent' | 'Good' | 'Moderate' | 'Zero';
  axialCapacity:
    | 'High (Both Directions)'
    | 'Moderate (Both Directions)'
    | 'High (Single Direction)'
    | 'Pure Axial Only (Zero Radial!)'
    | 'Negligible (Axial Float)'
    | 'Low';
  misalignmentTolerance: string;
  misalignmentToleranceId: string;
  misalignmentToleranceJa: string;
  supportedSeals: SealShieldType[];
  description: string;
  descriptionId: string;
  descriptionJa: string;
  typicalApplications: string[];
  keyAdvantages: string[];
  cautions: string[];
}

export const BEARING_SPECS: Record<BearingTypeId, BearingSpec> = {
  '6205': {
    id: '6205',
    name: 'Deep Groove Ball Bearing (6205)',
    nameId: 'Bantalan Bola Alur Dalam (6205)',
    nameJa: '深溝玉軸受 (6205)',
    isoCode: '6205',
    category: 'Radial Ball Bearing',
    categoryId: 'Bantalan Bola Radial',
    categoryJa: 'ラジアル玉軸受',
    rollingElement: 'deep_groove_ball',
    boreMm: 25,
    outerDiameterMm: 52,
    widthMm: 15,
    contactAngleDeg: 0,
    dynamicLoadCrKn: 14.8,
    staticLoadC0Kn: 7.8,
    limitingSpeedGreaseRpm: 15000,
    limitingSpeedOilRpm: 18000,
    radialCapacity: 'Good',
    axialCapacity: 'Moderate (Both Directions)',
    misalignmentTolerance: '2–10 arcmin (0.03°–0.16°)',
    misalignmentToleranceId: '2–10 menit busur (0.03°–0.16°)',
    misalignmentToleranceJa: '2〜10分（0.03°〜0.16°）',
    supportedSeals: ['open', '2z', '2rs'],
    description:
      'The most versatile and ubiquitous rolling bearing in industrial machinery. Features deep unbroken raceway grooves that sustain moderate radial loads and bi-directional axial thrust loads at high rotational speeds with minimal frictional resistance.',
    descriptionId:
      'Bantalan gelinding paling serbaguna dan umum di dunia industri. Memiliki alur raceway dalam tanpa sambungan yang mampu menahan beban radial sedang serta beban aksial dua arah pada kecepatan putar tinggi dengan gesekan minimal.',
    descriptionJa:
      '産業機械で最も広く使用される標準的な転がり軸受。継ぎ目のない深い軌道溝により、低摩擦で高速回転に対応し、中程度のラジアル荷重と両方向のスラスト荷重を支持します。',
    typicalApplications: [
      'Standard 3-phase electric motors (0.75–4 kW)',
      'Centrifugal clean water pumps',
      'HVAC blowers and industrial fans',
      'Conveyor drive pulleys and gearboxes',
    ],
    keyAdvantages: [
      'Low friction torque and high speed capability',
      'Simple, robust, and cost-effective',
      'Available pre-greased for life with metal shields or rubber seals',
    ],
    cautions: [
      'Cannot accommodate significant shaft deflection or angular misalignment',
      'Sensitive to severe shock loads compared to roller bearings',
    ],
  },
  '7205': {
    id: '7205',
    name: 'Angular Contact Ball Bearing (7205)',
    nameId: 'Bantalan Bola Kontak Sudut (7205)',
    nameJa: 'アンギュラ玉軸受 (7205)',
    isoCode: '7205-B (40°)',
    category: 'Angular Contact Ball Bearing',
    categoryId: 'Bantalan Bola Kontak Sudut',
    categoryJa: 'アンギュラ玉軸受',
    rollingElement: 'angular_ball',
    boreMm: 25,
    outerDiameterMm: 52,
    widthMm: 15,
    contactAngleDeg: 40,
    dynamicLoadCrKn: 17.3,
    staticLoadC0Kn: 10.2,
    limitingSpeedGreaseRpm: 14000,
    limitingSpeedOilRpm: 19000,
    radialCapacity: 'Good',
    axialCapacity: 'High (Single Direction)',
    misalignmentTolerance: '2 arcmin (0.03° max)',
    misalignmentToleranceId: '2 menit busur (maks 0.03°)',
    misalignmentToleranceJa: '2分（最大0.03°）',
    supportedSeals: ['open', '2z', '2rs'],
    description:
      'Designed with asymmetrical raceway shoulders defining a distinct contact angle (typically 40°). Transmits combined high radial and substantial unidirectional thrust loads. Usually mounted in back-to-back (DB) or face-to-face (DF) paired arrangements.',
    descriptionId:
      'Dirancang dengan bahu raceway asimetris yang membentuk sudut kontak spesifik (umumnya 40°). Mampu meneruskan kombinasi beban radial tinggi dan dorongan aksial satu arah yang besar. Biasanya dipasang berpasangan (DB atau DF).',
    descriptionJa:
      '内外輪に傾斜した接触角（通常40°）を持つ非対称軌道肩部を備え、大きな一方向スラスト荷重とラジアル荷重の複合負荷を高精度に支えます。一般にDBまたはDFの対向対で使用されます。',
    typicalApplications: [
      'CNC machine tool high-speed milling spindles',
      'High-pressure multi-stage centrifugal pumps',
      'Industrial worm and helical gearboxes',
      'Automotive steering knuckles and wheel hubs',
    ],
    keyAdvantages: [
      'Superior axial rigidity and high-speed running accuracy',
      'Adjustable internal clearance via preload clamping',
      'High capacity for combined radial and thrust vectors',
    ],
    cautions: [
      'Cannot support thrust in the reverse direction (must be preloaded or paired)',
      'Extremely sensitive to angular shaft misalignment',
    ],
  },
  'NU205': {
    id: 'NU205',
    name: 'Cylindrical Roller Bearing (NU205)',
    nameId: 'Bantalan Rol Silinder (NU205)',
    nameJa: '円筒ころ軸受 (NU205)',
    isoCode: 'NU205',
    category: 'Radial Roller Bearing',
    categoryId: 'Bantalan Rol Radial',
    categoryJa: '円筒ころ軸受',
    rollingElement: 'cylindrical_roller',
    boreMm: 25,
    outerDiameterMm: 52,
    widthMm: 15,
    contactAngleDeg: 0,
    dynamicLoadCrKn: 28.5,
    staticLoadC0Kn: 24.0,
    limitingSpeedGreaseRpm: 13000,
    limitingSpeedOilRpm: 16000,
    radialCapacity: 'Excellent',
    axialCapacity: 'Negligible (Axial Float)',
    misalignmentTolerance: '3–4 arcmin (0.05°–0.07°)',
    misalignmentToleranceId: '3–4 menit busur (0.05°–0.07°)',
    misalignmentToleranceJa: '3〜4分（0.05°〜0.07°）',
    supportedSeals: ['open'],
    description:
      'Employs modified cylindrical rollers in modified line contact with raceways. In the NU design, the outer ring has two integral guide ribs while the inner ring is ribless, allowing frictionless axial displacement (free float) to absorb shaft thermal growth.',
    descriptionId:
      'Menggunakan rol silindris dengan kontak garis terhadap raceway. Pada desain tipe NU, cincin luar memiliki dua bibir penuntun terpadu sementara cincin dalam tanpa bibir, memungkinkan pergeseran aksial bebas gesekan untuk ekspansi termal poros.',
    descriptionJa:
      '円筒ころが軌道面と線接触するため、極めて高いラジアル耐荷重を誇ります。NU形は外輪両つば・内輪つば無し構造で、軸の熱膨張による軸方向変位を抵抗なく吸収する自由側軸受として最適です。',
    typicalApplications: [
      'Floating position in high-power electric traction motors',
      'Heavy-duty industrial planetary and helical gearboxes',
      'Steel rolling mills and paper processing calenders',
      'Reciprocating compressor crankshaft mains',
    ],
    keyAdvantages: [
      'Double the radial load capacity of equivalent-sized ball bearings',
      'Accommodates thermal shaft expansion without inducing axial stress',
      'Separable rings facilitate convenient press-fit mounting',
    ],
    cautions: [
      'NU type cannot carry ANY sustained axial thrust load!',
      'Requires precise shaft alignment to prevent edge loading on rollers',
    ],
  },
  '30205': {
    id: '30205',
    name: 'Tapered Roller Bearing (30205)',
    nameId: 'Bantalan Rol Konis / Tirus (30205)',
    nameJa: '円すいころ軸受 (30205)',
    isoCode: '30205',
    category: 'Tapered Roller Bearing',
    categoryId: 'Bantalan Rol Tirus',
    categoryJa: '円すいころ軸受',
    rollingElement: 'tapered_roller',
    boreMm: 25,
    outerDiameterMm: 52,
    widthMm: 16.25,
    contactAngleDeg: 14,
    dynamicLoadCrKn: 32.5,
    staticLoadC0Kn: 33.5,
    limitingSpeedGreaseRpm: 9500,
    limitingSpeedOilRpm: 13000,
    radialCapacity: 'Excellent',
    axialCapacity: 'High (Single Direction)',
    misalignmentTolerance: '1–2 arcmin (0.02°–0.03°)',
    misalignmentToleranceId: '1–2 menit busur (0.02°–0.03°)',
    misalignmentToleranceJa: '1〜2分（0.02°〜0.03°）',
    supportedSeals: ['open'],
    description:
      'Features conical rollers guided by a high back-rib on the inner cone. The apexes of all tapered surfaces converge at a single common point on the bearing centerline for true rolling motion. Transmits massive simultaneous radial and unidirectional thrust loads.',
    descriptionId:
      'Memiliki rol kerucut yang dipandu oleh bibir penahan pada cone dalam. Garis proyeksi semua permukaan tirus bertemu pada satu titik tunggal di sumbu poros sehingga menghasilkan gerak gelinding murni. Mampu menahan kombinasi beban radial dan aksial yang sangat besar.',
    descriptionJa:
      '円すい台形のころと内外輪軌道面が一点で頂点を結ぶ幾何学的設計により、純粋な転がり運動を実現。極めて重大なラジアル荷重と一方向の重スラスト荷重を同時に強力支持します。',
    typicalApplications: [
      'Automotive truck and trailer wheel hub spindles',
      'Differential hypoid pinion and ring gear shafts',
      'Heavy reduction gearboxes and crane sheaves',
      'Mining and quarry crushing conveyor drives',
    ],
    keyAdvantages: [
      'Immense radial and thrust capacity under shock load conditions',
      'Adjustable internal clearance and preload during installation',
      'Separable cup (outer ring) and cone (inner ring + rollers) assembly',
    ],
    cautions: [
      'Must always be mounted in opposed pairs or double-row units',
      'Very intolerant to shaft deflection or housing misbore',
    ],
  },
  '22205': {
    id: '22205',
    name: 'Spherical Roller Bearing (22205)',
    nameId: 'Bantalan Rol Sferikal / Goyang (22205)',
    nameJa: '自動調心ころ軸受 (22205)',
    isoCode: '22205-E (CC)',
    category: 'Self-Aligning Roller Bearing',
    categoryId: 'Bantalan Rol Goyang Mandiri',
    categoryJa: '自動調心ころ軸受',
    rollingElement: 'spherical_roller',
    boreMm: 25,
    outerDiameterMm: 52,
    widthMm: 18,
    contactAngleDeg: 12,
    dynamicLoadCrKn: 49.0,
    staticLoadC0Kn: 44.0,
    limitingSpeedGreaseRpm: 8500,
    limitingSpeedOilRpm: 11000,
    radialCapacity: 'Excellent',
    axialCapacity: 'Moderate (Both Directions)',
    misalignmentTolerance: '1.5°–2.5° (Self-Aligning)',
    misalignmentToleranceId: '1.5°–2.5° (Menyelaras Sendiri)',
    misalignmentToleranceJa: '1.5°〜2.5°（自動調心）',
    supportedSeals: ['open', '2rs'],
    description:
      'Contains two rows of barrel-shaped symmetrical rollers running inside a continuous spherical outer ring raceway. Self-aligns dynamically up to 2.5° without increasing friction or stressing internal components, making it impervious to shaft bending or frame deflection.',
    descriptionId:
      'Memiliki dua baris rol berbentuk tong simetris yang berputar dalam raceway cincin luar berbentuk bola utuh. Mampu menyelaraskan diri secara dinamis hingga 2.5° tanpa menambah gesekan internal, sangat tahan terhadap lenturan poros dan defleksi rangka.',
    descriptionJa:
      '外輪軌道面が完全な球面状で、2列のたる形対称ころを配置。軸のたわみや取付誤差による最大2.5°の内外輪傾きを完全に自動吸収しながら、超重ラジアル荷重と両方向スラストを確実に支えます。',
    typicalApplications: [
      'Vibrating screens and asphalt compaction rollers',
      'Long-span belt conveyor head pulleys with shaft deflection',
      'Cement ball mills, crushers, and heavy jaw pulverizers',
      'Wind turbine main rotor shafts and continuous casters',
    ],
    keyAdvantages: [
      'Highest radial load rating of all rolling bearing types',
      'Dynamically compensates for severe shaft flexure and structural sag',
      'Double row design handles moderate bidirectional thrust',
    ],
    cautions: [
      'Higher frictional heat generation at maximum speeds',
      'Requires minimum load to prevent roller skidding at high velocity',
    ],
  },
  '51105': {
    id: '51105',
    name: 'Thrust Ball Bearing (51105)',
    nameId: 'Bantalan Bola Dorong / Aksial (51105)',
    nameJa: 'スラスト玉軸受 (51105)',
    isoCode: '51105',
    category: 'Pure Thrust Bearing',
    categoryId: 'Bantalan Dorong Murni',
    categoryJa: 'スラスト玉軸受',
    rollingElement: 'thrust_ball',
    boreMm: 25,
    outerDiameterMm: 42,
    widthMm: 11,
    contactAngleDeg: 90,
    dynamicLoadCrKn: 0.0,
    staticLoadC0Kn: 29.0,
    limitingSpeedGreaseRpm: 6000,
    limitingSpeedOilRpm: 9000,
    radialCapacity: 'Zero',
    axialCapacity: 'Pure Axial Only (Zero Radial!)',
    misalignmentTolerance: '0° (Must be strictly flat & parallel)',
    misalignmentToleranceId: '0° (Wajib benar-benar datar & sejajar)',
    misalignmentToleranceJa: '0°（完全な直角度・平行度必須）',
    supportedSeals: ['open'],
    description:
      'Composed of a shaft washer with a tight bore, a housing washer with a loose bore, and a brass/steel ball cage assembly operating at a 90° contact angle. Specifically engineered to take pure axial thrust loads and CANNOT carry any radial load whatsoever.',
    descriptionId:
      'Terdiri dari washer poros dengan lubang presisi, washer rumah dengan lubang longgar, dan sangkar bola dengan sudut kontak 90°. Direkayasa khusus untuk memikul gaya dorong aksial murni dan TIDAK BISA memikul beban radial sama sekali.',
    descriptionJa:
      '接触角90°で軸軌道盤、ハウジング軌道盤、保持器付き玉から構成。純粋な一方向スラスト荷重専用に設計されており、ラジアル荷重は一切負荷できません（負荷すると即座に破損します）。',
    typicalApplications: [
      'Crane swivel hooks and heavy lifting vertical pivots',
      'Vertical drill press and lathe tailstock chuck spindles',
      'Manual screw jacks and hydraulic valve stems',
      'Indexing rotary turn-tables and turntable platforms',
    ],
    keyAdvantages: [
      'Compact axial profile for high vertical thrust loads',
      'Completely separable components for straightforward installation',
      'High axial stiffness under constant vertical load',
    ],
    cautions: [
      'FATAL: Any radial force will immediately jam or derail the balls!',
      'Centrifugal forces at high RPM throw lubrication outward and cause ball sliding',
    ],
  },
  'UCP205': {
    id: 'UCP205',
    name: 'Pillow Block Bearing Unit (UCP205)',
    nameId: 'Unit Bantalan Rumah Pillow Block (UCP205)',
    nameJa: 'ピローブロック形ユニット (UCP205)',
    isoCode: 'UCP205 (P205 + UC205)',
    category: 'Mounted Bearing Unit',
    categoryId: 'Unit Bantalan Berumah',
    categoryJa: 'ベアリングユニット',
    rollingElement: 'pillow_block_ball',
    boreMm: 25,
    outerDiameterMm: 71,
    widthMm: 34.1,
    contactAngleDeg: 0,
    dynamicLoadCrKn: 14.0,
    staticLoadC0Kn: 7.85,
    limitingSpeedGreaseRpm: 5000,
    limitingSpeedOilRpm: 5000,
    radialCapacity: 'Good',
    axialCapacity: 'Low',
    misalignmentTolerance: '±3° (Static alignment in housing socket)',
    misalignmentToleranceId: '±3° (Penyelarasan statis pada mangkok rumah)',
    misalignmentToleranceJa: '±3°（球面座による静的調心）',
    supportedSeals: ['2rs'],
    description:
      'A rugged cast iron flanged base housing (P205) enclosing a pre-lubricated insert ball bearing (UC205) with a spherical outer ring diameter. Secures directly to transmission shafts via two grub set screws on an extended inner ring.',
    descriptionId:
      'Unit bantalan rumah besi cor berkaki (P205) yang memuat insert ball bearing (UC205) dengan diameter luar berbentuk bola cembung. Mengunci langsung ke poros transmisi menggunakan dua baut set skrup pada cincin dalam yang memanjang.',
    descriptionJa:
      '剛性の高い鋳鉄製ピロー形軸受箱（P205）に球状外径を持つ給油式深溝玉軸受（UC205）を組み込んだ完成ユニット。内輪の2本のとめねじにより、一般公差の伝動軸へ直接ボルトオンで簡単に固定できます。',
    typicalApplications: [
      'Belt, roller, and slat conveyor idler shafts',
      'Agricultural harvesters, seeders, and grain augers',
      'Food processing packaging lines and industrial fans',
      'Bottling conveyors and textile drying ovens',
    ],
    keyAdvantages: [
      'Bolt-on mounting directly onto machinery structural frames',
      'Accommodates structural misalignments during equipment assembly',
      'Equipped with grease zerk nipple for re-greasing in harsh service',
    ],
    cautions: [
      'Limited speed capability compared to precision machined housings',
      'Set screws can mark or notch soft carbon steel shafts',
    ],
  },
};

export interface SealShieldSpec {
  id: SealShieldType;
  name: string;
  nameId: string;
  nameJa: string;
  dragTorqueFactor: number;
  maxSpeedFactor: number;
  dustProtectionRating: 'Poor' | 'Good' | 'Excellent';
  waterProtectionRating: 'None' | 'Splash-Proof' | 'Washdown Sealed';
  description: string;
  descriptionId: string;
  descriptionJa: string;
  relubricationNeeded: boolean;
}

export const SEAL_SHIELD_SPECS: Record<SealShieldType, SealShieldSpec> = {
  open: {
    id: 'open',
    name: 'Open (No Shield / No Seal)',
    nameId: 'Terbuka (Tanpa Pelindung / Seal)',
    nameJa: '開放形 (オープン)',
    dragTorqueFactor: 1.0,
    maxSpeedFactor: 1.0,
    dustProtectionRating: 'Poor',
    waterProtectionRating: 'None',
    description:
      'Bare bearing with exposed balls and cage. Generates lowest frictional drag and allows maximum catalog RPM. Ideal for clean enclosed gearboxes where circulating oil or clean grease bath supplies continuous lubrication.',
    descriptionId:
      'Bantalan telanjang tanpa penutup pelindung. Gesekan paling rendah dan batas kecepatan RPM paling tinggi. Ideal untuk gearbox tertutup dengan sirkulasi oli bersih.',
    descriptionJa:
      'シールドやシールを持たない標準形状。摩擦トルクが最小で最高回転速度を発揮します。オイル潤滑や油浴式クローズドギヤボックス内に最適です。',
    relubricationNeeded: true,
  },
  '2z': {
    id: '2z',
    name: '2Z (Dual Pressed-Steel Shields)',
    nameId: '2Z (Pelindung Plat Baja Ganda)',
    nameJa: '2Z (両側鋼板シールド形)',
    dragTorqueFactor: 1.02,
    maxSpeedFactor: 0.98,
    dustProtectionRating: 'Good',
    waterProtectionRating: 'None',
    description:
      'Non-contact pressed steel shields pressed into outer ring grooves on both sides. Keeps factory grease inside and prevents medium dust ingress with negligible added torque drag. Cannot seal against water or fine airborne dust.',
    descriptionId:
      'Pelindung plat baja tanpa kontak pada kedua sisi. Menahan gemuk pabrik di dalam dan menghalau kotoran kasar tanpa menambah gaya gesek. Tidak tahan terhadap percikan air atau debu halus.',
    descriptionJa:
      '外輪に固定された非接触の防じん鋼板シールドを両面に装備。工場封入グリースを保持し、粗い粉じんの侵入を防ぎつつ、開放形とほぼ同等の高速・低トルク回転を維持します。',
    relubricationNeeded: false,
  },
  '2rs': {
    id: '2rs',
    name: '2RS (Dual Nitrile Rubber Contact Seals)',
    nameId: '2RS (Seal Karet Kontak NBR Ganda)',
    nameJa: '2RS (両側ゴム接触シール形)',
    dragTorqueFactor: 1.28,
    maxSpeedFactor: 0.65,
    dustProtectionRating: 'Excellent',
    waterProtectionRating: 'Splash-Proof',
    description:
      'Synthetic nitrile rubber (NBR) reinforced with steel inserts, featuring flexible sealing lips rubbing against an inner ring groove. Provides superior barrier against washdown moisture and abrasive dust, but increases friction torque and limits top RPM.',
    descriptionId:
      'Seal karet nitril (NBR) dengan bibir kontak elastis yang menempel rapat pada lekukan cincin dalam. Sangat efektif menahan semprotan air, kelembaban, dan debu abrasif, namun menimbulkan hambatan gesek dan menurunkan batas kecepatan putar.',
    descriptionJa:
      '鋼板補強入りニトリルゴム（NBR）のリップが内輪シール溝に接触する構造。防じん・防水・グリース漏洩防止性能が極めて高く、屋外や湿潤・粉じん環境に最適ですが、接触摩擦により許容回転数が低下します。',
    relubricationNeeded: false,
  },
};

// Application Matcher Criteria & Logic
export type MatcherLoadProfile =
  | 'high_speed_light_radial'
  | 'heavy_radial_misaligned'
  | 'combined_heavy_thrust'
  | 'pure_axial_vertical'
  | 'heavy_shock_radial_float'
  | 'conveyor_bolted_frame';

export type MatcherEnvironment = 'clean_dry' | 'dusty_factory' | 'wet_washdown';

export interface MatcherResult {
  recommendedBearingId: BearingTypeId;
  recommendedSeal: SealShieldType;
  matchScorePct: number;
  reasonEn: string;
  reasonId: string;
  reasonJa: string;
  alternatives: BearingTypeId[];
}

export function evaluateApplicationMatch(
  load: MatcherLoadProfile,
  env: MatcherEnvironment
): MatcherResult {
  const defaultSeal: SealShieldType =
    env === 'wet_washdown' ? '2rs' : env === 'dusty_factory' ? '2z' : 'open';

  switch (load) {
    case 'high_speed_light_radial':
      return {
        recommendedBearingId: '6205',
        recommendedSeal: defaultSeal,
        matchScorePct: 98,
        reasonEn:
          'Deep Groove Ball Bearing (6205) delivers minimal rolling resistance and handles high RPM with light-to-moderate radial and light axial loads.',
        reasonId:
          'Bantalan Bola Alur Dalam (6205) memberikan gesekan terendah dan sangat ideal untuk RPM tinggi dengan beban radial ringan-sedang.',
        reasonJa:
          '深溝玉軸受（6205）は転がり抵抗が最も小さく、高速回転と軽〜中ラジアル荷重の組み合わせに最適です。',
        alternatives: ['7205', 'NU205'],
      };

    case 'heavy_radial_misaligned':
      return {
        recommendedBearingId: '22205',
        recommendedSeal: env === 'wet_washdown' ? '2rs' : 'open',
        matchScorePct: 96,
        reasonEn:
          'Spherical Roller Bearing (22205) features a spherical outer raceway that accommodates up to 2.5° shaft misalignment under massive radial shock loads.',
        reasonId:
          'Bantalan Rol Sferikal (22205) memiliki raceway sferikal yang mampu mentoleransi kelenturan poros hingga 2.5° di bawah beban kejut radial masif.',
        reasonJa:
          '自動調心ころ軸受（22205）は球面外輪軌道により最大2.5°の軸たわみ・調心誤差を自動吸収し、超重衝撃荷重に耐えます。',
        alternatives: ['NU205', 'UCP205'],
      };

    case 'combined_heavy_thrust':
      return {
        recommendedBearingId: '7205',
        recommendedSeal: defaultSeal,
        matchScorePct: 94,
        reasonEn:
          'Angular Contact Ball Bearing (7205) provides a 40° contact angle to resist heavy unidirectional axial thrust combined with radial force at high precision.',
        reasonId:
          'Bantalan Kontak Sudut (7205) memiliki sudut kontak 40° untuk menahan dorongan aksial searah yang berat dipadukan dengan gaya radial secara presisi.',
        reasonJa:
          'アンギュラ玉軸受（7205）は40°の接触角を持ち、強力な一方向スラスト荷重とラジアル荷重を高精度に同時に支えます。',
        alternatives: ['30205', '6205'],
      };

    case 'pure_axial_vertical':
      return {
        recommendedBearingId: '51105',
        recommendedSeal: 'open',
        matchScorePct: 99,
        reasonEn:
          'Thrust Ball Bearing (51105) is specifically dedicated to pure axial thrust (contact angle 90°). WARNING: It must not see ANY radial load!',
        reasonId:
          'Bantalan Bola Dorong (51105) khusus untuk memikul gaya dorong aksial murni (sudut kontak 90°). PERINGATAN: Tidak boleh menerima beban radial sama sekali!',
        reasonJa:
          'スラスト玉軸受（51105）は接触角90°の純スラスト専用軸受です。注意：ラジアル荷重は絶対に負荷しないでください！',
        alternatives: ['7205'],
      };

    case 'heavy_shock_radial_float':
      return {
        recommendedBearingId: 'NU205',
        recommendedSeal: 'open',
        matchScorePct: 95,
        reasonEn:
          'Cylindrical Roller Bearing (NU205) offers huge radial shock capacity and frictionless axial sliding for shaft thermal expansion.',
        reasonId:
          'Bantalan Rol Silinder (NU205) memberikan kapasitas beban radial masif dan kebebasan gerak aksial untuk pemuaian termal poros.',
        reasonJa:
          '円筒ころ軸受（NU205）は優れた耐衝撃ラジアル荷重を持ち、つば無し内輪により軸の熱膨張を摩擦なく逃がします。',
        alternatives: ['22205', '30205'],
      };

    case 'conveyor_bolted_frame':
      return {
        recommendedBearingId: 'UCP205',
        recommendedSeal: '2rs',
        matchScorePct: 97,
        reasonEn:
          'Pillow Block Unit (UCP205) allows quick bolt-down mounting onto structural channels or conveyor frames with set screw shaft locking.',
        reasonId:
          'Unit Pillow Block (UCP205) memungkinkan pemasangan baut cepat ke rangka konveyor struktural dengan penguncian baut set sekrup.',
        reasonJa:
          'ピロー形ユニット（UCP205）はフレームへのボルト固定が極めて容易で、とめねじによる軸固定と球面座調心機能を備えます。',
        alternatives: ['6205'],
      };
  }
}

