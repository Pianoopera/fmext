import { assert } from "jsr:@std/assert/assert";
import { assertEquals } from "jsr:@std/assert/equals";
import { runCLI } from "./cli_test.ts";

function parsedOutput(output: string): {
  aliasName: string;
  options: string;
  runCommand: string;
} {
  return JSON.parse(output.trim());
}

Deno.test("CLI - alias subcommand help", async (t) => {
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

Deno.test("CLI - alias subcommand set", async (t) => {
  await t.step("CLI - alias subcommand set with valid alias", async () => {
    const result = await runCLI(["alias", "-s", "keyTags", "-k:tags"]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.aliasName, "keyTags");
    assertEquals(output.options, "-k:tags");
    assertEquals(output.runCommand, "fmext alias run keyTags");
  });
  await t.step("CLI - alias subcommand set with invalid alias", async () => {
    const result = await runCLI([
      "alias",
      "-s",
      "invalidAlias",
      "--unknownOption,value",
    ]);

    assertEquals(result.code, 0);
    assert(result.stdout.includes("fmext alias"));
    assert(result.stdout.includes("Description:"));
    assert(result.stdout.includes("Options:"));
  });

  await t.step("CLI - alias subcommand set with no arguments", async () => {
    const result = await runCLI(["alias", "-s"]);

    assertEquals(result.code, 2);
    assert(result.stdout.includes("fmext alias"));
    assert(result.stdout.includes("Description:"));
    assert(result.stdout.includes("Options:"));
  });

  await t.step("CLI - alias subcommand set with invalid option value", async () => {
    const result = await runCLI(["alias", "-s", "keyTags", "-k:tags,-x:invalid"]);

    assertEquals(result.code, 0);
    assert(result.stdout.includes("fmext alias"));
    assert(result.stdout.includes("Description:"));
    assert(result.stdout.includes("Options:"));
  });

  await t.step("CLI - alias subcommand set with multiple options", async () => {
    const result = await runCLI([
      "alias",
      "-s",
      "keyTags",
      "-k:tags,-v:react",
    ]);

    assertEquals(result.code, 0);
    const output = parsedOutput(result.stdout);
    assertEquals(output.aliasName, "keyTags");
    assertEquals(output.options, "-k:tags,-v:react");
    assertEquals(output.runCommand, "fmext alias run keyTags");
  });
});
