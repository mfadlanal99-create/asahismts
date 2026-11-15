import type { SimulatorMeta } from '../../types/simulator';
import './caliperI18n';

export const caliperMeta: SimulatorMeta = {
  id: 'caliper',
  title: 'Vernier Caliper & Micrometer Simulator',
  shortTitle: 'Caliper & Micrometer',
  category: 'Precision Measurement',
  difficulty: 'Beginner',
  description:
    'Interactive precision metrology lab for reading 0.02 mm and 0.05 mm vernier calipers and 0.01 mm outside micrometers, complete with a magnifier loupe, zero-error compensation, and self-test mode.',
  iconName: 'Gauge',
  accentColor: 'sky',
  explore: [
    {
      title: 'Least Count & Scale Resolution',
      summary:
        'Least count (LC) is the smallest increment an instrument can reliably resolve. A vernier scale achieves sub-millimeter resolution by making N vernier divisions slightly shorter than an integer number of main-scale divisions; a micrometer achieves 0.01 mm resolution using a precision 0.5 mm pitch screw and a 50-division rotating thimble.',
      equations: [
        {
          label: 'Vernier Least Count (General)',
          formula: 'LC = 1 MSD / N',
          note: 'Where 1 MSD = 1.00 mm and N is the number of vernier divisions (50 -> 0.02 mm; 20 -> 0.05 mm).',
        },
        {
          label: 'Vernier Division Length',
          formula: '1 VSD = ((k * MSD) - LC)',
          note: '0.02 mm caliper: 50 VSD = 49 mm (1 VSD = 0.98 mm). 0.05 mm caliper: 20 VSD = 39 mm (1 VSD = 1.95 mm).',
        },
        {
          label: 'Micrometer Least Count',
          formula: 'LC = Pitch / N_thimble = 0.50 mm / 50 = 0.01 mm',
          note: 'One full turn of the thimble advances the spindle by 0.50 mm.',
        },
      ],
      workedExample: {
        title: 'Calculating Least Count for a 20-Division Vernier Caliper',
        given: [
          'Main scale division (1 MSD) = 1.00 mm',
          '20 vernier scale divisions span 39 mm on the main scale',
        ],
        steps: [
          'Length of 1 vernier division: 1 VSD = 39 mm / 20 = 1.95 mm.',
          'Each vernier division is compared against 2 main scale divisions (2.00 mm).',
          'Least Count = 2.00 mm - 1.95 mm = 0.05 mm (equivalently 1.00 mm / 20).',
        ],
        answer: 'LC = 0.05 mm',
      },
    },
    {
      title: 'Reading Vernier Calipers vs. Outside Micrometers',
      summary:
        'Both instruments combine a coarse fixed reading with a fine fractional reading. On a vernier caliper, read the last whole millimeter to the left of the vernier zero (MSR), then find the single vernier tick that aligns squarely with any main-scale tick. On a micrometer, read the exposed millimeter and half-millimeter marks on the sleeve, then add the thimble division aligned with the horizontal datum line.',
      equations: [
        {
          label: 'Vernier Caliper Total Reading',
          formula: 'Reading = MSR + (VSR * LC)',
          note: 'MSR = Main Scale Reading just left of vernier 0; VSR = coinciding vernier division index.',
        },
        {
          label: 'Micrometer Total Reading',
          formula: 'Reading = Sleeve_mm + (0.50 if half-mm visible) + (Thimble_div * 0.01 mm)',
          note: 'Check carefully whether the 0.5 mm sub-mark past the last whole mm is exposed.',
        },
      ],
      workedExample: {
        title: 'Reading an Outside Micrometer with Exposed 0.5 mm Mark',
        given: [
          'Upper sleeve scale shows 17 mm mark clearly exposed',
          'Lower sleeve scale shows the 0.5 mm mark after 17 mm is visible',
          'Thimble division 34 aligns with the horizontal datum line',
        ],
        steps: [
          'Whole millimeter sleeve reading = 17.00 mm.',
          'Half-millimeter mark is visible past 17 mm -> add 0.50 mm (sleeve = 17.50 mm).',
          'Thimble contribution = 34 * 0.01 mm = 0.34 mm.',
          'Total reading = 17.50 + 0.34 = 17.84 mm.',
        ],
        answer: '17.84 mm',
      },
    },
    {
      title: 'Zero Error, Parallax & Measurement Technique',
      summary:
        'Before measuring, close the jaws (or bring anvil and spindle together using the ratchet stop) and verify the zero mark aligns. Any offset is a systematic zero error that must be subtracted algebraically from every observed reading. Always view the scale perpendicularly to eliminate parallax error, and use the micrometer ratchet stop to apply repeatable contact force.',
      equations: [
        {
          label: 'Zero-Error Correction',
          formula: 'True Reading = Observed Reading - Zero Error',
          note: 'Positive zero error (+e) reads too high and is subtracted; negative zero error (-e) reads too low, so subtracting -e adds |e|.',
        },
        {
          label: 'Negative Zero Error (Vernier)',
          formula: 'Zero Error = -(N - coinciding_div) * LC',
          note: 'When vernier 0 sits left of main-scale 0, count back from N (or read directly with sign).',
        },
      ],
      workedExample: {
        title: 'Correcting a Measurement with Negative Zero Error',
        given: [
          '0.02 mm vernier caliper has a zero error of -0.04 mm when jaws are closed',
          'Observed reading on a pump shaft OD = 24.32 mm',
        ],
        steps: [
          'Identify zero error with its sign: Zero Error = -0.04 mm.',
          'Apply correction formula: True Reading = Observed - Zero Error.',
          'True Reading = 24.32 mm - (-0.04 mm) = 24.32 + 0.04 = 24.36 mm.',
        ],
        answer: '24.36 mm',
      },
    },
  ],
  practice: [
    {
      id: 'caliper-p1',
      prompt:
        'On a 0.02 mm vernier caliper, the vernier zero sits just past 28 mm, and the 18th vernier division (labeled 3.6 / 0.36 mm) aligns with a main-scale mark. What is the reading in mm?',
      hint: 'Use Reading = MSR + (VSR * 0.02 mm). Here MSR = 28 mm and VSR = 18.',
      targetValue: 28.36,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'MSR = 28.00 mm (last whole mm mark to the left of vernier 0).',
        'Vernier contribution = 18 * 0.02 mm = 0.36 mm.',
        'Total reading = 28.00 + 0.36 = 28.36 mm.',
      ],
    },
    {
      id: 'caliper-p2',
      prompt:
        'A 0.05 mm vernier caliper has a positive zero error of +0.05 mm. While measuring a bearing bore, the MSR is 32 mm and the 10th vernier division aligns. Calculate the true bore diameter in mm.',
      hint: 'First compute the observed reading (32 + 10 * 0.05), then subtract the +0.05 mm zero error.',
      targetValue: 32.45,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'Observed reading = 32.00 + (10 * 0.05) = 32.50 mm.',
        'True reading = Observed - Zero Error = 32.50 - (+0.05) = 32.45 mm.',
      ],
    },
    {
      id: 'caliper-p3',
      prompt:
        'An outside micrometer (0.01 mm LC, 0.5 mm pitch) shows the 12 mm mark and the following 0.5 mm mark on the sleeve. The 24th thimble division aligns with the datum line. What is the reading in mm?',
      hint: 'Sleeve reading is 12.50 mm because the 0.5 mm mark after 12 mm is visible.',
      targetValue: 12.74,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'Sleeve whole mm = 12.00 mm, plus visible 0.5 mm mark = 12.50 mm.',
        'Thimble reading = 24 * 0.01 mm = 0.24 mm.',
        'Total reading = 12.50 + 0.24 = 12.74 mm.',
      ],
    },
    {
      id: 'caliper-p4',
      prompt:
        'A micrometer has a negative zero error of -0.03 mm. When measuring a precision shim, the sleeve shows 6.50 mm and the thimble reads 30. What is the true shim thickness in mm?',
      hint: 'Observed = 6.50 + 0.30 = 6.80 mm. Subtracting -0.03 mm adds 0.03 mm.',
      targetValue: 6.83,
      unit: 'mm',
      tolerance: 0.01,
      solutionSteps: [
        'Observed reading = 6.50 + (30 * 0.01) = 6.80 mm.',
        'True thickness = 6.80 - (-0.03) = 6.83 mm.',
      ],
    },
    {
      id: 'caliper-p5',
      prompt:
        'A custom metric vernier scale has 25 equal divisions that span 24 mm on a 1 mm-graduated main scale. What is its least count in mm?',
      hint: '1 VSD = 24 / 25 = 0.96 mm. Subtract from 1.00 mm.',
      targetValue: 0.04,
      unit: 'mm',
      tolerance: 0.005,
      solutionSteps: [
        '1 MSD = 1.00 mm.',
        '1 VSD = 24 mm / 25 = 0.96 mm.',
        'Least Count = 1.00 - 0.96 = 0.04 mm.',
      ],
    },
  ],
  quiz: [
    {
      id: 'caliper-q1',
      question:
        'On a standard 0.02 mm metric vernier caliper, how many main-scale millimeters do the 50 vernier divisions span?',
      options: ['49 mm', '50 mm', '39 mm', '24 mm'],
      correctIndex: 0,
      explanation:
        '50 vernier divisions equal 49 mm (1 VSD = 0.98 mm), giving a least count of 1.00 - 0.98 = 0.02 mm.',
    },
    {
      id: 'caliper-q2',
      question:
        'Which part of a vernier caliper is designed specifically for measuring internal bore diameters?',
      options: [
        'Lower external jaws',
        'Upper internal knife-edge jaws',
        'Depth rod at the beam tail',
        'Thumb wheel lock',
      ],
      correctIndex: 1,
      explanation:
        'The smaller upper jaws have outward-facing knife edges calibrated for internal diameters (ID) and groove widths.',
    },
    {
      id: 'caliper-q3',
      question:
        'Why should you always turn the ratchet stop rather than the thimble directly when closing a micrometer on a part?',
      options: [
        'To spin the spindle faster over long distances',
        'To apply consistent, repeatable measuring force and avoid frame spring or part compression',
        'To lock the spindle at the current reading',
        'To reset the zero error automatically',
      ],
      correctIndex: 1,
      explanation:
        'The ratchet stop slips at a calibrated torque, preventing over-tightening that would flex the C-frame or deform soft parts.',
    },
    {
      id: 'caliper-q4',
      question:
        'A micrometer has a zero error of +0.02 mm. If the observed reading on a shaft is 15.48 mm, what is the true diameter?',
      options: ['15.50 mm', '15.46 mm', '15.48 mm', '15.52 mm'],
      correctIndex: 1,
      explanation:
        'True Reading = Observed - Zero Error = 15.48 - (+0.02) = 15.46 mm.',
    },
    {
      id: 'caliper-q5',
      question:
        'If the 0.5 mm mark after 9 mm is visible on a micrometer sleeve and the thimble reads 12, what is the observed reading?',
      options: ['9.12 mm', '9.512 mm', '9.62 mm', '10.12 mm'],
      correctIndex: 2,
      explanation:
        'Visible sleeve reading is 9.50 mm, plus 12 * 0.01 mm = 0.12 mm, giving 9.62 mm.',
    },
    {
      id: 'caliper-q6',
      question:
        'How is parallax error minimized when reading a vernier caliper or micrometer scale?',
      options: [
        'By viewing the scale at a 45-degree angle from the right',
        'By viewing the graduation marks straight-on, perpendicular to the scale plane',
        'By tightening the locking screw before looking at the scale',
        'By doubling the least count',
      ],
      correctIndex: 1,
      explanation:
        'Viewing perpendicularly (90 degrees to the scale) prevents apparent shift between the vernier/thimble edge and main-scale ticks.',
    },
  ],
};
