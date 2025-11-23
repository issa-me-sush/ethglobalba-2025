import "dotenv/config";
import { loadConfig } from "./config";
import { createDbClient } from "./supabase";
import { runDiscoveryTick } from "./jobs/discovery";
import { runResolutionTick } from "./jobs/resolution";

async function main() {
  const config = loadConfig();
  const db = createDbClient(config);

  const discoveryIntervalMs = Number(process.env.DISCOVERY_INTERVAL_MS ?? 3 * 60 * 1000); // 3 min
  const resolutionIntervalMs = Number(
    process.env.RESOLUTION_INTERVAL_MS ??
      (config.appMode === "demo" ? 1 * 60 * 1000 : 20 * 60 * 1000),
  ); // 1 min demo, 20 min prod

  console.log("Banger Arenas worker starting…");
  console.log("  discovery interval (ms):", discoveryIntervalMs);
  console.log("  resolution interval (ms):", resolutionIntervalMs);

  const runDiscoveryLoop = async () => {
    try {
      await runDiscoveryTick(config, db);
    } catch (e) {
      console.error("[worker] Discovery tick failed", e);
    }
  };

  const runResolutionLoop = async () => {
    try {
      await runResolutionTick(config, db);
    } catch (e) {
      console.error("[worker] Resolution tick failed", e);
    }
  };

  // Kick off immediately, then on intervals
  void runDiscoveryLoop();
  void runResolutionLoop();

  setInterval(runDiscoveryLoop, discoveryIntervalMs);
  setInterval(runResolutionLoop, resolutionIntervalMs);
}

void main();


