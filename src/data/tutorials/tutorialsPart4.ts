import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_4: Record<string, TutorialStep[]> = {
  'rigging-lifting': [
    {
      id: 'rigging-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'ASME B30.9 Rigging & Hoisting Safety',
        id: 'Keselamatan Rigging & Pengangkatan ASME B30.9',
        ja: 'ASME B30.9 玉掛け・揚重安全シミュレータ',
      },
      description: {
        en: 'This lab models two-leg sling geometry, hitch efficiency, Center-of-Gravity (CoG) alignment, and load tilt on lift-off. Watch the top safety banner: it stays green when safe and raises Caution or Danger alarms for low angles, WLL overloads, or off-plumb hook misalignment.',
        id: 'Lab ini memodelkan geometri sling dua kaki, efisiensi ikatan, kelurusan Titik Berat (CoG), dan kemiringan beban saat terangkat. Pantau banner keselamatan di atas: hijau saat aman, dan memicu alarm Waspada atau Bahaya saat sudut rendah, overload WLL, atau hook tidak segaris CoG.',
        ja: '2本吊りスリングの幾何学、ヒッチ効率、重心（CoG）芯出し、地切り時の傾きを解析します。上部の安全バナーは安全時に緑となり、低角度・WLL超過・フック芯ずれを検知すると注意・危険警報を表示します。',
      },
      tip: {
        en: 'Keep horizontal sling angles at 60° or steeper whenever headroom allows to minimize leg tension and horizontal pinch.',
        id: 'Pertahankan sudut sling horizontal ≥ 60° bila ruang vertikal mencukupi untuk meminimalkan tegangan kaki dan gaya jepit.',
        ja: '揚程に余裕がある限り、対水平スリング角度を 60° 以上に保ち、脚張力と水平圧縮力を抑えましょう。',
      },
    },
    {
      id: 'rigging-presets-mass',
      badge: { en: 'Step 2 • Presets & Mass', id: 'Langkah 2 • Preset & Massa', ja: 'ステップ2・プリセットと質量' },
      title: {
        en: 'Equipment Hoisting Presets & Payload Mass',
        id: 'Preset Peralatan Angkat & Massa Beban',
        ja: '機器揚重プリセットと吊り荷質量',
      },
      description: {
        en: 'Start by picking one of the four Equipment Hoisting Presets (showing mass in tonnes, default θ, and CoG offset) to load realistic industrial lifts. You can also fine-tune Payload Mass (W) from 0.5 t to 8.0 t using the bottom-left slider, which updates weight in kN and switches the preset to custom.',
        id: 'Mulai dengan memilih salah satu dari empat Preset Peralatan Angkat (menampilkan massa ton, sudut θ, dan offset CoG) untuk memuat skenario industri nyata. Anda juga dapat mengatur Massa Beban (W) dari 0,5 t hingga 8,0 t lewat slider kiri bawah.',
        ja: 'まず4つの機器揚重プリセット（質量 t・初期角度 θ・CoG偏心を表示）から実機シナリオを選択します。左下の「吊り荷質量 (W)」スライダー（0.5〜8.0 t）で質量を微調整することも可能です。',
      },
    },
    {
      id: 'rigging-angle-spreader',
      badge: { en: 'Step 3 • Sling Angle', id: 'Langkah 3 • Sudut Sling', ja: 'ステップ3・スリング角度' },
      title: {
        en: 'Horizontal Sling Angle θ & Spreader Beam',
        id: 'Sudut Sling Horizontal θ & Spreader Beam',
        ja: '対水平スリング角度 θ と天秤ビーム',
      },
      description: {
        en: 'Adjust Horizontal Sling Angle θ (25°–75°) with the slider or quick-jump buttons (25°, 30°, 45°, 60°, 75°). Notice how θ ≤ 30° doubles leg tension (2.000×) and triggers an ASME B30.9 Danger alarm. Click "+ Spreader Beam" to simulate a spreader bar that keeps sling legs vertical (90°) and eliminates horizontal pinch.',
        id: 'Atur Sudut Sling Horizontal θ (25°–75°) lewat slider atau tombol cepat (25°, 30°, 45°, 60°, 75°). Perhatikan sudut ≤ 30° menggandakan tegangan (2,000×) dan memicu alarm Bahaya. Klik "+ Spreader Beam" untuk menjaga kaki sling vertikal (90°) tanpa gaya jepit horizontal.',
        ja: 'スライダーまたはクイックボタン（25°/30°/45°/60°/75°）で角度 θ を変更します。θ ≤ 30° では張力が2倍以上となり禁止警報が出ます。「天秤ビーム比較」を押すと吊り脚が垂直（90°）になり水平圧縮力がゼロになります。',
      },
    },
    {
      id: 'rigging-hitch-wll',
      badge: { en: 'Step 4 • Hitch & WLL', id: 'Langkah 4 • Ikatan & WLL', ja: 'ステップ4・ヒッチとWLL' },
      title: {
        en: 'Hitch Configuration (η) & Sling Rated WLL',
        id: 'Konfigurasi Ikatan (η) & Kapasitas WLL Sling',
        ja: '玉掛けヒッチ方式（η）と基本使用荷重（WLL）',
      },
      description: {
        en: 'Select the Hitch Configuration (each shows its efficiency multiplier η) and choose one of the four color-coded Sling Rated Vertical WLL buttons. The Effective WLL readout multiplies rated WLL by η—for example, a choker hitch reduces capacity while a double basket increases it.',
        id: 'Pilih Konfigurasi Ikatan Sling (masing-masing menampilkan pengali efisiensi η) dan pilih satu dari empat tombol WLL Vertikal Sling berkode warna. Pembacaan WLL Efektif mengalikan WLL nominal dengan η.',
        ja: '玉掛けヒッチ方式（効率係数 η を表示）と4段階の色分けされたスリング基本使用荷重（WLL）ボタンを選択します。実効 WLL は定格 WLL × η として即座に計算されます。',
      },
    },
    {
      id: 'rigging-cog-telemetry',
      badge: { en: 'Step 5 • CoG & Telemetry', id: 'Langkah 5 • CoG & Telemetri', ja: 'ステップ5・重心とテレメトリ' },
      title: {
        en: 'CoG Offset, Hook Alignment & ASME Telemetry',
        id: 'Offset CoG, Kelurusan Hook & Telemetri ASME',
        ja: '重心オフセット・芯出しとASMEテレメトリ',
      },
      description: {
        en: 'Use the Center-of-Gravity (CoG) Offset (-30% to +30%) and Crane Hook Horizontal Position (-30% to +30%) sliders to see unequal leg sharing (d₁, d₂) and load tilt on the 2D canvas. Click "Align Hook Over CoG" to plumb the hook for a 0° level lift, and inspect WLL Utilization %, Angle Factor & Pinch, Shackle Recommendation, and the 1 / sin θ table.',
        id: 'Gunakan slider Offset CoG (-30% s.d. +30%) dan Posisi Hook Crane (-30% s.d. +30%) untuk melihat pembagian beban kaki (d₁, d₂) dan kemiringan beban. Klik "Luruskan Hook ke CoG" untuk pengangkatan rata 0°, lalu periksa Utilisasi WLL %, Gaya Jepit, Rekomendasi Shackle, dan tabel 1 / sin θ.',
        ja: '重心オフセットとフック水平位置（-30%〜+30%）を動かし、2D図で脚荷重の不均衡（d₁, d₂）と傾斜を確認します。「フックを重心真上へ芯出し」で水平揚重（0°）にでき、WLL稼働率、角度倍率、推奨シャックル、1/sin θ表も確認できます。',
      },
    },
    {
      id: 'rigging-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch tabs with Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz). Practice solving rigging load-factor and CoG problems in Practice mode, then verify mastery in the Quiz tab.',
        id: 'Berpindah tab dengan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis). Kerjakan soal faktor beban dan CoG di mode Latihan, lalu uji pemahaman Anda di tab Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替えられます。演習モードで角度係数や重心問題を解き、クイズタブで理解度を確認しましょう。',
      },
    },
  ],

  'screw-conveyor': [
    {
      id: 'screw-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'CEMA 350 Screw Conveyor & Playback',
        id: 'Konveyor Ulir CEMA 350 & Kontrol Putar',
        ja: 'CEMA 350 スクリューコンベヤ概要と再生制御',
      },
      description: {
        en: 'This simulator models bulk solids transport inside a helical auger trough using CEMA 350 engineering equations. Use the top-right Pause/Run and Reset buttons to freeze the rotating flight animation or restore default grain conveyor settings.',
        id: 'Simulator ini memodelkan transportasi material curah dalam palung ulir heliks menggunakan persamaan rekayasa CEMA 350. Gunakan tombol Jeda/Jalankan dan Reset di kanan atas untuk menghentikan animasi atau mengembalikan pengaturan awal.',
        ja: 'CEMA 350工学式に基づき、スクリューオーガーによる粉粒体搬送を解析します。右上の一時停止/運転ボタンとリセットボタンで回転アニメーションの制御や初期設定への復元ができます。',
      },
    },
    {
      id: 'screw-faults',
      badge: { en: 'Step 2 • Fault Modes', id: 'Langkah 2 • Mode Gangguan', ja: 'ステップ2・故障モード' },
      title: {
        en: 'Fault Injection & CEMA 350 Diagnostics',
        id: 'Injeksi Gangguan & Diagnostik CEMA 350',
        ja: '故障モード注入とCEMA 350工学診断',
      },
      description: {
        en: 'Test four operating states in the top Fault Mode bar: Normal Run, Hanger Bearing Overheat (spikes Fb and bearing temperature >115°C), Flight Abrasion / Carryback (+14 mm radial clearance loss), and Overfill / Torque Jam (95% fill bridging with 2.65× torque surge). Click "Clear Fault" to return to Normal Run.',
        id: 'Uji empat kondisi di bilah Mode Gangguan: Operasi Normal, Bantalan Gantung Panas (>115°C), Keausan Daun / Arus Balik (celah +14 mm), dan Penuh Berlebih / Macet (lonjakan torsi 2,65×). Klik "Pulihkan" untuk kembali ke normal.',
        ja: '上部の故障モードバーで「正常運転」「ハンガー軸受過熱（115℃超）」「羽根摩耗・逆流（隙間+14mm）」「過充填・トルク急増（2.65倍）」を再現できます。「故障解除」で正常運転へ戻せます。',
      },
    },
    {
      id: 'screw-material',
      badge: { en: 'Step 3 • Bulk Material', id: 'Langkah 3 • Material Curah', ja: 'ステップ3・搬送物設定' },
      title: {
        en: 'Bulk Material Presets & CEMA Factors',
        id: 'Preset Material Curah & Faktor CEMA',
        ja: '搬送物プリセットとCEMA係数',
      },
      description: {
        en: 'Select a Bulk Material pill (Grain, Cement, Limestone, Woodchips, or Sand) above the cutaway SVG to auto-load its density, material factor Fm, and recommended fill. In Group 3 on the right, fine-tune Bulk Density ρ (300–2000 kg/m³), Material Factor Fm (0.4–2.5), and Bearing Factor Fb (1.0–4.4).',
        id: 'Pilih material (Biji-bijian, Semen, Batu Kapur, Serpihan Kayu, atau Pasir) di atas SVG untuk memuat densitas, faktor Fm, dan pengisian yang disarankan. Di Grup 3 sebelah kanan, atur Densitas ρ, Faktor Fm, dan Faktor Bantalan Fb.',
        ja: '図の上部の搬送物ボタン（穀物・セメント・石灰石・木質チップ・砂）で物性と推奨充填率を一括設定できます。右側のグループ3でかさ密度 ρ、材料係数 Fm、軸受係数 Fb を微調整できます。',
      },
    },
    {
      id: 'screw-geometry',
      badge: { en: 'Step 4 • Auger Geometry', id: 'Langkah 4 • Geometri Auger', ja: 'ステップ4・オーガー幾何諸元' },
      title: {
        en: 'Screw Diameter, Pitch Mode & Clearances',
        id: 'Diameter Ulir, Mode Pitch & Celah Radial',
        ja: 'スクリュー外径・ピッチモード・隙間設定',
      },
      description: {
        en: 'In Group 1 (Auger Geometry), adjust Screw Diameter D (150–600 mm) and Center Pipe dₚ. Choose a Pitch Mode button—Std (1.0D), Half (0.67D), or Short (0.5D)—or drag the Pitch P slider directly, and set Conveyor Length L (2–25 m) and Radial Clearance (6–25 mm).',
        id: 'Di Grup 1 (Geometri Auger), atur Diameter Ulir D (150–600 mm) dan Pipa Pusat dₚ. Pilih Mode Pitch—Std (1.0D), 2/3 (0.67D), atau Pendek (0.5D)—atau geser slider Pitch P, lalu atur Panjang L (2–25 m) dan Celah Radial (6–25 mm).',
        ja: 'グループ1でスクリュー外径 D（150〜600 mm）と中心軸パイプ径 dₚ を設定します。ピッチモード（標準 1.0D・半減 0.67D・短 0.5D）またはピッチ P スライダー、全長 L、隙間（6〜25 mm）を調整できます。',
      },
    },
    {
      id: 'screw-operating-kpis',
      badge: { en: 'Step 5 • Fill & Telemetry', id: 'Langkah 5 • Pengisian & Telemetri', ja: 'ステップ5・充填率とテレメトリ' },
      title: {
        en: 'Trough Fill %, Speed, Incline & 6 Live KPIs',
        id: 'Pengisian Palung %, Putaran, Sudut & 6 KPI',
        ja: 'トラフ充填率・回転数・傾斜と6大KPI',
      },
      description: {
        en: 'In Group 2, click Trough Loading Fill % (15%, 30%, 45%, or 95%), adjust Speed (10–120 RPM), and tilt Incline θ (0°–45°). Monitor all 6 telemetry cards below the SVG: Mass/Vol Flow, Torque/Axial Speed, Drive Power/Current, Axial Thrust/Deflection, Hanger Bearings temp, and Shear/Jam Risk.',
        id: 'Di Grup 2, pilih Pengisian Palung (15%, 30%, 45%, atau 95%), atur Putaran (10–120 RPM), dan Sudut Kemiringan θ (0°–45°). Pantau 6 kartu telemetri: Aliran Massa/Vol, Torsi/Laju Aksial, Daya/Arus, Gaya Aksial/Lendutan, Suhu Bantalan, dan Risiko Macet.',
        ja: 'グループ2でトラフ充填率（15/30/45/95%）、回転数（10〜120 RPM）、傾斜 θ（0°〜45°）を変更します。図の下の6つのKPIカード（流量・トルク・動力・スラスト/たわみ・軸受温度・閉塞リスク）で影響を観察しましょう。',
      },
    },
    {
      id: 'screw-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz) to navigate. Try sizing an inclined feeder in Practice mode and test your CEMA 350 knowledge in Quiz.',
        id: 'Gunakan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis) untuk berpindah tab. Uji perhitungan kapasitas dan torsi di mode Latihan serta Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、演習問題やクイズでCEMA 350の理解を深めましょう。',
      },
    },
  ],

  'thermal-expansion': [
    {
      id: 'thermal-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'Three Thermal Mechanics Modes & Presets',
        id: 'Tiga Mode Mekanika Termal & Preset',
        ja: '3つの熱力学モードとプリセット',
      },
      description: {
        en: 'Switch between three engineering modules at the top: 1. Bar & Restrained Stress, 2. Shrink Fit Hub-on-Shaft, and 3. Bimetallic Thermostat. Use the Preset dropdown to load classic industrial scenarios, Reset to restore mode defaults, or CSV to export your calculated dataset.',
        id: 'Pilih tiga modul di bagian atas: 1. Batang & Tegangan Terkekang, 2. Suaian Susut Poros-Hub, dan 3. Termostat Bimetal. Gunakan menu Preset untuk memuat skenario standar, Reset untuk mengembalikan default, atau CSV untuk mengunduh data.',
        ja: '上部のタブで「1. 棒膨張・熱応力拘束」「2. 軸・ハブ焼きばめ」「3. バイメタル素子」を切り替えます。プリセット選択、リセット、CSV出力ボタンも上部に配置されています。',
      },
    },
    {
      id: 'thermal-mode1',
      badge: { en: 'Step 2 • Bar & Stress', id: 'Langkah 2 • Batang & Tegangan', ja: 'ステップ2・棒の熱応力' },
      title: {
        en: 'Mode 1: Free Expansion vs. Restrained Stress',
        id: 'Mode 1: Ekspansi Bebas vs. Tegangan Terkekang',
        ja: 'モード1：自由熱膨張と拘束熱応力',
      },
      description: {
        en: 'Select a Bar Material, set Current Temperature T (-50 to 500 °C), Initial Length L₀ (200–3000 mm), and Diameter d (10–100 mm). Toggle "Rigid Abutment Constraint" and adjust Expansion Gap δ_gap (0.0–4.0 mm) to watch Free Expansion, Actual Stroke, Thermal Stress, and Wall Axial Thrust.',
        id: 'Pilih Material Batang, atur Temperatur T (-50 s.d. 500 °C), Panjang L₀, dan Diameter d. Aktifkan "Kekangan Dinding Kaku" dan atur Celah Ekspansi δ_gap (0,0–4,0 mm) untuk mengamati Ekspansi Bebas, Langkah Aktual, Tegangan Termal, dan Gaya Dorong Aksial.',
        ja: '棒の材質、設定温度 T（-50〜500℃）、初期長さ L₀、直径 d を調整します。「剛体壁による拘束」をオンにし、膨張隙間 δ_gap を変えて自由膨張量・圧縮熱応力・軸推力の変化を確認しましょう。',
      },
    },
    {
      id: 'thermal-mode2',
      badge: { en: 'Step 3 • Shrink Fit', id: 'Langkah 3 • Suaian Susut', ja: 'ステップ3・焼きばめ' },
      title: {
        en: 'Mode 2: Shrink Fit Assembly & Lamé Stress',
        id: 'Mode 2: Perakitan Suaian Susut & Tegangan Lamé',
        ja: 'モード2：焼きばめ組立とラメ厚肉円筒理論',
      },
      description: {
        en: 'Pick Shaft and Hub materials, adjust Hub Heating ΔT (0–350 °C) against the required minimum ΔT readout, and set Shaft OD d, Hub Outer OD D₀, Diametral Interference δ, Length L, and Friction μ. Check Hot Clearance (SLIP-ON READY vs TIGHT), Contact Pressure, Torque Capacity, and Hub Von Mises / SF.',
        id: 'Pilih material Poros dan Hub, atur Pemanasan Hub ΔT (0–350 °C), Diameter Poros d, Diameter Luar Hub D₀, Interferensi δ, Panjang L, dan Gesekan μ. Pantau Celah Saat Panas, Tekanan Kontak, Kapasitas Torsi, dan Von Mises Hub / SF.',
        ja: '軸・ハブ材料を選び、ハブ加熱温度差 ΔT、軸外径 d、ハブ外径 D₀、しまりばめ量 δ、嵌合長 L、摩擦係数 μ を設定します。加熱時隙間、接触面圧、伝達トルク容量、ハブ応力と安全率が即座に算出されます。',
      },
    },
    {
      id: 'thermal-mode3',
      badge: { en: 'Step 4 • Bimetallic', id: 'Langkah 4 • Bimetal', ja: 'ステップ4・バイメタル' },
      title: {
        en: 'Mode 3: Timoshenko Bimetallic Thermostat',
        id: 'Mode 3: Termostat Bimetal Timoshenko',
        ja: 'モード3：ティモシェンコ・バイメタル素子',
      },
      description: {
        en: 'Pair Layer 1 (High α₁) and Layer 2 (Low α₂) alloys, vary Temperature T (-40 to 250 °C), Strip Length L₀, thicknesses t₁ and t₂, and Contact Trip Gap (0.5–6.0 mm). Observe Tip Deflection, Curvature κ, Switch Status (OPEN vs CLOSED TRIP), and calculated Trip Temp T_trip.',
        id: 'Pasangkan Lapisan 1 (α₁ tinggi) dan Lapisan 2 (α₂ rendah), ubah Suhu T (-40 s.d. 250 °C), Panjang Strip L₀, ketebalan t₁ & t₂, serta Celah Pemicu Sakelar. Amati Defleksi Ujung, Kelengkungan κ, Status Sakelar, dan Suhu Pemicu T_trip.',
        ja: '高熱膨張材（層1）と低熱膨張材（層2）を選び、温度 T、帯長 L₀、各層厚さ t₁・t₂、接点トリップ隙間を調整します。先端たわみ量、曲率 κ、スイッチ開閉状態、トリップ設定温度を確認できます。',
      },
    },
    {
      id: 'thermal-svg-csv',
      badge: { en: 'Step 5 • CAD & Export', id: 'Langkah 5 • CAD & Ekspor', ja: 'ステップ5・CAD図と出力' },
      title: {
        en: '2D CAD Visualization & CSV Export',
        id: 'Visualisasi CAD 2D & Ekspor CSV',
        ja: '2D CAD可視化とCSVエクスポート',
      },
      description: {
        en: 'The interactive 2D CAD SVG updates deformation, contact gaps, thermal color gradients, and switch contacts in real time as you drag sliders. Click the top-right CSV button anytime to download the active mode’s inputs and results for lab reports.',
        id: 'SVG CAD 2D memperbarui deformasi, celah kontak, gradien warna termal, dan kontak sakelar secara langsung saat slider digeser. Klik tombol CSV di kanan atas kapan saja untuk mengunduh data hasil uji.',
        ja: '2D CAD図には変形、隙間当接、温度カラー勾配、接点動作がリアルタイムに反映されます。右上のCSVボタンから現在の計算条件と結果をレポート用にダウンロードできます。',
      },
    },
    {
      id: 'thermal-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Navigate across tabs using Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz) to connect thermal strain equations with shrink-fit and thermostat design.',
        id: 'Gunakan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis) untuk menghubungkan teori regangan termal dengan perhitungan suaian susut dan termostat.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、熱応力・焼きばめ・バイメタルの計算力を定着させましょう。',
      },
    },
  ],

  'utm-testing': [
    {
      id: 'utm-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'Universal Testing Machine & Test Mode',
        id: 'Mesin Uji Universal (UTM) & Mode Uji',
        ja: '万能試験機（UTM）と試験モード',
      },
      description: {
        en: 'Simulate ASTM E8 tensile and ASTM E9 compression testing on a 2D load frame. Use the top-left toggle to switch between Tensile (ASTM E8) and Compression (ASTM E9); switching modes automatically resets the specimen to zero displacement.',
        id: 'Simulasikan uji tarik ASTM E8 dan uji tekan ASTM E9 pada rangka beban 2D. Gunakan tombol di kiri atas untuk beralih antara Tarik (ASTM E8) dan Tekan (ASTM E9); pergantian mode otomatis me-reset posisi spesimen.',
        ja: 'ASTM E8引張試験およびASTM E9圧縮試験を2D負荷フレームで再現します。左上のトグルで「引張 (ASTM E8)」と「圧縮 (ASTM E9)」を切り替えられます（切替時に試験片は自動リセットされます）。',
      },
    },
    {
      id: 'utm-material',
      badge: { en: 'Step 2 • Material', id: 'Langkah 2 • Material', ja: 'ステップ2・材料選択' },
      title: {
        en: 'Preset Materials & Custom Material Mode',
        id: 'Material Preset & Mode Material Kustom',
        ja: 'プリセット材料とカスタム材料モード',
      },
      description: {
        en: 'Choose from standard metals and polymers in the Specimen Material dropdown, or select "★ Custom Material Mode..." to reveal an accordion where you can enter custom Young’s E (GPa), Yield σy (MPa), UTS (MPa), and Elongation %EL (%).',
        id: 'Pilih logam atau polimer standar pada menu Material Spesimen, atau pilih "★ Mode Material Kustom..." untuk membuka panel input Modulus Young E (GPa), Luluh σy (MPa), UTS (MPa), dan Perpanjangan %EL (%).',
        ja: '試験片材料ドロップダウンから標準材料を選ぶか、「★ カスタム材料モード...」を選択してヤング率 E、降伏応力 σy、引張強さ UTS、破断伸び %EL を自由に入力できます。',
      },
    },
    {
      id: 'utm-dimensions',
      badge: { en: 'Step 3 • Dimensions', id: 'Langkah 3 • Dimensi', ja: 'ステップ3・試験片寸法' },
      title: {
        en: 'Specimen Diameter Ø & Gauge Length L₀',
        id: 'Diameter Spesimen Ø & Panjang Ukur L₀',
        ja: '試験片直径 Ø と標点間距離 L₀',
      },
      description: {
        en: 'Adjust Diameter Ø (6.0–20.0 mm) and Gauge Length L₀ (25–100 mm) in the middle panel. The badge immediately displays cross-sectional area A₀ (mm²), showing how thicker specimens require higher load F for the same engineering stress σ.',
        id: 'Atur Diameter Ø (6,0–20,0 mm) dan Panjang Ukur L₀ (25–100 mm) di panel tengah. Lencana di atasnya langsung menampilkan luas penampang A₀ (mm²) yang memengaruhi gaya F untuk tegangan σ yang sama.',
        ja: '中央パネルで直径 Ø（6.0〜20.0 mm）と標点間距離 L₀（25〜100 mm）を設定します。上部のバッジに断面積 A₀（mm²）が即座に表示され、同じ応力でも荷重 F がどう変わるか確認できます。',
      },
    },
    {
      id: 'utm-controls',
      badge: { en: 'Step 4 • Run & E-Stop', id: 'Langkah 4 • Kontrol & E-Stop', ja: 'ステップ4・運転と非常停止' },
      title: {
        en: 'Crosshead Speed, Run Controls & E-Stop',
        id: 'Kecepatan Crosshead, Kontrol Uji & E-Stop',
        ja: 'クロスヘッド速度・試験制御・非常停止',
      },
      description: {
        en: 'Set Crosshead Speed (1–50 mm/min) and click Start Test (or Pause / Restart). Use the red Emergency Stop button to latch the safety interlock (clear it with "Release E-Stop"), Mount clean specimen (wrench), Reset to zero, Export CSV, or cycle "2x/4x/8x Sim Speed" above the load frame.',
        id: 'Atur Kecepatan Crosshead (1–50 mm/min) lalu klik Mulai Uji (atau Jeda / Ulangi). Gunakan tombol merah E-Stop untuk mengunci interlock (lepas dengan "Lepas E-Stop"), tombol Pasang spesimen baru, Reset, Unduh CSV, serta pengali "Sim Speed" (2x/4x/8x).',
        ja: 'クロスヘッド速度（1〜50 mm/min）を設定し「試験開始」を押します。赤い非常停止ボタンでインターロックが作動し（「非常停止解除」で復帰）、新品装填、リセット、CSV出力、フレーム上の「2x/4x/8x Sim Speed」切替も利用できます。',
      },
    },
    {
      id: 'utm-console',
      badge: { en: 'Step 5 • Load Frame', id: 'Langkah 5 • Rangka Beban', ja: 'ステップ5・負荷フレーム' },
      title: {
        en: 'Interactive On-Machine Console & Safety Door',
        id: 'Konsol Mesin Interaktif & Pintu Pengaman',
        ja: '機側操作コンソールと安全扉',
      },
      description: {
        en: 'You can also operate the UTM directly on the 2D machine SVG: click the on-machine Start/Pause, E-Stop, and Reset controls, or toggle the transparent safety door closed/open while watching specimen necking, barreling, and fracture.',
        id: 'Anda juga dapat mengoperasikan UTM langsung pada SVG mesin 2D: klik tombol Start/Pause, E-Stop, dan Reset di konsol mesin, atau buka/tutup pintu pengaman sambil mengamati necking dan patah spesimen.',
        ja: '2D試験機SVG上のコンソールからも直接「開始/一時停止」「非常停止」「リセット」や「安全扉の開閉」を操作でき、試験片のネッキングや破断を観察できます。',
      },
    },
    {
      id: 'utm-charts-matrix',
      badge: { en: 'Step 6 • Charts & Matrix', id: 'Langkah 6 • Grafik & Matriks', ja: 'ステップ6・グラフと材料定数' },
      title: {
        en: 'Live Telemetry, Curve Tabs & ASTM Properties',
        id: 'Telemetri Langsung, Tab Grafik & Sifat ASTM',
        ja: 'リアルタイム計測・グラフ切替・ASTM材料定数',
      },
      description: {
        en: 'Track live Load F (kN), Displacement ΔL (mm), Eng. Stress σ (MPa), and Strain ε (%). Switch the live chart between Stress–Strain and Force–Elongation, and inspect the 8 Extracted Material Properties below (Modulus E, Yield Rp0.2, UTS/UCS, Peak Force, %EL, %RA, Resilience Ur, and Toughness UT).',
        id: 'Pantau Gaya F (kN), Perpanjangan ΔL (mm), Tegangan σ (MPa), dan Regangan ε (%). Ganti tab grafik antara Stress–Strain dan Force–Elongation, lalu periksa 8 Sifat Mekanis Teruji di bawahnya (E, Rp0.2, UTS/UCS, Fmax, %EL, %RA, Ur, dan UT).',
        ja: '荷重 F・変位 ΔL・公称応力 σ・ひずみ ε の4カードを確認できます。グラフは「Stress–Strain」と「Force–Elongation」を切り替えられ、下部のマトリックスにE、0.2%耐力、UTS/UCS、Fmax、%EL、%RA、Ur、UTの8指標が表示されます。',
      },
    },
    {
      id: 'utm-workflow',
      badge: { en: 'Step 7 • Workflow', id: 'Langkah 7 • Alur Belajar', ja: 'ステップ7・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Press Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), or Alt+4 (Quiz) to switch views. Export CSV curves for analysis, solve stress-strain exercises in Practice, and take the Quiz.',
        id: 'Tekan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), atau Alt+4 (Kuis) untuk berpindah tampilan. Ekspor data CSV, kerjakan latihan kurva tegangan-regangan, lalu selesaikan Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを移動し、CSVデータ分析や演習・クイズで材料試験の理解を仕上げましょう。',
      },
    },
  ],

  'valve-packing': [
    {
      id: 'valve-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'Valve Stuffing Box & Maintenance Status',
        id: 'Stuffing Box Katup & Status Pemeliharaan',
        ja: 'バルブグランドパッキンと保全ステータス',
      },
      description: {
        en: 'This cutaway simulator models the trade-off between fugitive emissions sealing and stem friction in industrial valves. The Maintenance Status banner turns green for Optimal Seal, amber for Fugitive Leak or passing seat, and rose for Stem Binding Risk.',
        id: 'Simulator potongan melintang ini memodelkan keseimbangan antara penyegelan emisi buronan dan gesekan batang katup industri. Banner Status Pemeliharaan berwarna hijau saat Optimal, kuning saat Bocor, dan merah saat Batang Macet.',
        ja: '工業用バルブのグランドパッキンにおける漏洩防止とステム摩擦のトレードオフを断面図で再現します。保全ステータスバナーは最適シール（緑）、漏洩/シート漏れ（黄）、ステム固着リスク（赤）を表示します。',
      },
    },
    {
      id: 'valve-presets',
      badge: { en: 'Step 2 • Scenarios', id: 'Langkah 2 • Skenario', ja: 'ステップ2・シナリオ' },
      title: {
        en: 'Quick Scenario Presets & Reset',
        id: 'Preset Skenario Cepat & Reset',
        ja: 'シナリオプリセットとリセット',
      },
      description: {
        en: 'Use the top Scenarios bar to jump between Optimal Seal, Fugitive Leak, Stem Binding, Passing Seat / Trap, and Worn Packing, or click Reset to return to the baseline optimal control valve.',
        id: 'Gunakan bilah Skenario di atas untuk berpindah antara Segel Optimal, Kebocoran Buronan, Batang Macet, Dudukan / Trap Bocor, dan Packing Aus, atau klik Reset untuk kembali ke kondisi awal.',
        ja: '上部のシナリオボタンで「最適シール」「グランド漏洩」「ステム固着」「シート・トラップ漏れ」「パッキン摩耗」をワンクリックで再現でき、リセットで初期状態に戻せます。',
      },
    },
    {
      id: 'valve-type-fluid',
      badge: { en: 'Step 3 • Valve & Fluid', id: 'Langkah 3 • Katup & Fluida', ja: 'ステップ3・弁形式と流体' },
      title: {
        en: 'Valve Type & Fluid Service Selection',
        id: 'Pemilihan Jenis Katup & Layanan Fluida',
        ja: 'バルブ形式と対象流体の選択',
      },
      description: {
        en: 'On the right panel, select the Valve Type (Globe Control, Gate, Ball, or Butterfly, each with its Cv,max) and pick the Fluid Service (Steam 10 bar, Process Water, or Thermal Oil) to see how fluid properties affect flow and leakage.',
        id: 'Di panel kanan, pilih Jenis Katup (Globe, Gate, Ball, atau Butterfly dengan nilai Cv,max masing-masing) dan pilih Layanan Fluida (Uap 10 bar, Air Proses, atau Minyak Termal).',
        ja: '右パネルでバルブ形式（グローブ・ゲート・ボール・バタフライ各Cv,max付）と対象流体（蒸気 10 bar・プロセス水・熱媒油）を選択し、流量や漏洩挙動の違いを確認します。',
      },
    },
    {
      id: 'valve-sliders',
      badge: { en: 'Step 4 • Gland & Wear', id: 'Langkah 4 • Torsi & Keausan', ja: 'ステップ4・締付と摩耗' },
      title: {
        en: 'Opening, Line Pressure, Gland Torque & Wear',
        id: 'Bukaan, Tekanan, Torsi Gland & Keausan',
        ja: '開度・ライン圧力・締付トルク・摩耗サイクル',
      },
      description: {
        en: 'Adjust Valve Opening (0–100%), Line Pressure (1–25 bar), Gland Follower Nut Torque (5–80 N·m), and Packing Ring Wear / Cycles (0–100k cycles). Increasing gland torque stops fugitive leaks but raises stem friction and binding risk.',
        id: 'Atur Bukaan Katup (0–100%), Tekanan Jalur (1–25 bar), Torsi Mur Gland (5–80 N·m), dan Siklus Keausan Packing (0–100k siklus). Torsi lebih tinggi menekan kebocoran namun meningkatkan gesekan batang.',
        ja: 'バルブ開度（0〜100%）、ライン圧力（1〜25 bar）、グランドナット締付トルク（5〜80 N·m）、パッキン摩耗（0〜100k回）を調整します。締付を強めると漏洩は減りますがステム摩擦が増大します。',
      },
    },
    {
      id: 'valve-faults-readouts',
      badge: { en: 'Step 5 • Faults & Readouts', id: 'Langkah 5 • Gangguan & Pembacaan', ja: 'ステップ5・故障と計測値' },
      title: {
        en: 'Fault Injection, Readout Cards & Diagnostics',
        id: 'Injeksi Gangguan, Kartu Telemetri & Diagnostik',
        ja: '故障注入・ライブ計測カード・診断パネル',
      },
      description: {
        en: 'Use the Steam Trap / Seat Fault Injection dropdown to test Healthy operation, Under-Tightened Packing Leak, Over-Tightened Stem Binding/Scoring, or Passing Seat / Blowing Steam Trap. Monitor the 4 readout cards (Flow Rate Q, Stem Friction, Packing Leak & EPA M21 ppm, Seat Leakage & Trap state) plus the Diagnostics Panel below.',
        id: 'Gunakan menu Injeksi Gangguan Steam Trap / Dudukan untuk menguji kondisi Sehat, Packing Kurang Kencang, Batang Macet, atau Dudukan / Trap Bocor. Pantau 4 kartu pembacaan (Laju Aliran Q, Gesekan Batang, Kebocoran Packing & EPA M21 ppm, Kebocoran Dudukan) serta Panel Diagnostik.',
        ja: '「トラップ・シート故障注入」で正常・締付不足・過締付固着・シート漏れ/トラップ吹き抜けを切り替えます。流量 Q、ステム摩擦力、パッキン漏洩（EPA M21 ppm）、シート漏れ・トラップ状態と下部診断パネルを確認しましょう。',
      },
    },
    {
      id: 'valve-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch between Theory (Alt+1), Simulator (Alt+2), Practice (Alt+3), and Quiz (Alt+4) to master gland torque tuning, EPA M21 limits, and steam trap diagnostics.',
        id: 'Berpindah antara Teori (Alt+1), Simulator (Alt+2), Latihan (Alt+3), dan Kuis (Alt+4) untuk menguasai penyetelan torsi gland, batas EPA M21, dan diagnostik steam trap.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、グランドトルク調整やEPA M21基準・トラップ診断を習得しましょう。',
      },
    },
  ],

  'vbelt-basics': [
    {
      id: 'vbelt-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'V-Belt Cross-Section & Wedging Physics',
        id: 'Penampang V-Belt & Fisika Efek Baji',
        ja: 'Vベルト断面着座とくさび力学',
      },
      description: {
        en: 'Inspect proportional belt cross-sections seated inside a pulley groove on the 2D CAD view. The top header badges always show the active belt dimensions (width × height in mm) and calculated linear belt speed V (m/s) at the minimum recommended sheave diameter.',
        id: 'Amati penampang sabuk proporsional yang duduk di dalam alur puli pada tampilan CAD 2D. Lencana header selalu menampilkan dimensi sabuk aktif (lebar × tinggi mm) dan kecepatan linier sabuk V (m/s).',
        ja: '2D CAD図でプーリ溝に着座したベルト断面の実寸比を確認できます。上部ヘッダーのバッジには選択中ベルトの寸法（幅×高さ mm）と最小推奨プーリ径でのベルト周速度 V（m/s）が表示されます。',
      },
    },
    {
      id: 'vbelt-profiles',
      badge: { en: 'Step 2 • Belt Profiles', id: 'Langkah 2 • Profil Sabuk', ja: 'ステップ2・ベルト形式' },
      title: {
        en: 'Selecting Belt Profiles & Groove Angles',
        id: 'Memilih Profil Sabuk & Sudut Alur',
        ja: 'ベルト断面形式と溝角度の選択',
      },
      description: {
        en: 'Click any profile button in the Select Belt Profile grid (classical, narrow wedge, cogged, or positive/flat profiles). Notice the badge at the top right of the card updates the pulley groove wedge angle (or Positive / Flat) and loads a matching sample code into the decoder.',
        id: 'Klik tombol profil mana saja pada grid Pilih Profil Sabuk. Lencana di kanan atas kartu memperbarui sudut alur puli (atau Positif / Datar) dan memuat contoh kode yang sesuai ke dekoder.',
        ja: '「ベルト断面形式の選択」グリッドから任意の形式を選ぶと、プーリ溝のくさび角度（または歯付/平ベルト）が更新され、規格コード解読器にも代表コードが自動入力されます。',
      },
    },
    {
      id: 'vbelt-seating',
      badge: { en: 'Step 3 • Groove Seating', id: 'Langkah 3 • Kedudukan Alur', ja: 'ステップ3・着座状態' },
      title: {
        en: 'Proper Seating vs. Worn Flanks & Bottomed-Out',
        id: 'Duduk Baik vs. Alur Aus & Bottoming Out',
        ja: '適正着座・摩耗溝・底突き故障の比較',
      },
      description: {
        en: 'Toggle Groove Seating Health Condition between Proper Seating, Worn Flanks, and Bottomed-Out. When a belt bottoms out on the groove floor, sidewall wedging vanishes and Apparent Grip μ′ drops sharply on the readout strip.',
        id: 'Ubah Kondisi Kedudukan Alur Puli antara Duduk Baik, Alur Aus, dan Bottoming Out. Saat sabuk menyentuh dasar alur (bottomed-out), efek baji dinding hilang dan Gesekan Semu μ′ turun drastis.',
        ja: '「プーリ溝着座状態」を適正着座・摩耗溝・底突き故障で切り替えます。ベルトが溝底に当たると側壁くさび効果が失われ、見かけ摩擦 μ′ が急低下する様子を確認できます。',
      },
    },
    {
      id: 'vbelt-sliders-readouts',
      badge: { en: 'Step 4 • Tension & RPM', id: 'Langkah 4 • Tegangan & RPM', ja: 'ステップ4・張力と回転数' },
      title: {
        en: 'Tension, Driver RPM & Live Physics Strip',
        id: 'Tegangan, Putaran Motor & Kartu Fisika',
        ja: 'ベルト張力・回転数と物理量カード',
      },
      description: {
        en: 'Drag Tension (T) from 100 to 1500 N and Driver RPM from 300 to 3600 rpm. Watch Flank Force Fn, Apparent Grip μ′, Min Pulley D, Power / Strand, and the Shop Practice Rule of Thumb card update live—comparing actual belt speed against max rated speed.',
        id: 'Geser Tegangan (T) 100–1500 N dan Putaran Motor 300–3600 rpm. Pantau Gaya Samping Fn, Gesekan Semu μ′, Puli Min D, Daya/Jalur, serta kartu Kaidah Praktis Bengkel yang membandingkan kecepatan sabuk dengan batas maksimum.',
        ja: '張力 (T: 100〜1500 N) と駆動回転数 (300〜3600 rpm) を動かすと、側壁抗力 Fn、見かけ摩擦 μ′、最小プーリ径、伝動容量/本、および現場実務の設計ルールがリアルタイム更新されます。',
      },
    },
    {
      id: 'vbelt-decoder',
      badge: { en: 'Step 5 • Code Decoder', id: 'Langkah 5 • Dekoder Kode', ja: 'ステップ5・コード解読器' },
      title: {
        en: 'Interactive Belt Code Decoder',
        id: 'Dekoder Kode Sabuk Industri Interaktif',
        ja: 'ベルト規格コード解読器',
      },
      description: {
        en: 'Type an industrial belt designation (or click quick samples: B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840) in the Interactive Belt Code Decoder. It parses the belt family, cross-section, length type, and effective length in mm—click "Load" to apply a recognized profile directly to the CAD view.',
        id: 'Ketik kode sabuk industri (atau klik contoh cepat: B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840) pada Dekoder Kode Sabuk. Sistem mengurai keluarga sabuk, dimensi, tipe panjang, dan panjang efektif (mm)—klik "Muat" untuk menerapkannya.',
        ja: '規格コードを入力（またはサンプルボタン B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840 をクリック）すると、ベルト系列・断面寸法・有効長さ（mm）を解析します。「適用」で断面図に反映できます。',
      },
    },
    {
      id: 'vbelt-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz) to move between sections and test your skills on wedging forces, sheave wear, and belt code decoding.',
        id: 'Gunakan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis) untuk berpindah bagian dan menguji pemahaman efek baji, keausan puli, serta pembacaan kode sabuk.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）で学習を進め、くさび効果や規格コード解読の演習・クイズに挑戦しましょう。',
      },
    },
  ],

  'vibrating-feeder': [
    {
      id: 'vf-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'Material Presets & Feeder Playback',
        id: 'Preset Material & Kontrol Pemutaran Feeder',
        ja: '搬送物プリセットとフィーダ運転制御',
      },
      description: {
        en: 'Select from five bulk material presets at the top (Limestone, Coal, Iron Ore, Wet Sand, Wood Chips) to auto-configure density, moisture friction, throw angle, and slope. Use Pause / Run Feeder and Reset to control the animation or restore baseline limestone parameters.',
        id: 'Pilih lima preset material di atas (Batu Kapur, Batu Bara, Bijih Besi, Pasir Basah, Serpihan Kayu) untuk mengatur densitas, gesekan, sudut lempar, dan kemiringan. Gunakan Jeda/Jalankan dan Reset untuk mengontrol animasi.',
        ja: '上部の5種類の搬送物プリセット（石灰石・石炭・鉄鉱石・湿砂・木質チップ）から物性と標準角度を設定できます。一時停止/運転再開およびリセットボタンでアニメーションを制御します。',
      },
    },
    {
      id: 'vf-svg-gate',
      badge: { en: 'Step 2 • Cutaway & Gate', id: 'Langkah 2 • Potongan & Gerbang', ja: 'ステップ2・断面図とゲート' },
      title: {
        en: 'Interactive Drag Gate, Scope & Throw Regime',
        id: 'Gerbang Geser Interaktif, Osiloskop & Rezim',
        ja: 'ドラッグ操作ゲート・振動波形と投擲モード',
      },
      description: {
        en: 'Watch the side-cutaway trough, isolation springs, and live vibration scope. You can drag the hopper gate handle directly on the SVG canvas to change Gate Opening (H) and bed depth, while the header pill classifies motion as Sub-Throw Sliding, Optimal Micro-Throw, or Aggressive Bounce.',
        id: 'Amati bak potongan samping, pegas isolasi, dan osiloskop getaran. Anda dapat menggeser gagang gerbang corong langsung di kanvas SVG untuk mengubah Bukaan (H) dan tebal lapisan material, sementara lencana menunjukkan rezim gerak.',
        ja: '側面断面図でトラフ運動と振動波形を確認できます。SVG上のホッパーゲートを直接ドラッグしてゲート開度 (H) と層厚を変更でき、右上のバッジに輸送モード（滑走・最適マイクロ投擲・過大跳躍）が表示されます。',
      },
    },
    {
      id: 'vf-drive-trough',
      badge: { en: 'Step 3 • Drive & Trough', id: 'Langkah 3 • Penggerak & Bak', ja: 'ステップ3・加振とトラフ' },
      title: {
        en: 'Drive Frequency, Stroke, Throw & Trough Size',
        id: 'Frekuensi, Stroke, Sudut β & Ukuran Bak',
        ja: '駆動周波数・振幅・投擲角とトラフ形状',
      },
      description: {
        en: 'In Group 1 (Drive & Vibration), tune Drive Frequency f (8–55 Hz), Stroke 2A (1.5–14.0 mm), and Throw Angle β (10°–40°). In Group 2 (Trough & Gate Geometry), adjust Width W (300–1600 mm), Length L (1.5–6.0 m), Gate H (40–300 mm), and Slope α (0°–15°).',
        id: 'Di Grup 1, atur Frekuensi f (8–55 Hz), Stroke 2A (1,5–14,0 mm), dan Sudut β (10°–40°). Di Grup 2, ubah Lebar W (300–1600 mm), Panjang L (1,5–6,0 m), Bukaan H (40–300 mm), dan Kemiringan α (0°–15°).',
        ja: 'グループ1で駆動周波数 f（8〜55 Hz）、振幅 2A（1.5〜14.0 mm）、投擲角 β（10°〜40°）を調整します。グループ2ではトラフ幅 W・長さ L・ゲート開度 H・勾配 α（0°〜15°）を変更できます。',
      },
    },
    {
      id: 'vf-springs-faults',
      badge: { en: 'Step 4 • Springs & Faults', id: 'Langkah 4 • Pegas & Gangguan', ja: 'ステップ4・ばねと故障注入' },
      title: {
        en: 'Material, Isolation Springs & Fault Injection',
        id: 'Material, Pegas Isolasi & Simulasi Gangguan',
        ja: '物性・防振ばねと異常注入ラボ',
      },
      description: {
        en: 'In Group 3, adjust Density ρ, Moisture/μ, and Spring Stiffness k (300–1800 N/mm, updating natural frequency fₙ). In the Fault Injection Lab below, inject Broken Coil Spring, Hopper Bridging, or Eccentric Phase Slip—and click "Repair / Clear Fault" on the diagnostic banner to fix faults or escape resonance.',
        id: 'Di Grup 3, atur Densitas ρ, Lembap/Gesek, dan Kekakuan Pegas k (memperbarui fₙ). Di Simulasi Gangguan, uji Pegas Koil Patah, Penyumbatan Corong, atau Slip Fasa Eksentrik—klik "Perbaiki Gangguan" pada banner untuk memulihkannya.',
        ja: 'グループ3でかさ密度 ρ、水分・摩擦係数、ばね定数 k（固有振動数 fₙ が連動）を設定します。「異常・故障注入ラボ」でコイルばね破損・ホッパーブリッジ・偏心位相ずれを発生させ、「異常を修復」ボタンで復旧できます。',
      },
    },
    {
      id: 'vf-kpis',
      badge: { en: 'Step 5 • Telemetry', id: 'Langkah 5 • Telemetri', ja: 'ステップ5・テレメトリ' },
      title: {
        en: 'Six Engineering KPIs & Resonance Guard',
        id: 'Enam KPI Rekayasa & Zona Resonansi',
        ja: '6つの工学KPIと共振警戒表示',
      },
      description: {
        en: 'Monitor Throw Index Kᵥ (and peak g-force), Conveying Velocity & Bed Depth, Mass Flow Rate (t/h & m³/h), Springs & f/fₙ ratio (with isolation efficiency η%), Motor Power & Current, and Liner Wear Index. Keep f/fₙ > 2.0 to avoid the Resonance Danger Zone.',
        id: 'Pantau Indeks Lempar Kᵥ (dan gaya g), Kecepatan & Lapisan, Laju Aliran Massa (t/h), Pegas & rasio f/fₙ (efisiensi isolasi η%), Daya & Arus Motor, serta Indeks Keausan Liner. Jaga f/fₙ > 2,0 agar terhindar dari Zona Bahaya Resonansi.',
        ja: '投擲指数 Kᵥ、輸送速度・層厚、質量流量 (t/h)、ばね荷重・f/fₙ（防振効率 η%）、モータ出力・電流、ライナー摩耗指数の6カードを確認できます。共振危険域を避けるため f/fₙ > 2.0 での運転が推奨されます。',
      },
    },
    {
      id: 'vf-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Switch tabs using Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz). Practice calculating throw index and isolation ratios, then check your score in Quiz.',
        id: 'Berpindah tab menggunakan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis). Latih perhitungan indeks lempar dan rasio isolasi, lalu uji di Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、投擲指数や防振比の演習・クイズに取り組みましょう。',
      },
    },
  ],

  vibration: [
    {
      id: 'vib-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'Rotor Dynamics, Foundation & Presets',
        id: 'Dinamika Rotor, Fondasi & Preset',
        ja: 'ロータ動釣合・基礎形式とプリセット',
      },
      description: {
        en: 'Model a single-plane Jeffcott rotor with unbalance, critical speed resonance, and ISO 10816-3 / 20816-3 severity limits. Toggle Rigid vs. Flexible (Class II) foundation support, pick a Rotor Unbalance Preset, and use Start/Stop or Export CSV on the top right.',
        id: 'Modelkan rotor Jeffcott satu bidang dengan unbalance, resonansi kecepatan kritis, dan batas keparahan ISO 10816-3 / 20816-3. Pilih Tipe Fondasi Kaku vs Fleksibel (Kelas II), pilih Preset Ketidakseimbangan, dan gunakan Start/Stop atau Ekspor CSV.',
        ja: '単一修正面ジェフコット・ロータの不釣合振動、危険速度共振、ISO 10816-3 / 20816-3 評価をシミュレートします。剛性/弾性基礎の切替、プリセット選択、起動/停止・CSV出力が上部で行えます。',
      },
    },
    {
      id: 'vib-speed-advanced',
      badge: { en: 'Step 2 • Speed & Nc', id: 'Langkah 2 • Kecepatan & Nc', ja: 'ステップ2・回転数と危険速度' },
      title: {
        en: 'Operating Speed, Quick Jumps & Advanced Nc/ζ',
        id: 'Kecepatan Operasi, Tombol Cepat & Nc/ζ',
        ja: '運転回転速度・ジャンプボタンと詳細設定',
      },
      description: {
        en: 'Drag Operating Speed (300–4500 RPM) or click quick jump buttons (900, 1800, 2100 Nc, 3000, 3600) to sweep across the critical speed. Click the sliders icon below the Clear button to expand Advanced Rotordynamics and adjust Critical Speed Nc (1500–3000 RPM) and Damping Ratio ζ (0.02–0.20).',
        id: 'Geser Kecepatan Operasi (300–4500 RPM) atau klik tombol cepat (900, 1800, 2100 Nc, 3000, 3600) untuk melewati kecepatan kritis. Klik ikon slider di bawah tombol Hapus untuk membuka parameter lanjutan Nc dan Rasio Redaman ζ.',
        ja: '運転回転速度（300〜4500 RPM）やクイックボタン（900〜3600、Nc強調表示）で危険速度通過時の振幅・位相変化を観察します。クリアボタン横の歯車/スライダーボタンで第1危険速度 Nc と減衰比 ζ を調整できます。',
      },
    },
    {
      id: 'vib-balancing',
      badge: { en: 'Step 3 • Balancing', id: 'Langkah 3 • Penyeimbangan', ja: 'ステップ3・釣合修正' },
      title: {
        en: 'Initial Unbalance U₀ & Correction Weight Wc',
        id: 'Ketidakseimbangan Awal U₀ & Massa Koreksi Wc',
        ja: '初期不釣合 U₀ と釣合修正質量 Wc',
      },
      description: {
        en: 'Adjust Initial Unbalance Magnitude U₀ (0–500 g·mm) and Angle θ₀ (0°–355°), then manually counter-balance using Added Mass Wc (0–8 g) and Correction Angle θc (0°–355°). Click "Auto-Balance" to compute and apply the exact counter-weight, or "Clear" to remove correction weights.',
        id: 'Atur Besaran U₀ (0–500 g·mm) dan Sudut θ₀ (0°–355°), lalu lakukan penyeimbangan manual dengan Massa Tambahan Wc (0–8 g) dan Sudut Koreksi θc. Klik "Balans Ideal" untuk menerapkan massa penyeimbang otomatis, atau "Hapus" untuk mengosongkannya.',
        ja: '初期不釣合 U₀ と位相角 θ₀ を設定し、付加質量 Wc（0〜8 g）と修正位相角 θc で手動釣合を行います。「自動釣合修正」で理想的な対向重錘を自動配置し、「クリア」で修正重錘を解除できます。',
      },
    },
    {
      id: 'vib-rig-svg',
      badge: { en: 'Step 4 • Rotor Rig SVG', id: 'Langkah 4 • Rig Rotor SVG', ja: 'ステップ4・ロータ試験ベンチ' },
      title: {
        en: 'Interactive Rotor Rig & Face View',
        id: 'Rig Dinamika Rotor & Tampilan Muka Interaktif',
        ja: '対話型ロータ動釣合ベンチ図',
      },
      description: {
        en: 'On the 2D Rotor Dynamic Rig SVG, you can directly toggle the motor run state and click around the balancing disk PCD bolt holes to set the Correction Angle θc interactively while watching the 1X orbit and phase lag arrow.',
        id: 'Pada SVG Rig Dinamika Rotor 2D, Anda dapat langsung menyalakan/mematikan motor dan mengklik lubang baut PCD pada tampilan muka disk untuk menentukan Sudut Koreksi θc secara interaktif.',
        ja: '左側の2D試験ベンチSVG上では、モータの起動/停止操作や、バランスディスクのPCDボルト穴をクリックして修正位相角 θc を直感的に指定することができます。',
      },
    },
    {
      id: 'vib-charts-iso',
      badge: { en: 'Step 5 • ISO & Charts', id: 'Langkah 5 • ISO & Grafik', ja: 'ステップ5・ISO判定とグラフ' },
      title: {
        en: 'Telemetry, ISO Severity Bar & FFT / Bode Tabs',
        id: 'Telemetri, Bar ISO & Tab FFT / Bode',
        ja: 'テレメトリ・ISO判定バーとFFT/ボード線図',
      },
      description: {
        en: 'Track Vibration RMS v_rms (mm/s), 1X Orbit Pk-Pk (μm), Net Unbalance U_net (g·mm), and Phase Lag φ (°) against the live ISO 10816-3 / 20816-3 Zone A–D severity bar. Switch the diagnostic chart below between the FFT Spectrum tab and the Bode Curve tab.',
        id: 'Pantau Getaran RMS v_rms, Orbit 1X Pk-Pk, Sisa Unbalance U_net, dan Sudut Fasa φ terhadap bar keparahan ISO 10816-3 / 20816-3 Zona A–D. Ganti grafik diagnostik di bawah antara tab Spektrum FFT dan Kurva Bode.',
        ja: '総振動速度 RMS・1X振幅・残留不釣合・位相遅れ角 φ の4指標と、ISO 10816-3 / 20816-3（Zone A〜D）の判定バーを確認できます。下部のチャートは「FFTスペクトル」と「ボード線図」タブを切り替えられます。',
      },
    },
    {
      id: 'vib-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz) to switch tabs. Practice single-plane balancing calculations and verify your understanding in the Quiz.',
        id: 'Gunakan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis) untuk berpindah tab. Latih perhitungan penyeimbangan satu bidang dan uji pemahaman Anda di Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、単一修正面バランシングの演習とクイズに挑戦しましょう。',
      },
    },
  ],

  'vibration-meter': [
    {
      id: 'vm-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'Handheld Vibration Meter & Machine Route',
        id: 'Alat Ukur Getaran & Rute Mesin',
        ja: '携帯型振動計と機械計測ルート',
      },
      description: {
        en: 'Perform a 4-point predictive maintenance route on a coupled motor-pump train using a handheld vibration analyzer. You can click probe points directly on the machine diagram or press the mode button on the handheld meter SVG to cycle measurement units.',
        id: 'Lakukan inspeksi rute pemeliharaan prediktif 4 titik pada rangkaian motor-pompa menggunakan alat ukur getaran genggam. Anda dapat mengklik titik probe langsung pada diagram mesin atau menekan tombol mode pada SVG alat ukur.',
        ja: '電動機・ポンプ連結機を対象に、携帯型振動計による4点巡回点検を行います。機械図上のプローブ位置を直接クリックするか、振動計SVG上のボタンで測定モードを切り替えることができます。',
      },
    },
    {
      id: 'vm-modes',
      badge: { en: 'Step 2 • Modes', id: 'Langkah 2 • Mode Ukur', ja: 'ステップ2・測定モード' },
      title: {
        en: 'Four Vibration Measurement Modes',
        id: 'Empat Mode Pengukuran Getaran',
        ja: '4種類の振動測定モード',
      },
      description: {
        en: 'Select Velocity (mm/s RMS) for ISO 10816-3 overall severity, Accel (g Peak) for high-frequency impacts, Disp (μm P-P) for low-speed shaft motion, or Bearing (BDU) to isolate rolling-element bearing damage.',
        id: 'Pilih Velocity (mm/s RMS) untuk keparahan ISO 10816-3, Accel (g Peak) untuk benturan frekuensi tinggi, Disp (μm P-P) untuk gerak poros kecepatan rendah, atau Bearing (BDU) untuk mendeteksi kerusakan bantalan gelinding.',
        ja: '「Velocity (mm/s RMS)」でISO 10816-3総合判定、「Accel (g Peak)」で高周波衝撃、「Disp (μm P-P)」で低速変位、「Bearing (BDU)」で転がり軸受損傷を評価します。',
      },
    },
    {
      id: 'vm-route-matrix',
      badge: { en: 'Step 3 • 4-Point Route', id: 'Langkah 3 • Rute 4 Titik', ja: 'ステップ3・4点ルート計測' },
      title: {
        en: 'Magnetic Probe Placement & 4-Point Matrix',
        id: 'Posisi Probe Magnetik & Matriks 4 Titik',
        ja: 'プローブ位置選択と4点ルートマトリックス',
      },
      description: {
        en: 'Switch Magnetic Probe Placement using the 4-point pill bar on the right or by clicking any card in the 4-Point Bearing Route Matrix. Each card compares VEL, ACC, DISP, and BDU side by side with an ISO Zone A–D badge.',
        id: 'Pindahkan Posisi Probe Magnetik melalui bilah 4 titik di kanan atau klik langsung kartu pada Matriks Pengukuran Rute 4 Titik Bantalan. Setiap kartu membandingkan VEL, ACC, DISP, BDU, dan lencana Zona ISO A–D.',
        ja: '右側のプローブ位置ボタン、または図の下の「4点軸受ルート計測マトリックス」カードをクリックして測定点を切り替えます。各カードでVEL・ACC・DISP・BDUとISO Zone（A〜D）を一覧比較できます。',
      },
    },
    {
      id: 'vm-rpm-class',
      badge: { en: 'Step 4 • RPM & ISO Class', id: 'Langkah 4 • RPM & Kelas ISO', ja: 'ステップ4・回転数とISOクラス' },
      title: {
        en: 'Machine Speed (RPM) & ISO 10816-3 Class',
        id: 'Putaran Mesin (RPM) & Kelas ISO 10816-3',
        ja: '機械回転数（RPM）とISO 10816-3クラス',
      },
      description: {
        en: 'Adjust Machine Speed (900–3600 RPM) with the slider or quick presets (1200, 1500, 1800, 3000, 3600), and select the ISO 10816-3 Power & Foundation Class. Notice the ISO threshold header on the matrix updates dynamically for each machine class.',
        id: 'Atur Putaran Mesin (900–3600 RPM) lewat slider atau preset cepat (1200, 1500, 1800, 3000, 3600), lalu pilih Kelas Daya & Fondasi ISO 10816-3. Ambang batas ISO pada header matriks akan menyesuaikan otomatis.',
        ja: '回転数（900〜3600 RPM）をスライダーまたはプリセット（1200〜3600）で設定し、ISO 10816-3 出力・基礎クラスを選択します。選択クラスに応じて判定しきい値（mm/s）が自動更新されます。',
      },
    },
    {
      id: 'vm-faults-diagnosis',
      badge: { en: 'Step 5 • Faults & Action', id: 'Langkah 5 • Gangguan & Tindakan', ja: 'ステップ5・故障診断と処置' },
      title: {
        en: 'Fault Scenarios & Field Diagnostic Card',
        id: 'Skenario Kerusakan & Kartu Diagnostik',
        ja: '故障シナリオと現場診断・推奨処置',
      },
      description: {
        en: 'Inject faults from the Fault Scenario list—such as unbalance, misalignment, looseness, bearing wear, or cavitation—and compare readings across motor and pump bearings. Read the Field Diagnostic Interpretation card for root-cause clues and the Recommended Action.',
        id: 'Pilih Skenario Kerusakan (unbalance, misalignment, kelonggaran, keausan bantalan, dll.) dan bandingkan pembacaan antar titik bantalan motor dan pompa. Baca kartu Interpretasi Diagnostik Lapangan untuk melihat Tindakan Disarankan.',
        ja: '故障シナリオを切り替えてモータ側とポンプ側軸受の振動値の違いを比較します。図の下の「現場診断および推奨処置」カードで異常の特徴と具体的な保全処置を確認しましょう。',
      },
    },
    {
      id: 'vm-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Use Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), and Alt+4 (Quiz) to navigate. Practice diagnosing 4-point vibration routes in Practice mode and test your ISO 10816-3 mastery in Quiz.',
        id: 'Gunakan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), dan Alt+4 (Kuis) untuk berpindah tab. Berlatihlah mendiagnosis rute 4 titik di mode Latihan dan uji penguasaan ISO 10816-3 di Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、4点計測からの故障切り分けを演習・クイズで確認しましょう。',
      },
    },
  ],

  'weld-strength': [
    {
      id: 'weld-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1・概要' },
      title: {
        en: 'AWS Weld Joint Modes, Presets & Export',
        id: 'Mode Sambungan Las AWS, Preset & Ekspor',
        ja: 'AWS溶接継手モード・プリセットと出力',
      },
      description: {
        en: 'Analyze structural welds across three Joint Type tabs: 1. Lap / T-Fillet, 2. Eccentric Bracket, and 3. Butt Groove Weld. Use the Design Presets bar to load standard AWS joint cases, Reset to restore defaults, or Export CSV to save the stress breakdown.',
        id: 'Analisis las struktural pada tiga tab Jenis Sambungan: 1. Fillet Tumpang / T, 2. Braket Eksentrik, dan 3. Kampuh Tumpul. Gunakan bilah Preset Desain untuk memuat kasus standar, Reset, atau Unduh CSV.',
        ja: '「1. 重ね／T形すみ肉」「2. 偏心ブラケット」「3. 突合せ開先溶接」の3モードで溶接強度を解析します。設計プリセットの適用、初期化、CSV出力が上部ツールバーから行えます。',
      },
    },
    {
      id: 'weld-electrode-load',
      badge: { en: 'Step 2 • Electrode & Load', id: 'Langkah 2 • Elektroda & Beban', ja: 'ステップ2・溶接棒と荷重' },
      title: {
        en: 'Electrode / Filler Alloy & Applied Load F',
        id: 'Elektroda / Kawat Las & Gaya Beban F',
        ja: '溶接棒・溶加材選定と作用外力 F',
      },
      description: {
        en: 'Select the Electrode / Filler Alloy (showing process, UTS, and AWS allowable shear stress) from the dropdown, and drag the universal Applied Load (F) slider from 5 kN to 500 kN to test joint capacity.',
        id: 'Pilih Elektroda / Kawat Las (menampilkan proses, UTS, dan tegangan geser izin AWS) dari menu dropdown, lalu geser slider Gaya Beban (F) dari 5 kN hingga 500 kN.',
        ja: '「溶接棒・溶加材選定」ドロップダウンで電極グレード（UTS・AWS許容せん断応力を表示）を選び、下部共通の「作用外力 (F)」スライダー（5〜500 kN）で荷重条件を設定します。',
      },
    },
    {
      id: 'weld-mode1',
      badge: { en: 'Step 3 • Lap / T-Fillet', id: 'Langkah 3 • Fillet Tumpang / T', ja: 'ステップ3・重ね/T形すみ肉' },
      title: {
        en: 'Mode 1: Fillet Passes, Orientation & Size',
        id: 'Mode 1: Jumlah Lasan, Arah Beban & Ukuran',
        ja: 'モード1：すみ肉配置・荷重方向・寸法',
      },
      description: {
        en: 'In Lap / T-Fillet mode, toggle Fillet Passes between Single (1x) and Double (2x) and Load Orientation between Transverse (1.5x directional factor) and Parallel (1.0x). Adjust Fillet Leg Size s (3–25 mm) and Weld Length Lw (30–300 mm).',
        id: 'Pada mode Fillet Tumpang / T, pilih Jumlah Lasan Single (1x) vs Double (2x) dan Arah Beban Transverse (1,5x) vs Parallel (1,0x). Atur Ukuran Kaki Las s (3–25 mm) dan Panjang Las Lw (30–300 mm).',
        ja: '重ね/T形すみ肉モードでは、すみ肉配置（片面 1x / 両面 2x）と荷重方向（横方向 1.5x / 縦方向 1.0x）を切り替え、脚長 s（3〜25 mm）と有効溶接長 Lw（30〜300 mm）を調整します。',
      },
    },
    {
      id: 'weld-mode2-mode3',
      badge: { en: 'Step 4 • Bracket & Butt', id: 'Langkah 4 • Braket & Kampuh', ja: 'ステップ4・偏心と突合せ' },
      title: {
        en: 'Modes 2 & 3: Eccentric Bracket & Butt Groove',
        id: 'Mode 2 & 3: Braket Eksentrik & Kampuh Tumpul',
        ja: 'モード2・3：偏心ブラケットと突合せ開先',
      },
      description: {
        en: 'In Eccentric Bracket mode, select Weld Pattern (2 Vertical Lines, 2 Horizontal Lines, or C-Channel) and adjust Leg Size s, Width b, Depth d, and Eccentricity e. In Butt Groove Weld mode, choose Edge Preparation (Single-V, Double-V, Single-U, Square Butt), Penetration (CJP 100% vs PJP 75%), Thickness t, Width w, and Bending Moment M.',
        id: 'Pada Braket Eksentrik, pilih Pola Las (2 Garis Vertikal, 2 Garis Horizontal, atau Kanal-C) serta atur s, b, d, dan Eksentrisitas e. Pada Kampuh Tumpul, pilih Bentuk Kampuh, Penetrasi (CJP 100% vs PJP 75%), Tebal t, Lebar w, dan Momen Lentur M.',
        ja: '偏心ブラケットでは溶接パターン（縦2線・横2線・コ字型）と s・b・d・偏心距離 e を設定します。突合せ開先溶接では開先形状、溶込み（CJP 100% / PJP 75%）、板厚 t、幅 w、曲げモーメント M を調整できます。',
      },
    },
    {
      id: 'weld-results',
      badge: { en: 'Step 5 • Stress & Safety', id: 'Langkah 5 • Tegangan & SF', ja: 'ステップ5・応力と安全率' },
      title: {
        en: 'CAD View, Summary Cards & Stress Breakdown',
        id: 'Tampilan CAD, Kartu Ringkasan & Rincian Tegangan',
        ja: 'CAD図・安全率カードと応力成分内訳',
      },
      description: {
        en: 'Inspect Throat (a = 0.707s), Effective Area Aw, Peak Joint Stress, and Safety Factor (PASS / MARGINAL / FAIL) below the 2D CAD SVG. In the Stress Distribution Breakdown card, compare primary direct/axial stress against secondary torsional shear τ″ or bending stress, AWS Allowable Limit, and the Stress Utilization % bar.',
        id: 'Periksa Tebal Leher a, Luas Efektif Aw, Tegangan Puncak, dan Faktor Keamanan (PASS / MARGINAL / FAIL) di bawah SVG. Pada kartu Rincian Komponen Tegangan, bandingkan geser/aksial primer, torsi/lentur sekunder, Batas Izin AWS, dan bar Utilisasi Tegangan %.',
        ja: 'CAD図の下で理論のど厚 a、有効のど断面積 Aw、最大合成応力、安全率（PASS/MARGINAL/FAIL）を確認できます。右下の応力成分解析内訳では一次応力・二次ねじり/曲げ応力・AWS許容限度・応力利用率バーを比較できます。',
      },
    },
    {
      id: 'weld-workflow',
      badge: { en: 'Step 6 • Workflow', id: 'Langkah 6 • Alur Belajar', ja: 'ステップ6・学習フロー' },
      title: {
        en: 'Explore, Practice, Quiz & Shortcuts',
        id: 'Eksplorasi, Latihan, Kuis & Pintasan',
        ja: '探索・演習・クイズとショートカット',
      },
      description: {
        en: 'Press Alt+1 (Theory), Alt+2 (Simulator), Alt+3 (Practice), or Alt+4 (Quiz) to switch tabs. Solve weld throat and eccentric bracket exercises in Practice and verify your AWS design skills in Quiz.',
        id: 'Tekan Alt+1 (Teori), Alt+2 (Simulator), Alt+3 (Latihan), atau Alt+4 (Kuis) untuk berpindah tab. Kerjakan soal ukuran las dan braket eksentrik di Latihan lalu uji di Kuis.',
        ja: 'Alt+1（理論）、Alt+2（シミュレータ）、Alt+3（演習）、Alt+4（クイズ）でタブを切り替え、のど厚計算や偏心ブラケットの演習・クイズで理解を確認しましょう。',
      },
    },
  ],
};
