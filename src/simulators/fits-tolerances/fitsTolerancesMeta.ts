import type { SimulatorMeta } from '../../types/simulator';
import './fitsTolerancesI18n';

export const fitsTolerancesMeta: SimulatorMeta = {
  id: 'fits-tolerances',
  title: 'ISO 286 Shaft/Hole Fits & Thermal Shrink-Fit',
  shortTitle: 'ISO 286 Fits & Shrink',
  category: 'Precision Measurement',
  difficulty: 'Intermediate',
  description:
    'Analyze ISO 286 hole-basis (H6/H7/H8) and shaft tolerance zones (f7–s6), Go/No-Go plug and snap gauge limits, Lamé contact pressure, hydraulic press force, and induction thermal shrink-fit assembly clearance.',
  iconName: 'Layers',
  accentColor: 'cyan',
  explore: [
    {
      title: 'ISO 286 Hole-Basis System (H7) & Fundamental Deviations',
      summary:
        'In ISO 286-1/2, a fit designation such as Ø50 H7/g6 combines a capital letter for the internal feature (Hole) and a lowercase letter for the external feature (Shaft). Over 90% of industrial machinery uses the Hole-Basis System ("H"), where the lower deviation EI is anchored exactly on the 0 µm reference line (D_min = nominal diameter d), because machining precision bores with standard reamers and broaches is far more economical than stocking dozens of custom hole tools.',
      equations: [
        {
          label: 'Hole Limits & Tolerance (H-Basis: EI = 0 µm)',
          formula: 'D_max = d + ES / 1000   |   D_min = d + EI / 1000   |   T_H = ES − EI',
          note: 'ES = upper deviation (µm), EI = lower deviation (µm); for all H holes, EI = 0 µm',
        },
        {
          label: 'Shaft Limits & Tolerance',
          formula: 'd_max = d + es / 1000   |   d_min = d + ei / 1000   |   T_S = es − ei',
          note: 'Shaft letters a–h lie at or below 0 µm (clearance); k–n straddle 0 µm (transition); p–z lie above (interference)',
        },
        {
          label: 'Taylor Principle for Go / No-Go Gauges',
          formula: 'Plug Gauge: Go = D_min, No-Go = D_max   |   Snap Gauge: Go = d_max, No-Go = d_min',
          note: 'The Go gauge checks maximum material condition (MMC); No-Go checks least material condition (LMC)',
        },
      ],
      workedExample: {
        title: 'Inspecting a Ø50 H7/g6 Precision Sliding Fit',
        given: [
          'Nominal diameter: d = 50 mm',
          'Hole H7 deviations (ISO 286-2): ES = +25 µm, EI = 0 µm',
          'Shaft g6 deviations (ISO 286-2): es = −9 µm, ei = −25 µm',
        ],
        steps: [
          'Hole limits: D_min = 50.000 mm (Go plug), D_max = 50.025 mm (No-Go plug), T_H = 25 µm',
          'Shaft limits: d_max = 49.991 mm (Go snap), d_min = 49.975 mm (No-Go snap), T_S = 16 µm',
          'Minimum clearance: C_min = EI − es = 0 − (−9) = +9 µm; Maximum clearance: C_max = ES − ei = 25 − (−25) = +50 µm',
        ],
        answer: 'Guaranteed clearance fit (+9 µm to +50 µm) suitable for precision sliding hubs.',
      },
    },
    {
      title: 'Clearance, Transition & Interference Fit Mechanics',
      summary:
        'Comparing the hole tolerance zone (ES, EI) against the shaft tolerance zone (es, ei) determines whether the assembly always has play (Clearance), always requires force or thermal expansion (Interference), or can yield either slight clearance or slight interference depending on where the actual machined dimensions fall (Transition).',
      equations: [
        {
          label: 'Extreme Clearances (Signed C = D_hole − d_shaft)',
          formula: 'C_max = ES − ei   |   C_min = EI − es',
          note: 'Clearance fit when C_min ≥ 0 µm; Transition fit when C_max > 0 µm and C_min < 0 µm',
        },
        {
          label: 'Extreme Interferences (δ = d_shaft − D_hole = −C)',
          formula: 'δ_max = es − EI   |   δ_min = ei − ES',
          note: 'True Interference fit when δ_min ≥ 0 µm (or C_max ≤ 0 µm), such as H7/p6 and H7/s6',
        },
        {
          label: 'Total Fit Tolerance Band',
          formula: 'T_fit = C_max − C_min = T_H + T_S',
          note: 'Equal to the sum of the hole tolerance grade and shaft tolerance grade',
        },
      ],
      workedExample: {
        title: 'Evaluating a Ø50 H7/k6 Gear Hub Transition Fit',
        given: [
          'Nominal diameter: d = 50 mm',
          'Hole H7: ES = +25 µm, EI = 0 µm',
          'Shaft k6: es = +18 µm, ei = +2 µm',
        ],
        steps: [
          'Compute Maximum Clearance (largest hole − smallest shaft): C_max = ES − ei = +25 − (+2) = +23 µm',
          'Compute Minimum Clearance (smallest hole − largest shaft): C_min = EI − es = 0 − (+18) = −18 µm',
          'Since C_min = −18 µm, maximum interference is δ_max = +18 µm',
        ],
        answer: 'Transition fit ranging from 23 µm clearance to 18 µm interference (true concentricity for keyed gears).',
      },
    },
    {
      title: 'Thermal Shrink-Fit (Δd = α · d · ΔT) & Hydraulic Press Force',
      summary:
        'Cold-pressing heavy interference fits (like H7/p6 or H7/s6) requires high hydraulic tonnage and risks scoring or galling the mating surfaces. Heating the outer hub with an induction heater (or chilling the shaft in dry ice / liquid nitrogen) temporarily expands the clearance so the component drops effortlessly onto the shaft seat before locking tightly as temperatures equalize.',
      equations: [
        {
          label: 'Thermal Diameter Expansion / Contraction',
          formula: 'Δd = α · d · ΔT',
          note: 'For carbon/alloy steel α ≈ 11.5 × 10⁻⁶ /°C (0.0115 µm per mm per °C)',
        },
        {
          label: 'Lamé Interface Contact Pressure (Steel Hub Do/d = 2.0)',
          formula: 'p = [E · (δ / d)] · [(1 − (d / Do)²) / 2] ≈ 0.375 · E · (δ / d)',
          note: 'With E = 207,000 MPa and δ in mm (or δ_µm / 1000)',
        },
        {
          label: 'Hydraulic Press Assembly Force',
          formula: 'F = µ · p · π · d · L',
          note: 'F in kN (divide N by 1000), µ ≈ 0.15 lubricated steel press coefficient, L = engagement length (mm)',
        },
      ],
      workedExample: {
        title: 'Induction Heating Temperature for a Ø80 H7/s6 Heavy Shrink-Fit',
        given: [
          'Nominal diameter: d = 80 mm, steel α = 11.5 × 10⁻⁶ /°C, ambient T₀ = 20 °C',
          'Hole H7 (EI = 0 µm, ES = +30 µm), Shaft s6 (es = +78 µm, ei = +59 µm)',
          'Target assembly safety clearance margin: C_safe = 31 µm',
        ],
        steps: [
          'Worst-case interference: δ_max = es − EI = 78 − 0 = 78 µm',
          'Required thermal expansion: Δd_req = δ_max + C_safe = 78 + 31 = 109 µm = 0.109 mm',
          'Required temperature rise: ΔT = 109 / (0.0115 × 80) = 109 / 0.92 = 118.5 °C → T_heater ≈ 20 + 119 = 139 °C',
        ],
        answer: 'Heat the hub to ~140 °C (safe below 125–150 °C bearing temper limit) for zero-force drop-in assembly.',
      },
    },
  ],
  practice: [
    {
      id: 'ft-p1',
      prompt:
        'For a Ø50 H7/f7 close running fit (H7: ES = +25 µm, EI = 0 µm; f7: es = −25 µm, ei = −50 µm), calculate the Maximum Clearance C_max in µm.',
      hint: 'Maximum clearance occurs between the largest hole (ES) and the smallest shaft (ei): C_max = ES − ei.',
      targetValue: 75,
      unit: 'µm',
      tolerance: 1,
      solutionSteps: [
        'Largest hole deviation ES = +25 µm',
        'Smallest shaft deviation ei = −50 µm',
        'C_max = ES − ei = 25 − (−50) = 75 µm',
      ],
    },
    {
      id: 'ft-p2',
      prompt:
        'A Ø80 H7/p6 interference fit has Hole H7 (ES = +30 µm, EI = 0 µm) and Shaft p6 (es = +51 µm, ei = +32 µm). What is the Maximum Interference δ_max in µm?',
      hint: 'Maximum interference occurs when the largest shaft (es) mates with the smallest hole (EI): δ_max = es − EI.',
      targetValue: 51,
      unit: 'µm',
      tolerance: 1,
      solutionSteps: [
        'Smallest hole deviation EI = 0 µm',
        'Largest shaft deviation es = +51 µm',
        'δ_max = es − EI = 51 − 0 = 51 µm',
      ],
    },
    {
      id: 'ft-p3',
      prompt:
        'A steel coupling hub with bore d = 100 mm (α = 11.5 × 10⁻⁶ /°C) is heated from 20 °C ambient to 120 °C (ΔT = 100 °C) on an induction heater. By how many micrometers (µm) does the bore diameter expand?',
      hint: 'Use Δd (µm) = 0.0115 × d (mm) × ΔT (°C).',
      targetValue: 115,
      unit: 'µm',
      tolerance: 2,
      solutionSteps: [
        'Temperature rise ΔT = 120 °C − 20 °C = 100 °C',
        'Δd = α · d · ΔT = 11.5 × 10⁻⁶ × 100 mm × 100 °C = 0.115 mm = 115 µm',
      ],
    },
    {
      id: 'ft-p4',
      prompt:
        'A Ø50 mm shaft press-fit with engagement length L = 60 mm develops an interface contact pressure p = 30 MPa. Assuming friction coefficient µ = 0.15, calculate the required hydraulic press force F in kN.',
      hint: 'Use F (kN) = (µ · p · π · d · L) / 1000.',
      targetValue: 42.4,
      unit: 'kN',
      tolerance: 1.0,
      solutionSteps: [
        'Contact surface area A = π · d · L = 3.1416 × 50 × 60 = 9,424.8 mm²',
        'Press force F = µ · p · A = 0.15 × 30 MPa × 9,424.8 mm² = 42,411.5 N = 42.4 kN',
      ],
    },
    {
      id: 'ft-p5',
      prompt:
        'For a Ø40 H7 bore (ES = +25 µm, EI = 0 µm), what is the exact diameter (in mm) of the "No-Go" cylindrical plug gauge?',
      hint: 'The No-Go plug gauge checks the upper limit of the hole: D_max = d + ES / 1000.',
      targetValue: 40.025,
      unit: 'mm',
      tolerance: 0.002,
      solutionSteps: [
        'Nominal diameter d = 40.000 mm',
        'Upper deviation ES = +25 µm = +0.025 mm',
        'D_max (No-Go Plug Gauge) = 40.000 + 0.025 = 40.025 mm',
      ],
    },
  ],
  quiz: [
    {
      id: 'ft-q1',
      question:
        'In the ISO 286 tolerance designation "Ø50 H7/k6", what does the capital letter "H" signify?',
      options: [
        'A hole-basis system where the lower deviation (EI) of the bore is zero (0 µm)',
        'A hardened steel shaft with rockwell hardness class 7',
        'A heavy interference shrink fit requiring hydraulic pressing',
        'An upper hole deviation equal to zero (ES = 0 µm)',
      ],
      correctIndex: 0,
      explanation:
        'In ISO 286, capital letters denote holes and "H" is the fundamental hole-basis deviation with EI = 0 µm (minimum bore diameter equals the nominal size).',
    },
    {
      id: 'ft-q2',
      question:
        'Which of the following ISO 286 shaft classes paired with an H7 hole always produces a true Interference Fit?',
      options: [
        'p6 or s6 (shaft tolerance zone lies entirely above the H7 hole zone)',
        'f7 or g6 (shaft tolerance zone lies below the 0 µm line)',
        'h6 (shaft upper deviation es = 0 µm)',
        'k6 (shaft zone overlaps the H7 hole zone)',
      ],
      correctIndex: 0,
      explanation:
        'For p6 and s6 shafts paired with an H7 hole, the shaft lower deviation (ei) is greater than the hole upper deviation (ES), guaranteeing interference across all tolerance combinations.',
    },
    {
      id: 'ft-q3',
      question:
        'According to the Taylor Principle for Go/No-Go limit gauging of a machined H7 bore, how must a cylindrical Plug Gauge behave to pass inspection?',
      options: [
        'The Go end (D_min) must enter the full bore length freely, and the No-Go end (D_max) must not enter',
        'Both the Go end and No-Go end must slide completely through the bore',
        'Neither end may enter without a 5-ton arbor press',
        'The Go end must stop halfway and the No-Go end must pass freely',
      ],
      correctIndex: 0,
      explanation:
        'The Go plug gauge verifies that the bore is at least D_min over its full engagement length, while the No-Go plug gauge verifies that the bore has not been machined larger than D_max.',
    },
    {
      id: 'ft-q4',
      question:
        'Why are precision rolling bearings and heavy H7/s6 shrink-fit hubs typically heated to 110–125 °C on an induction heater rather than exceeds 150–200 °C with an oxy-acetylene torch?',
      options: [
        'Overheating above ~125–150 °C permanently tempers/softens heat-treated bearing steel and causes uneven thermal distortion',
        'Steel stops expanding thermally above 125 °C',
        'Induction heaters reduce the shaft diameter instead of expanding the bore',
        'Temperatures above 125 °C convert an interference fit into a permanent clearance fit at 20 °C',
      ],
      correctIndex: 0,
      explanation:
        'Standard 52100 bearing steel is martensitically stabilized up to ~125 °C (unless specially heat-stabilized S0/S1). Flame torches create local hot spots that ruin hardness and geometry.',
    },
    {
      id: 'ft-q5',
      question:
        'If you double the engagement length L of a cylindrical interference press fit (keeping diameter d and interference δ constant), what happens to the required hydraulic press force F?',
      options: [
        'The press force F doubles because contact surface area (π · d · L) doubles',
        'The press force F stays constant because contact pressure p is unchanged',
        'The press force F decreases by 50%',
        'The press force F quadruples',
      ],
      correctIndex: 0,
      explanation:
        'Since F = µ · p · π · d · L and Lamé contact pressure p depends only on radial geometry (δ/d and Do/d), doubling L linearly doubles the axial pressing force and torque capacity.',
    },
    {
      id: 'ft-q6',
      question:
        'When cooling a steel shaft in dry ice / alcohol (−78 °C, ΔT ≈ −98 °C from 20 °C ambient), how does the thermal diameter change compare to heating a steel hub by +98 °C (+118 °C)?',
      options: [
        'The magnitude of diameter change |Δd| = α · d · |ΔT| is identical (shaft contracts by the same µm as the hub would expand)',
        'Chilling the shaft produces zero diameter change because α is zero below 0 °C',
        'Chilling expands the shaft instead of contracting it',
        'Chilling produces 10× more clearance than heating by the same ΔT',
      ],
      correctIndex: 0,
      explanation:
        'Linear thermal expansion/contraction Δd = α · d · ΔT is symmetric for small temperature excursions; a 98 °C drop contracts the steel shaft by the same µm as a 98 °C rise expands the steel bore.',
    },
  ],
};
