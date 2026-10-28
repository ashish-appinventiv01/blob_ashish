import { HealthStatus } from "./health.interface";

class HealthService {
  getHealthStatus(): HealthStatus {
    return { status: "ok" };
  }
}

export const healthService = new HealthService();
