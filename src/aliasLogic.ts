export function validateOptionValue(value: string): boolean {
  const validOptions = ["-k", "-v", "-f", "--key", "--value", "--filter"];
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
