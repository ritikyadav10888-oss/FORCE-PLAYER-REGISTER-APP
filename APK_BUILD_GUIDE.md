# 📱 Force Sports - APK Build & Release Guide

## Prerequisites
Before building the APK, ensure you have:
- ✅ Expo CLI installed globally: `npm install -g expo-cli`
- ✅ EAS CLI installed: `npm install -g eas-cli`
- ✅ Expo account (free): https://expo.dev/signup

## Option 1: Quick APK Build (Recommended for Testing)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
Enter your Expo credentials (create account at expo.dev if needed)

### Step 3: Configure EAS Build
```bash
eas build:configure
```
This will create `eas.json` configuration file.

### Step 4: Build APK
```bash
eas build -p android --profile preview
```

**What happens:**
- Expo cloud servers build your APK
- Takes 10-20 minutes
- You'll get a download link when complete
- APK can be installed directly on Android devices

### Step 5: Download APK
Once build completes, you'll see:
```
✔ Build finished
📱 Install the build on a device:
https://expo.dev/artifacts/eas/[your-build-id].apk
```

Click the link to download the APK file.

---

## Option 2: Local APK Build (Advanced)

### Requirements:
- Android Studio installed
- Android SDK configured
- Java JDK 11+

### Steps:
```bash
# 1. Install dependencies
npm install

# 2. Prebuild native code
npx expo prebuild

# 3. Build APK locally
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Option 3: Expo Go Testing (No APK Needed)

For quick testing without building APK:

### Step 1: Install Expo Go on Android
- Download from Google Play Store: "Expo Go"

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Scan QR Code
- Open Expo Go app
- Scan the QR code from terminal
- App loads instantly for testing

---

## APK Configuration (Already Done ✅)

Your `app.json` is configured with:
```json
{
  "expo": {
    "name": "force-app",
    "slug": "force-app",
    "version": "1.0.0",
    "android": {
      "package": "com.forcesports.forceapp",
      "adaptiveIcon": {
        "backgroundColor": "#FFFFFF",
        "foregroundImage": "./assets/force_logo.png"
      }
    }
  }
}
```

---

## Important: Update API URL for Production

Before building APK, update the API URL in `src/config.js`:

### Current (Development):
```javascript
export const API_URL = 'http://localhost:5000/api';
```

### For Production APK:
```javascript
// Replace with your actual server IP or domain
export const API_URL = 'http://192.168.0.102:5000/api'; // Local network
// OR
export const API_URL = 'https://your-domain.com/api'; // Production server
```

**Important:** Android apps cannot access `localhost`. You need:
1. Your computer's local IP (for testing on same network)
2. A deployed backend server (for production release)

---

## Recommended Build Process

### For Testing (Internal Use):
```bash
# 1. Update API_URL to your computer's IP
# Edit src/config.js: export const API_URL = 'http://192.168.0.102:5000/api';

# 2. Build preview APK
eas build -p android --profile preview

# 3. Download and install on Android device
# Both device and computer must be on same WiFi network
```

### For Production Release:
```bash
# 1. Deploy backend to a server (Heroku, AWS, DigitalOcean, etc.)
# 2. Update API_URL to production server URL
# 3. Build production APK
eas build -p android --profile production

# 4. Submit to Google Play Store (optional)
eas submit -p android
```

---

## EAS Build Profiles

Create `eas.json` in project root:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Quick Start Commands

### 1. First Time Setup:
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Build APK:
```bash
eas build -p android --profile preview
```

### 3. Check Build Status:
```bash
eas build:list
```

---

## Troubleshooting

### "Backend not accessible from APK"
- Update `API_URL` in `src/config.js` to your computer's IP
- Ensure backend server is running
- Both devices on same WiFi network

### "Build failed"
- Check `app.json` is valid JSON
- Ensure all assets exist (icon, splash screen)
- Check Expo account has build credits

### "APK won't install"
- Enable "Install from Unknown Sources" on Android
- Ensure APK is for correct architecture (arm64-v8a)

---

## Next Steps

1. **Choose build method** (EAS recommended)
2. **Update API_URL** for production
3. **Run build command**
4. **Download APK**
5. **Install on Android device**
6. **Test all features**

---

## Support & Resources

- **Expo Docs**: https://docs.expo.dev/build/setup/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Android Publishing**: https://docs.expo.dev/submit/android/

---

## Cost

- **EAS Build (Free Tier)**: 30 builds/month
- **Paid Plans**: Unlimited builds from $29/month
- **Local Builds**: Free (requires Android Studio setup)

---

**Ready to build?** Run: `eas build -p android --profile preview`
