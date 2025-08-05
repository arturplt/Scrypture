#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get current version
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`📦 Current version: ${currentVersion}`);

// Read service worker file
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Extract current cache version
const cacheMatch = swContent.match(/CACHE_NAME = 'scrypture-v(\d+)'/);
if (!cacheMatch) {
  console.error('❌ Could not find CACHE_NAME in service worker');
  process.exit(1);
}

const currentCacheVersion = parseInt(cacheMatch[1]);
const newCacheVersion = currentCacheVersion + 1;

console.log(`🔄 Bumping cache version from v${currentCacheVersion} to v${newCacheVersion}`);

// Update service worker cache version
swContent = swContent.replace(
  /CACHE_NAME = 'scrypture-v\d+'/,
  `CACHE_NAME = 'scrypture-v${newCacheVersion}'`
);

// Update console.log messages
swContent = swContent.replace(
  /console\.log\('SW: Installing service worker v\d+'\)/g,
  `console.log('SW: Installing service worker v${newCacheVersion}')`
);

swContent = swContent.replace(
  /console\.log\('SW: Opened cache v\d+'\)/g,
  `console.log('SW: Opened cache v${newCacheVersion}')`
);

swContent = swContent.replace(
  /console\.log\('SW: Activating service worker v\d+'\)/g,
  `console.log('SW: Activating service worker v${newCacheVersion}')`
);

// Write updated service worker
fs.writeFileSync(swPath, swContent);

// Update package.json version if not already updated
const versionParts = currentVersion.split('.');
const patchVersion = parseInt(versionParts[2]) + 1;
const newVersion = `${versionParts[0]}.${versionParts[1]}.${patchVersion}`;

if (newVersion !== currentVersion) {
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`📦 Updated package.json version to ${newVersion}`);
}

// Create a deployment timestamp file
const timestamp = new Date().toISOString();
const deployInfo = {
  version: newVersion,
  cacheVersion: newCacheVersion,
  deployedAt: timestamp,
  buildId: `build-${Date.now()}`
};

const deployPath = path.join(__dirname, '..', 'public', 'deploy-info.json');
fs.writeFileSync(deployPath, JSON.stringify(deployInfo, null, 2));

console.log(`✅ Version bump complete!`);
console.log(`📋 Deployment info:`, deployInfo);
console.log(`🚀 Ready to deploy with cache-busting version v${newCacheVersion}`); 