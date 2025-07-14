import { convertToFormattedOutput } from "./convertToFormattedOutput.ts";
import { filterFrontMatter } from "./filterFrontMatter.ts";
import { matchesValue } from "./matchesValue.ts";
import { aggregateCounts, countValues, extractKeyValue } from "./parser.ts";
import { processFile } from "./processFiles.ts";
import type { CLIArgs } from "./types.ts";

export async function processFilesWithCounts(
  filesToProcess: string[],
  args: CLIArgs,
) {
  const allCounts = [];
  let hasErrors = false;

  for (const file of filesToProcess) {
    const options = {
      key: args.key,
      value: args.value,
    };

    const result = await processFile(file, options);

    if (result === null || result.hasError) {
      if (result?.hasError) {
        hasErrors = true;
      }
      continue;
    }

    if (result.hasError && result.errorMessage) {
      hasErrors = true;
      continue;
    }
    if (result.frontMatter === null) {
      continue;
    }

    if (!filterFrontMatter(result.frontMatter, args)) {
      continue;
    }

    let output: unknown = result.frontMatter;
    if (args.key) {
      output = extractKeyValue(result.frontMatter, args.key);
      if (args.value) {
        if (!matchesValue(output, args.value)) {
          continue;
        }
      }
      if (output === undefined) {
        hasErrors = true;
        continue;
      }

      const formattedOutput = convertToFormattedOutput(output);
      output = formattedOutput;
      if (formattedOutput.length !== 0) {
        hasErrors = false;
      }
    }

    const counts = countValues(
      result.frontMatter as Record<string, unknown>,
      args.key,
    );
    allCounts.push(counts);
  }

  const aggregated = aggregateCounts(allCounts);

  const formattedOutput = aggregated.map((count) => {
    return Object.entries(count).map(([key, value]) => ({
      key,
      value,
    }));
  });

  const result = {
    output: formattedOutput[0],
  };

  return {
    hasErrors,
    aggregatedCounts: allCounts.length > 0 ? result : [],
  };
}
