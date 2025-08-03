# Data Clearing Guide

## Overview

Scrypture's data clearing functionality has been enhanced to provide a complete reset of the application state, including cached files and service workers. This ensures users get a truly fresh start when clearing their data.

## What Gets Cleared

When users clear their data, the following items are completely removed:

### 📦 Application Data (localStorage)
- **User Data**: Profile, level, experience, stats (body, mind, soul), achievements
- **Tasks**: All created tasks and their completion status
- **Habits**: All created habits and their progress
- **Categories**: Custom categories created by the user
- **Settings**: User preferences and app configuration
- **Tutorial State**: Progress through the onboarding tutorial
- **Start Here Data**: Specific data for the "Start Here" feature
- **Backups**: Saved backup files

### 💾 Session Data (sessionStorage)
- **Temporary Data**: Any session-specific information
- **Form Data**: Unsaved form inputs and drafts

### 🗂️ Cached Files (Service Worker Caches)
- **JavaScript Files**: App scripts and components
- **CSS Files**: Stylesheets and themes
- **HTML Files**: App shell and pages
- **Assets**: Images, icons, and other static resources
- **Manifest**: PWA manifest file

### 🔧 Service Workers
- **Active Service Workers**: Currently running service workers
- **Waiting Service Workers**: Pending service worker updates
- **Installing Service Workers**: Service workers in the installation process

## How to Clear Data

### Method 1: Data Manager (Recommended)

1. **Open Data Manager**
   - Click the "Data Manager" button in the app
   - The panel will expand to show data management options

2. **Initiate Clear Process**
   - Click the "Clear All" button in the "Danger" section
   - A confirmation dialog will appear

3. **Confirm Clearing**
   - Read the confirmation message carefully
   - Click "Clear All Data" to proceed
   - The app will show a progress message

4. **Wait for Completion**
   - The clearing process takes a few seconds
   - You'll see "All data and cache cleared! Refreshing..."
   - The page will automatically refresh

### Method 2: Browser Console (Advanced)

For developers or advanced users, you can clear data programmatically:

```javascript
// Clear everything (data + cache)
await clearScryptureCache();

// Clear only service worker caches (preserves data)
await clearServiceWorkerCaches();

// Check current cache status
await checkCacheStatus();
```

### Method 3: URL Parameter (Automatic)

Add `?clearCache=true` to the app URL to automatically clear caches:

```
https://scrypture.app?clearCache=true
```

## Technical Implementation

### StorageService.clearAllData()

The enhanced `clearAllData()` method performs a comprehensive reset:

```typescript
async clearAllData(): Promise<boolean> {
  // 1. Clear localStorage items
  const keys = Object.values(STORAGE_KEYS);
  keys.forEach((key) => this.removeItem(key));

  // 2. Clear sessionStorage
  sessionStorage.clear();

  // 3. Clear service worker caches
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );

  // 4. Unregister service workers
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(registration => registration.unregister())
  );

  // 5. Dispatch event for components
  window.dispatchEvent(new CustomEvent('scrypture-data-cleared'));

  return true;
}
```

### Cache Clearing Utilities

Reusable functions in `src/utils/index.ts`:

```typescript
// Clear all caches and optionally storage
export async function clearAllCaches(includeStorage: boolean = false): Promise<boolean>

// Check cache status without clearing
export async function checkCacheStatus(): Promise<void>
```

## User Experience

### Confirmation Dialog

The confirmation dialog clearly explains what will be cleared:

> "Are you sure you want to clear all data? This action cannot be undone and will permanently delete all your tasks, habits, user data, custom categories, and cached files. The app will refresh to ensure a completely fresh start."

### Progress Feedback

Users receive clear feedback during the process:

1. **Starting**: "🧹 Starting complete data clear..."
2. **Progress**: Console logs show each step
3. **Success**: "All data and cache cleared! Refreshing..."
4. **Error**: "Clear failed - some data may remain"

### Automatic Refresh

After successful clearing:
- 2-second delay ensures cache clearing completes
- Page automatically refreshes
- User sees a completely fresh app state

## Benefits

### 🔧 Solves Cache Issues
- **Button Text Problems**: Resolves issues where UI doesn't update after deployment
- **Stale Data**: Ensures users see the latest version of the app
- **Service Worker Conflicts**: Removes outdated service workers

### 📱 Better PWA Experience
- **Fresh Start**: Users get a truly clean slate
- **Performance**: Removes potentially corrupted cached files
- **Reliability**: Ensures app behaves as expected

### 🛠️ Developer Benefits
- **Easy Testing**: Quick way to test fresh app state
- **Debugging**: Clear console logs show what's being cleared
- **Reusable**: Cache utilities can be used elsewhere

## Troubleshooting

### Common Issues

**"Clear failed - some data may remain"**
- Check browser console for specific error messages
- Try refreshing the page and clearing again
- Some browsers may block cache clearing in certain contexts

**Page doesn't refresh after clearing**
- Wait a few more seconds for the process to complete
- Manually refresh the page if needed
- Check if browser is blocking automatic refresh

**Service worker still active after clearing**
- This is normal - new service worker will register on next page load
- Check browser's developer tools → Application → Service Workers
- Force refresh (Ctrl+F5) if needed

### Debugging

Use the console utilities to diagnose issues:

```javascript
// Check what caches exist
await checkCacheStatus();

// Clear only caches (preserve data)
await clearServiceWorkerCaches();

// Force service worker update
await forceUpdate();
```

## Security Considerations

### Data Privacy
- **Complete Removal**: All user data is permanently deleted
- **No Recovery**: Cleared data cannot be recovered
- **Local Only**: Data clearing only affects the local device

### Browser Limitations
- **Private Browsing**: Some browsers may limit cache clearing
- **Storage Quotas**: Very large caches might not clear completely
- **Service Worker Scope**: Some service workers may persist

## Future Enhancements

### Planned Improvements
- **Selective Clearing**: Clear specific data types only
- **Backup Before Clear**: Automatic backup before clearing
- **Progress Indicator**: Visual progress bar during clearing
- **Recovery Options**: Undo functionality for accidental clears

### Integration Opportunities
- **Settings Integration**: Add cache clearing to app settings
- **Automatic Cleanup**: Periodic cache cleanup for performance
- **Version Management**: Automatic cache clearing on app updates

## Related Documentation

- [Service Worker Guide](./service-worker-guide.md)
- [Storage Management](./storage-management.md)
- [PWA Best Practices](./pwa-best-practices.md)
- [Troubleshooting Guide](./troubleshooting-guide.md) 