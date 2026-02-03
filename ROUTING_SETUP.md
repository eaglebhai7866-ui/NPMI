# Local Routing Backend Setup Guide

This guide will help you set up your own routing backend using GraphHopper, replacing third-party APIs like OpenRouteService.

## 🎯 What You'll Build

```
React Frontend → Node.js API → GraphHopper → Pakistan OSM Data
```

## ✅ Prerequisites (Already Installed)

- ✅ Java 21 (installed)
- ✅ Node.js 24.13.0 (installed)
- ✅ npm 11.6.2 (installed)

## 📦 Phase 1: GraphHopper Setup

### Step 1: Download Required Files

Navigate to the `graphhopper/` directory and run:

```bash
cd graphhopper
download.bat
```

This will download:
- GraphHopper JAR file (~50 MB)
- Pakistan OSM data (~150 MB)

**Manual Download (if script fails):**
1. GraphHopper: https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/graphhopper-web-8.0.jar
2. OSM Data: https://download.geofabrik.de/asia/pakistan-latest.osm.pbf

### Step 2: Start GraphHopper Server

```bash
start-graphhopper.bat
```

**First run will take 5-10 minutes** to build the routing graph. You'll see:
```
... building graph from OSM data
... creating graph
... finished graph creation
... started server at HTTP 8989
```

### Step 3: Test GraphHopper

Open in browser:
- Health check: http://localhost:8989/health
- Test route: http://localhost:8989/route?point=33.6844,73.0479&point=33.7294,73.0931&profile=car

You should see JSON response with route data.

## 🔧 Phase 2: Node.js Backend API

### Step 1: Create Backend Project

```bash
# From project root
mkdir backend
cd backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express cors axios dotenv
npm install -D typescript ts-node-dev @types/express @types/cors @types/node
```

### Step 3: Create Project Structure

The backend code will be created in the next phase. Structure:
```
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   └── routing.ts
│   ├── services/
│   │   └── graphhopper.ts
│   └── types/
│       └── routing.ts
├── package.json
├── tsconfig.json
└── .env
```

## 🎨 Phase 3: Frontend Integration

Update your React app to use the local routing API instead of OpenRouteService.

### Environment Variables

Add to `.env.local`:
```env
VITE_ROUTING_API_URL=http://localhost:3001/api
VITE_USE_LOCAL_ROUTING=true
```

## 🚀 Running Everything

### Terminal 1: GraphHopper
```bash
cd graphhopper
start-graphhopper.bat
```

### Terminal 2: Backend API (after Phase 2)
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend
```bash
npm run dev
```

## 📊 Expected Performance

- Route calculation: < 2 seconds
- Graph building (first time): 5-10 minutes
- Memory usage: ~2GB RAM
- Disk space: ~500MB

## 🔍 Troubleshooting

### GraphHopper won't start
- Check Java version: `java -version` (need 11+)
- Check port 8989 is free
- Increase memory: Change `-Xmx2g` to `-Xmx4g`

### Out of memory error
- Close other applications
- Use smaller OSM extract (Islamabad only)
- Increase Java heap: `-Xmx4g`

### OSM data download fails
- Download manually from Geofabrik
- Check internet connection
- Try alternative mirror

### Routes not calculating
- Verify GraphHopper is running: http://localhost:8989/health
- Check coordinates are within Pakistan
- Check logs for errors

## 📝 Next Steps

1. ✅ Complete Phase 1 (GraphHopper setup)
2. ⏳ Phase 2: Build Node.js API
3. ⏳ Phase 3: Integrate with frontend
4. ⏳ Phase 4: Testing and optimization

## 🎯 Success Criteria

- [ ] GraphHopper server running
- [ ] Routes calculated successfully
- [ ] Response time < 2 seconds
- [ ] All travel modes working (car, bike, foot)
- [ ] Alternative routes generated
- [ ] Frontend integrated

## 📚 Resources

- GraphHopper Docs: https://docs.graphhopper.com/
- OSM Data: https://download.geofabrik.de/
- Spec Files: `.kiro/specs/local-routing-backend/`

## 🆘 Need Help?

Check the detailed spec files:
- `requirements.md` - What we're building
- `design.md` - Technical architecture
- `tasks.md` - Step-by-step tasks
