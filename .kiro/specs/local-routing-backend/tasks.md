# Local Routing Backend - Implementation Tasks

## Phase 1: Setup & Installation

### [x] 1. Install Java and GraphHopper
- [x] 1.1 Check if Java 11+ is installed (`java -version`)
- [x] 1.2 Install Java if needed (OpenJDK 11 or higher)
- [x] 1.3 Download GraphHopper JAR file (version 8.0+)
- [x] 1.4 Create `graphhopper/` directory in project root
- [x] 1.5 Move GraphHopper JAR to `graphhopper/` directory

### [x] 2. Download OSM Data
- [x] 2.1 Download Pakistan OSM data from Geofabrik
- [x] 2.2 Save to `graphhopper/data/pakistan-latest.osm.pbf`
- [x] 2.3 Verify file size and integrity
- [x] 2.4 (Optional) Extract Islamabad region only for faster testing

### [x] 3. Configure GraphHopper
- [x] 3.1 Create `graphhopper/config.yml` configuration file
- [x] 3.2 Configure routing profiles (car, bike, foot)
- [x] 3.3 Set memory limits appropriate for system
- [x] 3.4 Enable CORS for frontend access
- [x] 3.5 Configure alternative routes settings

### [x] 4. Test GraphHopper Server
- [x] 4.1 Start GraphHopper server with config
- [x] 4.2 Wait for graph building to complete
- [x] 4.3 Test health endpoint
- [x] 4.4 Test direct routing API with curl
- [x] 4.5 Verify routes are calculated correctly
- [x] 4.6 Test all travel modes (car, bike, foot)

## Phase 2: Node.js Backend API

