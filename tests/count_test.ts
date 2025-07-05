import { assert, assertEquals } from "jsr:@std/assert";
import { aggregateCounts, countValues, formatCounts } from "../src/parser.ts";

Deno.test("countValues - string values", () => {
  const data = {
    title: "Test Document",
    author: "John Doe",
    status: "published",
    count: 42,
    flag: true,
  };

  const result = countValues(data);

  assertEquals(result.strings["Test Document"], 1);
  assertEquals(result.strings["John Doe"], 1);
  assertEquals(result.strings["published"], 1);
  assertEquals(result.strings["42"], 1);
  assertEquals(result.strings["true"], 1);
  assertEquals(Object.keys(result.arrays).length, 0);
});

Deno.test("countValues - array values", () => {
  const data = {
    tags: ["react", "typescript", "web"],
    categories: ["programming", "tutorial"],
    numbers: [1, 2, 3],
    mixed: ["string", 42, true],
  };

  const result = countValues(data);

  assertEquals(result.arrays["react"], 1);
  assertEquals(result.arrays["typescript"], 1);
  assertEquals(result.arrays["web"], 1);
  assertEquals(result.arrays["programming"], 1);
  assertEquals(result.arrays["tutorial"], 1);
  assertEquals(result.arrays["1"], 1);
  assertEquals(result.arrays["2"], 1);
  assertEquals(result.arrays["3"], 1);
  assertEquals(result.arrays["string"], 1);
  assertEquals(result.arrays["42"], 1);
  assertEquals(result.arrays["true"], 1);
  assertEquals(Object.keys(result.strings).length, 0);
});

Deno.test("countValues - mixed string and array values", () => {
  const data = {
    title: "Test Document",
    tags: ["react", "typescript"],
    author: "John Doe",
    topics: ["web", "programming"],
    status: "published",
  };

  const result = countValues(data);

  // String values
  assertEquals(result.strings["Test Document"], 1);
  assertEquals(result.strings["John Doe"], 1);
  assertEquals(result.strings["published"], 1);

  // Array elements
  assertEquals(result.arrays["react"], 1);
  assertEquals(result.arrays["typescript"], 1);
  assertEquals(result.arrays["web"], 1);
  assertEquals(result.arrays["programming"], 1);
});

Deno.test("countValues - specific key extraction", () => {
  const data = {
    title: "Test Document",
    tags: ["react", "typescript", "web"],
    author: "John Doe",
  };

  const result = countValues(data, "tags");

  assertEquals(result.arrays["react"], 1);
  assertEquals(result.arrays["typescript"], 1);
  assertEquals(result.arrays["web"], 1);
  assertEquals(Object.keys(result.strings).length, 0);
});

Deno.test("countValues - specific key extraction for string", () => {
  const data = {
    title: "Test Document",
    tags: ["react", "typescript"],
    author: "John Doe",
  };

  const result = countValues(data, "author");

  assertEquals(result.strings["John Doe"], 1);
  assertEquals(Object.keys(result.arrays).length, 0);
});

Deno.test("countValues - nested key extraction", () => {
  const data = {
    metadata: {
      settings: {
        themes: ["dark", "light"],
      },
    },
  };

  const result = countValues(data, "metadata.settings.themes");

  assertEquals(result.arrays["dark"], 1);
  assertEquals(result.arrays["light"], 1);
  assertEquals(Object.keys(result.strings).length, 0);
});

Deno.test("aggregateCounts - multiple count results", () => {
  const counts1 = {
    strings: { "John Doe": 1, "published": 1 },
    arrays: { "react": 1, "typescript": 1 },
  };

  const counts2 = {
    strings: { "Jane Smith": 1, "published": 1 },
    arrays: { "react": 1, "vue": 1 },
  };

  const counts3 = {
    strings: { "John Doe": 1, "draft": 1 },
    arrays: { "typescript": 1, "javascript": 1 },
  };

  const result = aggregateCounts([counts1, counts2, counts3]);

  // String values
  assertEquals(result.strings["John Doe"], 2);
  assertEquals(result.strings["Jane Smith"], 1);
  assertEquals(result.strings["published"], 2);
  assertEquals(result.strings["draft"], 1);

  // Array elements
  assertEquals(result.arrays["react"], 2);
  assertEquals(result.arrays["typescript"], 2);
  assertEquals(result.arrays["vue"], 1);
  assertEquals(result.arrays["javascript"], 1);
});

Deno.test("aggregateCounts - empty arrays", () => {
  const result = aggregateCounts([]);

  assertEquals(Object.keys(result.strings).length, 0);
  assertEquals(Object.keys(result.arrays).length, 0);
});

Deno.test("formatCounts - both string and array values", () => {
  const counts = {
    strings: { "John Doe": 2, "published": 1 },
    arrays: { "react": 3, "typescript": 2 },
  };

  const result = formatCounts(counts);

  assert(result.includes("String values:"));
  assert(result.includes("John Doe: 2"));
  assert(result.includes("published: 1"));
  assert(result.includes("Array elements:"));
  assert(result.includes("react: 3"));
  assert(result.includes("typescript: 2"));
});

Deno.test("formatCounts - only string values", () => {
  const counts = {
    strings: { "John Doe": 1, "published": 1 },
    arrays: {},
  };

  const result = formatCounts(counts);

  assert(result.includes("String values:"));
  assert(result.includes("John Doe: 1"));
  assert(result.includes("published: 1"));
  assert(!result.includes("Array elements:"));
});

Deno.test("formatCounts - only array values", () => {
  const counts = {
    strings: {},
    arrays: { "react": 2, "typescript": 1 },
  };

  const result = formatCounts(counts);

  assert(!result.includes("String values:"));
  assert(result.includes("Array elements:"));
  assert(result.includes("react: 2"));
  assert(result.includes("typescript: 1"));
});

Deno.test("formatCounts - empty counts", () => {
  const counts = {
    strings: {},
    arrays: {},
  };

  const result = formatCounts(counts);

  assertEquals(result, "");
});

Deno.test("countValues - duplicate array elements", () => {
  const data = {
    tags: ["react", "typescript", "react", "web", "typescript"],
  };

  const result = countValues(data);

  assertEquals(result.arrays["react"], 2);
  assertEquals(result.arrays["typescript"], 2);
  assertEquals(result.arrays["web"], 1);
  assertEquals(Object.keys(result.strings).length, 0);
});
