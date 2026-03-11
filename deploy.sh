#!/bin/bash

echo "🚀 FirehubECO Deployment Script"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from example..."
    if [ -f "env.production.example" ]; then
        cp env.production.example .env
        print_warning "Please edit .env file with your actual values before proceeding."
        print_warning "Press any key to continue after editing .env file..."
        read -n 1 -s
    else
        print_error "env.production.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Check if frontend .env.production exists
if [ ! -f "frontend/.env.production" ]; then
    print_warning "Frontend .env.production not found. Creating from example..."
    if [ -f "frontend/env.production.example" ]; then
        cp frontend/env.production.example frontend/.env.production
        print_warning "Please edit frontend/.env.production with your actual values."
    fi
fi

# Load environment variables
set -a
source .env
set +a

print_status "Starting deployment process..."

# Build and start services
print_status "Building Docker images..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    print_error "Docker build failed!"
    exit 1
fi

print_success "Docker images built successfully!"

# Start services
print_status "Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    print_error "Failed to start services!"
    exit 1
fi

print_success "Services started successfully!"

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T backend python manage.py migrate

if [ $? -ne 0 ]; then
    print_error "Database migrations failed!"
    exit 1
fi

print_success "Database migrations completed!"

# Collect static files
print_status "Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

if [ $? -ne 0 ]; then
    print_error "Static files collection failed!"
    exit 1
fi

print_success "Static files collected!"

# Create superuser (optional)
read -p "Do you want to create a superuser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating superuser..."
    docker-compose exec backend python manage.py createsuperuser
fi

# Show service status
print_status "Checking service status..."
docker-compose ps

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=20

print_success "Deployment completed successfully!"
print_status "Your application should be available at:"
print_status "Frontend: http://localhost (or your domain)"
print_status "Backend API: http://localhost/api (or your domain/api)"
print_status "Admin Panel: http://localhost/admin (or your domain/admin)"

print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
print_status "To restart services: docker-compose restart"

echo ""
print_warning "Important Security Notes:"
print_warning "1. Change default passwords in .env file"
print_warning "2. Set up SSL certificates for production"
print_warning "3. Configure proper firewall rules"
print_warning "4. Set up regular backups"
print_warning "5. Monitor application logs"
