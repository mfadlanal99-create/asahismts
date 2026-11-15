import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('bearing-basics', {
  id: {
    title: 'Dasar Jenis & Pemilihan Bantalan (Bearing)',
    shortTitle: 'Jenis Bantalan & Seal',
    description:
      'Lab potongan 2D CAD interaktif untuk bantalan gelinding (Deep Groove, Angular Contact, Silinder, Tirus, Sferikal, Thrust, Pillow Block) lengkap dengan vektor beban radial/aksial, inspeksi seal, dan pencocok aplikasi.',
    explore: [
      {
        title: 'Konstruksi Bantalan Gelinding & Arah Beban',
        summary:
          'Bantalan gelinding terdiri dari empat bagian utama: cincin dalam (inner ring), cincin luar (outer ring), elemen gelinding (bola atau rol), dan sangkar (cage) pemisah elemen. Kenali geometri kontak titik vs kontak garis serta pengaruh sudut kontak (α = 0°, 15°–40°, 90°) terhadap kapasitas beban radial dan aksial.',
        equations: [
          {
            label: 'Aturan Kode Bore ISO (04–96)',
            formula: 'd = Kode_Bore × 5 mm',
            note: 'Contoh: 6205 → 05 × 5 = 25 mm diameter poros.',
          },
          {
            label: 'Kontak Titik (Bola: 6205, 7205, 51105) vs Kontak Garis (Rol: NU205, 30205, 22205)',
            formula: 'Kontak Titik → Gesekan Rendah / RPM Tinggi | Kontak Garis → Cr & Tahan Kejut Tinggi',
            note: 'Bantalan bola memiliki gesekan sangat rendah; rol silinder, tirus, dan tong menyalurkan beban lewat kontak garis.',
          },
          {
            label: 'Arah Beban Sudut Kontak (α)',
            formula: 'α = 0° (Radial) | α = 40° (Kombinasi Radial + Aksial) | α = 90° (Aksial Murni)',
            note: 'Deep groove & NU untuk radial utama; angular contact & tirus untuk beban kombinasi; 51105 HANYA untuk aksial murni dan rusak fatal jika diberi beban radial.',
          },
        ],
      },
      {
        title: 'Pelindung & Seal: Open vs 2Z (Perisai Baja) vs 2RS (Seal Karet)',
        summary:
          'Pemilihan pelindung bantalan adalah kompromi antara proteksi kontaminan dan gesekan bibir pada putaran tinggi.',
        equations: [
          {
            label: 'Bantalan Terbuka (Open)',
            formula: 'Tanpa Seal / Perisai → Batas Putaran 100%',
            note: 'Mengandalkan pelumasan oli eksternal dari bak roda gigi sehingga mendukung putaran tertinggi dan pembilasan oli mudah.',
          },
          {
            label: '2Z / ZZ (Perisai Baja Ganda)',
            formula: 'Celah Baja Non-Kontak → Nol Gesekan Bibir',
            note: 'Pelat baja berpresisi dengan celah mikro tanpa kontak menjaga RPM tetap tinggi sekaligus menahan serpihan kasar.',
          },
          {
            label: '2RS / 2RSH (Seal Karet Ganda)',
            formula: 'Bibir Karet NBR Kontak → Batas RPM Turun ~30–40%',
            note: 'Bibir karet nitril menekan cincin dalam, menahan debu halus, lumpur, dan cipratan air sambil menjaga gemuk pabrik.',
          },
        ],
      },
      {
        title: 'Pemuaian Termal, Self-Alignment & Unit Pillow Block',
        summary:
          'Poros nyata melentur saat dibebani dan memanjang saat panas—memilih bantalan sisi bebas atau swa-selaras mencegah macetnya rumah bantalan.',
        equations: [
          {
            label: 'Sisi Bebas Pemuaian Termal (NU205)',
            formula: 'Cincin Dalam Tanpa Bibir → Geser Aksial Bebas',
            note: 'Poros dapat bergeser aksial di dalam bantalan saat memuai akibat panas tanpa menjepit bantalan pengunci di ujung berlawanan.',
          },
          {
            label: 'Rol Tong Swa-Selaras (22205)',
            formula: 'Lintasan Luar Sferis → Toleransi Kemiringan ±1,5°–2°',
            note: 'Lintasan luar berbentuk sferis memungkinkan cincin dalam miring mengikuti lendutan rangka konveyor atau pemecah batu.',
          },
          {
            label: 'Unit Pillow Block (UCP205)',
            formula: 'Bantalan UC205 Berseal + Rumah Besi Cor Berbaut',
            note: 'Sudah dilengkapi dudukan sferis dan baut pengunci poros—praktis untuk pemasangan cepat pada rangka mesin.',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Sebuah motor listrik memakai bantalan bola alur dalam 6205-2RS (kode bore ISO 05). Sesuai standar penomoran ISO, berapa diameter lubang poros d dalam milimeter?',
        hint: 'Untuk kode bore ISO 04 ke atas, kalikan dua digit terakhir dengan 5 mm.',
        solutionSteps: ['d = 05 × 5 = 25 mm.'],
      },
      {
        id: 'p2',
        prompt:
          'Bantalan 6205 memiliki diameter lubang d = 25 mm dan diameter luar D = 52 mm. Hitung tinggi penampang radial satu sisi H = (D − d) / 2 dalam milimeter.',
        hint: 'Kurangkan diameter lubang d dari diameter luar D, lalu bagi 2.',
        solutionSteps: ['H = (52 − 25) / 2 = 27 / 2 = 13,5 mm.'],
      },
      {
        id: 'p3',
        prompt:
          'Bantalan rol sferikal 22205 memiliki d = 25 mm dan D = 52 mm. Hitung diameter rata-rata (pitch) d_m = (d + D) / 2 untuk faktor kecepatan pelumasan gemuk n·d_m.',
        hint: 'Hitung rata-rata aritmetika dari d dan D.',
        solutionSteps: ['d_m = (25 + 52) / 2 = 38,5 mm.'],
      },
      {
        id: 'p4',
        prompt:
          'Bantalan Bola Kontak Sudut 7205 (α = 40°) menerima beban radial murni Fr = 10 kN pada poros pompa. Hitung gaya dorong aksial terinduksi Fa = Fr · tan(40°) di dalam satu bantalan.',
        hint: 'Kalikan Fr = 10 kN dengan tan(40°) ≈ 0,8391.',
        solutionSteps: [
          'Fa = 10 × tan(40°) = 10 × 0,8391 ≈ 8,39 kN (harus ditahan oleh bantalan pasangan!).',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Bantalan 6205 open/2Z memiliki batas putaran gemuk 14.000 RPM, sedangkan versi seal kontak 2RS dibatasi hingga 8.500 RPM akibat gesekan bibir. Berapa persen penurunan batas putaran dari 2Z ke 2RS?',
        hint: 'Hitung ((14000 − 8500) / 14000) × 100.',
        solutionSteps: ['Penurunan = (14.000 − 8.500) / 14.000 × 100 = 39,29% ≈ 39,3%.'],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Mengapa bantalan dorong 51105 Thrust Ball Bearing langsung rusak fatal jika diberi beban radial berat?',
        options: [
          'Cincin lintasan 90° tegak lurus poros tidak mampu menahan bola secara radial sehingga bola keluar jalur.',
          'Karena sangkarnya terbuat dari kuningan bukan baja.',
          'Diameter luarnya terlalu kecil untuk melepas panas.',
          'Seal karet 2RS pecah akibat defleksi radial.',
        ],
        explanation:
          'Bantalan dorong memiliki washer datar tegak lurus sumbu poros (α = 90°). Gaya radial mendorong bola lepas ke samping keluar dari alur dangkal.',
      },
      {
        id: 'q2',
        question:
          'Mengapa bantalan rol silinder NU205 dipilih untuk sisi bebas (non-locating) pada poros motor listrik panjang yang panas?',
        options: [
          'Cincin dalam tanpa bibir memungkinkan poros memuai dan bergeser aksial tanpa menjepit bantalan.',
          'Mampu menahan gaya aksial bolak-balik sangat besar.',
          'Toleran terhadap ketidaksejajaran rumah hingga 5°.',
          'Menggunakan kontak titik untuk kapasitas radial minimal.',
        ],
        explanation:
          'Tipe NU memiliki dua bibir di cincin luar dan nol bibir di cincin dalam sehingga pemuaian panjang poros berlangsung bebas secara internal.',
      },
      {
        id: 'q3',
        question:
          'Saat memasang bantalan 7205 (Kontak Sudut 40°) atau 30205 (Rol Tirus) pada poros, mengapa hampir selalu dipasang berpasangan (DB atau DF)?',
        options: [
          'Satu bantalan bersudut hanya menahan gaya aksial satu arah dan menimbulkan gaya aksial terinduksi yang harus dilawan pasangan cerminnya.',
          'Karena satu bantalan tidak muat pada poros standar 25 mm tanpa selongsong.',
          'Untuk mengubah kontak garis menjadi kontak titik berfriksi rendah.',
          'Agar tidak memerlukan pelumasan gemuk atau oli.',
        ],
        explanation:
          'Bantalan baris tunggal 7205 dan 30205 bersifat asimetris: hanya menahan dorong satu arah sehingga butuh pasangan berlawanan untuk mengunci poros dua arah.',
      },
      {
        id: 'q4',
        question:
          'Pelindung bantalan manakah yang paling tahan terhadap cipratan air berlumpur di konveyor meskipun batas RPM maksimumnya lebih rendah?',
        options: [
          'Seal karet kontak ganda 2RS (NBR)',
          'Perisai baja non-kontak ganda 2Z',
          'Bantalan terbuka (Open)',
          'Perisai baja satu sisi Z',
        ],
        explanation:
          'Bibir karet kontak 2RS menekan langsung cincin dalam untuk menutup celah terhadap air, lumpur, dan debu halus.',
      },
      {
        id: 'q5',
        question:
          'Jenis bantalan manakah yang kuat menahan beban kejut berat SEKALIGUS mampu menoleransi ketidaksejajaran poros ±1,5° akibat lenturan rangka?',
        options: [
          'Bantalan Rol Sferikal 22205',
          'Bantalan Bola Alur Dalam 6205',
          'Bantalan Rol Silinder NU205',
          'Bantalan Bola Dorong 51105',
        ],
        explanation:
          'Bantalan rol sferikal memadukan rol tong berkapasitas tinggi dengan lintasan luar bulat yang dapat berputar miring mengikuti defleksi poros.',
      },
      {
        id: 'q6',
        question:
          'Teknisi perlu memasang poros konveyor 25 mm secara cepat di atas kanal baja datar tanpa membubut rumah bantalan presisi. Unit manakah yang paling tepat?',
        options: [
          'Unit Pillow Block UCP205',
          'Bantalan Bola Dorong 51105',
          'Bantalan Bola Kontak Sudut 7205',
          'Bantalan Rol Tirus Terbuka 30205',
        ],
        explanation:
          'Unit pillow block UCP205 mengemas bantalan UC205 berseal di dalam rumah besi cor siap baut lengkap dengan dudukan sferis dan baut pengunci poros.',
      },
    ],
  },
  ja: {
    title: '転がり軸受の種類と選定の基礎',
    shortTitle: '軸受の種類とシール',
    description:
      '深溝玉、アンギュラ玉、円筒ころ、円すいころ、自動調心ころ、スラスト玉、ピロー形ユニットを2D CAD断面で比較する学習ラボ。ラジアル/アキシアル荷重ベクトル、防じんシール比較、用途選定マッチャーを搭載。',
    explore: [
      {
        title: '転がり軸受の構造と荷重負荷方向',
        summary:
          '転がり軸受は内輪・外輪・転動体（玉またはころ）・保持器（ケージ）の4要素から構成されます。玉（点接触）ところ（線接触）の違いや、接触角（α = 0°, 15°–40°, 90°）によるラジアル・アキシアル荷重の分担を理解します。',
        equations: [
          {
            label: 'ISO内径番号ルール（04〜96）',
            formula: 'd = 番号 × 5 mm',
            note: '例：6205 → 05 × 5 = 25 mm 内径。',
          },
          {
            label: '点接触（玉：6205・7205・51105） vs 線接触（ころ：NU205・30205・22205）',
            formula: '点接触 → 低摩擦・高速回転 | 線接触 → 高動定格荷重 Cr・耐衝撃性',
            note: '玉軸受は転がり摩擦が極めて小さく、ころ軸受は円筒・円すい・たる形ころによる線接触で高荷重を支えます。',
          },
          {
            label: '接触角（α）と荷重方向',
            formula: 'α = 0°（ラジアル） | α = 40°（複合荷重） | α = 90°（純アキシアル専用）',
            note: '深溝・NUは主にラジアル向け、アンギュラ・円すいころは複合荷重向け、51105スラストはラジアル荷重が加わると脱線破損します。',
          },
        ],
      },
      {
        title: 'シールドと接触シール：開放形 vs 2Z（鋼板シールド） vs 2RS（ゴムシール）',
        summary:
          '密封形式の選定は、異物・水分に対する防じん性と高速時の接触摩擦発熱とのトレードオフです。',
        equations: [
          {
            label: '開放形（Open）',
            formula: 'シール無し → 許容回転数 100%',
            note: 'ギアボックス内の油浴潤滑などで最高の許容回転数と油循環冷却を実現します。',
          },
          {
            label: '2Z / ZZ（両側鋼板シールド）',
            formula: '非接触微小すきま → リップ摩擦ゼロ',
            note: '外輪固定の鋼板が内輪と非接触で微小すきまを保ち、高速性を維持しつつ粗大な切粉や粉じんを防ぎます。',
          },
          {
            label: '2RS / 2RSH（両側接触ゴムシール）',
            formula: '接触NBRリップ → 許容回転数 約30〜40%低下',
            note: 'ゴムリップが内輪肩部に接触し、泥水や微粉を強力に遮断して封入グリースを保持します。',
          },
        ],
      },
      {
        title: '熱膨張の自由端・自動調心・ピローブロックユニット',
        summary:
          '実際の機械軸は荷重でたわみ、発熱で軸方向に伸びるため、自由端軸受や調心機能による拘束回避が不可欠です。',
        equations: [
          {
            label: '熱膨張対応の自由端（NU205）',
            formula: 'つば無し内輪 → 軸方向自由移動',
            note: '内輪につばが無いため、軸の温度上昇による伸びを軸受内部でスムーズに逃がし焼付きを防ぎます。',
          },
          {
            label: '自動調心ころ軸受（22205）',
            formula: '球面外輪軌道 → ±1.5°〜2° の傾き許容',
            note: 'コンベヤや破砕機フレームのたわみによる軸ミスアライメントを自動吸収します。',
          },
          {
            label: 'ピロー形ユニット（UCP205）',
            formula: '密封UC205インサート + 鋳鉄製ボルト止めハウジング',
            note: '球面外径・グリース封入済みの既製ユニットで、機械架台への迅速な据付に最適です。',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '電動機に使用される深溝玉軸受 6205-2RS（ISO内径番号 05）の軸穴径（内径）d は何 mm ですか？',
        hint: 'ISO内径番号04以上では、下2桁に 5 mm を掛けます。',
        solutionSteps: ['d = 05 × 5 = 25 mm。'],
      },
      {
        id: 'p2',
        prompt:
          '6205軸受の内径 d = 25 mm、外径 D = 52 mm のとき、片側断面高さ H = (D − d) / 2 を mm 単位で求めてください。',
        hint: '外径 D から内径 d を引き、2で割ります。',
        solutionSteps: ['H = (52 − 25) / 2 = 27 / 2 = 13.5 mm。'],
      },
      {
        id: 'p3',
        prompt:
          '自動調心ころ軸受 22205（d = 25 mm, D = 52 mm）の、グリース再給脂間隔指標 n·d_m に用いるピッチ円直径 d_m = (d + D) / 2 を求めてください。',
        hint: '内径 d と外径 D の平均値を計算します。',
        solutionSteps: ['d_m = (25 + 52) / 2 = 38.5 mm。'],
      },
      {
        id: 'p4',
        prompt:
          'ポンプ軸の単列アンギュラ玉軸受 7205（接触角 α = 40°）に純ラジアル荷重 Fr = 10 kN が作用したとき、軸受内部で誘起されるアキシアル分力 Fa = Fr · tan(40°) を計算してください。',
        hint: 'Fr = 10 kN に tan(40°) ≈ 0.8391 を掛けます。',
        solutionSteps: [
          'Fa = 10 × tan(40°) = 10 × 0.8391 ≈ 8.39 kN（対向組合せ軸受で受ける必要があります）。',
        ],
      },
      {
        id: 'p5',
        prompt:
          '6205 開放/2Z のグリース許容回転数は 14,000 RPM であるのに対し、接触シール 2RS ではリップ摩擦により 8,500 RPM に制限されます。2Z から 2RS への変更による許容回転数の低下率（%）を求めてください。',
        hint: '((14000 − 8500) / 14000) × 100 を計算します。',
        solutionSteps: ['低下率 = (14,000 − 8,500) / 14,000 × 100 = 39.29% ≈ 39.3%。'],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          '51105 スラスト玉軸受に大きなラジアル荷重が加わると急速に破損する理由は何ですか？',
        options: [
          '接触角90°の平座金軌道はラジアル方向の拘束力がなく、玉が軌道溝から脱線するため。',
          '黄銅保持器が熱膨張するため。',
          '外径が小さく放熱が追いつかないため。',
          '2RSゴムシールがラジアル変位で破損するため。',
        ],
        explanation:
          'スラスト玉軸受は軸に垂直な平板軌道（α=90°）のため、ラジアル荷重が加わると玉が横方向へ押し出され脱落します。',
      },
      {
        id: 'q2',
        question:
          '高温になる大型電動機軸の自由端（非固定側）に NU205 円筒ころ軸受が多用される理由は何ですか？',
        options: [
          'つば無し内輪により、軸の熱膨張伸びを軸受内部で無理なく逃がせるため。',
          '両方向の大きなスラスト荷重を拘束できるため。',
          '最大5°のハウジング傾きを許容するため。',
          '点接触によりラジアル容量を最小限に抑えるため。',
        ],
        explanation:
          'NU形は外輪に両つば・内輪につば無しの構造で、軸の温度変化による伸縮を内部でスムーズに吸収できます。',
      },
      {
        id: 'q3',
        question:
          '7205（40°アンギュラ玉）や 30205（円すいころ）を軸に組む際、ほとんどの場合に背面組合せ（DB）や正面組合せ（DF）のペアで使う理由は何ですか？',
        options: [
          '単列斜め軌道は一方向のアキシアル荷重しか受けられず、ラジアル荷重による誘起スラスト力を対向軸受で相殺する必要があるため。',
          '単体では標準25mm軸にアダプターなしで嵌合できないため。',
          '線接触を低摩擦の点接触へ変換するため。',
          'グリースや油潤滑を不要にするため。',
        ],
        explanation:
          '7205と30205は非対称軌道のため単体では一方向スラストのみ支持可能であり、両方向の位置決めには対向ペア配置が必須です。',
      },
      {
        id: 'q4',
        question:
          'コンベヤの泥水や高圧洗浄がかかる環境において、許容回転数が下がっても最も優れた保護性能を発揮する密封形式はどれですか？',
        options: [
          '2RS 両側接触ニトリルゴムシール',
          '2Z 両側非接触鋼板シールド',
          '開放形（Open）',
          '片側鋼板シールド（Z）',
        ],
        explanation:
          '2RSの接触ゴムリップが内輪肩部に密着し、泥水・洗浄水・微細粉じんの侵入を防ぎます。',
      },
      {
        id: 'q5',
        question:
          '重い衝撃荷重を受けながら、フレームたわみ等による ±1.5° の軸ミスアライメントも許容できる軸受はどれですか？',
        options: [
          '22205 自動調心ころ軸受',
          '6205 深溝玉軸受',
          'NU205 円筒ころ軸受',
          '51105 スラスト玉軸受',
        ],
        explanation:
          '自動調心ころ軸受は高容量のたる形ころと球面外輪軌道の組合せにより、大きな衝撃荷重と軸の傾きを同時に吸収します。',
      },
      {
        id: 'q6',
        question:
          '精密な軸受穴加工を行わずに、25 mm コンベヤテールプーリ軸を平鋼チャンネルフレームへ迅速にボルト固定したい場合、最適な形式はどれですか？',
        options: [
          'UCP205 ピロー形軸受ユニット',
          '51105 スラスト玉軸受',
          '7205 アンギュラ玉軸受',
          '開放形 30205 円すいころ軸受',
        ],
        explanation:
          'UCP205は球面外径・密封グリース封入済みのUC205軸受を鋳鉄製ボルト固定ハウジングに収めたユニットで、機械架台への据付が容易です。',
      },
    ],
  },
});
