import type { SimulatorMeta } from '../../types/simulator';
import './weldStrengthI18n';

export const weldStrengthMeta: SimulatorMeta = {
  id: 'weld-strength',
  title: 'Weld Strength & Joint Stress Simulator',
  shortTitle: 'Weld Strength',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Interactive structural mechanics simulator for welded joints. Evaluate fillet weld throat thickness (a = 0.707s), effective area, shear stress distribution under transverse and parallel loads, eccentric cantilever bracket weld groups with combined direct and secondary torsional shear, and complete/partial penetration butt joints per AWS D1.1 and ISO 2560 standards.',
  iconName: 'Zap',
  accentColor: 'amber',
  explore: [
    {
      title: 'Fillet Weld Geometry: Throat Thickness a = 0.707s & Effective Area',
      summary:
        'A fillet weld joins two overlapping or perpendicular metal surfaces with a roughly triangular bead. Under shear or tension, failure predominantly occurs across the minimum cross-sectional plane through the root to the face: the theoretical throat thickness (a). For standard 45° equal-leg fillet welds, the throat is a = s · cos(45°) ≈ 0.7071s, where s is the leg size. The effective load-bearing area is Aw = a · L_eff.',
      equations: [
        {
          label: 'Theoretical Throat Thickness (Equal Leg)',
          formula: 'a = s * sin(45°) = s / √2 ≈ 0.7071 * s',
          note: 's = leg size (nominal fillet size); a = distance from root to theoretical weld face.',
        },
        {
          label: 'Effective Throat Area',
          formula: 'A_w = a * L_eff * N',
          note: 'L_eff = effective weld length (mm); N = number of weld lines (1 for single, 2 for double fillet).',
        },
        {
          label: 'Average Direct Throat Shear Stress',
          formula: 'τ = F / A_w = F / (0.7071 * s * L_eff * N)',
          note: 'Assumes uniform shear distribution along the throat plane; units in MPa (N/mm²).',
        },
        {
          label: 'AWS Transverse Fillet Enhancement Factor',
          formula: 'F_v(θ) = 0.30 * F_EXX * (1.0 + 0.50 * sin^1.5(θ))',
          note: 'Fillet welds loaded transversely (θ = 90°) provide 50% higher allowable strength than longitudinal welds (θ = 0°).',
        },
      ],
      workedExample: {
        title: 'Designing a Double Fillet Lap Joint for a 120 kN Tensile Member',
        given: [
          'Design load F = 120 kN (120,000 N)',
          'Plate thickness t = 12 mm, available weld width w = 120 mm',
          'Electrode: AWS E7018 (UTS F_EXX = 483 MPa, Allowable shear τ_allow = 144.9 MPa)',
          'Leg size s = 8.0 mm (equal leg fillet on top and bottom lap faces)',
        ],
        steps: [
          'Calculate design throat thickness: a = 0.7071 * 8.0 mm = 5.657 mm.',
          'Required total effective area: A_req = F / τ_allow = 120,000 N / 144.9 MPa = 828.2 mm².',
          'Required total weld length: L_total = A_req / a = 828.2 mm² / 5.657 mm = 146.4 mm.',
          'For a balanced double fillet (top and bottom), length per weld: L = 146.4 / 2 = 73.2 mm.',
          'Specify two 8 mm fillet welds of length L = 80 mm (total L_eff = 160 mm). Actual shear τ = 120,000 / (5.657 * 160) = 132.6 MPa (Safety Factor = 1.09 vs AWS allowable, PASS).',
        ],
        answer: 'Two 8 mm fillet welds, length L ≥ 75 mm each (E7018)',
      },
    },
    {
      title: 'Eccentric Shear & Torsion in Cantilever Bracket Weld Groups',
      summary:
        'When an external force acts at an offset distance (eccentricity e) from the centroid of a weld group, the weld must resist both primary direct shear (τ′) and secondary torsional/bending shear (τ″). Using the unit weld method (Blodgett / Shigley), the weld is modeled as a line of unit throat thickness a = 1 mm to locate the centroid (xc, yc) and determine the unit polar moment of inertia (Ju). The resultant stress is the vector combination of τ′ and τ″.',
      equations: [
        {
          label: 'Primary Direct Shear Stress',
          formula: 'τ′ = F / A_w = F / (a * A_u)',
          note: 'Acts uniformly across the weld group parallel to the applied force vector F.',
        },
        {
          label: 'Secondary Torsional Shear Stress',
          formula: 'τ″ = (M * r_max) / J_w = (F * e * r_max) / (a * J_u)',
          note: 'M = F * e (torsional moment); r_max = distance from centroid to critical outermost weld point.',
        },
        {
          label: 'Unit Polar Moment of Inertia (Two Parallel Welds)',
          formula: 'J_u = (d³ / 6) + (d * b² / 2)  (for 2 vertical lines of height d, spaced b)',
          note: 'Actual polar moment J_w = a * J_u (mm⁴).',
        },
        {
          label: 'Vector Resultant Maximum Shear Stress',
          formula: 'τ_max = √[ (τ″_x)² + (τ′ + τ″_y)² ]',
          note: 'Evaluated at the critical corner point where vertical components reinforce each other.',
        },
      ],
      workedExample: {
        title: 'Evaluating an Eccentric Bracket with Two Vertical Fillet Welds',
        given: [
          'Downward load F = 40 kN (40,000 N) at eccentricity e = 180 mm from weld centerline',
          'Two vertical fillet welds: height d = 200 mm, spaced b = 100 mm apart',
          'Weld leg size s = 10 mm (throat a = 7.071 mm), E7018 electrode (τ_allow = 144.9 MPa)',
        ],
        steps: [
          'Calculate unit area and actual weld area: A_u = 2 * 200 = 400 mm; A_w = 7.071 * 400 = 2,828.4 mm².',
          'Calculate primary direct shear: τ′ = 40,000 N / 2,828.4 mm² = 14.14 MPa (downward).',
          'Calculate unit polar moment: J_u = (200³ / 6) + (200 * 100² / 2) = 1,333,333 + 1,000,000 = 2,333,333 mm³.',
          'Actual polar moment: J_w = a * J_u = 7.071 * 2,333,333 = 1.650 * 10⁷ mm⁴.',
          'Torsional moment: M = 40,000 N * 180 mm = 7,200,000 N·mm.',
          'Critical corner coordinates from centroid (0,0): x = 50 mm, y = 100 mm (r = 111.8 mm).',
          'Secondary shear components: τ″_x = (M * y) / J_w = (7.2e6 * 100) / 1.65e7 = 43.64 MPa (horizontal).',
          'τ″_y = (M * x) / J_w = (7.2e6 * 50) / 1.65e7 = 21.82 MPa (vertical downward).',
          'Resultant peak shear: τ_max = √[ (43.64)² + (14.14 + 21.82)² ] = √[ 1,904.4 + 1,293.1 ] = √3,197.5 = 56.55 MPa.',
          'Compare to allowable: 56.55 MPa < 144.9 MPa (Safety Factor = 2.56, PASS).',
        ],
        answer: 'τ_max = 56.6 MPa (SF = 2.56, Safe under AWS E7018 allowable)',
      },
    },
    {
      title: 'Butt Welds (Groove Welds) & AWS/ISO Allowable Stress Criteria',
      summary:
        'Butt (groove) welds join plates edge-to-edge. Complete Joint Penetration (CJP) welds develop the full strength of the base metal because the effective throat equals the plate thickness (a = t) with full root fusion. Partial Joint Penetration (PJP) welds leave an unfused root and are prohibited in cyclic/fatigue service. Under AWS D1.1 and AISC codes, allowable normal stress in CJP groove welds under tension is 0.60 · Fy, and fillet shear allowable is 0.30 · F_EXX.',
      equations: [
        {
          label: 'Butt Weld Throat Area',
          formula: 'A_w = a * w = (CJP: t, PJP: t_w) * w',
          note: 't = plate thickness (mm); w = plate width (mm); reinforcement crown height is neglected in strength.',
        },
        {
          label: 'Axial Normal Stress',
          formula: 'σ_axial = F / A_w',
          note: 'Direct tension or compression across the groove plane.',
        },
        {
          label: 'In-Plane Bending Stress',
          formula: 'σ_bending = M / Z_w = (6 * M) / (a * w²)',
          note: 'Z_w = section modulus of the weld throat about the in-plane neutral bending axis.',
        },
        {
          label: 'Combined Peak Normal Stress',
          formula: 'σ_max = |σ_axial| + |σ_bending|',
          note: 'Must not exceed the code allowable tensile/compressive limit σ_allow = 0.60 * F_y.',
        },
      ],
      workedExample: {
        title: 'Checking a CJP Groove Splice in an I-Beam Flange under Axial Tension and Bending',
        given: [
          'Plate thickness t = 20 mm, flange width w = 180 mm',
          'Complete Joint Penetration (CJP) Single-V groove weld, E7018 filler (F_y = 400 MPa, σ_allow = 240 MPa)',
          'Applied axial tension F = 360 kN, in-plane bending moment M = 12 kN·m',
        ],
        steps: [
          'Throat thickness for CJP: a = t = 20 mm.',
          'Effective throat area: A_w = 20 mm * 180 mm = 3,600 mm².',
          'Axial tensile stress: σ_axial = 360,000 N / 3,600 mm² = 100.0 MPa.',
          'In-plane section modulus: Z_w = (a * w²) / 6 = (20 * 180²) / 6 = 108,000 mm³.',
          'Bending stress: σ_bending = (12 * 10⁶ N·mm) / 108,000 mm³ = 111.1 MPa.',
          'Total peak tensile stress: σ_max = 100.0 + 111.1 = 211.1 MPa.',
          'Check allowable: σ_max = 211.1 MPa < σ_allow = 240.0 MPa (Safety Factor = 1.14, PASS).',
        ],
        answer: 'σ_max = 211.1 MPa (Allowable: 240 MPa, SF = 1.14)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A structural bracket is joined with an equal-leg fillet weld having a nominal leg size s = 10.0 mm. Calculate the theoretical design throat thickness (a) in mm.',
      hint: 'For an equal-leg 45° fillet weld, a = s * cos(45°) = s / √2 ≈ 0.7071 * s.',
      targetValue: 7.07,
      unit: 'mm',
      tolerance: 0.05,
      solutionSteps: [
        'Throat factor = cos(45°) = 1 / √2 ≈ 0.7071',
        'a = 10.0 mm * 0.7071 = 7.071 mm',
      ],
    },
    {
      id: 'p2',
      prompt:
        'A double fillet lap joint transfers a transverse tensile load F = 120 kN (120,000 N). Both fillet welds have leg size s = 8.0 mm and length L = 150 mm (total effective length L_eff = 300 mm). Compute the average shear stress on the effective throat plane in MPa.',
      hint: 'a = 0.7071 * s; total effective area Aw = a * L_eff; τ = F / Aw.',
      targetValue: 70.7,
      unit: 'MPa',
      tolerance: 1.0,
      solutionSteps: [
        'Throat thickness a = 0.7071 * 8.0 mm = 5.657 mm',
        'Total effective weld length L_eff = 2 * 150 mm = 300 mm',
        'Effective throat area Aw = 5.657 mm * 300 mm = 1,697.1 mm²',
        'Shear stress τ = 120,000 N / 1,697.1 mm² = 70.7 MPa',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A cantilever bracket is welded using two parallel vertical fillet welds of height d = 200 mm, each with leg size s = 10.0 mm (throat a = 7.071 mm). A downward force F = 40 kN acts on the bracket. What is the primary direct shear stress τ′ in MPa across the weld group?',
      hint: 'Primary shear τ′ = F / Aw, where Aw = 2 * a * d.',
      targetValue: 14.1,
      unit: 'MPa',
      tolerance: 0.5,
      solutionSteps: [
        'Throat thickness a = 0.7071 * 10.0 mm = 7.071 mm',
        'Total effective throat area Aw = 2 * 7.071 mm * 200 mm = 2,828.4 mm²',
        'Primary direct shear τ′ = 40,000 N / 2,828.4 mm² = 14.14 MPa',
      ],
    },
    {
      id: 'p4',
      prompt:
        'Two steel plates of thickness t = 16.0 mm and width w = 150.0 mm are spliced with a Complete Joint Penetration (CJP) butt weld. Determine the tensile normal stress σ in MPa under an axial load of F = 360 kN.',
      hint: 'For CJP butt welds, design throat a = plate thickness t. σ = F / (t * w).',
      targetValue: 150.0,
      unit: 'MPa',
      tolerance: 1.0,
      solutionSteps: [
        'Throat area Aw = 16.0 mm * 150.0 mm = 2,400 mm²',
        'Tensile load F = 360,000 N',
        'Axial tensile stress σ = 360,000 N / 2,400 mm² = 150.0 MPa',
      ],
    },
    {
      id: 'p5',
      prompt:
        'According to AWS D1.1 structural welding specifications, the allowable shear stress on the effective throat of a fillet weld made with AWS E7018 electrode (minimum tensile strength F_EXX = 483 MPa / 70 ksi) is 0.30 * F_EXX. Calculate this allowable shear stress limit in MPa.',
      hint: 'Allowable shear τ_allow = 0.30 * 483 MPa.',
      targetValue: 144.9,
      unit: 'MPa',
      tolerance: 0.5,
      solutionSteps: [
        'F_EXX = 483 MPa',
        'Allowable shear τ_allow = 0.30 * 483 MPa = 144.9 MPa',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'Why is the theoretical throat thickness (a = 0.707s) rather than the weld leg size (s) used as the critical dimension in fillet weld strength calculations?',
      options: [
        'The throat plane represents the shortest path through the weld bead and therefore the plane of maximum shear stress and primary rupture',
        'Leg size cannot be measured with standard welding inspection gauges',
        'The electrode metal evaporates along the legs during arc strike',
        'AWS standards require imperial measurements only on leg sizes',
      ],
      correctIndex: 0,
      explanation:
        'The throat plane represents the minimum cross-sectional dimension from the root to the hypotenuse face of the weld triangle (a = s · cos 45° ≈ 0.707s). Under external shear, tension, or bending, the weld fails along this minimum resistance plane.',
    },
    {
      id: 'q2',
      question:
        'Why does AWS D1.1 allow a 50% higher allowable load for a fillet weld loaded transversely compared to longitudinally?',
      options: [
        'The stress state on the transverse throat involves combined normal tension and shear, exhibiting higher ultimate resistance before plastic slip occurs',
        'Transverse welds take longer to deposit than longitudinal welds',
        'Transverse welds are always deposited with submerged arc welding',
        'Longitudinal welds are prohibited in building structures',
      ],
      correctIndex: 0,
      explanation:
        'Extensive research by the Welding Research Council and AWS proved that when the load vector is perpendicular to the weld axis (θ = 90°), the failure plane requires higher energy to propagate compared to pure longitudinal shear (θ = 0°), resulting in approximately 1.5 times greater fracture capacity.',
    },
    {
      id: 'q3',
      question:
        'In an eccentric cantilever bracket weld group, how do primary shear (τ′) and secondary torsional shear (τ″) combine at the critical weld corner?',
      options: [
        'They are added as vector components: horizontal and vertical components are summed, and the peak resultant is the square root of the sum of squares',
        'They are simply multiplied together',
        'Secondary shear always cancels out primary shear completely',
        'Primary shear is ignored if the eccentricity exceeds 100 mm',
      ],
      correctIndex: 0,
      explanation:
        'Primary shear τ′ is uniform and acts downward parallel to the load. Secondary shear τ″ acts perpendicular to the radius vector from the group centroid to each point (τ″ = M·r / J). At the critical corner where the vertical component of τ″ reinforces τ′, they combine vectorially: τ_max = √[ (τ″_x)² + (τ′ + τ″_y)² ].',
    },
    {
      id: 'q4',
      question:
        'What distinguishes a Complete Joint Penetration (CJP) groove weld from a Partial Joint Penetration (PJP) groove weld?',
      options: [
        'CJP extends through the entire thickness of the base metal with 100% fusion across the joint, achieving base-metal strength',
        'CJP requires no weld filler material whatsoever',
        'PJP welds have higher allowable tensile stress than CJP welds',
        'PJP welds are mandatory for high-cycle fatigue applications',
      ],
      correctIndex: 0,
      explanation:
        'A CJP weld achieves complete penetration and fusion through the full plate thickness (a = t), making the joint as strong as the adjacent base plate. In contrast, PJP leaves an unfused root gap that creates severe notch stress concentrations, making PJP unsuitable for critical tension or fatigue.',
    },
    {
      id: 'q5',
      question:
        'Why is the convex reinforcement (weld crown cap) above the plate surface usually excluded from the effective throat thickness calculation?',
      options: [
        'The reinforcement provides negligible additional static strength while introducing a sharp toe angle and notch stress concentration under cyclic fatigue',
        'Weld reinforcement has zero density',
        'Weld inspection calipers cannot reach the crown',
        'The crown is always ground off on all structural steel welds',
      ],
      correctIndex: 0,
      explanation:
        'Code design conventions (AWS D1.1, AISC 360, EN 1993-1-8) neglect the reinforcement crown because it does not reliably increase the effective throat against root fracture and the abrupt toe transition acts as a notch stress concentration (Kt ≈ 1.2–1.6) under fatigue loads.',
    },
    {
      id: 'q6',
      question:
        'What is the standard AWS designation meaning of an "E7018" SMAW stick welding electrode?',
      options: [
        'Electrode (E), 70 ksi (483 MPa) minimum tensile strength (70), all-position welding (1), low-hydrogen iron powder coating with DC+/AC current (8)',
        'Emergency rod (E), 70 mm maximum length (70), single pass (1), 8% carbon content (8)',
        'Export quality (E), 700 MPa yield strength (70), horizontal only (1), 8-gauge core wire (8)',
        'Extruded alloy (E), 70 amp maximum current (70), 1 mm diameter (1), Grade 8 steel (8)',
      ],
      correctIndex: 0,
      explanation:
        'In AWS A5.1: "E" stands for electrode; "70" specifies minimum tensile strength in ksi (70 ksi ≈ 483 MPa); "1" indicates all-position capability (flat, horizontal, vertical-up, overhead); "8" designates low-hydrogen potassium coating with 25–40% iron powder for high-integrity structural welds.',
    },
  ],
};
