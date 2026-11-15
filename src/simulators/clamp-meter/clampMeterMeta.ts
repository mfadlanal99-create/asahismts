import type { SimulatorMeta } from '../../types/simulator';

export const clampMeterMeta: SimulatorMeta = {
  id: 'clamp-meter',
  title: 'Clamp Meter & 3-Phase Power Analyzer Lab',
  shortTitle: 'Clamp Meter & Power',
  description:
    'Non-intrusive Hall-effect & Rogowski clamp meter lab for 3-phase 400V induction motor feeders. Measure L1/L2/L3/PE currents, capture motor Inrush peak current, analyze kW / kVA / Power Factor, and diagnose Single-Phasing, Locked Rotor, and NEMA MG-1 Phase Current Unbalance.',
  category: 'Diagnostic Instruments',
  difficulty: 'Intermediate',
  iconName: 'Radio',
  accentColor: 'sky',
  explore: [
    {
      title: '3-Phase AC Power (kW, kVA, Power Factor) & Inrush Current',
      summary:
        'A clamp meter measures magnetic flux around a single conductor without breaking the circuit. Combining average line current with line-to-line voltage and phase angle yields Apparent Power (kVA), Active Power (kW), and Power Factor (PF = kW / kVA). During direct-on-line motor starting, Inrush capture records the 5–7× FLA locked-rotor surge over the first 100 ms.',
      equations: [
        {
          label: '3-Phase Apparent Power (S)',
          formula: 'S (kVA) = (√3 · V_LL · I_avg) / 1000',
          note: 'V_LL = Line-to-Line voltage (V), I_avg = average phase current (A).',
        },
        {
          label: '3-Phase Active Power (P) & Power Factor',
          formula: 'P (kW) = S · PF = (√3 · V_LL · I_avg · cos φ) / 1000',
          note: 'Healthy loaded induction motors typically run at PF = 0.80–0.89.',
        },
      ],
      workedExample: {
        title: 'Calculating kVA, kW, and PF on a 400 V Motor Feeder',
        given: [
          '3-Phase motor feeder at V_LL = 400 V, average current I_avg = 21.0 A',
          'Power Factor (cos φ) = 0.84',
        ],
        steps: [
          'Compute Apparent Power: S = (1.732 × 400 × 21.0) / 1000 = 14.55 kVA.',
          'Compute Active Power: P = 14.55 kVA × 0.84 = 12.22 kW.',
        ],
        answer: 'S = 14.55 kVA, P = 12.22 kW',
      },
    },
    {
      title: 'NEMA MG-1 Phase Current Unbalance & Single-Phasing',
      summary:
        'Even a small 2–3% supply voltage unbalance creates a 6–10× larger phase current unbalance in an induction motor, causing localized stator overheating. NEMA MG-1 defines current unbalance using the maximum deviation from the 3-phase average. In Single-Phasing, one phase drops to 0 A while the remaining two surge to ~1.73× normal current.',
      equations: [
        {
          label: 'NEMA MG-1 Phase Current Unbalance (%)',
          formula: '% Unbalance = [ max(|I_L1 - I_avg|, |I_L2 - I_avg|, |I_L3 - I_avg|) / I_avg ] × 100%',
          note: 'Keep current unbalance < 5% (derate motor above 5%; trip/investigate above 10%).',
        },
      ],
      workedExample: {
        title: 'Evaluating NEMA MG-1 Current Unbalance',
        given: [
          'Measured phase currents: L1 = 26.2 A, L2 = 17.4 A, L3 = 21.1 A',
        ],
        steps: [
          'Average current: I_avg = (26.2 + 17.4 + 21.1) / 3 = 21.57 A.',
          'Max deviation from average: |26.2 - 21.57| = 4.63 A.',
          'Current Unbalance % = (4.63 / 21.57) × 100% = 21.5%.',
        ],
        answer: '21.5% current unbalance — critical motor heating risk; inspect supply voltage/contacts.',
      },
    },
  ],
  practice: [
    {
      id: 'cm-p1',
      prompt:
        'A 400 V 3-phase motor draws balanced phase currents of 21.0 A at a Power Factor of 0.84. Calculate the Active Power P in kW.',
      hint: 'Use P = (√3 × V_LL × I_avg × PF) / 1000 with √3 ≈ 1.732.',
      targetValue: 12.22,
      unit: 'kW',
      tolerance: 0.25,
      solutionSteps: [
        'Calculate Apparent Power: S = (1.732 × 400 × 21.0) / 1000 = 14.55 kVA.',
        'Multiply by Power Factor: P = 14.55 × 0.84 = 12.22 kW.',
      ],
    },
    {
      id: 'cm-p2',
      prompt:
        'A clamp meter records L1 = 26.2 A, L2 = 17.4 A, and L3 = 21.1 A. Compute the NEMA MG-1 Phase Current Unbalance percentage (%).',
      hint: 'Find I_avg = (26.2 + 17.4 + 21.1)/3, then divide the largest |I - I_avg| by I_avg × 100.',
      targetValue: 21.5,
      unit: '%',
      tolerance: 0.6,
      solutionSteps: [
        'I_avg = (26.2 + 17.4 + 21.1) / 3 = 21.57 A.',
        'Maximum deviation = |26.2 - 21.57| = 4.63 A (or |17.4 - 21.57| = 4.17 A).',
        'Unbalance = (4.63 / 21.57) × 100% = 21.5%.',
      ],
    },
  ],
  quiz: [
    {
      id: 'cm-q1',
      question:
        'Why must a clamp meter jaw enclose only ONE phase conductor (e.g., L1 alone) rather than the entire 3-core motor cable?',
      options: [
        'The 3-core cable is too thick for the jaw',
        'In a balanced 3-phase cable, the vector sum of L1 + L2 + L3 currents cancels to ~0 A',
        'Clamping all 3 cores doubles the voltage reading',
        'Clamp meters only work on DC cables',
      ],
      correctIndex: 1,
      explanation:
        'The magnetic fields of L1, L2, and L3 are 120° apart and sum to zero in a balanced circuit. Clamping all three together measures only net earth leakage (zero-sequence) current.',
    },
    {
      id: 'cm-q2',
      question:
        'During motor startup, you enable Inrush mode and capture 122 A on a motor whose normal running FLA is 21 A. What is this surge?',
      options: [
        'A short circuit to ground',
        'Normal locked-rotor starting inrush (~5.8× running current)',
        'Harmonic distortion from a blown fuse',
        'Single-phasing fault',
      ],
      correctIndex: 1,
      explanation:
        'Direct-on-line AC induction motors draw 5–7× rated current during the first ~100 ms of rotor acceleration; Inrush mode captures this peak.',
    },
    {
      id: 'cm-q3',
      question:
        'You clamp L1 = 36.4 A, L2 = 0.0 A, and L3 = 36.2 A on a running 3-phase motor feeder. What fault is occurring?',
      options: [
        'Locked rotor',
        'Single-phasing (open L2)',
        'High power factor',
        'Normal 75% load operation',
      ],
      correctIndex: 1,
      explanation:
        'Zero current on L2 with ~1.73× current on L1 and L3 is the unmistakable signature of single-phasing.',
    },
  ],
};
