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
        en: 'Welcome! Practice non-contact infrared thermography on live industrial equipment. Compare Displayed Reading against True Center temperature and diagnose how optics (D:S) and emissivity (ε) cause measurement errors.',
        id: 'Selamat datang! Praktikkan termografi inframerah nonkontak pada peralatan industri. Bandingkan Pembacaan Alat dengan Suhu Pusat Sebenarnya serta diagnosis pengaruh rasio optik (D:S) dan emisivitas (ε) terhadap galat pengukuran.',
        ja: 'ようこそ！産業設備の非接触赤外線温度計測を実習します。指示温度と中心真値を比較し、光学比（D:S）や放射率（ε）が誤差に与える影響を診断しましょう。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'ir-modes',
      badge: { en: 'Feature 1 · View Mode', id: 'Fitur 1 · Mode Tampil', ja: '機能1 · 表示モード' },
      title: {
        en: 'Spot Pyrometer vs. Thermal Overlay',
        id: 'Pirometer Spot vs. Tampilan Termal',
        ja: 'スポット温度計とサーモ表示の切替',
      },
      description: {
        en: 'Switch between Spot Pyrometer and Thermal Overlay in the top bar, or click Reset to restore defaults. In Thermal mode, pick Ironbow or Rainbow palettes in the lower control panel.',
        id: 'Beralihlah antara Pirometer Spot dan Tampilan Termal (Overlay) di bilah atas, atau klik Reset untuk mengembalikan pengaturan awal. Pada mode Termal, pilih palet warna Ironbow atau Rainbow di panel kontrol bawah.',
        ja: '上部バーで「スポット温度計」と「サーモ表示」を切り替え、「リセット」で初期状態に戻せます。サーモ表示では下部パネルでIronbow / Rainbowパレットを選択できます。',
      },
      tip: {
        en: 'Use Thermal Overlay to scan the whole equipment housing for hot spots before taking a precision spot reading.',
        id: 'Gunakan Tampilan Termal untuk memindai seluruh badan peralatan guna menemukan titik panas sebelum membidik secara presisi.',
        ja: 'まずサーモ表示で設備全体の高温箇所を特定し、その後スポット計測で精査するのが現場の基本です。',
      },
      targetSelector: '[data-tour="ir-mode-bar"]',
    },
    {
      id: 'ir-viewport',
      badge: { en: 'Feature 2 · Aiming', id: 'Fitur 2 · Bidikan', ja: '機能2 · 照準操作' },
      title: {
        en: 'Interactive Thermography Viewport',
        id: 'Area Simulasi Termografi Interaktif',
        ja: '対話型サーモグラフィビューポート',
      },
      description: {
        en: 'Click or drag anywhere on the equipment SVG to aim the IR crosshair. The outer ring shows the true D:S spot circle so you can visually check whether background surfaces spill into your measurement.',
        id: 'Klik atau seret pada gambar peralatan untuk mengarahkan bidikan IR. Lingkaran luar menunjukkan ukuran area ukur (spot) D:S sehingga Anda dapat memeriksa apakah permukaan latar belakang ikut terukur.',
        ja: '設備SVG上の任意の位置をクリックまたはドラッグしてIR照準を合わせます。外側の円が実際のD:Sスポット径を示し、背景温度の混入を視覚的に確認できます。',
      },
      tip: {
        en: 'Keep the entire D:S spot circle inside the hot target—never let the circle spill onto cooler surrounding air or steel.',
        id: 'Pastikan seluruh lingkaran spot D:S berada di dalam target panas—jangan sampai melebar ke permukaan sekitar atau baja yang lebih dingin.',
        ja: 'D:Sスポット円全体が測定対象の内側に収まるように照準と距離を調整してください。',
      },
      targetSelector: '[data-tour="ir-viewport"]',
    },
    {
      id: 'ir-quick-aim',
      badge: { en: 'Feature 3 · Targets', id: 'Fitur 3 · Target', ja: '機能3 · 検査点' },
      title: {
        en: 'Quick-Aim Zones & Electrical Tape Patch',
        id: 'Zona Inspeksi Cepat & Pita Isolasi Listrik',
        ja: '検査ポイント選択と絶縁テープ補正',
      },
      description: {
        en: 'Click any Quick-Aim Inspection Zones pill to snap to critical test points. On shiny low-ε metals, click + Apply Electrical Tape Patch (ε = 0.95) to create a high-emissivity reference surface.',
        id: 'Klik tombol Zona Inspeksi Cepat untuk membidik titik uji kritis secara langsung. Pada logam mengilap beremisivitas rendah, klik + Tempel Isolasi Listrik (ε = 0,95) untuk membuat permukaan referensi beremisivitas tinggi.',
        ja: '「検査ポイント選択」ボタンで主要点検箇所へ素早く照準を合わせられます。光沢金属など低放射率対象には「+ 絶縁テープを貼る」（ε = 0.95）で基準面を作れます。',
      },
      tip: {
        en: 'Black PVC electrical tape is a standard field trick for measuring bare copper busbars or polished stainless shafts.',
        id: 'Pita isolasi listrik PVC hitam merupakan teknik lapangan standar untuk mengukur busbar tembaga polos atau poros baja mengilap.',
        ja: '黒色絶縁テープは、裸銅ブスバーや研磨シャフトを正確に測るための現場定番テクニックです。',
      },
      faqs: [
        {
          q: {
            en: 'Why apply electrical tape on shiny metal?',
            id: 'Mengapa perlu menempelkan pita isolasi listrik pada logam mengilap?',
            ja: '光沢金属に絶縁テープを貼る理由は？',
          },
          a: {
            en: 'Bare shiny metals have very low emissivity (ε ≈ 0.05–0.20) and act like mirrors reflecting ambient heat. Matte black tape raises ε to 0.95 so the pyrometer reads true surface temperature.',
            id: 'Logam mengilap memiliki emisivitas sangat rendah (ε ≈ 0,05–0,20) dan memantulkan radiasi panas sekitar seperti cermin. Pita isolasi hitam matte menaikkan ε menjadi 0,95 agar pembacaan pirometer akurat.',
            ja: '光沢金属は放射率が非常に低く（ε ≈ 0.05〜0.20）周囲の熱を反射するため誤差が大きくなります。黒テープでε=0.95にすることで真値に近づきます。',
          },
          keywords: ['tape', 'shiny', 'metal', 'emissivity', 'isolasi', 'logam', 'テープ'],
        },
      ],
      targetSelector: '[data-tour="ir-quick-aim"]',
    },
    {
      id: 'ir-scenes',
      badge: { en: 'Feature 4 · Scenes', id: 'Fitur 4 · Skenario', ja: '機能4 · 検査シーン' },
      title: {
        en: 'Industrial Inspection Scene Selector',
        id: 'Pemilih Skenario Inspeksi Industri',
        ja: '産業設備検査シーン選択',
      },
      description: {
        en: 'Switch between plant inspection scenes (such as MCC Breaker, Bearing Housing, Steam Trap, and Busbar) to practice thermography on different target sizes and surface materials.',
        id: 'Beralih antar skenario inspeksi pabrik (seperti Pemutus MCC, Rumah Bantalan, Steam Trap, dan Busbar) untuk berlatih pada berbagai ukuran target dan material permukaan.',
        ja: 'MCC遮断器、軸受ハウジング、スチームトラップ、ブスバーなど複数の検査シーンを切り替え、異なる対象サイズや表面材質での計測を実習します。',
      },
      tip: {
        en: 'Each scene has different hot-spot dimensions and surface finishes—check both D:S and ε whenever you switch scenes.',
        id: 'Setiap skenario memiliki ukuran titik panas dan kondisi permukaan yang berbeda—selalu periksa D:S dan ε setiap kali berpindah skenario.',
        ja: 'シーンごとに対象サイズと表面状態が異なるため、切替時はD:Sとεの両方を再確認してください。',
      },
      targetSelector: '[data-tour="ir-scenes"]',
    },
    {
      id: 'ir-optics',
      badge: { en: 'Feature 5 · Optics', id: 'Fitur 5 · Optik', ja: '機能5 · 光学比' },
      title: {
        en: 'D:S Ratio & Inspection Distance (D)',
        id: 'Rasio Optik (D:S) & Jarak Inspeksi (D)',
        ja: '光学比 (D:S) と測定距離 (D)',
      },
      description: {
        en: 'Toggle Optics Ratio (D:S) between 12:1 and 30:1, and drag the Inspection Distance (D) slider from 15 to 300 cm. Watch Spot Ø grow with distance and dilute hot-spot readings when the spot exceeds the target.',
        id: 'Ubah Rasio Optik (D:S) antara 12:1 dan 30:1, lalu atur penggeser Jarak Inspeksi (D) dari 15 hingga 300 cm. Amati diameter spot (Spot Ø) yang membesar dan mendilusi pembacaan titik panas apabila melebihi ukuran target.',
        ja: '光学比（D:S）を12:1と30:1で切り替え、測定距離（D）スライダー（15〜300 cm）を調整します。距離が伸びてスポット径（Spot Ø）が対象より大きくなると測定値が平均化されます。',
      },
      tip: {
        en: 'At 120 cm with 12:1 optics, Spot Ø = 10 cm. Switching to 30:1 shrinks Spot Ø to 4 cm at the exact same distance!',
        id: 'Pada jarak 120 cm dengan optik 12:1, Spot Ø = 10 cm. Beralih ke 30:1 mengecilkan Spot Ø menjadi 4 cm pada jarak yang sama!',
        ja: '距離120 cmでは12:1のスポット径は10 cmですが、30:1に切り替えると4 cmまで絞れます。',
      },
      targetSelector: '[data-tour="ir-optics"]',
    },
    {
      id: 'ir-emissivity',
      badge: { en: 'Feature 6 · Emissivity', id: 'Fitur 6 · Emisivitas', ja: '機能6 · 放射率' },
      title: {
        en: 'Instrument Emissivity (ε) & Material Presets',
        id: 'Emisivitas Alat (ε) & Prasetel Material',
        ja: '放射率設定 (ε) と材質プリセット',
      },
      description: {
        en: 'Adjust Instrument Emissivity (ε = 0.10–1.00) or click a material preset button, and tune Reflected Ambient Temp (T_refl, 15–45 °C) below to see how background reflection skews low-ε measurements.',
        id: 'Atur Emisivitas Alat (ε = 0,10–1,00) atau pilih prasetel material, lalu atur Suhu Pantul Sekitar (T_refl, 15–45 °C) di bagian bawah untuk melihat pengaruh pantulan panas pada permukaan beremisivitas rendah.',
        ja: '放射率設定（ε = 0.10〜1.00）や材質プリセットを調整し、下部の反射周囲温度（T_refl, 15〜45 °C）で低放射率表面における周囲熱反射の影響を確認できます。',
      },
      tip: {
        en: 'Setting ε too high on a shiny surface causes the pyrometer to under-read dramatically.',
        id: 'Menyetel ε terlalu tinggi pada permukaan mengilap menyebabkan pirometer menampilkan suhu jauh lebih rendah daripada suhu sebenarnya.',
        ja: '光沢面に対してεを高く設定しすぎると、指示温度が真値より大幅に低く表示されます。',
      },
      targetSelector: '[data-tour="ir-emissivity"]',
    },
    {
      id: 'ir-diagnostics',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis Masalah', ja: '機能7 · 誤差診断' },
      title: {
        en: 'Troubleshooting Total Error (ΔT)',
        id: 'Diagnosis Total Galat (ΔT)',
        ja: '総合誤差 (ΔT) の原因切り分け',
      },
      description: {
        en: 'Compare Displayed Reading against True Center. When Total Error (ΔT) turns red (> ±5 °C), check the D:S vs. ε split: move closer or switch to 30:1 if D:S error dominates, or match ε / apply tape if ε error dominates.',
        id: 'Bandingkan Pembacaan Alat dengan Suhu Pusat Sebenarnya. Saat Total Galat (ΔT) berwarna merah (> ±5 °C), periksa rincian galat D:S vs. ε: dekati target atau pilih optik 30:1 bila galat D:S besar, atau sesuaikan ε maupun pasang pita isolasi bila galat ε dominan.',
        ja: '指示温度と中心真値を比較します。総合誤差（ΔT）が赤色（±5 °C超）になったらD:S誤差とε誤差の内訳を確認し、距離を詰める／30:1へ切替、または放射率調整・テープ貼付で誤差を解消します。',
      },
      tip: {
        en: 'Goal: bring both D:S error and ε error near 0.0 °C so |ΔT| stays green.',
        id: 'Sasaran: tekan galat D:S dan galat ε mendekati 0,0 °C agar |ΔT| tetap hijau.',
        ja: 'D:S誤差とε誤差の両方を0.0 °C付近に抑え、|ΔT|が緑色になる状態を目指しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why does my IR reading drop when I step back?',
            id: 'Mengapa pembacaan IR turun saat saya mundur?',
            ja: '測定対象から離れると温度が低く表示されるのはなぜ？',
          },
          a: {
            en: 'As distance D increases, the Spot Ø widens beyond the hot target and averages in cooler background pixels (D:S spot-averaging error). Step closer or use 30:1 optics.',
            id: 'Saat jarak D bertambah, diameter Spot Ø melebar melebihi target panas dan ikut merata-ratakan suhu latar yang lebih dingin (galat perataan spot D:S). Dekati target atau gunakan optik 30:1.',
            ja: '距離Dが伸びるとスポット径が対象より大きくなり、周囲の低温背景を平均化してしまうためです（D:S誤差）。近づくか30:1光学系を使用します。',
          },
          keywords: ['drop', 'distance', 'spot', 'error', 'turun', 'jarak', '距離', '誤差'],
        },
      ],
      targetSelector: '[data-tour="ir-error-readout"]',
    },
    {
      id: 'ir-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use the header tabs or keyboard shortcuts Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study theory, test scenarios, and verify your thermography skills.',
        id: 'Gunakan tab di bagian atas atau pintasan papan ketik Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari teori, berlatih skenario, dan menguji keterampilan termografi Anda.',
        ja: '上部タブまたはショートカット Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で理論学習から理解度確認まで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Measure rotating shaft speed without contact using either an optical 650 nm Laser Tachometer or a harmonic Stroboscope coupled to a variable-frequency motor drive.',
        id: 'Selamat datang! Ukur kecepatan poros berputar secara nonkontak menggunakan Takometer Laser optik 650 nm atau Stroboskop harmonik yang terhubung ke penggerak motor frekuensi variabel (VFD).',
        ja: 'ようこそ！650 nm光学レーザータコメータとストロボスコープの2方式で、VFD駆動モータの非接触回転速度計測と高調波現象を学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'tach-mode-laser',
      badge: { en: 'Feature 1 · Instrument', id: 'Fitur 1 · Instrumen', ja: '機能1 · 計測制御' },
      title: {
        en: 'Instrument Mode, Shaft Run & Laser/Strobe',
        id: 'Mode Instrumen, Poros & Laser/Strobo',
        ja: '計測モード・回転制御・レーザー/ストロボ',
      },
      description: {
        en: 'Switch Instrument Mode between Laser Tachometer and Stroboscope, and use Pause Shaft / Run Shaft to freeze or resume rotation. Toggle the 650 nm Laser Emitter or tune Strobe Flash Rate (200–6000 FPM) with 1×/2×/½× shortcuts.',
        id: 'Pilih Mode Instrumen antara Takometer Laser dan Stroboskop, serta gunakan Jeda/Putar Poros untuk menghentikan atau melanjutkan putaran. Aktifkan Pemancar Laser 650 nm atau atur Laju Kilat Strobo (200–6000 FPM) dengan pintasan 1×/2×/½×.',
        ja: '「レーザータコメータ」と「ストロボスコープ」を切り替え、「回転停止 / 再開」で軸を制御します。650 nmレーザー照射のON/STANDBYやストロボ発光周波数（1×/2×/½×含む）を設定できます。',
      },
      tip: {
        en: 'In Stroboscope mode, click 2× RPM to see two phantom tape marks 180° apart, then click 1× RPM to confirm true speed.',
        id: 'Pada mode Stroboskop, klik 2× RPM untuk mengamati dua bayangan pita yang terpisah 180°, lalu klik 1× RPM untuk memastikan kecepatan sebenarnya.',
        ja: 'ストロボモードで「2× RPM」を押すと180°対向の二重像が現れます。「1× RPM」で真の同期速度を確認できます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I avoid harmonic errors with a stroboscope?',
            id: 'Bagaimana cara menghindari kesalahan harmonik pada stroboskop?',
            ja: 'ストロボ計測で高調波による誤読を防ぐには？',
          },
          a: {
            en: 'Start high and work down, or check for a single stationary mark. At 2× RPM you see two marks 180° apart; at ½× RPM you still see one mark, so double FPM—if you still see one mark, you were at ½×.',
            id: 'Mulailah dari laju kilat tinggi lalu turunkan bertahap, atau periksa jumlah tanda diam: pada 2× RPM muncul dua tanda terpisah 180°; pada ½× RPM tetap muncul satu tanda, jadi gandakan FPM untuk memastikannya.',
            ja: '2× RPMでは2つの像が180°対向して見えます。½× RPMでは像が1つに見えますが、FPMを2倍にしても像が1つなら真値です。',
          },
          keywords: ['harmonic', 'stroboscope', '2x', 'double', 'harmonik', 'bayangan', '高調波'],
        },
      ],
      targetSelector: '[data-tour="tach-mode-panel"]',
    },
    {
      id: 'tach-viewport',
      badge: { en: 'Feature 2 · Aiming', id: 'Fitur 2 · Bidikan', ja: '機能2 · 照準操作' },
      title: {
        en: 'Interactive Shaft & Reflective Tape Aiming',
        id: 'Poros Interaktif & Bidikan Pita Reflektif',
        ja: '回転軸ビューポートと反射テープ照準',
      },
      description: {
        en: 'Drag or click inside the CAD viewport to aim the 650 nm optical beam onto the rotating reflective tape target. If the beam misses the tape or laser is in STANDBY, the live RPM readout drops to "---.-".',
        id: 'Seret atau klik di dalam area simulasi CAD untuk mengarahkan sinar optik 650 nm tepat ke pita reflektif pada poros berputar. Jika sinar tidak mengenai pita atau laser dalam status STANDBY, pembacaan RPM akan menampilkan "---.-".',
        ja: 'CADビューポート内で650 nmレーザー照準をドラッグまたはクリックし、回転軸上の反射テープに合わせます。テープから外れるか待機中だとRPM表示は「---.-」になります。',
      },
      tip: {
        en: 'In real plants, keep the laser at a slight 10–15° angle to avoid specular glare from shiny shafts.',
        id: 'Di lingkungan pabrik nyata, arahkan laser sedikit miring 10–15° untuk menghindari pantulan silau dari poros mengilap.',
        ja: '実機では光沢軸からの正反射を避けるため、レーザーを10〜15°傾けて照射するのが基本です。',
      },
      targetSelector: '[data-tour="tach-viewport"]',
    },
    {
      id: 'tach-vfd',
      badge: { en: 'Feature 3 · VFD Drive', id: 'Fitur 3 · Penggerak VFD', ja: '機能3 · VFD駆動' },
      title: {
        en: 'VFD Frequency, Poles & Load Torque',
        id: 'Frekuensi VFD, Kutub & Torsi Beban',
        ja: 'VFD周波数・極数・軸負荷トルク',
      },
      description: {
        en: 'Load a VFD Motor Drive preset or tune VFD Supply Frequency (10–60 Hz), Motor Pole Count (2P–8P), and Shaft Load Torque (0–100%) to vary real rotor speed and mechanical slip.',
        id: 'Pilih prasetel Penggerak Motor VFD atau atur Frekuensi Suplai VFD (10–60 Hz), Jumlah Kutub (2P–8P), dan Torsi Beban Poros (0–100%) untuk mengubah kecepatan rotor dan slip mekanis.',
        ja: 'VFDプリセットを選ぶか、VFD電源周波数（10〜60 Hz）、モータ極数（2P〜8P）、軸負荷トルク（0〜100%）を調整して実回転数とすべりを変化させます。',
      },
      tip: {
        en: 'Doubling pole count (e.g. 2P → 4P) halves synchronous speed Ns = 120f/P.',
        id: 'Menggandakan jumlah kutub (mis. 2P → 4P) membagi dua kecepatan sinkron Ns = 120f/P.',
        ja: '極数を2倍（例：2P→4P）にすると同期速度 Ns = 120f/P は半分になります。',
      },
      targetSelector: '[data-tour="tach-vfd-drive"]',
    },
    {
      id: 'tach-drive-summary',
      badge: { en: 'Feature 4 · Slip Physics', id: 'Fitur 4 · Fisika Slip', ja: '機能4 · 同期とすべり' },
      title: {
        en: 'Synchronous Speed (Ns), Rotor Nr & Slip s%',
        id: 'Kecepatan Sinkron (Ns), Rotor Nr & Slip s%',
        ja: '同期速度 Ns・実回転 Nr・すべり s%',
      },
      description: {
        en: 'Compare theoretical synchronous speed Ns = 120f/P against actual loaded rotor speed Nr and Slip s%. Increasing Shaft Load Torque pulls Nr below Ns and raises slip.',
        id: 'Bandingkan kecepatan sinkron teoretis Ns = 120f/P dengan putaran rotor aktual Nr dan Slip s%. Menambah Torsi Beban menurunkan Nr di bawah Ns dan menaikkan slip.',
        ja: '理論同期速度 Ns = 120f/P と実回転数 Nr・すべり s% を比較します。軸負荷トルクが増えるとNrが低下し、すべりs%が上昇します。',
      },
      tip: {
        en: 'Typical 4-pole induction motors run at 2–4% slip at full load; excessive slip (> 5%) signals overload or low voltage.',
        id: 'Motor induksi 4-kutub normal memiliki slip 2–4% saat beban penuh; slip > 5% menandakan beban lebih.',
        ja: '標準的な4極誘導電動機の全負荷すべりは2〜4%程度です。5%を超える場合は過負荷の兆候です。',
      },
      targetSelector: '[data-tour="tach-drive-summary"]',
    },
    {
      id: 'tach-diagnostics',
      badge: { en: 'Feature 5 · Troubleshoot', id: 'Fitur 5 · Diagnosis Masalah', ja: '機能5 · 診断・誤差' },
      title: {
        en: 'Hold Memory & Harmonic Alias Troubleshooting',
        id: 'Memori Penahanan (Hold) & Diagnosis Alias Harmonik',
        ja: 'ホールド計測と高調波エイリアス診断',
      },
      description: {
        en: 'Troubleshoot speed drops by comparing MIN/AVG/MAX Hold against Ns (or click Reset Min/Max). In Stroboscope mode, verify Apparent Images = 1 and Alias Drift = 0.0 RPM—2× FPM creates false double images.',
        id: 'Diagnosis penurunan putaran dengan membandingkan nilai MIN/AVG/MAX Hold terhadap Ns (atau klik Reset Min/Maks). Pada mode Stroboskop, pastikan Jumlah Bayangan = 1 dan Geser Alias = 0,0 RPM agar tidak keliru membaca citra ganda harmonik 2×.',
        ja: 'MIN/AVG/MAXホールド値とNsを比較して負荷によるすべり増加を診断します。ストロボモードでは見かけの像数=1、ドリフト=0.0 RPMを確認し、2×高調波の二重像による誤読を防ぎます。',
      },
      tip: {
        en: 'If Laser RPM shows "---.-", check two things: is LASER ON active, and is the red dot aimed on the reflective tape?',
        id: 'Jika RPM Laser menampilkan "---.-", periksa dua hal: apakah LASER AKTIF sudah menyala, dan apakah titik merah mengarah tepat ke pita reflektif?',
        ja: 'レーザーRPMが「---.-」のままなら、レーザーON状態と反射テープへの照準位置を確認してください。',
      },
      faqs: [
        {
          q: {
            en: 'Why does the laser tachometer read "---.-"?',
            id: 'Mengapa takometer laser menampilkan "---.-"?',
            ja: 'レーザータコメータが「---.-」と表示される原因は？',
          },
          a: {
            en: 'Either the 650 nm Laser Emitter is in STANDBY, or the optical beam is aimed off the reflective tape strip on the shaft.',
            id: 'Pemancar Laser 650 nm masih dalam status SIAGA (STANDBY), atau sinar optik belum diarahkan tepat ke pita reflektif pada poros.',
            ja: '650 nmレーザーが待機中（STANDBY）になっているか、照準が軸上の反射テープから外れているためです。',
          },
          keywords: ['---', 'blank', 'no reading', 'standby', 'tape', 'tidak terbaca'],
        },
      ],
      targetSelector: '[data-tour="tach-readouts"]',
    },
    {
      id: 'tach-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Switch tabs with Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review speed formulas, complete guided measurements, and test your knowledge.',
        id: 'Gunakan pintasan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari rumus kecepatan, menyelesaikan latihan terpandu, dan mengikuti kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で各モードを切り替え、計算式と実測演習を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  lube: [
    {
      id: 'lube-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Tribology & Oil Analysis Workbench',
        id: 'Laboratorium Tribologi & Analisis Oli',
        ja: 'トライボロジー・潤滑油診断ラボ',
      },
      description: {
        en: 'Welcome! Evaluate elastohydrodynamic (EHL) oil film thickness, Stribeck lubrication regimes, ISO 4406 particle cleanliness, used-oil lab reports, and bearing grease relubrication intervals.',
        id: 'Selamat datang! Evaluasi ketebalan film oli elastohidrodinamik (EHL), rezim pelumasan Stribeck, kode kebersihan ISO 4406, laporan lab oli bekas, serta interval pelumasan ulang gemuk bantalan.',
        ja: 'ようこそ！EHL油膜厚さ、ストライベック曲線、ISO 4406清浄度、使用油ラボ診断、軸受グリース補給量計算を統合的にシミュレーションします。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'lube-scenarios',
      badge: { en: 'Feature 1 · Faults', id: 'Fitur 1 · Gangguan', ja: '機能1 · 異常シナリオ' },
      title: {
        en: 'Plant Fault Scenario Presets',
        id: 'Prasetel Skenario Gangguan Pabrik',
        ja: '異常シナリオプリセット',
      },
      description: {
        en: 'Click Healthy Gearbox, Water Ingress, Thermal Overload, or Under-Viscous Bearing to inject realistic plant lubrication faults and watch every chart and lab flag respond immediately.',
        id: 'Klik Gearbox Sehat, Masuknya Air, Beban Panas Berlebih, atau Bantalan Kurang Kental untuk mensimulasikan gangguan pelumasan pabrik secara nyata dan mengamati respons seluruh grafik serta indikator lab.',
        ja: '「正常減速機」「水分混入」「過熱・熱酸化」「低粘度軸受」をクリックすると、実設備の潤滑トラブルが再現され全グラフと診断が連動します。',
      },
      tip: {
        en: 'Try Water Ingress first—water destroys EHL film strength and triggers corrosion warnings even when viscosity looks normal.',
        id: 'Coba Masuknya Air terlebih dahulu—air merusak kekuatan film EHL dan memicu peringatan korosi meskipun viskositas tampak normal.',
        ja: 'まず「水分混入」を試してください。粘度が正常に見えてもEHL油膜強度が低下し腐食リスクが高まります。',
      },
      targetSelector: '[data-tour="lube-scenarios"]',
    },
    {
      id: 'lube-equipment',
      badge: { en: 'Feature 2 · Machine', id: 'Fitur 2 · Mesin', ja: '機能2 · 対象機器' },
      title: {
        en: 'Equipment Type & OEM Limits',
        id: 'Jenis Peralatan & Batas OEM',
        ja: '対象機器タイプとOEM基準値',
      },
      description: {
        en: 'Select an Equipment Type card (Hydraulic Unit, Worm Gear, Pump Bearing, etc.) to load its OEM-recommended ISO VG grade, optimal temperature band, and water contamination limit.',
        id: 'Pilih kartu Jenis Peralatan (Unit Hidrolik, Worm Gear, Bantalan Pompa, dll.) untuk memuat rekomendasi grade ISO VG OEM, rentang suhu optimal, dan batas kontaminasi air spesifik mesin tersebut.',
        ja: '対象機器カード（油圧ユニット、ウォーム減速機、ポンプ軸受など）を選ぶと、OEM推奨ISO VG、適正油温範囲、水分許容限界が読み込まれます。',
      },
      tip: {
        en: 'Each machine class has a different ISO 4406 cleanliness target—servo hydraulics require much cleaner oil than worm gears.',
        id: 'Setiap kelas mesin memiliki target kebersihan ISO 4406 yang berbeda—sistem hidrolik servo menuntut oli jauh lebih bersih daripada roda gigi cacing (worm gear).',
        ja: '機器ごとにISO 4406清浄度目標が異なり、油圧システムは減速機より厳しい清浄度が求められます。',
      },
      targetSelector: '[data-tour="lube-equipment"]',
    },
    {
      id: 'lube-vg',
      badge: { en: 'Feature 3 · Viscosity', id: 'Fitur 3 · Viskositas', ja: '機能3 · 粘度選定' },
      title: {
        en: 'ISO VG Viscosity Grade Selector',
        id: 'Pemilih Grade Viskositas ISO VG',
        ja: 'ISO VG 粘度グレード選択',
      },
      description: {
        en: 'Pick an ISO VG grade from 32 to 680. The green dot marks the OEM-recommended grade for your selected machine; choosing too low starves the film, while too high wastes churning power.',
        id: 'Pilih grade ISO VG dari 32 hingga 680. Titik hijau menandai grade rekomendasi OEM untuk mesin terpilih; memilih terlalu rendah menipiskan film oli, sedangkan terlalu tinggi memboroskan daya akibat rugi pengadukan.',
        ja: 'ISO VG 32〜680を選択します。緑点がOEM推奨グレードです。低すぎると油膜切れ、高すぎると攪拌損失による発熱を招きます。',
      },
      tip: {
        en: 'Match the green dot first, then test what happens to λ ratio if you drop two ISO VG grades.',
        id: 'Cocokkan titik hijau terlebih dahulu, lalu uji pengaruh penurunan dua tingkat ISO VG terhadap rasio λ.',
        ja: 'まず緑点の推奨粘度に合わせ、そこから2段階下げたときのλ比低下を比較してみましょう。',
      },
      targetSelector: '[data-tour="lube-vg"]',
    },
    {
      id: 'lube-temp-water',
      badge: { en: 'Feature 4 · Conditions', id: 'Fitur 4 · Kondisi', ja: '機能4 · 温度・水分' },
      title: {
        en: 'Operating Temp & Water Contamination',
        id: 'Suhu Operasi & Kontaminasi Air',
        ja: '運転油温・水分混入量スライダー',
      },
      description: {
        en: 'Drag Operating Temp (20–110 °C) and Water Contamination (0–2000 ppm) against the displayed Optimal range and Water Limit. Rising temperature thins viscosity exponentially.',
        id: 'Atur penggeser Suhu Operasi (20–110 °C) dan Kontaminasi Air (0–2000 ppm) terhadap rentang Optimal dan Batas Air yang ditampilkan. Kenaikan suhu mengencerkan viskositas secara eksponensial.',
        ja: '運転油温（20〜110 °C）と水分混入量（0〜2000 ppm）を適正範囲・限界値と見比べながら調整します。高温は粘度を急激に低下させます。',
      },
      tip: {
        en: 'Every +10 °C above 60 °C halves oil oxidation life (Arrhenius rule) and drops film thickness.',
        id: 'Setiap kenaikan +10 °C di atas 60 °C memotong separuh umur oksidasi oli (aturan Arrhenius) dan menurunkan ketebalan film.',
        ja: 'アレニウス則により油温が10 °C上がるごとに潤滑油の酸化寿命は半減します。',
      },
      targetSelector: '[data-tour="lube-temp-water"]',
    },
    {
      id: 'lube-wear-rul',
      badge: { en: 'Feature 5 · Oxidation & Wear', id: 'Fitur 5 · Aus & RUL', ja: '機能5 · 摩耗・寿命' },
      title: {
        en: 'Wear Particle Level & Oil Oxidation RUL',
        id: 'Tingkat Partikel Keausan & RUL Oli',
        ja: '摩耗粉レベルと残存寿命 (RUL)',
      },
      description: {
        en: 'Toggle Wear Particle Level (Normal, Elevated, Severe) and monitor the live Oil Oxidation & Remaining Useful Life (RUL %) progress bar and estimated drain interval.',
        id: 'Ubah Tingkat Partikel Keausan (Normal, Meningkat, Parah), lalu pantau bilah Oksidasi Oli & Sisa Umur Pakai (RUL %) serta estimasi interval penggantian oli.',
        ja: '摩耗粉レベル（正常/注意/危険）を切り替え、下の油酸化・残存寿命（RUL %）バーと交換目安時間の変化を確認します。',
      },
      tip: {
        en: 'Severe wear particles accelerate three-body abrasion and demand immediate filtration or oil drain.',
        id: 'Partikel keausan tingkat parah mempercepat abrasi tiga benda dan menuntut filtrasi atau penggantian oli segera.',
        ja: '危険レベルの摩耗粉は三体アブレシブ摩耗を引き起こすため、早急なろ過・更油が必要です。',
      },
      targetSelector: '[data-tour="lube-wear-rul"]',
    },
    {
      id: 'lube-visuals',
      badge: { en: 'Feature 6 · EHL & Stribeck', id: 'Fitur 6 · EHL & Stribeck', ja: '機能6 · 油膜可視化' },
      title: {
        en: 'Viscosity-Temp Chart & EHL Film Canvas',
        id: 'Grafik Viskositas-Suhu & Kanvas Film EHL',
        ja: '粘度温度曲線とEHL油膜キャンバス',
      },
      description: {
        en: 'Inspect the Viscosity-Temp Chart and animated EHL Film Canvas showing metal asperity contact and water/wear particles, plus the Stribeck Curve below tracking your λ ratio.',
        id: 'Amati Grafik Viskositas-Suhu dan Kanvas Film EHL yang menampilkan kontak asperitas logam serta partikel air/aus, bersama Kurva Stribeck di bawahnya untuk melacak rasio λ.',
        ja: '粘度-温度チャートと凹凸接触・水分・摩耗粉を描くEHL油膜キャンバス、下部のストライベック曲線でλ比（境界・混合・流体潤滑）を確認します。',
      },
      tip: {
        en: 'Aim for Full-Film EHL lubrication (λ > 3.0) so metal surfaces never touch.',
        id: 'Targetkan pelumasan Full-Film EHL (λ > 3,0) agar permukaan logam tidak saling bergesekan.',
        ja: '金属接触を防ぐため、λ > 3.0 の流体潤滑（Full-Film EHL）領域を維持するのが理想です。',
      },
      targetSelector: '[data-tour="lube-visuals"]',
    },
    {
      id: 'lube-iso4406',
      badge: { en: 'Feature 7 · Cleanliness', id: 'Fitur 7 · Kebersihan', ja: '機能7 · 清浄度' },
      title: {
        en: 'ISO 4406 Cleanliness & Filtration β₅',
        id: 'Kode ISO 4406 & Filtrasi β₅',
        ja: 'ISO 4406 清浄度とフィルタ β₅ 選定',
      },
      description: {
        en: 'Compare Actual Sample vs. Equipment Target ISO 4406 codes and select a Filtration Beta-Ratio (β₅) to see particle counts and the resulting a_ISO bearing life multiplier.',
        id: 'Bandingkan Kode ISO 4406 Sampel Aktual vs. Target Peralatan, lalu pilih Rasio Beta Filtrasi (β₅) untuk melihat jumlah partikel dan pengali umur bantalan a_ISO.',
        ja: '実測ISO 4406コードと機器目標を比較し、フィルタβ₅値を選択して粒子数と軸受寿命係数a_ISOの変化を確認できます。',
      },
      tip: {
        en: 'Upgrading to a high-efficiency β₅ ≥ 200 filter can double or triple rolling bearing fatigue life (a_ISO).',
        id: 'Meningkatkan filter ke β₅ ≥ 200 dapat menggandakan umur lelah bantalan (a_ISO) hingga 2–3×.',
        ja: '高性能フィルタ（β₅ ≥ 200）への更新により、軸受寿命係数a_ISOを2〜3倍に延ばせます。',
      },
      targetSelector: '[data-tour="lube-iso4406"]',
    },
    {
      id: 'lube-diagnostics',
      badge: { en: 'Feature 8 · Troubleshoot', id: 'Fitur 8 · Diagnosis Masalah', ja: '機能8 · ラボ診断' },
      title: {
        en: 'Used Oil Lab Report Diagnosis',
        id: 'Diagnosis Laporan Lab Oli Bekas',
        ja: '使用油ラボ診断レポート',
      },
      description: {
        en: 'Troubleshoot active lubrication faults by reading the 4 lab flags (Water, Viscosity, Oxidation, Wear) and following each amber Action recommendation to restore Healthy status.',
        id: 'Diagnosis gangguan pelumasan aktif dengan membaca 4 indikator lab (Air, Viskositas, Oksidasi, Keausan), lalu ikuti setiap rekomendasi Tindakan (Action) berwarna kuning untuk memulihkan status Sehat.',
        ja: '4つの診断フラグ（水分・粘度・酸化・摩耗）と改善アクション（Action）を確認し、異常シナリオから正常運転への復旧手順を特定します。',
      },
      tip: {
        en: 'Never just top up contaminated oil—address the root cause (cooler, breather, seal, or filter) shown in the Action line.',
        id: 'Jangan sekadar menambah oli baru pada oli yang terkontaminasi—atasi akar masalah (pendingin, breather, seal, atau filter) yang tertera pada baris Tindakan.',
        ja: '汚染された油に継ぎ足しするだけでは解決しません。Action欄の根本原因（冷却・ブリーザ・フィルタ等）に対処しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'How do I fix a low λ ratio or viscosity warning?',
            id: 'Bagaimana cara mengatasi peringatan rasio λ rendah atau viskositas?',
            ja: 'λ比低下や粘度警告を改善するには？',
          },
          a: {
            en: 'Either lower Operating Temp (fix cooling), step up to the OEM-recommended ISO VG grade, or remove water contamination that weakens the oil film.',
            id: 'Turunkan Suhu Operasi (perbaiki sistem pendingin), naikkan ke grade ISO VG rekomendasi OEM, atau hilangkan kontaminasi air yang melemahkan film oli.',
            ja: '運転油温を下げる（冷却改善）、OEM推奨ISO VGへ適正化する、または水分混入を除去することでλ比を回復できます。',
          },
          keywords: ['lambda', 'viscosity', 'warning', 'fix', 'viskositas', 'perbaiki', '粘度'],
        },
      ],
      targetSelector: '[data-tour="lube-lab-report"]',
    },
    {
      id: 'lube-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Navigate with Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to master tribology theory, fault cases, and certification questions.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk menguasai teori tribologi, studi kasus gangguan, dan soal sertifikasi.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で切り替えながら潤滑診断の理解を深めましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'machine-3d-explorer': [
    {
      id: 'm3d-overview',
      badge: { en: 'Overview', id: 'Ringkasan', ja: '概要' },
      title: {
        en: 'Interactive 3D Industrial Machine Explorer',
        id: 'Eksplorasi Mesin Industri 3D Interaktif',
        ja: '対話型3D産業機械エクスプローラ',
      },
      description: {
        en: 'Welcome! Orbit 360° around 9 industrial assemblies, animate staged exploded disassembly, inspect X-ray housings, and review engineering tolerances and failure modes for every component.',
        id: 'Selamat datang! Putar 360° sembilan rakitan mesin industri, animasikan pembongkaran bertahap, aktifkan mode X-Ray, serta periksa toleransi teknik dan mode kerusakan tiap komponen.',
        ja: 'ようこそ！9種類の産業機械アセンブリを360°回転し、段階的な分解アニメーション、X線透過表示、各部品の保守公差・故障モードを確認できます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'm3d-hub',
      badge: { en: 'Feature 1 · Catalog', id: 'Fitur 1 · Katalog', ja: '機能1 · 機種選択' },
      title: {
        en: 'Choose a 3D Machine Assembly',
        id: 'Pilih Rakitan Mesin 3D',
        ja: '9種類の3D産業機械を選択',
      },
      description: {
        en: 'Pick any of the 9 industrial assemblies (Process Pump, Conveyors, Air Knocker, Vibrators, Gearbox, TEFC Motor) to open the 3D CAD Studio. Return to this grid anytime via Choose Machine.',
        id: 'Pilih salah satu dari 9 rakitan mesin industri (Pompa Proses, Konveyor, Air Knocker, Vibrator, Gearbox, Motor TEFC) untuk membuka Studio CAD 3D. Anda dapat kembali ke katalog ini kapan saja melalui tombol Pilih Mesin.',
        ja: '9種類の産業機械（ポンプ、コンベヤ、エアーノッカー、バイブレータ、減速機、TEFCモータ等）から選択して3Dビューアを開きます。「機械選択」でいつでも戻れます。',
      },
      tip: {
        en: 'Start with the Process Pump or Gearbox Reducer to see multi-stage shaft, seal, and bearing disassembly.',
        id: 'Mulailah dengan Pompa Proses atau Gearbox Reducer untuk melihat pembongkaran poros, seal, dan bantalan secara bertahap.',
        ja: '最初はプロセスポンプや減速機を選ぶと、軸・シール・軸受の段階分解を分かりやすく確認できます。',
      },
      targetSelector: '[data-tour="m3d-catalog"]',
    },
    {
      id: 'm3d-toolbar',
      badge: { en: 'Feature 2 · CAD Bar', id: 'Fitur 2 · Bilah CAD', ja: '機能2 · 表示・駆動' },
      title: {
        en: 'Camera Presets, X-Ray, Pins & Drive RPM',
        id: 'Prasetel Kamera, X-Ray, Pin & Putaran Drive RPM',
        ja: '視点プリセット・透過・番号・駆動制御',
      },
      description: {
        en: 'Inside the 3D Studio, use Iso/Front/Side/Top presets, toggle X-Ray to see internal shafts, Pins for BOM numbers, Orbit for auto-rotation, and Drive + RPM (150–1750) to run the machine.',
        id: 'Di dalam Studio 3D, gunakan prasetel Iso/Depan/Samping/Atas, aktifkan X-Ray untuk melihat poros internal, Pin untuk nomor BOM, Putar untuk rotasi otomatis, serta Drive + RPM (150–1750) untuk menjalankan mesin.',
        ja: '3Dビューア上部バーで視点プリセット（立体/正面/側面/上面）、透過（X-Ray）、番号ピン、自動回転、駆動ボタンとRPM（150〜1750）を操作できます。',
      },
      tip: {
        en: 'Turn on X-Ray while running Drive to watch internal impellers, gears, and rotors spin inside closed housings.',
        id: 'Aktifkan X-Ray sambil menyalakan Drive untuk melihat impeler, roda gigi, dan rotor berputar di dalam rumah mesin yang tertutup.',
        ja: '「透過」をONにしたまま「駆動」を押すと、ケーシング内部のインペラや歯車の回転を透視確認できます。',
      },
      targetSelector: '[data-tour="m3d-toolbar"]',
    },
    {
      id: 'm3d-viewport',
      badge: { en: 'Feature 3 · 3D Canvas', id: 'Fitur 3 · Kanvas 3D', ja: '機能3 · 3D画面' },
      title: {
        en: '360° Orbit, Zoom & Direct Part Picking',
        id: 'Putar 360°, Perbesar & Pilih Komponen Langsung',
        ja: '360°回転・ズーム・部品直接クリック',
      },
      description: {
        en: 'Drag on the 3D canvas to orbit 360°, scroll to zoom (or use top-left +/-/Reset), and click any 3D part or numbered BOM pin to highlight and inspect it.',
        id: 'Seret kanvas 3D untuk memutar 360°, gulir untuk memperbesar/memperkecil (atau gunakan tombol +/-/Reset di kiri atas), lalu klik komponen 3D atau pin BOM bernomor untuk menyorot dan memeriksa spesifikasinya.',
        ja: '3Dキャンバスをドラッグして360°回転、ホイール（または左上ボタン）でズームし、部品や番号ピンを直接クリックして仕様を確認できます。',
      },
      tip: {
        en: 'Use the Reset View button in the top-left corner if you ever zoom too far in.',
        id: 'Gunakan tombol Reset View di pojok kiri atas apabila tampilan diperbesar terlalu dekat.',
        ja: '拡大しすぎた場合は左上のリセットボタンで標準視点に戻せます。',
      },
      targetSelector: '[data-tour="m3d-viewport"]',
    },
    {
      id: 'm3d-explode',
      badge: { en: 'Feature 4 · Explode', id: 'Fitur 4 · Bongkar', ja: '機能4 · 分解表示' },
      title: {
        en: 'Exploded View Scrubber & Staged/Linear',
        id: 'Penggeser Bongkar & Mode Bertahap/Linear',
        ja: '分解スライダーと段階/比例モード',
      },
      description: {
        en: 'Drag the Explode slider (0–100%) in the bottom dock, click Play/Pause to animate disassembly, and toggle between Staged (sequence-order) and Proportional (linear) explode modes.',
        id: 'Atur penggeser Bongkar (0–100%) di dok bawah, klik Play/Pause untuk animasi pembongkaran, lalu pilih antara mode Bertahap (sesuai urutan) atau Proporsional (linear).',
        ja: '下部ドックの「分解」スライダー（0〜100%）や再生ボタンで分解アニメーションを実行し、「段階 / 比例」の分解方式を切り替えられます。',
      },
      tip: {
        en: 'Staged mode pulls outer covers off before internal bearings and shafts—just like real maintenance disassembly!',
        id: 'Mode Bertahap melepas penutup luar lebih dulu sebelum bantalan dan poros dalam—seperti pembongkaran perawatan nyata!',
        ja: '「段階」モードでは外カバーが先に外れてから内部軸受・シャフトが分解されるため、実作業の分解手順を学べます。',
      },
      targetSelector: '[data-tour="m3d-explode"]',
    },
    {
      id: 'm3d-bom',
      badge: { en: 'Feature 5 · Troubleshoot', id: 'Fitur 5 · Diagnosis Masalah', ja: '機能5 · 故障・保守' },
      title: {
        en: 'Assembly Tree, Failure Modes & Solo Isolation',
        id: 'Daftar Komponen, Mode Kerusakan & Isolasi Tunggal',
        ja: '部品ツリー (BOM) と故障モード診断',
      },
      description: {
        en: 'Click any part in the Assembly Tree (BOM) to open its Part Inspector: troubleshoot wear by checking Failure Modes and Maintenance & Tolerance limits, or click Isolate Part in 3D for solo inspection.',
        id: 'Klik komponen di Daftar Komponen (BOM) untuk membuka Inspektor Komponen: periksa Mode Kerusakan dan batas Toleransi Perawatan untuk mendiagnosis keausan, atau klik Isolasi 3D untuk inspeksi tunggal.',
        ja: '部品ツリー（BOM）から部品を選ぶと、材質・機能・故障モード・保守公差基準を確認でき、摩耗や損傷の原因診断に役立ちます。単独表示（Solo）で個別拡大も可能です。',
      },
      tip: {
        en: 'Use Prev / Next in the Part Inspector to step systematically through every wear item in the BOM.',
        id: 'Gunakan tombol Prev / Next di Inspektor Komponen untuk memeriksa setiap komponen aus dalam BOM secara berurutan.',
        ja: 'インスペクタの「前へ / 次へ」でBOM内の消耗部品を順番に点検できます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I inspect a hidden internal bearing or seal?',
            id: 'Bagaimana cara memeriksa bantalan atau seal yang tersembunyi di dalam?',
            ja: '内部に隠れた軸受やシールを確認するには？',
          },
          a: {
            en: 'Either click X-Ray in the top bar, drag the Explode slider to 100%, or click the part directly in the right-hand Assembly Tree (BOM) and press Isolate.',
            id: 'Aktifkan X-Ray di bilah atas, geser penggeser Bongkar ke 100%, atau klik langsung nama komponen di Daftar Komponen (BOM) sebelah kanan lalu tekan Isolasi.',
            ja: '上部バーの「透過(X-Ray)」を使うか、分解スライダーを100%にするか、右側の部品ツリー（BOM）から該当部品を選んで単独表示します。',
          },
          keywords: ['hidden', 'internal', 'bearing', 'seal', 'isolate', 'x-ray', 'tersembunyi'],
        },
      ],
      targetSelector: '[data-tour="m3d-bom"]',
    },
    {
      id: 'm3d-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study assembly engineering notes, complete inspection tasks, and take the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari catatan teknik rakitan, menyelesaikan tugas inspeksi, dan mengerjakan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で構造解説の確認から理解度チェックまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Diagnose electric motor stator insulation per IEEE 43 by applying a DC test voltage, tracking dielectric absorption over 600 seconds, and applying 40 °C temperature correction.',
        id: 'Selamat datang! Diagnosis isolasi stator motor listrik sesuai IEEE 43 dengan memberikan tegangan uji DC, memantau kurva absorpsi dielektrik selama 600 detik, dan menerapkan koreksi suhu 40 °C.',
        ja: 'ようこそ！IEEE 43規格に基づき、DC試験電圧の印加、600秒間の誘電吸収曲線計測、40 °C温度補正によるモータ巻線絶縁診断を行います。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'meg-hv-actions',
      badge: { en: 'Feature 1 · HV Control', id: 'Fitur 1 · Kontrol HV', ja: '機能1 · 高圧制御' },
      title: {
        en: 'Start/Stop HV Test & Capacitive Discharge',
        id: 'Mulai/Henti Uji HV & Buang Muatan',
        ja: '高圧試験の開始・停止と自動放電',
      },
      description: {
        en: 'Click Start HV Test to energize the DC insulation test, Stop & Discharge to safely bleed capacitive charge back to 0 V, or Reset to clear the test timer.',
        id: 'Klik Mulai Uji HV untuk menjalankan uji isolasi DC, Henti & Buang Muatan untuk membuang muatan kapasitif dengan aman hingga 0 V, atau Reset untuk mengatur ulang pengatur waktu uji.',
        ja: '「高圧試験開始」でDC絶縁試験を開始し、「停止・放電」で静電容量の残留電荷を安全に放電、「リセット」でタイマーを初期化します。',
      },
      tip: {
        en: 'Never disconnect test leads on a real motor before automatic discharge drops voltage below 50 V!',
        id: 'Jangan pernah melepas kabel uji pada motor asli sebelum pelepasan muatan otomatis menurunkan tegangan di bawah 50 V!',
        ja: '実機では自動放電で電圧が50 V以下に下がるまでテストリードを外してはいけません。',
      },
      targetSelector: '[data-tour="meg-hv-actions"]',
    },
    {
      id: 'meg-svg',
      badge: { en: 'Feature 2 · Tester SVG', id: 'Fitur 2 · SVG Alat', ja: '機能2 · 測定器操作' },
      title: {
        en: 'Interactive Megohmmeter & Motor Leads',
        id: 'Megohmmeter Interaktif & Kabel Motor',
        ja: '対話型メガーとモータ端子接続',
      },
      description: {
        en: 'Click directly on the tester dial, lead terminals, or test button in the SVG to switch DC voltage or move probes between stator phases (U, V, W) and Earth.',
        id: 'Klik langsung selektor tegangan, terminal kabel, atau tombol uji pada SVG untuk mengubah tegangan DC atau memindahkan probe antar fasa stator (U, V, W) dan Pembumian (Earth).',
        ja: '測定器SVG上の電圧ダイヤル・測定端子・テストボタンを直接クリックして試験電圧や巻線接続を切り替えられます。',
      },
      tip: {
        en: 'Testing U-to-Earth checks phase-to-ground insulation, while U-to-V checks phase-to-phase insulation.',
        id: 'Pengujian U-ke-Earth memeriksa isolasi fasa ke pembumian (ground), sedangkan U-ke-V memeriksa isolasi antarfasa.',
        ja: 'U-Earthは対地絶縁、U-Vは相間絶縁の健全性を確認します。',
      },
      targetSelector: '[data-tour="meg-svg"]',
    },
    {
      id: 'meg-curve',
      badge: { en: 'Feature 3 · R(t) Curve', id: 'Fitur 3 · Kurva R(t)', ja: '機能3 · 吸収曲線' },
      title: {
        en: 'Dielectric Absorption Curve R(t) & Speed',
        id: 'Kurva Absorpsi Dielektrik R(t) & Kecepatan',
        ja: '誘電吸収曲線 R(t) と時間倍率',
      },
      description: {
        en: 'Watch resistance climb over 0–600 s as polarization current decays. Use 1×, 10×, or 60× time acceleration in the curve header to complete a 10-minute PI sweep in seconds.',
        id: 'Amati kenaikan tahanan selama 0–600 detik saat arus polarisasi meluruh. Gunakan akselerasi 1×, 10×, atau 60× di header kurva untuk menyelesaikan uji PI 10 menit dalam hitungan detik.',
        ja: '分極電流の減衰に伴い0〜600秒で抵抗値が上昇する様子を観察します。右上の「1× / 10× / 60×」で10分間のPI試験を数秒で完了できます。',
      },
      tip: {
        en: 'A steeply rising R(t) curve indicates healthy dry insulation; a flat curve means leakage current dominates.',
        id: 'Kurva R(t) yang menanjak tajam menandakan isolasi kering sehat; kurva datar berarti arus bocor mendominasi.',
        ja: 'R(t)が右肩上がりに上昇すれば乾燥正常、平坦なら漏れ電流が大きい吸湿・汚損状態です。',
      },
      targetSelector: '[data-tour="meg-curve"]',
    },
    {
      id: 'meg-voltage',
      badge: { en: 'Feature 4 · Voltage & Leads', id: 'Fitur 4 · Tegangan', ja: '機能4 · 電圧設定' },
      title: {
        en: 'DC Test Voltage & Lead Connections',
        id: 'Tegangan Uji DC & Koneksi Kabel',
        ja: 'DC試験電圧と測定端子接続',
      },
      description: {
        en: 'Choose DC Test Voltage (250 V, 500 V, 1000 V, 2500 V) matched to motor nameplate voltage, and select Lead Connection below (U-Earth, V-Earth, W-Earth, or U-V).',
        id: 'Pilih Tegangan Uji DC (250 V, 500 V, 1000 V, 2500 V) sesuai tegangan pelat nama motor, dan pilih Koneksi Kabel Uji di bawahnya.',
        ja: 'モータ定格電圧に合わせてDC試験電圧（250〜2500 V）を選び、下の測定端子接続（対地間・相間）を切り替えます。',
      },
      tip: {
        en: 'Per IEEE 43, use 500 V DC for motors rated < 1000 V, and 1000–2500 V DC for medium-voltage machines.',
        id: 'Sesuai IEEE 43, gunakan 500 V DC untuk motor < 1000 V, dan 1000–2500 V DC untuk mesin tegangan menengah.',
        ja: 'IEEE 43では定格1000 V未満のモータには500 V DC、高圧機には1000〜2500 V DCを使用します。',
      },
      targetSelector: '[data-tour="meg-voltage"]',
    },
    {
      id: 'meg-temp',
      badge: { en: 'Feature 5 · Temp K_T40', id: 'Fitur 5 · Suhu K_T40', ja: '機能5 · 温度補正' },
      title: {
        en: 'Winding Temperature & K_T40 Correction',
        id: 'Suhu Belitan & Koreksi K_T40',
        ja: '巻線温度と40°C補正係数 K_T40',
      },
      description: {
        en: 'Drag Winding Temperature (0–80 °C) to see how insulation resistance halves every +10 °C and how K_T40 normalizes your reading to the 40 °C IEEE 43 reference.',
        id: 'Atur penggeser Suhu Belitan (0–80 °C) untuk melihat bagaimana tahanan isolasi berkurang separuh tiap +10 °C dan bagaimana K_T40 menormalisasi pembacaan Anda ke referensi 40 °C IEEE 43.',
        ja: '巻線温度（0〜80 °C）スライダーで、+10 °Cごとに抵抗値が半減する特性とK_T40による40 °C基準補正を確認します。',
      },
      tip: {
        en: 'Never compare winter (15 °C) and summer (55 °C) readings without applying K_T40 correction first!',
        id: 'Jangan pernah membandingkan hasil ukur musim dingin (15 °C) dan musim panas (55 °C) tanpa menerapkan koreksi K_T40 terlebih dahulu!',
        ja: '季節や運転直後で巻線温度が違う場合は、必ずK_T40補正後のR_c40値でトレンド比較してください。',
      },
      targetSelector: '[data-tour="meg-temp"]',
    },
    {
      id: 'meg-conditions',
      badge: { en: 'Feature 6 · Fault Presets', id: 'Fitur 6 · Kondisi Motor', ja: '機能6 · 巻線状態' },
      title: {
        en: 'Motor Winding Condition Presets',
        id: 'Prasetel Kondisi Belitan Motor',
        ja: 'モータ巻線状態（故障）プリセット',
      },
      description: {
        en: 'Inject different winding health states—Clean & Dry, Moisture/Humid, Carbonized/Contaminated, or Grounded Fault—to observe how each fault changes R(t), DAR, and PI.',
        id: 'Simulasikan berbagai kondisi belitan—Bersih & Kering, Lembap, Terkontaminasi Karbon, atau Gangguan Hubung Tanah—untuk mengamati bagaimana setiap gangguan memengaruhi R(t), DAR, dan PI.',
        ja: '乾燥正常・吸湿・カーボン汚損・地絡故障などの状態を切り替えて、R(t)曲線やDAR・PIの変化を比較します。',
      },
      tip: {
        en: 'Moisture typically lowers PI (< 2.0) but can often be recovered by baking/drying the stator.',
        id: 'Kelembapan umumnya menurunkan PI (< 2,0), namun sering kali dapat dipulihkan dengan pengeringan stator.',
        ja: '吸湿によるPI低下（< 2.0）は、巻線の乾燥処理（ベーキング）で回復できるケースが多いです。',
      },
      targetSelector: '[data-tour="meg-conditions"]',
    },
    {
      id: 'meg-verdict',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis Masalah', ja: '機能7 · 合否判定' },
      title: {
        en: 'IEEE 43 Verdict, R_c40, DAR & PI Diagnosis',
        id: 'Diagnosis Status IEEE 43, R_c40, DAR & PI',
        ja: 'IEEE 43 合否判定と R_c40・DAR・PI 診断',
      },
      description: {
        en: 'Troubleshoot motor insulation using this Verdict Banner and the 4 KPI cards below: PI < 2.0 or DAR < 1.25 signals moisture/contamination, while R_c40 < 5 MΩ warns of severe insulation breakdown.',
        id: 'Diagnosis isolasi motor melalui Panel Status ini dan 4 kartu KPI di bagian bawah: PI < 2,0 atau DAR < 1,25 menandakan isolasi lembap/terkontaminasi, sedangkan R_c40 < 5 MΩ memperingatkan kerusakan isolasi parah.',
        ja: 'IEEE 43判定バナーと下の4つのKPIで異常を切り分けます。PI < 2.0またはDAR < 1.25なら吸湿・汚損、R_c40 < 5 MΩなら絶縁破壊の危険を示します。',
      },
      tip: {
        en: 'Even if 1-minute R_c40 passes 100 MΩ, a PI below 2.0 still flags questionable insulation!',
        id: 'Meskipun R_c40 1 menit melampaui 100 MΩ, nilai PI di bawah 2,0 tetap menandakan isolasi meragukan!',
        ja: '1分値R_c40が100 MΩ以上あっても、PIが2.0未満なら吸湿・汚損の疑いがあります。',
      },
      faqs: [
        {
          q: {
            en: 'What is the difference between DAR and PI?',
            id: 'Apa perbedaan antara DAR dan PI?',
            ja: 'DARとPIの違いは何ですか？',
          },
          a: {
            en: 'DAR = R₆₀ₛ / R₃₀ₛ (quick 1-minute moisture check; ≥ 1.6 is good). PI = R₁₀ₘ / R₁ₘ (full 10-minute IEEE 43 polarization check; ≥ 2.0 is good).',
            id: 'DAR = R₆₀ₛ / R₃₀ₛ (uji cepat kelembapan 1 menit; ≥ 1,6 baik). PI = R₁₀ₘ / R₁ₘ (uji polarisasi penuh 10 menit IEEE 43; ≥ 2,0 baik).',
            ja: 'DARは1分間の簡易指標（R₆₀ₛ/R₃₀ₛ、1.6以上で良好）、PIは10分間のIEEE 43標準指標（R₁₀ₘ/R₁ₘ、2.0以上で良好）です。',
          },
          keywords: ['dar', 'pi', 'difference', 'ieee 43', 'perbedaan', '違い'],
        },
      ],
      targetSelector: '[data-tour="meg-verdict"]',
    },
    {
      id: 'meg-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review IEEE 43 standards, run practice diagnostics, and complete the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari standar IEEE 43, menjalankan latihan diagnosis, dan menyelesaikan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）でIEEE 43基準の復習と演習・クイズに取り組めます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Explore 3-phase motor families, IEC mounting codes, IP enclosure ratings, pole counts, and Star (Y) vs. Delta (Δ) terminal wiring with an interactive 2D CAD cutaway.',
        id: 'Selamat datang! Pelajari jenis motor 3-fasa, kode mounting IEC, rating proteksi IP, jumlah kutub, serta pengkabelan terminal Bintang (Y) vs. Segitiga (Δ) pada potongan CAD 2D interaktif.',
        ja: 'ようこそ！対話型2D CAD断面図で、三相電動機の種類、IEC取付方式、IP保護等級、極数、スター(Y)・デルタ(Δ)結線の違いを学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'mb-cutaway',
      badge: { en: 'Feature 1 · Cutaway', id: 'Fitur 1 · Potongan', ja: '機能1 · 断面図' },
      title: {
        en: 'Interactive 2D CAD Cutaway & Terminal Box',
        id: 'Potongan CAD 2D & Kotak Terminal',
        ja: '2D CAD断面図と端子箱操作',
      },
      description: {
        en: 'Inspect the live motor cutaway, nameplate, and 6-stud terminal block. Click directly on the motor cutaway to pause/resume rotor spinning, or click the terminal box to toggle Star (Y) and Delta (Δ) jumper bars.',
        id: 'Amati potongan motor, pelat nama, dan blok terminal 6-stud. Klik langsung potongan motor untuk menjeda/melanjutkan putaran rotor, atau klik kotak terminal untuk mengubah batang jumper Star (Y) dan Delta (Δ).',
        ja: '断面図・銘板・6端子ブロックを確認できます。断面図をクリックするとロータ回転の停止/再開、端子箱をクリックするとスター(Y)／デルタ(Δ)短絡バーを切り替えられます。',
      },
      tip: {
        en: 'Watch the 3 copper jumper bars in the terminal block: horizontal bridges W2-U2-V2 for Star (Y), vertical bars for Delta (Δ).',
        id: 'Perhatikan 3 batang jumper tembaga di kotak terminal: penghubung horizontal (W2-U2-V2) untuk Star (Y), dan batang vertikal untuk Delta (Δ).',
        ja: '端子箱の3本の銅短絡バーに注目：横連結がスター(Y)、縦3本がデルタ(Δ)結線です。',
      },
      targetSelector: '[data-tour="motor-cutaway"]',
    },
    {
      id: 'mb-family',
      badge: { en: 'Feature 2 · Motor Type', id: 'Fitur 2 · Jenis Motor', ja: '機能2 · 電動機種類' },
      title: {
        en: 'Electric Motor Family Selector',
        id: 'Pemilih Jenis Motor Listrik',
        ja: '電動機の種類セレクタ',
      },
      description: {
        en: 'Compare Squirrel-Cage Induction, Slip-Ring Wound Rotor, IE3/IE4 High-Efficiency, and Inverter-Duty VFD motors. The left guide card below the cutaway updates with efficiency class and primary applications.',
        id: 'Bandingkan motor Induksi Sangkar Tupai, Rotor Belitan (Slip-Ring), Efisiensi Tinggi IE3/IE4, dan Inverter-Duty VFD. Kartu panduan di sebelah kiri bawah gambar akan memperbarui kelas efisiensi dan aplikasi utamanya.',
        ja: 'かご形誘導電動機、巻線形、IE3/IE4高効率、インバータ駆動用などの種類を切り替えます。断面図下のガイドカードに効率クラスと用途が表示されます。',
      },
      tip: {
        en: 'Inverter-duty motors include reinforced winding insulation and independent cooling fans for low-speed VFD operation.',
        id: 'Motor inverter-duty memiliki isolasi belitan yang diperkuat dan kipas pendingin terpisah untuk putaran VFD rendah.',
        ja: 'インバータ用モータは低速域での冷却確保と高耐圧絶縁（サージ対策）が施されています。',
      },
      targetSelector: '[data-tour="motor-family"]',
    },
    {
      id: 'mb-mount-ip',
      badge: { en: 'Feature 3 · Mounting & IP', id: 'Fitur 3 · Mounting & IP', ja: '機能3 · 取付・保護' },
      title: {
        en: 'IEC Mounting (B3/B5/B14) & IP Protection',
        id: 'Mounting IEC (B3/B5/B14) & Proteksi IP',
        ja: 'IEC取付方式 (B3/B5/B14) と IP保護等級',
      },
      description: {
        en: 'Toggle Mounting (B3 foot-mount, B5 large flange, B14 face-mount) and IP Protection (IP54, IP55, IP65) to see the physical housing change in the CAD drawing and read IEC 60034-7 / IEC 60529 specs.',
        id: 'Pilih Mounting (B3 kaki, B5 flensa besar, B14 flensa muka) dan Proteksi IP (IP54, IP55, IP65) untuk melihat perubahan bodi di gambar CAD serta spesifikasi IEC 60034-7 / IEC 60529.',
        ja: '取付方式（B3脚取付・B5フランジ・B14フェイス）とIP保護等級（IP54・IP55・IP65）を切り替え、CAD外観とIEC規格解説を確認します。',
      },
      tip: {
        en: 'Use IP65 for washdown food/cement areas with dust and water jets; IP55 is standard for indoor plant pumps.',
        id: 'Gunakan IP65 untuk area berdebu berat/semprotan air; IP55 standar untuk pompa pabrik dalam ruangan.',
        ja: '粉塵や洗浄水のかかる環境ではIP65を選定し、通常の屋内ポンプ・ファンにはIP55が標準的です。',
      },
      targetSelector: '[data-tour="motor-mount-ip"]',
    },
    {
      id: 'mb-speed',
      badge: { en: 'Feature 4 · Speed', id: 'Fitur 4 · Putaran', ja: '機能4 · 回転速度' },
      title: {
        en: 'Magnetic Poles & Supply Frequency',
        id: 'Jumlah Kutub & Frekuensi Listrik',
        ja: '極数と電源周波数の設定',
      },
      description: {
        en: 'Toggle Magnetic Poles (2P, 4P, 6P) and Supply Frequency (50 Hz or 60 Hz) to see synchronous speed (Ns = 120f/P) and rated shaft torque update immediately.',
        id: 'Pilih Jumlah Kutub (2P, 4P, 6P) dan Frekuensi Listrik (50 Hz atau 60 Hz) untuk melihat perubahan kecepatan sinkron (Ns = 120f/P) dan torsi poros terukur.',
        ja: '極数（2P / 4P / 6P）と電源周波数（50 Hz / 60 Hz）を切り替えて、同期速度（Ns = 120f/P）と定格軸トルクの変化を確認します。',
      },
      tip: {
        en: 'At fixed 4 kW power, slower 6P motors produce 3× more shaft torque than high-speed 2P motors!',
        id: 'Pada daya tetap 4 kW, motor 6P yang lebih lambat menghasilkan torsi poros 3× lebih besar dari motor 2P!',
        ja: '同じ4 kW出力でも、低速の6極モータは2極モータの約3倍の軸トルクを発生します。',
      },
      targetSelector: '[data-tour="motor-poles-freq"]',
    },
    {
      id: 'mb-star-delta',
      badge: { en: 'Feature 5 · Star/Delta', id: 'Fitur 5 · Star/Delta', ja: '機能5 · 結線切替' },
      title: {
        en: 'Star (Y) 400V vs. Delta (Δ) 230V Wiring',
        id: 'Pengkabelan Star (Y) 400V vs. Delta (Δ) 230V',
        ja: 'スター(Y) 400V と デルタ(Δ) 230V 結線',
      },
      description: {
        en: 'Switch between Star (Y) — 400V and Delta (Δ) — 230V. Notice how the jumper bars in the SVG terminal block re-orient and coil phase voltage changes by a factor of √3.',
        id: 'Ubah koneksi antara Star (Y) — 400V dan Delta (Δ) — 230V. Amati perubahan posisi batang jumper pada kotak terminal SVG dan perubahan tegangan fasa kumparan sebesar √3.',
        ja: 'スター(Y) 400Vとデルタ(Δ) 230Vを切り替えます。SVG端子箱の短絡バー配置とコイル相電圧が√3倍で変化する様子を確認できます。',
      },
      tip: {
        en: 'Star-Delta starters start the motor in Star (1/3 starting current & torque) and switch to Delta once up to speed.',
        id: 'Starter Star-Delta menyalakan motor dalam Star (arus & torsi start 1/3) lalu berpindah ke Delta setelah berputar.',
        ja: 'スターデルタ始動器は、始動時にY結線で突入電流を1/3に抑え、加速後にΔ結線へ切り替えます。',
      },
      targetSelector: '[data-tour="motor-star-delta"]',
    },
    {
      id: 'mb-wiring',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnosis Masalah', ja: '機能6 · 結線診断' },
      title: {
        en: 'Telemetry & 400V Wiring Fault Prevention',
        id: 'Telemetri & Pencegahan Kesalahan Pengkabelan 400V',
        ja: 'テレメトリ確認と400V誤結線トラブル防止',
      },
      description: {
        en: 'Inspect Sync/Rated RPM, Shaft Torque, Coil Phase Voltage, and Slip. Always troubleshoot nameplate voltage using the 400V Rule card: wiring a 230V Delta-rated winding across a 400V grid applies √3× overvoltage and burns out the stator.',
        id: 'Periksa Putaran Sinkron/Terukur, Torsi Poros, Tegangan Fasa Kumparan, dan Slip. Selalu periksa kartu Aturan 400V untuk mencegah kesalahan pengkabelan: menyambung belitan berperingkat Delta 230V ke jaringan 400V memberikan tegangan lebih √3× yang membakar stator.',
        ja: '回転数・軸トルク・相電圧・すべりを確認し、下の「400V電源注意」カードで誤結線を防ぎます。230Vデルタ定格巻線を400V電源に直結すると√3倍の過電圧で焼損するため、スター(Y)結線が必要です。',
      },
      tip: {
        en: 'Before energizing any motor, verify nameplate "230/400V Δ/Y" matches your supply voltage and terminal jumper layout!',
        id: 'Sebelum menyalakan motor, pastikan pelat nama "230/400V Δ/Y" sesuai dengan tegangan suplai dan susunan jumper terminal!',
        ja: '通電前に必ず銘板の「230/400V Δ/Y」表記と電源電圧・端子箱短絡バーの一致を確認してください。',
      },
      faqs: [
        {
          q: {
            en: 'What happens if a 230/400V motor is wired in Delta on a 400V grid?',
            id: 'Apa akibatnya jika motor 230/400V dipasang Delta pada jaringan 400V?',
            ja: '230/400V定格モータを400V電源でデルタ結線するとどうなりますか？',
          },
          a: {
            en: 'Each coil rated for 230V receives full 400V (73% overvoltage), causing extreme magnetic saturation, overcurrent, and rapid winding burnout. It must be wired in Star (Y) on 400V.',
            id: 'Setiap kumparan berperingkat 230V menerima 400V penuh (tegangan lebih 73%), memicu saturasi magnetik ekstrem, arus berlebih, dan belitan cepat terbakar. Pada jaringan 400V motor harus dipasang Star (Y).',
            ja: '230V定格のコイルに400V（約1.73倍）が直接印加され、過電流と急激な絶縁焼損を引き起こします。400Vでは必ずスター(Y)結線にします。',
          },
          keywords: ['400v', '230v', 'delta', 'burn', 'overvoltage', 'terbakar', '焼損'],
        },
      ],
      targetSelector: '[data-tour="motor-telemetry"]',
    },
    {
      id: 'mb-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review motor nameplate theory, complete wiring exercises, and test your knowledge.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari teori pelat nama motor, menyelesaikan latihan pengkabelan, dan menguji pemahaman Anda.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で銘板規格の復習から演習・クイズまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Practice electrical measurements across 6 interactive workbench circuits using either an auto-ranging Digital Multimeter or a classic Analog VOM with real fuse-protection logic and continuity beeper.',
        id: 'Selamat datang! Latih pengukuran listrik pada 6 skenario rangkaian interaktif menggunakan Multimeter Digital atau Analog VOM lengkap dengan proteksi sekring dan buzzer kontinuitas.',
        ja: 'ようこそ！デジタル／アナログの2種類のマルチメータを使い、6つの回路シナリオで電圧・電流・抵抗・導通ブザー測定とヒューズ保護の仕組みを実習します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'dmm-scenarios',
      badge: { en: 'Feature 1 · Circuits', id: 'Fitur 1 · Sirkuit', ja: '機能1 · 回路選択' },
      title: {
        en: '6 Workbench Scenarios & Guided Faults',
        id: '6 Skenario Uji & Diagnosis Gangguan Terpandu',
        ja: '6つのベンチシナリオと故障診断モード',
      },
      description: {
        en: 'Select from 6 workbench scenarios (DC Voltage, Resistance/Potentiometer, Continuity/Diode, DC Current, AC Outlet, and Guided Fault Diagnosis). Each scenario unlocks dedicated circuit controls on the right.',
        id: 'Pilih salah satu dari 6 skenario uji (Tegangan DC, Resistansi/Potensiometer, Kontinuitas/Dioda, Arus DC, Stopkontak AC, dan Diagnosis Gangguan Terpandu). Setiap skenario membuka kontrol rangkaian khusus di panel kanan.',
        ja: '6つのシナリオタブ（DC電圧、抵抗、導通/ダイオード、DC電流、ACコンセント、故障診断）を切り替えます。シナリオごとに右パネルへ専用操作が現れます。',
      },
      tip: {
        en: 'Try the Fault Diagnosis tab last to test your troubleshooting skills on randomized hidden circuit faults.',
        id: 'Coba tab Diagnosis Gangguan di bagian akhir untuk menguji keterampilan penanganan masalah Anda pada gangguan rangkaian tersembunyi yang diacak.',
        ja: '最後に「故障診断」タブで、ランダム出題される隠れ故障の特定に挑戦してみましょう。',
      },
      targetSelector: '[data-tour="dmm-scenarios"]',
    },
    {
      id: 'dmm-probes',
      badge: { en: 'Feature 2 · Probes', id: 'Fitur 2 · Probe', ja: '機能2 · プローブ' },
      title: {
        en: 'Probe Placement, Lead Swap & Beeper',
        id: 'Penempatan Probe, Tukar Kabel Uji & Buzzer',
        ja: 'プローブ移動・入替・ブザー操作',
      },
      description: {
        en: 'Use Move Red (+), Move Black (COM), Swap Leads, and Lift Both to place probes on circuit nodes, and toggle Beeper On / Muted for audible continuity checks.',
        id: 'Gunakan Pindah Merah (+), Pindah Hitam (COM), Tukar Kabel, dan Angkat Kedua Probe untuk menempatkan probe pada titik uji rangkaian, serta aktifkan/bisukan Buzzer untuk uji kontinuitas.',
        ja: '「赤プローブ移動」「黒プローブ移動」「リード入替」「プローブ解除」で回路の測定点にプローブを当て、導通ブザーのON/ミュートを切り替えられます。',
      },
      tip: {
        en: 'Click Lift Both before switching from Voltage to Resistance or Current mode—just like safe field practice.',
        id: 'Klik Angkat Kedua Probe sebelum berpindah dari mode Tegangan ke Resistansi atau Arus—sesuai prosedur keselamatan lapangan.',
        ja: '電圧測定から抵抗や電流測定へ切り替える前は「プローブ解除」で回路から離すのが安全の基本です。',
      },
      targetSelector: '[data-tour="dmm-probes"]',
    },
    {
      id: 'dmm-style',
      badge: { en: 'Feature 3 · Meter Type', id: 'Fitur 3 · Tipe Meter', ja: '機能3 · 機種切替' },
      title: {
        en: 'Digital DMM-87V vs. Analog VOM-20K',
        id: 'Digital DMM-87V vs. Analog VOM-20K',
        ja: 'デジタルとアナログ方式の切替',
      },
      description: {
        en: 'Switch between the auto-ranging Digital DMM-87V and the classic Analog VOM-20K (Sanwa-360) with manual range selection and Zero Ω needle adjustment.',
        id: 'Beralih antara Digital DMM-87V (auto-range) dan Analog VOM-20K klasik dengan pemilihan rentang manual serta kalibrasi jarum Zero Ω.',
        ja: 'オートレンジ対応のデジタルDMM-87Vと、手動レンジ選択・0Ω針調整付きのアナログVOM-20Kを切り替えて比較できます。',
      },
      tip: {
        en: 'In Analog VOM mode, always short probes together and adjust Zero Ω Adj before measuring resistance.',
        id: 'Pada mode Analog VOM, selalu tempelkan kedua probe dan atur Zero Ω Adj sebelum mengukur resistansi.',
        ja: 'アナログVOMで抵抗を測る際は、先にプローブを短絡してZero Ω Adjで針を0Ωに合わせます。',
      },
      targetSelector: '[data-tour="dmm-style-toggle"]',
    },
    {
      id: 'dmm-dial',
      badge: { en: 'Feature 4 · Dial', id: 'Fitur 4 · Selektor', ja: '機能4 · ダイヤル' },
      title: {
        en: 'Rotary Dial & Manual Range Selector',
        id: 'Selektor Putar & Rentang Manual',
        ja: 'ロータリーダイヤル・レンジ設定',
      },
      description: {
        en: 'Select the Digital Rotary Dial position (OFF, V~, V⎓, mV, Ω/🔊/⏵|, Hz, mA/A) or Analog fixed range (AC 250V, DCV, Ω ×1–×10k, DC mA) to match the quantity you are measuring.',
        id: 'Pilih posisi Selektor Digital (OFF, V~, V⎓, mV, Ω/🔊/⏵|, Hz, mA/A) atau rentang tetap Analog sesuai besaran listrik yang diukur.',
        ja: 'デジタルダイヤル（OFF, V~, V⎓, mV, Ω/🔊/⏵|, Hz, mA/A）またはアナログの固定レンジを測定対象に合わせて選択します。',
      },
      tip: {
        en: 'On an Analog VOM, start on the highest range (e.g. 250V) and step down so the needle lands in the middle third of the scale.',
        id: 'Pada Analog VOM, mulai dari rentang tertinggi (mis. 250V) lalu turunkan hingga jarum berada di sepertiga tengah skala.',
        ja: 'アナログ計器では最大レンジから測り始め、針が中央付近に振れるレンジへ下げて読み取ります。',
      },
      targetSelector: '[data-tour="dmm-dial"]',
    },
    {
      id: 'dmm-red-jack',
      badge: { en: 'Feature 5 · Jacks & Fuse', id: 'Fitur 5 · Jack & Sekring', ja: '機能5 · 端子保護' },
      title: {
        en: 'Red Test Lead Jack & Fuse Protection',
        id: 'Jack Kabel Merah & Proteksi Sekring',
        ja: '赤リード接続端子とヒューズ保護',
      },
      description: {
        en: 'Move the Red Test Lead between V-Ω-Hz, mA/µA, and 10A jacks. Probing a voltage source while plugged into mA/µA or 10A creates a dead short and blows the meter fuse—click Replace Fuse if that happens!',
        id: 'Pindahkan Jack Kabel Merah antara V-Ω-Hz, mA/µA, dan 10A. Mengukur sumber tegangan saat kabel tertancap di jack arus memicu hubung singkat dan memutus sekring—klik Ganti Sekring untuk memulihkan!',
        ja: '赤テストリードを V-Ω-Hz、mA/µA、10A 端子間で差し替えます。電流端子に挿したまま電圧を測ると短絡してヒューズが溶断するため、「ヒューズ交換」で復旧します。',
      },
      tip: {
        en: 'Always return the red lead to V-Ω-Hz immediately after finishing any current measurement!',
        id: 'Selalu kembalikan kabel merah ke jack V-Ω-Hz segera setelah selesai mengukur arus!',
        ja: '電流測定が終わったら、直ちに赤リードを V-Ω-Hz 端子へ戻す習慣をつけましょう。',
      },
      faqs: [
        {
          q: {
            en: 'Why did the meter fuse blow?',
            id: 'Mengapa sekring multimeter putus?',
            ja: 'マルチメータのヒューズが切れた原因は？',
          },
          a: {
            en: 'You probed across a voltage source while the Red lead was in the mA/µA or 10A current jack (near-zero internal shunt resistance). Switch the Red jack back to V-Ω-Hz and click Replace Fuse.',
            id: 'Anda mengukur tegangan saat kabel merah berada di jack arus mA/µA atau 10A (resistansi shunt mendekati nol). Kembalikan ke jack V-Ω-Hz lalu klik Ganti Sekring.',
            ja: '電流端子（内部抵抗がほぼ0Ω）に赤リードを挿したまま電圧源にプローブを当てたため大電流が流れました。V-Ω-Hzへ戻してヒューズを交換してください。',
          },
          keywords: ['fuse', 'blown', 'short', 'sekring', 'putus', 'ヒューズ'],
        },
      ],
      targetSelector: '[data-tour="dmm-red-jack"]',
    },
    {
      id: 'dmm-fault',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnosis Masalah', ja: '機能6 · 故障診断' },
      title: {
        en: 'Hazard Alerts & Guided Fault Diagnosis',
        id: 'Peringatan Bahaya & Diagnosis Gangguan Terpandu',
        ja: '危険警告と故障診断トラブルシューティング',
      },
      description: {
        en: 'Watch this Diagnostic Readout Note for live hazard warnings (blown fuse, live-circuit resistance probe, or reverse polarity). In the Fault tab, probe TP1–TP4 to isolate the fault, select your diagnosis, and click Verify Diagnosis.',
        id: 'Pantau Catatan Pembacaan Diagnostik ini untuk peringatan bahaya waktu nyata (sekring putus, pengukuran Ω pada sirkuit bertegangan, atau polaritas terbalik). Di tab Gangguan, ukur TP1–TP4 untuk mengisolasi gangguan, pilih diagnosis Anda, lalu klik Periksa Diagnosis.',
        ja: 'この診断ノートでヒューズ溶断や活線抵抗測定などの危険警告を確認できます。「故障診断」タブではTP1〜TP4を測定して原因を特定し、「診断を確認」を押します。',
      },
      tip: {
        en: 'When troubleshooting TP1–TP4, measure voltage from ground (TP4) to each upstream node to pinpoint where voltage drops to 0 V.',
        id: 'Saat memeriksa TP1–TP4, ukur tegangan terhadap ground (TP4) ke tiap titik hulu untuk melacak lokasi jatuhnya tegangan menjadi 0 V.',
        ja: 'TP1〜TP4の診断では、基準点（TP4）から上流へ順に電圧を測り、電圧が途絶える箇所を特定します。',
      },
      targetSelector: '[data-tour="dmm-diagnostic-note"]',
    },
    {
      id: 'dmm-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study measurement safety, complete circuit labs, and pass the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari keselamatan pengukuran, menyelesaikan latihan sirkuit, dan mengikuti kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で測定安全の理論から演習・クイズまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Learn how ISO 3448 viscosity grades behave with temperature (ASTM D341), how NLGI consistency grades classify greases (ASTM D217), and why mixing incompatible thickeners causes bearing failure (ASTM D6185).',
        id: 'Selamat datang! Pelajari perilaku viskositas ISO 3448 terhadap suhu (ASTM D341), kelas konsistensi gemuk NLGI (ASTM D217), serta risiko pencampuran pengental yang tidak kompatibel (ASTM D6185).',
        ja: 'ようこそ！ISO 3448粘度グレードの温度特性（ASTM D341）、NLGIちょう度（ASTM D217）、および異種グリース増ちょう剤の混和適合性（ASTM D6185）を学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'ogb-modes',
      badge: { en: 'Feature 1 · Lab Mode', id: 'Fitur 1 · Mode Lab', ja: '機能1 · モード切替' },
      title: {
        en: 'Oil Viscosity vs. Grease Compatibility Modes',
        id: 'Mode Viskositas Oli vs. Kompatibilitas Gemuk',
        ja: '潤滑油粘度モードとグリース適合性モード',
      },
      description: {
        en: 'Switch between Mode 1: Industrial Oil & Viscosity and Mode 2: Grease NLGI & Compatibility in the top bar, or click Reset Lab to restore the active mode to defaults.',
        id: 'Beralihlah antara Mode 1: Oli Industri & Viskositas dan Mode 2: Gemuk NLGI & Kompatibilitas di bilah atas, atau klik Reset Lab untuk mengembalikan mode aktif ke pengaturan awal.',
        ja: '上部バーで「モード1: 産業用潤滑油と粘度」と「モード2: グリースちょう度と混和適合性」を切り替え、「ラボを初期化」で初期値に戻せます。',
      },
      tip: {
        en: 'Complete Mode 1 first to understand base oil viscosity, then switch to Mode 2 to test grease thickeners.',
        id: 'Selesaikan Mode 1 terlebih dahulu untuk memahami viskositas oli dasar, lalu beralih ke Mode 2 untuk menguji pengental gemuk.',
        ja: 'まずモード1で基油粘度の基本を学び、次にモード2でグリース増ちょう剤の相性を確認しましょう。',
      },
      targetSelector: '[data-tour="ogb-mode-bar"]',
    },
    {
      id: 'ogb-oil-helper',
      badge: { en: 'Feature 2 · Machine Helper', id: 'Fitur 2 · Panduan Mesin', ja: '機能2 · 推奨選定' },
      title: {
        en: 'Beginner Machine Helper (Auto-Select)',
        id: 'Panduan Pemula: Pemilihan Oli per Mesin',
        ja: '初心者ガイド: 機械別推奨オイル自動選定',
      },
      description: {
        en: 'In Mode 1, click any industrial machine (Hydraulic Press, Spur Gearbox, Worm Gear, Air Compressor, etc.) to auto-load the OEM-recommended oil family, ISO VG grade, and engineering rationale.',
        id: 'Pada Mode 1, klik mesin industri apa saja (Pres Hidrolik, Gearbox Roda Gigi Lurus, Worm Gear, Kompresor Udara, dll.) untuk memuat otomatis kelompok oli rekomendasi OEM, grade ISO VG, dan alasan tekniknya.',
        ja: 'モード1で対象機械（油圧プレス、平歯車減速機、コンプレッサ等）をクリックすると、推奨潤滑油ファミリー・ISO VG・選定理由が自動設定されます。',
      },
      tip: {
        en: 'Read the rationale box below the machine buttons—it explains why EP additives or PAO synthetics are needed.',
        id: 'Baca kotak alasan di bawah tombol mesin—kotak ini menjelaskan mengapa aditif EP atau oli sintetis PAO diperlukan.',
        ja: 'ボタン下の選定根拠を読むと、極圧(EP)添加剤やPAO合成油が必要な理由が理解できます。',
      },
      targetSelector: '[data-tour="ogb-oil-helper"]',
    },
    {
      id: 'ogb-oil-family',
      badge: { en: 'Feature 3 · Oil Family', id: 'Fitur 3 · Kelompok Oli', ja: '機能3 · 油種比較' },
      title: {
        en: 'Industrial Oil Family (Mineral vs. Synthetic)',
        id: 'Kelompok Oli Industri (Mineral vs. Sintetis)',
        ja: '産業用潤滑油ファミリー（鉱油・合成油）',
      },
      description: {
        en: 'Compare Hydraulic AW, Gear EP, Synthetic PAO, and Turbine/Compressor oils. Notice how Synthetic PAO (VI 145) resists thinning at high temperature much better than standard Mineral oil (VI 98).',
        id: 'Bandingkan oli Hidrolik AW, Gear EP, Sintetis PAO, dan Turbin/Kompresor. Amati bagaimana Sintetis PAO (VI 145) jauh lebih tahan terhadap pengenceran pada suhu tinggi dibanding oli Mineral standar (VI 98).',
        ja: '耐摩耗性作動油(AW)、極圧ギヤ油(EP)、合成油(PAO)、タービン油を比較します。高VIのPAO合成油（VI 145）は高温時の粘度低下が小さいのが特長です。',
      },
      tip: {
        en: 'Never use Gear EP sulfur-phosphorus oil in yellow-metal (bronze) worm gears without checking corrosion compatibility!',
        id: 'Jangan pernah menggunakan oli Gear EP sulfur-fosfor pada roda gigi cacing berbahan perunggu tanpa memeriksa kompatibilitas korosinya!',
        ja: 'リン・硫黄系の極圧(EP)ギヤ油は銅合金（青銅）ウォーム歯車を腐食させる場合があるため注意が必要です。',
      },
      targetSelector: '[data-tour="ogb-oil-family"]',
    },
    {
      id: 'ogb-oil-temp',
      badge: { en: 'Feature 4 · Temperature', id: 'Fitur 4 · Suhu', ja: '機能4 · 温度変化' },
      title: {
        en: 'Operating Temperature & ISO 40 °C Reference',
        id: 'Suhu Operasi & Referensi ISO 40 °C',
        ja: '運転温度スライダーと40°C基準',
      },
      description: {
        en: 'Drag Operating Temperature (10–90 °C, noting the ISO 40 °C REF badge) to watch Operating Viscosity (cSt) drop exponentially on heating and thicken sharply on cooling.',
        id: 'Atur penggeser Suhu Operasi (10–90 °C, perhatikan label ISO 40 °C REF) untuk mengamati Viskositas Operasi (cSt) turun secara eksponensial saat dipanaskan dan mengental tajam saat didinginkan.',
        ja: '運転流体温度スライダー（10〜90 °C、40 °C基準バッジ表示）を動かすと、加熱による急激な低粘度化や低温での増粘をリアルタイムで確認できます。',
      },
      tip: {
        en: 'ISO VG numbers always equal kinematic viscosity in cSt at 40 °C—not at 100 °C like automotive SAE grades!',
        id: 'Angka ISO VG selalu menunjukkan viskositas kinematik dalam cSt pada 40 °C—bukan pada 100 °C seperti kelas SAE otomotif!',
        ja: 'ISO VG番号は常に40 °Cにおける動粘度(cSt)を示します（自動車用SAEの100 °C基準とは異なります）。',
      },
      targetSelector: '[data-tour="ogb-temp-slider"]',
    },
    {
      id: 'ogb-viewport',
      badge: { en: 'Feature 5 · CAD Visuals', id: 'Fitur 5 · Visual CAD', ja: '機能5 · CAD可視化' },
      title: {
        en: '2D CAD Visualizer & Live Engineering Metrics',
        id: 'Visualisasi CAD 2D & Metrik Teknik Waktu Nyata',
        ja: '2D CAD可視化とエンジニアリング指標',
      },
      description: {
        en: 'Observe the live Viscosity-Temperature curve / NLGI cone penetration visualizer and the 4 engineering KPI cards below (Operating Viscosity, ISO VG Benchmark, ISO 3448 Tolerance, Viscosity Index).',
        id: 'Amati visualisasi kurva Viskositas-Suhu / penetrasi kerucut NLGI dan 4 kartu KPI teknik di bagian bawah (Viskositas Operasi, Acuan ISO VG, Toleransi ISO 3448, Indeks Viskositas).',
        ja: '粘度-温度曲線／NLGI円錐針入度ビジュアライザと、下の4つのKPIカード（運転時動粘度、公称ISO VG、ISO 3448許容公差、粘度指数）を確認できます。',
      },
      tip: {
        en: 'In Mode 2, the CAD visualizer switches to an ASTM D217 cone penetrometer and 2-grease compatibility mixer.',
        id: 'Pada Mode 2, tampilan CAD beralih menjadi penetrometer kerucut ASTM D217 dan uji pencampuran 2 gemuk.',
        ja: 'モード2ではASTM D217円錐針入度試験機と2種グリース混和試験のCAD図に切り替わります。',
      },
      targetSelector: '[data-tour="ogb-viewport"]',
    },
    {
      id: 'ogb-diagnostic',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnosis Masalah', ja: '機能6 · 異常診断' },
      title: {
        en: 'Thermal Thinning & Grease Incompatibility Checks',
        id: 'Pemeriksaan Penipisan Suhu & Ketidakcocokan Gemuk',
        ja: '粘度低下とグリース混和不良のトラブル診断',
      },
      description: {
        en: 'Use this Technical Tip and the live cards to troubleshoot lubricant failures: in Mode 1, verify viscosity stays within machine limits above 70 °C; in Mode 2, test Grease 1 vs. Grease 2 thickeners to prevent Incompatible melting.',
        id: 'Gunakan Tips Teknis ini dan kartu metrik waktu nyata untuk mendiagnosis kegagalan pelumas: pada Mode 1, pastikan viskositas tetap dalam batas mesin di atas 70 °C; pada Mode 2, uji pengental Gemuk 1 vs. Gemuk 2 untuk mencegah pelelehan akibat ketidakcocokan.',
        ja: 'この技術ヒントとメトリクスで潤滑トラブルを診断します。モード1では70 °C超での粘度低下を、モード2では増ちょう剤組合せによる混和不適合（軟化・流出）を検出します。',
      },
      tip: {
        en: 'Mixing Polyurea and Lithium Complex greases is a classic plant mistake that liquefies grease and starves bearings!',
        id: 'Mencampur gemuk Polyurea dan Lithium Complex adalah kesalahan umum di pabrik yang menyebabkan gemuk mencair dan merusak bantalan!',
        ja: 'ポリウレア系とリチウムコンプレックス系グリースの混合は、軟化流出を引き起こす代表的な現場トラブルです。',
      },
      faqs: [
        {
          q: {
            en: 'What happens if I mix incompatible grease thickeners?',
            id: 'Apa akibatnya jika mencampur pengental gemuk yang tidak kompatibel?',
            ja: '不適合なグリース同士を混ぜるとどうなりますか？',
          },
          a: {
            en: 'The soap/thickener structure breaks down, causing the grease to either soften and leak out of the bearing (oil starvation) or harden into soap cakes that block grease passages.',
            id: 'Struktur pengental rusak sehingga gemuk mencair dan bocor keluar dari bantalan (kekurangan oli), atau mengeras membentuk gumpalan yang menyumbat jalur pelumasan.',
            ja: '増ちょう剤の網目構造が破壊され、グリースが軟化・流出（油膜切れ）するか、逆に硬化して給脂経路を詰まらせます。',
          },
          keywords: ['mix', 'incompatible', 'grease', 'thickener', 'campur', 'gemuk', '混和'],
        },
      ],
      targetSelector: '[data-tour="ogb-field-tip"]',
    },
    {
      id: 'ogb-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study lubricant standards, practice selection scenarios, and complete the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari standar pelumas, berlatih skenario pemilihan, dan menyelesaikan kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で潤滑規格の学習から演習・クイズまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Simulate compressed-air circuits with synchronized 2D CAD cutaway animation, ISO 1219 schematics, real-time displacement-step charting, air consumption costing, and plant fault troubleshooting.',
        id: 'Selamat datang! Simulasikan sirkuit udara bertekanan dengan animasi potongan CAD 2D, skema ISO 1219, grafik langkah-perpindahan, biaya udara, dan pemecahan gangguan pabrik.',
        ja: 'ようこそ！2D CAD断面アニメーション、ISO 1219回路図、変位-ステップ線図、空気消費コスト計算、設備異常診断を統合した空気圧シミュレータです。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'pneu-modes',
      badge: { en: 'Feature 1 · Toolbar', id: 'Fitur 1 · Bilah Kontrol', ja: '機能1 · 回路・供給圧' },
      title: {
        en: 'Circuits, Builder, Supply & Bore Controls',
        id: 'Sirkuit, Perakit, Suplai & Kontrol Bore',
        ja: '回路切替・ビルダー・供給圧・シリンダ内径',
      },
      description: {
        en: 'Choose Pre-built Circuits (5 industrial presets) or Interactive Builder to wire custom ISO 1219 components. Toggle Compressor ON/OFF, adjust Supply (1–10 bar) and Bore (20–100 mm), or click Reset.',
        id: 'Pilih Sirkuit Prasetel (5 rangkaian industri) atau Perakit Interaktif untuk merangkai komponen ISO 1219 secara khusus. Atur Kompresor ON/OFF, Suplai (1–10 bar), dan Bore (20–100 mm), atau klik Reset.',
        ja: '「プリセット回路」（5種の標準回路）または「回路ビルダー」を切り替え、コンプレッサON/OFF、供給圧（1〜10 bar）、内径（20〜100 mm）、リセットを操作できます。',
      },
      tip: {
        en: 'Remember to keep Compressor ON—if supply pressure is 0 bar, no valve pilot or cylinder will move!',
        id: 'Pastikan Kompresor menyala (ON)—jika tekanan suplai 0 bar, katup pilot dan silinder tidak akan bergerak!',
        ja: 'コンプレッサがONになっていることを確認してください。供給圧が0 barだとパイロット弁もシリンダも作動しません。',
      },
      targetSelector: '[data-tour="pneu-toolbar"]',
    },
    {
      id: 'pneu-views',
      badge: { en: 'Feature 2 · View Mode', id: 'Fitur 2 · Tampilan', ja: '機能2 · 表示切替' },
      title: {
        en: '2D CAD Cutaway vs. ISO 1219 Split View',
        id: 'Potongan CAD 2D vs. Skema ISO 1219',
        ja: '2D CAD断面図とISO 1219回路図の切替',
      },
      description: {
        en: 'In Presets mode, switch between 2D CAD Cutaway, ISO 1219 Circuit, and Cutaway + ISO Split to see physical valve/cylinder motion alongside standardized schematic symbols.',
        id: 'Pada mode Prasetel, beralih antara Potongan CAD 2D, Sirkuit ISO 1219, atau Gabungan CAD + ISO untuk melihat gerakan fisik sekaligus simbol skema standar.',
        ja: 'プリセットモードでは「2D CAD断面図」「ISO 1219回路図」「断面+ISO分割」を切り替え、実機構造とJIS/ISO記号を対照しながら学べます。',
      },
      tip: {
        en: 'Cutaway + ISO Split is ideal for learning how spool shifts in the 5/2 valve map to ISO 1219 boxes.',
        id: 'Mode Gabungan CAD + ISO ideal untuk memahami bagaimana pergeseran spool katup 5/2 cocok dengan kotak simbol ISO 1219.',
        ja: '「断面+ISO分割」にすると、5/2方向制御弁のスプール移動とISO記号の切替を同時に確認できます。',
      },
      targetSelector: '[data-tour="pneu-view-mode"]',
    },
    {
      id: 'pneu-viewport',
      badge: { en: 'Feature 3 · Actuation', id: 'Fitur 3 · Aktuasi', ja: '機能3 · 作動操作' },
      title: {
        en: 'Interactive Schematic & Displacement Chart',
        id: 'Skema Interaktif & Grafik Langkah',
        ja: '回路作動操作と変位-ステップ線図',
      },
      description: {
        en: 'Click SOL 14 / SOL 12 or EXTEND / RETRACT in the cutaway—or click 3/2 pushbuttons and 5/2 valves on the ISO schematic—to shift spools and watch the live Displacement-Step Chart.',
        id: 'Klik SOL 14 / SOL 12 atau EXTEND / RETRACT pada CAD—atau klik tombol 3/2 dan katup 5/2 di skema ISO—untuk menggerakkan silinder serta memantau Grafik Langkah.',
        ja: '断面図のSOL 14/12やEXTEND/RETRACT、または回路図の3/2・5/2弁をクリックしてシリンダを作動させ、下の変位-ステップ線図を確認します。',
      },
      tip: {
        en: 'Click any ISO component in the schematic to open the Component Inspector and tune Flow Control Throttle %!',
        id: 'Klik komponen ISO mana saja pada skema untuk membuka Inspektor Komponen dan mengatur bukaan katup kontrol aliran (%)!',
        ja: '回路図上の部品をクリックすると部品インスペクタが開き、流量制御弁（FCV）の開度%を調整できます。',
      },
      targetSelector: '[data-tour="pneu-viewport"]',
    },
    {
      id: 'pneu-telemetry',
      badge: { en: 'Feature 4 · Telemetry', id: 'Fitur 4 · Telemetri', ja: '機能4 · 推力計測' },
      title: {
        en: 'Cylinder Telemetry (Chamber A/B & Force)',
        id: 'Telemetri Silinder (Ruang A/B & Gaya)',
        ja: 'シリンダ計測値（A/B室圧力・推力）',
      },
      description: {
        en: 'Monitor stroke %, velocity, Chamber A & B pressures (bar), and Live Net Force (N). Notice that retract force is slightly lower than extend force because the piston rod reduces the effective annulus area.',
        id: 'Pantau langkah %, kecepatan, tekanan Ruang A & B (bar), serta Gaya Bersih (N). Gaya tarik sedikit lebih kecil dari gaya dorong karena luas batang torak mengurangi area efektif.',
        ja: 'ストローク%、速度、A/B室圧力（bar）、実効推力（N）を確認します。引き側はピストンロッド断面積分だけ受圧面積が小さいため推力が低くなります。',
      },
      tip: {
        en: 'Increase Bore (mm) in the top bar to see extend/retract force grow quadratically with piston area!',
        id: 'Perbesar Bore (mm) di bilah atas untuk melihat gaya dorong/tarik naik secara kuadratik sesuai luas piston!',
        ja: '上部バーの内径（Bore）を大きくすると、面積の2乗に比例して推力が増加します。',
      },
      targetSelector: '[data-tour="pneu-telemetry"]',
    },
    {
      id: 'pneu-air-cost',
      badge: { en: 'Feature 5 · Air & Cost', id: 'Fitur 5 · Udara & Biaya', ja: '機能5 · 空気消費' },
      title: {
        en: 'Air Consumption (NL/min), FRL ΔP & Energy Cost',
        id: 'Konsumsi Udara (NL/min), ΔP FRL & Biaya Energi',
        ja: '空気消費量 (NL/min)・FRL差圧・電力コスト',
      },
      description: {
        en: 'Track Total Air Flow (NL/min), $/hr & $/yr compressed-air energy cost, and FRL Inlet vs. Outlet pressure. A spike in NL/min while idle signals an air leak; a drop between FRL In and Out signals a clogged filter.',
        id: 'Pantau Total Aliran Udara (NL/min), biaya energi ($/jam & $/tahun), serta tekanan Masuk vs. Keluar FRL. Lonjakan NL/min saat diam menandakan kebocoran; selisih tekanan FRL menandakan filter tersumbat.',
        ja: '総空気流量（NL/min）、運転コスト（$/hr・$/yr）、FRL入口・出口圧力を監視します。停止中のNL/min増加は漏れ、FRL差圧増大はフィルタ詰まりのサインです。',
      },
      tip: {
        en: 'Even a tiny 2 mm pilot air leak wastes hundreds of dollars per year in compressor electricity!',
        id: 'Kebocoran udara pilot sekecil 2 mm saja dapat memboroskan ratusan dolar listrik kompresor per tahun!',
        ja: 'わずかなパイロット配管のエア漏れでも、年間ではコンプレッサ電力費の大きな損失になります。',
      },
      targetSelector: '[data-tour="pneu-air-cost"]',
    },
    {
      id: 'pneu-faults',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnosis Masalah', ja: '機能6 · 異常診断' },
      title: {
        en: 'Plant Faults & Blind Fault Challenge',
        id: 'Gangguan Pabrik & Tantangan Diagnosis Mandiri',
        ja: '設備異常とブラインド異常診断',
      },
      description: {
        en: 'Inject Healthy, Clogged FRL Filter, Leaking 5/2 Pilot Line, or Stuck Meter-Out FCV to study failure symptoms—or click Blind Fault Challenge to diagnose a hidden fault from FRL ΔP, spool response, and NL/min air flow.',
        id: 'Simulasikan kondisi Normal, Filter FRL Tersumbat, Jalur Pilot 5/2 Bocor, atau FCV Meter-Out Macet untuk mempelajari gejala kegagalan—atau klik Tantangan Diagnosis Mandiri untuk mendiagnosis gangguan tersembunyi dari ΔP FRL, respons spool, dan aliran udara NL/min.',
        ja: '「正常」「FRLフィルタ詰まり」「5/2パイロット漏れ」「メータアウトFCV固着」を切り替えて症状を学ぶか、「ブラインド異常診断」で差圧・動作速度・空気消費量から故障原因を特定します。',
      },
      tip: {
        en: 'Diagnostic rule: High FRL ΔP = Clogged Filter; high idle NL/min + sluggish spool = Leaking Pilot; 0 ΔP + crawling cylinder = Stuck FCV.',
        id: 'Kaidah diagnosis: ΔP FRL tinggi = Filter Tersumbat; NL/min tinggi saat diam = Pilot Bocor; ΔP 0 + silinder lambat = FCV Macet.',
        ja: '診断の目安：FRL差圧大＝フィルタ詰まり、待機時NL/min急増＝パイロット漏れ、差圧0で低速＝FCV固着です。',
      },
      faqs: [
        {
          q: {
            en: 'How do I tell Clogged FRL apart from Stuck FCV?',
            id: 'Bagaimana cara membedakan Filter FRL Tersumbat dari FCV Macet?',
            ja: 'FRLフィルタ詰まりとFCV固着の見分け方は？',
          },
          a: {
            en: 'Check the FRL In → Out gauge in Air Consumption & Cost: a Clogged FRL drops downstream pressure > 50% (high ΔP) and weakens cylinder force, while a Stuck FCV shows 0 ΔP and normal force but choked ~10% speed.',
            id: 'Periksa pengukur FRL Masuk → Keluar pada Konsumsi Udara & Biaya: Filter FRL Tersumbat menurunkan tekanan hilir > 50% (ΔP tinggi) sehingga gaya silinder melemah, sedangkan FCV Macet menunjukkan ΔP 0 dengan gaya normal namun kecepatan terhambat hingga ~10%.',
            ja: 'FRLの入口→出口圧力を確認します。FRL詰まりは下流圧力が半減（ΔP大）して推力も落ちますが、FCV固着はΔP=0で推力は正常のまま速度だけが約10%に低下します。',
          },
          keywords: ['clogged', 'frl', 'stuck', 'fcv', 'delta p', 'tersumbat', 'macet', '詰まり'],
        },
      ],
      targetSelector: '[data-tour="pneu-faults"]',
    },
    {
      id: 'pneu-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to study ISO 1219 symbols, build circuits in Practice, and complete the Quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari simbol ISO 1219, merakit sirkuit pada Practice, dan menyelesaikan Quiz.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）でISO 1219記号の学習から回路演習・クイズまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
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
        en: 'Welcome! Operate an interactive centrifugal pump test rig with live H-Q, efficiency, and NPSH curves, parallel pump staging, VFD POR auto-tuning, and API 682 mechanical seal flush selection.',
        id: 'Selamat datang! Operasikan rig uji pompa sentrifugal dengan kurva H-Q, efisiensi, dan NPSH langsung, operasi pompa paralel, auto-tune VFD POR, serta pemilihan rencana flush seal API 682.',
        ja: 'ようこそ！遠心ポンプ試験装置とH-Q・効率・NPSH性能曲線を連動させ、並列運転、VFD自動最適化、API 682メカニカルシールフラッシュ選定を学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to step through every control.',
        id: 'Gunakan tombol Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk menelusuri setiap kontrol.',
        ja: '「次へ / 前へ」または ← / → キーで各機能のガイドを順番に確認できます。',
      },
    },
    {
      id: 'pump-presets',
      badge: { en: 'Feature 1 · Scenarios', id: 'Fitur 1 · Skenario', ja: '機能1 · シナリオ' },
      title: {
        en: 'Operating Scenarios & Reset',
        id: 'Skenario Operasi & Reset',
        ja: '運転シナリオ切替とリセット',
      },
      description: {
        en: 'Click any Scenarios preset in the top bar to jump straight to healthy BEP, cavitation, dead-head, low-flow, or runout states, or click Reset anytime to restore defaults.',
        id: 'Klik prasetel Skenario di bilah atas untuk langsung menguji kondisi BEP sehat, kavitasi, dead-head, aliran rendah, atau runout, atau klik Reset kapan saja untuk mengembalikan pengaturan awal.',
        ja: '上部バーのシナリオボタンで正常BEP・キャビテーション・締切運転・低流量・過大流量を再現でき、「リセット」でいつでも初期値に戻せます。',
      },
      tip: {
        en: 'Load Cavitation or Dead-Head to see how the test rig visual, H-Q curve, and seal life react immediately.',
        id: 'Muat skenario Kavitasi atau Dead-Head untuk melihat reaksi langsung pada tampilan rig uji, kurva H-Q, dan umur seal.',
        ja: '「キャビテーション」や「締切運転」シナリオを読み込むと、試験装置・性能曲線・シール寿命の変化を即座に観察できます。',
      },
      targetSelector: '[data-tour="pump-scenarios"]',
    },
    {
      id: 'pump-rig',
      badge: { en: 'Feature 2 · Test Rig', id: 'Fitur 2 · Rig Uji', ja: '機能2 · 試験装置' },
      title: {
        en: 'Interactive 2D Pump Test Rig',
        id: 'Rig Uji Pompa 2D Interaktif',
        ja: '対話型ポンプ試験装置ビューポート',
      },
      description: {
        en: 'Watch live impeller rotation, suction/discharge pressure gauges, fluid vapor-pressure (Pv) & density (ρ), and animated cavitation vapor bubbles forming at the impeller eye when NPSHa drops below NPSHr.',
        id: 'Amati putaran impeler langsung, pengukur tekanan hisap/buang, tekanan uap fluida (Pv) & densitas (ρ), serta animasi gelembung uap kavitasi di mata impeler saat NPSHa turun di bawah NPSHr.',
        ja: 'インペラ回転、吸込・吐出圧力計、流体蒸気圧(Pv)・密度(ρ)、およびNPSHa < NPSHr時にインペラ吸込口で発生するキャビテーション気泡を視覚的に確認できます。',
      },
      tip: {
        en: 'Bubble formation at the impeller eye implodes violently on the vanes—causing pitting noise and seal failure.',
        id: 'Gelembung uap yang terbentuk di mata impeler meledak keras pada sudu—memicu suara bising, erosi pitting, dan kegagalan seal.',
        ja: '吸込口で発生した気泡は羽根車内部で崩壊し、激しい振動・騒音とインペラ/シールの損傷を引き起こします。',
      },
      targetSelector: '[data-tour="pump-rig"]',
    },
    {
      id: 'pump-controls',
      badge: { en: 'Feature 3 · Rig Controls', id: 'Fitur 3 · Kontrol Rig', ja: '機能3 · 運転操作' },
      title: {
        en: 'Parallel Staging, Speed, Valve, Trim & Suction',
        id: 'Pompa Paralel, Putaran, Katup, Trim & Hisap',
        ja: '並列運転・回転数・吐出弁・トリム・吸込',
      },
      description: {
        en: 'Toggle Single Pump (1×) vs. Parallel (2×), and adjust Impeller Speed (900–2900 RPM), Discharge Valve Opening (0–100%), Impeller Trim (85–100%), Suction Head (-4.5 to +6.0 m), and Fluid Temp (10–95 °C).',
        id: 'Pilih Pompa Tunggal (1×) vs. Paralel (2×), lalu atur penggeser Kecepatan Impeler (900–2900 RPM), Bukaan Katup Buang (0–100%), Trim Impeler (85–100%), Head Hisap (-4,5 hingga +6,0 m), dan Suhu Fluida (10–95 °C).',
        ja: '「単独運転 (1×) / 並列運転 (2×)」を切り替え、インペラ回転数、吐出弁開度、インペラ外径トリム、吸込液位、流体温度を調整できます。',
      },
      tip: {
        en: 'Throttling the discharge valve wastes energy across the valve—using VFD speed control saves power via the cube affinity law (P ∝ N³)!',
        id: 'Menutup sebagian (throttling) katup buang memboroskan energi—kontrol kecepatan VFD menghemat daya sesuai hukum afinitas kubik (P ∝ N³)!',
        ja: '吐出弁の絞り制御は損失が大きいため、VFDによる回転数制御（軸動力∝N³）の方が大幅に省エネになります。',
      },
      targetSelector: '[data-tour="pump-controls"]',
    },
    {
      id: 'pump-vfd',
      badge: { en: 'Feature 4 · Curve & VFD', id: 'Fitur 4 · Kurva & VFD', ja: '機能4 · 性能曲線' },
      title: {
        en: 'H-Q Curve & VFD Auto-Tune (POR)',
        id: 'Kurva H-Q & Auto-Tune VFD (POR)',
        ja: 'H-Q曲線とVFD自動調整 (POR)',
      },
      description: {
        en: 'Inspect the live Pump & System Curve canvas, enter a Target Flow (15–160 m³/h) or click a flow point on the curve, and click VFD Auto-Tune (POR) to set the optimal RPM with a 100% open valve and compare kW savings.',
        id: 'Amati kanvas Kurva Pompa & Sistem, masukkan Target Aliran (15–160 m³/h) atau klik titik pada kurva, lalu tekan Auto-Tune VFD (POR) untuk menyetel RPM optimal pada katup terbuka 100% dan membandingkan penghematan kW.',
        ja: '性能曲線キャンバス上の流量点をクリックするか目標流量（15〜160 m³/h）を入力し、「VFD自動調整 (POR)」を押すと吐出弁全開での最適RPMと省エネkW削減効果が表示されます。',
      },
      tip: {
        en: 'Watch the green savings badge appear below the button showing exact kW and % energy saved vs. valve throttling.',
        id: 'Perhatikan indikator penghematan hijau di bawah tombol yang menampilkan nilai penghematan kW dan % energi dibanding pencekikan katup.',
        ja: 'ボタン下の緑バッジに、弁絞り運転と比較した削減電力（kW）と省エネ率（%）が表示されます。',
      },
      targetSelector: '[data-tour="pump-curve"]',
    },
    {
      id: 'pump-seal-life',
      badge: { en: 'Feature 5 · Seal & API 682', id: 'Fitur 5 · Seal & API 682', ja: '機能5 · シール寿命' },
      title: {
        en: 'Radial Load, Seal Life & API 682 Plan',
        id: 'Beban Radial, Umur Seal & Rencana API 682',
        ja: '軸荷重・シール寿命とAPI 682選定',
      },
      description: {
        en: 'Monitor the In POR / Outside POR badge, Radial Shaft Load (%), Estimated Seal & Bearing Life Index (%), and the automatic API 682 Mechanical Seal Flush recommendation (Plan 11, Plan 21, or Plan 53).',
        id: 'Pantau status Dalam/Di Luar POR, Beban Radial Poros (%), Indeks Estimasi Umur Seal & Bantalan (%), serta rekomendasi otomatis Rencana Flush Seal Mekanis API 682 (Plan 11, Plan 21, atau Plan 53).',
        ja: 'POR範囲内/外バッジ、ラジアル軸荷重（%）、推定シール・軸受寿命指数（%）、および運転条件に応じたAPI 682フラッシュプラン（Plan 11 / 21 / 53）の自動判定を確認します。',
      },
      tip: {
        en: 'Operating inside the Preferred Operating Region (70–120% BEP) keeps radial shaft deflection minimal and maximizes seal life.',
        id: 'Beroperasi di dalam Preferred Operating Region (70–120% BEP) menjaga defleksi poros tetap minimal dan memaksimalkan umur seal.',
        ja: '推奨運転領域（POR: 70〜120% BEP）内で運転することで、ラジアル荷重と軸たわみを最小限に抑えられます。',
      },
      targetSelector: '[data-tour="pump-seal-life"]',
    },
    {
      id: 'pump-diagnostics',
      badge: { en: 'Feature 6 · Troubleshoot', id: 'Fitur 6 · Diagnosis Masalah', ja: '機能6 · 異常診断' },
      title: {
        en: 'Troubleshooting Cavitation, Dead-Head & Runout',
        id: 'Diagnosis Kavitasi, Dead-Head & Runout',
        ja: 'キャビテーション・締切・過大流量の診断',
      },
      description: {
        en: 'Watch this Diagnostic Alert Banner to troubleshoot hydraulic faults: raise Suction Head or cool Fluid Temp if Cavitation (NPSHa < NPSHr) triggers, open the valve for Dead-Head, or slow RPM / throttle for Runout (> 120% BEP).',
        id: 'Pantau Panel Peringatan Diagnostik ini untuk mengatasi gangguan hidrolik: naikkan Head Hisap atau dinginkan Suhu Fluida saat Kavitasi (NPSHa < NPSHr) muncul, buka katup saat Dead-Head, atau turunkan RPM / cekik katup saat Runout (> 120% BEP).',
        ja: 'この診断アラートバナーで異常を切り分けます。キャビテーション(NPSHa < NPSHr)なら吸込液位上昇・流体冷却、締切運転なら吐出弁開放、過大流量(>120% BEP)なら減速で対処します。',
      },
      tip: {
        en: 'Hot water (> 70 °C) has much higher vapor pressure Pv, which eats up NPSHa—cool the fluid or pressurize the suction tank!',
        id: 'Air panas (> 70 °C) memiliki tekanan uap Pv yang jauh lebih tinggi sehingga menurunkan NPSHa—dinginkan fluida atau naikkan tekanan tangki hisap!',
        ja: '高温流体（70 °C超）は蒸気圧Pvが上昇してNPSHaが低下するため、流体冷却または吸込液位の確保が必要です。',
      },
      faqs: [
        {
          q: {
            en: 'How do I stop pump cavitation?',
            id: 'Bagaimana cara menghentikan kavitasi pada pompa?',
            ja: 'ポンプのキャビテーションを止める方法は？',
          },
          a: {
            en: 'Increase NPSHa above NPSHr by raising Suction Tank Head (Hs), lowering Fluid Temperature (T), or reducing pump speed/flow so NPSHr drops.',
            id: 'Tingkatkan NPSHa di atas NPSHr dengan menaikkan Head Tangki Hisap (Hs), menurunkan Suhu Fluida (T), atau mengurangi putaran/aliran pompa agar NPSHr turun.',
            ja: '吸込液位（Hs）を上げる、流体温度（T）を下げる、または回転数を落としてNPSHrを下げることで NPSHa > NPSHr を確保します。',
          },
          keywords: ['cavitation', 'npsha', 'npshr', 'stop', 'fix', 'kavitasi', 'キャビテーション'],
        },
      ],
      targetSelector: '[data-tour="pump-alert"]',
    },
    {
      id: 'pump-workflow',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Explore, Practice & Quiz Workflow',
        id: 'Alur Eksplorasi, Latihan & Kuis',
        ja: '探索・演習・クイズの学習フロー',
      },
      description: {
        en: 'Use Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), and Alt+4 (Quiz) to review affinity laws and NPSH theory, solve practice scenarios, and pass the quiz.',
        id: 'Gunakan Alt+1 (Explore), Alt+2 (Simulate), Alt+3 (Practice), dan Alt+4 (Quiz) untuk mempelajari hukum afinitas dan teori NPSH, menyelesaikan skenario latihan, dan mengikuti kuis.',
        ja: 'Alt+1（探索）、Alt+2（シミュレート）、Alt+3（演習）、Alt+4（クイズ）で相似則・NPSH理論の学習から演習・クイズまで進められます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],
};
