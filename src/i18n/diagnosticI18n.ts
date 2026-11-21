import { registerSimulatorTranslations } from './simulatorRegistry';

registerSimulatorTranslations('multimeter', {
  id: {
    title: 'Multimeter Digital & Analog (DMM / VOM)',
    shortTitle: 'Multimeter',
    description:
      'Latih pengukuran tegangan AC/DC, resistansi, kontinuitas, dan uji dioda pada meja kerja ESD interaktif dengan deteksi kesalahan koneksi probe.',
  },
  ja: {
    title: 'デジタル・アナログマルチメータ (DMM / VOM)',
    shortTitle: 'マルチメータ',
    description:
      '対話型ESD作業台でAC/DC電圧・抵抗・導通・ダイオード測定およびリード誤接続・ヒューズ保護を実習します。',
  },
});

registerSimulatorTranslations('clamp-meter', {
  id: {
    title: 'Tang Ampere & Penganalisis Daya 3-Fasa',
    shortTitle: 'Tang Ampere',
    description:
      'Jepit konduktor L1, L2, L3, atau PE/N secara non-kontak untuk menganalisis arus inrush, faktor daya, dan ketidakseimbangan arus NEMA MG-1.',
  },
  ja: {
    title: 'クランプメータ・三相電力アナライザ',
    shortTitle: 'クランプメータ',
    description:
      'L1・L2・L3・PE/N導体を非接触でクランプし、突入電流・力率・NEMA MG-1相間電流不平衡を診断します。',
  },
});

registerSimulatorTranslations('db-meter', {
  id: {
    title: 'Alat Ukur Tingkat Kebisingan / dB Meter',
    shortTitle: 'dB Meter',
    description:
      'Simulasikan pengukuran kebisingan industri IEC 61672 Kelas 1 dengan pembobotan dBA/dBC/dBZ, FAST/SLOW, pelemahan jarak (hukum kuadrat terbalik), dan dosis paparan OSHA/NIOSH.',
  },
  ja: {
    title: '騒音計・音圧レベル (dB) メータ',
    shortTitle: '騒音計 (dB)',
    description:
      'IEC 61672 Class 1のdBA/dBC/dBZ周波数重み付け、FAST/SLOW動特性、距離減衰、OSHA/NIOSH騒音ばく露量を実習します。',
  },
});

registerSimulatorTranslations('vibration-meter', {
  id: {
    title: 'Vibration Meter Genggam (ISO 10816-3)',
    shortTitle: 'Vibration Meter',
    description:
      'Tempelkan probe akselerometer magnetik pada titik NDE/DE motor dan pompa untuk mengevaluasi kecepatan RMS, percepatan, perpindahan, dan indeks kerusakan bantalan (BDU).',
  },
  ja: {
    title: 'ポータブル振動計 (ISO 10816-3)',
    shortTitle: '振動計',
    description:
      '磁気式加速度プローブをモータ・ポンプの各軸受点に当て、速度RMS・加速度・変位・軸受損傷指数(BDU)を評価します。',
  },
});

registerSimulatorTranslations('megohmmeter', {
  id: {
    title: 'Megohmmeter & Indeks Polarisasi (IEEE 43)',
    shortTitle: 'Megohmmeter',
    description:
      'Uji tahanan isolasi belitan motor (250V–2500V DC), koreksi suhu 40 °C IEEE 43, Rasio Absorpsi Dielektrik (DAR), dan Indeks Polarisasi (PI).',
  },
  ja: {
    title: '絶縁抵抗計・メガー (IEEE 43 / PI)',
    shortTitle: '絶縁抵抗計',
    description:
      '250V〜2500V DCでモータ巻線の絶縁抵抗、IEEE 43の40°C温度補正、誘電吸収比(DAR)・成極指数(PI)を測定します。',
  },
});

registerSimulatorTranslations('ir-thermometer', {
  id: {
    title: 'Termometer IR & Kamera Termal',
    shortTitle: 'Termometer IR',
    description:
      'Inspeksi titik panas panel MCC, bantalan, steam trap, dan stator dengan rasio Jarak-terhadap-Titik (D:S) serta kalibrasi emisivitas.',
  },
  ja: {
    title: '放射温度計・サーモグラフィカメラ',
    shortTitle: '放射温度計',
    description:
      'MCC盤・軸受・スチームトラップ・固定子のホットスポットをD:S比と放射率(ε)補正を用いて非接触診断します。',
  },
});

registerSimulatorTranslations('laser-tachometer', {
  id: {
    title: 'Takometer Laser & Stroboskop',
    shortTitle: 'Takometer Laser',
    description:
      'Ukur kecepatan putar poros (RPM/RPS/rad/s) dengan sinar laser 650 nm pada pita reflektif serta analisis harmonik dan slip motor VFD menggunakan stroboskop.',
  },
  ja: {
    title: 'レーザータコメータ・ストロボスコープ',
    shortTitle: 'タコメータ',
    description:
      '650nmレーザーと反射テープで回転速度を計測し、ストロボ発光による静止像・高調波・VFDモータのすべりを解析します。',
  },
});
