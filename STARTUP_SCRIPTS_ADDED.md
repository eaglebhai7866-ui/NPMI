# ✅ Unified Startup Scripts Added!

## What Was Created

### 1. startup.bat ⭐
**Single command to start everything!**

```bash
startup.bat
```

**What it does:**
- ✅ Starts GraphHopper server (port 8989)
- ✅ Starts Backend API (port 3001)
- ✅ Starts Frontend dev server (port 5173)
- ✅ Opens browser automatically
- ✅ Shows status messages
- ✅ Opens 3 terminal windows (one for each service)

**Features:**
- Proper timing delays between services
- Clear status messages
- Automatic browser launch
- Keeps terminal windows open for logs

### 2. shutdown.bat
**Single command to stop everything!**

```bash
shutdown.bat
```

**What it does:**
- ✅ Stops all Node.js processes (Backend + Frontend)
- ✅ Stops all Java processes (GraphHopper)
- ✅ Closes all terminal windows
- ✅ Shows confirmation messages

### 3. STARTUP_GUIDE.md
**Comprehensive startup documentation**

Includes:
- Quick start instructions
- Step-by-step startup process
- Terminal window explanations
- Troubleshooting guide
- Health check commands
- Advanced usage tips

## How to Use

### Start Everything
```bash
# Just double-click or run:
startup.bat
```

**Wait ~15 seconds**, then:
- GraphHopper: ✅ Running on port 8989
- Backend API: ✅ Running on port 3001
- Frontend: ✅ Running on port 5173
- Browser: ✅ Opens automatically

### Stop Everything
```bash
# Just double-click or run:
shutdown.bat
```

All services stop immediately!

## Comparison with Old Method

### Before (Manual)
```bash
# Terminal 1
cd graphhopper
start-graphhopper.bat

# Wait 30 seconds...

# Terminal 2
cd backend
npm run dev

# Wait 5 seconds...

# Terminal 3
npm run dev

# Open browser manually
```

**Time**: ~2 minutes with manual steps

### After (Automated)
```bash
startup.bat
```

**Time**: ~15 seconds, fully automated! 🚀

## What Happens When You Run startup.bat

### Timeline

**0s**: Script starts
```
========================================
 NPMI Routing Application Startup
========================================
```

**0-8s**: GraphHopper starts
```
[1/3] Starting GraphHopper server...
      GraphHopper will run on: http://localhost:8989
```

**8-13s**: Backend API starts
```
[2/3] Starting Backend API...
      Backend API will run on: http://localhost:3001
```

**13-16s**: Frontend starts
```
[3/3] Starting Frontend...
      Frontend will run on: http://localhost:5173
```

**16-21s**: Browser opens
```
Opening frontend in browser in 5 seconds...
```

**21s**: Done! ✅

### Terminal Windows

You'll see **3 new terminal windows**:

#### Window 1: GraphHopper
```
========================================
🚀 GraphHopper Server
========================================
✅ Server started on port 8989
📊 Graph: 2,263,498 nodes, 2,907,444 edges
========================================
```

#### Window 2: Backend API
```
========================================
🚀 NPMI Routing Backend
========================================
✅ Server running on http://localhost:3001
📍 GraphHopper: http://localhost:8989
========================================
```

#### Window 3: Frontend
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Benefits

### 1. Simplicity
- **One command** instead of three
- **No manual waiting** between services
- **Automatic browser** opening

### 2. Reliability
- **Proper timing** between services
- **Clear status** messages
- **Error handling** built-in

### 3. Convenience
- **Double-click** to start
- **Easy shutdown** with shutdown.bat
- **Logs visible** in separate windows

### 4. Developer Experience
- **Faster startup** workflow
- **Less context switching**
- **Clear service status**

## Files Updated

### New Files
- ✅ `startup.bat` - Unified startup script
- ✅ `shutdown.bat` - Unified shutdown script
- ✅ `STARTUP_GUIDE.md` - Comprehensive guide

### Updated Files
- ✅ `README.md` - Added quick start section
- ✅ `QUICK_REFERENCE.md` - Updated startup commands

## Troubleshooting

### Issue: "Port already in use"
```bash
# Use shutdown.bat first
shutdown.bat

# Then start again
startup.bat
```

### Issue: Services don't start
Check:
1. Java installed? `java -version`
2. Node.js installed? `node -v`
3. Dependencies installed? `npm install`

### Issue: Browser doesn't open
Manually open: http://localhost:5173

## Advanced Usage

### Start Only Specific Services

**GraphHopper only:**
```bash
cd graphhopper
start-graphhopper.bat
```

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
npm run dev
```

### Check Service Status

**PowerShell:**
```powershell
Get-Process java  # GraphHopper
Get-Process node  # Backend + Frontend
```

**Command Prompt:**
```bash
tasklist | findstr java.exe
tasklist | findstr node.exe
```

### Health Checks

```bash
# GraphHopper
curl http://localhost:8989/health

# Backend
curl http://localhost:3001/api/health

# Frontend
# Open http://localhost:5173
```

## Documentation

All documentation updated:
- ✅ `STARTUP_GUIDE.md` - New comprehensive guide
- ✅ `README.md` - Quick start section
- ✅ `QUICK_REFERENCE.md` - Updated commands
- ✅ `LOCAL_ROUTING_GUIDE.md` - Existing detailed guide

## Git Status

✅ **Committed and pushed to GitHub**

**Commit message:**
```
feat: Add unified startup script for all services
- Created startup.bat to start GraphHopper, Backend, and Frontend
- Created shutdown.bat to stop all services at once
- Added STARTUP_GUIDE.md with comprehensive instructions
- Updated README.md and QUICK_REFERENCE.md
- Opens browser automatically after startup
```

**Files changed:** 5 files, 506 insertions

## Summary

### Before
- ❌ Manual startup (3 commands)
- ❌ Manual timing between services
- ❌ Manual browser opening
- ❌ Hard to stop all services

### After
- ✅ One command: `startup.bat`
- ✅ Automatic timing
- ✅ Automatic browser
- ✅ Easy shutdown: `shutdown.bat`

## Next Steps

### To Start Working
```bash
# Just run:
startup.bat

# Wait 15 seconds
# Browser opens automatically
# Start coding!
```

### To Stop Working
```bash
# Just run:
shutdown.bat

# All services stop
# All windows close
# Done!
```

## That's It! 🎉

Your NPMI routing application now has:
- ✅ One-command startup
- ✅ One-command shutdown
- ✅ Automatic browser opening
- ✅ Clear status messages
- ✅ Comprehensive documentation

**Just run `startup.bat` and you're ready to go!** 🚀

---

**Created**: February 3, 2026
**Status**: ✅ Complete and pushed to GitHub
**Commit**: a1ca68c
