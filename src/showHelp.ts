export function showHelp() {
  console.log(`
fmext - YAML Front Matter Parser

USAGE:
    fmext [OPTIONS] <FILES...>

SUBCOMMANDS:
    version              Show the version of fmext

OPTIONS:
    -k, --key <KEY>      Extract specific key from front matter (supports dot notation for nested keys)
    -v, --value <VALUE>  Filter files where the specified key matches the given value
    -f, --filter <KEY> <VALUE>  Filter files where KEY matches VALUE (can be used multiple times for AND conditions)
    -c, --count          Count individual values and array elements across files
    -s, --silent         Skip files without front matter silently
    -V, --verbose        Show detailed processing information
    -h, --help           Show this help message

EXAMPLES:
    fmext file.md                         # Parse front matter from file.md
    fmext --key title *.md                # Extract 'title' key from all .md files
    fmext --key "meta.author" doc.md      # Extract nested key using dot notation
    fmext --key topic --value react *.md  # Filter files where 'topic' equals 'react'
    fmext --filter published true *.md    # Filter files where 'published' is true
    fmext --filter published true --filter type tech *.md  # Multiple filters (AND condition)
    fmext --count --filter status draft *.md  # Count values from filtered files only
    fmext --silent *.md                   # Parse all .md files, skip those without front matter

DESCRIPTION:
    Parses YAML front matter from Markdown files and outputs the results.
    Front matter should be enclosed in triple dashes (---) at the beginning of the file.

    When using --value or --filter, files are filtered based on the specified key-value pairs:
    - For string values: exact match comparison
    - For array values: checks if the value is contained in the array
    - For boolean/number values: converted to string for comparison
    - Multiple --filter options create AND conditions (all must match)
    When filtering, only matching file paths are output (one per line) unless used with --count.
  `);
}
