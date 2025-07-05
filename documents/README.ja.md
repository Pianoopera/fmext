# fmstat

DenoでビルドされたFast and Reliable YAML Front Matter パーサー CLI ツールです。MarkdownファイルからYAML Front Matterを簡単に抽出・解析できます。

## 機能

- ✅ **正確なYAML解析**: YAML Front Matterを含む.mdファイルを正確に解析
- 🎯 **キー抽出**: ネストしたドット記法をサポートした特定キーの抽出
- 📊 **値のカウント**: ファイル間での値と配列要素の出現回数をカウント
- 🔇 **サイレントモード**: Front Matterのないファイルを適切にスキップ
- ❌ **エラーハンドリング**: 堅牢なYAML解析エラーハンドリングと報告
- 🔍 **複数ファイル処理**: globパターンで複数ファイルを一度に処理
- 📦 **クロスプラットフォーム**: Windows、macOS、Linuxで動作
- ⚡ **高速**: 最適なパフォーマンスのためにDenoでビルド

## インストール

### npm から

```bash
npm install -g fmstat
```

### ソースから（Denoが必要）

```bash
git clone https://github.com/Pianoopera/fmstat.git
cd fmstat
deno compile --allow-read --output fmstat mod.ts
```

## 使い方

### 基本的な使い方

```bash
# 単一ファイルからFront Matterを解析
fmstat document.md

# 複数ファイルを解析
fmstat *.md

# globパターンでファイルを解析
fmstat docs/**/*.md
```

### 特定のキーを抽出

```bash
# 単純なキーを抽出
fmstat --key title document.md

# ドット記法を使用してネストしたキーを抽出
fmstat --key "metadata.author" document.md
fmstat --key "settings.theme.dark" document.md
```

### 値のカウント

```bash
# ファイル間で個別の値と配列要素をカウント
fmstat --count *.md

# 特定のキーからの要素のみをカウント
fmstat --count --key tags *.md
```

### サイレントモード

```bash
# Front Matterのないファイルをサイレントでスキップ
fmstat --silent *.md

# キー抽出と組み合わせ
fmstat --silent --key title *.md
```

### ヘルプ

```bash
fmstat --help
```

## 例

### 例1: 基本的なFront Matter

**入力ファイル (example.md):**
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

コンテンツがここに...
```

**コマンド:**
```bash
# すべてのFront Matterを取得
$ fmstat example.md
{
  "title": "My Document",
  "author": "John Doe",
  "tags": ["markdown", "yaml"],
  "published": true
}

# 特定のキーを取得
$ fmstat --key title example.md
My Document

# 配列値を取得
$ fmstat --key tags example.md
markdown, yaml
```

### 例2: ネストしたキー

**入力ファイル (config.md):**
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

**コマンド:**
```bash
# ネストした値を抽出
$ fmstat --key "metadata.author" config.md
Jane Smith

$ fmstat --key "metadata.settings.theme" config.md
dark

$ fmstat --key "metadata.social.github" config.md
janesmith
```

### 例3: 複数ファイル

```bash
# 複数ファイルを処理
$ fmstat blog/*.md
blog/post1.md: {"title": "First Post", "date": "2023-01-01"}
blog/post2.md: {"title": "Second Post", "date": "2023-01-02"}

# すべての投稿からタイトルを抽出
$ fmstat --key title blog/*.md
blog/post1.md: First Post
blog/post2.md: Second Post
```

### 例4: 値のカウント

**タグを含む入力ファイル:**
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

**コマンド:**
```bash
# ファイル間ですべての値をカウント
$ fmstat --count blog/*.md
String values:
  First Post: 1
  Second Post: 1
Array elements:
  javascript: 2
  react: 1
  tutorial: 2
  web: 1

# タグのみをカウント
$ fmstat --count --key tags blog/*.md
Array elements:
  javascript: 2
  react: 1
  tutorial: 2
  web: 1
```

## CLIオプション

| オプション | 短縮 | 説明 |
|-----------|------|------|
| `--key <KEY>` | `-k` | 特定のキーを抽出（ネストしたキーのドット記法をサポート） |
| `--count` | `-c` | ファイル間で個別の値と配列要素をカウント |
| `--silent` | `-s` | Front Matterのないファイルをサイレントでスキップ |
| `--help` | `-h` | ヘルプメッセージを表示 |

## サポートされるYAML機能

- 文字列、数値、真偽値、null値
- 配列とオブジェクト
- ネストした構造
- 複数行文字列
- YAMLコメント（出力では無視される）

## エラーハンドリング

fmstatは様々なエラー条件を適切に処理します：

- **Front Matterなし**: Front Matterの欠如を報告（`--silent`でない場合）
- **無効なYAML**: 詳細なYAML構文エラーを報告
- **ファイルが見つからない**: ファイルが見つからないエラーを報告
- **権限エラー**: ファイルアクセスの問題を報告
- **キーが見つからない**: 要求されたキーが存在しない場合を報告

## 開発

### 前提条件

- [Deno](https://deno.land/) 1.30以降

### セットアップ

```bash
git clone https://github.com/Pianoopera/fmstat.git
cd fmstat
```

### テストの実行

```bash
deno test --allow-read
```

### ビルド

```bash
deno task build
```

### 開発サーバー

```bash
deno task dev [args...]
```

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更を実装
4. 新機能にテストを追加
5. テストを実行: `deno test --allow-read`
6. プルリクエストを送信

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 関連プロジェクト

- [gray-matter](https://github.com/jonschlinkert/gray-matter) - JavaScript Front Matterパーサー
- [front-matter](https://github.com/jxson/front-matter) - 文字列からYAML Front Matterを抽出

## 変更履歴

### 1.0.0

- 初回リリース
- YAML Front Matter解析
- ドット記法によるキー抽出
- サイレントモード
- 複数ファイルサポート
- 包括的なエラーハンドリング
- クロスプラットフォーム互換性