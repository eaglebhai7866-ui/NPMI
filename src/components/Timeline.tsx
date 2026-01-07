import { motion } from "framer-motion";
import { 
  Rocket, 
  Map, 
  Users, 
  Sparkles, 
  CheckCircle2,
  Circle
} from "lucide-react";

const phases = [
  {
    id: "poc",
    title: "PoC Development",
    quarter: "Q1 2026",
    status: "current",
    icon: Rocket,
    color: "primary",
    description: "Scalable, web-based mapping platform with tile-based architecture",
    features: [
      "Web-based map viewer",
      "Zoom, pan, smooth tile loading",
      "Satellite imagery display",
      "Backend tile server (XYZ)",
    ],
    team: ["Frontend", "Backend", "GIS", "DevOps"],
  },
  {
    id: "alpha",
    title: "Alpha Release",
    quarter: "Q2 2026",
    status: "upcoming",
    icon: Map,
    color: "sky",
    description: "Interactive, location-aware mapping with navigation support",
    features: [
      "My Location (GPS)",
      "Basic navigation & routing",
      "Mobile-first UI",
      "Ground-level imagery",
    ],
    team: ["Frontend", "Mobile", "GIS", "AI", "Backend"],
  },
  {
    id: "beta",
    title: "Beta Release",
    quarter: "Q3 2026",
    status: "upcoming",
    icon: Users,
    color: "gold",
    description: "Crowdsourced data, offline access, and traffic awareness",
    features: [
      "User contributions & edits",
      "Offline map access",
      "Business/POI management",
      "Live traffic detection",
    ],
    team: ["Backend", "GIS", "Traffic", "Mobile"],
  },
  {
    id: "production",
    title: "Production Release",
    quarter: "Q4 2027",
    status: "upcoming",
    icon: Sparkles,
    color: "primary",
    description: "Fully reliable, intelligent multimodal navigation platform",
    features: [
      "Multimodal routing",
      "Voice navigation",
      "Real-time traffic & incidents",
      "Global map consistency",
    ],
    team: ["Backend", "AI", "GIS", "Data", "DevOps"],
  },
];

const Timeline = () => {
  return (
    <section className="py-20 bg-background" id="roadmap">
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
            Development Roadmap
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Project Phases
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A phased approach to building Pakistan's comprehensive mapping platform, 
            from proof of concept to full production.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-sky to-gold" />

          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-start gap-8 mb-12 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Timeline Node */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-${phase.color === 'primary' ? 'primary' : phase.color} flex items-center justify-center shadow-lg ${
                    phase.status === "current" ? "ring-4 ring-primary/30 animate-pulse-slow" : ""
                  }`}>
                    <Icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>

                {/* Content Card */}
                <div className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${isLeft ? "md:pr-8" : "md:pl-8"}`}>
                  <div className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-border">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          phase.status === "current" 
                            ? "bg-primary/20 text-primary" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {phase.quarter}
                        </span>
                      </div>
                      {phase.status === "current" && (
                        <span className="flex items-center gap-1 text-xs font-medium text-primary">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          In Progress
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{phase.description}</p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {phase.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {phase.status === "current" ? (
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-foreground/80">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Team Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {phase.team.map((member, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Timeline;
