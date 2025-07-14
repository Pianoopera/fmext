# !/bin/sh
set -e

echo "Running CLI tests..."

echo "基本的"
deno run --allow-read ./mod.ts tests/fixtures/valid.md

echo "基本的（複数ファイル）"
deno run --allow-read ./mod.ts tests/fixtures/*.md

echo "Key指定"
deno run --allow-read ./mod.ts -k tags tests/fixtures/valid.md

echo "基本的な組み合わせ（カウントなし）"
deno run --allow-read ./mod.ts -k title -v "Test Document" -f "published=true" tests/fixtures/valid.md

echo "複数ファイルの組み合わせ（カウントなし）"
deno run --allow-read ./mod.ts -k tags -v "react" -f "status=published" tests/fixtures/count-test-1.md tests/fixtures/count-test-2.md

echo "カウント付きの組み合わせ"
deno run --allow-read ./mod.ts --count -k tags -v "react" -f "status=published" tests/fixtures/count-test-1.md

echo "複数ファイルのカウント付きの組み合わせ"
deno run --allow-read ./mod.ts --count -k tags -v "typescript" -f "status=published" tests/fixtures/count-test-1.md tests/fixtures/count-test-2.md

echo "マッチしないケース"
deno run --allow-read ./mod.ts --count -k tags -v "nonexistent" -f "status=published" tests/fixtures/count-test-1.md

echo "部分一致のファイル指定で複数オプション"
deno run --allow-read ./mod.ts -k tags -v "typescript" tests/fixtures/count*.md

echo "部分一致のファイル指定でカウント"
deno run --allow-read ./mod.ts --count tests/fixtures/*.md