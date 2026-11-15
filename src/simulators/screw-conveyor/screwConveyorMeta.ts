import type { SimulatorMeta } from '../../types/simulator';
import './screwConveyorI18n';

export const screwConveyorMeta: SimulatorMeta = {
  id: 'screw-conveyor',
  title: 'CEMA Screw Conveyor & Auger Transport',
  shortTitle: 'Screw Conveyor',
  category: 'Machine Elements',
  difficulty: 'Intermediate',
  description:
    'Analyze CEMA 350 helical screw conveyor volumetric and mass capacity, trough loading limits (15%, 30%, 45%), inclination derating, drive torque and power breakdown, and diagnose hanger bearing overheat, flight abrasion carryback, and overfill jamming.',
  iconName: 'Cog',
  accentColor: 'emerald',
  explore: [
    {
      title: 'CEMA Volumetric & Mass Capacity Equations',
      summary:
        'A helical screw conveyor advances bulk solids axially along a stationary U-trough. Volumetric throughput depends on the annular cross-sectional area between the screw outer diameter (D) and center pipe diameter (d), flight pitch (P), rotational speed (N), and the CEMA trough loading percentage (15%, 30%, or 45%).',
      equations: [
        {
          label: 'Screw Annulus Cross-Sectional Area',
          formula: 'A_s = (π / 4) × (D² − d²)  [m²]',
          note: 'D = screw outer diameter (m), d = center pipe outer diameter (m)',
        },
        {
          label: 'Volumetric Conveying Capacity',
          formula: 'Q_v = 60 × A_s × P × N × (Fill% / 100) × K_θ  [m³/h]',
          note: 'P = flight pitch (m), N = rotational speed (RPM), K_θ = inclination factor',
        },
        {
          label: 'Mass Conveying Capacity',
          formula: 'Q_m = (Q_v × ρ_b) / 1000  [t/h]',
          note: 'ρ_b = bulk material density (kg/m³)',
        },
      ],
      workedExample: {
        title: 'Horizontal Grain Screw Conveyor Throughput',
        given: [
          'Screw outer diameter D = 300 mm (0.30 m), pipe diameter d = 73 mm (0.073 m)',
          'Standard pitch P = 300 mm (0.30 m), speed N = 60 RPM',
          'Trough loading = 45% (free-flowing wheat, ρ_b = 750 kg/m³), horizontal (K_θ = 1.0)',
        ],
        steps: [
          'Annulus area: A_s = (π / 4) × (0.30² − 0.073²) = 0.0665 m²',
          'Volumetric capacity: Q_v = 60 × 0.0665 × 0.30 × 60 × 0.45 × 1.0 = 32.32 m³/h',
          'Mass capacity: Q_m = (32.32 × 750) / 1000 = 24.24 t/h',
        ],
        answer: 'Q_v = 32.3 m³/h and Q_m = 24.2 t/h',
      },
    },
    {
      title: 'Trough Loading Rules & Inclination Derating (K_θ)',
      summary:
        'CEMA 350 restricts trough loading to 15% for abrasive/heavy materials (sand, crushed limestone) so the bulk bed remains below the intermediate hanger bearings, 30% for semi-abrasive powders (cement), and 45% for light non-abrasive free-flowing solids (grain, wood chips). Inclining a screw conveyor increases fallback and reduces capacity via the derating factor K_θ.',
      equations: [
        {
          label: 'CEMA Inclination Capacity Factor (K_θ)',
          formula: '0° → 1.00 | 10° → 0.85 | 20° → 0.65 | 30° → 0.45 | 45° → 0.25',
          note: 'Above 20°, short-pitch flights (P = 0.5–0.75 D) or tubular housings are recommended',
        },
        {
          label: 'Nominal Axial Advance Velocity',
          formula: 'v_a = (P × N / 60) × K_θ  [m/s]',
          note: 'Determines material residence time t_res = L / v_a',
        },
      ],
      workedExample: {
        title: 'Impact of 20° Inclination on Cement Throughput',
        given: [
          'Horizontal capacity Q_m0 = 18.0 t/h at θ = 0°',
          'Conveyor is inclined to θ = 20° (K_θ = 0.65)',
        ],
        steps: [
          'Apply the CEMA inclination derating factor: Q_m = Q_m0 × K_θ',
          'Q_m = 18.0 × 0.65 = 11.7 t/h (a 35% reduction in net throughput)',
        ],
        answer: 'Q_m = 11.7 t/h at 20° inclination',
      },
    },
    {
      title: 'CEMA Drive Power, Shaft Torque & Fault Diagnostics',
      summary:
        'Total shaft power combines empty hanger-bearing friction (P_empty), horizontal material drag (P_mat, scaled by material factor F_m), and vertical lift power (P_lift). Drive torque is T = 9549.3 × P_shaft / N. Monitoring bearing temperature and motor current reveals hanger bearing wear, flight edge abrasion carryback, or overfill choking.',
      equations: [
        {
          label: 'Material Drag Power (SI-Adapted CEMA)',
          formula: 'P_mat = (Q_m × L × F_m × 9.81) / 3600  [kW]',
          note: 'F_m = CEMA material factor (0.6 grain, 1.4 cement, 2.0 silica sand)',
        },
        {
          label: 'Vertical Lift Power',
          formula: 'P_lift = (Q_m × L × sin(θ) × 9.81) / 3600  [kW]',
          note: 'Zero when horizontal (θ = 0°)',
        },
        {
          label: 'Drive Shaft Torque',
          formula: 'T = (9549.3 × P_shaft) / N  [N·m]',
          note: 'Overfill jamming can spike shaft torque > 2.5× nominal',
        },
      ],
      workedExample: {
        title: 'Shaft Torque Check at 55 RPM',
        given: [
          'Total shaft power P_shaft = 4.20 kW',
          'Screw rotational speed N = 55 RPM',
        ],
        steps: [
          'Compute drive shaft torque: T = (9549.3 × 4.20) / 55',
          'T = 729.2 N·m',
        ],
        answer: 'T = 729 N·m at the screw drive shaft',
      },
    },
  ],
  practice: [
    {
      id: 'sc-prac-1',
      prompt:
        'A horizontal screw conveyor has an annulus area A_s = 0.0665 m², flight pitch P = 0.30 m, speed N = 50 RPM, and 30% trough fill (K_θ = 1.0). Calculate the volumetric capacity Q_v in m³/h.',
      hint: 'Use Q_v = 60 × A_s × P × N × (Fill% / 100) × K_θ.',
      targetValue: 17.96,
      unit: 'm³/h',
      tolerance: 0.3,
      solutionSteps: [
        'Q_v = 60 × 0.0665 × 0.30 × 50 × 0.30 × 1.0',
        'Q_v = 17.955 m³/h ≈ 18.0 m³/h',
      ],
    },
    {
      id: 'sc-prac-2',
      prompt:
        'If a screw conveyor delivers Q_v = 22.0 m³/h of Portland cement with bulk density ρ_b = 1440 kg/m³, what is the mass conveying capacity Q_m in t/h?',
      hint: 'Multiply volumetric capacity by bulk density and divide by 1000.',
      targetValue: 31.68,
      unit: 't/h',
      tolerance: 0.4,
      solutionSteps: [
        'Q_m = (Q_v × ρ_b) / 1000',
        'Q_m = (22.0 × 1440) / 1000 = 31.68 t/h',
      ],
    },
    {
      id: 'sc-prac-3',
      prompt:
        'A screw conveyor shaft requires P_shaft = 5.5 kW at N = 55 RPM. Calculate the drive shaft torque T in N·m.',
      hint: 'Use T = (9549.3 × P_shaft) / N.',
      targetValue: 954.9,
      unit: 'N·m',
      tolerance: 5,
      solutionSteps: [
        'T = (9549.3 × 5.5) / 55',
        'T = 954.93 N·m ≈ 955 N·m',
      ],
    },
  ],
  quiz: [
    {
      id: 'sc-quiz-1',
      question:
        'Why does CEMA 350 limit abrasive materials like dry silica sand or crushed limestone to 15% trough loading?',
      options: [
        'To keep the abrasive material bed below the intermediate hanger bearings and shaft seals',
        'Because 45% trough loading reverses the screw rotation',
        'To double the axial velocity of the auger',
        'Because abrasive materials have zero bulk density',
      ],
      correctIndex: 0,
      explanation:
        'At 15% trough loading, the material bed stays in the lower portion of the U-trough well below the center pipe and hanger bearings, preventing rapid abrasive seizure.',
    },
    {
      id: 'sc-quiz-2',
      question:
        'What happens to the net conveying capacity when a standard-pitch screw conveyor is inclined from 0° to 20°?',
      options: [
        'It drops by about 35% (K_θ ≈ 0.65) due to material fallback and reduced fill efficiency',
        'It increases by 35% because gravity assists the discharge',
        'It stays exactly 100% unchanged up to 45°',
        'It drops to zero above 5°',
      ],
      correctIndex: 0,
      explanation:
        'Inclining a screw conveyor causes bulk solids to slide backward along the flights, reducing volumetric efficiency to K_θ ≈ 0.65 at 20°.',
    },
    {
      id: 'sc-quiz-3',
      question:
        'Which fault state is primarily indicated by a 28% drop in discharge mass flow without a major torque spike?',
      options: [
        'Flight outer-edge abrasion causing radial clearance carryback',
        'Complete gearbox coupling fracture',
        'Hanger bearing thermal runaway',
        'Overfill choking at the inlet hopper',
      ],
      correctIndex: 0,
      explanation:
        'Worn flight edges increase the radial gap between the auger and trough wall, allowing conveyed material to slip backward (carryback) and reducing net throughput.',
    },
    {
      id: 'sc-quiz-4',
      question:
        'If a screw conveyor is flooded above its center pipe (90% effective fill), what is the immediate mechanical consequence?',
      options: [
        'Severe material churning/bridging and a 2.5×+ drive torque spike risking motor overload',
        'Hanger bearings cool down due to extra material contact',
        'Volumetric efficiency reaches 100% with zero slip',
        'Required shaft power drops to empty-friction levels',
      ],
      correctIndex: 0,
      explanation:
        'Overfilling above the center pipe chokes the trough, forcing the auger to shear and churn packed material, which spikes drive torque and trips motor overload protection.',
    },
  ],
};
