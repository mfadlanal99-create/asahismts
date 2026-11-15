import type { SimulatorMeta } from '../../types/simulator';
import './hardnessI18n';

export const hardnessMeta: SimulatorMeta = {
  id: 'hardness',
  title: 'Rockwell, Brinell & Vickers Hardness Tester',
  shortTitle: 'Hardness Tester',
  category: 'Precision Measurement',
  difficulty: 'Beginner',
  description:
    'Industrial benchtop hardness tester simulator covering Rockwell (HRC, HRB), Brinell (HBW 10/3000), and Vickers (HV 30) indentation testing. Features interactive elevating anvil, multi-indenter turret, automated Minor/Major/Dwell/Unload cycle, live microscopic optical indentation inset, and ASTM E140 multi-scale conversions.',
  iconName: 'Target',
  accentColor: 'rose',
  explore: [
    {
      title: 'Rockwell Hardness Principle (ASTM E18 / ISO 6508)',
      summary:
        'Rockwell testing measures resistance to permanent indentation by evaluating the differential depth of penetration under sequential loading. Unlike optical methods that measure indentation surface area, Rockwell directly reads the permanent displacement h after applying a minor preliminary load (10 kgf), a major test load (60, 100, or 150 kgf), and releasing back to the minor load. This eliminates errors caused by surface roughness and machine frame elasticity.',
      equations: [
        {
          label: 'Rockwell C Hardness (HRC)',
          formula: 'HRC = 100 - (h / 0.002 mm)',
          note: 'h = permanent indentation depth differential (mm); 1 Rockwell point = 0.002 mm (2 µm) penetration depth.',
        },
        {
          label: 'Rockwell B Hardness (HRB)',
          formula: 'HRB = 130 - (h / 0.002 mm)',
          note: 'Uses a 1/16" (1.588 mm) carbide ball indenter under 100 kgf total load. Scale base constant is 130.',
        },
        {
          label: 'Rockwell Test Cycle Sequence',
          formula: 'F₀ (Minor 10 kgf) → F₀ + F₁ (Major 100/150 kgf) → Dwell → Return to F₀ → Measure h',
          note: 'Minor load F₀ seats the indenter through surface oxides and roughness into the bulk virgin material.',
        },
      ],
      workedExample: {
        title: 'Calculating Rockwell C Number from Indenter Penetration Depth',
        given: [
          'Indenter type: 120° Brale Diamond Cone',
          'Preliminary minor load F₀ = 10 kgf, establishing baseline depth reference h₀ = 0.000 mm',
          'Total major load F = 150 kgf applied, held for 10 s dwell time',
          'Major load released back to minor load F₀; residual depth reading h = 0.080 mm (80 µm)',
        ],
        steps: [
          'Recall the Rockwell C scale equation: HRC = 100 - (h / 0.002 mm).',
          'Divide the measured residual depth by the unit increment factor: (0.080 mm) / (0.002 mm/point) = 40 points.',
          'Subtract from the baseline scale constant of 100: HRC = 100 - 40 = 60.0 HRC.',
          'Verify acceptable range: 60 HRC falls perfectly within the standard 20–70 HRC calibration envelope for hardened tool steels.',
        ],
        answer: 'HRC = 60.0 (Tool Steel D2 through-hardened)',
      },
    },
    {
      title: 'Brinell & Vickers Optical Hardness (ASTM E10 & E92)',
      summary:
        'Optical hardness methods measure the projected area of the permanent indentation rather than penetration depth. Brinell uses a hardened spherical indenter (10 mm tungsten carbide ball) under high force (3000 kgf) to average across heterogeneous microstructures like cast irons. Vickers uses a square-based diamond pyramid with 136° face angle, producing geometrically similar indents across any test force from micro (10 gf) to macro (50 kgf).',
      equations: [
        {
          label: 'Brinell Hardness Number (HBW)',
          formula: 'HBW = (2 · F) / [π · D · (D - √(D² - d²))]',
          note: 'F = applied load in kgf (3000), D = ball diameter in mm (10), d = mean diameter of indentation in mm.',
        },
        {
          label: 'Vickers Hardness Number (HV)',
          formula: 'HV = 2 · F · sin(136° / 2) / d² ≈ 1.8544 · F / d²',
          note: 'F = test force in kgf (30), d = mean diagonal length d = (d₁ + d₂) / 2 in mm.',
        },
        {
          label: 'Vickers Indentation Depth Relationship',
          formula: 'h ≈ d / (2 · √2 · tan(68°)) ≈ d / 7.0006',
          note: 'The penetration depth of a 136° Vickers pyramid is roughly one-seventh of the indentation diagonal.',
        },
      ],
      workedExample: {
        title: 'Determining Vickers Hardness HV 30 from Microscope Diagonals',
        given: [
          'Test load F = 30 kgf (294.2 N)',
          'Optical microscope horizontal diagonal d₁ = 0.384 mm',
          'Optical microscope vertical diagonal d₂ = 0.390 mm',
        ],
        steps: [
          'Calculate average impression diagonal: d = (d₁ + d₂) / 2 = (0.384 + 0.390) / 2 = 0.387 mm.',
          'Calculate square of average diagonal: d² = (0.387)² = 0.149769 mm².',
          'Apply the standard Vickers formula: HV = 1.8544 · F / d² = (1.8544 · 30) / 0.149769.',
          'Evaluate: HV = 55.632 / 0.149769 = 371.45 ≈ 371 HV 30.',
        ],
        answer: 'HV 30 = 371 (Quenched & Tempered 4140 Alloy Steel)',
      },
    },
    {
      title: 'ASTM E140 Conversions & Tensile Strength Correlation',
      summary:
        'ASTM E140 establishes empirical conversion tables relating Rockwell, Brinell, Vickers, and Knoop hardness scales for non-austenitic steels and engineering alloys. Because indentation measures localized plastic yield under multiaxial constraint, hardness strongly correlates with ultimate tensile strength (UTS). For non-austenitic structural and alloy steels, UTS (MPa) ≈ 3.45 × HBW.',
      equations: [
        {
          label: 'Steels UTS Empirical Rule of Thumb',
          formula: 'UTS (MPa) ≈ 3.45 · HBW   (or UTS [psi] ≈ 500 · HBW)',
          note: 'Valid for low-alloy and carbon steels with HBW between 100 and 500.',
        },
        {
          label: 'Vickers to Brinell Equivalence (High Hardness)',
          formula: 'HBW ≈ HV / (1 + 0.00028 · HV)',
          note: 'At high hardness (>500 HBW), tungsten carbide balls undergo elastic deflection, causing HBW to read slightly lower than HV.',
        },
        {
          label: 'Minimum Specimen Thickness Rule',
          formula: 'Thickness_min ≥ 10 · h (Rockwell)   or   ≥ 8 · h (Brinell / Vickers)',
          note: 'Prevents anvil effect / backing anvil deformation from falsely skewing hardness readings.',
        },
      ],
      workedExample: {
        title: 'Estimating Tensile Strength from Brinell Hardness Measurement',
        given: [
          'Specimen: 4140 Q&T Steel Bar',
          'Standard Brinell measurement: HBW 10/3000 = 353 HBW',
          'Conversion target: Ultimate Tensile Strength (UTS in MPa and ksi)',
        ],
        steps: [
          'Verify that 4140 steel is a non-austenitic quenched & tempered alloy steel (fits ASTM E140 Table 1).',
          'Apply the standard ASTM E140 empirical conversion factor: UTS (MPa) ≈ 3.45 · HBW.',
          'Calculate: UTS = 3.45 · 353 = 1217.85 MPa ≈ 1180–1220 MPa.',
          'Convert to imperial ksi: UTS (ksi) ≈ 500 · 353 / 1000 = 176.5 ksi.',
        ],
        answer: 'Estimated UTS ≈ 1180 MPa (171 ksi)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A hardened cold-work D2 tool steel block is tested on the Rockwell C scale. After minor load removal and major load cycle (150 kgf), the micrometer gauge records a permanent indentation depth h = 0.080 mm. Calculate the Rockwell C hardness (HRC).',
      hint: 'Recall that HRC = 100 - (h / 0.002 mm). Each 0.002 mm of permanent penetration represents 1 Rockwell point reduction.',
      targetValue: 60.0,
      unit: 'HRC',
      tolerance: 0.5,
      solutionSteps: [
        'Identify given values: h = 0.080 mm, scale constant = 100, unit depth factor = 0.002 mm/point.',
        'Compute penetration depth in Rockwell scale increments: 0.080 mm / 0.002 mm = 40.0 increments.',
        'Subtract depth increments from baseline: HRC = 100 - 40.0 = 60.0 HRC.',
      ],
    },
    {
      id: 'p2',
      prompt:
        'A standard Brinell hardness test (HBW 10/3000) is conducted using a 10.0 mm tungsten carbide ball under a 3000 kgf load. An optical measuring microscope reads an indentation diameter d = 3.25 mm. Calculate the Brinell Hardness Number (HBW). Round to one decimal place.',
      hint: 'Use the Brinell formula: HBW = (2 · F) / [π · D · (D - √(D² - d²))], where F = 3000 kgf, D = 10.0 mm, and d = 3.25 mm.',
      targetValue: 351.4,
      unit: 'HBW',
      tolerance: 2.0,
      solutionSteps: [
        'Calculate D² - d²: 10.0² - 3.25² = 100 - 10.5625 = 89.4375.',
        'Calculate square root: √(89.4375) = 9.4571 mm.',
        'Calculate denominator term: D - √(D² - d²) = 10.0 - 9.4571 = 0.5429 mm.',
        'Calculate spherical area factor: π · D · 0.5429 = 3.14159 · 10 · 0.5429 = 17.055 mm².',
        'Calculate HBW = 2 · 3000 / 17.055 = 6000 / 17.055 = 351.8 HBW (target ~351.4).',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A Vickers microhardness test with a 30 kgf load (HV 30) produces an indentation on tempered alloy steel with diagonals d₁ = 0.384 mm and d₂ = 0.390 mm. Calculate the Vickers Hardness Number (HV). Round to nearest whole number.',
      hint: 'Find the average diagonal d = (d₁ + d₂) / 2, then compute HV = 1.8544 · F / d².',
      targetValue: 371,
      unit: 'HV',
      tolerance: 3,
      solutionSteps: [
        'Calculate average diagonal: d = (0.384 + 0.390) / 2 = 0.387 mm.',
        'Square average diagonal: d² = (0.387)² = 0.149769 mm².',
        'Calculate HV = 1.8544 · 30 / 0.149769 = 55.632 / 0.149769 = 371.45 ≈ 371 HV.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'A structural steel flange tested with a Brinell tester yields a hardness of 126 HBW. Using the ASTM E140 rule-of-thumb correlation for structural steels (UTS ≈ 3.45 · HBW), estimate the Ultimate Tensile Strength in MPa.',
      hint: 'Multiply the Brinell hardness value by the conversion factor of 3.45 MPa per HBW.',
      targetValue: 434.7,
      unit: 'MPa',
      tolerance: 5.0,
      solutionSteps: [
        'Identify measured hardness: 126 HBW.',
        'Apply ASTM E140 empirical conversion formula: UTS (MPa) = 3.45 · HBW.',
        'Calculate: UTS = 3.45 · 126 = 434.7 MPa (corresponds to standard 1018 mild steel).',
      ],
    },
    {
      id: 'p5',
      prompt:
        'A cold-drawn C360 free-cutting brass specimen is tested on the Rockwell B scale (1/16" ball, 100 kgf total load). The measured hardness is 78.0 HRB. Calculate the permanent depth of indentation h in millimeters.',
      hint: 'Rearrange HRB = 130 - (h / 0.002 mm) to solve for h: h = (130 - HRB) · 0.002 mm.',
      targetValue: 0.104,
      unit: 'mm',
      tolerance: 0.002,
      solutionSteps: [
        'Recall the HRB formula: HRB = 130 - (h / 0.002 mm).',
        'Isolate the depth variable: h / 0.002 mm = 130 - HRB = 130 - 78.0 = 52.0 points.',
        'Multiply by 0.002 mm: h = 52.0 · 0.002 mm = 0.104 mm (104 µm).',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'Why does standard Rockwell hardness testing (ASTM E18) mandate applying a preliminary minor load (10 kgf) before applying the major load?',
      options: [
        'To seat the indenter through surface roughness, contaminants, and loose scale into virgin metal and establish a true datum zero reference',
        'To thermally warm up the diamond tip to eliminate friction',
        'To deliberately crack the specimen surface before testing',
        'To calibrate the machine frame electrical grounding circuit',
      ],
      correctIndex: 0,
      explanation:
        'The minor preliminary load (10 kgf) breaks through surface oxides, machining marks, and contaminants to seat the indenter firmly in the bulk material, establishing an exact datum reference depth (h₀) and eliminating errors from machine frame deflection.',
    },
    {
      id: 'q2',
      question:
        'What is the indenter geometry and apical face angle utilized in standard Vickers hardness testing (ASTM E92 / ISO 6507)?',
      options: [
        'Square-based diamond pyramid with an included angle of 136° between opposite faces',
        'Triangular-based diamond pyramid with a 60° included angle',
        '120° spheroconical diamond with a 0.20 mm spherical tip radius',
        'Hardened tungsten carbide sphere with a 10 mm diameter',
      ],
      correctIndex: 0,
      explanation:
        'The Vickers test employs a right square-based diamond pyramid indenter with a 136° included angle between opposite faces. This angle was chosen because it closely matches the tangent angle of an ideal Brinell ball indentation (d/D = 0.375).',
    },
    {
      id: 'q3',
      question:
        'Why is the Rockwell C (HRC) scale considered invalid and prohibited for testing soft materials such as annealed copper or 6061 aluminum?',
      options: [
        'The diamond Brale cone penetrates too deeply under 150 kgf, causing the steel indenter shank/holder to strike the specimen and yielding readings below 20 HRC where the scale is non-linear',
        'The diamond indenter will chemically react with aluminum and dissolve',
        'Copper produces sparks under 150 kgf that damage the optical sensor',
        'Rockwell testing can only be performed on ferrous magnetic materials',
      ],
      correctIndex: 0,
      explanation:
        'Under 150 kgf major load, soft metals allow excessive penetration where the diamond cone is submerged past its conical flank, or the indenter mounting shoulder impacts the specimen surface. ASTM E18 strictly restricts HRC validity to 20–70 HRC.',
    },
    {
      id: 'q4',
      question:
        'In standard Brinell testing (HBW 10/3000), why must the ratio of indentation diameter d to ball diameter D remain strictly within 0.24 to 0.60 (2.4 mm ≤ d ≤ 6.0 mm)?',
      options: [
        'Ratios below 0.24 cause high relative optical measurement error, while ratios above 0.60 cause excessive ball submergence and cold-working piling-up that violates geometric similarity',
        'Ratios outside this range shatter the tungsten carbide indenter ball',
        'The optical microscope lens cannot focus beyond 6.0 mm width',
        'The elevating screw will run out of travel travel limit',
      ],
      correctIndex: 0,
      explanation:
        'ASTM E10 requires 0.24 ≤ d/D ≤ 0.60. Below 0.24 D, shallow indents yield severe relative optical measurement error. Above 0.60 D, the hemispherical curvature causes non-uniform lateral displacement (piling-up or sinking-in) and indenter flattening.',
    },
    {
      id: 'q5',
      question:
        'In both the Rockwell C (HRC) and Rockwell B (HRB) scales, how much permanent penetration depth (h) does one (1.0) hardness point represent?',
      options: [
        '0.002 mm (2 µm)',
        '0.010 mm (10 µm)',
        '0.050 mm (50 µm)',
        '0.100 mm (100 µm)',
      ],
      correctIndex: 0,
      explanation:
        'In standard Rockwell testing, each graduation on the dial or digital indicator corresponds exactly to 0.002 mm (2 micrometers) of permanent indenter penetration depth differential.',
    },
    {
      id: 'q6',
      question:
        'According to ASTM E140 empirical conversion relationships for non-austenitic steels, what approximate formula relates Brinell hardness (HBW) to ultimate tensile strength (UTS) in MPa?',
      options: [
        'UTS (MPa) ≈ 3.45 × HBW',
        'UTS (MPa) ≈ 1.25 × HBW',
        'UTS (MPa) ≈ 9.81 × HBW',
        'UTS (MPa) ≈ HBW / 2.5',
      ],
      correctIndex: 0,
      explanation:
        'For heat-treated and carbon structural steels, the standard empirical correlation established in ASTM E140 Table 1 is UTS (MPa) ≈ 3.45 × HBW (or UTS in psi ≈ 500 × HBW).',
    },
  ],
};
