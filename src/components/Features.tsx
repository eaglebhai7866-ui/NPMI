import { motion } from "framer-motion";
import { 
  Satellite, 
  Navigation2, 
  MapPin, 
  Layers, 
  Clock, 
  Shield,
  Users2,
  Wifi
} from "lucide-react";

const features = [
  {
    icon: Satellite,
    title: "Satellite Imagery",
    description: "High-resolution satellite coverage of Pakistan with regular updates and time-based versioning.",
  },
  {
    icon: Navigation2,
    title: "Navigation & Routing",
    description: "Turn-by-turn navigation with ETA calculation, distance metrics, and multiple route options.",
  },
  {
    icon: MapPin,
    title: "Points of Interest",
    description: "Comprehensive POI database including businesses, landmarks, and public facilities.",
  },
  {
    icon: Layers,
    title: "Multi-Layer Support",
    description: "Toggle between satellite, terrain, roads, and custom overlay layers seamlessly.",
  },
  {
    icon: Clock,
    title: "Time-Based Views",
    description: "Historical imagery slider to view changes over time for urban planning and analysis.",
  },
  {
    icon: Shield,
    title: "Data Sovereignty",
    description: "All data stored and processed within Pakistan, ensuring national security compliance.",
  },
  {
    icon: Users2,
    title: "Crowdsourced Updates",
    description: "Community-driven map improvements with moderation and validation pipelines.",
  },
  {
    icon: Wifi,
    title: "Offline Access",
    description: "Download maps for offline use in remote areas with limited connectivity.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-muted/50" id="features">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Mapping Capabilities
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From satellite imagery to real-time navigation, building a complete 
            mapping ecosystem for Pakistan's digital future.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
