# Deployment Checklist

## Before Deploying

1. **Increment Service Worker Version**
   - Edit `public/sw.js`
   - Change `CACHE_NAME` from `'scrypture-vX'` to `'scrypture-vY'` (increment version)
   - This forces the service worker to update and clear old caches

2. **Check Build Output**
   - Run `npm run build` locally
   - Verify the build completes without errors
   - Check that your changes are included in the build

3. **Test Locally**
   - Run `npm run preview` to test the production build locally
   - Verify your changes work in the production build

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