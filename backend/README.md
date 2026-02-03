# NPMI Routing Backend

Node.js + Express API that connects to GraphHopper for routing calculations.

## Features

- ✅ REST API for route calculation
- ✅ GraphHopper integration
- ✅ Alternative routes support (up to 3 routes)
- ✅ In-memory response caching (5-minute TTL)
- ✅ Winston logging with file rotation
- ✅ Request/response logging
- ✅ Performance metrics
- ✅ Error handling
- ✅ CORS enabled
- ✅ TypeScript

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

The `.env` file is already configured:
```env
PORT=3001
GRAPHHOPPER_URL=http://localhost:8989
NODE_ENV=development
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "graphhopper": "ready",
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

### Calculate Route
```
POST /api/route
Content-Type: application/json

{
  "start": [73.0479, 33.6844],
  "end": [73.0931, 33.7294],
  "mode": "driving",
  "alternatives": true
}
```

**Parameters:**
- `start`: [lng, lat] - Starting coordinates
- `end`: [lng, lat] - Ending coordinates
- `mode`: "driving" | "cycling" | "walking"
- `alternatives`: boolean (optional, default: true)

**Response:**
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

## Testing

### Test Health Endpoint
```bash
curl http://localhost:3001/api/health
```

### Test Route Calculation
```bash
curl -X POST http://localhost:3001/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "start": [73.0479, 33.6844],
    "end": [73.0931, 33.7294],
    "mode": "driving",
    "alternatives": true
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main server
│   ├── routes/
│   │   └── routing.ts        # API endpoints
│   ├── services/
│   │   └── graphhopper.ts    # GraphHopper client
│   ├── types/
│   │   └── routing.ts        # TypeScript types
│   └── middleware/
│       └── errorHandler.ts   # Error handling
├── package.json
├── tsconfig.json
└── .env
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid parameters)
- `500` - Server error
- `503` - Service unavailable (GraphHopper down)

## Development

The server uses `ts-node-dev` for development, which automatically restarts when you make changes to the code.

## Next Steps

1. ✅ Backend API running
2. ⏳ Integrate with frontend
3. ⏳ Add caching (Redis)
4. ⏳ Add rate limiting
5. ⏳ Deploy to production


### Clear Cache
```
POST /api/cache/clear
```

Clears all cached routes.

Response:
```json
{
  "message": "Cache cleared successfully",
  "timestamp": "2026-02-03T10:00:00.000Z"
}
```

## Caching

The backend implements in-memory caching for route responses:

- **Cache Duration**: 5 minutes (300 seconds)
- **Max Cache Size**: 100 entries
- **Cache Key**: Based on start, end, mode, and alternatives flag
- **Coordinate Precision**: Rounded to 4 decimal places (~11m precision)

### Cache Benefits
- Faster response times for repeated requests
- Reduced load on GraphHopper
- Automatic cleanup of expired entries

### Cache Statistics
Check cache stats via the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Response includes cache stats:
```json
{
  "status": "ok",
  "graphhopper": "ready",
  "cache": {
    "size": 15,
    "maxSize": 100,
    "maxAge": 300000
  },
  "timestamp": "2026-02-03T10:00:00.000Z"
}
```

## Logging

The backend uses Winston for structured logging:

### Log Levels
- `error`: Errors and exceptions
- `warn`: Warnings (e.g., invalid requests)
- `info`: General information (requests, responses)
- `debug`: Detailed debugging information

### Log Files
- `logs/error.log`: Error logs only
- `logs/combined.log`: All logs
- Console: Colored output for development

### Log Rotation
- Max file size: 5MB
- Max files: 5 (rotates automatically)

### Example Logs
```
10:30:15 [info]: Route request received {"start":[73.0479,33.6844],"end":[73.0931,33.7294],"mode":"driving"}
10:30:15 [info]: Cache miss - calculating route
10:30:15 [info]: Calculating route {"start":[73.0479,33.6844],"end":[73.0931,33.7294],"mode":"driving","profile":"car"}
10:30:15 [info]: Route calculated successfully {"routeCount":3,"duration":"245ms"}
10:30:15 [info]: Route cached {"routeCount":3}
10:30:15 [info]: HTTP Request {"method":"POST","path":"/api/route","status":200,"duration":"248ms"}
```

## Performance

### Response Times
- **Cached routes**: < 5ms
- **New routes**: 100-400ms (depending on distance)
- **Alternative routes**: 200-400ms

### Optimization Tips
1. **Enable caching**: Already enabled by default
2. **Use smaller OSM extracts**: Faster graph loading
3. **Adjust JVM memory**: For GraphHopper performance
4. **Monitor logs**: Check `logs/combined.log` for slow requests

## Environment Variables

```env
PORT=3001                                    # API server port
GRAPHHOPPER_URL=http://localhost:8989       # GraphHopper server URL
NODE_ENV=development                         # Environment (development/production)
LOG_LEVEL=info                              # Logging level (error/warn/info/debug)
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── index.ts              # Main server
│   ├── routes/
│   │   └── routing.ts        # API routes
│   ├── services/
│   │   └── graphhopper.ts    # GraphHopper client
│   ├── middleware/
│   │   ├── errorHandler.ts   # Error handling
│   │   └── cache.ts          # Route caching
│   ├── utils/
│   │   └── logger.ts         # Winston logger
│   └── types/
│       └── routing.ts        # TypeScript types
├── logs/                     # Log files (auto-created)
├── package.json
└── tsconfig.json
```

### Adding New Features

1. **Add new endpoint**: Edit `src/routes/routing.ts`
2. **Add new service**: Create file in `src/services/`
3. **Add new middleware**: Create file in `src/middleware/`
4. **Add new types**: Edit `src/types/routing.ts`

### Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Calculate route
curl -X POST http://localhost:3001/api/route \
  -H "Content-Type: application/json" \
  -d '{
    "start": [73.0479, 33.6844],
    "end": [73.0931, 33.7294],
    "mode": "driving",
    "alternatives": true
  }'

# Clear cache
curl -X POST http://localhost:3001/api/cache/clear
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify Node.js version (18+ required)
- Run `npm install` to install dependencies

### GraphHopper connection failed
- Ensure GraphHopper is running on port 8989
- Check `GRAPHHOPPER_URL` in `.env`
- Test GraphHopper: `curl http://localhost:8989/health`

### Routes not caching
- Check logs for cache hits/misses
- Verify coordinates are similar (rounded to 4 decimals)
- Clear cache: `curl -X POST http://localhost:3001/api/cache/clear`

### Logs not appearing
- Check `logs/` directory exists (auto-created)
- Verify `LOG_LEVEL` in `.env`
- Check file permissions

## Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
NODE_ENV=production npm start
```

### Recommended Setup
- Use PM2 for process management
- Set up Nginx reverse proxy
- Enable HTTPS
- Configure log rotation
- Set up monitoring (e.g., Prometheus)
- Add rate limiting

## License

MIT
