import { assertEquals } from "jsr:@std/assert";

Deno.test("Sample Test", () => {
  const expected = "Hello, Deno!";
  const actual = "Hello, Deno!";

  if (expected !== actual) {
    throw new Error(`Expected "${expected}", but got "${actual}"`);
  }
  assertEquals(expected, actual);
});
