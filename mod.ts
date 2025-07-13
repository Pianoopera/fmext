#!/usr/bin/env deno run --allow-read

import { parseArgs } from "./src/parseArgs.ts";
import { processFilesWithFrontMatter } from "./src/processFilesWithFrontMatter.ts";
import { processFilesWithCounts } from "./src/processFilesWithCounts.ts";

async function main() {
  try {
    const args = await parseArgs(Deno.args);

    const filesToProcess = args.files;

    if (args.count) {
      const { hasErrors, aggregatedCounts } = await processFilesWithCounts(
        filesToProcess,
        args,
      );

      if (hasErrors) {
        console.log([]);
        Deno.exit(0);
      }
      console.log(JSON.stringify(aggregatedCounts, null, 2));
    } else {
      const { results, hasErrors } = await processFilesWithFrontMatter(
        filesToProcess,
        args,
      );
      if (hasErrors) {
        console.log([]);
        Deno.exit(0);
      }
      console.log(JSON.stringify(results, null, 2));
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
