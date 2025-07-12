#!/usr/bin/env deno run --allow-read

import { parseArgs } from "./src/parseArgs.ts";
import { processFilesWithFilters } from "./src/processFilesWithFilters.ts";
import { processFilesWithFrontMatter } from "./src/processFilesWithFrontMatter.ts";
import { processFilesWithCounts } from "./src/processFilesWithCounts.ts";

async function main() {
  try {
    const args = await parseArgs(Deno.args);

    let hasErrors = false;

    // First, apply filters to get the list of files to process
    let filesToProcess = args.files;

    if (args.filters.length > 0 || (args.key && args.value)) {
      const operationResult = await processFilesWithFilters(
        args,
        hasErrors,
        filesToProcess,
      );
      if (operationResult === undefined) {
        // If res is undefined, it means no files passed the filters
        console.error("No files matched the specified filters.");
        Deno.exit(0);
      }
      hasErrors = operationResult.hasErrors;
      filesToProcess = operationResult.filesToProcess;
    }

    if (args.count) {
      hasErrors = await processFilesWithCounts(filesToProcess, args, hasErrors);
    } else {
      const { results, hasErrors } = await processFilesWithFrontMatter(
        filesToProcess,
        args,
      );
      if (hasErrors) {
        console.error("Errors occurred while processing files.");
        Deno.exit(1);
      }
      console.log(JSON.stringify(results, null, 2));
    }

    if (hasErrors) {
      Deno.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
