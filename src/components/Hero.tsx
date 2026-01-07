import { motion } from "framer-motion";
import { MapPin, Navigation, Layers, Globe } from "lucide-react";
import heroImage from "@/assets/pakistan-satellite-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Pakistan Satellite View"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/95 via-navy-deep/80 to-navy-deep/95" />
      </div>

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 map-grid opacity-30" />

      {/* Floating Map Markers */}
      <motion.div
        className="absolute top-1/4 left-1/4 hidden lg:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary rounded-full animate-pulse-ring" />
          <MapPin className="w-8 h-8 text-primary drop-shadow-lg" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-1/3 hidden lg:block"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gold rounded-full animate-pulse-ring" />
          <MapPin className="w-6 h-6 text-gold drop-shadow-lg" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 left-1/3 hidden lg:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-sky rounded-full animate-pulse-ring" />
          <MapPin className="w-7 h-7 text-sky drop-shadow-lg" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Government Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-sm mb-8"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary-foreground/90">
            Government of Pakistan Initiative
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
        >
          National Public
          <span className="block text-gradient">Mapping Initiative</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-12"
        >
          Building Pakistan's sovereign, scalable mapping platform with satellite imagery, 
          real-time navigation, and location-based services for the nation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="group px-8 py-4 bg-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
            <Navigation className="w-5 h-5 transition-transform group-hover:rotate-45" />
            Explore Platform
          </button>
          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
            <Layers className="w-5 h-5" />
            View Documentation
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: "881K", label: "Sq. Kilometers" },
            { value: "220M+", label: "Citizens" },
            { value: "4", label: "Provinces" },
            { value: "∞", label: "Possibilities" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20"
            >
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
