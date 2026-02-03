# NPMI Routing Backend

Node.js + Express API that connects to GraphHopper for routing calculations.

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
