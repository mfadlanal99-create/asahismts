export type ConductorId = 'L1' | 'L2' | 'L3' | 'PE_N';

export type ClampFaultScenario =
  | 'normal-75'
  | 'single-phasing'
  | 'locked-rotor'
  | 'voltage-unbalance';

export interface ClampMeterSnapshot {
  conductor: ConductorId;
  measuredAmps: number;
  inrushAmps: number;
  phaseAmps: {
    L1: number;
    L2: number;
    L3: number;
    PE_N: number;
  };
  lineVoltageV: number;
  powerFactor: number;
  activePowerKw: number;
  apparentPowerKva: number;
  reactivePowerKvar: number;
  averagePhaseAmps: number;
  currentUnbalancePct: number;
  nemaStatus: 'normal' | 'derate' | 'critical';
  diagnosticNote: {
    en: string;
    id: string;
    ja: string;
  };
}

export const CLAMP_FAULT_SCENARIOS: {
  id: ClampFaultScenario;
  en: string;
  idLabel: string;
  ja: string;
}[] = [
  {
    id: 'normal-75',
    en: 'Normal Operation (75% Load)',
    idLabel: 'Operasi Normal (Beban 75%)',
    ja: '正常運転 (負荷 75%)',
  },
  {
    id: 'single-phasing',
    en: 'Fault: Single-Phasing (Open L2)',
    idLabel: 'Gangguan: Single-Phasing (L2 Putus)',
    ja: '故障: 単相運転 (L2 断線)',
  },
  {
    id: 'locked-rotor',
    en: 'Fault: Locked Rotor / Mechanical Jam',
    idLabel: 'Gangguan: Rotor Terkunci / Macet',
    ja: '故障: ローターロック / 過負荷',
  },
  {
    id: 'voltage-unbalance',
    en: 'Fault: 3% Supply Voltage Unbalance',
    idLabel: 'Gangguan: Ketidakseimbangan Tegangan Suplai 3%',
    ja: '故障: 電源電圧不平衡 3%',
  },
];

