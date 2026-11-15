import type { SimulatorMeta } from '../../types/simulator';
import './couplingI18n';

export const couplingMeta: SimulatorMeta = {
  id: 'coupling',
  title: 'Rotor Balancing, Coupling & Keyway Maintenance Simulator',
  shortTitle: 'Balancing & Coupling',
  category: 'Rotating Equipment',
  difficulty: 'Intermediate',
  description:
    'Perform single-plane influence coefficient rotor balancing against ISO 10816 / 1940 standards, and inspect jaw, gear, and grid couplings for torsional backlash, keyway fretting, and service factor.',
  iconName: 'Cog',
  accentColor: 'violet',
  explore: [
    {
      title: 'Influence Coefficient Balancing Vector Method',
      summary:
        'Single-plane dynamic balancing uses complex vibration phasors (amplitude and phase angle) measured at 1X shaft speed to cancel mass unbalance with a single correction weight.',
      equations: [
        {
          label: 'Trial Weight Effect Vector',
          formula: 'V_t = V_1 - V_0',
          note: 'Vector difference between the trial run (V1) and initial run (V0) in mm/s.',
        },
        {
          label: 'Rotor Influence Coefficient',
          formula: 'α = V_t / m_t = (V_1 - V_0) / m_t',
          note: 'Complex sensitivity (mm/s per gram) including mechanical/electronic phase lag.',
        },
        {
          label: 'Correction Weight Vector',
          formula: 'm_c = -V_0 / α = -m_t · (V_0 / V_t)',
          note: 'Remove the trial weight and install m_c at its calculated angle θ_c.',
        },
      ],
      workedExample: {
        title: 'Calculating Single-Plane Correction Weight',
        given: [
          'Initial vibration V0 = 6.0 mm/s ∠ 40°',
          'Trial weight mt = 15 g attached at 0°',
          'Trial run vibration V1 = 8.5 mm/s ∠ 75°',
        ],
        steps: [
          'Convert V0 to Cartesian: V0 = (6.0 cos 40°, 6.0 sin 40°) = (4.596, 3.857) mm/s.',
          'Convert V1 to Cartesian: V1 = (8.5 cos 75°, 8.5 sin 75°) = (2.200, 8.210) mm/s.',
          'Compute trial effect Vt = V1 - V0 = (-2.396, 4.353) mm/s -> |Vt| = 4.969 mm/s ∠ 118.8°.',
          'Compute |mc| = mt · (|V0| / |Vt|) = 15 × (6.0 / 4.969) = 18.1 g.',
          'Angle θ_c = θ_t + (θ_V0 - θ_Vt) + 180° = 0° + (40° - 118.8°) + 180° = 101.2°.',
        ],
        answer: 'Install 18.1 g at 101° (after removing the 15 g trial weight).',
      },
    },
    {
      title: 'ISO 1940 Balance Grades (G2.5 / G6.3) & ISO 10816 Severity',
      summary:
        'ISO 1940-1 defines permissible residual specific unbalance e_per from balance quality grade G and service speed, while ISO 10816-3 classifies overall RMS bearing housing vibration into Zones A–D.',
      equations: [
        {
          label: 'Angular Velocity',
          formula: 'ω = 2π · N / 60',
          note: 'N in RPM, ω in rad/s.',
        },
        {
          label: 'Permissible Specific Unbalance',
          formula: 'e_per = (G · 1000) / ω',
          note: 'e_per in g·mm/kg (or µm). Typical grades: G2.5 (turbines/precision), G6.3 (pumps/fans/motors).',
        },
        {
          label: 'Permissible Residual Mass',
          formula: 'm_per = (M · e_per) / r',
          note: 'M = rotor mass (kg), r = correction radius (mm).',
        },
      ],
      workedExample: {
        title: 'ISO 1940-1 Grade G6.3 Limit for a Centrifugal Fan',
        given: [
          'Rotor mass M = 120 kg, speed N = 1500 RPM',
          'Balance grade G = 6.3 mm/s, correction radius r = 200 mm',
        ],
        steps: [
          'Angular speed ω = 2π × 1500 / 60 = 157.08 rad/s.',
          'e_per = (6.3 × 1000) / 157.08 = 40.11 g·mm/kg.',
          'Total permissible unbalance U_per = 120 × 40.11 = 4813 g·mm.',
          'At radius r = 200 mm, m_per = 4813 / 200 = 24.1 g.',
        ],
        answer: 'Maximum allowable residual unbalance mass is 24.1 g at 200 mm radius.',
      },
    },
    {
      title: 'Coupling Types, Torsional Backlash & Keyway Fit Inspection',
      summary:
        'Flexible couplings accommodate misalignment and damp torque shocks, but elastomer wear, grease loss, and loose keyway fits rapidly increase backlash, fretting corrosion, and key shear stress.',
      equations: [
        {
          label: 'Nominal Coupling Service Factor',
          formula: 'SF = T_rated / T_applied',
          note: 'T_applied = 9550 · P(kW) / N(RPM). Industrial drives typically require SF ≥ 1.5.',
        },
        {
          label: 'Parallel Key Shear Stress',
          formula: 'τ = F_t / (b · L),  where F_t = (2000 · T) / d',
          note: 'T in Nm, shaft diameter d, key width b, and key length L in mm.',
        },
        {
          label: 'Parallel Key Crushing Stress',
          formula: 'σ_c = (2 · F_t) / (h · L)',
          note: 'Checks side-wall bearing pressure on half the key height (h/2).',
        },
      ],
      workedExample: {
        title: 'Checking Keyway Shear & Coupling Service Factor',
        given: [
          'Applied torque T = 280 Nm on a d = 40 mm shaft',
          'DIN 6885 key: b = 12 mm, h = 8 mm, L = 45 mm',
          'Elastomer Jaw coupling rated at T_rated = 340 Nm',
        ],
        steps: [
          'Tangential force F_t = (2000 × 280) / 40 = 14,000 N.',
          'Key shear stress τ = 14,000 / (12 × 45) = 25.9 MPa (well below 80 MPa limit).',
          'Key crushing stress σ_c = (2 × 14,000) / (8 × 45) = 77.8 MPa.',
          'Nominal Service Factor SF = 340 / 280 = 1.21 (marginal for shock loads).',
        ],
        answer: 'Key stresses are safe, but SF = 1.21 requires monitoring or upsizing.',
      },
    },
  ],
  practice: [
    {
      id: 'bal-mc-1',
      prompt:
        'An initial balancing run measures V0 = 6.0 mm/s ∠ 0°. Attaching a 20 g trial weight at 0° changes vibration to V1 = 9.0 mm/s ∠ 0°. What correction weight mass (in g) is required?',
      hint: 'Since V0 and V1 are collinear at 0°, Vt = V1 - V0 = 3.0 mm/s. Use mc = mt · (|V0| / |Vt|).',
      targetValue: 40,
      unit: 'g',
      tolerance: 0.5,
      solutionSteps: [
        'Vt = V1 - V0 = 9.0 - 6.0 = 3.0 mm/s ∠ 0°.',
        'Influence sensitivity |α| = |Vt| / mt = 3.0 / 20 = 0.15 mm/s per g.',
        'Correction mass mc = |V0| / |α| = 6.0 / 0.15 = 40 g (installed at 180°).',
      ],
    },
    {
      id: 'iso-1940-1',
      prompt:
        'An 80 kg pump impeller runs at 1500 RPM and must meet ISO 1940 Grade G6.3. What is the maximum permissible residual mass (in g) at a correction radius of 160 mm?',
      hint: 'Compute ω = 2π·N/60, e_per = 1000·G/ω, then m_per = (M · e_per) / r.',
      targetValue: 20.1,
      unit: 'g',
      tolerance: 0.5,
      solutionSteps: [
        'ω = 2π × 1500 / 60 = 157.08 rad/s.',
        'e_per = (6.3 × 1000) / 157.08 = 40.11 g·mm/kg.',
        'U_per = 80 × 40.11 = 3208.6 g·mm.',
        'm_per = 3208.6 / 160 = 20.05 g ≈ 20.1 g.',
      ],
    },
    {
      id: 'key-shear-1',
      prompt:
        'A 40 mm diameter shaft transmits 300 Nm through a DIN 6885 parallel key of width b = 12 mm and length L = 50 mm. Calculate the key shear stress (in MPa).',
      hint: 'First find tangential force Ft = (2000 · T) / d, then divide by shear area b · L.',
      targetValue: 25,
      unit: 'MPa',
      tolerance: 0.5,
      solutionSteps: [
        'Shaft radius r = d / 2 = 20 mm.',
        'Tangential force Ft = (300 × 1000) / 20 = 15,000 N.',
        'Shear area As = 12 × 50 = 600 mm².',
        'τ = 15,000 / 600 = 25.0 MPa.',
      ],
    },
    {
      id: 'coupling-sf-1',
      prompt:
        'A 22 kW motor running at 1480 RPM drives a pump through a coupling rated at 340 Nm nominal torque. What is the nominal coupling service factor?',
      hint: 'Calculate applied torque T = 9550 · P / N, then SF = T_rated / T.',
      targetValue: 2.4,
      unit: 'SF',
      tolerance: 0.08,
      solutionSteps: [
        'Applied torque T = (9550 × 22) / 1480 = 141.96 Nm.',
        'Nominal Service Factor SF = 340 / 141.96 = 2.395 ≈ 2.40.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'In single-plane influence coefficient balancing, what does the vector Vt = V1 - V0 represent?',
      options: [
        'The residual vibration after balancing',
        'The vibration change caused solely by the trial weight',
        'The background electrical noise floor',
        'The total bearing housing stiffness',
      ],
      correctIndex: 1,
      explanation:
        'Subtracting the initial run vector V0 from the trial run vector V1 isolates the dynamic response Vt produced by the trial weight alone.',
    },
    {
      id: 'q2',
      question:
        'Why should the trial weight normally be removed before installing the calculated correction weight?',
      options: [
        'Because the correction weight is calculated to cancel V0 alone',
        'Because trial weights cannot rotate above 1000 RPM',
        'To double the rotor influence coefficient',
        'To shift the phase angle by 90 degrees',
      ],
      correctIndex: 0,
      explanation:
        'The standard formula mc = -V0 / α solves for the mass needed to cancel the original unbalance V0; leaving the trial weight on would add Vt back in.',
    },
    {
      id: 'q3',
      question:
        'According to ISO 10816-3 for medium industrial machines (15–300 kW, rigid foundation), which RMS velocity range corresponds to Zone A (newly commissioned)?',
      options: ['0.0 – 1.4 mm/s', '1.4 – 2.8 mm/s', '2.8 – 4.5 mm/s', '> 4.5 mm/s'],
      correctIndex: 0,
      explanation:
        'ISO 10816-3 Group 2 (rigid) defines Zone A as ≤ 1.4 mm/s RMS, Zone B up to 2.8 mm/s, Zone C up to 4.5 mm/s, and Zone D above 4.5 mm/s.',
    },
    {
      id: 'q4',
      question:
        'Which coupling type requires periodic EP grease or oil-bath lubrication to prevent tooth fretting and lock-up?',
      options: [
        'Elastomer Jaw Coupling',
        'Crowned-Tooth Gear Coupling',
        'Rubber Tire Coupling',
        'Disc Pack Membrane Coupling',
      ],
      correctIndex: 1,
      explanation:
        'Gear couplings rely on a lubricant film between sliding crowned hub teeth and internal sleeve teeth; grease starvation rapidly causes fretting wear.',
    },
    {
      id: 'q5',
      question:
        'What is the primary root cause of red-brown oxide debris ("fretting corrosion") around a shaft keyway?',
      options: [
        'Excessive elastomer spider hardness',
        'Micro-slip and impacting due to loose keyway clearance under cyclic torque',
        'Over-lubrication of the bearing housing',
        'Balancing the rotor to ISO Grade G2.5',
      ],
      correctIndex: 1,
      explanation:
        'Clearance between the key and keyway allows microscopic oscillatory slip under fluctuating torque, breaking down surface oxides and causing fretting wear.',
    },
    {
      id: 'q6',
      question:
        'If a rotor speed doubles from 1500 RPM to 3000 RPM while keeping the same ISO 1940 G-grade, what happens to the permissible residual unbalance mass?',
      options: [
        'It doubles',
        'It quadruples',
        'It is cut in half',
        'It remains unchanged',
      ],
      correctIndex: 2,
      explanation:
        'Since e_per = (G · 1000) / ω and ω is proportional to RPM, doubling the speed halves the permissible specific unbalance e_per and residual mass.',
    },
  ],
};
