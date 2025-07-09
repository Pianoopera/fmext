import { extractKeyValue, formatOutput, parseFile } from "./parser.ts";
import type { CLIArgs } from "./types.ts";

export async function processFilesWithFrontMatter(
  filesToProcess: string[],
  args: CLIArgs,
  hasErrors: boolean,
) {
  for (const file of filesToProcess) {
    try {
      const options: { key?: string; value?: string; silent?: boolean } = {};
      if (args.key !== undefined) {
        options.key = args.key;
      }
      if (args.value !== undefined) {
        options.value = args.value;
      }
      if (args.silent !== undefined) {
        options.silent = args.silent;
      }
      const result = await parseFile(file, options);

      if (result.hasError && result.errorMessage) {
        console.error(`${file}: ${result.errorMessage}`);
        hasErrors = true;
        continue;
      }

      if (result.frontMatter === null) {
        if (!args.silent) {
          console.error(`${file}: No front matter found`);
        }
        continue;
      }

      // Skip the filtering mode in this section as files are already filtered
      let output: unknown = result.frontMatter;

      if (args.key) {
        output = extractKeyValue(result.frontMatter, args.key);
        if (output === undefined) {
          if (!args.silent) {
            console.error(`${file}: Key '${args.key}' not found`);
            hasErrors = true;
          }
          continue;
        }
      }

      const formattedOutput = formatOutput(output);
      if (formattedOutput) {
        if (filesToProcess.length > 1) {
          console.log(`${file}: ${formattedOutput}`);
        } else {
          console.log(formattedOutput);
        }
      }
    } catch (error) {
      console.error(`${file}: ${error}`);
      hasErrors = true;
    }
  }
  return hasErrors;
}
