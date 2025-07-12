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
        console.error(`${file}: ${result.errorMessage}`);
        hasErrors = true;
        continue;
      }

      if (result.frontMatter === null) {
        console.error(`${file}: No front matter found`);
        continue;
      }

      // Skip the filtering mode in this section as files are already filtered
      let output: unknown = result.frontMatter;

      if (args.key) {
        output = extractKeyValue(result.frontMatter, args.key);
        if (output === undefined) {
          console.error(`${file}: Key '${args.key}' not found`);
          hasErrors = true;
          continue;
        }
      }

      const formattedOutput = formatOutputWithFormat(output, file);
      results.push(formattedOutput);
    } catch (error) {
      console.error(`${file}: ${error}`);
      hasErrors = true;
    }
  }
  return { results, hasErrors };
}
