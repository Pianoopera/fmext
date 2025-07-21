// cleanup: delete all aliases after tests

import { deleteAllAliases } from "../src/aliasLogic.ts";

Deno.test("CLI cleanup", async () => {
  await deleteAllAliases();
});
