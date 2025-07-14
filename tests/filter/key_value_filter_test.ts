import { assertEquals } from "jsr:@std/assert@^1.0.13";
import { processFilesWithFrontMatter } from "../../src/processFilesWithFrontMatter.ts";

Deno.test("processFilesWithFrontMatter TEST", async (t) => {
  await t.step("CLI - filter by key and value (no match)", async () => {
    const sut = await processFilesWithFrontMatter(
      ["tests/fixtures/valid.md"],
      {
        key: "published",
        value: "false",
        filters: [],
        files: [],
      },
    );
    assertEquals(sut.length, 0);
  });
  await t.step("CLI - filter by key and value (match)", async () => {
    const sut = await processFilesWithFrontMatter(
      ["tests/fixtures/valid.md"],
      {
        key: "published",
        value: "true",
        filters: [],
        files: [],
      },
    );
    assertEquals(sut.length, 1);
    assertEquals(sut[0].file, "tests/fixtures/valid.md");
  });
});
