export type MeterStyle = 'digital' | 'analog';

export type WorkbenchScenario =
  | 'batteries'
  | 'dividers'
  | 'led'
  | 'ac-outlet'
  | 'components'
  | 'fault';

export type DigitalDialMode =
  | 'OFF'
  | 'V_AC'
  | 'V_DC'
  | 'mV_DC'
  | 'OHM_CONT_DIODE'
  | 'HZ'
  | 'MA_A';

export type OhmSubMode = 'OHM' | 'CONT' | 'DIODE';

export type AnalogRange =
  | 'OFF'
  | 'AC_250V'
  | 'AC_50V'
  | 'DC_50V'
  | 'DC_10V'
  | 'DC_2_5V'
  | 'OHM_X1'
  | 'OHM_X100'
  | 'OHM_X10K'
  | 'DC_MA';

export type RedJackId = 'V_OHM_HZ' | 'MA_UA' | '10A';

export type AcOutletFault = 'normal' | 'open-neutral' | 'reverse-polarity';

export type HiddenFaultId =
  | 'blown-fuse'
  | 'open-wire'
  | 'shorted-diode'
  | 'dead-psu';

export interface TestNode {
  id: string;
  label: string;
  x: number;
  y: number;
  subLabel?: string;
}

export interface CircuitState {
  scenario: WorkbenchScenario;
  potRatio: number; // 0.05 to 0.95 for voltage divider
  ledSwitchOn: boolean;
  acFault: AcOutletFault;
  hiddenFault: HiddenFaultId;
}

export interface RawElectricalPair {
  kind: 'dc-v' | 'ac-v' | 'ohm' | 'diode' | 'open';
  volts: number; // signed for DC, RMS for AC
  freqHz: number;
  ohms: number | null; // null = OL
  diodeDropV?: number;
  currentMa?: number; // available when measuring in-line or shunt
  isVoltageSource: boolean;
}

export interface DigitalReadout {
  display: string;
  unit: string;
  numericValue: number | null;
  isOl: boolean;
  isLeadError: boolean;
  isFuseBlown: boolean;
  isBeep: boolean;
  barSegments: number; // 0..60
  polarity: '+' | '-' | 'AC' | '';
  rangeLabel: string;
  note: { en: string; id: string; ja: string };
}

export interface AnalogReadout {
  needleDeg: number; // -45 (left stop) to +45 (right full scale); -50 = reverse polarity peg
  scaleText: string;
  isLeadError: boolean;
  isFuseBlown: boolean;
  isReversePolarity: boolean;
  note: { en: string; id: string; ja: string };
}

export const SCENARIO_TABS: {
  id: WorkbenchScenario;
  en: string;
  idLabel: string;
  ja: string;
}[] = [
  { id: 'batteries', en: 'Batteries', idLabel: 'Baterai', ja: '電池' },
  { id: 'dividers', en: 'Dividers', idLabel: 'Pembagi', ja: '分圧回路' },
  { id: 'led', en: 'LED Circuit', idLabel: 'Rangkaian LED', ja: 'LED回路' },
  { id: 'ac-outlet', en: 'AC Outlet', idLabel: 'Stopkontak AC', ja: 'ACコンセント' },
  { id: 'components', en: 'Component Tray', idLabel: 'Komponen', ja: '部品トレイ' },
  { id: 'fault', en: 'Find the Fault', idLabel: 'Cari Gangguan', ja: '故障診断' },
];

