import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('loto-safety', {
  id: {
    title: 'Lab LOTO (Lockout / Tagout) & Verifikasi Energi Nol',
    shortTitle: 'LOTO & Energi Nol',
    description:
      'Kuasai prosedur isolasi energi berbahaya OSHA 1910.147 pada panel MCC listrik, akumulator hidrolik, mesin pres pneumatik, dan konveyor sumber ganda menggunakan gembok pribadi, label bahaya, uji multimeter Live-Dead-Live, serta verifikasi Try-Out.',
    explore: [
      {
        title: 'Urutan Enam Langkah LOTO OSHA 1910.147',
        summary:
          'Prosedur Penguncian dan Pelabelan (Lockout/Tagout atau LOTO) mencegah penyalaan tak terduga maupun pelepasan energi tersimpan selama pemeliharaan mesin. Setiap pekerja berwenang wajib memasang gembok pengaman pribadi dan label bahaya ("Satu Orang, Satu Gembok, Satu Kunci") setelah seluruh sumber energi diisolasi.',
        equations: [
          {
            label: 'Enam Langkah Wajib (OSHA 1910.147)',
            formula: '1. Beritahu → 2. Hentikan → 3. Isolasi → 4. Kunci/Label → 5. Kuras/Ganjal → 6. Verifikasi',
            note: 'Jangan pernah melewati Langkah 2 (penghentian normal) sebelum membuka pemutus beban, dan jangan melewati Langkah 6 (verifikasi).',
          },
          {
            label: 'Aturan Larangan Tag-Only',
            formula: 'Pemutus Dapat Dikunci ⇒ Wajib Gembok Pengaman + Label Bahaya',
            note: 'Label (tag) saja hanya bersifat peringatan visual dan tidak memberikan penguncian fisik.',
          },
        ],
        workedExample: {
          title: 'Mengisolasi Pompa Sentrifugal 480 V untuk Penggantian Mechanical Seal',
          given: [
            'Peralatan: Pompa sentrifugal 3-fasa 480 V dengan tekanan buang 8.5 bar',
            'Pekerjaan: Penggantian mechanical seal poros (wajib bebas energi listrik dan fluida)',
          ],
          steps: [
            'Informasikan operator terkait dan tekan tombol Stop normal pada stasiun kontrol lokal.',
            'Buka sakelar pemutus MCC 480 V, lalu tutup katup isolasi isap (suction) dan buang (discharge).',
            'Pasang gembok pribadi dan Label Bahaya bertanda tangan pada gagang MCC serta hasp katup.',
            'Buka katup kuras/buang (bleed valve) casing hingga manometer menunjukkan 0.0 bar.',
            'Lakukan uji multimeter Live-Dead-Live (0.0 V AC) dan tekan tombol Start (Try-Out).',
          ],
          answer: 'Kondisi Energi Nol terverifikasi (0 V AC, 0.0 bar, Try-Out negatif) — aman untuk membongkar seal.',
        },
      },
      {
        title: 'Pengendalian Multi-Energi & Energi Tersimpan (Fluida, Gravitasi, Kapasitor)',
        summary:
          'Membuka pemutus listrik utama tidak serta-merta membuat mesin aman apabila masih terdapat energi mekanis, hidrolik, pneumatik, atau kapasitif yang tersimpan. Akumulator bertekanan, ram mesin pres yang menggantung, serta kapasitor bus DC pada VFD dapat melepaskan energi mematikan meskipun MCC telah dikunci.',
        equations: [
          {
            label: 'Waktu Pengosongan Kapasitor Bus DC VFD',
            formula: 't_aman ≥ 5 · τ = 5 · R_bleed · C_bus',
            note: 'Tunggu minimal 5 konstanta waktu (umumnya 5–15 menit sesuai pabrikan) dan pastikan < 50 V DC (target 0 V) dengan meter CAT IV.',
          },
          {
            label: 'Energi Tersimpan Akumulator Hidrolik (Isotermal)',
            formula: 'E ≈ P · V · ln(P₁ / P₂)',
            note: 'Selalu buka katup buang/kuras akumulator dan pastikan manometer terkalibrasi menunjuk 0 bar sebelum melepas selang.',
          },
        ],
        workedExample: {
          title: 'Memverifikasi Pengosongan Bus DC VFD 650 V Sebelum Membuka Panel',
          given: [
            'Kapasitansi bus DC VFD C = 4,700 µF (0.0047 F)',
            'Resistor penguras internal R = 10 kΩ (10,000 Ω)',
          ],
          steps: [
            'Hitung konstanta waktu RC: τ = R · C = 10,000 × 0.0047 = 47 detik.',
            'Waktu pengosongan penuh 5τ = 5 × 47 = 235 detik (≈ 4 menit).',
            'Ukur langsung terminal +DC dan -DC menggunakan multimeter CAT IV untuk memastikan 0 V DC.',
          ],
          answer: 'Tunggu 5τ (235 detik) dan pastikan pembacaan 0 V DC secara langsung dengan multimeter.',
        },
      },
      {
        title: 'Protokol Verifikasi Live-Dead-Live & Uji Coba (Try-Out)',
        summary:
          'Multimeter dengan sekering putus atau baterai habis akan menampilkan 0 V palsu pada sirkuit 480 V yang masih bertegangan. Protokol Live-Dead-Live (Test-Before-Touch) membuktikan alat ukur berfungsi baik sebelum dan sesudah memeriksa peralatan terisolasi, diikuti uji coba fisik tombol Start (Try-Out).',
        equations: [
          {
            label: 'Pengujian Live-Dead-Live (Test-Before-Touch)',
            formula: '1. Uji Sumber LIVE → 2. Uji Target DEAD (0 V) → 3. Uji Ulang Sumber LIVE',
            note: 'Ukur antar-fasa (L1-L2, L2-L3, L3-L1) dan fasa-ke-arde/ground (L1-G, L2-G, L3-G).',
          },
          {
            label: 'Pemeriksaan Sumber Ganda / Umpan Balik (Backfeed)',
            formula: 'V_sisa = 0 V AC/DC pada SELURUH terminal kontrol & daya',
            note: 'Tegangan kontrol asing (120 V / 24 V) dari interlock PLC sering tetap bertegangan meski MCC utama 480 V sudah dikunci.',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'loto-p1',
        prompt:
          'Sebuah bus DC VFD memiliki kapasitansi C = 2,000 µF (0.002 F) dan resistor penguras R = 15,000 Ω. Hitung waktu tunggu pengosongan aman minimum (5τ) dalam detik.',
        hint: 'Gunakan τ = R × C, lalu kalikan 5.',
        targetValue: 150,
        unit: 's',
        tolerance: 1,
        solutionSteps: [
          'Hitung konstanta waktu τ = R × C = 15,000 Ω × 0.002 F = 30 detik.',
          'Pengosongan penuh memerlukan 5τ = 5 × 30 detik = 150 detik.',
        ],
      },
      {
        id: 'loto-p2',
        prompt:
          'Sebuah konveyor sumber ganda memiliki 1 pemutus MCC utama 480 V, 1 pemutus kontrol sekunder 120 V, dan 1 katup pengunci udara pneumatik. Jika 3 teknisi bekerja bersamaan dengan LOTO individu, berapa total gembok pengaman pribadi yang wajib dipasang?',
        hint: 'Setiap teknisi wajib memasang 1 gembok pribadi pada setiap titik isolasi (3 titik × 3 teknisi).',
        targetValue: 9,
        unit: 'gembok',
        tolerance: 0,
        solutionSteps: [
          'Jumlah titik isolasi energi = 3.',
          'Jumlah teknisi berwenang = 3.',
          'Total gembok pribadi = 3 titik × 3 teknisi = 9 gembok.',
        ],
      },
      {
        id: 'loto-p3',
        prompt:
          'Akumulator hidrolik menyimpan tekanan 210 bar. Setelah katup isolasi pompa ditutup, Anda membuka katup buang dan tekanan turun linear sebesar 35 bar/detik. Berapa detik waktu yang dibutuhkan hingga mencapai 0 bar?',
        hint: 'Waktu = Tekanan Awal / Laju Pengurasan.',
        targetValue: 6,
        unit: 's',
        tolerance: 0.2,
        solutionSteps: [
          'Tekanan awal P = 210 bar.',
          'Laju pengurasan = 35 bar/detik.',
          'Waktu menuju 0 bar = 210 / 35 = 6 detik.',
        ],
      },
      {
        id: 'loto-p4',
        prompt:
          'Pada pengujian Live-Dead-Live MCC 3-fasa 480 V, berapa jumlah pengukuran tegangan yang dilakukan pada sisi beban terisolasi (seluruh pasangan antar-fasa ditambah seluruh pasangan fasa-ke-arde)?',
        hint: 'Hitung L1-L2, L2-L3, L3-L1 ditambah L1-G, L2-G, L3-G.',
        targetValue: 6,
        unit: 'pengukuran',
        tolerance: 0,
        solutionSteps: [
          'Pasangan antar-fasa: L1-L2, L2-L3, L3-L1 (3 pengukuran).',
          'Pasangan fasa-ke-arde: L1-G, L2-G, L3-G (3 pengukuran).',
          'Total pengukuran sisi beban = 3 + 3 = 6 pengukuran.',
        ],
      },
    ],
    quiz: [
      {
        id: 'loto-q1',
        question: 'Mengapa teknisi wajib melakukan langkah ketiga ("Uji ulang sumber LIVE yang diketahui") dalam verifikasi Live-Dead-Live?',
        options: [
          'Untuk mengosongkan kapasitansi sisa di dalam multimeter',
          'Untuk membuktikan multimeter tidak rusak atau putus sekering selama pengujian berlangsung',
          'Untuk mereset unit trip MCC sebelum memasang gembok',
          'Untuk mengkalibrasi manometer ke angka 0 bar',
        ],
        correctIndex: 1,
        explanation:
          'Menguji ulang sumber bertegangan yang diketahui memastikan alat ukur berfungsi normal baik sebelum maupun sesudah mengukur 0 V pada peralatan terisolasi.',
      },
      {
        id: 'loto-q2',
        question: 'Berdasarkan OSHA 1910.147, kapan isolasi "Tag-Only" (hanya label bahaya tanpa gembok) diperbolehkan pada pemutus yang dapat dikunci?',
        options: [
          'Apabila pekerjaan pemeliharaan berlangsung kurang dari 15 menit',
          'Tidak pernah — jika perangkat isolasi energi dapat dikunci, gembok pengaman wajib digunakan',
          'Hanya jika pengawas menandatangani izin kerja panas',
          'Apabila tegangan sirkuit di bawah 240 V',
        ],
        correctIndex: 1,
        explanation:
          'OSHA 1910.147 mewajibkan perangkat pengunci fisik (gembok) setiap kali alat isolasi dapat dikunci; label saja tidak memberikan penahanan fisik.',
      },
      {
        id: 'loto-q3',
        question: 'Anda mengunci MCC pompa 480 V dan menutup katup isolasi mesin pres hidrolik, namun manometer masih terbaca 210 bar. Apa penyebabnya?',
        options: [
          'Energi terjebak di dalam akumulator hidrolik — katup buang/kuras belum dibuka',
          'Baterai multimeter lemah',
          'Blok pengaman gravitasi terlalu berat',
          'Tombol Start belum ditekan',
        ],
        correctIndex: 0,
        explanation:
          'Menutup katup isolasi menjebak tekanan di sisi hilir. Katup buang/kuras (bleed valve) wajib dibuka untuk menurunkan tekanan akumulator hingga 0 bar.',
      },
      {
        id: 'loto-q4',
        question: 'Bahaya apa yang masih dapat bertegangan di dalam panel kontrol meskipun pemutus MCC utama 480 V telah dikunci?',
        options: [
          'Inersia impeler pompa sentrifugal saja',
          'Umpan balik (backfeed) kontrol sekunder 120 V / 24 V dari panel PLC atau MCC lain',
          'Tekanan udara atmosfer',
          'Gesekan statis pada belenggu gembok',
        ],
        correctIndex: 1,
        explanation:
          'Sirkuit kontrol asing/sekunder (dual backfeed) sering berasal dari panel PLC atau sumber terpisah dan tetap aktif hingga diisolasi secara tersendiri.',
      },
      {
        id: 'loto-q5',
        question: 'Apa tujuan langkah "Try-Out" (menekan tombol Start normal) setelah pemasangan LOTO?',
        options: [
          'Untuk memanaskan bantalan motor sebelum pembongkaran',
          'Untuk memastikan pemutus yang tepat telah diisolasi dan mesin benar-benar tidak dapat menyala',
          'Untuk menguras tangki oli hidrolik',
          'Untuk menguji lampu indikator tombol darurat',
        ],
        correctIndex: 1,
        explanation:
          'Try-Out secara fisik memverifikasi bahwa mesin yang diisolasi tidak dapat beroperasi—mendeteksi kesalahan label pemutus atau sumber energi yang terlewat.',
      },
    ],
  },
  ja: {
    title: 'LOTO（ロックアウト・タグアウト）＆ゼロエネルギー検証ラボ',
    shortTitle: 'LOTO & ゼロエネルギー',
    description:
      'OSHA 1910.147 に準拠し、電気 MCC・油圧アキュムレータ・重力ラム付空圧プレス・二系統電源コンベアにおける危険エネルギー遮断、個人用南京錠・危険タグ、Live-Dead-Live 検電試験、起動試行（Try-Out）を習得します。',
    explore: [
      {
        title: 'OSHA 1910.147 LOTO 6ステップ手順',
        summary:
          'ロックアウト・タグアウト（LOTO）は、保守・点検中の予期せぬ起動や残留エネルギー放出を防止します。作業者はすべてのエネルギー源を遮断した後、必ず個人用南京錠と危険タグ（「一人一錠一鍵」原則）を取り付けます。',
        equations: [
          {
            label: '必須6ステップ（OSHA 1910.147）',
            formula: '1. 通知 → 2. 通常停止 → 3. 遮断 → 4. 施錠・タグ → 5. 放出・拘束 → 6. 検証',
            note: '負荷遮断器を開く前にステップ2（通常停止）を省略せず、作業前にステップ6（検証）を必ず実施します。',
          },
          {
            label: 'タグのみ（施錠なし）禁止原則',
            formula: '施錠可能な遮断装置 ⇒ 南京錠 + 危険タグの両方が必須',
            note: 'タグ単体は警告表示に過ぎず、誤操作を物理的に防止できません。',
          },
        ],
        workedExample: {
          title: 'メカニカルシール交換のための 480 V 遠心ポンプ遮断手順',
          given: [
            '対象設備：三相 480 V 遠心ポンプ（吐出圧力 8.5 bar）',
            '作業内容：軸封メカニカルシール交換（電気・流体ゼロエネルギー必須）',
          ],
          steps: [
            '運転員へ通知し、現場操作盤の通常停止（Stop）ボタンでポンプを停止する。',
            '480 V MCC 遮断器を開放し、吸込側・吐出側プロセス遮断弁を全閉にする。',
            'MCC ハンドルおよび弁施錠具に個人用南京錠と署名入り危険タグを取り付ける。',
            'ケーシングドレン弁を開き、圧力計が 0.0 bar になるまで残圧を抜く。',
            'Live-Dead-Live 検電試験（0.0 V AC）を実施し、起動ボタン（Try-Out）で起動しないことを確認する。',
          ],
          answer: 'ゼロエネルギー状態検証完了（0 V AC、0.0 bar、Try-Out 異常なし）— 作業安全。',
        },
      },
      {
        title: '複合エネルギーと残留エネルギー制御（流体圧・重力・コンデンサ）',
        summary:
          '主電源遮断器を開放しても、油圧アキュムレータの蓄圧、吊り下げプレスの重力、VFD の DC バスコンデンサ残留電荷などのエネルギーが残存する場合があります。',
        equations: [
          {
            label: 'VFD DC バスコンデンサ放電時間',
            formula: 't_safe ≥ 5 · τ = 5 · R_bleed · C_bus',
            note: '少なくとも時定数の 5 倍（5τ）待機し、CAT IV テスタで 0 V DC を直接確認します。',
          },
          {
            label: '油圧アキュムレータ蓄圧エネルギー（等温）',
            formula: 'E ≈ P · V · ln(P₁ / P₂)',
            note: '配管を外す前に必ずブリード弁を開放し、校正済み圧力計で 0 bar を確認してください。',
          },
        ],
      },
      {
        title: 'Live-Dead-Live 検電試験と Try-Out プロトコル',
        summary:
          'ヒューズ切れや電池切れのテスタは活線でも 0 V と表示する危険があります。Live-Dead-Live（接触前試験）により、測定対象の前後に既知の活線でテスタの正常性を証明します。',
        equations: [
          {
            label: 'Live-Dead-Live（3段階検電）',
            formula: '1. 既知活線 LIVE → 2. 対象機器 DEAD (0 V) → 3. 既知活線 LIVE 再確認',
            note: '線間（L1-L2, L2-L3, L3-L1）および対地間（L1-G, L2-G, L3-G）をすべて測定します。',
          },
        ],
      },
    ],
    practice: [
      {
        id: 'loto-p1',
        prompt:
          'VFD の DC バス静電容量が C = 2,000 µF (0.002 F)、放電抵抗が R = 15,000 Ω のとき、安全放電待機時間（5τ）は何秒ですか？',
        hint: 'τ = R × C を計算し、5 倍します。',
        targetValue: 150,
        unit: 's',
        tolerance: 1,
        solutionSteps: [
          '時定数 τ = R × C = 15,000 Ω × 0.002 F = 30 s。',
          '完全放電の目安は 5τ = 5 × 30 s = 150 s。',
        ],
      },
      {
        id: 'loto-p2',
        prompt:
          '主 480 V MCC 遮断器、補助 120 V 制御遮断器、空圧遮断弁の 3 箇所の遮断ポイントがあるコンベアで、3 名の保守作業員が個別 LOTO を行う場合、合計何個の個人用南京錠が必要ですか？',
        hint: '各作業員が各遮断ポイントに 1 個ずつ施錠します（3 箇所 × 3 名）。',
        targetValue: 9,
        unit: '個',
        tolerance: 0,
        solutionSteps: [
          '遮断ポイント数 = 3、作業員数 = 3。',
          '必要南京錠数 = 3 × 3 = 9 個。',
        ],
      },
      {
        id: 'loto-p3',
        prompt:
          '210 bar が蓄圧された油圧アキュムレータで、ポンプ遮断弁を閉じてブリード弁を開いたところ 35 bar/s で線形に減圧しました。0 bar に達するまで何秒かかりますか？',
        hint: '時間 = 初期圧力 / 減圧速度。',
        targetValue: 6,
        unit: 's',
        tolerance: 0.2,
        solutionSteps: [
          '初期圧力 P = 210 bar、減圧速度 = 35 bar/s。',
          '0 bar 到達時間 = 210 / 35 = 6 s。',
        ],
      },
      {
        id: 'loto-p4',
        prompt:
          '三相 480 V MCC の負荷側無電圧確認において、線間（相間）および対地間をすべて測定する場合、合計何回の電圧測定を行いますか？',
        hint: 'L1-L2, L2-L3, L3-L1 の 3 回と、L1-G, L2-G, L3-G の 3 回を合計します。',
        targetValue: 6,
        unit: '回',
        tolerance: 0,
        solutionSteps: [
          '相間測定：L1-L2, L2-L3, L3-L1（3 回）。',
          '対地測定：L1-G, L2-G, L3-G（3 回）。',
          '合計 = 3 + 3 = 6 回。',
        ],
      },
    ],
    quiz: [
      {
        id: 'loto-q1',
        question: 'Live-Dead-Live 試験の第3段階「既知の活線電源で再テストする」理由は何ですか？',
        options: [
          'テスタ内部の残留電荷を放電するため',
          '試験中にテスタの故障やヒューズ切れが起きなかったことを証明するため',
          '南京錠を掛ける前に MCC トリップユニットをリセットするため',
          '圧力計を 0 bar に校正するため',
        ],
        correctIndex: 1,
        explanation:
          '無電圧測定の直後に再び既知活線を測定することで、テスタが測定中も正常に動作していたことを証明できます。',
      },
      {
        id: 'loto-q2',
        question: 'OSHA 1910.147 において、施錠可能な遮断装置に「タグのみ（南京錠なし）」が許可されるのはいつですか？',
        options: [
          '保守作業が 15 分未満で終わる場合',
          '一切許可されない — 施錠可能な装置には必ず物理的な南京錠を使用しなければならない',
          '監督者が火気使用許可証に署名した場合',
          '回路電圧が 240 V 未満の場合',
        ],
        correctIndex: 1,
        explanation:
          '施錠可能なエネルギー遮断装置には物理的なロックアウトが義務付けられており、タグ単独での代用は禁止されています。',
      },
      {
        id: 'loto-q3',
        question: '480 V ポンプ MCC を施錠し油圧遮断弁を閉じましたが、圧力計が 210 bar を示したままです。原因は何ですか？',
        options: [
          'アキュムレータ内に高圧が閉じ込められており、ブリード・ドレン弁が開かれていない',
          'テスタの電池残量が少ない',
          '落下防止ブロックが重すぎる',
          '起動ボタンを押していない',
        ],
        correctIndex: 0,
        explanation:
          '遮断弁を閉じただけでは下流・アキュムレータ内の圧力は抜けません。必ずブリード弁を開いて 0 bar まで減圧してください。',
      },
      {
        id: 'loto-q4',
        question: '主 480 V MCC 遮断器を施錠した後も、制御盤内に活線として残る可能性がある危険源は何ですか？',
        options: [
          '遠心ポンプ羽根車の慣性のみ',
          '別盤・PLC インターロックからの 120 V / 24 V 補助制御逆潮流（バックフィード）',
          '大気圧',
          '南京錠のシャックルの静摩擦',
        ],
        correctIndex: 1,
        explanation:
          '外部制御回路（二系統バックフィード）は主 MCC とは別電源から供給されていることが多く、個別に遮断・施錠が必要です。',
      },
      {
        id: 'loto-q5',
        question: '施錠・タグ取付後に通常の起動ボタン（Start）を押す「Try-Out」の目的は何ですか？',
        options: [
          '分解前にモータ軸受を予熱するため',
          '正しい遮断器が遮断され、設備が確実に起動しないことを実機で確認するため',
          '油圧タンクの作動油を抜くため',
          '非常停止ランプの球切れを確認するため',
        ],
        correctIndex: 1,
        explanation:
          'Try-Out により、遮断器の取り違えや見落とした別系統電源がないかを物理的に確認できます。',
      },
    ],
  },
});
