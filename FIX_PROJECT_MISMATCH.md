# Fix: Working in Wrong Google Cloud Project

## The Situation

- Your **Firebase project** is: `appartmanage` (Project #: 953671950972)
- You created a **new Google Cloud project**: "Appart Management"
- You were working in a **different project** before

## Solution: Use the Correct Project

Firebase projects automatically create a Google Cloud project with the same Project ID. You need to use the Google Cloud project that matches your Firebase project.

## Step 1: Find Your Firebase's Google Cloud Project

Your Firebase project `appartmanage` should have a corresponding Google Cloud project. Let's find it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project selector** at the top (next to "Google Cloud")
3. Look for a project with:
   - **Project ID**: `appartmanage` (or similar)
   - **Project number**: `953671950972`
4. If you see it, **select it**

## Step 2: If You Don't See It

If you don't see a project matching your Firebase project, it might be:
- Under a different name
- In a different organization/account

**Check Firebase Console:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **AppartManage**
3. Click ⚙️ **Project Settings**
4. Look at **Project ID**: `appartmanage`
5. This is the Google Cloud project ID you need to use

## Step 3: Create OAuth Clients in the Correct Project

Once you've selected the correct project in Google Cloud Console:

1. Go to **APIs & Services** → **Credentials**
2. You should see your existing OAuth clients (Web, iOS) if they were created in the correct project
3. Create the Android OAuth client here:
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Android**
   - Package name: `com.tahadeta.appartmanage`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

## Step 4: About the "Appart Management" Project You Created

You have two options:

### Option A: Delete the New Project (Recommended)
If you just created "Appart Management" and haven't used it:
1. Go to Google Cloud Console
2. Select "Appart Management" project
3. Go to **IAM & Admin** → **Settings**
4. Delete the project (if you don't need it)

### Option B: Keep It Separate
If you want to keep it for other purposes, just make sure you're working in the **correct project** (`appartmanage`) when creating OAuth clients for Firebase.

## Important: Verify You're in the Right Project

**Always check the project selector** in Google Cloud Console shows:
- Project matching your Firebase project ID: `appartmanage`
- Or project number: `953671950972`

## Quick Checklist

- [ ] Selected the correct Google Cloud project (matching Firebase project `appartmanage`)
- [ ] Verified project number matches: `953671950972`
- [ ] Created Android OAuth client in the correct project
- [ ] Web OAuth client exists in the correct project
- [ ] All OAuth clients are in the same project as Firebase

