import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('bucket-elevator', {
  id: {
    title: 'Lab Bucket Elevator & Pembuangan Sentrifugal',
    shortTitle: 'Bucket Elevator',
    description:
      'Analisis kinematika bucket elevator vertikal, kriteria bilangan Froude dan jarak kutub (pole distance), kapasitas massa (t/h), daya penggerak, serta diagnostik gangguan seperti slip sabuk dan penyumbatan boot.',
    explore: [
      {
        title: 'Pembuangan Sentrifugal vs. Gravitasi (Bilangan Froude & Jarak Kutub)',
        summary:
          'Saat bucket berputar melewati puli kepala, material curah mengalami gaya gravitasi ke bawah (g) dan percepatan sentrifugal ke luar (ω²R_eff). Untuk pembuangan sentrifugal yang bersih ke corong buang, bilangan Froude Fr = ω²R_eff / g harus minimal 1,0, artinya jarak kutub h_p = g / ω² berada di dalam radius efektif pusat massa bucket R_eff. Jika RPM turun terlalu rendah (misalnya saat slip sabuk), Fr < 1,0 dan material jatuh prematur di dalam casing (back-spill).',
        equations: [
          {
            label: 'Kecepatan Linier Sabuk / Rantai',
            formula: 'v = (π × D × N) / 60  [m/s]',
            note: 'D = diameter puli kepala (m), N = putaran puli kepala (RPM)',
          },
          {
            label: 'Kriteria Jarak Kutub (Pole Distance)',
            formula: 'h_p = g / ω² = 894,5 / N²  [m]',
            note: 'Pembuangan sentrifugal memerlukan h_p < R_eff (kutub berada di dalam lintasan pusat massa bucket)',
          },
          {
            label: 'Bilangan Froude Puli Kepala',
            formula: 'Fr = (ω² × R_eff) / g = R_eff / h_p',
            note: 'Fr ≥ 1,0: Sentrifugal; 0,72 ≤ Fr < 1,0: Transisi; Fr < 0,72: Jatuh gravitasi / back-spill',
          },
        ],
        workedExample: {
          title: 'Pemeriksaan Pembuangan Sentrifugal pada Puli Kepala 450 mm',
          given: [
            'Diameter puli kepala D = 450 mm (R = 0,225 m), offset pusat massa bucket = 0,070 m → R_eff = 0,295 m',
            'Putaran operasi N = 60 RPM (ω = 2π × 60 / 60 = 6,283 rad/s)',
          ],
          steps: [
            'Hitung jarak kutub: h_p = 9,807 / (6,283)² = 0,248 m',
            'Hitung bilangan Froude: Fr = R_eff / h_p = 0,295 / 0,248 = 1,19',
            'Karena Fr = 1,19 > 1,0, gaya sentrifugal melampaui gravitasi di titik mati atas.',
          ],
          answer: 'Fr = 1,19 (Pembuangan sentrifugal bersih ke corong buang)',
        },
      },
      {
        title: 'Kapasitas Volume & Massa serta Daya Angkat Penggerak',
        summary:
          'Kapasitas bucket elevator bergantung pada volume bucket V, jarak antar bucket S, faktor pengisian η_fill (umumnya 65%–85%), kecepatan sabuk v, dan densitas curah ρ. Daya poros harus mengatasi energi potensial angkat vertikal sekaligus tahanan penggalian di bagian boot.',
        equations: [
          {
            label: 'Kapasitas Volumetrik',
            formula: 'Q_v = 3600 × (V_L / S_mm) × η_fill × v  [m³/h]',
            note: 'V_L = volume bucket (L), S_mm = jarak antar bucket (mm)',
          },
          {
            label: 'Kapasitas Massa',
            formula: 'Q_m = (Q_v × ρ) / 1000  [t/h]',
            note: 'ρ = densitas curah material (kg/m³)',
          },
          {
            label: 'Daya Angkat Bersih & Daya Motor',
            formula: 'P_lift = (Q_m × g × H) / 3600  [kW]',
            note: 'Kalikan P_lift dengan faktor gali (~1,18) + rugi diam, lalu bagi efisiensi penggerak η_drive',
          },
        ],
        workedExample: {
          title: 'Kapasitas & Daya Angkat Elevator Biji-Bijian 15 m',
          given: [
            'Volume bucket V = 4,5 L, jarak S = 300 mm, faktor isi η_fill = 0,80',
            'Kecepatan sabuk v = 2,0 m/s, densitas curah gandum ρ = 750 kg/m³, tinggi angkat H = 15 m',
          ],
          steps: [
            'Aliran volumetrik: Q_v = 3600 × (4,5 / 300) × 0,80 × 2,0 = 86,4 m³/h',
            'Aliran massa: Q_m = (86,4 × 750) / 1000 = 64,8 t/h',
            'Daya angkat bersih: P_lift = (64,8 × 9,81 × 15) / 3600 = 2,65 kW',
          ],
          answer: 'Q_m = 64,8 t/h; Daya angkat bersih = 2,65 kW (≈ 3,9 kW input motor termasuk rugi boot)',
        },
      },
    ],
    practice: [
      {
        id: 'be-prac-1',
        prompt:
          'Sebuah bucket elevator memiliki puli kepala berdiameter 500 mm yang berputar pada 60 RPM. Hitung kecepatan linier sabuk v dalam m/s.',
        hint: 'Gunakan v = (π × D × N) / 60 dengan D = 0,50 m.',
        solutionSteps: [
          'Konversi diameter puli ke meter: D = 500 / 1000 = 0,50 m',
          'Hitung kecepatan sabuk: v = (π × 0,50 × 60) / 60 = 1,571 m/s',
        ],
      },
      {
        id: 'be-prac-2',
        prompt:
          'Pada putaran puli kepala 50 RPM, berapakah jarak kutub h_p (dalam m)? Gunakan g = 9,81 m/s².',
        hint: 'Hitung ω = 2πN / 60, lalu h_p = g / ω².',
        solutionSteps: [
          'Kecepatan sudut: ω = (2π × 50) / 60 = 5,236 rad/s',
          'Jarak kutub: h_p = 9,81 / (5,236)² = 9,81 / 27,416 = 0,358 m ≈ 0,36 m',
        ],
      },
      {
        id: 'be-prac-3',
        prompt:
          'Sebuah elevator membawa bucket 4,5 L berjarak 300 mm dengan faktor isi 80% pada v = 2,0 m/s. Jika densitas curah 750 kg/m³, hitung kapasitas massa Q_m dalam t/h.',
        hint: 'Cari Q_v = 3600 × (4,5 / 300) × 0,80 × 2,0 terlebih dahulu, lalu kalikan 750 / 1000.',
        solutionSteps: [
          'Kapasitas volumetrik: Q_v = 3600 × (4,5 / 300) × 0,80 × 2,0 = 86,4 m³/h',
          'Kapasitas massa: Q_m = (86,4 × 750) / 1000 = 64,8 t/h',
        ],
      },
      {
        id: 'be-prac-4',
        prompt:
          'Hitung daya angkat vertikal murni P_lift (dalam kW) untuk mengangkat 90 t/h material setinggi H = 20 m (gunakan g = 9,81 m/s²).',
        hint: 'Gunakan P_lift = (Q_m × g × H) / 3600.',
        solutionSteps: [
          'P_lift = (90 × 9,81 × 20) / 3600',
          'P_lift = 17.658 / 3600 = 4,905 kW ≈ 4,91 kW',
        ],
      },
    ],
    quiz: [
      {
        id: 'be-quiz-1',
        question:
          'Syarat apa yang harus dipenuhi bilangan Froude Fr pada puli kepala untuk pembuangan sentrifugal yang bersih?',
        options: [
          'Fr < 0,5',
          'Fr ≥ 1,0 (jarak kutub h_p < radius efektif R_eff)',
          'Fr = 0,0',
          'Fr harus sama dengan tinggi angkat dalam meter',
        ],
        explanation:
          'Pembuangan sentrifugal terjadi saat percepatan sentrifugal ke luar ω²R_eff melampaui gravitasi g, yaitu Fr ≥ 1,0 (atau h_p < R_eff).',
      },
      {
        id: 'be-quiz-2',
        question:
          'Apa yang terjadi di dalam bucket elevator sentrifugal ketika slip sabuk parah menurunkan RPM puli kepala sebesar 35–40%?',
        options: [
          'Kapasitas massa meningkat otomatis',
          'Bilangan Froude turun di bawah 1,0, menyebabkan jatuh gravitasi prematur dan tumpah balik (back-spill)',
          'Jarak lemparan buang berlipat ganda',
          'Hambatan gali di boot turun menjadi nol',
        ],
        explanation:
          'Karena Fr sebanding dengan RPM², penurunan RPM 38% memangkas Fr lebih dari 60%, membuat material jatuh keluar sebelum mencapai mulut corong buang.',
      },
      {
        id: 'be-quiz-3',
        question:
          'Gangguan apa yang ditandai dengan lonjakan daya motor dan torsi poros kepala secara tiba-tiba sementara RPM puli kepala tetap normal?',
        options: [
          'Penyumbatan boot (boot choke) / beban berlebih di rumah bawah',
          'Bucket hilang',
          'Diameter puli kepala terlalu besar',
          'Densitas curah rendah',
        ],
        explanation:
          'Penyumbatan boot menumpuk material di sekitar puli ekor sehingga bucket harus membajak material padat dan melonjakkan arus motor.',
      },
      {
        id: 'be-quiz-4',
        question:
          'Apa fungsi utama rakitan screw take-up pada puli ekor (boot)?',
        options: [
          'Memperbesar volume bucket',
          'Menjaga tegangan sabuk/rantai yang tepat dan mencegah slip pada puli kepala',
          'Mendinginkan material curah',
          'Mengukur densitas curah',
        ],
        explanation:
          'Take-up di bagian boot menegangkan sabuk atau rantai untuk menjaga traksi pada puli penggerak kepala serta mengompensasi mulurnya sabuk/rantai.',
      },
    ],
  },
  ja: {
    title: 'バケットエレベータ＆遠心排出ラボ',
    shortTitle: 'バケットエレベータ',
    description:
      '垂直バケットエレベータの運動学、フルード数と極距離による排出判定、質量輸送量 (t/h)、所要動力、およびベルトスリップやブーツ詰まりなどの異常診断を解析します。',
    explore: [
      {
        title: '遠心排出と重力排出（フルード数と極距離）',
        summary:
          'バケットがヘッドプーリを通過する際、搬送物には下向きの重力 (g) と外向きの遠心加速度 (ω²R_eff) が働きます。排出口シュートへ確実に遠心排出するには、フルード数 Fr = ω²R_eff / g ≥ 1.0（極距離 h_p = g / ω² がバケット重心有効半径 R_eff より小さい）が必要です。ベルトスリップ等で回転数が低下すると Fr < 1.0 となり、ケーシング内への早期落下（逆流・バックスピル）が発生します。',
        equations: [
          {
            label: 'ベルト／チェーン速度',
            formula: 'v = (π × D × N) / 60  [m/s]',
            note: 'D = ヘッドプーリ径 (m), N = ヘッドプーリ回転数 (RPM)',
          },
          {
            label: '極距離（ポール距離）条件',
            formula: 'h_p = g / ω² = 894.5 / N²  [m]',
            note: '遠心排出には h_p < R_eff（極がバケット重心軌道の内側）が必要',
          },
          {
            label: 'ヘッドプーリ・フルード数',
            formula: 'Fr = (ω² × R_eff) / g = R_eff / h_p',
            note: 'Fr ≥ 1.0: 遠心排出、0.72 ≤ Fr < 1.0: 遷移域、Fr < 0.72: 重力落下（逆流）',
          },
        ],
        workedExample: {
          title: 'φ450 mm ヘッドプーリの遠心排出チェック',
          given: [
            'ヘッドプーリ径 D = 450 mm (R = 0.225 m)、バケット重心突出量 = 0.070 m → R_eff = 0.295 m',
            '運転回転数 N = 60 RPM (ω = 2π × 60 / 60 = 6.283 rad/s)',
          ],
          steps: [
            '極距離を計算: h_p = 9.807 / (6.283)² = 0.248 m',
            'フルード数を計算: Fr = R_eff / h_p = 0.295 / 0.248 = 1.19',
            'Fr = 1.19 > 1.0 のため、頂点付近で遠心力が重力を上回ります。',
          ],
          answer: 'Fr = 1.19（排出口シュートへの正常な遠心排出）',
        },
      },
      {
        title: '体積・質量輸送量および揚程所要動力',
        summary:
          'バケットエレベータの輸送量は、バケット容量 V、取付ピッチ S、充填率 η_fill（通常 65%–85%）、ベルト速度 v、およびかさ密度 ρ で決まります。軸動力は垂直揚程の位置エネルギーに加え、ブーツ部での掬い上げ抵抗を上回る必要があります。',
        equations: [
          {
            label: '体積輸送量',
            formula: 'Q_v = 3600 × (V_L / S_mm) × η_fill × v  [m³/h]',
            note: 'V_L = バケット容量 (L), S_mm = バケットピッチ (mm)',
          },
          {
            label: '質量輸送量',
            formula: 'Q_m = (Q_v × ρ) / 1000  [t/h]',
            note: 'ρ = 搬送物のかさ密度 (kg/m³)',
          },
          {
            label: '正味揚程動力とモータ動力',
            formula: 'P_lift = (Q_m × g × H) / 3600  [kW]',
            note: 'P_lift に掬い上げ係数（約1.18）と無負荷損失を加え、駆動効率 η_drive で除算',
          },
        ],
        workedExample: {
          title: '揚程 15 m 穀物エレベータの輸送量と動力',
          given: [
            'バケット容量 V = 4.5 L、ピッチ S = 300 mm、充填率 η_fill = 0.80',
            'ベルト速度 v = 2.0 m/s、小麦かさ密度 ρ = 750 kg/m³、揚程 H = 15 m',
          ],
          steps: [
            '体積流量: Q_v = 3600 × (4.5 / 300) × 0.80 × 2.0 = 86.4 m³/h',
            '質量流量: Q_m = (86.4 × 750) / 1000 = 64.8 t/h',
            '正味揚程動力: P_lift = (64.8 × 9.81 × 15) / 3600 = 2.65 kW',
          ],
          answer: 'Q_m = 64.8 t/h、正味揚程動力 = 2.65 kW（ブーツ抵抗等を含めたモータ入力は約 3.9 kW）',
        },
      },
    ],
    practice: [
      {
        id: 'be-prac-1',
        prompt:
          '直径 500 mm のヘッドプーリが 60 RPM で回転するバケットエレベータのベルト速度 v (m/s) を求めなさい。',
        hint: 'D = 0.50 m として v = (π × D × N) / 60 を用います。',
        solutionSteps: [
          'プーリ径をメートルに換算: D = 500 / 1000 = 0.50 m',
          'ベルト速度: v = (π × 0.50 × 60) / 60 = 1.571 m/s',
        ],
      },
      {
        id: 'be-prac-2',
        prompt:
          'ヘッドプーリ回転数が 50 RPM のとき、極距離 h_p (m) はいくらですか？（g = 9.81 m/s²）',
        hint: 'ω = 2πN / 60 を求め、h_p = g / ω² を計算します。',
        solutionSteps: [
          '角速度: ω = (2π × 50) / 60 = 5.236 rad/s',
          '極距離: h_p = 9.81 / (5.236)² = 9.81 / 27.416 = 0.358 m ≈ 0.36 m',
        ],
      },
      {
        id: 'be-prac-3',
        prompt:
          '容量 4.5 L のバケットを 300 mm ピッチで配置し、充填率 80%、速度 v = 2.0 m/s で運転しています。かさ密度が 750 kg/m³ のとき、質量輸送量 Q_m (t/h) を求めなさい。',
        hint: 'まず Q_v = 3600 × (4.5 / 300) × 0.80 × 2.0 を求め、750 / 1000 を掛けます。',
        solutionSteps: [
          '体積輸送量: Q_v = 3600 × (4.5 / 300) × 0.80 × 2.0 = 86.4 m³/h',
          '質量輸送量: Q_m = (86.4 × 750) / 1000 = 64.8 t/h',
        ],
      },
      {
        id: 'be-prac-4',
        prompt:
          '90 t/h の搬送物を揚程 H = 20 m まで垂直に持ち上げるのに必要な正味揚程動力 P_lift (kW) を求めなさい（g = 9.81 m/s²）。',
        hint: 'P_lift = (Q_m × g × H) / 3600 を使用します。',
        solutionSteps: [
          'P_lift = (90 × 9.81 × 20) / 3600',
          'P_lift = 17,658 / 3600 = 4.905 kW ≈ 4.91 kW',
        ],
      },
    ],
    quiz: [
      {
        id: 'be-quiz-1',
        question:
          'ヘッドプーリで正常な遠心排出を行うために、フルード数 Fr が満たすべき条件はどれですか？',
        options: [
          'Fr < 0.5',
          'Fr ≥ 1.0（極距離 h_p < 有効半径 R_eff）',
          'Fr = 0.0',
          'Fr が揚程（m）と等しいこと',
        ],
        explanation:
          '遠心排出は外向きの遠心加速度 ω²R_eff が重力 g を上回るとき、すなわち Fr ≥ 1.0（h_p < R_eff）で成立します。',
      },
      {
        id: 'be-quiz-2',
        question:
          '遠心排出式バケットエレベータで、激しいベルトスリップによりヘッドプーリ回転数が 35〜40% 低下すると何が起こりますか？',
        options: [
          '質量輸送量が自動的に増加する',
          'フルード数が 1.0 未満に低下し、早期重力落下とケーシング内への逆流（バックスピル）が発生する',
          '排出飛距離が 2 倍になる',
          'ブーツ部の掬い上げ抵抗がゼロになる',
        ],
        explanation:
          'Fr は RPM² に比例するため、回転数が 38% 低下すると Fr は 60% 以上低下し、排出口に届く前に搬送物が落下してしまいます。',
      },
      {
        id: 'be-quiz-3',
        question:
          'ヘッドプーリ回転数は正常なまま、モータ動力とヘッド軸トルクが急上昇する異常はどれですか？',
        options: [
          'ブーツ詰まり（ブーツチョーク）／下部ケーシングの過負荷',
          'バケット欠損',
          'ヘッドプーリ径の過大',
          'かさ密度の低下',
        ],
        explanation:
          'ブーツ詰まりが発生するとテールプーリ周囲に搬送物が堆積し、バケットの掬い上げ抵抗とモータ電流が急増します。',
      },
      {
        id: 'be-quiz-4',
        question:
          'ブーツ（テール）プーリに設けられたスクリューテイクアップ装置の主な目的は何ですか？',
        options: [
          'バケット容量を増やすこと',
          'ベルト／チェーンの張力を適切に保ち、ヘッドプーリのスリップを防ぐこと',
          '搬送物を冷却すること',
          'かさ密度を測定すること',
        ],
        explanation:
          'ブーツ部のテイクアップはベルトやチェーンに適切な張力を与え、駆動プーリのスリップ防止と伸びの吸収を行います。',
      },
    ],
  },
});
