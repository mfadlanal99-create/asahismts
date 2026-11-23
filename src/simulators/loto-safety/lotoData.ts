export type LotoScenarioId =
  | 'motor-drive-vfd'
  | 'centrifugal-pump-drive'
  | 'hydraulic-press-accumulator'
  | 'dual-feed-conveyor';

export type HazardFaultId =
  | 'none'
  | 'tag-only-no-lock'
  | 'dual-backfeed'
  | 'trapped-accumulator'
  | 'skipped-tryout';

export type LotoStepId =
  | 'notify'
  | 'shutdown'
  | 'isolate'
  | 'lock-tag'
  | 'stored-energy'
  | 'verify';

export type SelectorMode = 'hand' | 'off' | 'auto';

export type LiveDeadLiveStage = 'idle' | 'live-1' | 'dead-test' | 'live-2' | 'verified';

export interface TrilingualText {
  en: string;
  id: string;
  ja: string;
}

export interface LotoScenarioSpec {
  id: LotoScenarioId;
  name: TrilingualText;
  subtitle: TrilingualText;
  nominalVoltageV: number;
  secondaryVoltageV: number;
  dcBusVoltageV: number;
  nominalPressureBar: number;
  hasPressureSystem: boolean;
  hasGravityBlock: boolean;
  hasCapacitor: boolean;
  hasDualFeed: boolean;
  energySources: TrilingualText[];
}

export interface HazardFaultSpec {
  id: HazardFaultId;
  name: TrilingualText;
  description: TrilingualText;
}

export interface LotoWorkflowStepSpec {
  id: LotoStepId;
  stepNumber: number;
  title: TrilingualText;
  detail: TrilingualText;
}

export interface LotoStateInput {
  scenarioId: LotoScenarioId;
  faultId: HazardFaultId;
  notifiedPersonnel: boolean;
  // Local Control Station (LCS) at Motor
  selectorMode: SelectorMode;
  stopPressed: boolean;
  localSelectorLocked: boolean;
  localSelectorTagged: boolean;
  // Main MCC / VFD Panel
  mccDisconnectOpen: boolean;
  mccLocked: boolean;
  mccTagged: boolean;
  capacitorDischarged: boolean;
  // Secondary Backfeed (Dual-Feed Conveyor)
  secondaryDisconnectOpen: boolean;
  secondaryLocked: boolean;
  secondaryTagged: boolean;
  // Motor-Side Field Isolator & Process/Mechanical
  motorIsolatorOpen: boolean;
  motorIsolatorLocked: boolean;
  motorIsolatorTagged: boolean;
  processValveClosed: boolean;
  processValveLocked: boolean;
  bleedValveOpen: boolean;
  gravityBlockInstalled: boolean;
  // Verification (Test Before Touch + Try-Out)
  ldlStage: LiveDeadLiveStage;
  tryOutAttempted: boolean;
}

export interface LotoAlarm {
  id: string;
  severity: 'danger' | 'caution';
  title: TrilingualText;
  detail: TrilingualText;
}

export interface LotoEvaluation {
  scenario: LotoScenarioSpec;
  effectiveMccVoltageV: number;
  effectiveSecondaryVoltageV: number;
  effectiveMotorTerminalVoltageV: number;
  effectivePressureBar: number;
  effectiveCapacitorV: number;
  motorRunning: boolean;
  isShutdownComplete: boolean;
  gravitySecured: boolean;
  isElectricallyIsolated: boolean;
  isLockAndTagCompliant: boolean;
  isStoredEnergyReleased: boolean;
  isLdlComplete: boolean;
  isTryOutComplete: boolean;
  isZeroEnergyVerified: boolean;
  completedStepCount: number;
  stepCompletion: Record<LotoStepId, boolean>;
  safetyStatus: 'energized' | 'isolated-unverified' | 'fault-hazard' | 'zero-energy-safe';
  alarms: LotoAlarm[];
}

