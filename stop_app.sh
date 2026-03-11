#!/bin/bash

echo "🛑 Stopping FirehubECO Application"
echo "================================="

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔄 Stopping processes on port $port..."
    
    # Get PIDs of processes using the port
    PIDS=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$PIDS" ]; then
        echo "Found processes: $PIDS"
        # Kill the processes
        echo $PIDS | xargs kill -9 2>/dev/null
        sleep 2
        
        # Check if processes are still running
        REMAINING=$(lsof -ti:$port 2>/dev/null)
        if [ -z "$REMAINING" ]; then
            echo "✅ Successfully stopped processes on port $port"
        else
            echo "⚠️  Some processes on port $port may still be running"
        fi
    else
        echo "ℹ️  No processes found on port $port"
    fi
}

# Stop backend server (Django on port 8000)
kill_port 8000

# Stop frontend server (React on port 3000)  
kill_port 3000

# Also kill any Python manage.py processes
echo ""
echo "🐍 Stopping any remaining Django processes..."
pkill -f "python manage.py runserver" 2>/dev/null || echo "No Django processes found"

# Kill any npm start processes
echo ""
echo "📦 Stopping any remaining npm processes..."
pkill -f "npm start" 2>/dev/null || echo "No npm processes found"

# Clean up log files
echo ""
echo "🧹 Cleaning up log files..."
rm -f backend.log frontend.log 2>/dev/null || true

echo ""
echo "✅ FirehubECO Application stopped successfully!"
echo ""
echo "To restart the application, run:"
echo "   ./start_app.sh"
