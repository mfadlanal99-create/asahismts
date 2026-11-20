import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_3: Record<string, TutorialStep[]> = {
  'ir-thermometer': [
    {
      id: 'ir-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'IR Spot Pyrometer & Thermal Camera',
        id: 'Pirometer Spot IR & Kamera Termal',
        ja: '放射温度計 & サーモグラフィ',
      },
      description: {
        en: 'Practice non-contact infrared thermography on live industrial equipment. Compare Displayed Reading against True Center temperature and see how optics (D:S) and emissivity (ε) affect Total Error (ΔT).',
        id: 'Latih termografi inframerah non-kontak pada peralatan industri. Bandingkan Pembacaan Alat dengan suhu Asli Pusat serta amati pengaruh rasio optik (D:S) dan emisivitas (ε) terhadap Total Galat (ΔT).',
        ja: '産業設備の非接触赤外線温度計測を実習します。指示温度と中心真値を比較し、光学比（D:S）や放射率（ε）が総合誤差（ΔT）に与える影響を確認できます。',
      },
      tip: {
        en: 'Watch the Total Error (ΔT) card split errors into D:S spot averaging error and ε emissivity error.',
        id: 'Perhatikan kartu Total Galat (ΔT) yang memisahkan galat perataan spot D:S dan galat emisivitas ε.',
        ja: '総合誤差（ΔT）カードでは、D:Sスポット平均誤差とε放射率誤差の内訳をリアルタイムで確認できます。',
      },
    },
    {
      id: 'ir-modes',
      badge: { en: 'Modes', id: 'Mode', ja: 'モード' },
      title: {
        en: 'Spot Pyrometer vs. Thermal Overlay',
        id: 'Pirometer Spot vs. Overlay Termal',
        ja: 'スポット温度計とサーモ表示の切替',
      },
      description: {
        en: 'Switch between Spot Pyrometer and Thermal Overlay in the top bar. In Thermal mode, choose between Ironbow and Rainbow color palettes in the lower control panel, or click Reset to restore defaults.',
        id: 'Beralih antara Pirometer Spot dan Overlay Termal di bilah atas. Pada mode Termal, pilih palet warna Ironbow atau Rainbow di panel kontrol bawah, atau klik Reset untuk mengembalikan pengaturan awal.',
        ja: '上部バーで「スポット温度計」と「サーモ表示」を切り替えます。サーモ表示では下部パネルのカラーパレット（Ironbow / Rainbow）を選択でき、「リセット」で初期状態に戻せます。',
      },
    },
    {
      id: 'ir-scenes',
      badge: { en: 'Targets', id: 'Target', ja: '対象選択' },
      title: {
        en: 'Industrial Scenes & Quick-Aim Zones',
        id: 'Skenario Industri & Target Inspeksi Cepat',
        ja: '検査シーンと検査ポイント選択',
      },
      description: {
        en: 'Pick an Industrial Inspection Scene (such as MCC Breaker or other plant assets), then click any Quick-Aim Inspection Zones pill—or aim directly on the SVG viewport—to move the measurement crosshair.',
        id: 'Pilih Skenario Inspeksi Industri, lalu klik tombol Target Inspeksi Cepat—atau arahkan langsung pada viewport SVG—untuk memindahkan bidikan pengukuran.',
        ja: '産業設備検査シーンを選び、「検査ポイント選択」ボタンまたはビューポート上の直接クリックで測定照準を移動します。',
      },
    },
    {
      id: 'ir-optics',
      badge: { en: 'Optics', id: 'Optik', ja: '光学比' },
      title: {
        en: 'D:S Ratio & Inspection Distance',
        id: 'Rasio Optik (D:S) & Jarak Inspeksi',
        ja: '光学比 (D:S) と測定距離 (D)',
      },
      description: {
        en: 'Toggle Optics Ratio (D:S) between 12:1 and 30:1, and drag the Inspection Distance (D) slider from 15 to 300 cm. Observe how Spot Ø grows with distance and dilutes hot-spot readings when the spot exceeds the target.',
        id: 'Ubah Rasio Optik (D:S) antara 12:1 dan 30:1, lalu geser Jarak Inspeksi (D) dari 15 hingga 300 cm. Amati bagaimana diameter spot (Spot Ø) membesar dan mengencerkan pembacaan titik panas.',
        ja: '光学比（D:S）を12:1と30:1で切り替え、測定距離（D）スライダー（15〜300 cm）を調整します。距離が伸びてスポット径（Spot Ø）が対象より大きくなると測定値が平均化されます。',
      },
    },
    {
      id: 'ir-emissivity',
      badge: { en: 'Emissivity', id: 'Emisivitas', ja: '放射率' },
      title: {
        en: 'Emissivity (ε), Tape Patch & T_refl',
        id: 'Emisivitas (ε), Isolasi Listrik & T_refl',
        ja: '放射率 (ε)・絶縁テープ・反射温度',
      },
      description: {
        en: 'Adjust Instrument Emissivity (ε = 0.10–1.00) or select a material preset. On shiny low-ε metals, click + Apply Electrical Tape Patch (ε = 0.95) and tune Reflected Ambient Temp (T_refl, 15–45 °C) to see reflection compensation.',
        id: 'Atur Emisivitas Alat (ε = 0,10–1,00) atau pilih prasetel material. Pada logam mengilap ber-ε rendah, klik + Tempel Isolasi Listrik (ε = 0,95) dan atur Suhu Pantul Sekitar (T_refl, 15–45 °C).',
        ja: '放射率設定（ε = 0.10〜1.00）や材質プリセットを調整します。光沢金属など低放射率対象には「+ 絶縁テープを貼る」（ε = 0.95）を使い、反射周囲温度（T_refl, 15〜45 °C）の影響も確認できます。',
      },
    },
    {
      id: 'ir-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use the header tabs or keyboard shortcuts Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study theory, test scenarios, and verify your thermography skills.',
        id: 'Gunakan tab header atau pintasan keyboard Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari teori, berlatih skenario, dan mengikuti kuis.',
        ja: '上部タブまたはショートカット Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で理論学習から理解度確認まで進められます。',
      },
    },
  ],

  'laser-tachometer': [
    {
      id: 'tach-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Laser Tachometer & Stroboscope',
        id: 'Takometer Laser & Stroboskop',
        ja: 'レーザータコメータ & ストロボ',
      },
      description: {
        en: 'Measure rotating shaft speed without contact using either an optical 650 nm Laser Tachometer or a harmonic Stroboscope coupled to a variable-frequency motor drive.',
        id: 'Ukur kecepatan poros berputar secara non-kontak menggunakan Takometer Laser optik 650 nm atau Stroboskop harmonik yang terhubung ke penggerak motor VFD.',
        ja: '650 nm光学レーザータコメータとストロボスコープの2方式で、VFD駆動モータの非接触回転速度計測と高調波現象を学びます。',
      },
    },
    {
      id: 'tach-mode-laser',
      badge: { en: 'Laser Mode', id: 'Mode Laser', ja: 'レーザー' },
      title: {
        en: 'Instrument Mode, Shaft Run & 650 nm Laser',
        id: 'Mode Instrumen, Putar Poros & Laser 650 nm',
        ja: '計測モード・回転制御・レーザー照射',
      },
      description: {
        en: 'Switch Instrument Mode between Laser Tachometer and Stroboscope, and use Pause Shaft / Run Shaft to freeze or resume rotation. In Laser mode, toggle 650 nm Laser Emitter (LASER ON / STANDBY) and aim at the reflective tape target.',
        id: 'Pilih Mode Instrumen antara Takometer Laser dan Stroboskop, serta gunakan Jeda Poros / Putar Poros. Di mode Laser, aktifkan Pemancar Laser 650 nm dan arahkan ke pita reflektif.',
        ja: '計測モードを「レーザータコメータ」と「ストロボスコープ」で切り替え、「回転停止 / 再開」で軸を制御します。レーザーモードでは650 nmレーザーのON/STANDBYとターゲット照準を操作できます。',
      },
    },
    {
      id: 'tach-readouts',
      badge: { en: 'Telemetry', id: 'Telemetri', ja: '計測値' },
      title: {
        en: 'RPM, Hz, ω & Min/Avg/Max Hold',
        id: 'RPM, Hz, ω & Memori Hold Min/Avg/Max',
        ja: 'RPM・Hz・角速度・ホールドメモリ',
      },
      description: {
        en: 'Read live Shaft Speed (RPM), Pulse Rate (RPS / Hz), and Angular Velocity (ω in rad/s). Track MIN HOLD, AVG HOLD, and MAX HOLD memory cards as speed changes, and click Reset Min/Max to clear held statistics.',
        id: 'Pantau Kecepatan Poros (RPM), Frekuensi Pulsa (Hz), dan Kecepatan Sudut (ω rad/s). Amati memori MIN HOLD, AVG HOLD, dan MAX HOLD, lalu klik Reset Min/Maks untuk mengatur ulang.',
        ja: '回転速度（RPM）、パルス周波数（RPS/Hz）、角速度（ω rad/s）に加え、MIN / AVG / MAX HOLDメモリを確認できます。「最小/最大リセット」で統計値を初期化します。',
      },
    },
    {
      id: 'tach-strobe',
      badge: { en: 'Stroboscope', id: 'Stroboskop', ja: 'ストロボ' },
      title: {
        en: 'Flash Rate (FPM) & Harmonic Aliasing',
        id: 'Laju Kilat (FPM) & Aliasing Harmonik',
        ja: '発光周波数 (FPM) と高調波エイリアス',
      },
      description: {
        en: 'In Stroboscope mode, adjust Strobe Flash Rate (200–6000 FPM) with the slider, -10/-1/+1/+10 fine steps, or 1× RPM, 2× RPM, and ½× RPM buttons. Watch Apparent Images and Alias Drift change.',
        id: 'Pada mode Stroboskop, atur Laju Kilat Strobo (200–6000 FPM) melalui slider, tombol -10/-1/+1/+10, atau pintasan 1× RPM, 2× RPM, dan ½× RPM untuk mengamati Jumlah Bayangan dan Geser Alias.',
        ja: 'ストロボモードではスライダー、-10/-1/+1/+10微調整、または「1× RPM」「2× RPM」「½× RPM」ボタンで発光周波数（200〜6000 FPM）を設定し、見かけの像数やドリフト速度を観察します。',
      },
      tip: {
        en: 'Click 2× RPM to see two phantom tape marks 180° apart, or nudge FPM by ±2 to observe slow forward/backward drift.',
        id: 'Klik 2× RPM untuk melihat dua bayangan pita 180° berseberangan, atau geser FPM ±2 untuk melihat pergeseran alias.',
        ja: '「2× RPM」で180°対向の二重像を、±2 FPMずらすことで正転・逆転のエイリアスドリフトを確認できます。',
      },
    },
    {
      id: 'tach-vfd',
      badge: { en: 'VFD Drive', id: 'Penggerak VFD', ja: 'VFD駆動' },
      title: {
        en: 'VFD Frequency, Poles & Load Torque',
        id: 'Frekuensi VFD, Kutub & Torsi Beban',
        ja: 'VFD周波数・極数・軸負荷トルク',
      },
      description: {
        en: 'Load a VFD Motor Drive preset or tune VFD Supply Frequency (10–60 Hz), Motor Pole Count (2P, 4P, 6P, 8P), and Shaft Load Torque (0–100%) to inspect synchronous speed (Ns = 120f/P), Rotor Nr, and Slip s%.',
        id: 'Pilih prasetel Penggerak Motor VFD atau atur Frekuensi Suplai VFD (10–60 Hz), Jumlah Kutub (2P–8P), dan Torsi Beban Poros (0–100%) untuk melihat Ns, Rotor Nr, dan Slip s%.',
        ja: 'VFDプリセットを選ぶか、VFD電源周波数（10〜60 Hz）、モータ極数（2P/4P/6P/8P）、軸負荷トルク（0〜100%）を調整して同期速度Ns・実回転Nr・すべりs%を確認します。',
      },
    },
    {
      id: 'tach-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Switch tabs with Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review speed formulas, complete guided measurements, and test your knowledge.',
        id: 'Gunakan pintasan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari rumus, menyelesaikan latihan terpandu, dan mengikuti kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で各モードを切り替え、計算式と実測演習を確認しましょう。',
      },
    },
  ],

  lube: [
    {
      id: 'lube-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Tribology & Oil Analysis Workbench',
        id: 'Meja Kerja Tribologi & Analisis Oli',
        ja: 'トライボロジー・潤滑油診断ラボ',
      },
      description: {
        en: 'Evaluate elastohydrodynamic (EHL) oil film thickness, Stribeck lubrication regimes, ISO 4406 particle cleanliness, used-oil lab reports, and bearing grease relubrication intervals.',
        id: 'Evaluasi ketebalan film oli EHL, rezim pelumasan Stribeck, kode kebersihan ISO 4406, laporan lab oli bekas, serta kalkulator pelumasan ulang gemuk bantalan.',
        ja: 'EHL油膜厚さ、ストライベック曲線、ISO 4406清浄度、使用油ラボ診断、軸受グリース補給量計算を統合的にシミュレーションします。',
      },
    },
    {
      id: 'lube-presets',
      badge: { en: 'Scenarios', id: 'Skenario', ja: 'シナリオ' },
      title: {
        en: 'Fault Scenarios & Equipment Type',
        id: 'Skenario Gangguan & Jenis Peralatan',
        ja: '異常シナリオと対象機器の選択',
      },
      description: {
        en: 'Click a Fault Scenario pill (Healthy Gearbox, Water Ingress, Thermal Overload, Under-Viscous Bearing) or select an Equipment Type card to load OEM-recommended ISO VG and operating limits.',
        id: 'Klik tombol Skenario Gangguan (Gearbox Sehat, Masuknya Air, Beban Panas Berlebih, Bantalan Kurang Kental) atau pilih Jenis Peralatan untuk memuat rekomendasi OEM.',
        ja: '異常シナリオボタン（正常減速機・水分混入・過熱・低粘度軸受）または対象機器カードを選択し、OEM推奨粘度と運転条件を読み込みます。',
      },
    },
    {
      id: 'lube-controls',
      badge: { en: 'Conditions', id: 'Kondisi', ja: '運転条件' },
      title: {
        en: 'ISO VG, Temperature, Water & Wear',
        id: 'ISO VG, Suhu, Air & Tingkat Keausan',
        ja: 'ISO VG・油温・水分・摩耗粉設定',
      },
      description: {
        en: 'Select an ISO VG Viscosity Grade (green dot = OEM recommended), adjust Operating Temp (20–110 °C) and Water Contamination (0–2000 ppm), and set Wear Particle Level (Normal, Elevated, Severe) while watching Oil Oxidation & RUL.',
        id: 'Pilih Grade Viskositas ISO VG (titik hijau = rekomendasi OEM), geser Suhu Operasi (20–110 °C) dan Kontaminasi Air (0–2000 ppm), serta pilih Tingkat Partikel Keausan sambil memantau Oksidasi Oli & RUL.',
        ja: 'ISO VG粘度グレード（緑点がOEM推奨）を選び、運転油温（20〜110 °C）、水分混入量（0〜2000 ppm）、摩耗粉レベル（正常/注意/危険）を設定して油酸化と残存寿命（RUL）を確認します。',
      },
    },
    {
      id: 'lube-visuals',
      badge: { en: 'Visuals', id: 'Visualisasi', ja: '可視化' },
      title: {
        en: 'Viscosity-Temp, EHL Film & Stribeck Curve',
        id: 'Grafik Viskositas-Suhu, Film EHL & Kurva Stribeck',
        ja: '粘度温度曲線・EHL油膜・ストライベック曲線',
      },
      description: {
        en: 'Inspect the Viscosity-Temp Chart, animated EHL Film Canvas showing asperity contact and water/wear particles, and the Stribeck Curve tracking your live λ ratio across Boundary, Mixed, and Full-Film regimes.',
        id: 'Amati Grafik Viskositas-Suhu, Kanvas Film EHL yang menampilkan kontak asperitas serta partikel air/aus, dan Kurva Stribeck yang melacak rasio λ di rezim Batas, Campuran, hingga Film Penuh.',
        ja: '粘度-温度チャート、凹凸接触や水分・摩耗粉を描くEHL油膜キャンバス、境界・混合・流体潤滑領域を示すストライベック曲線でλ比の変化を確認します。',
      },
    },
    {
      id: 'lube-analysis',
      badge: { en: 'Diagnostics', id: 'Diagnostik', ja: '詳細診断' },
      title: {
        en: 'ISO 4406, Lab Report & Grease Calculator',
        id: 'ISO 4406, Diagnosis Lab & Kalkulator Gemuk',
        ja: 'ISO 4406・ラボ診断・グリース計算',
      },
      description: {
        en: 'Choose Filtration Beta-Ratio (β₅) to see particle counts and a_ISO bearing life multiplier, review Used Oil Lab Report flags, and enter Bearing OD (D), Width (B), RPM, and Bearing Type to compute Grease Shot (G) and Interval (t_f).',
        id: 'Pilih Rasio Beta Filtrasi (β₅) untuk melihat jumlah partikel dan pengali umur a_ISO, tinjau bendera Diagnosis Laporan Lab, lalu isi D, B, RPM, dan Tipe Bantalan di Kalkulator Gemuk untuk menghitung dosis (G) dan interval (t_f).',
        ja: 'フィルタβ₅値を選択して粒子数と軸受寿命係数a_ISOを確認し、使用油ラボ診断レポートをチェックします。グリース補給量計算ではD・B・RPM・軸受タイプから補給量(G)と補給間隔(t_f)を算出できます。',
      },
    },
    {
      id: 'lube-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Navigate with Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to master tribology theory, fault cases, and certification questions.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk menguasai teori tribologi, studi kasus gangguan, dan soal kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で切り替えながら潤滑診断の理解を深めましょう。',
      },
    },
  ],

  'machine-3d-explorer': [
    {
      id: 'm3d-hub',
      badge: { en: 'Hub', id: 'Beranda', ja: '機種選択' },
      title: {
        en: 'Choose a 3D Machine to Inspect',
        id: 'Pilih Mesin 3D untuk Diinspeksi',
        ja: '9種類の3D産業機械ハブ',
      },
      description: {
        en: 'Start on the Machine Selection Hub featuring 9 industrial assemblies (Process Pump, Belt Conveyor, Drag Chain Conveyor, Air Knocker, SKAKO Vibrator, Screw Conveyor, Gearbox, TEFC Motor, URAS Vibrator). Click Open 3D Inspector on any card, and return anytime via Choose Machine.',
        id: 'Mulai dari Hub Pemilihan Mesin dengan 9 rakitan industri (Pompa Proses, Konveyor Sabuk, Rantai Penggaruk, Air Knocker, Vibrator SKAKO, Konveyor Sekrup, Gearbox, Motor TEFC, Motor Getar URAS). Klik Buka Inspektor 3D, dan kembali kapan saja lewat tombol Pilih Mesin.',
        ja: 'ポンプ・ベルトコンベヤ・ドラッグチェーン・エアーノッカー・電磁バイブレータ・スクリューコンベヤ・減速機・三相モータ・振動モータの9機種から「3Dビューアを開く」を選択します。「機械選択」ボタンでいつでも一覧に戻れます。',
      },
    },
    {
      id: 'm3d-camera',
      badge: { en: 'Camera', id: 'Kamera', ja: '視点操作' },
      title: {
        en: '360° Orbit, Zoom & Camera Presets',
        id: 'Putar 360°, Zoom & Prasetel Kamera',
        ja: '360°回転・ズーム・カメラプリセット',
      },
      description: {
        en: 'Drag on the 3D canvas to orbit 360° and use the mouse wheel or top-left Zoom Out / Zoom In / Reset View buttons. Use the top toolbar presets (Iso, Front, Side, Top) for instant orthographic-style views.',
        id: 'Seret kanvas 3D untuk memutar 360° dan gunakan roda mouse atau tombol Perkecil / Perbesar / Reset di kiri atas. Gunakan prasetel kamera (Iso, Depan, Samping, Atas) di bilah atas.',
        ja: '3Dキャンバスをドラッグして360°回転し、マウスホイールまたは左上の縮小・拡大・リセットボタンでズームを調整します。上部バーの「立体・正面・側面・上面」で視点を素早く切り替えられます。',
      },
    },
    {
      id: 'm3d-toolbar',
      badge: { en: 'Controls', id: 'Kontrol', ja: '表示・駆動' },
      title: {
        en: 'X-Ray, Pins, Orbit & Drive RPM',
        id: 'X-Ray, Pin, Putar Otomatis & Drive RPM',
        ja: '透過・番号ピン・自動回転・駆動制御',
      },
      description: {
        en: 'Toggle X-Ray to make outer housings translucent, Pins to show/hide numbered BOM callouts, and Orbit for continuous turntable rotation. Click Drive and slide the RPM control (150–1750 RPM) to animate shafts and rotors.',
        id: 'Aktifkan X-Ray untuk menerawang rumah mesin, Pin untuk menampilkan nomor BOM, dan Putar untuk rotasi otomatis. Klik Putar (Drive) dan geser RPM (150–1750 RPM) untuk menggerakkan poros.',
        ja: '「透過」で外殻を半透明化し、「番号」でBOMコールアウトピンを表示、「回転」で自動ターンテーブル回転を行います。「駆動」ボタンとRPMスライダー（150〜1750 RPM）で実機動作をアニメーション再生できます。',
      },
    },
    {
      id: 'm3d-explode',
      badge: { en: 'Disassembly', id: 'Bongkar', ja: '分解表示' },
      title: {
        en: 'Exploded View Scrubber & Staged/Linear',
        id: 'Slider Bongkar & Mode Bertahap/Linear',
        ja: '分解スライダーと段階/比例モード',
      },
      description: {
        en: 'Use the bottom-center dock to drag the Explode slider (0–100%), click the Play/Pause button to animate disassembly, and toggle between Staged and Linear explode modes.',
        id: 'Gunakan dok bawah-tengah untuk menggeser slider Bongkar (0–100%), klik tombol Play/Pause untuk animasi bongkar-pasang, dan pilih mode Bertahap atau Linear.',
        ja: '画面下部のドックで「分解」スライダー（0〜100%）を動かすか再生ボタンで分解アニメーションを実行します。「段階」と「比例」の2種類の分解方式を切り替えられます。',
      },
    },
    {
      id: 'm3d-bom',
      badge: { en: 'BOM', id: 'BOM', ja: '部品表' },
      title: {
        en: 'Assembly Tree & Part Inspector Sheet',
        id: 'Daftar Komponen & Inspektor Komponen',
        ja: '部品ツリー (BOM) と仕様インスペクタ',
      },
      description: {
        en: 'Click any part in the 3D viewport, a numbered pin, or an item in the right-hand Assembly Tree (BOM) to open the Part Inspector sheet with Material, Function, Failure Modes, Maintenance & Tolerance, and Prev/Next stepping.',
        id: 'Klik komponen di viewport 3D, pin bernomor, atau baris pada Daftar Komponen di kanan untuk membuka lembar Inspektor berisi Material, Fungsi, Mode Kerusakan, Perawatan & Toleransi, serta tombol Prev/Next.',
        ja: '3D上の部品・番号ピン・右側の部品ツリー（BOM）をクリックすると、材質・機能・故障モード・保守公差基準を確認できるインスペクタが開き、「前へ / 次へ」で順送りできます。',
      },
    },
    {
      id: 'm3d-isolate',
      badge: { en: 'Isolate', id: 'Isolasi', ja: '単独表示' },
      title: {
        en: 'Solo Part Isolation',
        id: 'Isolasi Komponen Tunggal',
        ja: '選択部品の3D単独表示',
      },
      description: {
        en: 'Click Isolate Part in 3D inside the Part Inspector (or the expand icon on any BOM row) to inspect a component by itself, then click Exit Solo or Show Full Assembly to restore the full machine.',
        id: 'Klik Isolasi Komponen 3D di dalam Inspektor (atau ikon isolasi pada baris BOM) untuk melihat satu komponen saja, lalu klik Keluar Solo atau Tampilkan Mesin Utuh untuk kembali.',
        ja: 'インスペクタ内の「この部品を単独表示」（またはBOM行のアイコン）で部品単体を拡大確認でき、「全体へ」または「全体表示に戻す」でアセンブリ全体に戻ります。',
      },
    },
    {
      id: 'm3d-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study assembly engineering notes, complete inspection tasks, and take the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk membaca catatan teknik, menyelesaikan tugas inspeksi, dan mengerjakan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で構造解説の確認から理解度チェックまで進められます。',
      },
    },
  ],

  megohmmeter: [
    {
      id: 'meg-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'DC Insulation & Polarization Index',
        id: 'Tahanan Isolasi DC & Indeks Polarisasi',
        ja: 'DC絶縁抵抗・分極指数 (IEEE 43)',
      },
      description: {
        en: 'Diagnose electric motor stator insulation per IEEE 43 by applying a DC test voltage, tracking dielectric absorption over 600 seconds, and applying 40 °C temperature correction.',
        id: 'Diagnosis isolasi stator motor listrik sesuai IEEE 43 dengan memberikan tegangan uji DC, memantau kurva absorpsi dielektrik selama 600 detik, dan menerapkan koreksi suhu 40 °C.',
        ja: 'IEEE 43規格に基づき、DC試験電圧の印加、600秒間の誘電吸収曲線計測、40 °C温度補正によるモータ巻線絶縁診断を行います。',
      },
    },
    {
      id: 'meg-test-timer',
      badge: { en: 'HV Test', id: 'Uji HV', ja: '高圧試験' },
      title: {
        en: 'Start/Stop HV Test & Time Acceleration',
        id: 'Mulai/Henti Uji HV & Akselerasi Waktu',
        ja: '高圧試験制御と時間倍率設定',
      },
      description: {
        en: 'Click Start HV Test / Stop & Discharge in the top bar (or on the tester SVG) to run the test and safely discharge capacitive energy. Use 1×, 10×, or 60× on the R(t) curve header to accelerate the 10-minute PI sweep, or Reset to restart.',
        id: 'Klik Mulai Uji HV / Henti & Buang Muatan di bilah atas (atau pada SVG alat) untuk menguji dan membuang muatan kapasitif. Gunakan 1×, 10×, atau 60× pada grafik R(t) untuk mempercepat uji 10 menit, atau Reset.',
        ja: '上部バーまたは測定器SVG上の「高圧試験開始 / 停止・放電」で試験と自動放電を行います。R(t)曲線ヘッダの「1× / 10× / 60×」で10分間のPI計測を早送りでき、「リセット」で初期化します。',
      },
    },
    {
      id: 'meg-voltage-leads',
      badge: { en: 'Setup', id: 'Pengaturan', ja: '試験設定' },
      title: {
        en: 'DC Test Voltage & Lead Connections',
        id: 'Tegangan Uji DC & Koneksi Kabel Uji',
        ja: 'DC試験電圧と測定端子接続',
      },
      description: {
        en: 'Select DC Test Voltage (250 V, 500 V, 1000 V, 2500 V) and choose Lead Connection (phase-to-ground or phase-to-phase) either from the control panel or directly on the megohmmeter SVG.',
        id: 'Pilih Tegangan Uji DC dan Koneksi Kabel Uji (fasa-ke-ground atau antar-fasa) dari panel kontrol maupun langsung pada SVG megohmmeter.',
        ja: '制御パネルまたは測定器SVG上からDC試験電圧と測定端子接続（対地間・相間）を選択します。',
      },
    },
    {
      id: 'meg-temp-presets',
      badge: { en: 'Conditions', id: 'Kondisi', ja: '温度・状態' },
      title: {
        en: 'Winding Temp & Motor Condition Presets',
        id: 'Suhu Belitan & Prasetel Kondisi Motor',
        ja: '巻線温度補正とモータ巻線状態',
      },
      description: {
        en: 'Drag Winding Temperature (0–80 °C) to see the K_T40 multiplier halve/double insulation resistance every 10 °C, and switch Motor Winding Condition presets to compare clean-dry, moist, contaminated, or damaged windings.',
        id: 'Geser Suhu Belitan (0–80 °C) untuk melihat faktor K_T40, dan pilih prasetel Kondisi Belitan Motor untuk membandingkan isolasi kering bersih, lembap, terkontaminasi, atau rusak.',
        ja: '巻線温度（0〜80 °C）スライダーで10 °Cごとの温度補正係数K_T40を確認し、モータ巻線状態プリセットで乾燥正常・吸湿・汚損・絶縁劣化を比較します。',
      },
    },
    {
      id: 'meg-verdict',
      badge: { en: 'Diagnosis', id: 'Diagnosis', ja: '判定指標' },
      title: {
        en: 'Verdict Banner, R_c40, DAR & PI',
        id: 'Banner Status, R_c40, DAR & PI',
        ja: '合否バナー・R_c40・DAR・PI',
      },
      description: {
        en: 'Read the IEEE 43 Verdict Banner (PASS, QUESTIONABLE, FAIL / DANGER) along with Live R(t), Corrected R_c40 (40°C), DAR (R₆₀ₛ / R₃₀ₛ), and PI (R₁₀ₘ / R₁ₘ) KPI cards.',
        id: 'Baca Banner Status IEEE 43 (LULUS, MERAGUKAN, GAGAL / BAHAYA) beserta kartu Live R(t), Koreksi R_c40 (40°C), DAR (R₆₀ₛ / R₃₀ₛ), dan PI (R₁₀ₘ / R₁ₘ).',
        ja: 'IEEE 43合否判定バナーと、現在抵抗R(t)、40°C補正値R_c40、誘電吸収比DAR（R₆₀ₛ/R₃₀ₛ）、分極指数PI（R₁₀ₘ/R₁ₘ）の各KPIを確認します。',
      },
    },
    {
      id: 'meg-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review IEEE 43 standards, run practice diagnostics, and complete the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari standar IEEE 43, latihan diagnosis, dan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）でIEEE 43基準の復習と演習・クイズに取り組めます。',
      },
    },
  ],

  'motor-basics': [
    {
      id: 'mb-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: '3-Phase Electric Motor Fundamentals',
        id: 'Dasar Motor Listrik 3-Fasa',
        ja: '三相電動機の基礎構造と結線',
      },
      description: {
        en: 'Explore 3-phase motor families, IEC mounting codes, IP enclosure ratings, pole counts, and Star (Y) vs. Delta (Δ) terminal wiring with an interactive 2D CAD cutaway.',
        id: 'Pelajari jenis motor 3-fasa, kode mounting IEC, rating proteksi IP, jumlah kutub, serta pengkabelan terminal Bintang (Y) vs. Segitiga (Δ) pada potongan CAD 2D interaktif.',
        ja: '対話型2D CAD断面図で、三相電動機の種類、IEC取付方式、IP保護等級、極数、スター(Y)・デルタ(Δ)結線の違いを学びます。',
      },
    },
    {
      id: 'mb-architecture',
      badge: { en: 'Hardware', id: 'Konstruksi', ja: '構造・規格' },
      title: {
        en: 'Motor Family, IEC Mounting & IP Rating',
        id: 'Jenis Motor, Mounting IEC & Rating IP',
        ja: '電動機の種類・取付方式・IP保護等級',
      },
      description: {
        en: 'Select an Electric Motor Family, Mounting (B3, B5, B14), and IP Protection (IP54, IP55, IP65). The three guide cards below the cutaway update with efficiency class, IEC 60034-7 mounting fit, and IEC 60529 dust/water protection.',
        id: 'Pilih Jenis Motor Listrik, Tipe Mounting (B3, B5, B14), dan Rating IP (IP54, IP55, IP65). Tiga kartu panduan di bawah gambar akan memperbarui kelas efisiensi, kecocokan IEC 60034-7, dan proteksi IEC 60529.',
        ja: '電動機の種類、取付方式（B3 / B5 / B14）、IP保護等級（IP54 / IP55 / IP65）を選ぶと、下部のガイドカードに効率クラス・IEC 60034-7適合・IEC 60529防塵防水性能が表示されます。',
      },
    },
    {
      id: 'mb-speed',
      badge: { en: 'Speed', id: 'Putaran', ja: '回転速度' },
      title: {
        en: 'Magnetic Poles, Frequency & Rotor Spin',
        id: 'Jumlah Kutub, Frekuensi & Putaran Rotor',
        ja: '極数・電源周波数と回転アニメーション',
      },
      description: {
        en: 'Toggle Magnetic Poles (2P, 4P, 6P) and Supply Frequency (50 Hz or 60 Hz) to see synchronous speed change. Click directly on the motor cutaway SVG to pause or resume rotor spinning.',
        id: 'Pilih Jumlah Kutub (2P, 4P, 6P) dan Frekuensi Listrik (50 Hz atau 60 Hz) untuk melihat perubahan kecepatan sinkron. Klik langsung pada gambar potongan motor untuk menjeda atau memutar rotor.',
        ja: '極数（2P / 4P / 6P）と電源周波数（50 Hz / 60 Hz）を切り替えて同期速度の変化を確認します。断面図SVGをクリックすると回転の停止・再開ができます。',
      },
    },
    {
      id: 'mb-wiring',
      badge: { en: 'Wiring', id: 'Pengkabelan', ja: '結線・計測' },
      title: {
        en: 'Star (Y) vs. Delta (Δ) & Live Telemetry',
        id: 'Bintang (Y) vs. Segitiga (Δ) & Telemetri',
        ja: 'スター(Y)／デルタ(Δ)結線とテレメトリ',
      },
      description: {
        en: 'Switch between Star (Y) — 400V and Delta (Δ) — 230V using the segmented toggle or the SVG terminal box. Inspect Sync / Rated RPM, 4 kW Shaft Torque, Coil Phase (400V Grid), Angular Speed & Slip, and the 400V Rule card.',
        id: 'Ubah koneksi Star (Y) — 400V dan Delta (Δ) — 230V lewat tombol atau kotak terminal SVG. Amati Putaran Sinkron/Terukur, Torsi Poros 4 kW, Tegangan Fasa 400V, Sudut & Slip, serta panduan Aturan 400V.',
        ja: '切替ボタンまたはSVG端子箱でスター(Y) 400Vとデルタ(Δ) 230Vを切り替えます。同期/定格回転数、4 kW軸トルク、相電圧、角速度・すべり、400V電源注意カードを確認できます。',
      },
    },
    {
      id: 'mb-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review motor nameplate theory, complete wiring exercises, and test your knowledge.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari teori pelat nama motor, latihan pengkabelan, dan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で銘板規格の復習から演習・クイズまで進められます。',
      },
    },
  ],

  multimeter: [
    {
      id: 'dmm-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Digital DMM-87V & Analog VOM-20K',
        id: 'Multimeter Digital DMM-87V & Analog VOM-20K',
        ja: 'デジタル(DMM-87V) & アナログ(VOM-20K)',
      },
      description: {
        en: 'Practice electrical measurements across 6 interactive workbench circuits using either an auto-ranging Digital Multimeter or a classic Analog VOM with real fuse-protection logic and continuity beeper.',
        id: 'Latih pengukuran listrik pada 6 skenario rangkaian interaktif menggunakan Multimeter Digital atau Analog VOM lengkap dengan proteksi sekring dan buzzer kontinuitas.',
        ja: 'デジタル／アナログの2種類のマルチメータを使い、6つの回路シナリオで電圧・電流・抵抗・導通ブザー測定とヒューズ保護の仕組みを実習します。',
      },
    },
    {
      id: 'dmm-scenarios',
      badge: { en: 'Circuits', id: 'Sirkuit', ja: '回路選択' },
      title: {
        en: '6 Workbench Scenarios & Circuit Controls',
        id: '6 Skenario Meja Kerja & Kontrol Rangkaian',
        ja: '6つのベンチシナリオと回路操作',
      },
      description: {
        en: 'Select from the 6 scenario tabs at the top. Depending on the circuit, adjust the Potentiometer Ratio slider (5–95%), toggle SW1: ON/OFF, or inject AC Outlet conditions (Normal, Open Neutral, Reverse Polarity).',
        id: 'Pilih salah satu dari 6 tab skenario di atas. Sesuai rangkaian, geser rasio Potensiometer (5–95%), tekan saklar SW1: ON/OFF, atau uji kondisi Stopkontak AC (Normal, Netral Putus, Polaritas Terbalik).',
        ja: '上部の6つのシナリオタブを切り替えます。回路に応じてポテンショメータ比スライダー、SW1 ON/OFFスイッチ、ACコンセント配線状態（正常・中性線断線・極性逆転）を操作できます。',
      },
    },
    {
      id: 'dmm-probes',
      badge: { en: 'Probes', id: 'Probe', ja: 'プローブ' },
      title: {
        en: 'Probe Placement, Jacks & Fuse Protection',
        id: 'Penempatan Probe, Jack & Proteksi Sekring',
        ja: 'プローブ操作・端子選択・ヒューズ保護',
      },
      description: {
        en: 'Use Move Red (+), Move Black (COM), Swap Leads, and Lift Both to place probes on circuit nodes, and toggle Beeper On / Muted. Select Red Test Lead Jack (V-Ω-Hz, mA/µA, 10A); probing voltage on a current jack blows the fuse—click Replace Fuse to recover.',
        id: 'Gunakan Pindah Merah (+), Pindah Hitam (COM), Tukar Probe, dan Angkat Probe untuk mengukur titik uji, serta atur Buzzer Aktif/Bisu. Pilih Jack Kabel Merah; mengukur tegangan pada jack arus akan memutus sekring—klik Ganti Sekring untuk memulihkan.',
        ja: '「赤プローブ移動」「黒プローブ移動」「リード入替」「プローブ解除」で測定点を指定し、ブザーON/ミュートを切り替えられます。赤リード接続端子（V-Ω-Hz / mA・µA / 10A）を誤って電圧測定するとヒューズが溶断するため「ヒューズ交換」で復旧します。',
      },
    },
    {
      id: 'dmm-digital',
      badge: { en: 'Digital', id: 'Digital', ja: 'デジタル' },
      title: {
        en: 'Digital DMM-87V Dial & Softkeys',
        id: 'Selektor & Tombol Digital DMM-87V',
        ja: 'デジタルDMM-87Vのダイヤルと機能',
      },
      description: {
        en: 'In Digital DMM-87V mode, choose a Digital Rotary Dial position (OFF, V~, V⎓, mV, Ω/🔊/⏵|, Hz, mA/A) and use the meter SVG buttons for Hold, Min/Max/Avg, Manual Range, Backlight, and Ω/Continuity/Diode sub-modes.',
        id: 'Pada mode Digital DMM-87V, pilih posisi Selektor Digital (OFF, V~, V⎓, mV, Ω/🔊/⏵|, Hz, mA/A) dan tekan tombol pada SVG meter untuk Hold, Min/Max/Avg, Range, Backlight, serta sub-mode Ω/Kontinuitas/Dioda.',
        ja: 'DMM-87Vモードではデジタルダイヤル（OFF, V~, V⎓, mV, Ω/🔊/⏵|, Hz, mA/A）を選び、本体ボタンでHold、Min/Max/Avg、Range、バックライト、Ω/導通/ダイオード切替を操作できます。',
      },
    },
    {
      id: 'dmm-analog',
      badge: { en: 'Analog', id: 'Analog', ja: 'アナログ' },
      title: {
        en: 'Analog VOM-20K Range & Zero Ω Adj',
        id: 'Rentang Analog VOM-20K & Zero Ω Adj',
        ja: 'アナログVOM-20Kのレンジと0Ω調整',
      },
      description: {
        en: 'Switch to Analog VOM-20K to select fixed voltage, current, or resistance ranges (AC 250V down to Ω ×1/×100/×10k and DC mA), and fine-tune needle alignment with the Zero Ω Adj slider (-3° to +3°).',
        id: 'Beralih ke Analog VOM-20K untuk memilih rentang tetap tegangan, arus, atau resistansi (AC 250V hingga Ω ×1/×100/×10k dan DC mA), serta kalibrasi jarum dengan slider Zero Ω Adj (-3° hingga +3°).',
        ja: 'VOM-20Kに切り替えるとAC/DC電圧・電流・抵抗レンジ（Ω ×1/×100/×10k等）を選択でき、「Zero Ω Adj」スライダー（-3°〜+3°）で指針のゼロ点調整が行えます。',
      },
    },
    {
      id: 'dmm-fault',
      badge: { en: 'Fault Hunt', id: 'Cari Gangguan', ja: '故障診断' },
      title: {
        en: 'Guided Fault Diagnosis Challenge',
        id: 'Tantangan Diagnosis Gangguan Terpandu',
        ja: '故障診断チャレンジ',
      },
      description: {
        en: 'Open the Fault scenario, probe test points TP1–TP4, pick the root cause from the fault list, and click Verify Diagnosis. Click New Fault anytime to generate a fresh troubleshooting puzzle.',
        id: 'Buka skenario Gangguan, ukur titik uji TP1–TP4, pilih akar masalah dari daftar, lalu klik Periksa Diagnosis. Klik Gangguan Baru untuk mencoba kasus baru.',
        ja: '故障診断シナリオでTP1〜TP4を測定し、原因候補を選んで「診断を確認」を押します。「新しい故障」ボタンで何度でも新しい問題に挑戦できます。',
      },
    },
    {
      id: 'dmm-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study measurement safety, complete circuit labs, and pass the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari keselamatan ukur, latihan sirkuit, dan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で測定安全の理論から演習・クイズまで進められます。',
      },
    },
  ],

  'oil-grease-basics': [
    {
      id: 'ogb-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Industrial Oil & Grease Fundamentals',
        id: 'Dasar Oli Industri & Gemuk (Grease)',
        ja: '産業用潤滑油・グリースの基礎',
      },
      description: {
        en: 'Learn how ISO 3448 viscosity grades behave with temperature (ASTM D341), how NLGI consistency grades classify greases (ASTM D217), and why mixing incompatible thickeners causes bearing failure (ASTM D6185).',
        id: 'Pelajari perilaku viskositas ISO 3448 terhadap suhu (ASTM D341), kelas konsistensi gemuk NLGI (ASTM D217), serta risiko pencampuran pengental yang tidak kompatibel (ASTM D6185).',
        ja: 'ISO 3448粘度グレードの温度特性（ASTM D341）、NLGIちょう度（ASTM D217）、および異種グリース増ちょう剤の混和適合性（ASTM D6185）を学びます。',
      },
    },
    {
      id: 'ogb-modes',
      badge: { en: 'Modes', id: 'Mode', ja: 'モード' },
      title: {
        en: 'Two Lab Modes & Reset',
        id: 'Dua Mode Lab & Tombol Reset',
        ja: '2つのラボモードと初期化',
      },
      description: {
        en: 'Switch between Mode 1: Industrial Oil & Viscosity and Mode 2: Grease NLGI & Compatibility in the top bar, or click Reset Lab to restore the current mode to defaults.',
        id: 'Beralih antara Mode 1: Jenis Oli & Viskositas dan Mode 2: Gemuk NLGI & Kompatibilitas di bilah atas, atau klik Reset Lab untuk mengatur ulang mode aktif.',
        ja: '上部バーで「モード1: 産業用潤滑油と粘度」と「モード2: グリースちょう度と混和適合性」を切り替え、「ラボを初期化」で初期値に戻せます。',
      },
    },
    {
      id: 'ogb-oil-helper',
      badge: { en: 'Oil Selection', id: 'Pilih Oli', ja: '油種選定' },
      title: {
        en: 'Machine Helper, Oil Family & ISO VG',
        id: 'Panduan Mesin, Keluarga Oli & ISO VG',
        ja: '機械別推奨・油ファミリー・ISO VG',
      },
      description: {
        en: 'In Mode 1, click any machine in Beginner Helper: Which Oil for This Machine? to auto-load the recommended family, ISO VG, and rationale—or manually choose an Industrial Oil Family and ISO VG grade button.',
        id: 'Di Mode 1, klik mesin pada Panduan Pemula untuk memuat jenis oli, ISO VG, dan alasan pemilihan secara otomatis—atau pilih Keluarga Oli Industri dan tombol ISO VG secara manual.',
        ja: 'モード1では「初心者ガイド: 機械別推奨オイル自動選定」から推奨油種と選定根拠を自動読込でき、産業用潤滑油ファミリーやISO VGボタンを手動選択することも可能です。',
      },
    },
    {
      id: 'ogb-oil-temp',
      badge: { en: 'Viscosity', id: 'Viskositas', ja: '粘度変化' },
      title: {
        en: 'Operating Temp & Viscosity Reference Table',
        id: 'Suhu Operasi & Tabel Referensi Viskositas',
        ja: '運転温度スライダーと動粘度比較表',
      },
      description: {
        en: 'Drag Operating Temperature (10–90 °C, noting the ISO 40°C REF badge) to watch Operating Viscosity (cSt), ISO 3448 Tolerance, Viscosity Index (VI), and the CAD visualizer update alongside the multi-temperature reference table.',
        id: 'Geser Suhu Operasi (10–90 °C, perhatikan label ISO 40°C REF) untuk memantau Viskositas Operasi (cSt), Toleransi ISO 3448, Indeks Viskositas (VI), visualisasi CAD, dan tabel referensi suhu.',
        ja: '運転流体温度スライダー（10〜90 °C、40 °C基準バッジ表示）を動かすと、運転時動粘度（cSt）・ISO 3448公差・粘度指数（VI）・CAD図と温度別動粘度早見表が連動します。',
      },
    },
    {
      id: 'ogb-grease',
      badge: { en: 'Grease', id: 'Gemuk', ja: 'グリース' },
      title: {
        en: 'NLGI Grades & 2-Grease Compatibility',
        id: 'Kelas NLGI & Kompatibilitas 2-Gemuk',
        ja: 'NLGIちょう度と2種グリース混和試験',
      },
      description: {
        en: 'In Mode 2, click NLGI 000–3 buttons to compare worked penetration (mm/10) and texture analogies. Then pick Grease 1 (Existing) and Grease 2 (New) thickeners to test Compatible, Caution, or Incompatible outcomes and dropping points.',
        id: 'Di Mode 2, klik tombol NLGI untuk membandingkan penetrasi tertempa (mm/10) dan analogi tekstur. Lalu pilih pengental Gemuk 1 dan Gemuk 2 untuk menguji status Kompatibilitas dan titik tetesnya.',
        ja: 'モード2ではNLGIボタンで混和針入度と硬さの例えを比較し、「グリース1（既存）」と「グリース2（追加）」の増ちょう剤を選んで混和適合性（適合/注意/不適合）と滴点を確認します。',
      },
    },
    {
      id: 'ogb-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study lubricant standards, practice selection scenarios, and complete the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari standar pelumas, latihan pemilihan, dan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で潤滑規格の学習から演習・クイズまで進められます。',
      },
    },
  ],

  pneumatic: [
    {
      id: 'pneu-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Pneumatic Cutaway & ISO 1219 Lab',
        id: 'Potongan Pneumatik & Sirkuit ISO 1219',
        ja: '空気圧CAD断面 & ISO 1219回路ラボ',
      },
      description: {
        en: 'Simulate compressed-air circuits with synchronized 2D CAD cutaway animation, ISO 1219 schematics, real-time displacement-step charting, air consumption costing, and plant fault troubleshooting.',
        id: 'Simulasikan sirkuit udara bertekanan dengan animasi potongan CAD 2D, skema ISO 1219, grafik langkah-perpindahan, perhitungan biaya udara, dan pemecahan gangguan pabrik.',
        ja: '2D CAD断面アニメーション、ISO 1219回路図、変位-ステップ線図、空気消費コスト計算、設備異常診断を統合した空気圧シミュレータです。',
      },
    },
    {
      id: 'pneu-modes',
      badge: { en: 'Workspace', id: 'Area Kerja', ja: 'モード選択' },
      title: {
        en: 'Pre-built Circuits vs. Interactive Builder',
        id: 'Sirkuit Prasetel vs. Perakit Interaktif',
        ja: 'プリセット回路と回路ビルダー',
      },
      description: {
        en: 'Choose Pre-built Circuits to load 5 industrial presets from the dropdown, or switch to Interactive Builder to add ISO 1219 components, drag them on the grid, click two ports to connect air lines, click a line to delete, or Clear Canvas.',
        id: 'Pilih Sirkuit Prasetel untuk memuat 5 rangkaian industri, atau beralih ke Perakit Interaktif untuk menambah komponen ISO 1219, menyeret posisi, menghubungkan dua port, menghapus jalur, atau Clear Canvas.',
        ja: '「プリセット回路」で5種類の標準回路を読み込むか、「回路ビルダー」でISO 1219部品の追加・ドラッグ配置・ポート間配管・配線削除・全消去を行えます。',
      },
    },
    {
      id: 'pneu-views',
      badge: { en: 'Visualizer', id: 'Tampilan', ja: '表示・作動' },
      title: {
        en: 'Cutaway / ISO Views & Valve Actuation',
        id: 'Tampilan CAD / ISO & Aktuasi Katup',
        ja: '表示モード切替と弁の作動操作',
      },
      description: {
        en: 'In Presets mode, switch between 2D CAD Cutaway, ISO 1219 Circuit, and Cutaway + ISO Split. Click SOL 14 / SOL 12 or EXTEND / RETRACT in the cutaway—or click 3/2 pushbuttons and 5/2 valves on the ISO schematic—to shift spools.',
        id: 'Pada mode Prasetel, pilih Potongan CAD 2D, Sirkuit ISO 1219, atau Gabungan CAD + ISO. Klik SOL 14 / SOL 12 atau EXTEND / RETRACT di potongan CAD—atau klik tombol 3/2 dan katup 5/2 di skema ISO—untuk menggerakkan silinder.',
        ja: 'プリセットモードでは「2D CAD断面図」「ISO 1219回路図」「断面+ISO分割」を切り替えられます。断面図のSOL 14/12やEXTEND/RETRACT、または回路図の3/2・5/2弁をクリックして作動させます。',
      },
    },
    {
      id: 'pneu-inspector',
      badge: { en: 'Tuning', id: 'Pengaturan', ja: 'パラメータ' },
      title: {
        en: 'Supply, Bore & Component Inspector',
        id: 'Suplai, Bore & Inspektor Komponen',
        ja: '供給圧・シリンダ内径・部品設定',
      },
      description: {
        en: 'Toggle Compressor ON/OFF, adjust Supply (1–10 bar) and Bore (20–100 mm), or Reset. Click any ISO component to open the Component Inspector: tune Flow Control Throttle Opening %, toggle Latching Pushbutton, link a Limit Switch, or adjust Rod Diameter.',
        id: 'Atur Kompresor ON/OFF, geser Suplai (1–10 bar) dan Bore (20–100 mm), atau Reset. Klik komponen ISO untuk membuka Inspektor Komponen: atur bukaan FCV %, saklar Latching, tautan Limit Switch, atau diameter batang torak.',
        ja: 'コンプレッサON/OFF、供給圧（1〜10 bar）、内径（20〜100 mm）を調整できます。回路図上の部品をクリックすると、部品インスペクタでFCV開度%、押ボタンラッチ、リミットSW連動、ロッド径を設定できます。',
      },
    },
    {
      id: 'pneu-faults',
      badge: { en: 'Faults', id: 'Gangguan', ja: '異常診断' },
      title: {
        en: 'Plant Faults & Blind Fault Challenge',
        id: 'Gangguan Pabrik & Tantangan Uji Buta',
        ja: '設備異常とブラインド異常診断',
      },
      description: {
        en: 'Inject Healthy, Clogged FRL Filter, Leaking 5/2 Pilot Line, or Stuck Meter-Out FCV to study failure symptoms—or click Blind Fault Challenge to diagnose a hidden fault from FRL ΔP, spool response, and NL/min air flow.',
        id: 'Aktifkan Normal, Filter FRL Tersumbat, Jalur Pilot 5/2 Bocor, atau FCV Meter-Out Macet untuk mengamati gejala—atau klik Tantangan Uji Buta untuk mendiagnosis gangguan tersembunyi.',
        ja: '「正常」「FRLフィルタ詰まり」「5/2パイロット漏れ」「メータアウトFCV固着」を切り替えて症状を学ぶか、「ブラインド異常診断」で差圧・動作速度・空気消費量から故障原因を特定します。',
      },
    },
    {
      id: 'pneu-telemetry',
      badge: { en: 'Telemetry', id: 'Telemetri', ja: '計測・コスト' },
      title: {
        en: 'Displacement Chart, Force & Energy Cost',
        id: 'Grafik Langkah, Gaya & Biaya Energi',
        ja: '変位線図・推力・空気消費コスト',
      },
      description: {
        en: 'Track live stroke motion on the Displacement-Step Chart (with Clear), Chamber A/B pressures and Live Net Force in Cylinder Telemetry, and Total Air Flow (NL/min), Energy Cost ($/hr & $/yr), and FRL Gauge (In → Out) in Air Consumption & Cost.',
        id: 'Pantau gerakan langkah pada Grafik Perpindahan, tekanan Ruang A/B dan Gaya Bersih di Telemetri Silinder, serta Total Aliran Udara (NL/min), Biaya Energi ($/jam & $/tahun), dan Pengukur FRL.',
        ja: '変位-ステップ線図（クリア可）、シリンダ計測値（A/B室圧力・実効推力）、空気消費量・エネルギーコスト（NL/min・$/hr・$/yr・FRL入口→出口圧力）をリアルタイムで監視できます。',
      },
    },
    {
      id: 'pneu-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study ISO 1219 symbols, build circuits in Practice, and complete the Quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari simbol ISO 1219, merakit sirkuit di Practice, dan menyelesaikan Quiz.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）でISO 1219記号の学習から回路演習・クイズまで進められます。',
      },
    },
  ],

  pump: [
    {
      id: 'pump-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Centrifugal Pump & Seal Hydraulics',
        id: 'Hidrolika Pompa Sentrifugal & Seal',
        ja: '遠心ポンプ性能・キャビテーション・シール',
      },
      description: {
        en: 'Operate an interactive centrifugal pump test rig with live H-Q, efficiency, and NPSH curves, parallel pump staging, VFD POR auto-tuning, and API 682 mechanical seal flush selection.',
        id: 'Operasikan rig uji pompa sentrifugal dengan kurva H-Q, efisiensi, dan NPSH langsung, operasi pompa paralel, auto-tune VFD POR, serta pemilihan rencana flush seal API 682.',
        ja: '遠心ポンプ試験装置とH-Q・効率・NPSH性能曲線を連動させ、並列運転、VFD自動最適化、API 682メカニカルシールフラッシュ選定を学びます。',
      },
    },
    {
      id: 'pump-presets',
      badge: { en: 'Scenarios', id: 'Skenario', ja: 'シナリオ' },
      title: {
        en: 'Operating Scenarios & Parallel Pumps',
        id: 'Skenario Operasi & Pompa Paralel',
        ja: '運転シナリオと並列運転切替',
      },
      description: {
        en: 'Click any Scenarios preset in the top bar to jump to healthy BEP, cavitation, dead-head, low-flow, or runout states, or toggle Single Pump (1×) vs. Parallel (2×) in Rig Controls. Click Reset anytime to restore defaults.',
        id: 'Klik prasetel Skenario di bilah atas untuk menguji kondisi BEP sehat, kavitasi, dead-head, aliran rendah, atau runout, dan pilih Pompa Tunggal (1×) vs. Paralel (2×). Klik Reset untuk kembali ke awal.',
        ja: '上部バーのシナリオボタンで正常BEP・キャビテーション・締切運転・低流量・過大流量を再現でき、運転パラメータ内の「単独運転 (1×) / 並列運転 (2×)」で台数制御を比較できます。',
      },
    },
    {
      id: 'pump-controls',
      badge: { en: 'Rig Controls', id: 'Kontrol Rig', ja: '運転操作' },
      title: {
        en: 'Speed, Valve, Trim, Suction & Temp',
        id: 'Putaran, Katup, Trim, Hisap & Suhu',
        ja: '回転数・吐出弁・トリム・吸込・温度',
      },
      description: {
        en: 'Adjust Impeller Speed (900–2900 RPM), Discharge Valve Opening (0–100%), Impeller Trim Diameter (85–100%), Suction Tank Head (-4.5 to +6.0 m), and Fluid Temperature (10–95 °C) while watching the 6 KPI cards and Diagnostic Alert Banner.',
        id: 'Geser Kecepatan Impeler (900–2900 RPM), Bukaan Katup Buang (0–100%), Diameter Trim Impeler (85–100%), Head Tangki Hisap (-4,5 hingga +6,0 m), dan Suhu Fluida (10–95 °C) sambil memantau 6 kartu KPI dan banner peringatan.',
        ja: 'インペラ回転数（900〜2900 RPM）、吐出弁開度（0〜100%）、インペラ外径トリム（85〜100%）、吸込タンク液位（-4.5〜+6.0 m）、流体温度（10〜95 °C）を調整し、6つのKPIと警告バナーを確認します。',
      },
    },
    {
      id: 'pump-vfd',
      badge: { en: 'Pump Curve', id: 'Kurva Pompa', ja: '性能曲線' },
      title: {
        en: 'H-Q Curve & VFD Auto-Tune (POR)',
        id: 'Kurva H-Q & Auto-Tune VFD (POR)',
        ja: 'H-Q曲線とVFD自動調整 (POR)',
      },
      description: {
        en: 'Inspect the live Pump & System Curve canvas, enter a Target Flow (15–160 m³/h) or click a flow point on the curve, and click VFD Auto-Tune (POR) to set the optimal RPM with a 100% open valve and compare kW power savings.',
        id: 'Amati kanvas Kurva Pompa & Sistem, masukkan Target Aliran (15–160 m³/h) atau klik titik pada kurva, lalu tekan Auto-Tune VFD (POR) untuk menyetel RPM optimal dengan katup terbuka penuh dan melihat penghematan daya kW.',
        ja: '性能曲線キャンバス上の流量点をクリックするか目標流量（15〜160 m³/h）を入力し、「VFD自動調整 (POR)」を押すと吐出弁全開での最適RPMと省エネkW削減効果が表示されます。',
      },
    },
    {
      id: 'pump-seal',
      badge: { en: 'Seal & Shaft', id: 'Seal & Poros', ja: 'シール寿命' },
      title: {
        en: 'Radial Load, Seal Life & API 682 Plan',
        id: 'Beban Radial, Umur Seal & Rencana API 682',
        ja: '軸荷重・シール寿命とAPI 682選定',
      },
      description: {
        en: 'Monitor the In POR / Outside POR badge, Radial Shaft Load (%), Estimated Seal & Bearing Life Index (%), and the automatic API 682 Mechanical Seal Flush recommendation (Plan 11, Plan 21, or Plan 53).',
        id: 'Pantau status Dalam/Di Luar POR, Beban Radial Poros (%), Indeks Estimasi Umur Seal & Bantalan (%), serta rekomendasi otomatis Rencana Flush Seal API 682 (Plan 11, Plan 21, atau Plan 53).',
        ja: 'POR範囲内/外バッジ、ラジアル軸荷重（%）、推定シール・軸受寿命指数（%）、および運転条件に応じたAPI 682フラッシュプラン（Plan 11 / 21 / 53）の自動判定を確認します。',
      },
    },
    {
      id: 'pump-workflow',
      badge: { en: 'Learning', id: 'Belajar', ja: '学習手順' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Explore, Practice & Quiz',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review affinity laws and NPSH theory, solve practice scenarios, and pass the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari hukum afinitas dan NPSH, berlatih skenario, dan mengikuti kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で相似則・NPSH理論の学習から演習・クイズまで進められます。',
      },
    },
  ],
};
