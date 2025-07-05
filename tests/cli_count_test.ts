import { assert, assertEquals } from "jsr:@std/assert";
import { parseFile } from "../src/parser.ts";
import { aggregateCounts, countValues, formatCounts } from "../src/parser.ts";

Deno.test("CLI count - single file with mixed data", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter);

  // String values
  assertEquals(counts.strings["React Tutorial"], 1);
  assertEquals(counts.strings["John Doe"], 1);
  assertEquals(counts.strings["published"], 1);
  assertEquals(counts.strings["intermediate"], 1);

  // Array elements
  assertEquals(counts.arrays["react"], 1);
  assertEquals(counts.arrays["typescript"], 1);
  assertEquals(counts.arrays["web"], 1);
  assertEquals(counts.arrays["tutorial"], 1);
  assertEquals(counts.arrays["programming"], 1);
  assertEquals(counts.arrays["frontend"], 1);
});

Deno.test("CLI count - multiple files aggregated", async () => {
  const files = [
    "tests/fixtures/count-test-1.md",
    "tests/fixtures/count-test-2.md",
    "tests/fixtures/count-test-3.md",
  ];

  const allCounts = [];

  for (const file of files) {
    const result = await parseFile(file);
    if (result.frontMatter !== null) {
      const counts = countValues(result.frontMatter);
      allCounts.push(counts);
    }
  }

  const aggregated = aggregateCounts(allCounts);

  // String values that appear multiple times
  assertEquals(aggregated.strings["John Doe"], 2);
  assertEquals(aggregated.strings["published"], 2);

  // Array elements that appear multiple times
  assertEquals(aggregated.arrays["typescript"], 2);
  assertEquals(aggregated.arrays["web"], 3);
  assertEquals(aggregated.arrays["javascript"], 2);
  assertEquals(aggregated.arrays["programming"], 3);
  assertEquals(aggregated.arrays["frontend"], 2);

  // Values that appear once
  assertEquals(aggregated.strings["Jane Smith"], 1);
  assertEquals(aggregated.strings["draft"], 1);
  assertEquals(aggregated.arrays["react"], 1);
  assertEquals(aggregated.arrays["vue"], 1);
});

Deno.test("CLI count - specific key extraction", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter, "tags");

  // Only array elements from tags
  assertEquals(counts.arrays["react"], 1);
  assertEquals(counts.arrays["typescript"], 1);
  assertEquals(counts.arrays["web"], 1);
  assertEquals(counts.arrays["tutorial"], 1);

  // No string values since we only looked at tags
  assertEquals(Object.keys(counts.strings).length, 0);
});

Deno.test("CLI count - string key extraction", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter, "author");

  // Only string value from author
  assertEquals(counts.strings["John Doe"], 1);

  // No array elements since we only looked at author
  assertEquals(Object.keys(counts.arrays).length, 0);
});

Deno.test("CLI count - nonexistent key", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter, "nonexistent");

  // No values should be found
  assertEquals(Object.keys(counts.strings).length, 0);
  assertEquals(Object.keys(counts.arrays).length, 0);
});

Deno.test("CLI count - format output", async () => {
  const files = [
    "tests/fixtures/count-test-1.md",
    "tests/fixtures/count-test-2.md",
  ];

  const allCounts = [];

  for (const file of files) {
    const result = await parseFile(file);
    if (result.frontMatter !== null) {
      const counts = countValues(result.frontMatter);
      allCounts.push(counts);
    }
  }

  const aggregated = aggregateCounts(allCounts);
  const formatted = formatCounts(aggregated);

  // Check that the format contains both sections
  assert(formatted.includes("String values:"));
  assert(formatted.includes("Array elements:"));

  // Check some specific counts
  assert(formatted.includes("John Doe: 1"));
  assert(formatted.includes("Jane Smith: 1"));
  assert(formatted.includes("published: 2"));
  assert(formatted.includes("typescript: 2"));
  assert(formatted.includes("web: 2"));
});

Deno.test("CLI count - array values other style", async () => {
  const files = [
    "tests/fixtures/count-test-1.md",
    "tests/fixtures/count-test-4.md",
  ];

  const allCounts = [];

  for (const file of files) {
    const result = await parseFile(file);
    if (result.frontMatter !== null) {
      const counts = countValues(result.frontMatter);
      allCounts.push(counts);
    }
  }

  const aggregated = aggregateCounts(allCounts);

  assertEquals(aggregated.arrays["react"], 2);
  assertEquals(aggregated.arrays["ai"], 1);
});
