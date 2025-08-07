# Render Deployment Guide

## Prerequisites

- Render account (free at render.com)
- GitHub repository with your code
- MongoDB Atlas account (for production database)

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier is sufficient)
4. Set up database access (username/password)
5. Set up network access (allow all IPs: 0.0.0.0/0)

### 1.2 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with your database name (e.g., `student-sentience`)

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/student-sentience?retryWrites=true&w=majority
```

## Step 2: Prepare Your Backend

### 2.1 Update server/package.json
Make sure your `package.json` has the correct scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2.2 Create render.yaml (Optional)
Create a `render.yaml` file in your root directory:

```yaml
services:
  - type: web
    name: student-sentience-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: PORT
        value: 10000
```

## Step 3: Deploy to Render

### 3.1 Connect Repository
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository

### 3.2 Configure Service Settings
1. **Name**: `student-sentience-backend` (or your preferred name)
2. **Environment**: `Node`
3. **Region**: Choose closest to your users
4. **Branch**: `main`
5. **Root Directory**: `server` (since your backend is in the server folder)
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`

### 3.3 Set Environment Variables
Click "Advanced" and add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-sentience?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=10000
```

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait for the build to complete
3. Your API will be available at `https://your-app-name.onrender.com`

## Step 4: Configure CORS

### 4.1 Update server/server.js
Make sure your CORS configuration allows your Vercel domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-frontend-app.vercel.app',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true
}));
```

## Step 5: Test Your Deployment

### 5.1 Health Check
Test your API endpoint:
```bash
curl https://your-app-name.onrender.com/api/health
```

### 5.2 Test Authentication
```bash
curl -X POST https://your-app-name.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@example.com","password":"password123"}'
```

## Step 6: Update Frontend Configuration

### 6.1 Update Vercel Environment Variables
Go to your Vercel dashboard and update the `VITE_API_URL`:

```
VITE_API_URL=https://your-app-name.onrender.com/api
```

### 6.2 Redeploy Frontend
Your Vercel app will automatically redeploy with the new API URL.

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has correct permissions

3. **Environment Variables Not Working**
   - Redeploy after adding environment variables
   - Check variable names and values
   - Ensure no extra spaces or quotes

4. **CORS Errors**
   - Update CORS configuration to include your Vercel domain
   - Check browser console for specific error messages

5. **Service Unavailable**
   - Free tier services sleep after 15 minutes of inactivity
   - First request after sleep takes longer to respond
   - Consider upgrading to paid plan for always-on service

### Performance Optimization

1. **Enable Auto-Scaling** (paid plans)
2. **Configure Health Checks**
3. **Set up Monitoring**

## Monitoring and Logs

### 6.1 View Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. View real-time logs

### 6.2 Set Up Alerts
1. Go to "Alerts" in your service
2. Configure email notifications for errors

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **JWT Secret**: Use a strong, unique secret
3. **Database Security**: Use MongoDB Atlas security features
4. **HTTPS**: Automatically handled by Render

## Cost

- **Free Tier**: $0/month (sleeps after 15 minutes)
- **Starter Plan**: $7/month (always on)
- **Standard Plan**: $25/month (auto-scaling)

## Next Steps

1. Test all API endpoints in production
2. Set up monitoring and error tracking
3. Configure custom domain (optional)
4. Set up automated backups for MongoDB
5. Implement rate limiting and security measures

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `PORT` | Server port | `10000` |

## Database Migration

If you have existing data:
1. Export data from local MongoDB
2. Import to MongoDB Atlas
3. Update connection string in Render
4. Test all functionality 