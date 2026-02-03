# Quick Start Guide

## ✅ What You've Done:
- Downloaded GraphHopper JAR
- Downloaded Pakistan OSM data

## 🚀 Next: Start GraphHopper

### Step 1: Start the Server

```bash
cd graphhopper
start-graphhopper.bat
```

### Step 2: Wait for Graph Building

**First time only:** GraphHopper will build a routing graph from the OSM data.

You'll see messages like:
```
... start creating graph from OSM data
... edges: 1234567
... nodes: 987654
... finished graph creation in 300s
... started server at HTTP 8989
```

**This takes 5-10 minutes for Pakistan data.**

### Step 3: Test It Works

**Option A: Browser**
Open: http://localhost:8989/health

Should see: `{"status":"ok"}`

**Option B: Test Script**
```bash
test-graphhopper.bat
```

**Option C: Test Route (Islamabad)**
```
http://localhost:8989/route?point=33.6844,73.0479&point=33.7294,73.0931&profile=car
```

## 📊 What's Happening:

1. **Graph Building (first time):**
   - Reads Pakistan OSM data
   - Creates routing graph
   - Builds indexes
   - Saves to `graph-cache/` folder

2. **Subsequent Starts:**
   - Loads existing graph from cache
   - Starts in ~30 seconds

## 🎯 Success Indicators:

✅ "started server at HTTP 8989"  
✅ Health endpoint returns OK  
✅ Test route returns JSON with coordinates  

## ⚠️ Troubleshooting:

**"Out of memory" error:**
```bash
# Edit start-graphhopper.bat
# Change: -Xmx2g
# To: -Xmx4g (4GB RAM)
```

**"Port 8989 already in use":**
```bash
# Kill existing process or change port in config.yml
```

**Graph building fails:**
- Check OSM file exists: `data/pakistan-latest.osm.pbf`
- Check file size: ~150 MB
- Check disk space: need ~500 MB free

## 📝 About Your Vector Data:

Your `NPMI Vector/` Shapefiles need conversion to OSM format.

**For now:** Use the Pakistan OSM data (it has complete road network)

**Later:** We can integrate your custom Shapefile data

See: `CONVERT_SHAPEFILE.md` for details

## ✨ Once GraphHopper is Running:

You're ready for **Phase 2: Build Node.js Backend API**

The backend will:
- Connect to GraphHopper
- Provide REST API for your frontend
- Transform responses to match your app's format

---

**Ready? Run:**
```bash
start-graphhopper.bat
```

Then let me know when you see "started server at HTTP 8989"!
