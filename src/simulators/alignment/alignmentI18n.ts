import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('alignment', {
  id: {
    title: 'Simulator Dial Gauge & Penyelarasan Poros',
    shortTitle: 'Penyelarasan Poros',
    description:
      'Diagnosis offset paralel dan ketidaksejajaran sudut menggunakan dial indicator rim-and-face, kompensasi lenturan batang (bar sag), serta hitung shim kaki motor.',
    explore: [
      {
        title: 'Metode Dial Indicator Rim & Face',
        summary:
          'Pada metode Rim-and-Face, satu dial indicator menyentuh keliling hub kopling (Rim) untuk mengukur offset paralel, sedangkan indicator kedua menyentuh muka kopling (Face) untuk mengukur kemiringan sudut. Kedua poros diputar bersama melalui 0° (Atas), 90° (Kanan), 180° (Bawah), dan 270° (Kiri) setelah dinolkan di pukul 12.',
        equations: [
          {
            label: 'Offset Paralel (Vertikal)',
            formula: 'y_c = -(R_B - R_T) / 2',
            note: 'Total Indicator Reading (TIR) pada rim sama dengan dua kali offset garis sumbu.',
          },
          {
            label: 'Offset Paralel (Horizontal)',
            formula: 'x_c = (R_R - R_L) / 2',
            note: 'Diukur antara pukul 3 (R) dan pukul 9 (L).',
          },
          {
            label: 'Angularitas (Kemiringan)',
            formula: 'θ_v = (F_B - F_T) / D',
            note: 'TIR Face dibagi diameter sapuan indicator D (rad atau mm/mm).',
          },
        ],
        workedExample: {
          title: 'Menghitung Offset dan Angularitas Kopling',
          given: [
            'Diameter sapuan kopling D = 150 mm',
            'Pembacaan Rim terkompensasi: T = 0.00 mm, B = +0.50 mm',
            'Pembacaan Face: T = 0.00 mm, B = +0.18 mm',
          ],
          steps: [
            'Offset vertikal di kopling: y_c = -(0.50 - 0.00) / 2 = -0.25 mm (motor lebih rendah 0.25 mm).',
            'Kemiringan sudut vertikal: θ_v = (0.18 - 0.00) / 150 = +0.0012 rad.',
            'Nyatakan angularitas per 100 mm: 0.0012 × 100 = 0.12 mm / 100 mm.',
          ],
          answer:
            'Motor lebih rendah 0.25 mm di kopling dengan kemiringan naik +0.12 mm/100 mm.',
        },
      },
      {
        title: 'Sag Batang & Aturan Validitas (T + B = L + R)',
        summary:
          'Gravitasi melengkungkan braket dudukan indicator ke bawah saat poros berputar, membuat pembacaan rim pukul 6 (Bawah) bernilai negatif semu. Mengukur sag batang pada mandrel kaku sebelumnya memungkinkan Anda menguranginya dari pembacaan mentah. Sebelum mempercayai data dial, periksa identitas matematis T + B = L + R.',
        equations: [
          {
            label: 'Aturan Validitas',
            formula: 'T + B = L + R',
            note: 'Jika | (T + B) - (L + R) | melebihi 0.02 mm, curigai braket bergeser, baut longgar, atau kaki tidak rata (soft foot).',
          },
          {
            label: 'Pembacaan Bawah Terkompensasi Sag',
            formula: 'R_B,comp = R_B,raw + S_sag',
            note: 'Di mana S_sag > 0 adalah TIR sag ke bawah terukur di pukul 6.',
          },
        ],
        workedExample: {
          title: 'Mengkompensasi Set Rim Mentah',
          given: [
            'Sag braket terukur S_sag = 0.08 mm',
            'Pembacaan Rim mentah: T = 0.00 mm, R = -0.14 mm, B = -0.28 mm, L = -0.14 mm',
          ],
          steps: [
            'Periksa validitas mentah: T + B = -0.28 mm; L + R = -0.28 mm (valid!).',
            'Tambahkan sag penuh ke Bawah: B_comp = -0.28 + 0.08 = -0.20 mm.',
            'Tambahkan setengah sag ke Kiri & Kanan: L_comp = R_comp = -0.14 + 0.04 = -0.10 mm.',
            'Offset vertikal sebenarnya: y_c = -(-0.20) / 2 = +0.10 mm (motor lebih tinggi 0.10 mm).',
          ],
          answer:
            'Offset vertikal sebenarnya adalah +0.10 mm (lupa sag akan melebihkan pembacaan sebesar 0.04 mm).',
        },
      },
      {
        title: 'Rumus Shim Kaki & Pergeseran Horizontal',
        summary:
          'Setelah offset dan angularitas kopling diketahui, proyeksikan garis sumbu poros ke kaki depan (inboard) dan kaki belakang (outboard) motor. Selalu perbaiki kaki tidak rata (soft foot) terlebih dahulu dengan memberi shim pada kaki yang goyang sebelum melakukan penyetelan vertikal dan horizontal akhir.',
        equations: [
          {
            label: 'Shim Kaki Depan',
            formula: 'Δs_1 = -(y_c + θ_v · L_1)',
            note: 'L_1 adalah jarak dari pusat kopling ke kaki depan motor. Positif = tambah shim.',
          },
          {
            label: 'Shim Kaki Belakang',
            formula: 'Δs_2 = -(y_c + θ_v · L_2)',
            note: 'L_2 adalah jarak dari pusat kopling ke kaki belakang motor.',
          },
          {
            label: 'Pergeseran Jack Horizontal',
            formula: 'Δh_i = -(x_c + θ_h · L_i)',
            note: 'Geometri proyeksi yang sama pada bidang horizontal (pukul 3–9).',
          },
        ],
        workedExample: {
          title: 'Menghitung Shim Kaki Depan & Belakang Motor',
          given: [
            'y_c = -0.25 mm (rendah), θ_v = +0.0012 rad',
            'Jarak kaki depan L_1 = 200 mm, Jarak kaki belakang L_2 = 550 mm',
          ],
          steps: [
            'Posisi kaki depan: y_1 = -0.25 + (0.0012 × 200) = -0.01 mm → Shim Δs_1 = +0.01 mm.',
            'Posisi kaki belakang: y_2 = -0.25 + (0.0012 × 550) = +0.41 mm → Shim Δs_2 = -0.41 mm (kurangi 0.41 mm).',
          ],
          answer:
            'Tambahkan 0.01 mm pada kaki depan dan kurangi 0.41 mm pada kaki belakang.',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Dial indicator Rim terkompensasi terbaca T = 0.00 mm dan B = -0.44 mm. Berapakah offset vertikal y_c motor pada kopling (dalam mm)?',
        hint: 'Gunakan y_c = -(R_B - R_T) / 2. Pembacaan bawah negatif berarti motor lebih tinggi.',
        solutionSteps: [
          'y_c = -(R_B - R_T) / 2',
          'y_c = -(-0.44 - 0.00) / 2 = +0.22 mm',
        ],
      },
      {
        prompt:
          'Indicator Face menyapu diameter 160 mm dan terbaca T = 0.00 mm dan B = +0.24 mm. Hitung angularitas vertikal dalam mm per 100 mm.',
        hint: 'Angularitas (mm/100 mm) = ((F_B - F_T) / D) × 100.',
        solutionSteps: [
          'θ_v = (0.24 - 0.00) / 160 = 0.0015 rad',
          'Per 100 mm = 0.0015 × 100 = 0.15 mm/100mm',
        ],
      },
      {
        prompt:
          'Anda mencatat T = 0.00 mm, R = -0.18 mm, dan B = -0.46 mm pada gauge Rim. Jika pemasangan valid (T + B = L + R), berapakah pembacaan Kiri (L) seharusnya (dalam mm)?',
        hint: 'Selesaikan T + B = L + R untuk L.',
        solutionSteps: [
          'T + B = 0.00 + (-0.46) = -0.46 mm',
          'L = (T + B) - R = -0.46 - (-0.18) = -0.28 mm',
        ],
      },
      {
        prompt:
          'Sebuah motor memiliki offset kopling y_c = -0.30 mm (rendah) dan kemiringan θ_v = +0.0010 rad. Jika kaki belakang berada di L_2 = 600 mm dari kopling, berapa mm shim yang harus ditambah (+) atau dikurangi (-) pada kaki belakang?',
        hint: 'Gunakan Δs_2 = -(y_c + θ_v · L_2).',
        solutionSteps: [
          'y_2 = -0.30 + (0.0010 × 600) = -0.30 + 0.60 = +0.30 mm',
          'Δs_2 = -y_2 = -0.30 mm (kurangi 0.30 mm shim)',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Mengapa sag batang harus diukur dan dikompensasi dalam penyelarasan poros menggunakan dial indicator?',
        options: [
          'Gravitasi melengkungkan braket indicator ke bawah, membuat pembacaan rim pukul 6 bernilai negatif semu',
          'Pemuaian termal memanjangkan braket ke atas pada pukul 12',
          'Gaya sentrifugal mendorong plunger ke luar saat diputar perlahan dengan tangan',
          'Sag batang hanya memengaruhi indicator Face aksial, tidak pernah indicator Rim',
        ],
        explanation:
          'Saat poros berputar ke pukul 6 (Bawah), gravitasi menarik batang indicator menjauh dari hub, menghasilkan pembacaan rim negatif palsu kecuali dikompensasi.',
      },
      {
        question:
          'Apa yang diperiksa oleh aturan validitas dial indicator T + B = L + R?',
        options: [
          'Apakah motor berputar pada 1800 RPM',
          'Konsistensi matematis empat pembacaan kardinal untuk mendeteksi braket bergeser atau plunger macet',
          'Apakah celah kopling sama dengan diameter poros',
          'Ketebalan pasti shim baja tahan karat yang dibutuhkan di bawah kaki depan',
        ],
        explanation:
          'Untuk setiap ketidaklurusan kaku, jumlah kardinal yang berlawanan (Atas + Bawah dan Kiri + Kanan) harus sama. Selisih menandakan kesalahan pengukuran seperti klem longgar.',
      },
      {
        question:
          'Kapan kaki tidak rata (soft foot) harus diperiksa dan diperbaiki selama pekerjaan penyelarasan?',
        options: [
          'Hanya setelah penyetelan jack horizontal akhir selesai',
          'Pertama kali, sebelum mengambil pembacaan penyelarasan akhir dan melakukan shimming',
          'Hanya pada mesin yang beroperasi di bawah 1000 RPM',
          'Tidak pernah—mengencangkan baut jangkar menghilangkan soft foot secara otomatis',
        ],
        explanation:
          'Kaki tidak rata (soft foot) mendistorsi rangka motor saat baut jangkar dikencangkan sehingga menggeser kelurusan poros secara tak terduga. Selalu hilangkan soft foot (> 0.05 mm) sebelum penyelarasan akhir.',
      },
      {
        question:
          'Dalam metode Rim-and-Face, Rim TIR sebesar 0.40 mm antara Atas dan Bawah setara dengan offset paralel berapa?',
        options: ['0.80 mm', '0.40 mm', '0.20 mm', '0.10 mm'],
        explanation:
          'Memutar 180° membalik eksentrisitas radial, sehingga Total Indicator Reading (TIR) adalah dua kali offset garis sumbu: 0.40 / 2 = 0.20 mm.',
      },
      {
        question:
          'Bagaimana toleransi pelurusan poros ISO/ANSI berubah saat kecepatan operasi mesin naik dari 1500 RPM ke 3600 RPM?',
        options: [
          'Toleransi menjadi lebih ketat (batas offset dan angularitas yang diizinkan lebih kecil)',
          'Toleransi menjadi lebih longgar karena kecepatan tinggi memusatkan kopling sendiri',
          'Toleransi tetap sama tanpa memandang RPM',
          'Hanya angularitas yang berubah; offset paralel tidak bergantung pada RPM',
        ],
        explanation:
          'Kecepatan putar lebih tinggi memperbesar gaya dinamis, getaran, dan beban bantalan, sehingga menuntut batas offset dan angularitas yang jauh lebih ketat.',
      },
    ],
  },
  ja: {
    title: 'ダイヤルゲージ・軸芯出しシミュレータ',
    shortTitle: '軸芯出し',
    description:
      'リム＆フェイス方式のダイヤルゲージで平行偏心と偏角ミスアライメントを診断し、バーたわみ補正とモータ脚シム量を算出します。',
    explore: [
      {
        title: 'リム＆フェイス・ダイヤルゲージ法',
        summary:
          'リム＆フェイス法では、1つのダイヤルゲージをカップリング外周（リム）に当てて平行偏心を測定し、もう1つを端面（フェイス）に当てて偏角を測定します。12時位置（0°）でゼロ合わせした後、両軸を一緒に0°（上）・90°（右）・180°（下）・270°（左）へ回転させます。',
        equations: [
          {
            label: '平行偏心（垂直方向）',
            formula: 'y_c = -(R_B - R_T) / 2',
            note: 'リムの振れ幅（TIR）は中心線オフセットの2倍になります。',
          },
          {
            label: '平行偏心（水平方向）',
            formula: 'x_c = (R_R - R_L) / 2',
            note: '3時（R）と9時（L）の間で測定します。',
          },
          {
            label: '偏角（傾き）',
            formula: 'θ_v = (F_B - F_T) / D',
            note: 'フェイスTIRをゲージ掃引径 D で割った値（rad または mm/mm）。',
          },
        ],
        workedExample: {
          title: 'カップリング偏心と偏角の算出',
          given: [
            'カップリング掃引径 D = 150 mm',
            '補正済みリム読値: T = 0.00 mm, B = +0.50 mm',
            'フェイス読値: T = 0.00 mm, B = +0.18 mm',
          ],
          steps: [
            'カップリング部の垂直偏心: y_c = -(0.50 - 0.00) / 2 = -0.25 mm（モータが 0.25 mm 低い）。',
            '垂直偏角スロープ: θ_v = (0.18 - 0.00) / 150 = +0.0012 rad。',
            '100 mm あたりの偏角: 0.0012 × 100 = 0.12 mm / 100 mm。',
          ],
          answer:
            'モータはカップリング部で 0.25 mm 低く、後方へ +0.12 mm/100 mm の上向き傾きがあります。',
        },
      },
      {
        title: 'バーたわみ補正と妥当性ルール (T + B = L + R)',
        summary:
          '軸回転時に重力でゲージブラケットが下向きにたわむため、6時（下）のリム読値は見かけ上マイナスに偏ります。事前に剛体マンドレルでバーたわみを測定しておけば生読値から補正できます。計算前に必ず T + B = L + R の成立を確認してください。',
        equations: [
          {
            label: '妥当性ルール',
            formula: 'T + B = L + R',
            note: '| (T + B) - (L + R) | が 0.02 mm を超える場合、ブラケット滑りやボルト緩み、ソフトフットを疑います。',
          },
          {
            label: 'たわみ補正後の下側読値',
            formula: 'R_B,comp = R_B,raw + S_sag',
            note: 'S_sag > 0 は6時位置で測定された下向きバーたわみTIRです。',
          },
        ],
        workedExample: {
          title: '生リム測定値のバーたわみ補正',
          given: [
            '測定ブラケットたわみ S_sag = 0.08 mm',
            '生リム読値: T = 0.00 mm, R = -0.14 mm, B = -0.28 mm, L = -0.14 mm',
          ],
          steps: [
            '生データの妥当性確認: T + B = -0.28 mm、L + R = -0.28 mm（正常）。',
            '下側へ全たわみを加算: B_comp = -0.28 + 0.08 = -0.20 mm。',
            '左右へ半分のたわみを加算: L_comp = R_comp = -0.14 + 0.04 = -0.10 mm。',
            '真の垂直偏心: y_c = -(-0.20) / 2 = +0.10 mm（モータが 0.10 mm 高い）。',
          ],
          answer:
            '真の垂直偏心は +0.10 mm です（たわみ補正を忘れると 0.04 mm 過大評価します）。',
        },
      },
      {
        title: '脚シム計算式と水平ジャッキ移動量',
        summary:
          'カップリング部の偏心と偏角が求まったら、モータ前脚（インボード）および後脚（アウトボード）位置へ軸中心線を投影します。最終の垂直シム・水平移動を行う前に、必ずソフトフット（脚浮き）を先にシム補正してください。',
        equations: [
          {
            label: '前脚シム量',
            formula: 'Δs_1 = -(y_c + θ_v · L_1)',
            note: 'L_1 はカップリング中心からモータ前脚までの距離。正＝シム追加。',
          },
          {
            label: '後脚シム量',
            formula: 'Δs_2 = -(y_c + θ_v · L_2)',
            note: 'L_2 はカップリング中心からモータ後脚までの距離。',
          },
          {
            label: '水平ジャッキ移動量',
            formula: 'Δh_i = -(x_c + θ_h · L_i)',
            note: '水平面（3時–9時方向）でも同じ投影幾何を用います。',
          },
        ],
        workedExample: {
          title: 'モータ前脚・後脚シム量の計算',
          given: [
            'y_c = -0.25 mm（低い）、θ_v = +0.0012 rad',
            '前脚距離 L_1 = 200 mm、後脚距離 L_2 = 550 mm',
          ],
          steps: [
            '前脚位置: y_1 = -0.25 + (0.0012 × 200) = -0.01 mm → シム Δs_1 = +0.01 mm。',
            '後脚位置: y_2 = -0.25 + (0.0012 × 550) = +0.41 mm → シム Δs_2 = -0.41 mm（0.41 mm 抜く）。',
          ],
          answer: '前脚に 0.01 mm 追加し、後脚から 0.41 mm 抜き取ります。',
        },
      },
    ],
    practice: [
      {
        prompt:
          'たわみ補正済みのリムダイヤルゲージが T = 0.00 mm、B = -0.44 mm を示しています。カップリング部におけるモータの垂直偏心 y_c（mm）はいくらですか？',
        hint: 'y_c = -(R_B - R_T) / 2 を使います。下側の負の読値はモータが高いことを意味します。',
        solutionSteps: [
          'y_c = -(R_B - R_T) / 2',
          'y_c = -(-0.44 - 0.00) / 2 = +0.22 mm',
        ],
      },
      {
        prompt:
          '掃引径 160 mm のフェイスゲージが T = 0.00 mm、B = +0.24 mm を示しました。垂直偏角を mm per 100 mm で計算してください。',
        hint: '偏角 (mm/100 mm) = ((F_B - F_T) / D) × 100。',
        solutionSteps: [
          'θ_v = (0.24 - 0.00) / 160 = 0.0015 rad',
          '100 mm あたり = 0.0015 × 100 = 0.15 mm/100mm',
        ],
      },
      {
        prompt:
          'リムゲージで T = 0.00 mm、R = -0.18 mm、B = -0.46 mm を記録しました。測定が妥当（T + B = L + R）である場合、左（L）の読値（mm）はいくらになりますか？',
        hint: 'T + B = L + R を L について解きます。',
        solutionSteps: [
          'T + B = 0.00 + (-0.46) = -0.46 mm',
          'L = (T + B) - R = -0.46 - (-0.18) = -0.28 mm',
        ],
      },
      {
        prompt:
          'モータのカップリング偏心が y_c = -0.30 mm（低い）、傾きが θ_v = +0.0010 rad です。後脚がカップリングから L_2 = 600 mm の位置にあるとき、後脚で追加（+）または除去（-）すべきシム量（mm）は？',
        hint: 'Δs_2 = -(y_c + θ_v · L_2) を使用します。',
        solutionSteps: [
          'y_2 = -0.30 + (0.0010 × 600) = -0.30 + 0.60 = +0.30 mm',
          'Δs_2 = -y_2 = -0.30 mm（シムを 0.30 mm 抜く）',
        ],
      },
    ],
    quiz: [
      {
        question:
          'ダイヤルゲージによる軸芯出しでバーたわみ（Bar Sag）を測定・補正する必要がある理由は？',
        options: [
          '重力でゲージブラケットが下向きにたわみ、6時位置のリム読値が見かけ上マイナスになるため',
          '熱膨張により12時位置でブラケットが上向きに伸びるため',
          'ゆっくり手で回す際の遠心力でプランジャが外へ押し出されるため',
          'バーたわみはアキシアル方向のフェイスゲージにのみ影響し、リムには影響しないため',
        ],
        explanation:
          '軸が6時（下）へ回転すると重力で片持ちブラケットがハブから離れる方向へたわむため、補正しないと偽のマイナス読値が生じます。',
      },
      {
        question: 'ダイヤルゲージの妥当性ルール T + B = L + R は何を確認しますか？',
        options: [
          'モータが 1800 RPM で運転されているかどうか',
          '4方向読値の数学的整合性を確認し、ブラケットの滑りやプランジャの引っ掛かりを検出する',
          'カップリング隙間が軸径と等しいかどうか',
          '前脚の下に必要なステンレス製シムの正確な厚さ',
        ],
        explanation:
          '剛体ミスアライメントでは対向する和（上＋下 と 左＋右）が必ず等しくなります。一致しない場合はクランプ緩みなどの測定誤差を示します。',
      },
      {
        question: '芯出し作業において、ソフトフット（脚浮き）の点検・修正はいつ行うべきですか？',
        options: [
          '最終の水平ジャッキ移動が完了した後のみ',
          '最初に行い、最終芯出し測定とシム調整の前に解消しておく',
          '1000 RPM 未満で運転する機械のみ',
          '不要—アンカーボルトを締めればソフトフットは自動的に消える',
        ],
        explanation:
          'ソフトフットがあるとボルト締結時にモータフレームが歪み、芯出し状態が予測不能に変化します。最終芯出し前に必ず 0.05 mm 以下へ修正してください。',
      },
      {
        question:
          'リム＆フェイス法で、上下間のリム TIR が 0.40 mm のとき、平行偏心はいくらですか？',
        options: ['0.80 mm', '0.40 mm', '0.20 mm', '0.10 mm'],
        explanation:
          '180°回転すると偏心が反転するため、TIR は中心線オフセットの2倍になります：0.40 / 2 = 0.20 mm。',
      },
      {
        question:
          '運転回転数が 1500 RPM から 3600 RPM に上がると、ISO/ANSI 軸芯出し許容値はどのように変化しますか？',
        options: [
          '許容値はより厳しくなる（許容される偏心・偏角が小さくなる）',
          '高速回転でカップリングが自動調心するため許容値は緩くなる',
          'RPM に関係なく許容値は同一である',
          '偏角のみ変化し、平行偏心は RPM に依存しない',
        ],
        explanation:
          '回転数が高いほど動的加振力・振動・軸受荷重が増大するため、はるかに厳しい偏心・偏角許容値が要求されます。',
      },
    ],
  },
});
