import { getBlogStats } from "./stats.repository";
import { BlogStats } from "./stats.interface";

export function getStats(): Promise<BlogStats> {
  return getBlogStats();
}
