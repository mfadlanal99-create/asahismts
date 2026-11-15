import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('belt-gear', {
  id: {
    title: 'Simulator Perawatan Penggerak Sabuk & Roda Gigi',
    shortTitle: 'Sabuk & Roda Gigi',
    description:
      'Periksa ketegangan V-belt dengan metode defleksi-gaya C/64, cek kesejajaran puli dan slip sabuk, serta setel jarak pusat, backlash, dan kecepatan garis pitch roda gigi lurus.',
    explore: [
      {
        title: 'Rasio Sabuk & Panjang Pitch',
        summary:
          'Penggerak V-belt mentransmisikan daya antar poros sejajar melalui gesekan pada alur trapesium puli. Rasio kecepatan bergantung pada diameter pitch efektif puli penggerak dan yang digerakkan, sedangkan panjang sabuk bergantung pada diameter puli dan jarak pusat.',
        equations: [
          {
            label: 'Rasio Kecepatan',
            formula: 'i = D₂ / D₁ = N₁ / N₂',
            note: 'Rasio ideal tanpa slip sabuk; D₁ = penggerak, D₂ = digerakkan',
          },
          {
            label: 'Perkiraan Panjang Pitch',
            formula: 'L ≈ 2C + (π/2)(D₁ + D₂) + (D₂ − D₁)² / (4C)',
            note: 'C = jarak pusat antar poros (mm)',
          },
          {
            label: 'Sudut Lilit Puli Kecil',
            formula: 'θ₁ = 180° − 2·arcsin((D₂ − D₁) / (2C))',
            note: 'Jaga θ₁ ≥ 120° agar tidak terjadi slip berlebih saat berbeban',
          },
        ],
        workedExample: {
          title: 'Menghitung Ukuran V-Belt untuk Penggerak Kipas',
          given: [
            'Puli penggerak D₁ = 125 mm pada N₁ = 1450 RPM',
            'Puli yang digerakkan D₂ = 250 mm',
            'Jarak pusat C = 480 mm',
          ],
          steps: [
            'Rasio kecepatan: i = 250 / 125 = 2,00',
            'Kecepatan output ideal: N₂ = 1450 / 2,00 = 725 RPM',
            'Panjang sabuk: L = 2(480) + (π/2)(125 + 250) + (250 − 125)² / (4 × 480)',
            'L = 960 + 589,05 + 8,14 = 1557,2 mm',
          ],
          answer: 'i = 2,00, N₂ = 725 RPM, L ≈ 1557 mm',
        },
      },
      {
        title: 'Pemeriksaan Ketegangan Gaya-Defleksi (Aturan C/64)',
        summary:
          'Ketegangan V-belt yang tepat diverifikasi dengan memberi gaya uji tegak lurus terkalibrasi di tengah bentang sabuk dan mengukur defleksi δ. Sabuk yang terlalu kendur akan selip dan mengkilap; sabuk yang terlalu kencang membebani bantalan poros.',
        equations: [
          {
            label: 'Target Defleksi Tengah Bentang',
            formula: 'δ_target = C / 64  (atau  t / 64)',
            note: 'Aturan standar: ≈ 1,56% dari panjang bentang',
          },
          {
            label: 'Panjang Bentang Sabuk',
            formula: 't = √(C² − ((D₂ − D₁) / 2)²)',
            note: 'Bentang bebas antara titik singgung puli',
          },
          {
            label: 'Kecepatan Output Aktual dengan Slip',
            formula: 'N₂,aktual = (N₁ / i) × (1 − s)',
            note: 's = fraksi slip sabuk (umumnya < 1% bila tegang tepat)',
          },
        ],
        workedExample: {
          title: 'Inspeksi Defleksi Tengah Bentang',
          given: [
            'Jarak pusat C = 640 mm',
            'Defleksi terukur δ = 14,5 mm pada gaya uji 35 N',
          ],
          steps: [
            'Hitung target defleksi: δ_target = 640 / 64 = 10,0 mm',
            'Bandingkan hasil ukur vs target: 14,5 mm > 10,0 mm (+45% berlebih)',
            'Diagnosis: Sabuk Kendur; kencangkan dudukan geser motor hingga δ ≈ 10,0 mm',
          ],
          answer: 'Target δ = 10,0 mm; sabuk Kendur dan perlu dikencangkan',
        },
      },
      {
        title: 'Rasio Roda Gigi, Modul & Jarak Pusat',
        summary:
          'Roda gigi lurus (spur gear) mentransmisikan gerak positif tanpa slip melalui gigi involut yang saling bertaut. Agar dua roda gigi bertaut dengan baik, keduanya harus memiliki modul (m) dan sudut tekan (umumnya 20°) yang sama.',
        equations: [
          {
            label: 'Rasio Kecepatan Roda Gigi',
            formula: 'i = Z₂ / Z₁ = N₁ / N₂',
            note: 'Z₁ = jumlah gigi penggerak, Z₂ = jumlah gigi yang digerakkan',
          },
          {
            label: 'Diameter Pitch',
            formula: 'd = m × Z',
            note: 'm = modul (mm per gigi)',
          },
          {
            label: 'Jarak Pusat Standar',
            formula: 'C₀ = m × (Z₁ + Z₂) / 2',
            note: 'Jarak teoretis tepat untuk pertautan involut standar',
          },
          {
            label: 'Kecepatan Garis Pitch',
            formula: 'v = (π × d₁ × N₁) / 60.000  (m/s)',
            note: 'Menentukan metode pelumasan (gemuk, rendaman oli, atau semprot paksa)',
          },
        ],
        workedExample: {
          title: 'Tata Letak Pasangan Roda Gigi Lurus',
          given: [
            'Modul m = 3 mm, Z₁ = 20 gigi, Z₂ = 45 gigi',
            'Kecepatan motor N₁ = 1450 RPM',
          ],
          steps: [
            'Diameter pitch: d₁ = 3 × 20 = 60 mm, d₂ = 3 × 45 = 135 mm',
            'Jarak pusat standar: C₀ = 3 × (20 + 45) / 2 = 97,5 mm',
            'Rasio kecepatan: i = 45 / 20 = 2,25 → N₂ = 1450 / 2,25 = 644,4 RPM',
            'Kecepatan garis pitch: v = (π × 60 × 1450) / 60.000 = 4,56 m/s',
          ],
          answer: 'C₀ = 97,5 mm, N₂ = 644,4 RPM, v = 4,56 m/s',
        },
      },
      {
        title: 'Multiplikasi Torsi & Perawatan Backlash',
        summary:
          'Penurunan kecepatan melipatgandakan torsi output sebanding dengan rasio kecepatan dan efisiensi mekanis. Pada roda gigi lurus, celah backlash terkontrol diperlukan untuk lapisan film pelumas dan pemuaian termal.',
        equations: [
          {
            label: 'Torsi Input',
            formula: 'T₁ = (9550 × P_kW) / N₁  (N·m)',
            note: '9550 = konstanta konversi 60.000 / (2π)',
          },
          {
            label: 'Torsi Output',
            formula: 'T₂ = T₁ × i × η',
            note: 'η ≈ 0,95 (V-belt) atau 0,98 (roda gigi lurus)',
          },
          {
            label: 'Perubahan Backlash dari Pergeseran Pusat',
            formula: 'Δj ≈ 2 × ΔC × tan(α)',
            note: 'α = sudut tekan 20°; ΔC negatif berisiko membuat gigi macet',
          },
        ],
        workedExample: {
          title: 'Pemeriksaan Torsi & Backlash',
          given: [
            'Daya motor P = 7,5 kW pada N₁ = 1450 RPM',
            'Rasio roda gigi i = 2,25, efisiensi η = 98,2%',
            'Pergeseran jarak pusat ΔC = +0,10 mm (α = 20°)',
          ],
          steps: [
            'Torsi input: T₁ = (9550 × 7,5) / 1450 = 49,40 N·m',
            'Torsi output: T₂ = 49,40 × 2,25 × 0,982 = 109,15 N·m',
            'Tambahan backlash: Δj = 2 × 0,10 × tan(20°) = 0,073 mm',
          ],
          answer: 'T₂ = 109,2 N·m, Δj = +0,073 mm',
        },
      },
    ],
    practice: [
      {
        id: 'bg-p1',
        prompt:
          'Sebuah penggerak V-belt memiliki puli penggerak D₁ = 120 mm berputar pada N₁ = 1500 RPM dan puli yang digerakkan D₂ = 300 mm. Dengan asumsi slip diabaikan, hitung kecepatan output N₂ dalam RPM.',
        hint: 'Cari rasio kecepatan i = D₂ / D₁, lalu bagi N₁ dengan i.',
        solutionSteps: [
          'Rasio kecepatan i = D₂ / D₁ = 300 / 120 = 2,5',
          'Kecepatan output N₂ = N₁ / i = 1500 / 2,5 = 600 RPM',
        ],
      },
      {
        id: 'bg-p2',
        prompt:
          'Hitung perkiraan panjang pitch L (dalam mm) untuk penggerak V-belt dengan D₁ = 100 mm, D₂ = 260 mm, dan jarak pusat poros C = 400 mm.',
        hint: 'Gunakan L ≈ 2C + (π/2)(D₁ + D₂) + (D₂ − D₁)² / (4C).',
        solutionSteps: [
          '2C = 2 × 400 = 800 mm',
          '(π/2)(100 + 260) = 1,5708 × 360 = 565,49 mm',
          '(260 − 100)² / (4 × 400) = 25600 / 1600 = 16,00 mm',
          'Total L = 800 + 565,49 + 16,00 = 1381,5 mm',
        ],
      },
      {
        id: 'bg-p3',
        prompt:
          'Menggunakan aturan defleksi-gaya C/64, berapa target defleksi tengah bentang sabuk δ (dalam mm) untuk penggerak dengan jarak pusat C = 512 mm?',
        hint: 'Bagi jarak pusat C (dalam mm) dengan 64.',
        solutionSteps: ['δ_target = C / 64 = 512 / 64 = 8,0 mm'],
      },
      {
        id: 'bg-p4',
        prompt:
          'Dua roda gigi lurus yang saling bertaut memiliki modul m = 4 mm, Z₁ = 18 gigi, dan Z₂ = 42 gigi. Berapa jarak pusat standar C₀ dalam mm?',
        hint: 'Gunakan C₀ = m × (Z₁ + Z₂) / 2.',
        solutionSteps: ['C₀ = 4 × (18 + 42) / 2 = 4 × 60 / 2 = 120 mm'],
      },
      {
        id: 'bg-p5',
        prompt:
          'Sebuah motor 7,5 kW berputar pada 1500 RPM menggerakkan tahap reduksi dengan rasio i = 3,0 dan efisiensi η = 96% (0,96). Hitung torsi output T₂ dalam N·m.',
        hint: 'Hitung T₁ = 9550 × P / N₁, lalu kalikan dengan i dan η.',
        solutionSteps: [
          'Torsi input T₁ = (9550 × 7,5) / 1500 = 47,75 N·m',
          'Torsi output T₂ = 47,75 × 3,0 × 0,96 = 137,52 N·m',
        ],
      },
    ],
    quiz: [
      {
        id: 'bg-q1',
        question:
          'Saat inspeksi ketegangan V-belt menggunakan aturan C/64, apa arti defleksi terukur yang jauh LEBIH BESAR daripada C/64?',
        options: [
          'Sabuk terlalu kencang dan membebani bantalan secara berlebih',
          'Sabuk kendur dan rentan mengalami slip serta permukaan mengkilap (glazing)',
          'Puli sejajar dengan sempurna',
          'Motor berputar melebihi kecepatan sinkron',
        ],
        explanation:
          'Defleksi yang lebih besar pada gaya uji tertentu berarti ketegangan sabuk rendah (kendur), yang menyebabkan slip, panas berlebih, dan keausan mengkilap.',
      },
      {
        id: 'bg-q2',
        question:
          'Apa dampak mekanis utama dari menjalankan penggerak V-belt yang terlalu kencang (over-tightened)?',
        options: [
          'Kecepatan output turun akibat slip berlebih',
          'Beban radial bantalan berlebih, defleksi poros, dan kerusakan dini pada bantalan',
          'Sudut lilit pada puli yang digerakkan bertambah',
          'Kecepatan garis pitch menurun',
        ],
        explanation:
          'Ketegangan berlebih memberikan beban radial statis tinggi pada bantalan poros motor maupun poros beban, mempercepat kelelahan bantalan dan putusnya serat sabuk.',
      },
      {
        id: 'bg-q3',
        question:
          'Gejala mana yang paling langsung disebabkan oleh ketidaksejajaran puli (sheave misalignment) pada penggerak V-belt?',
        options: [
          'Keausan cepat pada dinding samping sabuk, suara decit, dan risiko sabuk terbalik di alur',
          'Backlash nol pada lingkaran pitch',
          'Penambahan nilai modul roda gigi',
          'Rasio kecepatan teoretis lebih tinggi',
        ],
        explanation:
          'Puli yang tidak sejajar memaksa sabuk masuk dan keluar alur secara miring, menggesek dinding samping sabuk dan berisiko membuat sabuk terbalik.',
      },
      {
        id: 'bg-q4',
        question:
          'Agar dua roda gigi lurus standar dapat bertaut dengan benar tanpa interferensi, parameter apa yang harus identik pada kedua roda gigi?',
        options: [
          'Jumlah gigi (Z) dan lebar muka gigi',
          'Diameter pitch (d) dan diameter poros',
          'Modul (m) dan sudut tekan (α)',
          'Kekerasan material dan RPM',
        ],
        explanation:
          'Pasangan roda gigi lurus harus memiliki modul (ukuran gigi) dan sudut tekan (umumnya 20°) yang sama agar profil giginya bertaut mulus.',
      },
      {
        id: 'bg-q5',
        question:
          'Jika teknisi perawatan sedikit menambah jarak pusat pasangan roda gigi lurus (+ΔC), apa yang terjadi pada pertautan roda gigi?',
        options: [
          'Backlash bertambah, yang dapat menimbulkan suara berisik jika berlebihan',
          'Rasio kecepatan meningkat secara proporsional',
          'Backlash turun menjadi nol dan gigi macet',
          'Kecepatan garis pitch menjadi dua kali lipat',
        ],
        explanation:
          'Menjauhkan pusat roda gigi menambah celah antar gigi (backlash) sebesar Δj ≈ 2·ΔC·tan(α), sementara rasio kecepatan Z₂/Z₁ tetap sama.',
      },
      {
        id: 'bg-q6',
        question:
          'Mengapa kecepatan garis pitch (v = π·d₁·N₁ / 60.000) dipantau selama perawatan penggerak roda gigi?',
        options: [
          'Untuk menentukan apakah panjang sabuk perlu dikencangkan ulang',
          'Untuk menentukan kebutuhan pelumasan, beban dinamis gigi, dan batas kebisingan',
          'Untuk menggantikan pemeriksaan backlash',
          'Untuk mengukur runout aksial poros secara langsung',
        ],
        explanation:
          'Kecepatan garis pitch yang lebih tinggi menghasilkan panas lebih besar dan lemparan sentrifugal oli, sehingga membutuhkan pelumasan yang lebih baik dan keseimbangan roda gigi yang lebih ketat.',
      },
    ],
  },
  ja: {
    title: 'ベルト・歯車伝動装置 メンテナンスシミュレータ',
    shortTitle: 'ベルト・歯車駆動',
    description:
      'C/64たわみ法によるVベルト張力点検、プーリ芯出しとベルトスリップ診断、および平歯車の中心距離・バックラッシ・ピッチ円周速度を調整・学習します。',
    explore: [
      {
        title: 'ベルト変速比とピッチ長さ',
        summary:
          'Vベルト駆動は台形溝プーリとの摩擦によって平行軸間で動力を伝達します。変速比は駆動側・従動側の有効ピッチ径の比で決まり、ベルト長さは両プーリ径と軸間距離から求まります。',
        equations: [
          {
            label: '変速比',
            formula: 'i = D₂ / D₁ = N₁ / N₂',
            note: 'スリップなしの理想比; D₁ = 駆動側, D₂ = 従動側',
          },
          {
            label: '近似ピッチ長さ',
            formula: 'L ≈ 2C + (π/2)(D₁ + D₂) + (D₂ − D₁)² / (4C)',
            note: 'C = 軸間中心距離 (mm)',
          },
          {
            label: '小プーリ巻き掛け角',
            formula: 'θ₁ = 180° − 2·arcsin((D₂ − D₁) / (2C))',
            note: '負荷時の過大スリップを防ぐため θ₁ ≥ 120° を維持',
          },
        ],
        workedExample: {
          title: 'ファン駆動用Vベルトの選定計算',
          given: [
            '駆動プーリ D₁ = 125 mm（N₁ = 1450 RPM）',
            '従動プーリ D₂ = 250 mm',
            '中心距離 C = 480 mm',
          ],
          steps: [
            '変速比: i = 250 / 125 = 2.00',
            '理想出力回転数: N₂ = 1450 / 2.00 = 725 RPM',
            'ベルト長さ: L = 2(480) + (π/2)(125 + 250) + (250 − 125)² / (4 × 480)',
            'L = 960 + 589.05 + 8.14 = 1557.2 mm',
          ],
          answer: 'i = 2.00, N₂ = 725 RPM, L ≈ 1557 mm',
        },
      },
      {
        title: '荷重-たわみ張力点検（C/64ルール）',
        summary:
          '適切なVベルト張力は、スパン中央に規定の垂直試験荷重を加えてたわみ量 δ を測定することで確認します。張り不足はスリップや焼付きの原因になり、張りすぎは軸受に過大なラジアル荷重を与えます。',
        equations: [
          {
            label: '目標スパン中央たわみ量',
            formula: 'δ_target = C / 64  (または t / 64)',
            note: '標準目安：スパン長の約 1.56%',
          },
          {
            label: 'ベルトスパン長',
            formula: 't = √(C² − ((D₂ − D₁) / 2)²)',
            note: 'プーリ接線間の自由スパン長さ',
          },
          {
            label: 'スリップ考慮後の実出力回転数',
            formula: 'N₂,actual = (N₁ / i) × (1 − s)',
            note: 's = ベルトスリップ率（適正張力時は通常 1% 未満）',
          },
        ],
        workedExample: {
          title: 'スパン中央たわみ点検',
          given: [
            '中心距離 C = 640 mm',
            '試験荷重 35 N における実測たわみ δ = 14.5 mm',
          ],
          steps: [
            '目標たわみ量を計算: δ_target = 640 / 64 = 10.0 mm',
            '実測値と目標値を比較: 14.5 mm > 10.0 mm（+45% 過大）',
            '診断: ベルト緩み（Loose）；モータスライドベースで δ ≈ 10.0 mm まで増し締めする',
          ],
          answer: '目標 δ = 10.0 mm；ベルトは緩み状態のため張り調整が必要',
        },
      },
      {
        title: '歯車変速比・モジュール・中心距離',
        summary:
          '平歯車はインボリュート歯形のかみ合いによりスリップのない確実な動力伝達を行います。2つの歯車が正しくかみ合うには、モジュール（m）と圧力角（通常 20°）が同一である必要があります。',
        equations: [
          {
            label: '歯車変速比',
            formula: 'i = Z₂ / Z₁ = N₁ / N₂',
            note: 'Z₁ = 駆動歯数, Z₂ = 従動歯数',
          },
          {
            label: 'ピッチ円直径',
            formula: 'd = m × Z',
            note: 'm = モジュール (mm)',
          },
          {
            label: '標準中心距離',
            formula: 'C₀ = m × (Z₁ + Z₂) / 2',
            note: '転位なし標準インボリュートかみ合いの理論中心距離',
          },
          {
            label: 'ピッチ円周速度',
            formula: 'v = (π × d₁ × N₁) / 60,000  (m/s)',
            note: '潤滑方式（グリース・油浴・強制循環）選定の基準',
          },
        ],
        workedExample: {
          title: '平歯車列の諸元計算',
          given: [
            'モジュール m = 3 mm, Z₁ = 20 歯, Z₂ = 45 歯',
            'モータ回転数 N₁ = 1450 RPM',
          ],
          steps: [
            'ピッチ円直径: d₁ = 3 × 20 = 60 mm, d₂ = 3 × 45 = 135 mm',
            '標準中心距離: C₀ = 3 × (20 + 45) / 2 = 97.5 mm',
            '変速比: i = 45 / 20 = 2.25 → N₂ = 1450 / 2.25 = 644.4 RPM',
            'ピッチ円周速度: v = (π × 60 × 1450) / 60,000 = 4.56 m/s',
          ],
          answer: 'C₀ = 97.5 mm, N₂ = 644.4 RPM, v = 4.56 m/s',
        },
      },
      {
        title: 'トルク増幅とバックラッシ保守',
        summary:
          '減速駆動では変速比と機械効率に比例して出力トルクが増幅されます。平歯車では潤滑油膜の形成と熱膨張を吸収するため、適正なバックラッシ（歯面すきま）の確保が不可欠です。',
        equations: [
          {
            label: '入力トルク',
            formula: 'T₁ = (9550 × P_kW) / N₁  (N·m)',
            note: '9550 = 60,000 / (2π) 換算定数',
          },
          {
            label: '出力トルク',
            formula: 'T₂ = T₁ × i × η',
            note: 'η ≈ 0.95 (Vベルト) または 0.98 (平歯車)',
          },
          {
            label: '中心距離変位によるバックラッシ変化',
            formula: 'Δj ≈ 2 × ΔC × tan(α)',
            note: 'α = 圧力角 20°；負の ΔC は歯面かじり・焼付きの原因',
          },
        ],
        workedExample: {
          title: 'トルクとバックラッシの確認',
          given: [
            'モータ出力 P = 7.5 kW（N₁ = 1450 RPM）',
            '歯車比 i = 2.25, 効率 η = 98.2%',
            '中心距離オフセット ΔC = +0.10 mm（α = 20°）',
          ],
          steps: [
            '入力トルク: T₁ = (9550 × 7.5) / 1450 = 49.40 N·m',
            '出力トルク: T₂ = 49.40 × 2.25 × 0.982 = 109.15 N·m',
            'バックラッシ増加量: Δj = 2 × 0.10 × tan(20°) = 0.073 mm',
          ],
          answer: 'T₂ = 109.2 N·m, Δj = +0.073 mm',
        },
      },
    ],
    practice: [
      {
        id: 'bg-p1',
        prompt:
          '駆動プーリ D₁ = 120 mm（N₁ = 1500 RPM）、従動プーリ D₂ = 300 mm のVベルト駆動があります。スリップを無視できる場合、出力回転数 N₂ (RPM) を求めなさい。',
        hint: 'まず変速比 i = D₂ / D₁ を求め、N₁ を i で割ります。',
        solutionSteps: [
          '変速比 i = D₂ / D₁ = 300 / 120 = 2.5',
          '出力回転数 N₂ = N₁ / i = 1500 / 2.5 = 600 RPM',
        ],
      },
      {
        id: 'bg-p2',
        prompt:
          'D₁ = 100 mm、D₂ = 260 mm、軸間中心距離 C = 400 mm のVベルト駆動の近似ピッチ長さ L (mm) を計算しなさい。',
        hint: 'L ≈ 2C + (π/2)(D₁ + D₂) + (D₂ − D₁)² / (4C) を使用します。',
        solutionSteps: [
          '2C = 2 × 400 = 800 mm',
          '(π/2)(100 + 260) = 1.5708 × 360 = 565.49 mm',
          '(260 − 100)² / (4 × 400) = 25600 / 1600 = 16.00 mm',
          '合計 L = 800 + 565.49 + 16.00 = 1381.5 mm',
        ],
      },
      {
        id: 'bg-p3',
        prompt:
          'C/64荷重-たわみルールを用いる場合、中心距離 C = 512 mm のベルト駆動における目標スパン中央たわみ量 δ (mm) はいくらですか。',
        hint: '中心距離 C (mm) を 64 で割ります。',
        solutionSteps: ['δ_target = C / 64 = 512 / 64 = 8.0 mm'],
      },
      {
        id: 'bg-p4',
        prompt:
          'かみ合う2つの平歯車のモジュール m = 4 mm、歯数 Z₁ = 18、Z₂ = 42 のとき、標準中心距離 C₀ (mm) を求めなさい。',
        hint: 'C₀ = m × (Z₁ + Z₂) / 2 を使用します。',
        solutionSteps: ['C₀ = 4 × (18 + 42) / 2 = 4 × 60 / 2 = 120 mm'],
      },
      {
        id: 'bg-p5',
        prompt:
          '7.5 kW・1500 RPM のモータで、減速比 i = 3.0・効率 η = 96% (0.96) の減速段を駆動するとき、出力トルク T₂ (N·m) を求めなさい。',
        hint: 'T₁ = 9550 × P / N₁ を求め、i と η を掛けます。',
        solutionSteps: [
          '入力トルク T₁ = (9550 × 7.5) / 1500 = 47.75 N·m',
          '出力トルク T₂ = 47.75 × 3.0 × 0.96 = 137.52 N·m',
        ],
      },
    ],
    quiz: [
      {
        id: 'bg-q1',
        question:
          'C/64ルールを用いたVベルト張力点検で、実測たわみ量が C/64 より大幅に「大きい」場合、何を示していますか。',
        options: [
          'ベルトが張りすぎて軸受に過負荷がかかっている',
          'ベルトが緩んでおり、スリップや側面グレージング（硬化光沢）が起きやすい',
          'プーリの芯出しが完全に合っている',
          'モータが同期速度以上で回転している',
        ],
        explanation:
          '規定荷重でのたわみ量が大きいほどベルト張力が低い（緩み）ことを意味し、スリップ・発熱・ベルト摩耗の原因になります。',
      },
      {
        id: 'bg-q2',
        question:
          'Vベルトを張りすぎた状態（過張力）で運転した場合の主な機械的悪影響は何ですか。',
        options: [
          '過大なスリップによる出力回転数の低下',
          '軸受への過大なラジアル荷重、軸たわみ、および軸受の早期損傷',
          '従動プーリ側の巻き掛け角の増加',
          'ピッチ円周速度の低下',
        ],
        explanation:
          '過張力はモータ側・負荷側双方の軸受に高い静的ラジアル荷重を与え、軸受寿命とベルト心線の疲労寿命を著しく縮めます。',
      },
      {
        id: 'bg-q3',
        question:
          'Vベルト駆動において、プーリの角度・平行ミスアライメントが直接引き起こす症状はどれですか。',
        options: [
          'ベルト側面の早期摩耗、鳴き、および溝内でのベルト反転リスク',
          'ピッチ円上でのバックラッシゼロ化',
          '歯車モジュールの増加',
          '理論変速比の上昇',
        ],
        explanation:
          'プーリが芯ずれしているとベルトが斜めに溝へ出入りするため、側面が激しく摩耗し、ベルト反転や異音が発生します。',
      },
      {
        id: 'bg-q4',
        question:
          '2つの標準平歯車が干渉せず正しくかみ合うために、両者で一致していなければならない組はどれですか。',
        options: [
          '歯数 (Z) と歯幅',
          'ピッチ円直径 (d) と軸径',
          'モジュール (m) と圧力角 (α)',
          '材質硬さと回転数 (RPM)',
        ],
        explanation:
          'かみ合う平歯車同士は、歯の大きさを表すモジュール (m) と圧力角 (通常 20°) が同一でなければなりません。',
      },
      {
        id: 'bg-q5',
        question:
          '保守作業で平歯車対の中心距離をわずかに広げた場合（+ΔC）、かみ合いにどのような変化が起きますか。',
        options: [
          'バックラッシが増加し、過大な場合は歯打ち音（ラトル）が発生する',
          '変速比が比例して増加する',
          'バックラッシがゼロになり歯がロックする',
          'ピッチ円周速度が2倍になる',
        ],
        explanation:
          '軸間を広げると Δj ≈ 2·ΔC·tan(α) だけバックラッシが増加しますが、歯数比 Z₂/Z₁ による変速比は変わりません。',
      },
      {
        id: 'bg-q6',
        question:
          '歯車駆動の保守においてピッチ円周速度（v = π·d₁·N₁ / 60,000）を監視する理由は何ですか。',
        options: [
          'ベルト長さの再張力調整が必要かを判断するため',
          '必要な潤滑方式、動的歯面荷重、および騒音限界を判断するため',
          'バックラッシ測定の代わりにするため',
          '軸のスラスト振れを直接測定するため',
        ],
        explanation:
          'ピッチ円周速度が高いほど発熱や遠心力による油飛散が増えるため、油浴・強制潤滑の選定や歯車バランス精度の基準となります。',
      },
    ],
  },
});
