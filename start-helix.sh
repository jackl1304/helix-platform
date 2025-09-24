#!/bin/bash

# Helix Platform Startup Script
# This script starts the Helix Regulatory Intelligence Platform

echo "🚀 Starting Helix Regulatory Intelligence Platform..."
echo "=========================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Change to the project directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "vps-working-server.js" ]; then
    echo "❌ vps-working-server.js not found. Please run this script from the project root."
    exit 1
fi

# Check if port 5000 is already in use
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5000 is already in use. Stopping existing server..."
    pkill -f "node.*vps-working-server.js" || true
    sleep 2
fi

# Start the server
echo "🌐 Starting Helix server on http://localhost:5000"
echo "✅ The server will provide:"
echo "   - 70 Data Sources"
echo "   - 65 Legal Cases"
echo "   - Complete API endpoints"
echo "   - Web dashboard"
echo ""
echo "📋 Available endpoints:"
echo "   - Health Check: http://localhost:5000/health"
echo "   - Web Dashboard: http://localhost:5000/"
echo "   - Data Sources API: http://localhost:5000/api/data-sources"
echo "   - Legal Cases API: http://localhost:5000/api/legal-cases"
echo "   - Dashboard Stats: http://localhost:5000/api/dashboard/stats"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
node vps-working-server.js