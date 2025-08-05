# 🚀 Scrypture Deployment Guide

## Quick Start

**To deploy your changes and ensure they appear immediately:**

```bash
npm run deploy:auto
```

That's it! This single command handles everything.

## What This Does

1. **🧹 Clears all caches** (build, npm, browser)
2. **📦 Bumps version automatically** (package.json + service worker)
3. **🧪 Runs tests** to ensure quality
4. **🏗️ Builds the project** with fresh dependencies
5. **✅ Verifies the build** works locally
6. **🚀 Deploys to GitHub Pages**
7. **🌐 Opens force refresh page** to clear browser cache

## Alternative Commands

### Quick Deploy (No cache clearing)
```bash
npm run deploy:force
```

### Manual Step-by-Step
```bash
npm run cache:clear    # Clear all caches
npm run version:bump   # Bump version
npm run build         # Build project
gh-pages -d dist      # Deploy
```

## Monitoring Your Deployment

After deployment, check these URLs:

- **📊 Status**: https://scrypture.app/deployment-status.html
- **🧹 Force Refresh**: https://scrypture.app/force-deploy-refresh.html
- **📋 Info**: https://scrypture.app/deploy-info.json

## Troubleshooting

### Changes Still Not Appearing?

1. **Visit the force refresh page**: https://scrypture.app/force-deploy-refresh.html
2. **Use "Nuclear Option"** to clear everything
3. **Check deployment status** to see if deployment succeeded

### Common Issues

**Issue**: "Changes work locally but not deployed"
**Solution**: Use `npm run deploy:auto` - it handles cache busting automatically

**Issue**: "Service worker not updating"
**Solution**: The automated deployment bumps the service worker version automatically

**Issue**: "Old data still showing"
**Solution**: Use the force refresh page to clear localStorage

## Version Management

The automated deployment handles versioning:

- **Patch updates** (bug fixes): `npm run version:patch`
- **Minor updates** (new features): `npm run version:minor`
- **Major updates** (breaking changes): `npm run version:major`

## Why This Works

1. **Automatic Cache Busting**: Every deployment gets a new version number
2. **Service Worker Updates**: Cache version is automatically incremented
3. **Fresh Builds**: All caches are cleared before building
4. **Verification**: Build is tested before deployment
5. **Monitoring**: Deployment status is tracked and visible

## Before You Deploy

- ✅ Make sure your changes work locally (`npm run dev`)
- ✅ Test your changes (`npm test`)
- ✅ Commit your changes to git (recommended)

## After Deployment

- ✅ Wait 1-2 minutes for GitHub Pages to update
- ✅ Visit the force refresh page if changes don't appear
- ✅ Check deployment status for confirmation

---

**That's it! No more manual cache clearing or version bumping. Just run `npm run deploy:auto` and your changes will be live with cache busting handled automatically.** 