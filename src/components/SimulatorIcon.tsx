import {
  Activity,
  CircleDot,
  Cog,
  Cpu,
  Crosshair,
  Disc,
  Droplets,
  Flame,
  Gauge,
  Layers,
  Radio,
  Ruler,
  ScanLine,
  Thermometer,
  Triangle,
  Volume2,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

interface SimulatorIconProps {
  iconName: string;
  className?: string;
}

export function SimulatorIcon({
  iconName,
  className = 'h-5 w-5',
}: SimulatorIconProps) {
  switch (iconName) {
    case 'Activity':
      return <Activity className={className} />;
    case 'CircleDot':
      return <CircleDot className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Crosshair':
      return <Crosshair className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Gauge':
      return <Gauge className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Ruler':
      return <Ruler className={className} />;
    case 'ScanLine':
      return <ScanLine className={className} />;
    case 'Thermometer':
      return <Thermometer className={className} />;
    case 'Triangle':
      return <Triangle className={className} />;
    case 'Volume2':
      return <Volume2 className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Cog':
    default:
      return <Cog className={className} />;
  }
}
