import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import '../i18n/diagnosticI18n';
import type { SimulatorMeta } from '../types/simulator';
import { alignmentMeta } from '../simulators/alignment/alignmentMeta';
import { beamBendingMeta } from '../simulators/beam-bending/beamBendingMeta';
import { bearingMeta } from '../simulators/bearing/bearingMeta';
import { bearingBasicsMeta } from '../simulators/bearing-basics/bearingBasicsMeta';
import { beltConveyorMeta } from '../simulators/belt-conveyor/beltConveyorMeta';
import { beltGearMeta } from '../simulators/belt-gear/beltGearMeta';
import { boltTorqueMeta } from '../simulators/bolt-torque/boltMeta';
import { boreGaugeMeta } from '../simulators/bore-gauge/boreGaugeMeta';
import { bucketElevatorMeta } from '../simulators/bucket-elevator/bucketElevatorMeta';
import { caliperMeta } from '../simulators/caliper/caliperMeta';
import { chainConveyorMeta } from '../simulators/chain-conveyor/chainConveyorMeta';
import { compressorMeta } from '../simulators/compressor/compressorMeta';
import { couplingMeta } from '../simulators/coupling/couplingMeta';
import { dragChainConveyorMeta } from '../simulators/drag-chain-conveyor/dragChainConveyorMeta';
import { fastenersBasicsMeta } from '../simulators/fasteners-basics/fastenersBasicsMeta';
import { fitsTolerancesMeta } from '../simulators/fits-tolerances/fitsTolerancesMeta';
import { gearStrengthMeta } from '../simulators/gear-strength/gearStrengthMeta';
import { hardnessMeta } from '../simulators/hardness/hardnessMeta';
import { hydraulicMeta } from '../simulators/hydraulic/hydraulicMeta';
import { lubeMeta } from '../simulators/lube/lubeMeta';
import { machine3dExplorerMeta } from '../simulators/machine-3d-explorer/machine3dExplorerMeta';
import { crystalLattice3dMeta } from '../simulators/crystal-lattice-3d/crystalLattice3dMeta';
import { motorBasicsMeta } from '../simulators/motor-basics/motorBasicsMeta';
import { oilGreaseBasicsMeta } from '../simulators/oil-grease-basics/oilGreaseBasicsMeta';
import { pneumaticMeta } from '../simulators/pneumatic/pneumaticMeta';
import { pumpMeta } from '../simulators/pump/pumpMeta';
import { riggingLiftingMeta } from '../simulators/rigging-lifting/riggingLiftingMeta';
import { screwConveyorMeta } from '../simulators/screw-conveyor/screwConveyorMeta';
import { thermalExpansionMeta } from '../simulators/thermal-expansion/thermalExpansionMeta';
import { utmTestingMeta } from '../simulators/utm-testing/utmTestingMeta';
import { valvePackingMeta } from '../simulators/valve-packing/valvePackingMeta';
import { vbeltBasicsMeta } from '../simulators/vbelt-basics/vbeltBasicsMeta';
import { vibratingFeederMeta } from '../simulators/vibrating-feeder/vibratingFeederMeta';
import { vibrationMeta } from '../simulators/vibration/vibrationMeta';
import { weldStrengthMeta } from '../simulators/weld-strength/weldStrengthMeta';
import { multimeterMeta } from '../simulators/multimeter/multimeterMeta';
import { dbMeterMeta } from '../simulators/db-meter/dbMeterMeta';
import { vibrationMeterMeta } from '../simulators/vibration-meter/vibrationMeterMeta';
import { clampMeterMeta } from '../simulators/clamp-meter/clampMeterMeta';
import { megohmmeterMeta } from '../simulators/megohmmeter/megohmmeterMeta';
import { irThermometerMeta } from '../simulators/ir-thermometer/irThermometerMeta';
import { laserTachometerMeta } from '../simulators/laser-tachometer/laserTachometerMeta';

export interface SimulatorRegistryEntry {
  meta: SimulatorMeta;
  Component: LazyExoticComponent<ComponentType>;
}

