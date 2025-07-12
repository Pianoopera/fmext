import { assert, assertEquals } from "jsr:@std/assert";

async function runCLI(
  args: string[],
): Promise<{ stdout: string; stderr: string; code: number }> {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", "./mod.ts", ...args],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await cmd.output();

  return {
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
    code,
  };
}

Deno.test("CLI - help option", async () => {
  const result = await runCLI(["--help"]);

  assertEquals(result.code, 0);
  assert(result.stdout.includes("Description:"));
  assert(result.stdout.includes("Options:"));
  assert(result.stdout.includes("Commands:"));
});

Deno.test("CLI - help option short form", async () => {
  const result = await runCLI(["-h"]);

  assertEquals(result.code, 0);
  assert(result.stdout.includes("Description:"));
  assert(result.stdout.includes("Options:"));
  assert(result.stdout.includes("Commands:"));
});

Deno.test("CLI - version subcommand", async () => {
  const result = await runCLI(["version"]);

  assertEquals(result.code, 0);
  assert(result.stdout.trim().startsWith("v"));
});

Deno.test("CLI - no arguments", async () => {
  const result = await runCLI([]);

  assertEquals(result.code, 0);
});

Deno.test("CLI - parse valid file", async () => {
  const result = await runCLI(["tests/fixtures/valid.md"]);

  assertEquals(result.code, 0);
  assert(result.stdout.includes("Test Document"));
  assert(result.stdout.includes("Test Author"));
});

Deno.test("CLI - parse file with specific key", async () => {
  const result = await runCLI(["--key", "title", "tests/fixtures/valid.md"]);

  assertEquals(result.code, 0);
  assert(result.stdout.includes("Test Document"));
  assert(!result.stdout.includes("Test Author"));
});

Deno.test("CLI - parse file with nested key", async () => {
  const result = await runCLI([
    "--key",
    "metadata.nested.value",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assert(result.stdout.includes("deep value"));
});

Deno.test("CLI - parse file without front matter", async () => {
  const result = await runCLI(["tests/fixtures/no-frontmatter.md"]);

  assertEquals(result.code, 1);
  assert(result.stderr.includes("No front matter found"));
});

Deno.test("CLI - parse file without front matter (silent)", async () => {
  const result = await runCLI(["--silent", "tests/fixtures/no-frontmatter.md"]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "[]");
});

Deno.test("CLI - parse invalid YAML", async () => {
  const result = await runCLI(["tests/fixtures/invalid-yaml.md"]);

  assertEquals(result.code, 1);
  assert(result.stderr.includes("YAML parse error"));
});

Deno.test("CLI - parse invalid YAML (silent)", async () => {
  const result = await runCLI(["--silent", "tests/fixtures/invalid-yaml.md"]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "[]");
});

Deno.test("CLI - parse multiple files", async () => {
  const result = await runCLI([
    "tests/fixtures/valid.md",
    "tests/fixtures/types.md",
  ]);

  assertEquals(result.code, 0);
  const persed = JSON.parse(result.stdout.trim());
  assert(persed.length === 2);
  assert(persed[0].output.title === "Test Document");
  assert(persed[1].output.string_value === "Hello World");
});

Deno.test("CLI - nonexistent file", async () => {
  const result = await runCLI(["nonexistent.md"]);

  assertEquals(result.code, 1);
  assert(result.stderr.includes("Failed to read file"));
});

Deno.test("CLI - unknown option", async () => {
  const result = await runCLI(["--unknown"]);

  assertEquals(result.code, 1);
  assert(result.stderr.includes("Unknown option"));
});

Deno.test("CLI - extract nonexistent key", async () => {
  const result = await runCLI([
    "--key",
    "nonexistent",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 1);
  assert(result.stderr.includes("Key 'nonexistent' not found"));
});

Deno.test("CLI - extract nonexistent key (silent)", async () => {
  const result = await runCLI([
    "--silent",
    "--key",
    "nonexistent",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "[]");
});

// Tests for --value functionality
Deno.test("CLI - value option requires key", async () => {
  const result = await runCLI(["--value", "test", "tests/fixtures/valid.md"]);

  assertEquals(result.code, 1);
  assert(result.stderr.includes("--value requires --key to be specified"));
});

Deno.test("CLI - filter by string value (exact match)", async () => {
  const result = await runCLI([
    "--key",
    "title",
    "--value",
    "Test Document",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "tests/fixtures/valid.md");
});

Deno.test("CLI - filter by string value (no match)", async () => {
  const result = await runCLI([
    "--key",
    "title",
    "--value",
    "Nonexistent Title",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "");
});

Deno.test("CLI - filter by array value (contains)", async () => {
  const result = await runCLI([
    "--key",
    "tags",
    "--value",
    "yaml",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "tests/fixtures/valid.md");
});

Deno.test("CLI - filter by array value (not contains)", async () => {
  const result = await runCLI([
    "--key",
    "tags",
    "--value",
    "nonexistent",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "");
});

Deno.test("CLI - filter by boolean value", async () => {
  const result = await runCLI([
    "--key",
    "published",
    "--value",
    "true",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "tests/fixtures/valid.md");
});

Deno.test("CLI - filter by boolean value (no match)", async () => {
  const result = await runCLI([
    "--key",
    "published",
    "--value",
    "false",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "");
});

Deno.test("CLI - filter by number value", async () => {
  const result = await runCLI([
    "--key",
    "count",
    "--value",
    "42",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "tests/fixtures/valid.md");
});

Deno.test("CLI - filter with multiple files", async () => {
  const result = await runCLI([
    "--key",
    "array_value",
    "--value",
    "item1",
    "-s",
    "tests/fixtures/valid.md",
    "tests/fixtures/types.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "tests/fixtures/types.md");
});

Deno.test("CLI - filter with nonexistent key", async () => {
  const result = await runCLI([
    "--key",
    "nonexistent",
    "--value",
    "test",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
});

Deno.test("CLI - filter with nonexistent key (silent)", async () => {
  const result = await runCLI([
    "--silent",
    "--key",
    "nonexistent",
    "--value",
    "test",
    "tests/fixtures/valid.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "");
});

Deno.test("CLI - filter with key value option", async () => {
  const result = await runCLI([
    "--filter",
    "published=true",
    "--key",
    "topics",
    "--value",
    "rust",
    "--silent",
    "tests/fixtures/valid.md",
    "tests/fixtures/types.md",
  ]);

  assertEquals(result.code, 0);
  assertEquals(result.stdout.trim(), "tests/fixtures/types.md");
});

Deno.test("CLI - count options", async (t) => {
  await t.step("CLI count - no files", async () => {
    const result = await runCLI(["--count"]);

    assertEquals(result.code, 0);
    assertEquals(result.stdout.trim(), "");
  });

  await t.step("CLI count - single file", async () => {
    const result = await runCLI(["--count", "tests/fixtures/count-test-1.md"]);

    assertEquals(result.code, 0);

    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 1);
    assertEquals(parsed[0].react, 1);
  });

  await t.step("CLI count - multiple files", async () => {
    const result = await runCLI([
      "--count",
      "tests/fixtures/count-test-1.md",
      "tests/fixtures/count-test-2.md",
    ]);

    assertEquals(result.code, 0);
    const stdout = result.stdout.trim();
    const parsed = JSON.parse(stdout);
    assertEquals(parsed[0].typescript, 2);
  });

  await t.step("CLI count - with key and value", async () => {
    const result = await runCLI([
      "--count",
      "--key",
      "tags",
      "tests/fixtures/count-test-1.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 1);
    assertEquals(parsed[0].typescript, 1);
  });
});
