#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting automated deployment...');

const rootDir = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Check if we're in a git repository
try {
  execSync('git status', { stdio: 'pipe' });
} catch (error) {
  error('Not in a git repository. Please run this from the project root.');
}

// Check for uncommitted changes
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    warning('You have uncommitted changes. Consider committing them first.');
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      readline.question('Continue anyway? (y/N): ', resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      info('Deployment cancelled.');
      process.exit(0);
    }
  }
} catch (error) {
  warning('Could not check git status');
}

// Step 1: Clear caches
info('Step 1: Clearing caches...');
try {
  execSync('npm run cache:clear', { stdio: 'inherit' });
  success('Caches cleared');
} catch (error) {
  error('Failed to clear caches');
}

// Step 2: Bump version
info('Step 2: Bumping version...');
try {
  execSync('npm run version:bump', { stdio: 'inherit' });
  success('Version bumped');
} catch (error) {
  error('Failed to bump version');
}

// Step 3: Install dependencies
info('Step 3: Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  success('Dependencies installed');
} catch (error) {
  error('Failed to install dependencies');
}

// Step 4: Run tests
info('Step 4: Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  success('Tests passed');
} catch (error) {
  warning('Tests failed, but continuing deployment...');
}

// Step 5: Build
info('Step 5: Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  success('Build completed');
} catch (error) {
  error('Build failed');
}

// Step 6: Verify build
info('Step 6: Verifying build...');
try {
  // Start preview server
  const previewProcess = execSync('npm run preview', { 
    stdio: 'pipe',
    detached: true 
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test the build
  try {
    execSync('curl -s http://localhost:4173 > /dev/null', { stdio: 'pipe' });
    success('Build verified');
  } catch (error) {
    warning('Could not verify build, but continuing...');
  }
  
  // Kill preview server
  process.kill(-previewProcess.pid);
} catch (error) {
  warning('Could not verify build, but continuing...');
}

// Step 7: Deploy
info('Step 7: Deploying to GitHub Pages...');
try {
  execSync('gh-pages -d dist', { stdio: 'inherit' });
  success('Deployed to GitHub Pages');
} catch (error) {
  error('Deployment failed');
}

// Step 8: Create deployment summary
const deployInfoPath = path.join(rootDir, 'public', 'deploy-info.json');
if (fs.existsSync(deployInfoPath)) {
  const deployInfo = JSON.parse(fs.readFileSync(deployInfoPath, 'utf8'));
  
  log('\n🎉 Deployment Summary:', 'bright');
  log(`📦 Version: ${deployInfo.version}`, 'cyan');
  log(`🔄 Cache Version: v${deployInfo.cacheVersion}`, 'cyan');
  log(`⏰ Deployed: ${deployInfo.deployedAt}`, 'cyan');
  log(`🆔 Build ID: ${deployInfo.buildId}`, 'cyan');
}

log('\n🚀 Deployment complete!', 'bright');
log('🌐 Your app is live at: https://scrypture.app', 'green');
log('🧹 If changes don\'t appear, visit: https://scrypture.app/force-deploy-refresh.html', 'yellow');
log('📋 Deployment info: https://scrypture.app/deploy-info.json', 'blue');

// Optional: Open the force refresh page
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const openRefresh = await new Promise(resolve => {
  readline.question('Open force refresh page? (Y/n): ', resolve);
});
readline.close();

if (openRefresh.toLowerCase() !== 'n') {
  try {
    execSync('open https://scrypture.app/force-deploy-refresh.html', { stdio: 'pipe' });
  } catch (error) {
    // Fallback for non-macOS
    try {
      execSync('start https://scrypture.app/force-deploy-refresh.html', { stdio: 'pipe' });
    } catch (error2) {
      info('Please manually visit: https://scrypture.app/force-deploy-refresh.html');
    }
  }
} 