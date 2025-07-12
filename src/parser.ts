import { parse as parseYaml } from "@std/yaml";
import type {
  CountByType,
  CountResult,
  FrontMatterResult,
  ParseResult,
} from "./types.ts";

const FRONT_MATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

export function parseFrontMatter(content: string): ParseResult {
  const match = content.match(FRONT_MATTER_REGEX);

  if (!match) {
    return {
      success: false,
      error: "No front matter found",
      content: content,
    };
  }

  const yamlContent = match[1];
  const remainingContent = content.slice(match[0].length);

  try {
    const data = parseYaml(yamlContent);

    // Allow null for empty front matter, but require object for non-empty content
    if (data !== null && typeof data !== "object") {
      return {
        success: false,
        error: "Invalid YAML front matter - must be an object",
        content: remainingContent,
      };
    }

    return {
      success: true,
      data: data as Record<string, unknown> | null,
      content: remainingContent,
    };
  } catch (error) {
    return {
      success: false,
      error: `YAML parse error: ${error}`,
      content: remainingContent,
    };
  }
}

export function extractKeyValue(
  data: Record<string, unknown>,
  key: string,
): unknown {
  if (!key) return data;

  const keys = key.split(".");
  let current: unknown = data;

  for (const k of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[k];
  }

  return current;
}

export async function parseFile(
  filePath: string,
): Promise<FrontMatterResult> {
  try {
    const content = await Deno.readTextFile(filePath);
    const result = parseFrontMatter(content);

    if (!result.success) {
      return {
        frontMatter: null,
        content: result.content,
        hasError: true,
        errorMessage: result.error,
      };
    }

    const data = {
      frontMatter: result.data,
      content: result.content,
      hasError: false,
    };

    return data;
  } catch (error) {
    return {
      frontMatter: null,
      content: "",
      hasError: true,
      errorMessage: `Failed to read file: ${error}`,
    };
  }
}

export function countValues(
  data: Record<string, unknown>,
  targetKey?: string,
): CountByType {
  const result: CountByType = {
    arrays: {},
  };

  function processValue(value: unknown) {
    if (typeof value === "string") {
      result.arrays[value] = (result.arrays[value] || 0) + 1;
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          result.arrays[item] = (result.arrays[item] || 0) + 1;
        } else if (typeof item === "number" || typeof item === "boolean") {
          const itemStr = String(item);
          result.arrays[itemStr] = (result.arrays[itemStr] || 0) + 1;
        }
      }
    } else if (typeof value === "number" || typeof value === "boolean") {
      const valueStr = String(value);
      result.arrays[valueStr] = (result.arrays[valueStr] || 0) + 1;
    }
  }

  if (targetKey) {
    const value = extractKeyValue(data, targetKey);
    if (value !== undefined) {
      processValue(value);
    }
  } else {
    for (const [_key, value] of Object.entries(data)) {
      processValue(value);
    }
  }

  return result;
}

export function aggregateCounts(counts: CountByType[]): CountResult[] {
  const results: CountResult = {};
  for (const count of counts) {
    for (const [key, value] of Object.entries(count.arrays)) {
      results[key] = (results[key] || 0) + value;
    }
  }
  if (Object.keys(results).length === 0) {
    return [];
  }
  return [results];
}

export function formatCountsWithFormat(counts: CountByType): object {
  return counts;
}

export function formatOutputWithFormat<T>(
  value: T,
  file: string,
): { file: string; output: T } {
  return {
    file,
    output: value,
  };
}
