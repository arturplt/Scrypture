# Google Play Store Release Guide for Scrypture

## Overview
This guide will help you release your Scrypture PWA to the Google Play Store. Your app is already a Progressive Web App (PWA) with a proper manifest.json, which makes the conversion process straightforward.

## Method 1: PWA Builder (Recommended - Easiest)

### Step 1: Use PWA Builder
1. Go to [PWA Builder](https://www.pwabuilder.com/)
2. Enter your app URL: `https://scrypture.app`
3. Click "Build My PWA"
4. Download the Android Package (APK/AAB)

### Step 2: Google Play Console Setup
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in app details:
   - **App name**: Scrypture - Mystical Habit Tracking
   - **Short description**: Your mystical habit-tracking companion with the Ancient Bóbr
   - **Full description**: [Use your existing description]
   - **Category**: Productivity
   - **Content rating**: 3+ (General)

### Step 3: Upload Your App
1. Upload the APK/AAB file from PWA Builder
2. Add screenshots (use your existing screenshots)
3. Add app icon (use your existing icon-512.png)
4. Set up store listing

## Method 2: Capacitor (More Control)

### Prerequisites
- Install [Android Studio](https://developer.android.com/studio)
- Install [Java JDK 17](https://adoptium.net/)
- Set JAVA_HOME environment variable

### Step 1: Install Dependencies
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor
```bash
npx cap init Scrypture app.scrypture.twa --web-dir=dist
npx cap add android
```

### Step 3: Build and Sync
```bash
npm run build
npx cap sync android
npx cap build android
```

### Step 4: Open in Android Studio
```bash
npx cap open android
```

### Step 5: Generate Signed APK/AAB
1. In Android Studio: Build → Generate Signed Bundle/APK
2. Choose "Android App Bundle" (recommended for Play Store)
3. Create a new keystore or use existing one
4. Build the release version

## Method 3: Bubblewrap (Google's Official Tool)

### Prerequisites
- Node.js 16+
- Java JDK 11+

### Step 1: Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Step 2: Initialize Project
```bash
bubblewrap init --manifest https://scrypture.app/manifest.json
```

### Step 3: Build APK
```bash
bubblewrap build
```

## Google Play Store Requirements

### App Bundle Requirements
- **Target API Level**: 33 (Android 13) or higher
- **Minimum API Level**: 21 (Android 5.0) or higher
- **App Bundle**: Required (APK uploads deprecated)

### Content Rating
- **Category**: Productivity
- **Rating**: 3+ (General)
- **Content**: No violence, gambling, or adult content

### Privacy Policy
- Required for all apps
- Must be accessible from Play Store listing
- Should cover data collection and usage

### App Signing
- Use Google Play App Signing (recommended)
- Upload your upload key to Play Console
- Google will sign your app for distribution

## Store Listing Requirements

### Required Assets
- **App Icon**: 512x512 PNG (you have this)
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: 
  - Phone: 1080x1920 or 1920x1080
  - Tablet: 1920x1200 or 1200x1920
- **App Description**: Compelling description of features
- **Keywords**: Relevant search terms

### App Information
- **App Name**: Scrypture - Mystical Habit Tracking
- **Short Description**: Your mystical habit-tracking companion with the Ancient Bóbr
- **Full Description**: [Expand on features, benefits, etc.]
- **Category**: Productivity
- **Tags**: habit tracking, productivity, gamification, AI companion

## Testing Before Release

### Internal Testing
1. Upload APK/AAB to Play Console
2. Add testers by email
3. Test on various devices
4. Fix any issues found

### Closed Testing
1. Create a closed testing track
2. Add more testers
3. Gather feedback
4. Make improvements

### Open Testing
1. Create an open testing track
2. Anyone can join via link
3. Gather broader feedback
4. Finalize for production

## Release Checklist

### Before Upload
- [ ] App builds successfully
- [ ] All features work on Android
- [ ] App icon and screenshots ready
- [ ] Privacy policy written and hosted
- [ ] App description and metadata ready
- [ ] Content rating questionnaire completed

### After Upload
- [ ] App passes Play Console validation
- [ ] Content rating approved
- [ ] Store listing approved
- [ ] App bundle signed correctly
- [ ] Internal testing completed
- [ ] Ready for production release

## Common Issues and Solutions

### Build Issues
- **Java not found**: Install JDK 17 and set JAVA_HOME
- **Gradle sync failed**: Check internet connection and try again
- **Signing issues**: Use Google Play App Signing

### Play Console Issues
- **App rejected**: Check content rating and policy compliance
- **Metadata rejected**: Ensure descriptions match app functionality
- **Screenshots rejected**: Use actual app screenshots, not mockups

## Post-Release

### Monitor Performance
- Track installs and uninstalls
- Monitor crash reports
- Analyze user feedback
- Track app performance metrics

### Updates
- Plan regular updates
- Test thoroughly before release
- Use staged rollouts for major updates
- Monitor for issues after release

## Resources

- [Google Play Console](https://play.google.com/console)
- [PWA Builder](https://www.pwabuilder.com/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [Android Developer Documentation](https://developer.android.com/)

## Next Steps

1. Choose your preferred method (PWA Builder recommended for simplicity)
2. Follow the step-by-step instructions
3. Test thoroughly before release
4. Submit to Google Play Console
5. Monitor and iterate based on user feedback

Good luck with your release! 🚀 