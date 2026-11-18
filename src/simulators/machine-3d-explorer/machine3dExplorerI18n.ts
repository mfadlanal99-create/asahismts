import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('machine-3d-explorer', {
  id: {
    title: 'Inspektor Perakitan & Exploded View 3D Mesin',
    shortTitle: 'Eksplorer 3D Mesin',
    description:
      'Penjelajah rakitan CAD 3D 360° & tampilan meledak (exploded view) untuk tiga mesin industri: Pompa Proses Sentrifugal ANSI/ISO, Konveyor Sabuk Trough CEMA, dan Konveyor Rantai Penggaruk & En-Masse (Drag Chain). Putar bebas 360°, perbesar, animasikan urutan bongkar-pasang, aktifkan X-Ray casing, dan klik komponen 3D mana saja untuk pop-up info material, mode kerusakan, dan torsi.',
    explore: [
      {
        title: 'Arsitektur Back-Pull-Out Pompa Sentrifugal Overhung',
        summary:
          'Pompa proses kimia ANSI B73.1 / ISO 2858 menggunakan rangka desain back-pull-out. Seluruh komponen putar—impeller, mechanical seal cartridge, poros, dan kedua bearing—terpasang bersama tutup belakang dan rumah bearing sehingga teknisi dapat menarik unit rotor ke belakang tanpa melepas pipa isap dan tekan dari volute casing.',
        equations: [
          {
            label: 'Perkiraan Gaya Radial Hidrolik (Volute)',
            formula: 'F_r = K_r × P_d × D_2 × B_2  [N]',
            note: 'K_r = faktor gaya radial (terbesar di dekat katup tutup Q = 0); D_2 = diameter luar impeller; B_2 = lebar keluar sudu.',
          },
          {
            label: 'Gaya Dorong Aksial Netto ke Sisi Isap',
            formula: 'F_a ≈ (P_d - P_s) × A_eye - F_balance',
            note: 'Ditahan oleh pasangan bearing kontak sudut duplex 40° (7309 DB) di sisi outboard.',
          },
        ],
        workedExample: {
          title: 'Menghitung Pemuaian Poros vs. Kebebasan Bearing',
          given: [
            'Jarak sumbu antara bearing inboard 6309 dan outboard 7309 pada poros baja: L = 240 mm',
            'Kenaikan suhu operasi poros: ΔT = 45 °C, koefisien muai α = 11,7 × 10⁻⁶ /°C',
          ],
          steps: [
            'Hitung pemuaian aksial poros antar bearing: ΔL = L × α × ΔT',
            'ΔL = 240 × (11,7 × 10⁻⁶) × 45 = 0,126 mm',
            'Karena outer race bearing 6309 dibiarkan bebas bergeser aksial di lubang H7, pemuaian 0,126 mm diserap tanpa menjepit bearing.',
          ],
          answer: 'ΔL = 0,126 mm diserap aman oleh floating radial bearing inboard.',
        },
      },
      {
        title: 'Celah Wear Ring & Kebersihan Bilas Mechanical Seal',
        summary:
          'Tekanan tinggi di volute bocor kembali ke mata isap impeller melewati celah wear ring. Keausan celah radial berlebih meningkatkan resirkulasi internal dan menurunkan head serta efisiensi pompa. Sementara itu, cartridge mechanical seal bergantung pada lapisan film cairan bersih dari port API Plan 11.',
        equations: [
          {
            label: 'Ekspansi Pemanasan Induksi untuk Pemasangan Bearing',
            formula: 'Δd = d × α × ΔT  [mm]',
            note: 'Gunakan pemanas induksi maksimal 110 °C agar inner race masuk halus ke poros 45 mm (k5) tanpa memukul bola bearing.',
          },
          {
            label: 'Perkiraan Torsi Baut Flens Casing (Pola Bintang)',
            formula: 'T = K × d_baut × F_preload  [N·m]',
            note: 'Faktor mur K ≈ 0,18 saat ulir stainless dilumasi nickel anti-seize.',
          },
        ],
      },
      {
        title: 'Urutan Pembongkaran Bertahap & Inspeksi Perakitan',
        summary:
          'Overhaul yang aman mengikuti tahapan: Tahap 1 mengisolasi energi, menguras cairan casing, melepas hub kopling, menarik unit rotor dan mur impeller. Tahap 2 melepas impeller, wear ring, dan pelat penutup seal. Tahap 3 mengeluarkan cartridge mechanical seal serta memeriksa kelurusan poros (≤ 0,025 mm TIR).',
        equations: [
          {
            label: 'Batas Runout Poros & Offset Alignment Kopling',
            formula: 'TIR_poros ≤ 0,025 mm  |  Offset_laser ≤ 0,05 mm',
            note: 'Runout berlebih mengikis muka karbon mechanical seal dan memicu getaran puncak 1× / 2× RPM.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          'Sebuah poros pompa stainless 17-4PH memiliki jarak antar bantalan L = 320 mm antara thrust bearing tetap dan radial bearing apung. Dengan α = 11,7 × 10⁻⁶ /°C serta kenaikan suhu operasi ΔT = 50 °C, hitung pemuaian aksial poros ΔL (dalam mm).',
        hint: 'Gunakan ΔL = L × α × ΔT = 320 × 0,0000117 × 50.',
      },
      {
        prompt:
          'Bearing inboard 6309 C3 berdiameter lubang 45 mm dipanaskan dengan induction heater dari 25 °C ke 110 °C (ΔT = 85 °C), dengan α = 11,5 × 10⁻⁶ /°C. Hitung pertambahan diameter lubang Δd dalam mikrometer (µm).',
        hint: 'Δd(µm) = d(mm) × 1000 × α × ΔT = 45.000 × 11,5e-6 × 85.',
      },
      {
        prompt:
          'Wear ring casing yang aus memiliki diameter dalam 140,84 mm sedangkan permukaan leher impeller berdiameter luar 139,60 mm. Hitung celah lari RADIAL saat ini (dalam mm).',
        hint: 'Celah radial = (ID Wear Ring − OD Impeller) / 2.',
      },
    ],
    quiz: [
      {
        question:
          'Mengapa radial bearing 6309 sisi inboard dibiarkan bergerak bebas secara aksial di dalam housing sementara pasangan thrust bearing 7309 sisi outboard dikunci rapat?',
        options: [
          'Agar poros baja dapat memuai secara aksial saat suhu kerja naik tanpa menjepit atau merusak lintasan bola bearing',
          'Agar impeller dapat bergoyang mundur untuk meredam pukulan kavitasi',
          'Karena bearing 6309 tidak tahan pelumasan oli bila dikunci',
          'Agar kedua muka mechanical seal merenggang pada RPM tinggi',
        ],
        explanation:
          'Susunan bearing fixed-floating mengunci posisi aksial di sisi outboard (7309 duplex) dan membebaskan outer race 6309 meluncur di lubang H7 saat poros memuai panas.',
      },
      {
        question:
          'Saat memasang Cartridge Mechanical Seal (#06) pada poros pompa sentrifugal, kapan klip pengatur jarak (setting clips warna merah) HARUS dilepas?',
        options: [
          'Sebelum cartridge dimasukkan ke poros agar gland duduk rata',
          'HANYA SETELAH baut gland plate dan sekrup pengunci sleeve poros dikencangkan penuh sesuai torsi',
          'Biarkan terpasang permanen sebagai peredam getaran',
          'Setelah pompa dijalankan di 1750 RPM selama 5 menit',
        ],
        explanation:
          'Setting clips menjaga kompresi pegas dan konsentrisitas seal selama perakitan. Kencangkan seluruh baut gland dan set screw poros terlebih dahulu, barulah lepas klip sebelum poros diputar tangan.',
      },
      {
        question:
          'Apa fungsi teknik utama dari Renewable Casing Wear Ring (#02)?',
        options: [
          'Menahan kebocoran oli pelumas di dalam bak rumah bearing',
          'Membentuk celah pembatas sempit antara sisi tekan volute dan sisi isap impeller untuk mengurangi resirkulasi internal',
          'Berfungsi sebagai bantalan bola radial yang menopang ujung depan poros pompa',
          'Mencegah motor berputar terbalik saat breaker listrik jatuh',
        ],
        explanation:
          'Wear ring membentuk celah sempit pengorbanan (0,20–0,30 mm radial). Saat celah melebar akibat abrasi, teknisi cukup mengganti ring perunggu/stellite tanpa mengganti casing utama.',
      },
      {
        question:
          'Mengapa pompa proses ANSI B73.1 memakai rakitan penutup belakang Seal Backplate (#05) dan Bearing Frame (#09) tipe back-pull-out?',
        options: [
          'Agar teknisi dapat menarik seluruh unit rotor ke belakang tanpa membongkar pipa isap dan pipa tekan pada volute casing',
          'Untuk menggandakan head pompa dibandingkan pompa split-case',
          'Untuk menghilangkan kebutuhan pasak dan mur pengunci impeller',
          'Agar fluida proses mengalir mendinginkan bola bearing secara langsung',
        ],
        explanation:
          'Desain back-pull-out memungkinkan volute casing tetap terpasang permanen pada perpipaan pabrik sementara unit berputar ditarik mundur lewat spacer kopling.',
      },
    ],
  },
  ja: {
    title: '3D 機械アセンブリ＆分解（エクスプロード）ビュー検査システム',
    shortTitle: '3D 機械分解ビューア',
    description:
      'ANSI/ISO 遠心プロセスポンプ、CEMA トラフ型ベルトコンベヤ、エンマス＆スクレーパ・ドラッグチェーンコンベヤの3機種に対応した360°インタラクティブ3D CAD組立・分解ビューア。自由回転・拡大縮小・段階分解アニメーション・X線透過表示に加え、任意の3D部品をクリックして材質・故障モード・保守基準ポップアップを確認できます。',
    explore: [
      {
        title: 'オーバーハング遠心ポンプのバックプルアウト構造',
        summary:
          '化学プラント用 ANSI B73.1 / ISO 2858 遠心ポンプはバックプルアウト方式を採用しています。インペラ・メカニカルシール・主軸・軸受・フレーム一式が後方へ一体引き抜きできるため、吸込および吐出配管を取り外すことなく分解点検が可能です。',
        equations: [
          {
            label: 'ボリュート半径方向流体荷重（概算）',
            formula: 'F_r = K_r × P_d × D_2 × B_2  [N]',
            note: 'K_r = ラジアル推力係数（締切流量 Q=0 付近で最大）; D_2 = インペラ外径; B_2 = 羽根出口幅。',
          },
          {
            label: '吸込側へ作用する正味軸スラスト荷重',
            formula: 'F_a ≈ (P_d - P_s) × A_eye - F_balance',
            note: 'アウトボード側の背面組合せ（DB）40°アンギュラ玉軸受ペア（7309）で拘束・支持します。',
          },
        ],
        workedExample: {
          title: '主軸の熱膨張量とフリー側軸受の軸方向逃げ計算',
          given: [
            'インボード6309とアウトボード7309間の鋼製主軸スパン: L = 240 mm',
            '運転時の軸温度上昇: ΔT = 45 °C、線膨張係数 α = 11.7 × 10⁻⁶ /°C',
          ],
          steps: [
            '軸受間の軸方向伸び量を算出: ΔL = L × α × ΔT',
            'ΔL = 240 × (11.7 × 10⁻⁶) × 45 = 0.126 mm',
            '6309軸受外輪はH7ハウジング内で軸方向フリーのため、0.126 mmの熱伸びを無理なく逃がすことができます。',
          ],
          answer: 'ΔL = 0.126 mm（フリー側ラジアル軸受により正常に吸収）',
        },
      },
      {
        title: 'ウェアリング隙間管理とメカニカルシール潤滑衛生',
        summary:
          '高圧のボリュート吐出液はウェアリング隙間を通って吸込口へ内部漏洩します。半径隙間が過大になると再循環損失が増え揚程と効率が大きく低下します。またカートリッジメカニカルシールはAPI Plan 11によるフラッシング液膜に依存しています。',
        equations: [
          {
            label: '誘導加熱による玉軸受内輪の焼き嵌め膨張量',
            formula: 'Δd = d × α × ΔT  [mm]',
            note: 'ハンマー打撃による圧痕を防ぐため、誘導加熱器（上限 110 °C）で予熱してから45 mm (k5)軸へ挿入します。',
          },
          {
            label: 'ケーシングフランジボルト締付トルク（対角順）',
            formula: 'T = K × d_bolt × F_preload  [N·m]',
            note: 'ニッケル系焼付防止剤塗布時の標準トルク係数 K ≈ 0.18。',
          },
        ],
      },
      {
        title: '段階的分解手順と組立精度検査チェックリスト',
        summary:
          '段階1では絶縁・液抜き後にカップリングを切り離し、バックプルアウト一式とインペラナットを外します。段階2でインペラ・ウェアリング・バックプレートを分解。段階3でカートリッジシールを外し、軸振れ（≤ 0.025 mm TIR）を検査します。',
        equations: [
          {
            label: '許容主軸振れ（TIR）およびレーザー芯出しオフセット限度',
            formula: 'TIR_shaft ≤ 0.025 mm  |  Offset_laser ≤ 0.05 mm',
            note: '過大な振れはシールカーボン面の早期摩耗や1×/2×RPM振動の原因となります。',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          '17-4PHステンレス製ポンプ主軸において、固定側スラスト軸受とフリー側ラジアル軸受のスパンが L = 320 mm、線膨張係数 α = 11.7 × 10⁻⁶ /°C、運転時温度上昇 ΔT = 50 °C のとき、軸の熱膨張伸び量 ΔL (mm) を求めよ。',
        hint: 'ΔL = L × α × ΔT = 320 × 0.0000117 × 50 を計算してください。',
      },
      {
        prompt:
          '内径 45 mm の6309 C3玉軸受を誘導加熱器で室温 25 °C から 110 °C まで加熱します（ΔT = 85 °C、α = 11.5 × 10⁻⁶ /°C）。内径の熱膨張量 Δd をマイクロメートル（µm）で算出せよ。',
        hint: 'Δd(µm) = 45 × 1000 × 11.5e-6 × 85。',
      },
      {
        prompt:
          '摩耗したケーシングウェアリング内径が 140.84 mm、インペラ摺動外径が 139.60 mm のとき、現在の半径隙間（片側クリアランス）は何 mm か。',
        hint: '半径隙間 = (ウェアリング内径 − インペラ外径) / 2。',
      },
    ],
    quiz: [
      {
        question:
          'インボード側の6309ラジアル軸受をハウジング内で軸方向フリー（逃げ構造）にし、アウトボード側7309スラスト軸受のみを固定する理由は何ですか？',
        options: [
          '運転時の温度上昇による主軸の軸方向熱膨張を逃がし、軸受の過大予圧・焼付きを防ぐため',
          'キャビテーション衝撃を吸収するためにインペラを前後に泳がせるため',
          '6309軸受は固定すると油浴潤滑ができなくなるため',
          '高回転時にメカニカルシール摺動面を少し開かせるため',
        ],
        explanation:
          '固定側（アウトボード7309 DB）とフリー側（インボード6309 H7はめあい）の組合せにより、主軸の熱伸びを安全に吸収し熱応力による軸受破損を防ぎます。',
      },
      {
        question:
          'カートリッジ式メカニカルシール（#06）を主軸へ取り付ける際、赤色のセットプレート（センタリングクリップ）をいつ取り外す必要がありますか？',
        options: [
          'グランド面が平らになるよう、軸に挿入する前に外す',
          'グランドボルトおよびシャフトスリーブ止めねじのすべてを規定トルクで締め付けた後、最後に外す',
          '防振ダンパーとして永久に取り付けたままにする',
          '1750 RPMで5分間試運転した後に外す',
        ],
        explanation:
          'センタリングクリップは組立中のばね圧縮量と同芯度を保持します。グランド締付とシャフト止めねじ固定を完了した直後にクリップを外し、手回し確認を行います。',
      },
      {
        question:
          '交換式ケーシングウェアリング（#02）の最も重要な機械的役割は何ですか？',
        options: [
          'ベアリングハウジング内の潤滑油漏れを防ぐこと',
          '高圧ボリュート室と低圧吸込口の間に微小隙間を作り、内部再循環リークを低減すること',
          'ポンプ主軸先端を支える転がり軸受として機能すること',
          '遮断器トリップ時のモータ逆転を防止すること',
        ],
        explanation:
          'ウェアリングは吐出〜吸込間の狭い流体絞り隙間（半径 0.20〜0.30 mm）を維持します。摩耗したら高価なケーシング本体ではなくリングのみを交換して性能を回復させます。',
      },
      {
        question:
          'ANSI B73.1 遠心ポンプがバックプレート（#05）とベアリングフレーム（#09）によるバックプルアウト構造を採用している最大の利点は何ですか？',
        options: [
          '吸込・吐出配管をボリュートケーシングから外さずに回転体ユニット一式を後方へ引き抜き点検できる点',
          '両吸込ポンプと比較して揚程が2倍になる点',
          'インペラのキーやロックナットが不要になる点',
          'プロセス流体が軸受内部を直接通過して冷却できる点',
        ],
        explanation:
          'バックプルアウト構造により、配管のアライメントを崩すことなくスペーサカップリングを外すだけで回転体一式を分解・整備できます。',
      },
    ],
  },
});
