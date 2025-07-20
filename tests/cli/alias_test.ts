import { assert } from "jsr:@std/assert/assert";
import { assertEquals } from "jsr:@std/assert/equals";
import { deleteAllAliases, runCLI } from "./cli_test.ts";
import type {
  Aliases,
  DeleteAlias,
  DeleteAllAliases,
} from "../../src/types.ts";

function parsedOutput(output: string): {
  aliasName: string;
  options: string;
  runCommand: string;
} {
  return JSON.parse(output.trim());
}

function parsedOutputToList(output: string): Aliases[] {
  return JSON.parse(output.trim());
}

function deleteAliasOutput(output: string): DeleteAlias {
  return JSON.parse(output.trim());
}

function deleteAllAliasesOutput(output: string): DeleteAllAliases {
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
    assertEquals(output.runCommand, "-k tags");
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

  await t.step(
    "CLI - alias subcommand set with invalid option value",
    async () => {
      const result = await runCLI([
        "alias",
        "-s",
        "keyTags",
        "-k:tags,-x:invalid",
      ]);

      assertEquals(result.code, 0);
      assert(result.stdout.includes("fmext alias"));
      assert(result.stdout.includes("Description:"));
      assert(result.stdout.includes("Options:"));
    },
  );

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
    assertEquals(output.runCommand, "-k tags -v react");
  });
});

Deno.test("CLI - alias subcommand list", async (t) => {
  await t.step("CLI - alias subcommand list with no aliases", async () => {
    await deleteAllAliases();
    const result = await runCLI(["alias", "-l"]);

    assertEquals(result.code, 0);
    const output = parsedOutputToList(result.stdout);
    assertEquals(output, []);
  });

  await t.step(
    "CLI - alias subcommand list with existing aliases",
    async () => {
      // First, set an alias
      await deleteAllAliases();
      await runCLI(["alias", "-s", "keyTags", "-k:tags"]);

      const result = await runCLI(["alias", "-l"]);

      assertEquals(result.code, 0);
      const output = parsedOutputToList(result.stdout);
      assertEquals(output.length, 1);
      assertEquals(output[0].aliasName, "keyTags");
      assertEquals(output[0].options, "-k:tags");
      assertEquals(output[0].runCommand, "-k tags");
    },
  );

  await t.step(
    "CLI - alias subcommand list with multiple aliases",
    async () => {
      await deleteAllAliases();
      await runCLI(["alias", "-s", "keyTags", "-k:tags"]);
      await runCLI(["alias", "-s", "keyValue", "-v:react"]);

      const result = await runCLI(["alias", "-l"]);

      assertEquals(result.code, 0);
      const output = parsedOutputToList(result.stdout);
      assertEquals(output.length, 2);
      assertEquals(output[0].aliasName, "keyTags");
      assertEquals(output[0].options, "-k:tags");
      assertEquals(output[0].runCommand, "-k tags");
      assertEquals(output[1].aliasName, "keyValue");
      assertEquals(output[1].options, "-v:react");
      assertEquals(output[1].runCommand, "-v react");
    },
  );

  await t.step(
    "CLI - alias subcommand list with multiple option alias",
    async () => {
      await deleteAllAliases();
      await runCLI(["alias", "-s", "keyTags", "-k:tags,-v:react"]);

      const result = await runCLI(["alias", "-l"]);

      assertEquals(result.code, 0);
      const output = parsedOutputToList(result.stdout);
      assertEquals(output.length, 1);
      assertEquals(output[0].aliasName, "keyTags");
      assertEquals(output[0].options, "-k:tags,-v:react");
      assertEquals(output[0].runCommand, "-k tags -v react");
    },
  );
});

Deno.test("CLI - alias subcommand remove options", async (t) => {
  await t.step(
    "CLI - alias subcommand remove with existing alias",
    async () => {
      await deleteAllAliases();
      await runCLI(["alias", "-s", "keyTags", "-k:tags"]);

      const result = await runCLI(["alias", "-r", "keyTags"]);

      assertEquals(result.code, 0);
      const output = deleteAliasOutput(result.stdout);
      assertEquals(output.aliasName, "keyTags");
      assert(output.success);
    },
  );
  await t.step(
    "CLI - alias subcommand remove with non-existing alias",
    async () => {
      const result = await runCLI(["alias", "--remove", "nonExistingAlias"]);

      assertEquals(result.code, 0);
      const output = deleteAliasOutput(result.stdout);
      assertEquals(output.aliasName, "nonExistingAlias");
      assert(!output.success);
    },
  );
});

Deno.test("CLI - alias subcommand remove-all options", async (t) => {
  await t.step(
    "CLI - alias subcommand remove-all with existing aliases",
    async () => {
      await deleteAllAliases();
      await runCLI(["alias", "--set", "keyTags", "-k:tags"]);
      await runCLI(["alias", "--set", "keyValue", "-v:react"]);

      const result = await runCLI(["alias", "--remove-all"]);

      assertEquals(result.code, 0);
      const output = deleteAllAliasesOutput(result.stdout);
      assert(output.success);
    },
  );
});
