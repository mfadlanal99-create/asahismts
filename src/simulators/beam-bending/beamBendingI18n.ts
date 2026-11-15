import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('beam-bending', {
  id: {
    title: 'Lenturan Balok, Diagram Gaya Geser & Momen Lentur (SFD & BMD)',
    shortTitle: 'Lenturan Balok SFD/BMD',
    description:
      'Simulator mekanika bahan interaktif untuk lenturan balok, diagram gaya geser (SFD), diagram momen lentur (BMD), dan kurva lendutan elastis. Analisis balok tumpuan sederhana, kantilever, dan balok menggantung dengan beban terpusat maupun terdistribusi merata, tegangan penampang, serta faktor keamanan terhadap luluh.',
    explore: [
      {
        title: 'Teori Balok Euler-Bernoulli & Formula Lentur (σ = M·y / I)',
        summary:
          'Di bawah beban transversal, balok mengalami momen lentur internal yang menghasilkan tegangan normal longitudinal yang bervariasi secara linier di sepanjang ketinggian penampang. Hipotesis Euler-Bernoulli mengasumsikan bahwa penampang bidang tegak lurus terhadap sumbu longitudinal tetap bidang dan tegak lurus setelah lentur. Rumus lentur Navier menghubungkan tegangan normal σ dengan momen lentur M, jarak serat dari sumbu netral y, dan momen inersia penampang I.',
        equations: [
          {
            label: 'Formula Lentur Elastis Navier',
            formula: 'σ(y) = (M * y) / I',
            note: 'M = momen lentur (N·mm), y = jarak dari sumbu netral (mm), I = momen inersia (mm⁴); tegangan dalam MPa.',
          },
          {
            label: 'Tegangan Lentur Maksimum & Modulus Penampang',
            formula: 'σ_max = (M_max * c) / I = M_max / S',
            note: 'c = jarak serat terluar (mm), S = I / c = modulus penampang elastis (mm³).',
          },
          {
            label: 'Sifat Penampang Persegi Panjang',
            formula: 'I = (b * h³) / 12,   S = (b * h²) / 6',
            note: 'b = lebar (mm), h = tinggi (mm); sumbu netral berada di tengah ketinggian (c = h/2).',
          },
          {
            label: 'Faktor Keamanan (FoS) Terhadap Luluh',
            formula: 'FoS = σ_yield / σ_max',
            note: 'FoS ≥ 1.5 menunjukkan desain struktural aman dalam rentang elastis linier.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Tegangan Lentur Maksimum pada Balok Baja Profil I',
          given: [
            'Panjang bentang tumpuan sederhana L = 6.0 m',
            'Beban terpusat tengah bentang P = 40.0 kN (40,000 N)',
            'Modulus penampang profil baja S_x = 350 × 10³ mm³ (350 cm³)',
            'Kekuatan luluh baja ASTM A36 σ_y = 250 MPa',
          ],
          steps: [
            'Hitung momen lentur maksimum di tengah bentang: M_max = (P * L) / 4 = (40 kN * 6.0 m) / 4 = 60.0 kN·m.',
            'Konversikan satuan momen ke N·mm: M_max = 60.0 × 10⁶ N·mm.',
            'Hitung tegangan lentur serat terluar: σ_max = M_max / S_x = (60.0 × 10⁶ N·mm) / (350 × 10³ mm³) = 171.43 MPa.',
            'Tentukan Faktor Keamanan: FoS = σ_y / σ_max = 250 MPa / 171.43 MPa = 1.46.',
            'Balok berada dalam batas elastis aman tanpa mengalami deformasi plastis permanen.',
          ],
          answer: 'σ_max = 171.4 MPa, FoS = 1.46 (Aman dalam Batas Elastis)',
        },
      },
      {
        title: 'Hubungan Diferensial Gaya Geser & Momen Lentur',
        summary:
          'Keseimbangan diferensial elemen balok infinitesimal mengungkap hubungan matematis fundamental antara intensitas beban transversal w(x), gaya geser V(x), dan momen lentur M(x). Turunan pertama gaya geser sama dengan nilai negatif beban merata (dV/dx = -w), sedangkan turunan pertama momen lentur sama dengan gaya geser (dM/dx = V). Oleh karena itu, puncak momen lentur maksimum terjadi tepat pada titik di mana gaya geser melintasi nilai nol.',
        equations: [
          {
            label: 'Hubungan Beban terhadap Geser',
            formula: 'dV / dx = -w(x)',
            note: 'Kemiringan diagram gaya geser pada titik mana pun sama dengan nilai negatif intensitas beban terdistribusi.',
          },
          {
            label: 'Hubungan Geser terhadap Momen',
            formula: 'dM / dx = V(x)',
            note: 'Kemiringan diagram momen lentur pada titik mana pun sama dengan gaya geser internal.',
          },
          {
            label: 'Perubahan Momen Integral (Luas Diagram SFD)',
            formula: 'ΔM = M(x₂) - M(x₁) = ∫ V(x) dx',
            note: 'Perubahan nilai momen lentur antara dua titik sama dengan luas bersih di bawah kurva gaya geser.',
          },
          {
            label: 'Kondisi Puncak Momen Lentur',
            formula: 'dM / dx = 0  =>  V(x) = 0',
            note: 'Titik ekstrem lokal momen lentur terjadi saat diagram gaya geser melintasi sumbu nol.',
          },
        ],
        workedExample: {
          title: 'Menentukan Puncak Momen Lentur dari Diagram Geser untuk Beban Merata',
          given: [
            'Bentang balok tumpuan sederhana L = 5.0 m',
            'Beban merata penuh w = 16.0 kN/m sepanjang balok',
          ],
          steps: [
            'Hitung reaksi vertikal tumpuan: R_A = R_B = (w * L) / 2 = (16.0 kN/m * 5.0 m) / 2 = 40.0 kN.',
            'Rumuskan persamaan gaya geser: V(x) = R_A - w * x = 40.0 - 16.0 * x (dalam kN).',
            'Cari posisi geser nol: V(x) = 0 => 40.0 - 16.0 * x = 0 => x = 2.50 m (tengah bentang).',
            'Hitung momen dari luas segitiga SFD antara x = 0 dan x = 2.5 m: Luas = 0.5 * alas * tinggi = 0.5 * 2.5 m * 40.0 kN = 50.0 kN·m.',
            'Verifikasi dengan formula analitis standar: M_max = (w * L²) / 8 = (16.0 * 5.0²) / 8 = 50.0 kN·m.',
          ],
          answer: 'M_max = 50.0 kN·m pada x = 2.50 m (Lokasi Geser Nol)',
        },
      },
      {
        title: 'Lendutan Balok Euler-Bernoulli & Kekakuan Elastis (E·I)',
        summary:
          'Batas Kemampuan Layanan (Serviceability Limit State / SLS) menetapkan bahwa lendutan elastis balok tidak boleh berlebihan sehingga mencegah retak plafon, kerusakan mesin presisi, atau rasa tidak aman bagi pengguna bangunan. Persamaan diferensial d²v/dx² = M(x) / (E·I) menghubungkan kelengkungan dengan kekakuan lentur E·I. Integrasi ganda dengan syarat batas geometris menghasilkan kurva lendutan elastis penuh δ(x).',
        equations: [
          {
            label: 'Kelengkungan Balok & Persamaan Diferensial Lendutan',
            formula: 'd²v / dx² = M(x) / (E * I)',
            note: 'v(x) = lendutan elastis, E = modulus Young (GPa), I = momen inersia (mm⁴).',
          },
          {
            label: 'Lendutan Pusat — Beban Terpusat (Tumpuan Sederhana)',
            formula: 'δ_max = (P * L³) / (48 * E * I)',
            note: 'P = beban terpusat tengah (N), L = bentang (mm); lendutan maksimum di tengah bentang.',
          },
          {
            label: 'Lendutan Pusat — Beban Merata Penuh (Tumpuan Sederhana)',
            formula: 'δ_max = (5 * w * L⁴) / (384 * E * I)',
            note: 'w = intensitas beban (N/mm), L = bentang (mm); kasus standar balok lantai dan gelagar.',
          },
          {
            label: 'Lendutan Ujung — Beban Terpusat (Kantilever)',
            formula: 'δ_max = (P * L³) / (3 * E * I)',
            note: 'P = beban terpusat ujung bebas (N); lendutan terbesar terjadi di ujung bebas.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Lendutan Tengah Bentang dan Verifikasi Batas L/360',
          given: [
            'Bentang balok tumpuan sederhana L = 4.0 m = 4000 mm',
            'Profil baja dengan E = 200 GPa (200,000 N/mm²), I_x = 21.4 × 10⁶ mm⁴',
            'Beban terpusat tengah P = 25.0 kN = 25,000 N',
            'Batas lendutan arsitektural: δ_allow = L / 360',
          ],
          steps: [
            'Hitung kekakuan lentur: E·I = 200,000 N/mm² * 21.4 × 10⁶ mm⁴ = 4.28 × 10¹² N·mm².',
            'Hitung lendutan tengah bentang: δ_max = (P * L³) / (48 * E * I) = (25,000 * 4000³) / (48 * 4.28 × 10¹²) = (1.60 × 10¹⁵) / (2.0544 × 10¹⁴) = 7.79 mm.',
            'Hitung batas lendutan izin: δ_allow = 4000 mm / 360 = 11.11 mm.',
            'Bandingkan: 7.79 mm ≤ 11.11 mm, memenuhi kriteria kelayakan struktur dengan marjin yang memadai.',
          ],
          answer: 'δ_max = 7.79 mm ≤ 11.11 mm (Lolos kriteria batas L/360)',
        },
      },
      {
        title: 'Optimasi Penampang: Profil I vs Balok Pejal Persegi vs Lingkaran',
        summary:
          'Efisiensi struktural dalam menahan beban lentur ditentukan oleh bagaimana luas penampang didistribusikan terhadap sumbu netral. Karena regangan dan tegangan lentur bernilai nol di sumbu netral dan mencapai maksimum pada serat terluar (y = ±c), material yang diletakkan di dekat sumbu netral hampir tidak berkontribusi pada tahanan lentur namun menambah beban mati. Profil berflensa seperti balok I memusatkan material pada sayap (flens) di mana tegangan tertinggi terjadi, menghasilkan modulus penampang tertinggi per kilogram material.',
        equations: [
          {
            label: 'Faktor Efisiensi Penampang (ρ)',
            formula: 'ρ = I / (A * c²)',
            note: 'Rasio tanpa dimensi; mengukur seberapa jauh luas penampang terkonsentrasi dari sumbu netral.',
          },
          {
            label: 'Persegi Pejal vs Lingkaran Pejal',
            formula: 'ρ_rect = 1 / 3 ≈ 0.333,   ρ_circle = 1 / 4 = 0.250',
            note: 'Batang silinder pejal 25% kurang efisien dalam menahan lentur dibandingkan balok persegi dengan tinggi sama.',
          },
          {
            label: 'Efisiensi Balok Profil I (Flensa Lebar)',
            formula: 'ρ_I-beam ≈ 0.55 - 0.70',
            note: 'Badan tipis dan sayap tebal memberikan kekakuan lentur hingga dua kali lipat dibanding balok pejal bermassa sama.',
          },
        ],
        workedExample: {
          title: 'Penghematan Berat Menggunakan Profil I Dibandingkan Persegi Pejal',
          given: [
            'Momen lentur desain M = 30.0 kN·m',
            'Tegangan lentur izin σ_allow = 150 MPa',
            'Modulus penampang yang dibutuhkan S_req = M / σ_allow = 30.0 × 10⁶ / 150 = 200,000 mm³',
            'Opsi balok I (tinggi d = 200 mm): S_x = 202,000 mm³, luas penampang A_I = 2,425 mm²',
            'Balok persegi pejal dengan tinggi sama (h = 200 mm): S = (b * h²) / 6 => b = 30 mm, luas A_rect = 6,000 mm²',
          ],
          steps: [
            'Kedua profil memberikan kapasitas lentur yang setara (~200,000 mm³).',
            'Bandingkan luas penampang: A_I = 2,425 mm² vs A_rect = 6,000 mm².',
            'Hitung rasio massa: A_I / A_rect = 2,425 / 6,000 = 0.404 (40.4%).',
            'Penghematan berat: 100% - 40.4% = 59.6% reduksi bobot balok untuk daya dukung beban yang persis sama.',
          ],
          answer: 'Penghematan bobot 59.6% dengan profil balok I teroptimasi',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Sebuah balok tumpuan sederhana sepanjang 4.0 m menahan beban terpusat tunggal P = 24.0 kN pada jarak 1.0 m dari tumpuan kiri A. Hitung gaya reaksi pada tumpuan A (R_A) dalam kN.',
        hint: 'Gunakan keseimbangan momen terhadap tumpuan B (x = 4.0 m): R_A * L = P * (L - a).',
        targetValue: 18.0,
        unit: 'kN',
        tolerance: 0.2,
        solutionSteps: [
          'Terapkan persamaan keseimbangan momen di tumpuan B: ΣM_B = 0.',
          'Persamaan: R_A * 4.0 m - 24.0 kN * (4.0 m - 1.0 m) = 0.',
          'R_A * 4.0 = 24.0 * 3.0 = 72.0 kN·m.',
          'R_A = 72.0 / 4.0 = 18.0 kN.',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Sebuah balok tumpuan sederhana sepanjang 6.0 m menerima beban merata w = 10.0 kN/m pada seluruh bentangnya. Hitung momen lentur maksimum (M_max) dalam kN·m.',
        hint: 'Untuk balok tumpuan sederhana dengan beban merata penuh, momen maksimum berada di tengah bentang sebesar (w * L²) / 8.',
        targetValue: 45.0,
        unit: 'kN·m',
        tolerance: 0.5,
        solutionSteps: [
          'Gunakan rumus momen lentur maksimum standar: M_max = (w * L²) / 8.',
          'Masukkan nilai: w = 10.0 kN/m, L = 6.0 m.',
          'M_max = (10.0 * 6.0²) / 8 = (10.0 * 36.0) / 8 = 360.0 / 8 = 45.0 kN·m.',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Sebuah balok kantilever sepanjang 2.5 m dengan modulus penampang S_x = 125 × 10³ mm³ menahan beban terpusat P = 8.0 kN di ujung bebasnya. Hitung tegangan lentur maksimum (σ_max) pada tumpuan jepit dalam MPa.',
        hint: 'Pada kantilever, momen maksimum terjadi di pangkal tumpuan: M_max = P * L. Kemudian σ_max = M_max / S_x.',
        targetValue: 160.0,
        unit: 'MPa',
        tolerance: 1.0,
        solutionSteps: [
          'Hitung momen jepit maksimum: M_max = P * L = 8.0 kN * 2.5 m = 20.0 kN·m.',
          'Konversikan momen ke N·mm: M_max = 20.0 × 10⁶ N·mm.',
          'Hitung tegangan lentur maksimum: σ_max = M_max / S_x = (20.0 × 10⁶ N·mm) / (125 × 10³ mm³) = 160.0 MPa.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Hitung modulus penampang elastis S_x (dalam cm³) untuk balok kayu berpenampang persegi panjang dengan lebar b = 120 mm dan tinggi h = 200 mm.',
        hint: 'Rumus modulus penampang persegi: S_x = (b * h²) / 6. Ubah satuan mm³ ke cm³ dengan membagi 1.000.',
        targetValue: 800.0,
        unit: 'cm³',
        tolerance: 5.0,
        solutionSteps: [
          'Gunakan formula modulus penampang: S_x = (b * h²) / 6.',
          'Masukkan dimensi penampang: b = 120 mm, h = 200 mm.',
          'S_x = (120 * 200²) / 6 = (120 * 40.000) / 6 = 4.800.000 / 6 = 800.000 mm³.',
          'Konversikan ke cm³: 800.000 mm³ / 1.000 = 800.0 cm³.',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Sebuah balok baja sepanjang 3.0 m (E = 200 GPa, I = 15.0 × 10⁶ mm⁴) menahan beban terpusat tengah P = 16.0 kN. Hitung lendutan maksimum di tengah bentang (δ_max) dalam mm.',
        hint: 'Formula lendutan: δ_max = (P * L³) / (48 * E * I). Samakan seluruh satuan ke N dan mm.',
        targetValue: 3.0,
        unit: 'mm',
        tolerance: 0.1,
        solutionSteps: [
          'Konversikan parameter ke satuan dasar: P = 16.000 N, L = 3.000 mm, E = 200.000 N/mm², I = 15.0 × 10⁶ mm⁴.',
          'Pembilang: P * L³ = 16.000 * 3.000³ = 16.000 * 2.7 × 10¹⁰ = 4.32 × 10¹⁴ N·mm³.',
          'Penyebut: 48 * E * I = 48 * 200.000 * 15.0 × 10⁶ = 1.44 × 10¹⁴ N·mm².',
          'Hitung lendutan: δ_max = (4.32 × 10¹⁴) / (1.44 × 10¹⁴) = 3.00 mm.',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Pada titik manakah di sepanjang balok momen lentur internal mencapai nilai maksimum atau minimum lokal?',
        options: [
          'Pada titik di mana diagram gaya geser internal V(x) melintasi sumbu nol (V = 0)',
          'Tepat di titik di mana lendutan balok bernilai nol',
          'Hanya tepat di bawah tumpuan engsel/sendi',
          'Pada penampang dengan luas terkecil',
        ],
        correctIndex: 0,
        explanation:
          'Berdasarkan hubungan diferensial dM/dx = V(x), turunan pertama momen lentur sama dengan gaya geser. Suatu fungsi kontinu mencapai nilai ekstrem lokal (maksimum atau minimum) saat turunan pertamanya sama dengan nol; oleh karena itu puncak momen terjadi saat V = 0.',
      },
      {
        id: 'q2',
        question:
          'Mengapa penampang profil I (wide flange) jauh lebih efisien secara struktural dalam menahan lentur dibandingkan balok pejal persegi dengan berat yang sama?',
        options: [
          'Flensa (sayap) tebal menempatkan mayoritas massa pada jarak terjauh (y = ±c) dari sumbu netral, memaksimalkan momen inersia I',
          'Badan profil I memiliki rongga udara yang menurunkan tegangan termal internal',
          'Profil I memiliki modulus elastisitas Young yang lebih rendah sehingga mudah beradaptasi',
          'Profil I hanya menerima beban torsi murni dan terbebas dari momen lentur',
        ],
        correctIndex: 0,
        explanation:
          'Tegangan lentur bertambah secara linier seiring jarak dari sumbu netral (σ = M·y / I), dengan nilai nol di sumbu netral. Balok profil I memusatkan material pada sayap luar di mana tegangan tertinggi berada, menghasilkan I dan S yang sangat besar untuk berat baja yang sama.',
      },
      {
        id: 'q3',
        question:
          'Bagaimanakah syarat batas gaya geser V dan momen lentur M pada ujung bebas suatu balok kantilever?',
        options: [
          'Gaya geser dan momen lentur kedua-duanya bernilai nol (V = 0, M = 0)',
          'Gaya geser maksimum dan momen lentur bernilai nol',
          'Momen lentur maksimum dan gaya geser bernilai nol',
          'Lendutan nol dan sudut rotasi 90 derajat',
        ],
        correctIndex: 0,
        explanation:
          'Karena ujung kantilever benar-benar bebas dari kekangan, tanpa tumpuan reaksi dan tanpa momen kopel luar yang bekerja tepat di ujungnya, kondisi keseimbangan internal mensyaratkan V = 0 dan M = 0 pada ujung bebas tersebut.',
      },
      {
        id: 'q4',
        question:
          'Pada balok tumpuan sederhana yang melengkung ke bawah akibat beban gravitasi (momen positif / sagging), bagaimanakah keadaan tegangan pada permukaan atas dan bawah balok?',
        options: [
          'Permukaan atas mengalami tegangan tekan (σ < 0), permukaan bawah mengalami tegangan tarik (σ > 0)',
          'Permukaan atas mengalami tegangan tarik, permukaan bawah mengalami tegangan tekan',
          'Kedua permukaan mengalami tegangan tarik murni yang seragam',
          'Kedua permukaan mengalami tegangan geser murni tanpa adanya tegangan normal',
        ],
        correctIndex: 0,
        explanation:
          'Kelengkungan melorot (sagging) memampatkan serat-serat material di atas sumbu netral (menghasilkan tegangan tekan) dan merenggangkan serat-serat di bawah sumbu netral (menghasilkan tegangan tarik). Sumbu netral tidak mengalami pemanjangan maupun pemendekan.',
      },
      {
        id: 'q5',
        question:
          'Bagaimana perubahan momen lentur antara dua penampang balok (ΔM = M₂ - M₁) direpresentasikan secara geometris pada Diagram Gaya Geser (SFD)?',
        options: [
          'Sebagai luas bersih daerah di bawah kurva gaya geser antara kedua penampang tersebut',
          'Sebagai kemiringan garis lurus yang menghubungkan kedua reaksi tumpuan',
          'Sebagai selisih antara puncak geser positif dan negatif terbesar',
          'Sebagai panjang balok dibagi dengan jumlah beban yang bekerja',
        ],
        correctIndex: 0,
        explanation:
          'Karena dM/dx = V(x), jika kedua ruas diintegrasikan maka ΔM = ∫ V(x) dx. Secara geometris, integral tentu dari kurva V(x) merupakan luas bersih bidang geser antara posisi x₁ dan x₂.',
      },
      {
        id: 'q6',
        question:
          'Apa yang terjadi pada balok baja struktural jika tegangan lentur maksimum yang terjadi melampaui kekuatan luluh material (Faktor Keamanan < 1.0)?',
        options: [
          'Serat terluar mengalami deformasi plastis permanen dan memicu pembentukan sendi plastis (plastic hinge)',
          'Balok langsung hancur berkeping-keping seketika seperti kaca getas tanpa deformasi awal',
          'Momen inersia penampang seketika berlipat ganda secara otomatis',
          'Modulus Young baja meningkat dua kali lipat secara permanen',
        ],
        correctIndex: 0,
        explanation:
          'Baja struktural ulet (seperti ASTM A36) akan luluh ketika σ_max > σ_y. Aliran plastis bermula dari serat terluar dan merambat ke arah sumbu netral. Balok tidak akan kembali lurus saat beban dilepas (mengalami deformasi permanen/lendutan sisa).',
      },
    ],
  },
  ja: {
    title: '梁の曲げ・せん断力図＆曲げモーメント図（SFD & BMD）',
    shortTitle: '梁の曲げ SFD/BMD',
    description:
      '梁の曲げ変形、せん断力図（SFD）、曲げモーメント図（BMD）、弾性たわみ曲線のインタラクティブ材料力学シミュレータ。単純支持梁・片持ち梁・張り出し梁における集中荷重・等分布荷重、断面応力分布、降伏に対する安全率を工学的に解析します。',
    explore: [
      {
        title: 'オイラー・ベルヌーイの梁理論と曲げ応力公式（σ = M·y / I）',
        summary:
          '横荷重を受ける梁の内部には曲げモーメントが発生し、断面高さ方向に線形に変化する軸方向垂直応力が生じます。オイラー・ベルヌーイの仮定（平面保持の仮定）では、変形前の断面平面は曲げ変形後も平面を保ち、弾性曲線に直交します。ナヴィエの曲げ応力公式は、垂直応力σ、曲げモーメントM、中立軸からの距離y、および断面二次モーメントIの関係を厳密に規定します。',
        equations: [
          {
            label: '弾性曲げ応力公式（ナヴィエの式）',
            formula: 'σ(y) = (M * y) / I',
            note: 'M = 曲げモーメント (N·mm), y = 中立軸からの距離 (mm), I = 断面二次モーメント (mm⁴)。応力単位は MPa。',
          },
          {
            label: '最大曲げ応力と断面係数',
            formula: 'σ_max = (M_max * c) / I = M_max / S',
            note: 'c = 最外縁ファイバー距離 (mm), S = I / c = 弾性断面係数 (mm³)。',
          },
          {
            label: '長方形断面の幾何学的特性',
            formula: 'I = (b * h³) / 12,   S = (b * h²) / 6',
            note: 'b = 幅 (mm), h = 高さ (mm)。中立軸は断面中央（c = h/2）に位置します。',
          },
          {
            label: '降伏に対する安全率 (FoS)',
            formula: 'FoS = σ_yield / σ_max',
            note: 'FoS ≥ 1.5 は線形弾性域内の安全な構造設計基準を満たします。',
          },
        ],
        workedExample: {
          title: 'H形鋼（Iビーム）における最大曲げ応力と安全率の算出',
          given: [
            '単純支持スパン長 L = 6.0 m',
            'スパン中央の集中荷重 P = 40.0 kN (40,000 N)',
            '鋼材の断面係数 S_x = 350 × 10³ mm³ (350 cm³)',
            'ASTM A36 構造用炭素鋼の降伏点 σ_y = 250 MPa',
          ],
          steps: [
            'スパン中央の最大曲げモーメントを計算: M_max = (P * L) / 4 = (40 kN * 6.0 m) / 4 = 60.0 kN·m。',
            'モーメントを N·mm に換算: M_max = 60.0 × 10⁶ N·mm。',
            '最外縁の最大曲げ応力を算出: σ_max = M_max / S_x = (60.0 × 10⁶ N·mm) / (350 × 10³ mm³) = 171.43 MPa。',
            '安全率を評価: FoS = σ_y / σ_max = 250 MPa / 171.43 MPa = 1.46。',
            '材料の降伏応力未満であり、永久塑性変形を起こさない弾性域内であることを確認。',
          ],
          answer: 'σ_max = 171.4 MPa, FoS = 1.46（線形弾性域内で安全）',
        },
      },
      {
        title: 'せん断力・曲げモーメントの微分方程式関係',
        summary:
          '微小梁要素のつり合い条件から、分布荷重強度 w(x)、せん断力 V(x)、曲げモーメント M(x) の間に微分積分関係が成立します。せん断力の微分は分布荷重強度の負値（dV/dx = -w）となり、曲げモーメントの微分はせん断力（dM/dx = V）に等しくなります。したがって、せん断力がゼロクロスする位置（V = 0）において曲げモーメントは極大値または極小値を取ります。',
        equations: [
          {
            label: '荷重強度とせん断力の微分関係',
            formula: 'dV / dx = -w(x)',
            note: 'せん断力図（SFD）の傾きは、その点における分布荷重強度の負値に等しい。',
          },
          {
            label: 'せん断力と曲げモーメントの微分関係',
            formula: 'dM / dx = V(x)',
            note: '曲げモーメント図（BMD）の傾きは、その点におけるせん断力の値に等しい。',
          },
          {
            label: 'モーメント変化量（SFD面積積分）',
            formula: 'ΔM = M(x₂) - M(x₁) = ∫ V(x) dx',
            note: '2断面間の曲げモーメントの変化量は、せん断力曲線の面積（積分値）に等しい。',
          },
          {
            label: '最大曲げモーメント発生条件',
            formula: 'dM / dx = 0  =>  V(x) = 0',
            note: '曲げモーメントの極値（ピーク）は、せん断力図がゼロ軸と交差する位置に生じる。',
          },
        ],
        workedExample: {
          title: '等分布荷重を受ける単純梁における最大曲げモーメントの同定',
          given: [
            '単純支持梁のスパン長 L = 5.0 m',
            'スパン全長の等分布荷重 w = 16.0 kN/m',
          ],
          steps: [
            '鉛直反力を計算: R_A = R_B = (w * L) / 2 = (16.0 kN/m * 5.0 m) / 2 = 40.0 kN。',
            'せん断力関数を展開: V(x) = R_A - w * x = 40.0 - 16.0 * x (kN)。',
            'せん断力がゼロとなる位置を算出: V(x) = 0 => 40.0 - 16.0 * x = 0 => x = 2.50 m（中央）。',
            'x = 0 から 2.5 m までの SFD 三角形面積を計算: 面積 = 0.5 * 底辺 * 高さ = 0.5 * 2.5 m * 40.0 kN = 50.0 kN·m。',
            '標準解析解公式と照合: M_max = (w * L²) / 8 = (16.0 * 5.0²) / 8 = 50.0 kN·m。完全に一致。',
          ],
          answer: 'M_max = 50.0 kN·m（x = 2.50 m のせん断力ゼロ位置）',
        },
      },
      {
        title: '弾性たわみ曲線と曲げ剛性（E·I）の基礎',
        summary:
          '使用性限界状態（SLS）において、梁の過度なたわみは天井のひび割れや機械の噛み合い不良を引き起こすため厳格に規制されます。基礎微分方程式 d²v/dx² = M(x) / (E·I) は、曲率と曲げ剛性 E·I の直接的な比例関係を示します。幾何学的境界条件を満たすように2回積分することで、全スパンのたわみ曲線 δ(x) が導出されます。',
        equations: [
          {
            label: '梁の曲率とたわみ微分方程式',
            formula: 'd²v / dx² = M(x) / (E * I)',
            note: 'v(x) = たわみ変位, E = ヤング率 (GPa), I = 断面二次モーメント (mm⁴)。',
          },
          {
            label: '単純梁・中央集中荷重の最大たわみ',
            formula: 'δ_max = (P * L³) / (48 * E * I)',
            note: 'P = 中央集中荷重 (N), L = スパン (mm); 中央点で最大たわみが発生。',
          },
          {
            label: '単純梁・全スパン等分布荷重の最大たわみ',
            formula: 'δ_max = (5 * w * L⁴) / (384 * E * I)',
            note: 'w = 荷重強度 (N/mm), L = スパン (mm); 床梁・大梁の標準設計式。',
          },
          {
            label: '片持ち梁・先端集中荷重の最大たわみ',
            formula: 'δ_max = (P * L³) / (3 * E * I)',
            note: 'P = 先端集中荷重 (N); 自由端（先端）において最大たわみが発生。',
          },
        ],
        workedExample: {
          title: 'スパン中央たわみの算出と許容たわみ限度（L/360）の検定',
          given: [
            'スパン長 L = 4.0 m = 4000 mm（単純支持）',
            '鋼材断面: E = 200 GPa (200,000 N/mm²), I_x = 21.4 × 10⁶ mm⁴',
            '中央集中荷重 P = 25.0 kN = 25,000 N',
            '建築基準許容たわみ限度: δ_allow = L / 360',
          ],
          steps: [
            '曲げ剛性を計算: E·I = 200,000 N/mm² * 21.4 × 10⁶ mm⁴ = 4.28 × 10¹² N·mm²。',
            '中央たわみを計算: δ_max = (P * L³) / (48 * E * I) = (25,000 * 4000³) / (48 * 4.28 × 10¹²) = (1.60 × 10¹⁵) / (2.0544 × 10¹⁴) = 7.79 mm。',
            '許容たわみ基準値を算出: δ_allow = 4000 mm / 360 = 11.11 mm。',
            '判定: 7.79 mm ≤ 11.11 mm であり、使用性基準を十分に満足。',
          ],
          answer: 'δ_max = 7.79 mm ≤ 11.11 mm（L/360 基準適合）',
        },
      },
      {
        title: '断面形状の最適化：H形鋼 vs 長方形断面 vs 円形中実軸',
        summary:
          '曲げモーメントに対する構造効率は、断面積が中立軸からどのように離れて配置されているかに強く依存します。中立軸上では応力とひずみがゼロであり、最外縁（y = ±c）で最大に達するため、中立軸近傍の材料は曲げ抵抗にほとんど寄与せず自重を増大させるだけです。H形鋼などのフランジ付き断面は、応力が最大のフランジ部に断面積の大部分を集中させることで、重量あたりの断面係数を極大化します。',
        equations: [
          {
            label: '断面効率係数 (ρ)',
            formula: 'ρ = I / (A * c²)',
            note: '中立軸からの断面積の離れ具合を示す無次元形状指標。',
          },
          {
            label: '長方形断面と円形断面の比較',
            formula: 'ρ_rect = 1 / 3 ≈ 0.333,   ρ_circle = 1 / 4 = 0.250',
            note: '中実円形断面は、同深さの長方形断面よりも曲げ抵抗効率が25%低下します。',
          },
          {
            label: '広幅フランジH形鋼の断面効率',
            formula: 'ρ_I-beam ≈ 0.55 - 0.70',
            note: '薄いウェブと肉厚なフランジにより、同質量の長方形材の最大2倍の曲げ剛性を発揮。',
          },
        ],
        workedExample: {
          title: '同等強度におけるH形鋼の軽量化率試算',
          given: [
            '設計曲げモーメント M = 30.0 kN·m',
            '許容曲げ応力 σ_allow = 150 MPa',
            '必要断面係数 S_req = M / σ_allow = 30.0 × 10⁶ / 150 = 200,000 mm³',
            'H形鋼断面（高さ d = 200 mm）: S_x = 202,000 mm³, 断面積 A_I = 2,425 mm²',
            '同一高さの長方形中実断面（h = 200 mm）: S = (b * h²) / 6 => b = 30 mm, 断面積 A_rect = 6,000 mm²',
          ],
          steps: [
            '両断面ともに同等の曲げ耐力（~200,000 mm³）を保持。',
            '断面積を比較: A_I = 2,425 mm² に対し A_rect = 6,000 mm²。',
            '質量比を算出: A_I / A_rect = 2,425 / 6,000 = 0.404 (40.4%)。',
            '軽量化効果: 100% - 40.4% = 59.6% の重量削減を達成。',
          ],
          answer: '最適化されたH形鋼の採用により 59.6% の軽量化を達成',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '長さ 4.0 m の単純支持梁において、左支点 A から 1.0 m の位置に集中荷重 P = 24.0 kN が作用しています。支点 A における鉛直反力（R_A）を kN 単位で求めなさい。',
        hint: '支点 B (x = 4.0 m) 周りのモーメントのつり合いを用います: R_A * L = P * (L - a)。',
        targetValue: 18.0,
        unit: 'kN',
        tolerance: 0.2,
        solutionSteps: [
          '支点 B まわりのモーメントのつり合い式を立てます: ΣM_B = 0。',
          'R_A * 4.0 m - 24.0 kN * (4.0 m - 1.0 m) = 0。',
          'R_A * 4.0 = 24.0 * 3.0 = 72.0 kN·m。',
          'R_A = 72.0 / 4.0 = 18.0 kN。',
        ],
      },
      {
        id: 'p2',
        prompt:
          '長さ 6.0 m の単純支持梁のスパン全長に等分布荷重 w = 10.0 kN/m が作用しています。梁に生じる最大曲げモーメント（M_max）を kN·m 単位で求めなさい。',
        hint: '等分布荷重を受ける単純支持梁の中央最大曲げモーメントは (w * L²) / 8 で求まります。',
        targetValue: 45.0,
        unit: 'kN·m',
        tolerance: 0.5,
        solutionSteps: [
          '最大曲げモーメントの公式を適用: M_max = (w * L²) / 8。',
          '値を代入: w = 10.0 kN/m, L = 6.0 m。',
          'M_max = (10.0 * 6.0²) / 8 = (10.0 * 36.0) / 8 = 360.0 / 8 = 45.0 kN·m。',
        ],
      },
      {
        id: 'p3',
        prompt:
          '断面係数 S_x = 125 × 10³ mm³ をもつ長さ 2.5 m の片持ち梁の自由端に集中荷重 P = 8.0 kN が作用しています。固定端に生じる最大曲げ応力（σ_max）を MPa 単位で求めなさい。',
        hint: '片持ち梁の最大モーメントは固定端根元で生じます: M_max = P * L。応力は σ_max = M_max / S_x。',
        targetValue: 160.0,
        unit: 'MPa',
        tolerance: 1.0,
        solutionSteps: [
          '固定端の最大モーメントを計算: M_max = P * L = 8.0 kN * 2.5 m = 20.0 kN·m。',
          'N·mm に換算: M_max = 20.0 × 10⁶ N·mm。',
          '最大曲げ応力を算出: σ_max = M_max / S_x = (20.0 × 10⁶ N·mm) / (125 × 10³ mm³) = 160.0 MPa。',
        ],
      },
      {
        id: 'p4',
        prompt:
          '幅 b = 120 mm、高さ h = 200 mm の木材長方形断面の弾性断面係数 S_x（cm³ 単位）を計算しなさい。',
        hint: '長方形断面係数の公式: S_x = (b * h²) / 6。1,000 で除して mm³ から cm³ に変換します。',
        targetValue: 800.0,
        unit: 'cm³',
        tolerance: 5.0,
        solutionSteps: [
          '断面係数公式を使用: S_x = (b * h²) / 6。',
          '寸法を代入: b = 120 mm, h = 200 mm。',
          'S_x = (120 * 200²) / 6 = (120 * 40,000) / 6 = 4,800,000 / 6 = 800,000 mm³。',
          'cm³ に換算: 800,000 mm³ / 1,000 = 800.0 cm³。',
        ],
      },
      {
        id: 'p5',
        prompt:
          '鋼製梁（スパン L = 3.0 m, E = 200 GPa, I = 15.0 × 10⁶ mm⁴）のスパン中央に P = 16.0 kN の荷重がかかっています。中央の最大たわみ（δ_max）を mm 単位で求めなさい。',
        hint: 'たわみ計算式: δ_max = (P * L³) / (48 * E * I)。N と mm の一貫した単位系で計算してください。',
        targetValue: 3.0,
        unit: 'mm',
        tolerance: 0.1,
        solutionSteps: [
          '単位換算: P = 16,000 N, L = 3,000 mm, E = 200,000 N/mm², I = 15.0 × 10⁶ mm⁴。',
          '分子: P * L³ = 16,000 * 3,000³ = 16,000 * 2.7 × 10¹⁰ = 4.32 × 10¹⁴ N·mm³。',
          '分母: 48 * E * I = 48 * 200,000 * 15.0 × 10⁶ = 1.44 × 10¹⁴ N·mm²。',
          'たわみを計算: δ_max = (4.32 × 10¹⁴) / (1.44 × 10¹⁴) = 3.00 mm。',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          '横荷重を受ける梁において、内部曲げモーメントが極大値または極小値（ピーク）をとるのはどのような点ですか？',
        options: [
          '内部せん断力 V(x) がゼロ軸と交差する点（V = 0）',
          '梁のたわみ量が完全にゼロとなる点',
          'ピン支持点直下の位置のみ',
          '断面積が最も小さくなる断面',
        ],
        correctIndex: 0,
        explanation:
          '微分関係式 dM/dx = V(x) より、曲げモーメントの一次導関数はせん断力に等しくなります。微積分学の基本原理に従い、導関数がゼロとなる点（V = 0）において元の関数 M(x) は極大値または極小値をとります。',
      },
      {
        id: 'q2',
        question:
          '同一質量の正方形中実棒と比較して、H形鋼（広幅フランジ）断面が曲げに対して極めて高い構造効率を持つ主な理由は何ですか？',
        options: [
          '肉厚なフランジにより、中立軸から最も離れた位置（y = ±c）に材料の大部分が配置され、断面二次モーメント I が極大化されるため',
          'ウェブ内部の空気層が熱応力を低減するため',
          'H形鋼はヤング率が低く設計されているため柔軟に変形できるから',
          'H形鋼は純粋ねじり荷重のみを受け、曲げモーメントが発生しないから',
        ],
        correctIndex: 0,
        explanation:
          '曲げ応力は中立軸からの距離に比例して増大し（σ = M·y / I）、中立軸上ではゼロになります。H形鋼は応力が最大となる最外縁フランジに断面積の大部分を集中させるため、同重量で最も大きな I および S を発揮します。',
      },
      {
        id: 'q3',
        question:
          '片持ち梁の自由端先端におけるせん断力 V および曲げモーメント M の境界条件として正しいものはどれですか？',
        options: [
          'せん断力および曲げモーメントの両方がゼロ（V = 0, M = 0）',
          'せん断力が最大で、曲げモーメントがゼロ',
          '曲げモーメントが最大で、せん断力がゼロ',
          'たわみがゼロで、たわみ角が90度',
        ],
        correctIndex: 0,
        explanation:
          '片持ち梁の先端は完全に拘束がなく、反力も外力偶モーメントも作用していないため、内力学的な境界条件としてせん断力 V = 0 かつ曲げモーメント M = 0 が成立します。',
      },
      {
        id: 'q4',
        question:
          '重力による下方荷重を受けて下方にたわむ（正のサギング曲げ）単純支持梁において、上面および下面の応力状態はどうなりますか？',
        options: [
          '上面は圧縮応力（σ < 0）、下面は引張応力（σ > 0）を受ける',
          '上面は引張応力、下面は圧縮応力を受ける',
          '上下両面ともに一様な純引張応力を受ける',
          '垂直応力は一切発生せず、純せん断応力のみを受ける',
        ],
        correctIndex: 0,
        explanation:
          '下向きの曲げ変形（サギング）により、中立軸より上側の材料繊維は圧縮され、下側の繊維は引き伸ばされます。したがって上面は圧縮応力、下面は引張応力となり、中立軸上は垂直応力がゼロになります。',
      },
      {
        id: 'q5',
        question:
          '梁の2断面間における曲げモーメントの変化量（ΔM = M₂ - M₁）は、せん断力図（SFD）上で幾何学的にどのように表されますか？',
        options: [
          'その2断面間におけるせん断力曲線の正負を含む正味の面積',
          '2つの支持点反力を結ぶ直線の傾き',
          '最大正せん断力と最大負せん断力の差の二乗',
          '梁の全長を作動する外力の総数で除した商',
        ],
        correctIndex: 0,
        explanation:
          'dM/dx = V(x) を両辺積分すると、M₂ - M₁ = ∫ V(x) dx となります。定積分の幾何学的意味は曲線下の面積であるため、SFD の曲線下の面積がモーメントの変化量と完全に一致します。',
      },
      {
        id: 'q6',
        question:
          '鋼製梁において、作用する最大曲げ応力が材料の降伏点を超過した場合（安全率 FoS < 1.0）、梁にはどのような物理的挙動が生じますか？',
        options: [
          '最外縁ファイバーから永久塑性変形が開始し、塑性ヒンジの形成および残留たわみが生じる',
          '予兆となる変形を一切起こさず、ガラスのように一瞬で激しく脆性破断する',
          '断面二次モーメントが瞬間的に4倍へと自動増大する',
          '鋼材のヤング率が恒久的に2倍に上昇する',
        ],
        correctIndex: 0,
        explanation:
          '延性構造用鋼は σ_max > σ_y に達すると降伏します。最も応力の高い外縁から塑性流動が始まり、除荷後も初期の直線形状に戻らず永久残留たわみ（塑性変形）が残ります。',
      },
    ],
  },
});
