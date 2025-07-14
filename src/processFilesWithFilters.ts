import { matchesValue } from "./matchesValue.ts";
import { extractKeyValue, parseFile } from "./parser.ts";
import type { CLIArgs } from "./types.ts";

export async function processFilesWithFilters(
  args: CLIArgs,
  filesToProcess: string[],
) {
  const filteredFiles: string[] = [];
  let hasErrors = false;

  for (const file of args.files) {
    try {
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

      let passesAllFilters = true;

      // Check --filter conditions (AND logic)
      for (const filter of args.filters) {
        const extractedValue = extractKeyValue(
          result.frontMatter,
          filter.key,
        );
        if (!matchesValue(extractedValue, filter.value)) {
          passesAllFilters = false;
          break;
        }
      }

      // Check --key --value condition as additional filter
      if (passesAllFilters && args.key && args.value) {
        const extractedValue = extractKeyValue(
          result.frontMatter,
          args.key,
        );
        if (!matchesValue(extractedValue, args.value)) {
          passesAllFilters = false;
        }
      }

      if (passesAllFilters) {
        filteredFiles.push(file);
      }
    } catch (error) {
      console.error(`${file}: ${error}`);
      hasErrors = true;
    }
  }

  // If filtering with --key --value (regardless of --filter usage), output matching files
  if (!args.count && args.key && args.value) {
    for (const file of filteredFiles) {
      console.log(file);
    }
    if (hasErrors) {
      Deno.exit(1);
    }
    return;
  }

  filesToProcess = filteredFiles;

  return { hasErrors, filesToProcess };
}
