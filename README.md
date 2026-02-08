# fmext

A fast and reliable YAML Front Matter parser CLI tool built with Deno. Extract and analyze YAML front matter from Markdown files with ease.

## Features

- ✅ **Accurate YAML Parsing**: Parse .md files with YAML front matter precisely
- 🎯 **Key Extraction**: Extract specific keys with support for nested dot notation
- 🔍 **Value Filtering**: Filter files by specific key-value pairs with array and string matching
- 🔐 **Advanced Filtering**: Apply multiple filter conditions with AND logic
- 📂 **Alias Management**: Create and manage command aliases for reusable configurations
- 📊 **Value Counting**: Count occurrences of values and array elements across files
- ❌ **Error Handling**: Robust YAML parse error handling and reporting
- 🔍 **Multiple Files**: Process multiple files at once with glob patterns
- 📦 **Cross-platform**: Works on Windows, macOS, and Linux
- ⚡ **Fast**: Built with Deno for optimal performance

## Installation

### From npm

```bash
npm install -g fmext
```

### Zsh 補完の有効化

zsh で補完を使うには、`~/.zshrc` に以下を追加してください。

```bash
source <(fmext completions zsh)
```

補完スクリプトは `fmext completions zsh` で出力されます。bash や fish の補完も同様に `fmext completions bash` / `fmext completions fish` で取得できます。

## Usage

```bash
Usage: fmext [files...]

Description:

  Front matter extraction tool

Options:

  -h, --help              - Show this help.             
  -c, --count             - Count mode                  
  -k, --key     <key>     - Extract specific key        
  -v, --value   <value>   - Filter by value             
  -f, --filter  <filter>  - Filter by key=value format  

Commands:

  help     - Show help             
  version  - Show version          
  alias    - Manage command aliases
```

### Examples:

key value extraction:
```bash
fmext -k topics -v typescript articles/*.md
[
  {
    "file": "articles/intro.md",
    "output": {
      "topics": [
        { "value": "typescript" },
        { "value": "deno" }
      ]
    }
  }
]
```

count occurrences of a value:
```bash
fmext -c -k topics -v typescript articles/*.md
{
  "output": [
    {
      "key": "typescript",
      "value": 3
    },
    {
      "key": "express",
      "value": 1
    },
    {
      "key": "msw",
      "value": 1
    },
    {
      "key": "nodejs",
      "value": 1
    },
    {
      "key": "javascript",
      "value": 2
    },
    {
      "key": "npm",
      "value": 1
    }
  ]
}
```

alias management:
```bash
fmext alias --set myalias "-k:topics,-v:typescript"
fmext alias --list
[
  {
    "aliasName": "myalias",
    "options": "-k:topics,-v:typescript",
    "runCommand": "-k topics -v typescript"
  }
]
fmext alias run myalias articles/*.md
[
  {
    "file": "articles/intro.md",
    "output": {
      "topics": [
        { "value": "typescript" },
        { "value": "deno" }
      ]
    }
  }
]
```

## Release Flow

github actions [npm-publish](https://github.com/Pianoopera/fmext/actions/workflows/npm-publish.yml)

```yml
inputs:
  version:
    description: "Version type"
    required: true
    default: "patch"
    type: choice
    options:
      - patch
      - minor
      - major
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
