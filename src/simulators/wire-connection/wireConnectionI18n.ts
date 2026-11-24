import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('wire-connection', {
  id: {
    title: 'Lab Terminasi & Sambungan Kabel Listrik',
    shortTitle: 'Terminasi Kabel Listrik',
    description:
      'Laboratorium interaktif terminasi kabel listrik meliputi blok terminal rel DIN, sepatu kabel (lug) motor, sambungan kabel (splice), dan pembumian (PE). Analisis resistansi kontak, pemanasan I²R, torsi pengencangan, panjang pengupasan isolasi PVC, uji tarik IEC 60999-1, serta audit gangguan instalasi.',
    explore: [
      {
        title: '1. Resistansi Kontak, Drop Tegangan & Pemanasan Termal I²R',
        summary:
          'Setiap terminasi kabel menimbulkan resistansi kontak (R_c). Saat dialiri arus beban (I), kenaikan kecil dari 0,3 mΩ (skun ferrule atau sepatu kabel terkrimping baik) menjadi 25 mΩ (sekrup kendur atau isolasi PVC terjepit) melipatgandakan panas sebesar I²R, memicu oksidasi terminal, pelelehan isolasi, percikan busur mikro, hingga kebakaran listrik.',
        equations: [
          {
            label: 'Drop Tegangan Sambungan (Hukum Ohm)',
            formula: 'ΔV = I · R_c   [mV = A · mΩ]',
            note: 'Pada arus 25 A, sambungan 0,4 mΩ hanya menimbulkan drop tegangan 10 mV, sedangkan sambungan kendur 20 mΩ menghasilkan 500 mV.',
          },
          {
            label: 'Disipasi Daya Termal Sambungan (Pemanasan Joule)',
            formula: 'P_loss = I² · R_c / 1000   [W]',
            note: 'Karena panas berbanding lurus dengan kuadrat arus (I²), menggandakan arus beban meningkatkan panas hingga empat kali lipat.',
          },
        ],
        workedExample: {
          title: 'Perbandingan Terminal Sehat vs Terminal Kendur pada Beban 30 A',
          given: [
            'Arus beban I = 30 A',
            'Sambungan skun ferrule sehat R_c1 = 0,3 mΩ',
            'Sambungan kabel telanjang kurang torsi R_c2 = 18,0 mΩ',
          ],
          steps: [
            'Rugi daya sambungan sehat: P1 = (30² × 0,3) / 1000 = 0,27 W (kenaikan suhu ~2 °C).',
            'Drop tegangan sambungan kendur: ΔV2 = 30 × 18,0 = 540 mV.',
            'Rugi daya sambungan kendur: P2 = (30² × 18,0) / 1000 = 16,20 W — titik panas lokal melampaui 150 °C!',
          ],
          answer: 'Sehat = 0,27 W | Kendur = 16,20 W (60× lebih panas)',
        },
      },
      {
        title: '2. Metode Terminasi: Skun Ferrule, Sepatu Kabel (Lug), Wago & Risiko Timah Solder',
        summary:
          'Penghantar tembaga serabut halus wajib disatukan sebelum dijepit sekrup terminal. Skun Ferrule dan Sepatu Kabel (Lug) yang dikrimping menghasilkan ikatan kedap gas dan kuat tarik tinggi. Sebaliknya, ujung kabel berlapis timah solder mengalami mulur dingin (cold-flow creep) di bawah tekanan sekrup sehingga sambungan berangsur kendur. Sambungan puntir dengan isolasi PVC dilarang pada panel industri.',
        equations: [
          {
            label: 'Gaya Uji Tarik Minimum IEC 60999-1',
            formula: 'F_tarik ≥ 40 N (1,5 mm²) | 50 N (2,5 mm²) | 60 N (4 mm²) | 80 N (6 mm²) | 90 N (10 mm²)',
            note: 'Krimping dan torsi pengencangan yang benar harus lolos uji tarik mekanis tanpa selip serabut.',
          },
          {
            label: 'Urutan Ring (Washer) yang Benar pada Baut Terminal',
            formula: 'Pelat/Busbar → Sepatu Kabel (Lug) → Ring Datar → Ring Per/Bintang → Mur Heksagonal',
            note: 'Jangan pernah meletakkan ring per di antara lug dan busbar karena mengurangi luas kontak dan menaikkan R_c.',
          },
        ],
        workedExample: {
          title: 'Menentukan Panjang Kupas & Torsi Pengencangan Kabel Kontrol 2,5 mm²',
          given: [
            'Penghantar: Tembaga serabut 2,5 mm² pada blok terminal rel DIN',
            'Metode terminasi: Skun Ferrule berisolasi',
          ],
          steps: [
            'Kupas isolasi PVC sepanjang 8–10 mm agar tembaga memenuhi selongsong ferrule tanpa mencuat keluar.',
            'Krimping menggunakan tang krimping ratchet terkalibrasi lalu masukkan penuh ke penjepit terminal.',
            'Kencangkan dengan obeng torsi pada 0,8–1,2 N·m (hindari penjepitan isolasi PVC atau putusnya serabut).',
          ],
          answer: 'Kupas 9 mm, Krimping Skun Ferrule, Torsi 1,0 N·m (Uji Tarik > 50 N)',
        },
      },
      {
        title: '3. Pembumian (PE) & Terminasi Perisai EMC',
        summary:
          'Baut Pembumian (PE) harus menyalurkan arus gangguan dengan aman agar pemutus daya trip tanpa menimbulkan tegangan sentuh berbahaya. Lapisan cat atau powder-coating pada panel bersifat isolator; cat wajib dikupas hingga logam bersih sebelum mengencangkan sepatu kabel PE. Pada kabel motor VFD/servo, klem perisai EMC 360° mengikat derau frekuensi tinggi langsung ke sasis.',
        equations: [
          {
            label: 'Target Resistansi Kontinuitas PE (IEC 60204-1)',
            formula: 'R_PE < 100 mΩ (umumnya < 1,0 mΩ pada baut bersih)',
            note: 'Lapisan cat yang tidak dikupas menambah resistansi >40 mΩ–1000 mΩ dan menggagalkan proteksi gangguan tanah.',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'wire-p1',
        prompt:
          'Sebuah terminal sepatu kabel (lug) motor yang kendur memiliki resistansi kontak 15 mΩ saat mengalirkan arus 20 A. Hitung drop tegangan pada sambungan tersebut dalam milivolt (mV).',
        hint: 'Gunakan ΔV (mV) = I (A) × R_c (mΩ).',
        solutionSteps: [
          'Terapkan Hukum Ohm dalam satuan miliohm: ΔV = I × R_c.',
          'ΔV = 20 A × 15 mΩ = 300 mV (0,30 V).',
        ],
      },
      {
        id: 'wire-p2',
        prompt:
          'Dengan sambungan kendur 15 mΩ dan arus 20 A yang sama, hitung disipasi daya panas lokal dalam satuan Watt (W).',
        hint: 'Gunakan P_loss = (I² × R_c) / 1000.',
        solutionSteps: [
          'Konversi R_c = 15 mΩ = 0,015 Ω.',
          'P_loss = I² × R = (20)² × 0,015 = 400 × 0,015 = 6,0 W.',
        ],
      },
      {
        id: 'wire-p3',
        prompt:
          'Jika arus beban pada sambungan bermasalah 10 mΩ berlipat ganda dari 15 A menjadi 30 A, hitung disipasi daya panas barunya dalam Watt (W).',
        hint: 'P_loss = (30² × 10) / 1000.',
        solutionSteps: [
          'Pada 15 A: P = 15² × 0,010 = 2,25 W.',
          'Pada 30 A: P = 30² × 0,010 = 900 × 0,010 = 9,0 W (4× lebih panas).',
        ],
      },
      {
        id: 'wire-p4',
        prompt:
          'Menurut standar IEC 60999-1, berapa gaya uji tarik mekanis minimum (N) untuk terminasi kabel berpenampang 4 mm²?',
        hint: 'Periksa tabel uji tarik IEC 60999-1 pada bagian Eksplorasi 2 (40, 50, 60, 80, 90 N).',
        solutionSteps: [
          'Ambang uji tarik minimum IEC 60999-1: 1,5 mm² → 40 N, 2,5 mm² → 50 N, 4 mm² → 60 N.',
          'Dengan demikian, terminasi 4 mm² harus menahan gaya tarik minimal 60 N.',
        ],
      },
    ],
    quiz: [
      {
        id: 'wire-q1',
        question:
          'Mengapa pelapisan timah solder pada ujung kabel serabut sebelum dijepit sekrup terminal dilarang pada panel kontrol industri?',
        options: [
          'Timah meningkatkan konduktivitas tembaga terlalu tinggi',
          'Timah mengalami mulur dingin (creep) di bawah tekanan sekrup sehingga sambungan kendur dan panas berlebih',
          'Timah menghalangi sekrup untuk berputar',
          'Timah bersifat magnetis dan memicu arus pusar',
        ],
        explanation:
          'Timah solder mengalami deformasi plastis (mulur) di bawah tekanan penjepitan terus-menerus, sehingga tekanan kontak turun dan memicu titik panas resistansi tinggi.',
      },
      {
        id: 'wire-q2',
        question:
          'Manakah urutan pemasangan perangkat keras yang benar saat mengencangkan sepatu kabel (ring lug) pada baut terminal motor?',
        options: [
          'Pelat Terminal → Ring Per → Sepatu Kabel → Ring Datar → Mur',
          'Pelat Terminal → Ring Datar → Sepatu Kabel → Mur',
          'Pelat Terminal → Sepatu Kabel (Lug) → Ring Datar → Ring Per → Mur',
          'Pelat Terminal → Mur → Sepatu Kabel → Ring Per',
        ],
        explanation:
          'Sepatu kabel (lug) harus menempel langsung pada pelat busbar untuk luas kontak maksimal, diikuti ring datar, ring per pengunci, lalu mur.',
      },
      {
        id: 'wire-q3',
        question:
          'Saat inspeksi pra-komisioning, teknisi mengupas isolasi PVC hanya sepanjang 3 mm lalu menjepitkannya ke blok terminal. Apa mode kegagalan utamanya?',
        options: [
          'Isolasi PVC terjepit: sekrup menekan plastik PVC sehingga resistansi kontak tinggi dan gagal uji tarik',
          'Loncatan api akibat tembaga terbuka berlebih',
          'Kopling perisai EMC 360°',
          'Serabut putus akibat torsi berlebih',
        ],
        explanation:
          'Pengupasan yang terlalu pendek menyebabkan penjepit menggigit jaket isolasi PVC alih-alih tembaga/ferrule, memicu sambungan resistansi tinggi dan gagal uji tarik.',
      },
      {
        id: 'wire-q4',
        question:
          'Saat memasang sepatu kabel Pembumian (PE) pada bodi panel baja berlapis powder-coating, langkah apa yang wajib dilakukan sebelum mengencangkan mur?',
        options: [
          'Membungkus cat dengan isolasi PVC',
          'Mengupas lapisan cat hingga logam bersih (atau memakai ring bergigi penembus cat) agar kontinuitas PE terjamin',
          'Memakai kabel berlapis timah solder tanpa sepatu kabel',
          'Mengencangkan dengan torsi 0,2 N·m agar cat tidak tergores',
        ],
        explanation:
          'Cat dan powder-coating merupakan isolator listrik. Kontak langsung logam-ke-logam wajib dipenuhi untuk kontinuitas arus gangguan PE.',
      },
      {
        id: 'wire-q5',
        question:
          'Masalah terminasi manakah yang langsung menimbulkan bahaya sengatan listrik dan hubung singkat antar-fasa di luar rumah terminal?',
        options: [
          'Penggunaan skun ferrule',
          'Panjang kupas isolasi berlebih sehingga tembaga telanjang mencuat keluar dari rumah terminal',
          'Penggunaan obeng torsi terkalibrasi',
          'Pengikatan perisai EMC 360° ke pembumian PE',
        ],
        explanation:
          'Pengupasan isolasi yang terlalu panjang menyisakan tembaga telanjang bertegangan di luar pelindung terminal, berisiko tersentuh dan memicu busur api.',
      },
    ],
  },
  ja: {
    title: '電線接続・終端処理ラボ',
    shortTitle: '電線終端ラボ',
    description:
      'DINレール端子台、モータ端子スタッド（丸形圧着端子）、電線スプライス、保護接地（PE）ボンディングを扱う対話型実習ラボ。接触抵抗、I²Rジュール発熱、締付トルク、被覆剥き長さ、IEC 60999-1引張試験、現場の施工不良診断を解析します。',
    explore: [
      {
        title: '1. 接触抵抗・電圧降下・I²R熱暴走',
        summary:
          'すべての電線接続部には接触抵抗（R_c）が存在します。負荷電流（I）が流れると、適正圧着の 0.3 mΩ から緩みや被覆噛み込みによる 25 mΩ への増加だけでも I²R 発熱が急増し、酸化劣化、被覆溶融、微小アーク放電、電気火災を引き起こします。',
        equations: [
          {
            label: '接続部の電圧降下（オームの法則）',
            formula: 'ΔV = I · R_c   [mV = A · mΩ]',
            note: '25 A 通電時、0.4 mΩ では 10 mV の降下ですが、20 mΩ の緩みでは 500 mV に達します。',
          },
          {
            label: '接続部の電力損失（ジュール熱）',
            formula: 'P_loss = I² · R_c / 1000   [W]',
            note: '発熱は電流の二乗（I²）に比例するため、電流が2倍になると発熱量は4倍になります。',
          },
        ],
        workedExample: {
          title: '30 A負荷時における正常端子と緩み端子の比較',
          given: [
            '負荷電流 I = 30 A',
            '正常なフェルール圧着接続 R_c1 = 0.3 mΩ',
            '締付トルク不足の裸より線接続 R_c2 = 18.0 mΩ',
          ],
          steps: [
            '正常接続の損失：P1 = (30² × 0.3) / 1000 = 0.27 W（温度上昇約 2 °C）。',
            '緩み接続の電圧降下：ΔV2 = 30 × 18.0 = 540 mV。',
            '緩み接続の損失：P2 = (30² × 18.0) / 1000 = 16.20 W — 局所温度は 150 °C を超過！',
          ],
          answer: '正常 = 0.27 W | 緩み = 16.20 W（発熱量 60倍）',
        },
      },
      {
        title: '2. 終端処理方式：フェルール・丸形圧着端子・レバーコネクタ・予備はんだの危険性',
        summary:
          '細より線銅導体はねじ端子で締める前に結束する必要があります。棒端子（フェルール）や丸形圧着端子は気密圧着と高い引張保持力を確保します。一方、予備はんだ処理はねじ圧力下でクリープ（塑性流動）を起こし経時的に緩みます。ねじり＋ビニールテープ接続は産業用制御盤では禁止されています。',
        equations: [
          {
            label: 'IEC 60999-1 最小引張保持力',
            formula: 'F_pull ≥ 40 N (1.5 mm²) | 50 N (2.5 mm²) | 60 N (4 mm²) | 80 N (6 mm²) | 90 N (10 mm²)',
            note: '適正な圧着とトルク管理により、素線抜けなく引張試験に合格する必要があります。',
          },
          {
            label: 'スタッド端子の正しいワッシャ積層順序',
            formula: 'ブスバー → 丸形圧着端子 → 平ワッシャ → ばね座金 → 六角ナット',
            note: '端子とブスバーの間にばね座金を入れると接触面積が減少し R_c が増加します。',
          },
        ],
        workedExample: {
          title: '2.5 mm² 制御配線の被覆剥き長さと締付トルク選定',
          given: [
            '導体：2.5 mm² より線銅導体（DINレールねじ端子）',
            '処理方式：絶縁スリーブ付フェルール',
          ],
          steps: [
            '銅線がフェルール先端まで届き露出しないよう PVC 被覆を 8〜10 mm 剥きます。',
            '校正済みラチェット圧着工具で圧着し、クランプ奥まで挿入します。',
            'トルクドライバーで 0.8〜1.2 N·m に締め付けます（被覆噛み込み・素線断線を防止）。',
          ],
          answer: '剥き長さ 9 mm、フェルール圧着、トルク 1.0 N·m（引張 > 50 N）',
        },
      },
      {
        title: '3. 保護接地（PE）ボンディングとEMCシールド処理',
        summary:
          '保護接地（PE）スタッドは地絡電流を安全に流し遮断器を動作させる必要があります。粉体塗装や塗膜は絶縁体となるため、PE端子締付前に塗装を剥離して地金露出させる必要があります。VFDやサーボケーブルでは 360° EMCシールドクランプで高周波ノイズを筐体へ接地します。',
        equations: [
          {
            label: 'PE導通抵抗目標値（IEC 60204-1）',
            formula: 'R_PE < 100 mΩ（清浄なスタッド部では通常 < 1.0 mΩ）',
            note: '塗装未剥離では 40 mΩ〜1000 mΩ 以上となり地絡保護が機能しません。',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'wire-p1',
        prompt:
          '緩んだモータ端子ラグの接触抵抗が 15 mΩ で、20 A の電流が流れています。接続部の電圧降下（mV）を計算してください。',
        hint: 'ΔV (mV) = I (A) × R_c (mΩ) を使用します。',
        solutionSteps: [
          'ミリオーム単位でオームの法則を適用：ΔV = I × R_c。',
          'ΔV = 20 A × 15 mΩ = 300 mV (0.30 V)。',
        ],
      },
      {
        id: 'wire-p2',
        prompt:
          '同じ 15 mΩ の緩み接続に 20 A が流れる場合の局所発熱電力（W）を計算してください。',
        hint: 'P_loss = (I² × R_c) / 1000 を使用します。',
        solutionSteps: [
          'R_c = 15 mΩ = 0.015 Ω に変換。',
          'P_loss = I² × R = (20)² × 0.015 = 400 × 0.015 = 6.0 W。',
        ],
      },
      {
        id: 'wire-p3',
        prompt:
          '10 mΩ の不良接続を流れる負荷電流が 15 A から 30 A に倍増した場合、新しい発熱電力（W）はいくらになりますか？',
        hint: 'P_loss = (30² × 10) / 1000 を計算します。',
        solutionSteps: [
          '15 A 時：P = 15² × 0.010 = 2.25 W。',
          '30 A 時：P = 30² × 0.010 = 900 × 0.010 = 9.0 W（発熱量 4倍）。',
        ],
      },
      {
        id: 'wire-p4',
        prompt:
          'IEC 60999-1 規格において、断面積 4 mm² 導体の終端接続に求められる最小機械的引張保持力（N）はいくらですか？',
        hint: '探求セクション2の IEC 60999-1 表（40, 50, 60, 80, 90 N）を確認してください。',
        solutionSteps: [
          'IEC 60999-1 最小引張保持力：1.5 mm² → 40 N、2.5 mm² → 50 N、4 mm² → 60 N。',
          'したがって 4 mm² の接続は 60 N 以上に耐える必要があります。',
        ],
      },
    ],
    quiz: [
      {
        id: 'wire-q1',
        question:
          '産業用制御盤のねじ端子において、より線の先端に予備はんだを施すことが禁止されている理由はどれですか？',
        options: [
          'はんだが銅の導電率を上げすぎるため',
          'はんだがねじ圧力下でクリープ（塑性流動）を起こし、接続が緩んで過熱するため',
          'はんだがねじの回転を妨げるため',
          'はんだが磁性を帯びて渦電流を生じるため',
        ],
        explanation:
          'はんだは持続的な締付圧力のもとでクリープ変形するため、時間とともに接触圧力が低下し高抵抗のホットスポットを生じます。',
      },
      {
        id: 'wire-q2',
        question:
          'モータ端子スタッドに丸形圧着端子を取り付ける際の正しいハードウェア積層順序はどれですか？',
        options: [
          '端子台座 → ばね座金 → 丸形端子 → 平ワッシャ → ナット',
          '端子台座 → 平ワッシャ → 丸形端子 → ナット',
          '端子台座 → 丸形圧着端子 → 平ワッシャ → ばね座金 → 六角ナット',
          '端子台座 → ナット → 丸形端子 → ばね座金',
        ],
        explanation:
          '接触面積を最大化するため丸形圧着端子を台座に直接当て、その上に平ワッシャ、ばね座金、六角ナットの順に組み付けます。',
      },
      {
        id: 'wire-q3',
        question:
          '試運転前点検で、PVC被覆を 3 mm しか剥がさずに端子台へ締め付けた場合、主な故障モードは何ですか？',
        options: [
          '被覆噛み込み：ねじがPVC被覆を挟み込み、高接触抵抗および引張試験不合格となる',
          '銅線過露出によるフラッシュオーバー',
          '360° EMCシールド結合',
          '過トルクによる素線破断',
        ],
        explanation:
          '剥き長さが不足するとクランプが導体ではなくPVC被覆を噛み込み、導通不良と引張抜けを引き起こします。',
      },
      {
        id: 'wire-q4',
        question:
          '粉体塗装された鋼製盤筐体に保護接地（PE）丸形端子を接続する際、ナット締め付け前に必ず行うべき作業はどれですか？',
        options: [
          '塗装の上からPVC絶縁テープを巻く',
          '塗装を剥がして地金金属を露出させる（または塗装貫通型歯付座金を使用する）',
          '端子なしで予備はんだ電線を使う',
          '塗装を傷つけないよう 0.2 N·m で締める',
        ],
        explanation:
          '塗料や粉体塗装は絶縁体であるため、確実なPE地絡電流経路には金属同士の直接接触が不可欠です。',
      },
      {
        id: 'wire-q5',
        question:
          '端子ハウジングの外側で即座に感電および相間短絡フラッシュオーバーの危険を生じる施工不良はどれですか？',
        options: [
          'フェルールの使用',
          '被覆剥き長さ過大により裸銅線が端子外部へ露出している状態',
          '校正済みトルクドライバーの使用',
          'EMCシールドの360°接地',
        ],
        explanation:
          '被覆を剥きすぎると充電部の裸銅線が保護ハウジング外へ露出し、接触感電やアーク短絡の危険が生じます。',
      },
    ],
  },
});
