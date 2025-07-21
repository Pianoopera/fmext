import { FMEXT_STATE } from "./config.ts";

export function validateOptionValue(value: string): boolean {
  const validOptions = [
    "-k",
    "-v",
    "-f",
    "-c",
    "--key",
    "--value",
    "--filter",
    "--count",
  ];
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

export async function deleteAllAliases() {
  const kv = await Deno.openKv(FMEXT_STATE);
  const entries = kv.list({ prefix: [] });

  for await (const entry of entries) {
    await kv.delete(entry.key);
  }

  kv.close();
}
