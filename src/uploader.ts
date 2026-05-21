import * as fs from "fs";
import * as path from "path";
import { uploadProtocol as apiUpload, getAnalysis } from "./api.js";

const ALLOWED_EXTENSIONS = [".py", ".json"];
const ANALYSIS_POLL_INTERVAL_MS = 1000;
const ANALYSIS_POLL_MAX = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function uploadProtocol(
  ip: string,
  filePath: string,
  opts: { waitForAnalysis: boolean }
): Promise<{ protocolId: string }> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(
      `Unsupported file type "${ext}". Must be .py or .json`
    );
  }

  console.log("Uploading protocol...");
  const res = await apiUpload(ip, filePath);
  const protocolId = res.data.id;
  console.log(`Protocol uploaded. ID: ${protocolId}`);

  if (opts.waitForAnalysis && res.data.analysisSummaries.length > 0) {
    const analysisId = res.data.analysisSummaries[0].id;
    process.stdout.write("Waiting for analysis");

    let attempts = 0;
    while (attempts < ANALYSIS_POLL_MAX) {
      const status = await getAnalysis(ip, protocolId, analysisId);
      if (status === "completed") {
        process.stdout.write("...done\n");
        break;
      }
      process.stdout.write(".");
      await sleep(ANALYSIS_POLL_INTERVAL_MS);
      attempts++;
    }

    if (attempts >= ANALYSIS_POLL_MAX) {
      process.stdout.write("\n");
      throw new Error("Analysis timed out after 60 seconds");
    }
  }

  return { protocolId };
}
