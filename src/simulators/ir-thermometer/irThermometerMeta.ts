import type { SimulatorMeta } from '../../types/simulator';

export const irThermometerMeta: SimulatorMeta = {
  id: 'ir-thermometer',
  title: 'IR Thermometer & Thermal Imaging Camera',
  shortTitle: 'IR Thermometer & Thermal',
  category: 'Diagnostic Instruments',
  difficulty: 'Intermediate',
  description:
    'Inspect electrical panels, bearings, steam traps, and motor frames using non-contact infrared thermometry and thermal imaging. Master Distance-to-Spot (D:S) optical sizing, emissivity (ε) calibration, and reflected temperature error.',
  iconName: 'Thermometer',
  accentColor: 'orange',
  explore: [
    {
      title: 'Distance-to-Spot (D:S) Optical Ratio & Spot Averaging Error',
      summary:
        'An infrared spot pyrometer measures the average thermal radiation emitted within a circular field of view whose diameter grows linearly with distance. The optical specification D:S (e.g., 12:1 or 30:1) defines the ratio of distance D to spot diameter S. If the measurement spot exceeds the physical size of a hot component (such as a loose breaker lug or bearing race), the surrounding cooler background dilutes the reading, causing a dangerous under-reading known as spot averaging error.',
      equations: [
        {
          label: 'Spot Diameter from Distance-to-Spot Ratio',
          formula: 'S = D / (D:S)',
          note: 'D = distance to target (cm or m), S = laser measurement spot diameter (cm or m).',
        },
        {
          label: 'Spot Area Averaged Temperature',
          formula: 'T_spot = (1 / A_spot) ∫∫ T(x, y) dA',
          note: 'To measure true peak temperature, ensure S ≤ 0.5 × target component diameter.',
        },
      ],
      workedExample: {
        title: 'Determining Maximum Safe Inspection Distance for a Busbar Lug',
        given: [
          'Target MCC busbar lug diameter = 4.0 cm',
          'IR pyrometer optical ratio D:S = 12:1',
          'Required spot size S ≤ 4.0 cm to avoid background dilution',
        ],
        steps: [
          'Rearrange D:S formula for maximum distance: D_max = S × (D:S).',
          'Substitute S = 4.0 cm and D:S = 12: D_max = 4.0 cm × 12 = 48 cm.',
          'At 120 cm, the spot diameter would be 120 / 12 = 10.0 cm, averaging in the 28 °C panel background and under-reporting the 88 °C hotspot.',
        ],
        answer: 'D_max = 48 cm (0.48 m) with a 12:1 pyrometer',
      },
    },
    {
      title: 'Stefan-Boltzmann Law, Emissivity (ε), and Reflected Temperature',
      summary:
        'Every object above absolute zero emits infrared radiation proportional to its emissivity ε (0.0 to 1.0) and the fourth power of absolute temperature (K). However, a sensor also receives reflected ambient radiation (1 - ε)·T_refl^4. Low-emissivity shiny metals (e.g., polished aluminum or stainless steel, ε ≈ 0.15) act like thermal mirrors: they emit very little of their own heat and reflect surrounding room temperature. Applying high-emissivity electrical tape (ε = 0.95) or matching the instrument ε setting eliminates this error.',
      equations: [
        {
          label: 'Total Radiance Received by IR Sensor',
          formula: 'W_total = ε_surf · σ · T_surf⁴ + (1 - ε_surf) · σ · T_refl⁴',
          note: 'T_surf and T_refl are in Kelvin (K = °C + 273.15); σ = 5.67 × 10⁻⁸ W/(m²·K⁴).',
        },
        {
          label: 'Apparent Temperature Displayed by Pyrometer',
          formula: 'T_disp = [ (W_total / σ - (1 - ε_inst) · T_refl⁴) / ε_inst ]^(1/4)',
          note: 'When ε_inst = ε_surf, T_disp equals the true surface temperature T_surf.',
        },
      ],
      workedExample: {
        title: 'Why Shiny Steel Shafts Read Too Cold at ε = 0.95',
        given: [
          'Polished steel shaft true temperature T_surf = 68 °C (341.15 K), ε_surf = 0.15',
          'Reflected ambient temperature T_refl = 25 °C (298.15 K)',
          'Instrument left at default ε_inst = 0.95',
        ],
        steps: [
          'Compute emitted + reflected radiance factor: 0.15×(341.15⁴) + 0.85×(298.15⁴) = 2.03×10⁹ + 6.72×10⁹ = 8.75×10⁹ K⁴.',
          'Instrument solves assuming ε_inst = 0.95: T_disp⁴ = (8.75×10⁹ - 0.05×298.15⁴) / 0.95 = 8.79×10⁹ K⁴.',
          'Take fourth root: T_disp = (8.79×10⁹)^(0.25) = 306.2 K = 33.1 °C (an error of -34.9 °C!).',
        ],
        answer: 'Displayed = 33.1 °C vs True = 68.0 °C (Error = -34.9 °C)',
      },
    },
  ],
  practice: [
    {
      id: 'ir-spot-size',
      prompt:
        'An IR thermometer with a 30:1 D:S ratio is held 150 cm away from a bearing housing. What is the measurement spot diameter S in cm?',
      hint: 'Use S = D / (D:S).',
      targetValue: 5.0,
      unit: 'cm',
      tolerance: 0.1,
      solutionSteps: [
        'D = 150 cm, D:S = 30.',
        'S = 150 / 30 = 5.0 cm.',
      ],
    },
    {
      id: 'ir-max-dist',
      prompt:
        'You must measure a 2.5 cm wide electrical terminal lug using a 12:1 IR thermometer without exceeding the lug width. What is the maximum distance D in cm?',
      hint: 'D_max = S × (D:S).',
      targetValue: 30,
      unit: 'cm',
      tolerance: 1,
      solutionSteps: [
        'S_max = 2.5 cm, D:S = 12.',
        'D_max = 2.5 cm × 12 = 30 cm.',
      ],
    },
  ],
  quiz: [
    {
      id: 'ir-q1',
      question:
        'What happens to the reading of an IR thermometer aimed at a 3 cm hot busbar lug if you step back so the laser spot expands to 12 cm?',
      options: [
        'The reading increases because more infrared energy enters the lens',
        'The reading decreases because the cooler surrounding air/panel is averaged into the spot',
        'The reading stays exact as long as the center laser dot is on the lug',
        'The emissivity automatically increases to compensate',
      ],
      correctIndex: 1,
      explanation:
        'IR pyrometers average all thermal radiation inside the entire spot circle, not just the center laser dot. Background inclusion dilutes the hotspot reading.',
    },
    {
      id: 'ir-q2',
      question:
        'What is the most reliable field technique to measure a shiny, unpainted aluminum or stainless steel shaft with an IR thermometer?',
      options: [
        'Stand farther away to reduce glare',
        'Apply a piece of matte black electrical tape (ε ≈ 0.95) and measure the tape after thermal equilibrium',
        'Switch the thermal palette from Ironbow to Rainbow',
        'Set emissivity to 1.00',
      ],
      correctIndex: 1,
      explanation:
        'Matte black electrical tape has a known, stable high emissivity (ε ≈ 0.95), eliminating reflected-temperature errors on low-emissivity metals.',
    },
    {
      id: 'ir-q3',
      question:
        'Which D:S specification allows you to inspect a small 4 cm target from a safer, farther distance?',
      options: [
        '12:1',
        '30:1',
        '4:1',
        'D:S ratio does not affect spot size',
      ],
      correctIndex: 1,
      explanation:
        'A 30:1 pyrometer produces a 4 cm spot at 120 cm (4 × 30), whereas a 12:1 pyrometer reaches a 4 cm spot at only 48 cm.',
    },
  ],
};
