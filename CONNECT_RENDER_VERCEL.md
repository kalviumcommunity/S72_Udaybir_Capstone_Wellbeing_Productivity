# Connecting Render Backend with Vercel Frontend

## Step 1: Deploy Backend on Render First

### 1.1 Deploy to Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 1.2 Set Environment Variables in Render
Add these environment variables in Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-sentience?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=10000
```

### 1.3 Get Your Render URL
After deployment, your backend will be available at:
```
https://your-app-name.onrender.com
```

## Step 2: Update CORS Configuration

### 2.1 Update server/server.js
Update your CORS configuration to allow your Vercel domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-frontend-app.vercel.app', // Your Vercel domain
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}));
```

### 2.2 Test Your Backend
Test that your backend is working:
```bash
curl https://your-app-name.onrender.com/api/health
```

## Step 3: Deploy Frontend on Vercel

### 3.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Create new project
3. Connect your GitHub repository
4. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Set Environment Variable in Vercel
In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```
VITE_API_URL=https://your-app-name.onrender.com/api
```

Replace `your-app-name` with your actual Render app name.

## Step 4: Update API Configuration

### 4.1 Verify API Service Configuration
Make sure your `src/services/api.js` uses the environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

### 4.2 Update noteService.ts
Make sure your `src/services/noteService.ts` also uses the environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

## Step 5: Test the Connection

### 5.1 Test Backend Health
```bash
curl https://your-app-name.onrender.com/api/health
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Open browser developer tools
3. Check Network tab for API calls
4. Verify no CORS errors

### 5.3 Test Authentication
1. Try to register/login on your Vercel app
2. Check if API calls are going to your Render backend
3. Verify data is being saved/retrieved

## Step 6: Troubleshooting Common Issues

### 6.1 CORS Errors
If you see CORS errors in browser console:

1. **Update CORS in Render backend**:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}));
```

2. **Redeploy backend** after CORS changes

### 6.2 API Connection Issues
If frontend can't connect to backend:

1. **Check environment variable**:
   - Verify `VITE_API_URL` is set correctly in Vercel
   - Make sure it points to your Render URL

2. **Test API directly**:
```bash
curl https://your-app-name.onrender.com/api/health
```

3. **Check Render logs**:
   - Go to Render dashboard
   - Click on your service
   - Check "Logs" tab for errors

### 6.3 Environment Variables Not Working
If environment variables aren't being picked up:

1. **Redeploy Vercel app** after adding environment variables
2. **Check variable name** (must start with `VITE_`)
3. **Verify no extra spaces** in variable values

## Step 7: Production Checklist

### 7.1 Backend (Render)
- [ ] Backend deployed and accessible
- [ ] Environment variables set
- [ ] CORS configured for Vercel domain
- [ ] MongoDB Atlas connected
- [ ] Health endpoint responding

### 7.2 Frontend (Vercel)
- [ ] Frontend deployed and accessible
- [ ] `VITE_API_URL` environment variable set
- [ ] API calls going to Render backend
- [ ] No CORS errors in browser console
- [ ] Authentication working

### 7.3 Testing
- [ ] User registration working
- [ ] User login working
- [ ] Data creation (tasks, notes, etc.) working
- [ ] Data retrieval working
- [ ] All features functional

## Step 8: Monitoring and Maintenance

### 8.1 Set Up Monitoring
1. **Render**: Enable alerts in dashboard
2. **Vercel**: Check analytics and performance
3. **MongoDB Atlas**: Monitor database performance

### 8.2 Regular Checks
- Monitor Render logs for errors
- Check Vercel analytics for performance
- Test all features periodically
- Update dependencies regularly

## Example URLs

### Backend (Render)
```
https://student-sentience-backend.onrender.com
```

### Frontend (Vercel)
```
https://student-sentience.vercel.app
```

### Environment Variable
```
VITE_API_URL=https://student-sentience-backend.onrender.com/api
```

## Quick Test Commands

```bash
# Test backend health
curl https://your-backend.onrender.com/api/health

# Test user registration
curl -X POST https://your-backend.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@example.com","password":"password123"}'

# Test frontend (replace with your Vercel URL)
curl https://your-frontend.vercel.app
```

## Next Steps

1. **Deploy backend on Render** following RENDER_DEPLOYMENT.md
2. **Update CORS** with your Vercel domain
3. **Deploy frontend on Vercel** following VERCEL_DEPLOYMENT.md
4. **Set environment variable** in Vercel
5. **Test all functionality**
6. **Set up monitoring and alerts** 