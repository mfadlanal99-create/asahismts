import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('rigging-lifting', {
  id: {
    title: 'Rigging Industri, Sudut Sling & Pengangkatan Titik Berat (CoG)',
    shortTitle: 'Rigging & Beban Sling',
    description:
      'Analisis faktor pengali tegangan sudut sling (1/sin θ), pembagian beban Titik Berat (CoG) asimetris, faktor efisiensi ikatan (Vertikal, Choker, Basket), pemilihan segel (shackle), serta kelurusan kait crane sesuai standar ASME B30.9.',
    explore: [
      {
        title: 'Faktor Beban Sudut Sling (L/H = 1 / sin θ)',
        summary:
          'Saat sling bridle 2-kaki mengangkat beban pada sudut θ yang diukur dari bidang horizontal, setiap kaki sling harus menahan komponen angkat vertikal (W/2) sekaligus gaya tekan horizontal ke dalam (H = (W/2)·cot θ) yang menjepit beban. Ketika θ turun di bawah 60°, gaya jepit horizontal dan tegangan tarik sling melonjak drastis—pada θ = 30°, setiap kaki sling menahan tegangan yang sama besarnya dengan seluruh berat beban!',
        equations: [
          {
            label: 'Faktor Pengali Sudut Sling (Load Factor)',
            formula: 'LF = L / H = 1 / sin θ',
            note: 'θ diukur dari bidang horizontal: 60° → 1.155× | 45° → 1.414× | 30° → 2.000×',
          },
          {
            label: 'Tegangan Sling 2-Kaki Simetris',
            formula: 'T = (W / 2) · (1 / sin θ) = W / (2 · sin θ)',
            note: 'Setiap kaki menahan setengah beban vertikal dikalikan faktor sudut LF',
          },
          {
            label: 'Gaya Jepit Tekan Horizontal',
            formula: 'F_horiz = (W / 2) / tan θ',
            note: 'Menekan bundel heat exchanger panjang atau skid berdinding tipis; gunakan spreader beam bila θ < 45°',
          },
        ],
        workedExample: {
          title: 'Mengangkat Bundel Heat Exchanger 4.2 t pada Sudut Sling Horizontal 45° vs. 30°',
          given: [
            'Massa beban W = 4.2 t (41.2 kN), Titik Berat (CoG) simetris (d1 = d2)',
            'Ikatan bridle vertikal 2-kaki menggunakan webbing sling sintetis WLL 3.0 t',
          ],
          steps: [
            'Pada θ = 45°: Load Factor LF = 1 / sin(45°) = 1.414. Tegangan kaki T = (4.2 / 2) × 1.414 = 2.97 t (99% dari WLL 3.0 t — batas kritis).',
            'Pada θ = 30°: Load Factor LF = 1 / sin(30°) = 2.000. Tegangan kaki T = (4.2 / 2) × 2.000 = 4.20 t (140% dari WLL 3.0 t — OVERLOAD BERBAHAYA!).',
            'Memperpanjang sling agar mencapai θ = 60° menurunkan LF menjadi 1.155 dan tegangan kaki menjadi T = 2.1 × 1.155 = 2.43 t (81% WLL).',
          ],
          answer: 'T(60°) = 2.43 t (Aman)  |  T(45°) = 2.97 t (Waspada)  |  T(30°) = 4.20 t (Overload)',
        },
      },
      {
        title: 'Titik Berat (CoG) Tidak Sebidang & Ketidakseimbangan Tegangan Kaki Sling',
        summary:
          'Skid mesin industri (seperti pompa yang dikopel dengan motor penggerak berat atau gearbox asimetris) jarang memiliki Titik Berat (Center of Gravity / CoG) tepat di tengah-tengah antara kupingan angkat (lifting lug). Agar pengangkatan stabil dan rata (level), kait (hook) crane WAJIB diposisikan tegak lurus tepat di atas CoG, dan kaki sling yang paling dekat dengan CoG akan memikul porsi beban terbesar.',
        equations: [
          {
            label: 'Pembagian Beban Vertikal pada Kaki 1 & Kaki 2',
            formula: 'V1 = W · d2 / (d1 + d2)   |   V2 = W · d1 / (d1 + d2)',
            note: 'd1 = jarak horizontal dari Lug 1 ke CoG; d2 = jarak horizontal dari Lug 2 ke CoG',
          },
          {
            label: 'Tegangan Kaki Asimetris dengan Sudut Sling θ1, θ2',
            formula: 'T1 = (W · d2) / [(d1 + d2) · sin θ1]   |   T2 = (W · d1) / [(d1 + d2) · sin θ2]',
            note: 'Kaki yang lebih pendek dan lebih tegak di dekat CoG memikul porsi vertikal lebih besar sekaligus sudut lebih curam',
          },
          {
            label: 'Hukum Keseimbangan Tegak Lurus Hook',
            formula: 'x_CoG = x_hook  (pada keseimbangan statis)',
            note: 'Jika hook crane tidak lurus di atas CoG saat mulai diangkat, beban akan mengayun dan miring hingga CoG berada tepat di bawah hook!',
          },
        ],
        workedExample: {
          title: 'Menghitung Tegangan Kaki Tidak Sama pada Skid Gearbox Asimetris 6.5 t',
          given: [
            'Berat total W = 6.5 t, jarak antar lug D = d1 + d2 = 3.0 m',
            'Gearbox berat menggeser CoG mendekati Lug 1: d1 = 1.0 m, d2 = 2.0 m',
            'Tinggi angkat H = 2.0 m di atas lug (hook tepat di atas CoG)',
          ],
          steps: [
            'Hitung panjang sling: L1 = √(d1² + H²) = √(1.0² + 2.0²) = 2.236 m (sin θ1 = 2.0 / 2.236 = 0.894); L2 = √(2.0² + 2.0²) = 2.828 m (sin θ2 = 2.0 / 2.828 = 0.707).',
            'Beban vertikal: V1 = 6.5 × (2.0 / 3.0) = 4.333 t; V2 = 6.5 × (1.0 / 3.0) = 2.167 t.',
            'Tegangan tarik aktual: T1 = 4.333 / 0.894 = 4.85 t (47.5 kN); T2 = 2.167 / 0.707 = 3.06 t (30.1 kN).',
          ],
          answer: 'Kaki 1 (dekat sisi berat) = 4.85 t (wajib sling WLL 5.0 t); Kaki 2 = 3.06 t.',
        },
      },
      {
        title: 'Faktor Efisiensi Ikatan (Vertikal, Choker, Basket) & Keselamatan ASME B30.9',
        summary:
          'Cara sling diikatkan pada beban mengubah Batas Beban Kerja (Working Load Limit / WLL) efektifnya. Ikatan vertikal lurus memberikan 100% (1.0×) kapasitas WLL. Ikatan jerat (Choker Hitch) menekuk badan sling secara tajam melewati matanya sendiri sehingga menurunkan kapasitas menjadi ~75% (0.75×). Ikatan gendong vertikal (Basket Hitch) menopang beban dengan dua jalur vertikal per sling sehingga menggandakan kapasitas efektif menjadi 200% (2.0×) sebelum dikalikan faktor sudut.',
        equations: [
          {
            label: 'WLL Efektif per Kaki Berdasarkan Jenis Ikatan',
            formula: 'WLL_eff = WLL_rated · η_hitch',
            note: 'Bridle Vertikal: η = 1.00  |  Choker Standar (sudut jerat ≥120°): η = 0.75  |  Basket Vertikal: η = 2.00',
          },
          {
            label: 'Faktor Desain (Safety Factor) sesuai ASME B30.9',
            formula: 'WLL = Minimum Breaking Strength (MBS) / SF',
            note: 'Wire rope sling: SF = 5:1  |  Rantai baja paduan (Grade 80/100): SF = 4:1  |  Webbing/round sintetis: SF = 5:1 s/d 7:1',
          },
          {
            label: 'Aturan Sudut Kritis ASME B30.9',
            formula: 'θ ≥ 60° (Direkomendasikan)   |   45° ≤ θ < 60° (Waspada)   |   θ < 30° (DILARANG KERAS)',
            note: 'Jangan pernah menggunakan sudut sling horizontal di bawah 30°; gunakan balok angkat (spreader beam)',
          },
        ],
        workedExample: {
          title: 'Memeriksa Pengangkatan Choker Hitch pada Bundel Silinder 4.2 t',
          given: [
            'Beban W = 4.2 t, CoG simetris (V1 = V2 = 2.1 t)',
            'Dua sling dipasang secara Choker Hitch (η = 0.75) pada sudut horizontal θ = 60°',
            'Masing-masing sling memiliki kapasitas WLL vertikal = 3.0 t',
          ],
          steps: [
            'Hitung WLL efektif per kaki pada ikatan choker: WLL_eff = 3.0 t × 0.75 = 2.25 t.',
            'Hitung tegangan tarik tiap kaki sling pada θ = 60°: T = (4.2 / 2) / sin(60°) = 2.1 / 0.866 = 2.425 t.',
            'Bandingkan T terhadap WLL_eff: Utilisasi = 2.425 / 2.25 = 107.8% (OVERLOAD akibat penurunan kapasitas 0.75× choker!). Naikkan ke sling WLL 5.0 t (WLL_eff = 3.75 t, utilisasi = 64.7%).',
          ],
          answer: 'Sling 3.0 t mengalami overload 108% pada ikatan choker; wajib naik ke sling WLL 5.0 t.',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Sebuah skid mesin simetris seberat 4.0 t diangkat menggunakan sling bridle 2-kaki pada sudut horizontal θ = 30°. Berapakah tegangan T (dalam ton) pada masing-masing kaki sling?',
        hint: 'Pada θ = 30°, sin(30°) = 0.50 (Load Factor = 2.0). Gunakan rumus T = (W / 2) / sin θ.',
        solutionSteps: [
          'Beban vertikal per kaki V = W / 2 = 4.0 / 2 = 2.0 t',
          'Faktor Pengali Sudut Sling pada 30°: LF = 1 / sin(30°) = 1 / 0.50 = 2.00',
          'Tegangan per kaki T = 2.0 t × 2.00 = 4.00 t (setiap kaki memikul seluruh berat beban!)',
        ],
      },
      {
        prompt:
          'Bundel heat exchanger seberat 4.2 t diangkat secara simetris menggunakan bridle 2-kaki pada sudut θ = 60° dari bidang horizontal. Hitung tegangan T (dalam ton) pada setiap kaki sling.',
        hint: 'sin(60°) = 0.866 (atau Load Factor = 1.155). Bagi setengah berat beban dengan sin(60°).',
        solutionSteps: [
          'Porsi vertikal per kaki V = 4.2 / 2 = 2.10 t',
          'Pada θ = 60°, sin(60°) = 0.8660 (LF = 1.1547)',
          'Tegangan T = 2.10 / 0.8660 = 2.425 t',
        ],
      },
      {
        prompt:
          'Skid pompa-motor asimetris seberat 6.0 t memiliki jarak antar lifting lug 3.0 m. Titik Berat (CoG) berada pada jarak d1 = 1.0 m dari Lug 1 dan d2 = 2.0 m dari Lug 2. Berapa beban vertikal V1 (dalam ton) yang dipikul oleh Kaki 1?',
        hint: 'Gunakan aturan tuas: V1 = W × d2 / (d1 + d2). Kaki yang lebih dekat ke CoG memikul beban lebih besar.',
        solutionSteps: [
          'Total bentang antar lug D = d1 + d2 = 1.0 + 2.0 = 3.0 m',
          'V1 = W × (d2 / D) = 6.0 t × (2.0 / 3.0) = 4.00 t',
          'Kaki 2 memikul sisanya V2 = 6.0 × (1.0 / 3.0) = 2.00 t',
        ],
      },
      {
        prompt:
          'Sebuah webbing sling sintetis memiliki kapasitas WLL Vertikal lurus sebesar 3.0 t. Berapakah Batas Beban Kerja efektifnya WLL_eff (dalam ton) jika diikatkan secara Choker Hitch standar (faktor efisiensi 0.75×)?',
        hint: 'Kalikan nilai WLL vertikal dengan faktor efisiensi ikatan choker 0.75.',
        solutionSteps: [
          'Faktor efisiensi Choker Hitch standar η_choker = 0.75',
          'WLL_eff = 3.0 t × 0.75 = 2.25 t',
        ],
      },
      {
        prompt:
          'Skid pompa sentrifugal 1.8 t diangkat simetris dengan bridle 2-kaki pada θ = 45° (LF = 1.414). Konversikan tegangan pada satu kaki sling ke satuan kilonewton (kN) menggunakan g = 9.81 m/s².',
        hint: 'Hitung dulu tegangan kaki dalam ton: T_t = (1.8 / 2) × 1.4142, lalu kalikan 9.81 kN/t.',
        solutionSteps: [
          'Tegangan kaki dalam ton: T = (1.8 / 2) / sin(45°) = 0.90 × 1.4142 = 1.2728 t',
          'Konversi ton-gaya ke kN: T_kN = 1.2728 t × 9.81 kN/t = 12.49 kN',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Saat mengangkat beban dengan sling bridle 2-kaki simetris pada sudut sling horizontal 30°, berapakah tegangan tarik pada MASING-MASING kaki sling?',
        options: [
          'Sama dengan 100% dari berat total beban W (Load Factor = 2.0 pada W/2)',
          'Sama dengan 50% dari berat total beban W',
          'Sama dengan 70.7% dari berat total beban W',
          'Sama dengan 200% dari berat total beban W pada tiap kaki',
        ],
        correctIndex: 0,
        explanation:
          'Karena T = (W / 2) / sin(30°) dan sin(30°) = 0.5, setiap kaki mengalami T = (W / 2) / 0.5 = W—artinya masing-masing kaki sling memikul tegangan sebesar berat total beban.',
      },
      {
        question:
          'Pada skid mesin asimetris di mana Titik Berat (CoG) lebih dekat ke Lug 1 daripada Lug 2, di manakah kait (hook) crane harus diposisikan sebelum pengangkatan agar beban terangkat rata tanpa mengayun?',
        options: [
          'Tegak lurus tepat di atas Titik Berat (CoG)',
          'Tepat di tengah-tengah antara Lug 1 dan Lug 2 (titik tengah geometris)',
          'Tepat di atas Lug 2 (ujung yang lebih ringan)',
          'Posisi hook tidak memengaruhi kemiringan beban asalkan WLL kedua sling sama',
        ],
        correctIndex: 0,
        explanation:
          'Beban yang tergantung selalu mencari keseimbangan statis dengan Titik Berat (CoG) berada tepat di bawah hook crane. Jika hook tidak segaris vertikal dengan CoG sebelum diangkat, beban akan mengayun dan miring hingga CoG berada di bawah hook.',
      },
      {
        question:
          'Mengapa ikatan jerat (Choker Hitch) standar menurunkan kapasitas Working Load Limit (WLL) sling menjadi sekitar 75% dari kapasitas vertikalnya?',
        options: [
          'Tekukan tajam dan jepitan di titik badan sling melewati matanya memusatkan tegangan pada serat/untai bagian luar',
          'Ikatan choker selalu bekerja pada sudut horizontal 30°',
          'Gaya gravitasi meningkat 25% saat mengangkat beban silindris',
          'Hanya setengah mata sling yang terpasang ke hook crane',
        ],
        correctIndex: 0,
        explanation:
          'Pada titik jeratan di mana badan sling menekuk tajam melewati mata sling, kelengkungan sempit dan gaya geser lokal mencegah distribusi beban merata pada untai kawat atau serat sintetis sehingga menurunkan kapasitas ke ~75%.',
      },
      {
        question:
          'Berdasarkan standar keselamatan rigging ASME B30.9, berapakah sudut sling horizontal θ minimum yang diizinkan, dan berapa sudut minimum yang direkomendasikan untuk pengangkatan rutin?',
        options: [
          'Dilarang di bawah 30°; direkomendasikan ≥ 60° (minimum 45° tanpa kajian engineering khusus)',
          'Dilarang di bawah 10°; direkomendasikan 30° untuk semua pengangkatan',
          'Dilarang di bawah 60°; wajib 85° untuk semua pengangkatan',
          'Sudut berapa saja diizinkan asalkan menggunakan ikatan choker',
        ],
        correctIndex: 0,
        explanation:
          'Di bawah 30° dari horizontal, kurva 1/sin θ melonjak secara hiperbolik (LF > 2.0) sehingga kesalahan kecil menyebabkan lonjakan tegangan ekstrem dan gaya jepit penghancur. Sudut ≥ 60° (LF = 1.155) adalah praktik terbaik.',
      },
      {
        question:
          'Pada pengangkatan asimetris dengan hook crane tepat di atas CoG dan kedua lifting lug berada pada ketinggian yang sama, kaki sling manakah yang mengalami tegangan lebih tinggi?',
        options: [
          'Kaki sling yang lebih pendek dan lebih curam yang terhubung ke lug paling dekat dengan CoG',
          'Kaki sling yang lebih panjang dan lebih landai yang terhubung ke lug paling jauh dari CoG',
          'Kedua kaki sling selalu memiliki tegangan identik jika beban terangkat rata',
          'Tegangan hanya bergantung pada diameter pin segel (shackle), bukan posisi CoG',
        ],
        correctIndex: 0,
        explanation:
          'Lug yang lebih dekat ke CoG menopang sebagian besar beban vertikal (V1 = W · d2 / (d1 + d2)) SEKALIGUS membentuk sudut yang lebih tegak menuju hook, sehingga menghasilkan tegangan tarik total tertinggi.',
      },
      {
        question:
          'Apakah keuntungan mekanis utama penggunaan Spreader Beam saat mengangkat bundel heat exchanger panjang berdinding tipis?',
        options: [
          'Mengubah tarikan miring menjadi tarikan vertikal pada lug beban, menghilangkan gaya tekan horizontal dan menurunkan faktor sudut 1/sin θ',
          'Menggandakan daya motor hoist crane',
          'Memungkinkan hook crane diposisikan jauh dari CoG tanpa membuat beban miring',
          'Menghilangkan kebutuhan penggunaan segel (shackle) pada lifting lug',
        ],
        correctIndex: 0,
        explanation:
          'Spreader beam menahan gaya tekan horizontal pada batang kakunya sendiri sehingga sling bawah menggantung vertikal (θ = 90°, LF = 1.0), melindungi peralatan tipis dari tekukan (buckling) dan memaksimalkan WLL sling.',
      },
    ],
  },
  ja: {
    title: '産業用玉掛け・スリング角度・重心（CoG）揚重シミュレータ',
    shortTitle: '玉掛け・スリング荷重',
    description:
      'ASME B30.9に基づく多点吊りスリング角度の張力係数（1/sin θ）、偏荷重（CoGオフセット）時の不均等張力分配、ヒッチ効率係数（ストレート吊り・チョーカー吊り・バスケット吊り）、シャックル選定、およびクレーンフックの芯出し（地切り時の傾き）を解析します。',
    explore: [
      {
        title: 'スリング角度の張力係数（荷重係数 L/H = 1 / sin θ）',
        summary:
          '2本吊りスリングで水平面から角度 θ（対水平角）で荷を吊り上げる場合、各スリング脚には垂直荷重成分（W/2）だけでなく、荷を内側へ押し潰そうとする水平圧縮力（H = (W/2)・cot θ）が作用します。水平角 θ が 60° を下回ると水平圧縮力とスリング張力が急激に増大し、θ = 30° では各スリング脚に「荷の全重量 W に等しい張力」が掛かります。',
        equations: [
          {
            label: 'スリング角度倍率（Load Factor）',
            formula: 'LF = L / H = 1 / sin θ',
            note: 'θ は水平面からの角度（対水平角）：60° → 1.155× | 45° → 1.414× | 30° → 2.000×（吊り角度60°＝対水平60°、吊り角度90°＝対水平45°、吊り角度120°＝対水平30°）',
          },
          {
            label: '対称2本吊りのスリング脚張力',
            formula: 'T = (W / 2) · (1 / sin θ) = W / (2 · sin θ)',
            note: '各脚の張力は垂直分担荷重（W/2）に角度係数 LF を乗じた値となる',
          },
          {
            label: '水平方向の圧縮力（挟み込み力）',
            formula: 'F_horiz = (W / 2) / tan θ',
            note: '長尺の熱交換器チューブバンドルや薄肉スキッドを座屈させるため、θ < 45° では天秤（スプレッダービーム）を使用する',
          },
        ],
        workedExample: {
          title: '4.2 t 熱交換器バンドルを対水平角 45° と 30° で吊り上げる場合の比較',
          given: [
            '荷の質量 W = 4.2 t (41.2 kN)、重心（CoG）は中央対称（d1 = d2）',
            '基本使用荷重（WLL）3.0 t のベルトスリングを用いた2本ストレート吊り',
          ],
          steps: [
            'θ = 45° の場合：角度係数 LF = 1 / sin(45°) = 1.414。脚張力 T = (4.2 / 2) × 1.414 = 2.97 t（3.0 t WLL の 99% — 限界ギリギリ）。',
            'θ = 30° の場合：角度係数 LF = 1 / sin(30°) = 2.000。脚張力 T = (4.2 / 2) × 2.000 = 4.20 t（3.0 t WLL の 140% — 重大な過荷重！）。',
            'スリング長を伸ばして θ = 60° に改善すると LF = 1.155 となり、脚張力は T = 2.1 × 1.155 = 2.43 t（WLL 比 81%）に低減される。',
          ],
          answer: 'T(60°) = 2.43 t（安全）  |  T(45°) = 2.97 t（注意）  |  T(30°) = 4.20 t（過荷重危険）',
        },
      },
      {
        title: '偏重心（CoGオフセット）と左右スリングの不均等張力',
        summary:
          'ポンプと大型駆動モータを組み合わせたスキッドや非対称減速機ユニットなど、産業機械の重心（Center of Gravity: CoG）が左右の吊り耳（ラグ）の中央にあるとは限りません。荷を揺らさず水平に地切りするためには、クレーンフックを必ず「重心の真上」に配置する必要があり、重心に近い側のスリング脚がより大きな荷重を分担します。',
        equations: [
          {
            label: '脚1・脚2の垂直荷重分担（てこの原理）',
            formula: 'V1 = W · d2 / (d1 + d2)   |   V2 = W · d1 / (d1 + d2)',
            note: 'd1 = ラグ1から重心までの水平距離、d2 = ラグ2から重心までの水平距離',
          },
          {
            label: '非対称吊り時の各脚スリング張力（角度 θ1, θ2）',
            formula: 'T1 = (W · d2) / [(d1 + d2) · sin θ1]   |   T2 = (W · d1) / [(d1 + d2) · sin θ2]',
            note: '重心に近い側の脚は垂直分担荷重が大きく、かつ立ち上がり角度も急になるため最大の張力が作用する',
          },
          {
            label: 'フック鉛直芯出しの静的釣合い則',
            formula: 'x_CoG = x_hook  （静的平衡状態）',
            note: 'フックが重心からずれた状態で巻き上げると、重心がフックの真下に移動するまで荷が横振れし大きく傾く！',
          },
        ],
        workedExample: {
          title: '6.5 t 非対称ギアボックススキッドの左右スリング張力計算',
          given: [
            '総質量 W = 6.5 t、ラグ間隔 D = d1 + d2 = 3.0 m',
            '重量のあるギアボックスにより重心がラグ1側へ偏心：d1 = 1.0 m、d2 = 2.0 m',
            'ラグからのフック高さ H = 2.0 m（フックは重心の真上に配置）',
          ],
          steps: [
            '各スリング長を算出：L1 = √(d1² + H²) = √(1.0² + 2.0²) = 2.236 m (sin θ1 = 2.0 / 2.236 = 0.894)、L2 = √(2.0² + 2.0²) = 2.828 m (sin θ2 = 2.0 / 2.828 = 0.707)。',
            '垂直荷重分担：V1 = 6.5 × (2.0 / 3.0) = 4.333 t、V2 = 6.5 × (1.0 / 3.0) = 2.167 t。',
            '実際のスリング張力：T1 = 4.333 / 0.894 = 4.85 t (47.5 kN)、T2 = 2.167 / 0.707 = 3.06 t (30.1 kN)。',
          ],
          answer: '脚1（重量側）= 4.85 t（5.0 t WLL スリングが必須）、脚2 = 3.06 t。',
        },
      },
      {
        title: 'ヒッチ効率係数（ストレート・チョーカー・バスケット）と ASME B30.9 安全基準',
        summary:
          'スリングの掛け方（ヒッチ方式）によって実効的な使用荷重（WLL）は変化します。垂直ストレート吊りは定格容量の 100%（1.0×）を発揮します。チョーカー吊り（目通し吊り）はアイ部でスリングが鋭く折れ曲がるため容量が約 75%（0.75×）に低下します。垂直バスケット吊り（U字吊り）は1本のスリングにつき2条で荷を支えるため、角度係数を乗じる前の実効容量が 200%（2.0×）になります。',
        equations: [
          {
            label: 'ヒッチ方式別の1脚あたり実効 WLL',
            formula: 'WLL_eff = WLL_rated · η_hitch',
            note: 'ストレート吊り：η = 1.00  |  標準チョーカー吊り（絞り角≥120°）：η = 0.75  |  バスケット吊り：η = 2.00',
          },
          {
            label: 'ASME B30.9 / JIS に基づく安全率（Design Factor）',
            formula: 'WLL = 最小破断荷重 (MBS) / 安全率 SF',
            note: 'ワイヤロープ：SF = 5〜6  |  合金鋼チェーン（G80/G100）：SF = 4  |  繊維ベルトスリング：SF = 5〜7',
          },
          {
            label: 'ASME B30.9 スリング水平角の安全基準',
            formula: 'θ ≥ 60°（推奨・対頂角60°以内）  |  45° ≤ θ < 60°（注意）  |  θ < 30°（使用禁止・対頂角120°超）',
            note: '対水平角 30° 未満（2本吊りの間の吊り角度 120° 超）は厳禁。天秤（スプレッダービーム）を使用すること',
          },
        ],
        workedExample: {
          title: '4.2 t 円筒バンドルのチョーカー吊りにおける安全性検証',
          given: [
            '荷の質量 W = 4.2 t、重心は中央対称（V1 = V2 = 2.1 t）',
            '2本のスリングをチョーカー吊り（η = 0.75）、対水平角 θ = 60° で玉掛け',
            '各スリングの基本使用荷重（ストレート定格 WLL）= 3.0 t',
          ],
          steps: [
            'チョーカー吊り時の1脚あたり実効 WLL を計算：WLL_eff = 3.0 t × 0.75 = 2.25 t。',
            'θ = 60° における各スリング脚の張力を計算：T = (4.2 / 2) / sin(60°) = 2.1 / 0.866 = 2.425 t。',
            '張力 T と実効 WLL_eff を比較：稼働率 = 2.425 / 2.25 = 107.8%（チョーカー係数 0.75× により過荷重！）。5.0 t WLL スリングへ変更（WLL_eff = 3.75 t、稼働率 = 64.7%）。',
          ],
          answer: '3.0 t スリングではチョーカー吊りで 108% の過荷重となるため、5.0 t WLL スリングへの格上げが必要。',
        },
      },
    ],
    practice: [
      {
        prompt:
          '質量 4.0 t の対称スキッドを、対水平角 θ = 30°（間の吊り角度120°）の2本吊りスリングで吊り上げます。各スリング脚に掛かる張力 T（単位：t）を求めてください。',
        hint: 'θ = 30° では sin(30°) = 0.50（張力係数 = 2.0）です。T = (W / 2) / sin θ を使います。',
        solutionSteps: [
          '1脚あたりの垂直分担荷重 V = W / 2 = 4.0 / 2 = 2.0 t',
          '対水平角 30° の角度係数：LF = 1 / sin(30°) = 1 / 0.50 = 2.00',
          '1脚あたりの張力 T = 2.0 t × 2.00 = 4.00 t（各脚に荷の全重量と同じ張力が掛かります！）',
        ],
      },
      {
        prompt:
          '質量 4.2 t の熱交換器バンドルを、対水平角 θ = 60°（間の吊り角度60°）の対称2本吊りで吊り上げます。各スリング脚に掛かる張力 T（単位：t）を計算してください。',
        hint: 'sin(60°) = 0.866（角度係数 = 1.155）です。荷の半分の重量を sin(60°) で割ります。',
        solutionSteps: [
          '1脚あたりの垂直分担荷重 V = 4.2 / 2 = 2.10 t',
          'θ = 60° のとき sin(60°) = 0.8660（LF = 1.1547）',
          '張力 T = 2.10 / 0.8660 = 2.425 t',
        ],
      },
      {
        prompt:
          '質量 6.0 t の非対称ポンプ・モータスキッドがあり、左右の吊り耳（ラグ）の間隔は 3.0 m です。重心（CoG）がラグ1から d1 = 1.0 m、ラグ2から d2 = 2.0 m の位置にあるとき、脚1が分担する垂直荷重 V1（単位：t）はいくらですか？',
        hint: 'てこの原理 V1 = W × d2 / (d1 + d2) を使用します。重心に近い脚がより大きな荷重を受け持ちます。',
        solutionSteps: [
          'ラグ間の全スパン D = d1 + d2 = 1.0 + 2.0 = 3.0 m',
          'V1 = W × (d2 / D) = 6.0 t × (2.0 / 3.0) = 4.00 t',
          '脚2は残りの V2 = 6.0 × (1.0 / 3.0) = 2.00 t を分担します',
        ],
      },
      {
        prompt:
          'ストレート吊り定格 WLL が 3.0 t の繊維ベルトスリングを、標準的なチョーカー吊り（効率係数 0.75×）で使用する場合、実効使用荷重 WLL_eff（単位：t）はいくらになりますか？',
        hint: 'ストレート定格 WLL にチョーカー効率係数 0.75 を掛けます。',
        solutionSteps: [
          '標準チョーカー吊りの効率係数 η_choker = 0.75',
          'WLL_eff = 3.0 t × 0.75 = 2.25 t',
        ],
      },
      {
        prompt:
          '質量 1.8 t の渦巻ポンプスキッドを対水平角 θ = 45°（LF = 1.414）で対称2本吊りします。スリング1脚に作用する張力をキロニュートン（kN）単位で求めてください（g = 9.81 m/s²）。',
        hint: 'まずトン単位の脚張力 T_t = (1.8 / 2) × 1.4142 を求め、それに 9.81 kN/t を掛けます。',
        solutionSteps: [
          'トン単位の脚張力：T = (1.8 / 2) / sin(45°) = 0.90 × 1.4142 = 1.2728 t',
          'kN への換算：T_kN = 1.2728 t × 9.81 kN/t = 12.49 kN',
        ],
      },
    ],
    quiz: [
      {
        question:
          '対称な2本吊りスリングで対水平角 30°（2本間の吊り角度 120°）で荷を吊り上げたとき、各スリング脚1本あたりに作用する張力はどのくらいになりますか？',
        options: [
          '荷の総重量 W の 100% に等しい（W/2 に対して張力係数 2.0 倍）',
          '荷の総重量 W の 50% に等しい',
          '荷の総重量 W の 70.7% に等しい',
          '各脚に荷の総重量 W の 200% が掛かる',
        ],
        correctIndex: 0,
        explanation:
          'T = (W / 2) / sin(30°) であり sin(30°) = 0.5 なので、T = (W / 2) / 0.5 = W となり、スリング1本あたりに荷の全重量と同じ張力が作用します。',
      },
      {
        question:
          '重心（CoG）がラグ2よりもラグ1に近い非対称機械スキッドを吊り上げる際、地切り時に荷が横滑りや傾きを起こさず水平に吊り上がるためには、クレーンフックをどこに位置合わせすべきですか？',
        options: [
          '重心（CoG）の鉛直真上（鉛直線が重心を通る位置）',
          'ラグ1とラグ2のちょうど中間（幾何学的な中央）',
          'ラグ2（軽い方の端部）の真上',
          '左右のスリングの WLL が同じであればフック位置はどこでも傾かない',
        ],
        correctIndex: 0,
        explanation:
          '吊り荷は必ず重心がクレーンフックの真下に来る位置で静的釣合いをとります。地切り前にフックが重心の真上にない場合、荷が振れて重心がフック直下へ移動するまでスキッドが大きく傾きます。',
      },
      {
        question:
          '標準的なチョーカー吊り（目通し吊り）でスリングの使用荷重（WLL）がストレート吊り定格の約 75% に低下する主な理由は何ですか？',
        options: [
          'スリングが自身のアイ部を通過する箇所で鋭い曲げと締め付けが生じ、外周繊維や素線に応力が集中するため',
          'チョーカー吊りは常に対水平角 30° で使用されるため',
          '円筒形の荷を吊ると重力が 25% 増加するため',
          'スリングのアイの半分しかクレーンフックに掛からないため',
        ],
        correctIndex: 0,
        explanation:
          'チョーカー部では小さな曲率半径での折り曲げと局部的なせん断・挟み込みが発生し、素線や繊維間で均一に荷重を分担できなくなるため容量が約 75%（絞り角が120°未満ではさらに低下）に制限されます。',
      },
      {
        question:
          'ASME B30.9 玉掛け安全規格において、絶対に使用してはならない対水平スリング角 θ の下限と、通常の吊り作業で推奨される角度はどれですか？',
        options: [
          '対水平角 30° 未満は禁止；60° 以上を推奨（特別検討なしでは最低 45° 以上）',
          '対水平角 10° 未満は禁止；すべての吊り作業で 30° を推奨',
          '対水平角 60° 未満は禁止；すべての作業で 85° 以上が必須',
          'チョーカー吊りを使用すればどのような角度でも許容される',
        ],
        correctIndex: 0,
        explanation:
          '対水平角 30° 未満（吊り角度 120° 超）では 1/sin θ が急激に発散（LF > 2.0）し、わずかな角度誤差で破断や荷の圧壊を招きます。対水平 60° 以上（吊り角度 60° 以内、LF ≤ 1.155）が標準推奨値です。',
      },
      {
        question:
          'クレーンフックを重心の真上に配置し、同じ高さにある左右のラグで非対称荷を水平に吊り上げた場合、どちらのスリング脚により高い張力が作用しますか？',
        options: [
          '重心に近いラグに接続された、短くて立ち上がり角度が急な側のスリング脚',
          '重心から遠いラグに接続された、長くて角度が緩やかな側のスリング脚',
          '荷が水平であれば左右のスリング張力は常に同じになる',
          '張力はシャックルのピン径のみで決まり、重心位置には依存しない',
        ],
        correctIndex: 0,
        explanation:
          '重心に近い側のラグはてこの原理（V1 = W · d2 / (d1 + d2)）により垂直荷重の大部分を受け持つため、スリング張力もこちら側が最大となります。',
      },
      {
        question:
          '長尺で薄肉の熱交換器チューブバンドルを吊り上げる際、天秤（スプレッダービーム）を使用する最大の力学的メリットは何ですか？',
        options: [
          '荷の吊り耳への引張方向を垂直に変換し、内向きの水平圧縮力（挟み込み力）をゼロにするとともに 1/sin θ の張力倍率を低減する',
          'クレーン巻上モータの出力を2倍にする',
          'クレーンフックを重心から外して配置しても荷が傾かなくなる',
          '吊り耳にシャックルを取り付ける必要がなくなる',
        ],
        correctIndex: 0,
        explanation:
          'スプレッダービームが水平圧縮力をビーム自体の剛性で受け止めるため、下部スリングは垂直（θ = 90°、LF = 1.0）に荷を吊ることができ、機器の座屈損傷を防ぎつつスリング容量を最大限活かせます。',
      },
    ],
  },
});
