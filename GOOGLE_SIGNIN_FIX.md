# Google Sign-In Android DEVELOPER_ERROR Fix

## Problem
You're getting `DEVELOPER_ERROR` when trying to sign in with Google on Android. 

**Root Cause:** You only have a **Web Application** registered in Firebase, but you need an **Android Application** registered for Google Sign-In to work on Android devices.

## Solution

### Step 1: Add Android App to Firebase Console

Since you only have a Web app registered, you need to add an Android app first:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `appartmanage`
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project Settings**
5. Scroll down to **Your apps** section
6. Click the **Android icon** (or "Add app" → "Android") to add a new Android app
7. Fill in the registration form:
   - **Android package name**: `com.tahadeta.appartmanage` (must match exactly!)
   - **App nickname** (optional): `AppartManage-Android`
   - **Debug signing certificate SHA-1** (optional for now, we'll add it in next step)
8. Click **Register app**
9. **Skip downloading `google-services.json`** - Expo handles this automatically

### Step 2: Add SHA Fingerprints to the Android App

Your debug keystore fingerprints are:
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **SHA-256**: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

**To add them:**

1. In Firebase Console, go to **Project Settings** → **Your apps**
2. Find your newly added **Android app** (should show package: `com.tahadeta.appartmanage`)
3. Click on it to view details
4. Scroll to **SHA certificate fingerprints** section
5. Click **Add fingerprint** button
6. Add the **SHA-1** fingerprint: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
7. Click **Add fingerprint** again and add the **SHA-256** fingerprint: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
8. Both fingerprints should now be listed

### Step 3: Verify OAuth Client Configuration

1. In Firebase Console, go to **Project Settings** → **Your apps** → Android app
2. Scroll to **SHA certificate fingerprints** - you should see both fingerprints listed
3. Go to [Google Cloud Console](https://console.cloud.google.com/)
4. Navigate to **APIs & Services** → **Credentials**
5. Find your OAuth 2.0 Client ID (the one ending with `...78lpbnui1il0h2glanuimqk3p6lpm04q.apps.googleusercontent.com`)
6. Click on it to edit
7. Under **Authorized redirect URIs**, make sure you have:
   - `com.tahadeta.appartmanage:/oauth2redirect`
8. Under **Package name**, verify it matches: `com.tahadeta.appartmanage`

### Step 4: Rebuild the App

After adding the fingerprints, you need to rebuild the app:

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npx expo prebuild --clean
npx expo run:android
```

### Step 5: Test

1. Uninstall the app from your device (to clear any cached authentication state)
2. Reinstall and try Google Sign-In again

## Why You Need Separate Apps for Each Platform

Firebase requires you to register **separate apps** for each platform:
- **Web App**: For web browsers (what you already have)
- **Android App**: For Android devices (what you need to add)
- **iOS App**: For iOS devices (optional, but recommended if you plan to support iOS)

Each platform has different configuration requirements:
- Android needs SHA certificate fingerprints
- iOS needs bundle identifier and sometimes APNs certificates
- Web needs different OAuth settings

## Additional Notes

- The fingerprints are from your **debug keystore** (`android/app/debug.keystore`)
- For production builds, you'll need to add fingerprints from your **release keystore** as well
- It can take a few minutes for Firebase to propagate the changes
- Make sure your package name in `app.json` matches exactly: `com.tahadeta.appartmanage`
- **Important**: You don't need to download `google-services.json` - Expo handles the configuration automatically through the plugin in `app.json`

## If It Still Doesn't Work

1. **Double-check the package name** in:
   - `app.json` → `android.package`
   - `android/app/build.gradle` → `applicationId`
   - Firebase Console → Android app package name
   - All should be exactly: `com.tahadeta.appartmanage`

2. **Verify the webClientId** in `services/authService.ts`:
   - Should be: `923121999711-78lpbnui1il0h2glanuimqk3p6lpm04q.apps.googleusercontent.com`
   - This should match the OAuth Client ID in Google Cloud Console

3. **Check Google Sign-In API is enabled**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google Sign-In API" and make sure it's enabled

4. **Wait a few minutes** - Firebase changes can take 5-10 minutes to propagate

