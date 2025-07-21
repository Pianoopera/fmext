import { ALLOW_ENV } from "./config.ts";
import type { CLIResult } from "./types.ts";

export async function executeCommand(
  runCommand: string[],
  files: string[],
): Promise<CLIResult[]> {
  // 実行環境を判定してコマンドを選択
  const isCompiled = Deno.execPath().includes("fmext");

  let command;
  if (isCompiled) {
    // コンパイル済みバイナリの場合
    command = new Deno.Command("fmext", {
      args: runCommand.concat(files),
      stdout: "piped",
      stderr: "piped",
    });
  } else {
    // 開発環境の場合
    command = new Deno.Command("deno", {
      args: [
        "run",
        "--unstable-kv",
        "-R",
        "-W",
        `--allow-env=${ALLOW_ENV}`,
        "--allow-run",
        "mod.ts",
      ].concat(runCommand).concat(files),
      stdout: "piped",
      stderr: "piped",
    });
  }
  const process = command.spawn();
  const { code, stdout } = await process.output();

  if (code === 0) {
    const output: CLIResult[] = JSON.parse(new TextDecoder().decode(stdout));
    return output;
  } else {
    return [];
  }
}
