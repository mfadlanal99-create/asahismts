/**
 * Mechanical Engineering Physics Engine: Fluid Dynamics, Pipe Friction,
 * Compressibility, Orifice Metering, Gas Thermodynamics, Pumps, and Viscosity
 * MechLab Physics Engine
 */

import { G_ACCEL } from './constants.ts';

// ============================================================================
// 1. Fluid Statics, Continuity & Dimensionless Numbers
// ============================================================================

/**
 * Volumetric continuity equation: Q = A · v
 * @param areaM2 Cross-sectional flow area [m²]
 * @param velocityMps Mean fluid velocity [m/s]
 * @returns Volumetric flow rate Q [m³/s]
 */
export function volumetricFlowRate(areaM2: number, velocityMps: number): number {
  return areaM2 * velocityMps;
}

/**
 * Mean fluid velocity from pipe diameter and volumetric flow:
 * v = 4 · Q / (π · D²)
 */
export function pipeFlowVelocity(flowRateM3s: number, diameterM: number): number {
  if (diameterM <= 0) throw new Error('Pipe diameter must be strictly positive');
  const area = (Math.PI * diameterM * diameterM) / 4;
  return flowRateM3s / area;
}

/**
 * Reynolds number:
 * Re = (ρ · v · D) / μ = (v · D) / ν
 * @param velocityMps Flow velocity v [m/s]
 * @param diameterM Characteristic hydraulic diameter D [m]
 * @param kinematicViscosityM2s Kinematic viscosity ν [m²/s]
 * @returns Dimensionless Reynolds number Re [-]
 */
export function reynoldsNumber(
  velocityMps: number,
  diameterM: number,
  kinematicViscosityM2s: number
): number {
  if (kinematicViscosityM2s <= 0 || diameterM <= 0) {
    throw new Error('Viscosity and diameter must be strictly positive');
  }
  return (velocityMps * diameterM) / kinematicViscosityM2s;
}

/**
 * Flow regime classification by Reynolds number in internal circular pipe flow:
 * Laminar: Re < 2300
 * Critical / Transitional: 2300 ≤ Re ≤ 4000
 * Turbulent: Re > 4000
 */
export function pipeFlowRegime(re: number): 'laminar' | 'transitional' | 'turbulent' {
  if (re < 2300) return 'laminar';
  if (re <= 4000) return 'transitional';
  return 'turbulent';
}

// ============================================================================
// 2. Darcy–Weisbach Friction Factor & Pipe Head Loss
// ============================================================================

/**
 * Darcy friction factor f:
 * - For laminar flow (Re < 2300): Hagen–Poiseuille law f = 64 / Re
 * - For turbulent flow (Re ≥ 2300): Swamee–Jain explicit approximation of Colebrook–White:
 *   f = 0.25 / [ log₁₀( (ε / (3.7 · D)) + (5.74 / Re^0.9) ) ]²
 *
 * @param re Reynolds number Re [-]
 * @param roughnessM Absolute internal pipe surface roughness ε [m] (e.g. 0.045 mm = 4.5e-5 m for commercial steel)
 * @param diameterM Internal pipe diameter D [m]
 * @returns Dimensionless Darcy friction factor f [-]
 */
export function darcyFrictionFactor(
  re: number,
  roughnessM = 4.5e-5,
  diameterM: number
): number {
  if (re <= 0) return 0.064;
  if (re < 2300) {
    return 64 / re;
  }
  // Swamee-Jain formula
  const relRoughness = roughnessM / (3.7 * diameterM);
  const reTerm = 5.74 / Math.pow(re, 0.9);
  const logTerm = Math.log10(relRoughness + reTerm);
  return 0.25 / (logTerm * logTerm);
}

/**
 * Darcy–Weisbach frictional head loss equation:
 * h_f = f · (L / D) · (v² / (2 · g))
 * @param frictionFactor Darcy friction factor f [-]
 * @param lengthM Pipe length L [m]
 * @param diameterM Pipe diameter D [m]
 * @param velocityMps Mean flow velocity v [m/s]
 * @returns Head loss h_f [meters of fluid column]
 */
export function darcyWeisbachHeadLoss(
  frictionFactor: number,
  lengthM: number,
  diameterM: number,
  velocityMps: number
): number {
  return frictionFactor * (lengthM / diameterM) * (Math.pow(velocityMps, 2) / (2 * G_ACCEL));
}

/**
 * Frictional pressure drop:
 * ΔP = ρ · g · h_f = f · (L / D) · (ρ · v² / 2)
 */
export function pipePressureDrop(
  frictionFactor: number,
  lengthM: number,
  diameterM: number,
  velocityMps: number,
  densityKgM3: number
): number {
  return frictionFactor * (lengthM / diameterM) * ((densityKgM3 * Math.pow(velocityMps, 2)) / 2);
}

// ============================================================================
// 3. Orifice Flow & Hydraulic Compressibility
// ============================================================================

