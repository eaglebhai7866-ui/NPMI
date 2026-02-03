# Local Routing Backend - Requirements

## Overview
Replace third-party routing APIs (OpenRouteService) with a self-hosted routing backend using GraphHopper and local Pakistan/Islamabad OSM data. This is the foundation for building a Pakistan-focused navigation app with custom routing logic and live traffic integration.

## Goals
- Independence from third-party routing APIs
- Faster routing responses (local server)
- Foundation for custom routing logic
- Ability to integrate live traffic data
- Support for Pakistan-specific road conditions

## User Stories

### 1. As a developer, I want to set up GraphHopper server locally
**Acceptance Criteria:**
- GraphHopper is installed and running on local machine
- Server responds to health check requests
- Configuration files are properly set up
- Server can be started/stopped easily

### 2. As a developer, I want to import Islamabad OSM data into GraphHopper
**Acceptance Criteria:**
- OSM data for Islamabad is downloaded (if not using existing data)
- Data is imported into GraphHopper
- Road network is properly indexed
- Routing graph is built successfully
- Server can calculate routes within Islamabad

### 3. As a developer, I want to create a Node.js backend API
**Acceptance Criteria:**
- Express.js server is set up
- API endpoints are defined for routing
- Server communicates with GraphHopper
- CORS is configured for frontend access
- Error handling is implemented
- API documentation is available

### 4. As a user, I want to calculate routes using the local backend
**Acceptance Criteria:**
- Frontend calls local API instead of OpenRouteService
- Routes are calculated successfully
- Response includes geometry, distance, duration, and turn-by-turn instructions
- Multiple travel modes are supported (driving, cycling, walking)
- Route alternatives are generated
- Performance is equal to or better than third-party API

### 5. As a developer, I want to handle route calculation errors gracefully
**Acceptance Criteria:**
- Network errors are caught and handled
- Invalid coordinates are validated
- Timeout errors are handled
- User-friendly error messages are displayed
- Fallback to third-party API if local server is down (optional)

### 6. As a developer, I want to configure the backend for production deployment
**Acceptance Criteria:**
- Environment variables are used for configuration
- Server can run on different ports
- GraphHopper memory settings are optimized
- Logging is implemented
- Health check endpoint is available

## Technical Requirements

### Backend Stack
- **Routing Engine:** GraphHopper (Java-based, open-source)
- **API Server:** Node.js + Express
- **Data Format:** OSM PBF (Protocol Buffer Format)
- **Alternative:** OSRM (if GraphHopper proves difficult)

### Data Sources
- **Primary:** Existing Islamabad data in `NPMI Vector/` folder
- **Alternative:** Download Pakistan OSM data from Geofabrik
- **Format:** Shapefile → OSM PBF conversion (if needed)

### API Endpoints

#### 1. Route Calculation
```
POST /api/route
Body: {
  start: [lng, lat],
  end: [lng, lat],
  mode: "driving" | "cycling" | "walking",
  alternatives: boolean
}
Response: {
  routes: [{
    distance: number,
    duration: number,
    geometry: GeoJSON.LineString,
    steps: NavigationStep[]
  }]
}
```

#### 2. Health Check
```
GET /api/health
Response: {
  status: "ok" | "error",
  graphhopper: "ready" | "loading" | "error"
}
```

### Frontend Changes
- Update `useRouteAlternatives.ts` to call local API
- Add environment variable for API URL
- Maintain backward compatibility with OpenRouteService (fallback)
- Update error handling for local API responses

## Non-Functional Requirements

### Performance
- Route calculation: < 2 seconds for typical routes
- Server startup: < 30 seconds
- Memory usage: < 2GB RAM for Islamabad data

### Reliability
- Server uptime: 99%+ during development
- Graceful error handling
- Automatic restart on crash (using PM2 or similar)

### Scalability (Future)
- Support for all Pakistan cities
- Multiple concurrent requests
- Caching for common routes

## Out of Scope (Phase 1)
- Live traffic integration (Phase 2)
- Community reports (Phase 2)
- GPS tracking (Phase 2)
- Multiple city support (start with Islamabad only)
- Production deployment to cloud
- Load balancing
- Database for storing routes

## Dependencies
- Java 11+ (for GraphHopper)
- Node.js 18+ (for API server)
- OSM data (Islamabad/Pakistan)
- Existing frontend codebase

## Risks & Mitigations

### Risk 1: OSM data quality in Pakistan
**Mitigation:** Start with Islamabad (better coverage), validate routes manually, plan for community editing

### Risk 2: GraphHopper complexity
**Mitigation:** Use OSRM as backup option, follow official documentation, use Docker if needed

### Risk 3: Shapefile to OSM conversion issues
**Mitigation:** Use existing OSM data from Geofabrik instead, or use QGIS for conversion

### Risk 4: Performance on local machine
**Mitigation:** Start with small area (Islamabad), optimize GraphHopper settings, consider cloud deployment later

## Success Metrics
- ✅ GraphHopper server running locally
- ✅ Routes calculated successfully for Islamabad
- ✅ Frontend integrated with local API
- ✅ Response time < 2 seconds
- ✅ All travel modes working
- ✅ Turn-by-turn instructions generated
- ✅ Route alternatives available

## Next Steps After Phase 1
1. Expand to more Pakistan cities
2. Add live traffic data collection
3. Implement community reports
4. Deploy to production server
5. Add route optimization algorithms
6. Integrate historical traffic patterns
