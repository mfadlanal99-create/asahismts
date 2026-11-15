import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('vibrating-feeder', {
  id: {
    title: 'Vibrating Feeder & Aliran Corong',
    shortTitle: 'Vibrating Feeder',
    description:
      'Analisis indeks lempar (Kᵥ), kecepatan angkut micro-throwing, laju aliran massa terkendali gerbang (t/h), dan isolasi pegas koil super-resonan sambil mendiagnosis pegas patah, penyumbatan corong, dan slip fasa eksentrik.',
    explore: [
      {
        title: 'Indeks Lempar (Kᵥ) & Kinematika Micro-Throwing',
        summary:
          'Vibrating feeder memindahkan material curah dengan menggetarkan bak miring pada frekuensi f dan langkah puncak-ke-puncak 2A sepanjang sudut lempar β. Saat komponen percepatan normal melebihi komponen gravitasi normal (Kᵥ > 1,0), partikel terangkat dari pelapis bak dalam lompatan parabola mikro ("micro-throwing") dan bergerak maju.',
        equations: [
          {
            label: 'Frekuensi Sudut & Percepatan Puncak',
            formula: 'ω = 2πf,   a_maks = A · ω²   [m/s²]',
            note: 'A = amplitudo tunggal = (langkah puncak-ke-puncak) / 2 dalam meter',
          },
          {
            label: 'Indeks Lempar (Rasio Faktor-G)',
            formula: 'Kᵥ = (A · ω² · sin β) / (g · cos α)',
            note: 'β = sudut lempar terhadap bak; α = kemiringan turun bak; Kᵥ > 1,0 diperlukan untuk micro-throwing (umumnya: 1,8 – 3,2)',
          },
          {
            label: 'Kecepatan Angkut Rata-rata',
            formula: 'v_c ≈ A · ω · cos β · η_throw · (1 + 0,035 α)',
            note: 'η_throw meningkat seiring Kᵥ di atas 1,0; di bawah Kᵥ = 1,0 material hanya bergeser lambat',
          },
        ],
        workedExample: {
          title: 'Menghitung Indeks Lempar Kᵥ pada Feeder Eksentrik Ganda',
          given: [
            'Frekuensi penggerak f = 24 Hz (ω = 150,8 rad/s)',
            'Langkah puncak-ke-puncak 2A = 6,0 mm (amplitudo tunggal A = 3,0 mm = 0,003 m)',
            'Sudut lempar β = 22°, kemiringan turun bak α = 5°',
          ],
          steps: [
            'Hitung percepatan puncak: a_maks = 0,003 × (150,8)² = 68,22 m/s² (6,96 g)',
            'Hitung komponen lempar normal: a_maks · sin(22°) = 68,22 × 0,3746 = 25,56 m/s²',
            'Bagi dengan g · cos(5°) = 9,807 × 0,9962 = 9,77 m/s² → Kᵥ = 25,56 / 9,77 = 2,62',
          ],
          answer:
            'Kᵥ = 2,62 (Rezim micro-throwing optimal; aliran lancar dengan keausan liner moderat)',
        },
      },
      {
        title: 'Laju Aliran Volumetrik & Massa Terkendali Gerbang',
        summary:
          'Di bawah tekanan corong yang stabil, lebar bak W dan bukaan gerbang vertikal H menentukan luas penampang lapisan material yang mengalir. Mengalikan luas ini dengan kecepatan angkut v_c, faktor pengisian lapisan η_fill (≈ 0,85), dan densitas curah ρ menghasilkan laju aliran massa dalam metrik ton per jam (t/h).',
        equations: [
          {
            label: 'Laju Aliran Volumetrik',
            formula: 'Q_vol = 3600 · W · H · v_c · η_fill   [m³/h]',
            note: 'W = lebar bak (m), H = bukaan gerbang (m), v_c = kecepatan angkut (m/s)',
          },
          {
            label: 'Laju Aliran Massa',
            formula: 'ṁ = (Q_vol · ρ) / 1000   [t/h]',
            note: 'ρ = densitas curah (kg/m³), mis. batu kapur ≈ 1600, batu bara ≈ 850, bijih besi ≈ 2450',
          },
        ],
        workedExample: {
          title: 'Menghitung Kapasitas Feeder untuk Batu Kapur Pecah',
          given: [
            'Lebar bak W = 600 mm (0,60 m), bukaan gerbang H = 120 mm (0,12 m)',
            'Kecepatan angkut v_c = 0,38 m/s (22,8 m/min), faktor isi η_fill = 0,85',
            'Densitas curah batu kapur ρ = 1600 kg/m³',
          ],
          steps: [
            'Luas penampang aliran: A_flow = 0,60 × 0,12 × 0,85 = 0,0612 m²',
            'Aliran volumetrik: Q_vol = 3600 × 0,0612 × 0,38 = 83,72 m³/h',
            'Laju aliran massa: ṁ = (83,72 × 1600) / 1000 = 134,0 t/h',
          ],
          answer: 'Laju aliran massa ṁ = 134,0 t/h',
        },
      },
      {
        title: 'Isolasi Pegas Koil, Rasio Resonansi & Mode Gangguan',
        summary:
          'Vibrating feeder dipasang pada pegas koil heliks untuk mengisolasi gaya dinamis dari struktur penyangga. Feeder industri beroperasi secara super-resonan (f / fₙ > 2,0) agar transmisibilitas tetap rendah. Pegas koil yang patah menurunkan kekakuan dan memiringkan bak; penyumbatan corong (bridging) mencekik aliran; dan slip fasa eksentrik merusak langkah lempar linier.',
        equations: [
          {
            label: 'Frekuensi Alami & Rasio Resonansi',
            formula: 'fₙ = (1 / 2π) · √(k_eff / M_total),   r = f / fₙ',
            note: 'Hindari zona bahaya resonansi (0,75 ≤ r ≤ 1,35); targetkan r > 2,0 untuk isolasi > 75%',
          },
          {
            label: 'Transmisibilitas Gaya',
            formula: 'T_R = √(1 + (2ζr)²) / √((1 − r²)² + (2ζr)²)',
            note: 'Efisiensi isolasi η_iso = (1 − T_R) × 100%; redaman pegas baja ζ ≈ 0,06',
          },
        ],
        workedExample: {
          title: 'Evaluasi Efisiensi Isolasi Pegas',
          given: [
            'Frekuensi penggerak f = 24 Hz, frekuensi alami feeder fₙ = 6,0 Hz',
            'Rasio redaman pegas koil ζ = 0,06',
          ],
          steps: [
            'Rasio frekuensi: r = 24 / 6,0 = 4,0',
            'Penyebut √((1 − 16)² + (2 × 0,06 × 4)²) = √(225 + 0,23) = 15,01',
            'Pembilang √(1 + 0,23) = 1,11 → T_R = 1,11 / 15,01 = 0,074',
            'Efisiensi isolasi: η_iso = (1 − 0,074) × 100% = 92,6%',
          ],
          answer: 'T_R = 0,074 (92,6% gaya dinamis terisolasi dari pondasi)',
        },
      },
    ],
    practice: [
      {
        id: 'vf-prac-1',
        prompt:
          'Sebuah vibrating feeder beroperasi pada f = 25 Hz dengan langkah puncak-ke-puncak 8,0 mm (amplitudo tunggal A = 4,0 mm). Hitung percepatan puncak a_maks dalam m/s².',
        hint: 'Gunakan a_maks = A · (2πf)², dengan A = 0,004 m.',
        targetValue: 98.7,
        unit: 'm/s²',
        tolerance: 1.0,
        solutionSteps: [
          'Frekuensi sudut: ω = 2π × 25 = 157,08 rad/s',
          'Amplitudo tunggal: A = 4,0 mm = 0,004 m',
          'Percepatan puncak: a_maks = 0,004 × (157,08)² = 98,70 m/s²',
        ],
      },
      {
        id: 'vf-prac-2',
        prompt:
          'Sebuah feeder memiliki percepatan puncak a_maks = 68,2 m/s², sudut lempar β = 22°, dan kemiringan turun bak α = 5°. Hitung indeks lempar Kᵥ (gunakan g = 9,81 m/s²).',
        hint: 'Gunakan Kᵥ = (a_maks · sin β) / (g · cos α).',
        targetValue: 2.61,
        unit: '',
        tolerance: 0.06,
        solutionSteps: [
          'Percepatan normal: 68,2 × sin(22°) = 68,2 × 0,3746 = 25,55 m/s²',
          'Gravitasi normal: 9,81 × cos(5°) = 9,81 × 0,9962 = 9,77 m/s²',
          'Indeks lempar: Kᵥ = 25,55 / 9,77 = 2,615 ≈ 2,61',
        ],
      },
      {
        id: 'vf-prac-3',
        prompt:
          'Bak feeder (W = 0,80 m, bukaan gerbang H = 0,15 m) mengalirkan bijih pecah (ρ = 2000 kg/m³) pada v_c = 0,30 m/s dengan faktor isi η_fill = 0,85. Hitung laju aliran massa ṁ dalam t/h.',
        hint: 'ṁ = (3600 × W × H × v_c × η_fill × ρ) / 1000.',
        targetValue: 220.3,
        unit: 't/h',
        tolerance: 2.5,
        solutionSteps: [
          'Aliran volumetrik: Q_vol = 3600 × 0,80 × 0,15 × 0,30 × 0,85 = 110,16 m³/h',
          'Laju aliran massa: ṁ = (110,16 × 2000) / 1000 = 220,32 t/h',
        ],
      },
      {
        id: 'vf-prac-4',
        prompt:
          'Vibrating feeder terisolasi memiliki massa berosilasi 600 kg yang ditopang pegas koil dengan kekakuan total k = 850.000 N/m. Hitung frekuensi alaminya fₙ dalam Hz.',
        hint: 'Gunakan fₙ = (1 / 2π) · √(k / M).',
        targetValue: 5.99,
        unit: 'Hz',
        tolerance: 0.15,
        solutionSteps: [
          'ωₙ = √(850.000 / 600) = √1416,67 = 37,64 rad/s',
          'fₙ = 37,64 / (2π) = 5,99 Hz',
        ],
      },
      {
        id: 'vf-prac-5',
        prompt:
          'Jika feeder bekerja pada f = 24 Hz dan sistem isolasi pegas koilnya memiliki frekuensi alami fₙ = 6,0 Hz, berapakah rasio frekuensi r = f / fₙ?',
        hint: 'Bagi frekuensi penggerak dengan frekuensi alami.',
        targetValue: 4.0,
        unit: '',
        tolerance: 0.05,
        solutionSteps: ['Rasio frekuensi r = f / fₙ = 24 / 6,0 = 4,0'],
      },
    ],
    quiz: [
      {
        id: 'vf-quiz-1',
        question:
          'Berapakah nilai minimum indeks lempar Kᵥ agar material curah terangkat dari dek bak dan masuk ke rezim micro-throwing?',
        options: ['Kᵥ > 0,25', 'Kᵥ > 0,50', 'Kᵥ > 1,00', 'Kᵥ > 5,00'],
        correctIndex: 2,
        explanation:
          'Saat Kᵥ > 1,00, percepatan normal ke atas pada bak melebihi komponen gravitasi normal, sehingga partikel melompat maju secara mikro.',
      },
      {
        id: 'vf-quiz-2',
        question:
          'Mengapa sebagian besar vibrating feeder industri dirancang beroperasi di zona super-resonan (f / fₙ > 2,0)?',
        options: [
          'Untuk memaksimalkan gaya dinamis ke pondasi bangunan',
          'Untuk mencapai efisiensi isolasi getaran tinggi (> 75%) dan menjaga beban pondasi tetap rendah',
          'Untuk mencegah partikel memantul di bak',
          'Untuk meniadakan kebutuhan pegas koil',
        ],
        correctIndex: 1,
        explanation:
          'Beroperasi jauh di atas frekuensi alami (r = f / fₙ > 2,0) menjaga transmisibilitas T_R tetap rendah, sehingga sebagian besar gaya getar terisolasi dari struktur.',
      },
      {
        id: 'vf-quiz-3',
        question:
          'Gangguan apa yang terjadi ketika material berhenti keluar dari corong meskipun bak bergetar pada amplitudo dan frekuensi normal?',
        options: [
          'Pegas koil patah',
          'Penyumbatan corong (hopper bridging / arching)',
          'Indeks lempar berlebih',
          'Efisiensi isolasi tinggi',
        ],
        correctIndex: 1,
        explanation:
          'Material lembap atau kohesif dapat membentuk lengkungan penahan beban di atas leher corong ("bridging"), membuat bak kehabisan umpan sementara penggerak tetap bergetar normal.',
      },
      {
        id: 'vf-quiz-4',
        question:
          'Pada vibrating feeder eksentrik ganda, apa yang terjadi jika satu poros mengalami slip fasa terhadap poros lainnya?',
        options: [
          'Langkah lempar linier terarah turun dan timbul getaran oleng (rocking) yang tidak diinginkan',
          'Laju aliran massa langsung berlipat ganda',
          'Frekuensi alami naik 50%',
          'Bukaan gerbang membesar otomatis',
        ],
        correctIndex: 0,
        explanation:
          'Poros eksentrik yang berputar berlawanan arah hanya meniadakan gaya lateral saat tersinkronisasi. Slip fasa mengurangi langkah lempar efektif dan memicu getaran oleng.',
      },
      {
        id: 'vf-quiz-5',
        question:
          'Bagaimana dampak kenaikan indeks lempar Kᵥ jauh di atas 3,5 pada vibrating feeder?',
        options: [
          'Menghilangkan seluruh keausan liner',
          'Menyebabkan pantulan agresif, kebisingan meningkat, dan keausan liner bak lebih cepat',
          'Membekukan lapisan material di tempat',
          'Menurunkan percepatan puncak di bawah 1 g',
        ],
        correctIndex: 1,
        explanation:
          'Nilai Kᵥ berlebih (> 3,3–3,5) memicu tumbukan partikel yang keras, operasi bising, kerusakan butiran rapuh, dan keausan cepat pada pelapis bak.',
      },
      {
        id: 'vf-quiz-6',
        question:
          'Jika salah satu pegas koil penopang patah saat operasi, gejala mekanis langsung apa yang muncul?',
        options: [
          'Kekakuan pegas turun, defleksi statis meningkat, dan bak miring secara asimetris',
          'Frekuensi penggerak otomatis berlipat ganda',
          'Densitas curah material meningkat',
          'Sudut lempar menjadi 90°',
        ],
        correctIndex: 0,
        explanation:
          'Pegas koil yang patah menurunkan kekakuan total penopang, menyebabkan penurunan statis lebih besar di sisi yang rusak, kemiringan bak, ketebalan material tidak merata, dan tegangan rangka tinggi.',
      },
    ],
  },
  ja: {
    title: '振動フィーダ＆ホッパー流動',
    shortTitle: '振動フィーダ',
    description:
      '投擲指数 (Kᵥ)、マイクロ投擲による輸送速度、ゲート開度制御の質量流量 (t/h)、および超共振コイルばね防振を解析し、ばね破損・ホッパーブリッジ・偏心位相ずれを診断します。',
    explore: [
      {
        title: '投擲指数 (Kᵥ) とマイクロ投擲の運動学',
        summary:
          '振動フィーダは、傾斜トラフを周波数 f、全振幅ストローク 2A、投擲角 β で振動させて粉粒体を前進させます。トラフ垂直方向の加速度成分が重力の垂直成分を上回ると（Kᵥ > 1.0）、粒子がライナ面から微小放物線を描いて跳躍し（「マイクロ投擲」）、前方へ輸送されます。',
        equations: [
          {
            label: '角振動数と最大加速度',
            formula: 'ω = 2πf,   a_max = A · ω²   [m/s²]',
            note: 'A = 片振幅 = (全振幅ストローク) / 2 [m]',
          },
          {
            label: '投擲指数（Gファクタ比）',
            formula: 'Kᵥ = (A · ω² · sin β) / (g · cos α)',
            note: 'β = トラフ面に対する投擲角、α = トラフ下向き勾配角。マイクロ投擲には Kᵥ > 1.0 が必要（標準 1.8〜3.2）',
          },
          {
            label: '平均輸送速度',
            formula: 'v_c ≈ A · ω · cos β · η_throw · (1 + 0.035 α)',
            note: 'η_throw は Kᵥ > 1.0 で増加。Kᵥ < 1.0 では低速の滑走輸送のみ',
          },
        ],
        workedExample: {
          title: '二軸偏心振動フィーダの投擲指数 Kᵥ の計算',
          given: [
            '駆動周波数 f = 24 Hz (ω = 150.8 rad/s)',
            '全振幅ストローク 2A = 6.0 mm (片振幅 A = 3.0 mm = 0.003 m)',
            '投擲角 β = 22°、トラフ下向き勾配 α = 5°',
          ],
          steps: [
            '最大加速度を計算: a_max = 0.003 × (150.8)² = 68.22 m/s² (6.96 g)',
            '垂直投擲成分を計算: a_max · sin(22°) = 68.22 × 0.3746 = 25.56 m/s²',
            'g · cos(5°) = 9.807 × 0.9962 = 9.77 m/s² で割る → Kᵥ = 25.56 / 9.77 = 2.62',
          ],
          answer:
            'Kᵥ = 2.62（最適なマイクロ投擲領域：ライナ摩耗を抑えつつ円滑な輸送が可能）',
        },
      },
      {
        title: 'ゲート開度制御の体積流量と質量流量',
        summary:
          'ホッパーヘッドが安定した状態では、トラフ幅 W と調整可能な垂直ゲート開度 H が材料層の断面積を決定します。この断面積に輸送速度 v_c、層充填率 η_fill（せん断遅れにより約 0.85）、かさ密度 ρ を掛けることで質量流量 [t/h] が求まります。',
        equations: [
          {
            label: '体積流量',
            formula: 'Q_vol = 3600 · W · H · v_c · η_fill   [m³/h]',
            note: 'W = トラフ幅 [m]、H = ゲート開度 [m]、v_c = 輸送速度 [m/s]',
          },
          {
            label: '質量流量',
            formula: 'ṁ = (Q_vol · ρ) / 1000   [t/h]',
            note: 'ρ = かさ密度 [kg/m³]（石灰石 ≈ 1600、石炭 ≈ 850、鉄鉱石 ≈ 2450）',
          },
        ],
        workedExample: {
          title: '砕石（石灰石）用フィーダの処理能力計算',
          given: [
            'トラフ幅 W = 600 mm (0.60 m)、ゲート開度 H = 120 mm (0.12 m)',
            '輸送速度 v_c = 0.38 m/s (22.8 m/min)、層充填率 η_fill = 0.85',
            '石灰石かさ密度 ρ = 1600 kg/m³',
          ],
          steps: [
            '流動断面積: A_flow = 0.60 × 0.12 × 0.85 = 0.0612 m²',
            '体積流量: Q_vol = 3600 × 0.0612 × 0.38 = 83.72 m³/h',
            '質量流量: ṁ = (83.72 × 1600) / 1000 = 134.0 t/h',
          ],
          answer: '質量流量 ṁ = 134.0 t/h',
        },
      },
      {
        title: 'コイルばね防振・共振比と故障モード',
        summary:
          '振動フィーダは架台への動的荷重を遮断するためコイルばねで支持されます。産業用フィーダは伝達率を低く抑えるため超共振領域（f / fₙ > 2.0）で運転します。ばね破損は剛性低下とトラフ傾斜を招き、ホッパーブリッジは供給を遮断し、偏心位相ずれは直線投擲を損ないます。',
        equations: [
          {
            label: '固有振動数と共振比',
            formula: 'fₙ = (1 / 2π) · √(k_eff / M_total),   r = f / fₙ',
            note: '共振危険領域 (0.75 ≤ r ≤ 1.35) を回避し、防振効率 > 75% のため r > 2.0 を目標とする',
          },
          {
            label: '力伝達率',
            formula: 'T_R = √(1 + (2ζr)²) / √((1 − r²)² + (2ζr)²)',
            note: '防振効率 η_iso = (1 − T_R) × 100%、鋼製コイルばねの減衰比 ζ ≈ 0.06',
          },
        ],
        workedExample: {
          title: 'ばね防振効率の評価',
          given: [
            '駆動周波数 f = 24 Hz、フィーダ固有振動数 fₙ = 6.0 Hz',
            'コイルばね減衰比 ζ = 0.06',
          ],
          steps: [
            '振動数比: r = 24 / 6.0 = 4.0',
            '分母 √((1 − 16)² + (2 × 0.06 × 4)²) = √(225 + 0.23) = 15.01',
            '分子 √(1 + 0.23) = 1.11 → T_R = 1.11 / 15.01 = 0.074',
            '防振効率: η_iso = (1 − 0.074) × 100% = 92.6%',
          ],
          answer: 'T_R = 0.074（動的加振力の 92.6% を基礎から遮断）',
        },
      },
    ],
    practice: [
      {
        id: 'vf-prac-1',
        prompt:
          '振動フィーダが f = 25 Hz、全振幅ストローク 8.0 mm（片振幅 A = 4.0 mm）で運転しています。最大加速度 a_max [m/s²] を計算してください。',
        hint: 'a_max = A · (2πf)²（A = 0.004 m）を使用します。',
        targetValue: 98.7,
        unit: 'm/s²',
        tolerance: 1.0,
        solutionSteps: [
          '角振動数: ω = 2π × 25 = 157.08 rad/s',
          '片振幅: A = 4.0 mm = 0.004 m',
          '最大加速度: a_max = 0.004 × (157.08)² = 98.70 m/s²',
        ],
      },
      {
        id: 'vf-prac-2',
        prompt:
          '最大加速度 a_max = 68.2 m/s²、投擲角 β = 22°、トラフ下向き勾配 α = 5° のフィーダについて、投擲指数 Kᵥ を求めてください（g = 9.81 m/s²）。',
        hint: 'Kᵥ = (a_max · sin β) / (g · cos α) を使用します。',
        targetValue: 2.61,
        unit: '',
        tolerance: 0.06,
        solutionSteps: [
          '垂直加速度成分: 68.2 × sin(22°) = 68.2 × 0.3746 = 25.55 m/s²',
          '垂直重力成分: 9.81 × cos(5°) = 9.81 × 0.9962 = 9.77 m/s²',
          '投擲指数: Kᵥ = 25.55 / 9.77 = 2.615 ≈ 2.61',
        ],
      },
      {
        id: 'vf-prac-3',
        prompt:
          'トラフ幅 W = 0.80 m、ゲート開度 H = 0.15 m のフィーダで、砕鉱（ρ = 2000 kg/m³）を v_c = 0.30 m/s、層充填率 η_fill = 0.85 で輸送しています。質量流量 ṁ [t/h] を計算してください。',
        hint: 'ṁ = (3600 × W × H × v_c × η_fill × ρ) / 1000 を使用します。',
        targetValue: 220.3,
        unit: 't/h',
        tolerance: 2.5,
        solutionSteps: [
          '体積流量: Q_vol = 3600 × 0.80 × 0.15 × 0.30 × 0.85 = 110.16 m³/h',
          '質量流量: ṁ = (110.16 × 2000) / 1000 = 220.32 t/h',
        ],
      },
      {
        id: 'vf-prac-4',
        prompt:
          '防振支持された振動フィーダの振動部総質量が 600 kg、コイルばね総剛性が k = 850,000 N/m のとき、固有振動数 fₙ [Hz] を計算してください。',
        hint: 'fₙ = (1 / 2π) · √(k / M) を使用します。',
        targetValue: 5.99,
        unit: 'Hz',
        tolerance: 0.15,
        solutionSteps: [
          'ωₙ = √(850,000 / 600) = √1416.67 = 37.64 rad/s',
          'fₙ = 37.64 / (2π) = 5.99 Hz',
        ],
      },
      {
        id: 'vf-prac-5',
        prompt:
          '駆動周波数 f = 24 Hz、コイルばね防振系の固有振動数 fₙ = 6.0 Hz の場合、振動数比 r = f / fₙ はいくらですか？',
        hint: '駆動周波数を固有振動数で割ります。',
        targetValue: 4.0,
        unit: '',
        tolerance: 0.05,
        solutionSteps: ['振動数比 r = f / fₙ = 24 / 6.0 = 4.0'],
      },
    ],
    quiz: [
      {
        id: 'vf-quiz-1',
        question:
          '粉粒体がトラフ面から浮き上がり「マイクロ投擲」領域に入るために必要な投擲指数 Kᵥ の最小値はどれですか？',
        options: ['Kᵥ > 0.25', 'Kᵥ > 0.50', 'Kᵥ > 1.00', 'Kᵥ > 5.00'],
        correctIndex: 2,
        explanation:
          'Kᵥ > 1.00 になるとトラフ上向き垂直加速度が重力の垂直成分を上回り、粒子が微小跳躍しながら前進できるようになります。',
      },
      {
        id: 'vf-quiz-2',
        question:
          'ほとんどの産業用振動フィーダが超共振領域（f / fₙ > 2.0）で運転するように設計されている理由は何ですか？',
        options: [
          '建屋基礎への動的加振力を最大化するため',
          '高い防振効率（> 75%）を達成し、基礎への伝達荷重を小さく抑えるため',
          'トラフ上での粒子の跳躍を防ぐため',
          'コイルばねを不要にするため',
        ],
        correctIndex: 1,
        explanation:
          '固有振動数より十分に高い周波数（r = f / fₙ > 2.0）で運転することで力伝達率 T_R が低下し、加振力の大部分が支持構造から遮断されます。',
      },
      {
        id: 'vf-quiz-3',
        question:
          'トラフは正常な振幅・周波数で振動しているにもかかわらず、ホッパーからの材料排出が止まった場合に疑われる異常はどれですか？',
        options: [
          'コイルばねの破損',
          'ホッパーブリッジ（棚吊り・アーチ閉塞）',
          '過大な投擲指数',
          '高い防振効率',
        ],
        correctIndex: 1,
        explanation:
          '付着性や湿分のある粉粒体はホッパー喉部で自立アーチ（「ブリッジ」）を形成し、加振機が正常に動いていてもトラフへの供給が途絶えます。',
      },
      {
        id: 'vf-quiz-4',
        question:
          '二軸偏心式振動フィーダにおいて、一方の軸に位相ずれ（スリップ）が生じるとどうなりますか？',
        options: [
          '指向性のある直線ストロークが低下し、不要なローリング振動が発生する',
          '質量流量が即座に2倍になる',
          '固有振動数が50%上昇する',
          'ゲート開度が自動的に広がる',
        ],
        correctIndex: 0,
        explanation:
          '逆回転する二軸偏心錘は位相同期時にのみ横方向力を打ち消し合い直線加振力を生みます。位相がずれると有効ストロークが減少し、ローリング振動が生じます。',
      },
      {
        id: 'vf-quiz-5',
        question:
          '投擲指数 Kᵥ を 3.5 より大幅に大きくした場合、振動フィーダにどのような影響が出ますか？',
        options: [
          'ライナの摩耗が完全になくなる',
          '激しい跳躍、騒音増大、およびトラフライナの急速な摩耗を引き起こす',
          '材料層がその場で停止する',
          '最大加速度が 1 g 未満に低下する',
        ],
        correctIndex: 1,
        explanation:
          'Kᵥ が過大（> 3.3〜3.5）になると粒子の激しい衝撃跳躍・騒音・破砕・トラフライナの早期摩耗を招きます。',
      },
      {
        id: 'vf-quiz-6',
        question:
          '運転中に支持コイルばねの1本が破損した場合、直ちに現れる機械的症状はどれですか？',
        options: [
          'ばね剛性が低下し、静的たわみが増加してトラフが非対称に傾く',
          '駆動周波数が自動的に2倍になる',
          '材料のかさ密度が増加する',
          '投擲角が 90° になる',
        ],
        correctIndex: 0,
        explanation:
          'コイルばねが破損すると総支持剛性が低下し、破損側の沈み込み増大、トラフの傾斜、層厚の不均一、およびフレームへの過大応力が発生します。',
      },
    ],
  },
});
