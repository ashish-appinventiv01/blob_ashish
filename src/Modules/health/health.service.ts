import { HealthStatus } from "./health.interface";

export function getHealthStatus(): HealthStatus {
  return { status: "ok" };
}
