import type { SimulatorMeta } from '../../types/simulator';
import './gearStrengthI18n';

export const gearStrengthMeta: SimulatorMeta = {
  id: 'gear-strength',
  title: 'Gear Strength Simulator (AGMA & Lewis Bending + Contact Stress)',
  shortTitle: 'Gear Strength',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Comprehensive gear transmission analysis simulator. Calculate Lewis and AGMA tooth bending stresses, evaluate Hertzian contact pitting pressures, determine dynamic and load distribution factors, and evaluate safety factors (SF, SH) across case-carburized, induction-hardened, through-hardened steels, cast iron, and bronze gear sets.',
  iconName: 'Cog',
  accentColor: 'violet',
  explore: [
    {
      title: 'Tooth Bending Stress: Lewis Equation & AGMA Formulation',
      summary:
        'Gear tooth bending failure is catastrophic: repeated cyclic cantilever deflection causes high tensile stress at the root fillet on the loaded side, leading to progressive fatigue crack initiation and sudden tooth breakage. Wilfred Lewis (1892) modeled the tooth as a cantilever beam with an inscribed parabola of uniform bending strength. Modern AGMA 2001 / ISO 6336 standards expand the classical Lewis formulation with empirical factors for dynamic impact (Kv), overload shock (Ko), size (Ks), load distribution across the face width (Km), and stress concentration (geometry factor J).',
      equations: [
        {
          label: 'Pinion Torque & Tangential Force',
          formula: 'T₁ = (9549.3 · P) / n₁,   Wₜ = (2000 · T₁) / d₁',
          note: 'P in kW, n₁ in RPM, T₁ in N·m, d₁ (pitch diameter) in mm, Wₜ in N.',
        },
        {
          label: 'Classical Lewis Bending Equation',
          formula: 'σ_L = Wₜ / (b · m · y)',
          note: 'b = face width (mm), m = module (mm), y = dimensionless Lewis form factor based on tooth geometry.',
        },
        {
          label: 'AGMA Tooth Bending Stress Formulation',
          formula: 'σ_b = (Wₜ · K_o · K_v · K_s · K_m) / (b · m_n · J)',
          note: 'K_o = application/shock factor, K_v = dynamic velocity factor, K_s = size factor, K_m = load distribution factor, J = AGMA bending geometry factor.',
        },
        {
          label: 'Bending Fatigue Safety Factor',
          formula: 'S_F = [σ_b] / σ_b',
          note: '[σ_b] = allowable bending fatigue stress of the material (MPa). Recommended S_F ≥ 1.40 for critical machinery.',
        },
      ],
      workedExample: {
        title: 'Calculating Pinion Bending Stress for an Industrial Speed Reducer',
        given: [
          'Transmitted electric motor power P = 15.0 kW at pinion speed n₁ = 1450 RPM',
          'Spur gear pair: normal module m = 4.0 mm, pinion teeth z₁ = 19, face width b = 45 mm',
          'Standard pressure angle α = 20°, AGMA J factor = 0.352',
          'Application factor K_o = 1.25, Dynamic factor K_v = 1.22, Size factor K_s = 1.0, Load distribution K_m = 1.25',
          'Pinion material: Carburized 8620 Alloy Steel ([σ_b] = 410 MPa)',
        ],
        steps: [
          'Calculate pitch diameter: d₁ = z₁ · m = 19 · 4.0 mm = 76.0 mm.',
          'Calculate nominal pinion torque: T₁ = (9549.3 · 15.0) / 1450 = 98.79 N·m.',
          'Calculate nominal tangential force: Wₜ = (2000 · 98.79 N·m) / 76.0 mm = 2599.7 N.',
          'Calculate combined load factor: K_total = K_o · K_v · K_s · K_m = 1.25 · 1.22 · 1.0 · 1.25 = 1.906.',
          'Calculate AGMA bending stress: σ_b = (2599.7 N · 1.906) / (45 mm · 4.0 mm · 0.352) = 4955.0 / 63.36 = 78.2 MPa.',
          'Evaluate bending safety factor: S_F = [σ_b] / σ_b = 410 MPa / 78.2 MPa = 5.24 (Highly Safe).',
        ],
        answer: 'σ_b = 78.2 MPa, S_F = 5.24 (Excellent structural margin against root breakage)',
      },
    },
    {
      title: 'Hertzian Contact Stress & Surface Pitting Durability',
      summary:
        'While tooth root failure causes sudden tooth snapping, the most common operational failure in high-cycle gearing is surface pitting and flank spalling caused by Hertzian contact fatigue. At the instantaneous line of contact along the active involute profile, high localized compressive contact pressures generate intense subsurface shear stresses (τ_max ≈ 0.30 · p_0 at depth ~0.78 · b_Hertz). Cyclic micro-shear causes subsurface fatigue microcracks that propagate to the surface, detaching small crater-like metal flakes (pitting).',
      equations: [
        {
          label: 'AGMA Contact Stress (Pitting Resistance)',
          formula: 'σ_c = Z_E · √[ (Wₜ · K_o · K_v · K_s · K_m) / (d₁ · b · I) ]',
          note: 'Z_E = elastic coefficient (√MPa), I = AGMA surface geometry factor, d₁ = pinion pitch diameter (mm).',
        },
        {
          label: 'Elastic Coefficient (Z_E)',
          formula: 'Z_E = √{ 1 / [ π · ( (1 - ν₁²)/E₁ + (1 - ν₂²)/E₂ ) ] }',
          note: 'For steel-on-steel (E = 206 GPa, ν = 0.30): Z_E ≈ 189.8 √MPa.',
        },
        {
          label: 'Contact Geometry Factor (I) for External Gears',
          formula: 'I = [ (sin α_t · cos α_t) / 2 ] · [ u / (u + 1) ]',
          note: 'u = gear ratio (z₂ / z₁), α_t = transverse pressure angle.',
        },
        {
          label: 'Surface Fatigue Safety Factor',
          formula: 'S_H = [σ_c] / σ_c',
          note: '[σ_c] = allowable contact stress of the material (MPa). Recommended S_H ≥ 1.15 to prevent pitting.',
        },
      ],
      workedExample: {
        title: 'Determining Contact Stress and Pitting Resistance for a 4:1 Gear Set',
        given: [
          'Pinion pitch diameter d₁ = 76.0 mm, face width b = 45 mm, gear ratio u = 4.0 (z₁=19, z₂=76)',
          'Tangential load Wₜ = 2600 N, total load multiplier K_total = 1.906',
          'Pressure angle α = 20° (sin 20° = 0.3420, cos 20° = 0.3398)',
          'Material: Carburized 8620 steel (Z_E = 189.8 √MPa, [σ_c] = 1620 MPa)',
        ],
        steps: [
          'Calculate contact geometry factor I: I = [ (sin 20° · cos 20°) / 2 ] · [ 4.0 / (4.0 + 1) ] = [ (0.3420 · 0.9397) / 2 ] · 0.8 = 0.1607 · 0.8 = 0.1285.',
          'Compute radicand: (Wₜ · K_total) / (d₁ · b · I) = (2600 · 1.906) / (76.0 · 45 · 0.1285) = 4955.6 / 439.47 = 11.276 MPa.',
          'Calculate AGMA contact stress: σ_c = 189.8 · √(11.276) = 189.8 · 3.358 = 637.3 MPa.',
          'Evaluate contact safety factor: S_H = [σ_c] / σ_c = 1620 MPa / 637.3 MPa = 2.54 (Safe from surface pitting).',
        ],
        answer: 'σ_c = 637.3 MPa, S_H = 2.54 (Safe against surface fatigue pitting)',
      },
    },
    {
      title: 'Gear Materials, Heat Treatment & Reliability Margins',
      summary:
        'Selecting the appropriate gear material and heat treatment balances surface fatigue resistance, core bending ductility, and manufacturing economy. Carburized case-hardened alloy steels (such as AISI 8620 and 20MnCr5) provide a rock-hard case (58–62 HRC) with beneficial compressive residual stresses that dramatically impede microcrack initiation, combined with a tough, impact-resistant core. Induction-hardened steels (AISI 4140) offer cost-effective localized tooth flank hardening with minimal distortion. Normalized carbon steels (AISI 1045) suit moderate-load industrial service, while gray cast iron (GG25) provides superior vibration damping and dry galling resistance at lower allowable stresses.',
      equations: [
        {
          label: 'Allowable Bending Fatigue Stress ([σ_b])',
          formula: '[σ_b] = (S_t · Y_N) / (S_F,target · Y_θ · Y_Z)',
          note: 'S_t = AGMA bending fatigue limit, Y_N = life cycle factor, Y_θ = temperature factor, Y_Z = reliability factor.',
        },
        {
          label: 'Allowable Contact Fatigue Stress ([σ_c])',
          formula: '[σ_c] = (S_c · Z_N · Z_W) / (S_H,target · Z_θ · Z_R)',
          note: 'S_c = AGMA contact fatigue limit, Z_N = stress cycle life factor, Z_W = hardness ratio factor.',
        },
        {
          label: 'Power Transmission Capacity Limit',
          formula: 'P_max = min{ P · (S_F / 1.40),  P · (S_H / 1.15)² }',
          note: 'Because contact stress σ_c scales with √P, contact power capacity scales quadratically with S_H.',
        },
      ],
      workedExample: {
        title: 'Selecting Material for a Conveyor Drive Upgrade Under Shock Loading',
        given: [
          'Design requirement: Transmit P = 30 kW at 980 RPM with heavy shock (K_o = 1.60)',
          'Resulting stresses: Bending σ_b = 185 MPa, Contact σ_c = 890 MPa',
          'Candidate A: AISI 1045 Normalized ([σ_b] = 210 MPa, [σ_c] = 620 MPa)',
          'Candidate B: AISI 4140 Induction Hardened ([σ_b] = 330 MPa, [σ_c] = 1250 MPa)',
        ],
        steps: [
          'Evaluate Candidate A (AISI 1045):',
          '  Bending: S_F = 210 / 185 = 1.135 (< 1.40 target, marginal)',
          '  Contact: S_H = 620 / 890 = 0.697 (< 1.0, severe premature surface pitting failure!)',
          'Evaluate Candidate B (AISI 4140 Induction Hardened):',
          '  Bending: S_F = 330 / 185 = 1.784 (≥ 1.40, fully safe)',
          '  Contact: S_H = 1250 / 890 = 1.404 (≥ 1.15, fully safe from pitting)',
          'Conclusion: AISI 1045 will suffer catastrophic early surface spalling. Candidate B (4140 Induction) is mandatory.',
        ],
        answer: 'AISI 4140 Induction Hardened is selected (S_F = 1.78, S_H = 1.40)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A spur pinion with module m = 4.0 mm and z₁ = 20 teeth transmits 22.0 kW of mechanical power at n₁ = 1450 RPM. Calculate the nominal tangential force Wₜ acting at the pitch circle (in Newtons).',
      hint: 'First find the pitch diameter d₁ = z₁ · m, compute nominal torque T₁ = (9549.3 · P) / n₁, then calculate Wₜ = (2000 · T₁) / d₁.',
      targetValue: 3620.0,
      unit: 'N',
      tolerance: 25.0,
      solutionSteps: [
        'Calculate pitch diameter: d₁ = 20 · 4.0 mm = 80.0 mm.',
        'Compute pinion torque: T₁ = (9549.3 · 22.0) / 1450 = 144.89 N·m.',
        'Calculate tangential load: Wₜ = (2000 · 144.89 N·m) / 80.0 mm = 3622.3 N (accepted ~3620 N).',
      ],
    },
    {
      id: 'p2',
      prompt:
        'For a spur gear with pitch diameter d₁ = 76.0 mm running at n₁ = 1450 RPM, calculate the pitch line linear velocity v in meters per second (m/s).',
      hint: 'Pitch line velocity formula is v = (π · d₁ · n₁) / 60,000.',
      targetValue: 5.77,
      unit: 'm/s',
      tolerance: 0.1,
      solutionSteps: [
        'Apply formula: v = (π · 76.0 · 1450) / 60,000.',
        'v = 346,203 / 60,000 = 5.77 m/s.',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A spur gear tooth has face width b = 40 mm, normal module m = 5.0 mm, and AGMA geometry factor J = 0.36. If the effective design tangential load (including all dynamic factors) is Wₜ · K_total = 5400 N, calculate the tooth root bending stress σ_b in MPa.',
      hint: 'Apply the AGMA bending equation: σ_b = (Wₜ · K_total) / (b · m · J).',
      targetValue: 75.0,
      unit: 'MPa',
      tolerance: 1.0,
      solutionSteps: [
        'Denominator: b · m · J = 40 mm · 5.0 mm · 0.36 = 72.0 mm².',
        'Calculate stress: σ_b = 5400 N / 72.0 mm² = 75.0 MPa.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'A gear set made of Carburized 8620 steel has an allowable contact fatigue limit of [σ_c] = 1620 MPa. Under full operating load, the calculated Hertzian contact stress is σ_c = 720 MPa. Calculate the surface contact safety factor S_H.',
      hint: 'Contact safety factor is S_H = [σ_c] / σ_c.',
      targetValue: 2.25,
      unit: '',
      tolerance: 0.05,
      solutionSteps: [
        'Apply safety factor equation: S_H = [σ_c] / σ_c.',
        'S_H = 1620 MPa / 720 MPa = 2.25.',
      ],
    },
    {
      id: 'p5',
      prompt:
        'A gear drive operating at 15.0 kW has a bending safety factor S_F = 3.50 relative to the minimum recommended design margin of 1.40, and a contact safety factor S_H = 1.84 relative to the minimum design margin of 1.15. Calculate the maximum transmissible power P_max (in kW) limited by surface contact durability.',
      hint: 'Recall that contact power capacity scales with the square of the contact safety factor: P_c,max = P · (S_H / 1.15)².',
      targetValue: 38.4,
      unit: 'kW',
      tolerance: 1.0,
      solutionSteps: [
        'Contact safety ratio: 1.84 / 1.15 = 1.60.',
        'Square of ratio: 1.60² = 2.56.',
        'Contact power limit: P_c,max = 15.0 kW · 2.56 = 38.4 kW.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'What was the primary simplification introduced by Wilfred Lewis in his classic 1892 gear tooth bending formula?',
      options: [
        'Treating the gear tooth as a cantilever beam with an inscribed parabola of uniform bending strength',
        'Assuming gear teeth are completely rigid bodies with zero elastic deflection',
        'Modeling the contact flank as an infinite elastic half-space',
        'Assuming friction between meshing teeth is greater than the normal force',
      ],
      correctIndex: 0,
      explanation:
        'Lewis inscribed a parabola inside the gear tooth profile anchored at the root fillet tangent points. Because a parabolic cantilever beam exhibits constant outer-fiber bending stress along its entire length, the point of tangency with the tooth root identifies the critical section of maximum tensile stress.',
    },
    {
      id: 'q2',
      question:
        'Where does the maximum cyclic tensile bending stress occur during gear tooth meshing?',
      options: [
        'At the root fillet on the tensile (loaded) side of the tooth',
        'At the exact pitch point on the contact flank',
        'At the outer tip (crest) of the tooth',
        'Along the central axis of the gear shaft bore',
      ],
      correctIndex: 0,
      explanation:
        'When the meshing contact force pushes against a tooth, the tooth acts as a cantilever beam. Maximum tensile bending stress concentrates at the concave root fillet radius on the loaded side. Fatigue cracks almost invariably initiate at this location.',
    },
    {
      id: 'q3',
      question:
        'Why does surface pitting fatigue (spalling) typically initiate slightly below the pitch line on the tooth flank?',
      options: [
        'Hertzian contact pressure generates peak shear stress (τ_max ≈ 0.30 p₀) at a finite depth beneath the contact surface',
        'Centrifugal force slings all lubricant away from that specific region',
        'The tooth has zero hardness below the pitch line',
        'Bending stresses are maximum at the pitch point',
      ],
      correctIndex: 0,
      explanation:
        'Heinrich Hertz contact mechanics proves that when two curved elastic bodies roll against each other, the maximum shear stress does not occur on the surface, but at a depth of roughly 0.78 times the contact half-width beneath the surface. Cyclic shear causes subsurface microcracking that spreads to the surface.',
    },
    {
      id: 'q4',
      question:
        'How does increasing the pressure angle from 20° to 25° affect gear tooth load capacity?',
      options: [
        'It widens the tooth root, increasing both bending strength and contact resistance, but increases radial bearing load',
        'It reduces root thickness and makes the tooth more prone to breakage',
        'It eliminates the need for any dynamic factor Kv',
        'It converts a spur gear directly into a helical gear',
      ],
      correctIndex: 0,
      explanation:
        'A 25° pressure angle produces a thicker tooth base (wider root) and a larger radius of curvature on the flank, which increases the AGMA geometry factors J (bending) and I (contact). The trade-off is a higher radial force component (Wr = Wt · tan α), which increases bearing loads.',
    },
    {
      id: 'q5',
      question:
        'Why is case-carburized alloy steel (e.g., AISI 8620, 58–62 HRC) considered the gold standard for high-performance transmission gearing?',
      options: [
        'It pairs an ultra-hard wear-resistant case with compressive residual stresses and a ductile shock-resistant core',
        'It is the cheapest and easiest to machine after final heat treatment',
        'It has an elastic modulus three times higher than titanium',
        'It does not require any lubrication during operation',
      ],
      correctIndex: 0,
      explanation:
        'Carburizing diffuses carbon into the surface layer, resulting in martensite with 58–62 HRC hardness and high compressive residual stress (which inhibits crack opening). The low-carbon interior remains tough and ductile to absorb heavy shock loads without brittle fracture.',
    },
    {
      id: 'q6',
      question:
        'What major kinematic advantage do helical gears have over spur gears of identical size and pitch?',
      options: [
        'Gradual progressive tooth engagement with higher contact ratio, reducing vibration, noise, and impact shock',
        'Complete elimination of all axial thrust forces on bearings',
        'Zero friction losses between meshing teeth',
        'Ability to operate without center distance tolerances',
      ],
      correctIndex: 0,
      explanation:
        'In helical gears, contact begins as a point at one end of the tooth and progressively spreads across the face width along an inclined line. This progressive load transfer dramatically softens impact shock, increases the total contact ratio, and enables higher speeds with reduced acoustic noise.',
    },
  ],
};
