# Testing Coordinates for Local Routing

## Issue: "Cannot find point" Error

If you see this error:
```
GraphHopper error: Cannot find point 0: 31.224600512188317,70.54260976562293
```

This means the coordinates are **outside the road network** in the OSM data. The system correctly falls back to OSRM in this case.

## ✅ Valid Test Coordinates (Islamabad)

Use these coordinates to test local routing successfully:

### Test Route 1: Blue Area to F-6 Markaz
- **Start**: Blue Area, Islamabad
  - Coordinates: `[73.0479, 33.6844]`
- **End**: F-6 Markaz, Islamabad
  - Coordinates: `[73.0931, 33.7294]`
- **Expected**: ~5-6 km route

### Test Route 2: Faisal Mosque to Pakistan Monument
- **Start**: Faisal Mosque
  - Coordinates: `[73.0375, 33.7295]`
- **End**: Pakistan Monument
  - Coordinates: `[73.0688, 33.6930]`
- **Expected**: ~4-5 km route

### Test Route 3: Centaurus Mall to Jinnah Super
- **Start**: Centaurus Mall
  - Coordinates: `[73.0742, 33.7098]`
- **End**: Jinnah Super Market
  - Coordinates: `[73.0931, 33.7294]`
- **Expected**: ~2-3 km route

### Test Route 4: Rawalpindi to Islamabad
- **Start**: Saddar, Rawalpindi
  - Coordinates: `[73.0551, 33.5976]`
- **End**: Zero Point, Islamabad
  - Coordinates: `[73.0479, 33.6844]`
- **Expected**: ~10-12 km route

## Coverage Area

The Pakistan OSM data covers:
- ✅ **Islamabad** - Full coverage
- ✅ **Rawalpindi** - Full coverage
- ✅ **Major cities** - Good coverage
- ✅ **Highways** - Good coverage
- ⚠️ **Remote areas** - Limited coverage
- ❌ **Very remote areas** - No coverage

## How to Test in the App

### Method 1: Click on Map (Recommended)
1. Open the app
2. Click routing button
3. **Zoom into Islamabad city center**
4. Click on a **major road** for start point
5. Click on another **major road** for end point
6. Route should calculate using local backend

### Method 2: Search for Locations
1. Search for "Blue Area Islamabad"
2. Click routing button
3. Search for "F-6 Markaz Islamabad"
4. Route should calculate using local backend

### Method 3: Use Current Location
1. Click "My Location" button (if in Pakistan)
2. Click routing button
3. Click destination on map
4. Route should calculate using local backend

## Verifying Local Routing is Working

### ✅ Success Indicators

**In Browser Console:**
```
Using local GraphHopper backend
Local backend returned 1 route(s)
Processed local routes: [...]
```

**Performance:**
- Response time: 50-200ms (very fast!)
- Multiple alternatives may appear

### ❌ Fallback to OSRM

**In Browser Console:**
```
Local backend error, falling back to OSRM: Error: GraphHopper error: Cannot find point...
Fetching OSRM route alternatives...
```

**Reasons for fallback:**
1. Coordinates outside road network
2. Very remote area with no roads
3. Coordinates in water/restricted area
4. Backend/GraphHopper not running

## Quick Test Script

To test with valid coordinates via API:

```bash
# Test with Islamabad coordinates
curl -X POST http://localhost:3001/api/route \
  -H "Content-Type: application/json" \
  -d "{\"start\":[73.0479,33.6844],\"end\":[73.0931,33.7294],\"mode\":\"driving\",\"alternatives\":true}"
```

Expected response: `200 OK` with route data

#