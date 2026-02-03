# 🚀 NPMI Startup Guide

## Quick Start

### Start Everything at Once
```bash
startup.bat
```

This single command will:
1. ✅ Start GraphHopper server (port 8989)
2. ✅ Start Backend API (port 3001)
3. ✅ Start Frontend dev server (port 5173)
4. ✅ Open browser automatically

**Wait time**: ~15 seconds for all services to start

### Stop Everything
```bash
shutdown.bat
```

This will stop all services (GraphHopper, Backend, Frontend).

## What Happens When You Run startup.bat

### Step 1: GraphHopper Server (8 seconds)
```
[1/3] Starting GraphHopper server...
      GraphHopper will run on: http://localhost:8989
```

A new terminal window opens with GraphHopper logs.
Wait for: "Started server at HTTP 8989"

### Step 2: Backend API (5 seconds)
```
[2/3] Starting Backend API...
      Backend API will run on: http://localhost:3001
```

A new terminal window opens with Backend logs.
Wait for: "Backend server running on port 3001"

### Step 3: Frontend (3 seconds)
```
[3/3] Starting Frontend...
      Frontend will run on: http://localhost:5173
```

A new terminal window opens with Vite dev server.
Wait for: "Local: http://localhost:5173/"

### Step 4: Browser Opens
After 5 seconds, your default browser opens to http://localhost:5173

## Terminal Windows

After running `startup.bat`, you'll see **3 terminal windows**:

### Window 1: GraphHopper Server
```
========================================
🚀 GraphHopper Server
========================================
✅ Server started on port 8989
📊 Graph: 2,263,498 nodes, 2,907,444 edges
🗺️  Data: Pakistan OSM
========================================
```

**Keep this window open!** GraphHopper must run continuously.

### Window 2: Backend API
```
========================================
🚀 NPMI Routing Backend
========================================
✅ Server running on http://localhost:3001
📍 GraphHopper: http://localhost:8989
🌍 Environment: development
========================================
```

**Keep this window open!** Backend must run continuously.

### Window 3: Frontend Dev Server
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Keep this window open!** Frontend must run continuously.

## Stopping Services

### Option 1: Use shutdown.bat (Recommended)
```bash
shutdown.bat
```

This will:
- Kill all Node.js processes (Backend + Frontend)
- Kill all Java processes (GraphHopper)
- Close all terminal windows

### Option 2: Manual Shutdown
1. Go to each terminal window
2. Press `Ctrl+C`
3. Close the window

### Option 3: Task Manager
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find and end:
   - `java.exe` (GraphHopper)
   - `node.exe` (Backend + Frontend)

## Troubleshooting

### Issue: "Port already in use"

**GraphHopper (8989)**:
```bash
# Find process using port 8989
netstat -ano | findstr :8989

# Kill the process (replace PID with actual number)
taskkill /F /PID <PID>
```

**Backend (3001)**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process
taskkill /F /PID <PID>
```

**Frontend (5173)**:
```bash
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process
taskkill /F /PID <PID>
```

### Issue: GraphHopper won't start

**Check Java version**:
```bash
java -version
```

Should be Java 11 or higher.

**Check if JAR file exists**:
```bash
dir graphhopper\*.jar
```

Should show `graphhopper-web-8.0.jar`

**Check if OSM data exists**:
```bash
dir graphhopper\data\*.pbf
```

Should show `pakistan-260201.osm.pbf`

### Issue: Backend won't start

**Check Node.js version**:
```bash
node -v
```

Should be v18 or higher.

**Install dependencies**:
```bash
cd backend
npm install
```

**Check if GraphHopper is running**:
```bash
curl http://localhost:8989/health
```

### Issue: Frontend won't start

**Install dependencies**:
```bash
npm install
```

**Check if ports are available**:
```bash
netstat -ano | findstr :5173
```

### Issue: Browser doesn't open

Manually open: http://localhost:5173

### Issue: Services start but app doesn't work

**Check all services are running**:
```bash
# GraphHopper
curl http://localhost:8989/health

# Backend
curl http://localhost:3001/api/health

# Frontend
# Open http://localhost:5173 in browser
```

## Advanced Usage

### Start Services in Different Order

**If you want to start manually**:

1. **Start GraphHopper first** (takes longest):
```bash
cd graphhopper
start-graphhopper.bat
```

2. **Wait for GraphHopper** (30-60 seconds for graph building)

3. **Start Backend**:
```bash
cd backend
npm run dev
```

4. **Start Frontend**:
```bash
npm run dev
```

### Run in Background (No Terminal Windows)

**Not recommended for development**, but if needed:

```bash
# GraphHopper
start /B java -jar graphhopper/graphhopper-web-8.0.jar server graphhopper/config.yml

# Backend
start /B cmd /c "cd backend && npm run dev"

# Frontend
start /B cmd /c "npm run dev"
```

### Check Service Status

**PowerShell**:
```powershell
# Check if services are running
Get-Process java -ErrorAction SilentlyContinue  # GraphHopper
Get-Process node -ErrorAction SilentlyContinue  # Backend + Frontend
```

**Command Prompt**:
```bash
tasklist | findstr java.exe
tasklist | findstr node.exe
```

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| GraphHopper | http://localhost:8989 | Routing engine |
| Backend API | http://localhost:3001 | REST API |
| Frontend | http://localhost:5173 | Web application |

## Health Checks

### GraphHopper
```bash
curl http://localhost:8989/health
```

Expected: `{"status":"ok"}`

### Backend
```bash
curl http://localhost:3001/api/health
```

Expected:
```json
{
  "status": "ok",
  "graphhopper": "ready",
  "cache": {...},
  "timestamp": "..."
}
```

### Frontend
Open http://localhost:5173 in browser.
Should see the map interface.

## Logs

### GraphHopper Logs
- **Location**: Terminal window
- **File**: None (console only)

### Backend Logs
- **Location**: `backend/logs/`
- **Files**:
  - `combined.log` - All logs
  - `error.log` - Errors only
- **Console**: Terminal window

### Frontend Logs
- **Location**: Browser DevTools (F12 → Console)
- **Terminal**: Vite dev server logs

## Performance

### Startup Times
- **GraphHopper**: 30-60 seconds (first time with graph building)
- **GraphHopper**: 5-10 seconds (subsequent starts)
- **Backend**: 2-3 seconds
- **Frontend**: 2-3 seconds
- **Total**: ~15-20 seconds (after initial setup)

### Memory Usage
- **GraphHopper**: ~500MB-1GB
- **Backend**: ~50-100MB
- **Frontend**: ~100-200MB
- **Total**: ~650MB-1.3GB

## Tips

### Faster Startup
1. Keep GraphHopper running (slowest to start)
2. Only restart Backend/Frontend when needed
3. Use `npm run dev` for hot reload (no restart needed)

### Development Workflow
1. Run `startup.bat` once in the morning
2. Make code changes
3. Frontend auto-reloads (Vite HMR)
4. Backend auto-reloads (ts-node-dev)
5. Only restart GraphHopper if config changes

### Production Mode
For production, use:
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
# Serve dist/ folder with nginx or similar
```

## Summary

✅ **Start everything**: `startup.bat`
✅ **Stop everything**: `shutdown.bat`
✅ **3 terminal windows** will open
✅ **Browser opens automatically**
✅ **Wait ~15 seconds** for all services

That's it! Your NPMI routing application is ready to use! 🎉

---

**Need help?** Check:
- `QUICK_REFERENCE.md` - Quick commands
- `LOCAL_ROUTING_GUIDE.md` - Detailed setup
- `TROUBLESHOOTING.md` - Common issues
