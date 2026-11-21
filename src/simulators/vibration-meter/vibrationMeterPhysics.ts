export type ProbePointId = 'motor-nde' | 'motor-de' | 'pump-de' | 'pump-nde';

export type VibrationMode = 'velocity' | 'acceleration' | 'displacement' | 'bearing';

export type MachineClassId =
  | 'group2-rigid'
  | 'group2-flexible'
  | 'group1-rigid'
  | 'group1-flexible';

export type FaultScenarioId =
  | 'healthy'
  | 'unbalance'
  | 'misalignment'
  | 'bearing-spall'
  | 'loose-foundation';

export type IsoZone = 'A' | 'B' | 'C' | 'D';

export interface ProbePointSpec {
  id: ProbePointId;
  label: string;
  shortLabel: string;
  description: string;
  descriptionId: string;
  descriptionJa: string;
}

export const PROBE_POINTS: ProbePointSpec[] = [
  {
    id: 'motor-nde',
    label: 'Motor NDE',
    shortLabel: 'M-NDE',
    description: 'Motor Non-Drive End (fan end bearing housing)',
    descriptionId: 'Motor NDE (rumah bantalan sisi kipas)',
    descriptionJa: 'モータ反負荷側 (NDE軸受ハウジング)',
  },
  {
    id: 'motor-de',
    label: 'Motor DE',
    shortLabel: 'M-DE',
    description: 'Motor Drive End (coupling side bearing housing)',
    descriptionId: 'Motor DE (rumah bantalan sisi kopling)',
    descriptionJa: 'モータ負荷側 (DE軸受ハウジング)',
  },
  {
    id: 'pump-de',
    label: 'Pump DE',
    shortLabel: 'P-DE',
    description: 'Pump Drive End (inboard bearing near coupling)',
    descriptionId: 'Pompa DE (bantalan dalam dekat kopling)',
    descriptionJa: 'ポンプ負荷側 (カップリング側軸受)',
  },
  {
    id: 'pump-nde',
    label: 'Pump NDE',
    shortLabel: 'P-NDE',
    description: 'Pump Non-Drive End (outboard thrust bearing)',
    descriptionId: 'Pompa NDE (bantalan luar / thrust)',
    descriptionJa: 'ポンプ反負荷側 (スラスト側軸受)',
  },
];

export interface MachineClassSpec {
  id: MachineClassId;
  label: string;
  labelId: string;
  labelJa: string;
  powerRange: string;
  foundation: 'Rigid' | 'Flexible';
  /** ISO 10816-3 zone boundaries [A/B, B/C, C/D] in mm/s RMS */
  thresholds: readonly [number, number, number];
}

export const MACHINE_CLASSES: MachineClassSpec[] = [
  {
    id: 'group2-rigid',
    label: 'Group 2 (15–300 kW) • Rigid',
    labelId: 'Grup 2 (15–300 kW) • Fondasi Kaku',
    labelJa: 'グループ2 (15–300 kW) • 剛性基礎',
    powerRange: '15–300 kW',
    foundation: 'Rigid',
    thresholds: [1.4, 2.8, 4.5],
  },
  {
    id: 'group2-flexible',
    label: 'Group 2 (15–300 kW) • Flexible',
    labelId: 'Grup 2 (15–300 kW) • Fondasi Fleksibel',
    labelJa: 'グループ2 (15–300 kW) • 柔基礎',
    powerRange: '15–300 kW',
    foundation: 'Flexible',
    thresholds: [2.3, 4.5, 7.1],
  },
  {
    id: 'group1-rigid',
    label: 'Group 1 (> 300 kW) • Rigid',
    labelId: 'Grup 1 (> 300 kW) • Fondasi Kaku',
    labelJa: 'グループ1 (> 300 kW) • 剛性基礎',
    powerRange: '> 300 kW',
    foundation: 'Rigid',
    thresholds: [2.3, 4.5, 7.1],
  },
  {
    id: 'group1-flexible',
    label: 'Group 1 (> 300 kW) • Flexible',
    labelId: 'Grup 1 (> 300 kW) • Fondasi Fleksibel',
    labelJa: 'グループ1 (> 300 kW) • 柔基礎',
    powerRange: '> 300 kW',
    foundation: 'Flexible',
    thresholds: [3.5, 7.1, 11.0],
  },
];

