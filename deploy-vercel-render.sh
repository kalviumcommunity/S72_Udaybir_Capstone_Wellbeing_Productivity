#!/bin/bash

echo "🚀 Student Sentience Deployment Script"
echo "======================================"

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is not installed. Please install Node.js first."
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Build the project
build_project() {
    echo "🔨 Building project..."
    
    # Install dependencies
    npm install
    
    # Build frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
    else
        echo "❌ Build failed!"
        exit 1
    fi
}

# Test the build
test_build() {
    echo "🧪 Testing build..."
    
    # Check if dist folder exists
    if [ -d "dist" ]; then
        echo "✅ Build output found"
    else
        echo "❌ Build output not found"
        exit 1
    fi
    
    # Test backend if running locally
    if curl -s http://localhost:8000/api/health > /dev/null; then
        echo "✅ Backend health check passed"
    else
        echo "⚠️  Backend not running locally (this is okay for deployment)"
    fi
}

# Create deployment files
create_deployment_files() {
    echo "📝 Creating deployment files..."
    
    # Create vercel.json if it doesn't exist
    if [ ! -f "vercel.json" ]; then
        cat > vercel.json << EOF
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
EOF
        echo "✅ Created vercel.json"
    fi
    
    # Create render.yaml if it doesn't exist
    if [ ! -f "render.yaml" ]; then
        cat > render.yaml << EOF
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
EOF
        echo "✅ Created render.yaml"
    fi
}

# Show deployment instructions
show_instructions() {
    echo ""
    echo "🎯 Deployment Instructions"
    echo "========================="
    echo ""
    echo "1. 📚 Backend Deployment (Render):"
    echo "   - Go to https://render.com"
    echo "   - Create new Web Service"
    echo "   - Connect your GitHub repository"
    echo "   - Set Root Directory to 'server'"
    echo "   - Set Build Command to 'npm install'"
    echo "   - Set Start Command to 'npm start'"
    echo "   - Add environment variables:"
    echo "     * NODE_ENV=production"
    echo "     * MONGODB_URI=your-mongodb-atlas-connection-string"
    echo "     * JWT_SECRET=your-secret-key"
    echo "     * PORT=10000"
    echo ""
    echo "2. 🎨 Frontend Deployment (Vercel):"
    echo "   - Go to https://vercel.com"
    echo "   - Create new project"
    echo "   - Connect your GitHub repository"
    echo "   - Framework: Vite"
    echo "   - Add environment variable:"
    echo "     * VITE_API_URL=https://your-render-app.onrender.com/api"
    echo ""
    echo "3. 🔗 Update CORS in server/server.js:"
    echo "   - Add your Vercel domain to CORS origins"
    echo ""
    echo "4. 🧪 Test your deployment:"
    echo "   - Test backend: curl https://your-app.onrender.com/api/health"
    echo "   - Test frontend: Visit your Vercel URL"
    echo ""
    echo "📖 For detailed instructions, see:"
    echo "   - VERCEL_DEPLOYMENT.md"
    echo "   - RENDER_DEPLOYMENT.md"
    echo ""
}

# Main execution
main() {
    check_requirements
    build_project
    test_build
    create_deployment_files
    show_instructions
}

# Run main function
main 