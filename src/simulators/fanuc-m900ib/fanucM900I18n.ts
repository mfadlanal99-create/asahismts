import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('fanuc-m900ib', {
  id: {
    title: 'Simulator Robot FANUC M-900iB/700 & iPendant (R-30iB)',
    shortTitle: 'FANUC M-900iB/700',
    description:
      'Laboratorium robot industri 6-sumbu beban berat FANUC M-900iB/700 (muatan 700 kg, jangkauan 2832 mm) dan iPendant R-30iB: penggerak manual (jogging) JOINT vs WORLD, kinematika maju/balik, torsi tautan paralel J2/J3, singularitas pergelangan tangan, pemrograman Teach Pendant (TP), serta diagnosis alarm SRVO/MOTN.',
    explore: [
      {
        title: '1. Kinematika 6-Sumbu Beban Berat & Tautan Paralel (M-900iB/700)',
        summary:
          'FANUC M-900iB/700 adalah robot artikulasi 6-sumbu tugas berat dengan kapasitas muatan 700 kg dan jangkauan horizontal 2832 mm. Berbeda dengan lengan seri biasa, robot ini menggunakan mekanisme tautan paralel (parallel linkage) J2/J3 serta silinder penyeimbang hidropneumatik pada bahu J2 untuk mengurangi torsi gravitasi statis dan arus motor servo αiS.',
        equations: [
          {
            label: 'Jangkauan Planar & Kinematika Maju',
            formula: 'R_tcp = a1 + a2·sin(J2) + d4·cos(J3) + d6·cos(θ_alat)',
            note: 'a1 = 410 mm, a2 = 1120 mm, d4 = 1285 mm, d6 = 260 mm; batas jangkauan maksimum R_maks = 2832 mm.',
          },
          {
            label: 'Torsi Servo Bahu J2 Bersih',
            formula: 'τ_J2 = τ_gravitasi(lengan + muatan) − τ_penyeimbang(J2)',
            note: 'Muatan melebihi 700 kg atau benturan memicu lonjakan torsi gangguan dan alarm SRVO-050 Collision Detect.',
          },
        ],
        workedExample: {
          title: 'Momen Muatan Statis pada Ekstensi Horizontal Penuh',
          given: [
            'Massa muatan m = 600 kg pada jarak radial r = 2,40 m dari sumbu J2',
            'Percepatan gravitasi g = 9,81 m/s²',
          ],
          steps: [
            'Gaya berat muatan: F = 600 kg × 9,81 m/s² = 5886 N.',
            'Momen muatan kotor terhadap J2: τ = 5886 N × 2,40 m = 14.126 N·m.',
            'Silinder penyeimbang hidropneumatik membantu ~1.600–2.200 N·m agar beban servo αiS tetap aman.',
          ],
          answer: 'Torsi muatan kotor = 14.126 N·m (dalam batas 700 kg)',
        },
      },
      {
        title: '2. Penggerak Koordinat JOINT vs WORLD & Singularitas Pergelangan',
        summary:
          'Pada mode JOINT, tombol ±J1..±J6 menggerakkan masing-masing sumbu servo secara langsung. Pada mode WORLD, tombol ±X/±Y/±Z menghitung Kinematika Balik (IK) secara waktu nyata agar Titik Pusat Alat (TCP) bergerak lurus di sumbu Kartesian. Ketika J5 mendekati 0° (|J5| < 5°), sumbu J4 dan J6 sejajar sehingga terjadi singularitas pergelangan tangan.',
        equations: [
          {
            label: 'Kondisi Singularitas Pergelangan Tangan',
            formula: '|J5| < 5°  ⇒  J4 ∥ J6 (Kecepatan Jacobian Tak Hingga)',
            note: 'Hindari singularitas dengan memiringkan pergelangan (J5 ≈ −75° s.d. −95°) atau memakai gerak Joint (J).',
          },
          {
            label: 'Pemeriksaan Jangkauan Radial WORLD',
            formula: 'R = √(X² + Y²) ≤ 2832 mm',
            note: 'Melewati batas sumbu (J2: -64..+90°, J3: -130..+30°) atau 2832 mm memicu alarm MOTN-017 Limit Error.',
          },
        ],
      },
      {
        title: '3. Interlock Keselamatan iPendant R-30iB, Program TP & Alarm',
        summary:
          'Untuk menggerakkan robot secara manual pada pengendali FANUC R-30iB, sakelar TP harus ON, sakelar Deadman harus ditekan, dan tombol E-Stop harus dilepas. Alarm industri utama meliputi SRVO-001 (E-Stop Panel/TP), SRVO-050 (Deteksi Benturan), SRVO-062 (BZAL baterai pulsecoder 0 V / kehilangan mastering), dan MOTN-017 (Batas Sumbu).',
        equations: [
          {
            label: 'Sintaks Gerakan Program TP',
            formula: 'Baris: [J | L]  P[n]  [Kecepatan]  [FINE | CNT100]',
            note: 'J = interpolasi Joint; L = lintasan Linear Kartesian; FINE berhenti tepat di titik; CNT100 menghaluskan belokan.',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'fanuc-p1',
        prompt:
          'Robot FANUC M-900iB/700 mengangkat benda kerja 550 kg pada lengan momen radial 2,2 m dari sumbu bahu J2. Hitung torsi gravitasi muatan kotor (N·m) sebelum bantuan penyeimbang (gunakan g = 9,81 m/s²).',
        hint: 'τ = m × g × r = 550 × 9,81 × 2,2.',
        targetValue: 11870,
        unit: 'N·m',
        tolerance: 50,
        solutionSteps: [
          'Hitung gaya berat muatan: F = 550 kg × 9,81 m/s² = 5395,5 N.',
          'Kalikan dengan jarak lengan: τ = 5395,5 N × 2,2 m = 11.870,1 N·m.',
        ],
      },
      {
        id: 'fanuc-p2',
        prompt:
          'Pada koordinat WORLD, TCP berada di X = 1800 mm, Y = 1200 mm. Hitung jarak radial horizontal R (mm) dari sumbu J1.',
        hint: 'Gunakan R = √(X² + Y²).',
        targetValue: 2163,
        unit: 'mm',
        tolerance: 10,
        solutionSteps: [
          'R = √(1800² + 1200²) = √(3.240.000 + 1.440.000) = √4.680.000.',
          'R ≈ 2163,3 mm (masih di dalam jangkauan 2832 mm).',
        ],
      },
      {
        id: 'fanuc-p3',
        prompt:
          'Berapa kapasitas muatan (payload) maksimum terukur (kg) pada FANUC M-900iB/700?',
        hint: 'Perhatikan angka /700 pada kode model M-900iB/700.',
        targetValue: 700,
        unit: 'kg',
        tolerance: 0,
        solutionSteps: [
          'Kode /700 pada FANUC M-900iB/700 menunjukkan kapasitas muatan maksimum 700 kg.',
        ],
      },
    ],
    quiz: [
      {
        id: 'fanuc-q1',
        question:
          'Alarm FANUC manakah yang muncul ketika tegangan baterai cadangan pulsecoder turun ke 0 V dan data mastering hilang?',
        options: [
          'SRVO-001 Operator panel E-stop',
          'SRVO-050 Collision Detect alarm',
          'SRVO-062 BZAL alarm',
          'MOTN-017 Limit error',
        ],
        correctIndex: 2,
        explanation:
          'SRVO-062 BZAL (Battery Zero Alarm) menandakan baterai cadangan encoder habis sehingga baterai harus diganti dan robot harus di-remaster.',
      },
      {
        id: 'fanuc-q2',
        question:
          'Kondisi fisik apa yang menyebabkan singularitas pergelangan tangan (wrist singularity) pada robot 6-sumbu FANUC M-900iB/700?',
        options: [
          'J1 mencapai +180°',
          'J5 mendekati 0° (|J5| < 5°) sehingga sumbu J4 dan J6 segaris',
          'Muatan melebihi 50% dari 700 kg',
          'Kecepatan override TP diatur ke 100%',
        ],
        correctIndex: 1,
        explanation:
          'Saat J5 ≈ 0°, sumbu J4 dan J6 sejajar sehingga kehilangan satu derajat kebebasan rotasi dan memicu putaran ekstrem saat gerak Linear.',
      },
      {
        id: 'fanuc-q3',
        question:
          'Mengapa FANUC M-900iB/700 dilengkapi silinder penyeimbang hidropneumatik pada sumbu J2?',
        options: [
          'Untuk menaikkan kecepatan putar J6',
          'Untuk mengimbangi torsi gravitasi statis pada bahu J2 dan mengurangi beban motor servo αiS',
          'Untuk mendinginkan kabinet pengendali R-30iB',
          'Untuk mengunci pencengkeram vakum saat E-Stop',
        ],
        correctIndex: 1,
        explanation:
          'Silinder penyeimbang hidropneumatik membantu sumbu J2 menahan momen gravitasi lengan berat dan muatan hingga 700 kg.',
      },
      {
        id: 'fanuc-q4',
        question:
          'Dalam program Teach Pendant, apa perbedaan antara `L P[2] 500mm/sec FINE` dan `L P[3] 500mm/sec CNT100`?',
        options: [
          'FINE berhenti tepat di titik ajar; CNT100 menghaluskan belokan tanpa berhenti penuh',
          'FINE memakai interpolasi Joint; CNT100 memakai interpolasi Linear',
          'CNT100 menonaktifkan sakelar Deadman',
          'FINE mengaktifkan DO[1] secara otomatis',
        ],
        correctIndex: 0,
        explanation:
          'Terminasi FINE menghentikan robot tepat di titik target (untuk ambil/letak), sedangkan CNT100 membulatkan lintasan agar waktu siklus lebih cepat.',
      },
    ],
  },
  ja: {
    title: 'FANUC M-900iB/700 ロボット & iPendant (R-30iB)',
    shortTitle: 'FANUC M-900iB/700',
    description:
      '可搬質量 700 kg・最大リーチ 2832 mm の6軸大型産業用ロボット FANUC M-900iB/700 と R-30iB iPendant の対話型ラボ。JOINT/WORLD ジョグ、順/逆運動学、J2/J3 平行リンクとバランサ負荷、手首特異点、TP プログラム実行、SRVO/MOTN アラーム診断を学習します。',
    explore: [
      {
        title: '1. 大型6軸キネマティクスと平行リンク機構 (M-900iB/700)',
        summary:
          'FANUC M-900iB/700 は可搬質量 700 kg、最大リーチ 2832 mm の重可搬ロボットです。J2/J3 平行リンクと J2 軸の油空圧バランサシリンダにより、自重とワークによる静的重力トルクを相殺し、αiS サーボモータの負荷を低減します。',
        equations: [
          {
            label: '平面リーチと順運動学',
            formula: 'R_tcp = a1 + a2·sin(J2) + d4·cos(J3) + d6·cos(θ_tool)',
            note: 'a1 = 410 mm, a2 = 1120 mm, d4 = 1285 mm, d6 = 260 mm、最大動作範囲 R_max = 2832 mm。',
          },
          {
            label: 'J2 軸正味サーボトルク',
            formula: 'τ_J2 = τ_gravity(アーム+負荷) − τ_counterbalance(J2)',
            note: '700 kg 超の過負荷や障害物接触は SRVO-050 衝突検出アラームを発生させます。',
          },
        ],
        workedExample: {
          title: '水平伸長時の静的負荷モーメント計算',
          given: [
            'ワーク質量 m = 600 kg、J2 軸からの水平距離 r = 2.40 m',
            '重力加速度 g = 9.81 m/s²',
          ],
          steps: [
            'ワーク重量: F = 600 kg × 9.81 m/s² = 5886 N。',
            'J2 軸周りの負荷モーメント: τ = 5886 N × 2.40 m = 14,126 N·m。',
            '油空圧バランサが約 1,600〜2,200 N·m を補助し、αiS サーボ負荷を定格内に保ちます。',
          ],
          answer: '総負荷トルク = 14,126 N·m（700 kg 定格内）',
        },
      },
      {
        title: '2. JOINT / WORLD 座標ジョグと手首特異点',
        summary:
          'JOINT モードでは ±J1..±J6 が各軸を直接駆動します。WORLD モードでは逆運動学（IK）をリアルタイム計算し、ツール先端点（TCP）を直交軸に沿って直線移動させます。|J5| < 5° になると J4 軸と J6 軸が同一直線上に並び、手首特異点が発生します。',
        equations: [
          {
            label: '手首特異点条件',
            formula: '|J5| < 5°  ⇒  J4 ∥ J6（ヤコビアン特異姿勢）',
            note: 'J5 を約 −75°〜−95° に保つか、各軸補間 (J) を用いて特異点を回避します。',
          },
          {
            label: 'WORLD 座標リーチ制限',
            formula: 'R = √(X² + Y²) ≤ 2832 mm',
            note: '各軸ソフトリミットまたは 2832 mm を超えると MOTN-017 リミットエラーが発生します。',
          },
        ],
      },
      {
        title: '3. R-30iB iPendant 安全インタロック・TP プログラム・アラーム',
        summary:
          '手動ジョグや TP プログラム実行には TP スイッチ ON、デッドマンスイッチ保持、非常停止 (E-Stop) 解除が必要です。代表的なアラームには SRVO-001 (非常停止)、SRVO-050 (衝突検出)、SRVO-062 (BZAL 電池電圧低下・マスタリング喪失)、MOTN-017 (リミットエラー) があります。',
        equations: [
          {
            label: 'TP 動作命令書式',
            formula: '行: [J | L]  P[n]  [速度]  [FINE | CNT100]',
            note: 'J = 各軸動作、L = 直線補間、FINE = 位置決め停止、CNT100 = 連続経路通過。',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'fanuc-p1',
        prompt:
          'FANUC M-900iB/700 が J2 軸から水平距離 2.2 m の位置で 550 kg のワークを保持しています。バランサ補助前の静的重力トルク (N·m) を計算してください (g = 9.81 m/s²)。',
        hint: 'τ = m × g × r = 550 × 9.81 × 2.2。',
        targetValue: 11870,
        unit: 'N·m',
        tolerance: 50,
        solutionSteps: [
          'ワーク重量: F = 550 kg × 9.81 m/s² = 5395.5 N。',
          'トルク: τ = 5395.5 N × 2.2 m = 11,870.1 N·m。',
        ],
      },
      {
        id: 'fanuc-p2',
        prompt:
          'WORLD 座標で TCP が X = 1800 mm, Y = 1200 mm にあります。J1 軸からの水平半径 R (mm) を計算してください。',
        hint: 'R = √(X² + Y²) を使用します。',
        targetValue: 2163,
        unit: 'mm',
        tolerance: 10,
        solutionSteps: [
          'R = √(1800² + 1200²) = √4,680,000 ≈ 2163.3 mm。',
        ],
      },
      {
        id: 'fanuc-p3',
        prompt: 'FANUC M-900iB/700 の最大可搬質量 (kg) はいくつですか？',
        hint: '型式 M-900iB/700 の末尾の数値を確認してください。',
        targetValue: 700,
        unit: 'kg',
        tolerance: 0,
        solutionSteps: ['M-900iB/700 の定格最大可搬質量は 700 kg です。'],
      },
    ],
    quiz: [
      {
        id: 'fanuc-q1',
        question:
          'パルスコーダバックアップ電池が 0 V になり、マスタリングデータが失われたときに発生する FANUC アラームはどれですか？',
        options: [
          'SRVO-001 Operator panel E-stop',
          'SRVO-050 Collision Detect alarm',
          'SRVO-062 BZAL alarm',
          'MOTN-017 Limit error',
        ],
        correctIndex: 2,
        explanation:
          'SRVO-062 BZAL (Battery Zero Alarm) はパルスコーダ用バックアップ電池切れを示し、電池交換と再マスタリングが必要です。',
      },
      {
        id: 'fanuc-q2',
        question:
          'FANUC M-900iB/700 で手首特異点 (Wrist Singularity) が発生する条件はどれですか？',
        options: [
          'J1 が +180° に達したとき',
          'J5 が 0° 付近 (|J5| < 5°) となり、J4 と J6 軸が一直線に並んだとき',
          '可搬質量が 700 kg の 50% を超えたとき',
          'オーバライド速度が 100% のとき',
        ],
        correctIndex: 1,
        explanation:
          'J5 ≈ 0° で J4 と J6 が同軸になり、直線補間中に手首が急回転する特異点が発生します。',
      },
      {
        id: 'fanuc-q3',
        question:
          'FANUC M-900iB/700 の J2 軸に油空圧バランサシリンダが装備されている理由はどれですか？',
        options: [
          'J6 の回転速度を上げるため',
          'J2 軸にかかる静的重力トルクを相殺し、αiS サーボモータの負荷を軽減するため',
          'R-30iB 制御盤を冷却するため',
          'E-Stop 時に真空グリッパをロックするため',
        ],
        correctIndex: 1,
        explanation:
          '油空圧バランサがアーム自重と最大 700 kg ワークの重力モーメントを補助します。',
      },
      {
        id: 'fanuc-q4',
        question:
          'TP プログラムの `L P[2] 500mm/sec FINE` と `L P[3] 500mm/sec CNT100` の違いは何ですか？',
        options: [
          'FINE は教示点で正確に停止し、CNT100 は停止せずコーナーを滑らかに通過する',
          'FINE は各軸補間、CNT100 は直線補間を使用する',
          'CNT100 はデッドマンスイッチを無効化する',
          'FINE は自動的に DO[1] を ON にする',
        ],
        correctIndex: 0,
        explanation:
          'FINE は位置決め完了まで減速停止し、CNT100 は連続動作でサイクルタイムを短縮します。',
      },
    ],
  },
});
