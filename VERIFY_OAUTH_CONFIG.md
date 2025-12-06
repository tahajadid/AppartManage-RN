# Verify OAuth Configuration - DEVELOPER_ERROR Fix

You're getting DEVELOPER_ERROR (code 10) which means there's a mismatch between your app configuration and Google's OAuth setup.

## Critical Verification Steps

### 1. Verify Android OAuth Client in Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**

**Check your Android OAuth client:**
- **Package name** must be exactly: `com.tahadeta.appartmanage` (no spaces, exact match)
- **SHA-1** must be exactly: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Client ID** should be visible (note it down)

### 2. Verify Firebase Android App Configuration

Go to [Firebase Console](https://console.firebase.google.com/) → **Project Settings** → **Your apps** → **Android app**

**Check:**
- **Package name**: `com.tahadeta.appartmanage`
- **SHA-1 fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **SHA-256 fingerprint**: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

### 3. Common Issues and Fixes

#### Issue A: OAuth Client Created Manually vs Firebase-Generated

**Problem:** If you created the Android OAuth client manually in Google Cloud Console, it might not be properly linked to Firebase.

**Solution:** 
1. Delete the manually created Android OAuth client in Google Cloud Console
2. Go to Firebase Console → Project Settings → Your apps → Android app
3. Make sure SHA fingerprints are added there
4. Firebase should automatically create/link the OAuth client
5. Wait 5-10 minutes for sync

#### Issue B: Package Name Mismatch

**Check these locations - ALL must match exactly:**
- `app.json` → `android.package`: `com.tahadeta.appartmanage`
- `android/app/build.gradle` → `applicationId`: `com.tahadeta.appartmanage`
- Firebase Console → Android app → Package name: `com.tahadeta.appartmanage`
- Google Cloud Console → Android OAuth client → Package name: `com.tahadeta.appartmanage`

**Fix:** If any don't match, update them to be exactly the same.

#### Issue C: SHA Fingerprint Mismatch

**Verify SHA-1 in all locations:**
1. Run: `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android`
2. Check the SHA-1 matches: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
3. Verify it's in Firebase Console (Android app)
4. Verify it's in Google Cloud Console (Android OAuth client)

**Fix:** If SHA-1 doesn't match, update it in both Firebase and Google Cloud Console.

#### Issue D: Wrong webClientId

**Current webClientId in code:** `923121999711-78lpbnui1il0h2glanuimqk3p6lpm04q.apps.googleusercontent.com`

**Verify:**
1. Go to Google Cloud Console → Credentials
2. Find the **Web application** OAuth client (not Android)
3. The Client ID should match the webClientId in your code
4. This is correct - you should use the Web Client ID, not the Android Client ID

### 4. Nuclear Option: Recreate Everything

If nothing works, try this:

1. **In Firebase Console:**
   - Delete the Android app
   - Re-add it with package name: `com.tahadeta.appartmanage`
   - Add SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Add SHA-256: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

2. **In Google Cloud Console:**
   - Delete any manually created Android OAuth clients
   - Let Firebase create them automatically (wait 5-10 minutes)

3. **Rebuild app:**
   ```bash
   rm -rf android/app/.cxx android/app/build android/build
   npx expo prebuild --clean --platform android
   npx expo run:android
   ```

4. **Uninstall old app** from device and reinstall

### 5. Enable Required APIs

Make sure these are enabled in Google Cloud Console → **APIs & Services** → **Library**:
- ✅ Google Sign-In API
- ✅ Identity Toolkit API

### 6. Check OAuth Consent Screen

Go to **APIs & Services** → **OAuth consent screen**:
- Must be configured (at least in Testing mode)
- Add your test email if in Testing mode

## Debugging

The updated `authService.ts` now logs configuration details. Check your console/logcat for:
- "Configuring Google Sign-In with:" - shows what's being configured
- "Google Sign-In configured successfully" - confirms configuration worked
- Full error details if sign-in fails

## Still Not Working?

1. **Double-check package name** - it's case-sensitive and must match exactly everywhere
2. **Verify SHA-1** - run the keytool command again and compare
3. **Wait longer** - changes can take 10-15 minutes to propagate
4. **Check for typos** - one character difference will cause DEVELOPER_ERROR
5. **Try a different Google account** - sometimes cached auth state causes issues

