# Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- MongoDB (for local development)

## Quick Deployment with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd S72_Udaybir_Capstone_Wellbeing_Productivity
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

3. **Deploy with Docker Compose**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Manual Deployment

### Frontend Deployment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Start the preview server**
   ```bash
   npm run preview
   ```

### Backend Deployment

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export MONGODB_URI=mongodb://localhost:27017/student-sentience
   export JWT_SECRET=your-secure-jwt-secret
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## Environment Variables

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000/api)

### Backend (.env)
- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port (default: 8000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens

## Production Considerations

1. **Security**
   - Change default JWT secret
   - Use HTTPS in production
   - Set up proper CORS configuration

2. **Database**
   - Use a production MongoDB instance
   - Set up database backups
   - Configure proper indexes

3. **Performance**
   - Enable compression
   - Set up CDN for static assets
   - Configure caching headers

## Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check MongoDB connection
   - Verify environment variables
   - Check port availability

2. **Frontend build fails**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies

3. **Docker issues**
   - Ensure Docker is running
   - Check Docker Compose version
   - Verify port mappings

## Health Checks

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api/health
- MongoDB: localhost:27017 