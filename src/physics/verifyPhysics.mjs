/**
 * Standalone Verification Test Suite for MechLab Physics Engine
 * Tests all physics formulas against classical textbook analytical benchmarks
 * Run via: node src/physics/verifyPhysics.mjs
 */

import assert from 'node:assert/strict';
import {
  // Constants & conversions
  G_ACCEL,
  R_AIR,
  ATM_PA,
  barToPa,
  paToBar,
  mpaToPa,
  paToMpa,
  rpmToRadS,
  radSToRpm,
  degToRad,
  radToDeg,
  cToK,
  kToC,
  mmToM,
  mToMm,
  // Mechanics
  engineeringStress,
  engineeringStrain,
  hookesLawStress,
  trueStrain,
  trueStress,
  hollomonFlowStress,
  neckingTrueStrainConsidere,
  modulusOfResilience,
  beamBendingStress,
  rectangularSectionProps,
  circularSectionProps,
  deflectionSimplySupportedCenterLoad,
  deflectionSimplySupportedUdl,
  deflectionCantileverEndLoad,
  filletWeldThroat,
  weldEffectiveArea,
  weldVectorResultantShear,
  weldVonMisesStress,
  shrinkFitContactPressure,
  shrinkFitTorqueCapacity,
  timoshenkoBimetalCurvature,
  bimetalTipDeflection,
  boltTighteningTorqueK,
  motoshBoltTorque,
  gearTangentialForce,
  lewisGearBendingStress,
  gearElasticCoefficientZE,
  eulerEytelweinTensionRatio,
  beltCentrifugalTension,
  chainChordalSpeedVariation,
  // Dynamics
  naturalFrequencyOmegaN,
  criticalSpeedRpm,
  unbalanceMagnificationFactor,
  jeffcottRotorResponse,
  bearingEquivalentLoad,
  bearingLifeMillionsRevs,
  bearingLifeHours,
  slingLegTension,
  slingLoadFactor,
  wireRopeDoverDEfficiency,
  rimAndFaceAlignment,
  // Fluids
  volumetricFlowRate,
  pipeFlowVelocity,
  reynoldsNumber,
  pipeFlowRegime,
  darcyFrictionFactor,
  darcyWeisbachHeadLoss,
  pipePressureDrop,
  orificeFlowRate,
  bulkModulusPressureRate,
  compressorDischargeTemp,
  polytropicSpecificWork,
  compressorVolumetricEfficiency,
  pumpAffinityScaling,
  npshAvailable,
  hydraulicPower,
  stokesTerminalVelocity,
  astmD341ViscosityAtTemp,
} from './index.ts';

function approxEqual(actual, expected, tol = 1e-4, msg = '') {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff <= tol,
    `${msg} Expected ${expected}, got ${actual} (diff: ${diff}, tol: ${tol})`
  );
}

console.log('--- MechLab Physics Engine Verification Tests ---');

// ============================================================================
// 1. Constants & SI Conversions
// ============================================================================
console.log('1. Testing Constants & Conversions...');
approxEqual(G_ACCEL, 9.80665, 1e-6, 'G_ACCEL standard');
approxEqual(R_AIR, 287.058, 1e-4, 'R_AIR dry air');
approxEqual(ATM_PA, 101325, 1e-4, 'ATM_PA');
approxEqual(barToPa(2.5), 250000, 1e-4, 'barToPa');
approxEqual(paToBar(250000), 2.5, 1e-4, 'paToBar');
approxEqual(mpaToPa(150), 1.5e8, 1e-4, 'mpaToPa');
approxEqual(paToMpa(1.5e8), 150, 1e-4, 'paToMpa');
approxEqual(rpmToRadS(1800), 188.495559, 1e-4, 'rpmToRadS');
approxEqual(radSToRpm(188.495559), 1800, 1e-4, 'radSToRpm');
approxEqual(degToRad(90), Math.PI / 2, 1e-6, 'degToRad');
approxEqual(radToDeg(Math.PI / 2), 90, 1e-6, 'radToDeg');
approxEqual(cToK(25), 298.15, 1e-4, 'cToK');
approxEqual(kToC(298.15), 25, 1e-4, 'kToC');
approxEqual(mmToM(50), 0.05, 1e-6, 'mmToM');
approxEqual(mToMm(0.05), 50, 1e-6, 'mToMm');
console.log('✓ Constants & Conversions passed');

