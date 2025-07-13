import { convertToFormattedOutput } from "./convertToFormattedOutput.ts";
import { filterFrontMatter } from "./filterFrontMatter.ts";
import { matchesValue } from "./matchesValue.ts";
import {
  extractKeyValue,
  formatOutputWithFormat,
  parseFile,
} from "./parser.ts";
import type { CLIArgs } from "./types.ts";

export async function processFilesWithFrontMatter(
  filesToProcess: string[],
  args: CLIArgs,
) {
  const results: unknown[] = [];
  let hasErrors = false;
  for (const file of filesToProcess) {
    try {
      const options: { key?: string; value?: string } = {};
      if (args.key !== undefined) {
        options.key = args.key;
      }
      if (args.value !== undefined) {
        options.value = args.value;
      }
      const result = await parseFile(file);

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

      const formattedOutput = formatOutputWithFormat(output, file);
      results.push(formattedOutput);
    } catch (_error) {
      hasErrors = true;
    }
  }

  return { results, hasErrors };
}
