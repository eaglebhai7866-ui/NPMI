import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Menu, X } from "lucide-react";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Roadmap", href: "#roadmap" },
  { name: "Technology", href: "#technology" },
  { name: "Team", href: "#team" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isScrolled ? "bg-primary" : "bg-white/20 backdrop-blur-sm"} transition-colors`}>
              <MapPin className={`w-5 h-5 ${isScrolled ? "text-primary-foreground" : "text-white"}`} />
            </div>
            <div>
              <span className={`font-bold text-lg ${isScrolled ? "text-foreground" : "text-white"}`}>
                NPMI
              </span>
              <span className={`hidden sm:inline text-xs ml-2 ${isScrolled ? "text-muted-foreground" : "text-white/70"}`}>
                Pakistan
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-white/90 hover:text-white"
                }`}
              >
                {link.name}
              </a>
            ))}
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? "hover:bg-muted" : "hover:bg-white/10"}`}
          >
            {isMobileMenuOpen ? (
              <X className={isScrolled ? "text-foreground" : "text-white"} />
            ) : (
              <Menu className={isScrolled ? "text-foreground" : "text-white"} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-background border-t border-border"
      >
        <nav className="container mx-auto px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground font-medium py-2"
            >
              {link.name}
            </a>
          ))}
          <button className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold mt-2">
            Get Started
          </button>
        </nav>
      </motion.div>
    </motion.header>
  );
};

export default Header;
