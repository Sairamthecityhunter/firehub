# 🚀 Vercel Deployment Guide for FirehubECO

This guide will help you deploy your FirehubECO React frontend to Vercel and fix the NOT_FOUND errors.

## 🔧 Problem: NOT_FOUND Errors

The NOT_FOUND error occurs because Vercel doesn't know how to handle React Router's client-side routing. When someone visits `/explore` or `/dashboard/profile`, Vercel looks for those files on the server, but they don't exist - they're handled by React Router on the client side.

## ✅ Solution: SPA Configuration

I've created the necessary configuration files to fix this issue:

### 1. **vercel.json** (Root Level)
- Configures Vercel to serve `index.html` for all routes
- Sets up proper caching for static assets
- Adds security headers

### 2. **frontend/vercel.json** (Frontend Specific)
- Framework-specific configuration for Create React App
- Proper build and output directory settings
- SPA routing rewrites

### 3. **frontend/public/_redirects**
- Fallback configuration for client-side routing
- Ensures all routes serve `index.html`

## 🚀 Deployment Methods

### Method 1: Automatic Deployment (Recommended)

1. **Connect GitHub to Vercel:**
   ```bash
   # Your code is already on GitHub at:
   # https://github.com/Sairamthecityhunter/firehub
   ```

2. **Import Project in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `Sairamthecityhunter/firehub`
   - Set these settings:
     - **Framework Preset:** Create React App
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `build`

3. **Configure Environment Variables:**
   ```bash
   REACT_APP_API_URL=https://your-backend-domain.com/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
   GENERATE_SOURCEMAP=false
   ```

### Method 2: CLI Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Run Deployment Script:**
   ```bash
   ./deploy-vercel.sh
   ```

3. **Or Manual CLI Deployment:**
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

## 🔧 Configuration Files Created

### `/vercel.json` (Root)
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `/frontend/vercel.json`
```json
{
  "version": 2,
  "framework": "create-react-app",
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

### `/frontend/public/_redirects`
```
/*    /index.html   200
```

## 🛠️ Troubleshooting Common Issues

### Issue 1: Routes Still Return 404

**Solution:**
- Ensure `vercel.json` is in the correct location
- Check that the `rewrites` configuration is correct
- Verify the build output directory is set to `build`

### Issue 2: Static Assets Not Loading

**Solution:**
- Check the `homepage` field in `package.json`
- Ensure static assets are in the `public` folder
- Verify build process copies all necessary files

### Issue 3: Environment Variables Not Working

**Solution:**
- Add environment variables in Vercel dashboard
- Ensure they start with `REACT_APP_`
- Redeploy after adding environment variables

### Issue 4: Build Fails on Vercel

**Solution:**
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Fix any ESLint warnings that might cause build failures

## 📋 Pre-Deployment Checklist

- [ ] All routes work locally with `npm start`
- [ ] Build completes successfully with `npm run build`
- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] CORS configured on backend for Vercel domain
- [ ] Static assets properly referenced

## 🔗 Vercel Project Settings

When importing your project, use these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Create React App |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |
| Development Command | `npm start` |

## 🌐 Environment Variables for Production

Add these in Vercel dashboard:

```bash
# API Configuration
REACT_APP_API_URL=https://your-backend-api.com/api

# Stripe Configuration  
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Build Optimization
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

## 🚀 Post-Deployment Steps

1. **Test All Routes:**
   - Visit your Vercel URL
   - Test navigation: `/`, `/explore`, `/dashboard/*`
   - Ensure no 404 errors

2. **Configure Custom Domain (Optional):**
   - Add your domain in Vercel dashboard
   - Update DNS records as instructed
   - Configure SSL (automatic with Vercel)

3. **Set Up Analytics:**
   - Enable Vercel Analytics
   - Monitor performance and errors
   - Set up error tracking (Sentry, etc.)

4. **Backend Integration:**
   - Update backend CORS settings
   - Add your Vercel domain to allowed origins
   - Test API connectivity

## 🔍 Testing Your Deployment

After deployment, test these URLs:

- ✅ `https://your-app.vercel.app/` (Home)
- ✅ `https://your-app.vercel.app/explore` (Explore)
- ✅ `https://your-app.vercel.app/dashboard` (Dashboard)
- ✅ `https://your-app.vercel.app/dashboard/profile` (Profile)
- ✅ `https://your-app.vercel.app/dashboard/settings` (Settings)

All should load without 404 errors!

## 📞 Support

If you still encounter issues:

1. Check Vercel deployment logs
2. Verify `vercel.json` configuration
3. Test build locally: `npm run build && serve -s build`
4. Check browser console for errors

Your FirehubECO app should now deploy successfully on Vercel! 🎉