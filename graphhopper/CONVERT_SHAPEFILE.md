# Converting Shapefile to OSM Format

Your `NPMI Vector/` folder contains Shapefiles that need to be converted to OSM format for GraphHopper.

## Files You Have:
- `isb_roads.shp` - Road network
- `isb_points_updated.shp` - POIs

## Conversion Methods:

### Method 1: Using QGIS (Easiest)

1. **Open QGIS** (you already have it installed)

2. **Load your Shapefile:**
   - Layer → Add Layer → Add Vector Layer
   - Select `NPMI Vector/isb_roads.shp`

3. **Export to GeoJSON:**
   - Right-click layer → Export → Save Features As
   - Format: GeoJSON
   - Save as: `graphhopper/data/islamabad-roads.geojson`

4. **Convert GeoJSON to OSM:**
   
   **Option A: Use ogr2osm (Python tool)**
   ```bash
   pip install gdal
   git clone https://github.com/pnorman/ogr2osm
   cd ogr2osm
   python ogr2osm.py ../graphhopper/data/islamabad-roads.geojson
   ```

   **Option B: Use online converter**
   - Upload to: https://mygeodata.cloud/converter/shp-to-osm
   - Download OSM XML file
   - Convert to PBF using osmconvert

5. **Convert OSM XML to PBF:**
   ```bash
   # Download osmconvert
   # Windows: https://wiki.openstreetmap.org/wiki/Osmconvert#Windows
   
   osmconvert islamabad.osm -o=islamabad.osm.pbf
   ```

### Method 2: Use Geofabrik Data + Your Custom Data (Hybrid - Recommended)

**Best approach for production:**

1. **Download Islamabad OSM data** (has complete road network with attributes)
2. **Use your Shapefile data** for custom POIs and local updates
3. **Merge them** using JOSM or osmosis

**Why this is better:**
- OSM data has proper road attributes (speed limits, one-ways, turn restrictions)
- Your data adds local knowledge and custom POIs
- Best of both worlds

### Method 3: Use Geofabrik Data Only (Quickest Start)

**For now, to get started quickly:**

1. Use the Pakistan OSM data you just downloaded
2. Test GraphHopper with it
3. Later, integrate your custom Shapefile data

**This is recommended because:**
- ✅ Works immediately
- ✅ Has complete road network
- ✅ Includes all routing attributes
- ✅ You can add your custom data later

## Recommendation:

**Start with Method 3 (Geofabrik data)** to get GraphHopper working now.

Then, in Phase 2 or 3, we can:
1. Convert your Shapefiles to OSM
2. Merge with Geofabrik data
3. Add your custom POIs and local updates

## Why OSM Format is Required:

GraphHopper needs:
- Road network topology (connections)
- Road attributes (speed limits, one-way, surface type)
- Turn restrictions
- Routing tags (highway type, access restrictions)

Shapefiles typically don't have all these attributes in OSM format.

## Next Steps:

**For now:**
1. Use the Pakistan OSM data you downloaded
2. Start GraphHopper server
3. Test routing

**Later (Phase 2):**
1. Convert your Shapefiles
2. Merge with OSM data
3. Rebuild GraphHopper graph with custom data

---

**Ready to start GraphHopper with the OSM data?**

Run:
```bash
cd graphhopper
start-graphhopper.bat
```
