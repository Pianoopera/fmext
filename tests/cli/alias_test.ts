import { assert } from "jsr:@std/assert/assert";
import { assertEquals } from "jsr:@std/assert/equals";
import { runCLI } from "./cli_test.ts";

Deno.test("CLI - alias subcommand", async (t) => {
  await t.step("CLI - alias subcommand with no arguments", async () => {
    const result = await runCLI(["alias"]);

    assertEquals(result.code, 0);
    assert(result.stdout.includes("Description:"));
    assert(result.stdout.includes("Options:"));
  });

  await t.step("CLI - alias subcommand with help option", async () => {
    const result = await runCLI(["alias", "--help"]);

    assertEquals(result.code, 0);

    assert(result.stdout.includes("fmext alias"));
    assert(result.stdout.includes("Description:"));
    assert(result.stdout.includes("Options:"));
  });
});
