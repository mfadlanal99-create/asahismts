import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_2: Record<string, TutorialStep[]> = {
  'clamp-meter': [
    {
      id: 'clamp-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: '3-Phase Clamp Meter & Feeder Analyzer',
        id: 'Clamp Meter 3-Fasa & Analisis Feeder',
        ja: '三相クランプメータ＆フィーダ解析',
      },
      description: {
        en: 'Welcome! Measure AC phase currents, motor inrush surges, and NEMA MG-1 current unbalance on a 3-phase motor feeder without breaking the circuit.',
        id: 'Selamat datang! Ukur arus AC tiap fasa, lonjakan inrush motor, dan ketidakseimbangan arus NEMA MG-1 pada feeder motor 3-fasa tanpa memutus rangkaian.',
        ja: 'ようこそ！回路を切断せずに三相モータフィーダの交流相電流、始動突入電流、NEMA MG-1電流不平衡率を測定・診断します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを滑らかに切り替えられます。',
      },
    },
    {
      id: 'clamp-svg',
      badge: { en: 'Feature 1 · Feeder SVG', id: 'Fitur 1 · Diagram Feeder', ja: '機能1 · フィーダSVG' },
      title: {
        en: 'Interactive Clamp & Conductor Diagram',
        id: 'Diagram Clamp & Konduktor Interaktif',
        ja: 'インタラクティブ・クランプ＆導体図',
      },
      description: {
        en: 'Click any conductor (L1, L2, L3, or PE / N) directly on the feeder SVG to snap the clamp jaw around that wire and read its live RMS current.',
        id: 'Klik konduktor (L1, L2, L3, atau PE / N) langsung pada SVG feeder untuk memindahkan rahang clamp dan membaca arus RMS secara langsung.',
        ja: 'SVG上の各導体（L1・L2・L3・PE / N）を直接クリックしてクランプ位置を移動し、実効値電流を読み取ります。',
      },
      tip: {
        en: 'Always clamp one single conductor at a time; clamping all three phases together cancels the magnetic flux to zero.',
        id: 'Selalu jepit satu konduktor saja; menjepit tiga fasa sekaligus membuat fluks magnet saling meniadakan.',
        ja: '必ず1本の導体のみをクランプしてください。三相をまとめて挟むと磁束が打ち消し合いゼロになります。',
      },
      targetSelector: '[data-tour="clamp-svg"]',
    },
    {
      id: 'clamp-jaw-target',
      badge: { en: 'Feature 2 · Conductor', id: 'Fitur 2 · Konduktor', ja: '機能2 · 対象導体' },
      title: {
        en: 'Clamp Jaw Target Selector (L1 / L2 / L3 / PE)',
        id: 'Pemilih Target Penjepit (L1 / L2 / L3 / PE)',
        ja: 'クランプ対象導体セレクタ',
      },
      description: {
        en: 'Switch between L1 (U), L2 (V), L3 (W), and PE / N to compare individual phase currents and detect ground or neutral leakage current.',
        id: 'Pilih antara L1 (U), L2 (V), L3 (W), dan PE / N untuk membandingkan arus tiap fasa dan mendeteksi arus bocor ke tanah/netral.',
        ja: 'L1 (U)・L2 (V)・L3 (W)・PE / N を切り替えて各相電流を比較し、接地線や中性線の漏れ電流を検出します。',
      },
      tip: {
        en: 'A healthy balanced 3-phase motor shows ~0 A on PE / N and equal currents across L1, L2, and L3.',
        id: 'Motor 3-fasa sehat menunjukkan ~0 A pada PE / N dan arus seimbang di L1, L2, L3.',
        ja: '健全な三相モータでは PE / N はほぼ0 Aとなり、L1・L2・L3 の電流が平衡します。',
      },
      targetSelector: '[data-tour="clamp-jaw-target"]',
    },
    {
      id: 'clamp-inrush',
      badge: { en: 'Feature 3 · Inrush', id: 'Fitur 3 · Mode Inrush', ja: '機能3 · 突入電流' },
      title: {
        en: 'Motor Inrush Current Capture',
        id: 'Penangkap Arus Start (INRUSH)',
        ja: '始動突入電流（INRUSH）モード',
      },
      description: {
        en: 'Toggle INRUSH to capture the locked-rotor starting surge (typically 5×–7× full-load current) when the motor energizes across the line.',
        id: 'Aktifkan INRUSH untuk menangkap lonjakan arus start (umumnya 5×–7× arus beban penuh) saat motor mulai berputar.',
        ja: 'INRUSHをオンにすると、直入れ始動時の拘束電流サージ（通常定格の5〜7倍）を捕捉できます。',
      },
      tip: {
        en: 'Use Inrush mode to verify breaker trip curves and check if a motor is stalling on startup.',
        id: 'Gunakan mode Inrush untuk memverifikasi kurva trip pemutus daya dan memeriksa motor macet saat start.',
        ja: 'ブレーカのトリップ特性確認や始動ロックの診断に突入電流モードを活用します。',
      },
      targetSelector: '[data-tour="clamp-inrush"]',
    },
    {
      id: 'clamp-load',
      badge: { en: 'Feature 4 · Shaft Load', id: 'Fitur 4 · Beban Poros', ja: '機能4 · 機械軸負荷' },
      title: {
        en: 'Mechanical Shaft Load Slider (25%–110%)',
        id: 'Slider Beban Poros Mekanis (25%–110%)',
        ja: '機械軸負荷スライダ（25%〜110%）',
      },
      description: {
        en: 'Drag the Mechanical Shaft Load slider in 5% steps to vary motor torque demand and observe how phase current, power factor (cos φ), and active power respond.',
        id: 'Geser slider Beban Poros Mekanis tiap 5% untuk mengubah torsi motor dan mengamati respons arus fasa, faktor daya (cos φ), serta daya aktif.',
        ja: '5%刻みの軸負荷スライダを動かし、軽負荷から過負荷までの相電流・力率・有効電力の変化を観察します。',
      },
      targetSelector: '[data-tour="clamp-load"]',
    },
    {
      id: 'clamp-telemetry',
      badge: { en: 'Feature 5 · Telemetry', id: 'Fitur 5 · Telemetri NEMA', ja: '機能5 · 電力・NEMA' },
      title: {
        en: '3-Phase Power & NEMA MG-1 Unbalance',
        id: 'Telemetri Daya 3-Fasa & NEMA MG-1',
        ja: '三相電力・NEMA MG-1 不平衡テレメトリ',
      },
      description: {
        en: 'Monitor Active Power (kW), Apparent Power (kVA), Power Factor (cos φ), and Current Unbalance (%). Unbalance turns amber (derate) or red (critical) when NEMA MG-1 limits are exceeded.',
        id: 'Pantau Daya Aktif (kW), Daya Semu (kVA), Faktor Daya (cos φ), dan Ketidakseimbangan Arus (%). Warna berubah kuning/merah saat melampaui batas NEMA MG-1.',
        ja: '有効電力(kW)、皮相電力(kVA)、力率(cos φ)、電流不平衡率(%)を監視します。NEMA MG-1基準を超えると警告色または危険色に変化します。',
      },
      targetSelector: '[data-tour="clamp-telemetry"]',
    },
    {
      id: 'clamp-diagnostics',
      badge: { en: 'Feature 6 · Analysis', id: 'Fitur 6 · Analisis Daya', ja: '機能6 · 診断バナー' },
      title: {
        en: 'Power & Unbalance Analysis Banner',
        id: 'Banner Analisis Daya & Ketidakseimbangan',
        ja: '電力・不平衡診断バナー',
      },
      description: {
        en: 'Read live engineering diagnostics explaining whether phase currents are balanced, derated, or experiencing a critical feeder fault.',
        id: 'Baca diagnosis teknik langsung yang menjelaskan apakah arus fasa seimbang, perlu derating, atau mengalami gangguan feeder kritis.',
        ja: '相電流が平衡か、ディレーティング要か、重大なフィーダ故障かを解説するリアルタイム診断メッセージを確認します。',
      },
      targetSelector: '[data-tour="clamp-diagnostics"]',
    },
    {
      id: 'clamp-faults',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Troubleshooting', ja: '機能7 · 故障診断' },
      title: {
        en: 'Feeder Fault Scenario Troubleshooting',
        id: 'Troubleshooting Skenario Gangguan Feeder',
        ja: 'フィーダ故障シナリオ診断',
      },
      description: {
        en: 'Inject realistic faults (unbalance, single-phasing, or ground leakage). Clamp L1, L2, L3, and PE / N in sequence to isolate which conductor carries the anomaly.',
        id: 'Suntikkan gangguan nyata (ketidakseimbangan, putus fasa, atau bocor tanah). Pindahkan clamp ke L1, L2, L3, dan PE / N secara berurutan untuk melokalisasi gangguan.',
        ja: '不平衡・欠相・地絡漏れなどの故障を注入し、L1・L2・L3・PE / N を順にクランプして異常箇所を特定します。',
      },
      tip: {
        en: 'Zero amps on one phase with elevated current on the other two indicates an open fuse or single-phasing fault.',
        id: 'Arus nol pada satu fasa disertai lonjakan arus di dua fasa lain menandakan sekring putus (single-phasing).',
        ja: '1相のみ電流ゼロで他2相が過電流の場合、ヒューズ断線や欠相故障の典型的な兆候です。',
      },
      faqs: [
        {
          q: {
            en: 'How do I diagnose single-phasing vs ground leakage?',
            id: 'Bagaimana membedakan putus fasa vs bocor ke tanah?',
            ja: '欠相と地絡漏れはどう見分けますか？',
          },
          a: {
            en: 'In single-phasing, one phase reads 0 A while the remaining two phases rise ~1.73×. In ground leakage, PE / N carries measurable current (> 0 A) equal to the vector imbalance.',
            id: 'Pada putus fasa, satu fasa terbaca 0 A sedangkan dua fasa lain naik ~1,73×. Pada bocor ke tanah, konduktor PE / N mengalirkan arus bocor terukur (> 0 A).',
            ja: '欠相では1相が0 Aとなり残り2相が約1.73倍に増加します。地絡漏れでは PE / N 導体に不平衡分の漏れ電流が検出されます。',
          },
          keywords: ['single-phasing', 'ground', 'leakage', 'fault', 'putus fasa', 'bocor'],
        },
      ],
      targetSelector: '[data-tour="clamp-faults"]',
    },
    {
      id: 'clamp-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs (or Alt+1..4) to switch between Simulate, Explore, Practice, and Quiz to test your 3-phase clamp diagnostic skills.',
        id: 'Gunakan tab mode di atas (atau Alt+1..4) untuk berpindah antara Simulasi, Jelajah, Latihan, dan Kuis guna menguji kemampuan diagnosis Anda.',
        ja: '上部タブ（または Alt+1〜4）でシミュレーション・探索・演習・クイズを切り替え、三相クランプ診断の理解度を確認できます。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  compressor: [
    {
      id: 'comp-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Rotary Screw Air Compressor Skid',
        id: 'Skid Kompresor Udara Rotary Screw',
        ja: 'スクリュー空気圧縮機スキッド',
      },
      description: {
        en: 'Welcome! Explore an industrial rotary screw compressor skid with live 4:6 rotor animation, receiver Load/Unload pressure cycling, condensate drainage, and leak cost analytics.',
        id: 'Selamat datang! Pelajari skid kompresor rotary screw industri lengkap dengan animasi rotor 4:6, siklus tekanan Load/Unload, pembuangan kondensat, dan analisis biaya kebocoran.',
        ja: 'ようこそ！4:6スクリューロータ、レシーバのロード/アンロード制御、オートドレン、エア漏れコスト解析を備えた産業用空気圧縮機スキッドを学びましょう。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'comp-scenarios',
      badge: { en: 'Feature 1 · Scenarios', id: 'Fitur 1 · Skenario', ja: '機能1 · シナリオ' },
      title: {
        en: 'Fault Presets & Reset Bar',
        id: 'Preset Gangguan & Tombol Reset',
        ja: 'シナリオプリセット＆リセットバー',
      },
      description: {
        en: 'Load Optimal Baseline, Clogged Intake Filter, Fouled Intercooler, Failed Condensate Drain, or Excessive Plant Leaks—or click Reset to return to baseline.',
        id: 'Muat skenario Baseline Optimal, Filter Hisap Tersumbat, Intercooler Kotor, Auto-Drain Gagal, atau Kebocoran Berlebih—atau klik Reset untuk kembali awal.',
        ja: '正常ベースラインや各種故障シナリオ（吸込フィルタ目詰まり・クーラ汚れ・ドレン故障・過大漏れ）をワンクリックで読み込みます。',
      },
      targetSelector: '[data-tour="compressor-scenarios"]',
    },
    {
      id: 'comp-skid',
      badge: { en: 'Feature 2 · Skid CAD', id: 'Fitur 2 · Skematik Skid', ja: '機能2 · スキッド系統図' },
      title: {
        en: 'Live Rotary Screw Skid Schematic',
        id: 'Skematik Skid Rotary Screw Langsung',
        ja: 'リアルタイム・スクリュー圧縮機系統図',
      },
      description: {
        en: 'Watch the intake filter, 4:6 screw airend, cooling fan, air/oil separator, aftercooler, and receiver tank respond in real time to load state and fault conditions.',
        id: 'Amati filter hisap, airend 4:6, kipas pendingin, separator oli, aftercooler, dan tangki receiver merespons kondisi beban dan gangguan secara langsung.',
        ja: '吸込フィルタ、4:6スクリュー本体、冷却ファン、オイルセパレータ、アフタクーラ、レシーバタンクの動作をリアルタイムに観察します。',
      },
      targetSelector: '[data-tour="compressor-skid"]',
    },
    {
      id: 'comp-kpis',
      badge: { en: 'Feature 3 · Live KPIs', id: 'Fitur 3 · Kartu KPI', ja: '機能3 · KPI表示' },
      title: {
        en: '6 Live Compressor KPI Readouts',
        id: '6 Kartu KPI Kompresor Langsung',
        ja: '6つのリアルタイムKPIメータ',
      },
      description: {
        en: 'Track Discharge Pressure, Discharge Temp (trips > 105 °C), Pressure Dew Point (water carryover > 8 °C), Specific Power, Load Duty Cycle, and Annual Energy Cost.',
        id: 'Pantau Tekanan & Suhu Keluaran (trip > 105 °C), Titik Embun Tekan (water carryover > 8 °C), Daya Spesifik, Siklus Tugas, dan Biaya Energi Tahunan.',
        ja: '吐出圧力・吐出温度（105℃超でトリップ）・圧力露点・比動力・負荷率・年間電力コストを常時監視します。',
      },
      targetSelector: '[data-tour="compressor-kpis"]',
    },
    {
      id: 'comp-setpoints',
      badge: { en: 'Feature 4 · Setpoints', id: 'Fitur 4 · Setpoint', ja: '機能4 · 圧力・需要設定' },
      title: {
        en: 'Load/Unload Band & Plant Air Demand',
        id: 'Pita Tekanan Load/Unload & Kebutuhan Udara',
        ja: 'ロード/アンロード圧力帯と工場エア需要',
      },
      description: {
        en: 'Adjust Load Pressure (5.5–8.5 bar), Unload Pressure (6.5–9.5 bar), and Plant Air Demand (1.0–12.0 m³/min) to balance pressure stability against specific power.',
        id: 'Atur Tekanan Load (5,5–8,5 bar), Unload (6,5–9,5 bar), dan Kebutuhan Udara Pabrik (1,0–12,0 m³/min) untuk menyeimbangkan stabilitas tekanan dan efisiensi daya.',
        ja: 'ロード圧力（5.5〜8.5 bar）、アンロード圧力（6.5〜9.5 bar）、工場エア需要（1.0〜12.0 m³/min）を調整して圧力安定性と比動力を比較します。',
      },
      tip: {
        en: 'Every 1 bar above required plant pressure wastes roughly 6–8% compressor shaft power.',
        id: 'Setiap kenaikan 1 bar di atas kebutuhan pabrik memboroskan sekitar 6–8% daya kompresor.',
        ja: '必要圧力より1 bar高く設定すると、消費電力が約6〜8%増加します。',
      },
      targetSelector: '[data-tour="compressor-setpoints"]',
    },
    {
      id: 'comp-analytics',
      badge: { en: 'Feature 5 · Analytics', id: 'Fitur 5 · Analitik', ja: '機能5 · トレンド・漏れ試算' },
      title: {
        en: 'Pressure Trend & Air Leak Cost Calculator',
        id: 'Tren Tekanan & Kalkulator Biaya Kebocoran',
        ja: '圧力トレンド＆エア漏れ損失試算',
      },
      description: {
        en: 'Inspect the live Load/Unload sawtooth pressure trace and select orifice leak diameters (1–5 mm) to quantify wasted air flow and annual electricity cost.',
        id: 'Amati grafik gigi gergaji tekanan Load/Unload serta pilih diameter lubang bocor (1–5 mm) untuk menghitung udara terbuang dan biaya listrik tahunan.',
        ja: 'ロード/アンロードののこぎり波圧力トレンドと、オリフィス穴径（1〜5 mm）別の年間エア漏れ損失コストを確認します。',
      },
      targetSelector: '[data-tour="compressor-analytics"]',
    },
    {
      id: 'comp-faults',
      badge: { en: 'Feature 6 · Fault Sliders', id: 'Fitur 6 · Parameter Gangguan', ja: '機能6 · 故障パラメータ' },
      title: {
        en: 'Fault & Maintenance Sliders',
        id: 'Slider Gangguan & Perawatan',
        ja: '故障・保守パラメータ設定',
      },
      description: {
        en: 'Simulate wear via Intake Filter ΔP (0–120 mbar), Cooler Fouling (0–100%), Plant Leak Rate (0–45%), and the Condensate Auto-Drain valve (ON / FAILED).',
        id: 'Simulasikan keausan dengan ΔP Filter Hisap (0–120 mbar), Pengotoran Cooler (0–100%), Laju Kebocoran (0–45%), dan katup Auto-Drain (AKTIF / GAGAL).',
        ja: '吸込フィルタ目詰まりΔP、クーラ汚れ率、エア漏れ率、オートドレン弁（ON/故障）を操作して異常の進行を確認します。',
      },
      targetSelector: '[data-tour="compressor-faults"]',
    },
    {
      id: 'comp-blind',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis Buta', ja: '機能7 · ブラインド診断' },
      title: {
        en: 'Blind Fault Diagnosis Challenge',
        id: 'Tantangan Diagnosis Gangguan Buta',
        ja: 'ブラインド故障診断チャレンジ',
      },
      description: {
        en: 'Click Blind Diagnosis to inject a hidden fault with masked sliders. Inspect discharge temperature, Pressure Dew Point, receiver H₂O level, and duty cycle to diagnose the root cause.',
        id: 'Klik Diagnosis Buta untuk menyuntikkan gangguan tersembunyi. Periksa suhu keluar, Pressure Dew Point, level air receiver, dan duty cycle untuk menentukan akar masalah.',
        ja: '「ブラインド診断」を押すと故障パラメータが隠されます。吐出温度・圧力露点・ドレン水位・負荷率から原因を特定しましょう。',
      },
      faqs: [
        {
          q: {
            en: 'How do I tell a Fouled Cooler from a Clogged Intake Filter?',
            id: 'Bagaimana membedakan Cooler Kotor dan Filter Hisap Tersumbat?',
            ja: 'クーラ汚れと吸込フィルタ目詰まりの見分け方は？',
          },
          a: {
            en: 'A Clogged Intake Filter reduces FAD flow (raising duty cycle) and increases intake ΔP. A Fouled Cooler keeps intake ΔP low but spikes Discharge Temp (> 105 °C trip) and Pressure Dew Point.',
            id: 'Filter Hisap Tersumbat menaikkan ΔP hisap dan duty cycle karena FAD turun. Cooler Kotor memiliki ΔP hisap rendah namun memicu lonjakan Suhu Keluaran (> 105 °C) dan Pressure Dew Point.',
            ja: '吸込フィルタ目詰まりは吸込ΔP上昇とFAD低下（負荷率上昇）が特徴です。クーラ汚れは吸込ΔPが正常のまま吐出温度（105℃トリップ）と圧力露点が急上昇します。',
          },
          keywords: ['cooler', 'filter', 'clogged', 'fouled', 'temp', 'dew point'],
        },
      ],
      targetSelector: '[data-tour="compressor-blind"]',
    },
    {
      id: 'comp-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch between Simulate, Explore, Practice, and Quiz at the top to master rotary screw air systems and fault troubleshooting.',
        id: 'Berpindah antara Simulasi, Jelajah, Latihan, dan Kuis di bilah atas untuk menguasai sistem kompresor screw dan diagnosis gangguannya.',
        ja: '上部タブでシミュレーション・探索・演習・クイズを切り替え、スクリュー圧縮機の知識と故障診断力を定着させましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  coupling: [
    {
      id: 'coup-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Dynamic Balancing & Coupling Inspection',
        id: 'Penyeimbangan Dinamis & Inspeksi Kopling',
        ja: '動釣合い試験＆カップリング点検',
      },
      description: {
        en: 'Welcome! Perform single-plane rotor dynamic balancing using influence coefficients and inspect coupling misalignment, keyway shear stress, and torsional backlash.',
        id: 'Selamat datang! Lakukan penyeimbangan dinamis rotor 1-bidang dengan koefisien pengaruh serta inspeksi misalignment kopling, tegangan pasak, dan backlash torsi.',
        ja: 'ようこそ！影響係数法による1面動釣合い試験と、カップリングのミスアライメント・キー応力・ねじりバックラッシ点検を実践できます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'coup-subtabs',
      badge: { en: 'Feature 1 · Lab Tabs', id: 'Fitur 1 · Tab Lab', ja: '機能1 · ラボ切替' },
      title: {
        en: 'Balancing Lab & Coupling Inspection Switcher',
        id: 'Pemilih Lab Balancing & Inspeksi Kopling',
        ja: '動釣合い・カップリング点検タブ',
      },
      description: {
        en: 'Switch between Single-Plane Dynamic Balancing Lab and Coupling & Keyway Inspection to evaluate spider/gear wear, key stress (DIN 6885), and misalignment tolerances.',
        id: 'Berpindah antara Lab Penyeimbangan Dinamis 1-Bidang dan Inspeksi Kopling & Alur Pasak untuk mengevaluasi keausan kopling, tegangan pasak, dan batas misalignment.',
        ja: '「1面動釣合い試験ラボ」と「カップリング・キー溝点検」を切り替え、摩耗・キー応力・許容ミスアライメントを評価します。',
      },
      targetSelector: '[data-tour="coupling-subtabs"]',
    },
    {
      id: 'coup-rotor-polar',
      badge: { en: 'Feature 2 · Rotor & Polar', id: 'Fitur 2 · Rotor & Polar', ja: '機能2 · ロータ・極座標' },
      title: {
        en: 'Rotor Disk (0°–360°) & Polar Vector Plot',
        id: 'Cakram Rotor (0°–360°) & Plot Vektor Polar',
        ja: 'ロータ円板＆1X極座標ベクトル図',
      },
      description: {
        en: 'Observe the spinning rotor heavy spot, trial weight, and correction weight positions alongside the 1X vibration phasor plot (V0, V1, and Vt).',
        id: 'Amati posisi heavy spot, beban uji, dan beban koreksi pada cakram rotor bersama plot fasor getaran 1X (V0, V1, dan Vt).',
        ja: 'ロータ上の重点・試しおもり・修正おもりの位置と、1X振動フェーザ図（V0・V1・Vt）のベクトル変化を確認します。',
      },
      targetSelector: '[data-tour="coupling-rotor-polar"]',
    },
    {
      id: 'coup-waveform',
      badge: { en: 'Feature 3 · 1X Sine Plot', id: 'Fitur 3 · Gelombang 1X', ja: '機能3 · 1X時間波形' },
      title: {
        en: '1× Time-Waveform Vibration Sine Plot',
        id: 'Plot Gelombang Waktu Getaran 1×',
        ja: '1× 時間波形振動サインプロット',
      },
      description: {
        en: 'Compare the dashed red initial baseline V0 wave against the solid active 1× vibration wave to see amplitude reduction and phase shift in real time.',
        id: 'Bandingkan gelombang baseline V0 merah putus-putus dengan gelombang 1× aktif untuk melihat penurunan amplitudo dan pergeseran fasa.',
        ja: '初期ベースラインV0（赤破線）と現在の1×波形（実線）を比較し、振幅低減と位相変化を直感的に確認します。',
      },
      targetSelector: '[data-tour="coupling-waveform"]',
    },
    {
      id: 'coup-step1',
      badge: { en: 'Feature 4 · Step 1 (V0)', id: 'Fitur 4 · Langkah 1 (V0)', ja: '機能4 · 初期測定(V0)' },
      title: {
        en: '1. Initial Baseline Run (V0)',
        id: '1. Pengukuran Awal (V0)',
        ja: '1. 初期ベースライン運転 (V0)',
      },
      description: {
        en: 'Click Run Initial Measurement (V0) to record the baseline 1X vibration amplitude and phase angle with no trial weights attached.',
        id: 'Klik Jalankan Pengukuran Awal (V0) untuk mencatat amplitudo dan sudut fasa getaran 1X awal tanpa beban uji.',
        ja: '「初期測定を実行 (V0)」をクリックし、試しおもり無しの初期1X振幅と位相角を記録します。',
      },
      targetSelector: '[data-tour="coupling-step1"]',
    },
    {
      id: 'coup-step2',
      badge: { en: 'Feature 5 · Step 2 (V1)', id: 'Fitur 5 · Langkah 2 (V1)', ja: '機能5 · 試しおもり(V1)' },
      title: {
        en: '2. Attach Trial Weight (mt @ θt)',
        id: '2. Pasang Beban Uji (mt @ θt)',
        ja: '2. 試しおもり装着 (mt @ θt)',
      },
      description: {
        en: 'Set Trial Mass (mt) and Trial Angle (θt), then click Attach Trial Weight & Measure V1 so the influence coefficient α can be solved from Vt = V1 − V0.',
        id: 'Atur Massa Uji (mt) dan Sudut Uji (θt), lalu klik Pasang Beban Uji & Ukur V1 agar koefisien pengaruh α dapat dihitung dari Vt = V1 − V0.',
        ja: '試し質量(mt)と角度(θt)を設定してV1を測定し、Vt = V1 − V0 からロータの影響係数αを算出します。',
      },
      targetSelector: '[data-tour="coupling-step2"]',
    },
    {
      id: 'coup-step3',
      badge: { en: 'Feature 6 · Step 3 (mc)', id: 'Fitur 6 · Langkah 3 (mc)', ja: '機能6 · 修正おもり(mc)' },
      title: {
        en: '3. Install Correction Weight (mc @ θc)',
        id: '3. Pasang Beban Koreksi (mc @ θc)',
        ja: '3. 修正おもり装着 (mc @ θc)',
      },
      description: {
        en: 'Use Auto-Fill Solved mc, θc (or adjust manually) and click Remove Trial & Balance to cancel the unbalance vector and verify the % vibration reduction.',
        id: 'Gunakan Isi Otomatis mc, θc (atau atur manual) lalu klik Lepas Uji & Seimbangkan untuk meniadakan vektor unbalance dan melihat % penurunan getaran.',
        ja: '計算値 mc, θc を自動入力（または手動設定）し、「試し外し・釣合い実行」で不釣合いベクトルを相殺します。',
      },
      targetSelector: '[data-tour="coupling-step3"]',
    },
    {
      id: 'coup-iso-meter',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis ISO', ja: '機能7 · ISO振動診断' },
      title: {
        en: 'ISO 10816-3 Vibration Severity Diagnostics',
        id: 'Diagnosis Keparahan Getaran ISO 10816-3',
        ja: 'ISO 10816-3 振動シビアリティ診断',
      },
      description: {
        en: 'Verify that balancing drops 1X RMS vibration from Zone C/D (alarm/damage) into Zone A (≤ 1.4 mm/s). If vibration worsens after correction, check whether θc was placed 180° opposite or trial weight was left installed.',
        id: 'Pastikan balancing menurunkan getaran RMS 1X dari Zona C/D ke Zona A (≤ 1,4 mm/s). Jika getaran memburuk, periksa apakah sudut θc terbalik 180° atau beban uji lupa dilepas.',
        ja: '修正後に振動がゾーンC/DからゾーンA（1.4 mm/s以下）へ低下したか確認します。悪化した場合は角度180°誤りや試しおもりの外し忘れを確認してください。',
      },
      faqs: [
        {
          q: {
            en: 'Why must I remove the trial weight before installing mc?',
            id: 'Mengapa beban uji harus dilepas sebelum memasang beban koreksi?',
            ja: 'なぜ修正おもりを付ける前に試しおもりを外すのですか？',
          },
          a: {
            en: 'The solved correction weight mc @ θc is calculated to cancel V0 alone. Leaving mt installed adds an extra Vt vector, leaving residual unbalance.',
            id: 'Beban koreksi mc @ θc dihitung untuk meniadakan V0 saja. Jika mt tidak dilepas, vektor Vt tetap ada sehingga rotor masih tidak seimbang.',
            ja: '修正おもり mc @ θc は初期不釣合い V0 のみを打ち消すよう計算されているため、試しおもり mt を残すと Vt 分の残留不釣合いが生じます。',
          },
          keywords: ['trial weight', 'remove', 'correction', 'unbalance', 'beban uji', 'lepas'],
        },
      ],
      targetSelector: '[data-tour="coupling-iso-meter"]',
    },
    {
      id: 'coup-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs to switch to Explore, Practice, or Quiz and test your dynamic balancing and coupling inspection skills.',
        id: 'Gunakan tab mode di atas untuk berpindah ke Jelajah, Latihan, atau Kuis guna menguji kemampuan balancing dan inspeksi kopling Anda.',
        ja: '上部タブから探索・演習・クイズに切り替え、動釣合い計算やカップリング点検の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'crystal-lattice-3d': [
    {
      id: 'crys-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: '3D Crystal Lattice & Bravais Explorer',
        id: 'Penjelajah Kisi Kristal 3D & Bravais',
        ja: '3D結晶格子＆ブラベー格子エクスプローラ',
      },
      description: {
        en: 'Welcome! Inspect all 14 Bravais lattices, real engineering metals and ceramics, Miller planes (hkl), slip directions [uvw], crystal defects, and simulated X-ray diffraction.',
        id: 'Selamat datang! Amati 14 kisi Bravais, material teknik nyata, bidang Miller (hkl), arah slip [uvw], cacat kristal, dan difraksi sinar-X (XRD) simulasi.',
        ja: 'ようこそ！14種類のブラベー格子、実在金属・セラミックス、ミラー指数(hkl)・すべり方向[uvw]、結晶欠陥、模擬XRD回折を3Dで学習します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'crys-system-filter',
      badge: { en: 'Feature 1 · Systems', id: 'Fitur 1 · Sistem Kristal', ja: '機能1 · 結晶系' },
      title: {
        en: 'Crystal System Filter & View Switcher',
        id: 'Filter Sistem Kristal & Tampilan',
        ja: '結晶系フィルタ＆一覧切替',
      },
      description: {
        en: 'Filter the 14 Bravais lattices by crystal system (Cubic, Tetragonal, Orthorhombic, Hexagonal, etc.) and toggle between Strip or Gallery preview cards.',
        id: 'Saring 14 kisi Bravais berdasarkan sistem kristal (Kubik, Tetragonal, Ortorombik, Heksagonal, dll.) dan pilih tampilan Deret atau Galeri.',
        ja: '14のブラベー格子を結晶系（立方・正方・斜方・六方など）で絞り込み、ストリップ/ギャラリー表示を切り替えます。',
      },
      targetSelector: '[data-tour="crystal-system-filter"]',
    },
    {
      id: 'crys-real-materials',
      badge: { en: 'Feature 2 · Materials', id: 'Fitur 2 · Material Nyata', ja: '機能2 · 実在結晶' },
      title: {
        en: 'Real Engineering Materials Quick-Load',
        id: 'Muat Cepat Material Teknik Nyata',
        ja: '実在工学材料クイックロード',
      },
      description: {
        en: 'Click any real material pill (Cu, α-Fe, Ti, Si, Martensite, etc.) to load its authentic lattice constants (a, c/a), packing factor, and theoretical density.',
        id: 'Klik material nyata (Cu, α-Fe, Ti, Si, Martensit, dll.) untuk memuat konstanta kisi asli (a, c/a), faktor tumpukan atom, dan densitas teoretis.',
        ja: '実在材料ボタン（Cu、α-Fe、Ti、Si、マルテンサイト等）をクリックして実測の格子定数・充填率・理論密度を読み込みます。',
      },
      targetSelector: '[data-tour="crystal-real-materials"]',
    },
    {
      id: 'crys-viewport',
      badge: { en: 'Feature 3 · 3D Canvas', id: 'Fitur 3 · Kanvas 3D', ja: '機能3 · 3Dキャンバス' },
      title: {
        en: 'Interactive 3D Crystal Viewport',
        id: 'Viewport Kristal 3D Interaktif',
        ja: 'インタラクティブ3D結晶ビューポート',
      },
      description: {
        en: 'Drag to orbit, Shift+drag to pan, scroll to zoom, and click any atom to inspect its site role (Corner, Face, Body Center) and nearest-neighbor coordination.',
        id: 'Seret untuk memutar, Shift+seret untuk menggeser, gulir untuk zoom, dan klik atom untuk memeriksa peran situs dan bilangan koordinasinya.',
        ja: 'ドラッグで回転、Shift+ドラッグで平行移動、スクロールで拡大縮小、原子クリックでサイト種別と配位数を表示します。',
      },
      targetSelector: '[data-tour="crystal-viewport"]',
    },
    {
      id: 'crys-display-dock',
      badge: { en: 'Feature 4 · Display Mode', id: 'Fitur 4 · Mode Tampilan', ja: '機能4 · 表示モード' },
      title: {
        en: '4-Mode Crystal Representation Dock',
        id: 'Dok 4 Mode Representasi Kristal',
        ja: '4種結晶表示モードドック',
      },
      description: {
        en: 'Switch between Ball & Stick, Hard-Sphere (tangent atomic radii), Sliced Cell (net Z atoms inside unit cell), and Coordination polyhedra.',
        id: 'Berpindah antara Bola & Batang, Bola Rapat (APF), Sel Terpotong (jumlah atom bersih Z), dan mode Koordinasi.',
        ja: '球棒モデル、剛体球（原子充填率APF）、単位格子切断（格子内実効原子数Z）、配位結合表示を切り替えます。',
      },
      targetSelector: '[data-tour="crystal-display-dock"]',
    },
    {
      id: 'crys-toggles',
      badge: { en: 'Feature 5 · Overlays', id: 'Fitur 5 · Overlay Sel', ja: '機能5 · オーバーレイ' },
      title: {
        en: '2×2×2 Supercell, Bonds, Axes & Voids',
        id: 'Supersel 2×2×2, Ikatan, Sumbu & Rongga',
        ja: '2×2×2拡張・結合・結晶軸・空隙表示',
      },
      description: {
        en: 'Toggle 2×2×2 supercell expansion, atomic bonds, crystallographic axes (a, b, c), and octahedral/tetrahedral interstitial void sites.',
        id: 'Aktifkan ekspansi supersel 2×2×2, ikatan atom, sumbu kristal (a, b, c), dan rongga interstisial oktahedral/tetrahedral.',
        ja: '2×2×2スーパーセル拡張、原子結合、結晶軸(a,b,c)、八面体/四面体格子間空隙の表示を切り替えます。',
      },
      targetSelector: '[data-tour="crystal-toggles"]',
    },
    {
      id: 'crys-deck',
      badge: { en: 'Feature 6 · KPIs & XRD', id: 'Fitur 6 · KPI & XRD', ja: '機能6 · KPI・XRD' },
      title: {
        en: 'Crystallographic KPIs & XRD Diffractometer',
        id: 'KPI Kristalografi & Difraktometer XRD',
        ja: '結晶学KPI＆粉末XRD回折',
      },
      description: {
        en: 'Read Z, coordination number, APF, and theoretical density—or open the XRD Diffractometer tab and click any Bragg peak to highlight its (hkl) plane in 3D.',
        id: 'Baca Z, bilangan koordinasi, APF, dan densitas teoretis—atau buka tab Difraktometer XRD lalu klik puncak Bragg untuk menyorot bidang (hkl) di 3D.',
        ja: '原子数Z・配位数・APF・理論密度を確認でき、XRDタブではBraggピークをクリックして対応する(hkl)面を3D表示できます。',
      },
      targetSelector: '[data-tour="crystal-deck"]',
    },
    {
      id: 'crys-defects',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Cacat & hkl', ja: '機能7 · 格子欠陥・指数' },
      title: {
        en: 'Miller Planes, Slip & 3D Crystal Defects',
        id: 'Bidang Miller, Slip & Cacat Kristal 3D',
        ja: 'ミラー指数・すべり＆3D格子欠陥診断',
      },
      description: {
        en: 'Open the hkl & Defects tab to test custom (hkl) planes, slip [uvw] Schmid factors, and inject 3D defects (vacancies, carbon interstitials, substitutional atoms) to diagnose lattice distortion.',
        id: 'Buka tab hkl & Cacat untuk menguji bidang (hkl), faktor Schmid [uvw], serta menyuntikkan cacat 3D (kekosongan, interstisi karbon, substitusi) guna menganalisis distorsi kisi.',
        ja: '「指数・欠陥」タブで任意の(hkl)面・[uvw]すべり・シュミット因子を確認し、空孔や侵入型炭素などの3D格子欠陥による歪みを解析します。',
      },
      faqs: [
        {
          q: {
            en: 'Why does interstitial carbon turn FCC/BCC into BCT Martensite?',
            id: 'Mengapa atom karbon interstisi mengubah sel menjadi Martensit BCT?',
            ja: '侵入型炭素はなぜ格子をBCTマルテンサイトへ歪ませるのですか？',
          },
          a: {
            en: 'Carbon atoms trapped in octahedral sites along the c-axis elongate the c/a ratio, creating asymmetric tetragonal distortion that blocks dislocation slip and hardens steel.',
            id: 'Atom karbon yang terperangkap di rongga oktahedral sepanjang sumbu-c memanjangkan rasio c/a, menghambat gerak dislokasi dan mengeraskan baja.',
            ja: '八面体空隙に捕捉された炭素原子がc軸方向を引き伸ばし、c/a比が増大して転位運動を阻害するため鋼が著しく硬化します。',
          },
          keywords: ['martensite', 'bct', 'carbon', 'interstitial', 'defect', 'bain'],
        },
      ],
      targetSelector: '[data-tour="crystal-defect-tab"]',
    },
    {
      id: 'crys-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs to switch to Explore, Practice, or Quiz and test your crystallography and materials science mastery.',
        id: 'Gunakan tab mode di atas untuk berpindah ke Jelajah, Latihan, atau Kuis guna menguji penguasaan kristalografi Anda.',
        ja: '上部タブで探索・演習・クイズに切り替え、結晶構造と材料科学の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'db-meter': [
    {
      id: 'db-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'IEC 61672 Sound Level Meter & Noise Lab',
        id: 'Alat Ukur Kebisingan IEC 61672 & Lab Akustik',
        ja: 'IEC 61672 騒音計＆作業環境ノイズラボ',
      },
      description: {
        en: 'Welcome! Measure industrial noise using an IEC 61672 Class 1 sound level meter, analyze octave-band spectra, and troubleshoot OSHA/NIOSH exposure violations.',
        id: 'Selamat datang! Ukur kebisingan industri dengan sound level meter IEC 61672 Kelas 1, analisis spektrum oktaf, dan tangani pelanggaran batas paparan OSHA/NIOSH.',
        ja: 'ようこそ！IEC 61672 Class 1騒音計で産業騒音を測定し、オクターブバンド分析とOSHA/NIOSHばく露限界の対策を学びます。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'db-svg',
      badge: { en: 'Feature 1 · Meter SVG', id: 'Fitur 1 · Diagram Meter', ja: '機能1 · 騒音計SVG' },
      title: {
        en: 'Live Sound Level Meter & Acoustic Field',
        id: 'Meter Tingkat Suara & Medan Akustik Langsung',
        ja: 'ライブ騒音計＆音場ダイアグラム',
      },
      description: {
        en: 'Watch the live SPL needle, peak-hold readout, and sound wave propagation between the machine source and microphone as you adjust distance or shielding.',
        id: 'Amati jarum SPL langsung, pembacaan peak-hold, dan perambatan gelombang suara antara mesin dan mikrofon saat jarak atau perisai diubah.',
        ja: '音源とマイク間の音波伝搬やライブSPL指針・ピークホールド値の変化をリアルタイムで確認できます。',
      },
      targetSelector: '[data-tour="db-svg"]',
    },
    {
      id: 'db-source',
      badge: { en: 'Feature 2 · Sound Source', id: 'Fitur 2 · Sumber Suara', ja: '機能2 · 機械音源' },
      title: {
        en: 'Machine Acoustic Source Selector',
        id: 'Pemilih Sumber Akustik Mesin',
        ja: '機械音源セレクタ',
      },
      description: {
        en: 'Switch between industrial equipment (Centrifugal Compressor, Cooling Fan, Punch Press, Diesel Generator, etc.) to compare steady vs impulsive and low- vs high-frequency noise.',
        id: 'Pilih berbagai mesin industri untuk membandingkan kebisingan stabil vs impulsif serta frekuensi rendah vs tinggi.',
        ja: '遠心圧縮機・冷却ファン・プレス機・ディーゼル発電機などの音源を切り替え、定常騒音や低/高周波特性を比較します。',
      },
      targetSelector: '[data-tour="db-source"]',
    },
    {
      id: 'db-weighting',
      badge: { en: 'Feature 3 · Weighting', id: 'Fitur 3 · Pembobotan', ja: '機能3 · 周波数重み付け' },
      title: {
        en: 'Frequency Weighting (dBA / dBC / dBZ)',
        id: 'Pembobotan Frekuensi (dBA / dBC / dBZ)',
        ja: '周波数重み付け（dBA / dBC / dBZ）',
      },
      description: {
        en: 'Toggle dBA (human hearing sensitivity for OSHA/NIOSH), dBC (flat except extreme lows, ideal for low-frequency rumble), and dBZ (unweighted linear).',
        id: 'Pilih dBA (sensitivitas telinga untuk OSHA/NIOSH), dBC (menangkap dentuman frekuensi rendah), dan dBZ (linear tanpa pembobotan).',
        ja: 'dBA（労働衛生基準用の聴感補正）、dBC（低周波成分評価用）、dBZ（平坦特性）を切り替えて差を比較します。',
      },
      targetSelector: '[data-tour="db-weighting"]',
    },
    {
      id: 'db-distance',
      badge: { en: 'Feature 4 · Distance', id: 'Fitur 4 · Jarak Mikrofon', ja: '機能4 · マイク距離' },
      title: {
        en: 'Microphone Distance (Inverse-Square Law)',
        id: 'Jarak Mikrofon (Hukum Kuadrat Terbalik)',
        ja: 'マイク距離（逆二乗則減衰）',
      },
      description: {
        en: 'Drag Microphone Distance from 1.0 m to 15.0 m. Doubling distance in a free field drops sound pressure level by 6 dB.',
        id: 'Geser Jarak Mikrofon dari 1,0 m hingga 15,0 m. Menggandakan jarak di medan bebas menurunkan tingkat tekanan suara sebesar 6 dB.',
        ja: 'マイク距離を1.0 m〜15.0 mで動かし、自由音場で距離が2倍になると音圧レベルが6 dB減衰することを確認します。',
      },
      targetSelector: '[data-tour="db-distance"]',
    },
    {
      id: 'db-enclosure',
      badge: { en: 'Feature 5 · Mitigation', id: 'Fitur 5 · Penutup Akustik', ja: '機能5 · 防音対策' },
      title: {
        en: 'Acoustic Enclosure Attenuation (-12 dB)',
        id: 'Penutup Akustik / Enclosure (-12 dB)',
        ja: '防音エンクロージャ（-12 dB減音）',
      },
      description: {
        en: 'Engage the Acoustic Enclosure to apply -12 dB engineering control attenuation and see how dramatically permissible exposure time increases.',
        id: 'Aktifkan Penutup Akustik untuk meredam kebisingan sebesar -12 dB dan amati lonjakan waktu paparan aman yang diizinkan.',
        ja: '防音エンクロージャをONにして-12 dBの工学的騒音低減を適用し、許容ばく露時間の大幅な改善を確認します。',
      },
      targetSelector: '[data-tour="db-enclosure"]',
    },
    {
      id: 'db-spectrum',
      badge: { en: 'Feature 6 · Spectrum', id: 'Fitur 6 · Spektrum Oktaf', ja: '機能6 · オクターブ分析' },
      title: {
        en: 'Octave-Band Spectrum (63 Hz – 8 kHz)',
        id: 'Spektrum Pita Oktaf (63 Hz – 8 kHz)',
        ja: 'オクターブバンドスペクトル（63 Hz〜8 kHz）',
      },
      description: {
        en: 'Identify which octave bands carry peak acoustic energy and compare dBA, dBC, and dBZ totals simultaneously.',
        id: 'Identifikasi pita oktaf dengan energi akustik tertinggi serta bandingkan total dBA, dBC, dan dBZ secara bersamaan.',
        ja: 'どの周波数帯域に騒音エネルギーが集中しているかを特定し、dBA・dBC・dBZの総合値を同時に比較します。',
      },
      targetSelector: '[data-tour="db-spectrum"]',
    },
    {
      id: 'db-compliance',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Audit Kepatuhan', ja: '機能7 · ばく露限界診断' },
      title: {
        en: 'OSHA & NIOSH Exposure Limit Troubleshooting',
        id: 'Troubleshooting Batas Paparan OSHA & NIOSH',
        ja: 'OSHA・NIOSH 許容ばく露限界の診断',
      },
      description: {
        en: 'Diagnose Exceeds PEL/REL alerts by checking 8h TWA Dose and Max Exposure Time. Mitigate violations by increasing operator distance or enabling the Acoustic Enclosure.',
        id: 'Diagnosis peringatan Exceeds PEL/REL melalui Dosis TWA 8 Jam dan Waktu Maksimum. Atasi pelanggaran dengan menjauhkan operator atau mengaktifkan Enclosure.',
        ja: '8時間TWA線量と許容ばく露時間からPEL/REL超過を診断し、距離確保や防音エンクロージャで基準内へ低減します。',
      },
      faqs: [
        {
          q: {
            en: 'Why does NIOSH REL allow half the time of OSHA PEL?',
            id: 'Mengapa NIOSH REL jauh lebih ketat dibanding OSHA PEL?',
            ja: 'なぜNIOSH RELはOSHA PELより厳しいのですか？',
          },
          a: {
            en: 'NIOSH uses an 85 dBA criterion with a 3 dB exchange rate (equal-energy rule), whereas OSHA uses 90 dBA with a 5 dB exchange rate.',
            id: 'NIOSH memakai batas 85 dBA dengan exchange rate 3 dB, sedangkan OSHA memakai 90 dBA dengan exchange rate 5 dB.',
            ja: 'NIOSHは85 dBA基準・3 dB交換率（等エネルギー則）を採用しているのに対し、OSHAは90 dBA基準・5 dB交換率であるためです。',
          },
          keywords: ['osha', 'niosh', 'exchange', '85', '90', 'pel', 'rel'],
        },
      ],
      targetSelector: '[data-tour="db-compliance"]',
    },
    {
      id: 'db-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch to Explore, Practice, or Quiz at the top to test your understanding of inverse-square attenuation, dBA/dBC weighting, and hearing conservation.',
        id: 'Pindah ke Jelajah, Latihan, atau Kuis di atas untuk menguji pemahaman hukum kuadrat terbalik, pembobotan dBA/dBC, dan konservasi pendengaran.',
        ja: '上部タブから探索・演習・クイズへ進み、距離減衰・聴感補正・作業環境管理の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'drag-chain-conveyor': [
    {
      id: 'drag-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'En-Masse Drag Chain Conveyor Lab',
        id: 'Lab Konveyor Rantai Seret En-Masse',
        ja: 'エンマス・ドラッグチェーンコンベヤラボ',
      },
      description: {
        en: 'Welcome! Simulate bulk material en-masse conveying with live drive sprocket, flight bars, return catenary sag, shear-pin torque protection, and fault diagnostics.',
        id: 'Selamat datang! Simulasikan pengangkutan material curah en-masse lengkap dengan sproket penggerak, flight bar, kelendutan katenari, proteksi shear-pin, dan diagnosis gangguan.',
        ja: 'ようこそ！駆動スプロケット、フライトバー、リターン側たるみ、シャーピン過負荷保護、故障診断を備えたエンマス搬送を学習します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'drag-presets',
      badge: { en: 'Feature 1 · Presets', id: 'Fitur 1 · Preset Material', ja: '機能1 · 材料プリセット' },
      title: {
        en: 'Bulk Material Presets & Transport Bar',
        id: 'Preset Material Curah & Kontrol Jalan/Jeda',
        ja: '搬送物プリセット＆運転コントロール',
      },
      description: {
        en: 'Load Dry Grain, Wood Chips, Coal / Ash, or Inclined Clinker presets, pause/run the conveyor, clear faults, or Reset to baseline.',
        id: 'Muat preset Biji Kering, Serpih Kayu, Batu Bara, atau Klinker Miring, jeda/jalankan konveyor, pulihkan gangguan, atau Reset.',
        ja: '乾燥穀物・木質チップ・石炭/灰・傾斜クリンカの各プリセットを読み込み、運転/一時停止・異常解除・リセットを行えます。',
      },
      targetSelector: '[data-tour="drag-presets"]',
    },
    {
      id: 'drag-svg',
      badge: { en: 'Feature 2 · Conveyor SVG', id: 'Fitur 2 · Diagram Konveyor', ja: '機能2 · コンベヤSVG' },
      title: {
        en: 'Interactive En-Masse Conveyor & Hotspots',
        id: 'Konveyor En-Masse Interaktif & Hotspot',
        ja: 'インタラクティブ搬送系統図＆ホットスポット',
      },
      description: {
        en: 'Click inspection zones on the SVG (Drive Sprocket, Material Bed, Return Strand, Tail Take-Up, Discharge Chute) to inspect live zone telemetry.',
        id: 'Klik zona inspeksi pada SVG (Sproket Penggerak, Lapisan Material, Jalur Balik, Take-Up Ekor, Corong Keluar) untuk memeriksa telemetri zona.',
        ja: 'SVG上の各点検ゾーン（駆動スプロケット、搬送層、リターン側、テークアップ、排出口）をクリックして局所テレメトリを点検します。',
      },
      targetSelector: '[data-tour="drag-svg"]',
    },
    {
      id: 'drag-telemetry',
      badge: { en: 'Feature 3 · Telemetry', id: 'Fitur 3 · Telemetri', ja: '機能3 · 運転テレメトリ' },
      title: {
        en: '6-Card Industrial Conveyor Telemetry',
        id: '6 Kartu Telemetri Konveyor Industri',
        ja: '6項目コンベヤ運転テレメトリ',
      },
      description: {
        en: 'Monitor Mass & Volumetric Flow (t/h, m³/h), Effective Tension T₁/T₂, Drive Power (kW), Return Catenary Sag (mm), and Shear-Pin Safety Margin.',
        id: 'Pantau Aliran Massa & Volume (t/jam, m³/jam), Tarikan Rantai T₁/T₂, Daya Penggerak (kW), Kelendutan Katenari (mm), dan Margin Shear-Pin.',
        ja: '質量/体積搬送量、有効張力T₁/T₂、駆動所要動力(kW)、リターン側たるみ(mm)、シャーピン安全余裕を常時監視します。',
      },
      targetSelector: '[data-tour="drag-telemetry"]',
    },
    {
      id: 'drag-drive',
      badge: { en: 'Feature 4 · Drive & Chain', id: 'Fitur 4 · Penggerak & Rantai', ja: '機能4 · 駆動・チェーン' },
      title: {
        en: 'Drive, Chain Pitch, Take-Up & Wear Sliders',
        id: 'Slider Kecepatan, Pitch, Take-Up & Keausan',
        ja: '速度・ピッチ・テークアップ・摩耗設定',
      },
      description: {
        en: 'Tune chain speed (m/s), flight/chain pitch, sprocket teeth, tail take-up screw travel (mm), and chain elongation wear (%) to control tension and sag.',
        id: 'Atur kecepatan rantai (m/s), pitch flight/rantai, gigi sproket, baut take-up ekor (mm), dan keausan pemanjangan rantai (%).',
        ja: 'チェーン速度、フライト/チェーンピッチ、歯数、テークアップ調整量、チェーン伸び摩耗率(%)を調整します。',
      },
      targetSelector: '[data-tour="drag-drive"]',
    },
    {
      id: 'drag-geometry',
      badge: { en: 'Feature 5 · Geometry', id: 'Fitur 5 · Geometri Casing', ja: '機能5 · ケーシング形状' },
      title: {
        en: 'Casing Width, Bed Height, Length & Incline',
        id: 'Lebar Casing, Tinggi Lapisan, Panjang & Kemiringan',
        ja: 'ケーシング幅・層高さ・機長・傾斜角',
      },
      description: {
        en: 'Size the trough cross-section (W, H), material bed height, conveyor length (5–40 m), and inclination angle (0–35°). Steep inclines (> 25°) trigger en-masse slip derating.',
        id: 'Atur penampang casing (W, H), tinggi lapisan material, panjang (5–40 m), dan kemiringan (0–35°). Kemiringan > 25° memicu penurunan efisiensi en-masse.',
        ja: 'ケーシング幅・高さ、材料層高さ、機長(5〜40m)、傾斜角(0〜35°)を設定します。25°以上ではエンマス効率が低下します。',
      },
      targetSelector: '[data-tour="drag-geometry"]',
    },
    {
      id: 'drag-diagnostics',
      badge: { en: 'Feature 6 · Diagnostics', id: 'Fitur 6 · Status Diagnostik', ja: '機能6 · 診断バナー' },
      title: {
        en: 'Live Conveyor Health & Root-Cause Banner',
        id: 'Banner Status Kesehatan & Akar Masalah',
        ja: 'リアルタイム健全性＆原因診断バナー',
      },
      description: {
        en: 'Read actionable corrective guidance whenever sag, over-tension, > 3% chain elongation, broken flight carryback, or a shear-pin jam occurs.',
        id: 'Baca panduan perbaikan saat terjadi kelendutan berlebih, tarikan terlalu kencang, aus > 3%, flight patah, atau kemacetan shear-pin.',
        ja: 'たるみ過大、過張力、伸び摩耗3%超、フライト破損、シャーピン破断発生時の具体的な復旧手順を確認します。',
      },
      targetSelector: '[data-tour="drag-diagnostics"]',
    },
    {
      id: 'drag-faults',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Injeksi Gangguan', ja: '機能7 · 故障診断' },
      title: {
        en: 'Fault Injection & Conveyor Troubleshooting',
        id: 'Injeksi Gangguan & Troubleshooting Konveyor',
        ja: '故障注入＆コンベヤトラブルシューティング',
      },
      description: {
        en: 'Inject Chain Slack, Broken Flight, or Material Jam. Inspect T₁/T₂ tension, return sag, and the Diagnostic Status banner, then adjust take-up or clear the jam to restore normal operation.',
        id: 'Suntikkan Rantai Kendur, Flight Patah, atau Macet Material. Periksa tegangan T₁/T₂, sag balik, dan banner status, lalu setel take-up atau klik Pulihkan.',
        ja: 'チェーン弛み・フライト破損・材料詰まりを注入し、張力T₁/T₂・たるみ量・診断バナーから原因を特定して復旧します。',
      },
      faqs: [
        {
          q: {
            en: 'How do I fix excessive return catenary sag?',
            id: 'Bagaimana cara mengatasi kelendutan rantai balik berlebih?',
            ja: 'リターン側のたるみ過大はどう対処しますか？',
          },
          a: {
            en: 'Advance the Tail Take-Up screw in Drive & Chain until return sag returns to 15–30 mm, and check if Chain Wear has exceeded 3.0% elongation.',
            id: 'Kencangkan baut Take-Up Ekor pada grup Penggerak & Rantai hingga sag kembali ke 15–30 mm, serta periksa apakah aus rantai sudah ≥ 3,0%.',
            ja: '駆動・チェーン欄のテークアップねじを締めてたるみを15〜30 mmに戻し、チェーン伸び摩耗が3.0%以上でないか確認します。',
          },
          keywords: ['sag', 'slack', 'take-up', 'chain', 'kendur', 'kelendutan'],
        },
      ],
      targetSelector: '[data-tour="drag-faults"]',
    },
    {
      id: 'drag-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs to switch to Explore, Practice, or Quiz and test your drag-chain capacity, tension, and maintenance calculations.',
        id: 'Gunakan tab mode di atas untuk berpindah ke Jelajah, Latihan, atau Kuis guna menguji perhitungan kapasitas, tarikan, dan perawatan konveyor.',
        ja: '上部タブから探索・演習・クイズへ切り替え、搬送容量・チェーン張力・保守診断の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'fasteners-basics': [
    {
      id: 'fast-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Metric Fasteners, Grades & Torque Lab',
        id: 'Lab Baut Metrik, Kelas Baja & Torsi',
        ja: 'メートルねじ・強度区分・締付トルク基礎ラボ',
      },
      description: {
        en: 'Welcome! Assemble bolted joints with DIN/ISO heads, locking nuts, and washers, decode metric property class stamps (4.6 to 12.9), and verify tightening torque.',
        id: 'Selamat datang! Rakit sambungan baut dengan kepala DIN/ISO, mur pengunci, dan ring, pahami kode kelas baja (4.6–12.9), serta verifikasi torsi pengencangan.',
        ja: 'ようこそ！DIN/ISO規格のボルト・ロックナット・座金を組み合わせ、強度区分刻印（4.6〜12.9）の解読と適正締付トルクを検証します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'fast-svg',
      badge: { en: 'Feature 1 · 2D CAD', id: 'Fitur 1 · Gambar CAD 2D', ja: '機能1 · 2D CAD断面図' },
      title: {
        en: 'Bolted Joint Cross-Section & Head Stamp',
        id: 'Penampang Sambungan Baut & Stempel Kepala',
        ja: 'ボルト締結体断面＆頭部強度区分刻印',
      },
      description: {
        en: 'Inspect the live 2D CAD assembly showing thread engagement, washer seating, nut locking mechanism, and the ISO 898-1 property class stamp.',
        id: 'Amati gambar CAD 2D yang menampilkan ulir, dudukan ring, mekanisme penguncian mur, dan stempel kelas kekuatan ISO 898-1.',
        ja: 'ねじ嵌合、座金の当たり面、ナットの緩み止め機構、ISO 898-1強度区分刻印を2D CAD断面図で確認します。',
      },
      targetSelector: '[data-tour="fasteners-svg"]',
    },
    {
      id: 'fast-head',
      badge: { en: 'Feature 2 · Bolt Head', id: 'Fitur 2 · Kepala Baut', ja: '機能2 · ボルト頭部' },
      title: {
        en: 'Bolt Head Style (DIN 933 / 912 / 7991)',
        id: 'Bentuk Kepala Baut (DIN 933 / 912 / 7991)',
        ja: 'ボルト頭部形状セレクタ',
      },
      description: {
        en: 'Switch between Hex Head, Socket Head Cap Screw (SHCS), Button Head, and Countersunk Flat Head to match wrench clearance and countersink requirements.',
        id: 'Pilih antara Kepala Hex, Socket Head (L), Button Head, dan Countersunk sesuai ruang kunci dan kebutuhan rata permukaan.',
        ja: '六角ボルト、六角穴付きボルト(SHCS)、ボタン頭、皿ボルトを切り替え、工具クリアランスや座ぐり要件を比較します。',
      },
      targetSelector: '[data-tour="fasteners-head"]',
    },
    {
      id: 'fast-nut',
      badge: { en: 'Feature 3 · Locking Nut', id: 'Fitur 3 · Mur Pengunci', ja: '機能3 · ナット形式' },
      title: {
        en: 'Nut Locking Type & Reusability',
        id: 'Tipe Mur Pengunci & Pemakaian Ulang',
        ja: '緩み止めナット形式＆再使用性',
      },
      description: {
        en: 'Compare Standard Hex, Nyloc (nylon insert), All-Metal Prevailing Torque, and Serrated Flange nuts for vibration resistance and temperature limits.',
        id: 'Bandingkan Mur Hex Standar, Nyloc, All-Metal Prevailing Torque, dan Mur Flange bergerigi untuk ketahanan getaran dan batas suhu.',
        ja: '標準六角、ナイロンナット、オールメタル緩み止め、フランジ付きナットを比較し、耐振性と耐熱限界を確認します。',
      },
      targetSelector: '[data-tour="fasteners-nut"]',
    },
    {
      id: 'fast-washer',
      badge: { en: 'Feature 4 · Washer', id: 'Fitur 4 · Ring / Washer', ja: '機能4 · 座金' },
      title: {
        en: 'Washer Type (Flat / Spring / Nord-Lock)',
        id: 'Jenis Ring (Datar / Pegas / Nord-Lock)',
        ja: '座金（平座金・ばね座金・ウェッジロック）',
      },
      description: {
        en: 'Select Flat DIN 125 (load distribution), Helical Spring DIN 127, or Wedge-Locking washers to see how each protects clamp load under vibration.',
        id: 'Pilih Ring Datar DIN 125, Ring Per DIN 127, atau Wedge-Locking untuk melihat bagaimana masing-masing menjaga gaya jepit saat bergetar.',
        ja: '平座金(DIN 125)、ばね座金(DIN 127)、ウェッジロック座金を切り替え、座面保護と緩み止め機構を比較します。',
      },
      targetSelector: '[data-tour="fasteners-washer"]',
    },
    {
      id: 'fast-size',
      badge: { en: 'Feature 5 · Metric Size', id: 'Fitur 5 · Ukuran Metrik', ja: '機能5 · 呼び径・二面幅' },
      title: {
        en: 'Metric Size (M6–M16) & Wrench AF',
        id: 'Ukuran Metrik (M6–M16) & Kunci Pas AF',
        ja: '呼び径（M6〜M16）＆工具二面幅',
      },
      description: {
        en: 'Pick a metric diameter from M6 to M16 and view the corresponding hex spanner across-flats (AF) size and tensile stress area.',
        id: 'Pilih diameter metrik dari M6 hingga M16 beserta ukuran kunci pas (AF) dan luas penampang tarik efektifnya.',
        ja: 'M6〜M16の呼び径を選択し、対応する六角二面幅(AF)と有効断面積を確認します。',
      },
      targetSelector: '[data-tour="fasteners-size"]',
    },
    {
      id: 'fast-grade',
      badge: { en: 'Feature 6 · Grade', id: 'Fitur 6 · Kelas Kekuatan', ja: '機能6 · 強度区分' },
      title: {
        en: 'Property Class / Grade (4.6 to 12.9)',
        id: 'Kelas Kekuatan / Grade (4.6 hingga 12.9)',
        ja: '強度区分（4.6〜12.9 / A2-70）',
      },
      description: {
        en: 'Select Property Class 4.6, 8.8, 10.9, 12.9, or Stainless A2-70 to see how alloy steel heat treatment multiplies yield strength and allowable preload.',
        id: 'Pilih Kelas Kekuatan 4.6, 8.8, 10.9, 12.9, atau Stainless A2-70 untuk melihat peningkatan kekuatan luluh dan beban jepit izin.',
        ja: '4.6・8.8・10.9・12.9・A2-70ステンレスを切り替え、熱処理による耐力と許容締付軸力の違いを確認します。',
      },
      targetSelector: '[data-tour="fasteners-grade"]',
    },
    {
      id: 'fast-telemetry',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Verifikasi Torsi', ja: '機能7 · トルク・軸力検証' },
      title: {
        en: 'Property Class Decoder & Torque Verification',
        id: 'Dekoder Kelas Kekuatan & Verifikasi Torsi',
        ja: '強度区分解読＆締付トルク・軸力検証',
      },
      description: {
        en: 'Check Rm, Re, Dry Torque (K=0.20), and Target Clamp Load (75% Fp). Troubleshoot joint failures: never mix a Class 4.6 nut onto a 10.9 bolt (nut thread stripping) or exceed 75% proof load.',
        id: 'Periksa Rm, Re, Torsi Kering (K=0,20), dan Gaya Jepit (75% Fp). Hindari memasang mur grade rendah pada baut 10.9 (ulir dol) atau melebihi batas luluh.',
        ja: 'Rm・Re・ドライ締付トルク(K=0.20)・目標軸力(75% Fp)を確認し、高強度ボルトへの低強度ナット混用（ねじ山せん断）や過大締付けを防ぎます。',
      },
      faqs: [
        {
          q: {
            en: 'How do I decode "8.8" or "10.9" on a bolt head?',
            id: 'Bagaimana membaca arti angka "8.8" atau "10.9" di kepala baut?',
            ja: 'ボルト頭部の「8.8」や「10.9」の意味は？',
          },
          a: {
            en: 'First number × 100 = Nominal Tensile Rm (MPa). First × Second × 10 = Yield Strength Re (MPa). So 8.8 has Rm = 800 MPa and Re = 640 MPa.',
            id: 'Angka pertama × 100 = Kuat Tarik Rm (MPa). Angka pertama × kedua × 10 = Kuat Luluh Re (MPa). Jadi 8.8 berarti Rm = 800 MPa dan Re = 640 MPa.',
            ja: '1つ目の数字×100＝公称引張強さRm(MPa)、1つ目×2つ目×10＝耐力Re(MPa)です。8.8ならRm=800 MPa、Re=640 MPaとなります。',
          },
          keywords: ['8.8', '10.9', 'decode', 'yield', 'tensile', 'property class'],
        },
      ],
      targetSelector: '[data-tour="fasteners-telemetry"]',
    },
    {
      id: 'fast-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch to Explore, Practice, or Quiz at the top to test your knowledge of ISO 898-1 property classes, nut locking methods, and torque-preload calculations.',
        id: 'Pindah ke Jelajah, Latihan, atau Kuis di atas untuk menguji pemahaman kelas baja ISO 898-1, penguncian mur, dan perhitungan torsi.',
        ja: '上部タブから探索・演習・クイズへ進み、ISO 898-1強度区分や緩み止め選定・締付トルク計算の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'fits-tolerances': [
    {
      id: 'fits-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'ISO 286 Fits, Shrink-Fit & Go/No-Go QC',
        id: 'Suaian ISO 286, Shrink-Fit & Kaliber Go/No-Go',
        ja: 'ISO 286 はめあい・焼きばめ＆ゲージ検査ラボ',
      },
      description: {
        en: 'Welcome! Design ISO 286 hole-basis fits, compute Lamé interference contact pressure and press force, size thermal shrink-fit heating temperatures, and inspect parts with Go/No-Go gauges.',
        id: 'Selamat datang! Rancang suaian basis lubang ISO 286, hitung tekanan kontak Lamé dan gaya pres, tentukan suhu shrink-fit, serta uji komponen dengan kaliber Go/No-Go.',
        ja: 'ようこそ！ISO 286穴基準はめあいの設計、ラメ式接触面圧・圧入力、焼きばめ加熱温度、通り/止まりゲージ検査を統合的に学習します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'fits-diameter',
      badge: { en: 'Feature 1 · Diameter', id: 'Fitur 1 · Diameter', ja: '機能1 · 基準寸法' },
      title: {
        en: 'Nominal Diameter d (mm)',
        id: 'Diameter Nominal d (mm)',
        ja: '基準寸法・呼び径 d (mm)',
      },
      description: {
        en: 'Select a standard shaft/bore nominal diameter (20–100 mm). ISO 286 IT tolerance bandwidths widen automatically with larger nominal diameters.',
        id: 'Pilih diameter nominal standar (20–100 mm). Lebar pita toleransi IT ISO 286 otomatis membesar seiring bertambahnya diameter nominal.',
        ja: '基準寸法（20〜100 mm）を選択します。ISO 286のIT公差幅は呼び径が大きくなるほど自動的に広がります。',
      },
      targetSelector: '[data-tour="fits-diameter"]',
    },
    {
      id: 'fits-hole',
      badge: { en: 'Feature 2 · Hole Class', id: 'Fitur 2 · Kelas Lubang', ja: '機能2 · 穴公差' },
      title: {
        en: 'Hole Basis Class (H6 / H7 / H8)',
        id: 'Kelas Basis Lubang (H6 / H7 / H8)',
        ja: '穴基準公差クラス（H6 / H7 / H8）',
      },
      description: {
        en: 'Choose H6 (precision), H7 (standard reamed), or H8 (general). Under the hole-basis system, the lower deviation EI is always 0 µm.',
        id: 'Pilih H6 (presisi), H7 (standar reamer), atau H8 (umum). Pada sistem basis lubang, penyimpangan bawah EI selalu 0 µm.',
        ja: 'H6（精密）、H7（標準リーマ仕上げ）、H8（一般）を選択します。穴基準では下許容差EIは常に0 µmです。',
      },
      targetSelector: '[data-tour="fits-hole"]',
    },
    {
      id: 'fits-shaft',
      badge: { en: 'Feature 3 · Shaft Class', id: 'Fitur 3 · Kelas Poros', ja: '機能3 · 軸公差' },
      title: {
        en: 'Shaft Tolerance Class (f7 – s6)',
        id: 'Kelas Toleransi Poros (f7 – s6)',
        ja: '軸公差クラス（f7 〜 s6）',
      },
      description: {
        en: 'Pick f7/g6/h6 for Clearance fits, k6/m6 for Transition fits, or p6/s6 for Press/Interference fits and watch the es/ei deviations update live.',
        id: 'Pilih f7/g6/h6 untuk Suaian Longgar, k6/m6 untuk Transisi, atau p6/s6 untuk Suaian Sesak serta amati perubahan penyimpangan es/ei.',
        ja: 'f7/g6/h6（すきまばめ）、k6/m6（中間ばめ）、p6/s6（しまりばめ）を選び、es/ei許容差の変化を確認します。',
      },
      targetSelector: '[data-tour="fits-shaft"]',
    },
    {
      id: 'fits-shrink-temp',
      badge: { en: 'Feature 4 · Thermal Fit', id: 'Fitur 4 · Shrink-Fit', ja: '機能4 · 焼きばめ温度' },
      title: {
        en: 'Induction Heater / Cryo Shaft Temp',
        id: 'Suhu Pemanas Induksi / Kriogenik Poros',
        ja: '誘導加熱ハブ / 冷却軸 温度設定',
      },
      description: {
        en: 'Heat the hub (+110 °C or Auto Drop-In) or cryo-cool the shaft (-78 °C Dry Ice) so thermal expansion eliminates interference for damage-free drop-in assembly.',
        id: 'Panaskan hub (+110 °C atau Otomatis Masuk) atau dinginkan poros (-78 °C) agar ekspansi termal menghilangkan kesesakan saat perakitan.',
        ja: 'ハブ加熱（+110℃または推奨加熱）や軸冷却（-78℃ドライアイス）を行い、圧入傷なしの落とし込み組立に必要な温度を検証します。',
      },
      targetSelector: '[data-tour="fits-shrink-temp"]',
    },
    {
      id: 'fits-svg',
      badge: { en: 'Feature 5 · CAD & Zones', id: 'Fitur 5 · Diagram CAD', ja: '機能5 · 公差域CAD図' },
      title: {
        en: 'ISO 286 Tolerance Zone & Mating CAD',
        id: 'Diagram Zona Toleransi ISO 286 & Penampang',
        ja: 'ISO 286 公差域＆嵌合断面CAD図',
      },
      description: {
        en: 'Visualize the hole (ES/EI) and shaft (es/ei) tolerance bars relative to the zero line alongside the mating cross-section and Go/No-Go gauge checks.',
        id: 'Visualisasikan pita toleransi lubang (ES/EI) dan poros (es/ei) terhadap garis nol beserta penampang pasangan dan kaliber Go/No-Go.',
        ja: '基準線に対する穴（ES/EI）と軸（es/ei）の公差域バー、嵌合断面、通り/止まりゲージ判定を視覚的に確認します。',
      },
      targetSelector: '[data-tour="fits-svg"]',
    },
    {
      id: 'fits-readouts',
      badge: { en: 'Feature 6 · Readouts', id: 'Fitur 6 · Hasil Rekayasa', ja: '機能6 · 工学演算結果' },
      title: {
        en: 'Clearance, Contact Pressure & Press Force',
        id: 'Celah/Kesesakan, Tekanan Kontak & Gaya Pres',
        ja: 'すきま/締め代・接触面圧・圧入力',
      },
      description: {
        en: 'Read min/max clearance or interference (µm), Lamé interface contact pressure (MPa), hydraulic press force (kN/tonnes), and thermal assembly clearance.',
        id: 'Baca celah atau kesesakan min/maks (µm), tekanan kontak Lamé (MPa), gaya pres hidrolik (kN/ton), dan celah rakit termal.',
        ja: '最小/最大すきま・締め代（µm）、ラメ接触面圧（MPa）、油圧プレス圧入力（kN/t）、熱膨張時の組立すきまを確認します。',
      },
      targetSelector: '[data-tour="fits-readouts"]',
    },
    {
      id: 'fits-qc-bench',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Bench QC Go/No-Go', ja: '機能7 · Go/No-Go 検査' },
      title: {
        en: 'Go / No-Go Plug & Snap Gauge QC Bench',
        id: 'Meja QC Kaliber Plug & Snap Go / No-Go',
        ja: '通り/止まりゲージ品質検査ベンチ',
      },
      description: {
        en: 'Slide machined bore and shaft deviations to test the Taylor Principle. Diagnose UNDERSIZE (REWORK) vs OVERSIZE (SCRAP) parts and verify actual mated clearance.',
        id: 'Geser penyimpangan lubang dan poros aktual untuk menguji Prinsip Taylor. Diagnosis status REWORK vs AFKIR (SCRAP) dan cek celah pasangan aktual.',
        ja: '加工穴・軸の実測偏差スライダを動かし、テイラーの原則に基づき合格・再加工（REWORK）・不良（SCRAP）の判定と実測すきまを検証します。',
      },
      faqs: [
        {
          q: {
            en: 'Why is an oversize bore marked SCRAP while undersize is REWORK?',
            id: 'Mengapa lubang kebesaran berstatus SCRAP sedangkan kekecilan REWORK?',
            ja: '穴が大きすぎると不良(SCRAP)で、小さすぎると再加工(REWORK)なのはなぜ？',
          },
          a: {
            en: 'An undersize bore can still be honed or reamed larger to enter tolerance (rework), whereas an oversize bore has too much material removed and cannot be shrunk back.',
            id: 'Lubang yang kekecilan masih bisa di-reamer/hone agar masuk toleransi (rework), sedangkan lubang kebesaran sudah kehilangan material dan harus diafkir.',
            ja: '小さい穴はリーマやホーニングで削り広げて修正（再加工）できますが、削りすぎた穴は元に戻せないため廃却（不良）になります。',
          },
          keywords: ['rework', 'scrap', 'oversize', 'undersize', 'go', 'no-go'],
        },
      ],
      targetSelector: '[data-tour="fits-qc-bench"]',
    },
    {
      id: 'fits-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs to switch to Explore, Practice, or Quiz and test your ISO 286 fit selection and tolerance stack-up skills.',
        id: 'Gunakan tab mode di atas untuk berpindah ke Jelajah, Latihan, atau Kuis guna menguji pemilihan suaian ISO 286 Anda.',
        ja: '上部タブから探索・演習・クイズへ切り替え、ISO 286はめあい選定と公差計算の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  'gear-strength': [
    {
      id: 'gear-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'AGMA / ISO Gear Strength & Sizing Lab',
        id: 'Lab Kekuatan & Desain Roda Gigi AGMA / ISO',
        ja: 'AGMA / ISO 歯車強度・設計ラボ',
      },
      description: {
        en: 'Welcome! Design spur and helical gear pairs, evaluate Lewis/AGMA root bending stress and Hertzian surface contact stress, and diagnose fatigue failures.',
        id: 'Selamat datang! Rancang pasangan roda gigi lurus dan helikal, evaluasi tegangan lentur akar gigi AGMA serta tegangan kontak Hertz, dan diagnosis kegagalan fatik.',
        ja: 'ようこそ！平歯車・はすば歯車対を設計し、歯元曲げ応力とヘルツ歯面接触応力を計算して疲労破壊を診断します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'gear-mode',
      badge: { en: 'Feature 1 · Gear Type', id: 'Fitur 1 · Tipe Gigi', ja: '機能1 · 歯車形式' },
      title: {
        en: 'Spur (0°) vs Helical (ψ) Mode Switcher',
        id: 'Pemilih Roda Gigi Lurus (0°) vs Helikal (ψ)',
        ja: '平歯車（0°）vs はすば歯車（ψ）切替',
      },
      description: {
        en: 'Switch between Spur Gears and Helical Gears to compare contact ratio, smoother load sharing, and the axial thrust trade-off.',
        id: 'Beralih antara Roda Gigi Lurus dan Helikal untuk membandingkan rasio kontak, pembagian beban yang lebih halus, serta gaya aksial.',
        ja: '平歯車とはすば歯車を切り替え、かみ合い率の向上による静粛化とスラスト荷重のトレードオフを比較します。',
      },
      targetSelector: '[data-tour="gear-mode"]',
    },
    {
      id: 'gear-presets',
      badge: { en: 'Feature 2 · Benchmarks', id: 'Fitur 2 · Benchmark', ja: '機能2 · ベンチマーク' },
      title: {
        en: 'Engineering Benchmarks, Reset & CSV Export',
        id: 'Benchmark Rekayasa, Reset & Ekspor CSV',
        ja: '標準ベンチマーク・初期化・CSV出力',
      },
      description: {
        en: 'Load industrial benchmark gearboxes from the dropdown, Reset to defaults, or export all calculated AGMA stresses and safety factors to CSV.',
        id: 'Muat kasus benchmark industri dari daftar, Reset ke awal, atau ekspor seluruh perhitungan tegangan AGMA dan faktor keamanan ke CSV.',
        ja: '産業用標準ベンチマークをドロップダウンから読み込み、初期化やAGMA応力計算結果のCSV出力を行えます。',
      },
      targetSelector: '[data-tour="gear-presets"]',
    },
    {
      id: 'gear-svg',
      badge: { en: 'Feature 3 · Gear CAD', id: 'Fitur 3 · CAD Roda Gigi', ja: '機能3 · 歯車CAD図' },
      title: {
        en: 'Animated Gear Mesh & Stress CAD',
        id: 'Animasi Pertautan Gigi & Visual Tegangan',
        ja: '歯車噛み合いアニメーション＆応力表示',
      },
      description: {
        en: 'Observe the meshing pinion and gear, pitch circles, center distance, and contact/bending stress indicators reacting live to your geometry and load changes.',
        id: 'Amati pertautan pinion dan roda gigi, lingkaran pitch, jarak sumbu, serta indikator tegangan kontak dan lentur secara langsung.',
        ja: 'ピニオンとギヤの噛み合い、ピッチ円、中心距離、曲げ・面圧応力インジケータの変化をリアルタイムに観察します。',
      },
      targetSelector: '[data-tour="gear-svg"]',
    },
    {
      id: 'gear-metrics',
      badge: { en: 'Feature 4 · Stress Cards', id: 'Fitur 4 · Kartu Tegangan', ja: '機能4 · 応力・安全率' },
      title: {
        en: 'Torque, Bending (σF) & Contact (σH) Metrics',
        id: 'Metrik Torsi, Lentur (σF) & Kontak (σH)',
        ja: '入力トルク・曲げ応力(σF)・面圧(σH)',
      },
      description: {
        en: 'Compare calculated root bending stress (MPa) and Hertzian contact stress (MPa) directly against your material allowable limits and safety factors (SF, SH).',
        id: 'Bandingkan tegangan lentur akar gigi (MPa) dan tegangan kontak Hertz (MPa) terhadap batas izin material dan faktor keamanan (SF, SH).',
        ja: '歯元曲げ応力(MPa)およびヘルツ面圧応力(MPa)を材料の許容値と安全率(SF, SH)で比較します。',
      },
      targetSelector: '[data-tour="gear-metrics"]',
    },
    {
      id: 'gear-material',
      badge: { en: 'Feature 5 · Material', id: 'Fitur 5 · Material Baja', ja: '機能5 · 歯車材質' },
      title: {
        en: 'Gear Material & Heat Treatment Selector',
        id: 'Pemilih Material & Perlakuan Panas Gigi',
        ja: '歯車材質・熱処理仕様セレクタ',
      },
      description: {
        en: 'Choose through-hardened, induction-hardened, or carburized alloy steels (or define Custom Material properties) to raise allowable bending and pitting strength.',
        id: 'Pilih baja paduan through-hardened, induction-hardened, atau karburasi (atau Material Kustom) untuk menaikkan kekuatan lentur dan pitting izin.',
        ja: '調質鋼・高周波焼入れ鋼・浸炭焼入れ鋼（またはカスタム材料）を選択し、許容曲げ応力と許容面圧を高めます。',
      },
      targetSelector: '[data-tour="gear-material"]',
    },
    {
      id: 'gear-kinematics',
      badge: { en: 'Feature 6 · Sizing', id: 'Fitur 6 · Ukuran & Beban', ja: '機能6 · 諸元・動力設定' },
      title: {
        en: 'Power, RPM, Module, Teeth & Face Width',
        id: 'Daya, RPM, Modul, Gigi & Lebar Muka',
        ja: '動力・回転数・モジュール・歯数・歯幅',
      },
      description: {
        en: 'Adjust Power (kW), Pinion RPM, Module (m), Teeth (z1/z2), Face Width (b), Pressure/Helix Angle, and Application Factor (Ka) to optimize gear life.',
        id: 'Atur Daya (kW), RPM Pinion, Modul (m), Jumlah Gigi, Lebar Muka (b), Sudut Tekan/Heliks, dan Faktor Aplikasi (Ka) untuk mengoptimalkan umur roda gigi.',
        ja: '伝達動力、回転数、モジュール(m)、歯数、歯幅(b)、圧力角/ねじれ角、使用係数(Ka)を調整して歯車諸元を最適化します。',
      },
      targetSelector: '[data-tour="gear-kinematics"]',
    },
    {
      id: 'gear-safety',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Diagnosis Kegagalan', ja: '機能7 · 破損モード診断' },
      title: {
        en: 'AGMA Safety Status & Failure Mode Diagnosis',
        id: 'Status Keamanan AGMA & Diagnosis Kegagalan',
        ja: 'AGMA 安全基準＆破損モード診断',
      },
      description: {
        en: 'Watch for SAFE, MARGINAL, or CRITICAL OVERSTRESS alerts. The banner identifies whether Bending Fatigue or Surface Pitting governs failure and guides corrective redesign.',
        id: 'Pantau status SAFE, MARGINAL, atau CRITICAL OVERSTRESS. Banner menunjukkan apakah Fatik Lentur atau Pitting Permukaan yang dominan beserta solusi desainnya.',
        ja: 'SAFE / MARGINAL / CRITICAL OVERSTRESS の判定を確認し、歯元曲げ疲労と歯面ピッチングのどちらが支配的かを特定して諸元を改善します。',
      },
      faqs: [
        {
          q: {
            en: 'How do I fix Bending Fatigue vs Surface Pitting failure?',
            id: 'Bagaimana mengatasi kegagalan Fatik Lentur vs Pitting Permukaan?',
            ja: '歯元曲げ疲労と歯面ピッチングはどう対策しますか？',
          },
          a: {
            en: 'Increase Module (m) to thicken the tooth root against Bending Fatigue. Increase Face Width (b), Center Distance, or switch to Carburized Steel to reduce Surface Pitting.',
            id: 'Perbesar Modul (m) untuk menebalkan akar gigi melawan Fatik Lentur. Perbesar Lebar Muka (b) atau gunakan Baja Karburasi untuk mencegah Pitting.',
            ja: '曲げ疲労にはモジュール(m)拡大で歯元を太くするのが効果的です。ピッチングには歯幅(b)拡大や浸炭焼入れ鋼への変更が有効です。',
          },
          keywords: ['bending', 'pitting', 'module', 'face width', 'fatigue', 'overstress'],
        },
      ],
      targetSelector: '[data-tour="gear-safety"]',
    },
    {
      id: 'gear-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs to switch to Explore, Practice, or Quiz and test your AGMA bending and contact stress calculations.',
        id: 'Gunakan tab mode di atas untuk berpindah ke Jelajah, Latihan, atau Kuis guna menguji perhitungan tegangan lentur dan kontak AGMA Anda.',
        ja: '上部タブから探索・演習・クイズへ切り替え、AGMA曲げ・面圧応力計算の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  hardness: [
    {
      id: 'hard-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Rockwell, Brinell & Vickers Hardness Lab',
        id: 'Lab Uji Kekerasan Rockwell, Brinell & Vickers',
        ja: 'ロックウェル・ブリネル・ビッカース硬さ試験ラボ',
      },
      description: {
        en: 'Welcome! Operate an automated indentation hardness tester across HRC, HRB, HBW, and HV scales, run minor/major load cycles, and convert results via ASTM E140.',
        id: 'Selamat datang! Operasikan mesin uji kekerasan indentasi otomatis untuk skala HRC, HRB, HBW, dan HV, jalankan siklus beban awal/utama, dan konversi via ASTM E140.',
        ja: 'ようこそ！HRC・HRB・HBW・HVの各硬さスケールで自動圧痕試験を実施し、初荷重・主荷重シーケンスとASTM E140硬さ換算を学習します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'hard-machine',
      badge: { en: 'Feature 1 · Machine CAD', id: 'Fitur 1 · Mesin Uji', ja: '機能1 · 試験機CAD' },
      title: {
        en: 'C-Frame Hardness Tester & Optical Inset',
        id: 'Mesin Uji C-Frame & Inset Optik',
        ja: 'Cフレーム硬さ試験機＆光学インセット',
      },
      description: {
        en: 'Watch the elevating anvil, diamond/ball indenter, live load gauge (kgf), dwell timer, and optical indentation depth/diameter inset throughout each test phase.',
        id: 'Amati anvil, indentor intan/bola, pengukur beban langsung (kgf), timer dwell, dan inset optik kedalaman/diameter jejak selama pengujian.',
        ja: 'アンビル上昇、圧子押込み、荷重ゲージ（kgf）、保持タイマー、圧痕深さ/径の光学拡大表示をリアルタイムに観察します。',
      },
      targetSelector: '[data-tour="hardness-machine"]',
    },
    {
      id: 'hard-scale',
      badge: { en: 'Feature 2 · Scale', id: 'Fitur 2 · Skala Uji', ja: '機能2 · 硬さスケール' },
      title: {
        en: 'Hardness Scale & Indenter Method',
        id: 'Metode & Skala Kekerasan (HRC/HRB/HBW/HV)',
        ja: '硬さスケール＆圧子方式セレクタ',
      },
      description: {
        en: 'Select HRC (150 kgf diamond cone), HRB (100 kgf steel ball), HBW (3000 kgf tungsten carbide ball), or HV (Vickers diamond pyramid).',
        id: 'Pilih HRC (kerucut intan 150 kgf), HRB (bola baja 100 kgf), HBW (bola karbida 3000 kgf), atau HV (piramida intan Vickers).',
        ja: 'HRC（ダイヤモンド円錐150 kgf）、HRB（鋼球100 kgf）、HBW（超硬球3000 kgf）、HV（ビッカース正四角錐）を切り替えます。',
      },
      targetSelector: '[data-tour="hardness-scale"]',
    },
    {
      id: 'hard-specimen',
      badge: { en: 'Feature 3 · Specimen', id: 'Fitur 3 · Benda Uji', ja: '機能3 · 試験片・適合性' },
      title: {
        en: 'Specimen Material & ASTM Range Check',
        id: 'Material Benda Uji & Cek Rentang ASTM',
        ja: '試験片材質＆ASTM適正範囲チェック',
      },
      description: {
        en: 'Choose a ferrous or non-ferrous alloy specimen. The ASTM recommendation banner warns you immediately if the material falls outside the active scale’s valid range.',
        id: 'Pilih benda uji logam fero atau non-fero. Banner rekomendasi ASTM langsung memperingatkan bila material berada di luar rentang valid skala.',
        ja: '鉄鋼・非鉄金属の試験片を選択します。選択スケールが材質の適正範囲外の場合は即座にASTM警告バナーが表示されます。',
      },
      targetSelector: '[data-tour="hardness-specimen"]',
    },
    {
      id: 'hard-dwell',
      badge: { en: 'Feature 4 · Dwell & Mode', id: 'Fitur 4 · Dwell & Mode', ja: '機能4 · 保持・モード' },
      title: {
        en: 'Dwell Time (5–30 s) & Cycle Mode',
        id: 'Waktu Dwell (5–30 dtk) & Mode Siklus',
        ja: '荷重保持時間（5〜30秒）＆動作モード',
      },
      description: {
        en: 'Set Dwell Time (typically 10–15 s per ASTM E18/E10) and toggle between Auto Full Cycle and Manual Stepping (to pause at minor preload before major load).',
        id: 'Atur Waktu Dwell (umumnya 10–15 dtk sesuai ASTM) serta pilih Otomatis Penuh atau Langkah Manual untuk mengamati tahap beban awal.',
        ja: 'ASTM基準の荷重保持時間（5〜30秒）と、全自動シーケンスまたは初荷重で一時停止する手動ステップを切り替えます。',
      },
      targetSelector: '[data-tour="hardness-dwell"]',
    },
    {
      id: 'hard-cycle',
      badge: { en: 'Feature 5 · Run Test', id: 'Fitur 5 · Mulai Siklus', ja: '機能5 · 試験実行' },
      title: {
        en: 'Start Test Cycle & Reset Controls',
        id: 'Tombol Mulai Siklus Uji & Reset',
        ja: '試験サイクル開始＆リセット',
      },
      description: {
        en: 'Click Start Test Cycle to run anvil elevation, minor preload, major load, dwell countdown, unloading, and optical/depth measurement.',
        id: 'Klik Mulai Siklus Pengujian untuk menjalankan elevasi anvil, beban awal, beban utama, hitung mundur dwell, pelepasan beban, dan pembacaan hasil.',
        ja: '「試験サイクル開始」をクリックし、昇降・初荷重・主荷重・保持カウントダウン・除荷・計測までの一連の試験を実行します。',
      },
      targetSelector: '[data-tour="hardness-cycle"]',
    },
    {
      id: 'hard-e140',
      badge: { en: 'Feature 6 · ASTM E140', id: 'Fitur 6 · Konversi E140', ja: '機能6 · ASTM E140' },
      title: {
        en: 'ASTM E140 Equivalence & Estimated UTS',
        id: 'Konversi Standar ASTM E140 & Perkiraan UTS',
        ja: 'ASTM E140 硬さ換算＆推定引張強さ',
      },
      description: {
        en: 'Compare equivalent HRC, HRB, HBW, and HV values alongside Estimated Ultimate Tensile Strength (UTS ≈ 3.45 × HBW) in MPa and ksi.',
        id: 'Bandingkan nilai ekuivalen HRC, HRB, HBW, dan HV beserta Perkiraan Kuat Tarik (UTS ≈ 3,45 × HBW) dalam MPa dan ksi.',
        ja: 'HRC・HRB・HBW・HVの相互換算値と推定引張強さ（UTS ≈ 3.45 × HBW）をMPaおよびksi単位で確認します。',
      },
      targetSelector: '[data-tour="hardness-e140"]',
    },
    {
      id: 'hard-log',
      badge: { en: 'Feature 7 · Troubleshoot', id: 'Fitur 7 · Log & Validasi', ja: '機能7 · 検査ログ・判定' },
      title: {
        en: 'Hardness Inspection Log & Out-of-Range Audit',
        id: 'Log Inspeksi Kekerasan & Audit Out-of-Range',
        ja: '硬さ検査ログ＆範囲外エラー診断',
      },
      description: {
        en: 'Each run logs indentation depth h, diameter d, ASTM equivalents, and VALID / OUT-RANGE status. Use OUT-RANGE flags to diagnose wrong scale/indenter pairing (e.g., testing soft brass on HRC) and export CSV.',
        id: 'Setiap uji mencatat kedalaman h, diameter d, ekuivalen ASTM, dan status VALID / OUT-RANGE untuk mendiagnosis salah pilih skala (mis. kuningan lunak diuji HRC).',
        ja: '各試験の圧痕深さh・径d・換算値・VALID/OUT-RANGE判定が記録されます。軟質材料でのHRC使用など不適切なスケール選定を診断できます。',
      },
      faqs: [
        {
          q: {
            en: 'Why does testing soft aluminum on HRC give OUT-RANGE?',
            id: 'Mengapa menguji aluminium lunak dengan HRC menghasilkan OUT-RANGE?',
            ja: '軟質アルミをHRCで測定すると範囲外になるのはなぜですか？',
          },
          a: {
            en: 'HRC uses a 150 kgf diamond cone meant for hardened steels (20–70 HRC). Soft metals should be tested with HRB (ball indenter) or HBW/HV.',
            id: 'HRC memakai kerucut intan 150 kgf khusus baja keras (20–70 HRC). Logam lunak harus diuji dengan HRB (bola baja) atau HBW/HV.',
            ja: 'HRCは焼入れ鋼（20〜70 HRC）用の150 kgfダイヤモンド圧子であるためです。軟質金属にはHRB（鋼球）やHBW/HVを使用します。',
          },
          keywords: ['out-range', 'hrc', 'hrb', 'aluminum', 'soft', 'indenter'],
        },
      ],
      targetSelector: '[data-tour="hardness-log"]',
    },
    {
      id: 'hard-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Switch to Explore, Practice, or Quiz at the top to test your knowledge of indenters, preload/major load steps, and ASTM E140 conversions.',
        id: 'Pindah ke Jelajah, Latihan, atau Kuis di atas untuk menguji pemahaman indentor, prosedur beban awal/utama, dan konversi ASTM E140.',
        ja: '上部タブから探索・演習・クイズへ切り替え、圧子選定・負荷手順・ASTM E140換算の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],

  hydraulic: [
    {
      id: 'hyd-overview',
      badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
      title: {
        en: 'Hydraulic Power Unit, Gauges & Oscilloscope',
        id: 'Unit Daya Hidrolik, Pengukur & Osiloskop',
        ja: '油圧パワーユニット・圧力計・オシロスコープ',
      },
      description: {
        en: 'Welcome! Operate a 4/3 directional control valve hydraulic cylinder circuit with an interactive ISO schematic, three live pressure gauges, a 15-second oscilloscope, and fault diagnostics.',
        id: 'Selamat datang! Operasikan sirkuit silinder hidrolik 4/3 DCV dengan skematik ISO interaktif, tiga pengukur tekanan, osiloskop 15 detik, dan diagnosis gangguan.',
        ja: 'ようこそ！4/3方向切換弁油圧シリンダ回路を、ISO回路図・3連圧力計・15秒オシロスコープ・故障診断機能とともに操作します。',
      },
      tip: {
        en: 'Use Next / Previous or ← / → arrow keys anytime to glide smoothly between features.',
        id: 'Gunakan Berikutnya / Sebelumnya atau panah ← / → kapan saja untuk berpindah fitur.',
        ja: '「次へ / 前へ」または ← / → キーで各機能ガイドを切り替えられます。',
      },
    },
    {
      id: 'hyd-status',
      badge: { en: 'Feature 1 · HPU Power', id: 'Fitur 1 · Daya HPU', ja: '機能1 · HPU電源' },
      title: {
        en: 'HPU Power Switch, Status & Reset Bar',
        id: 'Sakelar Daya HPU, Status & Reset Lab',
        ja: 'HPU電源・運転ステータス・リセット',
      },
      description: {
        en: 'Start or stop the Hydraulic Power Unit pump, monitor live circuit status (Normal, Relief Open, Stalled, Cavitating), or click Reset Lab anytime.',
        id: 'Nyalakan atau matikan pompa HPU, pantau status sirkuit (Normal, Relief Terbuka, Macet, Kavitasi), atau klik Reset Lab kapan saja.',
        ja: 'HPUポンプの起動/停止、回路ステータス（正常・リリーフ作動・ストール・キャビテーション）の確認、リセットを行えます。',
      },
      targetSelector: '[data-tour="hydraulic-status"]',
    },
    {
      id: 'hyd-schematic',
      badge: { en: 'Feature 2 · Schematic', id: 'Fitur 2 · Skematik ISO', ja: '機能2 · ISO油圧回路図' },
      title: {
        en: 'Interactive ISO Hydraulic Schematic & HPU',
        id: 'Skematik Hidrolik ISO & Cutaway HPU Interaktif',
        ja: 'インタラクティブISO油圧回路＆HPU断面図',
      },
      description: {
        en: 'Click the 4/3 DCV directly on the schematic to extend, hold neutral, or retract the cylinder while watching oil flow paths, relief bypass, and actuator motion.',
        id: 'Klik katup 4/3 DCV langsung pada skematik untuk memajukan, menetralkan, atau menarik silinder sambil mengamati aliran oli dan gerak aktuator.',
        ja: '回路図上の4/3 DCVを直接クリックしてシリンダの伸長・中立・縮小を操作し、作動油の流れとリリーフバイパスを観察します。',
      },
      targetSelector: '[data-tour="hydraulic-schematic"]',
    },
    {
      id: 'hyd-gauges',
      badge: { en: 'Feature 3 · P1, P2, P3', id: 'Fitur 3 · Pengukur P1–P3', ja: '機能3 · 圧力計 P1–P3' },
      title: {
        en: 'Synchronized P1, P2 & P3 Pressure Gauges',
        id: 'Tiga Pengukur Tekanan P1, P2 & P3 Tersinkronisasi',
        ja: 'P1・P2・P3 同期圧力ゲージ',
      },
      description: {
        en: 'Compare P1 (Pump Supply), P2 (Cap End), and P3 (Rod End / Meter-Out) in real time to spot relief cracking, meter-out backpressure, or internal bypass.',
        id: 'Bandingkan P1 (Suplai Pompa), P2 (Sisi Cap), dan P3 (Sisi Rod / Meter-Out) secara langsung untuk mendeteksi relief terbuka, tekanan balik, atau bypass internal.',
        ja: 'P1（ポンプ吐出）・P2（キャップ側）・P3（ロッド側）の圧力を比較し、リリーフ作動・メータアウト背圧・内部漏れを読み取ります。',
      },
      targetSelector: '[data-tour="hydraulic-gauges"]',
    },
    {
      id: 'hyd-oscilloscope',
      badge: { en: 'Feature 4 · Scope', id: 'Fitur 4 · Osiloskop', ja: '機能4 · オシロスコープ' },
      title: {
        en: '15-Second Pressure & Velocity Oscilloscope',
        id: 'Osiloskop Tekanan & Kecepatan 15 Detik',
        ja: '15秒 圧力・速度オシロスコープ',
      },
      description: {
        en: 'Observe transient water-hammer pressure spikes when shifting the DCV—and watch those surges smooth out when the N₂ Accumulator is enabled.',
        id: 'Amati lonjakan tekanan transien saat menggeser DCV—dan lihat lonjakan tersebut mereda saat Akumulator N₂ diaktifkan.',
        ja: 'DCV切換時の過渡的なサージ圧力スパイクと、N₂アキュムレータ有効化による平滑化効果を波形で確認します。',
      },
      targetSelector: '[data-tour="hydraulic-oscilloscope"]',
    },
    {
      id: 'hyd-dcv',
      badge: { en: 'Feature 5 · 4/3 DCV', id: 'Fitur 5 · Katup 4/3 DCV', ja: '機能5 · 4/3方向切換弁' },
      title: {
        en: '4/3 Directional Control Valve Selector',
        id: 'Pemilih Katup Arah 4/3 (DCV)',
        ja: '4/3 方向切換弁 (DCV) セレクタ',
      },
      description: {
        en: 'Shift the spool between Extend, Neutral, and Retract. Enable the Load-Holding Pilot Check Valve below to prevent spool drift when holding a heavy load in Neutral.',
        id: 'Geser spul antara Maju, Netral, dan Mundur. Aktifkan Pilot Check Penahan Beban di bawah untuk mencegah silinder melorot saat Netral.',
        ja: 'スプールを伸長・中立・縮小へ切り替えます。下のパイロットチェック弁を有効にすると中立時の負荷保持ドリフトを防げます。',
      },
      targetSelector: '[data-tour="hydraulic-dcv"]',
    },
    {
      id: 'hyd-relief',
      badge: { en: 'Feature 6 · Relief & Flow', id: 'Fitur 6 · Relief & Debit', ja: '機能6 · リリーフ・流量' },
      title: {
        en: 'Relief Valve, Load, Meter-Out & Pump Flow',
        id: 'Tekanan Relief, Beban, Meter-Out & Debit Pompa',
        ja: 'リリーフ圧・負荷・メータアウト・ポンプ流量',
      },
      description: {
        en: 'Tune Relief Cracking Pressure (20–210 bar), Cylinder Load (0–80 kN), Meter-Out Needle Valve (10–100%), and Pump Flow (10–60 L/min) to see pressure intensification and actuator speed.',
        id: 'Atur Tekanan Cracking Relief (20–210 bar), Beban Silinder (0–80 kN), Katup Meter-Out (10–100%), dan Debit Pompa (10–60 L/min).',
        ja: 'リリーフ設定圧・シリンダ負荷・メータアウト開度・ポンプ流量を調整し、背圧増幅やシリンダ速度への影響を確認します。',
      },
      targetSelector: '[data-tour="hydraulic-relief"]',
    },
    {
      id: 'hyd-thermal',
      badge: { en: 'Feature 7 · Thermal', id: 'Fitur 7 · Telemetri Termal', ja: '機能7 · 熱・効率' },
      title: {
        en: 'Thermal & Efficiency Telemetry (ISO VG 46)',
        id: 'Telemetri Termal & Efisiensi (ISO VG 46)',
        ja: '熱損失・油温・粘度テレメトリ',
      },
      description: {
        en: 'Monitor Relief Heat Loss (kW), Oil Temperature (°C, warns > 65 °C), Oil Viscosity (cSt), and System Efficiency (%) as relief throttling heats the reservoir.',
        id: 'Pantau Rugi Panas Relief (kW), Suhu Oli (°C, peringatan > 65 °C), Viskositas Oli (cSt), dan Efisiensi Sistem (%) saat throttling relief memanaskan oli.',
        ja: 'リリーフ熱損失（kW）、作動油温度（65℃超で過熱警告）、動粘度（cSt）、システム効率（%）を監視します。',
      },
      targetSelector: '[data-tour="hydraulic-thermal"]',
    },
    {
      id: 'hyd-faults',
      badge: { en: 'Feature 8 · Troubleshoot', id: 'Fitur 8 · Injeksi Gangguan', ja: '機能8 · 故障・ブラインド診断' },
      title: {
        en: 'Maintenance Fault Injection & Blind Test',
        id: 'Injeksi Gangguan & Uji Buta Perawatan',
        ja: '保守故障注入＆ブラインド診断テスト',
      },
      description: {
        en: 'Inject Relief Stuck Open, Cylinder Seal Bypass, or Suction Cavitation—or launch Blind Test—then shift the DCV, vary load, and inspect P1/P2/P3 and speed to submit your diagnosis.',
        id: 'Suntikkan Relief Macet Terbuka, Bypass Seal Silinder, atau Kavitasi Hisap—atau mulai Uji Buta—lalu geser DCV, ubah beban, dan amati P1/P2/P3 untuk menentukan diagnosis.',
        ja: 'リリーフ開固着・シールバイパス・キャビテーションを注入（またはブラインド診断を開始）し、DCV操作とP1/P2/P3・速度の変化から原因を特定します。',
      },
      faqs: [
        {
          q: {
            en: 'How do I distinguish Relief Stuck Open from Cylinder Seal Bypass?',
            id: 'Bagaimana membedakan Relief Macet Terbuka dan Bypass Seal Silinder?',
            ja: 'リリーフ開固着とシリンダシールバイパスの見分け方は？',
          },
          a: {
            en: 'With Relief Stuck Open, P1 caps around ~11 bar in ALL DCV positions (including Neutral/deadhead). With Cylinder Seal Bypass, P1 builds pressure normally against Neutral, but P2 ≈ P3 and the cylinder creeps or stalls under load.',
            id: 'Pada Relief Macet Terbuka, P1 tertahan ~11 bar di SEMUA posisi DCV. Pada Bypass Seal Silinder, P1 naik normal saat Netral, namun P2 ≈ P3 dan silinder melorot/lemah saat dibebani.',
            ja: 'リリーフ開固着ではDCVの全位置でP1が約11 bar頭打ちになります。シールバイパスでは中立時にP1が正常上昇する一方、負荷時にP2≒P3となりシリンダが停止・ドリフトします。',
          },
          keywords: ['relief', 'bypass', 'seal', 'cavitation', 'p1', 'p2', 'p3'],
        },
      ],
      targetSelector: '[data-tour="hydraulic-faults"]',
    },
    {
      id: 'hyd-modes',
      badge: { en: 'Lab Modes', id: 'Mode Lab', ja: '学習モード' },
      title: {
        en: 'Simulate, Explore, Practice & Quiz',
        id: 'Mode Simulasi, Jelajah, Latihan & Kuis',
        ja: 'シミュレーション・探索・演習・クイズ',
      },
      description: {
        en: 'Use the top workflow tabs to switch to Explore, Practice, or Quiz and apply Pascal’s law, meter-out speed control, and relief heat-loss troubleshooting.',
        id: 'Gunakan tab mode di atas untuk berpindah ke Jelajah, Latihan, atau Kuis dan terapkan hukum Pascal, kontrol meter-out, serta diagnosis rugi panas relief.',
        ja: '上部タブから探索・演習・クイズへ切り替え、パスカルの原理・メータアウト制御・油圧故障診断の理解度を確認しましょう。',
      },
      targetSelector: '[data-tour="mode-tabs"]',
    },
  ],
};
