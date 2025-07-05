export interface FrontMatterResult {
  frontMatter: Record<string, unknown> | null;
  content: string;
  hasError: boolean;
  errorMessage?: string;
}

export interface ParseOptions {
  key?: string;
  value?: string;
  silent?: boolean;
  count?: boolean;
}

export interface CLIArgs {
  key?: string;
  value?: string;
  silent?: boolean;
  help?: boolean;
  count?: boolean;
  files: string[];
}

export interface FrontMatterData {
  [key: string]: unknown;
}

export type ParseResult = {
  success: true;
  data: FrontMatterData | null;
  content: string;
} | {
  success: false;
  error: string;
  content: string;
};

export interface CountResult {
  [key: string]: number;
}

export interface CountByType {
  strings: CountResult;
  arrays: CountResult;
}
