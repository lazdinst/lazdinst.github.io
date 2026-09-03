import type { SeededRng } from "@/simulation";
import type {
  FleetFaultId,
  SensorKind,
  SensorReading,
  SensorStatus,
  TerrainClass,
} from "../types";

interface SensorTemplate {
  label: string;
  unit: string;
}

export const SENSOR_TEMPLATES: Record<SensorKind, SensorTemplate> = {
  gps: { label: "GPS error", unit: "m" },
  imu: { label: "IMU drift", unit: "°/h" },
  barometer: { label: "Baro alt", unit: "m" },
  pitot: { label: "Airspeed", unit: "m/s" },
  camera_eo: { label: "EO camera", unit: "fps" },
  camera_ir: { label: "IR camera", unit: "fps" },
  stereo: { label: "Stereo", unit: "fps" },
  lidar: { label: "Lidar", unit: "kpt/s" },
  radar: { label: "Radar", unit: "trk" },
  sonar: { label: "Sonar depth", unit: "m" },
  odometry: { label: "Wheel slip", unit: "%" },
  foot_contact: { label: "Foot contact", unit: "%" },
  ais: { label: "AIS", unit: "tgt" },
  radio: { label: "Radio", unit: "dBm" },
  motor_temp: { label: "Motor temp", unit: "°C" },
};

export interface SensorContext {
  speedMps: number;
  cruiseMps: number;
  altitudeM: number;
  terrain: TerrainClass;
  rssiDbm: number;
  faults: FleetFaultId[];
  /** Seconds the asset has been moving continuously. */
  movingForS: number;
  rng: SeededRng;
}

function statusFor(health: number): SensorStatus {
  if (health <= 0.05) return "failed";
  if (health < 0.7) return "degraded";
  return "ok";
}

function reading(id: SensorKind, value: number, health: number): SensorReading {
  const template = SENSOR_TEMPLATES[id];
  const clamped = Math.max(0, Math.min(1, health));
  return {
    id,
    label: template.label,
    unit: template.unit,
    value: Number.isFinite(value) ? Number(value.toFixed(2)) : 0,
    health: Number(clamped.toFixed(3)),
    status: statusFor(clamped),
  };
}

/**
 * Sensor readings derived from the same state that drives motion and link.
 * Values are correlated with terrain, speed, and faults instead of being
 * independent random streams.
 */
export function deriveSensors(suite: SensorKind[], ctx: SensorContext): SensorReading[] {
  const noise = () => ctx.rng.nextGaussian();
  const has = (fault: FleetFaultId) => ctx.faults.includes(fault);
  const urban = ctx.terrain === "urban";
  const moving = ctx.speedMps > 0.1;

  return suite.map((id) => {
    switch (id) {
      case "gps": {
        if (has("gps_loss")) return reading(id, 0, 0);
        const base = urban ? 6.5 : 0.9;
        return reading(id, Math.max(0.02, base + noise() * base * 0.2), urban ? 0.5 : 1);
      }
      case "imu": {
        const drift = has("imu_drift") ? 18 + noise() * 3 : 0.4 + Math.abs(noise()) * 0.15;
        const health = has("imu_drift") ? 0.3 : has("gps_loss") ? 0.75 : 1;
        return reading(id, drift, health);
      }
      case "barometer":
        return reading(id, ctx.altitudeM + noise() * 0.6, 1);
      case "pitot":
        return reading(id, ctx.speedMps + noise() * 0.4, 1);
      case "camera_eo":
        return reading(id, 30 - (ctx.rssiDbm < -90 ? 12 : 0) + noise() * 0.3, ctx.rssiDbm < -90 ? 0.6 : 1);
      case "camera_ir":
        return reading(id, 9 + noise() * 0.1, 1);
      case "stereo":
        return reading(id, 15 + noise() * 0.2, 1);
      case "lidar":
        return reading(id, 300 + noise() * 8 + (moving ? 20 : 0), 1);
      case "radar":
        return reading(id, Math.round(2 + Math.abs(noise()) * 3), 1);
      case "sonar":
        return reading(id, Math.max(1, 14 + noise() * 1.5), 1);
      case "odometry": {
        const slip = ctx.terrain === "open" ? 6 : ctx.terrain === "steep" ? 12 : 1.5;
        return reading(id, moving ? slip + Math.abs(noise()) : 0, 1);
      }
      case "foot_contact":
        return reading(id, moving ? 92 + noise() * 3 : 100, ctx.terrain === "wetland" ? 0.6 : 1);
      case "ais":
        return reading(id, Math.round(1 + Math.abs(noise()) * 2), 1);
      case "radio": {
        const failed = has("radio_failure");
        const health = failed ? 0 : ctx.rssiDbm < -95 ? 0.4 : ctx.rssiDbm < -85 ? 0.75 : 1;
        return reading(id, failed ? -120 : ctx.rssiDbm, health);
      }
      case "motor_temp": {
        const load = ctx.cruiseMps > 0 ? ctx.speedMps / ctx.cruiseMps : 0;
        const warm = 32 + load * 18 + Math.min(1, ctx.movingForS / 600) * 8;
        const temp = has("motor_overtemp") ? 96 + noise() * 1.5 : warm + noise() * 0.4;
        const health = has("motor_overtemp") ? 0.15 : temp > 62 ? 0.7 : 1;
        return reading(id, temp, health);
      }
      default:
        return reading(id, 0, 1);
    }
  });
}

export function meanSensorHealth(sensors: SensorReading[]): number {
  if (sensors.length === 0) return 1;
  return sensors.reduce((sum, sensor) => sum + sensor.health, 0) / sensors.length;
}
