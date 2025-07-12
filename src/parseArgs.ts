import { Command } from "@cliffy/command";
import type { CLIArgs } from "./types.ts";
import { getVersion } from "./getVersion.ts";

export type DenoArgs = readonly string[];

export async function parseArgs(args: DenoArgs): Promise<CLIArgs> {
  const result: CLIArgs = {
    files: [],
    filters: [],
    silent: false,
    help: false,
  };

  const command = new Command()
    .name("fmext")
    .description("Front matter extraction tool")
    .option("-s, --silent", "Silent mode")
    .option("-c, --count", "Count mode")
    .option("-V, --verbose", "Verbose mode")
    .option("-k, --key <key:string>", "Extract specific key")
    .option("-v, --value <value:string>", "Filter by value")
    .option(
      "-f, --filter <filter:string>",
      "Filter by key=value format",
      {
        collect: true,
      },
    )
    .arguments("[files...:string]")
    .noExit();

  command.command("version")
    .description("Show version")
    .action(async () => {
      const version = await getVersion();
      console.log(version);
      Deno.exit(0);
    });

  command.command("help")
    .description("Show help")
    .action(() => {
      command.showHelp();
      Deno.exit(0);
    });

  try {
    const parsed = await command.parse(args as string[]);

    result.silent = !!parsed.options.silent;
    result.count = !!parsed.options.count;
    result.verbose = !!parsed.options.verbose;
    result.key = parsed.options.key!;
    result.value = parsed.options.value!;
    result.files = parsed.args || [];
    result.filters = [];
    if (parsed.options.filter) {
      const filters = parsed.options.filter;

      for (const filter of filters) {
        if (typeof filter === "string" && filter.includes("=")) {
          const [key, ...valueParts] = filter.split("=");
          const value = valueParts.join("="); // 値に=が含まれる場合に対応
          if (key && value) {
            result.filters.push({ key, value });
          } else {
            throw new Error(
              "Invalid filter format (expected key=value): " + filter,
            );
          }
        } else {
          throw new Error(
            "Invalid filter format (expected key=value): " + filter,
          );
        }
      }
    }

    // Validate that --value requires --key
    if (result.value && !result.key) {
      throw new Error("--value requires --key to be specified");
    }

    // Validate format option
    if (result.format && !["text", "json"].includes(result.format)) {
      throw new Error("--format must be either 'text' or 'json'");
    }

    // console.log("Parsed arguments:", result);

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse arguments");
  }
}
