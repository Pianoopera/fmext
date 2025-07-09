#!/usr/bin/env deno run --allow-read

import {
  aggregateCounts,
  countValues,
  extractKeyValue,
  formatCounts,
  formatOutput,
  parseFile,
} from "./src/parser.ts";
import type { CLIArgs } from "./src/types.ts";

async function getVersion(): Promise<string> {
  try {
    const path = new URL("./package.json", import.meta.url).pathname;
    const packageJsonContent = await Deno.readTextFile(path);
    const packageJson = JSON.parse(packageJsonContent);
    return `v${packageJson.version}`;
  } catch (error) {
    console.error("Error reading version:", error);
    return "version unknown";
  }
}

export function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    files: [],
    filters: [],
    silent: false,
    help: false,
  };

  // Check for subcommands first
  if (args.length > 0) {
    const firstArg = args[0];
    if (firstArg === "version") {
      result.version = true;
      return result;
    }
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--silent" || arg === "-s") {
      result.silent = true;
    } else if (arg === "--count" || arg === "-c") {
      result.count = true;
    } else if (arg === "--verbose" || arg === "-V") {
      result.verbose = true;
    } else if (arg === "--filter" || arg === "-f") {
      if (i + 2 < args.length) {
        const key = args[++i];
        const value = args[++i];
        result.filters.push({ key, value });
      } else {
        throw new Error("--filter requires both key and value arguments");
      }
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

SUBCOMMANDS:
    version              Show the version of fmext

OPTIONS:
    -k, --key <KEY>      Extract specific key from front matter (supports dot notation for nested keys)
    -v, --value <VALUE>  Filter files where the specified key matches the given value
    -f, --filter <KEY> <VALUE>  Filter files where KEY matches VALUE (can be used multiple times for AND conditions)
    -c, --count          Count individual values and array elements across files
    -s, --silent         Skip files without front matter silently
    -V, --verbose        Show detailed processing information
    -h, --help           Show this help message

EXAMPLES:
    fmext file.md                         # Parse front matter from file.md
    fmext --key title *.md                # Extract 'title' key from all .md files
    fmext --key "meta.author" doc.md      # Extract nested key using dot notation
    fmext --key topic --value react *.md  # Filter files where 'topic' equals 'react'
    fmext --filter published true *.md    # Filter files where 'published' is true
    fmext --filter published true --filter type tech *.md  # Multiple filters (AND condition)
    fmext --count --filter status draft *.md  # Count values from filtered files only
    fmext --silent *.md                   # Parse all .md files, skip those without front matter

DESCRIPTION:
    Parses YAML front matter from Markdown files and outputs the results.
    Front matter should be enclosed in triple dashes (---) at the beginning of the file.

    When using --value or --filter, files are filtered based on the specified key-value pairs:
    - For string values: exact match comparison
    - For array values: checks if the value is contained in the array
    - For boolean/number values: converted to string for comparison
    - Multiple --filter options create AND conditions (all must match)
    When filtering, only matching file paths are output (one per line) unless used with --count.
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

    if (args.version) {
      const version = await getVersion();
      console.log(version);
      return;
    }

    if (args.files.length === 0) {
      console.error("Error: No files specified");
      showHelp();
      Deno.exit(1);
    }

    let hasErrors = false;

    // First, apply filters to get the list of files to process
    let filesToProcess = args.files;

    if (args.filters.length > 0 || (args.key && args.value)) {
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
    }

    if (args.count) {
      const allCounts = [];

      for (const file of filesToProcess) {
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
      for (const file of filesToProcess) {
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
