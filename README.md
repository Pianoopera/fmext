# fmstat

A fast and reliable YAML Front Matter parser CLI tool built with Deno. Extract and analyze YAML front matter from Markdown files with ease.

## Features

- ✅ **Accurate YAML Parsing**: Parse .md files with YAML front matter precisely
- 🎯 **Key Extraction**: Extract specific keys with support for nested dot notation
- 🔍 **Value Filtering**: Filter files by specific key-value pairs with array and string matching
- 📊 **Value Counting**: Count occurrences of values and array elements across files
- 🔇 **Silent Mode**: Skip files without front matter gracefully
- ❌ **Error Handling**: Robust YAML parse error handling and reporting
- 🔍 **Multiple Files**: Process multiple files at once with glob patterns
- 📦 **Cross-platform**: Works on Windows, macOS, and Linux
- ⚡ **Fast**: Built with Deno for optimal performance

## Installation

### From npm

```bash
npm install -g fmstat
```

### From source (requires Deno)

```bash
git clone https://github.com/Pianoopera/fmstat.git
cd fmstat
deno compile --allow-read --output fmstat mod.ts
```

## Usage

### Basic Usage

```bash
# Parse front matter from a single file
fmstat document.md

# Parse multiple files
fmstat *.md

# Parse files with glob patterns
fmstat docs/**/*.md
```

### Extract Specific Keys

```bash
# Extract a simple key
fmstat --key title document.md

# Extract nested keys using dot notation
fmstat --key "metadata.author" document.md
fmstat --key "settings.theme.dark" document.md
```

### Filter Files by Key-Value Pairs

```bash
# Filter files where 'topic' equals 'react'
fmstat --key topic --value react articles/*.md

# Filter files where 'tags' array contains 'javascript'
fmstat --key tags --value javascript posts/*.md

# Filter files where 'published' is true
fmstat --key published --value true content/*.md

# Filter files where 'priority' is 1
fmstat --key priority --value 1 tasks/*.md
```

### Count Values

```bash
# Count individual values and array elements across files
fmstat --count *.md

# Count only elements from specific key
fmstat --count --key tags *.md
```

### Silent Mode

```bash
# Skip files without front matter silently
fmstat --silent *.md

# Combine with key extraction
fmstat --silent --key title *.md
```

### Help

```bash
fmstat --help
```

## Examples

### Example 1: Basic Front Matter

**Input file (example.md):**
```markdown
---
title: My Document
author: John Doe
tags:
  - markdown
  - yaml
published: true
---

# My Document

Content here...
```

**Commands:**
```bash
# Get all front matter
$ fmstat example.md
{
  "title": "My Document",
  "author": "John Doe",
  "tags": ["markdown", "yaml"],
  "published": true
}

# Get specific key
$ fmstat --key title example.md
My Document

# Get array values
$ fmstat --key tags example.md
markdown, yaml
```

### Example 2: Nested Keys

**Input file (config.md):**
```markdown
---
metadata:
  author: Jane Smith
  settings:
    theme: dark
    version: 1.2
  social:
    github: janesmith
    twitter: "@janesmith"
---

# Configuration

...
```

**Commands:**
```bash
# Extract nested values
$ fmstat --key "metadata.author" config.md
Jane Smith

$ fmstat --key "metadata.settings.theme" config.md
dark

$ fmstat --key "metadata.social.github" config.md
janesmith
```

### Example 3: Multiple Files

```bash
# Process multiple files
$ fmstat blog/*.md
blog/post1.md: {"title": "First Post", "date": "2023-01-01"}
blog/post2.md: {"title": "Second Post", "date": "2023-01-02"}

# Extract titles from all posts
$ fmstat --key title blog/*.md
blog/post1.md: First Post
blog/post2.md: Second Post
```

### Example 4: Count Values

**Input files with tags:**
```markdown
# post1.md
---
title: First Post
tags:
  - javascript
  - web
  - tutorial
---

# post2.md
---
title: Second Post
tags:
  - javascript
  - react
  - tutorial
---
```

**Commands:**
```bash
# Count all values across files
$ fmstat --count blog/*.md
String values:
  First Post: 1
  Second Post: 1
Array elements:
  javascript: 2
  react: 1
  tutorial: 2
  web: 1

# Count only tags
$ fmstat --count --key tags blog/*.md
Array elements:
  javascript: 2
  react: 1
  tutorial: 2
  web: 1
```

### Example 5: Filter Files by Key-Value Pairs

**Input files:**
```markdown
# article1.md
---
title: Getting Started with React
topic: react
tags:
  - javascript
  - react
  - tutorial
published: true
---

# article2.md
---
title: Advanced Vue.js Patterns
topic: vue
tags:
  - javascript
  - vue
  - advanced
published: true
---

# article3.md
---
title: React Hooks Deep Dive
topic: react
tags:
  - javascript
  - react
  - hooks
published: false
---
```

**Commands:**
```bash
# Find all React articles
$ fmstat --key topic --value react articles/*.md
articles/article1.md
articles/article3.md

# Find all published articles
$ fmstat --key published --value true articles/*.md
articles/article1.md
articles/article2.md

# Find articles containing 'react' tag
$ fmstat --key tags --value react articles/*.md
articles/article1.md
articles/article3.md

# Find articles containing 'javascript' tag
$ fmstat --key tags --value javascript articles/*.md
articles/article1.md
articles/article2.md
articles/article3.md
```

## CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--key <KEY>` | `-k` | Extract specific key (supports dot notation for nested keys) |
| `--value <VALUE>` | `-v` | Filter files where the specified key matches the given value |
| `--count` | `-c` | Count individual values and array elements across files |
| `--silent` | `-s` | Skip files without front matter silently |
| `--help` | `-h` | Show help message |

## Supported YAML Features

- Strings, numbers, booleans, null values
- Arrays and objects
- Nested structures
- Multi-line strings
- YAML comments (ignored in output)

## Filtering Behavior

When using `--value` with `--key`, fmstat filters files based on the specified key-value pair:

- **String values**: Exact match comparison
- **Array values**: Checks if the value is contained in the array
- **Boolean/Number values**: Converted to string for comparison
- **Output format**: Only matching file paths are output (one per line)
- **Zero matches**: No output when no files match the criteria

## Error Handling

fmstat handles various error conditions gracefully:

- **No front matter**: Reports missing front matter (unless `--silent`)
- **Invalid YAML**: Reports YAML syntax errors with details
- **Missing files**: Reports file not found errors
- **Permission errors**: Reports file access issues
- **Missing keys**: Reports when requested keys don't exist

## Development

### Prerequisites

- [Deno](https://deno.land/) 1.30 or later

### Setup

```bash
git clone https://github.com/Pianoopera/fmstat.git
cd fmstat
```

### Running Tests

```bash
deno test --allow-read
```

### Building

```bash
deno task build
```

### Development Server

```bash
deno task dev [args...]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests: `deno test --allow-read`
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [gray-matter](https://github.com/jonschlinkert/gray-matter) - JavaScript front matter parser
- [front-matter](https://github.com/jxson/front-matter) - Extract YAML front matter from strings

## Changelog

### 1.0.0

- Initial release
- YAML front matter parsing
- Key extraction with dot notation
- Silent mode
- Multiple file support
- Comprehensive error handling
- Cross-platform compatibility
