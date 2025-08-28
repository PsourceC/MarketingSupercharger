# Fix "accounts.google.com refused to connect" Error

## 🚨 The Problem
Google OAuth is blocking the connection because your deployment URL isn't configured as an authorized redirect URI.

## 🔧 Quick Fix for Fly.dev Deployment

### Step 1: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services" → "Credentials"**
3. Click on your OAuth 2.0 Client ID
4. **Add this redirect URI**:
   ```
   https://da6999115c974d4388527cf50744332c-14cf5492-00a1-4a72-bec8-711809.fly.dev/api/auth/google/callback
   ```
5. **Also keep the localhost URI** for local development:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Click **"Save"**

### Step 2: Wait and Retry
- Wait 5-10 minutes for changes to propagate
- Clear your browser cache
- Try the "Connect Google Search Console" button again

## 🎯 Alternative: Use Sample Data While Fixing OAuth

**Instead of fighting with OAuth right now:**
1. **Click "📊 Load Sample Data"** button in your dashboard
2. **See realistic Astrawatt.com performance data** immediately
3. **Explore the full dashboard functionality**
4. **Set up real OAuth later** when you have time

## 🔍 Why This Error Happens

**"accounts.google.com refused to connect"** means:
- ✅ Your OAuth app is configured (no 403 error anymore)
- ❌ The current URL isn't in the allowed redirect list
- ❌ Google's security policies are blocking the iframe/popup

## 🚀 Recommended Workflow

### For Right Now (5 minutes):
1. **Click "Load Sample Data"** to see your dashboard working
2. **Review the realistic metrics** for Astrawatt.com
3. **Test all dashboard features** with sample data

### For Later (10 minutes):
1. **Add the Fly.dev redirect URI** to Google Cloud Console
2. **Test the OAuth connection** 
3. **Switch from sample to real data**

## 💡 Pro Tips

**Sample Data Shows:**
- ✅ Average search position: 12.3 
- ✅ Monthly clicks: 89
- ✅ Click-through rate: 3.13%
- ✅ Keyword performance by location
- ✅ All dashboard features working

**This lets you:**
- See exactly how your dashboard will look
- Test all functionality 
- Make decisions about what other data sources to connect
- Set up OAuth properly when you have time

## 🔄 Next Steps

**Option A: Quick Demo**
→ Click "Load Sample Data" now and explore

**Option B: Fix OAuth** 
→ Update Google Cloud Console redirect URIs first

**Option C: Both**
→ Load sample data to see functionality, fix OAuth for real data later

The sample data is based on realistic solar company metrics, so you'll get a true sense of how powerful your dashboard will be once connected to real data sources.