export const HIDDEN_FAULT_OPTIONS: {
  id: HiddenFaultId;
  en: string;
  idLabel: string;
  ja: string;
}[] = [
  {
    id: 'blown-fuse',
    en: 'Blown 2A Control Fuse (F1)',
    idLabel: 'Sekring Kontrol 2A Putus (F1)',
    ja: '2A 制御ヒューズ断線 (F1)',
  },
  {
    id: 'open-wire',
    en: 'Open Wire Between TP2 and TP3',
    idLabel: 'Kabel Putus Antara TP2 & TP3',
    ja: 'TP2–TP3 間の断線',
  },
  {
    id: 'shorted-diode',
    en: 'Shorted Flyback Diode D1 (0.2 Ω)',
    idLabel: 'Dioda D1 Hubung Singkat (0,2 Ω)',
    ja: 'ダイオード D1 短絡故障 (0.2 Ω)',
  },
  {
    id: 'dead-psu',
    en: 'Dead 24V Power Supply (0.0 V)',
    idLabel: 'Catu Daya 24V Mati (0,0 V)',
    ja: '24V 電源ユニット出力停止 (0.0 V)',
  },
];

export function getScenarioNodes(scenario: WorkbenchScenario): TestNode[] {
  switch (scenario) {
    case 'batteries':
      return [
        { id: 'BAT9_POS', label: '9V +', x: 120, y: 120 },
        { id: 'BAT9_NEG', label: '9V -', x: 185, y: 120 },
        { id: 'AA_POS', label: '1.5V +', x: 340, y: 120 },
        { id: 'AA_NEG', label: '1.5V -', x: 340, y: 225 },
        { id: 'AGM_POS', label: '12V +', x: 475, y: 130 },
        { id: 'AGM_NEG', label: '12V -', x: 565, y: 130 },
      ];
    case 'dividers':
      return [
        { id: 'DIV_VIN', label: '+12V', x: 140, y: 115 },
        { id: 'DIV_MID', label: 'V_OUT', x: 340, y: 205 },
        { id: 'DIV_GND', label: 'GND', x: 140, y: 295 },
      ];
    case 'led':
      return [
        { id: 'LED_BAT_POS', label: '+9V', x: 120, y: 130 },
        { id: 'LED_SW_OUT', label: 'SW OUT', x: 265, y: 130 },
        { id: 'LED_ANODE', label: 'LED +', x: 425, y: 130 },
        { id: 'LED_GND', label: 'GND', x: 425, y: 280 },
      ];
    case 'ac-outlet':
      return [
        { id: 'AC_HOT', label: 'HOT (L)', x: 265, y: 175 },
        { id: 'AC_NEU', label: 'NEU (N)', x: 395, y: 175 },
        { id: 'AC_GND', label: 'PE (GND)', x: 330, y: 255 },
      ];
    case 'components':
      return [
        { id: 'R1K_A', label: '1kΩ A', x: 115, y: 115 },
        { id: 'R1K_B', label: '1kΩ B', x: 215, y: 115 },
        { id: 'R4K7_A', label: '4.7kΩ A', x: 365, y: 115 },
        { id: 'R4K7_B', label: '4.7kΩ B', x: 465, y: 115 },
        { id: 'DIO_A', label: 'D1 (+)', x: 115, y: 220 },
        { id: 'DIO_K', label: 'D1 (-)', x: 215, y: 220 },
        { id: 'FOK_A', label: 'F1 OK A', x: 365, y: 220 },
        { id: 'FOK_B', label: 'F1 OK B', x: 465, y: 220 },
        { id: 'FBD_A', label: 'F2 BAD A', x: 115, y: 315 },
        { id: 'FBD_B', label: 'F2 BAD B', x: 215, y: 315 },
        { id: 'COIL_A', label: 'U1', x: 365, y: 315 },
        { id: 'COIL_B', label: 'U2', x: 465, y: 315 },
      ];
    case 'fault':
      return [
        { id: 'TP1_PSU', label: 'TP1 (+24V)', x: 115, y: 145 },
        { id: 'TP2_FUSE', label: 'TP2 (F1 OUT)', x: 255, y: 145 },
        { id: 'TP3_LOAD', label: 'TP3 (COIL+)', x: 405, y: 145 },
        { id: 'TP4_GND', label: 'TP4 (0V)', x: 405, y: 280 },
      ];
  }
}

