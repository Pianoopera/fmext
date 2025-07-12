import { aggregateCounts, countValues } from "./parser.ts";
import { processFile } from "./processFiles.ts";
import type { CLIArgs } from "./types.ts";

export async function processFilesWithCounts(
  filesToProcess: string[],
  args: CLIArgs,
  hasErrors: boolean,
) {
  const allCounts = [];

  for (const file of filesToProcess) {
    const options = {
      key: args.key,
      value: args.value,
      silent: args.silent,
    };

    const result = await processFile(file, options);

    if (result === null || result.hasError) {
      if (result?.hasError) {
        hasErrors = true;
      }
      continue;
    }

    const counts = countValues(
      result.frontMatter as Record<string, unknown>,
      args.key,
    );
    allCounts.push(counts);
  }

  if (allCounts.length > 0) {
    const aggregatedCounts = aggregateCounts(allCounts);
    console.log(JSON.stringify(aggregatedCounts, null, 2));
  }
  return hasErrors;
}
