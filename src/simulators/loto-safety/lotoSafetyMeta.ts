import type { SimulatorMeta } from '../../types/simulator';
import './lotoSafetyI18n';

export const lotoSafetyMeta: SimulatorMeta = {
  id: 'loto-safety',
  title: 'LOTO (Lockout / Tagout) & Zero-Energy Verification Lab',
  shortTitle: 'LOTO & Zero-Energy',
  category: 'Diagnostic Instruments',
  difficulty: 'Beginner',
  description:
    'Master OSHA 1910.147 hazardous energy isolation across electrical MCCs, hydraulic accumulators, pneumatic gravity rams, and dual-feed conveyors using personal padlocks, danger tags, Live-Dead-Live multimeter testing, and Start Try-Out verification.',
  iconName: 'Zap',
  accentColor: 'amber',
  explore: [
    {
      title: 'OSHA 1910.147 Six-Step LOTO Sequence',
      summary:
        'Lockout/Tagout (LOTO) prevents unexpected energization, startup, or release of stored energy during equipment servicing. Every authorized employee must apply their own personal padlock and danger tag ("One Person, One Lock, One Key") after isolating all energy sources.',
      equations: [
        {
          label: 'Six Mandatory Steps (1910.147)',
          formula: '1. Notify → 2. Shutdown → 3. Isolate → 4. Lock/Tag → 5. Bleed/Block → 6. Verify',
          note: 'Never skip Step 2 (normal stop) before opening a load-break disconnect, and never skip Step 6 (verification).',
        },
        {
          label: 'Tag-Only Prohibition Rule',
          formula: 'Lockable Disconnect ⇒ Padlock + Danger Tag Required',
          note: 'A tag alone is only a warning device and does not physically restrain an energy-isolating device.',
        },
      ],
      workedExample: {
        title: 'Isolating a 480 V Centrifugal Pump for Mechanical Seal Replacement',
        given: [
          'Equipment: 480 V 3-phase centrifugal pump at 8.5 bar discharge pressure',
          'Task: Replace mechanical shaft seal (requires zero electrical and fluid energy)',
        ],
        steps: [
          'Notify operators and press normal Stop pushbutton at the local control station.',
          'Open the 480 V MCC disconnect switch, close suction and discharge isolation valves.',
          'Attach personal padlock and signed Danger Tag to the MCC handle and valve lockout hasps.',
          'Open the casing drain/bleed valve until the pressure gauge reads 0.0 bar.',
          'Perform Live-Dead-Live multimeter test (0.0 V AC) and press the Start pushbutton (Try-Out).',
        ],
        answer: 'Zero-Energy State verified (0 V AC, 0.0 bar, Try-Out negative) — safe to unbolt seal.',
      },
    },
    {
      title: 'Multi-Energy & Stored Energy Control (Fluid, Gravity, Capacitors)',
      summary:
        'Opening the main electrical breaker does not make a machine safe if stored mechanical, hydraulic, pneumatic, or capacitive energy remains. Accumulators, suspended press rams, and VFD DC bus capacitors can deliver lethal energy even when the MCC is locked out.',
      equations: [
        {
          label: 'VFD DC Bus Capacitor Discharge Time',
          formula: 't_safe ≥ 5 · τ = 5 · R_bleed · C_bus',
          note: 'Wait at least 5 time constants (typically 5–15 min per OEM) and verify < 50 V DC (0 V target) with a CAT IV meter.',
        },
        {
          label: 'Hydraulic Accumulator Stored Energy (Isothermal)',
          formula: 'E ≈ P · V · ln(P₁ / P₂)',
          note: 'Always open the accumulator bleed/dump valve and confirm 0 bar on a calibrated gauge before disconnecting hoses.',
        },
      ],
      workedExample: {
        title: 'Verifying a 650 V DC VFD Bus Discharge Before Enclosure Entry',
        given: [
          'VFD DC bus capacitance C = 4,700 µF (0.0047 F)',
          'Internal bleed resistor R = 100 kΩ (100,000 Ω)',
        ],
        steps: [
          'Calculate RC time constant: τ = R · C = 100,000 × 0.0047 = 470 s (wait, typical panel bleed is 20 kΩ → τ = 94 s; with 10 kΩ → τ = 47 s).',
          'For R = 10 kΩ and C = 4,700 µF: τ = 47 s, so 5τ = 5 × 47 = 235 s (≈ 4 minutes).',
          'Measure across +DC and -DC terminals with a CAT IV multimeter to confirm 0 V DC.',
        ],
        answer: 'Wait 5τ (235 s for 10 kΩ/4700 µF) and confirm 0 V DC directly with a meter.',
      },
    },
    {
      title: 'Live-Dead-Live Verification & Try-Out Protocol',
      summary:
        'A multimeter with a blown fuse or dead battery will falsely read 0 V on a live 480 V circuit. The Live-Dead-Live (Test-Before-Touch) protocol proves the meter works immediately before and after checking the isolated equipment, followed by a physical Start Try-Out.',
      equations: [
        {
          label: 'Live-Dead-Live (Test-Before-Touch)',
          formula: '1. Test Known LIVE → 2. Test Target DEAD (0 V) → 3. Re-Test Known LIVE',
          note: 'Measure Phase-to-Phase (L1-L2, L2-L3, L3-L1) and Phase-to-Ground (L1-G, L2-G, L3-G).',
        },
        {
          label: 'Dual-Feed / Backfeed Check',
          formula: 'V_residual = 0 V AC/DC on ALL control & power terminals',
          note: 'Foreign control voltage (120 V / 24 V) from PLC interlocks often remains live after main 480 V MCC lockout.',
        },
      ],
    },
  ],
  practice: [
    {
      id: 'loto-p1',
      prompt:
        'A VFD DC bus has capacitance C = 2,000 µF (0.002 F) and a discharge bleed resistor R = 15,000 Ω. Calculate the minimum safe discharge wait time (5τ) in seconds.',
      hint: 'Use τ = R × C, then multiply by 5.',
      targetValue: 150,
      unit: 's',
      tolerance: 1,
      solutionSteps: [
        'Calculate time constant τ = R × C = 15,000 Ω × 0.002 F = 30 s.',
        'Full discharge requires 5τ = 5 × 30 s = 150 s.',
      ],
    },
    {
      id: 'loto-p2',
      prompt:
        'A dual-feed conveyor has 1 main 480 V MCC disconnect, 1 secondary 120 V control disconnect, and 1 pneumatic air lockout valve. If 3 maintenance technicians are working simultaneously under individual LOTO, how many personal padlocks are required in total?',
      hint: 'Each technician must place 1 personal padlock on every isolation point (3 points × 3 technicians).',
      targetValue: 9,
      unit: 'locks',
      tolerance: 0,
      solutionSteps: [
        'Number of energy-isolating points = 3.',
        'Number of authorized technicians = 3.',
        'Total padlocks = 3 points × 3 technicians = 9 personal padlocks (or 3 group lockbox hasp locks).',
      ],
    },
    {
      id: 'loto-p3',
      prompt:
        'A hydraulic accumulator holds 210 bar. After closing the pump isolation valve, you open the bleed valve and pressure drops linearly at 35 bar/s. How many seconds does it take to reach 0 bar?',
      hint: 'Time = Initial Pressure / Bleed Rate.',
      targetValue: 6,
      unit: 's',
      tolerance: 0.2,
      solutionSteps: [
        'Initial pressure P = 210 bar.',
        'Bleed rate = 35 bar/s.',
        'Time to 0 bar = 210 / 35 = 6 s.',
      ],
    },
    {
      id: 'loto-p4',
      prompt:
        'In a 3-phase 480 V MCC Live-Dead-Live check, how many distinct voltage measurements are taken on the isolated load side (all phase-to-phase pairs plus all phase-to-ground pairs)?',
      hint: 'Count L1-L2, L2-L3, L3-L1 plus L1-G, L2-G, L3-G.',
      targetValue: 6,
      unit: 'readings',
      tolerance: 0,
      solutionSteps: [
        'Phase-to-phase pairs: L1-L2, L2-L3, L3-L1 (3 readings).',
        'Phase-to-ground pairs: L1-G, L2-G, L3-G (3 readings).',
        'Total load-side readings = 3 + 3 = 6 readings.',
      ],
    },
  ],
  quiz: [
    {
      id: 'loto-q1',
      question: 'Why must a technician perform the third step ("Re-test known LIVE source") in Live-Dead-Live verification?',
      options: [
        'To discharge any residual capacitance in the multimeter',
        'To prove the multimeter did not fail or blow a fuse during the test',
        'To reset the MCC trip unit before applying a padlock',
        'To calibrate the pressure gauge to 0 bar',
      ],
      correctIndex: 1,
      explanation:
        'Re-testing a known live source confirms the meter was functioning properly both before and after measuring 0 V on the isolated equipment.',
    },
    {
      id: 'loto-q2',
      question: 'Under OSHA 1910.147, when is a "Tag-Only" isolation (Danger Tag without a padlock) permitted on a lockable disconnect?',
      options: [
        'Whenever the maintenance job takes less than 15 minutes',
        'Never — if an energy-isolating device is capable of being locked out, a padlock must be used',
        'Only when the supervisor signs a hot-work permit',
        'Whenever the circuit voltage is below 240 V',
      ],
      correctIndex: 1,
      explanation:
        'OSHA 1910.147 requires a physical lockout device whenever the isolating device is lockable; tags alone provide no physical restraint.',
    },
    {
      id: 'loto-q3',
      question: 'You lock out the 480 V pump MCC and close the hydraulic press isolation valve, but the pressure gauge still reads 210 bar. What is the cause?',
      options: [
        'Trapped energy in the hydraulic accumulator — the bleed/dump valve has not been opened',
        'The multimeter battery is low',
        'The gravity block is too heavy',
        'The Start pushbutton was not pressed',
      ],
      correctIndex: 0,
      explanation:
        'Closing an isolation valve traps downstream pressure. You must open the bleed/dump valve to relieve stored accumulator pressure to 0 bar.',
    },
    {
      id: 'loto-q4',
      question: 'What hazard can remain energized inside a control cabinet even after the main 480 V MCC disconnect is locked out?',
      options: [
        'Centrifugal pump impeller inertia only',
        'A secondary 120 V / 24 V control interlock backfeed from another panel',
        'Atmospheric air pressure',
        'Static friction in the padlock shackle',
      ],
      correctIndex: 1,
      explanation:
        'Foreign/secondary control circuits (dual backfeed) often originate from a separate MCC or PLC panel and remain live until separately isolated.',
    },
    {
      id: 'loto-q5',
      question: 'What is the purpose of the "Try-Out" step (pressing the normal Start pushbutton) after locking out?',
      options: [
        'To warm up the motor bearings before disassembly',
        'To verify that the correct disconnect was isolated and the equipment cannot start',
        'To drain the hydraulic reservoir',
        'To test the emergency stop light bulb',
      ],
      correctIndex: 1,
      explanation:
        'Try-Out physically confirms that the isolated machine will not start—catching mislabeled breakers or missed energy sources.',
    },
  ],
};
