@echo off
echo ========================================
echo  NPMI Routing Application Shutdown
echo ========================================
echo.
echo Stopping all services...
echo.

REM Kill Node.js processes (Backend and Frontend)
echo [1/2] Stopping Node.js processes (Backend + Frontend)...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo     Node.js processes stopped successfully
) else (
    echo     No Node.js processes found
)

REM Kill Java processes (GraphHopper)
echo [2/2] Stopping Java processes (GraphHopper)...
taskkill /F /IM java.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo     Java processes stopped successfully
) else (
    echo     No Java processes found
)

echo.
echo ========================================
echo  All Services Stopped!
echo ========================================
echo.
echo All terminal windows should now be closed.
echo.
echo Press any key to exit...
pause >nul
