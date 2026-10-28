import { cache, CacheStatus, redisConfig } from "../../providers/redis";
import { BlogStats } from "./stats.interface";
import { statsRepository } from "./stats.repository";

class StatsService {
  private inFlight: Promise<BlogStats> | null = null;

  async getStats(): Promise<{ stats: BlogStats; cacheStatus: CacheStatus }> {
    const cached = await cache.getJSON<BlogStats>(redisConfig.keys.stats());
    if (cached) {
      return { stats: cached, cacheStatus: "HIT" };
    }

    let flight = this.inFlight;
    if (!flight) {
      flight = this.readAndStore();
      this.inFlight = flight;
    }

    try {
      const stats = await flight;
      return { stats, cacheStatus: "MISS" };
    } finally {
      if (this.inFlight === flight) {
        this.inFlight = null;
      }
    }
  }

  private readAndStore(): Promise<BlogStats> {
    return cache.aside(redisConfig.keys.stats(), redisConfig.ttl.stats, () => statsRepository.getBlogStats()).then((result) => result.value);
  }
}

export const statsService = new StatsService();
