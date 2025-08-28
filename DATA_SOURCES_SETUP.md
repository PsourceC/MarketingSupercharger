# Data Sources Setup Guide

## ✅ What Was Fixed

Your dashboard was showing **dummy/hardcoded data**. I've completely converted it to use **real API calls** and **live data sources**. Here's what changed:

### Components Updated:
- **MetricsOverview**: Now fetches metrics from `/api/metrics`
- **EnhancedGeoGrid**: Now loads location data from `/api/locations` 
- **PriorityActionsPanel**: Now gets actions from `/api/actions`
- **DataRefreshSystem**: Now uses real-time data subscription

### New Architecture:
- **API Service Layer**: `app/services/api.ts` handles all data fetching
- **Real-time Updates**: Components auto-refresh and show loading states
- **Error Handling**: Graceful fallbacks when APIs aren't connected
- **API Endpoints**: All backend routes created in `app/api/`

## 🔌 Connect Real Data Sources

To get live data instead of placeholder messages, connect these APIs:

### 1. Google Search Console
```javascript
// In app/api/metrics/route.ts
const searchConsoleData = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/your-site/searchAnalytics/query', {
  headers: { 'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}` }
})
```

### 2. Google My Business
```javascript
// For reviews, photos, posts data
const gmbData = await fetch('https://mybusiness.googleapis.com/v4/accounts/your-account/locations', {
  headers: { 'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}` }
})
```

### 3. Ranking Tracking Services
Connect to services like:
- **SEMrush API**: For keyword rankings
- **Ahrefs API**: For backlink and ranking data  
- **BrightLocal API**: For local SEO tracking
- **Whitespark API**: For citation monitoring

### 4. Review Monitoring
- **Google My Business API**: For Google reviews
- **Yelp API**: For Yelp reviews
- **Facebook API**: For Facebook reviews
- **Review monitoring services**: BirdEye, Podium, etc.

### 5. Citation Tracking
- **Moz Local API**: For citation monitoring
- **BrightLocal API**: For local listings
- **Yext API**: For directory management

## 🔧 Quick Setup Options

### Option 1: Connect to Neon Database
[Connect to Neon](#open-mcp-popover) to store and manage your business data.

### Option 2: Use Builder.io CMS
[Connect to Builder.io](#open-mcp-popover) to manage content and data models.

### Option 3: Set up Project Management
[Connect to Linear](#open-mcp-popover) for automated task and priority tracking.

## 📊 Current Status

Your dashboard now shows:
- ⚠️ **Setup messages** instead of fake data
- 🔄 **Loading states** while fetching real data
- 🔗 **API connection status** indicators
- 📱 **Real-time refresh** capabilities

## 🚀 Next Steps

1. **Choose your data sources** from the options above
2. **Get API credentials** for your chosen services
3. **Update the API routes** in `app/api/` with real calls
4. **Test the connections** using the refresh buttons
5. **Set up automated monitoring** for continuous updates

## 🎯 Benefits of Real Data

✅ **Accurate insights** instead of dummy numbers  
✅ **Real-time updates** showing actual changes  
✅ **Actionable recommendations** based on live data  
✅ **Competitive analysis** with current market data  
✅ **Automated tracking** of business performance  

Your dashboard is now ready for real business intelligence!
