import { assertEquals } from "jsr:@std/assert";
import { parseFile } from "../../src/parser.ts";
import { extractKeyValue } from "../../src/parser.ts";

// Helper function to match values (same logic as in mod.ts)
function matchesValue(extractedValue: unknown, targetValue: string): boolean {
  if (extractedValue === undefined || extractedValue === null) {
    return false;
  }

  // Handle array values - check if the target value is contained in the array
  if (Array.isArray(extractedValue)) {
    return extractedValue.some((item) => {
      if (typeof item === "string") {
        return item === targetValue;
      } else if (typeof item === "number" || typeof item === "boolean") {
        return item.toString() === targetValue;
      }
      return false;
    });
  }

  // Handle string values - exact match comparison
  if (typeof extractedValue === "string") {
    return extractedValue === targetValue;
  }

  // Handle boolean/number values - convert to string for comparison
  if (
    typeof extractedValue === "boolean" ||
    typeof extractedValue === "number"
  ) {
    return extractedValue.toString() === targetValue;
  }

  return false;
}

Deno.test("matchesValue handles string exact match", () => {
  assertEquals(matchesValue("react", "react"), true);
  assertEquals(matchesValue("react", "vue"), false);
  assertEquals(matchesValue("React", "react"), false); // case sensitive
});

Deno.test("matchesValue handles array contains", () => {
  assertEquals(matchesValue(["react", "typescript"], "react"), true);
  assertEquals(matchesValue(["react", "typescript"], "vue"), false);
  assertEquals(matchesValue(["javascript", "web"], "javascript"), true);
});

Deno.test("matchesValue handles boolean values", () => {
  assertEquals(matchesValue(true, "true"), true);
  assertEquals(matchesValue(false, "false"), true);
  assertEquals(matchesValue(true, "false"), false);
});

Deno.test("matchesValue handles number values", () => {
  assertEquals(matchesValue(42, "42"), true);
  assertEquals(matchesValue(3.14, "3.14"), true);
  assertEquals(matchesValue(42, "43"), false);
});

Deno.test("matchesValue handles null/undefined", () => {
  assertEquals(matchesValue(null, "null"), false);
  assertEquals(matchesValue(undefined, "undefined"), false);
  assertEquals(matchesValue(undefined, ""), false);
});

Deno.test("filter integration - single filter", async () => {
  const testFile = "tests/filter/react-tutorial.md";
  const result = await parseFile(testFile);

  if (result.frontMatter) {
    // Test filtering by published: true
    const publishedValue = extractKeyValue(result.frontMatter, "published");
    assertEquals(matchesValue(publishedValue, "true"), true);

    // Test filtering by type: tech
    const typeValue = extractKeyValue(result.frontMatter, "type");
    assertEquals(matchesValue(typeValue, "tech"), true);

    // Test filtering by array value
    const topicsValue = extractKeyValue(result.frontMatter, "topics");
    assertEquals(matchesValue(topicsValue, "react"), true);
    assertEquals(matchesValue(topicsValue, "typescript"), true);
    assertEquals(matchesValue(topicsValue, "vue"), false);
  }
});

Deno.test("filter integration - multiple conditions", async () => {
  const files = [
    "tests/filter/react-tutorial.md",
    "tests/filter/vue-guide.md",
    "tests/filter/personal-blog.md",
    "tests/filter/draft-article.md",
  ];

  const matchingFiles: string[] = [];

  // Filter: published: true AND type: tech
  for (const file of files) {
    const result = await parseFile(file);
    if (result.frontMatter) {
      const publishedValue = extractKeyValue(result.frontMatter, "published");
      const typeValue = extractKeyValue(result.frontMatter, "type");

      if (
        matchesValue(publishedValue, "true") && matchesValue(typeValue, "tech")
      ) {
        matchingFiles.push(file);
      }
    }
  }

  // Only react-tutorial.md should match both conditions
  assertEquals(matchingFiles.length, 1);
  assertEquals(matchingFiles[0], "tests/filter/react-tutorial.md");
});
