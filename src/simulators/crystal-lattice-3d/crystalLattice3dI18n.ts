import { registerSimulatorTranslations } from '../../i18n/simulatorRegistry';

registerSimulatorTranslations('crystal-lattice-3d', {
  id: {
    title: 'Lab Struktur Kristal 3D & Kisi Bravais',
    shortTitle: 'Kristal 3D & Bravais',
    description:
      'Simulator kristalografi 3D 360° yang mencakup seluruh 14 kisi Bravais pada 7 sistem kristal (Kubik, Tetragonal, Ortorombik, Heksagonal, Rombohedral, Monoklinik, Triklinik) serta struktur teknik HCP Prisma Penuh, Diamond Cubic, NaCl B1, dan Intermetalik B2. Inspeksi supersel 2×2×2, mode bola rapat APF, bidang selip Miller (hkl), rongga sisipan, dan ikatan koordinasi.',
    explore: [
      {
        title: '7 Sistem Kristal & 14 Kisi Bravais',
        summary:
          'Padatan kristalin berulang secara periodik di ruang 3D menurut tiga vektor kisi (a, b, c) dan sudut antar sumbu (α, β, γ). Auguste Bravais membuktikan bahwa hanya ada 14 kisi ruang unik (P Primitif, I Berpusat Badan, F Berpusat Muka, C Berpusat Alas) di dalam 7 sistem kristal.',
      },
      {
        title: 'Atomic Packing Factor (APF) & Kepadatan Maksimum',
        summary:
          'Baik FCC (tumpukan ABCABC pada {111}) maupun HCP (tumpukan ABAB pada {0001} dengan rasio ideal c/a = 1,633) mencapai batas kepadatan bola keras teoretis APF = 74,0% dan bilangan koordinasi 12.',
      },
      {
        title: 'Bidang Selip (hkl) & Ketangguhan Material',
        summary:
          'Deformasi plastis terjadi melalui pergeseran dislokasi pada bidang atom terpadat. Baja tahan karat FCC (12 sistem selip rapat) tetap ulet hingga suhu kriogenik, sedangkan baja BCC mengalami transisi getas DBTT saat suhu turun.',
      },
    ],
    practice: [
      {
        prompt:
          'Tembaga (Cu) mengkristal dalam FCC dengan jari-jari atom R = 0,1278 nm dan a = 2√2·R. Hitung Atomic Packing Factor (APF) dalam persen (%) hingga 1 angka desimal.',
        hint: 'APF = [4 × (4/3)πR³] / (2√2·R)³ = π√2 / 6, lalu kalikan 100%.',
      },
      {
        prompt:
          'Hitung massa jenis teoretis ρ (dalam g/cm³) Wolfram BCC (W) dengan R = 0,137 nm (1,37 × 10⁻⁸ cm), massa molar A = 183,84 g/mol, n = 2, dan N_A = 6,022 × 10²³ mol⁻¹.',
        hint: 'Hitung a = 4R/√3, volume V_C = a³, lalu ρ = (n·A)/(V_C·N_A).',
      },
      {
        prompt:
          'Berapa jumlah atom efektif utuh di dalam satu prisma penuh Heksagonal Tertutup Rapat (HCP) yang memiliki 12 titik sudut (porsi 1/6), 2 pusat alas (porsi 1/2), dan 3 atom utuh di lapisan tengah B?',
        hint: 'N_efektif = (12 × 1/6) + (2 × 1/2) + 3.',
      },
    ],
    quiz: [
      {
        question:
          'Kisi Bravais manakah yang terbentuk saat Austenit FCC didinginkan cepat (quench) pada baja karbon perkakas sehingga karbon terjebak di sumbu-z?',
        options: [
          'Kubik Sederhana (cP)',
          'Tetragonal Berpusat Badan (BCT · tI / Martensit)',
          'Heksagonal Tertutup Rapat (HCP)',
          'Triklinik (aP)',
        ],
      },
      {
        question:
          'Mengapa logam FCC seperti SS304/SS316 dan aluminium tetap ulet pada suhu kriogenik di mana baja karbon BCC menjadi getas?',
        options: [
          'FCC memiliki kerapatan lebih rendah dibanding BCC',
          'FCC memiliki 12 sistem selip rapat {111}⟨110⟩ dengan hambatan gesekan kisi sangat rendah',
          'FCC tidak memiliki dislokasi',
          'Ikatan atom FCC bersifat kovalen sp³',
        ],
      },
      {
        question:
          'Berapa banyak kisi ruang Bravais unik yang secara matematis ada di seluruh 7 sistem kristal 3D?',
        options: ['7', '12', '14', '32'],
      },
      {
        question:
          'Berapakah rasio ketinggian aksial c/a ideal untuk struktur Heksagonal Tertutup Rapat (HCP)?',
        options: ['1,000', '1,414 (√2)', '1,633 (√(8/3))', '1,732 (√3)'],
      },
    ],
  },
  ja: {
    title: '3D 結晶格子・ブラベー格子ラボ',
    shortTitle: '3D 結晶格子',
    description:
      '7結晶系・全14種類のブラベー格子に加え、HCP六角柱・ダイヤモンド構造・NaCl型B1・規則合金B2を含む計18種類の結晶構造を360°回転表示する3D結晶学シミュレータです。2×2×2スーパーセル、剛体球充填(APF)、ミラー指数すべり面(hkl)、格子間空隙をインタラクティブに解析できます。',
  },
});
