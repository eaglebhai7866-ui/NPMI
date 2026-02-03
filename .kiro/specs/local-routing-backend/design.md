# Local Routing Backend - Design Document

## Architecture Overview

```
┌─────────────────┐
│  React Frontend │
│   (MapViewer)   │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│   Node.js API   │
│   (Express)     │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  GraphHopper    │
│   Server        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   OSM Data      │
│ (Islamabad.pbf) │
└─────────────────┘
```

## Technology Stack

### Routing Engine: GraphHopper
**Why GraphHopper?**
- Open-source and free
- Excellent OSM support
- Fast routing performance
- Built-in support for alternatives
- Active community
- Good documentation
- Java-based (mature, stable)

**Alternative Considered: OSRM**
- Pros: Faster, C++ based
- Cons: Harder to customize, less flexible for traffic integration
- Decision: Start with GraphHopper, can switch later if needed

### API Server: Node.js + Express
**Why Node.js?**
- Same language as frontend (TypeScript/JavaScript)
- Fast development
- Good for I/O operations
- Easy to deploy
- Large ecosystem

### Data Format: OSM PBF
**Why PBF?**
- Compact binary format
- Fast to parse
- Standard for OSM data
- Supported by all routing engines

## Data Preparation

### Option 1: Use Existing Islamabad Data
Your `NPMI Vector/` folder contains:
- `isb_roads.shp` - Road network
- `isb_points_updated.shp` - POIs

**Conversion Process:**
```
Shapefile → GeoJSON → OSM XML → OSM PBF
```

**Tools:**
- QGIS for Shapefile → GeoJSON
- `osmconvert` for format conversion
- `osmosis` for filtering/processing

### Option 2: Download OSM Data (Recommended)
**Source:** Geofabrik
**URL:** https://download.geofabrik.de/asia/pakistan.html

**Files Available:**
- `pakistan-latest.osm.pbf` (~150 MB)
- `islamabad-latest.osm.pbf` (if available, ~5-10 MB)

**Advantages:**
- Already in correct format
- Includes all road attributes
- Regularly updated
- Community-maintained

**Recommendation:** Use Option 2 for Phase 1, integrate your custom data in Phase 2

## GraphHopper Setup

### Installation Methods

#### Method 1: Download JAR (Recommended for Development)
```bash
# Download GraphHopper
wget https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/8.0/graphhopper-web-8.0.jar

# Download OSM data
wget https://download.geofabrik.de/asia/pakistan-latest.osm.pbf

# Run GraphHopper
java -Xmx2g -jar graphhopper-web-8.0.jar server config.yml
```

#### Method 2: Docker (Recommended for Production)
```bash
docker run -p 8989:8989 \
  -v $(pwd)/data:/data \
  graphhopper/graphhopper:latest \
  --input /data/pakistan-latest.osm.pbf
```

#### Method 3: Build from Source
```bash
git clone https://github.com/graphhopper/graphhopper.git
cd graphhopper
./graphhopper.sh web pakistan-latest.osm.pbf
```

### Configuration File (config.yml)

```yaml
graphhopper:
  # OSM data file
  datareader.file: pakistan-latest.osm.pbf
  
  # Where to store the graph
  graph.location: ./graph-cache
  
  # Routing profiles
  profiles:
    - name: car
      vehicle: car
      weighting: fastest
      turn_costs: true
    
    - name: bike
      vehicle: bike
      weighting: fastest
    
    - name: foot
      vehicle: foot
      weighting: shortest
  
  # Enable alternative routes
  routing.ch.disabling_allowed: true
  routing.max_visited_nodes: 1000000
  
  # Server settings
  server:
    application_connectors:
      - type: http
        port: 8989
        bind_host: localhost

# Enable CORS for frontend
cors:
  allowed_origins: "*"
  allowed_methods: "GET,POST,PUT,DELETE,OPTIONS"
```

### Memory Configuration

**For Islamabad only:**
- Minimum: 512 MB (`-Xmx512m`)
- Recommended: 1 GB (`-Xmx1g`)

**For all Pakistan:**
- Minimum: 1 GB (`-Xmx1g`)
- Recommended: 2 GB (`-Xmx2g`)

## Node.js API Server

### Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   └── routing.ts        # Routing endpoints
│   ├── services/
│   │   └── graphhopper.ts    # GraphHopper client
│   ├── middleware/
│   │   ├── cors.ts           # CORS configuration
│   │   └── errorHandler.ts  # Error handling
│   └── types/
│       └── routing.ts        # TypeScript types
├── config/
│   └── default.json          # Configuration
├── package.json
├── tsconfig.json
└── .env
```

### API Implementation

#### 1. GraphHopper Service (`services/graphhopper.ts`)

```typescript
import axios from 'axios';

interface RouteRequest {
  start: [number, number];
  end: [number, number];
  mode: 'driving' | 'cycling' | 'walking';
  alternatives?: boolean;
}

interface GraphHopperResponse {
  paths: Array<{
    distance: number;
    time: number;
    points: {
      type: string;
      coordinates: number[][];
    };
    instructions: Array<{
      text: string;
      distance: number;
      time: number;
      sign: number;
    }>;
  }>;
}

class GraphHopperService {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:8989') {
    this.baseUrl = baseUrl;
  }
  
  async calculateRoute(request: RouteRequest) {
    const profile = this.getProfile(request.mode);
    
    const params = {
      point: [
        `${request.start[1]},${request.start[0]}`,
        `${request.end[1]},${request.end[0]}`
      ],
      profile,
      locale: 'en',
      instructions: true,
      calc_points: true,
      points_encoded: false,
      alternative_route: {
        max_paths: request.alternatives ? 3 : 1,
        max_weight_factor: 1.4,
        max_share_factor: 0.6
      }
    };
    
    const response = await axios.get<GraphHopperResponse>(
      `${this.baseUrl}/route`,
      { params, timeout: 30000 }
    );
    
    return this.transformResponse(response.data);
  }
  
  private getProfile(mode: string): string {
    const profileMap = {
      driving: 'car',
      cycling: 'bike',
      walking: 'foot'
    };
    return profileMap[mode] || 'car';
  }
  
  private transformResponse(data: GraphHopperResponse) {
    return data.paths.map(path => ({
      distance: path.distance,
      duration: path.time / 1000, // Convert ms to seconds
      geometry: {
        type: 'LineString',
        coordinates: path.points.coordinates
      },
      steps: path.instructions.map(instruction => ({
        instruction: instruction.text,
        distance: instruction.distance,
        duration: instruction.time / 1000,
        maneuver: {
          type: this.getManeuverType(instruction.sign),
          location: [0, 0] // Will be filled from geometry
        },
        name: ''
      }))
    }));
  }
  
  private getManeuverType(sign: number): string {
    // GraphHopper sign codes
    const signMap: Record<number, string> = {
      0: 'continue',
      1: 'turn',
      2: 'turn',
      3: 'turn',
      4: 'arrive',
      5: 'depart',
      6: 'roundabout',
      7: 'roundabout'
    };
    return signMap[sign] || 'continue';
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default GraphHopperService;
```

#### 2. Routing Endpoints (`routes/routing.ts`)

```typescript
import { Router } from 'express';
import GraphHopperService from '../services/graphhopper';

const router = Router();
const graphhopper = new GraphHopperService();

router.post('/route', async (req, res, next) => {
  try {
    const { start, end, mode, alternatives } = req.body;
    
    // Validation
    if (!start || !end || !Array.isArray(start) || !Array.isArray(end)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'start and end must be [lng, lat] arrays'
      });
    }
    
    if (!['driving', 'cycling', 'walking'].includes(mode)) {
      return res.status(400).json({
        error: 'Invalid mode',
        message: 'mode must be driving, cycling, or walking'
      });
    }
    
    const routes = await graphhopper.calculateRoute({
      start,
      end,
      mode,
      alternatives: alternatives ?? true
    });
    
    res.json({ routes });
  } catch (error) {
    next(error);
  }
});

router.get('/health', async (req, res) => {
  const isHealthy = await graphhopper.healthCheck();
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    graphhopper: isHealthy ? 'ready' : 'unavailable'
  });
});

