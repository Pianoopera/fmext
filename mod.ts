#!/usr/bin/env deno run --allow-read

import {
  parseFile,
  extractKeyValue,
  formatOutput,
  countValues,
  aggregateCounts,
  formatCounts,
} from "./src/parser.ts";
import type { CLIArgs } from "./src/types.ts";

function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    files: [],
    silent: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--silent" || arg === "-s") {
      result.silent = true;
    } else if (arg === "--count" || arg === "-c") {
      result.count = true;
    } else if (arg === "--key" || arg === "-k") {
      if (i + 1 < args.length) {
        result.key = args[++i];
      } else {
        throw new Error("--key requires a value");
      }
    } else if (arg === "--value" || arg === "-v") {
      if (i + 1 < args.length) {
        result.value = args[++i];
      } else {
        throw new Error("--value requires a value");
      }
    } else if (!arg.startsWith("-")) {
      result.files.push(arg);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  // Validate that --value requires --key
  if (result.value && !result.key) {
    throw new Error("--value requires --key to be specified");
  }

  return result;
}

function showHelp() {
  console.log(`
fmext - YAML Front Matter Parser

USAGE:
    fmext [OPTIONS] <FILES...>

OPTIONS:
    -k, --key <KEY>      Extract specific key from front matter (supports dot notation for nested keys)
    -v, --value <VALUE>  Filter files where the specified key matches the given value
    -c, --count          Count individual values and array elements across files
    -s, --silent         Skip files without front matter silently
    -h, --help           Show this help message

EXAMPLES:
    fmext file.md                         # Parse front matter from file.md
    fmext --key title *.md                # Extract 'title' key from all .md files
    fmext --key "meta.author" doc.md      # Extract nested key using dot notation
    fmext --key topic --value react *.md  # Filter files where 'topic' equals 'react'
    fmext --key tags --value javascript *.md # Filter files where 'tags' array contains 'javascript'
    fmext --key published --value true *.md  # Filter files where 'published' is true
    fmext --count *.md                    # Count individual values and array elements across files
    fmext --count --key tags *.md         # Count only elements from 'tags' key
    fmext --silent *.md                   # Parse all .md files, skip those without front matter

DESCRIPTION:
    Parses YAML front matter from Markdown files and outputs the results.
    Front matter should be enclosed in triple dashes (---) at the beginning of the file.

    When using --value, files are filtered based on the specified key-value pair:
    - For string values: exact match comparison
    - For array values: checks if the value is contained in the array
    - For boolean/number values: converted to string for comparison
    When filtering, only matching file paths are output (one per line).
  `);
}

function matchesValue(extractedValue: unknown, targetValue: string): boolean {
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
    const args = parseArgs(Deno.args);

    if (args.help) {
      showHelp();
      return;
    }

    if (args.files.length === 0) {
      console.error("Error: No files specified");
      showHelp();
      Deno.exit(1);
    }

    let hasErrors = false;

    if (args.count) {
      const allCounts = [];

      for (const file of args.files) {
        try {
          const options: { key?: string; value?: string; silent?: boolean } =
            {};
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

          const counts = countValues(result.frontMatter, args.key);
          allCounts.push(counts);
        } catch (error) {
          console.error(`${file}: ${error}`);
          hasErrors = true;
        }
      }

      if (allCounts.length > 0) {
        const aggregatedCounts = aggregateCounts(allCounts);
        const formattedCounts = formatCounts(aggregatedCounts);
        console.log(formattedCounts);
      }
    } else {
      for (const file of args.files) {
        try {
          const options: { key?: string; value?: string; silent?: boolean } =
            {};
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

          // Handle filtering mode when --value is provided
          if (args.value && args.key) {
            const extractedValue = extractKeyValue(
              result.frontMatter,
              args.key
            );

            if (extractedValue === undefined) {
              if (!args.silent) {
                console.error(`${file}: Key '${args.key}' not found`);
                hasErrors = true;
              }
              continue;
            }

            if (matchesValue(extractedValue, args.value)) {
              console.log(file);
            }
            continue;
          }

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
            if (args.files.length > 1) {
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
