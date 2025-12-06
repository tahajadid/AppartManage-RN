#!/bin/bash

# Script to clean and rebuild Android app for Google Sign-In
echo "Cleaning Android build directories..."
rm -rf android/app/.cxx android/app/build android/build

echo ""
echo "Running Expo prebuild..."
npx expo prebuild --clean --platform android

echo ""
echo "Building and running Android app..."
npx expo run:android

echo ""
echo "Done! Make sure to:"
echo "1. Uninstall the old app from your device"
echo "2. The new app will be installed automatically"
echo "3. Try Google Sign-In again"

