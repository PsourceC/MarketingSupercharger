# Netlify Deployment Fix Guide

## Issues Fixed

1. **Added Netlify Configuration (`netlify.toml`)**
   - Next.js plugin configuration
   - Proper build settings
   - API route handling
   - Security headers

2. **Next.js Configuration (`next.config.js`)**
   - Server-only package exclusions
   - Webpack configuration for client/server separation
   - SSR optimization settings

3. **Package Dependencies**
   - Added `@netlify/plugin-nextjs` for proper Next.js support
   - Added `server-only` for server/client code separation
   - Specified Node.js engine requirements

4. **Headers Configuration (`_headers`)**
   - Security headers
   - Caching optimization
   - API route cache control

## Environment Variables Needed

Set these in your Netlify environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-site.netlify.app/api/auth/google/callback
NODE_ENV=production
```

## Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Test Build Locally**
   ```bash
   npm run build
   ```

3. **Deploy to Netlify**
   - Push changes to your repository
   - Netlify will automatically deploy with the new configuration

## Troubleshooting

### If Build Still Fails:

1. **Check Build Logs** for specific error messages
2. **Verify Environment Variables** are set in Netlify dashboard
3. **Clear Build Cache** in Netlify settings
4. **Check Node Version** is 18+ in Netlify build settings

### Common Issues:

- **"Module not found"**: Usually server-only imports in client components
- **"Window is not defined"**: SSR issues with client-only libraries (already fixed for Leaflet)
- **Database connection errors**: Missing or incorrect DATABASE_URL

### Manual Fixes if Needed:

1. **If Leaflet still causes SSR issues**, components use dynamic imports with `ssr: false`
2. **If database imports cause issues**, use the server-only wrapper: `import { query } from '@/app/lib/server-only'`
3. **If API routes fail**, ensure they only use server-side imports

## Testing

After deployment, test these URLs:
- Main site: `https://your-site.netlify.app`
- API health: `https://your-site.netlify.app/api/auth/status`
- Database connection: `https://your-site.netlify.app/api/metrics`

## Performance Optimizations Included

- Static asset caching (1 year)
- API route cache control
- Image optimization settings
- Bundle size optimization
- Security headers

The configuration should resolve the "Header rules", "Pages changed", and "Redirect rules" failures you were experiencing.
