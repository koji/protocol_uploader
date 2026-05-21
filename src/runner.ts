import { createRun, startRun, getRun } from "./api.js";

const RUN_POLL_INTERVAL_MS = 2000;
const TERMINAL_STATUSES = ["stopped", "failed", "succeeded"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runProtocol(
  ip: string,
  protocolId: string
): Promise<void> {
  console.log("Creating run...");
  const runId = await createRun(ip, protocolId);

  console.log("Starting run...");
  await startRun(ip, runId);

  while (true) {
    const status = await getRun(ip, runId);
    process.stdout.write(`\rRun status: ${status}   `);

    if (TERMINAL_STATUSES.includes(status)) {
      process.stdout.write("\n");
      if (status === "failed") {
        throw new Error(`Run ${runId} failed`);
      }
      break;
    }

    await sleep(RUN_POLL_INTERVAL_MS);
  }

  console.log("Done.");
}
