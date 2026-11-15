import type { SimulatorMeta } from '../../types/simulator';
import './utmTestingI18n';

export const utmTestingMeta: SimulatorMeta = {
  id: 'utm-testing',
  title: 'Universal Testing Machine (UTM) — Tensile & Compression',
  shortTitle: 'UTM Tensile & Comp',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Interactive materials mechanics testing simulator for Universal Testing Machines (UTM). Perform ASTM E8 tensile and ASTM E9 compression tests, inspect real-time stress-strain (σ–ε) and force-elongation (F–ΔL) curves, evaluate 0.2% offset yield strength, UTS, localized necking, ductility (%EL, %RA), and compression barreling deformation.',
  iconName: 'Activity',
  accentColor: 'violet',
  explore: [
    {
      title: 'Engineering Stress–Strain & Hooke’s Law',
      summary:
        'A standard uniaxial tensile test evaluates the fundamental mechanical properties of materials under gradual axial extension. Engineering stress (σ = F/A₀) and engineering strain (ε = ΔL/L₀) are normalized against initial specimen dimensions. In the linear elastic regime, deformation is fully reversible and governed by Hooke’s Law (σ = E · ε), where the slope represents Young’s Modulus (E).',
      equations: [
        {
          label: 'Engineering Stress (Nominal Stress)',
          formula: 'σ = F / A₀',
          note: 'F = axial tensile load (N), A₀ = initial cross-sectional area (mm²); units in MPa (N/mm²).',
        },
        {
          label: 'Engineering Strain (Nominal Strain)',
          formula: 'ε = ΔL / L₀ = (L - L₀) / L₀',
          note: 'ΔL = elongation within gauge length, L₀ = original gauge length (mm); dimensionless or mm/mm.',
        },
        {
          label: 'Hooke’s Law (Linear Elastic Regime)',
          formula: 'E = σ / ε',
          note: 'E = Young’s Modulus of Elasticity (GPa); directly reflects interatomic bonding stiffness.',
        },
        {
          label: 'True Stress & True Strain (Prior to Necking)',
          formula: 'σ_true = σ * (1 + ε),   ε_true = ln(1 + ε)',
          note: 'Accounts for instantaneous cross-sectional area reduction due to Poisson contraction.',
        },
      ],
      workedExample: {
        title: 'Calculating Young’s Modulus from Elastic Tensile Data',
        given: [
          'Initial round specimen diameter d₀ = 12.8 mm (gauge area A₀ = 128.68 mm²)',
          'Extensometer gauge length L₀ = 50.0 mm',
          'Applied tensile load in elastic region F = 25.0 kN (25,000 N)',
          'Elongation recorded by extensometer ΔL = 0.0485 mm',
        ],
        steps: [
          'Compute engineering stress: σ = F / A₀ = 25,000 N / 128.68 mm² = 194.28 MPa.',
          'Compute engineering strain: ε = ΔL / L₀ = 0.0485 mm / 50.0 mm = 0.000970 (0.0970%).',
          'Apply Hooke’s Law: E = σ / ε = 194.28 MPa / 0.000970 = 200,288 MPa = 200.3 GPa.',
          'A value of ~200 GPa confirms standard structural low-carbon steel (such as ASTM A36).',
        ],
        answer: 'E = 200.3 GPa (Low-Carbon Structural Steel)',
      },
    },
    {
      title: '0.2% Offset Yield Strength, UTS, Necking & Ductility (%EL, %RA)',
      summary:
        'Because many structural alloys lack a discrete yield point, standards (ASTM E8 / ISO 6892) define the 0.2% offset yield strength (Rp0.2) by drawing a line parallel to the elastic slope starting at 0.002 strain. The peak of the engineering curve defines the Ultimate Tensile Strength (UTS). Beyond the UTS, plastic strain hardening is overtaken by localized cross-sectional necking until ductile rupture.',
      equations: [
        {
          label: '0.2% Offset Yield Strength (Rp0.2)',
          formula: 'σ_y = Stress at intersection with line: σ = E * (ε - 0.002)',
          note: 'Defines the practical boundary between elastic behavior and permanent plastic deformation.',
        },
        {
          label: 'Ultimate Tensile Strength (UTS)',
          formula: 'UTS = F_max / A₀',
          note: 'F_max = maximum sustainable axial tensile force; marks onset of localized necking.',
        },
        {
          label: 'Percent Elongation at Fracture (%EL)',
          formula: '%EL = ((L_f - L₀) / L₀) * 100%',
          note: 'L_f = final gauge length measured after re-fitting fractured halves; primary ductility metric.',
        },
        {
          label: 'Percent Reduction of Area (%RA)',
          formula: '%RA = ((A₀ - A_f) / A₀) * 100% = ((d₀² - d_f²) / d₀²) * 100%',
          note: 'A_f = minimum cross-sectional area measured at the neck fracture surface.',
        },
      ],
      workedExample: {
        title: 'Determining UTS, %EL, and %RA for Structural Steel',
        given: [
          'Initial dimensions: d₀ = 12.8 mm (A₀ = 128.68 mm²), L₀ = 50.0 mm',
          'Maximum tensile force F_max = 51.5 kN (51,500 N)',
          'Final gauge length after fracture L_f = 63.8 mm',
          'Minimum neck diameter at fracture d_f = 8.5 mm (A_f = 56.75 mm²)',
        ],
        steps: [
          'Calculate UTS: UTS = F_max / A₀ = 51,500 N / 128.68 mm² = 400.2 MPa.',
          'Calculate elongation: %EL = ((63.8 - 50.0) / 50.0) * 100% = (13.8 / 50.0) * 100% = 27.6%.',
          'Calculate area reduction: %RA = ((128.68 - 56.75) / 128.68) * 100% = (71.93 / 128.68) * 100% = 55.9%.',
          '%EL > 20% and %RA > 50% demonstrate high ductility and cup-and-cone fracture morphology.',
        ],
        answer: 'UTS = 400.2 MPa, %EL = 27.6%, %RA = 55.9% (Ductile Behavior)',
      },
    },
    {
      title: 'Compression Barreling & Ductile vs Brittle Fracture Mechanics',
      summary:
        'In uniaxial compression testing (ASTM E9), cylindrical specimens are loaded axially between hardened steel platens. Frictional restraint at the platen interfaces prevents radial expansion at the top and bottom ends, forcing the center to bulge into a barrel shape. Ductile metals undergo continuous plastic flattening, while brittle materials (like gray cast iron) fail along 45° shear planes under maximum resolved shear stress.',
      equations: [
        {
          label: 'Nominal Compressive Stress',
          formula: 'σ_c = F_c / A₀',
          note: 'F_c = axial compressive load (N); referenced to initial cross-sectional area A₀.',
        },
        {
          label: 'Compressive Strain',
          formula: 'ε_c = |Δh| / h₀ = (h₀ - h) / h₀',
          note: 'h₀ = initial cylindrical height, h = instantaneous height under load (mm).',
        },
        {
          label: 'Ductile Cup-and-Cone Fracture Mechanics',
          formula: 'Central Microvoid Coalescence + 45° Maximum Shear Lips',
          note: 'Hydrostatic triaxial tension initiates central microvoids; shear lips form along maximum shear planes.',
        },
        {
          label: 'Cast Iron Asymmetry (Tension vs Compression)',
          formula: 'UCS ≈ 3 to 4 * UTS',
          note: 'Graphite flakes act as sharp stress-concentrating microcracks in tension, but close and support load in compression.',
        },
      ],
      workedExample: {
        title: 'Compression Strain Evaluation and Barreling Comparison',
        given: [
          'Compression slug: d₀ = 15.0 mm (A₀ = 176.71 mm²), initial height h₀ = 25.0 mm',
          'Applied compressive force F_c = 65.0 kN',
          'Compressed specimen height h = 20.0 mm (axial stroke Δh = 5.0 mm)',
        ],
        steps: [
          'Calculate compressive strain: ε_c = |25.0 - 20.0| / 25.0 = 5.0 / 25.0 = 0.20 (20.0%).',
          'Calculate nominal compressive stress: σ_c = 65,000 N / 176.71 mm² = 367.8 MPa.',
          'In ductile alloys (Al or Cu), interfacial friction locks the ends while the mid-height bulges to ~16.8 mm (barreling).',
          'In gray cast iron ASTM A48, compressive shear failure occurs at ~650 MPa along a 45° shear cone.',
        ],
        answer: 'Compressive Strain = 20.0%, Stress = 367.8 MPa (Barreling Profile)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A standard round tensile specimen with gauge length L₀ = 50.0 mm and diameter d₀ = 12.8 mm is loaded within its linear elastic regime. At an applied tensile load F = 25.0 kN, the extensometer records an elongation ΔL = 0.0485 mm. Calculate the Young’s Modulus (E) of the material in GPa.',
      hint: 'Find initial area A₀ = π/4 * d₀², stress σ = F/A₀, strain ε = ΔL/L₀, and then E = σ/ε in GPa.',
      targetValue: 200.3,
      unit: 'GPa',
      tolerance: 2.0,
      solutionSteps: [
        'A₀ = π * (12.8 mm)² / 4 = 128.68 mm²',
        'σ = 25,000 N / 128.68 mm² = 194.28 MPa',
        'ε = 0.0485 mm / 50.0 mm = 0.000970',
        'E = 194.28 MPa / 0.000970 = 200,288 MPa = 200.3 GPa',
      ],
    },
    {
      id: 'p2',
      prompt:
        'An aluminum 6061-T6 cylindrical specimen has a diameter d₀ = 10.0 mm and a specified 0.2% offset yield strength σ_y = 276.0 MPa. Calculate the axial tensile load (F_yield) in kN required to reach this yield strength.',
      hint: 'F = σ_y * A₀. Divide Newtons by 1,000 to convert to kiloNewtons (kN).',
      targetValue: 21.68,
      unit: 'kN',
      tolerance: 0.2,
      solutionSteps: [
        'A₀ = π * (10.0 mm)² / 4 = 78.54 mm²',
        'F = 276.0 MPa * 78.54 mm² = 21,677 N',
        'F in kN = 21,677 / 1,000 = 21.68 kN',
      ],
    },
    {
      id: 'p3',
      prompt:
        'During a tensile test on a structural steel bar with diameter d₀ = 16.0 mm, the load cell records a peak force F_max = 90.5 kN prior to necking. Determine the Ultimate Tensile Strength (UTS) in MPa.',
      hint: 'UTS = F_max / A₀. Ensure force is in N and area in mm².',
      targetValue: 450.1,
      unit: 'MPa',
      tolerance: 3.0,
      solutionSteps: [
        'A₀ = π * (16.0 mm)² / 4 = 201.06 mm²',
        'F_max = 90.5 kN = 90,500 N',
        'UTS = 90,500 N / 201.06 mm² = 450.1 MPa',
      ],
    },
    {
      id: 'p4',
      prompt:
        'A tensile test specimen has an initial gauge length L₀ = 50.0 mm. After fracture, the two broken pieces are fitted back together and the distance between marks is measured as L_f = 63.8 mm. Calculate the percent elongation (%EL).',
      hint: '%EL = ((L_f - L₀) / L₀) * 100%.',
      targetValue: 27.6,
      unit: '%',
      tolerance: 0.2,
      solutionSteps: [
        'Elongation ΔL = 63.8 mm - 50.0 mm = 13.8 mm',
        '%EL = (13.8 mm / 50.0 mm) * 100% = 27.6%',
      ],
    },
    {
      id: 'p5',
      prompt:
        'A cylindrical tensile specimen with initial diameter d₀ = 12.8 mm undergoes severe necking and fractures with a cup-and-cone surface. The minimum neck diameter measured at fracture is d_f = 8.5 mm. Calculate the percent reduction of area (%RA).',
      hint: '%RA = ((A₀ - A_f) / A₀) * 100% = (1 - (d_f / d₀)²) * 100%.',
      targetValue: 55.9,
      unit: '%',
      tolerance: 0.5,
      solutionSteps: [
        'A₀ = π * (12.8 mm)² / 4 = 128.68 mm²',
        'A_f = π * (8.5 mm)² / 4 = 56.75 mm²',
        '%RA = ((128.68 - 56.75) / 128.68) * 100% = (71.93 / 128.68) * 100% = 55.9%',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'Why is the 0.2% offset yield strength (Rp0.2) widely preferred in engineering design over the proportional limit?',
      options: [
        'Most engineering alloys transition smoothly from elastic to plastic behavior without a sharp inflection, making 0.2% offset an objective, reproducible standard',
        'The proportional limit of metals is physically always zero',
        'At 0.2% strain, metallic specimens fracture instantaneously',
        'ASTM standards prohibit using extensometers during test runs',
      ],
      correctIndex: 0,
      explanation:
        'Most practical alloys (aluminum, heat-treated steel, titanium) exhibit a gradual transition from elastic to plastic flow. The 0.2% strain offset method constructs a parallel line to the modulus slope, providing a rigorous, repeatable convention across laboratories worldwide.',
    },
    {
      id: 'q2',
      question:
        'Why does the engineering stress curve drop after reaching the UTS peak, even though the metal continues to strain-harden?',
      options: [
        'Localized necking rapidly reduces the cross-sectional area, decreasing the overall load required to continue stretching',
        'The crystal lattice of the specimen melts at ambient room temperature',
        'The Young’s Modulus of the material flips to a negative sign',
        'The hydraulic wedge grips begin to slip',
      ],
      correctIndex: 0,
      explanation:
        'Beyond the UTS, localized necking concentrates deformation into a narrow zone whose cross-sectional area contracts faster than strain hardening strengthens the metal. Because engineering stress is calculated using the constant original area A₀, the curve displays an apparent load drop.',
    },
    {
      id: 'q3',
      question:
        'What is the characteristic visual appearance of a ductile tensile fracture in a standard cylindrical steel specimen?',
      options: [
        'A cup-and-cone morphology with fibrous central zone and 45° shear lips',
        'A flat, mirror-like cleavage plane normal to the tensile axis with zero necking',
        'Complete pulverization into fine metal grains',
        'A longitudinal split running parallel to the loading axis',
      ],
      correctIndex: 0,
      explanation:
        'In ductile rupture, triaxial tensile stress creates microvoids at the center of the neck that coalesce into an internal micro-crack. The crack propagates outwards and terminates along 45° planes of maximum resolved shear stress, producing the classic cup-and-cone appearance.',
    },
    {
      id: 'q4',
      question:
        'During a compression test on a cylindrical slug (ASTM E9), what causes the specimen to barrel into a bulge at mid-height?',
      options: [
        'Interfacial friction between the specimen ends and platens restrains radial expansion at contact faces',
        'Thermal expansion caused by internal laser heaters',
        'Crosshead displacement speed being excessively slow',
        'The mass of the test specimen increasing during compression',
      ],
      correctIndex: 0,
      explanation:
        'Frictional shear forces between the hardened compression platens and the specimen ends constrain radial outward flow. Consequently, material near the center of the height—away from the platen friction—expands outwards more freely, producing the characteristic barrel profile.',
    },
    {
      id: 'q5',
      question:
        'Which statement correctly describes Hooke’s Law in the linear elastic regime?',
      options: [
        'Strain is directly proportional to applied stress, and the specimen completely recovers its original dimensions upon unloading',
        'Deformation is entirely permanent and non-recoverable',
        'Stress remains constant regardless of the amount of strain applied',
        'Hooke’s Law only applies after localized necking has initiated',
      ],
      correctIndex: 0,
      explanation:
        'In the linear elastic region, stress and strain are linearly proportional (σ = E · ε). Strain energy is stored reversibly in the stretching of atomic bonds, so removing the load restores the original length without plastic deformation.',
    },
    {
      id: 'q6',
      question:
        'Why does Gray Cast Iron (ASTM A48) exhibit compressive strength that is 3 to 4 times higher than its tensile strength?',
      options: [
        'Sharp graphite flakes act as severe stress-concentrating notches in tension, but close up and transfer load across the matrix in compression',
        'Gray cast iron possesses a higher elastic modulus than titanium',
        'Cast iron undergoes extreme strain hardening in tension',
        'The UTM grips alter the chemical composition of cast iron during compression',
      ],
      correctIndex: 0,
      explanation:
        'Gray cast iron contains sharp flake graphite. Under tensile loading, the flake tips create extreme stress concentrations that trigger rapid brittle cracking. Under compressive loading, the graphite fissures are pressed tightly shut and the surrounding pearlitic/ferritic matrix carries the compressive load effectively.',
    },
  ],
};
