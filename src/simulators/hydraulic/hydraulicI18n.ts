import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('hydraulic', {
  id: {
    title: 'Simulator Sirkuit Hidrolik & Katup Pelepas',
    shortTitle: 'Sirkuit Hidrolik',
    description:
      'Unit daya hidrolik (HPU) pompa perpindahan tetap interaktif, katup pelepas tekanan, katup arah 4/3, kontrol aliran meter-out, dan diagnosis gangguan perawatan.',
    explore: [
      {
        title: 'Hukum Pascal & Luas Diferensial Silinder',
        summary:
          'Pada silinder hidrolik kerja ganda, oli bertekanan bekerja pada luas penuh lubang piston (A_cap) saat langkah maju (extend), namun hanya pada luas anulus yang lebih kecil (A_rod = A_cap - A_shaft) saat langkah mundur (retract). Akibatnya, langkah maju menghasilkan gaya lebih besar dengan kecepatan lebih rendah, sedangkan langkah mundur lebih cepat dengan gaya lebih kecil pada debit pompa yang sama.',
        equations: [
          {
            label: 'Luas Sisi Cap',
            formula: 'A_cap = (π / 4) × D²',
            note: 'D = diameter bore silinder (mis. 80 mm → 50,27 cm²)',
          },
          {
            label: 'Luas Anulus (Sisi Rod)',
            formula: 'A_ann = (π / 4) × (D² - d²)',
            note: 'd = diameter batang piston (mis. 45 mm → 34,36 cm²)',
          },
          {
            label: 'Gaya Netto Silinder',
            formula: 'F_ext = (P₂ × A_cap - P₃ × A_ann) / 100',
            note: 'F dalam kN jika P dalam bar dan A dalam cm²',
          },
          {
            label: 'Kecepatan Aktuator',
            formula: 'v = (Q × 10.000) / (60 × A)',
            note: 'v dalam mm/s, Q dalam L/min, A dalam cm²',
          },
        ],
        workedExample: {
          title: 'Gaya Maju & Kecepatan Mundur',
          given: [
            'Bore D = 80 mm (A_cap = 50,27 cm²), Rod d = 45 mm (A_ann = 34,36 cm²)',
            'Debit pompa Q = 24 L/min, Tekanan cap P₂ = 120 bar, Tekanan balik rod P₃ = 5 bar',
          ],
          steps: [
            '1. Hitung gaya sisi cap: F_cap = (120 × 50,27) / 100 = 60,32 kN',
            '2. Kurangi gaya tekanan balik sisi rod: F_back = (5 × 34,36) / 100 = 1,72 kN',
            '3. Gaya maju netto: F_net = 60,32 - 1,72 = 58,60 kN',
            '4. Kecepatan maju: v_ext = (24 × 10.000) / (60 × 50,27) = 79,6 mm/s',
            '5. Kecepatan mundur: v_ret = (24 × 10.000) / (60 × 34,36) = 116,4 mm/s',
          ],
          answer: 'F_net = 58,6 kN, v_ext = 79,6 mm/s, v_ret = 116,4 mm/s',
        },
      },
      {
        title: 'Operasi Katup Pelepas Tekanan & Daya Hidrolik',
        summary:
          'Pompa perpindahan tetap menghasilkan debit konstan tanpa mempedulikan beban. Tanpa katup pelepas tekanan (relief valve), silinder yang mentok di akhir langkah atau kelebihan beban akan memecahkan selang. Katup pelepas tetap tertutup di bawah tekanan cracking dan terbuka proporsional untuk membuang kelebihan aliran ke tangki saat tekanan sistem mencapai batas.',
        equations: [
          {
            label: 'Daya Hidrolik',
            formula: 'P_hyd (kW) = (P₁ [bar] × Q_pump [L/min]) / 600',
            note: '100% daya yang melewati katup pelepas berubah langsung menjadi panas oli.',
          },
          {
            label: 'Konservasi Aliran',
            formula: 'Q_pump = Q_actuator + Q_relief',
            note: 'Di akhir langkah (dead-head), Q_actuator = 0 dan Q_relief = Q_pump.',
          },
        ],
        workedExample: {
          title: 'Beban Panas Saat Dead-Heading Melewati Relief',
          given: [
            'Debit pompa Q_pump = 30 L/min',
            'Tekanan cracking relief P_crack = 150 bar',
            'Silinder tertahan di langkah maju penuh (dead-headed)',
          ],
          steps: [
            '1. Karena piston berada di ujung langkah, Q_actuator = 0 L/min.',
            '2. Seluruh debit pompa (30 L/min) melewati katup pelepas pada 150 bar.',
            '3. Daya hidrolik yang berubah menjadi panas: P_hyd = (150 × 30) / 600 = 7,5 kW.',
          ],
          answer: '7,5 kW panas kontinu yang dihasilkan',
        },
      },
      {
        title: 'Kontrol Aliran Meter-Out & Diagnosis Gangguan Hidrolik',
        summary:
          'Kontrol aliran meter-out membatasi oli yang keluar dari sisi rod saat langkah maju, menciptakan tekanan balik terkontrol (P₃) agar beban tidak meluncur bebas sekaligus mengatur kecepatan. Saat mendiagnosis gangguan, teknisi membandingkan pembacaan manometer P₁, P₂, dan P₃ dengan kecepatan aktuator pada posisi Extend, Neutral, dan Retract.',
        equations: [
          {
            label: 'Ciri Relief Macet Terbuka',
            formula: 'P₁ ≤ 15 bar (semua posisi), v ≈ 0 berbeban',
            note: 'Pegas patah atau kotoran menahan poppet terbuka; aliran pompa langsung kembali ke tangki.',
          },
          {
            label: 'Ciri Bypass Seal Internal Piston',
            formula: 'P₂ ≈ P₃ (penyetaraan parsial), melorot di Neutral',
            note: 'Oli bertekanan tinggi bocor melewati seal piston yang aus ke ruang bertekanan rendah.',
          },
          {
            label: 'Ciri Kavitasi Saringan Hisap Tersumbat',
            formula: 'Jarum P₁ bergetar tak menentu, Q_pump ↓ ~40%, pompa berisik',
            note: 'Strainer hisap tersumbat membuat pompa kekurangan oli, memicu gelembung uap dan pitting.',
          },
        ],
        workedExample: {
          title: 'Mendiagnosis Silinder Lambat dan Melorot',
          given: [
            'Teknisi memerintahkan Extend dengan beban 30 kN; relief disetel 160 bar.',
            'Manometer terbaca P₁ = 55 bar, P₂ = 52 bar, P₃ = 36 bar (meter-out terbuka 100%!).',
            'Pada posisi Neutral, silinder perlahan mundur akibat beban 30 kN.',
          ],
          steps: [
            '1. Dengan meter-out terbuka 100%, P₃ seharusnya mendekati tekanan tangki (~2–5 bar), bukan 36 bar.',
            '2. P₃ yang tinggi disertai P₂ yang turun menandakan kebocoran internal melewati piston.',
            '3. Pergeseran (drift) di posisi Neutral memastikan oli bocor melewati seal piston dari sisi cap ke sisi rod.',
          ],
          answer: 'Bypass Seal Internal Silinder (seal piston aus)',
        },
      },
    ],
    practice: [
      {
        id: 'hyd-p1',
        prompt:
          'Silinder hidrolik dengan bore 80 mm (A_cap = 50,27 cm²) dan rod 45 mm (A_ann = 34,36 cm²) bekerja pada P₂ = 140 bar dan P₃ = 10 bar. Hitung gaya maju netto dalam kN.',
        hint: 'Gunakan F_net = (P₂ × A_cap - P₃ × A_ann) / 100.',
        solutionSteps: [
          'Gaya sisi cap = (140 × 50,27) / 100 = 70,38 kN',
          'Gaya tekanan balik rod = (10 × 34,36) / 100 = 3,44 kN',
          'Gaya netto = 70,38 - 3,44 = 66,94 kN',
        ],
      },
      {
        id: 'hyd-p2',
        prompt:
          'Pompa perpindahan tetap mengalirkan 28 L/min sementara katup pelepas terbuka pada 175 bar. Berapa daya hidrolik (kW) yang berubah menjadi panas jika silinder dead-headed?',
        hint: 'Gunakan P_hyd = (P × Q) / 600.',
        solutionSteps: [
          'P_hyd = (175 bar × 28 L/min) / 600',
          'P_hyd = 4900 / 600 = 8,17 kW',
        ],
      },
      {
        id: 'hyd-p3',
        prompt:
          'Dengan debit pompa 24 L/min masuk ke anulus sisi rod (A_ann = 34,36 cm²), hitung kecepatan mundur dalam mm/s.',
        hint: 'Gunakan v = (Q × 10.000) / (60 × A_ann).',
        solutionSteps: [
          'Debit dalam cm³/s = (24 × 1000) / 60 = 400 cm³/s',
          'Kecepatan dalam cm/s = 400 / 34,36 = 11,64 cm/s',
          'Kecepatan dalam mm/s = 116,4 mm/s',
        ],
      },
      {
        id: 'hyd-p4',
        prompt:
          'Anda perlu mengangkat beban resistif 45 kN menggunakan silinder bore 80 mm (A_cap = 50,27 cm²). Abaikan gesekan dan tekanan balik, berapa tekanan minimum sisi cap (bar) yang dibutuhkan?',
        hint: 'P = (F × 100) / A_cap.',
        solutionSteps: [
          'P = (45 kN × 100) / 50,27 cm²',
          'P = 4500 / 50,27 = 89,52 bar',
        ],
      },
      {
        id: 'hyd-p5',
        prompt:
          'Saat langkah maju meter-out, pompa mengalirkan 30 L/min pada 150 bar, dan 18 L/min masuk ke sisi cap silinder. Berapa banyak aliran (L/min) yang terbuang melewati katup pelepas?',
        hint: 'Q_relief = Q_pump - Q_actuator.',
        solutionSteps: [
          'Dengan konservasi aliran: Q_pump = Q_actuator + Q_relief',
          'Q_relief = 30 - 18 = 12 L/min',
        ],
      },
    ],
    quiz: [
      {
        id: 'hyd-q1',
        question:
          'Mengapa silinder kerja ganda batang tunggal bergerak mundur lebih cepat daripada maju pada debit pompa yang sama?',
        options: [
          'Pompa otomatis berputar lebih cepat saat langkah mundur',
          'Luas anulus sisi rod lebih kecil daripada luas penuh bore sisi cap',
          'Katup pelepas menambah aliran saat langkah mundur',
          'Tekanan balik tangki mendorong piston lebih cepat',
        ],
        explanation:
          'Karena v = Q / A dan luas anulus sisi rod (A_cap - A_rod) lebih kecil dari A_cap, debit Q yang sama mengisi volume yang lebih kecil dengan lebih cepat.',
      },
      {
        id: 'hyd-q2',
        question:
          'Pada katup arah 4/3 tandem-center di posisi Neutral, apa yang terjadi pada aliran pompa?',
        options: [
          'Aliran terblokir di port P sehingga katup pelepas terbuka paksa',
          'Aliran bersirkulasi dari P langsung ke T pada tekanan rendah sementara port A dan B tertutup',
          'Aliran terbagi rata ke kedua port silinder A dan B',
          'Motor pompa langsung berhenti',
        ],
        explanation:
          'Spool tandem-center menghubungkan P ke T di posisi netral (unloading pompa pada tekanan rendah) sambil memblokir A dan B untuk menahan beban aktuator.',
      },
      {
        id: 'hyd-q3',
        question:
          'Gejala manometer mana yang paling kuat menandakan Katup Pelepas Tekanan macet terbuka?',
        options: [
          'P1 melonjak di atas 220 bar saat netral',
          'P1 bertahan di sekitar 10–12 bar pada semua beban/posisi DCV dan silinder berhenti',
          'P2 dan P3 keduanya naik ke 180 bar bersamaan',
          'P1 berfluktuasi liar sementara P2 bertahan di 150 bar',
        ],
        explanation:
          'Jika poppet relief macet terbuka, aliran pompa langsung terbuang ke tangki pada tekanan sangat rendah (~10–12 bar), sehingga sistem gagal membangun tekanan.',
      },
      {
        id: 'hyd-q4',
        question:
          'Teknisi mengamati P2 dan P3 cenderung menyama saat langkah maju, kecepatan lambat, dan silinder melorot di Neutral saat berbeban. Apa gangguan yang paling mungkin?',
        options: [
          'Saringan hisap tersumbat',
          'Tekanan cracking relief disetel terlalu tinggi',
          'Bypass seal internal piston silinder',
          'Check valve meter-out terpasang terbalik',
        ],
        explanation:
          'Seal piston yang aus memungkinkan oli bertekanan tinggi bocor secara internal ke ruang sebelahnya, menyamakan P2 dan P3 serta menyebabkan drift di posisi netral.',
      },
      {
        id: 'hyd-q5',
        question:
          'Apa fungsi utama check valve paralel pada rakitan kontrol aliran meter-out?',
        options: [
          'Memungkinkan aliran balik bebas masuk ke sisi rod saat langkah mundur',
          'Menaikkan tekanan cracking katup pelepas',
          'Mencegah kavitasi pompa saat netral',
          'Menggandakan gaya langkah maju',
        ],
        explanation:
          'Meter-out mencekik oli yang keluar dari sisi rod saat maju, sementara check valve bypass terbuka untuk mengalirkan oli secara bebas ke sisi rod saat mundur.',
      },
      {
        id: 'hyd-q6',
        question:
          'Gangguan perawatan mana yang menyebabkan jarum P1 bergetar tak menentu, kehilangan debit ~40%, dan suara pompa berisik?',
        options: [
          'Wiper rod silinder aus',
          'Saringan hisap tersumbat yang menyebabkan kavitasi pompa',
          'Filter jalur balik terlalu besar',
          'Spool DCV tandem-center',
        ],
        explanation:
          'Strainer hisap yang tersumbat membuat inlet pompa kekurangan oli, membentuk gelembung vakum (kavitasi) yang pecah keras dan menyebabkan suara berisik, turunnya debit, dan getaran jarum.',
      },
    ],
  },
  ja: {
    title: '油圧回路＆リリーフ弁シミュレータ',
    shortTitle: '油圧回路',
    description:
      '定容量ポンプ式油圧パワーユニット（HPU）、圧力リリーフ弁、4/3方向切換弁、メータアウト流量制御、および保守故障診断の対話型シミュレータです。',
    explore: [
      {
        title: 'パスカルの原理とシリンダ受圧面積差',
        summary:
          '複動油圧シリンダでは、伸び工程（Extend）で圧油がピストン全面積（A_cap）に作用するのに対し、戻り工程（Retract）ではロッド断面積を差し引いた環状面積（A_ann = A_cap - A_shaft）にのみ作用します。そのため同じポンプ流量でも、伸び側は高推力・低速、戻り側は低推力・高速になります。',
        equations: [
          {
            label: 'キャップ側面積',
            formula: 'A_cap = (π / 4) × D²',
            note: 'D = シリンダ内径（例：80 mm → 50.27 cm²）',
          },
          {
            label: '環状面積（ロッド側）',
            formula: 'A_ann = (π / 4) × (D² - d²)',
            note: 'd = ロッド径（例：45 mm → 34.36 cm²）',
          },
          {
            label: '正味シリンダ推力',
            formula: 'F_ext = (P₂ × A_cap - P₃ × A_ann) / 100',
            note: 'Pがbar、Aがcm²のときFはkN',
          },
          {
            label: 'アクチュエータ速度',
            formula: 'v = (Q × 10,000) / (60 × A)',
            note: 'v [mm/s]、Q [L/min]、A [cm²]',
          },
        ],
        workedExample: {
          title: '伸び推力と戻り速度の計算',
          given: [
            '内径 D = 80 mm (A_cap = 50.27 cm²)、ロッド径 d = 45 mm (A_ann = 34.36 cm²)',
            'ポンプ流量 Q = 24 L/min、キャップ圧 P₂ = 120 bar、ロッド背圧 P₃ = 5 bar',
          ],
          steps: [
            '1. キャップ側推力：F_cap = (120 × 50.27) / 100 = 60.32 kN',
            '2. ロッド側背圧抵抗：F_back = (5 × 34.36) / 100 = 1.72 kN',
            '3. 正味伸び推力：F_net = 60.32 - 1.72 = 58.60 kN',
            '4. 伸び速度：v_ext = (24 × 10,000) / (60 × 50.27) = 79.6 mm/s',
            '5. 戻り速度：v_ret = (24 × 10,000) / (60 × 34.36) = 116.4 mm/s',
          ],
          answer: 'F_net = 58.6 kN、v_ext = 79.6 mm/s、v_ret = 116.4 mm/s',
        },
      },
      {
        title: '圧力リリーフ弁の作動と油圧動力',
        summary:
          '定容量ポンプは負荷に関係なく一定流量を吐出します。リリーフ弁がないと、シリンダのストロークエンド到達時や過負荷時にホースが破裂します。リリーフ弁はクラッキング圧力未満では閉じており、設定圧に達すると比例的に開いて余剰油をタンクへ逃がします。',
        equations: [
          {
            label: '油圧動力',
            formula: 'P_hyd (kW) = (P₁ [bar] × Q_pump [L/min]) / 600',
            note: 'リリーフ弁を通過する動力は100%作動油の発熱に変換されます。',
          },
          {
            label: '流量保存則',
            formula: 'Q_pump = Q_actuator + Q_relief',
            note: 'ストロークエンド（デッドヘッド）時は Q_actuator = 0、Q_relief = Q_pump となります。',
          },
        ],
        workedExample: {
          title: 'リリーフ全量バイパス時の発熱負荷',
          given: [
            'ポンプ流量 Q_pump = 30 L/min',
            'リリーフ設定圧 P_crack = 150 bar',
            'シリンダが全伸び端で保持（デッドヘッド状態）',
          ],
          steps: [
            '1. ピストンが終端にあるため Q_actuator = 0 L/min。',
            '2. ポンプ全流量（30 L/min）が 150 bar でリリーフ弁からタンクへ戻る。',
            '3. 熱に変わる油圧動力：P_hyd = (150 × 30) / 600 = 7.5 kW。',
          ],
          answer: '7.5 kW の連続発熱',
        },
      },
      {
        title: 'メータアウト流量制御と油圧故障診断',
        summary:
          'メータアウト流量制御は伸び工程中にロッド側から排出される油を絞ることで、制御された背圧（P₃）を作り出し、負荷の暴走を防ぎつつ速度を調整します。故障診断では、Extend / Neutral / Retract の各操作で圧力計 P₁・P₂・P₃ と速度を比較します。',
        equations: [
          {
            label: 'リリーフ弁開固着の兆候',
            formula: 'P₁ ≤ 15 bar（全状態）、負荷時に v ≈ 0',
            note: 'ばね破損や異物噛み込みでポペットが開いたままになり、油がタンクへ直結します。',
          },
          {
            label: 'ピストン内部シール漏れ（バイパス）の兆候',
            formula: 'P₂ ≈ P₃（部分均圧）、Neutral で自然降下（ドリフト）',
            note: '摩耗したピストンシールから高圧油が低圧室へ内部リークします。',
          },
          {
            label: '吸込ストレーナ詰まり（キャビテーション）の兆候',
            formula: 'P₁ 針の不安定な脈動、Q_pump 約40%低下、ポンプ異音',
            note: '吸込抵抗増加によりポンプ吸込口で真空気泡が発生・崩壊します。',
          },
        ],
        workedExample: {
          title: '低速で自然降下するシリンダの診断',
          given: [
            '30 kN 負荷で Extend を指令（リリーフ設定 160 bar）。',
            '圧力計は P₁ = 55 bar、P₂ = 52 bar、P₃ = 36 bar（メータアウト100%全開！）。',
            'Neutral にすると、30 kN の負荷でシリンダがゆっくり戻る。',
          ],
          steps: [
            '1. メータアウト全開時は P₃ がタンク圧付近（約2〜5 bar）になるはずで、36 bar は異常です。',
            '2. P₃ 上昇と P₂ 低下の同時発生はピストン越しの内部漏れを示します。',
            '3. Neutral でのドリフトにより、キャップ側からロッド側へのシール漏れが確定します。',
          ],
          answer: 'シリンダ内部シールバイパス（ピストンシール摩耗）',
        },
      },
    ],
    practice: [
      {
        id: 'hyd-p1',
        prompt:
          '内径 80 mm（A_cap = 50.27 cm²）、ロッド径 45 mm（A_ann = 34.36 cm²）の油圧シリンダが P₂ = 140 bar、P₃ = 10 bar で作動しています。正味伸び推力（kN）を計算してください。',
        hint: 'F_net = (P₂ × A_cap - P₃ × A_ann) / 100 を使用します。',
        solutionSteps: [
          'キャップ側推力 = (140 × 50.27) / 100 = 70.38 kN',
          'ロッド背圧抵抗 = (10 × 34.36) / 100 = 3.44 kN',
          '正味推力 = 70.38 - 3.44 = 66.94 kN',
        ],
      },
      {
        id: 'hyd-p2',
        prompt:
          '定容量ポンプが 28 L/min を吐出し、リリーフ弁が 175 bar で開いています。シリンダがデッドヘッド状態のとき、熱に変換される油圧動力（kW）はいくらですか？',
        hint: 'P_hyd = (P × Q) / 600 を使用します。',
        solutionSteps: [
          'P_hyd = (175 bar × 28 L/min) / 600',
          'P_hyd = 4900 / 600 = 8.17 kW',
        ],
      },
      {
        id: 'hyd-p3',
        prompt:
          'ポンプ流量 24 L/min がロッド側環状面積（A_ann = 34.36 cm²）に流入するとき、戻り速度（mm/s）を計算してください。',
        hint: 'v = (Q × 10,000) / (60 × A_ann) を使用します。',
        solutionSteps: [
          '流量換算 = (24 × 1000) / 60 = 400 cm³/s',
          '速度 (cm/s) = 400 / 34.36 = 11.64 cm/s',
          '速度 (mm/s) = 116.4 mm/s',
        ],
      },
      {
        id: 'hyd-p4',
        prompt:
          '内径 80 mm シリンダ（A_cap = 50.27 cm²）で 45 kN の抵抗負荷を持ち上げる必要があります。摩擦と背圧を無視した場合、必要な最小キャップ圧（bar）はいくらですか？',
        hint: 'P = (F × 100) / A_cap を使用します。',
        solutionSteps: [
          'P = (45 kN × 100) / 50.27 cm²',
          'P = 4500 / 50.27 = 89.52 bar',
        ],
      },
      {
        id: 'hyd-p5',
        prompt:
          'メータアウト伸び動作中、ポンプは 150 bar で 30 L/min を吐出し、18 L/min がシリンダのキャップ側へ流入しています。リリーフ弁を通過しているバイパス流量（L/min）はいくらですか？',
        hint: 'Q_relief = Q_pump - Q_actuator を使用します。',
        solutionSteps: [
          '流量保存則より：Q_pump = Q_actuator + Q_relief',
          'Q_relief = 30 - 18 = 12 L/min',
        ],
      },
    ],
    quiz: [
      {
        id: 'hyd-q1',
        question:
          '同じポンプ流量で、片ロッド複動シリンダが伸び側より戻り側の方が速く動く理由は何ですか？',
        options: [
          '戻り工程ではポンプの回転数が自動的に上がるため',
          'ロッド側の環状面積がキャップ側の全面積より小さいため',
          '戻り工程ではリリーフ弁が流量を増幅するため',
          'タンク背圧がピストンを速く押すため',
        ],
        explanation:
          'v = Q / A であり、ロッド側環状面積（A_cap - A_rod）は A_cap より小さいため、同じ流量 Q でも体積充填が速くなります。',
      },
      {
        id: 'hyd-q2',
        question:
          'タンデムセンタ 4/3 方向切換弁が中立（Neutral）位置にあるとき、ポンプ流量はどうなりますか？',
        options: [
          'Pポートが遮断されてデッドヘッドとなり、リリーフ弁が強制開放される',
          'A・Bポートを遮断して負荷を保持しつつ、PからTへ低圧で循環する',
          'シリンダのAポートとBポートに均等に流入する',
          'ポンプモータが即座に停止する',
        ],
        explanation:
          'タンデムセンタスプールは中立時に P→T を接続してポンプを低圧アンロードし、A・Bを遮断してアクチュエータを保持します。',
      },
      {
        id: 'hyd-q3',
        question:
          '圧力リリーフ弁の「開固着（Stuck Open）」を最も強く示す圧力計の症状はどれですか？',
        options: [
          '中立状態で P1 が 220 bar 以上に急上昇する',
          '負荷や DCV 位置に関係なく P1 が約 10〜12 bar に留まり、シリンダが停止する',
          'P2 と P3 が同時に 180 bar まで上昇する',
          'P1 が激しく変動する一方、P2 は 150 bar を維持する',
        ],
        explanation:
          'リリーフポペットが開いたまま固着すると、ポンプ流量が低圧（約10〜12 bar）でタンクへ直結し、負荷を動かす圧力を立てられなくなります。',
      },
      {
        id: 'hyd-q4',
        question:
          '伸び動作中に P2 と P3 が部分的に均圧化し、速度低下と中立時の負荷ドリフト（自然降下）が見られる場合、最も可能性が高い故障はどれですか？',
        options: [
          '吸込ストレーナの詰まり',
          'リリーフ弁クラッキング圧力の設定過大',
          'シリンダピストンシールの内部バイパス漏れ',
          'メータアウト逆止弁の逆向き取付',
        ],
        explanation:
          'ピストンシールが摩耗すると高圧側の油が反対側の室へ内部リークし、P2 と P3 の均圧化および中立時のドリフトを引き起こします。',
      },
      {
        id: 'hyd-q5',
        question:
          'メータアウト流量制御ユニットに並列に組み込まれた逆止弁（チェック弁）の主な目的は何ですか？',
        options: [
          '戻り工程でロッド側へ自由逆流（無絞り流入）を許すため',
          'リリーフ弁のクラッキング圧力を上げるため',
          '中立時のポンプキャビテーションを防ぐため',
          '伸び推力を2倍にするため',
        ],
        explanation:
          'メータアウトは伸び時にロッド側からの排出油を絞りますが、戻り時は並列チェック弁が開いてロッド側へ抵抗なく油を供給します。',
      },
      {
        id: 'hyd-q6',
        question:
          'P1 針の不安定な脈動、約40%の流量低下、およびポンプの異音を引き起こす保守故障はどれですか？',
        options: [
          'シリンダロッドワイパーの摩耗',
          '吸込ストレーナ詰まりによるポンプキャビテーション',
          '戻りラインフィルタの過大サイズ',
          'タンデムセンタ DCV スプール',
        ],
        explanation:
          '吸込ストレーナが詰まるとポンプ吸込側が負圧になり、気泡（キャビテーション）が発生・崩壊して異音・流量低下・圧力脈動を引き起こします。',
      },
    ],
  },
});
