import { matchesValue } from "@fmext/fmext";
import { extractKeyValue, parseFile } from "./parser.ts";
import type { CLIArgs } from "./types.ts";

export async function processFilesWithFilters(
  args: CLIArgs,
  hasErrors: boolean,
  filesToProcess: string[],
) {
  const filteredFiles: string[] = [];

  for (const file of args.files) {
    try {
      const options: { silent?: boolean } = {};
      if (args.silent !== undefined) {
        options.silent = args.silent;
      }
      const result = await parseFile(file, options);

      if (result.hasError && result.errorMessage) {
        if (!args.silent) {
          console.error(`${file}: ${result.errorMessage}`);
          hasErrors = true;
        }
        continue;
      }

      if (result.frontMatter === null) {
        if (!args.silent) {
          console.error(`${file}: No front matter found`);
        }
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

  if (args.verbose) {
    console.error(
      `\nFiltered ${args.files.length} files down to ${filesToProcess.length} files\n`,
    );
  }

  return { hasErrors, filesToProcess };
}
