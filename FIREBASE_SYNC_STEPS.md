# Steps to Trigger Firebase OAuth Client Creation

After deleting the Android OAuth client, follow these steps to ensure Firebase creates/syncs a new one:

## Step 1: Verify Android App in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `appartmanage`
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** section
5. Find your **Android app** (package: `com.tahadeta.appartmanage`)

## Step 2: Re-add SHA Fingerprints (Triggers Sync)

Even if they're already there, re-adding them can trigger Firebase to sync:

1. In the Android app section, scroll to **SHA certificate fingerprints**
2. **Remove** the existing SHA-1 fingerprint (click the X or delete button)
3. **Add it back**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
4. **Save** the changes

This action tells Firebase to sync with Google Cloud Console and should trigger OAuth client creation.

## Step 3: Wait and Check

1. **Wait 5-10 minutes** for Firebase to sync with Google Cloud Console
2. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
3. Check if a new **Android** OAuth client appears (it might be named "Android client (auto created by Firebase)" or similar)

## Alternative: Manual Creation (If Auto-Creation Doesn't Work)

If after 10-15 minutes no Android OAuth client appears, create it manually:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
4. Select **Application type**: **Android**
5. Fill in:
   - **Name**: `AppartManage Android` (or any name)
   - **Package name**: `com.tahadeta.appartmanage` (exact match!)
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
6. Click **CREATE**
7. **Note the Client ID** (you don't need to use it in code, but good to have)

## Step 4: Rebuild and Test

After the OAuth client is created (either automatically or manually):

```bash
# Clean build directories
rm -rf android/app/.cxx android/app/build android/build

# Rebuild
npx expo prebuild --clean --platform android
npx expo run:android
```

Then:
1. **Uninstall** the old app from your device
2. **Reinstall** and test Google Sign-In

## Important Notes

- The **Web OAuth client** (your `webClientId`) should remain untouched
- You're using the **Web Client ID** in your code, which is correct
- The **Android OAuth client** is used automatically by the Google Sign-In SDK
- Both need to exist and be properly configured for it to work

