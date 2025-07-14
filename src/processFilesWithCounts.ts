import { convertToFormattedOutput } from "./convertToFormattedOutput.ts";
import { filterFrontMatter } from "./filterFrontMatter.ts";
import { matchesValue } from "./matchesValue.ts";
import { aggregateCounts, countValues, extractKeyValue } from "./parser.ts";
import { processFile } from "./processFiles.ts";
import type { CLIArgs, CLIResult } from "./types.ts";

export async function processFilesWithCounts(
  filesToProcess: string[],
  args: CLIArgs,
): Promise<CLIResult> {
  const results: CLIResult = {
    file: filesToProcess[0],
    output: [],
  };

  const allCounts = [];

  for (const file of filesToProcess) {
    const options = {
      key: args.key,
      value: args.value,
    };

    const result = await processFile(file, options);

    if (result === null || result.hasError) {
      continue;
    }

    if (result.hasError && result.errorMessage) {
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
        continue;
      }

      const formattedOutput = convertToFormattedOutput(output);
      output = formattedOutput;
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
  results.output = formattedOutput[0];
  return results;
}