// ============================================================================
// 2. Solid Mechanics, Beams, Welds, Cylinders, Gearing, Belts
// ============================================================================
console.log('2. Testing Mechanics & Machine Elements...');

// Stress & Hooke's Law
const a0 = Math.PI * Math.pow(0.0128 / 2, 2); // 12.8 mm diameter UTM bar
const force = 45000; // 45 kN
const engStress = engineeringStress(force, a0);
approxEqual(engStress, 3.49704e8, 1e4, 'UTM A36 stress ~350 MPa');

const engStrain = engineeringStrain(0.005, 0.050); // 5 mm on 50 mm
approxEqual(engStrain, 0.10, 1e-6, 'engStrain 10%');

const elasticStress = hookesLawStress(0.0015, 200e9);
approxEqual(elasticStress, 300e6, 1e-2, 'Hookes law 300 MPa');

const tStrain = trueStrain(0.10);
approxEqual(tStrain, Math.log(1.10), 1e-6, 'True strain ln(1.10)');

const tStress = trueStress(300e6, 0.10);
approxEqual(tStress, 330e6, 1e-2, 'True stress 330 MPa');

const flowStress = hollomonFlowStress(0.15, 600e6, 0.20);
approxEqual(flowStress, 600e6 * Math.pow(0.15, 0.20), 1e-2, 'Hollomon power law');

const nVal = neckingTrueStrainConsidere(0.24);
approxEqual(nVal, 0.24, 1e-6, 'Considere criterion ε_neck = n');

const uResilience = modulusOfResilience(300e6, 200e9);
approxEqual(uResilience, 225000, 1e-2, 'Modulus of Resilience Ur = 225 kJ/m³');

// Beam Bending
const rectProps = rectangularSectionProps(0.10, 0.20); // 100mm x 200mm
approxEqual(rectProps.area, 0.02, 1e-6, 'Rect area');
approxEqual(rectProps.momentOfInertia, (0.1 * Math.pow(0.2, 3)) / 12, 1e-9, 'Rect I_x');
approxEqual(rectProps.sectionModulus, (0.1 * Math.pow(0.2, 2)) / 6, 1e-9, 'Rect S_x');

const circProps = circularSectionProps(0.06); // 60 mm pin
approxEqual(circProps.area, (Math.PI * Math.pow(0.06, 2)) / 4, 1e-8, 'Circ area');

const sigmaBend = beamBendingStress(20000, 0.10, rectProps.momentOfInertia);
approxEqual(sigmaBend, 20000 / rectProps.sectionModulus, 1e-2, 'Beam bending M / S');

const deltaSsCenter = deflectionSimplySupportedCenterLoad(10000, 3.0, 200e9, rectProps.momentOfInertia);
approxEqual(
  deltaSsCenter,
  (10000 * 27) / (48 * 200e9 * rectProps.momentOfInertia),
  1e-8,
  'Simply supported center deflection'
);

const deltaSsUdl = deflectionSimplySupportedUdl(5000, 4.0, 200e9, rectProps.momentOfInertia);
approxEqual(
  deltaSsUdl,
  (5 * 5000 * 256) / (384 * 200e9 * rectProps.momentOfInertia),
  1e-8,
  'Simply supported UDL deflection'
);

const deltaCantilever = deflectionCantileverEndLoad(5000, 2.0, 200e9, rectProps.momentOfInertia);
approxEqual(
  deltaCantilever,
  (5000 * 8) / (3 * 200e9 * rectProps.momentOfInertia),
  1e-8,
  'Cantilever end load deflection'
);

