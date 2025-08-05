#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Clearing all caches...');

const rootDir = path.join(__dirname, '..');

// Directories to clean
const dirsToClean = [
  'dist',
  'node_modules/.vite',
  'node_modules/.cache',
  '.vite',
  'coverage',
  'playwright-report',
  'test-results'
];

// Files to clean
const filesToClean = [
  'yarn.lock',
  'pnpm-lock.yaml'
  // Note: package-lock.json is preserved for GitHub Actions deployment
];

// Clean directories
dirsToClean.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️  Cleaned: ${dir}`);
    } catch (error) {
      console.log(`⚠️  Could not clean ${dir}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Directory not found: ${dir}`);
  }
});

// Clean files
filesToClean.forEach(file => {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`🗑️  Cleaned: ${file}`);
    } catch (error) {
      console.log(`⚠️  Could not clean ${file}: ${error.message}`);
    }
  }
});

// Clear npm cache
try {
  console.log('🧹 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.log(`⚠️  Could not clear npm cache: ${error.message}`);
}

// Reinstall dependencies if node_modules is missing
if (!fs.existsSync(path.join(rootDir, 'node_modules'))) {
  console.log('📦 Reinstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.log(`⚠️  Could not reinstall dependencies: ${error.message}`);
  }
}

console.log('✅ Cache clearing complete!');
console.log('🚀 Ready for fresh build'); 