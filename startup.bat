@echo off
echo ========================================
echo  NPMI Routing Application Startup
echo ========================================
echo.
echo Starting all services...
echo.

REM Start GraphHopper
echo [1/3] Starting GraphHopper server...
start "GraphHopper Server" cmd /k "cd graphhopper && start-graphhopper.bat"
echo     GraphHopper will run on: http://localhost:8989
timeout /t 8 /nobreak >nul

REM Start Backend API
echo [2/3] Starting Backend API...
start "Backend API" cmd /k "cd backend && npm run dev"
echo     Backend API will run on: http://localhost:3001
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [3/3] Starting Frontend...
start "Frontend Dev Server" cmd /k "npm run dev"
echo     Frontend will run on: http://localhost:5173
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo  All Services Started Successfully!
echo ========================================
echo.
echo  GraphHopper:  http://localhost:8989
echo  Backend API:  http://localhost:3001
echo  Frontend:     http://localhost:5173
echo.
echo ========================================
echo.
echo Three terminal windows have been opened:
echo  1. GraphHopper Server (Java)
echo  2. Backend API (Node.js)
echo  3. Frontend Dev Server (Vite)
echo.
echo To stop all services:
echo  - Close each terminal window, or
echo  - Press Ctrl+C in each window
echo.
echo ========================================
echo.
echo Opening frontend in browser in 5 seconds...
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:5173

echo.
echo Browser opened! Enjoy your routing app!
echo.
echo Press any key to exit this window...
pause >nul
