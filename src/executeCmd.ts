import type { CLIResult } from "./types.ts";

export async function executeCommand(
  runCommand: string[],
  files: string[],
): Promise<CLIResult[]> {
  // fmextを実行する
  const command = new Deno.Command("fmext", {
    args: runCommand.concat(files),
    stdout: "piped",
    stderr: "piped",
  });
  const process = command.spawn();
  const { code, stdout } = await process.output();

  if (code === 0) {
    const output: CLIResult[] = JSON.parse(new TextDecoder().decode(stdout));
    return output;
  } else {
    return [];
  }
}