interface PointFaultProfile {
  velocity1800: number;
  dominantOrder: number;
  bduBase: number;
  hfAccelG: number;
}

export interface FaultScenarioSpec {
  id: FaultScenarioId;
  name: string;
  nameId: string;
  nameJa: string;
  diagnosis: string;
  diagnosisId: string;
  diagnosisJa: string;
  action: string;
  actionId: string;
  actionJa: string;
  rpmExponent: number;
  points: Record<ProbePointId, PointFaultProfile>;
}

export const FAULT_SCENARIOS: FaultScenarioSpec[] = [
  {
    id: 'healthy',
    name: 'Healthy Machine',
    nameId: 'Mesin Sehat (Normal)',
    nameJa: '正常運転機',
    diagnosis:
      'Low 1X synchronous amplitude across all 4 bearings with minimal high-frequency bearing shock (BDU < 25).',
    diagnosisId:
      'Amplitudo sinkron 1X rendah di keempat bantalan dengan kejut bantalan frekuensi tinggi minimal (BDU < 25).',
    diagnosisJa:
      '4軸受すべてで1X同期振幅が低く、高周波軸受衝撃(BDU < 25)も最小限です。',
    action: 'Continue routine condition-monitoring schedule.',
    actionId: 'Lanjutkan jadwal pemantauan kondisi rutin.',
    actionJa: '定期的な状態監視スケジュールを継続してください。',
    rpmExponent: 1.0,
    points: {
      'motor-nde': { velocity1800: 0.75, dominantOrder: 1, bduBase: 14, hfAccelG: 0.08 },
      'motor-de': { velocity1800: 0.92, dominantOrder: 1, bduBase: 18, hfAccelG: 0.11 },
      'pump-de': { velocity1800: 1.05, dominantOrder: 1, bduBase: 20, hfAccelG: 0.13 },
      'pump-nde': { velocity1800: 0.82, dominantOrder: 1, bduBase: 15, hfAccelG: 0.09 },
    },
  },
  {
    id: 'unbalance',
    name: 'Rotor Unbalance',
    nameId: 'Ketidakseimbangan Rotor (Unbalance)',
    nameJa: 'ロータアンバランス',
    diagnosis:
      'Strong 1X radial velocity & high peak-to-peak displacement, peaking on the pump impeller/rotor side (Pump DE/NDE) while BDU remains normal.',
    diagnosisId:
      'Kecepatan radial 1X & perpindahan P-P tinggi, memuncak di sisi impeler pompa (Pump DE/NDE) sementara BDU tetap normal.',
    diagnosisJa:
      '1X半径方向速度とP-P変位が高く、ポンプ側(Pump DE/NDE)でピークを示しますが、BDUは正常範囲です。',
    action: 'Perform single-plane or two-plane dynamic trim balancing on rotor/impeller.',
    actionId: 'Lakukan penyeimbangan dinamis (balancing) pada rotor/impeler.',
    actionJa: 'ロータ/インペラの1面または2面ダイナミックバランス調整を実施してください。',
    rpmExponent: 1.6,
    points: {
      'motor-nde': { velocity1800: 2.1, dominantOrder: 1, bduBase: 22, hfAccelG: 0.12 },
      'motor-de': { velocity1800: 3.4, dominantOrder: 1, bduBase: 26, hfAccelG: 0.16 },
      'pump-de': { velocity1800: 6.2, dominantOrder: 1, bduBase: 31, hfAccelG: 0.22 },
      'pump-nde': { velocity1800: 5.4, dominantOrder: 1, bduBase: 28, hfAccelG: 0.19 },
    },
  },
  {
    id: 'misalignment',
    name: 'Shaft Misalignment',
    nameId: 'Ketidaksejajaran Poros (Misalignment)',
    nameJa: '軸ミスアライメント',
    diagnosis:
      'Elevated 2X vibration concentrated symmetrically across the coupling at Motor DE and Pump DE, with normal bearing BDU.',
    diagnosisId:
      'Getaran 2X tinggi terkonsentrasi di sekitar kopling pada Motor DE dan Pump DE, dengan BDU bantalan normal.',
    diagnosisJa:
      'カップリング両側のMotor DEとPump DEに2X成分の振動が集中しており、BDUは正常です。',
    action: 'Perform precision laser shaft alignment and inspect coupling elastomer/shims.',
    actionId: 'Lakukan laser shaft alignment presisi dan periksa elemen kopling/shim.',
    actionJa: '精密レーザー軸芯出しを実施し、カップリング要素とシムを点検してください。',
    rpmExponent: 1.15,
    points: {
      'motor-nde': { velocity1800: 1.9, dominantOrder: 2, bduBase: 24, hfAccelG: 0.18 },
      'motor-de': { velocity1800: 5.6, dominantOrder: 2, bduBase: 34, hfAccelG: 0.35 },
      'pump-de': { velocity1800: 5.9, dominantOrder: 2, bduBase: 36, hfAccelG: 0.38 },
      'pump-nde': { velocity1800: 2.2, dominantOrder: 2, bduBase: 25, hfAccelG: 0.20 },
    },
  },
  {
    id: 'bearing-spall',
    name: 'DE Bearing Outer-Race Spall',
    nameId: 'Kerusakan Lintasan Luar Bantalan DE',
    nameJa: 'DE軸受外輪フレーキング',
    diagnosis:
      'Localized high-frequency acceleration (g Peak) and Bearing Damage Units (BDU > 120) spike sharply at Pump DE even while overall Velocity remains moderate.',
    diagnosisId:
      'Lonjakan tajam akselerasi frekuensi tinggi (g Peak) & BDU (> 120) terlokalisasi di Pump DE meskipun kecepatan getaran (Velocity) keseluruhan masih sedang.',
    diagnosisJa:
      'Pump DEで高周波加速度(g Peak)とBDU(> 120)が急上昇しています。全体速度が中程度でも初期軸受損傷の兆候です。',
    action: 'Schedule DE bearing replacement; check lubrication contamination and housing fit.',
    actionId: 'Jadwalkan penggantian bantalan DE; periksa kontaminasi pelumas & dudukan.',
    actionJa: 'DE軸受の交換を計画し、潤滑剤汚染とはめあいを点検してください。',
    rpmExponent: 1.2,
    points: {
      'motor-nde': { velocity1800: 0.9, dominantOrder: 1, bduBase: 18, hfAccelG: 0.12 },
      'motor-de': { velocity1800: 1.6, dominantOrder: 3, bduBase: 46, hfAccelG: 0.65 },
      'pump-de': { velocity1800: 2.7, dominantOrder: 5, bduBase: 148, hfAccelG: 3.85 },
      'pump-nde': { velocity1800: 1.2, dominantOrder: 2, bduBase: 32, hfAccelG: 0.35 },
    },
  },
  {
    id: 'loose-foundation',
    name: 'Loose Foundation',
    nameId: 'Fondasi / Baut Kaki Longgar',
    nameJa: '基礎・据付ボルト緩み',
    diagnosis:
      'High low-frequency displacement (μm P-P) and elevated velocity across all 4 points, particularly at outer feet (Motor NDE & Pump NDE).',
    diagnosisId:
      'Perpindahan frekuensi rendah (μm P-P) dan kecepatan tinggi di keempat titik, terutama pada kaki luar (Motor NDE & Pump NDE).',
    diagnosisJa:
      '4点すべてで低周波変位(μm P-P)と速度が上昇し、特に外側脚部(Motor NDE・Pump NDE)で顕著です。',
    action: 'Inspect anchor bolts, check for soft-foot, re-torque baseplate, and verify grout integrity.',
    actionId: 'Periksa baut jangkar, cek soft-foot, kencangkan ulang baseplate, dan cek grouting.',
    actionJa: 'アンカーボルトの増し締め、ソフトフット確認、ベースプレートおよびグラウトを点検してください。',
    rpmExponent: 1.1,
    points: {
      'motor-nde': { velocity1800: 6.4, dominantOrder: 1, bduBase: 35, hfAccelG: 0.42 },
      'motor-de': { velocity1800: 4.9, dominantOrder: 1, bduBase: 31, hfAccelG: 0.34 },
      'pump-de': { velocity1800: 4.7, dominantOrder: 1, bduBase: 30, hfAccelG: 0.33 },
      'pump-nde': { velocity1800: 6.1, dominantOrder: 1, bduBase: 34, hfAccelG: 0.40 },
    },
  },
];

