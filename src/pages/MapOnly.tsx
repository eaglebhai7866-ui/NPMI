import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import FullScreenMapViewer from "@/components/FullScreenMapViewer";

const MapOnly = () => {
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Map View - Full Screen */}
      <div className="h-screen w-full">
        <FullScreenMapViewer showDocsButton={true} onDocsClick={() => setShowDocs(true)} />
      </div>

      {/* Simple Documentation Overlay */}
      <AnimatePresence>
        {showDocs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDocs(false)}
              className="fixed top-4 right-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Documentation Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="min-h-screen p-4 md:p-8 pb-20"
            >
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                    Pakistan Secure Hub
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 mb-2">
                    Advanced GIS Mapping & Navigation Platform
                  </p>
                  <p className="text-sm md:text-base text-gray-500">
                    Comprehensive documentation of all system features and capabilities
                  </p>
                </div>

                {/* Main Features Grid */}
                <div className="space-y-6 md:space-y-8 mb-8 md:mb-12">
                  
                  {/* 1. Routing & Navigation */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 md:p-8 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">
                        🧭
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Routing & Navigation</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-blue-900 mb-2">Route Planning</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Multi-point routing:</strong> Add unlimited waypoints to your route</li>
                          <li>• <strong>Vehicle profiles:</strong> Car, bike, and foot routing options</li>
                          <li>• <strong>Alternative routes:</strong> View up to 3 different route options</li>
                          <li>• <strong>Route optimization:</strong> Fastest, shortest, or balanced routes</li>
                          <li>• <strong>Turn-by-turn directions:</strong> Step-by-step navigation instructions</li>
                          <li>• <strong>Distance & time:</strong> Accurate ETA and distance calculations</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-blue-900 mb-2">Advanced Features</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Voice navigation:</strong> Audio turn-by-turn guidance</li>
                          <li>• <strong>Route saving:</strong> Save and load favorite routes</li>
                          <li>• <strong>Drag to modify:</strong> Click and drag waypoints to adjust route</li>
                          <li>• <strong>Reverse route:</strong> Instantly flip start and end points</li>
                          <li>• <strong>Local routing engine:</strong> GraphHopper-powered offline routing</li>
                          <li>• <strong>Route comparison:</strong> Compare multiple alternatives side-by-side</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 2. Weather Integration */}
                  <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl shadow-lg p-6 md:p-8 border border-sky-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center text-2xl">
                        ☁️
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Weather Intelligence</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-sky-900 mb-2">Multi-Source Weather Data</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Dual API integration:</strong> Open-Meteo + OpenWeatherMap</li>
                          <li>• <strong>Adaptive sampling:</strong> 8-12 points based on route length</li>
                          <li>• <strong>Current conditions:</strong> Real-time temperature, humidity, wind</li>
                          <li>• <strong>24-hour forecast:</strong> Hourly weather predictions</li>
                          <li>• <strong>Precipitation data:</strong> Rain/snow amounts in mm</li>
                          <li>• <strong>Confidence scoring:</strong> 0-100% accuracy indicator</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-sky-900 mb-2">Air Quality & Recommendations</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>AQI monitoring:</strong> Air Quality Index tracking</li>
                          <li>• <strong>PM2.5 & PM10:</strong> Particulate matter measurements</li>
                          <li>• <strong>Weather alerts:</strong> Color-coded warnings (green/yellow/red)</li>
                          <li>• <strong>Route recommendations:</strong> AI-powered travel suggestions</li>
                          <li>• <strong>Visibility data:</strong> Fog and visibility conditions</li>
                          <li>• <strong>Manual refresh:</strong> Update weather data on demand</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 3. Measurement Tools */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 md:p-8 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-2xl">
                        📏
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Measurement Tools</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-purple-900 mb-2">Distance Measurement</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Line segments:</strong> Click points to measure distances</li>
                          <li>• <strong>Segment analysis:</strong> Individual segment lengths displayed</li>
                          <li>• <strong>Total distance:</strong> Cumulative distance calculation</li>
                          <li>• <strong>Draggable points:</strong> Move markers to adjust measurements</li>
                          <li>• <strong>Point deletion:</strong> Remove individual points from map or list</li>
                          <li>• <strong>Visual labels:</strong> Purple distance labels at segment midpoints</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-purple-900 mb-2">Area Measurement</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Polygon drawing:</strong> Click 3+ points to create polygons</li>
                          <li>• <strong>Side measurements:</strong> Length of each polygon side</li>
                          <li>• <strong>Total area:</strong> Area in m² and km²</li>
                          <li>• <strong>Visual fill:</strong> Semi-transparent polygon overlay</li>
                          <li>• <strong>Edit mode:</strong> Drag corners to reshape polygon</li>
                          <li>• <strong>Separate modes:</strong> Independent distance and area tools</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 4. Map Layers & Visualization */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 md:p-8 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl">
                        🗺️
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Map Layers & Visualization</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-green-900 mb-2">Base Maps</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Street map:</strong> Detailed road network and labels</li>
                          <li>• <strong>Satellite imagery:</strong> High-resolution aerial photos</li>
                          <li>• <strong>Terrain view:</strong> Topographic elevation visualization</li>
                          <li>• <strong>Dark mode:</strong> Night-friendly map styling</li>
                          <li>• <strong>Hybrid mode:</strong> Satellite with street labels</li>
                          <li>• <strong>Custom styles:</strong> Multiple MapTiler themes</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-green-900 mb-2">Overlay Layers</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Traffic layer:</strong> Real-time traffic conditions</li>
                          <li>• <strong>POI markers:</strong> Points of interest display</li>
                          <li>• <strong>Custom shapefiles:</strong> Import GIS vector data</li>
                          <li>• <strong>Raster overlays:</strong> GeoTIFF and imagery support</li>
                          <li>• <strong>Layer opacity:</strong> Adjustable transparency controls</li>
                          <li>• <strong>Toggle visibility:</strong> Show/hide individual layers</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 5. Elevation & Terrain Analysis */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 md:p-8 border border-orange-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-2xl">
                        ⛰️
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Elevation & Terrain Analysis</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-orange-900 mb-2">Elevation Profile</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Interactive chart:</strong> Visual elevation graph along route</li>
                          <li>• <strong>Hover details:</strong> Precise elevation at any point</li>
                          <li>• <strong>Gradient analysis:</strong> Slope percentage calculations</li>
                          <li>• <strong>Climb statistics:</strong> Total ascent and descent</li>
                          <li>• <strong>Highest/lowest points:</strong> Peak and valley identification</li>
                          <li>• <strong>Color coding:</strong> Gradient-based visualization</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-orange-900 mb-2">Terrain Features</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>3D terrain:</strong> Elevation-based map rendering</li>
                          <li>• <strong>Contour lines:</strong> Topographic line display</li>
                          <li>• <strong>Hillshade:</strong> Relief shading for depth perception</li>
                          <li>• <strong>Slope analysis:</strong> Steepness visualization</li>
                          <li>• <strong>Aspect mapping:</strong> Direction of slope faces</li>
                          <li>• <strong>DEM integration:</strong> Digital Elevation Model support</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 6. Search & POI */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg p-6 md:p-8 border border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-2xl">
                        🔍
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Search & Points of Interest</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-red-900 mb-2">Location Search</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Geocoding:</strong> Search by address or place name</li>
                          <li>• <strong>Reverse geocoding:</strong> Click map to get address</li>
                          <li>• <strong>Coordinate search:</strong> Enter lat/long directly</li>
                          <li>• <strong>Auto-complete:</strong> Smart search suggestions</li>
                          <li>• <strong>Recent searches:</strong> Quick access to history</li>
                          <li>• <strong>Fuzzy matching:</strong> Handles typos and variations</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-red-900 mb-2">POI Management</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Category filtering:</strong> Filter by POI type</li>
                          <li>• <strong>Custom markers:</strong> Add your own points</li>
                          <li>• <strong>POI details:</strong> View information and photos</li>
                          <li>• <strong>Nearby search:</strong> Find POIs near location</li>
                          <li>• <strong>Save favorites:</strong> Bookmark important places</li>
                          <li>• <strong>Export POIs:</strong> Download as GeoJSON/KML</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 7. Mobile Experience */}
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl shadow-lg p-6 md:p-8 border border-violet-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-2xl">
                        📱
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Mobile Experience</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-violet-900 mb-2">Touch Interface</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Responsive design:</strong> Optimized for all screen sizes</li>
                          <li>• <strong>Touch gestures:</strong> Pinch to zoom, swipe to pan</li>
                          <li>• <strong>Bottom panels:</strong> Easy thumb-reach controls</li>
                          <li>• <strong>Collapsible UI:</strong> Maximize map viewing area</li>
                          <li>• <strong>Large tap targets:</strong> Finger-friendly buttons</li>
                          <li>• <strong>Horizontal scrolling:</strong> Swipeable content tabs</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-violet-900 mb-2">Mobile Features</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>GPS integration:</strong> Use device location</li>
                          <li>• <strong>Offline maps:</strong> Download for offline use</li>
                          <li>• <strong>Battery optimization:</strong> Efficient rendering</li>
                          <li>• <strong>Portrait/landscape:</strong> Adaptive layouts</li>
                          <li>• <strong>Share location:</strong> Send coordinates via apps</li>
                          <li>• <strong>Quick actions:</strong> Streamlined mobile workflows</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 8. Data & Export */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-lg p-6 md:p-8 border border-teal-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-2xl">
                        💾
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Data Management & Export</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-teal-900 mb-2">Import Capabilities</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Shapefile support:</strong> Import .shp vector data</li>
                          <li>• <strong>GeoJSON:</strong> Load GeoJSON features</li>
                          <li>• <strong>KML/KMZ:</strong> Google Earth file support</li>
                          <li>• <strong>GPX tracks:</strong> Import GPS tracks</li>
                          <li>• <strong>GeoTIFF:</strong> Raster imagery import</li>
                          <li>• <strong>CSV coordinates:</strong> Bulk point import</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-teal-900 mb-2">Export Options</h3>
                        <ul className="space-y-1.5 text-gray-700 text-sm md:text-base">
                          <li>• <strong>Route export:</strong> Save routes as GPX/GeoJSON</li>
                          <li>• <strong>Map screenshots:</strong> Export current view as image</li>
                          <li>• <strong>Measurement data:</strong> Export measurements as CSV</li>
                          <li>• <strong>POI export:</strong> Download POI collections</li>
                          <li>• <strong>Print maps:</strong> Print-optimized layouts</li>
                          <li>• <strong>Share links:</strong> Generate shareable map URLs</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Technical Specifications */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 md:p-8 text-white mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">⚙️ Technical Specifications</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-blue-300">Core Technologies</h3>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• React 18 + TypeScript</li>
                        <li>• MapLibre GL JS</li>
                        <li>• Tailwind CSS</li>
                        <li>• Framer Motion</li>
                        <li>• Vite Build System</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-green-300">Backend Services</h3>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• GraphHopper Routing</li>
                        <li>• Open-Meteo Weather API</li>
                        <li>• OpenWeatherMap API</li>
                        <li>• MapTiler Maps</li>
                        <li>• Node.js Backend</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-purple-300">Data Sources</h3>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• OpenStreetMap</li>
                        <li>• Pakistan OSM Data</li>
                        <li>• SRTM Elevation Data</li>
                        <li>• Custom Shapefiles</li>
                        <li>• Local GIS Database</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-xl">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">🚀 Ready to Explore?</h2>
                  <p className="text-base md:text-lg mb-6 opacity-90">
                    Close this documentation and start using Pakistan's most advanced mapping platform. 
                    Plan routes, analyze terrain, check weather, and measure distances with precision.
                  </p>
                  <button
                    onClick={() => setShowDocs(false)}
                    className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start Exploring Now →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapOnly;