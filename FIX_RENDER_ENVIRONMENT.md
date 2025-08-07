# Fix Render Environment Variables

## 🐛 **Issue Identified**
Your backend is running but failing because **environment variables are missing** in your Render deployment.

## 🔧 **Fix Steps**

### Step 1: Go to Render Dashboard
1. Visit [render.com](https://render.com)
2. Sign in to your account
3. Click on your backend service: `sentience`

### Step 2: Add Environment Variables
1. Click on your service
2. Go to **"Environment"** tab
3. Add these environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-sentience?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=10000
```

### Step 3: Get MongoDB Atlas Connection String
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign in to your account
3. Click on your cluster
4. Click **"Connect"**
5. Choose **"Connect your application"**
6. Copy the connection string
7. Replace `<password>` with your database password
8. Replace `<dbname>` with `student-sentience`

### Step 4: Generate JWT Secret
Create a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Redeploy
1. After adding environment variables
2. Go to **"Manual Deploy"** tab
3. Click **"Deploy latest commit"**

## 📋 **Environment Variables Checklist**

| Variable | Value | Status |
|----------|-------|--------|
| `NODE_ENV` | `production` | ⚠️ Need to add |
| `MONGODB_URI` | `mongodb+srv://...` | ⚠️ Need to add |
| `JWT_SECRET` | `your-secret-key` | ⚠️ Need to add |
| `PORT` | `10000` | ⚠️ Need to add |

## 🧪 **Test After Fix**

After adding the environment variables and redeploying, test:

```bash
# Test user registration
curl -X POST https://sentience.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","email":"test@example.com","password":"testpass123"}'
```

## 🔍 **Expected Results**

### Before Fix:
```json
{
  "message": "Server error"
}
```

### After Fix:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "testuser",
    "email": "test@example.com",
    "avatar": "...",
    "gender": "neutral",
    "university": "",
    "major": "",
    "year": "",
    "bio": ""
  }
}
```

## 🚀 **Next Steps**

1. **Add environment variables** in Render dashboard
2. **Redeploy** your backend service
3. **Test** user registration
4. **Test** your frontend at https://sentiencehub.netlify.app/
5. **Verify** all features work correctly

## 📞 **If Still Having Issues**

1. **Check Render logs** for specific error messages
2. **Verify MongoDB Atlas** connection string
3. **Ensure all variables** are set correctly
4. **Redeploy** the service

## 🎯 **Success Indicators**

- ✅ User registration works
- ✅ User login works
- ✅ All API endpoints respond correctly
- ✅ Frontend can connect to backend
- ✅ No CORS errors in browser console

Your frontend-backend connection will work perfectly once these environment variables are set! 🎉 