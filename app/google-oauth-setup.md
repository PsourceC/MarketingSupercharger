# Fix Google OAuth 403 Error - Setup Guide

## 🚨 The Problem
You're getting a **403 error** because the Google OAuth application needs proper configuration in Google Cloud Console.

## 🔧 Quick Fix - Follow These Steps

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)

### Step 2: Configure OAuth Consent Screen
1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Select **"External"** (unless you have a workspace)
3. Fill out the required fields:
   - **App name**: "Astrawatt Solar Dashboard"
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. **Add these scopes**:
   - `https://www.googleapis.com/auth/webmasters.readonly`
   - `https://www.googleapis.com/auth/webmasters`
5. Click **"Save and Continue"**

### Step 3: Update OAuth Credentials
1. Go to **"APIs & Services" → "Credentials"**
2. Click on your OAuth 2.0 Client ID
3. **Add these redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://da6999115c974d4388527cf50744332c-14cf5492-00a1-4a72-bec8-711809.fly.dev/api/auth/google/callback`
4. Click **"Save"**

### Step 4: Enable APIs
1. Go to **"APIs & Services" → "Library"**
2. Search and enable these APIs:
   - **"Google Search Console API"**
   - **"Google My Business API"** (optional for now)

### Step 5: Publish Your App (Important!)
1. Go back to **"OAuth consent screen"**
2. Click **"Publish App"** 
3. Confirm publishing

## 🎯 Alternative: Test Users (Quicker)
If you don't want to publish immediately:
1. Go to **"OAuth consent screen" → "Test users"**
2. Add your email address as a test user
3. This allows you to test without publishing

## ✅ After Configuration
1. Wait 5-10 minutes for changes to propagate
2. Try the **"Connect Google Search Console"** button again
3. You should now see the proper Google consent screen instead of 403

## 🔍 Verify Setup
Your OAuth application should have:
- ✅ Consent screen configured
- ✅ Correct redirect URIs 
- ✅ Required APIs enabled
- ✅ App published OR your email as test user

## 💡 Still Getting 403?
If you still see 403 after setup:
1. Check that your Google account has access to Search Console for astrawatt.com
2. Verify you're using the same Google account for both Cloud Console and Search Console
3. Try again in an incognito/private browser window

Let me know when you've completed these steps and I'll help test the connection!
