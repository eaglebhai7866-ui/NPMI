# GraphHopper Setup Guide

## Step 1: Download GraphHopper JAR

Download GraphHopper 8.0:
```
https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/graphhopper-web-8.0.jar
```

Save it to this `graphhopper/` directory.

## Step 2: Download OSM Data

Download Pakistan OSM data from Geofabrik:
```
https://download.geofabrik.de/asia/pakistan-latest.osm.pbf
```

Save it to `graphhopper/data/pakistan-latest.osm.pbf`

## Step 3: Start GraphHopper

Run this command from the `graphhopper/` directory:

```bash
java -Xmx2g -jar graphhopper-web-8.0.jar server config.yml
```

Wait for the graph to build (5-10 minutes for Pakistan data).

## Step 4: Test GraphHopper

Once running, test the health endpoint:
```
http://localhost:8989/health
```

Test a route (Islamabad example):
```
http://localhost:8989/route?point=33.6844,73.0479&point=33.7294,73.0931&profile=car
```

## Troubleshooting

**Issue: Out of memory**
- Increase memory: `-Xmx4g` (4GB)
- Or use smaller OSM extract

**Issue: Port already in use**
- Change port in config.yml
- Or kill process using port 8989

**Issue: Graph building fails**
- Check OSM file is valid
- Ensure enough disk space (~500MB)
- Check Java version (need 11+)
