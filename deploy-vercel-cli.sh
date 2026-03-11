#!/bin/bash

echo "🚨 EMERGENCY VERCEL DEPLOYMENT - CLI METHOD"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

print_status "Current directory: $(pwd)"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        print_error "Failed to install Vercel CLI!"
        exit 1
    fi
fi

# Build the project
print_status "Building React app..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed! Check the errors above."
    exit 1
fi

print_success "Build completed successfully!"

# Check build output
if [ ! -f "build/index.html" ]; then
    print_error "Build output missing! index.html not found in build directory."
    exit 1
fi

print_success "Build output verified - index.html found!"

# Deploy to Vercel
print_status "Deploying to Vercel..."
print_warning "When prompted:"
print_warning "- Set up and deploy? Answer: Y"
print_warning "- Which scope? Select your account"
print_warning "- Link to existing project? Answer: N"
print_warning "- Project name? Enter: firehub"
print_warning "- Directory? Press Enter (current directory)"

echo ""
print_status "Starting Vercel deployment..."

vercel --prod

if [ $? -eq 0 ]; then
    print_success "🎉 DEPLOYMENT SUCCESSFUL!"
    print_status "Your app should now be working at the URL shown above."
    print_status "Test these routes:"
    print_status "- / (home page)"
    print_status "- /explore"
    print_status "- /dashboard"
    print_status "All should work without 404 errors!"
else
    print_error "Deployment failed!"
    print_status "Try alternative method:"
    print_status "1. Delete any existing Vercel project"
    print_status "2. Run this script again"
    print_status "3. Or try Netlify: npm install -g netlify-cli && netlify deploy --prod --dir=build"
fi

echo ""
print_status "Deployment complete!"