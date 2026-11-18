export type PartCategory =
  | 'Housing'
  | 'Rotating'
  | 'Bearing'
  | 'Seal'
  | 'Fastener';

export interface LocalizedText {
  en: string;
  id: string;
  ja: string;
}

export interface PartAppearance {
  baseHex: string;
  edgeHex: string;
  specularStrength: number;
  shininess: number;
}

export interface Machine3DPartSpec {
  id: string;
  bomNumber: number;
  name: LocalizedText;
  partCode: string;
  category: PartCategory;
  material: LocalizedText;
  functionSummary: LocalizedText;
  failureModes: LocalizedText;
  maintenanceSpec: LocalizedText;
  clearanceOrTorque: string;
  basePosition: [number, number, number];
  explodeVector: [number, number, number];
  explodeStage: 1 | 2 | 3;
  isHousing?: boolean;
  rotates?: boolean;
  appearance: PartAppearance;
}

export const MACHINE_INFO = {
  id: 'centrifugal-pump',
  title: {
    en: 'ANSI B73.1 / ISO 2858 End-Suction Centrifugal Process Pump',
    id: 'Pompa Sentrifugal Proses End-Suction ANSI B73.1 / ISO 2858',
    ja: 'ANSI B73.1 / ISO 2858 片吸込遠心プロセスポンプ',
  },
  subtitle: {
    en: 'Overhung back-pull-out process pump assembly — 10 interactive 3D parts',
    id: 'Rakitan pompa proses back-pull-out overhung — 10 komponen 3D interaktif',
    ja: 'オーバーハング・バックプルアウト構造 — 10点のインタラクティブ3D部品',
  },
};

