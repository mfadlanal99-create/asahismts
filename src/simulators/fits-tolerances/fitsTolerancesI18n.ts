import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('fits-tolerances', {
  id: {
    title: 'Suaian Poros/Lubang ISO 286 & Shrink-Fit Termal',
    shortTitle: 'Suaian ISO 286 & Shrink',
    description:
      'Analisis zona toleransi basis lubang ISO 286 (H6/H7/H8) dan poros (f7–s6), batas kaliber Go/No-Go plug & snap gauge, tekanan kontak Lamé, gaya pres hidrolik, serta kelonggaran rakit shrink-fit pemanas induksi.',
    explore: [
      {
        title: 'Sistem Basis Lubang ISO 286 (H7) & Penyimpangan Fundamental',
        summary:
          'Dalam ISO 286-1/2, notasi suaian seperti Ø50 H7/g6 memadukan huruf kapital untuk fitur dalam (Lubang/Hole) dan huruf kecil untuk fitur luar (Poros/Shaft). Lebih dari 90% mesin industri menggunakan Sistem Basis Lubang ("H"), di mana penyimpangan bawah EI tepat berada pada garis nol 0 µm (D_min = diameter nominal d), karena pemesinan lubang presisi dengan reamer standar jauh lebih ekonomis dibandingkan menyediakan puluhan pahat lubang khusus.',
        equations: [
          {
            label: 'Batas & Toleransi Lubang (Basis-H: EI = 0 µm)',
            formula: 'D_max = d + ES / 1000   |   D_min = d + EI / 1000   |   T_H = ES − EI',
            note: 'ES = penyimpangan atas (µm), EI = penyimpangan bawah (µm); untuk semua lubang H berlaku EI = 0 µm',
          },
          {
            label: 'Batas & Toleransi Poros',
            formula: 'd_max = d + es / 1000   |   d_min = d + ei / 1000   |   T_S = es − ei',
            note: 'Huruf poros a–h berada pada/di bawah 0 µm (longgar); k–n memotong 0 µm (transisi); p–z di atas 0 µm (sesak)',
          },
          {
            label: 'Prinsip Taylor untuk Kaliber Batas Go / No-Go',
            formula: 'Plug Gauge: Go = D_min, No-Go = D_max   |   Snap Gauge: Go = d_max, No-Go = d_min',
            note: 'Sisi Go memeriksa kondisi material maksimum (MMC); sisi No-Go memeriksa kondisi material minimum (LMC)',
          },
        ],
        workedExample: {
          title: 'Memeriksa Suaian Geser Presisi Ø50 H7/g6',
          given: [
            'Diameter nominal: d = 50 mm',
            'Penyimpangan Lubang H7 (ISO 286-2): ES = +25 µm, EI = 0 µm',
            'Penyimpangan Poros g6 (ISO 286-2): es = −9 µm, ei = −25 µm',
          ],
          steps: [
            'Batas lubang: D_min = 50.000 mm (Go plug), D_max = 50.025 mm (No-Go plug), T_H = 25 µm',
            'Batas poros: d_max = 49.991 mm (Go snap), d_min = 49.975 mm (No-Go snap), T_S = 16 µm',
            'Kelonggaran minimum: C_min = EI − es = 0 − (−9) = +9 µm; Kelonggaran maksimum: C_max = ES − ei = 25 − (−25) = +50 µm',
          ],
          answer: 'Suaian longgar terjamin (+9 µm hingga +50 µm) yang ideal untuk hub geser presisi.',
        },
      },
      {
        title: 'Mekanika Suaian Longgar, Transisi & Sesak (Interference)',
        summary:
          'Membandingkan zona toleransi lubang (ES, EI) terhadap zona toleransi poros (es, ei) menentukan apakah pasangan selalu memiliki celah bebas (Clearance/Longgar), selalu membutuhkan gaya tekan atau pemanasan termal (Interference/Sesak), atau dapat menghasilkan celah tipis maupun kesesakan tipis tergantung ukuran aktual hasil pemesinan (Transition/Transisi).',
        equations: [
          {
            label: 'Kelonggaran Ekstrem (Bertanda C = D_lubang − d_poros)',
            formula: 'C_max = ES − ei   |   C_min = EI − es',
            note: 'Suaian longgar bila C_min ≥ 0 µm; Suaian transisi bila C_max > 0 µm dan C_min < 0 µm',
          },
          {
            label: 'Kesesakan Ekstrem (δ = d_poros − D_lubang = −C)',
            formula: 'δ_max = es − EI   |   δ_min = ei − ES',
            note: 'Suaian sesak murni bila δ_min ≥ 0 µm (atau C_max ≤ 0 µm), seperti H7/p6 dan H7/s6',
          },
          {
            label: 'Total Rentang Toleransi Suaian',
            formula: 'T_fit = C_max − C_min = T_H + T_S',
            note: 'Sama dengan penjumlahan toleransi lubang dan toleransi poros',
          },
        ],
        workedExample: {
          title: 'Mengevaluasi Suaian Transisi Hub Roda Gigi Ø50 H7/k6',
          given: [
            'Diameter nominal: d = 50 mm',
            'Lubang H7: ES = +25 µm, EI = 0 µm',
            'Poros k6: es = +18 µm, ei = +2 µm',
          ],
          steps: [
            'Hitung Kelonggaran Maksimum (lubang terbesar − poros terkecil): C_max = ES − ei = +25 − (+2) = +23 µm',
            'Hitung Kelonggaran Minimum (lubang terkecil − poros terbesar): C_min = EI − es = 0 − (+18) = −18 µm',
            'Karena C_min = −18 µm, kesesakan maksimum adalah δ_max = +18 µm',
          ],
          answer: 'Suaian transisi dari kelonggaran 23 µm hingga kesesakan 18 µm (konsentrisitas tinggi untuk roda gigi berpasak).',
        },
      },
      {
        title: 'Shrink-Fit Termal (Δd = α · d · ΔT) & Gaya Pres Hidrolik',
        summary:
          'Pengepresan dingin pada suaian sesak berat (seperti H7/p6 atau H7/s6) membutuhkan tonase hidrolik besar dan berisiko menggores (galling) permukaan kontak. Memanaskan hub luar dengan pemanas induksi (atau mendinginkan poros dalam es kering / nitrogen cair) memperbesar celah sementara sehingga komponen dapat masuk tanpa gaya tekan sebelum mengunci kuat saat suhu kembali merata.',
        equations: [
          {
            label: 'Pemuaian / Penyusutan Diameter Termal',
            formula: 'Δd = α · d · ΔT',
            note: 'Untuk baja karbon/paduan α ≈ 11.5 × 10⁻⁶ /°C (0.0115 µm per mm per °C)',
          },
          {
            label: 'Tekanan Kontak Antarmuka Lamé (Hub Baja Do/d = 2.0)',
            formula: 'p = [E · (δ / d)] · [(1 − (d / Do)²) / 2] ≈ 0.375 · E · (δ / d)',
            note: 'Dengan E = 207,000 MPa dan δ dalam mm (atau δ_µm / 1000)',
          },
          {
            label: 'Gaya Perakitan Pres Hidrolik',
            formula: 'F = µ · p · π · d · L',
            note: 'F dalam kN (bagi N dengan 1000), µ ≈ 0.15 koefisien gesek pres baja terlumasi, L = panjang kontak (mm)',
          },
        ],
        workedExample: {
          title: 'Suhu Pemanas Induksi untuk Shrink-Fit Berat Ø80 H7/s6',
          given: [
            'Diameter nominal: d = 80 mm, baja α = 11.5 × 10⁻⁶ /°C, suhu ruang T₀ = 20 °C',
            'Lubang H7 (EI = 0 µm, ES = +30 µm), Poros s6 (es = +78 µm, ei = +59 µm)',
            'Target margin celah aman perakitan: C_safe = 31 µm',
          ],
          steps: [
            'Kesesakan terburuk: δ_max = es − EI = 78 − 0 = 78 µm',
            'Pemuaian termal yang dibutuhkan: Δd_req = δ_max + C_safe = 78 + 31 = 109 µm = 0.109 mm',
            'Kenaikan suhu: ΔT = 109 / (0.0115 × 80) = 109 / 0.92 = 118.5 °C → T_heater ≈ 20 + 119 = 139 °C',
          ],
          answer: 'Panaskan hub hingga ~140 °C (aman di bawah batas temper bantalan 125–150 °C) untuk perakitan bebas gaya tekan.',
        },
      },
    ],
    practice: [
      {
        id: 'ft-p1',
        prompt:
          'Untuk suaian putar Ø50 H7/f7 (H7: ES = +25 µm, EI = 0 µm; f7: es = −25 µm, ei = −50 µm), hitunglah Kelonggaran Maksimum C_max dalam µm.',
        hint: 'Kelonggaran maksimum terjadi antara lubang terbesar (ES) dan poros terkecil (ei): C_max = ES − ei.',
        targetValue: 75,
        unit: 'µm',
        tolerance: 1,
        solutionSteps: [
          'Penyimpangan atas lubang ES = +25 µm',
          'Penyimpangan bawah poros ei = −50 µm',
          'C_max = ES − ei = 25 − (−50) = 75 µm',
        ],
      },
      {
        id: 'ft-p2',
        prompt:
          'Suaian sesak Ø80 H7/p6 memiliki Lubang H7 (ES = +30 µm, EI = 0 µm) dan Poros p6 (es = +51 µm, ei = +32 µm). Berapakah Kesesakan Maksimum δ_max dalam µm?',
        hint: 'Kesesakan maksimum terjadi saat poros terbesar (es) berpasangan dengan lubang terkecil (EI): δ_max = es − EI.',
        targetValue: 51,
        unit: 'µm',
        tolerance: 1,
        solutionSteps: [
          'Penyimpangan bawah lubang EI = 0 µm',
          'Penyimpangan atas poros es = +51 µm',
          'δ_max = es − EI = 51 − 0 = 51 µm',
        ],
      },
      {
        id: 'ft-p3',
        prompt:
          'Sebuah hub kopling baja dengan diameter lubang d = 100 mm (α = 11.5 × 10⁻⁶ /°C) dipanaskan dari suhu ruang 20 °C ke 120 °C (ΔT = 100 °C) pada pemanas induksi. Berapa mikrometer (µm) penambahan diameter lubangnya?',
        hint: 'Gunakan Δd (µm) = 0.0115 × d (mm) × ΔT (°C).',
        targetValue: 115,
        unit: 'µm',
        tolerance: 2,
        solutionSteps: [
          'Kenaikan suhu ΔT = 120 °C − 20 °C = 100 °C',
          'Δd = α · d · ΔT = 11.5 × 10⁻⁶ × 100 mm × 100 °C = 0.115 mm = 115 µm',
        ],
      },
      {
        id: 'ft-p4',
        prompt:
          'Suaian pres poros Ø50 mm dengan panjang kontak L = 60 mm menghasilkan tekanan kontak antarmuka p = 30 MPa. Dengan koefisien gesek µ = 0.15, hitung gaya pres hidrolik F yang diperlukan dalam kN.',
        hint: 'Gunakan F (kN) = (µ · p · π · d · L) / 1000.',
        targetValue: 42.4,
        unit: 'kN',
        tolerance: 1.0,
        solutionSteps: [
          'Luas bidang kontak A = π · d · L = 3.1416 × 50 × 60 = 9,424.8 mm²',
          'Gaya pres F = µ · p · A = 0.15 × 30 MPa × 9,424.8 mm² = 42,411.5 N = 42.4 kN',
        ],
      },
      {
        id: 'ft-p5',
        prompt:
          'Untuk lubang Ø40 H7 (ES = +25 µm, EI = 0 µm), berapakah diameter tepat (dalam mm) dari sisi "No-Go" kaliber plug silindris?',
        hint: 'Kaliber plug No-Go memeriksa batas atas lubang: D_max = d + ES / 1000.',
        targetValue: 40.025,
        unit: 'mm',
        tolerance: 0.002,
        solutionSteps: [
          'Diameter nominal d = 40.000 mm',
          'Penyimpangan atas ES = +25 µm = +0.025 mm',
          'D_max (Kaliber Plug No-Go) = 40.000 + 0.025 = 40.025 mm',
        ],
      },
    ],
    quiz: [
      {
        id: 'ft-q1',
        question:
          'Dalam penulisan toleransi ISO 286 "Ø50 H7/k6", apakah arti huruf kapital "H"?',
        options: [
          'Sistem basis lubang di mana penyimpangan bawah (EI) lubang adalah nol (0 µm)',
          'Poros baja yang dikeraskan dengan tingkat kekerasan kelas 7',
          'Suaian susut berat yang wajib dipasang dengan pres hidrolik',
          'Penyimpangan atas lubang sama dengan nol (ES = 0 µm)',
        ],
        correctIndex: 0,
        explanation:
          'Dalam ISO 286, huruf kapital melambangkan lubang dan "H" adalah penyimpangan fundamental basis lubang dengan EI = 0 µm (diameter minimum lubang sama dengan ukuran nominal).',
      },
      {
        id: 'ft-q2',
        question:
          'Kelas poros ISO 286 manakah yang bila dipasangkan dengan lubang H7 selalu menghasilkan Suaian Sesak (Interference Fit) murni?',
        options: [
          'p6 atau s6 (zona toleransi poros berada sepenuhnya di atas zona lubang H7)',
          'f7 atau g6 (zona toleransi poros berada di bawah garis 0 µm)',
          'h6 (penyimpangan atas poros es = 0 µm)',
          'k6 (zona poros bertumpukan dengan zona lubang H7)',
        ],
        correctIndex: 0,
        explanation:
          'Untuk poros p6 dan s6 dengan lubang H7, penyimpangan bawah poros (ei) lebih besar daripada penyimpangan atas lubang (ES), sehingga selalu menghasilkan kesesakan pada seluruh kombinasi.',
      },
      {
        id: 'ft-q3',
        question:
          'Menurut Prinsip Taylor untuk pemeriksaan kaliber batas Go/No-Go pada lubang H7, bagaimana syarat kelulusan menggunakan Kaliber Plug (Plug Gauge)?',
        options: [
          'Ujung Go (D_min) harus masuk bebas sepanjang lubang, dan ujung No-Go (D_max) tidak boleh masuk',
          'Kedua ujung Go maupun No-Go harus dapat masuk menembus lubang',
          'Kedua ujung tidak boleh masuk tanpa bantuan pres arbor 5 ton',
          'Ujung Go berhenti di tengah dan ujung No-Go masuk bebas',
        ],
        correctIndex: 0,
        explanation:
          'Kaliber Go memastikan diameter lubang minimal sebesar D_min sepanjang bidang kontak, sedangkan kaliber No-Go memastikan lubang tidak aus/membesar melewati D_max.',
      },
      {
        id: 'ft-q4',
        question:
          'Mengapa bantalan gelinding presisi dan hub shrink-fit H7/s6 umumnya dipanaskan hingga 110–125 °C menggunakan pemanas induksi, bukan >150–200 °C dengan api las oksi-asetilena?',
        options: [
          'Pemanasan berlebih di atas ~125–150 °C melunakkan (temper) baja bantalan secara permanen dan memicu distorsi termal tidak merata',
          'Baja berhenti memuai secara termal di atas suhu 125 °C',
          'Pemanas induksi mengecilkan diameter poros alih-alih memperbesar lubang',
          'Suhu di atas 125 °C mengubah suaian sesak menjadi suaian longgar permanen pada 20 °C',
        ],
        correctIndex: 0,
        explanation:
          'Baja bantalan standar 52100 distabilkan secara martensitik hingga ~125 °C. Api las menciptakan titik panas lokal yang merusak kekerasan dan kebulatan.',
      },
      {
        id: 'ft-q5',
        question:
          'Jika panjang kontak L pada suaian pres silindris digandakan 2× lipat (dengan diameter d dan kesesakan δ tetap), apa yang terjadi pada gaya pres hidrolik F yang dibutuhkan?',
        options: [
          'Gaya pres F menjadi 2× lipat karena luas bidang kontak (π · d · L) berlipat ganda',
          'Gaya pres F tetap sama karena tekanan kontak p tidak berubah',
          'Gaya pres F berkurang 50%',
          'Gaya pres F meningkat 4× lipat',
        ],
        correctIndex: 0,
        explanation:
          'Karena F = µ · p · π · d · L dan tekanan kontak Lamé p hanya bergantung pada geometri radial (δ/d dan Do/d), menggandakan L akan menggandakan gaya tekan aksial secara linear.',
      },
      {
        id: 'ft-q6',
        question:
          'Saat mendinginkan poros baja dalam es kering / alkohol (−78 °C, ΔT ≈ −98 °C dari suhu ruang 20 °C), bagaimana perbandingan perubahan diameter termalnya terhadap memanaskan hub baja sebesar +98 °C (+118 °C)?',
        options: [
          'Besar perubahan diameter |Δd| = α · d · |ΔT| identik (poros menyusut dengan nilai µm yang sama dengan pemuaian hub)',
          'Pendinginan poros menghasilkan perubahan diameter nol karena α bernilai nol di bawah 0 °C',
          'Pendinginan justru membuat poros memuai',
          'Pendinginan menghasilkan kelonggaran 10× lebih besar dibandingkan pemanasan pada ΔT yang sama',
        ],
        correctIndex: 0,
        explanation:
          'Pemuaian/penyusutan termal linear Δd = α · d · ΔT bersifat simetris; penurunan suhu 98 °C menyusutkan poros baja dengan jumlah µm yang sama dengan pemuaian lubang akibat kenaikan 98 °C.',
      },
    ],
  },
  ja: {
    title: 'ISO 286 はめあい公差・焼きばめシミュレーター',
    shortTitle: 'ISO 286 はめあい・焼きばめ',
    description:
      'ISO 286 穴基準はめあい（H6/H7/H8 と軸 f7〜s6）、通り/止まり（Go/No-Go）プラグ・スナップゲージ限界、ラメ接触面圧、油圧プレス圧入力、および誘導加熱・冷やしばめ組立隙間を解析します。',
    explore: [
      {
        title: 'ISO 286 穴基準はめあい方式 (H7) と基礎上の許容差',
        summary:
          'ISO 286-1/2（JIS B 0401）では、「Ø50 H7/g6」のように穴（内径）を大文字、軸（外径）を小文字で表します。産業機械の90%以上では、穴の下の許容差 EI を基準線（0 µm、最小穴径 D_min = 呼び径 d）に固定する「穴基準式（H穴）」が採用されます。これは標準リーマやブローチで穴を仕上げ、外径研削で軸側の公差域を変える方が工具コストを大幅に削減できるためです。',
        equations: [
          {
            label: '穴の許容限界寸法と公差 (H穴基準: EI = 0 µm)',
            formula: 'D_max = d + ES / 1000   |   D_min = d + EI / 1000   |   T_H = ES − EI',
            note: 'ES = 上の許容差 (µm)、EI = 下の許容差 (µm)。すべての H 穴で EI = 0 µm',
          },
          {
            label: '軸の許容限界寸法と公差',
            formula: 'd_max = d + es / 1000   |   d_min = d + ei / 1000   |   T_S = es − ei',
            note: '軸 a〜h は 0 µm 以下（すきまばめ）、k〜n は 0 µm 付近（中間ばめ）、p〜z は正領域（しまりばめ）',
          },
          {
            label: 'テイラーの原理と通り・止まり限界ゲージ (Go / No-Go)',
            formula: 'プラグゲージ: Go = D_min, No-Go = D_max   |   スナップゲージ: Go = d_max, No-Go = d_min',
            note: '通り側 (Go) は最大実体状態 (MMC) を検査し、止まり側 (No-Go) は最小実体状態 (LMC) を検査します',
          },
        ],
        workedExample: {
          title: 'Ø50 H7/g6 精密滑りばめの寸法とゲージ限界計算',
          given: [
            '基準寸法（呼び径）: d = 50 mm',
            '穴 H7 の許容差 (ISO 286-2): ES = +25 µm, EI = 0 µm',
            '軸 g6 の許容差 (ISO 286-2): es = −9 µm, ei = −25 µm',
          ],
          steps: [
            '穴の限界寸法: D_min = 50.000 mm (通りプラグ), D_max = 50.025 mm (止まりプラグ), T_H = 25 µm',
            '軸の限界寸法: d_max = 49.991 mm (通りスナップ), d_min = 49.975 mm (止まりスナップ), T_S = 16 µm',
            '最小すきま: C_min = EI − es = 0 − (−9) = +9 µm、最大すきま: C_max = ES − ei = 25 − (−25) = +50 µm',
          ],
          answer: '+9 µm 〜 +50 µm の確実なすきまばめとなり、精密摺動ハブやクラッチスリーブに最適です。',
        },
      },
      {
        title: 'すきまばめ・中間ばめ・しまりばめの力学',
        summary:
          '穴の公差域 (ES, EI) と軸の公差域 (es, ei) の位置関係を比較することで、常に隙間が生じる「すきまばめ (Clearance)」、常に締め代が生じる「しまりばめ (Interference)」、あるいは実加工寸法によってわずかな隙間または締め代のいずれかになる「中間ばめ (Transition)」が決まります。',
        equations: [
          {
            label: '最大・最小すきま (符号付き C = D_hole − d_shaft)',
            formula: 'C_max = ES − ei   |   C_min = EI − es',
            note: 'C_min ≥ 0 µm ならすきまばめ、C_max > 0 µm かつ C_min < 0 µm なら中間ばめ',
          },
          {
            label: '最大・最小締め代 (δ = d_shaft − D_hole = −C)',
            formula: 'δ_max = es − EI   |   δ_min = ei − ES',
            note: 'δ_min ≥ 0 µm（C_max ≤ 0 µm）なら完全なしまりばめ（H7/p6、H7/s6 など）',
          },
          {
            label: 'はめあい公差幅',
            formula: 'T_fit = C_max − C_min = T_H + T_S',
            note: '穴公差 T_H と軸公差 T_S の和に等しくなります',
          },
        ],
        workedExample: {
          title: 'Ø50 H7/k6 歯車ハブ中間ばめの評価',
          given: [
            '呼び径: d = 50 mm',
            '穴 H7: ES = +25 µm, EI = 0 µm',
            '軸 k6: es = +18 µm, ei = +2 µm',
          ],
          steps: [
            '最大すきま（最大穴 − 最小軸）: C_max = ES − ei = +25 − (+2) = +23 µm',
            '最小すきま（最小穴 − 最大軸）: C_min = EI − es = 0 − (+18) = −18 µm',
            'C_min = −18 µm より、最大締め代は δ_max = +18 µm',
          ],
          answer: '最大すきま 23 µm 〜 最大締め代 18 µm の中間ばめ（キー溝付き歯車の高精度な芯出しに最適）。',
        },
      },
      {
        title: '焼きばめ・冷やしばめ (Δd = α · d · ΔT) と油圧プレス圧入力',
        summary:
          'H7/p6 や H7/s6 のような強しまりばめを常温で無理に油圧プレス圧入すると、大きな推力が必要となり、かじり（ゴーリング）や嵌合面の傷を招きます。誘導加熱器でハブ（穴側）を加熱膨張させる「焼きばめ」や、ドライアイス・液体窒素で軸を冷却収縮させる「冷やしばめ」を行えば、一時的な隙間を確保して無負荷で挿入でき、常温に戻ると強固な面圧で一体化します。',
        equations: [
          {
            label: '熱膨張・熱収縮による直径変化量',
            formula: 'Δd = α · d · ΔT',
            note: '炭素鋼・合金鋼の線膨張係数 α ≈ 11.5 × 10⁻⁶ /°C（1 mm・1 °C あたり 0.0115 µm）',
          },
          {
            label: 'ラメの厚肉円筒理論による接触面圧 (鋼製ハブ Do/d = 2.0)',
            formula: 'p = [E · (δ / d)] · [(1 − (d / Do)²) / 2] ≈ 0.375 · E · (δ / d)',
            note: 'ヤング率 E = 207,000 MPa、締め代 δ は mm 単位（δ_µm / 1000）',
          },
          {
            label: '油圧プレス圧入力',
            formula: 'F = µ · p · π · d · L',
            note: 'F は kN（N を 1000 で割る）、µ ≈ 0.15（潤滑鋼面）、L = 嵌合長さ (mm)',
          },
        ],
        workedExample: {
          title: 'Ø80 H7/s6 強しまりばめハブの誘導加熱温度の算出',
          given: [
            '呼び径: d = 80 mm、鋼の α = 11.5 × 10⁻⁶ /°C、室温 T₀ = 20 °C',
            '穴 H7 (EI = 0 µm, ES = +30 µm)、軸 s6 (es = +78 µm, ei = +59 µm)',
            '組立時の目標安全隙間マージン: C_safe = 31 µm',
          ],
          steps: [
            '最大締め代: δ_max = es − EI = 78 − 0 = 78 µm',
            '必要な熱膨張量: Δd_req = δ_max + C_safe = 78 + 31 = 109 µm = 0.109 mm',
            '必要な温度上昇: ΔT = 109 / (0.0115 × 80) = 109 / 0.92 = 118.5 °C → 加熱温度 T ≈ 20 + 119 = 139 °C',
          ],
          answer: 'ハブを約 140 °C に誘導加熱することで、プレス力ゼロで安全に落とし込み組立が可能です。',
        },
      },
    ],
    practice: [
      {
        id: 'ft-p1',
        prompt:
          'Ø50 H7/f7 の動きばめ（H7: ES = +25 µm, EI = 0 µm、f7: es = −25 µm, ei = −50 µm）において、最大すきま C_max (µm) を求めてください。',
        hint: '最大すきまは最大穴径 (ES) と最小軸径 (ei) の差 C_max = ES − ei で求まります。',
        targetValue: 75,
        unit: 'µm',
        tolerance: 1,
        solutionSteps: [
          '穴の上の許容差 ES = +25 µm',
          '軸の下の許容差 ei = −50 µm',
          'C_max = ES − ei = 25 − (−50) = 75 µm',
        ],
      },
      {
        id: 'ft-p2',
        prompt:
          'Ø80 H7/p6 のしまりばめ（穴 H7: ES = +30 µm, EI = 0 µm、軸 p6: es = +51 µm, ei = +32 µm）における最大締め代 δ_max (µm) はいくらですか？',
        hint: '最大締め代は最大軸径 (es) と最小穴径 (EI) の差 δ_max = es − EI です。',
        targetValue: 51,
        unit: 'µm',
        tolerance: 1,
        solutionSteps: [
          '穴の下の許容差 EI = 0 µm',
          '軸の上の許容差 es = +51 µm',
          'δ_max = es − EI = 51 − 0 = 51 µm',
        ],
      },
      {
        id: 'ft-p3',
        prompt:
          '内径 d = 100 mm の鋼製カップリングハブ（α = 11.5 × 10⁻⁶ /°C）を室温 20 °C から誘導加熱器で 120 °C（ΔT = 100 °C）まで加熱したとき、内径は何 µm 膨張しますか？',
        hint: 'Δd (µm) = 0.0115 × d (mm) × ΔT (°C) を使用します。',
        targetValue: 115,
        unit: 'µm',
        tolerance: 2,
        solutionSteps: [
          '温度上昇 ΔT = 120 °C − 20 °C = 100 °C',
          'Δd = α · d · ΔT = 11.5 × 10⁻⁶ × 100 mm × 100 °C = 0.115 mm = 115 µm',
        ],
      },
      {
        id: 'ft-p4',
        prompt:
          '呼び径 Ø50 mm、嵌合長さ L = 60 mm の圧入部で接触面圧 p = 30 MPa が発生しています。摩擦係数 µ = 0.15 としたとき、必要な油圧プレス圧入力 F (kN) を求めてください。',
        hint: 'F (kN) = (µ · p · π · d · L) / 1000 を計算します。',
        targetValue: 42.4,
        unit: 'kN',
        tolerance: 1.0,
        solutionSteps: [
          '接触面積 A = π · d · L = 3.1416 × 50 × 60 = 9,424.8 mm²',
          '圧入力 F = µ · p · A = 0.15 × 30 MPa × 9,424.8 mm² = 42,411.5 N = 42.4 kN',
        ],
      },
      {
        id: 'ft-p5',
        prompt:
          'Ø40 H7 穴（ES = +25 µm, EI = 0 µm）を検査する円筒プラグゲージの「止まり側 (No-Go)」の正確な直径 (mm) はいくらですか？',
        hint: '止まり側プラグゲージは穴の最大許容寸法 D_max = d + ES / 1000 に対応します。',
        targetValue: 40.025,
        unit: 'mm',
        tolerance: 0.002,
        solutionSteps: [
          '基準寸法 d = 40.000 mm',
          '上の許容差 ES = +25 µm = +0.025 mm',
          'D_max（止まり側プラグ径）= 40.000 + 0.025 = 40.025 mm',
        ],
      },
    ],
    quiz: [
      {
        id: 'ft-q1',
        question:
          'ISO 286 のはめあい表記「Ø50 H7/k6」において、大文字の「H」は何を意味しますか？',
        options: [
          '穴の下の許容差 (EI) を 0 µm とする穴基準式のはめあい',
          'ロックウェル硬さクラス 7 の焼入れ鋼軸',
          '油圧プレスを必須とする強しまりばめ',
          '穴の上の許容差 (ES) が 0 µm であること',
        ],
        correctIndex: 0,
        explanation:
          'ISO 286 では大文字が穴を表し、「H」は最小穴径が基準寸法に一致する（EI = 0 µm）穴基準式の基礎許容差を示します。',
      },
      {
        id: 'ft-q2',
        question:
          'H7 穴と組み合わせたとき、常に確実な「しまりばめ (Interference Fit)」となる軸公差クラスはどれですか？',
        options: [
          'p6 または s6（軸の公差域が H7 穴の公差域より完全に上側にある）',
          'f7 または g6（軸の公差域が 0 µm 線より下側にある）',
          'h6（軸の上の許容差 es = 0 µm）',
          'k6（軸の公差域が H7 穴の公差域と重なる）',
        ],
        correctIndex: 0,
        explanation:
          'p6 や s6 軸では軸の下の許容差 (ei) が H7 穴の上の許容差 (ES) を上回るため、どの寸法の組み合わせでも常に締め代が生じます。',
      },
      {
        id: 'ft-q3',
        question:
          'テイラーの原理に基づき、加工された H7 穴を通り/止まり（Go/No-Go）プラグゲージで検査した際、合格となる条件はどれですか？',
        options: [
          '通り側 (D_min) が穴の全長を無理なく通過し、かつ止まり側 (D_max) が入らないこと',
          '通り側と止まり側の両方が穴を完全に通過すること',
          '両方とも 5 トンプレスを使わないと入らないこと',
          '通り側が途中で止まり、止まり側が自由に通過すること',
        ],
        correctIndex: 0,
        explanation:
          '通り側プラグゲージは穴径が全長にわたり D_min 以上であることを保証し、止まり側プラグゲージは穴径が D_max を超えて拡大していないことを保証します。',
      },
      {
        id: 'ft-q4',
        question:
          '精密転がり軸受や H7/s6 焼きばめハブの加熱にガスバーナーでの 150〜200 °C 以上の加熱を避け、誘導加熱器で 110〜125 °C 程度に制御する主な理由はなぜですか？',
        options: [
          '約 125〜150 °C を超えると軸受鋼の焼戻し軟化（硬度低下）や不均一な熱変形が永久に残るため',
          '125 °C を超えると鋼の熱膨張が止まるため',
          '誘導加熱器は穴を広げるのではなく軸を収縮させるため',
          '125 °C 以上に加熱すると常温に戻った後もすきまばめに変化してしまうため',
        ],
        correctIndex: 0,
        explanation:
          '一般的な軸受鋼 (SUJ2 / 52100) の寸法安定化処理は約 125 °C が上限であり、裸火による局部過熱は硬度低下や真円度悪化を招きます。',
      },
      {
        id: 'ft-q5',
        question:
          '円筒しまりばめの呼び径 d と締め代 δ を一定にしたまま、嵌合長さ L を 2 倍にすると、必要な油圧プレス圧入力 F はどうなりますか？',
        options: [
          '接触面積 (π · d · L) が 2 倍になるため、圧入力 F も 2 倍になる',
          '接触面圧 p が変わらないため、圧入力 F は一定のまま',
          '圧入力 F は半分に減少する',
          '圧入力 F は 4 倍になる',
        ],
        correctIndex: 0,
        explanation:
          'F = µ · p · π · d · L であり、ラメの接触面圧 p は半径方向比のみに依存するため、嵌合長さ L に比例して圧入力と伝達トルク容量は 2 倍になります。',
      },
      {
        id: 'ft-q6',
        question:
          '鋼軸をドライアイス・アルコール（−78 °C、室温 20 °C から ΔT ≈ −98 °C）で冷やしばめする場合、鋼ハブを +98 °C 上昇（+118 °C）させて焼きばめする場合と比べて直径変化量の大きさはどうなりますか？',
        options: [
          '直径変化量の絶対値 |Δd| = α · d · |ΔT| は同じ（ハブが膨張するのと同じ µm だけ軸が収縮する）',
          '0 °C 以下では線膨張係数 α がゼロになるため軸は収縮しない',
          '冷却すると軸は収縮せず逆に膨張する',
          '同じ温度差 ΔT でも冷却の方が 10 倍大きい隙間が得られる',
        ],
        correctIndex: 0,
        explanation:
          '線膨張・収縮式 Δd = α · d · ΔT は対称であり、98 °C の冷却による軸の収縮量 (µm) は 98 °C の加熱による穴の膨張量と等しくなります。',
      },
    ],
  },
});
