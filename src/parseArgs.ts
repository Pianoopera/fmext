import { Command } from "@cliffy/command";
import type { CLIArgs } from "./types.ts";
import { getVersion } from "./getVersion.ts";

export type DenoArgs = readonly string[];

export async function parseArgs(args: DenoArgs): Promise<CLIArgs> {
  const result: CLIArgs = {
    files: [],
    filters: [],
    help: false,
  };

  const command = new Command()
    .name("fmext")
    .description("Front matter extraction tool")
    .option("-c, --count", "Count mode")
    .option("-k, --key <key:string>", "Extract specific key")
    .option("-v, --value <value:string>", "Filter by value")
    .option(
      "-f, --filter <filter:string>",
      "Filter by key=value format",
      {
        collect: true,
      },
    )
    .arguments("[files...:string]");

  command.command("help")
    .description("Show help")
    .action(() => {
      command.showHelp();
      Deno.exit(0);
    });

  command.command("version")
    .description("Show version")
    .action(async () => {
      const version = await getVersion();
      console.log(version);
      Deno.exit(0);
    });

  command.command("alias")
    .description("Manage command aliases")
    .option("-l, --list", "List all aliases")
    .option(
      "-s, --set <alias:string> <optionValue:string>",
      "Set new alias `alias set keyTags -k:tags,-v:react`",
    )
    .option("-r, --remove <name:string>", "Remove alias")
    .action((options) => {
      const showHelp = () => {
        command.getCommand("alias")?.showHelp();
        Deno.exit(0);
      };
      if (Object.keys(options).length === 0) {
        showHelp();
      }

      function validateOptionValue(value: string): boolean {
        const validOptions = ["-k", "-v", "-f"];
        const parts = value.split(",");

        // -k:tags,-v:react のような形式で来るため左辺の部分をチェック
        let isValid = false;

        for (const part of parts) {
          const [key] = part.split(":");
          if (!validOptions.includes(key)) {
            isValid = true;
          }
        }
        return isValid;
      }

      if (options.set) {
        if (options.set.length < 2) {
          showHelp();
        }
        const keyName = options.set[0];
        const optionsValue = options.set[1];

        if (validateOptionValue(optionsValue)) showHelp();
        const setRes = {
          aliasName: keyName,
          options: optionsValue,
          runCommand: `fmext alias run ${keyName}`,
        };
        console.log(JSON.stringify(setRes, null, 2));
        Deno.exit(0);
      }
    });

  try {
    const parsed = await command.parse(args as string[]);

    result.count = !!parsed.options.count;
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

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse arguments");
  }
}
