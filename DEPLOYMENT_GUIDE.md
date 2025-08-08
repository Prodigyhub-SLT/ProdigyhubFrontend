# Vercel Deployment Guide

This guide explains how to deploy both the frontend and backend to Vercel from the same repository.

## Project Structure

```
ProdigyhubFrontend/
├── Admin frontend/          # React frontend
├── ProdigyHub-Unified/     # Express backend
└── vercel.json             # Vercel configuration
```

## Configuration Files

### Root vercel.json
The root `vercel.json` configures both builds:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "Admin frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "Admin frontend/dist"
      }
    },
    {
      "src": "ProdigyHub-Unified/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/ProdigyHub-Unified/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/Admin frontend/dist/$1"
    }
  ],
  "functions": {
    "ProdigyHub-Unified/server.js": {
      "maxDuration": 30
    }
  }
}
```

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your repository

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

```
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
PORT=3000
```

### 3. Deploy

1. Vercel will automatically detect the configuration
2. The build process will:
   - Build the React frontend (`Admin frontend/`)
   - Deploy the Express backend (`ProdigyHub-Unified/`)
3. Routes will be configured automatically:
   - `/api/*` → Backend server
   - `/*` → Frontend static files

## How It Works

### Development vs Production

**Development:**
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:3001`
- Frontend proxies API calls to backend

**Production:**
- Both frontend and backend run on the same Vercel domain
- Frontend serves static files
- Backend handles `/api/*` routes
- No external proxy needed

### API Routes

The backend handles these API endpoints:
- `/api/productCatalogManagement/v5/*` - TMF620
- `/api/tmf-api/product*` - TMF637
- `/api/productOfferingQualification/v5/*` - TMF679
- `/api/productOrderingManagement/v4/*` - TMF622
- `/api/eventManagement/v4/*` - TMF688
- `/api/tmf-api/productConfigurationManagement/v5/*` - TMF760

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=16.0.0)

2. **API Routes Not Working**
   - Verify the backend server.js is properly configured
   - Check that routes are correctly mapped in vercel.json

3. **CORS Issues**
   - Backend CORS is configured for production domains
   - Frontend proxy handles CORS automatically

### Environment Variables

Make sure these are set in Vercel:
- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV` - Set to "production"
- Any other environment variables your app needs

## Benefits of This Setup

1. **Single Repository**: Both frontend and backend in one place
2. **Automatic Deployments**: Push to main branch triggers deployment
3. **Cost Effective**: Single Vercel project instead of separate services
4. **Simplified Configuration**: No need for external proxy services
5. **Better Performance**: No cross-origin requests in production

## Migration from Render

If you're migrating from Render:

1. Update your frontend API calls to use relative URLs
2. Set up environment variables in Vercel
3. Test the deployment with a staging branch first
4. Update any external references to point to your new Vercel domain

## Monitoring

- Use Vercel's built-in analytics and monitoring
- Check function logs in the Vercel dashboard
- Monitor API response times and errors
