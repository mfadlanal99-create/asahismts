import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('pump', {
  id: {
    title: 'Simulator Pompa Sentrifugal & Perawatan Seal',
    shortTitle: 'Pompa & Seal',
    description:
      'Analisis kurva H-Q dan efisiensi pompa sentrifugal, terapkan hukum afinitas, evaluasi risiko kavitasi NPSHa vs NPSHr, serta diagnosis dead-head dan keausan mechanical seal.',
    explore: [
      {
        title: '1. Kurva H-Q Pompa, Resistansi Sistem & BEP',
        summary:
          'Titik operasi pompa sentrifugal adalah perpotongan antara kurva performa H-Q pompa dan kurva resistansi sistem perpipaan. Menutup sebagian katup buang (throttling) mempercuram kurva sistem, menurunkan laju aliran dan menaikkan head, sekaligus menggeser pompa menjauh dari Best Efficiency Point (BEP).',
        equations: [
          {
            label: 'Kurva Resistansi Sistem',
            formula: 'H_sys(Q) = H_static + (k_pipe + k_valve) · Q²',
            note: 'H_static = H_discharge - H_suction; throttling menaikkan k_valve.',
          },
          {
            label: 'Daya Hidraulik & Daya Poros',
            formula: 'P_h = (ρ · g · Q · H) / 1000 (kW),   P_shaft = P_h / η',
            note: 'Q dalam m³/s, H dalam m, ρ dalam kg/m³, η dalam desimal (0–1).',
          },
        ],
        workedExample: {
          title: 'Menghitung Daya Poros pada BEP',
          given: [
            'Laju aliran Q = 90 m³/h (0,025 m³/s)',
            'Total Dynamic Head H = 25 m',
            'Massa jenis air ρ = 1000 kg/m³, g = 9,81 m/s²',
            'Efisiensi pompa η = 80% (0,80)',
          ],
          steps: [
            'Hitung daya hidraulik: P_h = (1000 × 9,81 × 0,025 × 25) / 1000 = 6,131 kW.',
            'Bagi dengan efisiensi: P_shaft = 6,131 / 0,80 = 7,664 kW.',
          ],
          answer: 'P_shaft = 7,66 kW',
        },
      },
      {
        title: '2. Hukum Afinitas (Kontrol Kecepatan Variabel / VFD)',
        summary:
          'Mengatur kecepatan impeler N melalui Variable Frequency Drive (VFD) menggeser seluruh kurva pompa. Aliran berbanding lurus dengan kecepatan, head berbanding kuadrat kecepatan, dan daya poros berbanding pangkat tiga kecepatan—sehingga penurunan kecepatan VFD jauh lebih hemat energi dibanding throttling katup.',
        equations: [
          {
            label: 'Hukum Afinitas Aliran',
            formula: 'Q₂ / Q₁ = N₂ / N₁',
            note: 'Berlaku untuk impeler sebangun secara geometris pada titik operasi homolog.',
          },
          {
            label: 'Hukum Afinitas Head',
            formula: 'H₂ / H₁ = (N₂ / N₁)²',
            note: 'Shutoff head dan BEP head sama-sama berskala N².',
          },
          {
            label: 'Hukum Afinitas Daya',
            formula: 'P₂ / P₁ = (N₂ / N₁)³',
            note: 'Penurunan kecepatan 20% memangkas kebutuhan daya poros hampir 49%!',
          },
        ],
        workedExample: {
          title: 'Penghematan Energi dari Penurunan Kecepatan VFD',
          given: [
            'Kecepatan nominal N₁ = 1750 RPM, Q₁ = 90 m³/h, H₁ = 24,6 m, P₁ = 7,5 kW',
            'Kecepatan diturunkan N₂ = 1400 RPM (kecepatan 80%)',
          ],
          steps: [
            'Rasio kecepatan: N₂ / N₁ = 1400 / 1750 = 0,80.',
            'Aliran baru: Q₂ = 90 × 0,80 = 72,0 m³/h.',
            'Head baru: H₂ = 24,6 × 0,80² = 15,74 m.',
            'Daya baru: P₂ = 7,5 × 0,80³ = 7,5 × 0,512 = 3,84 kW.',
          ],
          answer: 'Q₂ = 72 m³/h, H₂ = 15,74 m, P₂ = 3,84 kW (hemat daya 48,8%)',
        },
      },
      {
        title: '3. NPSHa vs NPSHr & Pencegahan Kavitasi',
        summary:
          'Kavitasi terjadi saat tekanan statis lokal di mata impeler turun di bawah tekanan uap cairan, membentuk gelembung uap yang pecah hebat di zona bertekanan tinggi. Hal ini mengerosi sudu impeler, memicu getaran berat, dan merusak mechanical seal. Selalu jaga NPSHa > NPSHr dengan margin aman (umumnya ≥ 0,5–1,0 m).',
        equations: [
          {
            label: 'Net Positive Suction Head Available (NPSHa)',
            formula: 'NPSHa = (P_atm - P_v) / (ρ · g) + H_s - h_f,suction',
            note: 'H_s bernilai positif untuk flooded suction dan negatif untuk suction lift.',
          },
          {
            label: 'Kriteria Kavitasi',
            formula: 'NPSHa > NPSHr + Margin',
            note: 'Kenaikan suhu fluida menaikkan P_v sehingga langsung menurunkan NPSHa.',
          },
        ],
        workedExample: {
          title: 'Memeriksa Margin Kavitasi untuk Air Hangat',
          given: [
            'Tekanan atmosfer P_atm = 101,3 kPa',
            'Air pada 50 °C: P_v = 12,3 kPa, ρ = 988 kg/m³',
            'Suction lift H_s = -2,5 m, rugi gesek hisap h_f,suction = 1,2 m',
            'NPSHr pompa = 4,2 m',
          ],
          steps: [
            'Suku head tekanan: (101.300 - 12.300) / (988 × 9,81) = 89.000 / 9.692,3 = 9,18 m.',
            'Kurangi lift dan gesekan: NPSHa = 9,18 - 2,5 - 1,2 = 5,48 m.',
            'Bandingkan dengan NPSHr: Margin = 5,48 - 4,2 = +1,28 m (aman).',
          ],
          answer: 'NPSHa = 5,48 m (Margin +1,28 m, tidak kavitasi)',
        },
      },
      {
        title: '4. Dead-Head, Resirkulasi Aliran Rendah & Keausan Seal',
        summary:
          'Menjalankan pompa sentrifugal dengan katup buang tertutup (dead-head) atau di bawah ~45% aliran BEP menjebak energi di dalam casing. Hampir seluruh daya poros berubah menjadi panas, mendidihkan lapisan pelumas di antara muka mechanical seal dan menyebabkan retak termal, dry running, serta defleksi poros.',
        equations: [
          {
            label: 'Aliran Stabil Kontinu Minimum',
            formula: 'Q_min ≈ 0,40 hingga 0,50 × Q_BEP',
            note: 'Pasang jalur bypass aliran minimum bila kebutuhan proses dapat turun di bawah Q_min.',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          'Sebuah pompa sentrifugal mengalirkan Q₁ = 90 m³/h pada N₁ = 1750 RPM. Jika VFD menaikkan kecepatan menjadi N₂ = 2100 RPM, berapa laju aliran baru Q₂ dalam m³/h?',
        hint: 'Gunakan hukum afinitas pertama: Q₂ = Q₁ × (N₂ / N₁).',
        solutionSteps: [
          'Rasio kecepatan = 2100 / 1750 = 1,20.',
          'Q₂ = 90 × 1,20 = 108 m³/h.',
        ],
      },
      {
        prompt:
          'Pada 1750 RPM, pompa menghasilkan head H₁ = 24,6 m di BEP. Jika kecepatan diturunkan menjadi 1400 RPM, hitung head baru H₂ dalam meter.',
        hint: 'Head berskala kuadrat kecepatan: H₂ = H₁ × (N₂ / N₁)².',
        solutionSteps: [
          'Rasio kecepatan = 1400 / 1750 = 0,80.',
          'H₂ = 24,6 × (0,80)² = 24,6 × 0,64 = 15,74 m.',
        ],
      },
      {
        prompt:
          'Sebuah pompa menarik daya poros P₁ = 7,5 kW pada 1750 RPM. Berapa daya poros P₂ (dalam kW) saat diperlambat menjadi 1400 RPM?',
        hint: 'Daya berskala pangkat tiga kecepatan: P₂ = P₁ × (N₂ / N₁)³.',
        solutionSteps: [
          'Rasio kecepatan = 1400 / 1750 = 0,80.',
          'P₂ = 7,5 × (0,80)³ = 7,5 × 0,512 = 3,84 kW.',
        ],
      },
      {
        prompt:
          'Hitung NPSHa (dalam m) untuk air pada 50 °C (P_v = 12,3 kPa, ρ = 988 kg/m³) dengan P_atm = 101,3 kPa, suction lift H_s = -2,5 m, dan rugi gesek hisap h_f = 1,2 m (gunakan g = 9,81 m/s²).',
        hint: 'NPSHa = (P_atm - P_v)/(ρg) + H_s - h_f. Ingat ubah kPa ke Pascal (1 kPa = 1000 Pa).',
        solutionSteps: [
          '(101.300 - 12.300) / (988 × 9,81) = 89.000 / 9.692,28 = 9,183 m.',
          'NPSHa = 9,183 - 2,5 - 1,2 = 5,48 m.',
        ],
      },
      {
        prompt:
          'Sebuah pompa mengalirkan Q = 90 m³/h (0,025 m³/s) air (ρ = 1000 kg/m³) pada H = 25 m dengan efisiensi η = 80%. Tentukan daya poros yang dibutuhkan dalam kW (g = 9,81 m/s²).',
        hint: 'Hitung dulu daya hidraulik P_h = ρgQH / 1000, lalu bagi dengan η = 0,80.',
        solutionSteps: [
          'P_h = (1000 × 9,81 × 0,025 × 25) / 1000 = 6,131 kW.',
          'P_shaft = 6,131 / 0,80 = 7,66 kW.',
        ],
      },
    ],
    quiz: [
      {
        question:
          'Apa yang terjadi pada titik operasi pompa sentrifugal ketika katup buang ditutup sebagian?',
        options: [
          'Aliran turun dan head naik sepanjang kurva H-Q pompa',
          'Aliran naik dan head turun',
          'Baik aliran maupun head naik bersamaan',
          'Kurva pompa bergeser turun sementara kurva sistem tetap',
        ],
        explanation:
          'Menutup katup buang memperbesar resistansi sistem, mempercuram kurva sistem sehingga memotong kurva H-Q pompa pada laju aliran lebih rendah dan head lebih tinggi.',
      },
      {
        question:
          'Menurut hukum afinitas, jika kecepatan impeler digandakan (N₂ = 2·N₁), berapa kali lipat kenaikan daya porosnya?',
        options: ['2×', '4×', '8×', '16×'],
        explanation:
          'Daya poros berskala pangkat tiga terhadap kecepatan putar: P₂/P₁ = (N₂/N₁)³ = 2³ = 8×.',
      },
      {
        question:
          'Tindakan mana yang LANGSUNG menaikkan NPSHa untuk membantu menghilangkan kavitasi pompa?',
        options: [
          'Menaikkan kecepatan impeler N',
          'Menaikkan suhu fluida',
          'Menaikkan level cairan tangki hisap (atau menurunkan posisi pompa)',
          'Menggunakan pipa hisap berdiameter lebih kecil',
        ],
        explanation:
          'Menaikkan level tangki hisap menambah head hisap statis H_s, sehingga langsung menaikkan NPSHa. Menaikkan suhu menaikkan P_v (menurunkan NPSHa), dan pipa kecil memperbesar rugi gesek.',
      },
      {
        question:
          'Mengapa mengoperasikan pompa sentrifugal pada kondisi dead-head (katup buang 0% terbuka) berbahaya bagi mechanical seal?',
        options: [
          'Daya poros turun ke nol sehingga seal membeku',
          'Pengadukan (churning) memanaskan fluida yang terjebak dan menguapkan lapisan pelumas di antara muka seal',
          'Tekanan buang turun di bawah tekanan atmosfer',
          'Arah putaran impeler berbalik',
        ],
        explanation:
          'Saat dead-head, ~35% daya poros BEP tetap terdisipasi menjadi panas ke volume fluida yang diam, cepat mendidihkan lapisan cair pada muka mechanical seal dan memicu kegagalan dry-run.',
      },
      {
        question:
          'Di mana pompa sentrifugal sebaiknya beroperasi untuk keandalan maksimum, getaran terendah, serta umur seal dan bantalan terpanjang?',
        options: [
          'Pada shutoff head (Q = 0)',
          'Di dekat Best Efficiency Point (BEP)',
          'Pada aliran runout maksimum (H = 0)',
          'Sedikit di bawah NPSHr',
        ],
        explanation:
          'Pada BEP, gaya radial hidraulik pada impeler seimbang, resirkulasi internal minimal, dan efisiensi paling tinggi.',
      },
      {
        question:
          'Mengapa air panas (misalnya 85 °C) jauh lebih mudah mengalami kavitasi dibanding air dingin (20 °C) pada level tangki hisap yang sama?',
        options: [
          'Air panas memiliki tekanan uap P_v jauh lebih tinggi sehingga menurunkan NPSHa',
          'Air panas memiliki massa jenis lebih tinggi sehingga menambah head statis',
          'Air panas menaikkan efisiensi BEP pompa',
          'Air panas menghilangkan gesekan pipa hisap',
        ],
        explanation:
          'Tekanan uap air naik eksponensial terhadap suhu (dari 2,3 kPa pada 20 °C menjadi ~57,8 kPa pada 85 °C), sehingga mengurangi (P_atm - P_v)/(ρg) secara tajam pada persamaan NPSHa.',
      },
    ],
  },
  ja: {
    title: '遠心ポンプ・メカニカルシール保守シミュレータ',
    shortTitle: 'ポンプ & シール',
    description:
      '遠心ポンプのH-Q曲線と効率曲線を解析し、相似則の適用、NPSHa対NPSHrによるキャビテーション評価、締切運転およびメカニカルシール摩耗を診断します。',
    explore: [
      {
        title: '1. ポンプH-Q曲線・管路抵抗曲線・最高効率点 (BEP)',
        summary:
          '遠心ポンプの運転点は、ポンプのH-Q性能曲線と配管系の抵抗曲線の交点で決まります。吐出弁を絞る（スロットリング）と管路抵抗曲線が急になり、流量が減少して揚程が上昇すると同時に、最高効率点（BEP）から外れて運転されます。',
        equations: [
          {
            label: '管路抵抗曲線',
            formula: 'H_sys(Q) = H_static + (k_pipe + k_valve) · Q²',
            note: 'H_static = H_discharge - H_suction。弁を絞ると k_valve が増加します。',
          },
          {
            label: '水動力・軸動力',
            formula: 'P_h = (ρ · g · Q · H) / 1000 (kW),   P_shaft = P_h / η',
            note: 'Qはm³/s、Hはm、ρはkg/m³、ηは小数（0–1）。',
          },
        ],
        workedExample: {
          title: 'BEPにおける軸動力の計算',
          given: [
            '流量 Q = 90 m³/h (0.025 m³/s)',
            '全揚程 H = 25 m',
            '水の密度 ρ = 1000 kg/m³、g = 9.81 m/s²',
            'ポンプ効率 η = 80% (0.80)',
          ],
          steps: [
            '水動力を計算: P_h = (1000 × 9.81 × 0.025 × 25) / 1000 = 6.131 kW。',
            '効率で割る: P_shaft = 6.131 / 0.80 = 7.664 kW。',
          ],
          answer: 'P_shaft = 7.66 kW',
        },
      },
      {
        title: '2. 相似則（インバータ / VFD 回転数制御）',
        summary:
          'VFD（インバータ）でインペラ回転数 N を調整すると、ポンプ曲線全体がシフトします。流量は回転数に比例し、揚程は回転数の2乗に比例し、軸動力は回転数の3乗に比例するため、弁絞りよりもVFD減速の方が大幅に省エネになります。',
        equations: [
          {
            label: '流量の相似則',
            formula: 'Q₂ / Q₁ = N₂ / N₁',
            note: '幾何学的に相似なインペラの相同運転点において成立します。',
          },
          {
            label: '揚程の相似則',
            formula: 'H₂ / H₁ = (N₂ / N₁)²',
            note: '締切揚程・BEP揚程ともに N² に比例します。',
          },
          {
            label: '動力の相似則',
            formula: 'P₂ / P₁ = (N₂ / N₁)³',
            note: '回転数を20%下げると、軸動力は約49%も削減できます。',
          },
        ],
        workedExample: {
          title: 'VFD減速による省エネ効果',
          given: [
            '定格回転数 N₁ = 1750 RPM、Q₁ = 90 m³/h、H₁ = 24.6 m、P₁ = 7.5 kW',
            '減速後 N₂ = 1400 RPM（80%速度）',
          ],
          steps: [
            '速度比: N₂ / N₁ = 1400 / 1750 = 0.80。',
            '新流量: Q₂ = 90 × 0.80 = 72.0 m³/h。',
            '新揚程: H₂ = 24.6 × 0.80² = 15.74 m。',
            '新動力: P₂ = 7.5 × 0.80³ = 7.5 × 0.512 = 3.84 kW。',
          ],
          answer: 'Q₂ = 72 m³/h、H₂ = 15.74 m、P₂ = 3.84 kW（動力 48.8% 削減）',
        },
      },
      {
        title: '3. NPSHa 対 NPSHr とキャビテーション防止',
        summary:
          'キャビテーションは、インペラ吸込口付近の局所静圧が液体の蒸気圧を下回り、発生した蒸気泡が高圧部で激しく崩壊する現象です。インペラ羽根の壊食、激しい振動、メカニカルシール破損の原因となります。常に十分な安全余裕（通常 ≥ 0.5–1.0 m）をもって NPSHa > NPSHr を維持してください。',
        equations: [
          {
            label: '有効吸込ヘッド (NPSHa)',
            formula: 'NPSHa = (P_atm - P_v) / (ρ · g) + H_s - h_f,suction',
            note: 'H_s は押込吸込で正、吸上吸込で負になります。',
          },
          {
            label: 'キャビテーション判定条件',
            formula: 'NPSHa > NPSHr + 余裕代',
            note: '液温上昇により P_v が増加すると、NPSHa は直接低下します。',
          },
        ],
        workedExample: {
          title: '温水におけるキャビテーション余裕の確認',
          given: [
            '大気圧 P_atm = 101.3 kPa',
            '50 °C の水: P_v = 12.3 kPa、ρ = 988 kg/m³',
            '吸上高さ H_s = -2.5 m、吸込管摩擦損失 h_f,suction = 1.2 m',
            'ポンプ必要吸込ヘッド NPSHr = 4.2 m',
          ],
          steps: [
            '圧力ヘッド項: (101,300 - 12,300) / (988 × 9.81) = 89,000 / 9,692.3 = 9.18 m。',
            '吸上高さと摩擦損失を引く: NPSHa = 9.18 - 2.5 - 1.2 = 5.48 m。',
            'NPSHrと比較: 余裕 = 5.48 - 4.2 = +1.28 m（安全）。',
          ],
          answer: 'NPSHa = 5.48 m（余裕 +1.28 m、キャビテーションなし）',
        },
      },
      {
        title: '4. 締切運転・低流量再循環・シール摩耗',
        summary:
          '吐出弁を閉じた状態（締切運転 / デッドヘッド）や BEP 流量の約45%未満で運転すると、エネルギーがケーシング内に閉じ込められます。軸動力のほぼすべてが熱に変わり、メカニカルシール摺動面の液膜が沸騰して熱割れ・ドライラン・軸たわみを引き起こします。',
        equations: [
          {
            label: '最小連続安定流量',
            formula: 'Q_min ≈ 0.40 ～ 0.50 × Q_BEP',
            note: 'プロセス需要が Q_min を下回る場合は、ミニマムフローバイパス配管を設置してください。',
          },
        ],
      },
    ],
    practice: [
      {
        prompt:
          'N₁ = 1750 RPM で Q₁ = 90 m³/h を吐出する遠心ポンプがあります。VFDで回転数を N₂ = 2100 RPM に上げたとき、新しい流量 Q₂ (m³/h) はいくらですか？',
        hint: '流量の相似則 Q₂ = Q₁ × (N₂ / N₁) を使用します。',
        solutionSteps: [
          '速度比 = 2100 / 1750 = 1.20。',
          'Q₂ = 90 × 1.20 = 108 m³/h。',
        ],
      },
      {
        prompt:
          '1750 RPM のBEPで揚程 H₁ = 24.6 m を発生するポンプを 1400 RPM に減速したとき、新しい揚程 H₂ (m) を計算してください。',
        hint: '揚程は回転数の2乗に比例します: H₂ = H₁ × (N₂ / N₁)²。',
        solutionSteps: [
          '速度比 = 1400 / 1750 = 0.80。',
          'H₂ = 24.6 × (0.80)² = 24.6 × 0.64 = 15.74 m。',
        ],
      },
      {
        prompt:
          '1750 RPM で軸動力 P₁ = 7.5 kW を消費するポンプを 1400 RPM に減速したときの軸動力 P₂ (kW) はいくらですか？',
        hint: '動力は回転数の3乗に比例します: P₂ = P₁ × (N₂ / N₁)³。',
        solutionSteps: [
          '速度比 = 1400 / 1750 = 0.80。',
          'P₂ = 7.5 × (0.80)³ = 7.5 × 0.512 = 3.84 kW。',
        ],
      },
      {
        prompt:
          '50 °C の水（P_v = 12.3 kPa、ρ = 988 kg/m³）について、P_atm = 101.3 kPa、吸上高さ H_s = -2.5 m、吸込摩擦損失 h_f = 1.2 m のときの NPSHa (m) を求めてください（g = 9.81 m/s²）。',
        hint: 'NPSHa = (P_atm - P_v)/(ρg) + H_s - h_f。kPa は Pa に換算してください（1 kPa = 1000 Pa）。',
        solutionSteps: [
          '(101,300 - 12,300) / (988 × 9.81) = 89,000 / 9,692.28 = 9.183 m。',
          'NPSHa = 9.183 - 2.5 - 1.2 = 5.48 m。',
        ],
      },
      {
        prompt:
          '水（ρ = 1000 kg/m³）を Q = 90 m³/h (0.025 m³/s)、全揚程 H = 25 m、効率 η = 80% で揚水するとき、必要な軸動力 (kW) を求めてください（g = 9.81 m/s²）。',
        hint: 'まず水動力 P_h = ρgQH / 1000 を計算し、効率 η = 0.80 で割ります。',
        solutionSteps: [
          'P_h = (1000 × 9.81 × 0.025 × 25) / 1000 = 6.131 kW。',
          'P_shaft = 6.131 / 0.80 = 7.66 kW。',
        ],
      },
    ],
    quiz: [
      {
        question:
          '遠心ポンプの吐出弁を一部閉じたとき、ポンプの運転点はどのように変化しますか？',
        options: [
          'ポンプH-Q曲線に沿って流量が減少し、揚程が増加する',
          '流量が増加し、揚程が減少する',
          '流量と揚程の両方が同時に増加する',
          '管路曲線は固定のままポンプ曲線が下に移動する',
        ],
        explanation:
          '吐出弁を絞ると管路抵抗が増して管路抵抗曲線が急になり、ポンプH-Q曲線との交点が低流量・高揚程側へ移動します。',
      },
      {
        question:
          '相似則によれば、インペラ回転数を2倍（N₂ = 2·N₁）にすると軸動力は何倍になりますか？',
        options: ['2倍', '4倍', '8倍', '16倍'],
        explanation:
          '軸動力は回転数の3乗に比例します: P₂/P₁ = (N₂/N₁)³ = 2³ = 8倍。',
      },
      {
        question:
          'キャビテーションを解消するために NPSHa を即座に増加させる操作はどれですか？',
        options: [
          'インペラ回転数 N を上げる',
          '液温を上げる',
          '吸込タンクの液位を上げる（またはポンプ設置位置を下げる）',
          'より小口径の吸込配管を使う',
        ],
        explanation:
          '吸込タンクの液位を上げると静吸込ヘッド H_s が増え、NPSHa が直接増加します。液温上昇は P_v を上げて NPSHa を下げ、小口径配管は摩擦損失を増やします。',
      },
      {
        question:
          '締切運転（吐出弁開度 0%）がメカニカルシールにとって危険な理由は何ですか？',
        options: [
          '軸動力がゼロになりシールが凍結するため',
          '撹拌損失で滞留液が加熱され、シール摺動面の潤滑液膜が沸騰・蒸発するため',
          '吐出圧力が大気圧以下に低下するため',
          'インペラが逆回転するため',
        ],
        explanation:
          '締切運転時でも BEP 軸動力の約35%が滞留流体中で熱として消費され、シール面の液膜が急速に沸騰してドライラン破損を引き起こします。',
      },
      {
        question:
          '最高の信頼性、最小の振動、最長のシール・軸受寿命を得るために、遠心ポンプはどこで運転するのが理想ですか？',
        options: [
          '締切揚程点（Q = 0）',
          '最高効率点（BEP）付近',
          '最大ランアウト流量（H = 0）',
          'NPSHr をわずかに下回る領域',
        ],
        explanation:
          'BEP 付近ではインペラに作用する半径方向流体力が釣り合い、内部再循環が最小化され、効率が最大になります。',
      },
      {
        question:
          '同じ吸込タンク液位でも、冷水（20 °C）より温水（85 °C）の方がはるかにキャビテーションを起こしやすい理由は何ですか？',
        options: [
          '温水は蒸気圧 P_v が非常に高く、NPSHa を低下させるため',
          '温水は密度が高く静水頭が増すため',
          '温水はポンプの BEP 効率を上げるため',
          '温水は吸込管の摩擦損失をなくすため',
        ],
        explanation:
          '水の蒸気圧は温度とともに指数関数的に上昇するため（20 °C で 2.3 kPa → 85 °C で約 57.8 kPa）、NPSHa 式の (P_atm - P_v)/(ρg) が大きく減少します。',
      },
    ],
  },
});
