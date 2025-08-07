# Fix Render Deployment SIGTERM Error

## 🐛 **Issue Identified**
Your Render deployment is failing with a SIGTERM error, which indicates the server is crashing during startup.

## 🔧 **Fix Steps**

### Step 1: Update Environment Variables in Render

Go to your Render dashboard and ensure these environment variables are set correctly:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://uday:uday@cluster0.bfbjoot.mongodb.net/student-sentience?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=9e5f2c2e86f44fae8f11f1e7b2a43c8fcf10a88d7bb2d420e7740f8b69cf4d9a
```

### Step 2: Update MongoDB Atlas Settings

1. **Go to MongoDB Atlas** at your cluster
2. **Network Access**: Add `0.0.0.0/0` to allow all IPs
3. **Database Access**: Ensure user "uday" has readWrite permissions

### Step 3: Redeploy with Updated Code

The server code has been updated with:
- ✅ Better error handling
- ✅ Graceful shutdown
- ✅ Improved MongoDB connection
- ✅ Process signal handling

### Step 4: Check Render Logs

After redeploying, check the Render logs for specific error messages:

1. Go to your Render service
2. Click "Logs" tab
3. Look for error messages during startup

## 📋 **Expected Log Output**

### ✅ Successful Startup:
```
🚀 Server running on port 10000
📊 Environment: production
🔗 Health check: http://localhost:10000/api/health
✅ MongoDB Connected Successfully
```

### ❌ Failed Startup:
```
❌ MongoDB Connection Failed: [error message]
⚠️  Server will start but database operations may fail
```

## 🧪 **Test After Fix**

After redeploying, test the connection:

```bash
# Test health endpoint
curl https://sentience.onrender.com/api/health

# Test user registration
curl -X POST https://sentience.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"test@example.com","password":"testpass123"}'
```

## 🔍 **Common Issues & Solutions**

### Issue 1: MongoDB Connection Failed
**Solution**: 
- Check MongoDB Atlas network access
- Verify connection string includes database name
- Ensure user has correct permissions

### Issue 2: Environment Variables Missing
**Solution**:
- Add all required environment variables in Render
- Redeploy after adding variables

### Issue 3: Port Conflicts
**Solution**:
- Ensure PORT is set to 10000 in Render
- Check if port is available

### Issue 4: Memory/Timeout Issues
**Solution**:
- Updated server code handles this better
- Added graceful shutdown
- Better error handling

## 🚀 **Next Steps**

1. **Update environment variables** in Render
2. **Redeploy** your service
3. **Check logs** for specific errors
4. **Test** the health endpoint
5. **Test** user registration
6. **Verify** frontend connection

## 📞 **If Still Having Issues**

1. **Check Render logs** for specific error messages
2. **Verify MongoDB Atlas** connection
3. **Ensure all environment variables** are set
4. **Try manual deployment** instead of auto-deploy

## 🎯 **Success Indicators**

- ✅ Server starts without SIGTERM error
- ✅ MongoDB connects successfully
- ✅ Health endpoint returns 200 OK
- ✅ User registration works
- ✅ Frontend can connect to backend

Your deployment should work perfectly after these fixes! 🎉 