export const PUMP_3D_PARTS: Machine3DPartSpec[] = [
  {
    id: 'volute-casing',
    bomNumber: 1,
    partCode: 'CAS-100',
    category: 'Housing',
    name: {
      en: 'Volute Pump Casing & Flanged Nozzles',
      id: 'Rumah Pompa Volute & Nosel Flens',
      ja: 'ボリュートケーシング＆フランジノズル',
    },
    material: {
      en: 'Cast Ductile Iron ASTM A395 / CF8M (316 SS)',
      id: 'Besi Cor Daktil ASTM A395 / Baja Tahan Karat CF8M (316 SS)',
      ja: 'ダクタイル鋳鉄 ASTM A395 / ステンレス鋼 CF8M (316 SS)',
    },
    functionSummary: {
      en: 'Collects high-velocity fluid discharged from the impeller and converts kinetic energy into static pressure head through an expanding spiral volute chamber.',
      id: 'Menampung fluida berkecepatan tinggi dari impeller dan mengubah energi kinetik menjadi tekanan statis melalui ruang spiral volute yang melebar.',
      ja: 'インペラから吐出された高速流体を捕集し、断面積が拡大する渦巻室（ボリュート）によって運動エネルギーを静圧ヘッドへ変換します。',
    },
    failureModes: {
      en: 'Cavitation pitting at cutwater tongue, erosion-corrosion thinning, nozzle pipe-strain cracking, and flange gasket blowouts.',
      id: 'Erosi kavitasi pada lidah cutwater, penipisan korosi-erosi, retak akibat beban pipa pada nosel, dan kebocoran gasket flens.',
      ja: 'タング部のキャビテーション壊食、エロージョン・コロージョン減肉、配管荷重によるノズル亀裂、フランジガスケット吹き抜け。',
    },
    maintenanceSpec: {
      en: 'Inspect volute cutwater thickness and wear-ring bore concentricity (< 0.05 mm). Leave casing bolted to process piping during back-pull-out maintenance.',
      id: 'Periksa ketebalan cutwater dan konsentrisitas lubang wear ring (< 0.05 mm). Casing dapat tetap terpasang pada pipa saat perawatan back-pull-out.',
      ja: 'ボリュート舌部肉厚およびウェアリング嵌合部の同軸度（< 0.05 mm）を点検。バックプルアウト点検時は配管を接続したまま分解可能。',
    },
    clearanceOrTorque: 'Casing Flange M16 Bolts: 120 N·m (Star Pattern)',
    basePosition: [-68, 0, 0],
    explodeVector: [-194, 0, 0],
    explodeStage: 1,
    isHousing: true,
    rotates: false,
    appearance: {
      baseHex: '#2563EB',
      edgeHex: '#93C5FD',
      specularStrength: 0.48,
      shininess: 26,
    },
  },
  {
    id: 'wear-ring',
    bomNumber: 2,
    partCode: 'WR-102',
    category: 'Seal',
    name: {
      en: 'Renewable Casing Wear Ring',
      id: 'Wear Ring Casing (Cincin Aus Dapat Diganti)',
      ja: '交換式ケーシングウェアリング',
    },
    material: {
      en: 'Aluminum Bronze (C95400) / Stellite-Faced 316 SS',
      id: 'Perunggu Aluminium (C95400) / 316 SS Berlapis Stellite',
      ja: 'アルミニウム青銅 (C95400) / ステライト肉盛 316 SS',
    },
    functionSummary: {
      en: 'Provides a sacrificial tight-clearance hydrodynamic restriction between high-pressure discharge volute and low-pressure impeller suction eye to limit internal recirculation.',
      id: 'Membentuk celah sempit pengorbanan antara sisi tekan tinggi volute dan sisi isap impeller untuk membatasi resirkulasi internal.',
      ja: '高圧の吐出ボリュート側と低圧の吸込口側の間に微小隙間を保ち、内部リーク（再循環損失）を抑える犠牲摩耗リングです。',
    },
    failureModes: {
      en: 'Abrasive particle scoring, adhesive galling after dry running, and excessive radial clearance (> 0.60 mm) causing sharp drop in head and efficiency.',
      id: 'Goresan partikel abrasif, galling akibat pompa berjalan kering, dan celah radial berlebih (> 0.60 mm) yang menurunkan head serta efisiensi.',
      ja: '異物噛み込みによる焼付き、空運転によるかじり、摩耗による隙間過大（> 0.60 mm）に伴う揚程・効率の低下。',
    },
    maintenanceSpec: {
      en: 'Measure bore ID vs. impeller hub OD in two orthogonal planes with a bore gauge. Replace wear ring when radial clearance reaches 2× OEM design limit.',
      id: 'Ukur ID wear ring vs OD hub impeller pada dua sumbu tegak lurus menggunakan bore gauge. Ganti bila celah mencapai 2× batas standar OEM.',
      ja: 'ボアゲージで直交2方向の内径とインペラハブ外径を測定。半径隙間が設計値の2倍に達したら交換します。',
    },
    clearanceOrTorque: 'Radial Running Clearance: 0.20 – 0.30 mm',
    basePosition: [-82, 0, 0],
    explodeVector: [-132, 0, 0],
    explodeStage: 2,
    rotates: false,
    appearance: {
      baseHex: '#D97706',
      edgeHex: '#FCD34D',
      specularStrength: 0.72,
      shininess: 48,
    },
  },
  {
    id: 'impeller-locknut',
    bomNumber: 3,
    partCode: 'NUT-105',
    category: 'Fastener',
    name: {
      en: 'Impeller Hex Locknut & Parallel Drive Key',
      id: 'Mur Pengunci Heksagonal Impeller & Pasak Penggerak',
      ja: 'インペラ六角ロックナット＆平行キー',
    },
    material: {
      en: 'Duplex Stainless Steel 2205 + Viton Thread O-Ring',
      id: 'Baja Tahan Karat Duplex 2205 + O-Ring Ulir Viton',
      ja: '二相ステンレス鋼 2205 ＋ バイトン製シールOリング',
    },
    functionSummary: {
      en: 'Clamps the impeller firmly against the shaft shoulder with an elastomeric thread seal while the parallel square key positively transmits shaft torque.',
      id: 'Menjepit impeller ke bahu poros dengan segel O-ring ulir agar cairan tidak merembes ke ulir poros, sementara pasak mentransmisikan torsi.',
      ja: 'シャフト段付き部へインペラを確実に締結・シールし、平行キーを介して駆動トルクをインペラへ伝達します。',
    },
    failureModes: {
      en: 'Unscrewing on accidental reverse motor rotation, thread galling in stainless steel, and fretting wear in keyway.',
      id: 'Terlepas saat putaran motor terbalik, keausan ulir (galling) pada baja tahan karat, dan keausan fretting pada alur pasak.',
      ja: 'モータ逆転時の緩み脱落、ステンレスねじ部の焼付き（かじり）、キー溝のフレッティング摩耗。',
    },
    maintenanceSpec: {
      en: 'Always coat stainless threads with nickel anti-seize, fit a new Viton O-ring beneath the locknut face, and verify rotation direction before coupling.',
      id: 'Oleskan pelumas anti-seize nikel pada ulir stainless, pasang O-ring Viton baru, dan pastikan arah putaran motor benar sebelum penyambungan kopling.',
      ja: 'ねじ部にニッケル系焼付き防止剤を塗布し、必ず新品のOリングを組み込んでから規定トルクで締め付けます。',
    },
    clearanceOrTorque: 'Tightening Torque: 95 N·m (Anti-Seize Lubricated)',
    basePosition: [-76, 0, 0],
    explodeVector: [-114, 0, 0],
    explodeStage: 1,
    rotates: true,
    appearance: {
      baseHex: '#475569',
      edgeHex: '#E2E8F0',
      specularStrength: 0.78,
      shininess: 54,
    },
  },
  {
    id: 'enclosed-impeller',
    bomNumber: 4,
    partCode: 'IMP-110',
    category: 'Rotating',
    name: {
      en: 'Enclosed 6-Vane Centrifugal Impeller',
      id: 'Impeller Sentrifugal Tertutup 6-Sudu',
      ja: 'クローズド型 6枚羽根遠心インペラ',
    },
    material: {
      en: 'Investment-Cast CF8M (316 SS), ISO 1940 G2.5 Balanced',
      id: 'Cor Presisi CF8M (316 SS), Seimbang Dinamis ISO 1940 G2.5',
      ja: '精密鋳造 CF8M (316 SS) / ISO 1940 G2.5 動的バランス済',
    },
    functionSummary: {
      en: 'Accelerates process liquid radially outward using 6 backward-curved shrouded vanes, transferring shaft mechanical power into fluid velocity and angular momentum.',
      id: 'Mempercepat aliran cairan secara radial keluar melalui 6 sudu melengkung ke belakang, mengubah daya mekanis poros menjadi energi fluida.',
      ja: '6枚の後退翼（バックワードベーン）により流体を半径方向外向きに加速し、軸動力を流体エネルギーへ変換する心臓部です。',
    },
    failureModes: {
      en: 'Cavitation pitting on vane leading edges, hydraulic unbalance from partial vane clogging, and backside balance-hole erosion.',
      id: 'Lubang kavitasi di tepi masuk sudu, ketidakseimbangan akibat penyumbatan sudu, dan erosi lubang keseimbangan tekanan.',
      ja: '翼入口縁のキャビテーション壊食、異物詰まりによるアンバランス振動、バランスホール部の摩耗。',
    },
    maintenanceSpec: {
      en: 'Check impeller OD runout (< 0.05 mm), dye-penetrant inspect vane roots for fatigue cracks, and dynamically rebalance after any trim machining.',
      id: 'Periksa runout diameter luar (< 0.05 mm), uji penetrant pada pangkal sudu, dan lakukan balancing dinamis ulang jika impeller di-trim.',
      ja: '外周振れ（< 0.05 mm）と浸透探傷による翼根元の亀裂点検を実施。外径カット加工後は必ず動的バランス修正を行います。',
    },
    clearanceOrTorque: 'Axial Impeller Setting Gap: 0.40 mm | Grade G2.5',
    basePosition: [-66, 0, 0],
    explodeVector: [-96, 0, 0],
    explodeStage: 2,
    rotates: true,
    appearance: {
      baseHex: '#0284C7',
      edgeHex: '#7DD3FC',
      specularStrength: 0.85,
      shininess: 60,
    },
  },
  {
    id: 'seal-backplate',
    bomNumber: 5,
    partCode: 'BPL-120',
    category: 'Housing',
    name: {
      en: 'Casing Rear Cover & Seal Chamber Backplate',
      id: 'Penutup Belakang Casing & Ruang Seal',
      ja: 'ケーシングバックプレート＆シールチャンバ',
    },
    material: {
      en: 'Cast Stainless Steel CF8M (316 SS) with Spiral Flush Bore',
      id: 'Baja Tahan Karat Cor CF8M (316 SS) dengan Lubang Bilas',
      ja: '鋳造ステンレス CF8M (316 SS) / APIフラッシュポート付',
    },
    functionSummary: {
      en: 'Closes the rear side of the volute casing, resists internal pressure differential, and encloses the cooling/flushing environment around the mechanical seal.',
      id: 'Menutup bagian belakang rumah volute, menahan tekanan fluida, dan menyediakan ruang pendingin/pembilasan bagi mechanical seal.',
      ja: 'ボリュート背面の耐圧壁を構成すると同時に、メカニカルシールを収納するフラッシング・冷却チャンバを形成します。',
    },
    failureModes: {
      en: 'Spiral gasket compression loss, face corrosion under gland bolts, and clogged API Plan 11 seal flush port.',
      id: 'Kehilangan kompresi gasket spiral-wound, korosi di bawah baut gland, dan tersumbatnya saluran bilas API Plan 11.',
      ja: 'うず巻形ガスケットの圧縮不良、スタッドボルト座面の隙間腐食、API Plan 11フラッシング孔の閉塞。',
    },
    maintenanceSpec: {
      en: 'Verify seal chamber face perpendicularity to shaft centerline (< 0.05 mm TIR per API 610/ANSI). Replace spiral-wound gasket upon every reassembly.',
      id: 'Pastikan ketegaklurusan muka ruang seal terhadap sumbu poros (< 0.05 mm TIR). Selalu ganti gasket spiral-wound setiap perakitan ulang.',
      ja: 'シール室端面の軸に対する直角度（< 0.05 mm TIR）を確認し、再組立時はガスケットを必ず新品へ交換します。',
    },
    clearanceOrTorque: 'Face Squareness ≤ 0.05 mm TIR | Bolt Torque: 85 N·m',
    basePosition: [-44, 0, 0],
    explodeVector: [-84, 0, 0],
    explodeStage: 2,
    isHousing: true,
    rotates: false,
    appearance: {
      baseHex: '#3B82F6',
      edgeHex: '#BFDBFE',
      specularStrength: 0.55,
      shininess: 32,
    },
  },
  {
    id: 'mechanical-seal',
    bomNumber: 6,
    partCode: 'MCS-130',
    category: 'Seal',
    name: {
      en: 'Cartridge Single Mechanical Seal (SiC / Carbon)',
      id: 'Mechanical Seal Tipe Cartridge (SiC / Karbon)',
      ja: 'カートリッジ式単一メカニカルシール (SiC/カーボン)',
    },
    material: {
      en: 'Silicon Carbide (SiC) vs. Carbon Faces, Hastelloy C-276 Springs',
      id: 'Muka Silikon Karbida (SiC) vs Karbon, Pegas Hastelloy C-276',
      ja: '炭化ケイ素（SiC）× カーボン摺動面 / ハステロイC-276ばね',
    },
    functionSummary: {
      en: 'Maintains a micron-thin hydrodynamic fluid film between one stationary and one rotating ultra-flat lapped face (1–2 light bands), achieving near-zero process leakage.',
      id: 'Menjaga lapisan film fluida setipis mikron antara muka diam dan muka berputar yang sangat rata, mencegah kebocoran cairan di sepanjang poros.',
      ja: '静止側と回転側の精密ラップされた摺動面間にミクロン単位の流体膜を形成し、軸封部からのプロセス流体漏れを防ぎます。',
    },
    failureModes: {
      en: 'Thermal cracking from dry run / loss of flush, blistered carbon face, elastomer swelling, or spring hang-up due to crystallized slurry.',
      id: 'Retak termal akibat berjalan kering, muka karbon melepuh, pembengkakan O-ring elastomer, atau pegas macet oleh kerak/kristal.',
      ja: '空運転・フラッシュ断絶によるSiC熱衝撃割れ、カーボン面ブリスター、Oリング膨潤、スラリ固着によるスプリング動作不良。',
    },
    maintenanceSpec: {
      en: 'Tighten gland bolts evenly in cross pattern first, then REMOVE red/orange centering clips ONLY after shaft locknut & gland are torqued.',
      id: 'Kencangkan baut gland secara menyilang merata terlebih dahulu, baru LEPASKAN klip pengatur jarak (setting clips) setelah baut terkunci penuh.',
      ja: 'グランドボルトを対角線順に均等締め付け後、最後に必ずセットプレート（赤色スペーサクリップ）を取り外してから試運転します。',
    },
    clearanceOrTorque: 'Max Shaft Deflection at Seal: ≤ 0.05 mm | Gland Bolt: 38 N·m',
    basePosition: [-24, 0, 0],
    explodeVector: [-72, 0, 0],
    explodeStage: 3,
    rotates: true,
    appearance: {
      baseHex: '#0F172A',
      edgeHex: '#38BDF8',
      specularStrength: 0.78,
      shininess: 65,
    },
  },
  {
    id: 'pump-shaft',
    bomNumber: 7,
    partCode: 'SHF-140',
    category: 'Rotating',
    name: {
      en: 'Stepped Precision Alloy Pump Shaft',
      id: 'Poros Pompa Baja Paduan Bertingkat Presisi',
      ja: '高精度段付きポンプ主軸（シャフト）',
    },
    material: {
      en: 'AISI 4140 High-Tensile Steel / 17-4PH (H1150) Stainless',
      id: 'Baja Tarik Tinggi AISI 4140 / Stainless 17-4PH (H1150)',
      ja: '高張力合金鋼 AISI 4140 / 析出硬化系ステンレス 17-4PH',
    },
    functionSummary: {
      en: 'Transmits full drive torque from the coupling hub to the overhung impeller while resisting combined torsional shear and radial hydraulic bending moments.',
      id: 'Mentransmisikan torsi penuh dari kopling ke impeller sambil menahan tegangan puntir dan momen lentur hidrolik radial.',
      ja: 'カップリングからの駆動トルクをインペラへ伝達し、同時に流体半径荷重による曲げモーメントおよびねじり荷重を支持します。',
    },
    failureModes: {
      en: 'Rotational bending fatigue crack at fillet step, fretting corrosion under bearing inner race, and permanent shaft bow exceeding 0.03 mm TIR.',
      id: 'Retak lelah lentur pada bahu fillet, korosi fretting di dudukan inner race bearing, dan poros bengkok melebihi 0.03 mm TIR.',
      ja: '段付き隅R部の回転曲げ疲労亀裂、軸受内輪嵌合部のフレッティング摩耗、0.03 mm TIRを超える永久曲がり。',
    },
    maintenanceSpec: {
      en: 'Mount shaft on V-blocks and verify straightness across bearing lands & seal journal with a 0.001 mm dial indicator. Check k5/m5 bearing fit journals.',
      id: 'Letakkan poros di atas V-block dan ukur kelurusan pada dudukan bearing serta seal dengan dial indicator 0.001 mm. Periksa suaian k5/m5.',
      ja: 'Vブロック上でダイヤルゲージを用いて軸受嵌合部・シール部の全振れ（TIR ≤ 0.025 mm）およびk5/m5軸径公差を検査します。',
    },
    clearanceOrTorque: 'Shaft Straightness: ≤ 0.025 mm TIR | Journal Fit: k5',
    basePosition: [24, 0, 0],
    explodeVector: [0, 0, 0],
    explodeStage: 3,
    rotates: true,
    appearance: {
      baseHex: '#94A3B8',
      edgeHex: '#F8FAFC',
      specularStrength: 0.92,
      shininess: 82,
    },
  },
  {
    id: 'radial-bearing',
    bomNumber: 8,
    partCode: 'BRG-150',
    category: 'Bearing',
    name: {
      en: 'Inboard Radial Ball Bearing (6309 C3)',
      id: 'Bearing Bola Radial Inboard (6309 C3)',
      ja: 'インボード側ラジアル深溝玉軸受 (6309 C3)',
    },
    material: {
      en: 'SAE 52100 Through-Hardened Chrome Steel + Brass Cage',
      id: 'Baja Krom Keras SAE 52100 + Sangkar Kuningan',
      ja: '高炭素クロム軸受鋼 SAE 52100 ＋ もみ抜き黄銅保持器',
    },
    functionSummary: {
      en: 'Carries primary overhung radial hydraulic force adjacent to the seal chamber while remaining axially free-floating in the housing bore to allow shaft thermal expansion.',
      id: 'Menahan beban radial hidrolik utama di dekat ruang seal, terpasang bebas aksial pada housing agar poros dapat memuai akibat panas.',
      ja: 'シール室近傍で片持ちインペラのラジアル荷重を支持し、ハウジング内で軸方向へフリーに逃がすことで熱膨張を吸収します。',
    },
    failureModes: {
      en: 'Outer-race spalling (BPFO vibration peak), moisture contamination in oil sump, brinelling from hammer installation, or housing seizure preventing float.',
      id: 'Spalling pada lintasan luar (puncak vibrasi BPFO), kontaminasi air pada oli, brinelling akibat pemukulan saat pasang, atau macet saat pemuaian.',
      ja: '外輪フレーキング（BPFO周波数ピーク）、潤滑油中の水分混入、ハンマー打撃圧痕、ハウジング固着による熱伸び拘束。',
    },
    maintenanceSpec: {
      en: 'Heat bearing cleanly using an induction heater (110 °C max, never open flame) to shrink onto the shaft. Never lock outer race axially.',
      id: 'Panaskan bearing dengan pemanas induksi (maks 110 °C, dilarang memakai api las) agar menyusut pas ke poros. Jangan mengunci outer race secara aksial.',
      ja: '誘導加熱ヒータ（最高 110 ℃）で内輪を加熱して焼き嵌めします。外輪は軸方向に固定せずフリー状態を維持してください。',
    },
    clearanceOrTorque: 'Mount Temp: 105–110 °C | Internal Clearance: C3',
    basePosition: [8, 0, 0],
    explodeVector: [134, 0, 0],
    explodeStage: 3,
    rotates: true,
    appearance: {
      baseHex: '#64748B',
      edgeHex: '#F1F5F9',
      specularStrength: 0.88,
      shininess: 74,
    },
  },
  {
    id: 'bearing-housing',
    bomNumber: 9,
    partCode: 'BHS-160',
    category: 'Housing',
    name: {
      en: 'Cast-Iron Bearing Frame & Oil Sump',
      id: 'Rumah Bearing Besi Cor & Bak Oli',
      ja: '鋳鉄製ベアリングフレーム＆油浴サンプ',
    },
    material: {
      en: 'ASTM A48 Class 30 Grey Cast Iron with Cooling Ribs',
      id: 'Besi Cor Kelabu ASTM A48 Kelas 30 dengan Sirip Pendingin',
      ja: 'ねずみ鋳鉄 ASTM A48 Class 30（放熱フィン付）',
    },
    functionSummary: {
      en: 'Provides rigid coaxial alignment between both rolling bearings, houses the ISO VG 68 splash oil sump, and anchors the rotating assembly to the pump baseplate.',
      id: 'Menjaga kelurusan koaksial antara kedua bearing, menampung bak pelumasan oli ISO VG 68, dan mengikat unit rotor ke baseplate pompa.',
      ja: '2個の転がり軸受の同軸度を保持し、ISO VG 68潤滑油サンプを形成するとともに、回転体アセンブリを架台に固定します。',
    },
    failureModes: {
      en: 'Bearing bore ovality/fretting, cracked support foot under soft-foot stress, plugged oil breather vent, and bearing oil lip seal leaks.',
      id: 'Keovalan lubang dudukan bearing, kaki penyangga retak akibat soft-foot, lubang pernapasan oli tersumbat, dan kebocoran lip seal oli.',
      ja: '軸受ハウジング内径の楕円摩耗、ソフトフット応力による支持脚亀裂、ブリーザ詰まり、オイルシールからの漏油。',
    },
    maintenanceSpec: {
      en: 'Verify bearing bores fit H6/H7 tolerance, maintain ISO VG 68 turbine/bearing oil at shaft-centerline height of bottom ball via constant-level oiler.',
      id: 'Pastikan toleransi lubang bearing H6/H7, jaga tinggi oli ISO VG 68 tepat di garis tengah bola bearing terbawah melalui constant-level oiler.',
      ja: 'ハウジング内径公差（H6/H7）を点検し、コンスタントレベルオイラでISO VG 68油面を最下部ボール中心高さに保ちます。',
    },
    clearanceOrTorque: 'Oil Spec: ISO VG 68 (Sump) | Housing Bore: H7',
    basePosition: [46, 0, 0],
    explodeVector: [165, 0, 0],
    explodeStage: 2,
    isHousing: true,
    rotates: false,
    appearance: {
      baseHex: '#1E293B',
      edgeHex: '#64748B',
      specularStrength: 0.45,
      shininess: 24,
    },
  },
  {
    id: 'thrust-bearing-coupling',
    bomNumber: 10,
    partCode: 'TBG-170',
    category: 'Bearing',
    name: {
      en: 'Duplex Thrust Bearing (7309 BECBM) & Coupling Hub',
      id: 'Bearing Aksial Duplex (7309) & Hub Kopling Penggerak',
      ja: '背面組合せスラスト軸受 (7309)＆駆動カップリングハブ',
    },
    material: {
      en: 'Matched Pair 40° Angular Contact Bearings + 1045 Steel Coupling Hub',
      id: 'Pasangan Bearing Kontak Sudut 40° + Hub Kopling Baja 1045',
      ja: '40°接触角アンギュラ玉軸受（DB組合せ）＋ S45Cカップリングハブ',
    },
    functionSummary: {
      en: 'Back-to-back duplex bearing pair absorbs bidirectional axial hydraulic thrust and locks rotor axial float, while the keyed coupling hub transmits motor torque.',
      id: 'Sepasang bearing kontak sudut saling membelakangi menahan gaya dorong aksial hidrolik dua arah, sementara hub kopling meneruskan torsi motor.',
      ja: '背面組合せアンギュラ玉軸受が両方向のスラスト荷重を拘束し、キー結合されたカップリングハブがモータ動力を入力軸へ伝えます。',
    },
    failureModes: {
      en: 'Excessive axial thrust overload when operating far left of BEP (shutoff), coupling angular/parallel misalignment vibration (2× RPM), and lockwasher tab shear.',
      id: 'Beban aksial berlebih saat beroperasi jauh di kiri BEP, getaran misalignment kopling (2× RPM), dan lidah pengunci locknut patah.',
      ja: '締切運転付近での過大スラスト荷重、カップリング芯出し不良による2×RPM振動、軸受ロックワッシャ爪破損。',
    },
    maintenanceSpec: {
      en: 'Clamp outer races tightly in bearing end-cover (< 0.05 mm end-play). Perform laser shaft alignment after mounting coupling hub (Offset ≤ 0.05 mm).',
      id: 'Jepit outer race secara rapat pada tutup belakang bearing (end-play < 0.05 mm). Lakukan laser alignment setelah pasang kopling (Offset ≤ 0.05 mm).',
      ja: '軸受端蓋で外輪を規定通り固定（軸方向ガタ < 0.05 mm）。据付後はレーザー芯出し機でオフセット ≤ 0.05 mm以内に調整します。',
    },
    clearanceOrTorque: 'Shaft End-Play: < 0.05 mm | Laser Offset: ≤ 0.05 mm',
    basePosition: [96, 0, 0],
    explodeVector: [178, 0, 0],
    explodeStage: 1,
    rotates: true,
    appearance: {
      baseHex: '#0F766E',
      edgeHex: '#5EEAD4',
      specularStrength: 0.8,
      shininess: 62,
    },
  },
];

