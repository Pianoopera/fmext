import { parse as parseYaml } from "@std/yaml";
import type {
  CountByType,
  FrontMatterResult,
  ParseOptions,
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
  options: ParseOptions = {},
): Promise<FrontMatterResult> {
  try {
    const content = await Deno.readTextFile(filePath);
    const result = parseFrontMatter(content);

    if (!result.success) {
      if (options.silent) {
        return {
          frontMatter: null,
          content: result.content,
          hasError: false,
        };
      }

      return {
        frontMatter: null,
        content: result.content,
        hasError: true,
        errorMessage: result.error,
      };
    }

    let _outputData: unknown = result.data;

    if (options.key && result.data !== null) {
      _outputData = extractKeyValue(result.data, options.key);
    }

    return {
      frontMatter: result.data,
      content: result.content,
      hasError: false,
    };
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
    strings: {},
    arrays: {},
  };

  function processValue(value: unknown) {
    if (typeof value === "string") {
      result.strings[value] = (result.strings[value] || 0) + 1;
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
      result.strings[valueStr] = (result.strings[valueStr] || 0) + 1;
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

export function aggregateCounts(counts: CountByType[]): CountByType {
  const result: CountByType = {
    strings: {},
    arrays: {},
  };

  for (const count of counts) {
    for (const [key, value] of Object.entries(count.strings)) {
      result.strings[key] = (result.strings[key] || 0) + value;
    }
    for (const [key, value] of Object.entries(count.arrays)) {
      result.arrays[key] = (result.arrays[key] || 0) + value;
    }
  }

  return result;
}

export function formatCounts(counts: CountByType): string {
  const lines: string[] = [];

  if (Object.keys(counts.strings).length > 0) {
    lines.push("String values:");
    for (const [key, count] of Object.entries(counts.strings).sort()) {
      lines.push(`  ${key}: ${count}`);
    }
  }

  if (Object.keys(counts.arrays).length > 0) {
    lines.push("Array elements:");
    for (const [key, count] of Object.entries(counts.arrays).sort()) {
      lines.push(`  ${key}: ${count}`);
    }
  }

  return lines.join("\n");
}

export function formatOutput(value: unknown): string {
  if (value === undefined) {
    return "";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatOutput(item)).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}
