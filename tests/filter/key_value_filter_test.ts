import { assert, assertEquals } from "jsr:@std/assert@^1.0.13";
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
    assertEquals(sut.results.length, 0);
    assert(!sut.hasErrors);
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
    const { results } = sut;
    assertEquals(results.length, 1);
    assert(!sut.hasErrors);
    assertEquals(
      (results[0] as { file: string })["file"],
      "tests/fixtures/valid.md",
    );
  });
});