// Weld Mechanics
const leg = 0.008; // 8 mm
const throat = filletWeldThroat(leg);
approxEqual(throat, 0.008 * Math.SQRT2 / 2, 1e-6, 'Throat = 0.7071s');
approxEqual(weldEffectiveArea(throat, 0.200), throat * 0.2, 1e-8, 'Weld effective area');
approxEqual(weldVectorResultantShear(30e6, 40e6), 50e6, 1e-4, 'Weld shear resultant 3-4-5 triangle');
approxEqual(weldVonMisesStress(50e6, 30e6, 40e6), Math.sqrt(2500e12 + 3 * (900e12 + 1600e12)), 1e-2, 'Weld von Mises');

// Lamé Shrink Fit
const pContact = shrinkFitContactPressure(
  0.00006, // 60 µm interference
  0.030, // 30 mm radius (60 mm shaft)
  0, // solid shaft
  0.060, // 60 mm hub outer radius (120 mm OD)
  200e9, // steel shaft E
  0.29, // steel shaft nu
  200e9, // steel hub E
  0.29 // steel hub nu
);
assert.ok(pContact > 10e6 && pContact < 100e6, `Shrink fit contact pressure reasonable: ${pContact} Pa`);
const torqueCap = shrinkFitTorqueCapacity(pContact, 0.030, 0.080, 0.15);
assert.ok(torqueCap > 500, `Shrink fit torque capacity reasonable: ${torqueCap} Nm`);

// Timoshenko Bimetallic Strip
const kappa = timoshenkoBimetalCurvature(
  19e-6, // Brass
  1.2e-6, // Invar
  100, // 100 C delta T
  0.001, // 1 mm
  0.001, // 1 mm
  105e9, // Brass E
  140e9 // Invar E
);
assert.ok(kappa > 0.5 && kappa < 2.0, `Timoshenko curvature reasonable: ${kappa} 1/m`);
const tipDefl = bimetalTipDeflection(kappa, 0.100); // 100 mm strip
assert.ok(tipDefl > 0.002 && tipDefl < 0.010, `Bimetal tip deflection reasonable: ${tipDefl} m`);

// Bolt Torque
const boltTorqueK = boltTighteningTorqueK(0.016, 60000, 0.18); // M16, 60 kN preload
approxEqual(boltTorqueK, 0.18 * 60000 * 0.016, 1e-6, 'Bolt torque K formula = 172.8 Nm');
const motosh = motoshBoltTorque(60000, 0.002, 0.0147, 30, 0.14, 0.14, 0.020);
assert.ok(motosh.torqueTotalNm > 100 && motosh.torqueTotalNm < 250, 'Motosh torque reasonable');

// Gears
const wt = gearTangentialForce(15000, 0.080, 1450); // 15 kW, 80 mm pinion, 1450 RPM
assert.ok(wt > 2000 && wt < 3000, `Gear tangential force reasonable: ${wt} N`);
const lewisStress = lewisGearBendingStress(wt, 0.040, 0.004, 0.35);
assert.ok(lewisStress > 30e6 && lewisStress < 70e6, `Lewis bending stress reasonable: ${lewisStress} Pa`);
const ze = gearElasticCoefficientZE(206e9, 0.3, 206e9, 0.3);
approxEqual(ze, 189811.7, 50, 'Gear ZE steel-steel ~189812 Pa^0.5 (189.8 MPa^0.5)');

// Belts & Chains
const tensionRatio = eulerEytelweinTensionRatio(0.35, Math.PI, degToRad(19)); // V-belt 38 deg groove
assert.ok(tensionRatio > 20, `V-belt high wedge tension ratio: ${tensionRatio}`);
const fc = beltCentrifugalTension(0.18, 25); // 0.18 kg/m at 25 m/s
approxEqual(fc, 0.18 * 625, 1e-6, 'Belt centrifugal tension Fc = 112.5 N');
const chainPulsation = chainChordalSpeedVariation(19);
approxEqual(chainPulsation, 1 - Math.cos(Math.PI / 19), 1e-7, 'Chain 19T chordal speed variation');

console.log('✓ Mechanics & Machine Elements passed');

// ============================================================================
// 3. Dynamics, Rotordynamics, Bearing Life, Rigging, Alignment
// ============================================================================
console.log('3. Testing Dynamics, Rotordynamics, Bearings & Rigging...');

