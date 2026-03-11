#!/bin/bash

echo "🚀 Deploying FirehubECO to Vercel"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to project root
cd "$(dirname "$0")"

print_status "Preparing for deployment..."

# Create production environment file for frontend
if [ ! -f "frontend/.env.production" ]; then
    print_status "Creating production environment file..."
    cat > frontend/.env.production << 'EOF'
# Production Environment Variables
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
EOF
    print_warning "Please update frontend/.env.production with your actual values"
fi

# Build the frontend
print_status "Building frontend for production..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    print_error "Frontend build failed!"
    exit 1
fi

print_success "Frontend build completed!"

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    print_status "Your app should be available at the Vercel URL provided above."
else
    print_error "Deployment failed!"
    exit 1
fi

print_status "Deployment Summary:"
print_status "- Frontend deployed to Vercel"
print_status "- All routes configured for SPA routing"
print_status "- Static assets optimized with caching"
print_status "- Security headers configured"

echo ""
print_warning "Important Notes:"
print_warning "1. Update frontend/.env.production with your actual API URL"
print_warning "2. Configure your backend API with CORS for your Vercel domain"
print_warning "3. Set up your custom domain in Vercel dashboard if needed"
print_warning "4. Monitor your deployment in Vercel dashboard"