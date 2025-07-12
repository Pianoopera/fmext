import { parseFile } from "./parser.ts";

export interface ProcessFileOptions {
  key?: string | undefined;
  value?: string | undefined;
  silent?: boolean | undefined;
}

export interface ProcessFileResult {
  hasError: boolean;
  errorMessage?: string;
  frontMatter: unknown;
}

export async function processFile(
  file: string,
  options: ProcessFileOptions,
): Promise<ProcessFileResult | null> {
  try {
    const parseOptions: { key?: string; value?: string; silent?: boolean } = {};
    if (options.key !== undefined) {
      parseOptions.key = options.key;
    }
    if (options.value !== undefined) {
      parseOptions.value = options.value;
    }
    if (options.silent !== undefined) {
      parseOptions.silent = options.silent;
    }

    const result = await parseFile(file, parseOptions);

    if (result.hasError && result.errorMessage) {
      if (!options.silent) {
        console.error(`${file}: ${result.errorMessage}`);
      }
      return {
        hasError: true,
        errorMessage: result.errorMessage,
        frontMatter: null,
      };
    }

    if (result.frontMatter === null) {
      if (!options.silent) {
        console.error(`${file}: No front matter found`);
      }
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
