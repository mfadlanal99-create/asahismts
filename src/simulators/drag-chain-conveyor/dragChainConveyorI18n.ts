import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('drag-chain-conveyor', {
  id: {
    title: 'Konveyor Rantai En-Masse & Scraper',
    shortTitle: 'Konveyor Rantai',
    description:
      'Modelkan kapasitas angkut konveyor rantai drag en-masse dan scraper, tarikan rantai, daya penggerak, kelendutan katenari take-up ekor, serta kondisi gangguan seperti rantai kendur, flight patah, dan beban lebih shear pin.',
    explore: [
      {
        title: 'Prinsip Pengangkutan En-Masse & Kapasitas Laju Massa',
        summary:
          'Konveyor rantai drag en-masse memindahkan material curah di dalam casing persegi panjang tertutup sebagai satu sumbat kohesif yang kontinu. Karena tahanan geser internal antarpartikel lebih besar daripada gesekan dinding casing, seluruh lapisan material bergerak maju dengan fraksi tinggi (η ≈ 0,65–0,90) dari kecepatan rantai.',
        equations: [
          {
            label: 'Luas Penampang Lapisan Material',
            formula: 'A = (W / 1000) × (H / 1000)  [m²]',
            note: 'W = lebar casing (mm), H = tinggi lapisan material (mm)',
          },
          {
            label: 'Kapasitas Angkut Volumetrik',
            formula: 'Q_v = 3600 × A × v × η_eff  [m³/jam]',
            note: 'v = kecepatan rantai (m/s), η_eff = efisiensi angkut setelah koreksi kemiringan',
          },
          {
            label: 'Laju Aliran Massa',
            formula: 'ṁ = (Q_v × ρ) / 1000  [t/jam]',
            note: 'ρ = densitas curah (kg/m³)',
          },
        ],
        workedExample: {
          title: 'Laju Massa Biji-bijian Kering pada Konveyor En-Masse 320 mm',
          given: [
            'Lebar casing W = 320 mm, tinggi lapisan material H = 160 mm',
            'Kecepatan rantai v = 0,45 m/s, efisiensi efektif η_eff = 0,78',
            'Densitas curah ρ = 750 kg/m³ (horizontal, θ = 0°)',
          ],
          steps: [
            'Luas penampang: A = 0,320 × 0,160 = 0,0512 m²',
            'Aliran volumetrik: Q_v = 3600 × 0,0512 × 0,45 × 0,78 = 64,70 m³/jam',
            'Laju aliran massa: ṁ = (64,70 × 750) / 1000 = 48,53 t/jam',
          ],
          answer: 'ṁ ≈ 48,5 t/jam (Q_v = 64,7 m³/jam)',
        },
      },
      {
        title: 'Tarikan Rantai, Angkat Kemiringan & Daya Penggerak',
        summary:
          'Total tarikan rantai pada sproket penggerak kepala mengatasi gesekan luncur lapisan material dan rantai pada liner jalur bawa, gesekan jalur balik, serta komponen angkat gravitasi pada konveyor miring. Shear pin terkalibrasi pada hub sproket kepala melindungi rantai dan gearbox dari beban lebih akibat macet.',
        equations: [
          {
            label: 'Gaya Gesek Jalur Bawa & Balik',
            formula:
              'F_f = [(q_m + q_c)·μ + q_c·μ_ret] × L × g × cos(θ)  [N]',
            note: 'q_m, q_c = massa linier material dan rantai (kg/m); L = panjang (m)',
          },
          {
            label: 'Komponen Angkat Kemiringan',
            formula: 'F_lift = q_m × L × g × sin(θ)  [N]',
            note: 'θ = sudut kemiringan konveyor (derajat)',
          },
          {
            label: 'Daya Poros Kepala & Motor',
            formula: 'P_shaft = F_t × v  [kW],   P_motor = P_shaft / η_drive',
            note: 'F_t = total tarikan rantai (kN); η_drive ≈ 0,88 untuk gearbox + sproket',
          },
        ],
        workedExample: {
          title: 'Pemeriksaan Daya Penggerak Konveyor Horizontal 15 m',
          given: [
            'Total tarikan rantai F_t = 3,85 kN pada kecepatan rantai v = 0,45 m/s',
            'Efisiensi gearbox & penggerak η_drive = 0,88',
          ],
          steps: [
            'Daya poros kepala: P_shaft = 3,85 × 0,45 = 1,73 kW',
            'Kebutuhan daya motor: P_motor = 1,73 / 0,88 = 1,97 kW',
          ],
          answer: 'P_shaft = 1,73 kW; P_motor ≈ 1,97 kW (pilih motor 2,2 kW atau 3,0 kW)',
        },
      },
      {
        title: 'Tegangan Take-Up Ekor, Kelendutan Katenari & Diagnostik Gangguan',
        summary:
          'Penyetelan baut take-up ekor yang tepat menjaga kelendutan katenari terkontrol pada sisi balik—mencegah loncatan gigi sproket akibat rantai kendur sekaligus menghindari beban bantalan berlebih. Flight penggaruk yang patah memicu carryback berat, sedangkan sumbatan di corong keluar memicu lonjakan torsi yang memutus shear pin pengaman.',
        equations: [
          {
            label: 'Target Kelendutan Katenari Sisi Balik',
            formula: 'S_target ≈ 15 – 30 mm (atau ~1,5% – 2,5% dari bentang)',
            note: 'Kelendutan berlebih (> 38 mm) berisiko cambukan rantai dan loncatan gigi',
          },
          {
            label: 'Margin Proteksi Shear Pin',
            formula: 'Beban % = (F_t / F_pin) × 100%',
            note: 'Pin putus pada 100% untuk melindungi mata rantai dan reducer',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'dc-prac-1',
        prompt:
          'Konveyor en-masse memiliki lebar casing W = 400 mm dan tinggi lapisan material H = 150 mm. Berjalan pada v = 0,50 m/s dengan efisiensi efektif η_eff = 0,80 mengangkut biji-bijian berdensitas ρ = 750 kg/m³. Hitung laju aliran massa (dalam t/jam).',
        hint: 'Hitung A = 0,40 × 0,15 m², Q_v = 3600 × A × v × η_eff, lalu ṁ = Q_v × ρ / 1000.',
        unit: 't/jam',
        solutionSteps: [
          'Luas penampang: A = 0,40 × 0,15 = 0,060 m²',
          'Kapasitas volumetrik: Q_v = 3600 × 0,060 × 0,50 × 0,80 = 86,4 m³/jam',
          'Laju aliran massa: ṁ = (86,4 × 750) / 1000 = 64,8 t/jam',
        ],
      },
      {
        id: 'dc-prac-2',
        prompt:
          'Konveyor rantai scraper beroperasi dengan total tarikan rantai F_t = 6,20 kN pada kecepatan linier v = 0,60 m/s. Dengan efisiensi penggerak η_drive = 0,88, berapakah daya input motor yang dibutuhkan (dalam kW)?',
        hint: 'P_shaft = F_t × v, lalu bagi dengan 0,88.',
        unit: 'kW',
        solutionSteps: [
          'Daya poros: P_shaft = 6,20 kN × 0,60 m/s = 3,72 kW',
          'Daya input motor: P_motor = 3,72 / 0,88 = 4,227 kW ≈ 4,23 kW',
        ],
      },
      {
        id: 'dc-prac-3',
        prompt:
          'Konveyor dengan lebar casing W = 320 mm memiliki shear pin berkapasitas F_pin = 28,0 kN. Saat operasi normal, tarikan rantai sebesar 5,60 kN. Berapa persen kapasitas shear pin yang sedang terpakai (dalam %)?',
        hint: 'Bagi 5,60 dengan 28,0 lalu kalikan 100.',
        unit: '%',
        solutionSteps: ['Rasio beban = (5,60 / 28,0) × 100% = 20,0%'],
      },
    ],
    quiz: [
      {
        id: 'dc-quiz-1',
        question:
          'Mengapa konveyor rantai drag en-masse dapat memindahkan lapisan material yang lebih tebal dari tinggi flight penggaruknya?',
        options: [
          'Tahanan geser internal antarpartikel melebihi gesekan dinding casing sehingga lapisan material terkunci bergerak bersama',
          'Semburan udara bertekanan tinggi memfluidisasi material di sepanjang liner bawah',
          'Jalur rantai balik mendorong lapisan atas maju secara bersamaan',
          'Gaya sentrifugal dari sproket ekor melempar material ke kepala',
        ],
        explanation:
          'Pengangkutan en-masse mengandalkan kohesi geser internal antarpartikel curah yang lebih kuat daripada gesekan terhadap dinding baja casing yang halus.',
      },
      {
        id: 'dc-quiz-2',
        question:
          'Apakah gejala paling langsung dari flight penggaruk yang patah pada konveyor rantai tertutup?',
        options: [
          'Kecepatan rantai nol pada poros motor',
          'Penurunan tajam kapasitas angkut disertai carryback material berat di jalur balik',
          'Baut take-up ekor langsung terlalu kencang',
          'Penurunan densitas curah secara otomatis',
        ],
        explanation:
          'Flight yang patah atau bengkok gagal menyapu jalur bawa secara bersih dan menyeret material balik di sepanjang jalur return (carryback).',
      },
      {
        id: 'dc-quiz-3',
        question:
          'Apa fungsi utama shear pin pada hub sproket penggerak kepala?',
        options: [
          'Meningkatkan kecepatan rantai saat umpan hopper memuncak',
          'Melumasi gigi sproket penggerak secara otomatis',
          'Putus secara terencana saat terjadi sumbatan atau beban lebih untuk melindungi rantai dan gearbox',
          'Menyetel kelendutan katenari sisi balik',
        ],
        explanation:
          'Shear pin berfungsi sebagai sekring mekanis yang patah pada ambang torsi/tarikan terkalibrasi saat terjadi kemacetan di corong keluar.',
      },
      {
        id: 'dc-quiz-4',
        question:
          'Jika baut take-up ekor terlalu kendur (tegangan kurang), apa yang terjadi pada jalur rantai balik?',
        options: [
          'Kelendutan katenari berlebih yang berisiko cambukan rantai dan loncatan gigi sproket',
          'Tinggi lapisan material berlipat ganda otomatis',
          'Efisiensi gearbox naik di atas 100%',
          'Sudut kemiringan turun menjadi 0°',
        ],
        explanation:
          'Tegangan take-up yang kurang menyebabkan kelendutan katenari berlebih pada sisi balik sehingga memicu hentakan dan loncatan gigi sproket.',
      },
    ],
  },
  ja: {
    title: 'エンマス・スクレーパチェーンコンベヤ',
    shortTitle: 'チェーンコンベヤ',
    description:
      'エンマスおよびスクレーパ式ドラッグチェーンコンベヤの搬送量、チェーン張力、駆動動力、テールテークアップのたるみ量、およびチェーン弛み・フライト破損・シャーピン過負荷などの故障状態を解析します。',
    explore: [
      {
        title: 'エンマス搬送原理と質量流量',
        summary:
          'エンマス・ドラッグチェーンコンベヤは、密閉された角型ケーシング内で粉粒体を一体化した連続層として搬送します。粒子間の内部せん断抵抗がケーシング壁面摩擦より大きいため、材料層全体がチェーン速度の大きな割合（η ≈ 0.65〜0.90）で前進します。',
        equations: [
          {
            label: '材料層断面積',
            formula: 'A = (W / 1000) × (H / 1000)  [m²]',
            note: 'W = ケーシング幅 (mm), H = 材料層高さ (mm)',
          },
          {
            label: '体積搬送能力',
            formula: 'Q_v = 3600 × A × v × η_eff  [m³/h]',
            note: 'v = チェーン速度 (m/s), η_eff = 傾斜補正後の有効搬送効率',
          },
          {
            label: '質量流量',
            formula: 'ṁ = (Q_v × ρ) / 1000  [t/h]',
            note: 'ρ = かさ密度 (kg/m³)',
          },
        ],
        workedExample: {
          title: '320 mm エンマスコンベヤによる乾燥穀物の質量流量',
          given: [
            'ケーシング幅 W = 320 mm、材料層高さ H = 160 mm',
            'チェーン速度 v = 0.45 m/s、有効効率 η_eff = 0.78',
            'かさ密度 ρ = 750 kg/m³（水平、θ = 0°）',
          ],
          steps: [
            '断面積: A = 0.320 × 0.160 = 0.0512 m²',
            '体積流量: Q_v = 3600 × 0.0512 × 0.45 × 0.78 = 64.70 m³/h',
            '質量流量: ṁ = (64.70 × 750) / 1000 = 48.53 t/h',
          ],
          answer: 'ṁ ≈ 48.5 t/h（Q_v = 64.7 m³/h）',
        },
      },
      {
        title: 'チェーン張力・傾斜揚程・駆動動力',
        summary:
          'ヘッド駆動スプロケットの総張力は、搬送側の材料層およびチェーンの摺動摩擦、戻り側チェーン摩擦、および傾斜コンベヤにおける重力持ち上げ成分の合計に打ち勝つ必要があります。ヘッドスプロケットハブのシャーピンが詰まり過負荷からチェーンと減速機を保護します。',
        equations: [
          {
            label: '搬送側・戻り側摩擦力',
            formula:
              'F_f = [(q_m + q_c)·μ + q_c·μ_ret] × L × g × cos(θ)  [N]',
            note: 'q_m, q_c = 材料・チェーンの単位長さ質量 (kg/m)、L = 機長 (m)',
          },
          {
            label: '傾斜持ち上げ力',
            formula: 'F_lift = q_m × L × g × sin(θ)  [N]',
            note: 'θ = コンベヤ傾斜角 (deg)',
          },
          {
            label: 'ヘッド軸動力・モータ動力',
            formula: 'P_shaft = F_t × v  [kW],   P_motor = P_shaft / η_drive',
            note: 'F_t = 総チェーン張力 (kN)、η_drive ≈ 0.88（減速機＋スプロケット効率）',
          },
        ],
        workedExample: {
          title: '15 m 水平コンベヤの駆動動力確認',
          given: [
            '総チェーン張力 F_t = 3.85 kN、チェーン速度 v = 0.45 m/s',
            '減速機・駆動効率 η_drive = 0.88',
          ],
          steps: [
            'ヘッド軸動力: P_shaft = 3.85 × 0.45 = 1.73 kW',
            '所要モータ動力: P_motor = 1.73 / 0.88 = 1.97 kW',
          ],
          answer: 'P_shaft = 1.73 kW、P_motor ≈ 1.97 kW（2.2 kW または 3.0 kW モータ選定）',
        },
      },
      {
        title: 'テールテークアップ張力・たるみ量と故障診断',
        summary:
          '適切なテール側テークアップ調整により、戻り側のたるみを適正範囲に保ち、歯飛びと軸受過負荷の両方を防ぎます。フライト破損は戻り側への持ち帰り（キャリーバック）増大を引き起こし、排出口詰まりはシャーピンを破断させる急激なトルク上昇を招きます。',
        equations: [
          {
            label: '戻り側適正たるみ量',
            formula: 'S_target ≈ 15 – 30 mm（スパンの約 1.5% – 2.5%）',
            note: '過大なたるみ（> 38 mm）はチェーン暴れや歯飛びの原因',
          },
          {
            label: 'シャーピン保護負荷率',
            formula: 'Load % = (F_t / F_pin) × 100%',
            note: '100%でピンが破断しチェーンと減速機を保護',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'dc-prac-1',
        prompt:
          'ケーシング幅 W = 400 mm、材料層高さ H = 150 mm のエンマスコンベヤが、速度 v = 0.50 m/s、有効効率 η_eff = 0.80 でかさ密度 ρ = 750 kg/m³ の穀物を搬送しています。質量流量（t/h）を求めなさい。',
        hint: 'A = 0.40 × 0.15 m²、Q_v = 3600 × A × v × η_eff、ṁ = Q_v × ρ / 1000 で計算します。',
        unit: 't/h',
        solutionSteps: [
          '断面積: A = 0.40 × 0.15 = 0.060 m²',
          '体積流量: Q_v = 3600 × 0.060 × 0.50 × 0.80 = 86.4 m³/h',
          '質量流量: ṁ = (86.4 × 750) / 1000 = 64.8 t/h',
        ],
      },
      {
        id: 'dc-prac-2',
        prompt:
          'スクレーパチェーンコンベヤが総チェーン張力 F_t = 6.20 kN、速度 v = 0.60 m/s で運転しています。駆動効率 η_drive = 0.88 のとき、必要なモータ入力動力（kW）を求めなさい。',
        hint: 'P_shaft = F_t × v を計算し、0.88 で割ります。',
        unit: 'kW',
        solutionSteps: [
          '軸動力: P_shaft = 6.20 kN × 0.60 m/s = 3.72 kW',
          'モータ入力動力: P_motor = 3.72 / 0.88 = 4.227 kW ≈ 4.23 kW',
        ],
      },
      {
        id: 'dc-prac-3',
        prompt:
          'ケーシング幅 W = 320 mm のコンベヤのシャーピン定格は F_pin = 28.0 kN です。通常運転時のチェーン張力が 5.60 kN のとき、シャーピン容量の使用率（%）はいくつですか。',
        hint: '5.60 ÷ 28.0 × 100 を計算します。',
        unit: '%',
        solutionSteps: ['負荷率 = (5.60 / 28.0) × 100% = 20.0%'],
      },
    ],
    quiz: [
      {
        id: 'dc-quiz-1',
        question:
          'エンマス・ドラッグチェーンコンベヤがスクレーパフライトの高さより厚い材料層を搬送できる理由はどれですか。',
        options: [
          '粒子間の内部せん断抵抗がケーシング壁面摩擦より大きく、材料層が一体となって動くため',
          '底部ライナから高圧空気が材料を流動化させるため',
          '戻り側チェーンが上層を同時に押し出すため',
          'テールスプロケットの遠心力で材料をヘッドへ飛ばすため',
        ],
        explanation:
          'エンマス搬送は、平滑な鋼製ケーシング壁面との摩擦よりも粒子同士の内部せん断結合力が大きい性質を利用しています。',
      },
      {
        id: 'dc-quiz-2',
        question:
          '密閉型ドラッグチェーンコンベヤでスクレーパフライトが破損した際の最も直接的な症状はどれですか。',
        options: [
          'モータ軸の回転速度がゼロになる',
          '搬送量の急激な低下と、戻り側への大量の持ち帰り（キャリーバック）発生',
          'テールテークアップねじが即座に過緊張になる',
          '材料のかさ密度が自動的に低下する',
        ],
        explanation:
          'フライトが折損・変形すると搬送面をきれいに掻き取れず、排出されなかった材料が戻り側へ引き戻されます。',
      },
      {
        id: 'dc-quiz-3',
        question:
          'ヘッド駆動スプロケットハブに設けられたシャーピンの主な目的は何ですか。',
        options: [
          'ホッパ供給ピーク時にチェーン速度を上げるため',
          '駆動スプロケット歯面を自動潤滑するため',
          '詰まりや過負荷時に意図的に破断し、チェーンや減速機の重大損傷を防ぐため',
          '戻り側のたるみ量を自動調整するため',
        ],
        explanation:
          'シャーピンは機械的ヒューズとして機能し、排出口詰まりなどで規定値以上のトルクが発生した際に破断して装置を保護します。',
      },
      {
        id: 'dc-quiz-4',
        question:
          'テール側テークアップねじが緩すぎる（張力不足）場合、戻り側チェーンに何が起こりますか。',
        options: [
          '過大なたるみが生じ、チェーンの暴れやスプロケットの歯飛びの危険が高まる',
          '材料層高さが自動的に2倍になる',
          '減速機効率が100%を超える',
          '傾斜角が0°に戻る',
        ],
        explanation:
          'テークアップ張力不足により戻り側のたるみが大きくなると、チェーンのバタつきやスプロケット歯飛びが発生しやすくなります。',
      },
    ],
  },
});
