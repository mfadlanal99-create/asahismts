import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('valve-packing', {
  id: {
    title: 'Pemeliharaan Katup Industri, Gland Packing & Steam Trap',
    shortTitle: 'Katup & Paking',
    description:
      'Hitung kapasitas katup kontrol dengan Cv, seimbangkan torsi gland follower terhadap stiction batang dan kebocoran emisi proses, serta diagnosis kebocoran dudukan dan steam trap yang meniup.',
    explore: [
      {
        title: 'Ukuran Aliran Cv & Karakteristik Trim Katup',
        summary:
          'Koefisien aliran katup Cv mendefinisikan volume air (dalam galon AS/menit pada 60 °F) yang melewati katup dengan penurunan tekanan 1 psi. Dalam satuan metrik (m³/h dan bar), Cv menghubungkan laju aliran Q, tekanan diferensial ΔP, dan berat jenis fluida SG. Trim katup yang berbeda—globe equal-percentage, gate quick-opening, ball, dan butterfly—menghasilkan kurva Cv yang berbeda di sepanjang bukaan 0–100%.',
        equations: [
          {
            label: 'Persamaan Aliran Cairan (Metrik)',
            formula: 'Q = 0.865 · Cv · √(ΔP / SG)',
            note: 'Q dalam m³/h, ΔP dalam bar, SG = berat jenis fluida (air = 1.0)',
          },
          {
            label: 'Kurva Trim Equal-Percentage',
            formula: 'Cv(h) = Cv,max · R^(h − 1)',
            note: 'h = fraksi bukaan (0 hingga 1), R = rangeability (umumnya 20–50)',
          },
        ],
        workedExample: {
          title: 'Perhitungan Aliran Katup Kontrol',
          given: [
            'Koefisien katup efektif Cv = 32',
            'Tekanan diferensial ΔP = 4.0 bar',
            'Berat jenis air proses SG = 1.0',
          ],
          steps: [
            'Hitung suku tekanan-gravitasi: √(ΔP / SG) = √(4.0 / 1.0) = 2.0',
            'Kalikan dengan faktor konversi metrik dan Cv: Q = 0.865 × 32 × 2.0',
          ],
          answer: 'Q = 55.36 m³/h',
        },
      },
      {
        title: 'Kompresi Gland Packing, Gesekan Batang & Lantern Ring',
        summary:
          'Stuffing box menyegel batang katup menggunakan susunan cincin PTFE anyaman atau grafit fleksibel yang ditekan secara aksial oleh gland follower. Kompresi aksial diubah menjadi tegangan penyegelan radial terhadap batang dan dinding box melalui rasio Poisson packing (K ≈ 0.65). Cincin lantern kuningan di tengah mendistribusikan gemuk penghalang atau fluida bilas, sementara pengencangan berlebih melonjakkan gesekan batang dan memicu hunting aktuator.',
        equations: [
          {
            label: 'Gaya Aksial Baut Gland',
            formula: 'F_gland = N_bolts · T / (K · d)',
            note: 'T = torsi mur (N·m), K ≈ 0.20 faktor mur, d = diameter nominal stud (m)',
          },
          {
            label: 'Gaya Gesek Batang',
            formula: 'F_friction = μ · P_radial · π · d_stem · L_pack',
            note: 'μ = koefisien gesek packing (0.08–0.19), L_pack = tinggi total packing',
          },
          {
            label: 'Tegangan Penyegelan Radial Minimum',
            formula: 'P_req = 1.2 MPa + 2.1 · P_line',
            note: 'Tegangan radial packing harus melebihi P_req untuk mencegah kebocoran emisi proses',
          },
        ],
        workedExample: {
          title: 'Gaya Gland Follower & Tegangan Aksial',
          given: [
            '2 × stud gland M12 (d = 0.012 m, faktor mur K = 0.20)',
            'Torsi mur yang diterapkan T = 30 N·m per stud',
            'Luas anulus stuffing box A = 816.8 mm² (d_stem = 16 mm, d_box = 36 mm)',
          ],
          steps: [
            'Gaya per stud: F_bolt = 30 / (0.20 × 0.012) = 12,500 N',
            'Total gaya gland follower: F_gland = 2 × 12,500 = 25,000 N',
            'Tegangan packing aksial: P_axial = 25,000 N / 816.8 mm² = 30.6 MPa',
            'Tegangan penyegelan radial (K_r = 0.65): P_radial = 0.65 × 30.6 = 19.9 MPa',
          ],
          answer: 'F_gland = 25,000 N, P_radial = 19.9 MPa',
        },
      },
      {
        title: 'Inspeksi Steam Trap, Kebocoran Dudukan & Diagnostik Ultrasonik',
        summary:
          'Steam trap secara otomatis membuang kondensat dan gas tak-terkondensasi sambil menahan uap hidup. Trap yang gagal terbuka ("meniup") atau katup isolasi dengan dudukan tergerus (wiredrawn) membuang panas laten dalam jumlah besar. Teknisi memeriksa trap menggunakan sensor akustik ultrasonik (desis frekuensi tinggi kontinu vs siklus intermiten normal) dan termografi IR hilir.',
        equations: [
          {
            label: 'Kehilangan Panas Blow-By Uap',
            formula: 'Q_loss = ṁ_steam · h_fg / 3600',
            note: 'Q_loss dalam kW, ṁ_steam dalam kg/h, h_fg = panas laten (2015 kJ/kg pada 10 bar)',
          },
        ],
        workedExample: {
          title: 'Kehilangan Energi dari Steam Trap yang Meniup',
          given: [
            'Laju blow-by uap hidup ṁ_steam = 30 kg/h pada 10 bar',
            'Panas laten penguapan h_fg = 2015 kJ/kg',
            'Jam operasi pabrik = 8,000 h/tahun',
          ],
          steps: [
            'Daya termal terbuang: Q_loss = (30 × 2015) / 3600 = 16.79 kW',
            'Kehilangan energi tahunan: E_loss = 16.79 kW × 8,000 h = 134,320 kWh/tahun',
          ],
          answer: 'Kehilangan kontinu 16.79 kW (134,320 kWh/tahun)',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Sebuah katup kontrol globe memiliki Cv efektif 25 pada air proses (SG = 1.0) dengan tekanan diferensial ΔP sebesar 9 bar. Hitung laju aliran volumetrik Q dalam m³/h menggunakan Q = 0.865 · Cv · √(ΔP / SG).',
        hint: '√(9 / 1) = 3. Kalikan 0.865 × 25 × 3.',
        solutionSteps: [
          'Hitung √(ΔP / SG) = √(9 / 1.0) = 3.0',
          'Q = 0.865 × 25 × 3.0 = 64.875 m³/h ≈ 64.88 m³/h',
        ],
      },
      {
        prompt:
          'Dua stud gland follower M12 (d = 0.012 m, K = 0.20) dikencangkan hingga 24 N·m masing-masing. Berapa total gaya aksial gland follower dalam kN?',
        hint: 'F_bolt = T / (K · d), lalu kalikan 2 stud dan bagi 1000 untuk kN.',
        solutionSteps: [
          'Gaya per stud: F_bolt = 24 / (0.20 × 0.012) = 10,000 N',
          'Total gaya gland untuk 2 stud: F_gland = 2 × 10,000 = 20,000 N = 20 kN',
        ],
      },
      {
        prompt:
          'Sebuah katup beroperasi pada tekanan jalur 15 bar (1.5 MPa). Menggunakan kriteria penyegelan P_req = 1.2 + 2.1 · P_line(MPa), berapa tegangan packing radial minimum yang dibutuhkan dalam MPa?',
        hint: 'Konversi 15 bar ke 1.5 MPa terlebih dahulu, lalu hitung 1.2 + 2.1 × 1.5.',
        solutionSteps: [
          'Konversi tekanan jalur: 15 bar = 1.5 MPa',
          'P_req = 1.2 + 2.1 × 1.5 = 1.2 + 3.15 = 4.35 MPa',
        ],
      },
      {
        prompt:
          'Sebuah steam trap 10 bar yang meniup membocorkan 45 kg/h uap hidup (h_fg = 2015 kJ/kg). Hitung kehilangan daya termal kontinu dalam kW.',
        hint: 'Q_loss (kW) = (ṁ_steam × h_fg) / 3600.',
        solutionSteps: [
          'Energi per jam = 45 kg/h × 2015 kJ/kg = 90,675 kJ/h',
          'Bagi dengan 3600 s/h: Q_loss = 90,675 / 3600 = 25.1875 kW ≈ 25.19 kW',
        ],
      },
      {
        prompt:
          'Batang katup berdiameter 20 mm memiliki set packing setinggi 40 mm yang memberikan tegangan radial 10 MPa dengan koefisien gesek μ = 0.12. Hitung gaya gesek batang dalam N (F_f = μ · P_radial · π · d · L).',
        hint: 'Luas kontak = π × 20 mm × 40 mm = 2513.3 mm². Kalikan dengan 10 MPa (= N/mm²) dan 0.12.',
        solutionSteps: [
          'Luas kontak batang A = π × 20 × 40 = 2513.27 mm²',
          'Gaya gesek F_f = 0.12 × 10 N/mm² × 2513.27 mm² = 3015.9 N ≈ 3016 N',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Apa konsekuensi utama dari mengencangkan gland follower katup kontrol secara berlebihan?',
        options: [
          'Peningkatan gesekan batang (stiction), hunting aktuator, dan potensi goresan pada batang',
          'Peningkatan kapasitas Cv katup pada bukaan rendah',
          'Kavitasi langsung pada pipa hilir',
          'Penurunan tekanan jalur di bawah tekanan uap',
        ],
        explanation:
          'Torsi gland berlebih menekan cincin packing secara radial ke batang, melonjakkan gaya gesek, menyebabkan kontrol stick-slip (hunting), dan menggores permukaan batang.',
      },
      {
        question:
          'Apa fungsi cincin lantern kuningan yang dipasang di tengah susunan packing stuffing box?',
        options: [
          'Mengunci plug katup pada posisi terbuka penuh',
          'Mendistribusikan pelumas penghalang atau fluida bilas secara merata di sekeliling batang',
          'Meningkatkan Cv katup sebesar 25%',
          'Bertindak sebagai anoda korban terhadap erosi uap',
        ],
        explanation:
          'Cincin lantern berada di antara cincin packing atas dan bawah serta sejajar dengan port bonnet untuk menyuntikkan gemuk, sealant, atau fluida bilas bersih ke sekeliling batang.',
      },
      {
        question:
          'Jenis katup manakah yang dirancang khusus untuk kontrol throttling akurat dengan karakteristik aliran equal-percentage?',
        options: [
          'Katup gate baji standar',
          'Katup kontrol globe',
          'Katup ball full-bore',
          'Katup check ayun',
        ],
        explanation:
          'Katup globe dirancang untuk throttling dan modulasi aliran presisi, sedangkan katup gate ditujukan untuk isolasi buka-penuh/tutup-penuh.',
      },
      {
        question:
          'Berdasarkan deteksi kebocoran EPA Method 21, konsentrasi emisi proses berapakah yang umumnya memicu perbaikan wajib paking katup?',
        options: ['5 ppm', '50 ppm', '500 ppm', '50,000 ppm'],
        explanation:
          'Program LDAR standar di bawah EPA Method 21 menetapkan 500 ppm sebagai ambang tindakan untuk kebocoran batang katup pada packing emisi rendah modern.',
      },
      {
        question:
          'Selama inspeksi ultrasonik dan IR, sebuah steam trap mengeluarkan desis frekuensi tinggi yang stabil dan suhu pipa hulu serta hilir hampir sama. Apa diagnosisnya?',
        options: [
          'Trap berfungsi normal',
          'Trap gagal menutup (tergenang kondensat)',
          'Trap gagal terbuka (meniup uap hidup)',
          'Gland packing terlalu kencang',
        ],
        explanation:
          'Steam trap yang gagal terbuka ("meniup") secara kontinu meloloskan uap hidup, menghasilkan desis ultrasonik stabil dan menjaga jalur kondensat hilir mendekati suhu uap.',
      },
      {
        question:
          'Mengapa mur gland follower harus selalu dikencangkan secara merata dalam langkah kecil (mis. 1/4 putaran bergantian kiri-kanan)?',
        options: [
          'Untuk mencegah gland follower miring (cocking) dan menggores satu sisi batang katup',
          'Untuk membalik arah aliran fluida melalui dudukan',
          'Untuk mengubah katup globe menjadi katup quick-opening',
          'Untuk menurunkan berat jenis fluida',
        ],
        explanation:
          'Pengencangan tidak merata memiringkan gland follower, menjepit satu sisi ke batang sementara sisi berlawanan kurang terkompresi dan mudah bocor.',
      },
    ],
  },
  ja: {
    title: '産業用バルブ・グランドパッキン・スチームトラップ保全',
    shortTitle: 'バルブ＆パッキン',
    description:
      'Cv値による制御弁のサイジング、グランドフォロワ締付トルクとステム固着・漏洩のバランス調整、シート漏れやスチームトラップの吹き抜け診断を行います。',
    explore: [
      {
        title: 'Cv流量サイジングとバルブトリム特性',
        summary:
          '流量係数Cvは、1 psiの圧力損失で60 °Fの水が流れる流量（US gal/min）を表します。メートル法（m³/h、bar）では、Cvは流量Q、差圧ΔP、流体比重SGを結び付けます。イコールパーセンテージ（グローブ）、クイックオープニング（ゲート）、ボール、バタフライの各トリムは、開度0–100%に対して異なるCv曲線を描きます。',
        equations: [
          {
            label: '液体流量式（メートル法）',
            formula: 'Q = 0.865 · Cv · √(ΔP / SG)',
            note: 'Qはm³/h、ΔPはbar、SG = 流体比重（水 = 1.0）',
          },
          {
            label: 'イコールパーセンテージ特性曲線',
            formula: 'Cv(h) = Cv,max · R^(h − 1)',
            note: 'h = 相対開度（0〜1）、R = レンジアビリティ（通常 20–50）',
          },
        ],
        workedExample: {
          title: '制御弁の流量計算',
          given: [
            '有効流量係数 Cv = 32',
            '差圧 ΔP = 4.0 bar',
            'プロセス水の比重 SG = 1.0',
          ],
          steps: [
            '圧力・比重項を計算: √(ΔP / SG) = √(4.0 / 1.0) = 2.0',
            'メートル法換算係数とCvを乗算: Q = 0.865 × 32 × 2.0',
          ],
          answer: 'Q = 55.36 m³/h',
        },
      },
      {
        title: 'グランドパッキン圧縮・ステム摩擦・ランタンリング',
        summary:
          'スタフィングボックスは、グランドフォロワで編組PTFEや膨張黒鉛リングを軸方向に圧縮し、ポアソン比（K ≈ 0.65）により半径方向のシール面圧を発生させてステムを密封します。中央の真鍮製ランタンリングはバリアグリースやフラッシュ液を均等供給します。過度の締め付けはステム摩擦を急増させ、ハンチングやかじりの原因となります。',
        equations: [
          {
            label: 'グランドボルト軸力',
            formula: 'F_gland = N_bolts · T / (K · d)',
            note: 'T = ナットトルク (N·m)、K ≈ 0.20 トルク係数、d = スタッド呼び径 (m)',
          },
          {
            label: 'ステム摩擦力',
            formula: 'F_friction = μ · P_radial · π · d_stem · L_pack',
            note: 'μ = パッキン摩擦係数 (0.08–0.19)、L_pack = パッキン総高さ',
          },
          {
            label: '最小半径方向シール面圧',
            formula: 'P_req = 1.2 MPa + 2.1 · P_line',
            note: '漏洩防止のため、半径方向面圧はP_reqを上回る必要があります',
          },
        ],
        workedExample: {
          title: 'グランド押さえ力と軸応力',
          given: [
            'M12グランドスタッド × 2本（d = 0.012 m、トルク係数 K = 0.20）',
            'ナット締付トルク T = 30 N·m / 本',
            'スタフィングボックス環状面積 A = 816.8 mm²（d_stem = 16 mm, d_box = 36 mm）',
          ],
          steps: [
            'スタッド1本あたりの軸力: F_bolt = 30 / (0.20 × 0.012) = 12,500 N',
            'グランド総押さえ力: F_gland = 2 × 12,500 = 25,000 N',
            '軸方向パッキン応力: P_axial = 25,000 N / 816.8 mm² = 30.6 MPa',
            '半径方向シール面圧（K_r = 0.65）: P_radial = 0.65 × 30.6 = 19.9 MPa',
          ],
          answer: 'F_gland = 25,000 N, P_radial = 19.9 MPa',
        },
      },
      {
        title: 'スチームトラップ点検・シート漏れ・超音波診断',
        summary:
          'スチームトラップは生蒸気を遮断しつつ復水と不凝縮ガスを自動排出します。トラップの開故障（吹き抜け）や仕切弁シートのワイヤードローイングによる漏れは多大な潜熱損失を招きます。現場では超音波音響センサー（連続的な高周波ヒス音 vs 正常な間欠作動音）と下流側IRサーモグラフィで診断します。',
        equations: [
          {
            label: '蒸気吹き抜け熱損失',
            formula: 'Q_loss = ṁ_steam · h_fg / 3600',
            note: 'Q_lossはkW、ṁ_steamはkg/h、h_fg = 蒸発潜熱（10 barで 2015 kJ/kg）',
          },
        ],
        workedExample: {
          title: '吹き抜けスチームトラップのエネルギー損失',
          given: [
            '10 barでの生蒸気吹き抜け量 ṁ_steam = 30 kg/h',
            '蒸発潜熱 h_fg = 2015 kJ/kg',
            '年間稼働時間 = 8,000 h/年',
          ],
          steps: [
            '熱損失率: Q_loss = (30 × 2015) / 3600 = 16.79 kW',
            '年間エネルギー損失: E_loss = 16.79 kW × 8,000 h = 134,320 kWh/年',
          ],
          answer: '16.79 kW の連続損失（134,320 kWh/年）',
        },
      },
    ],
    practice: [
      {
        prompt:
          'プロセス水（SG = 1.0）、差圧 ΔP = 9 bar の条件下で有効 Cv = 25 のグローブ制御弁があります。Q = 0.865 · Cv · √(ΔP / SG) を用いて体積流量 Q (m³/h) を計算してください。',
        hint: '√(9 / 1) = 3 です。0.865 × 25 × 3 を計算します。',
        solutionSteps: [
          '√(ΔP / SG) = √(9 / 1.0) = 3.0 を計算',
          'Q = 0.865 × 25 × 3.0 = 64.875 m³/h ≈ 64.88 m³/h',
        ],
      },
      {
        prompt:
          '2本のM12グランドフォロワスタッド（d = 0.012 m, K = 0.20）をそれぞれ 24 N·m で締め付けました。グランドフォロワの総軸力 (kN) はいくらですか？',
        hint: 'F_bolt = T / (K · d) を求め、2本分を掛けて 1000 で割ります。',
        solutionSteps: [
          '1本あたりの軸力: F_bolt = 24 / (0.20 × 0.012) = 10,000 N',
          '2本合計のグランド押さえ力: F_gland = 2 × 10,000 = 20,000 N = 20 kN',
        ],
      },
      {
        prompt:
          'ライン圧力 15 bar（1.5 MPa）で稼働するバルブにおいて、シール基準式 P_req = 1.2 + 2.1 · P_line(MPa) を用いた場合の最小必要半径方向パッキン面圧 (MPa) を求めてください。',
        hint: 'まず 15 bar を 1.5 MPa に換算し、1.2 + 2.1 × 1.5 を計算します。',
        solutionSteps: [
          'ライン圧力換算: 15 bar = 1.5 MPa',
          'P_req = 1.2 + 2.1 × 1.5 = 1.2 + 3.15 = 4.35 MPa',
        ],
      },
      {
        prompt:
          '吹き抜け状態の10 barスチームトラップが 45 kg/h の生蒸気（h_fg = 2015 kJ/kg）を漏洩しています。連続熱損失 (kW) を計算してください。',
        hint: 'Q_loss (kW) = (ṁ_steam × h_fg) / 3600 を計算します。',
        solutionSteps: [
          '1時間あたりの熱量 = 45 kg/h × 2015 kJ/kg = 90,675 kJ/h',
          '3600 s/h で除算: Q_loss = 90,675 / 3600 = 25.1875 kW ≈ 25.19 kW',
        ],
      },
      {
        prompt:
          '直径 20 mm のバルブステムに高さ 40 mm のパッキンセットが装着されており、摩擦係数 μ = 0.12 で 10 MPa の半径方向応力が作用しています。ステム摩擦力 (N) を求めてください（F_f = μ · P_radial · π · d · L）。',
        hint: '接触面積 = π × 20 mm × 40 mm = 2513.3 mm²。これに 10 MPa (= N/mm²) と 0.12 を掛けます。',
        solutionSteps: [
          'ステム接触面積 A = π × 20 × 40 = 2513.27 mm²',
          '摩擦力 F_f = 0.12 × 10 N/mm² × 2513.27 mm² = 3015.9 N ≈ 3016 N',
        ],
      },
    ],
    quiz: [
      {
        question:
          '制御弁のグランドフォロワを過度に締め付けた場合の主な影響は何ですか？',
        options: [
          'ステム摩擦（スティクション）の増大、アクチュエータのハンチング、およびステムの焼付き・傷',
          '低開度域でのバルブCv容量の増加',
          '下流配管での即座のキャビテーション発生',
          '蒸気圧以下へのライン圧力低下',
        ],
        explanation:
          '過大なグランドトルクはパッキンをステムへ強く押し付け、摩擦力を急増させてスティック・スリップ（ハンチング）やステム表面のかじりを引き起こします。',
      },
      {
        question:
          'スタフィングボックスのパッキンセット中央に配置される真鍮製ランタンリングの目的は何ですか？',
        options: [
          'バルブプラグを全開位置でロックするため',
          'バリア潤滑剤やフラッシュ液をステム全周に均等供給するため',
          'バルブのCv値を25%向上させるため',
          '蒸気エロージョンに対する犠牲陽極として機能するため',
        ],
        explanation:
          'ランタンリングは上下のパッキンリング間に配置され、ボンネットの注入ポートと位置を合わせてグリースやシール液・洗浄液をステム周囲に分配します。',
      },
      {
        question:
          'イコールパーセンテージ流量特性を持ち、精密な絞り制御（スロットリング）専用に設計されたバルブ形式はどれですか？',
        options: [
          '標準ウェッジゲート弁',
          'グローブ制御弁',
          'フルボアボール弁',
          'スイングチェック弁',
        ],
        explanation:
          'グローブ弁は精密な流量制御・絞り用途に設計されているのに対し、ゲート弁は全開・全閉の遮断用途向けです。',
      },
      {
        question:
          'EPA Method 21 漏洩検知において、バルブパッキンの修理が義務付けられる一般的な漏洩濃度しきい値はどれですか？',
        options: ['5 ppm', '50 ppm', '500 ppm', '50,000 ppm'],
        explanation:
          'EPA Method 21に基づく標準的なLDARプログラムでは、低漏洩パッキンを採用したバルブステムの是正基準として 500 ppm が用いられます。',
      },
      {
        question:
          '超音波・IR点検で、スチームトラップから連続的な高周波ヒス音が聞こえ、上流側と下流側の配管温度がほぼ同じでした。診断結果は何ですか？',
        options: [
          'トラップは正常に作動している',
          'トラップが閉故障（復水滞留）している',
          'トラップが開故障（生蒸気吹き抜け）している',
          'グランドパッキンが締めすぎである',
        ],
        explanation:
          '開故障（吹き抜け）状態のトラップは生蒸気を連続通過させるため、一定の超音波ヒス音が発生し、下流側復水配管が蒸気温度近くまで上昇します。',
      },
      {
        question:
          'グランドフォロワのナットを左右交互に少しずつ（例：1/4回転ずつ）均等に締め付けるべき理由は何ですか？',
        options: [
          'グランドフォロワの片傾き（こじり）を防ぎ、ステム片側の傷や反対側からの漏洩を防止するため',
          'シートを通過する流体の流れ方向を逆転させるため',
          'グローブ弁をクイックオープニング特性に変換するため',
          '流体の比重を下げるため',
        ],
        explanation:
          '片締めするとグランドフォロワが傾いてステムの一方に接触・傷を付け、反対側のパッキン圧縮が不足して漏洩が発生します。',
      },
    ],
  },
});
