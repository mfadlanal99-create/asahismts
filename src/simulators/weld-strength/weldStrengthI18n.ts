import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('weld-strength', {
  id: {
    title: 'Simulator Kekuatan Las & Tegangan Sambungan',
    shortTitle: 'Kekuatan Las',
    description:
      'Simulator mekanika struktural interaktif untuk sambungan las. Evaluasi tebal leher las fillet (a = 0.707s), luas efektif leher, distribusi tegangan geser di bawah beban transversal dan paralel, kelompok las braket kantilever eksentrik dengan kombinasi geser primer dan torsi sekunder, serta sambungan tumpul penetrasi penuh/sebagian sesuai standar AWS D1.1 dan ISO 2560.',
    explore: [
      {
        title: 'Geometri Las Fillet: Tebal Leher a = 0.707s & Luas Efektif',
        summary:
          'Las fillet menyambung dua pelat logam yang saling bertumpuk atau tegak lurus dengan profil manik segitiga. Di bawah beban geser atau tarik, kegagalan umumnya terjadi pada bidang penampang terkecil dari akar las hingga permukaan luar: tebal leher teoritis (throat thickness, a). Untuk las fillet sama kaki sudut 45°, tebal leher adalah a = s · cos(45°) ≈ 0.7071s, dengan s adalah ukuran kaki las. Luas bidang pikul efektif adalah Aw = a · L_eff.',
        equations: [
          {
            label: 'Tebal Leher Teoritis (Sama Kaki)',
            formula: 'a = s * sin(45°) = s / √2 ≈ 0.7071 * s',
            note: 's = ukuran kaki las (leg size); a = jarak dari akar (root) ke permukaan teoritis leher.',
          },
          {
            label: 'Luas Leher Efektif',
            formula: 'A_w = a * L_eff * N',
            note: 'L_eff = panjang efektif las (mm); N = jumlah garis las (1 untuk tunggal, 2 untuk fillet ganda).',
          },
          {
            label: 'Tegangan Geser Rata-rata pada Leher',
            formula: 'τ = F / A_w = F / (0.7071 * s * L_eff * N)',
            note: 'Diasumsikan distribusi geser seragam sepanjang bidang leher; satuan dalam MPa (N/mm²).',
          },
          {
            label: 'Faktor Penguat Beban Transversal AWS',
            formula: 'F_v(θ) = 0.30 * F_EXX * (1.0 + 0.50 * sin^1.5(θ))',
            note: 'Las fillet dengan beban transversal (θ = 90°) memiliki kapasitas izin 50% lebih tinggi dibanding beban longitudinal (θ = 0°).',
          },
        ],
        workedExample: {
          title: 'Merancang Sambungan Tumpang Fillet Ganda untuk Komponen Tarik 120 kN',
          given: [
            'Beban desain F = 120 kN (120,000 N)',
            'Tebal pelat t = 12 mm, lebar pelat w = 120 mm',
            'Elektroda: AWS E7018 (UTS F_EXX = 483 MPa, Tegangan geser izin τ_allow = 144.9 MPa)',
            'Ukuran kaki las s = 8.0 mm (fillet sama kaki pada sisi atas dan bawah)',
          ],
          steps: [
            'Hitung tebal leher desain: a = 0.7071 * 8.0 mm = 5.657 mm.',
            'Luas efektif yang dibutuhkan: A_req = F / τ_allow = 120,000 N / 144.9 MPa = 828.2 mm².',
            'Panjang total las yang dibutuhkan: L_total = A_req / a = 828.2 mm² / 5.657 mm = 146.4 mm.',
            'Untuk las fillet ganda simetris (dua sisi), panjang per las: L = 146.4 / 2 = 73.2 mm.',
            'Tentukan dua las fillet 8 mm dengan panjang L = 80 mm (total L_eff = 160 mm). Tegangan aktual τ = 120,000 / (5.657 * 160) = 132.6 MPa (Faktor Keamanan = 1.09 terhadap batas AWS, AMAN).',
          ],
          answer: 'Dua las fillet 8 mm, panjang L ≥ 75 mm tiap sisi (E7018)',
        },
      },
      {
        title: 'Geser Eksentrik & Torsi pada Kelompok Las Braket Kantilever',
        summary:
          'Ketika gaya eksternal bekerja pada jarak offset (eksentrisitas e) dari titik berat kelompok las, sambungan harus menahan kombinasi geser langsung primer (τ′) dan geser puntir sekunder (τ″). Menggunakan metode las unit (Blodgett / Shigley), las dimodelkan sebagai garis dengan tebal leher satuan a = 1 mm untuk menentukan titik berat (xc, yc) dan momen inersia polar satuan (Ju). Tegangan resultan adalah penjumlahan vektor dari τ′ dan τ″.',
        equations: [
          {
            label: 'Tegangan Geser Langsung Primer',
            formula: 'τ′ = F / A_w = F / (a * A_u)',
            note: 'Bekerja seragam di seluruh kelompok las sejajar dengan vektor gaya beban F.',
          },
          {
            label: 'Tegangan Geser Torsi Sekunder',
            formula: 'τ″ = (M * r_max) / J_w = (F * e * r_max) / (a * J_u)',
            note: 'M = F * e (momen torsi); r_max = jarak dari titik berat kelompok ke titik las kritis terluar.',
          },
          {
            label: 'Momen Inersia Polar Satuan (Dua Garis Vertikal Sejajar)',
            formula: 'J_u = (d³ / 6) + (d * b² / 2)  (untuk 2 garis vertikal tinggi d, jarak b)',
            note: 'Momen inersia polar aktual J_w = a * J_u (mm⁴).',
          },
          {
            label: 'Tegangan Geser Maksimum Resultan Vektor',
            formula: 'τ_max = √[ (τ″_x)² + (τ′ + τ″_y)² ]',
            note: 'Dievaluasi pada sudut kritis di mana komponen vertikal searah dan saling memperkuat.',
          },
        ],
        workedExample: {
          title: 'Evaluasi Braket Eksentrik dengan Dua Jalur Las Fillet Vertikal',
          given: [
            'Beban ke bawah F = 40 kN (40,000 N) pada eksentrisitas e = 180 mm dari garis sumbu las',
            'Dua las fillet vertikal: tinggi d = 200 mm, jarak pisah b = 100 mm',
            'Ukuran kaki las s = 10 mm (tebal leher a = 7.071 mm), elektroda E7018 (τ_allow = 144.9 MPa)',
          ],
          steps: [
            'Hitung luas unit dan luas aktual: A_u = 2 * 200 = 400 mm; A_w = 7.071 * 400 = 2,828.4 mm².',
            'Hitung geser langsung primer: τ′ = 40,000 N / 2,828.4 mm² = 14.14 MPa (arah ke bawah).',
            'Hitung momen polar unit: J_u = (200³ / 6) + (200 * 100² / 2) = 1,333,333 + 1,000,000 = 2,333,333 mm³.',
            'Momen polar aktual: J_w = a * J_u = 7.071 * 2,333,333 = 1.650 * 10⁷ mm⁴.',
            'Momen puntir: M = 40,000 N * 180 mm = 7,200,000 N·mm.',
            'Koordinat sudut kritis dari titik pusat (0,0): x = 50 mm, y = 100 mm (r = 111.8 mm).',
            'Komponen geser sekunder: τ″_x = (M * y) / J_w = (7.2e6 * 100) / 1.65e7 = 43.64 MPa (horizontal).',
            'τ″_y = (M * x) / J_w = (7.2e6 * 50) / 1.65e7 = 21.82 MPa (vertikal searah beban).',
            'Geser resultan puncak: τ_max = √[ (43.64)² + (14.14 + 21.82)² ] = √[ 1,904.4 + 1,293.1 ] = 56.55 MPa.',
            'Periksa terhadap tegangan izin: 56.55 MPa < 144.9 MPa (Faktor Keamanan = 2.56, AMAN).',
          ],
          answer: 'τ_max = 56.6 MPa (SF = 2.56, Memenuhi kriteria AWS E7018)',
        },
      },
      {
        title: 'Sambungan Tumpul (Butt Welds) & Kriteria Tegangan Izin AWS/ISO',
        summary:
          'Sambungan tumpul (groove welds) menyambung pelat dari ujung ke ujung. Las penetrasi penuh (CJP) menghasilkan kekuatan setara dengan logam induk karena tebal leher efektif sama dengan ketebalan pelat penuh (a = t) dengan fusi akar sempurna. Sebaliknya, las penetrasi sebagian (PJP) menyisakan celah tak menyatu di bagian akar yang dilarang untuk beban lelah siklik. Sesuai kode AWS D1.1 dan AISC, tegangan tarik izin las CJP adalah 0.60 · Fy, dan geser leher fillet adalah 0.30 · F_EXX.',
        equations: [
          {
            label: 'Luas Leher Sambungan Tumpul',
            formula: 'A_w = a * w = (CJP: t, PJP: t_w) * w',
            note: 't = tebal pelat (mm); w = lebar pelat (mm); mahkota penguat luar diabaikan dalam perhitungan kekuatan.',
          },
          {
            label: 'Tegangan Normal Aksial',
            formula: 'σ_aksial = F / A_w',
            note: 'Tarik atau tekan langsung yang tegak lurus terhadap bidang kampuh las.',
          },
          {
            label: 'Tegangan Lentur Sebidang',
            formula: 'σ_lentur = M / Z_w = (6 * M) / (a * w²)',
            note: 'Z_w = modulus penampang leher las terhadap sumbu netral lentur sebidang.',
          },
          {
            label: 'Tegangan Normal Puncak Kombinasi',
            formula: 'σ_max = |σ_aksial| + |σ_lentur|',
            note: 'Tidak boleh melampaui batas izin kode standar σ_allow = 0.60 * F_y.',
          },
        ],
        workedExample: {
          title: 'Pemeriksaan Sambungan Kampuh CJP pada Sayap Balok di Bawah Tarik Aksial dan Momen',
          given: [
            'Ketebalan pelat t = 20 mm, lebar sayap w = 180 mm',
            'Las kampuh CJP Single-V, pengisi E7018 (F_y = 400 MPa, batas tarik izin σ_allow = 240 MPa)',
            'Beban tarik aksial F = 360 kN, momen lentur sebidang M = 12 kN·m',
          ],
          steps: [
            'Tebal leher efektif CJP: a = t = 20 mm.',
            'Luas leher efektif: A_w = 20 mm * 180 mm = 3,600 mm².',
            'Tegangan tarik aksial: σ_aksial = 360,000 N / 3,600 mm² = 100.0 MPa.',
            'Modulus penampang sebidang: Z_w = (a * w²) / 6 = (20 * 180²) / 6 = 108,000 mm³.',
            'Tegangan lentur: σ_lentur = (12 * 10⁶ N·mm) / 108,000 mm³ = 111.1 MPa.',
            'Tegangan puncak gabungan: σ_max = 100.0 + 111.1 = 211.1 MPa.',
            'Pemeriksaan keamanan: σ_max = 211.1 MPa < σ_allow = 240.0 MPa (Faktor Keamanan = 1.14, AMAN).',
          ],
          answer: 'σ_max = 211.1 MPa (Tegangan izin: 240 MPa, SF = 1.14)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Braket struktural disambung dengan las fillet sama kaki yang memiliki ukuran kaki nominal s = 10.0 mm. Hitung tebal leher desain teoritis (a) dalam satuan mm.',
        hint: 'Untuk las fillet sama kaki 45°, a = s * cos(45°) = s / √2 ≈ 0.7071 * s.',
        targetValue: 7.07,
        unit: 'mm',
        tolerance: 0.05,
        solutionSteps: [
          'Faktor tebal leher = cos(45°) = 1 / √2 ≈ 0.7071',
          'a = 10.0 mm * 0.7071 = 7.071 mm',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Sambungan tumpang las fillet ganda memikul gaya tarik transversal F = 120 kN (120,000 N). Kedua las memiliki ukuran kaki s = 8.0 mm dan panjang L = 150 mm (panjang efektif total L_eff = 300 mm). Hitung tegangan geser rata-rata pada bidang leher dalam satuan MPa.',
        hint: 'a = 0.7071 * s; luas efektif total Aw = a * L_eff; τ = F / Aw.',
        targetValue: 70.7,
        unit: 'MPa',
        tolerance: 1.0,
        solutionSteps: [
          'Tebal leher a = 0.7071 * 8.0 mm = 5.657 mm',
          'Panjang efektif total L_eff = 2 * 150 mm = 300 mm',
          'Luas leher efektif Aw = 5.657 mm * 300 mm = 1,697.1 mm²',
          'Tegangan geser τ = 120,000 N / 1,697.1 mm² = 70.7 MPa',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Braket kantilever dilas dengan dua jalur las fillet vertikal sejajar dengan tinggi d = 200 mm dan ukuran kaki s = 10.0 mm (a = 7.071 mm). Beban arah ke bawah F = 40 kN bekerja pada braket. Berapakah tegangan geser langsung primer τ′ dalam MPa?',
        hint: 'Geser primer τ′ = F / Aw, dengan Aw = 2 * a * d.',
        targetValue: 14.1,
        unit: 'MPa',
        tolerance: 0.5,
        solutionSteps: [
          'Tebal leher a = 0.7071 * 10.0 mm = 7.071 mm',
          'Luas leher efektif Aw = 2 * 7.071 mm * 200 mm = 2,828.4 mm²',
          'Tegangan geser primer τ′ = 40,000 N / 2,828.4 mm² = 14.14 MPa',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Dua pelat baja dengan tebal t = 16.0 mm dan lebar w = 150.0 mm disambung dengan las tumpul penetrasi penuh (CJP). Tentukan tegangan normal tarik σ dalam MPa di bawah beban aksial F = 360 kN.',
        hint: 'Untuk las CJP, tebal leher a = tebal pelat t. σ = F / (t * w).',
        targetValue: 150.0,
        unit: 'MPa',
        tolerance: 1.0,
        solutionSteps: [
          'Luas leher Aw = 16.0 mm * 150.0 mm = 2,400 mm²',
          'Gaya tarik aksial F = 360,000 N',
          'Tegangan normal tarik σ = 360,000 N / 2,400 mm² = 150.0 MPa',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Berdasarkan standar struktural AWS D1.1, tegangan geser izin pada leher efektif las fillet dengan elektroda AWS E7018 (kekuatan tarik minimum F_EXX = 483 MPa) adalah 0.30 * F_EXX. Hitung batas tegangan geser izin tersebut dalam MPa.',
        hint: 'Geser izin τ_allow = 0.30 * 483 MPa.',
        targetValue: 144.9,
        unit: 'MPa',
        tolerance: 0.5,
        solutionSteps: [
          'F_EXX = 483 MPa',
          'Tegangan geser izin τ_allow = 0.30 * 483 MPa = 144.9 MPa',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Mengapa tebal leher teoritis (a = 0.707s) digunakan sebagai dimensi kritis dalam perhitungan kekuatan las fillet, bukan ukuran kaki las (s)?',
        options: [
          'Bidang leher mewakili jalur penampang terpendek melalui profil lasan dan menjadi bidang dengan konsentrasi tegangan geser maksimum serta retak primer',
          'Ukuran kaki las tidak dapat diukur dengan alat welding gauge standar',
          'Logam elektroda menguap di sepanjang kaki las saat penyalaan busur',
          'Standar AWS hanya mengizinkan ukuran kaki dalam satuan imperial',
        ],
        correctIndex: 0,
        explanation:
          'Bidang leher mewakili dimensi penampang minimum dari akar las ke permukaan miring manik segitiga (a = s · cos 45° ≈ 0.707s). Saat memikul gaya geser, tarik, atau lentur eksternal, kegagalan mekanis terjadi pada bidang dengan ketahanan luas terkecil ini.',
      },
      {
        id: 'q2',
        question:
          'Mengapa standar AWS D1.1 memberikan peningkatan beban izin hingga 50% untuk las fillet dengan beban transversal dibandingkan beban longitudinal?',
        options: [
          'Kondisi tegangan pada leher las transversal melibatkan kombinasi tarik normal dan geser, yang membutuhkan energi deformasi plastis lebih tinggi sebelum terjadi keruntuhan geser',
          'Las transversal membutuhkan waktu deposit pengelasan yang jauh lebih lama',
          'Las transversal selalu dikerjakan dengan metode las busur terendam (SAW)',
          'Las longitudinal dilarang digunakan dalam struktur gedung tinggi',
        ],
        correctIndex: 0,
        explanation:
          'Penelitian eksperimental oleh Welding Research Council dan AWS membuktikan bahwa ketika arah gaya tegak lurus terhadap sumbu memanjang las (θ = 90°), bidang kegagalan memiliki kapasitas menahan beban sekitar 1.5 kali lebih besar dibandingkan geser murni paralel (θ = 0°).',
      },
      {
        id: 'q3',
        question:
          'Pada kelompok las braket kantilever eksentrik, bagaimana tegangan geser primer (τ′) dan sekunder (τ″) digabungkan pada sudut las kritis?',
        options: [
          'Dijumlahkan sebagai komponen vektor: komponen horizontal dan vertikal dijumlahkan secara terpisah, lalu nilai resultan puncak dihitung dengan akar jumlah kuadrat',
          'Dua nilai tegangan cukup dikalikan secara langsung',
          'Tegangan geser sekunder selalu menghilangkan geser primer sepenuhnya',
          'Geser primer diabaikan apabila nilai eksentrisitas melebihi 100 mm',
        ],
        correctIndex: 0,
        explanation:
          'Geser primer τ′ bekerja seragam searah beban luar. Geser sekunder τ″ bekerja tegak lurus terhadap garis radial dari pusat berat ke titik las terkait (τ″ = M·r / J). Pada sudut kritis di mana komponen vertikalnya searah dengan τ′, keduanya dijumlahkan secara vektor: τ_max = √[ (τ″_x)² + (τ′ + τ″_y)² ].',
      },
      {
        id: 'q4',
        question:
          'Apa perbedaan mendasar antara las kampuh penetrasi penuh (CJP) dan penetrasi sebagian (PJP)?',
        options: [
          'Las CJP menembus seluruh ketebalan logam induk dengan fusi 100% di seluruh sambungan, menghasilkan kekuatan setara logam induk penuh',
          'Las CJP sama sekali tidak memerlukan kawat las atau bahan pengisi',
          'Las PJP memiliki tegangan tarik izin yang jauh lebih tinggi daripada las CJP',
          'Las PJP wajib digunakan untuk aplikasi dengan beban lelah dinamis siklik tinggi',
        ],
        correctIndex: 0,
        explanation:
          'Las CJP mencapai penetrasi dan fusi sempurna di seluruh ketebalan pelat (a = t), sehingga sambungan memiliki kekuatan yang setara dengan pelat utuh. Sebaliknya, las PJP meninggalkan celah akar yang tak menyatu yang bertindak sebagai takik konsentrasi tegangan berbahaya di bawah beban lelah.',
      },
      {
        id: 'q5',
        question:
          'Mengapa cembungan mahkota luar (reinforcement cap) pada permukaan pelat biasanya diabaikan dalam perhitungan tebal leher efektif las?',
        options: [
          'Mahkota luar tidak menambah kekuatan statis leher secara signifikan dan menimbulkan sudut diskontinuitas tajam (takik) pada kaki las yang memicu keretakan fatik',
          'Logam mahkota penguat memiliki massa jenis nol',
          'Alat ukur kaliper las tidak mampu menjangkau puncak cembungan',
          'Mahkota las selalu digerinda hingga rata pada semua sambungan baja struktural',
        ],
        correctIndex: 0,
        explanation:
          'Pedoman desain internasional (AWS D1.1, AISC 360, EN 1993-1-8) mengabaikan mahkota luar karena tidak menambah ketahanan terhadap patah akar, dan transisi sudut kaki las yang curam bertindak sebagai pemusat tegangan takik (Kt ≈ 1.2–1.6) di bawah beban dinamis.',
      },
      {
        id: 'q6',
        question:
          'Apakah arti kode klasifikasi standar AWS untuk elektroda las busur manual "E7018"?',
        options: [
          'Elektroda (E), kekuatan tarik minimum 70 ksi atau 483 MPa (70), dapat digunakan di semua posisi pengelasan (1), salut serbuk besi rendah hidrogen dengan arus DC+/AC (8)',
          'Batang darurat (E), panjang maksimum 70 mm (70), lapis tunggal (1), kadar karbon 8% (8)',
          'Mutu ekspor (E), tegangan luluh 700 MPa (70), hanya posisi datar (1), ukuran kawat inti 8 (8)',
          'Paduan ekstrusi (E), arus kerja 70 ampere (70), diameter 1 mm (1), baja mutu 8 (8)',
        ],
        correctIndex: 0,
        explanation:
          'Berdasarkan AWS A5.1: "E" menandakan elektroda; "70" menyatakan kekuatan tarik minimum dalam ksi (70 ksi ≈ 483 MPa); "1" menunjukkan elektroda serbaguna untuk semua posisi pengelasan; "8" menandakan jenis salut serbuk besi kalium rendah hidrogen berkekuatan tinggi.',
      },
    ],
  },
  ja: {
    title: '溶接継手強度・応力シミュレータ',
    shortTitle: '溶接強度',
    description:
      '溶接継手の構造力学インタラクティブシミュレータ。すみ肉溶接の理論のど厚（a = 0.707s）、有効のど面積、前面・側面せん断応力分布、偏心片持ちブラケット溶接群における直接せん断と二次ねじりせん断の合成、ならびにAWS D1.1・ISO 2560規格に準拠した完全／部分溶込み突合せ継手の強度評価を行います。',
    explore: [
      {
        title: 'すみ肉溶接の幾何学：のど厚 a = 0.707s と有効面積',
        summary:
          'すみ肉溶接（Fillet Weld）は、重ね継手やT形継手などの直交・重複する母材を三角形状の溶着金属ビードで結合します。引張やせん断荷重下では、溶接ルート部からビード表面に至る最小断面積の平面である「理論のど厚（Throat thickness, a）」に沿って破断が生じます。脚長を s とする45°等脚すみ肉溶接では、理論のど厚は a = s · cos(45°) ≈ 0.7071s と表され、荷重を負担する有効面積は Aw = a · L_eff となります。',
        equations: [
          {
            label: '等脚すみ肉溶接の理論のど厚',
            formula: 'a = s * sin(45°) = s / √2 ≈ 0.7071 * s',
            note: 's = 溶接脚長（Leg size）；a = ルート（根元）から理論表面までの最短垂直距離。',
          },
          {
            label: '有効のど断面積',
            formula: 'A_w = a * L_eff * N',
            note: 'L_eff = 有効溶接長（mm）；N = 溶接ビード本数（片面=1、両面=2）。',
          },
          {
            label: 'のど断面平均せん断応力',
            formula: 'τ = F / A_w = F / (0.7071 * s * L_eff * N)',
            note: 'のど断面全体にせん断応力が均一分布すると仮定；単位は MPa (N/mm²)。',
          },
          {
            label: 'AWS規格 前面すみ肉溶接強度割増し係数',
            formula: 'F_v(θ) = 0.30 * F_EXX * (1.0 + 0.50 * sin^1.5(θ))',
            note: '荷重がビード軸に直角な前面すみ肉（θ = 90°）は、平行な側面すみ肉（θ = 0°）よりも許容強度が50%高くなります。',
          },
        ],
        workedExample: {
          title: '設計荷重120 kNの引張部材に対する両面重ねすみ肉継手の設計',
          given: [
            '設計引張荷重 F = 120 kN (120,000 N)',
            '母材板厚 t = 12 mm, 部材幅 w = 120 mm',
            '溶接棒：AWS E7018（引張強さ F_EXX = 483 MPa, 許容せん断応力 τ_allow = 144.9 MPa）',
            '脚長 s = 8.0 mm（上下両面等脚すみ肉ビード）',
          ],
          steps: [
            '理論のど厚を計算：a = 0.7071 * 8.0 mm = 5.657 mm。',
            '必要な総有効面積：A_req = F / τ_allow = 120,000 N / 144.9 MPa = 828.2 mm²。',
            '必要な総溶接ビード長：L_total = A_req / a = 828.2 mm² / 5.657 mm = 146.4 mm。',
            '両面対称溶接（2本）とする場合の1本あたりの長さ：L = 146.4 / 2 = 73.2 mm。',
            '脚長 8 mm、溶接長 L = 80 mm の両面すみ肉溶接を採用（総有効長 L_eff = 160 mm）。実せん断応力 τ = 120,000 / (5.657 * 160) = 132.6 MPa（AWS許容値に対する安全率 = 1.09、合格）。',
          ],
          answer: '脚長 8 mm、両面溶接長 L ≥ 75 mm 各側（E7018溶接棒）',
        },
      },
      {
        title: '偏心片持ちブラケット溶接群の直接せん断と二次ねじりせん断',
        summary:
          '外力が溶接群の図心から偏心距離（e）離れた位置に作用する場合、溶接継手は荷重線に平行な一次直接せん断（τ′）と、偏心モーメントに起因する二次ねじりせん断（τ″）を同時に負担しなければなりません。単位溶接法（ブロジェット／シグレーの手法）では、のど厚 a = 1 mm の線として図心 (xc, yc) および単位極断面二次モーメント (Ju) を算定し、τ′ と τ″ をベクトル合成して最外縁の最大合成せん断応力を導出します。',
        equations: [
          {
            label: '一次直接せん断応力',
            formula: 'τ′ = F / A_w = F / (a * A_u)',
            note: '外力 F に平行な下向きベクトルとして溶接群全体に均等に分布します。',
          },
          {
            label: '二次ねじりせん断応力',
            formula: 'τ″ = (M * r_max) / J_w = (F * e * r_max) / (a * J_u)',
            note: 'M = F * e（偏心ねじりモーメント）；r_max = 図心から最危険外縁点までの半径距離。',
          },
          {
            label: '単位極断面二次モーメント（2本平行縦溶接）',
            formula: 'J_u = (d³ / 6) + (d * b² / 2)  （高さ d、間隔 b の縦溶接2本）',
            note: '実際の極断面二次モーメント J_w = a * J_u (mm⁴)。',
          },
          {
            label: 'ベクトル合成最大せん断応力',
            formula: 'τ_max = √[ (τ″_x)² + (τ′ + τ″_y)² ]',
            note: '直接せん断と二次ねじりの垂直成分が同方向で加算される最危険隅角部で評価。',
          },
        ],
        workedExample: {
          title: '2本縦すみ肉溶接による偏心ブラケット継手の応力評価',
          given: [
            '下向き荷重 F = 40 kN (40,000 N)、溶接中心線からの偏心距離 e = 180 mm',
            '平行縦溶接2本：高さ d = 200 mm、中心間隔 b = 100 mm',
            '脚長 s = 10 mm（のど厚 a = 7.071 mm）、E7018溶接棒（許容せん断 τ_allow = 144.9 MPa）',
          ],
          steps: [
            '単位溶接長と実面積：A_u = 2 * 200 = 400 mm；A_w = 7.071 * 400 = 2,828.4 mm²。',
            '一次直接せん断応力：τ′ = 40,000 N / 2,828.4 mm² = 14.14 MPa（下向き）。',
            '単位極断面二次モーメント：J_u = (200³ / 6) + (200 * 100² / 2) = 1,333,333 + 1,000,000 = 2,333,333 mm³。',
            '実際の極断面二次モーメント：J_w = 7.071 * 2,333,333 = 1.650 * 10⁷ mm⁴。',
            'ねじりモーメント：M = 40,000 N * 180 mm = 7,200,000 N·mm。',
            '図心 (0,0) からの最危険隅角座標：x = 50 mm, y = 100 mm（半径 r = 111.8 mm）。',
            '二次せん断成分：τ″_x = (7.2e6 * 100) / 1.65e7 = 43.64 MPa（水平成分）。',
            'τ″_y = (7.2e6 * 50) / 1.65e7 = 21.82 MPa（垂直下向き成分）。',
            '合成最大せん断応力：τ_max = √[ (43.64)² + (14.14 + 21.82)² ] = √[ 1,904.4 + 1,293.1 ] = 56.55 MPa。',
            '許容値との比較：56.55 MPa < 144.9 MPa（安全率 = 2.56、合格）。',
          ],
          answer: 'τ_max = 56.6 MPa（安全率 2.56、AWS E7018基準に適合）',
        },
      },
      {
        title: '突合せ溶接（開先溶接）とAWS／ISO許容応力設計基準',
        summary:
          '突合せ溶接（Groove Welds）は鋼板同士を端面突合せで接合します。完全溶込み溶接（Complete Joint Penetration, CJP）は母材板厚全体にわたり100%健全に溶融結合するため、有効のど厚が板厚と同一（a = t）となり、母材と同等の許容強度を発揮します。一方、部分溶込み溶接（PJP）はルート部に未溶融部を残すため疲労荷重を受ける重要部位への適用は制限されます。AWS D1.1およびAISC規格において、引張を受けるCJP溶接の許容引張応力は 0.60 · Fy、すみ肉せん断許容応力は 0.30 · F_EXX と規定されています。',
        equations: [
          {
            label: '突合せ溶接の有効のど断面積',
            formula: 'A_w = a * w = (CJP: t, PJP: t_w) * w',
            note: 't = 板厚（mm）；w = 板幅（mm）；表面余盛（補強ビード）高さは強度計算から除外。',
          },
          {
            label: '軸方向垂直応力',
            formula: 'σ_axial = F / A_w',
            note: '開先溶接断面に直角に作用する引張または圧縮応力。',
          },
          {
            label: '面内曲げ応力',
            formula: 'σ_bending = M / Z_w = (6 * M) / (a * w²)',
            note: 'Z_w = 面内中立軸に対する溶接のど断面の断面係数。',
          },
          {
            label: '合成ピーク垂直応力',
            formula: 'σ_max = |σ_axial| + |σ_bending|',
            note: '規格の許容引張・圧縮応力限度 σ_allow = 0.60 * F_y を超えてはならない。',
          },
        ],
        workedExample: {
          title: '軸引張力と面内曲げを受けるI形鋼フランジCJP突合せ継手の応力照査',
          given: [
            '板厚 t = 20 mm, フランジ幅 w = 180 mm',
            'Single-V 開先完全溶込み溶接（CJP）、E7018溶接棒（降伏点 F_y = 400 MPa, 許容引張応力 σ_allow = 240 MPa）',
            '作用軸引張力 F = 360 kN, 面内曲げモーメント M = 12 kN·m',
          ],
          steps: [
            'CJP突合せ溶接の有効のど厚：a = t = 20 mm。',
            '有効断面積：A_w = 20 mm * 180 mm = 3,600 mm²。',
            '軸引張応力：σ_axial = 360,000 N / 3,600 mm² = 100.0 MPa。',
            '面内断面係数：Z_w = (a * w²) / 6 = (20 * 180²) / 6 = 108,000 mm³。',
            '曲げ応力：σ_bending = (12 * 10⁶ N·mm) / 108,000 mm³ = 111.1 MPa。',
            '最大合成引張応力：σ_max = 100.0 + 111.1 = 211.1 MPa。',
            '許容値との照査：σ_max = 211.1 MPa < σ_allow = 240.0 MPa（安全率 = 1.14、合格）。',
          ],
          answer: 'σ_max = 211.1 MPa（許容値：240 MPa, 安全率 = 1.14）',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '構造用ブラケットが公称脚長 s = 10.0 mm の等脚すみ肉溶接で接合されています。設計上の理論のど厚（a）を mm 単位で求めてください。',
        hint: '45°等脚すみ肉溶接の場合、a = s * cos(45°) = s / √2 ≈ 0.7071 * s です。',
        targetValue: 7.07,
        unit: 'mm',
        tolerance: 0.05,
        solutionSteps: [
          'のど厚係数 = cos(45°) = 1 / √2 ≈ 0.7071',
          'a = 10.0 mm * 0.7071 = 7.071 mm',
        ],
      },
      {
        id: 'p2',
        prompt:
          '両面重ねすみ肉継手が前面横方向引張荷重 F = 120 kN (120,000 N) を受けています。上下両面のすみ肉ビードはともに脚長 s = 8.0 mm、長さ L = 150 mm（総有効長 L_eff = 300 mm）です。有効のど断面に生じる平均せん断応力を MPa 単位で算定してください。',
        hint: 'a = 0.7071 * s；総有効面積 Aw = a * L_eff；τ = F / Aw。',
        targetValue: 70.7,
        unit: 'MPa',
        tolerance: 1.0,
        solutionSteps: [
          '理論のど厚 a = 0.7071 * 8.0 mm = 5.657 mm',
          '総有効溶接長 L_eff = 2 * 150 mm = 300 mm',
          '有効のど断面積 Aw = 5.657 mm * 300 mm = 1,697.1 mm²',
          'せん断応力 τ = 120,000 N / 1,697.1 mm² = 70.7 MPa',
        ],
      },
      {
        id: 'p3',
        prompt:
          '片持ちブラケットが高さ d = 200 mm、脚長 s = 10.0 mm（a = 7.071 mm）の2本平行縦すみ肉溶接で取り付けられています。ブラケットに下向き荷重 F = 40 kN が作用するとき、溶接部に生じる一次直接せん断応力 τ′ を MPa 単位で求めてください。',
        hint: '一次せん断 τ′ = F / Aw（Aw = 2 * a * d）。',
        targetValue: 14.1,
        unit: 'MPa',
        tolerance: 0.5,
        solutionSteps: [
          '理論のど厚 a = 0.7071 * 10.0 mm = 7.071 mm',
          '有効溶接面積 Aw = 2 * 7.071 mm * 200 mm = 2,828.4 mm²',
          '一次直接せん断応力 τ′ = 40,000 N / 2,828.4 mm² = 14.14 MPa',
        ],
      },
      {
        id: 'p4',
        prompt:
          '板厚 t = 16.0 mm、板幅 w = 150.0 mm の2枚の鋼板が完全溶込み突合せ溶接（CJP）で接合されています。軸引張荷重 F = 360 kN を受けるとき、開先断面に生じる引張垂直応力 σ を MPa 単位で求めてください。',
        hint: 'CJP突合せ溶接では設計のど厚 a = 板厚 t です。σ = F / (t * w)。',
        targetValue: 150.0,
        unit: 'MPa',
        tolerance: 1.0,
        solutionSteps: [
          '開先断面積 Aw = 16.0 mm * 150.0 mm = 2,400 mm²',
          '引張荷重 F = 360,000 N',
          '引張垂直応力 σ = 360,000 N / 2,400 mm² = 150.0 MPa',
        ],
      },
      {
        id: 'p5',
        prompt:
          'AWS D1.1構造溶接基準に基づき、引張強さ F_EXX = 483 MPa (70 ksi) を有するAWS E7018溶接棒を用いたすみ肉溶接の許容せん断応力は 0.30 * F_EXX と規定されています。この許容せん断応力値を MPa 単位で算定してください。',
        hint: '許容せん断応力 τ_allow = 0.30 * 483 MPa です。',
        targetValue: 144.9,
        unit: 'MPa',
        tolerance: 0.5,
        solutionSteps: [
          'F_EXX = 483 MPa',
          '許容せん断応力 τ_allow = 0.30 * 483 MPa = 144.9 MPa',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'すみ肉溶接の強度計算において、溶接脚長（s）ではなく理論のど厚（a = 0.707s）が基準寸法として用いられる力学的理由は何ですか？',
        options: [
          'のど断面は溶接ルートから表面に至る最短断面であり、せん断応力が最大となって最も破断しやすい危険破壊断面であるため',
          '標準的な溶接ゲージでは脚長を物理的に測定できないため',
          'アーク発生時に脚長部分の溶着金属が蒸発して消失するため',
          'AWS規格がインチ単位の脚長寸法を禁止しているため',
        ],
        correctIndex: 0,
        explanation:
          'すみ肉溶接の理論のど厚（a = s · cos 45° ≈ 0.707s）は、溶接ビードの幾何学的最小断面厚さを表します。引張やせん断荷重が作用した際、最も断面積が小さく抵抗力の低いこののど断面に沿ってせん断すべり破壊が進展するため、強度設計の基準とされます。',
      },
      {
        id: 'q2',
        question:
          'AWS D1.1規格において、ビード軸に直角に荷重を受ける前面すみ肉溶接の許容荷重が、平行な側面すみ肉溶接より50%高く設定されている理由は何ですか？',
        options: [
          '前面すみ肉ののど断面には垂直引張応力とせん断応力が複合して作用し、破断に至るまでに要する塑性変形エネルギーが側面せん断より大きいため',
          '前面溶接は溶接棒の溶着作業により長い時間を要するため',
          '前面すみ肉溶接は常にサブマージアーク溶接（SAW）で施工されるため',
          '建築鉄骨構造において側面すみ肉溶接の使用が全面的に禁止されているため',
        ],
        correctIndex: 0,
        explanation:
          '溶接学会およびAWSの多数の破断実験により、荷重が溶接ビード軸に直角な前面すみ肉溶接（θ = 90°）は、ビードに平行な純粋せん断（θ = 0°）と比較して破断耐力が約1.5倍高くなることが実証されています。',
      },
      {
        id: 'q3',
        question:
          '偏心片持ちブラケット溶接群において、最危険隅角部での一次直接せん断（τ′）と二次ねじりせん断（τ″）はどのように合成されますか？',
        options: [
          '水平成分と垂直成分をそれぞれ別個に加算し、平方和の平方根としてベクトル合成する',
          '二つの応力値を単純に乗算する',
          '二次ねじりせん断応力は常に一次せん断応力を完全に相殺してゼロにする',
          '偏心距離が100 mmを超える場合、一次直接せん断応力は無視される',
        ],
        correctIndex: 0,
        explanation:
          '一次直接せん断 τ′ は荷重に平行な下向きベクトル、二次ねじりせん断 τ″ は図心からの位置ベクトルに垂直な接線方向ベクトルです。最危険部では垂直成分が同方向となって重なり合うため、τ_max = √[ (τ″_x)² + (τ′ + τ″_y)² ] のベクトル合成則でピーク応力を求めます。',
      },
      {
        id: 'q4',
        question:
          '完全溶込み突合せ溶接（CJP）と部分溶込み突合せ溶接（PJP）の構造性能上の根本的な相違点はどれですか？',
        options: [
          'CJPは母材全厚にわたり100%健全に溶融結合し母材と同等の強度を発揮するが、PJPはルート部に未溶融部を残すため疲労破壊の起点となりやすい',
          'CJP溶接は溶加材（溶接棒・ワイヤ）を一切使用せずに母材のみを溶かす',
          'PJP溶接はCJP溶接よりも許容引張応力が大幅に高い',
          'PJP溶接は変動荷重を受ける高サイクル疲労部材に必須とされる',
        ],
        correctIndex: 0,
        explanation:
          '完全溶込み溶接（CJP）は母材板厚全体に完全な溶融結合を達成するため、継手効率100%（母材と同等の許容応力）が認められます。一方、部分溶込み溶接（PJP）は未溶融のルートスリットが鋭利な切欠きとなって高応力集中を生むため、疲労環境や重要引張接合には不適です。',
      },
      {
        id: 'q5',
        question:
          '突合せ溶接表面に盛り上がった「余盛（Reinforcement cap）」が、強度設計における有効のど厚計算から除外される主な工学的理由は何ですか？',
        options: [
          '余盛は静的破断強度をほとんど向上させない一方、止端部に急激な形状変化（切欠き）を形成して疲労寿命を著しく低下させるため',
          '余盛部の溶着金属は比重がゼロであるため',
          '溶接測定ノギスでは余盛の高さを測定できないため',
          'あらゆる構造用鋼溶接において余盛は必ずグラインダで完全切削されるため',
        ],
        correctIndex: 0,
        explanation:
          'AWS D1.1や各種規格では、余盛はルート部の破断防止には寄与しないこと、および余盛止端部（トウ部）のフランク角が鋭い切欠き応力集中（Kt ≈ 1.2〜1.6）となって疲労き裂を誘発するため、設計有効のど厚から除外されます。',
      },
      {
        id: 'q6',
        question:
          '被覆アーク手溶接棒「E7018」のAWS規格呼称記号の正しい技術的意味はどれですか？',
        options: [
          '被覆アーク溶接棒（E）、最小引張強さ70 ksi≒483 MPa（70）、全姿勢溶接可能（1）、低水素系鉄粉配合被覆・DC+/AC電源対応（8）',
          '緊急補修用（E）、最大棒長70 mm（70）、単層盛専用（1）、炭素含有量8%（8）',
          '輸出用高品質（E）、降伏点700 MPa（70）、下向姿勢限定（1）、心線径8番（8）',
          '押出成形合金（E）、適正電流70 A（70）、芯線太さ1 mm（1）、グレード8鋼（8）',
        ],
        correctIndex: 0,
        explanation:
          'AWS A5.1規格において：Eは溶接電極（Electrode）；70は最小引張強さ（70 ksi ≈ 483 MPa）；1は全姿勢（下向・立向・横向・上向）溶接対応；8は低水素系鉄粉配合被覆剤を示し、低温割れ感受性が極めて低い高靭性構造用溶接棒を意味します。',
      },
    ],
  },
});