export const INITIAL_LOTO_STATE: LotoStateInput = {
  scenarioId: 'motor-drive-vfd',
  faultId: 'none',
  notifiedPersonnel: false,
  selectorMode: 'auto',
  stopPressed: false,
  localSelectorLocked: false,
  localSelectorTagged: false,
  mccDisconnectOpen: false,
  mccLocked: false,
  mccTagged: false,
  capacitorDischarged: false,
  secondaryDisconnectOpen: false,
  secondaryLocked: false,
  secondaryTagged: false,
  motorIsolatorOpen: false,
  motorIsolatorLocked: false,
  motorIsolatorTagged: false,
  processValveClosed: false,
  processValveLocked: false,
  bleedValveOpen: false,
  gravityBlockInstalled: false,
  ldlStage: 'idle',
  tryOutAttempted: false,
};

export const LOTO_SCENARIOS: LotoScenarioSpec[] = [
  {
    id: 'motor-drive-vfd',
    name: {
      en: '3-Phase Motor Drive (MCC/VFD + LCS + Isolator)',
      id: 'Penggerak Motor 3-Fasa (Panel MCC/VFD + LCS + Isolator)',
      ja: '三相モータ駆動（MCC/VFD盤 + 現場操作盤 + 断路器）',
    },
    subtitle: {
      en: '480 V MCC/VFD (540 V DC Bus) + Local Selector + Motor Field Isolator',
      id: 'Panel MCC/VFD 480 V (Bus DC 540 V) + Selektor Lokal + Isolator Motor',
      ja: '480 V MCC/VFD（540 V DCバス）+ 現場切替スイッチ + モータ断路器',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 0,
    dcBusVoltageV: 540,
    nominalPressureBar: 0,
    hasPressureSystem: false,
    hasGravityBlock: false,
    hasCapacitor: true,
    hasDualFeed: false,
    energySources: [
      {
        en: '480 V 3-Phase Main MCC / VFD Panel Supply',
        id: 'Suplai Utama Panel MCC / VFD 3-Fasa 480 V',
        ja: '三相 480 V 主 MCC / VFD 電源',
      },
      {
        en: '540 V DC VFD Bus Capacitor Stored Charge',
        id: 'Muatan Tersimpan Kapasitor Bus DC VFD 540 V',
        ja: '540 V VFD DCバスコンデンサ残留電荷',
      },
      {
        en: 'Local Motor Field Isolator & Control Interlock',
        id: 'Isolator Lokal Motor & Interlock Kontrol Lapangan',
        ja: 'モータ現場断路器・現場制御インターロック',
      },
    ],
  },
  {
    id: 'centrifugal-pump-drive',
    name: {
      en: 'Centrifugal Pump Drive',
      id: 'Penggerak Pompa Sentrifugal',
      ja: '遠心ポンプ駆動装置',
    },
    subtitle: {
      en: '480 V MCC + LCS + Motor Isolator + Process Valve + 8.5 bar Drain',
      id: 'MCC 480 V + LCS + Isolator Motor + Katup Proses + Kuras 8.5 bar',
      ja: '480 V MCC + 現場操作盤 + モータ断路器 + プロセス弁 + 8.5 bar ドレン',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 0,
    dcBusVoltageV: 0,
    nominalPressureBar: 8.5,
    hasPressureSystem: true,
    hasGravityBlock: false,
    hasCapacitor: false,
    hasDualFeed: false,
    energySources: [
      {
        en: '480 V 3-Phase Electrical (MCC + Motor Isolator)',
        id: 'Listrik 3-Fasa 480 V (Panel MCC + Isolator Lokal Motor)',
        ja: '三相 480 V 電気エネルギー（MCC + モータ現場断路器）',
      },
      {
        en: '8.5 bar Process Fluid Pressure (Suction/Discharge)',
        id: 'Tekanan Fluida Proses 8.5 bar (Isap/Buang)',
        ja: 'プロセス流体圧力 8.5 bar（吸込・吐出）',
      },
    ],
  },
  {
    id: 'hydraulic-press-accumulator',
    name: {
      en: 'Hydraulic Press w/ Accumulator',
      id: 'Mesin Pres Hidrolik + Akumulator',
      ja: 'アキュムレータ付油圧プレス',
    },
    subtitle: {
      en: '480 V HPU MCC + Motor Isolator + 210 bar Bleed + Safety Ram Block',
      id: 'MCC HPU 480 V + Isolator Motor + Kuras 210 bar + Blok Pengaman Ram',
      ja: '480 V HPU MCC + モータ断路器 + 210 bar ブリード + 落下防止ブロック',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 0,
    dcBusVoltageV: 0,
    nominalPressureBar: 210,
    hasPressureSystem: true,
    hasGravityBlock: true,
    hasCapacitor: false,
    hasDualFeed: false,
    energySources: [
      {
        en: '480 V 3-Phase Hydraulic Power Unit (MCC + Isolator)',
        id: 'Unit Daya Hidrolik 3-Fasa 480 V (MCC + Isolator Motor)',
        ja: '三相 480 V 油圧ユニット電源（MCC + 現場断路器）',
      },
      {
        en: '210 bar Bladder Accumulator Stored Pressure',
        id: 'Tekanan Tersimpan Akumulator 210 bar',
        ja: '210 bar アキュムレータ蓄圧エネルギー',
      },
      {
        en: 'Gravitational Potential Energy (Upper Platen Ram)',
        id: 'Energi Potensial Gravitasi (Ram Atas)',
        ja: '位置エネルギー（上部プラテンラム重力）',
      },
    ],
  },
  {
    id: 'dual-feed-conveyor',
    name: {
      en: 'Dual-Feed Conveyor & VFD',
      id: 'Konveyor Sumber Ganda & VFD',
      ja: '二系統電源コンベア & VFD',
    },
    subtitle: {
      en: '480 V Main MCC (540 V DC) + 120 V Control Backfeed + Motor Isolator',
      id: 'MCC Utama 480 V (540 V DC) + Umpan Balik 120 V + Isolator Motor',
      ja: '480 V 主MCC（540 V DC）+ 120 V 制御逆潮流 + モータ断路器',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 120,
    dcBusVoltageV: 540,
    nominalPressureBar: 0,
    hasPressureSystem: false,
    hasGravityBlock: false,
    hasCapacitor: true,
    hasDualFeed: true,
    energySources: [
      {
        en: '480 V Primary Drive MCC + Local Motor Isolator',
        id: 'MCC Penggerak Utama 480 V + Isolator Lokal Motor',
        ja: '480 V 主駆動 MCC + モータ現場断路器',
      },
      {
        en: '120 V Secondary Interlock / Control Backfeed',
        id: 'Umpan Balik Kontrol / Interlock Sekunder 120 V',
        ja: '120 V 補助制御・逆潮流電源',
      },
      {
        en: '540 V DC VFD Bus Capacitor Stored Charge',
        id: 'Muatan Tersimpan Kapasitor Bus DC VFD 540 V',
        ja: '540 V VFD DCバスコンデンサ残留電荷',
      },
    ],
  },
];

export const HAZARD_FAULTS: HazardFaultSpec[] = [
  {
    id: 'none',
    name: {
      en: 'Standard Audit (No Fault)',
      id: 'Audit Standar (Tanpa Gangguan)',
      ja: '標準監査（故障なし）',
    },
    description: {
      en: 'Follow all 6 OSHA 1910.147 LOTO steps across MCC/VFD, Local Control Station, Motor Isolator, and Test-Before-Touch.',
      id: 'Ikuti seluruh 6 langkah LOTO OSHA 1910.147 pada Panel MCC/VFD, Sakelar Selektor Motor, Isolator Lokal Motor, dan Uji Tegangan Nol.',
      ja: 'OSHA 1910.147 の6ステップに従い、MCC/VFD・現場操作盤・モータ断路器・無電圧検証を実施します。',
    },
  },
  {
    id: 'tag-only-no-lock',
    name: {
      en: 'Tag-Only Without Padlock',
      id: 'Hanya Label Tanpa Gembok',
      ja: 'タグのみ・施錠なし（違反）',
    },
    description: {
      en: 'Danger Tag is hung without a personal padlock—OSHA 1910.147 prohibits tag-only on lockable disconnects.',
      id: 'Label Bahaya dipasang tanpa Gembok LOTO—OSHA 1910.147 melarang tag-only pada pemutus yang dapat dikunci.',
      ja: '施錠可能な遮断器に個人用南京錠を付けず危険タグのみを掛けており、誤投入を防止できません。',
    },
  },
  {
    id: 'dual-backfeed',
    name: {
      en: 'Dual Backfeed Source Active',
      id: 'Umpan Balik Sumber Ganda Aktif',
      ja: '二系統逆潮流（バックフィード）',
    },
    description: {
      en: 'Main MCC is locked out, but a secondary 120 V control/interlock feed backfeeds voltage into the terminal box.',
      id: 'MCC utama terkunci, tetapi sumber kontrol/interlock sekunder 120 V masih mengumpan balik tegangan ke kotak terminal.',
      ja: '主 MCC を施錠しても、別系統の 120 V 制御電源から端子箱へ電圧が逆流しています。',
    },
  },
  {
    id: 'trapped-accumulator',
    name: {
      en: 'Trapped Line / Accumulator Pressure',
      id: 'Tekanan Terjebak pada Pipa / Akumulator',
      ja: '配管・蓄圧器内の残留圧力',
    },
    description: {
      en: 'Process isolation valve is shut, but the bleed/drain valve is plugged—residual bar pressure remains trapped!',
      id: 'Katup isolasi proses ditutup, namun katup kuras/buang tersumbat—tekanan sisa masih terjebak!',
      ja: '遮断弁を閉じてもブリード弁が閉塞しており、システム内に高圧が閉じ込められています！',
    },
  },
  {
    id: 'skipped-tryout',
    name: {
      en: 'Skipped Live-Dead-Live & Try-Out',
      id: 'Melewatkan Live-Dead-Live & Try-Out',
      ja: '検電・起動試行（Try-Out）の省略',
    },
    description: {
      en: 'Switches are locked, but technician skips Live-Dead-Live multimeter probing and Start Try-Out verification.',
      id: 'Sakelar telah dikunci, tetapi teknisi melewatkan Verifikasi Tegangan Nol (Live-Dead-Live) dan Uji Coba Start (Try-Out).',
      ja: '施錠は完了していますが、Live-Dead-Live 検電試験と起動試行（Try-Out）を省略しています。',
    },
  },
];

export const LOTO_WORKFLOW_STEPS: LotoWorkflowStepSpec[] = [
  {
    id: 'notify',
    stepNumber: 1,
    title: {
      en: 'Notify & Identify Energy',
      id: 'Beritahu & Identifikasi Energi',
      ja: '通知・エネルギー特定',
    },
    detail: {
      en: 'Notify affected operators and identify electrical, DC bus, and fluid/gravity hazards.',
      id: 'Informasikan operator dan identifikasi sumber listrik, bus DC, serta tekanan/gravitasi.',
      ja: '関係作業者に通知し、電源・DCバス・流体/重力エネルギー源を特定します。',
    },
  },
  {
    id: 'shutdown',
    stepNumber: 2,
    title: {
      en: 'Normal Shutdown (LCS)',
      id: 'Penghentian Normal (LCS)',
      ja: '通常停止（現場操作盤）',
    },
    detail: {
      en: 'Turn Local Selector Switch to OFF, press STOP, and lock out the LCS selector.',
      id: 'Putar Sakelar Selektor Motor ke OFF, tekan STOP, dan kunci selektor LCS.',
      ja: '現場切替スイッチを OFF にし、停止ボタン押下後に現場スイッチを施錠します。',
    },
  },
  {
    id: 'isolate',
    stepNumber: 3,
    title: {
      en: 'Isolate MCC & Field',
      id: 'Isolasi MCC & Lapangan',
      ja: 'MCC・現場断路器の遮断',
    },
    detail: {
      en: 'Turn Main MCC Disconnect OFF, Local Motor Isolator OFF, and shut process valves.',
      id: 'Putar Pemutus Utama Panel MCC/VFD ke OFF, Isolator Lokal Motor ke OFF, dan tutup katup proses.',
      ja: '主 MCC 断路器・モータ現場断路器を OFF にし、プロセス遮断弁を閉じます。',
    },
  },
  {
    id: 'lock-tag',
    stepNumber: 4,
    title: {
      en: 'Apply Padlock & Danger Tag',
      id: 'Pasang Gembok LOTO & Label Bahaya',
      ja: '南京錠・危険タグの取付',
    },
    detail: {
      en: 'Attach personal Padlock + signed Danger Tag to MCC, LCS Selector, and Motor Isolator.',
      id: 'Pasang Gembok LOTO pribadi dan Label Bahaya pada Panel MCC, LCS, serta Isolator Lokal Motor.',
      ja: 'MCC盤・現場スイッチ・モータ断路器に個人用南京錠と危険タグを取り付けます。',
    },
  },
  {
    id: 'stored-energy',
    stepNumber: 5,
    title: {
      en: 'Release Stored Energy',
      id: 'Lepas Energi Tersimpan',
      ja: '残留エネルギーの放出',
    },
    detail: {
      en: 'Discharge VFD DC bus (540 V → 0 V), bleed pressure to 0.0 bar, and insert safety block.',
      id: 'Kosongkan kapasitor Bus DC VFD (540 V → 0 V), kuras tekanan ke 0.0 bar, dan pasang blok pengaman.',
      ja: 'VFD DCバスを放電（540 V→0 V）し、残圧を 0.0 bar に抜き、安全ブロックを挿入します。',
    },
  },
  {
    id: 'verify',
    stepNumber: 6,
    title: {
      en: 'Live-Dead-Live & Try-Out',
      id: 'Verifikasi Tegangan Nol & Try-Out',
      ja: '無電圧検証 & Try-Out',
    },
    detail: {
      en: 'Probe Motor Terminal Box (Live-Dead-Live 0.0 V) and press Start PB (Try-Out) to prove zero start.',
      id: 'Uji kotak terminal motor (Live-Dead-Live 0.0 V) dan lakukan Uji Coba Start (Try-Out) hingga terbukti gagal start.',
      ja: '端子箱を Live-Dead-Live 検電（0.0 V）し、起動ボタン（Try-Out）で起動不可を確認します。',
    },
  },
];

export function evaluateLotoState(input: LotoStateInput): LotoEvaluation {
  const scenario =
    LOTO_SCENARIOS.find((s) => s.id === input.scenarioId) ?? LOTO_SCENARIOS[0];

  const hasBackfeedFault = input.faultId === 'dual-backfeed';
  const hasTrappedPressureFault = input.faultId === 'trapped-accumulator';
  const hasTagOnlyFault = input.faultId === 'tag-only-no-lock';
  const hasSkippedTryoutFault = input.faultId === 'skipped-tryout';

  const effectiveMccVoltageV = input.mccDisconnectOpen ? 0 : scenario.nominalVoltageV;

  const effectiveSecondaryVoltageV = hasBackfeedFault
    ? scenario.hasDualFeed
      ? scenario.secondaryVoltageV
      : 120
    : scenario.hasDualFeed
      ? input.secondaryDisconnectOpen
        ? 0
        : scenario.secondaryVoltageV
      : 0;

  // Motor terminal box is de-energized only when BOTH MCC and Motor Isolator are open (and no backfeed)
  const effectiveMotorTerminalVoltageV =
    effectiveSecondaryVoltageV > 0
      ? effectiveSecondaryVoltageV
      : input.mccDisconnectOpen && input.motorIsolatorOpen
        ? 0
        : scenario.nominalVoltageV;

  const effectivePressureBar = !scenario.hasPressureSystem
    ? 0
    : hasTrappedPressureFault
      ? scenario.nominalPressureBar
      : input.processValveClosed && input.bleedValveOpen
        ? 0
        : scenario.nominalPressureBar;

  const effectiveCapacitorV = !scenario.hasCapacitor
    ? 0
    : input.mccDisconnectOpen && input.capacitorDischarged
      ? 0
      : scenario.dcBusVoltageV;

  const isShutdownComplete = input.selectorMode === 'off' && input.stopPressed;

  const motorRunning =
    !isShutdownComplete &&
    effectiveMccVoltageV > 0 &&
    !input.motorIsolatorOpen;

  const gravitySecured = !scenario.hasGravityBlock || input.gravityBlockInstalled;

  const isElectricallyIsolated =
    effectiveMccVoltageV === 0 &&
    effectiveSecondaryVoltageV === 0 &&
    effectiveMotorTerminalVoltageV === 0 &&
    effectiveCapacitorV === 0 &&
    input.mccDisconnectOpen &&
    input.motorIsolatorOpen;

  const mccLockOk =
    input.mccDisconnectOpen && input.mccLocked && input.mccTagged && !hasTagOnlyFault;

  const localSelectorLockOk =
    input.selectorMode === 'off' &&
    input.localSelectorLocked &&
    input.localSelectorTagged &&
    !hasTagOnlyFault;

  const motorIsolatorLockOk =
    input.motorIsolatorOpen &&
    input.motorIsolatorLocked &&
    input.motorIsolatorTagged &&
    !hasTagOnlyFault;

  const secondaryLockOk =
    !scenario.hasDualFeed ||
    (input.secondaryDisconnectOpen &&
      input.secondaryLocked &&
      input.secondaryTagged &&
      !hasTagOnlyFault);

  const processValveLockOk =
    !scenario.hasPressureSystem || (input.processValveClosed && input.processValveLocked);

  const isLockAndTagCompliant =
    mccLockOk &&
    localSelectorLockOk &&
    motorIsolatorLockOk &&
    secondaryLockOk &&
    processValveLockOk;

  const isStoredEnergyReleased =
    effectivePressureBar === 0 && effectiveCapacitorV === 0 && gravitySecured;

  const isLdlComplete =
    !hasSkippedTryoutFault &&
    input.ldlStage === 'verified' &&
    effectiveMotorTerminalVoltageV === 0 &&
    effectiveMccVoltageV === 0 &&
    effectiveSecondaryVoltageV === 0;

  const isTryOutComplete = !hasSkippedTryoutFault && input.tryOutAttempted;

  const stepCompletion: Record<LotoStepId, boolean> = {
    notify: input.notifiedPersonnel,
    shutdown: isShutdownComplete,
    isolate:
      input.mccDisconnectOpen &&
      input.motorIsolatorOpen &&
      (!scenario.hasDualFeed || input.secondaryDisconnectOpen) &&
      (!scenario.hasPressureSystem || input.processValveClosed),
    'lock-tag': isLockAndTagCompliant,
    'stored-energy': isStoredEnergyReleased,
    verify: isLdlComplete && isTryOutComplete && isElectricallyIsolated && isStoredEnergyReleased,
  };

  const completedStepCount = Object.values(stepCompletion).filter(Boolean).length;

  const isZeroEnergyVerified =
    stepCompletion.notify &&
    stepCompletion.shutdown &&
    stepCompletion.isolate &&
    stepCompletion['lock-tag'] &&
    stepCompletion['stored-energy'] &&
    stepCompletion.verify;

  const alarms: LotoAlarm[] = [];

  if (effectiveMccVoltageV > 0 || effectiveSecondaryVoltageV > 0 || effectiveMotorTerminalVoltageV > 0) {
    const maxV = Math.max(
      effectiveMccVoltageV,
      effectiveSecondaryVoltageV,
      effectiveMotorTerminalVoltageV
    );
    alarms.push({
      id: 'live-voltage',
      severity: 'danger',
      title: {
        en: `LIVE ELECTRICAL HAZARD (${maxV} V AC)`,
        id: `BAHAYA LISTRIK BERTEGANGAN (${maxV} V AC)`,
        ja: `活線感電危険（${maxV} V AC）`,
      },
      detail: hasBackfeedFault
        ? {
            en: 'Secondary 120 V control backfeed is energizing the motor/control circuit despite primary MCC lockout!',
            id: 'Umpan balik kontrol sekunder 120 V masih memberi tegangan ke sirkuit meski MCC utama sudah dikunci!',
            ja: '主 MCC を施錠しても、120 V 補助制御電源からの逆潮流により回路が活線状態です！',
          }
        : {
            en: 'Main MCC/VFD Disconnect or Local Motor Isolator is still ON. Open and lock all electrical disconnects.',
            id: 'Pemutus Utama Panel MCC/VFD atau Isolator Lokal Motor masih ON. Buka dan kunci seluruh pemutus listrik.',
            ja: '主 MCC/VFD 断路器またはモータ現場断路器が ON のままです。すべて開放・施錠してください。',
          },
    });
  }

  if (effectiveCapacitorV > 0) {
    alarms.push({
      id: 'dc-capacitor',
      severity: 'danger',
      title: {
        en: `VFD DC BUS CAPACITOR CHARGED (${effectiveCapacitorV} V DC)`,
        id: `KAPASITOR BUS DC VFD BERMUATAN (${effectiveCapacitorV} V DC)`,
        ja: `VFD DC バスコンデンサ残留電荷（${effectiveCapacitorV} V DC）`,
      },
      detail: {
        en: 'Open Main MCC Disconnect and discharge the VFD DC bus capacitor (540 V DC → 0 V) before opening enclosure.',
        id: 'Buka Pemutus Utama MCC dan kosongkan kapasitor bus DC VFD (540 V DC → 0 V) sebelum membuka panel.',
        ja: '主 MCC を開放し、VFD DCバスコンデンサを放電（540 V DC → 0 V）してください。',
      },
    });
  }

  if (effectivePressureBar > 0) {
    alarms.push({
      id: 'trapped-pressure',
      severity: 'danger',
      title: {
        en: `TRAPPED FLUID PRESSURE (${effectivePressureBar.toFixed(1)} bar)`,
        id: `TEKANAN FLUIDA TERJEBAK (${effectivePressureBar.toFixed(1)} bar)`,
        ja: `残留流体圧力危険（${effectivePressureBar.toFixed(1)} bar）`,
      },
      detail: hasTrappedPressureFault
        ? {
            en: 'Trapped Pressure Fault: Process valve is shut, but the bleed/drain valve is plugged—pressure remains!',
            id: 'Gangguan Tekanan Terjebak: Katup proses tertutup, namun katup kuras tersumbat—tekanan masih terjebak!',
            ja: '残留圧力異常：遮断弁を閉じてもブリード弁が詰まっており、高圧が残留しています！',
          }
        : {
            en: 'Close the process isolation valve and open the bleed/drain valve to depressurize to 0.0 bar.',
            id: 'Tutup katup isolasi proses dan buka katup kuras/buang untuk menurunkan tekanan ke 0.0 bar.',
            ja: 'プロセス遮断弁を閉じ、ブリード弁を開いて圧力を 0.0 bar まで抜いてください。',
          },
    });
  }

  if (!gravitySecured) {
    alarms.push({
      id: 'gravity-hazard',
      severity: 'danger',
      title: {
        en: 'UNBLOCKED GRAVITY RAM HAZARD',
        id: 'BAHAYA RAM GRAVITASI BELUM DIGANJAL',
        ja: '重力ラム落下防止ブロック未設置',
      },
      detail: {
        en: 'Insert the mechanical safety block under the upper platen ram before entering the press zone.',
        id: 'Pasang blok pengaman mekanis di bawah ram atas sebelum memasuki zona mesin pres.',
        ja: '作業前に落下防止安全ブロックをラム下に挿入してください。',
      },
    });
  }

  if (
    hasTagOnlyFault ||
    (input.mccDisconnectOpen && input.mccTagged && !input.mccLocked) ||
    (input.motorIsolatorOpen && input.motorIsolatorTagged && !input.motorIsolatorLocked) ||
    (input.selectorMode === 'off' && input.localSelectorTagged && !input.localSelectorLocked)
  ) {
    alarms.push({
      id: 'tag-only-violation',
      severity: 'caution',
      title: {
        en: 'OSHA 1910.147 VIOLATION: TAG-ONLY WITHOUT PADLOCK',
        id: 'PELANGGARAN OSHA 1910.147: HANYA LABEL TANPA GEMBOK LOTO',
        ja: 'OSHA 1910.147 違反：タグのみ（施錠なし）',
      },
      detail: {
        en: 'A Danger Tag alone provides no physical restraint. Apply your personal LOTO Padlock on every lockable isolator.',
        id: 'Label Bahaya saja tidak menahan sakelar secara fisik. Pasang Gembok LOTO pribadi pada setiap titik isolasi.',
        ja: '危険タグだけでは物理的拘束力がありません。すべての施錠可能装置に個人用南京錠を掛けてください。',
      },
    });
  }

  if (hasSkippedTryoutFault) {
    alarms.push({
      id: 'skipped-tryout',
      severity: 'caution',
      title: {
        en: 'VERIFICATION BYPASSED: LIVE-DEAD-LIVE & TRY-OUT REQUIRED',
        id: 'VERIFIKASI DILEWATI: WAJIB LIVE-DEAD-LIVE & UJI COBA START',
        ja: '検証省略：Live-Dead-Live 検電と Try-Out が未実施',
      },
      detail: {
        en: 'Never assume zero energy from handle position alone. Probe the Motor Terminal Box and perform Try-Out.',
        id: 'Jangan mengasumsikan energi nol dari posisi tuas saja. Uji kotak terminal motor dan lakukan Uji Coba Start.',
        ja: 'ハンドル位置だけで無電圧と判断せず、端子箱検電と起動試行（Try-Out）を必ず実施してください。',
      },
    });
  }

  let safetyStatus: LotoEvaluation['safetyStatus'] = 'energized';
  if (isZeroEnergyVerified) {
    safetyStatus = 'zero-energy-safe';
  } else if (
    hasBackfeedFault ||
    hasTrappedPressureFault ||
    hasTagOnlyFault ||
    hasSkippedTryoutFault
  ) {
    safetyStatus = 'fault-hazard';
  } else if (isElectricallyIsolated && isStoredEnergyReleased) {
    safetyStatus = 'isolated-unverified';
  }

  return {
    scenario,
    effectiveMccVoltageV,
    effectiveSecondaryVoltageV,
    effectiveMotorTerminalVoltageV,
    effectivePressureBar,
    effectiveCapacitorV,
    motorRunning,
    isShutdownComplete,
    gravitySecured,
    isElectricallyIsolated,
    isLockAndTagCompliant,
    isStoredEnergyReleased,
    isLdlComplete,
    isTryOutComplete,
    isZeroEnergyVerified,
    completedStepCount,
    stepCompletion,
    safetyStatus,
    alarms,
  };
}
