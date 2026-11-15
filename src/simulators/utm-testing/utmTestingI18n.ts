import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('utm-testing', {
  id: {
    title: 'Mesin Uji Universal (UTM) — Tarik & Tekan',
    shortTitle: 'UTM Tarik & Tekan',
    description:
      'Simulator pengujian material interaktif dengan Universal Testing Machine (UTM). Lakukan uji tarik ASTM E8 dan uji tekan ASTM E9, pantau kurva tegangan-regangan (σ–ε) dan beban-perpanjangan (F–ΔL) secara real-time, analisis kekuatan luluh 0.2% offset, UTS, necking, keuletan (%EL, %RA), dan efek barreling.',
    explore: [
      {
        title: 'Tegangan-Regangan Rekayasa & Hukum Hooke',
        summary:
          'Uji tarik aksial mengukur respons deformasi material terhadap pembebanan bertahap. Tegangan rekayasa (σ = F/A₀) dan regangan rekayasa (ε = ΔL/L₀) didasarkan pada dimensi awal spesimen. Pada rentang elastis linier, regangan bersifat reversibel dan mematuhi Hukum Hooke (σ = E · ε), di mana kemiringan garis mewakili Modulus Young (E).',
        equations: [
          {
            label: 'Tegangan Rekayasa (Engineering Stress)',
            formula: 'σ = F / A₀',
            note: 'F = gaya tarik aksial (N), A₀ = luas penampang mula spesimen (mm²); satuan MPa (N/mm²).',
          },
          {
            label: 'Regangan Rekayasa (Engineering Strain)',
            formula: 'ε = ΔL / L₀ = (L - L₀) / L₀',
            note: 'ΔL = perpanjangan panjang ukur (gauge length), L₀ = panjang ukur mula (mm); tanpa dimensi atau mm/mm.',
          },
          {
            label: 'Hukum Hooke (Rentang Elastis Linier)',
            formula: 'E = σ / ε',
            note: 'E = Modulus Elastisitas / Modulus Young (GPa); mencerminkan kekakuan ikatan atomik material.',
          },
          {
            label: 'Tegangan Sejati & Regangan Sejati (Sebelum Necking)',
            formula: 'σ_true = σ * (1 + ε),   ε_true = ln(1 + ε)',
            note: 'Memperhitungkan reduksi luas penampang sesaat A(t) akibat efek Poisson sebelum terjadi necking.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Modulus Young dari Data Uji Tarik Elastis',
          given: [
            'Diameter awal batang uji d₀ = 12.8 mm (luas penampang A₀ = 128.68 mm²)',
            'Panjang ukur ekstensiometer L₀ = 50.0 mm',
            'Gaya tarik elastis F = 25.0 kN (25,000 N)',
            'Perpanjangan terukur pada ekstensiometer ΔL = 0.0485 mm',
          ],
          steps: [
            'Hitung tegangan rekayasa: σ = F / A₀ = 25,000 N / 128.68 mm² = 194.28 MPa.',
            'Hitung regangan rekayasa: ε = ΔL / L₀ = 0.0485 mm / 50.0 mm = 0.000970 (0.0970%).',
            'Terapkan Hukum Hooke untuk Modulus Young: E = σ / ε = 194.28 MPa / 0.000970 = 200,288 MPa = 200.3 GPa.',
            'Nilai 200 GPa mengonfirmasi material tersebut adalah baja karbon struktural (seperti ASTM A36).',
          ],
          answer: 'E = 200.3 GPa (Baja Struktural Karbon Rendah)',
        },
      },
      {
        title: 'Kekuatan Luluh 0.2% Offset, UTS, Necking & Keuletan (%EL, %RA)',
        summary:
          'Banyak logam tidak memiliki titik luluh diskrit (upper/lower yield). Standar ASTM E8 menetapkan kekuatan luluh offset 0.2% (Rp0.2) dengan menarik garis sejajar modulus E dari regangan ε = 0.002 (0.2%). Titik puncak kurva rekayasa menandai Ultimate Tensile Strength (UTS). Melewati UTS, pengerasan regang (strain hardening) kalah oleh penipisan penampang lokal (necking), hingga terjadi patah.',
        equations: [
          {
            label: 'Kekuatan Luluh 0.2% Offset (Rp0.2)',
            formula: 'σ_y = Tegangan pada perpotongan garis: σ = E * (ε - 0.002)',
            note: 'Ditarik dari titik regangan 0.2% sejajar garis elastis awal untuk menentukan batas deformasi plastis permanen.',
          },
          {
            label: 'Kekuatan Tarik Maksimum (Ultimate Tensile Strength - UTS)',
            formula: 'UTS = F_max / A₀',
            note: 'F_max = beban maksimum mutlak yang mampu ditahan spesimen sebelum laju deformasi lokal mendominasi.',
          },
          {
            label: 'Persentase Perpanjangan (Ductility %EL)',
            formula: '%EL = ((L_f - L₀) / L₀) * 100%',
            note: 'L_f = panjang ukur akhir setelah kedua pecahan dirapatkan kembali; indikator utama keuletan material.',
          },
          {
            label: 'Persentase Reduksi Luas (Ductility %RA)',
            formula: '%RA = ((A₀ - A_f) / A₀) * 100% = ((d₀² - d_f²) / d₀²) * 100%',
            note: 'A_f = luas penampang minimum di zona leher (neck) saat patah.',
          },
        ],
        workedExample: {
          title: 'Evaluasi UTS, Keuletan %EL, dan %RA Baja Karbon',
          given: [
            'Dimensi mula: d₀ = 12.8 mm (A₀ = 128.68 mm²), L₀ = 50.0 mm',
            'Beban tarik maksimum F_max = 51.5 kN (51,500 N)',
            'Panjang ukur akhir saat patah L_f = 63.8 mm',
            'Diameter penampang leher patah d_f = 8.5 mm (A_f = 56.75 mm²)',
          ],
          steps: [
            'Hitung UTS: UTS = F_max / A₀ = 51,500 N / 128.68 mm² = 400.2 MPa.',
            'Hitung perpanjangan relatif: %EL = ((63.8 - 50.0) / 50.0) * 100% = (13.8 / 50.0) * 100% = 27.6%.',
            'Hitung reduksi luas: %RA = ((128.68 - 56.75) / 128.68) * 100% = (71.93 / 128.68) * 100% = 55.9%.',
            'Kombinasi %EL > 20% dan %RA > 50% membuktikan material memiliki keuletan tinggi dengan patahan tipe cup-and-cone.',
          ],
          answer: 'UTS = 400.2 MPa, %EL = 27.6%, %RA = 55.9% (Karakter Ulet)',
        },
      },
      {
        title: 'Penggembungan Barel (Barreling) Tekan & Pola Patah Ulet vs Getas',
        summary:
          'Uji tekan (ASTM E9) menguji perilaku material di bawah beban kompresi aksial. Akibat gesekan pada permukaan kontak antara ujung spesimen dan platen baja keras, aliran material radial tertahan di ujungnya, memicu deformasi cembung di bagian tengah (barreling). Logam ulet mengalami pemadatan plastis terus menerus tanpa patah, sedangkan material getas (seperti besi cor kelabu) pecah secara tiba-tiba sepanjang bidang geser kerucut 45° akibat tegangan geser maksimum.',
        equations: [
          {
            label: 'Tegangan Tekan Rekayasa (Nominal Compressive Stress)',
            formula: 'σ_c = F_c / A₀',
            note: 'F_c = beban tekan aksial (N). Luas penampang rekayasa tetap merujuk pada luas awal A₀.',
          },
          {
            label: 'Regangan Tekan Rekayasa',
            formula: 'ε_c = |Δh| / h₀ = (h₀ - h) / h₀',
            note: 'h₀ = tinggi awal silinder tekan, h = tinggi sesaat (mm).',
          },
          {
            label: 'Karakter Patah Ulet (Cup-and-Cone vs Shear Lip)',
            formula: 'Bidang Patah Geser 45° (Tresca / Mohr-Coulomb)',
            note: 'Pada tarik, inti leher mengalami tegangan triaksial menghasilkan retak datar serat mikro, diakhiri bibir geser 45° di tepi luar.',
          },
          {
            label: 'Asimetri Besi Cor (Tegangan Tekan vs Tarik)',
            formula: 'UTS_tekan ≈ 3 sampai 4 kali UTS_tarik',
            note: 'Serpihan grafit pada besi cor bertindak sebagai takik konsentrasi tegangan tajam pada beban tarik, namun tertutup rapat pada beban tekan.',
          },
        ],
        workedExample: {
          title: 'Analisis Deformasi Tekan dan Perbandingan Material Ulet vs Getas',
          given: [
            'Silinder uji tekan d₀ = 15.0 mm (A₀ = 176.71 mm²), tinggi h₀ = 25.0 mm',
            'Beban tekan aksial F_c = 65.0 kN',
            'Tinggi akhir spesimen terkompresi h = 20.0 mm (Δh = 5.0 mm)',
          ],
          steps: [
            'Hitung regangan tekan: ε_c = |25.0 - 20.0| / 25.0 = 5.0 / 25.0 = 0.20 (20.0%).',
            'Hitung tegangan tekan nominal: σ_c = 65,000 N / 176.71 mm² = 367.8 MPa.',
            'Pada paduan aluminium atau tembaga, gesekan platen menahan ujung specimen sehingga diameter tengah membesar menjadi ~16.8 mm (efek barreling cembung).',
            'Sebaliknya, jika spesimen berupa besi cor kelabu ASTM A48, material akan mengalami rekahan miring rapuh 45° saat tegangan geser melampaui kekuatan gesernya.',
          ],
          answer: 'Regangan Tekan = 20.0%, Tegangan = 367.8 MPa (Deformasi Barreling)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Spesimen uji tarik silindris baja standar dengan panjang ukur awal L₀ = 50.0 mm dan diameter d₀ = 12.8 mm dibebani dalam batas elastis linier. Pada gaya tarik F = 25.0 kN, ekstensiometer mencatat perpanjangan ΔL = 0.0485 mm. Hitung Modulus Young (E) material dalam satuan GPa.',
        hint: 'Cari luas A₀ = π/4 * d₀², tegangan σ = F/A₀, regangan ε = ΔL/L₀, lalu E = σ/ε (bagi 1000 untuk GPa).',
        solutionSteps: [
          'A₀ = π * (12.8 mm)² / 4 = 128.68 mm²',
          'σ = 25,000 N / 128.68 mm² = 194.28 MPa',
          'ε = 0.0485 mm / 50.0 mm = 0.000970',
          'E = 194.28 MPa / 0.000970 = 200,288 MPa = 200.3 GPa',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Batang aluminium 6061-T6 silindris memiliki diameter d₀ = 10.0 mm dan tegangan luluh 0.2% offset σ_y = 276.0 MPa. Berapakah beban aksial F_yield dalam kN yang dibutuhkan untuk mencapai batas luluh tersebut?',
        hint: 'Gaya luluh diperoleh dari F = σ_y * A₀. Konversikan Newton ke kiloNewton (kN).',
        solutionSteps: [
          'A₀ = π * (10.0 mm)² / 4 = 78.54 mm²',
          'F = 276.0 MPa * 78.54 mm² = 21,677 N',
          'F dalam kN = 21,677 / 1,000 = 21.68 kN',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Selama uji tarik pada batang baja berdiameter d₀ = 16.0 mm, sel beban UTM mencatat gaya maksimum F_max = 90.5 kN tepat sebelum pembentukan necking lokal. Tentukan Kekuatan Tarik Maksimum (UTS) baja dalam MPa.',
        hint: 'UTS = F_max / A₀. Pastikan gaya dalam satuan Newton dan luas penampang dalam mm².',
        solutionSteps: [
          'A₀ = π * (16.0 mm)² / 4 = 201.06 mm²',
          'F_max = 90.5 kN = 90,500 N',
          'UTS = 90,500 N / 201.06 mm² = 450.1 MPa',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Spesimen uji tarik memiliki panjang ukur awal L₀ = 50.0 mm. Setelah patah, kedua belahan dirapatkan dan panjang ukur terukur menjadi L_f = 63.8 mm. Hitung nilai persentase perpanjangan (%EL).',
        hint: '%EL = ((L_f - L₀) / L₀) * 100%.',
        solutionSteps: [
          'Pertambahan panjang ΔL = 63.8 mm - 50.0 mm = 13.8 mm',
          '%EL = (13.8 mm / 50.0 mm) * 100% = 27.6%',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Spesimen uji tarik baja dengan diameter awal d₀ = 12.8 mm mengalami leher (necking) tajam dan patah berbentuk cup-and-cone. Diameter terkecil pada permukaan patahan diukur sebesar d_f = 8.5 mm. Hitung persentase reduksi luas penampang (%RA).',
        hint: '%RA = ((A₀ - A_f) / A₀) * 100% = (1 - (d_f / d₀)²) * 100%.',
        solutionSteps: [
          'A₀ = π * (12.8 mm)² / 4 = 128.68 mm²',
          'A_f = π * (8.5 mm)² / 4 = 56.75 mm²',
          '%RA = ((128.68 - 56.75) / 128.68) * 100% = (71.93 / 128.68) * 100% = 55.9%',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Mengapa kekuatan luluh 0.2% offset (Rp0.2) digunakan secara luas dalam rekayasa dibandingkan batas proporsional (proportional limit)?',
        options: [
          'Batas proporsional sangat sulit ditentukan secara objektif pada kurva kontinu karena peralihan elastis ke plastis bersifat gradual',
          'Batas proporsional selalu bernilai nol untuk logam',
          'Regangan 0.2% adalah titik di mana material langsung patah seketika',
          'Standar ASTM melarang penggunaan alat ukur ekstensiometer presisi',
        ],
        explanation:
          'Pada mayoritas logam komersial, kurva elastis beralih ke plastis secara melengkung halus tanpa batas diskrit yang tegas. Metode offset 0.2% (garis sejajar kemiringan E yang bergeser sejauh 0.002 regangan) memberikan standar penentuan batas luluh praktis yang dapat diulang dengan akurat.',
      },
      {
        id: 'q2',
        question:
          'Mengapa kurva tegangan rekayasa (engineering stress) menurun setelah melampaui titik UTS, padahal material semakin mengeras (strain hardening)?',
        options: [
          'Tegangan rekayasa dihitung membagi gaya F dengan luas awal A₀, sehingga penipisan luas lokal (necking) drastis menurunkan total beban penahan',
          'Kisi kristal logam meleleh akibat temperatur ruangan',
          'Modulus Young material berubah menjadi negatif',
          'Gaya gesek pada pencekam hidrolik selip',
        ],
        explanation:
          'Setelah titik UTS, deformasi terpusat pada leher (necking) di mana luas penampang setempat mengecil jauh lebih cepat daripada peningkatan kekuatan akibat pengerasan regang. Karena tegangan rekayasa membagi gaya dengan penampang awal yang konstan A₀, kurvanya tampak menurun meskipun tegangan sejati (true stress = F / A_sesaat) terus meningkat.',
      },
      {
        id: 'q3',
        question:
          'Ciri visual khas dari patahan tarik spesimen logam ulet (seperti baja lunak atau tembaga) adalah:',
        options: [
          'Pola patahan mangkuk-dan-kerucut (cup-and-cone) dengan bibir geser bersudut 45°',
          'Permukaan patah datar sempurna tegak lurus sumbu beban tanpa penyusutan diameter',
          'Pecah berkeping-keping menjadi serbuk halus',
          'Spesimen terbelah memanjang secara aksial',
        ],
        explanation:
          'Logam ulet mengalami necking signifikan. Retakan mikro awal terbentuk di inti tengah akibat tegangan triaksial normal, kemudian merambat keluar dan berakhir pada bidang geser maksimum 45°, membentuk geometri mangkuk dan kerucut (cup-and-cone) yang khas.',
      },
      {
        id: 'q4',
        question:
          'Pada uji tekan silindris (ASTM E9), fenomena apakah yang menyebabkan bentuk spesimen menggembung seperti tong (barreling)?',
        options: [
          'Gaya gesek antara permukaan ujung spesimen dan platen baja kaku menghambat ekspansi radial bebas pada ujung-ujungnya',
          'Tegangan tarik termal di bagian dalam spesimen',
          'Laju penurunan crosshead terlalu lambat',
          'Perubahan massa spesimen selama penekanan',
        ],
        explanation:
          'Gesekan antara platen tekan dan ujung spesimen menciptakan pengekangan geser yang menahan aliran material ke arah radial di bagian kontak. Akibatnya, material di bagian tengah yang bebas dari kontak platen dapat mengembang secara bebas ke arah radial, menciptakan profil barel (menggembung di tengah).',
      },
      {
        id: 'q5',
        question:
          'Manakah pernyataan yang paling tepat mengenai Hukum Hooke dalam daerah elastis linear?',
        options: [
          'Regangan berbanding lurus dengan tegangan, dan spesimen akan kembali ke dimensi semula jika beban dilepaskan',
          'Deformasi yang terjadi bersifat permanen dan tidak dapat pulih',
          'Tegangan selalu konstan tidak peduli seberapa besar regangan yang terjadi',
          'Hukum Hooke hanya berlaku setelah terjadi fenomena necking',
        ],
        explanation:
          'Dalam batas elastis, regangan sebanding secara linier dengan tegangan yang diterapkan (σ = E · ε). Energi regangan disimpan secara elastis dalam ikatan atomik, sehingga material kembali ke bentuk dan panjang awalnya saat beban dihilangkan.',
      },
      {
        id: 'q6',
        question:
          'Mengapa besi cor kelabu (Gray Cast Iron ASTM A48) memiliki kekuatan tekan yang jauh lebih tinggi (3–4 kali) dibandingkan kekuatan tariknya?',
        options: [
          'Serpihan grafit runcing bertindak sebagai takik pemusat tegangan getas pada beban tarik, namun mampu mentransmisikan gaya dan menutup rapat pada beban tekan',
          'Besi cor memiliki modulus elastisitas yang jauh lebih tinggi dari titanium',
          'Besi cor mengalami pengerasan regang ekstrim dalam uji tarik',
          'Pencekam UTM mengubah komposisi kimia besi saat uji tekan',
        ],
        explanation:
          'Besi cor kelabu memiliki matriks yang dipenuhi serpihan grafit (flake graphite). Pada beban tarik, ujung serpihan yang tajam menciptakan konsentrasi tegangan lokal yang sangat tinggi memicu retak getas cepat. Pada beban tekan, celah grafit tersebut tertekan rapat dan beban didukung secara efektif oleh matriks baja/ferit di sekitarnya.',
      },
    ],
  },
  ja: {
    title: '万能材料試験機（UTM）— 引張・圧縮試験',
    shortTitle: 'UTM 引張・圧縮',
    description:
      '万能材料試験機（UTM）のインタラクティブ材料力学シミュレータ。ASTM E8引張試験およびASTM E9圧縮試験を実施し、応力-ひずみ曲線（σ–ε）や荷重-変位曲線（F–ΔL）をリアルタイム表示。0.2%耐力、引張強さ（UTS）、ネッキング（くびれ）、延性（伸び%EL、絞り%RA）、圧縮バレル変形を工学的に解析します。',
    explore: [
      {
        title: '公称応力・公称ひずみとフックの法則',
        summary:
          '一軸引張試験は、材料の変形・破壊挙動を評価する最も基本的かつ重要な材料試験です。公称応力（σ = F/A₀）および公称ひずみ（ε = ΔL/L₀）は試験片の初期寸法に基づいて定義されます。弾性域ではひずみは完全に可逆的であり、フックの法則（σ = E · ε）に従います。この直線の傾きがヤング率（縦弾性係数 E）を表します。',
        equations: [
          {
            label: '公称応力（Engineering Stress）',
            formula: 'σ = F / A₀',
            note: 'F = 引張荷重 (N), A₀ = 試験片の初期断面積 (mm²)。単位は MPa (N/mm²)。',
          },
          {
            label: '公称ひずみ（Engineering Strain）',
            formula: 'ε = ΔL / L₀ = (L - L₀) / L₀',
            note: 'ΔL = 標点間伸び量 (mm), L₀ = 初期標点距離 (mm)。無次元量（または mm/mm）。',
          },
          {
            label: 'フックの法則（弾性域）',
            formula: 'E = σ / ε',
            note: 'E = ヤング率（縦弾性係数, GPa）。原子間結合の剛性を直接反映します。',
          },
          {
            label: '真応力と真ひずみ（ネッキング発生前）',
            formula: 'σ_true = σ * (1 + ε),   ε_true = ln(1 + ε)',
            note: 'ポアソン効果による瞬間断面積 A(t) の一様減少を考慮した厳密な応力・ひずみです。',
          },
        ],
        workedExample: {
          title: '引張試験弾性域データからのヤング率算出',
          given: [
            '丸棒試験片の初期直径 d₀ = 12.8 mm（初期断面積 A₀ = 128.68 mm²）',
            '伸び計の初期標点距離 L₀ = 50.0 mm',
            '測定された弾性引張荷重 F = 25.0 kN (25,000 N)',
            '伸び計の指示変位量 ΔL = 0.0485 mm',
          ],
          steps: [
            '公称応力を計算: σ = F / A₀ = 25,000 N / 128.68 mm² = 194.28 MPa。',
            '公称ひずみを計算: ε = ΔL / L₀ = 0.0485 mm / 50.0 mm = 0.000970 (0.0970%)。',
            'フックの法則よりヤング率を導出: E = σ / ε = 194.28 MPa / 0.000970 = 200,288 MPa = 200.3 GPa。',
            'ヤング率 約 200 GPa は、標準的な構造用低炭素鋼（SS400 / ASTM A36）の物性と高精度に合致します。',
          ],
          answer: 'E = 200.3 GPa（炭素鋼の標準剛性）',
        },
      },
      {
        title: '0.2%耐力、引張強さ（UTS）、ネッキングおよび延性指標（%EL, %RA）',
        summary:
          '明確な降伏点を示さない非鉄金属や調質鋼では、ASTM E8 / JIS Z 2241規格に基づき、弾性勾配線をひずみ軸0.2%（0.002）オフセットさせた交点「0.2%耐力（Rp0.2）」を降伏強さとして規定します。公称応力の極大値が引張強さ（UTS）であり、これを超えると加工硬化が局所的な断面積減少（ネッキング）に負け、応力低下を経て最終破断に至ります。',
        equations: [
          {
            label: '0.2%耐力（0.2% Offset Yield Strength - Rp0.2）',
            formula: 'σ_y = 直線 σ = E * (ε - 0.002) と応力ひずみ曲線の交点応力',
            note: '永久ひずみ 0.2% が生じる限界応力を工学的な降伏限界として定義。',
          },
          {
            label: '引張強さ（Ultimate Tensile Strength - UTS）',
            formula: 'UTS = F_max / A₀',
            note: 'F_max = 試験片が耐えうる最大引張荷重 (N)。ネッキング開始点と一致。',
          },
          {
            label: '破断伸び（Elongation %EL）',
            formula: '%EL = ((L_f - L₀) / L₀) * 100%',
            note: 'L_f = 破断した2片を突き合わせた際の標点距離 (mm)。材料の延性の代表指標。',
          },
          {
            label: '絞り率（Reduction of Area %RA）',
            formula: '%RA = ((A₀ - A_f) / A₀) * 100% = ((d₀² - d_f²) / d₀²) * 100%',
            note: 'A_f = 破断面における最小断面積 (mm²)。局所変形能の指標。',
          },
        ],
        workedExample: {
          title: '構造用鋼のUTS、破断伸び（%EL）、絞り率（%RA）の算出',
          given: [
            '初期寸法: d₀ = 12.8 mm (A₀ = 128.68 mm²), L₀ = 50.0 mm',
            '最大引張荷重 F_max = 51.5 kN (51,500 N)',
            '破断後標点間距離 L_f = 63.8 mm',
            '破断部くびれ最小径 d_f = 8.5 mm (A_f = 56.75 mm²)',
          ],
          steps: [
            '引張強さを計算: UTS = F_max / A₀ = 51,500 N / 128.68 mm² = 400.2 MPa。',
            '破断伸びを計算: %EL = ((63.8 - 50.0) / 50.0) * 100% = (13.8 / 50.0) * 100% = 27.6%。',
            '絞り率を計算: %RA = ((128.68 - 56.75) / 128.68) * 100% = (71.93 / 128.68) * 100% = 55.9%。',
            '伸び 27.6%、絞り 55.9% は高い塑性変形能と典型的なカップ・アンド・コーン延性破面を示します。',
          ],
          answer: 'UTS = 400.2 MPa, %EL = 27.6%, %RA = 55.9%（良好な延性）',
        },
      },
      {
        title: '圧縮バレル変形と延性破断・脆性破壊メカニズム',
        summary:
          '圧縮試験（ASTM E9）では、円柱試験片に軸方向圧縮荷重を負荷します。硬化鋼製圧子（プラテン）と試験片端面との摩擦抵抗により、端面近傍の半径方向広がりが拘束され、中央部が太鼓状に膨らむ「バレル変形（Barreling）」が生じます。延性金属は破断せず偏平化しますが、ねずみ鋳鉄などの脆性材料は最大せん断応力面に沿って約45°の角度で破断します。',
        equations: [
          {
            label: '公称圧縮応力（Nominal Compressive Stress）',
            formula: 'σ_c = F_c / A₀',
            note: 'F_c = 圧縮荷重 (N), A₀ = 試験片の初期断面積 (mm²)。',
          },
          {
            label: '公称圧縮ひずみ（Compressive Strain）',
            formula: 'ε_c = |Δh| / h₀ = (h₀ - h) / h₀',
            note: 'h₀ = 初期高さ, h = 圧縮後の高さ (mm)。',
          },
          {
            label: '延性カップ・アンド・コーン破壊の応力状態',
            formula: '最大主応力 σ₁ による中心部ボイド形成 ＋ 45°最大せん断応力リップ',
            note: '三軸引張応力によるマイクロボイド合体亀裂が、周囲の45°せん断唇部へと連結します。',
          },
          {
            label: 'ねずみ鋳鉄の引張・圧縮強度非対称性',
            formula: '圧縮強さ σ_c_max ≈ 3〜4 × 引張強さ UTS',
            note: '片状黒鉛の切欠き効果が引張下で鋭敏に作用する一方、圧縮下では空隙が密着し母相で荷重を伝達します。',
          },
        ],
        workedExample: {
          title: '圧縮試験におけるひずみ解析と破壊形態の比較',
          given: [
            '円柱圧縮試験片 d₀ = 15.0 mm (A₀ = 176.71 mm²), 初期高さ h₀ = 25.0 mm',
            '負荷圧縮荷重 F_c = 65.0 kN',
            '圧縮後高さ h = 20.0 mm（縮み量 Δh = 5.0 mm）',
          ],
          steps: [
            '圧縮ひずみを計算: ε_c = |25.0 - 20.0| / 25.0 = 5.0 / 25.0 = 0.20 (20.0%)。',
            '公称圧縮応力を計算: σ_c = 65,000 N / 176.71 mm² = 367.8 MPa。',
            'アルミニウムや銅などの延性金属では、端面摩擦拘束により中央部径が約16.8mmに膨張（バレル変形）。',
            '一方、ASTM A48ねずみ鋳鉄の場合、圧縮強さ約650MPaに達すると45°せん断すべり面で脆性せん断破壊を起こします。',
          ],
          answer: '圧縮ひずみ = 20.0%, 応力 = 367.8 MPa（バレル変形）',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '初期標点距離 L₀ = 50.0 mm、直径 d₀ = 12.8 mm の丸棒引張試験片を線形弾性領域で試験しました。引張荷重 F = 25.0 kN のとき、伸び計の計測変位は ΔL = 0.0485 mm でした。この材料のヤング率（E）を GPa 単位で算出してください。',
        hint: '初期断面積 A₀ = π/4 * d₀²、応力 σ = F/A₀、ひずみ ε = ΔL/L₀ を求め、E = σ/ε を計算します（1000で除してGPaへ換算）。',
        solutionSteps: [
          'A₀ = π * (12.8 mm)² / 4 = 128.68 mm²',
          'σ = 25,000 N / 128.68 mm² = 194.28 MPa',
          'ε = 0.0485 mm / 50.0 mm = 0.000970',
          'E = 194.28 MPa / 0.000970 = 200,288 MPa = 200.3 GPa',
        ],
      },
      {
        id: 'p2',
        prompt:
          'アルミニウム合金 6061-T6（試験片直径 d₀ = 10.0 mm）の0.2%耐力は σ_y = 276.0 MPa です。この耐力に到達する引張荷重 F_yield（kN）を求めてください。',
        hint: 'F = σ_y * A₀ で求めた荷重 (N) を 1000 で割って kN 単位にします。',
        solutionSteps: [
          'A₀ = π * (10.0 mm)² / 4 = 78.54 mm²',
          'F = 276.0 MPa * 78.54 mm² = 21,677 N',
          'F (kN) = 21,677 / 1,000 = 21.68 kN',
        ],
      },
      {
        id: 'p3',
        prompt:
          '直径 d₀ = 16.0 mm の構造用鋼材の引張試験において、局所ネッキングが発生する直前に記録された最大荷重は F_max = 90.5 kN でした。この鋼材の引張強さ（UTS）を MPa 単位で求めてください。',
        hint: 'UTS = F_max / A₀。荷重をニュートン（N）、面積を mm² で計算します。',
        solutionSteps: [
          'A₀ = π * (16.0 mm)² / 4 = 201.06 mm²',
          'F_max = 90.5 kN = 90,500 N',
          'UTS = 90,500 N / 201.06 mm² = 450.1 MPa',
        ],
      },
      {
        id: 'p4',
        prompt:
          '初期標点距離 L₀ = 50.0 mm の引張試験片が破断後、突合せ測定した標点距離は L_f = 63.8 mm でした。破断伸び率（%EL）を求めてください。',
        hint: '%EL = ((L_f - L₀) / L₀) * 100% を計算します。',
        solutionSteps: [
          '伸び量 ΔL = 63.8 mm - 50.0 mm = 13.8 mm',
          '%EL = (13.8 mm / 50.0 mm) * 100% = 27.6%',
        ],
      },
      {
        id: 'p5',
        prompt:
          '初期直径 d₀ = 12.8 mm の丸棒試験片が典型的なカップ・アンド・コーン状に延性破断しました。破断部の最小くびれ径は d_f = 8.5 mm でした。断面減少率（絞り率 %RA）を求めてください。',
        hint: '%RA = ((A₀ - A_f) / A₀) * 100% = (1 - (d_f / d₀)²) * 100% を計算します。',
        solutionSteps: [
          'A₀ = π * (12.8 mm)² / 4 = 128.68 mm²',
          'A_f = π * (8.5 mm)² / 4 = 56.75 mm²',
          '%RA = ((128.68 - 56.75) / 128.68) * 100% = (71.93 / 128.68) * 100% = 55.9%',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          '金属材料の工学的設計において、比例限度ではなく「0.2%耐力（Rp0.2）」が広く降伏基準として採用される主たる理由はどれですか？',
        options: [
          '多くの実用金属は弾性から塑性への移行が滑らかで比例限度の明確な特定が困難なため、再現性の高い客観基準が必要だから',
          '金属の比例限度は物理的に常にゼロであるため',
          'ひずみ0.2%に達すると材料が瞬時に脆性破断するため',
          'ASTM規格で伸び計の使用が禁止されているため',
        ],
        explanation:
          'アルミニウム合金や調質高張力鋼など多くの工業用金属では降伏棚が現れず、弾性域から連続的に塑性流動へと移行します。そのため、弾性直線を0.2%（0.002）オフセットさせた交点を0.2%耐力とする客観的で高精度な判定法が国際規格で統一採用されています。',
      },
      {
        id: 'q2',
        question:
          '引張試験でUTS（引張強さ）を超えた後、材料自体は加工硬化を続けているにもかかわらず、公称応力曲線が下降する原因は何ですか？',
        options: [
          '局所的な急激なくびれ（ネッキング）により断面積が激減し、必要な支持荷重が減少するため（公称応力は初期面積 A₀ で除算しているため）',
          '試験片の金属結晶格子が室温で溶融するため',
          '材料のヤング率が負の値に反転するため',
          '万能試験機のつかみ具が滑り始めるため',
        ],
        explanation:
          'UTSを超えると、ひずみが局所に集中する「ネッキング」が始まります。真の断面積 A(t) が急速に細くなるため、真応力（F/A）が増加し続けていても、試験機が検知する全荷重 F は低下します。公称応力は一定の初期断面積 A₀ で除算するため、見かけ上応力が低下します。',
      },
      {
        id: 'q3',
        question:
          '軟鋼や純銅など延性金属の標準丸棒引張破断面に見られる代表的な特徴的形態はどれですか？',
        options: [
          '45°のせん断リップを持つカップ・アンド・コーン（杯状・円錐状）破面',
          '直径の収縮が全くない完全平坦なへき開破面',
          '微粉末状に破砕する粉末破面',
          '軸方向に縦割れする長手方向亀裂',
        ],
        explanation:
          '延性材料は顕著なくびれ変形を起こします。中心部は三軸引張応力によりマイクロボイドが合体して平坦な繊維状破面となり、外周部へ向かうと最大せん断応力面（軸に対して約45°）に沿ってせん断すべりが起き、一方にカップ（杯）、他方にコーン（円錐）が形成されます。',
      },
      {
        id: 'q4',
        question:
          '円柱圧縮試験（ASTM E9）において、試験片が太鼓状に膨らむ「バレル変形（Barreling）」が生じる根本的なメカニズムは何ですか？',
        options: [
          '高硬度プラテン圧子と試験片端面との摩擦抵抗により、端面近傍の半径方向広がりが拘束されるため',
          '試験片内部に発生する熱的引張応力によるもの',
          'クロスヘッドの下降速度が遅すぎるため',
          '圧縮中に試験片の総質量が増加するため',
        ],
        explanation:
          '圧縮圧子プラテンと試験片の上下接触面には摩擦せん断抵抗が働きます。この拘束により端面の半径方向の拡張が強く抑制される一方、拘束から離れた中央部が自由に外側へ流動するため、樽（バレル）のような太鼓形状に変形します。',
      },
      {
        id: 'q5',
        question:
          'フックの法則が成立する線形弾性領域に関する記述として、最も適切なものはどれですか？',
        options: [
          'ひずみは応力に正比例し、荷重を除荷すると試験片は元の初期寸法に完全に回復する',
          '発生したひずみはすべて永久変形となり回復しない',
          'ひずみが増大しても応力は完全に一定値を保持する',
          'フックの法則はネッキングが発生した後にのみ成立する',
        ],
        explanation:
          '弾性変形領域では応力とひずみが比例関係（σ = E · ε）にあり、変形エネルギーは結晶格子間の原子間距離の伸縮として可逆的に蓄えられます。そのため荷重をゼロに戻すとひずみも完全にゼロへ戻ります。',
      },
      {
        id: 'q6',
        question:
          'ねずみ鋳鉄（ASTM A48）が引張強さに比べて圧縮強さが3〜4倍も高い主な金属組織的理由はどれですか？',
        options: [
          '微細組織内の鋭利な片状黒鉛が引張時には応力集中の切欠きとして作用するが、圧縮時には空隙が圧着して母相全体で荷重を伝達するため',
          '鋳鉄のヤング率がチタン合金よりも格段に高いため',
          '引張試験中に鋳鉄が急激な加工硬化を起こすため',
          '万能試験機のつかみ具によって化学組成が変化するため',
        ],
        explanation:
          'ねずみ鋳鉄の組織には鋭い先端を持つ片状黒鉛（Flake Graphite）が存在します。引張応力下ではこの先端に過大な応力集中が発生し、微小塑性変形なしに脆性亀裂が伝播します。逆に圧縮応力下では黒鉛の空隙が押し潰されて密着し、強固な鋼系マトリクスが直接荷重を支持するため、非常に高い圧縮強度を発揮します。',
      },
    ],
  },
});
