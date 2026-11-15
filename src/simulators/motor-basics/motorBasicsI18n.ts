import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('motor-basics', {
  id: {
    title: 'Lab Pemula: Jenis Motor Listrik, Nameplate & Koneksi Star/Delta',
    shortTitle: 'Motor Listrik Dasar',
    description:
      'Simulator pemula untuk mengenali anatomi motor listrik industri (3-Fasa AC TEFC, 1-Fasa Cap-Start, VFD Inverter-Duty, BLDC, Servo, Stepper), kode pemasangan (B3 Foot, B5 Flange, B14 Face), kecepatan sinkron 2P/4P/6P pada 50/60 Hz, rating IP54–IP65, serta konfigurasi jumper kotak terminal Star (Y) vs Delta (Δ).',
    explore: [
      {
        title: 'Kecepatan Sinkron, Jumlah Kutub (2P/4P/6P) & Slip Motor Induksi',
        summary:
          'Pada motor induksi AC, medan magnet berputar di dalam stator pada kecepatan sinkron Ns yang ditentukan oleh frekuensi listrik jala-jala (50 Hz atau 60 Hz) dan jumlah kutub magnet (2, 4, atau 6 kutub). Rotor sangkar tupai harus berputar sedikit lebih lambat agar terjadi induksi arus; selisih ini disebut Slip.',
        equations: [
          {
            label: 'Kecepatan Sinkron Medan Stator (Ns)',
            formula: 'N_s = (120 · f) / p',
            note: 'f = frekuensi (Hz), p = jumlah kutub (2, 4, 6). Contoh 4P 50 Hz: (120×50)/4 = 1500 RPM.',
          },
          {
            label: 'Persentase Slip Rotor (s)',
            formula: 's = [(N_s - N_r) / N_s] × 100%',
            note: 'Nr = kecepatan poros berbeban (mis. 1440 RPM untuk 4P 50 Hz -> slip 4%).',
          },
          {
            label: 'Torsi Poros Nominal (T)',
            formula: 'T = P / ω = P / (2π · N_r / 60)',
            note: 'Untuk motor 4.0 kW pada 1440 RPM (150.8 rad/s), T ≈ 26.5 N·m.',
          },
        ],
        workedExample: {
          title: 'Membaca Kecepatan Sinkron & Slip dari Nameplate Motor 4P 50 Hz',
          given: [
            'Motor induksi TEFC 3-fasa 4.0 kW, 4 Kutub (4P), Frekuensi 50 Hz',
            'Kecepatan tertera pada nameplate (Nr) = 1440 RPM',
          ],
          steps: [
            'Hitung kecepatan sinkron medan stator: Ns = (120 × 50) / 4 = 1500 RPM.',
            'Hitung persentase slip beban penuh: s = [(1500 - 1440) / 1500] × 100% = 4.0%.',
            'Hitung kecepatan sudut poros: ω = 2π × 1440 / 60 = 150.8 rad/s.',
            'Hitung torsi nominal: T = 4000 W / 150.8 rad/s = 26.5 N·m.',
          ],
          answer: 'Ns = 1500 RPM, Slip = 4.0%, Torsi Nominal = 26.5 N·m',
        },
      },
      {
        title: 'Koneksi Kotak Terminal: Star (Y) vs Delta (Δ) & Pencocokan Nameplate',
        summary:
          'Motor industri 3-fasa memiliki 6 baut terminal (U1, V1, W1 dan W2, U2, V2) di dalam kotak terminal. Posisi plat jumper tembaga menentukan apakah setiap kumparan menerima tegangan fase penuh (Delta) atau dibagi √3 (Star). Salah menyambung Delta pada jala 400V untuk motor 230/400V akan membakar kumparan seketika.',
        equations: [
          {
            label: 'Hubungan Tegangan Fase pada Koneksi Star (Y)',
            formula: 'V_fasa = V_jala / √3  (≈ 0.577 × V_jala)',
            note: 'Jumper 1 plat horizontal menghubungkan W2–U2–V2 menjadi titik netral bintang. 400V jala -> 230V per kumparan.',
          },
          {
            label: 'Hubungan Tegangan Fase pada Koneksi Delta (Δ)',
            formula: 'V_fasa = V_jala',
            note: 'Jumper 3 plat vertikal (U1–W2, V1–U2, W1–V2). Menghasilkan torsi penuh namun arus start 3× lebih besar dari Star.',
          },
        ],
        workedExample: {
          title: 'Menentukan Koneksi Terminal untuk Jala Listrik Industri 400 V',
          given: [
            'Sumber listrik pabrik: 3-fasa 400 V (antar-fasa / line-to-line), 50 Hz',
            'Nameplate motor tertulis: 230/400 V Δ/Y, 14.5/8.4 A',
          ],
          steps: [
            'Periksa tegangan kumparan individual motor: angka kecil (230 V) adalah tegangan maksimum satu kumparan (rating Delta).',
            'Karena sumber listrik adalah 400 V (> 230 V), kumparan TIDAK boleh dihubungkan Delta.',
            'Hubungkan terminal dalam konfigurasi STAR (Y) dengan memasang satu bar jumper horizontal melintasi W2–U2–V2.',
            'Verifikasi tegangan kumparan: V_fasa = 400 / √3 = 230.9 V (aman sesuai rating), arus saluran 8.4 A.',
          ],
          answer: 'Wajib pasang konfigurasi STAR (Y) dengan jumper horizontal W2–U2–V2.',
        },
      },
      {
        title: 'Kode Pemasangan (B3/B5/B14), Proteksi IP (IP54–IP65) & Jenis Motor Khusus',
        summary:
          'Memilih motor juga mencakup cara pemasangan mekanis (kaki B3, flens besar B5, atau flens muka berulir B14), ketahanan debu/air (kode IP menurut IEC 60529), serta teknologi penggerak khusus seperti motor VFD inverter-duty dengan bearing terisolasi, Servo ber-encoder, BLDC magnet permanen, dan Stepper presisi open-loop.',
        equations: [
          {
            label: 'Dekode Kode IP (IEC 60529)',
            formula: 'Digit-1 (Debu: 5=Terlindung, 6=Kedap Total) | Digit-2 (Air: 4=Percikan, 5=Semprotan Nozzle)',
            note: 'IP55 adalah standar industri umum; IP65 wajib untuk area pencucian higienis (washdown) dan kelautan.',
          },
        ],
        workedExample: {
          title: 'Memilih Pengganti Motor Konveyor Kecepatan Variabel dengan VFD',
          given: [
            'Kebutuhan: Kecepatan konveyor diatur terus-menerus dari 15 Hz hingga 60 Hz lewat VFD',
            'Lingkungan: Area pengemasan minuman dengan semprotan pembersih rutin',
          ],
          steps: [
            'Pilih tipe motor VFD Inverter-Duty: dilengkapi blower pendingin terpisah agar tidak overheat pada putaran rendah 15 Hz serta bearing terisolasi dari arus EDM.',
            'Pilih proteksi IP65 agar kedap debu dan tahan semprotan air langsung.',
            'Pilih mounting B5 atau B14 untuk pemasangan langsung pada gearbox inline konveyor.',
          ],
          answer: 'Motor VFD Inverter-Duty ber-rating IP65 dengan mounting B5/B14.',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Hitung kecepatan sinkron Ns (RPM) dari motor induksi AC 4 Kutub (4P) yang dioperasikan pada frekuensi listrik 50 Hz.',
        hint: 'Gunakan rumus Ns = (120 × f) / p dengan f = 50 Hz dan p = 4.',
        targetValue: 1500,
        unit: 'RPM',
        tolerance: 5,
        solutionSteps: [
          'Gunakan persamaan kecepatan sinkron: Ns = (120 × f) / p.',
          'Substitusi nilai: Ns = (120 × 50) / 4 = 6000 / 4 = 1500 RPM.',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Hitung kecepatan sinkron Ns (RPM) dari motor kecepatan tinggi 2 Kutub (2P) pada jala listrik 60 Hz.',
        hint: 'Substitusikan f = 60 Hz dan p = 2 ke rumus Ns = (120 × f) / p.',
        targetValue: 3600,
        unit: 'RPM',
        tolerance: 10,
        solutionSteps: [
          'Gunakan persamaan kecepatan sinkron: Ns = (120 × f) / p.',
          'Substitusi nilai: Ns = (120 × 60) / 2 = 3600 RPM.',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Motor 4 kutub 50 Hz (Ns = 1500 RPM) berputar pada kecepatan beban penuh 1440 RPM. Hitung persentase slip rotor (%).',
        hint: 'Slip (%) = [(Ns - Nr) / Ns] × 100%.',
        targetValue: 4,
        unit: '%',
        tolerance: 0.2,
        solutionSteps: [
          'Selisih kecepatan: 1500 - 1440 = 60 RPM.',
          'Persentase slip: (60 / 1500) × 100% = 4.0%.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Sebuah motor dihubungkan dalam konfigurasi Star (Y) ke jala listrik 3-fasa 400 V. Berapakah tegangan (V) yang diterima tiap kumparan fasa (dibulatkan ke bilangan bulat terdekat)?',
        hint: 'Pada koneksi Star, V_fasa = V_jala / √3 ≈ 400 / 1.732.',
        targetValue: 231,
        unit: 'V',
        tolerance: 2,
        solutionSteps: [
          'Pada koneksi Star (Y), tegangan saluran dibagi √3 oleh dua kumparan seri.',
          'V_fasa = 400 / 1.73205 ≈ 230.9 V (≈ 231 V).',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Hitung torsi poros nominal (N·m) motor 4.0 kW (4000 W) yang berputar pada kecepatan terukur 1440 RPM.',
        hint: 'Hitung ω = 2π × 1440 / 60 ≈ 150.8 rad/s, lalu T = P / ω.',
        targetValue: 26.5,
        unit: 'N·m',
        tolerance: 0.5,
        solutionSteps: [
          'Kecepatan sudut poros: ω = 2π × 1440 / 60 = 150.796 rad/s.',
          'Torsi poros: T = 4000 W / 150.796 rad/s ≈ 26.53 N·m.',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Bagaimanakah susunan plat jumper tembaga pada blok terminal 6-baut IEC untuk membentuk koneksi Star (Y)?',
        options: [
          'Satu plat jumper horizontal menghubungkan baut W2 – U2 – V2 bersama sebagai titik netral bintang',
          'Tiga plat jumper vertikal menghubungkan pasangan (U1–W2), (V1–U2), dan (W1–V2)',
          'Enam plat jumper menghubungkan seluruh baut menjadi satu node tunggal',
          'Tanpa plat jumper sama sekali agar motor berputar bebas',
        ],
        explanation:
          'Pada koneksi Star (Y), ujung kumparan W2, U2, dan V2 dihubung singkat oleh satu bar tembaga horizontal untuk membentuk titik netral bintang, sementara kabel suplai L1–L2–L3 masuk ke U1–V1–W1.',
      },
      {
        id: 'q2',
        question:
          'Sebuah nameplate motor tertulis "230/400 V Δ/Y". Koneksi apakah yang wajib digunakan saat menyambungkan motor langsung ke suplai listrik 3-fasa 400 V?',
        options: [
          'Koneksi Star (Y), agar setiap kumparan 230 V hanya menerima 400 / √3 ≈ 230 V',
          'Koneksi Delta (Δ), agar kumparan menerima 400 V penuh untuk torsi lebih tinggi',
          'Keduanya aman digunakan bergantian tanpa memengaruhi umur isolasi',
          'Harus memakai kapasitor start 1-fasa pada terminal U1 dan V1',
        ],
        explanation:
          'Rating 230/400 V berarti tiap kumparan fasa dirancang maksimum untuk 230 V (rating Delta). Bila disambung ke jala 400 V, motor wajib dirangkai Star (Y) agar tegangan tiap kumparan turun sebesar faktor √3 menjadi 230 V.',
      },
      {
        id: 'q3',
        question:
          'Apakah perbedaan utama antara pemasangan motor tipe B5 Flange dan tipe B14 Face Flange?',
        options: [
          'B5 memakai flens besar (lebih lebar dari bodi stator) dengan lubang baut tembus, sedangkan B14 memakai flens kompak berulir internal (blind tapped)',
          'B5 dipasang menggunakan kaki baut di lantai, sedangkan B14 memakai tali sabuk gantung',
          'B5 hanya untuk motor DC sikat karbon, sedangkan B14 khusus untuk stepper',
          'B5 selalu memiliki dua poros keluar, sedangkan B14 tidak memiliki pasak poros',
        ],
        explanation:
          'Flens B5 lebih besar dari diameter rangka stator dan dibaut melalui lubang lolos (clearance holes). Sebaliknya, flens muka B14 lebih kecil daripada diameter stator dan memiliki lubang berulir metrik langsung pada tutup ujung motor.',
      },
      {
        id: 'q4',
        question:
          'Apakah tingkat proteksi yang dijamin oleh rating selungkup motor IP65?',
        options: [
          'Kedap debu total (6) dan terlindung dari semprotan air bertekanan (nozzle) dari segala arah (5)',
          'Hanya tahan tetesan air vertikal dan debu kasar berdiameter > 12 mm',
          'Boleh direndam permanen di bawah air laut kedalaman 10 meter',
          'Selungkup terbuka untuk ruangan ber-AC bersih tanpa perlindungan cipratan',
        ],
        explanation:
          'Menurut IEC 60529, angka pertama "6" berarti kedap debu total (dust-tight), dan angka kedua "5" berarti tahan terhadap semprotan pancaran air (water jets) dari segala arah.',
      },
      {
        id: 'q5',
        question:
          'Mengapa motor VFD Inverter-Duty menggunakan kipas pendingin terpisah (blower) serta bearing terisolasi listrik?',
        options: [
          'Kipas poros melemah pada kecepatan rendah di VFD, sedangkan pulsa PWM menyebabkan percikan arus EDM yang merusak alur bearing',
          'Untuk menaikkan kecepatan sinkron menjadi 6000 RPM pada frekuensi 50 Hz',
          'Agar motor induksi dapat bekerja tanpa lilitan tembaga stator',
          'Untuk mengubah suplai 3-fasa menjadi tegangan baterai DC 12 V',
        ],
        explanation:
          'Saat VFD menurunkan frekuensi ke RPM rendah, kipas standar yang terpasang di poros ikut melambat sehingga motor cepat panas. Selain itu, pensaklaran cepat PWM memicu tegangan poros frekuensi tinggi yang merusak bantalan bola (EDM fluting) jika tidak memakai bearing terisolasi.',
      },
      {
        id: 'q6',
        question:
          'Jenis motor apakah yang bergerak dalam langkah sudut diskret open-loop (umumnya 1.8° = 200 langkah/putaran) dengan torsi penahan (holding torque) tinggi saat diam?',
        options: [
          'Hybrid Stepper Motor',
          'Single-Phase Capacitor Start Motor',
          '3-Phase Squirrel-Cage TEFC Induction Motor',
          'Universal Series Wound Motor',
        ],
        explanation:
          'Motor Stepper Hibrida digerakkan oleh pulsa arus terpisah untuk melangkah tepat 1.8° per pulsa tanpa memerlukan sensor encoder eksternal pada beban normal, serta mengunci posisi dengan torsi penahan tinggi saat berhenti.',
      },
    ],
  },
  ja: {
    title: '入門ラボ：電動機の種類・銘板・スター／デルタ結線',
    shortTitle: '電動機・銘板基礎',
    description:
      '産業用電動機（三相TEFC誘導電動機、単相コンデンサ始動、インバータ専用機、BLDC、サーボ、ステッピング）の構造、取付方式（B3脚・B5フランジ・B14フェイス）、極数（2P/4P/6P）と同期回転速度、保護等級（IP54〜IP65）、6端子台スター（Y）・デルタ（Δ）結線を学ぶ入門シミュレータです。',
    explore: [
      {
        title: '同期回転速度・極数（2P/4P/6P）と誘導電動機のすべり（Slip）',
        summary:
          '三相交流誘導電動機では、電源周波数（50 Hzまたは60 Hz）と固定子の極数（2極・4極・6極）によって回転磁界の同期速度 Ns が決まります。かご形回転子は誘導電流を生じさせるため常に Ns よりわずかに遅れて回転し、この差を「すべり」と呼びます。',
        equations: [
          {
            label: '同期回転速度 (Ns)',
            formula: 'N_s = (120 · f) / p',
            note: 'f = 周波数 (Hz)、p = 極数 (2, 4, 6)。例：4極 50 Hz → (120×50)/4 = 1500 RPM。',
          },
          {
            label: 'すべり率 (s)',
            formula: 's = [(N_s - N_r) / N_s] × 100%',
            note: 'Nr = 定格負荷時の回転速度（例：4P 50Hzで1440 RPMならすべり4%）。',
          },
          {
            label: '定格出力軸トルク (T)',
            formula: 'T = P / ω = P / (2π · N_r / 60)',
            note: '4.0 kW・1440 RPM（ω=150.8 rad/s）の場合、T ≈ 26.5 N·m。',
          },
        ],
        workedExample: {
          title: '4極 50 Hz 電動機の同期速度・すべり・軸トルクの算出',
          given: [
            '三相TEFC誘導電動機 4.0 kW、4極 (4P)、50 Hz',
            '銘板記載の定格回転速度 (Nr) = 1440 RPM',
          ],
          steps: [
            '同期速度を計算：Ns = (120 × 50) / 4 = 1500 RPM。',
            '定格すべり率を計算：s = [(1500 - 1440) / 1500] × 100% = 4.0%。',
            '軸角速度を計算：ω = 2π × 1440 / 60 = 150.8 rad/s。',
            '定格出力トルク：T = 4000 W / 150.8 rad/s = 26.5 N·m。',
          ],
          answer: 'Ns = 1500 RPM、すべり = 4.0%、定格トルク = 26.5 N·m',
        },
      },
      {
        title: '端子台結線：スター（Y）結線 vs デルタ（Δ）結線と銘板電圧整合',
        summary:
          'IEC規格の三相モーター端子台には6本の端子（U1, V1, W1 および W2, U2, V2）があり、短絡バーの向きでスター結線とデルタ結線を切り替えます。230/400V定格機を400V電源で誤ってデルタ結線すると、各相巻線に過電圧が加わり焼損します。',
        equations: [
          {
            label: 'スター（Y）結線の相電圧',
            formula: 'V_phase = V_line / √3  (≈ 0.577 × V_line)',
            note: 'W2–U2–V2 を水平短絡バー1枚で結び中性点を形成。400V線間電源で各相230Vに低減。',
          },
          {
            label: 'デルタ（Δ）結線の相電圧',
            formula: 'V_phase = V_line',
            note: 'U1–W2, V1–U2, W1–V2 に垂直短絡バー3枚を接続。定格トルク100%を発揮。',
          },
        ],
        workedExample: {
          title: '400V 三相工場電源に対する 230/400V Δ/Y 電動機の結線選定',
          given: [
            '工場電源：三相 400 V（線間電圧）、50 Hz',
            'モーター銘板：230/400 V Δ/Y、14.5/8.4 A',
          ],
          steps: [
            '銘板の低い側の数値（230 V）が、1相巻線あたりの定格耐圧（デルタ運転電圧）です。',
            '供給電源は 400 V であるため、230V巻線に直接線間電圧がかかるデルタ結線は使用不可です。',
            'W2–U2–V2 を水平バーで結ぶ「スター（Y）結線」を選択します。',
            '各相印加電圧は 400 / √3 = 230.9 V となり定格内で安全に運転できます（定格電流 8.4 A）。',
          ],
          answer: 'W2–U2–V2 水平短絡によるスター（Y）結線を選定する。',
        },
      },
      {
        title: '取付方式（B3/B5/B14）・保護等級（IP54–IP65）・特殊モータ選定',
        summary:
          '電動機選定では脚取付（B3）・大フランジ取付（B5）・小径ねじ込みフェイス取付（B14）などの機械的取付互換性、IEC 60529準拠のIP防塵防水等級、およびVFDインバータ専用機・サーボ・BLDC・ステッピングなど駆動方式の違いを理解する必要があります。',
        equations: [
          {
            label: 'IP保護等級の構成（IEC 60529）',
            formula: '第1数字（防塵：5=防塵形, 6=耐塵形完全密封）｜ 第2数字（防水：4=飛沫, 5=噴流水）',
            note: 'IP55は一般工場標準、IP65は食品洗浄ラインや屋外海洋設備に必須です。',
          },
        ],
        workedExample: {
          title: '洗浄エリアの可変速コンベア用インバータ駆動モーターの選定',
          given: [
            '要求：インバータ（VFD）により 15 Hz 〜 60 Hz で連続変速',
            '環境：定期的な高圧水洗浄が行われる食品包装ライン',
          ],
          steps: [
            '低速域（15 Hz）での冷却不足とPWM電食を防ぐため、独立ファン＆絶縁軸受仕様のVFD専用機を選択。',
            '防塵完全密封・噴流防水のため保護等級 IP65 を指定。',
            'インライン減速機に直結できるよう B5 または B14 フランジ取付を選択。',
          ],
          answer: 'IP65保護等級・B5/B14取付のVFDインバータ専用電動機を選定。',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '50 Hz の三相電源で運転される 4極（4P）AC誘導電動機の同期回転速度 Ns（RPM）を計算してください。',
        hint: 'Ns = (120 × f) / p に f = 50 Hz、p = 4 を代入します。',
        targetValue: 1500,
        unit: 'RPM',
        tolerance: 5,
        solutionSteps: [
          '同期速度公式：Ns = (120 × f) / p。',
          'Ns = (120 × 50) / 4 = 1500 RPM。',
        ],
      },
      {
        id: 'p2',
        prompt:
          '60 Hz 電源で運転される高速 2極（2P）誘導電動機の同期回転速度 Ns（RPM）を計算してください。',
        hint: 'Ns = (120 × 60) / 2 を計算します。',
        targetValue: 3600,
        unit: 'RPM',
        tolerance: 10,
        solutionSteps: [
          '同期速度公式：Ns = (120 × f) / p。',
          'Ns = (120 × 60) / 2 = 3600 RPM。',
        ],
      },
      {
        id: 'p3',
        prompt:
          '4極 50 Hz（Ns = 1500 RPM）の誘導電動機が定格負荷時に 1440 RPM で回転しているとき、すべり率（%）はいくつですか？',
        hint: 's = [(Ns - Nr) / Ns] × 100% を使用します。',
        targetValue: 4,
        unit: '%',
        tolerance: 0.2,
        solutionSteps: [
          '回転差：1500 - 1440 = 60 RPM。',
          'すべり率：(60 / 1500) × 100% = 4.0%。',
        ],
      },
      {
        id: 'p4',
        prompt:
          '三相 400 V 電源に対してモーターをスター（Y）結線した場合、各相巻線に加わる相電圧（V）はおよそいくつですか（整数値）？',
        hint: 'スター結線では V_phase = V_line / √3 ≈ 400 / 1.732 となります。',
        targetValue: 231,
        unit: 'V',
        tolerance: 2,
        solutionSteps: [
          'スター結線では線間電圧が 1/√3 倍に分圧されます。',
          'V_phase = 400 / 1.73205 ≈ 230.9 V（約 231 V）。',
        ],
      },
      {
        id: 'p5',
        prompt:
          '定格出力 4.0 kW（4000 W）、定格回転速度 1440 RPM で運転される電動機の定格軸トルク（N·m）を計算してください。',
        hint: 'ω = 2π × 1440 / 60 ≈ 150.8 rad/s より、T = P / ω を求めます。',
        targetValue: 26.5,
        unit: 'N·m',
        tolerance: 0.5,
        solutionSteps: [
          '角速度：ω = 2π × 1440 / 60 = 150.796 rad/s。',
          '軸トルク：T = 4000 / 150.796 ≈ 26.53 N·m。',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'IEC 6端子台でスター（Y）結線を構成するための銅短絡バーの正しい配置はどれですか？',
        options: [
          '上段の W2 – U2 – V2 を1枚の水平バーで短絡し、中性点を形成する',
          '3枚の垂直バーで (U1–W2), (V1–U2), (W1–V2) をそれぞれ縦に接続する',
          '6本すべての端子を1枚のプレートで一括短絡する',
          '短絡バーをすべて取り外した解放状態にする',
        ],
        explanation:
          'スター結線では上段の W2・U2・V2 を水平バー1枚で接続して中性点（スター点）を作り、下段の U1・V1・W1 に三相電源 L1・L2・L3 を接続します。',
      },
      {
        id: 'q2',
        question:
          '銘板に「230/400 V Δ/Y」と記載された電動機を三相 400 V 電源に直結する場合、どの結線にする必要がありますか？',
        options: [
          'スター（Y）結線（各230V巻線に 400 / √3 ≈ 230 V を印加するため）',
          'デルタ（Δ）結線（各巻線に 400 V 全電圧を加えて高トルクを得るため）',
          'どちらの結線でも定格電流・絶縁耐圧への影響はない',
          'U1 と V1 の間に単相始動コンデンサを直列挿入する',
        ],
        explanation:
          '230/400V 機は1巻線あたりの耐圧が230Vです。400V電源に接続する場合は必ずスター（Y）結線とし、各相印加電圧を 1/√3（約230V）へ下げる必要があります。',
      },
      {
        id: 'q3',
        question:
          'IEC取付方式「B5 フランジ」と「B14 フェイス（小フランジ）」の主な構造上の違いは何ですか？',
        options: [
          'B5 は外径がフレームより大きい貫通ボルト穴フランジ、B14 は小径で端面にめねじタップを持つフランジである',
          'B5 は床置きの脚取付、B14 はベルト掛け用天井吊り取付である',
          'B5 はブラシ付きDC機専用、B14 はステッピングモータ専用である',
          'B5 は両軸仕様、B14 はキー溝なし丸軸仕様を意味する',
        ],
        explanation:
          'B5は大径フランジに貫通穴（通しボルト用）が設けられており、B14は固定子外径より小さいフランジ端面にメートルめねじ（止まり穴タップ）が加工されています。',
      },
      {
        id: 'q4',
        question:
          '保護等級「IP65」が保証する防塵・防水性能として正しいものはどれですか？',
        options: [
          '粉塵の侵入を完全に防ぐ耐塵形（6）かつ、あらゆる方向からの噴流水に耐える（5）',
          '垂直落下する水滴と直径12 mm以上の固形物のみ保護する',
          '水深10 mの海水中に常時水没させて運転できる',
          '空調管理されたクリーンルーム専用の開放保護構造である',
        ],
        explanation:
          'IEC 60529 において、第1数字「6」は完全防塵（Dust-tight）、第2数字「5」はノズルからの噴流水に対する保護（Water jets）を意味します。',
      },
      {
        id: 'q5',
        question:
          'VFD（インバータ）専用AC電動機が強制空冷ブロワや絶縁ベアリングを備える理由は何ですか？',
        options: [
          '低周波数運転時に軸直結ファンの冷却能力が低下するため、またPWM高周波軸電圧によるベアリング電食（フルーティング）を防ぐため',
          '50 Hz 電源で同期速度を 6000 RPM に引き上げるため',
          '固定子の銅巻線なしで誘導回転させるため',
          '三相交流を12 V 直流バッテリー電圧へ変換するため',
        ],
        explanation:
          '低速域では軸付ファンの風量が激減するため別電源の強制冷却ブロワが有効です。またインバータの高速PWMスイッチングにより軸電流（EDM電食）が生じるため、絶縁軸受が採用されます。',
      },
      {
        id: 'q6',
        question:
          'パルス入力ごとに離散角度（通常 1.8°＝1回転200ステップ）でオープンループ位置決めし、停止時に高い保持トルクを発揮するモーターはどれですか？',
        options: [
          'ハイブリッド・ステッピングモーター',
          '単相コンデンサ始動誘導電動機',
          '三相かご形 TEFC 誘導電動機',
          '直巻整流子電動機',
        ],
        explanation:
          'ハイブリッド・ステッピングモーターは定電流チョッパ駆動のパルス信号に応じて1.8°ずつ高精度にステップ回転し、停止中は励磁電流により強い静止保持トルク（ホールディングトルク）を生じます。',
      },
    ],
  },
});
