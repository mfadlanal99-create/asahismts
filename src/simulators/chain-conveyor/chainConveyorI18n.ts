import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('chain-conveyor', {
  id: {
    title: 'Penggerak Rantai Rol & Pelacakan Sabuk Konveyor',
    shortTitle: 'Rantai & Konveyor',
    description:
      'Inspeksi perpanjangan pitch rantai rol ANSI dengan alat ukur vernier 10-pitch, atur kelendutan sisi kendur (catenary sag) dan rezim pelumasan, serta koreksi mistracking sabuk konveyor menggunakan baut take-up puli ekor dan training idler.',
    explore: [
      {
        title: 'Pitch Rantai Rol ANSI/ISO & Batas Keausan Perpanjangan 3%',
        summary:
          'Rantai rol standar ANSI B29.1 diberi nomor dalam satuan seperdelapan inci pitch (misalnya #40 = 4/8 in = 12,70 mm, #80 = 8/8 in = 25,40 mm). Saat pin dan bushing berartikulasi di bawah beban, keausan abrasif dan adhesif memperbesar pitch efektif. Ketika perpanjangan mencapai 1,5% pada sproket diperkeras/besar (z > 60) atau 3,0% pada penggerak industri standar, rol akan naik ke ujung gigi sproket sehingga menyebabkan keausan gigi berbentuk kait (hook wear) dan rantai melompat.',
        equations: [
          {
            label: 'Pitch Rantai ANSI',
            formula: 'p = (Nomor Rantai / 10) × (25,4 / 8)  [mm]',
            note: '#40 = 12,70 mm, #60 = 19,05 mm, #80 = 25,40 mm, #100 = 31,75 mm',
          },
          {
            label: 'Diameter Pitch Sproket',
            formula: 'D = p / sin(180° / z)',
            note: 'z = jumlah gigi sproket; aksi poligonal meningkat bila z < 17',
          },
          {
            label: 'Variasi Kecepatan Poligonal (Kordal)',
            formula: 'Δv / v = (1 − cos(180° / z₁)) × 100%',
            note: 'z₁ = jumlah gigi sproket penggerak; disarankan < 2% untuk putaran halus',
          },
          {
            label: 'Persentase Perpanjangan Aus (Pengukur 10-Pitch)',
            formula: 'ε = ((L_ukur − 10·p) / (10·p)) × 100%',
            note: 'Ganti rantai pada ε ≥ 3,0% (standar) atau ε ≥ 1,5% (kecepatan tinggi / sproket besar)',
          },
        ],
        workedExample: {
          title: 'Inspeksi Alat Ukur Vernier 10-Pitch pada Rantai ANSI #80',
          given: [
            'Ukuran rantai: ANSI #80 (pitch nominal p = 25,40 mm)',
            'Panjang nominal 10-pitch: L₀ = 10 × 25,40 = 254,0 mm',
            'Jarak pusat-ke-pusat terukur melintasi 10 pitch saat ditarik tegang: L = 260,6 mm',
          ],
          steps: [
            'Hitung total perpanjangan pada 10 pitch: ΔL = 260,6 − 254,0 = 6,6 mm',
            'Hitung persentase perpanjangan aus: ε = (6,6 / 254,0) × 100% = 2,60%',
            'Bandingkan dengan batas: 2,60% melampaui batas presisi/diperkeras 1,5% dan mendekati batas penggantian maksimum 3,0%.',
          ],
          answer:
            'ε = 2,60% (Zona peringatan — jadwalkan penggantian rantai segera sebelum mencapai 261,6 mm / 3,0%)',
        },
      },
      {
        title: 'Kelendutan Sisi Kendur (S ≈ 0,02 C) & Rezim Pelumasan',
        summary:
          'Berbeda dengan V-belt yang membutuhkan tegangan awal tinggi, rantai rol mentransmisikan daya secara positif dan harus beroperasi dengan kelendutan sisi kendur (catenary sag) terkontrol—umumnya 2% dari jarak pusat poros (S ≈ 0,02 C) untuk penggerak horizontal/miring. Kelendutan yang terlalu kecil membebani bantalan poros, sedangkan kelendutan berlebih (> 4% C) memicu cambukan rantai dan loncatan gigi. Kecepatan linier rantai menentukan apakah pelumasan manual/tetes (Tipe A/B) atau rendaman oli (Tipe C) diperlukan.',
        equations: [
          {
            label: 'Target Kelendutan Bentang Kendur',
            formula: 'S_target ≈ 0,02 × C   (Rentang wajar: 1% hingga 3% dari C)',
            note: 'C = jarak pusat antar poros (mm); gunakan 0,01 C untuk penggerak vertikal',
          },
          {
            label: 'Perkiraan Kelebihan Panjang Katenari',
            formula: 'ΔL_sag ≈ (8 × S²) / (3 × C)',
            note: 'Menghubungkan kelendutan tengah S dengan kelebihan panjang rantai sisi kendur',
          },
          {
            label: 'Kecepatan Linier Garis Pitch Rantai',
            formula: 'v = (z₁ × p × N₁) / 60.000  [m/s]',
            note: 'Tipe A (Manual/Tetes): v ≤ 1,5 m/s; Tipe B (Tetes): ≤ 3,5 m/s; Tipe C (Rendaman Oli): ≤ 8 m/s',
          },
        ],
        workedExample: {
          title: 'Pemeriksaan Kelendutan & Pelumasan Penggerak ANSI #60',
          given: [
            'Rantai ANSI #60 (p = 19,05 mm), sproket penggerak z₁ = 19 gigi pada N₁ = 600 RPM',
            'Jarak pusat poros C = 750 mm',
          ],
          steps: [
            'Target kelendutan: S = 0,02 × 750 = 15,0 mm (rentang dapat diterima: 7,5 hingga 22,5 mm)',
            'Kecepatan linier rantai: v = (19 × 19,05 × 600) / 60.000 = 3,62 m/s',
            'Pada v = 3,62 m/s, pelumasan kuas manual atau tetes lambat akan terlempar keluar; pilih pelumasan Tipe C Rendaman Oli (Oil Bath).',
          ],
          answer: 'Target kelendutan S = 15,0 mm; Kecepatan rantai v = 3,62 m/s memerlukan pelumasan Rendaman Oli',
        },
      },
      {
        title: 'Aturan Pelacakan Sabuk Konveyor & Penyetelan Take-Up Puli Ekor',
        summary:
          'Sabuk konveyor mengikuti dua prinsip fisika utama: (1) sabuk bergerak menuju ujung rol/idler yang disentuhnya PERTAMA KALI dalam arah laju sabuk ("First Contact Rule"), dan (2) pada puli ekor take-up, sabuk bergeser menuju sisi dengan tegangan LEBIH RENDAH (jarak pusat lebih pendek). Pemuatan corong (chute) yang tidak di tengah mendorong sabuk ke sisi yang bermuatan lebih ringan akibat gaya reaksi lateral material.',
        equations: [
          {
            label: 'Efek Kemudi Tegangan Take-Up Ekor',
            formula: 'Δy_takeup ≈ K_t × (x_kiri − x_kanan)',
            note: 'Mengencangkan baut take-up sisi tempat sabuk menyimpang akan meluruskan muka puli sehingga sabuk menyentuh sisi sebaliknya lebih dulu dan kembali ke tengah.',
          },
          {
            label: 'Kemudi Sudut Skew Training Idler',
            formula: 'Δy_idler ≈ −K_α × tan(α_skew)',
            note: 'Memajukan salah satu ujung idler searah laju sabuk akan mengarahkan sabuk menuju ujung yang dimajukan tersebut ("Aturan Kontak Pertama")',
          },
          {
            label: 'Reaksi Pemuatan Chute Tidak Sentris',
            formula: 'Δy_load ≈ −K_L × e_chute',
            note: 'Material berat yang jatuh di sisi kanan (+e_chute) mendorong sabuk ke sisi berlawanan (−y kiri) pada rol troughing miring',
          },
        ],
        workedExample: {
          title: 'Mengoreksi Mistracking Sabuk di Dekat Puli Ekor',
          given: [
            'Sabuk menyimpang +28 mm ke sisi KANAN rangka konveyor di dekat puli ekor',
            'Batas aman ruang bebas lateral sebelum bergesekan dengan rangka = ±25 mm',
            'Curahan material chute berada tepat di tengah (e_chute = 0 mm)',
          ],
          steps: [
            'Identifikasi masalah: Sabuk bergesekan dengan rangka kanan (+28 mm > batas 25 mm).',
            'Terapkan aturan penyetelan take-up di puli ekor: Tambah ulir baut take-up sisi kanan (atau kurangi sisi kiri) agar sisi kanan puli bergerak mundur sedikit, membuat sabuk menyentuh sisi KIRI lebih dulu dan kembali ke tengah.',
            'Lakukan putaran bertahap kecil (2–3 mm gerak ulir) dan tunggu 3 putaran penuh sabuk sebelum mengukur ulang.',
          ],
          answer:
            'Setel baut take-up ekor secara bertahap 2–3 mm hingga penyimpangan lateral berada dalam ±5 mm',
        },
      },
    ],
    practice: [
      {
        id: 'cc-prac-1',
        prompt:
          'Rantai rol ANSI #60 memiliki pitch nominal 19,05 mm. Berapakah panjang ukur 10-pitch maksimum yang diizinkan (dalam mm) yang sesuai dengan batas penggantian standar keausan 3,0%?',
        hint: 'Kalikan panjang nominal 10-pitch (10 × 19,05 mm) dengan 1,03.',
        targetValue: 196.2,
        unit: 'mm',
        tolerance: 0.3,
        solutionSteps: [
          'Panjang nominal 10-pitch: L₀ = 10 × 19,05 = 190,50 mm',
          'Pada perpanjangan keausan maksimum 3,0%: L_maks = 190,50 × (1 + 0,03) = 196,215 mm',
          'Dibulatkan satu angka desimal: 196,2 mm',
        ],
      },
      {
        id: 'cc-prac-2',
        prompt:
          'Penggerak rantai rol horizontal memiliki jarak pusat-ke-pusat poros C = 850 mm. Menggunakan aturan standar 2% (S = 0,02 C), berapakah target kelendutan tengah sisi kendur S (dalam mm)?',
        hint: 'Hitung S = 0,02 × 850.',
        targetValue: 17,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'Aturan target kelendutan untuk penggerak horizontal: S = 0,02 × C',
          'S = 0,02 × 850 mm = 17,0 mm',
        ],
      },
      {
        id: 'cc-prac-3',
        prompt:
          'Penggerak rantai ANSI #80 (pitch p = 25,40 mm) menggunakan sproket penggerak 17 gigi yang berputar pada 450 RPM. Hitung kecepatan linier garis pitch rantai v dalam m/s.',
        hint: 'Gunakan v = (z₁ × p × N₁) / 60.000.',
        targetValue: 3.24,
        unit: 'm/s',
        tolerance: 0.05,
        solutionSteps: [
          'Rumus: v = (z₁ × p × N₁) / 60.000',
          'v = (17 × 25,40 × 450) / 60.000 = 194.310 / 60.000 = 3,2385 m/s',
          'v ≈ 3,24 m/s',
        ],
      },
      {
        id: 'cc-prac-4',
        prompt:
          'Hitung diameter pitch D (dalam mm) dari sproket 21 gigi untuk rantai rol ANSI #40 (p = 12,70 mm).',
        hint: 'Gunakan D = p / sin(180° / z), di mana 180° / 21 = 8,5714°.',
        targetValue: 85.2,
        unit: 'mm',
        tolerance: 0.4,
        solutionSteps: [
          'Sudut per setengah gigi: 180° / 21 = 8,5714°',
          'sin(8,5714°) = 0,14904',
          'Diameter pitch: D = 12,70 / 0,14904 = 85,21 mm',
        ],
      },
      {
        id: 'cc-prac-5',
        prompt:
          'Saat pemeriksaan vernier 10-pitch pada rantai ANSI #100 (p = 31,75 mm, nominal 10p = 317,5 mm), teknisi mengukur 323,85 mm. Berapakah persentase perpanjangan keausan (%)?',
        hint: 'Hitung ((323,85 − 317,5) / 317,5) × 100.',
        targetValue: 2.0,
        unit: '%',
        tolerance: 0.1,
        solutionSteps: [
          'Perpanjangan ΔL = 323,85 − 317,50 = 6,35 mm',
          'Persentase keausan ε = (6,35 / 317,50) × 100% = 2,00%',
        ],
      },
    ],
    quiz: [
      {
        id: 'cc-quiz-1',
        question: 'Berapakah pitch nominal dari rantai rol standar ANSI #60?',
        options: [
          '12,70 mm (1/2 in)',
          '15,875 mm (5/8 in)',
          '19,05 mm (3/4 in)',
          '25,40 mm (1,0 in)',
        ],
        correctIndex: 2,
        explanation:
          'Pada sistem penomoran ANSI, digit kiri menunjukkan pitch dalam seperdelapan inci: #60 = 6/8 in = 3/4 in = 19,05 mm.',
      },
      {
        id: 'cc-quiz-2',
        question:
          'Pada persentase perpanjangan aus pin-bushing berapakah rantai rol industri standar wajib diganti sebelum merusak gigi sproket?',
        options: [
          'Perpanjangan 0,5%',
          'Perpanjangan 3,0% (atau 1,5% untuk sproket diperkeras / ukuran besar)',
          'Perpanjangan 6,0%',
          'Perpanjangan 10,0%',
        ],
        correctIndex: 1,
        explanation:
          'Rantai rol standar mencapai batas lapisan pengerasan permukaan pin/bushing pada perpanjangan 3,0% (1,5% untuk penggerak kecepatan tinggi atau sproket > 60 gigi). Lebih dari itu, rol menaiki profil gigi sproket dan memicu keausan kait (hook wear).',
      },
      {
        id: 'cc-quiz-3',
        question:
          'Mengapa sproket penggerak berukuran kecil (misalnya kurang dari 15 gigi) menyebabkan getaran dan kebisingan tinggi pada penggerak rantai rol?',
        options: [
          'Karena menurunkan viskositas oli di dalam bak',
          'Aksi poligonal (kordal) menyebabkan garis pitch rantai naik-turun setiap pertautan gigi sehingga menciptakan variasi kecepatan siklik',
          'Karena membuat pitch rantai lebih kecil daripada pitch sproket yang digerakkan',
          'Karena menghilangkan kelendutan katenari pada sisi kendur',
        ],
        correctIndex: 1,
        explanation:
          'Karena mata rantai membentuk tali busur lurus di sekeliling poligon z gigi, jari-jari efektif berfluktuasi antara R dan R·cos(180°/z). Di bawah 17 gigi, variasi kecepatan kordal melampaui 1,7% dan membangkitkan getaran tinggi.',
      },
      {
        id: 'cc-quiz-4',
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
        id: 'cc-quiz-5',
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
        id: 'cc-quiz-6',
        question:
          'Berapakah kelendutan tengah sisi kendur S yang direkomendasikan untuk penggerak rantai rol horizontal umum dengan jarak pusat C?',
        options: [
          'Nol kelendutan (kencang seperti timing belt)',
          'Sekitar 2% dari jarak pusat (S ≈ 0,02 C)',
          'Sekitar 12% dari jarak pusat (S ≈ 0,12 C)',
          'Sama dengan diameter sproket penggerak',
        ],
        correctIndex: 1,
        explanation:
          'Penggerak rantai rol horizontal memerlukan kelendutan sisi kendur sekitar 2% (S ≈ 0,02 C) untuk mencegah beban berlebih pada bantalan poros sekaligus menghindari cambukan rantai.',
      },
    ],
  },
  ja: {
    title: 'ローラチェーン伝動＆コンベヤベルト蛇行調整シミュレータ',
    shortTitle: 'チェーン＆コンベヤ',
    description:
      '10リンクノギスゲージによるANSIローラチェーンのピッチ伸び検査、緩み側カテナリーたるみ量と潤滑方式の選定、およびテールプーリ・テイクアップねじと自動調心キャリアローラによるコンベヤベルト蛇行修正を学びます。',
    explore: [
      {
        title: 'ANSI/ISO ローラチェーンのピッチと摩耗伸び限界（3%）',
        summary:
          'ANSI B29.1 標準ローラチェーンの番手はピッチを 1/8 インチ単位で表します（例：#40 = 4/8 in = 12.70 mm、#80 = 8/8 in = 25.40 mm）。負荷下でピンとブシュが屈曲すると摩耗により有効ピッチが増大します。浸炭焼入れ歯や大径スプロケット（z > 60）では 1.5%、一般産業用駆動では 3.0% の伸びに達するとローラが歯先へ乗り上げ、歯の「フック摩耗」や歯飛びを引き起こします。',
        equations: [
          {
            label: 'ANSI チェーンピッチ',
            formula: 'p = (チェーン番手 / 10) × (25.4 / 8)  [mm]',
            note: '#40 = 12.70 mm, #60 = 19.05 mm, #80 = 25.40 mm, #100 = 31.75 mm',
          },
          {
            label: 'スプロケットピッチ円直径',
            formula: 'D = p / sin(180° / z)',
            note: 'z = スプロケット歯数。z < 17 では多角形運動（弦運動）が急増する',
          },
          {
            label: '多角形作用による速度変動率',
            formula: 'Δv / v = (1 − cos(180° / z₁)) × 100%',
            note: 'z₁ = 駆動スプロケット歯数。円滑運転には 2% 未満を推奨',
          },
          {
            label: '摩耗伸び率（10リンク測定ゲージ）',
            formula: 'ε = ((L_実測 − 10·p) / (10·p)) × 100%',
            note: 'ε ≥ 3.0%（標準）または ε ≥ 1.5%（高速・大歯数）でチェーン交換',
          },
        ],
        workedExample: {
          title: 'ANSI #80 チェーンの10リンクゲージ摩耗検査',
          given: [
            'チェーン番手：ANSI #80（基準ピッチ p = 25.40 mm）',
            '10リンク基準長さ：L₀ = 10 × 25.40 = 254.0 mm',
            '緊張状態で測定した10リンク中心間距離：L = 260.6 mm',
          ],
          steps: [
            '10リンクあたりの伸び量を計算：ΔL = 260.6 − 254.0 = 6.6 mm',
            '摩耗伸び率を算出：ε = (6.6 / 254.0) × 100% = 2.60%',
            '限界値との比較：2.60% は硬化・大歯数限界（1.5%）を超え、標準交換限界（3.0%）に迫っています。',
          ],
          answer:
            'ε = 2.60%（要注意領域 — 261.6 mm / 3.0% に達する前に速やかにチェーン交換を手配）',
        },
      },
      {
        title: '緩み側スパンたるみ量（S ≈ 0.02 C）と潤滑方式',
        summary:
          '初張力を要するVベルトとは異なり、ローラチェーンは噛み合いによる確実伝動であり、緩み側スパンに適度なカテナリーたるみ（水平・傾斜配置で軸間距離 C の約 2%、S ≈ 0.02 C）が必要です。たるみ不足は軸受過負荷を招き、過大たるみ（> 4% C）はチェーンの波打ちや歯飛びを起こします。またチェーン速度に応じて手動給油・滴下給油（A/B種）または油浴潤滑（C種）を選定します。',
        equations: [
          {
            label: '目標たるみ量（緩み側）',
            formula: 'S_target ≈ 0.02 × C   （適正範囲：C の 1% 〜 3%）',
            note: 'C = 軸間距離 (mm)。垂直駆動では約 0.01 C に抑える',
          },
          {
            label: 'カテナリー余長近似式',
            formula: 'ΔL_sag ≈ (8 × S²) / (3 × C)',
            note: '中央たるみ量 S と緩み側スパンの余剰チェーン長さの関係',
          },
          {
            label: 'チェーン周速度',
            formula: 'v = (z₁ × p × N₁) / 60,000  [m/s]',
            note: 'A種（手動）：v ≤ 1.5 m/s、B種（滴下）：≤ 3.5 m/s、C種（油浴）：≤ 8 m/s',
          },
        ],
        workedExample: {
          title: 'ANSI #60 チェーン駆動のたるみ量と潤滑選定',
          given: [
            'ANSI #60 チェーン（p = 19.05 mm）、駆動歯数 z₁ = 19、回転数 N₁ = 600 RPM',
            '軸間距離 C = 750 mm',
          ],
          steps: [
            '目標たるみ量：S = 0.02 × 750 = 15.0 mm（許容範囲：7.5 〜 22.5 mm）',
            'チェーン速度：v = (19 × 19.05 × 600) / 60,000 = 3.62 m/s',
            'v = 3.62 m/s では刷毛塗りや遅い滴下給油では油膜切れを起こすため、C種（油浴またはスリンガ潤滑）を選定します。',
          ],
          answer: '目標たるみ量 S = 15.0 mm、速度 v = 3.62 m/s のため油浴潤滑（Oil Bath）が必要',
        },
      },
      {
        title: 'コンベヤベルト蛇行の法則とテールプーリ・テイクアップ調整',
        summary:
          'コンベヤベルトのトラッキング（蛇行修正）は2つの物理原則に従います：(1) ベルトは進行方向において「先に接触したローラ端」の側へ寄る（先当たりの法則）、(2) テールプーリのテイクアップ部では張力の低い側（軸間が短い側）へ寄る。またシュートからの偏荷重（片荷）はトラフ角の反力によって荷の軽い側へベルトを押し出します。',
        equations: [
          {
            label: 'テールテイクアップ張力差による操舵効果',
            formula: 'Δy_takeup ≈ K_t × (x_左 − x_右)',
            note: 'ベルトが寄っている側のテイクアップねじを締め込むとプーリ面が傾き、反対側が先に接触して中央へ戻る。',
          },
          {
            label: '調心アイドラ（トレーニングアイドラ）のスキュー角効果',
            formula: 'Δy_idler ≈ −K_α × tan(α_skew)',
            note: 'アイドラの一端をベルト進行方向へ前進させると、ベルトはその前進した端の側へ移動する（先当たりの法則）',
          },
          {
            label: 'シュート偏荷重（片荷）による横押し反力',
            formula: 'Δy_load ≈ −K_L × e_chute',
            note: '右側へ偏って荷が落ちると（+e_chute）、トラフローラの傾斜反力でベルトは反対の左側（−y）へ押しやられる',
          },
        ],
        workedExample: {
          title: 'テールプーリ付近でのベルト右寄り蛇行の修正',
          given: [
            'テールプーリ付近でベルトがフレーム右側へ +28 mm 蛇行している',
            'フレーム接触を防ぐ許容クリアランス限界 = ±25 mm',
            'シュート投入位置は中央（e_chute = 0 mm）',
          ],
          steps: [
            '異常判定：+28 mm > 25 mm 限界のため右側フレームと接触・摩耗中。',
            '先当たりの法則／テイクアップ調整：右側のテイクアップねじを少し締め込む（または左側を緩める）ことで左側から先に接触させ、ベルトを中央へ戻す。',
            '1回あたり 2〜3 mm ずつ微調整し、ベルトが3周するのを待ってから再測定する。',
          ],
          answer:
            'テールテイクアップねじを 2〜3 mm 刻みで調整し、蛇行量を ±5 mm 以内に収める',
        },
      },
    ],
    practice: [
      {
        id: 'cc-prac-1',
        prompt:
          'ANSI #60 ローラチェーンの基準ピッチは 19.05 mm です。標準摩耗交換限界である伸び率 3.0% に相当する 10リンク最大許容長さ（mm）はいくらですか？',
        hint: '10リンク基準長さ（10 × 19.05 mm）に 1.03 を掛けます。',
        targetValue: 196.2,
        unit: 'mm',
        tolerance: 0.3,
        solutionSteps: [
          '10リンク基準長さ：L₀ = 10 × 19.05 = 190.50 mm',
          '3.0% 摩耗限界時の長さ：L_max = 190.50 × (1 + 0.03) = 196.215 mm',
          '小数第1位に丸めると 196.2 mm',
        ],
      },
      {
        id: 'cc-prac-2',
        prompt:
          '水平配置されたローラチェーン駆動の軸間距離が C = 850 mm です。標準の 2% ルール（S = 0.02 C）を用いると、緩み側スパン中央の目標たるみ量 S（mm）はいくらですか？',
        hint: 'S = 0.02 × 850 を計算します。',
        targetValue: 17,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          '水平駆動の目標たるみ式：S = 0.02 × C',
          'S = 0.02 × 850 mm = 17.0 mm',
        ],
      },
      {
        id: 'cc-prac-3',
        prompt:
          'ANSI #80 チェーン駆動（ピッチ p = 25.40 mm）で 17歯の駆動スプロケットが 450 RPM で回転しています。チェーン周速度 v（m/s）を求めてください。',
        hint: 'v = (z₁ × p × N₁) / 60,000 を使用します。',
        targetValue: 3.24,
        unit: 'm/s',
        tolerance: 0.05,
        solutionSteps: [
          '公式：v = (z₁ × p × N₁) / 60,000',
          'v = (17 × 25.40 × 450) / 60,000 = 194,310 / 60,000 = 3.2385 m/s',
          'v ≈ 3.24 m/s',
        ],
      },
      {
        id: 'cc-prac-4',
        prompt:
          'ANSI #40 ローラチェーン（p = 12.70 mm）用の 21歯スプロケットのピッチ円直径 D（mm）を計算してください。',
        hint: 'D = p / sin(180° / z) を使います（180° / 21 = 8.5714°）。',
        targetValue: 85.2,
        unit: 'mm',
        tolerance: 0.4,
        solutionSteps: [
          '半歯角：180° / 21 = 8.5714°',
          'sin(8.5714°) = 0.14904',
          'ピッチ円直径：D = 12.70 / 0.14904 = 85.21 mm',
        ],
      },
      {
        id: 'cc-prac-5',
        prompt:
          'ANSI #100 チェーン（p = 31.75 mm、10リンク基準 = 317.5 mm）を10リンクゲージで測定したところ 323.85 mm でした。摩耗伸び率（%）はいくらですか？',
        hint: '((323.85 − 317.5) / 317.5) × 100 を計算します。',
        targetValue: 2.0,
        unit: '%',
        tolerance: 0.1,
        solutionSteps: [
          '伸び量 ΔL = 323.85 − 317.50 = 6.35 mm',
          '摩耗伸び率 ε = (6.35 / 317.50) × 100% = 2.00%',
        ],
      },
    ],
    quiz: [
      {
        id: 'cc-quiz-1',
        question: 'ANSI #60 標準ローラチェーンの公称ピッチはいくらですか？',
        options: [
          '12.70 mm (1/2 in)',
          '15.875 mm (5/8 in)',
          '19.05 mm (3/4 in)',
          '25.40 mm (1.0 in)',
        ],
        correctIndex: 2,
        explanation:
          'ANSI番手の左側の数字は 1/8 インチ単位のピッチを表します。したがって #60 = 6/8 in = 3/4 in = 19.05 mm です。',
      },
      {
        id: 'cc-quiz-2',
        question:
          'スプロケットの歯を損傷する前に標準ローラチェーンを交換すべきピン・ブシュ摩耗伸び率の限界はいくらですか？',
        options: [
          '0.5% 伸び',
          '3.0% 伸び（浸炭焼入れ・大歯数スプロケットでは 1.5%）',
          '6.0% 伸び',
          '10.0% 伸び',
        ],
        correctIndex: 1,
        explanation:
          '一般用ローラチェーンは伸び率 3.0%（高速駆動や歯数 60 超では 1.5%）で表面硬化層が摩耗限界に達し、それ以上使用するとスプロケット歯のフック摩耗や歯飛びを引き起こします。',
      },
      {
        id: 'cc-quiz-3',
        question:
          '小歯数の駆動スプロケット（例：15歯未満）を使うと振動や騒音が大きくなる主な理由は何ですか？',
        options: [
          'オイルバスの油の粘度が下がるため',
          '多角形作用（弦運動）により噛み合いごとにピッチ線が上下し、周期的な速度変動が生じるため',
          '従動スプロケットよりチェーンピッチが小さくなるため',
          '緩み側のカテナリーたるみがゼロになるため',
        ],
        correctIndex: 1,
        explanation:
          'チェーンリンクは z 角形の弦として巻き付くため、有効半径が R と R·cos(180°/z) の間で変動します。17歯未満では速度変動率が 1.7% を超え、激しい振動と騒音の原因になります。',
      },
      {
        id: 'cc-quiz-4',
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
        id: 'cc-quiz-5',
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
        id: 'cc-quiz-6',
        question:
          '軸間距離 C の一般的な水平ローラチェーン駆動において、推奨される緩み側スパン中央のたるみ量 S はどのくらいですか？',
        options: [
          'たるみゼロ（タイミングベルトのように張る）',
          '軸間距離の約 2%（S ≈ 0.02 C）',
          '軸間距離の約 12%（S ≈ 0.12 C）',
          '駆動スプロケットの直径と同じ',
        ],
        correctIndex: 1,
        explanation:
          '水平ローラチェーン駆動では、軸受の過大荷重を防ぎつつチェーンの波打ちや歯飛びを防止するため、軸間距離の約 2%（S ≈ 0.02 C）のたるみ量が推奨されます。',
      },
    ],
  },
});
