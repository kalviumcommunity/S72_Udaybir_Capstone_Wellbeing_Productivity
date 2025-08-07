# Deployment Checklist: Render + Vercel

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] All bugs are fixed (see previous testing)
- [ ] Environment variables are ready
- [ ] MongoDB Atlas account created

## 🚀 Step 1: Deploy Backend on Render

### 1.1 Create Render Account
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Verify email

### 1.2 Deploy Backend Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Configure settings:
  - [ ] **Name**: `student-sentience-backend`
  - [ ] **Environment**: `Node`
  - [ ] **Region**: Choose closest to users
  - [ ] **Branch**: `main`
  - [ ] **Root Directory**: `server`
  - [ ] **Build Command**: `npm install`
  - [ ] **Start Command**: `npm start`

### 1.3 Set Environment Variables
- [ ] Click "Advanced" before creating
- [ ] Add these environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-sentience?retryWrites=true&w=majority`
  - [ ] `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`
  - [ ] `PORT=10000`

### 1.4 Deploy and Get URL
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Copy your Render URL: `https://your-app-name.onrender.com`

## 🎨 Step 2: Deploy Frontend on Vercel

### 2.1 Create Vercel Account
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Verify email

### 2.2 Deploy Frontend
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Configure settings:
  - [ ] **Framework Preset**: Vite
  - [ ] **Root Directory**: `./` (leave empty)
  - [ ] **Build Command**: `npm run build`
  - [ ] **Output Directory**: `dist`

### 2.3 Set Environment Variable
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add: `VITE_API_URL=https://your-app-name.onrender.com/api`
- [ ] Replace `your-app-name` with your actual Render app name

### 2.4 Deploy and Get URL
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy your Vercel URL: `https://your-app-name.vercel.app`

## 🔗 Step 3: Connect the Services

### 3.1 Update CORS in Backend
- [ ] Go back to Render dashboard
- [ ] Click on your backend service
- [ ] Go to "Environment" tab
- [ ] Add environment variable:
  - [ ] `CORS_ORIGIN=https://your-app-name.vercel.app`
- [ ] Redeploy the backend

### 3.2 Update server/server.js
- [ ] Update CORS configuration with your Vercel domain
- [ ] Push changes to GitHub
- [ ] Render will auto-redeploy

### 3.3 Test Connection
- [ ] Test backend: `curl https://your-app-name.onrender.com/api/health`
- [ ] Test frontend: Visit your Vercel URL
- [ ] Try to register/login
- [ ] Check browser console for errors

## 🧪 Step 4: Testing

### 4.1 Backend Testing
- [ ] Health endpoint: `https://your-app-name.onrender.com/api/health`
- [ ] User registration: Try creating an account
- [ ] User login: Try logging in
- [ ] API endpoints: Test all features

### 4.2 Frontend Testing
- [ ] Load the Vercel URL
- [ ] Check browser console for errors
- [ ] Test user registration
- [ ] Test user login
- [ ] Test all features (tasks, notes, mood, etc.)

### 4.3 Integration Testing
- [ ] Create a task from frontend
- [ ] Check if it appears in backend
- [ ] Create a note from frontend
- [ ] Check if it appears in backend
- [ ] Test all CRUD operations

## 🔧 Step 5: Troubleshooting

### 5.1 Common Issues
- [ ] **CORS errors**: Update CORS in backend
- [ ] **API connection**: Check environment variables
- [ ] **Build failures**: Check logs in deployment platforms
- [ ] **Database connection**: Verify MongoDB Atlas settings

### 5.2 Debugging Steps
- [ ] Check Render logs for backend errors
- [ ] Check Vercel logs for frontend errors
- [ ] Check browser console for client-side errors
- [ ] Test API endpoints directly with curl

## 📊 Step 6: Monitoring

### 6.1 Set Up Monitoring
- [ ] Enable Render alerts
- [ ] Set up Vercel analytics
- [ ] Monitor MongoDB Atlas performance
- [ ] Set up error tracking (optional)

### 6.2 Regular Maintenance
- [ ] Monitor logs regularly
- [ ] Update dependencies
- [ ] Test all features periodically
- [ ] Backup database regularly

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Services connected and communicating
- [ ] All features working
- [ ] No errors in console
- [ ] Users can register and login
- [ ] Data is being saved and retrieved
- [ ] Monitoring is set up

## 📞 Support

If you encounter issues:
1. Check the detailed guides: `CONNECT_RENDER_VERCEL.md`
2. Check platform documentation
3. Review logs in deployment platforms
4. Test locally first

## 🚀 Your Live URLs

- **Backend**: `https://your-app-name.onrender.com`
- **Frontend**: `https://your-app-name.vercel.app`
- **API Health**: `https://your-app-name.onrender.com/api/health`

Congratulations! Your app is now live! 🎉 