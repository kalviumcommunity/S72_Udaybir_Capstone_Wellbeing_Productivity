# Vercel Deployment Guide

## Prerequisites

- Vercel account (free at vercel.com)
- GitHub repository with your code
- Environment variables configured

## Step 1: Prepare Your Repository

### 1.1 Update package.json
Make sure your `package.json` has the correct build script:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 1.2 Create vercel.json (Optional)
Create a `vercel.json` file in your root directory for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Step 2: Configure Environment Variables

### 2.1 Create .env.production
Create a `.env.production` file in your root directory:

```env
VITE_API_URL=https://your-backend-app.onrender.com/api
```

### 2.2 Update API Configuration
Make sure your API service uses the environment variable:

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

## Step 3: Deploy to Vercel

### 3.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Project Settings
1. **Framework Preset**: Vite
2. **Root Directory**: `./` (leave empty if root)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 3.3 Set Environment Variables
In the Vercel dashboard, go to your project settings:

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

```
VITE_API_URL=https://your-backend-app.onrender.com/api
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-app.vercel.app`

## Step 4: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions

## Step 5: Set Up Automatic Deployments

### 5.1 GitHub Integration
- Vercel automatically deploys when you push to `main` branch
- Preview deployments are created for pull requests

### 5.2 Environment Variables per Branch
You can set different environment variables for different branches:
- Production: `main` branch
- Preview: `develop` or feature branches

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **API Connection Issues**
   - Verify `VITE_API_URL` is set correctly
   - Check CORS settings on your backend
   - Ensure backend is deployed and accessible

3. **404 Errors on Refresh**
   - Add the `vercel.json` configuration above
   - This handles client-side routing

4. **Environment Variables Not Working**
   - Redeploy after adding environment variables
   - Check variable names (must start with `VITE_`)

### Performance Optimization

1. **Enable Edge Functions** (if needed)
2. **Configure Caching** in `vercel.json`
3. **Optimize Images** using Vercel's image optimization

## Monitoring and Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Performance Monitoring**: Built into Vercel dashboard
3. **Error Tracking**: Integrate with Sentry or similar

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure backend to allow Vercel domain
3. **HTTPS**: Automatically handled by Vercel

## Cost

- **Hobby Plan**: Free (perfect for personal projects)
- **Pro Plan**: $20/month (for teams and advanced features)
- **Enterprise**: Custom pricing

## Next Steps

1. Deploy your backend on Render (see RENDER_DEPLOYMENT.md)
2. Update the `VITE_API_URL` to point to your Render backend
3. Test all functionality in production
4. Set up monitoring and error tracking 