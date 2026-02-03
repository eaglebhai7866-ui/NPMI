# Local Routing Integration Guide

This guide explains how to use the local GraphHopper routing backend with your NPMI application.

## Overview

The application now uses **local routing exclusively** with GraphHopper:
- ✅ Fast route calculations (no internet dependency)
- ✅ Works offline with Pakistan OSM data
- ✅ Multiple route alternatives
- ✅ All travel modes (driving, cycling, walking)
- ❌ No fallback to OSRM - local backend must be running
- ℹ️ Shows "Route not found" if location is outside coverage area

## Architecture

```
Frontend (React) → Backend API (Node.js) → GraphHopper (Java) → OSM Data
```

## Quick Start

### Option 1: Start All Services at Once

```bash
start-services.bat
```

This will:
1. Start GraphHopper server on port 8989
2. Start Backend API on port 3001
3. Run integration tests

### Option 2: Start Services Manually

**Step 1: Start GraphHopper**
```bash
cd graphhopper
start-graphhopper.bat
```

Wait for: `Started server at HTTP 8989`

**Step 2: Start Backend API**
```bash
cd backend
npm run dev
```

Wait for: `Server running on http://localhost:3001`

**Step 3: Start Frontend**
```bash
npm run dev
```

## Testing the Integration

### Manual Test

```bash
node test-integration.cjs
```

Expected output:
```
✅ GraphHopper Status: 200
✅ Backend Status: 200
   GraphHopper: ready
✅ Route Calculation: 200
   Routes found: 3
   Distance: 5.42 km
   Duration: 7.0 min
   Steps: 12
```

### Test with curl

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Route Calculation:**
```bash
curl -X POST http://localhost:3001/api/route ^
  -H "Content-Type: application/json" ^
  -d "{\"start\":[73.0479,33.6844],\"end\":[73.0931,33.7294],\"mode\":\"driving\",\"alternatives\":true}"
```

## How It Works

### Frontend Integration

The frontend (`src/components/map/hooks/useRouteAlternatives.ts`) now:

1. **Checks local backend health** before each route calculation
2. **Uses local API exclusively** (GraphHopper via Node.js backend)
3. **Shows error message** if backend is unavailable or route not found
4. **No fallback to OSRM** - ensures all routing uses local data

### API Endpoints

**Backend API (http://localhost:3001/api)**

- `GET /health` - Check if backend and GraphHopper are ready
- `POST /route` - Calculate route with alternatives

**Request Format:**
```json
{
  "start": [73.0479, 33.6844],
  "end": [73.0931, 33.7294],
  "mode": "driving",
  "alternatives": true
}
```

**Response Format:**
```json
{
  "routes": [
    {
      "distance": 5420.5,
      "duration": 420.3,
      "geometry": {
        "type": "LineString",
        "coordinates": [[73.0479, 33.6844], ...]
      },
      "steps": [
        {
          "instruction": "Head north on Main Street",
          "distance": 150.2,
          "duration": 12.5,
          "maneuver": {
            "type": "depart",
            "location": [73.0479, 33.6844]
          },
          "name": "Main Street"
        }
      ]
    }
  ]
}
```

## Configuration

### Backend Must Be Running

The application **requires** the local backend to be running:
- GraphHopper must be running on port 8989
- Backend API must be running on port 3001
- If either service is down, routing will not work

To start services:
```bash
# Terminal 1: GraphHopper
cd graphhopper
start-graphhopper.bat

# Terminal 2: Backend API
cd backend
npm run dev
```

### Change Backend URL

Edit `backend/.env`:

```env
PORT=3001
GRAPHHOPPER_URL=http://localhost:8989
```

### GraphHopper Settings

Edit `graphhopper/config.yml` to:
- Change profiles (car, bike, foot)
- Adjust memory settings
- Enable/disable features

## Troubleshooting

### GraphHopper won't start

**Error:** `Port 8989 already in use`
```bash
# Find and kill the process
netstat -ano | findstr :8989
taskkill /PID <PID> /F
```

**Error:** `OutOfMemoryError`
```bash
# Edit start-graphhopper.bat and increase memory:
java -Xmx2g -jar graphhopper-web-8.0.jar server config.yml
```

### Backend API errors

**Error:** `Cannot connect to GraphHopper`
- Make sure GraphHopper is running on port 8989
- Check `http://localhost:8989/health`

**Error:** `Port 3001 already in use`
```bash
# Change port in backend/.env
PORT=3002
```

### Frontend not using local routing

**Check browser console:**
- Should see: `"Using local GraphHopper backend"`
- If you see: `"Local backend not available, using OSRM fallback"` - backend is not running

**Verify health endpoint:**
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "graphhopper": "ready"
}
```

## Performance

### Expected Response Times

- **Local routing:** 50-200ms
- **OSRM fallback:** 500-2000ms (depends on internet)

### Memory Usage

- **GraphHopper:** ~1-2 GB RAM
- **Backend API:** ~50-100 MB RAM
- **Total:** ~1.5-2.5 GB RAM

## Data Coverage

Currently using **Pakistan OSM data** from Geofabrik:
- Coverage: All of Pakistan
- Last updated: Check `graphhopper/data/pakistan-*.osm.pbf` date
- Size: ~148 MB

### Update OSM Data

```bash
cd graphhopper
# Download latest data
download.bat
# Restart GraphHopper to rebuild graph
```

## Development

### Backend Development

```bash
cd backend
npm run dev  # Auto-reloads on code changes
```

### Add New Features

1. **Add endpoint** in `backend/src/routes/routing.ts`
2. **Add service method** in `backend/src/services/graphhopper.ts`
3. **Update frontend** in `src/lib/routing-api.ts`

### Testing

```bash
# Test backend
cd backend
npm test

# Test integration
node test-integration.cjs
```

## Production Deployment

### Option 1: VPS Deployment

1. Deploy GraphHopper + Backend to VPS (Hetzner/DigitalOcean)
2. Use Nginx as reverse proxy
3. Enable HTTPS with Let's Encrypt
4. Use PM2 for process management

### Option 2: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Next Steps

- [ ] Add route caching (Redis)
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Integrate custom Shapefile data
- [ ] Add traffic data integration
- [ ] Deploy to production

## Support

For issues or questions:
1. Check `graphhopper/TROUBLESHOOTING.md`
2. Check `backend/README.md`
3. Review browser console logs
4. Check backend logs

## Files Reference

- `src/lib/routing-api.ts` - Frontend API client
- `src/components/map/hooks/useRouteAlternatives.ts` - Routing hook
- `backend/src/services/graphhopper.ts` - GraphHopper service
- `backend/src/routes/routing.ts` - API endpoints
- `graphhopper/config.yml` - GraphHopper configuration
- `test-integration.cjs` - Integration test script
- `start-services.bat` - Start all services
