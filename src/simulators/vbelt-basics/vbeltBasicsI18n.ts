import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('vbelt-basics', {
  id: {
    title: 'Dasar Sabuk-V & Sabuk Penggerak',
    shortTitle: 'Sabuk-V & Fisika Baji',
    description:
      'Lab penampang 2D CAD interaktif untuk sabuk penggerak industri (Klasik A/B/C, Narrow Wedge SPZ/SPA/SPB, Cogged AX/BX, Timing HTD 5M/8M, Poly-V PJ/PK, Flat) lengkap dengan fisika efek baji, diagnosis kegagalan bottoming-out, dan dekoder kode sabuk.',
    explore: [
      {
        title: 'Efek Baji V-Belt & Kegagalan Fatal "Bottoming-Out"',
        summary:
          'V-belt TIDAK boleh menyentuh dasar alur puli! Daya diteruskan sepenuhnya melalui jepitan dinding samping miring pada lereng alur V. Pahami bagaimana efek baji melipatgandakan gesekan semu (μ′ = μ / sin β) serta cara mendiagnosis alur puli aus sebelum sabuk terbakar.',
        equations: [
          {
            label: 'Gaya Normal Dinding & Gesekan Semu Efek Baji',
            formula: "F_n = T / (2 · sin β)   |   μ' = μ / sin β",
            note: 'Untuk 2β = 36° (β = 18°, sin 18° = 0,309), tarikan radial T dilipatgandakan ~3× dan μ′ melonjak dari ~0,30 menjadi ~0,90–1,05.',
          },
          {
            label: 'Bencana Bottoming-Out',
            formula: "Celah Dasar c → 0 mm  ⇒  μ' jatuh ke ~0,30",
            note: 'Saat alur puli aus melebar atau sabuk terlalu sempit menyentuh dasar alur, efek baji runtuh seketika dan selip membakar sabuk.',
          },
        ],
      },
      {
        title: 'Profil Sabuk Penggerak Industri: Klasik, Narrow, Cogged, Timing & Poly-V',
        summary:
          'Sistem transmisi modern memiliki berbagai keluarga sabuk yang dirancang untuk densitas daya tinggi, puli kecil, atau sinkronisasi tanpa selip.',
        equations: [
          {
            label: 'Klasik Terbungkus (A, B, C) & Narrow Wedge (SPZ, SPA, SPB)',
            formula: '40° Klasik (13×8, 17×11, 22×14) vs 38° Narrow Wedge (Daya 2–3×)',
            note: 'Sabuk klasik melayani kipas dan pompa umum; profil dalam SPZ/SPA/SPB menyalurkan daya tinggi pada puli ramping.',
          },
          {
            label: 'Cogged Raw-Edge (AX, BX)',
            formula: 'Gerigi Bawah Cetak → ~15°C Lebih Dingin di Puli Kecil',
            note: 'Sisi karet terbuka meningkatkan cengkeraman sementara lekukan gerigi menurunkan stres tekuk pada puli kecil.',
          },
          {
            label: 'Timing Sinkron (HTD 5M, 8M) & Poly-V (PJ, PK)',
            formula: 'Pengaitan Gigi Kurvilinear / Rusuk Mikro Serpentin Lentur',
            note: 'HTD mengunci puli dengan nol selip dan beban bantalan rendah; Poly-V sangat lentur untuk puli serpentin rapat.',
          },
        ],
      },
      {
        title: 'Membaca Kode Sabuk, Panjang Pitch & Pemeriksaan Puli',
        summary:
          'Memahami kode standar pabrikan mencegah kesalahan pemesanan antara panjang dalam inci (Imperial) dan panjang pitch metrik (mm).',
        equations: [
          {
            label: 'Jumlah Gigi Timing Belt',
            formula: 'N = L_pitch / p',
            note: 'Contoh: HTD 8M-800 → pitch 8 mm × panjang pitch 800 mm = 100 gigi.',
          },
          {
            label: 'Kode Klasik / Cogged Imperial (mis. B-65, AX-42)',
            formula: 'L_i (mm) = Kode_Inci × 25,4',
            note: 'Huruf menunjukkan penampang dan angka adalah keliling dalam dalam inci (65 in × 25,4 = 1.651 mm).',
          },
          {
            label: 'Kode Narrow Wedge Metrik & Poly-V (SPA-1250, 6PK-1840)',
            formula: 'Angka Belakang = Panjang Pitch / Efektif (mm)',
            note: 'SPA-1250 berpanjang pitch 1.250 mm; 6PK-1840 memiliki 6 rusuk PK sepanjang 1.840 mm.',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Sebuah V-belt Klasik tipe B dengan gesekan dasar karet μ = 0,30 berjalan pada alur puli bersudut 2β = 36° (setengah sudut β = 18°). Hitung koefisien gesek semu efek baji μ′ = μ / sin(18°).',
        hint: 'Hitung sin(18°) ≈ 0,3090, lalu bagi 0,30 dengan 0,3090.',
        solutionSteps: [
          "μ' = 0,30 / sin(18°) = 0,30 / 0,3090 ≈ 0,97 (lebih dari 3× lipat daya cengkeram sabuk datar!).",
        ],
      },
      {
        id: 'p2',
        prompt:
          'Sabuk sempit SPA menerima gaya tarik radial T = 600 N masuk ke dalam alur puli 36° (setengah sudut β = 18°). Hitung gaya tekan normal Fn = T / (2 · sin 18°) pada MASING-MASING dinding samping alur.',
        hint: 'Masukkan T = 600 N dan sin(18°) = 0,3090 ke dalam Fn = 600 / (2 × 0,3090).',
        solutionSteps: ['Fn = 600 / (2 × 0,3090) = 600 / 0,6180 ≈ 970,8 N per dinding samping.'],
      },
      {
        id: 'p3',
        prompt:
          'Puli berdiameter pitch D = 125 mm berputar pada 1450 RPM menggerakkan V-belt tipe A. Hitung kecepatan linier sabuk V = (π · D · N) / 60.000 dalam m/s.',
        hint: 'Ubah D = 125 mm menjadi 0,125 m, atau hitung π × 125 × 1450 / 60000.',
        solutionSteps: ['V = (π × 125 × 1450) / 60.000 = 569.413,7 / 60.000 ≈ 9,49 m/s.'],
      },
      {
        id: 'p4',
        prompt:
          'Dekode kode sabuk-V klasik "B-65": berapa panjang keliling dalam nominalnya dalam milimeter? (1 inci = 25,4 mm)',
        hint: 'Pada kode V-belt klasik Imperial, angka setelah tanda hubung adalah panjang dalam inci.',
        solutionSteps: ['65 inci × 25,4 mm/inci = 1.651,0 mm panjang keliling dalam.'],
      },
      {
        id: 'p5',
        prompt:
          'Dekode kode sabuk timing sinkron "HTD 8M-800": dengan jarak antar gigi (pitch) 8 mm dan panjang pitch 800 mm, berapa jumlah total gigi pada sabuk tersebut?',
        hint: 'Bagikan panjang pitch (800 mm) dengan jarak pitch gigi (8 mm).',
        solutionSteps: ['Jumlah gigi N = 800 mm / 8 mm = 100 gigi.'],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Apa yang langsung terjadi ketika V-belt turun cukup dalam hingga menyentuh dasar alur puli ("bottoming out")?',
        options: [
          'Tekanan efek baji dinding samping runtuh, gesekan semu jatuh ke level sabuk datar (~0,30), dan selip parah membakar sabuk.',
          'Kapasitas transmisi daya berlipat ganda karena tiga sisi bersentuhan.',
          'Sabuk otomatis memusat dan menurunkan beban poros bantalan.',
          'Sudut alur puli melebar dari 38° menjadi 60°.',
        ],
        explanation:
          'V-belt yang sehat TIDAK PERNAH boleh menyentuh dasar alur. Bottoming out memutus efek baji samping sehingga terjadi selip dan panas berlebih.',
      },
      {
        id: 'q2',
        question:
          'Mengapa sabuk timing sinkron HTD 8M memerlukan tegangan awal statis jauh lebih kecil dibanding V-belt Klasik untuk torsi poros yang sama?',
        options: [
          'Penguncian mekanis gigi-ke-alur mentransmisikan torsi tanpa mengandalkan gesekan baji dinding samping yang tinggi.',
          'Sabuk timing memiliki sudut baji 45° yang melipatempatkan gaya normal.',
          'Sabuk timing terendam oli di dalam puli.',
          'Kawat sabuk timing memuai saat berputar untuk mengencangkan diri.',
        ],
        explanation:
          'Sabuk sinkron menyalurkan daya lewat pengaitan gigi secara positif sehingga gaya tarik awal dan beban radial pada bantalan poros jauh lebih rendah.',
      },
      {
        id: 'q3',
        question:
          'Dibandingkan sabuk Klasik tipe A (13 × 8 mm), mengapa sabuk Narrow Wedge SPA (12,7 × 10 mm) mampu menyalurkan daya jauh lebih besar per jalur?',
        options: [
          'Penampang lebih dalam memberi bidang kontak dinding samping lebih luas dan menopang kawat tarik berkekuatan tinggi tepat di atas lereng alur.',
          'Sabuk SPA sengaja menyentuh dasar alur untuk traksi tambahan.',
          'Sabuk SPA tidak memiliki kawat tarik dan lebih elastis.',
          'Bekerja dengan sudut kontak datar 90°.',
        ],
        explanation:
          'Profil tinggi-ramping (SPZ, SPA, SPB) mendistribusikan tekanan baji secara merata sepanjang kawat tarik sehingga densitas dayanya unggul.',
      },
      {
        id: 'q4',
        question:
          'Saat meliliti puli motor berdiameter kecil, mengapa sabuk Cogged Raw-Edge (AX atau BX) lebih unggul dibanding sabuk terbungkus Klasik (A atau B)?',
        options: [
          'Gerigi cetak di bagian bawah menurunkan panas lentur dan stres tekuk, sementara sisi karet terbuka memberi gesekan lebih tinggi.',
          'Sabuk cogged berfungsi sebagai sabuk timing bergigi tanpa selip.',
          'Sabuk cogged lebih lebar daripada tipe C.',
          'Sabuk cogged tidak memerlukan dinding alur puli.',
        ],
        explanation:
          'Gerigi bawah (cogs) membuat sabuk mudah menekuk di sekitar puli kecil dengan panas internal jauh lebih rendah dan umur kelelahan lebih panjang.',
      },
      {
        id: 'q5',
        question:
          'Pada mesin cuci atau sistem penggerak aksesori serpentin otomotif dengan puli pembalik rapat dan putaran tinggi, keluarga sabuk manakah yang paling sesuai?',
        options: [
          'Sabuk Poly-V Multi-Rib (PJ / PK)',
          'V-Belt Klasik Terbungkus Tipe C',
          'Sabuk Datar Kulit Berat',
          'V-Belt Tunggal Tipe B',
        ],
        explanation:
          'Sabuk Poly-V (PJ, PK) memadukan banyak rusuk mikro-V dengan punggung tipis yang sangat lentur untuk melewati puli kecil dan idler punggung.',
      },
      {
        id: 'q6',
        question:
          'Saat inspeksi berkala, teknisi memeriksa dengan pengukur alur dan mendapati dinding alur puli sudah cekung aus serta sabuk duduk di bawah bibir puli. Tindakan yang benar adalah?',
        options: [
          'Ganti puli (sheave) yang aus bersamaan dengan sabuk baru—memasang sabuk baru saja akan langsung bottoming out dan cepat rusak.',
          'Kencangkan tegangan sabuk 50% lebih tinggi untuk mengompensasi keausan.',
          'Oleskan gemuk pelumas pada dasar alur puli.',
          'Ganti dengan sabuk SPZ yang lebih sempit di dalam alur B yang lebar.',
        ],
        explanation:
          'Dinding alur yang aus cekung membuat sabuk baru turun terlalu dalam sehingga kehilangan kontak baji yang benar dan cepat selip terbakar.',
      },
    ],
  },
  ja: {
    title: 'Vベルト・伝動ベルトの基礎',
    shortTitle: 'Vベルトとくさび効果',
    description:
      '産業用伝動ベルト（クラシック A/B/C、細幅ウェッジ SPZ/SPA/SPB、コグド AX/BX、タイミング HTD 5M/8M、ポリV PJ/PK、平ベルト）を2D CAD断面で学ぶラボ。側壁くさび効果、底突き（ボトミング）故障診断、ベルトコード解読器を搭載。',
    explore: [
      {
        title: 'Vベルトのくさび効果と「底突き（Bottoming-Out）」重大故障',
        summary:
          'Vベルトはプーリ溝の底面に接触させてはいけません！動力はすべて傾斜した側壁がV溝側面へ半径方向に食い込む力で伝達されます。見かけ摩擦係数（μ′ = μ / sin β）の増幅原理と底突き故障の兆候を学びます。',
        equations: [
          {
            label: '側壁垂直抗力とくさび見かけ摩擦係数',
            formula: "F_n = T / (2 · sin β)   |   μ' = μ / sin β",
            note: '2β = 36°（β = 18°, sin 18° = 0.309）のとき、張力 T が約3倍の垂直抗力となり μ′ が約 0.90〜1.05 へ上昇します。',
          },
          {
            label: '底突き（Bottoming-Out）故障',
            formula: "底すきま c → 0 mm  ⇒  μ' が約 0.30 へ急落",
            note: 'プーリ溝の摩耗拡大や細すぎるベルトにより底面が溝底へ接触すると、くさび効果が消滅しスリップ焼損を引き起こします。',
          },
        ],
      },
      {
        title: '産業用ベルト断面形式：クラシック・細幅・コグ・タイミング・ポリV',
        summary:
          '駆動条件（高出力密度・小径プーリ・同期精度）に応じて多様なベルト断面が使い分けられます。',
        equations: [
          {
            label: 'クラシック（A, B, C）＆ 細幅ウェッジ（SPZ, SPA, SPB）',
            formula: '40°クラシック vs 38°細幅深溝（伝動能力 2〜3倍）',
            note: '汎用ファンやポンプ向けのクラシックと、高強度心線で省スペース設計が可能な細幅ウェッジを比較します。',
          },
          {
            label: 'ローエッジコグベルト（AX, BX）',
            formula: '底面コグ刻み → 小径プーリでも発熱約15°C低減',
            note: '切り放しゴム側面による高摩擦と底面コグによる曲げ応力低減で小径駆動に優れます。',
          },
          {
            label: 'タイミングベルト（HTD 5M, 8M）＆ ポリV（PJ, PK）',
            formula: '円弧歯の積極噛合い / 多リブ高柔軟サーペンタイン',
            note: 'HTD歯はスリップゼロと低軸荷重を実現；ポリVは小径背面アイドラ駆動に最適です。',
          },
        ],
      },
      {
        title: 'ベルト規格コードの解読・ピッチ長さ・プーリ点検',
        summary:
          'インチ内周基準とミリピッチ基準の規格表記を正しく読み分けることが保守交換ミス防止の鍵です。',
        equations: [
          {
            label: 'タイミングベルト歯数',
            formula: 'N = L_pitch / p',
            note: '例：HTD 8M-800 → 歯ピッチ 8 mm × ピッチ長 800 mm = 100 歯。',
          },
          {
            label: 'インチ系クラシック / コグ表記（例：B-65, AX-42）',
            formula: 'L_i (mm) = インチ数値 × 25.4',
            note: '英字が断面、数値が内周長（インチ）を表します（65 in × 25.4 = 1,651 mm）。',
          },
          {
            label: 'ミリ系細幅ウェッジ・ポリV（SPA-1250, 6PK-1840）',
            formula: '末尾数値 = ピッチ長 / 有効長 (mm)',
            note: 'SPA-1250 は基準ピッチ長 1,250 mm、6PK-1840 は PK形 6リブ・有効長 1,840 mm です。',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'ゴム基本摩擦係数 μ = 0.30 のクラシック B形 Vベルトが、溝角度 2β = 36°（半角 β = 18°）のプーリ溝で駆動しています。くさび効果による見かけ摩擦係数 μ′ = μ / sin(18°) を計算してください。',
        hint: 'sin(18°) ≈ 0.3090 を求め、0.30 を 0.3090 で割ります。',
        solutionSteps: [
          "μ' = 0.30 / sin(18°) = 0.30 / 0.3090 ≈ 0.97（平ベルトの3倍以上のグリップ力！）。",
        ],
      },
      {
        id: 'p2',
        prompt:
          '細幅 SPA Vベルトが半径方向張力 T = 600 N で 36° プーリ溝（半角 β = 18°）に引き込まれています。片側フランジ側壁に作用する垂直抗力 Fn = T / (2 · sin 18°) を求めてください。',
        hint: 'T = 600 N と sin(18°) = 0.3090 を Fn = 600 / (2 × 0.3090) に代入します。',
        solutionSteps: ['Fn = 600 / (2 × 0.3090) = 600 / 0.6180 ≈ 970.8 N（片側壁あたり）。'],
      },
      {
        id: 'p3',
        prompt:
          'ピッチ円直径 D = 125 mm のプーリが 1450 RPM で回転して A形 Vベルトを駆動するとき、ベルト周速度 V = (π · D · N) / 60,000 を m/s 単位で求めてください。',
        hint: 'D = 125 mm を 0.125 m に換算するか、π × 125 × 1450 / 60000 を計算します。',
        solutionSteps: ['V = (π × 125 × 1450) / 60,000 = 569,413.7 / 60,000 ≈ 9.49 m/s。'],
      },
      {
        id: 'p4',
        prompt:
          'クラシックVベルトコード「B-65」を解読し、公称内周長さをミリメートル（mm）で求めてください。（1 インチ = 25.4 mm）',
        hint: 'インチ系クラシック表記では、ハイフン後の数値が内周長さ（インチ）です。',
        solutionSteps: ['65 in × 25.4 mm/in = 1,651.0 mm（内周長）。'],
      },
      {
        id: 'p5',
        prompt:
          'シンクロナス（タイミング）ベルト「HTD 8M-800」を解読し、歯ピッチ 8 mm・ピッチ長さ 800 mm のときの総歯数を求めてください。',
        hint: 'ピッチ長さ（800 mm）を歯ピッチ（8 mm）で割ります。',
        solutionSteps: ['歯数 N = 800 mm / 8 mm = 100 歯。'],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Vベルトが摩耗プーリ溝へ深く沈み込み、溝底に接触する「底突き（Bottoming-Out）」を起こすと即座に何が起きますか？',
        options: [
          '側壁のくさび圧力が失われ、見かけ摩擦が平ベルト並み（約0.30）へ急落して激しいスリップ焼損を起こす。',
          '3面接触になるため動力伝達容量が2倍に増える。',
          'ベルトが自動的に調心され軸受荷重が低下する。',
          'プーリ溝角度が 38° から 60° へ自動的に広がる。',
        ],
        explanation:
          '正常なVベルトは絶対に溝底へ接触してはいけません。底突きが起きるとくさび増幅作用が失われ、急激なスリップ発熱でベルトが焼損します。',
      },
      {
        id: 'q2',
        question:
          '同一トルクを伝達する場合、HTD 8M タイミングベルトがクラシックVベルトよりはるかに低い初張力で済む理由は何ですか？',
        options: [
          '歯とプーリ溝の機械的噛合い（ポジティブ駆動）でトルクを伝えるため、強い側壁くさび摩擦を必要としないから。',
          'タイミングベルトは 45° のくさび角で垂直抗力を4倍にするから。',
          'タイミングベルトはプーリ内部で油浴運転されるから。',
          '運転中に心線が熱膨張して自動的に張り直すから。',
        ],
        explanation:
          'シンクロナスベルトは歯の噛合いによって動力を伝達するため、高い張力やくさび圧力を要さず、軸受へのラジアル荷重も大幅に軽減されます。',
      },
      {
        id: 'q3',
        question:
          'クラシック A形（13 × 8 mm）に比べ、細幅ウェッジ SPA形（12.7 × 10 mm）が1本あたりはるかに大きな馬力を伝達できる理由は何ですか？',
        options: [
          '深い断面比により側壁接触高さが大きく、高弾性心線が溝側面の上で均一に張力を支えるため。',
          '溝底へ故意に底突きさせて追加摩擦を得るため。',
          '心線を持たず大きく伸縮できるため。',
          '90° の平坦接触角で運転するため。',
        ],
        explanation:
          '細幅ウェッジベルト（SPZ, SPA, SPB）は断面が深く、心線全域が溝側面でしっかり支持されるため極めて高い出力密度を発揮します。',
      },
      {
        id: 'q4',
        question:
          '小径のモータプーリに巻き付ける際、ラップドのクラシックベルト（A/B）よりローエッジコグベルト（AX/BX）が優れている理由は何ですか？',
        options: [
          '底面のコグ（刻み）が曲げ発熱と屈曲応力を減らし、むき出しのゴム側面が高い摩擦力を発揮するため。',
          'コグベルトはスリップゼロのタイミングベルトとして働くため。',
          'コグベルトは C形ベルトより幅広であるため。',
          'コグベルトはプーリ溝側壁を必要としないため。',
        ],
        explanation:
          '底面のコグ形状により小径プーリでの屈曲抵抗と内部発熱が大幅に減り、コンパクト駆動でも長寿命が得られます。',
      },
      {
        id: 'q5',
        question:
          '洗濯機や自動車の補機駆動など、背面アイドラや小径プーリを高速で連続屈曲するレイアウトに最適なベルト形式はどれですか？',
        options: [
          'ポリV マルチリブベルト（PJ / PK）',
          'クラシックラップド C形 Vベルト',
          '厚手革平ベルト',
          '単線 B形 Vベルト',
        ],
        explanation:
          'ポリV（PJ, PK）ベルトは多数の微小Vリブによるくさびグリップと薄型背面の高い柔軟性を両立し、小径サーペンタイン駆動に最適です。',
      },
      {
        id: 'q6',
        question:
          '定期点検でプーリ溝ゲージを当てたところ、溝側壁が皿状に摩耗し、ベルト上面がプーリ外周縁より沈み込んでいました。適切な処置はどれですか？',
        options: [
          '新品ベルトと同時に摩耗したプーリ（シーブ）も交換する（ベルトのみ新品にしてもすぐ底突きして早期破損する）。',
          '摩耗を補うためベルト張力を50%過剰に張る。',
          '溝底にベルト鳴き止めグリースを塗布する。',
          '幅広のB溝に細いSPZベルトをはめ替える。',
        ],
        explanation:
          '側壁が摩耗したプーリに新品ベルトを組むと正常高さに座らず、即座に底突きを起こして新品ベルトも短時間で焼損します。',
      },
    ],
  },
});