export interface PointReading {
  pointId: ProbePointId;
  velocityRmsMmS: number;
  accelPeakG: number;
  displacementPpUm: number;
  bearingBdu: number;
  isoZone: IsoZone;
  bduStatus: 'good' | 'caution' | 'critical';
}

export function classifyIsoZone(
  velocityRmsMmS: number,
  machineClass: MachineClassSpec
): IsoZone {
  const [ab, bc, cd] = machineClass.thresholds;
  if (velocityRmsMmS <= ab) return 'A';
  if (velocityRmsMmS <= bc) return 'B';
  if (velocityRmsMmS <= cd) return 'C';
  return 'D';
}

export function computePointReading(
  pointId: ProbePointId,
  scenario: FaultScenarioSpec,
  rpm: number,
  machineClass: MachineClassSpec
): PointReading {
  const profile = scenario.points[pointId];
  const rpmRatio = Math.max(0.3, rpm / 1800);
  const velocityRmsMmS =
    profile.velocity1800 * Math.pow(rpmRatio, scenario.rpmExponent);

  const dominantFreqHz = Math.max(5, profile.dominantOrder * (rpm / 60));
  const vPeakMmS = velocityRmsMmS * Math.SQRT2;
  const displacementPpUm = (vPeakMmS * 1000) / (Math.PI * dominantFreqHz);
  const sinusoidalAccelG =
    (vPeakMmS * 2 * Math.PI * dominantFreqHz) / (1000 * 9.80665);
  const accelPeakG =
    sinusoidalAccelG + profile.hfAccelG * Math.pow(rpmRatio, 1.2);
  const bearingBdu = profile.bduBase * Math.pow(rpmRatio, 1.15);

  const isoZone = classifyIsoZone(velocityRmsMmS, machineClass);
  const bduStatus: 'good' | 'caution' | 'critical' =
    bearingBdu >= 100 ? 'critical' : bearingBdu >= 50 ? 'caution' : 'good';

  return {
    pointId,
    velocityRmsMmS,
    accelPeakG,
    displacementPpUm,
    bearingBdu,
    isoZone,
    bduStatus,
  };
}

export function getPrimaryValueForMode(
  reading: PointReading,
  mode: VibrationMode
): { value: number; unit: string; decimals: number } {
  switch (mode) {
    case 'velocity':
      return { value: reading.velocityRmsMmS, unit: 'mm/s RMS', decimals: 2 };
    case 'acceleration':
      return { value: reading.accelPeakG, unit: 'g Peak', decimals: 2 };
    case 'displacement':
      return { value: reading.displacementPpUm, unit: 'μm P-P', decimals: 1 };
    case 'bearing':
      return { value: reading.bearingBdu, unit: 'BDU', decimals: 0 };
  }
}
