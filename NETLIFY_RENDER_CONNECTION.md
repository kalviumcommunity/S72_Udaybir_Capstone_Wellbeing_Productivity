# Netlify + Render Connection Guide

## ✅ Current Deployment Status

- **Backend (Render)**: https://sentience.onrender.com ✅
- **Frontend (Netlify)**: https://sentiencehub.netlify.app/ ✅

## 🔗 Connection Steps

### Step 1: Update Backend CORS (Already Done)

Your backend CORS is now configured to allow your Netlify domain:

```javascript
app.use(cors({
  origin: [
    'https://sentiencehub.netlify.app',
    'https://student-sentience.vercel.app',
    'https://your-app-name.vercel.app',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}));
```

### Step 2: Update Frontend API Configuration (Already Done)

Your frontend is now configured to use your Render backend:

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://sentience.onrender.com/api';

// src/services/noteService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sentience.onrender.com/api';
```

### Step 3: Set Environment Variable in Netlify

1. Go to your Netlify dashboard
2. Navigate to your site settings
3. Go to **Environment variables**
4. Add the following variable:
   ```
   VITE_API_URL=https://sentience.onrender.com/api
   ```

### Step 4: Redeploy Frontend

After setting the environment variable, redeploy your frontend:

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** → **Deploy site**

## 🧪 Testing the Connection

### Test Backend Health
```bash
curl https://sentience.onrender.com/api/health
```

### Test User Registration
```bash
curl -X POST https://sentience.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"test@example.com","password":"testpass123"}'
```

### Test Frontend
1. Visit https://sentiencehub.netlify.app/
2. Open browser developer tools
3. Check Network tab for API calls
4. Try to register/login
5. Check for any CORS errors

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure your backend CORS includes `https://sentiencehub.netlify.app`
   - Redeploy backend after CORS changes

2. **API Connection Issues**
   - Verify `VITE_API_URL` is set in Netlify environment variables
   - Check that the URL points to `https://sentience.onrender.com/api`

3. **Environment Variables Not Working**
   - Redeploy Netlify site after adding environment variables
   - Check variable name (must start with `VITE_`)

### Debugging Steps

1. **Check Backend Logs**
   - Go to Render dashboard
   - Click on your service
   - Check "Logs" tab

2. **Check Frontend Logs**
   - Go to Netlify dashboard
   - Click on your site
   - Check "Deploys" tab for build logs

3. **Browser Console**
   - Open browser developer tools
   - Check Console tab for errors
   - Check Network tab for failed API calls

## 📊 Monitoring

### Backend Monitoring (Render)
- Monitor logs in Render dashboard
- Set up alerts for errors
- Check service health

### Frontend Monitoring (Netlify)
- Monitor build logs
- Check site analytics
- Monitor performance

## 🎯 Success Checklist

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] All features functional
- [ ] No CORS errors in browser console
- [ ] API calls going to Render backend
- [ ] Data being saved and retrieved

## 🚀 Your Live URLs

- **Backend API**: https://sentience.onrender.com
- **Frontend App**: https://sentiencehub.netlify.app/
- **API Health**: https://sentience.onrender.com/api/health

## 📝 Next Steps

1. **Test all functionality** on your live site
2. **Set up monitoring** and alerts
3. **Configure custom domain** (optional)
4. **Set up analytics** and error tracking
5. **Regular maintenance** and updates

## 🔄 Redeployment Commands

If you need to update the connection:

### Update Backend CORS
```bash
# Update server/server.js with your domain
# Push to GitHub
# Render will auto-redeploy
```

### Update Frontend Environment
```bash
# Set VITE_API_URL in Netlify dashboard
# Trigger new deploy in Netlify
```

## 📞 Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check Netlify logs for frontend errors
3. Check browser console for client-side errors
4. Test API endpoints directly with curl

Your application should now be fully connected and functional! 🎉 