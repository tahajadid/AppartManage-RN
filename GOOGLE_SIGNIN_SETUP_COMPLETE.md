# Complete Google Sign-In Setup Guide (From Scratch)

## Prerequisites
- ✅ Firebase project: `appartmanage` (already set up)
- ✅ Google Cloud project: "Appart Management" (just created)
- ✅ React Native app with package name: `com.tahadeta.appartmanage`

## Step 1: Link Firebase Project to Google Cloud Project

### Option A: If Firebase Project Already Has a Google Cloud Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **AppartManage**
3. Click ⚙️ **Project Settings**
4. Note the **Project ID**: `appartmanage`
5. Note the **Project number**: `953671950972`

6. Go to [Google Cloud Console](https://console.cloud.google.com/)
7. Click the **project selector** at the top
8. Search for project ID `appartmanage` or project number `953671950972`
9. **Select that project** (this is the Google Cloud project linked to Firebase)

### Option B: If You Need to Use Your New "Appart Management" Project

If you want to use the new "Appart Management" project instead:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **AppartManage**
3. Click ⚙️ **Project Settings**
4. Scroll to **Your project** section
5. Look for **Link to Google Cloud project** or **Change billing account**
6. Follow the prompts to link to "Appart Management" project

**Note:** It's easier to use the existing Google Cloud project that Firebase created automatically.

## Step 2: Add Android App to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **AppartManage**
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** section
5. Click the **Android icon** (or "Add app" → "Android")

6. Fill in the registration form:
   - **Android package name**: `com.tahadeta.appartmanage`
   - **App nickname** (optional): `AppartManage-Android`
   - **Debug signing certificate SHA-1** (optional for now - we'll add it next)
7. Click **Register app**
8. **Skip downloading `google-services.json`** - Expo handles this automatically

## Step 3: Get SHA Fingerprints from Your Keystore

Run this command to get your SHA fingerprints:

```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

You should see:
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **SHA-256**: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`

## Step 4: Add SHA Fingerprints to Firebase

1. In Firebase Console → **Project Settings** → **Your apps** → **Android app**
2. Scroll to **SHA certificate fingerprints** section
3. Click **Add fingerprint**
4. Add **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click **Add fingerprint** again
6. Add **SHA-256**: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
7. Both should now be listed

## Step 5: Enable Required APIs in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Make sure you're in the correct project** (the one linked to Firebase)
3. Navigate to **APIs & Services** → **Library**
4. Search for and enable:
   - **Google Sign-In API** - Click on it → **Enable**
   - **Identity Toolkit API** - Click on it → **Enable**

## Step 6: Create OAuth 2.0 Client IDs

### 6a. Create Web OAuth Client (for webClientId)

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen first:
   - User Type: **External** (or Internal if you have Google Workspace)
   - App name: `AppartManage`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Click **Save and Continue**
   - Test users: Add your email, Click **Save and Continue**
   - Click **Back to Dashboard**

4. Now create OAuth client:
   - Application type: **Web application**
   - Name: `AppartManage Web`
   - Authorized JavaScript origins: 
     - `https://appartmanage.firebaseapp.com`
     - `https://appartmanage.web.app`
   - Authorized redirect URIs:
     - `https://appartmanage.firebaseapp.com/__/auth/handler`
     - `https://appartmanage.web.app/__/auth/handler`
   - Click **CREATE**
5. **Copy the Client ID** - You'll need this! It looks like: `923121999711-xxxxxxxxxxxxx.apps.googleusercontent.com`

### 6b. Create Android OAuth Client

1. Still in **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Android**
4. Fill in:
   - **Name**: `AppartManage Android`
   - **Package name**: `com.tahadeta.appartmanage` (exact match!)
   - **SHA-1 certificate fingerprint**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
5. Click **CREATE**
6. Note: You don't need to copy this Client ID - it's used automatically

### 6c. Create iOS OAuth Client (Optional, for iOS support)

1. Still in **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **iOS**
4. Fill in:
   - **Name**: `AppartManage iOS`
   - **Bundle ID**: `com.tahadeta.appartmanage`
5. Click **CREATE**
6. **Copy the Client ID** - You'll need this for iOS

## Step 7: Update Your Code

### 7a. Update authService.ts

Update the `webClientId` and `iosClientId` in `services/authService.ts`:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // From Step 6a
  iosClientId: 'YOUR_IOS_CLIENT_ID_HERE', // From Step 6c (if you created it)
});
```

Replace:
- `YOUR_WEB_CLIENT_ID_HERE` with the Web Client ID from Step 6a
- `YOUR_IOS_CLIENT_ID_HERE` with the iOS Client ID from Step 6c (if created)

### 7b. Verify app.json Configuration

Your `app.json` should have:
```json
{
  "expo": {
    "android": {
      "package": "com.tahadeta.appartmanage"
    },
    "ios": {
      "bundleIdentifier": "com.tahadeta.appartmanage"
    },
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}
```

Replace `YOUR_IOS_CLIENT_ID` in `iosUrlScheme` with your iOS Client ID (the part after the dash, e.g., if Client ID is `923121999711-abc123`, use `923121999711-abc123`).

## Step 8: Rebuild Your App

1. Clean build directories:
   ```bash
   rm -rf android/app/.cxx android/app/build android/build
   ```

2. Run prebuild:
   ```bash
   npx expo prebuild --clean --platform android
   ```

3. Build and run:
   ```bash
   npx expo run:android
   ```

## Step 9: Test

1. **Uninstall** any old version of the app from your device
2. The new app will be installed automatically
3. Try Google Sign-In
4. It should work! 🎉

## Troubleshooting

### If you get DEVELOPER_ERROR:

1. **Wait 5-10 minutes** after creating OAuth clients (they need time to propagate)
2. **Verify package name** matches exactly in:
   - `app.json` → `android.package`
   - `android/app/build.gradle` → `applicationId`
   - Firebase Console → Android app
   - Google Cloud Console → Android OAuth client
3. **Verify SHA-1** matches exactly in:
   - Firebase Console → Android app
   - Google Cloud Console → Android OAuth client
4. **Check you're in the correct Google Cloud project** (the one linked to Firebase)

### If OAuth clients don't appear:

- Make sure you're viewing the correct Google Cloud project
- Wait a few minutes for Firebase to sync
- Refresh the page

## Summary Checklist

- [ ] Firebase project set up
- [ ] Google Cloud project selected (linked to Firebase)
- [ ] Android app added to Firebase
- [ ] SHA-1 and SHA-256 fingerprints added to Firebase
- [ ] Google Sign-In API enabled
- [ ] Identity Toolkit API enabled
- [ ] Web OAuth client created
- [ ] Android OAuth client created
- [ ] iOS OAuth client created (optional)
- [ ] Code updated with correct Client IDs
- [ ] App rebuilt
- [ ] Tested on device

## Important Notes

- **webClientId**: Use the **Web** OAuth client ID (not Android)
- **Package name**: Must match exactly everywhere (`com.tahadeta.appartmanage`)
- **SHA-1**: Must match exactly in Firebase and Google Cloud Console
- **Wait time**: Changes can take 5-10 minutes to propagate
- **Project**: Always verify you're in the correct Google Cloud project

