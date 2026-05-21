#!/usr/bin/env node
import { Command } from "commander";
import { uploadProtocol } from "./uploader.js";
import { runProtocol } from "./runner.js";

const program = new Command();

program
  .name("pup")
  .description("Upload protocols to Opentrons Flex / OT-2 robots")
  .version("1.0.0")
  .argument("<file>", "Protocol file path (.py or .json)")
  .requiredOption("--ip <address>", "Robot IP address")
  .option("--run", "Execute the protocol after upload")
  .action(async (file: string, options: { ip: string; run: boolean }) => {
    try {
      const { protocolId } = await uploadProtocol(options.ip, file, {
        waitForAnalysis: true,
      });

      if (options.run) {
        await runProtocol(options.ip, protocolId);
      }
    } catch (err) {
      if (err instanceof Error && "body" in err && err.body != null) {
        console.error(`Error: ${err.message}`);
        console.error(JSON.stringify(err.body, null, 2));
      } else {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      }
      process.exit(1);
    }
  });

program.parse();
