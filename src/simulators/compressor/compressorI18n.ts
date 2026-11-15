import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('compressor', {
  id: {
    title: 'Lab Pemeliharaan Kompresor Udara & Dryer',
    shortTitle: 'Kompresor Udara',
    description:
      'Analisis kompresi 2-tahap & rotary-screw, intercooling, rugi ΔP hisap, kontrol load/unload receiver, titik embun tekan refrigerated dryer, serta ekonomi kebocoran udara pabrik.',
    explore: [
      {
        title: 'Kompresi Isotermal vs. Adiabatik & Intercooling',
        summary:
          'Kompresi gas secara adiabatik menaikkan suhu secara tajam, memperbesar volume spesifik dan kerja poros yang dibutuhkan. Kompresi dua tahap dengan intercooler membagi rasio tekanan total secara merata dan mendinginkan udara kembali mendekati suhu lingkungan di antara tahap, mendekati kompresi isotermal ideal dan mencegah trip suhu tinggi >105 °C.',
        equations: [
          {
            label: 'Tekanan Antartahap Optimal',
            formula: 'P_int = √(P₁ · P₂)',
            note: 'Rasio tekanan yang sama tiap tahap (r_stage = √(P₂/P₁)) meminimalkan kerja total 2-tahap.',
          },
          {
            label: 'Suhu Keluaran Politropik',
            formula: 'T_out = T_in · (P_out / P_in)^((n - 1) / n)',
            note: 'Suhu dalam Kelvin; n ≈ 1,4 untuk adiabatik, n ≈ 1,15–1,30 untuk tahap industri berpendingin.',
          },
          {
            label: 'Efektivitas Intercooler',
            formula: 'ε = (T₁,out − T₂,in) / (T₁,out − T_coolant)',
            note: 'Sirip yang kotor menurunkan ε, menaikkan T₂,in dan mendorong keluaran Tahap-2 melewati batas trip 105 °C.',
          },
        ],
        workedExample: {
          title: 'Tekanan Antartahap Dua-Tahap & Rasio Tahap',
          given: [
            'Tekanan hisap lingkungan P₁ = 1,013 bar(a)',
            'Tekanan keluaran = 7,10 bar(g) → P₂ = 8,113 bar(a)',
          ],
          steps: [
            'Rasio tekanan total: r_p = 8,113 / 1,013 = 8,009.',
            'Tekanan antartahap optimal: P_int = √(1,013 × 8,113) = 2,867 bar(a) (1,854 bar(g)).',
            'Rasio tekanan tiap tahap: r_stage = √8,009 = 2,830 per tahap.',
          ],
          answer: 'P_int = 2,87 bar(a), r_stage = 2,83',
        },
      },
      {
        title: 'ΔP Hisap, Daya Spesifik & Ekonomi Kebocoran',
        summary:
          'Setiap milibar penurunan tekanan pada filter hisap yang tersumbat menurunkan densitas udara masuk kompresor, memangkas Free Air Delivery (FAD) dan memaksa rasio kompresi lebih tinggi. Sementara itu, kebocoran udara pabrik dan pita tekanan unload yang terlalu tinggi membuang energi listrik besar karena kompresor saat unload tetap menarik ~25% daya beban penuh.',
        equations: [
          {
            label: 'Daya Spesifik',
            formula: 'SP = P_avg / Q_delivered  [kW / (m³/min)]',
            note: 'Sistem industri 7 bar yang terawat baik mencapai ~6,0–6,8 kW/(m³/min).',
          },
          {
            label: 'Siklus Tugas Beban (Duty Cycle)',
            formula: 'Duty (%) = ((Q_plant + Q_leaks) / Q_FAD) × 100',
            note: 'Jika total kebutuhan melebihi Q_FAD, tekanan receiver turun di bawah setpoint load.',
          },
          {
            label: 'Biaya Listrik Tahunan',
            formula: 'Cost = P_avg (kW) × Jam/thn × $/kWh',
            note: 'Menurunkan tekanan keluaran sebesar 1 bar umumnya menghemat ~6–8% daya kompresor.',
          },
        ],
        workedExample: {
          title: 'Biaya Tahunan Kebocoran Udara Pabrik',
          given: [
            'Laju kebocoran = 2,4 m³/min (20% dari kompresor 12 m³/min)',
            'Daya spesifik = 6,4 kW / (m³/min)',
            'Jadwal operasi = 6.000 jam/thn pada $0,12/kWh',
          ],
          steps: [
            'Daya terbuang = 2,4 m³/min × 6,4 kW/(m³/min) = 15,36 kW.',
            'Energi terbuang tahunan = 15,36 kW × 6.000 jam = 92.160 kWh/thn.',
            'Biaya tahunan = 92.160 kWh × $0,12/kWh = $11.059/thn.',
          ],
          answer: '$11.059 / tahun terbuang akibat kebocoran',
        },
      },
      {
        title: 'Titik Embun Tekan & Manajemen Kondensat',
        summary:
          'Saat udara dikompresi dan didinginkan di aftercooler serta receiver, uap air mengembun menjadi air cair. Auto-drain trap yang berfungsi membuang kondensat ini tanpa membuang udara. Jika drain macet tertutup, air cair membanjiri receiver dan terbawa (carryover) ke refrigerated air dryer, menaikkan Pressure Dew Point (PDP) dan memicu korosi pada peralatan pneumatik.',
        equations: [
          {
            label: 'Pressure Dew Point (Refrigerated Dryer)',
            formula: 'Target PDP ≈ +2 °C hingga +4 °C pada tekanan jalur',
            note: 'Mencegah kondensasi di dalam pipa pabrik indoor hingga suhu ruang +4 °C.',
          },
          {
            label: 'Beban Termal Aftercooler',
            formula: 'ΔT_dryer_in = T_aftercooler_out − T_desain (38–42 °C)',
            note: 'Cooler yang kotor mengirim udara panas (>45 °C) ke dryer sehingga membebani chiller dan menaikkan PDP.',
          },
        ],
        workedExample: {
          title: 'Mendiagnosis Pressure Dew Point Tinggi',
          given: [
            'Level kondensat receiver = 95% (terus naik)',
            'Suhu keluaran aftercooler = 31 °C (normal)',
            'PDP Dryer = 22,0 °C (normalnya 3,0 °C)',
          ],
          steps: [
            'Suhu keluaran aftercooler normal (31 °C), menyingkirkan dugaan beban termal berlebih akibat cooler kotor.',
            'Level kondensat receiver di 95% menunjukkan katup auto-drain macet tertutup.',
            'Air cair yang terbawa (carryover) membanjiri separator dryer sehingga PDP melonjak ke 22 °C.',
          ],
          answer: 'Auto-Drain Kondensat Gagal (Water Carryover)',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Kompresor udara 2-tahap menghisap udara pada P₁ = 1,0 bar(a) dan mengeluarkan pada P₂ = 9,0 bar(a). Hitung tekanan antartahap optimal P_int dalam bar(a) yang meminimalkan kerja kompresi total.',
        hint: 'Gunakan P_int = √(P₁ × P₂).',
        solutionSteps: [
          'Tekanan antartahap optimal menyeimbangkan rasio tahap: P_int = √(P₁ × P₂).',
          'P_int = √(1,0 × 9,0) = √9,0 = 3,0 bar(a).',
        ],
      },
      {
        prompt:
          'Kompresor berkapasitas 12,0 m³/min FAD pada 101,3 kPa mengalami penurunan tekanan 8,0 kPa (80 mbar) akibat filter hisap tersumbat sehingga tekanan hisap turun ke 93,3 kPa. Estimasi FAD aktual (m³/min) dengan penskalaan densitas linear (Q_actual = Q_rated × P₁ / P_atm).',
        hint: 'Kalikan 12,0 dengan (93,3 / 101,3).',
        solutionSteps: [
          'Rasio densitas hisap = P₁ / P_atm = 93,3 / 101,3 = 0,9210.',
          'FAD aktual = 12,0 × 0,9210 = 11,05 m³/min.',
        ],
      },
      {
        prompt:
          'Audit pabrik mengukur kebocoran udara tekan sebesar 3,6 m³/min pada sistem dengan daya spesifik 6,5 kW/(m³/min). Jika pabrik beroperasi 6.000 jam/tahun dengan tarif $0,12/kWh, berapa biaya ($/thn) yang terbuang akibat kebocoran?',
        hint: 'Daya (kW) = laju bocor × daya spesifik; Biaya = Daya × 6.000 × 0,12.',
        solutionSteps: [
          'Daya terbuang = 3,6 m³/min × 6,5 kW/(m³/min) = 23,4 kW.',
          'Energi tahunan = 23,4 kW × 6.000 jam = 140.400 kWh/thn.',
          'Biaya tahunan = 140.400 × $0,12 = $16.848/thn.',
        ],
      },
      {
        prompt:
          'Kompresor menyuplai 12,0 m³/min FAD. Peralatan proses memakai 7,2 m³/min dan kebocoran pabrik membuang 1,8 m³/min. Hitung siklus tugas beban (duty cycle) kompresor (%).',
        hint: 'Duty (%) = ((Q_proses + Q_bocor) / Q_FAD) × 100.',
        solutionSteps: [
          'Total kebutuhan udara = 7,2 + 1,8 = 9,0 m³/min.',
          'Duty cycle = (9,0 / 12,0) × 100% = 75%.',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Mengapa kompresor udara 2-tahap menggunakan intercooler di antara tahap pertama dan kedua?',
        options: [
          'Menurunkan suhu dan volume spesifik udara sebelum Tahap 2, mengurangi kerja poros total dan suhu keluaran',
          'Menaikkan rasio tekanan Tahap 1 di atas Tahap 2',
          'Membekukan uap air menjadi kristal es sebelum tangki receiver',
          'Menghilangkan kebutuhan filter udara hisap',
        ],
        explanation:
          'Intercooling membuang panas antartahap sehingga Tahap 2 mengompresi udara yang lebih padat dan dingin—mengurangi kerja total mendekati kompresi isotermal dan menjaga suhu di bawah batas trip.',
      },
      {
        question:
          'Gejala mana yang paling kuat mengindikasikan intercooler/aftercooler kotor dibandingkan filter hisap tersumbat?',
        options: [
          'ΔP vakum hisap tinggi (>50 mbar) dengan suhu keluaran normal',
          'Suhu keluaran trip di atas 105 °C dan titik embun tekan dryer meningkat',
          'Level kondensat receiver mencapai 100% sementara keluaran aftercooler tetap 30 °C',
          'Kompresor tetap dalam kondisi unload 90% waktu operasi',
        ],
        explanation:
          'Pengotoran cooler menghambat pelepasan panas, menyebabkan suhu keluaran Tahap-2 melewati 105 °C dan mengirim udara terlalu panas ke refrigerated dryer.',
      },
      {
        question:
          'Apa yang terjadi di hilir ketika auto-drain kondensat pada tangki receiver macet tertutup?',
        options: [
          'ΔP filter hisap langsung turun menjadi nol',
          'Air cair menumpuk di receiver dan terbawa ke refrigerated dryer sehingga Pressure Dew Point melonjak',
          'Tekanan unload kompresor otomatis naik 2 bar',
          'Daya spesifik turun di bawah 4,0 kW/(m³/min)',
        ],
        explanation:
          'Tanpa pembuangan berkala, kondensat memenuhi receiver dan membanjiri pipa hilir serta dryer, menyebabkan water carryover dan PDP tinggi.',
      },
      {
        question:
          'Mengapa menaikkan pita tekanan Load/Unload secara tidak perlu (misalnya dari 6,8–7,5 bar ke 8,0–8,8 bar) meningkatkan biaya energi pabrik?',
        options: [
          'Tekanan lebih tinggi menaikkan rasio kompresi (kW per m³/min lebih besar) DAN memperbesar laju kebocoran melalui lubang yang ada',
          'Tekanan lebih tinggi membuat refrigerated dryer tidak memakai daya',
          'Tekanan lebih tinggi menurunkan duty cycle kompresor menjadi 0%',
          'Tekanan lebih tinggi menurunkan suhu antartahap',
        ],
        explanation:
          'Baik daya spesifik maupun laju kebocoran naik seiring tekanan sistem—setiap penurunan 1 bar tekanan header umumnya menghemat 6–8% energi.',
      },
      {
        question:
          'Kompresor pabrik berjalan pada duty cycle 98%, tekanan receiver turun di bawah setpoint load, namun suhu keluaran 84 °C dan ΔP hisap 14 mbar. Apa penyebab paling mungkin?',
        options: [
          'Filter hisap tersumbat',
          'Intercooler kotor',
          'Kebocoran udara pabrik berlebih atau kebutuhan melebihi FAD kompresor',
          'Auto-drain kondensat gagal',
        ],
        explanation:
          'Suhu normal dan ΔP hisap rendah menyingkirkan cooler kotor dan filter tersumbat; duty cycle mendekati 100% dengan tekanan merosot mengarah ke kebocoran berlebih.',
      },
      {
        question:
          'Berapa target Pressure Dew Point (PDP) tipikal untuk refrigerated compressed-air dryer industri?',
        options: ['−40 °C', '+2 °C hingga +4 °C', '+22 °C', '+65 °C'],
        explanation:
          'Refrigerated dryer mendinginkan udara tekan tepat di atas titik beku (+2 °C hingga +4 °C PDP) untuk mengembunkan uap air tanpa membekukan penukar kalor.',
      },
    ],
  },
  ja: {
    title: '空気圧縮機・エアドライヤ保守ラボ',
    shortTitle: '空気圧縮機',
    description:
      '2段／スクリュー圧縮、インタークーリング、吸込ΔP損失、レシーバのロード／アンロード制御、冷凍式ドライヤの圧力露点、工場エア漏れコストを解析します。',
    explore: [
      {
        title: '等温圧縮・断熱圧縮とインタークーリング',
        summary:
          '気体を断熱圧縮すると温度が急上昇し、比体積と必要軸動力が増大します。インタークーラ付き2段圧縮では全圧力比を均等に分割し、段間で外気温度付近まで冷却することで理想的な等温圧縮に近づけ、105 °C超の高温トリップを防ぎます。',
        equations: [
          {
            label: '最適中間圧力',
            formula: 'P_int = √(P₁ · P₂)',
            note: '各段の圧力比を等しくする（r_stage = √(P₂/P₁)）ことで2段総動力が最小になります。',
          },
          {
            label: 'ポリトロープ吐出温度',
            formula: 'T_out = T_in · (P_out / P_in)^((n - 1) / n)',
            note: '温度は絶対温度[K]。断熱では n ≈ 1.4、冷却付き産業用圧縮段では n ≈ 1.15–1.30。',
          },
          {
            label: 'インタークーラ温度効率',
            formula: 'ε = (T₁,out − T₂,in) / (T₁,out − T_coolant)',
            note: 'フィン汚れにより ε が低下すると T₂,in が上昇し、2段目吐出が105 °Cトリップ限界を超えます。',
          },
        ],
        workedExample: {
          title: '2段圧縮の最適中間圧力と段圧力比',
          given: [
            '大気吸込圧力 P₁ = 1.013 bar(a)',
            '吐出圧力 = 7.10 bar(g) → P₂ = 8.113 bar(a)',
          ],
          steps: [
            '全圧力比: r_p = 8.113 / 1.013 = 8.009',
            '最適中間圧力: P_int = √(1.013 × 8.113) = 2.867 bar(a) (1.854 bar(g))',
            '各段の圧力比: r_stage = √8.009 = 2.830 /段',
          ],
          answer: 'P_int = 2.87 bar(a), r_stage = 2.83',
        },
      },
      {
        title: '吸込ΔP・比動力とエア漏れ経済性',
        summary:
          '吸込フィルタの目詰まりによる圧力損失は、吸込空気密度を下げて吐出空気量（FAD）を減少させ、圧縮比を増大させます。一方、工場配管のエア漏れや過大なアンロード圧力設定は、アンロード時でも全負荷の約25%の電力を消費するため大きな電力損失を生みます。',
        equations: [
          {
            label: '比動力 (Specific Power)',
            formula: 'SP = P_avg / Q_delivered  [kW / (m³/min)]',
            note: '良好に保守された7 bar産業用システムでは約 6.0–6.8 kW/(m³/min) です。',
          },
          {
            label: '負荷率 (Duty Cycle)',
            formula: 'Duty (%) = ((Q_plant + Q_leaks) / Q_FAD) × 100',
            note: '総需要が Q_FAD を超えると、レシーバ圧力がロード設定値以下に低下します。',
          },
          {
            label: '年間電力量コスト',
            formula: 'Cost = P_avg (kW) × 年間運転時間 × $/kWh',
            note: '吐出圧力を 1 bar 下げると圧縮機動力は通常 約6–8% 削減できます。',
          },
        ],
        workedExample: {
          title: '工場エア漏れの年間損失コスト',
          given: [
            '漏れ流量 = 2.4 m³/min（12 m³/min機の20%）',
            '比動力 = 6.4 kW / (m³/min)',
            '年間運転 = 6,000時間/年、電力単価 $0.12/kWh',
          ],
          steps: [
            '損失動力 = 2.4 m³/min × 6.4 kW/(m³/min) = 15.36 kW',
            '年間損失電力量 = 15.36 kW × 6,000時間 = 92,160 kWh/年',
            '年間損失コスト = 92,160 kWh × $0.12/kWh = $11,059/年',
          ],
          answer: '$11,059 / 年の漏れ損失',
        },
      },
      {
        title: '圧力露点とドレン（凝縮水）管理',
        summary:
          '圧縮空気をアフタークーラとレシーバで冷却すると水蒸気が凝縮してドレンになります。正常なオートドレントラップは空気を逃がさずドレンだけを排出します。トラップが閉固着するとレシーバが満水になり、冷凍式ドライヤへキャリーオーバーして圧力露点（PDP）が急上昇し下流機器の腐食を招きます。',
        equations: [
          {
            label: '圧力露点（冷凍式ドライヤ）',
            formula: '目標 PDP ≈ +2 °C 〜 +4 °C（ライン圧力下）',
            note: '屋内工場配管内（+4 °C以上）での結露を防止します。',
          },
          {
            label: 'アフタークーラ熱負荷',
            formula: 'ΔT_dryer_in = T_aftercooler_out − T_design (38–42 °C)',
            note: 'クーラ汚れで高温空気（>45 °C）がドライヤに入ると冷凍機が過負荷となりPDPが上昇します。',
          },
        ],
        workedExample: {
          title: '高圧力露点（PDP）の診断',
          given: [
            'レシーバドレン水位 = 95%（上昇中）',
            'アフタークーラ出口温度 = 31 °C（正常）',
            'ドライヤ PDP = 22.0 °C（正常値 3.0 °C）',
          ],
          steps: [
            'アフタークーラ出口が31 °Cで正常なため、クーラ汚れによる熱過負荷は除外されます。',
            'レシーバのドレン水位95%はオートドレン弁の閉固着を示しています。',
            '液水のキャリーオーバーによりドライヤのセパレータが飽和し、PDPが22 °Cへ急上昇しています。',
          ],
          answer: 'オートドレン故障（水キャリーオーバー）',
        },
      },
    ],
    practice: [
      {
        prompt:
          '2段空気圧縮機が P₁ = 1.0 bar(a) で吸込み、P₂ = 9.0 bar(a) で吐出します。全圧縮仕事を最小化する最適中間圧力 P_int [bar(a)] を求めてください。',
        hint: 'P_int = √(P₁ × P₂) を使用します。',
        solutionSteps: [
          '最適中間圧力は各段の圧力比を等しくします: P_int = √(P₁ × P₂)。',
          'P_int = √(1.0 × 9.0) = √9.0 = 3.0 bar(a)。',
        ],
      },
      {
        prompt:
          '101.3 kPa で定格 FAD 12.0 m³/min の圧縮機が、吸込フィルタ目詰まりにより 8.0 kPa（80 mbar）の圧力損失を受け、吸込圧力が 93.3 kPa に低下しました。線形密度スケーリング（Q_actual = Q_rated × P₁ / P_atm）を用いて低下後の FAD [m³/min] を推定してください。',
        hint: '12.0 に (93.3 / 101.3) を掛けます。',
        solutionSteps: [
          '吸込密度比 = P₁ / P_atm = 93.3 / 101.3 = 0.9210。',
          '低下後 FAD = 12.0 × 0.9210 = 11.05 m³/min。',
        ],
      },
      {
        prompt:
          '工場監査で、比動力 6.5 kW/(m³/min) のシステムから 3.6 m³/min のエア漏れが計測されました。年間 6,000時間運転、電力単価 $0.12/kWh の場合、漏れによる年間損失額 [$/yr] はいくらですか。',
        hint: '損失動力 (kW) = 漏れ流量 × 比動力；年間損失 = 動力 × 6,000 × 0.12。',
        solutionSteps: [
          '損失動力 = 3.6 m³/min × 6.5 kW/(m³/min) = 23.4 kW。',
          '年間電力量 = 23.4 kW × 6,000時間 = 140,400 kWh/年。',
          '年間損失額 = 140,400 × $0.12 = $16,848/年。',
        ],
      },
      {
        prompt:
          '圧縮機が 12.0 m³/min FAD を供給しています。生産設備が 7.2 m³/min を消費し、工場漏れが 1.8 m³/min あります。圧縮機の負荷率（Duty Cycle）[%] を計算してください。',
        hint: 'Duty (%) = ((Q_process + Q_leaks) / Q_FAD) × 100。',
        solutionSteps: [
          '総需要空気量 = 7.2 + 1.8 = 9.0 m³/min。',
          '負荷率 = (9.0 / 12.0) × 100% = 75%。',
        ],
      },
    ],
    quiz: [
      {
        question:
          '2段空気圧縮機が1段目と2段目の間にインタークーラを備える理由は何ですか？',
        options: [
          '2段目吸込前に空気温度と比体積を下げ、総軸動力と吐出温度を低減するため',
          '1段目の圧力比を2段目より大きくするため',
          'レシーバタンク手前で水蒸気を氷晶にするため',
          '吸込エアフィルタを不要にするため',
        ],
        explanation:
          'インタークーリングにより段間で放熱し、2段目がより低温・高密度の空気を圧縮できるため、等温圧縮に近づき吐出温度をトリップ限界以下に抑えられます。',
      },
      {
        question:
          '吸込フィルタの目詰まりではなく、インタークーラ／アフタークーラの汚れを強く示す症状はどれですか？',
        options: [
          '吸込負圧 ΔP が高い（>50 mbar）が吐出温度は正常',
          '吐出温度が 105 °C を超えてトリップし、ドライヤの圧力露点も上昇する',
          'アフタークーラ出口は 30 °C だがレシーバのドレン水位が 100% に達する',
          '圧縮機が運転時間の 90% アンロード状態になる',
        ],
        explanation:
          'クーラの汚れは放熱を妨げるため、2段目吐出温度が 105 °C を超えてトリップし、高温空気が冷凍式ドライヤに送り込まれます。',
      },
      {
        question:
          'エアレシーバのオートドレンが閉固着すると下流で何が起きますか？',
        options: [
          '吸込フィルタの ΔP が即座にゼロになる',
          'レシーバに液水が溜まり冷凍式ドライヤへキャリーオーバーして圧力露点が急上昇する',
          '圧縮機のアンロード圧力が自動的に 2 bar 上昇する',
          '比動力が 4.0 kW/(m³/min) 未満に低下する',
        ],
        explanation:
          '定期排出が止まるとドレンがレシーバを満たして下流配管やドライヤへ溢れ出し、水キャリーオーバーと露点上昇を引き起こします。',
      },
      {
        question:
          'ロード／アンロード圧力帯を不必要に高く設定すると（例：6.8–7.5 bar から 8.0–8.8 bar）工場の電力コストが増える理由は？',
        options: [
          '高圧化により圧縮比（kW per m³/min）が増えるうえ、既存の漏れ箇所からの漏れ流量も増大するため',
          '高圧化により冷凍式ドライヤの消費電力がゼロになるため',
          '高圧化により圧縮機の負荷率が 0% になるため',
          '高圧化により段間温度が下がるため',
        ],
        explanation:
          '比動力と漏れ流量はいずれも系統圧力とともに上昇します。ヘッダ圧力を 1 bar 下げるごとに通常 6–8% の省エネになります。',
      },
      {
        question:
          '負荷率 98%、レシーバ圧力がロード設定値以下に低下しているにもかかわらず、吐出温度は 84 °C、吸込 ΔP は 14 mbar で正常です。最も可能性が高い原因は？',
        options: [
          '吸込フィルタの目詰まり',
          'インタークーラの汚れ',
          '工場配管の過大なエア漏れ、または需要が圧縮機 FAD を超過',
          'オートドレン故障',
        ],
        explanation:
          '温度正常・低ΔPによりクーラ汚れとフィルタ詰まりは除外され、100%近い負荷率と圧力低下は過大なエア漏れを示します。',
      },
      {
        question:
          '産業用冷凍式圧縮空気ドライヤの一般的な目標圧力露点（PDP）はどれですか？',
        options: ['−40 °C', '+2 °C 〜 +4 °C', '+22 °C', '+65 °C'],
        explanation:
          '冷凍式ドライヤは熱交換器が凍結しないよう氷点直上（+2 °C 〜 +4 °C PDP）まで冷却して除湿します。',
      },
    ],
  },
});