export function computeClampMeterSnapshot(
  conductor: ConductorId,
  fault: ClampFaultScenario,
  loadPct: number,
  inrushEnabled: boolean
): ClampMeterSnapshot {
  // Base 15 kW, 400 V, 50 Hz 3-phase motor (FLA ≈ 28.0 A at 100% load)
  const scale = loadPct / 75;
  let i1 = 21.0 * scale;
  let i2 = 21.1 * scale;
  let i3 = 20.9 * scale;
  let iPe = 0.06;
  let vLL = 400.0;
  let pf = Math.min(0.89, 0.72 + (loadPct / 100) * 0.16);

  if (fault === 'single-phasing') {
    i1 = 36.4 * scale;
    i2 = 0.0;
    i3 = 36.2 * scale;
    iPe = 0.12;
    vLL = 398.0;
    pf = 0.64;
  } else if (fault === 'locked-rotor') {
    i1 = 154.0;
    i2 = 155.2;
    i3 = 153.6;
    iPe = 0.18;
    vLL = 382.0; // Voltage sag under locked rotor
    pf = 0.34;
  } else if (fault === 'voltage-unbalance') {
    // NEMA MG-1: ~3% V unbalance yields ~18-24% I unbalance
    i1 = 26.2 * scale;
    i2 = 17.4 * scale;
    i3 = 21.1 * scale;
    iPe = 0.42;
    vLL = 396.0;
    pf = 0.81;
  }

  const avg = (i1 + i2 + i3) / 3;
  const maxDev = Math.max(
    Math.abs(i1 - avg),
    Math.abs(i2 - avg),
    Math.abs(i3 - avg)
  );
  const unbalancePct = avg > 0.01 ? (maxDev / avg) * 100 : 0;

  // 3-phase apparent and active power: S = √3 * V_LL * I_avg / 1000
  const kva = (Math.sqrt(3) * vLL * avg) / 1000;
  const kw = kva * pf;
  const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));

  const phaseMap: Record<ConductorId, number> = {
    L1: i1,
    L2: i2,
    L3: i3,
    PE_N: iPe,
  };

  const baseCurrent = phaseMap[conductor];
  const inrushMultiplier =
    conductor === 'PE_N'
      ? 1.5
      : fault === 'single-phasing' && conductor === 'L2'
        ? 0
        : fault === 'locked-rotor'
          ? 1.15
          : 5.8;
  const inrushAmps = Number((baseCurrent * inrushMultiplier).toFixed(1));
  const measuredAmps = inrushEnabled ? inrushAmps : Number(baseCurrent.toFixed(2));

  const nemaStatus: 'normal' | 'derate' | 'critical' =
    unbalancePct > 10 || fault === 'locked-rotor'
      ? 'critical'
      : unbalancePct > 5
        ? 'derate'
        : 'normal';

  let diagnosticNote = {
    en: 'Balanced 3-phase motor load within NEMA MG-1 limits (< 5% unbalance).',
    id: 'Beban motor 3-fasa seimbang dalam batas NEMA MG-1 (ketidakseimbangan < 5%).',
    ja: '三相電動機負荷は平衡しており、NEMA MG-1基準内（不平衡率5%未満）です。',
  };

  if (fault === 'single-phasing') {
    diagnosticNote = {
      en: 'CRITICAL: Single-phasing! L2 carries 0.0 A while L1/L3 draw ~173% current. Trip thermal overload immediately.',
      id: 'KRITIS: Hilang satu fasa (single-phasing)! L2 0,0 A sedangkan L1/L3 menarik ~173% arus normal. Segera trip relai beban lebih termal.',
      ja: '重大: 単相運転！L2が0.0 AでL1/L3が約173%過電流。直ちに停止してください。',
    };
  } else if (fault === 'locked-rotor') {
    diagnosticNote = {
      en: 'CRITICAL: Locked rotor (~5.5× FLA) with low PF (0.34). Shaft is mechanically seized.',
      id: 'KRITIS: Rotor terkunci (~5,5× FLA) dengan faktor daya rendah (0,34). Poros macet secara mekanis.',
      ja: '重大: ローターロック（定格の約5.5倍電流）、力率0.34。軸が機械的に固着しています。',
    };
  } else if (fault === 'voltage-unbalance') {
    diagnosticNote = {
      en: `WARNING: ${unbalancePct.toFixed(1)}% current unbalance driven by supply voltage asymmetry. Motor winding heating rises sharply.`,
      id: `PERINGATAN: Ketidakseimbangan arus ${unbalancePct.toFixed(1)}% akibat tegangan suplai tidak seimbang. Pemanasan belitan meningkat tajam.`,
      ja: `警告: 電源電圧不平衡により電流不平衡率が${unbalancePct.toFixed(1)}%に達しています。巻線過熱に注意。`,
    };
  } else if (conductor === 'PE_N') {
    diagnosticNote = {
      en: 'Clamping PE/Neutral measures earth leakage / zero-sequence current (~0.06 A normal).',
      id: 'Menjepit konduktor PE/Netral mengukur arus bocor tanah / urutan nol (~0,06 A normal).',
      ja: 'PE/中性線をクランプして漏れ電流・零相電流（正常時約0.06 A）を測定しています。',
    };
  }

  return {
    conductor,
    measuredAmps,
    inrushAmps,
    phaseAmps: {
      L1: Number(i1.toFixed(2)),
      L2: Number(i2.toFixed(2)),
      L3: Number(i3.toFixed(2)),
      PE_N: Number(iPe.toFixed(2)),
    },
    lineVoltageV: vLL,
    powerFactor: Number(pf.toFixed(2)),
    activePowerKw: Number(kw.toFixed(2)),
    apparentPowerKva: Number(kva.toFixed(2)),
    reactivePowerKvar: Number(kvar.toFixed(2)),
    averagePhaseAmps: Number(avg.toFixed(2)),
    currentUnbalancePct: Number(unbalancePct.toFixed(1)),
    nemaStatus,
    diagnosticNote,
  };
}
