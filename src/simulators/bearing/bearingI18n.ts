import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('bearing', {
  id: {
    title: 'Simulator Pemilihan Bearing, Umur L10 & Suaian ISO',
    shortTitle: 'Bearing & Suaian',
    description:
      'Pilih bearing bola dan rol, evaluasi umur kelelahan ISO 281 L10/L10h, hitung beban dinamis ekuivalen, dan verifikasi suaian poros/rumah ISO 286.',
    explore: [
      {
        title: '1. Umur Rating Dasar & Modifikasi ISO 281 (L10, L10h, Lna)',
        summary:
          'Bearing gelinding umumnya gagal akibat kelelahan kontak gelinding di bawah permukaan. Umur rating dasar L10 adalah jumlah putaran (dalam jutaan) yang diselesaikan oleh 90% kelompok bearing identik sebelum munculnya spalling awal. Bearing bola kontak-titik menggunakan eksponen p = 3, sedangkan bearing rol kontak-garis menggunakan p = 10/3 (3,33). Umur modifikasi L10ha mengalikan umur dasar dengan faktor pelumasan/keandalan ISO a_ISO.',
        equations: [
          {
            label: 'Umur Rating Dasar (juta putaran)',
            formula: 'L10 = (C / P)^p',
            note: 'C = kapasitas beban dinamis dasar (kN), P = beban dinamis ekuivalen (kN), p = 3 (bola) atau 10/3 (rol).',
          },
          {
            label: 'Umur Jam Operasi',
            formula: 'L10h = (10^6 / (60 · N)) · L10',
            note: 'N = kecepatan putar dalam RPM.',
          },
          {
            label: 'Umur Rating Modifikasi',
            formula: 'L10ha = a_ISO · L10h',
            note: 'a_ISO memperhitungkan ketebalan film pelumas (kappa), kontaminasi, dan batas lelah.',
          },
        ],
        workedExample: {
          title: 'L10 dan L10h untuk Deep Groove Ball Bearing 6308',
          given: [
            'Bearing: 6308 (C = 42,3 kN, p = 3)',
            'Beban dinamis ekuivalen: P = 6,0 kN',
            'Kecepatan: N = 1500 RPM',
          ],
          steps: [
            'Hitung umur dasar dalam juta putaran: L10 = (42,3 / 6,0)^3 = (7,05)^3 = 350,4 juta putaran.',
            'Konversi putaran ke jam operasi: L10h = (1.000.000 / (60 × 1500)) × 350,4.',
            'L10h = 11,111 × 350,4 = 3.893 jam.',
          ],
          answer: 'L10 = 350,4 juta putaran, L10h = 3.893 jam',
        },
      },
      {
        title: '2. Beban Dinamis Ekuivalen (P = X·Fr + Y·Fa) & Keamanan Statis (s0)',
        summary:
          'Poros nyata memikul beban radial (Fr) dan aksial (Fa). ISO 281 menggabungkannya menjadi beban radial ekuivalen tunggal P dengan faktor radial X dan faktor aksial Y, yang dipilih dengan membandingkan Fa/Fr terhadap ambang e. Bearing rol silindris tipe NU memiliki cincin dalam tanpa bahu sehingga tidak dapat menahan beban aksial (Fa harus 0). Keamanan statis s0 = C0 / P0 mencegah brinelling permanen pada lintasan.',
        equations: [
          {
            label: 'Beban Dinamis Ekuivalen',
            formula: 'P = X · Fr + Y · Fa',
            note: 'Bila Fa/Fr <= e, umumnya X = 1, Y = 0 (kecuali spherical roller baris ganda).',
          },
          {
            label: 'Faktor Keamanan Statis',
            formula: 's0 = C0 / P0',
            note: 'Target s0 >= 1,5 untuk layanan industri normal; s0 < 1,0 berisiko brinelling plastis.',
          },
        ],
        workedExample: {
          title: 'Beban Ekuivalen pada Tapered Roller Bearing 30208',
          given: [
            'Bearing: 30208 (e = 0,37, X = 0,4, Y = 1,6)',
            'Beban radial Fr = 8,0 kN, Beban aksial Fa = 4,0 kN',
          ],
          steps: [
            'Periksa rasio beban: Fa / Fr = 4,0 / 8,0 = 0,50.',
            'Karena 0,50 > e (0,37), gunakan X = 0,4 dan Y = 1,6.',
            'Hitung P = 0,4 × 8,0 + 1,6 × 4,0 = 3,2 + 6,4 = 9,6 kN.',
          ],
          answer: 'P = 9,6 kN',
        },
      },
      {
        title: '3. Suaian Poros & Rumah ISO 286',
        summary:
          'Cincin yang berputar relatif terhadap arah beban wajib menggunakan suaian sesak (interference) agar tidak terjadi creep dan korosi fretting. Untuk poros berputar dengan rumah stasioner, cincin dalam memakai suaian sesak (k5 atau m5) sedangkan cincin luar memakai suaian longgar/transisi (H7 atau J7) agar dapat bergeser aksial saat ekspansi termal. Sebaliknya, poros stasioner dengan rumah berputar (misalnya puli) memakai suaian poros longgar (g6) dan rumah sesak (N7).',
        equations: [
          {
            label: 'Keloggaran Poros ke Lubang Bearing',
            formula: 'Clearance = d_bore - d_shaft',
            note: 'Nilai negatif menunjukkan interferensi/sesak (µm).',
          },
          {
            label: 'Penurunan Kelonggaran Radial',
            formula: 'ΔCr ≈ 0,8 · δ_shaft + 0,6 · δ_housing',
            note: 'Interferensi memuai cincin dalam dan menekan cincin luar sehingga mengurangi kelonggaran radial internal.',
          },
        ],
        workedExample: {
          title: 'Lubang 6308 (40 mm) pada Poros ISO k5',
          given: [
            'Toleransi Lubang Normal 6308 (d = 40 mm): 0 hingga -12 µm',
            'Toleransi Poros ISO k5 (30 < d <= 50 mm): +2 hingga +13 µm',
          ],
          steps: [
            'Kelonggaran minimum (paling sesak): d_bore,min - d_shaft,max = -12 - (+13) = -25 µm (interferensi 25 µm).',
            'Kelonggaran maksimum (paling longgar): d_bore,max - d_shaft,min = 0 - (+2) = -2 µm (interferensi 2 µm).',
            'Kedua ekstrem negatif, menjamin suaian sesak dengan rata-rata interferensi 13,5 µm.',
          ],
          answer: 'Suaian Sesak 2 hingga 25 µm (rata-rata 13,5 µm)',
        },
      },
    ],
    practice: [
      {
        id: 'bearing-p1',
        prompt:
          'Sebuah deep groove ball bearing 6206 (C = 20,3 kN, p = 3) memikul beban radial murni Fr = 4,0 kN (Fa = 0 kN). Hitung umur rating dasar L10 dalam juta putaran.',
        hint: 'Gunakan L10 = (C / P)^p dengan P = Fr = 4,0 kN dan p = 3.',
        unit: 'juta putaran',
        solutionSteps: [
          'Karena Fa = 0 kN, maka P = Fr = 4,0 kN.',
          'L10 = (20,3 / 4,0)^3 = (5,075)^3.',
          'L10 = 130,71 juta putaran.',
        ],
      },
      {
        id: 'bearing-p2',
        prompt:
          'Konversikan L10 = 130,71 juta putaran menjadi jam operasi L10h untuk poros yang berputar pada N = 1200 RPM.',
        hint: 'L10h = (1.000.000 / (60 × N)) × L10.',
        unit: 'jam',
        solutionSteps: [
          'Putaran per jam = 60 × 1200 = 72.000 put/jam = 0,072 juta put/jam.',
          'L10h = 130,71 / 0,072 = 1.815,4 jam.',
        ],
      },
      {
        id: 'bearing-p3',
        prompt:
          'Sebuah tapered roller bearing 30208 (e = 0,37, X = 0,4, Y = 1,6) memikul Fr = 10,0 kN dan Fa = 5,0 kN. Hitung beban dinamis ekuivalen P (kN).',
        hint: 'Periksa Fa/Fr = 0,50 > 0,37, lalu terapkan P = X·Fr + Y·Fa.',
        unit: 'kN',
        solutionSteps: [
          'Fa / Fr = 5,0 / 10,0 = 0,50, melebihi e = 0,37.',
          'P = 0,4 × 10,0 + 1,6 × 5,0 = 4,0 + 8,0 = 12,0 kN.',
        ],
      },
      {
        id: 'bearing-p4',
        prompt:
          'Sebuah spherical roller bearing 22210 (C0 = 108 kN, Y1 = 2,8) mengalami beban statis Fr = 18,0 kN dan Fa = 3,0 kN dengan P0 = Fr + Y1·Fa. Hitung faktor keamanan statis s0.',
        hint: 'Hitung P0 = 18 + 2,8 × 3 terlebih dahulu, lalu s0 = C0 / P0.',
        unit: 's0',
        solutionSteps: [
          'P0 = 18,0 + 2,8 × 3,0 = 18,0 + 8,4 = 26,4 kN.',
          's0 = C0 / P0 = 108 / 26,4 = 4,09.',
        ],
      },
      {
        id: 'bearing-p5',
        prompt:
          'Bearing 6206 (lubang d = 30 mm, toleransi 0 hingga -10 µm) dipasang pada poros ISO m5 (+8 hingga +17 µm). Berapa rata-rata interferensinya dalam µm?',
        hint: 'Cari kelonggaran min dan maks = d_bore - d_shaft, lalu rata-ratakan besarnya.',
        unit: 'µm',
        solutionSteps: [
          'Paling sesak: -10 - (+17) = -27 µm (interferensi 27 µm).',
          'Paling longgar: 0 - (+8) = -8 µm (interferensi 8 µm).',
          'Rata-rata interferensi = (27 + 8) / 2 = 17,5 µm.',
        ],
      },
    ],
    quiz: [
      {
        id: 'bearing-q1',
        question:
          'Jika beban dinamis ekuivalen P pada ball bearing (p = 3) digandakan, bagaimana perubahan umur kelelahan L10-nya?',
        options: [
          'Turun menjadi 1/2 (50%)',
          'Turun menjadi 1/4 (25%)',
          'Turun menjadi 1/8 (12,5%)',
          'Turun menjadi 1/10 (10%)',
        ],
        explanation:
          'Karena L10 = (C / P)^3 untuk ball bearing, menggandakan P membagi L10 dengan 2^3 = 8 (umur turun menjadi 12,5%).',
      },
      {
        id: 'bearing-q2',
        question:
          'Tipe bearing manakah di simulator yang memiliki kapasitas beban aksial NOL dan mengizinkan pergeseran aksial bebas?',
        options: [
          'Deep Groove Ball (6206)',
          'Cylindrical Roller (NU 208)',
          'Tapered Roller (30208)',
          'Spherical Roller (22210)',
        ],
        explanation:
          'Bearing rol silindris desain NU tidak memiliki bahu pada cincin dalam, sehingga mengakomodasi ekspansi aksial secara internal dan tidak dapat memikul beban aksial.',
      },
      {
        id: 'bearing-q3',
        question:
          'Untuk motor listrik dengan poros berputar dan rumah stasioner di bawah beban radial, kombinasi suaian mana yang menjadi standar?',
        options: [
          'Poros g6 + rumah N7',
          'Poros k5 + rumah H7',
          'Poros g6 + rumah H7',
          'Poros m5 + rumah N7',
        ],
        explanation:
          'Cincin dalam yang berputar memerlukan suaian sesak (k5) untuk mencegah creep/fretting, sedangkan cincin luar stasioner memakai suaian longgar (H7) untuk perakitan dan pergeseran aksial.',
      },
      {
        id: 'bearing-q4',
        question:
          'Apa risiko utama menggabungkan suaian sesak berat pada poros (m5) dan rumah (N7) secara bersamaan?',
        options: [
          'Korosi fretting pada cincin dalam',
          'Hilangnya kelonggaran radial internal dan preload termal',
          'Meningkatnya gerak bebas aksial',
          'Menurunnya kapasitas beban statis C0',
        ],
        explanation:
          'Interferensi memuaikan cincin dalam dan menekan cincin luar, menghabiskan kelonggaran radial internal serta memicu panas berlebih dan spalling dini.',
      },
      {
        id: 'bearing-q5',
        question:
          'Dalam ISO 281, berapa nilai eksponen umur p untuk roller bearing dibanding ball bearing?',
        options: [
          'p = 2 untuk rol, p = 3 untuk bola',
          'p = 3 untuk rol, p = 10/3 untuk bola',
          'p = 10/3 untuk rol, p = 3 untuk bola',
          'p = 4 untuk rol maupun bola',
        ],
        explanation:
          'Roller bearing kontak-garis menggunakan p = 10/3 (3,33), sedangkan ball bearing kontak-titik menggunakan p = 3.',
      },
      {
        id: 'bearing-q6',
        question:
          'Apa arti faktor keamanan statis s0 < 1,0?',
        options: [
          'Bearing berputar melebihi batas kecepatannya',
          'Film pelumas terlalu tipis (a_ISO rendah)',
          'Risiko lekukan plastis permanen (brinelling) pada lintasan',
          'Suaian rumah terlalu longgar',
        ],
        explanation:
          's0 = C0 / P0 membandingkan kapasitas beban statis dengan beban statis ekuivalen; nilai di bawah 1,0 berarti deformasi permanen pada lintasan dapat terjadi.',
      },
    ],
  },
  ja: {
    title: '軸受選定・L10寿命・ISOはめあいシミュレータ',
    shortTitle: '軸受・はめあい',
    description:
      '玉軸受・ころ軸受を選定し、ISO 281のL10/L10h疲労寿命、動等価荷重、ISO 286の軸・ハウジングはめあいを評価します。',
    explore: [
      {
        title: '1. ISO 281 基本定格寿命・補正定格寿命 (L10, L10h, Lna)',
        summary:
          '転がり軸受は主に転動体と軌道面下の転がり疲労（フレーキング）により寿命に至ります。基本定格寿命 L10 は、同じ軸受の90%が初期はく離を起こさずに回転できる総回転数（100万回転単位）です。点接触の玉軸受は指数 p = 3、線接触のころ軸受は p = 10/3 (3.33) を用います。補正寿命 L10ha は潤滑・信頼性係数 a_ISO を乗じて求めます。',
        equations: [
          {
            label: '基本定格寿命（100万回転）',
            formula: 'L10 = (C / P)^p',
            note: 'C = 基本動定格荷重 (kN), P = 動等価荷重 (kN), p = 3（玉）または 10/3（ころ）。',
          },
          {
            label: '定格寿命時間',
            formula: 'L10h = (10^6 / (60 · N)) · L10',
            note: 'N = 回転速度 (RPM)。',
          },
          {
            label: '補正定格寿命',
            formula: 'L10ha = a_ISO · L10h',
            note: 'a_ISO は油膜厚さ (kappa)、異物混入、疲労限を考慮した寿命補正係数です。',
          },
        ],
        workedExample: {
          title: '深溝玉軸受 6308 の L10 と L10h 計算',
          given: [
            '軸受: 6308 (C = 42.3 kN, p = 3)',
            '動等価荷重: P = 6.0 kN',
            '回転速度: N = 1500 RPM',
          ],
          steps: [
            '基本定格寿命（100万回転）: L10 = (42.3 / 6.0)^3 = (7.05)^3 = 350.4 × 10^6 回転。',
            '時間へ換算: L10h = (1,000,000 / (60 × 1500)) × 350.4。',
            'L10h = 11.111 × 350.4 = 3,893 時間。',
          ],
          answer: 'L10 = 350.4 × 10^6 回転、L10h = 3,893 時間',
        },
      },
      {
        title: '2. 動等価荷重 (P = X·Fr + Y·Fa) と静安全係数 (s0)',
        summary:
          '実際の軸にはラジアル荷重 (Fr) とアキシアル荷重 (Fa) の両方が作用します。ISO 281 では、Fa/Fr と係数 e を比較してラジアル係数 X・アキシアル係数 Y を決め、単一の動等価荷重 P に換算します。NU形円筒ころ軸受は内輪につばがないためアキシアル荷重を支持できません (Fa = 0)。静安全係数 s0 = C0 / P0 は軌道面の永久圧痕（ブリネリング）を防ぎます。',
        equations: [
          {
            label: '動等価荷重',
            formula: 'P = X · Fr + Y · Fa',
            note: 'Fa/Fr <= e のとき通常 X = 1, Y = 0（複列自動調心ころ軸受を除く）。',
          },
          {
            label: '静安全係数',
            formula: 's0 = C0 / P0',
            note: '一般産業用途では s0 >= 1.5 を目標とし、s0 < 1.0 は塑性圧痕の危険があります。',
          },
        ],
        workedExample: {
          title: '円すいころ軸受 30208 の動等価荷重',
          given: [
            '軸受: 30208 (e = 0.37, X = 0.4, Y = 1.6)',
            'ラジアル荷重 Fr = 8.0 kN, アキシアル荷重 Fa = 4.0 kN',
          ],
          steps: [
            '荷重比を確認: Fa / Fr = 4.0 / 8.0 = 0.50。',
            '0.50 > e (0.37) のため、X = 0.4, Y = 1.6 を使用。',
            'P = 0.4 × 8.0 + 1.6 × 4.0 = 3.2 + 6.4 = 9.6 kN。',
          ],
          answer: 'P = 9.6 kN',
        },
      },
      {
        title: '3. ISO 286 軸・ハウジングのはめあい',
        summary:
          '荷重方向に対して回転する軌道輪には、クリープやフレッティング摩耗を防ぐため「しまりばめ」が必要です。一般的な回転軸・静止ハウジングでは、内輪をしまりばめ (k5 または m5)、外輪をすきまばめ・中間ばめ (H7 または J7) として熱膨張の軸方向逃げを確保します。逆に軸静止・外輪回転（プーリ等）では軸側を g6、ハウジング側を N7 とします。',
        equations: [
          {
            label: '軸と内輪内径のすきま',
            formula: 'すきま = d_bore - d_shaft',
            note: '負の値はしめしろ（干渉量, µm）を表します。',
          },
          {
            label: 'ラジアル内部すきま減少量',
            formula: 'ΔCr ≈ 0.8 · δ_shaft + 0.6 · δ_housing',
            note: 'しめしろにより内輪が膨張・外輪が収縮し、内部すきまが減少します。',
          },
        ],
        workedExample: {
          title: '6308 内径 (40 mm) と ISO k5 軸のはめあい',
          given: [
            '6308 普通級内径公差 (d = 40 mm): 0 ～ -12 µm',
            'ISO k5 軸公差 (30 < d <= 50 mm): +2 ～ +13 µm',
          ],
          steps: [
            '最小すきま（最大しめしろ）: -12 - (+13) = -25 µm（しめしろ 25 µm）。',
            '最大すきま（最小しめしろ）: 0 - (+2) = -2 µm（しめしろ 2 µm）。',
            '両端とも負のため、平均しめしろ 13.5 µm のしまりばめとなります。',
          ],
          answer: '2 ～ 25 µm のしまりばめ（平均 13.5 µm）',
        },
      },
    ],
    practice: [
      {
        id: 'bearing-p1',
        prompt:
          '深溝玉軸受 6206 (C = 20.3 kN, p = 3) に純ラジアル荷重 Fr = 4.0 kN (Fa = 0 kN) が作用しています。基本定格寿命 L10（100万回転）を求めなさい。',
        hint: 'P = Fr = 4.0 kN, p = 3 として L10 = (C / P)^p を計算します。',
        unit: '×10^6 回転',
        solutionSteps: [
          'Fa = 0 kN のため P = Fr = 4.0 kN。',
          'L10 = (20.3 / 4.0)^3 = (5.075)^3。',
          'L10 = 130.71 × 10^6 回転。',
        ],
      },
      {
        id: 'bearing-p2',
        prompt:
          'L10 = 130.71 × 10^6 回転を、回転速度 N = 1200 RPM における定格寿命時間 L10h（時間）に換算しなさい。',
        hint: 'L10h = (1,000,000 / (60 × N)) × L10 を使用します。',
        unit: '時間',
        solutionSteps: [
          '1時間あたりの回転数 = 60 × 1200 = 72,000 rev/h = 0.072 × 10^6 rev/h。',
          'L10h = 130.71 / 0.072 = 1,815.4 時間。',
        ],
      },
      {
        id: 'bearing-p3',
        prompt:
          '円すいころ軸受 30208 (e = 0.37, X = 0.4, Y = 1.6) が Fr = 10.0 kN、Fa = 5.0 kN を支持するとき、動等価荷重 P (kN) を求めなさい。',
        hint: 'Fa/Fr = 0.50 > 0.37 を確認し、P = X·Fr + Y·Fa を適用します。',
        unit: 'kN',
        solutionSteps: [
          'Fa / Fr = 5.0 / 10.0 = 0.50 > e (0.37)。',
          'P = 0.4 × 10.0 + 1.6 × 5.0 = 4.0 + 8.0 = 12.0 kN。',
        ],
      },
      {
        id: 'bearing-p4',
        prompt:
          '自動調心ころ軸受 22210 (C0 = 108 kN, Y1 = 2.8) に静荷重 Fr = 18.0 kN、Fa = 3.0 kN が作用し P0 = Fr + Y1·Fa のとき、静安全係数 s0 を求めなさい。',
        hint: 'まず P0 = 18 + 2.8 × 3 を求め、s0 = C0 / P0 を計算します。',
        unit: 's0',
        solutionSteps: [
          'P0 = 18.0 + 2.8 × 3.0 = 18.0 + 8.4 = 26.4 kN。',
          's0 = C0 / P0 = 108 / 26.4 = 4.09。',
        ],
      },
      {
        id: 'bearing-p5',
        prompt:
          '軸受 6206（内径 d = 30 mm、公差 0 ～ -10 µm）を ISO m5 軸（+8 ～ +17 µm）に組むとき、平均しめしろ（µm）はいくらですか？',
        hint: '最小・最大すきま = d_bore - d_shaft を求め、その絶対値の平均を取ります。',
        unit: 'µm',
        solutionSteps: [
          '最大しめしろ: -10 - (+17) = -27 µm（27 µm しめしろ）。',
          '最小しめしろ: 0 - (+8) = -8 µm（8 µm しめしろ）。',
          '平均しめしろ = (27 + 8) / 2 = 17.5 µm。',
        ],
      },
    ],
    quiz: [
      {
        id: 'bearing-q1',
        question:
          '玉軸受 (p = 3) に作用する動等価荷重 P を2倍にすると、L10 疲労寿命はどう変化しますか？',
        options: [
          '1/2 (50%) に減少する',
          '1/4 (25%) に減少する',
          '1/8 (12.5%) に減少する',
          '1/10 (10%) に減少する',
        ],
        explanation:
          '玉軸受では L10 = (C / P)^3 のため、P が2倍になると寿命は 2^3 = 8 分の 1 (12.5%) に低下します。',
      },
      {
        id: 'bearing-q2',
        question:
          'シミュレータ内の軸受のうち、アキシアル荷重容量がゼロで自由側軸受として軸方向変位を吸収できるものはどれですか？',
        options: [
          '深溝玉軸受 (6206)',
          '円筒ころ軸受 (NU 208)',
          '円すいころ軸受 (30208)',
          '自動調心ころ軸受 (22210)',
        ],
        explanation:
          'NU形円筒ころ軸受は内輪につばがないため、軸の熱膨張を内部で吸収でき、アキシアル荷重は受けられません。',
      },
      {
        id: 'bearing-q3',
        question:
          '回転軸・静止ハウジングでラジアル荷重を受ける電動機に標準的なはめあいの組合せはどれですか？',
        options: [
          '軸 g6 + ハウジング N7',
          '軸 k5 + ハウジング H7',
          '軸 g6 + ハウジング H7',
          '軸 m5 + ハウジング N7',
        ],
        explanation:
          '回転内輪にはクリープ・フレッティング防止のためしまりばめ (k5) を、静止外輪には組立性と軸方向逃がしのためすきまばめ (H7) を用います。',
      },
      {
        id: 'bearing-q4',
        question:
          '軸 (m5) とハウジング (N7) の両方に強いしまりばめを同時に適用した場合の主なリスクは何ですか？',
        options: [
          '内輪のフレッティング摩耗',
          'ラジアル内部すきまの消失と熱予圧による焼付き',
          'アキシアル遊びの増大',
          '基本静定格荷重 C0 の低下',
        ],
        explanation:
          'しめしろにより内輪が膨張・外輪が圧縮されて内部すきまが失われ、過大な発熱や早期フレーキングを引き起こします。',
      },
      {
        id: 'bearing-q5',
        question:
          'ISO 281 において、ころ軸受と玉軸受の寿命指数 p はそれぞれいくつですか？',
        options: [
          'ころ p = 2、玉 p = 3',
          'ころ p = 3、玉 p = 10/3',
          'ころ p = 10/3、玉 p = 3',
          'ころ・玉ともに p = 4',
        ],
        explanation:
          '線接触のころ軸受は p = 10/3 (3.33)、点接触の玉軸受は p = 3 を用います。',
      },
      {
        id: 'bearing-q6',
        question:
          '静安全係数 s0 < 1.0 は何を示していますか？',
        options: [
          '許容回転速度を超過している',
          '潤滑油膜が薄すぎる (低 a_ISO)',
          '軌道面に永久塑性圧痕（ブリネリング）が生じる危険がある',
          'ハウジングはめあいが緩すぎる',
        ],
        explanation:
          's0 = C0 / P0 が 1.0 未満の場合、静止時や衝撃荷重時に軌道面へ永久変形が生じる恐れがあります。',
      },
    ],
  },
});
