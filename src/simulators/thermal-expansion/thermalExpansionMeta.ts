import type { SimulatorMeta } from '../../types/simulator';
import './thermalExpansionI18n';

export const thermalExpansionMeta: SimulatorMeta = {
  id: 'thermal-expansion',
  title: 'Thermal Expansion & Shrink Fit Simulator',
  shortTitle: 'Thermal Expansion',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  description:
    'Interactive thermo-mechanical physics simulator. Investigate linear and volumetric thermal expansion, restrained thermal stress with expansion gaps, industrial interference shrink fit assembly on shafts, and Timoshenko bimetallic strip thermostat deflection.',
  iconName: 'Flame',
  accentColor: 'orange',
  explore: [
    {
      title: 'Linear & Volumetric Thermal Expansion',
      summary:
        'When temperature increases, average interatomic spacing increases due to the asymmetric potential energy well of atomic bonds. For isotropic solid materials, linear expansion is directly proportional to initial length (L₀) and temperature change (ΔT = T - T₀). Volumetric expansion accounts for 3-dimensional expansion, where the volumetric coefficient is approximately three times the linear coefficient (β ≈ 3α).',
      equations: [
        {
          label: 'Linear Thermal Expansion',
          formula: 'ΔL = α * L₀ * ΔT',
          note: 'α = coefficient of linear thermal expansion (1/°C or µm/(m·°C)), L₀ = initial length (mm), ΔT = temperature change (°C).',
        },
        {
          label: 'Final Length',
          formula: 'L = L₀ * (1 + α * ΔT)',
          note: 'Represents the expanded length under free, unconstrained thermal conditions.',
        },
        {
          label: 'Volumetric Thermal Expansion',
          formula: 'ΔV = β * V₀ * ΔT ≈ 3 * α * V₀ * ΔT',
          note: 'β = coefficient of volumetric thermal expansion; for isotropic solids β ≈ 3α.',
        },
        {
          label: 'Areal Thermal Expansion',
          formula: 'ΔA = γ * A₀ * ΔT ≈ 2 * α * A₀ * ΔT',
          note: 'γ = areal coefficient of expansion; applies to plate surface areas and hole diameters.',
        },
      ],
      workedExample: {
        title: 'Thermal Expansion of an Outdoor Steel Bridge Girder',
        given: [
          'Initial girder length L₀ = 40.0 m (40,000 mm)',
          'Structural Steel ASTM A36: α = 12.0 × 10⁻⁶ / °C',
          'Winter minimum temperature T_min = -10.0 °C',
          'Summer maximum temperature T_max = +45.0 °C',
          'Temperature range ΔT = 45.0 - (-10.0) = 55.0 °C',
        ],
        steps: [
          'Identify initial length in mm: L₀ = 40,000 mm.',
          'Calculate total temperature change: ΔT = 55.0 °C.',
          'Apply linear expansion formula: ΔL = α * L₀ * ΔT.',
          'Substitute values: ΔL = (12.0 × 10⁻⁶ / °C) * 40,000 mm * 55.0 °C = 26.4 mm.',
          'To prevent structural distortion, the expansion joint must accommodate at least 26.4 mm of free travel.',
        ],
        answer: 'ΔL = 26.4 mm (Girder expands by 26.4 mm over the annual cycle)',
      },
    },
    {
      title: 'Restrained Thermal Stress & Abutment Expansion Gaps',
      summary:
        'If a body expands freely under temperature rise, zero mechanical stress develops (thermal strain is uninhibited). However, if expansion is partially or fully restrained by rigid supports or adjacent machinery, the structure develops compressive thermal stress. If an initial gap (δ_gap) exists, stress only initiates once the free thermal expansion closes the gap.',
      equations: [
        {
          label: 'Free Thermal Strain',
          formula: 'ε_th = α * ΔT',
          note: 'Natural unconstrained elongation per unit length caused by thermal energy.',
        },
        {
          label: 'Restrained Stress with Expansion Gap',
          formula: 'σ_th = E * (α * ΔT - δ_gap / L₀)   [when α * L₀ * ΔT > δ_gap]',
          note: 'E = Young’s Modulus (MPa), δ_gap = initial clearance gap (mm). σ_th = 0 when free expansion ≤ δ_gap.',
        },
        {
          label: 'Axial Thrust Force on Supports',
          formula: 'F = σ_th * A',
          note: 'F = axial compressive thrust (N), A = cross-sectional area of the bar (mm²).',
        },
        {
          label: 'Fully Constrained Thermal Stress (Zero Gap)',
          formula: 'σ_th = E * α * ΔT',
          note: 'Maximum compressive stress when both ends are rigidly clamped without allowance for expansion.',
        },
      ],
      workedExample: {
        title: 'Thermal Compressive Stress in Restrained Aluminum Piping',
        given: [
          'Aluminum 6061-T6 bar: E = 68.9 GPa (68,900 MPa), α = 23.6 × 10⁻⁶ / °C',
          'Bar length L₀ = 1500 mm, installed at room temperature T₀ = 20 °C',
          'Initial gap to rigid wall δ_gap = 1.20 mm',
          'Operating temperature reaches T = 80 °C (ΔT = 60 °C)',
        ],
        steps: [
          'Calculate free expansion: ΔL_free = α * L₀ * ΔT = 23.6 × 10⁻⁶ * 1500 mm * 60 °C = 2.124 mm.',
          'Check gap closure: ΔL_free (2.124 mm) > δ_gap (1.20 mm), so the bar makes solid contact with the wall.',
          'Calculate restrained displacement: ΔL_restrained = 2.124 mm - 1.20 mm = 0.924 mm.',
          'Calculate mechanical compressive strain: ε_mech = 0.924 mm / 1500 mm = 0.000616 mm/mm.',
          'Compute compressive stress: σ = E * ε_mech = 68,900 MPa * 0.000616 = 42.44 MPa.',
        ],
        answer: 'σ_th = 42.4 MPa (Compressive stress against rigid abutment)',
      },
    },
    {
      title: 'Interference Shrink Fit & Bimetallic Strips',
      summary:
        'Thermal expansion is harnessed in precision manufacturing for shrink-fit assemblies (heating hubs or cryo-cooling shafts to slip together without galling, generating enormous friction torque capacity upon thermal equalization). In bimetallic strips, two bonded metals with differing expansion coefficients produce controlled bending curvature (Timoshenko bimetal theory), driving thermostats, thermal relays, and circuit breakers.',
      equations: [
        {
          label: 'Shrink Fit Assembly Heating ΔT',
          formula: 'ΔT_req = (δ + c_assembly) / (α_hub * d)',
          note: 'δ = diametral interference (mm), c_assembly = clearance margin (typically 0.02 mm), d = nominal shaft diameter.',
        },
        {
          label: 'Lamé Interference Contact Pressure (Solid Shaft)',
          formula: 'p_c = δ / [ d * ( (1 - ν_s)/E_s + (1/E_h) * ((D_o² + d²)/(D_o² - d²) + ν_h) ) ]',
          note: 'D_o = hub outer diameter, d = shaft diameter, E_s/E_h = moduli, ν_s/ν_h = Poisson ratios.',
        },
        {
          label: 'Torque Transmission Capacity',
          formula: 'T_cap = 0.5 * π * μ * p_c * L * d²',
          note: 'μ = interfacial friction coefficient, L = hub axial engagement length (mm).',
        },
        {
          label: 'Timoshenko Bimetallic Strip Curvature & Deflection',
          formula: 'κ = 1/ρ = 6(α₁ - α₂)ΔT(1+m)² / [h·denom],   δ_tip ≈ κ * L₀² / 2',
          note: 'm = t₁/t₂, h = t₁ + t₂ (total thickness), L₀ = cantilever strip length, δ_tip = tip deflection.',
        },
      ],
      workedExample: {
        title: 'Bimetallic Thermostat Strip Tip Deflection Calculation',
        given: [
          'Cantilever strip length L₀ = 100 mm, total thickness h = 1.0 mm (t₁ = t₂ = 0.5 mm, m = 1.0)',
          'Layer 1 (Brass C360): α₁ = 20.5 × 10⁻⁶ / °C, E₁ = 105 GPa',
          'Layer 2 (Invar 36): α₂ = 1.2 × 10⁻⁶ / °C, E₂ = 145 GPa',
          'Temperature elevation ΔT = 50.0 °C',
        ],
        steps: [
          'Calculate modulus ratio: n = E₁ / E₂ = 105 / 145 = 0.7241.',
          'With m = 1, denominator factor: 14 + n + 1/n = 14 + 0.7241 + (1 / 0.7241) = 16.105.',
          'Compute differential expansion: Δα = (20.5 - 1.2) × 10⁻⁶ = 19.3 × 10⁻⁶ / °C.',
          'Calculate curvature κ: κ = (24 * 19.3 × 10⁻⁶ * 50) / (1.0 mm * 16.105) = 0.001438 mm⁻¹.',
          'Calculate cantilever tip deflection: δ_tip = κ * L₀² / 2 = 0.001438 * (100)² / 2 = 7.19 mm.',
        ],
        answer: 'δ_tip = 7.19 mm (Strip curls toward the low-expansion Invar side)',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'A structural steel bridge beam (ASTM A36, α = 12.0 × 10⁻⁶ / °C) has an initial length L₀ = 40.0 m. Over the seasonal cycle, its temperature rises by ΔT = 55.0 °C. Calculate the free linear thermal expansion (ΔL) in mm.',
      hint: 'Apply ΔL = α * L₀ * ΔT. Convert 40.0 m to 40,000 mm before multiplying.',
      targetValue: 26.4,
      unit: 'mm',
      tolerance: 0.3,
      solutionSteps: [
        'L₀ = 40.0 m = 40,000 mm',
        'ΔT = 55.0 °C',
        'ΔL = (12.0 × 10⁻⁶ / °C) * 40,000 mm * 55.0 °C',
        'ΔL = 26.4 mm',
      ],
    },
    {
      id: 'p2',
      prompt:
        'An aluminum 6061-T6 cylindrical bar (E = 68.9 GPa, α = 23.6 × 10⁻⁶ / °C, L₀ = 1500 mm) is installed with an initial gap δ_gap = 1.20 mm from a rigid abutment. The bar undergoes a temperature rise ΔT = 60.0 °C. Calculate the resulting compressive thermal stress (σ_th) in MPa.',
      hint: 'First find free expansion ΔL_free = α * L₀ * ΔT. Then restrained displacement is ΔL_free - δ_gap. Stress σ = E * (ΔL_restrained / L₀).',
      targetValue: 42.4,
      unit: 'MPa',
      tolerance: 0.5,
      solutionSteps: [
        'ΔL_free = 23.6 × 10⁻⁶ * 1500 mm * 60.0 °C = 2.124 mm',
        'Since 2.124 mm > 1.20 mm, the gap closes and restraint occurs',
        'Restrained deformation = 2.124 mm - 1.20 mm = 0.924 mm',
        'Thermal strain ε = 0.924 mm / 1500 mm = 0.000616',
        'Thermal stress σ = 68,900 MPa * 0.000616 = 42.44 MPa',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A solid carbon steel tie rod with diameter d = 50.0 mm (A = 1963.5 mm², E = 200.0 GPa, α = 12.0 × 10⁻⁶ / °C) is clamped rigidly at both ends with zero clearance gap. If the temperature increases by ΔT = 40.0 °C, calculate the axial compressive thrust force (F) exerted on the end supports in kN.',
      hint: 'First calculate thermal stress σ = E * α * ΔT in MPa. Then multiply by cross-sectional area A and divide by 1000 for kN.',
      targetValue: 188.5,
      unit: 'kN',
      tolerance: 1.5,
      solutionSteps: [
        'σ = E * α * ΔT = 200,000 MPa * (12.0 × 10⁻⁶ / °C) * 40.0 °C = 96.0 MPa',
        'Cross-sectional area A = π * (50 mm)² / 4 = 1963.5 mm²',
        'Axial force F = σ * A = 96.0 N/mm² * 1963.5 mm² = 188,496 N',
        'F in kN = 188,496 / 1000 = 188.5 kN',
      ],
    },
    {
      id: 'p4',
      prompt:
        'A steel hub with nominal bore diameter d = 80.0 mm is to be shrink-fitted onto a shaft with 0.08 mm (80 µm) diametral interference. An assembly clearance margin of 0.03 mm is required to easily slide the hub on. The hub steel has α = 12.0 × 10⁻⁶ / °C. Calculate the required temperature elevation (ΔT) of the hub in °C.',
      hint: 'Total bore expansion required Δd = interference (0.08 mm) + clearance margin (0.03 mm) = 0.11 mm. Then ΔT = Δd / (α * d).',
      targetValue: 114.6,
      unit: '°C',
      tolerance: 1.0,
      solutionSteps: [
        'Required diametral expansion Δd = 0.08 mm + 0.03 mm = 0.11 mm',
        'Δd = α * d * ΔT  =>  ΔT = Δd / (α * d)',
        'ΔT = 0.11 mm / (12.0 × 10⁻⁶ / °C * 80.0 mm) = 0.11 / 0.00096 = 114.58 °C',
      ],
    },
    {
      id: 'p5',
      prompt:
        'A bimetallic cantilever thermostat strip has length L₀ = 100 mm and equal layer thicknesses t₁ = t₂ = 0.5 mm (total h = 1.0 mm). Layer 1 is Brass C360 (α₁ = 20.5 × 10⁻⁶ / °C, E₁ = 105 GPa) and Layer 2 is Invar 36 (α₂ = 1.2 × 10⁻⁶ / °C, E₂ = 145 GPa). When heated by ΔT = 50.0 °C, calculate the tip deflection (δ_tip) in mm.',
      hint: 'Use Timoshenko bimetallic formula for curvature κ and then cantilever tip deflection δ_tip = (κ * L₀²) / 2.',
      targetValue: 7.19,
      unit: 'mm',
      tolerance: 0.15,
      solutionSteps: [
        'Modulus ratio n = E₁ / E₂ = 105 / 145 = 0.7241',
        'Denominator factor = 14 + n + 1/n = 14 + 0.7241 + 1.3810 = 16.105',
        'Δα = 20.5 × 10⁻⁶ - 1.2 × 10⁻⁶ = 19.3 × 10⁻⁶ / °C',
        'Curvature κ = (24 * Δα * ΔT) / (h * 16.105) = (24 * 19.3 × 10⁻⁶ * 50) / 16.105 = 0.001438 mm⁻¹',
        'Tip deflection δ_tip = (κ * L₀²) / 2 = 0.001438 * (100)² / 2 = 7.19 mm',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'Under what condition does a solid metallic bar experience zero thermal stress when subjected to a 100 °C temperature increase?',
      options: [
        'When both ends are completely free to expand without any external kinematic restraint',
        'When the bar is clamped rigidly between two immovable concrete walls',
        'When the material has an extremely high Young’s Modulus',
        'When the bar is painted with thermal insulation paint',
      ],
      correctIndex: 0,
      explanation:
        'Thermal stress only arises when natural thermal strain (ε_th = α·ΔT) is restrained by external supports or adjacent material. If the bar is unrestrained, it simply changes length freely with zero internal mechanical stress.',
    },
    {
      id: 'q2',
      question:
        'For an isotropic solid material, how is the volumetric thermal expansion coefficient (β) related to the linear coefficient (α)?',
      options: [
        'β ≈ 3 * α',
        'β ≈ α / 3',
        'β = α²',
        'β = 2 * α',
      ],
      correctIndex: 0,
      explanation:
        'Because volumetric expansion occurs equally across three orthogonal spatial dimensions (x, y, z), V = V₀(1 + αΔT)³ ≈ V₀(1 + 3αΔT). Therefore, β ≈ 3α for isotropic materials.',
    },
    {
      id: 'q3',
      question:
        'Why does the nickel-iron alloy Invar 36 (FeNi36) exhibit an exceptionally low thermal expansion coefficient (α ≈ 1.2 × 10⁻⁶ / °C)?',
      options: [
        'Spontaneous volume magnetostriction contracts the crystal lattice, almost exactly cancelling normal thermal phonon expansion',
        'It has an infinite Young’s Modulus that physically prevents atomic movement',
        'It contains microscopic vacuum pockets that absorb heat energy',
        'Its atoms do not vibrate at temperatures above 0 °C',
      ],
      correctIndex: 0,
      explanation:
        'The "Invar effect" arises from a quantum magnetic phenomenon: as temperature rises and normal thermal vibrations push atoms apart, spontaneous magnetostriction causes the ferromagnetic volume to contract, balancing thermal lattice expansion near room temperature.',
    },
    {
      id: 'q4',
      question:
        'What governs the torque transmission capacity (T_cap) of an interference shrink-fit hub and shaft joint?',
      options: [
        'Interfacial contact pressure (p_c), coefficient of friction (μ), contact area (π·d·L), and shaft radius (d/2)',
        'Only the rotational speed of the motor connected to the shaft',
        'The ambient atmospheric barometric pressure',
        'The thermal conductivity of the lubricating oil',
      ],
      correctIndex: 0,
      explanation:
        'Shrink-fit connections transmit torque entirely through interfacial friction: T_cap = μ * Normal Force * Radius = μ * (p_c * π * d * L) * (d / 2). The contact pressure p_c is generated by the elastic diametral interference fit.',
    },
    {
      id: 'q5',
      question:
        'When a bimetallic strip made of Brass (high α) and Invar (low α) is heated above ambient temperature, in which direction does it bend?',
      options: [
        'It bends towards the Invar layer because Brass expands more in length, forcing curvature toward the less expanding side',
        'It bends towards the Brass layer because Brass contracts when heated',
        'It remains completely straight and only increases in thickness',
        'It twists into a 90° helix regardless of temperature',
      ],
      correctIndex: 0,
      explanation:
        'Because the Brass layer has a much higher coefficient of thermal expansion than Invar, the Brass layer elongates more. Since both layers are rigidly bonded at the interface, the strip is forced to curve with the longer Brass layer on the outside of the arc and Invar on the inside.',
    },
    {
      id: 'q6',
      question:
        'What major structural failure hazard occurs in continuous welded railway tracks (CWR) or long pipelines when expansion joints are insufficient during extreme hot weather?',
      options: [
        'Compressive thermal buckling (sun kinks or track blowout) due to massive restrained axial compressive thrust',
        'Tensile necking and ductile cup-and-cone rupture',
        'Instantaneous melting of the rail head at 50 °C',
        'Complete loss of magnetic permeability',
      ],
      correctIndex: 0,
      explanation:
        'Rigidly constrained long members under rising temperature develop massive compressive stresses (σ = E·α·ΔT). When compressive thrust exceeds the column buckling limit (Euler buckling), the member abruptly bows sideways in a catastrophic track blowout or pipe buckle.',
    },
  ],
};
