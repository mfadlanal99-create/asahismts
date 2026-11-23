import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('vfd-drive', {
  id: {
    title: 'Lab Kendali Motor 3-Fasa & VFD (Inverter)',
    shortTitle: 'Motor 3-Fasa & VFD',
    description:
      'Laboratorium interaktif motor induksi 3-fasa dan Penggerak Frekuensi Variabel (VFD) yang membandingkan starter DOL, Star-Delta (Y-Δ), dan VFD, kendali rasio V/f serta pelemahan medan di atas frekuensi dasar, kurva torsi–kecepatan, dinamika bus DC, dan diagnosis gangguan industri.',
    explore: [
      {
        title: '1. Perbandingan Starter: DOL vs Star-Delta (Y-Δ) vs Inverter VFD',
        summary:
          'Pengasutan Direct-On-Line (DOL) menyambungkan tegangan jala penuh secara langsung sehingga menimbulkan lonjakan arus awal (inrush current) 6×–7× arus nominal dan hentakan mekanis tinggi. Starter Star-Delta (Y-Δ) menurunkan arus dan torsi awal menjadi sepertiga selama tahap Bintang sebelum berpindah ke Delta. Sementara itu, VFD menaikkan frekuensi dan tegangan secara bertahap dari 0 Hz sehingga menghasilkan torsi penuh dengan arus awal ≤1,3× arus nominal.',
        equations: [
          {
            label: 'Rasio Arus & Torsi Awal Star-Delta',
            formula: 'I_start(Y) = (1/3) · I_start(Δ),   T_start(Y) = (1/3) · T_start(Δ)',
            note: 'Tegangan kumparan turun sebesar 1/√3 pada hubungan Bintang, sehingga arus saluran dan torsi turun sebesar (1/√3)² = 1/3.',
          },
          {
            label: 'Laju Rampa Frekuensi VFD (Hz/s)',
            formula: 'df/dt = f_dasar / t_akselerasi',
            note: 'Contoh: 50 Hz dengan waktu akselerasi 8 detik menghasilkan laju rampa 6,25 Hz/detik.',
          },
        ],
        workedExample: {
          title: 'Perbandingan Arus Lonjakan Awal pada Motor 7,5 kW, 400 V',
          given: [
            'Arus beban penuh nominal I_nominal = 14,3 A',
            'Faktor arus rotor terkunci DOL = 6,5 × I_nominal',
          ],
          steps: [
            'Puncak arus awal DOL: I_DOL = 6,5 × 14,3 A = 93,0 A.',
            'Arus awal Star-Delta (tahap Star): I_Y = 93,0 A / 3 = 31,0 A.',
            'Pengasutan terkendali VFD pada 1,25 × I_nominal: I_VFD = 1,25 × 14,3 A = 17,9 A.',
          ],
          answer: 'DOL = 93,0 A | Star-Delta = 31,0 A | VFD = 17,9 A',
        },
      },
      {
        title: '2. Kendali V/f Konstan, Pelemahan Medan & Kurva Torsi–Kecepatan',
        summary:
          'Untuk menjaga fluks magnetik celah udara tetap konstan (Φ ∝ V / f), VFD menskalakan tegangan keluaran secara proporsional terhadap frekuensi hingga mencapai frekuensi dasar (50 Hz atau 60 Hz). Di atas frekuensi dasar, tegangan tertahan pada tegangan jala nominal (400 V) sehingga motor memasuki daerah Pelemahan Medan (Field Weakening), di mana fluks turun sebesar f_dasar / f dan torsi maksimum turun sebesar (f_dasar / f)².',
        equations: [
          {
            label: 'Rasio V/f Konstan (f ≤ f_dasar)',
            formula: 'V_out = V_nominal · (f / f_dasar)   [Daerah Torsi Konstan]',
            note: 'Untuk 400 V / 50 Hz = 8,0 V/Hz. Pada frekuensi 25 Hz, V_out ≈ 200 V.',
          },
          {
            label: 'Torsi Maksimum pada Pelemahan Medan (f > f_dasar)',
            formula: 'T_bk(f) = T_bk(dasar) · (f_dasar / f)²',
            note: 'Pada 75 Hz untuk motor 50 Hz, torsi maksimum turun menjadi (50/75)² = 44,4% dari nilai dasar.',
          },
        ],
        workedExample: {
          title: 'Menghitung Kecepatan, Slip & Tegangan pada Frekuensi 35 Hz',
          given: [
            'Motor induksi 4 Kutub (4P), frekuensi dasar 50 Hz, 400 V',
            'Frekuensi target VFD f = 35 Hz, slip operasi s = 4,0%',
          ],
          steps: [
            'Kecepatan sinkron: Ns = (120 × 35) / 4 = 1050 RPM.',
            'Kecepatan poros rotor: Nr = 1050 × (1 - 0,04) = 1008 RPM.',
            'Tegangan keluaran V/f: V_out = 400 × (35 / 50) = 280 V.',
          ],
          answer: 'Ns = 1050 RPM, Nr = 1008 RPM, V_out = 280 V',
        },
      },
      {
        title: '3. Dinamika Bus DC, Tegangan Lebih Deselerasi & Fluting Bantalan EDM',
        summary:
          'Penyearah 3-fasa 400 V mengisi kapasitor bus DC VFD hingga V_dc ≈ √2 × 400 V ≈ 565 V. Saat deselerasi terlalu cepat, inersia beban mengubah motor menjadi generator yang mengalirkan energi regeneratif kembali ke bus DC; tanpa resistor pengereman, V_dc melonjak melewati ~800 V dan memicu trip Tegangan Lebih (OV). Selain itu, frekuensi pembawa PWM IGBT yang tinggi menginduksi arus poros (EDM) yang merusak bantalan motor.',
        equations: [
          {
            label: 'Tegangan Bus DC Nominal Tanpa Beban',
            formula: 'V_dc = √2 · V_jala,rms ≈ 1,414 × 400 V = 566 V',
            note: 'Hilang fasa masukan menyebabkan riak tegangan bus DC tinggi (>80 Vpp) dan pemanasan berlebih kapasitor.',
          },
          {
            label: 'Ambang Trip Tegangan Lebih Bus DC (Kelas 400 V)',
            formula: 'V_dc,trip ≈ 800 V DC',
            note: 'Cegah trip OV dengan memperpanjang waktu deselerasi atau memasang unit pengereman dinamis (braking resistor).',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'vfd-p1',
        prompt:
          'Sebuah motor induksi 4 kutub digerakkan oleh VFD pada frekuensi 30 Hz. Hitung kecepatan medan magnet sinkronnya (RPM).',
        hint: 'Gunakan rumus Ns = (120 × f) / p dengan f = 30 Hz dan p = 4.',
        solutionSteps: [
          'Terapkan rumus kecepatan sinkron: Ns = (120 × f) / p.',
          'Ns = (120 × 30) / 4 = 3600 / 4 = 900 RPM.',
        ],
      },
      {
        id: 'vfd-p2',
        prompt:
          'Sebuah VFD 400 V / 50 Hz beroperasi pada daerah V/f konstan di frekuensi 25 Hz (abaikan boost tegangan rendah). Berapa tegangan keluaran (V) yang disuplai?',
        hint: 'V_out = V_nominal × (f / f_dasar) = 400 × (25 / 50).',
        solutionSteps: [
          'Rasio V/f konstan = 400 V / 50 Hz = 8,0 V/Hz.',
          'Pada 25 Hz: V_out = 8,0 × 25 = 200 V.',
        ],
      },
      {
        id: 'vfd-p3',
        prompt:
          'Suplai AC 3-fasa 400 V masuk ke penyearah dioda 6-pulsa VFD. Hitung tegangan nominal bus DC tanpa beban V_dc (V).',
        hint: 'V_dc = √2 × V_jala,rms ≈ 1,414 × 400 V.',
        solutionSteps: [
          'Tegangan puncak antar-fasa mengisi kapasitor bus DC: V_dc = √2 × V_jala.',
          'V_dc = 1,4142 × 400 V ≈ 565,7 V (≈ 566 V).',
        ],
      },
      {
        id: 'vfd-p4',
        prompt:
          'Sebuah motor 4 kutub memiliki arus lonjakan awal DOL sebesar 90 A. Jika diasut menggunakan starter Star-Delta (Y-Δ), berapa arus awal pada tahap Star (A)?',
        hint: 'Starter Star-Delta menurunkan arus awal menjadi 1/3 dari arus DOL.',
        solutionSteps: [
          'Pada hubungan Star, tegangan kumparan menjadi 1/√3 tegangan jala sehingga arus saluran menjadi 1/3 dari Delta/DOL.',
          'I_star = 90 A / 3 = 30 A.',
        ],
      },
      {
        id: 'vfd-p5',
        prompt:
          'Motor 50 Hz dijalankan hingga 75 Hz di daerah pelemahan medan (field weakening) VFD. Berapa persen (%) torsi maksimum (breakdown torque) yang tersisa dibanding kondisi dasar?',
        hint: 'Torsi maksimum turun sebanding dengan (f_dasar / f)² × 100%.',
        solutionSteps: [
          'Di daerah pelemahan medan (f > f_dasar), fluks turun sebesar f_dasar / f dan torsi maksimum turun sebesar (f_dasar / f)².',
          '(50 / 75)² × 100% = (0,6667)² × 100% ≈ 44,4%.',
        ],
      },
    ],
    quiz: [
      {
        id: 'vfd-q1',
        question:
          'Mengapa VFD menjaga rasio V/f tetap konstan antara 0 Hz hingga frekuensi dasar (50 Hz)?',
        options: [
          'Untuk menjaga fluks magnetik celah udara stator tetap konstan sehingga motor menghasilkan torsi penuh tanpa saturasi inti',
          'Untuk menggandakan tegangan bus DC di atas 1000 V saat putaran rendah',
          'Untuk menghilangkan slip rotor sepenuhnya agar motor berputar sinkron',
          'Untuk mengubah motor 3-fasa menjadi motor kapasitor 1-fasa',
        ],
        explanation:
          'Fluks magnetik Φ berbanding lurus dengan V/f. Menjaga rasio V/f konstan mempertahankan fluks nominal dan kemampuan torsi penuh hingga frekuensi dasar.',
      },
      {
        id: 'vfd-q2',
        question:
          'Apa penyebab VFD mengalami trip Tegangan Lebih Bus DC (OV) ketika waktu deselerasi diatur sangat singkat (mis. 0,5 detik) pada kipas berinersia tinggi?',
        options: [
          'Energi pengereman regeneratif dari beban berputar mengalir balik melalui dioda inverter dan mengisi kapasitor bus DC melewati ~800 V',
          'Frekuensi listrik jala-jala tiba-tiba melonjak dari 50 Hz menjadi 100 Hz',
          'Bantalan poros motor macet secara mekanis dan menghubsingsingkatkan bus DC',
          'Frekuensi pembawa IGBT turun menjadi nol saat deselerasi',
        ],
        explanation:
          'Ketika VFD memperlambat medan stator lebih cepat daripada perlambatan rotor berinersia tinggi, slip menjadi negatif dan motor bekerja sebagai generator induksi yang memompa energi ke bus DC.',
      },
      {
        id: 'vfd-q3',
        question:
          'Bagaimana perbandingan kinerja starter Star-Delta (Y-Δ) terhadap Direct-On-Line (DOL) selama tahap pengasutan awal?',
        options: [
          'Menurunkan arus awal dan torsi awal masing-masing menjadi 1/3 (33%) dari nilai DOL',
          'Menurunkan arus awal menjadi 1/3 sambil menggandakan torsi awal',
          'Memberikan pengaturan kecepatan halus dari 0 Hz hingga 80 Hz',
          'Menghilangkan sepenuhnya lonjakan transien saat berpindah ke Delta',
        ],
        explanation:
          'Pada hubungan Bintang (Star), setiap kumparan fasa menerima V_jala / √3, sehingga arus fasa turun 1/√3 dan arus saluran serta torsi turun sebesar (1/√3)² = 1/3.',
      },
      {
        id: 'vfd-q4',
        question:
          'Apa yang terjadi pada kinerja motor saat VFD beroperasi di atas frekuensi dasar (mis. 65–80 Hz) di daerah Pelemahan Medan?',
        options: [
          'Tegangan keluaran tertahan pada tegangan nominal (400 V), fluks magnetik melemah, dan torsi yang tersedia menurun seiring kenaikan kecepatan',
          'Tegangan keluaran naik linier hingga 640 V untuk menjaga V/f konstan',
          'Arus motor turun menjadi nol karena slip menjadi nol',
          'Kecepatan sinkron tetap terkunci di 1500 RPM tanpa terpengaruh frekuensi',
        ],
        explanation:
          'Karena VFD tidak dapat mengeluarkan tegangan melebihi batas bus DC (400 V), rasio V/f turun di atas 50 Hz sehingga fluks melemah dan kemampuan torsi berkurang.',
      },
      {
        id: 'vfd-q5',
        question:
          'Gejala gangguan manakah yang menandakan Hilang Fasa Masukan (Single-Phasing) pada penyearah VFD 3-fasa?',
        options: [
          'Riak tegangan bus DC tinggi (>80 Vpp), arus masukan meningkat pada dua fasa tersisa, dan terjadi pulsasi torsi',
          'Tegangan nol pada ketiga fasa keluaran saat motor berputar 3000 RPM',
          'Tegangan bus DC naik terus di atas 850 V saat motor berhenti',
          'Frekuensi pembawa otomatis meningkat dari 4 kHz menjadi 16 kHz',
        ],
        explanation:
          'Kehilangan satu fasa masukan memaksa penyearah 6-pulsa bekerja seperti penyearah 1-fasa, menimbulkan riak bus DC yang parah, beban berlebih pada kapasitor, dan arus lebih pada dua fasa lainnya.',
      },
      {
        id: 'vfd-q6',
        question:
          'Apa penyebab keausan beralur pada bantalan (bearing fluting) di motor berpenggerak VFD, dan bagaimana cara mengatasinya?',
        options: [
          'Tegangan mode-umum PWM berfrekuensi tinggi menginduksi arus poros EDM menembus lapisan oli bantalan; diatasi dengan sikat pentanahan poros dan bantalan terisolasi',
          'Operasi frekuensi rendah di bawah 10 Hz membekukan gemuk bantalan',
          'Kontaktor Star-Delta menempel saat operasi normal',
          'Penggunaan motor 2 kutub sebagai pengganti motor 4 kutub pada jala 50 Hz',
        ],
        explanation:
          'Peralihan dv/dt IGBT yang sangat cepat menciptakan tegangan poros mode-umum yang melepaskan muatan melalui lintasan bantalan (Electrical Discharge Machining / EDM). Cincin pentanahan poros dan bantalan NDE terisolasi mencegah kerusakan ini.',
      },
    ],
  },
  ja: {
    title: '三相電動機・VFD（インバータ）制御ラボ',
    shortTitle: '三相電動機 & VFD',
    description:
      '直入始動（DOL）・スターデルタ始動（Y-Δ）・VFDインバータ始動の比較、基底周波数以上の界磁弱め制御（V/f一定制御）、トルク–速度曲線、DCバス電圧変動、および産業用故障診断を学べるインタラクティブラボです。',
    explore: [
      {
        title: '1. 始動方式の比較：DOL vs スターデルタ（Y-Δ）vs VFDインバータ',
        summary:
          '直入始動（DOL）は定格電圧を瞬時に印加するため、定格電流の6〜7倍の突入電流と大きな機械的衝撃が発生します。スターデルタ（Y-Δ）始動はスター結線時に始動電流と始動トルクを1/3に低減し、その後デルタ結線へ切り替えます。VFD（インバータ）は0 Hzから周波数と電圧を滑らかに上昇させ、定格電流の1.3倍以下で定格トルクを発生させます。',
        equations: [
          {
            label: 'スターデルタ始動の電流・トルク比',
            formula: 'I_start(Y) = (1/3) · I_start(Δ),   T_start(Y) = (1/3) · T_start(Δ)',
            note: 'スター結線では相電圧が1/√3となるため、線電流とトルクは(1/√3)² = 1/3になります。',
          },
          {
            label: 'VFD加速ランプレート（Hz/s）',
            formula: 'df/dt = f_base / t_accel',
            note: '例：基底周波数50 Hzを加速時間8秒で立ち上げる場合、6.25 Hz/sとなります。',
          },
        ],
        workedExample: {
          title: '7.5 kW・400 V電動機における始動突入電流の比較',
          given: [
            '定格負荷電流 I_rated = 14.3 A',
            'DOL拘束電流倍率 = 6.5 × I_rated',
          ],
          steps: [
            'DOL始動ピーク電流：I_DOL = 6.5 × 14.3 A = 93.0 A。',
            'スターデルタ始動（スター段階）：I_Y = 93.0 A / 3 = 31.0 A。',
            'VFD制御始動（1.25 × I_rated）：I_VFD = 1.25 × 14.3 A = 17.9 A。',
          ],
          answer: 'DOL = 93.0 A | スターデルタ = 31.0 A | VFD = 17.9 A',
        },
      },
      {
        title: '2. V/f一定制御・界磁弱め制御・トルク–速度曲線',
        summary:
          '空隙磁束を一定（Φ ∝ V / f）に保つため、VFDは基底周波数（50 Hzまたは60 Hz）まで周波数に比例して出力電圧を上昇させます。基底周波数を超えると出力電圧は電源定格電圧（400 V）で頭打ちとなり、界磁弱め領域に入って磁束はf_base / fに、停動トルクは(f_base / f)²に比例して低下します。',
        equations: [
          {
            label: 'V/f一定制御（f ≤ f_base）',
            formula: 'V_out = V_rated · (f / f_base)   [定トルク領域]',
            note: '400 V / 50 Hz = 8.0 V/Hz。25 Hz運転時の出力電圧は約200 Vです。',
          },
          {
            label: '界磁弱め領域の停動トルク（f > f_base）',
            formula: 'T_bk(f) = T_bk(base) · (f_base / f)²',
            note: '50 Hz電動機を75 Hzで運転すると、停動トルクは(50/75)² = 44.4%に低下します。',
          },
        ],
        workedExample: {
          title: '35 Hz運転時の同期速度・滑り・出力電圧の計算',
          given: [
            '4極（4P）誘導電動機、基底50 Hz、400 V',
            'VFD指令周波数 f = 35 Hz、運転滑り s = 4.0%',
          ],
          steps: [
            '同期速度：Ns = (120 × 35) / 4 = 1050 RPM。',
            '回転子速度：Nr = 1050 × (1 - 0.04) = 1008 RPM。',
            'V/f出力電圧：V_out = 400 × (35 / 50) = 280 V。',
          ],
          answer: 'Ns = 1050 RPM, Nr = 1008 RPM, V_out = 280 V',
        },
      },
      {
        title: '3. DCバス電圧挙動・急減速過電圧・軸電流電食（フルーティング）',
        summary:
          '400 V三相整流器はVFDのDCバスをV_dc ≈ √2 × 400 V ≈ 565 Vに充電します。急減速時には負荷慣性により電動機が発電機として動作し、回生エネルギーがDCバスコンデンサへ逆流します。制動抵抗がない場合、V_dcが約800 Vを超えて過電圧トリップ（OV）が発生します。また、高いPWMキャリア周波数はコモンモード軸電圧を誘起し、軸受の電食（フルーティング）を引き起こします。',
        equations: [
          {
            label: '無負荷時の定格DCバス電圧',
            formula: 'V_dc = √2 · V_line,rms ≈ 1.414 × 400 V = 566 V',
            note: '入力欠相が発生するとDCバスリップルが急増（>80 Vpp）し、コンデンサが過熱します。',
          },
          {
            label: '過電圧トリップ閾値（400 Vクラス）',
            formula: 'V_dc,trip ≈ 800 V DC',
            note: '減速時間を延ばすか、回生制動チョッパ＋制動抵抗を追加してOVトリップを防止します。',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'vfd-p1',
        prompt:
          '4極誘導電動機をVFDで30 Hz駆動しています。固定子磁界の同期速度（RPM）を計算してください。',
        hint: 'f = 30 Hz、p = 4 として Ns = (120 × f) / p を用います。',
        solutionSteps: [
          '同期速度の式を適用：Ns = (120 × f) / p。',
          'Ns = (120 × 30) / 4 = 3600 / 4 = 900 RPM。',
        ],
      },
      {
        id: 'vfd-p2',
        prompt:
          '400 V / 50 HzのVFDがV/f一定領域の25 Hzで運転しています（低速電圧ブーストは無視）。出力電圧（V）はいくらですか？',
        hint: 'V_out = V_rated × (f / f_base) = 400 × (25 / 50)。',
        solutionSteps: [
          'V/f一定比 = 400 V / 50 Hz = 8.0 V/Hz。',
          '25 Hz時：V_out = 8.0 × 25 = 200 V。',
        ],
      },
      {
        id: 'vfd-p3',
        prompt:
          '三相400 V AC電源がVFDの6パルスダイオード整流器に接続されています。無負荷時の定格DCバス電圧 V_dc（V）を計算してください。',
        hint: 'V_dc = √2 × V_line,rms ≈ 1.414 × 400 V。',
        solutionSteps: [
          '線間ピーク電圧がDCバスコンデンサを充電：V_dc = √2 × V_line。',
          'V_dc = 1.4142 × 400 V ≈ 565.7 V（約 566 V）。',
        ],
      },
      {
        id: 'vfd-p4',
        prompt:
          'DOL始動時の突入電流が90 Aの4極電動機をスターデルタ（Y-Δ）始動器で始動する場合、スター段階の初期始動電流（A）はいくらですか？',
        hint: 'スターデルタ始動は始動電流をDOLの1/3に低減します。',
        solutionSteps: [
          'スター結線では相電圧が1/√3になり、線電流はデルタ/DOLの1/3になります。',
          'I_star = 90 A / 3 = 30 A。',
        ],
      },
      {
        id: 'vfd-p5',
        prompt:
          '50 Hz定格電動機をVFDの界磁弱め領域である75 Hzまで加速しました。基底周波数時と比較して停動トルクは何％（%）残っていますか？',
        hint: '停動トルクは (f_base / f)² × 100% に比例します。',
        solutionSteps: [
          '界磁弱め領域（f > f_base）では磁束が f_base / f に低下し、停動トルクは (f_base / f)² に比例します。',
          '(50 / 75)² × 100% = (0.6667)² × 100% ≈ 44.4%。',
        ],
      },
    ],
    quiz: [
      {
        id: 'vfd-q1',
        question:
          'VFDが0 Hzから基底周波数（50 Hz）までV/f比を一定に保つ理由は何ですか？',
        options: [
          '固定子空隙磁束を一定に保ち、鉄心飽和を起こさずに定格トルクを発生させるため',
          '低速運転時にDCバス電圧を1000 V以上へ倍増させるため',
          '回転子の滑りを完全にゼロにして同期運転させるため',
          '三相電動機を単相コンデンサ始動電動機へ変換するため',
        ],
        explanation:
          '磁束 Φ は V/f に比例します。V/fを一定に保つことで、基底周波数までの全速度域で定格磁束と最大トルク能力を維持できます。',
      },
      {
        id: 'vfd-q2',
        question:
          '高慣性ファンを非常に短い減速時間（例：0.5秒）で停止させた際、VFDがDCバス過電圧（OV）トリップする原因は何ですか？',
        options: [
          '回転する負荷の回生制動エネルギーがインバータダイオードを通じて逆流し、DCバスコンデンサを約800 V以上に充電するため',
          '入力AC電源周波数が50 Hzから100 Hzへ急変するため',
          '電動機軸受が機械的に焼き付いてDCバスを短絡するため',
          '減速中にIGBTキャリア周波数がゼロに低下するため',
        ],
        explanation:
          '負荷の慣性より速く固定子磁界を減速させると滑りが負になり、電動機が誘導発電機として動作してDCバスへ電力を送り込みます。',
      },
      {
        id: 'vfd-q3',
        question:
          'スターデルタ（Y-Δ）始動器は、始動初期段階において直入始動（DOL）と比較してどのような特性を持ちますか？',
        options: [
          '始動電流と始動トルクの両方をDOLの1/3（33%）に低減する',
          '始動電流を1/3に低減しつつ、始動トルクを2倍に増加させる',
          '0 Hzから80 Hzまで無段階の速度制御を行う',
          'デルタ結線への切替時の過渡サージを完全にゼロにする',
        ],
        explanation:
          'スター結線では各相巻線に V_line / √3 が印加されるため、相電流は1/√3となり、線電流およびトルクは (1/√3)² = 1/3 になります。',
      },
      {
        id: 'vfd-q4',
        question:
          'VFDが基底周波数を超える界磁弱め領域（例：65〜80 Hz）で運転する場合、電動機性能はどう変化しますか？',
        options: [
          '出力電圧は定格電圧（400 V）でクランプされ、磁束が弱まり、速度上昇に伴い発生可能トルクが低下する',
          'V/f一定を保つため出力電圧が640 Vまで線形に上昇する',
          '滑りがゼロになるため電動機電流がゼロになる',
          '周波数に関わらず同期速度は1500 RPMに固定される',
        ],
        explanation:
          'VFDはDCバス電圧から作れる定格電圧（400 V）以上を出力できないため、50 Hz以上ではV/fが低下し、磁束弱めによりトルク能力が低下します。',
      },
      {
        id: 'vfd-q5',
        question:
          '三相VFD整流器の入力欠相（シングルフェージング）を示す故障兆候はどれですか？',
        options: [
          'DCバス電圧リップルの増大（>80 Vpp）、残り2相の入力電流上昇、およびトルク脈動',
          '電動機が3000 RPMで回転中に全3相の出力電圧がゼロになる',
          '停止中にDCバス電圧が850 V以上へ連続上昇する',
          'キャリア周波数が4 kHzから16 kHzへ自動上昇する',
        ],
        explanation:
          '入力1相が欠相すると6パルス整流器が単相整流と同等になり、DCバスリップル増大・コンデンサ過熱・残り2相の過電流が発生します。',
      },
      {
        id: 'vfd-q6',
        question:
          'VFD駆動電動機の軸受フルーティング（波状電食痕）の原因と対策はどれですか？',
        options: [
          '高周波PWMコモンモード電圧が軸受油膜を通してEDM軸電流を誘起する；軸接地ブラシと絶縁軸受で対策する',
          '10 Hz以下の低速運転で軸受グリースが凍結する',
          '通常運転中にスターデルタコンタクタが溶着する',
          '50 Hz電源で4極機の代わりに2極機を使用する',
        ],
        explanation:
          '高速なIGBTのdv/dtスイッチングによりコモンモード軸電圧が発生し、軸受軌道面で放電加工（EDM）が生じます。軸接地リングと反負荷側（NDE）絶縁軸受が有効な対策です。',
      },
    ],
  },
});
