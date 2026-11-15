/**
 * Central Mechanical Engineering Constants and SI Unit Conversions
 * MechLab Physics Engine
 */

// ============================================================================
// Fundamental Physical Constants (CODATA / ISO Standard Values)
// ============================================================================

/** Standard acceleration due to gravity on Earth [m/s²] (ISO 80000-3) */
export const G_ACCEL = 9.80665;

/** Specific gas constant for dry air [J/(kg·K)] */
export const R_AIR = 287.058;

/** Ratio of specific heats for dry air / diatomic gas γ = Cp / Cv [-] */
export const GAMMA_AIR = 1.4;

/** Standard atmospheric pressure at sea level [Pa] (ISO 2533) */
export const ATM_PA = 101325;

/** Standard atmospheric pressure at sea level [bar] */
export const ATM_BAR = 1.01325;

/** Nominal density of pure water at 4 °C and 1 atm [kg/m³] */
export const WATER_DENSITY_STP = 1000.0;

/** Nominal density of dry air at 20 °C and 101.325 kPa [kg/m³] */
export const AIR_DENSITY_STP = 1.2041;

/** Absolute zero temperature in Celsius [°C] */
export const ABSOLUTE_ZERO_C = -273.15;

// ============================================================================
// Pressure & Stress Conversions
// ============================================================================

/** Convert bar to Pascals [Pa] */
export function barToPa(bar: number): number {
  return bar * 1e5;
}

/** Convert Pascals [Pa] to bar */
export function paToBar(pa: number): number {
  return pa / 1e5;
}

/** Convert Megapascals [MPa] / [N/mm²] to Pascals [Pa] */
export function mpaToPa(mpa: number): number {
  return mpa * 1e6;
}

/** Convert Pascals [Pa] to Megapascals [MPa] / [N/mm²] */
export function paToMpa(pa: number): number {
  return pa / 1e6;
}

/** Convert Kilopascals [kPa] to Pascals [Pa] */
export function kpaToPa(kpa: number): number {
  return kpa * 1e3;
}

/** Convert Pascals [Pa] to Kilopascals [kPa] */
export function paToKpa(pa: number): number {
  return pa / 1e3;
}

/** Convert pounds per square inch [psi] to Pascals [Pa] */
export function psiToPa(psi: number): number {
  return psi * 6894.757293168;
}

/** Convert Pascals [Pa] to pounds per square inch [psi] */
export function paToPsi(pa: number): number {
  return pa / 6894.757293168;
}

// ============================================================================
// Rotational & Angular Conversions
// ============================================================================

/** Convert revolutions per minute [RPM] to angular velocity [rad/s] */
export function rpmToRadS(rpm: number): number {
  return (rpm * 2 * Math.PI) / 60;
}

/** Convert angular velocity [rad/s] to revolutions per minute [RPM] */
export function radSToRpm(radS: number): number {
  return (radS * 60) / (2 * Math.PI);
}

/** Convert frequency in Hertz [Hz] to angular frequency [rad/s] */
export function hzToRadS(hz: number): number {
  return hz * 2 * Math.PI;
}

/** Convert angular frequency [rad/s] to frequency in Hertz [Hz] */
export function radSToHz(radS: number): number {
  return radS / (2 * Math.PI);
}

/** Convert degrees [°] to radians [rad] */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert radians [rad] to degrees [°] */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ============================================================================
// Length, Area & Volume Conversions
// ============================================================================

/** Convert millimeters [mm] to meters [m] */
export function mmToM(mm: number): number {
  return mm * 1e-3;
}

/** Convert meters [m] to millimeters [mm] */
export function mToMm(m: number): number {
  return m * 1e3;
}

/** Convert micrometers / microns [µm] to meters [m] */
export function umToM(um: number): number {
  return um * 1e-6;
}

/** Convert meters [m] to micrometers / microns [µm] */
export function mToUm(m: number): number {
  return m * 1e6;
}

/** Convert square millimeters [mm²] to square meters [m²] */
export function mm2ToM2(mm2: number): number {
  return mm2 * 1e-6;
}

/** Convert square meters [m²] to square millimeters [mm²] */
export function m2ToMm2(m2: number): number {
  return m2 * 1e6;
}

/** Convert second moment of area [mm⁴] to [m⁴] */
export function mm4ToM4(mm4: number): number {
  return mm4 * 1e-12;
}

/** Convert second moment of area [m⁴] to [mm⁴] */
export function m4ToMm4(m4: number): number {
  return m4 * 1e12;
}

// ============================================================================
// Temperature Conversions
// ============================================================================

/** Convert degrees Celsius [°C] to Kelvin [K] */
export function cToK(celsius: number): number {
  return celsius + 273.15;
}

/** Convert Kelvin [K] to degrees Celsius [°C] */
export function kToC(kelvin: number): number {
  return kelvin - 273.15;
}

// ============================================================================
// Fluid Flow & Viscosity Conversions
// ============================================================================

/** Convert volumetric flow rate Liters per minute [L/min] to [m³/s] */
export function lpmToM3s(lpm: number): number {
  return lpm / 60000;
}

/** Convert volumetric flow rate [m³/s] to Liters per minute [L/min] */
export function m3sToLpm(m3s: number): number {
  return m3s * 60000;
}

/** Convert kinematic viscosity centistokes [cSt = mm²/s] to SI [m²/s] */
export function cStToM2s(cSt: number): number {
  return cSt * 1e-6;
}

/** Convert kinematic viscosity SI [m²/s] to centistokes [cSt = mm²/s] */
export function m2sToCSt(m2s: number): number {
  return m2s * 1e6;
}

/** Convert dynamic viscosity centipoise [cP = mPa·s] to SI [Pa·s] */
export function cpToPas(cP: number): number {
  return cP * 1e-3;
}

/** Convert dynamic viscosity SI [Pa·s] to centipoise [cP = mPa·s] */
export function pasToCp(pas: number): number {
  return pas * 1e3;
}

// ============================================================================
// Power & Energy Conversions
// ============================================================================

/** Convert kilowatts [kW] to Watts [W] */
export function kwToW(kw: number): number {
  return kw * 1000;
}

/** Convert Watts [W] to kilowatts [kW] */
export function wToKw(w: number): number {
  return w / 1000;
}

/** Convert mechanical horsepower [hp] to Watts [W] (1 hp = 745.69987 W) */
export function hpToW(hp: number): number {
  return hp * 745.69987158227;
}

/** Convert Watts [W] to mechanical horsepower [hp] */
export function wToHp(w: number): number {
  return w / 745.69987158227;
}
