import type { SimulatorMeta } from '../../types/simulator';

export const laserTachometerMeta: SimulatorMeta = {
  id: 'laser-tachometer',
  title: 'Laser Tachometer & Stroboscope',
  shortTitle: 'Laser Tach & Strobe',
  category: 'Diagnostic Instruments',
  difficulty: 'Beginner',
  description:
    'Non-contact optical laser tachometer and digital xenon stroboscope lab for measuring VFD-driven induction motor shaft RPM, RPS (Hz), angular velocity (rad/s), slip, and diagnosing stroboscopic harmonics and alias drift.',
  iconName: 'ScanLine',
  accentColor: 'cyan',
  explore: [
    {
      title: 'Optical Laser Tachometer: Reflective Pulse Counting',
      summary:
        'A non-contact optical laser tachometer projects a narrow Class 2 red laser beam (650 nm) onto a rotating shaft fitted with retro-reflective tape. Each revolution returns a sharp optical pulse to the photodiode, enabling precise RPM, RPS (Hz), and angular velocity (ω) calculation without adding mechanical drag.',
      equations: [
        {
          label: 'Rotational Speed from Pulse Frequency',
          formula: 'RPM = (60 · f_pulse) / N_marks',
          note: 'f_pulse is pulse frequency in Hz (RPS); N_marks = 1 for a single reflective tape strip.',
        },
        {
          label: 'Angular Velocity (rad/s)',
          formula: 'ω = (2π · RPM) / 60 = 2π · RPS',
          note: 'Converts shaft speed into SI angular velocity for torque and power calculations.',
        },
      ],
      workedExample: {
        title: 'Computing Shaft RPM & Angular Velocity from Optical Pulses',
        given: [
          'Single retro-reflective tape strip on a fan coupling (N_marks = 1)',
          'Optical photodiode measures pulse rate f_pulse = 24.35 Hz',
        ],
        steps: [
          'Compute shaft speed in RPM: RPM = (60 × 24.35) / 1 = 1461 RPM.',
          'Verify revolutions per second: RPS = 1461 / 60 = 24.35 Hz.',
          'Compute angular velocity: ω = 2π × 24.35 = 153.0 rad/s.',
        ],
        answer: '1461 RPM (24.35 RPS, ω = 153.0 rad/s)',
      },
    },
    {
      title: 'Stroboscope Aliasing, Harmonics & Sub-Harmonic Traps',
      summary:
        'A stroboscope freezes rotating machinery optically by flashing at rate FPM (flashes per minute). When FPM equals true shaft RPM, a single stationary image appears. However, flashing at 2 × RPM produces a harmonic double-image (180° apart), while flashing at RPM / 2 also produces a single stationary image—a classic field trap.',
      equations: [
        {
          label: 'True Fundamental Verification',
          formula: 'At FPM = RPM: 1 image  |  At 2 × FPM: 2 images (180° apart)',
          note: 'Always double the freeze-frame FPM to confirm it is not a sub-harmonic (RPM/2, RPM/3).',
        },
        {
          label: 'Apparent Alias Drift Speed',
          formula: 'RPM_apparent = [(RPM / FPM) mod 1] (±wrapped) × FPM',
          note: 'If FPM < RPM slightly, the mark drifts forward; if FPM > RPM slightly, it drifts backward.',
        },
      ],
      workedExample: {
        title: 'Avoiding the Stroboscope Sub-Harmonic Trap on a 4-Pole Fan',
        given: [
          'Stroboscope shows a single frozen reflective mark at FPM = 730',
          'Operator doubles the flash rate to FPM = 1460',
        ],
        steps: [
          'If 730 FPM were the true shaft speed, doubling to 1460 FPM would show 2 images 180° apart.',
          'Instead, at 1460 FPM the mark remains a single sharp stationary image.',
          'Doubling again to 2920 FPM finally produces a double-image (180° apart).',
          'Therefore 1460 RPM is the true fundamental speed and 730 FPM was the 1/2 sub-harmonic.',
        ],
        answer: 'True shaft speed = 1460 RPM (730 FPM was RPM/2 sub-harmonic)',
      },
    },
    {
      title: 'VFD Induction Motor Speed & Mechanical Load Slip',
      summary:
        'In a VFD-driven AC induction motor, stator field synchronous speed Ns depends on supply frequency and pole count. Under shaft load torque, the rotor lags behind Ns by slip s% to induce rotor current and generate torque.',
      equations: [
        {
          label: 'Synchronous Field Speed (Ns)',
          formula: 'N_s = (120 · f) / P',
          note: 'f = VFD frequency (10–60 Hz), P = number of magnetic poles (2, 4, 6, 8).',
        },
        {
          label: 'Rotor Slip & Actual Shaft Speed',
          formula: 's% = [(N_s - N_r) / N_s] × 100%   ⇒   N_r = N_s · (1 - s)',
          note: 'Loaded industrial motors typically exhibit 2% to 4.5% slip at full rated torque.',
        },
      ],
      workedExample: {
        title: 'Predicting Loaded Shaft Speed on a 6-Pole VFD Conveyor',
        given: [
          '6-pole induction motor driven at f = 40 Hz by VFD',
          'Measured slip under conveyor load s = 3.2%',
        ],
        steps: [
          'Calculate synchronous speed: Ns = (120 × 40) / 6 = 800 RPM.',
          'Compute actual rotor speed: Nr = 800 × (1 - 0.032) = 774.4 RPM.',
          'Verify expected optical pulse rate: f_pulse = 774.4 / 60 = 12.91 Hz.',
        ],
        answer: 'Ns = 800 RPM, Actual Shaft Speed Nr = 774.4 RPM (12.91 RPS)',
      },
    },
  ],
  practice: [
    {
      id: 'tach-p1',
      prompt:
        'A 4-pole induction motor is driven by a VFD at 45 Hz. If the measured load slip is 3.0%, what shaft speed (in RPM) will the laser tachometer display?',
      hint: 'First compute synchronous speed Ns = (120 × f) / P, then multiply by (1 - 0.03).',
      targetValue: 1309.5,
      unit: 'RPM',
      tolerance: 1.5,
      solutionSteps: [
        'Synchronous speed: Ns = (120 × 45) / 4 = 1350 RPM.',
        'Apply 3.0% slip: Nr = 1350 × (1 - 0.03) = 1309.5 RPM.',
      ],
    },
    {
      id: 'tach-p2',
      prompt:
        'A laser tachometer counts 48.0 optical pulses per second from a single reflective tape strip on a 2-pole pump coupling. Calculate the shaft angular velocity ω in rad/s.',
      hint: 'With 1 tape strip, RPS = 48.0 Hz. Use ω = 2π × RPS.',
      targetValue: 301.59,
      unit: 'rad/s',
      tolerance: 1.0,
      solutionSteps: [
        'Pulse rate f_pulse = 48.0 Hz equals 48.0 RPS (2880 RPM).',
        'Angular velocity: ω = 2 × π × 48.0 = 301.59 rad/s.',
      ],
    },
    {
      id: 'tach-p3',
      prompt:
        'A stroboscope freezes a fan blade with a single stationary image at 1800 FPM, and shows a double image (two marks 180° apart) at 3600 FPM. What is the true fan speed in RPM?',
      hint: 'A double image at 2 × FPM confirms that the lower single-image FPM is the 1:1 fundamental.',
      targetValue: 1800,
      unit: 'RPM',
      tolerance: 1.0,
      solutionSteps: [
        'Single image at 1800 FPM could be fundamental (1×) or a sub-harmonic (1/2×, 1/3×).',
        'Doubling to 3600 FPM splits the mark into 2 images 180° apart, proving 3600 FPM = 2 × RPM.',
        'Therefore, true fan speed = 1800 RPM.',
      ],
    },
  ],
  quiz: [
    {
      id: 'tach-q1',
      question:
        'When inspecting a shaft with a stroboscope, you see TWO sharp stationary images of the reflective tape 180° apart. What does this indicate?',
      options: [
        'The stroboscope FPM is set to half the shaft RPM (sub-harmonic)',
        'The stroboscope FPM is set to twice the shaft RPM (2× harmonic)',
        'The shaft has bent and is vibrating at 2× line frequency',
        'The reflective tape has peeled off',
      ],
      correctIndex: 1,
      explanation:
        'At FPM = 2 × RPM, the flash fires every 180° of shaft rotation, illuminating the single tape mark at opposite sides of the shaft on alternating flashes.',
    },
    {
      id: 'tach-q2',
      question:
        'In stroboscope mode, if the flash rate (FPM) is set slightly HIGHER than the true shaft RPM (e.g., 1505 FPM on a 1500 RPM shaft), how does the mark appear to move?',
      options: [
        'It freezes completely motionless',
        'It drifts slowly FORWARD in the direction of rotation',
        'It drifts slowly BACKWARD opposite to the direction of rotation',
        'It splits into four stationary marks',
      ],
      correctIndex: 2,
      explanation:
        'When FPM > RPM, the flash fires slightly before the shaft completes a full 360° turn, so each successive flash catches the mark slightly behind its previous angle—creating backward alias drift.',
    },
    {
      id: 'tach-q3',
      question:
        'Why is a non-contact laser tachometer preferred over a contact wheel tachometer on small fractional-horsepower motors?',
      options: [
        'Contact wheels cannot measure speeds above 500 RPM',
        'Optical laser beams impose zero mechanical drag, preventing speed drop on low-torque shafts',
        'Laser tachometers automatically measure winding insulation resistance',
        'Reflective tape increases motor efficiency',
      ],
      correctIndex: 1,
      explanation:
        'Pressing a mechanical contact wheel against a low-torque shaft introduces friction load that slows the motor down and distorts the reading; a laser beam exerts zero mechanical load.',
    },
    {
      id: 'tach-q4',
      question:
        'How does increasing mechanical load torque on an induction motor affect its laser tachometer RPM reading at a fixed VFD frequency?',
      options: [
        'Rotor RPM decreases slightly as slip increases',
        'Rotor RPM increases above synchronous speed',
        'Synchronous speed Ns decreases proportionally',
        'Rotor RPM stays locked at Ns = 120f/P regardless of load',
      ],
      correctIndex: 0,
      explanation:
        'Synchronous speed Ns depends only on frequency and pole count, but higher load torque requires greater slip s%, reducing actual rotor speed Nr = Ns(1 - s).',
    },
  ],
};
