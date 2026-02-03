@echo off
echo ========================================
echo Starting GraphHopper Routing Server
echo ========================================
echo.

REM Check if JAR exists
if not exist "graphhopper-web-8.0.jar" (
    echo ERROR: graphhopper-web-8.0.jar not found!
    echo Please run download.bat first
    pause
    exit /b 1
)

REM Check if OSM data exists
if not exist "data\pakistan-latest.osm.pbf" (
    echo ERROR: OSM data not found!
    echo Please run download.bat first
    pause
    exit /b 1
)

echo Starting GraphHopper server...
echo Memory: 2GB
echo Port: 8989
echo.
echo This will take 5-10 minutes on first run (building graph)
echo.
echo Press Ctrl+C to stop the server
echo.

java -Xmx2g -jar graphhopper-web-8.0.jar server config.yml
