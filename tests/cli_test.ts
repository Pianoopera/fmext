import { assert, assertEquals } from "jsr:@std/assert";
import type { CLIResult } from "../src/types.ts";

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

function parsedOutput(output: string): {
  file: string;
  output: { value: string }[];
}[] {
  return JSON.parse(output.trim());
}

function parsedOutputWithCount(output: string): {
  file: string;
  output: { key: string; value: number }[];
} {
  return JSON.parse(output.trim());
}

function targetKeyValue(
  parsed: CLIResult,
  key: string,
): { key: string; value: number }[] {
  if (!parsed.output || !Array.isArray(parsed.output)) {
    return [];
  }
  return parsed.output.filter((o) => o.key === key);
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

  assertEquals(result.code, 0);
  assert(result.stdout.trim() === "[]");
});

Deno.test("CLI - parse invalid YAML", async () => {
  const result = await runCLI(["tests/fixtures/invalid-yaml.md"]);

  assertEquals(result.code, 0);
  assert(result.stdout.trim() === "[]");
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

  assertEquals(result.code, 0);
  assert(result.stdout.trim() === "[]");
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

  assertEquals(result.code, 0);
  assert(result.stdout.trim() === "[]");
});

// Tests for --value functionality
Deno.test("CLI - value option tests", async (t) => {
  await t.step("CLI - value option requires key", async () => {
    const result = await runCLI(["--value", "test", "tests/fixtures/valid.md"]);

    assertEquals(result.code, 1);
    assert(result.stderr.includes("--value requires --key to be specified"));
  });

  await t.step("CLI - filter by string value (exact match)", async () => {
    const result = await runCLI([
      "--key",
      "title",
      "--value",
      "Test Document",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output[0].file, "tests/fixtures/valid.md");
  });

  await t.step("CLI - filter by string value (no match)", async () => {
    const result = await runCLI([
      "--key",
      "title",
      "--value",
      "Nonexistent Title",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.length, 0);
  });

  await t.step("CLI - filter by array value (contains)", async () => {
    const result = await runCLI([
      "--key",
      "tags",
      "--value",
      "yaml",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output[0].file, "tests/fixtures/valid.md");
    assert(output[0].output.map((o) => o.value === "yaml"));
  });

  await t.step("CLI - filter by array value (not contains)", async () => {
    const result = await runCLI([
      "--key",
      "tags",
      "--value",
      "nonexistent",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.length, 0);
  });

  await t.step("CLI - filter by boolean value", async () => {
    const result = await runCLI([
      "--key",
      "published",
      "--value",
      "true",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output[0].file, "tests/fixtures/valid.md");
    assertEquals(output[0].output[0].value, "true");
  });

  await t.step("CLI - filter by boolean value (no match)", async () => {
    const result = await runCLI([
      "--key",
      "published",
      "--value",
      "false",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.length, 0);
  });

  await t.step("CLI - filter by number value", async () => {
    const result = await runCLI([
      "--key",
      "count",
      "--value",
      "42",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output[0].file, "tests/fixtures/valid.md");
    assertEquals(output[0].output[0].value, "42");
  });

  await t.step("CLI - filter with multiple files", async () => {
    const result = await runCLI([
      "--key",
      "array_value",
      "--value",
      "item1",
      "tests/fixtures/valid.md",
      "tests/fixtures/types.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.length, 1);
    assertEquals(output[0].file, "tests/fixtures/types.md");
    assertEquals(output[0].output[0].value, "item1");
  });

  await t.step("CLI - filter with nonexistent key", async () => {
    const result = await runCLI([
      "--key",
      "nonexistent",
      "--value",
      "test",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.length, 0);
  });
});

Deno.test("CLI - count options", async (t) => {
  await t.step("CLI count - no files", async () => {
    const result = await runCLI(["--count"]);

    assertEquals(result.code, 0);
    assertEquals(result.stdout.trim(), "{}");
  });

  await t.step("CLI count - single file", async () => {
    const result = await runCLI(["--count", "tests/fixtures/count-test-1.md"]);

    assertEquals(result.code, 0);

    const parsed = parsedOutputWithCount(result.stdout);
    assert(parsed.output.length > 1);

    const reactCount = targetKeyValue(parsed, "react");
    assertEquals(reactCount[0].key, "react");
    assertEquals(reactCount[0].value, 1);
  });

  await t.step("CLI count - multiple files", async () => {
    const result = await runCLI([
      "--count",
      "tests/fixtures/count-test-1.md",
      "tests/fixtures/count-test-2.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = parsedOutputWithCount(result.stdout);
    assert(parsed.output.length > 1);

    const typescriptCount = targetKeyValue(parsed, "typescript");

    assertEquals(typescriptCount[0].key, "typescript");
    assertEquals(typescriptCount[0].value, 2);
  });

  await t.step("CLI count - with key and value", async () => {
    const result = await runCLI([
      "--count",
      "--key",
      "tags",
      "tests/fixtures/count-test-1.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = parsedOutputWithCount(result.stdout);
    assert(parsed.output.length > 1);
    const reactCount = targetKeyValue(parsed, "react");
    assertEquals(reactCount[0].key, "react");
    assertEquals(reactCount[0].value, 1);
  });
});

Deno.test("CLI filter options", async (t) => {
  await t.step("CLI - filter by key and value (no match)", async () => {
    const result = await runCLI([
      "--filter",
      "published=false",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 0);
  });

  await t.step("CLI - filter by key and value (match)", async () => {
    const result = await runCLI([
      "--filter",
      "published=true",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 1);
    assertEquals(parsed[0].file, "tests/fixtures/valid.md");
  });

  await t.step(
    "CLI - filter by key and value with multiple files",
    async () => {
      const result = await runCLI([
        "--filter",
        "tags=react",
        "tests/fixtures/count-test-1.md",
        "tests/fixtures/count-test-2.md",
      ]);

      assertEquals(result.code, 0);
      const parsed = JSON.parse(result.stdout.trim());
      assert(parsed.length === 1);
      assertEquals(parsed[0].file, "tests/fixtures/count-test-1.md");
    },
  );

  await t.step("CLI - filter by key and value with no match", async () => {
    const result = await runCLI([
      "--filter",
      "tags=nonexistent",
      "tests/fixtures/count-test-1.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 0);
  });

  await t.step("CLI - filter by key and value with multiple keys", async () => {
    const result = await runCLI([
      "--filter",
      "tags=react",
      "--filter",
      "status=published",
      "tests/fixtures/count-test-1.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 1);
    assertEquals(parsed[0].file, "tests/fixtures/count-test-1.md");
  });

  await t.step(
    "CLI - filter by key and value with no match on second filter",
    async () => {
      const result = await runCLI([
        "--filter",
        "tags=react",
        "--filter",
        "published=false",
        "tests/fixtures/count-test-1.md",
      ]);

      assertEquals(result.code, 0);
      const parsed = JSON.parse(result.stdout.trim());
      assert(parsed.length === 0);
    },
  );
});

Deno.test("CLI All opeions", async (t) => {
  await t.step("CLI - all options combined without count", async () => {
    const result = await runCLI([
      "-k",
      "title",
      "-v",
      "Test Document",
      "-f",
      "published=true",
      "tests/fixtures/valid.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 1);
    assertEquals(parsed[0].file, "tests/fixtures/valid.md");
  });

  await t.step("CLI - all options combined with multiple files", async () => {
    const result = await runCLI([
      "-k",
      "tags",
      "-v",
      "react",
      "-f",
      "status=published",
      "tests/fixtures/count-test-1.md",
      "tests/fixtures/count-test-2.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(parsed.length === 1);
    assertEquals(parsed[0].file, "tests/fixtures/count-test-1.md");
  });

  await t.step("CLI - all options combined with count", async () => {
    const result = await runCLI([
      "--count",
      "-k",
      "tags",
      "-v",
      "react",
      "-f",
      "status=published",
      "tests/fixtures/count-test-1.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = parsedOutputWithCount(result.stdout);
    assert(parsed.output.length > 0);
    const reactCount = targetKeyValue(parsed, "react");
    assertEquals(reactCount[0].key, "react");
    assertEquals(reactCount[0].value, 1);
  });

  await t.step("CLI - all options combined with multiple files", async () => {
    const result = await runCLI([
      "--count",
      "-k",
      "tags",
      "-v",
      "react",
      "-f",
      "status=published",
      "tests/fixtures/count-test-1.md",
      "tests/fixtures/count-test-2.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = parsedOutputWithCount(result.stdout);
    assert(parsed.output.length > 0);
    const reactCount = targetKeyValue(parsed, "react");
    assertEquals(reactCount[0].key, "react");
    assertEquals(reactCount[0].value, 1);
  });

  await t.step("CLI - all options combined with no match", async () => {
    const result = await runCLI([
      "--count",
      "-k",
      "tags",
      "-v",
      "nonexistent",
      "-f",
      "status=published",
      "tests/fixtures/count-test-1.md",
    ]);

    assertEquals(result.code, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert(Object.keys(parsed).length === 0);
  });
});
