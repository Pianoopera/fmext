# fmext

A fast and reliable YAML Front Matter parser CLI tool built with Deno. Extract and analyze YAML front matter from Markdown files with ease.

## Features

- ✅ **Accurate YAML Parsing**: Parse .md files with YAML front matter precisely
- 🎯 **Key Extraction**: Extract specific keys with support for nested dot notation
- 🔍 **Value Filtering**: Filter files by specific key-value pairs with array and string matching
- 🔐 **Advanced Filtering**: Apply multiple filter conditions with AND logic
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

### From source (requires Deno)

```bash
git clone https://github.com/Pianoopera/fmext.git
cd fmext
deno compile --allow-read --output fmext mod.ts
```

## Usage

```bash
Usage: fmext [files...]

Description:

  Front matter extraction tool

Options:

  -h, --help               - Show this help.             
  -c, --count              - Count mode                       
  -k, --key      <key>     - Extract specific key        
  -v, --value    <value>   - Filter by value             
  -f, --filter   <filter>  - Filter by key=value format  

Commands:

  version  - Show version
  help     - Show help   
```

### Release Flow

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

## Related Projects

- [gray-matter](https://github.com/jonschlinkert/gray-matter) - JavaScript front matter parser
- [front-matter](https://github.com/jxson/front-matter) - Extract YAML front matter from strings
