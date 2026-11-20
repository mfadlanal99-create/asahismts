import type { TutorialStep } from '../../types/tutorial';

export const TUTORIALS_PART_2: Record<string, TutorialStep[]> = {
  'clamp-meter': [
    {
      id: 'clamp-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: '3-Phase Clamp Meter & Feeder Analyzer',
        id: 'Clamp Meter 3-Fasa & Analisis Feeder',
        ja: '三相クランプメータ＆フィーダ解析',
      },
      description: {
        en: 'Measure AC phase currents, motor inrush surges, and NEMA MG-1 current unbalance on a 3-phase motor feeder. The live SVG shows the clamp jaw around the selected conductor, while the Power & Unbalance Analysis banner summarizes feeder health.',
        id: 'Ukur arus AC tiap fasa, lonjakan inrush motor, dan ketidakseimbangan arus NEMA MG-1 pada feeder motor 3-fasa. SVG menampilkan rahang clamp pada konduktor terpilih, sedangkan panel Analisis Daya & Ketidakseimbangan merangkum kondisi feeder.',
        ja: '三相モータフィーダの交流電流、始動突入電流、およびNEMA MG-1電流不平衡率を測定します。SVGで選択導体へのクランプ状態を確認し、電力・不平衡診断バナーで健全性を把握できます。',
      },
      tip: {
        en: 'You can click conductors directly on the feeder SVG or use the Clamp Jaw Target buttons on the right.',
        id: 'Anda dapat mengklik konduktor langsung pada SVG atau memakai tombol Target Penjepit Clamp di kanan.',
        ja: 'SVG上の導体を直接クリックするか、右側のクランプ対象導体ボタンで切り替えられます。',
      },
    },
    {
      id: 'clamp-target-inrush',
      badge: { en: 'Step 2 • Jaw & Inrush', id: 'Langkah 2 • Rahang & Inrush', ja: 'ステップ2 • クランプ・突入電流' },
      title: {
        en: 'Clamp Jaw Target & INRUSH Capture',
        id: 'Target Penjepit Clamp & Mode INRUSH',
        ja: 'クランプ対象導体と突入電流モード',
      },
      description: {
        en: 'Switch between L1 (U), L2 (V), L3 (W), and PE / N to compare individual phase currents and ground/neutral leakage. Toggle INRUSH to capture the locked-rotor starting current spike when the motor energizes.',
        id: 'Pilih antara L1 (U), L2 (V), L3 (W), dan PE / N untuk membandingkan arus tiap fasa dan arus bocor. Aktifkan tombol INRUSH untuk menangkap lonjakan arus start saat motor dinyalakan.',
        ja: 'L1 (U)・L2 (V)・L3 (W)・PE / N を切り替えて各相電流や漏れ電流を比較します。突入電流（INRUSH）をオンにすると始動時のピーク電流を確認できます。',
      },
      tip: {
        en: 'A healthy 3-phase motor shows near-zero current on PE / N and balanced currents across L1, L2, and L3.',
        id: 'Motor 3-fasa yang sehat menunjukkan arus mendekati nol pada PE / N dan arus seimbang di L1, L2, L3.',
        ja: '健全な三相モータでは PE / N の電流はほぼゼロとなり、L1・L2・L3 の電流が平衡します。',
      },
    },
    {
      id: 'clamp-load',
      badge: { en: 'Step 3 • Shaft Load', id: 'Langkah 3 • Beban Poros', ja: 'ステップ3 • 軸負荷' },
      title: {
        en: 'Mechanical Shaft Load Slider',
        id: 'Slider Beban Poros Mekanis',
        ja: '機械軸負荷スライダ',
      },
      description: {
        en: 'Drag the Mechanical Shaft Load slider from 25% to 110% (5% steps) to vary motor torque demand. Observe how phase current, power factor (cos φ), and active power respond from light load to overload.',
        id: 'Geser slider Beban Poros Mekanis dari 25% hingga 110% (kelipatan 5%) untuk mengubah beban torsi motor. Amati perubahan arus fasa, faktor daya (cos φ), dan daya aktif dari beban ringan hingga overload.',
        ja: '機械軸負荷スライダを25%〜110%（5%刻み）で動かし、軽負荷から過負荷までの相電流・力率・有効電力の変化を観察します。',
      },
    },
    {
      id: 'clamp-telemetry',
      badge: { en: 'Step 4 • Power & NEMA', id: 'Langkah 4 • Daya & NEMA', ja: 'ステップ4 • 電力・NEMA' },
      title: {
        en: '3-Phase Power & NEMA MG-1 Telemetry',
        id: 'Telemetri Daya 3-Fasa & NEMA MG-1',
        ja: '三相電力・NEMA MG-1 テレメトリ',
      },
      description: {
        en: 'Monitor four live cards: Active Power (P) in kW, Apparent Power (S) in kVA, Power Factor (cos φ), and Current Unbalance (%). Current Unbalance changes color to amber (derate) or red (critical) when NEMA MG-1 limits are exceeded.',
        id: 'Pantau empat kartu telemetri langsung: Daya Aktif (P) dalam kW, Daya Semu (S) dalam kVA, Faktor Daya (cos φ), dan Ketidakseimbangan Arus (%). Warna indikator berubah kuning (derate) atau merah (kritis) saat melampaui batas NEMA MG-1.',
        ja: '有効電力 P (kW)、皮相電力 S (kVA)、力率 (cos φ)、電流不平衡率 (%) の4項目を確認します。NEMA MG-1基準を超えると不平衡率が警告色または危険色に変化します。',
      },
    },
    {
      id: 'clamp-faults',
      badge: { en: 'Step 5 • Faults', id: 'Langkah 5 • Gangguan', ja: 'ステップ5 • 故障シナリオ' },
      title: {
        en: 'Feeder Fault Scenario Selector',
        id: 'Pemilih Skenario Gangguan Feeder',
        ja: 'フィーダ故障シナリオ選択',
      },
      description: {
        en: 'Select any Feeder Fault Scenario to inject realistic electrical faults (such as unbalance, single-phasing, or ground leakage). Clamp L1, L2, L3, and PE / N in sequence to isolate which conductor carries the anomaly.',
        id: 'Pilih Skenario Gangguan Feeder untuk menyuntikkan gangguan listrik nyata (seperti ketidakseimbangan, putus fasa, atau bocor ke tanah). Pindahkan clamp ke L1, L2, L3, dan PE / N untuk melokalisasi gangguan.',
        ja: 'フィーダ故障シナリオを選択して不平衡や欠相、地絡漏れなどの異常を再現します。L1・L2・L3・PE / N を順にクランプして原因箇所を特定しましょう。',
      },
    },
    {
      id: 'clamp-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 (or the top mode tabs) to switch between Explore, Practice, Quiz, and Formula reference. Test your ability to diagnose phase unbalance, power factor, and inrush current in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 (atau tab mode di atas) untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi Rumus. Uji kemampuan diagnosis ketidakseimbangan fasa, faktor daya, dan arus inrush di Latihan dan Kuis.',
        ja: 'Alt+1〜4（または上部タブ）で探索・演習・クイズ・公式リファレンスを切り替えられます。演習とクイズで不平衡診断や力率・突入電流の理解度を確認しましょう。',
      },
    },
  ],

  compressor: [
    {
      id: 'comp-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'Rotary Screw Air Compressor Skid',
        id: 'Skid Kompresor Udara Rotary Screw',
        ja: 'スクリュー空気圧縮機スキッド',
      },
      description: {
        en: 'This simulator models a complete industrial rotary screw compressor skid with live 4:6 screw rotor animation, cooling fan, receiver tank pressure cycling (Load/Unload), condensate drain, and real-time pressure trend analytics.',
        id: 'Simulator ini memodelkan skid kompresor rotary screw industri lengkap dengan animasi rotor 4:6, kipas pendingin, siklus tekanan tangki receiver (Load/Unload), pembuangan kondensat, serta grafik tren tekanan.',
        ja: '4:6スクリューロータ、冷却ファン、レシーバタンクのロード/アンロード圧力サイクル、オートドレン、圧力トレンド解析を備えた産業用空気圧縮機スキッドをシミュレートします。',
      },
    },
    {
      id: 'comp-operating',
      badge: { en: 'Step 2 • Pressure & Demand', id: 'Langkah 2 • Tekanan & Kebutuhan', ja: 'ステップ2 • 圧力・需要制御' },
      title: {
        en: 'Load/Unload Band & Plant Air Demand',
        id: 'Pita Tekanan Load/Unload & Kebutuhan Udara',
        ja: 'ロード/アンロード圧力帯と工場エア需要',
      },
      description: {
        en: 'Adjust Load Pressure Setpoint (5.5–8.5 bar), Unload Pressure Setpoint (6.5–9.5 bar), and Plant Air Demand (1.0–12.0 m³/min) in Operating & Maintenance Controls. Use Reset in the top bar to return to the baseline state.',
        id: 'Atur Setpoint Tekanan Load (5,5–8,5 bar), Unload (6,5–9,5 bar), dan Kebutuhan Udara Pabrik (1,0–12,0 m³/min) pada panel kontrol. Gunakan tombol Reset di atas untuk kembali ke kondisi awal.',
        ja: 'ロード圧力設定（5.5〜8.5 bar）、アンロード圧力設定（6.5〜9.5 bar）、工場エア需要（1.0〜12.0 m³/min）を調整します。上部のリセットで初期状態に戻せます。',
      },
      tip: {
        en: 'Tighter Load/Unload bands increase switching frequency, while higher Unload pressure raises specific power consumption.',
        id: 'Pita Load/Unload yang terlalu sempit mempercepat siklus switching, sedangkan tekanan Unload tinggi menaikkan konsumsi daya spesifik.',
        ja: '圧力帯を狭めすぎると頻繁なロード/アンロード切替が発生し、アンロード圧力を上げると比動力が増加します。',
      },
    },
    {
      id: 'comp-faults',
      badge: { en: 'Step 3 • Maintenance', id: 'Langkah 3 • Perawatan', ja: 'ステップ3 • 保守パラメータ' },
      title: {
        en: 'Fault & Maintenance Parameters',
        id: 'Parameter Gangguan & Perawatan',
        ja: '故障・保守パラメータ',
      },
      description: {
        en: 'Simulate wear and faults using Intake Filter Clogging ΔP (0–120 mbar), Cooler Fouling (0–100%), Plant Leak Rate (0–45%), and the Condensate Auto-Drain toggle (ON / FAILED). Watch how each fault drives temperature trips or moisture carryover.',
        id: 'Simulasikan keausan dengan slider ΔP Filter Hisap (0–120 mbar), Pengotoran Cooler (0–100%), Laju Kebocoran Pabrik (0–45%), dan tombol Auto-Drain Kondensat (AKTIF / GAGAL). Amati dampaknya terhadap trip suhu tinggi atau water carryover.',
        ja: '吸込フィルタ目詰まり ΔP（0〜120 mbar）、クーラ汚れ率（0〜100%）、工場エア漏れ率（0〜45%）、オートドレン排出スイッチ（ON / 故障）を操作し、高温トリップや水キャリーオーバーの発生を確認します。',
      },
    },
    {
      id: 'comp-kpis',
      badge: { en: 'Step 4 • Scenarios & KPIs', id: 'Langkah 4 • Skenario & KPI', ja: 'ステップ4 • シナリオ・KPI' },
      title: {
        en: 'Scenario Presets & 6-Card KPI Strip',
        id: 'Preset Skenario & 6 Kartu KPI Langsung',
        ja: 'シナリオプリセットと6項目KPI',
      },
      description: {
        en: 'Click any top Scenario preset (Optimal Baseline, Clogged Intake Filter, Fouled Intercooler, Failed Condensate Drain, Excessive Plant Leaks). Track Discharge Pressure, Discharge Temp (> 105 °C trip), Pressure Dew Point, Specific Power, Load Duty Cycle, and Annual Energy Cost.',
        id: 'Klik preset Skenario di atas (Baseline Optimal, Filter Hisap Tersumbat, Intercooler Kotor, Auto-Drain Gagal, Kebocoran Berlebih). Pantau 6 KPI: Tekanan & Suhu Keluaran (trip > 105 °C), Titik Embun, Daya Spesifik, Siklus Beban, dan Biaya Energi.',
        ja: '上部のシナリオ（正常ベースライン、吸込フィルタ目詰まり、インタークーラ汚れ、オートドレン故障、過大エア漏れ）を選択できます。吐出圧力・吐出温度（105 °C超でトリップ）・圧力露点・比動力・負荷率・年間電力コストを監視します。',
      },
    },
    {
      id: 'comp-blind',
      badge: { en: 'Step 5 • Blind Diagnosis', id: 'Langkah 5 • Diagnosis Buta', ja: 'ステップ5 • ブラインド診断' },
      title: {
        en: 'Blind Diagnosis Challenge',
        id: 'Tantangan Diagnosis Buta',
        ja: 'ブラインド故障診断チャレンジ',
      },
      description: {
        en: 'Click Blind Diagnosis to inject a hidden fault and mask the fault sliders. Inspect the live gauges, intake ΔP, discharge temperature, Pressure Dew Point, duty cycle, and skid schematic, then pick the root cause and click Submit Diagnosis.',
        id: 'Klik Diagnosis Buta untuk menyuntikkan gangguan tersembunyi dan menyembunyikan slider gangguan. Periksa pengukur, ΔP hisap, suhu keluaran, titik embun, siklus beban, dan skematik, lalu pilih akar masalah dan klik Submit Diagnosis.',
        ja: 'ブラインド診断を押すと故障パラメータが隠された状態で異常が発生します。系統図・圧力・温度・圧力露点・負荷率から原因を特定し、選択肢を選んで Submit Diagnosis をクリックしてください。',
      },
    },
    {
      id: 'comp-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Switch between Explore, Practice, Quiz, and Reference using Alt+1..4. Reinforce specific power, dew point, and compressor fault diagnostics in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi. Perkuat pemahaman daya spesifik, titik embun, dan diagnosis gangguan di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、比動力や露点管理・故障診断を演習とクイズで確認しましょう。',
      },
    },
  ],

  coupling: [
    {
      id: 'coup-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'Two-Lab Rotor Balancing & Coupling Suite',
        id: 'Lab Penyeimbangan Rotor & Inspeksi Kopling',
        ja: '動釣合い試験・カップリング点検ラボ',
      },
      description: {
        en: 'Use the top sub-tab switcher to work in two specialized labs: Single-Plane Dynamic Balancing Lab (influence-coefficient vector balancing) and Coupling & Keyway Inspection (Jaw, Gear, and Grid couplings).',
        id: 'Gunakan pengalih sub-tab di atas untuk dua lab khusus: Lab Penyeimbangan Dinamis 1-Bidang (penyeimbangan vektor koefisien pengaruh) dan Inspeksi Kopling & Alur Pasak (Jaw, Gear, dan Grid).',
        ja: '上部タブで「1面動釣合い試験ラボ（影響係数法ベクトル釣合い）」と「カップリング・キー溝点検（ジョー・ギヤ・グリッド）」の2つの実験室を切り替えられます。',
      },
    },
    {
      id: 'coup-bal-visuals',
      badge: { en: 'Step 2 • Balancing Visuals', id: 'Langkah 2 • Visual Balancing', ja: 'ステップ2 • 振動・ベクトル表示' },
      title: {
        en: 'ISO 10816-3 Meter, Rotor Disk & Polar Plot',
        id: 'Meter ISO 10816-3, Cakram Rotor & Plot Polar',
        ja: 'ISO 10816-3 メータ・ロータ円板・極座標図',
      },
      description: {
        en: 'In the Balancing Lab, toggle Pause Rotor / Spin Rotor or click New Unbalance Challenge to randomize a problem. Watch the ISO 10816-3 RMS Vibration Meter (Zones A–D), the 0°–360° Rotor Disk, Polar Vibration Vector Plot, and 1× Time-Waveform Sine Plot.',
        id: 'Di Lab Balancing, gunakan tombol Jeda/Putar Rotor atau Tantangan Unbalance Baru. Amati Meter Getaran RMS ISO 10816-3 (Zona A–D), Cakram Rotor 0°–360°, Plot Vektor Polar, dan Plot Gelombang Sinus 1×.',
        ja: '動釣合いラボではロータ回転/停止や「新しい不釣合い課題」を操作できます。ISO 10816-3 実効値メータ（Zone A〜D）、0°〜360°ロータ円板、極座標ベクトル図、1×時間波形をリアルタイムで確認します。',
      },
    },
    {
      id: 'coup-bal-steps',
      badge: { en: 'Step 3 • 3-Step Balancing', id: 'Langkah 3 • 3 Langkah Balancing', ja: 'ステップ3 • 3段階釣合い手順' },
      title: {
        en: 'Initial Run, Trial Weight & Correction Weight',
        id: 'Pengukuran Awal, Beban Uji & Beban Koreksi',
        ja: '初期運転・試しおもり・修正おもり手順',
      },
      description: {
        en: 'Follow the 3 technician cards: (1) click Run Initial Measurement (V0); (2) set Trial Mass (5–50 g) and Trial Angle (0–355°) and click Attach Trial Weight & Measure V1; (3) adjust Correction Mass/Angle or click Auto-Fill Solved mc, θc, then Remove Trial & Balance.',
        id: 'Ikuti 3 kartu teknisi: (1) klik Jalankan Pengukuran Awal (V0); (2) atur Massa Uji (5–50 g) & Sudut Uji (0–355°) lalu Pasang Beban Uji & Ukur V1; (3) atur Massa/Sudut Koreksi atau klik Isi Otomatis mc, θc, lalu Lepas Uji & Seimbangkan.',
        ja: '右側3枚のカードに沿って進めます：(1) 初期測定(V0)を実行、(2) 試し質量(5〜50g)・角度(0〜355°)を設定しV1を測定、(3) 修正質量/角度を調整または「計算値 mc, θc を入力」を押し、「試し外し・釣合い実行」で振動を低減します。',
      },
      tip: {
        en: 'Check the Influence Coefficient Vector Solution card below the plots to verify V0, V1, Vt, and required correction.',
        id: 'Periksa kartu Solusi Vektor Koefisien Pengaruh di bawah plot untuk melihat V0, V1, Vt, dan koreksi yang dibutuhkan.',
        ja: 'プロット下の「影響係数ベクトル解」カードで V0・V1・Vt と必要修正量を確認できます。',
      },
    },
    {
      id: 'coup-inspect-type',
      badge: { en: 'Step 4 • Coupling Type', id: 'Langkah 4 • Tipe Kopling', ja: 'ステップ4 • カップリング形式' },
      title: {
        en: 'Coupling Type Selector & Cross-Section',
        id: 'Pemilih Tipe Kopling & Penampang SVG',
        ja: 'カップリング形式選択と断面ビュー',
      },
      description: {
        en: 'Switch to Coupling & Keyway Inspection and choose between Jaw, Gear, and Grid couplings. Inspect the interactive cross-section SVG, keyway fit geometry, and the Inspection Status banner (Healthy / Monitor / Critical).',
        id: 'Pindah ke sub-tab Inspeksi Kopling & Alur Pasak lalu pilih kopling Jaw, Gear, atau Grid. Amati penampang SVG interaktif, geometri alur pasak, dan banner Status Inspeksi.',
        ja: '「カップリング・キー溝点検」タブに切り替え、Jaw・Gear・Grid カップリングを選択します。断面SVG、キー溝嵌合、点検ステータスバナーを確認できます。',
      },
    },
    {
      id: 'coup-misalign',
      badge: { en: 'Step 5 • Misalignment', id: 'Langkah 5 • Misalignment', ja: 'ステップ5 • ミスアライメント比較' },
      title: {
        en: 'Parallel & Angular Misalignment Tolerance Gauges',
        id: 'Pengukur Toleransi Misalignment Paralel & Sudut',
        ja: '偏心・偏角ミスアライメント許容ゲージ',
      },
      description: {
        en: 'Drag the Parallel Offset (0–0.80 mm) and Angular Misalignment (0–1.80°) sliders to compare live capacity bars across Jaw, Gear, and Grid couplings and see which design stays Within Limit or Exceeds.',
        id: 'Geser slider Offset Paralel (0–0,80 mm) dan Misalignment Sudut (0–1,80°) untuk membandingkan kapasitas kopling Jaw, Gear, dan Grid secara bersamaan (Dalam Batas vs Melebihi).',
        ja: '偏心量（0〜0.80 mm）と偏角（0〜1.80°）のスライダを動かし、ジョー・ギヤ・グリッド各形式の許容バー（許容内 / 超過）を比較します。',
      },
    },
    {
      id: 'coup-fit-sliders',
      badge: { en: 'Step 6 • Keyway & Wear', id: 'Langkah 6 • Pasak & Keausan', ja: 'ステップ6 • キー溝・摩耗解析' },
      title: {
        en: 'Torque, Keyway Clearance, Wear & DIN 6885 Metrics',
        id: 'Torsi, Kelonggaran Pasak, Keausan & Tegangan DIN 6885',
        ja: 'トルク・キー溝隙間・摩耗とDIN 6885応力',
      },
      description: {
        en: 'Adjust Applied Torque (50–1100 Nm), Keyway Clearance (0–0.30 mm), Elastomer/Tooth/Grid Wear (0–90%), Shaft Ø (24–80 mm), and Key Length (25–90 mm). Read Torsional Backlash, Effective Service Factor, Fretting Corrosion Risk, and DIN 6885 Key Stress (τ, σc).',
        id: 'Atur Torsi Kerja (50–1100 Nm), Kelonggaran Alur Pasak (0–0,30 mm), Keausan Elemen (0–90%), Ø Poros (24–80 mm), dan Panjang Pasak (25–90 mm). Pantau Backlash Torsi, Faktor Layanan, Risiko Fretting, dan Tegangan Pasak DIN 6885.',
        ja: '作用トルク（50〜1100 Nm）、キー溝隙間（0〜0.30 mm）、要素摩耗率（0〜90%）、軸径（24〜80 mm）、キー長さ（25〜90 mm）を調整し、ねじりバックラッシ、有効使用率、フレッティングリスク、DIN 6885キー応力（τ, σc）を確認します。',
      },
    },
    {
      id: 'coup-modes',
      badge: { en: 'Step 7 • Modes & Shortcuts', id: 'Langkah 7 • Mode & Pintasan', ja: 'ステップ7 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Press Alt+1..4 to switch between Explore, Practice, Quiz, and Reference tabs. Verify your mastery of 1-plane vector balancing and coupling inspection in Practice and Quiz.',
        id: 'Tekan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi. Uji pemahaman penyeimbangan vektor 1-bidang dan inspeksi kopling di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、1面動釣合いとカップリング点検の知識を確認しましょう。',
      },
    },
  ],

  'crystal-lattice-3d': [
    {
      id: 'crys-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: '3D Crystal Lattice & XRD Workstation',
        id: 'Stasiun Kerja Kisi Kristal 3D & XRD',
        ja: '3D 結晶格子・X線回折ワークステーション',
      },
      description: {
        en: 'Explore Bravais lattices and real engineering crystals in an interactive 3D viewport paired with a 3-tab inspector sidebar (Controls, hkl & Defects, Bain & ρ) and a bottom deck switching between Crystallographic KPIs and a live XRD Diffractometer.',
        id: 'Pelajari kisi Bravais dan kristal material teknik pada viewport 3D interaktif yang dilengkapi bilah inspektor 3-tab (Kontrol, hkl & Cacat, Bain & ρ) serta dek bawah untuk KPI Kristalografi dan Difraktometer XRD.',
        ja: 'インタラクティブな3Dビューポート、3タブのインスペクタ（制御、指数・欠陥、変態・密度）、下部の結晶学KPI／XRD回折デッキを用いてブラベー格子と実在結晶を解析します。',
      },
    },
    {
      id: 'crys-selector',
      badge: { en: 'Step 2 • Structures', id: 'Langkah 2 • Struktur & Material', ja: 'ステップ2 • 構造・材料選択' },
      title: {
        en: 'System Filter, Strip/Gallery & Real Materials',
        id: 'Filter Sistem, Deret/Galeri & Material Nyata',
        ja: '結晶系フィルタ・ストリップ/ギャラリー・実在結晶',
      },
      description: {
        en: 'Filter structures by crystal system, toggle between Strip and Gallery views, or step with the < and > header arrows. Use the Real Materials bar to quick-load calibrated metals and alloys (such as Cu, α-Fe, or Fe-C Martensite).',
        id: 'Saring struktur berdasarkan sistem kristal, pilih tampilan Deret atau Galeri, atau geser dengan panah < dan >. Gunakan bilah Material Nyata untuk memuat logam dan paduan terkalibrasi secara cepat.',
        ja: '結晶系フィルタで絞り込み、ストリップ／ギャラリー表示を切り替え、ヘッダの < / > ボタンで順次移動できます。実在結晶バーから実材料の格子定数データを即座に読み込めます。',
      },
    },
    {
      id: 'crys-viewport',
      badge: { en: 'Step 3 • 3D Viewport', id: 'Langkah 3 • Viewport 3D', ja: 'ステップ3 • 3Dビュー操作' },
      title: {
        en: '3D Orbit, Zoom, Camera Presets & Display Modes',
        id: 'Orbit 3D, Zoom, Preset Kamera & Mode Tampilan',
        ja: '3D回転・ズーム・視点プリセット・表示モード',
      },
      description: {
        en: 'Drag on the 3D canvas to orbit, right-drag/Shift-drag to pan, and scroll (or use Zoom Out / Reset Camera / Zoom In) to zoom. Snap to Iso, [100], [010], [001], or [111], toggle Auto-Orbit or Fullscreen, and switch the bottom dock between Ball & Stick, Hard-Sphere, Sliced Cell, and Coordination.',
        id: 'Seret kanvas 3D untuk orbit, klik-kanan/Shift-seret untuk geser, dan gulir (atau tombol Zoom/Reset) untuk memperbesar. Pilih sudut Iso, [100], [010], [001], [111], aktifkan Putar Otomatis atau Layar Penuh, dan pilih mode Bola & Batang, Bola Rapat, Sel Terpotong, atau Koordinasi.',
        ja: 'キャンバスをドラッグして回転、右ドラッグ/Shiftドラッグで平行移動、ホイールまたはズームボタンで拡大縮小できます。Iso・[100]・[010]・[001]・[111] 視点切替、自動回転、全画面表示、下部ドックの4表示モード（球棒・剛体球・単位格子切断・配位結合）を活用しましょう。',
      },
      tip: {
        en: 'Sliced Cell mode is disabled while 2×2×2 Cell supercell is active.',
        id: 'Mode Sel Terpotong dinonaktifkan saat Supersel 2×2×2 aktif.',
        ja: '2×2×2 拡張スーパーセル表示中は「単位格子切断」モードは無効になります。',
      },
    },
    {
      id: 'crys-controls-tab',
      badge: { en: 'Step 4 • Controls Tab', id: 'Langkah 4 • Tab Kontrol', ja: 'ステップ4 • 制御タブ' },
      title: {
        en: 'Overlays, Quick Slip Plane & Cell Geometry',
        id: 'Overlay, Bidang Selip Cepat & Geometri Sel',
        ja: 'オーバーレイ・すべり面・格子寸法制御',
      },
      description: {
        en: 'In the Controls tab, toggle 2×2×2 Cell, Bonds, Axes (a,b,c), and Void Sites, or pick a Quick Slip Plane. Adjust Lattice Constant a (2.4–6.0 Å), Atom Radius, Lattice Explode, and any lattice-specific b/a, c/a, or α/β/γ angle sliders.',
        id: 'Pada tab Kontrol, aktifkan Supersel 2×, Ikatan, Sumbu, dan Rongga, atau pilih Bidang Selip Cepat. Atur Konstanta Kisi a (2,4–6,0 Å), Radius Atom, Urai Kisi, serta rasio b/a, c/a, atau sudut α/β/γ bila tersedia.',
        ja: '制御タブで 2×2×2拡張・原子結合・結晶軸・格子空隙を切り替え、すべり面を選択できます。格子定数 a（2.4〜6.0 Å）、原子半径、格子展開、および結晶系に応じた b/a・c/a・角度スライダを調整できます。',
      },
    },
    {
      id: 'crys-miller-tab',
      badge: { en: 'Step 5 • hkl & Defects', id: 'Langkah 5 • hkl & Cacat', ja: 'ステップ5 • 指数・欠陥タブ' },
      title: {
        en: 'Custom (hkl), Slip [uvw], Schmid Factor & Defects',
        id: 'Bidang (hkl), Arah Selip [uvw], Faktor Schmid & Cacat',
        ja: 'カスタムミラー面・すべり方向・シュミット因子・欠陥',
      },
      description: {
        en: 'Open the hkl & Defects tab to toggle Custom Plane (h k l) and Slip Vector [u v w] (-3 to 3). Check d_hkl Spacing, Planar Density, [uvw] ∈ (hkl) validity, Schmid factor m, the 2D Atom Slice inset, and switch 3D Crystal Defect Modes.',
        id: 'Buka tab hkl & Cacat untuk mengaktifkan Bidang (h k l) dan Arah Selip [u v w] (-3 s/d 3). Periksa jarak d_hkl, Densitas Planar, validitas [uvw] ∈ (hkl), faktor Schmid m, irisan 2D, dan Mode Cacat Kristal 3D.',
        ja: '指数・欠陥タブでカスタムミラー面 (h k l) とすべり方向 [u v w]（-3〜3）を設定し、面間隔 d_hkl、面密度、[uvw] ∈ (hkl) 判定、シュミット因子 m、2D断面スライス、3D格子欠陥モデルを確認できます。',
      },
    },
    {
      id: 'crys-bain-xrd',
      badge: { en: 'Step 6 • Bain & XRD', id: 'Langkah 6 • Bain & XRD', ja: 'ステップ6 • 変態・密度＆XRD' },
      title: {
        en: 'Bain Strain, Atom Inspector & XRD Diffractometer',
        id: 'Regangan Bain, Inspektor Atom & Difraktometer XRD',
        ja: 'ベイン歪み・原子インスペクタ・XRD回折計',
      },
      description: {
        en: 'In Bain & ρ, animate c/a strain, adjust Carbon Wt%, or click Fe-C BCT; click any 3D atom to inspect its Cell Share, Neighbors, and (u,v,w) coordinates. Below, switch to XRD Diffractometer (Cu-Kα or Mo-Kα) and click any Bragg peak or table row to highlight that (hkl) plane in 3D.',
        id: 'Di tab Bain & ρ, animasikan regangan c/a, atur % Karbon, atau muat Fe-C BCT; klik bola atom 3D untuk melihat Porsi Sel, Tetangga, dan koordinat (u,v,w). Di dek bawah, buka Difraktometer XRD (Cu-Kα/Mo-Kα) dan klik puncak Bragg untuk menyorot bidang (hkl) di 3D.',
        ja: '変態・密度タブでは c/a 歪みアニメーションや炭素量調整、Fe-C BCT 切替が行え、3D原子をクリックして寄与率・配位数・座標を確認できます。下部XRDタブでは Cu-Kα / Mo-Kα を切り替え、回折ピークや表の行をクリックして対応する (hkl) 面を3D表示できます。',
      },
    },
    {
      id: 'crys-modes',
      badge: { en: 'Step 7 • Modes & Shortcuts', id: 'Langkah 7 • Mode & Pintasan', ja: 'ステップ7 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to switch between Explore, Practice, Quiz, and Formula reference. Test your knowledge of APF, coordination numbers, Miller indices, and Bragg diffraction in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi Rumus. Uji pemahaman APF, bilangan koordinasi, indeks Miller, dan difraksi Bragg di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・公式リファレンスを切り替え、充填率・配位数・ミラー指数・ブラッグ回折の理解を深めましょう。',
      },
    },
  ],

  'db-meter': [
    {
      id: 'db-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'IEC 61672 Sound Level Meter & Exposure Lab',
        id: 'Pengukur Tingkat Suara IEC 61672 & Lab Paparan',
        ja: 'IEC 61672 騒音計＆ばく露評価ラボ',
      },
      description: {
        en: 'Measure industrial machine noise with a live sound level meter, an 8-band Octave-Band Spectrum analyzer, and real-time OSHA 29 CFR 1910.95 & NIOSH REL (1998) occupational exposure calculators.',
        id: 'Ukur kebisingan mesin industri dengan meter SPL langsung, penganalisis Spektrum Pita Oktaf 8-band, serta kalkulator paparan kerja OSHA 29 CFR 1910.95 dan NIOSH REL (1998).',
        ja: '産業機械の騒音をライブ騒音計、8バンド・オクターブバンドスペクトル解析、および OSHA 29 CFR 1910.95 / NIOSH REL (1998) 許容ばく露時間計算で評価します。',
      },
    },
    {
      id: 'db-source-dist',
      badge: { en: 'Step 2 • Source & Distance', id: 'Langkah 2 • Sumber & Jarak', ja: 'ステップ2 • 音源・距離' },
      title: {
        en: 'Machine Acoustic Source & Microphone Distance',
        id: 'Sumber Akustik Mesin & Jarak Mikrofon',
        ja: '機械音源とマイク距離スライダ',
      },
      description: {
        en: 'Select a Machine Acoustic Source on the right to test different industrial equipment profiles. Drag Microphone Distance from 1.0 m to 15.0 m (0.5 m steps) to observe free-field inverse-square attenuation in dB.',
        id: 'Pilih Sumber Akustik Mesin di kanan untuk menguji profil peralatan industri. Geser Jarak Mikrofon dari 1,0 m hingga 15,0 m (langkah 0,5 m) untuk mengamati redaman jarak dalam dB.',
        ja: '右側の機械音源を選択して各種設備の騒音特性を比較します。マイク距離を 1.0 m 〜 15.0 m（0.5 m 刻み）で動かし、距離減衰（dB）を確認しましょう。',
      },
      tip: {
        en: 'Doubling distance in a free field reduces sound pressure level by approximately 6 dB.',
        id: 'Menggandakan jarak di medan bebas menurunkan tingkat tekanan suara sekitar 6 dB.',
        ja: '自由音場では距離が2倍になるごとに音圧レベルが約 6 dB 低下します。',
      },
    },
    {
      id: 'db-weighting',
      badge: { en: 'Step 3 • Weighting & Peak', id: 'Langkah 3 • Pembobotan & Puncak', ja: 'ステップ3 • 重み付け・ピーク' },
      title: {
        en: 'Frequency Weighting, Time Weighting & Reset Peak',
        id: 'Pembobotan Frekuensi, Waktu & Reset Puncak',
        ja: '周波数重み付け・時間重み付け・ピークリセット',
      },
      description: {
        en: 'Switch Frequency Weighting between dBA (human hearing), dBC (low-frequency/peak), and dBZ (flat). Toggle Time Weighting between FAST (125 ms) and SLOW (1 s), and click Reset Peak to clear the Peak Hold indicator (also clickable on the meter SVG).',
        id: 'Ubah Pembobotan Frekuensi antara dBA, dBC, dan dBZ. Pilih Pembobotan Waktu FAST (125 ms) atau SLOW (1 s), lalu klik Reset Puncak untuk menghapus nilai Peak Hold (bisa juga langsung dari SVG meter).',
        ja: '周波数重み付け（dBA / dBC / dBZ）と時間重み付け（FAST 125 ms / SLOW 1 s）を切り替えます。ピークリセット（またはSVG上の操作）でピークホールド値を初期化できます。',
      },
    },
    {
      id: 'db-enclosure',
      badge: { en: 'Step 4 • Attenuation', id: 'Langkah 4 • Peredaman', ja: 'ステップ4 • 防音対策' },
      title: {
        en: 'Acoustic Enclosure Attenuation (-12 dB)',
        id: 'Penutup Akustik / Enclosure (-12 dB)',
        ja: '防音エンクロージャ (-12 dB)',
      },
      description: {
        en: 'Toggle Acoustic Enclosure Attenuation (-12 dB) ON or OFF to simulate installing an acoustic hood around the machine and immediately see how much permissible shift time is gained.',
        id: 'Aktifkan atau matikan Penutup Akustik / Enclosure (-12 dB) untuk mensimulasikan pemasangan peredam suara dan melihat peningkatan waktu kerja aman.',
        ja: '防音エンクロージャ（-12 dB）の ON / OFF を切り替え、遮音対策による騒音低減と許容ばく露時間の改善を確認します。',
      },
    },
    {
      id: 'db-spectrum-osha',
      badge: { en: 'Step 5 • Spectrum & OSHA/NIOSH', id: 'Langkah 5 • Spektrum & OSHA/NIOSH', ja: 'ステップ5 • スペクトル・基準' },
      title: {
        en: 'Octave-Band Spectrum & Exposure Standards',
        id: 'Spektrum Pita Oktaf & Standar Paparan',
        ja: 'オクターブバンドと OSHA / NIOSH 基準',
      },
      description: {
        en: 'Inspect the 8-band Octave-Band Spectrum (with dBA, dBC, and dBZ comparison pills) to spot dominant frequencies. Compare OSHA (90 dBA criterion, 5 dB exchange) against stricter NIOSH (85 dBA criterion, 3 dB exchange) Max Exposure Time and 8h TWA Dose.',
        id: 'Periksa Spektrum Pita Oktaf 8-band (beserta perbandingan dBA, dBC, dBZ) untuk melihat frekuensi dominan. Bandingkan Waktu Maksimum dan Dosis TWA 8 Jam antara OSHA (90 dBA, 5 dB) dan NIOSH (85 dBA, 3 dB).',
        ja: '8バンドのオクターブスペクトル（dBA/dBC/dBZ比較表示付き）で卓越周波数を確認し、OSHA（90 dBA基準・5 dB則）と NIOSH（85 dBA基準・3 dB則）の許容時間・8時間TWA線量を比較します。',
      },
    },
    {
      id: 'db-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to navigate between Explore, Practice, Quiz, and Reference. Practice calculating distance attenuation and OSHA/NIOSH exchange-rate limits in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi. Latih perhitungan redaman jarak dan batas paparan OSHA/NIOSH di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、距離減衰やばく露限界の計算を演習とクイズで確認しましょう。',
      },
    },
  ],

  'drag-chain-conveyor': [
    {
      id: 'dcc-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'En-Masse & Scraper Drag Chain Conveyor',
        id: 'Konveyor Rantai Penggaruk & En-Masse',
        ja: 'エンマス＆スクレーパ・ドラッグチェーンコンベヤ',
      },
      description: {
        en: 'Simulate an enclosed bulk drag-chain conveyor with live animated flights, clickable SVG inspection zones, a 6-card telemetry grid, a diagnostic banner, and a Shear-Pin Load (%) dial.',
        id: 'Simulasikan konveyor rantai tertutup dengan animasi flight, zona inspeksi SVG yang dapat diklik, 6 kartu telemetri, banner diagnostik, dan dial beban Shear Pin (%).',
        ja: 'アニメーション付きフライト、クリック可能なSVG点検ゾーン、6項目のテレメトリカード、診断バナー、シャーピン負荷率ダイヤルを備えた密閉ドラッグチェーンコンベヤをシミュレートします。',
      },
      tip: {
        en: 'Click hotspots directly on the conveyor SVG to inspect zone-specific telemetry.',
        id: 'Klik hotspot langsung pada SVG konveyor untuk memeriksa telemetri tiap zona.',
        ja: 'コンベヤSVG上のホットスポットをクリックすると各ゾーンの詳細を確認できます。',
      },
    },
    {
      id: 'dcc-presets-transport',
      badge: { en: 'Step 2 • Presets & Run', id: 'Langkah 2 • Preset & Kontrol', ja: 'ステップ2 • プリセット・運転' },
      title: {
        en: 'Material Presets & Transport Controls',
        id: 'Preset Material & Kontrol Jalan/Jeda',
        ja: '材料プリセットと運転・リセット操作',
      },
      description: {
        en: 'Load industry presets from the top bar: Dry Grain, Wood Chips, Coal / Ash, or Inclined Clinker. Use Run / Pause to control motion, Reset to restore defaults, or Clear Fault when an abnormal condition is active.',
        id: 'Muat preset material di bilah atas: Biji Kering, Serpih Kayu, Batu Bara, atau Klinker Miring. Gunakan Jalan / Jeda untuk animasi, Reset untuk kembali ke awal, atau Pulihkan saat ada gangguan.',
        ja: '上部の材料プリセット（乾燥穀物・木質チップ・石炭・灰・傾斜クリンカ）を選択できます。運転/一時停止・リセット・異常解除ボタンで操作を制御します。',
      },
    },
    {
      id: 'dcc-faults',
      badge: { en: 'Step 3 • Fault Injection', id: 'Langkah 3 • Injeksi Gangguan', ja: 'ステップ3 • 故障シミュレーション' },
      title: {
        en: 'Fault Injection & Shear-Pin Monitoring',
        id: 'Injeksi Gangguan & Pemantauan Shear Pin',
        ja: '故障注入とシャーピン負荷監視',
      },
      description: {
        en: 'In the Fault Injection box, test Normal, Chain Slack, Broken Flight, or Material Jam. Watch the PIN load dial, Chain Pull (T₁), Sag & Carryback card, and the diagnostic status banner react immediately.',
        id: 'Pada kotak Injeksi Gangguan, uji kondisi Normal, Rantai Kendur, Flight Patah, atau Macet Material. Amati dial PIN, Tarikan Rantai (T₁), kartu Sag & Carryback, dan banner diagnostik.',
        ja: '故障シミュレーションから正常・チェーン弛み・フライト破損・材料詰まりを切り替え、PIN負荷率ダイヤル・張力T₁・たるみ/持ち帰り・診断バナーの変化を確認します。',
      },
    },
    {
      id: 'dcc-drive-chain',
      badge: { en: 'Step 4 • Drive & Chain', id: 'Langkah 4 • Penggerak & Rantai', ja: 'ステップ4 • 駆動・チェーン設定' },
      title: {
        en: 'Drive, Sprocket, Take-Up & Chain Wear Sliders',
        id: 'Slider Kecepatan, Pitch, Gigi, Take-Up & Keausan',
        ja: '速度・ピッチ・歯数・テークアップ・摩耗',
      },
      description: {
        en: 'Under Drive & Chain, tune Speed (v) (0.15–1.20 m/s), Flight Pitch (125–300 mm), Chain Pitch (60–160 mm), Teeth (z) (8–20T), Take-Up screw travel (0–80 mm), and Chain Wear (0–4.5%).',
        id: 'Pada grup Penggerak & Rantai, atur Kecepatan (0,15–1,20 m/s), Pitch Flight (125–300 mm), Pitch Rantai (60–160 mm), Gigi (8–20T), Take-Up (0–80 mm), dan Aus Rantai (0–4,5%).',
        ja: '駆動・チェーングループで速度(0.15〜1.20 m/s)、フライト間隔(125〜300 mm)、チェーンピッチ(60〜160 mm)、歯数(8〜20T)、テークアップ(0〜80 mm)、チェーン摩耗(0〜4.5%)を調整します。',
      },
      tip: {
        en: 'Advancing Take-Up reduces return-strand catenary sag, while over-tensioning adds parasitic friction.',
        id: 'Menambah Take-Up mengurangi kelendutan katenari, tetapi terlalu kencang menambah gesekan parasit.',
        ja: 'テークアップを締めるとたるみは減りますが、締め過ぎると軸受やレール摩擦が増加します。',
      },
    },
    {
      id: 'dcc-geometry-material',
      badge: { en: 'Step 5 • Casing & Friction', id: 'Langkah 5 • Casing & Gesekan', ja: 'ステップ5 • 形状・摩擦特性' },
      title: {
        en: 'Casing Geometry, Material & Telemetry Cards',
        id: 'Geometri Casing, Material & Kartu Telemetri',
        ja: 'ケーシング形状・材料特性とテレメトリ',
      },
      description: {
        en: 'Adjust Casing & Bed Geometry (Width, Casing H, Material Bed Height, Length, Incline 0–35°) and Material & Friction (Density, Efficiency, μₘ, μ_c). Track Mass & Vol. Flow, Chain Pull (T₁, T₂, Fₑ), Drive Power & Current, Sprocket RPM & Torque, Sag & Carryback, and Bed Cross-Section.',
        id: 'Atur Geometri Casing & Lapisan (Lebar, Tinggi Casing, Tinggi Lapisan, Panjang, Kemiringan 0–35°) dan Material & Gesekan (Densitas, Efisiensi, μₘ, μ_c). Pantau 6 kartu telemetri di bawah SVG.',
        ja: 'ケーシング・層形状（幅・高さ・材料層高さ・機長・傾斜0〜35°）と材料・摩擦（かさ密度・効率・μₘ・μ_c）を調整し、流量・張力・動力・回転/トルク・たるみ・層断面積を確認します。',
      },
    },
    {
      id: 'dcc-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to switch between Explore, Practice, Quiz, and Reference tabs. Verify en-masse throughput, catenary sag, and shear-pin fault troubleshooting in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi. Uji perhitungan kapasitas en-masse, sag katenari, dan diagnosis shear pin di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、エンマス搬送量や張力・故障診断を演習とクイズで確認しましょう。',
      },
    },
  ],

  'fasteners-basics': [
    {
      id: 'fast-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'Fastener Stack & Property Class Lab',
        id: 'Susunan Pengencang & Kelas Kekuatan Baut',
        ja: '締結要素構成・強度区分ラボ',
      },
      description: {
        en: 'Assemble a complete bolted joint from bolt head, nut, washer, metric diameter, and ISO property class. The 2D CAD view updates live alongside the Selected Fastener Stack & Application Guide.',
        id: 'Rakit sambungan baut lengkap mulai dari kepala baut, mur, ring, diameter metrik, hingga kelas kekuatan ISO. Gambar CAD 2D dan Ringkasan Susunan Pengencang diperbarui secara langsung.',
        ja: 'ボルト頭部、ナット、座金、呼び径、ISO強度区分を組み合わせて締結ジョイントを構成します。2D CAD図と選択締結要素・適用ガイドがリアルタイムに更新されます。',
      },
    },
    {
      id: 'fast-hardware',
      badge: { en: 'Step 2 • Hardware', id: 'Langkah 2 • Komponen', ja: 'ステップ2 • 締結部品選択' },
      title: {
        en: 'Bolt Head, Nut Locking & Washer Controls',
        id: 'Kontrol Kepala Baut, Mur Pengunci & Ring',
        ja: 'ボルト頭部・ナット形式・座金（ワッシャー）',
      },
      description: {
        en: 'Select Bolt Head Style, Nut Locking Type, and Washer Type on the right panel. Review each component card under the CAD diagram to compare DIN/ISO standards, drive tools, reusability, and vibration resistance.',
        id: 'Pilih Bentuk Kepala Baut, Tipe Mur Pengunci, dan Jenis Ring pada panel kanan. Baca tiga kartu ringkasan di bawah diagram untuk membandingkan standar DIN/ISO, alat kunci, pemakaian ulang, dan ketahanan getaran.',
        ja: '右側パネルでボルト頭部形状、ナット形式、座金を選択し、CAD図下の3枚のカードで規格・適合工具・再使用性・耐振性を比較します。',
      },
    },
    {
      id: 'fast-size-grade',
      badge: { en: 'Step 3 • Size & Grade', id: 'Langkah 3 • Ukuran & Grade', ja: 'ステップ3 • 呼び径・強度区分' },
      title: {
        en: 'Metric Size & Property Class Selection',
        id: 'Ukuran Metrik, Kunci Pas & Kelas Kekuatan',
        ja: '呼び径（工具サイズ）と強度区分',
      },
      description: {
        en: 'Choose a Metric Size (with corresponding hex spanner AF width in mm) and an ISO Property Class / Grade (such as 8.8, 10.9, or 12.9) to see how material alloy and heat treatment scale joint capacity.',
        id: 'Pilih Ukuran Metrik (lengkap dengan ukuran kunci pas AF dalam mm) dan Kelas Kekuatan / Grade ISO untuk melihat pengaruh material dan perlakuan panas terhadap kapasitas sambungan.',
        ja: '呼び径（二面幅 mm 表示付き）と強度区分グレードを選択し、材質・熱処理による締結強度の違いを確認します。',
      },
      tip: {
        en: 'For class X.Y, nominal tensile strength Rm = X × 100 MPa, and yield strength Re = X × Y × 10 MPa.',
        id: 'Untuk kelas X.Y, kuat tarik nominal Rm = X × 100 MPa, dan kuat luluh Re = X × Y × 10 MPa.',
        ja: '強度区分 X.Y では、公称引張強さ Rm = X × 100 MPa、降伏耐力 Re = X × Y × 10 MPa となります。',
      },
    },
    {
      id: 'fast-telemetry',
      badge: { en: 'Step 4 • Torque Telemetry', id: 'Langkah 4 • Telemetri Torsi', ja: 'ステップ4 • トルク演算' },
      title: {
        en: 'Property Class & Torque Telemetry',
        id: 'Telemetri Kekuatan & Torsi Pengencangan',
        ja: '強度区分・締付トルク・軸力テレメトリ',
      },
      description: {
        en: 'Read Nominal Tensile (Rm), Yield Strength (Re), Dry Torque (K=0.20) in N·m, and Target Clamp (75% Fp) in kN, along with the material, heat treatment, decoder formula, and typical engineering applications.',
        id: 'Baca nilai Tarik Nominal (Rm), Kekuatan Luluh (Re), Torsi Kering (K=0,20) dalam N·m, dan Gaya Jepit Target (75% Fp) dalam kN beserta rumus dekoder dan aplikasi umumnya.',
        ja: '公称引張強さ (Rm)、降伏耐力 (Re)、ドライ締付トルク (K=0.20)、目標締付軸力 (75% Fp)、および材質・熱処理・計算式・主な用途を確認します。',
      },
    },
    {
      id: 'fast-modes',
      badge: { en: 'Step 5 • Modes & Shortcuts', id: 'Langkah 5 • Mode & Pintasan', ja: 'ステップ5 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to switch between Explore, Practice, Quiz, and Reference tabs. Test property-class decoding, locking nut selection, and dry torque estimation in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi. Uji pemahaman dekode kelas kekuatan, pemilihan mur pengunci, dan torsi kering di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、強度区分の読み方や締付トルク・緩み止め選定を演習とクイズで確認しましょう。',
      },
    },
  ],

  'fits-tolerances': [
    {
      id: 'fits-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'ISO 286 Fits, Shrink-Fit & Go/No-Go QC',
        id: 'Suaian ISO 286, Shrink-Fit & Kaliber Go/No-Go',
        ja: 'ISO 286 はめあい・焼きばめ・限界ゲージ検査',
      },
      description: {
        en: 'Design hole-basis shaft/bore fits per ISO 286, compute Lamé interference contact pressure and thermal drop-in temperatures, and inspect machined parts on a Taylor-principle Go/No-Go gauge bench.',
        id: 'Rancang suaian basis lubang ISO 286, hitung tekanan kontak interferensi Lamé dan suhu perakitan termal, serta uji komponen pada meja kaliber batas Go/No-Go prinsip Taylor.',
        ja: 'ISO 286 穴基準はめあいの設計、ラメ式による接触面圧・圧入力と熱膨張組立隙間の計算、さらに通り/止まり（Go/No-Go）ゲージ検査を体験できます。',
      },
    },
    {
      id: 'fits-classes',
      badge: { en: 'Step 2 • ISO 286 Classes', id: 'Langkah 2 • Kelas ISO 286', ja: 'ステップ2 • 公差クラス' },
      title: {
        en: 'Nominal Diameter, Hole & Shaft Classes',
        id: 'Diameter Nominal, Kelas Lubang & Poros',
        ja: '基準寸法・穴公差・軸公差クラス',
      },
      description: {
        en: 'Select Nominal Diameter d (mm), Hole Basis Class (H6, H7, H8), and Shaft Tolerance Class (f7 – s6). The banner and 2D tolerance-zone diagram immediately classify the pair as Clearance, Transition, or Interference fit with ES/EI and es/ei in µm.',
        id: 'Pilih Diameter Nominal d (mm), Kelas Basis Lubang (H6, H7, H8), dan Kelas Toleransi Poros (f7 – s6). Banner dan diagram zona toleransi 2D langsung mengklasifikasikan suaian Longgar, Transisi, atau Sesak lengkap dengan ES/EI dan es/ei (µm).',
        ja: '基準寸法 d (mm)、穴公差クラス（H6/H7/H8）、軸公差クラス（f7〜s6）を選択すると、すきまばめ・中間ばめ・しまりばめの判定と上下許容差（µm）が即座に表示されます。',
      },
    },
    {
      id: 'fits-thermal',
      badge: { en: 'Step 3 • Shrink & Cryo', id: 'Langkah 3 • Rakit Termal', ja: 'ステップ3 • 焼きばめ・冷やしばめ' },
      title: {
        en: 'Engagement Length & Thermal Assembly Temp',
        id: 'Panjang Kontak Hub & Suhu Pemanas/Kriogenik',
        ja: '嵌合長さと加熱・冷却温度制御',
      },
      description: {
        en: 'Adjust Hub Engagement Length L (20–120 mm) and Induction Heater / Cryo Shaft Temp (-80 °C to +160 °C). Use the quick buttons (-78°C Dry Ice, 20°C Ambient, +110°C Bearing Heater, or Auto Drop-In for interference fits) to achieve drop-in clearance.',
        id: 'Atur Panjang Kontak Hub L (20–120 mm) dan Suhu Pemanas Induksi / Kriogenik (-80 °C s/d +160 °C). Gunakan tombol cepat (-78°C Es Kering, 20°C Ruang, +110°C Pemanas, atau Otomatis Masuk) untuk mencapai celah rakit bebas.',
        ja: 'ハブ嵌合長さ L（20〜120 mm）と温度スライダ（-80 °C 〜 +160 °C）を調整します。-78°C ドライアイス、20°C 室温、+110°C 軸受ヒーター、またはしまりばめ時の「推奨加熱」ボタンで落とし込み可能な隙間を確保できます。',
      },
    },
    {
      id: 'fits-readouts',
      badge: { en: 'Step 4 • Engineering Readouts', id: 'Langkah 4 • Pembacaan Teknik', ja: 'ステップ4 • 工学計算出力' },
      title: {
        en: 'Clearance/Interference, Press Force & Drop-In',
        id: 'Celah/Kesesakan, Gaya Pres & Celah Termal',
        ja: 'すきま/締め代・圧入力・熱膨張隙間',
      },
      description: {
        en: 'Review the 4 readout cards: Clearance or Interference range (µm), Lamé Contact Pressure (MPa), Hydraulic Press Force (kN / tonnes & transmissible torque), and Thermal Assembly Clearance showing whether drop-in is ready.',
        id: 'Pantau 4 kartu pembacaan: rentang Kelonggaran/Kesesakan (µm), Tekanan Kontak (MPa), Gaya Pres Hidrolik (kN / ton & torsi), dan Celah Rakit Termal beserta status siap masuk bebas.',
        ja: '4枚のカードで、すきま/締め代範囲（µm）、接触面圧（MPa）、油圧プレス圧入力（kN・t・許容トルク）、および熱膨張時の最小組立隙間を確認します。',
      },
    },
    {
      id: 'fits-gauges',
      badge: { en: 'Step 5 • Go / No-Go QC', id: 'Langkah 5 • Kaliber Go / No-Go', ja: 'ステップ5 • Go/No-Go 検査' },
      title: {
        en: 'Go / No-Go Plug & Snap Gauge QC Bench',
        id: 'Meja QC Kaliber Plug & Snap Go / No-Go',
        ja: '通り/止まり (Go / No-Go) ゲージ検査ベンチ',
      },
      description: {
        en: 'At the bottom QC bench, drag Machined Bore Deviation and Machined Shaft Deviation sliders to test Taylor-principle GO and NO-GO plug/snap gauges. Observe BORE/SHAFT PASS, REWORK, or SCRAP verdicts and the Actual Mated Clearance.',
        id: 'Pada meja QC di bawah, geser slider Penyimpangan Lubang Aktual dan Penyimpangan Poros Aktual untuk menguji kaliber GO dan NO-GO. Amati status LULUS, REWORK, atau AFKIR serta Celah Pasangan Aktual.',
        ja: '下部の検査ベンチで加工穴と加工軸の実測偏差スライダを動かし、通り側(GO)・止まり側(NO-GO)の合否判定（合格・再加工・不良）と実測嵌合すきまを確認します。',
      },
      tip: {
        en: 'A part passes only when GO enters/passes freely AND NO-GO does not enter/pass.',
        id: 'Komponen lulus hanya jika sisi GO masuk/lewat bebas DAN sisi NO-GO tertahan.',
        ja: '通り側(GO)が通り、かつ止まり側(NO-GO)が止まった場合のみ合格となります。',
      },
    },
    {
      id: 'fits-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Switch between Explore, Practice, Quiz, and Reference via Alt+1..4. Test ISO 286 fit classification, shrink-fit temperature, and Go/No-Go gauge logic in Practice and Quiz.',
        id: 'Berpindah antara Jelajah, Latihan, Kuis, dan Referensi dengan Alt+1..4. Uji klasifikasi suaian ISO 286, suhu shrink-fit, dan logika kaliber Go/No-Go di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、はめあい分類や焼きばめ温度、限界ゲージの判定を演習とクイズで確認しましょう。',
      },
    },
  ],

  'gear-strength': [
    {
      id: 'gear-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'AGMA Spur & Helical Gear Strength Analyzer',
        id: 'Analisis Kekuatan Roda Gigi Spur & Helikal AGMA',
        ja: 'AGMA 平歯車・はすば歯車強度解析',
      },
      description: {
        en: 'Evaluate Lewis bending stress (σ_b) and Hertzian contact stress (σ_c) for spur and helical gear pairs. The live meshing SVG, AGMA compliance banner (SAFE / MARGINAL / CRITICAL), and 4 KPI cards update continuously.',
        id: 'Evaluasi tegangan lentur Lewis (σ_b) dan tegangan kontak Hertz (σ_c) untuk pasangan roda gigi lurus dan helikal. Animasi SVG, banner status AGMA (SAFE / MARGINAL / CRITICAL), dan 4 kartu metrik diperbarui langsung.',
        ja: '平歯車およびはすば歯車のルイス曲げ応力 (σ_b) とヘルツ接触応力 (σ_c) を解析します。噛合いアニメーションSVG、AGMA安全判定バナー、4つの主要指標がリアルタイムに更新されます。',
      },
    },
    {
      id: 'gear-mode-presets',
      badge: { en: 'Step 2 • Mode & Presets', id: 'Langkah 2 • Mode & Preset', ja: 'ステップ2 • 形式・プリセット' },
      title: {
        en: 'Spur/Helical Mode, Speed & Benchmark Presets',
        id: 'Mode Spur/Helikal, Kecepatan & Preset Benchmark',
        ja: '歯車形式・回転速度・ベンチマーク',
      },
      description: {
        en: 'Toggle Spur Gears (0°) vs Helical Gears (ψ), Pause/Run the mesh animation, and select playback speed (0.05×, 0.1×, 0.25×, 1× Actual). Load Engineering Benchmarks from the dropdown, Reset defaults, or export a CSV report.',
        id: 'Pilih Roda Gigi Lurus (Spur / 0°) atau Helikal (ψ), Jeda/Putar animasi, dan atur kecepatan (0.05×, 0.1×, 0.25×, 1× Nyata). Muat kasus Benchmark Rekayasa, Reset, atau unduh laporan CSV.',
        ja: '平歯車（0°）とはすば歯車（ψ）を切り替え、回転の一時停止/開始や再生倍率（0.05×〜1×実速度）を選択します。標準ベンチマークの読み込み、初期化、CSV出力も可能です。',
      },
    },
    {
      id: 'gear-material',
      badge: { en: 'Step 3 • Material', id: 'Langkah 3 • Material', ja: 'ステップ3 • 材質・熱処理' },
      title: {
        en: 'Gear Material & Custom Property Inputs',
        id: 'Material Roda Gigi & Input Properti Kustom',
        ja: '歯車材質とカスタム物性値設定',
      },
      description: {
        en: 'Choose a preset heat-treated gear material from the dropdown to inspect allowable bending [σ_b] and contact [σ_c] limits, or select Custom Material to edit Young’s Modulus E, Poisson’s Ratio ν, and allowable stresses directly.',
        id: 'Pilih material roda gigi standar dari dropdown untuk melihat batas izin lentur [σ_b] dan kontak [σ_c], atau pilih Material Kustom untuk mengisi Modulus Young E, Rasio Poisson ν, dan batas tegangan sendiri.',
        ja: 'ドロップダウンから標準歯車材質を選択して許容曲げ応力 [σ_b]・許容接触応力 [σ_c] を確認するか、カスタム材料を選んでヤング率 E・ポアソン比 ν・許容応力を直接入力できます。',
      },
    },
    {
      id: 'gear-params',
      badge: { en: 'Step 4 • Power & Geometry', id: 'Langkah 4 • Daya & Geometri', ja: 'ステップ4 • 動力・諸元' },
      title: {
        en: 'Power, Kinematics, Tooth Count & Factors',
        id: 'Daya, Kecepatan, Modul, Jumlah Gigi & Faktor',
        ja: '伝達動力・回転数・モジュール・歯数・係数',
      },
      description: {
        en: 'Tune Transmitted Power P (1–75 kW), Pinion Speed n₁ (200–3600 RPM), Module m (1.5–10 mm), Face Width b (15–100 mm), Pinion Teeth z₁ (14–36), Gear Teeth z₂ (20–96), Pressure Angle α (20° or 25°), and Application Factor K_o (1.00–1.75).',
        id: 'Atur Daya Transmisi P (1–75 kW), Kecepatan Pinion n₁ (200–3600 RPM), Modul m (1,5–10 mm), Lebar Muka b (15–100 mm), Gigi z₁ (14–36), z₂ (20–96), Sudut Tekan α (20°/25°), dan Faktor Aplikasi K_o.',
        ja: '伝達動力 P（1〜75 kW）、回転数 n₁（200〜3600 RPM）、モジュール m（1.5〜10 mm）、歯幅 b（15〜100 mm）、歯数 z₁・z₂、基準圧力角 α（20°/25°）、使用衝撃係数 K_o を調整します。',
      },
      tip: {
        en: 'Increasing Module m or Face Width b lowers both bending and contact stresses; check SF and SH on the metric cards.',
        id: 'Memperbesar Modul m atau Lebar Muka b menurunkan tegangan lentur dan kontak; pantau SF dan SH pada kartu metrik.',
        ja: 'モジュール m や歯幅 b を大きくすると曲げ応力と面圧応力が低下します。メトリクスカードの SF と SH を確認しましょう。',
      },
    },
    {
      id: 'gear-helical',
      badge: { en: 'Step 5 • Helical Analysis', id: 'Langkah 5 • Analisis Helikal', ja: 'ステップ5 • はすば歯車評価' },
      title: {
        en: 'Helix Angle ψ, Overlap Ratio ε_β & Axial Thrust',
        id: 'Sudut Heliks ψ, Rasio Overlap ε_β & Gaya Aksial',
        ja: 'ねじれ角 ψ・重なり噛合い率 ε_β・スラスト力',
      },
      description: {
        en: 'In Helical mode, adjust Helix Angle ψ (5°–35°) and inspect the Top View: Helical Face Mesh schematic showing tangential force Wₜ and axial thrust Wₐ, plus the percentage stress delta vs an equivalent 0° Spur gear and target ε_β ≥ 1.0.',
        id: 'Pada mode Helikal, atur Sudut Heliks ψ (5°–35°) dan amati diagram Tampak Atas yang menampilkan gaya tangensial Wₜ dan gaya aksial Wₐ, perbandingan tegangan terhadap Spur 0°, serta target rasio overlap ε_β ≥ 1,0.',
        ja: 'はすば歯車モードではねじれ角 ψ（5°〜35°）を調整でき、上面図での接線力 Wₜ とスラスト力 Wₐ、平歯車（0°）比の応力低減率、重なり噛合い率 ε_β ≥ 1.0 の達成状況を確認できます。',
      },
    },
    {
      id: 'gear-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to switch between Explore, Practice, Quiz, and Formula reference. Practice sizing gear modules, face widths, and helical bearing thrust in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi Rumus. Latih pemilihan modul, lebar muka, dan gaya aksial helikal di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・公式リファレンスを切り替え、歯車諸元の設計と安全率評価を演習とクイズで確認しましょう。',
      },
    },
  ],

  hardness: [
    {
      id: 'hard-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'ASTM Indentation Hardness Testing Lab',
        id: 'Lab Uji Kekerasan Indentasi ASTM',
        ja: 'ASTM 圧痕硬さ試験ラボ',
      },
      description: {
        en: 'Operate an interactive C-frame hardness tester supporting Rockwell (HRC, HRB), Brinell (HBW), and Vickers (HV) scales with an optical indentation inset, ASTM E140 scale equivalence, and an exportable inspection log.',
        id: 'Operasikan mesin uji kekerasan C-frame interaktif untuk skala Rockwell (HRC, HRB), Brinell (HBW), dan Vickers (HV) lengkap dengan inset optik indentasi, konversi ASTM E140, dan log inspeksi.',
        ja: 'ロックウェル（HRC・HRB）、ブリネル（HBW）、ビッカース（HV）に対応したCフレーム硬さ試験機を操作し、光学圧痕インセット、ASTM E140 換算、検査ログ出力を行えます。',
      },
    },
    {
      id: 'hard-scale-mat',
      badge: { en: 'Step 2 • Scale & Material', id: 'Langkah 2 • Skala & Material', ja: 'ステップ2 • スケール・試験片' },
      title: {
        en: 'Hardness Scale & Specimen Material Selector',
        id: 'Pemilih Skala Kekerasan & Material Benda Uji',
        ja: '硬さスケールと試験片材質の選択',
      },
      description: {
        en: 'Pick a Hardness Scale & Indenter Method (HRC, HRB, HBW, or HV) and choose a Specimen Material from the dropdown. Watch the ASTM guideline banner warn if a material falls outside the selected scale’s recommended range.',
        id: 'Pilih Metode & Skala Kekerasan (HRC, HRB, HBW, atau HV) serta Material Benda Uji dari dropdown. Perhatikan banner panduan ASTM yang memberi peringatan bila material berada di luar rentang ideal skala.',
        ja: '硬さスケール・圧子方式（HRC / HRB / HBW / HV）と試験片材質を選択します。推奨測定範囲外の場合は ASTM ガイドライン警告が表示されます。',
      },
    },
    {
      id: 'hard-cycle',
      badge: { en: 'Step 3 • Test Cycle', id: 'Langkah 3 • Siklus Uji', ja: 'ステップ3 • 試験サイクル' },
      title: {
        en: 'Dwell Time, Cycle Mode & Loading Sequence',
        id: 'Waktu Dwell, Mode Siklus & Urutan Pembebanan',
        ja: '荷重保持時間・動作モード・負荷シーケンス',
      },
      description: {
        en: 'Set Dwell Time (5–30 s) and toggle Cycle Mode between Auto Full Cycle and Manual Stepping. Click Start Test Cycle (or START on the machine panel); in Manual Stepping, click Apply Major Load once the minor preload stabilizes, or Reset anytime.',
        id: 'Atur Waktu Dwell (5–30 dtk) dan pilih Mode Siklus Otomatis Penuh atau Langkah Manual. Klik Mulai Siklus Pengujian; pada mode manual, klik Beban Utama setelah beban awal tercapai, atau Reset kapan saja.',
        ja: '荷重保持時間（5〜30秒）を設定し、全自動シーケンス／手動ステップを切り替えます。試験サイクル開始を押し、手動モードでは初荷重安定後に主荷重付加をクリックします。',
      },
      tip: {
        en: 'Follow the guidance strip beneath the C-frame machine SVG for live stage prompts.',
        id: 'Ikuti bilah panduan di bawah SVG mesin untuk melihat status tahapan pengujian.',
        ja: '試験機SVG下のガイド表示で現在のステージ（初荷重・保持・除荷・計測）を確認できます。',
      },
    },
    {
      id: 'hard-e140',
      badge: { en: 'Step 4 • ASTM E140', id: 'Langkah 4 • Konversi E140', ja: 'ステップ4 • ASTM E140 換算' },
      title: {
        en: 'ASTM E140 Scale Equivalence & Estimated UTS',
        id: 'Konversi Standar ASTM E140 & Perkiraan UTS',
        ja: 'ASTM E140 相互換算と推定引張強さ (UTS)',
      },
      description: {
        en: 'Inspect the ASTM E140 Conversion Equivalent card to compare HRC, HRB, HBW, and HV side by side, plus the Estimated Tensile Strength (UTS ≈ 3.45 × HBW) in MPa and ksi.',
        id: 'Periksa kartu Konversi Standar ASTM E140 untuk membandingkan nilai ekuivalen HRC, HRB, HBW, dan HV beserta Perkiraan Kekuatan Tarik (UTS ≈ 3,45 × HBW) dalam MPa dan ksi.',
        ja: 'ASTM E140 換算カードで HRC・HRB・HBW・HV の換算値と推定引張強さ（UTS ≈ 3.45 × HBW、MPa / ksi）を比較できます。',
      },
    },
    {
      id: 'hard-log',
      badge: { en: 'Step 5 • Inspection Log', id: 'Langkah 5 • Log Inspeksi', ja: 'ステップ5 • 検査ログ' },
      title: {
        en: 'Hardness Inspection Log & CSV Export',
        id: 'Log Pengujian Kekerasan & Ekspor CSV',
        ja: '硬さ測定検査ログと CSV 出力',
      },
      description: {
        en: 'Every completed test cycle appends a row to the Hardness Inspection Log with ID, scale, material, load, measured hardness, depth h (µm), Equiv HV, Est UTS, and VALID / OUT-RANGE status. Click Export CSV to download the report or Clear to reset.',
        id: 'Setiap siklus selesai otomatis tercatat ke Log Pengujian Kekerasan lengkap dengan ID, skala, material, beban, nilai kekerasan, kedalaman h (µm), Ekiv HV, Est UTS, dan status VALID / OUT-RANGE. Klik Ekspor CSV atau Hapus.',
        ja: '試験完了ごとに ID・尺度・材質・荷重・硬さ値・深さ h (µm)・HV換算・推定UTS・判定（VALID / OUT-RANGE）がログに記録されます。CSV出力やクリアも可能です。',
      },
    },
    {
      id: 'hard-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to switch between Explore, Practice, Quiz, and Reference. Test indenter selection, preload/major-load procedures, and ASTM E140 conversions in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi. Uji pemilihan indentor, prosedur beban awal/utama, dan konversi ASTM E140 di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・リファレンスを切り替え、圧子選定やASTM E140換算を演習とクイズで確認しましょう。',
      },
    },
  ],

  hydraulic: [
    {
      id: 'hyd-overview',
      badge: { en: 'Step 1 • Overview', id: 'Langkah 1 • Ringkasan', ja: 'ステップ1 • 概要' },
      title: {
        en: 'Hydraulic Power Unit, Gauges & Oscilloscope',
        id: 'Unit Daya Hidrolik, Pengukur & Osiloskop',
        ja: '油圧パワーユニット・圧力計・オシロスコープ',
      },
      description: {
        en: 'Operate a live 4/3 DCV hydraulic cylinder circuit with an interactive schematic, three synchronized pressure gauges (P1 — Pump, P2 — Cap End, P3 — Rod End), and a 15-second pressure/velocity oscilloscope.',
        id: 'Operasikan sirkuit silinder hidrolik 4/3 DCV dengan skematik interaktif, tiga pengukur tekanan tersinkronisasi (P1 — Pompa, P2 — Sisi Cap, P3 — Sisi Rod), dan osiloskop tekanan/kecepatan 15 detik.',
        ja: '4/3方向切換弁を備えた油圧シリンダ回路を操作し、3つの連動圧力計（P1 ポンプ・P2 キャップ側・P3 ロッド側）と15秒ローリングオシロスコープで過渡応答を観察します。',
      },
    },
    {
      id: 'hyd-dcv-valves',
      badge: { en: 'Step 2 • HPU & Valves', id: 'Langkah 2 • HPU & Katup', ja: 'ステップ2 • HPU・切換弁' },
      title: {
        en: 'HPU Power, 4/3 DCV, Pilot Check & Accumulator',
        id: 'Daya HPU, Katup 4/3 DCV, Pilot Check & Akumulator',
        ja: 'HPU電源・4/3 DCV・パイロットチェック・アキュムレータ',
      },
      description: {
        en: 'Toggle HPU Running / HPU Stopped and Reset Lab in the top bar. Shift the 4/3 Directional Control Valve between Extend, Neutral, and Retract (via buttons or the schematic), and toggle Load-Holding Pilot Check and N₂ Accumulator Surge Damping switches.',
        id: 'Nyalakan/matikan HPU atau klik Reset Lab di bilah atas. Geser Katup Arah 4/3 antara Maju, Netral, dan Mundur, serta aktifkan sakelar Pilot Check Penahan Beban dan Peredam Lonjakan Akumulator N₂.',
        ja: '上部バーで HPU 運転/停止やリセットを行い、4/3 DCV を伸び・中立・戻りに切り替えます。負荷保持パイロットチェック弁（中立時ドリフト防止）と N₂ アキュムレータサージ減衰スイッチも切り替えられます。',
      },
      tip: {
        en: 'Watch the oscilloscope spikes smooth out when N₂ Accumulator Surge Damping is enabled.',
        id: 'Amati lonjakan tekanan pada osiloskop mereda saat Peredam Lonjakan Akumulator N₂ diaktifkan.',
        ja: 'N₂ アキュムレータを有効にすると、DCV切換時などの圧力スパイクがオシロスコープ上で平滑化されます。',
      },
    },
    {
      id: 'hyd-sliders',
      badge: { en: 'Step 3 • Circuit Sliders', id: 'Langkah 3 • Slider Sirkuit', ja: 'ステップ3 • 回路パラメータ' },
      title: {
        en: 'Relief Pressure, Load, Meter-Out & Pump Flow',
        id: 'Tekanan Relief, Beban, Meter-Out & Debit Pompa',
        ja: 'リリーフ圧・負荷・メータアウト・ポンプ流量',
      },
      description: {
        en: 'Adjust Relief Cracking Pressure (20–210 bar), External Cylinder Load (0–80 kN), Meter-Out Needle Valve (10–100% open), and Pump Displacement Flow (10–60 L/min) to see how backpressure, relief bypass, and actuator speed interact.',
        id: 'Atur Tekanan Cracking Relief (20–210 bar), Beban Eksternal Silinder (0–80 kN), Katup Jarum Meter-Out (10–100% buka), dan Debit Pompa (10–60 L/min) untuk melihat interaksi tekanan balik, bypass relief, dan kecepatan silinder.',
        ja: 'リリーフ設定圧力（20〜210 bar）、シリンダ外部負荷（0〜80 kN）、メータアウト絞り弁（10〜100%開）、ポンプ吐出流量（10〜60 L/min）を調整し、背圧・リリーフバイパス・シリンダ速度の関係を調べます。',
      },
    },
    {
      id: 'hyd-faults-blind',
      badge: { en: 'Step 4 • Faults & Blind Test', id: 'Langkah 4 • Gangguan & Uji Buta', ja: 'ステップ4 • 故障・ブラインド診断' },
      title: {
        en: 'Maintenance Fault Injection & Blind Test',
        id: 'Injeksi Gangguan & Uji Buta Perawatan',
        ja: '保守故障シミュレーションとブラインド診断',
      },
      description: {
        en: 'Inject faults directly in Maintenance Fault Injection (normal, relief stuck open, cylinder seal bypass, suction cavitation) or click Blind Test to hide the fault. Shift the DCV, vary load, inspect P1/P2/P3 and speed, then select your diagnosis and click Verify Diagnosis.',
        id: 'Suntikkan gangguan pada panel Injeksi Gangguan atau klik Uji Buta untuk menyembunyikan gangguan. Geser DCV, ubah beban, amati P1/P2/P3 serta kecepatan, lalu pilih diagnosis Anda dan klik Verify Diagnosis.',
        ja: '保守故障パネルから異常（リリーフ開固着・シールバイパス・吸込キャビテーション）を注入するか、「ブラインド診断」を押して原因を隠した状態で挑戦できます。DCVや負荷を動かしてP1/P2/P3から診断し、Verify Diagnosis を押してください。',
      },
    },
    {
      id: 'hyd-thermal-readouts',
      badge: { en: 'Step 5 • Thermal & Power', id: 'Langkah 5 • Termal & Daya', ja: 'ステップ5 • 熱・流量テレメトリ' },
      title: {
        en: 'Thermal Telemetry & Live Power/Force Strip',
        id: 'Telemetri Termal & Kartu Daya/Debit/Gaya',
        ja: '熱・効率テレメトリと動力・推力表示',
      },
      description: {
        en: 'Monitor Thermal & Efficiency (ISO VG 46): Relief Heat Loss (kW), Oil Temperature (°C, alerts > 65 °C), Oil Viscosity (cSt), and System Efficiency (%). Below, read Hydraulic Power, Actuator Flow, Relief Bypass, Cylinder Speed, and Net Force.',
        id: 'Pantau panel Termal & Efisiensi (ISO VG 46): Rugi Panas Relief (kW), Suhu Oli (°C, peringatan > 65 °C), Viskositas Oli (cSt), dan Efisiensi Sistem (%). Di bawah, baca Daya Hidrolik, Debit Aktuator, Bypass Relief, Kecepatan Silinder, dan Gaya Netto.',
        ja: 'ISO VG 46 作動油の熱・効率テレメトリ（リリーフ熱損失、油温・65 °C超過過熱警告、動粘度 cSt、システム効率）および下部の油圧動力・アクチュエータ流量・リリーフバイパス・シリンダ速度・正味推力を監視します。',
      },
    },
    {
      id: 'hyd-modes',
      badge: { en: 'Step 6 • Modes & Shortcuts', id: 'Langkah 6 • Mode & Pintasan', ja: 'ステップ6 • モード・ショートカット' },
      title: {
        en: 'Explore, Practice, Quiz & Alt+1..4',
        id: 'Jelajah, Latihan, Kuis & Pintasan Alt+1..4',
        ja: '探索・演習・クイズ＆Alt+1..4',
      },
      description: {
        en: 'Use Alt+1..4 to switch between Explore, Practice, Quiz, and Formula reference. Apply Pascal’s law, meter-out speed control, and relief heat-loss diagnostics in Practice and Quiz.',
        id: 'Gunakan Alt+1..4 untuk berpindah antara Jelajah, Latihan, Kuis, dan Referensi Rumus. Terapkan hukum Pascal, kontrol kecepatan meter-out, dan diagnosis rugi panas relief di Latihan dan Kuis.',
        ja: 'Alt+1〜4で探索・演習・クイズ・公式リファレンスを切り替え、パスカルの原理やメータアウト制御・故障診断を演習とクイズで確認しましょう。',
      },
    },
  ],
};
