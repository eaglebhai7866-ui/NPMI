@echo off
echo ========================================
echo Testing GraphHopper Server
echo ========================================
echo.

echo Test 1: Health Check
echo URL: http://localhost:8989/health
echo.
curl -s http://localhost:8989/health
echo.
echo.

echo Test 2: Route Calculation (Islamabad)
echo From: Blue Area (33.6844, 73.0479)
echo To: F-6 Markaz (33.7294, 73.0931)
echo.
curl -s "http://localhost:8989/route?point=33.6844,73.0479&point=33.7294,73.0931&profile=car&points_encoded=false" > test-route.json
echo Response saved to: test-route.json
echo.

echo Opening test-route.json...
start test-route.json
echo.

echo ========================================
echo Tests Complete!
echo ========================================
echo.
echo If you see route data in the JSON file,
echo GraphHopper is working correctly!
echo.
pause
