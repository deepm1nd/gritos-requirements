#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")" || exit

echo "Ensuring backend dependencies are installed..."
npm install --loglevel error # Add this line, suppress verbose npm output

echo "Starting backend server for smoke tests..."
node server.js &
SERVER_PID=$!

# Allow server to start
sleep 5 # Increased sleep time slightly just in case server startup is slow

BASE_URL="http://localhost:${PORT:-3000}"

echo "--- Backend Smoke Test ---"
FAIL_COUNT=0

# Test 1: Check 404 for a non-existent endpoint
echo "Test 1: Checking 404 for /api/nonexistent"
HTTP_STATUS_404=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/nonexistent")
if [ "$HTTP_STATUS_404" -eq 404 ]; then
    echo "Test 1 PASSED (404 received)"
else
    echo "Test 1 FAILED (Expected 404, got ${HTTP_STATUS_404})"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo "--------------------------"

# Test 2: Check 401/403 for an authenticated endpoint without token
echo "Test 2: Checking 401/403 for /api/requirements (no token)"
HTTP_STATUS_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/requirements")
if [ "$HTTP_STATUS_AUTH" -eq 401 ] || [ "$HTTP_STATUS_AUTH" -eq 403 ]; then
    echo "Test 2 PASSED (${HTTP_STATUS_AUTH} received)"
else
    echo "Test 2 FAILED (Expected 401 or 403, got ${HTTP_STATUS_AUTH})"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo "--------------------------"

# Test 3: Check if server is running by trying to connect
echo "Test 3: Basic server health check (POST to /api/auth/github/callback without data)"
HTTP_STATUS_HEALTH=$(curl -s -X POST -H "Content-Type: application/json" -d '{}' -o /dev/null -w "%{http_code}" "${BASE_URL}/api/auth/github/callback")
if [ "$HTTP_STATUS_HEALTH" -eq 400 ]; then # Expecting 400 due to missing 'code'
    echo "Test 3 PASSED (Server responded with 400 as expected)"
else
    echo "Test 3 FAILED (Expected 400, got ${HTTP_STATUS_HEALTH})"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo "--------------------------"


echo "Stopping backend server (PID: $SERVER_PID)..."
# Check if process exists before attempting to kill
if ps -p $SERVER_PID > /dev/null; then
   kill $SERVER_PID
   wait $SERVER_PID 2>/dev/null # Suppress "Terminated" message
else
   echo "Server process $SERVER_PID not found. It might have crashed."
fi


echo "--- Smoke Test Summary ---"
if [ $FAIL_COUNT -eq 0 ]; then
    echo "All smoke tests PASSED."
    exit 0
else
    echo "$FAIL_COUNT smoke test(s) FAILED."
    exit 1
fi
