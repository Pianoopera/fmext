#!/usr/bin/env deno run --allow-read

import { parseArgs } from "./src/parseArgs.ts";
import { processFilesWithFilters } from "./src/processFilesWithFilters.ts";
import { processFilesWithFrontMatter } from "./src/processFilesWithFrontMatter.ts";
import { processFilesWithCounts } from "./src/processFilesWithCounts.ts";

export function matchesValue(
  extractedValue: unknown,
  targetValue: string,
): boolean {
  if (extractedValue === undefined || extractedValue === null) {
    return false;
  }

  // Handle array values - check if the target value is contained in the array
  if (Array.isArray(extractedValue)) {
    return extractedValue.some((item) => {
      if (typeof item === "string") {
        return item === targetValue;
      } else if (typeof item === "number" || typeof item === "boolean") {
        return item.toString() === targetValue;
      }
      return false;
    });
  }

  // Handle string values - exact match comparison
  if (typeof extractedValue === "string") {
    return extractedValue === targetValue;
  }

  // Handle boolean/number values - convert to string for comparison
  if (
    typeof extractedValue === "boolean" ||
    typeof extractedValue === "number"
  ) {
    return extractedValue.toString() === targetValue;
  }

  return false;
}

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
      hasErrors = await processFilesWithFrontMatter(
        filesToProcess,
        args,
        hasErrors,
      );
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
