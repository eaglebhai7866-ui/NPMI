# 🚀 Quick Reference Guide

## Starting the Application

### Option 1: Start All Services at Once (Recommended)
```bash
startup.bat
```

This will:
- Start GraphHopper server (port 8989)
- Start Backend API (port 3001)
- Start Frontend dev server (port 5173)
- Open browser automatically

### Option 2: Start Services Individually

**1. Start GraphHopper:**
```bash
cd graphhopper
start-graphhopper.bat
```
Wait for: "Started server at HTTP 8989"

**2. Start Backend API:**
```bash
cd backend
npm run dev
```
Wait for: "Backend server running on port 3001"

**3. Start Frontend:**
```bash
npm run dev
```
Opens at: http://localhost:5173

## Testing the Application

### 1. Basic Route Test
1. Open http://localhost:5173
2. Click the routing button (bottom left)
3. Click on map to set start point
4. Click on map to set end point
5. You should see **3 routes** appear

### 2. Alternative Routes
- **Purple line** = Selected route
- **Gray lines** = Alternative routes
- **Click any gray route** to select it

### 3. Travel Modes
- Click the mode selector (car/bike/foot icon)
- Routes will recalculate for new mode

### 4. Route Information
- Distance and duration shown for each route
- Route type: Fastest, Shortest, or Balanced
- Click route card to select

## API Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "graphhopper": "ready"
}
```

### Calculate Route
```bash
curl -X POST http://localhost:3001/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "start": [73.0479, 33.6844],
    "end": [73.0169, 33.5651],
    "mode": "driving",
    "alternatives": true
  }'
```

## Common Issues

### Issue: "Local routing backend is not available"
**Solution:**
1. Check if GraphHopper is running: `curl http://localhost:8989/health`
2. Check if backend is running: `curl http://localhost:3001/api/health`
3. Restart services using `start-services.bat`

### Issue: Only 1 route showing
**Solution:**
1. Check if CH/LM are disabled in `graphhopper/config.yml`
2. Delete `graphhopper/graph-cache/` folder
3. Restart GraphHopper (will rebuild graph)

### Issue: "Route not found"
**Possible Causes:**
- Points outside Pakistan
- Points not on road network
- No viable route exists

**Solution:**
- Try different points within Islamabad
- Use test coordinates: (33.6844, 73.0479) to (33.5651, 73.0169)

### Issue: GraphHopper won't start
**Solution:**
1. Check Java version: `java -version` (need 11+)
2. Check if port 8989 is in use
3. Check `graphhopper/config.yml` syntax

## Test Coordinates (Islamabad)

### Blue Area to F-6
```
Start: 33.7294, 73.0931
End: 33.7215, 73.0551
```

### Rawalpindi to Islamabad
```
Start: 33.5651, 73.0169
End: 33.6844, 73.0479
```

### Zero Point to Faisal Mosque
```
Start: 33.7380, 73.0880
End: 33.7294, 73.0400
```

## File Locations

### Configuration Files
- GraphHopper config: `graphhopper/config.yml`
- Backend env: `backend/.env`
- Frontend env: `.env.local` (not needed)

### Log Files
- GraphHopper: Console output
- Backend: Console output
- Frontend: Browser console

### Data Files
- OSM data: `graphhopper/data/pakistan-260201.osm.pbf`
- Graph cache: `graphhopper/graph-cache/`

## Performance Tips

### Faster Route Calculation
- Use smaller OSM extract (Islamabad only)
- Re-enable CH for single routes (no alternatives)
- Add response caching in backend

### Reduce Memory Usage
- Adjust JVM settings in start script
- Use smaller OSM extract
- Reduce graph cache size

## Useful Commands

### Check Service Status
```bash
# GraphHopper
curl http://localhost:8989/health

# Backend
curl http://localhost:3001/api/health

# Frontend
# Open http://localhost:5173 in browser
```

### View Logs
```bash
# GraphHopper logs
# Check console where start-graphhopper.bat is running

# Backend logs
# Check console where npm run dev is running

# Frontend logs
# Open browser DevTools (F12) → Console
```

### Restart Services
```bash
# Stop all services
shutdown.bat

# Start all services
startup.bat
```

## Browser DevTools

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "route"
4. Click on request to see details

### Check Console Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Look for:
   - "Using local GraphHopper backend"
   - "Local backend returned X route(s)"

### Check Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages

## Feature Flags

### In Frontend Code
```typescript
// src/lib/routing-api.ts
const LOCAL_API_URL = 'http://localhost:3001/api';
// Change port if backend runs on different port
```

### In Backend Code
```typescript
// backend/src/services/graphhopper.ts
constructor(baseUrl: string = 'http://localhost:8989')
// Change port if GraphHopper runs on different port
```

### In GraphHopper Config
```yaml
# graphhopper/config.yml
server:
  application_connectors:
    - type: http
      port: 8989  # Change if needed
```

## Keyboard Shortcuts

### In Application
- **Esc** - Close panels
- **Ctrl+F** - Search location
- **+/-** - Zoom in/out

### In Browser
- **F12** - Open DevTools
- **Ctrl+Shift+R** - Hard refresh
- **Ctrl+Shift+I** - Open DevTools

## Documentation Files

- `PROJECT_STATUS.md` - Current status overview
- `LOCAL_ROUTING_GUIDE.md` - Detailed setup guide
- `ALTERNATIVE_ROUTES_FIXED.md` - Alternative routes fix
- `test-frontend-integration.md` - Test results
- `QUICK_REFERENCE.md` - This file

## Support

### Check Documentation
1. Read `LOCAL_ROUTING_GUIDE.md` for setup
2. Read `ALTERNATIVE_ROUTES_FIXED.md` for alternative routes
3. Read `graphhopper/TROUBLESHOOTING.md` for GraphHopper issues

### Debug Steps
1. Check all services are running
2. Check browser console for errors
3. Check backend console for errors
4. Check GraphHopper console for errors
5. Test API endpoints with curl

### Common Solutions
- **Restart services** - Fixes most issues
- **Clear browser cache** - Fixes frontend issues
- **Rebuild graph** - Fixes GraphHopper issues
- **Check ports** - Ensure no conflicts

## Success Indicators

✅ **Everything Working:**
- GraphHopper: "Started server at HTTP 8989"
- Backend: "Backend server running on port 3001"
- Frontend: Map loads, routing works
- Routes: 3 alternatives shown
- Console: "Local backend returned 3 route(s)"

❌ **Something Wrong:**
- Error messages in console
- Routes not calculating
- Only 1 route showing
- "Backend not available" error

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Services won't start | Check Java version, ports not in use |
| No routes showing | Check backend connection, try test coordinates |
| Only 1 route | Rebuild graph with CH/LM disabled |
| Slow performance | Use smaller OSM extract, enable CH |
| Route not found | Try different coordinates within Pakistan |
| Backend error | Check GraphHopper is running first |

## That's It! 🎉

You now have a fully functional local routing application with:
- ✅ 3 alternative routes
- ✅ Fast performance
- ✅ Beautiful UI
- ✅ Complete error handling

Enjoy routing! 🚀
