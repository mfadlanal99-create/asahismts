import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('belt-conveyor', {
  id: {
    title: 'Penggerak & Pelacakan Sabuk Konveyor',
    shortTitle: 'Konveyor Sabuk',
    description:
      'Diagnosis dan koreksi penyimpangan (mistracking) sabuk konveyor menggunakan baut take-up puli ekor, training idler otomatis, dan pemusatan curahan chute sambil memantau tegangan tepi, putaran puli kepala, dan daya penggerak.',
    explore: [
      {
        title: 'Aturan Pelacakan Sabuk & Penyetelan Take-Up Puli Ekor',
        summary:
          'Sabuk konveyor mengikuti dua prinsip kemudi utama: (1) sabuk bergerak menuju ujung rol atau puli yang disentuhnya PERTAMA KALI searah laju sabuk ("First Contact Rule"), dan (2) pada puli ekor dengan baut take-up, ekstensi ulir yang tidak sama memiringkan sumbu puli dan menimbulkan perbedaan tegangan tepi sehingga sabuk bergeser ke sisi dengan tegangan lebih rendah.',
        equations: [
          {
            label: 'Kontribusi Kemudi Take-Up Ekor',
            formula: 'Δy_takeup = 1,8 × (x_kiri − x_kanan)  [mm]',
            note: 'x_kiri, x_kanan = ekstensi baut take-up kiri/kanan (mm); Δy positif menggeser sabuk ke KANAN',
          },
          {
            label: 'Sudut Kemiringan Puli Ekor',
            formula: 'θ_tail = 0,12 × (x_kiri − x_kanan)  [°]',
            note: 'Lakukan penyetelan bertahap kecil (2–3 mm), lalu tunggu 3 putaran penuh sabuk sebelum mengukur ulang',
          },
          {
            label: 'Tegangan Tepi Diferensial',
            formula: 'T_L, T_R = (6,0 + 0,22·x_rata2) ± 0,18·(x_kiri − x_kanan)  [kN]',
            note: 'Sabuk bergerak menuju sisi bertegangan lebih rendah saat baut take-up tidak seimbang',
          },
        ],
        workedExample: {
          title: 'Mengoreksi Gesekan Rangka Kanan di Dekat Puli Ekor',
          given: [
            'Baut take-up kiri x_kiri = 36 mm, baut kanan x_kanan = 18 mm',
            'Curahan chute berada di tengah (e_chute = 0 mm) dan training idler lurus (0°)',
            'Ruang bebas lateral maksimum aman = ±25 mm',
          ],
          steps: [
            'Hitung selisih baut take-up: Δx = 36 − 18 = +18 mm',
            'Hitung penyimpangan lateral sabuk: Δy = 1,8 × (+18) = +32,4 mm (ke rel KANAN)',
            'Karena +32,4 mm > batas +25 mm, sabuk menggesek rangka kanal-C sebelah kanan.',
            'Tambah x_kanan (atau kurangi x_kiri) hingga x_kiri = x_kanan = 27 mm agar puli ekor kembali tegak lurus.',
          ],
          answer:
            'Penyimpangan awal = +32,4 mm (gesekan rangka kanan); menyamakan kedua baut ke 27 mm mengembalikan posisi ke 0,0 mm',
        },
      },
      {
        title: 'Training Idler, Beban Chute Tidak Sentris & Ruang Bebas Rangka',
        summary:
          'Training idler otomatis berporos putar di tengah untuk memberikan sudut skew terkontrol yang mengarahkan sabuk kembali ke garis tengah. Sebaliknya, pemuatan material yang tidak sentris dari corong chute membebani salah satu rol sayap troughing miring secara berlebih, mendorong sabuk secara lateral ke sisi berlawanan (bermuatan ringan). Ruang bebas lateral aman umumnya ±25 mm sebelum tepi sabuk aus dan sambungan rusak.',
        equations: [
          {
            label: 'Kemudi Sudut Skew Training Idler',
            formula: 'Δy_idler = 5,5 × α_skew  [mm]',
            note: 'α_skew dalam derajat (±4°); +α mengarahkan ke KANAN, −α mengarahkan ke KIRI',
          },
          {
            label: 'Reaksi Pemuatan Chute Tidak Sentris',
            formula: 'Δy_chute = −0,45 × e_chute  [mm]',
            note: 'Material yang jatuh ke sisi KANAN (+e_chute) mendorong sabuk ke sisi KIRI (−Δy)',
          },
          {
            label: 'Superposisi Total Penyimpangan Lateral',
            formula: 'Δy_total = Δy_takeup + Δy_idler + Δy_chute + 14,0 × θ_head',
            note: 'Ambang perhatian: |Δy| ≥ 12 mm; Alarm gesekan rangka: |Δy| ≥ 25 mm',
          },
        ],
        workedExample: {
          title: 'Mendiagnosis Mistracking akibat Beban Chute Tidak Sentris',
          given: [
            'Baut take-up seimbang (x_kiri = x_kanan = 25 mm) dan kemiringan puli kepala 0°',
            'Pelat pengarah chute bergeser +50 mm ke sisi KANAN sabuk',
            'Training idler disetel pada α_skew = −0,5°',
          ],
          steps: [
            'Reaksi beban chute: Δy_chute = −0,45 × (+50) = −22,5 mm (mendorong sabuk ke KIRI)',
            'Kontribusi training idler: Δy_idler = 5,5 × (−0,5) = −2,75 mm',
            'Total penyimpangan lateral: Δy_total = −22,5 − 2,75 = −25,25 mm (mencapai batas gesekan rangka kiri −25 mm)',
          ],
          answer:
            'Δy_total = −25,3 mm (gesekan rangka kiri); pusatkan pengarah chute (e_chute → 0 mm) sebelum menyetel idler',
        },
      },
      {
        title: 'Kecepatan Puli Kepala, Tarikan Efektif & Daya Motor Penggerak',
        summary:
          'Di ujung kepala (head end), drum penggerak berlapis karet berlian (diamond-lagged) yang terhubung ke gearmotor bevel-helical menyalurkan gaya tarik tangensial efektif F_eff untuk mengatasi pengangkatan material, tahanan gulir idler, dan gesekan skirtboard. Jika sabuk menyimpang hingga menggesek rangka kanal-C, gesekan tepi parasitik menambah beban tarik dan menaikkan konsumsi daya motor.',
        equations: [
          {
            label: 'Putaran Puli Kepala Penggerak',
            formula: 'N_head = (60 × v) / (π × D_head)  [RPM]',
            note: 'Untuk drum kepala standar D_head = 0,32 m (320 mm) dan laju sabuk v dalam m/s',
          },
          {
            label: 'Daya Poros Motor Penggerak',
            formula: 'P_drive = (F_eff × v) / η_drive  [kW]',
            note: 'F_eff dalam kN, v dalam m/s, efisiensi gearbox/penggerak η_drive = 0,88',
          },
        ],
        workedExample: {
          title: 'Putaran Puli Kepala & Daya Penggerak pada 2,0 m/s',
          given: [
            'Laju sabuk v = 2,0 m/s, diameter drum kepala D_head = 0,32 m',
            'Gaya tarik efektif F_eff = 4,20 kN, efisiensi penggerak η = 0,88',
          ],
          steps: [
            'Putaran puli kepala: N_head = (60 × 2,0) / (π × 0,32) = 120 / 1,0053 = 119,4 RPM',
            'Daya penggerak: P_drive = (4,20 × 2,0) / 0,88 = 8,40 / 0,88 = 9,55 kW',
          ],
          answer: 'N_head = 119,4 RPM, P_drive = 9,55 kW',
        },
      },
    ],
    practice: [
      {
        id: 'bc-prac-1',
        prompt:
          'Konveyor sabuk memiliki baut take-up ekor kiri x_kiri = 35 mm dan kanan x_kanan = 21 mm, dengan chute sentris dan kemiringan idler/kepala nol. Menggunakan Δy = 1,8 × (x_kiri − x_kanan), hitung penyimpangan lateral sabuk (dalam mm).',
        hint: 'Hitung 1,8 × (35 − 21).',
        targetValue: 25.2,
        unit: 'mm',
        tolerance: 0.3,
        solutionSteps: [
          'Selisih take-up: Δx = 35 − 21 = 14 mm',
          'Penyimpangan lateral: Δy = 1,8 × 14 = +25,2 mm (melampaui batas ruang bebas +25 mm)',
        ],
      },
      {
        id: 'bc-prac-2',
        prompt:
          'Ketidaklurusan puli kepala sebesar −1,1° menyebabkan penyimpangan lateral 14,0 × (−1,1) = −15,4 mm. Berapakah sudut skew training idler α_skew (dalam derajat) yang diperlukan untuk meniadakan penyimpangan ini menggunakan Δy_idler = 5,5 × α_skew?',
        hint: 'Selesaikan 5,5 × α_skew = +15,4°.',
        targetValue: 2.8,
        unit: '°',
        tolerance: 0.1,
        solutionSteps: [
          'Samakan gaya kemudi idler berlawanan arah: 5,5 × α_skew = +15,4 mm',
          'α_skew = 15,4 / 5,5 = +2,8°',
        ],
      },
      {
        id: 'bc-prac-3',
        prompt:
          'Material curah jatuh tidak sentris sebesar e_chute = +40 mm ke sisi kanan sabuk konveyor troughing. Menggunakan Δy_chute = −0,45 × e_chute, berapakah pergeseran lateral sabuk yang terjadi (dalam mm)?',
        hint: 'Kalikan −0,45 × 40 (sertakan tanda negatif untuk pergeseran ke kiri).',
        targetValue: -18,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'Δy_chute = −0,45 × (+40 mm) = −18,0 mm',
          'Tanda negatif menunjukkan sabuk terdorong 18,0 mm ke arah rel KIRI.',
        ],
      },
      {
        id: 'bc-prac-4',
        prompt:
          'Puli kepala penggerak berdiameter Ø320 mm (0,32 m) menggerakkan sabuk pada kecepatan v = 2,5 m/s. Hitung kecepatan putar puli kepala (dalam RPM).',
        hint: 'Gunakan N = (60 × 2,5) / (π × 0,32).',
        targetValue: 149.2,
        unit: 'RPM',
        tolerance: 1.0,
        solutionSteps: [
          'Keliling drum: π × 0,32 = 1,0053 m',
          'N_head = (60 × 2,5) / 1,0053 = 150 / 1,0053 = 149,2 RPM',
        ],
      },
      {
        id: 'bc-prac-5',
        prompt:
          'Konveyor sabuk beroperasi pada v = 2,2 m/s dengan gaya tarik tangensial efektif F_eff = 4,20 kN dan efisiensi penggerak η = 0,88. Hitung daya motor penggerak yang dibutuhkan (dalam kW).',
        hint: 'Gunakan P = (F_eff × v) / η.',
        targetValue: 10.5,
        unit: 'kW',
        tolerance: 0.2,
        solutionSteps: [
          'Daya poros sabuk: P_sabuk = 4,20 kN × 2,2 m/s = 9,24 kW',
          'Daya motor penggerak: P_drive = 9,24 / 0,88 = 10,50 kW',
        ],
      },
    ],
    quiz: [
      {
        id: 'bc-quiz-1',
        question:
          'Menurut Aturan Pelacakan Sabuk Konveyor ("First Contact Rule"), bagaimana respons sabuk ketika salah satu ujung rol/training idler dimiringkan sedikit maju searah laju sabuk?',
        options: [
          'Sabuk bergerak menuju ujung rol yang disentuhnya PERTAMA KALI',
          'Sabuk bergerak menuju ujung rol yang disentuhnya TERAKHIR',
          'Memiringkan idler hanya mengubah kecepatan sabuk, bukan posisi lateral',
          'Sabuk langsung berhenti karena gesekan',
        ],
        correctIndex: 0,
        explanation:
          'Ketika idler membentuk sudut kecil terhadap garis tengah sabuk, sabuk akan bergerak ke arah sisi rol yang disentuhnya lebih dulu dalam arah laju sabuk.',
      },
      {
        id: 'bc-quiz-2',
        question:
          'Jika material curah dari corong pemuatan (chute) terus-menerus jatuh tidak di tengah melainkan ke sisi KANAN sabuk konveyor troughing, ke arah manakah sabuk cenderung menyimpang?',
        options: [
          'Tetap di tengah karena rol troughing menyeimbangkan diri sendiri',
          'Beban berat yang tidak sentris mendorong sabuk ke sisi KIRI (sisi bermuatan ringan)',
          'Sabuk memanjang menjadi V-belt',
          'Puli ekor otomatis mengompensasi tanpa penyetelan',
        ],
        correctIndex: 1,
        explanation:
          'Ketika material membebani rol miring sebelah kanan secara berlebih, komponen gaya gravitasi pada kemiringan rol mendorong sabuk secara lateral ke arah kiri (sisi yang bermuatan ringan).',
      },
      {
        id: 'bc-quiz-3',
        question:
          'Pada puli ekor take-up tipe baut, jika baut KIRI diputar lebih panjang daripada baut KANAN (x_kiri > x_kanan), sisi sabuk manakah yang bertegangan lebih rendah dan ke mana sabuk menyimpang?',
        options: [
          'Sisi kiri bertegangan lebih rendah; sabuk menyimpang ke KIRI',
          'Sisi kanan bertegangan lebih rendah; sabuk menyimpang ke KANAN',
          'Kedua sisi bertegangan sama; sabuk tetap di tengah',
          'Kecepatan sabuk menjadi dua kali lipat di sisi kiri',
        ],
        correctIndex: 1,
        explanation:
          'Memperpanjang baut take-up kiri meregangkan tepi kiri sabuk (T_L lebih tinggi) dan memiringkan puli ekor sehingga sabuk bergeser ke sisi KANAN yang tegangannya lebih rendah.',
      },
      {
        id: 'bc-quiz-4',
        question:
          'Mengapa teknisi harus meluruskan curahan chute yang tidak sentris TERLEBIH DAHULU sebelum menyetel training idler atau baut take-up ekor?',
        options: [
          'Karena beban tidak sentris menimbulkan dorongan lateral terus-menerus yang memaksa penyetelan idler berlebihan dan mempercepat keausan tepi sabuk',
          'Karena training idler hanya bekerja saat konveyor berhenti',
          'Karena pelat chute terhubung langsung ke baut take-up ekor',
          'Karena beban tidak sentris membalik arah putaran motor penggerak',
        ],
        correctIndex: 0,
        explanation:
          'Mengompensasi beban chute yang miring dengan memiringkan idler atau take-up menciptakan gaya lateral berlawanan yang menggerus permukaan sabuk. Selalu perbaiki akar masalah (pusatkan beban) terlebih dahulu.',
      },
      {
        id: 'bc-quiz-5',
        question:
          'Apakah akibat langsung bila penyimpangan lateral sabuk melampaui ruang bebas rangka ±25 mm?',
        options: [
          'Sabuk otomatis kembali ke tengah saat menyentuh rel kanal-C',
          'Tepi sabuk bergesekan dengan rel rangka baja, menyebabkan tepi sabuk terkelupas, kerusakan sambungan (splice), dan kenaikan daya penggerak parasitik',
          'Diameter puli kepala membesar',
          'Sudut troughing turun menjadi 0°',
        ],
        correctIndex: 1,
        explanation:
          'Gesekan rangka dengan cepat merusak tepi karkas sabuk, membuka lapisan kain/baja terhadap kelembapan, membahayakan sambungan sabuk, dan menambah beban gesek pada motor.',
      },
    ],
  },
  ja: {
    title: 'ベルトコンベヤ駆動＆蛇行調整シミュレータ',
    shortTitle: 'ベルトコンベヤ',
    description:
      'テールプーリのテイクアップねじ、自動調心（トレーニング）アイドラ、シュート偏荷重補正を用いてベルトコンベヤの蛇行を診断・修正し、左右エッジ張力・ヘッドプーリ回転数・駆動動力を監視します。',
    explore: [
      {
        title: 'ベルト蛇行の法則とテールプーリ・テイクアップ調整',
        summary:
          'コンベヤベルトのトラッキングは2つの基本法則に従います：(1) ベルトは進行方向において「先に接触したローラ／プーリ端」の側へ寄る（先当たりの法則）、(2) テールプーリのねじ式テイクアップで左右の繰出し量が異なると、プーリ軸が傾き張力差が生じて張力の低い側へベルトが移動します。',
        equations: [
          {
            label: 'テールテイクアップによる蛇行寄与',
            formula: 'Δy_takeup = 1.8 × (x_左 − x_右)  [mm]',
            note: 'x_左, x_右 = 左右テイクアップねじ調整量 (mm)。正の Δy は右側への寄り',
          },
          {
            label: 'テールプーリ傾き角',
            formula: 'θ_tail = 0.12 × (x_左 − x_右)  [°]',
            note: '調整は 2〜3 mm ずつ行い、ベルトが3周するのを待ってから再測定します',
          },
          {
            label: '左右エッジ張力差',
            formula: 'T_L, T_R = (6.0 + 0.22·x_avg) ± 0.18·(x_左 − x_右)  [kN]',
            note: 'テイクアップが不均等な場合、ベルトは低張力側へ寄ります',
          },
        ],
        workedExample: {
          title: 'テールプーリ付近での右側フレーム接触の修正',
          given: [
            '左テイクアップねじ x_左 = 36 mm、右ねじ x_右 = 18 mm',
            'シュート投入は中央（e_chute = 0 mm）、調心アイドラは直角（0°）',
            'フレーム接触を防ぐ許容クリアランス限界 = ±25 mm',
          ],
          steps: [
            'テイクアップ差を計算：Δx = 36 − 18 = +18 mm',
            'ベルト横蛇行量を算出：Δy = 1.8 × (+18) = +32.4 mm（右レール側へ）',
            '+32.4 mm > +25 mm 限界のため、右側チャンネル鋼フレームと接触摩耗中。',
            'x_右を増やす（またはx_左を減らす）ことで x_左 = x_右 = 27 mm に揃え、プーリを直角に戻す。',
          ],
          answer:
            '初期蛇行量 = +32.4 mm（右フレーム接触）。両ねじを 27 mm に揃えると蛇行量は 0.0 mm に戻る',
        },
      },
      {
        title: '調心アイドラ・シュート偏荷重（片荷）とフレームクリアランス',
        summary:
          '自動調心（トレーニング）アイドラは中央ピボットで旋回し、意図的にわずかなスキュー角を与えてベルトを中央へ操舵します。一方、シュートからの偏荷重（片荷）はトラフローラの傾斜反力によって荷の軽い側へベルトを押し出します。許容クリアランスは一般に ±25 mm であり、これを超えるとベルト耳部のほつれや継手損傷を招きます。',
        equations: [
          {
            label: '調心アイドラのスキュー操舵効果',
            formula: 'Δy_idler = 5.5 × α_skew  [mm]',
            note: 'α_skew は角度（±4°）。+α は右へ操舵、−α は左へ操舵',
          },
          {
            label: 'シュート偏荷重による横押し反力',
            formula: 'Δy_chute = −0.45 × e_chute  [mm]',
            note: '右側へ偏って荷が落ちると（+e_chute）、ベルトは左側（−Δy）へ押し出される',
          },
          {
            label: '横蛇行量の重ね合わせ',
            formula: 'Δy_total = Δy_takeup + Δy_idler + Δy_chute + 14.0 × θ_head',
            note: '注意しきい値：|Δy| ≥ 12 mm、フレーム接触警報：|Δy| ≥ 25 mm',
          },
        ],
        workedExample: {
          title: 'シュート片荷による蛇行の診断',
          given: [
            'テイクアップねじは均等（x_左 = x_右 = 25 mm）、ヘッドプーリ傾きは 0°',
            'シュートガイド板が右側へ +50 mm 偏心している',
            '調心アイドラが α_skew = −0.5° に設定されている',
          ],
          steps: [
            'シュート偏荷重の反力：Δy_chute = −0.45 × (+50) = −22.5 mm（左へ押す）',
            '調心アイドラの寄与：Δy_idler = 5.5 × (−0.5) = −2.75 mm',
            '合計横蛇行量：Δy_total = −22.5 − 2.75 = −25.25 mm（左フレーム接触限界 −25 mm に到達）',
          ],
          answer:
            'Δy_total = −25.3 mm（左フレーム接触）。アイドラ調整の前にまずシュート投入位置（e_chute → 0 mm）を中央へ戻す',
        },
      },
      {
        title: 'ヘッドプーリ回転速度・有効張力・駆動モータ動力',
        summary:
          'ヘッド側では、ダイヤモンドラギングを施した駆動ドラムと軸直結ベベルヘリカルギアモータにより、搬送物の上昇・アイドラ転がり抵抗・スカートボード摩擦に打ち勝つ有効接線力 F_eff を伝達します。ベルトがフレームに接触すると余分な摩擦抵抗が加わり、駆動動力が上昇します。',
        equations: [
          {
            label: 'ヘッド駆動プーリ回転数',
            formula: 'N_head = (60 × v) / (π × D_head)  [RPM]',
            note: '標準ヘッドドラム径 D_head = 0.32 m (320 mm)、ベルト速度 v [m/s]',
          },
          {
            label: '駆動モータ軸動力',
            formula: 'P_drive = (F_eff × v) / η_drive  [kW]',
            note: 'F_eff [kN]、v [m/s]、減速機・駆動効率 η_drive = 0.88',
          },
        ],
        workedExample: {
          title: 'ベルト速度 2.0 m/s 時のヘッドプーリ回転数と駆動動力',
          given: [
            'ベルト速度 v = 2.0 m/s、ヘッドドラム径 D_head = 0.32 m',
            '有効接線力 F_eff = 4.20 kN、駆動効率 η = 0.88',
          ],
          steps: [
            'ヘッドプーリ回転数：N_head = (60 × 2.0) / (π × 0.32) = 120 / 1.0053 = 119.4 RPM',
            '駆動動力：P_drive = (4.20 × 2.0) / 0.88 = 8.40 / 0.88 = 9.55 kW',
          ],
          answer: 'N_head = 119.4 RPM、P_drive = 9.55 kW',
        },
      },
    ],
    practice: [
      {
        id: 'bc-prac-1',
        prompt:
          'ベルトコンベヤの左テールテイクアップねじが x_左 = 35 mm、右ねじが x_右 = 21 mm で、シュートは中央、アイドラとヘッドの傾きはゼロです。Δy = 1.8 × (x_左 − x_右) を用いてベルト横蛇行量（mm）を計算してください。',
        hint: '1.8 × (35 − 21) を計算します。',
        targetValue: 25.2,
        unit: 'mm',
        tolerance: 0.3,
        solutionSteps: [
          'テイクアップ差：Δx = 35 − 21 = 14 mm',
          '横蛇行量：Δy = 1.8 × 14 = +25.2 mm（許容クリアランス +25 mm を超過）',
        ],
      },
      {
        id: 'bc-prac-2',
        prompt:
          'ヘッドプーリの傾き異常 −1.1° により 14.0 × (−1.1) = −15.4 mm の蛇行が発生しています。Δy_idler = 5.5 × α_skew を用いて、この蛇行をちょうど打ち消す調心アイドラのスキュー角 α_skew（度）を求めてください。',
        hint: '5.5 × α_skew = +15.4 を解きます。',
        targetValue: 2.8,
        unit: '°',
        tolerance: 0.1,
        solutionSteps: [
          'アイドラの操舵量をヘッド傾き分と逆向きに等しくする：5.5 × α_skew = +15.4 mm',
          'α_skew = 15.4 / 5.5 = +2.8°',
        ],
      },
      {
        id: 'bc-prac-3',
        prompt:
          'シュートからの搬送物がトラフ型コンベヤベルトの右側へ e_chute = +40 mm 偏って落下しています。Δy_chute = −0.45 × e_chute を用いて、発生するベルト横移動量（mm）を求めてください。',
        hint: '−0.45 × 40 を計算します（左向き移動のため負号を含めます）。',
        targetValue: -18,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'Δy_chute = −0.45 × (+40 mm) = −18.0 mm',
          '負号はベルトが左レール側へ 18.0 mm 押し出されることを示します。',
        ],
      },
      {
        id: 'bc-prac-4',
        prompt:
          '直径 Ø320 mm (0.32 m) のヘッド駆動プーリがベルト速度 v = 2.5 m/s で運転しています。ヘッドプーリの回転数（RPM）を計算してください。',
        hint: 'N = (60 × 2.5) / (π × 0.32) を使用します。',
        targetValue: 149.2,
        unit: 'RPM',
        tolerance: 1.0,
        solutionSteps: [
          'ドラム周長：π × 0.32 = 1.0053 m',
          'N_head = (60 × 2.5) / 1.0053 = 150 / 1.0053 = 149.2 RPM',
        ],
      },
      {
        id: 'bc-prac-5',
        prompt:
          'ベルトコンベヤが速度 v = 2.2 m/s、有効接線力 F_eff = 4.20 kN、駆動効率 η = 0.88 で運転しています。必要な駆動モータ動力（kW）を計算してください。',
        hint: 'P = (F_eff × v) / η を使用します。',
        targetValue: 10.5,
        unit: 'kW',
        tolerance: 0.2,
        solutionSteps: [
          'ベルト軸動力：P_belt = 4.20 kN × 2.2 m/s = 9.24 kW',
          'モータ駆動動力：P_drive = 9.24 / 0.88 = 10.50 kW',
        ],
      },
    ],
    quiz: [
      {
        id: 'bc-quiz-1',
        question:
          'コンベヤベルトの「先当たりの法則（First Contact Rule）」によると、アイドラ（ローラ）の一端をベルト進行方向へ少し前進させた場合、ベルトはどう動きますか？',
        options: [
          'ベルトは進行方向で「先に接触する側」のローラ端へ寄る',
          'ベルトは「後から接触する側」のローラ端へ寄る',
          'アイドラを傾けてもベルト速度が変わるだけで横位置は変わらない',
          '摩擦でベルトが即座に停止する',
        ],
        correctIndex: 0,
        explanation:
          'アイドラにわずかなスキュー角をつけると、ベルトは進行方向において最初に接触する側のローラ端に向かって舵を切ります。',
      },
      {
        id: 'bc-quiz-2',
        question:
          'シュートからの搬送物が常にトラフ型コンベヤベルトの「右側」に偏って落下（片荷）している場合、ベルトはどちら側へ蛇行しやすくなりますか？',
        options: [
          'トラフローラが自動平衡するため中央に留まる',
          '重い偏荷重が傾斜ローラを押すため、ベルトは「左側（荷の軽い側）」へ押し出される',
          'ベルトが伸びてVベルト状になる',
          'テールプーリが自動的に補正する',
        ],
        correctIndex: 1,
        explanation:
          '右側トラフローラに過大な荷重がかかると、傾斜面に沿う重力分力の反作用によってベルト自体は荷の軽い左側へ横移動します。',
      },
      {
        id: 'bc-quiz-3',
        question:
          'ねじ式テールテイクアップにおいて、左側ねじを右側ねじより多く伸ばした場合（x_左 > x_右）、張力が低くなる側とベルトの蛇行方向はどれですか？',
        options: [
          '左側の張力が低く、ベルトは左へ寄る',
          '右側の張力が低く、ベルトは右へ寄る',
          '左右の張力は等しく、ベルトは中央に留まる',
          '左側のベルト速度が2倍になる',
        ],
        correctIndex: 1,
        explanation:
          '左側のテイクアップねじを伸ばすと左エッジの張力（T_L）が高くなり、テールプーリが傾いてベルトは低張力側の「右」へ移動します。',
      },
      {
        id: 'bc-quiz-4',
        question:
          '調心アイドラやテールテイクアップねじを調整する前に、まずシュートの偏荷重（片荷）を中央へ戻すべき理由は何ですか？',
        options: [
          '片荷が継続的な横押し力を生むため、アイドラで無理に打ち消すとベルト表面の摩耗やエッジ損傷を招くため',
          '調心アイドラはコンベヤ停止時にしか機能しないため',
          'シュート板がテールテイクアップねじに直結しているため',
          '片荷により駆動モータが逆転するため',
        ],
        correctIndex: 0,
        explanation:
          'シュートの偏荷重をアイドラやテイクアップの逆傾きで相殺すると、ベルトに逆方向の横力が加わりカバーゴムや耳部が早期摩耗します。まず根本原因（偏荷重）を取り除くのが鉄則です。',
      },
      {
        id: 'bc-quiz-5',
        question:
          'ベルトの横蛇行量がフレーム許容クリアランス（±25 mm）を超えた場合に直ちに発生する問題は何ですか？',
        options: [
          'チャンネル鋼レールに当たって自動的に中央へ戻る',
          'ベルト端面が鋼製フレームに接触摩耗し、耳部ほつれ・継手損傷・寄生駆動動力の増加を招く',
          'ヘッドプーリ径が大きくなる',
          'トラフ角が 0° に下がる',
        ],
        correctIndex: 1,
        explanation:
          'フレーム接触によりベルト耳部のカーカスが急速に摩耗し、水分侵入や継手剥離のリスクが高まるとともに、摩擦抵抗により駆動動力が増加します。',
      },
    ],
  },
});
