import type { SimulatorMeta } from '../../types/simulator';
import './beamBendingI18n';

export const beamBendingMeta: SimulatorMeta = {
  id: 'beam-bending',
  title: 'Beam Bending, Shear Force & Bending Moment (SFD & BMD)',
  shortTitle: 'Beam Bending SFD/BMD',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Interactive mechanics of materials simulator for beam bending, shear force diagrams (SFD), bending moment diagrams (BMD), and elastic deflection curves. Analyze simply supported, cantilever, and overhanging beams with point and distributed loads, cross-section stress distributions, and safety factors against yielding.',
  iconName: 'Ruler',
  accentColor: 'amber',
  explore: [
    {
      title: 'Euler-Bernoulli Beam Theory & Flexure Formula (σ = M·y / I)',
      summary:
        'Under transverse loading, beams experience internal bending moments that induce longitudinal normal stresses varying linearly across the cross-section height. The Euler-Bernoulli hypothesis assumes that plane sections perpendicular to the longitudinal axis remain plane and perpendicular after bending. The classical flexure formula relates normal bending stress σ to the internal bending moment M, distance from the neutral axis y, and area moment of inertia I.',
      equations: [
        {
          label: 'Elastic Flexure Formula',
          formula: 'σ(y) = (M * y) / I',
          note: 'M = bending moment (N·mm), y = distance from neutral axis (mm), I = moment of inertia (mm⁴); stress in MPa.',
        },
        {
          label: 'Maximum Bending Stress & Section Modulus',
          formula: 'σ_max = (M_max * c) / I = M_max / S',
          note: 'c = extreme fiber distance (mm), S = I / c = elastic section modulus (mm³).',
        },
        {
          label: 'Rectangular Section Properties',
          formula: 'I = (b * h³) / 12,   S = (b * h²) / 6',
          note: 'b = width (mm), h = height (mm); neutral axis at mid-depth (c = h/2).',
        },
        {
          label: 'Factor of Safety (FoS) Against Yielding',
          formula: 'FoS = σ_yield / σ_max',
          note: 'FoS ≥ 1.5 indicates safe structural design within the linear elastic regime.',
        },
      ],
      workedExample: {
        title: 'Calculating Maximum Bending Stress in a Wide-Flange Steel Beam',
        given: [
          'Simply supported span length L = 6.0 m',
          'Center concentrated point load P = 40.0 kN (40,000 N)',
          'Steel section modulus S_x = 350 × 10³ mm³ (350 cm³)',
          'ASTM A36 Steel yield strength σ_y = 250 MPa',
        ],
        steps: [
          'Compute maximum bending moment at midspan: M_max = (P * L) / 4 = (40 kN * 6.0 m) / 4 = 60.0 kN·m.',
          'Convert moment to N·mm: M_max = 60.0 × 10⁶ N·mm.',
          'Calculate maximum outer fiber bending stress: σ_max = M_max / S_x = (60.0 × 10⁶ N·mm) / (350 × 10³ mm³) = 171.43 MPa.',
          'Determine the Factor of Safety: FoS = σ_y / σ_max = 250 MPa / 171.43 MPa = 1.46.',
          'The beam remains within the linear elastic range without plastic deformation.',
        ],
        answer: 'σ_max = 171.4 MPa, FoS = 1.46 (Safe in Elastic Range)',
      },
    },
    {
      title: 'Shear Force & Bending Moment Differential Relationships',
      summary:
        'Differential equilibrium of an infinitesimal beam element reveals the exact mathematical relationships linking transverse load intensity w(x), shear force V(x), and bending moment M(x). The derivative of the shear force equals the negative of the distributed load intensity (dV/dx = -w), and the derivative of the bending moment equals the shear force (dM/dx = V). Consequently, peak bending moments occur precisely where the shear force crosses zero.',
      equations: [
        {
          label: 'Load to Shear Relationship',
          formula: 'dV / dx = -w(x)',
          note: 'The slope of the shear force diagram at any point is equal to the negative distributed load intensity.',
        },
        {
          label: 'Shear to Moment Relationship',
          formula: 'dM / dx = V(x)',
          note: 'The slope of the bending moment diagram at any point equals the internal shear force.',
        },
        {
          label: 'Integral Moment Change (Area Under SFD)',
          formula: 'ΔM = M(x₂) - M(x₁) = ∫ V(x) dx',
          note: 'The change in bending moment between two points equals the net area under the shear force curve.',
        },
        {
          label: 'Peak Moment Condition',
          formula: 'dM / dx = 0  =>  V(x) = 0',
          note: 'Local maxima and minima of bending moment occur where the shear force diagram crosses zero.',
        },
      ],
      workedExample: {
        title: 'Determining Peak Bending Moment from Shear Force Diagram for a Uniform Load',
        given: [
          'Simply supported beam span L = 5.0 m',
          'Uniformly distributed load w = 16.0 kN/m across the full span',
        ],
        steps: [
          'Calculate vertical reaction forces: R_A = R_B = (w * L) / 2 = (16.0 kN/m * 5.0 m) / 2 = 40.0 kN.',
          'Formulate the shear force function: V(x) = R_A - w * x = 40.0 - 16.0 * x (in kN).',
          'Find zero-shear location: V(x) = 0 => 40.0 - 16.0 * x = 0 => x = 2.50 m (exact midspan).',
          'Compute the moment from the triangular area of the SFD between x = 0 and x = 2.5 m: Area = 0.5 * base * height = 0.5 * 2.5 m * 40.0 kN = 50.0 kN·m.',
          'Verify with standard analytical formula: M_max = (w * L²) / 8 = (16.0 * 5.0²) / 8 = 50.0 kN·m.',
        ],
        answer: 'M_max = 50.0 kN·m at x = 2.50 m (Zero Shear Location)',
      },
    },
    {
      title: 'Euler-Bernoulli Beam Deflection & Elastic Stiffness (E·I)',
      summary:
        'Serviceability Limit States (SLS) mandate that structural beams do not exhibit excessive elastic deflection that could crack ceilings, damage equipment, or induce aesthetic distress. The governing differential equation d²v/dx² = M(x) / (E·I) relates curvature to the flexural rigidity E·I. Double integration subjected to geometric boundary conditions yields the complete elastic curve δ(x).',
      equations: [
        {
          label: 'Beam Curvature & Differential Deflection',
          formula: 'd²v / dx² = M(x) / (E * I)',
          note: 'v(x) = elastic deflection, E = Young’s modulus (GPa), I = moment of inertia (mm⁴).',
        },
        {
          label: 'Center Deflection — Point Load (Simply Supported)',
          formula: 'δ_max = (P * L³) / (48 * E * I)',
          note: 'P = center concentrated load (N), L = span (mm); yields maximum deflection at midspan.',
        },
        {
          label: 'Center Deflection — Uniform Load (Simply Supported)',
          formula: 'δ_max = (5 * w * L⁴) / (384 * E * I)',
          note: 'w = load intensity (N/mm), L = span (mm); standard case for floor joists and girders.',
        },
        {
          label: 'Tip Deflection — Point Load (Cantilever)',
          formula: 'δ_max = (P * L³) / (3 * E * I)',
          note: 'P = tip concentrated load (N); maximum deflection occurs at the free end.',
        },
      ],
      workedExample: {
        title: 'Calculating Midspan Deflection and Verifying L/360 Serviceability Limit',
        given: [
          'Span L = 4.0 m = 4000 mm simply supported beam',
          'Steel section with E = 200 GPa (200,000 N/mm²), I_x = 21.4 × 10⁶ mm⁴',
          'Center concentrated load P = 25.0 kN = 25,000 N',
          'Architectural deflection limit: δ_allow = L / 360',
        ],
        steps: [
          'Compute flexural rigidity: E·I = 200,000 N/mm² * 21.4 × 10⁶ mm⁴ = 4.28 × 10¹² N·mm².',
          'Calculate midspan deflection: δ_max = (P * L³) / (48 * E * I) = (25,000 * 4000³) / (48 * 4.28 × 10¹²) = (1.60 × 10¹⁵) / (2.0544 × 10¹⁴) = 7.79 mm.',
          'Compute allowable deflection limit: δ_allow = 4000 mm / 360 = 11.11 mm.',
          'Check condition: 7.79 mm ≤ 11.11 mm, satisfying the serviceability criteria with a comfortable margin.',
        ],
        answer: 'δ_max = 7.79 mm ≤ 11.11 mm (Passes L/360 limit)',
      },
    },
    {
      title: 'Cross-Section Optimization: I-Beam vs Solid Rectangle vs Circular',
      summary:
        'Structural efficiency in bending is dictated by how effectively cross-sectional area is distributed relative to the neutral axis. Since bending strain and stress are zero at the centroidal axis and reach their maximum at the outer fibers (y = ±c), material placed near the neutral axis contributes negligibly to bending resistance while adding self-weight. Flanged sections such as I-beams concentrate material in the flanges where stresses are highest, achieving maximum section modulus per kilogram of material.',
      equations: [
        {
          label: 'Section Efficiency Factor (ρ)',
          formula: 'ρ = I / (A * c²)',
          note: 'Dimensionless ratio; measures how far area is concentrated away from neutral axis.',
        },
        {
          label: 'Solid Rectangle vs Solid Circle',
          formula: 'ρ_rect = 1 / 3 ≈ 0.333,   ρ_circle = 1 / 4 = 0.250',
          note: 'A solid circular bar is 25% less efficient in bending than a solid rectangle of equal depth.',
        },
        {
          label: 'Wide-Flange I-Beam Efficiency',
          formula: 'ρ_I-beam ≈ 0.55 - 0.70',
          note: 'Thin web and heavy flanges provide up to twice the bending stiffness of a solid bar of identical weight.',
        },
      ],
      workedExample: {
        title: 'Weight Reduction Achieved by an I-Beam Compared to a Solid Rectangle',
        given: [
          'Applied design bending moment M = 30.0 kN·m',
          'Allowable bending stress σ_allow = 150 MPa',
          'Required section modulus S_req = M / σ_allow = 30.0 × 10⁶ / 150 = 200,000 mm³',
          'I-Beam option (depth d = 200 mm): S_x = 202,000 mm³, cross-sectional area A_I = 2,425 mm²',
          'Solid rectangle of equal depth (h = 200 mm): S = (b * h²) / 6 => b = 30 mm, area A_rect = 6,000 mm²',
        ],
        steps: [
          'Both sections provide equivalent flexural capacity (~200,000 mm³).',
          'Compare cross-sectional areas: A_I = 2,425 mm² vs A_rect = 6,000 mm².',
          'Calculate mass ratio: A_I / A_rect = 2,425 / 6,000 = 0.404 (40.4%).',
          'Weight savings: 100% - 40.4% = 59.6% reduction in beam weight for the exact same load capacity.',
        ],
        answer: '59.6% Weight Reduction using optimized I-Beam section',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A 4.0 m simply supported beam carries a single concentrated load P = 24.0 kN positioned 1.0 m from the left support A. Calculate the reaction force at support A (R_A) in kN.',
      hint: 'Sum moments about support B (x = 4.0 m): R_A * L = P * (L - a).',
      targetValue: 18.0,
      unit: 'kN',
      tolerance: 0.2,
      solutionSteps: [
        'Establish moment equilibrium about support B: ΣM_B = 0.',
        'Equation: R_A * 4.0 m - 24.0 kN * (4.0 m - 1.0 m) = 0.',
        'R_A * 4.0 = 24.0 * 3.0 = 72.0 kN·m.',
        'R_A = 72.0 / 4.0 = 18.0 kN.',
      ],
    },
    {
      id: 'p2',
      prompt:
        'A 6.0 m simply supported beam carries a uniformly distributed load w = 10.0 kN/m across its entire span. Compute the maximum bending moment (M_max) in kN·m.',
      hint: 'For a simply supported beam with full UDL, maximum moment occurs at midspan and equals (w * L²) / 8.',
      targetValue: 45.0,
      unit: 'kN·m',
      tolerance: 0.5,
      solutionSteps: [
        'Apply the standard maximum bending moment formula: M_max = (w * L²) / 8.',
        'Substitute values: w = 10.0 kN/m, L = 6.0 m.',
        'M_max = (10.0 * 6.0²) / 8 = (10.0 * 36.0) / 8 = 360.0 / 8 = 45.0 kN·m.',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A 2.5 m cantilever beam with section modulus S_x = 125 × 10³ mm³ carries an end point load P = 8.0 kN at its free tip. Calculate the maximum bending stress (σ_max) at the fixed support in MPa.',
      hint: 'For a cantilever, maximum moment is at the fixed root: M_max = P * L. Then σ_max = M_max / S_x.',
      targetValue: 160.0,
      unit: 'MPa',
      tolerance: 1.0,
      solutionSteps: [
        'Compute maximum root moment: M_max = P * L = 8.0 kN * 2.5 m = 20.0 kN·m.',
        'Convert moment to N·mm: M_max = 20.0 × 10⁶ N·mm.',
        'Calculate maximum bending stress: σ_max = M_max / S_x = (20.0 × 10⁶ N·mm) / (125 × 10³ mm³) = 160.0 MPa.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'Calculate the elastic section modulus S_x (in cm³) for a rectangular timber beam with width b = 120 mm and height h = 200 mm.',
      hint: 'Formula for rectangular section modulus: S_x = (b * h²) / 6. Convert mm³ to cm³ by dividing by 1,000.',
      targetValue: 800.0,
      unit: 'cm³',
      tolerance: 5.0,
      solutionSteps: [
        'Use the section modulus formula: S_x = (b * h²) / 6.',
        'Substitute dimensions: b = 120 mm, h = 200 mm.',
        'S_x = (120 * 200²) / 6 = (120 * 40,000) / 6 = 4,800,000 / 6 = 800,000 mm³.',
        'Convert to cm³: 800,000 mm³ / 1,000 = 800.0 cm³.',
      ],
    },
    {
      id: 'p5',
      prompt:
        'A 3.0 m steel beam (E = 200 GPa, I = 15.0 × 10⁶ mm⁴) supports a center concentrated load P = 16.0 kN. Calculate the maximum midspan deflection (δ_max) in mm.',
      hint: 'Formula: δ_max = (P * L³) / (48 * E * I). Ensure consistent units (N, mm).',
      targetValue: 3.0,
      unit: 'mm',
      tolerance: 0.1,
      solutionSteps: [
        'Convert parameters to base units: P = 16,000 N, L = 3,000 mm, E = 200,000 N/mm², I = 15.0 × 10⁶ mm⁴.',
        'Numerator: P * L³ = 16,000 * 3,000³ = 16,000 * 2.7 × 10¹⁰ = 4.32 × 10¹⁴ N·mm³.',
        'Denominator: 48 * E * I = 48 * 200,000 * 15.0 × 10⁶ = 1.44 × 10¹⁴ N·mm².',
        'Calculate deflection: δ_max = (4.32 × 10¹⁴) / (1.44 × 10¹⁴) = 3.00 mm.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'At what point along a loaded beam does the internal bending moment reach a local maximum or minimum?',
      options: [
        'Where the internal shear force V(x) crosses zero (V = 0)',
        'Where the deflection of the beam is strictly zero',
        'Directly under the pin support only',
        'At the point of minimum cross-sectional area',
      ],
      correctIndex: 0,
      explanation:
        'Because dM/dx = V(x), the derivative of bending moment equals the shear force. From basic calculus, a function reaches its local extrema where its first derivative is zero; hence peak bending moments always occur where the shear force crosses zero.',
    },
    {
      id: 'q2',
      question:
        'Why is an I-beam (wide flange) cross-section significantly more structurally efficient in bending than a solid square bar of the same weight?',
      options: [
        'Its heavy flanges place the majority of the material at the maximum distance (y = ±c) from the neutral axis, maximizing moment of inertia I',
        'The web contains air pockets that reduce internal thermal stresses',
        'I-beams have a lower Young’s Modulus which allows them to bend without resisting',
        'I-beams can only be loaded in pure torsion, avoiding bending moments entirely',
      ],
      correctIndex: 0,
      explanation:
        'Bending stresses increase linearly with distance from the neutral axis (σ = M·y / I). The neutral axis carries zero stress. An I-beam concentrates the bulk of its material in the outer flanges where stress is highest, drastically maximizing both I and S = I/c for a given mass.',
    },
    {
      id: 'q3',
      question:
        'What are the kinematic boundary conditions for shear force V and bending moment M at the free unrestrained tip of a cantilever beam?',
      options: [
        'Both shear force and bending moment are zero (V = 0, M = 0)',
        'Shear force is maximum and bending moment is zero',
        'Bending moment is maximum and shear force is zero',
        'Deflection is zero and slope is 90 degrees',
      ],
      correctIndex: 0,
      explanation:
        'Because the tip of a cantilever beam is completely free and unconstrained with no reactions or applied concentrated end couples, internal equilibrium dictates that both the shear force and bending moment must equal zero at the free boundary.',
    },
    {
      id: 'q4',
      question:
        'In a simply supported beam subjected to downward gravity loading (positive sagging moment), what are the stress states on the upper and lower surfaces?',
      options: [
        'Upper surface is in compression (σ < 0), lower surface is in tension (σ > 0)',
        'Upper surface is in tension, lower surface is in compression',
        'Both surfaces experience equal pure tensile stresses',
        'Both surfaces experience pure shear stress with zero normal stress',
      ],
      correctIndex: 0,
      explanation:
        'Sagging curvature compresses the fibers located above the neutral axis (producing compressive stress σ < 0) and elongates the fibers located below the neutral axis (producing tensile stress σ > 0). The neutral axis itself undergoes zero normal stress.',
    },
    {
      id: 'q5',
      question:
        'How is the change in bending moment between two cross-sections (ΔM = M₂ - M₁) represented geometrically on the Shear Force Diagram (SFD)?',
      options: [
        'The net area enclosed by the shear force curve between those two cross-sections',
        'The slope of the line connecting the two reaction points',
        'The difference between the maximum and minimum shear peaks',
        'The length of the beam divided by the number of applied loads',
      ],
      correctIndex: 0,
      explanation:
        'Since dM/dx = V(x), integrating both sides yields ΔM = ∫ V(x) dx. Geometrically, the definite integral of V(x) represents the exact signed area under the Shear Force Diagram between sections x₁ and x₂.',
    },
    {
      id: 'q6',
      question:
        'What occurs in a structural steel beam when the applied bending stress exceeds the material’s yield strength (Factor of Safety < 1.0)?',
      options: [
        'The extreme outer fibers undergo permanent plastic deformation, leading to permanent set and potential plastic hinge formation',
        'The beam immediately snaps violently like glass without any prior deformation',
        'The moment of inertia of the cross-section instantaneously quadruples',
        'The Young’s modulus of the steel permanently doubles',
      ],
      correctIndex: 0,
      explanation:
        'Ductile structural steels (such as ASTM A36) yield when σ_max > σ_y. Plastic flow initiates at the extreme outer fibers and progresses inwards toward the neutral axis. The beam fails to recover its initial straight shape upon unloading, retaining permanent deformation.',
    },
  ],
};
