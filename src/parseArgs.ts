import type { CLIArgs } from "./types.ts";

export type DenoArgs = readonly string[];

export function parseArgs(args: DenoArgs): CLIArgs {
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
