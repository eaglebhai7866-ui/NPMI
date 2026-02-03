@echo off
echo ========================================
echo GraphHopper Setup - Download Script
echo ========================================
echo.

echo Step 1: Downloading GraphHopper JAR...
curl -L -o graphhopper-web-8.0.jar https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/graphhopper-web-8.0.jar
if %errorlevel% neq 0 (
    echo ERROR: Failed to download GraphHopper JAR
    echo Please download manually from:
    echo https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/graphhopper-web-8.0.jar
    pause
    exit /b 1
)
echo GraphHopper JAR downloaded successfully!
echo.

echo Step 2: Downloading Pakistan OSM data...
echo This may take a few minutes (~150 MB)...
curl -L -o data\pakistan-latest.osm.pbf https://download.geofabrik.de/asia/pakistan-latest.osm.pbf
if %errorlevel% neq 0 (
    echo ERROR: Failed to download OSM data
    echo Please download manually from:
    echo https://download.geofabrik.de/asia/pakistan-latest.osm.pbf
    pause
    exit /b 1
)
echo OSM data downloaded successfully!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: start-graphhopper.bat
echo 2. Wait for graph building to complete
echo 3. Test at: http://localhost:8989/health
echo.
pause
