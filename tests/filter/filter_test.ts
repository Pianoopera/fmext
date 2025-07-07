import { assertEquals } from "jsr:@std/assert";
import { parseArgs } from "../../mod.ts";

Deno.test("parseArgs handles single --filter option", () => {
  const args = ["--filter", "published", "true", "file.md"];
  const result = parseArgs(args);

  assertEquals(result.filters.length, 1);
  assertEquals(result.filters[0].key, "published");
  assertEquals(result.filters[0].value, "true");
  assertEquals(result.files, ["file.md"]);
});

Deno.test("parseArgs handles multiple --filter options", () => {
  const args = [
    "--filter",
    "published",
    "true",
    "--filter",
    "type",
    "tech",
    "file1.md",
    "file2.md",
  ];
  const result = parseArgs(args);

  assertEquals(result.filters.length, 2);
  assertEquals(result.filters[0].key, "published");
  assertEquals(result.filters[0].value, "true");
  assertEquals(result.filters[1].key, "type");
  assertEquals(result.filters[1].value, "tech");
  assertEquals(result.files, ["file1.md", "file2.md"]);
});

Deno.test("parseArgs handles --filter with --count", () => {
  const args = [
    "--filter",
    "status",
    "draft",
    "--count",
    "--key",
    "topics",
    "*.md",
  ];
  const result = parseArgs(args);

  assertEquals(result.filters.length, 1);
  assertEquals(result.filters[0].key, "status");
  assertEquals(result.filters[0].value, "draft");
  assertEquals(result.count, true);
  assertEquals(result.key, "topics");
  assertEquals(result.files, ["*.md"]);
});

Deno.test("parseArgs throws error when --filter lacks arguments", () => {
  const args = ["--filter", "published"];
  let error: Error | null = null;

  try {
    parseArgs(args);
  } catch (e) {
    error = e as Error;
  }

  assertEquals(
    error?.message,
    "--filter requires both key and value arguments",
  );
});
