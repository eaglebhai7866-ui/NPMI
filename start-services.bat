@echo off
echo ========================================
echo Starting NPMI Routing Services
echo ========================================
echo.

echo Starting GraphHopper server...
start "GraphHopper" cmd /c "cd graphhopper && start-graphhopper.bat"
timeout /t 5 /nobreak >nul

echo Starting Backend API...
start "Backend API" cmd /c "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Services Started!
echo ========================================
echo GraphHopper: http://localhost:8989
echo Backend API: http://localhost:3001
echo ========================================
echo.
echo Press any key to test the integration...
pause >nul

node test-integration.cjs
