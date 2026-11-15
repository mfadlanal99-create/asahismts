import type { SimulatorMeta } from '../../types/simulator';

export const multimeterMeta: SimulatorMeta = {
  id: 'multimeter',
  title: 'Digital Multimeter & Electrical Diagnostics Lab',
  shortTitle: 'Digital Multimeter',
  description:
    'Interactive True-RMS industrial digital multimeter lab. Practice rotary dial selection (V AC, V DC, mV DC, Ω, Continuity, A AC), dual probe placement across 3-phase 380V motor terminals, 24V DC PLC rails, stator windings, fuses, and silicon diodes, plus live fault-finding.',
  category: 'Diagnostic Instruments',
  difficulty: 'Beginner',
  iconName: 'Zap',
  accentColor: 'amber',
  explore: [
    {
      title: 'True-RMS AC Voltage & 3-Phase Line-to-Line vs Line-to-Ground',
      summary:
        'In a balanced 3-phase 380 V AC industrial system, each phase conductor (L1, L2, L3) sits 120° apart. Measuring between any two phases yields the Line-to-Line voltage (V_L = √3 × V_phase ≈ 380 V), while measuring from any phase to Protective Earth (PE) or Neutral yields the Phase-to-Ground voltage (~220 V). True-RMS meters accurately compute effective heating voltage even on VFD-distorted waveforms.',
      equations: [
        {
          label: '3-Phase Line-to-Line Voltage',
          formula: 'V_LL = √3 · V_LN  (≈ 1.732 × 220 V = 381 V)',
          note: 'Standard 380–400 V IEC industrial motor supply.',
        },
        {
          label: 'True-RMS Effective Value',
          formula: 'V_RMS = √[ (1/T) ∫₀ᵀ v(t)² dt ]',
          note: 'Accurate for both pure sine waves and non-linear VFD/rectifier loads.',
        },
      ],
      workedExample: {
        title: 'Diagnosing an Open Phase on a 380 V Motor Feeder',
        given: [
          '3-Phase 380 V AC supply feeding a 4 kW induction motor',
          'Meter reads: L1–L3 = 380.4 V, L1–L2 = 1.8 V, L2–L3 = 1.6 V',
        ],
        steps: [
          'Check L1–PE and L3–PE: both read ~220 V AC, confirming L1 and L3 are live.',
          'Check L2–PE: reads 0.4 V AC, confirming no supply potential on L2.',
          'Conclude L2 has an upstream open fuse, tripped contactor pole, or broken conductor.',
        ],
        answer: 'Open Phase fault on L2; isolate power and inspect L2 fuse/contactor pole.',
      },
    },
    {
      title: 'Safe Resistance (Ω), Continuity Buzzer & Diode Junction Testing',
      summary:
        'Resistance and continuity modes inject a small internal test current from the meter battery to measure voltage drop. Therefore, circuits MUST be de-energized and isolated before selecting Ω or Continuity—connecting Ω mode to live 380 V creates an arc hazard and blows the meter fuse. In Continuity mode, a buzzer sounds below ~50 Ω, and forward-biased silicon diodes drop ~0.55–0.70 V.',
      equations: [
        {
          label: 'Ohm’s Law for Meter Test Current',
          formula: 'R = V_test / I_test',
          note: 'Only valid when external circuit voltage = 0 V (de-energized).',
        },
        {
          label: 'Continuity Buzzer Threshold',
          formula: 'R < 50 Ω  ⇒  Audible Beep',
          note: 'Used to verify intact fuses, closed contacts, and motor winding continuity.',
        },
      ],
      workedExample: {
        title: 'Detecting a Blown 24 V DC Control Fuse While Energized vs Isolated',
        given: [
          'PLC 24 V DC rail reads 0.00 V DC at +24V terminal',
          'Upstream terminal F1 IN reads +24.15 V DC to 0V',
        ],
        steps: [
          'Keep dial on V DC and place Red probe on F1 IN and Black probe on F1 OUT.',
          'A good fuse drops ~0.00 V DC; a blown fuse drops the full supply (+24.15 V DC).',
          'To confirm with Ω/Continuity, isolate 24 V power first, then measure across the removed fuse: OL confirms open element.',
        ],
        answer: 'Blown F1 fuse confirmed by +24.15 V drop across F1 IN–OUT.',
      },
    },
  ],
  practice: [
    {
      id: 'mm-p1',
      prompt:
        'A 3-phase industrial panel has a measured phase-to-neutral (L1–PE) voltage of 220 V AC. Calculate the expected Line-to-Line voltage (L1–L2) in Volts.',
      hint: 'Multiply the phase voltage by √3 (1.732).',
      targetValue: 381,
      unit: 'V AC',
      tolerance: 3,
      solutionSteps: [
        'Use the 3-phase relationship: V_LL = √3 × V_LN.',
        'V_LL = 1.732 × 220 V = 381.0 V AC (nominal 380 V system).',
      ],
    },
    {
      id: 'mm-p2',
      prompt:
        'During an isolated winding test, the stator coil U1–U2 measures 4.2 Ω. If the meter injects a 1.0 mA (0.001 A) test current, what voltage drop in millivolts (mV) does it sense across U1–U2?',
      hint: 'Use V = I × R, then convert Volts to millivolts (× 1000).',
      targetValue: 4.2,
      unit: 'mV',
      tolerance: 0.2,
      solutionSteps: [
        'Apply Ohm’s Law: V = I × R = 0.001 A × 4.2 Ω = 0.0042 V.',
        'Convert to millivolts: 0.0042 V × 1000 = 4.2 mV.',
      ],
    },
  ],
  quiz: [
    {
      id: 'mm-q1',
      question:
        'You measure L1–L3 = 380 V, L1–L2 = 1.8 V, and L2–L3 = 1.6 V on a 3-phase motor terminal block. What is the most likely fault?',
      options: [
        'Open phase on L2 upstream',
        'Ground fault on U1–PE',
        'Blown 24 V DC control fuse',
        'Normal balanced 3-phase supply',
      ],
      correctIndex: 0,
      explanation:
        'L1–L3 is normal at 380 V while both pairs involving L2 collapse near 0 V, which is the classic signature of an open L2 phase.',
    },
    {
      id: 'mm-q2',
      question:
        'What happens if you accidentally place multimeter probes across a live 380 V AC terminal while the rotary dial is set to Continuity / Ω?',
      options: [
        'The meter accurately displays 380 Ω',
        'It creates a live hazard / fault that can blow the meter fuse or damage the instrument',
        'The continuity buzzer plays a 50 Hz tone safely',
        'It automatically switches to V DC mode',
      ],
      correctIndex: 1,
      explanation:
        'Resistance and continuity modes must only be used on de-energized circuits. Applying 380 V AC across the Ω circuit risks meter damage and arc-flash hazard.',
    },
    {
      id: 'mm-q3',
      question:
        'On an energized 24 V DC PLC circuit, you place the Red probe on F1 IN (+24 V) and Black probe on F1 OUT. The meter reads +24.15 V DC. What does this indicate?',
      options: [
        'Fuse F1 is healthy and conducting',
        'Fuse F1 is blown (open circuit)',
        'The PLC 0V reference is disconnected',
        'The multimeter battery is low',
      ],
      correctIndex: 1,
      explanation:
        'A healthy fuse has ~0 V drop across it. Reading full supply voltage (+24.15 V) across a fuse proves it is open and blocking current.',
    },
    {
      id: 'mm-q4',
      question:
        'When testing an isolated motor stator winding U1 to Protective Earth (PE) in Ω mode, what reading indicates healthy insulation?',
      options: [
        '0.12 Ω',
        '1.8 Ω',
        'OL (Open Loop / Infinite resistance)',
        '4.2 Ω',
      ],
      correctIndex: 2,
      explanation:
        'Motor windings must be electrically isolated from the grounded frame (PE). A low-ohm reading like 1.8 Ω indicates a ground fault.',
    },
  ],
};
