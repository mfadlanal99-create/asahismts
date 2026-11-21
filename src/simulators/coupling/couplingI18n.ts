import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('coupling', {
  id: {
    title: 'Simulator Penyeimbangan Rotor, Kopling & Alur Pasak',
    shortTitle: 'Balancing & Kopling',
    description:
      'Lakukan penyeimbangan rotor dinamis satu bidang metode koefisien pengaruh sesuai standar ISO 10816 / 1940, serta inspeksi celah puntir (backlash) torsi, fretting alur pasak, dan faktor layanan kopling.',
    explore: [
      {
        title: 'Metode Vektor Penyeimbangan Koefisien Pengaruh',
        summary:
          'Penyeimbangan dinamis satu bidang menggunakan fasor getaran kompleks (amplitudo dan sudut fasa) yang diukur pada kecepatan poros 1X untuk meniadakan ketidakseimbangan massa dengan satu beban koreksi.',
        equations: [
          {
            label: 'Vektor Efek Beban Uji',
            formula: 'V_t = V_1 - V_0',
            note: 'Selisih vektor antara pengukuran beban uji (V1) dan pengukuran awal (V0) dalam mm/s.',
          },
          {
            label: 'Koefisien Pengaruh Rotor',
            formula: 'α = V_t / m_t = (V_1 - V_0) / m_t',
            note: 'Sensitivitas kompleks (mm/s per gram) termasuk jeda fasa mekanis/elektronik.',
          },
          {
            label: 'Vektor Beban Koreksi',
            formula: 'm_c = -V_0 / α = -m_t · (V_0 / V_t)',
            note: 'Lepas beban uji lalu pasang m_c pada sudut terhitung θ_c.',
          },
        ],
        workedExample: {
          title: 'Menghitung Beban Koreksi Satu Bidang',
          given: [
            'Getaran awal V0 = 6.0 mm/s ∠ 40°',
            'Beban uji mt = 15 g dipasang pada 0°',
            'Getaran uji V1 = 8.5 mm/s ∠ 75°',
          ],
          steps: [
            'Ubah V0 ke Kartesius: V0 = (6.0 cos 40°, 6.0 sin 40°) = (4.596, 3.857) mm/s.',
            'Ubah V1 ke Kartesius: V1 = (8.5 cos 75°, 8.5 sin 75°) = (2.200, 8.210) mm/s.',
            'Hitung efek uji Vt = V1 - V0 = (-2.396, 4.353) mm/s -> |Vt| = 4.969 mm/s ∠ 118.8°.',
            'Hitung |mc| = mt · (|V0| / |Vt|) = 15 × (6.0 / 4.969) = 18.1 g.',
            'Sudut θ_c = θ_t + (θ_V0 - θ_Vt) + 180° = 0° + (40° - 118.8°) + 180° = 101.2°.',
          ],
          answer: 'Pasang 18.1 g pada 101° (setelah melepas beban uji 15 g).',
        },
      },
      {
        title: 'Kelas Keseimbangan ISO 1940 (G2.5 / G6.3) & Severitas ISO 10816',
        summary:
          'ISO 1940-1 menetapkan batas sisa ketidakseimbangan spesifik e_per dari kelas kualitas G dan putaran kerja, sedangkan ISO 10816-3 mengklasifikasikan getaran RMS rumah bantalan ke dalam Zona A–D.',
        equations: [
          {
            label: 'Kecepatan Sudut',
            formula: 'ω = 2π · N / 60',
            note: 'N dalam RPM, ω dalam rad/s.',
          },
          {
            label: 'Ketidakseimbangan Spesifik Izin',
            formula: 'e_per = (G · 1000) / ω',
            note: 'e_per dalam g·mm/kg (µm). Kelas umum: G2.5 (turbin/presisi), G6.3 (pompa/fan/motor).',
          },
          {
            label: 'Massa Sisa Maksimum Izin',
            formula: 'm_per = (M · e_per) / r',
            note: 'M = massa rotor (kg), r = radius koreksi (mm).',
          },
        ],
        workedExample: {
          title: 'Batas ISO 1940-1 Kelas G6.3 untuk Kipas Sentrifugal',
          given: [
            'Massa rotor M = 120 kg, putaran N = 1500 RPM',
            'Kelas keseimbangan G = 6.3 mm/s, radius koreksi r = 200 mm',
          ],
          steps: [
            'Kecepatan sudut ω = 2π × 1500 / 60 = 157.08 rad/s.',
            'e_per = (6.3 × 1000) / 157.08 = 40.11 g·mm/kg.',
            'Total ketidakseimbangan izin U_per = 120 × 40.11 = 4813 g·mm.',
            'Pada radius r = 200 mm, m_per = 4813 / 200 = 24.1 g.',
          ],
          answer: 'Massa sisa ketidakseimbangan maksimum yang diizinkan adalah 24.1 g pada radius 200 mm.',
        },
      },
      {
        title: 'Jenis Kopling, Celah Puntir (Backlash) Torsi & Inspeksi Suaian Alur Pasak',
        summary:
          'Kopling fleksibel mengakomodasi ketidaksejajaran dan meredam kejut torsi, namun keausan elastomer, kekurangan gemuk, dan kelonggaran pasak mempercepat backlash, korosi fretting, dan tegangan geser pasak.',
        equations: [
          {
            label: 'Faktor Layanan Kopling Nominal',
            formula: 'SF = T_rated / T_applied',
            note: 'T_applied = 9550 · P(kW) / N(RPM). Penggerak industri umumnya mensyaratkan SF ≥ 1.5.',
          },
          {
            label: 'Tegangan Geser Pasak Sejajar',
            formula: 'τ = F_t / (b · L),  dengan F_t = (2000 · T) / d',
            note: 'T dalam Nm, diameter poros d, lebar pasak b, dan panjang pasak L dalam mm.',
          },
          {
            label: 'Tegangan Tekan/Tumpu Pasak',
            formula: 'σ_c = (2 · F_t) / (h · L)',
            note: 'Memeriksa tekanan tumpu dinding samping pada setengah tinggi pasak (h/2).',
          },
        ],
        workedExample: {
          title: 'Memeriksa Geser Pasak & Faktor Layanan Kopling',
          given: [
            'Torsi kerja T = 280 Nm pada poros d = 40 mm',
            'Pasak DIN 6885: b = 12 mm, h = 8 mm, L = 45 mm',
            'Kopling Elastomer Jaw berkapasitas T_rated = 340 Nm',
          ],
          steps: [
            'Gaya tangensial F_t = (2000 × 280) / 40 = 14,000 N.',
            'Tegangan geser pasak τ = 14,000 / (12 × 45) = 25.9 MPa (jauh di bawah batas 80 MPa).',
            'Tegangan tumpu pasak σ_c = (2 × 14,000) / (8 × 45) = 77.8 MPa.',
            'Faktor Layanan Nominal SF = 340 / 280 = 1.21 (marjinal untuk beban kejut).',
          ],
          answer: 'Tegangan pasak aman, tetapi SF = 1.21 perlu pemantauan atau peningkatan ukuran kopling.',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Pengukuran awal menghasilkan V0 = 6.0 mm/s ∠ 0°. Pemasangan beban uji 20 g pada 0° mengubah getaran menjadi V1 = 9.0 mm/s ∠ 0°. Berapa massa beban koreksi (dalam g) yang dibutuhkan?',
        hint: 'Karena V0 dan V1 segaris pada 0°, Vt = V1 - V0 = 3.0 mm/s. Gunakan mc = mt · (|V0| / |Vt|).',
        solutionSteps: [
          'Vt = V1 - V0 = 9.0 - 6.0 = 3.0 mm/s ∠ 0°.',
          'Sensitivitas pengaruh |α| = |Vt| / mt = 3.0 / 20 = 0.15 mm/s per g.',
          'Massa koreksi mc = |V0| / |α| = 6.0 / 0.15 = 40 g (dipasang pada 180°).',
        ],
      },
      {
        prompt:
          'Impeler pompa bermassa 80 kg berputar pada 1500 RPM dan harus memenuhi ISO 1940 Kelas G6.3. Berapa massa sisa maksimum yang diizinkan (dalam g) pada radius koreksi 160 mm?',
        hint: 'Hitung ω = 2π·N/60, e_per = 1000·G/ω, lalu m_per = (M · e_per) / r.',
        solutionSteps: [
          'ω = 2π × 1500 / 60 = 157.08 rad/s.',
          'e_per = (6.3 × 1000) / 157.08 = 40.11 g·mm/kg.',
          'U_per = 80 × 40.11 = 3208.6 g·mm.',
          'm_per = 3208.6 / 160 = 20.05 g ≈ 20.1 g.',
        ],
      },
      {
        prompt:
          'Poros berdiameter 40 mm mentransmisikan 300 Nm melalui pasak sejajar DIN 6885 dengan lebar b = 12 mm dan panjang L = 50 mm. Hitung tegangan geser pasak (dalam MPa).',
        hint: 'Cari gaya tangensial Ft = (2000 · T) / d, lalu bagi dengan luas geser b · L.',
        solutionSteps: [
          'Radius poros r = d / 2 = 20 mm.',
          'Gaya tangensial Ft = (300 × 1000) / 20 = 15,000 N.',
          'Luas geser As = 12 × 50 = 600 mm².',
          'τ = 15,000 / 600 = 25.0 MPa.',
        ],
      },
      {
        prompt:
          'Motor 22 kW pada 1480 RPM menggerakkan pompa melalui kopling berkapasitas torsi nominal 340 Nm. Berapa faktor layanan kopling nominalnya?',
        hint: 'Hitung torsi kerja T = 9550 · P / N, lalu SF = T_rated / T.',
        solutionSteps: [
          'Torsi kerja T = (9550 × 22) / 1480 = 141.96 Nm.',
          'Faktor Layanan Nominal SF = 340 / 141.96 = 2.395 ≈ 2.40.',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Pada penyeimbangan koefisien pengaruh satu bidang, apa yang diwakili oleh vektor Vt = V1 - V0?',
        options: [
          'Getaran sisa setelah penyeimbangan',
          'Perubahan getaran yang disebabkan oleh beban uji saja',
          'Derau listrik latar belakang',
          'Kekakuan total rumah bantalan',
        ],
        explanation:
          'Mengurangkan vektor awal V0 dari vektor uji V1 mengisolasi respons dinamis Vt yang dihasilkan oleh beban uji saja.',
      },
      {
        question:
          'Mengapa beban uji biasanya harus dilepas sebelum memasang beban koreksi hasil perhitungan?',
        options: [
          'Karena beban koreksi dihitung untuk meniadakan V0 saja',
          'Karena beban uji tidak boleh berputar di atas 1000 RPM',
          'Untuk menggandakan koefisien pengaruh rotor',
          'Untuk menggeser sudut fasa sebesar 90 derajat',
        ],
        explanation:
          'Rumus standar mc = -V0 / α menghitung massa untuk meniadakan ketidakseimbangan awal V0; membiarkan beban uji terpasang akan menambahkan Vt kembali.',
      },
      {
        question:
          'Menurut ISO 10816-3 untuk mesin industri menengah (15–300 kW, fondasi kaku), rentang kecepatan RMS manakah yang termasuk Zona A (kondisi baru)?',
        options: ['0.0 – 1.4 mm/s', '1.4 – 2.8 mm/s', '2.8 – 4.5 mm/s', '> 4.5 mm/s'],
        explanation:
          'ISO 10816-3 Grup 2 (kaku) menetapkan Zona A ≤ 1.4 mm/s RMS, Zona B hingga 2.8 mm/s, Zona C hingga 4.5 mm/s, dan Zona D di atas 4.5 mm/s.',
      },
      {
        question:
          'Jenis kopling manakah yang memerlukan pelumasan gemuk EP atau rendaman oli secara berkala untuk mencegah fretting gigi dan macet?',
        options: [
          'Kopling Rahang Elastomer (Jaw Coupling)',
          'Kopling Roda Gigi Mahkota (Gear Coupling)',
          'Kopling Ban Karet',
          'Kopling Membran Disc Pack',
        ],
        explanation:
          'Kopling roda gigi bergantung pada lapisan pelumas antara gigi hub mahkota yang bergeser dan selongsong luar; kekurangan gemuk memicu keausan fretting.',
      },
      {
        question:
          'Apa penyebab utama serbuk oksida cokelat-merah ("korosi fretting") di sekitar alur pasak poros?',
        options: [
          'Kekerasan spider elastomer yang terlalu tinggi',
          'Mikro-selip dan benturan akibat kelonggaran alur pasak di bawah torsi siklik',
          'Pelumasan berlebih pada rumah bantalan',
          'Menyeimbangkan rotor hingga ISO Kelas G2.5',
        ],
        explanation:
          'Kelonggaran antara pasak dan alur pasak memungkinkan osilasi mikro di bawah torsi berfluktuasi, merusak lapisan oksida permukaan dan menyebabkan fretting.',
      },
      {
        question:
          'Jika putaran rotor berlipat ganda dari 1500 RPM menjadi 3000 RPM pada kelas ISO 1940 G yang sama, apa yang terjadi pada massa sisa ketidakseimbangan izin?',
        options: [
          'Menjadi dua kali lipat',
          'Menjadi empat kali lipat',
          'Berkurang menjadi setengahnya',
          'Tetap tidak berubah',
        ],
        explanation:
          'Karena e_per = (G · 1000) / ω dan ω sebanding dengan RPM, menggandakan putaran akan membagi dua e_per dan massa sisa yang diizinkan.',
      },
    ],
  },
  ja: {
    title: 'ロータ動釣合い・カップリング・キー溝保守シミュレータ',
    shortTitle: '動釣合い・継手',
    description:
      'ISO 10816 / 1940準拠の1面影響係数法によるロータ動釣合い試験と、ジョー・ギヤ・グリッドカップリングのねじりバックラッシ、キー溝フレッティング、使用率の点検を行います。',
    explore: [
      {
        title: '影響係数法による1面動釣合いベクトル計算',
        summary:
          '1面動釣合いでは、1X回転同期成分の複素振動ベクトル（振幅と位相角）を用いて、1つの修正おもりで質量不釣合いを打ち消します。',
        equations: [
          {
            label: '試しおもり効果ベクトル',
            formula: 'V_t = V_1 - V_0',
            note: '試しおもり装着時（V1）と初期運転時（V0）のベクトル差（mm/s）。',
          },
          {
            label: 'ロータ影響係数',
            formula: 'α = V_t / m_t = (V_1 - V_0) / m_t',
            note: '機械的・電気的位相遅れを含む複素感度（mm/s per g）。',
          },
          {
            label: '修正おもりベクトル',
            formula: 'm_c = -V_0 / α = -m_t · (V_0 / V_t)',
            note: '試しおもりを外し、算出した角度 θ_c の位置に m_c を取り付けます。',
          },
        ],
        workedExample: {
          title: '1面修正おもりの計算例',
          given: [
            '初期振動 V0 = 6.0 mm/s ∠ 40°',
            '試しおもり mt = 15 g を 0° に装着',
            '試し運転振動 V1 = 8.5 mm/s ∠ 75°',
          ],
          steps: [
            'V0 を直交座標へ変換: V0 = (6.0 cos 40°, 6.0 sin 40°) = (4.596, 3.857) mm/s。',
            'V1 を直交座標へ変換: V1 = (8.5 cos 75°, 8.5 sin 75°) = (2.200, 8.210) mm/s。',
            '試し効果 Vt = V1 - V0 = (-2.396, 4.353) mm/s -> |Vt| = 4.969 mm/s ∠ 118.8°。',
            '|mc| = mt · (|V0| / |Vt|) = 15 × (6.0 / 4.969) = 18.1 g。',
            '角度 θ_c = θ_t + (θ_V0 - θ_Vt) + 180° = 0° + (40° - 118.8°) + 180° = 101.2°。',
          ],
          answer: '15 g の試しおもりを外し、101° に 18.1 g を取り付けます。',
        },
      },
      {
        title: 'ISO 1940 バランス等級 (G2.5 / G6.3) と ISO 10816 振動シビアリティ',
        summary:
          'ISO 1940-1は品質等級Gと運転回転数から許容残留比不釣合い e_per を定め、ISO 10816-3は軸受箱の実効速度振動をゾーンA〜Dに分類します。',
        equations: [
          {
            label: '角速度',
            formula: 'ω = 2π · N / 60',
            note: 'N は RPM、ω は rad/s。',
          },
          {
            label: '許容比不釣合い',
            formula: 'e_per = (G · 1000) / ω',
            note: '単位は g·mm/kg（µm）。代表等級：G2.5（タービン・精密機械）、G6.3（ポンプ・ファン・電動機）。',
          },
          {
            label: '許容残留質量',
            formula: 'm_per = (M · e_per) / r',
            note: 'M = ロータ質量（kg）、r = 修正半径（mm）。',
          },
        ],
        workedExample: {
          title: '遠心ファンの ISO 1940-1 等級 G6.3 許容値',
          given: [
            'ロータ質量 M = 120 kg、回転数 N = 1500 RPM',
            'バランス等級 G = 6.3 mm/s、修正半径 r = 200 mm',
          ],
          steps: [
            '角速度 ω = 2π × 1500 / 60 = 157.08 rad/s。',
            'e_per = (6.3 × 1000) / 157.08 = 40.11 g·mm/kg。',
            '許容総不釣合い U_per = 120 × 40.11 = 4813 g·mm。',
            '半径 r = 200 mm での許容質量 m_per = 4813 / 200 = 24.1 g。',
          ],
          answer: '半径 200 mm における最大許容残留不釣合い質量は 24.1 g です。',
        },
      },
      {
        title: 'カップリングの種類・ねじりバックラッシ・キー溝嵌合点検',
        summary:
          'たわみ軸継手はミスアライメントとトルク衝撃を吸収しますが、エラストマ摩耗、グリース切れ、キー溝のガタはバックラッシ増大・フレッティング摩耗・キーせん断を招きます。',
        equations: [
          {
            label: '公称カップリング使用率',
            formula: 'SF = T_rated / T_applied',
            note: 'T_applied = 9550 · P(kW) / N(RPM)。一般産業駆動では SF ≥ 1.5 が推奨されます。',
          },
          {
            label: '平行キーせん断応力',
            formula: 'τ = F_t / (b · L),  ここで F_t = (2000 · T) / d',
            note: 'T は Nm、軸径 d・キー幅 b・キー長さ L は mm。',
          },
          {
            label: '平行キー面圧（圧縮）応力',
            formula: 'σ_c = (2 · F_t) / (h · L)',
            note: 'キー高さの半分（h/2）にかかる側面接触圧を確認します。',
          },
        ],
        workedExample: {
          title: 'キーせん断応力とカップリング使用率の確認',
          given: [
            '軸径 d = 40 mm に作用トルク T = 280 Nm',
            'DIN 6885 キー：b = 12 mm、h = 8 mm、L = 45 mm',
            'ジョーカップリング定格トルク T_rated = 340 Nm',
          ],
          steps: [
            '接線力 F_t = (2000 × 280) / 40 = 14,000 N。',
            'キーせん断応力 τ = 14,000 / (12 × 45) = 25.9 MPa（許容 80 MPa 未満）。',
            'キー面圧応力 σ_c = (2 × 14,000) / (8 × 45) = 77.8 MPa。',
            '公称使用率 SF = 340 / 280 = 1.21（衝撃負荷には余裕が小さい）。',
          ],
          answer: 'キー応力は安全範囲ですが、SF = 1.21 のため監視またはサイズアップが必要です。',
        },
      },
    ],
    practice: [
      {
        prompt:
          '初期運転で V0 = 6.0 mm/s ∠ 0° を測定しました。0° に 20 g の試しおもりを付けると V1 = 9.0 mm/s ∠ 0° に変化しました。必要な修正おもり質量（g）はいくらですか？',
        hint: 'V0 と V1 が同じ 0° 方向にあるため Vt = V1 - V0 = 3.0 mm/s です。mc = mt · (|V0| / |Vt|) を用います。',
        solutionSteps: [
          'Vt = V1 - V0 = 9.0 - 6.0 = 3.0 mm/s ∠ 0°。',
          '影響感度 |α| = |Vt| / mt = 3.0 / 20 = 0.15 mm/s per g。',
          '修正質量 mc = |V0| / |α| = 6.0 / 0.15 = 40 g（180° 位置に取り付け）。',
        ],
      },
      {
        prompt:
          '質量 80 kg のポンプ羽根車が 1500 RPM で回転し、ISO 1940 等級 G6.3 を満たす必要があります。修正半径 160 mm での最大許容残留質量（g）を求めてください。',
        hint: 'ω = 2π·N/60、e_per = 1000·G/ω を計算し、m_per = (M · e_per) / r を求めます。',
        solutionSteps: [
          'ω = 2π × 1500 / 60 = 157.08 rad/s。',
          'e_per = (6.3 × 1000) / 157.08 = 40.11 g·mm/kg。',
          'U_per = 80 × 40.11 = 3208.6 g·mm。',
          'm_per = 3208.6 / 160 = 20.05 g ≈ 20.1 g。',
        ],
      },
      {
        prompt:
          '直径 40 mm の軸が幅 b = 12 mm、長さ L = 50 mm の DIN 6885 平行キーを介して 300 Nm を伝達しています。キーせん断応力（MPa）を計算してください。',
        hint: '接線力 Ft = (2000 · T) / d を求め、せん断面積 b · L で割ります。',
        solutionSteps: [
          '軸半径 r = d / 2 = 20 mm。',
          '接線力 Ft = (300 × 1000) / 20 = 15,000 N。',
          'せん断面積 As = 12 × 50 = 600 mm²。',
          'τ = 15,000 / 600 = 25.0 MPa。',
        ],
      },
      {
        prompt:
          '1480 RPM で運転する 22 kW モータが、公称トルク 340 Nm のカップリングでポンプを駆動しています。公称使用率（SF）はいくらですか？',
        hint: '負荷トルク T = 9550 · P / N を計算し、SF = T_rated / T を求めます。',
        solutionSteps: [
          '負荷トルク T = (9550 × 22) / 1480 = 141.96 Nm。',
          '公称使用率 SF = 340 / 141.96 = 2.395 ≈ 2.40。',
        ],
      },
    ],
    quiz: [
      {
        question:
          '1面影響係数法において、ベクトル Vt = V1 - V0 は何を表していますか？',
        options: [
          '釣合い修正後の残留振動',
          '試しおもり単体によって生じた振動変化分',
          '背景の電気的ノイズフロア',
          '軸受ハウジングの総合剛性',
        ],
        explanation:
          '試し運転ベクトル V1 から初期ベクトル V0 を差し引くことで、試しおもりによる動的応答 Vt のみを抽出できます。',
      },
      {
        question:
          '算出した修正おもりを取り付ける前に、通常なぜ試しおもりを外す必要がありますか？',
        options: [
          '修正おもりは元の不釣合い V0 のみを打ち消すよう計算されているため',
          '試しおもりは 1000 RPM 以上で回転できないため',
          'ロータの影響係数を2倍にするため',
          '位相角を 90 度シフトさせるため',
        ],
        explanation:
          'mc = -V0 / α は元の不釣合い V0 を打ち消す質量を求める式であり、試しおもりを残すと Vt が再び加わってしまいます。',
      },
      {
        question:
          'ISO 10816-3 の中型産業機械（15〜300 kW、剛性基礎）において、ゾーンA（新設・良好）に該当する RMS 振動速度範囲はどれですか？',
        options: ['0.0 – 1.4 mm/s', '1.4 – 2.8 mm/s', '2.8 – 4.5 mm/s', '> 4.5 mm/s'],
        explanation:
          'ISO 10816-3 グループ2（剛性基礎）では、ゾーンA が 1.4 mm/s 以下、ゾーンB が 2.8 mm/s まで、ゾーンC が 4.5 mm/s までと規定されています。',
      },
      {
        question:
          '歯面のフレッティングや焼付きを防ぐため、定期的な EP グリースまたは油浴潤滑が不可欠なカップリングはどれですか？',
        options: [
          'エラストマ・ジョーカップリング',
          'クラウニング歯車形軸継手（ギヤカップリング）',
          'ゴムタイヤカップリング',
          'ディスクパック形膜板継手',
        ],
        explanation:
          'ギヤカップリングは摺動するクラウニング外歯とスリーブ内歯の間の油膜に依存しており、グリース切れで急速にフレッティング摩耗が進みます。',
      },
      {
        question:
          '軸のキー溝周辺に発生する赤褐色の酸化摩耗粉（「フレッティング腐食」）の主な原因は何ですか？',
        options: [
          'エラストマスパイダの硬度が高すぎること',
          '変動トルク下でのキー溝隙間による微小滑りと衝撃',
          '軸受ハウジングへの過大な給脂',
          'ロータを ISO 等級 G2.5 まで精密釣合いしたこと',
        ],
        explanation:
          'キーとキー溝の隙間により繰返しトルク下で微小な往復滑りが発生し、表面酸化皮膜が破壊されてフレッティング摩耗が生じます。',
      },
      {
        question:
          '同じ ISO 1940 G等級を維持したままロータ回転数が 1500 RPM から 3000 RPM に倍増した場合、許容残留不釣合い質量はどうなりますか？',
        options: [
          '2倍になる',
          '4倍になる',
          '半分になる',
          '変化しない',
        ],
        explanation:
          'e_per = (G · 1000) / ω であり ω は回転数に比例するため、回転数が2倍になると許容比不釣合いと許容残留質量は半分になります。',
      },
    ],
  },
});
