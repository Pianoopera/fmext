#!/usr/bin/env deno run --allow-read

import { parseArgs } from "./src/parseArgs.ts";
import { processFilesWithFrontMatter } from "./src/processFilesWithFrontMatter.ts";
import { processFilesWithCounts } from "./src/processFilesWithCounts.ts";
import type { CLIResult } from "./src/types.ts";

async function main() {
  try {
    const args = await parseArgs(Deno.args);

    const filesToProcess = args.files;

    if (args.count) {
      const result: CLIResult = {
        output: [],
      };
      const { output } = await processFilesWithCounts(
        filesToProcess,
        args,
      );
      result.output = output;
      console.log(JSON.stringify(result, null, 2));
    } else {
      const result: CLIResult[] = [];
      const cliResult = await processFilesWithFrontMatter(
        filesToProcess,
        args,
      );
      cliResult.forEach((res) => {
        if (res.output && res.file) {
          result.push({
            file: res.file,
            output: res.output,
          });
        }
      });
      console.log(JSON.stringify(result, null, 2));
    }
    Deno.exit(0);
  } catch (error) {
    console.error(`Error: ${error}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