/**
 * Incompressible discharge through an orifice or restrictive control valve:
 * Q = C_d · A_o · √( 2 · ΔP / ρ )
 * @param dischargeCoeff Discharge coefficient C_d (typically 0.60 - 0.65 for sharp orifice) [-]
 * @param orificeAreaM2 Orifice opening area A_o [m²]
 * @param deltaPressurePa Pressure differential across orifice ΔP [Pa]
 * @param densityKgM3 Fluid density ρ [kg/m³]
 * @returns Volumetric flow rate Q [m³/s]
 */
export function orificeFlowRate(
  dischargeCoeff: number,
  orificeAreaM2: number,
  deltaPressurePa: number,
  densityKgM3: number
): number {
  if (deltaPressurePa <= 0 || densityKgM3 <= 0) return 0;
  return dischargeCoeff * orificeAreaM2 * Math.sqrt((2 * deltaPressurePa) / densityKgM3);
}

/**
 * Hydraulic fluid bulk modulus pressure rate of change:
 * dP / dt = (β / V) · (Q_in - Q_out)
 * Fundamental state equation for stiff hydraulic actuators and pipe volumes.
 *
 * @param bulkModulusPa Effective Bulk Modulus of fluid and pipe wall β [Pa] (e.g. 1.4 GPa = 1.4e9 Pa for oil)
 * @param containedVolumeM3 Trapped fluid volume V [m³]
 * @param netFlowRateM3s Net flow into the volume (Q_in - Q_out) [m³/s]
 * @returns Rate of pressure rise dP/dt [Pa/s]
 */
export function bulkModulusPressureRate(
  bulkModulusPa: number,
  containedVolumeM3: number,
  netFlowRateM3s: number
): number {
  if (containedVolumeM3 <= 0) throw new Error('Volume must be strictly positive');
  return (bulkModulusPa / containedVolumeM3) * netFlowRateM3s;
}

// ============================================================================
// 4. Gas Thermodynamics & Polytropic Compressor Equations
// ============================================================================

/**
 * Polytropic compression discharge temperature:
 * T₂ = T₁ · (P₂ / P₁)^((n - 1) / n)
 * @param inletTempK Suction temperature T₁ [K]
 * @param pressureRatio Pressure ratio r_p = P₂ / P₁ [-]
 * @param polytropicIndexN Polytropic exponent n (1.0 for isothermal, 1.4 for isentropic air, ~1.25 - 1.35 real) [-]
 * @returns Discharge temperature T₂ [K]
 */
export function compressorDischargeTemp(
  inletTempK: number,
  pressureRatio: number,
  polytropicIndexN = 1.3
): number {
  if (pressureRatio <= 0 || inletTempK <= 0) return inletTempK;
  const exp = (polytropicIndexN - 1) / polytropicIndexN;
  return inletTempK * Math.pow(pressureRatio, exp);
}

/**
 * Specific polytropic compression work:
 * w_poly = [n / (n - 1)] · R_air · T₁ · [ (P₂ / P₁)^((n - 1) / n) - 1 ]
 * @param inletTempK Suction temperature T₁ [K]
 * @param pressureRatio Pressure ratio r_p = P₂ / P₁ [-]
 * @param gasConstantR Specific gas constant R [J/(kg·K)] (287.058 for air)
 * @param polytropicIndexN Polytropic exponent n [-]
 * @returns Specific compression work w [J/kg]
 */
export function polytropicSpecificWork(
  inletTempK: number,
  pressureRatio: number,
  gasConstantR = 287.058,
  polytropicIndexN = 1.3
): number {
  const n = polytropicIndexN;
  const factor = n / (n - 1);
  const tempRatio = Math.pow(pressureRatio, (n - 1) / n);
  return factor * gasConstantR * inletTempK * (tempRatio - 1);
}

/**
 * Reciprocating compressor clearance volumetric efficiency:
 * η_vol = 1 - c · [ (P₂ / P₁)^(1 / n) - 1 ]
 * @param clearanceRatio Clearance volume ratio c = V_c / V_displacement (typically 0.03 - 0.08) [-]
 * @param pressureRatio Pressure ratio P₂ / P₁ [-]
 * @param polytropicIndexN Expansion exponent n [-]
 * @returns Volumetric efficiency η_vol (0 to 1) [-]
 */
export function compressorVolumetricEfficiency(
  clearanceRatio: number,
  pressureRatio: number,
  polytropicIndexN = 1.3
): number {
  const reExpansion = Math.pow(pressureRatio, 1 / polytropicIndexN) - 1;
  const eta = 1 - clearanceRatio * reExpansion;
  return Math.max(0, Math.min(1.0, eta));
}

// ============================================================================
// 5. Centrifugal Pump Affinity Laws & NPSH
// ============================================================================

/**
 * Centrifugal pump affinity laws for variable speed (N₁ -> N₂):
 * Q₂ = Q₁ · (N₂ / N₁)
 * H₂ = H₁ · (N₂ / N₁)²
 * P₂ = P₁ · (N₂ / N₁)³
 */
