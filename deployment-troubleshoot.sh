#!/bin/bash

echo "===========================================" 
echo "AIChecklist.io - Deployment Troubleshooting"
echo "==========================================="
echo ""

# Check Node.js version
echo "1. Checking Node.js version..."
node --version
echo ""

# Check if node_modules exists
echo "2. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "❌ node_modules directory missing - run 'npm install'"
fi
echo ""

# Check if dist directory exists (built files)
echo "3. Checking build output..."
if [ -d "dist" ]; then
    echo "✅ dist directory exists"
    if [ -f "dist/index.js" ]; then
        echo "✅ Server build file exists (dist/index.js)"
    else
        echo "❌ Server build missing - run 'npm run build'"
    fi
    if [ -d "dist/client" ]; then
        echo "✅ Client build directory exists"
    else
        echo "❌ Client build missing - run 'npm run build'"
    fi
else
    echo "❌ dist directory missing - run 'npm run build'"
fi
echo ""

# Check environment variables
echo "4. Checking environment variables..."
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is set"
else
    echo "❌ DATABASE_URL is missing"
fi

if [ -n "$NODE_ENV" ]; then
    echo "✅ NODE_ENV is set to: $NODE_ENV"
else
    echo "⚠️  NODE_ENV not set (defaulting to development)"
fi
echo ""

# Check package.json scripts
echo "5. Available npm scripts:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "Scripts:"
    echo "  npm run build  - Build for production"
    echo "  npm start      - Start production server"
    echo "  npm run dev    - Development only (DO NOT USE IN PRODUCTION)"
else
    echo "❌ package.json missing"
fi
echo ""

# Run health check if server is running
echo "6. Testing health endpoint..."
if command -v curl &> /dev/null; then
    echo "Attempting to connect to health endpoint..."
    curl -s http://localhost:5000/api/health | head -c 200
    echo ""
else
    echo "curl not available - install curl to test endpoints"
fi
echo ""

echo "===========================================" 
echo "CORRECT DEPLOYMENT SEQUENCE:"
echo "1. npm install"
echo "2. npm run build" 
echo "3. npm start"
echo "==========================================="
echo ""

echo "If you're still getting Vite errors:"
echo "1. rm -rf node_modules"
echo "2. npm install"
echo "3. npm run build"
echo "4. npm start"