export default router;
```

#### 3. Main Server (`index.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import routingRoutes from './routes/routing';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routingRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Routing API server running on http://localhost:${PORT}`);
  console.log(`📍 GraphHopper: http://localhost:8989`);
});
```

### Environment Variables (`.env`)

```env
PORT=3001
GRAPHHOPPER_URL=http://localhost:8989
NODE_ENV=development
```

### Package.json

```json
{
  "name": "npmi-routing-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0"
  }
}
```

## Frontend Integration

### Update Environment Variables

```env
# .env.local
VITE_ROUTING_API_URL=http://localhost:3001/api
VITE_USE_LOCAL_ROUTING=true
```

### Update `useRouteAlternatives.ts`

```typescript
const API_URL = import.meta.env.VITE_ROUTING_API_URL || 'http://localhost:3001/api';
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_ROUTING === 'true';

const calculateRoute = async (start: RoutePoint, end: RoutePoint) => {
  if (USE_LOCAL) {
    // Use local API
    const response = await fetch(`${API_URL}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: start.lngLat,
        end: end.lngLat,
        mode: travelMode,
        alternatives: true
      })
    });
    
    const data = await response.json();
    return data.routes;
  } else {
    // Fallback to OpenRouteService
    // ... existing code
  }
};
```

## Deployment Strategy

### Development
1. Run GraphHopper locally
2. Run Node.js API locally
3. Frontend connects to localhost:3001

### Production (Future)
1. Deploy GraphHopper to VPS (Hetzner/DigitalOcean)
2. Deploy Node.js API to same VPS
3. Use Nginx as reverse proxy
4. Enable HTTPS with Let's Encrypt
5. Use PM2 for process management

## Testing Strategy

### Manual Testing
1. Start GraphHopper server
2. Test health endpoint: `curl http://localhost:8989/health`
3. Test direct routing: `curl "http://localhost:8989/route?point=33.6844,73.0479&point=33.7294,73.0931&profile=car"`
4. Start Node.js API
5. Test API health: `curl http://localhost:3001/api/health`
6. Test routing: Use Postman or frontend

### Automated Testing (Future)
- Unit tests for API endpoints
- Integration tests for GraphHopper communication
- End-to-end tests for frontend integration

## Performance Optimization

### GraphHopper
- Use Contraction Hierarchies (CH) for faster routing
- Enable memory mapping for large datasets
- Tune JVM garbage collection

### Node.js API
- Add response caching (Redis)
- Implement request queuing
- Add rate limiting

### Frontend
- Cache common routes
- Debounce route requests
- Show loading states

## Monitoring & Logging

### Logs to Track
- Route calculation time
- Error rates
- GraphHopper health status
- API response times

### Tools (Future)
- Winston for logging
- Prometheus for metrics
- Grafana for visualization

## Security Considerations

### Current (Development)
- CORS enabled for localhost
- No authentication required

### Future (Production)
- API key authentication
- Rate limiting per IP
- HTTPS only
- Input validation
- SQL injection prevention (when DB added)

## Correctness Properties

### Property 1: Route Validity
**For all valid start and end points within Islamabad:**
- The system must return at least one valid route
- Route geometry must be a valid LineString
- All coordinates must be within Pakistan bounds

### Property 2: Distance Consistency
**For any calculated route:**
- Reported distance must match actual geometry length (±5%)
- Distance must be > 0
- Distance must be < 1000 km (sanity check)

### Property 3: Duration Consistency
**For any calculated route:**
- Duration must be > 0
- Duration must be proportional to distance
- Duration must be < 24 hours (sanity check)

### Property 4: Alternative Routes
**When alternatives are requested:**
- All alternatives must have different geometries
- Alternatives must be sorted by duration (fastest first)
- Number of alternatives must be ≤ requested maximum

### Property 5: API Response Format
**For all successful requests:**
- Response must match defined TypeScript interface
- All required fields must be present
- Geometry must be valid GeoJSON

## Success Criteria

✅ **Phase 1 Complete When:**
1. GraphHopper server runs successfully
2. Routes calculated for Islamabad
3. Node.js API responds correctly
4. Frontend integrated and working
5. Response time < 2 seconds
6. All travel modes functional
7. Documentation complete

## Future Enhancements

### Phase 2: Traffic Integration
- Collect GPS data from users
- Calculate live speeds per road segment
- Adjust routing costs based on traffic
- Predict congestion

### Phase 3: Community Reports
- Add report submission API
- Store reports in database
- Affect routing based on reports
- Display reports on map

### Phase 4: Advanced Features
- Multi-stop routing
- Route optimization
- Time-based routing (avoid rush hour)
- Truck routing (height/weight restrictions)
- Avoid tolls/highways options
