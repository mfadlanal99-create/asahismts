import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('vibration', {
  id: {
    title: 'Balans Rotor & Analisis Getaran (ISO 10816 / 20816)',
    shortTitle: 'Getaran & Balans Rotor',
    description:
      'Simulasikan dinamika rotor satu bidang, kecepatan kritis model Jeffcott, amplitudo getaran sinkron 1X, dan metode balans vektor polar. Evaluasi kesehatan mesin berdasarkan standar keparahan getaran ISO 10816-3 dan ISO 20816-3, amati orbit poros secara real-time, serta analisis spektrum frekuensi FFT dan sapuan kurva Bode.',
    explore: [
      {
        title: 'Dinamika Rotor Jeffcott & Resonansi Kecepatan Kritis',
        summary:
          'Mesin rotasi mengalami eksitasi gaya sentrifugal dinamik akibat massa unbalance sisa. Model rotor Jeffcott merepresentasikan poros elastis dengan kekakuan k yang menopang rotor bermassa M dengan eksentrisitas pusat massa e_u. Ketika kecepatan putar mendekati frekuensi pribadi (kecepatan kritis ω_n = √(k/M)), perpindahan getaran diamplifikasi oleh faktor pembesaran dinamik M(r). Pada kondisi resonansi (rasio frekuensi r = 1), sudut kelambatan fasa antara titik berat dan simpangan puncak tepat 90°, lalu bertransisi menuju 180° (kondisi self-centering terhadap pusat massa) pada kecepatan superkritis.',
        equations: [
          {
            label: 'Kecepatan Kritis Tanpa Redaman (Frekuensi Pribadi)',
            formula: 'ω_n = √(k / M),   N_c = (60 / 2π) * √(k / M)',
            note: 'k = kekakuan lentur poros (N/m), M = massa efektif rotor (kg), N_c = kecepatan kritis dalam RPM.',
          },
          {
            label: 'Eksentrisitas Massa (Spesifik Unbalance)',
            formula: 'e_u = U / M = (m_u * r_u) / M',
            note: 'U = unbalance dalam g·mm, M = massa rotor dalam kg; e_u adalah pergeseran pusat massa dalam μm.',
          },
          {
            label: 'Faktor Pembesaran Dinamik (Eksitasi Unbalance)',
            formula: 'M(r) = r² / √((1 - r²)² + (2 * ζ * r)²)',
            note: 'r = ω / ω_n adalah rasio frekuensi, ζ = rasio redaman viskos.',
          },
          {
            label: 'Sudut Kelambatan Fasa (Titik Berat ke Puncak Getaran)',
            formula: 'φ = atan2(2 * ζ * r, 1 - r²)',
            note: 'φ ≈ 0° di bawah resonansi, φ = 90° pada resonansi (r = 1), φ → 180° di atas resonansi.',
          },
        ],
        workedExample: {
          title: 'Perhitungan Kecepatan Kritis dan Faktor Pembesaran Resonansi',
          given: [
            'Massa rakitan rotor efektif M = 4.0 kg',
            'Kekakuan lentur ekuivalen poros k = 197,392 N/m',
            'Rasio redaman viskos ζ = 0.08',
            'Kecepatan operasi putar N = 2,100 RPM',
          ],
          steps: [
            'Hitung frekuensi pribadi lingkaran: ω_n = √(k / M) = √(197,392 / 4.0) = 222.14 rad/s.',
            'Konversi ke RPM kritis: N_c = (60 / 2π) * 222.14 = 2,121 RPM ≈ 2,100 RPM.',
            'Rasio frekuensi pada 2,100 RPM adalah r = 2,100 / 2,121 = 0.990 ≈ 1.0 (sangat dekat resonansi).',
            'Hitung faktor pembesaran dinamik pada r = 1: M(1) = 1 / (2 * ζ) = 1 / (2 * 0.08) = 6.25.',
            'Pada kondisi resonansi, amplitudo perpindahan sinkron 1X diamplifikasi 6.25 kali lipat eksentrisitas fisik massa.',
          ],
          answer: 'N_c = 2,121 RPM, Pembesaran Dinamik M = 6.25 (Amplifikasi Resonansi)',
        },
      },
      {
        title: 'Unbalance Statis & Dinamis dan Metode Balans Vektor Polar Satu Bidang',
        summary:
          'Ketidakseimbangan rotor terjadi ketika sumbu utama inersia menyimpang dari sumbu rotasi geometris poros. Pada rotor piringan tipis (L/D < 0.5), unbalance statis satu bidang sangat dominan. Dalam metode balans satu bidang, vektor unbalance awal U₀ diukur pada sudut θ₀. Massa uji coba (trial mass) W_t dipasang pada radius R untuk menentukan koefisien pengaruh sistem α. Massa koreksi penyeimbang W_c dan sudut pasang θ_c kemudian dihitung untuk menghasilkan gaya sentrifugal yang berlawanan dan seimbang, menurunkan getaran sisa ke kelas standar ISO 21940 (misalnya G2.5).',
        equations: [
          {
            label: 'Gaya Sentrifugal Unbalance',
            formula: 'F_c = m_u * r_u * ω² = U * ω²',
            note: 'F_c dalam Newton; gaya unbalance meningkat kuadratis terhadap kecepatan sudut rotasi ω (rad/s).',
          },
          {
            label: 'Koreksi Balans Ideal (Satu Bidang)',
            formula: 'W_c = U₀ / R_hole,   θ_c = (θ₀ + 180°) mod 360°',
            note: 'W_c = massa koreksi (g), R_hole = radius lubang baut (mm), θ_c = posisi sudut berlawanan diametral.',
          },
          {
            label: 'Vektor Koefisien Pengaruh Massa Uji',
            formula: 'α = (V_{0+t} - V₀) / W_t',
            note: 'V₀ = getaran awal 1X, V_{0+t} = getaran dengan beban uji W_t; α dalam (mm/s)/g.',
          },
          {
            label: 'Batas Unbalance Sisa Diizinkan (ISO 21940-11)',
            formula: 'U_per = 1000 * (G * M) / ω',
            note: 'G = kelas kualitas balans (mm/s), M = massa rotor (kg), ω = kecepatan sudut kerja (rad/s).',
          },
        ],
        workedExample: {
          title: 'Menghitung Massa dan Sudut Koreksi Balans',
          given: [
            'Unbalance awal terukur U₀ = 180 g·mm pada sudut θ₀ = 45°',
            'Radius lingkaran baut lubang balans piringan R_hole = 60 mm',
            'Tersedia lubang baut setiap interval 30° pada permukaan piringan',
          ],
          steps: [
            'Hitung massa koreksi penyeimbang: W_c = U₀ / R_hole = 180 g·mm / 60 mm = 3.00 g.',
            'Tentukan sudut berlawanan diametral: θ_c = (45° + 180°) = 225°.',
            'Jika 225° berada di antara lubang standar (210° dan 240°), lakukan pembagian vektor: W_c1 = W_c * sin(240° - 225°) / sin(30°) = 1.55 g pada 210°, dan W_c2 = 1.55 g pada 240°.',
            'Memasang 3.00 g langsung pada 225° membatalkan vektor ketidakseimbangan awal secara sempurna (sisa U = 0 g·mm).',
          ],
          answer: 'W_c = 3.00 g pada θ_c = 225° (Koreksi Balans Tepat)',
        },
      },
      {
        title: 'Standar Tingkat Keparahan Getaran ISO 10816-3 & ISO 20816-3',
        summary:
          'Pemantauan kondisi industri mengevaluasi kesehatan mesin rotasi dengan mengukur kecepatan getaran efektif broadband RMS (10 Hz hingga 1.000 Hz) pada rumah bantalan. Standar ISO 10816-3 dan ISO 20816-3 menetapkan empat zona evaluasi operasional untuk mesin industri menengah (Kelas II: motor listrik 15 kW hingga 300 kW serta pompa, kipas angin, dan kompresor) yang terpasang pada fondasi kaku maupun fleksibel.',
        equations: [
          {
            label: 'Kecepatan Getaran RMS dari Perpindahan Harmonik',
            formula: 'v_rms = (ω * X_peak) / √2 = (2π * f * X_peak) / (1000 * √2)',
            note: 'X_peak dalam μm (puncak nol-ke-puncak), f dalam Hz, v_rms dalam mm/s RMS.',
          },
          {
            label: 'Kecepatan RMS Total dari Komponen Harmonik',
            formula: 'v_total = √(v_{1X}² + v_{2X}² + v_{3X}² + v_{noise}²)',
            note: 'Menggabungkan komponen unbalance sinkron, ketidaksejajaran 2X, dan kelonggaran mekanik.',
          },
          {
            label: 'Batas Fondasi Kaku Kelas II (ISO 10816-3)',
            formula: 'Zona A ≤ 1.12,  Zona B ≤ 2.80,  Zona C ≤ 4.50,  Zona D > 4.50 mm/s',
            note: 'Zona A: Baik; Zona B: Diterima; Zona C: Tidak Memuaskan; Zona D: Bahaya / Trip Segera.',
          },
          {
            label: 'Batas Fondasi Fleksibel Kelas II (ISO 10816-3)',
            formula: 'Zona A ≤ 1.80,  Zona B ≤ 4.50,  Zona C ≤ 7.10,  Zona D > 7.10 mm/s',
            note: 'Fondasi fleksibel memperbolehkan batas gerak rumah bantalan lebih tinggi karena kepatuhan struktur.',
          },
        ],
        workedExample: {
          title: 'Evaluasi Zona Keparahan Getaran ISO untuk Motor Industri',
          given: [
            'Kecepatan putar motor N = 3,000 RPM (f = 50.0 Hz, ω = 314.16 rad/s)',
            'Amplitudo simpangan puncak 1X terukur X_peak = 15.0 μm (30 μm peak-to-peak)',
            'Tipe fondasi: Fondasi beton bertulang masif kaku (Kelas II, Rigid)',
          ],
          steps: [
            'Hitung kecepatan puncak getaran: v_peak = ω * X_peak * 10⁻³ = 314.16 * 15.0 * 10⁻³ = 4.712 mm/s.',
            'Konversi ke kecepatan RMS: v_rms = 4.712 / √2 = 3.332 mm/s RMS.',
            'Bandingkan dengan ambang batas ISO 10816-3 Kelas II Kaku: Zona A ≤ 1.12, Zona B ≤ 2.80, Zona C ≤ 4.50.',
            'Karena 2.80 < 3.332 ≤ 4.50 mm/s, mesin berada dalam Zona C (Tidak Memuaskan / Waspada).',
            'Tindakan korektif: Rencanakan proses penyeimbangan (balancing) pada jadwal henti berikutnya; operasi jangka panjang tak terbatas tidak diizinkan.',
          ],
          answer: 'v_rms = 3.33 mm/s (Zona C — Tidak Memuaskan / Perlu Perawatan)',
        },
      },
      {
        title: 'Analisis Spektrum Frekuensi FFT & Pelacakan Orde',
        summary:
          'Analisis spektrum Fast Fourier Transform (FFT) menguraikan sinyal getaran domain waktu menjadi komponen frekuensi diskrit. Dalam diagnosis mesin rotasi, frekuensi dinyatakan dalam kelipatan orde kecepatan putar poros (1X, 2X, 3X). Puncak dominan pada 1X dengan harmonik rendah menandakan murni unbalance massa. Amplitudo 2X yang tinggi menandakan ketidaklurusan poros (misalignment), sedangkan 3X atau harmonik lebih tinggi mencerminkan kelonggaran mekanik (looseness) atau cacat bantalan.',
        equations: [
          {
            label: 'Frekuensi Kecepatan Putar Fundamental (1X)',
            formula: 'f_{1X} = N / 60 (Hz)',
            note: 'Pada 1,800 RPM, f_{1X} = 30.0 Hz; pada 3,600 RPM, f_{1X} = 60.0 Hz.',
          },
          {
            label: 'Hubungan Orde Frekuensi Getaran',
            formula: 'f_n = n * f_{1X} = n * (N / 60)',
            note: 'n = 1 (unbalance), n = 2 (misalignment kopling), n = 3 (kelonggaran mekanis bantalan/dudukan).',
          },
          {
            label: 'Rasio Dominasi Energi Unbalance',
            formula: 'R_{1X} = v_{1X} / v_total',
            note: 'Jika R_{1X} > 0.85, gangguan getaran mutlak didominasi oleh ketidakseimbangan massa murni.',
          },
        ],
        workedExample: {
          title: 'Mendiagnosis Kerusakan Mesin dari Spektrum FFT Multi-Orde',
          given: [
            'Kecepatan operasi N = 1,800 RPM (frekuensi 1X = 30 Hz)',
            'Amplitudo puncak spektrum FFT: 1X (30 Hz) = 4.2 mm/s RMS, 2X (60 Hz) = 0.5 mm/s RMS, 3X (90 Hz) = 0.2 mm/s RMS',
          ],
          steps: [
            'Hitung kecepatan RMS total: v_total = √(4.2² + 0.5² + 0.2²) = √(17.64 + 0.25 + 0.04) = √17.93 = 4.23 mm/s RMS.',
            'Hitung rasio energi unbalance: R_{1X} = 4.2 / 4.23 = 99.3%.',
            'Diagnosis: Konsentrasi energi yang luar biasa pada 1X dengan 2X/3X sangat rendah memastikan akar masalah adalah unbalance rotor murni, bukan misalignment atau bearing looseness.',
            'Rekomendasi: Lakukan penyeimbangan dinamis rotor satu bidang tanpa perlu melakukan realignment poros.',
          ],
          answer: 'Akar Masalah: Unbalance Rotor Satu Bidang (Dominasi Energi 1X 99.3%)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Sebuah rotor piringan tunggal memiliki massa efektif M = 4.0 kg dan terpasang pada poros fleksibel dengan kekakuan lentur lateral k = 157,914 N/m. Hitung kecepatan kritis pertama tanpa redaman N_c dalam satuan revolusi per menit (RPM).',
        hint: 'ω_n = √(k / M) dalam rad/s, kemudian N_c = (60 / 2π) * ω_n = ω_n * 9.5493.',
        targetValue: 1900,
        unit: 'RPM',
        tolerance: 20,
        solutionSteps: [
          'ω_n = √(157,914 N/m / 4.0 kg) = √39,478.5 = 198.69 rad/s',
          'N_c = (60 / (2 * π)) * 198.69 = 9.5493 * 198.69 = 1,897.4 RPM ≈ 1,900 RPM',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Seorang teknisi balans mengukur unbalance awal U₀ = 240 g·mm pada rotor dengan massa total M = 6.0 kg. Hitung eksentrisitas pusat massa e_u dalam satuan mikrometer (μm).',
        hint: 'e_u = U₀ / M. Ingat bahwa (1 g·mm) / (1 kg) = (10⁻³ kg * 10⁻³ m) / (1 kg) = 10⁻⁶ m = 1 μm.',
        targetValue: 40.0,
        unit: 'μm',
        tolerance: 0.5,
        solutionSteps: [
          'e_u = U₀ / M = 240 g·mm / 6.0 kg',
          'e_u = 40.0 (g·mm/kg) = 40.0 μm',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Piringan rotor memiliki unbalance awal U₀ = 150 g·mm pada posisi sudut θ₀ = 60°. Jika beban koreksi dipasang pada lubang baut dengan radius R_hole = 50 mm, hitung massa koreksi penyeimbang W_c yang diperlukan (dalam gram) untuk penyeimbangan sempurna.',
        hint: 'W_c = U₀ / R_hole. Beban koreksi dipasang tepat berlawanan arah (θ_c = 60° + 180° = 240°).',
        targetValue: 3.0,
        unit: 'g',
        tolerance: 0.1,
        solutionSteps: [
          'W_c = U₀ / R_hole',
          'W_c = 150 g·mm / 50 mm = 3.00 g',
          'Dipasang pada θ_c = (60° + 180°) = 240° untuk meniadakan titik berat awal.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Sebuah rotor dengan eksentrisitas massa e_u = 25 μm beroperasi pada rasio frekuensi r = 0.60 di bawah kecepatan kritisnya. Jika rasio redaman sistem ζ = 0.08, hitung amplitudo simpangan getaran sinkron dinamik X dalam mikrometer (μm).',
        hint: 'X = e_u * M(r), dengan M(r) = r² / √((1 - r²)² + (2 * ζ * r)²).',
        targetValue: 13.9,
        unit: 'μm',
        tolerance: 0.5,
        solutionSteps: [
          'r² = 0.60² = 0.36',
          '(1 - r²) = 1 - 0.36 = 0.64,  (1 - r²)² = 0.64² = 0.4096',
          '2 * ζ * r = 2 * 0.08 * 0.60 = 0.096,  (2 * ζ * r)² = 0.096² = 0.009216',
          'Penyebut = √(0.4096 + 0.009216) = √0.418816 = 0.64716',
          'M(r) = 0.36 / 0.64716 = 0.5563',
          'X = 25 μm * 0.5563 = 13.91 μm',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Motor induksi berputar pada N = 1,800 RPM. Akselerometer getaran pada bantalan mendeteksi simpangan puncak sinkron 1X X_peak = 20.0 μm (40 μm peak-to-peak). Hitung kecepatan getaran efektif (RMS) v_rms dalam mm/s.',
        hint: 'ω = 2π * (1,800 / 60) = 188.5 rad/s. v_peak = ω * X_peak (dalam mm/s). v_rms = v_peak / √2.',
        targetValue: 2.67,
        unit: 'mm/s',
        tolerance: 0.1,
        solutionSteps: [
          'ω = (2 * π * 1,800) / 60 = 188.496 rad/s',
          'X_peak = 20.0 μm = 0.020 mm',
          'v_peak = ω * X_peak = 188.496 * 0.020 = 3.770 mm/s',
          'v_rms = v_peak / √2 = 3.770 / 1.4142 = 2.666 mm/s ≈ 2.67 mm/s',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Fenomena fisis apa yang terjadi ketika putaran rotor berakselerasi melintasi kecepatan kritisnya (resonansi)?',
        options: [
          'Amplitudo getaran mencapai puncak maksimal dan sudut fasa antara titik berat dan simpangan puncak bergeser melalui 90°',
          'Rotor mendadak berhenti seketika akibat hambatan aerodinamis',
          'Gaya sentrifugal unbalance hilang sama sekali menjadi nol tepat pada resonansi',
          'Arah putaran poros berbalik dari searah jarum jam menjadi berlawanan arah',
        ],
        correctIndex: 0,
        explanation:
          'Pada kecepatan kritis (r = 1), frekuensi putaran bertepatan dengan frekuensi pribadi lateral sistem. Simpangan getaran melonjak tajam (dibatasi oleh redaman ζ), dan sudut kelambatan fasa antara unbalance dan perpindahan puncak melintasi 90°, lalu menuju 180° di atas kecepatan kritis.',
      },
      {
        id: 'q2',
        question:
          'Mengapa rotor fleksibel mengalami fenomena pemusatan mandiri (self-centering) terhadap pusat massanya saat berputar jauh di atas kecepatan kritis (r >> 1)?',
        options: [
          'Sudut kelambatan fasa mendekati 180°, menyebabkan lenturan poros mensejajarkan pusat massa rotor tepat pada sumbu putar rotasi',
          'Beban unbalance terlempar lepas dari piringan oleh gaya sentrifugal',
          'Kekakuan lentur poros meningkat menjadi tak terhingga pada kecepatan superkritis',
          'Redaman viskos menyerap seluruh energi kinetik putaran',
        ],
        correctIndex: 0,
        explanation:
          'Pada kecepatan superkritis (r >> 1), sudut fasa mendekati 180°. Poros melengkung sedemikian rupa sehingga defleksi berlawanan arah dengan titik berat, membuat pusat massa berimpit dengan sumbu putar aktual (faktor pembesaran M(r) mendekati 1.0).',
      },
      {
        id: 'q3',
        question:
          'Dalam analisis spektrum frekuensi getaran (FFT), pola spektral mana yang merupakan karakteristik pasti dari unbalance massa murni?',
        options: [
          'Puncak getaran sinkron yang sangat dominan pada 1X RPM dengan distorsi harmonik (2X dan 3X) yang sangat rendah',
          'Puncak getaran dominan pada 2X RPM dengan getaran aksial tinggi',
          'Noise frekuensi tinggi broadband di atas 2 kHz tanpa komponen diskrit 1X',
          'Puncak sub-sinkron pada 0.43X hingga 0.48X RPM akibat oil whirl',
        ],
        correctIndex: 0,
        explanation:
          'Unbalance massa menghasilkan gaya sentrifugal sinusoidal murni yang berputar tepat satu kali per putaran poros. Spektrum FFT-nya menunjukkan konsentrasi energi dominan pada frekuensi 1X putaran dengan orbit melingkar atau elips simetris.',
      },
      {
        id: 'q4',
        question:
          'Berdasarkan standar ISO 10816-3 untuk mesin industri kelas menengah pada fondasi kaku (Kelas II), tindakan apa yang wajib diambil saat getaran mencapai Zona D (> 4.50 mm/s RMS)?',
        options: [
          'Penghentian darurat (shutdown / trip) segera untuk mencegah kerusakan struktur atau kegagalan fatik bantalan',
          'Melanjutkan operasi tanpa batas hingga jadwal overhaul tahunan',
          'Menaikkan kecepatan putar untuk melewati batas alarm getaran',
          'Menambahkan gemuk pelumas terus-menerus hingga angka getaran turun',
        ],
        correctIndex: 0,
        explanation:
          'Zona D pada ISO 10816-3 mengindikasikan tingkat keparahan getaran yang dapat memicu kerusakan fatik bantalan secara cepat, retak selubung, atau defleksi berbahaya pada poros. Mesin wajib dimatikan (trip) secepatnya untuk perbaikan.',
      },
      {
        id: 'q5',
        question:
          'Apa perbedaan mendasar batas getaran yang diizinkan antara fondasi kaku (rigid) dan fondasi fleksibel (flexible) dalam ISO 10816-3?',
        options: [
          'Fondasi fleksibel mengizinkan nilai kecepatan getaran lebih tinggi karena kelenturan tumpuan menyerap gaya dinamis tanpa menimbulkan tegangan geser berlebih pada bantalan',
          'Fondasi kaku memperbolehkan getaran dua kali lebih besar dibandingkan fondasi fleksibel',
          'Fondasi fleksibel meniadakan seluruh gaya sentrifugal akibat unbalance',
          'Standar ISO hanya berlaku untuk dudukan kaku dan melarang fondasi fleksibel',
        ],
        correctIndex: 0,
        explanation:
          'Tumpuan fleksibel (seperti pegas isolasi atau bantalan elastomer) lebih mudah bergerak mengikuti beban dinamik, sehingga rumah bantalan bergerak dengan simpangan lebih besar namun gaya reaksi dinamis yang ditransmisikan ke lantai justru lebih rendah. Oleh karena itu, batas ambang ISO lebih tinggi (contoh batas Zona B adalah 4.50 mm/s fleksibel vs 2.80 mm/s kaku).',
      },
      {
        id: 'q6',
        question:
          'Saat melakukan penyeimbangan satu bidang di lapangan pada rotor kaku, mengapa diperlukan putaran uji dengan beban percobaan (trial weight run)?',
        options: [
          'Untuk menentukan koefisien pengaruh sistem (sensitivitas magnitudo dan respons pergeseran fasa) pada kondisi operasi sebenarnya',
          'Untuk mengauskan permukaan bantalan sebelum beban permanen dipasang',
          'Untuk membersihkan kerak karat pada piringan rotor',
          'Untuk meningkatkan frekuensi kecepatan kritis poros',
        ],
        correctIndex: 0,
        explanation:
          'Karena redaman mekanik, kekakuan tumpuan bantalan, dan respons dinamik aktual sulit diprediksi secara presisi hanya dari model teoritis, penambahan massa uji W_t digunakan untuk menghitung vektor koefisien pengaruh α = (V_{0+t} - V₀) / W_t secara eksperimental.',
      },
    ],
  },
  ja: {
    title: 'ロータバランシング・振動解析シミュレータ (ISO 10816 / 20816)',
    shortTitle: 'ロータ振動・バランシング',
    description:
      '単一修正面ロータダイナミクス、ジェフコットロータの危険速度共振、1X同期振動振幅、および極座標ベクトル釣合試験を対話形式でシミュレーション。ISO 10816-3 / ISO 20816-3振動評価基準に基づく機械状態診断、リアルタイム軸心軌道（オービット）、FFT周波数スペクトル、およびボード線図応答を解析します。',
    explore: [
      {
        title: 'ジェフコットロータ力学と危険速度共振',
        summary:
          '回転機械は残留不釣合質量により遠心起振力を受けます。古典的なジェフコット（Jeffcott）ロータモデルは、等価剛性kを持つ弾性軸に支持された質量M・質量偏心量e_uのディスクを表します。回転速度が軸系の固有角振動数（危険速度 ω_n = √(k/M)）に近づくと、動的拡大係数M(r)により振動変位が急激に増大します。共振点（振動数比 r = 1）において、不釣合重心位置と最大変位点との位相遅れ角は正確に90°となり、超危険速度域では180°へと漸近して幾何中心ではなく重心を中心とした自己調心回転運動へ移行します。',
        equations: [
          {
            label: '非減衰危険速度 (固有角振動数)',
            formula: 'ω_n = √(k / M),   N_c = (60 / 2π) * √(k / M)',
            note: 'k = 軸横曲げ剛性 (N/m), M = 有効ロータ質量 (kg), N_c = 危険速度 (RPM)。',
          },
          {
            label: '質量偏心量 (比不釣合)',
            formula: 'e_u = U / M = (m_u * r_u) / M',
            note: 'U = 不釣合量 (g·mm), M = ロータ質量 (kg); e_uは重心の軸心オフセット量 (μm)。',
          },
          {
            label: '動的拡大係数 (不釣合起振)',
            formula: 'M(r) = r² / √((1 - r²)² + (2 * ζ * r)²)',
            note: 'r = ω / ω_n (振動数比), ζ = 粘性減衰比。',
          },
          {
            label: '位相遅れ角 (ヘビースポットから振動ピークまで)',
            formula: 'φ = atan2(2 * ζ * r, 1 - r²)',
            note: '共振未満でφ ≈ 0°、共振時(r = 1)でφ = 90°、超危険速度域でφ → 180°。',
          },
        ],
        workedExample: {
          title: '危険速度および共振時の動的拡大係数の計算',
          given: [
            'ロータ有効質量 M = 4.0 kg',
            '軸の等価曲げ剛性 k = 197,392 N/m',
            '粘性減衰比 ζ = 0.08',
            '運転回転速度 N = 2,100 RPM',
          ],
          steps: [
            '固有角振動数を算出: ω_n = √(k / M) = √(197,392 / 4.0) = 222.14 rad/s。',
            '危険速度(RPM)に換算: N_c = (60 / 2π) * 222.14 = 2,121 RPM ≈ 2,100 RPM。',
            '運転速度2,100 RPMにおける振動数比: r = 2,100 / 2,121 = 0.990 ≈ 1.0 (共振近傍)。',
            '共振時(r = 1)の動的拡大係数: M(1) = 1 / (2 * ζ) = 1 / (2 * 0.08) = 6.25。',
            '共振点では、物理的な偏心量に対して振動変位が6.25倍に増大します。',
          ],
          answer: 'N_c = 2,121 RPM, 動的拡大係数 M = 6.25 (共振増幅)',
        },
      },
      {
        title: '静不釣合・動不釣合と単一修正面極ベクトルバランシング',
        summary:
          'ロータの不釣合は、主慣性軸が幾何学的回転軸から偏位することにより発生します。薄円盤ディスク（L/D < 0.5）では静不釣合が支配的となります。単一修正面極ベクトル釣合試験では、初期不釣合ベクトルU₀を角度θ₀で測定し、既知の試動質量（試し重り）W_tを取り付けて系影響係数αを特定します。その結果から反対位相（180°）に適切な修正質量W_cを取り付けることで遠心力を完全に相殺し、残留不釣合をISO 21940釣合良さ等級（G2.5など）に収めます。',
        equations: [
          {
            label: '遠心不釣合力',
            formula: 'F_c = m_u * r_u * ω² = U * ω²',
            note: 'F_c (N); 不釣合遠心力は回転角速度ω (rad/s) の2乗に比例して急増します。',
          },
          {
            label: '理想的な打消し修正質量 (単一修正面)',
            formula: 'W_c = U₀ / R_hole,   θ_c = (θ₀ + 180°) mod 360°',
            note: 'W_c = 修正質量 (g), R_hole = 取付穴半径 (mm), θ_c = 正反対の対向位相角度。',
          },
          {
            label: '試し重り影響係数ベクトル',
            formula: 'α = (V_{0+t} - V₀) / W_t',
            note: 'V₀ = 初期1X振動ベクトル, V_{0+t} = 試し重り付加時振動ベクトル; 単位 (mm/s)/g。',
          },
          {
            label: '許容残留不釣合量 (ISO 21940-11)',
            formula: 'U_per = 1000 * (G * M) / ω',
            note: 'G = 釣合良さ等級 (mm/s), M = ロータ質量 (kg), ω = 実用角速度 (rad/s)。',
          },
        ],
        workedExample: {
          title: '修正質量の大きさと取付角度の決定手順',
          given: [
            '初期測定不釣合量 U₀ = 180 g·mm, 初期位相角 θ₀ = 45°',
            'ディスク修正ボルト穴ピッチ円半径 R_hole = 60 mm',
            'ディスク修正穴ピッチ: 30°間隔',
          ],
          steps: [
            '所要の修正質量を計算: W_c = U₀ / R_hole = 180 g·mm / 60 mm = 3.00 g。',
            '打消し対向位相角を算出: θ_c = 45° + 180° = 225°。',
            '225°位置が隣接する30°刻み穴（210°と240°）の間にある場合、ベクトル分解: W_c1 = 3.0 * sin(15°) / sin(30°) = 1.55 g (210°位置)、W_c2 = 1.55 g (240°位置)。',
            '225°位置に直接3.00 gの質量を付加することで、初期不釣合ベクトルを完全相殺します。',
          ],
          answer: 'W_c = 3.00 g (θ_c = 225°位置、初期不釣合を完全相殺)',
        },
      },
      {
        title: 'ISO 10816-3 / ISO 20816-3 振動評価基準',
        summary:
          '産業設備の状態監視（Condition Monitoring）では、軸受箱で測定されたブロードバンド振動速度実効値（RMS、10 Hz〜1,000 Hz）を用いて機械健全性を評価します。ISO 10816-3および最新のISO 20816-3は、中型産業機械（Class II: 15 kW〜300 kWの電動機、ポンプ、ファン等）を対象に、基礎剛性（剛性基礎または弾性基礎）に応じた4つの運転評価ゾーンを規定しています。',
        equations: [
          {
            label: '調和変位振幅からの振動速度RMS算出',
            formula: 'v_rms = (ω * X_peak) / √2 = (2π * f * X_peak) / (1000 * √2)',
            note: 'X_peak (μm, 片振幅), f (Hz), v_rms (mm/s RMS)。',
          },
          {
            label: '高調波成分を含めた総合振動速度RMS',
            formula: 'v_total = √(v_{1X}² + v_{2X}² + v_{3X}² + v_{noise}²)',
            note: '1X不釣合、2Xアライメント不良、3Xガタ・高調波を二乗和平方根で合成。',
          },
          {
            label: 'ISO 10816-3 クラスII 剛性基礎基準限界',
            formula: 'ゾーンA ≤ 1.12,  ゾーンB ≤ 2.80,  ゾーンC ≤ 4.50,  ゾーンD > 4.50 mm/s',
            note: 'ゾーンA: 良好, ゾーンB: 許容・無制限運転, ゾーンC: 注意・制限運転, ゾーンD: 危険・緊急停止。',
          },
          {
            label: 'ISO 10816-3 クラスII 弾性基礎基準限界',
            formula: 'ゾーンA ≤ 1.80,  ゾーンB ≤ 4.50,  ゾーンC ≤ 7.10,  ゾーンD > 7.10 mm/s',
            note: 'ばね防振等の弾性支持基礎では、基礎の追従性により許容振動速度限界が高く設定されます。',
          },
        ],
        workedExample: {
          title: '産業用電動機のISO振動評価ゾーン判定',
          given: [
            '回転速度 N = 3,000 RPM (周波数 f = 50.0 Hz, ω = 314.16 rad/s)',
            '測定された1X同期ピーク変位 X_peak = 15.0 μm (両振幅 30 μm p-p)',
            '基礎構造: 重厚な剛性コンクリート基礎 (Class II, Rigid)',
          ],
          steps: [
            'ピーク振動速度を計算: v_peak = ω * X_peak * 10⁻³ = 314.16 * 15.0 * 10⁻³ = 4.712 mm/s。',
            '実効値(RMS)に変換: v_rms = 4.712 / √2 = 3.332 mm/s RMS。',
            'ISO 10816-3 Class II 剛性基礎の判定基準と比較: ゾーンA ≤ 1.12, ゾーンB ≤ 2.80, ゾーンC ≤ 4.50。',
            '2.80 < 3.332 ≤ 4.50 mm/s であるため、評価は「ゾーンC（注意・制限運転）」と判定。',
            '保全対策: 次回計画停止時に現場バランシングを実施。長期無制限運転は推奨されません。',
          ],
          answer: 'v_rms = 3.33 mm/s (ゾーンC — 要点検・メンテナンス計画対象)',
        },
      },
      {
        title: 'FFT周波数スペクトル解析と回転次数比トラッキング',
        summary:
          '高速フーリエ変換（FFT）解析は、時間領域の複雑な振動波形を離散的な周波数成分へと分解します。回転機械診断では、軸回転速度の整数倍を「次数（Orders: 1X, 2X, 3X）」として追従解析します。1X成分が圧倒的に突出し高調波が極めて低い場合は純粋なロータ質量不釣合を示し、2X成分の増大は軸芯狂い（ミスアライメント）や曲がり軸、3X以上の高調波は機械的ガタ（ルーズネス）や軸受損傷を意味します。',
        equations: [
          {
            label: '回転基本周波数 (1X)',
            formula: 'f_{1X} = N / 60 (Hz)',
            note: '1,800 RPM運転時 f_{1X} = 30.0 Hz; 3,600 RPM運転時 f_{1X} = 60.0 Hz。',
          },
          {
            label: '回転次数比関係式',
            formula: 'f_n = n * f_{1X} = n * (N / 60)',
            note: 'n = 1 (不釣合), n = 2 (カップリング軸芯狂い), n = 3 (軸受・台床ガタ)。',
          },
          {
            label: '不釣合エネルギー支配度比',
            formula: 'R_{1X} = v_{1X} / v_total',
            note: 'R_{1X} > 0.85 の場合、振動起因は純粋なアンバランスに強く支配されています。',
          },
        ],
        workedExample: {
          title: '次数比FFTスペクトルからの異常原因診断',
          given: [
            '運転速度 N = 1,800 RPM (1X周波数 = 30 Hz)',
            'FFTスペクトル測定値: 1X (30 Hz) = 4.2 mm/s, 2X (60 Hz) = 0.5 mm/s, 3X (90 Hz) = 0.2 mm/s',
          ],
          steps: [
            '総合RMS速度を算出: v_total = √(4.2² + 0.5² + 0.2²) = √17.93 = 4.23 mm/s RMS。',
            '1X支配度比を計算: R_{1X} = 4.2 / 4.23 = 99.3%。',
            '診断: 振動エネルギーの99%以上が1Xに集中し、高調波が極小であるため、芯狂いやガタではなく純粋なロータ不釣合が原因と特定。',
            '対策: アライメント修正ではなく単一修正面バランシングを実施。',
          ],
          answer: '診断結果: 単一修正面ロータ不釣合 (1Xエネルギー支配度 99.3%)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '有効質量 M = 4.0 kg のディスクを持つ単一円盤ロータが、等価横曲げ剛性 k = 157,914 N/m の弾性軸に支持されています。非減衰第1危険速度 N_c を毎分回転数 (RPM) で求めてください。',
        hint: 'ω_n = √(k / M) (rad/s) を求め、N_c = (60 / 2π) * ω_n = ω_n * 9.5493 で換算します。',
        targetValue: 1900,
        unit: 'RPM',
        tolerance: 20,
        solutionSteps: [
          'ω_n = √(157,914 N/m / 4.0 kg) = √39,478.5 = 198.69 rad/s',
          'N_c = (60 / (2 * π)) * 198.69 = 9.5493 * 198.69 = 1,897.4 RPM ≈ 1,900 RPM',
        ],
      },
      {
        id: 'p2',
        prompt:
          '保全技術者が総質量 M = 6.0 kg のロータにおいて初期不釣合量 U₀ = 240 g·mm を測定しました。このロータの重心偏心量 e_u をマイクロメートル (μm) で求めてください。',
        hint: 'e_u = U₀ / M。1 g·mm / 1 kg = 1 μm であることに留意してください。',
        targetValue: 40.0,
        unit: 'μm',
        tolerance: 0.5,
        solutionSteps: [
          'e_u = U₀ / M = 240 g·mm / 6.0 kg',
          'e_u = 40.0 (g·mm/kg) = 40.0 μm',
        ],
      },
      {
        id: 'p3',
        prompt:
          'ロータディスクに角度 θ₀ = 60° で U₀ = 150 g·mm の初期不釣合が存在します。修正ボルト穴半径 R_hole = 50 mm の位置に修正重りを取り付ける場合、完全釣合に必要な修正質量 W_c (g) を求めてください。',
        hint: 'W_c = U₀ / R_hole。取付位置は対向位置（θ_c = 60° + 180° = 240°）となります。',
        targetValue: 3.0,
        unit: 'g',
        tolerance: 0.1,
        solutionSteps: [
          'W_c = U₀ / R_hole',
          'W_c = 150 g·mm / 50 mm = 3.00 g',
          'θ_c = 240° 位置に取り付けることで初期のヘビースポットを相殺します。',
        ],
      },
      {
        id: 'p4',
        prompt:
          '質量偏心量 e_u = 25 μm を持つロータが、危険速度以下の振動数比 r = 0.60 で運転されています。系の粘性減衰比が ζ = 0.08 のとき、同期動的振動変位振幅 X (μm) を求めてください。',
        hint: 'X = e_u * M(r)、M(r) = r² / √((1 - r²)² + (2 * ζ * r)²)。',
        targetValue: 13.9,
        unit: 'μm',
        tolerance: 0.5,
        solutionSteps: [
          'r² = 0.60² = 0.36',
          '(1 - r²) = 1 - 0.36 = 0.64,  (1 - r²)² = 0.4096',
          '2 * ζ * r = 2 * 0.08 * 0.60 = 0.096,  (2 * ζ * r)² = 0.009216',
          '分母 = √(0.4096 + 0.009216) = √0.418816 = 0.64716',
          'M(r) = 0.36 / 0.64716 = 0.5563',
          'X = 25 μm * 0.5563 = 13.91 μm',
        ],
      },
      {
        id: 'p5',
        prompt:
          '回転速度 N = 1,800 RPM の誘導電動機において、軸受の振動センサが同期1Xピーク変位 X_peak = 20.0 μm (両振幅 40 μm p-p) を検出しました。振動速度の実効値 (RMS) v_rms (mm/s) を求めてください。',
        hint: 'ω = 2π * (1,800 / 60) = 188.5 rad/s。v_peak = ω * X_peak (mm/s)。v_rms = v_peak / √2。',
        targetValue: 2.67,
        unit: 'mm/s',
        tolerance: 0.1,
        solutionSteps: [
          'ω = (2 * π * 1,800) / 60 = 188.496 rad/s',
          'X_peak = 20.0 μm = 0.020 mm',
          'v_peak = ω * X_peak = 188.496 * 0.020 = 3.770 mm/s',
          'v_rms = v_peak / √2 = 3.770 / 1.4142 = 2.666 mm/s ≈ 2.67 mm/s',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'ロータの回転速度が危険速度（共振点）を通過して加速するときに生じる物理現象として、最も適切なものはどれですか？',
        options: [
          '振動振幅が鋭いピークを示し、不釣合ヘビースポットと振動最大変位点との位相差が90°を通過してシフトする',
          '空気抵抗によりロータの回転が瞬間的に完全停止する',
          '共振点において不釣合遠心力が完全にゼロに消失する',
          '軸の回転方向が時計回りから反時計回りへと自然反転する',
        ],
        correctIndex: 0,
        explanation:
          '危険速度（r = 1）では、起振振動数が軸系の横曲げ固有振動数と一致します。振動変位は減衰比ζに制限されつつ急激に増大し、位相遅れ角は90°を通過して超危険速度域の180°へと向かいます。',
      },
      {
        id: 'q2',
        question:
          '危険速度を大幅に超える超臨界速度（r >> 1）で回転する弾性ロータが「自己調心作用（Self-centering）」を示す理由は何ですか？',
        options: [
          '位相遅れ角が180°に漸近し、軸の撓みによってロータの重心が回転中心軸上に一致するように運動するため',
          '遠心力によって不釣合重りが物理的にロータから飛び散るため',
          '超危険速度では軸の曲げ剛性が無限大に増大するため',
          '粘性減衰が回転運動エネルギーを完全に消散させるため',
        ],
        correctIndex: 0,
        explanation:
          '共振を大きく超えた回転域（r >> 1）では、不釣合位置と撓み方向の位相差がほぼ180°（正反対）となります。これによりディスクの重心が実際の回転中心軸上に位置するようになり、軸心ではなく重心を中心とする安定回転（自己調心）が成立します。',
      },
      {
        id: 'q3',
        question:
          'FFT周波数スペクトル解析において、純粋な質量不釣合（アンバランス）を決定づける特徴的なスペクトルパターンはどれですか？',
        options: [
          '回転同期周波数（1X RPM）成分が突出し、2Xや3X等の高調波成分が極めて低いスペクトル',
          '2X RPMが突出し、軸受のアキシアル（軸方向）振動が非常に高いスペクトル',
          '1X成分が全く存在せず、2 kHz以上の高周波帯域にブロードバンドノイズのみが存在するパターン',
          'オイルホワールによる0.43X〜0.48Xの分数調波（サブシンクロナス）ピーク',
        ],
        correctIndex: 0,
        explanation:
          '質量不釣合による遠心力は回転軸1回転につき正確に1回作用する正弦波起振力です。そのためFFTスペクトル上では回転基本次数（1X）にエネルギーの大半が集中し、アライメント不良やガタを伴わない限り高調波成分は小さくなります。',
      },
      {
        id: 'q4',
        question:
          '剛性基礎上に設置された中型産業機械（ISO 10816-3 Class II）において、振動速度がゾーンD（> 4.50 mm/s RMS）に達した場合、規格上求められるアクションはどれですか？',
        options: [
          '重大な軸受疲労破壊や機械破損を防止するため、直ちに緊急停止（トリップ）させる',
          '年次定期点検の時期までそのまま連続運転を継続する',
          '警報アラームを回避するために回転速度をさらに上昇させる',
          '振動数値が低下するまで潤滑グリースを無制限に注入し続ける',
        ],
        correctIndex: 0,
        explanation:
          'ISO 10816-3においてゾーンDは「許容できない危険領域」と定義されています。この水準の振動は急激な軸受損傷、ケーシング亀裂、軸破壊を引き起こす重大リスクがあるため、直ちに装置を停止させて原因を除去する必要があります。',
      },
      {
        id: 'q5',
        question:
          'ISO 10816-3において、剛性基礎（Rigid）と弾性基礎（Flexible）の許容振動速度基準が異なる根本的な工学的理由は何ですか？',
        options: [
          '弾性基礎はマウントの柔軟性が動的力を吸収するため、軸受箱の振動変位が大きくても台床や構造体に伝わる動的応力が過大にならないため',
          '剛性基礎の方が弾性基礎よりも2倍高い振動速度を許容できるため',
          '弾性基礎は不釣合遠心力そのものを完全にゼロに相殺するため',
          'ISO規格は剛性支持のみを対象とし、弾性支持の機械は禁止されているため',
        ],
        correctIndex: 0,
        explanation:
          'ばねや防振ゴムなどの弾性支持台床は動的荷重に対して柔軟に変位するため、軸受箱の振動速度は剛性基礎より大きくなりますが、実際に基礎や軸受に作用する伝達動荷重（せん断力）は緩和されます。そのため規格上の許容値が高く設定されています（例: ゾーンB限界値は剛性の2.80 mm/sに対し弾性は4.50 mm/s）。',
      },
      {
        id: 'q6',
        question:
          '現場で単一修正面バランシングを実施する際、最終修正質量を取り付ける前に「試し重り（テストウェイト）運転」を行う主要な目的は何ですか？',
        options: [
          '実際の運転条件下における系の影響係数（感度および位相応答）を実験的に特定するため',
          '恒久的な修正質量を取り付ける前に軸受摺動面をなじませるため',
          'ロータディスク表面の錆や汚れを遠心力で吹き飛ばすため',
          '回転軸の危険速度を恒久的に引き上げるため',
        ],
        correctIndex: 0,
        explanation:
          '実際の設備では減衰特性や軸受支持剛性が設計図面通りとは限らず、理論計算だけで修正質量を導くのは困難です。そのため既知の試し重りW_tを付加して振動ベクトルの変化量（影響係数 α = (V_{0+t} - V₀) / W_t）を計測することが不可欠です。',
      },
    ],
  },
});
