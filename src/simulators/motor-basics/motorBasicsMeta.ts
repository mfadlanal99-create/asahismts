import type { SimulatorMeta } from '../../types/simulator';
import './motorBasicsI18n';

export const motorBasicsMeta: SimulatorMeta = {
  id: 'motor-basics',
  title: 'Beginner: Electric Motor Types, Nameplate & Star/Delta Lab',
  shortTitle: 'Electric Motor Basics',
  description:
    'Beginner-friendly industrial motor lab covering electric drive types (3-Phase AC TEFC, Single-Phase Cap-Start, VFD Inverter-Duty, BLDC, Servo, Stepper), IEC mounting codes (B3 Foot, B5 Flange, B14 Face), pole count sync RPM (2P/4P/6P at 50/60 Hz), IP54–IP65 enclosures, and Star (Y) vs Delta (Δ) 6-stud terminal jumper wiring.',
  category: 'Machine Elements',
  difficulty: 'Beginner',
  iconName: 'Cpu',
  accentColor: 'cyan',
  explore: [
    {
      title: 'Synchronous Speed, Pole Count (2P/4P/6P) & Induction Slip',
      summary:
        'In an AC induction motor, the stator magnetic field rotates at synchronous speed Ns determined by AC supply frequency (50 Hz or 60 Hz) and magnetic pole count (2, 4, or 6 poles). A squirrel-cage rotor must spin slightly slower than Ns to induce rotor current; this difference is called Slip.',
      equations: [
        {
          label: 'Stator Synchronous Speed (Ns)',
          formula: 'N_s = (120 · f) / p',
          note: 'f = line frequency (Hz), p = pole count (2, 4, 6). Example 4P 50 Hz: (120×50)/4 = 1500 RPM.',
        },
        {
          label: 'Rotor Slip Percentage (s)',
          formula: 's = [(N_s - N_r) / N_s] × 100%',
          note: 'Nr = loaded shaft RPM (e.g., 1440 RPM for 4P 50 Hz gives 4% slip).',
        },
        {
          label: 'Rated Output Shaft Torque (T)',
          formula: 'T = P / ω = P / (2π · N_r / 60)',
          note: 'For a 4.0 kW motor at 1440 RPM (150.8 rad/s), T ≈ 26.5 N·m.',
        },
      ],
      workedExample: {
        title: 'Decoding Speed, Slip & Torque on a 4P 50 Hz Motor Nameplate',
        given: [
          '3-Phase TEFC Induction Motor 4.0 kW, 4 Poles (4P), 50 Hz',
          'Nameplate full-load shaft speed (Nr) = 1440 RPM',
        ],
        steps: [
          'Calculate synchronous field speed: Ns = (120 × 50) / 4 = 1500 RPM.',
          'Calculate full-load slip: s = [(1500 - 1440) / 1500] × 100% = 4.0%.',
          'Calculate angular velocity: ω = 2π × 1440 / 60 = 150.8 rad/s.',
          'Calculate shaft torque: T = 4000 W / 150.8 rad/s = 26.5 N·m.',
        ],
        answer: 'Ns = 1500 RPM, Slip = 4.0%, Rated Torque = 26.5 N·m',
      },
    },
    {
      title: 'Terminal Box Wiring: Star (Y) vs Delta (Δ) & Nameplate Matching',
      summary:
        'A 3-phase industrial motor exposes 6 winding studs (U1, V1, W1 and W2, U2, V2) inside its terminal box. Brass jumper orientation dictates whether each phase coil receives full line voltage (Delta) or line voltage divided by √3 (Star). Wiring a 230/400V motor in Delta on a 400V grid burns the coils rapidly.',
      equations: [
        {
          label: 'Star (Y) Phase Coil Voltage',
          formula: 'V_phase = V_line / √3  (≈ 0.577 × V_line)',
          note: 'Single horizontal jumper across W2–U2–V2 creates the neutral star point. 400V grid -> 230V per coil.',
        },
        {
          label: 'Delta (Δ) Phase Coil Voltage',
          formula: 'V_phase = V_line',
          note: 'Three vertical jumpers (U1–W2, V1–U2, W1–V2). Full torque output, ~3× starting current vs Star.',
        },
      ],
      workedExample: {
        title: 'Selecting Star vs Delta Links for a 400 V Plant Supply',
        given: [
          'Plant mains supply: 3-Phase 400 V line-to-line, 50 Hz',
          'Motor nameplate rating: 230/400 V Δ/Y, 14.5/8.4 A',
        ],
        steps: [
          'Identify individual coil voltage rating: the lower value (230 V) is the maximum voltage per winding (Delta rating).',
          'Because line supply is 400 V (> 230 V), Delta wiring would over-voltage each winding by 73%.',
          'Wire the terminal block in STAR (Y) using one horizontal brass link bridging W2–U2–V2.',
          'Verify coil stress: V_phase = 400 / √3 = 230.9 V (safe), nominal line current = 8.4 A.',
        ],
        answer: 'Wire in STAR (Y) with the horizontal jumper bridging W2–U2–V2.',
      },
    },
    {
      title: 'IEC Mounting (B3/B5/B14), IP Ratings (IP54–IP65) & Specialized Motors',
      summary:
        'Proper motor specification also includes mechanical mounting geometry (B3 rigid feet, B5 large flange, or B14 tapped face), environmental sealing against dust and water (IEC 60529 IP code), and drive architecture—ranging from VFD inverter-duty AC motors with insulated bearings to closed-loop Servos, BLDC, and open-loop Steppers.',
      equations: [
        {
          label: 'IEC 60529 IP Code Structure',
          formula: '1st Digit (Dust: 5=Protected, 6=Dust-Tight) | 2nd Digit (Water: 4=Splash, 5=Jets)',
          note: 'IP55 is standard for industrial plant floors; IP65 is mandatory for washdown and marine decks.',
        },
      ],
      workedExample: {
        title: 'Specifying a Washdown Variable-Speed Conveyor Drive',
        given: [
          'Duty: Continuous VFD variable-speed control from 15 Hz to 60 Hz',
          'Environment: Food & beverage packaging line with pressurized hose washdown',
        ],
        steps: [
          'Select a VFD Inverter-Duty motor with independent constant-speed blower cooling at 15 Hz and insulated NDE bearings to prevent EDM fluting.',
          'Specify IP65 sealing for total dust-tight protection and resistance to direct water jets.',
          'Select B5 or B14 flange mounting for direct close-coupling onto an inline conveyor gearbox.',
        ],
        answer: 'Specify an IP65 VFD Inverter-Duty Motor with B5 or B14 flange mounting.',
      },
    },
  ],
  practice: [
    {
      id: 'p1',
      prompt:
        'Calculate the synchronous magnetic field speed Ns (RPM) of a 4-Pole (4P) AC induction motor running on a 50 Hz supply.',
      hint: 'Use Ns = (120 × f) / p with f = 50 Hz and p = 4.',
      targetValue: 1500,
      unit: 'RPM',
      tolerance: 5,
      solutionSteps: [
        'Use the synchronous speed equation: Ns = (120 × f) / p.',
        'Substitute values: Ns = (120 × 50) / 4 = 6000 / 4 = 1500 RPM.',
      ],
    },
    {
      id: 'p2',
      prompt:
        'Calculate the synchronous speed Ns (RPM) of a high-speed 2-Pole (2P) AC induction motor connected to a 60 Hz power grid.',
      hint: 'Substitute f = 60 Hz and p = 2 into Ns = (120 × f) / p.',
      targetValue: 3600,
      unit: 'RPM',
      tolerance: 10,
      solutionSteps: [
        'Use the synchronous speed equation: Ns = (120 × f) / p.',
        'Substitute values: Ns = (120 × 60) / 2 = 3600 RPM.',
      ],
    },
    {
      id: 'p3',
      prompt:
        'A 4-pole, 50 Hz induction motor (Ns = 1500 RPM) runs at 1440 RPM under full rated load. Calculate its rotor slip percentage (%).',
      hint: 'Slip (%) = [(Ns - Nr) / Ns] × 100%.',
      targetValue: 4,
      unit: '%',
      tolerance: 0.2,
      solutionSteps: [
        'Compute slip speed difference: 1500 - 1440 = 60 RPM.',
        'Compute slip percentage: (60 / 1500) × 100% = 4.0%.',
      ],
    },
    {
      id: 'p4',
      prompt:
        'A 3-phase motor is wired in Star (Y) and connected to a 400 V line-to-line supply. What voltage (V) is applied across each phase coil winding (rounded to nearest volt)?',
      hint: 'In Star wiring, V_phase = V_line / √3 ≈ 400 / 1.732.',
      targetValue: 231,
      unit: 'V',
      tolerance: 2,
      solutionSteps: [
        'Star connection divides line voltage by √3 across series phase windings.',
        'V_phase = 400 / 1.73205 ≈ 230.9 V (≈ 231 V).',
      ],
    },
    {
      id: 'p5',
      prompt:
        'Calculate the rated shaft torque (N·m) of a 4.0 kW (4000 W) motor delivering rated power at 1440 RPM.',
      hint: 'First compute ω = 2π × 1440 / 60 ≈ 150.8 rad/s, then divide T = P / ω.',
      targetValue: 26.5,
      unit: 'N·m',
      tolerance: 0.5,
      solutionSteps: [
        'Compute angular velocity: ω = 2π × 1440 / 60 = 150.796 rad/s.',
        'Compute shaft torque: T = 4000 W / 150.796 rad/s ≈ 26.53 N·m.',
      ],
    },
  ],
  quiz: [
    {
      id: 'q1',
      question:
        'Which copper jumper bar arrangement on an IEC 6-stud terminal block produces a Star (Y) connection?',
      options: [
        'A single horizontal brass bar bridging W2 – U2 – V2 together as the neutral star point',
        'Three vertical brass bars bridging (U1–W2), (V1–U2), and (W1–V2)',
        'Six jumper bars shorting all top and bottom terminals into one common node',
        'No jumper bars installed so the motor windings remain open-circuited',
      ],
      correctIndex: 0,
      explanation:
        'In Star (Y) wiring, a single horizontal copper bar shorts the upper coil ends W2–U2–V2 together to create the neutral star point while L1, L2, and L3 feed U1, V1, and W1.',
    },
    {
      id: 'q2',
      question:
        'A motor nameplate reads "230/400 V Δ/Y". How must it be wired when connected directly to a standard 400 V three-phase supply?',
      options: [
        'Star (Y) connection, so each 230 V phase winding receives 400 / √3 ≈ 230 V',
        'Delta (Δ) connection, so each winding receives the full 400 V for extra torque',
        'Either Star or Delta works identically without overheating the insulation',
        'With a single-phase electrolytic start capacitor across terminals U1 and V1',
      ],
      correctIndex: 0,
      explanation:
        'On a 230/400V rated motor, 230V is the maximum voltage rating per individual coil (Delta rating). On a 400V line supply, you must wire the motor in Star (Y) so each winding receives 400 / √3 = 230 V.',
    },
    {
      id: 'q3',
      question:
        'What is the key mechanical difference between IEC B5 flange mounting and B14 face mounting?',
      options: [
        'B5 uses a large flange (wider than the frame) with through clearance holes; B14 uses a compact flange with blind tapped metric threads',
        'B5 bolts to floor rails via four base feet, while B14 hangs from overhead belts',
        'B5 is strictly for brushed DC motors, while B14 is exclusive to steppers',
        'B5 always has a double-ended shaft, whereas B14 lacks a shaft keyway',
      ],
      correctIndex: 0,
      explanation:
        'A B5 mount has an oversized flange larger than the stator housing with unthreaded clearance holes, whereas a B14 face mount has a smaller bolt circle inside the frame profile with blind tapped threads.',
    },
    {
      id: 'q4',
      question:
        'What level of environmental protection does an IP65 motor enclosure rating guarantee?',
      options: [
        'Total dust-tight sealing (6) and protection against water jets projected from a nozzle in any direction (5)',
        'Protection only against vertical dripping water and solid objects larger than 12 mm',
        'Continuous underwater submersion up to 10 meters depth in seawater',
        'Open drip-proof ventilation restricted to clean indoor HVAC rooms',
      ],
      correctIndex: 0,
      explanation:
        'Under IEC 60529, first digit "6" means completely dust-tight, and second digit "5" means protected against pressurized water jets from any direction.',
    },
    {
      id: 'q5',
      question:
        'Why do VFD Inverter-Duty AC motors often include an independent cooling blower and insulated bearings?',
      options: [
        'Shaft-mounted fans lose airflow at low VFD RPM, while high-frequency PWM voltages induce EDM shaft currents that flute bearings',
        'To double synchronous motor speed to 6000 RPM on a 50 Hz grid',
        'To allow an induction motor to run without stator copper windings',
        'To rectify 3-phase AC supply into 12 V DC battery power',
      ],
      correctIndex: 0,
      explanation:
        'Running a standard motor slowly on a VFD reduces shaft fan cooling dramatically. Independent blowers maintain airflow at low speed, and insulated bearings block PWM-induced electrical discharge machining (EDM) fluting.',
    },
    {
      id: 'q6',
      question:
        'Which electric motor type advances in discrete angular pulses (typically 1.8° = 200 steps/rev) in open-loop control with high zero-speed holding torque?',
      options: [
        'Hybrid Stepper Motor',
        'Single-Phase Capacitor Start Motor',
        '3-Phase Squirrel-Cage TEFC Induction Motor',
        'Universal Series Wound Motor',
      ],
      correctIndex: 0,
      explanation:
        'A Hybrid Stepper Motor steps precisely by 1.8° per current pulse without needing closed-loop encoder feedback for moderate loads, and generates strong holding torque when energized at standstill.',
    },
  ],
};