export function evaluateRawPair(
  redNode: string | null,
  blackNode: string | null,
  circuit: CircuitState
): RawElectricalPair {
  if (!redNode || !blackNode) {
    return {
      kind: 'open',
      volts: 0,
      freqHz: 0,
      ohms: null,
      isVoltageSource: false,
    };
  }
  if (redNode === blackNode) {
    return {
      kind: 'dc-v',
      volts: 0,
      freqHz: 0,
      ohms: 0.05,
      isVoltageSource: false,
    };
  }

  const pair = [redNode, blackNode].sort().join('|');

  if (circuit.scenario === 'batteries') {
    const map: Record<string, number> = {
      BAT9_POS: 9.24,
      BAT9_NEG: 0,
      AA_POS: 1.56,
      AA_NEG: 0,
      AGM_POS: 12.68,
      AGM_NEG: 0,
    };
    const sameBat =
      (redNode.startsWith('BAT9') && blackNode.startsWith('BAT9')) ||
      (redNode.startsWith('AA') && blackNode.startsWith('AA')) ||
      (redNode.startsWith('AGM') && blackNode.startsWith('AGM'));
    if (sameBat && redNode in map && blackNode in map) {
      const v = map[redNode] - map[blackNode];
      return {
        kind: 'dc-v',
        volts: v,
        freqHz: 0,
        ohms: null,
        isVoltageSource: true,
      };
    }
    return { kind: 'open', volts: 0, freqHz: 0, ohms: null, isVoltageSource: false };
  }

  if (circuit.scenario === 'dividers') {
    const vMid = 12.0 * circuit.potRatio;
    const pot: Record<string, number> = {
      DIV_VIN: 12.0,
      DIV_MID: vMid,
      DIV_GND: 0.0,
    };
    if (redNode in pot && blackNode in pot) {
      return {
        kind: 'dc-v',
        volts: pot[redNode] - pot[blackNode],
        freqHz: 0,
        ohms: null,
        isVoltageSource: true,
      };
    }
  }

  if (circuit.scenario === 'led') {
    const pot: Record<string, number> = {
      LED_BAT_POS: 9.0,
      LED_SW_OUT: circuit.ledSwitchOn ? 8.98 : 0.0,
      LED_ANODE: circuit.ledSwitchOn ? 1.92 : 0.0,
      LED_GND: 0.0,
    };
    if (redNode in pot && blackNode in pot) {
      const v = pot[redNode] - pot[blackNode];
      return {
        kind: 'dc-v',
        volts: v,
        freqHz: 0,
        ohms: !circuit.ledSwitchOn && pair === 'LED_ANODE|LED_SW_OUT' ? 330 : null,
        currentMa: circuit.ledSwitchOn ? 21.4 : 0,
        isVoltageSource: Math.abs(v) > 0.1 || circuit.ledSwitchOn,
      };
    }
  }

  if (circuit.scenario === 'ac-outlet') {
    let v = 0;
    if (circuit.acFault === 'normal') {
      if (pair === 'AC_HOT|AC_NEU') v = 230.4;
      else if (pair === 'AC_GND|AC_HOT') v = 230.2;
      else if (pair === 'AC_GND|AC_NEU') v = 0.3;
    } else if (circuit.acFault === 'open-neutral') {
      if (pair === 'AC_HOT|AC_NEU') v = 0.8;
      else if (pair === 'AC_GND|AC_HOT') v = 230.2;
      else if (pair === 'AC_GND|AC_NEU') v = 0.5;
    } else if (circuit.acFault === 'reverse-polarity') {
      if (pair === 'AC_HOT|AC_NEU') v = 230.4;
      else if (pair === 'AC_GND|AC_HOT') v = 0.3;
      else if (pair === 'AC_GND|AC_NEU') v = 230.2;
    }
    return {
      kind: 'ac-v',
      volts: v,
      freqHz: v > 10 ? 50.0 : 0,
      ohms: null,
      isVoltageSource: v > 5,
    };
  }

  if (circuit.scenario === 'components') {
    if (pair === 'R1K_A|R1K_B') {
      return { kind: 'ohm', volts: 0, freqHz: 0, ohms: 998, isVoltageSource: false };
    }
    if (pair === 'R4K7_A|R4K7_B') {
      return { kind: 'ohm', volts: 0, freqHz: 0, ohms: 4680, isVoltageSource: false };
    }
    if (pair === 'FOK_A|FOK_B') {
      return { kind: 'ohm', volts: 0, freqHz: 0, ohms: 0.12, isVoltageSource: false };
    }
    if (pair === 'FBD_A|FBD_B') {
      return { kind: 'ohm', volts: 0, freqHz: 0, ohms: null, isVoltageSource: false };
    }
    if (pair === 'COIL_A|COIL_B') {
      return { kind: 'ohm', volts: 0, freqHz: 0, ohms: 4.2, isVoltageSource: false };
    }
    if (redNode === 'DIO_A' && blackNode === 'DIO_K') {
      return {
        kind: 'diode',
        volts: 0,
        freqHz: 0,
        ohms: 585,
        diodeDropV: 0.585,
        isVoltageSource: false,
      };
    }
    if (redNode === 'DIO_K' && blackNode === 'DIO_A') {
      return { kind: 'open', volts: 0, freqHz: 0, ohms: null, isVoltageSource: false };
    }
    return { kind: 'open', volts: 0, freqHz: 0, ohms: null, isVoltageSource: false };
  }

  if (circuit.scenario === 'fault') {
    const f = circuit.hiddenFault;
    const pot: Record<string, number> = {
      TP1_PSU: f === 'dead-psu' ? 0.0 : 24.1,
      TP2_FUSE:
        f === 'dead-psu' || f === 'blown-fuse' ? 0.0 : f === 'shorted-diode' ? 1.2 : 24.05,
      TP3_LOAD:
        f === 'dead-psu' || f === 'blown-fuse' || f === 'open-wire'
          ? 0.0
          : f === 'shorted-diode'
            ? 0.4
            : 24.0,
      TP4_GND: 0.0,
    };
    if (redNode in pot && blackNode in pot) {
      const v = pot[redNode] - pot[blackNode];
      const ohmVal =
        pair === 'TP3_LOAD|TP4_GND' && f === 'shorted-diode'
          ? 0.2
          : pair === 'TP1_PSU|TP2_FUSE' && f !== 'blown-fuse'
            ? 0.1
            : null;
      return {
        kind: 'dc-v',
        volts: v,
        freqHz: 0,
        ohms: ohmVal,
        isVoltageSource: f !== 'dead-psu' && Math.abs(v) > 0.5,
      };
    }
  }

  return { kind: 'open', volts: 0, freqHz: 0, ohms: null, isVoltageSource: false };
}

