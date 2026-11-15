import type { SimulatorMeta } from '../../types/simulator';
import './oilGreaseBasicsI18n';

export const oilGreaseBasicsMeta: SimulatorMeta = {
  id: 'oil-grease-basics',
  title: 'Industrial Oil & Grease Types Lab',
  shortTitle: 'Oil & Grease Types',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  description:
    'Hands-on beginner guide to industrial lubrication: explore oil families (AW, EP, R&O, Slideway, Synthetic PAO), ISO VG viscosity grades (32–460), ASTM D341 temperature thinning with animated falling-ball viscometer, equipment oil selector, NLGI grease consistency grades (00–3), and thickener compatibility rules.',
  iconName: 'Droplets',
  accentColor: 'amber',
  explore: [
    {
      title: 'Industrial Oil Classifications & ISO 3448 Viscosity Grades',
      summary:
        'Industrial lubricating oils are formulated with refined base stocks (mineral or synthetic) and tailored chemical additives designed for specific mechanical duties: Anti-Wear (AW) for high-pressure hydraulic pumps, Extreme Pressure (EP) with sulfur-phosphorus for heavy shock-loaded gear teeth, Rust & Oxidation (R&O) for continuous-circulation turbines and screw compressors, and tackified Slideway oils to eliminate stick-slip chatter on machine tools. The international standard ISO 3448 classifies industrial oils strictly by their kinematic viscosity in centistokes (cSt = mm²/s) at a reference temperature of 40 °C, permitting a ±10% tolerance band around the nominal grade number.',
      equations: [
        {
          label: 'ISO 3448 Grade Tolerance Band (at 40 °C)',
          formula: 'ν_40 ∈ [0.90 · VG,  1.10 · VG]',
          note: 'For example, ISO VG 46 permits 41.4 to 50.6 cSt; ISO VG 220 spans 198 to 242 cSt at 40 °C.',
        },
        {
          label: 'ASTM D341 Walther Viscosity–Temperature Equation',
          formula: 'log10(log10(ν + 0.7)) = A − B · log10(T + 273.15)',
          note: 'ν is kinematic viscosity in cSt (mm²/s), T is temperature in °C; A and B are fluid-specific constants.',
        },
        {
          label: 'Stokes’ Law for Falling-Ball Viscometer',
          formula: 'v = (2 · r² · (ρ_ball − ρ_oil) · g) / (9 · μ)',
          note: 'Descent velocity v is inversely proportional to dynamic viscosity μ; higher viscosity dramatically slows ball descent.',
        },
      ],
      workedExample: {
        title: 'Verifying ISO VG 46 Viscosity in a Hydraulic Pump at Operating Temperature',
        given: [
          'Lubricant: ISO VG 46 Anti-Wear Hydraulic Oil (ν40 = 46.0 cSt, ν100 = 6.8 cSt)',
          'Hydraulic reservoir operating temperature: T = 65 °C',
          'Pump manufacturer target viscosity window: 16 to 36 cSt',
        ],
        steps: [
          'Check nominal 40 °C tolerance: 46 × 0.90 = 41.4 cSt, 46 × 1.10 = 50.6 cSt.',
          'Convert temperatures to Kelvin: T40 = 313.15 K, T100 = 373.15 K, Top = 338.15 K.',
          'Calculate Walther parameters: W1 = log10(log10(46.7)) = 0.2225, W2 = log10(log10(7.5)) = -0.0580.',
          'Compute slope B = (0.2225 - (-0.0580)) / (log10(373.15) - log10(313.15)) = 3.696.',
          'Evaluate W(338.15 K) = 0.2225 - 3.696 · (log10(338.15) - log10(313.15)) = 0.0988.',
          'Solve for operating viscosity: ν(65 °C) = 10^(10^0.0988) - 0.7 ≈ 17.3 cSt.',
        ],
        answer:
          'ν(65 °C) ≈ 17.3 cSt — safely inside the pump builder’s target window of 16–36 cSt.',
      },
    },
    {
      title: 'Lubricating Grease Architecture & NLGI Consistency Grades (ASTM D217)',
      summary:
        'Lubricating grease is a semi-solid to solid lubricant consisting of three primary components: base oil (70%–90%), a thickener sponge matrix (10%–20%), and functional chemical additives (5%–10%). The thickener acts like a microscopic sponge holding the lubricating oil in place until mechanical shearing releases oil to the contact zone. The National Lubricating Grease Institute (NLGI) classifies grease consistency using the ASTM D217 worked cone penetration test: a standardized double-tapered cone is released into a temperature-conditioned grease sample (25 °C) for 5 seconds after 60 double-strokes of mechanical working. The penetration depth is measured in tenths of a millimeter (mm/10). NLGI Grade 2 (265–295 mm/10, buttery peanut butter consistency) is the universal industrial standard for over 85% of rolling bearings.',
      equations: [
        {
          label: 'ASTM D217 Worked Cone Penetration',
          formula: 'Penetration Depth = P (in tenths of a millimeter, mm/10)',
          note: 'Deeper penetration indicates a softer grease. NLGI 00: 400–430 mm/10 (semi-fluid); NLGI 2: 265–295 mm/10 (normal).',
        },
        {
          label: 'SKF Rolling Bearing Grease Replenishment Formula',
          formula: 'G = 0.005 · D · B',
          note: 'G = grease charge quantity in grams, D = bearing outer diameter in mm, B = bearing total width in mm.',
        },
      ],
      workedExample: {
        title: 'Calculating Grease Relubrication Charge for an Electric Motor Bearing',
        given: [
          'Electric motor drive-end bearing: Deep groove ball bearing 6310',
          'Bearing outer diameter: D = 110 mm',
          'Bearing width: B = 27 mm',
          'Recommended grease type: NLGI Grade 2 Polyurea',
        ],
        steps: [
          'Identify formula: G = 0.005 · D · B.',
          'Multiply dimensions: 110 mm × 27 mm = 2,970 mm².',
          'Compute grease quantity: G = 0.005 × 2,970 = 14.85 grams.',
          'Confirm grease gun calibration: standard manual lever grease gun delivers ~1.5 g per pump stroke (approx. 10 strokes).',
        ],
        answer: 'G ≈ 15 grams (10 strokes of a calibrated manual grease gun).',
      },
    },
    {
      title: 'Grease Thickener Chemistries & Cross-Compatibility Rules',
      summary:
        'Grease thickeners are classified into metallic soaps (simple Lithium, simple Calcium), complex soaps (Lithium Complex, Calcium Sulfonate Complex, Aluminum Complex), and non-soap organic or inorganic thickeners (Polyurea, Bentone Clay). When two incompatible greases are inadvertently mixed in a machine housing, their chemical thickener structures destabilize one another. For example, mixing Lithium Complex with Polyurea causes immediate breakdown of the soap fiber lattice, leading to catastrophic grease softening (liquefaction), extreme oil bleeding, and grease escaping past seals into motor windings. Conversely, mixing soap greases with inorganic Bentone Clay precipitates the clay particles, forming a rock-hard abrasive caked sludge that rapidly starves and seizes rotating raceways.',
      equations: [
        {
          label: 'Grease Dropping Point (ASTM D2265)',
          formula: 'T_drop = Temperature (°C) where first drop of liquid oil falls from heated test cup',
          note: 'Indicates the upper thermal boundary where thickener loses gel structure. Non-melting clays have no dropping point.',
        },
        {
          label: 'Oil Separation under Static Storage (ASTM D6184)',
          formula: '% Bleed = (Mass of separated oil / Initial grease sample mass) × 100%',
          note: 'Normal bleeding is 1% to 5%; incompatible mixture bleeding often exceeds 20%, draining the bearing of base oil.',
        },
      ],
      workedExample: {
        title: 'Diagnosing an Electric Motor Failure from Incompatible Grease Mixing',
        given: [
          'Original factory-fill grease: Polyurea OEM motor grease (blue color, NLGI 2)',
          'Maintenance technician relubricated with: Lithium Complex general EP grease (amber color, NLGI 2)',
          'Symptom observed: Oil puddling inside motor end-bell, bearing squeal within 48 operating hours',
        ],
        steps: [
          'Review ASTM D6185 thickener compatibility matrix: Lithium Complex + Polyurea = Incompatible — Do Not Mix!',
          'Mechanism: Urea bonds disrupt lithium 12-hydroxystearate soap crystallites, causing the grease matrix to collapse.',
          'Outcome: Base oil separates rapidly and leaks past bearing labyrinth seals onto motor stator windings.',
          'Corrective action: Complete motor disassembly, solvent degrease of bearing cavities, and 100% fresh polyurea repack.',
        ],
        answer:
          'Failure confirmed: Chemical thickener incompatibility caused grease liquefaction and bearing starvation.',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'Under ISO 3448, industrial oils are classified by their kinematic viscosity at 40 °C within a ±10% tolerance band. For an ISO VG 46 anti-wear hydraulic oil, what is the minimum permissible kinematic viscosity at 40 °C (in cSt)?',
      hint: 'Multiply the nominal ISO VG grade by 0.90.',
      targetValue: 41.4,
      unit: 'cSt',
      tolerance: 0.2,
      solutionSteps: [
        'Recall ISO 3448 specification: tolerance band is ±10% of nominal grade.',
        'Minimum permitted viscosity = Nominal VG × (1 - 0.10) = 46 × 0.90.',
        'Calculate: 46 × 0.90 = 41.4 cSt.',
      ],
    },
    {
      id: 'p2',
      prompt:
        'A maintenance technician performs an ASTM D217 worked penetration test on a grease sample after 60 double-strokes at 25 °C. The dial indicator records a cone penetration depth of 280 tenths of a millimeter (28.0 mm). Which NLGI consistency grade (0, 1, 2, or 3) corresponds to this measurement?',
      hint: 'NLGI Grade 2 covers the worked penetration range of 265 to 295 mm/10 (peanut butter consistency).',
      targetValue: 2,
      unit: 'NLGI Grade',
      tolerance: 0.1,
      solutionSteps: [
        'Refer to the NLGI Consistency Grade Table: Grade 0 (355–385), Grade 1 (310–340), Grade 2 (265–295), Grade 3 (220–250).',
        'Compare measured penetration depth P = 280 mm/10.',
        'Because 265 ≤ 280 ≤ 295, the grease is classified as NLGI Grade 2.',
      ],
    },
    {
      id: 'p3',
      prompt:
        'Using the standard bearing relubrication formula G = 0.005 · D · B (where D is outer diameter in mm and B is bearing width in mm), calculate the grease replenishment quantity in grams for a deep groove ball bearing with outer diameter D = 120 mm and width B = 30 mm.',
      hint: 'Multiply 0.005 by the outer diameter and width.',
      targetValue: 18,
      unit: 'grams',
      tolerance: 0.5,
      solutionSteps: [
        'Identify given parameters: D = 120 mm, B = 30 mm.',
        'Apply formula: G = 0.005 × 120 × 30.',
        'Calculate product: 120 × 30 = 3,600 mm².',
        'Calculate grease quantity: 0.005 × 3,600 = 18.0 grams.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'An industrial helical gearbox uses ISO VG 220 oil with ν40 = 220 cSt and ν100 = 19.2 cSt. During summer peak production, the gearbox sump runs at 70 °C. Using the ASTM D341 Walther relationship, determine the approximate operating kinematic viscosity in cSt (enter to the nearest whole integer).',
      hint: 'Viscosity drops exponentially with temperature; at 70 °C, an ISO VG 220 mineral oil typically falls to approximately 51 cSt.',
      targetValue: 51,
      unit: 'cSt',
      tolerance: 2.0,
      solutionSteps: [
        'Convert reference temperatures to Kelvin: T1 = 313.15 K, T2 = 373.15 K, Top = 343.15 K.',
        'Evaluate Walther W1 = log10(log10(220.7)) = 0.3699 and W2 = log10(log10(19.9)) = 0.1136.',
        'Interpolate at 70 °C (343.15 K): W(343.15 K) ≈ 0.2336.',
        'Solve kinematic viscosity: ν(70 °C) = 10^(10^0.2336) - 0.7 ≈ 51.0 cSt.',
      ],
    },
    {
      id: 'p5',
      prompt:
        'In a falling-ball viscometer, a calibrated steel sphere takes 2.5 seconds to fall between timing marks in ISO VG 32 oil. Assuming laminar Stokes flow where descent time is directly proportional to dynamic viscosity, how many seconds will the same sphere take to fall through ISO VG 320 oil at the same test temperature?',
      hint: 'ISO VG 320 has 10 times the nominal kinematic viscosity of ISO VG 32 (320 / 32 = 10).',
      targetValue: 25,
      unit: 'seconds',
      tolerance: 1.0,
      solutionSteps: [
        'From Stokes’ Law, descent velocity is inversely proportional to fluid viscosity: v ∝ 1/μ.',
        'Therefore, descent time is directly proportional to viscosity: t ∝ μ.',
        'Compute viscosity ratio: VG 320 / VG 32 = 320 / 32 = 10.0.',
        'Multiply initial fall time: t = 2.5 seconds × 10.0 = 25.0 seconds.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'What does the number in the designation "ISO VG 68" specifically represent under standard ISO 3448?',
      options: [
        'Nominal kinematic viscosity of 68 cSt (mm²/s) measured at 40 °C',
        'Maximum operating temperature limit of 68 °C',
        'Viscosity index (VI) score of 68 points',
        'Density of 68 grams per milliliter at room temperature',
      ],
      correctIndex: 0,
      explanation:
        'Under ISO 3448, the ISO VG (Viscosity Grade) number strictly defines the midpoint kinematic viscosity in centistokes (cSt = mm²/s) measured at a standardized reference temperature of 40 °C, within a ±10% allowable tolerance band.',
    },
    {
      id: 'q2',
      question:
        'Which additive package is critically essential for high-pressure industrial hydraulic pumps (vane and piston types) operating up to 350 bar?',
      options: [
        'Anti-Wear (AW) zinc additives (ZDDP) to prevent metal-to-metal boundary contact',
        'Alkaline detergent packages to wash combustion soot',
        'Heavy polymer tackifiers to prevent vertical oil dripping',
        'Emulsifying surfactants to blend oil with water',
      ],
      correctIndex: 0,
      explanation:
        'High-pressure hydraulic pumps rely on Anti-Wear (AW) chemistry—predominantly zinc dialkyldithiophosphate (ZDDP)—which forms a sacrificial boundary film on heavily loaded pump cams, vanes, and valve plates to prevent galling and wear.',
    },
    {
      id: 'q3',
      question:
        'Which NLGI grease consistency grade represents the universal "normal buttery" texture (peanut butter consistency) used in approximately 85% to 90% of industrial rolling element bearings?',
      options: [
        'NLGI Grade 2 (worked penetration 265–295 mm/10)',
        'NLGI Grade 00 (worked penetration 400–430 mm/10)',
        'NLGI Grade 0 (worked penetration 355–385 mm/10)',
        'NLGI Grade 5 (worked penetration 130–160 mm/10)',
      ],
      correctIndex: 0,
      explanation:
        'NLGI Grade 2 is the universal industrial benchmark for rolling bearings. It is sufficiently stiff to stay inside the bearing housing without churning excessively, yet soft enough to feed continuous oil film into the raceway contacts.',
    },
    {
      id: 'q4',
      question:
        'What catastrophic outcome typically occurs when a maintenance technician mixes a Lithium Complex grease with an incompatible Polyurea grease in an electric motor bearing?',
      options: [
        'The thickener structure breaks down, causing severe grease liquefaction, excessive oil bleeding, and leakage past seals',
        'The grease immediately transforms into a diamond-hard solid block',
        'The base oil evaporates within 5 minutes of startup',
        'The motor electrical voltage doubles due to ionic ionization',
      ],
      correctIndex: 0,
      explanation:
        'Lithium Complex and Polyurea thickeners are chemically incompatible. Polyurea disrupts the lithium soap fibrous crystalline matrix, causing the grease to lose cohesive yield strength, liquefy, and drain out of the bearing cavity into the motor windings.',
    },
    {
      id: 'q5',
      question:
        'Why are non-melting inorganic Bentone Clay thickeners selected for extreme-temperature kiln cars and asphalt furnace bearings rather than conventional soap greases?',
      options: [
        'Bentone clay has no chemical melting point (no dropping point) and will not melt or run off at temperatures exceeding 200 °C',
        'Bentone clay is completely water-soluble and washes away with steam',
        'Bentone clay reduces machine electrical consumption to zero',
        'Bentone clay can be safely mixed with any other grease thickener without cleaning',
      ],
      correctIndex: 0,
      explanation:
        'Bentone (organophilic bentonite clay) is an inorganic thickener that does not melt. Unlike metallic soap greases that liquefy at their dropping point (~180°C–260°C), clay-thickened greases remain in place at continuous furnace temperatures exceeding 200°C.',
    },
    {
      id: 'q6',
      question:
        'As an industrial machine’s operating oil temperature increases from 25 °C to 75 °C during heavy operation, what happens to its kinematic viscosity?',
      options: [
        'It decreases exponentially, thinning significantly according to the ASTM D341 Walther relationship',
        'It increases linearly as molecules expand in volume',
        'It remains completely constant regardless of temperature changes',
        'It drops to zero instantly upon reaching 50 °C',
      ],
      correctIndex: 0,
      explanation:
        'The viscosity of liquid lubricants decreases exponentially as temperature rises because intermolecular cohesion weakens. Engineers must calculate operating viscosity at running temperature to ensure the lubricant remains thick enough to prevent surface-to-surface metal contact.',
    },
  ],
};
