#!/bin/bash
set -e

echo "Testing filter functionality..."

# Test 1: Single filter - published: true
echo -e "\n1. Testing single filter (published: true):"
deno run --allow-read mod.ts --filter published true tests/filter/*.md

# Test 2: Multiple filters - published: true AND type: tech
echo -e "\n2. Testing multiple filters (published: true AND type: tech):"
deno run --allow-read mod.ts --filter published true --filter type tech tests/filter/*.md

# Test 3: Filter with array values - topics contains "react"
echo -e "\n3. Testing filter with array values (topics contains 'react'):"
deno run --allow-read mod.ts --filter topics react tests/filter/*.md

# Test 4: Filter with --count option
echo -e "\n4. Testing filter with --count (status: draft):"
deno run --allow-read mod.ts --filter status draft --count --key topics tests/filter/*.md

# Test 5: Old syntax compatibility --key --value
echo -e "\n5. Testing old syntax (--key topics --value react):"
deno run --allow-read mod.ts --key topics --value react tests/filter/*.md

# Test 6: Filter with key extraction
echo -e "\n6. Testing filter with key extraction (published: true, extract title):"
deno run --allow-read mod.ts --filter published true --key title tests/filter/*.md

# Test 7: Multiple filters with verbose
echo -e "\n7. Testing multiple filters with verbose mode:"
deno run --allow-read mod.ts --filter published false --filter type tech --verbose tests/filter/*.md

echo -e "\nAll tests completed!"
