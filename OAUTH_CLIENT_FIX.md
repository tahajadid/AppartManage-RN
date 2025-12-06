# Fixing DEVELOPER_ERROR After Adding Android App

If you've added the Android app to Firebase with SHA fingerprints but still get DEVELOPER_ERROR, the issue is likely in **Google Cloud Console OAuth Client configuration**.

## The Problem

Firebase and Google Cloud Console need to be in sync. When you add an Android app to Firebase, it should automatically create/update an OAuth client, but sometimes you need to verify and configure it manually.

## Step-by-Step Fix

### Step 1: Verify OAuth Client in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `appartmanage` (Project ID: `appartmanage`, Project Number: `953671950972`)
3. Navigate to **APIs & Services** → **Credentials**
4. Look for OAuth 2.0 Client IDs. You should see:
   - A **Web client** (ending with `...78lpbnui1il0h2glanuimqk3p6lpm04q.apps.googleusercontent.com`)
   - An **Android client** (should have been created when you added Android app to Firebase)

### Step 2: Check/Create Android OAuth Client

If you **don't see an Android OAuth client**:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **Android**
4. Fill in:
   - **Name**: `AppartManage Android` (or any name)
   - **Package name**: `com.tahadeta.appartmanage` (must match exactly!)
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click **CREATE**
6. **Note the Client ID** - it will look like: `923121999711-xxxxxxxxxxxxx.apps.googleusercontent.com`

### Step 3: Verify Web Client Configuration

The `webClientId` you're using in code should be the **Web client ID**, not the Android client ID. Verify:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Find the **Web client** (ending with `...78lpbnui1il0h2glanuimqk3p6lpm04q.apps.googleusercontent.com`)
3. Click to edit it
4. Under **Authorized JavaScript origins**, make sure you have:
   - `https://appartmanage.firebaseapp.com`
   - `https://appartmanage.web.app`
5. Under **Authorized redirect URIs**, you should have Firebase redirect URIs
6. **Save** if you made changes

### Step 4: Verify Android OAuth Client Has Correct Package Name

1. Find the **Android OAuth client** in Google Cloud Console
2. Click to edit it
3. Verify:
   - **Package name**: `com.tahadeta.appartmanage` (exact match!)
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
4. If anything is wrong, fix it and **Save**

### Step 5: Enable Required APIs

Make sure these APIs are enabled:

1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - **Google Sign-In API** (if not already enabled)
   - **Identity Toolkit API** (Firebase Auth uses this)

### Step 6: Wait and Rebuild

1. **Wait 5-10 minutes** for changes to propagate
2. **Clean and rebuild** your app:
   ```bash
   # Clean Android build
   cd android
   ./gradlew clean
   cd ..
   
   # Rebuild
   npx expo prebuild --clean
   npx expo run:android
   ```
3. **Uninstall the old app** from your device
4. **Reinstall** and test again

## Important Notes

### About webClientId vs Android Client ID

- For React Native Google Sign-In, you use the **Web Client ID** (`webClientId`) in your code
- The **Android OAuth Client** is used automatically by Google Sign-In SDK
- Both need to be properly configured with the correct package name and SHA fingerprints

### Common Issues

1. **Package name mismatch**: Must be exactly `com.tahadeta.appartmanage` everywhere
2. **SHA fingerprint not added**: Must be in both Firebase AND Google Cloud Console
3. **OAuth client not created**: Firebase should create it, but sometimes you need to create it manually
4. **Changes not propagated**: Wait 5-10 minutes after making changes

### Verification Checklist

- [ ] Android app added to Firebase Console
- [ ] SHA-1 fingerprint added in Firebase Console (Android app)
- [ ] SHA-256 fingerprint added in Firebase Console (Android app)
- [ ] Android OAuth client exists in Google Cloud Console
- [ ] Android OAuth client has correct package name: `com.tahadeta.appartmanage`
- [ ] Android OAuth client has correct SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] Web OAuth client exists and is configured
- [ ] Google Sign-In API is enabled
- [ ] Identity Toolkit API is enabled
- [ ] App rebuilt after changes
- [ ] Old app uninstalled from device

## Still Not Working?

If it still doesn't work after all these steps:

1. **Double-check package name** in:
   - `app.json` → `android.package`
   - `android/app/build.gradle` → `applicationId`
   - Firebase Console → Android app
   - Google Cloud Console → Android OAuth client
   - All must be exactly: `com.tahadeta.appartmanage`

2. **Verify SHA fingerprints** match in:
   - Firebase Console → Android app → SHA fingerprints
   - Google Cloud Console → Android OAuth client → SHA-1

3. **Check the error logs** - The updated `authService.ts` now logs full error details to console

4. **Try creating a new OAuth client** - Sometimes deleting and recreating helps

