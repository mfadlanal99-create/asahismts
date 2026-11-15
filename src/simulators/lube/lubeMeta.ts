import type { SimulatorMeta } from '../../types/simulator';
import './lubeI18n';

export const lubeMeta: SimulatorMeta = {
  id: 'lube',
  title: 'Industrial Lubrication & Oil Analysis Lab',
  shortTitle: 'Lubrication & Oil',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Evaluate ISO VG oil grades across operating temperatures, analyze EHL film thickness (lambda ratio), decode ISO 4406 cleanliness, diagnose used-oil lab reports, and size grease relubrication.',
  iconName: 'Gauge',
  accentColor: 'amber',
  explore: [
    {
      title: 'ISO VG Grades & Viscosity–Temperature Behavior',
      summary:
        'ISO 3448 classifies industrial lubricants by their kinematic viscosity (in cSt = mm²/s) at 40 °C, with a ±10% tolerance band. Because oil thins exponentially as temperature rises, engineers use the ASTM D341 Walther equation to verify that operating viscosity remains inside the equipment target window at actual sump temperature.',
      equations: [
        {
          label: 'Walther (ASTM D341) Equation',
          formula: 'log10(log10(ν + 0.7)) = A − B · log10(T + 273.15)',
          note: 'ν in cSt (mm²/s), T in °C; A and B are oil-specific constants from ν40 and ν100',
        },
        {
          label: 'ISO 3448 Grade Tolerance',
          formula: 'ν_40 ∈ [0.90 · VG, 1.10 · VG]',
          note: 'e.g., ISO VG 220 spans 198 to 242 cSt at 40 °C',
        },
      ],
      workedExample: {
        title: 'Checking ISO VG 220 Operating Viscosity in a Helical Gearbox',
        given: [
          'Oil grade: ISO VG 220 (ν40 = 220 cSt, ν100 = 19.0 cSt)',
          'Gearbox sump temperature: T = 70 °C',
          'Gearbox target operating window: 25–90 cSt',
        ],
        steps: [
          'Convert reference temperatures to Kelvin: T1 = 313.15 K, T2 = 373.15 K, T_op = 343.15 K.',
          'Compute Walther parameters: W1 = log10(log10(220.7)) = 0.3699, W2 = log10(log10(19.7)) = 0.1121.',
          'Interpolate W(343.15 K) ≈ 0.2336 → ν(70 °C) = 10^(10^0.2336) − 0.7 ≈ 51.0 cSt.',
        ],
        answer: 'ν(70 °C) ≈ 51.0 cSt — squarely inside the 25–90 cSt helical gearbox window.',
      },
    },
    {
      title: 'EHL Film Thickness, Lambda Ratio (λ) & Wear Regimes',
      summary:
        'Elastohydrodynamic lubrication (EHL) separates rolling bearings and gear teeth with a microscopic pressurized oil film. The dimensionless lambda ratio (λ) compares minimum film thickness h_min against composite surface roughness σ, directly governing fatigue life and wear mode.',
      equations: [
        {
          label: 'Composite RMS Surface Roughness',
          formula: 'σ = √(Rq1² + Rq2²)',
          note: 'Rq1, Rq2 are RMS roughnesses of mating surfaces (μm)',
        },
        {
          label: 'Lambda Film Ratio',
          formula: 'λ = h_min / σ',
          note: 'λ ≥ 3: Full-Film EHL | 1.5 ≤ λ < 3: Mixed | 1 ≤ λ < 1.5: Marginal | λ < 1: Boundary',
        },
      ],
      workedExample: {
        title: 'Evaluating Bearing Film Regime Under Water Contamination',
        given: [
          'Clean EHL film thickness: h_min = 0.68 μm',
          'Composite bearing race/roller roughness: σ = 0.24 μm',
          'Water ingress (1200 ppm) degrades effective film by 30%',
        ],
        steps: [
          'Effective film thickness: h_eff = 0.68 × (1 − 0.30) = 0.476 μm.',
          'Compute lambda ratio: λ = 0.476 / 0.24 = 1.98.',
          'Compare against regime thresholds: 1.5 ≤ 1.98 < 3.0.',
        ],
        answer: 'λ = 1.98 (Mixed Lubrication) — occasional asperity contact; dehydrate oil to restore λ > 2.5.',
      },
    },
    {
      title: 'ISO 4406 Cleanliness Codes & Contamination Control',
      summary:
        'ISO 4406 expresses solid particle contamination as three range numbers (X/Y/Z) representing counts per milliliter at ≥4 μm, ≥6 μm, and ≥14 μm. Every +1 step in code number doubles the particle count, and exceeding target cleanliness accelerates three-body abrasive wear.',
      equations: [
        {
          label: 'ISO 4406 3-Digit Format',
          formula: 'Code = R(≥4 μm) / R(≥6 μm) / R(≥14 μm)',
          note: 'Each +1 code step = 2× particle concentration per mL',
        },
        {
          label: 'Code-to-Count Doubling Rule',
          formula: 'N_new = N_old · 2^(ΔCode)',
          note: 'Dropping from 20/18/15 to 17/15/12 removes 87.5% of particles (8× cleaner)',
        },
      ],
      workedExample: {
        title: 'Quantifying Filtration Improvement on a Hydraulic Power Unit',
        given: [
          'Current oil cleanliness: ISO 20/18/15 (5,000–10,000 particles/mL ≥4 μm)',
          'Hydraulic servo target: ISO 17/15/12',
        ],
        steps: [
          'Calculate code reduction: ΔCode = 20 − 17 = 3 steps across all three channels.',
          'Compute reduction factor: 2³ = 8× fewer particles.',
          'Percentage removed: (1 − 1/8) × 100% = 87.5%.',
        ],
        answer: 'Achieving 17/15/12 reduces particle concentration by 8× (87.5% reduction).',
      },
    },
    {
      title: 'Grease Relubrication Formula & Arrhenius Thermal Oil Life',
      summary:
        'Over-greasing causes churning and seal blowout, while under-greasing starves the bearing. The standard SKF/industrial relubrication mass formula sizes the exact shot in grams, while the Arrhenius rule of thumb predicts how rapidly bulk temperature accelerates oil oxidation.',
      equations: [
        {
          label: 'Grease Relubrication Quantity',
          formula: 'G = 0.005 · D · B',
          note: 'G in grams, bearing outer diameter D in mm, bearing width B in mm',
        },
        {
          label: 'Arrhenius Oxidation Rule',
          formula: 'L(T) = L_60 · 0.5^((T − 60) / 10)',
          note: 'Oil oxidation life halves for every +10 °C rise above 60 °C (for T > 60 °C)',
        },
      ],
      workedExample: {
        title: 'Sizing Grease Charge for a 6312 Pump Bearing',
        given: ['Bearing OD: D = 130 mm', 'Bearing width: B = 31 mm'],
        steps: [
          'Apply the standard relubrication formula: G = 0.005 × D × B.',
          'G = 0.005 × 130 × 31 = 0.65 × 31 = 20.15 g.',
        ],
        answer: '20.2 grams of grease per relubrication interval.',
      },
    },
  ],
  practice: [
    {
      id: 'lube-p1',
      prompt:
        'Calculate the grease relubrication quantity G (in grams) for a rolling bearing with outer diameter D = 140 mm and width B = 33 mm using G = 0.005 · D · B.',
      hint: 'Multiply 0.005 × 140 × 33.',
      targetValue: 23.1,
      unit: 'g',
      tolerance: 0.3,
      solutionSteps: [
        'Use the standard relubrication mass equation: G = 0.005 · D · B.',
        'Substitute D = 140 mm and B = 33 mm: G = 0.005 × 140 × 33.',
        'G = 0.70 × 33 = 23.1 g.',
      ],
    },
    {
      id: 'lube-p2',
      prompt:
        'A pump bearing has mating RMS surface roughnesses Rq1 = 0.24 μm and Rq2 = 0.18 μm, and an EHL film thickness h_min = 0.78 μm. Calculate the lambda ratio (λ).',
      hint: 'First find composite roughness σ = √(Rq1² + Rq2²), then compute λ = h_min / σ.',
      targetValue: 2.6,
      unit: 'λ',
      tolerance: 0.08,
      solutionSteps: [
        'Compute composite roughness: σ = √(0.24² + 0.18²) = √(0.0576 + 0.0324) = √0.09 = 0.30 μm.',
        'Compute lambda ratio: λ = h_min / σ = 0.78 / 0.30 = 2.60.',
      ],
    },
    {
      id: 'lube-p3',
      prompt:
        'A mineral gear oil has a base service life of 8,000 hours at 60 °C. Using the Arrhenius rule (life halves every +10 °C above 60 °C), estimate the service life (in hours) if the gearbox runs continuously at 80 °C.',
      hint: 'Temperature rise above 60 °C is 20 °C, which is two 10 °C halving steps.',
      targetValue: 2000,
      unit: 'hours',
      tolerance: 50,
      solutionSteps: [
        'Temperature increase above 60 °C: ΔT = 80 − 60 = 20 °C.',
        'Number of halving steps: n = 20 / 10 = 2.',
        'Remaining oil life: L = 8,000 × (0.5)² = 8,000 × 0.25 = 2,000 hours.',
      ],
    },
    {
      id: 'lube-p4',
      prompt:
        'ISO 3448 allows a ±10% viscosity tolerance at 40 °C around the nominal ISO VG grade. What is the minimum acceptable 40 °C viscosity (in cSt) for a fresh ISO VG 220 oil?',
      hint: 'Subtract 10% from 220 cSt (multiply by 0.90).',
      targetValue: 198,
      unit: 'cSt',
      tolerance: 1,
      solutionSteps: [
        'ISO 3448 lower tolerance limit is 0.90 × nominal VG.',
        'ν_min = 0.90 × 220 = 198 cSt.',
      ],
    },
    {
      id: 'lube-p5',
      prompt:
        'An oil sample has an ISO 4406 cleanliness code of 20/18/15. After installing a kidney-loop filter, the ≥4 μm particle count drops by a factor of 8. What is the new first digit (≥4 μm code) of the ISO 4406 code?',
      hint: 'Each -1 step in ISO 4406 code halves the particle count; a factor of 8 = 2³.',
      targetValue: 17,
      unit: 'code',
      tolerance: 0.1,
      solutionSteps: [
        'Each ISO 4406 code step represents a factor of 2 in particle concentration.',
        'An 8× reduction equals 2³ → 3 code steps lower.',
        'New ≥4 μm code = 20 − 3 = 17.',
      ],
    },
  ],
  quiz: [
    {
      id: 'lube-q1',
      question:
        'What does the "220" in ISO VG 220 specify?',
      options: [
        'Kinematic viscosity of ~220 cSt at 40 °C (±10%)',
        'Dynamic viscosity of 220 cP at 100 °C',
        'Maximum safe operating temperature of 220 °F',
        'Minimum Viscosity Index (VI) of 220',
      ],
      correctIndex: 0,
      explanation:
        'ISO 3448 defines ISO VG grades by their midpoint kinematic viscosity in cSt (mm²/s) at 40 °C, with a ±10% tolerance band.',
    },
    {
      id: 'lube-q2',
      question:
        'A rolling-element bearing operating at λ = 0.75 is in which lubrication regime?',
      options: [
        'Boundary lubrication — direct metal-to-metal asperity contact and high wear',
        'Full-film EHL — complete separation of surfaces',
        'Hydrodynamic wedge — excess churning loss',
        'Optimal mixed lubrication — zero fatigue risk',
      ],
      correctIndex: 0,
      explanation:
        'When λ = h_min / σ < 1.0, the oil film is thinner than the composite surface roughness, causing direct asperity contact (boundary lubrication).',
    },
    {
      id: 'lube-q3',
      question:
        'In an ISO 4406 cleanliness code such as 18/16/13, what do the three numbers represent?',
      options: [
        'Particle count range codes per mL at ≥4 μm, ≥6 μm, and ≥14 μm',
        'Percentage of water, soot, and iron wear debris',
        'Base oil viscosity at 40 °C, 70 °C, and 100 °C',
        'Maximum allowable operating hours in thousands',
      ],
      correctIndex: 0,
      explanation:
        'ISO 4406 reports particle counts per milliliter at three cumulative size thresholds: ≥4 μm(c), ≥6 μm(c), and ≥14 μm(c).',
    },
    {
      id: 'lube-q4',
      question:
        'How does bulk oil temperature rising from 60 °C to 80 °C affect mineral oil oxidation life according to the Arrhenius rule?',
      options: [
        'Oxidation life drops to roughly 25% (halves twice)',
        'Oxidation life drops by 20%',
        'Oxidation life doubles due to lower viscosity',
        'Oxidation life is unaffected below 100 °C',
      ],
      correctIndex: 0,
      explanation:
        'Per the Arrhenius rate rule, chemical oxidation rate roughly doubles (halving oil life) for every 10 °C increase above 60 °C. +20 °C = (0.5)² = 25% life.',
    },
    {
      id: 'lube-q5',
      question:
        'Why is free/emulsified water (e.g., >1000 ppm) especially destructive to rolling-element bearings?',
      options: [
        'It collapses EHL film strength, causes corrosion, and induces hydrogen embrittlement',
        'It permanently increases the ISO VG grade by two steps',
        'It improves heat transfer and extends bearing L10 life',
        'It dissolves EP additives into harmless gaseous nitrogen',
      ],
      correctIndex: 0,
      explanation:
        'Water cannot build EHL pressure-viscosity film like mineral oil; it causes localized film collapse, rusting, additive washout, and hydrogen-induced spalling.',
    },
    {
      id: 'lube-q6',
      question:
        'In the grease relubrication formula G = 0.005 · D · B, what do D and B represent?',
      options: [
        'Bearing outer diameter (mm) and bearing width (mm)',
        'Shaft diameter (inches) and housing bore (inches)',
        'Grease NLGI grade and base oil viscosity (cSt)',
        'Operating RPM and ambient temperature (°C)',
      ],
      correctIndex: 0,
      explanation:
        'G = 0.005 · D · B gives the relubrication grease quantity in grams using bearing outside diameter D (mm) and width B (mm).',
    },
  ],
};
