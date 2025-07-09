export async function getVersion(): Promise<string> {
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
