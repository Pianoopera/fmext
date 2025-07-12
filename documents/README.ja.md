# fmext

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
npm install -g fmext
```

### ソースから（Denoが必要）

```bash
git clone https://github.com/Pianoopera/fmext.git
cd fmext
deno compile --allow-read --output fmext mod.ts
```

## 使い方

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