export function pumpAffinityScaling(
  q1: number,
  h1: number,
  p1: number,
  speedRatio: number
) {
  const q2 = q1 * speedRatio;
  const h2 = h1 * Math.pow(speedRatio, 2);
  const p2 = p1 * Math.pow(speedRatio, 3);
  return { flowRate: q2, head: h2, power: p2 };
}

/**
 * Net Positive Suction Head Available (NPSHa):
 * NPSHa = (P_atm - P_vap) / (ρ · g) ± z_s - h_f,suction
 *
 * @param suctionPressureAbsolutePa Absolute pressure at suction liquid free surface [Pa]
 * @param vaporPressureAbsolutePa Vapor pressure of fluid at operating temperature [Pa]
 * @param liquidDensityKgM3 Fluid density [kg/m³]
 * @param staticSuctionElevationM Static liquid level relative to pump centerline (+ flooded suction, - suction lift) [m]
 * @param suctionFrictionHeadLossM Friction head loss in suction line [m]
 * @returns NPSHa [m]
 */
export function npshAvailable(
  suctionPressureAbsolutePa: number,
  vaporPressureAbsolutePa: number,
  liquidDensityKgM3: number,
  staticSuctionElevationM: number,
  suctionFrictionHeadLossM: number
): number {
  const pressureHead =
    (suctionPressureAbsolutePa - vaporPressureAbsolutePa) / (liquidDensityKgM3 * G_ACCEL);
  return pressureHead + staticSuctionElevationM - suctionFrictionHeadLossM;
}

/**
 * Hydraulic water horsepower / fluid power:
 * P_h = ρ · g · Q · H
 * @param flowRateM3s Volumetric flow rate Q [m³/s]
 * @param totalHeadM Total developed head H [m]
 * @param densityKgM3 Fluid density ρ [kg/m³]
 * @returns Hydraulic power [W]
 */
export function hydraulicPower(
  flowRateM3s: number,
  totalHeadM: number,
  densityKgM3 = 1000
): number {
  return densityKgM3 * G_ACCEL * flowRateM3s * totalHeadM;
}

// ============================================================================
// 6. Lubrication & Viscosity Mechanics (Stokes & ASTM D341)
// ============================================================================

/**
 * Stokes' Law falling sphere terminal terminal velocity in viscous fluid:
 * v_t = (2 / 9) · [ (ρ_sphere - ρ_fluid) · g · r² ] / μ
 *
 * @param sphereRadiusM Radius of falling ball r [m]
 * @param sphereDensityKgM3 Density of falling ball ρ_s [kg/m³]
 * @param fluidDensityKgM3 Density of fluid ρ_f [kg/m³]
 * @param dynamicViscosityPas Dynamic viscosity μ [Pa·s]
 * @returns Terminal settling velocity v_t [m/s]
 */
export function stokesTerminalVelocity(
  sphereRadiusM: number,
  sphereDensityKgM3: number,
  fluidDensityKgM3: number,
  dynamicViscosityPas: number
): number {
  if (dynamicViscosityPas <= 0) throw new Error('Viscosity must be positive');
  const deltaRho = sphereDensityKgM3 - fluidDensityKgM3;
  return (2 / 9) * ((deltaRho * G_ACCEL * sphereRadiusM * sphereRadiusM) / dynamicViscosityPas);
}

/**
 * ASTM D341 / Walther Viscosity-Temperature Equation:
 * log₁₀( log₁₀(ν + 0.7) ) = A - B · log₁₀(T_K)
 * Computes kinematic viscosity ν at temperature T_K given two calibration points (40 °C and 100 °C).
 *
 * @param tempKelvin Temperature of interest [K]
 * @param nu40CSt Kinematic viscosity at 40 °C (313.15 K) in centistokes [cSt = mm²/s]
 * @param nu100CSt Kinematic viscosity at 100 °C (373.15 K) in centistokes [cSt = mm²/s]
 * @returns Kinematic viscosity at tempKelvin in centistokes [cSt = mm²/s]
 */
export function astmD341ViscosityAtTemp(
  tempKelvin: number,
  nu40CSt: number,
  nu100CSt: number
): number {
  const t1 = 313.15; // 40 °C
  const t2 = 373.15; // 100 °C

  // ASTM transformation: Z = log10(log10(nu + 0.7))
  const z1 = Math.log10(Math.log10(Math.max(0.01, nu40CSt + 0.7)));
  const z2 = Math.log10(Math.log10(Math.max(0.01, nu100CSt + 0.7)));

  // Slope B = (Z1 - Z2) / (log10(T2) - log10(T1))
  const bSlope = (z1 - z2) / (Math.log10(t2) - Math.log10(t1));
  const aIntercept = z1 + bSlope * Math.log10(t1);

  // Z at target T
  const zTarget = aIntercept - bSlope * Math.log10(tempKelvin);
  const nu = Math.pow(10, Math.pow(10, zTarget)) - 0.7;

  return Math.max(0.1, nu);
}
