import type { SimulatorMeta } from '../../types/simulator';
import './valveI18n';

export const valvePackingMeta: SimulatorMeta = {
  id: 'valve-packing',
  title: 'Industrial Valve, Gland Packing & Steam Trap Maintenance',
  shortTitle: 'Valve & Packing',
  category: 'Fluid Power',
  difficulty: 'Intermediate',
  description:
    'Size control valves with Cv, balance gland follower torque against stem stiction and fugitive emissions, and diagnose passing seats and blowing steam traps.',
  iconName: 'Wrench',
  accentColor: 'emerald',
  explore: [
    {
      title: 'Cv Flow Sizing & Valve Trim Characteristics',
      summary:
        'The valve flow coefficient Cv defines the volume of water (in US gal/min at 60 °F) that passes through a valve with a 1 psi pressure drop. In metric units (m³/h and bar), Cv relates flow rate Q, differential pressure ΔP, and fluid specific gravity SG. Different valve trims—equal-percentage globe, quick-opening gate, ball, and butterfly—produce distinct Cv curves across 0–100% travel.',
      equations: [
        {
          label: 'Liquid Flow Equation (Metric)',
          formula: 'Q = 0.865 · Cv · √(ΔP / SG)',
          note: 'Q in m³/h, ΔP in bar, SG = fluid specific gravity (water = 1.0)',
        },
        {
          label: 'Equal-Percentage Trim Curve',
          formula: 'Cv(h) = Cv,max · R^(h − 1)',
          note: 'h = fractional opening (0 to 1), R = rangeability (typically 20–50)',
        },
      ],
      workedExample: {
        title: 'Control Valve Flow Calculation',
        given: [
          'Effective valve coefficient Cv = 32',
          'Differential pressure ΔP = 4.0 bar',
          'Process water specific gravity SG = 1.0',
        ],
        steps: [
          'Compute the pressure-gravity term: √(ΔP / SG) = √(4.0 / 1.0) = 2.0',
          'Multiply by metric conversion factor and Cv: Q = 0.865 × 32 × 2.0',
        ],
        answer: 'Q = 55.36 m³/h',
      },
    },
    {
      title: 'Gland Packing Compression, Stem Friction & Lantern Rings',
      summary:
        'A stuffing box seals the reciprocating or rotating valve stem using stacked braided PTFE or flexible graphite rings compressed axially by a gland follower. Axial compression converts into radial sealing stress against the stem and box wall via the packing Poisson ratio (K ≈ 0.65). A central brass lantern ring distributes barrier grease or flush fluid, while over-tightening spikes stem friction and causes actuator hunting or stem scoring.',
      equations: [
        {
          label: 'Gland Bolt Axial Force',
          formula: 'F_gland = N_bolts · T / (K · d)',
          note: 'T = nut torque (N·m), K ≈ 0.20 nut factor, d = stud nominal diameter (m)',
        },
        {
          label: 'Stem Friction Force',
          formula: 'F_friction = μ · P_radial · π · d_stem · L_pack',
          note: 'μ = packing friction coefficient (0.08–0.19), L_pack = total packing height',
        },
        {
          label: 'Minimum Radial Sealing Stress',
          formula: 'P_req = 1.2 MPa + 2.1 · P_line',
          note: 'Packing radial stress must exceed P_req to prevent fugitive leaks',
        },
      ],
      workedExample: {
        title: 'Gland Follower Force & Axial Stress',
        given: [
          '2 × M12 gland studs (d = 0.012 m, nut factor K = 0.20)',
          'Applied nut torque T = 30 N·m per stud',
          'Stuffing box annulus area A = 816.8 mm² (d_stem = 16 mm, d_box = 36 mm)',
        ],
        steps: [
          'Force per stud: F_bolt = 30 / (0.20 × 0.012) = 12,500 N',
          'Total gland follower force: F_gland = 2 × 12,500 = 25,000 N',
          'Axial packing stress: P_axial = 25,000 N / 816.8 mm² = 30.6 MPa',
          'Radial sealing stress (K_r = 0.65): P_radial = 0.65 × 30.6 = 19.9 MPa',
        ],
        answer: 'F_gland = 25,000 N, P_radial = 19.9 MPa',
      },
    },
    {
      title: 'Steam Trap Inspection, Seat Leakage & Ultrasonic Diagnostics',
      summary:
        'Steam traps automatically discharge condensate and non-condensable gases while blocking live steam. A trap that fails open ("blowing") or an isolation valve with a wiredrawn, passing seat wastes massive latent heat. Maintenance technicians inspect traps using ultrasonic acoustic sensors (continuous high-frequency hiss vs. normal intermittent cycle) and downstream IR thermography (high downstream temperature matching saturated steam).',
      equations: [
        {
          label: 'Steam Blow-By Heat Loss',
          formula: 'Q_loss = ṁ_steam · h_fg / 3600',
          note: 'Q_loss in kW, ṁ_steam in kg/h, h_fg = latent heat (2015 kJ/kg at 10 bar)',
        },
      ],
      workedExample: {
        title: 'Energy Loss from a Blowing Steam Trap',
        given: [
          'Live steam blow-by rate ṁ_steam = 30 kg/h at 10 bar',
          'Latent heat of vaporization h_fg = 2015 kJ/kg',
          'Plant operating hours = 8,000 h/year',
        ],
        steps: [
          'Thermal power wasted: Q_loss = (30 × 2015) / 3600 = 16.79 kW',
          'Annual energy loss: E_loss = 16.79 kW × 8,000 h = 134,320 kWh/year',
        ],
        answer: '16.79 kW continuous loss (134,320 kWh/year)',
      },
    },
  ],
  practice: [
    {
      id: 'vp-p1',
      prompt:
        'A globe control valve has an effective Cv of 25 on process water (SG = 1.0) with a differential pressure ΔP of 9 bar. Calculate the volumetric flow rate Q in m³/h using Q = 0.865 · Cv · √(ΔP / SG).',
      hint: '√(9 / 1) = 3. Multiply 0.865 × 25 × 3.',
      targetValue: 64.88,
      unit: 'm³/h',
      tolerance: 0.6,
      solutionSteps: [
        'Compute √(ΔP / SG) = √(9 / 1.0) = 3.0',
        'Q = 0.865 × 25 × 3.0 = 64.875 m³/h ≈ 64.88 m³/h',
      ],
    },
    {
      id: 'vp-p2',
      prompt:
        'Two M12 gland follower studs (d = 0.012 m, K = 0.20) are torqued to 24 N·m each. What is the total axial gland follower force in kN?',
      hint: 'F_bolt = T / (K · d), then multiply by 2 studs and divide by 1000 for kN.',
      targetValue: 20,
      unit: 'kN',
      tolerance: 0.3,
      solutionSteps: [
        'Force per stud: F_bolt = 24 / (0.20 × 0.012) = 10,000 N',
        'Total gland force for 2 studs: F_gland = 2 × 10,000 = 20,000 N = 20 kN',
      ],
    },
    {
      id: 'vp-p3',
      prompt:
        'A valve operates at a line pressure of 15 bar (1.5 MPa). Using the sealing criterion P_req = 1.2 + 2.1 · P_line(MPa), what is the minimum required radial packing stress in MPa?',
      hint: 'Convert 15 bar to 1.5 MPa first, then compute 1.2 + 2.1 × 1.5.',
      targetValue: 4.35,
      unit: 'MPa',
      tolerance: 0.1,
      solutionSteps: [
        'Convert line pressure: 15 bar = 1.5 MPa',
        'P_req = 1.2 + 2.1 × 1.5 = 1.2 + 3.15 = 4.35 MPa',
      ],
    },
    {
      id: 'vp-p4',
      prompt:
        'A blowing 10 bar steam trap leaks 45 kg/h of live steam (h_fg = 2015 kJ/kg). Calculate the continuous thermal power loss in kW.',
      hint: 'Q_loss (kW) = (ṁ_steam × h_fg) / 3600.',
      targetValue: 25.19,
      unit: 'kW',
      tolerance: 0.4,
      solutionSteps: [
        'Energy per hour = 45 kg/h × 2015 kJ/kg = 90,675 kJ/h',
        'Divide by 3600 s/h: Q_loss = 90,675 / 3600 = 25.1875 kW ≈ 25.19 kW',
      ],
    },
    {
      id: 'vp-p5',
      prompt:
        'A 20 mm diameter valve stem has a 40 mm tall packing set exerting 10 MPa radial stress with friction coefficient μ = 0.12. Calculate the stem friction force in N (F_f = μ · P_radial · π · d · L).',
      hint: 'Contact area = π × 20 mm × 40 mm = 2513.3 mm². Multiply by 10 MPa (= N/mm²) and 0.12.',
      targetValue: 3016,
      unit: 'N',
      tolerance: 30,
      solutionSteps: [
        'Stem contact area A = π × 20 × 40 = 2513.27 mm²',
        'Friction force F_f = 0.12 × 10 N/mm² × 2513.27 mm² = 3015.9 N ≈ 3016 N',
      ],
    },
  ],
  quiz: [
    {
      id: 'vp-q1',
      question:
        'What is the primary consequence of over-tightening a control valve gland follower?',
      options: [
        'Increased stem friction (stiction), actuator hunting, and potential stem scoring',
        'Increased valve Cv capacity at low openings',
        'Immediate cavitation in the downstream piping',
        'Reduction of line pressure below vapor pressure',
      ],
      correctIndex: 0,
      explanation:
        'Excessive gland torque crushes the packing rings radially onto the stem, spiking friction force, causing jerky stick-slip control (hunting), and scoring the stem surface.',
    },
    {
      id: 'vp-q2',
      question:
        'What is the purpose of a brass lantern ring installed in the middle of a stuffing box packing set?',
      options: [
        'To lock the valve plug in the fully open position',
        'To distribute barrier lubricant or flush fluid evenly around the stem',
        'To increase the valve Cv by 25%',
        'To act as a sacrificial anode against steam erosion',
      ],
      correctIndex: 1,
      explanation:
        'A lantern ring sits between upper and lower packing rings and aligns with a bonnet port to inject grease, sealant, or clean flush fluid around the stem.',
    },
    {
      id: 'vp-q3',
      question:
        'Which valve type is specifically designed for accurate throttling control with an equal-percentage flow characteristic?',
      options: [
        'Standard wedge gate valve',
        'Globe control valve',
        'Full-bore ball valve',
        'Swing check valve',
      ],
      correctIndex: 1,
      explanation:
        'Globe valves are engineered for throttling and precise flow modulation, whereas gate valves are intended for full-open/full-closed isolation.',
    },
    {
      id: 'vp-q4',
      question:
        'Under EPA Method 21 leak detection, what fugitive emission concentration typically triggers mandatory valve packing repair?',
      options: ['5 ppm', '50 ppm', '500 ppm', '50,000 ppm'],
      correctIndex: 2,
      explanation:
        'Standard LDAR (Leak Detection and Repair) programs under EPA Method 21 define 500 ppm (or 10,000 ppm for older/less-strict units, 500 ppm for modern low-emission packing) as the action threshold for valve stem leaks.',
    },
    {
      id: 'vp-q5',
      question:
        'During an ultrasonic and IR inspection, a steam trap emits a continuous, steady high-frequency hiss and has nearly identical upstream and downstream pipe temperatures. What is the diagnosis?',
      options: [
        'The trap is functioning normally',
        'The trap is failed closed (condensate-logged)',
        'The trap is failed open (blowing live steam)',
        'The gland packing is over-tightened',
      ],
      correctIndex: 2,
      explanation:
        'A failed-open ("blowing") steam trap continuously passes live steam, producing a steady ultrasonic hiss and keeping the downstream condensate line near steam temperature.',
    },
    {
      id: 'vp-q6',
      question:
        'Why should gland follower nuts always be tightened evenly in small increments (e.g., 1/4 turn alternating sides)?',
      options: [
        'To prevent cocking the gland follower and scoring one side of the valve stem',
        'To reverse the direction of fluid flow through the seat',
        'To convert a globe valve into a quick-opening valve',
        'To lower the fluid specific gravity',
      ],
      correctIndex: 0,
      explanation:
        'Uneven tightening tilts (cocks) the gland follower, binding one side against the stem and leaving the opposite side under-compressed and prone to leaking.',
    },
  ],
};
