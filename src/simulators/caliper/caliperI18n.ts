import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('caliper', {
  id: {
    title: 'Simulator Jangka Sorong & Mikrometer Sekrup',
    shortTitle: 'Jangka Sorong & Mikrometer',
    description:
      'Lab metrologi presisi interaktif untuk membaca jangka sorong 0.02 mm & 0.05 mm serta mikrometer sekrup luar 0.01 mm, lengkap dengan kaca pembesar (loupe), kompensasi kesalahan titik nol, dan mode uji mandiri.',
    explore: [
      {
        title: 'Nilai Skala Terkecil (NST / Least Count) & Resolusi Skala',
        summary:
          'Nilai Skala Terkecil (NST / LC) adalah pertambahan terkecil yang dapat dibaca alat ukur. Skala nonius mencapai resolusi sub-milimeter dengan membuat N bagian skala nonius sedikit lebih pendek dari bilangan bulat bagian skala utama; mikrometer sekrup mencapai 0.01 mm dengan ulir presisi berpitch 0.5 mm dan 50 bagian skala putar (bidal/thimble).',
        equations: [
          {
            label: 'Nilai Skala Terkecil Jangka Sorong (Umum)',
            formula: 'LC = 1 MSD / N',
            note: 'Dengan 1 MSD (Skala Utama) = 1.00 mm dan N = jumlah bagian skala nonius (50 -> 0.02 mm; 20 -> 0.05 mm).',
          },
          {
            label: 'Panjang Satu Bagian Skala Nonius',
            formula: '1 VSD = ((k * MSD) - LC)',
            note: 'Jangka sorong 0.02 mm: 50 VSD = 49 mm (1 VSD = 0.98 mm). Jangka sorong 0.05 mm: 20 VSD = 39 mm (1 VSD = 1.95 mm).',
          },
          {
            label: 'Nilai Skala Terkecil Mikrometer Sekrup',
            formula: 'LC = Pitch / N_thimble = 0.50 mm / 50 = 0.01 mm',
            note: 'Satu putaran penuh bidal (thimble) memajukan spindel sebesar 0.50 mm.',
          },
        ],
        workedExample: {
          title: 'Menghitung Nilai Skala Terkecil Jangka Sorong 20-Bagian',
          given: [
            'Bagian skala utama (1 MSD) = 1.00 mm',
            '20 bagian skala nonius membentang sepanjang 39 mm pada skala utama',
          ],
          steps: [
            'Panjang 1 bagian skala nonius: 1 VSD = 39 mm / 20 = 1.95 mm.',
            'Setiap bagian skala nonius dibandingkan terhadap 2 bagian skala utama (2.00 mm).',
            'Nilai Skala Terkecil (LC) = 2.00 mm - 1.95 mm = 0.05 mm (atau 1.00 mm / 20).',
          ],
          answer: 'LC = 0.05 mm',
        },
      },
      {
        title: 'Membaca Jangka Sorong vs. Mikrometer Luar',
        summary:
          'Kedua alat menggabungkan pembacaan kasar tetap dan pembacaan halus fraksional. Pada jangka sorong, baca milimeter bulat terakhir di sebelah kiri angka 0 nonius (MSR), lalu cari satu garis nonius yang sejajar lurus dengan garis skala utama. Pada mikrometer, baca garis mm dan 0.5 mm yang terlihat di selubung (sleeve), lalu tambahkan divisi bidal pada garis datum.',
        equations: [
          {
            label: 'Pembacaan Total Jangka Sorong',
            formula: 'Reading = MSR + (VSR * LC)',
            note: 'MSR = Skala Utama tepat di kiri 0 nonius; VSR = indeks divisi nonius yang berimpit.',
          },
          {
            label: 'Pembacaan Total Mikrometer',
            formula: 'Reading = Sleeve_mm + (0.50 jika garis 0.5 mm terlihat) + (Thimble_div * 0.01 mm)',
            note: 'Periksa dengan teliti apakah tanda 0.5 mm setelah mm bulat terakhir terlihat.',
          },
        ],
        workedExample: {
          title: 'Membaca Mikrometer Luar dengan Tanda 0.5 mm Terlihat',
          given: [
            'Skala selubung atas menunjukkan tanda 17 mm terlihat jelas',
            'Skala selubung bawah menunjukkan tanda 0.5 mm setelah 17 mm terlihat',
            'Divisi bidal ke-34 sejajar dengan garis datum horizontal',
          ],
          steps: [
            'Pembacaan mm bulat selubung = 17.00 mm.',
            'Tanda setengah milimeter terlihat setelah 17 mm -> tambah 0.50 mm (sleeve = 17.50 mm).',
            'Kontribusi bidal = 34 * 0.01 mm = 0.34 mm.',
            'Pembacaan total = 17.50 + 0.34 = 17.84 mm.',
          ],
          answer: '17.84 mm',
        },
      },
      {
        title: 'Kesalahan Titik Nol, Kesalahan Paralaks & Teknik Pengukuran',
        summary:
          'Sebelum mengukur, rapatkan rahang (atau pertemukan anvil & spindel dengan ratchet stop) dan pastikan tanda nol sejajar. Penyimpangan apa pun merupakan kesalahan titik nol sistematis yang harus dikurangkan secara aljabar dari setiap pembacaan teramati. Selalu lihat skala secara tegak lurus untuk menghindari kesalahan paralaks, dan gunakan ratchet stop pada mikrometer sekrup untuk memberikan gaya ukur yang konsisten.',
        equations: [
          {
            label: 'Koreksi Kesalahan Titik Nol',
            formula: 'True Reading = Observed Reading - Zero Error',
            note: 'Kesalahan titik nol positif (+e) terbaca terlalu tinggi sehingga dikurangkan; kesalahan titik nol negatif (-e) terbaca terlalu rendah sehingga menambah |e|.',
          },
          {
            label: 'Kesalahan Titik Nol Negatif (Skala Nonius)',
            formula: 'Zero Error = -(N - coinciding_div) * LC',
            note: 'Saat angka 0 nonius berada di kiri 0 skala utama, hitung mundur dari N.',
          },
        ],
        workedExample: {
          title: 'Mengoreksi Pengukuran dengan Kesalahan Titik Nol Negatif',
          given: [
            'Jangka sorong 0.02 mm memiliki kesalahan titik nol -0.04 mm saat rahang dirapatkan',
            'Pembacaan teramati pada diameter luar poros pompa = 24.32 mm',
          ],
          steps: [
            'Identifikasi kesalahan titik nol beserta tandanya: Zero Error = -0.04 mm.',
            'Terapkan rumus koreksi: True Reading = Observed - Zero Error.',
            'True Reading = 24.32 mm - (-0.04 mm) = 24.32 + 0.04 = 24.36 mm.',
          ],
          answer: '24.36 mm',
        },
      },
    ],
    practice: [
      {
        prompt:
          'Pada jangka sorong 0.02 mm, angka 0 nonius berada tepat setelah 28 mm, dan divisi nonius ke-18 berimpit dengan garis skala utama. Berapa pembacaannya dalam mm?',
        hint: 'Gunakan Reading = MSR + (VSR * 0.02 mm). Di sini MSR = 28 mm dan VSR = 18.',
        solutionSteps: [
          'MSR = 28.00 mm (tanda mm bulat terakhir di kiri 0 nonius).',
          'Kontribusi nonius = 18 * 0.02 mm = 0.36 mm.',
          'Pembacaan total = 28.00 + 0.36 = 28.36 mm.',
        ],
      },
      {
        prompt:
          'Jangka sorong 0.05 mm memiliki kesalahan titik nol positif +0.05 mm. Saat mengukur lubang bantalan (bearing), MSR = 32 mm dan garis nonius ke-10 berimpit. Hitung diameter lubang sebenarnya dalam mm.',
        hint: 'Hitung pembacaan teramati (32 + 10 * 0.05), lalu kurangi kesalahan titik nol +0.05 mm.',
        solutionSteps: [
          'Pembacaan teramati = 32.00 + (10 * 0.05) = 32.50 mm.',
          'Pembacaan sebenarnya = Observed - Zero Error = 32.50 - (+0.05) = 32.45 mm.',
        ],
      },
      {
        prompt:
          'Mikrometer sekrup luar (NST 0.01 mm, pitch 0.5 mm) menunjukkan tanda 12 mm dan tanda 0.5 mm berikutnya pada selubung. Skala putar (bidal) ke-24 sejajar dengan garis datum. Berapa pembacaannya dalam mm?',
        hint: 'Pembacaan selubung adalah 12.50 mm karena tanda 0.5 mm setelah 12 mm terlihat.',
        solutionSteps: [
          'Mm bulat selubung = 12.00 mm, ditambah tanda 0.5 mm terlihat = 12.50 mm.',
          'Pembacaan bidal = 24 * 0.01 mm = 0.24 mm.',
          'Pembacaan total = 12.50 + 0.24 = 12.74 mm.',
        ],
      },
      {
        prompt:
          'Mikrometer sekrup memiliki kesalahan titik nol negatif -0.03 mm. Saat mengukur shim presisi, selubung menunjukkan 6.50 mm dan bidal terbaca 30. Berapa ketebalan shim sebenarnya dalam mm?',
        hint: 'Teramati = 6.50 + 0.30 = 6.80 mm. Mengurangkan -0.03 mm berarti menambah 0.03 mm.',
        solutionSteps: [
          'Pembacaan teramati = 6.50 + (30 * 0.01) = 6.80 mm.',
          'Ketebalan sebenarnya = 6.80 - (-0.03) = 6.83 mm.',
        ],
      },
      {
        prompt:
          'Sebuah skala nonius metrik khusus memiliki 25 bagian sama panjang yang membentang 24 mm pada skala utama 1 mm. Berapa nilai skala terkecilnya (NST / least count) dalam mm?',
        hint: '1 VSD = 24 / 25 = 0.96 mm. Kurangkan dari 1.00 mm.',
        solutionSteps: [
          '1 MSD = 1.00 mm.',
          '1 VSD = 24 mm / 25 = 0.96 mm.',
          'Nilai Skala Terkecil (LC) = 1.00 - 0.96 = 0.04 mm.',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Pada jangka sorong metrik standar 0.02 mm, berapa milimeter skala utama yang direntangi oleh 50 divisi nonius?',
        options: ['49 mm', '50 mm', '39 mm', '24 mm'],
        explanation:
          '50 divisi nonius sama dengan 49 mm (1 VSD = 0.98 mm), menghasilkan ketelitian 1.00 - 0.98 = 0.02 mm.',
      },
      {
        question:
          'Bagian mana dari jangka sorong yang dirancang khusus untuk mengukur diameter dalam (ID) lubang?',
        options: [
          'Rahang ukur luar (rahang bawah)',
          'Rahang ukur dalam (rahang atas)',
          'Batang pengukur kedalaman di ujung mistar',
          'Sekrup pengunci ibu jari',
        ],
        explanation:
          'Rahang atas yang lebih kecil memiliki sisi ukur menghadap keluar untuk mengukur diameter dalam (ID) dan lebar alur.',
      },
      {
        question:
          'Mengapa Anda harus selalu memutar ratchet stop, bukan memutar bidal langsung, saat merapatkan mikrometer sekrup pada benda kerja?',
        options: [
          'Untuk memutar spindel lebih cepat pada jarak jauh',
          'Untuk memberikan gaya ukur yang konsisten dan mencegah lenturan rangka atau penekanan benda kerja',
          'Untuk mengunci spindel pada pembacaan saat ini',
          'Untuk mereset kesalahan titik nol secara otomatis',
        ],
        explanation:
          'Ratchet stop akan slip pada torsi terkalibrasi, mencegah pengencangan berlebih yang melenturkan rangka C atau menekan benda lunak.',
      },
      {
        question:
          'Mikrometer sekrup memiliki kesalahan titik nol +0.02 mm. Jika pembacaan teramati pada poros adalah 15.48 mm, berapa diameter sebenarnya?',
        options: ['15.50 mm', '15.46 mm', '15.48 mm', '15.52 mm'],
        explanation:
          'Pembacaan Sebenarnya = Teramati - Kesalahan Titik Nol = 15.48 - (+0.02) = 15.46 mm.',
      },
      {
        question:
          'Jika tanda 0.5 mm setelah 9 mm terlihat pada selubung mikrometer dan bidal terbaca 12, berapa pembacaan teramatinya?',
        options: ['9.12 mm', '9.512 mm', '9.62 mm', '10.12 mm'],
        explanation:
          'Pembacaan selubung yang terlihat adalah 9.50 mm, ditambah 12 * 0.01 mm = 0.12 mm, menghasilkan 9.62 mm.',
      },
      {
        question:
          'Bagaimana cara meminimalkan kesalahan paralaks saat membaca skala jangka sorong atau mikrometer sekrup?',
        options: [
          'Dengan melihat skala pada sudut 45 derajat dari kanan',
          'Dengan melihat garis skala lurus tegak lurus (90°) terhadap bidang skala',
          'Dengan mengencangkan sekrup pengunci sebelum melihat skala',
          'Dengan menggandakan nilai skala terkecil alat',
        ],
        explanation:
          'Melihat secara tegak lurus (90° terhadap skala) mencegah pergeseran semu antara tepi nonius/bidal dan garis skala utama.',
      },
    ],
  },
  ja: {
    title: 'ノギス・マイクロメータ シミュレータ',
    shortTitle: 'ノギス・マイクロメータ',
    description:
      '最小読取値 0.02 mm / 0.05 mm のノギスと 0.01 mm の外側マイクロメータを対話的に学べる精密測定ラボ。拡大ルーペ、器差（ゼロ誤差）補正、セルフテストを搭載。',
    explore: [
      {
        title: '最小読取値（Least Count）と目盛分解能',
        summary:
          '最小読取値（LC）は測定器が読み取れる最小単位です。バーニア（副尺）は N 等分した副尺目盛を本尺の整数目盛よりわずかに短くすることで 1 mm 未満を分解し、マイクロメータは 0.5 mm ピッチの精密ねじと 50 等分シンブルで 0.01 mm を実現します。',
        equations: [
          {
            label: 'ノギス最小読取値（一般式）',
            formula: 'LC = 1 MSD / N',
            note: '1 MSD = 1.00 mm、N = 副尺目盛数（50 → 0.02 mm、20 → 0.05 mm）。',
          },
          {
            label: '副尺 1 目盛の長さ',
            formula: '1 VSD = ((k * MSD) - LC)',
            note: '0.02 mm ノギス: 50 VSD = 49 mm (0.98 mm)。0.05 mm ノギス: 20 VSD = 39 mm (1.95 mm)。',
          },
          {
            label: 'マイクロメータ最小読取値',
            formula: 'LC = Pitch / N_thimble = 0.50 mm / 50 = 0.01 mm',
            note: 'シンブル 1 回転でスピンドルが 0.50 mm 移動します。',
          },
        ],
        workedExample: {
          title: '20等分バーニアノギスの最小読取値の計算',
          given: [
            '本尺 1 目盛（1 MSD）= 1.00 mm',
            '副尺 20 目盛が本尺の 39 mm に相当',
          ],
          steps: [
            '副尺 1 目盛の長さ: 1 VSD = 39 mm / 20 = 1.95 mm。',
            '副尺 1 目盛を本尺 2 目盛（2.00 mm）と比較します。',
            '最小読取値 = 2.00 mm - 1.95 mm = 0.05 mm（= 1.00 mm / 20）。',
          ],
          answer: 'LC = 0.05 mm',
        },
      },
      {
        title: 'ノギスと外側マイクロメータの読み方',
        summary:
          'どちらも主尺の粗読みと副尺／シンブルの微細読みを合算します。ノギスは副尺 0 の左にある本尺の整数 mm（MSR）を読み、本尺と一直線に一致する副尺目盛を探します。マイクロメータはスリーブの 1 mm・0.5 mm 目盛を読み、基線に一致するシンブル目盛を加えます。',
        equations: [
          {
            label: 'ノギス合計読取値',
            formula: 'Reading = MSR + (VSR * LC)',
            note: 'MSR = 副尺 0 の左の本尺値、VSR = 一致した副尺目盛番号。',
          },
          {
            label: 'マイクロメータ合計読取値',
            formula: 'Reading = Sleeve_mm + (0.50 if 0.5 mm 目盛可視) + (Thimble_div * 0.01 mm)',
            note: '最後の整数 mm の次にある 0.5 mm 目盛が見えているか必ず確認します。',
          },
        ],
        workedExample: {
          title: '0.5 mm 目盛が露出しているマイクロメータの読取り',
          given: [
            'スリーブ上側目盛で 17 mm の線が露出している',
            'スリーブ下側目盛で 17 mm の後の 0.5 mm 線が見えている',
            'シンブル目盛 34 が水平基線（データム線）に一致している',
          ],
          steps: [
            'スリーブ整数 mm = 17.00 mm。',
            '0.5 mm 目盛が露出しているため +0.50 mm（スリーブ = 17.50 mm）。',
            'シンブル分 = 34 * 0.01 mm = 0.34 mm。',
            '合計読取値 = 17.50 + 0.34 = 17.84 mm。',
          ],
          answer: '17.84 mm',
        },
      },
      {
        title: 'ゼロ誤差（器差）・視差（パララックス）と測定作法',
        summary:
          '測定前にジョウ（またはアンビルとスピンドル）を閉じてゼロ点を確認します。ズレがある場合は系統的なゼロ誤差として観測値から代数的に差し引きます。視差を防ぐため目盛は必ず正面（90°）から読み、マイクロメータはラチェットストップで一定圧を保ちます。',
        equations: [
          {
            label: 'ゼロ誤差補正',
            formula: 'True Reading = Observed Reading - Zero Error',
            note: '正のゼロ誤差 (+e) は差し引き、負のゼロ誤差 (-e) は結果的に加算されます。',
          },
          {
            label: '負のゼロ誤差（バーニア）',
            formula: 'Zero Error = -(N - coinciding_div) * LC',
            note: '副尺 0 が本尺 0 より左にある場合は N から逆算します。',
          },
        ],
        workedExample: {
          title: '負のゼロ誤差を持つ測定の補正',
          given: [
            '0.02 mm ノギスのゼロ誤差が -0.04 mm',
            'ポンプ軸外径の観測値が 24.32 mm',
          ],
          steps: [
            '符号付きでゼロ誤差を確認: Zero Error = -0.04 mm。',
            '補正式を適用: True Reading = Observed - Zero Error。',
            'True Reading = 24.32 mm - (-0.04 mm) = 24.36 mm。',
          ],
          answer: '24.36 mm',
        },
      },
    ],
    practice: [
      {
        prompt:
          '最小読取値 0.02 mm のノギスで、副尺 0 が 28 mm をわずかに超え、18 番目の副尺目盛が本尺と一致しました。測定値は何 mm ですか？',
        hint: 'Reading = MSR + (VSR * 0.02 mm) を使用します（MSR = 28 mm, VSR = 18）。',
        solutionSteps: [
          'MSR = 28.00 mm（副尺 0 の左にある本尺目盛）。',
          '副尺分 = 18 * 0.02 mm = 0.36 mm。',
          '合計 = 28.00 + 0.36 = 28.36 mm。',
        ],
      },
      {
        prompt:
          'ゼロ誤差 +0.05 mm の 0.05 mm ノギスで軸受内径を測定したところ、MSR = 32 mm、10 番目の副尺目盛が一致しました。真の内径（mm）を求めてください。',
        hint: '観測値 (32 + 10 * 0.05) を求め、+0.05 mm のゼロ誤差を差し引きます。',
        solutionSteps: [
          '観測値 = 32.00 + (10 * 0.05) = 32.50 mm。',
          '真値 = 32.50 - (+0.05) = 32.45 mm。',
        ],
      },
      {
        prompt:
          '外側マイクロメータ（LC 0.01 mm, ピッチ 0.5 mm）で、スリーブの 12 mm とその次の 0.5 mm 目盛が見え、シンブル目盛 24 が基線に一致しています。読取値は何 mm ですか？',
        hint: '12 mm の後の 0.5 mm 目盛が見えているため、スリーブ値は 12.50 mm です。',
        solutionSteps: [
          'スリーブ = 12.00 + 0.50 = 12.50 mm。',
          'シンブル = 24 * 0.01 mm = 0.24 mm。',
          '合計 = 12.50 + 0.24 = 12.74 mm。',
        ],
      },
      {
        prompt:
          'ゼロ誤差 -0.03 mm のマイクロメータでシムを測定したところ、スリーブ 6.50 mm、シンブル 30 を示しました。真の厚さ（mm）は？',
        hint: '観測値 = 6.50 + 0.30 = 6.80 mm。-0.03 mm を引くと +0.03 mm になります。',
        solutionSteps: [
          '観測値 = 6.50 + (30 * 0.01) = 6.80 mm。',
          '真の厚さ = 6.80 - (-0.03) = 6.83 mm。',
        ],
      },
      {
        prompt:
          '1 mm 目盛の本尺 24 mm を 25 等分した特殊バーニアの最小読取値（mm）はいくらですか？',
        hint: '1 VSD = 24 / 25 = 0.96 mm。1.00 mm から差し引きます。',
        solutionSteps: [
          '1 MSD = 1.00 mm。',
          '1 VSD = 24 mm / 25 = 0.96 mm。',
          '最小読取値 = 1.00 - 0.96 = 0.04 mm。',
        ],
      },
    ],
    quiz: [
      {
        question:
          '標準的な 0.02 mm メートルノギスでは、副尺 50 目盛は本尺の何 mm に相当しますか？',
        options: ['49 mm', '50 mm', '39 mm', '24 mm'],
        explanation:
          '50 副尺目盛 = 49 mm（1 VSD = 0.98 mm）であり、1.00 - 0.98 = 0.02 mm の最小読取値になります。',
      },
      {
        question:
          'ノギスで内径（ID）を測定するために設計されている部位はどれですか？',
        options: [
          '下側の外側測定ジョウ',
          '上側の内側測定用くちばし（内測ジョウ）',
          '本尺後端のデプスバー',
          '親指ローラー固定ねじ',
        ],
        explanation:
          '上側の小さな内測ジョウは、内径や溝幅の測定に最適化されています。',
      },
      {
        question:
          'マイクロメータで測定物を挟む際、シンブルではなくラチェットストップを回す理由は何ですか？',
        options: [
          '長距離を素早く移動させるため',
          '一定の測定圧を保ち、フレームのたわみやワークの変形を防ぐため',
          '現在の測定値でスピンドルをロックするため',
          'ゼロ誤差を自動リセットするため',
        ],
        explanation:
          'ラチェットストップは規定トルクで空転し、過度な締め付けによる誤差を防ぎます。',
      },
      {
        question:
          'ゼロ誤差 +0.02 mm のマイクロメータで軸を測定した観測値が 15.48 mm でした。真の直径は？',
        options: ['15.50 mm', '15.46 mm', '15.48 mm', '15.52 mm'],
        explanation:
          '真値 = 観測値 - ゼロ誤差 = 15.48 - (+0.02) = 15.46 mm。',
      },
      {
        question:
          'スリーブの 9 mm の後の 0.5 mm 目盛が見えており、シンブルが 12 を指しているときの観測値は？',
        options: ['9.12 mm', '9.512 mm', '9.62 mm', '10.12 mm'],
        explanation:
          'スリーブ読取値 9.50 mm に 12 * 0.01 = 0.12 mm を加えて 9.62 mm です。',
      },
      {
        question:
          'ノギスやマイクロメータの目盛を読む際、視差（パララックス）誤差を最小にする方法は？',
        options: [
          '右斜め 45° から目盛を見る',
          '目盛面に対して垂直（90°）正面から直視する',
          '目盛を見る前にクランプねじを強く締める',
          '最小読取値を 2 倍にする',
        ],
        explanation:
          '目盛面に対して垂直に見ることで、副尺／シンブル端と本尺目盛の見かけのズレを防ぎます。',
      },
    ],
  },
});
