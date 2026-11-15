import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('oil-grease-basics', {
  id: {
    title: 'Lab Dasar Jenis Oli & Gemuk Industri',
    shortTitle: 'Dasar Oli & Gemuk',
    description:
      'Panduan pemula komprehensif pelumasan industri: pelajari keluarga oli (AW, EP, R&O, Slideway, Sintetis PAO), kelas viskositas ISO VG (32–460), penipisan suhu ASTM D341 dengan viskometer bola jatuh teranimasi, pemilih oli mesin, kelas konsistensi gemuk NLGI (00–3), dan aturan kompatibilitas pengental.',
    explore: [
      {
        title: 'Klasifikasi Oli Industri & Kelas Viskositas ISO 3448',
        summary:
          'Oli pelumas industri diformulasikan dari base oil sulingan (mineral atau sintetis) dan paket aditif khusus untuk tugas mekanis tertentu: Anti-Wear (AW) untuk pompa hidrolik tekanan tinggi, Extreme Pressure (EP) bersulfur-fosfor untuk roda gigi berbeban kejut, Rust & Oxidation (R&O) untuk turbin dan kompresor sirkulasi kontinu, serta oli Slideway berperekat untuk meniadakan getaran stick-slip pada mesin perkakas. Standar internasional ISO 3448 mengklasifikasikan oli industri secara ketat berdasarkan viskositas kinematik dalam centistokes (cSt = mm²/s) pada suhu acuan 40 °C, dengan batas toleransi ±10% dari nomor kelas nominal.',
        equations: [
          {
            label: 'Batas Toleransi Kelas ISO 3448 (pada 40 °C)',
            formula: 'ν_40 ∈ [0.90 · VG,  1.10 · VG]',
            note: 'Contoh: ISO VG 46 mengizinkan 41.4 hingga 50.6 cSt; ISO VG 220 mencakup 198 hingga 242 cSt pada 40 °C.',
          },
          {
            label: 'Persamaan Viskositas–Suhu Walther ASTM D341',
            formula: 'log10(log10(ν + 0.7)) = A − B · log10(T + 273.15)',
            note: 'ν adalah viskositas kinematik dalam cSt (mm²/s), T adalah suhu dalam °C; A dan B adalah konstanta karakteristik fluida.',
          },
          {
            label: 'Hukum Stokes untuk Viskometer Bola Jatuh',
            formula: 'v = (2 · r² · (ρ_bola − ρ_oli) · g) / (9 · μ)',
            note: 'Kecepatan jatuh v berbanding terbalik dengan viskositas dinamik μ; semakin kental oli, semakin lambat bola meluncur.',
          },
        ],
        workedExample: {
          title: 'Verifikasi Viskositas ISO VG 46 pada Pompa Hidrolik di Suhu Operasi',
          given: [
            'Pelumas: Oli Hidrolik Anti-Wear ISO VG 46 (ν40 = 46.0 cSt, ν100 = 6.8 cSt)',
            'Suhu tangki hidrolik saat beroperasi: T = 65 °C',
            'Rentang target viskositas pabrikan pompa: 16 hingga 36 cSt',
          ],
          steps: [
            'Periksa rentang toleransi nominal 40 °C: 46 × 0.90 = 41.4 cSt, 46 × 1.10 = 50.6 cSt.',
            'Konversi suhu ke Kelvin: T40 = 313.15 K, T100 = 373.15 K, Top = 338.15 K.',
            'Hitung parameter Walther: W1 = log10(log10(46.7)) = 0.2225, W2 = log10(log10(7.5)) = -0.0580.',
            'Hitung kemiringan B = (0.2225 - (-0.0580)) / (log10(373.15) - log10(313.15)) = 3.696.',
            'Evaluasi W(338.15 K) = 0.2225 - 3.696 · (log10(338.15) - log10(313.15)) = 0.0988.',
            'Hitung viskositas operasi: ν(65 °C) = 10^(10^0.0988) - 0.7 ≈ 17.3 cSt.',
          ],
          answer:
            'ν(65 °C) ≈ 17.3 cSt — aman berada di dalam rentang target pabrikan pompa (16–36 cSt).',
        },
      },
      {
        title: 'Arsitektur Gemuk Pelumas & Kelas Konsistensi NLGI (ASTM D217)',
        summary:
          'Gemuk pelumas (grease) adalah pelumas semi-padat hingga padat yang tersusun atas tiga komponen utama: base oil (70%–90%), matriks spons pengental (10%–20%), dan aditif fungsional (5%–10%). Pengental berfungsi seperti spons mikroskopis yang mengikat oli hingga gaya geser mekanis memeras oli ke zona kontak gesekan. National Lubricating Grease Institute (NLGI) mengklasifikasikan konsistensi gemuk menggunakan uji penetrasi kerucut ASTM D217: kerucut standar dilepaskan ke dalam sampel gemuk yang dikondisikan pada 25 °C selama 5 detik setelah 60 kali double-stroke pemadatan mekanis. Kedalaman penetrasi diukur dalam sepersepuluh milimeter (mm/10). Kelas NLGI 2 (265–295 mm/10, tekstur mentega selai kacang) adalah standar universal industri untuk lebih dari 85% bantalan gelinding.',
        equations: [
          {
            label: 'Penetrasi Kerucut Tertempa ASTM D217',
            formula: 'Kedalaman Penetrasi = P (dalam persepuluh milimeter, mm/10)',
            note: 'Semakin dalam kerucut menembus, semakin lunak gemuknya. NLGI 00: 400–430 mm/10 (semi-cair); NLGI 2: 265–295 mm/10 (normal).',
          },
          {
            label: 'Rumus Pengisian Ulang Gemuk Bantalan SKF',
            formula: 'G = 0.005 · D · B',
            note: 'G = jumlah gemuk dalam gram, D = diameter luar bantalan dalam mm, B = lebar total bantalan dalam mm.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Jumlah Gemuk Pelumasan Ulang untuk Bantalan Motor Listrik',
          given: [
            'Bantalan sisi penggerak motor listrik: Deep groove ball bearing 6310',
            'Diameter luar bantalan: D = 110 mm',
            'Lebar bantalan: B = 27 mm',
            'Jenis gemuk yang direkomendasikan: NLGI Kelas 2 Polyurea',
          ],
          steps: [
            'Gunakan rumus: G = 0.005 · D · B.',
            'Kalikan dimensi: 110 mm × 27 mm = 2.970 mm².',
            'Hitung berat gemuk: G = 0.005 × 2.970 = 14.85 gram.',
            'Konfirmasi kalibrasi grease gun: grease gun tuas manual standar mengeluarkan ~1.5 g per kayuhan (sekitar 10 kayuhan).',
          ],
          answer: 'G ≈ 15 gram (10 kayuhan pompa grease gun manual terkalibrasi).',
        },
      },
      {
        title: 'Kimia Pengental Gemuk & Aturan Kompatibilitas Silang',
        summary:
          'Pengental gemuk terbagi menjadi sabun logam (litium sederhana, kalsium sederhana), sabun kompleks (litium kompleks, kalsium sulfonat kompleks, aluminium kompleks), dan pengental non-sabun organik maupun anorganik (polyurea, lempung bentonit). Ketika dua jenis gemuk yang tidak kompatibel tidak sengaja bercampur di dalam rumah mesin, struktur kimia pengentalnya saling merusak. Misalnya, mencampur Litium Kompleks dengan Polyurea menghancurkan kisi serat sabun, memicu pelunakan ekstrem (mencair/meleleh), pelepasan oli besar-besaran, hingga gemuk bocor keluar merusak belitan motor. Sebaliknya, mencampur gemuk sabun dengan tanah liat bentonit anorganik membuat partikel lempung mengendap, membentuk kerak padat abrasif yang cepat mengering dan mengunci putaran bantalan.',
        equations: [
          {
            label: 'Titik Tetes Gemuk (ASTM D2265)',
            formula: 'T_drop = Suhu (°C) saat tetesan oli cair pertama jatuh dari cawan uji yang dipanaskan',
            note: 'Menunjukkan batas termal atas di mana gel pengental runtuh. Lempung non-melting tidak memiliki titik leleh.',
          },
          {
            label: 'Pemisahan Oli pada Penyimpanan Statis (ASTM D6184)',
            formula: '% Bleed = (Massa oli terpisah / Massa awal sampel gemuk) × 100%',
            note: 'Pelepasan oli normal berkisar 1%–5%; campuran tidak kompatibel seringkali melebihi 20%, menguras pelumas dari bantalan.',
          },
        ],
        workedExample: {
          title: 'Mendiagnosis Kegagalan Motor Listrik Akibat Percampuran Gemuk Tidak Kompatibel',
          given: [
            'Gemuk bawaan pabrik: Gemuk motor OEM Polyurea (warna biru, NLGI 2)',
            'Teknisi menambahkan: Gemuk EP serbaguna Litium Kompleks (warna amber, NLGI 2)',
            'Gejala yang teramati: Oli menggenang di dalam penutup motor, bantalan berderit dalam 48 jam operasi',
          ],
          steps: [
            'Tinjau matriks kompatibilitas ASTM D6185: Litium Kompleks + Polyurea = Tidak Kompatibel — Jangan Dicampur!',
            'Mekanisme: Ikatan urea merusak kristal sabun litium 12-hidroksistearat, menghancurkan matriks gel.',
            'Akibat: Base oil terpisah dengan cepat dan merembes melewati sekat labirin ke gulungan stator motor.',
            'Tindakan korektif: Bongkar total motor, cuci bersih rumah bantalan dengan pelarut, dan isi ulang 100% gemuk polyurea baru.',
          ],
          answer:
            'Kegagalan terkonfirmasi: Inkompatibilitas pengental kimia menyebabkan gemuk mencair dan bantalan kehabisan pelumas.',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Berdasarkan ISO 3448, oli industri diklasifikasikan berdasarkan viskositas kinematik pada 40 °C dalam rentang toleransi ±10%. Untuk oli hidrolik anti-aus ISO VG 46, berapa viskositas kinematik minimum yang diizinkan pada 40 °C (dalam cSt)?',
        hint: 'Kalikan angka kelas ISO VG nominal dengan 0.90.',
        targetValue: 41.4,
        unit: 'cSt',
        tolerance: 0.2,
        solutionSteps: [
          'Ingat spesifikasi ISO 3448: pita toleransi adalah ±10% dari kelas nominal.',
          'Viskositas minimum yang diizinkan = VG Nominal × (1 - 0.10) = 46 × 0.90.',
          'Hitung: 46 × 0.90 = 41.4 cSt.',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Seorang teknisi melakukan uji penetrasi kerucut tertempa ASTM D217 pada sampel gemuk setelah 60 double-stroke pada suhu 25 °C. Indikator dial mencatat kedalaman penetrasi kerucut sebesar 280 persepuluh milimeter (28.0 mm). Termasuk kelas konsistensi NLGI berapakah (0, 1, 2, atau 3) gemuk ini?',
        hint: 'NLGI Kelas 2 mencakup rentang penetrasi 265 hingga 295 mm/10 (tekstur selai kacang).',
        targetValue: 2,
        unit: 'NLGI Grade',
        tolerance: 0.1,
        solutionSteps: [
          'Lihat Tabel Kelas Konsistensi NLGI: Kelas 0 (355–385), Kelas 1 (310–340), Kelas 2 (265–295), Kelas 3 (220–250).',
          'Bandingkan kedalaman penetrasi yang diukur P = 280 mm/10.',
          'Karena 265 ≤ 280 ≤ 295, gemuk ini diklasifikasikan sebagai NLGI Kelas 2.',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Dengan menggunakan rumus pelumasan ulang bantalan G = 0.005 · D · B (dengan D adalah diameter luar dalam mm dan B adalah lebar bantalan dalam mm), hitung jumlah pengisian gemuk dalam gram untuk bantalan bola deep groove dengan diameter luar D = 120 mm dan lebar B = 30 mm.',
        hint: 'Kalikan 0.005 dengan diameter luar dan lebar bantalan.',
        targetValue: 18,
        unit: 'gram',
        tolerance: 0.5,
        solutionSteps: [
          'Identifikasi parameter yang diketahui: D = 120 mm, B = 30 mm.',
          'Gunakan rumus: G = 0.005 × 120 × 30.',
          'Hitung perkalian dimensi: 120 × 30 = 3.600 mm².',
          'Hitung jumlah gemuk: 0.005 × 3.600 = 18.0 gram.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Sebuah gearbox helikal industri menggunakan oli ISO VG 220 dengan ν40 = 220 cSt dan ν100 = 19.2 cSt. Pada puncak produksi musim panas, suhu bak oli (sump) mencapai 70 °C. Menggunakan hubungan Walther ASTM D341, tentukan estimasi viskositas kinematik operasi dalam cSt (masukkan bilangan bulat terdekat).',
        hint: 'Viskositas menurun secara eksponensial terhadap suhu; pada 70 °C, oli mineral ISO VG 220 umumnya turun menjadi sekitar 51 cSt.',
        targetValue: 51,
        unit: 'cSt',
        tolerance: 2.0,
        solutionSteps: [
          'Konversi suhu acuan ke Kelvin: T1 = 313.15 K, T2 = 373.15 K, Top = 343.15 K.',
          'Hitung Walther W1 = log10(log10(220.7)) = 0.3699 dan W2 = log10(log10(19.9)) = 0.1136.',
          'Interpolasi pada 70 °C (343.15 K): W(343.15 K) ≈ 0.2336.',
          'Hitung viskositas kinematik: ν(70 °C) = 10^(10^0.2336) - 0.7 ≈ 51.0 cSt.',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Pada viskometer bola jatuh, sebuah bola baja terkalibrasi membutuhkan waktu 2.5 detik untuk jatuh melewati batas tanda ukur di dalam oli ISO VG 32. Mengasumsikan aliran laminer Stokes di mana waktu jatuh berbanding lurus dengan viskositas dinamik, berapa detik waktu yang dibutuhkan bola yang sama untuk jatuh melewati oli ISO VG 320 pada suhu uji yang sama?',
        hint: 'ISO VG 320 memiliki viskositas kinematik nominal 10 kali lebih besar dibanding ISO VG 32 (320 / 32 = 10).',
        targetValue: 25,
        unit: 'detik',
        tolerance: 1.0,
        solutionSteps: [
          'Dari Hukum Stokes, kecepatan jatuh berbanding terbalik dengan viskositas fluida: v ∝ 1/μ.',
          'Oleh karena itu, waktu jatuh berbanding lurus dengan viskositas: t ∝ μ.',
          'Hitung rasio viskositas: VG 320 / VG 32 = 320 / 32 = 10.0.',
          'Kalikan waktu jatuh awal: t = 2.5 detik × 10.0 = 25.0 detik.',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Apa yang secara spesifik diwakili oleh angka pada penamaan "ISO VG 68" menurut standar ISO 3448?',
        options: [
          'Viskositas kinematik nominal 68 cSt (mm²/s) yang diukur pada suhu 40 °C',
          'Batas suhu operasi maksimum sebesar 68 °C',
          'Nilai indeks viskositas (VI) sebesar 68 poin',
          'Densitas sebesar 68 gram per mililiter pada suhu kamar',
        ],
        explanation:
          'Berdasarkan ISO 3448, angka ISO VG (Viscosity Grade) secara ketat mendefinisikan titik tengah viskositas kinematik dalam centistokes (cSt = mm²/s) yang diukur pada suhu standar 40 °C, dengan rentang toleransi ±10%.',
      },
      {
        id: 'q2',
        question:
          'Paket aditif manakah yang sangat penting untuk pompa hidrolik industri tekanan tinggi (tipe vane dan piston) yang beroperasi hingga 350 bar?',
        options: [
          'Aditif seng anti-aus (AW seperti ZDDP) untuk mencegah gesekan batas kontak logam',
          'Paket deterjen alkalin untuk membersihkan jelaga pembakaran',
          'Aditif perekat (tackifier) tebal agar oli tidak menetes secara vertikal',
          'Surfaktan pengemulsi agar oli menyatu dengan air',
        ],
        explanation:
          'Pompa hidrolik bertekanan tinggi mengandalkan kimia Anti-Wear (AW)—terutama zinc dialkyldithiophosphate (ZDDP)—yang membentuk lapisan pelindung batas pada permukaan cam, vane, dan pelat katup untuk mencegah keausan parah.',
      },
      {
        id: 'q3',
        question:
          'Tingkat konsistensi gemuk NLGI manakah yang mewakili tekstur "mentega normal" (seperti selai kacang) yang digunakan pada sekitar 85% hingga 90% bantalan gelinding industri?',
        options: [
          'NLGI Kelas 2 (penetrasi tertempa 265–295 mm/10)',
          'NLGI Kelas 00 (penetrasi tertempa 400–430 mm/10)',
          'NLGI Kelas 0 (penetrasi tertempa 355–385 mm/10)',
          'NLGI Kelas 5 (penetrasi tertempa 130–160 mm/10)',
        ],
        explanation:
          'NLGI Kelas 2 adalah tolok ukur universal industri untuk bantalan gelinding. Konsistensinya cukup kokoh untuk tetap berada di dalam rumah bantalan tanpa mengalir keluar, namun cukup fleksibel untuk menyuplai lapisan oli kontinu ke area kontak gelinding.',
      },
      {
        id: 'q4',
        question:
          'Dampak fatal apakah yang biasanya terjadi jika seorang teknisi mencampur gemuk Litium Kompleks dengan gemuk Polyurea yang tidak kompatibel pada bantalan motor listrik?',
        options: [
          'Struktur pengental hancur, menyebabkan gemuk mencair parah, oli terpisah berlebih, dan merembes keluar seal',
          'Gemuk langsung mengeras menjadi balok padat sekeras intan',
          'Base oil menguap habis dalam waktu 5 menit setelah dinyalakan',
          'Tegangan listrik motor melonjak dua kali lipat akibat ionisasi kimia',
        ],
        explanation:
          'Litium Kompleks dan Polyurea secara kimia tidak kompatibel. Gugus polyurea merusak matriks serat sabun litium, menyebabkan gemuk kehilangan kekuatan gel, mencair, dan mengalir keluar dari rumah bantalan hingga mengenai belitan motor.',
      },
      {
        id: 'q5',
        question:
          'Mengapa pengental lempung bentonit (Bentone Clay) anorganik tanpa titik leleh dipilih untuk bantalan kereta oven kiln dan tungku aspal dibanding gemuk sabun konvensional?',
        options: [
          'Lempung bentonit tidak memiliki titik leleh kimia (tanpa dropping point) sehingga tidak akan meleleh pada suhu di atas 200 °C',
          'Lempung bentonit larut sepenuhnya dalam air dan terbuang bersama uap panas',
          'Lempung bentonit memotong konsumsi daya listrik mesin hingga nol',
          'Lempung bentonit aman dicampur dengan segala jenis pengental gemuk lain tanpa perlu dibersihkan',
        ],
        explanation:
          'Bentone (lempung bentonit organofilik) adalah pengental anorganik yang tidak meleleh. Berbeda dengan gemuk sabun logam yang mencair pada titik tetesnya (~180°C–260°C), gemuk berbasis lempung tetap bertahan pada suhu tungku kontinu di atas 200°C.',
      },
      {
        id: 'q6',
        question:
          'Ketika suhu oli operasi mesin industri naik dari 25 °C menjadi 75 °C selama beban operasi berat, apa yang terjadi pada viskositas kinematiknya?',
        options: [
          'Viskositas menurun secara eksponensial (menipis drastis) sesuai persamaan Walther ASTM D341',
          'Viskositas meningkat secara linier karena molekul bertambah volume',
          'Viskositas tetap konstan tanpa terpengaruh perubahan suhu sama sekali',
          'Viskositas langsung anjlok ke angka nol begitu suhu menyentuh 50 °C',
        ],
        explanation:
          'Viskositas cairan pelumas menurun secara eksponensial saat suhu meningkat karena gaya kohesi antarmolekul melemah. Teknisi harus menghitung viskositas kerja pada suhu operasi agar lapisan pelumas tetap cukup tebal mencegah kontak gesek logam.',
      },
    ],
  },
  ja: {
    title: '産業用潤滑油・グリース基礎ラボ',
    shortTitle: '油・グリース基礎',
    description:
      '産業用潤滑の基礎を体感学習：主要潤滑油種（AW作動油、EPギヤ油、R&Oタービン油、摺動面油、PAO合成油）、ISO VG粘度グレード（32〜460）、落球式粘度計によるASTM D341温度・粘度特性シミュレーション、機械別選定ガイド、NLGIちょう度（00〜3号）、増ちょう剤適合性判定。',
    explore: [
      {
        title: '産業用潤滑油の分類とISO 3448粘度グレード規格',
        summary:
          '産業用潤滑油は、精製された基油（鉱油または合成油）に特定の機械的負荷に応じた化学添加剤を最適配合して製造されます。高圧油圧ポンプの摩耗を防ぐ耐摩耗性（AW）、激しい衝撃荷重下でのギヤ歯面を守る硫黄・リン系極圧性（EP）、蒸気タービンやスクリューコンプレッサーの長期循環に耐える抗酸化・水分離性（R&O）、工作機械のスティックスリップ振動を根絶する粘着性摺動面油などがあります。国際標準規格ISO 3448は、基準温度40 °Cにおける動粘度（cSt = mm²/s）を基準に工業用潤滑油を厳格に分類しており、公称グレード値に対して±10%の許容公差範囲を定めています。',
        equations: [
          {
            label: 'ISO 3448 粘度公差範囲（40 °C基準）',
            formula: 'ν_40 ∈ [0.90 · VG,  1.10 · VG]',
            note: '例：ISO VG 46は41.4〜50.6 cSt、ISO VG 220は198〜242 cStが規格適合範囲となります。',
          },
          {
            label: 'ASTM D341 Walther（ワルター）粘度–温度関係式',
            formula: 'log10(log10(ν + 0.7)) = A − B · log10(T + 273.15)',
            note: 'νは動粘度（cSt）、Tは温度（°C）。AおよびBは潤滑油固有の定数です。',
          },
          {
            label: 'ストークスの法則（落球式粘度計の降下速度）',
            formula: 'v = (2 · r² · (ρ_ball − ρ_oil) · g) / (9 · μ)',
            note: '降下速度vは粘性抵抗μに反比例します。油の粘度が高くなるほど球の落下は劇的に遅くなります。',
          },
        ],
        workedExample: {
          title: '油圧ポンプ運転温度におけるISO VG 46の作動動粘度検証',
          given: [
            '使用油：ISO VG 46 耐摩耗性油圧作動油（ν40 = 46.0 cSt, ν100 = 6.8 cSt）',
            '油圧作動油タンクの定常運転温度：T = 65 °C',
            'ポンプ推奨運転動粘度範囲：16 〜 36 cSt',
          ],
          steps: [
            '40 °Cでの公差確認：46 × 0.90 = 41.4 cSt、46 × 1.10 = 50.6 cSt。',
            '絶対温度への換算：T40 = 313.15 K、T100 = 373.15 K、Top = 338.15 K。',
            'Walther定数計算：W1 = log10(log10(46.7)) = 0.2225、W2 = log10(log10(7.5)) = -0.0580。',
            '傾きBの算出：B = (0.2225 - (-0.0580)) / (log10(373.15) - log10(313.15)) = 3.696。',
            '運転温度でのW値計算：W(338.15 K) = 0.2225 - 3.696 · (log10(338.15) - log10(313.15)) = 0.0988。',
            '実動粘度を逆算：ν(65 °C) = 10^(10^0.0988) - 0.7 ≈ 17.3 cSt。',
          ],
          answer:
            'ν(65 °C) ≈ 17.3 cSt — ポンプメーカーの推奨許容範囲（16〜36 cSt）内に安全に収まっています。',
        },
      },
      {
        title: '潤滑グリースの構造とNLGIちょう度グレード（ASTM D217）',
        summary:
          '潤滑グリースは、基油（70%〜90%）、増ちょう剤スポンジ構造（10%〜20%）、各種機能添加剤（5%〜10%）の3要素からなる半固体〜固体状の潤滑剤です。増ちょう剤は微細なスポンジのように油を保持し、機械的せん断力を受けると油を放出して摩擦面を潤滑します。米国潤滑グリース協会（NLGI）は、ASTM D217規定の混和ちょう度試験で硬さを分類します。規定混和器で60往復混和後、25 °Cに調温した試料に標準円錐を5秒間落下させ、侵入深さを1/10ミリメートル単位（mm/10）で測定します。NLGI 2号（ちょう度265〜295 mm/10、ピーナッツバター状）は、産業用転がり軸受の85%以上に採用される世界標準です。',
        equations: [
          {
            label: 'ASTM D217 混和ちょう度（円錐針入度）',
            formula: '侵入深さ = P（1/10 mm単位、mm/10）',
            note: '深く針入するほど柔らかいグリースです。NLGI 00号：400〜430 mm/10（半流動状）、NLGI 2号：265〜295 mm/10（標準）。',
          },
          {
            label: 'SKF 転がり軸受グリース補給量計算式',
            formula: 'G = 0.005 · D · B',
            note: 'G = グリース初期補給量（g）、D = 軸受外径（mm）、B = 軸受全幅（mm）。',
          },
        ],
        workedExample: {
          title: '電動機（モーター）軸受のグリース補給量算出',
          given: [
            '電動機負荷側ベアリング：深溝玉軸受 6310',
            '軸受外径：D = 110 mm',
            '軸受幅：B = 27 mm',
            '推奨グリース種類：NLGI 2号 ウレア系グリース',
          ],
          steps: [
            '計算式を適用：G = 0.005 · D · B。',
            '寸法積の計算：110 mm × 27 mm = 2,970 mm²。',
            'グリース量の計算：G = 0.005 × 2,970 = 14.85 g。',
            '手動グリースガンの吐出量確認：一般的なレバー式ガンは1ストロークあたり約1.5 g吐出（約10ストロークに相当）。',
          ],
          answer: 'G ≈ 15 g（校正済み手動グリースガンで約10ストローク分）。',
        },
      },
      {
        title: '増ちょう剤の化学組成と異種グリース混和適合性ルール',
        summary:
          'グリース増ちょう剤は、金属石けん（単純リチウム、単純カルシウム）、複合石けん（リチウムコンプレックス、カルシウムスルホネートコンプレックス、アルミニウムコンプレックス）、非石けん系（ウレア、有機化ベントナイト粘土）に大別されます。互換性のない異種グリースを混和すると、増ちょう剤の結晶網目構造が相互に破壊されます。例えばリチウムコンプレックスとウレアを混和すると、石けん繊維が急激に崩壊して液状化し、激しい油分離（離油）が生じてシールから漏出しモーター巻線を侵食します。一方、石けん系と非溶融ベントナイト粘土を混ぜると、粘土粒子が凝集沈殿して砥石のような硬質スラッジを形成し、軸受を焼き付き損傷に至らしめます。',
        equations: [
          {
            label: 'グリース滴点測定（ASTM D2265）',
            formula: 'T_drop = 加熱試験容器の細孔から最初の油滴が落下した温度（°C）',
            note: '増ちょう剤がゲル構造を維持できる上限温度を示します。非溶融型粘土（ベントン）には滴点がありません。',
          },
          {
            label: '静置離油度試験（ASTM D6184）',
            formula: '% 離油度 = (分離した油の質量 / 試験前のグリース質量) × 100%',
            note: '正常な離油度は1%〜5%程度ですが、非適合混合物では20%を超え基油が流失します。',
          },
        ],
        workedExample: {
          title: '異種グリース誤混合による電動機軸受トラブルの診断',
          given: [
            '純正充填グリース：ウレア系モーターグリース（青色、NLGI 2号）',
            '保守作業員が誤補給したグリース：リチウムコンプレックス万能EPグリース（褐色、NLGI 2号）',
            '発生現象：モーターエンドブラケットからの油漏洩、給油後48時間での異音鳴き',
          ],
          steps: [
            'ASTM D6185適合性マトリクスの確認：リチウムコンプレックス ＋ ウレア ＝ 非互換（絶対に混合厳禁）。',
            '作用機構：ウレア基がリチウム石けんのミセル網目を破壊し、ゲル硬度を完全喪失。',
            '結果：基油が急速分離してラビリンスシールから外部およびステータ巻線へ流出。',
            '是正措置：モーターを全分解し、ハウジングと軸受を溶剤洗浄した上でウレアグリースを全量新充填。',
          ],
          answer:
            '故障原因の確定：化学的増ちょう剤の非互換性によるグリース液状化および潤滑油枯渇。',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'ISO 3448規格では、工業用潤滑油は40 °Cにおける動粘度に基づき±10%の公差範囲で分類されます。ISO VG 46耐摩耗性油圧作動油について、40 °Cで許容される最低動粘度（cSt）はいくつですか？',
        hint: '公称ISO VGグレード値に0.90を乗じてください。',
        targetValue: 41.4,
        unit: 'cSt',
        tolerance: 0.2,
        solutionSteps: [
          'ISO 3448規格の規定：許容公差は公称値の±10%。',
          '許容下限動粘度 = 公称VG × (1 - 0.10) = 46 × 0.90。',
          '計算実行：46 × 0.90 = 41.4 cSt。',
        ],
      },
      {
        id: 'p2',
        prompt:
          '保全技術者がグリース試料に対して25 °C、60往復のASTM D217混和ちょう度試験を行いました。ダイヤルゲージの円錐侵入深さは280（1/10 mm単位、実長28.0 mm）を示しました。このグリースはどのNLGIちょう度番号（0, 1, 2, 3）に該当しますか？',
        hint: 'NLGI 2号は混和ちょう度265〜295 mm/10（ピーナッツバター程度の硬さ）に相当します。',
        targetValue: 2,
        unit: 'NLGI Grade',
        tolerance: 0.1,
        solutionSteps: [
          'NLGIちょう度分類表を参照：0号（355〜385）、1号（310〜340）、2号（265〜295）、3号（220〜250）。',
          '測定された針入度 P = 280 mm/10 と照合。',
          '265 ≤ 280 ≤ 295 の範囲内であるため、NLGI 2号に分類されます。',
        ],
      },
      {
        id: 'p3',
        prompt:
          '標準軸受グリース補給式 G = 0.005 · D · B（Dは外径mm、Bは幅mm）を用いて、外径D = 120 mm、幅B = 30 mmの深溝玉軸受に必要なグリース補給量（g）を求めてください。',
        hint: '0.005に外径と幅を掛け合わせます。',
        targetValue: 18,
        unit: 'g',
        tolerance: 0.5,
        solutionSteps: [
          '与えられた寸法を確認：D = 120 mm, B = 30 mm。',
          '公式に代入：G = 0.005 × 120 × 30。',
          '寸法積の計算：120 × 30 = 3,600 mm²。',
          '必要グリース重量：0.005 × 3,600 = 18.0 g。',
        ],
      },
      {
        id: 'p4',
        prompt:
          'ある減速機でν40 = 220 cSt、ν100 = 19.2 cStのISO VG 220鉱油ギヤ油を使用しています。夏季フル稼働時に油温が70 °Cに達しました。ASTM D341 Walther式に基づき、この運転油温における概略動粘度（cSt）を整数（最も近い値）で求めてください。',
        hint: '油の粘度は温度上昇に伴い指数関数的に低下します。VG 220鉱油の70 °Cにおける動粘度は約51 cStになります。',
        targetValue: 51,
        unit: 'cSt',
        tolerance: 2.0,
        solutionSteps: [
          '絶対温度への換算：T1 = 313.15 K, T2 = 373.15 K, Top = 343.15 K。',
          'Walther定数の評価：W1 = log10(log10(220.7)) = 0.3699, W2 = log10(log10(19.9)) = 0.1136。',
          '70 °C（343.15 K）での補間：W(343.15 K) ≈ 0.2336。',
          '動粘度の算出：ν(70 °C) = 10^(10^0.2336) - 0.7 ≈ 51.0 cSt。',
        ],
      },
      {
        id: 'p5',
        prompt:
          '落球式粘度計で、校正された鋼球がISO VG 32油中を規定標線間降下するのに2.5秒かかりました。ストークスの層流則（落下時間は動粘度に正比例）が成り立つと仮定した場合、同一試験温度においてISO VG 320油中を降下するには何秒かかりますか？',
        hint: 'ISO VG 320はISO VG 32の10倍の公称動粘度を持ちます（320 / 32 = 10）。',
        targetValue: 25,
        unit: '秒',
        tolerance: 1.0,
        solutionSteps: [
          'ストークスの法則より、降下終端速度は流体粘度に反比例（v ∝ 1/μ）します。',
          'したがって、降下時間は動粘度に正比例（t ∝ μ）します。',
          '動粘度比率の算出：VG 320 / VG 32 = 320 / 32 = 10.0。',
          '降下時間の計算：t = 2.5秒 × 10.0 = 25.0秒。',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'ISO 3448規格における「ISO VG 68」という呼称の数値は何を具体的に表していますか？',
        options: [
          '基準温度40 °Cにおける公称動粘度68 cSt（mm²/s）',
          '潤滑油の最高連続使用可能温度68 °C',
          '潤滑油の粘度指数（VI）68ポイント',
          '室温における油の密度68 g/mL',
        ],
        explanation:
          'ISO 3448規格において、ISO VG（Viscosity Grade）の数字は標準基準温度40 °Cで測定された中心動粘度（cSt = mm²/s）を厳密に定義しており、許容公差は±10%以内と定められています。',
      },
      {
        id: 'q2',
        question:
          '最高350 barに達する高圧産業用油圧ポンプ（ベーンポンプやピストンポンプ）において、金属同士の境界接触摩耗を防ぐために極めて重要な添加剤はどれですか？',
        options: [
          '亜鉛系耐摩耗（AW）剤（ZDDPなど）による犠牲境界膜形成',
          '燃焼煤を洗浄するための高アルカリ清浄剤',
          '垂直面からの油だれを防ぐ高分子粘着剤',
          '油と水を意図的に乳化させる界面活性剤',
        ],
        explanation:
          '高圧油圧ポンプでは、カムリング、ベーン先端、シリンダブロック摺動面に働く過酷な境界摩擦から摩耗を防ぐため、犠牲皮膜を形成する耐摩耗剤（ZDDP：ジチオリン酸亜鉛）が不可欠です。',
      },
      {
        id: 'q3',
        question:
          '産業用転がり軸受の約85%〜90%で標準的に使用されている「通常のバター状（ピーナッツバター程度）」のNLGIちょう度番号はどれですか？',
        options: [
          'NLGI 2号（混和ちょう度 265〜295 mm/10）',
          'NLGI 00号（混和ちょう度 400〜430 mm/10）',
          'NLGI 0号（混和ちょう度 355〜385 mm/10）',
          'NLGI 5号（混和ちょう度 130〜160 mm/10）',
        ],
        explanation:
          'NLGI 2号は転がり軸受の絶対的な世界基準です。ハウジングから過度に漏れ出さず所定位置に留まる適度な保形性を持ちながら、回転摩擦部に連続して油膜を供給する流動性を兼ね備えています。',
      },
      {
        id: 'q4',
        question:
          '電動機（モーター）軸受において、保全作業者がリチウムコンプレックスグリースと非互換なウレアグリースを誤って混和補給した際に生じる代表的なトラブルは何ですか？',
        options: [
          '増ちょう剤構造が崩壊して極度に軟化・液状化し、激しい離油を起こしてシールから流出する',
          '瞬時にダイヤモンドのような硬質固体ブロックに硬化する',
          '運転開始後5分以内に基油が完全蒸発する',
          '化学的イオン化によりモーターの供給電圧が2倍に跳ね上がる',
        ],
        explanation:
          'リチウムコンプレックスとウレアは互換性がありません。ウレア基がリチウム石けんの繊維網目を破壊するため、グリースが軟化・液状化（離油）し、ベアリング外へ流出してモーター巻線を汚損させます。',
      },
      {
        id: 'q5',
        question:
          '高温キルン車軸受やアスファルトプラントなどの超高温設備において、通常の金属石けんグリースではなく無機系ベントナイト粘土（Bentone）グリースが選ばれる理由は何ですか？',
        options: [
          'ベントナイト粘土は化学的な融点（滴点）を持たない非溶融型であり、200 °Cを超える環境でも溶け出さないため',
          'ベントナイト粘土は完全水溶性で蒸気によって容易に洗い流せるため',
          'ベントナイト粘土が機械の消費電力をゼロに低減するため',
          'ベントナイト粘土は清掃なしで他のあらゆるグリースと安全に混合できるため',
        ],
        explanation:
          '有機化ベントナイト粘土（ベントン）は滴点（融点）を持たない無機系増ちょう剤です。滴点（180〜260°C）で液状化する金属石けん基グリースと異なり、200°Cを超える連続高温下でも軟化流出せず定位置に留まります。',
      },
      {
        id: 'q6',
        question:
          '産業機械の連続高負荷運転に伴い、潤滑油の温度が25 °Cから75 °Cまで上昇した際、動粘度はどのように変化しますか？',
        options: [
          'ASTM D341 Walther式に従い、温度上昇とともに指数関数的に著しく低下（粘度が低下）する',
          '熱膨張により分子体積が増加するため直線的に上昇する',
          '温度変化にかかわらず完全に一定値を維持する',
          '温度が50 °Cに達した瞬間に動粘度がゼロに急落する',
        ],
        explanation:
          '液体の粘度は、温度上昇による分子間凝集力の低下に伴い指数関数的に急減します。そのため技術者は、実運転温度において金属同士の接触を防ぐ十分な油膜厚さが維持できるか計算検証する必要があります。',
      },
    ],
  },
});
