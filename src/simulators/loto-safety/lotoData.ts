export type LotoScenarioId =
  | 'centrifugal-pump-mcc'
  | 'hydraulic-press-accumulator'
  | 'pneumatic-press-gravity'
  | 'dual-feed-conveyor';

export type HazardFaultId =
  | 'none'
  | 'trapped-accumulator'
  | 'dual-backfeed'
  | 'tag-only-no-lock'
  | 'skipped-tryout';

export type LotoStepId =
  | 'notify'
  | 'shutdown'
  | 'isolate'
  | 'lock-tag'
  | 'stored-energy'
  | 'verify';

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
  equipmentStopped: boolean;
  primaryBreakerOpen: boolean;
  secondaryBreakerOpen: boolean;
  primaryLocked: boolean;
  primaryTagged: boolean;
  secondaryLocked: boolean;
  secondaryTagged: boolean;
  processValveClosed: boolean;
  bleedValveOpen: boolean;
  gravityBlockInstalled: boolean;
  capacitorDischarged: boolean;
  ldlStage: LiveDeadLiveStage;
  tryOutAttempted: boolean;
}

export interface LotoEvaluation {
  scenario: LotoScenarioSpec;
  effectiveVoltageV: number;
  effectiveSecondaryVoltageV: number;
  effectivePressureBar: number;
  effectiveCapacitorV: number;
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
  alarms: {
    id: string;
    severity: 'danger' | 'caution';
    title: TrilingualText;
    detail: TrilingualText;
  }[];
}

