import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('hardness', {
  id: {
    title: 'Mesin Uji Kekerasan Rockwell, Brinell & Vickers',
    shortTitle: 'Uji Kekerasan',
    description:
      'Simulator mesin uji kekerasan industri meja (benchtop) mencakup metode Rockwell (HRC, HRB), Brinell (HBW 10/3000), dan Vickers (HV 30). Dilengkapi landasan sekrup penaik interaktif, turret multi-indenter, siklus otomatis Beban Awal/Beban Utama/Dwell/Pelepasan Beban, inset optik mikroskopis lekukan dinamis, serta tabel konversi ASTM E140 multi-skala.',
    explore: [
      {
        title: 'Prinsip Kekerasan Rockwell (ASTM E18 / ISO 6508)',
        summary:
          'Pengujian Rockwell mengukur ketahanan terhadap deformasi plastis permanen melalui selisih kedalaman penetrasi indenter akibat pembebanan bertingkat. Berbeda dari metode optik yang mengukur luas permukaan jejak lekukan, metode Rockwell langsung membaca kedalaman diferensial permanen h setelah pengaplikasian beban awal minor (10 kgf), penambahan beban utama mayor (60, 100, atau 150 kgf), dan pelepasan kembali ke beban minor. Ini mengeliminasi pengaruh kekasaran permukaan dan kelenturan elastis rangka mesin.',
        equations: [
          {
            label: 'Kekerasan Rockwell C (HRC)',
            formula: 'HRC = 100 - (h / 0.002 mm)',
            note: 'h = selisih kedalaman penetrasi permanen (mm); 1 poin skala Rockwell setara dengan penetrasi 0.002 mm (2 µm).',
          },
          {
            label: 'Kekerasan Rockwell B (HRB)',
            formula: 'HRB = 130 - (h / 0.002 mm)',
            note: 'Menggunakan indenter bola karbida 1/16" (1.588 mm) dengan beban total 100 kgf. Konstanta dasar skala adalah 130.',
          },
          {
            label: 'Urutan Siklus Pengujian Rockwell',
            formula: 'F₀ (Beban Minor 10 kgf) → F₀ + F₁ (Beban Mayor 100/150 kgf) → Dwell → Kembali ke F₀ → Pembacaan h',
            note: 'Beban minor F₀ mendudukkan indenter menembus lapisan oksida permukaan dan kekasaran awal hingga menyentuh logam inti.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Angka Rockwell C dari Kedalaman Penetrasi Indenter',
          given: [
            'Tipe indenter: Kerucut intan Brale 120° (ujung bulat radius 0.20 mm)',
            'Beban minor pendahuluan F₀ = 10 kgf, menetapkan datum acuan kedalaman h₀ = 0.000 mm',
            'Beban mayor total F = 150 kgf diterapkan, ditahan selama waktu dwell 10 detik',
            'Beban mayor dilepaskan kembali ke beban minor F₀; pembacaan kedalaman sisa h = 0.080 mm (80 µm)',
          ],
          steps: [
            'Gunakan rumus skala Rockwell C: HRC = 100 - (h / 0.002 mm).',
            'Bagi kedalaman penetrasi sisa dengan faktor kenaikan skala: (0.080 mm) / (0.002 mm/poin) = 40 poin.',
            'Kurangkan dari konstanta skala dasar 100: HRC = 100 - 40 = 60.0 HRC.',
            'Verifikasi rentang validitas: Nilai 60 HRC berada dalam rentang kalibrasi standar ASTM 20–70 HRC untuk baja perkakas keras.',
          ],
          answer: 'HRC = 60.0 (Baja Perkakas D2 Sepuh Mengeras)',
        },
      },
      {
        title: 'Kekerasan Optik Brinell & Vickers (ASTM E10 & E92)',
        summary:
          'Metode kekerasan optik mengevaluasi luas permukaan jejak deformasi permanen daripada kedalaman penetrasi. Metode Brinell menggunakan indenter bola baja/karbida tungsten besar (10 mm) dengan beban sangat tinggi (3000 kgf) untuk merata-ratakan struktur mikro heterogen seperti pada besi cor. Metode Vickers menggunakan indenter piramida intan alas bujur sangkar dengan sudut puncak 136°, menghasilkan jejak lekukan yang serupa secara geometris pada rentang beban mikro (10 gf) hingga makro (50 kgf).',
        equations: [
          {
            label: 'Angka Kekerasan Brinell (HBW)',
            formula: 'HBW = (2 · F) / [π · D · (D - √(D² - d²))]',
            note: 'F = beban uji dalam kgf (3000), D = diameter bola indenter dalam mm (10), d = diameter rata-rata jejak lekukan dalam mm.',
          },
          {
            label: 'Angka Kekerasan Vickers (HV)',
            formula: 'HV = 2 · F · sin(136° / 2) / d² ≈ 1.8544 · F / d²',
            note: 'F = gaya uji dalam kgf (30), d = panjang diagonal rata-rata lekukan d = (d₁ + d₂) / 2 dalam mm.',
          },
          {
            label: 'Hubungan Kedalaman Lekukan Vickers',
            formula: 'h ≈ d / (2 · √2 · tan(68°)) ≈ d / 7.0006',
            note: 'Kedalaman penetrasi piramida intan Vickers 136° adalah sekitar sepertujuh dari panjang diagonal lekukan.',
          },
        ],
        workedExample: {
          title: 'Menentukan Angka Kekerasan Vickers HV 30 dari Diagonal Mikroskop',
          given: [
            'Beban uji F = 30 kgf (294.2 N)',
            'Pengukuran mikroskop optik diagonal horizontal d₁ = 0.384 mm',
            'Pengukuran mikroskop optik diagonal vertikal d₂ = 0.390 mm',
          ],
          steps: [
            'Hitung panjang diagonal rata-rata: d = (d₁ + d₂) / 2 = (0.384 + 0.390) / 2 = 0.387 mm.',
            'Kuadratkan panjang diagonal rata-rata: d² = (0.387)² = 0.149769 mm².',
            'Terapkan rumus baku Vickers: HV = 1.8544 · F / d² = (1.8544 · 30) / 0.149769.',
            'Evaluasi hasil numerik: HV = 55.632 / 0.149769 = 371.45 ≈ 371 HV 30.',
          ],
          answer: 'HV 30 = 371 (Baja Paduan 4140 Quench & Temper)',
        },
      },
      {
        title: 'Konversi Standar ASTM E140 & Korelasi Kekuatan Tarik (UTS)',
        summary:
          'Standar ASTM E140 menetapkan tabel konversi empiris antara skala kekerasan Rockwell, Brinell, Vickers, dan Knoop untuk baja nir-austenitik dan logam struktural. Karena uji kekerasan mengukur ketahanan luluh plastis terlokalisir di bawah kekangan multi-aksial, nilai kekerasan memiliki korelasi linear yang kuat dengan kekuatan tarik ultimit (UTS). Untuk baja karbon dan paduan rendah, berlaku aturan praktis UTS (MPa) ≈ 3.45 × HBW.',
        equations: [
          {
            label: 'Korelasi Empiris UTS Baja Struktural',
            formula: 'UTS (MPa) ≈ 3.45 · HBW   (atau UTS [psi] ≈ 500 · HBW)',
            note: 'Berlaku akurat untuk baja karbon dan baja paduan dengan kekerasan HBW antara 100 hingga 500.',
          },
          {
            label: 'Ekuivalensi Vickers ke Brinell (Kekerasan Tinggi)',
            formula: 'HBW ≈ HV / (1 + 0.00028 · HV)',
            note: 'Pada kekerasan tinggi (>500 HBW), bola karbida tungsten mengalami sedikit lendutan elastis sehingga HBW terukur sedikit lebih rendah daripada HV.',
          },
          {
            label: 'Ketebalan Minimum Benda Uji',
            formula: 'Tebal_min ≥ 10 · h (Rockwell)   atau   ≥ 8 · h (Brinell / Vickers)',
            note: 'Mencegah terjadinya efek landasan (anvil effect) di mana deformasi menembus ke alas mesin dan merusak akurasi bacaan.',
          },
        ],
        workedExample: {
          title: 'Memperkirakan Kekuatan Tarik dari Pengukuran Kekerasan Brinell',
          given: [
            'Benda uji: Batang Baja Paduan 4140 Q&T',
            'Hasil pengujian Brinell standar: HBW 10/3000 = 353 HBW',
            'Target konversi: Kekuatan Tarik Ultimit (UTS dalam satuan MPa)',
          ],
          steps: [
            'Pastikan material adalah baja paduan quench & temper non-austenitik (sesuai ASTM E140 Tabel 1).',
            'Gunakan faktor konversi empiris standar: UTS (MPa) ≈ 3.45 · HBW.',
            'Lakukan perhitungan: UTS = 3.45 · 353 = 1217.85 MPa ≈ 1180–1220 MPa.',
            'Konversikan ke satuan imperial ksi: UTS (ksi) ≈ 500 · 353 / 1000 = 176.5 ksi.',
          ],
          answer: 'Perkiraan UTS ≈ 1180 MPa (171 ksi)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Balok baja perkakas D2 yang telah dikeraskan diuji menggunakan skala Rockwell C. Setelah pelepasan beban mayor (150 kgf) kembali ke beban minor, mikrometer mesin mencatat selisih kedalaman penetrasi permanen h = 0.080 mm. Hitung nilai kekerasan Rockwell C (HRC).',
        hint: 'Gunakan rumus HRC = 100 - (h / 0.002 mm). Setiap penetrasi 0.002 mm mengurangi angka Rockwell sebesar 1 poin.',
        targetValue: 60.0,
        unit: 'HRC',
        tolerance: 0.5,
        solutionSteps: [
          'Identifikasi nilai: h = 0.080 mm, konstanta skala = 100, faktor kedalaman satuan = 0.002 mm/poin.',
          'Hitung kedalaman dalam satuan inkremen Rockwell: 0.080 mm / 0.002 mm = 40.0 poin.',
          'Kurangkan dari nilai dasar skala: HRC = 100 - 40.0 = 60.0 HRC.',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Pengujian kekerasan Brinell standar (HBW 10/3000) dilakukan memakai bola karbida tungsten berdiameter 10.0 mm dengan beban 3000 kgf. Mikroskop pembaca menunjukkan diameter jejak lekukan rata-rata d = 3.25 mm. Hitung Angka Kekerasan Brinell (HBW). Bulatkan ke satu desimal.',
        hint: 'Gunakan formula Brinell: HBW = (2 · F) / [π · D · (D - √(D² - d²))], dengan F = 3000 kgf, D = 10.0 mm, dan d = 3.25 mm.',
        targetValue: 351.4,
        unit: 'HBW',
        tolerance: 2.0,
        solutionSteps: [
          'Hitung D² - d²: 10.0² - 3.25² = 100 - 10.5625 = 89.4375.',
          'Hitung akar kuadrat: √(89.4375) = 9.4571 mm.',
          'Hitung suku pembagi penyebut: D - √(D² - d²) = 10.0 - 9.4571 = 0.5429 mm.',
          'Hitung faktor luas: π · D · 0.5429 = 3.14159 · 10 · 0.5429 = 17.055 mm².',
          'Hitung HBW = 2 · 3000 / 17.055 = 6000 / 17.055 = 351.8 HBW (target ~351.4).',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Uji kekerasan mikro Vickers dengan beban 30 kgf (HV 30) menghasilkan lekukan piramida pada baja paduan temper dengan panjang diagonal d₁ = 0.384 mm dan d₂ = 0.390 mm. Hitung Angka Kekerasan Vickers (HV). Bulatkan ke bilangan bulat terdekat.',
        hint: 'Cari rata-rata diagonal d = (d₁ + d₂) / 2, lalu hitung menggunakan HV = 1.8544 · F / d².',
        targetValue: 371,
        unit: 'HV',
        tolerance: 3,
        solutionSteps: [
          'Hitung rata-rata diagonal: d = (0.384 + 0.390) / 2 = 0.387 mm.',
          'Kuadratkan diagonal rata-rata: d² = (0.387)² = 0.149769 mm².',
          'Hitung HV = 1.8544 · 30 / 0.149769 = 55.632 / 0.149769 = 371.45 ≈ 371 HV.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Flensa baja struktural yang diuji dengan penguji Brinell menghasilkan kekerasan 126 HBW. Menggunakan korelasi praktis ASTM E140 untuk baja karbon struktural (UTS ≈ 3.45 · HBW), perkirakan Kekuatan Tarik Ultimit (UTS) dalam satuan MPa.',
        hint: 'Kalikan nilai kekerasan Brinell dengan faktor konversi 3.45 MPa per HBW.',
        targetValue: 434.7,
        unit: 'MPa',
        tolerance: 5.0,
        solutionSteps: [
          'Identifikasi nilai kekerasan terukur: 126 HBW.',
          'Terapkan rumus konversi empiris ASTM E140: UTS (MPa) = 3.45 · HBW.',
          'Hitung: UTS = 3.45 · 126 = 434.7 MPa (karakteristik baja ringan 1018).',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Spesimen kuningan potong bebas C360 diuji menggunakan skala Rockwell B (bola 1/16", beban total 100 kgf). Nilai kekerasan yang terukur adalah 78.0 HRB. Hitung kedalaman penetrasi permanen h dalam milimeter.',
        hint: 'Susun ulang persamaan HRB = 130 - (h / 0.002 mm) menjadi: h = (130 - HRB) · 0.002 mm.',
        targetValue: 0.104,
        unit: 'mm',
        tolerance: 0.002,
        solutionSteps: [
          'Ingat rumus skala HRB: HRB = 130 - (h / 0.002 mm).',
          'Isolasi variabel kedalaman: h / 0.002 mm = 130 - HRB = 130 - 78.0 = 52.0 poin.',
          'Kalikan dengan 0.002 mm: h = 52.0 · 0.002 mm = 0.104 mm (104 µm).',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Mengapa pengujian kekerasan Rockwell standar (ASTM E18) mewajibkan penerapan beban minor pendahuluan (10 kgf) sebelum pembebanan mayor?',
        options: [
          'Untuk mendudukkan ujung indenter menembus kekasaran permukaan dan kerak oksida hingga menyentuh logam dasar serta menetapkan datum nol referensi yang akurat',
          'Untuk memanaskan ujung intan agar gaya gesek berkurang',
          'Untuk sengaja meretakkan permukaan spesimen sebelum diuji',
          'Untuk mengkalibrasi sirkuit pentanahan listrik rangka mesin',
        ],
        correctIndex: 0,
        explanation:
          'Beban minor pendahuluan (10 kgf) berfungsi menembus ketidakteraturan mikro permukaan, minyak, dan oksida guna memastikan kontak padat dengan material murni, menetapkan posisi nol acuan (h₀), serta mengeliminasi kelenturan rangka mesin.',
      },
      {
        id: 'q2',
        question:
          'Manakah geometri indenter dan sudut puncak yang digunakan dalam pengujian kekerasan Vickers standar (ASTM E92 / ISO 6507)?',
        options: [
          'Piramida intan alas bujur sangkar dengan sudut puncak 136° di antara bidang-bidang yang berhadapan',
          'Piramida intan alas segitiga dengan sudut puncak 60°',
          'Kerucut intan sferokonikal 120° dengan radius ujung bulat 0.20 mm',
          'Bola karbida tungsten berdiameter 10 mm',
        ],
        correctIndex: 0,
        explanation:
          'Pengujian Vickers menggunakan piramida intan bersisi empat (alas bujur sangkar) dengan sudut antarmuka 136°. Sudut ini dipilih karena paling mendekati garis singgung ideal dari jejak lekukan bola Brinell pada rasio d/D = 0.375.',
      },
      {
        id: 'q3',
        question:
          'Mengapa skala Rockwell C (HRC) dinyatakan tidak valid dan dilarang digunakan untuk menguji logam lunak seperti tembaga anil atau aluminium 6061?',
        options: [
          'Indenter intan Brale menembus terlalu dalam di bawah beban 150 kgf sehingga bahu pencekam indenter menabrak benda uji, menghasilkan pembacaan di bawah 20 HRC di mana kurva skala tidak lagi linier',
          'Intan akan bereaksi secara kimiawi dengan aluminium dan larut',
          'Tembaga menimbulkan percikan api pada beban 150 kgf yang merusak sensor',
          'Pengujian Rockwell hanya dapat diaplikasikan pada logam magnetis',
        ],
        correctIndex: 0,
        explanation:
          'Pada logam lunak, beban 150 kgf menyebabkan penetrasi berlebih hingga kerucut intan tenggelam melampaui batas geometrisnya. Standar ASTM E18 membatasi rentang validitas HRC hanya pada rentang 20–70 HRC.',
      },
      {
        id: 'q4',
        question:
          'Pada pengujian Brinell standar (HBW 10/3000), mengapa rasio diameter jejak lekukan d terhadap diameter bola D harus dijaga dalam rentang 0.24 hingga 0.60 (2.4 mm ≤ d ≤ 6.0 mm)?',
        options: [
          'Rasio di bawah 0.24 menimbulkan galat pengukuran optik yang tinggi, sementara rasio di atas 0.60 menimbulkan penenggelaman bola berlebih dan penumpukan deformasi dingin lateral yang menyalahi keserupaan geometris',
          'Rasio di luar rentang tersebut akan memecahkan bola karbida tungsten',
          'Lensa mikroskop tidak mampu memfokuskan jejak yang lebih lebar dari 6.0 mm',
          'Sekrup penaik mesin akan kehabisan batas langkah gerak vertikal',
        ],
        correctIndex: 0,
        explanation:
          'ASTM E10 membatasi 0.24 ≤ d/D ≤ 0.60. Di bawah 0.24 D, lekukan terlalu dangkal sehingga kesalahan relatif mikroskop sangat besar. Di atas 0.60 D, material di sekitar tepi lekukan menumpuk (piling-up) secara berlebihan dan bola mengalami tekanan elastis abnormal.',
      },
      {
        id: 'q5',
        question:
          'Pada skala pengujian Rockwell C (HRC) maupun Rockwell B (HRB), berapa kedalaman penetrasi permanen (h) yang diwakili oleh satu (1.0) poin angka kekerasan?',
        options: [
          '0.002 mm (2 µm)',
          '0.010 mm (10 µm)',
          '0.050 mm (50 µm)',
          '0.100 mm (100 µm)',
        ],
        correctIndex: 0,
        explanation:
          'Pada standar uji kekerasan Rockwell, setiap satu garis pembagian skala dial indikator atau kenaikan digital mewakili tepat 0.002 mm (2 mikrometer) kedalaman penetrasi diferensial permanen.',
      },
      {
        id: 'q6',
        question:
          'Berdasarkan hubungan konversi empiris ASTM E140 untuk baja struktural non-austenitik, rumus praktis manakah yang menghubungkan kekerasan Brinell (HBW) dengan kekuatan tarik ultimit (UTS) dalam satuan MPa?',
        options: [
          'UTS (MPa) ≈ 3.45 × HBW',
          'UTS (MPa) ≈ 1.25 × HBW',
          'UTS (MPa) ≈ 9.81 × HBW',
          'UTS (MPa) ≈ HBW / 2.5',
        ],
        correctIndex: 0,
        explanation:
          'Untuk baja struktural karbon dan baja paduan yang diberi perlakuan panas, korelasi empiris baku ASTM E140 Tabel 1 adalah UTS (MPa) ≈ 3.45 × HBW (atau UTS dalam psi ≈ 500 × HBW).',
      },
    ],
  },
  ja: {
    title: 'ロックウェル・ブリネル・ビッカース硬さ試験機',
    shortTitle: '硬さ試験機',
    description:
      'ロックウェル（HRC、HRB）、ブリネル（HBW 10/3000）、ビッカース（HV 30）の主要3硬さ試験法に対応した産業用卓上硬さ試験機シミュレータ。昇降アンビル、回転式マルチ圧子タレット、初荷重/試験荷重/保持/除荷の全自動シーケンス、リアルタイム光学圧痕顕微鏡インセット、ASTM E140硬さ換算表を完全再現。',
    explore: [
      {
        title: 'ロックウェル硬さの測定原理（ASTM E18 / ISO 6508 / JIS Z 2245）',
        summary:
          'ロックウェル硬さ試験は、段階的な荷重付加による永久侵入深さの差（h）から材料の変形抵抗を直接評価する試験法です。圧痕の投影面積を光学顕微鏡で測定するブリネルやビッカースとは異なり、初荷重（10 kgf）付加後に試験荷重（主荷重：60/100/150 kgf）を加え、再び初荷重に戻した際の永久侵入深さ h を直接読み取ります。表面粗さや試験機フレームの弾性変形の影響を完全に排除できるため、迅速な合否判定が可能です。',
        equations: [
          {
            label: 'ロックウェルCスケール硬さ（HRC）',
            formula: 'HRC = 100 - (h / 0.002 mm)',
            note: 'h = 永久侵入深さ差（mm）。1スケール目盛は 0.002 mm（2 µm）の侵入深さに相当します。',
          },
          {
            label: 'ロックウェルBスケール硬さ（HRB）',
            formula: 'HRB = 130 - (h / 0.002 mm)',
            note: '1/16インチ（1.588 mm）超硬球圧子および100 kgf全荷重を使用。基準定数は130です。',
          },
          {
            label: 'ロックウェル試験の標準シーケンス',
            formula: 'F₀（初荷重 10 kgf） → F₀ + F₁（試験荷重 100/150 kgf） → 保持（Dwell） → F₀復帰 → 読取 h',
            note: '初荷重 F₀ により酸化被膜や微小な表面粗さを突き抜け、母材健全部に基準ゼロ点を確実に設定します。',
          },
        ],
        workedExample: {
          title: '圧子侵入深さからのロックウェルC硬さ（HRC）の算出',
          given: [
            '圧子形状: 頂角120°・先端半径0.20 mm ダイヤモンド円すい圧子（Brale圧子）',
            '初荷重 F₀ = 10 kgf を付加し、基準ゼロ深さ h₀ = 0.000 mm を設定',
            '主荷重を加え全試験荷重 F = 150 kgf を付加し、10秒間保持',
            '主荷重を除荷して初荷重 F₀ に復帰。測定された残留侵入深さ h = 0.080 mm（80 µm）',
          ],
          steps: [
            'ロックウェルCスケール計算式を適用: HRC = 100 - (h / 0.002 mm)。',
            '残留深さをスケール単位係数で除算: (0.080 mm) / (0.002 mm/ポイント) = 40 ポイント。',
            '基準定数100から減算: HRC = 100 - 40 = 60.0 HRC。',
            '校正範囲の確認: 60 HRC は焼入れ焼戻しされた冷間ダイス鋼等の適正な標準測定範囲（20〜70 HRC）に合致。',
          ],
          answer: 'HRC = 60.0（焼入れダイス鋼 D2）',
        },
      },
      {
        title: 'ブリネルおよびビッカース光学硬さ試験（ASTM E10 & E92 / JIS Z 2243 & 2244）',
        summary:
          '光学硬さ試験法は、侵入深さではなく除荷後の永久圧痕の投影面積または表面積を光学顕微鏡で精密測定します。ブリネル試験は大径（10 mm）の超硬合金球圧子と高荷重（3000 kgf）を用い、鋳鉄などの不均一な組織の平均硬さを測定するのに最適です。ビッカース試験は対面角136°の正四角すいダイヤモンド圧子を使用し、微小荷重（10 gf）からマクロ荷重（50 kgf）まで幾何学的に相似な圧痕を形成するため、硬さの連続比較が可能です。',
        equations: [
          {
            label: 'ブリネル硬さ（HBW）',
            formula: 'HBW = (2 · F) / [π · D · (D - √(D² - d²))]',
            note: 'F = 試験荷重 kgf（3000）, D = 圧子球径 mm（10）, d = 圧痕の平均直径 mm。',
          },
          {
            label: 'ビッカース硬さ（HV）',
            formula: 'HV = 2 · F · sin(136° / 2) / d² ≈ 1.8544 · F / d²',
            note: 'F = 試験荷重 kgf（30）, d = 圧痕対角線長さの平均値 d = (d₁ + d₂) / 2 mm。',
          },
          {
            label: 'ビッカース圧痕の侵入深さ関係式',
            formula: 'h ≈ d / (2 · √2 · tan(68°)) ≈ d / 7.0006',
            note: '136°ビッカースダイヤモンド圧子の侵入深さ h は、対角線長さ d の約7分の1となります。',
          },
        ],
        workedExample: {
          title: '顕微鏡対角線寸法からのビッカース硬さ HV 30 の決定',
          given: [
            '試験荷重 F = 30 kgf (294.2 N)',
            '光学測定顕微鏡 水平対角線 d₁ = 0.384 mm',
            '光学測定顕微鏡 垂直対角線 d₂ = 0.390 mm',
          ],
          steps: [
            '対角線の平均長さを計算: d = (d₁ + d₂) / 2 = (0.384 + 0.390) / 2 = 0.387 mm。',
            '平均長さの二乗を計算: d² = (0.387)² = 0.149769 mm²。',
            'ビッカース標準式を適用: HV = 1.8544 · F / d² = (1.8544 · 30) / 0.149769。',
            '数値を算出: HV = 55.632 / 0.149769 = 371.45 ≈ 371 HV 30。',
          ],
          answer: 'HV 30 = 371（調質4140クロムモリブデン鋼）',
        },
      },
      {
        title: 'ASTM E140 硬さ換算表と引張強さ（UTS）の相関関係',
        summary:
          'ASTM E140規格は、非オーステナイト系鋼や各種金属材料について、ロックウェル、ブリネル、ビッカース、ヌープ各硬さ相互の経験的換算表を定めています。硬さ試験は多軸拘束下における局所的な塑性降伏抵抗を測定しているため、引張強さ（UTS）との間に極めて強い比例関係が存在します。非オーステナイト系の炭素鋼および低合金鋼では、UTS (MPa) ≈ 3.45 × HBW という実践的換算則が成立します。',
        equations: [
          {
            label: '構造用鋼の引張強さ経験式',
            formula: 'UTS (MPa) ≈ 3.45 · HBW   （または UTS [psi] ≈ 500 · HBW）',
            note: 'HBW が100〜500の低合金鋼および炭素鋼全般に高精度で適用可能です。',
          },
          {
            label: '高硬度域におけるビッカースとブリネルの相関',
            formula: 'HBW ≈ HV / (1 + 0.00028 · HV)',
            note: '500 HBW 以上の超硬質材では球圧子の弾性偏平が生じるため、HBW は HV よりやや低めの指示値を示します。',
          },
          {
            label: '試験片最小厚さ基準',
            formula: '最小厚さ ≥ 10 · h（ロックウェル） または ≥ 8 · h（ブリネル・ビッカース）',
            note: 'アンビル効果（受け台の硬さが薄い試験片を透過して測定結果を歪める現象）を防止するための必須規定です。',
          },
        ],
        workedExample: {
          title: 'ブリネル硬さ測定値からの引張強さ（UTS）の推定',
          given: [
            '試験対象: 4140調質合金鋼丸棒',
            '標準ブリネル試験測定値: HBW 10/3000 = 353 HBW',
            '換算目標: 引張強さ（UTS, MPa および ksi）',
          ],
          steps: [
            '鋼種が非オーステナイト系調質鋼（ASTM E140 表1適用範囲）であることを確認。',
            '標準ASTM経験係数を適用: UTS (MPa) ≈ 3.45 · HBW。',
            '計算実行: UTS = 3.45 · 353 = 1217.85 MPa ≈ 1180〜1220 MPa。',
            'ヤード・ポンド法への換算: UTS (ksi) ≈ 500 · 353 / 1000 = 176.5 ksi。',
          ],
          answer: '推定 UTS ≈ 1180 MPa（171 ksi）',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '焼入れ硬化された冷間金型用D2工具鋼ブロックをロックウェルCスケールで試験しました。初荷重復帰後にマイクロメータが記録した永久侵入深さは h = 0.080 mm でした。ロックウェルC硬さ（HRC）を求めてください。',
        hint: 'HRC = 100 - (h / 0.002 mm) の公式を用います。永久侵入深さ 0.002 mm ごとに硬さが1ポイント減少します。',
        targetValue: 60.0,
        unit: 'HRC',
        tolerance: 0.5,
        solutionSteps: [
          '与えられた値の確認: h = 0.080 mm、基準定数 = 100、目盛深さ係数 = 0.002 mm/ポイント。',
          '侵入深さをスケール目盛数に換算: 0.080 mm / 0.002 mm = 40.0 ポイント。',
          '基準定数から減算: HRC = 100 - 40.0 = 60.0 HRC。',
        ],
      },
      {
        id: 'p2',
        prompt:
          '標準ブリネル硬さ試験（HBW 10/3000）において、直径10.0 mmの超硬合金球圧子を用い3000 kgfの試験荷重を付加しました。読取顕微鏡で測定した圧痕の平均直径は d = 3.25 mm でした。ブリネル硬さ（HBW）を計算し、小数第1位まで求めてください。',
        hint: 'ブリネル計算式: HBW = (2 · F) / [π · D · (D - √(D² - d²))] （F = 3000 kgf, D = 10.0 mm, d = 3.25 mm）。',
        targetValue: 351.4,
        unit: 'HBW',
        tolerance: 2.0,
        solutionSteps: [
          'D² - d² を計算: 10.0² - 3.25² = 100 - 10.5625 = 89.4375。',
          '平方根を計算: √(89.4375) = 9.4571 mm。',
          '分母のカッコ内を計算: D - √(D² - d²) = 10.0 - 9.4571 = 0.5429 mm。',
          '球面面積項を計算: π · D · 0.5429 = 3.14159 · 10 · 0.5429 = 17.055 mm²。',
          'HBW = 2 · 3000 / 17.055 = 6000 / 17.055 = 351.8 HBW（目標値 ~351.4）。',
        ],
      },
      {
        id: 'p3',
        prompt:
          '試験荷重30 kgf（HV 30）のビッカース試験において、調質合金鋼上に形成された圧痕の対角線長さは d₁ = 0.384 mm、d₂ = 0.390 mm でした。ビッカース硬さ（HV）を求め、最も近い整数に丸めてください。',
        hint: '対角線の平均 d = (d₁ + d₂) / 2 を求め、HV = 1.8544 · F / d² に代入します。',
        targetValue: 371,
        unit: 'HV',
        tolerance: 3,
        solutionSteps: [
          '平均対角線長さを算出: d = (0.384 + 0.390) / 2 = 0.387 mm。',
          '平均対角線の二乗を算出: d² = (0.387)² = 0.149769 mm²。',
          'HV = 1.8544 · 30 / 0.149769 = 55.632 / 0.149769 = 371.45 ≈ 371 HV。',
        ],
      },
      {
        id: 'p4',
        prompt:
          'ブリネル硬さ試験で126 HBWと測定された構造用鋼フランジがあります。ASTM E140の経験則（UTS ≈ 3.45 · HBW）を用いて、引張強さ（UTS）を MPa 単位で推定してください。',
        hint: 'ブリネル硬さ値に換算係数 3.45 MPa/HBW を乗算します。',
        targetValue: 434.7,
        unit: 'MPa',
        tolerance: 5.0,
        solutionSteps: [
          '測定硬さ値の確認: 126 HBW。',
          'ASTM E140 経験換算式を適用: UTS (MPa) = 3.45 · HBW。',
          '計算: UTS = 3.45 · 126 = 434.7 MPa（SS400 / 1018軟鋼の代表値）。',
        ],
      },
      {
        id: 'p5',
        prompt:
          '快削黄銅 C360 試験片をロックウェルBスケール（1/16インチ球、全荷重100 kgf）で試験したところ、78.0 HRB が得られました。永久侵入深さ h をミリメートル単位で求めてください。',
        hint: 'HRB = 130 - (h / 0.002 mm) を変形し、h = (130 - HRB) · 0.002 mm として解きます。',
        targetValue: 0.104,
        unit: 'mm',
        tolerance: 0.002,
        solutionSteps: [
          'HRB公式の変形: h / 0.002 mm = 130 - HRB。',
          '差を計算: 130 - 78.0 = 52.0 ポイント。',
          '深さに換算: h = 52.0 · 0.002 mm = 0.104 mm（104 µm）。',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          '標準ロックウェル硬さ試験（ASTM E18 / JIS Z 2245）において、主荷重を加える前に必ず初荷重（10 kgf）を付加する工学的理由はどれですか？',
        options: [
          '表面粗さや酸化スケールを突き破り、試験片健全母材に圧子を確実に密着させて正確な基準ゼロ点を設定するため',
          'ダイヤモンド先端部を摩擦熱で加熱して測定時の摺動抵抗を低減するため',
          '試験片の表面にあらかじめ微小クラックを発生させて破壊靭性を測定するため',
          '試験機フレームの電気的アース接地を校正するため',
        ],
        correctIndex: 0,
        explanation:
          '初荷重（10 kgf）は表面の凹凸や酸化皮膜を押し潰して圧子を確実に座屈・密着させ、試験機フレームの微小なたわみを除去した上で正確な基準ゼロ点（h₀）を確立するために不可欠です。',
      },
      {
        id: 'q2',
        question:
          '標準ビッカース硬さ試験（ASTM E92 / JIS Z 2244）で使用されるダイヤモンド圧子の形状および対面角はどれですか？',
        options: [
          '対面角136°を有する正四角すいダイヤモンド圧子',
          '頂角60°を有する三角すいダイヤモンド圧子',
          '頂角120°・先端曲率半径0.20 mm の円すいダイヤモンド圧子',
          '直径10 mm の球状超硬合金圧子',
        ],
        correctIndex: 0,
        explanation:
          'ビッカース硬さ試験では、底面が正方形で対向する二面間の角度（対面角）が136°の正四角すいダイヤモンド圧子を用います。この136°は、ブリネル圧痕の理想的な幾何学的接触角（d/D = 0.375）に由来しています。',
      },
      {
        id: 'q3',
        question:
          '焼なまし銅やアルミニウム合金（6061など）のような軟質材料に対して、ロックウェルCスケール（HRC）の適用が禁止・無効とされる理由はどれですか？',
        options: [
          '150 kgfの主荷重でダイヤモンド圧子が深孔まで過剰にめり込み、圧子シャンク（保持具）が試料に干渉するほか、20 HRC未満ではスケールの直線性・信頼性が失われるため',
          'ダイヤモンドがアルミニウムと常温で化学反応を起こし急速に溶解するため',
          '150 kgfの加圧時に銅から火花が発生し光学センサが損傷するため',
          'ロックウェル試験は強磁性体金属専用の規格であるため',
        ],
        correctIndex: 0,
        explanation:
          '軟質金属に150 kgfの高荷重を加えると円すい部の有効高さを超えて圧子ボディが試料に衝突し、正確な測定が不可能です。ASTM E18では HRC の有効範囲を厳格に 20〜70 HRC に制限しています。',
      },
      {
        id: 'q4',
        question:
          '標準ブリネル硬さ試験（HBW 10/3000）において、圧痕直径 d と球圧子径 D の比率（d/D）を 0.24〜0.60（2.4 mm ≤ d ≤ 6.0 mm）の範囲内に制限しなければならない理由はどれですか？',
        options: [
          '0.24未満では圧痕が浅すぎて顕微鏡読取誤差が過大となり、0.60超では球の過剰沈み込みや冷間加工による盛り上がり変形（piling-up）で幾何学的相似性が崩れるため',
          'この範囲を外れると超硬合金球が過大応力で粉砕するため',
          '顕微鏡の視野制限により 6.0 mm を超える圧痕にピントが合わないため',
          'アンビル昇降スクリューの可動限界ストロークを超過するため',
        ],
        correctIndex: 0,
        explanation:
          'ASTM E10規格は 0.24 ≤ d/D ≤ 0.60 を要求しています。d/D < 0.24 では浅すぎて読取誤差が指数関数的に増大し、d/D > 0.60 では圧痕周囲の隆起（piling-up）や球の弾性偏平により理論式が破綻します。',
      },
      {
        id: 'q5',
        question:
          'ロックウェルC（HRC）およびロックウェルB（HRB）試験において、硬さ数値の1ポイント（1目盛）は永久侵入深さ（h）の何ミリメートルに相当しますか？',
        options: [
          '0.002 mm (2 µm)',
          '0.010 mm (10 µm)',
          '0.050 mm (50 µm)',
          '0.100 mm (100 µm)',
        ],
        correctIndex: 0,
        explanation:
          '標準ロックウェル硬さ試験では、インジケータの1目盛またはデジタル表示の1単位が、正確に 0.002 mm（2マイクロメートル）の永久侵入深さ差に規定されています。',
      },
      {
        id: 'q6',
        question:
          '非オーステナイト系炭素鋼および合金鋼に関する ASTM E140 経験的換算関係において、ブリネル硬さ（HBW）から引張強さ（UTS, MPa）を概算する実践式はどれですか？',
        options: [
          'UTS (MPa) ≈ 3.45 × HBW',
          'UTS (MPa) ≈ 1.25 × HBW',
          'UTS (MPa) ≈ 9.81 × HBW',
          'UTS (MPa) ≈ HBW / 2.5',
        ],
        correctIndex: 0,
        explanation:
          '熱処理調質鋼および構造用炭素鋼において、ASTM E140 Table 1 に基づく確立された近似換算則は UTS (MPa) ≈ 3.45 × HBW（ヤード・ポンド法では UTS [psi] ≈ 500 × HBW）です。',
      },
    ],
  },
});