export function computeDigitalReadout(
  dial: DigitalDialMode,
  subMode: OhmSubMode,
  redJack: RedJackId,
  fuseBlown: boolean,
  manualRangeIdx: number,
  raw: RawElectricalPair
): DigitalReadout {
  if (dial === 'OFF') {
    return {
      display: '',
      unit: '',
      numericValue: null,
      isOl: false,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: 0,
      polarity: '',
      rangeLabel: '',
      note: {
        en: 'Meter OFF. Turn the rotary dial to select a measurement function.',
        id: 'Meter OFF. Putar selektor untuk memilih fungsi pengukuran.',
        ja: 'メーターOFF。ダイヤルを回して測定モードを選択してください。',
      },
    };
  }

  // Lead error check: Red lead in 10A or mA/uA when dial is NOT on mA/A, OR probing voltage source in A mode
  const wrongJackForVolts =
    (redJack === '10A' || redJack === 'MA_UA') && dial !== 'MA_A';
  const probingVoltageInAmps = dial === 'MA_A' && raw.isVoltageSource;

  if (wrongJackForVolts || probingVoltageInAmps) {
    return {
      display: 'LEAd',
      unit: 'ERR',
      numericValue: null,
      isOl: false,
      isLeadError: true,
      isFuseBlown: probingVoltageInAmps ? true : fuseBlown,
      isBeep: false,
      barSegments: 60,
      polarity: '',
      rangeLabel: 'FAULT',
      note: {
        en: 'LEAD ERROR! Red lead is in a current jack (mA/10A) across a voltage source — internal fuse blown!',
        id: 'KESALAHAN KABEL! Probe merah di terminal arus (mA/10A) pada sumber tegangan — sekring putus!',
        ja: 'リード接続エラー！電流端子（mA/10A）のまま電圧源に接続し、内蔵ヒューズが溶断しました！',
      },
    };
  }

  if (fuseBlown && dial === 'MA_A') {
    return {
      display: 'FUSE',
      unit: 'OPEN',
      numericValue: null,
      isOl: true,
      isLeadError: false,
      isFuseBlown: true,
      isBeep: false,
      barSegments: 0,
      polarity: '',
      rangeLabel: 'MAN',
      note: {
        en: 'Current fuse is blown. Click "Replace Fuse" to restore mA/A measurements.',
        id: 'Sekring arus putus. Klik "Ganti Sekring" untuk memulihkan pengukuran mA/A.',
        ja: '電流ヒューズが断線しています。「ヒューズ交換」で復旧してください。',
      },
    };
  }

  const rangeLabel = manualRangeIdx === 0 ? 'AUTO' : `MAN R${manualRangeIdx}`;

  if (dial === 'V_AC') {
    const val = raw.kind === 'ac-v' ? raw.volts : 0;
    return {
      display: val.toFixed(1),
      unit: 'V AC',
      numericValue: val,
      isOl: false,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: Math.min(60, Math.round((val / 250) * 60)),
      polarity: 'AC',
      rangeLabel,
      note: {
        en:
          val > 100
            ? `True-RMS AC voltage: ${val.toFixed(1)} V AC.`
            : 'AC-coupled voltage reading (blocks pure DC).',
        id:
          val > 100
            ? `Tegangan AC True-RMS: ${val.toFixed(1)} V AC.`
            : 'Pembacaan tegangan AC (memblokir DC murni).',
        ja:
          val > 100
            ? `True-RMS交流電圧: ${val.toFixed(1)} V AC。`
            : 'AC結合電圧測定（純直流は遮断されます）。',
      },
    };
  }

  if (dial === 'V_DC') {
    const val = raw.kind === 'dc-v' ? raw.volts : 0;
    return {
      display: Math.abs(val).toFixed(2),
      unit: 'V DC',
      numericValue: val,
      isOl: false,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: Math.min(60, Math.round((Math.abs(val) / 25) * 60)),
      polarity: val < -0.02 ? '-' : '+',
      rangeLabel,
      note: {
        en:
          val < -0.02
            ? 'Negative DC polarity — Red and Black leads are reversed.'
            : `DC voltage reading: ${val.toFixed(2)} V DC.`,
        id:
          val < -0.02
            ? 'Polaritas DC negatif — kabel Merah dan Hitam terbalik.'
            : `Pembacaan tegangan DC: ${val.toFixed(2)} V DC.`,
        ja:
          val < -0.02
            ? '負極性表示 — 赤と黒のリードが逆接続されています。'
            : `直流電圧測定値: ${val.toFixed(2)} V DC。`,
      },
    };
  }

  if (dial === 'mV_DC') {
    const mv = raw.kind === 'dc-v' ? raw.volts * 1000 : 0.2;
    if (Math.abs(mv) > 600) {
      return {
        display: 'OL',
        unit: 'mV DC',
        numericValue: null,
        isOl: true,
        isLeadError: false,
        isFuseBlown: fuseBlown,
        isBeep: false,
        barSegments: 60,
        polarity: mv < 0 ? '-' : '+',
        rangeLabel,
        note: {
          en: 'Over-limit (>600 mV). Switch dial to V DC.',
          id: 'Melebihi batas (>600 mV). Pindah ke V DC.',
          ja: 'レンジオーバー（>600 mV）。V DCへ切り替えてください。',
        },
      };
    }
    return {
      display: Math.abs(mv).toFixed(1),
      unit: 'mV DC',
      numericValue: mv,
      isOl: false,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: Math.min(60, Math.round((Math.abs(mv) / 600) * 60)),
      polarity: mv < -0.2 ? '-' : '+',
      rangeLabel,
      note: {
        en: 'Millivolt DC range (0.1 mV resolution).',
        id: 'Rentang milivolt DC (resolusi 0,1 mV).',
        ja: 'ミリボルト直流レンジ（分解能0.1 mV）。',
      },
    };
  }

  if (dial === 'HZ') {
    const hz = raw.kind === 'ac-v' ? raw.freqHz : 0;
    return {
      display: hz.toFixed(2),
      unit: 'Hz',
      numericValue: hz,
      isOl: false,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: hz > 0 ? 30 : 0,
      polarity: 'AC',
      rangeLabel,
      note: {
        en:
          hz > 0
            ? `Mains frequency locked at ${hz.toFixed(2)} Hz.`
            : '0.00 Hz — connect across an AC source to measure frequency.',
        id:
          hz > 0
            ? `Frekuensi jala-jala terkunci pada ${hz.toFixed(2)} Hz.`
            : '0,00 Hz — hubungkan ke sumber AC untuk mengukur frekuensi.',
        ja:
          hz > 0
            ? `電源周波数 ${hz.toFixed(2)} Hz を検出。`
            : '0.00 Hz — 交流電源に接続して周波数を測定します。',
      },
    };
  }

  if (dial === 'MA_A') {
    const ma = raw.currentMa ?? 0;
    return {
      display: ma.toFixed(1),
      unit: 'mA DC',
      numericValue: ma,
      isOl: false,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: Math.min(60, Math.round((ma / 100) * 60)),
      polarity: '+',
      rangeLabel,
      note: {
        en: 'Current measurement via fused mA/10A jack.',
        id: 'Pengukuran arus melalui terminal bersekring mA/10A.',
        ja: 'ヒューズ保護付き mA/10A 端子による電流測定。',
      },
    };
  }

  // OHM_CONT_DIODE
  if (raw.isVoltageSource && Math.abs(raw.volts) > 2) {
    return {
      display: 'OL',
      unit: 'V!',
      numericValue: null,
      isOl: true,
      isLeadError: true,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: 60,
      polarity: '',
      rangeLabel,
      note: {
        en: 'WARNING: External voltage detected in Ω/Continuity mode! Isolate power first.',
        id: 'PERINGATAN: Tegangan eksternal terdeteksi di mode Ω/Kontinuitas! Putuskan daya terlebih dahulu.',
        ja: '警告: 抵抗/導通モード中に外部電圧を検出！電源を遮断してください。',
      },
    };
  }

  if (subMode === 'DIODE') {
    if (raw.kind === 'diode' && raw.diodeDropV !== undefined) {
      return {
        display: raw.diodeDropV.toFixed(3),
        unit: 'V ⏵|',
        numericValue: raw.diodeDropV,
        isOl: false,
        isLeadError: false,
        isFuseBlown: fuseBlown,
        isBeep: false,
        barSegments: 25,
        polarity: '+',
        rangeLabel: 'DIODE',
        note: {
          en: 'Forward-biased silicon PN junction (~0.585 V). Swap leads to confirm OL.',
          id: 'Sambungan PN silikon bias maju (~0,585 V). Tukar probe untuk memastikan OL.',
          ja: 'シリコンダイオード順方向降下（約0.585 V）。逆接続でOLを確認。',
        },
      };
    }
    return {
      display: 'OL',
      unit: 'V ⏵|',
      numericValue: null,
      isOl: true,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: 0,
      polarity: '',
      rangeLabel: 'DIODE',
      note: {
        en: 'Open / reverse-biased junction (OL).',
        id: 'Terbuka / bias mundur (OL).',
        ja: '開放または逆バイアス（OL）。',
      },
    };
  }

  if (raw.ohms === null) {
    return {
      display: 'OL',
      unit: subMode === 'CONT' ? 'Ω 🔊' : 'MΩ',
      numericValue: null,
      isOl: true,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isBeep: false,
      barSegments: 0,
      polarity: '',
      rangeLabel,
      note: {
        en: 'Open Loop (OL) — infinite resistance / open circuit.',
        id: 'Open Loop (OL) — resistansi tak terhingga / rangkaian terbuka.',
        ja: 'オープンループ（OL）— 抵抗無限大／断線状態。',
      },
    };
  }

  const isBeep = subMode === 'CONT' && raw.ohms < 40;
  const formatted =
    raw.ohms >= 1000
      ? (raw.ohms / 1000).toFixed(3)
      : raw.ohms.toFixed(2);
  const unitStr =
    subMode === 'CONT'
      ? 'Ω 🔊'
      : raw.ohms >= 1000
        ? 'kΩ'
        : 'Ω';

  return {
    display: formatted,
    unit: unitStr,
    numericValue: raw.ohms,
    isOl: false,
    isLeadError: false,
    isFuseBlown: fuseBlown,
    isBeep,
    barSegments: Math.max(4, 60 - Math.min(55, Math.round(raw.ohms / 100))),
    polarity: '',
    rangeLabel: subMode === 'CONT' ? 'CONT' : rangeLabel,
    note: {
      en: isBeep
        ? `Continuity confirmed (${raw.ohms.toFixed(2)} Ω < 40 Ω) — 2.4 kHz buzzer active.`
        : `Resistance measured: ${formatted} ${unitStr}.`,
      id: isBeep
        ? `Kontinuitas terkonfirmasi (${raw.ohms.toFixed(2)} Ω < 40 Ω) — buzzer aktif.`
        : `Resistansi terukur: ${formatted} ${unitStr}.`,
      ja: isBeep
        ? `導通確認（${raw.ohms.toFixed(2)} Ω < 40 Ω）— 2.4 kHz ブザー鳴動。`
        : `抵抗測定値: ${formatted} ${unitStr}。`,
    },
  };
}

