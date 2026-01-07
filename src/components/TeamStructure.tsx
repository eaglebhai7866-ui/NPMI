import { motion } from "framer-motion";
import { 
  Code2, 
  Smartphone, 
  Map, 
  Brain, 
  Server, 
  CloudCog,
  Users
} from "lucide-react";

const teams = [
  {
    name: "Frontend Engineers",
    icon: Code2,
    responsibilities: [
      "Web-based map viewer",
      "Zoom, pan, smooth tile loading",
      "Canvas / WebGL rendering",
      "Performance optimization",
    ],
    skills: ["JavaScript/TypeScript", "MapLibre GL JS", "WebGL", "React"],
  },
  {
    name: "Mobile Developers",
    icon: Smartphone,
    responsibilities: [
      "Android app (Kotlin)",
      "GPS integration",
      "Offline tiles",
      "Navigation UI",
    ],
    skills: ["Kotlin", "Location APIs", "Background services", "Map SDKs"],
  },
  {
    name: "GIS Engineers",
    icon: Map,
    responsibilities: [
      "Satellite imagery preprocessing",
      "Geo-referencing & cloud masking",
      "Tile generation",
      "Road graph creation",
    ],
    skills: ["GDAL", "PostGIS", "Python", "Remote sensing"],
  },
  {
    name: "AI Engineers",
    icon: Brain,
    responsibilities: [
      "Traffic prediction models",
      "Image alignment",
      "Voice navigation",
      "NLP integration",
    ],
    skills: ["OpenCV", "TensorFlow", "LLMs", "Python/Scala"],
  },
  {
    name: "Backend Engineers",
    icon: Server,
    responsibilities: [
      "Tile server (XYZ)",
      "Location & routing APIs",
      "Authentication system",
      "Mobile backend",
    ],
    skills: ["Go/FastAPI", "REST/gRPC", "PostGIS", "Kafka"],
  },
  {
    name: "DevOps Engineers",
    icon: CloudCog,
    responsibilities: [
      "Cloud infrastructure",
      "CI/CD pipelines",
      "Scaling & monitoring",
      "24/7 reliability",
    ],
    skills: ["AWS/GCP", "Kubernetes", "Docker", "Terraform"],
  },
];

const TeamStructure = () => {
  return (
    <section className="py-20 bg-background" id="team">
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
            Team Structure
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Expert Teams, Focused Delivery
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A lean, skilled team structure designed to deliver the PoC efficiently 
            and scale as the project evolves.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {teams.map((team, index) => {
            const Icon = team.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-foreground">{team.name}</h3>
                  </div>

                  {/* Responsibilities */}
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Responsibilities
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {team.responsibilities.map((item, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border">
                    {team.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Team Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-muted">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">Small but skilled team</strong> — 
              Perfect for PoC phase, scalable for production
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamStructure;
