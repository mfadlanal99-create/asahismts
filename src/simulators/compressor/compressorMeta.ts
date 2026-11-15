import type { SimulatorMeta } from '../../types/simulator';
import './compressorI18n';

export const compressorMeta: SimulatorMeta = {
  id: 'compressor',
  title: 'Air Compressor & Dryer Maintenance Lab',
  shortTitle: 'Air Compressor',
  category: 'Fluid Power',
  difficulty: 'Intermediate',
  description:
    'Analyze 2-stage & rotary-screw compression, intercooling, intake ΔP losses, receiver load/unload control, refrigerated dryer pressure dew point, and plant air leak economics.',
  iconName: 'Wind',
  accentColor: 'sky',
  explore: [
    {
      title: 'Isothermal vs. Adiabatic Compression & Intercooling',
      summary:
        'Compressing gas adiabatically raises its temperature sharply, increasing the specific volume and required shaft work. Two-stage compression with an intercooler splits the total pressure ratio evenly and cools the air back toward ambient between stages, approaching ideal isothermal compression and preventing >105 °C high-temperature trips.',
      equations: [
        {
          label: 'Optimal Interstage Pressure',
          formula: 'P_int = √(P₁ · P₂)',
          note: 'Equal pressure ratio per stage (r_stage = √(P₂/P₁)) minimizes total 2-stage work.',
        },
        {
          label: 'Polytropic Discharge Temperature',
          formula: 'T_out = T_in · (P_out / P_in)^((n - 1) / n)',
          note: 'Temperatures in Kelvin; n ≈ 1.4 for adiabatic, n ≈ 1.15–1.30 for cooled industrial stages.',
        },
        {
          label: 'Intercooler Effectiveness',
          formula: 'ε = (T₁,out − T₂,in) / (T₁,out − T_coolant)',
          note: 'Fouled fins reduce ε, raising T₂,in and driving Stage-2 discharge above the 105 °C trip limit.',
        },
      ],
      workedExample: {
        title: 'Two-Stage Interstage Pressure & Stage Ratio',
        given: [
          'Ambient suction pressure P₁ = 1.013 bar(a)',
          'Discharge pressure = 7.10 bar(g) → P₂ = 8.113 bar(a)',
        ],
        steps: [
          'Total pressure ratio: r_p = 8.113 / 1.013 = 8.009.',
          'Optimal interstage pressure: P_int = √(1.013 × 8.113) = 2.867 bar(a) (1.854 bar(g)).',
          'Stage pressure ratio: r_stage = √8.009 = 2.830 per stage.',
        ],
        answer: 'P_int = 2.87 bar(a), r_stage = 2.83',
      },
    },
    {
      title: 'Intake ΔP, Specific Power & Leak Economics',
      summary:
        'Every millibar of pressure drop across a clogged intake filter reduces air density entering the compressor, cutting Free Air Delivery (FAD) and forcing a higher overall compression ratio. Meanwhile, plant air leaks and high unload pressure bands waste enormous electrical energy because unloaded compressors still draw ~25% of full-load power.',
      equations: [
        {
          label: 'Specific Power',
          formula: 'SP = P_avg / Q_delivered  [kW / (m³/min)]',
          note: 'Well-maintained 7 bar industrial systems achieve ~6.0–6.8 kW/(m³/min).',
        },
        {
          label: 'Load Duty Cycle',
          formula: 'Duty (%) = ((Q_plant + Q_leaks) / Q_FAD) × 100',
          note: 'If total demand exceeds Q_FAD, receiver pressure sags below the load setpoint.',
        },
        {
          label: 'Annual Electricity Cost',
          formula: 'Cost = P_avg (kW) × Hours/yr × $/kWh',
          note: 'Lowering discharge pressure by 1 bar typically saves ~6–8% compressor power.',
        },
      ],
      workedExample: {
        title: 'Annual Cost of Plant Air Leaks',
        given: [
          'Leak rate = 2.4 m³/min (20% of a 12 m³/min compressor)',
          'Specific power = 6.4 kW / (m³/min)',
          'Operating schedule = 6,000 hr/yr at $0.12/kWh',
        ],
        steps: [
          'Wasted power = 2.4 m³/min × 6.4 kW/(m³/min) = 15.36 kW.',
          'Annual wasted energy = 15.36 kW × 6,000 hr = 92,160 kWh/yr.',
          'Annual cost = 92,160 kWh × $0.12/kWh = $11,059/yr.',
        ],
        answer: '$11,059 / year wasted on leaks',
      },
    },
    {
      title: 'Pressure Dew Point & Condensate Management',
      summary:
        'As air is compressed and cooled in the aftercooler and receiver, water vapor condenses into liquid water. A functioning auto-drain trap purges this condensate without losing air. If the drain sticks closed, liquid water floods the receiver and carries over into the refrigerated air dryer, spiking the Pressure Dew Point (PDP) and corroding downstream pneumatic tools.',
      equations: [
        {
          label: 'Pressure Dew Point (Refrigerated Dryer)',
          formula: 'Target PDP ≈ +2 °C to +4 °C at line pressure',
          note: 'Prevents condensation inside indoor plant piping down to +4 °C ambient.',
        },
        {
          label: 'Aftercooler Thermal Load',
          formula: 'ΔT_dryer_in = T_aftercooler_out − T_design (38–42 °C)',
          note: 'Fouled coolers send hot air (>45 °C) to the dryer, overloading its chiller and raising PDP.',
        },
      ],
      workedExample: {
        title: 'Diagnosing High Pressure Dew Point',
        given: [
          'Receiver condensate level = 95% (rising)',
          'Aftercooler outlet temp = 31 °C (normal)',
          'Dryer PDP = 22.0 °C (normal is 3.0 °C)',
        ],
        steps: [
          'Aftercooler outlet is normal (31 °C), ruling out thermal overload from a fouled cooler.',
          'Receiver condensate level at 95% indicates the automatic condensate drain valve is stuck closed.',
          'Liquid water carryover overwhelms the dryer separator, spiking PDP to 22 °C.',
        ],
        answer: 'Failed Condensate Auto-Drain (Water Carryover)',
      },
    },
  ],
  practice: [
    {
      id: 'comp-p1',
      prompt:
        'A 2-stage air compressor takes in air at P₁ = 1.0 bar(a) and discharges at P₂ = 9.0 bar(a). Calculate the optimal interstage pressure P_int in bar(a) that minimizes total compression work.',
      hint: 'Use P_int = √(P₁ × P₂).',
      targetValue: 3.0,
      unit: 'bar(a)',
      tolerance: 0.1,
      solutionSteps: [
        'Optimal interstage pressure balances stage ratios: P_int = √(P₁ × P₂).',
        'P_int = √(1.0 × 9.0) = √9.0 = 3.0 bar(a).',
      ],
    },
    {
      id: 'comp-p2',
      prompt:
        'A compressor rated at 12.0 m³/min FAD at 101.3 kPa ambient experiences an 8.0 kPa (80 mbar) pressure drop across a clogged intake filter, reducing suction pressure to 93.3 kPa. Estimate the derated FAD in m³/min using linear density scaling (Q_actual = Q_rated × P₁ / P_atm).',
      hint: 'Multiply 12.0 by (93.3 / 101.3).',
      targetValue: 11.05,
      unit: 'm³/min',
      tolerance: 0.15,
      solutionSteps: [
        'Suction density ratio = P₁ / P_atm = 93.3 / 101.3 = 0.9210.',
        'Derated FAD = 12.0 × 0.9210 = 11.05 m³/min.',
      ],
    },
    {
      id: 'comp-p3',
      prompt:
        'A plant audit measures 3.6 m³/min of compressed air leaks on a system with a specific power of 6.5 kW/(m³/min). If the plant runs 6,000 hours/year at $0.12/kWh, how much money ($/yr) is wasted on leaks?',
      hint: 'Power (kW) = leak flow × specific power; Cost = Power × 6,000 × 0.12.',
      targetValue: 16848,
      unit: '$/yr',
      tolerance: 50,
      solutionSteps: [
        'Wasted power = 3.6 m³/min × 6.5 kW/(m³/min) = 23.4 kW.',
        'Annual energy = 23.4 kW × 6,000 hr = 140,400 kWh/yr.',
        'Annual cost = 140,400 × $0.12 = $16,848/yr.',
      ],
    },
    {
      id: 'comp-p4',
      prompt:
        'A compressor delivers 12.0 m³/min FAD. Process tools consume 7.2 m³/min and plant leaks waste 1.8 m³/min. Calculate the compressor load duty cycle (%).',
      hint: 'Duty (%) = ((Q_process + Q_leaks) / Q_FAD) × 100.',
      targetValue: 75,
      unit: '%',
      tolerance: 1,
      solutionSteps: [
        'Total air demand = 7.2 + 1.8 = 9.0 m³/min.',
        'Duty cycle = (9.0 / 12.0) × 100% = 75%.',
      ],
    },
  ],
  quiz: [
    {
      id: 'comp-q1',
      question:
        'Why does a 2-stage air compressor use an intercooler between the first and second stages?',
      options: [
        'To reduce air temperature and specific volume before Stage 2, lowering total shaft work and discharge temperature',
        'To increase the pressure ratio of Stage 1 above Stage 2',
        'To freeze water vapor into ice crystals before the receiver tank',
        'To eliminate the need for an intake air filter',
      ],
      correctIndex: 0,
      explanation:
        'Intercooling rejects heat between stages so Stage 2 compresses denser, cooler air—reducing total work toward isothermal compression and keeping discharge temperature below trip limits.',
    },
    {
      id: 'comp-q2',
      question:
        'Which symptom most strongly indicates a fouled intercooler/aftercooler rather than a clogged intake filter?',
      options: [
        'High intake vacuum ΔP (>50 mbar) with normal discharge temperature',
        'Discharge temperature tripping above 105 °C and elevated dryer pressure dew point',
        'Receiver condensate level reaching 100% while aftercooler outlet stays at 30 °C',
        'Compressor staying unloaded 90% of the time',
      ],
      correctIndex: 1,
      explanation:
        'Cooler fouling blocks heat rejection, causing Stage-2 discharge temperature to climb past 105 °C and sending overly hot air to the refrigerated dryer.',
    },
    {
      id: 'comp-q3',
      question:
        'What happens downstream when the air receiver condensate auto-drain sticks closed?',
      options: [
        'Intake filter ΔP immediately drops to zero',
        'Liquid water accumulates in the receiver and carries over into the refrigerated dryer, spiking Pressure Dew Point',
        'Compressor unload pressure automatically increases by 2 bar',
        'Specific power drops below 4.0 kW/(m³/min)',
      ],
      correctIndex: 1,
      explanation:
        'Without periodic draining, condensate fills the receiver and floods downstream piping and the dryer, causing water carryover and high Pressure Dew Point.',
    },
    {
      id: 'comp-q4',
      question:
        'Why does raising the Load/Unload pressure band unnecessarily (e.g., from 6.8–7.5 bar to 8.0–8.8 bar) increase plant energy costs?',
      options: [
        'Higher pressure increases compression ratio (more kW per m³/min) AND increases leak flow rate through existing orifices',
        'Higher pressure makes the refrigerated dryer consume zero power',
        'Higher pressure reduces the compressor duty cycle to 0%',
        'Higher pressure lowers the interstage temperature',
      ],
      correctIndex: 0,
      explanation:
        'Both specific power and leak flow rate rise with system pressure—every 1 bar reduction in header pressure typically saves 6–8% energy.',
    },
    {
      id: 'comp-q5',
      question:
        'A plant compressor runs at 98% duty cycle, receiver pressure sags below the load setpoint, yet discharge temp is 84 °C and intake ΔP is 14 mbar. What is the most likely cause?',
      options: [
        'Clogged intake filter',
        'Fouled intercooler',
        'Excessive plant air leaks or demand exceeding compressor FAD',
        'Failed condensate auto-drain',
      ],
      correctIndex: 2,
      explanation:
        'Normal temperature and low intake ΔP rule out cooler fouling and filter clogging; a near-100% duty cycle with sagging pressure points to excessive leaks or demand.',
    },
    {
      id: 'comp-q6',
      question:
        'What is the typical target Pressure Dew Point (PDP) for an industrial refrigerated compressed-air dryer?',
      options: ['−40 °C', '+2 °C to +4 °C', '+22 °C', '+65 °C'],
      correctIndex: 1,
      explanation:
        'Refrigerated dryers cool compressed air to just above freezing (+2 °C to +4 °C PDP) to condense moisture without freezing the heat exchanger.',
    },
  ],
};
