# How to Link Google Cloud Project to Firebase

## Important Note

**Firebase projects are automatically Google Cloud projects!** When you create a Firebase project, it automatically creates a Google Cloud project with the same Project ID.

However, if you want to use your new "Appart Management" Google Cloud project with Firebase, here are your options:

## Option 1: Use the Existing Google Cloud Project (Recommended - Easiest)

Your Firebase project `appartmanage` already has a Google Cloud project. It's easier to use that one:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project selector** at the top
3. Search for project ID: `appartmanage` or project number: `953671950972`
4. **Select that project**
5. Create your OAuth clients there

**This is the recommended approach** because:
- It's already linked
- No additional setup needed
- All Firebase resources are already there

## Option 2: Link New Project via Billing (Advanced)

If you really want to use "Appart Management" project, you can try linking it through billing:

### Step 1: Check Current Billing

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **AppartManage**
3. Click ⚙️ **Project Settings**
4. Go to **Usage and billing** tab
5. Check which billing account is linked

### Step 2: Link Billing Account to New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select "Appart Management" project
3. Go to **Billing** → **Account Management**
4. Link the same billing account that Firebase uses

### Step 3: Change Firebase Project's Google Cloud Project

**Note:** This is **NOT directly possible** through the UI. Firebase projects are permanently linked to their Google Cloud project at creation.

**Workaround:** You would need to:
1. Export all your Firebase data/config
2. Create a new Firebase project
3. Import everything back
4. This is **NOT recommended** and very complex

## Option 3: Use Both Projects (Practical Solution)

The **best approach** is to use both projects for their intended purposes:

### Use Firebase's Google Cloud Project for:
- OAuth clients for Firebase Authentication
- API keys for Firebase services
- Any Firebase-related Google Cloud resources

### Use "Appart Management" for:
- Other Google Cloud services not related to Firebase
- Separate projects/experiments
- Different applications

## Recommended: Verify and Use Existing Project

Let's verify which Google Cloud project your Firebase is using:

### Step 1: Find Firebase's Google Cloud Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **AppartManage** project
3. Click ⚙️ **Project Settings**
4. Note:
   - **Project ID**: `appartmanage`
   - **Project number**: `953671950972`

### Step 2: Find It in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **project selector** at the top
3. You should see a project with:
   - **Project ID**: `appartmanage` (or similar)
   - **Project number**: `953671950972`
4. **Select that project**

### Step 3: Verify It's the Right One

In Google Cloud Console → **APIs & Services** → **Credentials**, you should see:
- API keys (if any were auto-created by Firebase)
- Any existing OAuth clients

If you see Firebase-related resources, **this is the correct project!**

## What to Do Next

**Use the existing Google Cloud project** (`appartmanage` or project # `953671950972`) for your OAuth clients. This is the simplest and most reliable approach.

If you don't see it in the project list:
1. Make sure you're logged in with the same Google account
2. Check if you have access to the project
3. The project might be in a different organization

## Summary

**Best Practice:** Use the Google Cloud project that Firebase automatically created. It's already linked and ready to use. You don't need to link a new project - just find and use the existing one!

If you can't find it, let me know and we can troubleshoot access/permissions.

