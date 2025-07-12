import { assert, assertEquals, assertObjectMatch } from "jsr:@std/assert";
import {
  extractKeyValue,
  formatOutputWithFormat,
  parseFile,
  parseFrontMatter,
} from "../src/parser.ts";

Deno.test("parseFrontMatter - valid YAML", () => {
  const content = `---
title: Test Title
author: Test Author
---
# Content`;

  const result = parseFrontMatter(content);

  assert(result.success);
  if (result.success && result.data) {
    assertEquals(result.data.title, "Test Title");
    assertEquals(result.data.author, "Test Author");
    assertEquals(result.content, "# Content");
  }
});

Deno.test("parseFrontMatter - no front matter", () => {
  const content = "# Just markdown content";

  const result = parseFrontMatter(content);

  assert(!result.success);
  assertEquals(result.error, "No front matter found");
  assertEquals(result.content, "# Just markdown content");
});

Deno.test("parseFrontMatter - invalid YAML", () => {
  const content = `---
title: Test
invalid: [unclosed
---
# Content`;

  const result = parseFrontMatter(content);

  assert(!result.success);
  assert(result.error.includes("YAML parse error"));
});

Deno.test("parseFrontMatter - empty front matter", () => {
  const content = `---
---
# Content`;

  const result = parseFrontMatter(content);

  assert(!result.success);
  assertEquals(result.error, "No front matter found");
});

Deno.test("parseFrontMatter - complex nested data", () => {
  const content = `---
metadata:
  author: John Doe
  settings:
    theme: dark
    version: 1.2
tags:
  - test
  - yaml
published: true
---
# Content`;

  const result = parseFrontMatter(content);

  assert(result.success);
  if (result.success && result.data) {
    assertObjectMatch(result.data, {
      metadata: {
        author: "John Doe",
        settings: {
          theme: "dark",
          version: 1.2,
        },
      },
      tags: ["test", "yaml"],
      published: true,
    });
  }
});

Deno.test("extractKeyValue - simple key", () => {
  const data = { title: "Test Title", author: "Test Author" };

  assertEquals(extractKeyValue(data, "title"), "Test Title");
  assertEquals(extractKeyValue(data, "author"), "Test Author");
  assertEquals(extractKeyValue(data, "nonexistent"), undefined);
});

Deno.test("extractKeyValue - nested key", () => {
  const data = {
    metadata: {
      author: "John Doe",
      settings: {
        theme: "dark",
        version: 1.2,
      },
    },
  };

  assertEquals(extractKeyValue(data, "metadata.author"), "John Doe");
  assertEquals(extractKeyValue(data, "metadata.settings.theme"), "dark");
  assertEquals(extractKeyValue(data, "metadata.settings.version"), 1.2);
  assertEquals(extractKeyValue(data, "metadata.nonexistent"), undefined);
  assertEquals(extractKeyValue(data, "nonexistent.key"), undefined);
});

Deno.test("extractKeyValue - empty key returns full data", () => {
  const data = { title: "Test", author: "Author" };

  assertEquals(extractKeyValue(data, ""), data);
});

Deno.test("parseFile - valid file", async () => {
  const result = await parseFile("tests/fixtures/valid.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);
  assertEquals(result.frontMatter!.title, "Test Document");
  assertEquals(result.frontMatter!.author, "Test Author");
  assert(result.content.includes("# Test Document"));
});

Deno.test("parseFile - file without front matter", async () => {
  const result = await parseFile("tests/fixtures/no-frontmatter.md");

  assertEquals(result.hasError, true);
  assertEquals(result.frontMatter, null);
  assertEquals(result.errorMessage, "No front matter found");
});

Deno.test("parseFile - invalid YAML", async () => {
  const result = await parseFile("tests/fixtures/invalid-yaml.md");

  assertEquals(result.hasError, true);
  assertEquals(result.frontMatter, null);
  assert(result.errorMessage!.includes("YAML parse error"));
});

Deno.test("parseFile - nonexistent file", async () => {
  const result = await parseFile("tests/fixtures/nonexistent.md");

  assertEquals(result.hasError, true);
  assertEquals(result.frontMatter, null);
  assert(result.errorMessage!.includes("Failed to read file"));
});

Deno.test("parseFile with key extraction", async () => {
  const result = await parseFile("tests/fixtures/valid.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);
  assertEquals(result.frontMatter!.title, "Test Document");
});

Deno.test("parseFile with nested key extraction", async () => {
  const result = await parseFile("tests/fixtures/valid.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);
});

Deno.test("formatOutputWithFormat", async (t) => {
  await t.step("json output", () => {
    const result = formatOutputWithFormat<{
      metadata: {
        author: string;
        settings: { theme: string; version: number };
      };
      tags: string[];
      published: boolean;
    }>({
      metadata: {
        author: "John Doe",
        settings: {
          theme: "dark",
          version: 1.2,
        },
      },
      tags: ["test", "yaml"],
      published: true,
    }, "tests/fixtures/valid.md");

    assertEquals(result.output.metadata.author, "John Doe");
    assertEquals(result.output.metadata.settings.theme, "dark");
  });
});
