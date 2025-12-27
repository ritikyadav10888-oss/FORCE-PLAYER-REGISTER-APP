# ✅ FIXED: Development Build Error

## Problem
You got: `CommandError: No development build (com.forcesports.forceapp) for this project is installed`

## Solution
The `eas.json` has been updated to build a **standard APK** instead of a development build.

---

## 🎯 CORRECT COMMAND TO BUILD APK

Run this command:

```bash
eas build -p android --profile preview
```

**NOT** this:
```bash
eas build -p android --profile development  ❌ (This requires dev client)
```

---

## 📋 Complete Build Steps

### 1. Make sure EAS CLI is installed
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
- Create account at https://expo.dev/signup if needed
- FREE account works fine

### 3. Build APK (CORRECT COMMAND)
```bash
eas build -p android --profile preview
```

### 4. Wait for build
- Takes 10-20 minutes
- Build happens on Expo's servers
- You'll get a download link

### 5. Download APK
```
✔ Build finished
📱 https://expo.dev/artifacts/eas/xxxxx.apk
```

Click link → Download APK → Install on Android

---

## 🔧 What Was Fixed

**Before (eas.json):**
```json
{
  "build": {
    "development": {
      "developmentClient": true,  ← This caused the error
      "distribution": "internal"
    }
  }
}
```

**After (eas.json):**
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"  ← Standard APK build
      }
    }
  }
}
```

---

## 🚀 Quick Start (Copy-Paste)

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login
eas login

# Build APK
eas build -p android --profile preview
```

---

## ⚠️ Important Notes

1. **Use `preview` profile** - builds standard APK
2. **Don't use `development` profile** - requires dev client installation
3. **Backend must be running** - APK connects to `http://192.168.0.102:5000/api`
4. **Same WiFi required** - for testing on local network

---

## 📱 After Build Completes

1. Download APK from the link
2. Transfer to Android phone
3. Install APK
4. Make sure:
   - Backend server is running
   - Phone on same WiFi as computer
   - Open app and test!

---

## 🎯 BUILD NOW

```bash
eas build -p android --profile preview
```

This will create a **standard APK** that can be installed on any Android device!

---

## 💡 Alternative: Test Without Building APK

If you just want to test quickly:

1. Install **Expo Go** app from Play Store
2. Run `npm start` in your project
3. Scan QR code with Expo Go
4. App loads instantly!

(But for a real APK to share, use the `eas build` command above)

---

**Ready to build?** Run: `eas build -p android --profile preview`
