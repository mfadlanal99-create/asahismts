import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('fasteners-basics', {
  id: {
    title: 'Lab Pemula: Baut, Mur, Ring & Kelas Kekuatan',
    shortTitle: 'Baut, Mur & Ring Dasar',
    description:
      'Simulator edukasi teknik pemula untuk elemen pengencang mekanis. Pelajari identifikasi kepala baut (Hex, Allen Socket, Countersunk, Carriage, Stud), jenis mur pengunci (Nyloc, Flange, Castle + Cotter), ring antikendur (Flat, Split Spring, Nord-Lock), dekoder angka kelas kekuatan metrik ISO (4.8, 8.8, 10.9, 12.9, A2/A4), serta tabel kunci pas (M6–M16).',
    explore: [
      {
        title: 'Sistem Kelas Kekuatan Baut Metrik ISO (Property Class)',
        summary:
          'Baut metrik baja struktural menggunakan kode dua angka yang dipisahkan titik (seperti 8.8, 10.9, atau 12.9) yang dicetak timbul pada kepala baut. Angka pertama dikalikan 100 menunjukkan kekuatan tarik minimum nominal (UTS) dalam MPa (N/mm²). Angka kedua mewakili rasio kekuatan luluh (Yield Strength) terhadap kekuatan tarik nominal dikalikan 10.',
        equations: [
          {
            label: 'Kekuatan Tarik Nominal (UTS / Rm)',
            formula: 'R_m = Angka_Pertama × 100 MPa',
            note: 'Contoh kelas 8.8: 8 × 100 = 800 MPa.',
          },
          {
            label: 'Kekuatan Luluh Nominal (Yield / Re)',
            formula: 'R_e = R_m × (Angka_Kedua / 10)',
            note: 'Contoh kelas 8.8: 800 × 0.8 = 640 MPa.',
          },
          {
            label: 'Kekuatan Beban Bukti (Proof Load Sp)',
            formula: 'S_p ≈ 0.90 × R_e',
            note: 'Batas tegangan elastis tanpa deformasi permanen terukur (~580 MPa untuk kelas 8.8).',
          },
          {
            label: 'Baut Stainless Steel (ISO 3506: A2 / A4)',
            formula: 'A2-70 (AISI 304, Rm = 700 MPa) | A4-80 (AISI 316, Rm = 800 MPa)',
            note: 'A2 tahan karat umum, A4 tahan asam & air laut karena paduan Molibdenum.',
          },
        ],
        workedExample: {
          title: 'Menghitung Kekuatan Tarik dan Luluh Baut Kelas 10.9',
          given: [
            'Tipe pengencang: Baut Hex M12 Kelas Kekuatan 10.9 (DIN 933)',
            'Angka pertama = 10',
            'Angka kedua = 9',
          ],
          steps: [
            'Hitung Kekuatan Tarik Nominal (Rm): Rm = 10 × 100 = 1000 MPa (N/mm²).',
            'Hitung rasio luluh: Rasio = 9 / 10 = 0.90 (90%).',
            'Hitung Kekuatan Luluh (Re): Re = 1000 MPa × 0.90 = 900 MPa.',
            'Beban bukti elastis (Sp): Sp ≈ 830 MPa.',
          ],
          answer: 'Kekuatan Tarik = 1000 MPa, Kekuatan Luluh = 900 MPa (Baja Paduan Heat Treated)',
        },
      },
      {
        title: 'Jenis Mur, Ring & Mekanisme Penguncian Antikendur',
        summary:
          'Kendurnya sambungan baut akibat getaran siklik transversal adalah penyebab kegagalan mekanikal paling sering. Berbagai jenis mur dan ring dirancang untuk mengatasi getaran: dari mur friksi standar, mur nilon (Nyloc), mur flens bergerigi, ring pegas belah, ring baji Nord-Lock bersertifikat uji Junker, hingga penguncian mekanis positif mur mahkota (castle nut) dengan pin cotter.',
        equations: [
          {
            label: 'Penyebab Kendur (Getaran Transversal)',
            formula: 'F_transversal > μ · F_klem',
            note: 'Bila gaya geser melebihi gesekan tapak dan ulir, baut akan berputar mundur secara alami.',
          },
          {
            label: 'Prinsip Baji Nord-Lock (Tension-Based)',
            formula: 'Sudut Baji (α) > Sudut Kisar Ulir (β)',
            note: 'Pasangan baji menciptakan efek ekspansi aksial: saat baut mencoba berputar lepas, tegangan tarik justru meningkat!',
          },
        ],
        workedExample: {
          title: 'Memilih Pengunci Sambungan untuk Mesin Pengayak Bergetar',
          given: [
            'Aplikasi: Saringan getar pertambangan (Vibrating Screen)',
            'Kondisi: Getaran siklis frekuensi tinggi secara terus-menerus',
            'Opsi: Mur standar + Ring pegas DIN 127 vs Pasangan Ring Baji Nord-Lock DIN 25201',
          ],
          steps: [
            'Analisis DIN 127 (Ring pegas): Pada uji getaran Junker dinamis, ring pegas cepat menjadi pipih dan justru mempercepat kendurnya baut.',
            'Analisis Nord-Lock: Menggunakan prinsip baji (cam angle α > thread pitch angle β), memanfaatkan beban tarik bukan sekadar friksi.',
            'Rekomendasi: Pasang ring baji ganda Nord-Lock berpelumas ringan dengan baut kelas 8.8 atau 10.9.',
          ],
          answer: 'Pilih Ring Baji Nord-Lock DIN 25201 untuk keandalan antikendur maksimal.',
        },
      },
      {
        title: 'Kepala Baut, Ukuran Kunci Pas (AF) & Hubungan Torsi T = K · d · Fi',
        summary:
          'Memilih bentuk kepala baut bergantung pada ruang akses perkakas, kerataan permukaan, dan kebutuhan torsi. Baut Hex DIN 933 cocok untuk ruang bebas, Socket Cap DIN 912 untuk lubang counterbore sempit, Countersunk untuk bidang rata, dan Carriage Bolt mencegah putaran dengan leher perseginya. Torsi pengencangan referensi dihitung dari diameter baut, gaya jepit 75% beban bukti, dan faktor friksi mur K.',
        equations: [
          {
            label: 'Hubungan Torsi & Gaya Jepit Baut',
            formula: 'T = K · d · F_i',
            note: 'K ≈ 0.20 (baja kering) atau 0.15 (terlumasi), d = diameter nominal (m), Fi = gaya jepit aksial (N).',
          },
          {
            label: 'Beban Bukti Baut (Proof Load)',
            formula: 'F_p = S_p · A_s',
            note: 'Sp = tegangan bukti (MPa), As = luas penampang tegangan tarik ulir (mm²). Target jepit standar = 0.75 · Fp.',
          },
        ],
        workedExample: {
          title: 'Menghitung Torsi Pengencangan Target untuk Baut M10 Kelas 8.8 Kering',
          given: [
            'Baut M10 (d = 10 mm = 0.010 m, As = 58.0 mm²)',
            'Kelas Kekuatan 8.8 (Sp = 580 MPa)',
            'Kondisi: Baja kering (K = 0.20), target preload 75% beban bukti',
          ],
          steps: [
            'Hitung beban bukti: Fp = 580 MPa × 58.0 mm² = 33,640 N (33.64 kN).',
            'Hitung preload target (75%): Fi = 0.75 × 33,640 N = 25,230 N.',
            'Hitung torsi target: T = 0.20 × 0.010 m × 25,230 N = 50.46 N·m.',
            'Pilih kunci pas: M10 standar memakai kunci pas 17 mm (kunci L 8 mm untuk DIN 912).',
          ],
          answer: 'T = 50.5 N·m (Gunakan kunci pas 17 mm untuk DIN 933)',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          'Hitung Kekuatan Luluh (Yield Strength) nominal dalam MPa untuk baut metrik dengan kelas kekuatan (Property Class) 8.8.',
        hint: 'Kalikan angka pertama dengan 100 untuk memperoleh UTS, lalu kalikan hasilnya dengan 0.8.',
        targetValue: 640,
        unit: 'MPa',
        tolerance: 5,
        solutionSteps: [
          'Kekuatan Tarik Nominal: Rm = 8 × 100 = 800 MPa.',
          'Kekuatan Luluh: Re = 800 × 0.8 = 640 MPa.',
        ],
      },
      {
        id: 'p2',
        prompt:
          'Hitung Kekuatan Luluh (Yield Strength) nominal dalam MPa untuk baut paduan kekuatan tinggi kelas 10.9.',
        hint: 'Angka 10 menunjukkan UTS = 1000 MPa, dan angka .9 menunjukkan rasio luluh 90%.',
        targetValue: 900,
        unit: 'MPa',
        tolerance: 5,
        solutionSteps: [
          'Kekuatan Tarik Nominal: Rm = 10 × 100 = 1000 MPa.',
          'Kekuatan Luluh: Re = 1000 × 0.9 = 900 MPa.',
        ],
      },
      {
        id: 'p3',
        prompt:
          'Berapakah ukuran kunci pas / spanner (Across Flats - AF) dalam mm yang tepat untuk kepala baut heksagonal standar M10 (DIN 933)?',
        hint: 'Standar DIN 933 untuk ulir M10 menggunakan kunci pas 17 mm.',
        targetValue: 17,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'Berdasarkan standar DIN 933 / ISO 4017 untuk ulir M10 standar, lebar kepala baut (s) adalah 17 mm.',
        ],
      },
      {
        id: 'p4',
        prompt:
          'Berapakah ukuran kunci pas / spanner (AF) dalam mm untuk mengencangkan baut heksagonal standar M12 (DIN 933)?',
        hint: 'Urutan standar DIN 933: M6→10mm, M8→13mm, M10→17mm, M12→19mm, M16→24mm.',
        targetValue: 19,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'Berdasarkan standar DIN 933 untuk baut M12, lebar across-flats kepala baut adalah 19 mm.',
        ],
      },
      {
        id: 'p5',
        prompt:
          'Gunakan persamaan torsi T = K · d · Fi untuk menghitung torsi pengencangan (N·m) baut M10 (d = 10 mm) pada kondisi kering (K = 0.20) dengan target gaya jepit Fi = 25 kN.',
        hint: 'Karena 1 N·m / 1 mm = 1 kN, gunakan T = 0.20 × 10 × 25.',
        targetValue: 50,
        unit: 'N·m',
        tolerance: 1,
        solutionSteps: [
          'Konversi satuan SI: d = 0.010 m, Fi = 25,000 N.',
          'Hitung Torsi: T = 0.20 × 0.010 × 25,000 = 50.0 N·m.',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'Pada kode kelas kekuatan baut metrik ISO "10.9", apakah arti dari angka "10" dan angka ".9"?',
        options: [
          'Kekuatan tarik nominal 1000 MPa, dan kekuatan luluh 90% dari kekuatan tarik (900 MPa)',
          'Panjang baut 10 cm dengan diameter ulir 9 mm',
          'Toleransi ulir kelas 10 dengan pitch 0.9 mm',
          'Baut dapat dikencangkan hingga 10 putaran dengan beban 9 kN',
        ],
        explanation:
          'Pada sistem metrik ISO, angka pertama dikalikan 100 menghasilkan kekuatan tarik nominal (10 × 100 = 1000 MPa). Angka kedua mewakili rasio kekuatan luluh terhadap kekuatan tarik nominal (0.9 × 1000 = 900 MPa).',
      },
      {
        id: 'q2',
        question:
          'Apakah prinsip kerja utama dari sepasang ring baji Nord-Lock (DIN 25201) dalam mencegah kendurnya sambungan akibat getaran berat?',
        options: [
          'Memanfaatkan sudut kemiringan baji (α) yang lebih besar dari kisar ulir baut (β) sehingga getaran justru menciptakan efek pasak pengencang',
          'Menggunakan lem perekat anaerobik cair di dalam alur ring',
          'Menyerap getaran dengan bantalan karet elastomer elastis',
          'Menahan baut murni dengan gaya gesek permukaan datar biasa',
        ],
        explanation:
          'Ring Nord-Lock menggunakan prinsip efek baji (wedge locking) bukan friksi. Karena sudut baji internal (α) lebih besar daripada sudut heliks ulir baut (β), kecenderungan mur berputar lepas justru memaksa baji naik dan memperbesar tegangan jepit baut.',
      },
      {
        id: 'q3',
        question:
          'Jenis mur apakah yang memiliki celah mahkota berlubang tempat diselipkannya pin split / cotter pin untuk memberikan penguncian mekanis positif?',
        options: [
          'Castle Nut (Mur Mahkota DIN 935)',
          'Nyloc Nut (DIN 985)',
          'Serrated Flange Nut (DIN 6923)',
          'Cap Acorn Nut (DIN 1587)',
        ],
        explanation:
          'Castle Nut (mur mahkota / castellated nut) memiliki alur mahkota di bagian atasnya. Sebuah cotter pin dimasukkan melintasi alur mahkota dan tembus ke lubang pada poros baut, memberikan penguncian fisik positif yang tidak mungkin berputar lepas.',
      },
      {
        id: 'q4',
        question:
          'Mengapa mur Nyloc (DIN 985) disarankan diganti baru setelah 2–3 kali pembongkaran atau pada aplikasi kritis?',
        options: [
          'Cincin polimer nilon di dalamnya mengalami deformasi plastis permanen sehingga torsi pengunci friksinya melemah',
          'Nilon dapat meleleh pada suhu ruangan standar',
          'Ulir baja pada mur Nyloc tidak dikeraskan sama sekali',
          'Mur Nyloc hanya bisa dipakai dengan ring pegas DIN 127',
        ],
        explanation:
          'Cincin nilon pada mur Nyloc bekerja dengan cara terdeformasi mengikuti profil ulir jantan untuk menciptakan gesekan pengunci. Setelah dipasang-lepas berulang kali, nilon kehilangan elastisitas cengkeramnya sehingga perlu diganti baru.',
      },
      {
        id: 'q5',
        question:
          'Apa temuan utama pengujian getaran transversal Junker terhadap Ring Pegas Belah (Split Spring Lock Washer DIN 127)?',
        options: [
          'Ring pegas cepat memipih pada beban klem normal dan sering mempercepat kendurnya baut di bawah getaran siklik',
          'Ring pegas memiliki daya kunci lebih kuat dari Nord-Lock maupun pin cotter',
          'Ring pegas menghilangkan kebutuhan akan mur pengunci di mesin bergetar berat',
          'Ring pegas hanya boleh dipasang di bawah kepala baut Countersunk',
        ],
        explanation:
          'Uji getaran dinamis Junker menunjukkan bahwa pada torsi pengencangan normal, ring pegas DIN 127 sudah tertekan rata sepenuhnya sehingga bekerja hanya sebagai ring datar biasa dan tidak mampu menahan rotasi balik akibat getaran transversal.',
      },
      {
        id: 'q6',
        question:
          'Bila peralatan pabrik berada di lingkungan asam kimia atau semprotan air laut lepas pantai, baja tahan karat kelas apakah yang paling sesuai?',
        options: [
          'Stainless A4-80 (AISI 316 dengan paduan Molibdenum, Rm 800 MPa)',
          'Baja karbon rendah kelas 4.8 tanpa pelapisan',
          'Baja paduan hitam kelas 12.9 tanpa pelindung korosi',
          'Stainless A2-70 (AISI 304 standar tanpa Molibdenum)',
        ],
        explanation:
          'Stainless Steel A4 (AISI 316) mengandung tambahan 2–3% Molibdenum yang memberikan ketahanan jauh lebih tinggi terhadap korosi sumuran (pitting) akibat klorida/air laut dan bahan kimia dibandingkan A2 (AISI 304).',
      },
    ],
  },
  ja: {
    title: '入門ラボ：ボルト・ナット・座金と強度区分基礎',
    shortTitle: 'ボルト・座金基礎',
    description:
      '機械要素入門シミュレータ。ボルト頭部形状（六角・六角穴付き・皿・根角・植込み）、緩み止めナット（ナイロック・歯付フランジ・溝付きキャッスルナット）、座金（平座金・ばね座金・ノルトロックくさび座金）、ISO強度区分（4.8, 8.8, 10.9, 12.9, A2/A4）の読み方、推奨スパナ二面幅（M6〜M16）を学びます。',
    explore: [
      {
        title: 'メートルねじの強度区分（Property Class）の読み方',
        summary:
          'ISOメートル鋼製ボルトの頭部には「8.8」「10.9」「12.9」といった強度区分が刻印されています。小数点の前の数字に100を掛けると公称引張強さ（UTS、単位: MPaまたはN/mm²）になり、小数点の後の数字は引張強さに対する降伏点（耐力）の比率（0.8＝80%、0.9＝90%）を表します。',
        equations: [
          {
            label: '公称引張強さ（Rm）',
            formula: 'R_m = 最初の数字 × 100 MPa',
            note: '例：強度区分8.8 → 8 × 100 = 800 MPa（N/mm²）。',
          },
          {
            label: '公称降伏点 / 耐力（Re）',
            formula: 'R_e = R_m × (2番目の数字 / 10)',
            note: '例：強度区分8.8 → 800 × 0.8 = 640 MPa。',
          },
          {
            label: '耐力保証荷重応力（Proof Stress Sp）',
            formula: 'S_p ≈ 0.90 × R_e',
            note: '永久ひずみが発生しない弾性限界保証荷重（8.8では約580 MPa）。',
          },
          {
            label: 'ステンレス鋼製ボルト（A2 / A4）',
            formula: 'A2-70（SUS304相当、Rm=700 MPa）| A4-80（SUS316耐酸・耐海水、Rm=800 MPa）',
            note: '「A」はオーステナイト系、「-70」は引張強さ700 MPa以上を示します。',
          },
        ],
        workedExample: {
          title: '強度区分10.9ボルトの引張強さと降伏耐力の計算',
          given: [
            'ボルト規格：六角ボルト M12 強度区分 10.9（DIN 933）',
            '最初の数字 = 10',
            '小数点の数字 = 9',
          ],
          steps: [
            '引張強さ（Rm）を算出：10 × 100 = 1000 MPa。',
            '降伏比を算出：9 / 10 = 0.90（90%）。',
            '降伏耐力（Re）を算出：1000 MPa × 0.90 = 900 MPa。',
            '保証荷重応力（Sp）：約830 MPa。',
          ],
          answer: '引張強さ Rm = 1000 MPa、降伏耐力 Re = 900 MPa',
        },
      },
      {
        title: 'ナット・座金の種類と振動緩み止めメカニズム',
        summary:
          'ボルト締結体の破損の主原因は、横方向振動による自然緩みです。ナイロンインサートナット（ナイロック）、ギザ付きフランジナット、ばね座金（スプリングワッシャ）、ノルトロック（くさびロッキングワッシャ）、割りピンを用いるキャッスル（溝付き）ナットなど、要求される耐振性・信頼性に応じた使い分けが不可欠です。',
        equations: [
          {
            label: '横振動緩み限界',
            formula: 'F_横振動 > μ · F_締付力',
            note: 'ねじ部および座面の摩擦力を超えるせん断変位が生じると、ねじは自転緩み（Junkerテストで検証）を起こします。',
          },
          {
            label: 'ノルトロックのくさび原理',
            formula: 'くさび角（α） > ねじリード角（β）',
            note: '内側のくさび面角度がねじのリード角より大きいため、緩み回転すると座金が押し広げられ締結軸力が増加します。',
          },
        ],
        workedExample: {
          title: '振動ふるい機への耐振座金選定',
          given: [
            '機械：砕石場用高周波振動スクリーン',
            '課題：従来のばね座金（スプリングワッシャ）ではボルトが短時間で緩み脱落する',
          ],
          steps: [
            'ばね座金（DIN 127）の評価：強い横振動を受けると平坦化し、むしろ緩みを促進することがJunker試験で立証されています。',
            'ノルトロック座金（DIN 25201）の適用：摩擦に依存せず、くさび機構（α > β）により張力でロックするため、激しい振動下でも緩みません。',
          ],
          answer: 'ノルトロックくさび座金（DIN 25201）を選定し、適切なトルクで管理する。',
        },
      },
      {
        title: 'ボルト頭部形状・スパナ二面幅（AF）と締付トルク T = K · d · Fi',
        summary:
          'ボルト頭部の選定は工具スペース、表面の平滑性、必要な締付トルクにより決まります。六角ボルト（DIN 933）は汎用、六角穴付きボルト（DIN 912）は座ぐり穴での高トルク締付、皿ボルトは面一化、根角ボルトは回り止め用です。推奨締付トルクは目標軸力（保証荷重の75%）とトルク係数Kから求めます。',
        equations: [
          {
            label: '締付トルクと軸力の関係式',
            formula: 'T = K · d · F_i',
            note: 'K ≈ 0.20（ドライ）または 0.15（潤滑）、d = 呼び径 (m)、Fi = 目標軸力 (N)。',
          },
          {
            label: '保証荷重（Proof Load）',
            formula: 'F_p = S_p · A_s',
            note: 'Sp = 保証荷重応力 (MPa)、As = ねじ有効断面積 (mm²)。推奨初期軸力は Fp の 75% です。',
          },
        ],
        workedExample: {
          title: 'M10 強度区分 8.8 ボルト（ドライ）の目標締付トルク計算',
          given: [
            'ボルト：M10（d = 10 mm = 0.010 m、有効断面積 As = 58.0 mm²）',
            '強度区分 8.8（保証荷重応力 Sp = 580 MPa）',
            '条件：無潤滑ドライ（K = 0.20）、目標軸力 = 保証荷重の75%',
          ],
          steps: [
            '保証荷重を算出：Fp = 580 MPa × 58.0 mm² = 33,640 N（33.64 kN）。',
            '目標軸力を算出：Fi = 0.75 × 33,640 N = 25,230 N。',
            '目標トルクを算出：T = 0.20 × 0.010 m × 25,230 N = 50.46 N·m。',
            '工具選定：DIN 933 M10 の二面幅は 17 mm（DIN 912 六角穴は 8 mm）。',
          ],
          answer: 'T = 50.5 N·m（スパナ二面幅 17 mm）',
        },
      },
    ],
    practice: [
      {
        id: 'p1',
        prompt:
          '強度区分（Property Class）8.8のメートルボルトの公称降伏耐力（Yield Strength）は何MPaですか？',
        hint: '最初の数字×100で引張強さを求め、それに0.8を掛けます。',
        targetValue: 640,
        unit: 'MPa',
        tolerance: 5,
        solutionSteps: [
          '引張強さ：Rm = 8 × 100 = 800 MPa。',
          '降伏耐力：Re = 800 × 0.8 = 640 MPa。',
        ],
      },
      {
        id: 'p2',
        prompt:
          '強度区分 10.9 の高張力ボルトの公称降伏耐力（Re）は何MPaですか？',
        hint: '10 × 100 = 1000 MPa（引張強さ）に 0.9 を掛けます。',
        targetValue: 900,
        unit: 'MPa',
        tolerance: 5,
        solutionSteps: [
          '引張強さ：Rm = 10 × 100 = 1000 MPa。',
          '降伏耐力：Re = 1000 × 0.9 = 900 MPa。',
        ],
      },
      {
        id: 'p3',
        prompt:
          '標準的な六角ボルト M10（DIN 933 / ISO 4017）の頭部を締結する際に使用するスパナ（レンチ）の推奨二面幅（Across Flats）は何mmですか？',
        hint: 'DIN 933 規格の M10 ボルト二面幅は 17 mm です。',
        targetValue: 17,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'メートルねじ規格 DIN 933 の M10 ボルト二面幅（s）は 17 mm です。',
        ],
      },
      {
        id: 'p4',
        prompt:
          '標準的な六角ボルト M12（DIN 933）に使用するスパナの推奨二面幅（AF）は何mmですか？',
        hint: 'M6→10mm、M8→13mm、M10→17mm、M12→19mm、M16→24mm です。',
        targetValue: 19,
        unit: 'mm',
        tolerance: 0.5,
        solutionSteps: [
          'DIN 933 規格における M12 六角ボルトの推奨スパナ二面幅は 19 mm です。',
        ],
      },
      {
        id: 'p5',
        prompt:
          'トルク式 T = K · d · Fi を用いて、呼び径 M10（d = 10 mm）、無潤滑ドライ（K = 0.20）、目標軸力 Fi = 25 kN のときの締付トルク（N·m）を求めてください。',
        hint: '1 N·m / 1 mm = 1 kN より、T = 0.20 × 10 × 25 を計算します。',
        targetValue: 50,
        unit: 'N·m',
        tolerance: 1,
        solutionSteps: [
          'SI単位換算：d = 0.010 m、Fi = 25,000 N。',
          'T = 0.20 × 0.010 × 25,000 = 50.0 N·m。',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        question:
          'ボルト頭部に刻印された強度区分「10.9」において、「10」と「.9」が表す意味として最も適切なものはどれですか？',
        options: [
          '公称引張強さ 1000 MPa、および降伏耐力が引張強さの90%（900 MPa）',
          'ボルト呼び径が10 mm、ねじピッチが0.9 mm',
          '締付限界トルクが10 N・m、耐用年数が9年',
          '引張強さが10 GPa、伸び率が9%',
        ],
        explanation:
          'ISO規格では、最初の数字×100が最小引張強さ（10 × 100 = 1000 MPa）、小数点の数字が引張強さに対する降伏耐力の比率（0.9 × 1000 = 900 MPa）を示します。',
      },
      {
        id: 'q2',
        question:
          'ノルトロック座金（ペアくさびワッシャ）が過酷な振動下でも緩まない理由として正しいものはどれですか？',
        options: [
          '座金内側のくさび角度（α）がねじのリード角（β）より大きく設計されており、緩み方向に回ろうとすると軸力が増加するため',
          '特殊な接着剤が塗布されており、締め付けると化学反応で固着するため',
          'ゴムの弾性によってボルトの自転を吸収するため',
          '座面を完全に鏡面にすることで摩擦係数をゼロにするため',
        ],
        explanation:
          'ノルトロック座金は摩擦力ではなく張力（くさび効果）を利用します。くさび角α > ねじリード角βとなっているため、ボルトが緩み方向に回転しようとするとカム面が乗り上げて軸が引き伸ばされ、締結力がかえって強固になります。',
      },
      {
        id: 'q3',
        question:
          '上部にスロット（溝）が設けられており、ボルト軸の貫通穴に割りピンを通すことで物理的な緩み止めを行うナットはどれですか？',
        options: [
          'キャッスルナット（溝付き / 溝形ナット DIN 935）',
          'ナイロックナット（ナイロンインサートナット）',
          'フランジナット（座金付きナット）',
          '袋ナット（キャップナット）',
        ],
        explanation:
          'キャッスルナット（城郭状の溝があるナット）は、ボルト軸に開けられた横穴と溝を合わせて割りピン（コッターピン）を差し込み、ピンの足を折り曲げることで機械的なポジティブロック（絶対脱落防止）を実現します。',
      },
      {
        id: 'q4',
        question:
          'ナイロックナット（DIN 985）を2〜3回以上再使用したり重要保安部品で再利用しないことが推奨される理由は何ですか？',
        options: [
          '内部のナイロンリングがねじ山で塑性変形し、繰り返し着脱するとプリベリング摩擦トルクが低下するため',
          'ナイロンが常温で蒸発するため',
          '鋼鉄部分が焼き入れされていないため',
          '一度締めると溶接されて外れなくなるため',
        ],
        explanation:
          'ナイロックナットの樹脂リングは相手ねじ山によって弾塑性変形して摩擦抵抗を生みます。複数回の着脱で樹脂の食い付きが摩耗・緩和すると緩み止めトルクが失われます。',
      },
      {
        id: 'q5',
        question:
          '横振動試験（ユンカー試験）において、一般的なばね座金（スプリングワッシャ DIN 127）について知られている事実はどれですか？',
        options: [
          '通常の締付軸力下で完全に平坦化（圧潰）してしまい、激しい横振動下では緩み防止効果がほとんどなく緩みを助長することすらある',
          'ノルトロックや割りピンよりも高い耐振動性能を示す',
          'いかなる振動下でも絶対に軸力を失わない',
          '皿ボルト専用に設計されている',
        ],
        explanation:
          'DIN 127 ばね座金は初期圧縮で平らに押し潰されると単なる平座金と同等になり、激しい横振動（ユンカー試験）に対する回転緩み止め効果を持たないことが実証されています。',
      },
      {
        id: 'q6',
        question:
          '海岸・海洋環境や化学プラントの耐食用途において、最も推奨されるステンレス鋼製ボルトの強度区分はどれですか？',
        options: [
          'A4-80（モリブデン添加 SUS316 系、引張強さ 800 MPa）',
          '強度区分 4.8 の無処理炭素鋼',
          '強度区分 12.9 の黒染め合金鋼',
          'A2-70（SUS304 相当、モリブデン無添加）',
        ],
        explanation:
          'A4（SUS316相当）は2〜3%のモリブデンを含有しており、塩化物や海洋環境・薬品に対する耐孔食性がA2（SUS304相当）より格段に優れています。',
      },
    ],
  },
});
