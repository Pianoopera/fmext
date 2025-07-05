#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const platform = os.platform();
const arch = os.arch();

let binaryName;

if (platform === 'win32') {
  binaryName = arch === 'x64' ? 'fmext-windows-x64.exe' : null;
} else if (platform === 'darwin') {
  binaryName = arch === 'arm64' ? 'fmext-macos-arm64' : 'fmext-macos-x64';
} else if (platform === 'linux') {
  binaryName = arch === 'x64' ? 'fmext-linux-x64' : null;
}

if (!binaryName) {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  process.exit(1);
}

// インストール時にプラットフォーム検出だけ行う（postinstall）
if (process.env.npm_lifecycle_event === 'postinstall') {
  const binaryPath = path.join(__dirname, 'dist', binaryName);
  if (!fs.existsSync(binaryPath)) {
    console.error(`Binary not found: ${binaryPath}`);
    process.exit(1);
  }
  console.log(`Platform detected: ${platform}-${arch}, will use ${binaryName}`);
  return;
}

// 実行時は適切なバイナリを直接実行
const binaryPath = path.join(__dirname, 'dist', binaryName);
if (!fs.existsSync(binaryPath)) {
  console.error(`Binary not found: ${binaryPath}`);
  process.exit(1);
}

// バイナリを直接実行
const child = spawn(binaryPath, process.argv.slice(2), {
  stdio: 'inherit',
  detached: false
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error(`Failed to start binary: ${err.message}`);
  process.exit(1);
});
