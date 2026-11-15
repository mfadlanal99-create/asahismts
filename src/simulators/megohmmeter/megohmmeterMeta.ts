import type { SimulatorMeta } from '../../types/simulator';

export const megohmmeterMeta: SimulatorMeta = {
  id: 'megohmmeter',
  title: 'Megohmmeter & Insulation Resistance Tester (IEEE 43)',
  shortTitle: 'Megohmmeter (IR / PI)',
  category: 'Diagnostic Instruments',
  difficulty: 'Intermediate',
  description:
    'Perform high-voltage DC insulation resistance (IR), Dielectric Absorption Ratio (DAR), and Polarization Index (PI) diagnostics on 3-phase motor windings. Apply IEEE Std 43 temperature correction to 40 °C and isolate ground faults across U, V, and W phases.',
  iconName: 'Gauge',
  accentColor: 'rose',
  explore: [
    {
      title: 'DC Insulation Leakage Components & Polarization Index (PI)',
      summary:
        'When a DC test voltage (250 V to 2500 V) is applied between a motor stator winding and grounded frame, total measured current consists of three distinct components: (1) Capacitive charging current I_C, which decays rapidly within seconds; (2) Dielectric absorption current I_A, caused by polar molecules aligning in the electric field over several minutes; and (3) Steady conduction/surface leakage current I_G. In clean, dry insulation, I_A + I_C decay steadily so apparent resistance R(t) = V / I(t) rises over 10 minutes. In humid or contaminated windings, high constant surface leakage masks absorption and produces a flat curve.',
      equations: [
        {
          label: 'Total DC Leakage Current',
          formula: 'I_total(t) = I_C(t) + I_A(t) + I_G',
          note: 'I_C = capacitive charging (decays in seconds), I_A = dielectric absorption (decays over minutes), I_G = steady conduction/leakage.',
        },
        {
          label: 'Dielectric Absorption Ratio (DAR)',
          formula: 'DAR = R_60s / R_30s',
          note: 'DAR < 1.25 indicates moisture or contamination; 1.25–1.60 is acceptable; > 1.60 is good.',
        },
        {
          label: 'Polarization Index (PI)',
          formula: 'PI = R_10min / R_1min = R_600s / R_60s',
          note: 'IEEE 43 recommends PI ≥ 2.0 for Class B, F, and H windings; PI < 1.0 indicates dangerous insulation breakdown.',
        },
      ],
      workedExample: {
        title: 'Evaluating Motor Winding Health from DAR and PI',
        given: [
          '3-phase 480 V induction motor tested at 500 V DC',
          'Measured resistance at 30 s: R_30s = 140 MΩ',
          'Measured resistance at 60 s: R_60s = 210 MΩ',
          'Measured resistance at 600 s (10 min): R_600s = 504 MΩ',
        ],
        steps: [
          'Compute Dielectric Absorption Ratio: DAR = R_60s / R_30s = 210 / 140 = 1.50 (Acceptable–Good).',
          'Compute Polarization Index: PI = R_600s / R_60s = 504 / 210 = 2.40.',
          'Compare PI against IEEE Std 43 threshold (PI ≥ 2.0 for Class F insulation): 2.40 ≥ 2.0, confirming healthy, dry dielectric polarization.',
        ],
        answer: 'DAR = 1.50, PI = 2.40 — Healthy dry insulation',
      },
    },
    {
      title: 'IEEE Std 43 Temperature Correction to 40 °C',
      summary:
        'Insulation resistance of organic varnish and epoxy-mica systems is strongly temperature-dependent: resistance approximately halves for every 10 °C increase in winding temperature. To compare tests taken at different ambient or operating temperatures fairly, IEEE Std 43 normalizes all 1-minute readings to a standard reference base of 40 °C using the correction factor K_T40.',
      equations: [
        {
          label: 'IEEE 43 Temperature Correction Factor',
          formula: 'K_T40 = 0.5^((40 - T) / 10) = 2^((T - 40) / 10)',
          note: 'T is the winding temperature in °C at the time of measurement.',
        },
        {
          label: 'Corrected Insulation Resistance at 40 °C',
          formula: 'R_c40 = R_T × K_T40',
          note: 'R_T is the measured 1-minute insulation resistance (MΩ) at winding temperature T.',
        },
        {
          label: 'IEEE 43 Minimum Recommended R_c40',
          formula: 'R_min = 5 MΩ (< 1 kV machines),   R_min = 100 MΩ (≥ 1 kV form-wound)',
          note: 'Motors below R_min must be dried, cleaned, or rewound before energization.',
        },
      ],
      workedExample: {
        title: 'Normalizing a Cold-Motor Megger Reading to 40 °C',
        given: [
          'Measured 1-minute resistance R_T = 120 MΩ',
          'Winding temperature T = 20 °C',
        ],
        steps: [
          'Calculate the temperature exponent: (T - 40) / 10 = (20 - 40) / 10 = -2.0.',
          'Calculate K_T40 = 2^(-2.0) = 0.25.',
          'Multiply measured resistance by K_T40: R_c40 = 120 MΩ × 0.25 = 30 MΩ.',
          'Although 120 MΩ looks high at 20 °C, at 40 °C operating temperature the true normalized value is 30 MΩ.',
        ],
        answer: 'K_T40 = 0.25, R_c40 = 30.0 MΩ',
      },
    },
  ],
  practice: [
    {
      id: 'megger-kt40',
      prompt:
        'A 480 V motor winding at T = 60 °C measures R_T = 45 MΩ at 1 minute. Calculate the IEEE 43 temperature-corrected resistance R_c40 (in MΩ) at 40 °C.',
      hint: 'Use K_T40 = 2^((T - 40) / 10) and R_c40 = R_T × K_T40.',
      targetValue: 180,
      unit: 'MΩ',
      tolerance: 2,
      solutionSteps: [
        'Exponent: (60 - 40) / 10 = 2.',
        'K_T40 = 2^2 = 4.0.',
        'R_c40 = 45 MΩ × 4.0 = 180 MΩ.',
      ],
    },
    {
      id: 'megger-pi',
      prompt:
        'During a 10-minute Polarization Index test, R_1min = 85 MΩ and R_10min = 204 MΩ. Calculate the Polarization Index (PI).',
      hint: 'PI = R_10min / R_1min.',
      targetValue: 2.4,
      unit: 'PI',
      tolerance: 0.05,
      solutionSteps: [
        'PI = R_10min / R_1min = 204 / 85 = 2.40.',
        'Since PI ≥ 2.0, the insulation polarization is healthy.',
      ],
    },
  ],
  quiz: [
    {
      id: 'megger-q1',
      question:
        'Why does apparent insulation resistance R(t) increase over 10 minutes on a clean, dry motor winding?',
      options: [
        'The DC test voltage slowly decreases as the battery drains',
        'Capacitive charging and dielectric absorption currents decay over time, leaving only small leakage current',
        'The winding heats up during the megger test, raising resistance',
        'Copper conductor resistance increases under DC stress',
      ],
      correctIndex: 1,
      explanation:
        'As I_C and I_A decay toward zero while V_DC stays constant, total current I(t) drops, causing apparent resistance R(t) = V / I(t) to climb.',
    },
    {
      id: 'megger-q2',
      question:
        'If a motor winding is tested at 20 °C (cooler than the 40 °C reference), how does R_c40 compare to the raw measured R_T?',
      options: [
        'R_c40 is 4× higher than R_T',
        'R_c40 is equal to R_T',
        'R_c40 is 0.25× (one quarter) of R_T',
        'Temperature does not affect insulation resistance',
      ],
      correctIndex: 2,
      explanation:
        'Insulation resistance doubles for every 10 °C drop below 40 °C, so a cold 20 °C reading must be multiplied by K_T40 = 2^((20-40)/10) = 0.25.',
    },
    {
      id: 'megger-q3',
      question:
        'What is the critical safety step immediately after completing a high-voltage DC Megohmmeter test on a large motor?',
      options: [
        'Immediately disconnect the leads by hand before the reading settles',
        'Switch to AC resistance mode',
        'Discharge the capacitive energy stored in the winding to ground',
        'Spray contact cleaner on the terminal box',
      ],
      correctIndex: 2,
      explanation:
        'Stator windings act as a capacitor charged to 500–2500 V DC; the tester or grounding stick must safely discharge the winding before touching leads.',
    },
  ],
};