export const LOTO_SCENARIOS: LotoScenarioSpec[] = [
  {
    id: 'centrifugal-pump-mcc',
    name: {
      en: 'Centrifugal Pump MCC',
      id: 'Pompa Sentrifugal MCC',
      ja: '遠心ポンプ MCC',
    },
    subtitle: {
      en: '480 V 3-Phase MCC + Suction/Discharge Valves + Casing Drain',
      id: 'MCC 3-Fasa 480 V + Katup Isap/Buang + Katup Kuras Casing',
      ja: '三相 480 V MCC + 吸込/吐出弁 + ケーシングドレン弁',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 0,
    nominalPressureBar: 8.5,
    hasPressureSystem: true,
    hasGravityBlock: false,
    hasCapacitor: false,
    hasDualFeed: false,
    energySources: [
      {
        en: '480 V 3-Phase Electrical (MCC Bucket)',
        id: 'Listrik 3-Fasa 480 V (Panel MCC)',
        ja: '三相 480 V 電気エネルギー（MCC 盤）',
      },
      {
        en: '8.5 bar Hydraulic Process Fluid Pressure',
        id: 'Tekanan Fluida Proses Hidrolik 8.5 bar',
        ja: 'プロセス流体圧力 8.5 bar',
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
      en: '480 V Pump MCC + 210 bar Accumulator Bleed + Gravity Ram Block',
      id: 'MCC Pompa 480 V + Penguras Akumulator 210 bar + Penahan Gravitasi Ram',
      ja: '480 V ポンプ MCC + 210 bar 蓄圧器ブリード + 重力ラムブロック',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 0,
    nominalPressureBar: 210,
    hasPressureSystem: true,
    hasGravityBlock: true,
    hasCapacitor: false,
    hasDualFeed: false,
    energySources: [
      {
        en: '480 V 3-Phase Hydraulic Power Unit',
        id: 'Unit Daya Hidrolik 3-Fasa 480 V',
        ja: '三相 480 V 油圧ユニット電源',
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
    id: 'pneumatic-press-gravity',
    name: {
      en: 'Pneumatic Press w/ Gravity Ram',
      id: 'Mesin Pres Pneumatik + Ram Gravitasi',
      ja: '重力ラム付空圧プレス',
    },
    subtitle: {
      en: '240 V Control Panel + 6.5 bar Air Dump Valve + Safety Pin',
      id: 'Panel Kontrol 240 V + Katup Buang Udara 6.5 bar + Pin Pengaman',
      ja: '240 V 制御盤 + 6.5 bar エア排気弁 + 安全ロックピン',
    },
    nominalVoltageV: 240,
    secondaryVoltageV: 0,
    nominalPressureBar: 6.5,
    hasPressureSystem: true,
    hasGravityBlock: true,
    hasCapacitor: false,
    hasDualFeed: false,
    energySources: [
      {
        en: '240 V Control & Solenoid Supply',
        id: 'Suplai Kontrol & Solenoid 240 V',
        ja: '240 V 制御・ソレノイド電源',
      },
      {
        en: '6.5 bar Compressed Air Receiver & Cylinder',
        id: 'Udara Bertekanan 6.5 bar pada Silinder',
        ja: '6.5 bar 圧縮空気エネルギー',
      },
      {
        en: 'Suspended Ram Gravity Hazard',
        id: 'Bahaya Gravitasi Ram Menggantung',
        ja: '吊り下げラム落下位置エネルギー',
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
      en: '480 V Main MCC + 120 V Backfeed Control + 650 V DC Bus Capacitor',
      id: 'MCC Utama 480 V + Umpan Balik Kontrol 120 V + Kapasitor Bus DC 650 V',
      ja: '480 V 主 MCC + 120 V 制御逆潮流 + 650 V DC バスコンデンサ',
    },
    nominalVoltageV: 480,
    secondaryVoltageV: 120,
    nominalPressureBar: 0,
    hasPressureSystem: false,
    hasGravityBlock: false,
    hasCapacitor: true,
    hasDualFeed: true,
    energySources: [
      {
        en: '480 V Primary Motor Drive MCC',
        id: 'MCC Penggerak Motor Utama 480 V',
        ja: '480 V 主駆動モータ MCC',
      },
      {
        en: '120 V Secondary Interlock / Control Backfeed',
        id: 'Umpan Balik Kontrol / Interlock Sekunder 120 V',
        ja: '120 V 補助制御・逆潮流電源',
      },
      {
        en: '650 V DC VFD Bus Capacitor Stored Charge',
        id: 'Muatan Tersimpan Kapasitor Bus DC VFD 650 V',
        ja: '650 V VFD DC バスコンデンサ残留電荷',
      },
    ],
  },
];

export const HAZARD_FAULTS: HazardFaultSpec[] = [
  {
    id: 'none',
    name: {
      en: 'Standard Audit (No Injected Fault)',
      id: 'Audit Standar (Tanpa Gangguan)',
      ja: '標準監査（故障注入なし）',
    },
    description: {
      en: 'Follow all 6 OSHA 1910.147 LOTO steps to achieve verified Zero Energy.',
      id: 'Ikuti seluruh 6 langkah LOTO OSHA 1910.147 untuk mencapai Kondisi Energi Nol terverifikasi.',
      ja: 'OSHA 1910.147 の6ステップに従い、ゼロエネルギー状態を検証します。',
    },
  },
  {
    id: 'trapped-accumulator',
    name: {
      en: 'Trapped Accumulator / Line Pressure',
      id: 'Tekanan Terjebak pada Akumulator / Pipa',
      ja: 'アキュムレータ・配管内の残留圧力',
    },
    description: {
      en: 'Isolation valve closed, but bleed/dump valve is plugged or left shut—pressure remains trapped!',
      id: 'Katup isolasi ditutup, namun katup buang/kuras tersumbat atau tertutup—tekanan masih terjebak!',
      ja: '遮断弁を閉じてもブリード弁が開かず、システム内に高圧が閉じ込められています。',
    },
  },
  {
    id: 'dual-backfeed',
    name: {
      en: 'Dual Backfeed Source Active',
      id: 'Sumber Umpan Balik Ganda Aktif',
      ja: '二系統逆潮流（バックフィード）発生',
    },
    description: {
      en: 'Main MCC is locked out, but a secondary control/interlock feed backfeeds 120 V into the panel.',
      id: 'MCC utama terkunci, tetapi sumber kontrol/interlock sekunder masih menyuplai 120 V ke panel.',
      ja: '主 MCC を施錠しても、別系統の制御電源から 120 V が逆流しています。',
    },
  },
  {
    id: 'tag-only-no-lock',
    name: {
      en: 'Tag-Only Without Padlock (Violation)',
      id: 'Hanya Tag Tanpa Gembok (Pelanggaran)',
      ja: 'タグのみ・施錠なし（規格違反）',
    },
    description: {
      en: 'A Danger Tag is hung without a personal padlock—OSHA 1910.147 prohibits tag-only on lockable disconnects.',
      id: 'Label bahaya dipasang tanpa gembok pengaman—OSHA 1910.147 melarang tag-only pada pemutus yang dapat dikunci.',
      ja: '施錠可能な遮断器に個人用南京錠を付けずタグのみを掛けており、誤投入を防止できません。',
    },
  },
  {
    id: 'skipped-tryout',
    name: {
      en: 'Skipped Try-Out & Live-Dead-Live',
      id: 'Melewatkan Try-Out & Live-Dead-Live',
      ja: '動作確認・Live-Dead-Live 試験の省略',
    },
    description: {
      en: 'Isolators are locked, but worker attempts maintenance without Live-Dead-Live meter test or Start Try-Out.',
      id: 'Isolator telah dikunci, tetapi teknisi bekerja tanpa uji meter Live-Dead-Live maupun uji coba Start (Try-Out).',
      ja: '施錠は完了していますが、検電器テストと起動試行（Try-Out）を省略しています。',
    },
  },
];

export const LOTO_WORKFLOW_STEPS: LotoWorkflowStepSpec[] = [
  {
    id: 'notify',
    stepNumber: 1,
    title: {
      en: 'Notify & Identify',
      id: 'Pemberitahuan & Identifikasi',
      ja: '通知・エネルギー特定',
    },
    detail: {
      en: 'Notify affected operators and identify all hazardous energy sources.',
      id: 'Informasikan operator terkait dan identifikasi seluruh sumber energi berbahaya.',
      ja: '関係作業者に通知し、すべての危険エネルギー源を特定します。',
    },
  },
  {
    id: 'shutdown',
    stepNumber: 2,
    title: {
      en: 'Normal Shutdown',
      id: 'Penghentian Normal',
      ja: '通常停止操作',
    },
    detail: {
      en: 'Stop equipment using normal operating controls (Stop PB / unload).',
      id: 'Hentikan mesin melalui tombol kontrol normal (Stop PB / unload).',
      ja: '通常の停止ボタン・操作手順で設備を安全に停止します。',
    },
  },
  {
    id: 'isolate',
    stepNumber: 3,
    title: {
      en: 'Isolate Energy',
      id: 'Isolasi Energi',
      ja: 'エネルギー遮断',
    },
    detail: {
      en: 'Open electrical disconnects and close process/air isolation valves.',
      id: 'Buka pemutus sirkuit listrik dan tutup katup isolasi fluida/udara.',
      ja: '遮断器を開放し、プロセス・空気遮断弁を閉止します。',
    },
  },
  {
    id: 'lock-tag',
    stepNumber: 4,
    title: {
      en: 'Lockout & Tagout',
      id: 'Pasang Gembok & Label',
      ja: '施錠・タグ取付',
    },
    detail: {
      en: 'Apply personal padlock and signed Danger Tag to each isolating device.',
      id: 'Pasang gembok pengaman pribadi dan label bahaya pada setiap titik isolasi.',
      ja: '各遮断装置に個人用南京錠と署名入り危険タグを取り付けます。',
    },
  },
  {
    id: 'stored-energy',
    stepNumber: 5,
    title: {
      en: 'Release Stored Energy',
      id: 'Lepas Energi Tersimpan',
      ja: '残留エネルギー放出',
    },
    detail: {
      en: 'Bleed pressure to 0 bar, discharge DC capacitors, and insert gravity blocks.',
      id: 'Kuras tekanan hingga 0 bar, kosongkan kapasitor DC, dan pasang blok penahan gravitasi.',
      ja: '残圧を 0 bar に抜き、コンデンサを放電し、落下防止ブロックを挿入します。',
    },
  },
  {
    id: 'verify',
    stepNumber: 6,
    title: {
      en: 'Verify Zero Energy',
      id: 'Verifikasi Energi Nol',
      ja: 'ゼロエネルギー検証',
    },
    detail: {
      en: 'Perform Live-Dead-Live multimeter test, confirm 0 bar gauge, and Try-Out Start PB.',
      id: 'Lakukan uji multimeter Live-Dead-Live, pastikan manometer 0 bar, dan uji coba tombol Start (Try-Out).',
      ja: 'Live-Dead-Live 検電試験、圧力計 0 bar 確認、起動試行（Try-Out）を実施します。',
    },
  },
];

export function evaluateLotoState(input: LotoStateInput): LotoEvaluation {
  const scenario =
    LOTO_SCENARIOS.find((s) => s.id === input.scenarioId) ?? LOTO_SCENARIOS[0];

  // Fault overrides / physical reality
  const hasBackfeedFault = input.faultId === 'dual-backfeed';
  const hasTrappedPressureFault = input.faultId === 'trapped-accumulator';
  const hasTagOnlyFault = input.faultId === 'tag-only-no-lock';
  const hasSkippedTryoutFault = input.faultId === 'skipped-tryout';

  const effectiveVoltageV = input.primaryBreakerOpen ? 0 : scenario.nominalVoltageV;

  const effectiveSecondaryVoltageV = hasBackfeedFault
    ? scenario.hasDualFeed
      ? scenario.secondaryVoltageV
      : 120
    : scenario.hasDualFeed
      ? input.secondaryBreakerOpen
        ? 0
        : scenario.secondaryVoltageV
      : 0;

  const effectivePressureBar = !scenario.hasPressureSystem
    ? 0
    : hasTrappedPressureFault
      ? scenario.nominalPressureBar
      : input.processValveClosed && input.bleedValveOpen
        ? 0
        : scenario.nominalPressureBar;

  const effectiveCapacitorV = !scenario.hasCapacitor
    ? 0
    : input.primaryBreakerOpen && input.capacitorDischarged
      ? 0
      : 650;

  const gravitySecured = !scenario.hasGravityBlock || input.gravityBlockInstalled;

  const isElectricallyIsolated =
    effectiveVoltageV === 0 &&
    effectiveSecondaryVoltageV === 0 &&
    effectiveCapacitorV === 0;

  const primaryLockOk =
    input.primaryBreakerOpen &&
    input.primaryTagged &&
    input.primaryLocked &&
    !hasTagOnlyFault;

  const secondaryLockOk =
    !scenario.hasDualFeed ||
    (input.secondaryBreakerOpen &&
      input.secondaryTagged &&
      input.secondaryLocked &&
      !hasTagOnlyFault);

  const isLockAndTagCompliant = primaryLockOk && secondaryLockOk;

  const isStoredEnergyReleased =
    effectivePressureBar === 0 && effectiveCapacitorV === 0 && gravitySecured;

  const isLdlComplete =
    !hasSkippedTryoutFault &&
    input.ldlStage === 'verified' &&
    effectiveVoltageV === 0 &&
    effectiveSecondaryVoltageV === 0;

  const isTryOutComplete = !hasSkippedTryoutFault && input.tryOutAttempted;

  const stepCompletion: Record<LotoStepId, boolean> = {
    notify: input.notifiedPersonnel,
    shutdown: input.equipmentStopped,
    isolate:
      input.primaryBreakerOpen &&
      (!scenario.hasDualFeed || input.secondaryBreakerOpen) &&
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

  const alarms: LotoEvaluation['alarms'] = [];

  if (effectiveVoltageV > 0 || effectiveSecondaryVoltageV > 0) {
    alarms.push({
      id: 'live-voltage',
      severity: 'danger',
      title: {
        en: `LIVE ELECTRICAL HAZARD (${Math.max(effectiveVoltageV, effectiveSecondaryVoltageV)} V AC)`,
        id: `BAHAYA LISTRIK BERTEGANGAN (${Math.max(effectiveVoltageV, effectiveSecondaryVoltageV)} V AC)`,
        ja: `活線感電危険（${Math.max(effectiveVoltageV, effectiveSecondaryVoltageV)} V AC）`,
      },
      detail: hasBackfeedFault
        ? {
            en: 'Secondary backfeed source is energizing the control circuit despite primary MCC lockout!',
            id: 'Sumber umpan balik sekunder masih memberi tegangan pada sirkuit kontrol meskipun MCC utama sudah dikunci!',
            ja: '主 MCC を遮断しても、補助電源からの逆潮流により制御回路が活線状態です！',
          }
        : {
            en: 'Main or secondary electrical disconnect is still closed. Open all breakers before servicing.',
            id: 'Pemutus sirkuit utama atau sekunder masih tertutup. Buka seluruh pemutus sebelum bekerja.',
            ja: '主遮断器または補助遮断器が閉じたままです。作業前に必ず開放してください。',
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
            en: 'Trapped Accumulator Fault: Isolation valve is shut, but bleed/dump valve failed to depressurize the line!',
            id: 'Gangguan Akumulator Terjebak: Katup isolasi tertutup, namun katup buang gagal menurunkan tekanan jalur!',
            ja: 'アキュムレータ残圧異常：遮断弁を閉じてもブリード弁が開かず、高圧が残留しています！',
          }
        : {
            en: 'Close process isolation valve and open the bleed/dump valve to relieve pressure to 0 bar.',
            id: 'Tutup katup isolasi proses dan buka katup buang/kuras untuk menurunkan tekanan ke 0 bar.',
            ja: 'プロセス遮断弁を閉じ、ブリード弁を開いて圧力を 0 bar まで抜いてください。',
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
        en: 'Wait for DC bus discharge (5τ) and verify 0 V DC before opening VFD enclosure.',
        id: 'Tunggu pengosongan muatan bus DC (5τ) dan verifikasi 0 V DC sebelum membuka panel VFD.',
        ja: 'DC バスの放電完了（5τ）を待ち、0 V DC を確認してから盤を開けてください。',
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
        en: 'Install mechanical safety block / locking pin under the suspended ram before entering press zone.',
        id: 'Pasang blok pengaman mekanis / pin pengunci di bawah ram yang menggantung sebelum masuk area pres.',
        ja: '作業前に落下防止安全ブロック／ロックピンをラム下に必ず挿入してください。',
      },
    });
  }

  if (hasTagOnlyFault || (input.primaryBreakerOpen && input.primaryTagged && !input.primaryLocked)) {
    alarms.push({
      id: 'tag-only-violation',
      severity: 'caution',
      title: {
        en: 'OSHA 1910.147 VIOLATION: TAG-ONLY WITHOUT PADLOCK',
        id: 'PELANGGARAN OSHA 1910.147: HANYA LABEL TANPA GEMBOK',
        ja: 'OSHA 1910.147 違反：タグのみ（施錠なし）',
      },
      detail: {
        en: 'Tags are warning devices only and do not provide physical restraint. Apply a personal padlock.',
        id: 'Label hanya bersifat peringatan dan tidak memberikan penguncian fisik. Pasang gembok pribadi.',
        ja: 'タグは警告表示に過ぎず物理的拘束力がありません。必ず個人用南京錠で施錠してください。',
      },
    });
  }

  if (hasSkippedTryoutFault) {
    alarms.push({
      id: 'skipped-tryout',
      severity: 'caution',
      title: {
        en: 'VERIFICATION BYPASSED: LIVE-DEAD-LIVE & TRY-OUT REQUIRED',
        id: 'VERIFIKASI DILEWATI: WAJIB LIVE-DEAD-LIVE & TRY-OUT',
        ja: '検証省略：Live-Dead-Live 検電と Try-Out が未実施',
      },
      detail: {
        en: 'Never assume zero energy from switch position alone. Complete Live-Dead-Live and Try-Out.',
        id: 'Jangan pernah mengasumsikan energi nol hanya dari posisi sakelar. Lakukan Live-Dead-Live dan Try-Out.',
        ja: 'スイッチ位置だけで無電圧と判断しないでください。Live-Dead-Live 試験と起動試行が必須です。',
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
    effectiveVoltageV,
    effectiveSecondaryVoltageV,
    effectivePressureBar,
    effectiveCapacitorV,
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
