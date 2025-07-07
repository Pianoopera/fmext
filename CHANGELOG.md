# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-XX-XX

### Added
- New `--filter <KEY> <VALUE>` option for filtering files before processing
- Support for multiple filter conditions with AND logic
- Verbose mode (`--verbose` / `-V`) shows filtering statistics
- Comprehensive test suite for filter functionality

### Changed
- Filters are now applied before any other processing for better performance
- Updated documentation with advanced filtering examples

### Fixed
- File count display now reflects filtered files when using filters

## [0.1.9] - Previous releases

### Added
- Basic YAML front matter parsing
- Key extraction with dot notation
- Value counting functionality
- Silent mode
- Legacy filtering with `--key` and `--value`
