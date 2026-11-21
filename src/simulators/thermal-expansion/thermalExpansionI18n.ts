import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('thermal-expansion', {
  id: {
    title: 'Pemuaian Termal & Suaian Susut (Shrink Fit)',
    shortTitle: 'Pemuaian Termal',
    description:
      'Simulator termo-mekanis interaktif. Eksplorasi pemuaian termal linier dan volumetrik, tegangan termal terkekang dengan celah ekspansi, perakitan poros-hub suaian susut (shrink fit), dan defleksi elemen termostat strip bimetal Timoshenko.',
    explore: [
      {
        title: 'Ekspansi Termal Linier & Volumetrik',
        summary:
          'Saat temperatur naik, jarak rata-rata antaratom meningkat akibat bentuk asimetris sumur energi potensial ikatan atom. Untuk material padat isotropik, ekspansi linier berbanding lurus dengan panjang mula (L₀) dan perubahan temperatur (ΔT = T - T₀). Ekspansi volumetrik memperhitungkan pemuaian 3 dimensi, di mana koefisien volumetrik mendekati tiga kali koefisien linier (β ≈ 3α).',
        equations: [
          {
            label: 'Ekspansi Termal Linier',
            formula: 'ΔL = α * L₀ * ΔT',
            note: 'α = koefisien ekspansi termal linier (1/°C atau µm/(m·°C)), L₀ = panjang awal (mm), ΔT = perubahan suhu (°C).',
          },
          {
            label: 'Panjang Akhir Spesimen',
            formula: 'L = L₀ * (1 + α * ΔT)',
            note: 'Menunjukkan panjang akhir material saat memuai bebas tanpa kekangan mekanis.',
          },
          {
            label: 'Ekspansi Termal Volumetrik',
            formula: 'ΔV = β * V₀ * ΔT ≈ 3 * α * V₀ * ΔT',
            note: 'β = koefisien ekspansi volume; untuk padatan isotropik nilainya β ≈ 3α.',
          },
          {
            label: 'Ekspansi Luas (Permukaan)',
            formula: 'ΔA = γ * A₀ * ΔT ≈ 2 * α * A₀ * ΔT',
            note: 'γ = koefisien ekspansi area; berlaku untuk luas pelat dan perubahan diameter lubang.',
          },
        ],
        workedExample: {
          title: 'Pemuaian Termal Balok Jembatan Baja di Luar Ruangan',
          given: [
            'Panjang awal balok jembatan L₀ = 40.0 m (40.000 mm)',
            'Baja Struktural ASTM A36: α = 12.0 × 10⁻⁶ / °C',
            'Temperatur minimum musim dingin T_min = -10.0 °C',
            'Temperatur maksimum musim panas T_max = +45.0 °C',
            'Rentang temperatur ΔT = 45.0 - (-10.0) = 55.0 °C',
          ],
          steps: [
            'Identifikasi panjang mula dalam mm: L₀ = 40.000 mm.',
            'Hitung total selisih temperatur tahunan: ΔT = 55.0 °C.',
            'Terapkan rumus ekspansi linier: ΔL = α * L₀ * ΔT.',
            'Substitusikan nilai numerik: ΔL = (12.0 × 10⁻⁶ / °C) * 40.000 mm * 55.0 °C = 26.4 mm.',
            'Sambungan ekspansi (expansion joint) jembatan wajib mampu mengakomodasi gerak bebas minimal 26.4 mm.',
          ],
          answer: 'ΔL = 26.4 mm (Balok memuai sebesar 26.4 mm sepanjang siklus tahunan)',
        },
      },
      {
        title: 'Tegangan Termal Terkekang & Celah Ekspansi Abutment',
        summary:
          'Benda yang memuai secara bebas akibat kenaikan temperatur tidak mengalami tegangan mekanis (regangan termal terjadi alami tanpa halangan). Namun, jika ekspansi ditahan sebagian atau seluruhnya oleh tumpuan kaku, timbul tegangan termal tekan. Jika terdapat celah awal (δ_gap), tegangan hanya terbentuk setelah pemuaian bebas melampaui dan menutup celah tersebut.',
        equations: [
          {
            label: 'Regangan Termal Bebas',
            formula: 'ε_th = α * ΔT',
            note: 'Pertambahan panjang alami per satuan panjang akibat energi termal.',
          },
          {
            label: 'Tegangan Terkekang dengan Celah Ekspansi',
            formula: 'σ_th = E * (α * ΔT - δ_gap / L₀)   [ketika α * L₀ * ΔT > δ_gap]',
            note: 'E = Modulus Young (MPa), δ_gap = celah awal (mm). σ_th = 0 jika pemuaian bebas ≤ δ_gap.',
          },
          {
            label: 'Gaya Dorong Aksial pada Tumpuan',
            formula: 'F = σ_th * A',
            note: 'F = gaya tekan aksial pada tumpuan (N), A = luas penampang batang (mm²).',
          },
          {
            label: 'Tegangan Termal Terkekang Penuh (Tanpa Celah)',
            formula: 'σ_th = E * α * ΔT',
            note: 'Tegangan tekan maksimum yang terjadi saat kedua ujung diikat kaku sempurna tanpa celah toleransi.',
          },
        ],
        workedExample: {
          title: 'Tegangan Tekan Termal pada Pipa Aluminium yang Terkekang',
          given: [
            'Batang pipa aluminium 6061-T6: E = 68.9 GPa (68.900 MPa), α = 23.6 × 10⁻⁶ / °C',
            'Panjang awal L₀ = 1500 mm pada temperatur ruangan T₀ = 20 °C',
            'Celah ekspansi awal ke dinding kaku δ_gap = 1.20 mm',
            'Temperatur operasi meningkat hingga T = 80 °C (ΔT = 60 °C)',
          ],
          steps: [
            'Hitung pemuaian bebas: ΔL_bebas = α * L₀ * ΔT = 23.6 × 10⁻⁶ * 1500 mm * 60 °C = 2.124 mm.',
            'Evaluasi celah: Karena 2.124 mm > 1.20 mm, batang menyentuh dinding kaku abutment.',
            'Hitung deformasi yang terkekang: ΔL_terkekang = 2.124 mm - 1.20 mm = 0.924 mm.',
            'Hitung regangan tekan mekanis: ε_mekanis = 0.924 mm / 1500 mm = 0.000616 mm/mm.',
            'Hitung tegangan tekan termal: σ = E * ε_mekanis = 68.900 MPa * 0.000616 = 42.44 MPa.',
          ],
          answer: 'σ_th = 42.4 MPa (Tegangan tekan yang menekan dinding tumpuan kaku)',
        },
      },
      {
        title: 'Suaian Susut (Shrink Fit) & Strip Bimetal',
        summary:
          'Ekspansi termal dimanfaatkan dalam manufaktur presisi untuk suaian susut (memanaskan hub atau mendinginkan poros secara kriogenik agar dapat dirakit tanpa gesekan paksa, lalu menghasilkan tekanan kontak friksi masif setelah dingin). Pada strip bimetal, dua logam dengan koefisien muai berbeda disatukan, menghasilkan kelengkungan terarah saat suhu berubah (teori bimetal Timoshenko) yang menjadi dasar sakelar termostat.',
        equations: [
          {
            label: 'Temperatur Pemanasan Perakitan Shrink Fit',
            formula: 'ΔT_req = (δ + c_assembly) / (α_hub * d)',
            note: 'δ = interferensi diametral (mm), c_assembly = margin kelonggaran aman (biasanya 0.02 mm), d = diameter nominal poros.',
          },
          {
            label: 'Tekanan Kontak Lamé (Poros Pejal)',
            formula: 'p_c = δ / [ d * ( (1 - ν_s)/E_s + (1/E_h) * ((D_o² + d²)/(D_o² - d²) + ν_h) ) ]',
            note: 'D_o = diameter luar hub, d = diameter poros, E_s/E_h = modulus, ν_s/ν_h = rasio Poisson.',
          },
          {
            label: 'Kapasitas Torsi Transmisi Friksi',
            formula: 'T_cap = 0.5 * π * μ * p_c * L * d²',
            note: 'μ = koefisien gesek antarmuka, L = panjang kontak aksial hub (mm).',
          },
          {
            label: 'Kelengkungan & Defleksi Ujung Bimetal Timoshenko',
            formula: 'κ = 1/ρ = 6(α₁ - α₂)ΔT(1+m)² / [h·penyebut],   δ_ujung ≈ κ * L₀² / 2',
            note: 'm = t₁/t₂, h = t₁ + t₂ (ketebalan total), L₀ = panjang strip kantilever, δ_ujung = defleksi ujung bebas.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Defleksi Ujung Strip Termostat Bimetal',
          given: [
            'Panjang strip kantilever L₀ = 100 mm, tebal total h = 1.0 mm (t₁ = t₂ = 0.5 mm, m = 1.0)',
            'Lapisan 1 (Kuningan C360): α₁ = 20.5 × 10⁻⁶ / °C, E₁ = 105 GPa',
            'Lapisan 2 (Invar 36): α₂ = 1.2 × 10⁻⁶ / °C, E₂ = 145 GPa',
            'Kenaikan temperatur pemanasan ΔT = 50.0 °C',
          ],
          steps: [
            'Rasio modulus elastisitas: n = E₁ / E₂ = 105 / 145 = 0.7241.',
            'Faktor penyebut untuk m = 1: 14 + n + 1/n = 14 + 0.7241 + (1 / 0.7241) = 16.105.',
            'Selisih koefisien ekspansi: Δα = (20.5 - 1.2) × 10⁻⁶ = 19.3 × 10⁻⁶ / °C.',
            'Hitung kurvatur kelengkungan κ: κ = (24 * 19.3 × 10⁻⁶ * 50) / (1.0 mm * 16.105) = 0.001438 mm⁻¹.',
            'Hitung defleksi ujung bebas: δ_ujung = κ * L₀² / 2 = 0.001438 * (100)² / 2 = 7.19 mm.',
          ],
          answer: 'δ_ujung = 7.19 mm (Strip melengkung ke arah lapisan Invar berekspansi rendah)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Sebuah balok jembatan baja struktural (ASTM A36, α = 12.0 × 10⁻⁶ / °C) memiliki panjang mula L₀ = 40.0 m. Sepanjang siklus pergantian musim, temperaturnya naik sebesar ΔT = 55.0 °C. Hitung pemuaian termal linier bebas (ΔL) dalam satuan mm.',
        hint: 'Gunakan persamaan ΔL = α * L₀ * ΔT. Konversikan 40.0 m menjadi 40.000 mm sebelum dikalikan.',
        solutionSteps: [
          'L₀ = 40.0 m = 40.000 mm',
          'ΔT = 55.0 °C',
          'ΔL = (12.0 × 10⁻⁶ / °C) * 40.000 mm * 55.0 °C',
          'ΔL = 26.4 mm',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Batang aluminium silindris 6061-T6 (E = 68.9 GPa, α = 23.6 × 10⁻⁶ / °C, L₀ = 1500 mm) dipasang dengan celah awal δ_gap = 1.20 mm dari dinding kaku penahan. Batang mengalami kenaikan temperatur ΔT = 60.0 °C. Hitung tegangan tekan termal (σ_th) yang terjadi dalam MPa.',
        hint: 'Cari pemuaian bebas ΔL_bebas = α * L₀ * ΔT terlebih dahulu. Deformasi yang terkekang adalah ΔL_bebas - δ_gap. Tegangan σ = E * (ΔL_terkekang / L₀).',
        solutionSteps: [
          'ΔL_bebas = 23.6 × 10⁻⁶ * 1500 mm * 60.0 °C = 2.124 mm',
          'Karena 2.124 mm > 1.20 mm, celah tertutup penuh dan terjadi pengekangan',
          'Deformasi terkekang = 2.124 mm - 1.20 mm = 0.924 mm',
          'Regangan termal ε = 0.924 mm / 1500 mm = 0.000616',
          'Tegangan termal σ = 68.900 MPa * 0.000616 = 42.44 MPa',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Batang pengikat baja karbon pejal berdiameter d = 50.0 mm (A = 1963.5 mm², E = 200.0 GPa, α = 12.0 × 10⁻⁶ / °C) dijepit kaku sempurna di kedua ujungnya tanpa celah toleransi. Jika temperatur naik sebesar ΔT = 40.0 °C, hitung gaya dorong tekan aksial (F) yang dialami dinding tumpuan dalam kN.',
        hint: 'Hitung tegangan termal σ = E * α * ΔT dalam MPa, lalu kalikan dengan luas penampang A dan bagi 1000 untuk mendapatkan kN.',
        solutionSteps: [
          'σ = E * α * ΔT = 200.000 MPa * (12.0 × 10⁻⁶ / °C) * 40.0 °C = 96.0 MPa',
          'Luas penampang A = π * (50 mm)² / 4 = 1963.5 mm²',
          'Gaya dorong aksial F = σ * A = 96.0 N/mm² * 1963.5 mm² = 188.496 N',
          'F dalam kN = 188.496 / 1000 = 188.5 kN',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Sebuah hub baja dengan diameter lubang nominal d = 80.0 mm akan dipasang pada poros dengan interferensi diametral 0.08 mm (80 µm) melalui suaian susut. Diperlukan kelonggaran aman 0.03 mm agar hub dapat meluncur mulus masuk ke poros. Baja hub memiliki α = 12.0 × 10⁻⁶ / °C. Hitung kenaikan temperatur pemanasan (ΔT) hub yang diperlukan dalam °C.',
        hint: 'Total ekspansi lubang yang dibutuhkan Δd = interferensi (0.08 mm) + margin celah (0.03 mm) = 0.11 mm. Kemudian hitung ΔT = Δd / (α * d).',
        solutionSteps: [
          'Ekspansi lubang yang dibutuhkan Δd = 0.08 mm + 0.03 mm = 0.11 mm',
          'Δd = α * d * ΔT  =>  ΔT = Δd / (α * d)',
          'ΔT = 0.11 mm / (12.0 × 10⁻⁶ / °C * 80.0 mm) = 0.11 / 0.00096 = 114.58 °C',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Strip termostat bimetal kantilever memiliki panjang L₀ = 100 mm dan tebal lapisan seimbang t₁ = t₂ = 0.5 mm (tebal total h = 1.0 mm). Lapisan 1 adalah Kuningan C360 (α₁ = 20.5 × 10⁻⁶ / °C, E₁ = 105 GPa) dan Lapisan 2 adalah Invar 36 (α₂ = 1.2 × 10⁻⁶ / °C, E₂ = 145 GPa). Saat dipanaskan sebesar ΔT = 50.0 °C, hitung defleksi ujung bebas (δ_ujung) dalam mm.',
        hint: 'Gunakan persamaan bimetal Timoshenko untuk mencari kelengkungan κ lalu hitung lendutan ujung δ_ujung = (κ * L₀²) / 2.',
        solutionSteps: [
          'Rasio modulus n = E₁ / E₂ = 105 / 145 = 0.7241',
          'Faktor penyebut = 14 + n + 1/n = 14 + 0.7241 + 1.3810 = 16.105',
          'Δα = 20.5 × 10⁻⁶ - 1.2 × 10⁻⁶ = 19.3 × 10⁻⁶ / °C',
          'Kelengkungan κ = (24 * Δα * ΔT) / (h * 16.105) = (24 * 19.3 × 10⁻⁶ * 50) / 16.105 = 0.001438 mm⁻¹',
          'Lendutan ujung δ_ujung = (κ * L₀²) / 2 = 0.001438 * (100)² / 2 = 7.19 mm',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Dalam kondisi apakah batang logam padat mengalami tegangan termal bernilai nol saat dipanaskan sebesar 100 °C?',
        options: [
          'Ketika kedua ujungnya bebas memuai tanpa ada tahanan atau rintangan kinematik eksternal',
          'Ketika batang dijepit kaku sempurna di antara dua dinding beton kokoh',
          'Ketika material tersebut memiliki Modulus Young yang sangat tinggi',
          'Ketika permukaan batang dilapisi cat isolasi termal khusus',
        ],
        explanation:
          'Tegangan termal hanya tercipta saat regangan alami pemuaian (ε_th = α·ΔT) terhalang oleh tumpuan atau struktur di sekitarnya. Jika batang bebas bergerak, ia hanya mengalami perubahan dimensi panjang tanpa adanya gaya dalam ataupun tegangan mekanis.',
      },
      {
        id: 'q2',
        question:
          'Untuk benda padat yang bersifat isotropik, bagaimanakah hubungan antara koefisien ekspansi termal volumetrik (β) dan koefisien linier (α)?',
        options: [
          'β ≈ 3 * α',
          'β ≈ α / 3',
          'β = α²',
          'β = 2 * α',
        ],
        explanation:
          'Karena ekspansi volumetrik terjadi sama rata pada ketiga dimensi ruang (sumbu x, y, dan z), V = V₀(1 + αΔT)³ ≈ V₀(1 + 3αΔT). Oleh karena itu, β ≈ 3α untuk seluruh material padat isotropik.',
      },
      {
        id: 'q3',
        question:
          'Mengapa paduan nikel-besi Invar 36 (FeNi36) memiliki koefisien pemuaian termal yang sangat mendekati nol (α ≈ 1.2 × 10⁻⁶ / °C)?',
        options: [
          'Efek magnetostriksi volume spontan menyusutkan kisi kristal feromagnetik, hampir tepat mengimbangi pemuaian vibrasi fonon termal',
          'Material ini memiliki Modulus Young tak terhingga yang melarang atom bergerak',
          'Di dalamnya terdapat kantung vakum mikroskopis yang menyerap energi panas',
          'Atom-atom di dalamnya tidak bergetar pada temperatur di atas 0 °C',
        ],
        explanation:
          'Efek Invar didasari oleh fenomena kuantum magnetik: saat pemanasan membuat vibrasi termal mendorong atom saling menjauh, kontraksi volume akibat magnetostriksi spontan secara simultan merapatkan kisi kristal, menghasilkan kestabilan dimensi luar biasa di sekitar suhu ruang.',
      },
      {
        id: 'q4',
        question:
          'Faktor-faktor apa sajakah yang menentukan kapasitas transmisi torsi (T_cap) pada sambungan suaian susut (shrink fit) antara poros dan hub?',
        options: [
          'Tekanan kontak antarmuka (p_c), koefisien gesek (μ), luas bidang kontak (π·d·L), dan jari-jari poros (d/2)',
          'Hanya kecepatan putaran motor penggerak poros',
          'Tekanan udara barometrik di ruang pabrik',
          'Konduktivitas termal pelumas bantalan mesin',
        ],
        explanation:
          'Sambungan shrink fit menyalurkan torsi murni melalui gaya gesek statis pada permukaan kontak: T_cap = μ * Gaya Normal * Radius = μ * (p_c * π * d * L) * (d / 2). Tekanan kontak p_c tercipta dari besarnya interferensi elastis yang terpasang.',
      },
      {
        id: 'q5',
        question:
          'Ketika strip bimetal yang terdiri dari Kuningan (α tinggi) dan Invar (α rendah) dipanaskan melampaui suhu ruangan, ke arah manakah ia akan melengkung?',
        options: [
          'Melengkung ke arah lapisan Invar, karena Kuningan memanjang lebih banyak dan memaksa kurva melingkari sisi yang memuai lebih sedikit',
          'Melengkung ke arah lapisan Kuningan, karena Kuningan menyusut saat dipanaskan',
          'Tetap lurus sempurna dan hanya bertambah tebal',
        ],
        explanation:
          'Lapisan kuningan memiliki koefisien ekspansi jauh lebih besar daripada Invar sehingga bertambah panjang lebih signifikan. Karena kedua lapisan terikat kuat di antarmuka, strip terpaksa melengkung dengan kuningan berada di sisi luar busur (radius besar) dan Invar di sisi dalam busur.',
      },
      {
        id: 'q6',
        question:
          'Bahaya kegagalan struktural fatal apakah yang mengancam rel kereta api sambungan las menerus (CWR) atau pipa panjang ketika sambungan ekspansi tidak mencukupi saat musim panas ekstrem?',
        options: [
          'Tekuk tekan termal (thermal buckling / sun kink) akibat akumulasi gaya dorong tekan aksial raksasa yang tertahan',
          'Pengecilan penampang lokal (necking) dan patah tarik ulet',
          'Peleburan instan kepala rel pada suhu 50 °C',
          'Hilangnya permeabilitas magnetik rel seketika',
        ],
        explanation:
          'Rel yang terkekang kaku mengalami akumulasi tegangan tekan sangat tinggi (σ = E·α·ΔT) saat terpapar terik matahari. Jika gaya dorong tekan melebihi batas kritis tekuk kolom (Euler buckling), rel akan meliuk ke samping secara mendadak (sun kink / track blowout) yang dapat menggulingkan kereta api.',
      },
    ],
  },
  ja: {
    title: '熱膨張・焼きばめシミュレータ',
    shortTitle: '熱膨張・焼きばめ',
    description:
      '熱力学と材料力学が融合した高精度2Dシミュレータ。線膨張・体積膨張、隙間付き拘束壁による熱応力と軸推力、軸・ハブの焼きばめ締結（接触面圧・伝達トルク）、およびティモシェンコ理論に基づくバイメタル熱変形を直感的に探求します。',
    explore: [
      {
        title: '線膨張と体積熱膨張の基礎力学',
        summary:
          '固体の温度が上昇すると、原子間結合のポテンシャル曲線の非対称性により原子の平均振動中心間隔が拡大します。等方性弾性材料において、長さの伸び（線膨張）は元の長さ（L₀）と温度変化（ΔT = T - T₀）に直接比例します。3次元の空間的な広がりを示す体積熱膨張係数は、線膨張係数の約3倍（β ≈ 3α）となります。',
        equations: [
          {
            label: '線膨張の基本則',
            formula: 'ΔL = α * L₀ * ΔT',
            note: 'α = 線膨張係数 (1/°C または µm/(m·°C)), L₀ = 初期長さ (mm), ΔT = 温度変化量 (°C)。',
          },
          {
            label: '加熱後の最終長さ',
            formula: 'L = L₀ * (1 + α * ΔT)',
            note: '拘束のない自由膨張条件下における熱変形後の全長。',
          },
          {
            label: '体積熱膨張',
            formula: 'ΔV = β * V₀ * ΔT ≈ 3 * α * V₀ * ΔT',
            note: 'β = 体積膨張係数。等方性固体では幾何学的に β ≈ 3α が高精度に成立。',
          },
          {
            label: '面積熱膨張',
            formula: 'ΔA = γ * A₀ * ΔT ≈ 2 * α * A₀ * ΔT',
            note: 'γ = 面膨張係数 (γ ≈ 2α)。平板の表面積や板金に開けられた丸穴の穴径拡大にも適用。',
          },
        ],
        workedExample: {
          title: '屋外鋼製橋梁主桁の季節温度サイクルによる線膨張計算',
          given: [
            '橋梁主桁の初期長 L₀ = 40.0 m (40,000 mm)',
            '構造用炭素鋼 ASTM A36: 線膨張係数 α = 12.0 × 10⁻⁶ / °C',
            '冬季最低気温 T_min = -10.0 °C',
            '夏季最高温度 T_max = +45.0 °C',
            '年間温度変化幅 ΔT = 45.0 - (-10.0) = 55.0 °C',
          ],
          steps: [
            '初期長さをミリメートル単位に換算: L₀ = 40,000 mm。',
            '全温度変化幅を算出: ΔT = 55.0 °C。',
            '線膨張公式に適用: ΔL = α * L₀ * ΔT。',
            '数値を代入計算: ΔL = (12.0 × 10⁻⁶ / °C) * 40,000 mm * 55.0 °C = 26.4 mm。',
            '橋梁の歪みや破壊を防ぐため、伸縮継手（エキスパンションジョイント）には最低26.4mm以上の可動代が必要です。',
          ],
          answer: 'ΔL = 26.4 mm（主桁は年間で約26.4mm伸縮）',
        },
      },
      {
        title: '熱応力拘束と膨張隙間（ギャップ）の力学',
        summary:
          '昇温しても部材が自由に伸びられる環境では、内部に熱応力は一切発生しません。しかし、両端が剛体壁や隣接機械によって拘束されると、熱歪みが阻害されて強大な圧縮熱応力が発生します。初期隙間（δ_gap）が設けられている場合、自由膨張量が隙間を超えるまでは無応力であり、壁に当接した瞬間から熱応力と軸推力（スラスト）が立ち上がります。',
        equations: [
          {
            label: '自由熱ひずみ',
            formula: 'ε_th = α * ΔT',
            note: '外部拘束がない場合に生じる純粋な熱的伸び率。',
          },
          {
            label: '隙間付き拘束壁による熱応力',
            formula: 'σ_th = E * (α * ΔT - δ_gap / L₀)   [α * L₀ * ΔT > δ_gap の時]',
            note: 'E = ヤング率 (MPa), δ_gap = 初期クリアランス隙間 (mm)。自由膨張量 ≤ δ_gap の時は σ_th = 0。',
          },
          {
            label: '拘束端に作用する軸圧縮推力',
            formula: 'F = σ_th * A',
            note: 'F = 剛体壁に及ぼす反力スラスト (N), A = 棒部材の断面積 (mm²)。',
          },
          {
            label: '両端完全剛体拘束（隙間ゼロ）の熱応力',
            formula: 'σ_th = E * α * ΔT',
            note: '熱膨張が100%阻止された場合に生じる最大圧縮応力（部材の長さに依存しない）。',
          },
        ],
        workedExample: {
          title: '隙間付き剛体壁に当接するアルミ配管の熱応力解析',
          given: [
            'アルミ合金 6061-T6: E = 68.9 GPa (68,900 MPa), α = 23.6 × 10⁻⁶ / °C',
            '初期長さ L₀ = 1500 mm（室温 T₀ = 20 °C で設置）',
            '剛体壁までの初期膨張隙間 δ_gap = 1.20 mm',
            '配管使用温度 T = 80 °C（温度上昇 ΔT = 60 °C）',
          ],
          steps: [
            '自由膨張量を計算: ΔL_free = α * L₀ * ΔT = 23.6 × 10⁻⁶ * 1500 mm * 60 °C = 2.124 mm。',
            '隙間の比較判定: 2.124 mm > 1.20 mm のため、配管先端が壁に強く激突・拘束されます。',
            '阻止された変位量を算出: ΔL_restrained = 2.124 mm - 1.20 mm = 0.924 mm。',
            '力学的圧縮ひずみを算出: ε_mech = 0.924 mm / 1500 mm = 0.000616。',
            '生じる圧縮熱応力を導出: σ = E * ε_mech = 68,900 MPa * 0.000616 = 42.44 MPa。',
          ],
          answer: 'σ_th = 42.4 MPa（壁面を押圧する圧縮熱応力）',
        },
      },
      {
        title: '焼きばめ（Shrink Fit）締結とバイメタル帯の変形',
        summary:
          '熱膨張は機械設計において積極的に応用されています。焼きばめ（ハブの加熱膨張または軸のサブゼロ冷却）によりキーや止め輪なしで強大な摩擦伝達トルクを得ることができます。また、熱膨張係数の異なる2枚の金属板を接合したバイメタルは、温度変化に伴って円弧状に湾曲（ティモシェンコの曲率理論）し、サーモスタットや過電流ブレーカーの駆動素子として不可欠です。',
        equations: [
          {
            label: '焼きばめ挿入に必要な加熱温度差',
            formula: 'ΔT_req = (δ + c_assembly) / (α_hub * d)',
            note: 'δ = 直径しめしろ (mm), c_assembly = 挿入安全クリアランス (通常0.02 mm), d = 軸径。',
          },
          {
            label: 'ラメの式に基づく接触面圧（中実軸）',
            formula: 'p_c = δ / [ d * ( (1 - ν_s)/E_s + (1/E_h) * ((D_o² + d²)/(D_o² - d²) + ν_h) ) ]',
            note: 'D_o = ハブ外径, d = 軸径, E_s/E_h = ヤング率, ν_s/ν_h = ポアソン比。',
          },
          {
            label: '摩擦伝達トルク容量',
            formula: 'T_cap = 0.5 * π * μ * p_c * L * d²',
            note: 'μ = 接触面摩擦係数, L = ハブの軸方向嵌合長さ (mm)。',
          },
          {
            label: 'ティモシェンコのバイメタル曲率と先端変位',
            formula: 'κ = 1/ρ = 6(α₁ - α₂)ΔT(1+m)² / [h·分母項],   δ_tip ≈ κ * L₀² / 2',
            note: 'm = t₁/t₂, h = t₁ + t₂ (全板厚), L₀ = 片持ち長さ, δ_tip = 先端たわみ量。',
          },
        ],
        workedExample: {
          title: 'サーモスタット用バイメタルの先端たわみ量計算',
          given: [
            '片持ち帯長さ L₀ = 100 mm, 全厚 h = 1.0 mm (板厚比 m = t₁/t₂ = 1.0)',
            '層1（黄銅 C360）: α₁ = 20.5 × 10⁻⁶ / °C, E₁ = 105 GPa',
            '層2（インバー 36）: α₂ = 1.2 × 10⁻⁶ / °C, E₂ = 145 GPa',
            '温度上昇量 ΔT = 50.0 °C',
          ],
          steps: [
            'ヤング率比を算出: n = E₁ / E₂ = 105 / 145 = 0.7241。',
            'm = 1 における分母係数: 14 + n + 1/n = 14 + 0.7241 + (1 / 0.7241) = 16.105。',
            '熱膨張係数の差分: Δα = (20.5 - 1.2) × 10⁻⁶ = 19.3 × 10⁻⁶ / °C。',
            '曲率 κ を計算: κ = (24 * 19.3 × 10⁻⁶ * 50) / (1.0 mm * 16.105) = 0.001438 mm⁻¹。',
            '片持ち梁先端変位を計算: δ_tip = κ * L₀² / 2 = 0.001438 * (100)² / 2 = 7.19 mm。',
          ],
          answer: 'δ_tip = 7.19 mm（低膨張インバー側へ向かって先端が7.19mm湾曲）',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '初期長さ L₀ = 40.0 m の構造用炭素鋼製橋梁（ASTM A36, α = 12.0 × 10⁻⁶ / °C）が、年間の季節変動により ΔT = 55.0 °C 昇温しました。無拘束時の自由熱膨張量（ΔL）を mm 単位で求めてください。',
        hint: 'ΔL = α * L₀ * ΔT を計算します。計算前に 40.0 m を 40,000 mm に変換してください。',
        solutionSteps: [
          'L₀ = 40.0 m = 40,000 mm',
          'ΔT = 55.0 °C',
          'ΔL = (12.0 × 10⁻⁶ / °C) * 40,000 mm * 55.0 °C',
          'ΔL = 26.4 mm',
        ],
      },
      {
        id: 'p2',
        prompt:
          'アルミ合金 6061-T6 製丸棒（E = 68.9 GPa, α = 23.6 × 10⁻⁶ / °C, L₀ = 1500 mm）が、剛体壁から初期隙間 δ_gap = 1.20 mm を隔てて設置されています。棒が ΔT = 60.0 °C 昇温したとき、内部に生じる圧縮熱応力（σ_th）を MPa 単位で求めてください。',
        hint: 'まず自由熱膨張量 ΔL_free = α * L₀ * ΔT を求め、隙間を超えた拘束変位量（ΔL_free - δ_gap）から σ = E * (変位 / L₀) を計算します。',
        solutionSteps: [
          'ΔL_free = 23.6 × 10⁻⁶ * 1500 mm * 60.0 °C = 2.124 mm',
          '2.124 mm > 1.20 mm のため隙間が閉じ拘束状態が発生',
          '拘束された伸び変位量 = 2.124 mm - 1.20 mm = 0.924 mm',
          '熱ひずみ ε = 0.924 mm / 1500 mm = 0.000616',
          '熱応力 σ = 68,900 MPa * 0.000616 = 42.44 MPa',
        ],
      },
      {
        id: 'p3',
        prompt:
          '直径 d = 50.0 mm（断面積 A = 1963.5 mm², E = 200.0 GPa, α = 12.0 × 10⁻⁶ / °C）の中実炭素鋼タイロッドが両端完全剛体拘束（隙間ゼロ）されています。温度が ΔT = 40.0 °C 上昇したとき、支持壁面に加わる軸圧縮推力（F）を kN 単位で求めてください。',
        hint: '熱応力 σ = E * α * ΔT を計算し、断面積 A を掛けて全荷重（N）を求め、1000で割ってkNにします。',
        solutionSteps: [
          'σ = E * α * ΔT = 200,000 MPa * (12.0 × 10⁻⁶ / °C) * 40.0 °C = 96.0 MPa',
          '断面積 A = π * (50 mm)² / 4 = 1963.5 mm²',
          '軸推力 F = σ * A = 96.0 N/mm² * 1963.5 mm² = 188,496 N',
          'F (kN) = 188,496 / 1000 = 188.5 kN',
        ],
      },
      {
        id: 'p4',
        prompt:
          '内径公称 d = 80.0 mm の鋼製ハブを、直径しめしろ 0.08 mm (80 µm) の軸に焼きばめします。円滑な挿入作業のために 0.03 mm のクリアランス代が必要です。ハブ材の線膨張係数は α = 12.0 × 10⁻⁶ / °C です。ハブに必要な加熱昇温幅（ΔT）を °C 単位で求めてください。',
        hint: '必要な穴径拡大総量 Δd = しめしろ (0.08 mm) + 挿入隙間 (0.03 mm) = 0.11 mm。ΔT = Δd / (α * d) を解きます。',
        solutionSteps: [
          '必要穴径拡大量 Δd = 0.08 mm + 0.03 mm = 0.11 mm',
          'Δd = α * d * ΔT  =>  ΔT = Δd / (α * d)',
          'ΔT = 0.11 mm / (12.0 × 10⁻⁶ / °C * 80.0 mm) = 0.11 / 0.00096 = 114.58 °C',
        ],
      },
      {
        id: 'p5',
        prompt:
          '片持ちバイメタル式サーモスタット素子の長さ L₀ = 100 mm、板厚 t₁ = t₂ = 0.5 mm（全厚 h = 1.0 mm）です。層1は黄銅 C360（α₁ = 20.5 × 10⁻⁶ / °C, E₁ = 105 GPa）、層2はインバー 36（α₂ = 1.2 × 10⁻⁶ / °C, E₂ = 145 GPa）です。ΔT = 50.0 °C 加熱されたときの自由先端たわみ量（δ_tip）を mm 単位で求めてください。',
        hint: 'ティモシェンコのバイメタル曲率公式から κ を求め、片持ち梁先端変位 δ_tip = (κ * L₀²) / 2 を計算します。',
        solutionSteps: [
          'ヤング率比 n = E₁ / E₂ = 105 / 145 = 0.7241',
          '分母係数 = 14 + n + 1/n = 14 + 0.7241 + 1.3810 = 16.105',
          'Δα = 20.5 × 10⁻⁶ - 1.2 × 10⁻⁶ = 19.3 × 10⁻⁶ / °C',
          '曲率 κ = (24 * Δα * ΔT) / (h * 16.105) = (24 * 19.3 × 10⁻⁶ * 50) / 16.105 = 0.001438 mm⁻¹',
          '先端たわみ δ_tip = (κ * L₀²) / 2 = 0.001438 * (100)² / 2 = 7.19 mm',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          '100 °C 昇温された金属丸棒において、内部の熱応力が完全にゼロとなる条件はどれですか？',
        options: [
          '外部の幾何学的拘束がなく、両端が完全に自由に伸縮できる場合',
          '両端が強固なコンクリート壁に固定されている場合',
          '材料のヤング率が極めて高い場合',
          '表面に遮熱塗料が塗装されている場合',
        ],
        explanation:
          '熱応力は、温度変化に伴う自然な熱ひずみ（ε = α·ΔT）が外部拘束によって妨げられたときにのみ発生します。無拘束の自由膨張状態では、部材の寸法が変わるだけで内部応力は一切発生しません。',
      },
      {
        id: 'q2',
        question:
          '等方性固体材料において、体積熱膨張係数（β）と線膨張係数（α）の幾何学的関係として最も適切なものはどれですか？',
        options: [
          'β ≈ 3 * α',
          'β ≈ α / 3',
          'β = α²',
          'β = 2 * α',
        ],
        explanation:
          '等方性材料では直交する3軸（x, y, z方向）すべてに等しく線膨張が生じるため、V = V₀(1 + αΔT)³ ≈ V₀(1 + 3αΔT) となり、体積膨張係数は線膨張係数の約3倍（β ≈ 3α）となります。',
      },
      {
        id: 'q3',
        question:
          'ニッケル-鉄系特殊合金「インバー 36（FeNi36）」が、室温付近で極めてゼロに近い熱膨張係数（α ≈ 1.2 × 10⁻⁶ / °C）を示す物理的メカニズムは何ですか？',
        options: [
          '強磁性領域の自発体積磁歪による結晶格子の収縮効果が、熱振動（フォノン）による熱膨張をほぼ相殺するため',
          'ヤング率が無限大であり原子の運動が物理的に禁止されているため',
          '金属結晶内部に熱を吸収する真空空洞が存在するため',
          '0 °C 以上では原子振動が完全に停止するため',
        ],
        explanation:
          'インバー効果は量子磁気的現象に基づきます。温度上昇により通常の原子熱振動が格子を広げようとする一方、自発磁歪効果により磁気的な体積収縮が生じ、この2つの現象が室温付近で相殺し合って驚異的な寸法安定性を実現します。',
      },
      {
        id: 'q4',
        question:
          '焼きばめ（しまりばめ）締結において、軸とハブが伝達可能な最大摩擦トルク（T_cap）を決定づける主たる力学的要素は何ですか？',
        options: [
          '嵌合境界面の接触面圧（p_c）、摩擦係数（μ）、接触円筒面積（π·d·L）、および軸半径（d/2）',
          '連結されているモータの最高回転数のみ',
          '組み立て工場内の大気圧',
          '軸受潤滑油の熱伝導率',
        ],
        explanation:
          '焼きばめ結合は境界面の静止摩擦力のみによって回転トルクを伝達します：T_cap = μ * 垂直力 * 半径 = μ * (p_c * π * d * L) * (d / 2)。接触面圧 p_c は弾性しめしろの寸法差から発生します。',
      },
      {
        id: 'q5',
        question:
          '黄銅（高膨張率）とインバー（超低膨張率）を強固に接合したバイメタル板を加熱したとき、帯はどの方向に湾曲しますか？',
        options: [
          '黄銅の方が長く伸びるため、伸長量の小さいインバー側を中心（内側）とする円弧を描いて湾曲する',
          '黄銅が加熱により収縮するため黄銅側へ湾曲する',
          '全く湾曲せず板厚のみが増大する',
        ],
        explanation:
          '黄銅の線膨張係数はインバーの約17倍あるため、加熱されると黄銅層が大きく伸びます。両層は界面で拘束されているため、伸びの大きい黄銅が外周、伸びの小さいインバーが内周となる円弧状にたわみます。',
      },
      {
        id: 'q6',
        question:
          '猛暑時において、ロングレール（継目無レール CWR）や長距離配管で伸縮吸収が不足した場合に発生する最も重大な構造破壊形態は何ですか？',
        options: [
          '強大な軸圧縮熱応力に起因する急激な圧縮熱座屈（レール張出し・スネーク変形 / Sun kink）',
          '局所的なくびれ（ネッキング）による延性引張破断',
          'レール頭部が 50 °C で瞬間的に溶融する熱破壊',
          'レールの透磁率が瞬時に完全消失する電磁気崩壊',
        ],
        explanation:
          '両端拘束された長尺部材に生じる圧縮熱応力（σ = E·α·ΔT）は数万トン規模の巨大な軸推力となります。この推力がオイラー座屈限界荷重を超えると、線路が横方向に瞬時に吹き飛ぶ「レール張出し（軌道座屈）」が発生し、脱線転覆の重大事故を引き起こします。',
      },
    ],
  },
});
