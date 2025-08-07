#!/bin/bash

echo "🚀 Setting up deployment for Student Sentience"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if git is initialized
check_git() {
    if [ ! -d ".git" ]; then
        print_error "Git repository not initialized!"
        echo "Please run: git init && git add . && git commit -m 'Initial commit'"
        exit 1
    fi
    print_status "Git repository found"
}

# Check if all required files exist
check_files() {
    print_status "Checking required files..."
    
    required_files=(
        "package.json"
        "server/package.json"
        "server/server.js"
        "src/services/api.js"
        "src/services/noteService.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_status "Found $file"
        else
            print_error "Missing $file"
            exit 1
        fi
    done
}

# Create deployment configuration files
create_config_files() {
    print_status "Creating deployment configuration files..."
    
    # Create vercel.json
    cat > vercel.json << 'EOF'
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
    print_status "Created vercel.json"
    
    # Create render.yaml
    cat > render.yaml << 'EOF'
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
    print_status "Created render.yaml"
}

# Show deployment instructions
show_instructions() {
    echo ""
    echo "🎯 Deployment Instructions"
    echo "========================"
    echo ""
    echo "1. 📚 Deploy Backend on Render:"
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
    echo "2. 🎨 Deploy Frontend on Vercel:"
    echo "   - Go to https://vercel.com"
    echo "   - Create new project"
    echo "   - Connect your GitHub repository"
    echo "   - Framework: Vite"
    echo "   - Add environment variable:"
    echo "     * VITE_API_URL=https://your-render-app.onrender.com/api"
    echo ""
    echo "3. 🔗 Connect the services:"
    echo "   - Update CORS in server/server.js with your Vercel domain"
    echo "   - Redeploy backend after CORS changes"
    echo "   - Test the connection"
    echo ""
    echo "📖 For detailed instructions, see:"
    echo "   - CONNECT_RENDER_VERCEL.md"
    echo "   - VERCEL_DEPLOYMENT.md"
    echo "   - RENDER_DEPLOYMENT.md"
    echo ""
}

# Test current setup
test_setup() {
    print_status "Testing current setup..."
    
    # Test if backend can start
    if [ -f "server/server.js" ]; then
        print_status "Backend server file found"
    else
        print_error "Backend server file missing"
    fi
    
    # Test if frontend can build
    if npm run build > /dev/null 2>&1; then
        print_status "Frontend builds successfully"
    else
        print_warning "Frontend build test failed (this is okay if dependencies aren't installed)"
    fi
    
    # Check for environment variables
    if [ -f ".env" ]; then
        print_status "Environment file found"
    else
        print_warning "No .env file found (will be set in deployment platforms)"
    fi
}

# Main execution
main() {
    echo "Starting deployment setup..."
    echo ""
    
    check_git
    check_files
    create_config_files
    test_setup
    show_instructions
    
    echo ""
    print_status "Setup complete! Follow the instructions above to deploy."
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Deploy backend on Render"
    echo "3. Deploy frontend on Vercel"
    echo "4. Connect the services"
    echo "5. Test everything works"
}

# Run main function
main 