const omegaN = naturalFrequencyOmegaN(3.6e6, 4.0); // k = 3.6 MN/m, m = 4 kg
approxEqual(omegaN, Math.sqrt(3.6e6 / 4.0), 1e-6, 'Natural frequency ω_n = 948.68 rad/s');
const rpmCrit = criticalSpeedRpm(3.6e6, 4.0);
approxEqual(rpmCrit, (omegaN * 60) / (2 * Math.PI), 1e-4, 'Critical speed RPM');

const magResonance = unbalanceMagnificationFactor(1.0, 0.05); // at resonance with 5% damping
approxEqual(magResonance, 1 / (2 * 0.05), 1e-6, 'Resonant magnification = 10x');

const rotorResp = jeffcottRotorResponse(25e-6, 948.683, 948.683, 0.05);
approxEqual(rotorResp.displacementAmplitudeM, 250e-6, 1e-7, 'Resonant amplitude = 250 µm');
approxEqual(rotorResp.phaseLagDeg, 90, 1e-4, 'Resonant phase lag = 90 deg');

// ISO 281 Bearing Life
const eqLoad = bearingEquivalentLoad(6000, 2000, 0.56, 1.4);
approxEqual(eqLoad, 0.56 * 6000 + 1.4 * 2000, 1e-6, 'Bearing equivalent load = 6160 N');
const l10mBall = bearingLifeMillionsRevs(30000, 6000, 'ball'); // C = 30 kN, P = 6 kN
approxEqual(l10mBall, Math.pow(5, 3), 1e-6, 'Ball bearing L10 = 125 million revs');
const l10Hours = bearingLifeHours(l10mBall, 1500); // 1500 RPM
approxEqual(l10Hours, (125 * 1e6) / (60 * 1500), 1e-4, 'Bearing life in hours = 1388.89 h');

// Rigging
const slingTen = slingLegTension(40000, 2, 60); // 40 kN load, 2 legs at 60 deg
approxEqual(slingTen, 40000 / (2 * Math.sin(Math.PI / 3)), 1e-4, 'Sling leg tension = 23.09 kN');
const slf = slingLoadFactor(60);
approxEqual(slf, 1 / Math.sin(Math.PI / 3), 1e-6, 'Sling load factor = 1.1547');
const doverDEff = wireRopeDoverDEfficiency(0.120, 0.012); // D/d = 10
approxEqual(doverDEff, 1 - 0.5 / Math.sqrt(10), 1e-4, 'D/d bending efficiency ~84.2%');

// Alignment
const align = rimAndFaceAlignment(0.0002, 0.0004, 0.150, 0.200, 0.300);
approxEqual(align.angularSlopeRad, 0.0002 / 0.150, 1e-6, 'Alignment angular slope');
approxEqual(align.centerlineOffsetM, 0.0002, 1e-6, 'Centerline offset = 0.2 mm');
console.log('✓ Dynamics & Rigging passed');

// ============================================================================
// 4. Fluids, Compressibility, Pumps, Thermodynamics & Viscosity
// ============================================================================
console.log('4. Testing Fluids, Thermodynamics & Pumps...');

const qFlow = volumetricFlowRate(0.005, 2.0);
approxEqual(qFlow, 0.010, 1e-6, 'Continuity Q = 0.010 m³/s');

const vPipe = pipeFlowVelocity(0.010, 0.080);
approxEqual(vPipe, 0.010 / ((Math.PI * 0.08 * 0.08) / 4), 1e-6, 'Pipe velocity');

const reLam = reynoldsNumber(0.5, 0.025, 1e-4); // Re = 125
approxEqual(reLam, 125, 1e-6, 'Reynolds number laminar');
assert.equal(pipeFlowRegime(reLam), 'laminar');

const reTurb = reynoldsNumber(2.5, 0.080, 1e-6); // Re = 200,000
approxEqual(reTurb, 200000, 1e-4, 'Reynolds number turbulent');
assert.equal(pipeFlowRegime(reTurb), 'turbulent');

const fLam = darcyFrictionFactor(1000, 0.000045, 0.05);
approxEqual(fLam, 0.064, 1e-6, 'Laminar friction 64/Re');

