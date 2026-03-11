#!/bin/bash

echo "🚀 Starting FirehubECO Application"
echo "=================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔄 Stopping any existing processes on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Stop any existing servers
echo "🛑 Stopping any existing servers..."
kill_port 8000  # Django backend
kill_port 3000  # React frontend

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    exit 1
fi

# Start Backend Server
echo ""
echo "🔧 Starting Django Backend Server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and start backend
echo "🐍 Activating virtual environment and starting backend..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/pyvenv.cfg" ] || [ "requirements.txt" -nt "venv/pyvenv.cfg" ]; then
    echo "📦 Installing/updating Python dependencies..."
    pip install -r requirements.txt
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << 'EOF'
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
fi

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py makemigrations --noinput 2>/dev/null || true
python manage.py migrate --noinput 2>/dev/null || true

# Start backend server in background
echo "🚀 Starting Django server on http://localhost:8000..."
python manage.py runserver 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start Frontend Server
echo ""
echo "🎨 Starting React Frontend Server..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "📦 Installing/updating Node.js dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=
EOF
fi

# Start frontend server in background
echo "🚀 Starting React server on http://localhost:3000..."
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for servers to fully start
echo ""
echo "⏳ Waiting for servers to start..."
sleep 8

# Check if servers are running
echo ""
echo "🔍 Checking server status..."

if check_port 8000; then
    echo "✅ Backend server is running on http://localhost:8000"
else
    echo "❌ Backend server failed to start"
    echo "Backend logs:"
    tail -10 backend.log 2>/dev/null || echo "No backend logs found"
fi

if check_port 3000; then
    echo "✅ Frontend server is running on http://localhost:3000"
else
    echo "❌ Frontend server failed to start"
    echo "Frontend logs:"
    tail -10 frontend.log 2>/dev/null || echo "No frontend logs found"
fi

# Open the application in browser
echo ""
echo "🌐 Opening application in browser..."
sleep 2
open http://localhost:3000 2>/dev/null || echo "Please manually open http://localhost:3000 in your browser"

echo ""
echo "🎉 FirehubECO Application Started Successfully!"
echo ""
echo "📍 Access Points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:8000/admin"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop the servers, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or use: ./stop_app.sh"
echo ""
echo "📊 To view logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "Happy coding! 🚀"

# Keep script running and show live logs
echo "📺 Showing live logs (Ctrl+C to stop):"
echo "======================================="
tail -f backend.log frontend.log 2>/dev/null &
TAIL_PID=$!

# Handle Ctrl+C
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID $TAIL_PID 2>/dev/null; exit 0' INT

# Wait indefinitely
wait
