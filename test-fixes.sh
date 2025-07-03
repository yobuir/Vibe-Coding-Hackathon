#!/bin/bash

# Simple test script to verify the fixes
echo "Testing Rwanda Civic Education Platform fixes..."

# Test 1: Check if server is running
echo "1. Checking if server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/admin | grep -q "200"; then
    echo "✓ Server is running and admin page is accessible"
else
    echo "✗ Server may not be running or admin page has issues"
fi

# Test 2: Test simulation API endpoint
echo "2. Testing simulation API..."
response=$(curl -s -X POST http://localhost:3003/api/simulations \
  -H "Content-Type: application/json" \
  -d '{"action":"list"}')

if echo "$response" | grep -q "success"; then
    echo "✓ Simulation API is working"
else
    echo "✗ Simulation API has issues"
    echo "Response: $response"
fi

# Test 3: Test quiz generation API
echo "3. Testing quiz generation API..."
response=$(curl -s -X POST http://localhost:3003/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test quiz","preferences":{"topic":"governance","difficulty":"beginner","questionCount":3}}')

if echo "$response" | grep -q "success\|quiz"; then
    echo "✓ Quiz generation API is working"
else
    echo "✗ Quiz generation API has issues"
    echo "Response: $response"
fi

echo ""
echo "Test complete! Check the results above."
echo "If all tests pass, the main issues should be resolved."
