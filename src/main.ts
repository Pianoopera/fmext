/**
 * YAML Front Matter Parser CLI
 * A simple CLI tool for parsing YAML Front Matter from files
 */

export interface FrontMatterResult {
  frontMatter: Record<string, unknown>;
  content: string;
}

/**
 * Parse YAML Front Matter from a string
 */
export function parseFrontMatter(input: string): FrontMatterResult {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = input.match(frontMatterRegex);

  if (!match) {
    return {
      frontMatter: {},
      content: input.trim(),
    };
  }

  try {
    // For now, return a simple parser
    // In a real implementation, you'd use a YAML parser like js-yaml
    const yamlString = match[1];
    const content = match[2];

    // Simple key-value parsing for demonstration
    const frontMatter: Record<string, unknown> = {};
    const lines = yamlString.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && trimmed.includes(":")) {
        const [key, ...valueParts] = trimmed.split(":");
        const value = valueParts.join(":").trim();
        frontMatter[key.trim()] = value.replace(/^["']|["']$/g, "");
      }
    }

    return {
      frontMatter,
      content: content.trim(),
    };
  } catch (error) {
    console.error("Error parsing front matter:", error);
    return {
      frontMatter: {},
      content: input.trim(),
    };
  }
}

/**
 * Main CLI function
 */
export function main() {
  console.log("YAML Front Matter Parser CLI");
  console.log("Usage: deno run --allow-read main.ts <file>");
}

if (import.meta.main) {
  main();
}
