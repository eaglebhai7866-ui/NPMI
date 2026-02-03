# GraphHopper Routing Server Setup

## Quick Start

### 1. Download GraphHopper JAR

Download the latest GraphHopper web JAR file:

**Option A: Direct Download (Recommended)**
```bash
# Download GraphHopper 8.0
curl -L -o graphhopper-web-8.0.jar https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/graphhopper-web-8.0.jar
```

**Option B: Manual Download**
Visit: https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/
Download: `graphhopper-web-8.0.jar`
Place it in this `graphhopper/` directory

### 2. Download Pakistan OSM Data

**Option A: Full Pakistan (Recommended)**
```bash
# Download from Geofabrik (~150 MB)
curl -L -o data/pakistan-latest.osm.pbf https://download.geofabrik.de/asia/pakistan-latest.osm.pbf
```

**Option B: Islamabad Only (Faster for Testing)**
If available, download a smaller extract for Islamabad region.

### 3. Start GraphHopper Server

```bash
# Windows (CMD)
java -Xmx2g -jar graphhopper-web-8.0.jar server config.yml

# Linux/Mac
java -Xmx2g -jar graphhopper-web-8.0.jar server config.yml
```

**Memory Settings:**
- `-Xmx2g` = 2GB RAM (for full Pakistan)
- `-Xmx1g` = 1GB RAM (for Islamabad only)
- `-Xmx512m` = 512MB RAM (minimum)

### 4. Wait for Graph Building

First