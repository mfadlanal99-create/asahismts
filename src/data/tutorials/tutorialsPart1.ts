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
        id: 'Lab Pelurusan Poros & Soft-Foot',
        ja: '軸芯出し・ソフトフット実習ラボ',
      },
      description: {
        en: 'Master precision motor-to-pump shaft alignment following the 5-step field wizard (Soft Foot, Rough Align, Vertical Shims, Horizontal Jack, Final Verify) against ISO/ANSI RPM tolerances.',
        id: 'Kuasai pelurusan poros motor-pompa presisi mengikuti panduan 5 langkah lapangan (Soft Foot, Lurus Kasar, Shim Vertikal, Jack Horizontal, Verifikasi Akhir) sesuai toleransi ISO/ANSI.',
        ja: '5段階の現場手順（ソフトフット、粗芯出し、垂直シム、水平ジャッキ、最終確認）に沿って、ISO/ANSI回転数別許容値に基づく高精度な軸芯出しを習得します。',
      },
      tip: {
        en: 'Use the top Presets bar (Parallel Offset, Angular Misalignment, Combined + Soft Foot, Aligned) or click Reset anytime.',
        id: 'Gunakan bilah Preset di atas (Offset Paralel, Ketidaklurusan Sudut, Kombinasi + Soft Foot, Lurus) atau klik Reset kapan saja.',
        ja: '上部のプリセット（平行偏心、偏角、複合＋ソフトフット、芯出し完了）やリセットボタンでいつでも状態を切り替えられます。',
      },
    },
    {
      id: 'alignment-soft-foot',
      badge: {
        en: 'Step 1 · Soft Foot',
        id: 'Langkah 1 · Soft Foot',
        ja: '手順1 · ソフトフット',
      },
      title: {
        en: 'Soft-Foot Diagnostic & Shim Check',
        id: 'Diagnosis Soft-Foot & Cek Shim',
        ja: 'ソフトフット診断とシム補正',
      },
      description: {
        en: 'Select the Fault Foot dropdown (FL, FR, RL, RR), click Loosen on each motor foot to inspect bolt lift, and adjust shims with -0.05 / +0.01 / +0.05 buttons—or click the top Soft Foot warning pill to shim any foot > 0.05 mm.',
        id: 'Pilih Fault Foot (FL, FR, RL, RR), klik Kendurkan pada tiap kaki motor untuk cek angkatan, lalu atur shim dengan tombol -0.05 / +0.01 / +0.05—atau klik tombol peringatan Soft Foot di atas untuk kaki > 0.05 mm.',
        ja: '異常脚（FL/FR/RL/RR）を選び、「緩める」で浮き量を確認して -0.05 / +0.01 / +0.05 ボタンでシム挿入します。上部のソフトフット警告ボタンでも 0.05 mm 超を即補正できます。',
      },
      tip: {
        en: 'Always eliminate soft foot (≤ 0.05 mm) before taking dial or laser alignment readings, or tightening bolts will distort the motor frame.',
        id: 'Selalu hilangkan soft foot (≤ 0.05 mm) sebelum mengukur dial atau laser, agar pengencangan baut tidak memelintir rangka motor.',
        ja: 'ダイヤルやレーザー計測の前に必ずソフトフット（≤ 0.05 mm）を解消してください。未補正のまま締め付けるとフレームが歪みます。',
      },
    },
    {
      id: 'alignment-rotation-gauges',
      badge: {
        en: 'Measurement',
        id: 'Pengukuran',
        ja: '計測ビュー',
      },
      title: {
        en: 'Dial Gauges, Laser View & Shaft Sweep',
        id: 'Dial Gauge, Tampilan Laser & Putaran Poros',
        ja: 'ダイヤルゲージ・レーザー表示＆軸回転',
      },
      description: {
        en: 'Switch between Dial Gauges (Rim & Face analog indicators with TIR) and Laser View. Rotate the shaft using the 0° (12:00), 90° (3:00), 180° (6:00), 270° (9:00) cardinal buttons, the Sweep Play/Pause button, or the 0–359° slider.',
        id: 'Beralih antara Dial Gauge (indikator Rim & Face analog dengan TIR) dan Tampilan Laser. Putar poros lewat tombol 0°, 90°, 180°, 270°, tombol Sweep Play/Pause, atau slider 0–359°.',
        ja: 'ダイヤルゲージ（リム／フェイス＋TIR）とレーザー表示を切り替えられます。0°/90°/180°/270°ボタン、Sweep再生/一時停止、0〜359°スライダーで軸を回転させます。',
      },
      tip: {
        en: 'Check the Cardinal Readings table and the T+B = L+R validity rule (Δ error) to verify consistent indicator readings.',
        id: 'Periksa tabel Pembacaan Kardinal dan aturan validitas T+B = L+R (galat Δ) untuk memastikan konsistensi pembacaan.',
        ja: '4方向読取値テーブルと T+B = L+R 妥当性チェック（Δ誤差）で計測の整合性を確認できます。',
      },
    },
    {
      id: 'alignment-worksheet',
      badge: {
        en: 'Correction',
        id: 'Koreksi',
        ja: '芯出し調整',
      },
      title: {
        en: 'Alignment Worksheet & Shim/Jack Adjuster',
        id: 'Lembar Kerja & Penyetel Shim/Jack',
        ja: '補正ワークシート＆シム・ジャッキ調整',
      },
      description: {
        en: 'Read the Actionable Alignment Worksheet for remaining Front/Rear vertical shims and horizontal jack moves. Tune the four ±1.50 mm sliders manually or click Apply Worksheet Moves / Auto-Align to bring offsets and angularity into tolerance.',
        id: 'Baca Lembar Kerja Koreksi untuk sisa shim vertikal Depan/Belakang dan geseran jack horizontal. Atur keempat slider ±1.50 mm secara manual atau klik Terapkan Koreksi / Lurus Otomatis.',
        ja: '補正ワークシートで前後脚の垂直シム量と水平ジャッキ移動量を確認し、4本の ±1.50 mm スライダーで手動調整するか「補正量を適用 / 自動芯出し」で許容範囲へ収めます。',
      },
    },
    {
      id: 'alignment-geometry-thermal',
      badge: {
        en: 'Geometry & Thermal',
        id: 'Geometri & Termal',
        ja: '寸法・熱膨張',
      },
      title: {
        en: 'Machine Geometry, Bar Sag & Thermal Growth',
        id: 'Geometri Mesin, Sag Batang & Pemuaian Termal',
        ja: '機械寸法・バーたわみ・熱膨張補正',
      },
      description: {
        en: 'Set Operating RPM (1000–3600), Coupling Sweep Ø (100–250 mm), Front/Rear Foot Distances (L₁, L₂), Indicator Bar Sag (0–0.20 mm) with the Bar Sag Compensation checkbox, Simulated Soft Foot, and Pump/Motor Thermal Rise (or the Hot Pump +0.15/+0.05 preset).',
        id: 'Atur RPM Operasi (1000–3600), Diameter Sweep (100–250 mm), Jarak Kaki L₁/L₂, Sag Batang (0–0.20 mm) dengan centang Kompensasi Sag, Simulasi Soft Foot, serta Kenaikan Termal Pompa/Motor (atau tombol Pompa Panas +0.15/+0.05).',
        ja: '運転RPM、カップリング径、前後脚距離L₁/L₂、バーたわみ量と補正チェック、模擬ソフトフット、ポンプ/モータ熱膨張（または高温ポンププリセット）を設定し、冷間目標オフセットと診断カードを確認します。',
      },
    },
    {
      id: 'alignment-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz tabs—or press Alt+1..4—to test your shaft alignment calculations and soft-foot troubleshooting skills.',
        id: 'Beralih antara tab Eksplorasi, Latihan, dan Kuis—atau tekan Alt+1..4—untuk menguji perhitungan pelurusan poros dan diagnosis soft-foot Anda.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、芯出し計算やソフトフット診断の理解度を確認できます。',
      },
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
        ja: '梁の曲げ・せん断力図(SFD)・曲げモーメント図(BMD)ラボ',
      },
      description: {
        en: 'Analyze structural beam reactions, Shear Force Diagrams (SFD), Bending Moment Diagrams (BMD), deflection δ_max against L/360, and yield Safety Factor (FoS) in real time.',
        id: 'Analisis reaksi tumpuan, Diagram Gaya Geser (SFD), Diagram Momen Lentur (BMD), lendutan δ_max terhadap batas L/360, serta Faktor Keamanan (FoS) secara real-time.',
        ja: '梁の支点反力、せん断力図（SFD）、曲げモーメント図（BMD）、最大たわみ δ_max（L/360基準）、降伏安全率（FoS）をリアルタイムに解析します。',
      },
      tip: {
        en: 'Use Quick Presets to load standard benchmark cases, Reset to restore defaults, or CSV to export SFD/BMD/deflection data.',
        id: 'Gunakan Preset Cepat untuk kasus uji standar, Reset untuk pengaturan awal, atau tombol CSV untuk mengunduh data SFD/BMD/defleksi.',
        ja: '標準プリセットでベンチマークを呼び出したり、CSVボタンでSFD/BMD/たわみデータを出力できます。',
      },
    },
    {
      id: 'beam-support-load',
      badge: {
        en: 'Support & Load',
        id: 'Tumpuan & Beban',
        ja: '支持・荷重',
      },
      title: {
        en: 'Support System & Load Type Selectors',
        id: 'Pemilih Sistem Tumpuan & Jenis Beban',
        ja: '支持条件と荷重形態の選択',
      },
      description: {
        en: 'Toggle Support System between Simply Supported, Cantilever, and Overhang, and choose Load Type (Point, UDL, or Combined). Adjust Span Length L (1–10 m), Overhang Length a (when Overhang is active), Point Load P & x_P, and UDL w with Start/End positions.',
        id: 'Pilih Sistem Tumpuan (Sederhana, Kantilever, Gantung) dan Jenis Beban (Terpusat, Merata/UDL, Kombinasi). Atur Panjang Bentang L (1–10 m), Panjang Gantung a, Beban P & x_P, serta Beban Merata w dengan posisi Awal/Akhir.',
        ja: '支持条件（単純支持・片持ち・張り出し）と荷重形態（集中・等分布・複合）を選択し、支間長L、張り出し長a、集中荷重P・位置x_P、等分布荷重w・開始/終了位置を調整します。',
      },
    },
    {
      id: 'beam-material',
      badge: {
        en: 'Material',
        id: 'Material',
        ja: '構造材料',
      },
      title: {
        en: 'Structural Material & Custom Properties',
        id: 'Material Struktur & Properti Kustom',
        ja: '構造材料とカスタム物性入力',
      },
      description: {
        en: 'Pick a preset engineering material from the Structural Material dropdown (showing E and σy) or choose Custom User Material to type custom Young’s Modulus E (GPa), Yield Strength σy (MPa), and Density ρ (kg/m³).',
        id: 'Pilih material teknik dari daftar Material Struktur (menampilkan E dan σy) atau pilih Material Kustom untuk mengisi Modulus Young E (GPa), Tegangan Luluh σy (MPa), dan Densitas ρ (kg/m³).',
        ja: '構造材料ドロップダウンから標準材料（E・σy表示）を選ぶか、カスタム材料を選択してヤング率E、降伏強さσy、密度ρを直接入力できます。',
      },
    },
    {
      id: 'beam-cross-section',
      badge: {
        en: 'Cross-Section',
        id: 'Penampang',
        ja: '断面設計',
      },
      title: {
        en: 'Cross-Section CAD & Section Properties',
        id: 'CAD Penampang & Properti Inersia',
        ja: '断面CAD形状と断面性能計算',
      },
      description: {
        en: 'Switch between I-Beam, Rect, and Circle cross-sections and edit dimensions (d, bf, tf, tw; b, h; or Diameter d). The live 2D CAD preview updates Moment of Inertia I_x, Section Modulus S_x, Area A, and Linear Mass.',
        id: 'Pilih bentuk penampang I-Beam, Rect, atau Circle lalu ubah dimensinya (d, bf, tf, tw; b, h; atau Diameter d). Pratinjau CAD 2D langsung menghitung Momen Inersia I_x, Modulus Penampang S_x, Luas A, dan Massa Linier.',
        ja: '断面形状（I形鋼・長方形・円形）を切り替えて寸法を入力すると、2D CAD断面図とともに断面二次モーメントI_x、断面係数S_x、断面積A、単位質量が即座に更新されます。',
      },
    },
    {
      id: 'beam-diagrams-metrics',
      badge: {
        en: 'Diagnostics',
        id: 'Diagnostik',
        ja: '解析結果',
      },
      title: {
        en: 'Deflection Scale & Engineering Dashboard',
        id: 'Skala Defleksi & Dasbor Metrik Teknik',
        ja: 'たわみ倍率と工学指標ダッシュボード',
      },
      description: {
        en: 'Cycle the Deflection Scale button (5x, 15x, 30x Exaggeration) to inspect curvature clearly, and monitor the four KPI cards: Reactions (R_A, R_B / M_A), Extremes (|V|_max, |M|_max), Max Deflection (with ≤ L/360 badge), and Safety Factor (SAFE / MARGINAL / FAIL).',
        id: 'Klik tombol Skala Defleksi (5x, 15x, 30x) untuk memperjelas kelengkungan balok, lalu pantau 4 kartu metrik: Gaya Reaksi, Ekstrem (V, M), Lendutan Maks (dengan lencana ≤ L/360), serta Faktor Keamanan (SAFE / MARGINAL / FAIL).',
        ja: 'たわみ倍率ボタン（5x/15x/30x）で変形を強調表示し、支点反力、最大断面力|V|_max・|M|_max、最大たわみ（L/360判定）、安全率（SAFE/MARGINAL/FAIL）を確認します。',
      },
    },
    {
      id: 'beam-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use the top mode tabs or Alt+1..4 shortcuts to move from Explore into Practice problems and the Quiz to test your SFD, BMD, and bending stress mastery.',
        id: 'Gunakan tab mode di atas atau pintasan Alt+1..4 untuk berpindah dari Eksplorasi ke Latihan dan Kuis guna menguji pemahaman SFD, BMD, dan tegangan lentur.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、SFD/BMDや曲げ応力の理解度を確認できます。',
      },
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
        en: 'Bearing Life (ISO 281), Fits & Diagnostics',
        id: 'Umur Bearing (ISO 281), Suaian & Diagnostik',
        ja: '軸受寿命（ISO 281）・はめあい・状態監視ラボ',
      },
      description: {
        en: 'Evaluate rolling bearing fatigue life (L10, L10h, L10ha), static safety factor s0, ISO 286 shaft/housing fits, vibration FFT fault frequencies, and induction heater mounting expansion.',
        id: 'Evaluasi umur fatik bantalan (L10, L10h, L10ha), faktor keamanan statis s0, suaian poros/rumah ISO 286, spektrum FFT getaran, serta ekspansi pemanas induksi.',
        ja: '転がり軸受の定格寿命（L10/L10h/L10ha）、静安全係数s0、ISO 286はめあい、振動FFT周波数診断、誘導加熱組付すきまを統合的に解析します。',
      },
      tip: {
        en: 'Use the Scenarios bar (Standard Motor 6308, Overloaded Ball 6206, NU Axial Fault, Heavy Fit Preload) plus Pause/Rotate and Reset controls.',
        id: 'Gunakan bilah Skenario (Motor Standar 6308, Beban Berlebih 6206, Gangguan Aksial NU, Preload Suaian Sesak) serta tombol Jeda/Putar dan Reset.',
        ja: '上部のシナリオボタン（標準モータ6308、過負荷6206、NUアキシアル異常、過大しめしろ予圧）や回転・リセットボタンを活用できます。',
      },
    },
    {
      id: 'bearing-loads-catalog',
      badge: {
        en: 'Catalog & Loads',
        id: 'Katalog & Beban',
        ja: '形式・荷重',
      },
      title: {
        en: 'Bearing Series & Operating Load Sliders',
        id: 'Seri Bearing & Slider Beban Operasi',
        ja: '軸受形式選択と運転荷重・回転数設定',
      },
      description: {
        en: 'Choose a Bearing Type & Series (inspecting Dynamic C, Static C0, and Exponent p) and tune Radial Load Fr (0.5–35 kN), Axial Load Fa (0–15 kN), Shaft Speed N (100–6000 RPM), and Lubrication/Temp factor a_ISO (0.20–2.50).',
        id: 'Pilih Tipe & Seri Bearing (melihat C dinamis, C0 statis, dan eksponen p) lalu atur Beban Radial Fr (0.5–35 kN), Beban Aksial Fa (0–15 kN), Putaran N (100–6000 RPM), dan faktor pelumasan a_ISO (0.20–2.50).',
        ja: '軸受形式を選択（動定格C・静定格C0・指数p表示）し、ラジアル荷重Fr、アキシアル荷重Fa、回転速度N、潤滑・温度係数a_ISOを調整します。',
      },
    },
    {
      id: 'bearing-iso-fits',
      badge: {
        en: 'ISO 286 Fits',
        id: 'Suaian ISO 286',
        ja: 'ISO 286 はめあい',
      },
      title: {
        en: 'Shaft & Housing Fit Selection',
        id: 'Pemilihan Suaian Poros & Rumah',
        ja: '軸・ハウジングのはめあい選定',
      },
      description: {
        en: 'Select Shaft Fit and Housing Fit codes from the ISO 286 dropdowns to inspect min/max clearance or interference (µm) and how tight fits reduce internal radial clearance.',
        id: 'Pilih kode Suaian Poros dan Suaian Rumah ISO 286 untuk melihat rentang kelonggaran atau interferensi (µm) serta dampaknya terhadap pengurangan celah radial internal.',
        ja: 'ISO 286の軸はめあい・ハウジングはめあいを選択し、すきま・しめしろ範囲（µm）と内部すきま減少量を確認します。',
      },
    },
    {
      id: 'bearing-condition-fft',
      badge: {
        en: 'Condition & FFT',
        id: 'Kondisi & FFT',
        ja: '状態監視 FFT',
      },
      title: {
        en: 'Condition Monitoring & Vibration FFT Spectrum',
        id: 'Pemantauan Kondisi & Spektrum FFT Getaran',
        ja: '状態監視・振動FFTスペクトル診断',
      },
      description: {
        en: 'Switch health states inside the Condition Monitoring panel (Healthy, Outer Race Defect BPFO, Inner Race Defect BPFI, Lubrication Starvation / Overheat) to observe ISO vibration severity zones, FFT defect peaks, acoustic signatures, and Condition & Fit Diagnostics.',
        id: 'Ubah status kesehatan pada panel Pemantauan Kondisi (Sehat, Cacat Lintasan Luar BPFO, Cacat Lintasan Dalam BPFI, Kurang Pelumasan) untuk mengamati zona ISO getaran, puncak FFT, dan Diagnostik Kondisi.',
        ja: '状態監視パネルで健全・外輪傷(BPFO)・内輪傷(BPFI)・潤滑不良を切り替え、ISO振動シビアリティ、FFTピーク、音響特徴、適合診断を確認します。',
      },
    },
    {
      id: 'bearing-induction-heater',
      badge: {
        en: 'Mounting',
        id: 'Pemasangan',
        ja: '誘導加熱組付',
      },
      title: {
        en: 'Induction Heater & Mounting Advisor',
        id: 'Penasihat Pemanas Induksi & Pemasangan',
        ja: '誘導加熱ヒーター温度アドバイザー',
      },
      description: {
        en: 'Slide Induction Heater Temp (70–135 °C) to compute bore Diametral Expansion (µm) against Max Interference and Slip-On Clearance. Keep temperature at the 110 °C target and never exceed the 125 °C safe limit.',
        id: 'Geser Suhu Pemanas Induksi (70–135 °C) untuk menghitung Ekspansi Diameter (µm) dibanding Interferensi Maks dan Celah Masuk Poros. Pertahankan di target 110 °C dan hindari melebihi batas aman 125 °C.',
        ja: '誘導加熱温度スライダー（70〜135 °C）で内径膨張量、最大しめしろ、挿入すきまを計算します。推奨110 °Cを目標とし、上限125 °Cを超えないよう注意します。',
      },
    },
    {
      id: 'bearing-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes using the top tabs or Alt+1..4 shortcuts to test your L10 life, ISO fit, and fault-frequency skills.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis lewat tab atas atau pintasan Alt+1..4 untuk menguji perhitungan umur L10, suaian ISO, dan frekuensi cacat.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、L10寿命計算やはめあい・異常診断の理解度を確認できます。',
      },
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
        en: 'Explore 2D cross-section cutaways of rolling bearing architectures, compare contact angle α and load paths, inspect Open / 2Z / 2RS enclosures, and match bearings to industrial applications.',
        id: 'Pelajari potongan melintang 2D berbagai arsitektur bantalan, bandingkan sudut kontak α dan jalur beban, periksa pelindung Open / 2Z / 2RS, serta cocokkan dengan aplikasi industri.',
        ja: '2D断面図で各種転がり軸受の構造、接触角αと荷重経路、開放/2Z/2RSシール仕様を比較し、用途別選定を学びます。',
      },
    },
    {
      id: 'bearing-basics-architecture',
      badge: {
        en: 'Architecture',
        id: 'Arsitektur',
        ja: '軸受形式',
      },
      title: {
        en: 'Select Bearing Architecture & Seals',
        id: 'Pilih Arsitektur Bantalan & Seal',
        ja: '軸受形式と防じん・シール構造の選択',
      },
      description: {
        en: 'Click any bearing card in the grid (all 25 mm ISO bore) to inspect its rolling elements and contact angle α, then toggle Protection Enclosure / Seal between Open, 2Z (Steel Shield), and 2RS (Rubber NBR) where supported.',
        id: 'Klik kartu bantalan (semua diameter lubang ISO 25 mm) untuk melihat elemen gelinding dan sudut kontak α, lalu pilih Pelindung / Seal antara Open, 2Z (Pelindung Baja), dan 2RS (Karet NBR).',
        ja: '軸受形式ボタン（すべて内径25 mm）を切り替えて転動体と接触角αを確認し、対応するシール構造（Open / 2Z鋼板シールド / 2RSゴムシール）を比較します。',
      },
      tip: {
        en: 'Notice how 2RS rubber contact seals increase Seal Friction drag and reduce the Grease Limit RPM compared to Open or 2Z.',
        id: 'Perhatikan bagaimana seal karet 2RS meningkatkan friksi dan menurunkan batas kecepatan gemuk (Grease Limit) dibanding Open atau 2Z.',
        ja: '2RS接触ゴムシールはシール摩擦が増え、Openや2Zに比べてグリース許容回転数が低下する点に注目してください。',
      },
    },
    {
      id: 'bearing-basics-loads',
      badge: {
        en: 'Load Paths',
        id: 'Jalur Beban',
        ja: '荷重負荷',
      },
      title: {
        en: 'Radial Fr, Axial Fa & Shaft Rotation',
        id: 'Beban Radial Fr, Aksial Fa & Putaran Poros',
        ja: 'ラジアル荷重Fr・アキシアル荷重Fa・軸回転',
      },
      description: {
        en: 'Drag the Radial Fr (0–25 kN) and Axial Fa (0–15 kN) sliders to visualize live force vectors through the rolling elements and raceways, and use Pause/Rotate Shaft to inspect the cutaway.',
        id: 'Geser slider Radial Fr (0–25 kN) dan Aksial Fa (0–15 kN) untuk melihat vektor gaya langsung melalui elemen gelinding, serta gunakan tombol Jeda/Putar Poros.',
        ja: 'ラジアル荷重Fr（0〜25 kN）とアキシアル荷重Fa（0〜15 kN）のスライダーで軌道輪・転動体の荷重伝達方向を可視化し、回転/停止ボタンで断面を観察します。',
      },
    },
    {
      id: 'bearing-basics-matcher',
      badge: {
        en: 'App Matcher',
        id: 'Pencocok Aplikasi',
        ja: '最適軸受マッチャー',
      },
      title: {
        en: 'Interactive Application Matcher',
        id: 'Pencocok Aplikasi Bantalan Interaktif',
        ja: '用途別 最適軸受マッチャー',
      },
      description: {
        en: 'Select a Load & Motion Profile and Environment / Lubrication condition to get a Recommended Specification with Match % and engineering rationale, then click Apply to CAD Viewer to load it immediately.',
        id: 'Pilih Profil Beban & Putaran serta Lingkungan / Pelumasan untuk mendapatkan Rekomendasi Spesifikasi beserta skor kecocokan, lalu klik Terapkan ke Visual untuk memuatnya ke CAD.',
        ja: '荷重・回転条件と使用環境・潤滑を選ぶと推奨仕様と適合率が表示され、「断面図へ反映」ボタンで即座にビューアへ適用できます。',
      },
    },
    {
      id: 'bearing-basics-readouts',
      badge: {
        en: 'Ratings',
        id: 'Kapasitas',
        ja: '定格値',
      },
      title: {
        en: 'Engineering Readouts & Shop Rules',
        id: 'Pembacaan Teknik & Kaidah Bengkel',
        ja: '定格諸元と現場実務ルール',
      },
      description: {
        en: 'Compare Dynamic Cr, Static C0, Grease Limit, and Oil Limit cards alongside the Shop Practice Rule of Thumb warning (such as radial load on pure thrust bearing 51105).',
        id: 'Bandingkan kartu Dinamis Cr, Statis C0, Batas Gemuk, dan Batas Oli bersama catatan Kaidah Praktis Bengkel (misalnya larangan beban radial pada bantalan aksial 51105).',
        ja: '動定格Cr、静定格C0、グリース/油潤滑上限回転数と、現場実務の設計ルール（スラスト軸受51105へのラジアル荷重警告など）を確認します。',
      },
    },
    {
      id: 'bearing-basics-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use the Explore, Practice, and Quiz tabs or Alt+1..4 shortcuts to test your ability to select the right bearing architecture and seal for real machines.',
        id: 'Gunakan tab Eksplorasi, Latihan, dan Kuis atau pintasan Alt+1..4 untuk menguji kemampuan Anda memilih jenis bantalan dan seal yang tepat.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、軸受形式とシールの選定力を試せます。',
      },
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
        id: 'Lab Pelacakan & Pelurusan Belt Conveyor',
        ja: 'ベルトコンベヤ蛇行調整・トラッキングラボ',
      },
      description: {
        en: 'Diagnose and correct lateral belt wander (±25 mm frame clearance) caused by unequal tail take-up screws, off-center chute loading, and head pulley skew using the First-Contact steering rule.',
        id: 'Diagnosis dan koreksi penyimpangan sabuk lateral (batas ±25 mm) akibat baut take-up tidak seimbang, beban chute miring, dan puli kepala miring menggunakan aturan kontak pertama.',
        ja: 'テイクアップねじの不均等、シュート片荷、ヘッドプーリ傾きによるベルト横蛇行（許容±25 mm）を、先当たりの法則に基づいて診断・調心します。',
      },
      tip: {
        en: 'Use the Scenarios bar (Centered Reference, Unequal Take-Up, Off-Center Chute Load, Head Frame Misalignment) and Run/Pause/Reset buttons.',
        id: 'Gunakan bilah Skenario (Sabuk Sentris, Take-Up Timpang, Beban Chute Miring, Puli Kepala Miring) serta tombol Jalan/Jeda/Reset.',
        ja: 'シナリオボタン（中央正常、テイクアップ不均等、シュート片荷、ヘッドプーリ傾き）や運転/一時停止/リセットを活用できます。',
      },
    },
    {
      id: 'belt-conveyor-takeup',
      badge: {
        en: 'Take-Up',
        id: 'Take-Up',
        ja: 'テイクアップ',
      },
      title: {
        en: 'Tail Pulley Screw Take-Ups (Left & Right)',
        id: 'Baut Take-Up Puli Ekor (Kiri & Kanan)',
        ja: 'テールプーリ・左右テイクアップねじ調整',
      },
      description: {
        en: 'Adjust Left Tail Take-Up and Right Tail Take-Up sliders (5–45 mm) to steer the belt via differential tension Δ(L−R). Remember: a belt tracks toward the looser / first-contacting side.',
        id: 'Atur slider Take-Up Ekor Kiri dan Kanan (5–45 mm) untuk mengarahkan sabuk melalui selisih tegangan Δ(L−R). Ingat: sabuk bergeser ke sisi yang lebih kendur / kontak pertama.',
        ja: '左右のテイクアップねじ（5〜45 mm）を調整し、張力差 Δ(L−R) でベルトを操舵します。ベルトは緩い側（先に接触する側）へ寄る性質を利用します。',
      },
    },
    {
      id: 'belt-conveyor-idler-chute',
      badge: {
        en: 'Idler & Chute',
        id: 'Idler & Chute',
        ja: 'アイドラ・シュート',
      },
      title: {
        en: 'Training Idler Skew & Chute Loading Offset',
        id: 'Skew Training Idler & Offset Pemuatan Chute',
        ja: '調心アイドラ操舵＆シュート偏心',
      },
      description: {
        en: 'Steer the belt with Training Idler Skew (-4° to +4°) and inject off-center material loading faults using the Chute Loading Offset (-60 to +60 mm) slider.',
        id: 'Kemudikan sabuk dengan Sudut Skew Training Idler (-4° hingga +4°) dan simulasikan gangguan beban tidak sentris melalui slider Offset Pemuatan Chute (-60 hingga +60 mm).',
        ja: '調心アイドラ・スキュー角（±4°）でベルトを操舵し、シュート偏心スライダー（±60 mm）で片荷による蛇行を再現・補正します。',
      },
    },
    {
      id: 'belt-conveyor-speed-fault',
      badge: {
        en: 'Drive & Fault',
        id: 'Penggerak & Gangguan',
        ja: '駆動・異常',
      },
      title: {
        en: 'Belt Speed, Head Skew & Auto-Center',
        id: 'Laju Sabuk, Miring Kepala & Setel Sentris',
        ja: 'ベルト速度・ヘッド傾き・自動調心',
      },
      description: {
        en: 'Tune Belt Speed (0.8–3.5 m/s) and Head Skew (-1.5° to +1.5°). When Lateral Wander exceeds 3 mm, an Auto-Center button appears in the top bar to square the take-ups, center the chute, and set the training idler.',
        id: 'Atur Laju Sabuk (0.8–3.5 m/s) dan Miring Kepala (-1.5° hingga +1.5°). Saat penyimpangan > 3 mm, tombol Setel Sentris muncul di bilah atas untuk meluruskan konveyor otomatis.',
        ja: 'ベルト速度（0.8〜3.5 m/s）とヘッド傾き（±1.5°）を調整します。蛇行量が 3 mm を超えると上部に「自動調心」ボタンが現れ、一括補正できます。',
      },
    },
    {
      id: 'belt-conveyor-telemetry',
      badge: {
        en: 'Telemetry',
        id: 'Telemetri',
        ja: '計測・内訳',
      },
      title: {
        en: 'Clearance Dial, Telemetry & Breakdown',
        id: 'Dial Ruang Bebas, Telemetri & Rincian Geser',
        ja: 'クリアランス計・テレメトリ＆蛇行要因内訳',
      },
      description: {
        en: 'Monitor the 6 telemetry cards (Lateral Wander, Take-Up Steering, Training Idler, Edge Tensions L/R, Drive Power, Head Pulley Speed), the CLR % dial, the Diagnostic Banner, and the Wander Contribution Breakdown.',
        id: 'Pantau 6 kartu telemetri (Penyimpangan Sabuk, Efek Take-Up, Training Idler, Tegangan Tepi Ki/Ka, Daya Penggerak, Putaran Puli Kepala), dial CLR %, Banner Diagnosis, dan Rincian Kontribusi Geser.',
        ja: '6つの計測カード（横蛇行量、テイクアップ操舵、調心アイドラ、左右張力、駆動動力、ヘッド回転数）、CLR%ダイヤル、診断バナー、蛇行要因内訳を確認できます。',
      },
    },
    {
      id: 'belt-conveyor-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes via the top tabs or Alt+1..4 shortcuts to test your conveyor tracking and tension diagnostics.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis melalui tab atas atau pintasan Alt+1..4 untuk menguji kemampuan pelacakan sabuk konveyor Anda.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、コンベヤの蛇行調整・診断力を確認できます。',
      },
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
        ja: 'Vベルト＆平歯車伝動・診断ラボ',
      },
      description: {
        en: 'Switch between V-Belt Drive and Spur Gear Drive to study speed ratio i, output torque T₂, belt slip/span deflection, gear backlash, AGMA tooth safety, and drive fault troubleshooting.',
        id: 'Beralih antara Penggerak V-Belt dan Roda Gigi Lurus untuk mempelajari rasio kecepatan i, torsi output T₂, slip & defleksi sabuk, backlash roda gigi, keamanan gigi AGMA, dan diagnosis gangguan.',
        ja: 'Vベルト駆動と平歯車駆動を切り替え、変速比i、出力トルクT₂、ベルトスリップ・たわみ量、歯車バックラッシ、AGMA歯元安全率、故障診断を学習します。',
      },
      tip: {
        en: 'Use the top Pause/Run and Reset buttons, and watch the status badge (Properly Tensioned, Loose, or Over-tightened).',
        id: 'Gunakan tombol Jeda/Jalankan dan Reset di atas, serta pantau lencana status (Ketegangan Tepat, Kendur, atau Terlalu Kencang).',
        ja: '上部の運転/一時停止・リセットボタンと、状態バッジ（適正・緩み・過張力）を活用してください。',
      },
    },
    {
      id: 'belt-gear-vbelt',
      badge: {
        en: 'V-Belt Mode',
        id: 'Mode V-Belt',
        ja: 'Vベルト駆動',
      },
      title: {
        en: 'V-Belt Section, Pulleys & Tension Tuning',
        id: 'Penampang V-Belt, Puli & Penyetelan Ketegangan',
        ja: 'Vベルト断面・プーリ径・張力調整',
      },
      description: {
        en: 'In V-Belt mode, select Cross-Section (Z/3V, A, B/5V, C) and tune Driver D₁, Driven D₂, Center Distance C, Motor Speed N₁, Motor Power P, Belt Tension %, Mid-Span Test Force, and Sheave Misalignment—or click Nominal / Loose Belt / Over-Tight quick scenarios.',
        id: 'Pada mode V-Belt, pilih penampang (Z/3V, A, B/5V, C) lalu atur D₁, D₂, Jarak Pusat C, RPM Motor N₁, Daya P, Ketegangan %, Gaya Uji Tengah Bentang, dan Ketidaksejajaran Puli—atau klik skenario Nominal / Loose Belt / Over-Tight.',
        ja: 'Vベルトモードでは断面（Z/3V, A, B/5V, C）を選び、D₁/D₂径、軸間距離C、回転数N₁、動力P、張力%、たわみ試験荷重、プーリ傾きを調整（またはNominal/Loose/Over-Tightボタンを使用）します。',
      },
    },
    {
      id: 'belt-gear-spur',
      badge: {
        en: 'Spur Gear Mode',
        id: 'Mode Roda Gigi',
        ja: '平歯車駆動',
      },
      title: {
        en: 'Gear Teeth, Module & Backlash Tuning',
        id: 'Jumlah Gigi, Modul & Penyetelan Backlash',
        ja: '歯数・モジュール・バックラッシ調整',
      },
      description: {
        en: 'In Spur Gear mode, set Driver Z₁ (12–42T), Driven Z₂ (18–72T), Gear Module m (1.5–5 mm), Motor Speed N₁, Motor Power P, and Center Offset ΔC (-0.3 to +1.0 mm)—or use Optimal / High Backlash / Binding presets.',
        id: 'Pada mode Roda Gigi, atur gigi Z₁ (12–42T), Z₂ (18–72T), Modul m (1.5–5 mm), Putaran N₁, Daya P, dan Offset Pusat ΔC (-0.3 s/d +1.0 mm)—atau gunakan preset Optimal / High Backlash / Binding.',
        ja: '平歯車モードでは歯数Z₁/Z₂、モジュールm（1.5〜5 mm）、回転数N₁、動力P、中心距離オフセットΔC（-0.3〜+1.0 mm）を調整（またはOptimal/High Backlash/Bindingプリセットを使用）します。',
      },
    },
    {
      id: 'belt-gear-diagnostics',
      badge: {
        en: 'Telemetry',
        id: 'Telemetri',
        ja: '診断・計測',
      },
      title: {
        en: 'Live Telemetry & Safety Indicators',
        id: 'Telemetri Langsung & Indikator Keamanan',
        ja: 'リアルタイム計測と安全警告',
      },
      description: {
        en: 'Track Speed Ratio, Output RPM, Output Torque, Belt Length / Center Distance, Temp, Slip / Backlash, Vibration RMS, and Acoustic Noise dBA, plus Nearest Standard Belt matching and AGMA Bending S_F / Contact S_H safety.',
        id: 'Pantau Rasio Kecepatan, RPM Output, Torsi Output, Panjang Sabuk / Jarak Pusat, Suhu, Slip / Backlash, Getaran RMS, Kebisingan dBA, pencocokan sabuk standar, dan faktor keamanan AGMA S_F / S_H.',
        ja: '変速比、出力回転数・トルク、温度、スリップ/バックラッシ、振動RMS、騒音dBA、最寄り標準ベルト照合、AGMA曲げ/歯面安全率S_F・S_Hを確認します。',
      },
    },
    {
      id: 'belt-gear-troubleshooting',
      badge: {
        en: 'Troubleshooting',
        id: 'Pemecahan Masalah',
        ja: '故障診断モード',
      },
      title: {
        en: 'Guided & Blind Troubleshooting Mode',
        id: 'Mode Pemecahan Masalah Terpandu & Buta',
        ja: '故障診断（ガイド／ブラインド）モード',
      },
      description: {
        en: 'Click Troubleshooting Mode in the top toolbar to inject realistic drive faults and practice diagnosing symptoms from vibration, temperature, noise, and slip/backlash clues.',
        id: 'Klik Mode Pemecahan Masalah di bilah atas untuk menyuntikkan gangguan penggerak nyata dan berlatih mendiagnosis gejala dari data getaran, suhu, kebisingan, dan slip/backlash.',
        ja: '上部の「故障診断モード」をクリックすると実際の駆動異常を再現でき、振動・温度・騒音・スリップ/バックラッシの手がかりから原因を特定する訓練ができます。',
      },
    },
    {
      id: 'belt-gear-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes using the top tabs or Alt+1..4 shortcuts to test your V-belt tensioning and spur gear kinematics knowledge.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis melalui tab atas atau pintasan Alt+1..4 untuk menguji pemahaman ketegangan V-belt dan kinematika roda gigi.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、Vベルト張力調整や歯車力学の理解度を確認できます。',
      },
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
        en: 'Bolt Torque, Preload & Flange Lab',
        id: 'Lab Torsi Baut, Preload & Flensa',
        ja: 'ボルト締付トルク・軸力・フランジ締付ラボ',
      },
      description: {
        en: 'Explore the T = K · d · Fi relationship between wrench torque, nut factor K, clamping preload Fi, elastic elongation ΔL, and ISO 898-1 proof load limits.',
        id: 'Pelajari hubungan T = K · d · Fi antara torsi kunci momen, faktor mur K, gaya jepit Fi, elongasi elastis ΔL, dan batas proof load ISO 898-1.',
        ja: 'トルク式 T = K・d・Fi に基づき、締付トルク、トルク係数K、締付軸力Fi、弾性伸びΔL、ISO 898-1保証荷重の関係を学習します。',
      },
      tip: {
        en: 'Toggle Click ON / Muted at the top-right of the controls panel to hear mechanical click-wrench audio when crossing the 75% Proof target.',
        id: 'Aktifkan tombol Suara ON / Senyap di kanan atas panel kontrol untuk mendengar bunyi klik kunci momen saat mencapai target 75% Proof.',
        ja: '制御パネル右上の音声ON/消音ボタンで、目標75%保証荷重到達時のトルクレンチ「カチッ」音を有効にできます。',
      },
    },
    {
      id: 'bolt-torque-spec',
      badge: {
        en: 'Fastener Spec',
        id: 'Spesifikasi Baut',
        ja: 'ボルト仕様',
      },
      title: {
        en: 'Metric Bolt Size, Property Class & Lubrication',
        id: 'Ukuran Baut Metrik, Kelas Properti & Pelumasan',
        ja: 'ねじサイズ・強度区分・潤滑条件（K値）',
      },
      description: {
        en: 'Pick a Metric Bolt Size (ISO Coarse), Property Class (ISO 898-1), and Surface & Lubrication Condition (Nut Factor K) to see how friction K dramatically changes required torque for the same preload.',
        id: 'Pilih Ukuran Baut Metrik, Kelas Properti (ISO 898-1), dan Kondisi Permukaan & Pelumasan (Faktor Mur K) untuk melihat pengaruh besar gesekan K terhadap torsi yang dibutuhkan.',
        ja: 'メートル並目ねじサイズ、強度区分（ISO 898-1）、表面・潤滑条件（トルク係数K）を選択し、摩擦係数Kが同一軸力に対する必要トルクに与える影響を確認します。',
      },
    },
    {
      id: 'bolt-torque-wrench',
      badge: {
        en: 'Wrench & Grip',
        id: 'Kunci & Jepit',
        ja: 'トルク・締付長',
      },
      title: {
        en: 'Torque Wrench Slider, Proof Presets & Grip Length',
        id: 'Slider Kunci Momen, Preset Proof & Panjang Jepit',
        ja: '印加トルク・保証荷重プリセット・有効締付長',
      },
      description: {
        en: 'Drag the Applied Wrench Torque (T) slider or click 50% Proof, 75% Target, 92% Caution, or 110% Yield presets, and adjust Effective Grip Length L_grip (20–120 mm) to observe elastic bolt stretch ΔL.',
        id: 'Geser slider Torsi Kunci Momen (T) atau klik preset 50% Proof, 75% Target, 92% Caution, atau 110% Yield, serta atur Panjang Jepit Efektif L_grip (20–120 mm) untuk melihat elongasi ΔL.',
        ja: '印加トルク(T)スライダーまたは50%/75%/92%/110%プリセットボタンを操作し、有効締付長さ L_grip（20〜120 mm）を変えて弾性伸びΔLを観察します。',
      },
    },
    {
      id: 'bolt-torque-readouts',
      badge: {
        en: 'Readouts',
        id: 'Pembacaan',
        ja: '計測・警告',
      },
      title: {
        en: 'Live Preload Cards & Yield Status Banner',
        id: 'Kartu Preload Langsung & Banner Status Luluh',
        ja: 'リアルタイム軸力カードと降伏判定バナー',
      },
      description: {
        en: 'Watch Applied Torque, Clamping Preload Fi, Tensile Stress σt, Proof Capacity %, Thread Stress Area As, and Elastic Elongation ΔL update alongside the color-coded status banner (Under-Torqued, Optimal, Caution, Yielded, Stripped).',
        id: 'Pantau Torsi, Gaya Jepit Fi, Tegangan Tarik σt, Kapasitas Proof %, Luas Tegangan Ulir As, dan Elongasi ΔL beserta banner status (Kurang, Optimal, Hati-hati, Luluh, Slek).',
        ja: '印加トルク、締付軸力Fi、引張応力σt、保証荷重比%、有効断面積As、弾性伸びΔLと、色分けされた状態判定バナー（不足・最適・注意・降伏・破断）を確認します。',
      },
    },
    {
      id: 'bolt-torque-dry-flange',
      badge: {
        en: 'Comparison & Flange',
        id: 'Perbandingan & Flensa',
        ja: '潤滑比較・フランジ',
      },
      title: {
        en: 'Dry vs Lubricated Strip & Flange Star-Pattern Lab',
        id: 'Strip Kering vs Pelumas & Lab Pola Bintang Flensa',
        ja: '乾燥vs潤滑比較＆フランジ星型締付ラボ',
      },
      description: {
        en: 'Use the Dry vs Lubricated Over-Torque Comparison Strip below to see what happens when dry spec torque is applied to a lubricated bolt, and practice multi-pass cross/star-pattern tightening in the Flange Star-Pattern Mini-Lab.',
        id: 'Gunakan Strip Perbandingan Kering vs Pelumas untuk melihat risiko over-torque saat torsi kering dipakai pada baut berpelumas, dan latih pengencangan pola bintang bertahap di Mini-Lab Flensa.',
        ja: '下部の「乾燥vs潤滑比較ストリップ」で乾燥基準トルクを潤滑ボルトに適用した際の過締付リスクを確認し、フランジ星型締付ミニラボで対角線上の段階締付を実践します。',
      },
    },
    {
      id: 'bolt-torque-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes using the top tabs or Alt+1..4 shortcuts to test your bolted joint torque and preload calculations.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis lewat tab atas atau pintasan Alt+1..4 untuk menguji perhitungan torsi dan preload sambungan baut.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、ボルト締結のトルク・軸力計算の理解度を確認できます。',
      },
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
        en: 'Cylinder Bore Gauge & 6-Point Inspection Lab',
        id: 'Lab Dial Bore Gauge & Inspeksi 6-Titik Silinder',
        ja: 'シリンダボアゲージ＆6点内径検査ラボ',
      },
      description: {
        en: 'Measure cylinder liner wear using an 85.000 mm Master Ring setup, rock the gauge to find the true 0.0° null reversal point, log a 6-point bore map, and diagnose ovality and taper against the 0.050 mm OEM limit.',
        id: 'Ukur keausan liner silinder dengan referensi Master Ring Ø85.000 mm, goyangkan gauge ke titik balik 0.0°, catat peta 6-titik, serta diagnosis ovalitas dan ketirusan terhadap batas OEM 0.050 mm.',
        ja: '基準リング Ø85.000 mm でゼロ合わせしたボアゲージを揺動させて 0.0° 反転点（最小値）を捉え、6点測定表から楕円度とテーパ（OEM限度 0.050 mm）を判定します。',
      },
    },
    {
      id: 'bore-gauge-presets-bezel',
      badge: {
        en: 'Presets & Zero',
        id: 'Preset & Nol',
        ja: 'ライナ・ゼロ補正',
      },
      title: {
        en: 'Liner Wear Presets & Bezel Zero Offset',
        id: 'Preset Keausan Liner & Nol Bezel',
        ja: '摩耗プロファイル選択とベゼルゼロ補正',
      },
      description: {
        en: 'Choose from 5 liner profiles (Healthy OEM, Ring-Turn Top Taper, Thrust-Axis Ovality, Barrel-Shaped, or Blind Inspection Challenge) and test Bezel Zero calibration offsets (-0.02, 0.00, +0.02 mm).',
        id: 'Pilih dari 5 profil liner (Liner OEM Sehat, Tirus Atas, Ovalitas Sumbu Thrust, Bentuk Tong, atau Tantangan Inspeksi Buta) dan uji kalibrasi Nol Bezel (-0.02, 0.00, +0.02 mm).',
        ja: '5種類のライナプロファイル（正常OEM、上死点テーパ、スラスト楕円、バレル摩耗、ブラインド検査）と、ベゼルゼロ補正（-0.02 / 0.00 / +0.02 mm）を切り替えられます。',
      },
    },
    {
      id: 'bore-gauge-probe-rocking',
      badge: {
        en: 'Probe & Rocking',
        id: 'Probe & Goyang',
        ja: '深さ・軸・揺動',
      },
      title: {
        en: 'Depth Plane, Measurement Axis & Rocking Angle',
        id: 'Bidang Kedalaman, Sumbu Ukur & Sudut Goyang',
        ja: '測定深さ・測定軸・ゲージ揺動操作',
      },
      description: {
        en: 'Select Probe Depth Plane (Top 15 mm, Mid 75 mm, Bottom 135 mm) and Measurement Axis (0° Thrust vs 90° Pin). Use the -8° to +8° rocking slider, 0.0° snap button, or Rock/Stop auto-rocking toggle to find the Null Point.',
        id: 'Pilih Kedalaman Probe (Atas 15 mm, Tengah 75 mm, Bawah 135 mm) dan Sumbu Ukur (0° Thrust vs 90° Pin). Gunakan slider goyang -8° s/d +8°, tombol snap 0.0°, atau tombol Goyang/Berhenti untuk mencari Titik Balik.',
        ja: '測定深さ（上15/中75/下135 mm）と軸方向（0°スラスト/90°ピン）を選び、揺動角スライダー（-8°〜+8°）、0.0°スナップ、自動揺動（Rock/Stop）で反転点を探します。',
      },
      tip: {
        en: 'Recording while tilted off-null introduces a cosine tilt error and triggers an Off-Null Warning Banner!',
        id: 'Mencatat saat gauge masih miring menimbulkan kesalahan kosinus dan memunculkan Peringatan Di Luar Titik Balik!',
        ja: '反転点（0.0°）以外で記録するとコサイン傾き誤差が入り、警告バナーが表示されます！',
      },
    },
    {
      id: 'bore-gauge-mapping',
      badge: {
        en: '6-Point Map',
        id: 'Peta 6-Titik',
        ja: '6点測定表',
      },
      title: {
        en: '6-Point Bore Map & OEM Verdict',
        id: 'Tabel Pemetaan 6-Titik & Keputusan OEM',
        ja: '6点ボア測定表とOEM合否判定',
      },
      description: {
        en: 'Click any cell in the 6-Point Bore Map table to aim the probe, then record the reading (or use Auto-Map All 6 (0° Null) / Clear). Review Max Ovality, Max Taper, and the OEM Re-Bore / Honing Verdict.',
        id: 'Klik sel mana saja pada tabel 6-Titik untuk mengarahkan probe lalu catat pembacaan (atau gunakan Isi 6 Titik / Hapus). Tinjau Ovalitas Maks, Tirus Maks, dan Keputusan Servis OEM.',
        ja: '測定表のセルをクリックして位置を合わせ記録します（全6点自動測定／クリアも可）。最大楕円度、最大テーパ、OEMボーリング要否判定を確認します。',
      },
    },
    {
      id: 'bore-gauge-blind',
      badge: {
        en: 'Blind Challenge',
        id: 'Uji Buta',
        ja: 'ブラインド試験',
      },
      title: {
        en: 'Blind Inspection Challenge',
        id: 'Tantangan Inspeksi Buta',
        ja: 'ブラインド検査チャレンジ',
      },
      description: {
        en: 'In Blind Inspection Challenge mode, measure all 6 points on an unknown liner, choose PASS (≤ 0.050) or RE-BORE (> 0.050), click Verify to check your QC decision, or click New Liner for another mystery cylinder.',
        id: 'Pada mode Tantangan Inspeksi Buta, ukur ke-6 titik liner misteri, pilih LULUS (≤ 0.050) atau RE-BORE (> 0.050), klik Periksa untuk cek keputusan QC, atau Liner Baru untuk soal berikutnya.',
        ja: 'ブラインド検査モードでは未知ライナの6点を実測し、PASS（≤0.050）またはRE-BORE（>0.050）を選択して「判定確認」を押します。「新規ライナ」で別問題に挑戦できます。',
      },
    },
    {
      id: 'bore-gauge-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes using the top tabs or Alt+1..4 shortcuts to test your bore gauge reading and cylinder inspection skills.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis lewat tab atas atau pintasan Alt+1..4 untuk menguji keterampilan pembacaan bore gauge dan inspeksi silinder.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、ボアゲージ読取りとシリンダ検査の理解度を確認できます。',
      },
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
        en: 'Bucket Elevator Discharge & Power Lab',
        id: 'Lab Pembuangan & Daya Bucket Elevator',
        ja: 'バケットエレベータ排出・動力解析ラボ',
      },
      description: {
        en: 'Simulate Centrifugal, Continuous, and Chain bucket elevators to balance Froude Number Fr, pole distance h_p, mass/volumetric capacity, take-up tension, and backstop torque.',
        id: 'Simulasikan bucket elevator Sentrifugal, Kontinu, dan Rantai untuk menyeimbangkan Bilangan Froude Fr, jarak kutub h_p, kapasitas massa/volume, tegangan take-up, dan torsi backstop.',
        ja: '遠心式・連続式・チェーン式のバケットエレベータを解析し、フルード数Fr、極距離h_p、輸送量、張り張力、逆転防止トルクの最適化を学びます。',
      },
      tip: {
        en: 'Toggle Elevator Type (Centrifugal, Continuous, Chain) and Pause/Run or Reset in the top toolbar.',
        id: 'Pilih Tipe Elevator (Sentrifugal, Kontinu, Rantai) serta tombol Jeda/Jalankan dan Reset di bilah atas.',
        ja: '上部の形式切替（遠心式・連続式・チェーン式）と運転/一時停止/リセットボタンを活用できます。',
      },
    },
    {
      id: 'bucket-elevator-faults',
      badge: {
        en: 'Fault Injection',
        id: 'Injeksi Gangguan',
        ja: '異常注入',
      },
      title: {
        en: 'Fault Injection & Cutaway Probe',
        id: 'Injeksi Gangguan & Probe Potongan',
        ja: '異常注入テスト＆断面プローブ操作',
      },
      description: {
        en: 'Inject Normal, Belt Slip, Boot Choke, Missing Bucket, or Misalignment faults from the top bar to see real-time impacts on Fr, motor amps, back-spill loss, and diagnostic alerts. Drag the probe or click hotspots in the cutaway SVG.',
        id: 'Suntikkan gangguan Normal, Slip Sabuk, Boot Tersumbat, Bucket Hilang, atau Sabuk Miring dari bilah atas untuk melihat dampaknya pada Fr, arus motor, dan rugi tumpah balik. Seret probe atau klik titik uji pada gambar SVG.',
        ja: '上部の異常注入ボタン（正常・ベルトスリップ・ブーツ詰まり・バケット欠損・ベルト蛇行）でFr・電流・逆流損失の変化を確認し、断面SVG内のプローブをドラッグして計測します。',
      },
    },
    {
      id: 'bucket-elevator-drive-material',
      badge: {
        en: 'Drive & Material',
        id: 'Penggerak & Material',
        ja: '駆動・搬送物',
      },
      title: {
        en: 'Material Presets & Drive/Pulley Controls',
        id: 'Preset Material & Kontrol Puli Penggerak',
        ja: '搬送物プリセット＆駆動・プーリ設定',
      },
      description: {
        en: 'Pick a Bulk Material Preset (updating bulk density and fill factor) and tune Pulley Dia (250–1000 mm), Head Speed (15–120 RPM), Lift Height (5–45 m), and Take-Up Tension (2.0–25.0 kN).',
        id: 'Pilih Preset Material Curah (mengatur densitas dan faktor isi) lalu atur Diameter Puli (250–1000 mm), Putaran Kepala (15–120 RPM), Tinggi Angkat (5–45 m), dan Tegangan Take-Up (2.0–25.0 kN).',
        ja: '搬送物プリセットを選び、プーリ径（250〜1000 mm）、回転数（15〜120 RPM）、揚程（5〜45 m）、張り張力（2.0〜25.0 kN）を調整します。',
      },
    },
    {
      id: 'bucket-elevator-bucket-loading',
      badge: {
        en: 'Buckets & Load',
        id: 'Bucket & Muatan',
        ja: 'バケット・充填',
      },
      title: {
        en: 'Bucket Geometry & Material Loading',
        id: 'Geometri Bucket & Pengisian Material',
        ja: 'バケット寸法と充填条件',
      },
      description: {
        en: 'Adjust Bucket Width (150–600 mm), Projection (100–260 mm), Bucket Volume (1.5–18.0 L), Pitch Spacing (160–600 mm), Fill Factor (30–95%), and Bulk Density (0.40–2.20 t/m³).',
        id: 'Atur Lebar Bucket (150–600 mm), Proyeksi (100–260 mm), Volume Bucket (1.5–18.0 L), Jarak Pitch (160–600 mm), Faktor Isi (30–95%), dan Densitas Curah (0.40–2.20 t/m³).',
        ja: 'バケット幅、突出量、容量、取付ピッチ、充填率（30〜95%）、かさ密度（0.40〜2.20 t/m³）を調整して輸送能力を最適化します。',
      },
    },
    {
      id: 'bucket-elevator-telemetry',
      badge: {
        en: 'Telemetry',
        id: 'Telemetri',
        ja: '動力・運動学',
      },
      title: {
        en: 'KPI Dashboard & Kinematic Breakdown',
        id: 'Dasbor KPI & Rincian Kinematika',
        ja: 'KPIダッシュボードと動力内訳',
      },
      description: {
        en: 'Inspect Mass Capacity (t/h), Vol. Capacity (m³/h), Motor Power/Amps, Froude No. (Fr), Back-Spill Loss %, Req. Backstop Torque, plus Linear Speed, Pole Dist. h_p, Lift/Friction Power, Shaft Torque, and Total Buckets.',
        id: 'Pantau Kapasitas Massa (t/h), Kapasitas Vol. (m³/h), Daya/Arus Motor, Bilangan Froude (Fr), Rugi Tumpah Balik %, Torsi Backstop, serta Kec. Linier, Jarak Kutub h_p, Daya Angkat/Gesek, Torsi Poros, dan Total Bucket.',
        ja: '質量/体積輸送量、動力・電流、フルード数Fr、逆流損失%、逆転防止トルクに加え、ベルト速度、極距離h_p、揚程/摩擦動力、軸トルク、総バケット数を確認します。',
      },
    },
    {
      id: 'bucket-elevator-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes using the top tabs or Alt+1..4 shortcuts to test your bucket elevator discharge and power sizing skills.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis lewat tab atas atau pintasan Alt+1..4 untuk menguji perhitungan pembuangan dan daya bucket elevator.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、バケットエレベータの排出・動力設計の理解度を確認できます。',
      },
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
        id: 'Lab Metrologi Jangka Sorong & Mikrometer',
        ja: 'ノギス＆マイクロメータ精密測定ラボ',
      },
      description: {
        en: 'Practice reading 0.02 mm and 0.05 mm Vernier Calipers and 0.01 mm Micrometers with a live Magnifier Loupe, zero-error compensation, parallax simulation, and Incoming QC Batch inspection.',
        id: 'Latih pembacaan Jangka Sorong 0.02 mm & 0.05 mm serta Mikrometer 0.01 mm dengan Kaca Pembesar langsung, kompensasi kesalahan nol, simulasi paralaks, dan inspeksi Batch QC.',
        ja: '0.02/0.05 mm ノギスと 0.01 mm マイクロメータの読取りを、拡大ルーペ、ゼロ誤差補正、視差シミュレーション、受入QC検査モードで実践します。',
      },
    },
    {
      id: 'caliper-instrument-loupe',
      badge: {
        en: 'Instrument & Loupe',
        id: 'Alat & Loupe',
        ja: '測定器・ルーペ',
      },
      title: {
        en: 'Instrument Selector, Loupe & View Angle',
        id: 'Pemilih Alat, Kaca Pembesar & Sudut Pandang',
        ja: '測定器切替・ルーペ拡大・視差角',
      },
      description: {
        en: 'Choose Vernier 0.02 mm, Vernier 0.05 mm, or Micrometer 0.01 mm. Toggle Loupe On/Off with 2.5× / 3× / 4× zoom, and test View Angle (-15°, 0°, +15°) to see how off-perpendicular viewing creates parallax error.',
        id: 'Pilih Jangka Sorong 0.02 mm, 0.05 mm, atau Mikrometer 0.01 mm. Aktifkan/matikan Kaca Pembesar (zoom 2.5× / 3× / 4×), dan uji Sudut Pandang (-15°, 0°, +15°) untuk melihat efek kesalahan paralaks.',
        ja: 'ノギス（0.02/0.05 mm）またはマイクロメータ（0.01 mm）を選び、ルーペ倍率（2.5×/3×/4×）や視点角度（-15°/0°/+15°）を切り替えて視差誤差の影響を確認します。',
      },
    },
    {
      id: 'caliper-parts-zero',
      badge: {
        en: 'Parts & Zero Error',
        id: 'Benda Uji & Nol',
        ja: 'ワーク・ゼロ誤差',
      },
      title: {
        en: 'Test Parts, Zero Error & Fine Stepping',
        id: 'Benda Uji, Kesalahan Nol & Langkah Halus',
        ja: '測定ワーク・ゼロ誤差設定・微調整',
      },
      description: {
        en: 'Pick Free Measure or a preset Test Part, optionally enable Zero Error (±0.02 to ±0.05 mm), and adjust the jaw/spindle via the Position Slider, -10 LC / -1 LC / +1 LC / +10 LC / Zero buttons, or Arrow Keys (Shift+←/→ for ±10 LC) when the stage is focused.',
        id: 'Pilih Ukur Bebas atau Benda Uji preset, aktifkan Kesalahan Nol bila perlu, lalu geser rahang lewat Slider Posisi, tombol -10 LC / -1 LC / +1 LC / +10 LC / Zero, atau tombol panah keyboard (Shift+←/→ untuk ±10 LC).',
        ja: '自由測定または測定ワークを選び、必要に応じてゼロ誤差を設定します。スライダー、±1/±10 LCボタン、ゼロボタン、またはステージ選択時の矢印キー（Shift併用で±10 LC）で精密移動できます。',
      },
    },
    {
      id: 'caliper-measure-breakdown',
      badge: {
        en: 'Measure Mode',
        id: 'Mode Ukur',
        ja: '測定モード',
      },
      title: {
        en: 'Scale Reading Breakdown (MSR + VSR / Sleeve + Thimble)',
        id: 'Rincian Pembacaan Skala',
        ja: '目盛読取り内訳（主尺＋副尺／スリーブ＋シンブル）',
      },
      description: {
        en: 'In Measure mode, inspect the Corrected True Reading card and the step-by-step Scale Reading Breakdown showing Main Scale (MSR) + Vernier Scale (VSR × LC) or Sleeve + Thimble (Div × 0.01).',
        id: 'Pada mode Ukur, pelajari kartu Pembacaan Terkoreksi dan Rincian Pembacaan Skala langkah demi langkah (MSR + VSR × LC atau Sleeve + Thimble × 0.01).',
        ja: '測定モードではゼロ誤差補正後の真値と、主尺(MSR)＋副尺(VSR×LC)またはスリーブ＋シンブル(目盛×0.01)のステップ別読取り内訳を確認できます。',
      },
    },
    {
      id: 'caliper-test-qc',
      badge: {
        en: 'Test & QC',
        id: 'Uji & QC',
        ja: 'テスト・QC検査',
      },
      title: {
        en: 'Test Yourself & Incoming QC Inspection Modes',
        id: 'Mode Uji Mandiri & Inspeksi QC Masuk',
        ja: 'セルフテスト＆受入QC検査モード',
      },
      description: {
        en: 'Switch to Test Yourself to hide the digital readout, click New Challenge, read the loupe, and Check Reading. Switch to QC Inspection to measure a 4-part Incoming QC Batch, enter each value, mark PASS or REJECT, and Submit QC Decision.',
        id: 'Beralih ke Uji Mandiri untuk menyembunyikan angka digital dan menguji pembacaan Anda. Beralih ke Inspeksi QC untuk mengukur batch 4 komponen, memasukkan nilai, memilih LULUS atau TOLAK, dan mengirim keputusan QC.',
        ja: '「セルフテスト」では数値表示を隠してルーペから実測値を解答します。「QC検査」では4部品のバッチを順に測定し、測定値と合否（PASS/REJECT）を提出してスコアを確認します。',
      },
    },
    {
      id: 'caliper-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use the top Explore, Practice, and Quiz tabs or Alt+1..4 shortcuts to reinforce least-count reading, zero-error correction, and tolerance inspection.',
        id: 'Gunakan tab Eksplorasi, Latihan, dan Kuis di atas atau pintasan Alt+1..4 untuk memantapkan pembacaan ketelitian, koreksi nol, dan inspeksi toleransi.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、最小読取値・ゼロ誤差補正・公差判定の理解を深められます。',
      },
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
        en: 'Analyze ANSI/RS roller chain drives, measure 10-pitch pin-bushing wear elongation against the 1.5% and 3.0% limits, inspect chordal polygonal vibration, and set catenary slack sag and lubrication.',
        id: 'Analisis penggerak rantai rol ANSI/RS, ukur perpanjangan aus pin-bushing 10-pitch terhadap batas 1.5% dan 3.0%, amati variasi kordal, serta atur kelendutan sisi kendur dan pelumasan.',
        ja: 'ANSI/RSローラチェーン伝動の10リンク摩耗伸び（1.5%/3.0%限界）、多角形運動による速度変動、緩み側たるみ量、潤滑方式を総合的に解析します。',
      },
      tip: {
        en: 'Use the top Pause/Run Drive and Reset buttons, or load a preset (Optimal #60 Drive, Worn Chain 3.25% Hooked, Dry & Over-Tight Span, 12T Polygonal Vibration).',
        id: 'Gunakan tombol Jeda/Jalankan dan Reset di atas, atau pilih preset (Optimal #60, Rantai Aus 3.25%, Kering & Terlalu Kencang, Getaran Poligonal 12T).',
        ja: '上部の運転/一時停止・リセットやプリセット（正常#60、摩耗限界超過3.25%、無給油・張り過ぎ、12歯多角形振動）を活用できます。',
      },
    },
    {
      id: 'chain-conveyor-size-sprockets',
      badge: {
        en: 'Chain & Sprockets',
        id: 'Rantai & Sproket',
        ja: '番手・スプロケット',
      },
      title: {
        en: 'ANSI/RS Chain Size, Sprockets & Speed',
        id: 'Ukuran Rantai ANSI/RS, Sproket & Putaran',
        ja: 'ANSI/RSチェーン番手・歯数・回転数',
      },
      description: {
        en: 'Select an ANSI / RS Roller Chain Size (#40 to #160) and adjust Driver z₁ (11–30T), Driven z₂ (21–72T), Driver RPM (150–1200), and Center Distance C (400–1200 mm). Keep z₁ ≥ 17T to minimize chordal speed variation.',
        id: 'Pilih ukuran Rantai ANSI / RS (#40 s/d #160) lalu atur gigi Penggerak z₁ (11–30T), Digerakkan z₂ (21–72T), RPM Penggerak (150–1200), dan Jarak Pusat C (400–1200 mm). Jaga z₁ ≥ 17T untuk meredam variasi kordal.',
        ja: 'チェーン番手（#40〜#160）を選び、駆動歯数z₁（11〜30歯）、従動歯数z₂（21〜72歯）、回転数、軸間距離Cを設定します。多角形振動を抑えるには z₁ ≥ 17歯が推奨されます。',
      },
    },
    {
      id: 'chain-conveyor-wear-sag',
      badge: {
        en: 'Wear & Sag',
        id: 'Keausan & Sag',
        ja: '摩耗・たるみ',
      },
      title: {
        en: 'Pin-Bushing Wear Elongation & Slack Sag',
        id: 'Perpanjangan Aus Pin-Bushing & Kelendutan Sag',
        ja: 'ピン・ブシュ摩耗伸びと緩み側たるみ率',
      },
      description: {
        en: 'Tune Pin-Bushing Wear Elongation (0–3.8%) to watch rollers climb sprocket teeth and trigger hook wear above 1.5%–3.0%, and adjust Slack Span Catenary Sag (0.4–5.0% of C) around the 2.0% ideal target.',
        id: 'Atur Perpanjangan Aus Pin-Bushing (0–3.8%) untuk melihat rol menaiki gigi sproket di atas 1.5%–3.0%, dan setel Kelendutan Sisi Kendur (0.4–5.0% dari C) di sekitar target ideal 2.0%.',
        ja: '摩耗伸び率（0〜3.8%）でローラ乗り上げとフック摩耗（1.5%〜3.0%限界）を再現し、緩み側たるみ率（0.4〜5.0% C）を理想の2.0%付近に調整します。',
      },
    },
    {
      id: 'chain-conveyor-lube-restore',
      badge: {
        en: 'Lubrication',
        id: 'Pelumasan',
        ja: '潤滑・修復',
      },
      title: {
        en: 'Lubrication Regime & Restore Spec',
        id: 'Metode Pelumasan & Perbaiki ke Standar',
        ja: '潤滑方式選択と推奨状態への修復',
      },
      description: {
        en: 'Switch Lubrication Regime between Dry (None), Manual Drip, and Oil Bath to match the pitch-line speed. Whenever health is not optimal, click Restore Spec in the presets bar to apply recommended z₁, wear, sag, and lubrication.',
        id: 'Pilih Metode Pelumasan antara Kering, Tetes Manual, dan Rendaman Oli sesuai kecepatan rantai. Saat status tidak optimal, klik Perbaiki ke Standar di bilah preset untuk memulihkan spesifikasi.',
        ja: '給油方法（無給油・滴下給油・油浴潤滑）を周速度に応じて選択します。異常時はプリセットバーの「推奨状態に修復」ボタンで最適仕様へ戻せます。',
      },
    },
    {
      id: 'chain-conveyor-readouts',
      badge: {
        en: 'Diagnostics',
        id: 'Diagnostik',
        ja: '診断・計測',
      },
      title: {
        en: '10-Pitch Gauge & Chain Diagnostic Findings',
        id: 'Ukur 10-Pitch & Temuan Diagnosis Rantai',
        ja: '10リンク実測値とチェーン診断結果',
      },
      description: {
        en: 'Inspect the 4 readout cards (10-Pitch Gauge vs Nominal, Chordal Action %, Slack Span Sag S, Pitch-Line Speed & Recommended Lube) and the Chain Drive Diagnostic Findings card.',
        id: 'Pantau 4 kartu pembacaan (Ukur 10-Pitch vs Nominal, Variasi Kordal %, Kelendutan S, Kecepatan Rantai & Rekomendasi Oli) serta kotak Diagnosis Penggerak Rantai.',
        ja: '4つの計測カード（10リンク実測長、多角形速度変動、たるみ量S、チェーン周速度・推奨給油）とチェーン伝動診断結果パネルを確認します。',
      },
    },
    {
      id: 'chain-conveyor-workflow',
      badge: {
        en: 'Lab Modes',
        id: 'Mode Lab',
        ja: '学習モード',
      },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Explore, Practice, and Quiz modes using the top tabs or Alt+1..4 shortcuts to test your roller chain wear inspection and drive sizing skills.',
        id: 'Beralih antara mode Eksplorasi, Latihan, dan Kuis lewat tab atas atau pintasan Alt+1..4 untuk menguji pemahaman inspeksi keausan dan pemilihan rantai rol.',
        ja: '上部タブまたは Alt+1〜4 ショートカットで探索・演習・クイズを切り替え、チェーンの摩耗検査や伝動設計の理解度を確認できます。',
      },
    },
  ],
};