### [x] 5. Initialize Node.js Project
- [x] 5.1 Create `backend/` directory
- [x] 5.2 Run `npm init -y`
- [x] 5.3 Install dependencies (express, cors, axios, dotenv)
- [x] 5.4 Install dev dependencies (typescript, ts-node-dev, @types/*)
- [x] 5.5 Create `tsconfig.json`
- [x] 5.6 Set up project structure (src/, config/, types/)

### [x] 6. Implement GraphHopper Service
- [x] 6.1 Create `src/services/graphhopper.ts`
- [x] 6.2 Implement `calculateRoute()` method
- [x] 6.3 Implement `healthCheck()` method
- [x] 6.4 Add request/response transformation logic
- [x] 6.5 Add error handling and retries
- [x] 6.6 Add timeout configuration
- [x] 6.7 Map GraphHopper instructions to app format

### [x] 7. Create API Endpoints
- [x] 7.1 Create `src/routes/routing.ts`
- [x] 7.2 Implement POST `/api/route` endpoint
- [x] 7.3 Implement GET `/api/health` endpoint
- [x] 7.4 Add request validation
- [x] 7.5 Add error handling middleware
- [x] 7.6 Add CORS middleware

### [x] 8. Set Up Main Server
- [x] 8.1 Create `src/index.ts`
- [x] 8.2 Configure Express app
- [x] 8.3 Register routes and middleware
- [x] 8.4 Add environment variable support
- [x] 8.5 Add startup logging
- [x] 8.6 Add graceful shutdown handling

### [x] 9. Test Backend API
- [x] 9.1 Start Node.js server
- [x] 9.2 Test health endpoint with curl
- [x] 9.3 Test route calculation with Postman
- [x] 9.4 Verify response format matches design
- [x] 9.5 Test error cases (invalid coordinates, etc.)
- [x] 9.6 Test all travel modes
- [x] 9.7 Test alternative routes generation

## Phase 3: Frontend Integration

### [x] 10. Update Environment Configuration
- [x] 10.1 Add `VITE_ROUTING_API_URL` to `.env.local` (not needed - hardcoded)
- [x] 10.2 Add `VITE_USE_LOCAL_ROUTING` flag (not needed - auto-detect)
- [x] 10.3 Update `.env.example` with new variables (not needed)
- [x] 10.4 Document environment variables in README

### [x] 11. Create API Client Service
- [x] 11.1 Create `src/lib/routing-api.ts`
- [x] 11.2 Implement route calculation function
- [x] 11.3 Add error handling and retries
- [x] 11.4 Add TypeScript types for requests/responses
- [x] 11.5 Add timeout configuration

### [x] 12. Update useRouteAlternatives Hook
- [x] 12.1 Import new API client
- [x] 12.2 Add conditional logic for local vs remote API
- [x] 12.3 Update error handling for local API
- [x] 12.4 Ensure response format compatibility
- [x] 12.5 Add fallback to OpenRouteService if local fails
- [x] 12.6 Update loading states

### [x] 13. Test Frontend Integration
- [x] 13.1 Start all services (GraphHopper, Backend, Frontend)
- [x] 13.2 Test route calculation in UI
- [x] 13.3 Verify routes display correctly on map
- [x] 13.4 Test all travel modes
- [x] 13.5 Test alternative routes selection
- [x] 13.6 Test error scenarios
- [x] 13.7 Verify turn-by-turn instructions
- [x] 13.8 Test voice navigation

## Phase 4: Documentation & Deployment

### [x] 14. Create Documentation
- [x] 14.1 Write setup instructions in README
- [x] 14.2 Document API endpoints
- [x] 14.3 Create troubleshooting guide
- [x] 14.4 Document environment variables
- [x] 14.5 Add architecture diagram
- [x] 14.6 Document known limitations

### [x] 15. Add Development Scripts
- [x] 15.1 Create start script for GraphHopper
- [x] 15.2 Create start script for backend
- [x] 15.3 Create combined start script (all services)
- [x] 15.4 Add to package.json scripts (not needed - batch files)
- [x] 15.5 Test scripts on clean environment

### [ ] 16. Optimize Performance
- [ ] 16.1 Enable GraphHopper Contraction Hierarchies
- [ ] 16.2 Tune JVM memory settings
- [ ] 16.3 Add response caching in backend
- [ ] 16.4 Optimize frontend API calls
- [ ] 16.5 Measure and document response times

### [ ] 17. Add Monitoring & Logging
- [ ] 17.1 Add Winston logger to backend
- [ ] 17.2 Log all route requests
- [ ] 17.3 Log errors with stack traces
- [ ] 17.4 Add performance metrics logging
- [ ] 17.5 Create log rotation policy

## Phase 5: Testing & Validation

### [ ] 18. Manual Testing
- [ ] 18.1 Test routes within Islamabad
- [ ] 18.2 Test routes to edge of data coverage
- [ ] 18.3 Test invalid coordinates
- [ ] 18.4 Test very long routes
- [ ] 18.5 Test routes with no solution
- [ ] 18.6 Compare results with Google Maps
- [ ] 18.7 Verify distance and duration accuracy

### [ ] 19. Property-Based Testing
- [ ] 19.1 Write test for route validity property
- [ ] 19.2 Write test for distance consistency
- [ ] 19.3 Write test for duration consistency
- [ ] 19.4 Write test for alternative routes
- [ ] 19.5 Write test for API response format
- [ ] 19.6 Run all property tests
- [ ] 19.7 Fix any failures

### [ ] 20. Integration Testing
- [ ] 20.1 Test full flow: Frontend → Backend → GraphHopper
- [ ] 20.2 Test error propagation
- [ ] 20.3 Test timeout scenarios
- [ ] 20.4 Test concurrent requests
- [ ] 20.5 Test service restart scenarios

## Phase 6: Production Preparation (Optional)

### [ ] 21. Prepare for Deployment
- [ ] 21.1 Create Docker container for GraphHopper
- [ ] 21.2 Create Docker container for backend
- [ ] 21.3 Create docker-compose.yml
- [ ] 21.4 Test Docker deployment locally
- [ ] 21.5 Document deployment process

### [ ] 22. Security Hardening
- [ ] 22.1 Add rate limiting to API
- [ ] 22.2 Add input sanitization
- [ ] 22.3 Add API key authentication (optional)
- [ ] 22.4 Configure CORS for production domain
- [ ] 22.5 Add HTTPS support

### [ ] 23. Production Deployment
- [ ] 23.1 Choose hosting provider (Hetzner/DigitalOcean)
- [ ] 23.2 Set up VPS
- [ ] 23.3 Deploy GraphHopper
- [ ] 23.4 Deploy backend API
- [ ] 23.5 Configure Nginx reverse proxy
- [ ] 23.6 Set up SSL certificates
- [ ] 23.7 Configure PM2 for process management
- [ ] 23.8 Update frontend to use production API

## Notes

### Priority Levels
- **High Priority:** Tasks 1-13 (Core functionality)
- **Medium Priority:** Tasks 14-20 (Polish & testing)
- **Low Priority:** Tasks 21-23 (Production deployment)

### Estimated Time
- Phase 1: 2-4 hours
- Phase 2: 4-6 hours
- Phase 3: 2-3 hours
- Phase 4: 2-3 hours
- Phase 5: 3-4 hours
- Phase 6: 4-8 hours (optional)

**Total: 17-28 hours for core functionality (Phases 1-5)**

### Dependencies
- Java 11+ must be installed before starting
- Node.js 18+ must be installed
- Sufficient disk space (~500 MB for Pakistan data + graph)
- Sufficient RAM (2GB minimum recommended)

### Blockers
- If GraphHopper fails to build graph, may need to use smaller OSM extract
- If Java version issues, may need to use Docker instead
- If OSM data quality is poor, may need to use alternative data source

### Success Criteria
- ✅ All services running without errors
- ✅ Routes calculated successfully
- ✅ Response time < 2 seconds
- ✅ Frontend fully integrated
- ✅ All travel modes working
- ✅ Documentation complete
