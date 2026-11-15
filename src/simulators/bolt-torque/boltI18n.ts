import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('bolt-torque', {
  id: {
    title: 'Simulator Torsi Baut & Kunci Momen',
    shortTitle: 'Torsi Baut',
    description:
      'Pelajari mekanika torsi-preload (T = K·d·Fi), pengaruh faktor mur (K) pelumasan, batas proof load, dan urutan pengencangan flens pola bintang multi-pass.',
    explore: [
      {
        title: 'Hubungan Torsi–Preload (T = K · d · Fi)',
        summary:
          'Kunci momen mengukur usaha putar, bukan tegangan tarik baut secara langsung. Sekitar 90% torsi digunakan untuk mengatasi gesekan ulir dan permukaan bawah kepala baut, sehingga hanya ~10% yang meregangkan baut dan menghasilkan gaya jepit (Fi). Faktor mur K merepresentasikan gesekan tersebut.',
        equations: [
          {
            label: 'Persamaan Torsi–Preload',
            formula: 'T = K · d · Fi',
            note: 'Dengan T dalam N·m, d dalam mm, dan Fi dalam kN (karena 1 N·m / 1 mm = 1 kN)',
          },
          {
            label: 'Gaya Jepit dari Torsi',
            formula: 'Fi = T / (K · d)',
            note: 'Menurunkan K (pelumasan) meningkatkan Fi pada torsi T yang sama',
          },
          {
            label: 'Nilai Umum Faktor Mur (K)',
            formula: 'Moly: 0.12  |  Oli Ringan: 0.15  |  Kering: 0.20  |  Seng: 0.22',
            note: 'Menerapkan torsi kering pada ulir berpelumas dapat membebani baut berlebih 40–67%',
          },
        ],
        workedExample: {
          title: 'Menghitung Torsi Target untuk Baut M12 Kelas 8.8',
          given: [
            'Ukuran baut: M12 (d = 12 mm, At = 84.3 mm²)',
            'Kelas Properti 8.8 (Proof strength Sp = 600 MPa)',
            'Kondisi: Baja kering (K = 0.20), target preload = 75% dari proof load',
          ],
          steps: [
            'Hitung Proof Load: Fp = (Sp · At) / 1000 = (600 × 84.3) / 1000 = 50.58 kN',
            'Hitung Preload Target (75%): Fi = 0.75 × 50.58 = 37.94 kN',
            'Hitung Torsi Pengencangan: T = K · d · Fi = 0.20 × 12 × 37.94 = 91.0 N·m',
          ],
          answer: 'T = 91.0 N·m (menghasilkan gaya jepit 37.9 kN)',
        },
      },
      {
        title: 'Proof Load, Tegangan Tarik & Keamanan Luluh',
        summary:
          'Baut bekerja seperti pegas kaku. Pengencangan meregangkannya dalam daerah elastis agar sambungan terjepit kuat. Melewati Proof Strength (Sp) ISO 898-1 menyebabkan deformasi plastis permanen, hilangnya preload akibat getaran, atau ulir slek/dol.',
        equations: [
          {
            label: 'Tegangan Tarik Baut',
            formula: 'σt = (Fi · 1000) / At',
            note: 'σt dalam MPa, Fi dalam kN, At = luas tegangan tarik ulir dalam mm²',
          },
          {
            label: 'Kapasitas Proof Load',
            formula: 'Fp = (Sp · At) / 1000',
            note: 'Beban maksimum yang dapat ditahan baut tanpa regangan permanen',
          },
          {
            label: 'Preload Sambungan Pakai Ulang',
            formula: 'Fi,target = 0.75 · Fp',
            note: 'Memberikan margin aman 25% untuk toleransi kunci momen dan beban kerja',
          },
        ],
        workedExample: {
          title: 'Memeriksa Over-Torque Saat Pelumasan Berubah',
          given: [
            'Baut M12 Kelas 8.8 (Fp = 50.58 kN, Sp = 600 MPa, At = 84.3 mm²)',
            'Torsi kering T = 91.0 N·m keliru diterapkan pada ulir berpelumas Moly Paste (K = 0.12)',
          ],
          steps: [
            'Hitung preload aktual: Fi = T / (K · d) = 91.0 / (0.12 × 12) = 63.19 kN',
            'Hitung tegangan tarik: σt = (63.19 × 1000) / 84.3 = 749.6 MPa',
            'Bandingkan dengan Proof Strength: (749.6 / 600) × 100 = 124.9% Proof (melewati Luluh Sy = 640 MPa!)',
          ],
          answer: 'Baut mengalami luluh permanen pada 125% Proof Load — ganti baut dan turunkan torsi.',
        },
      },
      {
        title: 'Pengencangan Flens Pola Bintang & Kompresi Gasket',
        summary:
          'Mengencangkan baut flens berurutan melingkar akan memiringkan flens, menghancurkan satu sisi gasket sementara sisi lain longgar. Pengencangan silang/pola bintang bertahap (30% → 70% → 100%) meratakan interaksi elastis dan mendudukkan gasket secara seragam.',
        equations: [
          {
            label: 'Urutan Pola Bintang 6-Baut',
            formula: '1 → 4 → 2 → 5 → 3 → 6',
            note: 'Selalu lompat 180° menyeberangi pusat flens antar baut berturut-turut',
          },
          {
            label: 'Urutan Pola Bintang 8-Baut',
            formula: '1 → 5 → 3 → 7 → 2 → 6 → 4 → 8',
            note: 'Kuadran silang pertama (1-5-3-7), lalu kuadran silang selang-seling (2-6-4-8)',
          },
          {
            label: 'Tahapan Torsi Tiga Pass (ASME PCC-1)',
            formula: 'Pass 1: 30% T  →  Pass 2: 70% T  →  Pass 3: 100% T',
            note: 'Lanjutkan dengan satu putaran cek searah jarum jam pada 100% T',
          },
        ],
        workedExample: {
          title: 'Tahapan Pengencangan Flens Pipa 8-Baut ke 400 N·m',
          given: [
            'Flens 8-baut dengan torsi akhir target T_final = 400 N·m',
            'Gasket memerlukan kompresi merata di ketiga pass',
          ],
          steps: [
            'Pass 1 (30%): Setel kunci momen ke 0.30 × 400 = 120 N·m; kencangkan 1 → 5 → 3 → 7 → 2 → 6 → 4 → 8.',
            'Pass 2 (70%): Setel kunci momen ke 0.70 × 400 = 280 N·m; ulangi pola bintang.',
            'Pass 3 (100%): Setel kunci momen ke 400 N·m; ulangi pola bintang, lalu verifikasi searah jarum jam.',
          ],
          answer: 'Kompresi gasket merata tercapai dengan interaksi elastis minimal.',
        },
      },
      {
        title: 'Penjelasan Kelas Properti ISO 898-1',
        summary:
          'Tanda angka pada kepala baut metrik (8.8, 10.9, 12.9) langsung menunjukkan kekuatan tarik dan luluh. Angka pertama × 100 adalah kekuatan tarik nominal (MPa); perkalian kedua angka × 10 adalah kekuatan luluh nominal (MPa).',
        equations: [
          {
            label: 'Kelas 8.8',
            formula: 'Sut = 800 MPa  |  Sy = 640 MPa  |  Sp = 600 MPa',
            note: 'Baut mesin baja karbon sedang quenched & tempered standar',
          },
          {
            label: 'Kelas 10.9',
            formula: 'Sut = 1040 MPa  |  Sy = 940 MPa  |  Sp = 830 MPa',
            note: 'Baja paduan kekuatan tinggi untuk sambungan struktural dan otomotif',
          },
          {
            label: 'Kelas 12.9',
            formula: 'Sut = 1220 MPa  |  Sy = 1100 MPa  |  Sp = 970 MPa',
            note: 'Baut soket kekuatan ultra-tinggi; sensitif terhadap penggetasan hidrogen',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          'Hitung torsi pengencangan yang disarankan (pada 75% proof load) untuk baut M12 Kelas 8.8 (At = 84.3 mm², Sp = 600 MPa) pada kondisi Kering (K = 0.20).',
        hint: 'Cari Proof Load Fp = Sp × At / 1000, ambil 75% untuk Fi, lalu gunakan T = K × d × Fi.',
        solutionSteps: [
          'Proof load Fp = (600 MPa × 84.3 mm²) / 1000 = 50.58 kN',
          'Target preload Fi = 0.75 × 50.58 kN = 37.935 kN',
          'Torsi T = K × d × Fi = 0.20 × 12 mm × 37.935 kN = 91.04 N·m',
        ],
      },
      {
        prompt:
          'Baut M16 yang dilumasi Moly Paste (K = 0.12) dikencangkan hingga 180 N·m. Berapa gaya jepit Fi (dalam kN) yang dihasilkan?',
        hint: 'Ubah T = K · d · Fi menjadi Fi = T / (K · d), dengan d dalam mm dan Fi dalam kN.',
        solutionSteps: [
          'Gunakan Fi = T / (K × d)',
          'Fi = 180 N·m / (0.12 × 16 mm) = 180 / 1.92 = 93.75 kN',
        ],
      },
      {
        prompt:
          'Sebuah baut M10 (At = 58.0 mm²) menahan gaya jepit 34.8 kN. Berapa tegangan tarik σt yang terjadi dalam MPa?',
        hint: 'Konversi Fi dari kN ke N (× 1000) lalu bagi dengan luas tegangan tarik At dalam mm².',
        solutionSteps: [
          'σt = (Fi × 1000) / At',
          'σt = (34.8 × 1000) / 58.0 = 34,800 / 58.0 = 600 MPa',
        ],
      },
      {
        prompt:
          'Seorang teknisi menerapkan 91.0 N·m (spesifikasi kering) ke baut M12 yang dilapisi Moly Paste (K = 0.12). Berapa gaya jepit Fi (dalam kN) yang dihasilkan?',
        hint: 'Bagi T = 91.0 N·m dengan (0.12 × 12 mm). Perhatikan nilainya jauh melebihi proof load 50.58 kN!',
        solutionSteps: [
          'Fi = T / (K × d) = 91.0 / (0.12 × 12) = 91.0 / 1.44 = 63.19 kN',
          'Karena proof load M12 Kelas 8.8 adalah 50.58 kN, baut terbebani ~125% proof.',
        ],
      },
      {
        prompt:
          'Flens pipa 8-baut memiliki torsi target akhir 420 N·m. Berapa torsi yang harus disetel pada kunci momen untuk Pass 1 (30% snug pass)?',
        hint: 'Kalikan torsi target akhir dengan 0.30.',
        solutionSteps: [
          'Pass 1 (30%): T1 = 0.30 × 420 N·m = 126 N·m',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Sekitar berapa persen dari torsi pengencangan yang benar-benar meregangkan baut baja kering (menghasilkan preload)?',
        options: ['~10%', '~50%', '~75%', '~90%'],
        explanation:
          'Sekitar 50% torsi mengatasi gesekan bawah kepala baut dan ~40% mengatasi gesekan ulir, menyisakan hanya ~10% untuk menciptakan gaya jepit (preload).',
      },
      {
        question:
          'Jika Anda beralih dari Kering (K = 0.20) ke Moly Paste (K = 0.12) tanpa menurunkan setelan torsi kunci momen, apa yang terjadi pada preload baut?',
        options: [
          'Preload naik 67% (risiko baut luluh/putus)',
          'Preload turun 40% (risiko sambungan kendur)',
          'Preload tetap sama karena torsi tidak berubah',
          'Hanya faktor mur yang berubah, bukan tegangan tarik',
        ],
        explanation:
          'Karena Fi = T / (K·d), menurunkan K dari 0.20 ke 0.12 mengalikan preload sebesar 0.20 / 0.12 = 1.67 (+67%).',
      },
      {
        question:
          'Manakah urutan pola bintang standar ASME PCC-1 untuk flens 8-baut?',
        options: [
          '1 → 5 → 3 → 7 → 2 → 6 → 4 → 8',
          '1 → 2 → 3 → 4 → 5 → 6 → 7 → 8',
          '1 → 3 → 5 → 7 → 2 → 4 → 6 → 8',
          '1 → 4 → 7 → 2 → 5 → 8 → 3 → 6',
        ],
        explanation:
          'Mengencangkan sisi berlawanan 180° per kuadran (1-5, 3-7, lalu 2-6, 4-8) mencegah flens miring dan menekan gasket secara merata.',
      },
      {
        question:
          'Apa arti tanda "10.9" pada kepala baut metrik?',
        options: [
          'Kekuatan tarik nominal 1000 MPa dan kekuatan luluh 900 MPa (90% dari tarik)',
          'Diameter 10 mm dan pitch ulir 0.9 mm',
          'Proof load minimum sebesar 10.9 kN',
          'Faktor mur yang disarankan K = 0.109',
        ],
        explanation:
          'Pada ISO 898-1, angka pertama × 100 adalah kuat tarik nominal (1000 MPa; min aktual 1040 MPa) dan digit kedua adalah rasio luluh-terhadap-tarik (0.9 → ~900–940 MPa).',
      },
      {
        question:
          'Mengapa sambungan baut pakai ulang biasanya dikencangkan hingga ~75% Proof Load, bukan 100%?',
        options: [
          'Untuk memberi margin atas variasi kunci momen dan beban kerja eksternal tanpa luluh permanen',
          'Karena baut tidak dapat menahan beban geser di atas 75% proof',
          'Agar gasket tidak pernah terkompresi',
          'Karena faktor mur K turun menjadi nol di atas 75% proof',
        ],
        explanation:
          'Pengencangan berbasis torsi memiliki sebaran preload ±20–25%; menargetkan 75% proof load menjaga baut tetap aman di bawah batas deformasi plastis.',
      },
      {
        question:
          'Mengapa flens harus dikencangkan dalam tiga pass bertahap (30% → 70% → 100%) alih-alih langsung 100%?',
        options: [
          'Untuk mendudukkan gasket secara merata dan mengkompensasi interaksi elastis antar baut saat gasket tertekan',
          'Agar baja baut mengalami work-hardening di antara pass',
          'Karena kunci momen tipe klik tidak dapat mengukur torsi 100% dalam satu tarikan',
          'Untuk menaikkan faktor mur K pada setiap pass',
        ],
        explanation:
          'Mengencangkan satu baut menekan gasket secara lokal dan menurunkan preload pada baut sebelumnya (interaksi elastis). Pass bertahap menjaga flens tetap sejajar.',
      },
    ],
  },
  ja: {
    title: 'ボルト締結・トルクレンチシミュレータ',
    shortTitle: 'ボルトトルク',
    description:
      '締付トルクと軸力 (T = K·d·Fi)、潤滑によるトルク係数 (K) の変化、保証荷重安全率、多パス星型フランジ締付手順を学習します。',
    explore: [
      {
        title: 'トルク・軸力関係式 (T = K · d · Fi)',
        summary:
          'トルクレンチはボルトの伸び（軸力）ではなく回転トルクを測定します。印加トルクの約90%はねじ面と座面の摩擦で消費され、実際にボルトを伸ばして締付軸力 (Fi) を生み出すのは約10%のみです。無次元数のトルク係数 K がこの摩擦を表します。',
        equations: [
          {
            label: 'トルク・軸力基本式',
            formula: 'T = K · d · Fi',
            note: 'T [N·m], d [mm], Fi [kN]（1 N·m / 1 mm = 1 kN のため）',
          },
          {
            label: 'トルクからの軸力算出',
            formula: 'Fi = T / (K · d)',
            note: '潤滑で K が下がると同じトルク T でも軸力 Fi が急増します',
          },
          {
            label: '代表的なトルク係数 (K)',
            formula: 'モリブデン: 0.12  |  マシン油: 0.15  |  無潤滑: 0.20  |  亜鉛めっき: 0.22',
            note: '無潤滑用トルクを潤滑ボルトに適用すると 40–67% の過大軸力となります',
          },
        ],
        workedExample: {
          title: 'M12 強度区分 8.8 ボルトの目標締付トルク計算',
          given: [
            'ボルトサイズ: M12 (d = 12 mm, At = 84.3 mm²)',
            '強度区分 8.8 (保証荷重応力 Sp = 600 MPa)',
            '条件: 無潤滑鋼 (K = 0.20)、目標軸力 = 保証荷重の 75%',
          ],
          steps: [
            '保証荷重の計算: Fp = (Sp · At) / 1000 = (600 × 84.3) / 1000 = 50.58 kN',
            '目標軸力 (75%): Fi = 0.75 × 50.58 = 37.94 kN',
            '締付トルクの計算: T = K · d · Fi = 0.20 × 12 × 37.94 = 91.0 N·m',
          ],
          answer: 'T = 91.0 N·m（締付軸力 37.9 kN を発生）',
        },
      },
      {
        title: '保証荷重・引張応力・降伏安全率',
        summary:
          'ボルトは硬いばねとして機能し、弾性域内で伸ばすことで締結力を維持します。ISO 898-1 の保証荷重応力 (Sp) を超えると永久塑性伸びが生じ、振動緩みやねじ山破損の原因となります。',
        equations: [
          {
            label: 'ボルト引張応力',
            formula: 'σt = (Fi · 1000) / At',
            note: 'σt [MPa], Fi [kN], At = ねじ有効断面積 [mm²]',
          },
          {
            label: '保証荷重容量',
            formula: 'Fp = (Sp · At) / 1000',
            note: '永久変形せずにボルトが耐えられる最大荷重',
          },
          {
            label: '再使用可能継手の推奨軸力',
            formula: 'Fi,target = 0.75 · Fp',
            note: 'レンチ誤差と運転外力に対する 25% の安全余裕を確保',
          },
        ],
        workedExample: {
          title: '潤滑変更時のオーバートルク検証',
          given: [
            'M12 強度区分 8.8 ボルト (Fp = 50.58 kN, Sp = 600 MPa, At = 84.3 mm²)',
            '無潤滑仕様 T = 91.0 N·m を誤ってモリブデンペースト塗布ねじ (K = 0.12) に適用',
          ],
          steps: [
            '実軸力の計算: Fi = T / (K · d) = 91.0 / (0.12 × 12) = 63.19 kN',
            '引張応力の計算: σt = (63.19 × 1000) / 84.3 = 749.6 MPa',
            '保証荷重との比較: (749.6 / 600) × 100 = 124.9%（降伏応力 Sy = 640 MPa 超過！）',
          ],
          answer: '保証荷重の 125% で永久降伏 — ボルトを交換しトルクを低減してください。',
        },
      },
      {
        title: 'フランジ星型締付手順とガスケット圧縮',
        summary:
          'フランジボルトを円周順に連続締付すると片締め（フランジ傾き）を起こし、片側のガスケットが過圧縮され反対側が漏洩します。3パス（30% → 70% → 100%）の対角星型締付により弾性相互作用を分散し均一にシールできます。',
        equations: [
          {
            label: '6本ボルト星型順序',
            formula: '1 → 4 → 2 → 5 → 3 → 6',
            note: '常にフランジ中心を挟んだ 180° 対角へ移動します',
          },
          {
            label: '8本ボルト星型順序',
            formula: '1 → 5 → 3 → 7 → 2 → 6 → 4 → 8',
            note: '十字対角 (1-5-3-7) の後、45° ずらした対角 (2-6-4-8) を締付',
          },
          {
            label: '3段階トルク昇圧 (ASME PCC-1)',
            formula: 'Pass 1: 30% T  →  Pass 2: 70% T  →  Pass 3: 100% T',
            note: '最後に 100% T で時計回りの最終確認パスを実施',
          },
        ],
        workedExample: {
          title: '8本ボルト管フランジの 400 N·m 段階締付',
          given: [
            '8本ボルトフランジ、最終目標トルク T_final = 400 N·m',
            '3パスで均一なガスケット圧縮が必要',
          ],
          steps: [
            'Pass 1 (30%): レンチを 0.30 × 400 = 120 N·m に設定し 1 → 5 → 3 → 7 → 2 → 6 → 4 → 8 の順に締付。',
            'Pass 2 (70%): レンチを 0.70 × 400 = 280 N·m に設定し星型順序を反復。',
            'Pass 3 (100%): 400 N·m で星型順序を反復後、時計回りに確認パスを実施。',
          ],
          answer: '弾性追従による軸力低下を抑え、均一なガスケット面圧を達成。',
        },
      },
      {
        title: 'ISO 898-1 強度区分の読み方',
        summary:
          'メートルボルト頭部の刻印（8.8, 10.9, 12.9）は引張強さと降伏点比を表します。最初の数字 × 100 が公称引張強さ (MPa)、2つの数字の積 × 10 が公称降伏応力 (MPa) です。',
        equations: [
          {
            label: '強度区分 8.8',
            formula: 'Sut = 800 MPa  |  Sy = 640 MPa  |  Sp = 600 MPa',
            note: '標準的な調質中炭素鋼（一般機械用）',
          },
          {
            label: '強度区分 10.9',
            formula: 'Sut = 1040 MPa  |  Sy = 940 MPa  |  Sp = 830 MPa',
            note: '高強度合金鋼（構造用・自動車・高圧配管用）',
          },
          {
            label: '強度区分 12.9',
            formula: 'Sut = 1220 MPa  |  Sy = 1100 MPa  |  Sp = 970 MPa',
            note: '超高強度六角穴付ボルト（遅れ破壊・水素脆化に注意）',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          '無潤滑条件 (K = 0.20) における M12 強度区分 8.8 ボルト (At = 84.3 mm², Sp = 600 MPa) の推奨締付トルク（保証荷重の 75%）を求めてください。',
        hint: 'まず保証荷重 Fp = Sp × At / 1000 を求め、75% を Fi として T = K × d × Fi を計算します。',
        solutionSteps: [
          '保証荷重 Fp = (600 MPa × 84.3 mm²) / 1000 = 50.58 kN',
          '目標軸力 Fi = 0.75 × 50.58 kN = 37.935 kN',
          '締付トルク T = K × d × Fi = 0.20 × 12 mm × 37.935 kN = 91.04 N·m',
        ],
      },
      {
        prompt:
          'モリブデンペースト (K = 0.12) を塗布した M16 ボルトを 180 N·m で締め付けました。発生する締付軸力 Fi (kN) はいくつですか？',
        hint: 'T = K · d · Fi を Fi = T / (K · d) に変形し、d を mm、Fi を kN で計算します。',
        solutionSteps: [
          'Fi = T / (K × d) を使用',
          'Fi = 180 N·m / (0.12 × 16 mm) = 180 / 1.92 = 93.75 kN',
        ],
      },
      {
        prompt:
          'M10 ボルト (At = 58.0 mm²) に 34.8 kN の軸力が作用しています。ボルトの引張応力 σt (MPa) を求めてください。',
        hint: 'Fi を kN から N (× 1000) に変換し、有効断面積 At [mm²] で割ります。',
        solutionSteps: [
          'σt = (Fi × 1000) / At',
          'σt = (34.8 × 1000) / 58.0 = 34,800 / 58.0 = 600 MPa',
        ],
      },
      {
        prompt:
          '作業者がモリブデンペースト塗布済みの M12 ボルト (K = 0.12) に対し、無潤滑仕様の 91.0 N·m で締め付けました。発生する軸力 Fi (kN) はいくつですか？',
        hint: 'T = 91.0 N·m を (0.12 × 12 mm) で割ります。保証荷重 50.58 kN を大きく上回る点に注目してください。',
        solutionSteps: [
          'Fi = T / (K × d) = 91.0 / (0.12 × 12) = 91.0 / 1.44 = 63.19 kN',
          'M12 8.8 の保証荷重は 50.58 kN のため、約 125% の過負荷となります。',
        ],
      },
      {
        prompt:
          '8本ボルト管フランジの最終目標トルクが 420 N·m です。Pass 1（30% スナッグ締付）でレンチに設定すべきトルクはいくつですか？',
        hint: '最終目標トルクに 0.30 を掛けます。',
        solutionSteps: [
          'Pass 1 (30%): T1 = 0.30 × 420 N·m = 126 N·m',
        ],
      },
    ],
    quiz: [
      {
        question:
          '無潤滑の鋼製ボルトを締め付ける際、印加トルクのうち実際にボルトを伸ばす（軸力を生む）割合はおおよそ何%ですか？',
        options: ['約 10%', '約 50%', '約 75%', '約 90%'],
        explanation:
          'トルクの約50%は座面摩擦、約40%はねじ面摩擦で消費され、締付軸力に寄与するのは約10%のみです。',
      },
      {
        question:
          'トルクレンチの設定値を下げずに無潤滑 (K = 0.20) からモリブデンペースト (K = 0.12) に変更すると、ボルト軸力はどうなりますか？',
        options: [
          '軸力が 67% 増加する（降伏・破断のリスク）',
          '軸力が 40% 低下する（緩みのリスク）',
          'トルクが同じなので軸力も変わらない',
          'トルク係数 K だけが変わり引張応力は変わらない',
        ],
        explanation:
          'Fi = T / (K·d) より、K が 0.20 から 0.12 に下がると軸力は 0.20 / 0.12 = 1.67倍（+67%）になります。',
      },
      {
        question:
          '8本ボルトフランジにおける ASME PCC-1 標準の星型締付順序はどれですか？',
        options: [
          '1 → 5 → 3 → 7 → 2 → 6 → 4 → 8',
          '1 → 2 → 3 → 4 → 5 → 6 → 7 → 8',
          '1 → 3 → 5 → 7 → 2 → 4 → 6 → 8',
          '1 → 4 → 7 → 2 → 5 → 8 → 3 → 6',
        ],
        explanation:
          '180° 対角を象限ごとに締める (1-5, 3-7, 次に 2-6, 4-8) ことで片締めを防ぎ、ガスケットを均一に圧縮します。',
      },
      {
        question:
          'メートルボルト頭部の刻印「10.9」は何を意味しますか？',
        options: [
          '公称引張強さ 1000 MPa、降伏点 900 MPa（引張の 90%）',
          '呼び径 10 mm、ねじピッチ 0.9 mm',
          '最小保証荷重 10.9 kN',
          '推奨トルク係数 K = 0.109',
        ],
        explanation:
          'ISO 898-1 では最初の数字 × 100 が公称引張強さ (1000 MPa; 実際最小 1040 MPa)、2番目の数字が耐力比 (0.9 → 約 900–940 MPa) を示します。',
      },
      {
        question:
          '再使用可能なボルト継手で 100% ではなく保証荷重の約 75% を目標に締め付ける理由は何ですか？',
        options: [
          'トルクレンチのばらつきや運転外力による永久降伏を防ぐ安全余裕を確保するため',
          '75% を超えるとせん断荷重を受けられなくなるため',
          'ガスケットが全く圧縮されないようにするため',
          '75% を超えるとトルク係数 K がゼロになるため',
        ],
        explanation:
          'トルク法による軸力ばらつきは ±20–25% あるため、75% 目標とすることで弾性域内に安全に収まります。',
      },
      {
        question:
          'フランジを一発で 100% 締め付けず、3パス（30% → 70% → 100%）に分ける理由は何ですか？',
        options: [
          'ガスケットを均一に着座させ、隣接ボルトの締付による弾性追従（軸力低下）を補正するため',
          'パス間でボルト鋼材を加工硬化させるため',
          'クリック式トルクレンチは1回で 100% を測定できないため',
          '各パスでトルク係数 K を増加させるため',
        ],
        explanation:
          '1本のボルトを締めると周囲のガスケットが沈み、既締ボルトの軸力が低下します。段階締付によりフランジの平行度を保てます。',
      },
    ],
  },
});
