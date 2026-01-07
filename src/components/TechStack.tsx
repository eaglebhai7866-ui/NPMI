import { motion } from "framer-motion";
import { 
  Server, 
  Database, 
  Cloud, 
  Globe, 
  Cpu, 
  HardDrive,
  Layers,
  Zap
} from "lucide-react";

const techCategories = [
  {
    title: "Cloud & Infrastructure",
    icon: Cloud,
    items: [
      { name: "GCP / AWS", purpose: "Infrastructure hosting" },
      { name: "Kubernetes", purpose: "Auto scaling & orchestration" },
      { name: "Cloud CDN", purpose: "Fast map tiles delivery" },
      { name: "Object Storage", purpose: "Imagery & tiles storage" },
    ],
  },
  {
    title: "Core Backend Servers",
    icon: Server,
    items: [
      { name: "Node.js / Go", purpose: "API Server" },
      { name: "Tegola / TileServer GL", purpose: "Tile Server" },
      { name: "OSRM", purpose: "Routing & Navigation" },
      { name: "Elasticsearch", purpose: "Places Search" },
    ],
  },
  {
    title: "Databases & Storage",
    icon: Database,
    items: [
      { name: "PostgreSQL + PostGIS", purpose: "Spatial Database" },
      { name: "Bigtable / DynamoDB", purpose: "NoSQL for events" },
      { name: "Redis", purpose: "Cache layer" },
      { name: "Kafka", purpose: "Real-time streaming" },
    ],
  },
  {
    title: "Data Sources",
    icon: Globe,
    items: [
      { name: "Survey of Pakistan", purpose: "Authoritative boundaries" },
      { name: "OpenStreetMap", purpose: "Road network base" },
      { name: "GTFS", purpose: "Public transport" },
      { name: "GeoTIFF / DEM", purpose: "Satellite & terrain" },
    ],
  },
];

const TechStack = () => {
  return (
    <section className="py-20 bg-navy-deep text-primary-foreground" id="technology">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Technology Stack
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Scale & Reliability
          </h2>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto">
            Enterprise-grade infrastructure designed for Pakistan's mapping needs, 
            leveraging best-in-class geospatial technologies.
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {techCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full p-6 rounded-2xl bg-navy-light/50 border border-primary-foreground/10 hover:border-primary/50 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">{category.title}</h3>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {category.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-navy-deep/50 hover:bg-primary/10 transition-colors duration-200"
                      >
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-xs text-primary-foreground/50">{item.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Architecture Diagram Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-gradient-to-r from-primary/20 via-sky/20 to-gold/20 border border-primary/20">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="text-sm">Frontend</span>
            </div>
            <Zap className="w-4 h-4 text-sky" />
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-sky" />
              <span className="text-sm">Backend</span>
            </div>
            <Zap className="w-4 h-4 text-gold" />
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gold" />
              <span className="text-sm">Data Layer</span>
            </div>
            <Zap className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <span className="text-sm">Storage</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
