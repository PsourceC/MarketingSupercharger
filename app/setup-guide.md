# Solar Business Dashboard - API Setup Guide

## 🔧 Quick Start: Connect Your Data Sources

### Step 1: Database Setup (5 minutes)
**Connect to Neon Database**: [Connect to Neon](#open-mcp-popover)
- Creates tables for rankings, reviews, citations
- Enables historical tracking and trends
- Stores performance data for analysis

### Step 2: Google APIs (15 minutes)

#### Google Search Console API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google Search Console API"
4. Create service account credentials
5. Download JSON key file
6. Add environment variables:
```env
GOOGLE_SEARCH_CONSOLE_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY=your-private-key
GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL=your-client-email
GOOGLE_SITE_URL=https://yoursolarcompany.com
```

#### Google My Business API
1. Enable "Google My Business API" in same project
2. Verify business ownership in GMB
3. Get location ID from GMB dashboard
4. Add environment variables:
```env
GOOGLE_MY_BUSINESS_LOCATION_ID=your-location-id
GOOGLE_MY_BUSINESS_ACCOUNT_ID=your-account-id
```

### Step 3: Ranking Tracking Service (10 minutes)

#### Option A: SEMrush API
- Sign up for SEMrush API access
- Get API key from account dashboard
- Add environment variable:
```env
SEMRUSH_API_KEY=your-api-key
```

#### Option B: BrightLocal API (Recommended for Local SEO)
- Sign up for BrightLocal
- Get API key and location ID
- Add environment variables:
```env
BRIGHTLOCAL_API_KEY=your-api-key
BRIGHTLOCAL_LOCATION_ID=your-location-id
```

### Step 4: Citation Monitoring (5 minutes)

#### Moz Local API
- Get Moz Local API access
- Find your listing ID
- Add environment variables:
```env
MOZ_ACCESS_ID=your-access-id
MOZ_SECRET_KEY=your-secret-key
```

### Step 5: Review Monitoring APIs

#### Multi-Platform Review Tracking
Connect these for comprehensive review monitoring:

**Google Reviews**: Already covered by GMB API above

**Yelp API**:
```env
YELP_API_KEY=your-yelp-api-key
YELP_BUSINESS_ID=your-business-id
```

**Facebook API**:
```env
FACEBOOK_ACCESS_TOKEN=your-access-token
FACEBOOK_PAGE_ID=your-page-id
```

## 🔄 Update API Routes

Once you have credentials, I'll help you update these files:

### Update `app/api/metrics/route.ts`
```typescript
// Replace TODO comments with real API calls
const searchConsoleData = await fetchGoogleSearchConsole()
const gmbData = await fetchGoogleMyBusiness()
const reviewData = await fetchReviews()
```

### Update `app/api/locations/route.ts`
```typescript
// Replace TODO comments with real location tracking
const locationRankings = await fetchLocationRankings()
const keywordData = await fetchKeywordData()
```

### Update `app/api/actions/route.ts`
```typescript
// Connect to project management or generate from data
const seoAuditData = await fetchSEOAudit()
const recommendations = await generateRecommendations()
```

## 🎯 Alternative: Use Builder.io for Content Management

If you prefer a CMS-based approach for some data:
[Connect to Builder.io](#open-mcp-popover) to:
- Manage business locations and data
- Store marketing content and campaigns
- Track competitor information
- Manage automation tool configurations

## 🔗 Project Management Integration

For automated task tracking:
[Connect to Linear](#open-mcp-popover) to:
- Auto-generate tasks from SEO audits
- Track completion of priority actions
- Sync with your existing workflow
- Monitor project progress

## 📊 Testing Your Setup

After connecting APIs, test using:
1. **Data Refresh Button**: Click refresh in dashboard
2. **API Status Check**: Visit `/api/metrics` directly
3. **Real-time Updates**: Watch for live data changes
4. **Error Monitoring**: Check browser console for issues

## 🚨 Common Issues & Solutions

### "API Rate Limit Exceeded"
- Implement caching in API routes
- Add delay between requests
- Use environment variables to control frequency

### "Authentication Failed"
- Double-check API credentials
- Verify service account permissions
- Ensure business verification is complete

### "No Data Returned"
- Check if business is properly verified
- Confirm location IDs are correct
- Verify keyword tracking is set up

## 🎉 Once Connected, You'll See:

✅ **Real search rankings** instead of "Connect APIs"  
✅ **Live review counts** instead of "API Required"  
✅ **Actual citation data** instead of "Connect Service"  
✅ **Geographic performance** with real location data  
✅ **Automated recommendations** based on your actual data  
✅ **Real-time alerts** when rankings change  

## 💡 Pro Tips

1. **Start with Neon database** - enables everything else
2. **Set up Google APIs first** - most critical data sources
3. **Add one ranking service** - BrightLocal recommended for local SEO
4. **Test frequently** - use the refresh buttons to verify connections
5. **Monitor rate limits** - implement caching to avoid API limits

## 🔄 Need Help?

After connecting any API, I can help you:
- Update the specific API route code
- Add error handling and retry logic
- Implement caching for better performance
- Set up automated monitoring and alerts

Ready to start? I recommend beginning with the Neon database connection!
