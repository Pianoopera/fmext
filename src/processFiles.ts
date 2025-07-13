import { parseFile } from "./parser.ts";

export interface ProcessFileOptions {
  key?: string | undefined;
  value?: string | undefined;
}

export interface ProcessFileResult {
  hasError: boolean;
  errorMessage?: string;
  frontMatter: Record<string, unknown> | null;
}

export async function processFile(
  file: string,
  options: ProcessFileOptions,
): Promise<ProcessFileResult | null> {
  try {
    const parseOptions: { key?: string; value?: string } = {};
    if (options.key !== undefined) {
      parseOptions.key = options.key;
    }
    if (options.value !== undefined) {
      parseOptions.value = options.value;
    }

    const result = await parseFile(file);

    if (result.hasError && result.errorMessage) {
      return {
        hasError: true,
        errorMessage: result.errorMessage,
        frontMatter: null,
      };
    }

    if (result.frontMatter === null) {
      return {
        hasError: true,
        errorMessage: "No front matter found",
        frontMatter: null,
      };
    }

    return { hasError: false, frontMatter: result.frontMatter };
  } catch (error) {
    console.error(`${file}: ${error}`);
    return { hasError: true, errorMessage: String(error), frontMatter: null };
  }
}
