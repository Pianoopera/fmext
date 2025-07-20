export interface FrontMatterResult {
  frontMatter: Record<string, unknown> | null;
  content: string;
  hasError: boolean;
  errorMessage?: string;
}

export interface ParseOptions {
  key?: string;
  value?: string;
  count?: boolean;
}

export interface FilterCondition {
  key: string;
  value: string;
}

export interface CLIArgs {
  key?: string;
  value?: string;
  help?: boolean;
  version?: boolean;
  count?: boolean;
  filters: FilterCondition[];
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
  arrays: CountResult;
}

export type CLIResult = {
  file?: string;
  output: {
    key: string;
    value: number;
  }[] | unknown;
};

export type Aliases = {
  [aliasName: string]: string;
};

export interface DeleteAlias {
  aliasName: string;
  success: boolean;
}

export interface DeleteAllAliases {
  success: boolean;
}
