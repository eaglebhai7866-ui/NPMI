# GraphHopper Troubleshooting

## Current Issue: Corrupted OSM File

**Problem:** The Pakistan OSM file download was incomplete or corrupted.

**File size:** 95 MB (should be ~150 MB)

**Error:** `EOFException` when reading PBF file

## Solution: Re-download OSM Data

### Option 1: Manual Download (Recommended)

1. **Delete the corrupted file:**
   ```bash
   del graphhopper\data\pakistan-latest.osm.pbf
   ```

2. **Download manually from browser:**
   - Visit: https://download.geofabrik.de/asia/pakistan.html
   - Click "pakistan-latest.osm.pbf" to download
   - Save to: `graphhopper/data/pakistan-latest.osm.pbf`
   - Verify size: ~150 MB

3. **Restart GraphHopper:**
   ```bash
   cd graphhopper
   start-graphhopper.bat
   ```

### Option 2: Use curl with Resume

```bash
cd graphhopper\data
curl -C - -L -o pakistan-latest.osm.pbf https://download.geofabrik.de/asia/pakistan-latest.osm.pbf
```

The `-C -` flag resumes interrupted downloads.

### Option 3: Use Smaller Region (Faster Testing)

Instead of all Pakistan, use a smaller extract:

**Islamabad/Rawalpindi area:**
- You may need to create a custom extract using osmium or osmosis
- Or use the full Pakistan file (it's not that large)

## Verification

After downloading, verify the file:

```bash
# Check file size (should be ~150 MB)
dir graphhopper\data\pakistan-latest.osm.pbf

# File should be around 150,000,000 bytes
```

## Next Steps After Fix

1. Delete the corrupted file
2. Re-download using Option 1 (manual download)
3. Run `start-graphhopper.bat`
4. Wait 5-10 minutes for graph building
5. Test at: http://localhost:8989/health

## Alternative: Use Your Vector Data

Since you have Islamabad vector data in `NPMI Vector/`, you could:

1. Convert Shapefiles to OSM format (see `CONVERT_SHAPEFILE.md`)
2. Use that instead of Geofabrik data
3. This gives you more control over the data

However, for quick testing, I recommend fixing the Pakistan OSM download first.

## Configuration Files Created

The following config files are ready:
- ✅ `config.yml` - GraphHopper configuration
- ✅ `car.json` - Car routing profile
- ✅ `bike.json` - Bike routing profile  
- ✅ `foot.json` - Walking routing profile

Once the OSM file is fixed, GraphHopper should start successfully!