const fTurb = darcyFrictionFactor(200000, 4.5e-5, 0.08);
assert.ok(fTurb > 0.015 && fTurb < 0.025, `Turbulent Darcy friction factor reasonable: ${fTurb}`);

const hf = darcyWeisbachHeadLoss(0.02, 100, 0.08, 2.0);
approxEqual(hf, 0.02 * (100 / 0.08) * (4 / (2 * G_ACCEL)), 1e-4, 'Darcy-Weisbach head loss');

const dpPipe = pipePressureDrop(0.02, 100, 0.08, 2.0, 1000);
approxEqual(dpPipe, 1000 * G_ACCEL * hf, 1e-2, 'Pipe pressure drop = rho * g * hf');

const qOrifice = orificeFlowRate(0.62, 0.0002, 4e5, 1000); // 4 bar across 2 cm²
assert.ok(qOrifice > 0.003 && qOrifice < 0.004, `Orifice flow rate reasonable: ${qOrifice} m³/s`);

const dpdt = bulkModulusPressureRate(1.4e9, 0.005, 0.0002); // 1.4 GPa, 5 L, 0.2 L/s net
approxEqual(dpdt, (1.4e9 / 0.005) * 0.0002, 1e-2, 'Hydraulic Bulk Modulus dP/dt = 56 MPa/s');

// Compressor Thermodynamics
const tDischarge = compressorDischargeTemp(293.15, 7.0, 1.35);
assert.ok(tDischarge > 450 && tDischarge < 500, `Compressor discharge temp reasonable: ${tDischarge} K`);

const wComp = polytropicSpecificWork(293.15, 7.0, R_AIR, 1.35);
assert.ok(wComp > 150000 && wComp < 250000, `Specific compression work reasonable: ${wComp} J/kg`);

const etaVol = compressorVolumetricEfficiency(0.05, 7.0, 1.35);
assert.ok(etaVol > 0.70 && etaVol < 0.90, `Volumetric efficiency reasonable: ${etaVol}`);

// Pump Scaling & NPSHa
const scaledPump = pumpAffinityScaling(100, 40, 15, 1.15); // +15% RPM
approxEqual(scaledPump.flowRate, 115, 1e-4, 'Pump Q scales linear with N');
approxEqual(scaledPump.head, 40 * 1.15 * 1.15, 1e-4, 'Pump H scales with N²');
approxEqual(scaledPump.power, 15 * Math.pow(1.15, 3), 1e-4, 'Pump P scales with N³');

const npsha = npshAvailable(101325, 2339, 1000, 2.5, 0.8);
approxEqual(npsha, ((101325 - 2339) / (1000 * G_ACCEL)) + 2.5 - 0.8, 1e-4, 'NPSHa calculation');

const pHyd = hydraulicPower(0.025, 35, 1000); // 25 L/s at 35 m
approxEqual(pHyd, 1000 * G_ACCEL * 0.025 * 35, 1e-4, 'Hydraulic power = 8.58 kW');

// Stokes & ASTM D341
const vStokes = stokesTerminalVelocity(0.004, 7850, 880, 0.12);
approxEqual(vStokes, 2.02525, 1e-3, 'Stokes terminal settling velocity matches analytical value');

const nuAt40 = astmD341ViscosityAtTemp(313.15, 46.0, 6.8); // at 40 C exactly
approxEqual(nuAt40, 46.0, 1e-2, 'ASTM D341 calibration point 40 °C matches');
const nuAt100 = astmD341ViscosityAtTemp(373.15, 46.0, 6.8); // at 100 C exactly
approxEqual(nuAt100, 6.8, 1e-2, 'ASTM D341 calibration point 100 °C matches');
const nuAt70 = astmD341ViscosityAtTemp(343.15, 46.0, 6.8); // intermediate temp
assert.ok(nuAt70 > 6.8 && nuAt70 < 46.0, `ASTM D341 intermediate viscosity reasonable: ${nuAt70} cSt`);

console.log('✓ Fluids & Thermodynamics passed');
console.log('========================================================');
console.log('ALL MECHLAB PHYSICS ENGINE BENCHMARK TESTS PASSED (100%)');
console.log('========================================================');
