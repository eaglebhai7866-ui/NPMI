# Map Viewer Application

A full-screen interactive map application built with React, TypeScript, and MapLibre GL JS.

## Features

- **Interactive Map**: Full-screen map with zoom, pan, and rotation controls
- **Routing & Navigation**: Real-time route calculation with turn-by-turn directions
- **Search**: Location search with autocomplete
- **Multiple Map Styles**: Switch between different map themes (Streets, Satellite, Terrain, etc.)
- **Traffic Layer**: Real-time traffic information overlay
- **Points of Interest (POI)**: Display various POI categories
- **Measurement Tools**: Distance and area measurement
- **Elevation Profile**: View elevation changes along routes
- **Weather Overlay**: Weather information along routes
- **Geolocation**: Find your current location
- **Fullscreen Mode**: Immersive map experience

## Tech Stack

- **React 18** with TypeScript
- **MapLibre GL JS** for map rendering
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Sonner** for toast notifications
- **Vite** for fast development and building

## Getting Started

### Frontend Only (OSRM Routing)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

### With Local Routing (GraphHopper)

For faster, offline routing with Pakistan OSM data:

#### Quick Start (All Services)
```bash
startup.bat
```

This starts GraphHopper, Backend API, and Frontend automatically!

#### Manual Setup

1. **Start all services**:
   ```bash
   start-services.bat
   ```

   Or manually:
   ```bash
   # Terminal 1: Start GraphHopper
   cd graphhopper
   start-graphhopper.bat

   # Terminal 2: Start Backend API
   cd backend
   npm run dev

   # Terminal 3: Start Frontend
   npm run dev
   ```

2. **See detailed guide**: [LOCAL_ROUTING_GUIDE.md](LOCAL_ROUTING_GUIDE.md)

## Map Controls

- **Zoom**: Use mouse wheel or zoom buttons
- **Pan**: Click and drag to move around
- **Rotate**: Right-click and drag or use compass control
- **Search**: Use the search bar to find locations
- **Route**: Click the route button and select start/end points
- **Layers**: Toggle different map styles and overlays
- **POI**: Show/hide points of interest
- **Measure**: Measure distances and areas
- **Location**: Find your current position

## Map Data Sources

- **Base Maps**: OpenStreetMap contributors, CARTO Basemaps
- **Routing**: 
  - Local: GraphHopper with Pakistan OSM data (when available)
  - Fallback: OSRM (Open Source Routing Machine)
- **Elevation**: Open-Meteo API
- **Weather**: Open-Meteo API
- **Geocoding**: Nominatim (OpenStreetMap)

## Project Structure

```
pakistan-secure-hub/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   └── map/                  # Map-related components
│   │       └── hooks/            # Custom hooks (routing, POI, etc.)
│   └── lib/                      # Utilities
│       └── routing-api.ts        # Local routing API client
├── backend/                      # Node.js routing backend
│   └── src/
│       ├── routes/               # API endpoints
│       └── services/             # GraphHopper service
├── graphhopper/                  # GraphHopper routing engine
│   ├── config.yml                # GraphHopper configuration
│   ├── data/                     # OSM data files
│   └── start-graphhopper.bat     # Start script
├── LOCAL_ROUTING_GUIDE.md        # Local routing setup guide
└── start-services.bat            # Start all services

## License

This project is open source and available under the MIT License.