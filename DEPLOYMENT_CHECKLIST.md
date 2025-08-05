# Deployment Checklist

## 🚀 Streamlined Deployment (Recommended)

### Option 1: Full Automated Deployment
```bash
npm run deploy:auto
```
This single command will:
- ✅ Clear all caches
- ✅ Bump version automatically
- ✅ Run tests
- ✅ Build the project
- ✅ Verify the build
- ✅ Deploy to GitHub Pages
- ✅ Open force refresh page

### Option 2: Quick Deployment
```bash
npm run deploy:force
```
This will:
- ✅ Bump version automatically
- ✅ Build and deploy
- ✅ Verify deployment

### Option 3: Manual Deployment
If you prefer manual control:

1. **Clear Caches**
   ```bash
   npm run cache:clear
   ```

2. **Bump Version**
   ```bash
   npm run version:bump
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   gh-pages -d dist
   ```

## 📊 Deployment Monitoring

After deployment, check:
- **Deployment Status**: https://scrypture.app/deployment-status.html
- **Force Refresh**: https://scrypture.app/force-deploy-refresh.html
- **Deployment Info**: https://scrypture.app/deploy-info.json

## Before Deploying (Manual Process)

## After Deploying

1. **Wait for Deployment**
   - Most platforms take 1-5 minutes to deploy
   - Check your deployment platform's status

2. **Force Cache Refresh**
   - Visit `/force-deploy-refresh.html` on your deployed site
   - Use "Nuclear Option" to clear all caches
   - Or use "Force Service Worker Update" if available

3. **Alternative Cache Clearing Methods**
   - Visit `/clear-cache.html` on your deployed site
   - Use browser dev tools: Application → Storage → Clear storage
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Troubleshooting

### Changes Still Not Appearing?

1. **Check Service Worker**
   - Open browser dev tools
   - Go to Application → Service Workers
   - Check if there's a waiting service worker
   - Click "Skip waiting" if available

2. **Check Cache**
   - Go to Application → Storage → Cache Storage
   - Delete all cache entries
   - Reload the page

3. **Check Network Tab**
   - Open dev tools → Network
   - Check "Disable cache"
   - Reload and see if files are fetched fresh

4. **Browser Cache**
   - Try incognito/private browsing mode
   - Try a different browser
   - Clear browser cache completely

### Service Worker Issues?

1. **Unregister Service Worker**
   - In dev tools: Application → Service Workers
   - Click "Unregister" for the service worker
   - Reload the page

2. **Force Update**
   - Visit `/force-deploy-refresh.html`
   - Use "Nuclear Option"

## Common Issues

### Issue: Changes work locally but not deployed
**Solution**: Increment service worker version and force cache refresh

### Issue: Service worker not updating
**Solution**: Use the force refresh page or manually unregister in dev tools

### Issue: Old data still showing
**Solution**: Clear localStorage and sessionStorage using the cache clearing tools

### Issue: App stuck on old version
**Solution**: Nuclear option - clear everything and reload

## Quick Commands

```bash
# Build locally to test
npm run build
npm run preview

# Check if service worker is registered
# (In browser console)
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

# Force service worker update
# (In browser console)
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg && reg.waiting) {
    reg.waiting.postMessage({type: 'SKIP_WAITING'});
  }
});
```

## Version History

- v5: Added data clear fix for StartHereSection
- v4: Previous version
- v3: Previous version
- v2: Previous version
- v1: Initial version 