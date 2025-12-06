#!/bin/bash

# Script to get SHA-1 and SHA-256 fingerprints from Android debug keystore
# Usage: ./scripts/get-sha-fingerprints.sh

echo "Getting SHA fingerprints from debug keystore..."
echo ""

KEYSTORE_PATH="android/app/debug.keystore"
KEYSTORE_PASSWORD="android"
KEY_ALIAS="androiddebugkey"
KEY_PASSWORD="android"

if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "Error: Keystore file not found at $KEYSTORE_PATH"
    exit 1
fi

echo "SHA-1 Fingerprint:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep -A 1 "SHA1:" | tail -1 | sed 's/^[[:space:]]*//'

echo ""
echo "SHA-256 Fingerprint:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" 2>/dev/null | grep -A 1 "SHA256:" | tail -1 | sed 's/^[[:space:]]*//'

echo ""
echo "Copy these fingerprints and add them to Firebase Console:"
echo "1. Go to Firebase Console → Project Settings → Your apps → Android app"
echo "2. Click 'Add fingerprint'"
echo "3. Paste the SHA-1 and SHA-256 fingerprints"
echo "4. Save and rebuild your app"

