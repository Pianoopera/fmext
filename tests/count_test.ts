import { assertEquals } from "jsr:@std/assert";
import { aggregateCounts, countValues } from "../src/parser.ts";

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
});

Deno.test("countValues - specific key extraction for string", () => {
  const data = {
    title: "Test Document",
    tags: ["react", "typescript"],
    author: "John Doe",
  };

  const result = countValues(data, "author");

  assertEquals(result.arrays["John Doe"], 1);
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

  // Array elements
  assertEquals(result[0]["react"], 2);
  assertEquals(result[0]["typescript"], 2);
  assertEquals(result[0]["vue"], 1);
  assertEquals(result[0]["javascript"], 1);
});

Deno.test("aggregateCounts - empty arrays", () => {
  const result = aggregateCounts([]);

  assertEquals(Object.keys(result).length, 0);
});

Deno.test("countValues - duplicate array elements", () => {
  const data = {
    tags: ["react", "typescript", "react", "web", "typescript"],
  };

  const result = countValues(data);

  assertEquals(result.arrays["react"], 2);
  assertEquals(result.arrays["typescript"], 2);
  assertEquals(result.arrays["web"], 1);
});
