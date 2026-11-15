import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('pneumatic', {
  id: {
    title: 'Lab Sirkuit Pneumatik & Silinder',
    shortTitle: 'Lab Pneumatik',
    description:
      'Rancang dan aktifkan sirkuit pneumatik ISO 1219 dengan katup kontrol arah 3/2 dan 5/2, elemen logika AND/OR, kontrol aliran meter-out, dan kinematika gaya silinder langsung.',
    explore: [
      {
        title: 'Simbol ISO 1219 & Penamaan Katup (3/2 & 5/2 DCV)',
        summary:
          'Katup kontrol arah (DCV) dinamai dengan dua angka yang dipisahkan garis miring: jumlah port / posisi pengalihan. Katup 3/2 memiliki 3 port (1 Suplai P, 2 Kerja A, 3 Buang R) dan 2 posisi spul, cocok untuk silinder kerja tunggal atau sinyal pilot. Katup 5/2 memiliki 5 port (1 Suplai, 4 & 2 Kerja A/B, 5 & 3 Buang) dan 2 posisi untuk mengendalikan silinder kerja ganda.',
        equations: [
          {
            label: 'Penomoran Port ISO 1219',
            formula: '1 = Suplai (P),  2 & 4 = Kerja (B, A),  3 & 5 = Buang (R, S)',
            note: 'Sinyal pilot diberi label 12 (menghubungkan 1→2) dan 14 (menghubungkan 1→4).',
          },
          {
            label: 'Penunjukan Katup',
            formula: 'N / M  ⇒  N = Jumlah Port,  M = Jumlah Posisi',
            note: 'Setiap posisi digambarkan sebagai satu kotak persegi pada skematik ISO 1219.',
          },
        ],
        workedExample: {
          title: 'Membaca Katup Pilot Ganda 5/2',
          given: [
            'Tekanan suplai pada Port 1(P) = 6 bar',
            'Pulsa pilot singkat diberikan ke Port 14(Z)',
          ],
          steps: [
            'Pilot 14(Z) menggeser spul ke kotak kiri (Posisi 1).',
            'Suplai 1(P) dialirkan ke port kerja 4(A), sehingga silinder memanjang.',
            'Port kerja 2(B) dibuang ke port buang 3(EB).',
            'Karena bersifat bistabil (double-pilot), spul tetap di Posisi 1 hingga Port 12(Y) menerima sinyal pilot.',
          ],
          answer: 'Port 4(A) bertekanan 6 bar; Port 2(B) terbuang.',
        },
      },
      {
        title: 'Hukum Pascal & Gaya Silinder',
        summary:
          'Udara bertekanan memberikan tekanan seragam ke segala arah di dalam ruang silinder. Gaya teoritis sama dengan tekanan ukur dikalikan luas efektif piston. Saat langkah balik silinder kerja ganda, batang piston mengurangi luas efektif sehingga gaya tarik sedikit lebih kecil daripada gaya dorong.',
        equations: [
          {
            label: 'Gaya Langkah Maju (Ekstensi)',
            formula: 'F_ext = P · A_bore = P · (π / 4) · D²',
            note: 'Dengan P dalam MPa (1 bar = 0,1 MPa) dan D dalam mm, F langsung dalam Newton (N).',
          },
          {
            label: 'Gaya Langkah Balik (Retraksi)',
            formula: 'F_ret = P · A_annulus = P · (π / 4) · (D² − d²)',
            note: 'd adalah diameter batang piston.',
          },
          {
            label: 'Gaya Efektif dengan Gesekan',
            formula: 'F_eff = η · P · A  (umumnya η ≈ 0,85 – 0,90)',
            note: 'Memperhitungkan gesekan seal dan tekanan balik.',
          },
        ],
        workedExample: {
          title: 'Gaya Silinder Kerja Ganda pada 6 bar',
          given: [
            'Diameter bore D = 50 mm',
            'Diameter batang d = 20 mm',
            'Tekanan operasi P = 6 bar = 0,6 MPa',
          ],
          steps: [
            'A_bore = (π / 4) × 50² = 1963,5 mm²',
            'F_ext = 0,6 MPa × 1963,5 mm² = 1178,1 N',
            'A_annulus = (π / 4) × (50² − 20²) = 1649,3 mm²',
            'F_ret = 0,6 MPa × 1649,3 mm² = 989,6 N',
          ],
          answer: 'F_ext = 1178 N, F_ret = 990 N',
        },
      },
      {
        title: 'Kontrol Aliran Meter-In vs Meter-Out',
        summary:
          'Katup kontrol aliran satu arah menggabungkan orifice throttle variabel dengan check valve paralel. Pada kontrol meter-out, check valve menahan udara buang agar melewati throttle, menjaga bantalan udara bertekanan di kedua sisi piston sehingga gerakan halus dan bebas stick-slip.',
        equations: [
          {
            label: 'Konfigurasi Meter-Out',
            formula: 'Check valve mengalirkan UDARA MASUK bebas; throttle membatasi UDARA BUANG.',
            note: 'Diutamakan untuk hampir semua silinder pneumatik kerja ganda.',
          },
          {
            label: 'Konsumsi Udara Bebas (Satu Langkah)',
            formula: 'Q_free = V_cyl · (P_gauge + P_atm) / P_atm',
            note: 'P_atm ≈ 1 bar; menyatakan volume terkompresi dalam Normal Liter (NL).',
          },
        ],
        workedExample: {
          title: 'Konsumsi Udara Bebas per Langkah',
          given: [
            'Bore D = 50 mm (0,5 dm), Langkah L = 200 mm (2,0 dm)',
            'Tekanan ukur P_gauge = 6 bar, P_atm = 1 bar',
          ],
          steps: [
            'Volume silinder V_cyl = (π / 4) × (0,5)² × 2,0 = 0,393 L',
            'Rasio kompresi = (6 + 1) / 1 = 7',
            'Q_free = 0,393 L × 7 = 2,75 NL',
          ],
          answer: '2,75 Normal Liter (NL) per langkah maju',
        },
      },
      {
        title: 'Logika Pneumatik: Katup AND (Tekanan Ganda) & OR (Shuttle)',
        summary:
          'Sirkuit pneumatik dapat menjalankan logika Boolean tanpa elektronik. Katup Dual-Pressure (AND) hanya mengeluarkan udara jika kedua input 1(X) dan 1(Y) bertekanan—ideal untuk keselamatan dua tangan. Katup Shuttle (OR) mengeluarkan udara bila salah satu input bertekanan.',
        equations: [
          {
            label: 'Katup Dual-Pressure (AND)',
            formula: 'Y = X · Y_in  (Output aktif jika P_X > 0 DAN P_Y > 0)',
            note: 'Jika tekanan berbeda, tekanan yang lebih rendah diteruskan ke output.',
          },
          {
            label: 'Katup Shuttle (OR)',
            formula: 'Y = X + Y_in  (Output aktif jika P_X > 0 ATAU P_Y > 0)',
            note: 'Bola internal menutup port yang tidak bertekanan untuk mencegah aliran balik.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          'Hitung gaya ekstensi teoritis (dalam N) silinder pneumatik dengan diameter bore D = 50 mm pada tekanan P = 6 bar (0,6 MPa).',
        hint: 'Gunakan F = P × (π/4) × D² dengan P = 0,6 N/mm² dan D = 50 mm.',
        solutionSteps: [
          'Konversi tekanan: P = 6 bar = 0,6 MPa = 0,6 N/mm²',
          'Luas piston: A = (π / 4) × 50² = 1963,5 mm²',
          'Gaya: F = 0,6 × 1963,5 = 1178,1 N',
        ],
      },
      {
        prompt:
          'Sebuah silinder kerja ganda memiliki bore D = 63 mm dan diameter batang d = 20 mm. Hitung gaya retraksi teoritis (dalam N) pada P = 6 bar (0,6 MPa).',
        hint: 'Kurangi luas bore dengan luas batang: A_annulus = (π/4)(D² − d²).',
        solutionSteps: [
          'A_annulus = (π / 4) × (63² − 20²) = (π / 4) × 3569 = 2803,1 mm²',
          'P = 6 bar = 0,6 N/mm²',
          'F_ret = 0,6 × 2803,1 = 1681,9 N',
        ],
      },
      {
        prompt:
          'Silinder bore 40 mm bekerja pada 5 bar (0,5 MPa) dengan efisiensi mekanis 90% (η = 0,90). Berapa gaya ekstensi efektifnya dalam N?',
        hint: 'Kalikan gaya teoritis F = P × A dengan η = 0,90.',
        solutionSteps: [
          'A = (π / 4) × 40² = 1256,6 mm²',
          'F_theo = 0,5 × 1256,6 = 628,3 N',
          'F_eff = 0,90 × 628,3 = 565,5 N',
        ],
      },
      {
        prompt:
          'Berapa Normal Liter (NL) udara bebas yang dikonsumsi dalam satu langkah ekstensi silinder bore 50 mm, langkah 200 mm pada tekanan ukur 6 bar (P_atm = 1 bar)?',
        hint: 'V_cyl = (π/4) × (0,5 dm)² × 2 dm. Kalikan dengan (P_gauge + 1) / 1.',
        solutionSteps: [
          'Konversi ke desimeter: D = 0,5 dm, L = 2,0 dm',
          'V_cyl = (π / 4) × 0,25 × 2,0 = 0,3927 L',
          'Q_free = 0,3927 × (6 + 1) / 1 = 2,75 NL',
        ],
      },
      {
        prompt:
          'Berapa diameter bore minimum D (dalam mm) yang dibutuhkan untuk menghasilkan gaya ekstensi teoritis 2000 N pada 6 bar (0,6 MPa)?',
        hint: 'Hitung A = F / P, lalu D = √(4A / π).',
        solutionSteps: [
          'Luas yang dibutuhkan: A = 2000 N / 0,6 N/mm² = 3333,3 mm²',
          'D = √(4 × 3333,3 / π) = √4244,1 = 65,15 mm',
        ],
      },
    ],
    quiz: [
      {
        question: 'Dalam notasi pneumatik ISO 1219, apa arti "5/2" pada katup kontrol arah?',
        options: [
          'Tekanan maksimum 5 bar dan aliran 2 L/min',
          '5 port dan 2 posisi pengalihan',
          '5 posisi pengalihan dan 2 port buang',
          'Langkah spul 50 mm dan 2 jalur pilot',
        ],
        explanation:
          'Angka pertama menunjukkan jumlah port (1 suplai, 2 & 4 kerja, 3 & 5 buang) dan angka kedua menunjukkan jumlah posisi pengalihan.',
      },
      {
        question: 'Mengapa kontrol aliran meter-out lebih dipilih daripada meter-in untuk silinder pneumatik kerja ganda?',
        options: [
          'Menggandakan gaya ekstensi maksimum',
          'Menghilangkan kebutuhan unit FRL',
          'Menahan udara bertekanan di kedua sisi piston sehingga mencegah gerakan tersendat (stick-slip)',
          'Membuang udara langsung kembali ke kompresor',
        ],
        explanation:
          'Meter-out mencekik udara buang sambil memberi tekanan suplai penuh di sisi penggerak, menciptakan bantalan udara yang stabil.',
      },
      {
        question: 'Nomor port ISO 1219 manakah yang selalu mewakili suplai udara bertekanan?',
        options: ['Port 1 (P)', 'Port 2 (B)', 'Port 3 (R)', 'Port 4 (A)'],
        explanation:
          'Dalam ISO 1219, Port 1 selalu menjadi suplai tekanan utama (P), angka genap (2, 4) adalah port kerja, dan angka ganjil (3, 5) adalah port buang.',
      },
      {
        question: 'Sirkuit press keselamatan dua tangan mengharuskan kedua tombol ditekan bersamaan. Katup logika apa yang digunakan?',
        options: [
          'Katup Shuttle (OR)',
          'Katup Dual-Pressure (AND)',
          'Katup Quick Exhaust',
          'Check Valve searah',
        ],
        explanation:
          'Katup Dual-Pressure (AND) hanya mengalirkan udara ke output ketika kedua input bertekanan secara bersamaan.',
      },
      {
        question: 'Mengapa gaya retraksi silinder kerja ganda lebih kecil daripada gaya ekstensi pada tekanan yang sama?',
        options: [
          'Udara buang memiliki viskositas lebih tinggi saat retraksi',
          'Batang piston mengurangi luas penampang efektif di sisi batang',
          'Katup 5/2 menurunkan tekanan 50% pada Port 2',
          'Pegas pengembali melawan gerakan retraksi',
        ],
        explanation:
          'Pada sisi batang, tekanan hanya bekerja pada luas anulus A = (π/4)(D² − d²), lebih kecil dari luas bore penuh.',
      },
      {
        question: 'Apa kepanjangan unit FRL di awal sirkuit pneumatik?',
        options: [
          'Flow, Relief, Limit',
          'Filter, Regulator, Lubricator',
          'Force, Ratio, Load',
          'Feedback, Relay, Latch',
        ],
        explanation:
          'Unit FRL mengondisikan udara bertekanan dengan menyaring partikel/air, mengatur tekanan hilir, dan melumasi komponen.',
      },
    ],
  },
  ja: {
    title: '空気圧回路・シリンダ実験ラボ',
    shortTitle: '空気圧ラボ',
    description:
      'ISO 1219準拠の3/2・5/2方向制御弁、AND/OR論理弁、メータアウト流量制御、リアルタイムのシリンダ推力・ストローク解析を体験できる空気圧回路シミュレータです。',
    explore: [
      {
        title: 'ISO 1219記号と方向制御弁の呼称（3/2・5/2弁）',
        summary:
          '方向制御弁（DCV）は「ポート数／切換位置数」で表されます。3/2弁は3ポート（1:供給P、2:出力A、3:排気R）と2位置を持ち、単動シリンダやパイロット信号に最適です。5/2弁は5ポート（1:供給、4・2:出力A/B、5・3:排気）と2位置を持ち、複動シリンダの制御に使用されます。',
        equations: [
          {
            label: 'ISO 1219 ポート番号',
            formula: '1 = 供給 (P),  2 & 4 = 出力 (B, A),  3 & 5 = 排気 (R, S)',
            note: 'パイロット信号ポートは12（1→2切換）および14（1→4切換）です。',
          },
          {
            label: '弁の表記法',
            formula: 'N / M  ⇒  N = ポート数,  M = 切換位置数',
            note: 'ISO 1219回路図では各切換位置を1つの正方形で描きます。',
          },
        ],
        workedExample: {
          title: '5/2ダブルパイロット弁の動作読解',
          given: [
            'ポート1(P)の供給圧力 = 6 bar',
            'ポート14(Z)に短いパイロット信号を入力',
          ],
          steps: [
            'パイロット14(Z)によりスプールが左側の位置（位置1）へ切り換わります。',
            '供給1(P)が作業ポート4(A)へ流れ、シリンダが前進します。',
            '作業ポート2(B)は排気ポート3(EB)へ排気されます。',
            '双安定（ダブルパイロット）弁のため、ポート12(Y)に信号が入るまで位置1を保持します。',
          ],
          answer: 'ポート4(A)に6 barが供給され、ポート2(B)は排気されます。',
        },
      },
      {
        title: 'パスカルの原理とシリンダ推力',
        summary:
          '圧縮空気はシリンダ室内のあらゆる方向に等しい圧力を及ぼします。理論推力はゲージ圧と受圧面積の積です。複動シリンダの引込み（後退）行程ではピストンロッドの断面積分だけ受圧面積が小さくなるため、推力もわずかに低下します。',
        equations: [
          {
            label: '押出し推力（前進）',
            formula: 'F_ext = P · A_bore = P · (π / 4) · D²',
            note: 'PをMPa（1 bar = 0.1 MPa）、Dをmmで代入するとFはニュートン(N)になります。',
          },
          {
            label: '引込み推力（後退）',
            formula: 'F_ret = P · A_annulus = P · (π / 4) · (D² − d²)',
            note: 'dはピストンロッド径です。',
          },
          {
            label: '実効推力（機械効率考慮）',
            formula: 'F_eff = η · P · A  (一般的に η ≈ 0.85 – 0.90)',
            note: 'シール摩擦や背圧の影響を考慮した値です。',
          },
        ],
        workedExample: {
          title: '6 barにおける複動シリンダ推力',
          given: [
            'シリンダ内径 D = 50 mm',
            'ロッド径 d = 20 mm',
            '使用圧力 P = 6 bar = 0.6 MPa',
          ],
          steps: [
            'A_bore = (π / 4) × 50² = 1963.5 mm²',
            'F_ext = 0.6 MPa × 1963.5 mm² = 1178.1 N',
            'A_annulus = (π / 4) × (50² − 20²) = 1649.3 mm²',
            'F_ret = 0.6 MPa × 1649.3 mm² = 989.6 N',
          ],
          answer: 'F_ext = 1178 N, F_ret = 990 N',
        },
      },
      {
        title: 'メータイン制御とメータアウト制御',
        summary:
          '一方向流量制御弁（スピードコントローラ）は可変絞りと逆止弁を並列に組み合わせた構造です。メータアウト制御では排気側の空気を絞ることでピストン両側に圧力クッションを形成し、負荷変動によるスティックスリップ（びびり）を防ぎます。',
        equations: [
          {
            label: 'メータアウト構成',
            formula: '逆止弁で給気を自由通過させ、絞りで排気を制御します。',
            note: '複動空気圧シリンダの速度制御で標準的に採用されます。',
          },
          {
            label: '空気消費量（1行程あたりノルマル換算）',
            formula: 'Q_free = V_cyl · (P_gauge + P_atm) / P_atm',
            note: 'P_atm ≈ 1 bar。標準状態リットル（NL）で消費量を表します。',
          },
        ],
        workedExample: {
          title: '1行程あたりの空気消費量',
          given: [
            '内径 D = 50 mm (0.5 dm), ストローク L = 200 mm (2.0 dm)',
            'ゲージ圧 P_gauge = 6 bar, 大気圧 P_atm = 1 bar',
          ],
          steps: [
            'シリンダ容積 V_cyl = (π / 4) × (0.5)² × 2.0 = 0.393 L',
            '圧縮比 = (6 + 1) / 1 = 7',
            'Q_free = 0.393 L × 7 = 2.75 NL',
          ],
          answer: '前進1行程あたり 2.75 NL（ノルマルリットル）',
        },
      },
      {
        title: '空気圧論理回路：AND（二圧）弁とOR（シャトル）弁',
        summary:
          '電子制御なしでブール論理を構成できます。二圧弁（AND）は両方の入力1(X)と1(Y)が加圧されたときのみ出力し、両手操作安全回路に用いられます。シャトル弁（OR）はいずれかの入力が加圧されると出力します。',
        equations: [
          {
            label: '二圧弁 (AND)',
            formula: 'Y = X · Y_in  (P_X > 0 かつ P_Y > 0 のとき出力)',
            note: '左右の圧力が異なる場合は低い方の圧力が優先出力されます。',
          },
          {
            label: 'シャトル弁 (OR)',
            formula: 'Y = X + Y_in  (P_X > 0 または P_Y > 0 のとき出力)',
            note: '内蔵ボールが非加圧側ポートを閉止し逆流を防ぎます。',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          '内径 D = 50 mm の空気圧シリンダを P = 6 bar (0.6 MPa) で作動させたときの理論押出し推力（N）を求めよ。',
        hint: 'F = P × (π/4) × D² に P = 0.6 N/mm²、D = 50 mm を代入します。',
        solutionSteps: [
          '圧力換算: P = 6 bar = 0.6 MPa = 0.6 N/mm²',
          'ピストン断面積: A = (π / 4) × 50² = 1963.5 mm²',
          '推力: F = 0.6 × 1963.5 = 1178.1 N',
        ],
      },
      {
        prompt:
          '内径 D = 63 mm、ロッド径 d = 20 mm の複動シリンダを P = 6 bar (0.6 MPa) で作動させたときの理論引込み推力（N）を求めよ。',
        hint: 'ロッド面積を引いた環状面積 A_annulus = (π/4)(D² − d²) を用います。',
        solutionSteps: [
          'A_annulus = (π / 4) × (63² − 20²) = (π / 4) × 3569 = 2803.1 mm²',
          'P = 6 bar = 0.6 N/mm²',
          'F_ret = 0.6 × 2803.1 = 1681.9 N',
        ],
      },
      {
        prompt:
          '内径 40 mm のシリンダが 5 bar (0.5 MPa)、機械効率 90%（η = 0.90）で作動するとき、実効押出し推力（N）はいくらか。',
        hint: '理論推力 F = P × A に η = 0.90 を掛けます。',
        solutionSteps: [
          'A = (π / 4) × 40² = 1256.6 mm²',
          'F_theo = 0.5 × 1256.6 = 628.3 N',
          'F_eff = 0.90 × 628.3 = 565.5 N',
        ],
      },
      {
        prompt:
          '内径 50 mm、ストローク 200 mm のシリンダをゲージ圧 6 bar（大気圧 1 bar）で1回前進させるときの大気圧換算空気消費量（NL）を求めよ。',
        hint: 'V_cyl = (π/4) × (0.5 dm)² × 2 dm を計算し、(P_gauge + 1) / 1 倍します。',
        solutionSteps: [
          'デシメートル換算: D = 0.5 dm, L = 2.0 dm',
          'V_cyl = (π / 4) × 0.25 × 2.0 = 0.3927 L',
          'Q_free = 0.3927 × (6 + 1) / 1 = 2.75 NL',
        ],
      },
      {
        prompt:
          '6 bar (0.6 MPa) の圧力で 2000 N の理論押出し推力を得るために必要な最小シリンダ内径 D（mm）を求めよ。',
        hint: 'まず A = F / P を求め、D = √(4A / π) で内径を算出します。',
        solutionSteps: [
          '必要断面積: A = 2000 N / 0.6 N/mm² = 3333.3 mm²',
          'D = √(4 × 3333.3 / π) = √4244.1 = 65.15 mm',
        ],
      },
    ],
    quiz: [
      {
        question: 'ISO 1219空気圧表記で、方向制御弁の「5/2」は何を意味するか。',
        options: [
          '最高圧力 5 bar・流量 2 L/min',
          '5ポート・2切換位置',
          '5切換位置・2排気ポート',
          'スプールストローク 50 mm・2パイロット線',
        ],
        explanation:
          '最初の数字がポート数（供給1、出力2・4、排気3・5）、次の数字が切換位置数を表します。',
      },
      {
        question: '複動空気圧シリンダでメータインよりメータアウト制御が好まれる理由はどれか。',
        options: [
          '最大推力が2倍になるため',
          'FRLユニットが不要になるため',
          'ピストン両側に背圧を保ち、スティックスリップを防ぐため',
          '排気をコンプレッサへ直接戻せるため',
        ],
        explanation:
          'メータアウトは排気を絞ることで背圧クッションを作り、負荷変動時の飛び出しやびびりを抑えます。',
      },
      {
        question: 'ISO 1219において、圧縮空気の供給ポートを表す番号はどれか。',
        options: ['ポート 1 (P)', 'ポート 2 (B)', 'ポート 3 (R)', 'ポート 4 (A)'],
        explanation:
          'ISO 1219ではポート1が供給(P)、偶数(2, 4)が出力、奇数(3, 5)が排気です。',
      },
      {
        question: '両手操作安全回路で2つの押ボタンを同時に押したときのみ出力する論理弁はどれか。',
        options: [
          'シャトル弁 (OR)',
          '二圧弁 (AND)',
          '急速排気弁',
          '逆止弁',
        ],
        explanation:
          '二圧弁（AND弁）は両側の入力が同時に加圧された場合のみ出力ポートへ空気を通します。',
      },
      {
        question: '同じ圧力でも複動シリンダの引込み推力が押出し推力より小さい理由はどれか。',
        options: [
          '排気時は空気粘度が上昇するため',
          'ピストンロッドによりロッド側の有効受圧面積が小さくなるため',
          '5/2弁のポート2で圧力が50%低下するため',
          '復帰ばねが引込みを妨げるため',
        ],
        explanation:
          'ロッド側は環状面積 A = (π/4)(D² − d²) に圧力が作用するため、全断面より推力が小さくなります。',
      },
      {
        question: '空気圧回路の入口に設置される FRL ユニットの構成要素はどれか。',
        options: [
          'Flow, Relief, Limit',
          'Filter, Regulator, Lubricator',
          'Force, Ratio, Load',
          'Feedback, Relay, Latch',
        ],
        explanation:
          'FRLユニットはフィルタ（除塵・除水）、レギュレータ（減圧調圧）、ルブリケータ（給油）で構成されます。',
      },
    ],
  },
});
