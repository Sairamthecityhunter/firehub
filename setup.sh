#!/bin/bash

echo "🚀 Setting up EroStream - Adult Content Platform"
echo "================================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   You can continue with SQLite for development, but PostgreSQL is recommended for production."
fi

echo "✅ Prerequisites check completed"

# Backend setup
echo ""
echo "🔧 Setting up Django Backend..."
cd backend

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
DEBUG=True
SECRET_KEY=django-insecure-development-key-change-in-production
DB_NAME=erostream
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EOF
    echo "✅ .env file created. Please update it with your actual values."
fi

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "Creating superuser..."
python manage.py createsuperuser --noinput --username admin --email admin@erostream.com

echo "✅ Django backend setup completed"

# Frontend setup
echo ""
echo "🎨 Setting up React Frontend..."
cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=
EOF
    echo "✅ .env file created. Please update it with your actual values."
fi

echo "✅ React frontend setup completed"

# Return to root
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update the .env files in both backend/ and frontend/ directories"
echo "2. Start the backend server: cd backend && python manage.py runserver"
echo "3. Start the frontend server: cd frontend && npm start"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Email: admin@erostream.com"
echo "Password: (you'll be prompted to set this)"
echo ""
echo "Happy coding! 🚀" 