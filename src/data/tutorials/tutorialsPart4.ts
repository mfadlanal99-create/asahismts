import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_4: Record<string, TutorialStep[]> = {
  'rigging-lifting': [
    {
      id: 'rigging-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'ASME B30.9 Rigging & Hoisting Safety',
        id: 'Keselamatan Rigging & Pengangkatan ASME B30.9',
        ja: 'ASME B30.9 玉掛け・揚重安全シミュレータ',
      },
      description: {
        en: 'Welcome! This lab models two-leg sling geometry, hitch efficiency, Center-of-Gravity (CoG) alignment, and load tilt on lift-off. Let’s walk through every control and safety diagnostic.',
        id: 'Selamat datang! Laboratorium ini memodelkan geometri sling dua kaki, efisiensi ikatan (hitch), kesejajaran Pusat Gravitasi (CoG), dan kemiringan beban saat terangkat. Mari telusuri setiap kontrol dan diagnostik keselamatannya.',
        ja: 'ようこそ！2本吊りスリングの幾何学、ヒッチ効率、重心（CoG）芯出し、地切り時の傾きを解析します。各機能と安全診断を順番に確認しましょう。',
      },
      tip: {
        en: 'Keep horizontal sling angles at 60° or steeper whenever headroom allows to minimize leg tension and horizontal pinch.',
        id: 'Pertahankan sudut sling horizontal ≥ 60° apabila ruang bebas vertikal mencukupi untuk meminimalkan tegangan kaki sling dan gaya jepit horizontal.',
        ja: '揚程に余裕がある限り、対水平スリング角度を 60° 以上に保ち、脚張力と水平圧縮力を抑えましょう。',
      },
    },
    {
      id: 'rigging-presets',
      badge: { en: 'Feature 1 · Presets', id: 'Fitur 1 · Preset', ja: '機能1 · プリセット' },
      title: {
        en: 'Equipment Hoisting Presets',
        id: 'Preset Peralatan Angkat',
        ja: '機器揚重プリセット',
      },
      description: {
        en: 'Pick one of the four Equipment Hoisting Presets (showing mass in tonnes, default θ, and CoG offset) to load realistic industrial lifts—such as symmetric pumps or offset-CoG compressors.',
        id: 'Pilih salah satu dari empat Preset Peralatan Angkat (menampilkan massa dalam ton, sudut θ bawaan, dan pergeseran CoG) untuk memuat skenario pengangkatan industri nyata—seperti pompa simetris atau kompresor dengan CoG tidak simetris.',
        ja: '4つの機器揚重プリセット（質量 t・初期角度 θ・CoG偏心を表示）から、対称ポンプや偏心コンプレッサなどの実機シナリオを選択します。',
      },
      targetSelector: '[data-tour="rigging-presets"]',
    },
    {
      id: 'rigging-angle',
      badge: { en: 'Feature 2 · Sling Angle', id: 'Fitur 2 · Sudut Sling', ja: '機能2 · スリング角度' },
      title: {
        en: 'Horizontal Sling Angle θ & Spreader Beam',
        id: 'Sudut Sling Horizontal θ & Spreader Beam',
        ja: '対水平スリング角度 θ と天秤ビーム',
      },
      description: {
        en: 'Adjust Horizontal Sling Angle θ (25°–75°) with the slider or quick-jump buttons (25°, 30°, 45°, 60°, 75°). Click "+ Spreader Beam" to keep sling legs vertical (90°) and eliminate horizontal pinch.',
        id: 'Atur Sudut Sling Horizontal θ (25°–75°) melalui penggeser atau tombol cepat (25°, 30°, 45°, 60°, 75°). Klik "+ Spreader Beam" untuk menjaga kaki sling tetap vertikal (90°) dan menghilangkan gaya jepit horizontal.',
        ja: 'スライダーまたはクイックボタン（25°/30°/45°/60°/75°）で角度 θ を変更します。「+ 天秤ビーム比較」を押すと吊り脚が垂直（90°）になり水平圧縮力がゼロになります。',
      },
      tip: {
        en: 'At θ = 30°, leg tension doubles (2.000×) compared to a vertical lift.',
        id: 'Pada θ = 30°, tegangan kaki sling berlipat dua (2,000×) dibandingkan pengangkatan vertikal.',
        ja: 'θ = 30° では垂直吊りの2倍（2.000×）の張力が各脚に作用します。',
      },
      faqs: [
        {
          q: {
            en: 'When should I use a spreader beam?',
            id: 'Kapan spreader beam perlu digunakan?',
            ja: '天秤ビーム（スプレッダービーム）はいつ使いますか？',
          },
          a: {
            en: 'Use a spreader beam when headroom is limited, when θ drops below 45°, or when lifting thin-walled equipment that cannot resist horizontal pinch compression.',
            id: 'Gunakan spreader beam saat ruang bebas atas terbatas, sudut θ turun di bawah 45°, atau saat mengangkat peralatan berdinding tipis yang tidak tahan terhadap gaya tekan jepit horizontal.',
            ja: '揚程が限られる場合や角度が45°未満になる場合、また水平圧縮力に弱い薄肉機器を吊る際に使用します。',
          },
          keywords: ['spreader', 'beam', 'angle', 'pinch', 'headroom'],
        },
      ],
      targetSelector: '[data-tour="rigging-angle"]',
    },
    {
      id: 'rigging-hitch-wll',
      badge: { en: 'Feature 3 · Hitch & WLL', id: 'Fitur 3 · Ikatan & WLL', ja: '機能3 · ヒッチとWLL' },
      title: {
        en: 'Hitch Configuration (η) & Sling Rated WLL',
        id: 'Konfigurasi Ikatan (η) & Kapasitas WLL Sling',
        ja: '玉掛けヒッチ方式（η）と基本使用荷重（WLL）',
      },
      description: {
        en: 'Select the Hitch Configuration (showing efficiency multiplier η) and choose one of the four color-coded Sling Rated Vertical WLL buttons. Effective WLL multiplies rated WLL by η.',
        id: 'Pilih Konfigurasi Ikatan (menampilkan faktor efisiensi η) dan tentukan salah satu dari empat tombol WLL Vertikal Terukur Sling berkode warna. WLL Efektif merupakan hasil perkalian WLL terukur dengan η.',
        ja: '玉掛けヒッチ方式（効率係数 η を表示）と4段階の色分けされたスリング基本使用荷重（WLL）ボタンを選択します。実効 WLL は定格 WLL × η として計算されます。',
      },
      targetSelector: '[data-tour="rigging-hitch-wll"]',
    },
    {
      id: 'rigging-cog-hook',
      badge: { en: 'Feature 4 · CoG & Hook', id: 'Fitur 4 · CoG & Hook', ja: '機能4 · 重心とフック' },
      title: {
        en: 'CoG Offset, Hook Alignment & Payload Mass',
        id: 'Pergeseran CoG, Kesejajaran Hook & Massa Beban',
        ja: '重心オフセット・フック芯出し・質量',
      },
      description: {
        en: 'Drag CoG Offset (-30% to +30%), Crane Hook Horizontal Position, and Payload Mass (0.5–8.0 t) to observe unequal leg sharing and load tilt. Click "Align Hook Over CoG" to plumb the hook for a 0° level lift.',
        id: 'Atur Pergeseran CoG (-30% hingga +30%), Posisi Horizontal Hook, dan Massa Beban (0,5–8,0 t) untuk mengamati ketimpangan pembagian beban kaki dan kemiringan beban. Klik "Luruskan Hook ke CoG" untuk menyejajarkan hook tepat di atas CoG agar pengangkatan datar 0°.',
        ja: '重心オフセット・フック水平位置・吊り荷質量を動かして脚荷重の不均衡と傾斜を確認します。「フックを重心真上へ芯出し」で水平揚重（0°）に合わせられます。',
      },
      targetSelector: '[data-tour="rigging-cog-hook"]',
    },
    {
      id: 'rigging-canvas',
      badge: { en: 'Feature 5 · 2D Rigging Canvas', id: 'Fitur 5 · Tampilan 2D', ja: '機能5 · 2D揚重図' },
      title: {
        en: 'Live Overhead Crane & Sling Geometry SVG',
        id: 'Diagram SVG Overhead Crane & Geometri Sling Secara Langsung',
        ja: 'ライブ天井クレーン・スリング幾何図',
      },
      description: {
        en: 'Inspect the 2D hoisting rig: watch sling color coding, leg tension arrows, horizontal pinch vectors, CoG plumb line, and real-time load tilt on lift-off.',
        id: 'Amati sistem pengangkatan 2D: perhatikan kode warna sling, panah tegangan kaki, vektor gaya jepit horizontal, garis proyeksi vertikal CoG, dan kemiringan beban secara langsung saat terangkat.',
        ja: '2D揚重図でスリング等級色、脚張力ベクトル、水平圧縮力、重心垂線、地切り時の傾きをリアルタイムに確認できます。',
      },
      targetSelector: '[data-tour="rigging-canvas"]',
    },
    {
      id: 'rigging-telemetry',
      badge: { en: 'Feature 6 · Telemetry', id: 'Fitur 6 · Telemetri', ja: '機能6 · テレメトリ' },
      title: {
        en: 'WLL Utilization %, Angle Factor & Shackle Sizing',
        id: 'Utilisasi WLL %, Faktor Sudut & Ukuran Shackle',
        ja: 'WLL稼働率・角度倍率・推奨シャックル',
      },
      description: {
        en: 'Monitor Leg 1 & Leg 2 WLL Utilization bars, Angle Factor & Horizontal Pinch force, Required Headroom H, and the automatically sized Shackle Recommendation.',
        id: 'Pantau bilah Utilisasi WLL Kaki 1 & Kaki 2, Faktor Sudut & Gaya Jepit Horizontal, Kebutuhan Ruang Bebas Tinggi H, serta Rekomendasi Ukuran Shackle otomatis.',
        ja: '脚1・脚2のWLL稼働率バー、角度倍率と水平圧縮力、必要揚程 H、最大脚張力に基づく推奨シャックルを確認できます。',
      },
      targetSelector: '[data-tour="rigging-telemetry"]',
    },
    {
      id: 'rigging-angle-table',
      badge: { en: 'Feature 7 · Angle Table', id: 'Fitur 7 · Tabel Sudut', ja: '機能7 · 角度係数表' },
      title: {
        en: 'ASME B30.9 1 / sin θ Load Factor Reference',
        id: 'Tabel Referensi Faktor Beban 1 / sin θ ASME B30.9',
        ja: 'ASME B30.9 1/sin θ 張力係数テーブル',
      },
      description: {
        en: 'Compare your active angle θ against ASME B30.9 zones: Optimal (≥60°), Caution (45°), Critical (30°), and Forbidden (<30°).',
        id: 'Bandingkan sudut θ aktif terhadap zona ASME B30.9: Optimal (≥60°), Waspada (45°), Kritis (30°), dan Dilarang (<30°).',
        ja: '現在の角度 θ がASME B30.9の推奨（≥60°）・注意（45°）・限界（30°）・禁止（<30°）のどのゾーンにあるか一目で比較できます。',
      },
      targetSelector: '[data-tour="rigging-angle-table"]',
    },
    {
      id: 'rigging-safety-banner',
      badge: { en: 'Feature 8 · Troubleshoot', id: 'Fitur 8 · Diagnosis Masalah', ja: '機能8 · トラブル対策' },
      title: {
        en: 'ASME B30.9 Alarm & Troubleshooting Banner',
        id: 'Panel Peringatan & Penanganan Masalah ASME B30.9',
        ja: 'ASME B30.9 警報・トラブルシューティング',
      },
      description: {
        en: 'Watch the top Safety Status Banner: it stays green when safe and raises Caution or Danger alarms for low sling angles (θ ≤ 30°), WLL overloads (>100%), or off-plumb hook misalignment. Troubleshoot by steepening θ, enabling a Spreader Beam, upgrading WLL, or aligning the hook over CoG.',
        id: 'Pantau Panel Status Keselamatan di bagian atas: berwarna hijau saat aman, serta memicu peringatan Waspada atau Bahaya untuk sudut sling rendah (θ ≤ 30°), beban berlebih WLL (>100%), atau ketidakselarasan posisi hook terhadap CoG. Atasi masalah dengan memperbesar θ, mengaktifkan Spreader Beam, menaikkan kapasitas WLL, atau meluruskan hook ke atas CoG.',
        ja: '上部の安全ステータスバナーは、低角度（θ ≤ 30°）、WLL超過（>100%）、フック芯ずれを検知すると注意・危険警報を表示します。角度改善、天秤ビーム使用、WLL増加、芯出しで警報を解消しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why is my leg WLL utilization > 100% even though payload < rated WLL?',
            id: 'Mengapa utilisasi WLL kaki sling melebihi 100% padahal massa beban lebih kecil dari WLL terukur?',
            ja: '吊り荷質量が定格WLL未満なのに稼働率が100%を超えるのはなぜ？',
          },
          a: {
            en: 'Three factors amplify leg tension: low sling angle θ (1/sin θ), reduced choker hitch efficiency (η = 0.75×), and off-center CoG shifting most of the weight onto one leg.',
            id: 'Tiga faktor memperbesar tegangan kaki sling: sudut sling rendah θ (faktor 1/sin θ), penurunan efisiensi ikatan choker (η = 0,75×), serta pergeseran CoG yang memusatkan sebagian besar beban pada salah satu kaki.',
            ja: '低角度による張力倍率（1/sin θ）、チョーカー吊りによる効率低下（η=0.75×）、重心偏心による片側脚への荷重集中が重なるためです。',
          },
          keywords: ['overload', 'wll', '100%', 'choker', 'cog', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="rigging-safety-banner"]',
    },
    {
      id: 'rigging-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice solving rigging load-factor and CoG problems, and the Quiz tab.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal faktor beban dan CoG, serta tab Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、玉掛け計算の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'screw-conveyor': [
    {
      id: 'screw-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'CEMA 350 Screw Conveyor Lab',
        id: 'Lab Konveyor Ulir CEMA 350',
        ja: 'CEMA 350 スクリューコンベヤ概要',
      },
      description: {
        en: 'Welcome! This simulator models bulk solids transport inside a helical auger trough using CEMA 350 equations—tracking mass flow, torque, power, hanger bearing heat, and jam risk.',
        id: 'Selamat datang! Simulator ini memodelkan pengangkutan material curah di dalam palung ulir heliks menggunakan persamaan CEMA 350—memantau laju aliran massa, torsi, daya penggerak, kenaikan suhu bantalan gantung, dan risiko kemacetan.',
        ja: 'ようこそ！CEMA 350工学式に基づき、スクリューオーガーによる粉粒体搬送の流量、トルク、動力、軸受温度、閉塞リスクを解析します。',
      },
      tip: {
        en: 'Higher trough fill (e.g. 95%) boosts capacity only until bridging and torque spikes occur.',
        id: 'Tingkat pengisian palung yang tinggi (misalnya 95%) hanya meningkatkan kapasitas hingga batas tertentu sebelum memicu penyumbatan (bridging) dan lonjakan torsi.',
        ja: '高充填率（95%等）は閉塞とトルク急増のリスクを伴うため、材料特性に応じた推奨充填率を守りましょう。',
      },
    },
    {
      id: 'screw-material',
      badge: { en: 'Feature 1 · Bulk Material', id: 'Fitur 1 · Material Curah', ja: '機能1 · 搬送物設定' },
      title: {
        en: 'Bulk Material Presets',
        id: 'Preset Material Curah',
        ja: '搬送物プリセット',
      },
      description: {
        en: 'Select a Bulk Material pill (Grain, Cement, Limestone, Woodchips, or Sand) above the cutaway SVG to auto-load its bulk density ρ, material factor Fm, and recommended trough fill.',
        id: 'Pilih tombol Material Curah (Biji-bijian, Semen, Batu Kapur, Serpihan Kayu, atau Pasir) di atas diagram potongan SVG untuk memuat densitas curah ρ, faktor material Fm, dan tingkat pengisian palung yang direkomendasikan secara otomatis.',
        ja: '図の上部の搬送物ボタン（穀物・セメント・石灰石・木質チップ・砂）でかさ密度 ρ、材料係数 Fm、推奨充填率を一括設定できます。',
      },
      targetSelector: '[data-tour="screw-material"]',
    },
    {
      id: 'screw-canvas',
      badge: { en: 'Feature 2 · Cutaway SVG', id: 'Fitur 2 · Penampang SVG', ja: '機能2 · 断面アニメーション' },
      title: {
        en: 'Live Helical Auger Cutaway & Flow Animation',
        id: 'Penampang Ulir Heliks & Animasi Aliran Secara Langsung',
        ja: 'スクリュー断面・搬送アニメーション',
      },
      description: {
        en: 'Observe the rotating helical flights, intermediate hanger bearings, trough fill height, radial clearance carryback, and thermal/jam indicators in real time.',
        id: 'Amati putaran daun ulir heliks, bantalan gantung antara (hanger bearing), ketinggian isi palung, aliran balik pada celah radial, serta indikator panas berlebih dan kemacetan secara langsung.',
        ja: '回転するスクリュー羽根、中間ハンガー軸受、トラフ充填高さ、隙間の逆流、過熱・閉塞状態をリアルタイムに観察できます。',
      },
      targetSelector: '[data-tour="screw-canvas"]',
    },
    {
      id: 'screw-geometry',
      badge: { en: 'Feature 3 · Auger Geometry', id: 'Fitur 3 · Geometri Ulir', ja: '機能3 · オーガー幾何諸元' },
      title: {
        en: 'Screw Diameter, Pitch Mode & Clearances',
        id: 'Diameter Ulir, Mode Kisar (Pitch) & Celah Radial',
        ja: 'スクリュー外径・ピッチモード・隙間設定',
      },
      description: {
        en: 'In Group 1 (Auger Geometry), adjust Screw Diameter D (150–600 mm) and Center Pipe dₚ. Choose a Pitch Mode—Std (1.0D), Half (0.67D), or Short (0.5D)—or drag Pitch P, Length L, and Radial Clearance.',
        id: 'Pada Grup 1 (Geometri Ulir), atur Diameter Ulir D (150–600 mm) dan Diameter Pipa Poros dₚ. Pilih Mode Pitch—Standar (1,0D), 2/3 (0,67D), atau Pendek (0,5D)—atau sesuaikan Pitch P, Panjang L, dan Celah Radial.',
        ja: 'グループ1でスクリュー外径 D（150〜600 mm）と中心軸パイプ径 dₚ を設定します。ピッチモード（標準・2/3・短）やピッチ P、全長 L、隙間を調整できます。',
      },
      targetSelector: '[data-tour="screw-geometry"]',
    },
    {
      id: 'screw-operating',
      badge: { en: 'Feature 4 · Operating & Fill', id: 'Fitur 4 · Operasi & Pengisian', ja: '機能4 · 充填率と運転条件' },
      title: {
        en: 'Trough Fill %, Speed & Incline',
        id: 'Persentase Pengisian Palung, Putaran & Kemiringan',
        ja: 'トラフ充填率・回転数・傾斜設定',
      },
      description: {
        en: 'In Group 2, click Trough Loading Fill % (15%, 30%, 45%, or 95%), adjust Speed (10–120 RPM), and tilt Incline θ (0°–45°) to see how inclination factor Kθ and fill affect capacity and torque.',
        id: 'Pada Grup 2, pilih Persentase Pengisian Palung (15%, 30%, 45%, atau 95%), atur Kecepatan Putar (10–120 RPM), dan Sudut Kemiringan θ (0°–45°) untuk mengamati pengaruh faktor kemiringan Kθ serta tingkat pengisian terhadap kapasitas dan torsi.',
        ja: 'グループ2でトラフ充填率（15/30/45/95%）、回転数（10〜120 RPM）、傾斜 θ（0°〜45°）を変更し、傾斜係数 Kθ や充填率の影響を確認します。',
      },
      targetSelector: '[data-tour="screw-operating"]',
    },
    {
      id: 'screw-factors',
      badge: { en: 'Feature 5 · CEMA Factors', id: 'Fitur 5 · Faktor CEMA', ja: '機能5 · CEMA係数' },
      title: {
        en: 'Bulk Density ρ, Material Fm & Bearing Fb',
        id: 'Densitas Curah ρ, Faktor Material Fm & Bantalan Fb',
        ja: 'かさ密度 ρ・材料係数 Fm・軸受係数 Fb',
      },
      description: {
        en: 'Fine-tune Bulk Density ρ (300–2000 kg/m³), Material Factor Fm (0.4–2.5), and Hanger Bearing Factor Fb (1.0–4.4) to model custom bulk solids or worn bearing friction.',
        id: 'Sesuaikan Densitas Curah ρ (300–2000 kg/m³), Faktor Material Fm (0,4–2,5), dan Faktor Bantalan Gantung Fb (1,0–4,4) untuk memodelkan material curah khusus atau gesekan bantalan yang aus.',
        ja: 'かさ密度 ρ（300〜2000 kg/m³）、材料係数 Fm（0.4〜2.5）、軸受係数 Fb（1.0〜4.4）を微調整し、任意粉体や軸受摩擦の影響を解析できます。',
      },
      targetSelector: '[data-tour="screw-factors"]',
    },
    {
      id: 'screw-telemetry',
      badge: { en: 'Feature 6 · Telemetry', id: 'Fitur 6 · Telemetri', ja: '機能6 · テレメトリ' },
      title: {
        en: 'Six Live CEMA 350 Telemetry KPIs',
        id: 'Enam Indikator Kinerja (KPI) Telemetri CEMA 350',
        ja: '6つのライブCEMA 350テレメトリKPI',
      },
      description: {
        en: 'Monitor Mass/Vol Flow, Torque/Axial Speed, Drive Power/Current, Axial Thrust/Deflection, Hanger Bearings temp, and Shear/Jam Risk with carryback %.',
        id: 'Pantau Laju Aliran Massa/Volumetrik, Torsi/Kecepatan Aksial, Daya/Arus Motor Penggerak, Gaya Aksial/Defleksi Poros, Suhu Bantalan Gantung, serta Risiko Geser/Kemacetan beserta persentase aliran balik.',
        ja: '質量流量・トルク・所要動力・スラスト/たわみ・軸受温度・閉塞リスク/逆流率の6つのKPIをリアルタイムで監視できます。',
      },
      targetSelector: '[data-tour="screw-telemetry"]',
    },
    {
      id: 'screw-faults',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis Masalah', ja: '機能7 · 故障診断' },
      title: {
        en: 'Fault Injection & CEMA 350 Troubleshooting',
        id: 'Simulasi Gangguan & Penanganan Masalah CEMA 350',
        ja: '故障注入とCEMA 350トラブルシューティング',
      },
      description: {
        en: 'Inject faults in the top Fault Mode bar: Hanger Bearing Overheat (>115°C), Flight Abrasion / Carryback (+14 mm clearance loss), or Overfill / Torque Jam (2.65× torque surge). Read the CEMA 350 Engineering Diagnostic panel below to identify the root cause, then click "Clear Fault" to restore Normal Run.',
        id: 'Simulasikan gangguan pada bilah Mode Gangguan di bagian atas: Bantalan Gantung Panas Berlebih (>115°C), Keausan Daun Ulir / Aliran Balik (penambahan celah +14 mm), atau Pengisian Berlebih / Kemacetan Torsi (lonjakan torsi 2,65×). Baca panel Diagnostik Teknik CEMA 350 di bawah untuk mengidentifikasi akar masalah, lalu klik "Hapus Gangguan" untuk memulihkan operasi normal.',
        ja: '上部の故障モードバーで「ハンガー軸受過熱」「羽根摩耗・逆流」「過充填・トルク急増」を発生させ、下部の工学診断パネルで原因を特定できます。「故障解除」で正常運転へ戻ります。',
      },
      faqs: [
        {
          q: {
            en: 'How do I tell flight abrasion from an overfill jam?',
            id: 'Bagaimana cara membedakan keausan daun ulir dari kemacetan akibat pengisian berlebih?',
            ja: '羽根摩耗と過充填閉塞はどう見分けますか？',
          },
          a: {
            en: 'Flight abrasion widens radial clearance (+14 mm), raising carryback % and dropping net throughput. Overfill jam spikes drive torque (2.65×), motor current, and shear/jam risk above 75%.',
            id: 'Keausan daun ulir memperlebar celah radial (+14 mm), sehingga meningkatkan persentase aliran balik dan menurunkan kapasitas angkut bersih. Sebaliknya, kemacetan akibat pengisian berlebih menyebabkan lonjakan torsi penggerak (2,65×), arus motor, dan risiko kemacetan di atas 75%.',
            ja: '羽根摩耗は隙間拡大（+14mm）により逆流率が増え正味流量が落ちます。過充填閉塞はトルク2.65倍急増と過負荷電流・閉塞リスク上昇を引き起こします。',
          },
          keywords: ['abrasion', 'overfill', 'jam', 'carryback', 'torque', 'fault'],
        },
      ],
      targetSelector: '[data-tour="screw-faults"]',
    },
    {
      id: 'screw-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice sizing an inclined feeder, and the CEMA 350 Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan perhitungan kapasitas konveyor miring, dan Kuis CEMA 350.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、CEMA 350の理解を深めましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'thermal-expansion': [
    {
      id: 'thermal-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Thermal Expansion, Shrink Fit & Bimetallic Lab',
        id: 'Lab Ekspansi Termal, Suaian Susut & Bimetal',
        ja: '熱膨張・焼きばめ・バイメタル工学ラボ',
      },
      description: {
        en: 'Welcome! Explore how temperature changes drive free strain, restrained thermal stress, shrink-fit interference pressure, and Timoshenko bimetallic bending across a live 2D CAD viewport.',
        id: 'Selamat datang! Pelajari bagaimana perubahan suhu menimbulkan regangan bebas, tegangan termal terkekang, tekanan kontak suaian susut, serta kelengkungan bimetal Timoshenko pada tampilan CAD 2D secara langsung.',
        ja: 'ようこそ！温度変化が自由熱膨張、拘束熱応力、焼きばめ接触面圧、ティモシェンコ・バイメタル曲率に与える影響を2D CAD図で体験します。',
      },
      tip: {
        en: 'When thermal expansion is blocked by a rigid abutment, strain converts directly into compressive stress σ = E·α·ΔT.',
        id: 'Apabila pemuaian termal terhalang oleh penahan kaku, regangan termal langsung berubah menjadi tegangan tekan σ = E·α·ΔT.',
        ja: '熱膨張が剛体壁で拘束されると、ひずみはそのまま圧縮熱応力 σ = E·α·ΔT へと変換されます。',
      },
    },
    {
      id: 'thermal-modes',
      badge: { en: 'Feature 1 · Lab Modes', id: 'Fitur 1 · Mode Lab', ja: '機能1 · 3つのモード' },
      title: {
        en: 'Three Thermal Mechanics Modes',
        id: 'Tiga Mode Mekanika Termal',
        ja: '3つの熱力学モード切替',
      },
      description: {
        en: 'Switch between three modules: 1. Bar & Restrained Stress, 2. Shrink Fit Hub-on-Shaft (Lamé thick-cylinder), and 3. Bimetallic Thermostat.',
        id: 'Beralihlah di antara tiga modul: 1. Batang & Tegangan Terkekang, 2. Suaian Susut Hub-pada-Poros (teori silinder tebal Lamé), dan 3. Termostat Bimetal.',
        ja: '「1. 棒膨張・熱応力拘束」「2. 軸・ハブ焼きばめ（ラメ理論）」「3. バイメタル素子」の3モジュールを切り替えられます。',
      },
      targetSelector: '[data-tour="thermal-modes"]',
    },
    {
      id: 'thermal-presets',
      badge: { en: 'Feature 2 · Presets & Export', id: 'Fitur 2 · Preset & Ekspor', ja: '機能2 · プリセットと出力' },
      title: {
        en: 'Scenario Presets, Reset & CSV Export',
        id: 'Preset Skenario, Reset & Ekspor CSV',
        ja: 'シナリオプリセット・リセット・CSV出力',
      },
      description: {
        en: 'Load classic industrial scenarios from the Preset dropdown, click Reset to restore mode defaults, or click CSV to export the active mode’s parameters and results.',
        id: 'Muat skenario industri klasik melalui daftar pilihan Preset, klik Reset untuk mengembalikan nilai bawaan modul, atau klik CSV untuk mengekspor parameter dan hasil perhitungan modul aktif.',
        ja: 'プリセットから実務シナリオを読み込んだり、リセットで初期値に戻したり、CSVボタンで計算データを出力できます。',
      },
      targetSelector: '[data-tour="thermal-presets"]',
    },
    {
      id: 'thermal-canvas',
      badge: { en: 'Feature 3 · 2D CAD View', id: 'Fitur 3 · Tampilan CAD', ja: '機能3 · 2D CAD可視化' },
      title: {
        en: 'Live 2D Thermal Deformation & Contact SVG',
        id: 'Diagram SVG Deformasi Termal & Kontak 2D Secara Langsung',
        ja: 'ライブ2D熱変形・接触CAD図',
      },
      description: {
        en: 'Watch real-time bar elongation against abutment gaps (Mode 1), hub bore expansion over shaft interference (Mode 2), or bimetallic strip curvature toward the trip contact (Mode 3).',
        id: 'Amati pemanjangan batang terhadap celah penahan (Mode 1), pemuaian lubang hub terhadap interferensi poros (Mode 2), atau kelengkungan bilah bimetal menuju kontak pemutus (Mode 3) secara langsung.',
        ja: '棒の伸びと壁当接（モード1）、ハブ内径膨張と嵌合隙間（モード2）、バイメタルの湾曲と接点動作（モード3）をリアルタイム表示します。',
      },
      targetSelector: '[data-tour="thermal-canvas"]',
    },
    {
      id: 'thermal-controls',
      badge: { en: 'Feature 4 · Thermal Controls', id: 'Fitur 4 · Kontrol Termal', ja: '機能4 · パラメータ調整' },
      title: {
        en: 'Materials, Temperature & Geometry Controls',
        id: 'Kontrol Material, Suhu & Geometri',
        ja: '材料・温度・寸法パラメータ調整',
      },
      description: {
        en: 'Adjust material alloys, operating temperature ΔT, dimensions, expansion gaps (Mode 1), hub interference δ (Mode 2), or bimetallic layer thicknesses and contact trip gap (Mode 3).',
        id: 'Sesuaikan jenis paduan material, selisih suhu operasi ΔT, dimensi, celah ekspansi (Mode 1), interferensi hub δ (Mode 2), atau ketebalan lapisan bimetal serta celah kontak pemutus (Mode 3).',
        ja: '材料、温度差 ΔT、寸法、膨張隙間（モード1）、しまりばめ量 δ（モード2）、バイメタル層厚・接点隙間（モード3）を調整できます。',
      },
      targetSelector: '[data-tour="thermal-controls"]',
    },
    {
      id: 'thermal-telemetry',
      badge: { en: 'Feature 5 · Troubleshoot', id: 'Fitur 5 · Diagnosis Masalah', ja: '機能5 · 限界診断' },
      title: {
        en: 'Yield, Clearance & Trip Diagnostics',
        id: 'Diagnostik Batas Luluh, Celah & Pemutusan Sakelar',
        ja: '降伏・隙間・トリップ異常診断',
      },
      description: {
        en: 'Use the 4 telemetry cards to troubleshoot failures: check if Thermal Stress exceeds Yield (red—add expansion gap δ_gap or lower ΔT), whether Hot Clearance is TIGHT (increase Hub Heating ΔT above Min Req), whether Hub Von Mises SF warns of Plastic Yield (reduce δ or thicken D₀), or when Bimetallic Switch Status trips CLOSED.',
        id: 'Gunakan 4 kartu telemetri untuk mendiagnosis kegagalan: periksa apakah Tegangan Termal melampaui Batas Luluh (indikator merah—perbesar celah δ_gap atau turunkan ΔT), apakah Celah Panas berstatus KURANG PANAS / TIGHT (naikkan Pemanasan Hub ΔT di atas nilai Minimum yang Disyaratkan), apakah Faktor Keamanan Von Mises Hub memperingatkan Luluh Plastis (kurangi δ atau perbesar D₀), atau pantau status pemutusan sakelar bimetal.',
        ja: '4つのテレメトリカードで異常を診断できます。熱応力の降伏超過（隙間増加またはΔT低減）、加熱不足（必要ΔT以上へ加熱）、ハブ塑性降伏警告（δ低減またはD₀拡大）、バイメタルのトリップ状態を特定し対策しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'How do I fix "TIGHT (NEED HEAT)" in Shrink Fit mode?',
            id: 'Bagaimana cara mengatasi status "KURANG PANAS" (TIGHT) pada mode Suaian Susut?',
            ja: '焼きばめモードの「加熱不足」はどう解消しますか？',
          },
          a: {
            en: 'Increase Hub Heating ΔT above the "Min Req" value shown under the slider so thermal expansion of the hub bore exceeds the diametral interference δ.',
            id: 'Naikkan Pemanasan Hub ΔT melampaui nilai batas minimum ("Min Req") yang tertera di bawah penggeser agar pemuaian termal lubang hub melebihi interferensi diametral δ.',
            ja: 'スライダー下の「Min Req（必要最小温度差）」以上にハブ加熱温度差 ΔT を上げ、内径膨張量がしまりばめ量 δ を上回るようにします。',
          },
          keywords: ['tight', 'need heat', 'shrink fit', 'clearance', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="thermal-telemetry"]',
    },
    {
      id: 'thermal-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice thermal strain and shrink-fit problems, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal regangan termal dan suaian susut, serta Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、熱力学の計算力を定着させましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'utm-testing': [
    {
      id: 'utm-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Universal Testing Machine (ASTM E8 / E9)',
        id: 'Mesin Uji Universal (ASTM E8 / E9)',
        ja: '万能試験機（ASTM E8 / E9）ラボ',
      },
      description: {
        en: 'Welcome! Simulate tensile (ASTM E8) and compression (ASTM E9) testing on a 2D load frame with real-time Stress–Strain curves, specimen necking/fracture, and extracted ASTM properties.',
        id: 'Selamat datang! Simulasikan pengujian tarik (ASTM E8) dan tekan (ASTM E9) pada rangka pembebanan 2D yang dilengkapi kurva Tegangan–Regangan secara langsung, fenomena penyempitan setempat (necking) hingga patah spesimen, serta ekstraksi sifat mekanis standar ASTM.',
        ja: 'ようこそ！2D負荷フレームで引張（ASTM E8）および圧縮（ASTM E9）試験を再現し、応力-ひずみ線図、ネッキング・破断、ASTM材料定数の同定を行います。',
      },
      tip: {
        en: 'Close the safety door on the load frame and run at 2x–4x Sim Speed to watch elastic vs. plastic necking clearly.',
        id: 'Tutup pintu pengaman pada rangka beban dan jalankan pada Kecepatan Simulasi 2x–4x agar transisi dari fase elastis hingga necking plastis terlihat jelas.',
        ja: '負荷フレームの安全扉を閉じ、2x〜4xの再生速度で弾性域からネッキング・破断までの挙動を観察しましょう。',
      },
    },
    {
      id: 'utm-specimen',
      badge: { en: 'Feature 1 · Mode & Material', id: 'Fitur 1 · Mode & Material', ja: '機能1 · 試験モードと材料' },
      title: {
        en: 'Tensile / Compression & Specimen Material',
        id: 'Uji Tarik / Tekan & Material Spesimen',
        ja: '引張/圧縮切替と試験片材料',
      },
      description: {
        en: 'Toggle between Tensile (ASTM E8) and Compression (ASTM E9), and choose a preset metal/polymer or "★ Custom Material Mode..." to enter custom E, σy, UTS, and %EL.',
        id: 'Beralihlah antara uji Tarik (ASTM E8) dan Tekan (ASTM E9), lalu pilih logam/polimer preset atau "★ Mode Material Kustom..." untuk memasukkan nilai E, σy, UTS, dan %EL secara mandiri.',
        ja: '「引張 (ASTM E8)」と「圧縮 (ASTM E9)」を切り替え、標準材料または「★ カスタム材料モード...」で E・σy・UTS・%EL を自由に設定します。',
      },
      targetSelector: '[data-tour="utm-specimen"]',
    },
    {
      id: 'utm-geometry',
      badge: { en: 'Feature 2 · Dimensions', id: 'Fitur 2 · Dimensi', ja: '機能2 · 試験片寸法' },
      title: {
        en: 'Specimen Diameter Ø & Gauge Length L₀',
        id: 'Diameter Spesimen Ø & Panjang Ukur L₀',
        ja: '試験片直径 Ø と標点間距離 L₀',
      },
      description: {
        en: 'Adjust Diameter Ø (6.0–20.0 mm) and Gauge Length L₀ (25–100 mm). The badge updates cross-sectional area A₀ (mm²), showing how geometry scales force F for the same stress σ.',
        id: 'Sesuaikan Diameter Ø (6,0–20,0 mm) dan Panjang Ukur L₀ (25–100 mm). Indikator akan memperbarui luas penampang A₀ (mm²) secara otomatis untuk menunjukkan pengaruh geometri terhadap gaya F pada tegangan σ yang sama.',
        ja: '直径 Ø（6.0〜20.0 mm）と標点間距離 L₀（25〜100 mm）を設定すると断面積 A₀ が自動計算され、同じ応力に対する荷重 F の違いを確認できます。',
      },
      targetSelector: '[data-tour="utm-geometry"]',
    },
    {
      id: 'utm-controls',
      badge: { en: 'Feature 3 · Speed & Run', id: 'Fitur 3 · Kecepatan & Pengujian', ja: '機能3 · 速度と試験制御' },
      title: {
        en: 'Crosshead Speed, Run, Mount & CSV',
        id: 'Kecepatan Crosshead, Mulai, Pasang & CSV',
        ja: 'クロスヘッド速度・開始・装填・CSV',
      },
      description: {
        en: 'Set Crosshead Speed (1–50 mm/min), click Start Test (or Pause/Restart), Mount a clean specimen (wrench), Reset to zero, or Export CSV test data.',
        id: 'Atur Kecepatan Crosshead (1–50 mm/menit), klik Mulai Uji (atau Jeda/Ulangi), Pasang spesimen baru (ikon kunci pas), Reset ke posisi nol, atau Ekspor data uji ke CSV.',
        ja: 'クロスヘッド速度（1〜50 mm/min）を設定して「試験開始」を押します。新品試験片の装填、ゼロ位置リセット、CSVデータ出力も行えます。',
      },
      targetSelector: '[data-tour="utm-controls"]',
    },
    {
      id: 'utm-frame',
      badge: { en: 'Feature 4 · Load Frame', id: 'Fitur 4 · Rangka Beban', ja: '機能4 · 負荷フレーム' },
      title: {
        en: 'Interactive UTM Load Frame & Safety Door',
        id: 'Rangka Beban UTM Interaktif & Pintu Pengaman',
        ja: '対話型UTM負荷フレームと安全扉',
      },
      description: {
        en: 'Operate the UTM directly on the 2D machine SVG: click the on-machine Start/Pause, E-Stop, and Reset buttons, toggle the safety door, or cycle "2x/4x/8x Sim Speed" at the top right.',
        id: 'Operasikan UTM langsung pada diagram SVG mesin 2D: klik tombol Start/Pause, E-Stop, dan Reset pada konsol mesin, buka/tutup pintu pengaman, atau ubah kecepatan simulasi ("Sim Speed" 2x/4x/8x) di pojok kanan atas.',
        ja: '2D試験機SVG上のコンソールで開始/一時停止・非常停止・リセットや安全扉の開閉を操作でき、右上の「2x/4x/8x Sim Speed」も切り替えられます。',
      },
      targetSelector: '[data-tour="utm-frame"]',
    },
    {
      id: 'utm-telemetry',
      badge: { en: 'Feature 5 · Readouts', id: 'Fitur 5 · Pembacaan', ja: '機能5 · ライブ計測値' },
      title: {
        en: 'Live Load, Displacement, Stress & Strain',
        id: 'Pembacaan Gaya, Perpanjangan, Tegangan & Regangan Secara Langsung',
        ja: '荷重・変位・公称応力・ひずみカード',
      },
      description: {
        en: 'Monitor instantaneous Force F (kN), Displacement ΔL (mm), Engineering Stress σ (MPa), and Engineering Strain ε (%) as the crosshead pulls or compresses the specimen.',
        id: 'Pantau Gaya F (kN), Perpanjangan ΔL (mm), Tegangan Teknik σ (MPa), dan Regangan Teknik ε (%) secara seketika saat crosshead menarik atau menekan spesimen.',
        ja: '試験中の荷重 F (kN)、変位 ΔL (mm)、公称応力 σ (MPa)、公称ひずみ ε (%) をリアルタイムで追跡できます。',
      },
      targetSelector: '[data-tour="utm-telemetry"]',
    },
    {
      id: 'utm-charts',
      badge: { en: 'Feature 6 · Live Chart', id: 'Fitur 6 · Grafik Langsung', ja: '機能6 · ライブ線図' },
      title: {
        en: 'Stress–Strain & Force–Elongation Curve',
        id: 'Kurva Tegangan–Regangan & Gaya–Perpanjangan',
        ja: '応力-ひずみ／荷重-伸びリアルタイム線図',
      },
      description: {
        en: 'Switch between Stress–Strain and Force–Elongation plots to locate the proportional limit, 0.2% offset yield point, UTS peak, and fracture point.',
        id: 'Beralihlah antara grafik Tegangan–Regangan dan Gaya–Perpanjangan untuk mengidentifikasi batas proporsional, titik luluh offset 0,2%, puncak UTS, dan titik patah.',
        ja: '「Stress–Strain」と「Force–Elongation」を切り替え、比例限度・0.2%耐力・引張強さ（UTS）・破断点を視覚的に確認できます。',
      },
      targetSelector: '[data-tour="utm-charts"]',
    },
    {
      id: 'utm-results',
      badge: { en: 'Feature 7 · ASTM Matrix', id: 'Fitur 7 · Matriks ASTM', ja: '機能7 · ASTM材料定数' },
      title: {
        en: 'Extracted Material Properties (ASTM E8 / E9)',
        id: 'Ekstraksi Sifat Mekanis Material (ASTM E8 / E9)',
        ja: '同定材料定数マトリックス',
      },
      description: {
        en: 'Inspect all 8 extracted properties: Modulus E, Yield Rp0.2, UTS/UCS, Peak Force Fmax, Elongation %EL, Reduction of Area %RA, Resilience Ur, and Toughness UT.',
        id: 'Periksa ke-8 sifat mekanis hasil ekstraksi: Modulus Elastisitas E, Tegangan Luluh Rp0,2, UTS/UCS, Gaya Maksimum Fmax, Perpanjangan %EL, Reduksi Penampang %RA, Resiliensi Ur, dan Ketangguhan UT.',
        ja: 'ヤング率 E・0.2%耐力・UTS/UCS・最大荷重・破断伸び %EL・絞り率 %RA・レジリエンス Ur・破壊じん性 UT の8指標を確認できます。',
      },
      targetSelector: '[data-tour="utm-results"]',
    },
    {
      id: 'utm-estop',
      badge: { en: 'Feature 8 · Troubleshoot', id: 'Fitur 8 · Diagnosis Masalah', ja: '機能8 · 非常停止診断' },
      title: {
        en: 'Emergency Stop & Safety Interlock Recovery',
        id: 'Penghenti Darurat (E-Stop) & Pemulihan Interlock Keselamatan',
        ja: '非常停止ボタンと安全インターロック解除',
      },
      description: {
        en: 'Click the red Emergency Stop button to cut crosshead drive power and trigger the top interlock banner. Troubleshoot an unresponsive Start Test button by checking for the red E-Stop banner and clicking "Release E-Stop" (or ensuring a specimen is mounted).',
        id: 'Klik tombol merah Emergency Stop untuk memutus daya penggerak crosshead dan mengaktifkan panel interlock di bagian atas. Jika tombol Mulai Uji tidak aktif, periksa panel merah E-Stop dan klik "Lepas E-Stop" (atau pastikan spesimen baru telah terpasang).',
        ja: '赤い非常停止ボタンで駆動電源を遮断しインターロック警報をテストできます。「試験開始」が押せない場合は上部の非常停止バナーで「非常停止解除」をクリックして復帰させましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why is the Start Test button disabled?',
            id: 'Mengapa tombol Mulai Uji tidak dapat ditekan (nonaktif)?',
            ja: '「試験開始」ボタンが押せないのはなぜですか？',
          },
          a: {
            en: 'If Emergency Stop was triggered, click "Release E-Stop" on the red top banner. Also verify a clean specimen is mounted using the wrench button.',
            id: 'Apabila Emergency Stop aktif, klik "Lepas E-Stop" pada panel merah di bagian atas. Pastikan pula spesimen baru telah terpasang menggunakan tombol ikon kunci pas.',
            ja: '非常停止インターロックが作動している場合は上部赤バナーの「非常停止解除」を押してください。また、破断後は新品装填ボタンで試験片を再装填してください。',
          },
          keywords: ['disabled', 'start', 'estop', 'emergency', 'interlock', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="utm-estop"]',
    },
    {
      id: 'utm-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice stress–strain calculations, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan perhitungan kurva tegangan-regangan, dan Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、材料試験の知識を仕上げましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'valve-packing': [
    {
      id: 'valve-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Valve Stuffing Box & Stem Packing Lab',
        id: 'Lab Kotak Paking (Stuffing Box) & Paking Batang Katup',
        ja: 'バルブグランドパッキン・保全ラボ',
      },
      description: {
        en: 'Welcome! This cutaway simulator models the trade-off between fugitive emissions sealing and stem friction in industrial valves. Let’s walk through presets, controls, readouts, and fault diagnostics.',
        id: 'Selamat datang! Simulator penampang melintang ini memodelkan kompromi antara penyegelan kebocoran emisi proses (fugitive emissions) dan gesekan batang pada katup industri. Mari telusuri preset, kontrol, pembacaan, dan diagnostik gangguannya.',
        ja: 'ようこそ！工業用バルブのグランドパッキンにおける漏洩防止とステム摩擦のトレードオフを断面図で再現します。プリセット、操作、計測値、故障診断を順に確認しましょう。',
      },
      tip: {
        en: 'Over-tightening gland nuts stops leaks but causes stem binding, actuator hunting, and stem scoring.',
        id: 'Mengencangkan mur penekan (gland nut) secara berlebihan memang menghentikan kebocoran, tetapi memicu kemacetan batang katup, osilasi aktuator (hunting), dan keausan gores pada batang.',
        ja: 'グランドナットの締め過ぎは漏洩を止めますが、ステム固着やハンチング、かじりの原因になります。',
      },
    },
    {
      id: 'valve-presets',
      badge: { en: 'Feature 1 · Scenarios', id: 'Fitur 1 · Skenario', ja: '機能1 · シナリオ' },
      title: {
        en: 'Quick Scenario Presets & Reset',
        id: 'Preset Skenario Cepat & Reset',
        ja: 'シナリオプリセットとリセット',
      },
      description: {
        en: 'Use the top Scenarios bar to jump between Optimal Seal, Fugitive Leak, Stem Binding, Passing Seat / Trap, and Worn Packing, or click Reset to return to the baseline optimal control valve.',
        id: 'Gunakan bilah Skenario di bagian atas untuk beralih antara Segel Optimal, Kebocoran Emisi Proses, Batang Katup Macet, Kebocoran Dudukan / Steam Trap, dan Paking Aus, atau klik Reset untuk kembali ke kondisi katup kontrol optimal awal.',
        ja: '上部のシナリオボタンで「最適シール」「グランド漏洩」「ステム固着」「シート・トラップ漏れ」「パッキン摩耗」をワンクリックで再現でき、リセットで初期状態に戻せます。',
      },
      targetSelector: '[data-tour="valve-presets"]',
    },
    {
      id: 'valve-canvas',
      badge: { en: 'Feature 2 · Cutaway SVG', id: 'Fitur 2 · Penampang SVG', ja: '機能2 · 断面アニメーション' },
      title: {
        en: 'Interactive Valve & Stuffing Box Cutaway',
        id: 'Penampang Melintang Katup & Stuffing Box Interaktif',
        ja: 'バルブ＆スタフィングボックス断面図',
      },
      description: {
        en: 'Inspect the live cross-section showing gland follower compression, braided packing rings, stem movement, fugitive leak plumes, and downstream seat/trap blow-by.',
        id: 'Amati penampang melintang secara langsung yang menampilkan penekanan gland follower, susunan cincin paking anyam, pergerakan batang katup, kepulan kebocoran emisi proses, serta aliran bocor (blow-by) pada dudukan/steam trap.',
        ja: 'グランドフォロアの圧縮、編組パッキンリング、ステム上下動、漏洩ガス、下流シート・トラップの吹き抜けを断面図で観察できます。',
      },
      targetSelector: '[data-tour="valve-canvas"]',
    },
    {
      id: 'valve-controls',
      badge: { en: 'Feature 3 · Valve & Gland', id: 'Fitur 3 · Katup & Gland', ja: '機能3 · 弁と締付操作' },
      title: {
        en: 'Valve Type, Fluid Service, Gland Torque & Wear',
        id: 'Jenis Katup, Layanan Fluida, Torsi Gland & Keausan',
        ja: 'バルブ形式・流体・締付トルク・摩耗',
      },
      description: {
        en: 'Select Valve Type and Fluid Service, then adjust Valve Opening (0–100%), Line Pressure (1–25 bar), Gland Follower Nut Torque (5–80 N·m), and Packing Ring Wear Cycles (0–100k).',
        id: 'Pilih Jenis Katup dan Layanan Fluida, lalu atur Bukaan Katup (0–100%), Tekanan Saluran (1–25 bar), Torsi Mur Penekan Gland (5–80 N·m), dan Siklus Keausan Paking (0–100 ribu siklus).',
        ja: 'バルブ形式と対象流体を選び、開度・ライン圧力・グランドナット締付トルク・パッキン摩耗回数を調整します。',
      },
      targetSelector: '[data-tour="valve-controls"]',
    },
    {
      id: 'valve-readouts',
      badge: { en: 'Feature 4 · Live Readouts', id: 'Fitur 4 · Pembacaan Langsung', ja: '機能4 · ライブ計測値' },
      title: {
        en: 'Flow, Stem Friction, EPA M21 & Seat Leak Cards',
        id: 'Kartu Aliran, Gesekan Batang, EPA M21 & Kebocoran Dudukan',
        ja: '流量・摩擦・EPA M21漏洩・シート漏れカード',
      },
      description: {
        en: 'Monitor Flow Rate (Q), Stem Friction (N) & Gland Force, Packing Leak (mL/min & EPA M21 ppm), and Seat Leakage (L/h) with Steam Trap cycle status.',
        id: 'Pantau Laju Aliran (Q), Gesekan Batang (N) & Gaya Tekan Gland, Kebocoran Paking (mL/menit & EPA M21 ppm), serta Kebocoran Dudukan (L/jam) beserta status siklus Steam Trap.',
        ja: '流量 Q、ステム摩擦力・押付力、パッキン漏洩量（EPA M21 ppm）、シート漏れ（L/h）とトラップ作動状態をリアルタイムで確認できます。',
      },
      targetSelector: '[data-tour="valve-readouts"]',
    },
    {
      id: 'valve-diagnostics',
      badge: { en: 'Feature 5 · Flow & Friction Curves', id: 'Fitur 5 · Kurva Diagnostik', ja: '機能5 · 特性曲線パネル' },
      title: {
        en: 'Inherent Cv Curve & Torque-vs-Leakage Window',
        id: 'Kurva Karakteristik Cv & Rentang Operasi Torsi vs Kebocoran',
        ja: '固有Cv特性曲線とトルク・漏洩最適域',
      },
      description: {
        en: 'Examine the Inherent Valve Flow Characteristic Curve alongside the Gland Torque operating window to keep fugitive emissions below 500 ppm EPA M21 without binding the stem.',
        id: 'Periksa Kurva Karakteristik Aliran Bawaan Katup beserta rentang operasi Torsi Gland untuk menjaga kebocoran emisi proses tetap di bawah ambang 500 ppm EPA M21 tanpa menyebabkan batang katup macet.',
        ja: '固有流量特性曲線とグランドトルク最適域を確認し、EPA M21（500 ppm以下）を満たしつつステム固着を避ける締付範囲を見極めます。',
      },
      targetSelector: '[data-tour="valve-diagnostics"]',
    },
    {
      id: 'valve-faults',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnosis Masalah', ja: '機能6 · 故障注入診断' },
      title: {
        en: 'Steam Trap / Seat Fault Injection & Troubleshooting',
        id: 'Simulasi Gangguan & Penanganan Masalah Steam Trap / Dudukan',
        ja: 'トラップ・シート故障注入とトラブルシューティング',
      },
      description: {
        en: 'Use the Steam Trap / Seat Fault Injection dropdown to inject Under-Tightened Packing Leak, Over-Tightened Stem Binding, or Passing Seat / Blowing Steam Trap. Troubleshoot by reading the Maintenance Status banner and tuning Gland Torque (or replacing worn packing/seat) until status returns green.',
        id: 'Gunakan daftar pilihan Simulasi Gangguan Steam Trap / Dudukan untuk menguji kondisi Paking Kurang Kencang, Batang Macet Akibat Terlalu Kencang, atau Dudukan / Steam Trap Bocor. Lakukan diagnosis masalah dengan membaca panel Status Pemeliharaan dan menyetel ulang Torsi Gland (atau mengganti paking/dudukan yang aus) hingga indikator kembali hijau.',
        ja: '「トラップ・シート故障注入」で締付不足・過締付固着・シート漏れ/トラップ吹き抜けを発生させ、保全ステータスバナーを確認しながらグランドトルク調整や修理方針を判断しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why does tightening the gland not fix Seat Leakage?',
            id: 'Mengapa mengencangkan mur gland tidak menghentikan Kebocoran Dudukan Katup?',
            ja: 'グランドを締めてもシート漏れが止まらないのはなぜですか？',
          },
          a: {
            en: 'Gland packing only seals around the moving stem against atmosphere. Downstream seat leakage is caused by eroded valve trim/seat or a blowing steam trap and requires seat lapping or trap repair.',
            id: 'Paking gland hanya menyegel celah di sekitar batang katup terhadap atmosfer. Kebocoran dudukan di sisi hilir disebabkan oleh erosi pada trim/dudukan katup atau steam trap yang bocor terus-menerus, sehingga memerlukan pengasahan (lapping) dudukan atau perbaikan trap.',
            ja: 'グランドパッキンはステム外周の大気側漏洩のみを止めます。シート漏れは弁体・シートの損傷やトラップ故障が原因のため、シートすり合わせやトラップ交換が必要です。',
          },
          keywords: ['seat', 'leakage', 'gland', 'trap', 'packing', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="valve-faults"]',
    },
    {
      id: 'valve-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice gland torque & EPA M21 exercises, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan penyetelan torsi gland & EPA M21, serta Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、パッキン保全とトラップ診断を習得しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'vbelt-basics': [
    {
      id: 'vbelt-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'V-Belt Cross-Section & Wedging Physics',
        id: 'Penampang Sabuk-V (V-Belt) & Fisika Efek Baji',
        ja: 'Vベルト断面着座とくさび力学',
      },
      description: {
        en: 'Welcome! Inspect proportional belt cross-sections seated inside a pulley groove on the 2D CAD view, compare sidewall wedging forces against flat/positive belts, and decode industrial belt codes.',
        id: 'Selamat datang! Amati penampang sabuk yang proporsional di dalam alur puli pada tampilan CAD 2D, bandingkan gaya efek baji pada dinding alur terhadap sabuk datar/positif, serta uraikan kode standar sabuk industri.',
        ja: 'ようこそ！2D CAD図でプーリ溝に着座したベルト断面の実寸比を確認し、側壁くさび効果や規格コード解読器を対話的に学習します。',
      },
      tip: {
        en: 'A V-belt should ride on the groove sidewalls—never touch the bottom of the pulley groove.',
        id: 'Sabuk-V (V-belt) harus bertumpu pada kedua dinding samping alur dan tidak boleh menyentuh dasar alur puli.',
        ja: 'Vベルトはプーリ溝の側壁で摩擦伝達するため、溝の底面に接触してはいけません。',
      },
    },
    {
      id: 'vbelt-profiles',
      badge: { en: 'Feature 1 · Belt Profiles', id: 'Fitur 1 · Profil Sabuk', ja: '機能1 · ベルト形式' },
      title: {
        en: 'Selecting Belt Profiles & Groove Angles',
        id: 'Memilih Profil Sabuk & Sudut Alur',
        ja: 'ベルト断面形式と溝角度の選択',
      },
      description: {
        en: 'Click any profile button in the Select Belt Profile grid (classical, narrow wedge, cogged, or positive/flat profiles). The groove angle badge updates and loads a matching sample code into the decoder.',
        id: 'Klik tombol profil mana saja pada daftar Pilih Profil Sabuk (klasik, baji sempit/narrow wedge, bergerigi, atau positif/datar). Indikator sudut alur akan diperbarui otomatis sekaligus memuat contoh kode yang sesuai ke dalam dekoder.',
        ja: '「ベルト断面形式の選択」グリッドから任意の形式を選ぶと、プーリ溝のくさび角度が更新され、規格コード解読器にも代表コードが自動入力されます。',
      },
      targetSelector: '[data-tour="vbelt-profiles"]',
    },
    {
      id: 'vbelt-tension',
      badge: { en: 'Feature 2 · Tension & RPM', id: 'Fitur 2 · Tegangan & RPM', ja: '機能2 · 張力と回転数' },
      title: {
        en: 'Belt Tension (T) & Driver RPM',
        id: 'Tegangan Sabuk (T) & Putaran Penggerak (RPM)',
        ja: 'ベルト張力 (T) と駆動回転数',
      },
      description: {
        en: 'Drag Tension (T) from 100 to 1500 N and Driver RPM from 300 to 3600 rpm to observe how belt tension amplifies normal flank force Fn and how RPM affects linear belt speed V (m/s).',
        id: 'Atur Tegangan (T) dari 100 hingga 1500 N dan Putaran Penggerak dari 300 hingga 3600 rpm untuk mengamati bagaimana tegangan sabuk memperbesar gaya normal dinding alur Fn serta pengaruh RPM terhadap kecepatan linear sabuk V (m/s).',
        ja: '張力 (T: 100〜1500 N) と駆動回転数 (300〜3600 rpm) を動かし、側壁抗力 Fn の増大とベルト周速度 V（m/s）の変化を確認します。',
      },
      targetSelector: '[data-tour="vbelt-tension"]',
    },
    {
      id: 'vbelt-decoder',
      badge: { en: 'Feature 3 · Code Decoder', id: 'Fitur 3 · Dekoder Kode', ja: '機能3 · コード解読器' },
      title: {
        en: 'Interactive Belt Code Decoder',
        id: 'Dekoder Kode Sabuk Industri Interaktif',
        ja: 'ベルト規格コード解読器',
      },
      description: {
        en: 'Type an industrial belt designation (or click quick samples: B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840) to parse family, cross-section, and effective length in mm—click "Load" to apply it to the CAD view.',
        id: 'Ketik kode spesifikasi sabuk industri (atau klik contoh cepat: B-65, SPA-1250, HTD 8M-800, AX-42, 6PK-1840) untuk menguraikan jenis keluarga, penampang, dan panjang efektif dalam mm—lalu klik "Muat" untuk menerapkannya pada tampilan CAD.',
        ja: '規格コードを入力（またはサンプルボタンをクリック）すると、ベルト系列・断面寸法・有効長さ（mm）を解析します。「適用」で断面図に反映できます。',
      },
      targetSelector: '[data-tour="vbelt-decoder"]',
    },
    {
      id: 'vbelt-canvas',
      badge: { en: 'Feature 4 · CAD Cross-Section', id: 'Fitur 4 · Penampang CAD', ja: '機能4 · CAD断面図' },
      title: {
        en: 'Proportional Belt & Pulley Groove SVG',
        id: 'Diagram SVG Penampang Sabuk & Alur Puli Proporsional',
        ja: '実寸比ベルト・プーリ溝断面図',
      },
      description: {
        en: 'Inspect the tensile cord layer, sidewall contact vectors, groove clearance at the bottom, and exact dimensional proportions of the active belt profile.',
        id: 'Amati lapisan kord penguat tarik, vektor gaya kontak dinding samping, celah bebas dasar alur, dan proporsi dimensi aktual dari profil sabuk yang sedang aktif.',
        ja: '抗張体コード層、側壁接触反力ベクトル、溝底のクリアランス、選択中ベルトの実寸比プロポーションを確認できます。',
      },
      targetSelector: '[data-tour="vbelt-canvas"]',
    },
    {
      id: 'vbelt-readouts',
      badge: { en: 'Feature 5 · Physics Strip', id: 'Fitur 5 · Kartu Fisika', ja: '機能5 · 物理量カード' },
      title: {
        en: 'Live Belt Physics Readout Strip',
        id: 'Panel Pembacaan Fisika Sabuk Secara Langsung',
        ja: 'ライブベルト物理量カード',
      },
      description: {
        en: 'Monitor Flank Force Fn (N), Apparent Grip μ′, Min Pulley D (mm), and Power / Strand (kW) as you tune belt profiles, tension, and speed.',
        id: 'Pantau Gaya Samping Fn (N), Koefisien Gesek Semu μ′, Diameter Puli Minimum D (mm), dan Daya per Jalur (kW) saat Anda menyetel profil sabuk, tegangan, dan kecepatan putar.',
        ja: '側壁抗力 Fn (N)、見かけ摩擦 μ′、最小プーリ径 (mm)、伝動容量/本 (kW) の変化をリアルタイムで比較できます。',
      },
      targetSelector: '[data-tour="vbelt-readouts"]',
    },
    {
      id: 'vbelt-groove',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Gangguan Alur', ja: '機能6 · 着座異常診断' },
      title: {
        en: 'Groove Seating Faults: Worn Flanks & Bottomed-Out',
        id: 'Gangguan Kedudukan Alur: Dinding Aus & Dasar Mentok (Bottoming Out)',
        ja: 'プーリ溝着座異常：摩耗溝と底突き故障',
      },
      description: {
        en: 'Toggle Groove Seating Health Condition between Proper Seating, Worn Flanks, and Bottomed-Out. When a belt bottoms out on the groove floor, sidewall wedging vanishes and Apparent Grip μ′ turns red—indicating the worn sheave must be replaced, not just over-tensioned.',
        id: 'Ubah Kondisi Kedudukan Alur Puli antara Duduk Baik, Alur Aus, dan Dasar Mentok (Bottomed-Out). Saat sabuk menyentuh dasar alur, efek baji dinding samping menghilang dan Gesekan Semu μ′ berubah merah—menandakan puli yang aus harus segera diganti, bukan sekadar mengencangkan sabuk.',
        ja: '「プーリ溝着座状態」を適正着座・摩耗溝・底突き故障で切り替えます。底突き故障では側壁くさび効果が失われて見かけ摩擦 μ′ が赤表示となり、張り直しではなくプーリ交換が必要と判断できます。',
      },
      faqs: [
        {
          q: {
            en: 'Why does a bottomed-out V-belt slip even at high tension?',
            id: 'Mengapa V-belt yang menyentuh dasar alur (bottomed-out) tetap selip meskipun tegangannya tinggi?',
            ja: '底突きしたVベルトが張力を上げても滑るのはなぜですか？',
          },
          a: {
            en: 'Once the belt touches the groove floor, the wedge reaction on the angled sidewalls collapses—reducing apparent friction μ′ back toward a flat belt (~0.30) instead of ~1.0+.',
            id: 'Begitu sabuk menyentuh dasar alur, gaya reaksi baji pada dinding miring alur menghilang—menurunkan koefisien gesek semu μ′ kembali ke tingkat sabuk datar (~0,30) alih-alih ~1,0+.',
            ja: 'ベルトが溝底に当たると側壁でのくさび反力が失われ、見かけ摩擦 μ′ が平ベルト並み（約0.30）まで急落するためです。',
          },
          keywords: ['bottomed', 'slip', 'worn', 'groove', 'friction', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="vbelt-groove"]',
    },
    {
      id: 'vbelt-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice wedging-force & belt-code problems, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal efek baji & kode sabuk, serta Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、Vベルトの理解を深めましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'vibrating-feeder': [
    {
      id: 'vf-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Vibrating Pan Feeder & Micro-Throwing Lab',
        id: 'Lab Pengumpan Getar (Vibrating Pan Feeder) & Micro-Throwing',
        ja: '振動パンフィーダ・マイクロ投擲ラボ',
      },
      description: {
        en: 'Welcome! Model bulk conveying along an elastically isolated vibrating trough—analyzing throw index Kᵥ, bed depth, mass flow rate, super-resonant isolation f/fₙ, and mechanical faults.',
        id: 'Selamat datang! Modelkan pengumpanan material curah di atas bak getar yang ditopang pegas isolasi elastis—menganalisis indeks lempar Kᵥ, ketebalan lapisan material, laju aliran massa, isolasi super-resonan f/fₙ, serta gangguan mekanis.',
        ja: 'ようこそ！防振ばね支持された振動トラフ上の粉粒体搬送を解析し、投擲指数 Kᵥ、層厚、質量流量、超共振防振比 f/fₙ、各種故障モードを学習します。',
      },
      tip: {
        en: 'Keep the frequency ratio f/fₙ > 2.0 for super-resonant operation and >75% spring isolation.',
        id: 'Pertahankan rasio frekuensi f/fₙ > 2,0 untuk operasi super-resonan dan efisiensi isolasi pegas >75%.',
        ja: '共振を避けて75%以上の防振効率を得るため、振動数比 f/fₙ > 2.0 で運転しましょう。',
      },
    },
    {
      id: 'vf-presets',
      badge: { en: 'Feature 1 · Material Presets', id: 'Fitur 1 · Preset Material', ja: '機能1 · 搬送物プリセット' },
      title: {
        en: 'Material Presets & Playback Controls',
        id: 'Preset Material & Kontrol Operasi',
        ja: '搬送物プリセットと運転制御',
      },
      description: {
        en: 'Pick from five bulk material presets (Limestone, Coal, Iron Ore, Wet Sand, Wood Chips) to auto-load density, moisture friction, and throw angle, or use Pause/Run Feeder and Reset.',
        id: 'Pilih salah satu dari lima preset material curah (Batu Kapur, Batu Bara, Bijih Besi, Pasir Basah, Serpihan Kayu) untuk memuat densitas, koefisien gesek kadar air, dan sudut lempar secara otomatis, atau gunakan tombol Jeda/Jalankan dan Reset.',
        ja: '5種類の搬送物プリセット（石灰石・石炭・鉄鉱石・湿砂・木質チップ）から物性と標準角度を設定でき、一時停止/運転再開およびリセットが行えます。',
      },
      targetSelector: '[data-tour="feeder-presets"]',
    },
    {
      id: 'vf-canvas',
      badge: { en: 'Feature 2 · Cutaway & Gate', id: 'Fitur 2 · Penampang & Pintu Atur', ja: '機能2 · 断面図とゲート' },
      title: {
        en: 'Interactive Drag Gate, Scope & Throw Regime',
        id: 'Pintu Atur Geser Interaktif, Osiloskop & Rezim Lemparan',
        ja: 'ドラッグ操作ゲート・振動波形と投擲モード',
      },
      description: {
        en: 'Drag the hopper gate handle directly on the SVG canvas to change Gate Opening (H) and bed depth, watch the isolation springs and live vibration scope, and check the top-right Throw Regime pill.',
        id: 'Seret tuas pintu atur corong langsung pada diagram SVG untuk mengubah Bukaan Pintu (H) dan ketebalan lapisan material, amati pegas isolasi serta osiloskop getaran langsung, dan periksa indikator Rezim Lemparan di pojok kanan atas.',
        ja: 'SVG上のホッパーゲートを直接ドラッグしてゲート開度 (H) と層厚を変更し、防振ばねや振動波形、右上の輸送モードバッジを確認できます。',
      },
      targetSelector: '[data-tour="feeder-canvas"]',
    },
    {
      id: 'vf-drive',
      badge: { en: 'Feature 3 · Drive & Vibration', id: 'Fitur 3 · Penggerak & Getaran', ja: '機能3 · 加振パラメータ' },
      title: {
        en: 'Drive Frequency f, Stroke 2A & Throw Angle β',
        id: 'Frekuensi Penggerak f, Langkah (Stroke) 2A & Sudut Lempar β',
        ja: '駆動周波数 f・振幅 2A・投擲角 β',
      },
      description: {
        en: 'Tune Drive Frequency f (8–55 Hz), Stroke 2A (1.5–14.0 mm), and Throw Angle β (10°–40°) in Group 1 to transition between sub-threshold sliding, optimal micro-throw, and aggressive bounce.',
        id: 'Atur Frekuensi Penggerak f (8–55 Hz), Langkah 2A (1,5–14,0 mm), dan Sudut Lempar β (10°–40°) pada Grup 1 untuk mengamati peralihan antara luncuran sub-ambang, micro-throw optimal, dan pantulan agresif.',
        ja: 'グループ1で駆動周波数 f（8〜55 Hz）、振幅 2A（1.5〜14.0 mm）、投擲角 β（10°〜40°）を調整し、滑走・最適マイクロ投擲・過大跳躍を切り替えます。',
      },
      targetSelector: '[data-tour="feeder-drive"]',
    },
    {
      id: 'vf-trough',
      badge: { en: 'Feature 4 · Trough & Gate', id: 'Fitur 4 · Bak & Pintu Atur', ja: '機能4 · トラフ・ゲート形状' },
      title: {
        en: 'Trough Width, Length, Gate H & Slope α',
        id: 'Lebar Bak, Panjang, Bukaan H & Kemiringan α',
        ja: 'トラフ幅・長さ・ゲート開度・勾配',
      },
      description: {
        en: 'Adjust Trough Width W (300–1600 mm), Length L (1.5–6.0 m), Gate Opening H (40–300 mm), and Slope α (0°–15°) in Group 2 to size volumetric and mass throughput.',
        id: 'Atur Lebar Bak W (300–1600 mm), Panjang L (1,5–6,0 m), Bukaan Pintu H (40–300 mm), dan Kemiringan α (0°–15°) pada Grup 2 untuk menentukan kapasitas aliran volumetrik dan massa.',
        ja: 'グループ2でトラフ幅 W・長さ L・ゲート開度 H・勾配 α（0°〜15°）を設定し、搬送断面積と質量流量を調整します。',
      },
      targetSelector: '[data-tour="feeder-trough"]',
    },
    {
      id: 'vf-springs',
      badge: { en: 'Feature 5 · Material & Springs', id: 'Fitur 5 · Material & Pegas', ja: '機能5 · 物性と防振ばね' },
      title: {
        en: 'Density ρ, Moisture/μ & Spring Stiffness k',
        id: 'Densitas ρ, Kadar Air/Gesekan & Kekakuan Pegas k',
        ja: 'かさ密度 ρ・水分摩擦・ばね定数 k',
      },
      description: {
        en: 'Adjust Bulk Density ρ, Moisture/Friction factor, and Spring Stiffness k (300–1800 N/mm) in Group 3—note how spring stiffness shifts the natural frequency fₙ shown in the header.',
        id: 'Sesuaikan Densitas Curah ρ, faktor Kadar Air/Gesekan, dan Kekakuan Pegas k (300–1800 N/mm) pada Grup 3—perhatikan bagaimana kekakuan pegas menggeser frekuensi alami fₙ yang ditampilkan pada bagian atas.',
        ja: 'グループ3でかさ密度 ρ、水分・摩擦係数、ばね定数 k（300〜1800 N/mm）を調整し、固有振動数 fₙ の変化を確認します。',
      },
      targetSelector: '[data-tour="feeder-springs"]',
    },
    {
      id: 'vf-telemetry',
      badge: { en: 'Feature 6 · Telemetry', id: 'Fitur 6 · Telemetri', ja: '機能6 · テレメトリ' },
      title: {
        en: 'Six Engineering KPIs & Resonance Guard',
        id: 'Enam Indikator Teknik & Pengaman Resonansi',
        ja: '6つの工学KPIと共振監視',
      },
      description: {
        en: 'Monitor Throw Index Kᵥ, Conveying Velocity & Bed Depth, Mass Flow Rate (t/h), Springs & f/fₙ ratio, Motor Power/Current, and Liner Wear Index.',
        id: 'Pantau Indeks Lempar Kᵥ, Kecepatan Pengumpanan & Ketebalan Lapisan, Laju Aliran Massa (ton/jam), Pegas & rasio f/fₙ, Daya/Arus Motor, serta Indeks Keausan Pelapis (Liner).',
        ja: '投擲指数 Kᵥ、輸送速度・層厚、質量流量 (t/h)、ばね荷重・f/fₙ、モータ出力・電流、ライナー摩耗指数の6カードを確認できます。',
      },
      targetSelector: '[data-tour="feeder-telemetry"]',
    },
    {
      id: 'vf-faults',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis Masalah', ja: '機能7 · 故障注入診断' },
      title: {
        en: 'Fault Injection Lab & Troubleshooting',
        id: 'Lab Simulasi Gangguan & Penanganan Masalah',
        ja: '異常・故障注入ラボと復旧診断',
      },
      description: {
        en: 'Inject Broken Coil Spring, Hopper Bridging / Arching, or Dual Eccentric Phase Slip in the Fault Injection Lab. Inspect the Diagnostic & Fault Status Banner to identify the symptom (or Resonance Danger Zone), then click "Repair / Clear Fault" to restore normal operation.',
        id: 'Simulasikan Pegas Koil Patah, Penyumbatan Corong (Bridging), atau Slip Fasa Eksentrik Ganda pada Lab Simulasi Gangguan. Periksa Panel Status Diagnostik & Gangguan untuk mengenali gejala (atau Zona Bahaya Resonansi), lalu klik "Perbaiki Gangguan" guna memulihkan operasi normal.',
        ja: '「異常・故障注入ラボ」でコイルばね破損・ホッパーブリッジ・二軸偏心位相ずれを発生させ、診断バナーで症状を確認したあと「異常を修復」ボタンで復旧できます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I escape the Resonance Danger Zone?',
            id: 'Bagaimana cara keluar dari Zona Bahaya Resonansi?',
            ja: '共振危険領域（Resonance Danger Zone）から抜けるには？',
          },
          a: {
            en: 'Increase Drive Frequency f or reduce Spring Stiffness k so the ratio f/fₙ rises above 2.0, or click "Repair / Clear Fault" on the diagnostic banner.',
            id: 'Naikkan Frekuensi Penggerak f atau turunkan Kekakuan Pegas k sehingga rasio f/fₙ melampaui 2,0, atau klik "Perbaiki Gangguan" pada panel diagnostik.',
            ja: '駆動周波数 f を上げるかばね定数 k を下げて f/fₙ > 2.0 にするか、診断バナーの「異常を修復」をクリックします。',
          },
          keywords: ['resonance', 'danger', 'natural frequency', 'f/fn', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="feeder-faults"]',
    },
    {
      id: 'vf-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice throw-index & isolation exercises, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal indeks lempar & rasio isolasi, serta Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、振動フィーダの理解を仕上げましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  vibration: [
    {
      id: 'vib-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Single-Plane Rotor Balancing & Resonance',
        id: 'Penyeimbangan Rotor Satu Bidang & Resonansi',
        ja: '単一修正面ロータ動釣合と共振解析',
      },
      description: {
        en: 'Welcome! Model a single-plane Jeffcott rotor with mass unbalance, critical speed resonance, phase lag shift, and ISO 10816-3 / 20816-3 severity limits.',
        id: 'Selamat datang! Modelkan rotor Jeffcott satu bidang dengan ketidakseimbangan (unbalance) massa, resonansi kecepatan kritis, pergeseran sudut fasa, serta batas tingkat keparahan getaran ISO 10816-3 / 20816-3.',
        ja: 'ようこそ！単一修正面ジェフコット・ロータの不釣合振動、危険速度共振、位相遅れ変化、ISO 10816-3 / 20816-3 評価をシミュレートします。',
      },
      tip: {
        en: 'Place the correction mass Wc 180° opposite the heavy spot θ₀ to cancel net unbalance.',
        id: 'Pasang massa koreksi Wc tepat berlawanan 180° dari titik berat awal θ₀ untuk meniadakan ketidakseimbangan sisa.',
        ja: '初期不釣合の位相 θ₀ に対して 180° 反対側へ同等の修正重錘 Wc を配置すると残留不釣合がゼロになります。',
      },
    },
    {
      id: 'vib-scenario',
      badge: { en: 'Feature 1 · Presets & Support', id: 'Fitur 1 · Preset & Fondasi', ja: '機能1 · 基礎とプリセット' },
      title: {
        en: 'Foundation Support & Unbalance Presets',
        id: 'Tipe Fondasi & Preset Ketidakseimbangan',
        ja: '基礎支持形式と不釣合プリセット',
      },
      description: {
        en: 'Toggle Rigid vs. Flexible (Class II) foundation support—which shifts ISO velocity thresholds—and choose a Rotor Unbalance Preset from the dropdown.',
        id: 'Beralihlah antara Tipe Fondasi Kaku dan Fleksibel (Kelas II)—yang menggeser ambang kecepatan getaran ISO—serta pilih Preset Ketidakseimbangan Rotor dari daftar pilihan.',
        ja: '剛性基礎／弾性基礎（Class II：ISO判定しきい値が変化）を切り替え、ロータ不釣合プリセットを選択します。',
      },
      targetSelector: '[data-tour="vibration-scenario"]',
    },
    {
      id: 'vib-speed',
      badge: { en: 'Feature 2 · Speed & Nc', id: 'Fitur 2 · Kecepatan & Nc', ja: '機能2 · 運転回転数' },
      title: {
        en: 'Operating Speed Sweep & Critical Speed Nc',
        id: 'Sapuan Kecepatan Operasi & Kecepatan Kritis Nc',
        ja: '運転回転速度スイープと危険速度 Nc',
      },
      description: {
        en: 'Drag Operating Speed (300–4500 RPM) or click quick jump buttons (900, 1800, 2100 Nc, 3000, 3600) to sweep across the critical speed and watch amplitude peak and phase lag shift 90°→180°.',
        id: 'Atur Kecepatan Operasi (300–4500 RPM) atau klik tombol cepat (900, 1800, 2100 Nc, 3000, 3600) untuk melintasi kecepatan kritis serta mengamati puncak amplitudo dan pergeseran fasa 90°→180°.',
        ja: '運転回転速度（300〜4500 RPM）やクイックボタン（Nc強調表示）で危険速度通過時の振幅ピークと位相変化を観察します。',
      },
      targetSelector: '[data-tour="vibration-speed"]',
    },
    {
      id: 'vib-balancing',
      badge: { en: 'Feature 3 · Balancing', id: 'Fitur 3 · Penyeimbangan', ja: '機能3 · 釣合修正' },
      title: {
        en: 'Initial Unbalance U₀ & Correction Weight Wc',
        id: 'Ketidakseimbangan Awal U₀ & Massa Koreksi Wc',
        ja: '初期不釣合 U₀ と釣合修正質量 Wc',
      },
      description: {
        en: 'Adjust Initial Unbalance U₀ and Angle θ₀, then counter-balance manually using Added Mass Wc and Correction Angle θc. Click "Auto-Balance" to apply the exact counter-weight, "Clear" to reset, or the sliders icon for Advanced Nc / Damping ζ.',
        id: 'Sesuaikan Ketidakseimbangan Awal U₀ dan Sudut θ₀, lalu lakukan penyeimbangan manual menggunakan Massa Tambahan Wc dan Sudut Koreksi θc. Klik "Balans Ideal" untuk menerapkan massa penyeimbang otomatis, "Hapus" untuk mengatur ulang, atau ikon penggeser untuk pengaturan lanjutan Nc / Redaman ζ.',
        ja: '初期不釣合 U₀・θ₀ を設定し、付加質量 Wc・θc で手動釣合を行います。「自動釣合修正」「クリア」、さらに詳細設定ボタンで Nc と減衰比 ζ も調整できます。',
      },
      targetSelector: '[data-tour="vibration-balancing"]',
    },
    {
      id: 'vib-rig',
      badge: { en: 'Feature 4 · Rotor Rig SVG', id: 'Fitur 4 · Rig Rotor SVG', ja: '機能4 · ロータ試験ベンチ' },
      title: {
        en: 'Interactive Rotor Dynamic Rig & Face View',
        id: 'Rig Dinamika Rotor & Tampilan Muka Interaktif',
        ja: '対話型ロータ動釣合試験ベンチ図',
      },
      description: {
        en: 'Click directly on the balancing disk PCD bolt holes in the SVG face view to mount Correction Angle θc, or toggle the motor run state while watching the 1X orbit and phase lag arrow.',
        id: 'Klik langsung lubang baut PCD pada tampilan muka cakram SVG untuk memasang Sudut Koreksi θc, atau nyalakan/matikan motor sambil mengamati orbit 1X dan panah pergeseran fasa.',
        ja: 'ベンチ図のバランスディスクPCDボルト穴をクリックして修正位相角 θc を直感的に指定でき、1X軌道や位相遅れ矢印を観察できます。',
      },
      targetSelector: '[data-tour="vibration-rig"]',
    },
    {
      id: 'vib-telemetry',
      badge: { en: 'Feature 5 · Telemetry', id: 'Fitur 5 · Telemetri', ja: '機能5 · テレメトリ' },
      title: {
        en: 'Live Vibration Telemetry Cards',
        id: 'Kartu Telemetri Getaran Langsung',
        ja: 'ライブ振動テレメトリカード',
      },
      description: {
        en: 'Track Vibration RMS v_rms (mm/s), 1X Orbit Pk-Pk (μm), Net Unbalance U_net (g·mm), and Phase Lag φ (°).',
        id: 'Pantau Kecepatan Getaran RMS v_rms (mm/s), Orbit 1X Pk-Pk (μm), Ketidakseimbangan Sisa U_net (g·mm), dan Pergeseran Fasa φ (°).',
        ja: '総振動速度 RMS・1X振幅・残留不釣合・位相遅れ角 φ の4指標をリアルタイムで確認できます。',
      },
      targetSelector: '[data-tour="vibration-telemetry"]',
    },
    {
      id: 'vib-charts',
      badge: { en: 'Feature 6 · FFT & Bode', id: 'Fitur 6 · FFT & Bode', ja: '機能6 · FFTとボード線図' },
      title: {
        en: 'FFT Spectrum & Bode Response Curve',
        id: 'Spektrum FFT & Kurva Respons Bode',
        ja: 'FFTスペクトル＆ボード線図',
      },
      description: {
        en: 'Switch between the FFT Spectrum tab (showing the dominant 1X synchronous peak) and the Bode Curve tab (amplitude & phase vs. RPM across critical speed Nc).',
        id: 'Beralihlah antara tab Spektrum FFT (menampilkan puncak sinkron 1X yang dominan) dan tab Kurva Bode (amplitudo & fasa terhadap RPM melintasi kecepatan kritis Nc).',
        ja: '「FFTスペクトル」（1X同期成分ピーク）と「ボード線図」（危険速度Ncを挟む振幅・位相特性）を切り替えて解析できます。',
      },
      targetSelector: '[data-tour="vibration-charts"]',
    },
    {
      id: 'vib-iso',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnostik ISO', ja: '機能7 · ISO異常診断' },
      title: {
        en: 'ISO 10816-3 / 20816-3 Severity & Troubleshooting',
        id: 'Tingkat Keparahan ISO 10816-3 / 20816-3 & Penanganan Masalah',
        ja: 'ISO 10816-3 / 20816-3 判定と対策',
      },
      description: {
        en: 'Watch the ISO Severity Card classify vibration into Zone A (Good), B (Satisfactory), C (Unsatisfactory), or D (Unacceptable Trip). If in Zone C/D, diagnose whether RPM is parked on Critical Speed Nc (move RPM away from Nc) or U_net is high (apply counter-weight Wc or click Auto-Balance).',
        id: 'Pantau kartu Tingkat Keparahan ISO yang mengklasifikasikan getaran ke dalam Zona A (Baik), B (Memuaskan), C (Tidak Memuaskan), atau D (Tidak Dapat Diterima / Trip). Jika berada di Zona C/D, periksa apakah RPM berada tepat pada Kecepatan Kritis Nc (jauhkan RPM dari Nc) atau nilai U_net masih tinggi (pasang massa koreksi Wc atau klik Balans Ideal).',
        ja: 'ISO判定カードで振動状態を Zone A〜D に分類します。Zone C/D に入った場合は、危険速度 Nc 付近での運転か残留不釣合 U_net 過多かを切り分け、回転数変更や釣合修正で Zone A へ改善しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why does vibration spike at 2100 RPM even with small unbalance?',
            id: 'Mengapa getaran melonjak tajam pada 2100 RPM meskipun ketidakseimbangan massa kecil?',
            ja: '不釣合が小さくても2100 RPMで振動が急増するのはなぜ？',
          },
          a: {
            en: '2100 RPM is the default Critical Speed Nc where excitation matches natural frequency and phase lag crosses 90°, amplifying vibration by M = 1/(2ζ).',
            id: '2100 RPM merupakan Kecepatan Kritis Nc bawaan saat frekuensi eksitasi menyamai frekuensi alami dan sudut fasa melewati 90°, sehingga amplitudo getaran diperkuat sebesar faktor M = 1/(2ζ).',
            ja: '2100 RPMが既定の危険速度 Nc であり、固有振動数と一致して位相遅れが90°となり、共振倍率 M = 1/(2ζ) で振幅が増幅されるためです。',
          },
          keywords: ['2100', 'resonance', 'critical speed', 'nc', 'spike', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="vibration-iso"]',
    },
    {
      id: 'vib-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice single-plane balancing calculations, and the Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan perhitungan penyeimbangan satu bidang, dan Kuis.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、ロータ動釣合の理解を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'vibration-meter': [
    {
      id: 'vm-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Handheld Vibration Meter & Machine Route',
        id: 'Alat Ukur Getaran Genggam & Rute Inspeksi Mesin',
        ja: '携帯型振動計と機械計測ルート',
      },
      description: {
        en: 'Welcome! Perform a 4-point predictive maintenance route on a coupled motor-pump train using a handheld vibration analyzer to isolate unbalance, misalignment, looseness, and bearing wear.',
        id: 'Selamat datang! Lakukan inspeksi rute pemeliharaan prediktif 4 titik pada rangkaian motor-pompa terkopel menggunakan alat ukur getaran genggam untuk mengisolasi ketidakseimbangan (unbalance), ketidaksejajaran poros (misalignment), kelonggaran mekanis, dan keausan bantalan.',
        ja: 'ようこそ！電動機・ポンプ連結機を対象に、携帯型振動計による4点巡回点検を行い、不釣合・芯ずれ・ガタ・軸受摩耗の切り分けを実践します。',
      },
      tip: {
        en: 'High Velocity (mm/s) points to unbalance/misalignment, while high BDU points to rolling-element bearing damage.',
        id: 'Nilai Kecepatan Getaran / Velocity (mm/s) yang tinggi mengindikasikan unbalance atau misalignment, sedangkan nilai BDU yang tinggi menandakan kerusakan pada bantalan gelinding.',
        ja: '速度（mm/s）の上昇は不釣合や芯ずれ、BDU値の上昇は転がり軸受自体の損傷を示唆します。',
      },
    },
    {
      id: 'vm-canvas',
      badge: { en: 'Feature 1 · Meter & Rig', id: 'Fitur 1 · Alat & Mesin', ja: '機能1 · 振動計と機械図' },
      title: {
        en: 'Interactive Machine Diagram & Handheld Meter',
        id: 'Diagram Mesin Interaktif & Alat Ukur Genggam',
        ja: '対話型機械図と携帯振動計SVG',
      },
      description: {
        en: 'Click any of the 4 magnetic probe points directly on the motor-pump diagram, or press the mode button on the handheld vibration meter SVG to cycle measurement units.',
        id: 'Klik langsung salah satu dari 4 titik probe magnetik pada diagram motor-pompa, atau tekan tombol mode pada tampilan SVG alat ukur getaran genggam untuk mengganti satuan pengukuran.',
        ja: '機械図上の4つのプローブ位置を直接クリックするか、振動計SVG上のボタンで測定モードを切り替えることができます。',
      },
      targetSelector: '[data-tour="vmeter-canvas"]',
    },
    {
      id: 'vm-modes',
      badge: { en: 'Feature 2 · Modes', id: 'Fitur 2 · Mode Ukur', ja: '機能2 · 測定モード' },
      title: {
        en: 'Four Vibration Measurement Modes',
        id: 'Empat Mode Pengukuran Getaran',
        ja: '4種類の振動測定モード',
      },
      description: {
        en: 'Select Velocity (mm/s RMS) for ISO 10816-3 overall severity, Accel (g Peak) for high-frequency impacts, Disp (μm P-P) for low-speed shaft motion, or Bearing (BDU) to isolate bearing damage.',
        id: 'Pilih Velocity (mm/s RMS) untuk evaluasi keparahan umum ISO 10816-3, Accel (g Peak) untuk mendeteksi tumbukan frekuensi tinggi, Disp (μm P-P) untuk pergerakan poros berkecepatan rendah, atau Bearing (BDU) untuk mengisolasi kerusakan bantalan.',
        ja: '「Velocity (mm/s RMS)」でISO 10816-3総合判定、「Accel (g Peak)」で高周波衝撃、「Disp (μm P-P)」で低速変位、「Bearing (BDU)」で転がり軸受損傷を評価します。',
      },
      targetSelector: '[data-tour="vmeter-modes"]',
    },
    {
      id: 'vm-probe',
      badge: { en: 'Feature 3 · Probe Placement', id: 'Fitur 3 · Posisi Probe', ja: '機能3 · プローブ位置' },
      title: {
        en: 'Magnetic Probe Placement (M-DE / M-NDE / P-DE / P-NDE)',
        id: 'Penempatan Probe Magnetik (M-DE / M-NDE / P-DE / P-NDE)',
        ja: 'マグネットプローブ位置の選択',
      },
      description: {
        en: 'Move the magnetic accelerometer probe across Motor Drive End (M-DE), Motor Non-Drive End (M-NDE), Pump Drive End (P-DE), and Pump Non-Drive End (P-NDE) to localize where vibration peaks.',
        id: 'Pindahkan probe akselerometer magnetik di antara titik Motor Drive End (M-DE), Motor Non-Drive End (M-NDE), Pompa Drive End (P-DE), dan Pompa Non-Drive End (P-NDE) untuk melokalisasi lokasi puncak getaran.',
        ja: 'マグネットプローブをモータ負荷側/反負荷側、ポンプ負荷側/反負荷側の4点へ移動し、どの軸受で振動が最大になっているかを切り分けます。',
      },
      targetSelector: '[data-tour="vmeter-probe"]',
    },
    {
      id: 'vm-route',
      badge: { en: 'Feature 4 · 4-Point Matrix', id: 'Fitur 4 · Matriks 4 Titik', ja: '機能4 · 4点ルート表' },
      title: {
        en: '4-Point Bearing Route Matrix',
        id: 'Matriks Rute Pengukuran 4 Titik Bantalan',
        ja: '4点軸受ルート計測マトリックス',
      },
      description: {
        en: 'Compare VEL, ACC, DISP, and BDU side by side across all four bearings with ISO 10816-3 Zone A–D badges. Click any card in the matrix to jump the probe straight to that bearing.',
        id: 'Bandingkan nilai VEL, ACC, DISP, dan BDU secara berdampingan pada keempat bantalan beserta indikator Zona A–D ISO 10816-3. Klik kartu mana saja dalam matriks untuk langsung memindahkan probe ke bantalan tersebut.',
        ja: '4つの軸受のVEL・ACC・DISP・BDUとISO Zone（A〜D）を一覧比較できます。各カードをクリックするとプローブがその軸受へ移動します。',
      },
      targetSelector: '[data-tour="vmeter-route"]',
    },
    {
      id: 'vm-rpm',
      badge: { en: 'Feature 5 · Speed RPM', id: 'Fitur 5 · Putaran RPM', ja: '機能5 · 回転数設定' },
      title: {
        en: 'Machine Speed (900–3600 RPM)',
        id: 'Kecepatan Putar Mesin (900–3600 RPM)',
        ja: '機械回転数（900〜3600 RPM）',
      },
      description: {
        en: 'Adjust Machine Speed with the slider or quick presets (1200, 1500, 1800, 3000, 3600 RPM) to observe how shaft speed scales velocity, acceleration, and displacement.',
        id: 'Atur Kecepatan Putar Mesin melalui penggeser atau preset cepat (1200, 1500, 1800, 3000, 3600 RPM) untuk mengamati bagaimana kecepatan poros memengaruhi nilai kecepatan (velocity), percepatan (akselerasi), dan perpindahan (displacement).',
        ja: '回転数スライダーまたはプリセット（1200〜3600 RPM）を変更し、速度・加速度・変位への影響を確認します。',
      },
      targetSelector: '[data-tour="vmeter-rpm"]',
    },
    {
      id: 'vm-iso-class',
      badge: { en: 'Feature 6 · ISO Class', id: 'Fitur 6 · Kelas ISO', ja: '機能6 · ISOクラス設定' },
      title: {
        en: 'ISO 10816-3 Power & Foundation Class',
        id: 'Kelas Daya & Fondasi ISO 10816-3',
        ja: 'ISO 10816-3 出力・基礎クラス',
      },
      description: {
        en: 'Select the ISO 10816-3 Power & Foundation Class. Notice the ISO threshold limits on the route matrix update dynamically for each machine class.',
        id: 'Pilih Kelas Daya & Fondasi ISO 10816-3. Perhatikan bahwa nilai ambang batas ISO pada matriks rute akan diperbarui secara dinamis untuk setiap kelas mesin.',
        ja: 'ISO 10816-3の出力・基礎クラスを選択します。クラスに応じてルート表の判定しきい値（mm/s）が自動更新されます。',
      },
      targetSelector: '[data-tour="vmeter-iso-class"]',
    },
    {
      id: 'vm-diagnostic',
      badge: { en: 'Feature 7 · Interpretation', id: 'Fitur 7 · Interpretasi', ja: '機能7 · 現場診断カード' },
      title: {
        en: 'Field Diagnostic Interpretation & Action',
        id: 'Interpretasi Diagnostik Lapangan & Tindakan Rekomendasi',
        ja: '現場診断および推奨処置',
      },
      description: {
        en: 'Read the Field Diagnostic Interpretation card for root-cause clues and the Recommended Action for the active fault scenario.',
        id: 'Baca kartu Interpretasi Diagnostik Lapangan untuk melihat petunjuk akar masalah serta Tindakan yang Direkomendasikan bagi skenario gangguan yang sedang aktif.',
        ja: '「現場診断および推奨処置」カードで、選択中の異常シナリオの原因分析と具体的な保全処置を確認します。',
      },
      targetSelector: '[data-tour="vmeter-diagnostic"]',
    },
    {
      id: 'vm-faults',
      badge: { en: 'Feature 8 · Troubleshoot', id: 'Fitur 8 · Diagnosis Masalah', ja: '機能8 · 故障シナリオ診断' },
      title: {
        en: 'Fault Scenarios & Route Troubleshooting',
        id: 'Skenario Gangguan & Penanganan Masalah Rute Inspeksi',
        ja: '故障シナリオとルート異常診断',
      },
      description: {
        en: 'Inject faults from the Fault Scenario list—such as unbalance, misalignment, looseness, bearing wear, or cavitation—and troubleshoot by comparing M-DE/M-NDE vs. P-DE/P-NDE readings in the 4-point matrix.',
        id: 'Simulasikan gangguan dari daftar Skenario Gangguan—seperti ketidakseimbangan (unbalance), ketidaksejajaran (misalignment), kelonggaran mekanis, keausan bantalan, atau kavitasi—lalu lakukan diagnosis masalah dengan membandingkan pembacaan M-DE/M-NDE terhadap P-DE/P-NDE pada matriks 4 titik.',
        ja: '「故障シナリオ」を切り替えてモータ側（M-DE/M-NDE）とポンプ側（P-DE/P-NDE）の振動差を比較し、どの機器の異常かを切り分けましょう。',
      },
      faqs: [
        {
          q: {
            en: 'How do I distinguish misalignment from bearing wear?',
            id: 'Bagaimana cara membedakan ketidaksejajaran poros (misalignment) dari keausan bantalan?',
            ja: '芯ずれ（ミスアライメント）と軸受摩耗はどう見分けますか？',
          },
          a: {
            en: 'Misalignment elevates Velocity (mm/s) across the coupling (M-DE and P-DE) while BDU stays normal. Bearing wear spikes BDU and Accel (g) locally at the damaged bearing.',
            id: 'Misalignment menaikkan nilai Velocity (mm/s) di kedua sisi kopling (M-DE dan P-DE) sementara BDU tetap normal. Sebaliknya, keausan bantalan menyebabkan lonjakan tajam pada BDU dan Accel (g) secara terlokalisasi di bantalan yang mengalami kerusakan.',
            ja: '芯ずれはカップリング両側（M-DEとP-DE）の速度（mm/s）が上昇しBDUは正常です。軸受摩耗は損傷した軸受のみでBDU値と加速度（g）が急上昇します。',
          },
          keywords: ['misalignment', 'bearing', 'bdu', 'velocity', 'distinguish', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="vmeter-faults"]',
    },
    {
      id: 'vm-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice diagnosing 4-point routes, and the ISO 10816-3 Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan diagnosis rute 4 titik, dan Kuis ISO 10816-3.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、4点計測からの異常切り分けを習得しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'weld-strength': [
    {
      id: 'weld-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'AWS Weld Joint Strength & Stress Lab',
        id: 'Lab Kekuatan Sambungan Las & Tegangan AWS',
        ja: 'AWS溶接継手強度・応力解析ラボ',
      },
      description: {
        en: 'Welcome! Analyze structural welds across Lap / T-Fillet, Eccentric Bracket, and Butt Groove joints—evaluating design throat a, effective area Aw, combined shear/bending stress, and AWS safety factors.',
        id: 'Selamat datang! Analisis kekuatan las struktural pada sambungan Fillet Tumpang / T, Braket Eksentrik, dan Kampuh Tumpul (Butt Groove)—mengevaluasi tebal leher desain a, luas efektif Aw, tegangan geser/lentur gabungan, serta faktor keamanan standar AWS.',
        ja: 'ようこそ！重ね/T形すみ肉・偏心ブラケット・突合せ開先溶接の理論のど厚 a、有効のど断面積 Aw、合成応力、AWS安全率を2D CAD図とともに解析します。',
      },
      tip: {
        en: 'For a 45° equal-leg fillet weld, effective throat a = 0.707 × leg size s.',
        id: 'Untuk las fillet sama kaki 45°, tebal leher efektif a = 0,707 × ukuran kaki s.',
        ja: '等脚45°すみ肉溶接では、理論のど厚 a = 0.707 × 脚長 s となります。',
      },
    },
    {
      id: 'weld-modes',
      badge: { en: 'Feature 1 · Joint & Presets', id: 'Fitur 1 · Jenis & Preset', ja: '機能1 · 継手形式とプリセット' },
      title: {
        en: 'Joint Type Tabs, Design Presets & CSV Export',
        id: 'Tab Jenis Sambungan, Preset Desain & Ekspor CSV',
        ja: '継手形式・設計プリセット・CSV出力',
      },
      description: {
        en: 'Switch between 1. Lap / T-Fillet, 2. Eccentric Bracket, and 3. Butt Groove Weld, apply standard AWS Design Presets, Reset parameters, or Export CSV.',
        id: 'Beralihlah antara 1. Fillet Tumpang / T, 2. Braket Eksentrik, dan 3. Kampuh Tumpul, terapkan Preset Desain standar AWS, Reset parameter, atau Ekspor data ke CSV.',
        ja: '3つの継手形式タブを切り替え、設計プリセットの適用、パラメータの初期化、CSVデータ出力が行えます。',
      },
      targetSelector: '[data-tour="weld-modes"]',
    },
    {
      id: 'weld-canvas',
      badge: { en: 'Feature 2 · 2D CAD Joint', id: 'Fitur 2 · CAD Sambungan', ja: '機能2 · 2D CAD溶接図' },
      title: {
        en: 'Live Structural Weld CAD & Stress Vectors',
        id: 'Diagram CAD Las Struktural & Vektor Tegangan Secara Langsung',
        ja: 'ライブ構造溶接CAD・応力ベクトル図',
      },
      description: {
        en: 'Inspect the 2D joint geometry, weld throat cross-section, eccentric moment arm e, bevel angle, and color-coded stress intensity across the weld group.',
        id: 'Amati geometri sambungan 2D, penampang leher las, lengan momen eksentrik e, sudut kampuh, dan intensitas tegangan berkode warna pada kelompok sambungan las.',
        ja: '2D継手形状、のど厚断面、偏心距離 e、開先角度、溶接群の応力分布カラー表示をリアルタイムで確認できます。',
      },
      targetSelector: '[data-tour="weld-canvas"]',
    },
    {
      id: 'weld-electrode',
      badge: { en: 'Feature 3 · Electrode', id: 'Fitur 3 · Elektroda', ja: '機能3 · 溶接棒選定' },
      title: {
        en: 'Electrode / Filler Alloy Selection',
        id: 'Pemilihan Elektroda / Logam Pengisi Las',
        ja: '溶接棒・溶加材の選定',
      },
      description: {
        en: 'Choose the Electrode / Filler Alloy (e.g., E70XX, E80XX, E60XX) from the dropdown—displaying welding process, UTS, and AWS allowable shear stress.',
        id: 'Pilih Elektroda / Logam Pengisi (misalnya E70XX, E80XX, E60XX) dari daftar pilihan—menampilkan proses pengelasan, kekuatan tarik puncak (UTS), dan tegangan geser izin AWS.',
        ja: '溶接棒・溶加材（E70XX・E80XX等）を選択すると、溶接プロセス・引張強さ UTS・AWS許容せん断応力が設定されます。',
      },
      targetSelector: '[data-tour="weld-electrode"]',
    },
    {
      id: 'weld-dimensions',
      badge: { en: 'Feature 4 · Dimensions & Load', id: 'Fitur 4 · Dimensi & Beban', ja: '機能4 · 寸法と荷重' },
      title: {
        en: 'Joint Dimensions, Passes, Pattern & Applied Load F',
        id: 'Dimensi Sambungan, Lapisan Las, Pola & Beban Kerja F',
        ja: '継手寸法・パターン・作用外力 F',
      },
      description: {
        en: 'Configure mode-specific geometry—Fillet Passes, Orientation & Leg Size s (Mode 1), Weld Pattern & Eccentricity e (Mode 2), or Groove Prep & Penetration CJP/PJP (Mode 3)—plus the universal Applied Load (F) slider.',
        id: 'Konfigurasikan geometri sesuai mode—Jumlah Lapisan Las, Orientasi & Ukuran Kaki s (Mode 1), Pola Las & Eksentrisitas e (Mode 2), atau Persiapan Kampuh & Penetrasi CJP/PJP (Mode 3)—serta penggeser Beban Kerja (F).',
        ja: 'モード別の形状・配置（すみ肉配置/荷重方向、偏心距離 e、開先形状/溶込みCJP・PJP）と共通の作用外力 (F) スライダーを設定します。',
      },
      targetSelector: '[data-tour="weld-dimensions"]',
    },
    {
      id: 'weld-summary',
      badge: { en: 'Feature 5 · Summary Cards', id: 'Fitur 5 · Kartu Ringkasan', ja: '機能5 · サマリーカード' },
      title: {
        en: 'Throat, Effective Area, Peak Stress & Safety Factor',
        id: 'Tebal Leher, Luas Efektif, Tegangan Puncak & Faktor Keamanan',
        ja: 'のど厚・有効断面積・最大応力・安全率',
      },
      description: {
        en: 'Inspect Throat (a = 0.707s), Effective Area Aw, Peak Joint Stress, and the color-coded Safety Factor card (PASS / MARGINAL / FAIL) directly below the 2D CAD SVG.',
        id: 'Periksa Tebal Leher (a = 0,707s), Luas Efektif Aw, Tegangan Puncak Sambungan, dan kartu Faktor Keamanan berkode warna (PASS / MARGINAL / FAIL) tepat di bawah diagram SVG CAD 2D.',
        ja: 'CAD図の下で理論のど厚 a、有効のど断面積 Aw、最大合成応力、色分けされた安全率カード（PASS/MARGINAL/FAIL）を確認できます。',
      },
      targetSelector: '[data-tour="weld-summary"]',
    },
    {
      id: 'weld-breakdown',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnostik Tegangan', ja: '機能6 · 応力診断内訳' },
      title: {
        en: 'Stress Distribution Breakdown & Overload Troubleshooting',
        id: 'Rincian Distribusi Tegangan & Penanganan Beban Berlebih',
        ja: '応力成分解析内訳と過負荷トラブルシューティング',
      },
      description: {
        en: 'Compare Direct Shear τ′ (or Axial Stress) against Secondary Torsional Shear τ″ / Bending Stress, AWS Allowable Limit, and the Stress Utilization % bar. When utilization exceeds 100% (red / FAIL), troubleshoot by increasing leg size s, switching to Double passes or CJP, upgrading the electrode, or reducing eccentricity e.',
        id: 'Bandingkan Geser Langsung τ′ (atau Tegangan Aksial) terhadap Geser Torsi Sekunder τ″ / Tegangan Lentur, Batas Izin AWS, dan bilah Utilisasi Tegangan %. Apabila utilisasi melebihi 100% (merah / FAIL), atasi dengan memperbesar ukuran kaki las s, beralih ke pengelasan ganda (Double) atau penetrasi penuh (CJP), meningkatkan mutu elektroda, atau mengurangi eksentrisitas e.',
        ja: '一次直接せん断・軸応力と二次ねじり/曲げ応力、AWS許容限度、応力利用率バーを比較します。利用率が100%（赤/FAIL）を超えた場合は、脚長 s の増加、両面溶接/CJP化、高強度電極への変更、偏心 e の低減で改善しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why does the eccentric bracket fail when direct shear τ′ is low?',
            id: 'Mengapa sambungan braket eksentrik mengalami kegagalan padahal tegangan geser langsung τ′ tergolong kecil?',
            ja: '一次せん断応力 τ′ が低いのに偏心ブラケットがFAILになるのはなぜ？',
          },
          a: {
            en: 'Eccentricity e creates a twisting moment M = F·e, inducing large secondary torsional shear τ″ at the outermost weld corners. Resultant stress is √(τ′² + τ″² + ...), which can exceed AWS limits.',
            id: 'Eksentrisitas e menimbulkan momen puntir M = F·e yang membangkitkan tegangan geser torsi sekunder τ″ yang besar pada sudut terjauh sambungan las. Tegangan resultan √(τ′² + τ″² + ...) inilah yang melampaui batas izin AWS.',
            ja: '偏心距離 e によるねじりモーメント M = F·e が溶接群の最外縁に大きな二次せん断応力 τ″ を生じさせ、合成応力がAWS許容限度を超えるためです。',
          },
          keywords: ['eccentric', 'torsional', 'fail', 'secondary', 'shear', 'troubleshoot'],
        },
      ],
      targetSelector: '[data-tour="weld-breakdown"]',
    },
    {
      id: 'weld-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Simulasi, Eksplorasi, Latihan & Kuis',
        ja: 'シミュレート・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top mode tabs (or Alt+1..4) to switch between Explore theory, Simulate, Practice weld throat & eccentric bracket problems, and the AWS Quiz.',
        id: 'Gunakan tab mode di bagian atas (atau Alt+1..4) untuk beralih antara Eksplorasi teori, Simulasi, Latihan soal ukuran leher las & braket eksentrik, serta Kuis AWS.',
        ja: '上部のモードタブ（または Alt+1〜4）で「探索」「シミュレート」「演習」「クイズ」を切り替え、のど厚計算や偏心ブラケット設計の理解を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],
  'loto-safety': [
    {
      id: 'loto-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'LOTO (Lockout / Tagout) & Zero-Energy Verification Lab',
        id: 'Laboratorium LOTO (Penguncian & Pelabelan) & Verifikasi Energi Nol',
        ja: 'LOTO（ロックアウト・タグアウト）＆ゼロエネルギー確認ラボ',
      },
      description: {
        en: 'Welcome! Practice OSHA 1910.147 hazardous energy isolation across electrical MCCs, hydraulic accumulators, pneumatic gravity rams, and dual-feed conveyors using personal padlocks, danger tags, Live-Dead-Live testing, and Start Try-Out.',
        id: 'Selamat datang! Praktikkan isolasi energi berbahaya OSHA 1910.147 pada panel MCC listrik, akumulator hidrolik, ram pneumatik bergravitasi, dan konveyor suplai ganda menggunakan gembok pribadi, label bahaya, uji Live-Dead-Live, serta uji coba penyalaan (Try-Out).',
        ja: 'ようこそ！OSHA 1910.147に基づき、電気MCC・油圧アキュムレータ・重力ラム・二重給電コンベヤの危険エネルギー遮断を個人南京錠・危険タグ・Live-Dead-Live検電・起動テストで習得します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every safety control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol keselamatan.',
        ja: '「次へ / 前へ」または ← / → キーで各安全操作ガイドを順番に確認できます。',
      },
    },
    {
      id: 'loto-scenarios',
      badge: { en: 'Feature 1 · Scenarios', id: 'Fitur 1 · Skenario Peralatan', ja: '機能1 · 設備シナリオ' },
      title: {
        en: 'Plant Equipment Isolation Scenarios',
        id: 'Pilihan Skenario Isolasi Peralatan Pabrik',
        ja: 'プラント設備アイソレーション・シナリオ選択',
      },
      description: {
        en: 'Select from four realistic industrial systems—Centrifugal Pump MCC, Hydraulic Press with Accumulator, Pneumatic Press with Gravity Ram, or Dual-Feed Conveyor—each with distinct stored-energy hazards.',
        id: 'Pilih satu dari empat sistem industri nyata—MCC Pompa Sentrifugal, Mesin Pres Hidrolik dengan Akumulator, Mesin Pres Pneumatik dengan Ram Gravitasi, atau Konveyor Suplai Ganda—masing-masing dengan bahaya energi tersimpan yang berbeda.',
        ja: '遠心ポンプMCC、アキュムレータ付油圧プレス、重力ラム付空圧プレス、二重給電コンベヤの4つの現場シナリオから選択し、固有の残留エネルギー源を確認します。',
      },
      targetSelector: '[data-tour="loto-scenarios"]',
    },
    {
      id: 'loto-workflow',
      badge: { en: 'Feature 2 · 6-Step LOTO', id: 'Fitur 2 · Alur 6 Langkah', ja: '機能2 · 6段階手順' },
      title: {
        en: 'OSHA 6-Step LOTO Sequence Tracker',
        id: 'Pelacak Urutan 6 Langkah LOTO OSHA',
        ja: 'OSHA 6段階 LOTO手順トラッカー',
      },
      description: {
        en: 'Follow the mandatory 6-step sequence: 1. Notify, 2. Shutdown, 3. Isolate, 4. Lock & Tag, 5. Bleed/Block Stored Energy, and 6. Verify Zero Energy. Each step updates live as you perform actions.',
        id: 'Ikuti urutan wajib 6 langkah: 1. Pemberitahuan, 2. Penghentian Normal, 3. Isolasi Sumber Energi, 4. Penguncian & Pelabelan, 5. Pengurasan/Penahanan Energi Tersimpan, dan 6. Verifikasi Energi Nol.',
        ja: '必須の6段階手順（1.通知 → 2.通常停止 → 3.エネルギー遮断 → 4.施錠・タグ取付 → 5.残留エネルギー放出/拘束 → 6.ゼロエネルギー確認）の進捗を確認します。',
      },
      tip: {
        en: 'Always press normal Stop before opening a load-break MCC disconnect to prevent arc-flash under load.',
        id: 'Selalu tekan tombol Henti normal sebelum membuka sakelar pemutus MCC untuk mencegah busur api listrik (arc-flash) saat berbeban.',
        ja: '負荷運転中のアークフラッシュを防ぐため、MCC遮断器を開く前に必ず通常停止操作を行ってください。',
      },
      targetSelector: '[data-tour="loto-workflow"]',
    },
    {
      id: 'loto-isolation-controls',
      badge: { en: 'Feature 3 · Isolation', id: 'Fitur 3 · Kontrol Isolasi', ja: '機能3 · 遮断・施錠操作' },
      title: {
        en: 'Disconnects, Padlocks, Tags, Bleed Valves & Gravity Blocks',
        id: 'Pemutus Daya, Gembok, Label, Katup Penguras & Penahan Gravitasi',
        ja: '遮断器・南京錠・タグ・ブリード弁・落下防止ブロック操作',
      },
      description: {
        en: 'Operate the MCC disconnect, attach your personal padlock and signed Danger Tag, close process isolation valves, open bleed/dump valves, insert mechanical gravity blocks, and allow VFD capacitors to discharge.',
        id: 'Operasikan pemutus MCC, pasang gembok pribadi dan Label Bahaya bertanda tangan, tutup katup isolasi proses, buka katup penguras (bleed/dump), pasang penahan mekanis gravitasi, dan tunggu pengosongan kapasitor VFD.',
        ja: 'MCC遮断器の開放、個人南京錠と署名入り危険タグの取付、プロセス弁の閉止、ブリード弁の開放、重力落下防止ブロックの挿入、VFDコンデンサ放電待機を行います。',
      },
      targetSelector: '[data-tour="loto-isolation-controls"]',
    },
    {
      id: 'loto-schematic',
      badge: { en: 'Feature 4 · Plant View', id: 'Fitur 4 · Skematik Pabrik', ja: '機能4 · 設備系統図' },
      title: {
        en: 'Live Energy-State Plant Schematic',
        id: 'Skematik Pabrik dengan Status Energi Langsung',
        ja: 'エネルギー状態リアルタイム設備系統図',
      },
      description: {
        en: 'Inspect live energized vs. isolated paths on the schematic—including MCC breaker position, padlock/tag icons, accumulator pressure gauge, mechanical block, and secondary backfeed lines.',
        id: 'Periksa jalur berenergi vs. terisolasi secara langsung pada skematik—termasuk posisi pemutus MCC, ikon gembok/label, pengukur tekanan akumulator, penahan mekanis, serta jalur umpan balik sekunder.',
        ja: 'MCC遮断器状態、南京錠・タグ表示、アキュムレータ圧力計、機械ブロック、二次側逆給電ラインの通電・遮断状態を系統図で確認します。',
      },
      targetSelector: '[data-tour="loto-schematic"]',
    },
    {
      id: 'loto-verification',
      badge: { en: 'Feature 5 · Verify', id: 'Fitur 5 · Verifikasi Nol', ja: '機能5 · ゼロ確認試験' },
      title: {
        en: 'Live-Dead-Live Multimeter & Start Try-Out',
        id: 'Uji Multimeter Live-Dead-Live & Uji Coba Penyalaan (Try-Out)',
        ja: 'Live-Dead-Live検電・起動テスト（Try-Out）',
      },
      description: {
        en: 'Complete the 3-step Live-Dead-Live test (Known Live → Target Dead 0 V → Re-test Known Live), verify 0.0 bar pressure, and press Start Try-Out to prove the equipment cannot start.',
        id: 'Selesaikan uji 3-langkah Live-Dead-Live (Sumber Hidup → Target Mati 0 V → Uji Ulang Sumber Hidup), pastikan tekanan 0,0 bar, dan tekan Uji Coba Start (Try-Out) untuk membuktikan mesin tidak dapat menyala.',
        ja: '3段階のLive-Dead-Live検電（既知活線確認→対象無電圧0V確認→再活線確認）、圧力0.0 bar確認、起動ボタン押下によるTry-Outを完了します。',
      },
      faqs: [
        {
          q: {
            en: 'Why must I re-test the multimeter on a known live source after measuring 0 V?',
            id: 'Mengapa multimeter harus diuji ulang pada sumber hidup setelah mengukur 0 V?',
            ja: '対象で0 Vを確認した後、なぜ既知の活線で再度テスタを確認するのですか？',
          },
          a: {
            en: 'A meter fuse could blow or a test lead could break during measurement, causing a false 0 V reading on a live circuit. Re-testing on a known live source proves the meter was working throughout.',
            id: 'Sekering multimeter bisa putus atau kabel ukur dapat rusak saat pengukuran sehingga menampilkan pembacaan 0 V palsu pada sirkuit bertegangan. Menguji ulang pada sumber hidup membuktikan alat ukur tetap berfungsi baik.',
            ja: '測定中にヒューズ切れやリード断線が起きると、活線でも誤って0 Vと表示されるためです。再確認により測定器が正常だったことを証明します。',
          },
          keywords: ['live-dead-live', 'multimeter', 're-test', '0 v', 'fuse', 'uji', '検電'],
        },
      ],
      targetSelector: '[data-tour="loto-verification"]',
    },
    {
      id: 'loto-hazard-audit',
      badge: { en: 'Feature 6 · Hazard Audit', id: 'Fitur 6 · Audit Bahaya', ja: '機能6 · 危険監査モード' },
      title: {
        en: 'Fault & Hazard Audit Mode',
        id: 'Mode Audit Gangguan & Bahaya Tersembunyi',
        ja: '危険・違反監査モード',
      },
      description: {
        en: 'Activate Hazard Audit faults—Trapped Accumulator Pressure, Dual Backfeed Source, Tag-Only Without Lock, or Skipped Try-Out—to practice spotting lethal LOTO violations before work begins.',
        id: 'Aktifkan skenario Audit Bahaya—Tekanan Akumulator Terjebak, Sumber Umpan Balik Ganda, Label Tanpa Gembok (Tag-Only), atau Melewatkan Try-Out—untuk berlatih mendeteksi pelanggaran LOTO fatal sebelum pekerjaan dimulai.',
        ja: '残留アキュムレータ圧力、二重逆給電、タグのみ（無施錠）、Try-Out省略などの危険状態を注入し、作業開始前に致命的なLOTO違反を見抜く訓練を行います。',
      },
      faqs: [
        {
          q: {
            en: 'Why is Tag-Only isolation prohibited on a lockable disconnect?',
            id: 'Mengapa isolasi dengan label saja (Tag-Only) dilarang pada pemutus yang dapat digembok?',
            ja: '施錠可能な遮断器でタグのみ（Tag-Only）が禁止されている理由は？',
          },
          a: {
            en: 'A paper tag is only a warning and cannot physically prevent someone from closing the breaker. OSHA 1910.147 requires a personal padlock whenever an energy-isolating device is capable of being locked out.',
            id: 'Label kertas hanyalah peringatan dan tidak dapat mencegah seseorang menutup pemutus secara fisik. Standar OSHA 1910.147 mewajibkan gembok pribadi setiap kali perangkat isolasi dapat dikunci.',
            ja: 'タグは警告表示に過ぎず、誤って遮断器を投入する行為を物理的に防げないためです。施錠可能な機器には必ず個人用南京錠が必要です。',
          },
          keywords: ['tag-only', 'padlock', 'lock', 'osha', 'violation', 'gembok', 'タグ'],
        },
      ],
      targetSelector: '[data-tour="loto-hazard-audit"]',
    },
    {
      id: 'loto-safety-banner',
      badge: { en: 'Feature 7 · Safety Status', id: 'Fitur 7 · Status Keselamatan', ja: '機能7 · 安全状態バナー' },
      title: {
        en: 'Zero-Energy State & Permit-to-Work Banner',
        id: 'Banner Status Energi Nol & Izin Kerja Aman',
        ja: 'ゼロエネルギー状態・安全作業許可バナー',
      },
      description: {
        en: 'Check this top status banner for live hazard warnings and confirmation of whether Zero-Energy State is verified so maintenance can safely begin.',
        id: 'Periksa banner status teratas ini untuk melihat peringatan bahaya aktif dan konfirmasi apakah Kondisi Energi Nol telah terverifikasi sehingga pemeliharaan dapat dimulai dengan aman.',
        ja: '上部の状態バナーで残留危険の警告や、ゼロエネルギー状態が検証済みで保守作業を開始できるかをリアルタイムで確認します。',
      },
      targetSelector: '[data-tour="loto-safety-banner"]',
    },
    {
      id: 'loto-workflow-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review OSHA 1910.147 rules, compute capacitor discharge and accumulator energy, and pass the LOTO certification quiz.',
        id: 'Gunakan Alt+1 (Eksplorasi), Alt+2 (Simulasi), Alt+3 (Latihan), dan Alt+4 (Kuis) untuk mempelajari aturan OSHA 1910.147, menghitung pengosongan kapasitor dan energi akumulator, serta lulus kuis sertifikasi LOTO.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）でOSHA 1910.147理論や放電時間計算の演習、LOTO認定クイズまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],
};
