import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('gear-strength', {
  id: {
    title: 'Simulator Kekuatan Roda Gigi (Lentur AGMA & Lewis + Tegangan Kontak)',
    shortTitle: 'Kekuatan Roda Gigi',
    description:
      'Simulator analisis transmisi roda gigi komprehensif. Hitung tegangan lentur gigi metode Lewis dan AGMA, evaluasi tekanan pitting kontak Hertzian, tentukan faktor dinamis dan distribusi beban, serta analisis faktor keamanan (SF, SH) untuk baja karburasi, induksi, baja karbon, besi cor, dan perunggu.',
    explore: [
      {
        title: 'Tegangan Lentur Gigi: Persamaan Lewis & Formulasi AGMA',
        summary:
          'Kegagalan lentur kaki gigi bersifat katastropik: defleksi kantilever siklik berulang menimbulkan tegangan tarik tinggi pada fillet akar gigi sisi beban, memicu retak fatik progresif hingga patah mendadak. Wilfred Lewis (1892) memodelkan gigi sebagai balok kantilever berkekuatan lentur seragam dengan parabola terinskripsi. Standar modern AGMA 2001 / ISO 6336 memperluas formulasi klasik Lewis dengan faktor empiris untuk dampak dinamis (Kv), kejut beban lebih (Ko), faktor ukuran (Ks), distribusi beban sepanjang lebar gigi (Km), dan konsentrasi tegangan (faktor geometri J).',
        equations: [
          {
            label: 'Torsi Pinion & Gaya Tangensial',
            formula: 'T₁ = (9549.3 · P) / n₁,   Wₜ = (2000 · T₁) / d₁',
            note: 'P dalam kW, n₁ dalam RPM, T₁ dalam N·m, d₁ (diameter pitch) dalam mm, Wₜ dalam N.',
          },
          {
            label: 'Persamaan Lentur Lewis Klasik',
            formula: 'σ_L = Wₜ / (b · m · y)',
            note: 'b = lebar muka gigi (mm), m = modul (mm), y = faktor bentuk Lewis tak berdimensi.',
          },
          {
            label: 'Formulasi Tegangan Lentur Gigi AGMA',
            formula: 'σ_b = (Wₜ · K_o · K_v · K_s · K_m) / (b · m_n · J)',
            note: 'K_o = faktor aplikasi/kejut, K_v = faktor kecepatan dinamis, K_s = faktor ukuran, K_m = faktor distribusi beban, J = faktor geometri lentur AGMA.',
          },
          {
            label: 'Faktor Keamanan Fatik Lentur',
            formula: 'S_F = [σ_b] / σ_b',
            note: '[σ_b] = batas tegangan fatik lentur material yang diizinkan (MPa). Direkomendasikan S_F ≥ 1.40.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Tegangan Lentur Pinion untuk Reduser Kecepatan Industri',
          given: [
            'Daya motor listrik P = 15.0 kW pada kecepatan pinion n₁ = 1450 RPM',
            'Pasangan roda gigi lurus (spur): modul normal m = 4.0 mm, jumlah gigi pinion z₁ = 19, lebar muka b = 45 mm',
            'Sudut tekan standar α = 20°, faktor geometri AGMA J = 0.352',
            'Faktor aplikasi K_o = 1.25, Faktor dinamis K_v = 1.22, Faktor ukuran K_s = 1.0, Faktor distribusi K_m = 1.25',
            'Material pinion: Baja Paduan Karburasi 8620 ([σ_b] = 410 MPa)',
          ],
          steps: [
            'Hitung diameter pitch: d₁ = z₁ · m = 19 · 4.0 mm = 76.0 mm.',
            'Hitung torsi nominal pinion: T₁ = (9549.3 · 15.0) / 1450 = 98.79 N·m.',
            'Hitung gaya tangensial nominal: Wₜ = (2000 · 98.79 N·m) / 76.0 mm = 2599.7 N.',
            'Hitung faktor beban gabungan: K_total = K_o · K_v · K_s · K_m = 1.25 · 1.22 · 1.0 · 1.25 = 1.906.',
            'Hitung tegangan lentur AGMA: σ_b = (2599.7 N · 1.906) / (45 mm · 4.0 mm · 0.352) = 4955.0 / 63.36 = 78.2 MPa.',
            'Evaluasi faktor keamanan lentur: S_F = [σ_b] / σ_b = 410 MPa / 78.2 MPa = 5.24 (Sangat Aman).',
          ],
          answer: 'σ_b = 78.2 MPa, S_F = 5.24 (Margin struktural sangat aman terhadap patah akar gigi)',
        },
      },
      {
        title: 'Tegangan Kontak Hertzian & Ketahanan Pitting Permukaan',
        summary:
          'Jika patah akar gigi menyebabkan patah mendadak, kegagalan operasional yang paling sering terjadi pada siklus tinggi adalah pitting permukaan dan spalling akibat fatik kontak Hertzian. Pada garis kontak sesaat sepanjang profil involute aktif, tekanan kontak tekan lokal yang intens menghasilkan tegangan geser bawah-permukaan maksimum (τ_max ≈ 0.30 · p_0 pada kedalaman ~0.78 · b_Hertz). Geseran mikro siklik menyebabkan retak mikro yang merambat ke permukaan dan melepaskan serpihan logam kecil.',
        equations: [
          {
            label: 'Tegangan Kontak AGMA (Ketahanan Pitting)',
            formula: 'σ_c = Z_E · √[ (Wₜ · K_o · K_v · K_s · K_m) / (d₁ · b · I) ]',
            note: 'Z_E = koefisien elastis (√MPa), I = faktor geometri permukaan AGMA, d₁ = diameter pitch pinion (mm).',
          },
          {
            label: 'Koefisien Elastisitas (Z_E)',
            formula: 'Z_E = √{ 1 / [ π · ( (1 - ν₁²)/E₁ + (1 - ν₂²)/E₂ ) ] }',
            note: 'Untuk kontak baja-ke-baja (E = 206 GPa, ν = 0.30): Z_E ≈ 189.8 √MPa.',
          },
          {
            label: 'Faktor Geometri Kontak (I) untuk Roda Gigi Eksternal',
            formula: 'I = [ (sin α_t · cos α_t) / 2 ] · [ u / (u + 1) ]',
            note: 'u = rasio roda gigi (z₂ / z₁), α_t = sudut tekan transversal.',
          },
          {
            label: 'Faktor Keamanan Fatik Permukaan',
            formula: 'S_H = [σ_c] / σ_c',
            note: '[σ_c] = batas tegangan kontak izin material (MPa). Direkomendasikan S_H ≥ 1.15 untuk mencegah pitting.',
          },
        ],
        workedExample: {
          title: 'Menentukan Tegangan Kontak dan Ketahanan Pitting Pasangan Gigi 4:1',
          given: [
            'Diameter pitch pinion d₁ = 76.0 mm, lebar muka b = 45 mm, rasio u = 4.0 (z₁=19, z₂=76)',
            'Beban tangensial Wₜ = 2600 N, pengali beban total K_total = 1.906',
            'Sudut tekan α = 20° (sin 20° = 0.3420, cos 20° = 0.9397)',
            'Material: Baja Karburasi 8620 (Z_E = 189.8 √MPa, [σ_c] = 1620 MPa)',
          ],
          steps: [
            'Hitung faktor geometri kontak I: I = [ (0.3420 · 0.9397) / 2 ] · [ 4.0 / 5.0 ] = 0.1607 · 0.8 = 0.1285.',
            'Hitung suku dalam akar: (Wₜ · K_total) / (d₁ · b · I) = (2600 · 1.906) / (76.0 · 45 · 0.1285) = 4955.6 / 439.47 = 11.276 MPa.',
            'Hitung tegangan kontak AGMA: σ_c = 189.8 · √(11.276) = 189.8 · 3.358 = 637.3 MPa.',
            'Evaluasi faktor keamanan kontak: S_H = [σ_c] / σ_c = 1620 MPa / 637.3 MPa = 2.54 (Aman dari pitting).',
          ],
          answer: 'σ_c = 637.3 MPa, S_H = 2.54 (Aman terhadap fatik permukaan / pitting)',
        },
      },
      {
        title: 'Material Roda Gigi, Perlakuan Panas & Margin Keandalan',
        summary:
          'Pemilihan material dan perlakuan panas yang tepat menyeimbangkan ketahanan aus permukaan, keuletan inti terhadap lenturan, dan biaya fabrikasi. Baja paduan karburasi (seperti AISI 8620) memberikan lapisan permukaan sangat keras (58–62 HRC) dengan tegangan sisa tekan yang menghambat inisiasi retak, dipadu dengan inti ulet tahan impak. Pengerasan induksi (AISI 4140) menawarkan pengerasan lokal yang efisien. Baja karbon normalisasi (AISI 1045) cocok untuk beban menengah, sementara besi cor kelabu (GG25) unggul dalam meredam getaran dan tahan macet.',
        equations: [
          {
            label: 'Tegangan Fatik Lentur Izin ([σ_b])',
            formula: '[σ_b] = (S_t · Y_N) / (S_F,target · Y_θ · Y_Z)',
            note: 'S_t = batas fatik lentur AGMA, Y_N = faktor siklus hidup, Y_θ = faktor suhu, Y_Z = faktor keandalan.',
          },
          {
            label: 'Tegangan Fatik Kontak Izin ([σ_c])',
            formula: '[σ_c] = (S_c · Z_N · Z_W) / (S_H,target · Z_θ · Z_R)',
            note: 'S_c = batas ketahanan kontak AGMA, Z_N = faktor siklus tegangan, Z_W = faktor rasio kekerasan.',
          },
          {
            label: 'Batas Kapasitas Transmisi Daya',
            formula: 'P_max = min{ P · (S_F / 1.40),  P · (S_H / 1.15)² }',
            note: 'Karena tegangan kontak σ_c berbanding lurus dengan √P, kapasitas daya kontak berskala kuadrat terhadap rasio keamanan.',
          },
        ],
        workedExample: {
          title: 'Memilih Material untuk Peningkatan Penggerak Konveyor dengan Beban Kejut',
          given: [
            'Kebutuhan desain: Transmisi P = 30 kW pada 980 RPM dengan kejut berat (K_o = 1.60)',
            'Tegangan terhitung: Lentur σ_b = 185 MPa, Kontak σ_c = 890 MPa',
            'Kandidat A: AISI 1045 Normalisasi ([σ_b] = 210 MPa, [σ_c] = 620 MPa)',
            'Kandidat B: AISI 4140 Pengerasan Induksi ([σ_b] = 330 MPa, [σ_c] = 1250 MPa)',
          ],
          steps: [
            'Evaluasi Kandidat A (AISI 1045):',
            '  Lentur: S_F = 210 / 185 = 1.135 (< target 1.40, marjinal)',
            '  Kontak: S_H = 620 / 890 = 0.697 (< 1.0, kegagalan pitting parah!)',
            'Evaluasi Kandidat B (AISI 4140 Induksi):',
            '  Lentur: S_F = 330 / 185 = 1.784 (≥ 1.40, sangat aman)',
            '  Kontak: S_H = 1250 / 890 = 1.404 (≥ 1.15, aman dari pitting)',
            'Kesimpulan: AISI 1045 akan gagal pitting permukaan dini. Kandidat B (4140 Induksi) wajib digunakan.',
          ],
          answer: 'AISI 4140 Pengerasan Induksi terpilih (S_F = 1.78, S_H = 1.40)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Sebuah pinion roda gigi lurus dengan modul m = 4.0 mm dan z₁ = 20 gigi mentransmisikan daya mekanis 22.0 kW pada n₁ = 1450 RPM. Hitung gaya tangensial nominal Wₜ pada lingkaran pitch (dalam Newton).',
        hint: 'Cari diameter pitch d₁ = z₁ · m, hitung torsi nominal T₁ = (9549.3 · P) / n₁, kemudian hitung Wₜ = (2000 · T₁) / d₁.',
        solutionSteps: [
          'Diameter pitch: d₁ = 20 · 4.0 mm = 80.0 mm.',
          'Torsi pinion: T₁ = (9549.3 · 22.0) / 1450 = 144.89 N·m.',
          'Beban tangensial: Wₜ = (2000 · 144.89 N·m) / 80.0 mm = 3622.3 N (~3620 N).',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Untuk roda gigi lurus dengan diameter pitch d₁ = 76.0 mm berputar pada n₁ = 1450 RPM, hitung kecepatan linier pitch v dalam meter per detik (m/s).',
        hint: 'Rumus kecepatan pitch adalah v = (π · d₁ · n₁) / 60,000.',
        solutionSteps: [
          'Gunakan rumus: v = (π · 76.0 · 1450) / 60,000.',
          'v = 346,203 / 60,000 = 5.77 m/s.',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Gigi roda gigi lurus memiliki lebar muka b = 40 mm, modul normal m = 5.0 mm, dan faktor geometri AGMA J = 0.36. Jika beban tangensial efektif desain adalah Wₜ · K_total = 5400 N, hitung tegangan lentur akar gigi σ_b dalam MPa.',
        hint: 'Gunakan persamaan lentur AGMA: σ_b = (Wₜ · K_total) / (b · m · J).',
        solutionSteps: [
          'Penyebut: b · m · J = 40 mm · 5.0 mm · 0.36 = 72.0 mm².',
          'Tegangan: σ_b = 5400 N / 72.0 mm² = 75.0 MPa.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Pasangan roda gigi berbahan Baja Karburasi 8620 memiliki batas izin kontak [σ_c] = 1620 MPa. Pada beban penuh, tegangan kontak Hertzian terhitung adalah σ_c = 720 MPa. Hitung faktor keamanan permukaan S_H.',
        hint: 'Faktor keamanan kontak adalah S_H = [σ_c] / σ_c.',
        solutionSteps: [
          'Gunakan rumus: S_H = [σ_c] / σ_c.',
          'S_H = 1620 MPa / 720 MPa = 2.25.',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Penggerak roda gigi pada 15.0 kW memiliki faktor keamanan lentur S_F = 3.50 relatif terhadap target 1.40, dan faktor keamanan kontak S_H = 1.84 relatif terhadap target 1.15. Hitung daya maksimum yang dapat ditransmisikan P_max (dalam kW) yang dibatasi oleh ketahanan kontak permukaan.',
        hint: 'Ingat bahwa kapasitas daya kontak berbanding dengan kuadrat rasio keamanan kontak: P_c,max = P · (S_H / 1.15)².',
        solutionSteps: [
          'Rasio keamanan kontak: 1.84 / 1.15 = 1.60.',
          'Kuadrat rasio: 1.60² = 2.56.',
          'Batas daya kontak: P_c,max = 15.0 kW · 2.56 = 38.4 kW.',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Apakah penyederhanaan utama yang diperkenalkan oleh Wilfred Lewis dalam rumus lentur gigi klasiknya tahun 1892?',
        options: [
          'Memperlakukan gigi roda gigi sebagai balok kantilever dengan parabola terinskripsi berkekuatan lentur seragam',
          'Mengasumsikan gigi roda gigi adalah benda kaku sempurna tanpa defleksi elastis',
          'Memodelkan flank kontak sebagai ruang-setengah elastis tak terbatas',
          'Mengasumsikan gesekan antar gigi lebih besar dari gaya normal',
        ],
        explanation:
          'Lewis menginspeksikan parabola di dalam profil gigi yang menyentuh radius fillet akar gigi. Karena balok kantilever parabolik memiliki tegangan lentur serat luar yang konstan di sepanjang panjangnya, titik singgung dengan akar gigi menandai penampang kritis dengan tegangan tarik maksimum.',
      },
      {
        id: 'q2',
        question:
          'Di manakah lokasi terjadinya tegangan tarik lentur siklik maksimum selama kontak penautan roda gigi?',
        options: [
          'Pada radius fillet akar gigi pada sisi yang menerima beban tarik',
          'Tepat pada titik pitch pada flank kontak',
          'Pada ujung terluar (crest) gigi roda gigi',
          'Sepanjang poros lubang pasak roda gigi',
        ],
        explanation:
          'Saat gaya kontak menekan gigi, gigi bekerja sebagai balok kantilever. Tegangan lentur tarik maksimum terkonsentrasi pada fillet akar sisi beban. Retak lelah hampir selalu bermula pada lokasi ini.',
      },
      {
        id: 'q3',
        question:
          'Mengapa fatik pitting permukaan (spalling) biasanya bermula sedikit di bawah garis pitch pada flank gigi?',
        options: [
          'Tekanan kontak Hertzian menghasilkan tegangan geser puncak (τ_max ≈ 0.30 p₀) pada kedalaman tertentu di bawah permukaan kontak',
          'Gaya sentrifugal melempar seluruh pelumas dari wilayah khusus tersebut',
          'Gigi memiliki kekerasan nol di bawah garis pitch',
          'Tegangan lentur berada pada nilai maksimum di titik pitch',
        ],
        explanation:
          'Mekanika kontak Heinrich Hertz membuktikan bahwa ketika dua permukaan elastis melengkung berguling, tegangan geser maksimum terjadi pada kedalaman sekitar 0.78 lebar kontak di bawah permukaan. Geseran siklik menyebabkan retak mikro bawah-permukaan yang menjalar ke atas.',
      },
      {
        id: 'q4',
        question:
          'Bagaimana pengaruh peningkatan sudut tekan dari 20° ke 25° terhadap kapasitas beban roda gigi?',
        options: [
          'Mempertebal akar gigi sehingga meningkatkan kekuatan lentur dan kontak, namun memperbesar beban radial bantalan',
          'Mengurangi ketebalan akar dan membuat gigi lebih mudah patah',
          'Menghilangkan kebutuhan akan faktor dinamis Kv',
          'Mengubah roda gigi lurus secara langsung menjadi roda gigi helikal',
        ],
        explanation:
          'Sudut tekan 25° menghasilkan dasar gigi yang lebih tebal (akar lebih lebar) dan radius kelengkungan flank lebih besar, meningkatkan faktor geometri J dan I. Konsekuensinya adalah gaya dorong radial (Wr = Wt · tan α) meningkat pada bantalan.',
      },
      {
        id: 'q5',
        question:
          'Mengapa baja paduan karburasi (misalnya AISI 8620, 58–62 HRC) dianggap sebagai standar emas untuk transmisi berkinerja tinggi?',
        options: [
          'Memadukan permukaan aus yang sangat keras dengan tegangan tekan sisa serta inti ulet tahan beban impak',
          'Paling murah dan paling mudah dibubut setelah perlakuan panas akhir',
          'Memiliki modulus elastisitas tiga kali lipat dari titanium',
          'Sama sekali tidak memerlukan pelumasan selama operasi',
        ],
        explanation:
          'Karburasi mendifusikan karbon ke lapisan permukaan sehingga menghasilkan struktur martensit 58–62 HRC dengan tegangan sisa tekan yang menahan pembukaan retak. Bagian dalam berkadar karbon rendah tetap ulet dan tangguh menyerap beban kejut.',
      },
      {
        id: 'q6',
        question:
          'Apakah keunggulan kinematik utama roda gigi helikal dibandingkan roda gigi lurus (spur) berukuran sama?',
        options: [
          'Kontak gigi terjadi secara bertahap dan mulus dengan rasio kontak lebih tinggi, mereduksi getaran dan kebisingan',
          'Menghilangkan gaya dorong aksial pada bantalan secara menyeluruh',
          'Nol kerugian gesekan di antara gigi yang bertaut',
          'Dapat beroperasi tanpa toleransi jarak pusat sumbu',
        ],
        explanation:
          'Pada roda gigi helikal, kontak dimulai dari satu titik di ujung gigi dan merambat miring sepanjang lebar gigi secara berangsur. Transmisi bertahap ini meredam tumbukan kejut, meningkatkan rasio kontak, dan mengurangi kebisingan.',
      },
    ],
  },
  ja: {
    title: '歯車強度シミュレータ（AGMA・ルイス曲げ応力＋ヘルツ接触応力）',
    shortTitle: '歯車強度',
    description:
      '歯車動力伝達の包括的強度解析シミュレータ。ルイス式およびAGMA規格に基づく歯元曲げ応力、ヘルツ面圧（ピッチング限界）、動荷重係数・荷重配分係数を計算し、浸炭焼入れ鋼・高周波焼入れ鋼・調質炭素鋼・鋳鉄・リン青銅ギヤの安全率（SF, SH）を工学的に評価します。',
    explore: [
      {
        title: '歯元曲げ応力：ルイスの式とAGMA規格計算法',
        summary:
          '歯車の歯元曲げ破壊は致命的な破損形態です。繰返し受ける片持ち梁荷重により、引張側歯元フィレット部に過大な引張応力が発生し、金属疲労亀裂が伝播して歯の折損に至ります。1892年にウィルフレッド・ルイスは等曲げ強さの放物線を内接させた片持ち梁モデルを提唱しました。現代のAGMA 2001 / ISO 6336規格では、衝撃係数（Ko）、速度動荷重係数（Kv）、寸法係数（Ks）、歯面荷重配分係数（Km）、応力集中幾何係数（J）を導入し、高精度な疲労限度評価を行います。',
        equations: [
          {
            label: 'ピニオントルクと円周力（接線力）',
            formula: 'T₁ = (9549.3 · P) / n₁,   Wₜ = (2000 · T₁) / d₁',
            note: 'P: 動力(kW), n₁: ピニオン回転速度(RPM), T₁: トルク(N·m), d₁: 基準ピッチ円直径(mm), Wₜ: 接線力(N)。',
          },
          {
            label: '古典ルイス曲げ応力計算式',
            formula: 'σ_L = Wₜ / (b · m · y)',
            note: 'b: 歯幅(mm), m: モジュール(mm), y: ルイス歯形係数（無次元）。',
          },
          {
            label: 'AGMA歯元曲げ応力計算法',
            formula: 'σ_b = (Wₜ · K_o · K_v · K_s · K_m) / (b · m_n · J)',
            note: 'K_o: 使用係数, K_v: 動荷重係数, K_s: 寸法係数, K_m: 荷重配分係数, J: AGMA曲げ形状係数。',
          },
          {
            label: '歯元曲げ疲労安全率',
            formula: 'S_F = [σ_b] / σ_b',
            note: '[σ_b]: 材料の許容曲げ疲労応力(MPa)。重要設備ではS_F ≥ 1.40を推奨。',
          },
        ],
        workedExample: {
          title: '産業用減速機ピニオンの歯元曲げ応力計算',
          given: [
            '伝達動力 P = 15.0 kW, ピニオン回転数 n₁ = 1450 RPM',
            '平歯車対：法線モジュール m = 4.0 mm, ピニオン歯数 z₁ = 19, 歯幅 b = 45 mm',
            '基準圧力角 α = 20°, AGMA幾何係数 J = 0.352',
            '使用係数 K_o = 1.25, 動荷重係数 K_v = 1.22, 寸法係数 K_s = 1.0, 荷重配分 K_m = 1.25',
            '材料：SNCM420/AISI 8620浸炭合金鋼（許容曲げ応力 [σ_b] = 410 MPa）',
          ],
          steps: [
            '基準ピッチ円直径：d₁ = z₁ · m = 19 · 4.0 mm = 76.0 mm。',
            'ピニオントルク：T₁ = (9549.3 · 15.0) / 1450 = 98.79 N·m。',
            '公称接線荷重：Wₜ = (2000 · 98.79 N·m) / 76.0 mm = 2599.7 N。',
            '総合荷重修正係数：K_total = 1.25 · 1.22 · 1.0 · 1.25 = 1.906。',
            'AGMA歯元応力：σ_b = (2599.7 N · 1.906) / (45 mm · 4.0 mm · 0.352) = 78.2 MPa。',
            '曲げ安全率：S_F = [σ_b] / σ_b = 410 MPa / 78.2 MPa = 5.24（極めて安全）。',
          ],
          answer: 'σ_b = 78.2 MPa, S_F = 5.24（歯元折損に対して十分な設計裕度を確保）',
        },
      },
      {
        title: 'ヘルツ接触応力と歯面ピッチング耐久性',
        summary:
          '歯車の長寿命運転において最も頻繁に発生する損傷は、ヘルツ接触疲労に起因する歯面ピッチング（微小孔食）およびスポーリング（剥離）です。インボリュート接触線上では強力な圧縮接触圧力が発生し、表面下約0.78bの深さに最大せん断応力（τ_max ≈ 0.30 p₀）が作用します。繰返しせん断応力によって内部微小き裂が発生・進展し、歯面から金属片が剥落します。',
        equations: [
          {
            label: 'AGMA歯面接触応力式（耐ピッチング強度）',
            formula: 'σ_c = Z_E · √[ (Wₜ · K_o · K_v · K_s · K_m) / (d₁ · b · I) ]',
            note: 'Z_E: 弾性係数(√MPa), I: AGMA歯面形状係数, d₁: ピニオンピッチ円直径(mm)。',
          },
          {
            label: '材料弾性係数 (Z_E)',
            formula: 'Z_E = √{ 1 / [ π · ( (1 - ν₁²)/E₁ + (1 - ν₂²)/E₂ ) ] }',
            note: '鋼と鋼の組合せ（E = 206 GPa, ν = 0.30）の場合：Z_E ≈ 189.8 √MPa。',
          },
          {
            label: '外歯車接触形状係数 (I)',
            formula: 'I = [ (sin α_t · cos α_t) / 2 ] · [ u / (u + 1) ]',
            note: 'u: 歯数比（減速比 z₂ / z₁）, α_t: 正面圧力角。',
          },
          {
            label: '歯面疲労安全率',
            formula: 'S_H = [σ_c] / σ_c',
            note: '[σ_c]: 材料の許容面圧応力(MPa)。ピッチング防止にはS_H ≥ 1.15を推奨。',
          },
        ],
        workedExample: {
          title: '4:1減速ギヤ対のヘルツ面圧とピッチング安全率の評価',
          given: [
            'ピニオン直径 d₁ = 76.0 mm, 歯幅 b = 45 mm, 歯数比 u = 4.0 (z₁=19, z₂=76)',
            '接線力 Wₜ = 2600 N, 総合荷重係数 K_total = 1.906',
            '圧力角 α = 20° (sin 20° = 0.3420, cos 20° = 0.9397)',
            '材料：浸炭鋼 AISI 8620 (Z_E = 189.8 √MPa, [σ_c] = 1620 MPa)',
          ],
          steps: [
            '歯面形状係数 I の算出：I = [ (0.3420 · 0.9397) / 2 ] · [ 4.0 / 5.0 ] = 0.1285。',
            '根号内分母分子の計算：(Wₜ · K_total) / (d₁ · b · I) = 4955.6 / 439.47 = 11.276 MPa。',
            '接触応力 σ_c の算出：σ_c = 189.8 · √(11.276) = 637.3 MPa。',
            '接触安全率 S_H の評価：S_H = 1620 MPa / 637.3 MPa = 2.54（面圧に対して健全）。',
          ],
          answer: 'σ_c = 637.3 MPa, S_H = 2.54（歯面ピッチング疲労に対して安全）',
        },
      },
      {
        title: '歯車材料選定・熱処理と設計信頼性',
        summary:
          '適切な歯車材料と熱処理の選定は、歯面耐摩耗性、歯元靭性、製造コストの最適バランスをもたらします。浸炭焼入れ合金鋼（SCM420、AISI 8620等）は、58〜62 HRCの極めて硬い表面層と圧縮残留応力を有し、内部は強靭な低炭素マルテンサイト組織を保つため耐衝撃性に優れます。高周波焼入れ鋼（SCM440、4140鋼）は歯面のみを局所硬化できる経済的な工法です。調質炭素鋼（S45C）は一般産業機械向け、ねずみ鋳鉄（FC250）は振動減衰性と耐焼付き性に優れます。',
        equations: [
          {
            label: '許容曲げ疲労限度応力 ([σ_b])',
            formula: '[σ_b] = (S_t · Y_N) / (S_F,target · Y_θ · Y_Z)',
            note: 'S_t: 基礎曲げ疲労強度, Y_N: 繰返し数係数, Y_θ: 温度係数, Y_Z: 信頼度係数。',
          },
          {
            label: '許容接触疲労限度面圧 ([σ_c])',
            formula: '[σ_c] = (S_c · Z_N · Z_W) / (S_H,target · Z_θ · Z_R)',
            note: 'S_c: 基礎接触疲労強度, Z_N: 接触寿命係数, Z_W: 硬さ比係数。',
          },
          {
            label: '許容動力伝達限界',
            formula: 'P_max = min{ P · (S_F / 1.40),  P · (S_H / 1.15)² }',
            note: '接触応力 σ_c が √P に比例するため、歯面伝達容量は安全率比の2乗に比例します。',
          },
        ],
        workedExample: {
          title: '重衝撃コンベヤ駆動減速機の材料選定比較',
          given: [
            '設計条件：動力 P = 30 kW, 回転数 980 RPM, 重衝撃係数 K_o = 1.60',
            '計算応力：曲げ応力 σ_b = 185 MPa, 接触応力 σ_c = 890 MPa',
            '材料候補A：S45C 調質鋼 ([σ_b] = 210 MPa, [σ_c] = 620 MPa)',
            '材料候補B：SCM440 高周波焼入れ鋼 ([σ_b] = 330 MPa, [σ_c] = 1250 MPa)',
          ],
          steps: [
            '候補A（S45C）の評価：',
            '  曲げ：S_F = 210 / 185 = 1.135 (< 目標1.40、危険域)',
            '  接触：S_H = 620 / 890 = 0.697 (< 1.0、著しい早期ピッチング破壊)',
            '候補B（SCM440高周波）の評価：',
            '  曲げ：S_F = 330 / 185 = 1.784 (≥ 1.40、安全)',
            '  接触：S_H = 1250 / 890 = 1.404 (≥ 1.15、面圧健全)',
            '結論：S45Cは歯面剥離を起こすため採用不可。候補B（高周波焼入れ鋼）が必須。',
          ],
          answer: '候補B（SCM440 高周波焼入れ鋼）を選定（S_F = 1.78, S_H = 1.40）',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'モジュール m = 4.0 mm、歯数 z₁ = 20 の平歯車ピニオンが、回転速度 n₁ = 1450 RPM で 22.0 kW の機械動力を伝達しています。ピッチ円上の公称接線力 Wₜ（N）を計算してください。',
        hint: '基準円直径 d₁ = z₁ · m を求め、トルク T₁ = (9549.3 · P) / n₁ を計算し、Wₜ = (2000 · T₁) / d₁ を求めます。',
        solutionSteps: [
          'ピッチ円直径：d₁ = 20 · 4.0 mm = 80.0 mm。',
          'ピニオントルク：T₁ = (9549.3 · 22.0) / 1450 = 144.89 N·m。',
          '接線力：Wₜ = (2000 · 144.89) / 80.0 = 3622.3 N（許容値 ~3620 N）。',
        ],
      },
      {
        id: 'p2',
        prompt:
          'ピッチ円直径 d₁ = 76.0 mm、回転速度 n₁ = 1450 RPM の平歯車について、ピッチ円周線速度 v（m/s）を計算してください。',
        hint: '周速の計算式は v = (π · d₁ · n₁) / 60,000 です。',
        solutionSteps: [
          '計算式適用：v = (π · 76.0 · 1450) / 60,000。',
          'v = 346,203 / 60,000 = 5.77 m/s。',
        ],
      },
      {
        id: 'p3',
        prompt:
          '歯幅 b = 40 mm、法線モジュール m = 5.0 mm、AGMA形状係数 J = 0.36 の歯車があります。設計有効接線荷重が Wₜ · K_total = 5400 N のとき、歯元曲げ応力 σ_b（MPa）を求めてください。',
        hint: 'AGMA曲げ計算式 σ_b = (Wₜ · K_total) / (b · m · J) を使用します。',
        solutionSteps: [
          '分母：b · m · J = 40 · 5.0 · 0.36 = 72.0 mm²。',
          '曲げ応力：σ_b = 5400 N / 72.0 mm² = 75.0 MPa。',
        ],
      },
      {
        id: 'p4',
        prompt:
          '浸炭合金鋼製歯車の許容接触面圧が [σ_c] = 1620 MPa であり、実働時のヘルツ接触応力が σ_c = 720 MPa と計算されました。歯面疲労安全率 S_H を計算してください。',
        hint: '面圧安全率は S_H = [σ_c] / σ_c です。',
        solutionSteps: [
          '安全率計算：S_H = [σ_c] / σ_c。',
          'S_H = 1620 MPa / 720 MPa = 2.25。',
        ],
      },
      {
        id: 'p5',
        prompt:
          '現在 15.0 kW で運転している歯車減速機の面圧安全率が S_H = 1.84（設計目標裕度 1.15 に対する比率）です。歯面耐久性によって制限される最大伝達動力 P_max（kW）を算出してください。',
        hint: '面圧容量は安全率比の2乗に比例します：P_c,max = P · (S_H / 1.15)²。',
        solutionSteps: [
          '安全率比率：1.84 / 1.15 = 1.60。',
          '比率の2乗：1.60² = 2.56。',
          '最大伝達容量：P_c,max = 15.0 kW · 2.56 = 38.4 kW。',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          '1892年にウィルフレッド・ルイスが提唱した歯元曲げ応力古典計算式の最も特徴的な仮定は何ですか？',
        options: [
          '歯車の歯を、等曲げ応力となる放物線を内接させた片持ち梁としてモデル化したこと',
          '歯車を完全剛体と仮定し弾性変形をゼロとしたこと',
          '歯面接触部を無限弾性半空間として近似したこと',
          '歯面間の摩擦力が法線荷重よりも大きいと仮定したこと',
        ],
        explanation:
          'ルイスは歯元フィレット接点を基点として歯形内部に放物線を内接させました。放物線形状の片持ち梁は全長にわたって外表面の曲げ応力が均一となるため、歯元との接点位置が最大引張曲げ応力が発生する危険断面となります。',
      },
      {
        id: 'q2',
        question:
          '歯車の噛み合い時において、最大繰返し引張曲げ応力はどの部位に発生しますか？',
        options: [
          '荷重を受ける側の歯元フィレット（すみ肉アール部）',
          '噛み合いピッチ点上の歯面中央',
          '歯先（トップランド）の先端エッジ',
          'シャフトキー溝の内周軸心部',
        ],
        explanation:
          '噛み合い荷重によって歯が片持ち梁のように曲げられるとき、最大引張曲げ応力は荷重作用側の凹型歯元フィレット部に集中します。疲労亀裂はほぼ必ずこの歯元フィレットから発生します。',
      },
      {
        id: 'q3',
        question:
          '歯面ピッチング疲労（微小剥離孔食）が、ピッチ線よりやや歯元寄りの表面下から発生しやすい理由は何ですか？',
        options: [
          'ヘルツ弾性接触理論に基づき、接触面直下（約0.78bの深さ）で最大せん断応力（τ_max ≈ 0.30 p₀）が作用するため',
          '遠心力によってその領域だけ潤滑油が完全に吹き飛ばされるため',
          'ピッチ線より下側だけ材料硬度がゼロになるため',
          'ピッチ点において曲げ応力が最大値に達するため',
        ],
        explanation:
          'ヘルツの接触力学では、2つの曲面が転がり接触するとき、最大せん断応力は最表面ではなく表面下の一定深さで生じます。この繰返しせん断応力により内部亀裂が発生し、表面へ進展して微小金属片が剥落します。',
      },
      {
        id: 'q4',
        question:
          '歯車の基準圧力角を20°から25°に大きくした場合、歯車強度にどのような影響が生じますか？',
        options: [
          '歯元が太くなり曲げ強度および接触強度が高まるが、軸受に作用する半径方向荷重（スラスト反力）が増加する',
          '歯元が細くなり歯の折損リスクが急増する',
          '速度動荷重係数 Kv を考慮する必要がなくなる',
          '平歯車が自動的にはすば歯車に変換される',
        ],
        explanation:
          '圧力角を25°にすると歯元幅が増大し、歯面曲率半径も大きくなるため、AGMA形状係数JおよびIが向上し許容荷重が上がります。反面、ラジアル荷重成分（Wr = Wt · tan α）が増えるため軸受負荷が増大します。',
      },
      {
        id: 'q5',
        question:
          '高性能トランスミッション歯車において、浸炭焼入れ合金鋼（SCM420、AISI 8620等、58〜62 HRC）が最も広く採用される理由は何ですか？',
        options: [
          '極めて硬い耐摩耗性硬化層と圧縮残留応力を表面に持ち、かつ心部は強靭で衝撃破壊に強いため',
          '最終熱処理後の旋削加工が最も容易かつ安価であるため',
          'チタン合金の3倍以上のヤング率を有するため',
          '稼働中に潤滑油を一切必要としないため',
        ],
        explanation:
          '浸炭処理により表面層に炭素を拡散させ、58〜62 HRCの高硬度マルテンサイトと疲労亀裂の開口を抑える圧縮残留応力を付与します。一方、低炭素の心部は高い靭性を保ち、激しい衝撃荷重を受け止めることができます。',
      },
      {
        id: 'q6',
        question:
          'はすば歯車（ヘリカルギヤ）が同一諸元の平歯車に対して有する最大の運動学的利点は何ですか？',
        options: [
          '歯のかみ合いが点から斜め線へと徐々に進行し、噛み合い率が高いため低騒音・低振動である',
          '軸受に作用する軸方向（スラスト）荷重を完全にゼロにできる',
          '噛み合う歯面間の摩擦損失が完全にゼロになる',
          '中心距離の加工公差を無視して運転できる',
        ],
        explanation:
          'はすば歯車では、歯の一端から接触が始まり、歯幅方向に沿って斜めに滑らかに荷重が移行します。この連続的な噛み合いにより衝撃が緩和され、全噛み合い率が増大して高回転時でも静粛な動力伝達が可能になります。',
      },
    ],
  },
});
