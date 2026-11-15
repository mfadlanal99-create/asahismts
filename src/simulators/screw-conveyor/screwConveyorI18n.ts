import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('screw-conveyor', {
  id: {
    title: 'Konveyor Sekrup CEMA & Transportasi Auger',
    shortTitle: 'Konveyor Sekrup',
    description:
      'Analisis kapasitas volumetrik dan massa konveyor sekrup CEMA 350, batas pengisian palung (15%, 30%, 45%), derating kemiringan, rincian torsi dan daya penggerak, serta diagnosis panas berlebih bantalan gantung, keausan daun ulir, dan kemacetan akibat overfill.',
    explore: [
      {
        title: 'Persamaan Kapasitas Volumetrik & Massa CEMA',
        summary:
          'Konveyor sekrup heliks mendorong material curah secara aksial sepanjang palung U stasioner. Kapasitas volumetrik bergantung pada luas penampang anulus antara diameter luar sekrup (D) dan diameter pipa pusat (d), pitch ulir (P), kecepatan putar (N), serta persentase pengisian palung CEMA (15%, 30%, atau 45%).',
        equations: [
          {
            label: 'Luas Penampang Anulus Sekrup',
            formula: 'A_s = (π / 4) × (D² − d²)  [m²]',
            note: 'D = diameter luar sekrup (m), d = diameter luar pipa pusat (m)',
          },
          {
            label: 'Kapasitas Pengangkutan Volumetrik',
            formula: 'Q_v = 60 × A_s × P × N × (Fill% / 100) × K_θ  [m³/h]',
            note: 'P = pitch ulir (m), N = kecepatan putar (RPM), K_θ = faktor kemiringan',
          },
          {
            label: 'Kapasitas Pengangkutan Massa',
            formula: 'Q_m = (Q_v × ρ_b) / 1000  [t/h]',
            note: 'ρ_b = densitas curah material (kg/m³)',
          },
        ],
        workedExample: {
          title: 'Kapasitas Konveyor Sekrup Gandum Horizontal',
          given: [
            'Diameter luar sekrup D = 300 mm (0,30 m), diameter pipa d = 73 mm (0,073 m)',
            'Pitch standar P = 300 mm (0,30 m), putaran N = 60 RPM',
            'Pengisian palung = 45% (gandum mengalir bebas, ρ_b = 750 kg/m³), horizontal (K_θ = 1,0)',
          ],
          steps: [
            'Luas anulus: A_s = (π / 4) × (0,30² − 0,073²) = 0,0665 m²',
            'Kapasitas volumetrik: Q_v = 60 × 0,0665 × 0,30 × 60 × 0,45 × 1,0 = 32,32 m³/h',
            'Kapasitas massa: Q_m = (32,32 × 750) / 1000 = 24,24 t/h',
          ],
          answer: 'Q_v = 32,3 m³/h dan Q_m = 24,2 t/h',
        },
      },
      {
        title: 'Aturan Pengisian Palung & Derating Kemiringan (K_θ)',
        summary:
          'CEMA 350 membatasi pengisian palung hingga 15% untuk material abrasif/berat (pasir, batu kapur) agar tumpukan tetap di bawah bantalan gantung tengah, 30% untuk serbuk semi-abrasif (semen), dan 45% untuk padatan ringan non-abrasif (biji-bijian, serpihan kayu). Memiringkan konveyor meningkatkan aliran balik dan menurunkan kapasitas melalui faktor derating K_θ.',
        equations: [
          {
            label: 'Faktor Kapasitas Kemiringan CEMA (K_θ)',
            formula: '0° → 1,00 | 10° → 0,85 | 20° → 0,65 | 30° → 0,45 | 45° → 0,25',
            note: 'Di atas 20°, disarankan menggunakan pitch pendek (P = 0,5–0,75 D) atau casing tubular',
          },
          {
            label: 'Kecepatan Maju Aksial Nominal',
            formula: 'v_a = (P × N / 60) × K_θ  [m/s]',
            note: 'Menentukan waktu tinggal material t_res = L / v_a',
          },
        ],
        workedExample: {
          title: 'Dampak Kemiringan 20° pada Kapasitas Semen',
          given: [
            'Kapasitas horizontal Q_m0 = 18,0 t/h pada θ = 0°',
            'Konveyor dimiringkan ke θ = 20° (K_θ = 0,65)',
          ],
          steps: [
            'Terapkan faktor derating kemiringan CEMA: Q_m = Q_m0 × K_θ',
            'Q_m = 18,0 × 0,65 = 11,7 t/h (penurunan kapasitas bersih sebesar 35%)',
          ],
          answer: 'Q_m = 11,7 t/h pada kemiringan 20°',
        },
      },
      {
        title: 'Daya Penggerak CEMA, Torsi Poros & Diagnostik Gangguan',
        summary:
          'Total daya poros menggabungkan gesekan bantalan gantung kosong (P_empty), hambatan geser material horizontal (P_mat, dikalikan faktor material F_m), dan daya angkat vertikal (P_lift). Torsi penggerak adalah T = 9549,3 × P_shaft / N. Pemantauan suhu bantalan dan arus motor mendeteksi keausan bantalan gantung, arus balik akibat abrasi daun ulir, atau kemacetan overfill.',
        equations: [
          {
            label: 'Daya Geser Material (CEMA Adaptasi SI)',
            formula: 'P_mat = (Q_m × L × F_m × 9,81) / 3600  [kW]',
            note: 'F_m = faktor material CEMA (0,6 gandum, 1,4 semen, 2,0 pasir silika)',
          },
          {
            label: 'Daya Angkat Vertikal',
            formula: 'P_lift = (Q_m × L × sin(θ) × 9,81) / 3600  [kW]',
            note: 'Nol saat horizontal (θ = 0°)',
          },
          {
            label: 'Torsi Poros Penggerak',
            formula: 'T = (9549,3 × P_shaft) / N  [N·m]',
            note: 'Kemacetan overfill dapat melonjakkan torsi poros > 2,5× nominal',
          },
        ],
        workedExample: {
          title: 'Pemeriksaan Torsi Poros pada 55 RPM',
          given: [
            'Total daya poros P_shaft = 4,20 kW',
            'Kecepatan putar sekrup N = 55 RPM',
          ],
          steps: [
            'Hitung torsi poros penggerak: T = (9549,3 × 4,20) / 55',
            'T = 729,2 N·m',
          ],
          answer: 'T = 729 N·m pada poros penggerak sekrup',
        },
      },
    ],
    practice: [
      {
        id: 'sc-prac-1',
        prompt:
          'Konveyor sekrup horizontal memiliki luas anulus A_s = 0,0665 m², pitch ulir P = 0,30 m, putaran N = 50 RPM, dan pengisian palung 30% (K_θ = 1,0). Hitung kapasitas volumetrik Q_v dalam m³/h.',
        hint: 'Gunakan Q_v = 60 × A_s × P × N × (Fill% / 100) × K_θ.',
        targetValue: 17.96,
        unit: 'm³/h',
        tolerance: 0.3,
        solutionSteps: [
          'Q_v = 60 × 0,0665 × 0,30 × 50 × 0,30 × 1,0',
          'Q_v = 17,955 m³/h ≈ 18,0 m³/h',
        ],
      },
      {
        id: 'sc-prac-2',
        prompt:
          'Jika konveyor sekrup mengalirkan Q_v = 22,0 m³/h semen Portland dengan densitas curah ρ_b = 1440 kg/m³, berapakah kapasitas pengangkutan massa Q_m dalam t/h?',
        hint: 'Kalikan kapasitas volumetrik dengan densitas curah lalu bagi 1000.',
        targetValue: 31.68,
        unit: 't/h',
        tolerance: 0.4,
        solutionSteps: [
          'Q_m = (Q_v × ρ_b) / 1000',
          'Q_m = (22,0 × 1440) / 1000 = 31,68 t/h',
        ],
      },
      {
        id: 'sc-prac-3',
        prompt:
          'Poros konveyor sekrup membutuhkan daya P_shaft = 5,5 kW pada N = 55 RPM. Hitung torsi poros penggerak T dalam N·m.',
        hint: 'Gunakan T = (9549,3 × P_shaft) / N.',
        targetValue: 954.9,
        unit: 'N·m',
        tolerance: 5,
        solutionSteps: [
          'T = (9549,3 × 5,5) / 55',
          'T = 954,93 N·m ≈ 955 N·m',
        ],
      },
    ],
    quiz: [
      {
        id: 'sc-quiz-1',
        question:
          'Mengapa CEMA 350 membatasi material abrasif seperti pasir silika kering atau batu kapur hancur pada pengisian palung 15%?',
        options: [
          'Agar lapisan material abrasif tetap berada di bawah bantalan gantung tengah dan seal poros',
          'Karena pengisian 45% membalikkan arah putaran sekrup',
          'Untuk menggandakan kecepatan aksial auger',
          'Karena material abrasif memiliki densitas curah nol',
        ],
        correctIndex: 0,
        explanation:
          'Pada pengisian 15%, material berada di bagian bawah palung U jauh di bawah pipa pusat dan bantalan gantung sehingga mencegah keausan abrasif dini pada bantalan.',
      },
      {
        id: 'sc-quiz-2',
        question:
          'Apa yang terjadi pada kapasitas angkut bersih ketika konveyor sekrup pitch standar dimiringkan dari 0° menjadi 20°?',
        options: [
          'Turun sekitar 35% (K_θ ≈ 0,65) akibat material meluncur balik dan efisiensi isi menurun',
          'Meningkat 35% karena gravitasi membantu pengeluaran',
          'Tetap tepat 100% tidak berubah hingga 45°',
          'Turun menjadi nol di atas 5°',
        ],
        correctIndex: 0,
        explanation:
          'Memiringkan konveyor sekrup membuat padatan curah meluncur mundur sepanjang daun ulir, menurunkan efisiensi volumetrik menjadi K_θ ≈ 0,65 pada 20°.',
      },
      {
        id: 'sc-quiz-3',
        question:
          'Kondisi gangguan manakah yang ditunjukkan oleh penurunan laju massa keluaran sebesar 28% tanpa lonjakan torsi yang besar?',
        options: [
          'Abrasi tepi luar daun ulir yang menyebabkan arus balik (carryback) melalui celah radial',
          'Patah total pada kopling gearbox',
          'Panas berlebih tak terkendali pada bantalan gantung',
          'Penyumbatan overfill di hopper masuk',
        ],
        correctIndex: 0,
        explanation:
          'Tepi daun ulir yang aus memperlebar celah radial antara auger dan dinding palung, memungkinkan material lolos ke belakang (carryback) dan menurunkan kapasitas bersih.',
      },
      {
        id: 'sc-quiz-4',
        question:
          'Jika konveyor sekrup terisi melampaui pipa pusatnya (pengisian efektif 90%), apa konsekuensi mekanis langsungnya?',
        options: [
          'Pengadukan/penyumbatan material parah dan lonjakan torsi penggerak >2,5× yang berisiko memicu trip beban lebih motor',
          'Bantalan gantung mendingin akibat kontak material ekstra',
          'Efisiensi volumetrik mencapai 100% tanpa slip',
          'Daya poros yang dibutuhkan turun ke tingkat gesekan kosong',
        ],
        correctIndex: 0,
        explanation:
          'Pengisian berlebih di atas pipa pusat menyumbat palung, memaksa auger menggeser dan mengaduk material padat sehingga torsi penggerak melonjak drastis.',
      },
    ],
  },
  ja: {
    title: 'CEMA スクリューコンベヤ・オーガー搬送',
    shortTitle: 'スクリューコンベヤ',
    description:
      'CEMA 350規格に基づくスクリューコンベヤの体積・質量搬送量、トラフ充填率（15%・30%・45%）、傾斜低減係数、駆動トルク・所要動力の内訳を解析し、ハンガー軸受過熱・羽根摩耗による逆流・過充填詰まりを診断します。',
    explore: [
      {
        title: 'CEMA 体積搬送量および質量搬送量の計算式',
        summary:
          'スクリューコンベヤはU字トラフ内の粉粒体を回転する螺旋羽根で軸方向へ押し進めます。体積搬送量は、スクリュー外径(D)と中心軸パイプ径(d)の環状断面積、羽根ピッチ(P)、回転速度(N)、およびCEMAトラフ充填率（15%・30%・45%）によって決まります。',
        equations: [
          {
            label: 'スクリュー環状断面積',
            formula: 'A_s = (π / 4) × (D² − d²)  [m²]',
            note: 'D = スクリュー外径 (m)、d = 中心軸パイプ外径 (m)',
          },
          {
            label: '体積搬送量',
            formula: 'Q_v = 60 × A_s × P × N × (充填率% / 100) × K_θ  [m³/h]',
            note: 'P = 羽根ピッチ (m)、N = 回転速度 (RPM)、K_θ = 傾斜低減係数',
          },
          {
            label: '質量搬送量',
            formula: 'Q_m = (Q_v × ρ_b) / 1000  [t/h]',
            note: 'ρ_b = 搬送物のかさ密度 (kg/m³)',
          },
        ],
        workedExample: {
          title: '水平小麦スクリューコンベヤの搬送量計算',
          given: [
            'スクリュー外径 D = 300 mm (0.30 m)、パイプ径 d = 73 mm (0.073 m)',
            '標準ピッチ P = 300 mm (0.30 m)、回転数 N = 60 RPM',
            'トラフ充填率 = 45%（流動性の高い小麦、ρ_b = 750 kg/m³）、水平 (K_θ = 1.0)',
          ],
          steps: [
            '環状断面積：A_s = (π / 4) × (0.30² − 0.073²) = 0.0665 m²',
            '体積搬送量：Q_v = 60 × 0.0665 × 0.30 × 60 × 0.45 × 1.0 = 32.32 m³/h',
            '質量搬送量：Q_m = (32.32 × 750) / 1000 = 24.24 t/h',
          ],
          answer: 'Q_v = 32.3 m³/h、Q_m = 24.2 t/h',
        },
      },
      {
        title: 'トラフ充填率の選定基準と傾斜低減係数 (K_θ)',
        summary:
          'CEMA 350では、摩耗性の高い重い材料（珪砂・砕石）は中間ハンガー軸受より下に保つため15%、セメント等の半摩耗性粉体は30%、非摩耗性の穀物や木質チップは45%の充填率に制限します。コンベヤを傾斜させると材料の滑り落ちが増え、係数K_θにより搬送量が低下します。',
        equations: [
          {
            label: 'CEMA 傾斜搬送能力係数 (K_θ)',
            formula: '0° → 1.00 | 10° → 0.85 | 20° → 0.65 | 30° → 0.45 | 45° → 0.25',
            note: '20°を超える傾斜では短ピッチ羽根（P = 0.5〜0.75 D）や管状ケーシングが推奨されます',
          },
          {
            label: '公称軸方向搬送速度',
            formula: 'v_a = (P × N / 60) × K_θ  [m/s]',
            note: 'トラフ内滞留時間 t_res = L / v_a を決定します',
          },
        ],
        workedExample: {
          title: '20°傾斜時のセメント搬送量への影響',
          given: [
            '水平時搬送量 Q_m0 = 18.0 t/h（θ = 0°）',
            'コンベヤを θ = 20° に傾斜（K_θ = 0.65）',
          ],
          steps: [
            'CEMA傾斜低減係数を適用：Q_m = Q_m0 × K_θ',
            'Q_m = 18.0 × 0.65 = 11.7 t/h（正味搬送量が35%低下）',
          ],
          answer: '20°傾斜時の搬送量 Q_m = 11.7 t/h',
        },
      },
      {
        title: 'CEMA 駆動動力・軸トルクおよび異常診断',
        summary:
          '軸動力は空運転時の軸受摩擦動力(P_empty)、水平搬送抵抗動力(P_mat、材料係数F_mに比例)、垂直揚程動力(P_lift)の合計です。軸トルクは T = 9549.3 × P_shaft / N で求まり、軸受温度やモータ負荷率の監視によりハンガー軸受摩耗・羽根外周摩耗・過充填詰まりを特定できます。',
        equations: [
          {
            label: '材料搬送抵抗動力（SI単位系 CEMA式）',
            formula: 'P_mat = (Q_m × L × F_m × 9.81) / 3600  [kW]',
            note: 'F_m = 材料係数（小麦 0.6、セメント 1.4、珪砂 2.0）',
          },
          {
            label: '垂直揚程動力',
            formula: 'P_lift = (Q_m × L × sin(θ) × 9.81) / 3600  [kW]',
            note: '水平運転（θ = 0°）ではゼロ',
          },
          {
            label: '駆動軸トルク',
            formula: 'T = (9549.3 × P_shaft) / N  [N·m]',
            note: '過充填詰まり発生時は定格の2.5倍以上に急増します',
          },
        ],
        workedExample: {
          title: '55 RPM運転時の駆動軸トルク計算',
          given: [
            '所要軸動力 P_shaft = 4.20 kW',
            'スクリュー回転速度 N = 55 RPM',
          ],
          steps: [
            '駆動軸トルクを計算：T = (9549.3 × 4.20) / 55',
            'T = 729.2 N·m',
          ],
          answer: 'スクリュー駆動軸トルク T = 729 N·m',
        },
      },
    ],
    practice: [
      {
        id: 'sc-prac-1',
        prompt:
          '環状断面積 A_s = 0.0665 m²、羽根ピッチ P = 0.30 m、回転数 N = 50 RPM、トラフ充填率 30% の水平スクリューコンベヤ（K_θ = 1.0）の体積搬送量 Q_v（m³/h）を計算してください。',
        hint: 'Q_v = 60 × A_s × P × N × (充填率% / 100) × K_θ を用います。',
        targetValue: 17.96,
        unit: 'm³/h',
        tolerance: 0.3,
        solutionSteps: [
          'Q_v = 60 × 0.0665 × 0.30 × 50 × 0.30 × 1.0',
          'Q_v = 17.955 m³/h ≈ 18.0 m³/h',
        ],
      },
      {
        id: 'sc-prac-2',
        prompt:
          'かさ密度 ρ_b = 1440 kg/m³ のポルトランドセメントを体積搬送量 Q_v = 22.0 m³/h で送る場合、質量搬送量 Q_m（t/h）はいくらになりますか？',
        hint: '体積搬送量にかさ密度を掛けて1000で割ります。',
        targetValue: 31.68,
        unit: 't/h',
        tolerance: 0.4,
        solutionSteps: [
          'Q_m = (Q_v × ρ_b) / 1000',
          'Q_m = (22.0 × 1440) / 1000 = 31.68 t/h',
        ],
      },
      {
        id: 'sc-prac-3',
        prompt:
          '回転数 N = 55 RPM で所要軸動力 P_shaft = 5.5 kW を必要とするスクリュー軸の駆動トルク T（N·m）を計算してください。',
        hint: 'T = (9549.3 × P_shaft) / N を用います。',
        targetValue: 954.9,
        unit: 'N·m',
        tolerance: 5,
        solutionSteps: [
          'T = (9549.3 × 5.5) / 55',
          'T = 954.93 N·m ≈ 955 N·m',
        ],
      },
    ],
    quiz: [
      {
        id: 'sc-quiz-1',
        question:
          'CEMA 350規格で乾燥珪砂や砕石などの摩耗性材料のトラフ充填率を15%に制限する主な理由は何ですか？',
        options: [
          '摩耗性粉粒体の層を中間ハンガー軸受や軸シールより低い位置に保ち、急速な摩耗・焼付きを防ぐため',
          '45%充填にするとスクリューの回転方向が逆転するため',
          'オーガーの軸方向搬送速度を2倍にするため',
          '摩耗性材料はかさ密度がゼロであるため',
        ],
        correctIndex: 0,
        explanation:
          '15%充填では材料層が中心軸パイプおよびハンガー軸受より十分に下側に位置するため、軸受への粉粒体噛み込みと摩耗を防げます。',
      },
      {
        id: 'sc-quiz-2',
        question:
          '標準ピッチのスクリューコンベヤを水平（0°）から20°へ傾斜させると、正味搬送量はどう変化しますか？',
        options: [
          '材料の滑り落ちと充填効率低下により約35%減少する（K_θ ≈ 0.65）',
          '重力が排出を助けるため35%増加する',
          '45°までは100%のまま変化しない',
          '5°を超えると搬送量はゼロになる',
        ],
        correctIndex: 0,
        explanation:
          '傾斜させると羽根上で材料が後方に滑り落ちるため、20°傾斜時の体積効率は約0.65（35%減）まで低下します。',
      },
      {
        id: 'sc-quiz-3',
        question:
          '駆動トルクの大きな急増を伴わずに、排出質量流量が28%低下した場合に最も疑われる異常状態はどれですか？',
        options: [
          '羽根外周エッジの摩耗によるトラフ隙間拡大と逆流（キャリーバック）',
          '減速機カップリングの完全破断',
          'ハンガー軸受の熱暴走',
          '供給ホッパーでの過充填詰まり',
        ],
        correctIndex: 0,
        explanation:
          '羽根外周が摩耗するとトラフ壁との半径方向隙間が広がり、材料が隙間から後方へ逆流するため正味搬送量が低下します。',
      },
      {
        id: 'sc-quiz-4',
        question:
          'スクリューコンベヤが中心軸パイプを超えて過充填（実効充填率90%）された場合、直ちに生じる機械的影響は何ですか？',
        options: [
          '材料の強い圧密・撹拌と2.5倍以上の駆動トルク急増が発生し、モータ過負荷トリップの危険がある',
          '材料との接触増加によりハンガー軸受が冷却される',
          '滑りゼロで体積効率が100%に達する',
          '所要軸動力が空運転レベルまで低下する',
        ],
        correctIndex: 0,
        explanation:
          '中心軸パイプ上まで材料が溢れるとトラフが閉塞し、圧縮された材料をせん断・撹拌するため駆動トルクが急激に跳ね上がります。',
      },
    ],
  },
});
