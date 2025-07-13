import { matchesValue } from "./matchesValue.ts";
import { extractKeyValue } from "./parser.ts";
import type { CLIArgs } from "./types.ts";

export function filterFrontMatter(
  frontMatter: Record<string, unknown>,
  args: CLIArgs,
) {
  const filterConditions: boolean[] = [];
  if (args.filters.length > 0) {
    for (const filter of args.filters) {
      const { key, value } = filter;
      if (key && value) {
        const extracted = extractKeyValue(frontMatter, key);
        if (matchesValue(extracted, value)) {
          filterConditions.push(true);
        } else {
          filterConditions.push(false);
        }
      }
    }
  }

  return filterConditions.includes(false) ? false : true;
}
