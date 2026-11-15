import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('bore-gauge', {
  id: {
    title: 'Lab Dial Bore Gauge, Ovalitas & Ketirusan Silinder',
    shortTitle: 'Dial Bore & Ovalitas',
    description:
      'Simulator metrologi diameter dalam silinder untuk teknik goyang (rocking) titik balik jarum dial bore gauge 0.01 mm, penyetelan nol dengan master ring gauge, serta pemetaan 6-titik ovalitas dan ketirusan (taper) liner silinder.',
    explore: [
      {
        title: 'Teknik Goyang (Rocking) Dial Bore Gauge & Titik Balik (Null Point)',
        summary:
          'Dial bore gauge दो-titik (dilengkapi jembatan pemusat/centering shoes berpegas) harus digoyangkan perlahan melewati garis sumbu vertikal silinder. Saat batang ukur miring sebesar sudut θ, garis kontak membentuk tali busur miring D / cos(θ) yang lebih panjang dari diameter sebenarnya. Titik balik ekstrem jarum (pembacaan diameter minimum) menunjukkan posisi tegak lurus sejati (θ = 0°).',
        equations: [
          {
            label: 'Bentang Ukur Miring (Efek Sudut Goyang θ)',
            formula: 'D(θ) = D_true / cos(θ) ≈ D_true * (1 + θ² / 2)',
            note: 'Dalam radian; kemiringan kecil sekalipun membuat bentang ukur terbaca lebih besar dari diameter sebenarnya D_true.',
          },
          {
            label: 'Pembacaan Diameter Sebenarnya pada Titik Balik',
            formula: 'D_true = min_θ D(θ) = D_master + Δ_dial(θ = 0°)',
            note: 'Catat pembacaan tepat saat jarum dial berhenti dan berbalik arah (null point).',
          },
          {
            label: 'Kesalahan Kosinus Akibat Kemiringan (θ dalam derajat)',
            formula: 'e_rock = D_true * ((1 / cos(θ)) - 1)',
            note: 'Pada bore 85 mm, kemiringan θ = 3° menghasilkan kesalahan +0.117 mm (lebih dari dua kali batas servis 0.05 mm!).',
          },
        ],
        workedExample: {
          title: 'Kesalahan Ukur Akibat Tidak Mencari Titik Balik (Rocking)',
          given: [
            'Diameter silinder sebenarnya D_true = 85.020 mm',
            'Teknisi memegang bore gauge miring pada sudut θ = 2.5° tanpa menggoyangkannya',
          ],
          steps: [
            'Hitung cos(2.5°) = 0.999048.',
            'Bentang miring yang terukur: D(2.5°) = 85.020 / 0.999048 = 85.101 mm.',
            'Kesalahan akibat kemiringan: e_rock = 85.101 - 85.020 = +0.081 mm.',
            'Dengan menggoyangkan gauge melewati 0°, jarum mencapai titik balik minimum tepat di 85.020 mm.',
          ],
          answer: 'D_true = 85.020 mm (miring 2.5° memberi kesalahan semu +0.081 mm)',
        },
      },
      {
        title: 'Ovalitas (Out-of-Round) & Ketirusan (Taper) Liner Silinder',
        summary:
          'Keausan liner silinder tidak merata: gaya dorong samping (side thrust) batang torak saat langkah usaha menyebabkan keausan elips pada Sumbu A (0° Thrust) dibanding Sumbu B (90° Pin), sedangkan tekanan pembakaran dan suhu tinggi di dekat Titik Mati Atas (TMA/TDC) menyebabkan keausan tirus (taper) di bagian atas.',
        equations: [
          {
            label: 'Ovalitas Silinder (Out-of-Round) pada Satu Bidang Kedalaman',
            formula: 'Ovality = |D_A - D_B|',
            note: 'Selisih mutlak antara diameter Sumbu A (0° Thrust) dan Sumbu B (90° Pin) pada kedalaman yang sama (Atas, Tengah, atau Bawah).',
          },
          {
            label: 'Ketirusan Silinder (Cylinder Taper) sepanjang Satu Sumbu',
            formula: 'Taper = |D_top - D_bottom|',
            note: 'Selisih mutlak antara diameter bidang Atas (15 mm) dan bidang Bawah (135 mm) pada sumbu yang sama (Sumbu A atau Sumbu B).',
          },
          {
            label: 'Kriteria Batas Servis Re-Bore / Honing OEM',
            formula: 'max(Ovality) ≤ 0.050 mm  dan  max(Taper) ≤ 0.050 mm',
            note: 'Jika ovalitas atau ketirusan melampaui 0.050 mm, silinder harus di-rebore/honing ke ukuran piston oversize.',
          },
        ],
        workedExample: {
          title: 'Evaluasi Pemetaan 6-Titik Silinder terhadap Batas Servis 0.05 mm',
          given: [
            'Bidang Atas (15 mm): D_A = 85.074 mm, D_B = 85.018 mm',
            'Bidang Tengah (75 mm): D_A = 85.048 mm, D_B = 85.014 mm',
            'Bidang Bawah (135 mm): D_A = 85.012 mm, D_B = 85.008 mm',
            'Batas servis maksimum OEM untuk Ovalitas dan Taper = 0.050 mm',
          ],
          steps: [
            'Hitung Ovalitas tiap kedalaman: Atas = |85.074 - 85.018| = 0.056 mm; Tengah = |85.048 - 85.014| = 0.034 mm; Bawah = |85.012 - 85.008| = 0.004 mm.',
            'Ovalitas Maksimum = 0.056 mm (pada bidang Atas).',
            'Hitung Ketirusan tiap sumbu: Sumbu A = |85.074 - 85.012| = 0.062 mm; Sumbu B = |85.018 - 85.008| = 0.010 mm.',
            'Ketirusan Maksimum = 0.062 mm (pada Sumbu A). Kedua nilai melampaui batas servis 0.050 mm.',
          ],
          answer: 'Max Ovality = 0.056 mm, Max Taper = 0.062 mm → Wajib Re-Bore',
        },
      },
      {
        title: 'Penyetelan Nol Master Ring Gauge & Pemilihan Anvil',
        summary:
          'Dial bore gauge adalah alat ukur komparatif, bukan alat ukur mutlak. Sebelum mengukur lubang, pilih kombinasi anvil tetap dan ring pengganjal (spacer/shim) yang sedikit lebih panjang dari diameter nominal, lalu masukkan ke dalam Master Setting Ring Gauge terkalibrasi (atau mikrometer luar pada jig penyetel) dengan preload ~0.5–1.0 mm dan putar bezel dial ke angka 0.',
        equations: [
          {
            label: 'Pemilihan Panjang Anvil & Spacer',
            formula: 'L_stack = L_anvil + L_shim ≈ D_nominal + Preload',
            note: 'Preload spindel biasanya 0.50 mm hingga 1.00 mm agar jarum dapat bergerak dua arah (+ dan -).',
          },
          {
            label: 'Perhitungan Diameter Mutlak dari Simpangan Dial',
            formula: 'D_measured = D_ring + Δ_dial - e_zero',
            note: 'D_ring adalah diameter master ring gauge, Δ_dial adalah simpangan ukuran lubang, dan e_zero adalah kesalahan penyetelan nol.',
          },
        ],
        workedExample: {
          title: 'Menentukan Diameter Aktual dari Pembacaan Komparatif Dial',
          given: [
            'Master Setting Ring Gauge terkalibrasi D_ring = 85.000 mm',
            'Dial bore gauge disetel ke 0.00 mm di dalam ring gauge (preload 1.00 mm)',
            'Saat diukur pada silinder, simpangan ukuran pada titik balik menunjukkan +0.045 mm (lubang lebih besar dari ring gauge)',
          ],
          steps: [
            'Karena dial disetel nol pada D_ring = 85.000 mm без kesalahan nol (e_zero = 0):',
            'Tambahkan simpangan ukuran (+0.045 mm) ke diameter master ring.',
            'D_measured = 85.000 mm + 0.045 mm = 85.045 mm.',
          ],
          answer: '85.045 mm',
        },
      },
    ],
    practice: [
      {
        id: 'bore-p1',
        prompt:
          'Pada kedalaman Tengah (75 mm), diameter Sumbu A (0° Thrust) terukur 85.068 mm dan Sumbu B (90° Pin) terukur 85.016 mm. Berapakah ovalitas (out-of-round) pada bidang Tengah dalam mm?',
        hint: 'Gunakan Ovality = |D_A - D_B|.',
        solutionSteps: [
          'D_A = 85.068 mm dan D_B = 85.016 mm.',
          'Ovalitas = |85.068 - 85.016| = 0.052 mm.',
        ],
      },
      {
        id: 'bore-p2',
        prompt:
          'Sepanjang Sumbu A (0° Thrust), diameter pada bidang Atas (15 mm) adalah 85.084 mm dan pada bidang Bawah (135 mm) adalah 85.012 mm. Berapakah ketirusan (taper) Sumbu A dalam mm?',
        hint: 'Gunakan Taper = |D_top - D_bottom| pada sumbu yang sama.',
        solutionSteps: [
          'D_top,A = 85.084 mm dan D_bottom,A = 85.012 mm.',
          'Taper_A = |85.084 - 85.012| = 0.072 mm.',
        ],
      },
      {
        id: 'bore-p3',
        prompt:
          'Sebuah dial bore gauge disetel nol pada Master Ring Gauge 85.000 mm. Saat mengukur bagian atas silinder, titik balik menunjukkan lubang lebih besar 3.5 divisi (ketelitian 0.01 mm/divisi, yaitu +0.035 mm). Berapa diameter lubang aktual dalam mm?',
        hint: 'Tambahkan simpangan ukuran (+0.035 mm) ke ukuran master ring (85.000 mm).',
        solutionSteps: [
          'Ukuran referensi Master Ring = 85.000 mm.',
          'Simpangan ukuran = +3.5 * 0.01 mm = +0.035 mm.',
          'Diameter aktual = 85.000 + 0.035 = 85.035 mm.',
        ],
      },
      {
        id: 'bore-p4',
        prompt:
          'Sebuah liner silinder memiliki diameter sebenarnya D_true = 85.000 mm. Jika bore gauge dipegang miring sebesar θ = 4.0° tanpa digoyangkan ke titik balik, berapa pembacaan diameter semu D(θ) = D_true / cos(4°) dalam mm? (Bulatkan ke 2 desimal)',
        hint: 'cos(4°) ≈ 0.997564. Hitung 85.000 / 0.997564.',
        solutionSteps: [
          'cos(4.0°) = 0.997564.',
          'D(4.0°) = 85.000 / 0.997564 = 85.2075 mm ≈ 85.21 mm.',
        ],
      },
      {
        id: 'bore-p5',
        prompt:
          'Hasil pemetaan 6-titik menunjukkan: Atas (A=85.062, B=85.020), Tengah (A=85.045, B=85.015), Bawah (A=85.014, B=85.010) mm. Berapakah nilai Ketirusan Maksimum (Max Taper) di antara kedua sumbu dalam mm?',
        hint: 'Hitung Taper Sumbu A = |85.062 - 85.014| dan Taper Sumbu B = |85.020 - 85.010|, lalu ambil nilai terbesar.',
        solutionSteps: [
          'Taper Sumbu A = |85.062 - 85.014| = 0.048 mm.',
          'Taper Sumbu B = |85.020 - 85.010| = 0.010 mm.',
          'Max Taper = max(0.048, 0.010) = 0.048 mm.',
        ],
      },
    ],
    quiz: [
      {
        id: 'bore-q1',
        question:
          'Mengapa dial bore gauge harus digoyangkan (rocked) melewati garis sumbu saat mengukur diameter dalam silinder?',
        options: [
          'Untuk meratakan lapisan oli pada dinding silinder',
          'Untuk menemukan titik balik ekstrem jarum (diameter minimum) yang menandakan batang ukur tepat tegak lurus sumbu lubang',
          'Untuk mengurangi gaya pegas sepatu pemusat (centering shoes)',
          'Untuk mengambil rata-rata antara diameter atas dan bawah secara otomatis',
        ],
        explanation:
          'Saat bore gauge miring terhadap bidang tegak lurus lubang, ia mengukur tali busur elips miring D/cos(θ) yang lebih panjang. Titik balik minimum jarum terjadi tepat pada θ = 0° (diameter sebenarnya).',
      },
      {
        id: 'bore-q2',
        question:
          'Apa fungsi sepatu pemusat berpegas (spring-loaded centering shoes / guide bridge) pada kepala dial bore gauge?',
        options: [
          'Mengunci bore gauge agar tidak bergerak vertikal',
          'Memastikan garis kontak anvil dan plunger melewati pusat lingkaran lubang pada bidang lintang',
          'Mengkompensasi pemuaian termal secara otomatis',
          'Menggandakan resolusi indikator dial dari 0.01 mm menjadi 0.005 mm',
        ],
        explanation:
          'Jembatan pemusat menyelaraskan poros pengukur secara radial sehingga melintasi titik pusat (tali busur maksimum dalam bidang potong lintang), sementara goyangan vertikal mencari kemiringan minimum (θ = 0°).',
      },
      {
        id: 'bore-q3',
        question:
          'Pada mesin torak, di bagian manakah keausan ketirusan (taper) silinder biasanya paling besar terjadi?',
        options: [
          'Di bagian paling bawah liner di bawah langkah cincin piston',
          'Tepat di bagian atas silinder dekat titik balik cincin atas pada Titik Mati Atas (TMA/TDC)',
          'Hanya pada sisi sumbu pena piston (90° Pin Axis) di bagian bawah',
          'Merata sempurna dari atas ke bawah',
        ],
        explanation:
          'Di dekat TMA (Top — 15 mm), tekanan gas pembakaran menekan cincin piston dengan kuat ke dinding silinder pada saat suhu paling tinggi dan lapisan film oli paling tipis.',
      },
      {
        id: 'bore-q4',
        question:
          'Mengapa Sumbu A (0° Thrust Axis, tegak lurus poros engkol) mengalami ovalitas lebih besar dibandingkan Sumbu B (90° Pin Axis)?',
        options: [
          'Karena pena piston memuai ke arah sumbu engkol',
          'Karena sudut kemiringan batang torak (connecting rod) menghasilkan gaya dorong lateral yang besar pada dinding Thrust selama langkah usaha',
          'Karena saluran air pendingin hanya berada di Sumbu B',
          'Karena ring piston tidak berputar pada Sumbu A',
        ],
        explanation:
          'Sudut batang torak saat langkah kompresi dan langkah usaha menghasilkan komponen gaya samping (thrust force) yang menekan skirt piston ke dinding Sumbu A (0°).',
      },
      {
        id: 'bore-q5',
        question:
          'Jika hasil pengukuran pada kedalaman Tengah (75 mm) adalah D_A = 85.072 mm dan D_B = 85.014 mm, serta batas servis ovalitas OEM adalah 0.050 mm, bagaimana kesimpulan inspeksinya?',
        options: [
          'Lulus (Ovalitas = 0.029 mm, di bawah batas 0.050 mm)',
          'Gagal / Wajib Re-Bore (Ovalitas = 0.058 mm, melebihi batas servis 0.050 mm)',
          'Lulus asalkan ketirusan di bawah 0.050 mm',
          'Cukup ganti ring piston standar tanpa honing atau re-bore',
        ],
        explanation:
          'Ovalitas = |85.072 - 85.014| = 0.058 mm, yang melampaui batas servis maksimum OEM 0.050 mm sehingga silinder harus di-rebore ke ukuran oversize.',
      },
      {
        id: 'bore-q6',
        question:
          'Alat referensi apakah yang paling akurat digunakan untuk menyetel titik nol (zeroing) dial bore gauge sebelum inspeksi presisi?',
        options: [
          'Mistar baja 300 mm',
          'Jangka sorong rahang dalam 0.05 mm',
          'Master Setting Ring Gauge terkalibrasi (atau mikrometer luar presisi pada fixture penyetel)',
          'Feeler gauge daun tipis',
        ],
        explanation:
          'Master Setting Ring Gauge yang digerinda dan dilapping presisi memberikan referensi silindris dengan akurasi mikron untuk menyetel titik nol dial bore gauge.',
      },
    ],
  },
  ja: {
    title: 'シリンダゲージ・楕円度・テーパ測定ラボ',
    shortTitle: 'シリンダゲージ・内径測定',
    description:
      '0.01 mm 目盛シリンダゲージ（ダイヤルボアゲージ）の揺動（ロッキング）による最小反転点の読み取り、リングゲージでのゼロセット、およびシリンダライナの6点マッピング（楕円度・テーパ診断）を学ぶ精密測定シミュレータ。',
    explore: [
      {
        title: 'シリンダゲージの揺動法（ロッキング）と指針の反転点（Null Point）',
        summary:
          '2点接触式シリンダゲージ（案内板／センタリングシュー付き）は、ボア中心線に対して前後にゆっくり揺動（ロッキング）させて測定します。測定軸が角度 θ だけ傾くと、接触スパンは斜め弦 D / cos(θ) となり真の内径より大きく表示されます。指針が最も押し込まれて反転する極値点（最小径）が、真の直角位置（θ = 0°）です。',
        equations: [
          {
            label: '傾き角 θ による見かけの測定スパン',
            formula: 'D(θ) = D_true / cos(θ) ≈ D_true * (1 + θ² / 2)',
            note: 'θ はラジアン。わずかな傾きでも真の内径 D_true より大きく測定されます。',
          },
          {
            label: '反転点（Null Point）における真の内径',
            formula: 'D_true = min_θ D(θ) = D_master + Δ_dial(θ = 0°)',
            note: 'ダイヤル指針が停止して逆방향へ折り返す瞬間（反転点）の値を読み取ります。',
          },
          {
            label: '傾きによるコサイン誤差（θ は度数）',
            formula: 'e_rock = D_true * ((1 / cos(θ)) - 1)',
            note: '内径 85 mm で θ = 3° 傾くと +0.117 mm の誤差が生じ、使用限度 0.05 mm の2倍以上になります。',
          },
        ],
        workedExample: {
          title: '揺動（反転点探索）を行わなかった場合の傾き誤差',
          given: [
            'シリンダの真の内径 D_true = 85.020 mm',
            '作業者がゲージを θ = 2.5° 傾けたまま固定して読み取った',
          ],
          steps: [
            'cos(2.5°) = 0.999048 を求めます。',
            '傾いた状態のスパン: D(2.5°) = 85.020 / 0.999048 = 85.101 mm。',
            '傾きによる測定誤差: e_rock = 85.101 - 85.020 = +0.081 mm。',
            'ゲージを前後に揺動させて θ = 0° を通過させると、指針の反転点で正確に 85.020 mm が得られます。',
          ],
          answer: 'D_true = 85.020 mm（2.5° の傾きで +0.081 mm の過大誤差）',
        },
      },
      {
        title: 'シリンダライナの楕円度（Ovality）とテーパ（Taper）',
        summary:
          'シリンダボアの摩耗は不均一に進行します。膨張行程でのコンロッド傾きによるピストン側圧（スラスト力）により、スラスト方向（A軸: 0°）はピン方向（B軸: 90°）より大きく摩耗して楕円化します。また上死点（TDC）付近は高温・高圧かつ油膜が薄いため、上部が大きく摩耗してテーパ状になります。',
        equations: [
          {
            label: '同一深さ断面における楕円度（Out-of-Round / Ovality）',
            formula: 'Ovality = |D_A - D_B|',
            note: '同じ測定深さ（上・中・下）におけるスラスト方向（A軸 0°）とピン方向（B軸 90°）の内径差の絶対値。',
          },
          {
            label: '同一軸方向におけるテーパ量（Cylinder Taper）',
            formula: 'Taper = |D_top - D_bottom|',
            note: '同じ測定軸（A軸またはB軸）における上部（15 mm）と下部（135 mm）の内径差の絶対値。',
          },
          {
            label: 'OEM ボーリング／ホーニング使用限度基準',
            formula: 'max(Ovality) ≤ 0.050 mm  かつ  max(Taper) ≤ 0.050 mm',
            note: '楕円度またはテーパ量のいずれかが 0.050 mm を超えた場合、オーバーサイズピストン用の再ボーリングが必要です。',
          },
        ],
        workedExample: {
          title: '6点ボアマッピング測定値と使用限度 0.05 mm の合否判定',
          given: [
            '上部（15 mm）: D_A = 85.074 mm, D_B = 85.018 mm',
            '中央（75 mm）: D_A = 85.048 mm, D_B = 85.014 mm',
            '下部（135 mm）: D_A = 85.012 mm, D_B = 85.008 mm',
            'OEM 使用限度（楕円度・テーパとも）= 0.050 mm',
          ],
          steps: [
            '各深さの楕円度を計算: 上部 = |85.074 - 85.018| = 0.056 mm、中央 = |85.048 - 85.014| = 0.034 mm、下部 = |85.012 - 85.008| = 0.004 mm。',
            '最大楕円度 = 0.056 mm（上部断面）。',
            '各軸のテーパ量を計算: A軸 = |85.074 - 85.012| = 0.062 mm、B軸 = |85.018 - 85.008| = 0.010 mm。',
            '最大テーパ量 = 0.062 mm（A軸）。両方とも使用限度 0.050 mm を超過しています。',
          ],
          answer: '最大楕円度 = 0.056 mm, 最大テーパ = 0.062 mm → 要ボーリング修正（不合格）',
        },
      },
      {
        title: 'マスターリングゲージによるゼロセットとアンビル選定',
        summary:
          'シリンダゲージは比較測定器です。測定前に呼び径に適合する交換アンビルとスペーサ（ワッシャ）を組み合わせて約 0.5〜1.0 mm の予圧を与え、校正済みマスターリングゲージ（または外側マイクロメータ）内で揺動反転点を探してダイヤル目盛板の 0 を合わせます。',
        equations: [
          {
            label: 'アンビル・スペーサ合計長さの選定',
            formula: 'L_stack = L_anvil + L_shim ≈ D_nominal + Preload',
            note: '測定子が正負両方向に動けるよう、0.50〜1.00 mm 程度の予圧（Preload）を設定します。',
          },
          {
            label: 'ダイヤル偏差からの実測内径の算出',
            formula: 'D_measured = D_ring + Δ_dial - e_zero',
            note: 'D_ring はリングゲージ基準径、Δ_dial は基準径からの内径偏差、e_zero はゼロセット誤差です。',
          },
        ],
        workedExample: {
          title: '比較測定のダイヤル偏差から実内径を求める',
          given: [
            'マスターリングゲージ基準径 D_ring = 85.000 mm',
            'リングゲージ内でシリンダゲージを 0.00 mm にゼロセット（予圧 1.00 mm）',
            'ボア測定時、反転点での内径偏差が +0.045 mm（基準より大径）を示した',
          ],
          steps: [
            'ゼロ誤差なしで D_ring = 85.000 mm にセットされているため:',
            '基準径 85.000 mm に内径偏差 +0.045 mm を加算します。',
            'D_measured = 85.000 + 0.045 = 85.045 mm。',
          ],
          answer: '85.045 mm',
        },
      },
    ],
    practice: [
      {
        id: 'bore-p1',
        prompt:
          '中央断面（深さ 75 mm）において、A軸（0° スラスト方向）が 85.068 mm、B軸（90° ピン方向）が 85.016 mm と測定されました。この断面の楕円度（mm）はいくらですか？',
        hint: 'Ovality = |D_A - D_B| を計算します。',
        solutionSteps: [
          'D_A = 85.068 mm、D_B = 85.016 mm。',
          '楕円度 = |85.068 - 85.016| = 0.052 mm。',
        ],
      },
      {
        id: 'bore-p2',
        prompt:
          'A軸（0° スラスト方向）に沿って、上部（15 mm）が 85.084 mm、下部（135 mm）が 85.012 mm でした。A軸のテーパ量（mm）はいくらですか？',
        hint: '同一軸上の Taper = |D_top - D_bottom| を計算します。',
        solutionSteps: [
          'D_top,A = 85.084 mm、D_bottom,A = 85.012 mm。',
          'A軸テーパ量 = |85.084 - 85.012| = 0.072 mm。',
        ],
      },
      {
        id: 'bore-p3',
        prompt:
          '85.000 mm のマスターリングゲージでゼロセットしたシリンダゲージ（1目盛 0.01 mm）でシリンダ上部を測定したところ、反転点で基準より +3.5 目盛（+0.035 mm）大きい値を示しました。実内径（mm）はいくらですか？',
        hint: '基準径 85.000 mm に +0.035 mm を加えます。',
        solutionSteps: [
          'マスターリング基準径 = 85.000 mm。',
          '偏差 = +3.5 * 0.01 mm = +0.035 mm。',
          '実内径 = 85.000 + 0.035 = 85.035 mm。',
        ],
      },
      {
        id: 'bore-p4',
        prompt:
          '真の内径 D_true = 85.000 mm のシリンダに対し、ゲージを θ = 4.0° 傾けたまま揺動させずに読んだ場合、見かけの測定スパン D(θ) = D_true / cos(4°) は何 mm になりますか？（小数第2位まで）',
        hint: 'cos(4°) ≈ 0.997564 として 85.000 / 0.997564 を計算します。',
        solutionSteps: [
          'cos(4.0°) = 0.997564。',
          'D(4.0°) = 85.000 / 0.997564 = 85.2075 mm ≈ 85.21 mm。',
        ],
      },
      {
        id: 'bore-p5',
        prompt:
          '6点測定の結果、上部 (A=85.062, B=85.020)、中央 (A=85.045, B=85.015)、下部 (A=85.014, B=85.010) mm でした。A軸・B軸のうち最大テーパ量（Max Taper, mm）はいくらですか？',
        hint: 'A軸テーパ = |85.062 - 85.014| と B軸テーパ = |85.020 - 85.010| の大きい方を求めます。',
        solutionSteps: [
          'A軸テーパ = |85.062 - 85.014| = 0.048 mm。',
          'B軸テーパ = |85.020 - 85.010| = 0.010 mm。',
          '最大テーパ量 = max(0.048, 0.010) = 0.048 mm。',
        ],
      },
    ],
    quiz: [
      {
        id: 'bore-q1',
        question:
          'シリンダゲージで内径を測定する際、ゲージをボア軸方向に前後に揺動（ロッキング）させる理由は何ですか？',
        options: [
          'シリンダ壁面の油膜を均等に広げるため',
          '測定軸がボアに直角となる最小径（指針の反転点）を正確に捉えるため',
          '案内板（センタリングシュー）のバネ圧を弱めるため',
          '上部と下部の内径を自動的に平均化するため',
        ],
        explanation:
          'ゲージが傾くと斜めの楕円弦 D/cos(θ) を測ってしまい過大表示になります。指針が折り返す最小径の反転点が θ = 0°（真の直径）です。',
      },
      {
        id: 'bore-q2',
        question:
          'シリンダゲージ先端の案内板（センタリングシュー）の役割として正しいものはどれですか？',
        options: [
          'ゲージを深さ方向に固定して動かないようにする',
          '断面内で測定子とアンビルを結ぶ線が常にボア中心（最大弦）を通るように自動求心する',
          '温度膨張を自動的にゼロ補正する',
          'ダイヤルの最小読取値を 0.01 mm から 0.005 mm に倍増させる',
        ],
        explanation:
          '案内板のバネ力によって半径方向の求心（断面内の最大弦通過）が保たれ、作業者は軸方向の揺動（最小径の反転点探索）に集中できます。',
      },
      {
        id: 'bore-q3',
        question:
          '往復動エンジンのシリンダライナにおいて、テーパ摩耗（口径拡大）が最も顕著に発生しやすい部位はどこですか？',
        options: [
          'ピストンリングが到達しないシリンダ最下部',
          '上死点（TDC）付近のトップリング折り返し位置（上部 15 mm 付近）',
          'ピストンピン軸方向（90°）の下部のみ',
          '上から下まで完全に均一に摩耗する',
        ],
        explanation:
          '上死点（TDC）付近では燃焼ガス圧力がリングを壁面に強く押し付け、かつ高温・低速で油膜が最も薄くなるため摩耗が集中します。',
      },
      {
        id: 'bore-q4',
        question:
          'A軸（0° スラスト方向：クランク軸と直角）が B軸（90° ピン方向：クランク軸と平行）よりも大きく摩耗して楕円化する主な原因は何ですか？',
        options: [
          'ピストンピンがクランク軸方向に熱膨張するため',
          '膨張行程においてコンロッドの傾き角によりピストンがスラスト側壁面に強く押し付けられるため',
          '冷却水通路が B軸側にしか存在しないため',
          'ピストンリングが A軸方向では回転しないため',
        ],
        explanation:
          'コンロッドが傾くことで燃焼荷重の水平分力（側圧／スラスト力）が発生し、A軸（0°）壁面の摩耗を促進します。',
      },
      {
        id: 'bore-q5',
        question:
          '中央断面（75 mm）での測定値が D_A = 85.072 mm、D_B = 85.014 mm であり、OEM の楕円度使用限度が 0.050 mm の場合、正しい判定はどれですか？',
        options: [
          '合格（楕円度 = 0.029 mm で限度 0.050 mm 以下）',
          '不合格・要ボーリング修正（楕円度 = 0.058 mm で使用限度 0.050 mm を超過）',
          'テーパ量が 0.050 mm 以下であれば合格',
          'ホーニングやボーリングを行わず標準リング交換のみでよい',
        ],
        explanation:
          '楕円度 = |85.072 - 85.014| = 0.058 mm となり、使用限度 0.050 mm を超えているためオーバーサイズへの再ボーリングが必要です。',
      },
      {
        id: 'bore-q6',
        question:
          'シリンダゲージの測定前に基準ゼロ点（0.00 mm）を合わせる際、最も高精度な基準器はどれですか？',
        options: [
          '300 mm 鋼製直尺',
          '最小読取値 0.05 mm のノギス内測ジョウ',
          '校正済みマスターリングゲージ（またはセッティングスタンドに固定した外側マイクロメータ）',
          'シックネスゲージ（すきまゲージ）',
        ],
        explanation:
          '精密研削・ラップ仕上げされたマスターリングゲージはミクロン単位の基準内径を持ち、シリンダゲージのゼロセットに最適です。',
      },
    ],
  },
});