export function computeAnalogReadout(
  range: AnalogRange,
  zeroOhmAdj: number, // -3 to +3 deg
  redJack: RedJackId,
  fuseBlown: boolean,
  raw: RawElectricalPair
): AnalogReadout {
  if (range === 'OFF') {
    return {
      needleDeg: -45,
      scaleText: 'OFF (PARKED)',
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isReversePolarity: false,
      note: {
        en: 'Analog VOM-20K is OFF (needle parked at left).',
        id: 'Avometer Analog dalam posisi OFF (jarum di kiri).',
        ja: 'アナログテスタ VOM-20K はOFFです。',
      },
    };
  }

  if (redJack === '10A' || redJack === 'MA_UA') {
    return {
      needleDeg: 47,
      scaleText: 'LEAD ERROR',
      isLeadError: true,
      isFuseBlown: raw.isVoltageSource ? true : fuseBlown,
      isReversePolarity: false,
      note: {
        en: 'LEAD ERROR! Return Red lead to V-Ω-Hz jack.',
        id: 'KESALAHAN KABEL! Kembalikan probe merah ke terminal V-Ω-Hz.',
        ja: 'リードエラー！赤リードを V-Ω-Hz 端子に戻してください。',
      },
    };
  }

  if (range.startsWith('DC_') && range !== 'DC_MA') {
    const maxV = range === 'DC_50V' ? 50 : range === 'DC_10V' ? 10 : 2.5;
    const v = raw.kind === 'dc-v' ? raw.volts : 0;
    if (v < -0.05) {
      return {
        needleDeg: -50,
        scaleText: 'REV POLARITY!',
        isLeadError: false,
        isFuseBlown: fuseBlown,
        isReversePolarity: true,
        note: {
          en: 'Needle pegged against left stop! Swap Red/Black leads for positive DC deflection.',
          id: 'Jarum tertahan di batas kiri! Tukar kabel Merah/Hitam untuk defleksi positif.',
          ja: '針が左端ストッパーに振り切れています！赤・黒リードを入れ替えてください。',
        },
      };
    }
    const frac = Math.min(1.04, Math.max(0, v / maxV));
    return {
      needleDeg: -45 + frac * 90,
      scaleText: `${v.toFixed(2)} V / ${maxV}V`,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isReversePolarity: false,
      note: {
        en: `Reading ${v.toFixed(2)} V on ${maxV}V DC mirrored arc scale.`,
        id: `Membaca ${v.toFixed(2)} V pada skala cermin ${maxV}V DC.`,
        ja: `${maxV}V DC ミラースケールで ${v.toFixed(2)} V を指示。`,
      },
    };
  }

  if (range.startsWith('AC_')) {
    const maxV = range === 'AC_250V' ? 250 : 50;
    const v = raw.kind === 'ac-v' ? raw.volts : 0;
    const frac = Math.min(1.04, Math.max(0, v / maxV));
    return {
      needleDeg: -45 + frac * 90,
      scaleText: `${v.toFixed(1)} V / ${maxV}V AC`,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isReversePolarity: false,
      note: {
        en: `Reading ${v.toFixed(1)} V AC on ${maxV}V AC scale.`,
        id: `Membaca ${v.toFixed(1)} V AC pada skala ${maxV}V AC.`,
        ja: `${maxV}V AC スケールで ${v.toFixed(1)} V を指示。`,
      },
    };
  }

  if (range.startsWith('OHM_')) {
    // Reverse-log scale: infinity at -45 deg (left), 0 Ω at +45 deg (right) + zeroOhmAdj
    if (raw.ohms === null) {
      return {
        needleDeg: -45,
        scaleText: '∞ Ω (OPEN)',
        isLeadError: false,
        isFuseBlown: fuseBlown,
        isReversePolarity: false,
        note: {
          en: 'Infinite resistance (∞) at left of Ω arc.',
          id: 'Resistansi tak terhingga (∞) di sisi kiri busur Ω.',
          ja: '抵抗無限大（∞）— Ωスケールの左端。',
        },
      };
    }
    const mult = range === 'OHM_X1' ? 1 : range === 'OHM_X100' ? 100 : 10000;
    const midScaleOhms = 20 * mult; // 20 on center of Ω scale
    const ratio = midScaleOhms / (midScaleOhms + raw.ohms); // 1 at 0 Ω, 0.5 at midScale, 0 at inf
    const deg = Math.min(46, Math.max(-45, -45 + ratio * 90 + zeroOhmAdj));
    return {
      needleDeg: deg,
      scaleText: `${raw.ohms.toFixed(1)} Ω (×${mult})`,
      isLeadError: false,
      isFuseBlown: fuseBlown,
      isReversePolarity: false,
      note: {
        en: `Reverse-log Ω scale (×${mult}): 0 Ω is on the right; adjust Zero Ω knob if needed.`,
        id: `Skala Ω log-terbalik (×${mult}): 0 Ω di kanan; atur kenop Zero Ω jika perlu.`,
        ja: `逆対数Ωスケール（×${mult}）: 右端が 0 Ω です。必要に応じ0Ω調整を行ってください。`,
      },
    };
  }

  return {
    needleDeg: -45 + Math.min(1, (raw.currentMa ?? 0) / 100) * 90,
    scaleText: `${(raw.currentMa ?? 0).toFixed(1)} mA`,
    isLeadError: false,
    isFuseBlown: fuseBlown,
    isReversePolarity: false,
    note: {
      en: 'Analog DC mA range.',
      id: 'Rentang mA DC analog.',
      ja: 'アナログ直流 mA レンジ。',
    },
  };
}
