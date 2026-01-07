import { motion } from "framer-motion";
import { useState } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Navigation, 
  MapPin, 
  Crosshair,
  Maximize2
} from "lucide-react";
import heroImage from "@/assets/pakistan-satellite-hero.jpg";

const MapDemo = () => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState<"satellite" | "terrain" | "roads">("satellite");

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.6));

  const markers = [
    { id: 1, name: "Islamabad", x: 52, y: 28, type: "capital" },
    { id: 2, name: "Lahore", x: 45, y: 42, type: "city" },
    { id: 3, name: "Karachi", x: 72, y: 72, type: "city" },
    { id: 4, name: "Peshawar", x: 38, y: 25, type: "city" },
    { id: 5, name: "Quetta", x: 25, y: 55, type: "city" },
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Interactive Demo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
            Experience the Map Platform
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A preview of our tile-based architecture with smooth pan, zoom, and layer controls. 
            Built for scalability and performance.
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card max-w-5xl mx-auto"
        >
          {/* Map Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-deep border-b border-border/20">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-gold" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <span className="text-primary-foreground/80 text-sm font-medium">NPMI Map Viewer v1.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary-foreground/50">Zoom: {Math.round(zoomLevel * 100)}%</span>
              <Crosshair className="w-4 h-4 text-primary-foreground/50" />
            </div>
          </div>

          {/* Map Content */}
          <div className="relative h-[500px] overflow-hidden cursor-grab active:cursor-grabbing">
            {/* Map Image */}
            <motion.div
              className="absolute inset-0 origin-center"
              animate={{ scale: zoomLevel }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <img
                src={heroImage}
                alt="Pakistan Map"
                className={`w-full h-full object-cover transition-all duration-500 ${
                  activeLayer === "terrain" ? "saturate-50 contrast-125" :
                  activeLayer === "roads" ? "brightness-110 saturate-50" : ""
                }`}
              />

              {/* Grid Overlay for Roads layer */}
              {activeLayer === "roads" && (
                <div className="absolute inset-0 map-grid opacity-50" />
              )}

              {/* Map Markers */}
              {markers.map((marker) => (
                <motion.div
                  key={marker.id}
                  className="absolute group"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + marker.id * 0.1 }}
                >
                  <div className="relative">
                    {/* Pulse Ring */}
                    <div className={`absolute inset-0 -m-2 rounded-full animate-pulse-ring ${
                      marker.type === "capital" ? "bg-gold" : "bg-primary"
                    }`} />
                    
                    {/* Marker */}
                    <MapPin 
                      className={`w-6 h-6 drop-shadow-lg transform -translate-x-1/2 -translate-y-full ${
                        marker.type === "capital" ? "text-gold" : "text-primary"
                      }`}
                      fill={marker.type === "capital" ? "currentColor" : "none"}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="glass-card px-3 py-1.5 rounded-lg whitespace-nowrap">
                        <span className="text-xs font-medium text-foreground">{marker.name}</span>
                        {marker.type === "capital" && (
                          <span className="ml-1 text-xs text-gold">★</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Zoom Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 glass-card rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 glass-card rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button className="p-2 glass-card rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Layer Controls */}
            <div className="absolute left-4 top-4">
              <div className="glass-card rounded-lg p-1 flex flex-col gap-1">
                {(["satellite", "terrain", "roads"] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      activeLayer === layer
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {layer.charAt(0).toUpperCase() + layer.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2">
              <button className="p-2 glass-card rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                <Navigation className="w-5 h-5" />
              </button>
              <button className="p-2 glass-card rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                <Layers className="w-5 h-5" />
              </button>
            </div>

            {/* Scale Bar */}
            <div className="absolute right-4 bottom-4 glass-card rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-foreground/50 rounded relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-foreground/50" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-foreground/50" />
                </div>
                <span className="text-xs text-muted-foreground">100 km</span>
              </div>
            </div>

            {/* Coordinates Display */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card rounded-lg px-4 py-2">
              <span className="text-xs text-muted-foreground font-mono">
                30.3753° N, 69.3451° E
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MapDemo;