export const SIMULATOR_REGISTRY: SimulatorRegistryEntry[] = [
  {
    meta: machine3dExplorerMeta,
    Component: lazy(() =>
      import('../simulators/machine-3d-explorer/Machine3DExplorerSimulator').then(
        (m) => ({
          default: m.Machine3DExplorerSimulator,
        })
      )
    ),
  },
  {
    meta: crystalLattice3dMeta,
    Component: lazy(() =>
      import('../simulators/crystal-lattice-3d/CrystalLattice3DSimulator').then(
        (m) => ({
          default: m.CrystalLattice3DSimulator,
        })
      )
    ),
  },
  {
    meta: caliperMeta,
    Component: lazy(() =>
      import('../simulators/caliper/CaliperSimulator').then((m) => ({
        default: m.CaliperSimulator,
      }))
    ),
  },
  {
    meta: fitsTolerancesMeta,
    Component: lazy(() =>
      import('../simulators/fits-tolerances/FitsTolerancesSimulator').then(
        (m) => ({ default: m.FitsTolerancesSimulator })
      )
    ),
  },
  {
    meta: boreGaugeMeta,
    Component: lazy(() =>
      import('../simulators/bore-gauge/BoreGaugeSimulator').then((m) => ({
        default: m.BoreGaugeSimulator,
      }))
    ),
  },
  {
    meta: hardnessMeta,
    Component: lazy(() =>
      import('../simulators/hardness/HardnessSimulator').then((m) => ({
        default: m.HardnessSimulator,
      }))
    ),
  },
  {
    meta: alignmentMeta,
    Component: lazy(() =>
      import('../simulators/alignment/AlignmentSimulator').then((m) => ({
        default: m.AlignmentSimulator,
      }))
    ),
  },
  {
    meta: bearingMeta,
    Component: lazy(() =>
      import('../simulators/bearing/BearingSimulator').then((m) => ({
        default: m.BearingSimulator,
      }))
    ),
  },
  {
    meta: vibrationMeta,
    Component: lazy(() =>
      import('../simulators/vibration/VibrationSimulator').then((m) => ({
        default: m.VibrationSimulator,
      }))
    ),
  },
  {
    meta: boltTorqueMeta,
    Component: lazy(() =>
      import('../simulators/bolt-torque/BoltTorqueSimulator').then((m) => ({
        default: m.BoltTorqueSimulator,
      }))
    ),
  },
  {
    meta: beltGearMeta,
    Component: lazy(() =>
      import('../simulators/belt-gear/BeltGearSimulator').then((m) => ({
        default: m.BeltGearSimulator,
      }))
    ),
  },
  {
    meta: gearStrengthMeta,
    Component: lazy(() =>
      import('../simulators/gear-strength/GearStrengthSimulator').then((m) => ({
        default: m.GearStrengthSimulator,
      }))
    ),
  },
  {
    meta: chainConveyorMeta,
    Component: lazy(() =>
      import('../simulators/chain-conveyor/ChainConveyorSimulator').then(
        (m) => ({ default: m.ChainConveyorSimulator })
      )
    ),
  },
  {
    meta: beltConveyorMeta,
    Component: lazy(() =>
      import('../simulators/belt-conveyor/BeltConveyorSimulator').then(
        (m) => ({ default: m.BeltConveyorSimulator })
      )
    ),
  },
  {
    meta: vibratingFeederMeta,
    Component: lazy(() =>
      import('../simulators/vibrating-feeder/VibratingFeederSimulator').then(
        (m) => ({ default: m.VibratingFeederSimulator })
      )
    ),
  },
  {
    meta: bucketElevatorMeta,
    Component: lazy(() =>
      import('../simulators/bucket-elevator/BucketElevatorSimulator').then(
        (m) => ({ default: m.BucketElevatorSimulator })
      )
    ),
  },
  {
    meta: screwConveyorMeta,
    Component: lazy(() =>
      import('../simulators/screw-conveyor/ScrewConveyorSimulator').then(
        (m) => ({ default: m.ScrewConveyorSimulator })
      )
    ),
  },
  {
    meta: dragChainConveyorMeta,
    Component: lazy(() =>
      import('../simulators/drag-chain-conveyor/DragChainConveyorSimulator').then(
        (m) => ({ default: m.DragChainConveyorSimulator })
      )
    ),
  },
  {
    meta: riggingLiftingMeta,
    Component: lazy(() =>
      import('../simulators/rigging-lifting/RiggingLiftingSimulator').then(
        (m) => ({ default: m.RiggingLiftingSimulator })
      )
    ),
  },
  {
    meta: utmTestingMeta,
    Component: lazy(() =>
      import('../simulators/utm-testing/UtmTestingSimulator').then((m) => ({
        default: m.UtmTestingSimulator,
      }))
    ),
  },
  {
    meta: beamBendingMeta,
    Component: lazy(() =>
      import('../simulators/beam-bending/BeamBendingSimulator').then((m) => ({
        default: m.BeamBendingSimulator,
      }))
    ),
  },
  {
    meta: weldStrengthMeta,
    Component: lazy(() =>
      import('../simulators/weld-strength/WeldStrengthSimulator').then((m) => ({
        default: m.WeldStrengthSimulator,
      }))
    ),
  },
  {
    meta: thermalExpansionMeta,
    Component: lazy(() =>
      import('../simulators/thermal-expansion/ThermalExpansionSimulator').then(
        (m) => ({ default: m.ThermalExpansionSimulator })
      )
    ),
  },
  {
    meta: couplingMeta,
    Component: lazy(() =>
      import('../simulators/coupling/CouplingSimulator').then((m) => ({
        default: m.CouplingSimulator,
      }))
    ),
  },
  {
    meta: lubeMeta,
    Component: lazy(() =>
      import('../simulators/lube/LubeSimulator').then((m) => ({
        default: m.LubeSimulator,
      }))
    ),
  },
  {
    meta: pneumaticMeta,
    Component: lazy(() =>
      import('../simulators/pneumatic/PneumaticSimulator').then((m) => ({
        default: m.PneumaticSimulator,
      }))
    ),
  },
  {
    meta: hydraulicMeta,
    Component: lazy(() =>
      import('../simulators/hydraulic/HydraulicSimulator').then((m) => ({
        default: m.HydraulicSimulator,
      }))
    ),
  },
  {
    meta: pumpMeta,
    Component: lazy(() =>
      import('../simulators/pump/PumpSimulator').then((m) => ({
        default: m.PumpSimulator,
      }))
    ),
  },
  {
    meta: valvePackingMeta,
    Component: lazy(() =>
      import('../simulators/valve-packing/ValvePackingSimulator').then((m) => ({
        default: m.ValvePackingSimulator,
      }))
    ),
  },
  {
    meta: compressorMeta,
    Component: lazy(() =>
      import('../simulators/compressor/CompressorSimulator').then((m) => ({
        default: m.CompressorSimulator,
      }))
    ),
  },
  {
    meta: bearingBasicsMeta,
    Component: lazy(() =>
      import('../simulators/bearing-basics/BearingBasicsSimulator').then(
        (m) => ({ default: m.BearingBasicsSimulator })
      )
    ),
  },
  {
    meta: vbeltBasicsMeta,
    Component: lazy(() =>
      import('../simulators/vbelt-basics/VbeltBasicsSimulator').then((m) => ({
        default: m.VbeltBasicsSimulator,
      }))
    ),
  },
  {
    meta: fastenersBasicsMeta,
    Component: lazy(() =>
      import('../simulators/fasteners-basics/FastenersBasicsSimulator').then(
        (m) => ({ default: m.FastenersBasicsSimulator })
      )
    ),
  },
  {
    meta: motorBasicsMeta,
    Component: lazy(() =>
      import('../simulators/motor-basics/MotorBasicsSimulator').then((m) => ({
        default: m.MotorBasicsSimulator,
      }))
    ),
  },
  {
    meta: oilGreaseBasicsMeta,
    Component: lazy(() =>
      import('../simulators/oil-grease-basics/OilGreaseBasicsSimulator').then(
        (m) => ({ default: m.OilGreaseBasicsSimulator })
      )
    ),
  },
  {
    meta: multimeterMeta,
    Component: lazy(() =>
      import('../simulators/multimeter/MultimeterSimulator').then((m) => ({
        default: m.MultimeterSimulator,
      }))
    ),
  },
  {
    meta: clampMeterMeta,
    Component: lazy(() =>
      import('../simulators/clamp-meter/ClampMeterSimulator').then((m) => ({
        default: m.ClampMeterSimulator,
      }))
    ),
  },
  {
    meta: dbMeterMeta,
    Component: lazy(() =>
      import('../simulators/db-meter/DbMeterSimulator').then((m) => ({
        default: m.DbMeterSimulator,
      }))
    ),
  },
  {
    meta: vibrationMeterMeta,
    Component: lazy(() =>
      import('../simulators/vibration-meter/VibrationMeterSimulator').then(
        (m) => ({ default: m.VibrationMeterSimulator })
      )
    ),
  },
  {
    meta: megohmmeterMeta,
    Component: lazy(() =>
      import('../simulators/megohmmeter/MegohmmeterSimulator').then((m) => ({
        default: m.MegohmmeterSimulator,
      }))
    ),
  },
  {
    meta: irThermometerMeta,
    Component: lazy(() =>
      import('../simulators/ir-thermometer/IrThermometerSimulator').then(
        (m) => ({ default: m.IrThermometerSimulator })
      )
    ),
  },
  {
    meta: laserTachometerMeta,
    Component: lazy(() =>
      import('../simulators/laser-tachometer/LaserTachometerSimulator').then(
        (m) => ({ default: m.LaserTachometerSimulator })
      )
    ),
  },
];

export const SIMULATORS_META: SimulatorMeta[] = SIMULATOR_REGISTRY.map(
  (entry) => entry.meta
);

export function getSimulatorById(
  id: string
): SimulatorRegistryEntry | undefined {
  return SIMULATOR_REGISTRY.find((entry) => entry.meta.id === id);
}