export const CATEGORY_COLORS: Record<
  PartCategory,
  { badge: string; dot: string; label: LocalizedText }
> = {
  Housing: {
    badge:
      'bg-blue-500/15 text-blue-700 border-blue-500/30 dark:bg-blue-400/15 dark:text-blue-300 dark:border-blue-400/30',
    dot: 'bg-blue-500',
    label: { en: 'Housing', id: 'Rumah / Casing', ja: 'ケーシング' },
  },
  Rotating: {
    badge:
      'bg-sky-500/15 text-sky-700 border-sky-500/30 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30',
    dot: 'bg-sky-500',
    label: { en: 'Rotating', id: 'Elemen Putar', ja: '回転要素' },
  },
  Bearing: {
    badge:
      'bg-teal-500/15 text-teal-700 border-teal-500/30 dark:bg-teal-400/15 dark:text-teal-300 dark:border-teal-400/30',
    dot: 'bg-teal-500',
    label: { en: 'Bearing / Drive', id: 'Bearing / Penggerak', ja: '軸受・駆動' },
  },
  Seal: {
    badge:
      'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30',
    dot: 'bg-amber-500',
    label: { en: 'Seal / Wear', id: 'Segel / Wear', ja: 'シール・摩耗環' },
  },
  Fastener: {
    badge:
      'bg-slate-500/15 text-slate-700 border-slate-500/30 dark:bg-slate-400/15 dark:text-slate-300 dark:border-slate-400/30',
    dot: 'bg-slate-500',
    label: { en: 'Fastener / Key', id: 'Pengikat / Pasak', ja: '締結・キー' },
  },
};
