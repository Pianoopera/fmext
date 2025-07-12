import { assertEquals } from "jsr:@std/assert";
import { parseArgs } from "../../src/parseArgs.ts";

Deno.test("parseArgs handles single --filter option", async () => {
  const args = ["--filter", "published=true", "personal-blog.md"];
  const result = await parseArgs(args);

  assertEquals(result.filters.length, 1);
  assertEquals(result.filters[0].key, "published");
  assertEquals(result.filters[0].value, "true");
  assertEquals(result.files, ["personal-blog.md"]);
});

Deno.test("parseArgs handles multiple --filter options", async () => {
  const args = [
    "--filter",
    "published=true",
    "--filter",
    "type=tech",
    "personal-blog.md",
    "react-tutorial.md",
  ];
  const result = await parseArgs(args);

  assertEquals(result.filters.length, 2);
  assertEquals(result.filters[0].key, "published");
  assertEquals(result.filters[0].value, "true");
  assertEquals(result.filters[1].key, "type");
  assertEquals(result.filters[1].value, "tech");
  assertEquals(result.files, ["personal-blog.md", "react-tutorial.md"]);
});

Deno.test("parseArgs handles --filter with --count", async () => {
  const args = [
    "--filter",
    "status=draft",
    "--count",
    "--key",
    "topics",
    "*.md",
  ];
  const result = await parseArgs(args);

  assertEquals(result.filters.length, 1);
  assertEquals(result.filters[0].key, "status");
  assertEquals(result.filters[0].value, "draft");
  assertEquals(result.count, true);
  assertEquals(result.key, "topics");
  assertEquals(result.files, ["*.md"]);
});

Deno.test("parseArgs throws error when --filter lacks arguments", async () => {
  const args = ["--filter", "published"];
  let error: Error | null = null;

  try {
    await parseArgs(args);
  } catch (e) {
    error = e as Error;
  }

  assertEquals(
    error?.message,
    "Invalid filter format (expected key=value): published",
  );
});
