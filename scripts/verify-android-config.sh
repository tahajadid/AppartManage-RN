#!/bin/bash

# Script to verify Android configuration for Google Sign-In
echo "=== Android Configuration Verification ==="
echo ""

echo "1. Checking package name in app.json..."
PACKAGE_JSON=$(grep -A 1 '"package"' app.json | grep -o '"[^"]*"' | head -1 | tr -d '"')
echo "   Package in app.json: $PACKAGE_JSON"
echo ""

echo "2. Checking package name in build.gradle..."
PACKAGE_GRADLE=$(grep "applicationId" android/app/build.gradle | grep -o "'[^']*'" | head -1 | tr -d "'")
echo "   Package in build.gradle: $PACKAGE_GRADLE"
echo ""

echo "3. Getting SHA-1 fingerprint from debug keystore..."
SHA1=$(keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA1:" | tail -1 | sed 's/^[[:space:]]*//')
echo "   SHA-1: $SHA1"
echo ""

echo "4. Getting SHA-256 fingerprint from debug keystore..."
SHA256=$(keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA256:" | tail -1 | sed 's/^[[:space:]]*//')
echo "   SHA-256: $SHA256"
echo ""

echo "=== Expected Values ==="
echo "Package name: com.tahadeta.appartmanage"
echo "SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25"
echo "SHA-256: FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
echo ""

echo "=== Verification ==="
if [ "$PACKAGE_JSON" = "com.tahadeta.appartmanage" ] && [ "$PACKAGE_GRADLE" = "com.tahadeta.appartmanage" ]; then
    echo "✅ Package names match"
else
    echo "❌ Package names DO NOT match!"
    echo "   app.json: $PACKAGE_JSON"
    echo "   build.gradle: $PACKAGE_GRADLE"
fi

if [ "$SHA1" = "SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25" ]; then
    echo "✅ SHA-1 matches"
else
    echo "❌ SHA-1 DOES NOT match!"
    echo "   Current: $SHA1"
    echo "   Expected: SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Verify these values match in Firebase Console (Android app)"
echo "2. Verify these values match in Google Cloud Console (Android OAuth client)"
echo "3. Make sure the Android OAuth client was created by Firebase, not manually"
echo "4. Wait 5-10 minutes after making changes"
echo "5. Rebuild the app: npx expo run:android"

