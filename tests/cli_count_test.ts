import { assert, assertEquals } from "jsr:@std/assert";
import { parseFile } from "../src/parser.ts";
import { aggregateCounts, countValues } from "../src/parser.ts";

Deno.test("CLI count - single file with mixed data", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter);

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
  assertEquals(aggregated[0]["John Doe"], 2);
  assertEquals(aggregated[0]["published"], 2);

  // Array elements that appear multiple times
  assertEquals(aggregated[0]["typescript"], 2);
  assertEquals(aggregated[0]["web"], 3);
  assertEquals(aggregated[0]["javascript"], 2);
  assertEquals(aggregated[0]["programming"], 3);
  assertEquals(aggregated[0]["frontend"], 2);

  // Values that appear once
  assertEquals(aggregated[0]["Jane Smith"], 1);
  assertEquals(aggregated[0]["draft"], 1);
  assertEquals(aggregated[0]["react"], 1);
  assertEquals(aggregated[0]["vue"], 1);
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
});

Deno.test("CLI count - string key extraction", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter, "author");

  // No array elements since we only looked at author
  assertEquals(Object.keys(counts.arrays).length, 1);
});

Deno.test("CLI count - nonexistent key", async () => {
  const result = await parseFile("tests/fixtures/count-test-1.md");

  assertEquals(result.hasError, false);
  assert(result.frontMatter !== null);

  const counts = countValues(result.frontMatter, "nonexistent");

  // No values should be found
  assertEquals(Object.keys(counts.arrays).length, 0);
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

  assertEquals(aggregated[0]["react"], 2);
  assertEquals(aggregated[0]["ai"], 1);
});
