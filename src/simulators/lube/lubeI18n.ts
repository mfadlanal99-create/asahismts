import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('lube', {
  id: {
    title: 'Lab Pelumasan Industri & Analisis Oli',
    shortTitle: 'Pelumasan & Oli',
    description:
      'Evaluasi grade oli ISO VG pada berbagai suhu operasi, analisis ketebalan film EHL (rasio lambda), pecahkan kode kebersihan ISO 4406, diagnosis laporan lab oli bekas, dan hitung pelumasan ulang gemuk.',
    explore: [
      {
        title: 'Grade ISO VG & Perilaku Viskositas–Suhu',
        summary:
          'ISO 3448 mengklasifikasikan pelumas industri berdasarkan viskositas kinematiknya (dalam cSt = mm²/s) pada 40 °C dengan pita toleransi ±10%. Karena oli menipis secara eksponensial saat suhu naik, teknisi menggunakan persamaan Walther ASTM D341 untuk memastikan viskositas operasi tetap di dalam jendela target peralatan.',
        equations: [
          {
            label: 'Persamaan Walther (ASTM D341)',
            formula: 'log10(log10(ν + 0.7)) = A − B · log10(T + 273.15)',
            note: 'ν dalam cSt (mm²/s), T dalam °C; A dan B adalah konstanta spesifik oli dari ν40 dan ν100',
          },
          {
            label: 'Toleransi Grade ISO 3448',
            formula: 'ν_40 ∈ [0.90 · VG, 1.10 · VG]',
            note: 'mis., ISO VG 220 mencakup 198 hingga 242 cSt pada 40 °C',
          },
        ],
        workedExample: {
          title: 'Memeriksa Viskositas Operasi ISO VG 220 pada Gearbox Helikal',
          given: [
            'Grade oli: ISO VG 220 (ν40 = 220 cSt, ν100 = 19.0 cSt)',
            'Suhu sump gearbox: T = 70 °C',
            'Jendela operasi target gearbox: 25–90 cSt',
          ],
          steps: [
            'Konversi suhu referensi ke Kelvin: T1 = 313.15 K, T2 = 373.15 K, T_op = 343.15 K.',
            'Hitung parameter Walther: W1 = log10(log10(220.7)) = 0.3699, W2 = log10(log10(19.7)) = 0.1121.',
            'Interpolasi W(343.15 K) ≈ 0.2336 → ν(70 °C) = 10^(10^0.2336) − 0.7 ≈ 51.0 cSt.',
          ],
          answer: 'ν(70 °C) ≈ 51.0 cSt — tepat berada di dalam jendela gearbox helikal 25–90 cSt.',
        },
      },
      {
        title: 'Ketebalan Film EHL, Rasio Lambda (λ) & Rezim Keausan',
        summary:
          'Pelumasan elastohidrodinamik (EHL) memisahkan bantalan gelinding dan gigi roda dengan film oli bertekanan mikroskopis. Rasio lambda (λ) membandingkan ketebalan film minimum h_min terhadap kekasaran permukaan gabungan σ, yang menentukan umur kelelahan dan mode keausan.',
        equations: [
          {
            label: 'Kekasaran Permukaan RMS Gabungan',
            formula: 'σ = √(Rq1² + Rq2²)',
            note: 'Rq1, Rq2 adalah kekasaran RMS permukaan berpasangan (μm)',
          },
          {
            label: 'Rasio Film Lambda',
            formula: 'λ = h_min / σ',
            note: 'λ ≥ 3: Full-Film EHL | 1.5 ≤ λ < 3: Campuran | 1 ≤ λ < 1.5: Marginal | λ < 1: Batas',
          },
        ],
        workedExample: {
          title: 'Evaluasi Rezim Film Bantalan di Bawah Kontaminasi Air',
          given: [
            'Ketebalan film EHL bersih: h_min = 0.68 μm',
            'Kekasaran gabungan lintasan/rol bantalan: σ = 0.24 μm',
            'Masuknya air (1200 ppm) menurunkan film efektif sebesar 30%',
          ],
          steps: [
            'Ketebalan film efektif: h_eff = 0.68 × (1 − 0.30) = 0.476 μm.',
            'Hitung rasio lambda: λ = 0.476 / 0.24 = 1.98.',
            'Bandingkan dengan ambang rezim: 1.5 ≤ 1.98 < 3.0.',
          ],
          answer: 'λ = 1.98 (Pelumasan Campuran) — kontak asperitas sesekali; dehidrasi oli untuk memulihkan λ > 2.5.',
        },
      },
      {
        title: 'Kode Kebersihan ISO 4406 & Kontrol Kontaminasi',
        summary:
          'ISO 4406 menyatakan kontaminasi partikel padat sebagai tiga angka rentang (X/Y/Z) yang mewakili jumlah per mililiter pada ≥4 μm, ≥6 μm, dan ≥14 μm. Setiap kenaikan +1 langkah kode menggandakan konsentrasi partikel.',
        equations: [
          {
            label: 'Format 3-Digit ISO 4406',
            formula: 'Kode = R(≥4 μm) / R(≥6 μm) / R(≥14 μm)',
            note: 'Setiap +1 langkah kode = 2× konsentrasi partikel per mL',
          },
          {
            label: 'Aturan Penggandaan Kode-ke-Jumlah',
            formula: 'N_baru = N_lama · 2^(ΔKode)',
            note: 'Penurunan dari 20/18/15 ke 17/15/12 menghilangkan 87.5% partikel (8× lebih bersih)',
          },
        ],
        workedExample: {
          title: 'Mengukur Peningkatan Filtrasi pada Unit Daya Hidrolik',
          given: [
            'Kebersihan oli saat ini: ISO 20/18/15 (5,000–10,000 partikel/mL ≥4 μm)',
            'Target servo hidrolik: ISO 17/15/12',
          ],
          steps: [
            'Hitung penurunan kode: ΔKode = 20 − 17 = 3 langkah di ketiga saluran.',
            'Hitung faktor pengurangan: 2³ = 8× lebih sedikit partikel.',
            'Persentase yang dihilangkan: (1 − 1/8) × 100% = 87.5%.',
          ],
          answer: 'Mencapai 17/15/12 mengurangi konsentrasi partikel sebesar 8× (pengurangan 87.5%).',
        },
      },
      {
        title: 'Rumus Pelumasan Ulang Gemuk & Umur Oli Termal Arrhenius',
        summary:
          'Gemuk berlebih menyebabkan churning dan jebolnya seal, sedangkan kekurangan gemuk membuat bantalan kering. Rumus massa standar industri menentukan takaran tepat dalam gram, sementara aturan Arrhenius memprediksi percepatan oksidasi oli akibat suhu.',
        equations: [
          {
            label: 'Jumlah Pelumasan Ulang Gemuk',
            formula: 'G = 0.005 · D · B',
            note: 'G dalam gram, diameter luar bantalan D dalam mm, lebar bantalan B dalam mm',
          },
          {
            label: 'Aturan Oksidasi Arrhenius',
            formula: 'L(T) = L_60 · 0.5^((T − 60) / 10)',
            note: 'Umur oksidasi oli berkurang setengah setiap kenaikan +10 °C di atas 60 °C',
          },
        ],
        workedExample: {
          title: 'Menghitung Takaran Gemuk untuk Bantalan Pompa 6312',
          given: ['Diameter luar bantalan: D = 130 mm', 'Lebar bantalan: B = 31 mm'],
          steps: [
            'Terapkan rumus massa pelumasan ulang standar: G = 0.005 × D × B.',
            'G = 0.005 × 130 × 31 = 0.65 × 31 = 20.15 g.',
          ],
          answer: '20.2 gram gemuk per interval pelumasan ulang.',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Hitung jumlah pelumasan ulang gemuk G (dalam gram) untuk bantalan gelinding dengan diameter luar D = 140 mm dan lebar B = 33 mm menggunakan G = 0.005 · D · B.',
        hint: 'Kalikan 0.005 × 140 × 33.',
        solutionSteps: [
          'Gunakan persamaan massa pelumasan ulang standar: G = 0.005 · D · B.',
          'Substitusikan D = 140 mm dan B = 33 mm: G = 0.005 × 140 × 33.',
          'G = 0.70 × 33 = 23.1 g.',
        ],
      },
      {
        prompt:
          'Sebuah bantalan pompa memiliki kekasaran permukaan RMS berpasangan Rq1 = 0.24 μm dan Rq2 = 0.18 μm, serta ketebalan film EHL h_min = 0.78 μm. Hitung rasio lambda (λ).',
        hint: 'Pertama cari kekasaran gabungan σ = √(Rq1² + Rq2²), lalu hitung λ = h_min / σ.',
        solutionSteps: [
          'Hitung kekasaran gabungan: σ = √(0.24² + 0.18²) = √(0.0576 + 0.0324) = √0.09 = 0.30 μm.',
          'Hitung rasio lambda: λ = h_min / σ = 0.78 / 0.30 = 2.60.',
        ],
      },
      {
        prompt:
          'Oli roda gigi mineral memiliki umur layanan dasar 8,000 jam pada 60 °C. Menggunakan aturan Arrhenius (umur berkurang setengah setiap +10 °C di atas 60 °C), perkirakan umur layanan (dalam jam) jika gearbox beroperasi terus-menerus pada 80 °C.',
        hint: 'Kenaikan suhu di atas 60 °C adalah 20 °C, yaitu dua langkah pemotongan setengah 10 °C.',
        solutionSteps: [
          'Kenaikan suhu di atas 60 °C: ΔT = 80 − 60 = 20 °C.',
          'Jumlah langkah pemotongan setengah: n = 20 / 10 = 2.',
          'Sisa umur oli: L = 8,000 × (0.5)² = 8,000 × 0.25 = 2,000 jam.',
        ],
      },
      {
        prompt:
          'ISO 3448 mengizinkan toleransi viskositas ±10% pada 40 °C di sekitar grade nominal ISO VG. Berapa viskositas minimum yang dapat diterima pada 40 °C (dalam cSt) untuk oli ISO VG 220 baru?',
        hint: 'Kurangi 10% dari 220 cSt (kalikan dengan 0.90).',
        solutionSteps: [
          'Batas toleransi bawah ISO 3448 adalah 0.90 × VG nominal.',
          'ν_min = 0.90 × 220 = 198 cSt.',
        ],
      },
      {
        prompt:
          'Sampel oli memiliki kode kebersihan ISO 4406 sebesar 20/18/15. Setelah memasang filter kidney-loop, jumlah partikel ≥4 μm turun sebesar faktor 8. Berapa digit pertama baru (kode ≥4 μm) dari kode ISO 4406?',
        hint: 'Setiap langkah -1 pada kode ISO 4406 membelah dua jumlah partikel; faktor 8 = 2³.',
        solutionSteps: [
          'Setiap langkah kode ISO 4406 mewakili faktor 2 dalam konsentrasi partikel.',
          'Pengurangan 8× sama dengan 2³ → 3 langkah kode lebih rendah.',
          'Kode ≥4 μm baru = 20 − 3 = 17.',
        ],
      },
    ],
    quiz: [
      {
        question: 'Apa yang ditentukan oleh angka "220" pada ISO VG 220?',
        options: [
          'Viskositas kinematik ~220 cSt pada 40 °C (±10%)',
          'Viskositas dinamik 220 cP pada 100 °C',
          'Suhu operasi aman maksimum 220 °F',
          'Indeks Viskositas (VI) minimum sebesar 220',
        ],
        explanation:
          'ISO 3448 mendefinisikan grade ISO VG berdasarkan viskositas kinematik titik tengahnya dalam cSt (mm²/s) pada 40 °C dengan pita toleransi ±10%.',
      },
      {
        question:
          'Bantalan gelinding yang beroperasi pada λ = 0.75 berada dalam rezim pelumasan apa?',
        options: [
          'Pelumasan batas (boundary) — kontak logam-ke-logam langsung dan keausan tinggi',
          'Full-film EHL — pemisahan sempurna antar permukaan',
          'Baji hidrodinamik — rugi churning berlebih',
          'Pelumasan campuran optimal — tanpa risiko kelelahan',
        ],
        explanation:
          'Ketika λ = h_min / σ < 1.0, film oli lebih tipis dari kekasaran permukaan gabungan sehingga terjadi kontak asperitas langsung (pelumasan batas).',
      },
      {
        question:
          'Dalam kode kebersihan ISO 4406 seperti 18/16/13, apa arti ketiga angka tersebut?',
        options: [
          'Kode rentang jumlah partikel per mL pada ≥4 μm, ≥6 μm, dan ≥14 μm',
          'Persentase air, jelaga, dan serpihan keausan besi',
          'Viskositas oli dasar pada 40 °C, 70 °C, dan 100 °C',
          'Jam operasi maksimum yang diizinkan dalam ribuan',
        ],
        explanation:
          'ISO 4406 melaporkan jumlah partikel per mililiter pada tiga ambang ukuran kumulatif: ≥4 μm(c), ≥6 μm(c), dan ≥14 μm(c).',
      },
      {
        question:
          'Bagaimana kenaikan suhu oli dari 60 °C ke 80 °C memengaruhi umur oksidasi oli mineral menurut aturan Arrhenius?',
        options: [
          'Umur oksidasi turun menjadi sekitar 25% (terpotong setengah dua kali)',
          'Umur oksidasi turun sebesar 20%',
          'Umur oksidasi berlipat ganda karena viskositas lebih rendah',
          'Umur oksidasi tidak terpengaruh di bawah 100 °C',
        ],
        explanation:
          'Menurut aturan laju Arrhenius, laju oksidasi kimia berlipat ganda setiap kenaikan 10 °C di atas 60 °C. +20 °C = (0.5)² = 25% umur.',
      },
      {
        question:
          'Mengapa air bebas/teremulsi (mis., >1000 ppm) sangat merusak bantalan gelinding?',
        options: [
          'Meruntuhkan kekuatan film EHL, menyebabkan korosi, dan memicu kerapuhan hidrogen',
          'Menaikkan grade ISO VG secara permanen sebanyak dua tingkat',
          'Meningkatkan perpindahan panas dan memperpanjang umur L10 bantalan',
          'Melarutkan aditif EP menjadi gas nitrogen yang tidak berbahaya',
        ],
        explanation:
          'Air tidak dapat membentuk film tekanan-viskositas EHL seperti oli mineral; air menyebabkan keruntuhan film lokal, karat, pencucian aditif, dan pengelupasan akibat hidrogen.',
      },
      {
        question:
          'Dalam rumus pelumasan ulang gemuk G = 0.005 · D · B, apa yang diwakili oleh D dan B?',
        options: [
          'Diameter luar bantalan (mm) dan lebar bantalan (mm)',
          'Diameter poros (inci) dan lubang rumah (inci)',
          'Grade NLGI gemuk dan viskositas oli dasar (cSt)',
          'RPM operasi dan suhu lingkungan (°C)',
        ],
        explanation:
          'G = 0.005 · D · B memberikan jumlah gemuk pelumasan ulang dalam gram menggunakan diameter luar bantalan D (mm) dan lebar B (mm).',
      },
    ],
  },
  ja: {
    title: '産業用潤滑・オイル分析ラボ',
    shortTitle: '潤滑・オイル分析',
    description:
      '運転温度ごとのISO VG油種選定、EHL油膜厚さ（λ比）の解析、ISO 4406清浄度コードの解読、使用油ラボ診断、グリース給脂量計算を行います。',
    explore: [
      {
        title: 'ISO VGグレードと粘度–温度特性（ASTM D341）',
        summary:
          'ISO 3448は40 °Cにおける動粘度（cSt = mm²/s）を基準に±10%の許容範囲で工業用潤滑油を分類します。油の粘度は温度上昇に伴い指数関数的に低下するため、ASTM D341（Walther式）を用いて実運転油温での粘度が機器の目標範囲内にあるかを確認します。',
        equations: [
          {
            label: 'Walther（ASTM D341）式',
            formula: 'log10(log10(ν + 0.7)) = A − B · log10(T + 273.15)',
            note: 'νはcSt（mm²/s）、Tは°C；AとBはν40とν100から求める油種固有定数',
          },
          {
            label: 'ISO 3448 グレード許容範囲',
            formula: 'ν_40 ∈ [0.90 · VG, 1.10 · VG]',
            note: '例：ISO VG 220は40 °Cで198〜242 cSt',
          },
        ],
        workedExample: {
          title: 'ヘリカル減速機におけるISO VG 220の実運転粘度確認',
          given: [
            '油種：ISO VG 220（ν40 = 220 cSt, ν100 = 19.0 cSt）',
            '減速機油槽温度：T = 70 °C',
            '減速機の目標運転粘度範囲：25–90 cSt',
          ],
          steps: [
            '基準温度を絶対温度へ変換：T1 = 313.15 K, T2 = 373.15 K, T_op = 343.15 K。',
            'Waltherパラメータを計算：W1 = log10(log10(220.7)) = 0.3699, W2 = log10(log10(19.7)) = 0.1121。',
            '補間値 W(343.15 K) ≈ 0.2336 → ν(70 °C) = 10^(10^0.2336) − 0.7 ≈ 51.0 cSt。',
          ],
          answer: 'ν(70 °C) ≈ 51.0 cSt — ヘリカル減速機の目標範囲25–90 cSt内に適正収まっています。',
        },
      },
      {
        title: 'EHL油膜厚さ、ラムダ比（λ）と摩耗形態',
        summary:
          '弾性流体潤滑（EHL）は転がり軸受や歯車の接触面を微細な高圧油膜で分離します。無次元数ラムダ比（λ）は最小油膜厚さ h_min と合成表面粗さ σ の比であり、転がり疲れ寿命や摩耗形態を直接左右します。',
        equations: [
          {
            label: '合成RMS表面粗さ',
            formula: 'σ = √(Rq1² + Rq2²)',
            note: 'Rq1, Rq2は接触2面のRMS粗さ（μm）',
          },
          {
            label: 'ラムダ油膜比',
            formula: 'λ = h_min / σ',
            note: 'λ ≥ 3: 完全EHL | 1.5 ≤ λ < 3: 混合潤滑 | 1 ≤ λ < 1.5: 境界遷移 | λ < 1: 境界潤滑',
          },
        ],
        workedExample: {
          title: '水分混入環境下での軸受油膜状態の評価',
          given: [
            '清浄油EHL油膜厚さ：h_min = 0.68 μm',
            '軸受軌道・転動体の合成粗さ：σ = 0.24 μm',
            '水分混入（1200 ppm）により実効油膜が30%低下',
          ],
          steps: [
            '実効油膜厚さ：h_eff = 0.68 × (1 − 0.30) = 0.476 μm。',
            'ラムダ比を計算：λ = 0.476 / 0.24 = 1.98。',
            '潤滑領域の判定：1.5 ≤ 1.98 < 3.0。',
          ],
          answer: 'λ = 1.98（混合潤滑）— 突起接触が散発；脱水処理によりλ > 2.5への回復が必要です。',
        },
      },
      {
        title: 'ISO 4406 清浄度コードとコンタミ管理',
        summary:
          'ISO 4406は固体粒子汚染度を1 mLあたりの≥4 μm、≥6 μm、≥14 μm粒子数の3桁コード（X/Y/Z）で表します。コードが+1増加するごとに粒子濃度は2倍になり、目標値超過は三元アブレシブ摩耗を加速させます。',
        equations: [
          {
            label: 'ISO 4406 3桁表記',
            formula: 'コード = R(≥4 μm) / R(≥6 μm) / R(≥14 μm)',
            note: 'コード+1ごとに1 mLあたり粒子濃度が2倍',
          },
          {
            label: 'コード低減による粒子削減率',
            formula: 'N_new = N_old · 2^(ΔCode)',
            note: '20/18/15から17/15/12への改善で粒子を87.5%除去（8分の1）',
          },
        ],
        workedExample: {
          title: '油圧ユニットにおけるフィルタ強化効果の定量化',
          given: [
            '現在の油清浄度：ISO 20/18/15（≥4 μmが5,000–10,000個/mL）',
            '油圧サーボ目標：ISO 17/15/12',
          ],
          steps: [
            'コード低減数を算出：ΔCode = 20 − 17 = 全3チャンネルで3段階低減。',
            '削減倍率：2³ = 8分の1（8×清浄）。',
            '除去率：(1 − 1/8) × 100% = 87.5%。',
          ],
          answer: '17/15/12達成により粒子濃度は8分の1（87.5%削減）になります。',
        },
      },
      {
        title: 'グリース補給量式とアレニウス熱酸化寿命',
        summary:
          'グリースの過剰封入は攪拌発熱やシール破損を招き、不足は焼付きの原因となります。標準補給量式で適正グラム数を算出し、アレニウス則により油温上昇による酸化寿命の半減を予測します。',
        equations: [
          {
            label: 'グリース補給量',
            formula: 'G = 0.005 · D · B',
            note: 'Gはグラム、Dは軸受外径（mm）、Bは軸受幅（mm）',
          },
          {
            label: 'アレニウス酸化寿命則',
            formula: 'L(T) = L_60 · 0.5^((T − 60) / 10)',
            note: '60 °Cを超えると+10 °Cごとに油の酸化寿命が半減',
          },
        ],
        workedExample: {
          title: '6312ポンプ軸受のグリース補給量算出',
          given: ['軸受外径：D = 130 mm', '軸受幅：B = 31 mm'],
          steps: [
            '標準補給量式を適用：G = 0.005 × D × B。',
            'G = 0.005 × 130 × 31 = 0.65 × 31 = 20.15 g。',
          ],
          answer: '補給周期あたり 20.2 グラムのグリース。',
        },
      },
    ],
    practice: [
      {
        prompt:
          '外径 D = 140 mm、幅 B = 33 mm の転がり軸受に対するグリース補給量 G（g）を G = 0.005 · D · B を用いて計算してください。',
        hint: '0.005 × 140 × 33 を計算します。',
        solutionSteps: [
          '標準グリース補給量式：G = 0.005 · D · B。',
          'D = 140 mm, B = 33 mm を代入：G = 0.005 × 140 × 33。',
          'G = 0.70 × 33 = 23.1 g。',
        ],
      },
      {
        prompt:
          'ポンプ軸受の接触面RMS粗さが Rq1 = 0.24 μm, Rq2 = 0.18 μm で、EHL油膜厚さが h_min = 0.78 μm のとき、ラムダ比（λ）を求めてください。',
        hint: 'まず合成粗さ σ = √(Rq1² + Rq2²) を求め、λ = h_min / σ を計算します。',
        solutionSteps: [
          '合成粗さ：σ = √(0.24² + 0.18²) = √(0.0576 + 0.0324) = √0.09 = 0.30 μm。',
          'ラムダ比：λ = h_min / σ = 0.78 / 0.30 = 2.60。',
        ],
      },
      {
        prompt:
          '鉱油系ギヤ油の60 °Cにおける基準寿命が8,000時間です。アレニウス則（60 °Cを超えると+10 °Cごとに寿命半減）を用いて、80 °C連続運転時の推定寿命（時間）を求めてください。',
        hint: '60 °Cからの上昇は20 °C（10 °Cの半減ステップ2回分）です。',
        solutionSteps: [
          '60 °Cからの温度上昇：ΔT = 80 − 60 = 20 °C。',
          '半減ステップ数：n = 20 / 10 = 2。',
          '残存寿命：L = 8,000 × (0.5)² = 8,000 × 0.25 = 2,000 時間。',
        ],
      },
      {
        prompt:
          'ISO 3448では40 °C粘度に公称ISO VG値の±10%の許容差を認めています。新油 ISO VG 220 の40 °Cにおける許容最小粘度（cSt）はいくらですか。',
        hint: '220 cStから10%差し引きます（0.90倍）。',
        solutionSteps: [
          'ISO 3448 下限許容値 = 0.90 × 公称VG値。',
          'ν_min = 0.90 × 220 = 198 cSt。',
        ],
      },
      {
        prompt:
          '油サンプルのISO 4406清浄度コードが 20/18/15 でした。バイパス精密ろ過により ≥4 μm の粒子数が8分の1に減少した場合、ISO 4406コードの最初の数字（≥4 μmコード）はいくつになりますか。',
        hint: 'ISO 4406コードが1下がるごとに粒子数は半分になります。8分の1 = 2³分の1です。',
        solutionSteps: [
          'ISO 4406コード1段階ごとに粒子濃度は2倍/半分になります。',
          '8分の1への低減は 2³ → 3段階のコード低下に相当します。',
          '新しい ≥4 μmコード = 20 − 3 = 17。',
        ],
      },
    ],
    quiz: [
      {
        question: 'ISO VG 220 の「220」は何を表していますか？',
        options: [
          '40 °Cにおける動粘度 約220 cSt（±10%）',
          '100 °Cにおける絶対粘度 220 cP',
          '最大許容運転温度 220 °F',
          '最小粘度指数（VI）220',
        ],
        explanation:
          'ISO 3448は40 °Cにおける中心動粘度（cSt = mm²/s）を±10%の許容幅でISO VGグレードとして定義しています。',
      },
      {
        question: 'λ = 0.75 で運転中の転がり軸受はどの潤滑領域にありますか？',
        options: [
          '境界潤滑 — 金属同士の直接突起接触と高い摩耗',
          '完全EHL潤滑 — 接触面の完全分離',
          '流体くさび潤滑 — 過大な攪拌損失',
          '最適混合潤滑 — 疲労リスクなし',
        ],
        explanation:
          'λ = h_min / σ < 1.0 では油膜が合成表面粗さより薄く、直接的な突起接触（境界潤滑）が発生します。',
      },
      {
        question: 'ISO 4406清浄度コード 18/16/13 の3つの数字は何を意味しますか？',
        options: [
          '1 mLあたりの ≥4 μm、≥6 μm、≥14 μm の粒子数範囲コード',
          '水分、すす、鉄摩耗粉の含有率（%）',
          '40 °C、70 °C、100 °C における基油粘度',
          '許容最大運転時間（千時間単位）',
        ],
        explanation:
          'ISO 4406は ≥4 μm(c)、≥6 μm(c)、≥14 μm(c) の3つの累積粒径しきい値における1 mLあたりの粒子数コードを示します。',
      },
      {
        question:
          'アレニウス則によると、鉱油の温度が60 °Cから80 °Cに上昇すると酸化寿命はどう変化しますか？',
        options: [
          '約25%に低下する（2回半減する）',
          '20%低下する',
          '粘度低下により2倍に延びる',
          '100 °C未満では影響を受けない',
        ],
        explanation:
          'アレニウス反応速度則により、60 °Cを超えると+10 °Cごとに酸化速度が倍増（寿命が半減）します。+20 °Cでは (0.5)² = 25% になります。',
      },
      {
        question:
          '遊離水・乳化水（例：1000 ppm超）が転がり軸受に極めて有害な理由は何ですか？',
        options: [
          'EHL油膜強度を崩壊させ、腐食や水素脆化剥離を引き起こすため',
          'ISO VGグレードを恒久的に2段階上昇させるため',
          '伝熱性を高めて軸受のL10寿命を延ばすため',
          '極圧添加剤を無害な窒素ガスに分解するため',
        ],
        explanation:
          '水は鉱油のようなEHL圧力粘度油膜を形成できず、局所的な油膜破断、発錆、添加剤溶出、水素脆化フレーキングを招きます。',
      },
      {
        question: 'グリース補給量式 G = 0.005 · D · B において、D と B は何を表しますか？',
        options: [
          '軸受外径（mm）と軸受幅（mm）',
          '軸径（インチ）とハウジング内径（インチ）',
          'グリースNLGIちょう度番号と基油粘度（cSt）',
          '運転回転数（RPM）と周囲温度（°C）',
        ],
        explanation:
          'G = 0.005 · D · B は軸受外径 D（mm）と幅 B（mm）から補給グリース量（g）を算出する標準式です。',
      },
    ],
  },
});
