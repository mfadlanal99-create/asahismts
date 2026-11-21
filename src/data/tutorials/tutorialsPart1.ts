import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_1: Record<string, TutorialStep[]> = {
  alignment: [
    {
      id: 'alignment-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Shaft Alignment & Soft-Foot Lab',
        id: 'Lab Penyelarasan Poros & Soft-Foot',
        ja: '軸芯出し・ソフトフット実習ラボ',
      },
      description: {
        en: 'Welcome! Master precision motor-to-pump shaft alignment following the 5-step field workflow (Soft Foot, Rough Align, Vertical Shims, Horizontal Jack, Final Verify) against ISO/ANSI RPM tolerances.',
        id: 'Selamat datang! Kuasai penyelarasan poros motor-pompa presisi mengikuti alur kerja 5 langkah di lapangan (Soft Foot, Penyelarasan Kasar, Shim Vertikal, Penyetelan Horizontal, dan Verifikasi Akhir) sesuai toleransi putaran ISO/ANSI.',
        ja: 'ようこそ！5段階の現場手順（ソフトフット、粗芯出し、垂直シム、水平ジャッキ、最終確認）に沿って、ISO/ANSI回転数別許容値に基づく高精度な軸芯出しを習得します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between controls.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau tombol panah ← / → kapan saja untuk berpindah antar-kontrol dengan lancar.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを滑らかに切り替えられます。',
      },
    },
    {
      id: 'alignment-presets',
      badge: {
        en: 'Feature 1 · Presets',
        id: 'Fitur 1 · Skenario Standar',
        ja: '機能1 · プリセット',
      },
      title: {
        en: 'Misalignment Scenario Presets',
        id: 'Pilihan Skenario Ketidaklurusan Poros',
        ja: 'ミスアライメント・シナリオ選択',
      },
      description: {
        en: 'Load Parallel Offset, Angular Misalignment, Combined + Soft Foot, or Aligned presets to practice diagnosing and correcting different field conditions.',
        id: 'Muat skenario Offset Paralel, Ketidaklurusan Sudut, Kombinasi + Soft Foot, atau Lurus untuk berlatih mendiagnosis dan mengoreksi berbagai kondisi lapangan.',
        ja: '平行偏心、偏角、複合＋ソフトフット、芯出し完了の各プリセットを読み込み、現場ごとの芯出し手順を練習できます。',
      },
      tip: {
        en: 'Start with Combined + Soft Foot to practice the complete 5-step alignment sequence.',
        id: 'Mulailah dengan Kombinasi + Soft Foot untuk melatih urutan penyelarasan 5 langkah secara lengkap.',
        ja: '「複合＋ソフトフット」から始めると5段階のフル手順を練習できます。',
      },
      targetSelector: '[data-tour="alignment-presets"]',
    },
    {
      id: 'alignment-view-toggle',
      badge: {
        en: 'Feature 2 · View Mode',
        id: 'Fitur 2 · Mode Tampilan',
        ja: '機能2 · 計測モード切替',
      },
      title: {
        en: 'Dial Gauges vs. Laser View Toggle',
        id: 'Pengalih Tampilan Dial Indikator vs. Laser',
        ja: 'ダイヤルゲージ／レーザー表示切替',
      },
      description: {
        en: 'Switch between classic Rim & Face Dial Gauges and modern Laser Alignment View to see how both instruments report the same coupling offset and angularity.',
        id: 'Beralihlah antara Dial Indikator Rim & Face klasik dan Tampilan Penyelarasan Laser modern untuk melihat bagaimana kedua instrumen melaporkan offset dan sudut kopling yang sama.',
        ja: '従来のリム／フェイス・ダイヤルゲージ表示とレーザー芯出し表示を切り替え、両者の表示方法の違いを比較できます。',
      },
      tip: {
        en: 'Dial gauges require bar-sag compensation, whereas laser heads compute centerline geometry optically.',
        id: 'Dial indikator memerlukan kompensasi lendutan batang (bar sag), sedangkan kepala laser menghitung geometri sumbu secara optis.',
        ja: 'ダイヤルゲージはバーたわみ補正が必要ですが、レーザー式は光学的に中心線を算出します。',
      },
      targetSelector: '[data-tour="alignment-view-toggle"]',
    },
    {
      id: 'alignment-wizard',
      badge: {
        en: 'Feature 3 · Field Wizard',
        id: 'Fitur 3 · Panduan 5 Langkah',
        ja: '機能3 · 5段階ウィザード',
      },
      title: {
        en: '5-Step Field Alignment Progress Bar',
        id: 'Bilah Progres Penyelarasan 5 Langkah',
        ja: '5段階 現場芯出し進捗バー',
      },
      description: {
        en: 'Track your live progress through Soft Foot, Rough Align, Vertical Shims, Horizontal Jack, and Final Verify—each badge turns green once within ISO/ANSI tolerance.',
        id: 'Pantau kemajuan langsung melalui tahap Soft Foot, Penyelarasan Kasar, Shim Vertikal, Penyetelan Horizontal, dan Verifikasi Akhir—setiap penanda akan menyala hijau saat masuk batas toleransi ISO/ANSI.',
        ja: 'ソフトフット→粗芯出し→垂直シム→水平ジャッキ→最終確認の進捗を確認し、各段階が許容範囲に入ると緑色に点灯します。',
      },
      tip: {
        en: 'Always finish Step 1 (Soft Foot) and Step 3 (Vertical Shims) before tightening horizontal jack bolts.',
        id: 'Selalu selesaikan Langkah 1 (Soft Foot) dan Langkah 3 (Shim Vertikal) sebelum mengencangkan baut penyetel horizontal.',
        ja: '垂直シム調整を完了してから水平ジャッキ調整へ進むのが現場の基本順序です。',
      },
      targetSelector: '[data-tour="alignment-wizard"]',
    },
    {
      id: 'alignment-sweep',
      badge: {
        en: 'Feature 4 · Shaft Sweep',
        id: 'Fitur 4 · Putaran Poros',
        ja: '機能4 · 軸回転操作',
      },
      title: {
        en: 'Cardinal Angles (0°–270°) & Sweep Controls',
        id: 'Sudut Kardinal (0°–270°) & Kontrol Sapuan (Sweep)',
        ja: '4方向角度(0°〜270°)・連続回転(Sweep)',
      },
      description: {
        en: 'Jump to 0° (12:00), 90° (3:00), 180° (6:00), or 270° (9:00), press Sweep to rotate continuously, or drag the 0–359° slider to observe live needle deflection.',
        id: 'Pindah cepat ke 0° (12:00), 90° (3:00), 180° (6:00), atau 270° (9:00), tekan Sweep untuk memutar secara kontinu, atau geser penggeser 0–359° untuk mengamati simpangan jarum secara langsung.',
        ja: '0°/90°/180°/270°ボタンで各時計位置へ移動、Sweepで連続回転、または0〜359°スライダーで針の振れを確認できます。',
      },
      tip: {
        en: 'Check 0° vs. 180° for vertical alignment and 90° vs. 270° for horizontal alignment.',
        id: 'Periksa posisi 0° vs. 180° untuk kelurusan vertikal dan 90° vs. 270° untuk kelurusan horizontal.',
        ja: '上下（0°と180°）で垂直方向、左右（90°と270°）で水平方向のズレを読み取ります。',
      },
      targetSelector: '[data-tour="alignment-sweep"]',
    },
    {
      id: 'alignment-gauges',
      badge: {
        en: 'Feature 5 · Readings',
        id: 'Fitur 5 · Pembacaan Alat',
        ja: '機能5 · ゲージ・4方向値',
      },
      title: {
        en: 'Rim & Face Gauges + Cardinal Readings Table',
        id: 'Dial Rim & Face + Tabel Pembacaan Kardinal',
        ja: 'リム/フェイス計＆4方向読取値テーブル',
      },
      description: {
        en: 'Read Rim & Face TIR values (or Laser targets) and check the T+B = L+R validity rule (Δ error) to confirm consistent indicator measurements.',
        id: 'Baca nilai TIR Rim & Face (atau target Laser) dan periksa aturan validitas T+B = L+R (selisih Δ) untuk memastikan konsistensi pengukuran indikator.',
        ja: 'リム／フェイスTIR値（またはレーザー表示）と4方向読取値テーブルを確認し、T+B = L+R の妥当性チェック（Δ誤差）で計測信頼性を検証します。',
      },
      tip: {
        en: 'If T+B does not equal L+R within ~0.02 mm, suspect loose indicator brackets, coupling play, or soft foot.',
        id: 'Jika T+B tidak sama dengan L+R dalam batas ~0,02 mm, curigai dudukan indikator yang longgar, kelonggaran kopling, atau soft foot.',
        ja: 'T+B と L+R に0.02 mm以上の差がある場合、ゲージ台の緩みやカップリングガタを疑います。',
      },
      faqs: [
        {
          q: {
            en: 'What is the T+B = L+R validity rule?',
            id: 'Apa itu aturan validitas T+B = L+R?',
            ja: 'T+B = L+R の妥当性チェックとは何ですか？',
          },
          a: {
            en: 'In a true circular sweep, Top + Bottom readings must equal Left + Right readings. A large Δ error signals bracket sag, loose mounting, or shaft runout.',
            id: 'Pada putaran melingkar yang benar, jumlah pembacaan Atas + Bawah harus sama dengan Kiri + Kanan. Selisih Δ yang besar menandakan dudukan melendut, pemasangan longgar, atau poros oleng (runout).',
            ja: '真円軌道上の計測では上下の和(T+B)と左右の和(L+R)が一致します。Δが大きい場合はブラケットのガタや軸振れを示します。',
          },
          keywords: ['t+b', 'l+r', 'validity', 'tir', 'delta', 'validitas'],
        },
      ],
      targetSelector: '[data-tour="alignment-gauges"]',
    },
    {
      id: 'alignment-soft-foot',
      badge: {
        en: 'Feature 6 · Troubleshoot',
        id: 'Fitur 6 · Diagnosis Gangguan',
        ja: '機能6 · ソフトフット診断',
      },
      title: {
        en: 'Soft-Foot Diagnostic & Shim Check',
        id: 'Diagnosis Soft-Foot & Pemeriksaan Shim',
        ja: 'ソフトフット診断＆シム補正',
      },
      description: {
        en: 'Select the Fault Foot (FL, FR, RL, RR), click Loosen on each motor foot to measure bolt lift, and insert -0.05 / +0.01 / +0.05 mm shims until residual lift is ≤ 0.05 mm.',
        id: 'Pilih Kaki Bermasalah (FL, FR, RL, RR), klik Kendurkan pada setiap kaki motor untuk mengukur angkatan kaki, lalu sisipkan shim -0,05 / +0,01 / +0,05 mm hingga sisa angkatan ≤ 0,05 mm.',
        ja: '異常脚(FL/FR/RL/RR)を選択し、各脚を「緩める」で浮き量を測定したうえで、-0.05 / +0.01 / +0.05 mmシムで 0.05 mm 以下に補正します。',
      },
      tip: {
        en: 'Tightening anchor bolts over an uncorrected soft foot twists the motor frame and ruins alignment.',
        id: 'Mengencangkan baut jangkar pada kondisi soft foot yang belum dikoreksi akan memelintir rangka motor dan merusak penyelarasan.',
        ja: 'ソフトフット未補正のままボルトを締めるとモータフレームが歪み、芯出しが崩れます。',
      },
      faqs: [
        {
          q: {
            en: 'Why must soft foot be fixed before aligning?',
            id: 'Mengapa soft foot harus diperbaiki sebelum penyelarasan poros?',
            ja: 'なぜ芯出し前にソフトフットを直すのですか？',
          },
          a: {
            en: 'An unshimmed gap (> 0.05 mm) under one motor foot distorts the casing when torqued down, shifting shaft centerline every time bolts are tightened.',
            id: 'Celah > 0,05 mm di bawah salah satu kaki motor akan memelintir rumah motor saat baut dikencangkan, sehingga posisi sumbu poros terus bergeser setiap kali pengencangan dilakukan.',
            ja: '1脚に0.05 mm超の浮きがあると、ボルト締付のたびにフレームが歪み、芯出し数値が再現しなくなるためです。',
          },
          keywords: ['soft foot', 'shim', '0.05', 'loosen', 'kendurkan'],
        },
      ],
      targetSelector: '[data-tour="alignment-soft-foot"]',
    },
    {
      id: 'alignment-worksheet',
      badge: {
        en: 'Feature 7 · Correction',
        id: 'Fitur 7 · Koreksi Penyelarasan',
        ja: '機能7 · 補正ワークシート',
      },
      title: {
        en: 'Actionable Alignment Worksheet',
        id: 'Lembar Kerja Koreksi Penyelarasan',
        ja: '芯出し補正ワークシート',
      },
      description: {
        en: 'Read the calculated remaining Front/Rear vertical shims and horizontal jack moves, then click Apply Worksheet Moves or tune the sliders below to bring the shaft into tolerance.',
        id: 'Baca sisa shim vertikal Depan/Belakang dan pergeseran horizontal hasil perhitungan, lalu klik Terapkan Koreksi atau atur penggeser di bawah untuk membawa poros masuk ke batas toleransi.',
        ja: '前後脚の必要垂直シム量と水平ジャッキ移動量を確認し、「補正量を適用」または下部スライダーで許容範囲内に調整します。',
      },
      tip: {
        en: 'Positive vertical moves mean Add Shims; negative means Remove Shims.',
        id: 'Nilai vertikal positif berarti Tambah Shim; nilai negatif berarti Kurangi Shim.',
        ja: '垂直方向が正(+)ならシム追加、負(-)ならシム除去を意味します。',
      },
      targetSelector: '[data-tour="alignment-worksheet"]',
    },
    {
      id: 'alignment-geometry',
      badge: {
        en: 'Feature 8 · Geometry & Thermal',
        id: 'Fitur 8 · Geometri & Termal',
        ja: '機能8 · 寸法・熱膨張',
      },
      title: {
        en: 'Machine Geometry, Bar Sag & Thermal Growth',
        id: 'Geometri Mesin, Lendutan Batang & Pemuaian Termal',
        ja: '機械寸法・バーたわみ・熱膨張補正',
      },
      description: {
        en: 'Configure Operating RPM, Coupling Sweep Ø, foot distances (L₁, L₂), Indicator Bar Sag compensation, and Pump/Motor thermal growth targets.',
        id: 'Atur RPM Operasi, Diameter Sapuan Kopling, jarak kaki (L₁, L₂), kompensasi Lendutan Batang Indikator, serta target pemuaian termal Pompa/Motor.',
        ja: '運転RPM、カップリング径、脚間距離(L₁, L₂)、バーたわみ補正、ポンプ/モータの熱膨張目標値を設定します。',
      },
      tip: {
        en: 'Try the Hot Pump (+0.15/+0.05) preset to see how cold alignment targets offset thermal rise.',
        id: 'Coba skenario Pompa Panas (+0.15/+0.05) untuk melihat bagaimana target penyelarasan dingin mengompensasi pemuaian termal saat beroperasi.',
        ja: '「高温ポンプ(+0.15/+0.05)」プリセットで熱膨張を見込んだ冷間目標オフセットを確認できます。',
      },
      targetSelector: '[data-tour="alignment-geometry"]',
    },
    {
      id: 'alignment-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz modes in the top bar to test your alignment calculations and soft-foot troubleshooting.',
        id: 'Beralihlah antara mode Simulasi, Eksplorasi, Latihan, dan Kuis di bilah atas untuk menguji perhitungan penyelarasan dan diagnosis soft-foot Anda.',
        ja: '上部タブでシミュレーション・探索・演習・クイズを切り替え、芯出し計算とソフトフット診断の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'beam-bending': [
    {
      id: 'beam-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Beam Bending, SFD & BMD Lab',
        id: 'Lab Lentur Balok, SFD & BMD',
        ja: '梁の曲げ・SFD・BMD実習ラボ',
      },
      description: {
        en: 'Welcome! Analyze structural beam support reactions, Shear Force Diagrams (SFD), Bending Moment Diagrams (BMD), deflection δ_max, and yield Safety Factor (FoS) in real time.',
        id: 'Selamat datang! Analisis reaksi tumpuan balok, Diagram Gaya Geser (SFD), Diagram Momen Lentur (BMD), lendutan δ_max, dan Faktor Keamanan (FoS) secara real-time.',
        ja: 'ようこそ！梁の支点反力、せん断力図(SFD)、曲げモーメント図(BMD)、最大たわみδ_max、降伏安全率(FoS)をリアルタイムに解析します。',
      },
      tip: {
        en: 'Compare Simply Supported, Cantilever, and Overhang beams under Point, UDL, or Combined loads.',
        id: 'Bandingkan balok Sederhana, Kantilever, dan Gantung dengan beban Terpusat, Merata, atau Kombinasi.',
        ja: '単純支持・片持ち・張り出し梁に集中・等分布・複合荷重を与えて挙動を比較できます。',
      },
    },
    {
      id: 'beam-support-load',
      badge: {
        en: 'Feature 1 · Support & Load',
        id: 'Fitur 1 · Tumpuan & Beban',
        ja: '機能1 · 支持条件・荷重',
      },
      title: {
        en: 'Support System & Load Type Selector',
        id: 'Pemilih Sistem Tumpuan & Jenis Beban',
        ja: '支持形式＆荷重形態セレクタ',
      },
      description: {
        en: 'Switch between Simply Supported, Cantilever, and Overhang beams, and choose Point Load, Uniformly Distributed Load (UDL), or Combined loading.',
        id: 'Pilih antara balok Sederhana, Kantilever, atau Gantung, lalu tentukan Beban Terpusat, Merata (UDL), atau Kombinasi.',
        ja: '単純支持・片持ち・張り出し梁を切り替え、集中荷重・等分布荷重(UDL)・複合荷重のいずれかを選択します。',
      },
      tip: {
        en: 'Cantilever beams experience maximum bending moment right at the fixed wall support.',
        id: 'Balok kantilever mengalami momen lentur maksimum tepat di tumpuan jepit.',
        ja: '片持ち梁では固定端の根元に最大曲げモーメントが発生します。',
      },
      targetSelector: '[data-tour="beam-support-load"]',
    },
    {
      id: 'beam-material',
      badge: {
        en: 'Feature 2 · Material',
        id: 'Fitur 2 · Material',
        ja: '機能2 · 構造材料',
      },
      title: {
        en: 'Structural Material & Custom Properties',
        id: 'Material Struktur & Properti Kustom',
        ja: '構造材料選択＆カスタム物性値',
      },
      description: {
        en: 'Choose Structural Steel, Aluminum, Timber, or ★ Custom User Material to vary Young’s Modulus (E) and Yield Strength (σy) and watch stiffness and safety factor update.',
        id: 'Pilih Baja Struktur, Aluminium, Kayu, atau ★ Material Kustom untuk mengubah Modulus Young (E) dan Kekuatan Luluh (σy).',
        ja: '構造用鋼、アルミニウム、木材、またはカスタム材料を選択し、ヤング率(E)と降伏強さ(σy)がたわみと安全率に与える影響を確認します。',
      },
      tip: {
        en: 'Higher E reduces deflection δ_max, while higher σy raises the yield Safety Factor (FoS).',
        id: 'Nilai E lebih tinggi memperkecil lendutan δ_max, sedangkan σy lebih tinggi menaikkan Faktor Keamanan (FoS).',
        ja: 'ヤング率Eが高いほどたわみδ_maxが減少し、降伏応力σyが高いほど安全率FoSが向上します。',
      },
      targetSelector: '[data-tour="beam-material"]',
    },
    {
      id: 'beam-presets',
      badge: {
        en: 'Feature 3 · Presets & CSV',
        id: 'Fitur 3 · Skenario Standar & CSV',
        ja: '機能3 · プリセット・CSV',
      },
      title: {
        en: 'Quick Benchmarks, Reset & CSV Export',
        id: 'Kasus Uji Cepat, Reset & Ekspor CSV',
        ja: '標準ベンチマーク・リセット・CSV出力',
      },
      description: {
        en: 'Load standard textbook benchmark cases from Quick Presets, click Reset to restore defaults, or export SFD/BMD/deflection arrays via CSV.',
        id: 'Muat kasus uji standar dari Pilihan Cepat (Quick Presets), klik Reset untuk mengembalikan pengaturan awal, atau ekspor data SFD/BMD/lendutan dalam format CSV.',
        ja: '標準ベンチマークの読込、初期設定へのリセット、またはSFD/BMD/たわみ分布データのCSVエクスポートが行えます。',
      },
      tip: {
        en: 'Use CSV export to plot or verify SFD and BMD values in a spreadsheet.',
        id: 'Gunakan ekspor CSV untuk memplot atau memverifikasi nilai SFD dan BMD di lembar kerja (spreadsheet).',
        ja: 'CSV出力を使うと、せん断力・曲げモーメントの数値分布を検証できます。',
      },
      targetSelector: '[data-tour="beam-presets"]',
    },
    {
      id: 'beam-diagrams',
      badge: {
        en: 'Feature 4 · SFD & BMD',
        id: 'Fitur 4 · SFD & BMD',
        ja: '機能4 · 断面力図・たわみ図',
      },
      title: {
        en: 'Deflection, SFD & BMD Visualizer',
        id: 'Visualisasi Lendutan, SFD & BMD',
        ja: 'たわみ・せん断力図(SFD)・曲げモーメント図(BMD)',
      },
      description: {
        en: 'Inspect the live deflected curve, Shear Force Diagram (V), and Bending Moment Diagram (M). Toggle Deflection Scale (5x / 15x / 30x) to exaggerate elastic bending.',
        id: 'Amati kurva lendutan secara langsung, Diagram Gaya Geser (V), dan Diagram Momen Lentur (M). Ubah Skala Lendutan (5x / 15x / 30x) untuk memperjelas lenturan elastis.',
        ja: 'たわみ曲線、SFD(V)、BMD(M)を同時に確認できます。たわみ倍率（5x / 15x / 30x）で微小なたわみも見やすく表示します。',
      },
      tip: {
        en: 'Notice that peak bending moment |M|_max always occurs where Shear Force V crosses zero!',
        id: 'Perhatikan bahwa momen lentur puncak |M|_max selalu terjadi pada titik saat Gaya Geser V memotong nilai nol!',
        ja: '最大曲げモーメント |M|_max は、せん断力 V がゼロを横切る位置で必ず発生します！',
      },
      targetSelector: '[data-tour="beam-diagrams"]',
    },
    {
      id: 'beam-loads',
      badge: {
        en: 'Feature 5 · Loads & Span',
        id: 'Fitur 5 · Beban & Bentang',
        ja: '機能5 · 支間・荷重スライダー',
      },
      title: {
        en: 'Geometry & Load Parameters',
        id: 'Parameter Geometri & Pembebanan',
        ja: '支間長・荷重スライダー',
      },
      description: {
        en: 'Adjust Span Length L, Overhang a, Point Load P and position x_P, or Distributed Load w and start/end bounds to see internal forces shift instantaneously.',
        id: 'Atur Panjang Bentang L, Bagian Gantung a, Beban Terpusat P beserta posisi x_P, atau Beban Merata w serta batas awal/akhirnya untuk melihat pergeseran gaya dalam secara seketika.',
        ja: '支間長L、張り出し長a、集中荷重Pと位置x_P、等分布荷重wと区間を調整すると、断面力が即座に再計算されます。',
      },
      tip: {
        en: 'Doubling span length L increases simply-supported deflection by 8× under a point load!',
        id: 'Menggandakan panjang bentang L meningkatkan lendutan balok tumpuan sederhana hingga 8× pada beban terpusat!',
        ja: '集中荷重下では、支間長Lを2倍にするとたわみは8倍（L³比例）に増大します！',
      },
      targetSelector: '[data-tour="beam-loads"]',
    },
    {
      id: 'beam-section',
      badge: {
        en: 'Feature 6 · Cross-Section',
        id: 'Fitur 6 · Penampang Melintang',
        ja: '機能6 · 断面設計・CAD',
      },
      title: {
        en: 'Cross-Section Design & 2D CAD',
        id: 'Desain Penampang & CAD 2D',
        ja: '断面形状設計＆2D CADプレビュー',
      },
      description: {
        en: 'Switch between I-Beam, Rectangular, and Circular profiles and tune dimensions to optimize Moment of Inertia (I_x), Section Modulus (S_x), and linear mass.',
        id: 'Beralihlah antara profil I-Beam, Persegi Panjang, dan Lingkaran lalu sesuaikan dimensinya untuk mengoptimalkan Momen Inersia (I_x), Modulus Penampang (S_x), dan massa per satuan panjang.',
        ja: 'I形鋼・長方形・円形断面を切り替え、寸法を調整して断面二次モーメント(I_x)、断面係数(S_x)、単位質量を最適化します。',
      },
      tip: {
        en: 'I-Beams place material far from the Neutral Axis (N.A.), giving much higher I_x per kg than solid rectangles.',
        id: 'Profil I-Beam menempatkan material jauh dari Sumbu Netral (N.A.), sehingga menghasilkan I_x per kg yang jauh lebih tinggi dibandingkan penampang persegi pejal.',
        ja: 'I形断面は中立軸(N.A.)から離れた位置にフランジを配置するため、同じ質量でも矩形より大きなI_xを得られます。',
      },
      targetSelector: '[data-tour="beam-section"]',
    },
    {
      id: 'beam-diagnostics',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 健全性・安全率診断',
      },
      title: {
        en: 'Deflection Limit (L/360) & Yield Safety Diagnostics',
        id: 'Diagnostik Batas Lendutan (L/360) & Keamanan Luluh',
        ja: 'たわみ限界(L/360)・降伏安全率(FoS)診断',
      },
      description: {
        en: 'Monitor δ_max against the L/360 serviceability badge and check FoS / σ_max (SAFE, MARGINAL, FAIL). Troubleshoot overstress or excessive deflection by increasing section depth or upgrading material.',
        id: 'Pantau δ_max terhadap batas kelayakan L/360 dan periksa status FoS / σ_max (SAFE, MARGINAL, FAIL). Atasi kelebihan tegangan atau lendutan berlebih dengan memperbesar tinggi penampang atau meningkatkan mutu material.',
        ja: '最大たわみδ_max（L/360判定）と降伏安全率FoS・最大応力σ_max（SAFE / MARGINAL / FAIL）を確認し、過大時は断面高さや材料を見直します。',
      },
      tip: {
        en: 'Keep FoS ≥ 1.5 and δ_max ≤ L/360 for safe structural design.',
        id: 'Jaga FoS ≥ 1,5 dan δ_max ≤ L/360 untuk desain struktur yang aman.',
        ja: '安全な構造設計のため、安全率 FoS ≥ 1.5 およびたわみ δ_max ≤ L/360 を確保しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'How do I fix a FAIL status or > L/360 deflection?',
            id: 'Bagaimana memperbaiki status FAIL atau lendutan > L/360?',
            ja: 'FAIL判定や L/360 超過を解消するにはどうすればいいですか？',
          },
          a: {
            en: 'Increase beam depth (d or h) or switch to an I-Beam profile to boost I_x and S_x, switch to a higher-E/σy steel, or shorten the unsupported span L.',
            id: 'Perbesar tinggi penampang (d atau h) atau pilih profil I-Beam untuk menaikkan I_x dan S_x, gunakan baja ber-E/σy lebih tinggi, atau perpendek bentang L.',
            ja: '断面高さ(dまたはh)を増やすかI形断面にしてI_xとS_xを高める、高強度鋼へ変更する、または支間長Lを短くします。',
          },
          keywords: ['fail', 'marginal', 'l/360', 'deflection', 'fos', 'fix', 'lendutan'],
        },
      ],
      targetSelector: '[data-tour="beam-diagnostics"]',
    },
    {
      id: 'beam-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs to explore engineering concepts, solve guided beam design tasks, and take the quiz.',
        id: 'Gunakan tab mode di atas untuk mengeksplorasi konsep, menyelesaikan latihan desain balok, dan mengikuti kuis.',
        ja: '上部タブから探索・演習・クイズへ切り替え、梁の曲げ設計の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  bearing: [
    {
      id: 'bearing-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Bearing Life (L10), Fits & Vibration Lab',
        id: 'Lab Umur Bearing (L10), Suaian & Getaran',
        ja: '転がり軸受寿命(L10)・はめあい・振動診断ラボ',
      },
      description: {
        en: 'Welcome! Evaluate ISO 281 bearing fatigue life, ISO 286 shaft/housing fits, induction heater mounting clearances, and live vibration FFT fault signatures.',
        id: 'Selamat datang! Evaluasi umur lelah bearing ISO 281, suaian poros/rumah ISO 286, celah pemasangan pemanas induksi, dan spektrum getaran FFT.',
        ja: 'ようこそ！ISO 281に基づく軸受寿命(L10)、ISO 286はめあい公差、誘導加熱組付すきま、振動FFT異常波形を総合的に解析します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each engineering module.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri tiap modul.',
        ja: '「次へ / 前へ」または ← / → キーで各解析モジュールのガイドを切り替えられます。',
      },
    },
    {
      id: 'bearing-presets',
      badge: {
        en: 'Feature 1 · Scenarios',
        id: 'Fitur 1 · Skenario',
        ja: '機能1 · シナリオ',
      },
      title: {
        en: 'Field Scenarios & Shaft Rotation',
        id: 'Skenario Lapangan & Putaran Poros',
        ja: '現場シナリオ＆回転制御',
      },
      description: {
        en: 'Load realistic cases—Standard Motor (6308), Overloaded Ball (6206), NU Axial Fault, or Heavy Fit Preload—and control shaft rotation or reset parameters.',
        id: 'Muat kasus nyata—Motor Standar (6308), Beban Berlebih (6206), Gangguan Aksial NU, atau Preload Suaian Sesak—serta atur putaran atau reset.',
        ja: '標準モータ(6308)、過負荷(6206)、NUアキシアル異常、過大しめしろ予圧のシナリオをワンクリックで再現し、回転・リセットを制御します。',
      },
      tip: {
        en: 'Try NU Axial Fault to see why cylindrical NU bearings cannot support axial thrust loads.',
        id: 'Coba Gangguan Aksial NU untuk melihat mengapa bantalan rol silinder NU tidak bisa menahan beban aksial.',
        ja: '「NUアキシアル異常」を選ぶと、NU形円筒ころ軸受がアキシアル荷重を受けられない理由を確認できます。',
      },
      targetSelector: '[data-tour="bearing-presets"]',
    },
    {
      id: 'bearing-series',
      badge: {
        en: 'Feature 2 · Bearing Series',
        id: 'Fitur 2 · Seri Bearing',
        ja: '機能2 · 軸受形式',
      },
      title: {
        en: 'Bearing Type, Dynamic C & Static C0',
        id: 'Tipe Bearing, Kapasitas C & Statis C0',
        ja: '軸受形式・動定格C・静定格C0',
      },
      description: {
        en: 'Select the bearing designation from the catalog and inspect Dynamic Rating (C), Static Rating (C0), and life exponent p (3 for ball, 10/3 for roller).',
        id: 'Pilih seri bearing dari katalog lalu amati Kapasitas Dinamis (C), Statis (C0), dan eksponen umur p (3 untuk bola, 10/3 untuk rol).',
        ja: 'カタログから軸受形式を選択し、基本動定格荷重(C)、基本静定格荷重(C0)、寿命指数p（玉: 3、ころ: 10/3）を確認します。',
      },
      tip: {
        en: 'Roller bearings use exponent p = 10/3, giving a steeper life gain when load drops than ball bearings (p = 3).',
        id: 'Bearing rol memakai eksponen p = 10/3 sehingga kenaikan umurnya lebih tajam saat beban turun dibanding bola (p = 3).',
        ja: 'ころ軸受は寿命指数 p = 10/3 のため、荷重軽減時の寿命延長効果が玉軸受(p = 3)より大きくなります。',
      },
      targetSelector: '[data-tour="bearing-series"]',
    },
    {
      id: 'bearing-loads',
      badge: {
        en: 'Feature 3 · Loads & Lube',
        id: 'Fitur 3 · Beban & Pelumas',
        ja: '機能3 · 荷重・回転・潤滑',
      },
      title: {
        en: 'Radial/Axial Loads, RPM & a_ISO Factor',
        id: 'Beban Radial/Aksial, RPM & Faktor a_ISO',
        ja: 'ラジアル/アキシアル荷重・RPM・a_ISO',
      },
      description: {
        en: 'Adjust Radial Load (Fr), Axial Load (Fa), Shaft Speed (N), and Lubrication/Contamination factor (a_ISO) to see how operating conditions govern fatigue life.',
        id: 'Atur Beban Radial (Fr), Beban Aksial (Fa), Kecepatan (N), serta faktor Pelumasan (a_ISO) untuk melihat pengaruhnya terhadap umur lelah.',
        ja: 'ラジアル荷重(Fr)、アキシアル荷重(Fa)、回転速度(N)、潤滑・汚染係数(a_ISO)を調整し、寿命への影響を確認します。',
      },
      tip: {
        en: 'Doubling equivalent load P cuts ball-bearing L10 life to 1/8 (since L10 ∝ 1/P³)!',
        id: 'Menggandakan beban ekuivalen P memangkas umur L10 bantalan bola menjadi 1/8-nya!',
        ja: '動等価荷重Pが2倍になると、玉軸受のL10寿命は1/8（3乗に反比例）に激減します！',
      },
      targetSelector: '[data-tour="bearing-loads"]',
    },
    {
      id: 'bearing-fits',
      badge: {
        en: 'Feature 4 · ISO 286 Fits',
        id: 'Fitur 4 · Suaian ISO 286',
        ja: '機能4 · ISO 286はめあい',
      },
      title: {
        en: 'Shaft & Housing Fit Tolerance Selector',
        id: 'Pemilih Toleransi Suaian Poros & Rumah',
        ja: '軸・ハウジングはめあい公差',
      },
      description: {
        en: 'Choose ISO 286 shaft (e.g. k5, m5, n6) and housing (H7, J7, K7) fit grades to inspect clearance/interference ranges in µm.',
        id: 'Pilih kode suaian poros (k5, m5, n6) dan rumah (H7, J7, K7) ISO 286 untuk memeriksa rentang celah atau interferensi dalam µm.',
        ja: '軸(k5, m5, n6等)とハウジング(H7, J7, K7等)のはめあい公差を選択し、すきま・しめしろ範囲(µm)を確認します。',
      },
      tip: {
        en: 'Too-tight interference fits (like n6) reduce internal radial clearance and can cause preload overheating.',
        id: 'Suaian interferensi terlalu sesak (seperti n6) mengurangi celah internal dan berisiko memicu panas berlebih.',
        ja: '過大なしめしろ(n6等)は軸受内部すきまを奪い、予圧過多による異常発熱の原因になります。',
      },
      targetSelector: '[data-tour="bearing-fits"]',
    },
    {
      id: 'bearing-visual',
      badge: {
        en: 'Feature 5 · 2D Visual',
        id: 'Fitur 5 · Visual 2D',
        ja: '機能5 · 回転断面ビュー',
      },
      title: {
        en: 'Live Rotating Bearing & Load-Zone Visual',
        id: 'Visual Bearing Berputar & Zona Beban',
        ja: '転がり軸受の回転・負荷領域ビュー',
      },
      description: {
        en: 'Observe rolling element motion, radial/axial force vectors, and defect highlights on the inner or outer raceway.',
        id: 'Amati gerak elemen gelinding, vektor gaya radial/aksial, serta sorotan cacat pada lintasan dalam atau luar.',
        ja: '転動体の公転・自転、ラジアル・アキシアル荷重ベクトル、内輪/外輪の傷発生箇所をリアルタイムに視覚化します。',
      },
      tip: {
        en: 'Notice how only the bottom arc of balls carries the radial load zone.',
        id: 'Perhatikan bagaimana hanya busur bawah elemen gelinding yang menopang zona beban radial.',
        ja: 'ラジアル荷重は全周ではなく、主に下側の負荷領域にある転動体で支えられています。',
      },
      targetSelector: '[data-tour="bearing-visual"]',
    },
    {
      id: 'bearing-readouts',
      badge: {
        en: 'Feature 6 · Life Readouts',
        id: 'Fitur 6 · Pembacaan Umur',
        ja: '機能6 · 寿命・静安全率',
      },
      title: {
        en: 'Equivalent Load, L10 Life & Static Safety',
        id: 'Beban Ekuivalen, Umur L10 & Keamanan Statis',
        ja: '動等価荷重・L10寿命・静安全係数',
      },
      description: {
        en: 'Track Equivalent Load (P), Basic Life (L10), Operating Hours (L10h / L10ha), Static Safety Factor (s0), and fit classification.',
        id: 'Pantau Beban Ekuivalen (P), Umur Dasar (L10), Jam Operasi (L10h / L10ha), Keamanan Statis (s0), dan klasifikasi suaian.',
        ja: '動等価荷重(P)、基本定格寿命(L10)、寿命時間(L10h/L10ha)、静安全係数(s0)、はめあい区分をリアルタイムに確認できます。',
      },
      tip: {
        en: 'Keep static safety s0 ≥ 1.5 for smooth quiet operation under shock or stationary loads.',
        id: 'Jaga keamanan statis s0 ≥ 1,5 agar lintasan tidak mengalami deformasi permanen saat beban kejut.',
        ja: '衝撃荷重や静止時の圧痕を防ぐため、静安全係数 s0 ≥ 1.5 を確保するのが目安です。',
      },
      targetSelector: '[data-tour="bearing-readouts"]',
    },
    {
      id: 'bearing-diagnostics',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 異常診断・FFT',
      },
      title: {
        en: 'Fault Injection & Vibration FFT Spectrum',
        id: 'Simulasi Cacat & Spektrum Getaran FFT',
        ja: '異常注入＆振動FFTスペクトル診断',
      },
      description: {
        en: 'Inject Outer Race (BPFO), Inner Race (BPFI), or Lubrication Starvation faults to inspect ISO 10816/20816 severity zones, bearing temperature, and characteristic FFT frequency peaks.',
        id: 'Aktifkan simulasi cacat Lintasan Luar (BPFO), Lintasan Dalam (BPFI), atau Kekurangan Pelumasan untuk mengamati zona keparahan getaran ISO 10816/20816, suhu bearing, dan puncak frekuensi FFT karakteristik.',
        ja: '外輪傷(BPFO)、内輪傷(BPFI)、潤滑不良を注入し、ISO 10816/20816の振動判定ゾーン、温度上昇、FFTピーク周波数を診断します。',
      },
      tip: {
        en: 'BPFI peaks show sidebands at ±1× shaft RPM because the inner race defect rotates in and out of the load zone.',
        id: 'Puncak BPFI memunculkan pita samping (sideband) pada ±1× RPM poros karena cacat lintasan dalam ikut berputar keluar-masuk zona beban.',
        ja: '内輪傷(BPFI)は内輪と一緒に回転するため、負荷領域の出入りにより±1×回転周波数の側帯波が現れます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I tell BPFO from BPFI on the FFT spectrum?',
            id: 'Bagaimana cara membedakan BPFO dan BPFI pada spektrum FFT?',
            ja: 'FFTスペクトルでBPFO（外輪傷）とBPFI（内輪傷）をどう見分けますか？',
          },
          a: {
            en: 'BPFO (outer race) is a stationary defect and produces clean harmonics without strong 1× RPM sidebands; BPFI (inner race) rotates through the load zone and shows clear ±1× RPM sidebands around the BPFI peak.',
            id: 'BPFO (lintasan luar) bersifat diam sehingga menghasilkan harmonik bersih tanpa pita samping 1× RPM yang kuat; sedangkan BPFI (lintasan dalam) berputar melewati zona beban sehingga memunculkan pita samping ±1× RPM yang jelas di sekitar puncak BPFI.',
            ja: '外輪傷(BPFO)は静止しているため純粋な高調波が出ますが、内輪傷(BPFI)は負荷領域を通過するたびに変調されるため±1×RPMの側帯波を伴います。',
          },
          keywords: ['bpfo', 'bpfi', 'fft', 'sideband', 'vibration', 'outer', 'inner'],
        },
      ],
      targetSelector: '[data-tour="bearing-diagnostics"]',
    },
    {
      id: 'bearing-heater',
      badge: {
        en: 'Feature 8 · Mounting',
        id: 'Fitur 8 · Pemasangan',
        ja: '機能8 · 誘導加熱組付',
      },
      title: {
        en: 'Induction Heater & Mounting Advisor',
        id: 'Panduan Pemanas Induksi & Pemasangan',
        ja: '誘導加熱ヒーター＆組付アドバイザー',
      },
      description: {
        en: 'Set the induction heater temperature (70–135 °C) to calculate diametral expansion and slip-on clearance for interference fits without exceeding the 125 °C tempering limit.',
        id: 'Atur suhu pemanas induksi (70–135 °C) untuk menghitung ekspansi diameter dan celah masuk poros tanpa melewati batas aman 125 °C.',
        ja: '誘導加熱温度（70〜135 °C）を調整し、125 °Cの上限を超えずにしめしろをクリアする内径膨張量と挿入すきまを確認します。',
      },
      tip: {
        en: 'Target 110 °C for interference mounts—never exceed 125 °C or you risk tempering steel and damaging seals.',
        id: 'Targetkan 110 °C untuk suaian sesak—jangan pernah melebihi 125 °C agar baja dan seal tidak rusak.',
        ja: '焼嵌めの推奨目標は110 °Cです。125 °Cを超えると鋼材の焼き戻しやシール損傷を招きます。',
      },
      targetSelector: '[data-tour="bearing-heater"]',
    },
    {
      id: 'bearing-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch to Explore, Practice, or Quiz in the top bar to apply ISO 281 life equations and fault diagnosis skills.',
        id: 'Beralih ke Eksplorasi, Latihan, atau Kuis di bilah atas untuk menerapkan rumus umur ISO 281 dan diagnosis cacat bearing.',
        ja: '上部タブで探索・演習・クイズに切り替え、ISO 281寿命計算や振動異常診断の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'bearing-basics': [
    {
      id: 'bearing-basics-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Bearing Types & Selection Cutaway Lab',
        id: 'Lab Jenis & Pemilihan Bantalan',
        ja: '転がり軸受の種類・構造断面ラボ',
      },
      description: {
        en: 'Welcome! Compare rolling elements, contact angle α, Open/2Z/2RS enclosures, and radial/axial load paths across standard industrial bearing architectures.',
        id: 'Selamat datang! Bandingkan elemen gelinding, sudut kontak α, pelindung Open/2Z/2RS, serta jalur beban radial/aksial pada berbagai arsitektur bantalan industri.',
        ja: 'ようこそ！各種産業用軸受の転動体、接触角α、シール構造（開放/2Z/2RS）、ラジアル・アキシアル荷重の伝達経路を比較学習します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each control.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'bearing-basics-types',
      badge: {
        en: 'Feature 1 · Architecture',
        id: 'Fitur 1 · Tipe Bantalan',
        ja: '機能1 · 軸受形式',
      },
      title: {
        en: 'Bearing Architecture Selector',
        id: 'Pemilih Jenis Konstruksi Bantalan',
        ja: '軸受形式セレクタ',
      },
      description: {
        en: 'Pick from 6205 (Deep Groove), 7205B (Angular Contact), NU205 (Cylindrical Roller), 30205 (Tapered), 22205 (Spherical), 51105 (Thrust), or UCP205 (Pillow Block).',
        id: 'Pilih 6205 (Bola Alur Dalam), 7205B (Kontak Sudut), NU205 (Rol Silinder), 30205 (Rol Tirus), 22205 (Rol Sferis), 51105 (Bantalan Aksial/Thrust), atau UCP205 (Pillow Block).',
        ja: '深溝玉(6205)、アンギュラ(7205B)、円筒ころ(NU205)、円すいころ(30205)、自動調心(22205)、スラスト(51105)、ピローブロック(UCP205)を切り替えます。',
      },
      tip: {
        en: 'Notice how roller designs (NU205, 30205, 22205) carry much higher radial loads than ball bearings.',
        id: 'Perhatikan bahwa konstruksi rol (NU205, 30205, 22205) mampu menopang beban radial jauh lebih besar dibandingkan bantalan bola.',
        ja: 'ころ軸受（NU205, 30205, 22205）は線接触のため玉軸受より高いラジアル荷重に耐えます。',
      },
      targetSelector: '[data-tour="bearing-basics-types"]',
    },
    {
      id: 'bearing-basics-seals',
      badge: {
        en: 'Feature 2 · Seals',
        id: 'Fitur 2 · Seal / Pelindung',
        ja: '機能2 · 防じんシール',
      },
      title: {
        en: 'Open, 2Z Shield & 2RS Seal Selector',
        id: 'Pemilih Pelindung Open, 2Z & 2RS',
        ja: '開放形・2Zシールド・2RS接触シール',
      },
      description: {
        en: 'Switch between Open (oil bath), 2Z (non-contact steel shields), and 2RS (contact NBR rubber seals) to see seal geometry and drag torque differences.',
        id: 'Beralihlah antara Open (bak oli), 2Z (pelindung baja non-kontak), dan 2RS (seal karet NBR kontak) untuk melihat perbedaan geometri pelindung dan torsi geseknya.',
        ja: 'Open（油潤滑向け）、2Z（非接触鋼板シールド）、2RS（接触形ゴムシール）を切り替え、防じん性と摩擦トルクの違いを確認します。',
      },
      tip: {
        en: '2RS seals block water and grit best, but contact lip friction lowers limiting grease RPM by ~38%.',
        id: 'Seal 2RS paling baik menahan air dan debu, tetapi gesekan bibir seal menurunkan batas RPM pelumasan gemuk sekitar 38%.',
        ja: '2RSは泥水・粉じんに最適ですが、接触リップ摩擦によりグリース許容回転数が約38%低下します。',
      },
      targetSelector: '[data-tour="bearing-basics-seals"]',
    },
    {
      id: 'bearing-basics-loads',
      badge: {
        en: 'Feature 3 · Loads',
        id: 'Fitur 3 · Beban Fr & Fa',
        ja: '機能3 · ラジアル/アキシアル荷重',
      },
      title: {
        en: 'Radial (Fr) & Axial (Fa) Load Sliders',
        id: 'Penggeser Beban Radial (Fr) & Aksial (Fa)',
        ja: 'ラジアル(Fr)・アキシアル(Fa)荷重',
      },
      description: {
        en: 'Vary Radial Load (Fr) and Axial Load (Fa) and toggle shaft rotation to watch force-path arrows update across the rolling elements.',
        id: 'Ubah Beban Radial (Fr) dan Aksial (Fa) serta putar poros untuk melihat panah jalur gaya pada elemen gelinding.',
        ja: 'ラジアル荷重(Fr)とアキシアル荷重(Fa)を調整し、軸回転とともに転動体を通る力線矢印の変化を確認します。',
      },
      tip: {
        en: 'Test applying Fa on NU205 or Fr on 51105 to see why load direction dictates bearing choice.',
        id: 'Coba terapkan Fa pada NU205 atau Fr pada 51105 untuk melihat mengapa arah beban menentukan pilihan bantalan.',
        ja: 'NU205にアキシアル荷重、または51105にラジアル荷重を加えて許容可否を確認してみましょう。',
      },
      targetSelector: '[data-tour="bearing-basics-loads"]',
    },
    {
      id: 'bearing-basics-cutaway',
      badge: {
        en: 'Feature 4 · CAD Cutaway',
        id: 'Fitur 4 · Potongan CAD',
        ja: '機能4 · 2D断面図',
      },
      title: {
        en: '2D Cutaway & Load-Path Visualizer',
        id: 'Visualisasi Potongan 2D & Jalur Beban',
        ja: '2D断面構造・荷重経路ビューア',
      },
      description: {
        en: 'Observe how raceway shoulders, contact angle α, and shields/seals change with each bearing type and respond to applied radial and thrust forces.',
        id: 'Amati bagaimana bahu lintasan, sudut kontak α, dan seal berubah sesuai tipe bantalan serta gaya radial dan aksial yang bekerja.',
        ja: '軌道肩形状、接触角α、シールド/シールの違いと、荷重に対する力線の変化を断面図で確認できます。',
      },
      tip: {
        en: 'Higher contact angle α (e.g. 40° on 7205B or 90° on 51105) directly increases axial thrust capacity.',
        id: 'Sudut kontak α yang lebih besar (mis. 40° pada 7205B atau 90° pada 51105) meningkatkan kapasitas aksial.',
        ja: '接触角αが大きいほど（7205Bの40°や51105の90°）、アキシアル荷重への耐性が高まります。',
      },
      targetSelector: '[data-tour="bearing-basics-cutaway"]',
    },
    {
      id: 'bearing-basics-matcher',
      badge: {
        en: 'Feature 5 · Selection',
        id: 'Fitur 5 · Pemilih Aplikasi',
        ja: '機能5 · 用途別選定',
      },
      title: {
        en: 'Interactive Application Matcher',
        id: 'Pemilih Aplikasi Bantalan Interaktif',
        ja: '用途別 最適軸受マッチャー',
      },
      description: {
        en: 'Select an operating Load & Motion Profile and Environment/Lubrication condition, then click Apply to CAD Viewer to load the recommended bearing-and-seal pair.',
        id: 'Pilih Profil Beban & Putaran serta Kondisi Lingkungan, lalu klik Terapkan ke Visual untuk memuat rekomendasi bantalan dan seal.',
        ja: '荷重・回転条件と使用環境を選択し、「断面図へ反映」をクリックすると最適な軸受とシールの組合せが反映されます。',
      },
      tip: {
        en: 'Compare how Wet Washdown vs. Clean Oil Bath changes the recommended seal from Open to 2RS.',
        id: 'Bandingkan bagaimana lingkungan Cipratan Air vs. Bak Oli Bersih mengubah rekomendasi seal dari Open ke 2RS.',
        ja: '「水洗浄環境」と「清浄油浴」で推奨シールが2RSとOpenに切り替わる点に注目してください。',
      },
      targetSelector: '[data-tour="bearing-basics-matcher"]',
    },
    {
      id: 'bearing-basics-readouts',
      badge: {
        en: 'Feature 6 · Ratings',
        id: 'Fitur 6 · Kapasitas & Putaran',
        ja: '機能6 · 定格荷重・許容回転数',
      },
      title: {
        en: 'Dynamic/Static Ratings & Speed Limits',
        id: 'Kapasitas Dinamis/Statis & Batas Putaran',
        ja: '動・静定格荷重と許容回転数',
      },
      description: {
        en: 'Compare Dynamic Cr, Static C0, Grease Limit, and Oil Limit RPM—notice how rubber 2RS contact seals reduce the limiting grease speed.',
        id: 'Bandingkan Cr Dinamis, C0 Statis, Batas Gemuk, dan Batas Oli—perhatikan bagaimana seal kontak karet 2RS menurunkan batas putaran gemuk.',
        ja: '動定格荷重Cr、静定格荷重C0、グリース/油潤滑の上限回転数を比較し、接触形シール(2RS)による許容回転数低下を確認します。',
      },
      tip: {
        en: 'Oil lubrication allows higher limiting RPM than grease because oil actively carries heat away.',
        id: 'Pelumasan oli mengizinkan batas RPM lebih tinggi daripada gemuk karena oli mengalirkan panas keluar.',
        ja: '油潤滑は冷却効果があるため、グリース潤滑よりも高い限界回転数で運転できます。',
      },
      targetSelector: '[data-tour="bearing-basics-readouts"]',
    },
    {
      id: 'bearing-basics-diagnostics',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 誤選定・荷重異常診断',
      },
      title: {
        en: 'Shop Practice Rules & Load-Path Warnings',
        id: 'Aturan Praktik Bengkel & Peringatan Jalur Beban',
        ja: '現場実務ルール＆不適合荷重アラート',
      },
      description: {
        en: 'Check this advisory card for architectural constraints—such as warning when radial load is applied to a pure thrust bearing (51105) or axial load to a cylindrical roller (NU205).',
        id: 'Periksa kartu ini untuk batasan arsitektur—misalnya peringatan saat beban radial diberikan ke thrust bearing murni (51105) atau beban aksial ke NU205.',
        ja: 'スラスト玉軸受(51105)へのラジアル負荷や円筒ころ軸受(NU205)へのアキシアル負荷など、構造上の禁止条件と実務ルールを診断します。',
      },
      tip: {
        en: 'When you see a red warning icon here, switch to 7205B or 30205 for combined radial + axial loads.',
        id: 'Bila ikon peringatan merah muncul di sini, beralihlah ke 7205B atau 30205 untuk beban kombinasi radial + aksial.',
        ja: '赤色の警告が出た場合は、複合荷重に対応できる7205Bまたは30205へ形式を変更して解消します。',
      },
      faqs: [
        {
          q: {
            en: 'Which bearing handles both heavy radial and axial loads?',
            id: 'Bantalan mana yang menahan beban radial & aksial berat?',
            ja: 'ラジアルとアキシアルの両方の重荷重に耐える軸受は？',
          },
          a: {
            en: 'Tapered Roller (30205) handles heavy combined radial + axial loads; Angular Contact (7205B) handles high-speed combined loads; NU205 is radial-only (allows thermal axial float).',
            id: 'Rol Tirus (30205) menahan kombinasi radial + aksial berat; Kontak Sudut (7205B) untuk kombinasi kecepatan tinggi; NU205 khusus radial (bebas muai aksial).',
            ja: '円すいころ軸受(30205)は重複合荷重向け、アンギュラ玉軸受(7205B)は高速複合荷重向け、NU205はラジアル専用（軸方向自由端）です。',
          },
          keywords: ['combined', 'radial', 'axial', '30205', '7205b', 'nu205', '51105'],
        },
      ],
      targetSelector: '[data-tour="bearing-basics-diagnostics"]',
    },
    {
      id: 'bearing-basics-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to test your bearing selection and seal-rating knowledge.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguji pemahaman pemilihan bantalan dan seal Anda.',
        ja: '上部タブで探索・演習・クイズを切り替え、軸受選定とシール特性の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'belt-conveyor': [
    {
      id: 'belt-conveyor-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Belt Conveyor Tracking & Alignment Lab',
        id: 'Lab Pelacakan & Pelurusan Sabuk Konveyor',
        ja: 'ベルトコンベヤ蛇行調整・アライメントラボ',
      },
      description: {
        en: 'Welcome! Diagnose and correct conveyor belt lateral wander using tail pulley take-up screws, training idlers, chute loading alignment, and head pulley squareness.',
        id: 'Selamat datang! Diagnosis dan koreksi penyimpangan sabuk konveyor menggunakan baut take-up puli ekor, training idler, posisi curahan chute, dan kelurusan puli kepala.',
        ja: 'ようこそ！テールプーリのテイクアップねじ、調心アイドラ、シュート投入位置、ヘッドプーリ傾きを操作してベルト蛇行の診断と修正を学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each tracking control.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri kontrol pelacakan.',
        ja: '「次へ / 前へ」または ← / → キーで各調整機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'belt-conveyor-presets',
      badge: {
        en: 'Feature 1 · Scenarios',
        id: 'Fitur 1 · Skenario',
        ja: '機能1 · シナリオ',
      },
      title: {
        en: 'Tracking Scenarios & Transport Controls',
        id: 'Skenario Pelacakan & Kontrol Konveyor',
        ja: '蛇行シナリオ＆運転コントロール',
      },
      description: {
        en: 'Load Centered Reference, Unequal Take-Up, Off-Center Chute Load, or Head Frame Misalignment presets, Run/Pause the belt, or click Auto-Center to see corrective alignment.',
        id: 'Muat preset Sabuk Sentris, Take-Up Timpang, Beban Chute Miring, atau Puli Kepala Miring, jalankan/jeda sabuk, atau klik Setel Sentris.',
        ja: '正常走行・テイクアップ不均等・シュート片荷・ヘッド傾き異常のプリセットを切り替え、運転/停止や自動調心を試せます。',
      },
      tip: {
        en: 'Load Unequal Take-Up first and practice squaring the tail pulley manually before clicking Auto-Center.',
        id: 'Muat Take-Up Timpang dulu dan latih meluruskan puli ekor secara manual sebelum menekan Setel Sentris.',
        ja: '「テイクアップ不均等」を選び、自動調心を使う前に手動でテールプーリを修正する練習をしてみましょう。',
      },
      targetSelector: '[data-tour="belt-conveyor-presets"]',
    },
    {
      id: 'belt-conveyor-schematic',
      badge: {
        en: 'Feature 2 · CAD View',
        id: 'Fitur 2 · Skema CAD',
        ja: '機能2 · 動的CAD図',
      },
      title: {
        en: 'Animated Conveyor Plan & Edge-Clearance View',
        id: 'Tampilan Atas Konveyor & Ruang Bebas Tepi',
        ja: 'コンベヤ平面・エッジクリアランス表示',
      },
      description: {
        en: 'Watch real-time belt lateral wander, pulley skew geometry, edge tension distribution, and frame-rail contact warnings on the animated schematic.',
        id: 'Amati penyimpangan lateral sabuk, kemiringan puli, distribusi tegangan tepi, dan peringatan gesekan rangka secara langsung.',
        ja: 'ベルトの横蛇行、プーリ傾き、左右張力分布、フレーム接触箇所をアニメーションCAD上でリアルタイムに確認できます。',
      },
      tip: {
        en: 'Red flashing edges indicate the belt has exceeded ±25 mm clearance and is rubbing the conveyor frame.',
        id: 'Tepi merah berkedip menandakan sabuk melewati batas bebas ±25 mm dan menggesek rangka konveyor.',
        ja: '端部が赤く点滅しているときは許容クリアランス(±25 mm)を超えてフレームに接触しています。',
      },
      targetSelector: '[data-tour="belt-conveyor-schematic"]',
    },
    {
      id: 'belt-conveyor-telemetry',
      badge: {
        en: 'Feature 3 · Telemetry',
        id: 'Fitur 3 · Telemetri',
        ja: '機能3 · 運転テレメトリ',
      },
      title: {
        en: '6-Card Live Tracking & Drive Telemetry',
        id: '6 Kartu Telemetri Pelacakan & Penggerak',
        ja: '蛇行量・左右張力・動力テレメトリ',
      },
      description: {
        en: 'Monitor Lateral Wander (mm), Take-Up Steering Δ(L−R), Training Idler contribution, Left/Right Edge Tensions, Drive Power (kW), and Head Pulley RPM.',
        id: 'Pantau Penyimpangan Sabuk (mm), Kemudi Take-Up Δ(L−R), kontribusi Training Idler, Tegangan Tepi Kiri/Kanan, Daya Penggerak (kW), dan RPM.',
        ja: '横蛇行量(mm)、テイクアップ差Δ(L−R)、調心アイドラ寄与分、左右ベルト張力、駆動動力(kW)、ヘッドプーリRPMを監視します。',
      },
      tip: {
        en: 'Unequal edge tensions shorten belt splice life and cause premature edge fraying.',
        id: 'Tegangan tepi yang timpang memperpendek umur sambungan sabuk dan memicu keausan tepi.',
        ja: '左右の張力不均衡が続くと、ベルト継手部の寿命低下や耳切れの原因になります。',
      },
      targetSelector: '[data-tour="belt-conveyor-telemetry"]',
    },
    {
      id: 'belt-conveyor-takeup',
      badge: {
        en: 'Feature 4 · Take-Up Screws',
        id: 'Fitur 4 · Baut Take-Up',
        ja: '機能4 · テイクアップ調整',
      },
      title: {
        en: 'Tail Pulley Screw Take-Ups',
        id: 'Baut Take-Up Puli Ekor',
        ja: 'テールプーリ・テイクアップねじ',
      },
      description: {
        en: 'Adjust Left and Right tail take-up screws independently. Remember the belt-tracking rule: the belt steers toward the side it contacts first (the loose/lagging side).',
        id: 'Atur baut take-up Kiri dan Kanan secara terpisah. Ingat aturan pelacakan: sabuk bergerak ke sisi yang lebih kendur/terlebih dulu tersentuh.',
        ja: '左右のテイクアップねじを個別に調整します。ベルトは最初に接触する側（張力が弱い側）へ寄る性質を利用して芯出しします。',
      },
      tip: {
        en: 'If the belt drifts RIGHT (+mm), tighten the RIGHT take-up screw (or loosen LEFT) to steer it back left.',
        id: 'Bila sabuk geser ke KANAN (+mm), kencangkan baut take-up KANAN (atau kendurkan KIRI) untuk mengembalikannya.',
        ja: 'ベルトが右(+)へ蛇行したら、右側ねじを締め込む（または左を緩める）と中央へ戻ります。',
      },
      faqs: [
        {
          q: {
            en: 'Which take-up screw do I tighten if the belt drifts right?',
            id: 'Baut mana yang dikencangkan bila sabuk geser ke kanan?',
            ja: 'ベルトが右へ寄るときは左右どちらのねじを締めますか？',
          },
          a: {
            en: 'Tighten the RIGHT take-up screw (increasing right-side tension/advance) or loosen the LEFT screw. By the first-contact rule, the belt shifts toward the looser/lagging side.',
            id: 'Kencangkan baut KANAN (atau kendurkan KIRI). Sesuai aturan kontak pertama, sabuk bergeser menjauhi sisi yang dikencangkan menuju sisi yang lebih kendur.',
            ja: '右側のテイクアップねじを締める（または左を緩める）ことで、ベルトは先当たりの法則により左側（中央）へ戻ります。',
          },
          keywords: ['right', 'left', 'take-up', 'screw', 'kanan', 'kiri', 'baut'],
        },
      ],
      targetSelector: '[data-tour="belt-conveyor-takeup"]',
    },
    {
      id: 'belt-conveyor-idler-chute',
      badge: {
        en: 'Feature 5 · Idler & Chute',
        id: 'Fitur 5 · Idler & Chute',
        ja: '機能5 · アイドラ・シュート',
      },
      title: {
        en: 'Training Idler Steering & Chute Offset',
        id: 'Kemudi Training Idler & Offset Chute',
        ja: '調心アイドラ操舵＆シュート偏心',
      },
      description: {
        en: 'Skew the self-aligning Training Idler (±4°) to steer the belt back to center, or inject off-center chute material loading (±60 mm) to test load-induced drift.',
        id: 'Putar sudut Training Idler (±4°) untuk mengarahkan sabuk kembali ke tengah, atau uji pergeseran akibat beban chute miring (±60 mm).',
        ja: '調心アイドラのスキュー角(±4°)でベルトを中央へ誘導したり、シュート偏心(±60 mm)による片荷蛇行を再現できます。',
      },
      tip: {
        en: 'Always center off-center chute loading first—idlers should not be forced to fight a crooked chute.',
        id: 'Selalu luruskan curahan chute terlebih dahulu—jangan memaksa training idler melawan beban miring.',
        ja: 'シュート片荷がある場合は、調心アイドラに頼る前にまず投入位置を中央へ修正するのが鉄則です。',
      },
      targetSelector: '[data-tour="belt-conveyor-idler-chute"]',
    },
    {
      id: 'belt-conveyor-faults',
      badge: {
        en: 'Feature 6 · Speed & Skew',
        id: 'Fitur 6 · Laju & Miring',
        ja: '機能6 · 速度・ヘッド傾き',
      },
      title: {
        en: 'Drive Speed & Head Pulley Misalignment',
        id: 'Kecepatan Sabuk & Kemiringan Puli Kepala',
        ja: 'ベルト速度＆ヘッドプーリ傾き異常',
      },
      description: {
        en: 'Vary belt speed (0.8–3.5 m/s) to see drive power scale, and inject Head Pulley Skew (±1.5°) to simulate frame misalignment at the discharge end.',
        id: 'Ubah kecepatan sabuk (0,8–3,5 m/s) untuk mengamati perubahan daya penggerak, lalu simulasikan kemiringan puli kepala (±1,5°) untuk meniru ketidaklurusan rangka di sisi buang.',
        ja: 'ベルト速度(0.8〜3.5 m/s)で駆動動力の変化を確認し、ヘッドプーリ傾き(±1.5°)で排出端のフレーム歪みを再現できます。',
      },
      tip: {
        en: 'Square the head pulley to 0.0° first whenever diagnosing persistent tracking drift near the discharge.',
        id: 'Luruskan puli kepala ke 0,0° terlebih dahulu apabila penyimpangan terus terjadi di dekat ujung buang.',
        ja: '排出端付近で蛇行が収まらない場合は、まずヘッドプーリの直角度(0.0°)を確認します。',
      },
      targetSelector: '[data-tour="belt-conveyor-faults"]',
    },
    {
      id: 'belt-conveyor-diagnostics',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 蛇行トラブル診断',
      },
      title: {
        en: 'Belt Tracking Diagnostic & First-Contact Rule',
        id: 'Diagnosis Pelacakan Sabuk & Aturan Kontak Pertama',
        ja: 'ベルト蛇行診断＆先当たりの法則',
      },
      description: {
        en: 'Inspect the live diagnostic banner for CRITICAL frame-rubbing alerts (> ±25 mm wander), chute off-center causes, and step-by-step corrective actions.',
        id: 'Periksa panel diagnosis untuk peringatan KRITIS gesekan rangka (> ±25 mm), penyebab curahan chute miring, serta langkah koreksinya.',
        ja: '診断バナーで許容限界(±25 mm)超過によるフレーム接触警報、シュート片荷の影響、具体的な修正手順を確認します。',
      },
      tip: {
        en: 'Follow the order: 1) Center chute feed, 2) Square head/tail pulleys, 3) Fine-tune training idler.',
        id: 'Ikuti urutan: 1) Sentriskan chute, 2) Luruskan puli kepala/ekor, 3) Setel halus training idler.',
        ja: '修正手順は「①シュート中央化 → ②ヘッド/テールプーリ直角度調整 → ③調心アイドラ微調整」が基本です。',
      },
      targetSelector: '[data-tour="belt-conveyor-diagnostics"]',
    },
    {
      id: 'belt-conveyor-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to master conveyor tracking troubleshooting.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguasai pemecahan masalah pelacakan konveyor.',
        ja: '上部タブで探索・演習・クイズを切り替え、ベルトコンベヤの蛇行修正スキルをテストできます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'belt-gear': [
    {
      id: 'belt-gear-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'V-Belt & Spur Gear Drive Lab',
        id: 'Lab Penggerak V-Belt & Roda Gigi Lurus',
        ja: 'Vベルト・平歯車伝動システムラボ',
      },
      description: {
        en: 'Welcome! Compare V-Belt friction drives and Spur Gear positive-mesh drives—analyzing speed ratio, torque multiplication, belt slip, gear backlash, and AGMA tooth safety.',
        id: 'Selamat datang! Bandingkan penggerak gesek V-Belt dan penggerak roda gigi lurus—menganalisis rasio kecepatan, torsi, slip sabuk, backlash, dan keamanan gigi AGMA.',
        ja: 'ようこそ！Vベルト伝動と平歯車伝動の変速比、トルク伝達、ベルトスリップ、バックラッシ、AGMA歯面・曲げ安全率を比較解析します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each drive feature.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri tiap fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各伝動機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'belt-gear-mode',
      badge: {
        en: 'Feature 1 · Drive Mode',
        id: 'Fitur 1 · Mode Penggerak',
        ja: '機能1 · 駆動方式切替',
      },
      title: {
        en: 'V-Belt vs. Spur Gear Mode Switcher',
        id: 'Pemilih Mode V-Belt vs. Roda Gigi Lurus',
        ja: 'Vベルト / 平歯車切替スイッチ',
      },
      description: {
        en: 'Toggle between V-Belt Drive (friction power transmission with slip) and Spur Gear Drive (positive tooth engagement with backlash).',
        id: 'Beralih antara Penggerak V-Belt (transmisi gesek dengan slip) dan Roda Gigi Lurus (pertautan gigi positif dengan backlash).',
        ja: 'Vベルト駆動（摩擦伝動・スリップあり）と平歯車駆動（噛み合い伝動・バックラッシあり）を切り替えます。',
      },
      tip: {
        en: 'Use V-Belts for shock absorption and long spans; use Spur Gears when exact synchronization is required.',
        id: 'Gunakan V-Belt untuk meredam kejut dan jarak jauh; gunakan Roda Gigi bila butuh sinkronisasi presisi.',
        ja: '衝撃吸収や長軸間にはVベルト、厳密な同期や高トルク伝達には歯車駆動が適しています。',
      },
      targetSelector: '[data-tour="belt-gear-mode"]',
    },
    {
      id: 'belt-gear-readouts',
      badge: {
        en: 'Feature 2 · Kinematics',
        id: 'Fitur 2 · Kinematika',
        ja: '機能2 · 伝動諸元',
      },
      title: {
        en: 'Speed Ratio, Output Torque & Length/Center',
        id: 'Rasio Kecepatan, Torsi Output & Panjang/Jarak Pusat',
        ja: '変速比・出力トルク・ベルト長/中心距離',
      },
      description: {
        en: 'Read live Speed Ratio (i), Output RPM (N₂), Output Torque (T₂), Belt Length or Center Distance, and Slip/Backlash efficiency.',
        id: 'Baca langsung Rasio Kecepatan (i), Putaran Output (N₂), Torsi Output (T₂), Panjang Sabuk atau Jarak Pusat, serta Slip/Backlash.',
        ja: '変速比(i)、出力回転数(N₂)、出力トルク(T₂)、ベルト長/中心距離、スリップ・バックラッシ効率をリアルタイムに確認できます。',
      },
      tip: {
        en: 'A speed-reduction ratio i > 1 multiplies output torque T₂ proportionally (minus friction losses).',
        id: 'Rasio reduksi i > 1 melipatgandakan torsi output T₂ secara proporsional (dikurangi rugi gesek).',
        ja: '減速比 i > 1 の場合、出力トルク T₂ は損失分を除き変速比に比例して増大します。',
      },
      targetSelector: '[data-tour="belt-gear-readouts"]',
    },
    {
      id: 'belt-gear-canvas',
      badge: {
        en: 'Feature 3 · 2D Canvas',
        id: 'Fitur 3 · Kanvas 2D',
        ja: '機能3 · 2Dアニメーション',
      },
      title: {
        en: 'Interactive Belt & Gear Meshing Canvas',
        id: 'Kanvas Interaktif Sabuk & Pertautan Roda Gigi',
        ja: 'ベルト・歯車噛み合いリアルタイム図',
      },
      description: {
        en: 'Observe tight-side vs. slack-side belt deflection, sheave wrap angle, or spur gear tooth backlash and pitch-circle contact in motion.',
        id: 'Amati defleksi sisi kencang vs. kendur sabuk, sudut lilitan puli, atau backlash gigi dan lingkaran jarak bagi roda gigi saat berputar.',
        ja: '張り側/緩み側のたわみや巻き付け角、または平歯車のピッチ円接触とバックラッシをアニメーションで確認できます。',
      },
      tip: {
        en: 'Watch belt whip on the slack span when tension drops too low!',
        id: 'Perhatikan kibasan sabuk pada sisi kendur saat ketegangan terlalu rendah!',
        ja: '張力が低すぎると緩み側のベルトが大きく波打つ（バタつき）様子が見えます。',
      },
      targetSelector: '[data-tour="belt-gear-canvas"]',
    },
    {
      id: 'belt-gear-controls',
      badge: {
        en: 'Feature 4 · Parameters',
        id: 'Fitur 4 · Parameter',
        ja: '機能4 · 設計パラメータ',
      },
      title: {
        en: 'Pulley / Gear Geometry & Tension Controls',
        id: 'Kontrol Geometri Puli / Roda Gigi & Ketegangan',
        ja: 'プーリ・歯車諸元＆張力調整',
      },
      description: {
        en: 'Tune belt section, pulley diameters (D₁, D₂), center distance, and tension—or gear module, tooth counts (Z₁, Z₂), center distance, and input RPM.',
        id: 'Atur profil sabuk, diameter puli (D₁, D₂), jarak pusat, dan ketegangan—atau modul gigi, jumlah gigi (Z₁, Z₂), jarak pusat, dan RPM input.',
        ja: 'Vベルトの断面・プーリ径・軸間距離・張力、または歯車モジュール・歯数(Z₁, Z₂)・中心距離・入力RPMを調整します。',
      },
      tip: {
        en: 'Keep D₁ ≥ D_min for the selected V-belt section to avoid premature cord bending fatigue.',
        id: 'Jaga D₁ ≥ D_min untuk profil V-belt terpilih agar kawat sabuk tidak cepat lelah tekuk.',
        ja: 'ベルトの曲げ疲労を防ぐため、小プーリ径 D₁ は各断面の最小径 D_min 以上を保ってください。',
      },
      targetSelector: '[data-tour="belt-gear-controls"]',
    },
    {
      id: 'belt-gear-diagnostics',
      badge: {
        en: 'Feature 5 · Telemetry',
        id: 'Fitur 5 · Telemetri',
        ja: '機能5 · 運転テレメトリ',
      },
      title: {
        en: 'Live Drive Diagnostics Telemetry',
        id: 'Telemetri Diagnostik Penggerak Langsung',
        ja: '駆動診断テレメトリ（温度・振動・騒音）',
      },
      description: {
        en: 'Watch Belt/Mesh Temperature, Slip or Backlash, Vibration RMS (mm/s), and Acoustic Noise (dBA) along with bending fatigue and AGMA safety warnings.',
        id: 'Pantau Suhu Sabuk/Gigi, Slip atau Backlash, Getaran RMS (mm/s), Kebisingan (dBA), serta peringatan kelelahan tekuk dan keamanan AGMA.',
        ja: 'ベルト/歯面温度、スリップ/バックラッシ、振動RMS、騒音dBAと、最小プーリ径や遠心張力・AGMA安全率の警告を監視します。',
      },
      tip: {
        en: 'High temperature + high slip means a loose belt; high vibration + high noise with zero backlash means an over-tight gear mesh!',
        id: 'Suhu tinggi + slip tinggi menandakan sabuk kendur; getaran + bising tinggi dengan backlash nol menandakan roda gigi terlalu rapat!',
        ja: '高温＋高スリップはベルト緩み、高振動＋高騒音＋バックラッシ過小は歯車の中心距離詰め過ぎのサインです。',
      },
      targetSelector: '[data-tour="belt-gear-diagnostics"]',
    },
    {
      id: 'belt-gear-notes',
      badge: {
        en: 'Feature 6 · Engineering',
        id: 'Fitur 6 · Catatan Teknik',
        ja: '機能6 · 標準ベルト・AGMA安全率',
      },
      title: {
        en: 'Standard Belt Matcher & AGMA Tooth Safety',
        id: 'Pemilihan Sabuk Standar & Keamanan Gigi AGMA',
        ja: '標準ベルト選定＆AGMA歯車安全率',
      },
      description: {
        en: 'Inspect the nearest standard V-belt designation (ΔL and slide-base C adjustment) or AGMA bending (S_F) and contact (S_H) safety factors for spur gears.',
        id: 'Periksa kode sabuk standar terdekat (ΔL dan penyetelan jarak pusat C) atau faktor keamanan tekuk (S_F) dan kontak (S_H) AGMA pada roda gigi.',
        ja: 'Vベルトでは最寄り標準ベルト長と中心距離調整量(ΔL/2)、歯車ではAGMA曲げ安全率(S_F)と歯面接触安全率(S_H)を確認します。',
      },
      tip: {
        en: 'Keep both AGMA S_F and S_H above 1.25 for reliable industrial gear life.',
        id: 'Jaga nilai S_F dan S_H AGMA di atas 1,25 untuk umur pakai roda gigi industri yang andal.',
        ja: '産業用歯車の信頼性確保には AGMA安全率 S_F・S_H ともに 1.25 以上が目安です。',
      },
      targetSelector: '[data-tour="belt-gear-notes"]',
    },
    {
      id: 'belt-gear-troubleshooting',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 故障診断モード',
      },
      title: {
        en: 'Interactive Fault Injection & Blind Diagnosis',
        id: 'Simulasi Gangguan & Diagnosis Mandiri Interaktif',
        ja: '故障注入＆ブラインド診断モード',
      },
      description: {
        en: 'Click Troubleshooting Mode to inject real V-Belt or Spur Gear faults (slip, misalignment, worn teeth, tight mesh) and diagnose the root cause from telemetry.',
        id: 'Klik Mode Diagnosis Gangguan untuk mengaktifkan simulasi gangguan V-Belt atau Roda Gigi dan mendiagnosis akar masalahnya dari data telemetri.',
        ja: '「故障診断モード」を開くと、Vベルトや歯車の異常を注入して温度・振動・騒音データから原因を特定する演習が行えます。',
      },
      tip: {
        en: 'Use Blind Mode to hide the fault name and challenge yourself using only temperature, slip/backlash, vibration, and dBA!',
        id: 'Gunakan Mode Tanpa Petunjuk (Blind Mode) untuk menyembunyikan nama gangguan dan menguji kemampuan Anda hanya dari data suhu, slip/backlash, getaran, dan dBA!',
        ja: 'ブラインドモードでは異常名を隠した状態で、温度・振動・騒音データだけから原因を特定する実践訓練ができます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I diagnose loose belt vs. over-tight belt?',
            id: 'Bagaimana membedakan sabuk kendur vs. terlalu kencang?',
            ja: 'ベルトの「緩み」と「張り過ぎ」はどう見分けますか？',
          },
          a: {
            en: 'A loose belt causes high slip (>2%), belt squeal, and frictional heating; an over-tight belt has ~0% slip but overloads shaft bearings and raises vibration.',
            id: 'Sabuk kendur memicu slip tinggi (>2%), bunyi berdecit, dan panas gesek; sabuk terlalu kencang berslip ~0% tetapi membebani bantalan dan menaikkan getaran.',
            ja: '緩みはスリップ率上昇(>2%)・鳴き・摩擦発熱を起こし、張り過ぎはスリップほぼ0%のまま軸受荷重と振動を増大させます。',
          },
          keywords: ['loose', 'tight', 'slip', 'vibration', 'kendur', 'kencang', 'diagnose'],
        },
      ],
      targetSelector: '[data-tour="belt-gear-troubleshooting"]',
    },
    {
      id: 'belt-gear-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to test your mechanical drive calculations.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguji perhitungan penggerak mekanis Anda.',
        ja: '上部タブで探索・演習・クイズを切り替え、ベルト・歯車伝動の計算と診断力を試せます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'bolt-torque': [
    {
      id: 'bolt-torque-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Bolt Torque, Preload & Flange Tightening Lab',
        id: 'Lab Torsi Baut, Preload & Pengencangan Flens',
        ja: 'ボルト締付トルク・軸力・フランジ締付ラボ',
      },
      description: {
        en: 'Welcome! Explore T = K · d · Fi fastener mechanics, compare dry vs. lubricated nut factors (K), avoid proof-load yielding, and practice multi-bolt star-pattern tightening.',
        id: 'Selamat datang! Pelajari mekanika baut T = K · d · Fi, bandingkan faktor mur K kering vs. berpelumas, hindari luluh, dan latih pengencangan pola bintang.',
        ja: 'ようこそ！T = K・d・Fiの締付理論、乾燥と潤滑のトルク係数Kの違い、耐力超過の防止、星型交差締付手順を実践的に学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each fastener control.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri tiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'bolt-torque-size',
      badge: {
        en: 'Feature 1 · Bolt Size',
        id: 'Fitur 1 · Ukuran Baut',
        ja: '機能1 · ボルト径',
      },
      title: {
        en: 'Metric Bolt Size & Tensile Area (At)',
        id: 'Ukuran Baut Metrik & Luas Tarik (At)',
        ja: 'メートル並目ねじ径＆有効断面積(At)',
      },
      description: {
        en: 'Select ISO coarse metric bolt sizes from M6 to M20 and inspect how thread pitch p and tensile stress area At scale clamping capacity.',
        id: 'Pilih ukuran baut metrik ISO kasar dari M6 hingga M20 dan amati bagaimana pitch ulir p serta luas tarik At menentukan kapasitas jepit.',
        ja: 'M6〜M20のISO並目ねじサイズを選択し、ねじピッチpと有効断面積Atが締付軸力に与える影響を確認します。',
      },
      tip: {
        en: 'Doubling bolt diameter quadruples tensile stress area At, allowing ~4× higher clamping force.',
        id: 'Menggandakan diameter baut memperbesar luas tarik At 4× lipat sehingga gaya jepit naik ~4×.',
        ja: 'ボルト径を2倍にすると有効断面積Atは約4倍になり、許容軸力も約4倍に増えます。',
      },
      targetSelector: '[data-tour="bolt-size"]',
    },
    {
      id: 'bolt-torque-lube',
      badge: {
        en: 'Feature 2 · Nut Factor K',
        id: 'Fitur 2 · Faktor Mur K',
        ja: '機能2 · 潤滑・K係数',
      },
      title: {
        en: 'Surface & Lubrication Condition (K-Factor)',
        id: 'Kondisi Permukaan & Pelumasan (Faktor K)',
        ja: '表面・潤滑条件（トルク係数 K）',
      },
      description: {
        en: 'Switch between Dry Steel (K=0.20), Light Machine Oil, Moly Grease, and Anti-Seize to see how thread/underhead friction shifts torque-to-preload conversion.',
        id: 'Beralih antara Baja Kering (K=0,20), Oli Mesin, Gemuk Moly, dan Anti-Seize untuk melihat pengaruh gesekan ulir terhadap konversi torsi ke preload.',
        ja: '乾燥鋼(K=0.20)、機械油、モリブデングリース、焼付防止剤を切り替え、摩擦変化がトルク−軸力変換に及ぼす影響を確認します。',
      },
      tip: {
        en: 'Over 85% of applied wrench torque is consumed by friction under the nut head and threads—not stretching the bolt!',
        id: 'Lebih dari 85% torsi kunci momen habis untuk mengatasi gesekan di bawah kepala baut dan ulir!',
        ja: '印加トルクの85%以上は座面とねじ面の摩擦で消費され、実際の軸力になるのは約10〜15%だけです！',
      },
      targetSelector: '[data-tour="bolt-lube"]',
    },
    {
      id: 'bolt-torque-wrench',
      badge: {
        en: 'Feature 3 · Torque Wrench',
        id: 'Fitur 3 · Kunci Momen',
        ja: '機能3 · トルクレンチ操作',
      },
      title: {
        en: 'Applied Wrench Torque & Proof Presets',
        id: 'Torsi Kunci Momen & Preset Persen Proof',
        ja: '印加トルク調整＆耐力比プリセット',
      },
      description: {
        en: 'Sweep the Torque Slider or click 50% / 75% Target / 92% Caution / 110% Yield presets—listen for the mechanical click-wrench snap when reaching 75% proof target.',
        id: 'Geser Penggeser Torsi atau klik pilihan 50% / 75% Target / 92% Waspada / 110% Luluh—dengarkan bunyi klik kunci momen saat mencapai target 75% beban proof.',
        ja: 'スライダーまたは50% / 75%目標 / 92%注意 / 110%降伏のプリセットを操作し、75%目標到達時のクリック音（音声ON時）を確認します。',
      },
      tip: {
        en: 'Standard non-permanent bolted joints are torqued to ~75% of proof load for safe elastic clamping.',
        id: 'Sambungan baut standar yang dapat dibongkar dikencangkan ke ~75% beban proof untuk jepitan elastis yang aman.',
        ja: '再使用可能な標準ボルト締結では、弾性域内の安全な軸力として保証荷重の約75%を目標にします。',
      },
      targetSelector: '[data-tour="bolt-wrench"]',
    },
    {
      id: 'bolt-torque-readout',
      badge: {
        en: 'Feature 4 · Preload Readout',
        id: 'Fitur 4 · Pembacaan Preload',
        ja: '機能4 · 軸力・応力計測',
      },
      title: {
        en: 'Live Preload, Tensile Stress & Elongation',
        id: 'Preload Langsung, Tegangan Tarik & Elongasi',
        ja: '締付軸力(Fi)・引張応力・弾性伸び',
      },
      description: {
        en: 'Monitor Clamping Preload (Fi), Tensile Stress (σt), Proof Capacity %, Thread Stress Area (As), and Elastic Elongation (ΔL) on the animated wrench gauge.',
        id: 'Pantau Gaya Jepit (Fi), Tegangan Tarik (σt), Kapasitas Proof %, Luas Ulir (As), dan Elongasi Elastis (ΔL) secara langsung.',
        ja: '締付軸力(Fi)、引張応力(σt)、保証荷重比(%)、有効断面積(As)、弾性伸び(ΔL)をトルクレンチSVGとともに確認できます。',
      },
      tip: {
        en: 'Elastic elongation ΔL is the most accurate physical measure of true bolt preload when friction varies.',
        id: 'Elongasi elastis ΔL adalah ukuran fisik paling akurat dari preload baut sebenarnya saat gesekan berubah.',
        ja: '摩擦ばらつきの影響を受けないため、弾性伸びΔLの計測が最も正確な軸力管理手法です。',
      },
      targetSelector: '[data-tour="bolt-readout"]',
    },
    {
      id: 'bolt-torque-diagnostics',
      badge: {
        en: 'Feature 5 · Troubleshoot',
        id: 'Fitur 5 · Diagnosis Gangguan',
        ja: '機能5 · 過締付・降伏診断',
      },
      title: {
        en: 'Preload & Yield Failure Diagnostic Banner',
        id: 'Panel Diagnostik Preload & Kegagalan Luluh',
        ja: '軸力不足・過トルク降伏診断バナー',
      },
      description: {
        en: 'Check this banner for under-torque loosening risks, optimal 75% proof target confirmation, or critical over-torque / bolt yield warnings—then adjust torque or K-factor to restore safe clamping.',
        id: 'Periksa panel ini untuk memantau risiko baut kendur akibat torsi kurang, konfirmasi target optimal 75% beban proof, atau peringatan kritis torsi berlebih / luluh baut—lalu sesuaikan torsi atau faktor K untuk memulihkan gaya jepit yang aman.',
        ja: 'トルク不足による緩みリスク、適正締付（耐力75%目標）、または保証荷重超過によるボルト降伏警告を確認し、適正値へ修正します。',
      },
      tip: {
        en: 'Once a bolt exceeds 100% proof load, permanent plastic necking occurs and the fastener must be replaced.',
        id: 'Begitu baut melewati 100% beban proof, terjadi deformasi plastis permanen dan baut wajib diganti.',
        ja: '100%保証荷重を超えると永久伸び（塑性変形）が生じるため、そのボルトは再使用できません。',
      },
      faqs: [
        {
          q: {
            en: 'Why did my bolt yield even though I used the dry torque spec?',
            id: 'Mengapa baut luluh padahal saya memakai torsi spek kering?',
            ja: '乾燥仕様のトルクを使ったのになぜボルトが降伏したのですか？',
          },
          a: {
            en: 'If lubricant or anti-seize was applied to the threads (lowering K from 0.20 to 0.12), the same wrench torque T produces ~67% more preload Fi = T/(K·d), pushing stress past yield.',
            id: 'Jika pelumas atau anti-seize mengenai ulir (menurunkan K dari 0,20 ke 0,12), torsi T yang sama menghasilkan preload Fi ~67% lebih besar hingga melewati batas luluh.',
            ja: 'ねじ部に潤滑剤や焼付防止剤が付着してK値が0.20から0.12へ下がると、同じトルクでも軸力Fiが約1.67倍に急増し降伏するためです。',
          },
          keywords: ['yield', 'lubricated', 'anti-seize', 'k', 'over-torque', 'luluh', 'pelumas'],
        },
      ],
      targetSelector: '[data-tour="bolt-diagnostics"]',
    },
    {
      id: 'bolt-torque-dry-lube',
      badge: {
        en: 'Feature 6 · K-Factor Trap',
        id: 'Fitur 6 · Jebakan Faktor K',
        ja: '機能6 · 乾燥 vs 潤滑比較',
      },
      title: {
        en: 'Dry vs. Lubricated Over-Torque Comparison',
        id: 'Perbandingan Over-Torque Kering vs. Berpelumas',
        ja: '乾燥仕様トルクの潤滑ボルト適用リスク',
      },
      description: {
        en: 'Compare side-by-side how applying a dry-bolt torque spec to a lubricated fastener spikes preload dangerously past yield, and click Apply Dry Spec to test it live.',
        id: 'Bandingkan langsung bagaimana menerapkan torsi baut kering ke baut berpelumas membuat preload melonjak melewati batas luluh.',
        ja: '乾燥ボルト用の規定トルクを潤滑ボルトに適用した際の軸力急増を並べて比較し、ワンクリックで再現できます。',
      },
      tip: {
        en: 'Always reduce target torque by ~25–40% when switching from dry fasteners to moly grease or anti-seize.',
        id: 'Selalu kurangi target torsi ~25–40% saat beralih dari baut kering ke gemuk moly atau anti-seize.',
        ja: '乾燥からモリブデングリースや焼付防止剤へ変更する場合は、規定トルクを約25〜40%低減させる必要があります。',
      },
      targetSelector: '[data-tour="bolt-dry-vs-lube"]',
    },
    {
      id: 'bolt-torque-flange',
      badge: {
        en: 'Feature 7 · Star Pattern',
        id: 'Fitur 7 · Pola Bintang',
        ja: '機能7 · フランジ星型締付',
      },
      title: {
        en: 'Flange Star-Pattern Tightening Mini-Lab',
        id: 'Mini-Lab Pengencangan Flens Pola Bintang',
        ja: 'フランジ星型交差締付ミニラボ',
      },
      description: {
        en: 'Tighten flange bolts in criss-cross star passes (30% → 70% → 100%) to prevent gasket pinching and uneven flange seating.',
        id: 'Kencangkan baut flens secara menyilang pola bintang (30% → 70% → 100%) untuk mencegah paking terjepit dan flens miring.',
        ja: '3段階（30% → 70% → 100%）の対角・星型順序でフランジボルトを締め付け、ガスケットの片締めを防止する手順を練習します。',
      },
      tip: {
        en: 'Never torque one bolt to 100% on the first pass—gradual star passes keep gasket compression uniform.',
        id: 'Jangan pernah mengencangkan satu baut ke 100% pada putaran pertama—pola bintang bertahap menjaga tekanan paking merata.',
        ja: '1周目から100%で締めるとフランジが傾くため、必ず30%→70%→100%の対角順で均等に締め上げます。',
      },
      targetSelector: '[data-tour="bolt-flange-star"]',
    },
    {
      id: 'bolt-torque-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to test your fastener preload and torque-wrench skills.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguji kemampuan perhitungan preload dan kunci momen Anda.',
        ja: '上部タブで探索・演習・クイズを切り替え、ボルト締付計算と施工手順の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'bore-gauge': [
    {
      id: 'bore-gauge-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Cylinder Bore Gauge, Ovality & Taper Lab',
        id: 'Lab Bore Gauge, Ovalitas & Ketirusan Silinder',
        ja: 'シリンダゲージ・楕円度・テーパ測定ラボ',
      },
      description: {
        en: 'Welcome! Master 6-point cylinder liner inspection using a dial bore gauge—finding the 0.0° null reversal point, mapping ovality and taper, and making OEM re-bore decisions.',
        id: 'Selamat datang! Kuasai inspeksi liner silinder 6-titik dengan dial bore gauge—menemukan titik balik 0.0°, memetakan ovalitas & ketirusan, serta menentukan keputusan re-bore OEM.',
        ja: 'ようこそ！ダイヤルボアゲージを用いた6点シリンダライナ測定を習得し、0.0°反転点の読み取り、楕円度・テーパ算出、OEM再ボーリング判定を行います。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each metrology control.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri tiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各測定機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'bore-gauge-bezel',
      badge: {
        en: 'Feature 1 · Zero Calibration',
        id: 'Fitur 1 · Kalibrasi Nol',
        ja: '機能1 · ベゼルゼロ補正',
      },
      title: {
        en: 'Master Ring & Bezel Zero Offset',
        id: 'Master Ring & Pengaturan Nol Bezel',
        ja: '基準リング＆ベゼルゼロ補正',
      },
      description: {
        en: 'Verify the Ø85.000 mm Master Ring reference and test Bezel Zero offset (−0.02 / 0.00 / +0.02 mm) to see how mis-zeroed dial bezels shift every bore reading.',
        id: 'Periksa referensi Master Ring Ø85.000 mm dan uji offset Nol Bezel (−0,02 / 0,00 / +0,02 mm) untuk melihat dampaknya pada hasil ukur.',
        ja: '基準リングØ85.000 mmに対するベゼルゼロ補正（−0.02 / 0.00 / +0.02 mm）を切り替え、ゼロ点ズレが測定値に与える影響を確認します。',
      },
      tip: {
        en: 'Always zero the dial bezel in a calibrated master ring before measuring an engine block.',
        id: 'Selalu nolkan bezel dial pada master ring terkalibrasi sebelum mengukur blok silinder.',
        ja: '実測前には必ず基準リングゲージでダイヤルのゼロ点を合わせてから測定を開始します。',
      },
      targetSelector: '[data-tour="bore-gauge-bezel"]',
    },
    {
      id: 'bore-gauge-presets',
      badge: {
        en: 'Feature 2 · Liner Profiles',
        id: 'Fitur 2 · Profil Liner',
        ja: '機能2 · ライナ摩耗条件',
      },
      title: {
        en: 'Cylinder Liner Wear Presets & Blind Challenge',
        id: 'Profil Keausan Liner & Tantangan Inspeksi Mandiri',
        ja: '摩耗プロファイル＆ブラインド検査',
      },
      description: {
        en: 'Load Serviceable, Taper Wear, Ovality Wear, Severe Wear, or Blind Inspection Challenge profiles to practice diagnosing real diesel/engine liner wear patterns.',
        id: 'Muat profil Layak Pakai, Aus Tirus, Aus Oval, Aus Parah, atau Tantangan Inspeksi Mandiri untuk berlatih mendiagnosis pola keausan liner mesin.',
        ja: '正常・テーパ摩耗・楕円摩耗・重度摩耗・ブラインド検査の各プロファイルを読み込み、摩耗パターンの診断を練習します。',
      },
      tip: {
        en: 'Try Blind Challenge to inspect an unknown liner and submit your own PASS or RE-BORE QC verdict!',
        id: 'Coba Tantangan Inspeksi Mandiri untuk memeriksa liner tak dikenal dan mengirimkan keputusan QC LULUS atau RE-BORE Anda!',
        ja: 'ブラインド検査では未知のライナを6点測定し、合格(PASS)か再ボーリング(RE-BORE)かを自分で判定できます！',
      },
      targetSelector: '[data-tour="bore-gauge-presets"]',
    },
    {
      id: 'bore-gauge-depth',
      badge: {
        en: 'Feature 3 · Depth Plane',
        id: 'Fitur 3 · Kedalaman Ukur',
        ja: '機能3 · 測定深さ位置',
      },
      title: {
        en: 'Probe Depth Plane (Top / Mid / Bottom)',
        id: 'Posisi Kedalaman Probe (Atas / Tengah / Bawah)',
        ja: '測定深さ位置（上部・中央・下部）',
      },
      description: {
        en: 'Position the bore gauge at Top (15 mm, near TDC ring reversal), Mid (75 mm), or Bottom (135 mm) to capture axial taper along the cylinder wall.',
        id: 'Posisikan bore gauge di Atas (15 mm), Tengah (75 mm), atau Bawah (135 mm) untuk menangkap ketirusan aksial dinding silinder.',
        ja: '上部(15 mm・上死点リング折返し付近)、中央(75 mm)、下部(135 mm)を切り替え、軸方向のテーパ摩耗を測定します。',
      },
      tip: {
        en: 'The greatest wear almost always occurs at Top (15 mm) where combustion pressure pushes the top ring hardest.',
        id: 'Keausan terbesar hampir selalu terjadi di Atas (15 mm) tempat tekanan pembakaran menekan ring terkuat.',
        ja: '燃焼圧力が最大となる上部(15 mm)付近が最も摩耗しやすく、最大径になりやすい箇所です。',
      },
      targetSelector: '[data-tour="bore-gauge-depth"]',
    },
    {
      id: 'bore-gauge-rocking',
      badge: {
        en: 'Feature 4 · Null Reversal',
        id: 'Fitur 4 · Titik Balik',
        ja: '機能4 · 揺動＆最小反転点',
      },
      title: {
        en: 'Gauge Rocking Angle & 0.0° Null Point',
        id: 'Sudut Goyang Gauge & Titik Balik 0.0°',
        ja: 'ゲージ揺動角＆0.0°最小反転点',
      },
      description: {
        en: 'Rock the gauge (-8° to +8°), click Rock for automatic sweeping, or click 0.0° to snap to the true perpendicular null reversal point where the needle reverses direction.',
        id: 'Goyangkan gauge (-8° s/d +8°), klik Goyang untuk sapuan otomatis, atau klik 0.0° untuk menuju titik balik tegak lurus sejati.',
        ja: 'ゲージを-8°〜+8°で揺動（または「揺動」で自動スイープ）させ、針が折り返す最小点（0.0°垂直位置）で真のボア径を読み取ります。',
      },
      tip: {
        en: 'A tilted bore gauge always reads a larger chord than the true diameter—only the minimum reversal point at 0.0° is accurate!',
        id: 'Bore gauge yang miring selalu membaca lebih besar dari diameter sejati—hanya titik balik minimum di 0.0° yang akurat!',
        ja: 'ゲージが傾くと斜め距離を測るため実際より大きい値になります。必ず0.0°の最小反転点で記録してください！',
      },
      faqs: [
        {
          q: {
            en: 'Why do we rock a bore gauge to find the minimum reading?',
            id: 'Mengapa bore gauge digoyangkan untuk mencari bacaan minimum?',
            ja: 'なぜボアゲージを揺動させて最小値（反転点）を読むのですか？',
          },
          a: {
            en: 'When tilted off-perpendicular, the anvil spans a longer diagonal chord inside the cylinder. Sweeping through 0.0° finds the shortest perpendicular chord—the true bore diameter.',
            id: 'Saat miring, probe mengukur garis diagonal yang lebih panjang. Menggoyangkan melewati 0.0° menemukan jarak tegak lurus terpendek—yaitu diameter sejati.',
            ja: '傾いた状態ではシリンダ内の斜め距離（弦）を測ってしまうため、0.0°を挟んで揺動させたときの最短距離（針の反転点）が真の内径になります。',
          },
          keywords: ['rock', 'null', 'minimum', 'reversal', '0.0', 'goyang', 'titik balik'],
        },
      ],
      targetSelector: '[data-tour="bore-gauge-rocking"]',
    },
    {
      id: 'bore-gauge-canvas',
      badge: {
        en: 'Feature 5 · CAD Stage',
        id: 'Fitur 5 · Area Simulasi CAD',
        ja: '機能5 · ボアゲージCAD',
      },
      title: {
        en: 'Live Bore Gauge & Dial Indicator Stage',
        id: 'Tampilan Bore Gauge & Dial Indikator Langsung',
        ja: 'ボアゲージ断面＆ダイヤル目盛ステージ',
      },
      description: {
        en: 'Read the live dial indicator sweep as the probe rocks inside the cylinder cutaway, and watch for off-null recording warnings if you try logging while tilted.',
        id: 'Baca sapuan jarum dial saat probe digoyangkan di dalam potongan silinder, dan perhatikan peringatan apabila Anda mencoba mencatat saat posisi probe masih miring.',
        ja: 'ライナ断面内で揺動するプローブの動きとダイヤル指針の振れを読み取り、傾いた状態での誤記録警告を確認します。',
      },
      tip: {
        en: 'Click Record Point directly on the stage once the badge turns green at NULL POINT (0.0°).',
        id: 'Klik Catat Titik langsung pada area simulasi setelah indikator berubah hijau di TITIK BALIK (0,0°).',
        ja: 'バッジが緑色の「反転点(0.0°)」になったら、ステージ上の記録ボタンで値を登録できます。',
      },
      targetSelector: '[data-tour="bore-gauge-canvas"]',
    },
    {
      id: 'bore-gauge-mapping',
      badge: {
        en: 'Feature 6 · 6-Point Map',
        id: 'Fitur 6 · Pemetaan 6-Titik',
        ja: '機能6 · 6点測定表',
      },
      title: {
        en: '6-Point Bore Mapping Matrix',
        id: 'Tabel Pemetaan Bore 6-Titik',
        ja: '6点ボア測定マトリクス',
      },
      description: {
        en: 'Click any cell to aim the probe and record all 6 points (Top/Mid/Bottom × Axis A/B), or use Auto-Map All 6 (0° Null) to populate the matrix quickly.',
        id: 'Klik sel mana saja untuk mengarahkan probe dan mencatat semua 6 titik, atau klik Isi 6 Titik (0° Null) untuk mengisi matriks otomatis.',
        ja: '各セルをクリックしてプローブを移動・記録し、上中下×AB軸の全6点を埋めます。「全6点を自動測定」で一括記録も可能です。',
      },
      tip: {
        en: 'Ovality = |Axis A − Axis B| at each depth; Taper = Max − Min diameter along each axis.',
        id: 'Ovalitas = |Sumbu A − Sumbu B| di tiap kedalaman; Ketirusan = Maks − Min di sepanjang tiap sumbu.',
        ja: '楕円度 ＝ 各深さでの |A軸 − B軸|、テーパ ＝ 各軸方向での最大値 − 最小値で算出されます。',
      },
      targetSelector: '[data-tour="bore-gauge-mapping"]',
    },
    {
      id: 'bore-gauge-verdict',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 摩耗合否判定',
      },
      title: {
        en: 'Ovality, Taper & OEM Re-Bore Verdict',
        id: 'Ovalitas, Ketirusan & Keputusan Re-Bore OEM',
        ja: '最大楕円度・テーパ＆OEMボーリング判定',
      },
      description: {
        en: 'Compare Max Ovality and Max Taper against the 0.050 mm OEM service limit to diagnose out-of-round or tapered wear and decide between Serviceable or +0.25 mm Re-Bore.',
        id: 'Bandingkan Ovalitas Maksimum dan Ketirusan Maksimum terhadap batas servis OEM 0,050 mm untuk mendiagnosis keausan dan menentukan keputusan Layak Pakai atau Re-Bore +0,25 mm.',
        ja: '最大楕円度と最大テーパをOEM限度(0.050 mm)と比較し、真円度不良やテーパ摩耗を診断して継続使用か+0.25 mm再ボーリングかを判定します。',
      },
      tip: {
        en: 'Even if ovality is low, exceeding 0.050 mm taper causes piston-ring flutter and blow-by—requiring a +0.25 mm oversize re-bore.',
        id: 'Meskipun ovalitasnya kecil, ketirusan > 0,050 mm memicu getaran ring piston dan kebocoran kompresi (blow-by)—sehingga wajib dilakukan re-bore +0,25 mm.',
        ja: '楕円度が小さくてもテーパが0.050 mmを超えるとリングのフラッタやブローバイを招くため、+0.25 mm再ボーリングが必要です。',
      },
      targetSelector: '[data-tour="bore-gauge-verdict"]',
    },
    {
      id: 'bore-gauge-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to test your bore-gauge reading and wear-diagnosis skills.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguji keterampilan membaca bore gauge dan diagnosis keausan Anda.',
        ja: '上部タブで探索・演習・クイズを切り替え、ボアゲージの読み取りと摩耗診断の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'bucket-elevator': [
    {
      id: 'bucket-elevator-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Bucket Elevator Discharge & Fault Lab',
        id: 'Lab Pembuangan & Gangguan Bucket Elevator',
        ja: 'バケットエレベータ排出・異常診断ラボ',
      },
      description: {
        en: 'Welcome! Analyze centrifugal vs. gravity discharge trajectories, Froude number (Fr), pole distance (h_p), motor power, backstop torque, and industrial elevator faults.',
        id: 'Selamat datang! Analisis lintasan pembuangan sentrifugal vs. gravitasi, bilangan Froude (Fr), jarak kutub (h_p), daya motor, torsi backstop, serta gangguan elevator.',
        ja: 'ようこそ！遠心排出と重力排出の軌跡、フルード数(Fr)、極距離(h_p)、所要動力・バックストップトルク、各種運転異常を総合的に解析します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each elevator control.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri tiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'bucket-elevator-type',
      badge: {
        en: 'Feature 1 · Elevator Type',
        id: 'Fitur 1 · Tipe Elevator',
        ja: '機能1 · エレベータ形式',
      },
      title: {
        en: 'Discharge Architecture & Transport Controls',
        id: 'Tipe Pembuangan & Kontrol Operasi',
        ja: '形式切替（遠心・連続・チェーン）＆運転',
      },
      description: {
        en: 'Switch between Centrifugal, Continuous, and Chain bucket elevators, and Run, Pause, or Reset the live animation.',
        id: 'Beralih antara bucket elevator Sentrifugal, Kontinu, dan Rantai, serta Jalankan, Jeda, atau Reset animasi.',
        ja: '遠心式・連続式・チェーン式を切り替え、アニメーションの運転・一時停止・リセットを操作します。',
      },
      tip: {
        en: 'Centrifugal elevators rely on high head-pulley speed (Fr ≈ 1), while Continuous types use slow gravity discharge.',
        id: 'Elevator sentrifugal mengandalkan putaran tinggi (Fr ≈ 1), sedangkan tipe Kontinu membuang material secara gravitasi lambat.',
        ja: '遠心式は高速回転(Fr ≈ 1)の遠心力で投げ出し、連続式は低速の重力落下で排出します。',
      },
      targetSelector: '[data-tour="bucket-type"]',
    },
    {
      id: 'bucket-elevator-cutaway',
      badge: {
        en: 'Feature 2 · Trajectory & Probe',
        id: 'Fitur 2 · Lintasan & Probe',
        ja: '機能2 · 断面・排出軌跡',
      },
      title: {
        en: 'Vertical Cutaway, Vector Diagram & Probe',
        id: 'Potongan Vertikal, Diagram Vektor & Probe',
        ja: '垂直断面・ベクトル図＆プローブ',
      },
      description: {
        en: 'Inspect bucket scoop, head-pulley trajectory, pole distance h_p vs. effective radius R_eff, and drag the interactive probe across hotspots.',
        id: 'Amati pengisian bucket, lintasan puli kepala, jarak kutub h_p vs. radius efektif R_eff, dan seret probe interaktif pada titik uji.',
        ja: 'ブーツ部の掬い上げからヘッドプーリでの排出軌跡、極距離h_pと有効半径R_effの関係、プローブによる各部計測を確認できます。',
      },
      tip: {
        en: 'Match head RPM near N_crit so pole distance h_p aligns with R_eff for clean discharge into the throat.',
        id: 'Sesuaikan RPM kepala mendekati N_crit agar jarak kutub h_p sejajar dengan R_eff untuk pembuangan bersih ke corong.',
        ja: 'ヘッド回転数をN_crit付近に合わせ、極距離h_pと有効半径R_effを一致させるとシュートへ綺麗に排出されます。',
      },
      targetSelector: '[data-tour="bucket-cutaway"]',
    },
    {
      id: 'bucket-elevator-material',
      badge: {
        en: 'Feature 3 · Bulk Material',
        id: 'Fitur 3 · Material Curah',
        ja: '機能3 · 搬送物プリセット',
      },
      title: {
        en: 'Bulk Material Preset Selector',
        id: 'Pemilih Preset Material Curah',
        ja: '搬送物プリセット選択',
      },
      description: {
        en: 'Choose between industrial bulk materials (grain, cement, crushed stone, coal) to update bulk density, fill factor, and required drive power.',
        id: 'Pilih material curah industri (biji-bijian, semen, batu pecah, batu bara) untuk memperbarui densitas, faktor isi, dan daya penggerak.',
        ja: '穀物・セメント・砕石・石炭などの搬送物を選択し、かさ密度・充填率・所要動力の変化を確認します。',
      },
      tip: {
        en: 'Denser materials directly increase mass capacity (t/h), motor current, and required backstop torque.',
        id: 'Material yang lebih padat langsung menaikkan kapasitas massa (t/h), arus motor, dan torsi backstop.',
        ja: 'かさ密度が大きい搬送物ほど質量輸送量(t/h)、モータ電流、逆転防止トルクが増大します。',
      },
      targetSelector: '[data-tour="bucket-material"]',
    },
    {
      id: 'bucket-elevator-drive',
      badge: {
        en: 'Feature 4 · Drive & Pulley',
        id: 'Fitur 4 · Penggerak & Puli',
        ja: '機能4 · 駆動・プーリ設定',
      },
      title: {
        en: 'Head Pulley Diameter, Speed, Lift & Take-Up',
        id: 'Diameter Puli, Putaran, Tinggi Angkat & Take-Up',
        ja: 'プーリ径・回転数・揚程・張り張力',
      },
      description: {
        en: 'Adjust Head Pulley Diameter, Head Speed (RPM), Lift Height, and Take-Up Tension to balance centrifugal throw against slip risk.',
        id: 'Atur Diameter Puli Kepala, Putaran (RPM), Tinggi Angkat, dan Tegangan Take-Up untuk menyeimbangkan lemparan sentrifugal dan risiko slip.',
        ja: 'ヘッドプーリ径、回転数(RPM)、揚程、張り張力を調整し、遠心排出とスリップ防止のバランスを取ります。',
      },
      tip: {
        en: 'If take-up tension falls below minimum required tension, the belt slips on the head pulley and drops Fr.',
        id: 'Jika tegangan take-up di bawah batas minimum, sabuk slip di puli kepala dan Fr turun.',
        ja: '張り張力が必要最小値を下回るとヘッドプーリでスリップが発生し、フルード数Frが低下します。',
      },
      targetSelector: '[data-tour="bucket-drive"]',
    },
    {
      id: 'bucket-elevator-geometry',
      badge: {
        en: 'Feature 5 · Bucket Geometry',
        id: 'Fitur 5 · Geometri Bucket',
        ja: '機能5 · バケット寸法',
      },
      title: {
        en: 'Bucket Width, Projection & Volume',
        id: 'Lebar, Proyeksi & Volume Bucket',
        ja: 'バケット幅・突出量・容量',
      },
      description: {
        en: 'Resize Bucket Width, Projection, and Volume to scale volumetric throughput (m³/h) and effective discharge radius R_eff.',
        id: 'Ubah Lebar, Proyeksi, dan Volume Bucket untuk menskalakan kapasitas volume (m³/h) serta radius efektif pembuangan R_eff.',
        ja: 'バケット幅・突出量・容量を調整し、体積輸送量(m³/h)と有効半径R_effの変化を確認します。',
      },
      tip: {
        en: 'Larger bucket projection increases R_eff, which lowers the critical RPM needed for centrifugal throw.',
        id: 'Proyeksi bucket lebih besar menaikkan R_eff sehingga menurunkan RPM kritis untuk lemparan sentrifugal.',
        ja: 'バケット突出量が大きいほど有効半径R_effが増し、遠心排出に必要な臨界回転数N_critが下がります。',
      },
      targetSelector: '[data-tour="bucket-geometry"]',
    },
    {
      id: 'bucket-elevator-kpis',
      badge: {
        en: 'Feature 6 · Telemetry',
        id: 'Fitur 6 · Kinerja',
        ja: '機能6 · 輸送能力KPI',
      },
      title: {
        en: 'Throughput, Froude No. & Back-Spill KPIs',
        id: 'Kapasitas, Bil. Froude & Rugi Tumpah Balik',
        ja: '輸送量・フルード数・逆流損失KPI',
      },
      description: {
        en: 'Track Mass/Volumetric Capacity, Motor Power & Amps, Froude Number (Fr), Back-Spill Loss %, and Required Backstop Torque.',
        id: 'Pantau Kapasitas Massa/Volume, Daya & Arus Motor, Bilangan Froude (Fr), Rugi Tumpah Balik %, dan Torsi Backstop.',
        ja: '質量/体積輸送量、動力・電流、フルード数(Fr)、逆流損失%、および停電時逆転を防ぐバックストップトルクを確認します。',
      },
      tip: {
        en: 'Watch Back-Spill Loss %—any non-zero back-spill means material is falling back down the casing leg.',
        id: 'Perhatikan Rugi Tumpah Balik %—nilai di atas 0% berarti material jatuh kembali ke kaki casing.',
        ja: '逆流損失(%)が0%より大きい場合、排出に失敗した搬送物がケーシング内へ落下しています。',
      },
      targetSelector: '[data-tour="bucket-kpis"]',
    },
    {
      id: 'bucket-elevator-health-banner',
      badge: {
        en: 'Feature 7 · Health Status',
        id: 'Fitur 7 · Status Kesehatan',
        ja: '機能7 · 運転診断バナー',
      },
      title: {
        en: 'Live Discharge & Tension Diagnostic Banner',
        id: 'Panel Diagnostik Pembuangan & Tegangan',
        ja: '排出状態・張力診断バナー',
      },
      description: {
        en: 'Read exact root-cause feedback when premature gravity drop, back-spill, belt slip, or insufficient take-up tension occurs.',
        id: 'Baca umpan balik akar masalah secara langsung saat terjadi jatuh prematur, tumpah balik, slip sabuk, atau tegangan take-up yang kurang.',
        ja: '早期重力落下、逆流、ベルトスリップ、張力不足などが発生した際の具体的な原因と対策メッセージを確認できます。',
      },
      tip: {
        en: 'Use the recommended critical RPM and minimum tension numbers shown here to restore clean discharge.',
        id: 'Gunakan nilai RPM kritis dan tegangan minimum yang disarankan di sini untuk memulihkan pembuangan bersih.',
        ja: 'ここに表示される推奨臨界RPMと必要最小張力を参考にパラメータを修正すると正常排出に戻ります。',
      },
      targetSelector: '[data-tour="bucket-health-banner"]',
    },
    {
      id: 'bucket-elevator-faults',
      badge: {
        en: 'Feature 8 · Troubleshoot',
        id: 'Fitur 8 · Diagnosis Gangguan',
        ja: '機能8 · 異常注入診断',
      },
      title: {
        en: 'Fault Injection Bar',
        id: 'Panel Simulasi Gangguan',
        ja: '故障注入バー（スリップ・詰まり・欠損・蛇行）',
      },
      description: {
        en: 'Inject Belt Slip, Boot Choke, Missing Bucket, or Misalignment faults and observe how Fr, motor amps, back-spill %, and diagnostics respond so you can isolate root causes.',
        id: 'Aktifkan simulasi gangguan Slip Sabuk, Boot Tersumbat, Bucket Hilang, atau Sabuk Miring lalu amati respons Fr, arus motor, dan persentase tumpah balik untuk mengisolasi akar masalah.',
        ja: 'ベルトスリップ、ブーツ詰まり、バケット欠損、ベルト蛇行を注入し、Fr・電流値・逆流損失の変化から原因を切り分ける訓練ができます。',
      },
      tip: {
        en: 'Compare Belt Slip (drops RPM & Fr, causes back-spill) vs. Boot Choke (spikes motor amps & digging drag).',
        id: 'Bandingkan Slip Sabuk (menurunkan RPM & Fr) vs. Boot Tersumbat (melonjakkan arus motor & hambatan gali).',
        ja: 'ベルトスリップ（RPM・Fr低下＋逆流）とブーツ詰まり（電流急増＋掬い抵抗増）の症状の違いを比較してください。',
      },
      faqs: [
        {
          q: {
            en: 'How do Belt Slip and Boot Choke differ in symptoms?',
            id: 'Apa perbedaan gejala Slip Sabuk dan Boot Tersumbat?',
            ja: 'ベルトスリップとブーツ詰まりの症状の違いは？',
          },
          a: {
            en: 'Belt Slip drops effective head pulley speed by ~38%, lowering Fr below critical and causing heavy back-spill; Boot Choke increases digging drag in the boot, spiking drive motor current (Amps).',
            id: 'Slip Sabuk menurunkan putaran puli kepala ~38% sehingga Fr turun dan memicu tumpah balik; Boot Tersumbat menaikkan hambatan gali sehingga arus motor (Ampere) melonjak.',
            ja: 'ベルトスリップはヘッド回転数とFrを約38%低下させて逆流を引き起こし、ブーツ詰まりは掬い抵抗増大により駆動モータ電流を急増させます。',
          },
          keywords: ['belt slip', 'boot choke', 'amps', 'back-spill', 'fr', 'slip', 'tersumbat'],
        },
      ],
      targetSelector: '[data-tour="bucket-faults"]',
    },
    {
      id: 'bucket-elevator-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to test your bucket elevator sizing and fault-diagnosis skills.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguji perhitungan kapasitas dan diagnosis gangguan Anda.',
        ja: '上部タブで探索・演習・クイズを切り替え、バケットエレベータの設計計算と故障診断力を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  caliper: [
    {
      id: 'caliper-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Vernier Caliper & Micrometer Metrology Lab',
        id: 'Lab Metrologi Jangka Sorong & Mikrometer Sekrup',
        ja: 'ノギス・マイクロメータ精密測定ラボ',
      },
      description: {
        en: 'Welcome! This simulator trains you to read 0.02 mm / 0.05 mm Vernier Calipers and 0.01 mm Micrometers, diagnose zero-error & parallax faults, and pass QC tolerance inspections. Let’s walk through every control.',
        id: 'Selamat datang! Simulator ini melatih Anda membaca Jangka Sorong 0,02 mm / 0,05 mm serta Mikrometer Sekrup 0,01 mm, mendiagnosis kesalahan titik nol dan kesalahan paralaks, serta lolos inspeksi toleransi QC. Mari kita telusuri setiap fiturnya.',
        ja: 'ようこそ！このシミュレータでは0.02/0.05 mmノギスと0.01 mmマイクロメータの読取、ゼロ誤差・視差エラーの診断、QC公差検査を実践できます。各機能を順番に案内します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah antar-fitur dengan lancar.',
        ja: '「次へ / 前へ」ボタンまたは ← / → キーで各機能のガイドを滑らかに切り替えられます。',
      },
    },
    {
      id: 'caliper-instrument-selector',
      badge: {
        en: 'Feature 1 · Instrument',
        id: 'Fitur 1 · Alat Ukur',
        ja: '機能1 · 測定器選択',
      },
      title: {
        en: 'Instrument Selector (Least Count)',
        id: 'Pemilih Alat Ukur (Nilai Skala Terkecil)',
        ja: '測定器セレクタ（最小読取値）',
      },
      description: {
        en: 'Switch between Vernier 0.02 mm (50 divisions), Vernier 0.05 mm (20 divisions), and Outside Micrometer 0.01 mm. Choose the micrometer when checking tight ±0.02 mm shaft tolerances.',
        id: 'Pilih antara Jangka Sorong 0,02 mm (50 skala), 0,05 mm (20 skala), atau Mikrometer Sekrup Luar 0,01 mm. Gunakan mikrometer sekrup saat memeriksa toleransi poros yang sangat rapat (±0,02 mm).',
        ja: 'ノギス0.02 mm（50等分）、ノギス0.05 mm（20等分）、外側マイクロメータ0.01 mmを切り替えます。±0.02 mm級の厳しい公差にはマイクロメータが適しています。',
      },
      tip: {
        en: 'Smaller Least Count (0.01 mm) gives finer resolution, while Vernier Calipers also handle inside and depth steps.',
        id: 'Nilai Skala Terkecil (Least Count) yang lebih kecil (0,01 mm) memberikan resolusi lebih tinggi, sedangkan Jangka Sorong juga dapat mengukur diameter dalam dan kedalaman.',
        ja: '最小読取値が小さいほど高精度ですが、ノギスは内径や段差・深さ測定にも対応できます。',
      },
      faqs: [
        {
          q: {
            en: '0.02 mm vs 0.05 mm vs Micrometer?',
            id: 'Bedanya 0.02 mm, 0.05 mm & Mikrometer?',
            ja: '0.02 mm・0.05 mm・マイクロメータの違いは？',
          },
          a: {
            en: 'Vernier 0.02 mm divides 1 mm into 50 steps (finer); Vernier 0.05 mm uses 20 steps (faster to spot). Micrometer 0.01 mm measures to hundredths of a mm for tight shaft/bearing fits.',
            id: 'Jangka Sorong 0.02 mm membagi 1 mm menjadi 50 bagian (lebih presisi); 0.05 mm memakai 20 bagian (lebih cepat dibaca). Mikrometer 0.01 mm membaca hingga seperseratus mm untuk toleransi poros/bearing yang ketat.',
            ja: 'ノギス0.02 mmは50等分（高精度）、0.05 mmは20等分（読取りが速い）です。マイクロメータ0.01 mmは0.01 mm単位で軸や軸受の嵌め合い測定に使います。',
          },
          keywords: ['0.02', '0.05', 'micrometer', 'least count', 'difference', 'beda'],
        },
      ],
      targetSelector: '[data-tour="caliper-instrument-selector"]',
    },
    {
      id: 'caliper-loupe',
      badge: {
        en: 'Feature 2 · Magnifier',
        id: 'Fitur 2 · Kaca Pembesar',
        ja: '機能2 · 拡大ルーペ',
      },
      title: {
        en: 'Optical Magnifier Loupe (2.5× / 3× / 4×)',
        id: 'Kaca Pembesar Optik (2.5× / 3× / 4×)',
        ja: '光学拡大ルーペ（2.5× / 3× / 4×）',
      },
      description: {
        en: 'Toggle the Loupe On/Off and pick 2.5×, 3×, or 4× zoom. It magnifies the exact hairline where the Vernier or Thimble division aligns with the Main Scale.',
        id: 'Aktifkan/nonaktifkan Kaca Pembesar dan pilih zoom 2.5×, 3×, atau 4×. Fitur ini memperbesar titik garis skala Nonius atau Bidal yang tepat segaris dengan Skala Utama.',
        ja: 'ルーペのON/OFFと倍率（2.5×/3×/4×）を切り替えます。主尺と副尺（またはシンブル）の目盛線が一致する位置を拡大表示します。',
      },
      tip: {
        en: 'In Test Yourself or QC mode, turn on 3× or 4× Loupe so you never misread adjacent 0.02 mm marks.',
        id: 'Pada mode Uji Mandiri atau QC, aktifkan zoom 3× atau 4× agar garis 0.02 mm yang berdekatan tidak tertukar.',
        ja: 'セルフテストやQCモードでは3×や4×を使うと、隣接する0.02 mm目盛の見間違いを防げます。',
      },
      targetSelector: '[data-tour="caliper-loupe"]',
    },
    {
      id: 'caliper-submodes',
      badge: {
        en: 'Feature 3 · Lab Modes',
        id: 'Fitur 3 · Mode Lab',
        ja: '機能3 · 実習モード',
      },
      title: {
        en: 'Measure, Test Yourself & QC Inspection',
        id: 'Mode Ukur, Uji Mandiri & Inspeksi QC',
        ja: '測定・セルフテスト・QC検査モード',
      },
      description: {
        en: 'Use Measure to see the live readout breakdown. Switch to Test Yourself to hide the answer and practice blind reading, or QC Inspection to measure a 4-part batch and judge PASS / REJECT.',
        id: 'Gunakan Ukur untuk melihat rincian pembacaan langsung. Beralih ke Uji Mandiri untuk menyembunyikan hasil dan berlatih membaca mandiri, atau Inspeksi QC untuk menilai batch 4 komponen (LULUS / TOLAK).',
        ja: '「測定」では内訳をリアルタイム確認、「セルフテスト」では数値非表示で読取練習、「QC検査」では4部品のバッチ測定と合否判定を行えます。',
      },
      tip: {
        en: 'Master Measure first, verify yourself in Test Yourself, then complete a full QC Inspection batch.',
        id: 'Kuasai mode Ukur dulu, uji diri di Uji Mandiri, lalu selesaikan satu batch Inspeksi QC.',
        ja: '「測定」で読み方を覚え、「セルフテスト」で実力を試し、「QC検査」で仕上げるのがおすすめです。',
      },
      targetSelector: '[data-tour="caliper-submodes"]',
    },
    {
      id: 'caliper-parts',
      badge: {
        en: 'Feature 4 · Workpieces',
        id: 'Fitur 4 · Benda Uji',
        ja: '機能4 · 測定ワーク',
      },
      title: {
        en: 'Test Parts & Free Measure',
        id: 'Komponen Uji Standar & Pengukuran Bebas',
        ja: 'プリセットワーク＆自由測定',
      },
      description: {
        en: 'Click any preset industrial part (Gauge Block, Bearing Shaft, Hex Bolt, etc.) to clamp it automatically between the jaws, or choose Free Measure to position the jaws anywhere.',
        id: 'Klik komponen uji standar industri (Blok Ukur, Poros Bearing, Baut Hex, dll.) untuk menjepitnya secara otomatis di antara rahang ukur, atau pilih Ukur Bebas untuk memosisikan rahang secara manual.',
        ja: 'ゲージブロックや軸受シャフト等のワークを選ぶと自動でジョウに挟まれます。「自由測定」で任意寸法の練習も可能です。',
      },
      tip: {
        en: 'Preset parts show real engineering context (outer diameter, thickness, bore) alongside exact dimensions.',
        id: 'Setiap komponen uji menampilkan konteks teknik nyata (diameter luar, ketebalan, lubang) beserta dimensi presisinya.',
        ja: '各ワークには外径・板厚・内径などの実務用途と精密寸法が設定されています。',
      },
      targetSelector: '[data-tour="caliper-parts"]',
    },
    {
      id: 'caliper-zero-error',
      badge: {
        en: 'Feature 5 · Troubleshoot',
        id: 'Fitur 5 · Diagnosis Gangguan',
        ja: '機能5 · トラブル対策',
      },
      title: {
        en: 'Zero Error Fault Injection & Compensation',
        id: 'Simulasi Kesalahan Titik Nol & Kompensasi',
        ja: 'ゼロ誤差の診断と補正計算',
      },
      description: {
        en: 'Real calipers wear or get bumped out of zero! Enable Zero Error and select a + or − offset to simulate calibration drift. Troubleshoot by closing the jaws to 0.00 mm, noting the offset, and applying: True Dimension = Observed − Zero Error.',
        id: 'Alat ukur asli dapat mengalami penyimpangan titik nol akibat keausan atau benturan! Aktifkan Kesalahan Titik Nol lalu pilih offset + atau − untuk menyimulasikan pergeseran kalibrasi. Cara mengatasi gangguan: rapatkan rahang ke 0,00 mm, catat penyimpangannya, lalu terapkan: Dimensi Sebenarnya = Bacaan Terukur − Kesalahan Titik Nol.',
        ja: '実機では摩耗や衝撃でゼロ点がずれます。ゼロ誤差を有効にして＋/−オフセットを設定し、ジョウを閉じてズレ量を確認後、「真の寸法 ＝ 測定値 − ゼロ誤差」で補正しましょう。',
      },
      tip: {
        en: 'Watch signs carefully: subtracting a negative zero error (e.g. −0.04 mm) adds +0.04 mm to your reading!',
        id: 'Perhatikan tanda positif/negatif dengan cermat: mengurangi kesalahan titik nol negatif (mis. −0,04 mm) berarti MENAMBAHKAN +0,04 mm ke hasil baca!',
        ja: '符号に注意！負のゼロ誤差（例: −0.04 mm）を引くと、測定値に +0.04 mm が加算されます。',
      },
      faqs: [
        {
          q: {
            en: 'Positive vs negative zero error?',
            id: 'Apa perbedaan kesalahan titik nol positif dan negatif?',
            ja: '正のゼロ誤差と負のゼロ誤差の見分け方は？',
          },
          a: {
            en: 'Close the jaws to 0.00 mm: if Vernier 0 sits RIGHT of Main 0, it is Positive (+) — subtract it. If Vernier 0 sits LEFT of Main 0, it is Negative (−) — add its magnitude.',
            id: 'Rapatkan rahang ke 0,00 mm: jika garis 0 Nonius berada di KANAN angka 0 Skala Utama, itu Positif (+) — kurangkan dari hasil baca. Jika di KIRI, itu Negatif (−) — tambahkan besarnya.',
            ja: 'ジョウを閉じたとき、副尺0が主尺0の右にあれば正（+）なので引き算、左にあれば負（−）なので絶対値を足し算して補正します。',
          },
          keywords: ['positive', 'negative', 'zero error', 'formula', 'positif', 'negatif', 'rumus'],
        },
      ],
      targetSelector: '[data-tour="caliper-zero-error"]',
    },
    {
      id: 'caliper-canvas',
      badge: {
        en: 'Feature 6 · Interactive Scale',
        id: 'Fitur 6 · Skala Interaktif',
        ja: '機能6 · 測定ステージ',
      },
      title: {
        en: 'Drag the Jaw / Thimble Directly',
        id: 'Geser Rahang / Bidal Secara Langsung',
        ja: 'ジョウ・シンブルの直接ドラッグ操作',
      },
      description: {
        en: 'Click and drag the sliding Vernier jaw (or Micrometer thimble) directly left/right to measure. You can also click the stage and press ← / → (±1 LC) or Shift+← / → (±10 LC).',
        id: 'Klik dan seret rahang geser Jangka Sorong (atau bidal Mikrometer) langsung ke kiri/kanan. Anda juga dapat mengeklik area alat lalu menekan ← / → (±1 LC) atau Shift+← / → (±10 LC).',
        ja: 'スライダ（ノギス）やシンブル（マイクロメータ）を直接左右にドラッグして測定します。ステージ選択後に ←/→ (±1 LC) や Shift+←/→ (±10 LC) キーも使えます。',
      },
      tip: {
        en: 'Read the Main Scale value just to the LEFT of the Vernier "0" mark, then find the single Vernier line that aligns cleanly.',
        id: 'Baca nilai Skala Utama tepat di sebelah KIRI garis "0" Nonius, lalu cari satu garis Nonius yang paling segaris lurus.',
        ja: '副尺「0」目盛のすぐ左にある主尺値を読み、次に主尺と一直線に重なる副尺目盛を1本見つけます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I read MSR + VSR step by step?',
            id: 'Cara baca MSR + VSR langkah demi langkah?',
            ja: '主尺と副尺の読み方を順番に教えて',
          },
          a: {
            en: '1) Read the last whole mm mark to the LEFT of the Vernier 0 (that is MSR). 2) Scan the Vernier scale for the single tick lining up straight with a Main Scale tick (VSR). 3) Total = MSR + (VSR × Least Count).',
            id: '1) Baca angka mm utuh terakhir di sebelah KIRI garis 0 Nonius (ini MSR). 2) Cari satu garis Nonius yang paling segaris lurus dengan garis Skala Utama (VSR). 3) Total = MSR + (VSR × Least Count).',
            ja: '1) 副尺0の左直前にある主尺の整数mm（主尺値）を読みます。2) 主尺の線と一直線に揃う副尺の目盛番号（副尺値）を探します。3) 合計 ＝ 主尺値 ＋ (副尺番号 × 最小読取値)。',
          },
          keywords: ['msr', 'vsr', 'read', 'coinciding', 'baca', 'nonius', '目盛'],
        },
      ],
      targetSelector: '[data-tour="caliper-canvas"]',
    },
    {
      id: 'caliper-parallax',
      badge: {
        en: 'Feature 7 · Troubleshoot',
        id: 'Fitur 7 · Diagnosis Gangguan',
        ja: '機能7 · 視差トラブル対策',
      },
      title: {
        en: 'View Angle & Parallax Error Check',
        id: 'Pemeriksaan Sudut Pandang & Kesalahan Paralaks',
        ja: '視点角度と視差（パララックス）エラー診断',
      },
      description: {
        en: 'Viewing a Vernier scale at an angle (−15° or +15°) causes parallax error — the raised Vernier edge appears shifted against the Main Scale! Always troubleshoot suspect readings by aligning your view to 0° (90° Perp).',
        id: 'Melihat skala dari sudut miring (−15° atau +15°) menimbulkan kesalahan paralaks karena skala Nonius tampak bergeser terhadap Skala Utama! Selalu pastikan sudut pandang kembali ke 0° (Tegak 90°) sebelum mencatat hasil.',
        ja: '目盛を斜め（−15° / +15°）から見ると、段差によって目盛位置がずれて見える「視差エラー」が発生します。正確な読取には必ず正面 0°（90°垂直）に合わせてください。',
      },
      tip: {
        en: 'Toggle −15° and +15° once to see how much the coincidence mark shifts even when the jaw has not moved!',
        id: 'Coba pilih −15° dan +15° untuk melihat bagaimana garis yang segaris tampak bergeser padahal rahang tidak bergerak sama sekali!',
        ja: 'ジョウを動かさずに −15° と +15° を切り替えると、見え方だけで一致目盛がずれる様子を体感できます。',
      },
      faqs: [
        {
          q: {
            en: 'Why does viewing at an angle change the reading?',
            id: 'Mengapa sudut pandang miring mengubah hasil pembacaan?',
            ja: 'なぜ斜めから見ると数値が変わるのですか？',
          },
          a: {
            en: 'The Vernier slider sits slightly above the Main Scale beam. Looking from ±15° projects the upper tick onto a neighboring lower tick (parallax). Always view straight down at 0° (90° Perp).',
            id: 'Skala Nonius berada sedikit lebih tinggi di atas batang Skala Utama. Melihat dari sudut ±15° membuat garis atas tampak sejajar dengan garis bawah di sebelahnya (paralaks). Selalu baca secara tegak lurus pada 0°.',
            ja: '副尺と主尺にはわずかな段差があるため、±15°の斜め視線だと上の目盛が隣の目盛に重なって見えます（視差）。必ず正面0°（90°垂直）から読み取ってください。',
          },
          keywords: ['parallax', 'angle', '15', 'paralaks', 'sudut', '視差'],
        },
      ],
      targetSelector: '[data-tour="caliper-parallax"]',
    },
    {
      id: 'caliper-fine-controls',
      badge: {
        en: 'Feature 8 · Fine Control',
        id: 'Fitur 8 · Kontrol Halus',
        ja: '機能8 · 微調整コントロール',
      },
      title: {
        en: 'Position Slider, ±LC Buttons & Zero Reset',
        id: 'Penggeser Posisi, Tombol ±LC & Reset Nol',
        ja: '位置スライダー・±LC微動・ゼロリセット',
      },
      description: {
        en: 'Use the Position Slider for fast travel across the full scale, ±1 LC / ±10 LC buttons for exact single-division stepping, and Zero to close the jaws completely when checking for zero error.',
        id: 'Gunakan Penggeser Posisi untuk pergeseran cepat sepanjang skala, tombol ±1 LC / ±10 LC untuk langkah presisi satu skala terkecil, dan tombol Zero untuk merapatkan rahang saat memeriksa kesalahan titik nol.',
        ja: 'スライダーで大きく移動し、±1 LC / ±10 LC ボタンで1目盛単位の微調整、Zero ボタンでジョウを完全閉鎖してゼロ点確認を行います。',
      },
      tip: {
        en: 'Clicking Zero before measuring a batch is standard shop-floor habit to catch dirt or zero-point drift.',
        id: 'Menekan Zero sebelum mengukur batch baru adalah kebiasaan standar bengkel untuk mendeteksi kotoran atau pergeseran nol.',
        ja: '測定前にZeroでゼロ点を確認するのは、切粉の噛み込みやズレを防ぐ現場の基本習慣です。',
      },
      targetSelector: '[data-tour="caliper-fine-controls"]',
    },
    {
      id: 'caliper-readout',
      badge: {
        en: 'Feature 9 · Readout & QC',
        id: 'Fitur 9 · Pembacaan & QC',
        ja: '機能9 · 読取内訳・QC判定',
      },
      title: {
        en: 'Scale Breakdown, Self-Test & QC Verdict',
        id: 'Rincian Skala, Uji Mandiri & Keputusan QC',
        ja: '目盛読取内訳・セルフテスト・QC判定',
      },
      description: {
        en: 'In Measure mode, inspect the 3-step breakdown (MSR + VSR×LC = Observed Sum, plus Zero-Error Correction). In Test Yourself or QC mode, this panel turns into your answer box and PASS/REJECT form.',
        id: 'Pada mode Ukur, lihat rincian 3 langkah (MSR + VSR×LC = Hasil Terukur, serta Koreksi Kesalahan Titik Nol). Pada mode Uji Mandiri atau QC, panel ini menjadi kotak input jawaban & tombol LULUS/TOLAK.',
        ja: '測定モードでは「主尺＋副尺×LC＝測定値」とゼロ誤差補正の3段階内訳を表示します。セルフテストやQCモードでは、ここが解答入力・合否判定パネルに変わります。',
      },
      tip: {
        en: 'If your Test Yourself answer is off by a tiny amount, compare MSR and VSR separately to see which scale caused the mistake.',
        id: 'Jika jawaban Uji Mandiri meleset sedikit, periksa kembali MSR dan VSR secara terpisah untuk mengetahui bagian mana yang keliru.',
        ja: 'セルフテストで誤差が出た場合は、主尺（mm整数部）と副尺（小数部）のどちらを読み違えたか切り分けましょう。',
      },
      targetSelector: '[data-tour="caliper-readout"]',
    },
    {
      id: 'caliper-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore (formulas & theory), Practice (guided tasks), and Quiz tabs anytime to lock in your precision metrology skills.',
        id: 'Beralih antara tab Simulasi, Eksplorasi (rumus & teori), Latihan (tugas terpandu), dan Kuis kapan saja untuk memantapkan keterampilan metrologi presisi Anda.',
        ja: '上部のタブから探索（理論・計算式）、演習（実践課題）、クイズへいつでも切り替えて理解度を定着させられます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'chain-conveyor': [
    {
      id: 'chain-conveyor-overview',
      badge: {
        en: 'Overview',
        id: 'Ikhtisar',
        ja: '概要',
      },
      title: {
        en: 'Roller Chain Drive & 10-Pitch Wear Lab',
        id: 'Lab Penggerak Rantai Rol & Inspeksi Aus 10-Pitch',
        ja: 'ローラチェーン伝動＆10リンク摩耗検査ラボ',
      },
      description: {
        en: 'Welcome! Inspect ANSI/RS roller chain elongation with a 10-pitch gauge, analyze chordal polygonal speed variation, tune slack-span sag (2% C), and diagnose lubrication faults.',
        id: 'Selamat datang! Periksa pemanjangan rantai rol ANSI/RS dengan pengukur 10-pitch, analisis variasi kecepatan kordal, atur kelendutan sisi kendur (2% C), dan diagnosis gangguan pelumasan.',
        ja: 'ようこそ！ANSI/RSローラチェーンの10リンク伸び測定、多角形運動による速度変動、緩み側たるみ量(2% C)、潤滑不良の診断を実践的に学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through each control.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'chain-conveyor-presets',
      badge: {
        en: 'Feature 1 · Scenarios',
        id: 'Fitur 1 · Skenario',
        ja: '機能1 · 現場シナリオ',
      },
      title: {
        en: 'Field Scenarios & Restore Spec',
        id: 'Skenario Lapangan & Perbaiki ke Standar',
        ja: '現場シナリオ＆推奨状態修復',
      },
      description: {
        en: 'Load Optimal #60 Drive, Worn Chain (3.25% Hooked), Dry & Over-Tight Span, or 12T Polygonal Vibration presets, or click Restore Spec to return to healthy settings.',
        id: 'Muat preset Penggerak #60 Optimal, Rantai Aus (3,25% Kait), Kering & Terlalu Kencang, atau Getaran Poligonal 12T, atau klik Perbaiki ke Standar.',
        ja: '正常#60駆動、摩耗限界超過(3.25%)、無給油・張り過ぎ、12歯多角形振動のプリセットを切り替え、「推奨状態に修復」で正常化できます。',
      },
      tip: {
        en: 'Try Worn Chain (3.25%) first to see how elongated rollers ride up the sprocket teeth.',
        id: 'Coba preset Rantai Aus (3,25%) dulu untuk melihat rol yang memanjang menaiki gigi sproket.',
        ja: 'まず「摩耗限界超過(3.25%)」を試すと、伸びたローラが歯先に乗り上げる様子が確認できます。',
      },
      targetSelector: '[data-tour="chain-presets"]',
    },
    {
      id: 'chain-conveyor-canvas',
      badge: {
        en: 'Feature 2 · 2D CAD',
        id: 'Fitur 2 · CAD 2D',
        ja: '機能2 · 2D CAD表示',
      },
      title: {
        en: 'Articulated Chain Drive & 10-Pitch Gauge',
        id: 'Penggerak Rantai & Pengukur 10-Pitch 2D',
        ja: 'ローラチェーン駆動＆10リンクゲージ図',
      },
      description: {
        en: 'Watch live sprocket engagement, catenary sag on the slack span, and the 10-pitch vernier gauge comparing stretched chain pitch against nominal length.',
        id: 'Amati pertautan sproket langsung, kelendutan sisi kendur, serta pengukur vernier 10-pitch yang membandingkan rantai aus terhadap panjang nominal.',
        ja: 'スプロケットの噛み合い、緩み側のカテナリーたるみ、10リンクバーニアゲージによる伸びの可視化をリアルタイムに観察できます。',
      },
      tip: {
        en: 'Red highlights on sprocket teeth indicate hook wear when elongation exceeds 3.0%.',
        id: 'Sorotan merah pada gigi sproket menandakan keausan kait saat perpanjangan melewati 3,0%.',
        ja: '伸び率が3.0%を超えると歯先への乗り上げとフック摩耗が赤色で強調されます。',
      },
      targetSelector: '[data-tour="chain-canvas"]',
    },
    {
      id: 'chain-conveyor-readouts',
      badge: {
        en: 'Feature 3 · Readouts',
        id: 'Fitur 3 · Pembacaan',
        ja: '機能3 · 主要計測値',
      },
      title: {
        en: '10-Pitch Gauge, Chordal Action & Sag Readouts',
        id: 'Pengukur 10-Pitch, Variasi Kordal & Kelendutan',
        ja: '10リンク実測長・多角形変動・たるみ量',
      },
      description: {
        en: 'Monitor measured 10-Pitch length vs. nominal, Chordal speed variation % (warning if z₁ < 17), Slack Span Sag S vs. 2% C target, and Pitch-Line Speed with recommended lubrication.',
        id: 'Pantau panjang ukur 10-Pitch vs. nominal, variasi kecepatan kordal % (waspada jika z₁ < 17), kelendutan S vs. target 2% C, dan kecepatan rantai.',
        ja: '10リンク実測長と基準値の比較、多角形速度変動率(z₁ < 17歯で増大)、たるみ量S（目標2% C）、周速度と推奨潤滑方式を確認します。',
      },
      tip: {
        en: 'Keep slack-span sag near 2% of center distance C so bearings are not overloaded.',
        id: 'Jaga kelendutan sisi kendur sekitar 2% dari jarak pusat C agar bantalan tidak terbebani.',
        ja: '軸受への過大荷重を防ぐため、緩み側たるみ量は軸間距離Cの約2%に保つのが理想です。',
      },
      targetSelector: '[data-tour="chain-readouts"]',
    },
    {
      id: 'chain-conveyor-size',
      badge: {
        en: 'Feature 4 · Chain Size',
        id: 'Fitur 4 · Ukuran Rantai',
        ja: '機能4 · チェーン番手',
      },
      title: {
        en: 'ANSI / RS Roller Chain Size (RS 40–160)',
        id: 'Ukuran Rantai Rol ANSI / RS (RS 40–160)',
        ja: 'ANSI / RS ローラチェーン番手 (RS 40〜160)',
      },
      description: {
        en: 'Select standard ANSI/RS pitch sizes from RS 40 (12.7 mm) up to RS 160 (50.8 mm) to scale nominal 10-pitch length and sprocket pitch diameters.',
        id: 'Pilih ukuran pitch standar ANSI/RS dari RS 40 (12,7 mm) hingga RS 160 (50,8 mm) untuk menskalakan panjang nominal 10-pitch dan diameter sproket.',
        ja: 'RS 40 (12.7 mm)〜RS 160 (50.8 mm)の標準番手を選択し、10リンク基準長とスプロケットピッチ径を切り替えます。',
      },
      tip: {
        en: 'Larger pitch chains carry higher tension, but smaller pitches with more teeth run smoother and quieter.',
        id: 'Rantai pitch besar mampu menahan tarik lebih tinggi, tetapi pitch kecil dengan gigi lebih banyak berjalan lebih halus.',
        ja: '大ピッチは高張力に耐えますが、小ピッチ・多歯数の方が多角形振動と騒音を抑えられます。',
      },
      targetSelector: '[data-tour="chain-size"]',
    },
    {
      id: 'chain-conveyor-sprockets',
      badge: {
        en: 'Feature 5 · Sprockets',
        id: 'Fitur 5 · Sproket',
        ja: '機能5 · スプロケット歯数',
      },
      title: {
        en: 'Driver (z₁) & Driven (z₂) Sprocket Teeth',
        id: 'Gigi Sproket Penggerak (z₁) & Digerakkan (z₂)',
        ja: '駆動歯数(z₁)・従動歯数(z₂)',
      },
      description: {
        en: 'Adjust driver teeth z₁ (11–30T) and driven teeth z₂ (21–72T) to control speed ratio and chordal polygonal speed pulsation.',
        id: 'Atur jumlah gigi penggerak z₁ (11–30T) dan digerakkan z₂ (21–72T) untuk mengontrol rasio kecepatan dan getaran poligonal kordal.',
        ja: '駆動歯数z₁(11〜30T)と従動歯数z₂(21〜72T)を調整し、変速比と多角形脈動の変化を確認します。',
      },
      tip: {
        en: 'Use z₁ ≥ 17 teeth for smooth industrial drives; below 17 teeth, chordal action spikes sharply.',
        id: 'Gunakan z₁ ≥ 17 gigi untuk putaran halus; di bawah 17 gigi, variasi kordal melonjak tajam.',
        ja: '産業用駆動では多角形振動を抑えるため、駆動歯数 z₁ ≥ 17歯が推奨されます。',
      },
      faqs: [
        {
          q: {
            en: 'Why does z1 < 17 cause vibration?',
            id: 'Mengapa z1 < 17 memicu getaran?',
            ja: 'なぜ駆動歯数 z1 < 17 で振動が増えるのですか？',
          },
          a: {
            en: 'A chain wraps around a sprocket as a polygon, not a circle. With fewer than 17 teeth, the chordal rise-and-fall per tooth pitch creates noticeable speed pulsation and vibration.',
            id: 'Rantai melingkari sproket membentuk poligon, bukan lingkaran murni. Jika gigi < 17, naik-turun tiap pitch gigi menimbulkan pulsasi kecepatan dan getaran.',
            ja: 'チェーンはスプロケット上で多角形を描くため、17歯未満では1ピッチごとの上下動（弦作用）が大きくなり速度脈動と振動が発生します。',
          },
          keywords: ['chordal', 'polygonal', 'z1', '17', 'vibration', 'kordal', 'getaran'],
        },
      ],
      targetSelector: '[data-tour="chain-sprockets"]',
    },
    {
      id: 'chain-conveyor-wear',
      badge: {
        en: 'Feature 6 · Wear Elongation',
        id: 'Fitur 6 · Aus Rantai',
        ja: '機能6 · 摩耗伸び設定',
      },
      title: {
        en: 'Pin-Bushing Wear Elongation (%)',
        id: 'Perpanjangan Aus Pin-Bushing (%)',
        ja: 'ピン・ブシュ摩耗伸び率 (%)',
      },
      description: {
        en: 'Simulate pin-bushing wear from 0% (new) past 1.5% (hardened/precision limit) up to 3.0%+ (replace immediately before jumping teeth).',
        id: 'Simulasikan keausan pin-bushing dari 0% (baru) melewati 1,5% (batas presisi) hingga 3,0%+ (wajib ganti sebelum loncat gigi).',
        ja: 'ピン・ブシュ摩耗による伸びを0%（新品）から1.5%（硬化歯限界）、3.0%超（要即時交換）まで連続的に再現します。',
      },
      tip: {
        en: 'Replace chains at ≤ 1.5% elongation on hardened sprockets, and never exceed 3.0% on standard drives.',
        id: 'Ganti rantai pada ≤ 1,5% untuk sproket diperkeras, dan jangan pernah melebihi 3,0%.',
        ja: '硬化スプロケットでは1.5%以下、一般駆動でも3.0%を超える前にチェーンを交換してください。',
      },
      faqs: [
        {
          q: {
            en: 'When must a roller chain be replaced?',
            id: 'Kapan rantai rol wajib diganti?',
            ja: 'ローラチェーンの交換基準は何%ですか？',
          },
          a: {
            en: 'At 1.5% elongation for precision/hardened sprockets, and 3.0% maximum for standard sprockets—beyond 3.0%, rollers ride up and hook-wear the teeth.',
            id: 'Pada perpanjangan 1,5% untuk sproket diperkeras/presisi, dan maksimal 3,0% untuk sproket standar—di atas 3,0%, rol menaiki gigi dan memicu aus kait.',
            ja: '精密・硬化スプロケットでは伸び1.5%、一般スプロケットでも最大3.0%が交換限界です。3.0%を超えると歯飛びやフック摩耗を起こします。',
          },
          keywords: ['wear', 'elongation', 'replace', '1.5', '3.0', 'aus', 'ganti', '摩耗'],
        },
      ],
      targetSelector: '[data-tour="chain-wear"]',
    },
    {
      id: 'chain-conveyor-lube',
      badge: {
        en: 'Feature 7 · Lubrication',
        id: 'Fitur 7 · Pelumasan',
        ja: '機能7 · 潤滑方式',
      },
      title: {
        en: 'Lubrication Regime (Dry / Drip / Oil Bath)',
        id: 'Metode Pelumasan (Kering / Tetes / Rendaman)',
        ja: '潤滑方式（無給油 / 滴下 / 油浴）',
      },
      description: {
        en: 'Switch between Dry (None), Manual Drip, and Oil Bath lubrication to match pitch-line speed requirements and prevent pin galling.',
        id: 'Beralih antara Kering, Tetes Manual, dan Rendaman Oli sesuai kecepatan rantai agar pin tidak macet atau cepat aus.',
        ja: '無給油・滴下給油・油浴潤滑を切り替え、チェーン周速度に応じた適切な潤滑条件を確認します。',
      },
      tip: {
        en: 'High pitch-line speeds require Oil Bath lubrication; Dry operation accelerates wear exponentially.',
        id: 'Kecepatan rantai tinggi membutuhkan Rendaman Oli; operasi kering mempercepat keausan secara drastis.',
        ja: '高速駆動では油浴潤滑が必要となり、無給油運転はピン・ブシュ摩耗を急激に進行させます。',
      },
      targetSelector: '[data-tour="chain-lube"]',
    },
    {
      id: 'chain-conveyor-diagnostics',
      badge: {
        en: 'Feature 8 · Troubleshoot',
        id: 'Fitur 8 · Diagnosis Gangguan',
        ja: '機能8 · 異常診断パネル',
      },
      title: {
        en: 'Chain Drive Diagnostic Findings',
        id: 'Hasil Diagnosis Penggerak Rantai',
        ja: 'チェーン伝動 診断結果パネル',
      },
      description: {
        en: 'Review live diagnostic findings for 1.5% / 3.0% wear limits, tooth hook wear, tight (<1% C) or whipping sag, and dry lubrication starvation—then adjust controls to clear every warning.',
        id: 'Tinjau hasil diagnosis untuk batas keausan 1,5% / 3,0%, keausan kait gigi, kelendutan terlalu kencang (<1% C) atau kendur, dan kurang pelumasan—lalu sesuaikan kontrol hingga seluruh peringatan hilang.',
        ja: '摩耗限界(1.5%/3.0%)、フック摩耗、たるみ過不足(<1% C)、潤滑不足の診断結果を確認し、各パラメータを調整して正常状態へ戻します。',
      },
      tip: {
        en: 'Never run a new chain on severely hook-worn sprockets—always inspect teeth when elongation exceeds 3%.',
        id: 'Jangan pasang rantai baru pada sproket yang sudah aus kait—selalu periksa gigi saat aus melebihi 3%.',
        ja: 'フック摩耗したスプロケットに新品チェーンを掛けると即座に伸びるため、3%超過時はスプロケットも点検します。',
      },
      targetSelector: '[data-tour="chain-diagnostics"]',
    },
    {
      id: 'chain-conveyor-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz tabs to test your roller chain inspection and maintenance knowledge.',
        id: 'Beralih antara tab Simulasi, Eksplorasi, Latihan, dan Kuis untuk menguji pemahaman inspeksi dan perawatan rantai rol Anda.',
        ja: '上部タブで探索・演習・クイズを切り替え、ローラチェーンの点検・保守知識を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],
};
